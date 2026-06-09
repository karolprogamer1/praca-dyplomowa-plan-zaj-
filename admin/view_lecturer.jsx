import React from 'react'

export default function LecturerList({ style, lecturers = [], onAdd, onEdit, onDelete, onImportCsv, onBack, status }) {
  return (
    <div className="student-menu-page" style={style}>
      <div className="student-menu-header">
        <div className="student-menu-user">
          <div>
            <strong>Menu administratora</strong>
            <div className="student-menu-user-info">Zarządzanie wykładowcami</div>
          </div>
        </div>
      </div>
      {status?.message && (
        <div className={`admin-status-message ${status.type || ''}`} style={{ margin: '1rem 0', padding: '0.75rem', borderRadius: '4px' }}>
          {status.message}
        </div>
      )}

      <div className="student-plan-card">
        <div className="admin-form-actions" style={{ justifyContent: 'flex-start', marginBottom: '1rem' }}>
          <button type="button" className="card-back-button" onClick={onBack}>
            Powrót do menu
          </button>
        </div>
        <div className="plan-header">
          <div>
            <div className="plan-label">Wykładowcy</div>
            <h1>Lista wykładowców</h1>
            <p className="plan-subtitle">Zarządzaj wykładowcami: dodawaj, edytuj lub usuwaj.</p>
          </div>
        </div>

        <div className="admin-student-actions" style={{ gap: '0.5rem', display: 'flex', flexWrap: 'wrap' }}>
          <button type="button" onClick={onAdd}>
            Dodaj wykładowcę
          </button>
          <button type="button" onClick={onImportCsv}>
            Import CSV
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="schedule-table admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Użytkownik ID</th>
                <th>Imię</th>
                <th>Nazwisko</th>
                <th>Tytuł</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {lecturers.map((lecturer) => (
                <tr key={lecturer.id}>
                  <td>{lecturer.id}</td>
                  <td>{lecturer.userId}</td>
                  <td>{lecturer.firstName}</td>
                  <td>{lecturer.lastName}</td>
                  <td>{lecturer.title}</td>
                  <td className="admin-actions-cell">
                    <button type="button" onClick={() => onEdit(lecturer)}>
                      Edytuj
                    </button>
                    <button type="button" className="delete-button" onClick={() => onDelete(lecturer.id)}>
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
