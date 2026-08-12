import {
  getDiscountCampaignMeta,
  getTuitionForDiscountCampaign,
  resolveBootcampTuition,
} from './campAdmin'

export const ACTON_GENERAL_FULL_WEEK_REGULAR_PRICE = 600
export const ACTON_GENERAL_FULL_WEEK_DISCOUNT_PRICE = 525

// Late pickup policy for Summer Wushu Weeks (day camp).
// Pickup closes at 4:30 PM. A 15-minute grace period runs to 4:45 PM; from then
// on every started 30-minute block is billed at LATE_PICKUP_FEE_PER_PERIOD.
export const DAY_CAMP_PICKUP_END_MINUTES = 16 * 60 + 30 // 4:30 PM
export const LATE_PICKUP_GRACE_END_MINUTES = 16 * 60 + 45 // 4:45 PM
export const LATE_PICKUP_PERIOD_MINUTES = 30
export const LATE_PICKUP_FEE_PER_PERIOD = 25

export const LATE_PICKUP_POLICY = {
  headline: `Late pickup: $${LATE_PICKUP_FEE_PER_PERIOD} per 30-minute period`,
  headlineZh: `迟接费用：每 30 分钟 $${LATE_PICKUP_FEE_PER_PERIOD}`,
  detail: `Pickup closes at 4:30 PM. Pickups from 4:45 PM onward are billed $${LATE_PICKUP_FEE_PER_PERIOD} per started 30-minute period: 4:45-5:15 PM is $${LATE_PICKUP_FEE_PER_PERIOD}, 5:15-5:45 PM is $${LATE_PICKUP_FEE_PER_PERIOD * 2}, and so on.`,
  detailZh: `接送时间于下午4点30分结束。下午4点45分及以后接走，按每满/不满 30 分钟计费 $${LATE_PICKUP_FEE_PER_PERIOD}：4:45-5:15 收费 $${LATE_PICKUP_FEE_PER_PERIOD}，5:15-5:45 收费 $${LATE_PICKUP_FEE_PER_PERIOD * 2}，以此类推。`,
}

/** Minutes since midnight for values like "4:45 PM", "16:45" or 985. */
export function parsePickupTimeToMinutes(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value))
  }

  const raw = String(value || '').trim().toUpperCase()
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/)
  if (!match) {
    return null
  }

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3]
  if (minutes > 59) {
    return null
  }
  if (meridiem === 'PM' && hours < 12) {
    hours += 12
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0
  }
  if (hours > 23) {
    return null
  }

  return hours * 60 + minutes
}

/**
 * Number of billable 30-minute late-pickup periods for a given pickup time.
 * 4:44 PM is free, 4:45-5:15 PM is one period, 5:15-5:45 PM is two, and so on.
 */
export function getLatePickupPeriods(pickupTime) {
  const minutes = parsePickupTimeToMinutes(pickupTime)
  if (minutes === null || minutes < LATE_PICKUP_GRACE_END_MINUTES) {
    return 0
  }
  return Math.floor((minutes - LATE_PICKUP_GRACE_END_MINUTES) / LATE_PICKUP_PERIOD_MINUTES) + 1
}

/** Dollar amount owed for a late pickup at the given time. */
export function getLatePickupFee(pickupTime) {
  return getLatePickupPeriods(pickupTime) * LATE_PICKUP_FEE_PER_PERIOD
}

