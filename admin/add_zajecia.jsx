import React from 'react'

export default function AddZajecia({ style, title = 'Dodaj zajęcia', formData = {}, status = {}, subjects = [], onChange, onCancel, onSave }) {
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
      typ: formData.type || null,
      czas: normalizeTime(formData.time || ''),
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
            <input type="text" name="type" placeholder="Typ zajęć" value={formData.type || ''} onChange={handleChange} />
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
