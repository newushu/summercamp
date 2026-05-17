import Script from 'next/script'
import Link from 'next/link'

export default async function CreditCardCheckoutPage({ searchParams }) {
  const resolvedParams = await searchParams
  const embedded = resolvedParams?.embedded === '1'

  return (
    <main className="page">
      <section className="card section">
        {!embedded ? <p className="eyebrow">Credit Card Checkout</p> : null}
        {!embedded ? <h1>Secure Card Payment</h1> : null}
        {!embedded ? (
          <p className="subhead">
            Complete your credit card payment in the secure checkout window below. Your registration page stays separate.
          </p>
        ) : null}
        <div className={`creditCardInstructionCard ${embedded ? 'embedded' : ''}`}>
          <strong>How to pay by credit card</strong>
          <ul className="creditCardInstructionList">
            <li>Use the search field and type `summer camp`, or click the `Summer Camp 2026` category.</li>
            <li>For `Train More, Save More`, choose the summer camp option that matches the total number of weeks you plan to sign up for.</li>
            <li>For sibling discount, please contact us or use an alternative payment method so we can adjust it correctly.</li>
            <li>You will receive a payment receipt after checkout.</li>
          </ul>
        </div>

        <div className="creditCardWidgetShell">
          <Script type="module" src="https://widgets.wellnessliving.com/store/widget.js" strategy="afterInteractive" />
          <wl-store-widget k_business="247808" k_skin="31960" k_location="" />
        </div>

        {!embedded ? (
          <div className="summaryActionRow">
            <Link className="button secondary" href="/payment">
              Back to Payment Options
            </Link>
            <Link className="button" href="/">
              Back to Summer Camp Page
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  )
}
