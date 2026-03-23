// pages/AddUser.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { Field, Input, Select, Section } from '../components/FormElements'

const INITIAL_USER = {
  username: '', email: '',
  first_name: '', last_name: '',
  phone_number: '', mobile_number: '+977-',
  age: '', address: '', gender: 'male',
}

export default function AddUser() {
  const navigate = useNavigate()

  const [user, setUser]         = useState(INITIAL_USER)
  const [errors, setErrors]     = useState({})
  const [focused, setFocused]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleUser = e => setUser(p => ({ ...p, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!user.username || user.username.length < 3)
      e.username = 'At least 3 characters.'
    if (!user.email || !user.email.includes('@'))
      e.email = 'Valid email required.'
    if (!user.phone_number || user.phone_number.length < 10)
      e.phone_number = 'At least 10 digits.'
    if (user.age && Number(user.age) < 18)
      e.age = 'Must be 18 or above.'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
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

  const fp = name => ({
    onFocus: () => setFocused(name),
    onBlur:  () => setFocused(''),
    focused: focused === name,
  })

  return (
    <div style={{ padding: '24px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link to="/" style={{ color: '#f0a500', textDecoration: 'none', fontSize: '0.85rem' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ margin: '12px 0 4px', fontSize: '1.9rem', color: '#050813' }}>
          Add User
        </h1>
        <p style={{ margin: 0, color: '#6b7080', fontSize: '0.9rem' }}>
          Fields marked <span style={{ color: '#f0a500' }}>*</span> are required.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <Section title="User Details">
          <Field label="Username" required error={errors.username}>
            <Input name="username" value={user.username} onChange={handleUser}
              placeholder="e.g. johndoe" {...fp('username')} />
          </Field>

          <Field label="Email" required error={errors.email}>
            <Input name="email" type="email" value={user.email} onChange={handleUser}
              placeholder="john@example.com" {...fp('email')} />
          </Field>

          <Field label="First Name" error={errors.first_name}>
            <Input name="first_name" value={user.first_name} onChange={handleUser}
              placeholder="John" {...fp('first_name')} />
          </Field>

          <Field label="Last Name" error={errors.last_name}>
            <Input name="last_name" value={user.last_name} onChange={handleUser}
              placeholder="Doe" {...fp('last_name')} />
          </Field>

          <Field label="Phone Number" required error={errors.phone_number}>
            <Input name="phone_number" value={user.phone_number} onChange={handleUser}
              placeholder="9800000000" {...fp('phone_number')} />
          </Field>

          <Field label="Mobile Number" error={errors.mobile_number}>
            <Input name="mobile_number" value={user.mobile_number} onChange={handleUser}
              placeholder="+977-9800000000" {...fp('mobile_number')} />
          </Field>

          <Field label="Age" error={errors.age}>
            <Input name="age" type="number" min="18" value={user.age} onChange={handleUser}
              placeholder="18+" {...fp('age')} />
          </Field>

          <Field label="Gender" error={errors.gender}>
            <Select name="gender" value={user.gender} onChange={handleUser} options={[
              { value: 'male',   label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other',  label: 'Other' },
            ]} />
          </Field>

          <Field label="Address" error={errors.address}>
            <Input name="address" value={user.address} onChange={handleUser}
              placeholder="Kathmandu, Nepal" {...fp('address')} />
          </Field>
        </Section>

        {/* API error banner */}
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
