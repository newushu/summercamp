import { buildLeadJourneyMessage } from '../../../../lib/emailJourneyRenderer'
import {
  createRequestSupabaseClient,
  supabaseServer,
  supabaseServerEnabled,
  supabaseServerHasServiceRole,
} from '../../../../lib/supabaseServer'
import { sendWithSes } from '../../../../lib/emailProvider'
import {
  EARLY_BIRD_R2_FLOW_KEY,
  EARLY_BIRD_R2_JOURNEY_TYPE,
  EARLY_BIRD_R2_RUN_STATUS_ACTIVE,
  EARLY_BIRD_R2_RUN_STATUS_CLOSED,
  EARLY_BIRD_R2_STEPS,
  getEarlyBirdR2Code,
  getEarlyBirdR2ScheduleDays,
  getEarlyBirdR2Step,
  getRoundTwoOfferCopy,
  getRoundTwoTrainMoreSaveMoreCopy,
  getRoundTwoWushuBenefitsCopy,
  getRoundTwoDaysLeft,
  getRoundTwoDeadlineLabel,
  getRoundTwoCountdownLabel,
  getRoundTwoCountdownSentence,
} from '../../../../lib/roundTwoCampaign'

const INTERNAL_EXCLUDE_EMAILS = new Set(['info@newushu.com', 'calvin@newushu.com'])

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

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function splitFirstName(fullName) {
  const safe = String(fullName || '').trim()
  if (!safe) {
    return 'there'
  }
  return safe.split(/\s+/)[0] || 'there'
}

function getSiteBaseUrl() {
  return (
    String(process.env.NEXT_PUBLIC_SITE_URL || '').trim() ||
    String(process.env.SITE_URL || '').trim() ||
    'https://summer.newushu.com'
  )
}

function buildOpenTrackingUrl({ runId = 0, stepNumber = 0 }) {
  const baseUrl = getSiteBaseUrl().replace(/\/$/, '')
  const params = new URLSearchParams({
    flow: EARLY_BIRD_R2_FLOW_KEY,
    runId: String(Number(runId || 0)),
  })
  if (Number(stepNumber || 0) > 0) {
    params.set('stepNumber', String(Number(stepNumber)))
    params.set('stepKey', getEarlyBirdR2Code(stepNumber).toLowerCase())
  }
  return `${baseUrl}/api/email/open?${params.toString()}`
}

function appendOpenTrackingPixel(html, trackingUrl = '') {
  const safeHtml = String(html || '')
  const safeUrl = String(trackingUrl || '').trim()
  if (!safeHtml || !safeUrl) {
    return safeHtml
  }
  return `${safeHtml}<img src="${safeUrl}" alt="" width="1" height="1" style="display:block;width:1px;height:1px;border:0;opacity:0;" />`
}

