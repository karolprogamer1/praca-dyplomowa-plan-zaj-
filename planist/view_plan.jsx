import '../App.css'

export default function ViewPlan({ user, plan = [], onBack }) {
  return (
    <div className="student-menu-page">
      <div className="student-plan-card admin-form-card">
        <div className="plan-header">
          <div>
            <div className="plan-label">Plan zajęć</div>
            <h1>Plan dla planisty</h1>
            <p className="plan-subtitle">Przejrzyj wygenerowany plan zajęć. Możesz go eksportować lub poprawić.</p>
          </div>
        </div>

        <div className="plan-table-wrapper">
          {plan.length === 0 ? (
            <div className="empty-state">
              <p>Brak wygenerowanego planu. Przejdź do generatora i wygeneruj plan.</p>
            </div>
          ) : (
            <table className="plan-table">
              <thead>
                <tr>
                  <th>Dzień</th>
                  <th>Godzina</th>
                  <th>Przedmiot</th>
                  <th>Wykładowca</th>
                  <th>Sala</th>
                  <th>Czas</th>
                </tr>
              </thead>
              <tbody>
                {plan.map((row, index) => (
                  <tr key={`${row.day}-${row.time}-${index}`}>
                    <td>{row.day}</td>
                    <td>{row.time}</td>
                    <td>{row.name}</td>
                    <td>{row.lecturer}</td>
                    <td>{row.room}</td>
                    <td>{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-form-actions">
          <button type="button" onClick={onBack}>
            Powrót
          </button>
          <button type="button" disabled={plan.length === 0}>
            Edytuj
          </button>
          <button type="button" disabled={plan.length === 0}>
            Eksportuj
          </button>
        </div>
      </div>
    </div>
  )
}
