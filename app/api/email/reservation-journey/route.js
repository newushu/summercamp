import { supabaseServer, supabaseServerEnabled } from '../../../../lib/supabaseServer'
import { sendWithSes } from '../../../../lib/emailProvider'
import { buildPaymentPageHref } from '../../../../lib/paymentPageLink'
import { buildPaymentSummaryPdfBase64 } from '../../../../lib/paymentSummaryPdf'
import { buildProgramWeekOptions, defaultAdminConfig, mergeAdminConfig } from '../../../../lib/campAdmin'
import { buildRegistrationSummarySnapshot } from '../../../../lib/registrationSummaryDocument'

const CAMP_NAME = 'New England Wushu Summer Camp'
const PAYMENT_METHODS_TEXT = [
  'Zelle: wushu688@gmail.com (name: Xiaoyi Chen, head coach)',
  'Venmo: @newushu (Calvin newushu, head coach at New England Wushu)',
  'Venmo note: please use Friends & Family to avoid fees. If you choose Goods & Services, add 3.5%.',
  'Cash: exact change only; hand payment directly to Calvin or Xiaoyi Chen.',
  'Check (payable to Newushu): 123 Muller Rd',
].join('\n')
const SHOULD_ATTACH_RESERVATION_PDF =
  String(process.env.RESERVATION_EMAIL_ATTACH_PDF || 'true').trim().toLowerCase() !== 'false'

function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim())
}

function isTestJourneyStatus(status = '') {
  return String(status || '').startsWith('test_')
}

function parseMaybeJson(value, fallback = {}) {
  if (!value) {
    return fallback
  }
  if (typeof value === 'object') {
    return value
  }
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function normalizeDateKey(value) {
  const raw = String(value || '').trim()
  if (!raw) {
    return ''
  }
  const sliced = raw.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(sliced)) {
    return sliced
  }
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  return parsed.toISOString().slice(0, 10)
}

function isLimitedDiscountActiveForDate(discountEndDate, createdAt) {
  const endRaw = normalizeDateKey(discountEndDate)
  const createdRaw = normalizeDateKey(createdAt)
  if (!endRaw || !createdRaw) {
    return false
  }
  return createdRaw <= endRaw
}

function splitFirstName(fullName) {
  const safe = String(fullName || '').trim()
  if (!safe) {
    return 'there'
  }
  return safe.split(/\s+/)[0] || 'there'
}

function escapeHtml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeImageUrls(value) {
  return (Array.isArray(value) ? value : []).map((item) => String(item || '').trim()).filter(Boolean)
}

function pickJourneyImage(imageUrls, seedNumber = 0) {
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

function renderBulletList(items, tone = 'neutral') {
  const colors = getToneColors(tone)
  return `
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${items
        .map((item) => `<span style="display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;border:1px solid ${colors.border};background:rgba(255,255,255,0.75);color:${colors.text};font-weight:700;">${escapeHtml(item)}</span>`)
        .join('')}
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

function formatWeekRangeLabel(start, end) {
  const startDate = parseDateOnly(start)
  const endDate = parseDateOnly(end)
  if (!startDate || !endDate) {
    return String(start || '').trim() || String(end || '').trim() || 'Week selected'
  }
  const startLabel = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${startLabel} - ${endLabel}`
}

function calculateVenmoGoodsServicesTotal(amount) {
  const baseAmount = Number(amount || 0)
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    return 0
  }
  return Math.round(baseAmount * 1.035 * 100) / 100
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

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function _getLevelUpAppLaunchDate() {
  const configured = parseDateOnly(process.env.LEVEL_UP_APP_LAUNCH_DATE)
  if (configured) {
    return configured
  }
  const now = new Date()
  return parseDateOnly(`${now.getUTCFullYear()}-06-20`) || new Date(Date.UTC(now.getUTCFullYear(), 5, 20, 12, 0, 0))
}

async function getEmailBranding() {
  const envLogoUrl = String(process.env.NEXT_PUBLIC_WELCOME_LOGO_URL || '').trim()
  const { data, error } = await supabaseServer
    .from('camp_admin_settings')
    .select('welcome_logo_url, landing_carousel_image_urls')
    .eq('id', true)
    .maybeSingle()

  if (error) {
    return { welcomeLogoUrl: envLogoUrl, landingCarouselImageUrls: [] }
  }

  return {
    welcomeLogoUrl: String(data?.welcome_logo_url || envLogoUrl || '').trim(),
    landingCarouselImageUrls: normalizeImageUrls(data?.landing_carousel_image_urls),
  }
}

function normalizeCampWeeks(payload) {
  const incoming = Array.isArray(payload?.campWeeks) ? payload.campWeeks : []
  const mapped = incoming
    .map((week) => {
      if (typeof week === 'string') {
        const start = parseDateOnly(week)
        if (!start) return null
        return {
          start: start.toISOString().slice(0, 10),
          end: start.toISOString().slice(0, 10),
        }
      }
      const startDate = parseDateOnly(week?.start)
      if (!startDate) return null
      const endDate = parseDateOnly(week?.end) || startDate
      return {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10),
      }
    })
    .filter(Boolean)

  const byStart = new Map()
  for (const week of mapped) {
    byStart.set(week.start, week)
  }

  return Array.from(byStart.values()).sort((a, b) => a.start.localeCompare(b.start))
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
    if (!line) {
      continue
    }
    if (
      line.startsWith('Location:') ||
      line.startsWith('Parent/Guardian:') ||
      line.startsWith('Contact:') ||
      line.startsWith('Payment method:')
    ) {
      const [label, ...valueParts] = line.split(':')
      headerRows.push({
        label,
        value: valueParts.join(':').trim(),
      })
      continue
    }
    if (line.startsWith('Grand total:') || line.startsWith('Weekly reminders:')) {
      footerRows.push(line)
      continue
    }
    camperRows.push(line)
  }

  const headerHtml = headerRows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#334155;width:180px;">${escapeHtml(row.label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(row.value)}</td>
        </tr>
      `
    )
    .join('')

  const camperHtml = camperRows
    .map((line) => {
      const [name, details] = line.split(':')
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0f172a;width:180px;vertical-align:top;">${escapeHtml(name || 'Camper')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;">${escapeHtml(details || line)}</td>
        </tr>
      `
    })
    .join('')

  const footerHtml = footerRows
    .map((line) => {
      const emphasized = line.startsWith('Grand total:')
      return `<div style="padding:${emphasized ? '12px 14px' : '10px 14px'};border:${emphasized ? '1px solid #bfdbfe' : '1px solid #fde68a'};border-radius:12px;background:${emphasized ? '#eff6ff' : '#fffbeb'};color:#0f172a;margin-top:10px;">
        <strong style="color:${emphasized ? '#1d4ed8' : '#9a3412'};">${escapeHtml(line)}</strong>
      </div>`
    })
    .join('')

  return `
    <div style="margin:18px 0 0; padding:16px; border:1px solid #dbeafe; border-radius:16px; background:#f8fbff;">
      <p style="margin:0 0 12px; font-size:18px; font-weight:800; color:#0f172a;">Registration Summary</p>
      <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background:#ffffff;">
        <tbody>
          ${headerHtml || '<tr><td style="padding:12px;color:#64748b;">Summary unavailable.</td></tr>'}
        </tbody>
      </table>
      ${
        camperHtml
          ? `
            <div style="margin-top:12px;">
              <p style="margin:0 0 8px; font-size:14px; font-weight:800; color:#334155; text-transform:uppercase; letter-spacing:0.04em;">Campers</p>
              <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background:#ffffff;">
                <tbody>${camperHtml}</tbody>
              </table>
            </div>
          `
          : ''
      }
      ${footerHtml}
    </div>
  `
}

function buildInfoCard({ title, accentColor, background, borderColor, bodyHtml }) {
  return `
    <div style="margin:16px 0 0;padding:14px 16px;border:1px solid ${borderColor};border-radius:16px;background:${background};">
      <p style="margin:0 0 8px;font-size:14px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:${accentColor};">${escapeHtml(
        title
      )}</p>
      <div style="margin:0;color:#0f172a;font-size:15px;line-height:1.6;">${bodyHtml}</div>
    </div>
  `
}

