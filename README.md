# 💸 ExpenseTracker — SplitKaro

A zero-cost, group expense splitting web app. Think Splitwise, but self-hosted and free forever.

**SplitKaro** is the first module of the ExpenseTracker platform — it lets groups of friends track shared expenses during trips, dinners, or events and settle debts with the fewest transactions possible.

---

## ✨ Features

### SplitKaro (Live)
- **Smart Splitting** — Split by Equal, Ratio, Percentage, or Exact amounts
- **Multi-Currency** — Add expenses in any currency with manual conversion rates
- **Multi-Payer** — Support for expenses paid by multiple people
- **Minimum Transaction Settlement** — Greedy algorithm minimizes the number of transfers
- **Analytics Dashboard** — Pie charts (by category), bar charts (who paid), per-person shares
- **Shareable Group Codes** — Share a code and friends can join instantly
- **No Sign-up Required** — Name-based identity for the MVP

### Personal Tracker (Coming Soon)
- Individual expense log
- Monthly/weekly calendar views
- Tags, labels, and recurring expenses

---

## 🛠 Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Vite + React 18 | Free |
| Routing | React Router v6 | Free |
| Charts | Recharts | Free |
| Styling | Vanilla CSS (design tokens) | Free |
| Database | localStorage (Supabase schema ready) | Free |
| Hosting | GitHub Pages (static SPA) | Free |
| **Total** | | **$0/month** |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

### Build & Deploy for Production

```bash
# Push to the gh-pages branch
npm run deploy
```

---

## 📁 Project Structure

```
expense-tracker/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                    # App entry
│   ├── App.jsx                     # Router setup
│   ├── index.css                   # Design system tokens + global styles
│   ├── lib/
│   │   ├── storage.js              # Centralized localStorage layer
│   │   ├── settlement.js           # Min-transaction algorithm
│   │   ├── currency.js             # Currency conversion helpers
│   │   ├── constants.js            # App-wide constants
│   │   └── supabase.js             # Supabase client init
│   ├── hooks/
│   │   └── useGroup.js             # Group data loading hook
│   ├── components/
│   │   ├── Layout.jsx              # App shell + bottom nav
│   │   ├── MemberAvatar.jsx        # Colored initials circle
│   │   └── Copyright.jsx           # Copyright footer
│   ├── pages/
│   │   ├── Home.jsx                # Module selector (SplitKaro + coming soon)
│   │   ├── Landing.jsx             # SplitKaro — create/join group
│   │   ├── Dashboard.jsx           # Group overview
│   │   ├── AddExpense.jsx          # Add expense form
│   │   ├── ExpensesList.jsx        # All expenses in group
│   │   ├── Settlement.jsx          # Who owes whom
│   │   └── Charts.jsx              # Analytics & visualizations
│   └── data/
│       └── categories.js           # Predefined category list
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🧮 Settlement Algorithm

The app uses a **greedy minimum-transaction** algorithm:

1. Calculate **net balance** for each member: `net = total_paid - total_owed`
2. Separate into **debtors** (net < 0) and **creditors** (net > 0)
3. Sort both lists by absolute value (descending)
4. Greedy match: take the largest debtor and largest creditor, transfer `min(|debtor|, creditor)`
5. Repeat until all balances are settled

All amounts are converted to INR using the expense's conversion rate before calculation.

---

## 🎨 Design System — "Nexus Slate"

| Token | Value |
|-------|-------|
| Theme | Dark mode with glassmorphism |
| Primary | `#7C3AED` (Purple) |
| Secondary | `#10B981` (Green — positive amounts) |
| Error | `#ffb4ab` (Red — negative amounts) |
| Fonts | Manrope (headlines), Inter (body) |
| Background | `#0b1326` (Deep navy) |

---

## 🗺 Roadmap

| Version | Feature | Status |
|---------|---------|--------|
| V1 (MVP) | SplitKaro — Group Expense Splitting | ✅ Live |
| V2 | Authentication (Supabase OAuth) | 📋 Planned |
| V3 | Personal Expense Tracking | 📋 Planned |
| V4 | Smart Features (OCR, Live Rates) | 💡 Future |
| V5 | Social (Notifications, WhatsApp) | 💡 Future |
| V6 | Budgets & Goals | 💡 Future |
| V7 | Exports & Integrations | 💡 Future |
| V8 | Mobile App (PWA/React Native) | 💡 Future |

---

## 📝 Decision Log

| Decision | Why |
|----------|-----|
| Name-based identity (no auth) | Simplest MVP; auth deferred to V2 |
| localStorage for MVP | Zero cost, instant; Supabase schema ready for migration |
| Vite + React | No SSR needed, simplest SPA deployment |
| Static currency conversion | Zero cost, user controls the rate |
| Recharts | React-native, declarative API, lightweight |
| GitHub Pages hosting | Seamless Git integration, zero configuration and completely free |

---

## 📄 License

MIT

---

Built with ❤️ by [Ronodeep](https://github.com/YOUR_USERNAME)
