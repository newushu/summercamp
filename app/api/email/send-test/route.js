import { sendWithSes } from '../../../../lib/emailProvider'
import {
  buildLeadJourneyMessage,
  PAYMENT_METHODS_TEXT,
  buildPaidEnrollmentJourneyMessage,
  buildReservationJourneyMessage,
} from '../../../../lib/emailJourneyRenderer'
import { buildPaymentSummaryPdfBase64 } from '../../../../lib/paymentSummaryPdf'
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

export async function POST(request) {
  try {
    const body = await request.json()
    const toEmail = String(body?.toEmail || '').trim()
    const stepNumber = Number(body?.stepNumber || 0)
    const template = body?.template || {}
    const flowKey = String(body?.flowKey || 'lead').trim().toLowerCase()
    const previewRegistrationType = String(body?.previewRegistrationType || '').trim().toLowerCase()
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

    if (flowKey === 'reservation' || flowKey === 'overnight' || flowKey === 'paid-followup') {
      if (flowKey === 'paid-followup') {
        const renderedMessage = buildPaidEnrollmentJourneyMessage({
          stepNumber,
          logoUrl,
          payload:
            previewRegistrationType === 'bootcamp'
              ? {
                  registrationType: '',
                  guardianName: 'Calvin Chen',
                  camperNames: ['Ethan Chen'],
                  location: 'Burlington',
                  paymentMethod: 'Zelle',
                  amountDue: 0,
                  campWeeks: [
                    { start: '2026-07-07', end: '2026-07-11' },
                    { start: '2026-07-14', end: '2026-07-18' },
                    { start: '2026-07-21', end: '2026-07-25' },
                  ],
                  summaryLines: [
                    'Location: Burlington',
                    'Parent/Guardian: Calvin Chen',
                    'Contact: calvin@example.com',
                    'Payment method: Zelle',
                    'Ethan Chen: Competition Boot Camp, Jul 7-11, Jul 14-18, Jul 21-25',
                    'Grand total: $2,340.00',
                    'Weekly reminders: Water Wednesday, BBQ Thursday, Friday showcase 4:30 PM',
                  ],
                }
              : {
                  registrationType: '',
                  guardianName: 'Calvin Chen',
                  camperNames: ['Ethan Chen'],
                  location: 'Burlington',
                  paymentMethod: 'Zelle',
                  amountDue: 0,
                  campWeeks: [
                    { start: '2026-07-07', end: '2026-07-11' },
                    { start: '2026-07-14', end: '2026-07-18' },
                  ],
                  summaryLines: [
                    'Location: Burlington',
                    'Parent/Guardian: Calvin Chen',
                    'Contact: calvin@example.com',
                    'Payment method: Zelle',
                    'Ethan Chen: General Camp, Jul 7-11, Jul 14-18, Lunch Mon/Wed/Fri',
                    'Grand total: $1,680.00',
                    'Weekly reminders: Water Wednesday, BBQ Thursday, Friday showcase 4:30 PM',
                  ],
                },
        })
        bodyText = renderedMessage.bodyText
        html = renderedMessage.html
      } else {
      const isOvernightPreview = flowKey === 'overnight' || previewRegistrationType === 'overnight-only'
      const renderedMessage = buildReservationJourneyMessage({
        stepNumber,
        logoUrl,
        payload: isOvernightPreview
          ? {
              registrationType: 'overnight-only',
              guardianName: 'Calvin Chen',
              camperNames: ['Ethan Chen'],
              location: 'Camp House (Address TBA)',
              paymentMethod: 'Zelle',
              amountDue: 1860,
              campWeeks: [
                { start: '2026-07-12', end: '2026-07-18' },
                { start: '2026-07-19', end: '2026-07-25' },
              ],
              summaryLines: [
                'Overnight Camp registration',
                'Parent/Guardian: Calvin Chen',
                'Contact: calvin@example.com',
                'Payment method: Zelle',
                'Overnight student 1: Jul 12 - Jul 18, Jul 19 - Jul 25 | Activities: Sanda fundamentals, Flexibility training, Video review',
                'Drop-off: Sunday 1:00 PM',
                'Pickup: Saturday 4:00 PM',
                'Location: Camp House (Address TBA)',
                'Week 1: $980.00. Week 2 gets an extra $100.00 off for $880.00.',
                'Tuition covers lodging and food only. Outing costs are billed separately.',
                'Grand total: $1,860.00',
              ],
            }
          : undefined,
      })
      bodyText = renderedMessage.bodyText
      html = renderedMessage.html
      }
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
          payment_methods: PAYMENT_METHODS_TEXT,
          reservation_deadline: 'May 20, 5:00 PM EDT',
          registration_summary:
            'Location: Burlington\nParent/Guardian: Calvin Chen\nContact: calvin@example.com\nPayment method: Zelle\nEthan Chen: General Camp, Jul 7-11, Jul 14-18, Lunch Mon/Wed/Fri\nGrand total: $1,680.00',
          left_off_summary: 'Location: Burlington\nParent/Guardian: Calvin Chen\nPayment method: Zelle',
          selected_weeks: 'Jul 7-11\nJul 14-18',
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
      flowKey === 'reservation' || flowKey === 'overnight'
        ? [
            {
              filename: 'camp-payment-summary.pdf',
              contentType: 'application/pdf',
              contentBase64: buildPaymentSummaryPdfBase64({
                title: 'New England Wushu Payment Summary (Test)',
                campName: 'New England Wushu Summer Camp',
                guardianName: 'Calvin Chen',
                recipientEmail: toEmail,
                submittedLabel: 'Mar 24, 2026, 9:13 PM EDT',
                reservationDeadlineLabel: 'Mar 27, 2026, 9:13 PM EDT',
                amountDueLabel:
                  flowKey === 'overnight' || previewRegistrationType === 'overnight-only' ? '$1,860.00' : '$1,680.00',
                paymentMethods: PAYMENT_METHODS_TEXT.split('\n'),
                summaryLines:
                  flowKey === 'overnight' || previewRegistrationType === 'overnight-only'
                    ? [
                        'Overnight Camp registration',
                        'Parent/Guardian: Calvin Chen',
                        'Contact: calvin@example.com',
                        'Payment method: Zelle',
                        'Overnight student 1: Jul 12 - Jul 18, Jul 19 - Jul 25 | Activities: Sanda fundamentals, Flexibility training, Video review',
                        'Drop-off: Sunday 1:00 PM',
                        'Pickup: Saturday 4:00 PM',
                        'Location: Camp House (Address TBA)',
                        'Week 1: $980.00. Week 2 gets an extra $100.00 off for $880.00.',
                        'Grand total: $1,860.00',
                      ]
                    : [
                        'Location: Burlington',
                        'Parent/Guardian: Calvin Chen',
                        'Contact: calvin@example.com',
                        'Payment method: Venmo',
                        'Ethan Chen: General Camp, Jul 7-11, Jul 14-18, Lunch Mon/Wed/Fri',
                        'Grand total: $1,680.00',
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
