'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getSeasonSimulationCheckpoints,
  normalizeSimulatedDate,
  parseIsoDate,
  resolveSeasonYear,
  SEASON_SIMULATION_PARAM,
  SEASON_SIMULATION_STORAGE_KEY,
  toIsoDate,
} from '../../lib/campSeasons'
import { supabase, supabaseEnabled } from '../../lib/supabase'

function readInitialSimulatedDate() {
  if (typeof window === 'undefined') {
    return ''
  }

  const fromUrl = normalizeSimulatedDate(
    new URLSearchParams(window.location.search).get(SEASON_SIMULATION_PARAM)
  )
  if (fromUrl) {
    return fromUrl
  }

  try {
    return normalizeSimulatedDate(window.sessionStorage.getItem(SEASON_SIMULATION_STORAGE_KEY))
  } catch {
    return ''
  }
}

/**
 * Admin-only clock override. Signed-in admins can preview the site as it will
 * look on any date; everyone else always gets the real clock.
 */
export function useAdminDateSimulation() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [simulatedDate, setSimulatedDateState] = useState('')

  useEffect(() => {
    let active = true

    async function checkSession() {
      if (!supabaseEnabled || !supabase) {
        return
      }
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!active) {
        return
      }
      if (session) {
        setIsAdmin(true)
        setSimulatedDateState(readInitialSimulatedDate())
      }
    }

    checkSession()

    const { data: listener } = supabaseEnabled && supabase
      ? supabase.auth.onAuthStateChange((_event, session) => {
          setIsAdmin(Boolean(session))
          if (!session) {
            setSimulatedDateState('')
          }
        })
      : { data: null }

    return () => {
      active = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  const setSimulatedDate = useCallback((value) => {
    const normalized = normalizeSimulatedDate(value)
    setSimulatedDateState(normalized)

    if (typeof window === 'undefined') {
      return
    }

    try {
      if (normalized) {
        window.sessionStorage.setItem(SEASON_SIMULATION_STORAGE_KEY, normalized)
      } else {
        window.sessionStorage.removeItem(SEASON_SIMULATION_STORAGE_KEY)
      }
    } catch {
      // Session storage is optional; the in-memory value still drives the page.
    }

    const url = new URL(window.location.href)
    if (normalized) {
      url.searchParams.set(SEASON_SIMULATION_PARAM, normalized)
    } else {
      url.searchParams.delete(SEASON_SIMULATION_PARAM)
    }
    window.history.replaceState(null, '', url.toString())
  }, [])

  const effectiveSimulatedDate = isAdmin ? simulatedDate : ''

  return {
    isAdmin,
    simulatedDate: effectiveSimulatedDate,
    setSimulatedDate,
    /** Maps a real clock reading onto the simulated day, keeping time-of-day. */
    applySimulation: useCallback(
      (realNow) => {
        const base = realNow instanceof Date ? realNow : new Date(realNow || Date.now())
        const target = parseIsoDate(effectiveSimulatedDate)
        if (!target) {
          return base
        }
        return new Date(
          target.getFullYear(),
          target.getMonth(),
          target.getDate(),
          base.getHours(),
          base.getMinutes(),
          base.getSeconds()
        )
      },
      [effectiveSimulatedDate]
    ),
  }
}

export default function SeasonSimulatorBar({
  isAdmin,
  simulatedDate,
  onChange,
  programConfig,
  activeRoundLabel = '',
  seasonLabel = '',
}) {
  const [collapsed, setCollapsed] = useState(false)

  const realToday = useMemo(() => toIsoDate(new Date()), [])
  const checkpoints = useMemo(
    () => getSeasonSimulationCheckpoints(simulatedDate || new Date(), { programConfig }),
    [programConfig, simulatedDate]
  )
  const effectiveDate = simulatedDate || realToday
  const seasonYear = resolveSeasonYear(effectiveDate)

  if (!isAdmin) {
    return null
  }

  if (collapsed) {
    return (
      <button type="button" className="seasonSimBarPill" onClick={() => setCollapsed(false)}>
        {simulatedDate ? `Simulating ${simulatedDate}` : 'Date simulator'}
      </button>
    )
  }

  return (
    <div className={`seasonSimBar ${simulatedDate ? 'active' : ''}`} role="region" aria-label="Admin date simulator">
      <div className="seasonSimBarHead">
        <span className="seasonSimBarTag">{simulatedDate ? 'Simulated date' : 'Live date'}</span>
        <strong>{effectiveDate}</strong>
        <span className="seasonSimBarMeta">
          Season {seasonYear}
          {seasonLabel ? ` · ${seasonLabel}` : ''}
          {activeRoundLabel ? ` · ${activeRoundLabel}` : ' · No discount round active'}
        </span>
        <input
          type="date"
          value={effectiveDate}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Simulate a specific date"
        />
        <button type="button" className="seasonSimBarReset" onClick={() => onChange('')} disabled={!simulatedDate}>
          Reset to live
        </button>
        <button type="button" className="seasonSimBarHide" onClick={() => setCollapsed(true)}>
          Hide
        </button>
      </div>
      <div className="seasonSimBarChecks">
        {checkpoints.map((checkpoint) => (
          <button
            key={`${checkpoint.label}-${checkpoint.date}`}
            type="button"
            className={`seasonSimChip ${effectiveDate === checkpoint.date ? 'active' : ''}`}
            onClick={() => onChange(checkpoint.date)}
            title={`${checkpoint.detail} (${checkpoint.date})`}
          >
            <span>{checkpoint.label}</span>
            <small>{checkpoint.date}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
