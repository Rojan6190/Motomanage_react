import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api'

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4"  width="16" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="9"  width="16" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="14" width="16" height="2" rx="1" fill="currentColor"/>
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Collapse({ open, children }) {
  return (
    <div style={{
      overflow: 'hidden',
      maxHeight: open ? 600 : 0,
      transition: 'max-height 0.22s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: '#2a2d3a', margin: '6px 16px' }} />
}

const S = {
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px', margin: '1px 8px', borderRadius: 5,
    cursor: 'pointer', textDecoration: 'none',
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
    fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase',
    color: '#a0a8b8', transition: 'background 0.15s, color 0.15s',
    userSelect: 'none',
  },
  itemActive: {
    color: '#f0a500', background: '#f0a50012',
  },
  sub: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '9px 20px 9px 38px', margin: '1px 8px', borderRadius: 5,
    cursor: 'pointer', textDecoration: 'none',
    fontFamily: "'Barlow', sans-serif", fontWeight: 500,
    fontSize: 13, color: '#7a8094',
    transition: 'background 0.15s, color 0.15s',
    userSelect: 'none',
  },
  subActive: {
    color: '#f0a500', background: '#f0a50010',
  },
}

function SubLink({ to, label, active }) {
  const style = { ...S.sub, ...(active ? S.subActive : {}) }
  return (
    <Link
      to={to} style={style}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#e8eaf0' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#7a8094' }}
    >
      {label}
    </Link>
  )
}

function UserDot({ name }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #f0a500, #e07800)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: '#0f1117',
      fontFamily: "'Barlow Condensed', sans-serif",
    }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

export default function SidebarMenu() {
  const [open,         setOpen]         = useState(false)
  const [usersOpen,    setUsersOpen]    = useState(false)
  const [vehiclesOpen, setVehiclesOpen] = useState(false)
  const [addVehOpen,   setAddVehOpen]   = useState(false)
  const [users,        setUsers]        = useState([])
  const [usersLoaded,  setUsersLoaded]  = useState(false)

  const drawerRef    = useRef(null)
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  // close drawer on navigation
  useEffect(() => { setOpen(false) }, [pathname])

  // close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // lazy load users only when the Add Vehicle picker is opened
  useEffect(() => {
    if (!addVehOpen || usersLoaded) return
    api.get('/users/')
      .then(r => setUsers(r.data?.results ?? r.data))
      .catch(console.error)
      .finally(() => setUsersLoaded(true))
  }, [addVehOpen])

  const handleUserPick = (userId) => {
    setOpen(false)
    navigate(`/vehicles/add?owner=${userId}`)  // AddVehicle.jsx with owner pre-selected
  }

  const is = (path) => path === '/' ? pathname === '/' : pathname.startsWith(path)

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#a0a8b8', padding: '6px 8px', borderRadius: 5,
          display: 'flex', alignItems: 'center',
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#f0a500'; e.currentTarget.style.background = '#f0a50012' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#a0a8b8'; e.currentTarget.style.background = 'transparent' }}
      >
        <MenuIcon />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 200, animation: 'mmFadeIn 0.18s ease',
          }}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
          background: '#13151f', borderRight: '1px solid #2a2d3a',
          zIndex: 201, display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.24s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: open ? '4px 0 32px rgba(0,0,0,0.5)' : 'none',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 56, borderBottom: '1px solid #2a2d3a', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, color: '#f0a500' }}>⬡</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: '1rem', letterSpacing: '0.08em',
              color: '#e8eaf0', textTransform: 'uppercase',
            }}>Main Menu</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#6b7080', fontSize: 18, lineHeight: 1, padding: '4px 6px', borderRadius: 4,
            }}
          >✕</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 10, paddingBottom: 20 }}>

          {/* Dashboard */}
          <Link
            to="/"
            style={{ ...S.item, ...(is('/') ? S.itemActive : {}) }}
            onMouseEnter={e => { if (!is('/')) e.currentTarget.style.color = '#e8eaf0' }}
            onMouseLeave={e => { if (!is('/')) e.currentTarget.style.color = '#a0a8b8' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>⊞</span> Dashboard
            </span>
          </Link>

          <Divider />

          {/* ── Users ── */}
          <div
            style={{ ...S.item, ...(usersOpen ? S.itemActive : {}) }}
            onClick={() => setUsersOpen(o => !o)}
            onMouseEnter={e => { if (!usersOpen) e.currentTarget.style.color = '#e8eaf0' }}
            onMouseLeave={e => { if (!usersOpen) e.currentTarget.style.color = '#a0a8b8' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>👤</span> Users
            </span>
            <ChevronIcon open={usersOpen} />
          </div>

          <Collapse open={usersOpen}>
            <SubLink to="/users"     label="User List" active={pathname === '/users'} />
            <SubLink to="/users/add" label="Add User"  active={pathname === '/users/add'} />
          </Collapse>

          <Divider />

          {/* ── Vehicles ── */}
          <div
            style={{ ...S.item, ...(vehiclesOpen ? S.itemActive : {}) }}
            onClick={() => setVehiclesOpen(o => !o)}
            onMouseEnter={e => { if (!vehiclesOpen) e.currentTarget.style.color = '#e8eaf0' }}
            onMouseLeave={e => { if (!vehiclesOpen) e.currentTarget.style.color = '#a0a8b8' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🚗</span> Vehicles
            </span>
            <ChevronIcon open={vehiclesOpen} />
          </div>

          <Collapse open={vehiclesOpen}>
            <SubLink to="/vehicles" label="Vehicle List" active={pathname === '/vehicles'} />

            {/* Add Vehicle — nested user picker */}
            <div
              style={{ ...S.sub, ...(addVehOpen ? S.subActive : {}) }}
              onClick={() => setAddVehOpen(o => !o)}
              onMouseEnter={e => { if (!addVehOpen) e.currentTarget.style.color = '#e8eaf0' }}
              onMouseLeave={e => { if (!addVehOpen) e.currentTarget.style.color = '#7a8094' }}
            >
              <span>Add Vehicle</span>
              <ChevronIcon open={addVehOpen} />
            </div>

            <Collapse open={addVehOpen}>
              <div style={{
                margin: '4px 8px 6px 8px',
                background: '#0f1117', border: '1px solid #2a2d3a',
                borderRadius: 6, overflow: 'hidden',
              }}>
                <div style={{
                  padding: '7px 14px', fontSize: 11, color: '#6b7080',
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  borderBottom: '1px solid #2a2d3a',
                }}>
                  Select Owner
                </div>

                {!usersLoaded ? (
                  <div style={{ padding: '10px 14px', color: '#6b7080', fontSize: 13 }}>Loading…</div>
                ) : users.length === 0 ? (
                  <div style={{ padding: '10px 14px', color: '#6b7080', fontSize: 13 }}>No users found.</div>
                ) : (
                  users.map(u => (
                    <div
                      key={u.id}
                      onClick={() => handleUserPick(u.id)}
                      style={{
                        padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                        color: '#a0a8b8', borderBottom: '1px solid #1e2130',
                        display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'background 0.12s, color 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f0a50012'; e.currentTarget.style.color = '#f0a500' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a0a8b8' }}
                    >
                      <UserDot name={u.full_name || u.username} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.full_name || u.username}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Collapse>

          </Collapse>

        </nav>
      </div>

      <style>{`@keyframes mmFadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
    </>
  )
}
