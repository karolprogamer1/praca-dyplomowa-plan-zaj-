import React from 'react'

export default function AddStudent({ style, title = 'Dodaj studenta', formData = {}, onChange, onCancel, onSave }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      indexNumber: formData.indexNumber !== '' ? Number(formData.indexNumber) : null,
      imie: formData.firstName || null,
      nazwisko: formData.lastName || null,
      login: formData.login || null,
      password: formData.password || null,
    }
    onSave(payload)
  }

  return (
    <div className="student-menu-page" style={style}>
      <div className="student-plan-card admin-form-card">
        <div className="plan-header">
          <div>
            <div className="plan-label">{title}</div>
            <h1>{title}</h1>
            <p className="plan-subtitle">Wypełnij formularz, aby zapisać dane studenta.</p>
          </div>
        </div>

        <form className="admin-student-form" onSubmit={handleSubmit}>
          <label>
            Nr albumu
            <input type="text" inputMode="numeric" pattern="[0-9]*" name="indexNumber" placeholder="Wpisz numer albumu" value={formData.indexNumber || ''} onChange={handleChange} required />
          </label>

          <label>
            Imię
            <input type="text" name="firstName" placeholder="Wpisz imię" value={formData.firstName || ''} onChange={handleChange} />
          </label>

          <label>
            Nazwisko
            <input type="text" name="lastName" placeholder="Wpisz nazwisko" value={formData.lastName || ''} onChange={handleChange} />
          </label>

          <label>
            Login
            <input type="text" name="login" placeholder="Wpisz login" value={formData.login || ''} onChange={handleChange} />
          </label>

          <label>
            Hasło
            <input type="password" name="password" placeholder="Wpisz hasło" value={formData.password || ''} onChange={handleChange} />
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
