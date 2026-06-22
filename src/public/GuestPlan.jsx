import { useState } from 'react'

const guestSchedules = {
  1: [
    {
      time: '08:00 - 09:30',
      monday: 'Przykładowy przedmiot A',
      tuesday: 'Przykładowy przedmiot B',
      wednesday: 'Przykładowy przedmiot C',
      thursday: 'Przykładowy przedmiot D',
      friday: 'Przykładowy przedmiot E',
    },
    {
      time: '09:45 - 11:15',
      monday: 'Przykładowy przedmiot F',
      tuesday: 'Przykładowy przedmiot G',
      wednesday: 'Przykładowy przedmiot H',
      thursday: 'Przykładowy przedmiot I',
      friday: 'Przykładowy przedmiot J',
    },
    {
      time: '11:30 - 13:00',
      monday: 'Przykładowy przedmiot K',
      tuesday: 'Przykładowy przedmiot L',
      wednesday: 'Przykładowy przedmiot M',
      thursday: 'Przykładowy przedmiot N',
      friday: 'Przykładowy przedmiot O',
    },
  ],
  2: [
    {
      time: '08:00 - 09:30',
      monday: 'Przykładowy przedmiot P',
      tuesday: 'Przykładowy przedmiot Q',
      wednesday: 'Przykładowy przedmiot R',
      thursday: 'Przykładowy przedmiot S',
      friday: 'Przykładowy przedmiot T',
    },
    {
      time: '09:45 - 11:15',
      monday: 'Przykładowy przedmiot U',
      tuesday: 'Przykładowy przedmiot V',
      wednesday: 'Przykładowy przedmiot W',
      thursday: 'Przykładowy przedmiot X',
      friday: 'Przykładowy przedmiot Y',
    },
    {
      time: '11:30 - 13:00',
      monday: 'Przykładowy przedmiot Z',
      tuesday: 'Przykładowy przedmiot AA',
      wednesday: 'Przykładowy przedmiot AB',
      thursday: 'Przykładowy przedmiot AC',
      friday: 'Przykładowy przedmiot AD',
    },
  ],
}

export default function GuestPlan({ onBack }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState(null)

  // okna/sekcje (8)
  const windows = 8
  const [semester, setSemester] = useState(1)


  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

  const dayLabels = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
  }

  // Siatka: co 15 minut; do godz. 20:00
  const startHour = 8
  const startMinute = 0
  const endHour = 20
  const slotMinutes = 15
  const slots = ((endHour - startHour) * 60) / slotMinutes



  const makeTimeLabel = (totalMinutes) => {
    const minutes = totalMinutes % 60
    const hours = startHour + Math.floor(totalMinutes / 60)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  // Mapujemy przykładowy harmonogram na siatkę:
  // - start zajęć trafia do konkretnego wiersza (slot)
  // - zajęcia „rozciągają się” w czasie, więc wypełniamy kolejne sloty
  const baseSchedule = guestSchedules[semester] || guestSchedules[1]

  const parseTime = (hhmm) => {
    const [h, m] = hhmm.split(':').map((x) => Number(x))
    return (h - startHour) * 60 + m
  }

  const parseRangeToSlots = (timeRange) => {
    // '08:00 - 09:30' => start/end
    const parts = timeRange.split('-').map((s) => s.trim())
    const startMinutes = parseTime(parts[0])
    const endMinutes = parseTime(parts[1])

    const startSlot = Math.max(0, Math.min(slots - 1, Math.floor(startMinutes / 15)))
    // konwersja 'do' slotów: bierzemy coverage do końca zakresu
    const endSlot = Math.max(0, Math.min(slots - 1, Math.ceil(endMinutes / 15) - 1))

    return { startSlot, endSlot }
  }

  const grid = Array.from({ length: slots }, () => ({}))
  baseSchedule.forEach((row) => {
    const { startSlot, endSlot } = parseRangeToSlots(row.time)
    for (let idx = startSlot; idx <= endSlot; idx += 1) {
      grid[idx].monday = row.monday
      grid[idx].tuesday = row.tuesday
      grid[idx].wednesday = row.wednesday
      grid[idx].thursday = row.thursday
      grid[idx].friday = row.friday
    }
  })

  // 8 okien czasowych: agregujemy plan do bloczków po ~1.5h (3 sloty po 15 min)
  // Start: 08:00, okna: 08-09:30, 09:30-11:00, ...
  const windowSlotSize = 3
  const windowCount = windows
  const windowedSchedule = Array.from({ length: windowCount }, (_, wIdx) => ({
    time: `${String(startHour + wIdx * 1.5).replace('.', ':')} - ${String(startHour + (wIdx + 1) * 1.5).replace('.', ':')}`,
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
  }))

  const windowLabel = (idx) => {
    const from = startHour * 60 + idx * windowSlotSize * slotMinutes
    const to = from + windowSlotSize * slotMinutes
    const fmt = (mins) => {
      const hh = String(Math.floor(mins / 60)).padStart(2, '0')
      const mm = String(mins % 60).padStart(2, '0')
      return `${hh}:${mm}`
    }
    return `${fmt(from)} - ${fmt(to)}`
  }

  for (let w = 0; w < windowCount; w += 1) {
    const startIdx = w * windowSlotSize
    const endIdx = Math.min(slots - 1, startIdx + windowSlotSize - 1)
    windowedSchedule[w].time = windowLabel(w)
    const pickText = (d) => {
      for (let idx = startIdx; idx <= endIdx; idx += 1) {
        if (grid[idx]?.[d]) return grid[idx][d]
      }
      return ''
    }
    windowedSchedule[w].monday = pickText('monday')
    windowedSchedule[w].tuesday = pickText('tuesday')
    windowedSchedule[w].wednesday = pickText('wednesday')
    windowedSchedule[w].thursday = pickText('thursday')
    windowedSchedule[w].friday = pickText('friday')
  }

  return (

    <div className="student-plan-page">
      <div className="student-plan-card">
        <div className="plan-header">
          <div>
            <div className="plan-label">Podgląd planu</div>
            <h1>Plan dla niezalogowanych</h1>
            <p className="plan-subtitle">Wybierz semestr, aby zobaczyć przykładowy rozkład zajęć.</p>
          </div>

          <div className="plan-select">
            <label>
              Wybierz semestr
              <select value={semester} onChange={(event) => setSemester(Number(event.target.value))}>
                <option value={1}>Semestr 1</option>
                <option value={2}>Semestr 2</option>
              </select>
            </label>
          </div>
        </div>

        <div className="schedule-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Godzina</th>
                {days.map((d) => (
                  <th key={d}>{dayLabels[d]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: windowCount }).map((_, wIdx) => {
                const row = windowedSchedule[wIdx]
                return (
                  <tr key={row.time}>
                    <td>{row.time}</td>
                    {days.map((d) => (
                      <td key={d}>
                        {row?.[d] ? <div className="cell-inner">{row[d]}</div> : null}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <button type="button" className="card-back-button" onClick={onBack}>
          Powrót
        </button>
      </div>
    </div>
  )

}

