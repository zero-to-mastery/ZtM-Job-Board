// src/components/Login.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
type LoginProps = {
  onLogin: (isAdmin?: boolean) => void;
  onToggleRegister: () => void;
  onBack?: () => void; // NEW: go back to landing
};

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
declare global {
  interface Window { google?: any; }
}

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
const GOOGLE_CLIENT_ID = '287351753657-jcrib040ool4hs0bbi05s3ui41j123tv.apps.googleusercontent.com';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

type Role = 'student' | 'recruiter' | 'admin';
type ApiUser = { _id: string; email: string; fullName?: string; role: Role; profileCompleted?: boolean };

<<<<<<< Updated upstream
=======
=======

const GOOGLE_CLIENT_ID = '287351753657-jcrib040ool4hs0bbi05s3ui41j123tv.apps.googleusercontent.com';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';


type Role = 'student' | 'recruiter' | 'admin';
type ApiUser = { _id: string; email: string; fullName?: string; role: Role; profileCompleted?: boolean };


>>>>>>> Stashed changes
>>>>>>> Stashed changes
function parseJwt<T = any>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
const Login: React.FC<LoginProps> = ({ onLogin, onToggleRegister, onBack }) => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [asAdmin, setAsAdmin] = useState(false); // visual only
  const [desiredRole, setDesiredRole] = useState<'student' | 'recruiter' | ''>('');
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
  const looksLikeEmail = useMemo(() => emailOrUser.includes('@'), [emailOrUser]);
  const emailValid = useMemo(() => (looksLikeEmail ? emailOrUser.trim().includes('@') : true), [emailOrUser, looksLikeEmail]);
  const passwordValid = useMemo(() => password.length >= 8, [password]);
  const formValid = (looksLikeEmail ? emailValid : true) && passwordValid;

<<<<<<< Updated upstream
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

=======
<<<<<<< Updated upstream
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

=======

  const googleBtnRef = useRef<HTMLDivElement | null>(null);


