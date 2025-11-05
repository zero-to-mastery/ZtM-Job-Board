// src/components/Register.tsx
import React, { useState, useMemo } from 'react';

type RegisterProps = {
  onRegister: (role: 'student' | 'recruiter' | 'admin', profileCompleted?: boolean) => void;
  onToggleLogin: () => void;
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

type Role = 'student' | 'recruiter';

const Register: React.FC<RegisterProps> = ({ onRegister, onToggleLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const passwordValid = useMemo(() => password.length >= 8, [password]);
  const passwordsMatch = useMemo(() => password === confirm, [password, confirm]);
  const formValid = Boolean(fullName.trim()) && emailValid && passwordValid && passwordsMatch && !!role;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formValid) {
      setTouched({ fullName: true, email: true, password: true, confirm: true, role: true });
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      let data: any = null;
      try { data = await resp.json(); } catch { data = null; }

      if (!resp.ok) {
        const msg = data?.message || `Registration failed (${resp.status})`;
        setErrorMsg(msg);
      } else {
        setSuccessMsg('Account created successfully!');
        // store token/user so App can decide next step
        if (data?.token) { try { localStorage.setItem('token', data.token); } catch {} }
        if (data?.user)  { try { localStorage.setItem('user', JSON.stringify(data.user)); } catch {} }

        // Clear fields
        setFullName(''); setEmail(''); setPassword(''); setConfirm(''); setRole(''); setTouched({});

        const r = (data?.user?.role || role) as 'student' | 'recruiter' | 'admin';
        const profileCompleted = !!data?.user?.profileCompleted;
        onRegister(r, profileCompleted);
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .auth-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #2296f3 0%, #87cefa 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 1rem;
          gap: .75rem;
        }
        .auth-form {
          background: #fff;
          color: #0a2a43;
          border-radius: 14px;
          padding: 2rem 2.5rem;
          box-shadow: 0 14px 34px rgba(34, 150, 243, 0.3);
          width: 100%;
          max-width: 420px;
          animation: fadeIn 0.6s ease;
        }
        .auth-form h2 { margin-bottom: 1.5rem; font-weight: 800; text-align: center; color: #2296f3; }
        .auth-form label { display:block; margin-bottom:6px; font-weight:600; font-size:.95rem; color:#1764c0; }
        .auth-form input, .auth-form select {
          width:100%; padding:.9rem 1rem; margin-bottom:1.2rem; border:2px solid #2296f3; border-radius:10px;
          font-size:1rem; outline:none; transition:border-color .3s, box-shadow .3s;
        }
        .auth-form input:focus, .auth-form select:focus { border-color:#1764c0; box-shadow:0 0 0 4px rgba(23,100,192,.15); }
        .auth-form .error { font-size:.85rem; color:#b3002d; margin:-.8rem 0 .8rem 0; }
        .auth-form .success { font-size:.95rem; color:#1b662b; margin:-.2rem 0 .9rem 0; }
        .auth-form button {
          width:100%; padding:.9rem 1rem; background:#2296f3; color:#fff; font-weight:700; font-size:1.1rem; border:none; border-radius:40px;
          cursor:pointer; box-shadow:0 10px 20px rgba(34,150,243,.4); transition: background .3s, transform .2s;
        }
        .auth-form button:hover { background:#1764c0; transform:translateY(-2px); box-shadow:0 12px 28px rgba(23,100,192,.5); }
        .auth-form button:disabled { background:#a3cfff; cursor:not-allowed; transform:none; box-shadow:none; }
        .toggle-login { margin-top: .25rem; font-size:.95rem; color:#eef6ff; text-align:center; cursor:pointer; }
        .toggle-login:hover { text-decoration: underline; }
        @keyframes fadeIn { from{opacity:0; transform:translateY(15px);} to{opacity:1; transform:translateY(0);} }
        @media (max-width:480px){ .auth-form{ padding:1.5rem 1.8rem;} .auth-form h2{ font-size:1.6rem;} .auth-form button{ font-size:1rem; } }
      `}</style>

      <div className="auth-container" role="main" aria-label="Register page">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2>Create Account</h2>

          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" name="fullName" type="text" placeholder="John Doe" required
            value={fullName} onChange={e => setFullName(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, fullName: true }))} aria-invalid={touched.fullName && !fullName.trim()} aria-describedby="fullNameError" />
          {touched.fullName && !fullName.trim() && (<div id="fullNameError" className="error">Full Name is required.</div>)}

          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="you@example.com" required
            value={email} onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))} aria-invalid={touched.email && !emailValid} aria-describedby="emailError" />
          {touched.email && !emailValid && (<div id="emailError" className="error">Please enter a valid email.</div>)}

          <label htmlFor="role">Account Type</label>
          <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value as Role | '')}
            onBlur={() => setTouched(t => ({ ...t, role: true }))} aria-invalid={touched.role && !role} aria-describedby="roleError" required>
            <option value="">Select...</option>
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
          </select>
          {touched.role && !role && (<div id="roleError" className="error">Please choose Student or Recruiter.</div>)}

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" placeholder="At least 8 characters" required
            value={password} onChange={e => setPassword(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, password: true }))} aria-invalid={touched.password && !passwordValid} aria-describedby="passwordError" />
          {touched.password && !passwordValid && (<div id="passwordError" className="error">Password must be at least 8 characters.</div>)}

          <label htmlFor="confirm">Confirm Password</label>
          <input id="confirm" name="confirm" type="password" placeholder="Re-enter your password" required
            value={confirm} onChange={e => setConfirm(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, confirm: true }))} aria-invalid={touched.confirm && !passwordsMatch} aria-describedby="confirmError" />
          {touched.confirm && !passwordsMatch && (<div id="confirmError" className="error">Passwords do not match.</div>)}

          <button type="submit" aria-label="Register button" disabled={!formValid || loading} aria-busy={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <div role="status" aria-live="polite" style={{ minHeight: '1.1rem' }}>
            {errorMsg && <div className="error" style={{ marginTop: '.8rem' }}>{errorMsg}</div>}
            {successMsg && <div className="success" style={{ marginTop: '.8rem' }}>{successMsg}</div>}
          </div>

          {/* Keep the toggle under the card */}
          <button
            type="button"
            className="toggle-login"
            onClick={onToggleLogin}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleLogin(); } }}
            aria-label="Already have an account? Login here."
            style={{
  background: 'transparent',
  border: 'none',
  color: '#2296f3',        // 👈 bright blue text
  fontWeight: 700,
  marginTop: '0.75rem',
  cursor: 'pointer',
  textAlign: 'center',
}}
          >
            Already have an account? Login here.
          </button>
        </form>
      </div>
    </>
  );
};

export default Register;
