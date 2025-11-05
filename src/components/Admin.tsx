/* eslint-disable */
import React from 'react';

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

type Role = 'student' | 'recruiter' | 'admin';
type U = {
  _id: string;
  fullName?: string;
  email: string;
  role: Role;
  profileCompleted?: boolean;
  createdAt?: string;
  profile?: {
    skills?: string[];
    location?: { city?: string; state?: string; country?: string };
  };
};

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={styles.statCard}>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statValue}>{value}</div>
  </div>
);

const Pill: React.FC<{ text: string; kind?: 'ok' | 'warn' | 'muted' }> = ({ text, kind = 'muted' }) => {
  const palette =
    kind === 'ok'
      ? { bg: '#dcfce7', fg: '#166534' }
      : kind === 'warn'
      ? { bg: '#fee2e2', fg: '#991b1b' }
      : { bg: '#f3f4f6', fg: '#374151' };
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        background: palette.bg,
        color: palette.fg,
      }}
    >
      {text}
    </span>
  );
};

const SkeletonRow: React.FC = () => (
  <tr>
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} style={styles.td}>
        <div style={styles.skel} />
      </td>
    ))}
  </tr>
);

const Admin: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState<U[]>([]);
  const [err, setErr] = React.useState<string>('');
  const [q, setQ] = React.useState('');
  const [role, setRole] = React.useState<'all' | Role>('all');
  const [onlyCompleted, setOnlyCompleted] = React.useState(false);

  const [feedback, setFeedback] = React.useState<any[]>([]);
  const [fbErr, setFbErr] = React.useState<string>('');
  const [avgRating, setAvgRating] = React.useState<number | null>(null);
  const [byCategory, setByCategory] = React.useState<Record<string, number>>({});

  // Sign out
  const handleSignOut = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('admin_token');
    } catch {}
    window.location.href = '/';
  };

  // Fetch feedback
  React.useEffect(() => {
    const token = localStorage.getItem('token') || '';
    const loadFeedback = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/feedback?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'Failed to load feedback');

        const items = data.items || [];
        setFeedback(items);

        const ratings = items.map((f: any) => f.rating).filter((r: any) => typeof r === 'number');
        setAvgRating(ratings.length ? Number((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)) : null);

        const catCount: Record<string, number> = {};
        items.forEach((f: any) => {
          const c = f.category || 'general';
          catCount[c] = (catCount[c] || 0) + 1;
        });
        setByCategory(catCount);
      } catch (e: any) {
        setFbErr(e.message || 'Error loading feedback');
      }
    };
    loadFeedback();
  }, []);

  // Fetch users
  React.useEffect(() => {
    const token = localStorage.getItem('token') || '';
    const run = async () => {
      try {
        const chk = await fetch(`${API_BASE}/api/admin/health`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!chk.ok) {
          const m = (await chk.json().catch(() => ({})))?.message || `${chk.status} Not allowed`;
          throw new Error(m);
        }
        const res = await fetch(`${API_BASE}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'Failed to load users');
        setUsers((data.users || []) as U[]);
      } catch (e: any) {
        setErr(e?.message || 'Error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const total = users.length;
  const byRole = users.reduce((acc: Record<Role, number>, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as any);
  const completed = users.filter((u) => !!u.profileCompleted).length;
  const withSkills = users.filter((u) => (u.profile?.skills || []).length > 0).length;

  const filtered = users
    .filter((u) => (role === 'all' ? true : u.role === role))
    .filter((u) => (onlyCompleted ? !!u.profileCompleted : true))
    .filter((u) => {
      const t = q.trim().toLowerCase();
      if (!t) return true;
      const hay =
        `${u.fullName || ''} ${u.email || ''} ${u.role || ''} ${(u.profile?.skills || []).join(' ')}`.toLowerCase();
      return hay.includes(t);
    });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.hEyebrow}>Admin</div>
          <h1 style={styles.hTitle}>Dashboard</h1>
        </div>
        <button
          onClick={handleSignOut}
          style={styles.signoutBtn}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1764c0')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2296f3')}
        >
          Sign Out
        </button>
      </header>

      {err ? (
        <div style={styles.errorBox}>
          <strong>Couldn’t load dashboard.</strong>
          <div style={{ opacity: 0.8 }}>{err}</div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <section style={styles.statsGrid}>
            <Stat label="Total Users" value={loading ? '—' : total} />
            <Stat label="Students" value={loading ? '—' : byRole.student || 0} />
            <Stat label="Recruiters" value={loading ? '—' : byRole.recruiter || 0} />
            <Stat label="Admins" value={loading ? '—' : byRole.admin || 0} />
            <Stat label="Profiles Completed" value={loading ? '—' : `${completed}/${total}`} />
            <Stat label="With Skills" value={loading ? '—' : withSkills} />
          </section>

          {/* Controls */}
          <section style={styles.controls}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={styles.inputWrap}>
                <svg viewBox="0 0 24 24" width="18" height="18" style={{ opacity: 0.6 }}>
                  <path d="M9.5 3a6.5 6.5 0 014.9 10.7l4.2 4.2-1.4 1.4-4.2-4.2A6.5 6.5 0 119.5 3m0 2a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, email, skill…"
                  style={styles.input}
                />
              </div>

              <select value={role} onChange={(e) => setRole(e.target.value as any)} style={styles.select}>
                <option value="all">All roles</option>
                <option value="student">Students</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Admins</option>
              </select>

              <label style={styles.toggle}>
                <input
                  type="checkbox"
                  checked={onlyCompleted}
                  onChange={(e) => setOnlyCompleted(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Show completed profiles only
              </label>
            </div>
          </section>

          {/* Users Table */}
          <section style={styles.tableWrap}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Completed</th>
                  <th style={styles.th}>Skills</th>
                  <th style={styles.th}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((u) => (
                      <tr key={u._id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={styles.avatar}>
                              {(u.fullName || u.email || '?').slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{u.fullName || '—'}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>
                                {u.profile?.location
                                  ? [u.profile.location.city, u.profile.location.state, u.profile.location.country]
                                      .filter(Boolean)
                                      .join(', ')
                                  : '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <a href={`mailto:${u.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                            {u.email}
                          </a>
                        </td>
                        <td style={styles.td}>
                          {u.role === 'admin' ? (
                            <Pill text="Admin" />
                          ) : u.role === 'recruiter' ? (
                            <Pill text="Recruiter" />
                          ) : (
                            <Pill text="Student" />
                          )}
                        </td>
                        <td style={styles.td}>
                          {u.profileCompleted ? <Pill text="Yes" kind="ok" /> : <Pill text="No" kind="warn" />}
                        </td>
                        <td style={styles.td}>{(u.profile?.skills || []).length}</td>
                        <td style={styles.td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#6b7280' }}>
                      No users match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Feedback Section */}
          <section style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Recent Feedback</h2>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Avg rating: <strong>{avgRating ?? '—'}</strong> &nbsp;|&nbsp;
                {Object.keys(byCategory).map((k, i) => (
                  <span key={k}>
                    {i > 0 && ' · '} {k}: {byCategory[k]}
                  </span>
                ))}
              </div>
            </div>

            {fbErr ? (
              <div style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', padding: 12, borderRadius: 10 }}>
                {fbErr}
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f9fafb' }}>
                    <tr>
                      <th style={styles.th}>When</th>
                      <th style={styles.th}>User</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Rating</th>
                      <th style={styles.th}>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#6b7280' }}>
                          No feedback yet.
                        </td>
                      </tr>
                    ) : (
                      feedback.map((f: any) => (
                        <tr key={f._id}>
                          <td style={styles.td}>{f.createdAt ? new Date(f.createdAt).toLocaleString() : '—'}</td>
                          <td style={styles.td}>
                            {f.userId ? 'Registered user' : f.name || 'Anonymous'}
                            {f.email ? (
                              <>
                                {' '}
                                ·{' '}
                                <a href={`mailto:${f.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                  {f.email}
                                </a>
                              </>
                            ) : null}
                          </td>
                          <td style={styles.td}>{f.role || '—'}</td>
                          <td style={styles.td}>{f.category || 'general'}</td>
                          <td style={styles.td}>{typeof f.rating === 'number' ? `★ ${f.rating}` : '—'}</td>
                          <td style={{ ...styles.td, maxWidth: 560 }}>
                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{f.message}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

/* ---------- styles ---------- */
const styles: Record<string, React.CSSProperties> = {
  page: { padding: 16, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  hEyebrow: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: '#6b7280' },
  hTitle: { fontSize: 28, fontWeight: 800, margin: 0 },

  signoutBtn: {
    background: '#2296f3',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '25px',
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 6px 16px rgba(34,150,243,0.35)',
  },

  statsGrid: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    marginBottom: 16,
  },
  statCard: {
    padding: 16,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,.03)',
  },
  statLabel: { fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.4 },
  statValue: { fontSize: 26, fontWeight: 800 },

  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '8px 10px',
    background: '#fff',
  },
  input: { border: 'none', outline: 'none', fontSize: 14, minWidth: 220 },
  select: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '8px 10px',
    background: '#fff',
    fontSize: 14,
  },
  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '8px 10px',
    background: '#fff',
    fontSize: 14,
  },

  tableWrap: {
    overflowX: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    background: '#fff',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { position: 'sticky' as any, top: 0, background: '#f9fafb', zIndex: 1 },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky' as any,
    top: 0,
    background: '#f9fafb',
  },
  tr: {},
  td: { padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 14 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    background: '#f3f4f6',
    color: '#374151',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },

  errorBox: {
    border: '1px solid #fecaca',
    background: '#fef2f2',
    color: '#991b1b',
    padding: 16,
    borderRadius: 12,
  },
  skel: {
    height: 12,
    width: '70%',
    background: 'linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.2s infinite',
    borderRadius: 6,
  },
};

/* keyframes for skeleton */
const styleEl = document.createElement('style');
styleEl.innerHTML = `
@keyframes shimmer { 
  0% { background-position: 0% 0% } 
  100% { background-position: 200% 0% } 
}
`;
if (typeof document !== 'undefined') document.head.appendChild(styleEl);

export default Admin;