function formatClockLabel(totalMinutes) {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440
  const hours24 = Math.floor(normalized / 60)
  const minutes = normalized % 60
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(minutes).padStart(2, '0')} ${meridiem}`
}

/** Billing ladder rows, e.g. "4:45 - 5:15 PM" -> $25. Used for public copy. */
export function getLatePickupFeeSchedule(periods = 4) {
  return Array.from({ length: Math.max(1, periods) }).map((_, index) => {
    const start = LATE_PICKUP_GRACE_END_MINUTES + index * LATE_PICKUP_PERIOD_MINUTES
    const end = start + LATE_PICKUP_PERIOD_MINUTES
    return {
      periods: index + 1,
      startLabel: formatClockLabel(start),
      endLabel: formatClockLabel(end),
      windowLabel: `${formatClockLabel(start)} - ${formatClockLabel(end)}`,
      fee: (index + 1) * LATE_PICKUP_FEE_PER_PERIOD,
    }
  })
}

export const WEEK_TIER_PROMO = {
  shortLabel: 'Train More, Save More',
  headline: 'Earn 50% OFF full weeks with 4 or more full day-camp weeks.',
  detail: 'Applies to a camper’s full-week general camp or competition boot camp tuition.',
  tiers: 'Weeks 4-6 are 50% OFF, weeks 7-9 are 60% OFF, and week 10 is FREE.',
  growth: 'More weeks help campers build stronger skills, confidence, consistency, and visible progress.',
  cap: 'Limited to the first 30 enrollments.',
}

const PROMO_WEEK_RULES = {
  4: 0.5,
  5: 0.5,
  6: 0.5,
  7: 0.6,
  8: 0.6,
  9: 0.6,
  10: 1,
}

// Train More, Save More is capped at 30 campers per season. A camper "claims" a
// slot by enrolling in WEEK_TIER_PROMO_MIN_FULL_WEEKS or more full day-camp
// weeks; claims are counted from submitted registrations.
export const WEEK_TIER_PROMO_QUOTA = 30
export const WEEK_TIER_PROMO_MIN_FULL_WEEKS = 4

export function getCampRateForLocation(locationValue, rateType, key, tuition, options = {}) {
  const location = String(locationValue || '').trim().toLowerCase()
  const discountCampaignId = String(options.discountCampaignId || '').trim().toLowerCase()
  const effectiveTuition = getTuitionForDiscountCampaign(tuition, discountCampaignId)
  const bootcamp = resolveBootcampTuition(effectiveTuition)
  const regular = effectiveTuition?.regular || {}
  const discount = effectiveTuition?.discount || {}
  const discountCampaign = getDiscountCampaignMeta(discountCampaignId, tuition?.discountEndDate)

  if (location === 'acton' && rateType === 'general' && key === 'fullWeek') {
    const fullWeekDiscountAmount = Number(discountCampaign?.fullWeekDiscountAmount || 0)
    return {
      regularPrice: ACTON_GENERAL_FULL_WEEK_REGULAR_PRICE,
      discountedPrice:
        fullWeekDiscountAmount > 0
          ? Math.max(0, ACTON_GENERAL_FULL_WEEK_REGULAR_PRICE - fullWeekDiscountAmount)
          : ACTON_GENERAL_FULL_WEEK_DISCOUNT_PRICE,
      isLocationOverride: true,
    }
  }

  if (rateType === 'bootcamp') {
    return {
      regularPrice: Number(bootcamp.regular?.[key] || 0),
      discountedPrice: Number(bootcamp.discount?.[key] || 0),
      isLocationOverride: false,
    }
  }

  return {
    regularPrice: Number(regular?.[key] || 0),
    discountedPrice: Number(discount?.[key] || 0),
    isLocationOverride: false,
  }
}

/** Week ids look like `daycamp:<location>:<YYYY-MM-DD>`. */
export function getWeekStartFromScheduleKey(weekId) {
  const match = String(weekId || '').match(/(\d{4}-\d{2}-\d{2})$/)
  return match ? match[1] : ''
}

function isFullWeekEntry(entry) {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].every((dayKey) => (entry?.days?.[dayKey] || 'NONE') === 'FULL')
}

/**
 * Full Monday-Friday day-camp weeks a camper has selected. Overnight weeks never
 * count. Pass options.seasonYear to count a single summer only.
 */
export function countStudentFullWeeks(student, weeksById, options = {}) {
  const seasonYear = Number(options.seasonYear)
  const filterBySeason = Number.isFinite(seasonYear)

  return Object.entries(student?.schedule || {}).filter(([weekId, entry]) => {
    const week = weeksById?.[weekId]
    const programKey = week?.programKey || entry?.programKey
    if (programKey === 'overnight') {
      return false
    }
    if (filterBySeason) {
      const weekStart = week?.start || getWeekStartFromScheduleKey(weekId)
      if (Number(String(weekStart).slice(0, 4)) !== seasonYear) {
        return false
      }
    }
    return isFullWeekEntry(entry)
  }).length
}

/** Does this camper qualify for a Train More, Save More slot? */
export function studentClaimsWeekTierPromo(student, weeksById, options = {}) {
  return countStudentFullWeeks(student, weeksById, options) >= WEEK_TIER_PROMO_MIN_FULL_WEEKS
}

/** How many slots a set of campers consumes. */
export function countWeekTierPromoClaims(students, weeksById, options = {}) {
  return (Array.isArray(students) ? students : []).reduce(
    (total, student) => total + (studentClaimsWeekTierPromo(student, weeksById, options) ? 1 : 0),
    0
  )
}

export function getWeekTierPromoQuotaStatus(claimedCount = 0) {
  const rawClaimed = Math.round(Number(claimedCount) || 0)
  const claimed = Math.max(0, Math.min(WEEK_TIER_PROMO_QUOTA, rawClaimed))
  const remaining = WEEK_TIER_PROMO_QUOTA - claimed
  return {
    initialQuota: WEEK_TIER_PROMO_QUOTA,
    claimed,
    consumed: claimed,
    remaining,
    soldOut: remaining <= 0,
  }
}

/**
 * Whether a camper can still take a slot.
 *
 * `quotaRemaining` is how many slots are left across all families. `quotaSlotIndex`
 * is this camper's position among the qualifying campers on the current
 * registration, so one family adding three campers cannot overdraw two remaining
 * slots. Both are optional: with neither set the promo is uncapped, which is what
 * the admin console wants when re-pricing an already-submitted registration.
 */
function hasWeekTierPromoSlot(options = {}) {
  const remaining = Number(options.quotaRemaining)
  if (!Number.isFinite(remaining)) {
    return true
  }
  const slotIndex = Math.max(0, Math.round(Number(options.quotaSlotIndex) || 0))
  return slotIndex < remaining
}

function getFullWeekPrice(rateType, tuition, applyLimitedDiscount) {
  const discountCampaignId =
    typeof applyLimitedDiscount === 'object' && applyLimitedDiscount
      ? String(applyLimitedDiscount.discountCampaignId || '').trim().toLowerCase()
      : ''
  const limitedDiscountActive =
    typeof applyLimitedDiscount === 'object' && applyLimitedDiscount
      ? Boolean(applyLimitedDiscount.applyLimitedDiscount)
      : Boolean(applyLimitedDiscount)
  const { regularPrice, discountedPrice } = getCampRateForLocation('', rateType, 'fullWeek', tuition, {
    discountCampaignId,
  })
  return limitedDiscountActive && discountedPrice > 0 ? Math.min(regularPrice, discountedPrice) : regularPrice
}

function getRegularFullWeekPrice(rateType, tuition) {
  const regular = tuition?.regular || {}
  const bootcamp = resolveBootcampTuition(tuition)
  if (rateType === 'bootcamp') {
    return Number(bootcamp.regular.fullWeek || 0)
  }
  return Number(regular.fullWeek || 0)
}

function getPromoRateForWeekCount(weekCount) {
  return Number(PROMO_WEEK_RULES[Number(weekCount || 0)] || 0)
}

function getPromoLabelForWeekCount(weekCount) {
  const rate = getPromoRateForWeekCount(weekCount)
  if (rate >= 1) {
    return `Week ${weekCount} FREE`
  }
  if (rate > 0) {
    return `Week ${weekCount} ${Math.round(rate * 100)}% OFF`
  }
  return ''
}

export function getWeekTierPromoLines() {
  return [
    WEEK_TIER_PROMO.headline,
    WEEK_TIER_PROMO.cap,
    WEEK_TIER_PROMO.tiers,
    WEEK_TIER_PROMO.detail,
    WEEK_TIER_PROMO.growth,
  ]
}

export function getEligibleFullWeekSelections(student, weeksById, tuition, options = {}) {
  const applyLimitedDiscount = Boolean(options.applyLimitedDiscount)
  const discountCampaignId = String(options.discountCampaignId || '').trim().toLowerCase()

  return Object.entries(student?.schedule || {})
    .map(([weekId, entry]) => {
      const week = weeksById?.[weekId]
      const programKey = week?.programKey || entry?.programKey
      if (programKey === 'overnight') {
        return null
      }

      const modes = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((dayKey) => entry?.days?.[dayKey] || 'NONE')
      const fullWeekSelected = modes.every((mode) => mode === 'FULL')
      if (!fullWeekSelected) {
        return null
      }

      const rateType = entry?.campType === 'bootcamp' ? 'bootcamp' : 'general'
      return {
        weekId,
        weekStart: week?.start || weekId,
        rateType,
        programLabel: rateType === 'bootcamp' ? 'Competition Team Boot Camp' : 'General Camp',
        regularPrice: getRegularFullWeekPrice(rateType, tuition),
        currentPrice: getFullWeekPrice(rateType, tuition, {
          applyLimitedDiscount,
          discountCampaignId,
        }),
      }
    })
    .filter(Boolean)
    .sort((a, b) => String(a.weekStart || '').localeCompare(String(b.weekStart || '')))
}

export function getWeekTierPromoForStudent(student, weeksById, tuition, options = {}) {
  const fullWeeks = getEligibleFullWeekSelections(student, weeksById, tuition, options)

  if (!hasWeekTierPromoSlot(options)) {
    return {
      eligible: false,
      soldOut: true,
      amount: 0,
      weeksSelected: fullWeeks.length,
      label: WEEK_TIER_PROMO.shortLabel,
      breakdown: [],
    }
  }

  const promoSlots = fullWeeks
    .map((_, index) => {
      const weekCount = index + 1
      const promoRate = getPromoRateForWeekCount(weekCount)
      return {
        weekCount,
        promoRate,
        promoLabel: getPromoLabelForWeekCount(weekCount),
      }
    })
    .filter((item) => item.promoRate > 0)
    .sort((a, b) => {
      if (a.promoRate !== b.promoRate) {
        return b.promoRate - a.promoRate
      }
      return b.weekCount - a.weekCount
    })
  const promoWeeks = [...fullWeeks].sort((a, b) => {
    if (Number(a.regularPrice || 0) !== Number(b.regularPrice || 0)) {
      return Number(a.regularPrice || 0) - Number(b.regularPrice || 0)
    }
    return String(a.weekStart || '').localeCompare(String(b.weekStart || ''))
  })
  const breakdown = promoSlots
    .map((slot, index) => {
      const week = promoWeeks[index]
      if (!week) {
        return null
      }
      const amount = Number((Number(week.currentPrice || 0) * slot.promoRate).toFixed(2))
      return {
        ...week,
        weekCount: slot.weekCount,
        promoRate: slot.promoRate,
        promoLabel: slot.promoLabel,
        amount,
      }
    })
    .filter((item) => item && item.amount > 0)

  const amount = breakdown.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const topLineLabel =
    breakdown.length === 1
      ? breakdown[0].promoLabel
      : breakdown.length > 1
        ? `${WEEK_TIER_PROMO.shortLabel} (${breakdown[0].weekCount}-${breakdown[breakdown.length - 1].weekCount})`
        : WEEK_TIER_PROMO.shortLabel

  return {
    eligible: amount > 0,
    amount: Number(amount.toFixed(2)),
    weeksSelected: fullWeeks.length,
    label: topLineLabel,
    breakdown,
  }
}

export function getWeekTierPromoDisplayLines(promo) {
  const breakdown = Array.isArray(promo?.breakdown) ? [...promo.breakdown] : []
  if (breakdown.length === 0) {
    return []
  }

  const ordered = breakdown.sort((a, b) => Number(a.weekCount || 0) - Number(b.weekCount || 0))
  const groups = []

  for (const item of ordered) {
    const last = groups[groups.length - 1]
    const weekCount = Number(item.weekCount || 0)
    const promoRate = Number(item.promoRate || 0)
    const amount = Number(item.amount || 0)
    if (
      last &&
      last.promoRate === promoRate &&
      weekCount === last.endWeek + 1
    ) {
      last.endWeek = weekCount
      last.amount = Number((last.amount + amount).toFixed(2))
      continue
    }

    groups.push({
      promoRate,
      startWeek: weekCount,
      endWeek: weekCount,
      amount,
    })
  }

  return groups.map((group) => {
    const weekLabel =
      group.startWeek === group.endWeek
        ? `Week ${group.startWeek}`
        : `Weeks ${group.startWeek}-${group.endWeek}`
    const rateLabel = group.promoRate >= 1 ? 'FREE' : `${Math.round(group.promoRate * 100)}% OFF`
    return {
      label: `${WEEK_TIER_PROMO.shortLabel} ${weekLabel} (${rateLabel})`,
      amount: Number(group.amount.toFixed(2)),
      promoRate: group.promoRate,
      startWeek: group.startWeek,
      endWeek: group.endWeek,
    }
  })
}

export function getNextWeekTierPromoPrompt(student, weeksById, tuition, options = {}) {
  const fullWeeks = getEligibleFullWeekSelections(student, weeksById, tuition, options)
  const currentCount = fullWeeks.length

  // Never tease an offer that has no slot left for this camper.
  if (!hasWeekTierPromoSlot(options)) {
    return {
      eligible: false,
      soldOut: true,
      currentCount,
    }
  }

  const thresholds = [4, 7, 10]
  const nextThreshold = thresholds.find((value) => value > currentCount)
  if (!nextThreshold || nextThreshold - currentCount !== 1) {
    return {
      eligible: false,
      currentCount,
    }
  }

  const promoRate = getPromoRateForWeekCount(nextThreshold)
  if (promoRate <= 0) {
    return {
      eligible: false,
      currentCount,
    }
  }

  const fallbackCurrentPrice = Math.min(
    getFullWeekPrice('general', tuition, Boolean(options.applyLimitedDiscount)),
    getFullWeekPrice('bootcamp', tuition, Boolean(options.applyLimitedDiscount))
  )
  const estimatedWeekPrice = fullWeeks.reduce((lowest, week) => {
    const price = Number(week.currentPrice || 0)
    if (price <= 0) {
      return lowest
    }
    return lowest > 0 ? Math.min(lowest, price) : price
  }, Number(fallbackCurrentPrice || 0))
  const estimatedSavings = Number((estimatedWeekPrice * promoRate).toFixed(2))
  const rateLabel = promoRate >= 1 ? 'FREE' : `${Math.round(promoRate * 100)}% OFF`

  return {
    eligible: estimatedSavings > 0,
    currentCount,
    nextThreshold,
    weeksAway: nextThreshold - currentCount,
    promoRate,
    rateLabel,
    estimatedSavings,
    message:
      promoRate >= 1
        ? `Add 1 more full week to unlock a FREE week 10.`
        : `Add 1 more full week to unlock ${rateLabel} on that week.`,
  }
}