function buildPaymentMethodsHtml(amountDue = 0) {
  const rows = PAYMENT_METHODS_TEXT.split('\n')
    .map((line) => {
      const [label, ...valueParts] = line.split(':')
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #fed7aa;font-weight:700;color:#7c2d12;width:140px;">${escapeHtml(
            label
          )}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #fed7aa;color:#0f172a !important;-webkit-text-fill-color:#0f172a;">${escapeHtml(
            valueParts.join(':').trim()
          )}</td>
        </tr>
      `
    })
    .join('')
  const goodsServicesTotal = calculateVenmoGoodsServicesTotal(amountDue)

  return buildInfoCard({
    title: 'Payment Methods',
    accentColor: '#9a3412',
    background: 'linear-gradient(180deg,#fff7ed 0%,#ffedd5 100%)',
    borderColor: '#fdba74',
    bodyHtml: `
      <table style="width:100%;border-collapse:collapse;border:1px solid #fdba74;border-radius:12px;overflow:hidden;background:#fffefc;">
        <tbody>${rows}</tbody>
      </table>
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
    title: 'Family Rewards',
    accentColor: '#166534',
    background: 'linear-gradient(180deg,#f0fdf4 0%,#dcfce7 100%)',
    borderColor: '#86efac',
    bodyHtml: `
      <ul style="margin:0;padding-left:18px;color:#14532d;">
        ${lines.map((line) => `<li style="margin:0 0 6px;">${escapeHtml(line)}</li>`).join('')}
      </ul>
    `,
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

function buildEmailHtml({
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
      ? `
      <div style="margin:18px 0 0; padding:14px 16px; border:1px solid #fcd34d; border-radius:16px; background:linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%);">
        <p style="margin:0 0 6px; font-size:14px; font-weight:800; letter-spacing:0.04em; text-transform:uppercase; color:#92400e;">Amount Due</p>
        <p style="margin:0; font-size:28px; font-weight:900; color:#b45309;">${escapeHtml(formatCurrency(amountDue))}</p>
      </div>
    `
      : ''

  const paymentMethodsHtml = showPaymentMethods ? buildPaymentMethodsHtml(amountDue) : ''
  const upsellHtml = buildUpsellHtml(payload)
  const levelUpHtml = buildLevelUpHtml(payload)

  return `
    <div style="margin:0;padding:20px;background:linear-gradient(180deg,#fff7ed 0%,#eff6ff 100%);color-scheme:light only;">
      <div style="max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #fde68a;border-radius:18px;overflow:hidden;box-shadow:0 20px 40px rgba(194,65,12,0.12);font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
        <div style="padding:15px 20px;background:linear-gradient(135deg,#f59e0b 0%,#f97316 36%,#0284c7 100%);color:#ffffff;">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(CAMP_NAME)}" style="display:block;max-height:52px;margin:0 0 10px;" />` : ''}
          <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:800;">${escapeHtml(
            CAMP_NAME
          )}</p>
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

function buildStepContent({ firstName, stepNumber, reservationDeadlineLabel, summaryLines, amountDue, payload }) {
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
      heading:
        {
          1: 'Overnight Registration Received - Payment Needed Within 72 Hours',
          2: 'Overnight Reminder - Payment Keeps Your Weeks Reserved',
          3: 'Important Overnight Reminder - Hold Still Pending Payment',
          4: 'Final Overnight Notice - Auto-Cancel Today if Unpaid',
          5: 'Overnight Registration Canceled (Unpaid)',
        }[stepNumber] || 'Overnight Registration Update',
      subject:
        {
          1: 'Overnight Camp Registration Received - Submit Payment Within 72 Hours',
          2: 'Overnight Camp Reminder - Complete Payment to Keep Your Weeks',
          3: 'Important: Overnight Camp Hold Still Waiting for Payment',
          4: 'Final Notice: Overnight Registration Auto-Cancels Today if Unpaid',
          5: 'Overnight Registration Canceled (Unpaid)',
        }[stepNumber] || 'Overnight Camp Registration Update',
      bodyLines: (overnightLines[stepNumber] || overnightLines[1]).filter(Boolean),
      bodyText: [
        ...(overnightLines[stepNumber] || overnightLines[1]).filter(Boolean),
        '',
        'Payment Methods:',
        PAYMENT_METHODS_TEXT,
        '',
        'Registration Summary:',
        ...(summaryLines || []),
      ].join('\n'),
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
    1: [
      `Hi ${firstName},`,
      '',
      `Thank you for submitting your ${CAMP_NAME} registration. Your reservation is now active for 72 hours and will auto-cancel if payment is not received by ${reservationDeadlineLabel}.`,
      Number(amountDue || 0) > 0 ? `Amount due now: ${formatCurrency(amountDue)}` : '',
      '',
      'We are excited to support your camper this summer with structured skill progression, confidence-building, and team-based growth.',
      '',
      'Please send payment using one of the methods below to secure your spot.',
    ],
    2: [
      `Hi ${firstName},`,
      '',
      'Quick evening reminder: your reservation is still on hold and ready to be confirmed.',
      '',
      Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '',
      '',
      `Complete payment before ${reservationDeadlineLabel} to keep your selected camp weeks.`,
      '',
      'We would love to welcome your family this season and help your camper build momentum early.',
    ],
    3: [
      `Hi ${firstName},`,
      '',
      'Your registration is still reserved, and we want to make sure you keep your preferred schedule.',
      '',
      Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '',
      '',
      `Please complete payment before ${reservationDeadlineLabel} to avoid losing your hold.`,
      '',
      'Our coaching team is ready, and this is a strong time to lock in summer training consistency.',
    ],
    4: [
      `Hi ${firstName},`,
      '',
      'Final day reminder: your reservation is approaching auto-cancel for unpaid status.',
      '',
      Number(amountDue || 0) > 0 ? `Amount due: ${formatCurrency(amountDue)}.` : '',
      '',
      `Payment must be received by ${reservationDeadlineLabel} to keep this registration active.`,
      '',
      'If you need help, simply reply and our team will assist right away.',
    ],
    5: [
      `Hi ${firstName},`,
      '',
      'Your reservation was automatically canceled because payment was not received within 72 hours.',
      '',
      Number(amountDue || 0) > 0 ? `Unpaid amount at cancellation: ${formatCurrency(amountDue)}.` : '',
      '',
      'You can still reopen your registration quickly by replying to this email or submitting again.',
      '',
      'We would still be happy to support your camper this summer.',
    ],
  }

  const bodyLines = (lines[stepNumber] || []).filter(Boolean)
  const bodyText = [
    ...bodyLines,
    '',
    'Family rewards:',
    ...getUpsellOfferLines(payload),
    '',
    ...getLevelUpRewardsLines(payload),
    '',
    'Level Up app:',
    'Download opens June 20 for lunch booking, progress photos/videos, and instructor notes.',
    '',
    'Payment Methods:',
    PAYMENT_METHODS_TEXT,
    '',
    'Registration Summary:',
    ...(summaryLines || []),
  ].join('\n')

  return {
    heading: headings[stepNumber] || headings[1],
    subject: subjects[stepNumber] || subjects[1],
    bodyLines,
    bodyText,
    preview: `${CAMP_NAME} reservation follow-up`,
  }
}

function getReservationDeadlineLabel(submittedAtIso) {
  const submittedAt = new Date(submittedAtIso)
  const deadline = new Date(submittedAt.getTime() + 72 * 60 * 60 * 1000)
  return deadline.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
}

