'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildProgramWeekOptions, defaultAdminConfig, formatWeekLabel } from '../../lib/campAdmin'
import {
  fetchAdminConfigFromSupabase,
  filterSelectedWeeksByDateWindow,
  saveAdminConfigToSupabase,
} from '../../lib/campAdminApi'
import {
  getMediaBucketName,
  listMediaLibrary,
  uploadFilesToMediaBucket,
} from '../../lib/mediaLibraryApi'
import { supabase, supabaseEnabled } from '../../lib/supabase'

const programMeta = {
  general: {
    title: 'General Camp',
    rhythm: 'Auto-generated Monday to Friday weeks',
  },
  bootcamp: {
    title: 'Competition Team Boot Camp',
    rhythm: 'Auto-generated Monday to Friday weeks',
  },
  overnight: {
    title: 'Overnight Camp',
    rhythm: 'Auto-generated 7-day blocks starting Saturday',
  },
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function roundUpToFive(value) {
  const next = Math.ceil(Number(value || 0) / 5) * 5
  return Number.isFinite(next) ? Math.max(0, next) : 0
}

function discountAmount(regular, discountedPrice) {
  return Math.max(0, Number(regular || 0) - Number(discountedPrice || 0))
}

function buildBootcampTuition(tuition) {
  const premiumFactor = 1 + Number(tuition.bootcampPremiumPct || 0) / 100
  const derive = (value) => roundUpToFive(Number(value || 0) * premiumFactor)

  return {
    regular: {
      fullWeek: derive(tuition.regular.fullWeek),
      fullDay: derive(tuition.regular.fullDay),
      amHalf: derive(tuition.regular.amHalf),
      pmHalf: derive(tuition.regular.pmHalf),
    },
    discount: {
      fullWeek: derive(tuition.discount.fullWeek),
      fullDay: derive(tuition.discount.fullDay),
      amHalf: derive(tuition.discount.amHalf),
      pmHalf: derive(tuition.discount.pmHalf),
    },
  }
}

function buildTuitionChecks(tuition) {
  const regular = tuition.regular
  const discounted = tuition.discount

  function evaluateRule(label, baselineValue, unitPrice, unitCount, multiplier) {
    const baseline = Number(baselineValue || 0)
    const actualTotal = Number(unitPrice || 0) * unitCount
    const targetTotal = baseline > 0 ? roundUpToFive(baseline * multiplier) : 0
    const targetUnit = baseline > 0 ? roundUpToFive(targetTotal / unitCount) : 0
    const deficitTotal = Math.max(0, targetTotal - actualTotal)
    const deficitUnit = deficitTotal > 0 ? roundUpToFive(deficitTotal / unitCount) : 0
    const pass = baseline > 0 ? actualTotal >= targetTotal : true

    return {
      pass,
      line: `${label}: ${money(actualTotal)} vs target ${money(targetTotal)} (${money(targetUnit)} per day)`,
      raiseText: pass ? '' : `Raise by ${money(deficitTotal)} total (about +${money(deficitUnit)}/day)`,
    }
  }

  const regularFullDay = evaluateRule('Regular Full Day x5', regular.fullWeek, regular.fullDay, 5, 1.15)
  const discountFullDay = evaluateRule('Discounted Full Day x5', discounted.fullWeek, discounted.fullDay, 5, 1.15)
  const regularAM = evaluateRule('Regular AM x5', regular.fullWeek, regular.amHalf, 5, 0.65)
  const discountAM = evaluateRule('Discounted AM x5', discounted.fullWeek, discounted.amHalf, 5, 0.65)
  const regularPM = evaluateRule('Regular PM x5', regular.fullWeek, regular.pmHalf, 5, 0.75)
  const discountPM = evaluateRule('Discounted PM x5', discounted.fullWeek, discounted.pmHalf, 5, 0.75)
  const regularOvernight = evaluateRule(
    'Regular Overnight Day x7',
    regular.overnightWeek,
    regular.overnightDay,
    7,
    1.35
  )
  const discountOvernight = evaluateRule(
    'Discounted Overnight Day x7',
    discounted.overnightWeek,
    discounted.overnightDay,
    7,
    1.35
  )

  return {
    fullWeek: {
      pass: true,
      lines: ['Baseline row. Set Full Week first, then optimize all other rows against it.'],
      raises: [],
    },
    fullDay: {
      pass: regularFullDay.pass && discountFullDay.pass,
      lines: [regularFullDay.line, discountFullDay.line],
      raises: [regularFullDay.raiseText, discountFullDay.raiseText].filter(Boolean),
    },
    amHalf: {
      pass: regularAM.pass && discountAM.pass,
      lines: [regularAM.line, discountAM.line],
      raises: [regularAM.raiseText, discountAM.raiseText].filter(Boolean),
    },
    pmHalf: {
      pass: regularPM.pass && discountPM.pass,
      lines: [regularPM.line, discountPM.line],
      raises: [regularPM.raiseText, discountPM.raiseText].filter(Boolean),
    },
    overnightDay: {
      pass: regularOvernight.pass && discountOvernight.pass,
      lines: [regularOvernight.line, discountOvernight.line],
      raises: [regularOvernight.raiseText, discountOvernight.raiseText].filter(Boolean),
    },
    overnightWeek: {
      pass: true,
      lines: ['Baseline row. Overnight Full Week drives Overnight Day x7 target.'],
      raises: [],
    },
  }
}

function getInitialState() {
  return {
    media: {
      heroImageUrl: defaultAdminConfig.media.heroImageUrl,
      welcomeLogoUrl: defaultAdminConfig.media.welcomeLogoUrl,
      surveyVideoUrl: defaultAdminConfig.media.surveyVideoUrl,
      surveyStep1FlyerUrl: defaultAdminConfig.media.surveyStep1FlyerUrl,
      surveyMobileBgUrl: defaultAdminConfig.media.surveyMobileBgUrl,
      surveyStepImageUrls: [...defaultAdminConfig.media.surveyStepImageUrls],
      surveyStepImagePositions: defaultAdminConfig.media.surveyStepImagePositions.map((item) => ({ ...item })),
      registrationStepImageUrls: [...defaultAdminConfig.media.registrationStepImageUrls],
      levelUpImageUrl: defaultAdminConfig.media.levelUpImageUrl,
      levelUpScreenshotUrls: [...defaultAdminConfig.media.levelUpScreenshotUrls],
      levelUpScreenshotSize: defaultAdminConfig.media.levelUpScreenshotSize,
      wechatQrUrl: defaultAdminConfig.media.wechatQrUrl,
    },
    emailJourney: defaultAdminConfig.emailJourney.map((item) => ({ ...item })),
    testimonials: defaultAdminConfig.testimonials.map((item) => ({ ...item })),
    tuition: {
      regular: { ...defaultAdminConfig.tuition.regular },
      discount: { ...defaultAdminConfig.tuition.discount },
      discountEndDate: defaultAdminConfig.tuition.discountEndDate,
      discountDisplayValue: defaultAdminConfig.tuition.discountDisplayValue,
      discountCode: defaultAdminConfig.tuition.discountCode,
      lunchPrice: defaultAdminConfig.tuition.lunchPrice,
      bootcampPremiumPct: defaultAdminConfig.tuition.bootcampPremiumPct,
      siblingDiscountPct: defaultAdminConfig.tuition.siblingDiscountPct,
    },
    programs: {
      general: { ...defaultAdminConfig.programs.general },
      bootcamp: { ...defaultAdminConfig.programs.bootcamp },
      overnight: { ...defaultAdminConfig.programs.overnight },
    },
  }
}

function getResizedPreviewUrl(url, width, height, quality = 70) {
  if (!url) {
    return ''
  }

  try {
    const parsed = new URL(url)
    parsed.searchParams.set('width', String(width))
    parsed.searchParams.set('height', String(height))
    parsed.searchParams.set('resize', 'cover')
    parsed.searchParams.set('quality', String(quality))
    return parsed.toString()
  } catch {
    return url
  }
}

function isVideoUrl(url) {
  if (!url) {
    return false
  }

  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase()
    return /\.(mp4|mov|webm|m4v|ogg)$/i.test(pathname)
  } catch {
    return /\.(mp4|mov|webm|m4v|ogg)$/i.test(String(url).toLowerCase())
  }
}