function computeNextSendAt(createdAtIso, currentStep) {
  const scheduleDays = getEarlyBirdR2ScheduleDays()
  if (currentStep >= scheduleDays.length) {
    return null
  }
  const base = new Date(createdAtIso)
  const nextDayOffset = scheduleDays[currentStep]
  const nextAt = new Date(base.getTime() + nextDayOffset * 24 * 60 * 60 * 1000)
  return nextAt.toISOString()
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

async function getEmailBranding() {
  const envLogoUrl = String(process.env.NEXT_PUBLIC_WELCOME_LOGO_URL || '').trim()
  const { data, error } = await getSupabase()
    .from('camp_admin_settings')
    .select('welcome_logo_url, hero_image_url, landing_carousel_image_urls, survey_step_image_urls, email_journey_templates')
    .eq('id', true)
    .maybeSingle()

  if (error) {
    return { welcomeLogoUrl: envLogoUrl, heroImageUrl: '', landingCarouselImageUrls: [], surveyStepImageUrls: [], journeyImageUrls: [] }
  }

  const journeyImageUrls = (Array.isArray(data?.email_journey_templates) ? data.email_journey_templates : [])
    .map((item) => String(item?.imageUrl || '').trim())
    .filter(Boolean)

  return {
    welcomeLogoUrl: String(data?.welcome_logo_url || envLogoUrl || '').trim(),
    heroImageUrl: String(data?.hero_image_url || '').trim(),
    landingCarouselImageUrls: Array.isArray(data?.landing_carousel_image_urls) ? data.landing_carousel_image_urls : [],
    surveyStepImageUrls: Array.isArray(data?.survey_step_image_urls) ? data.survey_step_image_urls : [],
    journeyImageUrls,
  }
}

function buildAudienceRecommendation(recipient = {}) {
  if (recipient.isRegistered) {
    return 'Already registered? Add more full weeks now to lock in Round 2 pricing and stack Train More, Save More on eligible weeks.'
  }
  return 'General Camp is the best starting point for most families, with Competition Team Boot Camp available for athletes who want a more intensive track.'
}

function buildCampaignTokens(recipient = {}, step = null) {
  const firstName = splitFirstName(recipient.parentName || '')
  const previewDate = step?.scheduledAtIso ? new Date(step.scheduledAtIso) : new Date()
  const primaryCamperName = String(recipient.primaryCamperName || '').trim()
  return {
    first_name: firstName,
    parent_name: firstName,
    guardian_name: recipient.parentName || firstName,
    camper_name: primaryCamperName,
    recommended_plan: buildAudienceRecommendation(recipient),
    registration_link: 'https://summer.newushu.com/register',
    round_two_offer: getRoundTwoOfferCopy(previewDate, primaryCamperName),
    train_more_save_more: getRoundTwoTrainMoreSaveMoreCopy(),
    wushu_why_start: getRoundTwoWushuBenefitsCopy(),
    round_two_days_left: String(getRoundTwoDaysLeft(previewDate)),
    round_two_countdown_label: getRoundTwoCountdownLabel(previewDate),
    round_two_countdown_sentence: getRoundTwoCountdownSentence(previewDate),
    round_two_subject_countdown: getRoundTwoCountdownLabel(previewDate),
    round_two_deadline: getRoundTwoDeadlineLabel(),
  }
}

async function getCampaignRecipients() {
  const db = getSupabase()
  const [leadResponse, registrationResponse] = await Promise.all([
    db
      .from('program_interest_profiles')
      .select('id, email, source, created_at')
      .order('created_at', { ascending: false })
      .limit(1000),
    db
      .from('registrations')
      .select('id, guardian_name, guardian_email, camper_first_name, camper_last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(1000),
  ])

  if (leadResponse.error) {
    throw new Error(leadResponse.error.message)
  }
  if (registrationResponse.error) {
    throw new Error(registrationResponse.error.message)
  }

  const recipients = new Map()
  for (const lead of Array.isArray(leadResponse.data) ? leadResponse.data : []) {
    const email = normalizeEmail(lead?.email)
    if (!isValidEmail(email) || INTERNAL_EXCLUDE_EMAILS.has(email)) continue
    recipients.set(email, {
      email,
      parentName: '',
      primaryCamperName: '',
      source: lead?.source || 'lead',
      isRegistered: false,
      createdAt: lead?.created_at || '',
    })
  }

  for (const registration of Array.isArray(registrationResponse.data) ? registrationResponse.data : []) {
    const email = normalizeEmail(registration?.guardian_email)
    if (!isValidEmail(email) || INTERNAL_EXCLUDE_EMAILS.has(email)) continue
    const existing = recipients.get(email)
    const primaryCamperName = [registration?.camper_first_name, registration?.camper_last_name]
      .map((part) => String(part || '').trim())
      .filter(Boolean)
      .join(' ')
    recipients.set(email, {
      email,
      parentName: registration?.guardian_name || existing?.parentName || '',
      primaryCamperName: existing?.primaryCamperName || primaryCamperName || '',
      source: existing?.source || 'registration',
      isRegistered: true,
      createdAt: existing?.createdAt || registration?.created_at || '',
    })
  }

  return Array.from(recipients.values())
}

async function ensureCampaignRuns() {
  const recipients = await getCampaignRecipients()
  const emails = recipients.map((item) => item.email)
  if (emails.length === 0) {
    return { candidates: 0, created: 0 }
  }

  const { data: existingRuns, error: runError } = await getSupabase()
    .from('email_journey_runs')
    .select('id, email, status')
    .in('email', emails)
    .order('created_at', { ascending: false })

  if (runError) {
    throw new Error(runError.message)
  }

  const runByEmail = new Map()
  for (const run of Array.isArray(existingRuns) ? existingRuns : []) {
    const email = normalizeEmail(run?.email)
    if (!email || runByEmail.has(email)) continue
    if (![EARLY_BIRD_R2_RUN_STATUS_ACTIVE, EARLY_BIRD_R2_RUN_STATUS_CLOSED].includes(String(run?.status || ''))) {
      continue
    }
    runByEmail.set(email, run)
  }

  const rowsToInsert = []
  const eventsToInsert = []
  const nowIso = new Date().toISOString()

  for (const recipient of recipients) {
    if (runByEmail.has(recipient.email)) {
      continue
    }
    rowsToInsert.push({
      email: recipient.email,
      status: EARLY_BIRD_R2_RUN_STATUS_ACTIVE,
      current_step: 0,
      next_send_at: nowIso,
      last_sent_at: null,
      created_at: nowIso,
      updated_at: nowIso,
    })
  }

  if (rowsToInsert.length === 0) {
    return { candidates: recipients.length, created: 0 }
  }

  const { data: insertedRuns, error: insertError } = await getSupabase()
    .from('email_journey_runs')
    .insert(rowsToInsert)
    .select('id, email, created_at')

  if (insertError) {
    throw new Error(insertError.message)
  }

  const insertedMap = new Map(
    (Array.isArray(insertedRuns) ? insertedRuns : []).map((run) => [normalizeEmail(run?.email), run])
  )

  for (const recipient of recipients) {
    const run = insertedMap.get(recipient.email)
    if (!run?.id) continue
    eventsToInsert.push({
      run_id: run.id,
      email: recipient.email,
      step_number: 0,
      event_type: 'early_bird_r2_enqueued',
      subject: 'Round 2 campaign queued',
      body_preview: `${EARLY_BIRD_R2_STEPS.length} campaign emails scheduled for this contact.`,
      event_payload: {
        journeyType: EARLY_BIRD_R2_JOURNEY_TYPE,
        audienceType: recipient.isRegistered ? 'registered_family' : 'lead',
        source: recipient.source || '',
        parentName: recipient.parentName || '',
        primaryCamperName: recipient.primaryCamperName || '',
        scheduleDays: getEarlyBirdR2ScheduleDays(),
      },
      event_at: nowIso,
    })
  }

  if (eventsToInsert.length > 0) {
    await getSupabase().from('email_journey_events').insert(eventsToInsert)
  }

  return { candidates: recipients.length, created: rowsToInsert.length }
}

async function getCampaignPayloadFromRun(runId = 0) {
  const { data, error } = await getSupabase()
    .from('email_journey_events')
    .select('event_payload')
    .eq('run_id', Number(runId || 0))
    .eq('event_type', 'early_bird_r2_enqueued')
    .order('event_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return typeof data?.event_payload === 'object' && data?.event_payload ? data.event_payload : {}
}

async function buildCampaignStepPreview({ run, stepNumber }) {
  const step = getEarlyBirdR2Step(stepNumber)
  if (!step) {
    throw new Error('Invalid campaign step.')
  }
  const payload = run?.id ? await getCampaignPayloadFromRun(run.id) : {}
  const branding = await getEmailBranding()
  const recipient = {
    email: run?.email || '',
    parentName: payload?.parentName || '',
    primaryCamperName: payload?.primaryCamperName || '',
    source: payload?.source || '',
    isRegistered: String(payload?.audienceType || '') === 'registered_family',
  }
  const rendered = buildLeadJourneyMessage({
    template: {
      subject: step.subject,
      body: step.body,
      videoUrl: '',
    },
    tokens: buildCampaignTokens(recipient, step),
    logoUrl: branding.welcomeLogoUrl || '',
    landingCarouselImageUrls:
      Array.isArray(branding.landingCarouselImageUrls) && branding.landingCarouselImageUrls.length > 0
        ? branding.landingCarouselImageUrls
        : Array.isArray(branding.surveyStepImageUrls) && branding.surveyStepImageUrls.some((item) => String(item || '').trim())
          ? branding.surveyStepImageUrls.filter((item) => String(item || '').trim())
        : branding.heroImageUrl
          ? [branding.heroImageUrl]
          : [],
    heroImageUrl:
      Array.isArray(branding.journeyImageUrls) && branding.journeyImageUrls.length > 0
        ? branding.journeyImageUrls[(Math.max(0, Number(stepNumber || 1) - 1)) % branding.journeyImageUrls.length]
        : '',
    stepNumber,
  })
  return {
    subject: rendered.subject,
    bodyText: rendered.bodyText,
    html: rendered.html,
    step,
    payload,
  }
}

async function sendCampaignStepEmail({ run, stepNumber }) {
  const preview = await buildCampaignStepPreview({ run, stepNumber })
  const html = appendOpenTrackingPixel(
    preview.html,
    buildOpenTrackingUrl({ runId: run?.id, stepNumber })
  )

  const sendResult = await sendWithSes({
    toEmail: run.email,
    subject: preview.subject,
    bodyText: preview.bodyText,
    html,
  })

  await getSupabase().from('email_journey_events').insert({
    run_id: run.id,
    email: run.email,
    step_number: stepNumber,
    event_type: sendResult.sent ? 'early_bird_r2_sent' : 'early_bird_r2_preview',
    subject: preview.subject,
    body_preview: preview.bodyText.slice(0, 400),
    event_payload: {
      journeyType: EARLY_BIRD_R2_JOURNEY_TYPE,
      campaignCode: preview.step.code,
      stepKey: preview.step.key,
      audienceType: preview.payload?.audienceType || '',
      daysLeft: getRoundTwoDaysLeft(),
      deadline: getRoundTwoDeadlineLabel(),
      previewOnly: sendResult.previewOnly,
      error: sendResult.error,
    },
  })

  if (!sendResult.sent && !sendResult.previewOnly) {
    throw new Error(sendResult.error || 'Round 2 email failed')
  }

  return sendResult
}

async function manuallySendCampaignStep({ email = '', runId = 0, stepNumber = 1 }) {
  let run = null
  if (Number(runId || 0) > 0) {
    const { data, error } = await getSupabase()
      .from('email_journey_runs')
      .select('id, email, status, current_step, created_at')
      .eq('id', Number(runId))
      .maybeSingle()
    if (error) throw new Error(error.message)
    run = data || null
  }
  const fallbackEmail = normalizeEmail(email || run?.email)
  if (!isValidEmail(fallbackEmail)) {
    throw new Error('A valid campaign email is required.')
  }
  const targetStep = Math.max(1, Math.min(EARLY_BIRD_R2_STEPS.length, Number(stepNumber || 1)))
  const sendResult = await sendCampaignStepEmail({
    run: {
      id: run?.id || null,
      email: fallbackEmail,
      created_at: run?.created_at || new Date().toISOString(),
    },
    stepNumber: targetStep,
  })

  if (run?.id) {
    const nextSendAt = computeNextSendAt(run.created_at || new Date().toISOString(), targetStep)
    const nextStatus = targetStep >= EARLY_BIRD_R2_STEPS.length ? EARLY_BIRD_R2_RUN_STATUS_CLOSED : EARLY_BIRD_R2_RUN_STATUS_ACTIVE
    await getSupabase()
      .from('email_journey_runs')
      .update({
        status: nextStatus,
        current_step: targetStep,
        last_sent_at: new Date().toISOString(),
        next_send_at: nextStatus === EARLY_BIRD_R2_RUN_STATUS_CLOSED ? null : nextSendAt,
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

async function previewCampaignStep({ email = '', runId = 0, stepNumber = 1 }) {
  let run = null
  if (Number(runId || 0) > 0) {
    const { data, error } = await getSupabase()
      .from('email_journey_runs')
      .select('id, email, status, current_step, created_at')
      .eq('id', Number(runId))
      .maybeSingle()
    if (error) throw new Error(error.message)
    run = data || null
  }
  const fallbackEmail = normalizeEmail(email || run?.email)
  if (!isValidEmail(fallbackEmail)) {
    throw new Error('A valid campaign email is required.')
  }
  const targetStep = Math.max(1, Math.min(EARLY_BIRD_R2_STEPS.length, Number(stepNumber || 1)))
  const preview = await buildCampaignStepPreview({
    run: {
      id: run?.id || null,
      email: fallbackEmail,
      created_at: run?.created_at || new Date().toISOString(),
    },
    stepNumber: targetStep,
  })
  return {
    stepNumber: targetStep,
    email: fallbackEmail,
    subject: preview.subject,
    bodyText: preview.bodyText,
    html: preview.html,
  }
}

async function processCampaignRuns() {
  const queue = await ensureCampaignRuns()
  const { data: runs, error } = await getSupabase()
    .from('email_journey_runs')
    .select('id, email, status, current_step, created_at, next_send_at')
    .eq('status', EARLY_BIRD_R2_RUN_STATUS_ACTIVE)
    .order('created_at', { ascending: false })
    .limit(1500)

  if (error) {
    throw new Error(error.message)
  }

  let emailed = 0
  let processed = 0
  const stepCounts = Object.fromEntries(EARLY_BIRD_R2_STEPS.map((step) => [step.key, 0]))
  const now = Date.now()

  for (const run of Array.isArray(runs) ? runs : []) {
    processed += 1
    const nextStep = Number(run?.current_step || 0) + 1
    if (nextStep > EARLY_BIRD_R2_STEPS.length || getRoundTwoDaysLeft() <= 0) {
      await getSupabase()
        .from('email_journey_runs')
        .update({
          status: EARLY_BIRD_R2_RUN_STATUS_CLOSED,
          next_send_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', run.id)
      continue
    }
    const dueAt = String(run?.next_send_at || '').trim()
    const dueTime = dueAt ? new Date(dueAt).getTime() : NaN
    if (!Number.isNaN(dueTime) && dueTime > now) {
      continue
    }

    const sendResult = await sendCampaignStepEmail({ run, stepNumber: nextStep })
    const nextSendAt = computeNextSendAt(run.created_at || new Date().toISOString(), nextStep)
    const nextStatus = nextStep >= EARLY_BIRD_R2_STEPS.length ? EARLY_BIRD_R2_RUN_STATUS_CLOSED : EARLY_BIRD_R2_RUN_STATUS_ACTIVE

    await getSupabase()
      .from('email_journey_runs')
      .update({
        status: nextStatus,
        current_step: nextStep,
        last_sent_at: new Date().toISOString(),
        next_send_at: nextStatus === EARLY_BIRD_R2_RUN_STATUS_CLOSED ? null : nextSendAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', run.id)

    if (sendResult?.sent || sendResult?.previewOnly) {
      emailed += 1
      const step = getEarlyBirdR2Step(nextStep)
      if (stepCounts[step.key] !== undefined) {
        stepCounts[step.key] += 1
      }
    }
  }

  return {
    processed,
    emailed,
    queued: queue.created,
    stepCounts,
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

    if (action === 'process') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await processCampaignRuns()
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'manual_send') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await manuallySendCampaignStep({
        email: body?.email,
        runId: body?.runId,
        stepNumber: body?.stepNumber,
      })
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    if (action === 'preview_step') {
      const authorized = await isAuthorizedAutomationRequest(request)
      if (!authorized) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const result = await previewCampaignStep({
        email: body?.email,
        runId: body?.runId,
        stepNumber: body?.stepNumber,
      })
      return Response.json({ ok: true, action, ...result }, { status: 200 })
    }

    return Response.json({ error: 'Invalid action. Use "process", "manual_send", or "preview_step".' }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error.message || 'Request failed.' }, { status: 500 })
  }
}
