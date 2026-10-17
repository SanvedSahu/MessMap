const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface OwnerMessSummary {
  id: number;
  name: string;
  description?: string;
  address?: string;
  area?: string;
  city?: string;
  foodType?: string;
  monthlyPrice?: number;
  dailyPrice?: number;
  status?: string;
  operatingStatus?: string;
  openingTime?: string;
  closingTime?: string;
  heroImage?: string;
}

export interface OwnerProfileApiResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  college?: string;
  hostel?: string;
  avatarUrl?: string;
  messes?: OwnerMessSummary[];
}

export interface OwnerProfileUpdatePayload {
  name: string;
  phone?: string;
  college?: string;
  hostel?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface StandardApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Retrieve authenticated mess owner profile from backend.
 */
export async function getOwnerProfileApi(token: string): Promise<StandardApiResponse<OwnerProfileApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/owner/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch owner profile.');
  }
  return data;
}

/**
 * Update authenticated mess owner profile in backend.
 */
export async function updateOwnerProfileApi(
  token: string,
  payload: OwnerProfileUpdatePayload
): Promise<StandardApiResponse<OwnerProfileApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/owner/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update owner profile.');
  }
  return data;
}

/**
 * Change authenticated mess owner password in backend.
 */
export async function changeOwnerPasswordApi(
  token: string,
  payload: ChangePasswordPayload
): Promise<StandardApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/owner/profile/password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to change password.');
  }
  return data;
}
