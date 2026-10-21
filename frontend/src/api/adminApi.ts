/**
 * Administrative API client for MessMap.
 * Strictly communicates with Spring Boot /api/v1/admin endpoints using genuine JWT Bearer authentication.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export class UnauthorizedError extends Error {
  constructor(message = 'Session expired or invalid. Please sign in again.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Access denied. Administrator privileges required.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export interface StandardApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeMesses: number;
  approvedMesses?: number;
  pendingVerification: number;
  pendingMesses?: number;
  suspendedMesses: number;
  totalMesses: number;
}

export interface AdminMess {
  id: number;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  foodType: 'PURE_VEG' | 'VEG_NON_VEG' | 'JAIN';
  dailyPrice?: number;
  monthlyPrice?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  operatingStatus?: 'OPEN' | 'CLOSED';
  openingTime?: string;
  closingTime?: string;
  rejectionReason?: string;
  heroImage?: string;
  capacity?: number;
  ownerId?: number;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'ROLE_STUDENT' | 'ROLE_MESS_OWNER' | 'ROLE_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  college?: string;
  hostel?: string;
  avatarUrl?: string;
  dietaryPreference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * Base fetch wrapper enforcing Bearer JWT headers and distinctive 401/403 status handling.
 */
async function adminFetch<T>(endpoint: string, options: RequestInit = {}, token?: string): Promise<StandardApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const activeToken = token || localStorage.getItem('messmap_auth_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Clear potentially corrupted or expired token
    localStorage.removeItem('messmap_auth_token');
    throw new UnauthorizedError('Administrative session has expired. Please log in again.');
  }

  if (response.status === 403) {
    // Forbidden: Do NOT treat as expired session, but report permission block
    throw new ForbiddenError('You lack administrative authority to perform this operation.');
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Fetch platform-wide dashboard metrics (Total Users, Verified Messes, Pending Approvals, Suspended Messes).
 */
export async function getAdminMetricsApi(token?: string): Promise<StandardApiResponse<AdminDashboardMetrics>> {
  return adminFetch<AdminDashboardMetrics>('/admin/metrics', { method: 'GET' }, token);
}

/**
 * Fetch all messes with optional status filtering.
 */
export async function getAdminMessesApi(status?: string, token?: string): Promise<StandardApiResponse<AdminMess[]>> {
  const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
  return adminFetch<AdminMess[]>(`/admin/messes${query}`, { method: 'GET' }, token);
}

/**
 * Fetch messes specifically in PENDING status awaiting moderation.
 */
export async function getPendingMessesApi(token?: string): Promise<StandardApiResponse<AdminMess[]>> {
  return adminFetch<AdminMess[]>('/admin/messes/pending', { method: 'GET' }, token);
}

/**
 * Approve a pending mess listing.
 */
export async function approveMessApi(messId: number | string, token?: string): Promise<StandardApiResponse<AdminMess>> {
  return adminFetch<AdminMess>(`/admin/messes/${messId}/approve`, { method: 'POST' }, token);
}

/**
 * Reject a mess listing with mandatory justification.
 */
export async function rejectMessApi(messId: number | string, reason: string, token?: string): Promise<StandardApiResponse<AdminMess>> {
  return adminFetch<AdminMess>(`/admin/messes/${messId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }, token);
}

/**
 * Suspend an active mess listing.
 */
export async function suspendMessApi(messId: number | string, reason?: string, token?: string): Promise<StandardApiResponse<AdminMess>> {
  return adminFetch<AdminMess>(`/admin/messes/${messId}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || 'Administrative non-compliance suspension' }),
  }, token);
}

/**
 * Unsuspend and restore a previously suspended mess listing.
 */
export async function unsuspendMessApi(messId: number | string, token?: string): Promise<StandardApiResponse<AdminMess>> {
  return adminFetch<AdminMess>(`/admin/messes/${messId}/unsuspend`, { method: 'POST' }, token);
}

/**
 * Fetch user directory with pagination and optional role/status filters.
 */
export async function getAdminUsersApi(
  params?: { role?: string; status?: string; page?: number; size?: number },
  token?: string
): Promise<StandardApiResponse<PagedResponse<AdminUser>>> {
  const searchParams = new URLSearchParams();
  if (params?.role && params.role !== 'All') searchParams.append('role', params.role);
  if (params?.status && params.status !== 'All') searchParams.append('status', params.status);
  if (params?.page !== undefined) searchParams.append('page', String(params.page));
  if (params?.size !== undefined) searchParams.append('size', String(params.size));

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return adminFetch<PagedResponse<AdminUser>>(`/admin/users${query}`, { method: 'GET' }, token);
}

/**
 * Update an account's operational status (e.g. ACTIVE <-> SUSPENDED).
 */
export async function updateUserStatusApi(
  userId: number | string,
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION',
  reason?: string,
  token?: string
): Promise<StandardApiResponse<AdminUser>> {
  return adminFetch<AdminUser>(`/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason }),
  }, token);
}
