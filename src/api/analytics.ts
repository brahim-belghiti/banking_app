import api from "./axios";

export async function getAnalytics(accountId: string, period: string): Promise<any> {
    const { data } = await api.get(`/accounts/${accountId}/analytics`, { params: { period } })
    return data
}