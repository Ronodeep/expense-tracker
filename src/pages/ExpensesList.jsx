import { useNavigate } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import { getCategoryConfig } from '../data/categories'
import { formatINR } from '../lib/currency'
import { loadGroup, saveGroup } from '../lib/storage'

export default function ExpensesList() {
  const { group, groupId, refresh } = useGroup()
  const navigate = useNavigate()

  if (!group) return null

  const expenses = (group.expenses || []).slice().reverse()
  const members = group.members || []

  function getMemberName(id) {
    return members.find(m => m.id === id)?.name || 'Unknown'
  }

  function deleteExpense(expenseId) {
    if (!confirm('Delete this expense?')) return
    const current = loadGroup(groupId)
    if (current) {
      current.expenses = current.expenses.filter(e => e.id !== expenseId)
      saveGroup(groupId, current)
      refresh()
    }
  }

  return (
    <div className="page" id="expenses-list-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)} id="btn-back">←</button>
        <div>
          <h1 className="headline-md">All Expenses</h1>
          <p className="body-sm text-muted">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} · {group.name}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No expenses yet</div>
          <div className="empty-state-text">Add your first expense to get started.</div>
        </div>
      ) : (
        <div className="expenses-list">
          {expenses.map((exp, idx) => {
            const catConfig = getCategoryConfig(exp.category)
            const payerNames = (exp.payers || []).map(p => getMemberName(p.member_id)).join(', ')
            const splitNames = (exp.splits || []).map(s => getMemberName(s.member_id))
            const amountINR = exp.total_amount * (exp.conversion_rate || 1)

            return (
              <div key={exp.id} className="expense-card animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                <div className="expense-card-top">
                  <div className="expense-card-info">
                    <span className="category-chip" style={{ color: catConfig.color }}>
                      {catConfig.icon} {exp.category}
                    </span>
                    <h3 className="title-md">{exp.description}</h3>
                    <p className="body-sm text-muted">
                      paid by {payerNames} · {new Date(exp.expense_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="expense-card-amount">
                    <span className="headline-sm text-primary">{formatINR(amountINR)}</span>
                    {exp.currency !== 'INR' && (
                      <span className="body-sm text-muted">
                        {exp.total_amount} {exp.currency}
                      </span>
                    )}
                  </div>
                </div>
                <div className="expense-card-bottom">
                  <span className="body-sm text-muted">
                    Split ({exp.split_type?.toLowerCase()}) among {splitNames.length}: {splitNames.join(', ')}
                  </span>
                  <div className="flex gap-sm">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/group/${groupId}/edit/${exp.id}`)}
                      style={{ padding: '4px 8px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-tertiary btn-sm"
                      onClick={() => deleteExpense(exp.id)}
                      style={{ color: 'var(--error)', padding: '4px 8px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .expenses-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .expense-card {
          background: var(--surface-container-high);
          border-radius: var(--radius-md);
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .expense-card-top {
          display: flex;
          justify-content: space-between;
          gap: var(--space-md);
        }

        .expense-card-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .expense-card-amount {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .expense-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>
    </div>
  )
}
