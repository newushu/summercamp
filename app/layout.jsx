import './globals.css'

export const metadata = {
  title: 'New England Wushu Summer Camp',
  description: 'Summer camp landing page and registration flow powered by Supabase.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
