function ViewGroups({ onBack }) {
  return (
    <div className="student-groups-page">
      <div className="student-groups-header">
        <div className="student-groups-user">
          <span>Jesteś zalogowany jako</span>
          <p></p>
          <strong>student</strong>
          
        </div>

        <div className="student-groups-zoom">
          <button type="button">A+</button>
          <button type="button">A-</button>
          <button type="button">K+</button>
          <button type="button">K-</button>
        </div>
      </div>

      <div className="groups-card">
        <h2>Podział na grupy</h2>
        <ul className="groups-preview-list">
          <li>Grupa dziekańska (lab) - gr. nr. 1</li>
          <li>Grupa ćwiczeniowa - gr. nr. 3</li>
          <li>Grupa seminaryjna - gr. nr. 2</li>
        </ul>

        <button type="button" className="card-back-button" onClick={onBack}>
          Powrót
        </button>
      </div>
    </div>
  )
}

export default ViewGroups
