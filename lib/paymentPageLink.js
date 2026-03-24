const DEFAULT_SITE_URL = 'https://summer.newushu.com'

function normalizeBaseUrl(value) {
  const raw = String(value || '').trim()
  if (!raw) {
    return DEFAULT_SITE_URL
  }
  return raw.replace(/\/+$/, '')
}

function toBase64Url(input) {
  const value = String(input || '')
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64url')
  }
  const base64 = btoa(unescape(encodeURIComponent(value)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(input) {
  const value = String(input || '').trim()
  if (!value) {
    return ''
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'base64url').toString('utf8')
  }
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '==='.slice((normalized.length + 3) % 4)
  return decodeURIComponent(escape(atob(padded)))
}

function createJsonSafeReplacer() {
  const seen = new WeakSet()

  return function jsonSafeReplacer(_key, value) {
    if (typeof value === 'bigint') {
      return Number.isSafeInteger(Number(value)) ? Number(value) : String(value)
    }

    if (value instanceof Date) {
      return value.toISOString()
    }

    if (typeof value === 'function' || typeof value === 'symbol') {
      return undefined
    }

    if (!value || typeof value !== 'object') {
      return value
    }

    if (typeof Element !== 'undefined' && value instanceof Element) {
      return undefined
    }

    if (seen.has(value)) {
      return undefined
    }

    seen.add(value)
    return value
  }
}

export function encodePaymentPagePayload(payload) {
  return toBase64Url(JSON.stringify(payload || {}, createJsonSafeReplacer()))
}

export function decodePaymentPagePayload(token) {
  try {
    const decoded = fromBase64Url(token)
    const parsed = JSON.parse(decoded)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function buildPaymentPageHref(payload, options = {}) {
  const token = encodePaymentPagePayload(payload)
  const baseUrl = normalizeBaseUrl(
    options.baseUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL
  )
  return `${baseUrl}/payment?data=${encodeURIComponent(token)}`
}
