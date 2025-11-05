/* eslint-disable */
import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { createFilter } from 'react-search-input';
import { shuffle } from './util/shuffle';
// import Search from './components/Search';
import BatchCards from './components/BatchCards';
import Navbar from './components/Navbar';
import { pageNames } from './util/pageNames';
import useForceUpdate from './util/useForceUpdate';
import persons from './assets/persons.json';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import ProfileForm from './components/ProfileForm';
import FilterDropdown from './components/FilterDropdown';
import RequireRole from './components/RequireRole'
import Admin from './components/Admin'
import FeedbackForm from './components/FeedbackForm'


const SimpleMap = lazy(() => import('./components/Map'));

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const KEYS_TO_FILTERS = [
  'name',
  'jobTitle',
  'location.city',
  'location.state',
  'location.country',
];

type Role = 'student' | 'recruiter' | 'admin';
type StoredUser = { _id: string; email: string; fullName?: string; role: Role; profileCompleted?: boolean };

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}
function setStoredUser(u: StoredUser | null) {
  try {
    if (!u) localStorage.removeItem('user');
    else localStorage.setItem('user', JSON.stringify(u));
  } catch {}
}

function normalizeStr(v: any) {
  if (!v && v !== 0) return '';
  return String(v).trim();
}
const toLower = (v: any) => String(normalizeStr(v)).toLowerCase();

function getSortableName(p: any) {
  return (
    normalizeStr(p?.name) ||
    normalizeStr(p?.fullName) ||
    normalizeStr(p?.email) ||
    normalizeStr(p?.id)
  );
}
function getSortableDate(p: any) {
  const candidates = [p?.createdAt, p?.updatedAt, p?.date, p?.timestamp, p?.addedAt, p?.publishedAt].filter(Boolean);
  if (!candidates.length) return 0;
  const firstValid = candidates.find((d) => !Number.isNaN(Date.parse(d)));
  return firstValid ? Date.parse(firstValid) : 0;
}

// helpers to extract location safely
const getCountry = (p: any) => normalizeStr(p?.location?.country ?? p?.country ?? p?.location);
const getState   = (p: any) => normalizeStr(p?.location?.state   ?? p?.state);
const getCity    = (p: any) => normalizeStr(p?.location?.city    ?? p?.city);

