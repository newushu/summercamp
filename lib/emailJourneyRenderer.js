const CAMP_NAME = 'New England Wushu Summer Camp'

export const PAYMENT_METHODS_TEXT = [
  'Zelle: wushu688@gmail.com',
  'Venmo: @newushu',
  'Check (payable to Newushu): 123 Muller Rd',
].join('\n')

export function escapeHtml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderTemplate(template, tokens) {
  return Object.entries(tokens || {}).reduce((output, [token, value]) => {
    return String(output || '').replaceAll(`{${token}}`, String(value || ''))
  }, String(template || ''))
}

export function normalizeImageUrls(value) {
  return (Array.isArray(value) ? value : []).map((item) => String(item || '').trim()).filter(Boolean)
}

export function pickJourneyImage(imageUrls, seedNumber = 0) {
  const normalized = normalizeImageUrls(imageUrls)
  if (normalized.length === 0) {
    return ''
  }
  const index = Math.abs(Number(seedNumber || 0)) % normalized.length
  return normalized[index] || normalized[0] || ''
}

function splitBodySections(lines) {
  const groups = []
  let current = []
  for (const rawLine of Array.isArray(lines) ? lines : []) {
    const line = String(rawLine || '').trim()
    if (!line) {
      if (current.length > 0) {
        groups.push(current)
        current = []
      }
      continue
    }
    current.push(line)
  }
  if (current.length > 0) {
    groups.push(current)
  }
  return groups
}

function splitBodyIntoSections(bodyText) {
  return String(bodyText || '')
    .split(/\n\s*\n/g)
    .map((block) => block.split('\n').map((line) => String(line || '').trim()).filter(Boolean))
    .filter((group) => group.length > 0)
}

function looksLikeUrl(line) {
  return /^https?:\/\//i.test(String(line || '').trim())
}

function getToneColors(tone = 'neutral') {
  const tones = {
    neutral: { border: '#dbe5f0', background: '#ffffff', accent: '#334155', text: '#334155' },
    summer: { border: '#fde68a', background: 'linear-gradient(180deg,#fffdf4 0%,#fff7d6 100%)', accent: '#b45309', text: '#7c2d12' },
    blue: { border: '#bfdbfe', background: 'linear-gradient(180deg,#f8fbff 0%,#e0f2fe 100%)', accent: '#1d4ed8', text: '#1e3a8a' },
    green: { border: '#86efac', background: 'linear-gradient(180deg,#f7fff9 0%,#ecfdf5 100%)', accent: '#166534', text: '#14532d' },
  }
  return tones[tone] || tones.neutral
}

function renderCard({ title = '', tone = 'neutral', bodyHtml }) {
  const colors = getToneColors(tone)
  return `
    <div style="margin:16px 0 0;padding:16px 18px;border:1px solid ${colors.border};border-radius:18px;background:${colors.background};box-shadow:0 10px 24px rgba(15,23,42,0.05);">
      ${title ? `<p style="margin:0 0 10px;font-size:13px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:${colors.accent};">${escapeHtml(title)}</p>` : ''}
      <div style="margin:0;color:${colors.text};font-size:15px;line-height:1.65;">${bodyHtml}</div>
    </div>
  `
}

function renderPills(items, tone = 'neutral') {
  const colors = getToneColors(tone)
  return `
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${items.map((item) => `<span style="display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;border:1px solid ${colors.border};background:rgba(255,255,255,0.75);color:${colors.text};font-weight:700;">${escapeHtml(item)}</span>`).join('')}
    </div>
  `
}

function renderBulletList(items, tone = 'neutral') {
  const colors = getToneColors(tone)
  return `
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${items.map((item) => `<span style="display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;border:1px solid ${colors.border};background:rgba(255,255,255,0.75);color:${colors.text};font-weight:700;">${escapeHtml(item)}</span>`).join('')}
    </div>
  `
}

function extractCommaList(line) {
  const raw = String(line || '').trim()
  const parts = raw.split(/:\s*/, 2)
  if (parts.length < 2 || !parts[1] || !parts[1].includes(',')) {
    return []
  }
  return parts[1]
    .split(/,| and /i)
    .map((item) => item.replace(/\.$/, '').trim())
    .filter(Boolean)
}

function buildLevelUpRewardsBodyHtml() {
  return `
    <p style="margin:0 0 10px;"><strong>Earn New England Wushu Level Up points all summer:</strong> 2,500 for each full week enrollment, 500 for each full day, and 100 for each half day enrollment.</p>
    <p style="margin:0;">Points can be saved for prizes, equipment, and future discounts during the fall or spring season.</p>
  `
}

function extractYoutubeVideoId(url) {
  const raw = String(url || '').trim()
  if (!raw) {
    return ''
  }
  const shortMatch = raw.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/)
  if (shortMatch) {
    return shortMatch[1]
  }
  const watchMatch = raw.match(/[?&]v=([A-Za-z0-9_-]{6,})/)
  if (watchMatch) {
    return watchMatch[1]
  }
  const embedMatch = raw.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/)
  if (embedMatch) {
    return embedMatch[1]
  }
  return ''
}

