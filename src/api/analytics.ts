import type { AnalyticsResponse } from "@/types"
import api from "./axios"

export async function getAnalytics(accountId: string, period: string = "month"): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>(`/accounts/${accountId}/analytics`, {
    params: { period }
  })
  return data
}