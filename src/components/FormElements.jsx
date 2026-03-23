//form helper components used by Adduser.jsx and AddVehicle.jsx

export function Field({ label, required, error, children}){
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap:6}}>  
        <label style={{fontSize:'0.78rem', color: '#8b90a0', letterSpacing: '0.06em', textTransform: 'uppercase'}}>
            {label} {required && <span style={{ color: '#f0a500', marginLeft: 3}}>*</span>}
        </label> 
        {children}
        {error && <span style={{fontSize: '0.75rem', color: '#e05252'}}>{error}</span>}

        </div>
    )
      
}

const inputStyle = {
    background: '#e9d66f',
    border:'1px solid #2a2d3a',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#0e111b',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
    boxSizing: 'border-box',

}

export function Input({ name, value, onChange, onFocus, onBlur, focused, type = 'text', placeholder, min }) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      min={min}
      style={{ ...inputStyle, ...(focused ? { borderColor: '#f0a500' } : {}) }}
    />
  )
}

export function Select({name, value, onChange, options}){
    return(
        <select
            name={name}
            value={value}
            onChange={onChange}
            style={{ ...inputStyle, cursor: 'pointer'}}
            >
            {options.map(o=> (
                <option key={o.value} value={o.value}>
                    {o.label}   
                </option>
            ))}
        </select>
    )

}



export function Section({ title, subtitle, children }) {
  return (
    <div style={{
      background: '#191c2408',
      border: '1px solid #2a2d3a',
      borderRadius: 14,
      padding: '28px 28px 24px',
    }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: '1rem', color: '#070c1c', fontWeight: 600 }}>
          {title}
        </h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6b7080' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
        {children}
      </div>
    </div>
  )
}
