import { useQuery } from "@tanstack/react-query"
import { getAnalytics } from "@/api/analytics"

export function useAnalytics(accountId: string | undefined, period: string = "month") {
    return useQuery({
        queryKey: ["analytics", accountId, period],
        queryFn: () => getAnalytics(accountId!, period),
        enabled: !!accountId,
    })
}