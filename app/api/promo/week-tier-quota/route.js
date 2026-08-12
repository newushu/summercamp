import {
  countWeekTierPromoClaims,
  getWeekTierPromoQuotaStatus,
  WEEK_TIER_PROMO_MIN_FULL_WEEKS,
  WEEK_TIER_PROMO_QUOTA,
} from '../../../../lib/campPricing'
import { resolveSeasonYear } from '../../../../lib/campSeasons'
import { supabaseServer, supabaseServerEnabled } from '../../../../lib/supabaseServer'

export const dynamic = 'force-dynamic'

// Registrations are only readable with the service role, so the public site asks
// this route instead of the table. Counts change slowly, so a short in-process
// cache keeps landing-page traffic off the database.
const CACHE_TTL_MS = 60 * 1000
const cache = new Map()

function parseRegistrationMeta(value) {
  try {
    return JSON.parse(String(value || '')) || {}
  } catch {
    return {}
  }
}

function buildEmptyStatus(seasonYear) {
  return {
    ...getWeekTierPromoQuotaStatus(0),
    seasonYear,
    minFullWeeks: WEEK_TIER_PROMO_MIN_FULL_WEEKS,
    source: 'unavailable',
  }
}

export async function GET(request) {
  const url = new URL(request.url)
  const requestedYear = Number(url.searchParams.get('seasonYear'))
  const seasonYear = Number.isFinite(requestedYear) && requestedYear > 2000
    ? requestedYear
    : resolveSeasonYear(new Date())

  if (!supabaseServerEnabled || !supabaseServer) {
    return Response.json(buildEmptyStatus(seasonYear))
  }

  const cached = cache.get(seasonYear)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return Response.json(cached.payload)
  }

  const { data, error } = await supabaseServer
    .from('registrations')
    .select('id, medical_notes')
    .order('created_at', { ascending: true })

  if (error) {
    return Response.json(buildEmptyStatus(seasonYear), { status: 200 })
  }

  let claimed = 0
  for (const record of data || []) {
    const meta = parseRegistrationMeta(record?.medical_notes)
    if (String(meta?.registrationType || '').trim() === 'overnight') {
      continue
    }
    claimed += countWeekTierPromoClaims(meta?.registration?.students, null, { seasonYear })
  }

  const payload = {
    ...getWeekTierPromoQuotaStatus(claimed),
    // Unclamped so the admin can see demand beyond the cap.
    rawClaimed: claimed,
    seasonYear,
    minFullWeeks: WEEK_TIER_PROMO_MIN_FULL_WEEKS,
    quota: WEEK_TIER_PROMO_QUOTA,
    source: 'registrations',
  }

  cache.set(seasonYear, { at: Date.now(), payload })
  return Response.json(payload)
}