function buildYoutubeHighlightHtml(videoUrl) {
  const safeUrl = String(videoUrl || '').trim()
  const videoId = extractYoutubeVideoId(safeUrl)
  if (!safeUrl || !videoId) {
    return ''
  }
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  return `
    <div style="margin:16px 0 0;padding:16px 18px;border:1px solid #bfdbfe;border-radius:18px;background:linear-gradient(180deg,#f8fbff 0%,#e0f2fe 100%);box-shadow:0 10px 24px rgba(15,23,42,0.05);">
      <p style="margin:0 0 10px;font-size:13px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#1d4ed8;">Program Highlights</p>
      <a href="${escapeHtml(safeUrl)}" style="display:block;text-decoration:none;" target="_blank" rel="noreferrer">
        <img src="${escapeHtml(thumbnailUrl)}" alt="Program video preview" style="display:block;width:100%;border-radius:14px;border:1px solid #93c5fd;object-fit:cover;" />
      </a>
      <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#1e3a8a;">Check out some highlights from our program.</p>
      <p style="margin:8px 0 0;"><a href="${escapeHtml(safeUrl)}" style="color:#2563eb;font-weight:800;text-decoration:none;" target="_blank" rel="noreferrer">Watch on YouTube</a></p>
    </div>
  `
}

function renderLeadNarrativeSections(bodyText) {
  const sections = splitBodyIntoSections(bodyText)
  let greetingHtml = ''
  const sectionHtml = sections
    .map((group, index) => {
      const cleaned = group.map((line) => String(line || '').trim()).filter((line) => line && !looksLikeUrl(line))
      if (cleaned.length === 0) return ''
      if (!greetingHtml && /^(hi|hello)\b/i.test(cleaned[0] || '')) {
        greetingHtml = `<p style="margin:16px 0 0;font-size:16px;color:#334155;">${escapeHtml(cleaned.shift())}</p>`
      }
      if (cleaned.length === 0) return ''
      const commaItems = cleaned.length === 1 ? extractCommaList(cleaned[0]) : []
      if (commaItems.length >= 2) {
        const [title] = cleaned[0].split(':')
        return renderCard({
          title,
          tone: /famil/i.test(title) ? 'green' : 'summer',
          bodyHtml: renderPills(commaItems, /famil/i.test(title) ? 'green' : 'summer'),
        })
      }
      return renderCard({
        tone: index === 0 ? 'summer' : 'neutral',
        bodyHtml: cleaned.map((line) => `<p style="margin:0 0 12px;font-size:16px;">${escapeHtml(line)}</p>`).join(''),
      })
    })
    .filter(Boolean)
    .join('')
  return { greetingHtml, sectionHtml }
}

