function buildFallbackReply(customerName, subject, message, tone) {
  const name = customerName || 'there'
  const toneLine =
    tone === 'warm'
      ? 'Thanks so much for your thoughtful message.'
      : tone === 'direct'
        ? 'Thanks for your message.'
        : 'Thank you for reaching out.'

  return `${toneLine} ${name},\n\nWe received your note about "${subject || 'your question'}" and we are happy to help. ${message ? 'Based on what you shared, we can recommend the best-fit next step for your camper and schedule.' : 'We can help you choose the best-fit camp option for your goals.'}\n\nIf you want, reply with your preferred camp weeks and we can guide you through a fast registration plan.\n\nBest,\nNew England Wushu`
}

export async function POST(request) {
  try {
    const body = await request.json()
    const customerName = String(body?.customerName || '').trim()
    const subject = String(body?.subject || '').trim()
    const message = String(body?.message || '').trim()
    const tone = String(body?.tone || 'professional').trim()

    if (!message) {
      return Response.json({ error: 'Message text is required.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json(
        {
          configured: false,
          draft: buildFallbackReply(customerName, subject, message, tone),
        },
        { status: 200 }
      )
    }

    const prompt = [
      'You are an assistant helping a summer camp admin draft an email reply.',
      'Return plain text only. No markdown.',
      'Write a concise parent-facing response in 4 short paragraphs max.',
      'Tone options: professional, warm, direct.',
      'Include a practical next step and invitation to register.',
      `Tone: ${tone}`,
      `Customer name: ${customerName || '(not provided)'}`,
      `Subject: ${subject || '(not provided)'}`,
      `Inbound message:\n${message}`,
    ].join('\n')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 320,
          },
        }),
      }
    )

    const data = await response.json()
    if (!response.ok) {
      return Response.json(
        { configured: true, error: data?.error?.message || 'Gemini request failed.' },
        { status: 500 }
      )
    }

    const draft =
      data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('\n').trim() || ''

    return Response.json(
      {
        configured: true,
        draft: draft || buildFallbackReply(customerName, subject, message, tone),
      },
      { status: 200 }
    )
  } catch (error) {
    return Response.json({ error: error.message || 'Request failed.' }, { status: 500 })
  }
}
