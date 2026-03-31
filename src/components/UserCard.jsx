// components/UserCard.jsx
import { useNavigate, Link } from 'react-router-dom'

export default function UserCard({ user, vehicleCount }) {
  const navigate = useNavigate()

  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(' ') || user.username

  const initials = [user.first_name, user.last_name]
    .filter(Boolean)
    .map(n => n[0]?.toUpperCase())
    .join('') || user.username?.[0]?.toUpperCase() || '?'

  return (
    <div
      style={{
        background: '#3e3048',
        border: '1px solid #2a2d3a',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: '280px',
        flex: '1 1 300px',
        position: 'relative',  // needed for the absolute edit button
      }}
      onClick={() => navigate(`/users/${user.id}/vehicles`)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#f0a500'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#2a2d3a'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Edit button — top right, stops propagation so card click doesn't also fire */}
      <Link
        to={`/users/${user.id}/edit`}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: 6,
          border: '1px solid #2a2d3a',
          background: '#2a2d3a',
          color: '#6b7080',
          fontSize: 13,
          textDecoration: 'none',
          transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(240,165,0,0.12)'
          e.currentTarget.style.color = '#f0a500'
          e.currentTarget.style.borderColor = '#f0a500'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#2a2d3a'
          e.currentTarget.style.color = '#6b7080'
          e.currentTarget.style.borderColor = '#2a2d3a'
        }}
        title="Edit user"
      >
        ✏️
      </Link>

      {/* Avatar */}
      <div style={{
        width: '60px', height: '60px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #f0a500 0%, #e07800 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', fontWeight: 'bold', color: '#0f1117',
        marginBottom: '16px',
      }}>
        {initials}
      </div>

      {/* User Info */}
      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600, color: '#e8eaf0' }}>
        {fullName}
      </h3>

      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#6b7080' }}>
        @{user.username}
      </p>

      {user.email && (
        <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#6b7080' }}>
          {user.email}
        </p>
      )}

      {/* Vehicle Count Badge */}
      <div style={{
        display: 'inline-block', background: '#2a2d3a',
        padding: '6px 12px', borderRadius: '20px', marginTop: '8px',
      }}>
        <span style={{ color: '#f0a500', fontWeight: 'bold' }}>{vehicleCount}</span>
        <span style={{ color: '#6b7080', fontSize: '0.75rem', marginLeft: '4px' }}>
          vehicle{vehicleCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}