import { useState } from 'react'
import '../App.css'
import Generator from './generator.jsx'
import ViewPlan from './view_plan.jsx'

function Menu({ user, onLogout }) {
  const [activeView, setActiveView] = useState(null)
  const [fontScale, setFontScale] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [generatedPlan, setGeneratedPlan] = useState([])

  const handleBack = () => setActiveView(null)
  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout()
      return
    }
    window.location.reload()
  }

  const handlePlanGenerated = (plan) => {
    setGeneratedPlan(plan)
    setActiveView('viewPlan')
  }

  const pageStyle = {
    fontSize: `${fontScale}%`,
    filter: `contrast(${contrast}%)`,
  }

  if (activeView === 'generator') {
    return <Generator user={user} onBack={handleBack} onGenerate={handlePlanGenerated} />
  }

  if (activeView === 'viewPlan') {
    return <ViewPlan user={user} plan={generatedPlan} onBack={handleBack} />
  }

  // jeśli planista nie jest zalogowany, pokazujemy podgląd tylko z wygenerowanego planu
  if (!user && activeView === 'generator') {
    return <Generator user={user} onBack={handleBack} onGenerate={setGeneratedPlan} />
  }

  return (
    <div className="student-menu-page" style={pageStyle}>
      <div className="student-menu-header">
        <div className="student-menu-user">
          <div>
            <strong>Menu planisty</strong>
            <div className="student-menu-user-info">Jesteś zalogowany jako {user?.login || 'planista'}</div>
          </div>
        </div>

        <div className="student-menu-accessibility">
          <button type="button" onClick={() => setFontScale((value) => Math.min(value + 10, 160))}>A+</button>
          <button type="button" onClick={() => setFontScale((value) => Math.max(value - 10, 80))}>A-</button>
          <button type="button" onClick={() => setContrast((value) => Math.min(value + 15, 200))}>K+</button>
          <button type="button" onClick={() => setContrast((value) => Math.max(value - 15, 80))}>K-</button>
        </div>
      </div>

      <div className="student-menu-panel">
        <button type="button" onClick={() => setActiveView('viewPlan')}>
          Wyświetl plan zajęć
        </button>
        <button type="button" onClick={() => setActiveView('generator')}>
          Dodaj nowy plan zajęć
        </button>
        <button type="button" onClick={handleLogout}>
          Wyloguj się
        </button>
      </div>
    </div>
  )
}

export default Menu
