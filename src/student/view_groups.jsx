import { useEffect, useState } from 'react'

function ViewGroups({ user, onBack }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assignedClasses, setAssignedClasses] = useState([])

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Pobierz listę studentów w celu znalezienia profilu zalogowanego studenta
        const studentsRes = await fetch('/api/student')
        if (!studentsRes.ok) throw new Error('Nie udało się pobrać danych studentów.')
        const students = await studentsRes.json()
        
        const currentStudent = students.find(s => Number(s.uzytkownicy_id) === Number(user?.id))
        
        if (!currentStudent) {
          if (active) {
            setAssignedClasses([])
            setLoading(false)
          }
          return
        }

        // 2. Pobierz powiązania grup/zajęć z tabeli grupa (gdzie przypisany jest student)
        const grupaRes = await fetch('/api/grupa')
        if (!grupaRes.ok) throw new Error('Nie udało się pobrać przypisań do grup.')
        const groupsData = await grupaRes.json()

        const studentAssignments = groupsData.filter(g => Number(g.student_id) === Number(currentStudent.idstudent))

        if (studentAssignments.length === 0) {
          if (active) {
            setAssignedClasses([])
            setLoading(false)
          }
          return
        }

        // 3. Pobierz szczegóły zajęć, przedmiotów i sal
        const [zajeciaRes, przedmiotRes, saleRes] = await Promise.all([
          fetch('/api/zajecia'),
          fetch('/api/przedmiot'),
          fetch('/api/sale')
        ])

        if (!zajeciaRes.ok || !przedmiotRes.ok || !saleRes.ok) {
          throw new Error('Nie udało się pobrać szczegółowych danych zajęć.')
        }

        const classes = await zajeciaRes.json()
        const subjects = await przedmiotRes.json()
        const rooms = await saleRes.json()

        const enriched = studentAssignments.map(assignment => {
          const cls = classes.find(c => Number(c.idzajecia) === Number(assignment.zajecia_id))
          if (!cls) return null

          const subject = subjects.find(sub => Number(sub.idprzedmiotu) === Number(cls.przedmiot_id))
          const room = rooms.find(r => Number(r.id_sala || r.id) === Number(cls.sala_id))

          // Oblicz liczbę innych studentów przypisanych do tych samych zajęć
          const groupCount = groupsData.filter(g => Number(g.zajecia_id) === Number(cls.idzajecia)).length

          return {
            id: cls.idzajecia,
            subjectName: subject?.nazwa || '?',
            type: cls.typ || 'Zajęcia',
            time: cls.czas || '-',
            roomName: room ? `${room.nazwa} (${room.budynek || ''})` : 'Brak sali',
            count: groupCount
          }
        }).filter(Boolean)

        if (active) {
          setAssignedClasses(enriched)
          setLoading(false)
        }
      } catch (err) {
        console.error(err)
        if (active) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [user?.id])

  // Tłumaczenie typów zajęć na język polski
  const translateType = (type) => {
    if (!type) return 'Zajęcia'
    const lower = type.toLowerCase()
    if (lower === 'wyklad' || lower === 'wykład') return 'Wykład'
    if (lower === 'cwiczenia' || lower === 'ćwiczenia') return 'Ćwiczenia'
    if (lower === 'laboratorium' || lower === 'lab') return 'Laboratorium'
    if (lower === 'seminarium' || lower === 'sem') return 'Seminarium'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="student-groups-page">
      <div className="student-groups-header">
        <div className="student-groups-user">
          <span>Jesteś zalogowany jako</span>
          <p></p>
          <strong>{user?.login || 'student'}</strong>
        </div>
      </div>

      <div className="groups-card">
        <h2>Twoje grupy zajęciowe</h2>
        
        {loading && <p className="plan-subtitle">Ładowanie danych grup...</p>}
        {error && <p className="plan-subtitle form-error" style={{ padding: '10px', borderRadius: '8px' }}>Błąd: {error}</p>}
        
        {!loading && !error && assignedClasses.length === 0 && (
          <p className="plan-subtitle">Nie jesteś obecnie przypisany/a do żadnej grupy zajęciowej.</p>
        )}

        {!loading && !error && assignedClasses.length > 0 && (
          <div className="groups-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {assignedClasses.map((item) => (
              <div key={item.id} className="group-item" style={{
                padding: '20px',
                border: '1px solid rgba(15, 41, 64, 0.08)',
                background: '#f8fbff',
                borderRadius: '18px',
                display: 'grid',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.2rem', color: '#0f2940' }}>{item.subjectName}</strong>
                  <span className="plan-label" style={{ margin: 0 }}>{translateType(item.type)}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', color: '#556a85' }}>Godzina zajęć</span>
                    <strong style={{ color: '#2c4364', fontSize: '0.95rem' }}>{item.time}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', color: '#556a85' }}>Sala</span>
                    <strong style={{ color: '#2c4364', fontSize: '0.95rem' }}>{item.roomName}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', color: '#556a85' }}>Liczba studentów w grupie</span>
                    <strong style={{ color: '#2c4364', fontSize: '0.95rem' }}>{item.count} osób</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="button" className="card-back-button" onClick={onBack} style={{ marginTop: '24px' }}>
          Powrót do menu
        </button>
      </div>
    </div>
  )
}

export default ViewGroups