function buildCurrentReservationDetails(payload, config) {
  const fallbackSummaryLines = Array.isArray(payload?.summaryLines) ? payload.summaryLines : []
  const fallbackAmountDue = Number(payload?.amountDue || 0)
  const fallbackCamperNames = Array.isArray(payload?.camperNames) ? payload.camperNames : []
  const safeConfig = config || defaultAdminConfig

  if (payload?.registrationType === 'overnight-only') {
    const discountActive = isLimitedDiscountActiveForDate(
      safeConfig.tuition?.discountEndDate,
      new Date().toISOString()
    )
    const regularWeek = Number(safeConfig.tuition?.regular?.overnightWeek || 0)
    const discountedWeek = Number(safeConfig.tuition?.discount?.overnightWeek || 0)
    const regularDay = Number(safeConfig.tuition?.regular?.overnightDay || 0)
    const discountedDay = Number(safeConfig.tuition?.discount?.overnightDay || 0)
    const effectiveWeek =
      discountActive && discountedWeek > 0 ? Math.min(regularWeek || discountedWeek, discountedWeek) : regularWeek
    const effectiveDay =
      discountActive && discountedDay > 0 ? Math.min(regularDay || discountedDay, discountedDay) : regularDay
    const requestedWeeks = Math.max(
      Number(payload?.overnightSelection?.requestedWeeks || 0),
      Array.isArray(payload?.campWeeks) ? payload.campWeeks.length : 0
    )
    const requestOption = String(payload?.overnightSelection?.requestOption || 'fullWeek').trim()
    const weeklyRate = requestOption === 'fullDay' ? effectiveDay : effectiveWeek
    const selectedWeekLabel = (Array.isArray(payload?.campWeeks) ? payload.campWeeks : [])
      .map((week) => formatWeekRangeLabel(week?.start, week?.end))
      .join(', ')
    const summaryLines = [
      `Parent/Guardian: ${payload?.guardianName || 'not provided'}`,
      `Contact: ${payload?.contactEmail || 'not provided'} | ${payload?.contactPhone || 'not provided'}`,
      `Payment method: ${payload?.paymentMethod || 'not selected'}`,
      `Program: ${requestOption === 'fullDay' ? 'Overnight Full Day' : 'Overnight Full Week'}`,
      `Selected weeks (${requestedWeeks}): ${selectedWeekLabel || 'none'}`,
      `Current weekly rate: ${formatCurrency(weeklyRate)}`,
      'Includes lodging and food only. Outing costs are billed separately.',
      `Activity picks: ${Array.isArray(payload?.overnightSelection?.activitySelections) ? payload.overnightSelection.activitySelections.length : 0}`,
      payload?.overnightSelection?.activityCustom
        ? `Other requests: ${payload.overnightSelection.activityCustom}`
        : 'Other requests: none',
    ]
    return {
      summaryLines,
      amountDue: requestedWeeks * weeklyRate,
      camperNames: fallbackCamperNames.length ? fallbackCamperNames : ['Overnight Camper'],
    }
  }

  if (payload?.registration && Array.isArray(payload.registration.students)) {
    const snapshot = buildRegistrationSummarySnapshot({
      registration: payload.registration,
      tuition: safeConfig.tuition,
      weeksById: buildWeeksByIdForJourneys(safeConfig),
      applyLimitedDiscount: Boolean(payload?.applyLimitedDiscount),
    })
    return {
      summaryLines: snapshot.summaryLines,
      amountDue: snapshot.amountDue,
      camperNames: snapshot.camperNames,
    }
  }

  return {
    summaryLines: fallbackSummaryLines,
    amountDue: fallbackAmountDue,
    camperNames: fallbackCamperNames,
  }
}

function getDueStep(submittedAtIso, currentStep, status) {
  if (status === 'paid' || status === 'canceled_unpaid') {
    return null
  }
  const elapsedHours = (Date.now() - new Date(submittedAtIso).getTime()) / (1000 * 60 * 60)
  if (elapsedHours >= 72 && currentStep < 5) return 5
  if (elapsedHours >= 66 && currentStep < 4) return 4
  if (elapsedHours >= 36 && currentStep < 3) return 3
  if (elapsedHours >= 12 && currentStep < 2) return 2
  return null
}

function nextSendAtIso(submittedAtIso, currentStep, status) {
  const submittedAt = new Date(submittedAtIso)
  if (status === 'paid' || status === 'canceled_unpaid' || currentStep >= 5) {
    return null
  }
  const hourMarkers = [12, 36, 66, 72]
  for (const marker of hourMarkers) {
    if (currentStep < 5 && marker > 0) {
      const candidate = new Date(submittedAt.getTime() + marker * 60 * 60 * 1000)
      if (candidate.getTime() > Date.now()) {
        return candidate.toISOString()
      }
    }
  }
  return new Date(Date.now() + 5 * 60 * 1000).toISOString()
}

async function insertReservationAutoSkippedEvents(run, fromStep, sentStep) {
  const startStep = Math.max(1, Number(fromStep || 0))
  const endStep = Math.min(5, Number(sentStep || 0))
  if (endStep <= startStep) {
    return
  }
  const rows = []
  for (let step = startStep; step < endStep; step += 1) {
    rows.push({
      run_id: run.id,
      profile_id: run.profile_id,
      email: run.email,
      step_number: step,
      event_type: 'reservation_step_auto_skipped',
      subject: 'Reservation reminder auto-skipped',
      body_preview: `Step ${step} was checked off because later overdue reminder R${endStep} was sent instead.`,
      event_payload: {
        phase: 'unpaid',
        skippedBecauseLaterStepSent: true,
        sentStepNumber: endStep,
      },
    })
  }
  if (rows.length > 0) {
    await supabaseServer.from('email_journey_events').insert(rows)
  }
}

function getPaidPrepSchedule(payload) {
  const campWeeks = normalizeCampWeeks(payload)
  if (campWeeks.length === 0) {
    return null
  }
  const firstWeekStart = parseDateOnly(campWeeks[0].start)
  if (!firstWeekStart) {
    return null
  }
  const sevenDayAt = addDays(firstWeekStart, -7)
  const fiveDayAt = addDays(firstWeekStart, -5)
  const threeDayAt = addDays(firstWeekStart, -3)
  const oneDayAt = addDays(firstWeekStart, -1)

  return {
    firstWeekStart,
    stages: {
      sevenDay: {
        id: 'sevenDay',
        eventType: 'paid_prep_7d_sent',
        scheduledAt: sevenDayAt,
        eligible: true,
      },
      fiveDay: {
        id: 'fiveDay',
        eventType: 'paid_prep_5d_sent',
        scheduledAt: fiveDayAt,
        eligible: true,
      },
      threeDay: {
        id: 'threeDay',
        eventType: 'paid_prep_3d_sent',
        scheduledAt: threeDayAt,
        eligible: true,
      },
      oneDay: {
        id: 'oneDay',
        eventType: 'paid_prep_1d_sent',
        scheduledAt: oneDayAt,
        eligible: true,
      },
    },
  }
}

function getPaidPrepDueStage(payload, eventTypes) {
  const schedule = getPaidPrepSchedule(payload)
  if (!schedule) {
    return null
  }

  const now = new Date()
  const startBoundary = addDays(schedule.firstWeekStart, 1)

  const ordered = [
    schedule.stages.sevenDay,
    schedule.stages.fiveDay,
    schedule.stages.threeDay,
    schedule.stages.oneDay,
  ]

  const due = ordered
    .filter((stage) => stage.eligible && !eventTypes.has(stage.eventType))
    .filter((stage) => now.getTime() >= stage.scheduledAt.getTime())
    .filter(() => now.getTime() <= startBoundary.getTime())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())

  return due[0] || null
}

function getNextPaidPrepSendAt(payload, eventTypes) {
  const schedule = getPaidPrepSchedule(payload)
  if (!schedule) {
    return null
  }

  const now = new Date()
  const candidates = [
    schedule.stages.sevenDay,
    schedule.stages.fiveDay,
    schedule.stages.threeDay,
    schedule.stages.oneDay,
  ]
    .filter((stage) => stage.eligible && !eventTypes.has(stage.eventType))
    .map((stage) => stage.scheduledAt)
    .filter((date) => date.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime())

  return candidates[0] ? candidates[0].toISOString() : null
}

function buildPaidPrepContent({ firstName, stage, payload }) {
  const camperNames = Array.isArray(payload?.camperNames) ? payload.camperNames : []
  const camperLabel = camperNames.length > 0 ? camperNames.join(', ') : 'your camper'
  const firstWeek = normalizeCampWeeks(payload)[0]
  const firstWeekLabel = firstWeek?.start || 'your selected week'

  const commonClose = [
    '',
    'If your camper wants to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.',
    '',
    'Need help adding weeks or adjusting schedule? Reply and we will handle it for you quickly.',
  ]

  const stageMap = {
    sevenDay: {
      heading: '7-Day Countdown - Camp Preparation Snapshot',
      subject: '7 Days Before Camp: Preparation Checklist + Bonus Week Offers',
      preview: `${CAMP_NAME} 7-day preparation`,
      ctaLabel: 'View Schedule & Add Weeks',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [
        `Hi ${firstName},`,
        '',
        `Great news - ${camperLabel} is officially registered for ${CAMP_NAME}, and your first selected week starts ${firstWeekLabel}.`,
        'Camp begins next week. Here is your preparation snapshot plus your family add-weeks offer:',
        ...commonClose,
      ],
    },
    fiveDay: {
      heading: '5-Day Reminder - Keep Building Summer Momentum',
      subject: '5 Days Before Camp: Final Logistics + Extra Week Invitation',
      preview: `${CAMP_NAME} 5-day preparation`,
      ctaLabel: 'Review Prep + Add Weeks',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [
        `Hi ${firstName},`,
        '',
        'Your camp week is coming up fast. A few key reminders for a smooth start:',
        '- Label water bottle, athletic shoes, and comfortable training clothing.',
        '- Wednesday: bring a change of clothes for Water Wednesday activities.',
        '- Thursday: BBQ lunch is included (optional to pack your own).',
        '- Friday: family performance showcase day at 4:00 PM.',
        '',
        ...commonClose,
      ],
    },
    threeDay: {
      heading: '3-Day Reminder - Final What-To-Prepare Checklist',
      subject: '3 Days Before Camp: Final Packing + Arrival Checklist',
      preview: `${CAMP_NAME} 3-day preparation`,
      ctaLabel: 'Open Family Checklist',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [
        `Hi ${firstName},`,
        '',
        'Three-day reminder before your camp week begins:',
        '- Confirm drop-off / pick-up timing in your family plan.',
        '- Pack daily essentials and Thursday backup lunch only if preferred.',
        '- Keep Wednesday change-of-clothes ready.',
        '- Friday showcase runs at 4:00 PM for family attendance.',
        '',
        ...commonClose,
      ],
    },
    oneDay: {
      heading: '1-Day Reminder - See You Tomorrow',
      subject: 'Camp Starts Tomorrow: Arrival Reminder + Final Checklist',
      preview: `${CAMP_NAME} 1-day preparation`,
      ctaLabel: 'Open Family Checklist',
      ctaHref: 'https://summer.newushu.com/register',
      lines: [
        `Hi ${firstName},`,
        '',
        'Camp starts tomorrow. Final reminder before arrival:',
        '- Double-check drop-off and pickup timing.',
        '- Pack training clothes, water bottle, and any needed medication info.',
        '- Keep your Wednesday clothes change and Friday showcase timing in mind.',
        '',
        ...commonClose,
      ],
    },
  }

  return stageMap[stage?.id] || stageMap.sevenDay
}

