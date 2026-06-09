function ViewPersonalData({ user, onBack }) {
  const lecturerInfo = {
    name: `${user?.firstName || 'Jan'} ${user?.lastName || 'Kowalski'}`,
    title: user?.title || 'dr hab.',
    email: user?.email || `${user?.login || 'wykladowca'}@uczelnia.edu.pl`,
    department: user?.department || 'Wydział Informatyki i Telekomunikacji',
    office: user?.office || 'Pokój 12',
    phone: user?.phone || '+48 123 456 789',
    login: user?.login || 'wykladowca',
    role: user?.rola || 'wykładowca',
  }

  return (
    <div className="student-personal-page">
      <div className="student-personal-card">
        <h1>Dane osobowe wykładowcy</h1>
        <div className="personal-field">
          <span>Imię i nazwisko</span>
          <strong>{lecturerInfo.name}</strong>
        </div>
        <div className="personal-field">
          <span>Tytuł</span>
          <strong>{lecturerInfo.title}</strong>
        </div>
        <div className="personal-field">
          <span>Email</span>
          <strong>{lecturerInfo.email}</strong>
        </div>
        <div className="personal-field">
          <span>Katedra / wydział</span>
          <strong>{lecturerInfo.department}</strong>
        </div>
        <div className="personal-field">
          <span>Gabinet</span>
          <strong>{lecturerInfo.office}</strong>
        </div>
        <div className="personal-field">
          <span>Telefon</span>
          <strong>{lecturerInfo.phone}</strong>
        </div>
        <div className="personal-field">
          <span>Login</span>
          <strong>{lecturerInfo.login}</strong>
        </div>
        <div className="personal-field">
          <span>Rola</span>
          <strong>{lecturerInfo.role}</strong>
        </div>
        <button type="button" className="card-back-button" onClick={onBack}>
          Powrót do menu
        </button>
      </div>
    </div>
  )
}

export default ViewPersonalData
