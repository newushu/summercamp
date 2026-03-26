import { formatWeekLabel, resolveBootcampTuition } from './campAdmin'
import {
  WEEK_TIER_PROMO,
  getNextWeekTierPromoPrompt,
  getWeekTierPromoDisplayLines,
  getWeekTierPromoForStudent,
  getWeekTierPromoLines,
} from './campPricing'

const INCLUDED_LUNCH_DAY_KEY = 'Thu'

function currency(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

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

function encodeBase64Bytes(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }

  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function encodeBase64Utf8(input) {
  return encodeBase64Bytes(utf8Bytes(input))
}

function isIncludedLunchDay(dayKey) {
  return String(dayKey || '') === INCLUDED_LUNCH_DAY_KEY
}

function isPaidLunchSelectionKey(key) {
  return !String(key || '').endsWith(`:${INCLUDED_LUNCH_DAY_KEY}`)
}

function getDayNotableText(dayKey) {
  if (dayKey === 'Tue') {
    return 'Outdoor time: bring sunscreen and a change of outdoor shoes if needed.'
  }
  if (dayKey === 'Wed') {
    return 'Water balloons day: bring a change of clothes.'
  }
  if (dayKey === 'Thu') {
    return 'BBQ lunch included in tuition (packing lunch is optional).'
  }
  if (dayKey === 'Fri') {
    return 'Family performance showcase day.'
  }
  return ''
}

function parseDateLocal(input) {
  if (!input) {
    return null
  }
  const raw = String(input).trim()
  if (!raw) {
    return null
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(`${raw}T00:00:00`)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function startOfWeekSunday(date) {
  const next = new Date(date)
  next.setDate(next.getDate() - next.getDay())
  return next
}

function endOfWeekSaturday(date) {
  const next = new Date(date)
  next.setDate(next.getDate() + (6 - next.getDay()))
  return next
}

function getStudentSummary(student) {
  const general = { fullWeeks: 0, fullDays: 0, amDays: 0, pmDays: 0 }
  const bootcamp = { fullWeeks: 0, fullDays: 0, amDays: 0, pmDays: 0 }

  for (const entry of Object.values(student?.schedule || {})) {
    const modes = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => entry.days?.[day] || 'NONE')
    const fullWeek = modes.every((mode) => mode === 'FULL')
    const bucket = entry.campType === 'bootcamp' ? bootcamp : general

    if (fullWeek && entry.programKey !== 'overnight') {
      bucket.fullWeeks += 1
      continue
    }

    for (const mode of modes) {
      if (mode === 'FULL') bucket.fullDays += 1
      if (mode === 'AM') bucket.amDays += 1
      if (mode === 'PM') bucket.pmDays += 1
    }
  }

  const lunchCount = Object.entries(student?.lunch || {}).filter(
    ([key, value]) => Boolean(value) && isPaidLunchSelectionKey(key)
  ).length

  return { general, bootcamp, lunchCount }
}

function getLunchWeeksForStudent(student, weeksById) {
  const rows = []
  for (const [weekId, entry] of Object.entries(student?.schedule || {})) {
    const week = weeksById?.[weekId]
    const programKey = week?.programKey || entry?.programKey
    if (programKey === 'overnight') {
      continue
    }

    const sourceDays =
      Array.isArray(week?.days) && week.days.length > 0
        ? week.days
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((dayKey) => ({
            key: dayKey,
            date: '',
          }))
    const dayMetaByKey = sourceDays.reduce((acc, day) => {
      acc[String(day?.key || '').trim()] = day
      return acc
    }, {})
    const selectedDays = Object.entries(entry?.days || {})
      .filter(([, mode]) => mode && mode !== 'NONE')
      .map(([dayKey, mode]) => {
        const dayMeta = dayMetaByKey[dayKey] || {}
        return {
          dayKey,
          date: dayMeta.date || '',
          mode,
          key: `${weekId}:${dayKey}`,
        }
      })
      .sort((a, b) => {
        const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        return order.indexOf(a.dayKey) - order.indexOf(b.dayKey)
      })

    if (selectedDays.length > 0) {
      rows.push({
        weekId,
        week:
          week || {
            id: weekId,
            start: '',
            end: '',
            programLabel: 'Camp Week',
            days: sourceDays,
          },
        selectedDays,
      })
    }
  }
  return rows.sort((a, b) => (a.week.start || a.weekId).localeCompare(b.week.start || b.weekId))
}

function getLunchDecisionStats(student, weeksById) {
  const lunchWeeks = getLunchWeeksForStudent(student, weeksById)
  const registeredDays = lunchWeeks.reduce((sum, row) => sum + row.selectedDays.length, 0)
  const includedLunchDays = lunchWeeks.reduce(
    (sum, row) => sum + row.selectedDays.filter((day) => isIncludedLunchDay(day.dayKey)).length,
    0
  )
  const paidLunchDays = lunchWeeks.reduce(
    (sum, row) =>
      sum +
      row.selectedDays.filter(
        (day) => !isIncludedLunchDay(day.dayKey) && Boolean(student?.lunch?.[day.key])
      ).length,
    0
  )
  const lunchProvidedDays = includedLunchDays + paidLunchDays
  const packLunchNeededDays = Math.max(0, registeredDays - lunchProvidedDays)
  return {
    lunchWeeks,
    registeredDays,
    includedLunchDays,
    paidLunchDays,
    lunchProvidedDays,
    packLunchNeededDays,
  }
}

function buildStudentPriceRows(summary, studentIndex, tuition, options = {}) {
  const applyLimitedDiscount = Boolean(options.applyLimitedDiscount)
  const student = options.student || null
  const siblingDiscountEligible =
    typeof options.siblingDiscountEligible === 'boolean'
      ? options.siblingDiscountEligible
      : studentIndex >= 1
  const regular = tuition?.regular || {}
  const discount = tuition?.discount || {}
  const bootcampTuition = resolveBootcampTuition(tuition)
  const siblingDiscountPct = siblingDiscountEligible ? Number(tuition?.siblingDiscountPct || 0) : 0
  const bootcampRegular = bootcampTuition.regular
  const bootcampDiscounted = bootcampTuition.discount

  const rows = [
    ['general-fullWeek', 'fullWeek', 'General Camp Full Week', summary.general.fullWeeks, 'general'],
    ['general-fullDay', 'fullDay', 'General Camp Full Day', summary.general.fullDays, 'general'],
    ['general-amHalf', 'amHalf', 'General Camp AM Half Day', summary.general.amDays, 'general'],
    ['general-pmHalf', 'pmHalf', 'General Camp PM Half Day', summary.general.pmDays, 'general'],
    ['bootcamp-fullWeek', 'fullWeek', 'Competition Team Full Week', summary.bootcamp.fullWeeks, 'bootcamp'],
    ['bootcamp-fullDay', 'fullDay', 'Competition Team Full Day', summary.bootcamp.fullDays, 'bootcamp'],
    ['bootcamp-amHalf', 'amHalf', 'Competition Team AM Half Day', summary.bootcamp.amDays, 'bootcamp'],
    ['bootcamp-pmHalf', 'pmHalf', 'Competition Team PM Half Day', summary.bootcamp.pmDays, 'bootcamp'],
  ]
    .map(([id, key, label, qty, rateType]) => {
      const regularPrice = rateType === 'bootcamp' ? bootcampRegular[key] || 0 : regular[key] || 0
      const configuredDiscountedPrice =
        rateType === 'bootcamp' ? bootcampDiscounted[key] || 0 : discount[key] || 0
      const normalizedDiscountedPrice =
        Number(configuredDiscountedPrice) > 0 ? Number(configuredDiscountedPrice) : regularPrice
      const effectivePrice = applyLimitedDiscount
        ? Math.max(0, Math.min(regularPrice, normalizedDiscountedPrice))
        : regularPrice
      const discountAmount = applyLimitedDiscount ? Math.max(0, regularPrice - effectivePrice) : 0
      return {
        id,
        label,
        qty,
        regularPrice,
        effectivePrice,
        discountLineTotal: discountAmount * qty,
        regularLineTotal: regularPrice * qty,
        lineTotal: effectivePrice * qty,
      }
    })
    .filter((row) => row.qty > 0)

  const lunchPrice = Number(tuition?.lunchPrice || 14)
  rows.push({
    id: 'lunch',
    label: 'Lunch',
    qty: summary.lunchCount,
    regularPrice: lunchPrice,
    effectivePrice: lunchPrice,
    discountLineTotal: 0,
    regularLineTotal: lunchPrice * summary.lunchCount,
    lineTotal: lunchPrice * summary.lunchCount,
  })

  const tuitionRows = rows.filter((row) => row.id !== 'lunch')
  const lunchRow = rows.find((row) => row.id === 'lunch')
  const subtotalRegular = tuitionRows.reduce((acc, row) => acc + row.regularLineTotal, 0)
  const limitedDiscountAmount = tuitionRows.reduce((acc, row) => acc + row.discountLineTotal, 0)
  const tuitionSubtotal = tuitionRows.reduce((acc, row) => acc + row.lineTotal, 0)
  const lunchTotal = Number(lunchRow?.lineTotal || 0)
  const fourthWeekPromo = student
    ? getWeekTierPromoForStudent(student, options.weeksById, tuition, {
        applyLimitedDiscount,
      })
    : { eligible: false, amount: 0, label: WEEK_TIER_PROMO.shortLabel, weeksSelected: 0, breakdown: [] }
  const fourthWeekPromoAmount = Math.max(0, Number(fourthWeekPromo.amount || 0))
  const fourthWeekPromoLines = getWeekTierPromoDisplayLines(fourthWeekPromo)
  const nextWeekTierPromoPrompt = student
    ? getNextWeekTierPromoPrompt(student, options.weeksById, tuition, {
        applyLimitedDiscount,
      })
    : { eligible: false }
  const tuitionSubtotalAfterCampDiscounts = Math.max(0, tuitionSubtotal - fourthWeekPromoAmount)

  const siblingAfterLimitedDiscount =
    siblingDiscountPct > 0 ? tuitionSubtotalAfterCampDiscounts * (siblingDiscountPct / 100) : 0
  const siblingBeforeLimitedDiscount =
    siblingDiscountPct > 0 ? subtotalRegular * (siblingDiscountPct / 100) : 0

  const totalAfterLimited = Math.max(0, tuitionSubtotalAfterCampDiscounts - siblingAfterLimitedDiscount) + lunchTotal
  const totalBeforeLimited =
    Math.max(0, Math.max(0, subtotalRegular - siblingBeforeLimitedDiscount) - limitedDiscountAmount - fourthWeekPromoAmount) +
    lunchTotal

  const useSiblingBeforeLimited = totalBeforeLimited > totalAfterLimited
  const siblingDiscountAmount = useSiblingBeforeLimited
    ? siblingBeforeLimitedDiscount
    : siblingAfterLimitedDiscount

  return {
    rows,
    subtotalRegular: subtotalRegular + lunchTotal,
    limitedDiscountAmount,
    fourthWeekPromoAmount,
    fourthWeekPromoLabel: fourthWeekPromo.label,
    fourthWeekPromoLines,
    fourthWeekPromoEligible: fourthWeekPromo.eligible,
    nextWeekTierPromoPrompt,
    totalCampDiscountAmount: limitedDiscountAmount + fourthWeekPromoAmount,
    siblingDiscountPct,
    siblingDiscountAmount,
    total: useSiblingBeforeLimited ? totalBeforeLimited : totalAfterLimited,
  }
}

function getSiblingDiscountEligibleIdsForStudents(students, tuition, options = {}) {
  const studentList = Array.isArray(students) ? students : []
  if (studentList.length <= 1) {
    return new Set()
  }

  const applyLimitedDiscount = Boolean(options.applyLimitedDiscount)
  const regular = tuition?.regular || {}
  const discount = tuition?.discount || {}
  const bootcampTuition = resolveBootcampTuition(tuition)
  const bootcampRegular = bootcampTuition.regular
  const bootcampDiscounted = bootcampTuition.discount

  const ranked = studentList
    .map((student, index) => {
      const summary = getStudentSummary(student)
      const tuitionSubtotal = [
        ['general', 'fullWeek', summary.general.fullWeeks],
        ['general', 'fullDay', summary.general.fullDays],
        ['general', 'amHalf', summary.general.amDays],
        ['general', 'pmHalf', summary.general.pmDays],
        ['bootcamp', 'fullWeek', summary.bootcamp.fullWeeks],
        ['bootcamp', 'fullDay', summary.bootcamp.fullDays],
        ['bootcamp', 'amHalf', summary.bootcamp.amDays],
        ['bootcamp', 'pmHalf', summary.bootcamp.pmDays],
      ].reduce((sum, [rateType, key, qty]) => {
        const regularPrice = rateType === 'bootcamp' ? bootcampRegular[key] || 0 : regular[key] || 0
        const configuredDiscountedPrice =
          rateType === 'bootcamp' ? bootcampDiscounted[key] || 0 : discount[key] || 0
        const normalizedDiscountedPrice =
          Number(configuredDiscountedPrice) > 0 ? Number(configuredDiscountedPrice) : regularPrice
        const effectivePrice = applyLimitedDiscount
          ? Math.max(0, Math.min(regularPrice, normalizedDiscountedPrice))
          : regularPrice
        return sum + Number(qty || 0) * effectivePrice
      }, 0)
      const promo = getWeekTierPromoForStudent(student, options.weeksById, tuition, {
        applyLimitedDiscount,
      })
      return {
        studentId: student.id,
        studentIndex: index,
        tuitionSubtotal: Math.max(0, tuitionSubtotal - Number(promo.amount || 0)),
      }
    })
    .sort((a, b) => {
      if (a.tuitionSubtotal !== b.tuitionSubtotal) {
        return a.tuitionSubtotal - b.tuitionSubtotal
      }
      return a.studentIndex - b.studentIndex
    })

  return new Set(ranked.slice(0, Math.max(0, ranked.length - 1)).map((item) => item.studentId))
}

function wrapPdfText(text, maxWidth, fontSize) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim()
  if (!cleaned) {
    return ['']
  }
  const approxChars = Math.max(10, Math.floor(maxWidth / Math.max(4, fontSize * 0.52)))
  const words = cleaned.split(' ')
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= approxChars) {
      current = candidate
      continue
    }
    if (current) {
      lines.push(current)
    }
    current = word
  }
  if (current) {
    lines.push(current)
  }
  return lines
}