export function buildLeadJourneyEmailHtml({
  heading,
  preview,
  bodyText,
  ctaLink,
  recommendation = '',
  logoUrl = '',
  heroImageUrl = '',
  videoUrl = '',
}) {
  const { greetingHtml, sectionHtml } = renderLeadNarrativeSections(bodyText)
  const videoHtml = buildYoutubeHighlightHtml(videoUrl)
  return `
    <div style="margin:0;padding:20px;background:linear-gradient(180deg,#fff7ed 0%,#eff6ff 100%);">
      <div style="max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #fde68a;border-radius:18px;overflow:hidden;box-shadow:0 20px 40px rgba(194,65,12,0.12);font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <div style="padding:15px 20px;background:linear-gradient(135deg,#f59e0b 0%,#f97316 36%,#0284c7 100%);color:#ffffff;">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(CAMP_NAME)}" style="display:block;max-height:52px;margin:0 0 10px;" />` : ''}
          <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:800;">${escapeHtml(CAMP_NAME)}</p>
          <p style="margin:6px 0 0;font-size:13px;opacity:0.95;">${escapeHtml(preview)}</p>
        </div>
        <div style="padding:22px 20px 14px;">
          <div style="padding:16px 18px;border:1px solid #fde68a;border-radius:20px;background:linear-gradient(180deg,#fffdf4 0%,#fff7d6 100%);">
            <h2 style="margin:0 0 10px;font-size:27px;line-height:1.2;color:#0f172a;">${escapeHtml(heading)}</h2>
            <p style="margin:0;font-size:15px;color:#7c2d12;">Summer camp recommendations, next steps, and family support.</p>
          </div>
          ${
            heroImageUrl
              ? `<div style="margin:16px 0 0;border:1px solid #fde68a;border-radius:20px;overflow:hidden;background:#fff7ed;">
                  <img src="${escapeHtml(heroImageUrl)}" alt="${escapeHtml(CAMP_NAME)}" style="display:block;width:100%;max-height:260px;object-fit:cover;" />
                </div>`
              : ''
          }
          ${
            recommendation
              ? `<div style="margin:16px 0 0;padding:16px 18px;border:1px solid #86efac;border-radius:18px;background:linear-gradient(180deg,#f7fff9 0%,#ecfdf5 100%);box-shadow:0 10px 24px rgba(15,23,42,0.04);">
                  <p style="margin:0 0 8px;font-size:14px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:#166534;">Recommended Fit</p>
                  <p style="margin:0;font-size:16px;color:#14532d;">${escapeHtml(recommendation)}</p>
                </div>`
              : ''
          }
          ${videoHtml}
          ${greetingHtml}
          ${sectionHtml}
          <div style="margin:16px 0 0;padding:16px 18px;border:1px solid #bfdbfe;border-radius:18px;background:linear-gradient(180deg,#eff6ff 0%,#dbeafe 100%);">
            <a href="${escapeHtml(ctaLink)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#0284c7 0%,#2563eb 100%);color:#ffffff;text-decoration:none;font-weight:800;">
              Reserve Camp Weeks
            </a>
          </div>
          ${renderCard({
            title: 'New England Wushu Level Up Rewards',
            tone: 'summer',
            bodyHtml: buildLevelUpRewardsBodyHtml(),
          })}
          ${renderCard({
            title: 'Camp Highlights',
            tone: 'green',
            bodyHtml: renderPills(['Top coaching', 'Safe team culture', 'Visible progress', 'Fun daily rhythm'], 'green'),
          })}
          ${renderCard({
            title: 'Level Up App',
            tone: 'blue',
            bodyHtml: '<p style="margin:0;">Download opens June 20 for lunch access, daily photos and videos, progress updates, and instructor notes.</p>',
          })}
        </div>
      </div>
    </div>
  `
}

export function buildLeadJourneyMessage({
  template,
  tokens,
  logoUrl = '',
  landingCarouselImageUrls = [],
  stepNumber = 1,
}) {
  const subject = renderTemplate(template?.subject || '', tokens)
  const bodyText = renderTemplate(template?.body || '', tokens)
  const ctaLink = tokens?.registration_link || 'https://summer.newushu.com/register'
  const recommendation = tokens?.recommended_plan || ''
  const html = buildLeadJourneyEmailHtml({
    heading: subject,
    preview: 'Summer 2026 Family Update',
    bodyText,
    ctaLink,
    recommendation,
    logoUrl,
    heroImageUrl: pickJourneyImage(landingCarouselImageUrls, stepNumber - 1),
    videoUrl: template?.videoUrl || '',
  })
  return { subject, bodyText, html }
}

function renderNarrativeSections(lines) {
  const groups = splitBodySections(lines)
  let greetingHtml = ''
  const sectionHtml = groups
    .map((group, index) => {
      const cleaned = group.map((line) => String(line || '').trim()).filter((line) => line && !looksLikeUrl(line))
      if (cleaned.length === 0) return ''
      if (!greetingHtml && /^(hi|hello)\b/i.test(cleaned[0] || '')) {
        greetingHtml = `<p style="margin:16px 0 0;font-size:16px;color:#334155;">${escapeHtml(cleaned.shift())}</p>`
      }
      if (cleaned.length === 0) return ''
      const bulletItems = cleaned.filter((line) => line.startsWith('- ')).map((line) => line.slice(2).trim())
      if (bulletItems.length > 0) {
        const paragraphLines = cleaned.filter((line) => !line.startsWith('- '))
        return renderCard({
          title: paragraphLines[0] || 'Checklist',
          tone: 'green',
          bodyHtml: `
            ${paragraphLines.slice(1).map((line) => `<p style="margin:0 0 10px;">${escapeHtml(line)}</p>`).join('')}
            ${renderBulletList(bulletItems, 'green')}
          `,
        })
      }
      const commaItems = cleaned.length === 1 ? extractCommaList(cleaned[0]) : []
      if (commaItems.length >= 2) {
        const [title] = cleaned[0].split(':')
        return renderCard({
          title,
          tone: /famil/i.test(title) ? 'green' : 'summer',
          bodyHtml: renderBulletList(commaItems, /famil/i.test(title) ? 'green' : 'summer'),
        })
      }
      return renderCard({
        tone: index === 0 ? 'summer' : 'neutral',
        bodyHtml: cleaned.map((line) => `<p style="margin:0 0 12px;">${escapeHtml(line)}</p>`).join(''),
      })
    })
    .filter(Boolean)
    .join('')
  return { greetingHtml, sectionHtml }
}

function formatCurrency(value) {
  const amount = Number(value || 0)
  return `$${amount.toFixed(2)}`
}

function parseDateOnly(value) {
  const raw = String(value || '').trim()
  if (!raw) {
    return null
  }
  const dayOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw)
  const parsed = dayOnly ? new Date(`${raw}T12:00:00.000Z`) : new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

function normalizeCampWeeks(payload) {
  const incoming = Array.isArray(payload?.campWeeks) ? payload.campWeeks : []
  const mapped = incoming
    .map((week) => {
      if (typeof week === 'string') {
        const start = parseDateOnly(week)
        if (!start) return null
        return { start: start.toISOString().slice(0, 10), end: start.toISOString().slice(0, 10) }
      }
      const startDate = parseDateOnly(week?.start)
      if (!startDate) return null
      const endDate = parseDateOnly(week?.end) || startDate
      return { start: startDate.toISOString().slice(0, 10), end: endDate.toISOString().slice(0, 10) }
    })
    .filter(Boolean)
  const byStart = new Map()
  for (const week of mapped) {
    byStart.set(week.start, week)
  }
  return Array.from(byStart.values()).sort((a, b) => a.start.localeCompare(b.start))
}

function getLevelUpRewardsLines(payload) {
  const isOvernightOnly = String(payload?.registrationType || '').trim() === 'overnight-only'
  if (isOvernightOnly) {
    return [
      'New England Wushu Level Up points: 5,000 for each overnight full week enrollment.',
      'Points can be saved for prizes, equipment, and future discounts during the fall or spring season.',
    ]
  }
  return [
    'New England Wushu Level Up points: 2,500 for each full week enrollment, 500 for each full day, and 100 for each half day enrollment.',
    'Points can be saved for prizes, equipment, and future discounts during the fall or spring season.',
  ]
}

function getUpsellOfferLines(payload) {
  const camperCount = Math.max(1, Array.isArray(payload?.camperNames) ? payload.camperNames.length : 1)
  const totalPoints = camperCount * 2500
  const weekCount = normalizeCampWeeks(payload).length
  const offerLine =
    weekCount >= 3
      ? 'Loyalty family perk: add 2 more weeks and receive 20% OFF those added weeks.'
      : 'Registered-family perk: keep an additional $100 OFF even after the public discount date.'
  return [
    `${totalPoints.toLocaleString('en-US')} New England Wushu Level Up points are included when each camper is enrolled for a full week (${(2500).toLocaleString('en-US')} per camper full-week enrollment).`,
    'Points can be saved for prizes, equipment, and future discounts during the fall or spring season.',
    offerLine,
  ]
}

function buildRegistrationSummaryHtml(summaryLines) {
  const normalizedLines = Array.isArray(summaryLines) ? summaryLines : []
  const headerRows = []
  const camperRows = []
  const footerRows = []
  for (const rawLine of normalizedLines) {
    const line = String(rawLine || '').trim()
    if (!line) continue
    if (line.startsWith('Location:') || line.startsWith('Parent/Guardian:') || line.startsWith('Contact:') || line.startsWith('Payment method:')) {
      const [label, ...valueParts] = line.split(':')
      headerRows.push({ label, value: valueParts.join(':').trim() })
      continue
    }
    if (line.startsWith('Grand total:') || line.startsWith('Weekly reminders:')) {
      footerRows.push(line)
      continue
    }
    camperRows.push(line)
  }
  const headerHtml = headerRows.map((row) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#334155;width:180px;">${escapeHtml(row.label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(row.value)}</td>
        </tr>
      `).join('')
  const camperHtml = camperRows.map((line) => {
    const [name, details] = line.split(':')
    return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0f172a;width:180px;vertical-align:top;">${escapeHtml(name || 'Camper')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;">${escapeHtml(details || line)}</td>
        </tr>
      `
  }).join('')
  const footerHtml = footerRows.map((line) => {
    const emphasized = line.startsWith('Grand total:')
    return `<div style="padding:${emphasized ? '12px 14px' : '10px 14px'};border:${emphasized ? '1px solid #bfdbfe' : '1px solid #fde68a'};border-radius:12px;background:${emphasized ? '#eff6ff' : '#fffbeb'};color:#0f172a;margin-top:10px;">
        <strong style="color:${emphasized ? '#1d4ed8' : '#9a3412'};">${escapeHtml(line)}</strong>
      </div>`
  }).join('')
  return `
    <div style="margin:18px 0 0; padding:16px; border:1px solid #dbeafe; border-radius:16px; background:#f8fbff;">
      <p style="margin:0 0 12px; font-size:18px; font-weight:800; color:#0f172a;">Registration Summary</p>
      <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background:#ffffff;">
        <tbody>${headerHtml || '<tr><td style="padding:12px;color:#64748b;">Summary unavailable.</td></tr>'}</tbody>
      </table>
      ${
        camperHtml
          ? `<div style="margin-top:12px;">
              <p style="margin:0 0 8px; font-size:14px; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:0.04em;">Campers</p>
              <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background:#ffffff;">
                <tbody>${camperHtml}</tbody>
              </table>
            </div>`
          : ''
      }
      ${footerHtml}
    </div>
  `
}

function buildInfoCard({ title, accentColor, background, borderColor, bodyHtml }) {
  return `
    <div style="margin:16px 0 0;padding:14px 16px;border:1px solid ${borderColor};border-radius:16px;background:${background};">
      <p style="margin:0 0 8px;font-size:14px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:${accentColor};">${escapeHtml(title)}</p>
      <div style="margin:0;color:#0f172a;font-size:15px;line-height:1.6;">${bodyHtml}</div>
    </div>
  `
}

function buildPaymentMethodsHtml() {
  const rows = PAYMENT_METHODS_TEXT.split('\n').map((line) => {
    const [label, ...valueParts] = line.split(':')
    return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #fed7aa;font-weight:700;color:#7c2d12;width:140px;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #fed7aa;color:#0f172a !important;-webkit-text-fill-color:#0f172a;">${escapeHtml(valueParts.join(':').trim())}</td>
        </tr>
      `
  }).join('')
  return buildInfoCard({
    title: 'Payment Methods',
    accentColor: '#9a3412',
    background: 'linear-gradient(180deg,#fff7ed 0%,#ffedd5 100%)',
    borderColor: '#fdba74',
    bodyHtml: `<table style="width:100%;border-collapse:collapse;border:1px solid #fdba74;border-radius:12px;overflow:hidden;background:#fffefc;"><tbody>${rows}</tbody></table>`,
  })
}

