import { supabaseServer, supabaseServerEnabled } from '../../../../lib/supabaseServer'

function buildFallbackReply(fromEmail, subject, message) {
  return `Hi,\n\nThank you for your email${fromEmail ? `, ${fromEmail}` : ''}. We received your message${
    subject ? ` regarding "${subject}"` : ''
  } and we are happy to help.\n\n${
    message
      ? 'Based on your note, we can help you choose the best-fit camp option and schedule for your camper.'
      : 'We can help you choose the best-fit camp option and schedule.'
  }\n\nIf you want, reply with your preferred camp weeks and we will guide you through a quick registration plan.\n\nBest,\nNew England Wushu`
}

async function generateDraftWithGemini(reply, apiKey) {
  const fallback = buildFallbackReply(reply.from_email, reply.subject, reply.body_text || '')

  if (!apiKey) {
    return { draft: fallback, configured: false }
  }

  const prompt = [
    'You write concise parent-facing customer support emails for a youth summer camp.',
    'Return plain text only. No markdown.',
    'Keep to 4 short paragraphs maximum.',
    'Acknowledge the parent concern, provide helpful guidance, and include a practical next step to register.',
    `From email: ${reply.from_email || ''}`,
    `Subject: ${reply.subject || ''}`,
    `Message: ${reply.body_text || ''}`,
  ].join('\n')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 360,
        },
      }),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    return { draft: fallback, configured: true, error: data?.error?.message || 'Gemini request failed.' }
  }

  const draft =
    data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('\n').trim() || fallback

  return { draft, configured: true }
}

async function sendReplyWithSendGrid({ toEmail, subject, bodyText, apiKey, fromEmail }) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.55; color:#0f172a; max-width:640px;">
      <p style="white-space:pre-line; margin:0 0 16px;">${bodyText}</p>
    </div>
  `

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail, name: 'New England Wushu' },
      subject: subject?.startsWith('Re:') ? subject : `Re: ${subject || 'Your question'}`,
      content: [
        { type: 'text/plain', value: bodyText },
        { type: 'text/html', value: html },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || response.statusText)
  }
}

export async function POST(request) {
  try {
    const secret = request.headers.get('x-cron-secret') || ''
    const expected = process.env.AUTOMATION_CRON_SECRET || ''
    if (!expected || secret !== expected) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseServerEnabled || !supabaseServer) {
      return Response.json({ error: 'Supabase server client not configured.' }, { status: 500 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || ''
    const sendgridApiKey = process.env.SENDGRID_API_KEY || ''
    const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || ''
    const autoSendEnabled = String(process.env.AUTO_SEND_AI_REPLIES || '').toLowerCase() === 'true'

    const { data: replies, error: repliesError } = await supabaseServer
      .from('email_replies')
      .select('id, run_id, profile_id, email, from_email, subject, body_text, is_unread, ai_status')
      .eq('is_unread', true)
      .eq('ai_status', 'pending')
      .order('received_at', { ascending: true })
      .limit(25)

    if (repliesError) {
      return Response.json({ error: repliesError.message }, { status: 500 })
    }

    let draftedCount = 0
    let sentCount = 0
    let errorCount = 0

    for (const reply of replies || []) {
      try {
        const draftResult = await generateDraftWithGemini(reply, geminiApiKey)
        const draftText = draftResult.draft
        const nowIso = new Date().toISOString()

        const nextStatus = autoSendEnabled && sendgridApiKey && sendgridFromEmail ? 'sending' : 'drafted'
        await supabaseServer
          .from('email_replies')
          .update({
            ai_status: nextStatus,
            ai_draft: draftText,
            ai_generated_at: nowIso,
            ai_error: draftResult.error || null,
          })
          .eq('id', reply.id)

        await supabaseServer.from('email_journey_events').insert({
          run_id: reply.run_id,
          profile_id: reply.profile_id,
          email: reply.email,
          step_number: null,
          event_type: 'ai_reply_drafted',
          subject: reply.subject || 'Reply',
          body_preview: draftText.slice(0, 400),
          event_payload: {
            configuredGemini: draftResult.configured,
          },
        })
        draftedCount += 1

        if (autoSendEnabled && sendgridApiKey && sendgridFromEmail) {
          await sendReplyWithSendGrid({
            toEmail: reply.from_email || reply.email,
            subject: reply.subject || 'Your question',
            bodyText: draftText,
            apiKey: sendgridApiKey,
            fromEmail: sendgridFromEmail,
          })

          await supabaseServer
            .from('email_replies')
            .update({
              ai_status: 'sent',
              ai_sent_at: new Date().toISOString(),
              is_unread: false,
              ai_error: null,
            })
            .eq('id', reply.id)

          await supabaseServer.from('email_journey_events').insert({
            run_id: reply.run_id,
            profile_id: reply.profile_id,
            email: reply.email,
            step_number: null,
            event_type: 'ai_reply_sent',
            subject: reply.subject || 'Reply',
            event_payload: {},
          })
          sentCount += 1
        }
      } catch (error) {
        errorCount += 1
        await supabaseServer
          .from('email_replies')
          .update({
            ai_status: 'error',
            ai_error: error.message || 'Processing failed.',
          })
          .eq('id', reply.id)
      }
    }

    return Response.json(
      {
        ok: true,
        processed: (replies || []).length,
        drafted: draftedCount,
        sent: sentCount,
        errors: errorCount,
        autoSendEnabled,
      },
      { status: 200 }
    )
  } catch (error) {
    return Response.json({ error: error.message || 'Request failed.' }, { status: 500 })
  }
}
