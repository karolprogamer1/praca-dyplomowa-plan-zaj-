import React from 'react'

export default function AddSubject({ style, title = 'Dodaj przedmiot', formData = {}, lecturers = [], status = {}, onChange, onCancel, onSave }) {
  const handleChange = (e) => {
    onChange(e)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      wykladowca_id: formData.lecturerId ? Number(formData.lecturerId) : null,
      nazwa: formData.name || null,
      typ: formData.type || null,
      ilosc_godz: formData.hours ? Number(formData.hours) : null,
    })
  }

  return (
    <div className="student-menu-page" style={style}>
      <div className="student-plan-card admin-form-card">
        <div className="plan-header">
          <div>
            <div className="plan-label">{title}</div>
            <h1>{title}</h1>
            <p className="plan-subtitle">Wypełnij formularz, aby dodać nowy przedmiot.</p>
          </div>
        </div>
        {status?.message && (
          <div className={`admin-status-message ${status.type || ''}`} style={{ margin: '1rem 0', padding: '0.75rem', borderRadius: '4px' }}>
            {status.message}
          </div>
        )}

        <form className="admin-student-form" onSubmit={handleSubmit}>
          <label>
            Nazwa
            <input type="text" name="name" placeholder="Nazwa przedmiotu" value={formData.name || ''} onChange={handleChange} required />
          </label>
          <label>
            Typ
            <input type="text" name="type" placeholder="Typ przedmiotu" value={formData.type || ''} onChange={handleChange} />
          </label>
          <label>
            Ilość godzin
            <input type="text" inputMode="numeric" pattern="[0-9]*" name="hours" placeholder="Ilość godzin" value={formData.hours || ''} onChange={handleChange} />
          </label>
          <label>
            Wykładowca
            <select name="lecturerId" value={formData.lecturerId || ''} onChange={handleChange}>
              <option value="">Brak wykładowcy</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {`${lecturer.firstName} ${lecturer.lastName}${lecturer.title ? ` (${lecturer.title})` : ''}`.trim()}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-form-actions">
            <button type="submit">Zapisz</button>
            <button type="button" className="card-back-button" onClick={onCancel}>Anuluj</button>
          </div>
        </form>
      </div>
    </div>
  )
}
