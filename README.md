# FinDash — Personal Finance Dashboard

A client-side React SPA simulating an online banking portal. Built as a technical demonstration covering React, TypeScript, REST API integration, domain-driven business rules, role-based access control, and unit testing.

## Live Demo

[Deployed on Vercel →](#) _(coming soon)_

**Test credentials:**

| Role   | Email            | Password   |
| ------ | ---------------- | ---------- |
| Client | `client@bank.ma` | `password` |
| Admin  | `admin@bank.ma`  | `password` |

## Features

**Client portal:**

- Account overview with real-time balance (Compte courant + Épargne)
- Transaction history with sorting and filtering (by type, category)
- Spending breakdown chart by category
- Transfer between accounts with business rule validation
- Deposit funds
- Cancel pending transactions

**Admin panel:**

- View all clients and their accounts
- Freeze, reactivate, or close any account
- Access any client's transaction history

**Business rules enforced:**

- Frozen/closed accounts block all operations
- Savings accounts cannot go into overdraft
- Transfers to the same account are rejected
- Only pending transactions can be cancelled
- Access control enforced at API level (not just UI)

## Architecture

```
src/
├── api/              # Axios instance + typed service functions
├── components/
│   ├── account/      # Account detail, transaction table, forms
│   ├── dashboard/    # Account cards, spending chart
│   ├── forms/        # Login form
│   ├── layout/       # Dashboard shell with nav
│   └── ui/           # shadcn/ui components
├── hooks/            # TanStack Query hooks (useAccounts, useTransactions, useAnalytics)
├── lib/              # Business rules as pure functions (transaction-rules.ts)
├── mocks/            # MSW handlers + mock data (simulates REST API)
├── pages/            # Route-level page components
├── stores/           # Zustand auth store
└── types/            # Shared TypeScript types (domain entities)
```

### Design decisions

**Business logic separated from React.** Domain rules (account validation, transfer constraints, cancellation rules) live in `src/lib/` as pure TypeScript functions with zero framework dependencies. This makes them independently testable, reusable, and easy to reason about.

**Two layers of validation.** Zod validates form structure (is the input well-formed?). Domain rule functions validate business constraints (is this operation permitted given the current state?). Components only handle rendering.

**MSW as the API layer.** Mock Service Worker intercepts HTTP requests in the browser, simulating a real REST API with authentication, authorization, and proper HTTP status codes (401, 403, 404). The frontend is fully decoupled from any backend — the same code would work against a real API by removing MSW and pointing Axios at the real server.

**Access control at the API level.** Every mock endpoint checks authentication and authorization. A client requesting another client's data receives a 403 Forbidden — the security isn't just hidden buttons in the UI.

**Money stored in centimes.** All amounts are integers representing centimes (1 MAD = 100 centimes) to avoid floating-point precision errors. Formatting to human-readable values happens only at the display layer.

## Tech stack

| Layer         | Technology                     |
| ------------- | ------------------------------ |
| Framework     | React 19 + Vite                |
| Language      | TypeScript (strict mode)       |
| Routing       | React Router                   |
| Server state  | TanStack Query                 |
| Client state  | Zustand                        |
| Data tables   | TanStack Table                 |
| Forms         | React Hook Form + Zod          |
| Charts        | Recharts                       |
| UI components | shadcn/ui + Tailwind CSS       |
| API mocking   | MSW (Mock Service Worker)      |
| Testing       | Vitest + React Testing Library |
| Code quality  | ESLint + SonarCloud            |

## Getting started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm vitest run

# Run tests with coverage
pnpm vitest run --coverage
```

## Testing

Business rules are tested as pure functions — no React rendering, no DOM simulation, just input and output.

```bash
pnpm vitest run
```

```
 ✓ src/lib/__tests__/transaction-rules.test.ts
   ✓ canTransact — active/frozen/closed accounts
   ✓ validateTransfer — normal, frozen source, closed destination,
     same account, zero amount, savings overdraft
   ✓ validateDeposit — normal, frozen, closed, zero amount
   ✓ canCancelTransaction — pending vs non-pending
```

## API contract

| Method | Endpoint                         | Description                             |
| ------ | -------------------------------- | --------------------------------------- |
| POST   | `/api/auth/login`                | Authenticate with email/password        |
| GET    | `/api/auth/me`                   | Get current user from token             |
| GET    | `/api/accounts`                  | List accounts (client: own, admin: all) |
| GET    | `/api/accounts/:id`              | Account detail                          |
| GET    | `/api/accounts/:id/transactions` | Transaction history with filters        |
| GET    | `/api/accounts/:id/analytics`    | Spending breakdown by category          |
| POST   | `/api/transactions/transfer`     | Create transfer between accounts        |
| POST   | `/api/transactions/deposit`      | Create deposit                          |
| PATCH  | `/api/transactions/:id/cancel`   | Cancel pending transaction              |
| GET    | `/api/users`                     | List clients (admin only)               |
| PATCH  | `/api/accounts/:id/status`       | Freeze/close/reactivate (admin only)    |
