function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim())
}

export async function POST(request) {
  try {
    const body = await request.json()
    const toEmail = String(body?.toEmail || '').trim()
    const stepNumber = Number(body?.stepNumber || 0)
    const template = body?.template || {}
    const subject = String(template?.subject || '').trim()
    const content = String(template?.body || '').trim()

    if (!isValidEmail(toEmail)) {
      return Response.json({ error: 'Invalid recipient email.' }, { status: 400 })
    }
    if (!stepNumber || stepNumber < 1 || stepNumber > 5) {
      return Response.json({ error: 'Invalid step number.' }, { status: 400 })
    }
    if (!subject || !content) {
      return Response.json({ error: 'Template subject/body is required.' }, { status: 400 })
    }

    const apiKey = process.env.SENDGRID_API_KEY
    const fromEmail = process.env.SENDGRID_FROM_EMAIL

    if (!apiKey || !fromEmail) {
      return Response.json(
        {
          sent: false,
          configured: false,
          previewOnly: true,
          message:
            'Missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL. Add them in .env to send real test emails.',
        },
        { status: 200 }
      )
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.55; color:#0f172a; max-width:640px;">
        <p style="font-size:12px; color:#64748b;">New England Wushu Test Email - Step ${stepNumber}</p>
        <h2 style="margin:0 0 12px; font-size:20px;">${subject}</h2>
        <p style="white-space:pre-line; margin:0 0 16px;">${content}</p>
      </div>
    `

    const sendResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: toEmail }] }],
        from: { email: fromEmail, name: 'New England Wushu' },
        subject,
        content: [
          { type: 'text/plain', value: content },
          { type: 'text/html', value: html },
        ],
      }),
    })

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text()
      return Response.json(
        {
          sent: false,
          configured: true,
          error: `SendGrid send failed: ${errorText || sendResponse.statusText}`,
        },
        { status: 500 }
      )
    }

    return Response.json({ sent: true, configured: true }, { status: 200 })
  } catch (error) {
    return Response.json({ error: error.message || 'Request failed.' }, { status: 500 })
  }
}
