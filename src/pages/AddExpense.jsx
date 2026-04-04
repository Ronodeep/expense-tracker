import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGroup } from '../hooks/useGroup'
import { PREDEFINED_CATEGORIES, getCategoryConfig } from '../data/categories'
import { CURRENCIES, formatCurrency } from '../lib/currency'
import { saveGroup } from '../lib/storage'
import { SPLIT_TYPES, SPLIT_TYPE_LABELS } from '../lib/constants'

export default function AddExpense() {
  const { group, groupId, currentMember } = useGroup()
  const navigate = useNavigate()
  const { expenseId } = useParams()
  const isEditMode = !!expenseId

  // Form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [conversionRate, setConversionRate] = useState('1')
  const [category, setCategory] = useState('Food')
  const [customCategory, setCustomCategory] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [splitType, setSplitType] = useState(SPLIT_TYPES.EQUAL)

  // Payer state
  const [multiPayer, setMultiPayer] = useState(false)
  const [payers, setPayers] = useState(() => currentMember ? { [currentMember.id]: '' } : {})

  // Split state
  const [splitMembers, setSplitMembers] = useState({})
  const [splitValues, setSplitValues] = useState({})

  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize form state
  if (group && !initialized) {
    const expToEdit = isEditMode ? group.expenses?.find(e => e.id === expenseId) : null

    if (expToEdit) {
      setDescription(expToEdit.description)
      setAmount(expToEdit.total_amount.toString())
      setCurrency(expToEdit.currency || 'INR')
      setConversionRate((expToEdit.conversion_rate || 1).toString())
      
      const isPredefined = PREDEFINED_CATEGORIES.some(c => c.name === expToEdit.category)
      setCategory(isPredefined ? expToEdit.category : 'Other')
      if (!isPredefined) setCustomCategory(expToEdit.category)
      
      if (expToEdit.expense_date) {
        setExpenseDate(expToEdit.expense_date.split('T')[0])
      }
      setSplitType(expToEdit.split_type || SPLIT_TYPES.EQUAL)

      if (expToEdit.payers && expToEdit.payers.length > 0) {
        setMultiPayer(expToEdit.payers.length > 1)
        const initialPayers = {}
        expToEdit.payers.forEach(p => { initialPayers[p.member_id] = p.amount_paid.toString() })
        setPayers(initialPayers)
      }

      if (expToEdit.splits) {
        const sMembers = {}
        const sValues = {}
        group.members.forEach(m => {
          const splitData = expToEdit.splits.find(s => s.member_id === m.id)
          sMembers[m.id] = !!splitData
          sValues[m.id] = splitData ? splitData.split_value.toString() : ''
        })
        setSplitMembers(sMembers)
        setSplitValues(sValues)
      }
    } else {
      const splits = {}
      const vals = {}
      group.members.forEach(m => {
        splits[m.id] = true
        vals[m.id] = ''
      })
      setSplitMembers(splits)
      setSplitValues(vals)
      if (currentMember && Object.keys(payers).length === 0) {
        setPayers({ [currentMember.id]: '' })
      }
    }
    setInitialized(true)
  }

  if (!group) return null

  const members = group.members || []
  const totalAmount = parseFloat(amount) || 0
  const effectiveCategory = category === 'Other' ? customCategory : category
  const catConfig = getCategoryConfig(effectiveCategory)

  const selectedSplitMembers = members.filter(m => splitMembers[m.id])
  const splitCount = selectedSplitMembers.length

  function getSplitAmount(memberId) {
    if (!splitMembers[memberId] || totalAmount === 0) return 0
    const value = parseFloat(splitValues[memberId]) || 0

    switch (splitType) {
      case SPLIT_TYPES.EQUAL:
        return splitCount > 0 ? totalAmount / splitCount : 0
      case SPLIT_TYPES.RATIO: {
        const totalRatio = selectedSplitMembers.reduce((s, m) => s + (parseFloat(splitValues[m.id]) || 0), 0)
        return totalRatio > 0 ? (totalAmount * value) / totalRatio : 0
      }
      case SPLIT_TYPES.PERCENTAGE:
        return totalAmount * (value / 100)
      case SPLIT_TYPES.EXACT:
        return value
      default:
        return 0
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim() || totalAmount <= 0 || !effectiveCategory) return

    setLoading(true)
    try {
      const newExpId = crypto.randomUUID()
      const rate = parseFloat(conversionRate) || 1

      const payersList = []
      if (multiPayer) {
        Object.entries(payers).forEach(([memberId, amt]) => {
          const paidAmt = parseFloat(amt)
          if (paidAmt > 0) {
            payersList.push({ member_id: memberId, amount_paid: paidAmt })
          }
        })
      } else {
        const singlePayerId = Object.keys(payers)[0] || currentMember?.id
        payersList.push({ member_id: singlePayerId, amount_paid: totalAmount })
      }

      const splitsList = selectedSplitMembers.map(m => ({
        member_id: m.id,
        split_value: splitType === SPLIT_TYPES.EQUAL ? 1 : (parseFloat(splitValues[m.id]) || 0),
        amount_owed: Math.round(getSplitAmount(m.id) * 100) / 100,
      }))

      const expense = {
        id: isEditMode ? expenseId : newExpId,
        group_id: groupId,
        description: description.trim(),
        total_amount: totalAmount,
        currency,
        conversion_rate: rate,
        category: effectiveCategory,
        category_icon: catConfig.icon,
        expense_date: expenseDate,
        created_by: isEditMode ? group.expenses.find(e => e.id === expenseId)?.created_by || currentMember?.id : currentMember?.id,
        split_type: splitType,
        created_at: isEditMode ? group.expenses.find(e => e.id === expenseId)?.created_at || new Date().toISOString() : new Date().toISOString(),
        payers: payersList,
        splits: splitsList,
      }

      const updatedGroup = { ...group }
      if (isEditMode) {
        updatedGroup.expenses = updatedGroup.expenses.map(e => e.id === expenseId ? expense : e)
      } else {
        updatedGroup.expenses = [...(updatedGroup.expenses || []), expense]
      }
      saveGroup(groupId, updatedGroup)

      navigate(`/group/${groupId}`)
    } catch (err) {
      console.error('Failed to add/update expense:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" id="add-expense-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)} id="btn-back">←</button>
        <div>
          <h1 className="headline-md">{isEditMode ? 'Edit Expense' : 'Add Expense'}</h1>
          <p className="body-sm text-muted">{group.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="expense-form">
        {/* Description */}
        <div className="input-group animate-fade-in stagger-1">
          <label className="input-label">Description</label>
          <input
            className="input"
            type="text"
            placeholder="What was this expense for?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            id="input-description"
          />
        </div>

        {/* Amount + Currency */}
        <div className="input-group animate-fade-in stagger-2">
          <label className="input-label">Amount</label>
          <div className="flex gap-sm">
            <input
              className="input input-lg"
              type="number"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
              style={{ flex: 1 }}
              id="input-amount"
            />
            <select
              className="input"
              value={currency}
              onChange={e => {
                setCurrency(e.target.value)
                setConversionRate(e.target.value === 'INR' ? '1' : '')
              }}
              style={{ width: '100px' }}
              id="select-currency"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conversion Rate */}
        {currency !== 'INR' && (
          <div className="input-group animate-fade-in">
            <label className="input-label">Conversion Rate (1 {currency} = ? INR)</label>
            <input
              className="input"
              type="number"
              placeholder={`Enter rate: 1 ${currency} = ₹__`}
              value={conversionRate}
              onChange={e => setConversionRate(e.target.value)}
              min="0"
              step="0.01"
              required
              id="input-conversion-rate"
            />
            {totalAmount > 0 && conversionRate && (
              <span className="body-sm text-muted" style={{ marginTop: 4 }}>
                ≈ ₹{(totalAmount * parseFloat(conversionRate || 0)).toLocaleString('en-IN')} INR
              </span>
            )}
          </div>
        )}

        {/* Category */}
        <div className="input-group animate-fade-in stagger-3">
          <label className="input-label">Category</label>
          <div className="category-grid">
            {PREDEFINED_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                type="button"
                className={`category-option ${category === cat.name ? 'active' : ''}`}
                onClick={() => setCategory(cat.name)}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
            <button
              type="button"
              className={`category-option ${category === 'Other' ? 'active' : ''}`}
              onClick={() => setCategory('Other')}
            >
              <span>✏️</span>
              <span>Other</span>
            </button>
          </div>
          {category === 'Other' && (
            <input
              className="input"
              type="text"
              placeholder="Custom category name"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              required
              id="input-custom-category"
            />
          )}
        </div>

        {/* Date */}
        <div className="input-group animate-fade-in stagger-3">
          <label className="input-label">Date</label>
          <input
            className="input"
            type="date"
            value={expenseDate}
            onChange={e => setExpenseDate(e.target.value)}
            id="input-date"
          />
        </div>

        {/* Paid By */}
        <div className="input-group animate-fade-in stagger-4">
          <div className="flex items-center justify-between">
            <label className="input-label">Paid By</label>
            <button
              type="button"
              className="btn btn-tertiary btn-sm"
              onClick={() => setMultiPayer(!multiPayer)}
              id="btn-toggle-multi-payer"
            >
              {multiPayer ? 'Single Payer' : 'Multiple Payers'}
            </button>
          </div>
          {!multiPayer ? (
            <select
              className="input"
              value={Object.keys(payers)[0] || ''}
              onChange={e => setPayers({ [e.target.value]: '' })}
              id="select-payer"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          ) : (
            <div className="payer-list">
              {members.map(m => (
                <div key={m.id} className="payer-row">
                  <label className="flex items-center gap-sm">
                    <input
                      type="checkbox"
                      checked={m.id in payers}
                      onChange={e => {
                        const next = { ...payers }
                        if (e.target.checked) next[m.id] = ''
                        else delete next[m.id]
                        setPayers(next)
                      }}
                    />
                    <span className="body-md">{m.name}</span>
                  </label>
                  {m.id in payers && (
                    <input
                      className="input"
                      type="number"
                      placeholder="Amount"
                      value={payers[m.id]}
                      onChange={e => setPayers({ ...payers, [m.id]: e.target.value })}
                      style={{ width: '120px' }}
                      min="0"
                      step="0.01"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Split Between */}
        <div className="input-group animate-fade-in stagger-5">
          <label className="input-label">Split Between</label>
          <div className="split-type-row">
            {Object.values(SPLIT_TYPES).map(type => (
              <button
                key={type}
                type="button"
                className={`split-type-btn ${splitType === type ? 'active' : ''}`}
                onClick={() => setSplitType(type)}
              >
                {SPLIT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          <div className="split-list">
            {members.map(m => (
              <div key={m.id} className="split-row">
                <label className="flex items-center gap-sm" style={{ flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={!!splitMembers[m.id]}
                    onChange={e => setSplitMembers({ ...splitMembers, [m.id]: e.target.checked })}
                  />
                  <span className="body-md">{m.name}</span>
                </label>
                {splitType !== SPLIT_TYPES.EQUAL && splitMembers[m.id] && (
                  <input
                    className="input"
                    type="number"
                    placeholder={splitType === SPLIT_TYPES.PERCENTAGE ? '%' : splitType === SPLIT_TYPES.EXACT ? 'Amount' : 'Ratio'}
                    value={splitValues[m.id] || ''}
                    onChange={e => setSplitValues({ ...splitValues, [m.id]: e.target.value })}
                    style={{ width: '100px' }}
                    min="0"
                    step="0.01"
                  />
                )}
                <span className="body-sm text-muted" style={{ width: '80px', textAlign: 'right' }}>
                  {splitMembers[m.id] ? formatCurrency(getSplitAmount(m.id), currency) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading} id="btn-submit-expense">
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>

      <style>{`
        .expense-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          padding-bottom: var(--space-xl);
        }

        .category-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .category-option {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: var(--surface-container-highest);
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          color: var(--on-surface-variant);
          font-family: var(--font-body);
          font-size: 0.8125rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .category-option:hover {
          background: var(--surface-bright);
        }

        .category-option.active {
          border-color: var(--primary-container);
          background: rgba(124, 58, 237, 0.15);
          color: var(--primary);
        }

        .split-type-row {
          display: flex;
          gap: 4px;
          background: var(--surface-container-lowest);
          border-radius: var(--radius-full);
          padding: 4px;
        }

        .split-type-btn {
          flex: 1;
          padding: 8px 4px;
          border: none;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--on-surface-variant);
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .split-type-btn.active {
          background: var(--primary-container);
          color: var(--on-primary);
        }

        .payer-list,
        .split-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .payer-row,
        .split-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: var(--surface-container-high);
          border-radius: var(--radius-sm);
        }

        input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--primary-container);
          cursor: pointer;
        }

        input[type="date"] {
          color-scheme: dark;
        }
      `}</style>
    </div>
  )
}
