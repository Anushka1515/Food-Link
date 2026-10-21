import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/api";

export async function testBackend() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  return response.json();
}

export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = await SecureStore.getItemAsync("access_token");

  if (!token) {
    throw new Error("You are not logged in");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data;
}