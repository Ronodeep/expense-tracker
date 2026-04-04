import { Outlet, NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import Copyright from './Copyright'
import { useGroup } from '../hooks/useGroup'

export default function Layout() {
  const { group, groupId, currentMember } = useGroup()
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    if (!group) return
    try {
      await navigator.clipboard.writeText(group.code)
    } catch {
      const input = document.createElement('input')
      input.value = group.code
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <main className="container">
        {(group || currentMember) && (
          <header style={{
            position: 'sticky',
            top: 16,
            zIndex: 100,
            marginBottom: '32px',
            padding: '20px 24px',
            background: 'rgba(11, 19, 38, 0.65)', /* var(--surface) with opacity */
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(74, 68, 85, 0.1)', /* Subtle Ghost Border */
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(6, 14, 32, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              {/* Left: Group Name & Description */}
              <div style={{ flex: '1 1 min-content' }}>
                <h1 className="display-sm" style={{ margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--on-surface)' }}>
                  {group.name}
                </h1>
                {group.description && (
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', margin: '6px 0 0 0' }}>
                    {group.description}
                  </p>
                )}
              </div>

              {/* Right: Actions & Identity */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                {group && (
                  <button 
                    onClick={copyCode}
                    title="Copy group code"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(210, 187, 255, 0.15))',
                      border: '1px solid rgba(124, 58, 237, 0.3)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(210, 187, 255, 0.25))'
                      e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)'
                      e.currentTarget.style.transform = 'scale(1.02)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(210, 187, 255, 0.15))'
                      e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <span style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>Code:</span>
                    <span style={{ fontFamily: 'var(--font-headline)', letterSpacing: '0.05em' }}>{group.code}</span>
                    <span style={{ fontSize: '1rem', marginLeft: '4px' }}>{copied ? '✓' : '⎘'}</span>
                  </button>
                )}

                {currentMember && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--surface-container-lowest)',
                    border: '1px solid rgba(74, 68, 85, 0.2)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--tertiary)',
                      boxShadow: '0 0 8px var(--tertiary)'
                    }}></div>
                    <span className="label-md" style={{ color: 'var(--on-surface-variant)' }}>
                      Acting as: <strong style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{currentMember.name}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}
        <Outlet />
        <Copyright />
      </main>

      <nav className="bottom-nav" id="bottom-navigation">
        <div className="bottom-nav-inner">
          <Link
            to="/"
            className="nav-item"
            id="nav-home"
            title="Back to Home"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </Link>

          <NavLink
            to={`/group/${groupId}`}
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-dashboard"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to={`/group/${groupId}/expenses`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-expenses"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Expenses</span>
          </NavLink>

          <NavLink
            to={`/group/${groupId}/charts`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-charts"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Charts</span>
          </NavLink>

          <NavLink
            to={`/group/${groupId}/settlement`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id="nav-settlement"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 11l-5-5-5 5" />
              <path d="M17 18l-5-5-5 5" />
            </svg>
            <span>Settle</span>
          </NavLink>
        </div>
      </nav>
    </>
  )
}
