import { supabaseServer, supabaseServerEnabled } from '../../../../lib/supabaseServer'

function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim())
}

const INTERNAL_LEAD_EXCLUDE_EMAILS = new Set([
  'info@newushu.com',
  'calvin@newushu.com',
])

function normalizeAges(values) {
  if (!Array.isArray(values)) {
    return []
  }
  return values
    .map((value) => Number(value || 0))
    .filter((value) => Number.isFinite(value) && value > 0)
}

function normalizeContext(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value
}

async function hasCompletedRegistration(email) {
  const { data, error } = await supabaseServer
    .from('registrations')
    .select('id')
    .eq('guardian_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return Boolean(data?.id)
}

async function captureLeadDirectly({ email, camperCount, camperAges, nextContext, nextLastCompletedStep, nextSource }) {
  const { data: existingRows, error: existingError } = await supabaseServer
    .from('program_interest_profiles')
    .select('id, camper_count, camper_ages, profile_context, last_completed_step, source, created_at')
    .ilike('email', email)
    .order('created_at', { ascending: true })
    .limit(20)

  if (existingError) {
    throw existingError
  }

  const existingLead = Array.isArray(existingRows) && existingRows.length > 0 ? existingRows[0] : null

  if (existingLead?.id) {
    const { error: updateError } = await supabaseServer
      .from('program_interest_profiles')
      .update({
        camper_count: Math.max(camperCount, Number(existingLead.camper_count || 1)),
        camper_ages: camperAges.length > 0 ? camperAges : Array.isArray(existingLead.camper_ages) ? existingLead.camper_ages : [],
        profile_context: {
          ...(normalizeContext(existingLead.profile_context)),
          ...nextContext,
        },
        last_completed_step: Math.max(nextLastCompletedStep, Number(existingLead.last_completed_step || 1)),
        source: String(existingLead.source || '').trim() || nextSource,
      })
      .eq('id', existingLead.id)

    if (updateError) {
      throw updateError
    }

    return existingLead.id
  }

  const { data: insertedLead, error: insertError } = await supabaseServer
    .from('program_interest_profiles')
    .insert({
      email,
      camper_count: camperCount,
      camper_ages: camperAges,
      profile_context: nextContext,
      last_completed_step: nextLastCompletedStep,
      source: nextSource,
    })
    .select('id')
    .single()

  if (insertError) {
    throw insertError
  }

  return insertedLead?.id || null
}

export async function POST(request) {
  try {
    if (!supabaseServerEnabled || !supabaseServer) {
      return Response.json({ error: 'Supabase server client not configured.' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    const email = String(body?.email || '').trim().toLowerCase()
    if (!isValidEmail(email)) {
      return Response.json({ error: 'A valid email is required.' }, { status: 400 })
    }
    if (INTERNAL_LEAD_EXCLUDE_EMAILS.has(email)) {
      return Response.json({ ok: true, action: 'skipped_internal', id: null }, { status: 200 })
    }

    const camperCount = Math.max(1, Number(body?.camper_count || 1))
    const camperAges = normalizeAges(body?.camper_ages)
    const nextContext = normalizeContext(body?.profile_context)
    const nextLastCompletedStep = Math.max(1, Number(body?.last_completed_step || 1))
    const nextSource = String(body?.source || '').trim() || 'summer-camp-program-finder'

    if (await hasCompletedRegistration(email)) {
      return Response.json({ ok: true, action: 'skipped_registered', id: null }, { status: 200 })
    }

    const { data, error } = await supabaseServer.rpc('capture_program_interest_profile', {
      p_email: email,
      p_camper_count: camperCount,
      p_camper_ages: camperAges,
      p_profile_context: nextContext,
      p_last_completed_step: nextLastCompletedStep,
      p_source: nextSource,
    })

    if (error) {
      const canFallback =
        error.message.includes('Could not find the function') ||
        error.message.includes('schema cache') ||
        error.message.includes('capture_program_interest_profile')

      if (!canFallback) {
        return Response.json({ error: error.message }, { status: 500 })
      }

      const directId = await captureLeadDirectly({
        email,
        camperCount,
        camperAges,
        nextContext,
        nextLastCompletedStep,
        nextSource,
      })
      return Response.json({ ok: true, action: 'captured_direct', id: directId }, { status: 200 })
    }

    return Response.json({ ok: true, action: 'captured', id: data || null }, { status: 200 })
  } catch (error) {
    return Response.json({ error: error?.message || 'Lead capture failed.' }, { status: 500 })
  }
}
