import {
  buildProgramWeekOptions,
  getLimitedDiscountCampaigns,
  getSelectedWeeks,
  LIMITED_DISCOUNT_CAMPAIGN_IDS,
  resolveBootcampTuition,
  roundTuitionToFive,
  ROUND_ONE_DISCOUNT_NAME,
  ROUND_ONE_FULL_WEEK_DISCOUNT_AMOUNT,
  ROUND_THREE_DISCOUNT_NAME,
  ROUND_THREE_FULL_WEEK_DISCOUNT_AMOUNT,
  ROUND_TWO_DISCOUNT_NAME,
  ROUND_TWO_FULL_WEEK_DISCOUNT_AMOUNT,
} from './campAdmin'

// The first season that was hand-configured in the admin console. Seasons at or
// before this year keep their original, explicitly published discount windows so
// past registrations keep resolving to the exact same campaign.
export const SEASON_BASE_YEAR = 2026

// How many seasons the public site and the admin console plan ahead for.
export const SEASON_PLANNING_COUNT = 3

// The site flips to the next season on October 1.
export const SEASON_ROLLOVER_MONTH = 10
export const SEASON_ROLLOVER_DAY = 1

const MS_PER_DAY = 24 * 60 * 60 * 1000

function pad(value) {
  return String(value).padStart(2, '0')
}

export function toIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return ''
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseIsoDate(value) {
  const raw = String(value || '').trim().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return null
  }
  const [year, month, day] = raw.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function shiftIsoDays(value, days) {
  const parsed = parseIsoDate(value)
  if (!parsed) {
    return ''
  }
  parsed.setDate(parsed.getDate() + Number(days || 0))
  return toIsoDate(parsed)
}

export function shiftIsoMonths(value, months) {
  const parsed = parseIsoDate(value)
  if (!parsed) {
    return ''
  }
  const targetDay = parsed.getDate()
  parsed.setDate(1)
  parsed.setMonth(parsed.getMonth() + Number(months || 0))
  const lastDayOfTargetMonth = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0).getDate()
  parsed.setDate(Math.min(targetDay, lastDayOfTargetMonth))
  return toIsoDate(parsed)
}

function toDateOrNow(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value)
  }
  const fromIso = parseIsoDate(value)
  if (fromIso) {
    return fromIso
  }
  return new Date()
}

/**
 * The season a given moment belongs to. On and after October 1 of year Y the
 * site is selling the summer of Y + 1.
 */
export function resolveSeasonYear(now) {
  const date = toDateOrNow(now)
  const year = date.getFullYear()
  const rollover = new Date(year, SEASON_ROLLOVER_MONTH - 1, SEASON_ROLLOVER_DAY)
  return date.getTime() >= rollover.getTime() ? year + 1 : year
}

/** The active season plus the following seasons the admin can pre-configure. */
export function getSeasonYears(now) {
  const start = Math.max(SEASON_BASE_YEAR, resolveSeasonYear(now))
  return Array.from({ length: SEASON_PLANNING_COUNT }).map((_, index) => start + index)
}

export function isSupportedSeasonYear(year, now) {
  return getSeasonYears(now).includes(Number(year))
}

function lastWeekdayOnOrBefore(date, weekday) {
  const result = new Date(date)
  while (result.getDay() !== weekday) {
    result.setDate(result.getDate() - 1)
  }
  return result
}

/**
 * Monday of the last Monday-Friday week that finishes inside June.
 */
function getSeasonFirstMonday(year) {
  const lastJuneFriday = lastWeekdayOnOrBefore(new Date(year, 5, 30), 5)
  const monday = new Date(lastJuneFriday)
  monday.setDate(monday.getDate() - 4)
  return monday
}

/**
 * Friday of the last Monday-Friday week that finishes inside August.
 */
function getSeasonLastFriday(year) {
  return lastWeekdayOnOrBefore(new Date(year, 7, 31), 5)
}

/**
 * Default published calendar for a season: the last full week of June plus every
 * full Monday-Friday week that runs through July and August.
 */
