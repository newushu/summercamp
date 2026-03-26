export const defaultAdminConfig = {
  media: {
    heroImageUrl: '',
    welcomeLogoUrl: '',
    surveyVideoUrl: '',
    surveyStep1FlyerUrl: '',
    surveyMobileBgUrl: '',
    surveyStepImageUrls: ['', '', '', '', '', ''],
    surveyStepImagePositions: Array.from({ length: 6 }).map(() => ({ x: 0, y: 0 })),
    landingCarouselImagePositions: Array.from({ length: 4 }).map(() => ({ x: 0, y: 0, zoom: 100 })),
    registrationStepImageUrls: ['', '', '', ''],
    burlingtonFacilityImageUrls: ['', '', '', '', '', ''],
    actonFacilityImageUrls: ['', '', '', '', '', ''],
    wellesleyFacilityImageUrls: ['', '', '', '', '', ''],
    overnightLandingImageUrls: ['', '', '', '', '', ''],
    overnightGalleryImageUrls: [],
    overnightRegistrationImageUrls: ['', '', ''],
    levelUpImageUrl: '',
    levelUpScreenshotUrls: [],
    levelUpScreenshotPositions: Array.from({ length: 5 }).map(() => ({ x: 0, y: 0, zoom: 100 })),
    levelUpScreenshotSize: 100,
    wechatQrUrl: '',
  },
  emailJourney: [
    {
      dayLabel: 'Immediately',
      title: 'Step 1 - Summer Camp Follow-Up',
      subject: 'Still Thinking About Summer Camp? Here Are the Highlights',
      videoUrl: '',
      body: 'Hi {parent_name},\n\nWe noticed you checked out New England Wushu Summer Camp and wanted to send a quick follow-up in case you did not get to finish.\n\nFamilies usually choose us for four big reasons: strong coaching, fun team energy, lunch convenience, and daily photo/video updates through the Level Up app.\n\nA strong fit based on what we saw so far:\n{recommended_plan}\n\nYou can pick back up here anytime:\n{registration_link}\n\nIf you want help choosing the best weeks, just reply and we will guide you.',
    },
    {
      dayLabel: 'Day 1',
      title: 'Step 2 - Best-Fit Plan Reminder',
      subject: 'Your Recommended Camp Plan + Next Steps',
      videoUrl: '',
      body: 'Hi {parent_name},\n\nQuick follow-up from our team. We can help you lock in the schedule that best matches your goals.\n\nRecommended fit:\n{recommended_plan}\n\nRegistration takes only a few minutes:\n{registration_link}\n\nIf you want help picking weeks, just reply and we will guide you.',
    },
    {
      dayLabel: 'Day 3',
      title: 'Step 3 - Social Proof + Confidence',
      subject: 'Why Families Choose New England Wushu Summer Camp',
      videoUrl: '',
      body: 'Hi {parent_name},\n\nFamilies tell us they value three things most: coaching quality, visible progress, and a positive team environment.\n\nYour camper can start with a plan matched to age and experience:\n{recommended_plan}\n\nStart registration when ready:\n{registration_link}\n\nWe are happy to answer any questions before you submit.',
    },
    {
      dayLabel: 'Day 5',
      title: 'Step 4 - Logistics + Readiness',
      subject: 'Camp Logistics Made Easy: Schedule, Lunch, and Daily Updates',
      videoUrl: '',
      body: 'Hi {parent_name},\n\nTo make camp easier for families, we provide clear weekly scheduling, lunch options, and ongoing updates.\n\nYou can complete registration here:\n{registration_link}\n\nRecommended fit from your survey:\n{recommended_plan}\n\nIf you prefer, reply and we can help you choose the best starting weeks.',
    },
    {
      dayLabel: 'Day 7',
      title: 'Step 5 - Final Invitation',
      subject: 'Final Invitation: Reserve Your Preferred Summer Camp Weeks',
      videoUrl: '',
      body: 'Hi {parent_name},\n\nFinal check-in from us. If you still want a summer camp plan tailored to your goals, we would love to welcome your family.\n\nRecommended plan:\n{recommended_plan}\n\nComplete registration:\n{registration_link}\n\nIf now is not the right time, no problem. You can always return when ready.',
    },
  ],
  testimonials: [
    {
      studentName: 'Ethan, age 9',
      headline: 'From shy beginner to confident performer',
      highlights: ['Confidence', 'Flexibility', 'Showcase'],
      story:
        'Ethan joined General Camp with no prior martial arts experience. After two weeks of structured coaching, he improved flexibility, focus, and confidence, then completed the Friday showcase in front of families with a big smile.',
      outcome:
        'Parent shared the coaches were excellent with kids, communication was clear, and Ethan left each day confident and excited.',
    },
    {
      studentName: 'Ava, age 8',
      headline: 'Lunch was easy, and every day felt meaningful',
      highlights: ['Daily Routine', 'Skill Growth', 'Coach Support'],
      story:
        'Ava attended General Camp for three weeks. Her family loved the lunch convenience ahead of time, and Ava came home each day talking about team games, new skills, and how much fun she had with her coaches.',
      outcome:
        'Parent said lunch convenience was so nice, the coaches were amazing with kids, and Ava asked to come back next summer.',
    },
    {
      studentName: 'Noah, age 10',
      headline: 'Coaches who care and a reward system kids love',
      highlights: ['Motivation', 'Discipline', 'Teamwork'],
      story:
        'Noah joined General Camp to stay active and build confidence. He quickly connected with a really good group of kids, and the coaches were encouraging, patient, and excellent with children.',
      outcome:
        'Parent reported stronger confidence, great coach support, and felt very good seeing Noah in such a positive camp community.',
    },
    {
      studentName: 'Mia, age 7',
      headline: 'From first-week nerves to independent confidence',
      highlights: ['First-Time Camper', 'Confidence', 'Independence'],
      story:
        'Mia started camp feeling shy about joining group activities. By the second week, she had bonded with really kind kids, joined partner drills, and proudly showed new techniques during Friday showcase.',
      outcome:
        'Parent shared that the coaches were very good with kids, Mia felt included, and confidence at home improved quickly.',
    },
    {
      studentName: 'Lucas, age 11',
      headline: 'Athletic focus and visible weekly progress',
      highlights: ['Athletic Development', 'Focus', 'Consistency'],
      story:
        'Lucas joined to improve coordination and conditioning for multiple sports. The structured schedule helped him build balance, speed, and control, and he stayed engaged through clear weekly goals.',
      outcome:
        'Parent said coaches pushed progress in the right way, were very good with kids, and made the family feel confident about camp each week.',
    },
    {
      studentName: 'Sophie, age 8',
      headline: 'Strong routines and happy social growth',
      highlights: ['Routine', 'Social Growth', 'Coach Quality'],
      story:
        'Sophie joined camp to stay active and improve focus. She quickly made friends with great kids, and her family loved how structured each day felt.',
      outcome:
        'Parent said the coaches were excellent with kids, communication was clear, and Sophie came home proud and energized.',
    },
    {
      studentName: 'Li Wei (李薇), age 9',
      headline: 'Disciplined training with caring support',
      highlights: ['Discipline', 'Skill Progress', 'Care'],
      story:
        'Li Wei started with beginner-level technique goals and grew quickly through daily drills, partner work, and positive team culture.',
      outcome:
        'Parent shared the coaches were very good with kids, gave thoughtful feedback, and made the family feel confident week after week.',
    },
  ],
  campTypeShowcase: {
    general: {
      title: 'General Camp',
      summary: 'Ages 3+ summer camp with flexible full week, full day, AM, and PM options.',
      suitedFor: 'Best for beginners and returning campers. Campers are grouped by age and level for safe, steady progression.',
      highlights: [
        'Try core Wushu elements in a fun, beginner-friendly way.',
        'Build confidence, balance, focus, and discipline week by week.',
        'Stay active every day with games, movement drills, and coach guidance.',
      ],
      media: [
        { url: '', caption: 'Team-building activities that keep campers connected, active, and smiling together.', tone: 'general' },
        { url: '', caption: 'Great for all age groups and experience levels, with safe progression week after week.', tone: 'general' },
        { url: '', caption: 'Convenient lunch via the Level Up app, or just message us. $12 per day.', tone: 'lunch' },
      ],
    },
    bootcamp: {
      title: 'Boot Camp (Taolu Competition Team)',
      summary: 'National and international Taolu pathway with focused weekly training options.',
      suitedFor: 'Great for athletes targeting national/international Taolu track development and serious competition preparation.',
      highlights: [
        'Many of our national and international team members train in this Boot Camp.',
        'Train Taolu routines with competition-level coaching and corrections.',
        'Sharpen power, precision, flexibility, and performance quality.',
        'Prepare through structured goals for national/international track readiness.',
      ],
      media: [
        { url: '', caption: 'Taolu competition-ready training built for strong future achievements.', tone: 'bootcamp' },
        { url: '', caption: 'High-standard coaching, focused repetition, and structured goals for serious athletes.', tone: 'bootcamp' },
        { url: '', caption: 'Convenient lunch via the Level Up app, or just message us. $12 per day.', tone: 'lunch' },
      ],
    },
    overnight: {
      title: 'Overnight Camp',
      summary: 'Immersive Sunday-Saturday overnight weeks with training, lodging, outings, and meals included.',
      suitedFor: 'Great for families who want a deeper camp-life experience with intensive training, independence, and team bonding.',
      highlights: [
        'Build independence and resilience in a supervised camp-life setting.',
        'Train, bond, and grow through full-week immersive structure.',
        'Lodging includes supervised routines, indoor amenities, and outdoor activity space.',
        'Limited spots each week for higher coach attention and stronger group bonding.',
      ],
      media: [
        { url: '', caption: 'Fun outdoor activities and outings are built into the overnight experience.', tone: 'overnight' },
        { url: '', caption: 'Lodging plus 7 days of fun, with all meals included throughout the week.', tone: 'overnight' },
        { url: '', caption: 'Convenient lunch via the Level Up app, or just message us. $12 per day.', tone: 'lunch' },
      ],
    },
  },
  tuition: {
    regular: {
      fullWeek: 0,
      fullDay: 0,
      amHalf: 0,
      pmHalf: 0,
      overnightWeek: 1180,
      overnightDay: 0,
    },
    discount: {
      fullWeek: 0,
      fullDay: 0,
      amHalf: 0,
      pmHalf: 0,
      overnightWeek: 980,
      overnightDay: 0,
    },
    bootcamp: {
      regular: {
        fullWeek: 0,
        fullDay: 0,
        amHalf: 0,
        pmHalf: 0,
      },
      discount: {
        fullWeek: 0,
        fullDay: 0,
        amHalf: 0,
        pmHalf: 0,
      },
    },
    discountEndDate: '2026-05-20',
    discountDisplayValue: '$200 off overnight week 1 + extra $100 off week 2',
    discountCode: '',
    lunchPrice: 14,
    bootcampPremiumPct: 25,
    siblingDiscountPct: 10,
    businessName: 'New England Wushu',
    businessAddress: '',
  },
  programs: {
    general: {
      startDate: '',
      endDate: '',
      selectedWeeks: [],
      actonSelectedWeeks: [],
      wellesleySelectedWeeks: [],
    },
    bootcamp: {
      startDate: '',
      endDate: '',
      selectedWeeks: [],
    },
    overnight: {
      startDate: '',
      endDate: '',
      selectedWeeks: [],
    },
  },
  locations: {
    burlington: { enabled: true, street: '', city: 'Burlington', state: 'MA', zip: '' },
    acton: { enabled: true, street: '', city: 'Acton', state: 'MA', zip: '' },
    wellesley: { enabled: true, street: '', city: 'Wellesley', state: 'MA', zip: '' },
  },
}

