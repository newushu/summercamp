import { defaultAdminConfig } from '../../../../lib/campAdmin'
import {
  createRequestSupabaseClient,
  supabaseServer,
  supabaseServerEnabled,
  supabaseServerHasServiceRole,
} from '../../../../lib/supabaseServer'
import { sendWithSes } from '../../../../lib/emailProvider'

const CAMP_NAME = 'New England Wushu Summer Camp'
const PAYMENT_METHODS_TEXT = [
  'Zelle: wushu688@gmail.com',
  'Venmo: @newushu',
  'Check (payable to Newushu): 123 Muller Rd',
].join('\n')

let requestSupabaseServer = supabaseServer

function getSupabase() {
  return requestSupabaseServer
}

function setRequestSupabaseServer(accessToken = '') {
  if (supabaseServerHasServiceRole || !String(accessToken || '').trim()) {
    requestSupabaseServer = supabaseServer
    return
  }
  requestSupabaseServer = createRequestSupabaseClient(accessToken) || supabaseServer
}

function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim())
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

function renderTemplate(template, tokens) {
  return Object.entries(tokens).reduce((output, [token, value]) => {
    return String(output || '').replaceAll(`{${token}}`, String(value || ''))
  }, String(template || ''))
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

function splitBodyIntoSections(bodyText) {
  return String(bodyText || '')
    .split(/\n\s*\n/g)
    .map((block) => block.split('\n').map((line) => String(line || '').trim()).filter(Boolean))
    .filter((group) => group.length > 0)
}

function parseDayOffset(dayLabel, fallbackDays) {
  const label = String(dayLabel || '').toLowerCase().trim()
  if (!label || label.includes('immediate')) {
    return 0
  }
  const dayMatch = label.match(/(\d+)/)
  if (dayMatch) {
    return Math.max(0, Number(dayMatch[1] || fallbackDays))
  }
  if (label.includes('evening') || label.includes('today')) {
    return 0
  }
  return fallbackDays
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

function buildMarketingEmailHtml({ heading, preview, bodyText, ctaLink, recommendation = '', logoUrl = '', heroImageUrl = '' }) {
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
  return `
    <div style="margin:0;padding:20px;background:linear-gradient(180deg,#fff7ed 0%,#eff6ff 100%);">
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

async function getEmailBranding() {
  const envLogoUrl = String(process.env.NEXT_PUBLIC_WELCOME_LOGO_URL || '').trim()
  const { data, error } = await getSupabase()
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

async function getJourneyTemplates() {
  const db = getSupabase()
  const { data, error } = await db
    .from('camp_admin_settings')
    .select('email_journey_templates')
    .eq('id', true)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  const incoming = Array.isArray(data?.email_journey_templates) ? data.email_journey_templates : []
  const looksLikeReservationTemplate = (item = {}) => {
    const haystack = [
      item?.dayLabel,
      item?.title,
      item?.subject,
      item?.body,
    ]
      .map((value) => String(value || '').toLowerCase())
      .join(' ')

    return (
      haystack.includes('{amount_due}') ||
      haystack.includes('{payment_methods}') ||
      haystack.includes('{registration_summary}') ||
      haystack.includes('reservation hold') ||
      haystack.includes('auto-cancel') ||
      haystack.includes('friendly reminder') ||
      haystack.includes('payment confirmation') ||
      haystack.includes('72 hours')
    )
  }

  return Array.from({ length: 5 }).map((_, index) => {
    const fallback = defaultAdminConfig.emailJourney[index]
    const item = incoming[index] || {}
    if (looksLikeReservationTemplate(item)) {
      return { ...fallback }
    }
    return {
      dayLabel: typeof item.dayLabel === 'string' ? item.dayLabel : fallback.dayLabel,
      title: typeof item.title === 'string' ? item.title : fallback.title,
      subject: typeof item.subject === 'string' ? item.subject : fallback.subject,
      body: typeof item.body === 'string' ? item.body : fallback.body,
    }
  })
}

function buildLeadSchedule(templates) {
  const fallbackDays = [0, 2, 4, 6, 8]
  return templates.map((template, index) => parseDayOffset(template.dayLabel, fallbackDays[index] || index * 2))
}

function buildFallbackLeadRecommendationFromPayload(payload) {
  const summaryLines = Array.isArray(payload?.summaryLines) ? payload.summaryLines : []
  const haystack = summaryLines.map((line) => String(line || '').toLowerCase()).join(' ')
  const competitionTrack =
    haystack.includes('competition') ||
    haystack.includes('team member') ||
    haystack.includes('competition team')

  if (competitionTrack) {
    return 'Recommended fit: Competition Team Boot Camp. If your camper wishes to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.'
  }

  return 'Recommended fit: General Camp with progression options. This is the best default starting point for families who have not completed the full survey yet.'
}

async function hasCompletedRegistration(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!isValidEmail(normalizedEmail)) {
    return false
  }

  const db = getSupabase()
  const { data, error } = await db
    .from('registrations')
    .select('id')
    .eq('guardian_email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data?.id)
}

async function sendLeadStepEmail({ run, payload, templates, scheduleDays, stepNumber }) {
  const index = Math.max(0, Math.min(templates.length - 1, stepNumber - 1))
  const template = templates[index]
  const firstName = splitFirstName(payload?.guardianName || '')
  const summaryLines = Array.isArray(payload?.summaryLines) ? payload.summaryLines : []
  const recommendation =
    String(payload?.recommendation || '').trim() || buildFallbackLeadRecommendationFromPayload(payload)
  const submittedAt = payload?.submittedAt || run.created_at || new Date().toISOString()
  const reservationDeadline = new Date(new Date(submittedAt).getTime() + 72 * 60 * 60 * 1000).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
  const ctaLink = payload?.registrationLink || 'https://summer.newushu.com/register'
  const tokens = {
    first_name: firstName,
    parent_name: firstName,
    guardian_name: payload?.guardianName || firstName,
    recommended_plan: recommendation,
    registration_link: ctaLink,
    payment_methods: PAYMENT_METHODS_TEXT,
    reservation_deadline: reservationDeadline,
    registration_summary: summaryLines.join('\n'),
    app_launch_date: 'June 20',
  }

  const subject = renderTemplate(template.subject, tokens)
  const bodyText = renderTemplate(template.body, tokens)
  const branding = await getEmailBranding()
  const html = buildMarketingEmailHtml({
    heading: subject,
    preview: 'Summer 2026 Family Update',
    bodyText,
    ctaLink,
    recommendation,
    logoUrl: branding?.welcomeLogoUrl || '',
    heroImageUrl: pickJourneyImage(branding?.landingCarouselImageUrls, stepNumber - 1),
  })

  const sendResult = await sendWithSes({
    toEmail: run.email,
    subject,
    bodyText,
    html,
  })

  await getSupabase().from('email_journey_events').insert({
    run_id: run.id,
    profile_id: run.profile_id,
    email: run.email,
    step_number: stepNumber,
    event_type: sendResult.sent ? 'lead_journey_sent' : 'lead_journey_preview',
    subject,
    body_preview: bodyText.slice(0, 400),
    event_payload: {
      journeyType: 'lead_assistant',
      dayLabel: template.dayLabel,
      scheduleDays: scheduleDays[index] || 0,
      previewOnly: sendResult.previewOnly,
      error: sendResult.error,
    },
  })

  if (!sendResult.sent && !sendResult.previewOnly) {
    throw new Error(sendResult.error || 'Lead journey email failed')
  }

  return {
    sent: sendResult.sent,
    previewOnly: sendResult.previewOnly,
    error: sendResult.error,
  }
}

function computeNextSendAt(submittedAtIso, currentStep, scheduleDays) {
  if (currentStep >= scheduleDays.length) {
    return null
  }
  const base = new Date(submittedAtIso)
  const nextDayOffset = scheduleDays[currentStep]
  const nextAt = new Date(base.getTime() + nextDayOffset * 24 * 60 * 60 * 1000)
  return nextAt.toISOString()
}

async function enqueueLeadJourney(payload) {
  const email = String(payload?.contactEmail || '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    throw new Error('A valid contact email is required.')
  }

  if (await hasCompletedRegistration(email)) {
    return { converted: true, deduped: true }
  }

  const { data: existingActiveRun, error: existingRunError } = await getSupabase()
    .from('email_journey_runs')
    .select('id')
    .eq('email', email)
    .eq('status', 'lead_active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingRunError) {
    throw new Error(existingRunError.message)
  }
  if (existingActiveRun?.id) {
    return { runId: existingActiveRun.id, deduped: true }
  }

  const templates = await getJourneyTemplates()
  const scheduleDays = buildLeadSchedule(templates)
  const submittedAt = payload?.submittedAt || new Date().toISOString()
  const nextSendAt = computeNextSendAt(submittedAt, 0, scheduleDays) || new Date().toISOString()

  const { data: run, error: runError } = await getSupabase()
    .from('email_journey_runs')
    .insert({
      email,
      status: 'lead_active',
      current_step: 0,
      next_send_at: nextSendAt,
    })
    .select('id, email, status, current_step, profile_id, created_at')
    .single()

  if (runError) {
    throw new Error(runError.message)
  }

  await getSupabase().from('email_journey_events').insert({
    run_id: run.id,
    profile_id: null,
    email,
    step_number: 0,
    event_type: 'lead_journey_enqueued',
    subject: 'Lead follow-up queued',
    body_preview: String(payload?.recommendation || '').slice(0, 350),
    event_payload: {
      journeyType: 'lead_assistant',
      submittedAt,
      guardianName: payload?.guardianName || '',
      recommendation: payload?.recommendation || '',
      summaryLines: Array.isArray(payload?.summaryLines) ? payload.summaryLines : [],
      scheduleDays,
    },
  })

  return { runId: run.id }
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

  const { data, error } = await getSupabase().auth.getUser(token)
  if (error || !data?.user) {
    return false
  }
  return true
}

async function getLeadPayloadFromRun(runId) {
  const { data, error } = await getSupabase()
    .from('email_journey_events')
    .select('event_payload')
    .eq('run_id', runId)
    .eq('event_type', 'lead_journey_enqueued')
    .order('event_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }
  return data?.event_payload || null
}

async function getLeadProfileByEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!isValidEmail(normalizedEmail)) {
    return null
  }

  const { data, error } = await getSupabase()
    .from('program_interest_profiles')
    .select('id, email, camper_count, camper_ages, profile_context, created_at')
    .ilike('email', normalizedEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data || null
}

async function getLeadStepOneEventEmails(emails) {
  if (!Array.isArray(emails) || emails.length === 0) {
    return new Set()
  }

  const { data, error } = await getSupabase()
    .from('email_journey_events')
    .select('email, event_type, step_number')
    .in('email', emails)
    .eq('step_number', 1)
    .in('event_type', ['lead_journey_sent', 'lead_journey_preview'])

  if (error) {
    throw new Error(error.message)
  }

  return new Set((data || []).map((item) => String(item?.email || '').trim().toLowerCase()).filter(Boolean))
}

function buildProfileSummaryLines(profile) {
  const context = profile?.profile_context && typeof profile.profile_context === 'object' ? profile.profile_context : {}
  const camperCount = Math.max(1, Number(profile?.camper_count || context?.camperCount || 1))
  const camperAges = Array.isArray(profile?.camper_ages)
    ? profile.camper_ages
    : Array.isArray(context?.camperAges)
      ? context.camperAges
      : []

  return [
    `Camper count: ${camperCount}`,
    `Camper ages: ${camperAges.filter(Boolean).join(', ') || 'n/a'}`,
    `Sports participation: ${context?.hasSports || 'n/a'}`,
    `Martial arts experience: ${context?.hasMartial || 'n/a'}`,
    `Goals: ${Array.isArray(context?.goals) && context.goals.length > 0 ? context.goals.join(', ') : 'n/a'}`,
  ]
}

function buildFallbackLeadRecommendation(profile) {
  const context = profile?.profile_context && typeof profile.profile_context === 'object' ? profile.profile_context : {}
  const goals = Array.isArray(context?.goals) ? context.goals : []
  const martialYears = Number(context?.martialYears || 0) + Number(context?.martialMonths || 0) / 12
  const competitionTrack = goals.includes('competition') || martialYears >= 3

  if (competitionTrack) {
    return 'Recommended fit: Competition Team Boot Camp. If your camper wishes to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.'
  }

  return 'Recommended fit: General Camp with progression options. This is the best default starting point for families who have not completed the full survey yet.'
}

async function ensureLeadJourneysQueued() {
  const { data: profiles, error: profileError } = await getSupabase()
    .from('program_interest_profiles')
    .select('id, email, camper_count, camper_ages, profile_context, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (profileError) {
    throw new Error(profileError.message)
  }

  const candidates = (profiles || []).filter((profile) => isValidEmail(profile?.email))
  if (candidates.length === 0) {
    return {
      candidates: 0,
      queued: 0,
      skippedRegistered: 0,
      skippedActive: 0,
      skippedExistingStepOne: 0,
      revived: 0,
      enqueuedNew: 0,
    }
  }

  const emails = candidates.map((profile) => String(profile.email).trim().toLowerCase())
  const { data: existingRuns, error: runError } = await getSupabase()
    .from('email_journey_runs')
    .select('email, status, current_step, created_at')
    .in('email', emails)
    .in('status', ['lead_active', 'lead_closed', 'error', 'queued'])

  if (runError) {
    throw new Error(runError.message)
  }

  const runMap = new Map()
  for (const run of existingRuns || []) {
    const email = String(run?.email || '').trim().toLowerCase()
    if (!email) {
      continue
    }
    const current = runMap.get(email)
    if (!current || new Date(run.created_at || 0).getTime() > new Date(current.created_at || 0).getTime()) {
      runMap.set(email, run)
    }
  }

  let queued = 0
  let skippedRegistered = 0
  let skippedActive = 0
  let skippedExistingStepOne = 0
  let revived = 0
  let enqueuedNew = 0
  const stepOneSentEmails = await getLeadStepOneEventEmails(emails)
  for (const profile of candidates) {
    const email = String(profile.email || '').trim().toLowerCase()
    if (!email) {
      continue
    }
    if (await hasCompletedRegistration(email)) {
      skippedRegistered += 1
      continue
    }

    const existingRun = runMap.get(email)
    if (existingRun?.status === 'lead_active') {
      skippedActive += 1
      continue
    }
    if (Number(existingRun?.current_step || 0) >= 1 && stepOneSentEmails.has(email)) {
      skippedExistingStepOne += 1
      continue
    }

    if (existingRun && ['queued', 'error'].includes(String(existingRun.status || '').toLowerCase())) {
      await getSupabase()
        .from('email_journey_runs')
        .update({
          status: 'lead_active',
          current_step: 0,
          next_send_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('email', email)
        .eq('status', existingRun.status)
      queued += 1
      revived += 1
      continue
    }

    await enqueueLeadJourney({
      contactEmail: email,
      guardianName: email,
      submittedAt: profile?.created_at || new Date().toISOString(),
      recommendation: '',
      summaryLines: buildProfileSummaryLines(profile),
    })
    queued += 1
    enqueuedNew += 1
  }

  return {
    candidates: candidates.length,
    queued,
    skippedRegistered,
    skippedActive,
    skippedExistingStepOne,
    revived,
    enqueuedNew,
  }
}

async function sendMissingLeadStepOneEmails() {
  const { data: profiles, error: profileError } = await getSupabase()
    .from('program_interest_profiles')
    .select('id, email, camper_count, camper_ages, profile_context, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (profileError) {
    throw new Error(profileError.message)
  }

  const candidates = (profiles || []).filter((profile) => isValidEmail(profile?.email))
  if (candidates.length === 0) {
    return {
      candidates: 0,
      bootstrapped: 0,
      emailed: 0,
      skippedRegistered: 0,
      skippedExistingStepOne: 0,
      skippedAlreadyAdvanced: 0,
      skippedNoRunAfterEnqueue: 0,
    }
  }

  const emails = candidates.map((profile) => String(profile.email).trim().toLowerCase())
  const [existingRunsResponse, stepOneSentEmails] = await Promise.all([
    getSupabase()
      .from('email_journey_runs')
      .select('id, profile_id, email, status, current_step, created_at, next_send_at, last_sent_at')
      .in('email', emails)
      .in('status', ['lead_active', 'queued', 'error', 'lead_closed']),
    getLeadStepOneEventEmails(emails),
  ])

  if (existingRunsResponse.error) {
    throw new Error(existingRunsResponse.error.message)
  }

  const runMap = new Map()
  for (const run of existingRunsResponse.data || []) {
    const email = String(run?.email || '').trim().toLowerCase()
    if (!email) continue
    const current = runMap.get(email)
    if (!current || new Date(run.created_at || 0).getTime() > new Date(current.created_at || 0).getTime()) {
      runMap.set(email, run)
    }
  }

  const templates = await getJourneyTemplates()
  const scheduleDays = buildLeadSchedule(templates)
  let bootstrapped = 0
  let emailed = 0
  let skippedRegistered = 0
  let skippedExistingStepOne = 0
  let skippedAlreadyAdvanced = 0
  let skippedNoRunAfterEnqueue = 0

  for (const profile of candidates) {
    const email = String(profile.email || '').trim().toLowerCase()
    if (!email) {
      continue
    }
    if (stepOneSentEmails.has(email)) {
      skippedExistingStepOne += 1
      continue
    }
    if (await hasCompletedRegistration(email)) {
      skippedRegistered += 1
      continue
    }

    let run = runMap.get(email) || null
    if (!run) {
      const enqueueResult = await enqueueLeadJourney({
        contactEmail: email,
        guardianName: email,
        submittedAt: profile?.created_at || new Date().toISOString(),
        recommendation: '',
        summaryLines: buildProfileSummaryLines(profile),
      })

      if (!enqueueResult?.runId) {
        skippedNoRunAfterEnqueue += 1
        continue
      }

      const { data: createdRun, error: createdRunError } = await getSupabase()
        .from('email_journey_runs')
        .select('id, profile_id, email, status, current_step, created_at, next_send_at, last_sent_at')
        .eq('id', enqueueResult.runId)
        .maybeSingle()

      if (createdRunError) {
        throw new Error(createdRunError.message)
      }

      run = createdRun || null
      if (run) {
        runMap.set(email, run)
      }
      bootstrapped += 1
    } else if (Number(run.current_step || 0) >= 1 && stepOneSentEmails.has(email)) {
      skippedAlreadyAdvanced += 1
      continue
    }

    if (!run) {
      skippedNoRunAfterEnqueue += 1
      continue
    }

    const payload =
      (await getLeadPayloadFromRun(run.id)) || {
        submittedAt: profile?.created_at || run.created_at || new Date().toISOString(),
        guardianName: email,
        recommendation: '',
        summaryLines: buildProfileSummaryLines(profile),
      }

    await sendLeadStepEmail({
      run,
      payload,
      templates,
      scheduleDays,
      stepNumber: 1,
    })

    const nextSendAt = computeNextSendAt(payload?.submittedAt || run.created_at, 1, scheduleDays)
    const nextStatus = templates.length <= 1 ? 'lead_closed' : 'lead_active'

    await getSupabase()
      .from('email_journey_runs')
      .update({
        status: nextStatus,
        current_step: 1,
        last_sent_at: new Date().toISOString(),
        next_send_at: nextStatus === 'lead_closed' ? null : nextSendAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', run.id)

    emailed += 1
  }

  return {
    candidates: candidates.length,
    bootstrapped,
    emailed,
    skippedRegistered,
    skippedExistingStepOne,
    skippedAlreadyAdvanced,
    skippedNoRunAfterEnqueue,
  }
}

async function processLeadJourneys() {
  const queuedSummary = await ensureLeadJourneysQueued()
  const immediateStepOne = await sendMissingLeadStepOneEmails()
  const nowIso = new Date().toISOString()
  const { data: runs, error } = await getSupabase()
    .from('email_journey_runs')
    .select('id, profile_id, email, status, current_step, created_at, next_send_at')
    .in('status', ['lead_active', 'queued', 'error'])
    .lte('next_send_at', nowIso)
    .order('next_send_at', { ascending: true })
    .limit(60)

  if (error) {
    throw new Error(error.message)
  }

  let processed = 0
  let emailed = Number(immediateStepOne?.emailed || 0)
  let closed = 0

  for (const run of runs || []) {
    processed += 1
    try {
      if (await hasCompletedRegistration(run.email)) {
        await getSupabase()
          .from('email_journey_runs')
          .update({
            status: 'lead_closed',
            next_send_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', run.id)

        await getSupabase().from('email_journey_events').insert({
          run_id: run.id,
          profile_id: run.profile_id || null,
          email: run.email,
          step_number: Number(run.current_step || 0),
          event_type: 'lead_journey_closed_registration_submitted',
          subject: 'Lead journey closed after registration submission',
          body_preview: 'Closed because this email already exists on a completed registration.',
          event_payload: { journeyType: 'lead_assistant' },
        })

        closed += 1
        continue
      }

      if (String(run.status || '').toLowerCase() !== 'lead_active') {
        await getSupabase()
          .from('email_journey_runs')
          .update({
            status: 'lead_active',
            current_step: Number(run.current_step || 0),
            next_send_at: run.next_send_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', run.id)
      }

      let payload = await getLeadPayloadFromRun(run.id)
      if (!payload) {
        const profile = await getLeadProfileByEmail(run.email)
        payload = {
          submittedAt: profile?.created_at || run.created_at || new Date().toISOString(),
          guardianName: run.email,
          recommendation: '',
          summaryLines: buildProfileSummaryLines(profile || {}),
        }
      }
      const scheduleDays = Array.isArray(payload?.scheduleDays) ? payload.scheduleDays : [0, 2, 4, 6, 8]
      const templates = await getJourneyTemplates()
      const nextStep = Number(run.current_step || 0) + 1

      if (nextStep > templates.length) {
        await getSupabase()
          .from('email_journey_runs')
          .update({
            status: 'lead_closed',
            next_send_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', run.id)
        closed += 1
        continue
      }

      await sendLeadStepEmail({
        run,
        payload,
        templates,
        scheduleDays,
        stepNumber: nextStep,
      })
      emailed += 1

      const nextSendAt = computeNextSendAt(payload?.submittedAt || run.created_at, nextStep, scheduleDays)
      const nextStatus = nextStep >= templates.length ? 'lead_closed' : 'lead_active'
      if (nextStatus === 'lead_closed') {
        closed += 1
      }

      await getSupabase()
        .from('email_journey_runs')
        .update({
          status: nextStatus,
          current_step: nextStep,
          last_sent_at: new Date().toISOString(),
          next_send_at: nextStatus === 'lead_closed' ? null : nextSendAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', run.id)
    } catch (runError) {
      await getSupabase()
        .from('email_journey_runs')
        .update({
          status: 'error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', run.id)

      await getSupabase().from('email_journey_events').insert({
        run_id: run.id,
        profile_id: run.profile_id,
        email: run.email,
        step_number: null,
        event_type: 'lead_journey_error',
        subject: 'Lead journey error',
        body_preview: String(runError?.message || 'Unknown error').slice(0, 350),
        event_payload: { journeyType: 'lead_assistant' },
      })
    }
  }

  return {
    queued: Number(queuedSummary?.queued || 0) + Number(immediateStepOne?.bootstrapped || 0),
    processed,
    emailed,
    closed,
    debug: {
      queue: queuedSummary,
      stepOne: immediateStepOne,
      dueRunsChecked: Array.isArray(runs) ? runs.length : 0,
    },
  }
}

async function manuallySendLeadStep({ email = '', runId = 0, stepNumber = 1 }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const targetStep = Math.max(1, Math.min(5, Number(stepNumber || 1)))
  let run = null

  if (Number(runId || 0) > 0) {
    const { data, error } = await getSupabase()
      .from('email_journey_runs')
      .select('id, profile_id, email, status, current_step, created_at, next_send_at, last_sent_at')
      .eq('id', Number(runId))
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }
    run = data || null
  }

  const fallbackEmail = normalizedEmail || String(run?.email || '').trim().toLowerCase()
  if (!isValidEmail(fallbackEmail)) {
    throw new Error('A valid lead email is required.')
  }

  const profile = await getLeadProfileByEmail(fallbackEmail)
  const templates = await getJourneyTemplates()
  const scheduleDays = buildLeadSchedule(templates)
  const payload =
    (run?.id ? await getLeadPayloadFromRun(run.id) : null) || {
      submittedAt: profile?.created_at || run?.created_at || new Date().toISOString(),
      guardianName: fallbackEmail,
      recommendation: buildFallbackLeadRecommendation(profile || {}),
      summaryLines: buildProfileSummaryLines(profile || {}),
    }

  const sendResult = await sendLeadStepEmail({
    run: {
      id: run?.id || null,
      profile_id: run?.profile_id || profile?.id || null,
      email: fallbackEmail,
      created_at: run?.created_at || profile?.created_at || new Date().toISOString(),
    },
    payload,
    templates,
    scheduleDays,
    stepNumber: targetStep,
  })

  if (run?.id) {
    const submittedAt = payload?.submittedAt || run?.created_at || new Date().toISOString()
    const nextSendAt = computeNextSendAt(submittedAt, targetStep, scheduleDays)
    const nextStatus = targetStep >= templates.length ? 'lead_closed' : 'lead_active'
    await getSupabase()
      .from('email_journey_runs')
      .update({
        status: nextStatus,
        current_step: targetStep,
        last_sent_at: new Date().toISOString(),
        next_send_at: nextStatus === 'lead_closed' ? null : nextSendAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', run.id)
  }

  return {
    emailed: 1,
    stepNumber: targetStep,
    email: fallbackEmail,
    sent: Boolean(sendResult?.sent),
    previewOnly: Boolean(sendResult?.previewOnly),
  }
}

export async function POST(request) {
  try {
    if (!supabaseServerEnabled || !supabaseServer) {
      return Response.json({ error: 'Supabase server client not configured.' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization') || ''
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
    setRequestSupabaseServer(accessToken)

    const body = await request.json().catch(() => ({}))
    const action = String(body?.action || '').trim().toLowerCase()

    if (action === 'enqueue') {
      const result = await enqueueLeadJourney(body?.payload || {})
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'process') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await processLeadJourneys()
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'manual_send') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await manuallySendLeadStep({
        email: body?.email,
        runId: body?.runId,
        stepNumber: body?.stepNumber,
      })
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    return Response.json({ error: 'Invalid action. Use "enqueue", "process", or "manual_send".' }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error.message || 'Request failed.' }, { status: 500 })
  } finally {
    setRequestSupabaseServer('')
  }
}
