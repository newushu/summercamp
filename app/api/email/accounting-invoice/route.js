import { sendWithSes } from '../../../../lib/emailProvider'
import { WEEK_TIER_PROMO } from '../../../../lib/campPricing'

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

function buildEmailHtml({ parentName, camperName, paymentMethod, summaryHtml }) {
  if (summaryHtml && /<html[\s>]/i.test(summaryHtml)) {
    return summaryHtml
  }
  const safeParent = escapeHtml(parentName || 'Parent/Guardian')
  const safeCamper = escapeHtml(camperName || 'Camper')
  const safeMethod = escapeHtml(String(paymentMethod || '').toUpperCase() || 'Select in portal')

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:20px;background:#f8fafc;">
    <div style="max-width:820px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:16px;overflow:hidden;box-shadow:0 16px 34px rgba(15,23,42,0.12);font-family:Arial,sans-serif;color:#0f172a;">
      <div style="padding:16px 20px;background:linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%);color:#fff;">
        <p style="margin:0;font-size:12px;letter-spacing:0.08em;font-weight:700;text-transform:uppercase;">New England Wushu</p>
        <h2 style="margin:8px 0 0;font-size:24px;line-height:1.2;">Registration Summary</h2>
      </div>
      <div style="padding:20px;">
        <p style="margin:0 0 8px;">Hi ${safeParent},</p>
        <p style="margin:0 0 14px;">Attached is your current registration summary for <strong>${safeCamper}</strong>.</p>
        <div style="margin:0 0 14px;padding:12px;border:1px solid #fdba74;border-radius:12px;background:#fff7ed;">
          <p style="margin:0;font-size:14px;color:#9a3412;"><strong>${escapeHtml(WEEK_TIER_PROMO.shortLabel)}:</strong> ${escapeHtml(WEEK_TIER_PROMO.cap)} ${escapeHtml(WEEK_TIER_PROMO.tiers)} ${escapeHtml(WEEK_TIER_PROMO.detail)} ${escapeHtml(WEEK_TIER_PROMO.growth)}</p>
        </div>
        <div style="margin:0 0 14px;padding:12px;border:1px solid #dbeafe;border-radius:12px;background:#eff6ff;">
          <p style="margin:0;font-size:14px;color:#1e3a8a;"><strong>Preferred payment method:</strong> ${safeMethod}</p>
        </div>
        <div style="margin:0;padding:0;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;overflow:hidden;">
          ${summaryHtml || '<div style="padding:16px;">Summary unavailable.</div>'}
        </div>
        <p style="margin:14px 0 0;font-size:13px;color:#475569;">Attached: summer-camp-registration-summary.pdf</p>
      </div>
    </div>
  </body>
</html>`
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const toEmail = String(body?.toEmail || '').trim()
    const ccEmails = Array.isArray(body?.ccEmails) ? body.ccEmails.filter((value) => isValidEmail(value)) : []
    const parentName = String(body?.parentName || '').trim()
    const camperName = String(body?.camperName || '').trim()
    const paymentMethod = String(body?.paymentMethod || '').trim()
    const summaryHtml = String(body?.summaryHtml || '').trim()
    const summaryText = String(body?.summaryText || '').trim()
    const pdfBase64 = String(body?.pdfBase64 || '').replace(/\s+/g, '')

    if (!isValidEmail(toEmail)) {
      return Response.json({ error: 'A valid recipient email is required.' }, { status: 400 })
    }
    if (!summaryText || !pdfBase64) {
      return Response.json({ error: 'Summary document payload is required.' }, { status: 400 })
    }

    const subject = `Summer Camp Registration Summary - ${camperName || 'Camper'}`
    const bodyText = [
      `Hi ${parentName || 'Parent/Guardian'},`,
      '',
      `Attached is your current registration summary for ${camperName || 'Camper'}.`,
      '',
      `${WEEK_TIER_PROMO.shortLabel}: ${WEEK_TIER_PROMO.headline}`,
      WEEK_TIER_PROMO.cap,
      WEEK_TIER_PROMO.tiers,
      WEEK_TIER_PROMO.detail,
      WEEK_TIER_PROMO.growth,
      '',
      summaryText,
      '',
      `Preferred payment method: ${String(paymentMethod || '').toUpperCase() || 'Select in portal'}`,
      '',
      'Attachment included: summer-camp-registration-summary.pdf',
    ].join('\n')

    const result = await sendWithSes({
      toEmail,
      ccEmails,
      subject,
      bodyText,
      html: buildEmailHtml({ parentName, camperName, paymentMethod, summaryHtml }),
      attachments: [
        {
          filename: 'summer-camp-registration-summary.pdf',
          contentType: 'application/pdf',
          contentBase64: pdfBase64,
        },
      ],
    })

    if (result.previewOnly) {
      return Response.json(
        { ok: true, sent: false, previewOnly: true, message: result.error, ccEmails },
        { status: 200 }
      )
    }
    if (!result.sent) {
      return Response.json({ error: result.error || 'Email send failed.' }, { status: 500 })
    }

    return Response.json({ ok: true, sent: true, ccEmails }, { status: 200 })
  } catch (error) {
    return Response.json({ error: error.message || 'Request failed.' }, { status: 500 })
  }
}
