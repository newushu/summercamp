function escapePdfText(input) {
  return String(input || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function utf8Bytes(input) {
  const value = String(input || '')
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value)
  }
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(value, 'utf8'))
  }
  const encoded = unescape(encodeURIComponent(value))
  const bytes = new Uint8Array(encoded.length)
  for (let index = 0; index < encoded.length; index += 1) {
    bytes[index] = encoded.charCodeAt(index)
  }
  return bytes
}

function utf8ByteLength(input) {
  return utf8Bytes(input).length
}

function encodeBase64Utf8(input) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf8').toString('base64')
  }
  const bytes = utf8Bytes(input)
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function wrapText(text, maxChars) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  if (words.length === 0) {
    return ['']
  }
  const lines = []
  let current = words[0]
  for (let index = 1; index < words.length; index += 1) {
    const next = words[index]
    if (`${current} ${next}`.length <= maxChars) {
      current += ` ${next}`
    } else {
      lines.push(current)
      current = next
    }
  }
  lines.push(current)
  return lines
}

function groupSummaryLines(lines) {
  const overview = []
  const campers = []
  const notes = []
  for (const rawLine of Array.isArray(lines) ? lines : []) {
    const line = String(rawLine || '').trim()
    if (!line) continue
    if (
      line.startsWith('Location:') ||
      line.startsWith('Parent/Guardian:') ||
      line.startsWith('Contact:') ||
      line.startsWith('Payment method:')
    ) {
      overview.push(line)
      continue
    }
    if (
      line.startsWith('Grand total:') ||
      line.startsWith('Weekly reminders:') ||
      line.startsWith('Drop-off:') ||
      line.startsWith('Pickup:') ||
      line.startsWith('Weekly rate:') ||
      line.startsWith('Total:') ||
      line.startsWith('Tuition covers')
    ) {
      notes.push(line)
      continue
    }
    campers.push(line)
  }
  return { overview, campers, notes }
}

export function buildPaymentSummaryPdfBase64({
  title = 'Payment Summary',
  campName = 'New England Wushu Summer Camp',
  guardianName = '',
  recipientEmail = '',
  submittedLabel = '',
  reservationDeadlineLabel = '',
  amountDueLabel = '',
  paymentMethods = [],
  summaryLines = [],
}) {
  const pageWidth = 612
  const pageHeight = 792
  const margin = 54
  const contentWidth = pageWidth - margin * 2
  const maxChars = 88
  const grouped = groupSummaryLines(summaryLines)
  const sections = [
    {
      title: 'Invoice Details',
      lines: [
        `Camp: ${campName}`,
        guardianName ? `Guardian: ${guardianName}` : '',
        recipientEmail ? `Recipient: ${recipientEmail}` : '',
        submittedLabel ? `Submitted: ${submittedLabel}` : '',
        reservationDeadlineLabel ? `Reservation deadline: ${reservationDeadlineLabel}` : '',
        amountDueLabel ? `Amount due: ${amountDueLabel}` : '',
      ].filter(Boolean),
    },
    {
      title: 'Payment Methods',
      lines: Array.isArray(paymentMethods) ? paymentMethods : [],
    },
    {
      title: 'Registration Overview',
      lines: grouped.overview,
    },
    {
      title: 'Campers & Selections',
      lines: grouped.campers,
    },
    {
      title: 'Notes',
      lines: grouped.notes,
    },
  ].filter((section) => section.lines.length > 0)

  const pages = []
  let stream = ''
  let cursorY = pageHeight - margin

  function push(command) {
    stream += `${command}\n`
  }

  function drawText(text, x, y, options = {}) {
    const { font = 'F1', fontSize = 11 } = options
    push('BT')
    push(`/${font} ${fontSize} Tf`)
    push(`1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`)
    push(`(${escapePdfText(text)}) Tj`)
    push('ET')
  }

  function drawRect(x, y, width, height, options = {}) {
    const { fillColor = null, strokeColor = [0.85, 0.88, 0.92], lineWidth = 1 } = options
    if (fillColor) {
      push(`${fillColor[0]} ${fillColor[1]} ${fillColor[2]} rg`)
    }
    if (strokeColor) {
      push(`${strokeColor[0]} ${strokeColor[1]} ${strokeColor[2]} RG`)
    }
    push(`${lineWidth} w`)
    push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`)
    push(fillColor ? 'B' : 'S')
  }

  function finishPage() {
    pages.push(stream)
    stream = ''
  }

  function startPage() {
    cursorY = pageHeight - margin
    drawRect(margin, pageHeight - margin - 42, contentWidth, 42, {
      fillColor: [0.945, 0.969, 1],
      strokeColor: [0.78, 0.84, 0.93],
    })
    drawText(title, margin + 14, pageHeight - margin - 26, { font: 'F2', fontSize: 22 })
    cursorY = pageHeight - margin - 62
  }

  function ensureSpace(heightNeeded) {
    if (cursorY - heightNeeded < margin) {
      finishPage()
      startPage()
    }
  }

  function drawWrappedLine(line, options = {}) {
    const { font = 'F1', fontSize = 11, lineHeight = 15, indent = 0 } = options
    const wrapped = wrapText(line, maxChars - Math.round(indent / 4))
    ensureSpace(wrapped.length * lineHeight + 4)
    wrapped.forEach((part) => {
      drawText(part, margin + indent, cursorY, { font, fontSize })
      cursorY -= lineHeight
    })
  }

  function drawSection(section) {
    const estimatedHeight = 30 + section.lines.reduce((sum, line) => sum + wrapText(line, maxChars).length * 15, 0)
    ensureSpace(estimatedHeight)
    drawRect(margin, cursorY - 22, contentWidth, 24, {
      fillColor: [1, 0.98, 0.92],
      strokeColor: [0.98, 0.79, 0.48],
    })
    drawText(section.title, margin + 12, cursorY - 7, { font: 'F2', fontSize: 13 })
    cursorY -= 34
    section.lines.forEach((line) => {
      drawWrappedLine(line, { fontSize: 11, lineHeight: 15, indent: 8 })
    })
    cursorY -= 8
  }

  startPage()
  sections.forEach(drawSection)
  finishPage()

  const objects = ['1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj']
  const pageObjectNumbers = pages.map((_, index) => 3 + index * 2)
  const fontObjectNumber = 3 + pages.length * 2
  const boldFontObjectNumber = fontObjectNumber + 1
  objects.push(
    `2 0 obj << /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pages.length} >> endobj`
  )

  pages.forEach((pageStream, index) => {
    const pageObjectNumber = 3 + index * 2
    const contentObjectNumber = pageObjectNumber + 1
    objects.push(
      `${pageObjectNumber} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjectNumber} 0 R /Resources << /Font << /F1 ${fontObjectNumber} 0 R /F2 ${boldFontObjectNumber} 0 R >> >> >> endobj`
    )
    objects.push(
      `${contentObjectNumber} 0 obj << /Length ${utf8ByteLength(pageStream)} >> stream\n${pageStream}\nendstream endobj`
    )
  })

  objects.push(`${fontObjectNumber} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`)
  objects.push(`${boldFontObjectNumber} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`)

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const object of objects) {
    offsets.push(utf8ByteLength(pdf))
    pdf += `${object}\n`
  }
  const xrefStart = utf8ByteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return encodeBase64Utf8(pdf)
}
