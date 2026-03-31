// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    // Rehydrate from localStorage on page refresh
    const access  = localStorage.getItem('access')
    const refresh = localStorage.getItem('refresh')
    const user    = localStorage.getItem('user')
    return access ? { access, refresh, user: JSON.parse(user) } : null
  })

  const login = ({ access, refresh, user }) => {
    localStorage.setItem('access',  access)
    localStorage.setItem('refresh', refresh)
    localStorage.setItem('user',    JSON.stringify(user))
    setAuth({ access, refresh, user })
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
    setAuth(null)
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}