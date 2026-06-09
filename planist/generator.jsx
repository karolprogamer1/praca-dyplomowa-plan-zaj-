import { useState, useEffect } from 'react'
import '../App.css'

const weekdays = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek']

export default function Generator({ user, onBack, onGenerate }) {
  const [selectedDays, setSelectedDays] = useState([])
  const [preferredLecturerDays, setPreferredLecturerDays] = useState([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
  const [selectedLecturerIds, setSelectedLecturerIds] = useState([])
  const [subjects, setSubjects] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [classes, setClasses] = useState([])
  const [earliestTime, setEarliestTime] = useState('08:00')
  const [latestTime, setLatestTime] = useState('16:00')
  const [windowWeight, setWindowWeight] = useState(50)
  const [lateWeight, setLateWeight] = useState(50)
  const [spreadWeight, setSpreadWeight] = useState(50)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [zajeciaRes, przedmiotRes, wykladowcaRes] = await Promise.all([
          fetch('/api/zajecia'),
          fetch('/api/przedmiot'),
          fetch('/api/wykladowca'),
        ])

        if (!zajeciaRes.ok || !przedmiotRes.ok || !wykladowcaRes.ok) {
          throw new Error('Błąd pobierania danych z bazy danych')
        }

        const [zajeciaData, przedmiotData, wykladowcaData] = await Promise.all([
          zajeciaRes.json(),
          przedmiotRes.json(),
          wykladowcaRes.json(),
        ])

        setClasses(zajeciaData)
        setSubjects(przedmiotData)
        setLecturers(wykladowcaData)
      } catch (err) {
        console.error(err)
        setError('Nie udało się pobrać danych wykładowców, przedmiotów i zajęć.')
      }
    }

    loadData()
  }, [])

  const toggleDay = (day, setFn, values) => {
    const next = values.includes(day)
      ? values.filter((item) => item !== day)
      : [...values, day]
    setFn(next)
  }

  const handleSubjectChange = (event) => {
    const selected = Array.from(event.target.selectedOptions, (option) => Number(option.value)).filter(
      (value) => !Number.isNaN(value)
    )
    setSelectedSubjectIds(selected)
  }

  const handleLecturerChange = (event) => {
    const selected = Array.from(event.target.selectedOptions, (option) => Number(option.value)).filter(
      (value) => !Number.isNaN(value)
    )
    setSelectedLecturerIds(selected)
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/planista/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedDays,
          preferredLecturerDays,
          selectedSubjectIds,
          selectedLecturerIds,
          earliestTime,
          latestTime,
          windowPreference: windowWeight,
          latePreference: lateWeight,
          spreadPreference: spreadWeight,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Błąd generowania planu')
      }
      onGenerate(result.plan || [])
      setMessage('Plan został wygenerowany pomyślnie. Przejdź do widoku planu.')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Błąd generowania planu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="student-menu-page">
      <div className="student-plan-card admin-form-card">
        <div className="plan-header">
          <div>
            <div className="plan-label">Generator planu</div>
            <h1>Ustaw kryteria planu zajęć</h1>
            <p className="plan-subtitle">Wybierz preferencje wykładowców, dni i optymalizację.</p>
          </div>
        </div>

        <div className="generator-form">
          <section>
            <h2>Wybierz dni tygodnia</h2>
            <div className="checkbox-row">
              {weekdays.map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => toggleDay(day, setSelectedDays, selectedDays)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2>Preferencje wykładowcy</h2>
            <div className="checkbox-row">
              {weekdays.map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={preferredLecturerDays.includes(day)}
                    onChange={() => toggleDay(day, setPreferredLecturerDays, preferredLecturerDays)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2>Wybierz dane z bazy danych</h2>
            <div className="form-row">
              <label>
                Przedmioty ({subjects.length})
                <select multiple value={selectedSubjectIds.map(String)} onChange={handleSubjectChange}>
                  {subjects.map((subject) => (
                    <option key={subject.idprzedmiotu} value={subject.idprzedmiotu}>
                      {subject.nazwa || `Przedmiot ${subject.idprzedmiotu}`}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Wykładowcy ({lecturers.length})
                <select multiple value={selectedLecturerIds.map(String)} onChange={handleLecturerChange}>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.idwykladowca} value={lecturer.idwykladowca}>
                      {`${lecturer.imie || ''} ${lecturer.nazwisko || ''}`.trim() || `Wykładowca ${lecturer.idwykladowca}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p>Liczba zajęć pobranych z bazy: {classes.length}</p>
          </section>

          <section>
            <h2>Zakres godzin</h2>
            <div className="form-row">
              <label>
                Od
                <input type="time" value={earliestTime} onChange={(e) => setEarliestTime(e.target.value)} />
              </label>
              <label>
                Do
                <input type="time" value={latestTime} onChange={(e) => setLatestTime(e.target.value)} />
              </label>
            </div>
          </section>

          <section>
            <h2>Kryteria optymalizacji</h2>
            <label>
              Okienka
              <input
                type="range"
                min="0"
                max="100"
                value={windowWeight}
                onChange={(e) => setWindowWeight(Number(e.target.value))}
              />
            </label>
            <label>
              Późne godziny
              <input
                type="range"
                min="0"
                max="100"
                value={lateWeight}
                onChange={(e) => setLateWeight(Number(e.target.value))}
              />
            </label>
            <label>
              Rozłożenie zajęć
              <input
                type="range"
                min="0"
                max="100"
                value={spreadWeight}
                onChange={(e) => setSpreadWeight(Number(e.target.value))}
              />
            </label>
          </section>

          <div className="admin-form-actions">
            <button type="button" disabled={loading} onClick={handleGenerate}>
              {loading ? 'Generuję...' : 'Generuj'}
            </button>
            <button type="button" className="card-back-button" onClick={onBack}>
              Powrót
            </button>
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  )
}
