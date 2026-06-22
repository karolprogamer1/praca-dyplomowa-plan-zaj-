import { useState } from 'react'
import './App.css'
import LoginScreen from './auth/LoginScreen.jsx'
import StudentMenu from './student/Menu.jsx'
import LecturerMenu from './lecturer/Menu.jsx'
import AdminMenu from './admin/Menu.jsx'
import PlanistMenu from './planist/Menu.jsx'
import GuestPlan from './public/GuestPlan.jsx'

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [user, setUser] = useState(null)
  const [showGuestPlan, setShowGuestPlan] = useState(false)

  const handleLogin = (userData) => {
    const normalizedUser = {
      ...userData,
      rola: userData?.rola?.toString?.().toLowerCase?.().trim?.() || userData?.role?.toString?.().toLowerCase?.().trim?.(),
      login: userData?.login?.toString?.().trim?.(),
    }

    setUser(normalizedUser)
    setShowLogin(false)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const normalizedRole = user?.rola?.toString?.().toLowerCase?.().trim?.()
  const isStudent = normalizedRole === 'student'
  const isLecturer = normalizedRole === 'wykladowca' || normalizedRole === 'wykładowca'
  const isPlanner = normalizedRole === 'planista'
  const isAdmin = normalizedRole === 'administrator' || normalizedRole === 'admin'

  if (isStudent) {
    return <StudentMenu user={user} onLogout={handleLogout} />
  }

  if (isLecturer) {
    return <LecturerMenu user={user} onLogout={handleLogout} />
  }

  if (isPlanner) {
    return <PlanistMenu user={user} onLogout={handleLogout} />
  }

  if (isAdmin) {
    return (
      <AdminMenu user={user} onLogout={handleLogout} />
    )
  }

  if (user) {
    return (
      <div className="main">
        <h1>Zalogowano jako {user.login}</h1>
        <p>Ta aplikacja obecnie obsługuje menu tylko dla roli studenta.</p>
        <button type="button" onClick={handleLogout}>
          Wyloguj się
        </button>
      </div>
    )
  }

  if (showGuestPlan) {
    return <GuestPlan onBack={() => setShowGuestPlan(false)} />
  }

  if (showLogin) {
    return <LoginScreen
      onBack={() => setShowLogin(false)}
      onLogin={handleLogin}
    />
  }

  return (
    <div className="main">
      <h1>Aplikacja do układania planów zajęć</h1>
      <button type="button" onClick={() => setShowGuestPlan(true)}>
        Zobacz podgląd planu
      </button>
      <button type="button" onClick={() => setShowLogin(true)}>
        Przejdź do logowania
      </button>
    </div>
  )
}

export default App