export function getSeasonDayCampWindow(year) {
  const numericYear = Number(year)
  if (!Number.isFinite(numericYear)) {
    return { startDate: '', endDate: '' }
  }
  return {
    startDate: toIsoDate(getSeasonFirstMonday(numericYear)),
    endDate: toIsoDate(getSeasonLastFriday(numericYear)),
  }
}

/** Overnight weeks run Sunday-Saturday around the same summer window. */
export function getSeasonOvernightWindow(year) {
  const { startDate, endDate } = getSeasonDayCampWindow(year)
  if (!startDate || !endDate) {
    return { startDate: '', endDate: '' }
  }
  return {
    startDate: shiftIsoDays(startDate, -1),
    endDate: shiftIsoDays(endDate, 1),
  }
}

export function getSeasonProgramWindow(programKey, year) {
  return programKey === 'overnight' ? getSeasonOvernightWindow(year) : getSeasonDayCampWindow(year)
}

/** Generated (not admin-picked) week options for a season. */
export function buildSeasonProgramWeeks(programKey, year) {
  const { startDate, endDate } = getSeasonProgramWindow(programKey, year)
  return buildProgramWeekOptions(programKey, startDate, endDate)
}

function getWeekYear(week) {
  return Number(String(week?.start || '').slice(0, 4))
}

/**
 * Weeks the public site should offer for a season.
 *
 * Admin-picked weeks win whenever the admin has published weeks for that season,
 * so 2026 keeps exactly the calendar that is live today. Seasons the admin has
 * not touched yet fall back to the generated summer calendar.
 */
export function getSeasonWeeks(programKey, programConfig, year) {
  const seasonYear = Number(year)
  const configured = getSelectedWeeks(programKey, programConfig || {}).filter(
    (week) => getWeekYear(week) === seasonYear
  )
  if (configured.length > 0) {
    return configured
  }
  return buildSeasonProgramWeeks(programKey, seasonYear)
}

export function getSeasonCampDates(programConfig, year) {
  const weeks = getSeasonWeeks('general', programConfig, year)
  if (weeks.length === 0) {
    return getSeasonDayCampWindow(year)
  }
  const sorted = [...weeks].sort((a, b) => String(a.start).localeCompare(String(b.start)))
  return {
    startDate: sorted[0].start,
    endDate: sorted[sorted.length - 1].end,
  }
}

const SEASON_ROUND_AMOUNTS = {
  [LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_ONE]: ROUND_ONE_FULL_WEEK_DISCOUNT_AMOUNT,
  [LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_TWO]: ROUND_TWO_FULL_WEEK_DISCOUNT_AMOUNT,
  [LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_THREE]: ROUND_THREE_FULL_WEEK_DISCOUNT_AMOUNT,
}

const SEASON_ROUND_NAMES = {
  [LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_ONE]: ROUND_ONE_DISCOUNT_NAME,
  [LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_TWO]: ROUND_TWO_DISCOUNT_NAME,
  [LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_THREE]: ROUND_THREE_DISCOUNT_NAME,
}

const SEASON_ROUND_NAMES_ZH = {
  [LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_ONE]: '第一轮早鸟特惠',
  [LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_TWO]: '第二轮早鸟特惠',
  [LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_THREE]: '第三轮夏季特惠',
}

export function getSeasonRoundName(roundId) {
  return SEASON_ROUND_NAMES[roundId] || ''
}

export function getSeasonRoundNameZh(roundId) {
  return SEASON_ROUND_NAMES_ZH[roundId] || ''
}

/**
 * Discount rounds for a season.
 *
 * Round 1 opens when the season opens (October 1 of the prior year) and runs
 * until one month before the first day of camp. Round 2 picks up from there and
 * ends on the first day of camp. Round 3 starts the day after camp begins and
 * runs to the last day of the season.
 *
 * The 2026 season keeps its originally published dates so that accounting for
 * existing registrations is unchanged.
 */