async function getRunSubmissionPayload(runId) {
  const { data, error } = await supabaseServer
    .from('email_journey_events')
    .select('event_payload')
    .eq('run_id', runId)
    .eq('event_type', 'reservation_submitted')
    .order('event_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data?.event_payload || null
}

async function getRunEventTypes(runId) {
  const { data, error } = await supabaseServer
    .from('email_journey_events')
    .select('event_type')
    .eq('run_id', runId)
    .order('event_at', { ascending: false })
    .limit(100)

  if (error) {
    throw new Error(error.message)
  }

  return new Set((data || []).map((row) => row.event_type).filter(Boolean))
}

async function sendReservationStepEmail({ run = null, email = '', payload, stepNumber }) {
  const recipientEmail = String(email || run?.email || '').trim().toLowerCase()
  if (!recipientEmail) {
    throw new Error('Recipient email is required.')
  }
  const config = await getMergedAdminConfigForJourneys()
  const currentDetails = buildCurrentReservationDetails(payload, config)
  const effectivePayload = {
    ...payload,
    summaryLines: currentDetails.summaryLines,
    amountDue: currentDetails.amountDue,
    camperNames:
      Array.isArray(payload?.camperNames) && payload.camperNames.length > 0
        ? payload.camperNames
        : currentDetails.camperNames,
  }
  const firstName = splitFirstName(
    effectivePayload?.guardianName || effectivePayload?.primaryCamperName || effectivePayload?.camperNames?.[0] || ''
  )
  const summaryLines = Array.isArray(effectivePayload?.summaryLines) ? effectivePayload.summaryLines : []
  const submittedAtIso = effectivePayload?.submittedAt || run?.created_at || new Date().toISOString()
  const reservationDeadlineLabel = getReservationDeadlineLabel(submittedAtIso)
  const amountDue = Number(effectivePayload?.amountDue || 0)
  const content = buildStepContent({
    firstName,
    stepNumber,
    reservationDeadlineLabel,
    summaryLines,
    amountDue,
    payload: effectivePayload,
  })
  const branding = await getEmailBranding()
  const paymentPageHref =
    String(effectivePayload?.paymentPageLink || '').trim() ||
    buildPaymentPageHref({
      registrationType: effectivePayload?.registrationType || '',
      guardianName: effectivePayload?.guardianName || firstName,
      contactEmail: recipientEmail,
      location: effectivePayload?.location || '',
      paymentMethod: effectivePayload?.paymentMethod || '',
      summaryLines,
      amountDue,
      camperNames: Array.isArray(effectivePayload?.camperNames) ? effectivePayload.camperNames : [],
    })
  const html = buildEmailHtml({
    heading: content.heading,
    preview: content.preview,
    bodyLines: content.bodyLines,
    summaryLines,
    amountDue,
    payload: effectivePayload,
    ctaLabel: 'Review Payment Options & Summary',
    ctaHref: paymentPageHref,
    showPaymentMethods: true,
    logoUrl: branding?.welcomeLogoUrl || '',
    heroImageUrl: pickJourneyImage(branding?.landingCarouselImageUrls, stepNumber - 1),
  })
  const attachInvoicePdf = SHOULD_ATTACH_RESERVATION_PDF && summaryLines.length > 0
  const attachmentLines = [
    ...summaryLines,
  ]
  const attachments = attachInvoicePdf
    ? [
        {
          filename: 'camp-payment-summary.pdf',
          contentType: 'application/pdf',
          contentBase64: buildPaymentSummaryPdfBase64({
            title: `${CAMP_NAME} Payment Summary`,
            campName: CAMP_NAME,
            guardianName: effectivePayload?.guardianName || firstName,
            recipientEmail,
            submittedLabel: new Date(submittedAtIso).toLocaleString('en-US'),
            reservationDeadlineLabel,
            amountDueLabel: formatCurrency(amountDue),
            paymentMethods: PAYMENT_METHODS_TEXT.split('\n'),
            summaryLines: attachmentLines,
          }),
        },
      ]
    : []
  let sendResult = await sendWithSes({
    toEmail: recipientEmail,
    subject: content.subject,
    bodyText: content.bodyText,
    html,
    attachments,
  })
  let usedAttachmentFallback = false

  if (!sendResult.sent && !sendResult.previewOnly && attachments.length > 0) {
    const fallbackResult = await sendWithSes({
      toEmail: recipientEmail,
      subject: content.subject,
      bodyText: content.bodyText,
      html,
      attachments: [],
    })
    if (fallbackResult.sent || fallbackResult.previewOnly) {
      sendResult = fallbackResult
      usedAttachmentFallback = true
    }
  }

  if (run?.id) {
    await supabaseServer.from('email_journey_events').insert({
      run_id: run.id,
      profile_id: run.profile_id,
      email: recipientEmail,
      step_number: stepNumber,
      event_type: sendResult.sent ? 'reservation_email_sent' : 'reservation_email_preview',
      subject: content.subject,
      body_preview: content.bodyText.slice(0, 400),
      event_payload: {
        previewOnly: sendResult.previewOnly,
        error: sendResult.error,
        amountDue,
        attachedPdf: attachments.length > 0 && !usedAttachmentFallback,
        attemptedPdfAttachment: attachments.length > 0,
        usedAttachmentFallback,
      },
    })
  }

  if (!sendResult.sent && !sendResult.previewOnly) {
    throw new Error(sendResult.error || 'Email send failed')
  }

  return {
    sent: sendResult.sent,
    previewOnly: sendResult.previewOnly,
    error: sendResult.error,
    usedAttachmentFallback,
  }
}

async function sendJourneyEmail({ run, payload, stepNumber }) {
  return sendReservationStepEmail({ run, payload, stepNumber })
}

function isRunNearSubmission(createdAt, submittedAt, maxMinutes = 20) {
  const createdMs = new Date(createdAt || 0).getTime()
  const submittedMs = new Date(submittedAt || 0).getTime()
  if (!Number.isFinite(createdMs) || !Number.isFinite(submittedMs)) {
    return false
  }
  return Math.abs(createdMs - submittedMs) <= maxMinutes * 60 * 1000
}

async function findRecoverableReservationRun(email, submittedAt) {
  const { data, error } = await supabaseServer
    .from('email_journey_runs')
    .select('id, email, status, current_step, profile_id, created_at')
    .eq('email', email)
    .not('status', 'like', 'lead_%')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).find((run) => isRunNearSubmission(run?.created_at, submittedAt)) || null
}

async function findAttachedReservationRun(registrationId, email = '') {
  const normalizedRegistrationId = Number(registrationId || 0)
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (normalizedRegistrationId <= 0) {
    return null
  }

  const attachmentQuery = supabaseServer
    .from('email_journey_events')
    .select('run_id, email, event_payload, event_at')
    .eq('event_type', 'reservation_run_attached')
    .order('event_at', { ascending: false })
    .limit(50)

  const { data: attachmentEvents, error: attachmentError } = normalizedEmail
    ? await attachmentQuery.eq('email', normalizedEmail)
    : await attachmentQuery

  if (attachmentError) {
    throw new Error(attachmentError.message)
  }

  const matchedEvent = (attachmentEvents || []).find((event) => {
    const payload =
      typeof event?.event_payload === 'object' && event?.event_payload
        ? event.event_payload
        : parseMaybeJson(event?.event_payload, {}) || {}
    return Number(payload?.registrationId || 0) === normalizedRegistrationId && Number(event?.run_id || 0) > 0
  })

  if (!matchedEvent?.run_id) {
    return null
  }

  const { data: run, error: runError } = await supabaseServer
    .from('email_journey_runs')
    .select('id, email, status, current_step, profile_id, created_at')
    .eq('id', Number(matchedEvent.run_id))
    .maybeSingle()

  if (runError) {
    throw new Error(runError.message)
  }

  return run || null
}

