// pages/EditVehicle.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api'
import VehicleForm from '../components/VehicleForm'
import { validateVehicle } from './AddVehicle'

export default function EditVehicle() {
  const { userId, vehicleId } = useParams()
  const navigate = useNavigate()

  const [vehicle, setVehicle]       = useState(null)
  const [user, setUser]             = useState(null)
  const [errors, setErrors]         = useState({})
  const [focused, setFocused]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError]     = useState('')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/vehicles/${vehicleId}/`),
      api.get(`/users/${userId}`),
    ])
      .then(([vr, ur]) => {
        const v = vr.data
        setVehicle({
          make:         v.make         ?? '',
          model:        v.model        ?? '',
          year:         v.year != null ? String(v.year) : '',
          vehicle_type: v.vehicle_type ?? 'two_wheeler',
          fuel_type:    v.fuel_type    ?? 'petrol',
          // Keep the existing image URL as a string so VehicleForm can show a preview
          image:        v.image        ?? null,
        })
        setUser(ur.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [vehicleId, userId])

  const handleField = e => setVehicle(p => ({ ...p, [e.target.name]: e.target.value }))
  const handleImage = e => setVehicle(p => ({ ...p, image: e.target.files[0] || null }))

  const handleSubmit = async () => {
    const e = validateVehicle(vehicle)
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setApiError('')
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('make', vehicle.make)
      formData.append('model', vehicle.model)
      formData.append('year', Number(vehicle.year))
      formData.append('vehicle_type', vehicle.vehicle_type)
      formData.append('fuel_type', vehicle.fuel_type)
      // Only append image if user picked a new file
      if (vehicle.image instanceof File) formData.append('image', vehicle.image)

      await api.patch(`/vehicles/${vehicleId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
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

  if (loading) return (
    <div style={{ padding: '24px', color: '#6b7080' }}>Loading vehicle…</div>
  )

  if (!vehicle) return (
    <div style={{ padding: '24px', color: '#e05252' }}>Vehicle not found.</div>
  )

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
          Edit Vehicle
        </h1>
        <p style={{ margin: 0, color: '#6b7080', fontSize: '0.9rem' }}>
          Editing <span style={{ color: '#e8eaf0' }}>{vehicle.make} {vehicle.model}</span> for{' '}
          <span style={{ color: '#e8eaf0' }}>{displayName}</span>.
          Fields marked <span style={{ color: '#f0a500' }}>*</span> are required.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <VehicleForm
          vehicle={vehicle}
          errors={errors}
          focused={focused}
          onField={handleField}
          onFocus={setFocused}
          onBlur={() => setFocused('')}
          onImage={handleImage}
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
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  )
}