export function getSeasonDiscountRounds(year, options = {}) {
  const seasonYear = Number(year)
  if (!Number.isFinite(seasonYear)) {
    return []
  }

  if (seasonYear <= SEASON_BASE_YEAR) {
    return getLimitedDiscountCampaigns(options.discountEndDate).map((campaign) => ({
      ...campaign,
      seasonYear: SEASON_BASE_YEAR,
      nameZh: getSeasonRoundNameZh(campaign.id),
    }))
  }

  const { startDate, endDate } = options.programConfig
    ? getSeasonCampDates(options.programConfig, seasonYear)
    : getSeasonDayCampWindow(seasonYear)

  const firstCampDay = startDate || getSeasonDayCampWindow(seasonYear).startDate
  const lastCampDay = endDate || getSeasonDayCampWindow(seasonYear).endDate
  const roundOneEnd = shiftIsoMonths(firstCampDay, -1)

  const build = (id, startsAt, endsAt) => ({
    id,
    name: SEASON_ROUND_NAMES[id],
    nameZh: SEASON_ROUND_NAMES_ZH[id],
    fullWeekDiscountAmount: SEASON_ROUND_AMOUNTS[id],
    startsAt,
    endsAt,
    seasonYear,
  })

  return [
    build(
      LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_ONE,
      `${seasonYear - 1}-${pad(SEASON_ROLLOVER_MONTH)}-${pad(SEASON_ROLLOVER_DAY)}`,
      roundOneEnd
    ),
    build(LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_TWO, shiftIsoDays(roundOneEnd, 1), firstCampDay),
    build(LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_THREE, shiftIsoDays(firstCampDay, 1), lastCampDay),
  ]
}

/** The round that covers `now`, or null when the season is between/past rounds. */
export function resolveSeasonRound(year, now, options = {}) {
  const today = toIsoDate(toDateOrNow(now))
  if (!today) {
    return null
  }
  return (
    getSeasonDiscountRounds(year, options).find((round) => {
      if (round.startsAt && today < round.startsAt) {
        return false
      }
      if (round.endsAt && today > round.endsAt) {
        return false
      }
      return true
    }) || null
  )
}

/** The next round that has not opened yet, used for "opens on" messaging. */
export function resolveUpcomingSeasonRound(year, now, options = {}) {
  const today = toIsoDate(toDateOrNow(now))
  return (
    getSeasonDiscountRounds(year, options)
      .filter((round) => round.startsAt && today < round.startsAt)
      .sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt)))[0] || null
  )
}

export function getSeasonRoundCountdownTarget(round) {
  const end = parseIsoDate(round?.endsAt)
  if (!end) {
    return null
  }
  return new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
}

export function getSeasonRoundDaysRemaining(round, now) {
  const target = getSeasonRoundCountdownTarget(round)
  if (!target) {
    return 0
  }
  return Math.max(0, Math.ceil((target.getTime() - toDateOrNow(now).getTime()) / MS_PER_DAY))
}

// ---------------------------------------------------------------------------
// Per-season pricing overrides
// ---------------------------------------------------------------------------

const SEASON_TUITION_KEYS = ['fullWeek', 'fullDay', 'amHalf', 'pmHalf', 'overnightWeek', 'overnightDay']
const SEASON_BOOTCAMP_KEYS = ['fullWeek', 'fullDay', 'amHalf', 'pmHalf']

export function getSeasonSettings(config, year) {
  const settings = config?.seasonSettings || {}
  return settings[String(year)] || null
}

function mergePositiveOverrides(base = {}, override = {}, keys = []) {
  const merged = { ...base }
  for (const key of keys) {
    const value = Number(override?.[key])
    if (Number.isFinite(value) && value > 0) {
      merged[key] = value
    }
  }
  return merged
}

/**
 * Tuition for a season. Any override left at 0 inherits the base tuition table,
 * so the admin only has to type the numbers that actually change year to year.
 */
