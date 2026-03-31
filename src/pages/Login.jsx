// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  const [form, setForm]         = useState({ username: '', password: '' })
  const [error, setError]       = useState(location.state?.error || '')
  const [submitting, setSubmitting] = useState(false)

  const handleField = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Username and password are required.')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const { data } = await api.post('/login/', form)

      // Decode the access token to get username + role
      const decoded = jwtDecode(data.access)

      if (decoded.role !== 'admin') {
        setError('This dashboard is for admins only.')
        return
      }

      login({
        access:  data.access,
        refresh: data.refresh,
        user: {
          id:       decoded.user_id,
          username: decoded.username,
          role:     decoded.role,
        },
      })

      navigate('/')

    } catch (err) {
      const msg = err.response?.data?.detail
      setError(msg || 'Invalid username or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#d8dae4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#13151f', border: '1px solid #2a2d3a',
        borderRadius: 16, padding: '40px 36px',
        width: '100%', maxWidth: 400,
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontSize: 32, color: '#f0a500' }}>⬡</span>
          <h1 style={{
            margin: '10px 0 4px',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: '1.6rem',
            letterSpacing: '0.08em', color: '#e8eaf0',
            textTransform: 'uppercase',
          }}>
            MotoManage
          </h1>
          <p style={{ margin: 0, color: '#6b7080', fontSize: '0.85rem' }}>
            Admin Dashboard
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#2a1515', border: '1px solid #e05252',
            borderRadius: 8, padding: '10px 14px',
            color: '#e05252', fontSize: '0.85rem',
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
              fontSize: '0.78rem', color: '#8b90a0',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Username
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleField}
              placeholder="admin"
              autoComplete="username"
              style={{
                background: '#0f1117', border: '1px solid #2a2d3a',
                borderRadius: 8, padding: '11px 14px',
                color: '#e8eaf0', fontSize: '0.95rem',
                outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{
              fontSize: '0.78rem', color: '#8b90a0',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleField}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                background: '#0f1117', border: '1px solid #2a2d3a',
                borderRadius: 8, padding: '11px 14px',
                color: '#e8eaf0', fontSize: '0.95rem',
                outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 8,
              background: submitting ? '#8a6000' : '#f0a500',
              color: '#0f1117', border: 'none',
              padding: '12px', borderRadius: 8,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '1rem',
              transition: 'background 0.15s',
            }}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  )
}