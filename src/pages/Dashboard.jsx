// src/pages/Dashboard.jsx
import { useEffect, useState, useRef, useCallback } from 'react'
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
      style={{
        position: 'absolute', left: 12, top: '50%',
        transform: 'translateY(-50%)', pointerEvents: 'none',
      }}
    >
      <circle cx="6.5" cy="6.5" r="4.5" stroke="#6b7080" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="#6b7080" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Spinner({ size = 20, style = {} }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid #2a2d3a',
      borderTop: '2px solid #f0a500',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      ...style,
    }} />
  )
}

export default function Dashboard() {
  // ── Stats (fetched once, not paginated) ──────────────────────────────────
  const [vehicles,      setVehicles]      = useState([])
  const [statsLoading,  setStatsLoading]  = useState(true)

  // ── Users (paginated + infinite scroll) ──────────────────────────────────
  const [users,         setUsers]         = useState([])
  const [nextUrl,       setNextUrl]       = useState(null)   // URL for next page from DRF
  const [totalUsers,    setTotalUsers]    = useState(0)
  const [usersLoading,  setUsersLoading]  = useState(true)
  const [loadingMore,   setLoadingMore]   = useState(false)  // loading next page
  const [hasMore,       setHasMore]       = useState(true)

  // ── Search ────────────────────────────────────────────────────────────────
  const [search,        setSearch]        = useState('')
  const [searching,     setSearching]     = useState(false)

  // ── Sentinel ref for IntersectionObserver ────────────────────────────────
  // A tiny invisible div placed at the bottom of the user grid.
  // When it scrolls into view, we load the next page.
  const sentinelRef = useRef(null)

  // ── Initial load — vehicles (for stats) + first page of users ────────────
  useEffect(() => {
    api.get('/vehicles/')
      .then(r => setVehicles(r.data?.results ?? r.data))
      .catch(console.error)
      .finally(() => setStatsLoading(false))

    api.get('/users/')
      .then(r => {
        const data = r.data
        setUsers(data.results ?? data)
        setNextUrl(data.next ?? null)
        setTotalUsers(data.count ?? (data.results ?? data).length)
        setHasMore(!!(data.next))
      })
      .catch(console.error)
      .finally(() => setUsersLoading(false))
  }, [])

  // ── Load next page ────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const r    = await api.get(nextUrl)
      const data = r.data
      setUsers(prev => [...prev, ...(data.results ?? [])])
      setNextUrl(data.next ?? null)
      setHasMore(!!(data.next))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMore(false)
    }
  }, [nextUrl, loadingMore, hasMore])

  //  IntersectionObserver — fires loadMore when sentinel enters viewport ───
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }   // fire when 10% of sentinel is visible
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadMore, hasMore, loadingMore])

  //  Search — debounced, resets pagination 
  useEffect(() => {
    if (!search.trim()) {
      // Cleared — reload first page of full list
      setUsersLoading(true)
      api.get('/users/')
        .then(r => {
          const data = r.data
          setUsers(data.results ?? data)
          setNextUrl(data.next ?? null)
          setTotalUsers(data.count ?? (data.results ?? data).length)
          setHasMore(!!(data.next))
        })
        .catch(console.error)
        .finally(() => setUsersLoading(false))
      return
    }

    setSearching(true)
    const timer = setTimeout(() => {
      // Search resets to page 1 — clear existing users first
      api.get(`/users/?search=${encodeURIComponent(search.trim())}`)
        .then(r => {
          const data = r.data
          setUsers(data.results ?? data)
          setNextUrl(data.next ?? null)
          setTotalUsers(data.count ?? (data.results ?? data).length)
          setHasMore(!!(data.next))
        })
        .catch(console.error)
        .finally(() => setSearching(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Derived stats 
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
        <StatCard label="Total Vehicles" value={statsLoading ? '…' : totalVehicles} />
        <StatCard label="Two Wheelers"   value={statsLoading ? '…' : twoWheelers}   color="#3ecf8e" />
        <StatCard label="Four Wheelers"  value={statsLoading ? '…' : fourWheelers}  color="#f0a500" />
        <StatCard label="Users"          value={statsLoading ? '…' : totalUsers}    color="#7b9cff" />
      </div>

      {/* Search + Users grid */}
      <div>

        {/* Section header + search */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
          marginBottom: '20px',
        }}>
          <h2 style={{
            fontSize: '0.75rem', color: '#6b7080',
            letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0,
          }}>
            Users — click to view their vehicles
          </h2>

          <div style={{ position: 'relative', width: 260 }}>
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, username, email…"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#13151f', border: '1px solid #2a2d3a',
                borderRadius: 8, padding: '8px 12px 8px 34px',
                color: '#e8eaf0', fontSize: '0.85rem',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#f0a500'}
              onBlur={e  => e.target.style.borderColor = '#2a2d3a'}
            />
            {searching && (
              <Spinner size={12} style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
              }} />
            )}
          </div>
        </div>

        {/* Result count */}
        {search.trim() && !searching && (
          <p style={{ color: '#6b7080', fontSize: '0.82rem', margin: '0 0 16px' }}>
            {users.length === 0
              ? `No users found for "${search}"`
              : `${totalUsers} result${totalUsers !== 1 ? 's' : ''} for "${search}"`
            }
          </p>
        )}

        {/* User grid */}
        {usersLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spinner size={28} />
          </div>
        ) : users.length === 0 ? (
          <p style={{ color: '#6b7080' }}>
            {search.trim() ? `No users match "${search}".` : 'No users found.'}
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'stretch' }}>
              {users.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  vehicleCount={countVehiclesForUser(user.id)}
                />
              ))}
            </div>

            {/* Sentinel — IntersectionObserver watches this */}
            <div ref={sentinelRef} style={{ height: 1 }} />

            {/* Loading more spinner */}
            {loadingMore && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                <Spinner size={22} />
              </div>
            )}

            {/* End of list */}
            {!hasMore && users.length > 0 && (
              <p style={{
                textAlign: 'center', color: '#3a3d4a',
                fontSize: '0.8rem', padding: '20px 0',
              }}>
                All {totalUsers} users loaded
              </p>
            )}
          </>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}