import { http, HttpResponse } from "msw"
import { users, accounts, transactions } from "./data"
import type { Transaction } from "@/types"

function getUserFromRequest(request: Request) {
  const header = request.headers.get("Authorization")
  const token = header?.replace("Bearer ", "")
  const userId = token?.replace("fake-jwt-", "")
  return users.find((u) => u.id === userId)
}


export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string }
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user
    return HttpResponse.json({ token: `fake-jwt-${user.id}`, user: safeUser })
  }),

  http.get("/api/auth/me", ({ request }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
    const { password: _, ...safeUser } = user
    return HttpResponse.json(safeUser)
  }),

  http.get("/api/accounts", ({ request }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })

    const userAccounts = user.role === "admin"
      ? accounts
      : accounts.filter((a) => a.userId === user.id)

    return HttpResponse.json(userAccounts)
  }),

  http.get("/api/accounts/:id", ({ request, params }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })

    const account = accounts.find((a) => a.id === params.id)
    if (!account) return HttpResponse.json({ message: "Not found" }, { status: 404 })
    if (user.role !== "admin" && account.userId !== user.id) {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    return HttpResponse.json(account)
  }),
  http.get("/api/accounts/:id/transactions", ({ request, params }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })

    const account = accounts.find((a) => a.id === params.id)
    if (!account) return HttpResponse.json({ message: "Not found" }, { status: 404 })
    if (user.role !== "admin" && account.userId !== user.id) {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const accountTx = transactions.filter(
      (t) => t.fromAccountId === params.id || t.toAccountId === params.id
    )

    return HttpResponse.json(accountTx)
  }),

  http.get("/api/accounts/:id/analytics", ({ request, params }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })

    const account = accounts.find((a) => a.id === params.id)
    if (!account) return HttpResponse.json({ message: "Not found" }, { status: 404 })
    if (user.role !== "admin" && account.userId !== user.id) {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const url = new URL(request.url)
    const period = url.searchParams.get("period") || "month"

    const outgoing = transactions.filter(
      (t) => t.fromAccountId === params.id && t.status === "completed"
    )
    const totalSpent = outgoing.reduce((sum, t) => sum + t.amount, 0)

    const categoryTotals = outgoing.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

    const breakdown = Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      percentage: totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0,
    }))

    const totalIncome = transactions
      .filter((t) => t.toAccountId === params.id && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0)

    return HttpResponse.json({
      accountId: params.id,
      period,
      totalSpent,
      totalIncome,
      breakdown,
    })
  }),
  http.post("/api/transactions/transfer", async ({ request }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })

    const body = await request.json() as {
      fromAccountId: string
      toAccountId: string
      amount: number
      label: string
      category: string
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amount: body.amount,
      currency: "MAD",
      type: "transfer",
      category: body.category as Transaction["category"],
      label: body.label,
      status: body.fromAccountId.startsWith("acc-") && body.toAccountId.startsWith("acc-")
        ? "completed" : "pending",
      reference: `REF-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }

    transactions.push(newTx)
    return HttpResponse.json(newTx, { status: 201 })
  }),

  http.post("/api/transactions/deposit", async ({ request }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })

    const body = await request.json() as {
      toAccountId: string
      amount: number
      label: string
      category: string
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      fromAccountId: null,
      toAccountId: body.toAccountId,
      amount: body.amount,
      currency: "MAD",
      type: "deposit",
      category: body.category as Transaction["category"],
      label: body.label,
      status: "completed",
      reference: `REF-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }

    transactions.push(newTx)
    return HttpResponse.json(newTx, { status: 201 })
  }),

  http.get("/api/users", ({ request }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
    if (user.role !== "admin") return HttpResponse.json({ message: "Forbidden" }, { status: 403 })

    const safeUsers = users
      .filter((u) => u.role === "client")
      .map(({ password: _, ...u }) => u)

    return HttpResponse.json(safeUsers)
  }),

  http.patch("/api/accounts/:id/status", async ({ request, params }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
    if (user.role !== "admin") return HttpResponse.json({ message: "Forbidden" }, { status: 403 })

    const { status } = await request.json() as { status: string }
    const account = accounts.find((a) => a.id === params.id)
    if (!account) return HttpResponse.json({ message: "Not found" }, { status: 404 })

    account.status = status as typeof account.status
    return HttpResponse.json(account)
  }),
  http.patch("/api/transactions/:id/cancel", ({ request, params }) => {
    const user = getUserFromRequest(request)
    if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })

    const tx = transactions.find((t) => t.id === params.id)
    if (!tx) return HttpResponse.json({ message: "Not found" }, { status: 404 })
    if (tx.status !== "pending") {
      return HttpResponse.json({ message: "Seules les transactions en attente peuvent être annulées" }, { status: 400 })
    }

    tx.status = "cancelled"
    return HttpResponse.json(tx)
  })
]