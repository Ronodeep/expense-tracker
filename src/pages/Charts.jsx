import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useGroup } from '../hooks/useGroup'
import { getCategoryConfig } from '../data/categories'
import { formatINR } from '../lib/currency'

const CHART_COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444']

export default function Charts() {
  const { group, groupId } = useGroup()
  const navigate = useNavigate()

  if (!group) return null
  const members = group.members || []
  const expenses = group.expenses || []

  if (expenses.length === 0) {
    return (
      <div className="page" id="charts-page">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>←</button>
          <h1 className="headline-md">Analytics</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">No data yet</div>
          <div className="empty-state-text">Add expenses to see charts.</div>
        </div>
      </div>
    )
  }

  // Category breakdown
  const catMap = {}
  expenses.forEach(exp => {
    const cat = exp.category || 'Other'
    const amt = exp.total_amount * (exp.conversion_rate || 1)
    catMap[cat] = (catMap[cat] || 0) + amt
  })
  const categoryData = Object.entries(catMap)
    .map(([name, value]) => ({ name, value: Math.round(value), config: getCategoryConfig(name) }))
    .sort((a, b) => b.value - a.value)

  // Who paid how much
  const paidMap = {}
  expenses.forEach(exp => {
    const rate = exp.conversion_rate || 1
    ;(exp.payers || []).forEach(p => {
      const name = members.find(m => m.id === p.member_id)?.name || 'Unknown'
      paidMap[name] = (paidMap[name] || 0) + p.amount_paid * rate
    })
  })
  const paidData = Object.entries(paidMap)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)

  // Per-person share
  const shareMap = {}
  expenses.forEach(exp => {
    const rate = exp.conversion_rate || 1
    ;(exp.splits || []).forEach(s => {
      const name = members.find(m => m.id === s.member_id)?.name || 'Unknown'
      shareMap[name] = (shareMap[name] || 0) + s.amount_owed * rate
    })
  })
  const shareData = Object.entries(shareMap)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)

  const total = expenses.reduce((s, e) => s + e.total_amount * (e.conversion_rate || 1), 0)

  const customTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: 'var(--surface-container-highest)', padding: '8px 12px', borderRadius: 12, fontSize: '0.8rem' }}>
        <div style={{ fontWeight: 600 }}>{payload[0].name || payload[0].payload?.name}</div>
        <div style={{ color: 'var(--primary)' }}>{formatINR(payload[0].value)}</div>
      </div>
    )
  }

  return (
    <div className="page" id="charts-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(`/group/${groupId}`)}>←</button>
        <div>
          <h1 className="headline-md">Analytics</h1>
          <p className="body-sm text-muted">{group.name}</p>
        </div>
      </div>

      {/* Total */}
      <div className="card animate-fade-in" style={{ textAlign: 'center', marginBottom: 24 }}>
        <span className="label-md">Total Group Spending</span>
        <div className="display-md text-primary">{formatINR(total)}</div>
      </div>

      {/* Category Pie */}
      <section className="card animate-fade-in stagger-1" style={{ marginBottom: 24 }}>
        <h2 className="label-lg" style={{ marginBottom: 16 }}>Spending by Category</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
              {categoryData.map((cat, i) => <Cell key={cat.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip content={customTooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {categoryData.map((cat, i) => (
            <span key={cat.name} className="category-chip" style={{ gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], display: 'inline-block' }} />
              {cat.config.icon} {cat.name} · {formatINR(cat.value)}
            </span>
          ))}
        </div>
      </section>

      {/* Who Paid Bar */}
      <section className="card animate-fade-in stagger-2" style={{ marginBottom: 24 }}>
        <h2 className="label-lg" style={{ marginBottom: 16 }}>Who Paid</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={paidData} layout="vertical" margin={{ left: 60 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--on-surface)', fontSize: 12 }} width={60} />
            <Tooltip content={customTooltip} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
            <Bar dataKey="value" fill="var(--primary-container)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Per-Person Share */}
      <section className="card animate-fade-in stagger-3" style={{ marginBottom: 24 }}>
        <h2 className="label-lg" style={{ marginBottom: 16 }}>Per-Person Share</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={shareData} layout="vertical" margin={{ left: 60 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--on-surface)', fontSize: 12 }} width={60} />
            <Tooltip content={customTooltip} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
            <Bar dataKey="value" fill="var(--secondary-container)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  )
}
