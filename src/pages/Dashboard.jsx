// src/pages/Dashboard.jsx
import { useEffect, useState, useCallback } from 'react'
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

function SearchIcon() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    >
      <circle cx="6.5" cy="6.5" r="4.5" stroke="#6b7080" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="#6b7080" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Dashboard() {
  const [users,    setUsers]    = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [searching, setSearching] = useState(false)

  // Initial load — fetch all users + vehicles
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

  // Debounced search — calls the backend after 300ms of no typing
  // Falls back to showing all users when search is cleared
  useEffect(() => {
    if (!search.trim()) {
      // Cleared — restore full list without hitting the API again
      if (!loading) {
        setSearching(false)
      }
      return
    }

    setSearching(true)
    const timer = setTimeout(() => {
      api.get(`/users/?search=${encodeURIComponent(search.trim())}`)
        .then(r => setUsers(r.data?.results ?? r.data))
        .catch(console.error)
        .finally(() => setSearching(false))
    }, 300)

    return () => clearTimeout(timer)   // cancel if user types again within 300ms
  }, [search])

  // When search is cleared, reload the full user list
  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)
    if (!val.trim()) {
      api.get('/users/')
        .then(r => setUsers(r.data?.results ?? r.data))
        .catch(console.error)
    }
  }

  const totalVehicles = vehicles.length
  const twoWheelers   = vehicles.filter(v => v.vehicle_type === 'two_wheeler').length
  const fourWheelers  = vehicles.filter(v => v.vehicle_type === 'four_wheeler').length

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
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '32px',
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Dashboard</h1>
        <Link to="/users/add">
          <button style={{
            background: '#f0a500', color: '#0f1117',
            border: 'none', padding: '10px 20px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
          }}>
            + Add User
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <StatCard label="Total Vehicles" value={loading ? '…' : totalVehicles} />
        <StatCard label="Two Wheelers"   value={loading ? '…' : twoWheelers}   color="#3ecf8e" />
        <StatCard label="Four Wheelers"  value={loading ? '…' : fourWheelers}  color="#f0a500" />
        <StatCard label="Users"          value={loading ? '…' : users.length}  color="#7b9cff" />
      </div>

      {/* Search + Users grid */}
      <div>

        {/* Section header + search bar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontSize: '0.75rem', color: '#6b7080',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            margin: 0,
          }}>
            Users — click to view their vehicles
          </h2>

          {/* Search input */}
          <div style={{ position: 'relative', width: 260 }}>
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name, username, email…"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#13151f',
                border: '1px solid #2a2d3a',
                borderRadius: 8,
                padding: '8px 12px 8px 34px',
                color: '#e8eaf0',
                fontSize: '0.85rem',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e  => e.target.style.borderColor = '#f0a500'}
              onBlur={e   => e.target.style.borderColor = '#2a2d3a'}
            />
            {/* Spinner shown while waiting for search response */}
            {searching && (
              <div style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
                width: 12, height: 12,
                border: '2px solid #2a2d3a',
                borderTop: '2px solid #f0a500',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }} />
            )}
          </div>
        </div>

        {/* Search result label */}
        {search.trim() && !searching && (
          <p style={{ color: '#6b7080', fontSize: '0.82rem', margin: '0 0 16px' }}>
            {users.length === 0
              ? `No users found for "${search}"`
              : `${users.length} result${users.length !== 1 ? 's' : ''} for "${search}"`
            }
          </p>
        )}

        {/* User grid */}
        {loading ? (
          <p style={{ color: '#6b7080' }}>Loading users...</p>
        ) : users.length === 0 ? (
          <p style={{ color: '#6b7080' }}>
            {search.trim() ? `No users match "${search}".` : 'No users found.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
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

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg) } }`}</style>
    </div>
  )
}