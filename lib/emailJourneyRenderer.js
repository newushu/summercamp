const CAMP_NAME = 'New England Wushu Summer Camp'

export const PAYMENT_METHODS_TEXT = [
  'Zelle: wushu688@gmail.com (name: Xiaoyi Chen, head coach)',
  'Venmo: @newushu (Calvin newushu, head coach at New England Wushu)',
  'Venmo note: please use Friends & Family to avoid fees. If you choose Goods & Services, add 3.5%.',
  'Cash: exact change only; hand payment directly to Calvin or Xiaoyi Chen.',
  'Check (payable to Newushu): 123 Muller Rd',
].join('\n')

export function calculateVenmoGoodsServicesTotal(amount) {
  const baseAmount = Number(amount || 0)
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    return 0
  }
  return Math.round(baseAmount * 1.035 * 100) / 100
}

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

function buildTrustBarHtml() {
  const items = [
    '&#10003; Expert coaching staff',
    '&#10003; Safe, structured environment',
    '&#10003; 15+ years of excellence',
    '&#10003; Burlington · Acton · Wellesley',
  ]
  return `
    <div style="margin:16px 0 0;padding:12px 16px;background:#f8fbff;border:1px solid #dbeafe;border-radius:14px;display:flex;flex-wrap:wrap;gap:10px;">
      ${items.map((item) => `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#1d4ed8;letter-spacing:0.01em;">${item}</span>`).join('')}
    </div>
  `
}

function buildEmailFooterHtml({ showReply = true } = {}) {
  return `
    <div style="margin:24px 0 0;padding:18px 20px;border-top:2px solid #e2e8f0;background:#f8fbff;">
      ${showReply ? `<p style="margin:0 0 10px;font-size:14px;color:#334155;line-height:1.6;">Questions? Simply <strong>reply to this email</strong> — our team responds quickly. We are happy to help with week adjustments, payment, scheduling, or any questions about your camper&#39;s program.</p>` : ''}
      <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
        <strong style="color:#0f172a;">New England Wushu Summer Camp</strong><br />
        Burlington · Acton · Wellesley, MA<br />
        <a href="https://summer.newushu.com" style="color:#2563eb;text-decoration:none;">summer.newushu.com</a>
      </p>
    </div>
  `
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
  const trustBarHtml = buildTrustBarHtml()
  const footerHtml = buildEmailFooterHtml({ showReply: true })
  return `
    <div style="margin:0;padding:20px;background:linear-gradient(180deg,#fff7ed 0%,#eff6ff 100%);">
      <div style="max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #fde68a;border-radius:22px;overflow:hidden;box-shadow:0 24px 60px rgba(194,65,12,0.14);font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <div style="padding:22px 24px 18px;background:linear-gradient(135deg,#ea580c 0%,#f59e0b 40%,#0284c7 100%);color:#ffffff;">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(CAMP_NAME)}" style="display:block;max-height:56px;margin:0 0 12px;" />` : ''}
          <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:900;opacity:0.85;">${escapeHtml(CAMP_NAME)}</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:900;line-height:1.2;letter-spacing:-0.01em;">Excellence in Martial Arts Education</p>
          <p style="margin:8px 0 0;font-size:13px;opacity:0.9;font-weight:600;">${escapeHtml(preview)}</p>
        </div>
        <div style="padding:26px 24px 20px;">
          <div style="padding:20px 22px;border:2px solid #fde68a;border-radius:20px;background:linear-gradient(180deg,#fffdf4 0%,#fff7d6 100%);box-shadow:0 8px 24px rgba(234,88,12,0.07);">
            <h2 style="margin:0 0 10px;font-size:28px;line-height:1.2;color:#0f172a;font-weight:900;">${escapeHtml(heading)}</h2>
            <p style="margin:0;font-size:15px;color:#7c2d12;font-weight:600;">Personalized camp guidance and next steps for your family.</p>
          </div>
          ${trustBarHtml}
          ${
            heroImageUrl
              ? `<div style="margin:16px 0 0;border:1px solid #fde68a;border-radius:20px;overflow:hidden;background:#fff7ed;">
                  <img src="${escapeHtml(heroImageUrl)}" alt="${escapeHtml(CAMP_NAME)}" style="display:block;width:100%;max-height:260px;object-fit:cover;" />
                </div>`
              : ''
          }
          ${
            recommendation
              ? `<div style="margin:16px 0 0;padding:18px 20px;border:2px solid #86efac;border-radius:18px;background:linear-gradient(180deg,#f7fff9 0%,#ecfdf5 100%);box-shadow:0 10px 24px rgba(15,23,42,0.04);">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;color:#166534;">&#10003; Recommended Program Fit</p>
                  <p style="margin:0;font-size:17px;color:#14532d;font-weight:700;">${escapeHtml(recommendation)}</p>
                </div>`
              : ''
          }
          ${videoHtml}
          ${greetingHtml}
          ${sectionHtml}
          <div style="margin:20px 0 0;padding:20px 22px;border:2px solid #0284c7;border-radius:18px;background:linear-gradient(135deg,#0284c7 0%,#2563eb 100%);text-align:center;box-shadow:0 12px 32px rgba(2,132,199,0.28);">
            <a href="${escapeHtml(ctaLink)}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#ffffff;color:#1d4ed8;text-decoration:none;font-weight:900;font-size:16px;letter-spacing:0.01em;box-shadow:0 4px 16px rgba(15,23,42,0.14);">
              Reserve Your Camp Weeks &#8594;
            </a>
            <p style="margin:10px 0 0;font-size:12px;color:rgba(255,255,255,0.85);font-weight:600;">Limited spots available · Burlington · Acton · Wellesley</p>
          </div>
          ${renderCard({
            title: 'What Makes New England Wushu Different',
            tone: 'green',
            bodyHtml: renderPills(['Expert instruction', 'Safe team culture', 'Visible measurable progress', 'Fun structured daily rhythm', 'Competition pathways'], 'green'),
          })}
          ${renderCard({
            title: 'New England Wushu Level Up Rewards',
            tone: 'summer',
            bodyHtml: buildLevelUpRewardsBodyHtml(),
          })}
          ${renderCard({
            title: 'Level Up App',
            tone: 'blue',
            bodyHtml: '<p style="margin:0;">Download opens June 20. Access daily photos and videos, instructor notes, progress updates, and lunch booking — all in one place for families.</p>',
          })}
          ${footerHtml}
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

function buildPaymentMethodsHtml(amountDue = 0) {
  const rows = PAYMENT_METHODS_TEXT.split('\n').map((line) => {
    const [label, ...valueParts] = line.split(':')
    return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #fed7aa;font-weight:700;color:#7c2d12;width:140px;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #fed7aa;color:#0f172a !important;-webkit-text-fill-color:#0f172a;">${escapeHtml(valueParts.join(':').trim())}</td>
        </tr>
      `
  }).join('')
  const goodsServicesTotal = calculateVenmoGoodsServicesTotal(amountDue)
  return buildInfoCard({
    title: 'Payment Methods',
    accentColor: '#9a3412',
    background: 'linear-gradient(180deg,#fff7ed 0%,#ffedd5 100%)',
    borderColor: '#fdba74',
    bodyHtml: `
      <table style="width:100%;border-collapse:collapse;border:1px solid #fdba74;border-radius:12px;overflow:hidden;background:#fffefc;"><tbody>${rows}</tbody></table>
      ${
        goodsServicesTotal > 0
          ? `<div style="margin-top:10px;padding:10px 12px;border:1px solid #fdba74;border-radius:12px;background:#fff7ed;color:#9a3412;">
              Venmo Goods &amp; Services total: <strong>${escapeHtml(formatCurrency(goodsServicesTotal))}</strong>
            </div>`
          : ''
      }
    `,
  })
}

function buildUpsellHtml(payload) {
  const lines = getUpsellOfferLines(payload)
  return buildInfoCard({
    title: '&#127881; Registered-Family Perks',
    accentColor: '#166534',
    background: 'linear-gradient(180deg,#f0fdf4 0%,#dcfce7 100%)',
    borderColor: '#86efac',
    bodyHtml: `<ul style="margin:0;padding-left:18px;color:#14532d;">${lines.map((line) => `<li style="margin:0 0 8px;font-size:15px;line-height:1.6;">${escapeHtml(line)}</li>`).join('')}</ul>`,
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
  const paymentMethodsHtml = showPaymentMethods ? buildPaymentMethodsHtml(amountDue) : ''
  const upsellHtml = buildUpsellHtml(payload)
  const levelUpHtml = buildLevelUpHtml(payload)
  const trustBarHtml = buildTrustBarHtml()
  const footerHtml = buildEmailFooterHtml({ showReply: true })
  return `
    <div style="margin:0;padding:20px;background:linear-gradient(180deg,#fff7ed 0%,#eff6ff 100%);color-scheme:light only;">
      <div style="max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #fde68a;border-radius:22px;overflow:hidden;box-shadow:0 24px 60px rgba(194,65,12,0.14);font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <div style="padding:22px 24px 18px;background:linear-gradient(135deg,#ea580c 0%,#f59e0b 40%,#0284c7 100%);color:#ffffff;">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(CAMP_NAME)}" style="display:block;max-height:56px;margin:0 0 12px;" />` : ''}
          <p style="margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:900;opacity:0.85;">${escapeHtml(CAMP_NAME)}</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:900;line-height:1.2;letter-spacing:-0.01em;">Excellence in Martial Arts Education</p>
          <p style="margin:8px 0 0;font-size:13px;opacity:0.9;font-weight:600;">${escapeHtml(preview)}</p>
        </div>
        <div style="padding:26px 24px 20px;">
          <div style="padding:20px 22px;border:2px solid #fde68a;border-radius:20px;background:linear-gradient(180deg,#fffdf4 0%,#fff7d6 100%);box-shadow:0 8px 24px rgba(234,88,12,0.07);">
            <h2 style="margin:0 0 10px;font-size:28px;line-height:1.2;color:#0f172a;font-weight:900;">${escapeHtml(heading)}</h2>
            <p style="margin:0;font-size:15px;color:#7c2d12;font-weight:600;">Registration details, next steps, and family support — all in one place.</p>
          </div>
          ${trustBarHtml}
          ${
            heroImageUrl
              ? `<div style="margin:16px 0 0;border:1px solid #fde68a;border-radius:20px;overflow:hidden;background:#fff7ed;">
                  <img src="${escapeHtml(heroImageUrl)}" alt="${escapeHtml(CAMP_NAME)}" style="display:block;width:100%;max-height:260px;object-fit:cover;" />
                </div>`
              : ''
          }
          ${greetingHtml}
          <div>${sectionHtml}</div>
          ${amountDueHtml}
          <div style="margin:20px 0 0;padding:20px 22px;border:2px solid #0284c7;border-radius:18px;background:linear-gradient(135deg,#0284c7 0%,#2563eb 100%);text-align:center;box-shadow:0 12px 32px rgba(2,132,199,0.28);">
            <a href="${escapeHtml(ctaHref)}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#ffffff;color:#1d4ed8;text-decoration:none;font-weight:900;font-size:16px;letter-spacing:0.01em;box-shadow:0 4px 16px rgba(15,23,42,0.14);">
              ${escapeHtml(ctaLabel)} &#8594;
            </a>
            <p style="margin:10px 0 0;font-size:12px;color:rgba(255,255,255,0.85);font-weight:600;">Secure your weeks · Confirm your family&#39;s spot</p>
          </div>
          ${upsellHtml}
          ${levelUpHtml}
          ${summaryHtml}
          ${paymentMethodsHtml}
          ${footerHtml}
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
        `Your overnight camp registration has been received and your weeks are held for 72 hours. To confirm your spot, payment must be received by ${reservationDeadlineLabel}.`,
        Number(amountDue || 0) > 0 ? `Amount due to confirm: ${formatCurrency(amountDue)}.` : '',
        '',
        'Overnight tuition covers lodging and meals. Each overnight full week earns 5,000 New England Wushu Level Up points — redeemable for prizes, equipment, and future fall or spring discounts.',
        '',
        'Note: outings and external activity fees are invoiced separately after the registration period.',
        '',
        'Please send payment using one of the methods below to lock in your overnight weeks.',
      ],
      2: [
        `Hi ${firstName},`,
        '',
        'Quick overnight reminder: your selected weeks are still being held, but the 72-hour window is closing.',
        Number(amountDue || 0) > 0 ? `Outstanding amount: ${formatCurrency(amountDue)}.` : '',
        `Please complete payment before ${reservationDeadlineLabel} to secure your overnight spot.`,
        '',
        'Reply to this email if you have any questions — we are happy to help.',
      ],
      3: [
        `Hi ${firstName},`,
        '',
        'Your overnight registration hold is still active — but the deadline is approaching.',
        Number(amountDue || 0) > 0 ? `Balance due: ${formatCurrency(amountDue)}.` : '',
        `Payment must be received before ${reservationDeadlineLabel} to keep your selected overnight weeks.`,
        '',
        'If anything is blocking you, simply reply and we will resolve it quickly for your family.',
      ],
      4: [
        `Hi ${firstName},`,
        '',
        'This is the final notice before your overnight registration auto-cancels today.',
        Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '',
        `Payment must be received by ${reservationDeadlineLabel}. After this deadline, held overnight weeks are released back to the waitlist.`,
        '',
        'Reply right now if you need help — we will respond immediately.',
      ],
      5: [
        `Hi ${firstName},`,
        '',
        'Your overnight registration was automatically canceled because payment was not received within the 72-hour hold window.',
        '',
        Number(amountDue || 0) > 0 ? `The unpaid amount at cancellation was ${formatCurrency(amountDue)}.` : '',
        'Each overnight full week would have earned 5,000 New England Wushu Level Up points for prizes, equipment, and future fall or spring discounts.',
        '',
        'We would still love to have your family join us this summer. Reply to this email and we will check current overnight availability and work to restore your original schedule.',
      ],
    }
    return {
      heading: ({
        1: 'Overnight Registration Confirmed — Payment Required Within 72 Hours',
        2: 'Overnight Reminder: Your Weeks Are Still On Hold',
        3: 'Priority Overnight Notice: Deadline Approaching',
        4: 'Final Notice: Overnight Registration Auto-Cancels Today',
        5: 'Overnight Registration Canceled — Reply to Reopen',
      })[stepNumber] || 'Overnight Registration Update',
      subject: ({
        1: 'Overnight Camp Confirmed — Complete Payment Within 72 Hours to Secure Your Spot',
        2: 'Overnight Camp Reminder: Complete Payment to Keep Your Weeks',
        3: 'Important: Overnight Camp Hold Expires Soon — Action Required',
        4: 'Final Notice: Overnight Registration Auto-Cancels Today Without Payment',
        5: 'Overnight Registration Canceled — Here is How to Reopen Your Spot',
      })[stepNumber] || 'Overnight Camp Registration Update',
      bodyLines: (overnightLines[stepNumber] || overnightLines[1]).filter(Boolean),
      bodyText: [...(overnightLines[stepNumber] || overnightLines[1]).filter(Boolean), '', 'Payment Methods:', PAYMENT_METHODS_TEXT, '', 'Registration Summary:', ...(summaryLines || [])].join('\n'),
      preview: 'Overnight camp registration follow-up',
    }
  }
  const headings = {
    1: 'Your Registration is Confirmed — Payment Secures Your Spot',
    2: 'Evening Reminder: Your Camp Weeks Are Still Waiting',
    3: 'Priority Reminder: Keep Your Preferred Schedule Locked In',
    4: 'Final Notice: Your Reservation Auto-Cancels Today',
    5: 'Your Reservation Was Canceled — Here is How to Reopen It',
  }
  const subjects = {
    1: 'Registration Confirmed — Complete Payment Within 72 Hours to Secure Your Spot',
    2: 'Reminder: Your Camp Reservation Is Still Active — Complete Payment Tonight',
    3: 'Important: Keep Your Summer Camp Weeks — Payment Deadline Approaching',
    4: 'Final Notice: Reservation Auto-Cancels Today Without Payment',
    5: 'Reservation Canceled — Reply Now to Reopen Your Spot in Minutes',
  }
  const lines = {
    1: [
      `Hi ${firstName},`,
      '',
      `We are thrilled you submitted your ${CAMP_NAME} registration! Your weeks are now reserved and held exclusively for your family for the next 72 hours.`,
      Number(amountDue || 0) > 0 ? `To confirm your spot, please complete payment of ${formatCurrency(amountDue)} using one of the methods listed below before ${reservationDeadlineLabel}.` : `Please complete payment before ${reservationDeadlineLabel} to confirm your spot.`,
      '',
      'This summer your camper will build real skills, train alongside motivated peers, and gain confidence through structured daily progression. Our coaching team brings decades of combined experience — and genuine care for every athlete we work with.',
      '',
      'Spots fill quickly each season. Completing payment today locks in your chosen weeks and guarantees your place in the program.',
    ],
    2: [
      `Hi ${firstName},`,
      '',
      'Just a quick friendly reminder: your camp reservation is still active and your weeks are being held for you.',
      '',
      Number(amountDue || 0) > 0 ? `Outstanding balance: ${formatCurrency(amountDue)}. Complete payment before ${reservationDeadlineLabel} to keep your reservation.` : `Please complete payment before ${reservationDeadlineLabel} to keep your reservation.`,
      '',
      'Families who register early tend to have the smoothest summer — schedules aligned, weeks locked, peace of mind secured. We would love to count your camper in this season.',
    ],
    3: [
      `Hi ${firstName},`,
      '',
      'Your registration is still reserved — and we want to make sure your family keeps the weeks you chose.',
      '',
      Number(amountDue || 0) > 0 ? `Your current balance is ${formatCurrency(amountDue)}. Payment is required before ${reservationDeadlineLabel} to maintain your hold.` : `Please complete payment before ${reservationDeadlineLabel} to maintain your hold.`,
      '',
      'Our program is structured to build real progress week over week. The more consecutive weeks a camper trains, the deeper the skill foundation they build — and the more confidence they carry into the fall season.',
      '',
      'If anything is blocking you, simply reply and we will work through it together quickly.',
    ],
    4: [
      `Hi ${firstName},`,
      '',
      'This is the final reminder before your reservation auto-cancels.',
      '',
      Number(amountDue || 0) > 0 ? `Balance due: ${formatCurrency(amountDue)}. Payment must be received before ${reservationDeadlineLabel} to keep your selected weeks.` : `Payment must be received before ${reservationDeadlineLabel} to keep your selected weeks.`,
      '',
      'If you need help with payment or have questions about the schedule, please reply right now — our team responds quickly and we want to make it work for your family.',
      '',
      'After the deadline, held weeks are released back to the public waitlist.',
    ],
    5: [
      `Hi ${firstName},`,
      '',
      'Your reservation was automatically canceled because payment was not received within the 72-hour hold window.',
      '',
      Number(amountDue || 0) > 0 ? `The unpaid balance at cancellation was ${formatCurrency(amountDue)}.` : '',
      '',
      'We understand life gets busy — and we still want to support your camper this summer. Your spot can often be reopened quickly.',
      '',
      'Reply to this email and we will check current week availability for you right away. Many families who reopen see no change to their original schedule.',
    ],
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
  const commonClose = [
    '',
    'Important: if your camper wants to join Competition Team in the fall, they must complete 3 weeks of Competition Team Boot Camp this summer. This is the required pathway.',
    '',
    'Want to add more weeks or adjust the schedule? Reply anytime — we will take care of it for you right away.',
  ]
  const stageMap = {
    sevenDay: {
      heading: `One Week Out — ${camperLabel} Is Ready. Are You?`,
      subject: `7 Days to Camp: Final Prep Snapshot + Add-Weeks Offer for ${camperLabel}`,
      preview: `${CAMP_NAME} — your 7-day countdown`,
      ctaLabel: 'View Schedule & Add More Weeks',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [
        `Hi ${firstName},`,
        '',
        `The countdown is on — ${camperLabel} begins ${CAMP_NAME} on ${firstWeekLabel}. You are all set. This is your one-week preparation snapshot plus your exclusive registered-family add-weeks offer.`,
        '',
        'What to bring every day: athletic training clothes, water bottle (labeled), and a positive mindset. Water Wednesdays require an extra change of clothes. Thursday BBQ lunch is provided. Friday 4:00 PM showcase is open to all families.',
        '',
        'This week is a great time to add additional camp weeks at your registered-family rate before spots fill for the rest of the summer.',
        ...commonClose,
      ],
    },
    fiveDay: {
      heading: 'Five Days Out — Smooth Start Checklist',
      subject: `5 Days to Camp: Logistics Checklist + Add a Week Before Spots Fill`,
      preview: `${CAMP_NAME} — 5-day preparation`,
      ctaLabel: 'Review Logistics + Add Weeks',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [
        `Hi ${firstName},`,
        '',
        `Camp starts in 5 days for ${camperLabel}. Here is everything you need for a smooth first morning:`,
        '- Athletic training clothes and a labeled water bottle every day.',
        '- Wednesday: pack an extra change of clothes for Water Wednesday activities.',
        '- Thursday: BBQ lunch is on us — no need to pack.',
        '- Friday: plan to attend the 4:00 PM family performance showcase.',
        '',
        'Drop-off and pickup timing is detailed in your registration confirmation. If you have any questions about arrival, reply to this email and we will confirm for you.',
        ...commonClose,
      ],
    },
    threeDay: {
      heading: 'Three Days Out — Final Packing List',
      subject: `3 Days to Camp: Final Packing + Arrival Details for ${camperLabel}`,
      preview: `${CAMP_NAME} — 3-day preparation`,
      ctaLabel: 'Open Arrival Details',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [
        `Hi ${firstName},`,
        '',
        `Three days until ${camperLabel} walks through the door. Final quick checklist:`,
        '- Training clothes and water bottle (labeled) ready for each day.',
        '- Wednesday extra change of clothes packed and ready.',
        '- Thursday: BBQ is provided — no lunch prep needed.',
        '- Friday showcase at 4:00 PM — families are welcome and encouraged.',
        '',
        'If you need to confirm arrival location, drop-off time, or anything else, just reply. We are happy to help.',
        ...commonClose,
      ],
    },
    oneDay: {
      heading: 'Tomorrow is the Day — See You at Camp',
      subject: `Camp Starts Tomorrow: Final Arrival Reminder for ${camperLabel}`,
      preview: `${CAMP_NAME} — see you tomorrow`,
      ctaLabel: 'View Arrival Details',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [
        `Hi ${firstName},`,
        '',
        `Camp starts tomorrow for ${camperLabel} — the whole team is excited and ready.`,
        '',
        'Last-minute checklist: training clothes, labeled water bottle, Wednesday change of clothes if applicable, and a note of any arrival logistics to keep the morning smooth.',
        '',
        'Friday at 4:00 PM is the family showcase — mark your calendar. It is one of the highlights of each week.',
        '',
        'We cannot wait to get started. See you tomorrow.',
        ...commonClose,
      ],
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
