import { useState } from 'react'
import ScheduleGrid from '../public/ScheduleGrid.jsx'

const lecturerSchedules = {
  1: [
    {
      time: '08:00 - 09:30',
      monday: 'Wykład z algorytmiki',
      tuesday: 'Ćwiczenia z baz danych',
      wednesday: 'Konsultacje',
      thursday: 'Wykład z inżynierii oprogramowania',
      friday: 'Laboratorium z systemów operacyjnych',
    },
    {
      time: '09:45 - 11:15',
      monday: 'Ćwiczenia z inżynierii oprogramowania',
      tuesday: 'Wykład z baz danych',
      wednesday: 'Przygotowanie zajęć',
      thursday: 'Konsultacje',
      friday: 'Wykład z sieci komputerowych',
    },
    {
      time: '11:30 - 13:00',
      monday: 'Laboratorium z sieci komputerowych',
      tuesday: 'Wykład z bezpieczeństwa',
      wednesday: 'Ćwiczenia z systemów operacyjnych',
      thursday: 'Przygotowanie zajęć',
      friday: 'Wykład z algorytmiki',
    },
  ],
  2: [
    {
      time: '08:00 - 09:30',
      monday: 'Wykład z bezpieczeństwa',
      tuesday: 'Konsultacje',
      wednesday: 'Seminarium dyplomowe',
      thursday: 'Wykład z sztucznej inteligencji',
      friday: 'Laboratorium z baz danych',
    },
    {
      time: '09:45 - 11:15',
      monday: 'Ćwiczenia z sztucznej inteligencji',
      tuesday: 'Przygotowanie zajęć',
      wednesday: 'Konsultacje',
      thursday: 'Laboratorium z bezpieczeństwa',
      friday: 'Wykład z inżynierii oprogramowania',
    },
    {
      time: '11:30 - 13:00',
      monday: 'Środowisko pracy oraz kody',
      tuesday: 'Wykład z baz danych',
      wednesday: 'Spotkanie zespołu projektowego',
      thursday: 'Ćwiczenia z sieci komputerowych',
      friday: 'Konsultacje',
    },
  ],
}

function ViewPlan({ user, onBack }) {
  const initialSemester = Number(user?.semester || 1)
  const [semester, setSemester] = useState(initialSemester)
  const schedule = lecturerSchedules[semester] || lecturerSchedules[1]

  return (
    <div className="student-plan-page">
      <div className="student-plan-card">
        <div className="plan-header">
          <div>
            <div className="plan-label">Plan prowadzącego</div>
            <h1>Plan prowadzonych zajęć</h1>
            <p className="plan-subtitle">
              Semestr {semester} dla wykładowcy <strong>{user?.login || 'wykładowca'}</strong>
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

