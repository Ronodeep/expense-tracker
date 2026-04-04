import { useNavigate } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import MemberAvatar from '../components/MemberAvatar'
import { computeSettlement } from '../lib/settlement'
import { formatINR } from '../lib/currency'

export default function Settlement() {
  const { group, groupId } = useGroup()
  const navigate = useNavigate()

  if (!group) return null
  const members = group.members || []
  const expenses = group.expenses || []
  const { balances, transactions } = computeSettlement(expenses, members)

  return (
    <div className="page" id="settlement-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>←</button>
        <div>
          <h1 className="headline-md">Settlement</h1>
          <p className="body-sm text-muted">{group.name}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🤝</div>
          <div className="empty-state-title">Nothing to settle</div>
          <div className="empty-state-text">Add expenses first.</div>
        </div>
      ) : (
        <>
          <div className="card animate-fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
            <span className="body-md">
              {transactions.length === 0
                ? '✅ All settled!'
                : `${transactions.length} transaction${transactions.length > 1 ? 's' : ''} to settle`}
            </span>
          </div>

          {transactions.map((txn, i) => (
            <div key={i} className="card animate-fade-in" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <MemberAvatar name={txn.from.name} size="md" />
                <span className="body-sm">{txn.from.name}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="headline-sm text-primary">{formatINR(txn.amount)}</div>
                <div className="body-sm text-muted">→</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <MemberAvatar name={txn.to.name} size="md" />
                <span className="body-sm">{txn.to.name}</span>
              </div>
            </div>
          ))}

          <h2 className="label-lg" style={{ margin: '24px 0 12px' }}>Net Balances</h2>
          {Array.from(balances.values()).sort((a, b) => b.balance - a.balance).map(({ memberId, name, balance }) => (
            <div key={memberId} className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-sm">
                <MemberAvatar name={name} size="sm" />
                <span className="body-md">{name}</span>
              </div>
              <span className={balance >= 0 ? 'chip-positive' : 'chip-negative'}>
                {balance >= 0 ? '+' : ''}{formatINR(balance)}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