function rgbFill(r, g, b) {
  return `${r} ${g} ${b} rg`
}

function rgbStroke(r, g, b) {
  return `${r} ${g} ${b} RG`
}

function buildStyledSummaryPdfBase64({
  title,
  marketingLines,
  businessLines,
  parentName,
  contactEmail,
  contactPhone,
  generatedAtLabel,
  studentSections,
  familyEntries,
}) {
  const pageWidth = 612
  const pageHeight = 792
  const margin = 32
  const contentWidth = pageWidth - margin * 2
  const bottomMargin = 36
  const pages = []
  let pageCommands = []
  let cursorY = 0

  function pushCommand(command) {
    pageCommands.push(command)
  }

  function drawRect(x, y, width, height, options = {}) {
    if (options.fillColor) {
      pushCommand(rgbFill(...options.fillColor))
    }
    if (options.strokeColor) {
      pushCommand(rgbStroke(...options.strokeColor))
      pushCommand(`${options.lineWidth || 1} w`)
    }
    pushCommand(`${x} ${y} ${width} ${height} re ${options.fillColor && options.strokeColor ? 'B' : options.fillColor ? 'f' : 'S'}`)
  }

  function drawText(lines, x, yTop, options = {}) {
    const normalized = Array.isArray(lines) ? lines : [lines]
    const font = options.font || 'F1'
    const fontSize = options.fontSize || 12
    const leading = options.leading || fontSize + 3
    const color = options.color || [0.06, 0.09, 0.16]
    let currentY = yTop
    for (const rawLine of normalized) {
      const line = String(rawLine || '')
      pushCommand('BT')
      pushCommand(rgbFill(...color))
      pushCommand(`/${font} ${fontSize} Tf`)
      pushCommand(`1 0 0 1 ${x} ${currentY} Tm`)
      pushCommand(`(${escapePdfText(line)}) Tj`)
      pushCommand('ET')
      currentY -= leading
    }
    return currentY
  }

  function ensureSpace(requiredHeight) {
    if (cursorY - requiredHeight < bottomMargin) {
      finishPage()
      startPage(false)
    }
  }

  function drawMarketingBox(topY) {
    const wrapped = (marketingLines || []).flatMap((line) => wrapPdfText(line, contentWidth - 28, 11))
    const boxHeight = 34 + wrapped.length * 14
    drawRect(margin, topY - boxHeight, contentWidth, boxHeight, {
      fillColor: [0.996, 0.976, 0.957],
      strokeColor: [0.929, 0.761, 0.678],
    })
    const nextY = drawText(WEEK_TIER_PROMO.shortLabel, margin + 14, topY - 22, {
      font: 'F2',
      fontSize: 14,
      leading: 16,
      color: [0.604, 0.204, 0.024],
    })
    drawText(wrapped, margin + 14, nextY - 2, {
      font: 'F1',
      fontSize: 11,
      leading: 14,
      color: [0.286, 0.333, 0.412],
    })
    return topY - boxHeight - 16
  }

  function startPage(includeMeta) {
    pageCommands = []
    drawRect(0, pageHeight - 92, pageWidth, 92, {
      fillColor: [0.055, 0.647, 0.914],
    })
    drawRect(0, pageHeight - 92, pageWidth, 92, {
      fillColor: [0.145, 0.388, 0.922],
    })
    drawText('New England Wushu', margin, pageHeight - 28, {
      font: 'F2',
      fontSize: 11,
      leading: 14,
      color: [1, 1, 1],
    })
    drawText(title || 'Registration Summary', margin, pageHeight - 54, {
      font: 'F2',
      fontSize: 24,
      leading: 28,
      color: [1, 1, 1],
    })

    cursorY = drawMarketingBox(pageHeight - 110)

    if (includeMeta) {
      const metaLines = [
        `Parent/Guardian: ${parentName || 'not provided'}`,
        `Email: ${contactEmail || 'not provided'}    Phone: ${contactPhone || 'not provided'}`,
        `Generated: ${generatedAtLabel || ''}`,
      ]
      const businessWrapped = (businessLines || []).flatMap((line) => wrapPdfText(line, contentWidth - 28, 10))
      const metaHeight = 30 + (businessWrapped.length + metaLines.length) * 13
      drawRect(margin, cursorY - metaHeight, contentWidth, metaHeight, {
        fillColor: [0.941, 0.965, 1],
        strokeColor: [0.741, 0.839, 0.98],
      })
      let metaY = cursorY - 20
      if (businessWrapped.length > 0) {
        metaY = drawText(businessWrapped, margin + 14, metaY, {
          font: 'F1',
          fontSize: 10,
          leading: 12,
          color: [0.286, 0.333, 0.412],
        })
        metaY -= 2
      }
      drawText(metaLines, margin + 14, metaY, {
        font: 'F1',
        fontSize: 11,
        leading: 13,
        color: [0.059, 0.09, 0.165],
      })
      cursorY -= metaHeight + 18
    }
  }

  function finishPage() {
    if (pageCommands.length > 0) {
      pages.push(pageCommands.join('\n'))
    }
  }

  function drawSectionTitle(titleText) {
    ensureSpace(34)
    drawText(titleText, margin, cursorY, {
      font: 'F2',
      fontSize: 18,
      leading: 22,
      color: [0.059, 0.09, 0.165],
    })
    cursorY -= 24
  }

  function drawWrappedParagraph(text, options = {}) {
    const lines = wrapPdfText(text, contentWidth - (options.indent || 0), options.fontSize || 11)
    ensureSpace(lines.length * ((options.leading || 14)) + 6)
    cursorY = drawText(lines, margin + (options.indent || 0), cursorY, {
      font: options.font || 'F1',
      fontSize: options.fontSize || 11,
      leading: options.leading || 14,
      color: options.color || [0.286, 0.333, 0.412],
    })
  }

  function drawPills(pills) {
    const pillLines = []
    let current = ''
    for (const pill of pills) {
      const candidate = current ? `${current}   |   ${pill}` : pill
      if (candidate.length > 85 && current) {
        pillLines.push(current)
        current = pill
      } else {
        current = candidate
      }
    }
    if (current) {
      pillLines.push(current)
    }
    ensureSpace(pillLines.length * 16 + 12)
    pillLines.forEach((line) => {
      drawRect(margin, cursorY - 14, Math.min(contentWidth, line.length * 5.4 + 18), 20, {
        fillColor: [0.996, 0.953, 0.78],
        strokeColor: [0.961, 0.62, 0.043],
      })
      drawText(line, margin + 9, cursorY, {
        font: 'F2',
        fontSize: 10,
        leading: 12,
        color: [0.604, 0.204, 0.024],
      })
      cursorY -= 26
    })
  }

  function drawTable(headers, rows, columnWidths) {
    const rowHeight = 18
    const tableWidth = columnWidths.reduce((sum, value) => sum + value, 0)
    ensureSpace(rowHeight * (rows.length + 2) + 12)
    let x = margin
    drawRect(margin, cursorY - rowHeight + 4, tableWidth, rowHeight, {
      fillColor: [0.945, 0.969, 1],
      strokeColor: [0.796, 0.859, 0.941],
    })
    headers.forEach((header, index) => {
      drawText(header, x + 6, cursorY - 10, {
        font: 'F2',
        fontSize: 10,
        color: [0.059, 0.09, 0.165],
      })
      x += columnWidths[index]
    })
    cursorY -= rowHeight + 2

    rows.forEach((row, rowIndex) => {
      let cellX = margin
      drawRect(margin, cursorY - rowHeight + 4, tableWidth, rowHeight, {
        fillColor: rowIndex % 2 === 0 ? [1, 1, 1] : [0.984, 0.988, 0.996],
        strokeColor: [0.886, 0.91, 0.941],
      })
      row.forEach((cell, cellIndex) => {
        drawText(String(cell || ''), cellX + 6, cursorY - 10, {
          font: 'F1',
          fontSize: 10,
          color: [0.286, 0.333, 0.412],
        })
        cellX += columnWidths[cellIndex]
      })
      cursorY -= rowHeight
    })
    cursorY -= 10
  }

  startPage(true)

  for (const section of studentSections || []) {
    ensureSpace(140)
    drawRect(margin, cursorY - 12, contentWidth, 28, {
      fillColor: [1, 1, 1],
      strokeColor: [0.886, 0.91, 0.941],
    })
    drawSectionTitle(section.camperName)
    drawPills(section.pills)
    drawWrappedParagraph(section.note, { fontSize: 10, color: [0.286, 0.333, 0.412] })
    cursorY -= 6
    drawText('Tuition Table', margin, cursorY, {
      font: 'F2',
      fontSize: 13,
      color: [0.059, 0.09, 0.165],
    })
    cursorY -= 18
    drawTable(
      ['Item', 'Qty', 'Unit', 'Discount', 'Total'],
      section.invoiceRows.map((row) => [row.label, String(row.qty), row.unitPrice, row.discount, row.total]),
      [220, 46, 80, 84, 90]
    )
    drawWrappedParagraph(`Subtotal: ${section.subtotal}`)
    if (section.promoDiscount) {
      drawWrappedParagraph(`${section.promoLabel}: ${section.promoDiscount}`)
    }
    drawWrappedParagraph(`Total discount: ${section.totalDiscount}`)
    drawWrappedParagraph(`${section.camperName} total: ${section.total}`, {
      font: 'F2',
      color: [0.059, 0.09, 0.165],
    })
    cursorY -= 6
    drawText('Lunch Calendar', margin, cursorY, {
      font: 'F2',
      fontSize: 13,
      color: [0.059, 0.09, 0.165],
    })
    cursorY -= 18

    if (section.lunchLines.length === 0) {
      drawWrappedParagraph('No camp days selected yet.')
    } else {
      for (const line of section.lunchLines) {
        ensureSpace(18)
        drawWrappedParagraph(line, { fontSize: 10, leading: 12, indent: 8 })
      }
    }
    cursorY -= 12
  }

  ensureSpace(120)
  drawSectionTitle('Family Camp & Lunch Calendar')
  drawWrappedParagraph('Each camp day shows lunch plan and notable reminders.', {
    fontSize: 10,
    color: [0.286, 0.333, 0.412],
  })
  cursorY -= 4

  const groupedFamilyEntries = new Map()
  for (const entry of familyEntries || []) {
    const list = groupedFamilyEntries.get(entry.date) || []
    list.push(entry)
    groupedFamilyEntries.set(entry.date, list)
  }
  const familyDates = Array.from(groupedFamilyEntries.keys()).sort((a, b) => a.localeCompare(b))
  if (familyDates.length === 0) {
    drawWrappedParagraph('No camp days selected yet.')
  } else {
    for (const date of familyDates) {
      const items = groupedFamilyEntries.get(date) || []
      ensureSpace(36 + items.length * 14)
      drawRect(margin, cursorY - 18, contentWidth, 24, {
        fillColor: [0.945, 0.969, 1],
        strokeColor: [0.796, 0.859, 0.941],
      })
      drawText(date, margin + 10, cursorY - 2, {
        font: 'F2',
        fontSize: 11,
        color: [0.059, 0.09, 0.165],
      })
      cursorY -= 30
      items.forEach((item) => {
        drawWrappedParagraph(
          `${item.camperName}: ${
            item.includedLunch ? 'BBQ lunch included' : item.hasLunch ? 'Lunch purchase' : 'Pack lunch needed'
          } (${item.mode === 'FULL' ? 'Full Day' : `${item.mode} Half Day`})${item.notableText ? ` - ${item.notableText}` : ''}`,
          { fontSize: 10, leading: 12, indent: 8 }
        )
      })
      cursorY -= 8
    }
  }

  finishPage()

  const objects = ['1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj']
  const pageObjectNumbers = pages.map((_, index) => 3 + index * 2)
  const fontObjectNumber = 3 + pages.length * 2
  const boldFontObjectNumber = fontObjectNumber + 1
  objects.push(
    `2 0 obj << /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(' ')}] /Count ${pages.length} >> endobj`
  )

  pages.forEach((stream, index) => {
    const pageObjectNumber = 3 + index * 2
    const contentObjectNumber = pageObjectNumber + 1
    objects.push(
      `${pageObjectNumber} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjectNumber} 0 R /Resources << /Font << /F1 ${fontObjectNumber} 0 R /F2 ${boldFontObjectNumber} 0 R >> >> >> endobj`
    )
    objects.push(
      `${contentObjectNumber} 0 obj << /Length ${utf8ByteLength(stream)} >> stream\n${stream}\nendstream endobj`
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

export function buildRegistrationSummaryDocument({
  registration,
  tuition,
  weeksById,
  generatedAtLabel,
  applyLimitedDiscount = false,
  businessName = 'New England Wushu',
  businessAddress = '',
}) {
  const targetRegistration = registration || {}
  const students = Array.isArray(targetRegistration.students) ? targetRegistration.students : []
  const todayLabel =
    generatedAtLabel ||
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const marketingLines = [
    ...getWeekTierPromoLines(),
    'Discounts are calculated automatically per camper and arranged to preserve the highest qualifying total.',
  ]
  const businessLines = [businessName, businessAddress].filter(Boolean)
  const allCampEntries = []
  const studentPdfSections = []
  const siblingEligibleIds = getSiblingDiscountEligibleIdsForStudents(students, tuition, {
    applyLimitedDiscount,
    weeksById,
  })
  const pdfLines = [
    ...businessLines,
    `Parent/Guardian: ${targetRegistration.parentName || 'not provided'}`,
    `Email: ${targetRegistration.contactEmail || 'not provided'}`,
    `Phone: ${targetRegistration.contactPhone || 'not provided'}`,
    `Generated: ${todayLabel}`,
  ]
  const marketingPillsHtml = [
    WEEK_TIER_PROMO.shortLabel,
    'First 30 campers',
    'Weeks 4-6: 50% OFF',
    'Weeks 7-9: 60% OFF',
    'Week 10: FREE',
  ]
    .map((item) => `<span class="offerPill">${escapeHtml(item)}</span>`)
    .join('')
  const familyMetaRowsHtml = [
    ['Parent / Guardian', targetRegistration.parentName || 'not provided'],
    ['Email', targetRegistration.contactEmail || 'not provided'],
    ['Phone', targetRegistration.contactPhone || 'not provided'],
    ['Generated', todayLabel],
  ]
    .map(
      ([label, value]) => `
        <tr>
          <th>${escapeHtml(label)}</th>
          <td>${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join('')

  const studentSections = students
    .map((student, index) => {
      const camperName = student.fullName?.trim() || `Camper ${index + 1}`
      const summary = getStudentSummary(student)
      const invoice = buildStudentPriceRows(summary, index, tuition, {
        student,
        weeksById,
        totalStudents: students.length,
        applyLimitedDiscount,
        siblingDiscountEligible: siblingEligibleIds.has(student.id),
      })
      const {
        lunchWeeks,
        registeredDays,
        includedLunchDays,
        paidLunchDays,
        lunchProvidedDays,
        packLunchNeededDays,
      } = getLunchDecisionStats(student, weeksById)

      pdfLines.push(
        '',
        `${camperName}`,
        `Lunch provided: ${lunchProvidedDays}/${registeredDays} days`,
        `Paid lunch selected: ${paidLunchDays} days`,
        `Thu included lunch: ${includedLunchDays} day(s)`,
        `Pack lunch needed: ${packLunchNeededDays} days`
      )

      const rowsHtml = invoice.rows
        .map(
          (row) => `
            <tr>
              <td>${escapeHtml(row.label)}</td>
              <td>${row.qty}</td>
              <td>${currency(row.regularPrice)}</td>
              <td>${row.discountLineTotal > 0 ? `-${currency(row.discountLineTotal)}` : '-'}</td>
              <td>${currency(row.lineTotal)}</td>
            </tr>
          `
        )
        .join('')

      invoice.rows.forEach((row) => {
        pdfLines.push(
          `${row.label}: qty ${row.qty} | unit ${currency(row.regularPrice)} | discount ${
            row.discountLineTotal > 0 ? `-${currency(row.discountLineTotal)}` : '-'
          } | total ${currency(row.lineTotal)}`
        )
      })
      pdfLines.push(
        `Subtotal: ${currency(invoice.subtotalRegular)}`,
        `Discounts: -${currency(invoice.limitedDiscountAmount + invoice.fourthWeekPromoAmount + invoice.siblingDiscountAmount)}`,
        `${camperName} total: ${currency(invoice.total)}`
      )
      ;(invoice.fourthWeekPromoLines || []).forEach((promoLine) => {
        pdfLines.push(`${promoLine.label}: -${currency(promoLine.amount)}`)
      })

      const lunchCalendarHtml = lunchWeeks
        .map((row, weekIndex) => {
          const dayLines = row.selectedDays
            .map((day) => {
              const hasLunch = Boolean(student.lunch?.[day.key])
              const isIncludedLunch = isIncludedLunchDay(day.dayKey)
              const notableText = getDayNotableText(day.dayKey)
              allCampEntries.push({
                date: day.date,
                camperName,
                hasLunch: isIncludedLunch ? true : hasLunch,
                includedLunch: isIncludedLunch,
                notableText,
                mode: day.mode,
              })
              const lunchText = isIncludedLunch
                ? 'BBQ lunch included (pack optional)'
                : hasLunch
                  ? 'Lunch selected'
                  : 'Pack lunch needed'
              pdfLines.push(
                `Week ${weekIndex + 1} ${formatWeekLabel(row.week)} | ${day.dayKey} ${day.date} | ${
                  day.mode === 'FULL' ? 'Full Day' : `${day.mode} Half Day`
                } | ${lunchText}${notableText ? ` | ${notableText}` : ''}`
              )
              return `
                <tr>
                  <td>${escapeHtml(day.dayKey)}</td>
                  <td>${escapeHtml(day.date)}</td>
                  <td>${escapeHtml(day.mode === 'FULL' ? 'Full Day' : `${day.mode} Half Day`)}</td>
                  <td>${escapeHtml(lunchText)}</td>
                  <td>${escapeHtml(notableText || '-')}</td>
                </tr>
              `
            })
            .join('')

          return `
            <section class="weekBlock">
              <h4>Week ${weekIndex + 1}: ${escapeHtml(formatWeekLabel(row.week))}</h4>
              <table>
                <thead><tr><th>Day</th><th>Date</th><th>Camp Schedule</th><th>Lunch Plan</th><th>Notable</th></tr></thead>
                <tbody>${dayLines}</tbody>
              </table>
            </section>
          `
        })
        .join('')

      const lunchLines = lunchWeeks.flatMap((row, weekIndex) =>
        row.selectedDays.map((day) => {
          const hasLunch = Boolean(student.lunch?.[day.key])
          const isIncludedLunch = isIncludedLunchDay(day.dayKey)
          const lunchText = isIncludedLunch
            ? 'BBQ lunch included (pack optional)'
            : hasLunch
              ? 'Lunch selected'
              : 'Pack lunch needed'
          const notableText = getDayNotableText(day.dayKey)
          return `Week ${weekIndex + 1}: ${formatWeekLabel(row.week)} | ${day.dayKey} ${day.date} | ${
            day.mode === 'FULL' ? 'Full Day' : `${day.mode} Half Day`
          } | ${lunchText}${notableText ? ` | ${notableText}` : ''}`
        })
      )

      studentPdfSections.push({
        camperName,
        pills: [
          `Lunch provided: ${lunchProvidedDays}/${registeredDays} days`,
          `Paid lunch selected: ${paidLunchDays} days`,
          `Thu included lunch: ${includedLunchDays} day(s)`,
          `Pack lunch needed: ${packLunchNeededDays} days`,
        ],
        note:
          `Camp notes: On paid-lunch days, our team will contact you closer to each camp week to confirm menu options. Tuesday outdoor time may need sunscreen and a change of outdoor shoes. Thursday BBQ lunch is included in tuition.`,
        invoiceRows: invoice.rows.map((row) => ({
          label: row.label,
          qty: row.qty,
          unitPrice: currency(row.regularPrice),
          discount: row.discountLineTotal > 0 ? `-${currency(row.discountLineTotal)}` : '-',
          total: currency(row.lineTotal),
        })),
        subtotal: currency(invoice.subtotalRegular),
        promoLines: invoice.fourthWeekPromoLines || [],
        nextWeekTierPromoPrompt: invoice.nextWeekTierPromoPrompt || { eligible: false },
        totalDiscount: `-${currency(invoice.limitedDiscountAmount + invoice.fourthWeekPromoAmount + invoice.siblingDiscountAmount)}`,
        total: currency(invoice.total),
        lunchLines,
      })

      return `
        <section class="studentSection">
          <div class="studentHeaderRow">
            <h2>${escapeHtml(camperName)}</h2>
            <div class="studentHeaderTotal">
              <span>Camper total</span>
              <strong>${currency(invoice.total)}</strong>
            </div>
          </div>
          <div class="metricGrid">
            <div class="metricCell"><span>Lunch provided</span><strong>${lunchProvidedDays}/${registeredDays} days</strong></div>
            <div class="metricCell"><span>Paid lunch selected</span><strong>${paidLunchDays} days</strong></div>
            <div class="metricCell"><span>Thu included lunch</span><strong>${includedLunchDays} day(s)</strong></div>
            <div class="metricCell"><span>Pack lunch needed</span><strong>${packLunchNeededDays} days</strong></div>
          </div>
          <h3>Tuition Table</h3>
          <table class="detailTable">
            <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <table class="summaryTable">
            <tbody>
              <tr><th>Subtotal</th><td>${currency(invoice.subtotalRegular)}</td></tr>
              ${invoice.limitedDiscountAmount > 0 ? `<tr><th>Early-bird discount</th><td>-${currency(invoice.limitedDiscountAmount)}</td></tr>` : ''}
              ${(invoice.fourthWeekPromoLines || [])
                .map(
                  (promoLine) =>
                    `<tr><th>${escapeHtml(promoLine.label)}</th><td>-${currency(promoLine.amount)}</td></tr>`
                )
                .join('')}
              ${invoice.siblingDiscountAmount > 0 ? `<tr><th>Sibling discount</th><td>-${currency(invoice.siblingDiscountAmount)}</td></tr>` : ''}
              <tr><th>Total discount</th><td>-${currency(invoice.limitedDiscountAmount + invoice.fourthWeekPromoAmount + invoice.siblingDiscountAmount)}</td></tr>
              <tr class="summaryTotalRow"><th>${escapeHtml(camperName)} total</th><td>${currency(invoice.total)}</td></tr>
            </tbody>
          </table>
          ${invoice.nextWeekTierPromoPrompt?.eligible
            ? `<div class="upsellRow"><strong>1 week away:</strong> ${escapeHtml(invoice.nextWeekTierPromoPrompt.message)} Estimated savings ${escapeHtml(currency(invoice.nextWeekTierPromoPrompt.estimatedSavings))}.</div>`
            : ''}
          <div class="noteBox">
            <strong>Camp Notes</strong>
            <p>On paid-lunch days, our team will contact you closer to each camp week to confirm menu options. Tuesday outdoor time may need sunscreen and a change of outdoor shoes. Thursday BBQ lunch is included in tuition.</p>
          </div>
          <h3>Lunch Calendar</h3>
          ${lunchCalendarHtml || '<p>No camp days selected yet.</p>'}
        </section>
      `
    })
    .join('')

  let familyCalendarHtml = '<p>No camp days selected yet.</p>'
  if (allCampEntries.length > 0) {
    const byDate = new Map()
    for (const entry of allCampEntries) {
      const list = byDate.get(entry.date) || []
      list.push(entry)
      byDate.set(entry.date, list)
    }
    const dateKeys = Array.from(byDate.keys()).sort((a, b) => a.localeCompare(b))
    const firstDate = parseDateLocal(dateKeys[0])
    const lastDate = parseDateLocal(dateKeys[dateKeys.length - 1])
    if (firstDate && lastDate) {
      const start = startOfWeekSunday(firstDate)
      const end = endOfWeekSaturday(lastDate)
      const weekRows = []
      let cursor = new Date(start)
      while (cursor <= end) {
        const weekCells = []
        for (let index = 0; index < 7; index += 1) {
          const key = isoDate(cursor)
          const cellEntries = byDate.get(key) || []
          const itemsHtml = cellEntries
            .map((item) => {
              const modeLabel = item.mode === 'FULL' ? 'Full Day' : `${item.mode} Half Day`
              const lunchPlanLabel = item.includedLunch
                ? 'BBQ lunch included'
                : item.hasLunch
                  ? 'Lunch purchase'
                  : 'Pack lunch needed'
              return `<li><strong>${escapeHtml(item.camperName)}</strong>: ${escapeHtml(
                lunchPlanLabel
              )} (${escapeHtml(modeLabel)})${item.notableText ? ` · ${escapeHtml(item.notableText)}` : ''}</li>`
            })
            .join('')
          const inRange = key >= dateKeys[0] && key <= dateKeys[dateKeys.length - 1]
          weekCells.push(`
            <div class="calendarCell ${inRange ? '' : 'muted'}">
              <div class="calendarDate">${escapeHtml(key)}</div>
              ${itemsHtml ? `<ul>${itemsHtml}</ul>` : '<p class="emptyCell">No camp</p>'}
            </div>
          `)
          cursor = addDays(cursor, 1)
        }
        weekRows.push(`<div class="calendarWeek">${weekCells.join('')}</div>`)
      }
      familyCalendarHtml = `
        <div class="calendarHeaderRow">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <div class="calendarGrid">${weekRows.join('')}</div>
      `
    }
  }

  pdfLines.push('', 'Family Camp & Lunch Calendar')
  allCampEntries
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((item) => {
      pdfLines.push(
        `${item.date} | ${item.camperName} | ${
          item.includedLunch ? 'BBQ lunch included' : item.hasLunch ? 'Lunch purchase' : 'Pack lunch needed'
        } | ${item.mode === 'FULL' ? 'Full Day' : `${item.mode} Half Day`}${item.notableText ? ` | ${item.notableText}` : ''}`
      )
    })

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Summer Camp Registration Summary</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 18px; color: #0f172a; background: #f8fafc; }
          h1 { margin: 0 0 6px; }
          h2 { margin: 0; }
          h3 { margin: 16px 0 8px; }
          h4 { margin: 12px 0 8px; }
          .meta, .note { margin: 0 0 8px; }
          .heroHeader { background: linear-gradient(135deg, #e8f0ff 0%, #dbeafe 45%, #f8fafc 100%); border: 1px solid #bfdbfe; border-radius: 22px; padding: 20px 22px; margin-bottom: 16px; }
          .heroHeader p { margin: 0; }
          .heroHeader .eyebrow { font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #1d4ed8; }
          .heroHeader .subcopy { margin-top: 8px; color: #475569; }
          .marketingBox { border: 1px solid #f1c7b3; background: linear-gradient(145deg, #fff9f4 0%, #fbe9de 100%); border-radius: 20px; padding: 16px 18px; margin-bottom: 18px; box-shadow: 0 12px 26px rgba(148, 163, 184, 0.12); }
          .marketingBox strong { display: block; font-size: 20px; color: #9a3412; margin-bottom: 8px; }
          .offerPills { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 10px; }
          .offerPill { display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px; border: 1px solid #f1c7b3; background: rgba(255,255,255,0.82); color: #9a3412; font-size: 12px; font-weight: 700; }
          .businessMeta { font-size: 12px; color: #475569; margin-bottom: 8px; white-space: pre-line; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 12px; }
          .metaTable th { width: 180px; background: #f8fafc; color: #334155; font-weight: 700; }
          .metaTable td { color: #0f172a; }
          .detailTable thead th { background: #eff6ff; color: #1e3a8a; }
          .summaryTable { margin-top: 12px; }
          .summaryTable th { width: 220px; background: #f8fafc; color: #334155; font-weight: 700; }
          .summaryTable td { text-align: right; font-weight: 700; color: #0f172a; }
          .summaryTotalRow th, .summaryTotalRow td { background: #eff6ff; color: #1e3a8a; font-size: 13px; }
          .pill { display: inline-block; border: 1px solid #f59e0b; background: #fef3c7; border-radius: 999px; padding: 4px 9px; margin-right: 6px; margin-bottom: 4px; font-weight: 700; }
          .weekBlock { margin-top: 12px; }
          .studentSection { margin-top: 20px; border: 1px solid #dbe5f0; background: #ffffff; border-radius: 20px; padding: 18px; box-shadow: 0 10px 24px rgba(148, 163, 184, 0.08); }
          .studentHeaderRow { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 12px; }
          .studentHeaderTotal { min-width: 170px; padding: 12px 14px; border: 1px solid #bfdbfe; border-radius: 14px; background: #eff6ff; }
          .studentHeaderTotal span { display: block; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #1d4ed8; }
          .studentHeaderTotal strong { display: block; margin-top: 4px; font-size: 22px; color: #0f172a; }
          .metricGrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
          .metricCell { border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc; padding: 10px 12px; }
          .metricCell span { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
          .metricCell strong { display: block; margin-top: 4px; font-size: 15px; color: #0f172a; }
          .noteBox { margin-top: 12px; border: 1px solid #dbe5f0; border-radius: 14px; background: #f8fafc; padding: 12px 14px; }
          .noteBox strong { display: block; margin-bottom: 4px; color: #1e3a8a; }
          .noteBox p { margin: 0; color: #475569; line-height: 1.5; }
          .upsellRow { margin-top: 10px; border: 1px solid #fde68a; border-radius: 12px; background: linear-gradient(135deg, #fffbeb, #fef3c7); padding: 10px 12px; color: #854d0e; font-size: 12px; line-height: 1.45; }
          .upsellRow strong { color: #9a3412; }
          .pageBreak { page-break-before: always; break-before: page; }
          .calendarHeaderRow { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
          .calendarHeaderRow span { font-size: 12px; font-weight: 700; text-align: center; padding: 4px 0; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; }
          .calendarGrid { display: grid; gap: 6px; margin-top: 6px; }
          .calendarWeek { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
          .calendarCell { border: 1px solid #cbd5e1; border-radius: 8px; min-height: 120px; padding: 6px; background: #fff; }
          .calendarCell.muted { background: #f8fafc; }
          .calendarDate { font-size: 11px; font-weight: 700; margin-bottom: 4px; color: #334155; }
          .calendarCell ul { margin: 0; padding-left: 15px; display: grid; gap: 3px; }
          .calendarCell li { font-size: 11px; line-height: 1.3; }
          .emptyCell { margin: 0; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="heroHeader">
          <p class="eyebrow">Registration Summary</p>
          <h1>Summer Camp Registration Summary</h1>
          <p class="subcopy">This document organizes tuition, discounts, lunch planning, and weekly reminders for your family.</p>
        </div>
        <div class="marketingBox">
          <strong>${escapeHtml(WEEK_TIER_PROMO.shortLabel)}</strong>
          <div class="offerPills">${marketingPillsHtml}</div>
          <div>${marketingLines.map((line) => `<p class="note">${escapeHtml(line)}</p>`).join('')}</div>
        </div>
        ${businessLines.length > 0 ? `<p class="businessMeta">${escapeHtml(businessLines.join('\n'))}</p>` : ''}
        <table class="metaTable">
          <tbody>${familyMetaRowsHtml}</tbody>
        </table>
        ${studentSections}
        <div class="pageBreak"></div>
        <div class="marketingBox">
          <strong>${escapeHtml(WEEK_TIER_PROMO.shortLabel)}</strong>
          <div class="offerPills">${marketingPillsHtml}</div>
          <div>${marketingLines.map((line) => `<p class="note">${escapeHtml(line)}</p>`).join('')}</div>
        </div>
        <h2>Family Camp & Lunch Calendar</h2>
        <p class="note">Each camp day shows lunch plan and notable reminders.</p>
        ${familyCalendarHtml}
      </body>
    </html>
  `

  return {
    html,
    pdfBase64: buildStyledSummaryPdfBase64({
      title: 'Summer Camp Registration Summary',
      marketingLines,
      businessLines,
      parentName: targetRegistration.parentName || 'not provided',
      contactEmail: targetRegistration.contactEmail || 'not provided',
      contactPhone: targetRegistration.contactPhone || 'not provided',
      generatedAtLabel: todayLabel,
      studentSections: studentPdfSections,
      familyEntries: allCampEntries,
    }),
    plainText: [...marketingLines, '', ...pdfLines].join('\n'),
  }
}

export function buildRegistrationSummarySnapshot({
  registration,
  tuition,
  weeksById,
  applyLimitedDiscount = false,
}) {
  const targetRegistration = registration || {}
  const students = Array.isArray(targetRegistration.students) ? targetRegistration.students : []
  const camperNames = students.map((student, index) => student.fullName?.trim() || `Camper ${index + 1}`)
  const siblingEligibleIds = getSiblingDiscountEligibleIdsForStudents(students, tuition, {
    applyLimitedDiscount,
    weeksById,
  })

  const summaryLines = [
    `Location: ${targetRegistration.location || 'not provided'}`,
    `Parent/Guardian: ${targetRegistration.parentName || 'not provided'}`,
    `Contact: ${targetRegistration.contactEmail || 'not provided'} | ${targetRegistration.contactPhone || 'not provided'}`,
    `Payment method: ${targetRegistration.paymentMethod || 'not selected'}`,
  ]

  const amountDue = students.reduce((sum, student, index) => {
    const summary = getStudentSummary(student)
    const invoice = buildStudentPriceRows(summary, index, tuition, {
      student,
      weeksById,
      totalStudents: students.length,
      applyLimitedDiscount,
      siblingDiscountEligible: siblingEligibleIds.has(student.id),
    })
    const lunchStats = getLunchDecisionStats(student, weeksById)
    const camperName = camperNames[index]
    summaryLines.push(
      `${camperName}: ${invoice.rows.length > 0 ? invoice.rows.map((row) => `${row.label} x${row.qty}`).join(', ') : 'No camp days selected'}`
    )
    if (lunchStats.registeredDays > 0) {
      summaryLines.push(
        `${camperName} lunch: provided ${lunchStats.lunchProvidedDays}/${lunchStats.registeredDays} days, pack lunch needed ${lunchStats.packLunchNeededDays}`
      )
    }
    summaryLines.push(`${camperName} total: ${currency(invoice.total)}`)
    ;(invoice.fourthWeekPromoLines || []).forEach((promoLine) => {
      summaryLines.push(`${camperName} offer applied: ${promoLine.label} (-${currency(promoLine.amount)})`)
    })
    return sum + Number(invoice.total || 0)
  }, 0)

  summaryLines.push(`Grand total: ${currency(amountDue)}`)
  summaryLines.push(`Offer reminder: ${WEEK_TIER_PROMO.headline}`)
  summaryLines.push(`Offer details: ${WEEK_TIER_PROMO.cap} ${WEEK_TIER_PROMO.tiers} ${WEEK_TIER_PROMO.detail}`)
  summaryLines.push(`Why families use it: ${WEEK_TIER_PROMO.growth}`)

  return {
    summaryLines,
    amountDue,
    camperNames,
  }
}
