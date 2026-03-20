'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseEnabled } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function checkSession() {
      if (!supabaseEnabled || !supabase) {
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (active && session) {
        router.replace('/admin')
      }
    }

    checkSession()

    return () => {
      active = false
    }
  }, [router])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!supabaseEnabled || !supabase) {
      setMessage('Supabase env vars are missing.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      setMessage(`Login failed: ${error.message}`)
      return
    }

    setLoading(false)
    router.replace('/admin')
  }

  return (
    <main className="page">
      <section className="card section authCard">
        <p className="eyebrow">Admin Access</p>
        <h1>Sign in</h1>
        <p className="subhead">Use your admin user credentials to manage camp settings.</p>

        <form onSubmit={handleSubmit} className="authForm">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {message ? <p className="errorMessage">{message}</p> : null}
      </section>
    </main>
  )
}
