import { useMemo } from 'react'
import '../App.css'
import ScheduleGrid from '../public/ScheduleGrid.jsx'

const dayMap = {
  monday: 'monday',
  poniedzialek: 'monday',
  poniedziałek: 'monday',
  tuesday: 'tuesday',
  wtorek: 'tuesday',
  wednesday: 'wednesday',
  środa: 'wednesday',
  swroda: 'wednesday',
  thursday: 'thursday',
  czwartek: 'thursday',
  friday: 'friday',
  piątek: 'friday',
  piatek: 'friday',
}

export default function ViewPlan({ user, plan = [], onBack }) {
  const isAuthed = !!user;

  const schedule = useMemo(() => {
    if (!Array.isArray(plan) || plan.length === 0) return []

    // plan: [{day, time, name, lecturer, room, duration}]
    // Format ScheduleGrid: [{time: '08:00 - 09:30', monday:'...', ...}]
    // Uproszczenie: używamy plan.time jako klucza (zakładamy, że generator tworzy takie same zakresy).
    const byTime = new Map()

    for (const row of plan) {
      const rawDay = (row?.day || '').toString().toLowerCase().trim()
      const day = dayMap[rawDay] || rawDay
      const time = row?.time || ''
      if (!time) continue
      if (!byTime.has(time)) {
        byTime.set(time, {
          time,
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
        })
      }
      const current = byTime.get(time)
      const cellText = row?.name ? row.name : ''
      if (current[day] !== undefined) current[day] = cellText
    }

    // zamiana mapy na tablicę w kolejności rosnącej wg startu godziny
    const arr = Array.from(byTime.values())
    const startTimeMinutes = (timeRange) => {
      const parts = (timeRange || '').split('-').map((s) => s.trim())
      const [h, m] = (parts[0] || '0:0').split(':').map((x) => Number(x))
      return h * 60 + m
    }

    arr.sort((a, b) => startTimeMinutes(a.time) - startTimeMinutes(b.time))
    return arr
  }, [plan])

  return (
    <div className="student-menu-page">
      <div className="student-plan-card admin-form-card">
        <div className="plan-header">
          <div>
            <div className="plan-label">Plan zajęć</div>
            <h1>Plan dla planisty</h1>
            <p className="plan-subtitle">Przejrzyj wygenerowany plan zajęć.</p>
          </div>
        </div>

        {plan.length === 0 ? (
          <div className="empty-state">
            <p>Brak wygenerowanego planu. Przejdź do generatora i wygeneruj plan.</p>
          </div>
        ) : (
          <ScheduleGrid schedule={schedule} />
        )}

        <div className="admin-form-actions">
          <button type="button" onClick={onBack}>
            Powrót
          </button>
          <button type="button" disabled={plan.length === 0}>
            Edytuj
          </button>
          <button type="button" disabled={plan.length === 0}>
            Eksportuj
          </button>
        </div>
      </div>
    </div>
  )
}

