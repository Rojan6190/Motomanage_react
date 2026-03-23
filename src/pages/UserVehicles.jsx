import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

const FUEL_ICONS = {
  petrol: '⛽',
  diesel: '🛢️',
  electric: '⚡',
}

const TYPE_LABELS = {
  two_wheeler: 'Two Wheeler',
  four_wheeler: 'Four Wheeler',
  heavy: 'Heavy Vehicle',
}

export default function UserVehicles() {
  const { userId } = useParams()
  const [vehicles, setVehicles] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fix: correct API path matches Django's `users/<user_id>/vehicles/`
    Promise.all([
      api.get(`/users/${userId}/vehicles/`),
      api.get(`/users/${userId}`),
    ])
      .then(([vr, ur]) => {
        setVehicles(vr.data?.results ?? vr.data)
        setUser(ur.data)
      })
      .catch(err => {
        console.error('Error fetching data:', err)
        setError('Failed to load vehicles.')
      })
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div style={{ padding: '24px', color: '#6b7080' }}>Loading vehicles...</div>
  )

  if (error) return (
    <div style={{ padding: '24px', color: '#e05252' }}>{error}</div>
  )

  const displayName = user
    ? ([user.first_name, user.last_name].filter(Boolean).join(' ') || user.username)
    : `User #${userId}`

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Back link */}
      <Link
        to="/"
        style={{
          color: '#f0a500',
          textDecoration: 'none',
          fontSize: '0.9rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '24px'
        }}
      >
        ← Back to Dashboard
      </Link>

      {/* Title row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: 12
      }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', color: '#e8eaf0' }}>
            {displayName}'s Vehicles
          </h1>
          <p style={{ color: '#6b7080', margin: 0 }}>
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
          </p>
        </div>

        {/* + Add a Vehicle — always visible */}
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
          <p style={{ color: '#6b7080', margin: '0 0 16px 0' }}>
            No vehicles registered yet.
          </p>
        
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {vehicles.map(vehicle => (
            <div key={vehicle.id} style={{
              border: '1px solid #2a2d3a', padding: '20px 24px',
              borderRadius: '12px', background: '#191c24',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '12px'
            }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', color: '#e8eaf0', fontSize: '1.1rem' }}>
                  {vehicle.make} {vehicle.model}
                </h3>
                <p style={{ margin: 0, color: '#6b7080', fontSize: '0.85rem' }}>
                  {vehicle.year} · {TYPE_LABELS[vehicle.vehicle_type] ?? vehicle.vehicle_type}
                </p>
              </div>
              <span style={{
                background: '#2a2d3a', padding: '4px 12px',
                borderRadius: '20px', fontSize: '0.8rem', color: '#c0c4d0'
              }}>
                {FUEL_ICONS[vehicle.fuel_type] ?? ''} {vehicle.fuel_type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
