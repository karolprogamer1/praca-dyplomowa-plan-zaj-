import React from 'react'

export default function ZajeciaList({ style, user, classes = [], onAdd, onEdit, onDelete, onBack, onImportCsv, status }) {
  return (
    <div className="student-menu-page" style={style}>
      <div className="student-menu-header">
        <div className="student-menu-user">
          <div>
            <strong>Zarządzanie zajęciami</strong>
            <div className="student-menu-user-info">Zarządzaj zajęciami w bazie danych</div>
          </div>
        </div>
      </div>

      <div className="student-plan-card">
        {status.message && (
          <div className={`admin-status-message ${status.type || ''}`} style={{ margin: '1rem 0', padding: '0.75rem', borderRadius: '4px' }}>
            {status.message}
          </div>
        )}

        <div className="admin-form-actions" style={{ justifyContent: 'flex-start', marginBottom: '1rem' }}>
          <button type="button" className="card-back-button" onClick={onBack}>
            Powrót do menu
          </button>
          <button type="button" onClick={onAdd}>
            Dodaj zajęcia
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
                <th>ID przedmiotu</th>
                <th>Typ</th>
                <th>Czas</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td>{classItem.id}</td>
                  <td>{classItem.subjectId ?? '-'}</td>
                  <td>{classItem.type || '-'}</td>
                  <td>{classItem.time || '-'}</td>
                  <td className="admin-actions-cell">
                    <button type="button" onClick={() => onEdit(classItem)}>
                      Edytuj
                    </button>
                    <button type="button" className="delete-button" onClick={() => onDelete(classItem.id)}>
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan="5">Brak zapisanych zajęć.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
