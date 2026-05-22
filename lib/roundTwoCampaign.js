import {
  ROUND_TWO_DISCOUNT_END_DATE,
  ROUND_TWO_DISCOUNT_NAME,
  ROUND_TWO_FULL_WEEK_DISCOUNT_AMOUNT,
} from './campAdmin'

export const EARLY_BIRD_R2_FLOW_KEY = 'ebr2'
export const EARLY_BIRD_R2_JOURNEY_TYPE = 'early_bird_r2'
export const EARLY_BIRD_R2_RUN_STATUS_ACTIVE = 'campaign_eb2_active'
export const EARLY_BIRD_R2_RUN_STATUS_CLOSED = 'campaign_eb2_closed'
export const EARLY_BIRD_R2_RUN_STATUS_TEST = 'test_ebr2'

function parseDateOnly(value) {
  const raw = String(value || '').trim()
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return null
  }
  const parsed = new Date(`${raw}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toEveningIso(baseDate, hour = 18) {
  const scheduled = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, 0, 0, 0)
  return scheduled.toISOString()
}

export function getRoundTwoDeadlineDate() {
  return parseDateOnly(ROUND_TWO_DISCOUNT_END_DATE)
}

export function getRoundTwoDaysLeft(nowDate = new Date()) {
  const deadline = getRoundTwoDeadlineDate()
  const now = nowDate instanceof Date ? nowDate : new Date(nowDate)
  if (!deadline || Number.isNaN(now.getTime())) {
    return 0
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
  const diffMs = endOfDeadline.getTime() - today.getTime()
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1)
}

export function getRoundTwoCalendarDaysLeft(nowDate = new Date()) {
  const deadline = getRoundTwoDeadlineDate()
  const now = nowDate instanceof Date ? nowDate : new Date(nowDate)
  if (!deadline || Number.isNaN(now.getTime())) {
    return 0
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDeadline = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
  const diffMs = endOfDeadline.getTime() - today.getTime()
  return Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)))
}

export function getRoundTwoDeadlineLabel() {
  const deadline = getRoundTwoDeadlineDate()
  if (!deadline) {
    return 'the Round 2 deadline'
  }
  return deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function getRoundTwoCountdownLabel(nowDate = new Date()) {
  const daysLeft = getRoundTwoCalendarDaysLeft(nowDate)
  if (daysLeft <= 0) {
    return 'Ends Today at Midnight'
  }
  if (daysLeft === 1) {
    return '24 Hours Left'
  }
  if (daysLeft === 3) {
    return '3 Days Left'
  }
  if (daysLeft === 7) {
    return '7 Days Left'
  }
  return `${daysLeft} Days Left`
}

export function getRoundTwoCountdownSentence(nowDate = new Date()) {
  const daysLeft = getRoundTwoCalendarDaysLeft(nowDate)
  if (daysLeft <= 0) {
    return 'Ends today at midnight'
  }
  if (daysLeft === 1) {
    return 'About 24 hours left'
  }
  if (daysLeft === 3) {
    return '3 days left'
  }
  if (daysLeft === 7) {
    return '7 days left'
  }
  return `${daysLeft} days left`
}

function buildCadenceStepCopy(offsetDays) {
  const sequenceLabel = offsetDays === 0 ? 'launch' : `day ${offsetDays}`
  return {
    subject: `{round_two_subject_countdown}: Round 2 Early Bird Update`,
    title: `Round 2 ${sequenceLabel}`,
    body:
      'Hi {parent_name},\n\n' +
      '{round_two_offer}\n\n' +
      'Summer camp works best when families plan early. That gives you better week selection, stronger multi-week options, and clearer scheduling for the summer.\n\n' +
      'Families choose New England Wushu because the program combines expert instruction, visible progress, fun daily rhythm, and a safe team culture.\n\n' +
      '{wushu_why_start}\n\n' +
      '{train_more_save_more}\n\n' +
      'Registration page:\n{registration_link}\n\n' +
      'Reply if you want help choosing the best weeks for your family.',
  }
}

function buildUrgencyStepCopy(kind) {
  if (kind === '7d') {
    return {
      subject: '{round_two_subject_countdown}: Round 2 Early Bird Ends Soon',
      title: '7 days left',
      body:
        'Hi {parent_name},\n\n' +
        '{round_two_offer}\n\n' +
        'There are now 7 days left to lock in the current Round 2 weekly price.\n\n' +
        'If you are comparing week options, now is the right time to reserve before the deadline gets closer.\n\n' +
        '{train_more_save_more}\n\n' +
        '{wushu_why_start}\n\n' +
        'Register now:\n{registration_link}',
    }
  }

  if (kind === '3d') {
    return {
      subject: '{round_two_subject_countdown}: Round 2 Early Bird Countdown',
      title: '3 days left',
      body:
        'Hi {parent_name},\n\n' +
        '{round_two_offer}\n\n' +
        'Only 3 days remain before the Round 2 early-bird price ends.\n\n' +
        'Families who want the current full-week rate should complete registration now rather than wait until the final day.\n\n' +
        '{train_more_save_more}\n\n' +
        'Complete registration here:\n{registration_link}',
    }
  }

  if (kind === '24h') {
    return {
      subject: '{round_two_subject_countdown}: Round 2 Early Bird Ends Tomorrow',
      title: '24 hours left',
      body:
        'Hi {parent_name},\n\n' +
        '{round_two_offer}\n\n' +
        'There are about 24 hours left before the Round 2 early-bird deadline.\n\n' +
        'If you want the current weekly savings, this is the final full day to register before the offer closes.\n\n' +
        'Register here now:\n{registration_link}\n\n' +
        'Reply if you want help quickly choosing the right week plan.',
    }
  }

  return {
    subject: '{round_two_subject_countdown}: Final Round 2 Early Bird Reminder',
    title: 'ends tonight',
    body:
      'Hi {parent_name},\n\n' +
      '{round_two_offer}\n\n' +
      'This is the final reminder: the Round 2 early-bird offer ends today at midnight.\n\n' +
      'If you want the current price, please complete registration this evening.\n\n' +
      '{train_more_save_more}\n\n' +
      'Register now:\n{registration_link}',
  }
}

function buildRoundTwoSteps(nowDate = new Date()) {
  const now = nowDate instanceof Date ? nowDate : new Date(nowDate)
  const deadline = getRoundTwoDeadlineDate()
  if (!deadline || Number.isNaN(now.getTime())) {
    return []
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const deadlineMidnight = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
  const daysUntilDeadline = Math.max(0, Math.floor((deadlineMidnight.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)))

  const stepSeeds = []
  const cadenceOffsets = []
  const cadenceCutoff = Math.max(0, daysUntilDeadline - 7)
  for (let offset = 0; offset <= cadenceCutoff; offset += 4) {
    cadenceOffsets.push(offset)
  }

  for (const offset of cadenceOffsets) {
    stepSeeds.push({
      type: 'cadence',
      offsetDays: offset,
      label: offset === 0 ? 'Immediately' : `Day ${offset}`,
      scheduledAtIso: toEveningIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset), 18),
      ...buildCadenceStepCopy(offset),
    })
  }

  const specialSteps = [
    { type: '7d', offsetDays: Math.max(0, daysUntilDeadline - 7), label: '7 Days Left' },
    { type: '3d', offsetDays: Math.max(0, daysUntilDeadline - 3), label: '3 Days Left' },
    { type: '24h', offsetDays: Math.max(0, daysUntilDeadline - 1), label: '24 Hours Left' },
    { type: 'today', offsetDays: daysUntilDeadline, label: 'Ends Today' },
  ]

  for (const special of specialSteps) {
    stepSeeds.push({
      type: special.type,
      offsetDays: special.offsetDays,
      label: special.label,
      scheduledAtIso: toEveningIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() + special.offsetDays), 18),
      ...buildUrgencyStepCopy(special.type),
    })
  }

  const uniqueBySchedule = new Map()
  for (const seed of stepSeeds) {
    const key = `${seed.offsetDays}:${seed.type}`
    uniqueBySchedule.set(key, seed)
  }

  return Array.from(uniqueBySchedule.values())
    .sort((a, b) => {
      const atDiff = new Date(a.scheduledAtIso).getTime() - new Date(b.scheduledAtIso).getTime()
      if (atDiff !== 0) return atDiff
      return Number(a.offsetDays || 0) - Number(b.offsetDays || 0)
    })
    .map((seed, index) => ({
      key: `eb2_${index + 1}`,
      code: `EB2${String(index + 1).padStart(2, '0')}`,
      stepNumber: index + 1,
      dayOffset: Number(seed.offsetDays || 0),
      dayLabel: seed.label,
      scheduledAtIso: seed.scheduledAtIso,
      stageType: seed.type,
      subject: seed.subject,
      title: seed.title,
      body: seed.body,
    }))
}

export const EARLY_BIRD_R2_STEPS = buildRoundTwoSteps()

export function getRoundTwoOfferCopy(nowDate = new Date(), camperName = '') {
  const dayLabel = getRoundTwoCountdownSentence(nowDate).toLowerCase()
  const camperLabel = String(camperName || '').trim()
  const personalizedOfferPrefix = camperLabel
    ? `${ROUND_TWO_DISCOUNT_NAME} offer for ${camperLabel}`
    : ROUND_TWO_DISCOUNT_NAME
  return [
    `${personalizedOfferPrefix}: save $${ROUND_TWO_FULL_WEEK_DISCOUNT_AMOUNT} per full week through ${getRoundTwoDeadlineLabel()} (${dayLabel}).`,
    'This pricing is applied directly in the registration flow and can stack with Train More, Save More on eligible full-week enrollments.',
  ].join('\n')
}

export function getRoundTwoWushuBenefitsCopy() {
  return [
    'Why start wushu now:',
    '- Physical benefits: coordination, balance, flexibility, strength, speed, and body control.',
    '- Mental benefits: focus, resilience, discipline, confidence, and emotional regulation.',
    '- School benefits: students build habits that carry into better attention, stronger presentation, and long-term resume-building through consistent skill development, performance experience, and competition pathways.',
    '- Fun factor: kids train, play games, make friends, and stay active in a structured environment.',
  ].join('\n')
}

export function getRoundTwoTrainMoreSaveMoreCopy() {
  return [
    'Train More, Save More:',
    '- Round 2 early-bird pricing is now based on $75 OFF per full week.',
    '- Then the multi-week promo stacks on top of that discounted base price for eligible full-week enrollments.',
    '- Weeks 4-6 are 50% OFF, weeks 7-9 are 60% OFF, and week 10 is FREE.',
    '- More weeks usually create better consistency, stronger progress, and better overall summer value.',
  ].join('\n')
}

export function getEarlyBirdR2Step(stepNumber = 1) {
  return EARLY_BIRD_R2_STEPS[Math.max(0, Math.min(EARLY_BIRD_R2_STEPS.length - 1, Number(stepNumber || 1) - 1))]
}

export function getEarlyBirdR2ScheduleDays() {
  return EARLY_BIRD_R2_STEPS.map((step) => Number(step.dayOffset || 0))
}

export function getEarlyBirdR2Code(stepNumber = 1) {
  return getEarlyBirdR2Step(stepNumber)?.code || 'EB2'
}
