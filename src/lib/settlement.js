/**
 * Minimum Transaction Settlement Algorithm
 * 
 * Given a list of expenses with payers and splits, calculates the minimum
 * number of transactions needed to settle all debts.
 * 
 * All amounts are converted to INR using each expense's conversion_rate.
 */

/**
 * Calculate net balance for each member across all expenses.
 * Positive = creditor (is owed), Negative = debtor (owes).
 * 
 * @param {Array} expenses - List of expenses with payers and splits
 * @returns {Map<string, {memberId, name, balance}>} Net balance per member
 */
export function calculateNetBalances(expenses, members) {
  const balances = new Map()

  // Initialize all members with 0 balance
  members.forEach(member => {
    balances.set(member.id, {
      memberId: member.id,
      name: member.name,
      balance: 0
    })
  })

  expenses.forEach(expense => {
    const rate = expense.conversion_rate || 1

    // Support both field names (DB uses expense_payers, localStorage uses payers)
    const payers = expense.expense_payers || expense.payers || []
    const splits = expense.expense_splits || expense.splits || []

    // Add what each person paid (converted to INR)
    payers.forEach(payer => {
      const entry = balances.get(payer.member_id)
      if (entry) {
        entry.balance += payer.amount_paid * rate
      }
    })

    // Subtract what each person owes (converted to INR)
    splits.forEach(split => {
      const entry = balances.get(split.member_id)
      if (entry) {
        entry.balance -= split.amount_owed * rate
      }
    })
  })

  return balances
}

/**
 * Compute minimum transactions to settle all debts.
 * Uses greedy algorithm: match largest debtor with largest creditor.
 * 
 * @param {Map} balances - Output of calculateNetBalances
 * @returns {Array<{from, to, amount}>} List of minimum transactions
 */
export function calculateSettlement(balances) {
  const EPSILON = 0.01 // Rounding tolerance

  // Separate into debtors and creditors
  const debtors = []
  const creditors = []

  balances.forEach(({ memberId, name, balance }) => {
    if (balance < -EPSILON) {
      debtors.push({ memberId, name, balance: Math.abs(balance) })
    } else if (balance > EPSILON) {
      creditors.push({ memberId, name, balance })
    }
  })

  // Sort by amount descending
  debtors.sort((a, b) => b.balance - a.balance)
  creditors.sort((a, b) => b.balance - a.balance)

  const transactions = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.balance, creditor.balance)

    if (amount > EPSILON) {
      transactions.push({
        from: { memberId: debtor.memberId, name: debtor.name },
        to: { memberId: creditor.memberId, name: creditor.name },
        amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
      })
    }

    debtor.balance -= amount
    creditor.balance -= amount

    if (debtor.balance < EPSILON) i++
    if (creditor.balance < EPSILON) j++
  }

  return transactions
}

/**
 * Full settlement computation from raw expense data.
 * 
 * @param {Array} expenses - Expenses with nested payers and splits
 * @param {Array} members - Group members
 * @returns {{ balances: Map, transactions: Array }}
 */
export function computeSettlement(expenses, members) {
  const balances = calculateNetBalances(expenses, members)
  const transactions = calculateSettlement(balances)
  return { balances, transactions }
}
