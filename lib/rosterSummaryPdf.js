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
  const words = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
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

export function buildRosterSummaryPdfBase64({
  title = 'Camp Roster Summary',
  subtitle = 'Weekly camp roster export',
  generatedAtLabel = '',
  sections = [],
}) {
  const pageWidth = 792
  const pageHeight = 612
  const margin = 38
  const contentWidth = pageWidth - margin * 2
  const columns = [
    { key: 'camperName', label: 'Camper', width: 110 },
    { key: 'parentName', label: 'Parent Contact', width: 170 },
    { key: 'location', label: 'Location / Activities', width: 128 },
    { key: 'selectionSummary', label: 'Program / Accounting', width: 170 },
    { key: 'paymentMethod', label: 'Pay', width: 48 },
    { key: 'email', label: 'Medical / Notes', width: 128 },
  ]

  const pages = []
  let stream = ''
  let cursorY = pageHeight - margin

  function push(command) {
    stream += `${command}\n`
  }

  function drawText(text, x, y, options = {}) {
    const { font = 'F1', fontSize = 10, color = [0.11, 0.14, 0.2] } = options
    push('BT')
    push(`/${font} ${fontSize} Tf`)
    push(`${color[0]} ${color[1]} ${color[2]} rg`)
    push(`1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`)
    push(`(${escapePdfText(text)}) Tj`)
    push('ET')
  }

  function drawRect(x, y, width, height, options = {}) {
    const { fillColor = null, strokeColor = [0.84, 0.88, 0.93], lineWidth = 1 } = options
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
    drawRect(margin, pageHeight - margin - 58, contentWidth, 58, {
      fillColor: [0.969, 0.98, 0.992],
      strokeColor: [0.8, 0.85, 0.91],
    })
    drawText(title, margin + 16, pageHeight - margin - 24, {
      font: 'F2',
      fontSize: 23,
      color: [0.082, 0.173, 0.329],
    })
    if (subtitle) {
      drawText(subtitle, margin + 16, pageHeight - margin - 41, {
        fontSize: 10,
        color: [0.349, 0.431, 0.541],
      })
    }
    if (generatedAtLabel) {
      drawText(`Generated ${generatedAtLabel}`, pageWidth - margin - 160, pageHeight - margin - 41, {
        fontSize: 9,
        color: [0.349, 0.431, 0.541],
      })
    }
    cursorY = pageHeight - margin - 74
  }

  function ensureSpace(heightNeeded) {
    if (cursorY - heightNeeded < margin) {
      finishPage()
      startPage()
    }
  }

  function drawWrappedText(text, x, y, width, options = {}) {
    const { font = 'F1', fontSize = 9, lineHeight = 12, color = [0.2, 0.239, 0.314] } = options
    const estimatedChars = Math.max(12, Math.floor(width / (fontSize * 0.52)))
    const lines = wrapText(text, estimatedChars)
    lines.forEach((line, index) => {
      drawText(line, x, y - index * lineHeight, { font, fontSize, color })
    })
    return lines.length * lineHeight
  }

  function drawSectionHeader(section) {
    ensureSpace(54)
    drawRect(margin, cursorY - 34, contentWidth, 34, {
      fillColor: section.accentColor || [0.902, 0.933, 0.976],
      strokeColor: [0.77, 0.83, 0.9],
    })
    drawText(section.title || 'Roster', margin + 14, cursorY - 21, {
      font: 'F2',
      fontSize: 15,
      color: [0.082, 0.173, 0.329],
    })
    if (section.summary) {
      drawText(section.summary, margin + 240, cursorY - 21, {
        fontSize: 9,
        color: [0.255, 0.329, 0.439],
      })
    }
    cursorY -= 46
  }

  function drawTableHeader() {
    const headerHeight = 22
    ensureSpace(headerHeight + 4)
    drawRect(margin, cursorY - headerHeight, contentWidth, headerHeight, {
      fillColor: [0.955, 0.965, 0.98],
      strokeColor: [0.84, 0.88, 0.93],
    })
    let x = margin + 8
    columns.forEach((column) => {
      drawText(column.label, x, cursorY - 14, {
        font: 'F2',
        fontSize: 8,
        color: [0.271, 0.322, 0.408],
      })
      x += column.width
    })
    cursorY -= headerHeight
  }

  function measureRowHeight(row) {
    let maxHeight = 18
    columns.forEach((column) => {
      const value = String(row?.[column.key] || '')
      const estimatedChars = Math.max(12, Math.floor((column.width - 10) / 4.9))
      const lineCount = wrapText(value, estimatedChars).length
      maxHeight = Math.max(maxHeight, 8 + lineCount * 10)
    })
    return maxHeight
  }

  function drawRow(row, rowIndex) {
    const rowHeight = measureRowHeight(row)
    ensureSpace(rowHeight + 1)
    drawRect(margin, cursorY - rowHeight, contentWidth, rowHeight, {
      fillColor: rowIndex % 2 === 0 ? [1, 1, 1] : [0.985, 0.989, 0.995],
      strokeColor: [0.9, 0.925, 0.953],
      lineWidth: 0.8,
    })
    let x = margin + 8
    columns.forEach((column) => {
      drawWrappedText(String(row?.[column.key] || ''), x, cursorY - 12, column.width - 10, {
        fontSize: 8.5,
        lineHeight: 10,
        color: [0.11, 0.14, 0.2],
      })
      x += column.width
    })
    cursorY -= rowHeight
  }

  function drawGroup(group) {
    const titleHeight = 28
    ensureSpace(titleHeight + 30)
    drawRect(margin, cursorY - titleHeight, contentWidth, titleHeight, {
      fillColor: [0.996, 0.998, 1],
      strokeColor: [0.86, 0.9, 0.95],
    })
    drawText(group.title || 'Week', margin + 12, cursorY - 18, {
      font: 'F2',
      fontSize: 11,
      color: [0.114, 0.227, 0.525],
    })
    drawText(group.subtitle || '', pageWidth - margin - 180, cursorY - 18, {
      fontSize: 8.5,
      color: [0.349, 0.431, 0.541],
    })
    cursorY -= titleHeight + 3

    if (!Array.isArray(group.rows) || group.rows.length === 0) {
      ensureSpace(22)
      drawRect(margin, cursorY - 20, contentWidth, 20, {
        fillColor: [0.985, 0.989, 0.995],
        strokeColor: [0.9, 0.925, 0.953],
      })
      drawText('No registered campers for this week.', margin + 12, cursorY - 13, {
        fontSize: 8.5,
        color: [0.42, 0.49, 0.58],
      })
      cursorY -= 24
      return
    }

    drawTableHeader()
    group.rows.forEach((row, index) => drawRow(row, index))
    cursorY -= 10
  }

  startPage()

  sections.forEach((section) => {
    drawSectionHeader(section)
    ;(section.groups || []).forEach((group) => drawGroup(group))
  })

  finishPage()

  const objects = []
  const offsets = []

  const fontRegularObjectNumber = 3
  const fontBoldObjectNumber = 4
  const pageTreeObjectNumber = 2

  const pageObjectNumbers = pages.map((_, index) => 5 + index * 2)
  const contentObjectNumbers = pages.map((_, index) => 6 + index * 2)

  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj')
  objects.push(
    `2 0 obj << /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pages.length} >> endobj`
  )
  objects.push('3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj')
  objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj')

  pages.forEach((pageStream, index) => {
    const pageObjectNumber = pageObjectNumbers[index]
    const contentObjectNumber = contentObjectNumbers[index]
    objects.push(
      `${pageObjectNumber} 0 obj << /Type /Page /Parent ${pageTreeObjectNumber} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularObjectNumber} 0 R /F2 ${fontBoldObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >> endobj`
    )
    objects.push(
      `${contentObjectNumber} 0 obj << /Length ${utf8ByteLength(pageStream)} >> stream\n${pageStream}endstream\nendobj`
    )
  })

  let pdf = '%PDF-1.4\n'
  objects.forEach((object) => {
    offsets.push(utf8ByteLength(pdf))
    pdf += `${object}\n`
  })
  const xrefStart = utf8ByteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return encodeBase64Utf8(pdf)
}
