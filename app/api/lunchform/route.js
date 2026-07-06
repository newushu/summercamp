import { NextResponse } from 'next/server'
import { supabaseServer, supabaseServerEnabled } from '../../../lib/supabaseServer'
import { LUNCH_ITEM_LABEL_BY_VALUE, normalizeLunchDayKey, normalizeLunchItemValue } from '../../../lib/lunchOptions'

function parseMaybeJson(value, fallback = null) {
  try {
    return JSON.parse(String(value || ''))
  } catch {
    return fallback
  }
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function sanitizeLunchChoices(choices) {
  const sanitized = {}
  const source = typeof choices === 'object' && choices ? choices : {}
  for (const [key, value] of Object.entries(source)) {
    const [weekId, dayKey] = String(key || '').split(':')
    const normalizedDay = normalizeLunchDayKey(dayKey)
    const normalizedValue = normalizeLunchItemValue(value)
    if (!weekId || !normalizedDay || !LUNCH_ITEM_LABEL_BY_VALUE[normalizedValue]) {
      continue
    }
    sanitized[`${weekId}:${normalizedDay}`] = normalizedValue
  }
  return sanitized
}

function getDayMode(entry, dayKey) {
  return (
    entry?.days?.[dayKey] ||
    entry?.days?.[String(dayKey || '').toLowerCase()] ||
    entry?.days?.[String(dayKey || '').toUpperCase()] ||
    'NONE'
  )
}

function buildLunchFormPayload(record) {
  const meta = parseMaybeJson(record?.medical_notes, {}) || {}
  const registration = meta?.registration || {}
  const students = Array.isArray(registration.students) ? registration.students : []
  return {
    registrationId: record.id,
    parentName: registration.parentName || record.guardian_name || '',
    email: registration.contactEmail || record.guardian_email || '',
    students: students.map((student, studentIndex) => ({
      index: studentIndex,
      fullName: String(student?.fullName || `Camper ${studentIndex + 1}`).trim(),
      lunch: typeof student?.lunch === 'object' && student?.lunch ? student.lunch : {},
      weeks: Object.entries(student?.schedule || {})
        .map(([weekId, entry]) => ({
          weekId,
          campType: entry?.campType || entry?.programKey || 'general',
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
            .map((dayKey) => ({
              dayKey,
              mode: getDayMode(entry, dayKey),
            }))
            .filter((day) => day.mode && day.mode !== 'NONE'),
        }))
        .filter((week) => week.days.length > 0),
    })),
  }
}

async function findLatestRegistrationByEmail(email) {
  const { data, error } = await supabaseServer
    .from('registrations')
    .select('id, guardian_name, guardian_email, medical_notes, created_at')
    .ilike('guardian_email', email)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(error.message)
  }
  return Array.isArray(data) ? data[0] : null
}

export async function GET(request) {
  if (!supabaseServerEnabled || !supabaseServer) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 })
  }

  const email = normalizeEmail(new URL(request.url).searchParams.get('email'))
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  try {
    const record = await findLatestRegistrationByEmail(email)
    if (!record) {
      return NextResponse.json({ error: 'No registration was found for that email.' }, { status: 404 })
    }
    return NextResponse.json(buildLunchFormPayload(record))
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Unable to load lunch form.' }, { status: 500 })
  }
}

export async function POST(request) {
  if (!supabaseServerEnabled || !supabaseServer) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 })
  }

  let body = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email = normalizeEmail(body.email)
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  try {
    const record = await findLatestRegistrationByEmail(email)
    if (!record) {
      return NextResponse.json({ error: 'No registration was found for that email.' }, { status: 404 })
    }

    const meta = parseMaybeJson(record.medical_notes, {}) || {}
    const registration = meta?.registration || {}
    const students = Array.isArray(registration.students) ? registration.students : []
    const submittedStudents = Array.isArray(body.students) ? body.students : []
    const nextStudents = students.map((student, index) => {
      const submitted = submittedStudents.find((item) => Number(item?.index) === index) || {}
      const nextLunch = sanitizeLunchChoices(submitted.lunch)
      return {
        ...student,
        lunch: nextLunch,
      }
    })

    const nextMeta = {
      ...meta,
      registration: {
        ...registration,
        students: nextStudents,
      },
      lunchFormUpdatedAt: new Date().toISOString(),
    }

    const { error } = await supabaseServer
      .from('registrations')
      .update({ medical_notes: JSON.stringify(nextMeta) })
      .eq('id', record.id)

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ ok: true, ...buildLunchFormPayload({ ...record, medical_notes: JSON.stringify(nextMeta) }) })
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Unable to save lunch choices.' }, { status: 500 })
  }
}
