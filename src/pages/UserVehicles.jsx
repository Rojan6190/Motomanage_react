// src/pages/UserVehicles.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

const FUEL_ICONS = {
  petrol: '⛽',
  diesel: '🛢️',
  electric: '⚡',
}

const TYPE_LABELS = {
  two_wheeler:  'Two Wheeler',
  four_wheeler: 'Four Wheeler',
  heavy:        'Heavy Vehicle',
}

const STATUS_COLORS = {
  active:  { bg: '#0d2e1f', border: '#1a5c3a', text: '#3ecf8e' },
  expired: { bg: '#2e0d0d', border: '#5c1a1a', text: '#e05252' },
  pending: { bg: '#2e220d', border: '#5c440d', text: '#f0a500' },
}

// ── Insurance form (inline) ───────────────────────────────────────────────────
const EMPTY_INS = {
  policy_number: '',
  start_date:    '',
  expiry_date:   '',
  status:        'active',
}

function InsuranceForm({ vehicleId, existing, onSaved, onCancel }) {
  const [form, setForm]       = useState(existing
    ? {
        policy_number: existing.policy_number,
        start_date:    existing.start_date,
        expiry_date:   existing.expiry_date,
        status:        existing.status,
      }
    : EMPTY_INS
  )
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [apiErr, setApiErr]   = useState('')

  const handleField = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.policy_number.trim()) e.policy_number = 'Required.'
    if (!form.start_date)           e.start_date    = 'Required.'
    if (!form.expiry_date)          e.expiry_date   = 'Required.'
    if (form.start_date && form.expiry_date && form.expiry_date <= form.start_date)
      e.expiry_date = 'Must be after start date.'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setApiErr('')
    setSaving(true)
    try {
      let res
      if (existing) {
        // Update existing insurance
        res = await api.patch(`/insurances/${existing.id}/`, form)
      } else {
        // Create new insurance
        res = await api.post('/insurances/', { ...form, vehicle: vehicleId })
      }
      onSaved(res.data)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') setErrors(data)
      else setApiErr('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    background: '#0f1117',
    border: '1px solid #2a2d3a',
    borderRadius: 6,
    padding: '8px 10px',
    color: '#e8eaf0',
    fontSize: '0.85rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle = {
    fontSize: '0.72rem',
    color: '#6b7080',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div style={{
      background: '#0f1117',
      border: '1px solid #2a2d3a',
      borderRadius: 10,
      padding: '18px 20px',
      marginTop: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ fontSize: '0.8rem', color: '#f0a500', fontWeight: 600, marginBottom: 2 }}>
        {existing ? 'Edit Insurance' : 'Add Insurance'}
      </div>

      {/* Policy Number + Status — side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Policy Number *</label>
          <input
            name="policy_number"
            value={form.policy_number}
            onChange={handleField}
            placeholder="POL-2024-001"
            style={inputStyle}
          />
          {errors.policy_number && <span style={{ fontSize: '0.72rem', color: '#e05252' }}>{errors.policy_number}</span>}
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleField}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Dates — side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Start Date *</label>
          <input
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleField}
            style={inputStyle}
          />
          {errors.start_date && <span style={{ fontSize: '0.72rem', color: '#e05252' }}>{errors.start_date}</span>}
        </div>

        <div>
          <label style={labelStyle}>Expiry Date *</label>
          <input
            name="expiry_date"
            type="date"
            value={form.expiry_date}
            onChange={handleField}
            style={inputStyle}
          />
          {errors.expiry_date && <span style={{ fontSize: '0.72rem', color: '#e05252' }}>{errors.expiry_date}</span>}
        </div>
      </div>

      {apiErr && (
        <div style={{ fontSize: '0.78rem', color: '#e05252' }}>{apiErr}</div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent', border: '1px solid #2a2d3a',
            borderRadius: 6, padding: '7px 16px',
            color: '#6b7080', fontSize: '0.82rem', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? '#8a6000' : '#f0a500',
            border: 'none', borderRadius: 6,
            padding: '7px 20px',
            color: '#0f1117', fontWeight: 700,
            fontSize: '0.82rem', cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ── Insurance panel (display or empty state) ──────────────────────────────────
function InsurancePanel({ vehicleId, insurance, onUpdated }) {
  const [showForm, setShowForm] = useState(false)

  const handleSaved = (data) => {
    setShowForm(false)
    onUpdated(vehicleId, data)
  }

  // No insurance yet
  if (!insurance) {
    return (
      <div style={{ marginTop: 12 }}>
        {showForm ? (
          <InsuranceForm
            vehicleId={vehicleId}
            existing={null}
            onSaved={handleSaved}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent',
              border: '1px dashed #2a2d3a',
              borderRadius: 8, padding: '8px 14px',
              color: '#6b7080', fontSize: '0.82rem',
              cursor: 'pointer', width: '100%',
              justifyContent: 'center',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#f0a500'; e.currentTarget.style.color = '#f0a500' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2d3a'; e.currentTarget.style.color = '#6b7080' }}
          >
            + Add Insurance
          </button>
        )}
      </div>
    )
  }

  // Insurance exists
  const colors = STATUS_COLORS[insurance.status] ?? STATUS_COLORS.pending

  return (
    <div style={{ marginTop: 12 }}>
      {showForm ? (
        <InsuranceForm
          vehicleId={vehicleId}
          existing={insurance}
          onSaved={handleSaved}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          {/* Left — insurance details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7080' }}>🛡️ Insurance</span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700,
                color: colors.text,
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 4, padding: '1px 7px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {insurance.status}
              </span>
            </div>
            <div style={{ fontSize: '0.83rem', color: '#e8eaf0', fontWeight: 600 }}>
              {insurance.policy_number}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7080' }}>
              {insurance.start_date} → {insurance.expiry_date}
            </div>
          </div>

          {/* Right — edit button */}
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: 6, padding: '5px 12px',
              color: colors.text, fontSize: '0.78rem',
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            ✏️ Edit
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UserVehicles() {
  const { userId } = useParams()
  const [vehicles,   setVehicles]   = useState([])
  const [insurances, setInsurances] = useState({})   // { vehicleId: insuranceObj | null }
  const [user,       setUser]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/users/${userId}/vehicles/`),
      api.get(`/users/${userId}`),
    ])
      .then(async ([vr, ur]) => {
        const vList = vr.data?.results ?? vr.data
        setVehicles(vList)
        setUser(ur.data)

        // Fetch insurance for each vehicle in parallel
        // A 404 means no insurance — that's fine, store null
        const insResults = await Promise.all(
          vList.map(v =>
            api.get(`/vehicles/${v.id}/insurance/`)
              .then(r => ({ id: v.id, data: r.data }))
              .catch(() => ({ id: v.id, data: null }))
          )
        )
        const insMap = {}
        insResults.forEach(({ id, data }) => { insMap[id] = data })
        setInsurances(insMap)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load vehicles.')
      })
      .finally(() => setLoading(false))
  }, [userId])

  // Called by InsurancePanel when insurance is saved (created or updated)
  const handleInsuranceUpdated = (vehicleId, data) => {
    setInsurances(prev => ({ ...prev, [vehicleId]: data }))
  }

  if (loading) return <div style={{ padding: '24px', color: '#6b7080' }}>Loading vehicles...</div>
  if (error)   return <div style={{ padding: '24px', color: '#e05252' }}>{error}</div>

  const displayName = user
    ? ([user.first_name, user.last_name].filter(Boolean).join(' ') || user.username)
    : `User #${userId}`

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Back link */}
      <Link to="/" style={{
        color: '#f0a500', textDecoration: 'none',
        fontSize: '0.9rem', display: 'inline-flex',
        alignItems: 'center', gap: '6px', marginBottom: '24px',
      }}>
        ← Back to Dashboard
      </Link>

      {/* Title row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '32px',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', color: '#e8eaf0' }}>
            {displayName}'s Vehicles
          </h1>
          <p style={{ color: '#6b7080', margin: 0 }}>
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
          </p>
        </div>

        <Link
          to={`/users/${userId}/vehicles/add`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#f0a500', textDecoration: 'none',
            fontSize: '0.9rem', fontWeight: 600,
            border: '1px solid #f0a500', borderRadius: 8,
            padding: '8px 16px', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,165,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          + Add a Vehicle
        </Link>
      </div>

      {/* Empty state */}
      {vehicles.length === 0 ? (
        <div style={{
          border: '1px dashed #2a2d3a', borderRadius: 12,
          padding: '48px 24px', textAlign: 'center',
        }}>
          <p style={{ color: '#6b7080', margin: 0 }}>No vehicles registered yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {vehicles.map(vehicle => (
            <div key={vehicle.id} style={{
              border: '1px solid #2a2d3a',
              borderRadius: '12px', background: '#191c24',
              overflow: 'hidden',
            }}>

              {/* Image */}
              <div style={{
                width: '100%', height: 140,
                background: '#0f1117',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {vehicle.image ? (
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ color: '#3a3d4a', fontSize: 13, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🚘</div>
                    No image uploaded
                  </div>
                )}
              </div>

              {/* Vehicle info + insurance */}
              <div style={{ padding: '16px 20px 20px' }}>

                {/* Top row — name, fuel badge, edit button */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: 10,
                  marginBottom: 4,
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', color: '#e8eaf0', fontSize: '1.1rem' }}>
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p style={{ margin: 0, color: '#6b7080', fontSize: '0.82rem' }}>
                      {vehicle.year} · {TYPE_LABELS[vehicle.vehicle_type] ?? vehicle.vehicle_type}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: '#2a2d3a', padding: '4px 12px',
                      borderRadius: '20px', fontSize: '0.78rem', color: '#c0c4d0',
                    }}>
                      {FUEL_ICONS[vehicle.fuel_type] ?? ''} {vehicle.fuel_type}
                    </span>

                    <Link
                      to={`/users/${userId}/vehicles/${vehicle.id}/edit`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        color: '#f0a500', textDecoration: 'none',
                        fontSize: '0.78rem', fontWeight: 600,
                        border: '1px solid #f0a500', borderRadius: 6,
                        padding: '4px 10px', transition: 'background 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,165,0,0.10)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      ✏️ Edit
                    </Link>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#2a2d3a', margin: '14px 0' }} />

                {/* Insurance panel */}
                <InsurancePanel
                  vehicleId={vehicle.id}
                  insurance={insurances[vehicle.id]}
                  onUpdated={handleInsuranceUpdated}
                />

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}