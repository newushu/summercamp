'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { defaultAdminConfig, formatWeekLabel, getSelectedWeeks, mergeAdminConfig } from '../../lib/campAdmin'
import { fetchAdminConfigFromSupabase } from '../../lib/campAdminApi'
import { buildPaymentPageHref } from '../../lib/paymentPageLink'
import { supabase, supabaseEnabled } from '../../lib/supabase'

const OVERNIGHT_REGULAR_WEEK_PRICE = 1180
const OVERNIGHT_DISCOUNT_WEEK_PRICE = 980
const OVERNIGHT_DISCOUNT_AMOUNT = OVERNIGHT_REGULAR_WEEK_PRICE - OVERNIGHT_DISCOUNT_WEEK_PRICE
const OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT = 100
const OVERNIGHT_WEEKLY_POINTS = 5000
const OVERNIGHT_POINTS_USE_COPY = 'Points can be saved for prizes, equipment, and future discounts during fall or spring season.'
const OVERNIGHT_REGISTRATION_DRAFT_KEY = 'new-england-wushu-overnight-registration-draft-v1'
const overnightRegistrationSteps = [
  { id: 1, title: 'Family & campers' },
  { id: 2, title: 'Choose weeks' },
  { id: 3, title: 'Activity interests' },
]
const overnightActivityOptions = [
  'Taolu forms training',
  'Weapons basics',
  'Advanced weapons practice',
  'Sanda fundamentals',
  'Self-defense drills',
  'Tumbling basics',
  'Acrobatics progression',
  'Flexibility training',
  'Mobility and recovery',
  'Strength and conditioning',
  'Speed and agility drills',
  'Balance and coordination games',
  'Partner drills',
  'Small-group team challenges',
  'Leadership activities',
  'Confidence-building drills',
  'Performance practice',
  'Showcase preparation',
  'Mindfulness and focus practice',
  'Character-building sessions',
  'Sportsmanship and discipline lessons',
  'Goal-setting workshops',
  'Video review and technique feedback',
  'Nature walks/outdoor exploration',
  'City or park outings',
  'Cultural activities',
  'Board/card game social time',
  'Creative team projects',
  'Campfire-style reflection time',
  'Free play and social bonding',
]

const overnightWeeklySchedule = [
  {
    day: 'Sunday',
    am: 'Arrival + orientation',
    pm: 'Academy training',
    evening: 'Outing',
    note: '1 PM arrival, orientation, first training block, then an outing.',
  },
  {
    day: 'Monday',
    am: 'Academy training + day camp integration',
    pm: 'Academy training',
    evening: 'Outing',
    note: 'Full training day followed by an evening outing.',
  },
  {
    day: 'Tuesday',
    am: 'Academy training + day camp integration',
    pm: 'Academy training',
    evening: 'Lodging activities',
    note: 'Two training blocks, then supervised lodging activities.',
  },
  {
    day: 'Wednesday',
    am: 'Academy training + day camp integration',
    pm: 'Academy training + social session',
    evening: 'Lodging activities',
    note: 'Skill work, social session, and evening group time at lodging.',
  },
  {
    day: 'Thursday',
    am: 'Academy training + day camp integration',
    pm: 'Academy training',
    evening: 'Outing',
    note: 'Training through the day, then an evening outing.',
  },
  {
    day: 'Friday',
    am: 'Outing',
    pm: 'Academy training + showcase prep',
    evening: 'Lodging activities',
    note: 'Morning outing, showcase prep, and evening lodging time.',
  },
  {
    day: 'Saturday',
    am: 'Academy training recap',
    pm: 'Family & friends BBQ + games',
    evening: 'Pickup',
    note: 'Final recap, family BBQ, games, and 4 PM pickup.',
  },
]
const CURRENT_YEAR = new Date().getFullYear()
const DOB_YEAR_OPTIONS = Array.from({ length: 26 }, (_, index) => String(new Date().getFullYear() - 2 - index))

function getSiteBaseUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://summer.newushu.com'
}

function getDobYear(dob) {
  const match = String(dob || '').trim().match(/^(\d{4})-\d{2}-\d{2}$/)
  return match ? match[1] : ''
}

function setDobYear(dob, yearValue) {
  const year = String(yearValue || '').trim()
  if (!/^\d{4}$/.test(year)) {
    return ''
  }
  const raw = String(dob || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return `${year}${raw.slice(4)}`
  }
  return `${year}-01-01`
}

const overnightCarouselCaptions = [
  {
    title: 'Lodging Space',
    text: 'Spacious, supervised lodging with clear routines and comfortable setup.',
  },
  {
    title: 'Fun Outings & Outdoor Activities',
    text: 'Campers enjoy fun outings, outdoor activities, and active adventures throughout the week.',
  },
  {
    title: 'Outings & Outdoor Activities',
    text: 'Campers enjoy outdoor activities, outings, and active adventures that make the week exciting.',
  },
  {
    title: 'Lodging & Group Activities',
    text: 'Fun at the lodging house includes shared meals, games, bonding time, and structured group activities.',
  },
  {
    title: 'Academy Training',
    text: 'Focused training blocks give campers more reps, better corrections, and stronger progress.',
  },
  {
    title: 'Team Life',
    text: 'Shared camp life helps campers build friendships, independence, and strong team energy.',
  },
]

function createCamper(idValue = '') {
  const fallbackId = `overnight-camper-${Math.random().toString(36).slice(2, 9)}`
  return {
    id: idValue || fallbackId,
    fullName: '',
    dob: '',
    allergies: '',
    medication: '',
    previousInjury: '',
    healthNotes: '',
    overnightWeekIds: [],
    activitySelections: [],
  }
}

function createOvernightRegistration(seedCamperId = 'overnight-camper-1') {
  return {
    parentName: '',
    contactEmail: '',
    contactPhone: '',
    students: [createCamper(seedCamperId)],
  }
}

