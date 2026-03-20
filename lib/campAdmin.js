export const defaultAdminConfig = {
  media: {
    heroImageUrl: '',
    welcomeLogoUrl: '',
    surveyVideoUrl: '',
    surveyStep1FlyerUrl: '',
    surveyMobileBgUrl: '',
    surveyStepImageUrls: ['', '', '', '', '', ''],
    surveyStepImagePositions: Array.from({ length: 6 }).map(() => ({ x: 0, y: 0 })),
    registrationStepImageUrls: ['', '', '', ''],
    levelUpImageUrl: '',
    levelUpScreenshotUrls: [],
    levelUpScreenshotSize: 100,
    wechatQrUrl: '',
  },
  emailJourney: [
    {
      dayLabel: 'Immediately',
      title: 'Step 1 - Best-Fit Snapshot',
      subject: 'Your Summer Camp best-fit plan is ready',
      body: 'Hi {first_name}, thanks for completing the program guide. Based on your answers, our recommended start is: {recommended_plan}. You can reserve now with this link: {registration_link}. Questions? Reply to this email and our team will help today.',
    },
    {
      dayLabel: 'Day 2',
      title: 'Step 2 - Why This Plan Fits',
      subject: 'Why this camp path is a strong fit',
      body: 'Here is why this plan works for your family: age fit, current experience level, and clear next milestones. Our certified coaches build confidence, coordination, and discipline in a structured progression. Ready to lock weeks? {registration_link}',
    },
    {
      dayLabel: 'Day 4',
      title: 'Step 3 - Social + Team Value',
      subject: 'How camp builds friendships and confidence',
      body: 'Families choose us because campers build real friendships, teamwork, and social confidence through daily guided activities. If you have siblings, your second camper discount also applies. Reserve your weeks here: {registration_link}',
    },
    {
      dayLabel: 'Day 6',
      title: 'Step 4 - Logistics + Convenience',
      subject: 'Weekly schedule, lunch options, and onboarding',
      body: 'Quick logistics: you can mix General Camp and Competition Team Boot Camp by week, choose lunch by day, and get a clear onboarding checklist before week one. Questions are welcome. Register here: {registration_link}',
    },
    {
      dayLabel: 'Day 8',
      title: 'Step 5 - Final Priority Invite',
      subject: 'Final invite to secure your preferred camp weeks',
      body: 'Last reminder to reserve preferred weeks before spots fill. New England Wushu has been awarded Best in Burlington and our certified coaching team is ready to support your camper this summer. Reserve now: {registration_link}',
    },
  ],
  testimonials: [
    {
      studentName: 'Ethan, age 9',
      headline: 'From shy beginner to confident performer',
      highlights: ['Confidence', 'Flexibility', 'Showcase'],
      story:
        'Ethan joined General Camp with no prior martial arts experience. After two weeks of structured coaching, he improved flexibility, focus, and confidence, then completed the Friday showcase in front of families with a big smile.',
      outcome: 'Parent reported stronger confidence, better discipline at home, and excitement to continue training.',
    },
    {
      studentName: 'Ava, age 8',
      headline: 'Lunch was easy, and every day felt meaningful',
      highlights: ['Daily Routine', 'Skill Growth', 'Coach Support'],
      story:
        'Ava attended General Camp for three weeks. Her family appreciated the flexible lunch planning and clear weekly structure, and Ava came home each day talking about team games, new skills, and how much fun she had with her coaches.',
      outcome:
        'Parent shared that planning lunches felt manageable, daily communication was clear, and Ava asked to come back next summer.',
    },
    {
      studentName: 'Noah, age 10',
      headline: 'Coaches who care and a reward system kids love',
      highlights: ['Motivation', 'Discipline', 'Teamwork'],
      story:
        'Noah joined General Camp to stay active and build confidence. The coaches were encouraging and patient, and he was motivated by the camp award system that recognized effort, teamwork, and progress all week.',
      outcome:
        'Parent reported better confidence, strong connection with coaches, and real excitement about training because camp felt both supportive and fun.',
    },
    {
      studentName: 'Mia, age 7',
      headline: 'From first-week nerves to independent confidence',
      highlights: ['First-Time Camper', 'Confidence', 'Independence'],
      story:
        'Mia started camp feeling shy about joining group activities. By the second week, she was volunteering for partner drills, practicing at home, and proudly showing new techniques during Friday showcase.',
      outcome:
        'Parent reported a major confidence jump, better listening at home, and stronger willingness to try new challenges.',
    },
    {
      studentName: 'Lucas, age 11',
      headline: 'Athletic focus and visible weekly progress',
      highlights: ['Athletic Development', 'Focus', 'Consistency'],
      story:
        'Lucas joined to improve coordination and conditioning for multiple sports. The structured schedule helped him build balance, speed, and control, and he stayed engaged through clear weekly goals.',
      outcome:
        'Parent said he became more focused, looked forward to training each day, and showed measurable improvement by week three.',
    },
  ],
  tuition: {
    regular: {
      fullWeek: 0,
      fullDay: 0,
      amHalf: 0,
      pmHalf: 0,
      overnightWeek: 0,
      overnightDay: 0,
    },
    discount: {
      fullWeek: 0,
      fullDay: 0,
      amHalf: 0,
      pmHalf: 0,
      overnightWeek: 0,
      overnightDay: 0,
    },
    discountEndDate: '',
    discountDisplayValue: '',
    discountCode: '',
    lunchPrice: 14,
    bootcampPremiumPct: 15,
    siblingDiscountPct: 10,
  },
  programs: {
    general: {
      startDate: '',
      endDate: '',
      selectedWeeks: [],
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
}

const programRules = {
  general: { startWeekday: 1, durationDays: 5 },
  bootcamp: { startWeekday: 1, durationDays: 5 },
  overnight: { startWeekday: 6, durationDays: 7 },
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

function normalizeProgram(program = {}) {
  return {
    startDate: typeof program.startDate === 'string' ? program.startDate : '',
    endDate: typeof program.endDate === 'string' ? program.endDate : '',
    selectedWeeks: Array.isArray(program.selectedWeeks)
      ? program.selectedWeeks.filter((value) => typeof value === 'string')
      : [],
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
  const screenshotSize = Number(raw.media?.levelUpScreenshotSize)
  const registrationStepImageUrlsRaw = Array.isArray(raw.media?.registrationStepImageUrls)
    ? raw.media.registrationStepImageUrls.filter((value) => typeof value === 'string')
    : []
  const registrationStepImageUrls = Array.from({ length: 4 }).map(
    (_, index) => registrationStepImageUrlsRaw[index] || ''
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

  return {
    media: {
      heroImageUrl: raw.media?.heroImageUrl || '',
      welcomeLogoUrl: raw.media?.welcomeLogoUrl || '',
      surveyVideoUrl: raw.media?.surveyVideoUrl || '',
      surveyStep1FlyerUrl: raw.media?.surveyStep1FlyerUrl || '',
      surveyMobileBgUrl: raw.media?.surveyMobileBgUrl || '',
      surveyStepImageUrls,
      surveyStepImagePositions,
      registrationStepImageUrls,
      levelUpImageUrl: raw.media?.levelUpImageUrl || '',
      levelUpScreenshotUrls: screenshotUrls,
      levelUpScreenshotSize: Number.isFinite(screenshotSize)
        ? Math.max(40, Math.min(140, screenshotSize))
        : 100,
      wechatQrUrl: raw.media?.wechatQrUrl || '',
    },
    emailJourney,
    testimonials: testimonials.length ? testimonials : defaultAdminConfig.testimonials.map((item) => ({ ...item })),
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
      discountEndDate:
        typeof raw.tuition?.discountEndDate === 'string' ? raw.tuition.discountEndDate : '',
      discountDisplayValue:
        typeof raw.tuition?.discountDisplayValue === 'string' ? raw.tuition.discountDisplayValue : '',
      discountCode: typeof raw.tuition?.discountCode === 'string' ? raw.tuition.discountCode : '',
      lunchPrice: Math.max(0, toNumber(raw.tuition?.lunchPrice, 14)),
      bootcampPremiumPct: Math.max(0, toNumber(raw.tuition?.bootcampPremiumPct, 15)),
      siblingDiscountPct: Math.max(0, toNumber(raw.tuition?.siblingDiscountPct, 10)),
    },
    programs: {
      general: normalizeProgram(raw.programs?.general),
      bootcamp: normalizeProgram(raw.programs?.bootcamp),
      overnight: normalizeProgram(raw.programs?.overnight),
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
  const selected = new Set(programConfig.selectedWeeks)
  return options.filter((option) => selected.has(option.id))
}
