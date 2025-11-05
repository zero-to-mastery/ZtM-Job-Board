// src/components/Landing.tsx
import React from 'react';

type Props = {
  onContinue: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onHire?: () => void; // new optional prop
};

const Landing: React.FC<Props> = ({ onContinue, onLogin, onRegister, onHire }) => {
  return (
    <>
      <style>{`
        :root {
          --primary:#2296f3;
          --primary-2:#5bb6ff;
          --ink:#0a1a2b;
          --bg:#0b1220;
          --card:#0f1b2e;
          --muted:#9ec9ff;
          --white:#ffffff;
        }
        .landing {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
          color: var(--white);
          background:
            radial-gradient(1200px 600px at 20% -10%, rgba(34,150,243,0.35), transparent 60%),
            radial-gradient(1000px 600px at 90% 10%, rgba(91,182,255,0.25), transparent 60%),
            linear-gradient(160deg, #0a1222, #0b1426 40%, #081121 75%);
          overflow: hidden;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial;
        }

        /* header */
        .landing__nav {
          display:flex; align-items:center; justify-content:space-between;
          padding: 16px 24px; max-width:1200px; margin:0 auto; width:100%;
        }
        .brand {
          display:flex; align-items:center; gap:10px; font-weight:800; letter-spacing:0.2px;
        }
        .brand__logo {
          width:38px; height:38px; border-radius:12px;
          background: linear-gradient(135deg, var(--primary), var(--primary-2));
          display:grid; place-items:center; box-shadow:0 8px 28px rgba(34,150,243,0.45);
        }
        .brand__dot { font-size:18px; }

        .nav__cta {
          display:flex; gap:10px;
        }
        .btn {
          appearance:none; border:none; border-radius:12px; padding:10px 14px;
          font-weight:700; cursor:pointer; transition:transform .15s ease, box-shadow .2s ease, background .2s ease;
        }
        .btn--ghost {
          background:transparent; color:var(--muted); border:1px solid rgba(255,255,255,0.15);
        }
        .btn--primary {
          background:var(--white); color:var(--ink);
          box-shadow:0 10px 24px rgba(34,150,243,0.35);
        }
        .btn:focus-visible { outline:2px solid var(--primary-2); outline-offset:3px; }
        .btn:hover { transform: translateY(-1px); }

        /* hero */
        .hero {
          display:grid; align-items:center; justify-items:center; padding: 24px;
        }
        .content {
          width:100%; max-width: 1100px; display:grid; grid-template-columns: 1.1fr .9fr; gap:36px;
        }
        @media (max-width: 900px) {
          .content { grid-template-columns: 1fr; text-align:center; }
        }

        .headline {
          font-size: clamp(28px, 4.5vw, 56px);
          font-weight: 900; line-height: 1.05; letter-spacing: -0.5px;
          margin: 8px 0 12px;
        }
        .accent {
          background: linear-gradient(90deg, var(--primary), var(--primary-2));
          -webkit-background-clip:text; background-clip:text; color:transparent;
          text-shadow: 0 10px 30px rgba(34,150,243,0.25);
        }
        .sub {
          color:#cfe6ff; max-width: 56ch; font-size: clamp(14px, 1.8vw, 18px);
          line-height:1.5; opacity:.96;
        }

        .cta-row {
          display:flex; gap:12px; margin-top: 18px; flex-wrap:wrap;
          justify-content:flex-start;
        }
        @media (max-width:900px){ .cta-row{ justify-content:center; } }

        .btn--huge { padding:14px 18px; border-radius:14px; font-size:16px; }
        .btn--outline {
          background:transparent; color:#eaf4ff; border:1px solid rgba(255,255,255,0.2);
        }

        /* right visual: animated cards */
        .visual {
          display:grid; place-items:center; position:relative;
        }
        .stack {
          position:relative; width:min(380px, 90%); height: 340px; perspective: 900px;
        }
        .card {
          position:absolute; inset:0; border-radius:18px;
          background: linear-gradient(180deg, #13243d, #0e1d33);
          border:1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 80px rgba(5,20,45,0.55);
          display:grid; place-items:center; color:#d7e9ff; font-weight:800; letter-spacing:.6px;
          transform-style: preserve-3d;
        }
        .card--a { transform: rotate(-6deg) translate3d(-18px, -10px, 0); animation: floatA 6s ease-in-out infinite; }
        .card--b { transform: rotate(4deg) translate3d(18px, 18px, 0); animation: floatB 7.5s ease-in-out infinite; }
        .card--c { transform: rotate(-1deg) translate3d(4px, 8px, 0); animation: floatC 8.5s ease-in-out infinite; }

        @keyframes floatA { 0%,100%{ transform: rotate(-6deg) translate3d(-18px,-10px,0);} 50%{ transform: rotate(-5deg) translate3d(-12px,-18px,0);} }
        @keyframes floatB { 0%,100%{ transform: rotate(4deg) translate3d(18px,18px,0);} 50%{ transform: rotate(6deg) translate3d(12px,10px,0);} }
        @keyframes floatC { 0%,100%{ transform: rotate(-1deg) translate3d(4px,8px,0);} 50%{ transform: rotate(1deg) translate3d(0px,0px,0);} }

        /* footer */
        .foot {
          color:#9ec9ff; opacity:.9; text-align:center; padding: 14px;
          font-size: 13px;
        }

        /* animated orbs background */
        .orb, .orb2 {
          position: absolute; border-radius: 999px; filter: blur(40px); opacity:.35; pointer-events:none;
        }
        .orb {
          width: 220px; height: 220px; background: #2aa4ff; top: 14%; left: -60px;
          animation: drift1 16s ease-in-out infinite;
        }
        .orb2 {
          width: 180px; height: 180px; background: #69c0ff; bottom: 6%; right: -40px;
          animation: drift2 18s ease-in-out infinite;
        }
        @keyframes drift1 { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-18px);} }
        @keyframes drift2 { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(14px);} }
      `}</style>

      <div className="landing">
        {/* Header */}
        <header className="landing__nav" aria-label="Top navigation">
          <div className="brand" aria-label="JobBoard">
            <div className="brand__logo" aria-hidden>
              <span className="brand__dot">👥</span>
            </div>
            <div>Job<span className="accent">Board</span></div>
          </div>

          <nav className="nav__cta" aria-label="Quick actions">
            <button className="btn btn--ghost"
              onClick={() => (onLogin ? onLogin() : onContinue())}>
              Login
            </button>
            <button className="btn btn--primary"
              onClick={() => (onRegister ? onRegister() : onContinue())}>
              Register
            </button>
          </nav>
        </header>

        {/* Hero */}
        <main className="hero" role="main" aria-label="Welcome section">
          <div className="orb" aria-hidden></div>
          <div className="orb2" aria-hidden></div>

          <section className="content">
            <div>
              <h1 className="headline">
                Discover <span className="accent">Developers</span> & Remote Talent — Fast.
              </h1>
              <p className="sub">
                Curated profiles, instant contact, and powerful filters. Your next hire or opportunity is a click away.
              </p>

              <div className="cta-row" role="group" aria-label="Primary actions">
                <button className="btn btn--huge btn--primary"
                  onClick={() => (onRegister ? onRegister() : onContinue())}
                  aria-label="Create your profile">
                  Create your profile
                </button>

                {/* call onHire if provided, otherwise fallback to previous behaviour */}
                <button className="btn btn--huge btn--outline"
                  onClick={() => (onHire ? onHire() : (onLogin ? onLogin() : onContinue()))}
                  aria-label="I want to hire">
                  I’m hiring
                </button>
              </div>
            </div>

            <div className="visual" aria-hidden>
              <div className="stack">
                <div className="card card--a">Frontend</div>
                <div className="card card--b">Full-stack</div>
                <div className="card card--c">Data / DevOps</div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="foot" aria-label="Footer">
          © {new Date().getFullYear()} JobBoard • Built for speed & clarity
        </footer>
      </div>
    </>
  );
};

export default Landing;