// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SidebarMenu from './SidebarMenu'

const links = [
  { to: '/',         label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles' },
]

export default function Navbar() {
  const { pathname }   = useLocation()
  const { auth, logout } = useAuth()
  const navigate       = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{
      background: '#13151f',
      borderBottom: '1px solid #2a2d3a',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px 0 12px',
      height: '56px',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <SidebarMenu />

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20, color: '#f0a500' }}>⬡</span>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, fontSize: '1.15rem',
          letterSpacing: '0.08em', color: '#e8eaf0', textTransform: 'uppercase',
        }}>MotoManage</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
        {links.map(({ to, label }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to))
          return (
            <Link key={to} to={to} style={{
              padding: '6px 14px', borderRadius: '5px',
              fontSize: '13px',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: active ? '#f0a500' : '#6b7080',
              background: active ? '#f0a50015' : 'transparent',
              transition: 'color 0.15s, background 0.15s',
            }}>{label}</Link>
          )
        })}
      </div>

      {/* Right side — username + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        {auth?.user && (
          <span style={{
            fontSize: '0.82rem', color: '#6b7080',
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.05em',
          }}>
            {auth.user.username}
          </span>
        )}
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent', border: '1px solid #2a2d3a',
            borderRadius: 6, padding: '5px 12px',
            color: '#6b7080', fontSize: '0.82rem',
            cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e05252'; e.currentTarget.style.borderColor = '#e05252' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6b7080'; e.currentTarget.style.borderColor = '#2a2d3a' }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}