async function createOrRecoverReservationRun(email, submittedAt) {
  const insertPayload = {
    email,
    status: 'active',
    current_step: 0,
    next_send_at: new Date().toISOString(),
  }

  const tryInsert = async () =>
    supabaseServer
      .from('email_journey_runs')
      .insert(insertPayload)
      .select('id, email, status, current_step, profile_id, created_at')
      .single()

  let { data: createdRun, error: runError } = await tryInsert()
  if (!runError && createdRun) {
    return { run: createdRun, recovered: false, warning: '' }
  }

  const recoveredRun = await findRecoverableReservationRun(email, submittedAt)
  if (recoveredRun) {
    return {
      run: recoveredRun,
      recovered: true,
      warning: runError?.message || 'Recovered an existing reservation run after the initial insert failed.',
    }
  }

  ;({ data: createdRun, error: runError } = await tryInsert())
  if (!runError && createdRun) {
    return {
      run: createdRun,
      recovered: false,
      warning: 'Reservation run insert succeeded on retry.',
    }
  }

  return {
    run: null,
    recovered: false,
    warning: runError?.message || 'Unable to create reservation run.',
  }
}

async function ensureReservationSubmittedEvent({ runId, email, summaryLines, submissionPayload, eventAt = '' }) {
  const { error: insertError } = await supabaseServer.from('email_journey_events').insert({
    run_id: runId,
    profile_id: null,
    email,
    step_number: 0,
    event_type: 'reservation_submitted',
    subject: 'Registration submitted',
    body_preview: summaryLines.join(' | ').slice(0, 350),
    event_payload: submissionPayload,
    event_at: eventAt || submissionPayload?.submittedAt || new Date().toISOString(),
  })

  if (!insertError) {
    return { warning: '' }
  }

  const { data: existingEvent, error: lookupError } = await supabaseServer
    .from('email_journey_events')
    .select('id')
    .eq('run_id', runId)
    .eq('event_type', 'reservation_submitted')
    .order('event_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (lookupError) {
    throw new Error(lookupError.message)
  }

  if (existingEvent?.id) {
    return {
      warning: insertError.message || 'Reservation submitted event already existed for this run.',
    }
  }

  throw new Error(insertError.message || 'Unable to store reservation submission payload.')
}

async function getMergedAdminConfigForJourneys() {
  const [settingsResponse, windowsResponse, weeksResponse] = await Promise.all([
    supabaseServer.from('camp_admin_settings').select('*').eq('id', true).maybeSingle(),
    supabaseServer.from('camp_program_windows').select('program_key, start_date, end_date'),
    supabaseServer.from('camp_program_selected_weeks').select('program_key, week_start, week_end'),
  ])

  const firstError = settingsResponse.error || windowsResponse.error || weeksResponse.error
  if (firstError) {
    throw new Error(firstError.message)
  }

  const raw = {
    tuition: {
      regular: {
        fullWeek: settingsResponse.data?.tuition_full_week || 0,
        fullDay: settingsResponse.data?.tuition_full_day || 0,
        amHalf: settingsResponse.data?.tuition_am_half || 0,
        pmHalf: settingsResponse.data?.tuition_pm_half || 0,
        overnightWeek: settingsResponse.data?.tuition_overnight_week || 0,
        overnightDay: settingsResponse.data?.tuition_overnight_day || 0,
      },
      discount: {
        fullWeek: settingsResponse.data?.discount_full_week || 0,
        fullDay: settingsResponse.data?.discount_full_day || 0,
        amHalf: settingsResponse.data?.discount_am_half || 0,
        pmHalf: settingsResponse.data?.discount_pm_half || 0,
        overnightWeek: settingsResponse.data?.discount_overnight_week || 0,
        overnightDay: settingsResponse.data?.discount_overnight_day || 0,
      },
      discountEndDate: settingsResponse.data?.discount_end_date || '',
      discountDisplayValue: settingsResponse.data?.discount_display_value || '',
      discountCode: settingsResponse.data?.discount_code || '',
      lunchPrice: settingsResponse.data?.lunch_price || 14,
      bootcampPremiumPct: settingsResponse.data?.bootcamp_premium_pct ?? 25,
      siblingDiscountPct: settingsResponse.data?.sibling_discount_pct ?? 10,
      businessName: settingsResponse.data?.invoice_business_name || 'New England Wushu',
      businessAddress: settingsResponse.data?.invoice_business_address || '',
    },
    programs: {
      general: { startDate: '', endDate: '', selectedWeeks: [], actonSelectedWeeks: [], wellesleySelectedWeeks: [] },
      bootcamp: { startDate: '', endDate: '', selectedWeeks: [] },
      overnight: { startDate: '', endDate: '', selectedWeeks: [] },
    },
  }

  raw.programs.general.actonSelectedWeeks = Array.isArray(settingsResponse.data?.general_acton_selected_weeks)
    ? settingsResponse.data.general_acton_selected_weeks
    : []
  raw.programs.general.wellesleySelectedWeeks = Array.isArray(settingsResponse.data?.general_wellesley_selected_weeks)
    ? settingsResponse.data.general_wellesley_selected_weeks
    : []

  for (const row of windowsResponse.data || []) {
    if (!['general', 'bootcamp', 'overnight'].includes(row.program_key)) continue
    raw.programs[row.program_key] = {
      ...raw.programs[row.program_key],
      startDate: normalizeDateKey(row.start_date) || '',
      endDate: normalizeDateKey(row.end_date) || '',
    }
  }

  for (const row of weeksResponse.data || []) {
    if (!['general', 'bootcamp', 'overnight'].includes(row.program_key) || !row.week_start) continue
    const weekStart = normalizeDateKey(row.week_start)
    if (!weekStart) continue
    raw.programs[row.program_key].selectedWeeks.push(`${row.program_key}:${weekStart}`)
  }

  return mergeAdminConfig({
    ...defaultAdminConfig,
    tuition: raw.tuition,
    programs: raw.programs,
  })
}

function buildWeeksByIdForJourneys(config) {
  const generalSelections = [
    ...(Array.isArray(config?.programs?.general?.selectedWeeks) ? config.programs.general.selectedWeeks : []),
    ...(Array.isArray(config?.programs?.general?.actonSelectedWeeks) ? config.programs.general.actonSelectedWeeks : []),
    ...(Array.isArray(config?.programs?.general?.wellesleySelectedWeeks) ? config.programs.general.wellesleySelectedWeeks : []),
  ]
  const generalProgram = {
    ...config.programs.general,
    selectedWeeks: Array.from(new Set(generalSelections)),
  }
  const generalWeeks = buildProgramWeekOptions('general', generalProgram.startDate, generalProgram.endDate).filter((week) =>
    generalProgram.selectedWeeks.includes(week.id)
  )
  const bootcampWeeks = buildProgramWeekOptions(
    'bootcamp',
    config.programs.bootcamp.startDate,
    config.programs.bootcamp.endDate
  ).filter((week) => (config.programs.bootcamp.selectedWeeks || []).includes(week.id))
  const overnightWeeks = buildProgramWeekOptions(
    'overnight',
    config.programs.overnight.startDate,
    config.programs.overnight.endDate
  ).filter((week) => (config.programs.overnight.selectedWeeks || []).includes(week.id))

  return [...generalWeeks, ...bootcampWeeks, ...overnightWeeks].reduce((acc, week) => {
    acc[week.id] = week
    return acc
  }, {})
}

