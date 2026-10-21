import { API_BASE_URL } from "../config/api";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "donor" | "ngo" | "volunteer";
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: User;
};


export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  console.log("LOGIN URL:", `${API_BASE_URL}/auth/login`);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("LOGIN HTTP STATUS:", response.status);
  } catch (error) {
    console.error("LOGIN NETWORK ERROR:", error);
    throw error;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}


export async function register(
  name: string,
  email: string,
  password: string,
  role: "donor" | "ngo" | "volunteer"
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  return data;
}