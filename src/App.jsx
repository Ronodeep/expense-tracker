import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import AddExpense from './pages/AddExpense'
import ExpensesList from './pages/ExpensesList'
import Settlement from './pages/Settlement'
import Charts from './pages/Charts'

export default function App() {
  return (
    <Routes>
      {/* Home — module selector */}
      <Route path="/" element={<Home />} />

      {/* SplitKaro — create/join group */}
      <Route path="/splitkaro" element={<Landing />} />

      {/* Group routes — with bottom nav */}
      <Route path="/group/:groupId" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<ExpensesList />} />
        <Route path="add" element={<AddExpense />} />
        <Route path="settlement" element={<Settlement />} />
        <Route path="charts" element={<Charts />} />
      </Route>
    </Routes>
  )
}
