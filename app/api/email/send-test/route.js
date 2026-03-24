import { sendWithSes } from '../../../../lib/emailProvider'
import { supabaseServer, supabaseServerEnabled } from '../../../../lib/supabaseServer'

function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim())
}

function escapeHtml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function getEmailBranding() {
  const envLogoUrl = String(process.env.NEXT_PUBLIC_WELCOME_LOGO_URL || '').trim()
  if (!supabaseServerEnabled || !supabaseServer) {
    return envLogoUrl
  }

  const { data, error } = await supabaseServer
    .from('camp_admin_settings')
    .select('welcome_logo_url')
    .eq('id', true)
    .maybeSingle()

  if (error) {
    return envLogoUrl
  }

  return String(data?.welcome_logo_url || envLogoUrl || '').trim()
}

function buildLevelUpRewardsHtml() {
  return `
    <div style="margin:12px 0 0;padding:12px;border:1px solid #fcd34d;border-radius:12px;background:linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%);">
      <p style="margin:0;font-size:14px;color:#b45309;font-weight:700;">New England Wushu Level Up Rewards</p>
      <p style="margin:6px 0 0;font-size:14px;color:#7c2d12;">Earn 2,500 points for each full week enrollment, 500 for each full day, and 100 for each half day enrollment.</p>
      <p style="margin:6px 0 0;font-size:14px;color:#7c2d12;">Points can be saved for prizes, equipment, and future discounts during the fall or spring season.</p>
    </div>
  `
}