function buildRepairPayloadFromRegistration(record, config, weeksById) {
  const rawMeta = parseMaybeJson(record?.medical_notes, {}) || {}
  const sourceRegistration = rawMeta?.registration || {}
  const students = Array.isArray(sourceRegistration.students) && sourceRegistration.students.length > 0
    ? sourceRegistration.students
    : [
        {
          fullName:
            [record?.camper_first_name, record?.camper_last_name].filter(Boolean).join(' ').trim() ||
            record?.guardian_name ||
            'Camper',
          schedule: {},
          lunch: {},
        },
      ]
  const registration = {
    location: sourceRegistration.location || rawMeta?.locationLabel || '',
    parentName: sourceRegistration.parentName || record?.guardian_name || 'Parent/Guardian',
    contactEmail: sourceRegistration.contactEmail || record?.guardian_email || '',
    contactPhone: sourceRegistration.contactPhone || record?.guardian_phone || '',
    paymentMethod: sourceRegistration.paymentMethod || rawMeta?.paymentMethodLabel || '',
    students,
  }
  const applyLimitedDiscount = isLimitedDiscountActiveForDate(config?.tuition?.discountEndDate, record?.created_at)
  const snapshot = buildRegistrationSummarySnapshot({
    registration,
    tuition: config.tuition,
    weeksById,
    applyLimitedDiscount,
  })
  const selectedWeekIds = Array.from(new Set(students.flatMap((student) => Object.keys(student?.schedule || {}).filter(Boolean))))
  const campWeeks = selectedWeekIds
    .map((weekId) => weeksById[weekId])
    .filter(Boolean)
    .map((week) => ({ start: week.start, end: week.end }))

  return {
    submittedAt: record?.created_at || new Date().toISOString(),
    contactPhone: registration.contactPhone || '',
    guardianName: registration.parentName || '',
    primaryCamperName: snapshot.camperNames[0] || '',
    camperNames: snapshot.camperNames,
    summaryLines: snapshot.summaryLines,
    amountDue: snapshot.amountDue,
    campWeeks,
    paymentPageLink: buildPaymentPageHref({
      registrationType: String(rawMeta?.registrationType || '').trim(),
      guardianName: registration.parentName || '',
      contactEmail: registration.contactEmail || '',
      location: registration.location || '',
      paymentMethod: registration.paymentMethod || '',
      summaryLines: snapshot.summaryLines,
      amountDue: snapshot.amountDue,
      camperNames: snapshot.camperNames,
    }),
    registrationType: String(rawMeta?.registrationType || '').trim(),
    location: registration.location || '',
    paymentMethod: registration.paymentMethod || '',
  }
}

async function sendPaidPrepEmail({ run, payload, stage }) {
  const firstName = splitFirstName(
    payload?.guardianName || payload?.primaryCamperName || payload?.camperNames?.[0] || ''
  )
  const summaryLines = Array.isArray(payload?.summaryLines) ? payload.summaryLines : []
  const content = buildPaidPrepContent({ firstName, stage, payload })
  const bodyText = content.lines.join('\n')
  const branding = await getEmailBranding()
  const html = buildEmailHtml({
    heading: content.heading,
    preview: content.preview,
    bodyLines: content.lines,
    summaryLines,
    amountDue: 0,
    payload,
    ctaLabel: content.ctaLabel,
    ctaHref: content.ctaHref,
    showPaymentMethods: false,
    logoUrl: branding?.welcomeLogoUrl || '',
    heroImageUrl: pickJourneyImage(
      branding?.landingCarouselImageUrls,
      ['sevenDay', 'fiveDay', 'threeDay', 'oneDay'].indexOf(stage?.id || 'sevenDay')
    ),
  })

  const sendResult = await sendWithSes({
    toEmail: run.email,
    subject: content.subject,
    bodyText,
    html,
    attachments: [],
  })

  await supabaseServer.from('email_journey_events').insert({
    run_id: run.id,
    profile_id: run.profile_id,
    email: run.email,
    step_number: null,
    event_type: sendResult.sent ? stage.eventType : `${stage.eventType}_preview`,
    subject: content.subject,
    body_preview: bodyText.slice(0, 400),
    event_payload: {
      previewOnly: sendResult.previewOnly,
      error: sendResult.error,
      stageId: stage.id,
    },
  })

  if (!sendResult.sent && !sendResult.previewOnly) {
    throw new Error(sendResult.error || 'Email send failed')
  }

  return {
    sent: sendResult.sent,
    previewOnly: sendResult.previewOnly,
    error: sendResult.error,
  }
}

