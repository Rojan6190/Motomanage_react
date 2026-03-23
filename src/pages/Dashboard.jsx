import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import UserCard from '../components/UserCard'

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 130 }}>
      <div style={{
        color: '#80786b', fontSize: 11,
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, fontSize: '2.4rem',
        color: color || '#e8eaf0', lineHeight: 1,
      }}>
        {value ?? '—'}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [users, setUsers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users/'),
      api.get('/vehicles/'),
    ])
      .then(([ur, vr]) => {
        setUsers(ur.data?.results ?? ur.data)
        setVehicles(vr.data?.results ?? vr.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalVehicles = vehicles.length
  const twoWheelers = vehicles.filter(v => v.vehicle_type === 'two_wheeler').length
  const fourWheelers = vehicles.filter(v => v.vehicle_type === 'four_wheeler').length

  const countVehiclesForUser = (userId) =>
    vehicles.filter(v => {
      const owner = v.owner
      if (!owner) return false
      return typeof owner === 'object' ? owner.id === userId : owner === userId
    }).length

  return (
    <div className="page" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Dashboard</h1>
        <Link to="/users/add">
          <button style={{
            background: '#f0a500',
            color: '#0f1117',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            + Add User
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '40px',
        flexWrap: 'wrap'
      }}>
        <StatCard label="Total Vehicles" value={loading ? '…' : totalVehicles} />
        <StatCard label="Two Wheelers" value={loading ? '…' : twoWheelers} color="#3ecf8e" />
        <StatCard label="Four Wheelers" value={loading ? '…' : fourWheelers} color="#f0a500" />
        <StatCard label="Users" value={loading ? '…' : users.length} color="#7b9cff" />
      </div>

      {/* Users Grid */}
      <div>
        <h2 style={{
          fontSize: '0.75rem',
          color: '#6b7080',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '20px'
        }}>
          Users — click to view their vehicles
        </h2>

        {loading ? (
          <p style={{ color: '#6b7080' }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ color: '#6b7080' }}>No users found.</p>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'stretch'
          }}>
            {users.map(user => (
              <UserCard
                key={user.id}
                user={user}
                vehicleCount={countVehiclesForUser(user.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
