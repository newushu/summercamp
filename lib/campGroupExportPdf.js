function escapePdfText(input) {
  return String(input || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function utf8Bytes(input) {
  const value = String(input || '')
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(value)
  if (typeof Buffer !== 'undefined') return Uint8Array.from(Buffer.from(value, 'utf8'))
  const encoded = unescape(encodeURIComponent(value))
  const bytes = new Uint8Array(encoded.length)
  for (let index = 0; index < encoded.length; index += 1) bytes[index] = encoded.charCodeAt(index)
  return bytes
}

function utf8ByteLength(input) {
  return utf8Bytes(input).length
}

function encodeBase64Utf8(input) {
  if (typeof Buffer !== 'undefined') return Buffer.from(input, 'utf8').toString('base64')
  const bytes = utf8Bytes(input)
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

function wrapText(text, maxChars) {
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  if (words.length === 0) return ['']
  const lines = []
  let current = words[0]
  for (let index = 1; index < words.length; index += 1) {
    const next = words[index]
    if (`${current} ${next}`.length <= maxChars) current += ` ${next}`
    else {
      lines.push(current)
      current = next
    }
  }
  lines.push(current)
  return lines
}

function createPdf({ pageWidth = 792, pageHeight = 612, draw }) {
  const pages = []
  let stream = ''

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
    if (fillColor) push(`${fillColor[0]} ${fillColor[1]} ${fillColor[2]} rg`)
    if (strokeColor) push(`${strokeColor[0]} ${strokeColor[1]} ${strokeColor[2]} RG`)
    push(`${lineWidth} w`)
    push(`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`)
    push(fillColor ? 'B' : 'S')
  }

  function drawWrappedText(text, x, y, width, options = {}) {
    const { font = 'F1', fontSize = 9, lineHeight = 12, color = [0.2, 0.239, 0.314] } = options
    const maxChars = Math.max(12, Math.floor(width / (fontSize * 0.52)))
    const lines = wrapText(text, maxChars)
    lines.forEach((line, index) => drawText(line, x, y - index * lineHeight, { font, fontSize, color }))
    return lines.length * lineHeight
  }

  function finishPage() {
    pages.push(stream)
    stream = ''
  }

  draw({ drawText, drawRect, drawWrappedText, finishPage, pageWidth, pageHeight })

  const objects = []
  const offsets = []
  const pageObjectNumbers = pages.map((_, index) => 5 + index * 2)
  const contentObjectNumbers = pages.map((_, index) => 6 + index * 2)

  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj')
  objects.push(`2 0 obj << /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pages.length} >> endobj`)
  objects.push('3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj')
  objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj')

  pages.forEach((pageStream, index) => {
    objects.push(`${pageObjectNumbers[index]} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumbers[index]} 0 R >> endobj`)
    objects.push(`${contentObjectNumbers[index]} 0 obj << /Length ${utf8ByteLength(pageStream)} >> stream\n${pageStream}endstream\nendobj`)
  })

  let pdf = '%PDF-1.4\n'
  objects.forEach((object) => {
    offsets.push(utf8ByteLength(pdf))
    pdf += `${object}\n`
  })
  const xrefStart = utf8ByteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return encodeBase64Utf8(pdf)
}

export function buildCamperDetailPagesPdfBase64({ rows = [], generatedAtLabel = '' }) {
  return createPdf({
    draw: ({ drawText, drawRect, drawWrappedText, finishPage, pageWidth, pageHeight }) => {
      const margin = 42
      const contentWidth = pageWidth - margin * 2
      const safeRows = rows.length > 0 ? rows : [{ camperName: 'No campers', details: ['No active camper rows available.'] }]

      safeRows.forEach((row) => {
        drawRect(margin, pageHeight - margin - 64, contentWidth, 64, {
          fillColor: [0.969, 0.98, 0.992],
          strokeColor: [0.8, 0.85, 0.91],
        })
        drawText(row.camperName || 'Camper', margin + 16, pageHeight - margin - 26, {
          font: 'F2',
          fontSize: 22,
          color: [0.082, 0.173, 0.329],
        })
        drawText(row.subtitle || 'Camper personal detail sheet', margin + 16, pageHeight - margin - 45, {
          fontSize: 10,
          color: [0.349, 0.431, 0.541],
        })
        if (generatedAtLabel) {
          drawText(`Generated ${generatedAtLabel}`, pageWidth - margin - 170, pageHeight - margin - 45, {
            fontSize: 9,
            color: [0.349, 0.431, 0.541],
          })
        }

        let cursorY = pageHeight - margin - 92
        ;(row.sections || []).forEach((section) => {
          drawText(section.title, margin, cursorY, {
            font: 'F2',
            fontSize: 13,
            color: [0.114, 0.227, 0.525],
          })
          cursorY -= 18
          ;(section.lines || []).forEach((line) => {
            const height = drawWrappedText(line, margin + 12, cursorY, contentWidth - 24, {
              fontSize: 9.5,
              lineHeight: 12,
            })
            cursorY -= Math.max(14, height)
          })
          cursorY -= 10
        })
        finishPage()
      })
    },
  })
}

export function buildLunchPurchaseTablePdfBase64({ groups = [], generatedAtLabel = '' }) {
  return createPdf({
    draw: ({ drawText, drawRect, drawWrappedText, finishPage, pageWidth, pageHeight }) => {
      const margin = 38
      const contentWidth = pageWidth - margin * 2
      let cursorY = pageHeight - margin

      function startPage() {
        cursorY = pageHeight - margin
        drawRect(margin, pageHeight - margin - 58, contentWidth, 58, {
          fillColor: [0.969, 0.98, 0.992],
          strokeColor: [0.8, 0.85, 0.91],
        })
        drawText('Lunch Purchase Table', margin + 16, pageHeight - margin - 24, {
          font: 'F2',
          fontSize: 22,
          color: [0.082, 0.173, 0.329],
        })
        drawText('Only days with purchased lunch selections are filled.', margin + 16, pageHeight - margin - 42, {
          fontSize: 10,
          color: [0.349, 0.431, 0.541],
        })
        if (generatedAtLabel) {
          drawText(`Generated ${generatedAtLabel}`, pageWidth - margin - 170, pageHeight - margin - 42, {
            fontSize: 9,
            color: [0.349, 0.431, 0.541],
          })
        }
        cursorY = pageHeight - margin - 78
      }

      function ensureSpace(height) {
        if (cursorY - height < margin) {
          finishPage()
          startPage()
        }
      }

      startPage()
      const columns = [
        { label: 'Camper', width: 120 },
        { label: 'Parent / Phone', width: 170 },
        { label: 'M', width: 70 },
        { label: 'T', width: 70 },
        { label: 'W', width: 70 },
        { label: 'R', width: 70 },
        { label: 'F', width: 70 },
        { label: 'Status', width: 70 },
      ]

      groups.forEach((group) => {
        ensureSpace(70)
        drawText(group.title || 'Week', margin, cursorY, { font: 'F2', fontSize: 14, color: [0.114, 0.227, 0.525] })
        drawText(group.subtitle || '', pageWidth - margin - 170, cursorY, { fontSize: 9, color: [0.349, 0.431, 0.541] })
        cursorY -= 22
        drawRect(margin, cursorY - 22, contentWidth, 22, {
          fillColor: [0.955, 0.965, 0.98],
          strokeColor: [0.84, 0.88, 0.93],
        })
        let x = margin + 8
        columns.forEach((column) => {
          drawText(column.label, x, cursorY - 14, { font: 'F2', fontSize: 8, color: [0.271, 0.322, 0.408] })
          x += column.width
        })
        cursorY -= 22

        ;(group.rows || []).forEach((row, rowIndex) => {
          const rowHeight = 34
          ensureSpace(rowHeight + 1)
          drawRect(margin, cursorY - rowHeight, contentWidth, rowHeight, {
            fillColor: rowIndex % 2 === 0 ? [1, 1, 1] : [0.985, 0.989, 0.995],
            strokeColor: [0.9, 0.925, 0.953],
            lineWidth: 0.8,
          })
          let colX = margin + 8
          const values = [
            row.camperName,
            `${row.parentName || ''}${row.phone ? ` / ${row.phone}` : ''}`,
            row.dayValues?.Mon || '',
            row.dayValues?.Tue || '',
            row.dayValues?.Wed || '',
            row.dayValues?.Thu || '',
            row.dayValues?.Fri || '',
            row.status || '',
          ]
          columns.forEach((column, index) => {
            drawWrappedText(values[index], colX, cursorY - 12, column.width - 8, { fontSize: 8.5, lineHeight: 10 })
            colX += column.width
          })
          cursorY -= rowHeight
        })
        cursorY -= 12
      })

      if (groups.length === 0) {
        drawText('No lunch purchase rows are available.', margin, cursorY, { fontSize: 11 })
      }
      finishPage()
    },
  })
}
