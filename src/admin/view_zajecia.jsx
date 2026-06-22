import React, { useMemo, useState } from 'react'

export default function ZajeciaList({ style, user, classes = [], onAdd, onEdit, onAssignLecturer, onDelete, onBack, onImportCsv, onImportExcel, status }) {
  const [filterText, setFilterText] = useState('')

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })


  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const getSortValue = (classItem, key) => {
    switch (key) {
      case 'id':
        return classItem?.id ?? null
      case 'subjectId':
        return classItem?.subjectNameForDisplay ?? classItem?.subjectName ?? classItem?.subjectId ?? null
      case 'semestr':
        return classItem?.semestr ?? null
      case 'groupId':
        return classItem?.groupId ?? null
      case 'type':
        return classItem?.type ?? null
      case 'time':
        return classItem?.time ?? null
      case 'salaId':
        return classItem?.salaId ?? null
      default:
        return null
    }
  }

  const sortedClasses = useMemo(() => {
    const text = filterText.trim().toLowerCase()
    const filtered = !text
      ? classes
      : classes.filter((c) => {
          const haystack = [
            c.id,
            c.subjectNameForDisplay,
            c.subjectName,
            c.subjectId,
            c.semestr,
            c.groupId,
            c.type,
            c.time,
            c.salaId,
          ]
            .filter((v) => v != null)
            .map((v) => String(v).toLowerCase())
            .join(' ')

          return haystack.includes(text)
        })

    if (!sortConfig.key) return filtered


    const dir = sortConfig.direction === 'asc' ? 1 : -1

    const toNumber = (v) => {
      if (v == null) return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }

    return [...classes].sort((a, b) => {
      const va = getSortValue(a, sortConfig.key)
      const vb = getSortValue(b, sortConfig.key)

      const na = toNumber(va)
      const nb = toNumber(vb)

      if (na != null && nb != null) return (na - nb) * dir

      if (va == null && vb == null) return 0
      if (va == null) return 1 * dir
      if (vb == null) return -1 * dir

      return String(va).toLowerCase().localeCompare(String(vb).toLowerCase()) * dir
    })
  }, [classes, sortConfig])

  const SortHeader = ({ label, sortKey }) => {
    const isActive = sortConfig.key === sortKey
    const arrow = isActive ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''

    return (
      <th onClick={() => requestSort(sortKey)} role="button" tabIndex={0} style={{ cursor: 'pointer', userSelect: 'none' }}>
        {label}
        {arrow}
      </th>
    )
  }

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
          <button type="button" onClick={onImportExcel}>
            Import Excel
          </button>
        </div>

        <div className="admin-student-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <label style={{ flex: '2 1 auto', minWidth: '220px' }}>
            Szukaj
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="np. ID, semestr"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button
                type="button"
                onClick={() => setFilterText((t) => String(t))}
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(15, 41, 64, 0.18)',
                  cursor: 'pointer',
                  background: '#0f2940',
                  color: '#fff',
                  fontWeight: 700,
                  boxShadow: '0 10px 20px rgba(15, 41, 64, 0.08)',
                }}
              >
                Szukaj
              </button>
              <button
                type="button"
                onClick={() => setFilterText('')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(15, 41, 64, 0.18)',
                  cursor: 'pointer',
                  background: '#ffffff',
                  color: '#0f2940',
                  fontWeight: 700,
                }}
              >
                Wyczyść
              </button>
            </div>
          </label>
        </div>

        <div className="admin-table-wrapper">

          <table className="schedule-table admin-table">
            <thead>
              <tr>
                <SortHeader label="ID" sortKey="id" />
                <th>L.P.</th>
                <SortHeader label="Przedmiot" sortKey="subjectId" />
                <th>Wykładowca</th>
                <SortHeader label="Semestr" sortKey="semestr" />
                <SortHeader label="Grupa" sortKey="groupId" />
                <SortHeader label="Typ" sortKey="type" />
                <SortHeader label="Czas" sortKey="time" />
                <SortHeader label="Sala" sortKey="salaId" />
                <th>Akcje</th>
              </tr>
            </thead>

            <tbody>
              {sortedClasses.map((classItem, idx) => (
<tr key={classItem.id}>
                  <td>{classItem.id}</td>
                  <td>{idx + 1}</td>
                  <td>{classItem.subjectNameForDisplay ?? classItem.subjectName ?? (classItem.subjectId != null ? classItem.subjectId : '-')}</td>
                  <td>{classItem.wykladowca_imie && classItem.wykladowca_nazwisko
                    ? `${classItem.wykladowca_imie} ${classItem.wykladowca_nazwisko}`
                    : (classItem.wykladowca_id ?? classItem.wykladowcaId) != null
                      ? `ID: ${classItem.wykladowca_id ?? classItem.wykladowcaId}`
                      : '-'}</td>
                  <td>{classItem.semestr || '-'}</td>
                  <td>{classItem.groupId != null ? `Gr. ${classItem.groupId}` : '-'}</td>
                  <td>{classItem.type || '-'}</td>
                  <td>{classItem.time || '-'}</td>
                  <td>{classItem.salaNameForDisplay ?? (classItem.salaId ?? '')}</td>


                  <td className="admin-actions-cell">
                    <button type="button" onClick={() => onEdit(classItem)}>
                      Edytuj
                    </button>
                    <button type="button" onClick={() => onAssignLecturer?.(classItem)}>
                      Przydziel wykładowcę
                    </button>
                    <button type="button" className="delete-button" onClick={() => onDelete(classItem.id)}>
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
              {sortedClasses.length === 0 && (
                <tr>
                  <td colSpan="10">Brak dopasowanych zajęć.</td>
                </tr>

              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

