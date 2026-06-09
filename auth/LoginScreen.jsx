import { useState } from 'react'

function LoginScreen({ onBack, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!username.trim() || !password.trim() || !role) {
      setMessage('Wypełnij wszystkie pola.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role }),
      })

      const text = await response.text()
      let data = {}

      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        data = { message: text }
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Błąd logowania. Sprawdź dane i spróbuj ponownie.')
      }

      const user = data.user
      const normalizedUser = {
        ...user,
        rola: user?.rola?.toString?.().toLowerCase?.().trim?.() || role,
        login: user?.login?.toString?.().trim?.() || username,
      }
      setLoggedIn(true)
      setMessage(`Zalogowano jako ${normalizedUser.login}`)
      if (typeof onLogin === 'function') {
        onLogin(normalizedUser)
      }
    } catch (error) {
      setLoggedIn(false)
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <h1>Logowanie</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Nazwa użytkownika
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
            autoComplete="username"
          />
        </label>

        <label>
          Hasło
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        <label>
          Rola
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="administrator">Administrator</option>
            <option value="planista">Planista</option>
            <option value="wykladowca">Wykładowca</option>
            <option value="student">Student</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
      </form>

      {message && (
        <p className={`login-message ${loggedIn ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <button type="button" className="login-back-button" onClick={onBack}>
        Wróć
      </button>

     
    </div>
  )
}

export default LoginScreen
