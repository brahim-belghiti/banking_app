import type { AuthResponse, Credential, User } from "../types"
import api from "./axios"

export async function login(credentials: Credential): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", credentials)
  return data
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout")
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me")
  return data
}