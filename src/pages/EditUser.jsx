import { useState, useEffect, use } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api  from "../api";
import UserForm from "../components/UserForm";
import { validateUser } from "./AddUser";

export default function EditUser(){
    const{userId} = useParams()
    const navigate = useNavigate()

    const[user, setUser] = useState(null)
    const[errors, setErrors]= useState({})  
    const[focused, setFocused]=useState('')
    const[submitting, setSubmitting]=useState(false)
    const [apiError, setApiError] = useState('')
    const [loading, setLoading] = useState(true)


/* 
As "EditUser" is a standalone page-when a user navigates directly to /users/5/edit(via URL,
refresh, or the Edit User button), React mounts a fresh component with zero state. It only has
"userId" from the URL params.
The data already displayed on "UserVehicles" lives in that component's local state, and React
doesn't share state between components unless you use a global store(like Redux, Zustand, or Context). 
There's no automatic way for "EditUser" to say "hey, 'UserVehicles' already fetched this user, give it
to me.
So the 'api.get' call is necessary to pre-fill the form with the user's existing values. Without it, every
field would start empty and hitting Save would overwrite everything with blank data. 

later we will use either of this:
- React Context / Zustand — cache the user object globally after the first fetch, read it in EditUser
- React Router state — pass the user object through the Link: <Link to={...} state={{ user }}>, 
then read it with useLocation().state in EditUser (works but breaks on page refresh since location state doesn't persist)

For a small app like this, the fetch-on-mount approach is perfectly fine and the most straightforward.



*/
    useEffect(() => {
    api.get(`/users/${userId}`)  
      .then(r => {
        const u = r.data
        setUser({
          username:      u.username      ?? '',
          email:         u.email         ?? '',
          first_name:    u.first_name    ?? '',
          last_name:     u.last_name     ?? '',
          phone_number:  u.phone_number  ?? '',
          mobile_number: u.mobile_number ?? '+977-',
          age:           u.age != null   ? String(u.age) : '',
          address:       u.address       ?? '',
          gender:        u.gender        ?? 'male',
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  const handleField = e => setUser(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    const e = validateUser(user)
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setApiError('')
    setSubmitting(true)

    try {
      await api.patch(`/users/${userId}/`, {
        ...user,
        age: user.age ? Number(user.age) : null,
      })
      navigate(`/users/${userId}/vehicles`)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setErrors(data)
        setApiError('Please fix the errors below.')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ padding: '24px', color: '#6b7080' }}>Loading user…</div>
  )

  if (!user) return (
    <div style={{ padding: '24px', color: '#e05252' }}>User not found.</div>
  )

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username

  return (
    <div style={{ padding: '24px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          to={`/`}
          style={{ color: '#f0a500', textDecoration: 'none', fontSize: '0.85rem' }}
        >
          ← Back to Dashboard
        </Link>
        <h1 style={{ margin: '12px 0 4px', fontSize: '1.9rem', color: '#e8eaf0' }}>
          Edit User
        </h1>
        <p style={{ margin: 0, color: '#6b7080', fontSize: '0.9rem' }}>
          Editing <span style={{ color: '#e8eaf0' }}>{displayName}</span>.
          Fields marked <span style={{ color: '#f0a500' }}>*</span> are required.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <UserForm
          user={user}
          errors={errors}
          focused={focused}
          onField={handleField}
          onFocus={setFocused}
          onBlur={() => setFocused('')}
        />

        {apiError && (
          <div style={{
            background: '#2a1515', border: '1px solid #e05252',
            borderRadius: 8, padding: '12px 16px',
            color: '#e05252', fontSize: '0.88rem',
          }}>
            {apiError}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 40 }}>
          <Link to={`/`}>
            <button style={{
              background: 'transparent', border: '1px solid #2a2d3a',
              color: '#6b7080', padding: '11px 24px',
              borderRadius: 8, cursor: 'pointer', fontSize: '0.95rem',
            }}>
              Cancel
            </button>
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: submitting ? '#8a6000' : '#f0a500',
              color: '#0f1117', border: 'none',
              padding: '11px 32px', borderRadius: 8,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '0.95rem',
              transition: 'background 0.15s',
            }}
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  )
}
