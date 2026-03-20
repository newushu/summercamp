'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { defaultAdminConfig, formatWeekLabel, getSelectedWeeks } from '../lib/campAdmin'
import { fetchAdminConfigFromSupabase } from '../lib/campAdminApi'
import { supabase, supabaseEnabled } from '../lib/supabase'

const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const nextMode = {
  NONE: 'FULL',
  FULL: 'AM',
  AM: 'PM',
  PM: 'NONE',
}

const registrationSteps = [
  { id: 1, title: 'Family & campers' },
  { id: 2, title: 'Camp weeks & times' },
  { id: 3, title: 'Lunch days' },
  { id: 4, title: 'Review & submit' },
]
const MAX_CAMPERS = 6
const REGISTRATION_DRAFT_KEY = 'new-england-wushu-registration-draft-v1'
const SURVEY_DRAFT_KEY = 'new-england-wushu-survey-draft-v1'
const SUPPORT_EMAIL = 'info@newushu.com'
const surveyGoals = [
  { value: 'fun', label: 'Fun', zhLabel: '趣味' },
  { value: 'exercise', label: 'Exercise', zhLabel: '锻炼' },
  { value: 'competition', label: 'Competition', zhLabel: '竞赛' },
  { value: 'social/teamwork/friends', label: 'Social / Teamwork / Friends', zhLabel: '社交 / 团队 / 友谊' },
]
const surveyActivities = [
  { value: 'team-games', label: 'Team games', zhLabel: '团队游戏' },
  { value: 'movement-drills', label: 'Movement drills', zhLabel: '动作训练' },
  { value: 'flexibility', label: 'Flexibility training', zhLabel: '柔韧训练' },
  { value: 'performance', label: 'Performance / showcase', zhLabel: '表演 / 展示' },
  { value: 'conditioning', label: 'Fitness conditioning', zhLabel: '体能强化' },
  { value: 'partner-work', label: 'Partner work', zhLabel: '搭档协作' },
]
const SURVEY_TOTAL_STEPS = 7

const perks = [
  {
    title: 'Daily training tracks',
    text: 'Age-based groups for movement, drills, confidence, and skill progress.',
  },
  {
    title: 'Certified coaches',
    text: 'Experienced instructors with first-aid awareness and youth coaching focus.',
  },
  {
    title: 'Weekly showcase',
    text: 'Campers demonstrate progress every Friday in a short family showcase.',
  },
]

const campTypes = [
  {
    name: 'General Camp',
    audience: 'General curriculum, beginner friendly, ages 3+',
    details:
      'Perfect first camp experience with movement, balance, coordination, and fun fundamentals.',
    note: 'Best fit for new students and families exploring Wushu.',
  },
  {
    name: 'Competition Team Boot Camp',
    audience: 'For Taolu team and serious competition-track students',
    details:
      'Focused technical training, routine polish, performance quality, and competition mindset.',
    note: 'Two weeks required for students who want to join the fall competition team.',
  },
  {
    name: 'Overnight Camp',
    audience: 'Immersive training and camp-life experience',
    details:
      'Great for building friendships with intensive Wushu training, a fun camp atmosphere, and scheduled outings across all 7 days.',
    note: 'Limited spots and always a hit.',
  },
]

const schedule = [
  { day: 'Monday', activity: 'Footwork foundations + team games' },
  { day: 'Tuesday', activity: 'Technique stations + confidence drills' },
  { day: 'Wednesday', activity: 'Agility circuits + partner practice' },
  { day: 'Thursday', activity: 'Mini challenges + supervised sparring' },
  { day: 'Friday', activity: 'Showcase prep + parent performance' },
]

const levelUpFeatures = [
  'Camp leaders and coaches track each camper directly in the Level Up app.',
  'Daily logs with photos and videos keep parents in the loop.',
  'Parents can conveniently order lunch in the app.',
  'A weekly camp schedule is shown in-app so families know exactly what is happening.',
  'Parents can see day-to-day activity and clear progress over time.',
]

const campGalleryCaptions = [
  {
    en: 'Every week blends high-energy training, confidence-building, and summer fun.',
    zh: '每周都结合高能训练、自信培养与夏日乐趣。',
  },
  {
    en: 'Campers build real skills while making friends through team challenges.',
    zh: '营员在团队挑战中提升真实技能，也结交新朋友。',
  },
  {
    en: 'Daily movement, structure, and coaching help kids grow fast and stay motivated.',
    zh: '每日训练节奏与教练指导，帮助孩子快速成长并持续保持动力。',
  },
  {
    en: 'From first-timers to advanced students, every camper trains at the right level.',
    zh: '从零基础到进阶学员，每位营员都在适合自己的层级训练。',
  },
  {
    en: 'Weekly showcase moments turn progress into proud memories for families.',
    zh: '每周展示把成长转化为家庭共同见证的高光时刻。',
  },
  {
    en: 'A summer they enjoy now, with confidence and discipline that lasts beyond camp.',
    zh: '一个当下快乐、长期受益的夏天，自信与自律延续到营地之外。',
  },
]

const testimonialTranslationMap = {
  'Ethan, age 9': 'Ethan，9岁',
  'From shy beginner to confident performer': '从害羞新手到自信展示者',
  Confidence: '自信',
  Flexibility: '柔韧性',
  Showcase: '展示',
  'Ethan joined General Camp with no prior martial arts experience. After two weeks of structured coaching, he improved flexibility, focus, and confidence, then completed the Friday showcase in front of families with a big smile.':
    'Ethan在没有武术基础的情况下参加了普通营。经过两周系统训练，他的柔韧性、专注力和自信明显提升，并在周五家庭展示中自信完成表演。',
  'Parent reported stronger confidence, better discipline at home, and excitement to continue training.':
    '家长反馈：孩子更有自信，居家纪律更好，也更期待继续训练。',
  'Ava, age 8': 'Ava，8岁',
  'Lunch was easy, and every day felt meaningful': '午餐安排省心，每一天都很有收获',
  'Daily Routine': '每日节奏',
  'Skill Growth': '技能成长',
  'Coach Support': '教练支持',
  'Ava attended General Camp for three weeks. Her family appreciated the flexible lunch planning and clear weekly structure, and Ava came home each day talking about team games, new skills, and how much fun she had with her coaches.':
    'Ava参加了三周普通营。家长很认可灵活的午餐安排和清晰的每周结构；Ava每天回家都会分享团队游戏、新学技能，以及和教练在一起有多开心。',
  'Parent shared that planning lunches felt manageable, daily communication was clear, and Ava asked to come back next summer.':
    '家长表示午餐安排轻松可管理、每日沟通很清晰，而且Ava已经主动要求明年夏天继续参加。',
  'Noah, age 10': 'Noah，10岁',
  'Coaches who care and a reward system kids love': '用心教练团队，加上孩子超喜欢的奖励体系',
  Motivation: '积极性',
  Discipline: '纪律',
  Teamwork: '团队协作',
  'Noah joined General Camp to stay active and build confidence. The coaches were encouraging and patient, and he was motivated by the camp award system that recognized effort, teamwork, and progress all week.':
    'Noah参加普通营是为了增强体能和自信。教练耐心且鼓励性强，而营地奖励体系会认可努力、协作和进步，让他整周都很有动力。',
  'Parent reported better confidence, strong connection with coaches, and real excitement about training because camp felt both supportive and fun.':
    '家长反馈：孩子自信心更强，与教练关系很好，也因为营地既有支持感又有趣而对训练充满热情。',
  'Mia, age 7': 'Mia，7岁',
  'From first-week nerves to independent confidence': '从第一周紧张到独立自信',
  'First-Time Camper': '首次参营',
  Independence: '独立性',
  'Mia started camp feeling shy about joining group activities. By the second week, she was volunteering for partner drills, practicing at home, and proudly showing new techniques during Friday showcase.':
    'Mia刚开始参加营地时，对团队活动有些害羞。到第二周，她开始主动参与搭档训练、在家练习，并在周五展示中自豪地展示新动作。',
  'Parent reported a major confidence jump, better listening at home, and stronger willingness to try new challenges.':
    '家长反馈：孩子自信明显提升，在家更愿意倾听，也更愿意尝试新挑战。',
  'Lucas, age 11': 'Lucas，11岁',
  'Athletic focus and visible weekly progress': '运动能力聚焦与每周可见进步',
  'Athletic Development': '运动能力提升',
  Focus: '专注力',
  Consistency: '持续性',
  'Lucas joined to improve coordination and conditioning for multiple sports. The structured schedule helped him build balance, speed, and control, and he stayed engaged through clear weekly goals.':
    'Lucas参加营地是为了提升多项运动所需的协调性和体能。结构化训练帮助他提升平衡、速度和控制力，并通过清晰的每周目标持续投入。',
  'Parent said he became more focused, looked forward to training each day, and showed measurable improvement by week three.':
    '家长表示他变得更专注、每天都期待训练，并在第三周就看到了可衡量的提升。',
}

