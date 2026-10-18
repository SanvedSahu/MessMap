const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export type DietaryPreference = 'VEG' | 'NON_VEG' | 'BOTH';

export interface StudentRegistrationPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  college?: string;
  hostel?: string;
  dietaryPreference?: DietaryPreference;
}

export interface StudentLoginPayload {
  email: string;
  password?: string;
}

export interface StudentProfileApiResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  college?: string;
  collegeOrLocality?: string;
  hostel?: string;
  dietaryPreference: DietaryPreference;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProfileUpdatePayload {
  name?: string;
  phone?: string;
  college?: string;
  collegeOrLocality?: string;
  hostel?: string;
  dietaryPreference?: DietaryPreference;
  avatarUrl?: string;
}

export interface AuthApiResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: StudentProfileApiResponse;
}

export interface StandardApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Register a new Student account with Spring Boot backend API.
 * POST /api/auth/student/register (or /api/v1/auth/student/register)
 */
export async function registerStudentApi(payload: StudentRegistrationPayload): Promise<StandardApiResponse<AuthApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Student registration failed.');
  }
  return data;
}

/**
 * Authenticate student credentials with Spring Boot backend API.
 * POST /api/auth/student/login (or /api/v1/auth/student/login)
 */
export async function loginStudentApi(payload: StudentLoginPayload): Promise<StandardApiResponse<AuthApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
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
 * Retrieve authenticated student's profile information from backend.
 * GET /api/student/profile (or /api/v1/student/profile)
 */
export async function getStudentProfileApi(token: string): Promise<StandardApiResponse<StudentProfileApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/student/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve student profile.');
  }
  return data;
}

/**
 * Update authenticated student's profile information with backend.
 * PUT /api/student/profile (or /api/v1/student/profile)
 */
export async function updateStudentProfileApi(
  token: string,
  payload: StudentProfileUpdatePayload
): Promise<StandardApiResponse<StudentProfileApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/student/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update student profile.');
  }
  return data;
}
