'use client'

import { useMemo, useState } from 'react'
import { LUNCH_FORM_DAY_KEYS, LUNCH_ITEM_OPTIONS, getLunchItemLabel } from '../../lib/lunchOptions'

function formatWeekFromId(weekId) {
  const start = String(weekId || '').split(':').pop()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    return weekId || 'Camp week'
  }
  const startDate = new Date(`${start}T12:00:00`)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 4)
  const format = (date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  return `${format(startDate)} - ${format(endDate)}`
}

function lunchKey(weekId, dayKey) {
  return `${weekId}:${dayKey}`
}

export default function LunchFormPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState(null)

  const hasLunchRows = useMemo(
    () =>
      Array.isArray(formData?.students) &&
      formData.students.some((student) => student.weeks?.some((week) => week.days?.length > 0)),
    [formData]
  )

  async function loadRegistration(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setFormData(null)
    try {
      const response = await fetch(`/api/lunchform?email=${encodeURIComponent(email.trim())}`)
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Unable to find registration.')
      }
      setFormData(result)
    } catch (error) {
      setMessage(error?.message || 'Unable to find registration.')
    } finally {
      setLoading(false)
    }
  }

  function updateLunchChoice(studentIndex, weekId, dayKey, value) {
    setFormData((current) => ({
      ...current,
      students: current.students.map((student) => {
        if (Number(student.index) !== Number(studentIndex)) {
          return student
        }
        const nextLunch = { ...(student.lunch || {}) }
        const key = lunchKey(weekId, dayKey)
        if (value) {
          nextLunch[key] = value
        } else {
          delete nextLunch[key]
        }
        return {
          ...student,
          lunch: nextLunch,
        }
      }),
    }))
  }

  async function saveChoices() {
    if (!formData) return
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/lunchform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email || email,
          students: formData.students.map((student) => ({
            index: student.index,
            lunch: student.lunch || {},
          })),
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Unable to save lunch choices.')
      }
      setFormData(result)
      setMessage('Lunch choices saved.')
    } catch (error) {
      setMessage(error?.message || 'Unable to save lunch choices.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page lunchFormPage">
      <section className="card section lunchFormShell">
        <p className="eyebrow">New England Wushu</p>
        <h1>Lunch Form</h1>
        <p className="subhead">
          Enter the parent email from registration, then choose lunch items for the camp days you want lunch provided.
        </p>

        <form className="lunchLookupForm" onSubmit={loadRegistration}>
          <label>
            Parent email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="parent@example.com"
              required
            />
          </label>
          <button className="heroPrimaryCta" type="submit" disabled={loading}>
            {loading ? 'Looking up...' : 'Find Registration'}
          </button>
        </form>

        {formData ? (
          <div className="lunchFormContent">
            <div className="lunchFormFamilyBar">
              <div>
                <strong>{formData.parentName || 'Parent/Guardian'}</strong>
                <span>{formData.email}</span>
              </div>
              <button className="secondaryButton" type="button" onClick={saveChoices} disabled={saving || !hasLunchRows}>
                {saving ? 'Saving...' : 'Save Lunch Choices'}
              </button>
            </div>

            {!hasLunchRows ? (
              <p className="subhead">No day-camp attendance days were found for this registration.</p>
            ) : (
              formData.students.map((student) => (
                <article className="lunchStudentBlock" key={`lunch-student-${student.index}`}>
                  <h2>{student.fullName}</h2>
                  {student.weeks.map((week) => (
                    <div className="lunchWeekBlock" key={`${student.index}-${week.weekId}`}>
                      <h3>{formatWeekFromId(week.weekId)}</h3>
                      <div className="lunchDayGrid">
                        {LUNCH_FORM_DAY_KEYS.filter((dayKey) =>
                          week.days.some((day) => day.dayKey === dayKey)
                        ).map((dayKey) => {
                          const key = lunchKey(week.weekId, dayKey)
                          const value = student.lunch?.[key] || ''
                          return (
                            <label className="lunchDayChoice" key={key}>
                              <span>{dayKey}</span>
                              <select
                                value={value}
                                onChange={(event) =>
                                  updateLunchChoice(student.index, week.weekId, dayKey, event.target.value)
                                }
                              >
                                <option value="">No lunch</option>
                                {LUNCH_ITEM_OPTIONS.map((option) => (
                                  <option value={option.value} key={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <small>{value ? getLunchItemLabel(value) : 'Pack lunch'}</small>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </article>
              ))
            )}
          </div>
        ) : null}

        {message ? <p className="formMessage">{message}</p> : null}
      </section>
    </main>
  )
}
