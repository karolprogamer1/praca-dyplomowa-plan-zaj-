import { useState, useEffect } from 'react'
import '../App.css'

const weekdays = [
  { value: 'Poniedzialek', label: 'Poniedziałek' },
  { value: 'Wtorek', label: 'Wtorek' },
  { value: 'Sroda', label: 'Środa' },
  { value: 'Czwartek', label: 'Czwartek' },
  { value: 'Piatek', label: 'Piątek' },
]

export default function Generator({ onBack, onGenerate }) {
  const [selectedDays, setSelectedDays] = useState([])

  const [selectedSubjectIds, setSelectedSubjectIds] = useState([])
  const [selectedLecturerIds, setSelectedLecturerIds] = useState([])
  const [selectedRoomIds, setSelectedRoomIds] = useState([])
  const [rooms, setRooms] = useState([])

  const [selectedGroupIds, setSelectedGroupIds] = useState([])
  const [groups, setGroups] = useState([])

  const [subjects, setSubjects] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [classes, setClasses] = useState([])
  const [expandedSemesters, setExpandedSemesters] = useState({})
  const [selectedSemesters, setSelectedSemesters] = useState([])


  const [earliestTime, setEarliestTime] = useState('08:00')
  const [latestTime, setLatestTime] = useState('16:00')
  const [windowWeight, setWindowWeight] = useState(50)
  const [lateWeight, setLateWeight] = useState(50)
  const [spreadWeight, setSpreadWeight] = useState(50)
  const [preferredLecturerDays, setPreferredLecturerDays] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [zajeciaRes, przedmiotRes, wykladowcaRes, saleRes, grupaRes] = await Promise.all([
          fetch('/api/zajecia'),
          fetch('/api/przedmiot'),
          fetch('/api/wykladowca'),
          fetch('/api/sale'),
          fetch('/api/grupa'),
        ])


        if (!zajeciaRes.ok || !przedmiotRes.ok || !wykladowcaRes.ok || !saleRes.ok) {
          throw new Error('Błąd pobierania danych z bazy danych')
        }

        const [zajeciaData, przedmiotData, wykladowcaData, saleData, grupaData] = await Promise.all([
          zajeciaRes.json(),
          przedmiotRes.json(),
          wykladowcaRes.json(),
          saleRes.json(),
          grupaRes.json(),
        ])

        setClasses(zajeciaData)
        setSubjects(przedmiotData)
        setLecturers(wykladowcaData)
        setRooms(saleData || [])
        setGroups(grupaData || [])

      } catch (err) {
        console.error(err)
        setError('Nie udało się pobrać danych wykładowców, przedmiotów i zajęć.')
      }
    }

    loadData()
  }, [])

  const semestersMap = () => {
    // Build mapping semestr -> set of subject ids, lecturer ids and class items
    const map = {}
    classes.forEach((cls) => {
      const subj = subjects.find((s) => (s.idprzedmiotu ?? s.id) === (cls.przedmiot_id ?? cls.subjectId))
      const sem = cls.semestr ?? subj?.semestr ?? (subj?.rokSemestr || subj?.rok_semestr) ?? 'Brak'
      if (!map[sem]) map[sem] = { subjects: new Set(), lecturers: new Set(), classes: [] }
      const subjId = subj ? (subj.idprzedmiotu ?? subj.id) : (cls.przedmiot_id ?? cls.subjectId)
      if (subjId != null) map[sem].subjects.add(Number(subjId))
      const lecturerId = Number(cls.wykladowca_id ?? cls.lecturerId ?? subj?.wykladowca_id ?? subj?.lecturerId)
      if (!Number.isNaN(lecturerId)) {
        map[sem].lecturers.add(lecturerId)
      }
      map[sem].classes.push(cls)
    })
    return map
  }

  const semesterGroups = (() => {
    const map = semestersMap()
    return Object.keys(map).sort().map((sem) => ({ sem, subjectIds: Array.from(map[sem].subjects), lecturerIds: Array.from(map[sem].lecturers), classes: map[sem].classes }))
  })()


  const toggleDay = (day, setFn, values) => {
    const next = values.includes(day)
      ? values.filter((item) => item !== day)
      : [...values, day]
    setFn(next)
  }

  const togglePreferredLecturerDay = (day) => toggleDay(day, setPreferredLecturerDays, preferredLecturerDays)

  const handleSubjectChange = (event) => {
    const selected = Array.from(event.target.selectedOptions, (option) => Number(option.value)).filter(
      (value) => !Number.isNaN(value)
    )
    setSelectedSubjectIds(selected)
  }

  const toggleSemesterExpand = (sem) => {
    setExpandedSemesters((prev) => ({ ...prev, [sem]: !prev[sem] }))
  }

  const toggleSemesterSelect = (sem) => {
    const group = semesterGroups.find((g) => g.sem === sem)
    if (!group) return
    const ids = group.subjectIds
    const currentlySelected = ids.every((id) => selectedSubjectIds.includes(Number(id)))
    if (currentlySelected) {
      // remove subjects and semester
      setSelectedSubjectIds((prev) => prev.filter((v) => !ids.includes(Number(v))))
      setSelectedSemesters((prev) => prev.filter((s) => s !== sem))
      // remove lecturers that are no longer part of any selected semester
      setSelectedLecturerIds((prev) => {
        const remainingSemesters = selectedSemesters.filter((s) => s !== sem)
        const lecturersToKeep = new Set(
          semesterGroups
            .filter((g) => remainingSemesters.includes(g.sem))
            .flatMap((g) => g.lecturerIds)
        )
        return prev.filter((lecturerId) => lecturersToKeep.has(lecturerId))
      })
    } else {
      // add subjects, semester and lecturers
      setSelectedSubjectIds((prev) => Array.from(new Set([...prev, ...ids.map(Number)])))
      setSelectedSemesters((prev) => Array.from(new Set([...prev, sem])))
      setSelectedLecturerIds((prev) => Array.from(new Set([...prev, ...group.lecturerIds])))
    }
  }

  const handleLecturerChange = (event) => {
    const selected = Array.from(event.target.selectedOptions, (option) => Number(option.value)).filter(
      (value) => !Number.isNaN(value)
    )
    setSelectedLecturerIds(selected)
  }

  const handleRoomChange = (event) => {
    const selected = Array.from(event.target.selectedOptions, (option) => Number(option.value)).filter(
      (value) => !Number.isNaN(value)
    )
    setSelectedRoomIds(selected)
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
          selectedSubjectIds,
          selectedLecturerIds,
          selectedRoomIds,
          selectedGroupIds,

          earliestTime,

          latestTime,
          preferredLecturerDays,

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
      const skippedCount = Array.isArray(result.unscheduled) ? result.unscheduled.length : 0
      const stats = result.stats || result.performance || null
      const hardOkPct = typeof stats?.hardOkPct === 'number' ? stats.hardOkPct : null
      const softOkPct = typeof stats?.softOkPct === 'number' ? stats.softOkPct : null
      const preferredOkPct = typeof stats?.preferredOkPct === 'number' ? stats.preferredOkPct : null
      const hardOk = typeof stats?.hardOk === 'number' ? stats.hardOk : null
      const hardTotal = typeof stats?.hardTotal === 'number' ? stats.hardTotal : null
      const softOk = typeof stats?.softOk === 'number' ? stats.softOk : null
      const softTotal = typeof stats?.softTotal === 'number' ? stats.softTotal : null
      const genMs = typeof result.generationTimeMs === 'number' ? result.generationTimeMs : null

      setMessage(
        skippedCount > 0
          ? `Wygenerowano plan częściowy. Nie udało się zaplanować ${skippedCount} zajęć.`
          : 'Plan został wygenerowany pomyślnie. Przejdź do widoku planu.'
      )
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
                <label key={day.value}>
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.value)}
                    onChange={() => toggleDay(day.value, setSelectedDays, selectedDays)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </section>



          <section>
            <h2>Wybierz dane z bazy danych</h2>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Semestry (rozwijane):</strong>
              <div style={{ marginTop: '0.5rem' }}>
                {semesterGroups.length === 0 && <div>Brak przypisanych semestrów.</div>}
                {semesterGroups.map((g) => (
                  <div key={g.sem} style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" checked={selectedSemesters.includes(g.sem)} onChange={() => toggleSemesterSelect(g.sem)} />
                        <span>{g.sem} ({g.classes.length} zajęć, {g.subjectIds.length} przedmiotów)</span>
                      </label>
                      <button type="button" onClick={() => toggleSemesterExpand(g.sem)} style={{ cursor: 'pointer' }}>{expandedSemesters[g.sem] ? 'Ukryj' : 'Pokaż'}</button>
                    </div>
                    {expandedSemesters[g.sem] && (
                      <div style={{ marginTop: '8px', paddingLeft: '12px' }}>
                        <ul style={{ margin: 0, paddingLeft: '18px' }}>
                          {g.classes.map((c) => {
                            const subj = subjects.find((s) => (s.idprzedmiotu ?? s.id) === (c.przedmiot_id ?? c.subjectId))
                            const subjName = subj?.nazwa ?? subj?.name ?? `Przedmiot ${c.przedmiot_id ?? c.subjectId}`
                            return (
                              <li key={c.id ?? c.id_zajecia ?? JSON.stringify(c)}>
                                {subjName} — {c.type || c.typ || c.typ_zajec || ''} {c.time || c.czas || ''} {c.groupId || c.grupa ? `Gr. ${c.groupId ?? c.grupa}` : ''}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
              <label>
                Sale ({rooms.length})
                <select multiple value={selectedRoomIds.map(String)} onChange={handleRoomChange}>
                  {rooms.map((room) => (
                    <option key={room.id_sala} value={room.id_sala}>
                      {room.nazwa || `Sala ${room.id_sala}`}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Grupy ({groups.length})
                <select multiple value={selectedGroupIds.map(String)} onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (opt) => Number(opt.value)).filter((v) => Number.isInteger(v))
                  setSelectedGroupIds(selected)
                }}>
                  {groups.map((g) => (
                    <option key={g.id_grupa ?? g.id} value={g.id_grupa ?? g.id}>
                      {`Grupa ${g.id_grupa ?? g.id}`}
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
            <h2>Preferencje wykładowców</h2>
            <p>Wybierz dni, w których wykładowcy preferują prowadzić zajęcia (używane przy ocenianiu rozwiązań).</p>
            <div className="checkbox-row">
              {weekdays.map((d) => (
                <label key={`pref-${d.value}`}>
                  <input
                    type="checkbox"
                    checked={preferredLecturerDays.includes(d.value)}
                    onChange={() => togglePreferredLecturerDay(d.value)}
                  />
                  {d.label}
                </label>
              ))}
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
