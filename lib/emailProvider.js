import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

let cachedClient = null
let cachedKey = ''

function getSesApiConfig() {
  const region = String(process.env.AWS_REGION || process.env.AWS_RGION || '').trim()
  const accessKeyId = String(process.env.AWS_ACCESS_KEY_ID || '').trim()
  const secretAccessKey = String(process.env.AWS_SECRET_ACCESS_KEY || '').trim()
  const sessionToken = String(process.env.AWS_SESSION_TOKEN || '').trim()
  const fromEmail = String(process.env.AWS_SES_FROM_EMAIL || process.env.SES_FROM_EMAIL || '').trim()
  const fromName = String(process.env.AWS_SES_FROM_NAME || process.env.SES_FROM_NAME || 'New England Wushu').trim()

  return {
    region,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    fromEmail,
    fromName,
    configured: Boolean(region && fromEmail),
  }
}

function getClient(config) {
  const key = `${config.region}:${config.accessKeyId ? 'static' : 'default-chain'}`
  if (cachedClient && cachedKey === key) {
    return cachedClient
  }

  const clientConfig = {
    region: config.region,
  }
  if (config.accessKeyId && config.secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      sessionToken: config.sessionToken || undefined,
    }
  }
  cachedClient = new SESv2Client(clientConfig)
  cachedKey = key
  return cachedClient
}

export function isSesConfigured() {
  return getSesApiConfig().configured
}

function chunkBase64(value, chunkSize = 76) {
  const raw = String(value || '')
  if (!raw) {
    return ''
  }
  const chunks = []
  for (let index = 0; index < raw.length; index += chunkSize) {
    chunks.push(raw.slice(index, index + chunkSize))
  }
  return chunks.join('\r\n')
}

function sanitizeHeaderText(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim()
}

function encodeHeaderUtf8(value) {
  const safe = sanitizeHeaderText(value)
  if (!safe) {
    return ''
  }
  return `=?UTF-8?B?${Buffer.from(safe, 'utf8').toString('base64')}?=`
}

function buildFromEmailAddress(fromName, fromEmail) {
  const safeEmail = sanitizeHeaderText(fromEmail)
  const safeName = sanitizeHeaderText(fromName)
  if (!safeEmail) {
    return ''
  }
  if (!safeName) {
    return safeEmail
  }
  return `"${safeName}" <${safeEmail}>`
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) {
    return []
  }
  return attachments
    .map((item) => ({
      filename: sanitizeHeaderText(item?.filename || 'attachment.bin'),
      contentType: sanitizeHeaderText(item?.contentType || 'application/octet-stream'),
      contentBase64: String(item?.contentBase64 || '').replace(/\s+/g, ''),
    }))
    .filter((item) => item.contentBase64)
}