export function getSeasonTuition(config, year) {
  const base = config?.tuition || {}
  const override = getSeasonSettings(config, year)?.tuition
  if (!override) {
    return base
  }

  const regular = mergePositiveOverrides(base.regular, override.regular, SEASON_TUITION_KEYS)
  const baseBootcamp = resolveBootcampTuition(base)
  const bootcampRegular = mergePositiveOverrides(
    baseBootcamp.regular,
    override.bootcamp?.regular,
    SEASON_BOOTCAMP_KEYS
  )
  const lunchPrice = Number(override.lunchPrice)

  const deriveDiscount = (regularValue, baseDiscountValue) => {
    const amount = Number(regularValue || 0)
    if (amount <= 0) {
      return Number(baseDiscountValue || 0)
    }
    return roundTuitionToFive(Math.max(0, amount - ROUND_THREE_FULL_WEEK_DISCOUNT_AMOUNT))
  }

  return {
    ...base,
    regular,
    discount: {
      ...(base.discount || {}),
      fullWeek: deriveDiscount(regular.fullWeek, base.discount?.fullWeek),
      overnightWeek: deriveDiscount(regular.overnightWeek, base.discount?.overnightWeek),
    },
    bootcamp: {
      ...(base.bootcamp || {}),
      regular: bootcampRegular,
      discount: {
        ...(base.bootcamp?.discount || {}),
        fullWeek: deriveDiscount(bootcampRegular.fullWeek, base.bootcamp?.discount?.fullWeek),
      },
    },
    lunchPrice: Number.isFinite(lunchPrice) && lunchPrice > 0 ? lunchPrice : Number(base.lunchPrice || 0),
  }
}

export function getSeasonHeroBanner(config, year) {
  const settings = getSeasonSettings(config, year) || {}
  const fallbackImage = String(config?.media?.heroImageUrl || '').trim()
  return {
    imageUrl: String(settings.heroBannerImageUrl || '').trim() || fallbackImage,
    videoUrl: String(settings.heroBannerVideoUrl || '').trim(),
    headline: String(settings.heroBannerHeadline || '').trim(),
    subhead: String(settings.heroBannerSubhead || '').trim(),
  }
}

// ---------------------------------------------------------------------------
// Admin date simulation
// ---------------------------------------------------------------------------

export const SEASON_SIMULATION_PARAM = 'simulateDate'
export const SEASON_SIMULATION_STORAGE_KEY = 'new-england-wushu-simulated-date-v1'

/** Key moments an admin will want to preview, grouped by season. */
export function getSeasonSimulationCheckpoints(now, options = {}) {
  return getSeasonYears(now).flatMap((year) => {
    const rounds = getSeasonDiscountRounds(year, options)
    const { startDate, endDate } = options.programConfig
      ? getSeasonCampDates(options.programConfig, year)
      : getSeasonDayCampWindow(year)
    const roundById = Object.fromEntries(rounds.map((round) => [round.id, round]))
    const roundOne = roundById[LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_ONE]
    const roundTwo = roundById[LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_TWO]
    const roundThree = roundById[LIMITED_DISCOUNT_CAMPAIGN_IDS.ROUND_THREE]

    return [
      { year, label: `${year} season opens`, detail: 'Round 1 live', date: roundOne?.startsAt || '' },
      { year, label: `${year} Round 1 ends`, detail: '1 month before day 1', date: roundOne?.endsAt || '' },
      { year, label: `${year} Round 2 live`, detail: 'Until day 1', date: roundTwo?.startsAt || '' },
      { year, label: `${year} camp day 1`, detail: 'Round 2 last day', date: startDate },
      { year, label: `${year} Round 3 live`, detail: 'After camp starts', date: roundThree?.startsAt || '' },
      { year, label: `${year} season ends`, detail: 'Round 3 last day', date: endDate },
    ].filter((item) => Boolean(item.date))
  })
}

export function normalizeSimulatedDate(value) {
  const parsed = parseIsoDate(value)
  return parsed ? toIsoDate(parsed) : ''
}
