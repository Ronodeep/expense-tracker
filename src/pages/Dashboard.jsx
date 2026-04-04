import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import MemberAvatar from '../components/MemberAvatar'
import { formatINR } from '../lib/currency'

export default function Dashboard() {
  const { group, groupId, currentMember } = useGroup()
  const members = group?.members || []
  const expenses = group?.expenses || []

  // Memoize stats (H3 fix)
  const { totalBudget, memberStats, myNet, myStats } = useMemo(() => {
    const stats = {}
    members.forEach(m => { stats[m.id] = { paid: 0, owed: 0 } })

    let total = 0
    expenses.forEach(exp => {
      const rate = exp.conversion_rate || 1
      total += exp.total_amount * rate
      ;(exp.payers || []).forEach(p => {
        if (stats[p.member_id]) stats[p.member_id].paid += p.amount_paid * rate
      })
      ;(exp.splits || []).forEach(s => {
        if (stats[s.member_id]) stats[s.member_id].owed += s.amount_owed * rate
      })
    })

    const my = currentMember ? stats[currentMember.id] || { paid: 0, owed: 0 } : { paid: 0, owed: 0 }
    return { totalBudget: total, memberStats: stats, myNet: my.paid - my.owed, myStats: my }
  }, [members, expenses, currentMember])

  if (!group) return null

  return (
    <div className="page" id="dashboard-page">
      <div className="dash-header animate-fade-in">
        <div>
          <h1 className="headline-lg">{group.name}</h1>
          {group.description && <p className="body-md text-muted">{group.description}</p>}
        </div>
      </div>

      {/* Members Row */}
      <section className="dash-section animate-fade-in stagger-1">
        <div className="flex items-center justify-between">
          <span className="label-lg">{members.length} Members</span>
        </div>
        <div className="members-row">
          {members.map(m => (
            <div key={m.id} className="member-chip">
              <MemberAvatar name={m.name} size="sm" />
              <span className="body-sm">{m.name}{m.is_creator ? ' ⭐' : ''}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Cards */}
      <section className="dash-section animate-fade-in stagger-2">
        <div className="summary-grid">
          <div className="summary-card">
            <span className="label-md">Total Budget</span>
            <span className="headline-md text-primary">{formatINR(totalBudget)}</span>
          </div>
          <div className="summary-card">
            <span className="label-md">My Share</span>
            <span className="headline-md">{formatINR(myStats.owed)}</span>
          </div>
          <div className="summary-card">
            <span className="label-md">{myNet >= 0 ? "I'm Owed" : 'I Owe'}</span>
            <span className={`headline-md ${myNet >= 0 ? 'text-secondary' : 'text-error'}`}>
              {formatINR(Math.abs(myNet))}
            </span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dash-section animate-fade-in stagger-3">
        <div className="flex gap-md">
          <Link to={`/group/${groupId}/add`} className="btn btn-primary" style={{ flex: 1 }} id="btn-add-expense">
            + Add Expense
          </Link>
          <Link to={`/group/${groupId}/settlement`} className="btn btn-secondary" style={{ flex: 1 }} id="btn-view-settlement">
            View Settlement
          </Link>
        </div>
      </section>

      {/* Recent Expenses */}
      <section className="dash-section animate-fade-in stagger-4">
        <div className="flex items-center justify-between">
          <span className="label-lg">Recent Expenses</span>
          {expenses.length > 0 && (
            <Link to={`/group/${groupId}/expenses`} className="btn btn-tertiary btn-sm">View All →</Link>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No expenses yet</div>
            <div className="empty-state-text">Add your first expense to start tracking!</div>
          </div>
        ) : (
          <div className="expense-list">
            {expenses.slice(-5).reverse().map(exp => {
              const payer = members.find(m => (exp.payers || [])[0]?.member_id === m.id)
              return (
                <div key={exp.id} className="expense-item">
                  <div className="expense-item-left">
                    <div className="category-chip">{exp.category_icon || '📎'} {exp.category}</div>
                    <div className="title-md">{exp.description}</div>
                    <div className="body-sm text-muted">
                      paid by {payer?.name || 'Unknown'} · {new Date(exp.expense_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="expense-item-right">
                    <span className="headline-sm text-primary">
                      {formatINR(exp.total_amount * (exp.conversion_rate || 1))}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <style>{`
        .dash-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .dash-section {
          margin-bottom: var(--space-lg);
        }

        .members-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          margin-top: var(--space-sm);
        }

        .member-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 4px;
          background: var(--surface-container-highest);
          border-radius: var(--radius-full);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-sm);
        }

        .summary-card {
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .expense-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-top: var(--space-sm);
        }

        .expense-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--space-md);
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          gap: var(--space-md);
        }

        .expense-item-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .expense-item-right {
          flex-shrink: 0;
        }

        @media (max-width: 380px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