function getYouTubeVideoId(url) {
  if (!url) {
    return ''
  }

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()

    if (host === 'youtu.be') {
      return parsed.pathname.replace('/', '').trim()
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v') || ''
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1]?.split('/')[0] || ''
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || ''
      }
    }
  } catch {
    return ''
  }

  return ''
}

function getYouTubeEmbedUrl(url) {
  const id = getYouTubeVideoId(url)
  if (!id) {
    return ''
  }

  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${id}&controls=1&rel=0`
}

const surveyStepQuestions = [
  'Step 1: Email + camper ages',
  'Step 2A: Sports participation and experience',
  'Step 2B: Build-first support visuals',
  'Step 3: Martial arts experience',
  'Step 4: Lunch convenience + family goals',
  'Step 5: Recommendation and register prompt',
]

const registrationStepQuestions = [
  'Registration Step 1: Family & campers',
  'Registration Step 2: Camp weeks & times',
  'Registration Step 3: Lunch days',
  'Registration Step 4: Review & submit',
]

const emailJourneyBlueprint = [
  {
    step: 'Step 1',
    objective: 'Deliver recommendation immediately while intent is high.',
    cta: 'View recommended plan + start registration',
  },
  {
    step: 'Step 2',
    objective: 'Explain why the recommendation fits the camper profile.',
    cta: 'Review fit breakdown + reserve weeks',
  },
  {
    step: 'Step 3',
    objective: 'Highlight social/team value and sibling-discount appeal.',
    cta: 'See community benefits + register now',
  },
  {
    step: 'Step 4',
    objective: 'Reduce friction with logistics, lunch, and onboarding clarity.',
    cta: 'Review logistics + secure schedule',
  },
  {
    step: 'Step 5',
    objective: 'Create urgency and close with a clear final invitation.',
    cta: 'Final call to reserve preferred weeks',
  },
]

export default function AdminPage() {
  const router = useRouter()
  const [config, setConfig] = useState(getInitialState)
  const [activeJourneyTab, setActiveJourneyTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [mediaLibrary, setMediaLibrary] = useState([])
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [activeLibraryPreviewIndex, setActiveLibraryPreviewIndex] = useState(0)
  const [openStepLibraryPicker, setOpenStepLibraryPicker] = useState(null)
  const [openRegistrationStepLibraryPicker, setOpenRegistrationStepLibraryPicker] = useState(null)
  const [loadingEmailTracking, setLoadingEmailTracking] = useState(false)
  const [emailJourneyRuns, setEmailJourneyRuns] = useState([])
  const [emailReplies, setEmailReplies] = useState([])
  const [emailEvents, setEmailEvents] = useState([])
  const [testEmail, setTestEmail] = useState('')
  const [sendingTestStep, setSendingTestStep] = useState(0)
  const [aiReplyInput, setAiReplyInput] = useState({
    customerName: '',
    subject: '',
    message: '',
    tone: 'professional',
  })
  const [aiReplyDraft, setAiReplyDraft] = useState('')
  const [aiReplyLoading, setAiReplyLoading] = useState(false)
  const [selectedReplyId, setSelectedReplyId] = useState(0)
  const [replyFilterEmail, setReplyFilterEmail] = useState('')

  const refreshMediaLibrary = useCallback(async () => {
    setLoadingLibrary(true)
    const { items, error } = await listMediaLibrary()
    if (error) {
      setErrorMessage(`Media library failed: ${error.message}`)
      setLoadingLibrary(false)
      return
    }

    setMediaLibrary(items)
    setLoadingLibrary(false)
  }, [])

  const refreshEmailTracking = useCallback(async () => {
    if (!supabaseEnabled || !supabase) {
      return
    }

    setLoadingEmailTracking(true)
    const [runsResponse, repliesResponse, eventsResponse] = await Promise.all([
      supabase
        .from('email_journey_runs')
        .select('id, email, status, current_step, last_sent_at, next_send_at, created_at')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('email_replies')
        .select('id, email, from_email, subject, body_text, is_unread, received_at, ai_status, ai_error, ai_draft')
        .order('received_at', { ascending: false })
        .limit(30),
      supabase
        .from('email_journey_events')
        .select('id, email, step_number, event_type, event_at')
        .order('event_at', { ascending: false })
        .limit(30),
    ])

    const firstError = runsResponse.error || repliesResponse.error || eventsResponse.error
    if (firstError) {
      setErrorMessage(`Email tracking load failed: ${firstError.message}`)
      setLoadingEmailTracking(false)
      return
    }

    setEmailJourneyRuns(runsResponse.data || [])
    setEmailReplies(repliesResponse.data || [])
    setEmailEvents(eventsResponse.data || [])
    setLoadingEmailTracking(false)
  }, [])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      if (!supabaseEnabled || !supabase) {
        if (active) {
          setErrorMessage('Supabase env vars are missing.')
          setLoading(false)
        }
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      if (active) {
        setAdminEmail(session.user.email || '')
      }

      const { data, error } = await fetchAdminConfigFromSupabase()
      if (!active) {
        return
      }

      if (error) {
        setErrorMessage(`Load failed: ${error.message}`)
      } else {
        setErrorMessage('')
      }

      setConfig(data)
      setLoading(false)
      refreshMediaLibrary()
      refreshEmailTracking()
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [refreshEmailTracking, refreshMediaLibrary, router])

  const weekOptions = useMemo(
    () => ({
      general: buildProgramWeekOptions(
        'general',
        config.programs.general.startDate,
        config.programs.general.endDate
      ),
      bootcamp: buildProgramWeekOptions(
        'bootcamp',
        config.programs.bootcamp.startDate,
        config.programs.bootcamp.endDate
      ),
      overnight: buildProgramWeekOptions(
        'overnight',
        config.programs.overnight.startDate,
        config.programs.overnight.endDate
      ),
    }),
    [config.programs]
  )
  const tuitionChecks = useMemo(() => buildTuitionChecks(config.tuition), [config.tuition])
  const bootcampTuition = useMemo(() => buildBootcampTuition(config.tuition), [config.tuition])
  const activePreviewUrl =
    config.media.levelUpScreenshotUrls[activePreviewIndex] || config.media.levelUpScreenshotUrls[0] || ''
  const activeLibraryPreviewUrl =
    mediaLibrary[activeLibraryPreviewIndex]?.publicUrl || mediaLibrary[0]?.publicUrl || ''
  const filteredEmailReplies = useMemo(
    () =>
      replyFilterEmail
        ? emailReplies.filter((item) => (item.email || item.from_email || '') === replyFilterEmail)
        : emailReplies,
    [emailReplies, replyFilterEmail]
  )

  function updateMedia(field, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        [field]: value,
      },
    }))
  }

  function updateEmailJourneyStep(index, field, value) {
    setConfig((current) => ({
      ...current,
      emailJourney: current.emailJourney.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }))
  }

  function updateTestimonial(index, field, value) {
    setConfig((current) => ({
      ...current,
      testimonials: current.testimonials.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }))
  }

  function addTestimonial() {
    setConfig((current) => ({
      ...current,
      testimonials: [
        ...current.testimonials,
        {
          studentName: '',
          headline: '',
          story: '',
          outcome: '',
        },
      ],
    }))
  }

  function removeTestimonial(index) {
    setConfig((current) => ({
      ...current,
      testimonials: current.testimonials.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function renderTestTemplate(text) {
    const registrationLink =
      typeof window !== 'undefined' ? `${window.location.origin}/#register` : '{registration_link}'
    return String(text || '')
      .replaceAll('{first_name}', 'Test Parent')
      .replaceAll('{recommended_plan}', 'General Camp + 2 weeks Competition Team Boot Camp')
      .replaceAll('{registration_link}', registrationLink)
  }

  async function sendTestEmailForStep(stepIndex) {
    const recipient = testEmail.trim()
    if (!/\S+@\S+\.\S+/.test(recipient)) {
      setErrorMessage('Enter a valid test email first.')
      return
    }

    const template = config.emailJourney[stepIndex]
    if (!template?.subject || !template?.body) {
      setErrorMessage(`Step ${stepIndex + 1} is missing subject or body.`)
      return
    }

    setSendingTestStep(stepIndex + 1)
    setErrorMessage('')
    setSavedMessage('')

    const response = await fetch('/api/email/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: recipient,
        stepNumber: stepIndex + 1,
        template: {
          subject: renderTestTemplate(template.subject),
          body: renderTestTemplate(template.body),
        },
      }),
    })

    const result = await response.json()
    if (!response.ok) {
      setErrorMessage(result?.error || 'Test email failed.')
      setSendingTestStep(0)
      return
    }

    if (supabaseEnabled && supabase) {
      const { data: runRows } = await supabase
        .from('email_journey_runs')
        .insert({
          email: recipient,
          status: result?.previewOnly ? 'test_preview_only' : 'test_sent',
          current_step: stepIndex + 1,
          last_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .limit(1)

      const runId = runRows?.[0]?.id || null
      await supabase.from('email_journey_events').insert({
        run_id: runId,
        email: recipient,
        step_number: stepIndex + 1,
        event_type: result?.previewOnly ? 'test_preview_only' : 'test_sent',
        subject: renderTestTemplate(template.subject),
        body_preview: renderTestTemplate(template.body).slice(0, 400),
        event_payload: result,
      })
    }

    setSavedMessage(
      result?.previewOnly
        ? 'Template preview succeeded. Configure SendGrid to send real test emails.'
        : `Step ${stepIndex + 1} test email sent to ${recipient}.`
    )
    setSendingTestStep(0)
    refreshEmailTracking()
  }

  async function generateAiReplyDraft() {
    if (!aiReplyInput.message.trim()) {
      setErrorMessage('Paste an inbound email message first.')
      return
    }
    setAiReplyLoading(true)
    setErrorMessage('')

    const response = await fetch('/api/email/draft-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiReplyInput),
    })
    const result = await response.json()
    if (!response.ok) {
      setErrorMessage(result?.error || 'Failed to generate AI reply.')
      setAiReplyLoading(false)
      return
    }

    setAiReplyDraft(result?.draft || '')

    if (selectedReplyId && supabaseEnabled && supabase) {
      await supabase
        .from('email_replies')
        .update({
          ai_status: 'drafted',
          ai_draft: result?.draft || '',
          ai_generated_at: new Date().toISOString(),
          ai_error: null,
        })
        .eq('id', selectedReplyId)
      refreshEmailTracking()
    }
    setAiReplyLoading(false)
  }

  function selectReplyForAssistant(reply) {
    setSelectedReplyId(reply.id)
    setAiReplyInput((current) => ({
      ...current,
      customerName: '',
      subject: reply.subject || '',
      message: reply.body_text || '',
    }))
    setAiReplyDraft(reply.ai_draft || '')
  }

  async function markReplyHandled() {
    if (!selectedReplyId || !supabaseEnabled || !supabase) {
      return
    }
    await supabase
      .from('email_replies')
      .update({
        is_unread: false,
        ai_status: 'closed',
      })
      .eq('id', selectedReplyId)
    setSavedMessage('Reply marked as handled.')
    refreshEmailTracking()
  }

  function updateSurveyStepImage(index, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        surveyStepImageUrls: Array.from({ length: 6 }).map((_, imageIndex) =>
          imageIndex === index ? value : current.media.surveyStepImageUrls?.[imageIndex] || ''
        ),
      },
    }))
  }

  function updateRegistrationStepImage(index, value) {
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        registrationStepImageUrls: Array.from({ length: 4 }).map((_, imageIndex) =>
          imageIndex === index ? value : current.media.registrationStepImageUrls?.[imageIndex] || ''
        ),
      },
    }))
  }

  function assignSurveyStepImageFromLibrary(index, url) {
    updateSurveyStepImage(index, url)
    setOpenStepLibraryPicker(null)
  }

  function assignRegistrationStepImageFromLibrary(index, url) {
    updateRegistrationStepImage(index, url)
    setOpenRegistrationStepLibraryPicker(null)
  }

  async function uploadRegistrationStepImage(index, event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateRegistrationStepImage(index, first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  function updateSurveyStepImagePosition(index, axis, value) {
    const numeric = Number(value)
    setConfig((current) => ({
      ...current,
      media: {
        ...current.media,
        surveyStepImagePositions: current.media.surveyStepImagePositions.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [axis]: Number.isFinite(numeric) ? Math.max(-50, Math.min(50, numeric)) : 0,
              }
            : item
        ),
      },
    }))
  }

  function getSurveyImageStyle(index) {
    const pos = config.media.surveyStepImagePositions[index] || { x: 0, y: 0 }
    return {
      objectPosition: `${50 + Number(pos.x || 0)}% ${50 + Number(pos.y || 0)}%`,
    }
  }

  function updateTuition(group, field, value) {
    setConfig((current) => ({
      ...current,
      tuition: {
        ...current.tuition,
        [group]: {
          ...current.tuition[group],
          [field]: value === '' ? '' : Number(value),
        },
      },
    }))
  }

  function updateTuitionField(field, value) {
    setConfig((current) => ({
      ...current,
      tuition: {
        ...current.tuition,
        [field]:
          field === 'lunchPrice' || field === 'bootcampPremiumPct' || field === 'siblingDiscountPct'
            ? value === ''
              ? ''
              : Math.max(0, Number(value) || 0)
            : value,
      },
    }))
  }

  function addScreenshotUrl(url) {
    if (!url) {
      return
    }

    setConfig((current) => {
      const next = current.media.levelUpScreenshotUrls.includes(url)
        ? current.media.levelUpScreenshotUrls
        : [...current.media.levelUpScreenshotUrls, url]

      return {
        ...current,
        media: {
          ...current.media,
          levelUpScreenshotUrls: next,
          levelUpImageUrl: next[0] || '',
        },
      }
    })
  }

  function removeScreenshotUrl(url) {
    setConfig((current) => {
      const next = current.media.levelUpScreenshotUrls.filter((item) => item !== url)
      return {
        ...current,
        media: {
          ...current.media,
          levelUpScreenshotUrls: next,
          levelUpImageUrl: next[0] || '',
        },
      }
    })
  }

  async function uploadScreenshots(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    for (const item of uploaded) {
      addScreenshotUrl(item.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadWeChatQr(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateMedia('wechatQrUrl', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadWelcomeLogo(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateMedia('welcomeLogoUrl', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadSurveyVideo(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateMedia('surveyVideoUrl', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadSurveyFlyer(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateMedia('surveyStep1FlyerUrl', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadSurveyMobileBg(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { uploaded, error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    const first = uploaded[0]
    if (first?.publicUrl) {
      updateMedia('surveyMobileBgUrl', first.publicUrl)
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  async function uploadToLibrary(event) {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) {
      return
    }

    setUploading(true)
    setErrorMessage('')

    const { error } = await uploadFilesToMediaBucket(fileList)
    if (error) {
      setErrorMessage(`Upload failed: ${error.message}`)
      setUploading(false)
      return
    }

    await refreshMediaLibrary()
    setUploading(false)
    event.target.value = ''
  }

  function updateProgramDate(programKey, field, value) {
    setConfig((current) => {
      const next = {
        ...current,
        programs: {
          ...current.programs,
          [programKey]: {
            ...current.programs[programKey],
            [field]: value,
          },
        },
      }

      return {
        ...next,
        programs: {
          ...next.programs,
          [programKey]: filterSelectedWeeksByDateWindow(next, programKey),
        },
      }
    })
  }

  function toggleWeek(programKey, weekId) {
    setConfig((current) => {
      const existing = new Set(current.programs[programKey].selectedWeeks)
      if (existing.has(weekId)) {
        existing.delete(weekId)
      } else {
        existing.add(weekId)
      }

      return {
        ...current,
        programs: {
          ...current.programs,
          [programKey]: {
            ...current.programs[programKey],
            selectedWeeks: Array.from(existing),
          },
        },
      }
    })
  }

  function selectAllWeeks(programKey) {
    setConfig((current) => ({
      ...current,
      programs: {
        ...current.programs,
        [programKey]: {
          ...current.programs[programKey],
          selectedWeeks: weekOptions[programKey].map((option) => option.id),
        },
      },
    }))
  }

  function clearWeeks(programKey) {
    setConfig((current) => ({
      ...current,
      programs: {
        ...current.programs,
        [programKey]: {
          ...current.programs[programKey],
          selectedWeeks: [],
        },
      },
    }))
  }

  async function saveChanges() {
    if (saving) {
      return
    }
    setSaving(true)
    setSavedMessage('')
    setErrorMessage('')

    const error = await saveAdminConfigToSupabase(config)
    if (error) {
      setErrorMessage(`Save failed: ${error.message}`)
      setSaving(false)
      return
    }

    setSavedMessage(`Saved ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`)
    setSaving(false)
  }

  async function signOut() {
    if (!supabaseEnabled || !supabase) {
      return
    }

    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <main className="page adminPage">
        <section className="card section">
          <p className="subhead">Loading admin settings...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="page adminPage">
      <section className="card section">
        <p className="eyebrow">Admin Console</p>
        <h1>Camp settings manager</h1>
        <p className="subhead">
          Control media and camp date schedules. Weeks are generated automatically from each date range.
        </p>
        {adminEmail ? <p className="subhead">Signed in as {adminEmail}</p> : null}
        {errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
      </section>

      <section className="card section">
        <h2>Media</h2>
        <p className="subhead">Bucket: <code>{getMediaBucketName()}</code></p>
        <div className="adminGrid">
          <label>
            Welcome logo URL
            <input
              type="url"
              value={config.media.welcomeLogoUrl}
              onChange={(event) => updateMedia('welcomeLogoUrl', event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Upload welcome logo
            <input type="file" accept="image/*" onChange={uploadWelcomeLogo} />
          </label>

          <label>
            Hero image URL
            <input
              type="url"
              value={config.media.heroImageUrl}
              onChange={(event) => updateMedia('heroImageUrl', event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Survey video URL
            <input
              type="url"
              value={config.media.surveyVideoUrl}
              onChange={(event) => updateMedia('surveyVideoUrl', event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Upload survey video
            <input type="file" accept="video/*" onChange={uploadSurveyVideo} />
          </label>

          <label>
            Survey Step 1 flyer URL
            <input
              type="url"
              value={config.media.surveyStep1FlyerUrl}
              onChange={(event) => updateMedia('surveyStep1FlyerUrl', event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Upload Step 1 flyer
            <input type="file" accept="image/*" onChange={uploadSurveyFlyer} />
          </label>

          <label>
            Survey mobile background URL
            <input
              type="url"
              value={config.media.surveyMobileBgUrl}
              onChange={(event) => updateMedia('surveyMobileBgUrl', event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Upload mobile survey background
            <input type="file" accept="image/*" onChange={uploadSurveyMobileBg} />
          </label>

          <label>
            Add phone screenshots (multiple)
            <input type="file" accept="image/*" multiple onChange={uploadScreenshots} />
          </label>

          <label>
            Upload WeChat QR
            <input type="file" accept="image/*" onChange={uploadWeChatQr} />
          </label>
        </div>
        {config.media.welcomeLogoUrl ? (
          <div className="mediaLogoPreview">
            <p className="subhead">Current welcome logo preview</p>
            <img
              src={getResizedPreviewUrl(config.media.welcomeLogoUrl, 200, 200)}
              alt="Welcome logo preview"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        {config.media.surveyVideoUrl ? (
          <div className="adminSurveyVideoPreview">
            <p className="subhead">Current survey video preview</p>
            {getYouTubeEmbedUrl(config.media.surveyVideoUrl) ? (
              <iframe
                src={getYouTubeEmbedUrl(config.media.surveyVideoUrl)}
                title="Survey video preview"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video controls playsInline preload="metadata" src={config.media.surveyVideoUrl} />
            )}
          </div>
        ) : null}
        {config.media.surveyStep1FlyerUrl ? (
          <div className="mediaLogoPreview">
            <p className="subhead">Step 1 flyer preview</p>
            <img
              src={getResizedPreviewUrl(config.media.surveyStep1FlyerUrl, 640, 360)}
              alt="Survey Step 1 flyer preview"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        {config.media.surveyMobileBgUrl ? (
          <div className="mediaLogoPreview">
            <p className="subhead">Survey mobile background preview</p>
            <img
              src={getResizedPreviewUrl(config.media.surveyMobileBgUrl, 640, 960)}
              alt="Survey mobile background preview"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}

        <div className="adminGrid mediaControls">
          <label>
            Manual screenshot URL
            <input
              type="url"
              value={config.media.levelUpImageUrl}
              onChange={(event) => updateMedia('levelUpImageUrl', event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label>
            Screenshot size ({Math.round(config.media.levelUpScreenshotSize)}%)
            <input
              type="range"
              min="40"
              max="140"
              value={config.media.levelUpScreenshotSize}
              onChange={(event) =>
                updateMedia('levelUpScreenshotSize', Number(event.target.value))
              }
            />
          </label>

          <label>
            WeChat QR URL
            <input
              type="url"
              value={config.media.wechatQrUrl}
              onChange={(event) => updateMedia('wechatQrUrl', event.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>

        <div className="adminActions">
          <button
            type="button"
            className="button secondary"
            onClick={() => addScreenshotUrl(config.media.levelUpImageUrl)}
          >
            Add manual URL to phone list
          </button>
        </div>

        <section className="subCard">
          <h3>Program Finder step images</h3>
          <p className="subhead">Assign one image per survey step/question.</p>
          <div className="surveyStepAssetGrid">
            {surveyStepQuestions.map((questionLabel, index) => (
              <article key={questionLabel} className="surveyStepAssetCard">
                <h4>{questionLabel}</h4>
                <div className="surveyContextFrame">
                  {config.media.surveyStepImageUrls[index] ? (
                    <img
                      src={getResizedPreviewUrl(config.media.surveyStepImageUrls[index], 640, 360)}
                      alt={`${questionLabel} preview`}
                      style={getSurveyImageStyle(index)}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="surveyVisualPlaceholder">No image assigned</div>
                  )}
                </div>
                <label>
                  Image URL
                <input
                  type="url"
                  value={config.media.surveyStepImageUrls[index] || ''}
                  onChange={(event) => updateSurveyStepImage(index, event.target.value)}
                  placeholder="https://..."
                />
                </label>
                <div className="sliderRow">
                  <label>
                    X ({Math.round(config.media.surveyStepImagePositions[index]?.x || 0)})
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={config.media.surveyStepImagePositions[index]?.x || 0}
                      onChange={(event) => updateSurveyStepImagePosition(index, 'x', event.target.value)}
                    />
                  </label>
                  <label>
                    Y ({Math.round(config.media.surveyStepImagePositions[index]?.y || 0)})
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={config.media.surveyStepImagePositions[index]?.y || 0}
                      onChange={(event) => updateSurveyStepImagePosition(index, 'y', event.target.value)}
                    />
                  </label>
                </div>
                <div className="adminActions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() =>
                      setOpenStepLibraryPicker((current) => (current === index ? null : index))
                    }
                    disabled={mediaLibrary.length === 0}
                  >
                    {openStepLibraryPicker === index ? 'Close media library' : 'Choose from media library'}
                  </button>
                </div>
                {openStepLibraryPicker === index ? (
                  <div className="surveyLibraryPickerGrid">
                    {mediaLibrary.length === 0 ? (
                      <p className="subhead">No media files found.</p>
                    ) : (
                      mediaLibrary.map((item) => (
                        <button
                          key={`step-${index}-${item.path}`}
                          type="button"
                          className="surveyLibraryPickerItem"
                          onClick={() => assignSurveyStepImageFromLibrary(index, item.publicUrl)}
                        >
                          {isVideoUrl(item.publicUrl) ? (
                            <video
                              src={item.publicUrl}
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={getResizedPreviewUrl(item.publicUrl, 260, 146)}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                          <span>{item.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="subCard">
          <h3>Registration step images</h3>
          <p className="subhead">Assign one visual per registration step card. You can upload from your computer or choose from bucket media.</p>
          <div className="surveyStepAssetGrid">
            {registrationStepQuestions.map((questionLabel, index) => (
              <article key={questionLabel} className="surveyStepAssetCard">
                <h4>{questionLabel}</h4>
                <div className="surveyContextFrame">
                  {config.media.registrationStepImageUrls?.[index] ? (
                    <img
                      src={getResizedPreviewUrl(config.media.registrationStepImageUrls[index], 640, 360)}
                      alt={`${questionLabel} preview`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="surveyVisualPlaceholder">No image assigned</div>
                  )}
                </div>
                <label>
                  Image URL
                  <input
                    type="url"
                    value={config.media.registrationStepImageUrls?.[index] || ''}
                    onChange={(event) => updateRegistrationStepImage(index, event.target.value)}
                    placeholder="https://..."
                  />
                </label>
                <div className="adminActions">
                  <label className="button secondary">
                    Upload from computer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadRegistrationStepImage(index, event)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() =>
                      setOpenRegistrationStepLibraryPicker((current) => (current === index ? null : index))
                    }
                  >
                    {openRegistrationStepLibraryPicker === index ? 'Close media library' : 'Choose from media library'}
                  </button>
                </div>
                {openRegistrationStepLibraryPicker === index ? (
                  <div className="surveyLibraryPickerGrid">
                    {mediaLibrary.length === 0 ? (
                      <p className="subhead">No media files found in bucket.</p>
                    ) : (
                      mediaLibrary.map((item) => (
                        <button
                          key={`registration-step-${index}-${item.path}`}
                          type="button"
                          className="surveyLibraryPickerItem"
                          onClick={() => assignRegistrationStepImageFromLibrary(index, item.publicUrl)}
                        >
                          {isVideoUrl(item.publicUrl) ? (
                            <video src={item.publicUrl} muted playsInline preload="metadata" />
                          ) : (
                            <img
                              src={getResizedPreviewUrl(item.publicUrl, 260, 146)}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                          <span>{item.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="subCard">
          <h3>Upload to bucket for later use</h3>
          <p className="subhead">Upload files now, then assign them to sections from Media Library.</p>
          <input type="file" accept="image/*,video/*" multiple onChange={uploadToLibrary} />
        </section>

        <div className="adminPreviewGrid">
          <article className="previewCard">
            <h3>Selected phone screenshots</h3>
            {config.media.levelUpScreenshotUrls.length === 0 ? (
              <p className="subhead">No screenshots selected yet.</p>
            ) : (
              <>
                <div className="adminPhoneStage">
                  <div className="phoneFrame adminPhoneFrame">
                    <div className="phoneNotch" />
                    <div className="phoneScreen">
                      <img
                        className="phoneImage"
                        src={getResizedPreviewUrl(activePreviewUrl, 520, 920)}
                        alt="Phone render preview"
                        style={{ width: `${config.media.levelUpScreenshotSize}%` }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
                <p className="subhead">Tap a screenshot below to preview it in the phone render.</p>
                <div className="thumbGrid">
                  {config.media.levelUpScreenshotUrls.map((url, index) => (
                    <div
                      key={url}
                      className={`thumbItem ${activePreviewIndex === index ? 'selected' : ''}`}
                    >
                      <button
                        type="button"
                        className="thumbPreviewBtn"
                        onClick={() => setActivePreviewIndex(index)}
                      >
                        <img
                          src={getResizedPreviewUrl(url, 280, 380)}
                          alt="Selected screenshot preview"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                      <div className="thumbActions">
                        <button type="button" className="button secondary" onClick={() => removeScreenshotUrl(url)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </article>

          <article className="previewCard">
            <h3>Media library</h3>
            <div className="adminActions">
              <button type="button" className="button secondary" onClick={refreshMediaLibrary} disabled={loadingLibrary}>
                {loadingLibrary ? 'Refreshing...' : 'Refresh library'}
              </button>
              {uploading ? <span>Uploading...</span> : null}
            </div>

            {mediaLibrary.length === 0 ? (
              <p className="subhead">No media files found in bucket.</p>
            ) : (
              <>
                <div className="adminPhoneStage">
                  <div className="phoneFrame adminPhoneFrame">
                    <div className="phoneNotch" />
                    <div className="phoneScreen">
                      {isVideoUrl(activeLibraryPreviewUrl) ? (
                        <video
                          className="phoneImage"
                          src={activeLibraryPreviewUrl}
                          controls
                          playsInline
                          preload="metadata"
                          style={{ width: `${config.media.levelUpScreenshotSize}%` }}
                        />
                      ) : (
                        <img
                          className="phoneImage"
                          src={getResizedPreviewUrl(activeLibraryPreviewUrl, 520, 920)}
                          alt="Media library phone preview"
                          style={{ width: `${config.media.levelUpScreenshotSize}%` }}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <p className="subhead">All uploaded media can be previewed in the phone viewport.</p>
                <div className="thumbGrid">
                  {mediaLibrary.map((item, index) => (
                    <div
                      key={item.path}
                      className={`thumbItem ${activeLibraryPreviewIndex === index ? 'selected' : ''}`}
                    >
                      <button
                        type="button"
                        className="thumbPreviewBtn"
                        onClick={() => setActiveLibraryPreviewIndex(index)}
                      >
                        {isVideoUrl(item.publicUrl) ? (
                          <video src={item.publicUrl} muted playsInline preload="metadata" />
                        ) : (
                          <img
                            src={getResizedPreviewUrl(item.publicUrl, 280, 380)}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </button>
                    <div className="thumbActions">
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('welcomeLogoUrl', item.publicUrl)}
	                      >
	                        Use as welcome logo
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('heroImageUrl', item.publicUrl)}
	                      >
	                        Use as hero
                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('surveyVideoUrl', item.publicUrl)}
	                      >
	                        Use as survey video
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('surveyStep1FlyerUrl', item.publicUrl)}
	                      >
	                        Use as Step 1 flyer
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('surveyMobileBgUrl', item.publicUrl)}
	                      >
	                        Use as survey mobile bg
	                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => addScreenshotUrl(item.publicUrl)}
                      >
                        Add to phone
                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateMedia('wechatQrUrl', item.publicUrl)}
	                      >
	                        Use as WeChat QR
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(0, item.publicUrl)}
	                      >
	                        Use as Step 1 image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(1, item.publicUrl)}
	                      >
	                        Use as Step 2A image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(2, item.publicUrl)}
	                      >
	                        Use as Step 2B image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(3, item.publicUrl)}
	                      >
	                        Use as Step 3 image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(4, item.publicUrl)}
	                      >
	                        Use as Step 4 image
	                      </button>
	                      <button
	                        type="button"
	                        className="button secondary"
	                        onClick={() => updateSurveyStepImage(5, item.publicUrl)}
	                      >
	                        Use as Step 5 image
	                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => updateRegistrationStepImage(0, item.publicUrl)}
                      >
                        Use as Reg Step 1 image
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => updateRegistrationStepImage(1, item.publicUrl)}
                      >
                        Use as Reg Step 2 image
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => updateRegistrationStepImage(2, item.publicUrl)}
                      >
                        Use as Reg Step 3 image
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => updateRegistrationStepImage(3, item.publicUrl)}
                      >
                        Use as Reg Step 4 image
                      </button>
	                    </div>
	                  </div>
	                  ))}
                </div>
              </>
            )}
          </article>
        </div>
      </section>

      <section className="card section">
        <h2>Tuition table</h2>
        <div className="adminGrid">
          <label>
            Discount end date
            <input
              type="date"
              value={config.tuition.discountEndDate}
              onChange={(event) => updateTuitionField('discountEndDate', event.target.value)}
            />
          </label>
          <label>
            Competition Team premium (% over General)
            <input
              type="number"
              min="0"
              step="1"
              value={config.tuition.bootcampPremiumPct}
              onChange={(event) => updateTuitionField('bootcampPremiumPct', event.target.value)}
            />
          </label>
          <label>
            Sibling discount (% from 2nd camper)
            <input
              type="number"
              min="0"
              step="1"
              value={config.tuition.siblingDiscountPct}
              onChange={(event) => updateTuitionField('siblingDiscountPct', event.target.value)}
            />
          </label>
          <label>
            Discount value label
            <input
              value={config.tuition.discountDisplayValue}
              onChange={(event) => updateTuitionField('discountDisplayValue', event.target.value)}
              placeholder="Example: Save up to $350"
            />
          </label>
          <label>
            Discount code
            <input
              value={config.tuition.discountCode}
              onChange={(event) => updateTuitionField('discountCode', event.target.value)}
              placeholder="Example: SUMMER350"
            />
          </label>
        </div>
        <div className="tuitionTableWrap">
          <table className="tuitionTable">
            <thead>
              <tr>
                <th>Method</th>
                <th>Regular</th>
                <th>Discounted Price</th>
                <th>Discount Amount</th>
                <th>Checks</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['fullWeek', 'Full Week'],
                ['fullDay', 'Full Day'],
                ['amHalf', 'AM Half Day'],
                ['pmHalf', 'PM Half Day'],
                ['overnightWeek', 'Overnight Full Week'],
                ['overnightDay', 'Overnight Camp Day'],
              ].map(([key, label]) => (
                <tr key={key}>
                  <td>{label}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={config.tuition.regular[key]}
                      onChange={(event) => updateTuition('regular', key, event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={config.tuition.discount[key]}
                      onChange={(event) => updateTuition('discount', key, event.target.value)}
                    />
                  </td>
                  <td>{money(discountAmount(config.tuition.regular[key], config.tuition.discount[key]))}</td>
                  <td className={`checkCell ${tuitionChecks[key]?.pass ? 'pass' : 'warn'}`}>
                    {tuitionChecks[key] ? (
                      <>
                        <div className={`checkBadge ${tuitionChecks[key].pass ? 'pass' : 'warn'}`}>
                          {tuitionChecks[key].pass ? 'GREEN LIGHT' : 'Needs update'}
                        </div>
                        {tuitionChecks[key].lines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                        {(tuitionChecks[key].raises || []).map((item) => (
                          <p key={item} className="raiseBox">
                            {item}
                          </p>
                        ))}
                      </>
                    ) : (
                      <span>No rule for this row.</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td>Lunch (per day)</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={config.tuition.lunchPrice}
                    onChange={(event) => updateTuitionField('lunchPrice', event.target.value)}
                  />
                </td>
                <td>-</td>
                <td>-</td>
                <td className="checkCell">
                  <span>Used in registration step 3 totals.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tuitionTableWrap">
          <h3>Competition Team Boot Camp (auto-calculated)</h3>
          <p className="subhead">
            Derived from General prices using +{Number(config.tuition.bootcampPremiumPct || 0)}% premium, then rounded
            up to the nearest $5.
          </p>
          <table className="tuitionTable">
            <thead>
              <tr>
                <th>Method</th>
                <th>Regular (Auto)</th>
                <th>Discounted Price (Auto)</th>
                <th>Discount Amount (Auto)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['fullWeek', 'Full Week'],
                ['fullDay', 'Full Day'],
                ['amHalf', 'AM Half Day'],
                ['pmHalf', 'PM Half Day'],
              ].map(([key, label]) => {
                const regularValue = bootcampTuition.regular[key]
                const discountValue = bootcampTuition.discount[key]
                return (
                  <tr key={`boot-${key}`}>
                    <td>{label}</td>
                    <td>{money(regularValue)}</td>
                    <td>{money(discountValue)}</td>
                    <td>{money(discountAmount(regularValue, discountValue))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {Object.entries(programMeta).map(([programKey, meta]) => {
        const program = config.programs[programKey]
        const options = weekOptions[programKey]
        const selectedCount = program.selectedWeeks.length

        return (
          <section key={programKey} className="card section">
            <h2>{meta.title}</h2>
            <p className="subhead">{meta.rhythm}</p>

            <div className="adminGrid">
              <label>
                Start date
                <input
                  type="date"
                  value={program.startDate}
                  onChange={(event) => updateProgramDate(programKey, 'startDate', event.target.value)}
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={program.endDate}
                  onChange={(event) => updateProgramDate(programKey, 'endDate', event.target.value)}
                />
              </label>
            </div>

            <div className="adminActions">
              <button type="button" className="button secondary" onClick={() => selectAllWeeks(programKey)}>
                Select all
              </button>
              <button type="button" className="button secondary" onClick={() => clearWeeks(programKey)}>
                Clear
              </button>
              <span>{selectedCount} selected</span>
            </div>

            {options.length === 0 ? (
              <p className="subhead">Set a valid start and end date to generate options.</p>
            ) : (
              <div className="adminWeekList">
                {options.map((week) => (
                  <label key={week.id} className="weekRow">
                    <input
                      type="checkbox"
                      checked={program.selectedWeeks.includes(week.id)}
                      onChange={() => toggleWeek(programKey, week.id)}
                    />
                    <span>{formatWeekLabel(week)}</span>
                  </label>
                ))}
              </div>
            )}
          </section>
        )
      })}

      <section className="card section">
        <h2>Email Journey Builder</h2>
        <p className="subhead">
          Configure follow-up email sequence for families who click "I need time to think" on the survey.
        </p>
        <div className="adminGrid">
          <label>
            Test recipient email
            <input
              type="email"
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <div className="adminActions">
            <button
              type="button"
              className="button secondary"
              onClick={() => sendTestEmailForStep(activeJourneyTab)}
              disabled={sendingTestStep > 0}
            >
              {sendingTestStep === activeJourneyTab + 1 ? 'Sending test...' : `Send Test for Step ${activeJourneyTab + 1}`}
            </button>
          </div>
        </div>
        <div className="journeyGrid">
          {emailJourneyBlueprint.map((item) => (
            <article key={item.step} className="journeyCard">
              <p className="journeyDay">{item.step}</p>
              <h4>{item.objective}</h4>
              <p><strong>CTA:</strong> {item.cta}</p>
            </article>
          ))}
        </div>
        <div className="surveySubTabs">
          {config.emailJourney.map((item, index) => (
            <button
              key={`${item.dayLabel}-${index}`}
              type="button"
              className={`subTabBtn ${activeJourneyTab === index ? 'active' : ''}`}
              onClick={() => setActiveJourneyTab(index)}
            >
              Step {index + 1}
            </button>
          ))}
        </div>
        <article className="journeyCard adminJourneyCard">
          <p className="journeyDay">{config.emailJourney[activeJourneyTab]?.dayLabel || ''}</p>
          <h4>{config.emailJourney[activeJourneyTab]?.title || `Step ${activeJourneyTab + 1}`}</h4>
          <div className="adminGrid">
            <label>
              Send timing label
              <input
                value={config.emailJourney[activeJourneyTab]?.dayLabel || ''}
                onChange={(event) => updateEmailJourneyStep(activeJourneyTab, 'dayLabel', event.target.value)}
              />
            </label>
            <label>
              Card title
              <input
                value={config.emailJourney[activeJourneyTab]?.title || ''}
                onChange={(event) => updateEmailJourneyStep(activeJourneyTab, 'title', event.target.value)}
              />
            </label>
            <label className="full">
              Email subject
              <input
                value={config.emailJourney[activeJourneyTab]?.subject || ''}
                onChange={(event) => updateEmailJourneyStep(activeJourneyTab, 'subject', event.target.value)}
              />
            </label>
            <label className="full">
              Email body draft
              <textarea
                rows="4"
                value={config.emailJourney[activeJourneyTab]?.body || ''}
                onChange={(event) => updateEmailJourneyStep(activeJourneyTab, 'body', event.target.value)}
              />
            </label>
          </div>
        </article>

        <article className="journeyCard adminJourneyCard">
          <h3>AI Reply Assistant</h3>
          <p className="subhead">Paste an inbound email and generate a draft reply you can edit before sending.</p>
          <div className="adminGrid">
            <label>
              Selected reply
              <input
                value={selectedReplyId ? `Reply #${selectedReplyId}` : 'None selected'}
                disabled
              />
            </label>
            <div className="adminActions">
              <button type="button" className="button secondary" onClick={markReplyHandled} disabled={!selectedReplyId}>
                Mark selected reply handled
              </button>
            </div>
          </div>
          <div className="adminGrid">
            <label>
              Parent name (optional)
              <input
                value={aiReplyInput.customerName}
                onChange={(event) =>
                  setAiReplyInput((current) => ({ ...current, customerName: event.target.value }))
                }
                placeholder="Parent name"
              />
            </label>
            <label>
              Tone
              <select
                value={aiReplyInput.tone}
                onChange={(event) => setAiReplyInput((current) => ({ ...current, tone: event.target.value }))}
              >
                <option value="professional">Professional</option>
                <option value="warm">Warm</option>
                <option value="direct">Direct</option>
              </select>
            </label>
            <label className="full">
              Subject (optional)
              <input
                value={aiReplyInput.subject}
                onChange={(event) =>
                  setAiReplyInput((current) => ({ ...current, subject: event.target.value }))
                }
                placeholder="Reply subject"
              />
            </label>
            <label className="full">
              Inbound email text
              <textarea
                rows="5"
                value={aiReplyInput.message}
                onChange={(event) =>
                  setAiReplyInput((current) => ({ ...current, message: event.target.value }))
                }
                placeholder="Paste parent email here..."
              />
            </label>
          </div>
          <div className="adminActions">
            <button
              type="button"
              className="button secondary"
              onClick={generateAiReplyDraft}
              disabled={aiReplyLoading}
            >
              {aiReplyLoading ? 'Generating...' : selectedReplyId ? 'Generate draft for selected reply' : 'Generate AI reply draft'}
            </button>
          </div>
          {aiReplyDraft ? (
            <label className="full">
              Draft reply
              <textarea rows="7" value={aiReplyDraft} onChange={(event) => setAiReplyDraft(event.target.value)} />
            </label>
          ) : null}
        </article>
      </section>

      <section className="card section">
        <h2>Testimonials</h2>
        <p className="subhead">Manage student stories shown on the testimonials page.</p>
        <div className="adminActions">
          <button type="button" className="button secondary" onClick={addTestimonial}>
            Add testimonial
          </button>
          <a className="ghostBtn" href="/testimonials" target="_blank" rel="noreferrer">
            Preview testimonials page
          </a>
        </div>
        <div className="journeyGrid">
          {config.testimonials.length === 0 ? (
            <p className="subhead">No testimonials yet.</p>
          ) : (
            config.testimonials.map((item, index) => (
              <article key={`testimonial-${index}`} className="journeyCard">
                <div className="adminActions">
                  <p className="journeyDay">Story {index + 1}</p>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => removeTestimonial(index)}
                  >
                    Remove
                  </button>
                </div>
                <div className="adminGrid">
                  <label>
                    Student name
                    <input
                      value={item.studentName || ''}
                      onChange={(event) => updateTestimonial(index, 'studentName', event.target.value)}
                      placeholder="Ethan, age 9"
                    />
                  </label>
                  <label>
                    Headline
                    <input
                      value={item.headline || ''}
                      onChange={(event) => updateTestimonial(index, 'headline', event.target.value)}
                      placeholder="From shy beginner to confident performer"
                    />
                  </label>
                  <label className="full">
                    Story
                    <textarea
                      rows="4"
                      value={item.story || ''}
                      onChange={(event) => updateTestimonial(index, 'story', event.target.value)}
                    />
                  </label>
                  <label className="full">
                    Outcome
                    <textarea
                      rows="2"
                      value={item.outcome || ''}
                      onChange={(event) => updateTestimonial(index, 'outcome', event.target.value)}
                    />
                  </label>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="card section">
        <h2>Email Tracking</h2>
        <p className="subhead">
          Track who has been sent emails, delivery activity, and incoming replies.
        </p>
        <p className="subhead">
          Automation endpoint: <code>POST /api/email/auto-reply</code> with header <code>x-cron-secret</code>.
          Use cron to run every 5-10 minutes.
        </p>
        <div className="adminActions">
          <button
            type="button"
            className="button secondary"
            onClick={refreshEmailTracking}
            disabled={loadingEmailTracking}
          >
            {loadingEmailTracking ? 'Refreshing...' : 'Refresh tracking'}
          </button>
          <label>
            Filter replies by email
            <select value={replyFilterEmail} onChange={(event) => setReplyFilterEmail(event.target.value)}>
              <option value="">All emails</option>
              {Array.from(new Set(emailReplies.map((item) => item.email || item.from_email).filter(Boolean))).map(
                (email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                )
              )}
            </select>
          </label>
          <span>Unread replies: {emailReplies.filter((item) => item.is_unread).length}</span>
        </div>

        <div className="adminPreviewGrid">
          <article className="previewCard">
            <h3>Journey runs</h3>
            {emailJourneyRuns.length === 0 ? (
              <p className="subhead">No runs yet.</p>
            ) : (
              <div className="tuitionTableWrap">
                <table className="tuitionTable">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Step</th>
                      <th>Last Sent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailJourneyRuns.map((row) => (
                      <tr key={`run-${row.id}`}>
                        <td>{row.email}</td>
                        <td>{row.status || '-'}</td>
                        <td>{row.current_step || '-'}</td>
                        <td>{row.last_sent_at ? new Date(row.last_sent_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="previewCard">
            <h3>Replies</h3>
            {filteredEmailReplies.length === 0 ? (
              <p className="subhead">No replies yet.</p>
            ) : (
              <div className="tuitionTableWrap">
                <table className="tuitionTable">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>From</th>
                      <th>Subject</th>
                      <th>AI Status</th>
                      <th>Received</th>
                      <th>Unread</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmailReplies.map((row) => (
                      <tr key={`reply-${row.id}`} className={selectedReplyId === row.id ? 'selectedReplyRow' : ''}>
                        <td>
                          <button type="button" className="button secondary" onClick={() => selectReplyForAssistant(row)}>
                            Select
                          </button>
                        </td>
                        <td>{row.from_email || row.email}</td>
                        <td>{row.subject || '(No subject)'}</td>
                        <td>{row.ai_status || 'pending'}</td>
                        <td>{row.received_at ? new Date(row.received_at).toLocaleString() : '-'}</td>
                        <td>{row.is_unread ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>

        <article className="previewCard">
          <h3>Recent send/delivery events</h3>
          {emailEvents.length === 0 ? (
            <p className="subhead">No events yet.</p>
          ) : (
            <div className="tuitionTableWrap">
              <table className="tuitionTable">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Step</th>
                    <th>Event</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {emailEvents.map((row) => (
                    <tr key={`event-${row.id}`}>
                      <td>{row.email}</td>
                      <td>{row.step_number || '-'}</td>
                      <td>{row.event_type}</td>
                      <td>{row.event_at ? new Date(row.event_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <section className="card section">
        <div className="adminFooter">
          <button type="button" className="button" onClick={saveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
          <button type="button" className="button secondary" onClick={signOut}>
            Sign out
          </button>
          <a className="ghostBtn" href="/">
            Back to site
          </a>
        </div>
        {savedMessage ? <p className="message">{savedMessage}</p> : null}
      </section>

      <div className="adminFloatingSaveBar" role="region" aria-label="Save admin settings">
        <div className="adminFloatingSaveMeta">
          <strong>Save all settings</strong>
          <span>{savedMessage || (saving ? 'Saving changes...' : 'Unsaved edits on this page')}</span>
        </div>
        <button type="button" className="button" onClick={saveChanges} disabled={saving}>
          {saving ? 'Saving...' : 'Save all'}
        </button>
      </div>
    </main>
  )
}