const campTypeShowcaseKeys = ['general', 'bootcamp', 'overnight']
const campTypeMediaTones = new Set(['general', 'bootcamp', 'overnight', 'lunch'])

const programRules = {
  general: { startWeekday: 1, durationDays: 5 },
  bootcamp: { startWeekday: 1, durationDays: 5 },
  overnight: { startWeekday: 0, durationDays: 7 },
}

function parseDate(input) {
  if (!input) {
    return null
  }

  const parsed = new Date(`${input}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function findWeekdayOnOrAfter(startDate, weekday) {
  const result = new Date(startDate)
  while (result.getDay() !== weekday) {
    result.setDate(result.getDate() + 1)
  }
  return result
}

export function formatDateLabel(input) {
  const parsed = parseDate(input)
  if (!parsed) {
    return ''
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatWeekLabel(week) {
  return `${formatDateLabel(week.start)} - ${formatDateLabel(week.end)}`
}

export function roundTuitionToFive(value) {
  const next = Math.round(Number(value || 0) / 5) * 5
  return Number.isFinite(next) ? Math.max(0, next) : 0
}

export function deriveBootcampTuition(tuition = {}) {
  const premiumFactor = 1 + Number(tuition?.bootcampPremiumPct || 0) / 100
  const derive = (value) => roundTuitionToFive(Number(value || 0) * premiumFactor)

  return {
    regular: {
      fullWeek: derive(tuition?.regular?.fullWeek),
      fullDay: derive(tuition?.regular?.fullDay),
      amHalf: derive(tuition?.regular?.amHalf),
      pmHalf: derive(tuition?.regular?.pmHalf),
    },
    discount: {
      fullWeek: derive(tuition?.discount?.fullWeek),
      fullDay: derive(tuition?.discount?.fullDay),
      amHalf: derive(tuition?.discount?.amHalf),
      pmHalf: derive(tuition?.discount?.pmHalf),
    },
  }
}

export function resolveBootcampTuition(tuition = {}) {
  const derived = deriveBootcampTuition(tuition)
  const explicit = tuition?.bootcamp || {}

  const pick = (rateType, key) => {
    const value = Number(explicit?.[rateType]?.[key])
    return Number.isFinite(value) && value > 0 ? value : derived[rateType][key]
  }

  return {
    regular: {
      fullWeek: pick('regular', 'fullWeek'),
      fullDay: pick('regular', 'fullDay'),
      amHalf: pick('regular', 'amHalf'),
      pmHalf: pick('regular', 'pmHalf'),
    },
    discount: {
      fullWeek: pick('discount', 'fullWeek'),
      fullDay: pick('discount', 'fullDay'),
      amHalf: pick('discount', 'amHalf'),
      pmHalf: pick('discount', 'pmHalf'),
    },
  }
}

function normalizeProgram(program = {}) {
  return {
    startDate: typeof program.startDate === 'string' ? program.startDate : '',
    endDate: typeof program.endDate === 'string' ? program.endDate : '',
    selectedWeeks: Array.isArray(program.selectedWeeks)
      ? program.selectedWeeks.filter((value) => typeof value === 'string')
      : [],
    actonSelectedWeeks: Array.isArray(program.actonSelectedWeeks)
      ? program.actonSelectedWeeks.filter((value) => typeof value === 'string')
      : [],
    wellesleySelectedWeeks: Array.isArray(program.wellesleySelectedWeeks)
      ? program.wellesleySelectedWeeks.filter((value) => typeof value === 'string')
      : [],
  }
}

function normalizeLocationAddress(loc = {}, defaultCity = '') {
  return {
    enabled: typeof loc.enabled === 'boolean' ? loc.enabled : true,
    street: typeof loc.street === 'string' ? loc.street : '',
    city: typeof loc.city === 'string' && loc.city.trim() ? loc.city : defaultCity,
    state: typeof loc.state === 'string' && loc.state.trim() ? loc.state : 'MA',
    zip: typeof loc.zip === 'string' ? loc.zip : '',
  }
}

export function mergeAdminConfig(raw = {}) {
  const screenshotUrls = Array.isArray(raw.media?.levelUpScreenshotUrls)
    ? raw.media.levelUpScreenshotUrls.filter((value) => typeof value === 'string')
    : []
  const surveyStepImageUrlsRaw = Array.isArray(raw.media?.surveyStepImageUrls)
    ? raw.media.surveyStepImageUrls.filter((value) => typeof value === 'string')
    : []
  const surveyStepImageUrls = Array.from({ length: 6 }).map((_, index) => surveyStepImageUrlsRaw[index] || '')
  const surveyStepImagePositionsRaw = Array.isArray(raw.media?.surveyStepImagePositions)
    ? raw.media.surveyStepImagePositions
    : []
  const surveyStepImagePositions = Array.from({ length: 6 }).map((_, index) => {
    const item = surveyStepImagePositionsRaw[index] || {}
    const x = Number(item?.x)
    const y = Number(item?.y)
    return {
      x: Number.isFinite(x) ? Math.max(-50, Math.min(50, x)) : 0,
      y: Number.isFinite(y) ? Math.max(-50, Math.min(50, y)) : 0,
    }
  })
  const landingCarouselImagePositionsRaw = Array.isArray(raw.media?.landingCarouselImagePositions)
    ? raw.media.landingCarouselImagePositions
    : []
  const landingCarouselImagePositions = Array.from({ length: 4 }).map((_, index) => {
    const item = landingCarouselImagePositionsRaw[index] || {}
    const x = Number(item?.x)
    const y = Number(item?.y)
    const zoom = Number(item?.zoom)
    return {
      x: Number.isFinite(x) ? Math.max(-50, Math.min(50, x)) : 0,
      y: Number.isFinite(y) ? Math.max(-50, Math.min(50, y)) : 0,
      zoom: Number.isFinite(zoom) ? Math.max(80, Math.min(140, zoom)) : 100,
    }
  })
  const screenshotSize = Number(raw.media?.levelUpScreenshotSize)
  const levelUpScreenshotPositionsRaw = Array.isArray(raw.media?.levelUpScreenshotPositions)
    ? raw.media.levelUpScreenshotPositions
    : []
  const levelUpScreenshotPositions = Array.from({ length: 5 }).map((_, index) => {
    const item = levelUpScreenshotPositionsRaw[index] || {}
    const x = Number(item?.x)
    const y = Number(item?.y)
    const zoom = Number(item?.zoom)
    return {
      x: Number.isFinite(x) ? Math.max(-50, Math.min(50, x)) : 0,
      y: Number.isFinite(y) ? Math.max(-50, Math.min(50, y)) : 0,
      zoom: Number.isFinite(zoom) ? Math.max(80, Math.min(140, zoom)) : 100,
    }
  })
  const registrationStepImageUrlsRaw = Array.isArray(raw.media?.registrationStepImageUrls)
    ? raw.media.registrationStepImageUrls.filter((value) => typeof value === 'string')
    : []
  const registrationStepImageUrls = Array.from({ length: 4 }).map(
    (_, index) => registrationStepImageUrlsRaw[index] || ''
  )
  const burlingtonFacilityImageUrlsRaw = Array.isArray(raw.media?.burlingtonFacilityImageUrls)
    ? raw.media.burlingtonFacilityImageUrls.filter((value) => typeof value === 'string')
    : []
  const burlingtonFacilityImageUrls = Array.from({ length: 6 }).map(
    (_, index) => burlingtonFacilityImageUrlsRaw[index] || ''
  )
  const actonFacilityImageUrlsRaw = Array.isArray(raw.media?.actonFacilityImageUrls)
    ? raw.media.actonFacilityImageUrls.filter((value) => typeof value === 'string')
    : []
  const actonFacilityImageUrls = Array.from({ length: 6 }).map(
    (_, index) => actonFacilityImageUrlsRaw[index] || ''
  )
  const wellesleyFacilityImageUrlsRaw = Array.isArray(raw.media?.wellesleyFacilityImageUrls)
    ? raw.media.wellesleyFacilityImageUrls.filter((value) => typeof value === 'string')
    : []
  const wellesleyFacilityImageUrls = Array.from({ length: 6 }).map(
    (_, index) => wellesleyFacilityImageUrlsRaw[index] || ''
  )
  const overnightLandingImageUrlsRaw = Array.isArray(raw.media?.overnightLandingImageUrls)
    ? raw.media.overnightLandingImageUrls.filter((value) => typeof value === 'string')
    : []
  const overnightLandingImageUrls = Array.from({ length: 6 }).map(
    (_, index) => overnightLandingImageUrlsRaw[index] || ''
  )
  const overnightGalleryImageUrls = Array.isArray(raw.media?.overnightGalleryImageUrls)
    ? raw.media.overnightGalleryImageUrls
        .filter((value) => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean)
    : overnightLandingImageUrlsRaw.map((value) => value.trim()).filter(Boolean)
  const overnightRegistrationImageUrlsRaw = Array.isArray(raw.media?.overnightRegistrationImageUrls)
    ? raw.media.overnightRegistrationImageUrls.filter((value) => typeof value === 'string')
    : []
  const overnightRegistrationImageUrls = Array.from({ length: 3 }).map(
    (_, index) => overnightRegistrationImageUrlsRaw[index] || ''
  )

  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const emailJourney = Array.from({ length: 5 }).map((_, index) => {
    const base = defaultAdminConfig.emailJourney[index]
    const incoming = Array.isArray(raw.emailJourney) ? raw.emailJourney[index] || {} : {}
    return {
      dayLabel: typeof incoming.dayLabel === 'string' ? incoming.dayLabel : base.dayLabel,
      title: typeof incoming.title === 'string' ? incoming.title : base.title,
      subject: typeof incoming.subject === 'string' ? incoming.subject : base.subject,
      videoUrl: typeof incoming.videoUrl === 'string' ? incoming.videoUrl : base.videoUrl,
      body: typeof incoming.body === 'string' ? incoming.body : base.body,
    }
  })
  const testimonials = Array.isArray(raw.testimonials)
    ? raw.testimonials
        .map((item) => ({
          studentName: typeof item?.studentName === 'string' ? item.studentName : '',
          headline: typeof item?.headline === 'string' ? item.headline : '',
          highlights: Array.isArray(item?.highlights)
            ? item.highlights.filter((value) => typeof value === 'string').slice(0, 4)
            : [],
          story: typeof item?.story === 'string' ? item.story : '',
          outcome: typeof item?.outcome === 'string' ? item.outcome : '',
        }))
        .filter((item) => item.studentName || item.headline || item.story || item.outcome || item.highlights.length)
        .slice(0, 12)
    : defaultAdminConfig.testimonials.map((item) => ({ ...item }))
  const campTypeShowcase = campTypeShowcaseKeys.reduce((acc, key) => {
    const incoming = raw.campTypeShowcase?.[key] || {}
    const base = defaultAdminConfig.campTypeShowcase[key]
    acc[key] = {
      title: typeof incoming.title === 'string' && incoming.title.trim() ? incoming.title : base.title,
      summary: typeof incoming.summary === 'string' && incoming.summary.trim() ? incoming.summary : base.summary,
      suitedFor: typeof incoming.suitedFor === 'string' && incoming.suitedFor.trim() ? incoming.suitedFor : base.suitedFor,
      highlights: Array.isArray(incoming.highlights)
        ? incoming.highlights.filter((value) => typeof value === 'string').map((value) => value.trim()).filter(Boolean).slice(0, 6)
        : [...base.highlights],
      media: Array.from({ length: 3 }).map((_, index) => {
        const incomingItem = Array.isArray(incoming.media) ? incoming.media[index] || {} : {}
        const baseItem = base.media[index]
        const tone = typeof incomingItem.tone === 'string' && campTypeMediaTones.has(incomingItem.tone)
          ? incomingItem.tone
          : baseItem.tone
        return {
          url: typeof incomingItem.url === 'string' ? incomingItem.url : baseItem.url,
          caption: typeof incomingItem.caption === 'string' ? incomingItem.caption : baseItem.caption,
          tone,
        }
      }),
    }
    if (acc[key].highlights.length === 0) {
      acc[key].highlights = [...base.highlights]
    }
    return acc
  }, {})

  return {
    media: {
      heroImageUrl: raw.media?.heroImageUrl || '',
      welcomeLogoUrl: raw.media?.welcomeLogoUrl || '',
      surveyVideoUrl: raw.media?.surveyVideoUrl || '',
      surveyStep1FlyerUrl: raw.media?.surveyStep1FlyerUrl || '',
      surveyMobileBgUrl: raw.media?.surveyMobileBgUrl || '',
      surveyStepImageUrls,
      surveyStepImagePositions,
      landingCarouselImagePositions,
      registrationStepImageUrls,
      burlingtonFacilityImageUrls,
      actonFacilityImageUrls,
      wellesleyFacilityImageUrls,
      overnightLandingImageUrls,
      overnightGalleryImageUrls,
      overnightRegistrationImageUrls,
      levelUpImageUrl: raw.media?.levelUpImageUrl || '',
      levelUpScreenshotUrls: screenshotUrls,
      levelUpScreenshotPositions,
      levelUpScreenshotSize: Number.isFinite(screenshotSize)
        ? Math.max(40, Math.min(140, screenshotSize))
        : 100,
      wechatQrUrl: raw.media?.wechatQrUrl || '',
    },
    emailJourney,
    testimonials: testimonials.length ? testimonials : defaultAdminConfig.testimonials.map((item) => ({ ...item })),
    campTypeShowcase,
    tuition: {
      regular: {
        fullWeek: toNumber(raw.tuition?.regular?.fullWeek),
        fullDay: toNumber(raw.tuition?.regular?.fullDay),
        amHalf: toNumber(raw.tuition?.regular?.amHalf),
        pmHalf: toNumber(raw.tuition?.regular?.pmHalf),
        overnightWeek: toNumber(raw.tuition?.regular?.overnightWeek),
        overnightDay: toNumber(raw.tuition?.regular?.overnightDay),
      },
      discount: {
        fullWeek: toNumber(raw.tuition?.discount?.fullWeek),
        fullDay: toNumber(raw.tuition?.discount?.fullDay),
        amHalf: toNumber(raw.tuition?.discount?.amHalf),
        pmHalf: toNumber(raw.tuition?.discount?.pmHalf),
        overnightWeek: toNumber(raw.tuition?.discount?.overnightWeek),
        overnightDay: toNumber(raw.tuition?.discount?.overnightDay),
      },
      bootcamp: resolveBootcampTuition({
        regular: {
          fullWeek: toNumber(raw.tuition?.regular?.fullWeek),
          fullDay: toNumber(raw.tuition?.regular?.fullDay),
          amHalf: toNumber(raw.tuition?.regular?.amHalf),
          pmHalf: toNumber(raw.tuition?.regular?.pmHalf),
        },
        discount: {
          fullWeek: toNumber(raw.tuition?.discount?.fullWeek),
          fullDay: toNumber(raw.tuition?.discount?.fullDay),
          amHalf: toNumber(raw.tuition?.discount?.amHalf),
          pmHalf: toNumber(raw.tuition?.discount?.pmHalf),
        },
        bootcamp: {
          regular: {
            fullWeek: toNumber(raw.tuition?.bootcamp?.regular?.fullWeek),
            fullDay: toNumber(raw.tuition?.bootcamp?.regular?.fullDay),
            amHalf: toNumber(raw.tuition?.bootcamp?.regular?.amHalf),
            pmHalf: toNumber(raw.tuition?.bootcamp?.regular?.pmHalf),
          },
          discount: {
            fullWeek: toNumber(raw.tuition?.bootcamp?.discount?.fullWeek),
            fullDay: toNumber(raw.tuition?.bootcamp?.discount?.fullDay),
            amHalf: toNumber(raw.tuition?.bootcamp?.discount?.amHalf),
            pmHalf: toNumber(raw.tuition?.bootcamp?.discount?.pmHalf),
          },
        },
        bootcampPremiumPct: Math.max(0, toNumber(raw.tuition?.bootcampPremiumPct, 25)),
      }),
      discountEndDate:
        typeof raw.tuition?.discountEndDate === 'string' ? raw.tuition.discountEndDate : '',
      discountDisplayValue:
        typeof raw.tuition?.discountDisplayValue === 'string' ? raw.tuition.discountDisplayValue : '',
      discountCode: typeof raw.tuition?.discountCode === 'string' ? raw.tuition.discountCode : '',
      lunchPrice: Math.max(0, toNumber(raw.tuition?.lunchPrice, 14)),
      bootcampPremiumPct: Math.max(0, toNumber(raw.tuition?.bootcampPremiumPct, 25)),
      siblingDiscountPct: Math.max(0, toNumber(raw.tuition?.siblingDiscountPct, 10)),
      businessName:
        typeof raw.tuition?.businessName === 'string' && raw.tuition.businessName.trim()
          ? raw.tuition.businessName
          : defaultAdminConfig.tuition.businessName,
      businessAddress:
        typeof raw.tuition?.businessAddress === 'string' ? raw.tuition.businessAddress : '',
    },
    programs: {
      general: normalizeProgram(raw.programs?.general),
      bootcamp: normalizeProgram(raw.programs?.bootcamp),
      overnight: normalizeProgram(raw.programs?.overnight),
    },
    locations: {
      burlington: normalizeLocationAddress(raw.locations?.burlington, 'Burlington'),
      acton: normalizeLocationAddress(raw.locations?.acton, 'Acton'),
      wellesley: normalizeLocationAddress(raw.locations?.wellesley, 'Wellesley'),
    },
  }
}

export function buildProgramWeekOptions(programKey, startDateValue, endDateValue) {
  const startDate = parseDate(startDateValue)
  const endDate = parseDate(endDateValue)
  const rule = programRules[programKey]

  if (!startDate || !endDate || !rule || startDate > endDate) {
    return []
  }

  const options = []
  let cursor = findWeekdayOnOrAfter(startDate, rule.startWeekday)

  while (cursor <= endDate) {
    const weekStart = new Date(cursor)
    const weekEnd = addDays(weekStart, rule.durationDays - 1)

    if (weekEnd <= endDate) {
      options.push({
        id: `${programKey}:${isoDate(weekStart)}`,
        start: isoDate(weekStart),
        end: isoDate(weekEnd),
      })
    }

    cursor = addDays(cursor, 7)
  }

  return options
}

export function getSelectedWeeks(programKey, programConfig) {
  const options = buildProgramWeekOptions(programKey, programConfig.startDate, programConfig.endDate)
  const normalizeSelectedId = (value) => {
    const raw = String(value || '').trim()
    if (!raw) {
      return ''
    }

    const [rawProgram, rawDate] = raw.includes(':') ? raw.split(':') : [programKey, raw]
    const datePart = String(rawDate || '')
      .trim()
      .slice(0, 10)

    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return ''
    }

    return `${rawProgram || programKey}:${datePart}`
  }

  const selected = new Set(
    Array.isArray(programConfig.selectedWeeks)
      ? programConfig.selectedWeeks.map((item) => normalizeSelectedId(item)).filter(Boolean)
      : []
  )

  return options.filter((option) => selected.has(option.id))
}
