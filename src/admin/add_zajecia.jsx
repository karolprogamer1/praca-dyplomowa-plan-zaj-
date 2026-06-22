import React from 'react'

export default function AddZajecia({ style, title = 'Dodaj zajęcia', formData = {}, status = {}, subjects = [], rooms = [], lecturers = [], onChange, onCancel, onSave }) {


  const handleChange = (e) => {
    onChange(e)
  }

  const normalizeTime = (value) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed)) {
      return `${trimmed}:00`
    }
    return trimmed
  }

  const handleSubmit = (e) => {
    e.preventDefault()
      onSave({
      przedmiot_id: formData.subjectId ? Number(formData.subjectId) : null,
      // backend oczekuje pola `wykladowca_id`
      wykladowca_id: formData.lecturerId ? Number(formData.lecturerId) : null,

      typ: formData.type || null,
      czas: normalizeTime(formData.time || ''),
      // sala jest opcjonalna
      sala_id: formData.roomId ? Number(formData.roomId) : null,
      grupa: formData.groupId ? Number(formData.groupId) : null,
    })
  }


  return (
    <div className="student-menu-page" style={style}>
      <div className="student-plan-card admin-form-card">
        <div className="plan-header">
          <div>
            <div className="plan-label">{title}</div>
            <h1>{title}</h1>
            <p className="plan-subtitle">Wypełnij formularz, aby dodać nowe zajęcia.</p>
          </div>
        </div>


        {status.message && (
          <div className={`admin-status-message ${status.type || ''}`} style={{ margin: '1rem 0', padding: '0.75rem', borderRadius: '4px' }}>
            {status.message}
          </div>
        )}
        <form className="admin-student-form" onSubmit={handleSubmit}>
          <label>
            Wykładowca
            <select
              name="lecturerId"
              value={formData.lecturerId || ''}
              onChange={handleChange}
            >
              <option value="">Brak wykładowcy</option>
              {lecturers.map((lect) => (
                <option key={lect.id} value={lect.id}>
                  {lect.firstName && lect.lastName
                    ? `${lect.firstName} ${lect.lastName}${lect.title ? `, ${lect.title}` : ''}`
                    : (lect.id ? `ID: ${lect.id}` : '')}
                </option>
              ))}
            </select>
          </label>

          <label>
            Przedmiot
            <select name="subjectId" value={formData.subjectId || ''} onChange={handleChange} required>
              <option value="">Wybierz przedmiot</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name || `Przedmiot ${subject.id}`}
                </option>
              ))}
            </select>
          </label>

          {subjects.length === 0 && (
            <div style={{ color: '#b22222', marginBottom: '1rem' }}>
              Brak dostępnych przedmiotów. Najpierw dodaj przedmiot w sekcji "Przedmioty".
            </div>
          )}


          <label>
            Typ
            <select name="type" value={formData.type || ''} onChange={handleChange} required>
              <option value="">Wybierz typ</option>
              <option value="wyklad">wykład</option>
              <option value="cwiczenia">ćwiczenia</option>
              <option value="laboratorium">laboratorium</option>
              <option value="seminarium">seminarium</option>
              <option value="projekt">projekt</option>
            </select>
          </label>

          <label>
            Czas
            <input
              type="text"
              name="time"
              placeholder="HH:MM:SS"
              value={formData.time || ''}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Sala
            <select name="roomId" value={formData.roomId || ''} onChange={handleChange}>
              <option value="">— brak / nie ustawiaj —</option>
              {(rooms || []).map((r) => (
                <option key={r.id_sala ?? r.id} value={r.id_sala ?? r.id}>
                  {r.nazwa || r.budynek ? `${r.nazwa || r.id} (${r.budynek || '-'})` : `Sala ${(r.id_sala ?? r.id)}`}
                </option>
              ))}
            </select>

          </label>

          <label>
            Grupa
            <input
              type="number"
              name="groupId"
              placeholder="np. 1 (opcjonalnie)"
              value={formData.groupId || ''}
              onChange={handleChange}
            />
          </label>


          <div className="admin-form-actions">
            <button type="submit" disabled={subjects.length === 0}>Zapisz</button>
            <button type="button" className="card-back-button" onClick={onCancel}>
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