function readOvernightRegistrationDraft() {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.localStorage.getItem(OVERNIGHT_REGISTRATION_DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function normalizeOvernightCamperDraft(student, index) {
  return {
    id: typeof student?.id === 'string' ? student.id : `overnight-camper-${index + 1}`,
    fullName: typeof student?.fullName === 'string' ? student.fullName : '',
    dob: typeof student?.dob === 'string' ? student.dob : '',
    allergies: typeof student?.allergies === 'string' ? student.allergies : '',
    medication: typeof student?.medication === 'string' ? student.medication : '',
    previousInjury: typeof student?.previousInjury === 'string' ? student.previousInjury : '',
    healthNotes: typeof student?.healthNotes === 'string' ? student.healthNotes : '',
    overnightWeekIds: Array.isArray(student?.overnightWeekIds) ? student.overnightWeekIds.filter(Boolean) : [],
    activitySelections: Array.isArray(student?.activitySelections) ? student.activitySelections.filter(Boolean) : [],
  }
}

function splitName(fullName = '') {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: '', lastName: '' }
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

function parseDateLocal(input) {
  if (!input) {
    return null
  }
  const parsed = new Date(`${input}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

function calcAge(dob) {
  const parsed = parseDateLocal(dob)
  if (!parsed) {
    return 3
  }
  const now = new Date()
  let age = now.getFullYear() - parsed.getFullYear()
  const monthDelta = now.getMonth() - parsed.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < parsed.getDate())) {
    age -= 1
  }
  return Math.max(3, Math.min(17, age))
}

function getResizedPreviewUrl(url, width, height, quality = 76) {
  const raw = String(url || '').trim()
  if (!raw || !raw.includes('/storage/v1/object/public/')) {
    return raw
  }
  try {
    const parsed = new URL(raw)
    parsed.searchParams.set('width', String(width))
    parsed.searchParams.set('height', String(height))
    parsed.searchParams.set('resize', 'cover')
    parsed.searchParams.set('quality', String(quality))
    return parsed.toString()
  } catch {
    return raw
  }
}

function buildOvernightInvoice(weeksSelected, regularWeekPrice, discountedWeekPrice, discountActive) {
  const normalizedWeeks = Math.max(0, Number(weeksSelected || 0))
  const regularRate = Number(regularWeekPrice || 0)
  const discountedRate = discountActive ? Math.min(regularRate || discountedWeekPrice, discountedWeekPrice) : regularRate
  const extraSecondWeekDiscount = discountActive && normalizedWeeks >= 2 ? OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT : 0
  const regularSubtotal = normalizedWeeks * regularRate
  const discountedSubtotal = normalizedWeeks * discountedRate
  const subtotal = Math.max(0, discountedSubtotal - extraSecondWeekDiscount)
  const savings = Math.max(0, regularSubtotal - subtotal)

  return {
    weeksSelected: normalizedWeeks,
    regularRate,
    discountedRate,
    secondWeekRate: Math.max(0, discountedRate - OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT),
    extraSecondWeekDiscount,
    regularSubtotal,
    discountedSubtotal,
    subtotal,
    savings,
  }
}

function normalizeOvernightRegularWeekPrice(value) {
  const amount = Number(value || 0)
  if (amount <= 0) {
    return OVERNIGHT_REGULAR_WEEK_PRICE
  }
  // Migrate legacy stored $1200 pricing to the current published $1180 rate.
  if (amount === 1200) {
    return OVERNIGHT_REGULAR_WEEK_PRICE
  }
  return amount
}

function normalizeOvernightDiscountWeekPrice(value) {
  const amount = Number(value || 0)
  if (amount <= 0) {
    return OVERNIGHT_DISCOUNT_WEEK_PRICE
  }
  // Migrate legacy stored $1050 pricing to the current published $980 early rate.
  if (amount === 1050) {
    return OVERNIGHT_DISCOUNT_WEEK_PRICE
  }
  return amount
}

export function OvernightCampPage({ view = 'landing' }) {
  const isRegistrationView = view === 'register'
  const isLandingView = !isRegistrationView
  const [language, setLanguage] = useState('en')
  const [config, setConfig] = useState(defaultAdminConfig)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [overnightCarouselIndex, setOvernightCarouselIndex] = useState(0)
  const [galleryCarouselIndex, setGalleryCarouselIndex] = useState(0)
  const [expandedGalleryIndex, setExpandedGalleryIndex] = useState(-1)
  const [overnightStep, setOvernightStep] = useState(1)
  const [countdownNow, setCountdownNow] = useState(() => Date.now())
  const [draftReady, setDraftReady] = useState(false)
  const galleryItemRefs = useRef([])
  const overnightFieldRefs = useRef({})
  const [registration, setRegistration] = useState(() => createOvernightRegistration())

  useEffect(() => {
    if (!isRegistrationView) {
      setDraftReady(true)
      return
    }

    const draft = readOvernightRegistrationDraft()
    if (draft?.registration) {
      setRegistration({
        parentName: typeof draft.registration.parentName === 'string' ? draft.registration.parentName : '',
        contactEmail: typeof draft.registration.contactEmail === 'string' ? draft.registration.contactEmail : '',
        contactPhone: typeof draft.registration.contactPhone === 'string' ? draft.registration.contactPhone : '',
        students:
          Array.isArray(draft.registration.students) && draft.registration.students.length > 0
            ? draft.registration.students.map(normalizeOvernightCamperDraft)
            : createOvernightRegistration().students,
      })
    }

    const draftStep = Number(draft?.overnightStep)
    if (Number.isFinite(draftStep)) {
      setOvernightStep(Math.max(1, Math.min(overnightRegistrationSteps.length, draftStep)))
    }

    setDraftReady(true)
  }, [isRegistrationView])

  useEffect(() => {
    if (!isRegistrationView || !draftReady || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      OVERNIGHT_REGISTRATION_DRAFT_KEY,
      JSON.stringify({
        overnightStep,
        registration,
      })
    )
  }, [draftReady, isRegistrationView, overnightStep, registration])

  useEffect(() => {
    let active = true
    async function load() {
      setLoadingConfig(true)
      const { data } = await fetchAdminConfigFromSupabase()
      if (!active) {
        return
      }
      setConfig(mergeAdminConfig(data || defaultAdminConfig))
      setLoadingConfig(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const overnightWeeks = useMemo(
    () => getSelectedWeeks('overnight', config.programs.overnight),
    [config.programs.overnight]
  )
  const discountActive = useMemo(() => {
    const end = parseDateLocal(config.tuition.discountEndDate)
    if (!end) {
      return false
    }
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return today <= end
  }, [config.tuition.discountEndDate])
  useEffect(() => {
    if (!discountActive) {
      return undefined
    }
    const intervalId = window.setInterval(() => setCountdownNow(Date.now()), 1000)
    return () => window.clearInterval(intervalId)
  }, [discountActive])
  const overnightDiscountCountdown = useMemo(() => {
    const end = parseDateLocal(config.tuition.discountEndDate)
    if (!discountActive || !end) {
      return null
    }
    const endOfDay = new Date(end)
    endOfDay.setHours(23, 59, 59, 999)
    const remainingMs = Math.max(0, endOfDay.getTime() - countdownNow)
    const totalSeconds = Math.floor(remainingMs / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return {
      days,
      hours,
      minutes,
      seconds,
      endLabel: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
  }, [config.tuition.discountEndDate, countdownNow, discountActive])
  const overnightRegularWeekPrice = useMemo(
    () => normalizeOvernightRegularWeekPrice(config.tuition.regular.overnightWeek),
    [config.tuition.regular.overnightWeek]
  )
  const overnightDiscountWeekPrice = useMemo(
    () => normalizeOvernightDiscountWeekPrice(config.tuition.discount.overnightWeek),
    [config.tuition.discount.overnightWeek]
  )
  const overnightWeekPrice = useMemo(() => {
    if (discountActive && overnightDiscountWeekPrice > 0) {
      return Math.min(overnightRegularWeekPrice || overnightDiscountWeekPrice, overnightDiscountWeekPrice)
    }
    return overnightRegularWeekPrice
  }, [discountActive, overnightDiscountWeekPrice, overnightRegularWeekPrice])
  const suggestedOvernightWeekPrice = overnightRegularWeekPrice
  const perCamperInvoiceRows = useMemo(
    () =>
      registration.students.map((student, index) => {
        const selectedWeekIds = Array.isArray(student.overnightWeekIds) ? student.overnightWeekIds : []
        const invoice = buildOvernightInvoice(
          selectedWeekIds.length,
          overnightRegularWeekPrice,
          overnightDiscountWeekPrice,
          discountActive
        )
        return {
          label: student.fullName?.trim() || `Camper ${index + 1}`,
          ...invoice,
        }
      }),
    [discountActive, overnightDiscountWeekPrice, overnightRegularWeekPrice, registration.students]
  )
  const selectedWeekCount = useMemo(
    () => perCamperInvoiceRows.reduce((sum, row) => sum + row.weeksSelected, 0),
    [perCamperInvoiceRows]
  )
  const totalTuition = useMemo(
    () => perCamperInvoiceRows.reduce((sum, row) => sum + row.subtotal, 0),
    [perCamperInvoiceRows]
  )
  const overnightCarouselItems = useMemo(() => {
    const slotUrls = Array.isArray(config.media.overnightLandingImageUrls)
      ? config.media.overnightLandingImageUrls
      : []
    const filledSlots = slotUrls
      .map((url, index) => {
        const normalizedUrl = String(url || '').trim()
        return normalizedUrl ? { url: normalizedUrl, slotIndex: index } : null
      })
      .filter(Boolean)
    if (filledSlots.length > 0) {
      return filledSlots
    }
    const fallbackUrl = String(config.media.heroImageUrl || '').trim()
    return fallbackUrl ? [{ url: fallbackUrl, slotIndex: 0 }] : []
  }, [config.media.heroImageUrl, config.media.overnightLandingImageUrls])
  const overnightCarouselCount = overnightCarouselItems.length
  const normalizedOvernightCarouselIndex =
    overnightCarouselCount > 0
      ? ((overnightCarouselIndex % overnightCarouselCount) + overnightCarouselCount) % overnightCarouselCount
      : 0
  const activeOvernightCarouselImage =
    overnightCarouselCount > 0 ? overnightCarouselItems[normalizedOvernightCarouselIndex]?.url || '' : ''
  const activeOvernightCarouselCaption =
    overnightCarouselCaptions[
      (overnightCarouselItems[normalizedOvernightCarouselIndex]?.slotIndex || 0) % overnightCarouselCaptions.length
    ]
  const overnightGalleryImages = useMemo(
    () => {
      const gallery = Array.isArray(config.media.overnightGalleryImageUrls)
        ? config.media.overnightGalleryImageUrls.filter(Boolean)
        : []
      if (gallery.length > 0) {
        return gallery
      }
      return overnightCarouselItems.length > 0 ? overnightCarouselItems.map((item) => item.url) : []
    },
    [config.media.overnightGalleryImageUrls, overnightCarouselItems]
  )
  const overnightRegistrationImages = useMemo(
    () =>
      Array.isArray(config.media.overnightRegistrationImageUrls)
        ? config.media.overnightRegistrationImageUrls.filter(Boolean)
        : [],
    [config.media.overnightRegistrationImageUrls]
  )
  const isZh = language === 'zh'
  const text = (en, zh) => (isZh ? zh : en)
  const overnightPointsUseCopy = text(
    'Points can be saved for prizes, equipment, and future discounts during fall or spring season.',
    '积分可用于兑换奖品、装备，以及秋季或春季课程的后续优惠。'
  )
  const getOvernightStepTitle = (stepId) =>
    ({
      1: text('Family & campers', '家庭与营员'),
      2: text('Choose weeks', '选择周次'),
      3: text('Activity interests', '活动偏好'),
    })[stepId] || text('Overnight registration', '过夜营报名')
  const overnightValidationMap = getOvernightValidationMap()
  const activeOvernightStepImage = overnightRegistrationImages[overnightStep - 1] || ''
  const normalizedGalleryCarouselIndex =
    overnightGalleryImages.length > 0
      ? ((galleryCarouselIndex % overnightGalleryImages.length) + overnightGalleryImages.length) % overnightGalleryImages.length
      : 0
  const normalizedExpandedGalleryIndex =
    overnightGalleryImages.length > 0 && expandedGalleryIndex >= 0
      ? ((expandedGalleryIndex % overnightGalleryImages.length) + overnightGalleryImages.length) % overnightGalleryImages.length
      : -1
  const expandedGalleryImage =
    normalizedExpandedGalleryIndex >= 0 ? overnightGalleryImages[normalizedExpandedGalleryIndex] : ''

  useEffect(() => {
    if (overnightCarouselCount <= 1) {
      return undefined
    }
    const timer = setInterval(() => {
      setOvernightCarouselIndex((current) => current + 1)
    }, 5000)
    return () => clearInterval(timer)
  }, [overnightCarouselCount])

  useEffect(() => {
    if (overnightGalleryImages.length === 0) {
      return
    }
    const frame = window.requestAnimationFrame(() => {
      const nextNode = galleryItemRefs.current[normalizedGalleryCarouselIndex]
      if (nextNode) {
        nextNode.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' })
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [normalizedGalleryCarouselIndex, overnightGalleryImages.length])

  function scrollGalleryToIndex(nextIndex, behavior = 'smooth') {
    if (overnightGalleryImages.length === 0) {
      return
    }
    const normalizedIndex =
      ((nextIndex % overnightGalleryImages.length) + overnightGalleryImages.length) % overnightGalleryImages.length
    setGalleryCarouselIndex(normalizedIndex)
    const nextNode = galleryItemRefs.current[normalizedIndex]
    if (nextNode) {
      nextNode.scrollIntoView({ behavior, block: 'nearest', inline: 'center' })
    }
  }

  function handleGalleryRailScroll(event) {
    const container = event.currentTarget
    const cards = galleryItemRefs.current.filter(Boolean)
    if (cards.length === 0) {
      return
    }
    const containerCenter = container.scrollLeft + container.clientWidth / 2
    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(cardCenter - containerCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    setGalleryCarouselIndex(closestIndex)
  }

  function updateParent(field, value) {
    setRegistration((current) => ({ ...current, [field]: value }))
  }

  function updateCamper(index, field, value) {
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student, studentIndex) =>
        studentIndex === index
          ? {
              ...student,
              [field]: value,
            }
          : student
      ),
    }))
  }

  function toggleCamperActivity(index, option) {
    setRegistration((current) => ({
      ...current,
      students: current.students.map((student, studentIndex) => {
        if (studentIndex !== index) {
          return student
        }
        const selections = Array.isArray(student.activitySelections) ? student.activitySelections : []
        const nextSelections = selections.includes(option)
          ? selections.filter((item) => item !== option)
          : [...selections, option]
        return {
          ...student,
          activitySelections: nextSelections,
        }
      }),
    }))
  }

  function addCamper() {
    setRegistration((current) => ({
      ...current,
      students: [...current.students, createCamper()],
    }))
  }

  function removeCamper(index) {
    setRegistration((current) => {
      if (current.students.length <= 1) {
        return current
      }
      return {
        ...current,
        students: current.students.filter((_, itemIndex) => itemIndex !== index),
      }
    })
  }

  function clearOvernightForm() {
    setRegistration(createOvernightRegistration())
    setOvernightStep(1)
    setMessage('')
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(OVERNIGHT_REGISTRATION_DRAFT_KEY)
    }
  }

  function setOvernightFieldRef(key, node) {
    if (!key) {
      return
    }
    if (node) {
      overnightFieldRefs.current[key] = node
      return
    }
    delete overnightFieldRefs.current[key]
  }

  function getOvernightValidationMap() {
    const issues = {}
    if (!registration.parentName.trim() || registration.parentName.trim().length < 2) {
      issues.parentName = text('Please enter parent/guardian name.', '请输入家长/监护人姓名。')
    }
    if (!/\S+@\S+\.\S+/.test(registration.contactEmail || '')) {
      issues.contactEmail = text('Please enter a valid email.', '请输入有效邮箱。')
    }
    if (!registration.contactPhone.trim() || registration.contactPhone.trim().length < 7) {
      issues.contactPhone = text('Please enter contact phone.', '请输入联系电话。')
    }
    registration.students.forEach((student, index) => {
      if (!student.fullName.trim()) {
        issues[`student-${index}-fullName`] = text(
          `Please enter camper ${index + 1} full name.`,
          `请输入营员 ${index + 1} 的姓名。`
        )
      }
      if (!student.dob) {
        issues[`student-${index}-dob`] = text(
          `Please enter camper ${index + 1} date of birth.`,
          `请输入营员 ${index + 1} 的出生日期。`
        )
      }
      if (!Array.isArray(student.overnightWeekIds) || student.overnightWeekIds.length === 0) {
        issues[`student-${index}-overnightWeekIds`] = text(
          `Please choose at least one overnight week for camper ${index + 1}.`,
          `请为营员 ${index + 1} 至少选择一个过夜营周次。`
        )
      }
      if (!Array.isArray(student.activitySelections) || student.activitySelections.length === 0) {
        issues[`student-${index}-activitySelections`] = text(
          `Please choose at least one activity interest for camper ${index + 1}.`,
          `请为营员 ${index + 1} 至少选择一项活动偏好。`
        )
      }
    })
    return issues
  }

  function getFirstOvernightMissingFieldKey(stepId = overnightRegistrationSteps.length) {
    const issues = getOvernightValidationMap()
    const orderedKeys = [
      'parentName',
      'contactEmail',
      'contactPhone',
      ...registration.students.flatMap((_, index) => [
        `student-${index}-fullName`,
        `student-${index}-dob`,
      ]),
      ...registration.students.map((_, index) => `student-${index}-overnightWeekIds`),
      ...registration.students.map((_, index) => `student-${index}-activitySelections`),
    ]
    const allowedKeys = orderedKeys.filter((key) => {
      if (stepId <= 1) {
        return key === 'parentName' || key === 'contactEmail' || key === 'contactPhone' || key.includes('-fullName') || key.includes('-dob')
      }
      if (stepId === 2) {
        return !key.includes('-activitySelections')
      }
      return true
    })
    return allowedKeys.find((key) => issues[key]) || ''
  }

  function focusOvernightField(fieldKey) {
    if (!fieldKey) {
      return
    }
    const node = overnightFieldRefs.current[fieldKey]
    if (!node) {
      return
    }
    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (typeof node.focus === 'function') {
      window.setTimeout(() => node.focus({ preventScroll: true }), 80)
    }
  }

  function validate(stepId = overnightRegistrationSteps.length) {
    const firstMissingKey = getFirstOvernightMissingFieldKey(stepId)
    if (!firstMissingKey) {
      return ''
    }
    return getOvernightValidationMap()[firstMissingKey] || ''
  }

  function goToOvernightStep(stepId) {
    const normalizedStep = Math.max(1, Math.min(overnightRegistrationSteps.length, Number(stepId) || 1))
    if (normalizedStep > overnightStep) {
      const validationMessage = validate(normalizedStep - 1)
      if (validationMessage) {
        setMessage(validationMessage)
        focusOvernightField(getFirstOvernightMissingFieldKey(normalizedStep - 1))
        return
      }
    }
    setMessage('')
    setOvernightStep(normalizedStep)
    const stepMissingKey = getFirstOvernightMissingFieldKey(normalizedStep)
    if (stepMissingKey) {
      window.setTimeout(() => focusOvernightField(stepMissingKey), 80)
    }
  }

  async function submitOvernightRegistration(event) {
    event.preventDefault()
    const validationMessage = validate()
    if (validationMessage) {
      setMessage(validationMessage)
      focusOvernightField(getFirstOvernightMissingFieldKey())
      return
    }
    if (!supabaseEnabled || !supabase) {
      setMessage(text('Add your Supabase URL and anon key to submit registrations.', '请先配置 Supabase URL 和 anon key 后再提交报名。'))
      return
    }

    setSubmitting(true)
    setMessage('')

    const firstCamper = registration.students[0]
    const nameParts = splitName(firstCamper?.fullName || '')
    const summaryLines = registration.students.map((student, index) => {
      const selectedWeekIds = Array.isArray(student.overnightWeekIds) ? student.overnightWeekIds : []
      const weekLabels = selectedWeekIds
        .map((selectedId) => overnightWeeks.find((item) => item.id === selectedId))
        .filter(Boolean)
        .map((week) => formatWeekLabel(week))
      const activityLabels = Array.isArray(student.activitySelections) ? student.activitySelections : []
      return `${student.fullName || `Camper ${index + 1}`}: ${weekLabels.length ? weekLabels.join(', ') : 'No week selected'} | Activities: ${activityLabels.length ? activityLabels.join(', ') : 'None selected'}`
    })

    const payload = {
      camper_first_name: nameParts.firstName,
      camper_last_name: nameParts.lastName,
      age: calcAge(firstCamper?.dob),
      experience_level: 'mixed',
      guardian_name: registration.parentName.trim() || 'Parent/Guardian',
      guardian_email: registration.contactEmail.trim(),
      guardian_phone: registration.contactPhone.trim(),
      emergency_contact: registration.contactPhone.trim(),
      medical_notes: JSON.stringify({
        registrationType: 'overnight-only',
        registration,
        overnightDetails: {
          dropoff: 'Sunday 1:00 PM',
          pickup: 'Saturday 4:00 PM',
          location: 'Camp House (Address TBA)',
        },
        totalTuition,
        submittedAt: new Date().toISOString(),
      }),
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('registrations').insert(payload)
    if (error) {
      setSubmitting(false)
      setMessage(text(`Submission failed: ${error.message}`, `提交失败：${error.message}`))
      return
    }

    try {
      const selectedWeekIds = Array.from(
        new Set(
          registration.students.flatMap((student) =>
            Array.isArray(student.overnightWeekIds) ? student.overnightWeekIds : []
          )
        )
      )
      const campWeeks = selectedWeekIds
        .map((weekId) => overnightWeeks.find((week) => week.id === weekId))
        .filter(Boolean)
        .map((week) => ({ start: week.start, end: week.end }))
      const overnightPricingSummary = discountActive
        ? `Week 1: $${Number(overnightDiscountWeekPrice || 0).toFixed(2)}. Week 2 gets an extra $${OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT.toFixed(2)} off for $${Math.max(0, Number(overnightDiscountWeekPrice || 0) - OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT).toFixed(2)}.`
        : `Weekly rate: $${Number(overnightRegularWeekPrice || 0).toFixed(2)}.`
      const paymentPageLink = buildPaymentPageHref(
        {
          registrationType: 'overnight-only',
          guardianName: registration.parentName || 'Parent/Guardian',
          contactEmail: registration.contactEmail || '',
          location: 'Overnight Camp',
          paymentMethod: '',
          summaryLines: [
            'Overnight Camp registration',
            ...summaryLines,
            'Drop-off: Sunday 1:00 PM',
            'Pickup: Saturday 4:00 PM',
            'Location: Camp House (Address TBA)',
            overnightPricingSummary,
            'Tuition covers lodging and food only. Outing costs are billed separately.',
            `Total: $${Number(totalTuition || 0).toFixed(2)}`,
          ],
          amountDue: Number(totalTuition || 0),
          camperNames: registration.students.map((student, index) => student.fullName || `Camper ${index + 1}`),
        },
        { baseUrl: getSiteBaseUrl() }
      )

      await fetch('/api/email/reservation-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enqueue',
          payload: {
            contactEmail: registration.contactEmail,
            contactPhone: registration.contactPhone,
            guardianName: registration.parentName,
            submittedAt: new Date().toISOString(),
            primaryCamperName: registration.students[0]?.fullName || '',
            camperNames: registration.students.map((student, index) => student.fullName || `Camper ${index + 1}`),
            summaryLines: [
              'Overnight Camp registration',
              ...summaryLines,
              `Drop-off: Sunday 1:00 PM`,
              `Pickup: Saturday 4:00 PM`,
              `Location: Camp House (Address TBA)`,
              overnightPricingSummary,
              'Tuition covers lodging and food only. Outing costs are billed separately.',
              `Total: $${Number(totalTuition || 0).toFixed(2)}`,
            ],
            amountDue: Number(totalTuition || 0),
            campWeeks,
            registrationType: 'overnight-only',
            paymentPageLink,
          },
        }),
      })
    } catch {
      // Non-blocking.
    }

    setSubmitting(false)
    setMessage(text('Overnight registration submitted successfully.', '过夜营报名提交成功。'))
    setOvernightStep(1)
    setRegistration(createOvernightRegistration())
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(OVERNIGHT_REGISTRATION_DRAFT_KEY)
    }
  }

  return (
    <main className={`page overnightPage ${isRegistrationView ? 'registrationRoute' : ''}`}>
      <section className="card section overnightHero" id="overnight-top">
        <div className="overnightHeroStickyStack">
          {activeOvernightCarouselImage ? (
            <figure className="sectionMediaBanner overnightHeroCarousel">
              <img
                key={activeOvernightCarouselImage}
                src={getResizedPreviewUrl(activeOvernightCarouselImage, 1600, 900)}
                alt="Overnight camp carousel"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              {overnightCarouselCount > 1 ? (
                <>
                  <button
                    type="button"
                    className="heroGalleryArrow left"
                    onClick={() => setOvernightCarouselIndex((current) => current - 1)}
                    aria-label="Previous overnight photo"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="heroGalleryArrow right"
                    onClick={() => setOvernightCarouselIndex((current) => current + 1)}
                    aria-label="Next overnight photo"
                  >
                    →
                  </button>
                </>
              ) : null}
              <figcaption className="overnightCarouselCaption">
                <strong>{activeOvernightCarouselCaption?.title || 'Overnight Camp'}</strong>
                <span>{activeOvernightCarouselCaption?.text || ''}</span>
              </figcaption>
            </figure>
          ) : null}
          <div className="overnightHeroPinnedTitle">
            <div className="overnightHeroPinnedTitleMain">
              <p className="eyebrow">{text(`${CURRENT_YEAR} Overnight Wushu Camp`, `${CURRENT_YEAR} 过夜武术营`)}</p>
              <h1>{text('Overnight Camp Registration', '过夜营报名')}</h1>
            </div>
            <div className="overnightHeroPinnedLogoBox">
              {config.media.welcomeLogoUrl ? (
                <img className="brandMiniLogo" src={config.media.welcomeLogoUrl} alt="New England Wushu logo" />
              ) : (
                <div className="surveyVisualPlaceholder">Logo</div>
              )}
            </div>
          </div>
        </div>
        <p className="subhead">
          {text(
            'Immersive Sunday-to-Saturday camp life with structured training, team activities, and confidence growth.',
            '从周日到周六的沉浸式营地生活，包含结构化训练、团队活动与自信成长。'
          )}
        </p>
        <div className="pointsGlowBox compact">
          <span className="pointsGlowBadge">{text(`${OVERNIGHT_WEEKLY_POINTS.toLocaleString('en-US')} points per week`, `每周 ${OVERNIGHT_WEEKLY_POINTS.toLocaleString('en-US')} 积分`)}</span>
          <strong>{text('Overnight campers earn 5,000 New England Wushu Level Up points each week.', '每位过夜营学员每周可获得 5,000 新英格兰武术 Level Up 积分。')}</strong>
          <p>{overnightPointsUseCopy}</p>
        </div>
        <div className="campTypeDiscountNote">
          {text('Early offer available through May 20. Reserve your overnight week now.', '早鸟优惠截至 5 月 20 日。立即预订您的过夜营周次。')}
        </div>
        <div className="adminActions">
          {isLandingView ? (
            <>
              <a href="/overnight/register" className="button heroPrimaryCta">
                {discountActive ? text('Claim $200 Off & Register', '领取 200 美元优惠并报名') : text('Start Overnight Registration', '开始过夜营报名')}
              </a>
              <a href="/" className="button secondary">
                {text('Go to Summer Camp Landing Page', '进入夏令营主页')}
              </a>
            </>
          ) : (
            <a href="/overnight" className="button secondary">
              {text('Back to Overnight Landing', '返回过夜营主页')}
            </a>
          )}
        </div>
        {overnightCarouselCount > 1 ? (
          <div className="heroGalleryDots" aria-label="Overnight carousel position">
            {overnightCarouselItems.map((_, index) => (
              <button
                key={`overnight-carousel-dot-${index}`}
                type="button"
                className={`dot ${index === normalizedOvernightCarouselIndex ? 'active' : ''}`}
                onClick={() => setOvernightCarouselIndex(index)}
                aria-label={`Go to overnight photo ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </section>

      <div className="overnightPageContent">

      {isLandingView ? (
      <section className="card section specialOfferCardSection overnightTrainMoreCard" id="overnight-train-more">
        <p className="eyebrow">{text('Train More, Save More', '多练多省')}</p>
        <h2>{text('Train More, Save More', '多练多省')}</h2>
        <p className="subhead">
          {text(
            'Percentage savings are based on full-week General Camp or Competition Boot Camp tuition, not the overnight weekly rate.',
            '百分比优惠按普通营或竞赛集训营的整周学费计算，不按过夜营周价格计算。'
          )}
        </p>
        <p className="subhead">
          {text(
            'If you are signing up for overnight and want to discuss discount options, please contact us directly.',
            '如果您报名过夜营并想了解相关优惠，请直接联系我们。'
          )}
        </p>
      </section>
      ) : null}

      {isLandingView ? (
      <section className="card section overnightGallerySection" id="overnight-gallery">
        <div className="overnightGalleryHeader">
          <div>
            <h2>{text('Overnight Photo Gallery', '过夜营照片图库')}</h2>
            <p className="subhead">{text('Swipe through the gallery or use the arrows. Tap any photo to enlarge.', '左右滑动或使用箭头浏览图片，点击任意照片可放大。')}</p>
          </div>
          {overnightGalleryImages.length > 0 ? (
            <span className="overnightGalleryCount">{text(`${overnightGalleryImages.length} photos`, `${overnightGalleryImages.length} 张照片`)}</span>
          ) : null}
        </div>
        {overnightGalleryImages.length === 0 ? (
          <p className="subhead">{text('Add overnight photos in admin to populate this gallery.', '请在后台上传过夜营图片以显示此图库。')}</p>
        ) : (
          <div className="overnightGalleryRailWrap">
            {overnightGalleryImages.length > 1 ? (
              <button
                type="button"
                className="overnightGalleryEdgeArrow overnightGalleryEdgeArrowLeft"
                onClick={() => scrollGalleryToIndex(galleryCarouselIndex - 1)}
                aria-label="Previous overnight gallery image"
              >
                ←
              </button>
            ) : null}
            <div
              className="overnightGalleryRail"
              onScroll={handleGalleryRailScroll}
            >
              {overnightGalleryImages.map((image, index) => (
                <button
                  key={`overnight-media-${index}`}
                  ref={(node) => {
                    galleryItemRefs.current[index] = node
                  }}
                  type="button"
                  className={`overnightMediaCard overnightMediaThumb ${
                    normalizedGalleryCarouselIndex === index ? 'active' : ''
                  }`}
                  onClick={() => setExpandedGalleryIndex(index)}
                  aria-label={`Open overnight gallery image ${index + 1}`}
                >
                  <div className="surveyContextFrame">
                    <img src={image} alt={`Overnight gallery ${index + 1}`} />
                  </div>
                  <div className="overnightMediaMeta">
                    <strong>Photo {index + 1}</strong>
                    <span>Tap to enlarge</span>
                  </div>
                </button>
              ))}
            </div>
            {overnightGalleryImages.length > 1 ? (
              <button
                type="button"
                className="overnightGalleryEdgeArrow overnightGalleryEdgeArrowRight"
                onClick={() => scrollGalleryToIndex(galleryCarouselIndex + 1)}
                aria-label="Next overnight gallery image"
              >
                →
              </button>
            ) : null}
          </div>
        )}
      </section>
      ) : null}

      {isLandingView && expandedGalleryImage ? (
        <div
          className="overnightLightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded overnight camp photo"
          onClick={() => setExpandedGalleryIndex(-1)}
        >
          <div className="overnightLightboxPanel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="overnightLightboxClose"
              onClick={() => setExpandedGalleryIndex(-1)}
              aria-label="Close enlarged photo"
            >
              ×
            </button>
            {overnightGalleryImages.length > 1 ? (
              <button
                type="button"
                className="heroGalleryArrow left"
                onClick={() => setExpandedGalleryIndex((current) => current - 1)}
                aria-label="Previous photo"
              >
                ←
              </button>
            ) : null}
            <figure className="overnightLightboxFigure">
              <img src={expandedGalleryImage} alt={`Expanded overnight gallery ${normalizedExpandedGalleryIndex + 1}`} />
              <figcaption>
                Photo {normalizedExpandedGalleryIndex + 1} of {overnightGalleryImages.length}. Click outside to close.
              </figcaption>
            </figure>
            {overnightGalleryImages.length > 1 ? (
              <button
                type="button"
                className="heroGalleryArrow right"
                onClick={() => setExpandedGalleryIndex((current) => current + 1)}
                aria-label="Next photo"
              >
                →
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {isLandingView ? (
      <section className="card section overnightScheduleCard" id="overnight-schedule">
        <h2>{text('Overnight Schedule Details', '过夜营日程详情')}</h2>
        <p className="subhead">
          {text(
            'Each overnight day now includes AM, PM, and evening blocks. Outings are mixed with academy training and supervised lodging activities through the week.',
            '每个过夜营日程都包含上午、下午和晚间安排，整周穿插训练、外出活动与住宿点集体活动。'
          )}
        </p>
        <div className="scheduleList overnightScheduleList">
          {overnightWeeklySchedule.map((item) => (
            <article key={`overnight-week-${item.day}`} className="scheduleItem">
              <strong><span className="scheduleDayTag">{item.day}</span></strong>
              <div className="scheduleThemeGrid overnightScheduleThemeGrid">
                <div className="scheduleThemeBlock overnightScheduleThemeBlock overnightScheduleThemeBlock-am">
                  <p className="scheduleThemeLabel">AM Theme</p>
                  <p className="scheduleThemeTitle">{item.am}</p>
                </div>
                <div className="scheduleThemeBlock overnightScheduleThemeBlock overnightScheduleThemeBlock-pm">
                  <p className="scheduleThemeLabel">PM Theme</p>
                  <p className="scheduleThemeTitle">{item.pm}</p>
                </div>
                <div className="scheduleThemeBlock overnightScheduleThemeBlock overnightScheduleThemeBlock-evening">
                  <p className="scheduleThemeLabel">Evening Theme</p>
                  <p className="scheduleThemeTitle">{item.evening}</p>
                </div>
                <div className="scheduleThemeBlock overnightScheduleThemeBlock overnightScheduleThemeBlock-note">
                  <p className="scheduleThemeLabel">Day Notes</p>
                  <p className="scheduleThemeTitle overnightScheduleThemeNote">{item.note}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="weekSummaryGrid">
          <article className="weekSummaryCard">
            <h3>{text('Drop-off', '送达时间')}</h3>
            <p className="subhead">{text('Sunday at 1:00 PM', '周日 下午 1:00')}</p>
          </article>
          <article className="weekSummaryCard">
            <h3>{text('Pick-up', '接回时间')}</h3>
            <p className="subhead">{text('Saturday at 4:00 PM after family & friends BBQ + games (Camp House)', '周六下午 4:00，在家庭烧烤和游戏活动后接回（营地住宿点）')}</p>
          </article>
          <article className="weekSummaryCard">
            <h3>{text('Address', '地址')}</h3>
            <p className="subhead">TBA</p>
          </article>
        </div>
      </section>
      ) : null}

      {isRegistrationView ? (
      <section className="card section" id="overnight-register">
        {config.media.welcomeLogoUrl ? (
          <img className="brandMiniLogo inline" src={config.media.welcomeLogoUrl} alt="New England Wushu logo" />
        ) : null}
        <h2>{text('Register for Overnight Camp', '报名过夜营')}</h2>
        <p className="subhead">
          {text(
            'Three quick steps: camper info, week selection, and activity interests for lodging and outing planning.',
            '三步完成：营员信息、周次选择，以及住宿与外出活动偏好。'
          )}
        </p>
        <article className="overnightPinnedSummaryBox" aria-label="Overnight registration summary">
          <div className="overnightPinnedSummaryHead">
            <div>
              <p className="eyebrow">{text('Pinned Summary', '固定摘要')}</p>
              <h3>{text('Current Overnight Registration', '当前过夜营报名')}</h3>
            </div>
            <span className="overnightPinnedSummaryStep">
              {text(`Step ${overnightStep} of ${overnightRegistrationSteps.length}`, `第 ${overnightStep} 步 / 共 ${overnightRegistrationSteps.length} 步`)}
            </span>
          </div>
          <div className="overnightPinnedSummaryStats">
            <article className="overnightPinnedSummaryStat">
              <span>{text('Campers', '营员人数')}</span>
              <strong>{registration.students.length}</strong>
            </article>
            <article className="overnightPinnedSummaryStat">
              <span>{text('Week enrollments', '报名周次')}</span>
              <strong>{selectedWeekCount}</strong>
            </article>
            <article className="overnightPinnedSummaryStat">
              <span>{text('Tuition so far', '当前学费')}</span>
                      {discountActive && selectedWeekCount > 0 ? (
                        <strong>
                          <span className="crossed">${Number(selectedWeekCount * overnightRegularWeekPrice || 0).toFixed(2)}</span>{' '}
                          ${Number(totalTuition || 0).toFixed(2)}
                        </strong>
                      ) : (
                        <strong>${Number(totalTuition || 0).toFixed(2)}</strong>
                      )}
            </article>
            <article className="overnightPinnedSummaryStat">
              <span>{text('Level Up points', 'Level Up 积分')}</span>
              <strong>{(selectedWeekCount * OVERNIGHT_WEEKLY_POINTS).toLocaleString('en-US')}</strong>
            </article>
          </div>
          <p className="subhead">
            {selectedWeekCount > 0
              ? text(
                  `Each overnight week earns ${OVERNIGHT_WEEKLY_POINTS.toLocaleString('en-US')} New England Wushu Level Up points. ${overnightPointsUseCopy}`,
                  `每个过夜营整周可获得 ${OVERNIGHT_WEEKLY_POINTS.toLocaleString('en-US')} 新英格兰武术 Level Up 积分。${overnightPointsUseCopy}`
                )
              : text('Select weeks to update tuition and New England Wushu Level Up points here.', '选择周次后，此处会更新学费与新英格兰武术 Level Up 积分。')}
          </p>
        </article>
        <div className="overnightRegisterDesktopShell">
        <div className="registrationTabBar overnightRegistrationTabBar">
          <div className="registrationTabs overnightRegistrationTabs" role="tablist" aria-label="Overnight registration steps">
            {overnightRegistrationSteps.map((item) => {
              const validationMessage = validate(item.id)
              const isComplete = !validationMessage
              const showIncomplete = !isComplete
              return (
                <button
                  key={`overnight-step-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={overnightStep === item.id}
                  className={`registrationTab ${item.id === overnightStep ? 'active' : item.id < overnightStep && isComplete ? 'done' : ''} ${showIncomplete ? 'incomplete' : ''}`}
                  onClick={() => goToOvernightStep(item.id)}
                >
                  <span className="registrationTabNumber">{item.id}</span>
                  <span className="registrationTabLabel">{getOvernightStepTitle(item.id)}</span>
                  {showIncomplete ? <span className="registrationStepAlertDot" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>
        </div>
        {loadingConfig ? <p className="subhead">{text('Loading overnight configuration...', '正在加载过夜营配置...')}</p> : null}
        {!loadingConfig && overnightWeeks.length === 0 ? (
          <p className="errorMessage">{text('No overnight weeks are currently configured in admin.', '后台当前尚未配置过夜营周次。')}</p>
        ) : null}
        <form onSubmit={submitOvernightRegistration} className="registrationFields">
          <article className="subCard overnightRegistrationFlowCard">
            <div className="overnightRegistrationFlowHead">
              <div>
                <p className="eyebrow">{text(`Registration Step ${overnightStep}`, `报名步骤 ${overnightStep}`)}</p>
                <h3>{getOvernightStepTitle(overnightStep)}</h3>
              </div>
              {activeOvernightStepImage ? (
                <div className="registrationStepVisual overnightRegistrationStepVisual overnightRegistrationSingleImage">
                  <img
                    src={getResizedPreviewUrl(activeOvernightStepImage, 900, 560)}
                    alt={`Overnight registration step ${overnightStep}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ) : null}
            </div>

            {overnightStep === 1 ? (
              <>
                <p className="requiredFieldHint">{text('Add parent details and camper info here. Use the add camper button to build the group.', '请在这里填写家长信息和营员信息。可使用“添加营员”按钮增加更多营员。')}</p>
                <div className="adminGrid">
                  <label className={overnightValidationMap.parentName ? 'fieldErrorGroup' : ''}>
                    {text('Parent / Guardian Name', '家长 / 监护人姓名')}
                    <input
                      ref={(node) => setOvernightFieldRef('parentName', node)}
                      type="text"
                      value={registration.parentName}
                      onChange={(event) => updateParent('parentName', event.target.value)}
                      placeholder={text('Parent full name', '家长姓名')}
                      className={overnightValidationMap.parentName ? 'fieldIncomplete' : ''}
                      aria-invalid={overnightValidationMap.parentName ? 'true' : 'false'}
                    />
                  </label>
                  <label className={overnightValidationMap.contactEmail ? 'fieldErrorGroup' : ''}>
                    {text('Contact Email', '联系邮箱')}
                    <input
                      ref={(node) => setOvernightFieldRef('contactEmail', node)}
                      type="email"
                      value={registration.contactEmail}
                      onChange={(event) => updateParent('contactEmail', event.target.value)}
                      placeholder={text('name@email.com', 'name@email.com')}
                      className={overnightValidationMap.contactEmail ? 'fieldIncomplete' : ''}
                      aria-invalid={overnightValidationMap.contactEmail ? 'true' : 'false'}
                    />
                  </label>
                  <label className={overnightValidationMap.contactPhone ? 'fieldErrorGroup' : ''}>
                    {text('Contact Phone', '联系电话')}
                    <input
                      ref={(node) => setOvernightFieldRef('contactPhone', node)}
                      type="tel"
                      value={registration.contactPhone}
                      onChange={(event) => updateParent('contactPhone', event.target.value)}
                      placeholder={text('(xxx) xxx-xxxx', '（xxx）xxx-xxxx')}
                      className={overnightValidationMap.contactPhone ? 'fieldIncomplete' : ''}
                      aria-invalid={overnightValidationMap.contactPhone ? 'true' : 'false'}
                    />
                  </label>
                </div>

                <div className="overnightCamperTools">
                  <div className="registrationCamperRow">
                    {registration.students.map((student, index) => (
                      <span key={`overnight-camper-chip-${student.id}`} className="registrationCamperTab active">
                        Camper {index + 1}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="button heroPrimaryCta overnightAddCamperBtn"
                    onClick={addCamper}
                  >
                    {text('+ Add camper', '+ 添加营员')}
                  </button>
                  <button
                    type="button"
                    className="button secondary overnightClearFormBtn"
                    onClick={clearOvernightForm}
                  >
                    {text('Clear form', '清空表单')}
                  </button>
                </div>

                {registration.students.map((student, index) => (
                  <article key={student.id || `overnight-student-${index}`} className="subCard">
                    <div className="overnightCamperCardHead">
                      <h3>{text(`Camper ${index + 1}`, `营员 ${index + 1}`)}</h3>
                      {registration.students.length > 1 ? (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => removeCamper(index)}
                        >
                          {text('Remove camper', '移除此营员')}
                        </button>
                      ) : null}
                    </div>
                    <div className="adminGrid">
                      <label className={overnightValidationMap[`student-${index}-fullName`] ? 'fieldErrorGroup' : ''}>
                        {text('Camper full name', '营员姓名')}
                        <input
                          ref={(node) => setOvernightFieldRef(`student-${index}-fullName`, node)}
                          type="text"
                          value={student.fullName}
                          onChange={(event) => updateCamper(index, 'fullName', event.target.value)}
                          placeholder={text('Camper full name', '营员姓名')}
                          className={overnightValidationMap[`student-${index}-fullName`] ? 'fieldIncomplete' : ''}
                          aria-invalid={overnightValidationMap[`student-${index}-fullName`] ? 'true' : 'false'}
                        />
                      </label>
                      <label className={overnightValidationMap[`student-${index}-dob`] ? 'fieldErrorGroup' : ''}>
                        {text('Date of birth', '出生日期')}
                        <div className="dobInputRow">
                          <input
                            ref={(node) => setOvernightFieldRef(`student-${index}-dob`, node)}
                            type="date"
                            value={student.dob}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={(event) => updateCamper(index, 'dob', event.target.value)}
                            className={overnightValidationMap[`student-${index}-dob`] ? 'fieldIncomplete' : ''}
                            aria-invalid={overnightValidationMap[`student-${index}-dob`] ? 'true' : 'false'}
                          />
                          <select
                            aria-label={`Birth year for camper ${index + 1}`}
                            value={getDobYear(student.dob)}
                            onChange={(event) => updateCamper(index, 'dob', setDobYear(student.dob, event.target.value))}
                            className={overnightValidationMap[`student-${index}-dob`] ? 'fieldIncomplete' : ''}
                            aria-invalid={overnightValidationMap[`student-${index}-dob`] ? 'true' : 'false'}
                          >
                            <option value="">{text('Birth year', '出生年份')}</option>
                            {DOB_YEAR_OPTIONS.map((year) => (
                              <option key={`overnight-dob-year-${index}-${year}`} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                      </label>
                      <label>
                        {text('Allergies', '过敏信息')}
                        <input
                          type="text"
                          value={student.allergies}
                          onChange={(event) => updateCamper(index, 'allergies', event.target.value)}
                          placeholder={text('None / list allergies', '无 / 请列出过敏信息')}
                        />
                      </label>
                      <label>
                        {text('Medication', '药物信息')}
                        <input
                          type="text"
                          value={student.medication}
                          onChange={(event) => updateCamper(index, 'medication', event.target.value)}
                          placeholder={text('None / list medication', '无 / 请列出药物信息')}
                        />
                      </label>
                      <label>
                        {text('Previous injury', '既往受伤史')}
                        <input
                          type="text"
                          value={student.previousInjury}
                          onChange={(event) => updateCamper(index, 'previousInjury', event.target.value)}
                          placeholder={text('None / relevant injury history', '无 / 请填写相关受伤史')}
                        />
                      </label>
                      <label>
                        {text('Health notes', '健康备注')}
                        <input
                          type="text"
                          value={student.healthNotes}
                          onChange={(event) => updateCamper(index, 'healthNotes', event.target.value)}
                          placeholder={text('Anything coaches should know', '教练需要了解的健康信息')}
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </>
            ) : null}

            {overnightStep === 2 ? (
              <>
                <p className="requiredFieldHint">{text('Choose every overnight week each camper wants. Weeks can differ by camper.', '请为每位营员选择想参加的过夜营周次。不同营员可选择不同周次。')}</p>
                <div className="pointsGlowBox compact">
                  <span className="pointsGlowBadge">{text('New England Wushu Level Up points', '新英格兰武术 Level Up 积分')}</span>
                  <strong>{text(`${OVERNIGHT_WEEKLY_POINTS.toLocaleString('en-US')} points are earned for each overnight week per camper.`, `每位营员每个过夜营整周可获得 ${OVERNIGHT_WEEKLY_POINTS.toLocaleString('en-US')} 积分。`)}</strong>
                  <p>{overnightPointsUseCopy}</p>
                </div>
                {registration.students.map((student, index) => (
                  <article key={`overnight-weeks-${student.id}`} className="subCard">
                    <h3>{student.fullName?.trim() || text(`Camper ${index + 1}`, `营员 ${index + 1}`)}</h3>
                    <div
                      ref={(node) => setOvernightFieldRef(`student-${index}-overnightWeekIds`, node)}
                      className={`overnightWeekCheckboxes ${
                        overnightValidationMap[`student-${index}-overnightWeekIds`] ? 'fieldIncompleteGroup' : ''
                      }`}
                    >
                      {overnightWeeks.map((week) => {
                        const checked = Array.isArray(student.overnightWeekIds)
                          ? student.overnightWeekIds.includes(week.id)
                          : false
                        return (
                          <label key={`overnight-week-${student.id}-${week.id}`} className="overnightWeekCheckbox">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                const currentWeekIds = Array.isArray(student.overnightWeekIds)
                                  ? student.overnightWeekIds
                                  : []
                                const nextWeekIds = event.target.checked
                                  ? [...currentWeekIds, week.id]
                                  : currentWeekIds.filter((item) => item !== week.id)
                                updateCamper(index, 'overnightWeekIds', nextWeekIds)
                              }}
                            />
                            <span>{formatWeekLabel(week)}</span>
                          </label>
                        )
                      })}
                    </div>
                    <small className="subhead">{text('Check every week this camper wants to attend.', '勾选该营员想参加的每一个周次。')}</small>
                    {Array.isArray(student.overnightWeekIds) && student.overnightWeekIds.length > 0 ? (
                      <p className="subhead">
                        {text('Selected:', '已选择：')}{' '}
                        <strong>
                          {student.overnightWeekIds
                            .map((selectedId) => overnightWeeks.find((item) => item.id === selectedId))
                            .filter(Boolean)
                            .map((week) => formatWeekLabel(week))
                            .join(' · ')}
                        </strong>
                      </p>
                    ) : null}
                  </article>
                ))}
              </>
            ) : null}

            {overnightStep === 3 ? (
              <>
                <p className="requiredFieldHint">
                  {text(
                    'Choose activity interests for each camper. These selections are used when planning lodging activities for the week and outings.',
                    '请为每位营员选择活动偏好，这些选项将用于安排住宿期间活动和外出计划。'
                  )}
                </p>
                {registration.students.map((student, index) => (
                  <article key={`overnight-activities-${student.id}`} className="subCard">
                    <h3>{student.fullName?.trim() || text(`Camper ${index + 1}`, `营员 ${index + 1}`)}</h3>
                    <div
                      ref={(node) => setOvernightFieldRef(`student-${index}-activitySelections`, node)}
                      className={`overnightActivityGrid ${
                        overnightValidationMap[`student-${index}-activitySelections`] ? 'fieldIncompleteGroup' : ''
                      }`}
                    >
                      {overnightActivityOptions.map((option) => {
                        const selected = Array.isArray(student.activitySelections)
                          ? student.activitySelections.includes(option)
                          : false
                        return (
                          <button
                            key={`overnight-activity-${student.id}-${option}`}
                            type="button"
                            className={`overnightActivityChip ${selected ? 'selected' : ''}`}
                            onClick={() => toggleCamperActivity(index, option)}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                    {Array.isArray(student.activitySelections) && student.activitySelections.length > 0 ? (
                      <p className="subhead">
                        {text('Selected interests:', '已选偏好：')} <strong>{student.activitySelections.join(' · ')}</strong>
                      </p>
                    ) : null}
                  </article>
                ))}

                <article className="subCard overnightInvoiceCard">
                  <div className="overnightInvoiceHeader">
                    <h3>{text('Enrollment Summary', '报名摘要')}</h3>
                    <p className="subhead">
                      {text(
                        `Regular rate is $${OVERNIGHT_REGULAR_WEEK_PRICE} per week. Early rate is $${OVERNIGHT_DISCOUNT_WEEK_PRICE} per week through May 20, and week 2 is $${OVERNIGHT_DISCOUNT_WEEK_PRICE - OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT}.`,
                        `原价为每周 $${OVERNIGHT_REGULAR_WEEK_PRICE}。当前早鸟价截至 5 月 20 日为每周 $${OVERNIGHT_DISCOUNT_WEEK_PRICE}，第 2 周为 $${OVERNIGHT_DISCOUNT_WEEK_PRICE - OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT}。`
                      )}
                    </p>
                  </div>
                  <div className="pointsGlowBox compact">
                    <span className="pointsGlowBadge">
                      {text(
                        `${(selectedWeekCount * OVERNIGHT_WEEKLY_POINTS).toLocaleString('en-US')} points selected`,
                        `已选 ${(selectedWeekCount * OVERNIGHT_WEEKLY_POINTS).toLocaleString('en-US')} 积分`
                      )}
                    </span>
                    <strong>
                      {text(
                        `Each overnight week earns ${OVERNIGHT_WEEKLY_POINTS.toLocaleString('en-US')} New England Wushu Level Up points.`,
                        `每个过夜营整周可获得 ${OVERNIGHT_WEEKLY_POINTS.toLocaleString('en-US')} 新英格兰武术 Level Up 积分。`
                      )}
                    </strong>
                    <p>{overnightPointsUseCopy}</p>
                  </div>
                  <div className="overnightInvoiceStats">
                    <article className="overnightInvoiceStat">
                      <span>{text('Overnight week rate', '过夜营周价格')}</span>
                      <strong>
                        {discountActive ? (
                          <>
                            <span className="crossed">${Number(overnightRegularWeekPrice || 0).toFixed(2)}</span>{' '}
                            ${Number(overnightDiscountWeekPrice || 0).toFixed(2)}
                          </>
                        ) : (
                          `$${Number(overnightWeekPrice || 0).toFixed(2)}`
                        )}
                      </strong>
                    </article>
                    <article className="overnightInvoiceStat">
                      <span>{text('Second week special', '第二周特惠')}</span>
                      <strong>
                        {discountActive
                          ? text(
                              `$${OVERNIGHT_DISCOUNT_WEEK_PRICE - OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT} total ($${OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT} extra off)`,
                              `总价 $${OVERNIGHT_DISCOUNT_WEEK_PRICE - OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT}（再减 $${OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT}）`
                            )
                          : text('Available during early offer', '早鸟优惠期间生效')}
                      </strong>
                    </article>
                    <article className="overnightInvoiceStat">
                      <span>{text('Week enrollments selected', '已选周次数')}</span>
                      <strong>{selectedWeekCount}</strong>
                    </article>
                  </div>
                  <div className="overnightInvoiceModel">
                    <p className="subhead">
                      Includes 7 days of lodging, 7 days of meals, and 7 days of academy training. Does not include outing
                      prices, tickets, external activity costs, or the Friday family & friends BBQ.
                    </p>
                    <p className="subhead">
                      Published overnight full week rate: ${Number(suggestedOvernightWeekPrice || 0).toFixed(2)} regular,
                      ${Number(overnightDiscountWeekPrice || 0).toFixed(2)} for week 1 during the early offer, and
                      ${Math.max(0, Number(overnightDiscountWeekPrice || 0) - OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT).toFixed(2)}
                      for week 2.
                    </p>
                  </div>
                  {discountActive ? (
                    <div className="overnightDiscountPulse">
                      {text('Early-offer savings active:', '早鸟优惠生效中：')} <strong>{text(`$${OVERNIGHT_DISCOUNT_AMOUNT.toFixed(2)} off each week, with week 2 getting $${(OVERNIGHT_DISCOUNT_AMOUNT + OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT).toFixed(2)} off total`, `每周减 $${OVERNIGHT_DISCOUNT_AMOUNT.toFixed(2)}，第 2 周合计减 $${(OVERNIGHT_DISCOUNT_AMOUNT + OVERNIGHT_SECOND_WEEK_EXTRA_DISCOUNT).toFixed(2)}`)}</strong>
                    </div>
                  ) : null}
                  <div className="overnightInvoiceTable">
                    <div className="overnightInvoiceRow head">
                      <span>{text('Camper', '营员')}</span>
                      <span>{text('Weeks', '周次')}</span>
                      <span>{text('Pricing', '价格')}</span>
                      <span>{text('Subtotal', '小计')}</span>
                    </div>
                    {perCamperInvoiceRows.map((row, rowIndex) => (
                      <div key={`invoice-${rowIndex}`} className="overnightInvoiceRow">
                        <span>{row.label}</span>
                        <span>{row.weeksSelected}</span>
                        <span>
                          {row.weeksSelected >= 2 && discountActive
                            ? `$${Number(row.discountedRate || 0).toFixed(2)} + 2nd week $${Number(row.secondWeekRate || 0).toFixed(2)}`
                            : `$${Number((discountActive ? row.discountedRate : row.regularRate) || 0).toFixed(2)}`}
                        </span>
                        <span>
                          {discountActive && row.weeksSelected > 0 ? (
                            <>
                              <span className="crossed">${Number(row.regularSubtotal || 0).toFixed(2)}</span>{' '}
                              ${Number(row.subtotal).toFixed(2)}
                            </>
                          ) : (
                            `$${Number(row.subtotal).toFixed(2)}`
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="subhead">
                    {text('Current tuition total:', '当前学费总计：')}{' '}
                    <strong>
                      {discountActive && selectedWeekCount > 0 ? (
                        <>
                          <span className="crossed">${Number(perCamperInvoiceRows.reduce((sum, row) => sum + row.regularSubtotal, 0) || 0).toFixed(2)}</span>{' '}
                          ${Number(totalTuition || 0).toFixed(2)}
                        </>
                      ) : (
                        `$${Number(totalTuition || 0).toFixed(2)}`
                      )}
                    </strong>
                  </p>
                  <p className="subhead">
                    {text(
                      'Drop-off: Sunday 1:00 PM · Saturday 4:00 PM family & friends BBQ + games, then pick-up (Camp House) · Address: TBA',
                      '送达：周日下午 1:00 · 接回：周六下午 4:00，在家庭烧烤和游戏活动后于营地住宿点接回 · 地址：待定'
                    )}
                  </p>
                </article>
              </>
            ) : null}
          </article>

          <div className="adminActions overnightStepActions">
            {overnightStep > 1 ? (
              <button type="button" className="button secondary" onClick={() => goToOvernightStep(overnightStep - 1)}>
                {text('Back', '返回')}
              </button>
            ) : <span />}
            {overnightStep < overnightRegistrationSteps.length ? (
              <button type="button" className="button heroPrimaryCta" onClick={() => goToOvernightStep(overnightStep + 1)}>
                {text('Next step', '下一步')}
              </button>
            ) : (
              <button type="submit" className="button heroPrimaryCta" disabled={submitting}>
                {submitting ? text('Submitting...', '提交中...') : text('Submit Overnight Registration', '提交过夜营报名')}
              </button>
            )}
          </div>
        </form>
        </div>
        {message ? <p className="subhead">{message}</p> : null}
      </section>
      ) : null}
      </div>

      {isLandingView && overnightDiscountCountdown ? (
        <div
          className="discountCountdownDock mobileStrip overnightDiscountCountdownDock"
          aria-label="Overnight discount countdown"
        >
          <div className="discountCountdownMeta single">
            <p className="discountAmountHero">
              ${OVERNIGHT_DISCOUNT_AMOUNT.toFixed(0)}
              <span>{text('off', '优惠')}</span>
            </p>
            <div className="discountCountdownBoxes" aria-label="Countdown timer">
              <div className="discountTimeBox">
                <span className="discountTimeValue">{overnightDiscountCountdown.days}</span>
                <span className="discountTimeLabel">D</span>
              </div>
              <div className="discountTimeBox">
                <span className="discountTimeValue">{String(overnightDiscountCountdown.hours).padStart(2, '0')}</span>
                <span className="discountTimeLabel">H</span>
              </div>
              <div className="discountTimeBox">
                <span className="discountTimeValue">{String(overnightDiscountCountdown.minutes).padStart(2, '0')}</span>
                <span className="discountTimeLabel">M</span>
              </div>
              <div className="discountTimeBox">
                <span className="discountTimeValue">{String(overnightDiscountCountdown.seconds).padStart(2, '0')}</span>
                <span className="discountTimeLabel">S</span>
              </div>
            </div>
            <span>{text('Ends on', '截止')} {overnightDiscountCountdown.endLabel}</span>
          </div>
        </div>
      ) : null}
      {isLandingView ? (
        <nav className="mobileSectionNav overnightMobileSectionNav" aria-label="Overnight section navigation">
          <a href="#overnight-top">{text('Top', '顶部')}</a>
          <a href="#overnight-gallery">{text('Gallery', '图库')}</a>
          <a href="#overnight-schedule">{text('Schedule', '日程')}</a>
          <a href="/overnight/register">{text('Register', '报名')}</a>
          <a href="/overnight/register" className="overnightMobileDiscountBtn">
            {discountActive ? text('Claim $200 Off', '领取 200 美元优惠') : text('Register Now', '立即报名')}
          </a>
        </nav>
      ) : null}
      {isLandingView ? (
      <a className="overnightMobileDayCampLink" href="/">
        {text('Go to Summer Camp Landing Page', '进入夏令营主页')}
      </a>
      ) : null}
      {isRegistrationView ? (
      <nav className="mobileRegistrationStepBar overnightMobileRegistrationStepBar" aria-label="Overnight registration steps">
        <div className="mobileRegistrationFlowRibbon overnightRegistrationFlowRibbon">{text('Registering for Overnight Camp', '正在报名过夜营')}</div>
        {overnightRegistrationSteps.map((item) => {
          const validationMessage = validate(item.id)
          const isComplete = !validationMessage
          const isMissing = !isComplete
          const isActive = overnightStep === item.id
          const showIncomplete = isMissing
          return (
            <button
              key={`overnight-mobile-step-${item.id}`}
              type="button"
              className={`mobileRegistrationStepBtn ${isActive ? 'active' : ''} ${
                item.id < overnightStep && isComplete ? 'done' : ''
              } ${showIncomplete ? 'incomplete' : ''}`}
              onClick={() => goToOvernightStep(item.id)}
              aria-current={isActive ? 'step' : undefined}
            >
              <span className="mobileRegistrationStepNumber">{item.id}</span>
              <span className="mobileRegistrationStepLabel">{getOvernightStepTitle(item.id)}</span>
              {showIncomplete ? <span className="mobileRegistrationStepDot" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </nav>
      ) : null}
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
    </main>
  )
}

export default function OvernightLandingPage() {
  return <OvernightCampPage view="landing" />
}