function buildRawMimeEmail({
  fromEmail,
  fromName,
  toEmail,
  ccEmails = [],
  replyTo,
  subject,
  bodyText,
  html,
  attachments,
}) {
  const boundaryMixed = `mix_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
  const boundaryAlt = `alt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
  const fromHeaderName = sanitizeHeaderText(fromName)
  const fromHeader = fromHeaderName ? `"${fromHeaderName}" <${fromEmail}>` : fromEmail
  const subjectHeader = encodeHeaderUtf8(subject || '')
  const safeText = String(bodyText || '')
  const safeHtml =
    html ||
    `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap;">${safeText}</pre>`

  const textBase64 = chunkBase64(Buffer.from(safeText, 'utf8').toString('base64'))
  const htmlBase64 = chunkBase64(Buffer.from(safeHtml, 'utf8').toString('base64'))

  const lines = [
    'MIME-Version: 1.0',
    `From: ${fromHeader}`,
    `To: ${sanitizeHeaderText(toEmail)}`,
    `Subject: ${subjectHeader || '(no subject)'}`,
  ]
  if (Array.isArray(ccEmails) && ccEmails.length > 0) {
    lines.push(`Cc: ${ccEmails.map((email) => sanitizeHeaderText(email)).join(', ')}`)
  }
  if (replyTo) {
    lines.push(`Reply-To: ${sanitizeHeaderText(replyTo)}`)
  }
  lines.push(`Content-Type: multipart/mixed; boundary="${boundaryMixed}"`)
  lines.push('')
  lines.push(`--${boundaryMixed}`)
  lines.push(`Content-Type: multipart/alternative; boundary="${boundaryAlt}"`)
  lines.push('')
  lines.push(`--${boundaryAlt}`)
  lines.push('Content-Type: text/plain; charset=UTF-8')
  lines.push('Content-Transfer-Encoding: base64')
  lines.push('')
  lines.push(textBase64)
  lines.push('')
  lines.push(`--${boundaryAlt}`)
  lines.push('Content-Type: text/html; charset=UTF-8')
  lines.push('Content-Transfer-Encoding: base64')
  lines.push('')
  lines.push(htmlBase64)
  lines.push('')
  lines.push(`--${boundaryAlt}--`)

  for (const attachment of attachments) {
    lines.push('')
    lines.push(`--${boundaryMixed}`)
    lines.push(`Content-Type: ${attachment.contentType}; name="${attachment.filename}"`)
    lines.push('Content-Transfer-Encoding: base64')
    lines.push(`Content-Disposition: attachment; filename="${attachment.filename}"`)
    lines.push('')
    lines.push(chunkBase64(attachment.contentBase64))
  }

  lines.push('')
  lines.push(`--${boundaryMixed}--`)
  lines.push('')
  return lines.join('\r\n')
}

export async function sendWithSes({ toEmail, ccEmails = [], subject, bodyText, html, replyTo, attachments }) {
  const config = getSesApiConfig()
  if (!config.configured) {
    return {
      sent: false,
      previewOnly: true,
      error:
        'Missing SES API env: AWS_REGION and AWS_SES_FROM_EMAIL (plus AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY or IAM role).',
      provider: 'ses',
    }
  }

  const client = getClient(config)
  const normalizedAttachments = normalizeAttachments(attachments)
  const normalizedCcEmails = Array.isArray(ccEmails)
    ? Array.from(new Set(ccEmails.map((email) => sanitizeHeaderText(email)).filter(Boolean)))
    : []
  try {
    const hasAttachments = normalizedAttachments.length > 0
    const rawMime = hasAttachments
      ? buildRawMimeEmail({
          fromEmail: config.fromEmail,
          fromName: config.fromName,
          toEmail,
          ccEmails: normalizedCcEmails,
          replyTo,
          subject,
          bodyText,
          html,
          attachments: normalizedAttachments,
        })
      : null
    const content = hasAttachments
      ? {
          Raw: {
            Data: Buffer.from(rawMime, 'utf8'),
          },
        }
      : {
          Simple: {
            Subject: {
              Data: String(subject || ''),
              Charset: 'UTF-8',
            },
            Body: {
              Text: {
                Data: String(bodyText || ''),
                Charset: 'UTF-8',
              },
              Html: {
                Data:
                  html ||
                  `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap;">${String(bodyText || '')}</pre>`,
                Charset: 'UTF-8',
              },
            },
          },
        }
    await client.send(
      new SendEmailCommand({
        FromEmailAddress: buildFromEmailAddress(config.fromName, config.fromEmail),
        Destination: {
          ToAddresses: [toEmail],
          CcAddresses: normalizedCcEmails.length > 0 ? normalizedCcEmails : undefined,
        },
        ReplyToAddresses: replyTo ? [replyTo] : undefined,
        Content: content,
      })
    )
    return {
      sent: true,
      previewOnly: false,
      error: null,
      provider: 'ses',
    }
  } catch (error) {
    return {
      sent: false,
      previewOnly: false,
      error: error?.message || 'SES send failed.',
      provider: 'ses',
    }
  }
}