function App() {
  const [step, setStep] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [searchfield, setSearchfield] = useState('');
  const [map, setMap] = useState(false);
  const [mapOrHomeTitle, setMapOrHomeTitle] = useState(pageNames.map);
  const [sortBy, setSortBy] = useState<string>('relevance');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<any[]>(() => {
    const seed = (persons as any[]) || [];
    try {
      const saved = JSON.parse(localStorage.getItem('userProfiles') || '[]');
      return [...saved, ...seed];
    } catch {
      return seed;
    }
  });

  // we’ll keep base/global sets for non-hierarchical filters (Role/Industry) + Countries
  const [baseFilters, setBaseFilters] = useState<Record<string, string[]>>({
    Country: [],
    Role: [],
    Industry: [],
  });

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isAdmin') === 'true';
    } catch {
      return false;
    }
  });

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const preload = () => import('./components/Map').catch(() => {});
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload, { timeout: 2000 });
    } else {
      const t = setTimeout(preload, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  // decide initial step based on stored user
  useEffect(() => {
    const u = getStoredUser();
    if (!u) return;
    if (u.role === 'admin') {
      localStorage.setItem('isAdmin', 'true');
      setIsAdminView(true);
      return;
    }
    if (u.role === 'student' && !u.profileCompleted) setStep(2);
    else setStep(3);
  }, []);

  // Load Submissions/*.json and build base filters
  useEffect(() => {
    try {
      const ctx = (require as any).context('../Submissions', false, /\.json$/);
      const subs = ctx.keys().map((k: string) => {
        const mod = ctx(k);
        return mod && mod.default ? mod.default : mod;
      });

      const existing = [...profiles];
      const existingKeys = new Set(existing.map((p) => normalizeStr(p.id || p.name || p.email).toLowerCase()));
      const toAdd = subs.filter((s: any) => {
        const key = normalizeStr(s.id || s.name || s.email).toLowerCase();
        return key && !existingKeys.has(key);
      });

      if (toAdd.length > 0) setProfiles((prev) => [...prev, ...toAdd]);

      const merged = [...existing, ...toAdd];

      const countries = new Set<string>();
      const roles = new Set<string>();
      const industries = new Set<string>();

      merged.forEach((p: any) => {
        const country = getCountry(p);
        const role = normalizeStr(p?.jobTitle ?? p?.role ?? p?.title);
        const industry = normalizeStr(p?.industry ?? '');

        if (country) countries.add(country);
        if (role) roles.add(role);
        if (industry) industries.add(industry);
      });

      setBaseFilters({
        Country: Array.from(countries).filter(Boolean).sort((a, b) => a.localeCompare(b)),
        Role: Array.from(roles).filter(Boolean).sort((a, b) => a.localeCompare(b)),
        Industry: Array.from(industries).filter(Boolean).sort((a, b) => a.localeCompare(b)),
      });
    } catch (e) {
      // silently ignore if no Submissions or require.context unsupported
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build a hierarchy index once from profiles (recomputed when profiles change)
  const hierarchy = useMemo(() => {
    const statesByCountry: Record<string, Set<string>> = {};
    const citiesByState: Record<string, Set<string>> = {};
    const citiesByCountry: Record<string, Set<string>> = {};

    profiles.forEach((p) => {
      const c = getCountry(p);
      const s = getState(p);
      const ci = getCity(p);

      if (c) {
        if (!statesByCountry[c]) statesByCountry[c] = new Set();
        if (!citiesByCountry[c]) citiesByCountry[c] = new Set();
      }
      if (c && s) statesByCountry[c].add(s);
      if (s) {
        if (!citiesByState[s]) citiesByState[s] = new Set();
      }
      if (c && ci) citiesByCountry[c].add(ci);
      if (s && ci) citiesByState[s].add(ci);
    });

    // convenience: get all states/cities globally if needed
    const allStates = new Set<string>();
    const allCities = new Set<string>();
    Object.values(statesByCountry).forEach((set) => set.forEach((v) => allStates.add(v)));
    Object.values(citiesByState).forEach((set) => set.forEach((v) => allCities.add(v)));

    return { statesByCountry, citiesByState, citiesByCountry, allStates, allCities };
  }, [profiles]);

  // Derive cascading options based on selection
  const availableFiltersDynamic = useMemo(() => {
    const selectedCountries = selectedFilters?.Country || [];
    const selectedStates = selectedFilters?.State || [];

    // Country is always from baseFilters
    const Country = baseFilters.Country || [];

    // Role/Industry are flat
    const Role = baseFilters.Role || [];
    const Industry = baseFilters.Industry || [];

    // State options
    let State: string[] = [];
    if (selectedCountries.length > 0) {
      const set = new Set<string>();
      selectedCountries.forEach((c) => {
        const st = hierarchy.statesByCountry[c];
        if (st) st.forEach((v) => set.add(v));
      });
      State = Array.from(set).sort((a, b) => a.localeCompare(b));
    } else {
      State = [];
    }

    // City options
    let City: string[] = [];
    if (selectedStates.length > 0) {
      const set = new Set<string>();
      selectedStates.forEach((s) => {
        const ci = hierarchy.citiesByState[s];
        if (ci) ci.forEach((v) => set.add(v));
      });
      City = Array.from(set).sort((a, b) => a.localeCompare(b));
    } else if (selectedCountries.length > 0) {
      const set = new Set<string>();
      selectedCountries.forEach((c) => {
        const ci = hierarchy.citiesByCountry[c];
        if (ci) ci.forEach((v) => set.add(v));
      });
      City = Array.from(set).sort((a, b) => a.localeCompare(b));
    } else {
      City = [];
    }

    return { Country, State, City, Role, Industry };
  }, [baseFilters, selectedFilters, hierarchy]);

  const filteredForDisplay = (searchFilter: string) => {
    try {
      const textFiltered = profiles.filter(createFilter(searchFilter, KEYS_TO_FILTERS));

      const withStructuredFilters = (() => {
        if (!selectedFilters || Object.keys(selectedFilters).length === 0) return textFiltered;
        const activeCats = Object.entries(selectedFilters).filter(([, vals]) => vals && vals.length > 0);
        if (activeCats.length === 0) return textFiltered;

        return textFiltered.filter((p: any) => {
          for (const [cat, vals] of activeCats) {
            if (!vals || vals.length === 0) continue;
            const lowerVals = vals.map((v) => v.toLowerCase());
            let profileVal = '';
            if (cat === 'Country') profileVal = getCountry(p);
            else if (cat === 'State') profileVal = getState(p);
            else if (cat === 'City')  profileVal = getCity(p);
            else if (cat === 'Role') profileVal = normalizeStr(p?.jobTitle ?? p?.role ?? p?.title);
            else if (cat === 'Industry') profileVal = normalizeStr(p?.industry ?? '');
            if (!lowerVals.includes(String(profileVal).toLowerCase())) return false;
          }
          return true;
        });
      })();

      const sorted = [...withStructuredFilters];
      switch (sortBy) {
        case 'az':
          sorted.sort((a, b) => toLower(getSortableName(a)).localeCompare(toLower(getSortableName(b))));
          break;
        case 'za':
          sorted.sort((a, b) => toLower(getSortableName(b)).localeCompare(toLower(getSortableName(a))));
          break;
        case 'newest':
          sorted.sort((a, b) => getSortableDate(b) - getSortableDate(a));
          break;
        case 'oldest':
          sorted.sort((a, b) => getSortableDate(a) - getSortableDate(b));
          break;
        default:
          break; // relevance (keep textFiltered order)
      }
      return sorted;
    } catch {
      const q = (searchFilter || '').toLowerCase();
      const txtFiltered = profiles.filter((p: any) =>
        (`${p.name || ''} ${p.jobTitle || ''} ${JSON.stringify(p.location || {})}`).toLowerCase().includes(q)
      );

      const activeCats = Object.entries(selectedFilters || {}).filter(([, vals]) => vals && vals.length > 0);
      const base = activeCats.length
        ? txtFiltered.filter((p: any) => {
            for (const [cat, vals] of activeCats) {
              if (!vals || vals.length === 0) continue;
              const lowerVals = vals.map((v) => v.toLowerCase());
              let profileVal = '';
              if (cat === 'Country') profileVal = getCountry(p);
              else if (cat === 'State') profileVal = getState(p);
              else if (cat === 'City')  profileVal = getCity(p);
              else if (cat === 'Role') profileVal = normalizeStr(p?.jobTitle ?? p?.role ?? p?.title);
              else if (cat === 'Industry') profileVal = normalizeStr(p?.industry ?? '');
              if (!lowerVals.includes(String(profileVal).toLowerCase())) return false;
            }
            return true;
          })
        : txtFiltered;

      const sorted = [...base];
      switch (sortBy) {
        case 'az':
          sorted.sort((a, b) => toLower(getSortableName(a)).localeCompare(toLower(getSortableName(b))));
          break;
        case 'za':
          sorted.sort((a, b) => toLower(getSortableName(b)).localeCompare(toLower(getSortableName(a))));
          break;
        case 'newest':
          sorted.sort((a, b) => getSortableDate(b) - getSortableDate(a));
          break;
        case 'oldest':
          sorted.sort((a, b) => getSortableDate(a) - getSortableDate(b));
          break;
        default:
          break;
      }
      return sorted;
    }
  };

  function goBack() {
    setMap(!map);
    setMapOrHomeTitle(map ? pageNames.map : pageNames.home);
    setSearchfield('');
  }
  function shufflePeopleOnClick() {
    shuffle(profiles);
    forceUpdate();
  }

  const toggleFilter = (category: string, value: string) => {
    setSelectedFilters((prev) => {
      const cur = prev[category] || [];
      const exists = cur.includes(value);
      const next = exists ? cur.filter((v) => v !== value) : [...cur, value];

      // cascading cleanup
      const updated = { ...prev, [category]: next };

      if (category === 'Country') {
        const allowedStates = new Set<string>();
        next.forEach((c) => {
          const st = hierarchy.statesByCountry[c];
          if (st) st.forEach((s) => allowedStates.add(s));
        });
        const keptStates = (updated.State || []).filter((s: string) => allowedStates.has(s));
        updated.State = keptStates;

        const allowedCities = new Set<string>();
        if (keptStates.length > 0) {
          keptStates.forEach((s) => {
            const ci = hierarchy.citiesByState[s];
            if (ci) ci.forEach((v) => allowedCities.add(v));
          });
        } else {
          next.forEach((c) => {
            const ci = hierarchy.citiesByCountry[c];
            if (ci) ci.forEach((v) => allowedCities.add(v));
          });
        }
        const keptCities = (updated.City || []).filter((c: string) => allowedCities.has(c));
        updated.City = keptCities;
      }

      if (category === 'State') {
        const allowedCities = new Set<string>();
        next.forEach((s) => {
          const ci = hierarchy.citiesByState[s];
          if (ci) ci.forEach((v) => allowedCities.add(v));
        });
        if (next.length === 0) {
          const selCountries = updated.Country || [];
          selCountries.forEach((c) => {
            const ci = hierarchy.citiesByCountry[c];
            if (ci) ci.forEach((v) => allowedCities.add(v));
          });
        }
        const keptCities = (updated.City || []).filter((c: string) => allowedCities.has(c));
        updated.City = keptCities;
      }

      return updated;
    });
  };

  const clearFilter = (category?: string) => {
    if (!category) {
      setSelectedFilters({});
    } else {
      setSelectedFilters((prev) => ({ ...prev, [category]: [] }));
      if (category === 'Country') {
        setSelectedFilters((prev) => ({ ...prev, Country: [], State: [], City: [] }));
      }
      if (category === 'State') {
        setSelectedFilters((prev) => ({ ...prev, State: [], City: [] }));
      }
    }
  };

  async function saveProfileToServer(profile: any) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated. Please log in again.');
    let resp = await fetch(`${API_BASE}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(profile),
    });
    if (resp.status === 409) {
      resp = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
    }
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data?.message || `Failed to save profile (${resp.status})`);
    }
    const u = getStoredUser();
    if (u) setStoredUser({ ...u, profileCompleted: true });
  }

  // 🔐 ADMIN VIEW (no route changes, uses your existing Admin + RequireRole)
  if (isAdminView) {
    return (
      <RequireRole role="admin">
        <Admin />
      </RequireRole>
    );
  }

  // AUTH / LANDING FLOW
  if (step === 0) {
    return (
      <Landing
        onContinue={() => setStep(1)}
        onLogin={() => setStep(1)}
        onRegister={() => { setShowRegister(true); setStep(1); }}
        onHire={() => setStep(3)}
      />
    );
  }

  if (step === 1) {
    const handleLogin = (isAdmin?: boolean) => {
      // keep your demo flag
      if (isAdmin) {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('admin_token', 'local-demo-token');
        setIsAdminView(true);
        return;
      }
      // real role from stored user (after /api/login)
      const u = getStoredUser();
      if (u?.role === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        setIsAdminView(true);
        return;
      }
      if (u?.role === 'student' && !u.profileCompleted) setStep(2);
      else setStep(3);
    };
    const handleRegister = (role: Role, profileCompleted?: boolean) => {
      if (role === 'student' && !profileCompleted) setStep(2);
      else setStep(3);
    };

    return showRegister ? (
      <Register onRegister={handleRegister} onToggleLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={handleLogin} onToggleRegister={() => setShowRegister(true)} />
    );
  }

  if (step === 2) {
    return (
      <>
        {profileError && <div style={{ color: '#b3002d', textAlign: 'center', marginTop: 8 }}>{profileError}</div>}
        {savingProfile && <div style={{ textAlign: 'center', marginTop: 8, color: '#1764c0' }}>Saving profile…</div>}
        <ProfileForm
          onSubmit={async (profile) => {
            setProfileError(null);
            setSavingProfile(true);
            try {
              const token = localStorage.getItem('token');
              if (!token) throw new Error('Not authenticated. Please log in again.');
              let resp = await fetch(`${API_BASE}/api/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(profile),
              });
              if (resp.status === 409) {
                resp = await fetch(`${API_BASE}/api/profile`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify(profile),
                });
              }
              if (!resp.ok) {
                const data = await resp.json().catch(() => ({}));
                throw new Error(data?.message || `Failed to save profile (${resp.status})`);
              }
              const stored = JSON.parse(localStorage.getItem('user') || '{}');
              localStorage.setItem('user', JSON.stringify({ ...stored, profileCompleted: true }));
              try {
                const prev = JSON.parse(localStorage.getItem('userProfiles') || '[]');
                const next = [profile, ...prev];
                localStorage.setItem('userProfiles', JSON.stringify(next));
              } catch {}
              setProfiles((prev) => [profile, ...prev]);
              setStep(3);
            } catch (e: any) {
              setProfileError(e.message || 'Failed to save profile.');
            } finally {
              setSavingProfile(false);
            }
          }}
        />
      </>
    );
  }

  // MAIN DIRECTORY VIEW
  return (
    <div className="flex flex-column min-vh-100 tc">
      <header
        className="custom--unselectable top-0 w-100 white custom--bg-additional3 custom--shadow-4 z-9999"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Navbar
          onLogoClick={goBack}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchfield(e.target.value)}
          onMapClick={goBack}
          mapOrHomeTitle={mapOrHomeTitle}
          shufflePeopleOnClick={shufflePeopleOnClick}
        />
        <button
          onClick={() => {
            try {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('isAdmin');
              localStorage.removeItem('admin_token');
            } catch {}
            setIsAdminView(false);
            setStep(0);
            setShowRegister(false);
            setMap(false);
            setMapOrHomeTitle(pageNames.map);
            setSearchfield('');
          }}
          style={{
            background: '#2296f3',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 6px 16px rgba(34,150,243,0.35)',
            marginRight: '1rem',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1764c0')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2296f3')}
          aria-label="Sign out"
          title="Sign out"
        >
          Sign Out
        </button>
      </header>

      <main className="flex-auto">
        {map ? (
          <Suspense
            fallback={
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner" />
                <style>
                  {`
                    .spinner {
                      border: 6px solid #f3f3f3;
                      border-top: 6px solid #2296f3;
                      border-radius: 50%;
                      width: 40px;
                      height: 40px;
                      animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
              </div>
            }
          >
            <SimpleMap />
          </Suspense>
        ) : (
          <div id="sketch-particles">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, padding: '8px 12px' }}>
              <aside style={{ flex: '0 0 auto' }}>
                <FilterDropdown
                  filters={availableFiltersDynamic}   // 🔹 cascaded options here
                  selected={selectedFilters}
                  toggleFilter={toggleFilter}
                  clearFilter={clearFilter}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  nameQuery={searchfield}
                  setNameQuery={setSearchfield}
                />
              </aside>

              <section style={{ flex: 1 }}>
                <BatchCards persons={filteredForDisplay(searchfield)} numberPerBatch={16} />
              </section>
            </div>
          </div>
        )}
      </main>

      <footer className="custom--unselectable w-100 h3 flex items-center justify-center white custom--bg-additional3 z-2">
        <div className="flex items-center">
          Copyright © {new Date().getFullYear()} by Zero to Mastery.
          All Rights Reserved. &nbsp;&nbsp;
          <a
            href="https://github.com/zero-to-mastery/ZtM-Job-Board"
            title="Repository"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </footer>

      <div className="custom--top-button">
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" />
          </svg>
        </div>
      </div>
      <FeedbackForm />
    </div>
  );
}

export default App;