function pluralize(label, count) {
  return `${count} ${label}${count === 1 ? '' : 's'}`
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`
}

function createStudent(fixedId) {
  return {
    id: fixedId || makeId(),
    fullName: '',
    dob: '',
    allergies: '',
    medication: '',
    previousInjury: '',
    healthNotes: '',
    schedule: {},
    lunch: {},
    lunchConfirmedNone: false,
  }
}

function isStudentComplete(student) {
  return Boolean(
    student.fullName.trim() &&
      parseDateLocal(student.dob) &&
      student.allergies.trim() &&
      student.medication.trim() &&
      student.previousInjury.trim() &&
      student.healthNotes.trim()
  )
}

function readRegistrationDraft() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(REGISTRATION_DRAFT_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function normalizeStudentDraft(student) {
  return {
    id: typeof student?.id === 'string' ? student.id : makeId(),
    fullName: typeof student?.fullName === 'string' ? student.fullName : '',
    dob: typeof student?.dob === 'string' ? student.dob : '',
    allergies: typeof student?.allergies === 'string' ? student.allergies : '',
    medication: typeof student?.medication === 'string' ? student.medication : '',
    previousInjury: typeof student?.previousInjury === 'string' ? student.previousInjury : '',
    healthNotes: typeof student?.healthNotes === 'string' ? student.healthNotes : '',
    schedule: typeof student?.schedule === 'object' && student.schedule ? student.schedule : {},
    lunch: typeof student?.lunch === 'object' && student.lunch ? student.lunch : {},
    lunchConfirmedNone: Boolean(student?.lunchConfirmedNone),
  }
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

  const cleaned = raw
    .replace(/(\d+)(st|nd|rd|th)/gi, '$1')
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const hasYear = /\b\d{4}\b/.test(cleaned)
  const withYear = hasYear ? cleaned : `${cleaned} ${new Date().getFullYear()}`
  const parsed = new Date(withYear)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

function getCountdownParts(targetDate, nowDate) {
  const diffMs = Math.max(0, targetDate.getTime() - nowDate.getTime())
  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function calcAge(dob) {
  const birth = parseDateLocal(dob)
  if (!birth) {
    return 0
  }

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return Math.max(age, 0)
}

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: 'Camper', lastName: 'Unknown' }
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'Student' }
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function getWeekDays(weekStartIso, labels = dayKeys) {
  const start = parseDateLocal(weekStartIso)
  if (!start) {
    return []
  }

  return labels.map((key, index) => ({ key, date: isoDate(addDays(start, index)) }))
}

function getStudentSummary(student) {
  const general = { fullWeeks: 0, fullDays: 0, amDays: 0, pmDays: 0 }
  const bootcamp = { fullWeeks: 0, fullDays: 0, amDays: 0, pmDays: 0 }
  for (const entry of Object.values(student.schedule || {})) {
    const keys = dayKeys
    const modes = keys.map((day) => entry.days?.[day] || 'NONE')
    const fullWeek = modes.every((mode) => mode === 'FULL')

    const bucket = entry.campType === 'bootcamp' ? bootcamp : general

    if (fullWeek && entry.programKey !== 'overnight') {
      bucket.fullWeeks += 1
      continue
    }

    for (const mode of modes) {
      if (mode === 'FULL') {
        bucket.fullDays += 1
      } else if (mode === 'AM') {
        bucket.amDays += 1
      } else if (mode === 'PM') {
        bucket.pmDays += 1
      }
    }
  }

  const lunchCount = Object.values(student.lunch || {}).filter(Boolean).length

  return { general, bootcamp, lunchCount }
}

function getLunchWeeksForStudent(student, weeksById) {
  const rows = []
  for (const [weekId, entry] of Object.entries(student.schedule || {})) {
    const week = weeksById[weekId]
    if (!week || week.programKey === 'overnight') {
      continue
    }

    const selectedDays = []
    for (const day of week.days) {
      const mode = entry.days?.[day.key] || 'NONE'
      if (mode === 'NONE') {
        continue
      }
      selectedDays.push({ dayKey: day.key, date: day.date, mode, key: `${weekId}:${day.key}` })
    }

    if (selectedDays.length > 0) {
      rows.push({ weekId, week, selectedDays })
    }
  }
  return rows.sort((a, b) => a.week.start.localeCompare(b.week.start))
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function getTestimonialHighlights(item) {
  if (!item) {
    return []
  }
  const explicit = Array.isArray(item.highlights)
    ? item.highlights.map((value) => (typeof value === 'string' ? value.trim() : '')).filter(Boolean)
    : []
  if (explicit.length > 0) {
    return explicit.slice(0, 4)
  }
  if (typeof item.headline === 'string' && item.headline.trim()) {
    return [item.headline.trim()]
  }
  return []
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

function getWeekSelectionSummary(entry, week) {
  if (!entry || !week) {
    return ''
  }

  const weekDayKeys = week.days.map((day) => day.key)
  const fullWeekSelected = weekDayKeys.every((day) => (entry.days?.[day] || 'NONE') === 'FULL')
  if (fullWeekSelected) {
    return 'Registered: Full Week'
  }

  const counts = { FULL: 0, AM: 0, PM: 0 }
  for (const day of weekDayKeys) {
    const mode = entry.days?.[day] || 'NONE'
    if (mode !== 'NONE') {
      counts[mode] += 1
    }
  }

  const selectedDayTotal = counts.FULL + counts.AM + counts.PM
  if (selectedDayTotal === 0) {
    return ''
  }

  const parts = []
  if (counts.FULL > 0) {
    parts.push(pluralize('Full Day', counts.FULL))
  }
  if (counts.AM > 0) {
    parts.push(pluralize('AM Day', counts.AM))
  }
  if (counts.PM > 0) {
    parts.push(pluralize('PM Day', counts.PM))
  }

  return `Registered: ${pluralize('Day', selectedDayTotal)}${parts.length ? ` (${parts.join(', ')})` : ''}`
}

function currency(amount) {
  return `$${Number(amount || 0).toFixed(2)}`
}

function roundUpToFive(value) {
  const next = Math.ceil(Number(value || 0) / 5) * 5
  return Number.isFinite(next) ? Math.max(0, next) : 0
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

function getDefaultSurveyData() {
  return {
    contactEmail: '',
    camperCount: '1',
    camperAges: [''],
    hasSports: '',
    sportsList: '',
    noSportsPriority: [],
    hasMartial: '',
    martialYears: '',
    martialMonths: '',
    goals: [],
    activityInterests: [],
    lunchInterest: '',
    registrationIntent: '',
  }
}

function readSurveyDraft() {
  if (typeof window === 'undefined') {
    return getDefaultSurveyData()
  }

  try {
    const nav = window.performance?.getEntriesByType?.('navigation')?.[0]
    if (nav && nav.type === 'reload') {
      window.localStorage.removeItem(SURVEY_DRAFT_KEY)
      return getDefaultSurveyData()
    }

    const raw = window.localStorage.getItem(SURVEY_DRAFT_KEY)
    if (!raw) {
      return getDefaultSurveyData()
    }
    const parsed = JSON.parse(raw)
    return {
      ...getDefaultSurveyData(),
      ...parsed,
      noSportsPriority: Array.isArray(parsed?.noSportsPriority) ? parsed.noSportsPriority.slice(0, 3) : [],
      camperAges: Array.isArray(parsed?.camperAges) ? parsed.camperAges : [''],
      goals: Array.isArray(parsed?.goals) ? parsed.goals : [],
      activityInterests: Array.isArray(parsed?.activityInterests) ? parsed.activityInterests : [],
    }
  } catch {
    return getDefaultSurveyData()
  }
}

export default function HomePage() {
  const router = useRouter()
  const pathname = usePathname()
  const isRegistrationRoute = pathname === '/register'
  const [language, setLanguage] = useState('en')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [stepDirection, setStepDirection] = useState('next')
  const [countdownNow, setCountdownNow] = useState(() => new Date())
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [isDiscountCollapsed, setIsDiscountCollapsed] = useState(false)
  const [overnightRequestOption, setOvernightRequestOption] = useState('fullWeek')
  const [activeStudentId, setActiveStudentId] = useState('')
  const [expandedStudentId, setExpandedStudentId] = useState('')
  const [expandedWeekKey, setExpandedWeekKey] = useState('')
  const [expandedLunchWeekKey, setExpandedLunchWeekKey] = useState('')
  const [scheduleCopySourceId, setScheduleCopySourceId] = useState('')
  const [lunchCopySourceId, setLunchCopySourceId] = useState('')
  const [helpWeekKey, setHelpWeekKey] = useState('')
  const [levelUpSlideIndex, setLevelUpSlideIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState('next')
  const [entryMode, setEntryMode] = useState(() => {
    if (isRegistrationRoute) {
      return 'register'
    }
    if (typeof window !== 'undefined' && window.location.hash === '#camp-info') {
      return 'register'
    }
    return ''
  })
  const [marketingNeed, setMarketingNeed] = useState('confidence')
  const [marketingFlowIndex, setMarketingFlowIndex] = useState(0)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [campGalleryIndex, setCampGalleryIndex] = useState(0)
  const [campGalleryDirection, setCampGalleryDirection] = useState('next')
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [summaryOverlayOpen, setSummaryOverlayOpen] = useState(false)
  const [summaryOverlayHtml, setSummaryOverlayHtml] = useState('')
  const [submittedRegistrationSnapshot, setSubmittedRegistrationSnapshot] = useState(null)
  const [registrationDiscountClaimed, setRegistrationDiscountClaimed] = useState(false)
  const [surveyStep, setSurveyStep] = useState(1)
  const [surveyDirection, setSurveyDirection] = useState('next')
  const [surveyMessage, setSurveyMessage] = useState('')
  const [savingSurveyProfile, setSavingSurveyProfile] = useState(false)
  const [surveyData, setSurveyData] = useState({
    ...readSurveyDraft(),
  })
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactMessage, setContactMessage] = useState('')
  const [adminConfig, setAdminConfig] = useState(defaultAdminConfig)
  const [draftReady, setDraftReady] = useState(false)
  const [registration, setRegistration] = useState({
    contactEmail: '',
    contactPhone: '',
    students: [createStudent('student-1')],
  })
  const registrationRef = useRef(null)
  const surveyRef = useRef(null)
  const summaryIframeRef = useRef(null)
  const slideTouchStartRef = useRef(0)
  const campGalleryTouchStartRef = useRef(0)

  const missingConfig = useMemo(() => !supabaseEnabled, [])
  const generalWeeks = useMemo(
    () => getSelectedWeeks('general', adminConfig.programs.general),
    [adminConfig.programs.general]
  )
  const bootcampWeeks = useMemo(
    () => getSelectedWeeks('bootcamp', adminConfig.programs.bootcamp),
    [adminConfig.programs.bootcamp]
  )
  const overnightWeeks = useMemo(() => getSelectedWeeks('overnight', adminConfig.programs.overnight), [
    adminConfig.programs.overnight,
  ])
  const featuredTestimonials = useMemo(() => {
    const incoming = Array.isArray(adminConfig.testimonials) ? adminConfig.testimonials : []
    const merged = [...incoming]
    for (const fallback of defaultAdminConfig.testimonials) {
      const duplicate = merged.some(
        (item) => item?.studentName === fallback.studentName && item?.headline === fallback.headline
      )
      if (!duplicate) {
        merged.push(fallback)
      }
    }
    return merged.slice(0, 5)
  }, [adminConfig.testimonials])
  const testimonialCount = featuredTestimonials.length
  const normalizedTestimonialIndex = testimonialCount > 0
    ? ((testimonialIndex % testimonialCount) + testimonialCount) % testimonialCount
    : 0
  const activeTestimonial = useMemo(() => {
    if (testimonialCount === 0) {
      return null
    }
    return featuredTestimonials[normalizedTestimonialIndex]
  }, [featuredTestimonials, normalizedTestimonialIndex, testimonialCount])
  const activeTestimonialHighlights = useMemo(
    () => getTestimonialHighlights(activeTestimonial),
    [activeTestimonial]
  )

  const registrationWeeks = useMemo(() => {
    const dayCampMap = new Map()

    for (const week of generalWeeks) {
      const id = `daycamp:${week.start}`
      dayCampMap.set(id, {
        id,
        start: week.start,
        end: week.end,
        programKey: 'daycamp',
        programLabel: 'Camp Week',
        days: getWeekDays(week.start),
        availableCampTypes: ['general'],
      })
    }

    for (const week of bootcampWeeks) {
      const id = `daycamp:${week.start}`
      const existing = dayCampMap.get(id)
      if (existing) {
        existing.availableCampTypes = existing.availableCampTypes.includes('bootcamp')
          ? existing.availableCampTypes
          : [...existing.availableCampTypes, 'bootcamp']
      } else {
        dayCampMap.set(id, {
          id,
          start: week.start,
          end: week.end,
          programKey: 'daycamp',
          programLabel: 'Camp Week',
          days: getWeekDays(week.start),
          availableCampTypes: ['bootcamp'],
        })
      }
    }

    const mappedDayCamp = Array.from(dayCampMap.values()).sort((a, b) => a.start.localeCompare(b.start))

    return mappedDayCamp
  }, [bootcampWeeks, generalWeeks])

  const weeksById = useMemo(() => {
    const byId = {}
    for (const week of registrationWeeks) {
      byId[week.id] = week
    }
    return byId
  }, [registrationWeeks])

  const phoneScreenshots = useMemo(() => {
    if (adminConfig.media.levelUpScreenshotUrls.length > 0) {
      return adminConfig.media.levelUpScreenshotUrls
    }

    if (adminConfig.media.levelUpImageUrl) {
      return [adminConfig.media.levelUpImageUrl]
    }

    return []
  }, [adminConfig.media.levelUpImageUrl, adminConfig.media.levelUpScreenshotUrls])
  const isZh = language === 'zh'
  const text = (en, zh) => (isZh ? zh : en)
  const campGalleryItems = useMemo(() => {
    const surveyImages = Array.isArray(adminConfig.media.surveyStepImageUrls)
      ? adminConfig.media.surveyStepImageUrls
      : []
    return [
      { src: (adminConfig.media.heroImageUrl || '').trim(), slot: isZh ? '营地主视觉' : 'Hero Camp Moment' },
      { src: (surveyImages[0] || '').trim(), slot: isZh ? '训练亮点' : 'Training Highlights' },
      { src: (surveyImages[1] || '').trim(), slot: isZh ? '团队与友谊' : 'Teamwork & Friends' },
      { src: (surveyImages[2] || '').trim(), slot: isZh ? '每周展示' : 'Weekly Showcase' },
    ]
  }, [adminConfig.media.heroImageUrl, adminConfig.media.surveyStepImageUrls, isZh])
  const campGalleryCount = campGalleryItems.length
  const normalizedCampGalleryIndex = campGalleryCount > 0
    ? ((campGalleryIndex % campGalleryCount) + campGalleryCount) % campGalleryCount
    : 0
  const activeCampGalleryItem = campGalleryCount > 0 ? campGalleryItems[normalizedCampGalleryIndex] : null
  const previousCampGalleryItem = campGalleryCount > 1
    ? campGalleryItems[(normalizedCampGalleryIndex - 1 + campGalleryCount) % campGalleryCount]
    : activeCampGalleryItem
  const nextCampGalleryItem = campGalleryCount > 1
    ? campGalleryItems[(normalizedCampGalleryIndex + 1) % campGalleryCount]
    : activeCampGalleryItem
  const activeCampGalleryCaption = campGalleryCaptions[normalizedCampGalleryIndex % campGalleryCaptions.length]
  const levelUpSlideCount = Math.max(phoneScreenshots.length, levelUpFeatures.length, 1)
  const activeLevelUpFeature = levelUpFeatures[levelUpSlideIndex % levelUpFeatures.length]
  const activeLevelUpScreenshot =
    phoneScreenshots.length > 0 ? phoneScreenshots[levelUpSlideIndex % phoneScreenshots.length] : ''

  const summaries = useMemo(
    () => registration.students.map((student) => ({ student, summary: getStudentSummary(student) })),
    [registration.students]
  )
  const summaryDigest = useMemo(() => {
    const totalCampDays = summaries.reduce((acc, item) => {
      const summary = item.summary
      return acc
        + summary.general.fullWeeks * 5
        + summary.general.fullDays
        + summary.general.amDays
        + summary.general.pmDays
        + summary.bootcamp.fullWeeks * 5
        + summary.bootcamp.fullDays
        + summary.bootcamp.amDays
        + summary.bootcamp.pmDays
    }, 0)
    const totalLunchDays = summaries.reduce((acc, item) => acc + item.summary.lunchCount, 0)
    return { totalCampDays, totalLunchDays }
  }, [summaries])

  const discountActive = useMemo(() => {
    const end = parseDateLocal(adminConfig.tuition.discountEndDate)
    if (!end) {
      return false
    }
    const endDateTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
    return countdownNow.getTime() <= endDateTime.getTime()
  }, [adminConfig.tuition.discountEndDate, countdownNow])
  const discountCountdown = useMemo(() => {
    const end = parseDateLocal(adminConfig.tuition.discountEndDate)
    if (!end) {
      return null
    }
    const endDateTime = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
    if (countdownNow.getTime() > endDateTime.getTime()) {
      return null
    }
    const parts = getCountdownParts(endDateTime, countdownNow)
    return {
      ...parts,
      endLabel: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
  }, [adminConfig.tuition.discountEndDate, countdownNow])
  const overnightPricingRows = useMemo(() => {
    const regular = adminConfig.tuition.regular
    const discounted = adminConfig.tuition.discount
    const rows = [
      { key: 'fullWeek', label: 'Overnight Full Week', regular: Number(regular.overnightWeek || 0), discounted: Number(discounted.overnightWeek || 0) },
      { key: 'fullDay', label: 'Overnight Full Day', regular: Number(regular.overnightDay || 0), discounted: Number(discounted.overnightDay || 0) },
    ]

    return rows.map((row) => {
      const normalizedDiscounted = row.discounted > 0 ? row.discounted : row.regular
      const effective = discountActive ? Math.min(row.regular, normalizedDiscounted) : row.regular
      const discountAmount = Math.max(0, row.regular - effective)
      return {
        ...row,
        effective,
        discountAmount,
      }
    })
  }, [adminConfig.tuition, discountActive])
  useEffect(() => {
    let active = true

    async function syncConfig() {
      const { data } = await fetchAdminConfigFromSupabase()
      if (active) {
        setAdminConfig(data)
      }
    }

    syncConfig()
    window.addEventListener('camp-admin-updated', syncConfig)

    return () => {
      active = false
      window.removeEventListener('camp-admin-updated', syncConfig)
    }
  }, [])

  function goToLevelUpSlide(nextIndex, direction = 'next') {
    if (levelUpSlideCount <= 0) {
      return
    }
    setSlideDirection(direction)
    setLevelUpSlideIndex(((nextIndex % levelUpSlideCount) + levelUpSlideCount) % levelUpSlideCount)
  }

  function nextLevelUpSlide() {
    goToLevelUpSlide(levelUpSlideIndex + 1, 'next')
  }

  function previousLevelUpSlide() {
    goToLevelUpSlide(levelUpSlideIndex - 1, 'prev')
  }

  function onLevelUpTouchStart(event) {
    slideTouchStartRef.current = event.changedTouches[0]?.clientX || 0
  }

  function onLevelUpTouchEnd(event) {
    const endX = event.changedTouches[0]?.clientX || 0
    const delta = endX - slideTouchStartRef.current
    if (Math.abs(delta) < 40) {
      return
    }
    if (delta < 0) {
      nextLevelUpSlide()
    } else {
      previousLevelUpSlide()
    }
  }

  function goToCampGallerySlide(nextIndex, direction = 'next') {
    if (campGalleryCount <= 0) {
      return
    }
    setCampGalleryDirection(direction)
    setCampGalleryIndex(((nextIndex % campGalleryCount) + campGalleryCount) % campGalleryCount)
  }

  function nextCampGallerySlide() {
    goToCampGallerySlide(campGalleryIndex + 1, 'next')
  }

  function previousCampGallerySlide() {
    goToCampGallerySlide(campGalleryIndex - 1, 'prev')
  }

  function onCampGalleryTouchStart(event) {
    campGalleryTouchStartRef.current = event.changedTouches?.[0]?.clientX || 0
  }

  function onCampGalleryTouchEnd(event) {
    const endX = event.changedTouches?.[0]?.clientX || 0
    const delta = endX - campGalleryTouchStartRef.current
    if (Math.abs(delta) < 24) {
      return
    }
    if (delta < 0) {
      nextCampGallerySlide()
    } else {
      previousCampGallerySlide()
    }
  }

  useEffect(() => {
    if (levelUpSlideCount <= 1) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setSlideDirection('next')
      setLevelUpSlideIndex((current) => (current + 1) % levelUpSlideCount)
    }, 2500)

    return () => window.clearInterval(timer)
  }, [levelUpSlideCount])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdownNow(new Date())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(SURVEY_DRAFT_KEY, JSON.stringify(surveyData))
  }, [surveyData])

  useEffect(() => {
    function syncViewport() {
      const mobile = window.matchMedia('(max-width: 700px)').matches
      setIsMobileViewport(mobile)
      setIsDiscountCollapsed(mobile)
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  useEffect(() => {
    const draft = readRegistrationDraft()
    if (draft?.registration) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRegistration({
        contactEmail:
          typeof draft.registration.contactEmail === 'string' ? draft.registration.contactEmail : '',
        contactPhone:
          typeof draft.registration.contactPhone === 'string' ? draft.registration.contactPhone : '',
        students:
          Array.isArray(draft.registration.students) && draft.registration.students.length
            ? draft.registration.students.map(normalizeStudentDraft)
            : [createStudent('student-1')],
      })

      const draftStep = Number(draft.step)
      if (Number.isFinite(draftStep)) {
        setStep(Math.max(1, Math.min(registrationSteps.length, draftStep)))
      }
      if (typeof draft.activeStudentId === 'string') {
        setActiveStudentId(draft.activeStudentId)
      }
      if (typeof draft.expandedStudentId === 'string') {
        setExpandedStudentId(draft.expandedStudentId)
      }
    }

    setDraftReady(true)
  }, [])

  useEffect(() => {
    if (!draftReady || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      REGISTRATION_DRAFT_KEY,
      JSON.stringify({
        step,
        activeStudentId,
        expandedStudentId,
        registration,
      })
    )
  }, [activeStudentId, draftReady, expandedStudentId, registration, step])

  function jumpToRegistration() {
    if (!isRegistrationRoute) {
      router.push('/register')
      return
    }
    setEntryMode('register')
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        registrationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 40)
    }
  }

  function jumpToCampTop() {
    if (isRegistrationRoute) {
      router.push('/#camp-info')
      return
    }
    setEntryMode('register')
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        document.getElementById('camp-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 40)
    }
  }

  function jumpToSurvey() {
    surveyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function updateSurveyField(field, value) {
    setSurveyData((current) => ({ ...current, [field]: value }))
  }

  function toggleSurveyActivity(activity) {
    setSurveyData((current) => ({
      ...current,
      activityInterests: current.activityInterests.includes(activity)
        ? current.activityInterests.filter((item) => item !== activity)
        : [...current.activityInterests, activity],
    }))
  }

  function setSurveySportsParticipation(value) {
    setSurveyData((current) => ({
      ...current,
      hasSports: value,
      sportsList: value === 'yes' ? current.sportsList : '',
      noSportsPriority: value === 'no' ? current.noSportsPriority : [],
    }))
  }

  function toggleNoSportsPriority(priority) {
    setSurveyData((current) => {
      const selected = Array.isArray(current.noSportsPriority) ? current.noSportsPriority : []
      if (selected.includes(priority)) {
        return {
          ...current,
          noSportsPriority: selected.filter((item) => item !== priority),
        }
      }
      if (selected.length >= 3) {
        return current
      }
      return {
        ...current,
        noSportsPriority: [...selected, priority],
      }
    })
  }

  async function saveSurveyProfileLead(lastCompletedStep) {
    if (!supabaseEnabled || !supabase) {
      return null
    }

    const camperAges = surveyData.camperAges
      .map((age) => Number(age || 0))
      .filter((age) => Number.isFinite(age) && age > 0)
    const surveyContext = {
      camperCount: Math.max(1, Number(surveyData.camperCount || 1)),
      camperAges,
      hasSports: surveyData.hasSports || null,
      sportsList: surveyData.sportsList?.trim() || '',
      noSportsPriority:
        Array.isArray(surveyData.noSportsPriority) && surveyData.noSportsPriority.length > 0
          ? surveyData.noSportsPriority
          : null,
      hasMartial: surveyData.hasMartial || null,
      martialYears: Number(surveyData.martialYears || 0),
      martialMonths: Number(surveyData.martialMonths || 0),
      goals: surveyData.goals,
      activityInterests: surveyData.activityInterests,
      lunchInterest: surveyData.lunchInterest || null,
      registrationIntent: surveyData.registrationIntent || null,
    }
    const payload = {
      email: surveyData.contactEmail.trim(),
      camper_count: Math.max(1, Number(surveyData.camperCount || 1)),
      camper_ages: camperAges,
      profile_context: surveyContext,
      last_completed_step: Number(lastCompletedStep) || 1,
    }

    const { error } = await supabase.from('program_interest_profiles').insert(payload)
    return error
  }

  function setSurveyCamperCount(value) {
    const cleaned = value.replace(/\D/g, '')
    if (!cleaned) {
      setSurveyData((current) => ({ ...current, camperCount: '', camperAges: [] }))
      return
    }
    const count = Math.max(1, Math.min(6, Number(cleaned)))
    setSurveyData((current) => {
      const nextAges = Array.from({ length: count }).map((_, index) => current.camperAges[index] || '')
      return {
        ...current,
        camperCount: String(count),
        camperAges: nextAges,
      }
    })
  }

  function setSurveyCamperAge(index, value) {
    const cleaned = value.replace(/\D/g, '')
    setSurveyData((current) => ({
      ...current,
      camperAges: current.camperAges.map((age, ageIndex) => (ageIndex === index ? cleaned : age)),
    }))
  }

  function toggleSurveyGoal(goal) {
    setSurveyData((current) => ({
      ...current,
      goals: current.goals.includes(goal)
        ? current.goals.filter((item) => item !== goal)
        : [...current.goals, goal],
    }))
  }

  function getSurveyFeedback(step) {
    const camperCount = Math.max(1, Number(surveyData.camperCount || 1))
    const ages = surveyData.camperAges.map((age) => Number(age || 0)).filter((age) => age > 0)
    const allUnder6 = ages.length > 0 && ages.every((age) => age < 6)
    const hasYoungCamper = ages.some((age) => age <= 6)
    const hasFiveToNine = ages.some((age) => age >= 5 && age <= 9)
    const minAge = ages.length > 0 ? Math.min(...ages) : 0
    const maxAge = ages.length > 0 ? Math.max(...ages) : 0
    const hasWideSiblingRange = camperCount > 1 && ages.length > 1 && maxAge - minAge >= 3
    const familyLine =
      camperCount > 1
        ? text(
            'Good news: sibling discount is available, and camp is a great way for family and friends to spend summer time together through team-building activities.',
            '好消息：兄弟姐妹可享优惠，营地也通过团队活动帮助家人和朋友共度高质量暑期时光。'
          )
        : text(
            'Camp is also a great place to make new friends, with many team-building activities built into each week.',
            '营地也是结识新朋友的好地方，每周都有丰富的团队协作活动。'
          )

    if (step === 1) {
      const stepOneLines = []
      if (allUnder6) {
        stepOneLines.push(
          text(
            'Great fit: for campers under 6, General Camp is usually the best starting point.',
            '非常适合：6岁以下营员通常最适合从普通营开始。'
          )
        )
      } else {
        stepOneLines.push(text('Thanks for sharing your camper ages.', '感谢您提供营员年龄信息。'))
      }
      if (hasYoungCamper) {
        stepOneLines.push(text('We have dedicated programs for young campers ages 6 and under.', '我们为6岁及以下小营员设置了专属课程。'))
      }
      if (hasFiveToNine) {
        stepOneLines.push(text('Ages 5-9 are a great age to start Wushu.', '5-9岁是开始武术训练的黄金年龄。'))
      }
      if (hasWideSiblingRange) {
        stepOneLines.push(text('We accept and coach a wide range of sibling age groups in the same season.', '我们可在同一季为不同年龄段兄弟姐妹提供分层训练。'))
      }
      stepOneLines.push(familyLine)
      return stepOneLines.join(' ')
    }
    if (step === 2) {
      if (surveyData.hasSports === 'yes') {
        return text(
          'Great. Next we will capture which sports they play so we can tailor training carry-over.',
          '很好。下一步我们会了解具体运动项目，以便做更精准的能力迁移训练。'
        )
      }
      return text(
        'Perfect. Next we will pick what to build first so we can personalize your starter path.',
        '很好。下一步我们会确定优先提升方向，定制孩子的起步路径。'
      )
    }
    if (step === 3) {
      const hasOlderCamper = ages.some((age) => age > 9)
      const olderCamperLine = hasOlderCamper
        ? 'For older kids, Wushu is especially effective for building discipline, athletic performance, confidence, and leadership.'
        : ''
      if (surveyData.hasSports === 'yes' && surveyData.sportsList.trim()) {
        return `Great - ${surveyData.sportsList} is an excellent base. Wushu will sharpen coordination, flexibility, balance, speed, and body control to elevate overall athletic performance.${olderCamperLine ? ` ${olderCamperLine}` : ''}`
      }
      if (surveyData.hasSports === 'no' && surveyData.noSportsPriority.length > 0) {
        return `Great focus. We will help build ${surveyData.noSportsPriority.join(', ')} with clear coaching progress from day one.${olderCamperLine ? ` ${olderCamperLine}` : ''}`
      }
      return `Many of our students start with no sports experience. Our progression system builds coordination, strength, flexibility, confidence, and focus from day one.${olderCamperLine ? ` ${olderCamperLine}` : ''}`
    }
    if (step === 4) {
      return surveyData.hasMartial === 'yes'
        ? text(
            'Nice. Next we will quickly capture years/months so we can place your camper at the right training level.',
            '很好。下一步将快速了解训练年限，便于准确分班。'
          )
        : text(
            'Great. No prior martial arts is totally fine. Next we will continue to goals and scheduling preferences.',
            '非常好。零基础完全没问题，下一步我们继续了解目标和日程偏好。'
          )
    }
    if (step === 5) {
      if (surveyData.hasMartial === 'yes') {
        const years = Number(surveyData.martialYears || 0)
        const months = Number(surveyData.martialMonths || 0)
        const totalYears = years + months / 12
        if (totalYears >= 3) {
          return text(
            'Your martial arts experience is a great fit for advanced training paths.',
            '您的武术基础很适合进阶训练路径。'
          )
        }
        return text(
          'Great foundation - we can build fast from your current experience level.',
          '基础很好，我们可以在现有水平上快速进阶。'
        )
      }
      return text(
        'That is great. New students do very well with our structured progression.',
        '很棒。我们的结构化进阶体系对新学员非常友好。'
      )
    }
    if (step === 6) {
      const selectedActivities = surveyData.activityInterests
        .map((value) => surveyActivities.find((item) => item.value === value)?.label)
        .filter(Boolean)
      const activityLine =
        selectedActivities.length > 0
          ? `Great picks: ${selectedActivities.join(', ')}. We include similar training blocks every week to keep campers engaged and progressing.`
          : 'Great direction. We balance skill work, movement, and fun engagement every week.'
      const campWindow = registrationWeeks.length
        ? `Camp runs ${formatWeekLabel({
            start: registrationWeeks[0].start,
            end: registrationWeeks[registrationWeeks.length - 1].end,
          })}.`
        : 'Camp start/end dates are posted in the dates section.'
      const scheduleLine =
        'Typical week: Mon footwork/team games, Tue technique stations, Wed agility/partner drills, Thu mini challenges, Fri showcase prep.'
      if (surveyData.goals.includes('competition')) {
        return `${activityLine} ${scheduleLine} ${campWindow} Awesome goal. Competition Team Boot Camp will likely be a strong match.`
      }
      if (surveyData.lunchInterest === 'yes') {
        return `${activityLine} ${scheduleLine} ${campWindow} Lunch can be added by day in registration, making full camp weeks easier for busy family schedules.`
      }
      if (surveyData.goals.includes('social/teamwork/friends')) {
        return `${activityLine} ${scheduleLine} ${campWindow} Camp is designed to build teamwork, friendships, and social confidence through daily group activities.`
      }
      return `${activityLine} ${scheduleLine} ${campWindow} We will match your family with a balanced and fun progression path.`
    }
    return ''
  }

  function getSurveyDidYouKnowFact() {
    const hasFiveToNine = surveyData.camperAges
      .map((age) => Number(age || 0))
      .some((age) => age >= 5 && age <= 9)

    if (surveyStep === 1) {
      return hasFiveToNine
        ? text(
            'Most of our top athletes started training between ages 5 and 9.',
            '我们很多顶尖学员都是在5到9岁开始训练的。'
          )
        : text(
            'We coach multiple age groups every week with level-based training tracks.',
            '我们每周提供分龄分级训练，覆盖多个年龄层。'
          )
    }

    if (surveyStep === 2) {
      return text(
        'Wushu helps athletes improve balance, mobility, coordination, speed, and focus across many sports.',
        '武术能显著提升平衡、协调、灵活性、速度和专注力。'
      )
    }

    if (surveyStep === 3) {
      return text(
        'We map your current sports background to Wushu training plans for faster progress transfer.',
        '我们会把现有运动背景映射到武术训练中，帮助更快迁移与进步。'
      )
    }

    if (surveyStep === 4) {
      return text(
        'Our academy has earned 500+ competition medals, and experienced coaches support both beginner and advanced pathways.',
        '学院已获得500+奖牌，经验教练可同时支持零基础与进阶路径。'
      )
    }

    if (surveyStep === 5) {
      return text(
        'Martial arts experience is optional. Many strong students start with no prior experience.',
        '无需武术基础，很多优秀学员都是从零开始。'
      )
    }

    if (surveyStep === 6) {
      return text(
        'Families can choose lunch by day during registration, making weekly planning easier.',
        '报名时可按天选择午餐，周计划更轻松。'
      )
    }

    if (surveyStep === 7) {
      return text(
        'You can mix General Camp and Competition Team Boot Camp by week based on your goals.',
        '可根据目标按周组合普通营与竞赛集训营。'
      )
    }

    return ''
  }

  function getGoalsEncouragement() {
    if (surveyData.goals.length === 0) {
      return ''
    }

    if (surveyData.goals.includes('competition')) {
      return 'Excellent goal. We will map a progression path that builds skills for confident competition performance.'
    }
    if (surveyData.goals.includes('social/teamwork/friends')) {
      return 'Great goal. Camp includes partner drills and team activities that build friendships and social confidence.'
    }
    if (surveyData.goals.includes('exercise')) {
      return 'Great choice. Training builds athleticism, flexibility, and strong movement habits.'
    }

    return 'Love it. We keep training fun while building real skill and confidence each week.'
  }

  function buildSurveyRecommendation() {
    const camperCount = Math.max(1, Number(surveyData.camperCount || 1))
    const ages = surveyData.camperAges.map((age) => Number(age || 0)).filter((age) => age > 0)
    const allUnder6 = ages.length > 0 && ages.every((age) => age < 6)
    const hasCompetitionGoal = surveyData.goals.includes('competition')
    const martialYears = Number(surveyData.martialYears || 0) + Number(surveyData.martialMonths || 0) / 12
    const recommendCompetition = !allUnder6 && (hasCompetitionGoal || martialYears >= 3)

    const lines = []
    if (registrationWeeks.length) {
      lines.push(
        `${text('Camp season', '营期时间')}: ${formatWeekLabel({
          start: registrationWeeks[0].start,
          end: registrationWeeks[registrationWeeks.length - 1].end,
        })}.`
      )
    }
    if (allUnder6) {
      lines.push(text('Best fit: General Camp (100% recommendation for under-6 campers).', '最佳匹配：普通营（6岁以下建议优先100%匹配）。'))
    } else if (recommendCompetition) {
      lines.push(text('Best fit: Competition Team Boot Camp.', '最佳匹配：竞赛队集训营。'))
      lines.push(text('Suggested start: minimum 2 weeks of Competition Team Boot Camp for best skill learning.', '建议起步：至少2周竞赛队集训营，以获得更好的技能提升效果。'))
    } else {
      lines.push(text('Best fit: General Camp with progression options as skills improve.', '最佳匹配：普通营，并可随能力提升逐步进阶。'))
      lines.push(text('Suggested start: minimum 2 weeks for stronger skill retention and confidence gains.', '建议起步：至少2周，更有助于技能巩固与自信提升。'))
    }
    if (camperCount > 1) {
      lines.push(text('Sibling discount is available for your family.', '您的家庭可享兄弟姐妹优惠。'))
      lines.push(
        text(
          'Camp includes lots of team-building activities, making it a great way for family and friends to spend time together in the summer.',
          '营地有丰富团队活动，非常适合家人和朋友在夏天共同成长与互动。'
        )
      )
    } else {
      lines.push(text('Camp is a great place to make new friends through many team-building activities each week.', '营地是结交新朋友的好地方，每周都有丰富团队协作活动。'))
    }
    if (surveyData.goals.includes('social/teamwork/friends')) {
      lines.push(text('You selected social/teamwork goals: we include guided partner drills and group challenges every week.', '您选择了社交/团队目标：我们每周都有搭档训练与团队挑战。'))
    }
    if (surveyData.lunchInterest === 'yes') {
      lines.push(text('You marked lunch convenience as important: lunch can be selected by day during registration.', '您重视午餐便利：报名时可按天选择午餐。'))
    }
    lines.push(text('You can still mix General Camp and Competition Team Boot Camp by week.', '您也可以按周组合普通营与竞赛队集训营。'))
    lines.push(
      text(
        'New England Wushu is awarded Best in Burlington and recognized as a top academy in the area, led by certified top coaches.',
        '新英格兰武术学院获评伯灵顿最佳之一，由认证顶级教练团队带领。'
      )
    )
    return lines
  }

  function validateSurveyStep(step) {
    if (step === 1) {
      const email = surveyData.contactEmail.trim()
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return text('Please enter a valid email address.', '请输入有效邮箱地址。')
      }
      const count = Number(surveyData.camperCount || 0)
      if (!count || count < 1) {
        return text('Enter number of campers.', '请输入营员人数。')
      }
      const missingAges = surveyData.camperAges.some((age) => !age)
      if (missingAges) {
        return text('Enter age for each camper.', '请填写每位营员年龄。')
      }
    }

    if (step === 2) {
      if (!surveyData.hasSports) {
        return text('Select whether your child has sports participation.', '请选择孩子是否有运动参与经历。')
      }
    }

    if (step === 3) {
      if (surveyData.hasSports === 'yes' && !surveyData.sportsList.trim()) {
        return text('Enter the sports your child participates in.', '请填写孩子参与过的运动项目。')
      }
      if (surveyData.hasSports === 'no' && surveyData.noSportsPriority.length === 0) {
        return text('Select what you want your child to build first.', '请选择希望孩子优先提升的方向。')
      }
    }

    if (step === 4) {
      if (!surveyData.hasMartial) {
        return text('Select whether your child has martial arts experience.', '请选择孩子是否有武术经历。')
      }
    }

    if (step === 6) {
      if (!surveyData.lunchInterest) {
        return text('Select whether lunch convenience would help your family schedule.', '请选择午餐服务是否有助于家庭安排。')
      }
      if (surveyData.activityInterests.length === 0) {
        return text('Select at least one preferred activity so we can tailor the fit.', '请至少选择一项活动偏好，便于我们匹配方案。')
      }
      if (surveyData.goals.length === 0) {
        return text('Select at least one goal so we can personalize recommendations.', '请至少选择一个目标，便于个性化推荐。')
      }
    }

    return ''
  }

  async function nextSurveyStep() {
    const error = validateSurveyStep(surveyStep)
    if (error) {
      setSurveyMessage(error)
      return
    }
    if (surveyStep === 1) {
      setSavingSurveyProfile(true)
      const saveError = await saveSurveyProfileLead(1)
      setSavingSurveyProfile(false)
      if (saveError) {
        setSurveyMessage(`Could not save email profile: ${saveError.message}`)
        return
      }
    } else {
      const saveError = await saveSurveyProfileLead(surveyStep)
      if (saveError) {
        setSurveyMessage(`Could not save survey context: ${saveError.message}`)
        return
      }
    }
    setSurveyMessage('')
    setSurveyDirection('next')
    setSurveyStep((current) => {
      const next = Math.min(current + 1, SURVEY_TOTAL_STEPS)
      return next
    })
  }

  function previousSurveyStep() {
    setSurveyMessage('')
    setSurveyDirection('prev')
    setSurveyStep((current) => Math.max(current - 1, 1))
  }

  function chooseLearnPath() {
    setEntryMode('learn')
    setSurveyStep(1)
    setSurveyMessage('')
    setSurveyDirection('next')
    if (!isMobileViewport) {
      jumpToSurvey()
    }
  }

  async function handleThinkAboutIt() {
    setSurveyData((current) => ({ ...current, registrationIntent: 'think' }))
    const saveError = await saveSurveyProfileLead(SURVEY_TOTAL_STEPS)
    if (saveError) {
      setSurveyMessage(`Could not save follow-up intent: ${saveError.message}`)
      return
    }
    setSurveyMessage('Great. We will follow up with useful info while you think it over.')
  }

  async function handleReadyToRegister() {
    setSurveyData((current) => ({ ...current, registrationIntent: 'ready' }))
    await saveSurveyProfileLead(SURVEY_TOTAL_STEPS)
    jumpToRegistration()
  }

  function updateContactForm(field, value) {
    setContactForm((current) => ({ ...current, [field]: value }))
  }

  function submitContact(event) {
    event.preventDefault()
    const subject = encodeURIComponent(`Summer Camp Question from ${contactForm.name || 'Family'}`)
    const body = encodeURIComponent(
      `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\nMessage:\n${contactForm.message}`
    )
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
    }
    setContactMessage('Opening your email app. If it does not open, email us directly.')
  }

  function getMarketingNeedResponse() {
    if (marketingNeed === 'athletic') {
      return text(
        'Great choice. We focus on coordination, speed, flexibility, and structured conditioning so campers improve performance across sports.',
        '很棒。我们重点提升协调、速度、柔韧和体能，帮助孩子在多项运动中都更有表现。'
      )
    }
    if (marketingNeed === 'tumbling') {
      return text(
        'Excellent choice. Our qualified coaches have taught hundreds of students tumbling skills with step-by-step progressions for safe and confident learning.',
        '非常好。我们的专业教练已系统教授数百名学员翻腾技巧，通过分阶段训练实现安全且自信的进步。'
      )
    }
    if (marketingNeed === 'social') {
      return text(
        'Perfect fit. Daily team challenges and partner drills are designed to build friendships, communication, and social confidence.',
        '非常适合。每日团队挑战和搭档训练专门帮助建立友谊、沟通力和社交自信。'
      )
    }
    return text(
      'Excellent focus. Our step-by-step coaching model helps campers build confidence through visible progress every week.',
      '非常好。我们分阶段教练模型通过每周可见进步来持续建立孩子自信。'
    )
  }

  function previousMarketingFlowStep() {
    setMarketingFlowIndex((current) => Math.max(0, current - 1))
  }

  function nextMarketingFlowStep() {
    setMarketingFlowIndex((current) => Math.min(3, current + 1))
  }

  function localizeTestimonialValue(value, fallbackValue) {
    if (language !== 'zh') {
      return value || fallbackValue
    }
    if (!value) {
      return fallbackValue
    }
    return testimonialTranslationMap[value] || value
  }

  function previousTestimonial() {
    if (featuredTestimonials.length <= 1) {
      return
    }
    setTestimonialIndex((current) => (current - 1 + featuredTestimonials.length) % featuredTestimonials.length)
  }

  function nextTestimonial() {
    if (featuredTestimonials.length <= 1) {
      return
    }
    setTestimonialIndex((current) => (current + 1) % featuredTestimonials.length)
  }

  function updateContact(field, value) {
    setRegistration((current) => ({ ...current, [field]: value }))
  }

  function updateStudentField(studentId, field, value) {
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              [field]: value,
            }
          : student
      ),
    }))
  }

  function addStudent() {
    if (registration.students.length >= MAX_CAMPERS) {
      setMessage(`You can add up to ${MAX_CAMPERS} campers.`)
      return
    }

    const next = createStudent()
    setRegistration((current) => ({
      ...current,
      students: [...current.students, next],
    }))
    setActiveStudentId(next.id)
    setExpandedStudentId(next.id)
  }

  function removeStudent(studentId) {
    setRegistration((current) => {
      const remaining = current.students.filter((student) => student.id !== studentId)
      return {
        ...current,
        students: remaining.length ? remaining : [createStudent()],
      }
    })

    if (activeStudentId === studentId) {
      setActiveStudentId('')
    }
    if (expandedStudentId === studentId) {
      setExpandedStudentId('')
    }
  }

  function clearRegistrationForm() {
    setRegistration({
      contactEmail: '',
      contactPhone: '',
      students: [createStudent('student-1')],
    })
    setActiveStudentId('')
    setExpandedStudentId('')
    setExpandedWeekKey('')
    setExpandedLunchWeekKey('')
    setHelpWeekKey('')
    setStep(1)
    setMessage('Form cleared.')
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(REGISTRATION_DRAFT_KEY)
    }
  }

  function setStudentWeek(studentId, week, updater) {
    const weekDayKeys = week.days.map((item) => item.key)
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) => {
        if (student.id !== studentId) {
          return student
        }

        const currentEntry = student.schedule[week.id] || {
          weekId: week.id,
          programKey: week.programKey,
          campType: week.programKey === 'daycamp' ? '' : week.programKey,
          days: weekDayKeys.reduce((acc, day) => ({ ...acc, [day]: 'NONE' }), {}),
        }

        const updatedEntry = updater(currentEntry)
        const dayModes = weekDayKeys.map((day) => updatedEntry.days?.[day] || 'NONE')
        const hasAnyDay = dayModes.some((mode) => mode !== 'NONE')

        const nextSchedule = { ...student.schedule }
        const nextLunch = { ...student.lunch }

        if (hasAnyDay) {
          nextSchedule[week.id] = updatedEntry
        } else {
          delete nextSchedule[week.id]
          for (const day of weekDayKeys) {
            delete nextLunch[`${week.id}:${day}`]
          }
        }

        for (const day of weekDayKeys) {
          if ((updatedEntry.days?.[day] || 'NONE') === 'NONE') {
            delete nextLunch[`${week.id}:${day}`]
          }
        }

        return {
          ...student,
          schedule: nextSchedule,
          lunch: nextLunch,
        }
      }),
    }))
  }

  function setDayCampType(studentId, week, campType) {
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) => {
        if (student.id !== studentId) {
          return student
        }

        const existing = student.schedule[week.id] || {
          weekId: week.id,
          programKey: week.programKey,
          campType: '',
          days: dayKeys.reduce((acc, day) => ({ ...acc, [day]: 'NONE' }), {}),
        }

        return {
          ...student,
          schedule: {
            ...student.schedule,
            [week.id]: {
              ...existing,
              campType,
            },
          },
        }
      }),
    }))
  }

  function toggleFullWeek(studentId, week) {
    if (week.programKey === 'daycamp') {
      const student = registration.students.find((item) => item.id === studentId)
      const campType = student?.schedule?.[week.id]?.campType || ''
      if (!campType) {
        setMessage('Select General or Boot Camp for this week first.')
        return
      }
    }

    const weekDayKeys = week.days.map((item) => item.key)
    setStudentWeek(studentId, week, (entry) => {
      const alreadyFull = weekDayKeys.every((day) => (entry.days?.[day] || 'NONE') === 'FULL')
      return {
        ...entry,
        days: weekDayKeys.reduce((acc, day) => ({ ...acc, [day]: alreadyFull ? 'NONE' : 'FULL' }), {}),
      }
    })
  }

  function cycleDay(studentId, week, day) {
    if (week.programKey === 'daycamp') {
      const student = registration.students.find((item) => item.id === studentId)
      const campType = student?.schedule?.[week.id]?.campType || ''
      if (!campType) {
        setMessage('Select General or Boot Camp for this week first.')
        return
      }
    }

    setStudentWeek(studentId, week, (entry) => {
      const currentMode = entry.days?.[day] || 'NONE'
      return {
        ...entry,
        days: {
          ...entry.days,
          [day]: nextMode[currentMode],
        },
      }
    })
  }

  function toggleLunch(studentId, weekId, day) {
    const key = `${weekId}:${day}`
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) => {
        if (student.id !== studentId) {
          return student
        }

        const nextLunch = {
          ...student.lunch,
          [key]: !student.lunch[key],
        }
        const hasAnyLunch = Object.values(nextLunch).some(Boolean)

        return {
          ...student,
          lunch: nextLunch,
          lunchConfirmedNone: hasAnyLunch ? false : student.lunchConfirmedNone,
        }
      }),
    }))
  }

  function setLunchConfirmedNone(studentId, confirmed) {
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              lunchConfirmedNone: Boolean(confirmed),
            }
          : student
      ),
    }))
  }

  function getSelectedDayKeysForStudent(student) {
    const keys = new Set()
    for (const [weekId, entry] of Object.entries(student.schedule || {})) {
      for (const [dayKey, mode] of Object.entries(entry.days || {})) {
        if (mode && mode !== 'NONE') {
          keys.add(`${weekId}:${dayKey}`)
        }
      }
    }
    return keys
  }

  function clearActiveStudentSchedule() {
    if (!activeStudent) {
      return
    }
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === activeStudent.id
          ? {
              ...student,
              schedule: {},
              lunch: {},
              lunchConfirmedNone: false,
            }
          : student
      ),
    }))
    setExpandedWeekKey('')
    setExpandedLunchWeekKey('')
    setMessage('Cleared all selected weeks/times for active camper.')
  }

  function copyScheduleFromCamper(sourceId) {
    if (!activeStudent || !sourceId || sourceId === activeStudent.id) {
      return
    }
    const sourceStudent = registration.students.find((student) => student.id === sourceId)
    if (!sourceStudent) {
      return
    }

    const copiedSchedule = Object.fromEntries(
      Object.entries(sourceStudent.schedule || {}).map(([weekId, entry]) => [
        weekId,
        {
          ...entry,
          days: { ...(entry.days || {}) },
        },
      ])
    )

    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === activeStudent.id
          ? {
              ...student,
              schedule: copiedSchedule,
              lunch: {},
              lunchConfirmedNone: false,
            }
          : student
      ),
    }))
    setExpandedWeekKey('')
    setExpandedLunchWeekKey('')
    setMessage('Copied weeks/times from selected camper.')
  }

  function clearActiveStudentLunch() {
    if (!activeStudent) {
      return
    }
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === activeStudent.id
          ? {
              ...student,
              lunch: {},
              lunchConfirmedNone: false,
            }
          : student
      ),
    }))
    setExpandedLunchWeekKey('')
    setMessage('Cleared all lunch selections for active camper.')
  }

  function copyLunchFromCamper(sourceId) {
    if (!activeStudent || !sourceId || sourceId === activeStudent.id) {
      return
    }
    const sourceStudent = registration.students.find((student) => student.id === sourceId)
    if (!sourceStudent) {
      return
    }

    const allowedKeys = getSelectedDayKeysForStudent(activeStudent)
    const copiedLunch = Object.fromEntries(
      Object.entries(sourceStudent.lunch || {}).filter(([key, value]) => value && allowedKeys.has(key))
    )
    const hasAnyCopiedLunch = Object.values(copiedLunch).some(Boolean)

    setRegistration((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === activeStudent.id
          ? {
              ...student,
              lunch: copiedLunch,
              lunchConfirmedNone: hasAnyCopiedLunch ? false : Boolean(sourceStudent.lunchConfirmedNone),
            }
          : student
      ),
    }))
    setExpandedLunchWeekKey('')
    setMessage('Copied lunch selections from selected camper.')
  }

  function hasAnySelectedCampDay(student) {
    return Object.values(student.schedule || {}).some((entry) =>
      Object.values(entry.days || {}).some((mode) => mode !== 'NONE')
    )
  }

  function isStepOneComplete() {
    const emailValid = /\S+@\S+\.\S+/.test(registration.contactEmail)
    const phoneValid = registration.contactPhone.trim().length >= 7
    const studentsValid = registration.students.every((student) => isStudentComplete(student))
    return emailValid && phoneValid && studentsValid
  }

  function isStepTwoComplete() {
    return registration.students.every((student) => hasAnySelectedCampDay(student))
  }

  function hasValidLunchDecision(student) {
    const hasAnyLunch = Object.values(student.lunch || {}).some(Boolean)
    return hasAnyLunch || Boolean(student.lunchConfirmedNone)
  }

  function isStepThreeComplete() {
    return registration.students.every((student) => hasValidLunchDecision(student))
  }

  function isStepFourComplete() {
    return isStepOneComplete() && isStepTwoComplete() && isStepThreeComplete()
  }

  function isRegistrationStepComplete(stepId) {
    if (stepId === 1) {
      return isStepOneComplete()
    }
    if (stepId === 2) {
      return isStepTwoComplete()
    }
    if (stepId === 3) {
      return isStepThreeComplete()
    }
    return isStepFourComplete()
  }

  function isCamperMissingAnyStep(student) {
    const stepOneMissing = !isStudentComplete(student)
    const stepTwoMissing = !hasAnySelectedCampDay(student)
    const stepThreeMissing = !hasValidLunchDecision(student)
    return stepOneMissing || stepTwoMissing || stepThreeMissing
  }

  function validateStep(currentStep) {
    if (currentStep === 1) {
      return {
        ok: isStepOneComplete(),
        message: 'Please complete required fields for this step.',
      }
    }

    if (currentStep === 2) {
      const studentsMissingDays = registration.students.filter((student) => {
        return !hasAnySelectedCampDay(student)
      })

      if (studentsMissingDays.length > 0) {
        const names = studentsMissingDays
          .map((student) => {
            const studentNumber = registration.students.findIndex((item) => item.id === student.id) + 1
            return student.fullName.trim() || `Camper ${studentNumber}`
          })
          .join(', ')
        return {
          ok: false,
          message: `Add at least one selected camp day for: ${names}.`,
        }
      }
    }

    if (currentStep === 3) {
      const studentsMissingLunchDecision = registration.students.filter((student) => {
        const hasAnyLunch = Object.values(student.lunch || {}).some(Boolean)
        return !hasAnyLunch && !student.lunchConfirmedNone
      })

      if (studentsMissingLunchDecision.length > 0) {
        const names = studentsMissingLunchDecision
          .map((student) => {
            const studentNumber = registration.students.findIndex((item) => item.id === student.id) + 1
            return student.fullName.trim() || `Camper ${studentNumber}`
          })
          .join(', ')
        return {
          ok: false,
          message: `Choose lunch days or confirm no lunch for: ${names}.`,
        }
      }
    }

    return { ok: true, message: '' }
  }

  function scrollElementIntoFocusZone(element) {
    if (typeof window === 'undefined' || !element) {
      return
    }
    const rect = element.getBoundingClientRect()
    const absoluteTop = window.scrollY + rect.top
    const targetTop = Math.max(0, absoluteTop - window.innerHeight * 0.6)
    window.scrollTo({ top: targetTop, behavior: 'smooth' })
    window.setTimeout(() => {
      element.focus?.({ preventScroll: true })
    }, 120)
  }

  function jumpToStepMissingField(currentStep) {
    if (typeof document === 'undefined') {
      return
    }

    if (currentStep === 1) {
      if (!/\S+@\S+\.\S+/.test(registration.contactEmail || '')) {
        const emailInput = document.querySelector('#reg-contact-email')
        scrollElementIntoFocusZone(emailInput)
        return
      }
      if (registration.contactPhone.trim().length < 7) {
        const phoneInput = document.querySelector('#reg-contact-phone')
        scrollElementIntoFocusZone(phoneInput)
        return
      }

      const firstMissingStudent = registration.students.find((student) => !isStudentComplete(student))
      if (!firstMissingStudent) {
        return
      }

      setActiveStudentId(firstMissingStudent.id)
      setExpandedStudentId(firstMissingStudent.id)
      const focusTargets = [
        !firstMissingStudent.fullName.trim() ? `#reg-student-fullname-${firstMissingStudent.id}` : '',
        !parseDateLocal(firstMissingStudent.dob) ? `#reg-student-dob-${firstMissingStudent.id}` : '',
        !firstMissingStudent.allergies.trim() ? `#reg-student-allergies-${firstMissingStudent.id}` : '',
        !firstMissingStudent.medication.trim() ? `#reg-student-medication-${firstMissingStudent.id}` : '',
        !firstMissingStudent.previousInjury.trim() ? `#reg-student-injuries-${firstMissingStudent.id}` : '',
        !firstMissingStudent.healthNotes.trim() ? `#reg-student-health-${firstMissingStudent.id}` : '',
      ].filter(Boolean)
      const selector = focusTargets[0]
      if (selector) {
        window.setTimeout(() => {
          const target = document.querySelector(selector)
          scrollElementIntoFocusZone(target)
        }, 140)
      }
      return
    }

    if (currentStep === 2) {
      const firstMissingStudent = registration.students.find((student) => !hasAnySelectedCampDay(student))
      if (!firstMissingStudent) {
        return
      }
      setActiveStudentId(firstMissingStudent.id)
      const firstWeek = registrationWeeks[0]
      if (firstWeek) {
        const panelKey = `${firstMissingStudent.id}:${firstWeek.id}`
        setExpandedWeekKey(panelKey)
        window.setTimeout(() => {
          const target = document.querySelector(`[data-week-head="${panelKey}"]`)
          scrollElementIntoFocusZone(target)
        }, 140)
      }
      return
    }

    if (currentStep === 3) {
      const firstMissingStudent = registration.students.find((student) => {
        const hasAnyLunch = Object.values(student.lunch || {}).some(Boolean)
        return !hasAnyLunch && !student.lunchConfirmedNone
      })
      if (!firstMissingStudent) {
        return
      }
      setActiveStudentId(firstMissingStudent.id)
      window.setTimeout(() => {
        const target = document.querySelector(`[data-lunch-decision="${firstMissingStudent.id}"] input[type="checkbox"]`)
        scrollElementIntoFocusZone(target)
      }, 140)
    }
  }

  function nextStep() {
    const validation = validateStep(step)
    if (!validation.ok) {
      setMessage(validation.message)
      jumpToStepMissingField(step)
      return
    }

    setMessage('')
    setStepDirection('next')
    setStep((current) => Math.min(current + 1, registrationSteps.length))
  }

  function previousStep() {
    setMessage('')
    setStepDirection('prev')
    setStep((current) => Math.max(current - 1, 1))
  }

  function buildStudentPriceRows(summary, studentIndex, options = {}) {
    const applyLimitedDiscount = Boolean(options.applyLimitedDiscount)
    const regular = adminConfig.tuition.regular
    const discount = adminConfig.tuition.discount
    const premiumFactor = 1 + Number(adminConfig.tuition.bootcampPremiumPct || 0) / 100
    const siblingDiscountPct = studentIndex === 1 ? Number(adminConfig.tuition.siblingDiscountPct || 0) : 0

    const bootcampRegular = {
      fullWeek: roundUpToFive(regular.fullWeek * premiumFactor),
      fullDay: roundUpToFive(regular.fullDay * premiumFactor),
      amHalf: roundUpToFive(regular.amHalf * premiumFactor),
      pmHalf: roundUpToFive(regular.pmHalf * premiumFactor),
    }
    const bootcampDiscounted = {
      fullWeek: roundUpToFive(discount.fullWeek * premiumFactor),
      fullDay: roundUpToFive(discount.fullDay * premiumFactor),
      amHalf: roundUpToFive(discount.amHalf * premiumFactor),
      pmHalf: roundUpToFive(discount.pmHalf * premiumFactor),
    }

    const rows = [
      {
        id: 'general-fullWeek',
        key: 'fullWeek',
        label: 'General Camp Full Week',
        qty: summary.general.fullWeeks,
        rateType: 'general',
      },
      {
        id: 'general-fullDay',
        key: 'fullDay',
        label: 'General Camp Full Day',
        qty: summary.general.fullDays,
        rateType: 'general',
      },
      {
        id: 'general-amHalf',
        key: 'amHalf',
        label: 'General Camp AM Half Day',
        qty: summary.general.amDays,
        rateType: 'general',
      },
      {
        id: 'general-pmHalf',
        key: 'pmHalf',
        label: 'General Camp PM Half Day',
        qty: summary.general.pmDays,
        rateType: 'general',
      },
      {
        id: 'bootcamp-fullWeek',
        key: 'fullWeek',
        label: 'Competition Team Full Week',
        qty: summary.bootcamp.fullWeeks,
        rateType: 'bootcamp',
      },
      {
        id: 'bootcamp-fullDay',
        key: 'fullDay',
        label: 'Competition Team Full Day',
        qty: summary.bootcamp.fullDays,
        rateType: 'bootcamp',
      },
      {
        id: 'bootcamp-amHalf',
        key: 'amHalf',
        label: 'Competition Team AM Half Day',
        qty: summary.bootcamp.amDays,
        rateType: 'bootcamp',
      },
      {
        id: 'bootcamp-pmHalf',
        key: 'pmHalf',
        label: 'Competition Team PM Half Day',
        qty: summary.bootcamp.pmDays,
        rateType: 'bootcamp',
      },
    ].map((item) => {
      const regularPrice =
        item.rateType === 'bootcamp' ? bootcampRegular[item.key] || 0 : regular[item.key] || 0
      const configuredDiscountedPrice =
        item.rateType === 'bootcamp' ? bootcampDiscounted[item.key] || 0 : discount[item.key] || 0
      const normalizedDiscountedPrice =
        Number(configuredDiscountedPrice) > 0 ? Number(configuredDiscountedPrice) : regularPrice
      const effectivePrice = applyLimitedDiscount
        ? Math.max(0, Math.min(regularPrice, normalizedDiscountedPrice))
        : regularPrice
      const discountAmount = applyLimitedDiscount ? Math.max(0, regularPrice - effectivePrice) : 0
      return {
        ...item,
        regularPrice,
        discountAmount,
        effectivePrice,
        regularLineTotal: regularPrice * item.qty,
        discountLineTotal: discountAmount * item.qty,
        lineTotal: effectivePrice * item.qty,
      }
    }).filter((item) => item.qty > 0)

    const lunchPrice = adminConfig.tuition.lunchPrice || 14
    rows.push({
      key: 'lunch',
      id: 'lunch',
      label: 'Lunch',
      qty: summary.lunchCount,
      regularPrice: lunchPrice,
      discountAmount: 0,
      effectivePrice: lunchPrice,
      regularLineTotal: lunchPrice * summary.lunchCount,
      discountLineTotal: 0,
      lineTotal: lunchPrice * summary.lunchCount,
    })

    const subtotalRegular = rows.reduce((acc, row) => acc + row.regularLineTotal, 0)
    const limitedDiscountAmount = rows.reduce((acc, row) => acc + row.discountLineTotal, 0)
    const subtotalAfterLimitedDiscount = rows.reduce((acc, row) => acc + row.lineTotal, 0)

    const siblingAfterLimitedDiscount =
      siblingDiscountPct > 0 ? subtotalAfterLimitedDiscount * (siblingDiscountPct / 100) : 0
    const totalWithSiblingAfterLimited = Math.max(0, subtotalAfterLimitedDiscount - siblingAfterLimitedDiscount)

    const siblingBeforeLimitedDiscount =
      siblingDiscountPct > 0 ? subtotalRegular * (siblingDiscountPct / 100) : 0
    const baseAfterSiblingBeforeLimited = Math.max(0, subtotalRegular - siblingBeforeLimitedDiscount)
    const totalWithSiblingBeforeLimited = Math.max(0, baseAfterSiblingBeforeLimited - limitedDiscountAmount)

    const useSiblingBeforeLimited = totalWithSiblingBeforeLimited > totalWithSiblingAfterLimited
    const siblingDiscountAmount = useSiblingBeforeLimited
      ? siblingBeforeLimitedDiscount
      : siblingAfterLimitedDiscount
    const subtotal = subtotalAfterLimitedDiscount
    const total = useSiblingBeforeLimited ? totalWithSiblingBeforeLimited : totalWithSiblingAfterLimited

    return {
      rows,
      subtotalRegular,
      limitedDiscountAmount,
      subtotal,
      siblingDiscountPct,
      siblingDiscountAmount,
      siblingAppliedBeforeLimitedDiscount: useSiblingBeforeLimited,
      total,
    }
  }

  function getClaimableDiscountTotal() {
    return summaries.reduce((sum, item) => {
      const studentIndex = registration.students.findIndex((student) => student.id === item.student.id)
      return sum + buildStudentPriceRows(item.summary, studentIndex, { applyLimitedDiscount: true }).limitedDiscountAmount
    }, 0)
  }

  function buildRegistrationSummaryHtml(targetRegistration) {
    if (!targetRegistration || !Array.isArray(targetRegistration.students)) {
      return ''
    }

    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const allCampEntries = []

    const studentSections = targetRegistration.students
      .map((student, index) => {
        const camperName = student.fullName.trim() || `Camper ${index + 1}`
        const summary = getStudentSummary(student)
        const invoice = buildStudentPriceRows(summary, index, { applyLimitedDiscount: discountActive })
        const lunchWeeks = getLunchWeeksForStudent(student, weeksById)
        const registeredDays = lunchWeeks.reduce((sum, row) => sum + row.selectedDays.length, 0)
        const lunchDays = lunchWeeks.reduce(
          (sum, row) => sum + row.selectedDays.filter((day) => Boolean(student.lunch[day.key])).length,
          0
        )
        const packDays = Math.max(0, registeredDays - lunchDays)

        const rowsHtml = invoice.rows
          .map(
            (row) => `
            <tr>
              <td>${escapeHtml(row.label)}</td>
              <td>${row.qty}</td>
              <td>${currency(row.effectivePrice)}</td>
              <td>${row.discountLineTotal > 0 ? `-${currency(row.discountLineTotal)}` : '-'}</td>
              <td>${currency(row.lineTotal)}</td>
            </tr>
          `
          )
          .join('')

        const lunchCalendarHtml = lunchWeeks
          .map((row, weekIndex) => {
            const dayLines = row.selectedDays
              .map((day) => {
                const hasLunch = Boolean(student.lunch[day.key])
                allCampEntries.push({
                  date: day.date,
                  camperName,
                  hasLunch,
                  mode: day.mode,
                })
                return `
                <tr>
                  <td>${escapeHtml(day.dayKey)}</td>
                  <td>${escapeHtml(day.date)}</td>
                  <td>${escapeHtml(day.mode === 'FULL' ? 'Full Day' : `${day.mode} Half Day`)}</td>
                  <td>${hasLunch ? 'Lunch selected (no packing needed)' : 'Pack lunch needed'}</td>
                </tr>
              `
              })
              .join('')

            return `
            <section class="weekBlock">
              <h4>Week ${weekIndex + 1}: ${escapeHtml(formatWeekLabel(row.week))}</h4>
              <table>
                <thead><tr><th>Day</th><th>Date</th><th>Camp Schedule</th><th>Lunch Plan</th></tr></thead>
                <tbody>${dayLines}</tbody>
              </table>
            </section>
          `
          })
          .join('')

        return `
          <section class="studentSection">
            <h2>${escapeHtml(camperName)}</h2>
            <p>
              <span class="pill">Lunch selected: ${lunchDays}/${registeredDays} days</span>
              <span class="pill">Pack lunch needed: ${packDays} days</span>
            </p>
            <p class="note">On lunch-selected days, our team will contact you closer to each camp week to confirm lunch options.</p>

            <h3>Tuition Table</h3>
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Discount</th><th>Total</th></tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            <p><strong>Subtotal:</strong> ${currency(invoice.subtotalRegular)}</p>
            <p><strong>Total discount:</strong> -${currency(invoice.limitedDiscountAmount)}</p>
            <p><strong>${escapeHtml(camperName)} total:</strong> ${currency(invoice.total)}</p>

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
          for (let i = 0; i < 7; i += 1) {
            const key = isoDate(cursor)
            const cellEntries = byDate.get(key) || []
            const itemsHtml = cellEntries
              .map((item) => {
                const modeLabel = item.mode === 'FULL' ? 'Full Day' : `${item.mode} Half Day`
                return `<li><strong>${escapeHtml(item.camperName)}</strong>: ${item.hasLunch ? 'Lunch purchase' : 'Pack lunch'} (${escapeHtml(modeLabel)})</li>`
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

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Summer Camp Registration Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 18px; color: #0f172a; }
            h1 { margin: 0 0 6px; }
            h2 { margin: 18px 0 8px; }
            h3 { margin: 14px 0 8px; }
            .meta, .note { margin: 0 0 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-size: 12px; }
            .pill { display: inline-block; border: 1px solid #f59e0b; background: #fef3c7; border-radius: 999px; padding: 4px 9px; margin-right: 6px; margin-bottom: 4px; font-weight: 700; }
            .weekBlock { margin-top: 12px; }
            .studentSection { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
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
          <h1>Welcome to Summer Camp 2026 Summary</h1>
          <p class="meta"><strong>Email:</strong> ${escapeHtml(targetRegistration.contactEmail || 'not provided')} | <strong>Generated:</strong> ${escapeHtml(todayLabel)}</p>
          <p class="note">This summary includes basic info, tuition table, and lunch calendar details.</p>
          ${studentSections}
          <div class="pageBreak"></div>
          <h2>Family Camp & Lunch Calendar</h2>
          <p class="note">Each camp day shows whether each camper will purchase lunch or needs to pack lunch.</p>
          ${familyCalendarHtml}
        </body>
      </html>
    `
  }

  function openSummaryOverlay(targetRegistration = registration) {
    if (typeof window === 'undefined') {
      return
    }
    setSummaryOverlayHtml(buildRegistrationSummaryHtml(targetRegistration))
    setSummaryOverlayOpen(true)
  }

  function printSummaryOverlay() {
    const iframeWindow = summaryIframeRef.current?.contentWindow
    if (!iframeWindow) {
      return
    }
    iframeWindow.focus()
    iframeWindow.print()
  }

  function emailSummaryToSelf(targetRegistration = registration) {
    if (!targetRegistration?.students?.length) {
      return
    }

    const lines = targetRegistration.students.map((student, index) => {
      const camperName = student.fullName.trim() || `Camper ${index + 1}`
      const lunchWeeks = getLunchWeeksForStudent(student, weeksById)
      const registeredDays = lunchWeeks.reduce((sum, row) => sum + row.selectedDays.length, 0)
      const lunchDays = lunchWeeks.reduce(
        (sum, row) => sum + row.selectedDays.filter((day) => Boolean(student.lunch[day.key])).length,
        0
      )
      const packDays = Math.max(0, registeredDays - lunchDays)
      return `${camperName}: lunch ${lunchDays}/${registeredDays}, pack lunch ${packDays}`
    })

    const subject = encodeURIComponent('Summer Camp Registration Summary')
    const body = encodeURIComponent(
      `${lines.join('\n')}\n\n` +
      `On lunch-selected days, camp staff will contact you closer to date about lunch options.\n\n` +
      `To save a full PDF summary, open the registration summary overlay and click Print / Save PDF.`
    )
    const to = encodeURIComponent(targetRegistration.contactEmail || '')
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_self')
  }

  async function submitRegistration(event) {
    event.preventDefault()

    if (!supabaseEnabled || !supabase) {
      setMessage('Add your Supabase URL and anon key to submit registrations.')
      return
    }

    setSubmitting(true)
    setMessage('')

    const firstStudent = registration.students[0]
    const nameParts = splitName(firstStudent?.fullName || '')

    const payload = {
      camper_first_name: nameParts.firstName,
      camper_last_name: nameParts.lastName,
      age: Math.max(3, Math.min(17, calcAge(firstStudent?.dob))),
      experience_level: 'mixed',
      guardian_name: 'Parent/Guardian',
      guardian_email: registration.contactEmail.trim(),
      guardian_phone: registration.contactPhone.trim(),
      emergency_contact: registration.contactPhone.trim(),
      medical_notes: JSON.stringify({
        registration,
        submittedAt: new Date().toISOString(),
      }),
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('registrations').insert(payload)

    if (error) {
      setSubmitting(false)
      setMessage(`Submission failed: ${error.message}`)
      return
    }

    const submittedSnapshot = JSON.parse(JSON.stringify(registration))
    setSubmittedRegistrationSnapshot(submittedSnapshot)
    setSubmitting(false)
    setMessage('Registration submitted successfully. You can still open your summary below.')
    setRegistration({
      contactEmail: '',
      contactPhone: '',
      students: [createStudent()],
    })
    setActiveStudentId('')
    setExpandedStudentId('')
    setStep(1)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(REGISTRATION_DRAFT_KEY)
    }
  }

  const resolvedActiveStudentId = activeStudentId || registration.students[0]?.id || ''
  const activeStudent = registration.students.find((student) => student.id === resolvedActiveStudentId)
  const activeStudentIndex = Math.max(
    0,
    registration.students.findIndex((student) => student.id === resolvedActiveStudentId)
  )
  const expandedStudent = registration.students.find((student) => student.id === expandedStudentId)
  const activeStudentDisplayName = activeStudent?.fullName?.trim() || 'this camper'
  const activeCamperLabel = activeStudent?.fullName?.trim() || `Camper ${activeStudentIndex + 1}`
  const contactEmailMissing = !registration.contactEmail.trim()
  const contactPhoneMissing = !registration.contactPhone.trim()
  const step2HasMissing = registration.students.some((student) => {
    for (const entry of Object.values(student.schedule || {})) {
      const hasAnySelected = Object.values(entry.days || {}).some((mode) => mode && mode !== 'NONE')
      if (hasAnySelected) {
        return false
      }
    }
    return true
  })
  const step3HasMissing = registration.students.some((student) => {
    const hasAnyLunch = Object.values(student.lunch || {}).some(Boolean)
    return !hasAnyLunch && !student.lunchConfirmedNone
  })
  const copySourceOptions = registration.students
    .map((student, index) => ({
      id: student.id,
      label: student.fullName.trim() || `Camper ${index + 1}`,
    }))
    .filter((student) => student.id !== resolvedActiveStudentId)
  const stepShortTitle =
    step === 1
      ? 'Step 1: Family & camper details'
      : step === 2
        ? `Step 2: Select which weeks ${activeStudentDisplayName} will attend`
        : step === 3
          ? `Step 3: Select lunch options for ${activeStudentDisplayName}`
          : 'Step 4: Review totals and submit registration'
  const activeRegistrationStepImage = adminConfig.media.registrationStepImageUrls?.[step - 1] || ''
  const fullWeekDiscountAmount = useMemo(() => {
    const regularFullWeek = Number(adminConfig.tuition.regular.fullWeek || 0)
    const discountedFullWeek = Number(adminConfig.tuition.discount.fullWeek || 0)
    if (regularFullWeek <= 0 || discountedFullWeek <= 0) {
      return 0
    }
    return Math.max(0, regularFullWeek - discountedFullWeek)
  }, [adminConfig.tuition.discount.fullWeek, adminConfig.tuition.regular.fullWeek])
  const discountAmountLabel = useMemo(() => {
    return fullWeekDiscountAmount > 0 ? `${currency(fullWeekDiscountAmount)} OFF` : '$0 OFF'
  }, [fullWeekDiscountAmount])
  const activeSurveyImage =
    surveyStep === 1
      ? adminConfig.media.surveyStepImageUrls?.[0] || ''
      : surveyStep === 2
        ? adminConfig.media.surveyStepImageUrls?.[1] || ''
      : surveyStep === 3
          ? adminConfig.media.surveyStepImageUrls?.[2] || ''
        : surveyStep === 4
            ? adminConfig.media.surveyStepImageUrls?.[3] || ''
          : surveyStep === 5
              ? adminConfig.media.surveyStepImageUrls?.[3] || ''
            : surveyStep === 6
                ? adminConfig.media.surveyStepImageUrls?.[4] || ''
                : adminConfig.media.surveyStepImageUrls?.[5] || ''
  const activeSurveyVideo = adminConfig.media.surveyVideoUrl || ''
  const activeSurveyYouTubeEmbed = getYouTubeEmbedUrl(activeSurveyVideo)
  const claimableDiscountTotal = getClaimableDiscountTotal()
  const surveyEmailInvalid =
    surveyStep === 1 && surveyMessage.toLowerCase().includes('valid email')
  const surveyDiscountReminder =
    adminConfig.tuition.discountEndDate && discountActive
      ? text(
        `Early discount is available through ${adminConfig.tuition.discountEndDate}.`,
        `早鸟优惠有效期至 ${adminConfig.tuition.discountEndDate}。`
      )
      : ''
  const welcomeBlock = (
    <div className="startWelcome">
      {adminConfig.media.welcomeLogoUrl ? (
        <img className="startLogoImage" src={adminConfig.media.welcomeLogoUrl} alt="Summer camp logo" />
      ) : (
        <div className="startLogoPlaceholder" aria-label="Logo placeholder">
          Logo Placeholder
        </div>
      )}
      <div>
        <h2>{text('Welcome to Wushu Summer Camp', '欢迎来到武术夏令营')}</h2>
        <p className="startAwardLine">
          {text(
            'Winner of 2025, 2025, 2025, 2023 Best Martial Arts School',
            '荣获 2025、2025、2025、2023 年度最佳武术学校'
          )}
        </p>
        <p className="startWushuLine">
          {text('What is Wushu? Martial Arts. Power. Precision. Pride.', '什么是武术？武术。力量、精准、荣耀。')}
        </p>
        <p className="subhead">
          {text(
            'Train fierce, build confidence, and make unforgettable summer memories.',
            '强健体魄，建立自信，收获难忘夏日回忆。'
          )}
        </p>
      </div>
    </div>
  )
  const currentMode = isRegistrationRoute ? 'register' : entryMode
  const isMobileLearnOverlayOpen = currentMode === 'learn' && isMobileViewport
  const keepFloatingUiVisible = isRegistrationRoute
  const showMainCampPage =
    isRegistrationRoute || currentMode === 'register' || (currentMode === 'learn' && !isMobileViewport)

  return (
    <main
      className={`page ${isRegistrationRoute ? 'registrationRoute' : ''} ${currentMode === '' ? 'startOnly' : ''} ${
        currentMode === 'learn' && isMobileViewport ? 'learnOnly' : ''
      }`}
    >
      {currentMode === '' || isMobileLearnOverlayOpen ? (
      <section
        className={`card section startSection ${adminConfig.media.surveyMobileBgUrl ? 'startMobileBg' : ''}`}
        id="start-here"
        style={
          adminConfig.media.surveyMobileBgUrl
            ? { '--start-mobile-bg': `url("${adminConfig.media.surveyMobileBgUrl}")` }
            : undefined
        }
      >
        {welcomeBlock}
        <div className="startChoiceRow">
          <button
            type="button"
            className="startChoiceCard"
            onClick={jumpToRegistration}
          >
            <strong>{text('I am ready to register', '我准备报名')}</strong>
            <span>{text('Go directly to the registration flow and lock in your camp weeks.', '直接进入报名流程，锁定夏令营周次。')}</span>
          </button>
          <button
            type="button"
            className="startChoiceCard"
            onClick={chooseLearnPath}
          >
            <strong>{text('I want to learn more about your program', '我想了解更多课程信息')}</strong>
            <span>{text('This guided flow helps us determine the best-fit camp path for your family.', '这个引导流程将帮助我们为您的家庭匹配最适合的营地方案。')}</span>
          </button>
        </div>
        <p className="startChoiceNote">
          {text('Not sure yet? Click ', '还不确定？点击上方')}
          <strong>{text('Learn More', '了解更多')}</strong>
          {text(' above.', '。')}
        </p>
        <div className="startGoSummerInline">
          <button type="button" className="button secondary goSummerChip" onClick={jumpToCampTop}>
            {text('Go to Summer Camp Page', '进入夏令营页面')}
          </button>
        </div>
      </section>
      ) : null}

      {currentMode === 'learn' ? (
        isMobileViewport ? (
        <div
          className="learnOverlay"
          role="dialog"
          aria-modal="true"
          aria-label={text('Camp Fit Assistant', '营地匹配助手')}
          onClick={() => setEntryMode('')}
        >
        <section
          ref={surveyRef}
          className={`card section surveySection mobileLearnOverlayPanel ${surveyStep === 1 && adminConfig.media.surveyMobileBgUrl ? 'surveyStep1MobileBg' : ''}`}
          id="program-guide"
          onClick={(event) => event.stopPropagation()}
          style={
            surveyStep === 1 && adminConfig.media.surveyMobileBgUrl
              ? { '--survey-mobile-bg': `url("${adminConfig.media.surveyMobileBgUrl}")` }
              : undefined
          }
        >
          <div className="mobileOverlayTopActions">
            <button type="button" className="button secondary goSummerChip" onClick={jumpToCampTop}>
              {text('Go to Summer Camp Page', '进入夏令营页面')}
            </button>
          </div>
          <article className={`surveyCard ${surveyDirection === 'next' ? 'next' : 'prev'}`}>
            <div className="surveyStepPanel">
              {surveyStep > 1 ? <p className="surveyFeedback">{getSurveyFeedback(surveyStep - 1)}</p> : null}
              {surveyDiscountReminder && surveyStep >= 4 ? (
                <p className="surveyDiscountReminder">{surveyDiscountReminder}</p>
              ) : null}
              <div className="surveyVisual">
                {activeSurveyImage ? (
                  <img src={activeSurveyImage} alt={`Program finder step ${surveyStep} visual`} />
                ) : (
                  <div className="surveyVisualPlaceholder">Add images in /admin media to show step visuals.</div>
                )}
              </div>

              {surveyStep === 1 ? (
                <div className="surveyQuestion">
                  <h3>{text('1. How many campers and what are their ages?', '1. 有几位营员？他们分别多大？')}</h3>
                  {adminConfig.media.surveyStep1FlyerUrl ? (
                    <div className="surveyFunFlyer">
                      <img src={adminConfig.media.surveyStep1FlyerUrl} alt="Summer camp marketing flyer" />
                    </div>
                  ) : null}
                  <label>
                    {text('Contact email', '联系邮箱')}
                    <input
                      type="email"
                      value={surveyData.contactEmail}
                      onChange={(event) => updateSurveyField('contactEmail', event.target.value)}
                      placeholder={text('name@email.com', 'name@email.com')}
                    />
                  </label>
                  {surveyEmailInvalid ? <p className="surveyFieldError">{text('Please enter a valid email address.', '请输入有效邮箱地址。')}</p> : null}
                  <label>
                    {text('Number of campers', '营员人数')}
                    <input
                      type="text"
                      inputMode="numeric"
                      value={surveyData.camperCount}
                      onChange={(event) => setSurveyCamperCount(event.target.value)}
                    />
                  </label>
                  <div className="surveyAgeGrid">
                    {surveyData.camperAges.map((age, index) => (
                      <label key={`age-${index}`}>
                        {text(`Camper ${index + 1} age`, `营员 ${index + 1} 年龄`)}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={age}
                          onChange={(event) => setSurveyCamperAge(index, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {surveyStep === 2 ? (
                <div className="surveyQuestion">
                  <h3>{text('2. Is your child currently in any sports?', '2. 孩子目前是否正在参加任何运动？')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasSports === 'yes' ? 'active' : ''}`}
                      onClick={() => setSurveySportsParticipation('yes')}
                    >
                      {text('Yes', '有')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasSports === 'no' ? 'active' : ''}`}
                      onClick={() => setSurveySportsParticipation('no')}
                    >
                      {text('No', '没有')}
                    </button>
                  </div>
                </div>
              ) : null}

              {surveyStep === 3 ? (
                <div className="surveyQuestion">
                  <h3>{text('3. Sports experience details', '3. 运动经历详情')}</h3>
                  {surveyData.hasSports === 'yes' ? (
                    <label>
                      {text('What sports?', '参与过哪些运动？')}
                      <input
                        value={surveyData.sportsList}
                        onChange={(event) => updateSurveyField('sportsList', event.target.value)}
                        placeholder={text('Soccer, gymnastics, dance, swimming...', '足球、体操、舞蹈、游泳...')}
                      />
                    </label>
                  ) : (
                    <>
                      <h3>{text('What would you like your child to build first?', '希望孩子优先提升哪方面？')}</h3>
                      <p className="subhead">
                        {text('Select up to 3', '最多选择3项')} ({surveyData.noSportsPriority.length}/3)
                      </p>
                      <div className="surveyChoiceRow">
                        {[
                          'confidence',
                          'coordination',
                          'focus',
                          'fitness',
                          'flexibility',
                          'strength',
                          'discipline',
                          'social confidence',
                        ].map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`choiceChip ${surveyData.noSportsPriority.includes(item) ? 'active' : ''}`}
                            onClick={() => toggleNoSportsPriority(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <div className="surveySupportMedia">
                        <div className="surveySupportCard">
                          {adminConfig.media.surveyStepImageUrls?.[2] ? (
                            <img src={adminConfig.media.surveyStepImageUrls[2]} alt="Step 2 support visual" />
                          ) : (
                            <div className="surveyVisualPlaceholder">Add Step 2B image in admin media</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {surveyStep === 4 ? (
                <div className="surveyQuestion">
                  <h3>{text('4. Martial arts experience', '4. 是否有武术经历')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasMartial === 'yes' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('hasMartial', 'yes')}
                    >
                      {text('Yes', '有')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasMartial === 'no' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('hasMartial', 'no')}
                    >
                      {text('No', '没有')}
                    </button>
                  </div>
                </div>
              ) : null}

              {surveyStep === 5 ? (
                <div className="surveyQuestion">
                  <h3>{text('5. Martial arts background details', '5. 武术背景详情')}</h3>
                  {surveyData.hasMartial === 'yes' ? (
                    <div className="surveyAgeGrid">
                      <label>
                        {text('Years', '年')}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={surveyData.martialYears}
                          onChange={(event) =>
                            updateSurveyField('martialYears', event.target.value.replace(/\D/g, ''))
                          }
                        />
                      </label>
                      <label>
                        {text('Months', '月')}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={surveyData.martialMonths}
                          onChange={(event) =>
                            updateSurveyField('martialMonths', event.target.value.replace(/\D/g, ''))
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="surveyInlineResponse">
                      {text(
                        'No problem at all. Many of our strongest students started with zero martial arts experience.',
                        '完全没问题。很多优秀学员都是从零基础开始。'
                      )}
                    </p>
                  )}
                </div>
              ) : null}

              {surveyStep === 6 ? (
                <div className="surveyQuestion">
                  <h3>{text('6. What kind of activities does your child enjoy?', '6. 孩子更喜欢哪些活动类型？')}</h3>
                  <div className="surveyChoiceRow">
                    {surveyActivities.map((activity) => (
                      <button
                        key={activity.value}
                        type="button"
                        className={`choiceChip ${surveyData.activityInterests.includes(activity.value) ? 'active' : ''}`}
                        onClick={() => toggleSurveyActivity(activity.value)}
                      >
                        {text(activity.label, activity.zhLabel)}
                      </button>
                    ))}
                  </div>

                  <h3>{text('6b. Would lunch convenience help your family schedule?', '6b. 午餐服务是否有助于家庭安排？')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.lunchInterest === 'yes' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('lunchInterest', 'yes')}
                    >
                      {text('Yes', '是')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.lunchInterest === 'no' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('lunchInterest', 'no')}
                    >
                      {text('No', '否')}
                    </button>
                  </div>
                  <p className="subhead">
                    {text(
                      'This year, families can use the new Level Up app to book lunch by day and view daily progress photos/videos after camp starts.',
                      '今年起，家庭可使用全新 Level Up 应用按天订午餐，并在营期开启后查看每日训练照片/视频进度。'
                    )}
                  </p>

                  <h3>{text('6c. What are your goals?', '6c. 您的目标是什么？')}</h3>
                  <div className="surveyChoiceRow">
                    {surveyGoals.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        className={`choiceChip ${surveyData.goals.includes(goal.value) ? 'active' : ''}`}
                        onClick={() => toggleSurveyGoal(goal.value)}
                      >
                        {text(goal.label, goal.zhLabel)}
                      </button>
                    ))}
                  </div>
                  {getGoalsEncouragement() ? <p className="surveyInlineResponse">{getGoalsEncouragement()}</p> : null}
                </div>
              ) : null}

              {surveyStep === 7 ? (
                <div className="surveyQuestion">
                <h3>{text('7. Recommended camp plan', '7. 推荐营地方案')}</h3>
                {(() => {
                  const recommendation = buildSurveyRecommendation()
                  const [leadLine, ...detailLines] = recommendation
                  return (
                    <div className="recommendationCard recommendationCardFinal">
                      <div className="recommendationBadgeRow">
                        <span className="recommendationBadge">{text('Awarded Best in Burlington', '伯灵顿获奖学院')}</span>
                        <span className="recommendationBadge secondary">{text('Certified Top Coaches', '认证顶级教练团队')}</span>
                      </div>
                      <p className="recommendationLead">{leadLine}</p>
                      <div className="surveyResultList">
                        {detailLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <h3>{text('Are you ready to register?', '准备好报名了吗？')}</h3>
                <div className="surveyChoiceRow">
                  <button type="button" className="button" onClick={handleReadyToRegister}>
                    {text('Yes, take me to registration', '是的，带我去报名')}
                  </button>
                  <button type="button" className="button secondary" onClick={handleThinkAboutIt}>
                    {text('I need time to think', '我需要再考虑一下')}
                  </button>
                </div>
                </div>
              ) : null}

              {getSurveyDidYouKnowFact() ? <p className="surveyDidYouKnow">{getSurveyDidYouKnowFact()}</p> : null}
            </div>

            <div className="surveyActions">
              <button
                type="button"
                className="button secondary"
                onClick={previousSurveyStep}
                disabled={surveyStep === 1}
              >
                {text('Back', '返回')}
              </button>
              {surveyStep < SURVEY_TOTAL_STEPS ? (
                <button type="button" className="button" onClick={nextSurveyStep} disabled={savingSurveyProfile}>
                  {savingSurveyProfile ? text('Saving...', '保存中...') : text('Next', '下一步')}
                </button>
              ) : null}
            </div>
            {surveyMessage ? <p className="message">{surveyMessage}</p> : null}
            {activeSurveyVideo ? (
              <div className="surveyVideoDock">
                {activeSurveyYouTubeEmbed ? (
                  <iframe
                    src={activeSurveyYouTubeEmbed}
                    title="Program guide video"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    src={activeSurveyVideo}
                  />
                )}
              </div>
            ) : null}
          </article>
        </section>
        </div>
      ) : (
        <section
          ref={surveyRef}
          className={`card section surveySection desktopAssistantWindow ${surveyStep === 1 && adminConfig.media.surveyMobileBgUrl ? 'surveyStep1MobileBg' : ''}`}
          id="program-guide"
          style={
            surveyStep === 1 && adminConfig.media.surveyMobileBgUrl
              ? { '--survey-mobile-bg': `url("${adminConfig.media.surveyMobileBgUrl}")` }
              : undefined
          }
        >
          <div className="mobileOverlayTopActions desktopSurveyTopActions">
            <button type="button" className="button secondary goSummerChip" onClick={jumpToCampTop}>
              {text('Go to Summer Camp Page', '进入夏令营页面')}
            </button>
          </div>
          <article className={`surveyCard ${surveyDirection === 'next' ? 'next' : 'prev'}`}>
            <div className="surveyStepPanel">
              {surveyStep > 1 ? <p className="surveyFeedback">{getSurveyFeedback(surveyStep - 1)}</p> : null}
              {surveyDiscountReminder && surveyStep >= 4 ? (
                <p className="surveyDiscountReminder">{surveyDiscountReminder}</p>
              ) : null}
              <div className="surveyVisual">
                {activeSurveyImage ? (
                  <img src={activeSurveyImage} alt={`Program finder step ${surveyStep} visual`} />
                ) : (
                  <div className="surveyVisualPlaceholder">Add images in /admin media to show step visuals.</div>
                )}
              </div>

              {surveyStep === 1 ? (
                <div className="surveyQuestion">
                  <h3>{text('1. How many campers and what are their ages?', '1. 有几位营员？他们分别多大？')}</h3>
                  {adminConfig.media.surveyStep1FlyerUrl ? (
                    <div className="surveyFunFlyer">
                      <img src={adminConfig.media.surveyStep1FlyerUrl} alt="Summer camp marketing flyer" />
                    </div>
                  ) : null}
                  <label>
                    {text('Contact email', '联系邮箱')}
                    <input
                      type="email"
                      value={surveyData.contactEmail}
                      onChange={(event) => updateSurveyField('contactEmail', event.target.value)}
                      placeholder={text('name@email.com', 'name@email.com')}
                    />
                  </label>
                  {surveyEmailInvalid ? <p className="surveyFieldError">{text('Please enter a valid email address.', '请输入有效邮箱地址。')}</p> : null}
                  <label>
                    {text('Number of campers', '营员人数')}
                    <input
                      type="text"
                      inputMode="numeric"
                      value={surveyData.camperCount}
                      onChange={(event) => setSurveyCamperCount(event.target.value)}
                    />
                  </label>
                  <div className="surveyAgeGrid">
                    {surveyData.camperAges.map((age, index) => (
                      <label key={`age-${index}`}>
                        {text(`Camper ${index + 1} age`, `营员 ${index + 1} 年龄`)}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={age}
                          onChange={(event) => setSurveyCamperAge(index, event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {surveyStep === 2 ? (
                <div className="surveyQuestion">
                  <h3>{text('2. Is your child currently in any sports?', '2. 孩子目前是否正在参加任何运动？')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasSports === 'yes' ? 'active' : ''}`}
                      onClick={() => setSurveySportsParticipation('yes')}
                    >
                      {text('Yes', '有')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasSports === 'no' ? 'active' : ''}`}
                      onClick={() => setSurveySportsParticipation('no')}
                    >
                      {text('No', '没有')}
                    </button>
                  </div>
                </div>
              ) : null}

              {surveyStep === 3 ? (
                <div className="surveyQuestion">
                  <h3>{text('3. Sports experience details', '3. 运动经历详情')}</h3>
                  {surveyData.hasSports === 'yes' ? (
                    <label>
                      {text('What sports?', '参与过哪些运动？')}
                      <input
                        value={surveyData.sportsList}
                        onChange={(event) => updateSurveyField('sportsList', event.target.value)}
                        placeholder={text('Soccer, gymnastics, dance, swimming...', '足球、体操、舞蹈、游泳...')}
                      />
                    </label>
                  ) : (
                    <>
                      <h3>{text('What would you like your child to build first?', '希望孩子优先提升哪方面？')}</h3>
                      <p className="subhead">
                        {text('Select up to 3', '最多选择3项')} ({surveyData.noSportsPriority.length}/3)
                      </p>
                      <div className="surveyChoiceRow">
                        {[
                          'confidence',
                          'coordination',
                          'focus',
                          'fitness',
                          'flexibility',
                          'strength',
                          'discipline',
                          'social confidence',
                        ].map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`choiceChip ${surveyData.noSportsPriority.includes(item) ? 'active' : ''}`}
                            onClick={() => toggleNoSportsPriority(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <div className="surveySupportMedia">
                        <div className="surveySupportCard">
                          {adminConfig.media.surveyStepImageUrls?.[2] ? (
                            <img src={adminConfig.media.surveyStepImageUrls[2]} alt="Step 2 support visual" />
                          ) : (
                            <div className="surveyVisualPlaceholder">Add Step 2B image in admin media</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              {surveyStep === 4 ? (
                <div className="surveyQuestion">
                  <h3>{text('4. Martial arts experience', '4. 是否有武术经历')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasMartial === 'yes' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('hasMartial', 'yes')}
                    >
                      {text('Yes', '有')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.hasMartial === 'no' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('hasMartial', 'no')}
                    >
                      {text('No', '没有')}
                    </button>
                  </div>
                </div>
              ) : null}

              {surveyStep === 5 ? (
                <div className="surveyQuestion">
                  <h3>{text('5. Martial arts background details', '5. 武术背景详情')}</h3>
                  {surveyData.hasMartial === 'yes' ? (
                    <div className="surveyAgeGrid">
                      <label>
                        {text('Years', '年')}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={surveyData.martialYears}
                          onChange={(event) =>
                            updateSurveyField('martialYears', event.target.value.replace(/\D/g, ''))
                          }
                        />
                      </label>
                      <label>
                        {text('Months', '月')}
                        <input
                          type="text"
                          inputMode="numeric"
                          value={surveyData.martialMonths}
                          onChange={(event) =>
                            updateSurveyField('martialMonths', event.target.value.replace(/\D/g, ''))
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="surveyInlineResponse">
                      {text(
                        'No problem at all. Many of our strongest students started with zero martial arts experience.',
                        '完全没问题。很多优秀学员都是从零基础开始。'
                      )}
                    </p>
                  )}
                </div>
              ) : null}

              {surveyStep === 6 ? (
                <div className="surveyQuestion">
                  <h3>{text('6. What kind of activities does your child enjoy?', '6. 孩子更喜欢哪些活动类型？')}</h3>
                  <div className="surveyChoiceRow">
                    {surveyActivities.map((activity) => (
                      <button
                        key={activity.value}
                        type="button"
                        className={`choiceChip ${surveyData.activityInterests.includes(activity.value) ? 'active' : ''}`}
                        onClick={() => toggleSurveyActivity(activity.value)}
                      >
                        {text(activity.label, activity.zhLabel)}
                      </button>
                    ))}
                  </div>

                  <h3>{text('6b. Would lunch convenience help your family schedule?', '6b. 午餐服务是否有助于家庭安排？')}</h3>
                  <div className="surveyChoiceRow">
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.lunchInterest === 'yes' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('lunchInterest', 'yes')}
                    >
                      {text('Yes', '是')}
                    </button>
                    <button
                      type="button"
                      className={`choiceChip ${surveyData.lunchInterest === 'no' ? 'active' : ''}`}
                      onClick={() => updateSurveyField('lunchInterest', 'no')}
                    >
                      {text('No', '否')}
                    </button>
                  </div>
                  <p className="subhead">
                    {text(
                      'This year, families can use the new Level Up app to book lunch by day and view daily progress photos/videos after camp starts.',
                      '今年起，家庭可使用全新 Level Up 应用按天订午餐，并在营期开启后查看每日训练照片/视频进度。'
                    )}
                  </p>

                  <h3>{text('6c. What are your goals?', '6c. 您的目标是什么？')}</h3>
                  <div className="surveyChoiceRow">
                    {surveyGoals.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        className={`choiceChip ${surveyData.goals.includes(goal.value) ? 'active' : ''}`}
                        onClick={() => toggleSurveyGoal(goal.value)}
                      >
                        {text(goal.label, goal.zhLabel)}
                      </button>
                    ))}
                  </div>
                  {getGoalsEncouragement() ? <p className="surveyInlineResponse">{getGoalsEncouragement()}</p> : null}
                </div>
              ) : null}

              {surveyStep === 7 ? (
                <div className="surveyQuestion">
                <h3>{text('7. Recommended camp plan', '7. 推荐营地方案')}</h3>
                {(() => {
                  const recommendation = buildSurveyRecommendation()
                  const [leadLine, ...detailLines] = recommendation
                  return (
                    <div className="recommendationCard recommendationCardFinal">
                      <div className="recommendationBadgeRow">
                        <span className="recommendationBadge">{text('Awarded Best in Burlington', '伯灵顿获奖学院')}</span>
                        <span className="recommendationBadge secondary">{text('Certified Top Coaches', '认证顶级教练团队')}</span>
                      </div>
                      <p className="recommendationLead">{leadLine}</p>
                      <div className="surveyResultList">
                        {detailLines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <h3>{text('Are you ready to register?', '准备好报名了吗？')}</h3>
                <div className="surveyChoiceRow">
                  <button type="button" className="button" onClick={handleReadyToRegister}>
                    {text('Yes, take me to registration', '是的，带我去报名')}
                  </button>
                  <button type="button" className="button secondary" onClick={handleThinkAboutIt}>
                    {text('I need time to think', '我需要再考虑一下')}
                  </button>
                </div>
                </div>
              ) : null}

              {getSurveyDidYouKnowFact() ? <p className="surveyDidYouKnow">{getSurveyDidYouKnowFact()}</p> : null}
            </div>

            <div className="surveyActions">
              <button
                type="button"
                className="button secondary"
                onClick={previousSurveyStep}
                disabled={surveyStep === 1}
              >
                {text('Back', '返回')}
              </button>
              {surveyStep < SURVEY_TOTAL_STEPS ? (
                <button type="button" className="button" onClick={nextSurveyStep} disabled={savingSurveyProfile}>
                  {savingSurveyProfile ? text('Saving...', '保存中...') : text('Next', '下一步')}
                </button>
              ) : null}
            </div>
            {surveyMessage ? <p className="message">{surveyMessage}</p> : null}
            {activeSurveyVideo ? (
              <div className="surveyVideoDock">
                {activeSurveyYouTubeEmbed ? (
                  <iframe
                    src={activeSurveyYouTubeEmbed}
                    title="Program guide video"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    controls
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    src={activeSurveyVideo}
                  />
                )}
              </div>
            ) : null}
          </article>
        </section>
      )
      ) : null}

      {showMainCampPage ? (
        <>
      <section className="hero card" id="camp-info">
        <p className="eyebrow">New England Wushu Summer Camp 2026</p>
        <h1>{text('Train hard, build confidence, and have a summer kids remember.', '刻苦训练，建立自信，成就难忘夏天。')}</h1>
        <p className="subhead">{text('Ages 3-17. Small groups, skill-based coaching, and weekly family showcases.', '3-17岁。小班教学、分级训练、每周家庭展示。')}</p>
        <div className="heroTrustRow" aria-label="Program highlights">
          <span>{text('Burlington award-winning academy', '伯灵顿获奖学院')}</span>
          <span>{text('500+ competition medals earned', '累计500+竞赛奖牌')}</span>
          <span>{text('Certified, experienced coaching team', '认证且经验丰富的教练团队')}</span>
        </div>
        <div className="heroMarketingCard">
          <strong>{text('Why families choose us', '为什么家庭选择我们')}</strong>
          <p>
            {text(
              'Structured training, real progress tracking, and a supportive team culture that keeps campers motivated all summer. New this year: the Level Up app lets families book lunch by day and follow progress with photos and videos.',
              '结构化训练、可视化成长追踪和支持型团队文化，让孩子整个夏天都保持动力。今年新增：Level Up 应用支持按天订午餐，并通过照片和视频跟踪成长。'
            )}
          </p>
        </div>
        <div className="heroScienceRow">
          <article className="heroScienceCard">
            <h3>{text('Skill-Progressive Coaching', '循序渐进训练')}</h3>
            <p>
              {text(
                'Camp plans follow progressive motor-learning stages so kids build technique with confidence, not random drills.',
                '课程按运动学习阶段递进设计，让孩子通过系统训练稳定提升。'
              )}
            </p>
          </article>
          <article className="heroScienceCard">
            <h3>{text('Weekly Feedback Loop', '每周反馈闭环')}</h3>
            <p>
              {text(
                'Coaches use weekly checkpoints and showcase prep to reinforce retention, focus, and measurable growth.',
                '教练通过每周检查点与展示准备，强化技能记忆、专注力与可见进步。'
              )}
            </p>
          </article>
          <article className="heroScienceCard">
            <h3>{text('Confidence Through Team Learning', '团队学习提升自信')}</h3>
            <p>
              {text(
                'Partner drills and guided team challenges improve social confidence while accelerating athletic development.',
                '搭档训练与团队挑战在提升社交自信的同时，加快运动能力发展。'
              )}
            </p>
          </article>
        </div>

        <div className="heroActions">
          <button type="button" className="button" onClick={jumpToRegistration}>
            {text('Start Registration', '开始报名')}
          </button>
        </div>

        {activeCampGalleryItem ? (
          <div
            className="heroGalleryWrap"
            onTouchStart={onCampGalleryTouchStart}
            onTouchEnd={onCampGalleryTouchEnd}
          >
            <div className="heroGalleryRail">
              <button
                type="button"
                className="heroGalleryArrow left"
                onClick={previousCampGallerySlide}
                aria-label={text('Previous camp photo', '上一张营地照片')}
              >
                ←
              </button>
              <div className="heroGallerySide left" aria-hidden="true">
                {previousCampGalleryItem?.src ? (
                  <img src={previousCampGalleryItem.src} alt="" />
                ) : (
                  <div className="heroGalleryPlaceholderSide">{previousCampGalleryItem?.slot || text('Camp Photo', '营地照片')}</div>
                )}
              </div>
              <figure
                key={`gallery-${normalizedCampGalleryIndex}`}
                className={`heroGalleryMain ${campGalleryDirection === 'next' ? 'next' : 'prev'}`}
              >
                {activeCampGalleryItem.src ? (
                  <img className="heroMedia" src={activeCampGalleryItem.src} alt={text('Summer camp gallery', '夏令营图集')} />
                ) : (
                  <div className="heroMediaPlaceholder">
                    <strong>{activeCampGalleryItem.slot}</strong>
                    <span>{text('Upload this photo slot in /admin media.', '请在 /admin 媒体中上传此照片位。')}</span>
                  </div>
                )}
              </figure>
              <div className="heroGallerySide right" aria-hidden="true">
                {nextCampGalleryItem?.src ? (
                  <img src={nextCampGalleryItem.src} alt="" />
                ) : (
                  <div className="heroGalleryPlaceholderSide">{nextCampGalleryItem?.slot || text('Camp Photo', '营地照片')}</div>
                )}
              </div>
              <button
                type="button"
                className="heroGalleryArrow right"
                onClick={nextCampGallerySlide}
                aria-label={text('Next camp photo', '下一张营地照片')}
              >
                →
              </button>
            </div>
            <p className="heroGalleryCaption">
              {text(activeCampGalleryCaption.en, activeCampGalleryCaption.zh)}
            </p>
            <div className="heroGalleryDots" aria-label={text('Camp photo position', '营地图集位置')}>
              {campGalleryItems.map((_, index) => (
                <button
                  key={`gallery-dot-${index}`}
                  type="button"
                  className={`dot ${index === normalizedCampGalleryIndex ? 'active' : ''}`}
                  onClick={() => goToCampGallerySlide(index, index > normalizedCampGalleryIndex ? 'next' : 'prev')}
                  aria-label={text(`Go to photo ${index + 1}`, `跳转到第 ${index + 1} 张`)}
                />
              ))}
            </div>
          </div>
        ) : null}

      </section>

      <section className="card section campFeatureShowcase" id="why-camp">
        <div className="featureShowcaseHead">
          <p className="eyebrow">{text('Camp Highlights', '营地亮点')}</p>
          <h2>{text('Designed for growth, confidence, and fun', '为成长、自信与快乐而设计')}</h2>
        </div>
        <div className="premiumFeatureGrid">
          {perks.map((perk) => (
            <article key={perk.title} className="premiumFeatureCard">
              <span className="premiumFeatureIcon" aria-hidden="true">◆</span>
              <h3>{perk.title}</h3>
              <p>{perk.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="camp-marketing-flow" className="card section appCarouselSection">
        <h2>{text('What makes this camp the right fit?', '为什么这个营地是合适的选择？')}</h2>
        <p className="subhead">
          {text(
            'Follow this quick step-by-step guide to see fit, structure, options, and recommended next action.',
            '按步骤快速查看：匹配度、训练结构、课程选项与下一步建议。'
          )}
        </p>
        <p className="subhead">
          {text(
            'Families also get access to our new Level Up app for lunch booking and daily training progress updates with photos/videos.',
            '家庭还可使用全新 Level Up 应用，进行午餐预订并查看每日训练照片/视频进度更新。'
          )}
        </p>
        <div className="marketingStepTabs" aria-label={text('Marketing flow steps', '营销流程步骤')}>
          {[0, 1, 2, 3].map((index) => (
            <button
              key={`marketing-step-${index}`}
              type="button"
              className={`marketingStepTab ${marketingFlowIndex === index ? 'active' : ''}`}
              onClick={() => setMarketingFlowIndex(index)}
            >
              {text(`Step ${index + 1}`, `第 ${index + 1} 步`)}
            </button>
          ))}
        </div>
        <div className="marketingFlowStack">
          {marketingFlowIndex === 0 ? (
            <article className="overviewSlide next">
              <h3>{text('Step 1: Need a program that builds real confidence?', '第1步：需要真正提升自信的课程吗？')}</h3>
              <p>
                {text(
                  'Ages 3-17 train in level-based groups with clear weekly progress goals and family showcases.',
                  '3-17岁分层训练，每周有清晰成长目标，并通过家庭展示强化成果。'
                )}
              </p>
              <div className="overviewStatRow">
                <span className="overviewStatPill">{generalWeeks.length || 0} {text('General weeks', '普通营周次')}</span>
                <span className="overviewStatPill">{bootcampWeeks.length || 0} {text('Boot Camp weeks', '集训营周次')}</span>
                <span className="overviewStatPill">{overnightWeeks.length || 0} {text('Overnight blocks', '过夜营档期')}</span>
              </div>
            </article>
          ) : null}

          {marketingFlowIndex === 1 ? (
            <article className="overviewSlide next">
              <h3>{text('Step 2: Want structure, not random activities?', '第2步：希望有体系，而不是零散活动？')}</h3>
              <div className="overviewPointList">
                {perks.map((item) => (
                  <p key={item.title} className="overviewPointItem">
                    <span className="overviewPointDot" aria-hidden="true" />
                    {item.text}
                  </p>
                ))}
              </div>
            </article>
          ) : null}

          {marketingFlowIndex === 2 ? (
            <article className="overviewSlide next">
              <h3>{text('Step 3: Need options for different goals?', '第3步：需要匹配不同目标的路径吗？')}</h3>
              <div className="overviewPointList">
                {campTypes.map((camp) => (
                  <p key={camp.name} className="overviewPointItem">
                    <span className="overviewPointDot" aria-hidden="true" />
                    <strong>{camp.name}:</strong> {camp.audience}
                  </p>
                ))}
              </div>
            </article>
          ) : null}

          {marketingFlowIndex === 3 ? (
            <article className="overviewSlide marketingInteractiveCard next">
              <h3>{text('Step 4: What matters most for your camper this summer?', '第4步：这个夏天您最看重孩子哪方面成长？')}</h3>
              <div className="surveyChoiceRow">
                <button
                  type="button"
                  className={`choiceChip ${marketingNeed === 'confidence' ? 'active' : ''}`}
                  onClick={() => setMarketingNeed('confidence')}
                >
                  {text('Confidence', '自信')}
                </button>
                <button
                  type="button"
                  className={`choiceChip ${marketingNeed === 'athletic' ? 'active' : ''}`}
                  onClick={() => setMarketingNeed('athletic')}
                >
                  {text('Athletic growth', '运动能力')}
                </button>
                <button
                  type="button"
                  className={`choiceChip ${marketingNeed === 'social' ? 'active' : ''}`}
                  onClick={() => setMarketingNeed('social')}
                >
                  {text('Social skills', '社交能力')}
                </button>
                <button
                  type="button"
                  className={`choiceChip ${marketingNeed === 'tumbling' ? 'active' : ''}`}
                  onClick={() => setMarketingNeed('tumbling')}
                >
                  {text('Tumbling skills', '翻腾技巧')}
                </button>
              </div>
              <p key={`marketing-need-${marketingNeed}`} className="surveyInlineResponse">
                {getMarketingNeedResponse()}
              </p>
              <div className="adminActions">
                <button type="button" className="button" onClick={jumpToRegistration}>
                  {text('Start Registration', '开始报名')}
                </button>
              </div>
            </article>
          ) : null}
        </div>
        <div className="marketingStepActions">
          <button
            type="button"
            className="button secondary"
            onClick={previousMarketingFlowStep}
            disabled={marketingFlowIndex === 0}
          >
            {text('Previous Step', '上一步')}
          </button>
          <button
            type="button"
            className="button"
            onClick={nextMarketingFlowStep}
            disabled={marketingFlowIndex === 3}
          >
            {text('Next Step', '下一步')}
          </button>
        </div>
      </section>

      <section className="card section testimonialsHero" id="student-stories">
        <p className="eyebrow">{text('Student Stories', '学员故事')}</p>
        <h2>{text('What kind of growth do families actually see?', '家庭通常能看到哪些真实成长？')}</h2>
        <p className="subhead">
          {text(
            'Real stories from campers and parents, directly from our current program community.',
            '以下内容来自现有营地家庭的真实反馈。'
          )}
        </p>
        {activeTestimonial ? (
          <>
            <div className="testimonialCarousel">
              <button
                type="button"
                className="testimonialArrow"
                onClick={previousTestimonial}
                aria-label={text('Previous story', '上一条故事')}
              >
                ←
              </button>
              <article key={`story-${normalizedTestimonialIndex}-${language}`} className="testimonialCard testimonialCardActive">
                <p className="journeyDay">
                  {localizeTestimonialValue(
                    activeTestimonial.studentName,
                    text(`Student Story ${normalizedTestimonialIndex + 1}`, `学员故事 ${normalizedTestimonialIndex + 1}`)
                  )}
                </p>
                {language === 'zh' ? <p className="translatedTag">{text('Translated', '已翻译')}</p> : null}
                {activeTestimonialHighlights.length > 0 ? (
                  <div className="testimonialHighlights" aria-label={text('Story highlights', '故事亮点')}>
                    {activeTestimonialHighlights.map((item) => (
                      <span key={`testimonial-highlight-${item}`} className="testimonialHighlightTag">
                        {localizeTestimonialValue(item, item)}
                      </span>
                    ))}
                  </div>
                ) : null}
                <h3>{localizeTestimonialValue(activeTestimonial.headline, text('Progress story', '成长故事'))}</h3>
                <p>{localizeTestimonialValue(activeTestimonial.story, text('Story coming soon.', '故事即将更新。'))}</p>
                {activeTestimonial.outcome ? (
                  <p className="testimonialOutcome">
                    {localizeTestimonialValue(activeTestimonial.outcome, activeTestimonial.outcome)}
                  </p>
                ) : null}
              </article>
              <button
                type="button"
                className="testimonialArrow"
                onClick={nextTestimonial}
                aria-label={text('Next story', '下一条故事')}
              >
                →
              </button>
            </div>
            <div className="testimonialDots" aria-label={text('Story carousel position', '故事轮播位置')}>
              {featuredTestimonials.map((_, index) => (
                <button
                  key={`testimonial-dot-${index}`}
                  type="button"
                  className={`dot ${index === normalizedTestimonialIndex ? 'active' : ''}`}
                  onClick={() => setTestimonialIndex(index)}
                  aria-label={text(`Go to story ${index + 1}`, `跳转到故事 ${index + 1}`)}
                />
              ))}
            </div>
          </>
        ) : null}
      </section>

      <section id="camp-dates" className="card section">
        <h2>{text('When can my child join camp?', '孩子什么时候可以参加营地？')}</h2>
        <p className="subhead">
          {text(
            'Summer sessions run weekly. For General Camp and Boot Camp, families can choose Full Week, Full Day, AM Half Day, or PM Half Day based on schedule.',
            '夏令营按周开放。普通营和集训营可按家庭安排选择整周、整天、上午半天或下午半天。'
          )}
        </p>
        <div className="weekSummaryGrid">
          <article className="weekSummaryCard">
            <h3>General Camp ({generalWeeks.length} weeks)</h3>
            <p className="subhead">
              {generalWeeks.length
                ? text(
                  'Open now. Time options: Full Week, Full Day, AM Half Day, PM Half Day.',
                  '现已开放。可选时间：整周、整天、上午半天、下午半天。'
                )
                : text('No weeks selected yet in admin.', '后台尚未配置周次。')}
            </p>
          </article>
          <article className="weekSummaryCard">
            <h3>Boot Camp ({bootcampWeeks.length} weeks)</h3>
            <p className="subhead">
              {bootcampWeeks.length
                ? text(
                  'Open now. Time options: Full Week, Full Day, AM Half Day, PM Half Day.',
                  '现已开放。可选时间：整周、整天、上午半天、下午半天。'
                )
                : text('No weeks selected yet in admin.', '后台尚未配置周次。')}
            </p>
          </article>
          <article className="weekSummaryCard">
            <h3>Overnight Camp ({overnightWeeks.length} blocks)</h3>
            <p className="subhead">
              {overnightWeeks.length
                ? text(
                  'Overnight blocks are open with limited spots and separate scheduling.',
                  '过夜营分档期开放，名额有限，采用独立排期。'
                )
                : text('No weekends selected yet in admin.', '后台尚未配置过夜档期。')}
            </p>
          </article>
        </div>
      </section>

      <section id="weekly-structure" className="card section">
        <h2>{text('What does a typical week look like?', '典型一周是怎样安排的？')}</h2>
        <p className="subhead">
          {text(
            'Here is a clear Monday-Friday flow so families know exactly what training rhythm to expect each day.',
            '以下是清晰的周一到周五训练节奏，方便家庭提前了解每天安排。'
          )}
        </p>
        <div className="scheduleList">
          {schedule.map((item) => (
            <article key={item.day} className="scheduleItem">
              <strong><span className="scheduleDayTag">{item.day}</span></strong>
              <p>{item.activity}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card section levelUpSection" id="level-up">
        <div
          className="phoneMock"
          aria-hidden="true"
          onTouchStart={onLevelUpTouchStart}
          onTouchEnd={onLevelUpTouchEnd}
        >
          <div className="phoneFrame">
            <div className="phoneNotch" />
            <div className="phoneScreen">
              {phoneScreenshots.length > 0 ? (
                <img
                  className={`phoneImage slideImage ${slideDirection === 'next' ? 'next' : 'prev'}`}
                  src={activeLevelUpScreenshot}
                  alt="Level Up app screenshot"
                  style={{ width: `${adminConfig.media.levelUpScreenshotSize}%` }}
                />
              ) : (
                <p>Level Up app screenshot goes here</p>
              )}
            </div>
            {activeLevelUpScreenshot ? (
              <img
                className={`phonePopoutImage ${slideDirection === 'next' ? 'next' : 'prev'}`}
                src={activeLevelUpScreenshot}
                alt="Level Up screenshot popout effect"
              />
            ) : null}
          </div>
        </div>

        <div className="levelUpContent">
          <p className="eyebrow">Level Up App</p>
          <h2>{text('How do campers track real progress?', '营员如何跟踪真实进步？')}</h2>
          <p className="subhead">
            {text(
              'Camp leaders and coaches update daily progress in the app with photo/video logs, weekly schedules, and lunch ordering so parents can follow what campers do day to day.',
              '营地主任与教练会在应用内每日更新成长进度（含照片/视频日志）、每周日程与午餐下单，方便家长随时了解孩子每天的训练与进步。'
            )}
          </p>

          <div className="carouselControls">
            <button type="button" className="carouselBtn" onClick={previousLevelUpSlide}>
              Prev
            </button>
            <button type="button" className="carouselBtn" onClick={nextLevelUpSlide}>
              Next
            </button>
          </div>

          <div className="featureList featureCarousel">
            <article key={`${activeLevelUpFeature}-${levelUpSlideIndex}`} className="featureItem active">
              {activeLevelUpFeature}
            </article>
          </div>
          <div className="carouselDots" aria-label="Level Up slides">
            {Array.from({ length: levelUpSlideCount }).map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                className={`dot ${index === levelUpSlideIndex ? 'active' : ''}`}
                onClick={() => goToLevelUpSlide(index, index > levelUpSlideIndex ? 'next' : 'prev')}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section ref={registrationRef} className="card section" id="register">
        <header>
          <h2>Registration flow</h2>
          <p className="subhead">
            Family registration with per-camper weekly scheduling. New this year: Level Up app access for lunch booking
            and daily progress photos/videos.
          </p>
          <div className="registrationHeaderActions">
            <button type="button" className="button secondary" onClick={jumpToCampTop}>
              {text('Go to Summer Camp Page', '进入夏令营页面')}
            </button>
          </div>
        </header>

        <div className="registrationTabBar">
          <div className="registrationTabs" role="tablist" aria-label="Registration steps">
            {registrationSteps.map((item) => (
              (() => {
              const isComplete = isRegistrationStepComplete(item.id)
              const isMissing = !isComplete
              return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={step === item.id}
                className={`registrationTab ${item.id === step ? 'active' : item.id < step && isComplete ? 'done' : ''} ${item.id < step && isMissing ? 'incomplete' : ''}`}
                onClick={() => {
                  setStepDirection(item.id > step ? 'next' : 'prev')
                  setStep(item.id)
                }}
              >
                <span className="registrationTabNumber">{item.id}</span>
                <span className="registrationTabLabel">{item.title}</span>
                {isMissing ? <span className="registrationStepAlertDot" aria-hidden="true" /> : null}
              </button>
              )
              })()
            ))}
          </div>
          <div className="registrationCamperRow">
            <p className="registrationViewingLabel">
              Viewing: <strong>{activeCamperLabel}</strong>
            </p>
            {registration.students.length > 1 ? (
              <div className="registrationCamperTabs" aria-label="Active camper">
                {registration.students.map((student, index) => {
                  const label = student.fullName.trim() || `Camper ${index + 1}`
                  const active = resolvedActiveStudentId === student.id
                  const missing = isCamperMissingAnyStep(student)
                  return (
                    <button
                      key={`camper-tab-${student.id}`}
                      type="button"
                      className={`registrationCamperTab ${active ? 'active' : ''}`}
                      onClick={() => {
                        setActiveStudentId(student.id)
                        setExpandedStudentId(student.id)
                      }}
                      aria-pressed={active}
                    >
                      {label}
                      {missing ? <span className="registrationCamperAlertDot" aria-hidden="true" /> : null}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="regSummarySticky">
          <button
            type="button"
            className="regSummaryToggle"
            onClick={() => setSummaryExpanded((current) => !current)}
            aria-expanded={summaryExpanded}
          >
            <span>
              <strong>Registration summary</strong>
              <em>
                {registration.students.length} {registration.students.length === 1 ? 'camper' : 'campers'} ·{' '}
                {summaryDigest.totalCampDays} selected day blocks · {summaryDigest.totalLunchDays} lunch days
              </em>
            </span>
            <span className={`regSummaryChevron ${summaryExpanded ? 'open' : ''}`}>⌄</span>
          </button>
          {summaryExpanded ? (
            <div className="regSummaryGrid">
              {summaries.map(({ student, summary }) => (
                (() => {
                const generalTotal =
                  summary.general.fullWeeks +
                  summary.general.fullDays +
                  summary.general.amDays +
                  summary.general.pmDays
                const bootTotal =
                  summary.bootcamp.fullWeeks +
                  summary.bootcamp.fullDays +
                  summary.bootcamp.amDays +
                  summary.bootcamp.pmDays

                return (
                  <button
                    key={student.id}
                    type="button"
                    className={`regSummaryCard regSummaryButton ${
                      resolvedActiveStudentId === student.id ? 'selected' : ''
                    }`}
                    onClick={() => setActiveStudentId(student.id)}
                    aria-pressed={resolvedActiveStudentId === student.id}
                  >
                    <div className="regSummaryHead">
                      <strong>{student.fullName || 'Unnamed camper'}</strong>
                      {resolvedActiveStudentId === student.id ? <span className="selectedPill">Selected</span> : null}
                    </div>

                    {generalTotal > 0 ? (
                      <div className="summaryProgram general">
                        <p className="summaryProgramTitle">General Camp</p>
                        <div className="summaryStatRow">
                          {summary.general.fullWeeks > 0 ? (
                            <span className="summaryStatPill">
                              {pluralize('Full Week', summary.general.fullWeeks)}
                            </span>
                          ) : null}
                          {summary.general.fullDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('Full Day', summary.general.fullDays)}</span>
                          ) : null}
                          {summary.general.amDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('AM Day', summary.general.amDays)}</span>
                          ) : null}
                          {summary.general.pmDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('PM Day', summary.general.pmDays)}</span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {bootTotal > 0 ? (
                      <div className="summaryProgram bootcamp">
                        <p className="summaryProgramTitle">Competition Boot Camp</p>
                        <div className="summaryStatRow">
                          {summary.bootcamp.fullWeeks > 0 ? (
                            <span className="summaryStatPill">
                              {pluralize('Full Week', summary.bootcamp.fullWeeks)}
                            </span>
                          ) : null}
                          {summary.bootcamp.fullDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('Full Day', summary.bootcamp.fullDays)}</span>
                          ) : null}
                          {summary.bootcamp.amDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('AM Day', summary.bootcamp.amDays)}</span>
                          ) : null}
                          {summary.bootcamp.pmDays > 0 ? (
                            <span className="summaryStatPill">{pluralize('PM Day', summary.bootcamp.pmDays)}</span>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {generalTotal + bootTotal === 0 ? (
                      <p className="summaryEmpty">No camp days selected yet.</p>
                    ) : null}

                    <p className="summaryLunch">{pluralize('Lunch Day', summary.lunchCount)}</p>
                  </button>
                )
                })()
              ))}
            </div>
          ) : null}
          <p className="regStepHint">
            <strong>{stepShortTitle}</strong>
          </p>
        </div>

        {missingConfig ? (
          <div className="warning">
            Missing environment variables. Copy <code>.env.example</code> to <code>.env</code> and add your
            Supabase project values.
          </div>
        ) : null}

        <form onSubmit={submitRegistration}>
          <article key={`reg-step-${step}`} className={`registrationStepCard ${stepDirection}`}>
            <div className="registrationStepHero">
              <div className="registrationStepText">
                <p className="eyebrow">Registration Step {step}</p>
                <h3>{stepShortTitle}</h3>
              </div>
              <div className="registrationStepVisual">
                {activeRegistrationStepImage ? (
                  <img
                    src={activeRegistrationStepImage}
                    alt={`Registration step ${step} visual`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="surveyVisualPlaceholder">Add registration step {step} image in /admin media.</div>
                )}
              </div>
            </div>
          {step === 1 ? (
            <div className="grid">
              <label>
                <span className="requiredFieldLabel">Contact email {contactEmailMissing ? <span className="requiredDot" /> : null}</span>
                <input
                  id="reg-contact-email"
                  type="email"
                  value={registration.contactEmail}
                  onChange={(event) => updateContact('contactEmail', event.target.value)}
                  required
                />
              </label>

              <label>
                <span className="requiredFieldLabel">Contact phone {contactPhoneMissing ? <span className="requiredDot" /> : null}</span>
                <input
                  id="reg-contact-phone"
                  value={registration.contactPhone}
                  onChange={(event) => updateContact('contactPhone', event.target.value)}
                  required
                />
              </label>

              {registration.students.map((student, index) => (
                <div key={student.id} className="full studentCollapsedRow">
                  <button
                    type="button"
                    className="studentCollapsedHead"
                    onClick={() => {
                      setActiveStudentId(student.id)
                      setExpandedStudentId(expandedStudentId === student.id ? '' : student.id)
                    }}
                  >
                    <span>
                      <strong className="camperCardName">{student.fullName.trim() || `Camper ${index + 1}`}</strong>
                      <span className="camperCardMeta">Camper {index + 1}</span>
                      <span className="studentDetailCta">
                        Click here to view details for {student.fullName.trim() || `Camper ${index + 1}`}
                      </span>
                    </span>
                    {!isStudentComplete(student) ? <span className="requiredDot" /> : null}
                  </button>
                </div>
              ))}

              <div className="full studentActionsRow">
                <button
                  type="button"
                  className="button secondary"
                  onClick={addStudent}
                  disabled={registration.students.length >= MAX_CAMPERS}
                >
                  + Add family member ({registration.students.length}/{MAX_CAMPERS})
                </button>
                <button type="button" className="button secondary" onClick={clearRegistrationForm}>
                  Clear form
                </button>
              </div>

              {expandedStudent ? (
                <div className="full studentBlock">
                  <div className="studentHeader">
                    <h3>
                      {expandedStudent.fullName || `Camper ${
                        registration.students.findIndex((student) => student.id === expandedStudent.id) + 1
                      }`}
                    </h3>
                    {registration.students.length > 1 ? (
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => removeStudent(expandedStudent.id)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="grid">
                    <label>
                      <span className="requiredFieldLabel">Full name {!expandedStudent.fullName.trim() ? <span className="requiredDot" /> : null}</span>
                      <input
                        id={`reg-student-fullname-${expandedStudent.id}`}
                        value={expandedStudent.fullName}
                        onChange={(event) => updateStudentField(expandedStudent.id, 'fullName', event.target.value)}
                        required
                      />
                    </label>
                    <label>
                      <span className="requiredFieldLabel">Date of birth {!parseDateLocal(expandedStudent.dob) ? <span className="requiredDot" /> : null}</span>
                      <input
                        id={`reg-student-dob-${expandedStudent.id}`}
                        type="date"
                        value={expandedStudent.dob}
                        onChange={(event) => updateStudentField(expandedStudent.id, 'dob', event.target.value)}
                        required
                      />
                    </label>
                    <label className="full">
                      <span className="requiredFieldLabel">Allergies {!expandedStudent.allergies.trim() ? <span className="requiredDot" /> : null}</span>
                      <textarea
                        id={`reg-student-allergies-${expandedStudent.id}`}
                        rows="2"
                        value={expandedStudent.allergies}
                        onChange={(event) =>
                          updateStudentField(expandedStudent.id, 'allergies', event.target.value)
                        }
                        placeholder="Food, medication, environmental, or none"
                        required
                      />
                    </label>
                    <label className="full">
                      <span className="requiredFieldLabel">Medication {!expandedStudent.medication.trim() ? <span className="requiredDot" /> : null}</span>
                      <textarea
                        id={`reg-student-medication-${expandedStudent.id}`}
                        rows="2"
                        value={expandedStudent.medication}
                        onChange={(event) =>
                          updateStudentField(expandedStudent.id, 'medication', event.target.value)
                        }
                        placeholder="Current medications and timing instructions"
                        required
                      />
                    </label>
                    <label className="full">
                      <span className="requiredFieldLabel">Previous injuries {!expandedStudent.previousInjury.trim() ? <span className="requiredDot" /> : null}</span>
                      <textarea
                        id={`reg-student-injuries-${expandedStudent.id}`}
                        rows="2"
                        value={expandedStudent.previousInjury}
                        onChange={(event) =>
                          updateStudentField(expandedStudent.id, 'previousInjury', event.target.value)
                        }
                        placeholder="Any previous injuries or physical limitations"
                        required
                      />
                    </label>
                    <label className="full">
                      <span className="requiredFieldLabel">Other important info {!expandedStudent.healthNotes.trim() ? <span className="requiredDot" /> : null}</span>
                      <textarea
                        id={`reg-student-health-${expandedStudent.id}`}
                        rows="2"
                        value={expandedStudent.healthNotes}
                        onChange={(event) =>
                          updateStudentField(expandedStudent.id, 'healthNotes', event.target.value)
                        }
                        placeholder="Anything else our coaching team should know"
                        required
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <p className="subhead">All camper fields are collapsed. Tap a camper chip to expand and edit.</p>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="full">
              <p className="requiredFieldHint">{step2HasMissing ? <span className="requiredDot" /> : null} Select at least one camp day for each camper.</p>
              <p className="subhead">
                Looking for overnight camp? <a href="#overnight-registration">Click here.</a>
              </p>
              {activeStudent && copySourceOptions.length > 0 ? (
                <div className="registrationStepTools">
                  <label>
                    {`Copy "${activeCamperLabel}" weeks`}
                    <select
                      value={scheduleCopySourceId}
                      onChange={(event) => setScheduleCopySourceId(event.target.value)}
                    >
                      <option value="">Select camper</option>
                      {copySourceOptions.map((option) => (
                        <option key={`copy-schedule-${option.id}`} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => copyScheduleFromCamper(scheduleCopySourceId)}
                    disabled={!scheduleCopySourceId}
                  >
                    Copy weeks
                  </button>
                  <button type="button" className="button secondary" onClick={clearActiveStudentSchedule}>
                    Clear all weeks
                  </button>
                </div>
              ) : null}
              {activeStudent ? (
                <div className="weekCardList">
                  {registrationWeeks.map((week, weekIndex) => {
                    const entry = activeStudent.schedule[week.id]
                    const weekSelectionSummary = getWeekSelectionSummary(entry, week)
                    const weekDayKeys = week.days.map((item) => item.key)
                    const weekIsFull = weekDayKeys.every((day) => (entry?.days?.[day] || 'NONE') === 'FULL')
                    const selectedCampType = entry?.campType || ''
                    const panelKey = `${activeStudent.id}:${week.id}`
                    const expanded = expandedWeekKey === panelKey

                    return (
                      <article key={week.id} className="weekCard">
                        <button
                          type="button"
                          className="weekHead"
                          data-week-head={panelKey}
                          onClick={() => setExpandedWeekKey(expanded ? '' : panelKey)}
                        >
                          <span className="weekHeadText">
                            <strong>
                              Week {weekIndex + 1}: {week.programLabel}
                            </strong>
                            <span>{formatWeekLabel(week)}</span>
                            <em>
                              Click to expand and register for{' '}
                              <span className="activeStudentName">{activeStudent.fullName || 'this camper'}</span>
                            </em>
                            {weekSelectionSummary ? (
                              <span className="weekStatusChip">{weekSelectionSummary}</span>
                            ) : null}
                          </span>
                        </button>
                        {expanded ? (
                          <div className="weekBody">
                            <div className="toggleHintRow">
                              <em className="toggleHint">
                                Select a camp type first. Then tap day chips to toggle FULL DAY, AM, PM, then off for{' '}
                                <span className="activeStudentName">{activeStudent.fullName || 'this camper'}</span>.
                              </em>
                              <button
                                type="button"
                                className="tooltipBtn"
                                onClick={() => setHelpWeekKey(helpWeekKey === panelKey ? '' : panelKey)}
                                title="Show toggle help"
                              >
                                ?
                              </button>
                            </div>
                            {helpWeekKey === panelKey ? (
                              <p className="tooltipBubble">
                                <strong>How it works:</strong> select a camp type first, then tap each day chip to
                                cycle <strong>FULL DAY</strong> -&gt; <strong>AM</strong> -&gt; <strong>PM</strong>{' '}
                                -&gt; off.
                              </p>
                            ) : null}
                            <>
                              <div className="campTypeRow">
                                {week.availableCampTypes?.includes('general') ? (
                                  <button
                                    type="button"
                                    className={`campTypeChip general ${
                                      selectedCampType === 'general' ? 'selected' : ''
                                    }`}
                                    onClick={() => setDayCampType(activeStudent.id, week, 'general')}
                                  >
                                    General Camp
                                  </button>
                                ) : null}
                                {week.availableCampTypes?.includes('bootcamp') ? (
                                  <button
                                    type="button"
                                    className={`campTypeChip bootcamp ${
                                      selectedCampType === 'bootcamp' ? 'selected' : ''
                                    }`}
                                    onClick={() => setDayCampType(activeStudent.id, week, 'bootcamp')}
                                  >
                                    Competition Boot Camp
                                  </button>
                                ) : null}
                              </div>
                              <p className="campTypeExplain">
                                {selectedCampType === 'general'
                                  ? 'General Camp selected: foundational skill building for all levels.'
                                  : selectedCampType === 'bootcamp'
                                    ? 'Competition Boot Camp selected: Taolu-focused training for competition track.'
                                    : 'Choose camp type for this week.'}
                              </p>
                              <button
                                type="button"
                                className={`modeChip ${weekIsFull ? 'active full' : ''}`}
                                onClick={() => toggleFullWeek(activeStudent.id, week)}
                              >
                                Full Week (all Full Day)
                              </button>
                              <div className="chipRow">
                                {dayKeys.map((day) => {
                                  const mode = entry?.days?.[day] || 'NONE'
                                  return (
                                    <button
                                      key={`${week.id}-${day}`}
                                      type="button"
                                      className={`modeChip ${mode !== 'NONE' ? `active ${mode.toLowerCase()}` : ''}`}
                                      onClick={() => cycleDay(activeStudent.id, week, day)}
                                      disabled={!selectedCampType}
                                    >
                                      {mode === 'NONE' ? day : `${day} ${mode === 'FULL' ? 'FULL DAY' : mode}`}
                                    </button>
                                  )
                                })}
                              </div>
                            </>
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="full">
              <p className="requiredFieldHint">{step3HasMissing ? <span className="requiredDot" /> : null} Each camper must choose lunch days or confirm no lunch.</p>
              <p className="subhead">
                Lunch is {currency(adminConfig.tuition.lunchPrice)} per day for General/Boot camp days. We send the
                menu at the start of each week. Options include box juice or bottled water. New this year, families can
                also manage lunch booking and see progress photos/videos in the Level Up app.
              </p>
              <p className="subhead">
                Looking for overnight camp? <a href="#overnight-registration">Click here.</a>
              </p>
              {activeStudent && copySourceOptions.length > 0 ? (
                <div className="registrationStepTools">
                  <label>
                    Copy another camper lunch
                    <select
                      value={lunchCopySourceId}
                      onChange={(event) => setLunchCopySourceId(event.target.value)}
                    >
                      <option value="">Select camper</option>
                      {copySourceOptions.map((option) => (
                        <option key={`copy-lunch-${option.id}`} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => copyLunchFromCamper(lunchCopySourceId)}
                    disabled={!lunchCopySourceId}
                  >
                    Copy lunch
                  </button>
                  <button type="button" className="button secondary" onClick={clearActiveStudentLunch}>
                    Clear all lunch
                  </button>
                </div>
              ) : null}

              {activeStudent ? (
                <div className="weekCardList">
                  {getLunchWeeksForStudent(activeStudent, weeksById).length === 0 ? (
                    <p className="subhead">No registered camp days yet for this camper.</p>
                  ) : (
                    getLunchWeeksForStudent(activeStudent, weeksById).map((row, weekIndex) => {
                      const panelKey = `${activeStudent.id}:${row.weekId}`
                      const expanded = expandedLunchWeekKey === panelKey
                      const weekLunchDays = row.selectedDays.filter((day) => Boolean(activeStudent.lunch[day.key])).length
                      const weekRegisteredDays = row.selectedDays.length
                      const weekPackDays = Math.max(0, weekRegisteredDays - weekLunchDays)
                      return (
                        <article key={row.weekId} className="weekCard">
                          <button
                            type="button"
                            className={`weekHead ${expanded ? 'selected' : ''}`}
                            onClick={() => setExpandedLunchWeekKey(expanded ? '' : panelKey)}
                          >
                            <span className="weekHeadText">
                              <strong>
                                Week {weekIndex + 1}: {row.week.programLabel}
                              </strong>
                              <span>{formatWeekLabel(row.week)}</span>
                              <em>
                                Click to expand lunch choices for{' '}
                                <span className="activeStudentName">{activeStudent.fullName || 'this camper'}</span>
                              </em>
                              <span className="weekLunchSummaryLine">
                                Lunch {weekLunchDays}/{weekRegisteredDays} days · Pack lunch {weekPackDays} days
                              </span>
                            </span>
                          </button>
                          {expanded ? (
                            <div className="weekBody">
                              <em className="toggleHint">
                                Tap each chip to toggle lunch for{' '}
                                <span className="activeStudentName">{activeStudent.fullName || 'this camper'}</span>.
                              </em>
                              <div className="chipRow">
                                {row.selectedDays.map((day) => {
                                  const hasLunch = Boolean(activeStudent.lunch[day.key])
                                  return (
                                    <button
                                      key={day.key}
                                      type="button"
                                      className={`modeChip lunchChip ${hasLunch ? 'yes' : 'no'}`}
                                      onClick={() => toggleLunch(activeStudent.id, row.weekId, day.dayKey)}
                                    >
                                      {day.dayKey} Lunch {hasLunch ? 'YES' : 'NO'}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ) : null}
                        </article>
                      )
                    })
                  )}
                </div>
              ) : null}
              {activeStudent ? (
                <div className="lunchDecisionCard" data-lunch-decision={activeStudent.id}>
                  <div className="lunchDecisionHeader">
                    <strong className="requiredFieldLabel">
                      Lunch decision {!Object.values(activeStudent.lunch || {}).some(Boolean) && !activeStudent.lunchConfirmedNone ? <span className="requiredDot" /> : null}
                    </strong>
                    {!Object.values(activeStudent.lunch || {}).some(Boolean) && !activeStudent.lunchConfirmedNone ? (
                      <span className="lunchRequiredTag">
                        <span className="requiredDot" />
                        Required
                      </span>
                    ) : null}
                  </div>
                  <p className="subhead">
                    {Object.values(activeStudent.lunch || {}).some(Boolean)
                      ? `Lunch selected for ${Object.values(activeStudent.lunch || {}).filter(Boolean).length} day(s).`
                      : 'No lunch days selected yet. Confirm no lunch if this camper does not need lunch.'}
                  </p>
                  <label className="lunchConfirmNoneRow">
                    <input
                      type="checkbox"
                      checked={Boolean(activeStudent.lunchConfirmedNone)}
                      onChange={(event) => setLunchConfirmedNone(activeStudent.id, event.target.checked)}
                      disabled={Object.values(activeStudent.lunch || {}).some(Boolean)}
                    />
                    Confirm no lunch for this camper
                  </label>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="full">
              {adminConfig.tuition.discountEndDate ? (
                <p className="subhead">
                  Discount pricing applies through {adminConfig.tuition.discountEndDate}.{' '}
                  {discountActive ? 'Discount is currently active.' : 'Discount has ended; regular pricing applies.'}
                </p>
              ) : null}
              {discountActive ? (
                <div className={`stepFourDiscountClaim ${registrationDiscountClaimed ? 'claimed' : ''}`}>
                  <div>
                    <strong>Claim discount</strong>
                    <p>
                      You've earned {currency(claimableDiscountTotal)} in discount. Claim before{' '}
                      {adminConfig.tuition.discountEndDate || 'the discount end date'}.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button stepFourClaimBtn"
                    onClick={() => setRegistrationDiscountClaimed(true)}
                    disabled={registrationDiscountClaimed}
                  >
                    {registrationDiscountClaimed
                      ? `Discount Claimed (${currency(claimableDiscountTotal)})`
                      : `Claim ${currency(claimableDiscountTotal)} Discount`}
                  </button>
                </div>
              ) : null}
              {summaries.map(({ student, summary }) => {
                const studentIndex = registration.students.findIndex((item) => item.id === student.id)
                const invoice = buildStudentPriceRows(summary, studentIndex, {
                  applyLimitedDiscount: discountActive && registrationDiscountClaimed,
                })
                return (
                  <article
                    key={student.id}
                    className={`reviewPriceCard ${discountActive && registrationDiscountClaimed ? 'claimedDiscount' : ''}`}
                  >
                    <h3>{student.fullName || 'Unnamed camper'}</h3>
                    <table className="priceTable">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Discount</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.rows.map((row) => (
                          <tr key={row.id}>
                            <td>{row.label}</td>
                            <td>{row.qty}</td>
                            <td>{currency(row.effectivePrice)}</td>
                            <td>{row.discountLineTotal > 0 ? `-${currency(row.discountLineTotal)}` : '-'}</td>
                            <td>{currency(row.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {invoice.limitedDiscountAmount > 0 && discountActive && registrationDiscountClaimed ? (
                      <>
                        <p className="totalLine subtotalLine crossed">Subtotal: {currency(invoice.subtotalRegular)}</p>
                        <p className="totalLine promoApplyLine">
                          Total discount: -{currency(invoice.limitedDiscountAmount)}
                        </p>
                        <p className="totalLine">New subtotal: {currency(invoice.subtotal)}</p>
                      </>
                    ) : (
                      <p className="totalLine">Subtotal: {currency(invoice.subtotalRegular)}</p>
                    )}
                    {invoice.siblingDiscountAmount > 0 ? (
                      <p className="totalLine discountLine">
                        Sibling discount ({invoice.siblingDiscountPct}%){' '}
                        {invoice.siblingAppliedBeforeLimitedDiscount
                          ? '(applied before camp discount)'
                          : '(applied after camp discount)'}
                        : -{currency(invoice.siblingDiscountAmount)}
                      </p>
                    ) : null}
                    <p className="totalLine">{student.fullName || 'Camper'} total: {currency(invoice.total)}</p>
                  </article>
                )
              })}
              <p className="totalLine grand">
                Grand total:{' '}
                {currency(
                  summaries.reduce((sum, item) => {
                    const studentIndex = registration.students.findIndex((student) => student.id === item.student.id)
                    return sum + buildStudentPriceRows(item.summary, studentIndex, {
                      applyLimitedDiscount: discountActive && registrationDiscountClaimed,
                    }).total
                  }, 0)
                )}
              </p>
              <p className="reservationHoldNotice">
                Reservations are held for 72 hours and canceled automatically if payment is not received.
              </p>
              <div className="summaryActionRow">
                <button type="button" className="button secondary" onClick={() => openSummaryOverlay(registration)}>
                  Open Summary PDF
                </button>
                <button type="button" className="button secondary" onClick={() => emailSummaryToSelf(registration)}>
                  Email Summary to Myself
                </button>
              </div>
            </div>
          ) : null}

          <div className="actions">
            {step > 1 ? (
              <button type="button" className="button secondary" onClick={previousStep}>
                Back
              </button>
            ) : (
              <span />
            )}

            {step < registrationSteps.length ? (
              <button type="button" className="button" onClick={nextStep}>
                Continue
              </button>
            ) : (
              <button className="button" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit registration'}
              </button>
            )}
          </div>
          </article>
        </form>

        {message ? <p className="message">{message}</p> : null}
        {submittedRegistrationSnapshot ? (
          <div className="summaryActionRow">
            <button
              type="button"
              className="button secondary"
              onClick={() => openSummaryOverlay(submittedRegistrationSnapshot)}
            >
              Open Submitted Summary PDF
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => emailSummaryToSelf(submittedRegistrationSnapshot)}
            >
              Email Submitted Summary
            </button>
          </div>
        ) : null}
      </section>

      <section className="card section" id="contact-us">
        <h2>Contact Us</h2>
        <p className="subhead">
          Questions before registering? Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
        <div className="contactGrid">
          <form className="contactForm" onSubmit={submitContact}>
            <label>
              Name
              <input
                value={contactForm.name}
                onChange={(event) => updateContactForm('name', event.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={contactForm.email}
                onChange={(event) => updateContactForm('email', event.target.value)}
                required
              />
            </label>
            <label>
              Message
              <textarea
                rows="4"
                value={contactForm.message}
                onChange={(event) => updateContactForm('message', event.target.value)}
                required
              />
            </label>
            <button type="submit" className="button">
              Send Message
            </button>
            {contactMessage ? <p className="message">{contactMessage}</p> : null}
          </form>
          <aside className="contactQrCard">
            <h3>WeChat Contact</h3>
            {adminConfig.media.wechatQrUrl ? (
              <img src={adminConfig.media.wechatQrUrl} alt="WeChat QR code" />
            ) : (
              <p className="subhead">Add a WeChat QR in /admin Media.</p>
            )}
          </aside>
        </div>
      </section>

      <section className="card section" id="overnight-registration">
        <h2>Overnight Camp Registration</h2>
        <p className="subhead">
          Overnight Camp offers both Full Week and Full Day options. Use this table for current pricing, then request
          your preferred option below.
        </p>
        <div className="tuitionTableWrap">
          <table className="priceTable">
            <thead>
              <tr>
                <th>Option</th>
                <th>Regular Price</th>
                <th>Discounted Price</th>
                <th>Discount</th>
                <th>Current Price</th>
              </tr>
            </thead>
            <tbody>
              {overnightPricingRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{currency(row.regular)}</td>
                  <td>{currency(row.discounted > 0 ? row.discounted : row.regular)}</td>
                  <td>{row.discountAmount > 0 ? `-${currency(row.discountAmount)}` : '-'}</td>
                  <td>{currency(row.effective)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="overnightOptionChips" role="group" aria-label="Overnight option">
          <button
            type="button"
            className={`modeChip ${overnightRequestOption === 'fullWeek' ? 'active full' : ''}`}
            onClick={() => setOvernightRequestOption('fullWeek')}
          >
            Overnight Full Week
          </button>
          <button
            type="button"
            className={`modeChip ${overnightRequestOption === 'fullDay' ? 'active full' : ''}`}
            onClick={() => setOvernightRequestOption('fullDay')}
          >
            Overnight Full Day
          </button>
        </div>
        <button
          type="button"
          className="button secondary"
          onClick={() => setMessage(`Requested overnight info for ${overnightRequestOption === 'fullDay' ? 'Overnight Full Day' : 'Overnight Full Week'}.`)}
        >
          Request Overnight Info
        </button>
      </section>

      {summaryOverlayOpen ? (
        <div className="summaryOverlayBackdrop" role="dialog" aria-modal="true" aria-label="Registration summary PDF view">
          <div className="summaryOverlayPanel">
            <div className="summaryOverlayBar">
              <strong>Registration Summary</strong>
              <div className="summaryOverlayActions">
                <button type="button" className="button secondary" onClick={printSummaryOverlay}>
                  Print / Save PDF
                </button>
                <button type="button" className="button secondary" onClick={() => setSummaryOverlayOpen(false)}>
                  Close
                </button>
              </div>
            </div>
            <iframe ref={summaryIframeRef} title="Registration summary preview" srcDoc={summaryOverlayHtml} />
          </div>
        </div>
      ) : null}

      <nav className="mobileSectionNav" aria-label="Section navigation">
        <a href="#camp-info">Info</a>
        <a href="#overview">Overview</a>
        <a href="#weekly-structure">Week</a>
        <a href="#level-up">App</a>
        <a href="#register">Register</a>
        <a href="#contact-us">Contact</a>
      </nav>

      <div className="learnAssistDock" aria-label="Camp fit assistant shortcut">
        <span>{text('Not sure yet?', '还在犹豫？')}</span>
        <button type="button" className="learnAssistLink" onClick={chooseLearnPath}>
          {text('Use Camp Fit Assistant to find your best-fit program', '使用营地匹配助手找到最适合的课程')}
        </button>
      </div>
      </>
      ) : null}
      {discountCountdown && (!isMobileLearnOverlayOpen || keepFloatingUiVisible) && isMobileViewport && isDiscountCollapsed ? (
        <button
          type="button"
          className="discountCollapsedRemnant"
          aria-label={text('Show discount', '展开优惠')}
          onClick={() => setIsDiscountCollapsed(false)}
        >
          ⌃
        </button>
      ) : null}
      {discountCountdown && (!isMobileLearnOverlayOpen || keepFloatingUiVisible) && (!isMobileViewport || !isDiscountCollapsed) ? (
        <div className="discountCountdownDock" aria-label="Discount countdown">
          <div className="discountCountdownMeta single">
            {isMobileViewport ? (
              <button
                type="button"
                className="discountHideBtn"
                aria-label={text('Hide discount', '收起优惠')}
                onClick={() => setIsDiscountCollapsed(true)}
              >
                {text('Hide', '收起')}
              </button>
            ) : null}
            <p className="discountAmountHero">
              {discountAmountLabel}
              <span>{text('per week', '每周')}</span>
            </p>
            <div className="discountCountdownBoxes" aria-label="Countdown timer">
              <div className="discountTimeBox">
                <span className="discountTimeValue">{discountCountdown.days}</span>
                <span className="discountTimeLabel">{text('Days', '天')}</span>
              </div>
              <div className="discountTimeBox">
                <span className="discountTimeValue">{String(discountCountdown.hours).padStart(2, '0')}</span>
                <span className="discountTimeLabel">{text('Hours', '时')}</span>
              </div>
              <div className="discountTimeBox">
                <span className="discountTimeValue">{String(discountCountdown.minutes).padStart(2, '0')}</span>
                <span className="discountTimeLabel">{text('Minutes', '分')}</span>
              </div>
              <div className="discountTimeBox">
                <span className="discountTimeValue">{String(discountCountdown.seconds).padStart(2, '0')}</span>
                <span className="discountTimeLabel">{text('Seconds', '秒')}</span>
              </div>
            </div>
            <span>{text('Ends on', '截止日期')} {discountCountdown.endLabel}</span>
            {adminConfig.tuition.discountCode ? (
              <p className="discountCodeLine">
                {text('Code', '优惠码')}: <code>{adminConfig.tuition.discountCode}</code>
              </p>
            ) : null}
            <button type="button" className="button discountClaimBtn" onClick={jumpToRegistration}>
              {text('Claim Discount', '立即报名')}
            </button>
          </div>
        </div>
      ) : null}
      {!isMobileLearnOverlayOpen || keepFloatingUiVisible ? (
      <div className="langToggleDock" aria-label="Language toggle">
        <button
          type="button"
          className={`langToggleBtn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          🇺🇸 EN
        </button>
        <span>/</span>
        <button
          type="button"
          className={`langToggleBtn ${language === 'zh' ? 'active' : ''}`}
          onClick={() => setLanguage('zh')}
        >
          🇨🇳 中文
        </button>
      </div>
      ) : null}
    </main>
  )
}