async function enqueueReservationJourney(payload) {
  const email = String(payload?.contactEmail || '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    throw new Error('A valid contact email is required.')
  }

  const submittedAt = payload?.submittedAt || new Date().toISOString()
  const camperNames = Array.isArray(payload?.camperNames) ? payload.camperNames : []
  const summaryLines = Array.isArray(payload?.summaryLines) ? payload.summaryLines : []
  const amountDue = Number(payload?.amountDue || 0)
  const submissionPayload = {
    submittedAt,
    contactPhone: payload?.contactPhone || '',
    contactEmail: email,
    guardianName: payload?.guardianName || '',
    paymentMethod: payload?.paymentMethod || '',
    location: payload?.location || '',
    primaryCamperName: payload?.primaryCamperName || camperNames[0] || '',
    camperNames,
    summaryLines,
    amountDue,
    campWeeks: normalizeCampWeeks(payload),
    registrationType: payload?.registrationType || '',
    registration: payload?.registration || null,
    applyLimitedDiscount: Boolean(payload?.applyLimitedDiscount),
    overnightSelection: payload?.overnightSelection || null,
  }
  const runResult = await createOrRecoverReservationRun(email, submittedAt)
  const createdRun = runResult.run
  if (!createdRun?.id) {
    // Run creation failed — return a soft warning instead of throwing so the
    // registration success path is not blocked. Admin can repair via tracking tab.
    return {
      runId: null,
      immediateEmail: null,
      journeyStored: false,
      warning: runResult.warning || 'Unable to create reservation journey run. Use "Repair Missing Registration Runs" in the tracking tab.',
    }
  }

  const submittedEventResult = await ensureReservationSubmittedEvent({
    runId: createdRun.id,
    email,
    summaryLines,
    submissionPayload,
    eventAt: submittedAt,
  })

  const initialEmailResult = await sendJourneyEmail({
    run: createdRun,
    payload: submissionPayload,
    stepNumber: 1,
  })

  const nextSendAt = nextSendAtIso(submittedAt, 1, 'active')
  await supabaseServer
    .from('email_journey_runs')
    .update({
      current_step: 1,
      last_sent_at: new Date().toISOString(),
      next_send_at: nextSendAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', createdRun.id)

  return {
    runId: createdRun.id,
    immediateEmail: initialEmailResult,
    journeyStored: true,
    warning: runResult.warning || submittedEventResult.warning || '',
  }
}

async function processDueReservationJourneys() {
  const nowIso = new Date().toISOString()
  const { data: unpaidRuns, error: unpaidError } = await supabaseServer
    .from('email_journey_runs')
    .select('id, profile_id, email, status, current_step, created_at, next_send_at, last_sent_at')
    .in('status', ['active', 'queued'])
    .lte('next_send_at', nowIso)
    .order('next_send_at', { ascending: true })
    .limit(60)

  if (unpaidError) {
    throw new Error(unpaidError.message)
  }

  const { data: paidRuns, error: paidError } = await supabaseServer
    .from('email_journey_runs')
    .select('id, profile_id, email, status, current_step, created_at, next_send_at, last_sent_at')
    .eq('status', 'paid')
    .order('updated_at', { ascending: false })
    .limit(120)

  if (paidError) {
    throw new Error(paidError.message)
  }

  let processed = 0
  let emailed = 0
  let canceled = 0
  let paidPrepSent = 0

  for (const run of unpaidRuns || []) {
    processed += 1
    try {
      const payload = await getRunSubmissionPayload(run.id)
      if (!payload?.submittedAt) {
        await supabaseServer
          .from('email_journey_runs')
          .update({
            status: 'error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', run.id)
        continue
      }

      const dueStep = getDueStep(payload.submittedAt, Number(run.current_step || 0), run.status)
      if (!dueStep) {
        const nextSendAt = nextSendAtIso(payload.submittedAt, Number(run.current_step || 0), run.status)
        await supabaseServer
          .from('email_journey_runs')
          .update({
            next_send_at: nextSendAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', run.id)
        continue
      }

      await insertReservationAutoSkippedEvents(run, Number(run.current_step || 0) + 1, dueStep)
      await sendJourneyEmail({ run, payload, stepNumber: dueStep })
      emailed += 1

      const nextStatus = dueStep >= 5 ? 'canceled_unpaid' : 'active'
      if (nextStatus === 'canceled_unpaid') {
        canceled += 1
      }
      const nextSendAt = nextSendAtIso(payload.submittedAt, dueStep, nextStatus)

      await supabaseServer
        .from('email_journey_runs')
        .update({
          status: nextStatus,
          current_step: dueStep,
          last_sent_at: new Date().toISOString(),
          next_send_at: nextSendAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', run.id)
    } catch (runError) {
      await supabaseServer
        .from('email_journey_runs')
        .update({
          status: 'error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', run.id)

      await supabaseServer.from('email_journey_events').insert({
        run_id: run.id,
        profile_id: run.profile_id,
        email: run.email,
        step_number: null,
        event_type: 'reservation_journey_error',
        subject: 'Reservation journey error',
        body_preview: String(runError?.message || 'Unknown error').slice(0, 350),
        event_payload: { phase: 'unpaid' },
      })
    }
  }

  for (const run of paidRuns || []) {
    processed += 1
    try {
      const payload = await getRunSubmissionPayload(run.id)
      if (!payload) {
        continue
      }

      const eventTypes = await getRunEventTypes(run.id)
      const dueStage = getPaidPrepDueStage(payload, eventTypes)
      if (dueStage) {
        await sendPaidPrepEmail({ run, payload, stage: dueStage })
        paidPrepSent += 1
        emailed += 1
      }

      const refreshedEventTypes = dueStage ? await getRunEventTypes(run.id) : eventTypes
      const nextSendAt = getNextPaidPrepSendAt(payload, refreshedEventTypes)

      await supabaseServer
        .from('email_journey_runs')
        .update({
          next_send_at: nextSendAt,
          last_sent_at: dueStage ? new Date().toISOString() : run.last_sent_at || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', run.id)
    } catch (runError) {
      await supabaseServer.from('email_journey_events').insert({
        run_id: run.id,
        profile_id: run.profile_id,
        email: run.email,
        step_number: null,
        event_type: 'reservation_journey_error',
        subject: 'Reservation paid-prep journey error',
        body_preview: String(runError?.message || 'Unknown error').slice(0, 350),
        event_payload: { phase: 'paid_prep' },
      })
    }
  }

  return { processed, emailed, canceled, paidPrepSent }
}

async function manuallySendReservationStep({ runId = 0, stepKey = '', stepNumber = 0 }) {
  if (Number(runId || 0) <= 0) {
    throw new Error('A reservation run is required.')
  }

  const { data: run, error: runError } = await supabaseServer
    .from('email_journey_runs')
    .select('id, profile_id, email, status, current_step, created_at, next_send_at, last_sent_at')
    .eq('id', Number(runId))
    .maybeSingle()

  if (runError) {
    throw new Error(runError.message)
  }
  if (!run) {
    throw new Error('Reservation run not found.')
  }

  const payload = await getRunSubmissionPayload(run.id)
  if (!payload) {
    throw new Error('Reservation payload not found for this run.')
  }

  const normalizedStepKey = String(stepKey || '').trim()
  if (normalizedStepKey === 'paid_7d' || normalizedStepKey === 'paid_5d' || normalizedStepKey === 'paid_3d' || normalizedStepKey === 'paid_1d') {
    const stageIdMap = {
      paid_7d: 'sevenDay',
      paid_5d: 'fiveDay',
      paid_3d: 'threeDay',
      paid_1d: 'oneDay',
    }
    const schedule = getPaidPrepSchedule(payload)
    const stage = schedule?.stages?.[stageIdMap[normalizedStepKey]]
    if (!stage) {
      throw new Error('Paid prep stage not available for this run.')
    }
    const sendResult = await sendPaidPrepEmail({ run, payload, stage })
    const refreshedEventTypes = await getRunEventTypes(run.id)
    const nextSendAt = getNextPaidPrepSendAt(payload, refreshedEventTypes)
    await supabaseServer
      .from('email_journey_runs')
      .update({
        next_send_at: nextSendAt,
        last_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', run.id)
    return {
      emailed: 1,
      runId: run.id,
      stepKey: normalizedStepKey,
      sent: Boolean(sendResult?.sent),
      previewOnly: Boolean(sendResult?.previewOnly),
    }
  }

  const targetStep = Math.max(1, Math.min(5, Number(stepNumber || 1)))
  const sendResult = await sendJourneyEmail({ run, payload, stepNumber: targetStep })
  const nextStatus = targetStep >= 5 ? 'canceled_unpaid' : 'active'
  const nextSendAt = nextSendAtIso(payload.submittedAt, targetStep, nextStatus)
  await supabaseServer
    .from('email_journey_runs')
    .update({
      status: nextStatus,
      current_step: targetStep,
      last_sent_at: new Date().toISOString(),
      next_send_at: nextSendAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', run.id)
  return {
    emailed: 1,
    runId: run.id,
    stepNumber: targetStep,
    sent: Boolean(sendResult?.sent),
    previewOnly: Boolean(sendResult?.previewOnly),
  }
}

async function repairMissingReservationRuns() {
  const config = await getMergedAdminConfigForJourneys()
  const weeksById = buildWeeksByIdForJourneys(config)
  const { data: registrations, error: registrationsError } = await supabaseServer
    .from('registrations')
    .select('id, camper_first_name, camper_last_name, guardian_name, guardian_email, guardian_phone, created_at, medical_notes')
    .order('created_at', { ascending: false })
    .limit(200)

  if (registrationsError) {
    throw new Error(registrationsError.message)
  }

  let repaired = 0
  let skipped = 0

  for (const record of registrations || []) {
    const email = String(record?.guardian_email || '').trim().toLowerCase()
    if (!isValidEmail(email)) {
      skipped += 1
      continue
    }

    const attachedRun = await findAttachedReservationRun(record?.id, email)
    if (attachedRun?.id) {
      skipped += 1
      continue
    }

    const existingRun = await findRecoverableReservationRun(email, record?.created_at)
    if (existingRun?.id) {
      skipped += 1
      continue
    }

    const payload = buildRepairPayloadFromRegistration(record, config, weeksById)
    const runResult = await createOrRecoverReservationRun(email, payload.submittedAt)
    const createdRun = runResult.run
    if (!createdRun?.id) {
      skipped += 1
      continue
    }

    await ensureReservationSubmittedEvent({
      runId: createdRun.id,
      email,
      summaryLines: payload.summaryLines,
      submissionPayload: payload,
      eventAt: payload.submittedAt,
    })

    await recordReservationRunAttachment({
      registrationId: Number(record?.id || 0),
      runId: createdRun.id,
      runEmail: email,
      registrationEmail: email,
      reason: 'missing_run_backfill',
      eventAt: payload.submittedAt,
    })

    const { data: existingStepOneEvent, error: existingStepOneError } = await supabaseServer
      .from('email_journey_events')
      .select('id')
      .eq('run_id', createdRun.id)
      .eq('event_type', 'reservation_email_sent')
      .eq('step_number', 1)
      .limit(1)
      .maybeSingle()

    if (existingStepOneError) {
      throw new Error(existingStepOneError.message)
    }

    if (!existingStepOneEvent?.id) {
      await supabaseServer.from('email_journey_events').insert({
        run_id: createdRun.id,
        profile_id: null,
        email,
        step_number: 1,
        event_type: 'reservation_email_sent',
        subject: 'Recovered step 1 reservation email',
        body_preview: 'Backfilled tracker state for an already-sent step 1 reservation email.',
        event_payload: {
          repaired: true,
          reason: 'missing_run_backfill',
        },
        event_at: payload.submittedAt,
      })
    }

    await supabaseServer
      .from('email_journey_runs')
      .update({
        status: 'active',
        current_step: 1,
        last_sent_at: payload.submittedAt,
        next_send_at: nextSendAtIso(payload.submittedAt, 1, 'active'),
        updated_at: new Date().toISOString(),
      })
      .eq('id', createdRun.id)

    repaired += 1
  }

  return {
    repaired,
    skipped,
  }
}

async function createRunForEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!isValidEmail(normalizedEmail)) {
    return { created: false, warning: 'Invalid email address.' }
  }

  const { data: registration, error: registrationError } = await supabaseServer
    .from('registrations')
    .select('id, camper_first_name, camper_last_name, guardian_name, guardian_email, guardian_phone, created_at, medical_notes')
    .ilike('guardian_email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (registrationError) {
    throw new Error(registrationError.message)
  }

  if (!registration) {
    return { created: false, warning: `No registration found for ${normalizedEmail}.` }
  }

  const attachedRun = await findAttachedReservationRun(registration?.id, normalizedEmail)
  if (attachedRun?.id) {
    return { created: false, warning: `A journey run is already attached for ${normalizedEmail} (run id: ${attachedRun.id}).` }
  }

  const existingRun = await findRecoverableReservationRun(normalizedEmail, registration?.created_at)
  if (existingRun?.id) {
    return { created: false, warning: `A journey run already exists for ${normalizedEmail} (run id: ${existingRun.id}).` }
  }

  const config = await getMergedAdminConfigForJourneys()
  const weeksById = buildWeeksByIdForJourneys(config)
  const payload = buildRepairPayloadFromRegistration(registration, config, weeksById)
  const runResult = await createOrRecoverReservationRun(normalizedEmail, payload.submittedAt)
  const createdRun = runResult.run
  if (!createdRun?.id) {
    return { created: false, warning: 'Failed to create journey run.' }
  }

  await ensureReservationSubmittedEvent({
    runId: createdRun.id,
    email: normalizedEmail,
    summaryLines: payload.summaryLines,
    submissionPayload: payload,
    eventAt: payload.submittedAt,
  })

  await recordReservationRunAttachment({
    registrationId: Number(registration?.id || 0),
    runId: createdRun.id,
    runEmail: normalizedEmail,
    registrationEmail: normalizedEmail,
    reason: 'manual_assign',
    eventAt: payload.submittedAt,
  })

  const { data: existingStepOneEvent } = await supabaseServer
    .from('email_journey_events')
    .select('id')
    .eq('run_id', createdRun.id)
    .eq('event_type', 'reservation_email_sent')
    .eq('step_number', 1)
    .limit(1)
    .maybeSingle()

  if (!existingStepOneEvent?.id) {
    await supabaseServer.from('email_journey_events').insert({
      run_id: createdRun.id,
      profile_id: null,
      email: normalizedEmail,
      step_number: 1,
      event_type: 'reservation_email_sent',
      subject: 'Recovered step 1 reservation email',
      body_preview: 'Backfilled tracker state for an already-sent step 1 reservation email.',
      event_payload: { repaired: true, reason: 'manual_assign' },
      event_at: payload.submittedAt,
    })
  }

  await supabaseServer
    .from('email_journey_runs')
    .update({
      status: 'active',
      current_step: 1,
      last_sent_at: payload.submittedAt,
      next_send_at: nextSendAtIso(payload.submittedAt, 1, 'active'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', createdRun.id)

  return { created: true, runId: createdRun.id, email: normalizedEmail }
}

async function recordReservationRunAttachment({
  registrationId,
  runId,
  runEmail = '',
  registrationEmail = '',
  reason = 'manual_attach',
  eventAt = '',
}) {
  const normalizedRegistrationId = Number(registrationId || 0)
  const normalizedRunId = Number(runId || 0)
  if (normalizedRegistrationId <= 0 || normalizedRunId <= 0) {
    return
  }

  await supabaseServer.from('email_journey_events').insert({
    run_id: normalizedRunId,
    profile_id: null,
    email: String(runEmail || registrationEmail || '').trim().toLowerCase(),
    step_number: null,
    event_type: 'reservation_run_attached',
    subject: 'Manual run attachment',
    body_preview: 'Admin attached a reservation journey run to a registration row.',
    event_payload: {
      registrationId: normalizedRegistrationId,
      runId: normalizedRunId,
      attached: true,
      reason,
      registrationEmail: String(registrationEmail || '').trim().toLowerCase(),
    },
    event_at: eventAt || new Date().toISOString(),
  })
}

async function setReservationTrackerVisibility({
  registrationId,
  runId,
  email = '',
  hidden = true,
  reason = 'manual_hide',
}) {
  const normalizedRegistrationId = Number(registrationId || 0)
  const normalizedRunId = Number(runId || 0)
  if (normalizedRegistrationId <= 0 && normalizedRunId <= 0) {
    return { updated: false, warning: 'A registration or run is required.' }
  }

  const normalizedEmail = String(email || '').trim().toLowerCase()
  await supabaseServer.from('email_journey_events').insert({
    run_id: normalizedRunId > 0 ? normalizedRunId : null,
    profile_id: null,
    email: normalizedEmail,
    step_number: null,
    event_type: hidden ? 'reservation_tracker_hidden' : 'reservation_tracker_unhidden',
    subject: hidden ? 'Tracker row hidden' : 'Tracker row restored',
    body_preview: hidden
      ? 'Admin hid this reservation row from the tracker.'
      : 'Admin restored this reservation row to the tracker.',
    event_payload: {
      registrationId: normalizedRegistrationId > 0 ? normalizedRegistrationId : null,
      runId: normalizedRunId > 0 ? normalizedRunId : null,
      hidden,
      reason,
    },
    event_at: new Date().toISOString(),
  })

  return {
    updated: true,
    hidden,
    registrationId: normalizedRegistrationId > 0 ? normalizedRegistrationId : null,
    runId: normalizedRunId > 0 ? normalizedRunId : null,
  }
}

async function attachRunToRegistration(registrationId, runId) {
  const normalizedRegistrationId = Number(registrationId || 0)
  const normalizedRunId = Number(runId || 0)
  if (normalizedRegistrationId <= 0 || normalizedRunId <= 0) {
    return { attached: false, warning: 'A valid registration and run are required.' }
  }

  const { data: registration, error: registrationError } = await supabaseServer
    .from('registrations')
    .select('id, camper_first_name, camper_last_name, guardian_name, guardian_email, guardian_phone, created_at, medical_notes')
    .eq('id', normalizedRegistrationId)
    .maybeSingle()

  if (registrationError) {
    throw new Error(registrationError.message)
  }
  if (!registration?.id) {
    return { attached: false, warning: 'Registration record not found.' }
  }

  const { data: run, error: runError } = await supabaseServer
    .from('email_journey_runs')
    .select('id, email, created_at, status')
    .eq('id', normalizedRunId)
    .maybeSingle()

  if (runError) {
    throw new Error(runError.message)
  }
  if (!run?.id) {
    return { attached: false, warning: 'Journey run not found.' }
  }

  if (isTestJourneyStatus(run?.status) || String(run?.status || '').startsWith('lead_')) {
    return { attached: false, warning: 'Only live reservation runs can be attached.' }
  }

  const config = await getMergedAdminConfigForJourneys()
  const weeksById = buildWeeksByIdForJourneys(config)
  const payload = buildRepairPayloadFromRegistration(registration, config, weeksById)

  await ensureReservationSubmittedEvent({
    runId: normalizedRunId,
    email: String(run?.email || registration?.guardian_email || '').trim().toLowerCase(),
    summaryLines: payload.summaryLines,
    submissionPayload: payload,
    eventAt: payload.submittedAt,
  })

  await recordReservationRunAttachment({
    registrationId: normalizedRegistrationId,
    runId: normalizedRunId,
    runEmail: String(run?.email || '').trim().toLowerCase(),
    registrationEmail: String(registration?.guardian_email || '').trim().toLowerCase(),
    reason: 'manual_attach',
    eventAt: payload.submittedAt,
  })

  await supabaseServer
    .from('email_journey_runs')
    .update({
      status: 'active',
      current_step: 1,
      last_sent_at: payload.submittedAt,
      next_send_at: nextSendAtIso(payload.submittedAt, 1, 'active'),
      updated_at: new Date().toISOString(),
    })
    .eq('id', normalizedRunId)

  return {
    attached: true,
    registrationId: normalizedRegistrationId,
    runId: normalizedRunId,
    email: String(run?.email || '').trim().toLowerCase(),
  }
}

async function isAuthorizedAutomationRequest(request) {
  const secret = request.headers.get('x-cron-secret') || ''
  const expected = process.env.AUTOMATION_CRON_SECRET || ''
  if (expected && secret === expected) {
    return true
  }

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return false
  }

  const { data, error } = await supabaseServer.auth.getUser(token)
  if (error || !data?.user) {
    return false
  }
  return true
}

export async function POST(request) {
  try {
    if (!supabaseServerEnabled || !supabaseServer) {
      return Response.json({ error: 'Supabase server client not configured.' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    const action = String(body?.action || '').trim().toLowerCase()

    if (action === 'enqueue') {
      const result = await enqueueReservationJourney(body?.payload || {})
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'process') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await processDueReservationJourneys()
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'manual_send') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await manuallySendReservationStep({
        runId: body?.runId,
        stepKey: body?.stepKey,
        stepNumber: body?.stepNumber,
      })
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'repair_missing_runs') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await repairMissingReservationRuns()
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'create_run_for_email') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await createRunForEmail(body?.email || '')
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'attach_run_to_registration') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await attachRunToRegistration(body?.registrationId, body?.runId)
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'set_tracker_visibility') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await setReservationTrackerVisibility({
        registrationId: body?.registrationId,
        runId: body?.runId,
        email: body?.email,
        hidden: body?.hidden !== false,
        reason: String(body?.reason || 'manual_hide'),
      })
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    return Response.json({ error: 'Invalid action. Use "enqueue", "process", "manual_send", "repair_missing_runs", "create_run_for_email", "attach_run_to_registration", or "set_tracker_visibility".' }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error.message || 'Request failed.' }, { status: 500 })
  }
}
