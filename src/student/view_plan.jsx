import { useState } from 'react'
import ScheduleGrid from '../public/ScheduleGrid.jsx'

const semesterSchedules = {
  1: [
    {
      time: '08:00 - 09:30',
      monday: 'Matematyka',
      tuesday: 'Programowanie',
      wednesday: 'Fizyka',
      thursday: 'Wstęp do algorytmów',
      friday: 'Język angielski',
    },
    {
      time: '09:45 - 11:15',
      monday: 'Wstęp do algorytmów',
      tuesday: 'Bazy danych',
      wednesday: 'Matematyka',
      thursday: 'Programowanie',
      friday: 'Grafika komputerowa',
    },
    {
      time: '11:30 - 13:00',
      monday: 'Bazy danych',
      tuesday: 'Język angielski',
      wednesday: 'Systemy operacyjne',
      thursday: 'Fizyka',
      friday: 'Warsztaty projektowe',
    },
  ],
  2: [
    {
      time: '08:00 - 09:30',
      monday: 'Systemy operacyjne',
      tuesday: 'Sieci komputerowe',
      wednesday: 'Bazy danych',
      thursday: 'Programowanie obiektowe',
      friday: 'Metody statystyczne',
    },
    {
      time: '09:45 - 11:15',
      monday: 'Programowanie obiektowe',
      tuesday: 'Matematyka',
      wednesday: 'Sieci komputerowe',
      thursday: 'Bezpieczeństwo IT',
      friday: 'Język angielski',
    },
    {
      time: '11:30 - 13:00',
      monday: 'Metody statystyczne',
      tuesday: 'Systemy operacyjne',
      wednesday: 'Bezpieczeństwo IT',
      thursday: 'Projekt zespołowy',
      friday: 'Grafika komputerowa',
    },
  ],
}

function ViewPlan({ user, onBack }) {
  const initialSemester = Number(user?.semester || 1)
  const [semester, setSemester] = useState(initialSemester)
  const schedule = semesterSchedules[semester] || semesterSchedules[1]

  return (
    <div className="student-plan-page">
      <div className="student-plan-card">
        <div className="plan-header">
          <div>
            <div className="plan-label">Plan zajęć</div>
            <h1>Twój rozkład semestralny</h1>
            <p className="plan-subtitle">
              Semestr {semester} dla studenta <strong>{user?.login || 'student'}</strong>
            </p>
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

        <ScheduleGrid schedule={schedule} />

        <button type="button" className="card-back-button" onClick={onBack}>
          Powrót do menu
        </button>
      </div>
    </div>
  )
}

export default ViewPlan

