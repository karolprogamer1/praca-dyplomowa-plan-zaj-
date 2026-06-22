import React from 'react'

export default function AddStudent({ style, title = 'Dodaj studenta', formData = {}, status = {}, classes = [], onChange, onCancel, onSave }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      indexNumber: formData.indexNumber !== '' ? Number(formData.indexNumber) : null,
      login: formData.login || null,
      password: formData.password || null,
      rok_semestr: formData.rokSemestr || null,
      tryb: formData.tryb || null,
      specjalnosc: formData.specjalnosc || null,
      zajeciaId: formData.zajeciaId || null,
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

        {status?.message && (
          <div className={`admin-status-message ${status.type || ''}`} style={{ margin: '1rem 0', padding: '0.75rem', borderRadius: '4px' }}>
            {status.message}
          </div>
        )}

        <form className="admin-student-form" onSubmit={handleSubmit}>
          <label>
            Nr albumu
            <input type="text" inputMode="numeric" pattern="[0-9]*" name="indexNumber" placeholder="Wpisz numer albumu" value={formData.indexNumber || ''} onChange={handleChange} required />
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
            Specjalność
            <select
              name="specjalnosc"
              value={formData.specjalnosc || ''}
              onChange={handleChange}
              disabled={!(formData.rokSemestr === '3/5' || formData.rokSemestr === '3/6' || formData.rokSemestr === '4/7' || formData.rokSemestr === '4/8')}
              required={formData.rokSemestr === '3/5' || formData.rokSemestr === '3/6' || formData.rokSemestr === '4/7' || formData.rokSemestr === '4/8'}
            >
              <option value="">{(formData.rokSemestr === '3/5' || formData.rokSemestr === '3/6' || formData.rokSemestr === '4/7' || formData.rokSemestr === '4/8') ? 'Wybierz' : 'N/A'}</option>
              <option value="M3D">M3D</option>
              <option value="ASiSK">ASiSK</option>
              <option value="PBDiOU">PBDiOU</option>
            </select>
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
