import { http, HttpResponse } from "msw"
import { users, accounts, transactions } from "./data"

function getUserFromRequest(request: Request) {
  const header = request.headers.get("Authorization")
  const token = header?.replace("Bearer ", "")
  const userId = token?.replace("fake-jwt-", "")
  return users.find((u) => u.id === userId)
}


export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string }
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user
    return HttpResponse.json({ token: `fake-jwt-${user.id}`, user: safeUser })
  }),

  http.get("/api/auth/me", ({ request }) => {
    const header = request.headers.get("Authorization")
    const token = header?.replace("Bearer ", "")
    const userId = token?.replace("fake-jwt-", "")
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user
    return HttpResponse.json(safeUser)
  }),

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
]