>>>>>>> Stashed changes
>>>>>>> Stashed changes
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      initGoogle();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = initGoogle;
    document.head.appendChild(s);

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
    function initGoogle() {
      if (!window.google || !googleBtnRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp: any) => {
            try {
              const r = await fetch(`${API_BASE}/api/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: resp.credential, desiredRole }),
              });
              if (r.ok) {
                const data: { token?: string; user?: ApiUser } | null = await r.json().catch(() => null);
                if (data?.token) try { localStorage.setItem('token', data.token); } catch {}
                if (data?.user)  try { localStorage.setItem('user', JSON.stringify(data.user)); } catch {}
                onLogin(data?.user?.role === 'admin');
                return;
              }
            } catch {}
            try { localStorage.setItem('googleUser', JSON.stringify(parseJwt(resp.credential))); } catch {}
            onLogin(false);
          },
        });

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          type: 'standard',
          text: 'signin_with',
          logo_alignment: 'left',
        });
      } catch {}
    }
  }, [onLogin, desiredRole]);

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError(null);

<<<<<<< Updated upstream
    if (!formValid) return;

=======
<<<<<<< Updated upstream
    if (!formValid) return;

=======

    if (!formValid) return;


>>>>>>> Stashed changes
>>>>>>> Stashed changes
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUser, password, desiredRole }),
      });

<<<<<<< Updated upstream
      const data: { token?: string; user?: ApiUser; message?: string } | null = await resp.json().catch(() => null);

=======
<<<<<<< Updated upstream
      const data: { token?: string; user?: ApiUser; message?: string } | null = await resp.json().catch(() => null);

=======

      const data: { token?: string; user?: ApiUser; message?: string } | null = await resp.json().catch(() => null);


>>>>>>> Stashed changes
>>>>>>> Stashed changes
      if (!resp.ok) {
        setError(data?.message || `Login failed (${resp.status})`);
      } else {
        if (data?.token) { try { localStorage.setItem('token', data.token); } catch {} }
        if (data?.user)  { try { localStorage.setItem('user', JSON.stringify(data.user)); } catch {} }
        onLogin(data?.user?.role === 'admin');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
  function goBack() {
    if (onBack) {
      onBack();
    } else {
      // Fallback if parent didn't pass onBack
      if (window.history.length > 1) window.history.back();
      else window.location.assign('/'); // adjust if your landing route differs
    }
  }

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
  return (
    <>
      <style>{`
        :root { --primary:#2296f3; --primary-2:#5bb6ff; --ink:#0a1a2b; }
        .auth-container {
          min-height: 100vh; display: grid; place-items: center;
          background: linear-gradient(135deg, #2296f3 0%, #87cefa 100%);
          padding: 1rem; color: white;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial;
        }
        .auth-form {
          width: 100%; max-width: 440px; background: #ffffff; color: var(--ink);
          border-radius: 16px; padding: 2rem 2rem 1.25rem; box-shadow: 0 18px 44px rgba(9, 75, 130, 0.25);
          position: relative;
        }
        .auth-form h2 { margin: 0 0 1.1rem 0; font-weight: 900; text-align: center; color: var(--primary); letter-spacing: .2px; }
        .field { margin-bottom: 1rem; }
        .label { display:block; margin-bottom:6px; font-weight:700; color:#0e3c66; font-size:0.95rem; }
        .input {
          width: 100%; padding: 1rem 1.1rem; border: 2px solid var(--primary); border-radius: 10px;
          font-size: 1rem; line-height: 1.5; color: var(--ink); outline: none; transition: box-shadow .2s, border-color .2s; background: #fff; box-sizing: border-box;
        }
        .input:focus { border-color: #1764c0; box-shadow: 0 0 0 4px rgba(23, 100, 192, 0.12); }
        .hint { font-size: .85rem; color: #2b73bf; margin-top: 6px; }
        .error { font-size: .82rem; color: #b3002d; margin-top: 6px; }
        .or { margin: 1rem 0 1rem; display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center; color: #7aaee6; font-weight: 700; }
        .or::before, .or::after { content: ''; height: 2px; background: linear-gradient(90deg, #e9f4ff, #cfe8ff); display: block; border-radius: 999px; }
        .admin-row { display:flex; align-items:center; gap:12px; margin:10px 0 14px; margin-left:2rem; user-select:none; cursor:pointer; }
        .checkbox-wrapper { position: relative; width: 20px; height: 20px; }
        .checkbox { appearance: none; width:20px; height:20px; border:2px solid var(--primary); border-radius:6px; transition: all .2s; position: relative; cursor: pointer; background: #fff; }
        .checkbox:checked { background: var(--primary); border-color: var(--primary); }
        .checkbox:checked::after { content:''; position:absolute; top:2px; left:6px; width:5px; height:10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
        .checkbox-label { font-size:1rem; font-weight:700; color:#1764c0; letter-spacing:.2px; }
        .submit {
          width: 100%; padding: 0.9rem 1rem; background: var(--primary); color: #fff; border: none; border-radius: 40px;
          font-weight: 900; font-size: 1.05rem; cursor: pointer; box-shadow: 0 14px 28px rgba(34,150,243,.35);
          transition: transform .2s, background .2s, box-shadow .2s;
        }
        .submit:hover { transform: translateY(-1px); background: #1764c0; box-shadow: 0 16px 32px rgba(23,100,192,.45); }
        .submit:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }
        .toggle-register { margin-top: 1rem; font-size: 0.95rem; color: #1676e3ff; cursor: pointer; text-align: center; user-select: none; }
        .toggle-register:hover { text-decoration: underline; }
        .google-wrap { display: grid; place-items: center; margin-top: .25rem; margin-bottom: .75rem; }

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
        /* NEW: back button */
        .back-btn {
          position: absolute; top: 10px; left: 10px;
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; border: 1px solid rgba(34,150,243,0.35);
          color: #1764c0; padding: 6px 10px; border-radius: 10px;
          font-weight: 800; cursor: pointer;
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
        }
        .back-btn:hover { transform: translateY(-1px); background: #eef6ff; border-color: #1764c0; }
        .back-btn:focus-visible { outline: 3px solid rgba(34,150,243,.4); outline-offset: 2px; }
        .back-btn__icon { font-size: 14px; line-height: 1; }
      `}</style>

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
      <div className="auth-container" role="main" aria-label="Login page">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* NEW: Back to landing */}
          <button
            type="button"
            className="back-btn"
            onClick={goBack}
            aria-label="Back to landing page"
          >
            <span className="back-btn__icon" aria-hidden>←</span>
            Back
          </button>

<<<<<<< Updated upstream
          <h2>Login</h2>

=======
<<<<<<< Updated upstream
          <h2>Login</h2>

=======

          <h2>Login</h2>


>>>>>>> Stashed changes
>>>>>>> Stashed changes
          <div className="field">
            <label className="label" htmlFor="emailOrUser">Email (or username)</label>
            <input id="emailOrUser" className="input" type="text" placeholder="you@example.com" required
              aria-label="Email or Username" aria-invalid={touched.email && looksLikeEmail && !emailValid}
              value={emailOrUser} onChange={(e) => setEmailOrUser(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} />
            {looksLikeEmail && (
              <div className={emailValid ? 'hint' : 'error'}>
                {emailValid ? 'Looks good.' : 'Please enter a valid email address (must include @).'}
              </div>
            )}
          </div>

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input id="password" className="input" type="password" placeholder="Minimum 8 characters" required
              aria-label="Password" aria-invalid={touched.password && !passwordValid}
              value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, password: true }))} />
            {touched.password && (
              <div className={passwordValid ? 'hint' : 'error'}>
                {passwordValid ? 'Strong enough.' : 'Password must be at least 8 characters.'}
              </div>
            )}
          </div>

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
          <div className="field">
            <label className="label" htmlFor="portal">Portal (optional)</label>
            <select id="portal" className="input" value={desiredRole}
              onChange={(e) => setDesiredRole(e.target.value as 'student' | 'recruiter' | '')} aria-label="Choose portal">
              <option value="">Select...</option>
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
            </select>
            <div className="hint">We’ll use your saved account role from the server.</div>
          </div>

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
          <label className="admin-row" htmlFor="asAdmin">
            <span className="checkbox-wrapper">
              <input id="asAdmin" type="checkbox" className="checkbox" checked={asAdmin} onChange={(e) => setAsAdmin(e.target.checked)} />
            </span>
            <span className="checkbox-label">ADMIN</span>
          </label>

<<<<<<< Updated upstream
          {error && <div style={{ color: '#b3002d', marginBottom: 10 }}>{error}</div>}

=======
<<<<<<< Updated upstream
          {error && <div style={{ color: '#b3002d', marginBottom: 10 }}>{error}</div>}

=======

          {error && <div style={{ color: '#b3002d', marginBottom: 10 }}>{error}</div>}


>>>>>>> Stashed changes
>>>>>>> Stashed changes
          <button type="submit" className="submit" disabled={!formValid || loading} aria-label="Login button">
            {loading ? 'Signing in...' : 'Login'}
          </button>

<<<<<<< Updated upstream
          <div className="or" aria-hidden>or</div>

=======
<<<<<<< Updated upstream
          <div className="or" aria-hidden>or</div>

=======

          <div className="or" aria-hidden>or</div>


>>>>>>> Stashed changes
>>>>>>> Stashed changes
          <div className="google-wrap">
            <div ref={googleBtnRef} aria-label="Google Sign-In Button" />
          </div>

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
>>>>>>> Stashed changes
          <button
            type="button"
            className="toggle-register"
            onClick={onToggleRegister}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleRegister(); } }}
            aria-label="Don't have an account? Register here."
            style={{ background: 'transparent', border: 'none' }}
          >
            Don&apos;t have an account? Register here.
          </button>
        </form>
      </div>
    </>
  );
};

<<<<<<< Updated upstream
export default Login;
=======
<<<<<<< Updated upstream
export default Login;
=======

export default Login;
>>>>>>> Stashed changes
>>>>>>> Stashed changes
