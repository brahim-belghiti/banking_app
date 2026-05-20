import api from "./axios"
import type { DepositRequest, Transaction, TransactionCategory, TransactionType, TransferRequest } from "@/types"

type TransactionFilters = {
  dateFrom?: string
  dateTo?: string
  category?: TransactionCategory
  type?: TransactionType
}

export async function getTransactions(accountId: string, filters?: TransactionFilters): Promise<Transaction[]> {
  const { data } = await api.get<Transaction[]>(`/accounts/${accountId}/transactions`, { params: filters })
  return data
}

export async function createTransfer(payload: TransferRequest): Promise<Transaction> {
  const { data } = await api.post<Transaction>("/transactions/transfer", payload)
  return data
}

export async function createDeposit(payload: DepositRequest): Promise<Transaction> {
  const { data } = await api.post<Transaction>("/transactions/deposit", payload)
  return data
}

export async function cancelTransaction(id: string): Promise<Transaction> {
  const { data } = await api.patch<Transaction>(`/transactions/${id}/cancel`)
  return data
}