import { sendWithSes } from '../../../../lib/emailProvider'
import {
  buildLeadJourneyMessage,
  buildReservationJourneyMessage,
} from '../../../../lib/emailJourneyRenderer'
import { supabaseServer, supabaseServerEnabled } from '../../../../lib/supabaseServer'

function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim())
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

    const displaySubject = subject.startsWith('[TEST] ') ? subject : `[TEST] ${subject}`
    const logoUrl = await getEmailBranding()
    let bodyText = ''
    let html = ''

    if (flowKey === 'reservation') {
      const renderedMessage = buildReservationJourneyMessage({
        stepNumber,
        logoUrl,
      })
      bodyText = renderedMessage.bodyText
      html = renderedMessage.html
    } else {
      const renderedMessage = buildLeadJourneyMessage({
        template,
        tokens: {
          first_name: 'Calvin',
          parent_name: 'Calvin',
          guardian_name: 'Calvin Chen',
          recommended_plan:
            'General Camp with progression options. If your camper wishes to start Competition Team in the fall, they must enroll in 3 weeks of Competition Team Boot Camp this summer.',
          registration_link: 'https://summer.newushu.com/register',
          payment_methods: 'Zelle: wushu688@gmail.com\nVenmo: @newushu\nCheck (payable to Newushu): 123 Muller Rd',
          reservation_deadline: 'May 20, 5:00 PM EDT',
          registration_summary:
            'Location: Burlington\nParent/Guardian: Calvin Chen\nContact: calvin@example.com\nPayment method: Zelle\nEthan Chen: General Camp, Jul 7-11, Jul 14-18, Lunch Mon/Wed/Fri\nGrand total: $1,680.00',
          amount_due: '$1,680.00',
          app_launch_date: 'June 20',
        },
        logoUrl,
        landingCarouselImageUrls: [],
        stepNumber,
      })
      bodyText = renderedMessage.bodyText
      html = renderedMessage.html
    }

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
                  'Amount due: $1,680.00',
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
      bodyText,
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
