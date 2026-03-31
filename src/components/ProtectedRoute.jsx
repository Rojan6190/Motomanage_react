// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { auth } = useAuth()

  if (!auth) {
    // Not logged in — redirect to login, preserving intended destination
    return <Navigate to="/login" replace />
  }

  if (auth.user?.role !== 'admin') {
    // Logged in but not admin — kick back to login with a message
    return <Navigate to="/login" replace state={{ error: 'Admin access only.' }} />
  }

  return children
}