// pages/AddVehicle.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api'
import { Field, Input, Select, Section } from '../components/FormElements'

const INITIAL_VEHICLE = {
  make: '', model: '', year: '',
  vehicle_type: 'two_wheeler', fuel_type: 'petrol',
}

export default function AddVehicle() {
  const navigate = useNavigate()
  const { userId } = useParams()

  const [vehicle, setVehicle]   = useState(INITIAL_VEHICLE)
  const [user, setUser]         = useState(null)
  const [errors, setErrors]     = useState({})
  const [focused, setFocused]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  // Fetch user so we can show their name in the header
  useEffect(() => {
    api.get(`/users/${userId}`)
      .then(r => setUser(r.data))
      .catch(console.error)
  }, [userId])

  const handleVehicle = e => setVehicle(p => ({ ...p, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!vehicle.make.trim())   e.make  = 'Required.'
    if (!vehicle.model.trim())  e.model = 'Required.'
    if (
      !vehicle.year ||
      Number(vehicle.year) < 1900 ||
      Number(vehicle.year) > new Date().getFullYear() + 1
    ) e.year = 'Enter a valid year.'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setApiError('')
    setSubmitting(true)

    try {
      await api.post('/vehicles/', {
        ...vehicle,
        year:  Number(vehicle.year),
        owner: Number(userId),
      })
      // Go back to this user's vehicle list
      navigate(`/users/${userId}/vehicles`)
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

  const displayName = user
    ? ([user.first_name, user.last_name].filter(Boolean).join(' ') || user.username)
    : `User #${userId}`

  return (
    <div style={{ padding: '24px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          to={`/users/${userId}/vehicles`}
          style={{ color: '#f0a500', textDecoration: 'none', fontSize: '0.85rem' }}
        >
          ← Back to {displayName}'s Vehicles
        </Link>
        <h1 style={{ margin: '12px 0 4px', fontSize: '1.9rem', color: '#e8eaf0' }}>
          Add Vehicle
        </h1>
        <p style={{ margin: 0, color: '#6b7080', fontSize: '0.9rem' }}>
          Registering a vehicle for <span style={{ color: '#e8eaf0' }}>{displayName}</span>.
          Fields marked <span style={{ color: '#f0a500' }}>*</span> are required.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <Section title="Vehicle Details">
          <Field label="Brand" required error={errors.make}>
            <Input name="make" value={vehicle.make} onChange={handleVehicle}
              placeholder="e.g. Honda" {...fp('make')} />
          </Field>

          <Field label="Model" required error={errors.model}>
            <Input name="model" value={vehicle.model} onChange={handleVehicle}
              placeholder="e.g. CBR150R" {...fp('model')} />
          </Field>

          <Field label="Year" required error={errors.year}>
            <Input name="year" type="number" min="1900" value={vehicle.year}
              onChange={handleVehicle} placeholder="2022" {...fp('year')} />
          </Field>

          <Field label="Vehicle Type" error={errors.vehicle_type}>
            <Select name="vehicle_type" value={vehicle.vehicle_type} onChange={handleVehicle} options={[
              { value: 'two_wheeler',  label: 'Two Wheeler' },
              { value: 'four_wheeler', label: 'Four Wheeler' },
              { value: 'heavy',        label: 'Heavy Vehicle' },
            ]} />
          </Field>

          <Field label="Fuel Type" error={errors.fuel_type}>
            <Select name="fuel_type" value={vehicle.fuel_type} onChange={handleVehicle} options={[
              { value: 'petrol',   label: 'Petrol' },
              { value: 'diesel',   label: 'Diesel' },
              { value: 'electric', label: 'Electric' },
            ]} />
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
          <Link to={`/users/${userId}/vehicles`}>
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
            {submitting ? 'Adding…' : 'Add Vehicle'}
          </button>
        </div>

      </div>
    </div>
  )
}
