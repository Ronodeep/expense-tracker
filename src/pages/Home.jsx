import { Link } from 'react-router-dom'
import Copyright from '../components/Copyright'

export default function Home() {
  return (
    <div className="home-page" id="home-page">
      <div className="home-content">
        {/* Hero */}
        <header className="home-hero animate-fade-in">
          <h1 className="display-md home-title">
            Expense<span className="text-primary">Tracker</span>
          </h1>
          <p className="body-lg home-subtitle">
            Your all-in-one finance companion. Split expenses, track budgets,
            and stay on top of your money — all for free.
          </p>
        </header>

        {/* Module Cards */}
        <section className="module-grid">
          {/* Module 1: Split Karo — Active */}
          <Link to="/splitkaro" className="module-card module-active animate-fade-in stagger-1" id="module-splitkaro">
            <div className="module-badge">Live</div>
            <div className="module-icon">💸</div>
            <h2 className="headline-md">SplitKaro</h2>
            <p className="body-md text-muted">
              Split group expenses with friends. Track who paid, who owes, and settle
              debts with the fewest transactions.
            </p>
            <div className="module-features">
              <span className="module-feature-chip">⚡ Smart Splitting</span>
              <span className="module-feature-chip">💱 Multi-Currency</span>
              <span className="module-feature-chip">📊 Analytics</span>
            </div>
            <span className="btn btn-primary btn-sm module-cta">
              Open SplitKaro →
            </span>
          </Link>

          {/* Module 2: Personal Expense Tracking — Coming Soon */}
          <div className="module-card module-coming-soon animate-fade-in stagger-2" id="module-personal-tracker">
            <div className="module-badge coming-soon-badge">Coming Soon</div>
            <div className="module-icon">📒</div>
            <h2 className="headline-md">Personal Tracker</h2>
            <p className="body-md text-muted">
              Track your daily expenses, set monthly budgets, and get insights
              into your spending habits.
            </p>
            <div className="module-features">
              <span className="module-feature-chip">📅 Monthly Views</span>
              <span className="module-feature-chip">🏷️ Tags & Labels</span>
              <span className="module-feature-chip">🔄 Recurring</span>
            </div>
            <span className="btn btn-secondary btn-sm module-cta" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Coming in V3 🚧
            </span>
          </div>
        </section>

        <Copyright />
      </div>

      <style>{`
        .home-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(160deg, #0b1326 0%, #1a103d 50%, #0b1326 100%);
          padding: var(--space-lg);
        }

        .home-content {
          width: 100%;
          max-width: 640px;
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }

        .home-hero {
          text-align: center;
        }

        .home-title {
          margin-bottom: var(--space-md);
        }

        .home-subtitle {
          color: var(--on-surface-variant);
          max-width: 480px;
          margin: 0 auto;
        }

        .module-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
        }

        @media (min-width: 600px) {
          .module-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .module-card {
          position: relative;
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          padding: var(--space-xl) var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          text-decoration: none;
          color: inherit;
          transition: all var(--transition-base);
          border: 1px solid transparent;
        }

        .module-active {
          cursor: pointer;
        }

        .module-active:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-glow);
          border-color: var(--primary-container);
        }

        .module-coming-soon {
          opacity: 0.7;
          cursor: default;
        }

        .module-badge {
          position: absolute;
          top: var(--space-md);
          right: var(--space-md);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: rgba(78, 222, 163, 0.15);
          color: var(--secondary);
        }

        .coming-soon-badge {
          background: rgba(255, 180, 171, 0.12);
          color: var(--error);
        }

        .module-icon {
          font-size: 2.5rem;
        }

        .module-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .module-feature-chip {
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: var(--surface-container-highest);
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--on-surface-variant);
          white-space: nowrap;
        }

        .module-cta {
          align-self: flex-start;
          margin-top: var(--space-sm);
        }
      `}</style>
    </div>
  )
}
