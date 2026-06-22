function ViewPersonalData({ user, onBack }) {
  const studentDetails = {
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Jan Kowalski',
    indexNumber: user?.indexNumber || '123456',
    email: user?.email || `${user?.login || 'student'}@uczelnia.edu.pl`,
    faculty: user?.faculty || 'Informatyka',
    program: user?.program || 'Informatyka Stosowana',
    year: user?.year || '2',
    login: user?.login || 'student',
    role: user?.rola || 'student',
  }

  return (
    <div className="student-personal-page">
      <div className="student-personal-card">
        <h1>Dane osobowe studenta</h1>
        <div className="personal-field">
          <span>Imię i nazwisko</span>
          <strong>{studentDetails.fullName}</strong>
        </div>
        <div className="personal-field">
          <span>Numer indeksu</span>
          <strong>{studentDetails.indexNumber}</strong>
        </div>
        <div className="personal-field">
          <span>Email</span>
          <strong>{studentDetails.email}</strong>
        </div>
        <div className="personal-field">
          <span>Kierunek</span>
          <strong>{studentDetails.faculty}</strong>
        </div>
        <div className="personal-field">
          <span>Program</span>
          <strong>{studentDetails.program}</strong>
        </div>
        <div className="personal-field">
          <span>Rok studiów</span>
          <strong>{studentDetails.year}</strong>
        </div>
        <div className="personal-field">
          <span>Login systemowy</span>
          <strong>{studentDetails.login}</strong>
        </div>
        <div className="personal-field">
          <span>Rola</span>
          <strong>{studentDetails.role}</strong>
        </div>
        <button type="button" className="card-back-button" onClick={onBack}>
          Powrót do menu
        </button>
      </div>
    </div>
  )
}

export default ViewPersonalData
