// pages/AddUser.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import UserForm from '../components/UserForm'

export const INITIAL_USER = {
  username: '', email: '',
  first_name: '', last_name: '',
  phone_number: '', mobile_number: '+977-',
  age: '', address: '', gender: 'male',
}

export function validateUser(user) {
  const e = {}

  if (!user.username || user.username.length < 3)
    e.username = 'At least 3 characters.'

  if (!user.email || !user.email.includes('@'))
    e.email = 'Valid email required.'

  // phone_number — optional, only validate if provided
  if (user.phone_number) {
    const phoneDigits = user.phone_number.replace(/\D/g, '').length
    if (phoneDigits < 7)
      e.phone_number = 'At least 7 digits required (e.g. 01-6616905).'
  }

  // mobile_number — required and must have at least 10 digits
  const mobileDigits = (user.mobile_number || '').replace(/\D/g, '').length
  if (!user.mobile_number || user.mobile_number === '+977-' || mobileDigits < 10)
    e.mobile_number = 'Required. At least 10 digits (e.g. +977-9743211466).'

  if (user.age && Number(user.age) < 18)
    e.age = 'Must be 18 or above.'

  return e
}

export default function AddUser() {
  const navigate = useNavigate()

  const [user, setUser]             = useState(INITIAL_USER)
  const [errors, setErrors]         = useState({})
  const [focused, setFocused]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError]     = useState('')

  const handleField = e => setUser(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    const e = validateUser(user)
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setApiError('')
    setSubmitting(true)

    try {
      await api.post('/users/', {
        ...user,
        age: user.age ? Number(user.age) : null,
      })
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setErrors(data)
        setApiError('Please fix the errors below.')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link to="/" style={{ color: '#f0a500', textDecoration: 'none', fontSize: '0.85rem' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ margin: '12px 0 4px', fontSize: '1.9rem', color: '#e8eaf0' }}>
          Add User
        </h1>
        <p style={{ margin: 0, color: '#6b7080', fontSize: '0.9rem' }}>
          Fields marked <span style={{ color: '#f0a500' }}>*</span> are required.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <UserForm
          user={user}
          errors={errors}
          focused={focused}
          onField={handleField}
          onFocus={setFocused}
          onBlur={() => setFocused('')}
        />

        {apiError && (
          <div style={{
            background: '#2a1515', border: '1px solid #e05252',
            borderRadius: 8, padding: '12px 16px',
            color: '#e05252', fontSize: '0.88rem',
          }}>
            {apiError}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 40 }}>
          <Link to="/">
            <button style={{
              background: 'transparent', border: '1px solid #2a2d3a',
              color: '#6b7080', padding: '11px 24px',
              borderRadius: 8, cursor: 'pointer', fontSize: '0.95rem',
            }}>
              Cancel
            </button>
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: submitting ? '#8a6000' : '#f0a500',
              color: '#0f1117', border: 'none',
              padding: '11px 32px', borderRadius: 8,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '0.95rem',
              transition: 'background 0.15s',
            }}
          >
            {submitting ? 'Creating…' : 'Create User'}
          </button>
        </div>

      </div>
    </div>
  )
}