function buildUpsellHtml(payload) {
  const lines = getUpsellOfferLines(payload)
  return buildInfoCard({
    title: 'Family Rewards',
    accentColor: '#166534',
    background: 'linear-gradient(180deg,#f0fdf4 0%,#dcfce7 100%)',
    borderColor: '#86efac',
    bodyHtml: `<ul style="margin:0;padding-left:18px;color:#14532d;">${lines.map((line) => `<li style="margin:0 0 6px;">${escapeHtml(line)}</li>`).join('')}</ul>`,
  })
}

function buildLevelUpHtml(payload) {
  const rewardLines = getLevelUpRewardsLines(payload)
  return buildInfoCard({
    title: 'New England Wushu Level Up Rewards',
    accentColor: '#b45309',
    background: 'linear-gradient(180deg,#fffdf4 0%,#fff7d6 100%)',
    borderColor: '#fcd34d',
    bodyHtml: `
      <p style="margin:0 0 10px;color:#7c2d12;">${escapeHtml(rewardLines[0])}</p>
      <p style="margin:0 0 10px;color:#7c2d12;">${escapeHtml(rewardLines[1])}</p>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #fde68a;color:#92400e;">
        <strong>Level Up app:</strong> Download opens June 20 for lunch access, daily photos and videos, progress updates, and instructor notes.
      </div>
    `,
  })
}

