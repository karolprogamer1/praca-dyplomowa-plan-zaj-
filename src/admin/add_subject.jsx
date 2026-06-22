import React from 'react'

export default function AddSubject({ style, title = 'Dodaj przedmiot', formData = {}, lecturers = [], status = {}, onChange, onCancel, onSave }) {
  const handleChange = (e) => {
    onChange(e)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      nazwa: formData.name || null,
      wykladowca_id: formData.lecturerId ? Number(formData.lecturerId) : null,
      typ: formData.type || null,
      ilosc_godz: formData.hours ? Number(formData.hours) : null,
      semestr: formData.rokSemestr || null,
      tryb: formData.tryb || null,
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
            Rok/Semestr
            <select name="rokSemestr" value={formData.rokSemestr || ''} onChange={handleChange} required>
              <option value="">Wybierz</option>
              <option value="1/1">1/1</option>
              <option value="1/2">1/2</option>
              <option value="2/3">2/3</option>
              <option value="2/4">2/4</option>
              <option value="3/5">3/5</option>
              <option value="3/6">3/6</option>
              <option value="4/7">4/7</option>
              <option value="4/8">4/8</option>
            </select>
          </label>

          <label>
            Tryb
            <select name="tryb" value={formData.tryb || ''} onChange={handleChange} required>
              <option value="">Wybierz</option>
              <option value="STAC">STAC</option>
              <option value="NSTAC">NSTAC</option>
            </select>
          </label>

          <label>
            Ilość godzin
            <input type="text" inputMode="numeric" pattern="[0-9]*" name="hours" placeholder="Ilość godzin" value={formData.hours || ''} onChange={handleChange} />
          </label>

          <label>
            Wykładowca
            <select name="lecturerId" value={formData.lecturerId || ''} onChange={handleChange}>
              <option value="">— brak / nie ustawiaj —</option>
              {(lecturers || []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.firstName || l.lastName ? `${l.firstName || ''} ${l.lastName || ''}`.trim() : `ID: ${l.id}`}
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
