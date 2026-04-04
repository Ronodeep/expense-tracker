import { Outlet, NavLink, useParams, Link } from 'react-router-dom'
import Copyright from './Copyright'

export default function Layout() {
  const { groupId } = useParams()

  return (
    <>
      <main className="container">
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