function buildReservationJourneyEmailHtml({
  heading,
  preview,
  bodyLines,
  summaryLines,
  amountDue,
  payload,
  ctaLabel = 'Complete Payment & Confirm Weeks',
  ctaHref = 'https://summer.newushu.com/register',
  showPaymentMethods = true,
  logoUrl = '',
  heroImageUrl = '',
}) {
  const normalizedBodyLines = Array.isArray(bodyLines) ? bodyLines.filter(Boolean) : []
  const { greetingHtml, sectionHtml } = renderNarrativeSections(normalizedBodyLines)
  const summaryHtml = buildRegistrationSummaryHtml(summaryLines)
  const amountDueHtml =
    Number.isFinite(Number(amountDue)) && Number(amountDue) > 0
      ? `<div style="margin:18px 0 0; padding:14px 16px; border:1px solid #fcd34d; border-radius:16px; background:linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%);">
        <p style="margin:0 0 6px; font-size:14px; font-weight:800; letter-spacing:0.04em; text-transform:uppercase; color:#92400e;">Amount Due</p>
        <p style="margin:0; font-size:28px; font-weight:900; color:#b45309;">${escapeHtml(formatCurrency(amountDue))}</p>
      </div>`
      : ''
  const paymentMethodsHtml = showPaymentMethods ? buildPaymentMethodsHtml() : ''
  const upsellHtml = buildUpsellHtml(payload)
  const levelUpHtml = buildLevelUpHtml(payload)
  return `
    <div style="margin:0;padding:20px;background:linear-gradient(180deg,#fff7ed 0%,#eff6ff 100%);color-scheme:light only;">
      <div style="max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #fde68a;border-radius:18px;overflow:hidden;box-shadow:0 20px 40px rgba(194,65,12,0.12);font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <div style="padding:15px 20px;background:linear-gradient(135deg,#f59e0b 0%,#f97316 36%,#0284c7 100%);color:#ffffff;">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(CAMP_NAME)}" style="display:block;max-height:52px;margin:0 0 10px;" />` : ''}
          <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:800;">${escapeHtml(CAMP_NAME)}</p>
          <p style="margin:6px 0 0;font-size:13px;opacity:0.95;">${escapeHtml(preview)}</p>
        </div>
        <div style="padding:22px 20px 14px;">
          <div style="padding:16px 18px;border:1px solid #fde68a;border-radius:20px;background:linear-gradient(180deg,#fffdf4 0%,#fff7d6 100%);">
            <h2 style="margin:0 0 10px;font-size:27px;line-height:1.2;color:#0f172a;">${escapeHtml(heading)}</h2>
            <p style="margin:0;font-size:15px;color:#7c2d12;">Important registration details, next steps, and family support in one place.</p>
          </div>
          ${
            heroImageUrl
              ? `<div style="margin:16px 0 0;border:1px solid #fde68a;border-radius:20px;overflow:hidden;background:#fff7ed;">
                  <img src="${escapeHtml(heroImageUrl)}" alt="${escapeHtml(CAMP_NAME)}" style="display:block;width:100%;max-height:260px;object-fit:cover;" />
                </div>`
              : ''
          }
          ${greetingHtml}
          <div>${sectionHtml}</div>
          <div style="margin:16px 0 0;padding:16px 18px;border:1px solid #bfdbfe;border-radius:18px;background:linear-gradient(180deg,#eff6ff 0%,#dbeafe 100%);">
            <a href="${escapeHtml(ctaHref)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#0284c7 0%,#2563eb 100%);color:#ffffff;text-decoration:none;font-weight:800;">
              ${escapeHtml(ctaLabel)}
            </a>
          </div>
          ${amountDueHtml}
          ${upsellHtml}
          ${levelUpHtml}
          ${summaryHtml}
          ${paymentMethodsHtml}
          <div style="margin:16px 0 0;padding:12px 14px;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px;">
            Reply to this email if you want help adding weeks, confirming payment, or adjusting the schedule.
          </div>
        </div>
      </div>
    </div>
  `
}

function buildReservationStepContent({ firstName, stepNumber, reservationDeadlineLabel, summaryLines, amountDue, payload }) {
  const isOvernightOnly = String(payload?.registrationType || '').trim() === 'overnight-only'
  if (isOvernightOnly) {
    const overnightLines = {
      1: [
        `Hi ${firstName},`,
        '',
        `Thank you for submitting your overnight camp registration. Your spot is held for 72 hours, and payment must be received by ${reservationDeadlineLabel} to keep the reservation active.`,
        Number(amountDue || 0) > 0 ? `Current amount due: ${formatCurrency(amountDue)}.` : '',
        '',
        'Overnight tuition covers lodging and food only.',
        'Each overnight full week also earns 5,000 New England Wushu Level Up points for prizes, equipment, and future fall or spring discounts.',
        'Outings and external activity costs are billed separately after registration.',
        '',
        'Please send payment using one of the methods below to confirm your week selection.',
      ],
      2: [
        `Hi ${firstName},`,
        '',
        'Quick overnight reminder: your selected weeks are still being held.',
        Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '',
        `Please complete payment before ${reservationDeadlineLabel} to avoid losing the hold.`,
      ],
      3: [
        `Hi ${firstName},`,
        '',
        'Priority overnight reminder: your registration is still unpaid.',
        Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '',
        `Payment is required before ${reservationDeadlineLabel} to keep your selected overnight weeks.`,
      ],
      4: [
        `Hi ${firstName},`,
        '',
        'Final overnight reminder for today.',
        Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '',
        `If payment is not received by ${reservationDeadlineLabel}, this registration will automatically cancel.`,
      ],
      5: [
        `Hi ${firstName},`,
        '',
        'Your overnight registration was automatically canceled because payment was not received within 72 hours.',
        '',
        'Your selected overnight weeks would have earned 5,000 New England Wushu Level Up points per full week for prizes, equipment, and future fall or spring discounts.',
        '',
        'Reply to this email if you want us to reopen the registration and restore the selected weeks when possible.',
      ],
    }
    return {
      heading: ({ 1: 'Overnight Registration Received - Payment Needed Within 72 Hours', 2: 'Overnight Reminder - Payment Keeps Your Weeks Reserved', 3: 'Important Overnight Reminder - Hold Still Pending Payment', 4: 'Final Overnight Notice - Auto-Cancel Today if Unpaid', 5: 'Overnight Registration Canceled (Unpaid)' })[stepNumber] || 'Overnight Registration Update',
      subject: ({ 1: 'Overnight Camp Registration Received - Submit Payment Within 72 Hours', 2: 'Overnight Camp Reminder - Complete Payment to Keep Your Weeks', 3: 'Important: Overnight Camp Hold Still Waiting for Payment', 4: 'Final Notice: Overnight Registration Auto-Cancels Today if Unpaid', 5: 'Overnight Registration Canceled (Unpaid)' })[stepNumber] || 'Overnight Camp Registration Update',
      bodyLines: (overnightLines[stepNumber] || overnightLines[1]).filter(Boolean),
      bodyText: [...(overnightLines[stepNumber] || overnightLines[1]).filter(Boolean), '', 'Payment Methods:', PAYMENT_METHODS_TEXT, '', 'Registration Summary:', ...(summaryLines || [])].join('\n'),
      preview: 'Overnight camp registration follow-up',
    }
  }
  const headings = {
    1: '[Action Needed] Your Camp Spot Is Reserved for 72 Hours',
    2: 'Friendly Evening Reminder: Keep Your Camp Spot Active',
    3: 'Priority Reminder: Payment Keeps Your Preferred Weeks Locked',
    4: 'Final Day Reminder: Payment Needed Before Auto-Cancel',
    5: 'Reservation Auto-Canceled - Reopen Your Spot Anytime',
  }
  const subjects = {
    1: '[Action Needed] 72-Hour Camp Spot Hold - Complete Payment to Confirm',
    2: 'Evening Reminder: Complete Payment to Keep Your Camp Reservation',
    3: 'Important Reminder: Keep Your Summer Camp Weeks Locked In',
    4: 'Final Notice Today: Reservation Auto-Cancels Without Payment',
    5: 'Reservation Canceled (Unpaid) - Reply to Reopen Quickly',
  }
  const lines = {
    1: [`Hi ${firstName},`, '', `Thank you for submitting your ${CAMP_NAME} registration. Your reservation is now active for 72 hours and will auto-cancel if payment is not received by ${reservationDeadlineLabel}.`, Number(amountDue || 0) > 0 ? `Amount due now: ${formatCurrency(amountDue)}` : '', '', 'We are excited to support your camper this summer with structured skill progression, confidence-building, and team-based growth.', '', 'Please send payment using one of the methods below to secure your spot.'],
    2: [`Hi ${firstName},`, '', 'Quick evening reminder: your reservation is still on hold and ready to be confirmed.', '', Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '', '', `Complete payment before ${reservationDeadlineLabel} to keep your selected camp weeks.`, '', 'We would love to welcome your family this season and help your camper build momentum early.'],
    3: [`Hi ${firstName},`, '', 'Your registration is still reserved, and we want to make sure you keep your preferred schedule.', '', Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '', '', `Please complete payment before ${reservationDeadlineLabel} to avoid losing your hold.`, '', 'Our coaching team is ready, and this is a strong time to lock in summer training consistency.'],
    4: [`Hi ${firstName},`, '', 'Final day reminder: your reservation is approaching auto-cancel for unpaid status.', '', Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '', '', `Payment must be received by ${reservationDeadlineLabel} to keep this registration active.`, '', 'If you need help, simply reply and our team will assist right away.'],
    5: [`Hi ${firstName},`, '', 'Your reservation was automatically canceled because payment was not received within 72 hours.', '', Number(amountDue || 0) > 0 ? `Unpaid amount at cancellation: ${formatCurrency(amountDue)}.` : '', '', 'You can still reopen your registration quickly by replying to this email or submitting again.', '', 'We would still be happy to support your camper this summer.'],
  }
  const bodyLines = (lines[stepNumber] || []).filter(Boolean)
  const bodyText = [...bodyLines, '', 'Family rewards:', ...getUpsellOfferLines(payload), '', ...getLevelUpRewardsLines(payload), '', 'Level Up app:', 'Download opens June 20 for lunch booking, progress photos/videos, and instructor notes.', '', 'Payment Methods:', PAYMENT_METHODS_TEXT, '', 'Registration Summary:', ...(summaryLines || [])].join('\n')
  return { heading: headings[stepNumber] || headings[1], subject: subjects[stepNumber] || subjects[1], bodyLines, bodyText, preview: `${CAMP_NAME} reservation follow-up` }
}

function buildPaidPrepContent({ firstName, stage, payload }) {
  const camperNames = Array.isArray(payload?.camperNames) ? payload.camperNames : []
  const camperLabel = camperNames.length > 0 ? camperNames.join(', ') : 'your camper'
  const firstWeek = normalizeCampWeeks(payload)[0]
  const firstWeekLabel = firstWeek?.start || 'your selected week'
  const commonClose = ['', 'If your camper wants to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.', '', 'Need help adding weeks or adjusting schedule? Reply and we will handle it for you quickly.']
  const stageMap = {
    sevenDay: {
      heading: '7-Day Countdown - Camp Preparation Snapshot',
      subject: '7 Days Before Camp: Preparation Checklist + Bonus Week Offers',
      preview: `${CAMP_NAME} 7-day preparation`,
      ctaLabel: 'View Schedule & Add Weeks',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [`Hi ${firstName},`, '', `Great news - ${camperLabel} is officially registered for ${CAMP_NAME}, and your first selected week starts ${firstWeekLabel}.`, 'Camp begins next week. Here is your preparation snapshot plus your family add-weeks offer:', ...commonClose],
    },
    fiveDay: {
      heading: '5-Day Reminder - Keep Building Summer Momentum',
      subject: '5 Days Before Camp: Final Logistics + Extra Week Invitation',
      preview: `${CAMP_NAME} 5-day preparation`,
      ctaLabel: 'Review Prep + Add Weeks',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [`Hi ${firstName},`, '', 'Your camp week is coming up fast. A few key reminders for a smooth start:', '- Label water bottle, athletic shoes, and comfortable training clothing.', '- Wednesday: bring a change of clothes for Water Wednesday activities.', '- Thursday: BBQ lunch is included (optional to pack your own).', '- Friday: family performance showcase day at 4:00 PM.', '', ...commonClose],
    },
    threeDay: {
      heading: '3-Day Reminder - Final What-To-Prepare Checklist',
      subject: '3 Days Before Camp: Final Packing + Arrival Checklist',
      preview: `${CAMP_NAME} 3-day preparation`,
      ctaLabel: 'Open Family Checklist',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [`Hi ${firstName},`, '', 'Three-day reminder before your camp week begins:', '- Confirm drop-off / pick-up timing in your family plan.', '- Pack daily essentials and Thursday backup lunch only if preferred.', '- Keep Wednesday change-of-clothes ready.', '- Friday showcase runs at 4:00 PM for family attendance.', '', ...commonClose],
    },
    oneDay: {
      heading: '1-Day Reminder - See You Tomorrow',
      subject: 'Camp Starts Tomorrow: Arrival Reminder + Final Checklist',
      preview: `${CAMP_NAME} 1-day preparation`,
      ctaLabel: 'Open Family Checklist',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [`Hi ${firstName},`, '', 'Camp starts tomorrow. Final reminder before arrival:', '- Double-check drop-off and pickup timing.', '- Pack training clothes, water bottle, and any needed medication info.', '- Keep your Wednesday clothes change and Friday showcase timing in mind.', '', ...commonClose],
    },
  }
  return stageMap[stage?.id] || stageMap.sevenDay
}

function getReservationPreviewPayload() {
  return {
    registrationType: '',
    guardianName: 'Calvin Chen',
    camperNames: ['Ethan Chen'],
    location: 'Burlington',
    paymentMethod: 'Zelle',
    amountDue: 1680,
    campWeeks: [
      { start: '2026-07-07', end: '2026-07-11' },
      { start: '2026-07-14', end: '2026-07-18' },
    ],
    summaryLines: [
      'Location: Burlington',
      'Parent/Guardian: Calvin Chen',
      'Contact: calvin@example.com',
      'Payment method: Zelle',
      'Ethan Chen: General Camp, Jul 7-11, Jul 14-18, Lunch Mon/Wed/Fri',
      'Grand total: $1,680.00',
      'Weekly reminders: Water Wednesday, BBQ Thursday, Friday showcase 4:00 PM',
    ],
  }
}

function getReservationPreviewDeadlineLabel() {
  return 'May 20, 5:00 PM EDT'
}

export function buildReservationJourneyMessage({
  stepNumber,
  logoUrl = '',
  landingCarouselImageUrls = [],
  payload = getReservationPreviewPayload(),
  ctaHref = 'https://summer.newushu.com/register',
}) {
  const safeStepNumber = Number(stepNumber || 1)
  const firstName = 'Calvin'
  const summaryLines = Array.isArray(payload?.summaryLines) ? payload.summaryLines : []
  if (safeStepNumber >= 6) {
    const stageIds = ['sevenDay', 'fiveDay', 'threeDay', 'oneDay']
    const stage = { id: stageIds[safeStepNumber - 6] || 'sevenDay' }
    const content = buildPaidPrepContent({ firstName, stage, payload })
    const bodyText = content.lines.join('\n')
    const html = buildReservationJourneyEmailHtml({
      heading: content.heading,
      preview: content.preview,
      bodyLines: content.lines,
      summaryLines,
      amountDue: 0,
      payload,
      ctaLabel: content.ctaLabel,
      ctaHref: content.ctaHref,
      showPaymentMethods: false,
      logoUrl,
      heroImageUrl: pickJourneyImage(landingCarouselImageUrls, safeStepNumber - 6),
    })
    return { subject: content.subject, bodyText, html }
  }
  const amountDue = Number(payload?.amountDue || 0)
  const content = buildReservationStepContent({
    firstName,
    stepNumber: safeStepNumber,
    reservationDeadlineLabel: getReservationPreviewDeadlineLabel(),
    summaryLines,
    amountDue,
    payload,
  })
  const html = buildReservationJourneyEmailHtml({
    heading: content.heading,
    preview: content.preview,
    bodyLines: content.bodyLines,
    summaryLines,
    amountDue,
    payload,
    ctaLabel: 'Review Payment Options & Summary',
    ctaHref,
    showPaymentMethods: true,
    logoUrl,
    heroImageUrl: pickJourneyImage(landingCarouselImageUrls, safeStepNumber - 1),
  })
  return { subject: content.subject, bodyText: content.bodyText, html }
}
