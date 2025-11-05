/* eslint-disable */
import React from 'react'

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000'

const btnStyle: React.CSSProperties = {
  position: 'fixed',
  right: 16,
  bottom: 16,
  background: '#10b981',
  color: '#fff',
  border: 'none',
  padding: '0.75rem 1rem',
  borderRadius: 999,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 10px 20px rgba(16,185,129,.35)',
  zIndex: 60,
}

const modalBackdrop: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 70
}
const modalPanel: React.CSSProperties = {
  width: 'min(560px, 92vw)', background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,.2)', padding: 16
}
const input: React.CSSProperties = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', fontSize: 14
}
const label: React.CSSProperties = { fontSize: 12, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .4 }

const FeedbackForm: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [rating, setRating] = React.useState<number | ''>('')
  const [category, setCategory] = React.useState('general')
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const user = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return alert('Please enter your feedback.')
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token') || ''
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          rating: rating === '' ? undefined : Number(rating),
          category,
          // only sent/used if user not logged in:
          name: user ? undefined : name,
          email: user ? undefined : email,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Failed to send feedback')
      alert('Thanks for your feedback! 🙌')
      setOpen(false)
      setMessage('')
      setRating('')
      setCategory('general')
      setName('')
      setEmail('')
    } catch (err: any) {
      alert(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button style={btnStyle} onClick={() => setOpen(true)} aria-label="Give feedback" title="Give feedback">
        Feedback
      </button>

      {open && (
        <div style={modalBackdrop} onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <div style={modalPanel} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Send Feedback</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={onSubmit}>
              {!user && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={label}>Name (optional)</div>
                    <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <div style={label}>Email (optional)</div>
                    <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={label}>Category</div>
                  <select style={input as any} value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="general">General</option>
                    <option value="bug">Bug</option>
                    <option value="idea">Idea</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <div style={label}>Rating</div>
                  <select style={input as any} value={rating} onChange={(e) => setRating(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">—</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={label}>Message</div>
                <textarea
                  style={{ ...input, minHeight: 120, resize: 'vertical' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think…"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" onClick={() => setOpen(false)} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 12px', border: 'none', borderRadius: 10, background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: submitting ? .7 : 1 }}
                >
                  {submitting ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default FeedbackForm
