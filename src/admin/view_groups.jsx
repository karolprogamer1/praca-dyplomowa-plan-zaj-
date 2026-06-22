import React, { useMemo, useState } from 'react'

export default function ViewGroupList({ style, groups = [], onViewDetails, onAssign, onBack }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const getSortValue = (g, key) => {
    switch (key) {
      case 'id':
        return g?.id ?? null
      case 'subjectName':
        return g?.subjectName ?? null
      case 'groupId':
        return g?.groupId ?? null
      case 'roomName':
        return g?.roomName ?? null
      case 'type':
        return g?.type ?? null
      case 'time':
        return g?.time ?? null
      case 'count':
        return g?.count ?? null
      default:
        return null
    }
  }

  const [filterText, setFilterText] = useState('')

  const [searchKey, setSearchKey] = useState(0)

  const sortedGroups = useMemo(() => {
    const text = filterText.trim().toLowerCase()
    const filtered = !text
      ? groups
      : groups.filter((g) => {
          const haystack = [
            g?.id,
            g?.subjectName,
            g?.groupId,
            g?.roomName,
            g?.type,
            g?.time,
            g?.count,
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

    return [...groups].sort((a, b) => {
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
  }, [groups, sortConfig, filterText, searchKey])

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
      <div className="student-plan-card">
        <div className="admin-form-actions" style={{ justifyContent: 'flex-start', marginBottom: '1rem' }}>
          <button type="button" className="card-back-button" onClick={onBack}>
            Powrót do menu
          </button>
        </div>
        <div className="plan-header">
          <div>
            <div className="plan-label">Grupy</div>
            <h1>Zarządzanie grupami</h1>
            <p className="plan-subtitle">Lista grup utworzonych na podstawie zajęć oraz liczba przypisanych osób.</p>
          </div>
        </div>

        <div className="admin-student-actions" style={{ gap: '0.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" onClick={onAssign}>
            Przydziel studenta do grupy
          </button>
        </div>

        <div className="admin-student-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', justifyContent: 'flex-start' }}>
          <label style={{ flex: '2 1 auto', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 700 }}>Szukaj</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="np. przedmiot, sala, typ..."
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
                  whiteSpace: 'nowrap',
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
                  whiteSpace: 'nowrap',
                }}
              >
                Wyczyść
              </button>
            </div>
          </label>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <SortHeader label="ID Zajęć" sortKey="id" />
                <th>L.P.</th>
                <SortHeader label="Przedmiot" sortKey="subjectName" />
                <SortHeader label="Gr." sortKey="groupId" />
                <SortHeader label="Sala" sortKey="roomName" />
                <SortHeader label="Typ" sortKey="type" />
                <SortHeader label="Czas" sortKey="time" />
                <SortHeader label="Liczba osób" sortKey="count" />
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {sortedGroups.map((g, idx) => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td>{idx + 1}</td>
                  <td>{g.subjectName}</td>
                  <td>{g.groupId ? `Gr. ${g.groupId}` : '-'}</td>
                  <td>{g.roomName}</td>
                  <td>{g.type}</td>
                  <td>{g.time}</td>
                  <td style={{ fontWeight: 'bold' }}>{g.count}</td>
                  <td className="admin-actions-cell">
                    <button type="button" onClick={() => onViewDetails(g.id)}>
                      Szczegóły
                    </button>
                    <button type="button" onClick={() => onAssign(g.id)}>
                      Przydziel studenta
                    </button>
                  </td>
                </tr>
              ))}
              {sortedGroups.length === 0 && (
                <tr>
                  <td colSpan="9">Brak dopasowanych grup.</td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

