import { resolveBootcampTuition } from './campAdmin'

export const WEEK_TIER_PROMO = {
  shortLabel: 'Train More, Save More',
  headline: 'Earn 50% OFF full weeks when one camper enrolls in 4 or more full day-camp weeks.',
  detail: 'Applies only to one camper’s day-camp full-week tuition. Lunch is never discounted, and overnight camp does not count.',
  tiers: 'Weeks 4-6 are 50% OFF, weeks 7-9 are 60% OFF, and week 10 is FREE.',
  growth: 'More weeks help campers build stronger skills, confidence, consistency, and visible progress.',
  cap: 'Limited to the first 30 campers.',
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

function getFullWeekPrice(rateType, tuition, applyLimitedDiscount) {
  const regular = tuition?.regular || {}
  const discount = tuition?.discount || {}
  const bootcamp = resolveBootcampTuition(tuition)

  if (rateType === 'bootcamp') {
    const regularPrice = Number(bootcamp.regular.fullWeek || 0)
    const discountedPrice = Number(bootcamp.discount.fullWeek || 0)
    return applyLimitedDiscount && discountedPrice > 0 ? Math.min(regularPrice, discountedPrice) : regularPrice
  }

  const regularPrice = Number(regular.fullWeek || 0)
  const discountedPrice = Number(discount.fullWeek || 0)
  return applyLimitedDiscount && discountedPrice > 0 ? Math.min(regularPrice, discountedPrice) : regularPrice
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
        currentPrice: getFullWeekPrice(rateType, tuition, applyLimitedDiscount),
      }
    })
    .filter(Boolean)
    .sort((a, b) => String(a.weekStart || '').localeCompare(String(b.weekStart || '')))
}

export function getWeekTierPromoForStudent(student, weeksById, tuition, options = {}) {
  const fullWeeks = getEligibleFullWeekSelections(student, weeksById, tuition, options)
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
