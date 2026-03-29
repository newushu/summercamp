import { supabaseServer } from '../../../../lib/supabaseServer'

const TRANSPARENT_GIF_BASE64 = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

function gifResponse() {
  return new Response(Buffer.from(TRANSPARENT_GIF_BASE64, 'base64'), {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

function buildEventType(flow = '', stepKey = '', stepNumber = 0) {
  const normalizedFlow = String(flow || '').trim().toLowerCase()
  const normalizedStepKey = String(stepKey || '').trim().toLowerCase()
  if (normalizedFlow === 'lead') {
    return 'lead_journey_opened'
  }
  if (normalizedStepKey.startsWith('paid_')) {
    if (['paid_7d', 'paid_5d', 'paid_3d', 'paid_1d'].includes(normalizedStepKey)) {
      return 'paid_prep_opened'
    }
    if (['paid_2w', 'paid_4w', 'paid_8w'].includes(normalizedStepKey)) {
      return 'paid_followup_opened'
    }
  }
  if (Number(stepNumber || 0) > 0) {
    return 'reservation_email_opened'
  }
  return 'email_opened'
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const runId = Number(searchParams.get('runId') || 0)
    const stepNumber = Number(searchParams.get('stepNumber') || 0)
    const stepKey = String(searchParams.get('stepKey') || '').trim()
    const flow = String(searchParams.get('flow') || '').trim()

    if (runId > 0) {
      const { data: run } = await supabaseServer
        .from('email_journey_runs')
        .select('id, profile_id, email')
        .eq('id', runId)
        .maybeSingle()

      if (run?.id) {
        await supabaseServer.from('email_journey_events').insert({
          run_id: run.id,
          profile_id: run.profile_id || null,
          email: run.email || '',
          step_number: stepNumber > 0 ? stepNumber : null,
          event_type: buildEventType(flow, stepKey, stepNumber),
          subject: 'Email opened',
          body_preview: 'Tracking pixel requested by recipient inbox.',
          event_payload: {
            flow: flow || '',
            stepKey: stepKey || '',
            userAgent: request.headers.get('user-agent') || '',
          },
          event_at: new Date().toISOString(),
        })
      }
    }
  } catch {
    return gifResponse()
  }

  return gifResponse()
}
