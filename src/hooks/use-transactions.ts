import { useQuery } from "@tanstack/react-query"
import { getTransactions } from "@/api/transaction"

export function useTransactions(accountId: string | undefined) {
  return useQuery({
    queryKey: ["transactions", accountId],
    queryFn: () => getTransactions(accountId!),
    enabled: !!accountId,
  })
}
