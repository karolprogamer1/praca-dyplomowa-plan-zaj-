import { useEffect, useState } from 'react'
import '../App.css'
import ViewPlan from './view_plan.jsx'
import ViewPersonalData from './view_personal_data.jsx'
import ViewSettings from '../student/view_settings.jsx'

function Menu({ user, onLogout }) {
  const [activeView, setActiveView] = useState(null)
  const [fontScale, setFontScale] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [menuOpen, setMenuOpen] = useState(true)
  const [status, setStatus] = useState({ type: '', message: '' })

  const [lecturerProfile, setLecturerProfile] = useState(null)
  const [availability, setAvailability] = useState({})
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isSelecting, setIsSelecting] = useState(true)
  const [sending, setSending] = useState(false)

  const days = [
    { key: 'monday', label: 'Poniedziałek' },
    { key: 'tuesday', label: 'Wtorek' },
    { key: 'wednesday', label: 'Środa' },
    { key: 'thursday', label: 'Czwartek' },
    { key: 'friday', label: 'Piątek' },
  ]

  const timeSlots = []
  for (let h = 8; h < 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }

  const handleBack = () => setActiveView(null)
  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout()
      return
    }
    window.location.reload()
  }

  const pageStyle = {
    fontSize: `${fontScale}%`,
    filter: `contrast(${contrast}%)`,
  }

  const resolveLecturerId = (sourceUser) => {
    return sourceUser?.idwykladowca ?? sourceUser?.wykladowca_id ?? sourceUser?.id ?? sourceUser?.userId
  }

  useEffect(() => {
    if (activeView !== 'personal' && activeView !== 'availability') return

    let ignore = false

    const run = async () => {
      try {
        const lecturerId = resolveLecturerId(user)
        if (!lecturerId) return

        const profileRes = await fetch(`/api/wykladowca/${lecturerId}`)
        if (!profileRes.ok) return
        const profile = await profileRes.json()

        if (ignore) return

        const availabilityRes = await fetch(`/api/wykladowca/${lecturerId}/availability`)
        const availabilityData = availabilityRes.ok ? await availabilityRes.json() : { availability: {} }

        setLecturerProfile({
          ...user,
          ...profile,
          title: profile?.tytul_naukowy ?? user?.title,
          availabilityGrid: availabilityData?.availability || {},
        })
      } catch (e) {
        console.error(e)
      }
    }

    run()

    return () => {
      ignore = true
    }
  }, [activeView, user])

  useEffect(() => {
    if (lecturerProfile) {
      setAvailability(lecturerProfile.availabilityGrid || {})
    }
  }, [lecturerProfile])

  const updateAvailability = (day, slot, selectMode) => {
    setAvailability((prev) => {
      const current = prev[day] || []
      const alreadySelected = current.includes(slot)

      if (selectMode && !alreadySelected) {
        return { ...prev, [day]: [...current, slot] }
      }
      if (!selectMode && alreadySelected) {
        return { ...prev, [day]: current.filter((s) => s !== slot) }
      }
      return prev
    })
  }

  const handleMouseDown = (day, slot, isSelected) => {
    const newMode = !isSelected
    setIsSelecting(newMode)
    setIsMouseDown(true)
    updateAvailability(day, slot, newMode)
  }

  const handleMouseEnter = (day, slot) => {
    if (isMouseDown) {
      updateAvailability(day, slot, isSelecting)
    }
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  if (activeView === 'plan') {
    return <ViewPlan user={user} onBack={handleBack} />
  }

  if (activeView === 'personal') {
    return <ViewPersonalData user={lecturerProfile || user} onBack={handleBack} />
  }

  if (activeView === 'availability') {
    return (
      <div className="student-plan-page" style={pageStyle}>
        <div className="student-plan-card admin-form-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="plan-header">
            <div>
              <div className="plan-label">Preferencje</div>
              <h1>Twoja dostępność</h1>
              <p className="plan-subtitle">Zaznacz w siatce godziny, w których możesz prowadzić zajęcia.</p>
            </div>
          </div>

          {status.message && (
            <div className={`admin-status-message ${status.type}`} style={{ margin: '1rem 0', padding: '0.75rem', borderRadius: '4px' }}>
              {status.message}
            </div>
          )}

<form onSubmit={async (e) => {
             e.preventDefault()
             const fallbackLecturerId = user?.idwykladowca ?? user?.wykladowca_id ?? user?.id ?? user?.userId
             if (!lecturerProfile && !fallbackLecturerId) {
               setStatus({ type: 'error', message: 'Profil wykładowcy nie został załadowany. Odśwież stronę.' })
               return
             }

             try {
               console.log('[LecturerAvailability] submitting availability...', { lecturerProfile })
               setSending(true)
               setStatus({ type: '', message: 'Wysyłanie...' })
               const lecturerId = resolveLecturerId(lecturerProfile || user)
                 if (!lecturerId) {
                   setStatus({ type: 'error', message: 'Nie można odczytać identyfikatora wykładowcy.' })
                   setSending(false)
                   return
                 }

                 const response = await fetch(`/api/wykladowca/${lecturerId}/availability`, {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ availability })
                 })

                 if (!response.ok) {
                   let msg = 'Błąd zapisu'
                   try {
                     const payload = await response.json()
                     msg = payload.error || payload.message || msg
                   } catch (e) {
                     // ignore JSON parse errors
                   }
                   throw new Error(msg)
                 }

                 setStatus({ type: 'success', message: 'Twoje preferencje zostały zapisane i przesłane do planisty.' })
               } catch (err) {
                 console.error('[LecturerAvailability] submit error:', err)
                 setStatus({ type: 'error', message: err.message || 'Wystąpił błąd podczas zapisywania.' })
               } finally {
                 setSending(false)
               }
           }} className="admin-student-form">
              <div className="form-row">
                <label>
                  Imię
                  <input type="text" value={lecturerProfile?.imie || ''} disabled />
                </label>
                <label>
                  Nazwisko
                  <input type="text" value={lecturerProfile?.nazwisko || ''} disabled />
                </label>
              </div>

            <div className="availability-grid-container" style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
              <table className="admin-table availability-grid" style={{ minWidth: '600px', borderCollapse: 'separate', borderSpacing: '2px', userSelect: 'none' }} onDragStart={(e) => e.preventDefault()}>
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Czas</th>
                    {days.map(d => <th key={d.key}>{d.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(slot => (
                    <tr key={slot}>
                    <td style={{ fontSize: '0.8rem', textAlign: 'center', background: '#f8f9fa', padding: '2px 5px' }}>{slot}</td>
                      {days.map(d => {
                        const isSelected = availability[d.key]?.includes(slot)
                        return (
                          <td
                            key={`${d.key}-${slot}`}
                            onMouseDown={() => handleMouseDown(d.key, slot, isSelected)}
                            onMouseEnter={() => handleMouseEnter(d.key, slot)}
                            style={{
                            height: '20px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#28a745' : '#eee',
                              transition: 'background 0.2s',
                              border: '1px solid #ddd'
                            }}
                            title={`${d.label} ${slot}`}
                          />
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-form-actions" style={{ marginTop: '2rem' }}>
              <button type="submit" style={{ padding: '10px 30px' }} disabled={sending}>{sending ? 'Wysyłanie...' : 'Prześlij preferencje do planisty'}</button>
              <button type="button" className="card-back-button" onClick={handleBack}>Powrót</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (activeView === 'settings') {
    return (
      <ViewSettings
        fontScale={fontScale}
        contrast={contrast}
        onFontScaleChange={setFontScale}
        onContrastChange={setContrast}
        onBack={handleBack}
      />
    )
  }

  return (
    <div className="student-menu-page" style={pageStyle}>
      <div className="student-menu-header">
        <div className="student-menu-user">
          <div>
            <strong>Menu wykładowcy</strong>
            <div className="student-menu-user-info">Jesteś zalogowany jako {user?.login || 'wykładowca'}</div>
          </div>
        </div>

        <div className="student-menu-accessibility">
          <button type="button" onClick={() => setFontScale((v) => Math.min(v + 10, 160))}>
            A+
          </button>
          <button type="button" onClick={() => setFontScale((v) => Math.max(v - 10, 80))}>
            A-
          </button>
          <button type="button" onClick={() => setContrast((v) => Math.min(v + 15, 200))}>
            K+
          </button>
          <button type="button" onClick={() => setContrast((v) => Math.max(v - 15, 80))}>
            K-
          </button>
        </div>
      </div>

      <div className="student-menu-panel">
        <button type="button" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? 'Ukryj menu' : 'Pokaż menu'}
        </button>

        {menuOpen && (
          <div className="lecturer-menu-items">
            <button type="button" onClick={() => setActiveView('plan')}>
              Wyświetl plan prowadzonych zajęć
            </button>
            <button type="button" onClick={() => setActiveView('personal')}>
              Wyświetl dane o sobie
            </button>
            <button type="button" onClick={() => setActiveView('availability')}>
              Ustaw godziny prowadzenia
            </button>
            <button type="button" onClick={() => setActiveView('settings')}>
              Dostosuj aplikację
            </button>
          </div>
        )}

        <button type="button" onClick={handleLogout}>
          Wyloguj się
        </button>
      </div>
    </div>
  )
}

export default Menu