function buildMarketingEmailHtml({ subject, content, stepNumber, logoUrl = '' }) {
  const safeSubject = escapeHtml(subject)
  let greetingHtml = ''
  const sectionHtml = String(content || '')
    .split(/\n\s*\n/)
    .map((group) =>
      group
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    )
    .filter((group) => group.length > 0)
    .map((group, index) => {
      const lines = [...group]
      if (!greetingHtml && /^(hi|hello)\b/i.test(lines[0] || '')) {
        greetingHtml = `<p style="margin:16px 0 0;font-size:16px;color:#334155;">${escapeHtml(lines.shift())}</p>`
      }
      if (lines.length === 0) return ''
      return `
        <div style="margin:16px 0 0;padding:16px 18px;border:1px solid ${index === 0 ? '#fde68a' : '#dbe5f0'};border-radius:18px;background:${index === 0 ? 'linear-gradient(180deg,#fffdf4 0%,#fff7d6 100%)' : '#ffffff'};box-shadow:0 10px 24px rgba(15,23,42,0.05);">
          ${lines
            .map((line) => `<p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#334155;">${escapeHtml(line)}</p>`)
            .join('')}
        </div>
      `
    })
    .join('')
  return `
    <div style="margin:0;padding:20px;background:linear-gradient(180deg,#fff7ed 0%,#eff6ff 100%);">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #fde68a;border-radius:18px;overflow:hidden;box-shadow:0 20px 40px rgba(194,65,12,0.12);font-family:Arial,sans-serif;color:#0f172a;">
        <div style="padding:14px 18px;background:linear-gradient(135deg,#f59e0b 0%,#f97316 36%,#0284c7 100%);color:#ffffff;">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="New England Wushu" style="display:block;max-height:48px;margin:0 0 10px;" />` : ''}
          <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">New England Wushu Summer Camp</p>
          <p style="margin:6px 0 0;font-size:13px;opacity:0.95;">Summer 2026 Family Update</p>
        </div>
        <div style="padding:22px 20px 14px;">
          <div style="margin:0 0 14px;padding:10px 12px;border:1px solid #f59e0b;border-radius:12px;background:#fffbeb;color:#92400e;font-size:13px;font-weight:700;">
            Admin test email. This is not a live automated journey send.
          </div>
          <div style="padding:16px 18px;border:1px solid #fde68a;border-radius:20px;background:linear-gradient(180deg,#fffdf4 0%,#fff7d6 100%);">
            <h2 style="margin:0 0 10px;font-size:26px;line-height:1.2;color:#0f172a;">${safeSubject}</h2>
            <p style="margin:0;font-size:15px;line-height:1.6;color:#7c2d12;">Professional preview for step ${Number(stepNumber || 0) || 1}.</p>
          </div>
          ${greetingHtml}
          ${sectionHtml}
          <div style="margin:16px 0 0;padding:12px;border:1px solid #fcd34d;border-radius:12px;background:linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%);">
            <p style="margin:0;font-size:14px;color:#92400e;font-weight:700;">Reminder Block</p>
            <p style="margin:6px 0 0;font-size:14px;color:#78350f;">Use warm highlight boxes sparingly for urgency or payment details only.</p>
          </div>
          ${buildLevelUpRewardsHtml()}
          <div style="margin:12px 0 0;padding:12px;border:1px solid #93c5fd;border-radius:12px;background:linear-gradient(180deg,#eff6ff 0%,#dbeafe 100%);">
            <p style="margin:0;font-size:14px;color:#1d4ed8;font-weight:700;">Level Up App</p>
            <p style="margin:6px 0 0;font-size:14px;color:#1e3a8a;">Download opens June 20 for lunch access, daily photos/videos, and instructor notes.</p>
          </div>
        </div>
      </div>
    </div>
  `
}

function escapePdfText(input) {
  return String(input || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function buildSimplePdfBase64({ title, lines }) {
  const normalizedLines = [String(title || 'Payment Summary'), ...(Array.isArray(lines) ? lines : [])]
    .map((line) => String(line || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 42)

  const streamLines = [
    'BT',
    '/F1 12 Tf',
    '50 760 Td',
    '15 TL',
    ...normalizedLines.map((line) => `(${escapePdfText(line)}) Tj T*`),
    'ET',
  ]
  const stream = streamLines.join('\n')
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${Buffer.byteLength(stream, 'utf8')} >> stream\n${stream}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += `${object}\n`
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return Buffer.from(pdf, 'utf8').toString('base64')
}

export async function POST(request) {
  try {
    const body = await request.json()
    const toEmail = String(body?.toEmail || '').trim()
    const stepNumber = Number(body?.stepNumber || 0)
    const template = body?.template || {}
    const flowKey = String(body?.flowKey || 'lead').trim().toLowerCase()
    const subject = String(template?.subject || '').trim()
    const content = String(template?.body || '').trim()

    if (!isValidEmail(toEmail)) {
      return Response.json({ error: 'Invalid recipient email.' }, { status: 400 })
    }
    if (!stepNumber || stepNumber < 1 || stepNumber > 9) {
      return Response.json({ error: 'Invalid step number.' }, { status: 400 })
    }
    if (!subject || !content) {
      return Response.json({ error: 'Template subject/body is required.' }, { status: 400 })
    }

    const sampleAmount = '$1,680.00'
    const renderedBody = `ADMIN TEST EMAIL\n\n${content.replaceAll('{amount_due}', sampleAmount)}`
    const displaySubject = subject.startsWith('[TEST] ') ? subject : `[TEST] ${subject}`
    const logoUrl = await getEmailBranding()
    const html = buildMarketingEmailHtml({ subject: displaySubject, content: renderedBody, stepNumber, logoUrl })
    const attachments =
      flowKey === 'reservation'
        ? [
            {
              filename: 'camp-payment-summary.pdf',
              contentType: 'application/pdf',
              contentBase64: buildSimplePdfBase64({
                title: 'New England Wushu Payment Summary (Test)',
                lines: [
                  `Step ${stepNumber} test email`,
                  `Amount due: ${sampleAmount}`,
                  '',
                  'Payment methods:',
                  'Zelle: wushu688@gmail.com',
                  'Venmo: @newushu',
                  'Check (payable to Newushu): 123 Muller Rd',
                ],
              }),
            },
          ]
        : []
    const sendResult = await sendWithSes({
      toEmail,
      subject: displaySubject,
      bodyText: renderedBody,
      html,
      attachments,
    })

    if (sendResult.previewOnly) {
      return Response.json(
        {
          sent: false,
          configured: false,
          previewOnly: true,
          message: sendResult.error,
        },
        { status: 200 }
      )
    }
    if (!sendResult.sent) {
      return Response.json({ sent: false, configured: true, error: sendResult.error }, { status: 500 })
    }

    return Response.json({ sent: true, configured: true }, { status: 200 })
  } catch (error) {
    return Response.json({ error: error.message || 'Request failed.' }, { status: 500 })
  }
}
