import Link from 'next/link'
import { decodePaymentPagePayload } from '../../lib/paymentPageLink'

const PAYMENT_OPTIONS = [
  {
    title: 'Zelle',
    value: 'wushu688@gmail.com',
    description: 'Send payment to this email and include your camper name in the note.',
    href: 'mailto:wushu688@gmail.com?subject=Summer%20Camp%20Payment',
    buttonLabel: 'Open Zelle Email',
    tone: 'blue',
  },
  {
    title: 'Venmo',
    value: '@newushu',
    description: 'Use Venmo and include your camper name plus selected week in the payment note.',
    href: 'https://venmo.com/newushu',
    buttonLabel: 'Open Venmo',
    tone: 'gold',
  },
  {
    title: 'Check',
    value: 'Newushu, 123 Muller Rd',
    description: 'Mail or bring the check payable to Newushu.',
    href: null,
    buttonLabel: '',
    tone: 'teal',
  },
]

function currency(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function groupSummaryLines(lines) {
  const header = []
  const campers = []
  const notes = []

  for (const rawLine of Array.isArray(lines) ? lines : []) {
    const line = String(rawLine || '').trim()
    if (!line) continue
    if (
      line.startsWith('Location:') ||
      line.startsWith('Parent/Guardian:') ||
      line.startsWith('Contact:') ||
      line.startsWith('Payment method:')
    ) {
      header.push(line)
      continue
    }
    if (
      line.startsWith('Grand total:') ||
      line.startsWith('Weekly reminders:') ||
      line.startsWith('Drop-off:') ||
      line.startsWith('Pickup:') ||
      line.startsWith('Weekly rate:') ||
      line.startsWith('Total:') ||
      line.startsWith('Tuition covers')
    ) {
      notes.push(line)
      continue
    }
    campers.push(line)
  }

  return { header, campers, notes }
}

export default async function PaymentPage({ searchParams }) {
  const resolvedParams = await searchParams
  const payload = decodePaymentPagePayload(resolvedParams?.data || '')
  const summaryLines = Array.isArray(payload?.summaryLines) ? payload.summaryLines : []
  const grouped = groupSummaryLines(summaryLines)
  const amountDue = Number(payload?.amountDue || 0)
  const heading = payload?.registrationType === 'overnight-only' ? 'Overnight Camp Payment' : 'Summer Camp Payment'

  return (
    <main className="page">
      <section className="card section">
        <p className="eyebrow">Payment Options</p>
        <h1>{heading}</h1>
        <p className="subhead">
          Review the payment methods below and confirm them against your registration summary.
        </p>
        {Number.isFinite(amountDue) && amountDue > 0 ? (
          <div className="campTypeDiscountNote" style={{ marginTop: '0.8rem' }}>
            Amount due: <strong>{currency(amountDue)}</strong>
          </div>
        ) : null}

        <div className="campTypeHighlightList" style={{ marginTop: '1rem' }}>
          {PAYMENT_OPTIONS.map((option) => (
            <div key={option.title} className={`paymentOptionCard paymentOptionCard--${option.tone}`}>
              <p className="paymentOptionTitle">{option.title}</p>
              <strong>{option.value}</strong>
              <p>{option.description}</p>
              {option.href ? (
                <a className="button" href={option.href} target="_blank" rel="noreferrer">
                  {option.buttonLabel}
                </a>
              ) : null}
            </div>
          ))}
        </div>

        <div className="paymentSummaryPanel">
          <div className="paymentSummaryCard">
            <h3>Registration Summary</h3>
            {grouped.header.length > 0 ? (
              <ul className="paymentSummaryList">
                {grouped.header.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="subhead">Summary details were not included in this link.</p>
            )}
          </div>

          {grouped.campers.length > 0 ? (
            <div className="paymentSummaryCard">
              <h3>Campers & Selections</h3>
              <ul className="paymentSummaryList">
                {grouped.campers.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {grouped.notes.length > 0 ? (
            <div className="paymentSummaryCard paymentSummaryCard--notes">
              <h3>Notes</h3>
              <ul className="paymentSummaryList">
                {grouped.notes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="summaryActionRow">
          <Link className="button secondary" href="/">
            Back to Summer Camp Page
          </Link>
          <a className="button" href="mailto:wushu688@gmail.com?subject=Summer%20Camp%20Payment%20Question">
            Ask a Payment Question
          </a>
        </div>
      </section>
    </main>
  )
}
