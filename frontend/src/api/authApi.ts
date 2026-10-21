const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface OwnerRegistrationPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  college?: string;
  hostel?: string;
  avatarUrl?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface ApiUserResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  college?: string;
  hostel?: string;
  avatarUrl?: string;
}

export interface AuthApiResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: ApiUserResponse;
}

export interface StandardApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Register Mess Owner with Spring Boot backend API.
 */
export async function registerOwnerApi(payload: OwnerRegistrationPayload): Promise<StandardApiResponse<AuthApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/auth/register/owner`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Owner registration failed.');
  }
  return data;
}

/**
 * Authenticate Mess Owner / User with Spring Boot backend API.
 */
export async function loginApi(payload: LoginPayload): Promise<StandardApiResponse<AuthApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Authentication failed. Please verify credentials.');
  }
  return data;
}

/**
 * Retrieve currently authenticated user account from backend.
 */
export async function getCurrentUserApi(token: string): Promise<StandardApiResponse<ApiUserResponse>> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve current user.');
  }
  return data;
}
