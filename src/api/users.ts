import type { User } from "@/types"
import api from "./axios"

async function getUsers(): Promise<User[]> {
    const { data } = await api.get<User[]>("/users")
    return data
}

export { getUsers };