import { Link, useLocation } from 'react-router-dom'
import SidebarMenu from './SidebarMenu'

const links = [
  { to: '/',         label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles' },
]

export default function Navbar() {
  const { pathname } = useLocation()

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
      {/* Hamburger — opens the sidebar drawer */}
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

      {/* Top nav links */}
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

    </nav>
  )
}
