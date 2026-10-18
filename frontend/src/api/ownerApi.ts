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

export interface CreateMessPayload {
  name: string;
  description?: string;
  address: string;
  locality?: string;
  area?: string;
  city: string;
  state?: string;
  pincode?: string;
  phone?: string;
  contact?: string;
  contactNumber?: string;
  email?: string;
  foodType?: string;
  monthlyPrice?: number;
  dailyPrice?: number;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  heroImage?: string;
  breakfastTiming?: string;
  lunchTiming?: string;
  dinnerTiming?: string;
  facilityIds?: number[];
  amenities?: string[];
}

export interface UpdateMessProfilePayload {
  name?: string;
  description?: string;
  address?: string;
  locality?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  contact?: string;
  contactNumber?: string;
  email?: string;
  foodType?: string;
  monthlyPrice?: number;
  dailyPrice?: number;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  heroImage?: string;
  operatingStatus?: string;
  facilityIds?: number[];
  amenities?: string[];
}

export interface UpdateMessTimingsPayload {
  breakfastTiming?: string;
  breakfast?: string;
  lunchTiming?: string;
  lunch?: string;
  dinnerTiming?: string;
  dinner?: string;
  openingTime?: string;
  closingTime?: string;
  daysActive?: string;
}

export interface UpdateMessAmenitiesPayload {
  facilityIds?: number[];
  amenities?: string[];
}

export interface FacilityItem {
  id: number;
  name: string;
  icon?: string;
}

export interface OwnerMessProfileResponse {
  id: number;
  ownerId: number;
  ownerName?: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address: string;
  area?: string;
  city: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  foodType: string;
  dailyPrice?: number;
  monthlyPrice?: number;
  status: string;
  operatingStatus: string;
  openingTime?: string;
  closingTime?: string;
  breakfastTiming?: string;
  lunchTiming?: string;
  dinnerTiming?: string;
  mealTimings?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  facilities?: FacilityItem[];
  amenities?: string[];
  heroImage?: string;
  capacity?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create a new mess profile listing.
 */
export async function createMessApi(
  token: string,
  payload: CreateMessPayload
): Promise<StandardApiResponse<OwnerMessProfileResponse>> {
  const response = await fetch(`${API_BASE_URL}/owner/mess`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create mess profile.');
  }
  return data;
}

/**
 * Retrieve the authenticated owner's primary mess profile.
 */
export async function getOwnerMessApi(token: string): Promise<StandardApiResponse<OwnerMessProfileResponse>> {
  const response = await fetch(`${API_BASE_URL}/owner/mess`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch owner mess profile.');
  }
  return data;
}

/**
 * Update general mess profile attributes.
 */
export async function updateOwnerMessProfileApi(
  token: string,
  payload: UpdateMessProfilePayload,
  messId?: number
): Promise<StandardApiResponse<OwnerMessProfileResponse>> {
  const url = messId ? `${API_BASE_URL}/owner/mess/${messId}` : `${API_BASE_URL}/owner/mess/profile`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update mess profile.');
  }
  return data;
}

/**
 * Update operating timings for Breakfast, Lunch, and Dinner.
 */
export async function updateMessTimingsApi(
  token: string,
  payload: UpdateMessTimingsPayload,
  messId?: number
): Promise<StandardApiResponse<OwnerMessProfileResponse>> {
  const url = messId ? `${API_BASE_URL}/owner/mess/${messId}/timings` : `${API_BASE_URL}/owner/mess/timings`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update mess timings.');
  }
  return data;
}

/**
 * Update amenities and facility highlights.
 */
export async function updateMessAmenitiesApi(
  token: string,
  payload: UpdateMessAmenitiesPayload,
  messId?: number
): Promise<StandardApiResponse<OwnerMessProfileResponse>> {
  const url = messId ? `${API_BASE_URL}/owner/mess/${messId}/amenities` : `${API_BASE_URL}/owner/mess/amenities`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update mess amenities.');
  }
  return data;
}
