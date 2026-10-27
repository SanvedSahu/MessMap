const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface OwnerMessSummary {
  id: number;
  name: string;
  description?: string;
  address?: string;
  area?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  foodType?: string;
  monthlyPrice?: number;
  dailyPrice?: number;
  status?: string;
  operatingStatus?: string;
  openingTime?: string;
  closingTime?: string;
  heroImage?: string;
  rejectionReason?: string;
  removalReason?: string;
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
  rejectionReason?: string;
  removalReason?: string;
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
 * Retrieve all messes owned by the authenticated owner.
 */
export async function getOwnerMessesApi(token: string): Promise<StandardApiResponse<OwnerMessProfileResponse[]>> {
  const response = await fetch(`${API_BASE_URL}/owner/messes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch owner messes.');
  }
  return data;
}

/**
 * Retrieve a specific mess profile by ID owned by the authenticated owner.
 */
export async function getOwnerMessByIdApi(token: string, messId: number | string): Promise<StandardApiResponse<OwnerMessProfileResponse>> {
  const response = await fetch(`${API_BASE_URL}/owner/mess/${messId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch mess profile.');
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

export interface MenuItemData {
  id: number;
  name: string;
  dishName?: string;
  description?: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' | 'SPECIAL';
  price?: number;
  isAvailable?: boolean;
  dayOfWeek?: string;
  isSpecial?: boolean;
}

export interface CreateMenuItemPayload {
  messId?: number;
  dayOfWeek: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' | 'SPECIAL';
  dishName: string;
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  isSpecial?: boolean;
}

export interface UpdateMenuItemPayload {
  dayOfWeek?: string;
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS' | 'SPECIAL';
  dishName?: string;
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  isSpecial?: boolean;
}

export interface MessPricingData {
  messId?: number;
  messName?: string;
  breakfastPrice?: number;
  lunchPrice?: number;
  dinnerPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
  monthlyPassPrice?: number;
}

export interface UpdateMessPricingPayload {
  messId?: number;
  breakfastPrice?: number;
  lunchPrice?: number;
  dinnerPrice?: number;
  dailyPrice?: number;
  monthlyPrice?: number;
  monthlyPassPrice?: number;
}

export interface DayMenuData {
  dayOfWeek: string;
  meals: Record<string, MenuItemData[]>;
}

export interface OwnerMenuResponseData {
  messId: number;
  messName: string;
  pricing?: MessPricingData;
  groupedMenu?: Record<string, Record<string, MenuItemData[]>>;
  weeklyMenu?: DayMenuData[];
  items?: MenuItemData[];
}

/**
 * Retrieve the owner's menu catalog grouped by day and meal type.
 */
export async function getOwnerMenuApi(
  token: string,
  messId?: number
): Promise<StandardApiResponse<OwnerMenuResponseData>> {
  const url = messId ? `${API_BASE_URL}/owner/mess/${messId}/menu` : `${API_BASE_URL}/owner/mess/menu`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch owner menu.');
  }
  return data;
}

/**
 * Add a new dish to the owner's menu.
 */
export async function createMenuItemApi(
  token: string,
  payload: CreateMenuItemPayload
): Promise<StandardApiResponse<MenuItemData>> {
  const url = payload.messId
    ? `${API_BASE_URL}/owner/mess/${payload.messId}/menu/items`
    : `${API_BASE_URL}/owner/mess/menu/items`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create menu item.');
  }
  return data;
}

/**
 * Update an existing dish in the owner's menu.
 */
export async function updateMenuItemApi(
  token: string,
  id: number,
  payload: UpdateMenuItemPayload
): Promise<StandardApiResponse<MenuItemData>> {
  const response = await fetch(`${API_BASE_URL}/owner/mess/menu/items/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update menu item.');
  }
  return data;
}

/**
 * Delete a dish from the owner's menu.
 */
export async function deleteMenuItemApi(
  token: string,
  id: number
): Promise<StandardApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/owner/mess/menu/items/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete menu item.');
  }
  return data;
}

/**
 * Update meal and monthly pass pricing.
 */
export async function updateMessPricingApi(
  token: string,
  payload: UpdateMessPricingPayload,
  messId?: number
): Promise<StandardApiResponse<MessPricingData>> {
  const url = messId ? `${API_BASE_URL}/owner/mess/${messId}/pricing` : `${API_BASE_URL}/owner/mess/pricing`;
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
    throw new Error(data.message || 'Failed to update mess pricing.');
  }
  return data;
}

export interface MessVerificationStatusData {
  messId: number;
  messName: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'SUSPENDED' | 'REMOVED';
  rejectionReason?: string;
  removalReason?: string;
  adminRemarks?: string;
  canSubmit: boolean;
  missingFields: string[];
  updatedAt?: string;
  createdAt?: string;
}

/**
 * Submit authenticated owner's mess listing for admin verification.
 */
export async function submitMessVerificationApi(
  token: string,
  messId?: number
): Promise<StandardApiResponse<MessVerificationStatusData>> {
  const url = messId
    ? `${API_BASE_URL}/owner/mess/${messId}/submit-verification`
    : `${API_BASE_URL}/owner/mess/submit-verification`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: messId ? JSON.stringify({ messId }) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit mess for verification.');
  }
  return data;
}

/**
 * Retrieve verification status and admin feedback for authenticated owner's mess listing.
 */
export async function getMessVerificationStatusApi(
  token: string,
  messId?: number
): Promise<StandardApiResponse<MessVerificationStatusData>> {
  const url = messId
    ? `${API_BASE_URL}/owner/mess/${messId}/verification-status`
    : `${API_BASE_URL}/owner/mess/verification-status`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch verification status.');
  }
  return data;
}

export interface OwnerSuspensionReviewResponse {
  id: number;
  messId: number;
  messName: string;
  ownerId: number;
  ownerName: string;
  explanation?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Submit owner request for administrative review of a suspended mess listing.
 */
export async function requestSuspensionReviewApi(
  token: string,
  explanation?: string,
  messId?: number
): Promise<StandardApiResponse<OwnerSuspensionReviewResponse>> {
  const url = messId
    ? `${API_BASE_URL}/owner/mess/${messId}/suspension-review`
    : `${API_BASE_URL}/owner/mess/suspension-review`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messId, explanation }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit suspension review request.');
  }
  return data;
}

/**
 * Retrieve suspension review requests for authenticated owner's mess listing.
 */
export async function getOwnerSuspensionReviewsApi(
  token: string,
  messId?: number
): Promise<StandardApiResponse<OwnerSuspensionReviewResponse[]>> {
  const url = messId
    ? `${API_BASE_URL}/owner/mess/${messId}/suspension-reviews`
    : `${API_BASE_URL}/owner/mess/suspension-reviews`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch suspension review requests.');
  }
  return data;
}

// -----------------------------------------------------------------------------
// Issue: Owner Enquiries APIs
// -----------------------------------------------------------------------------

export interface OwnerEnquiryResponse {
  id: number;
  messId: number;
  messName: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentCollege?: string;
  category: string;
  message: string;
  planPreference?: string;
  status: 'NEW' | 'REPLIED';
  replyNotes?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Retrieve enquiries for the authenticated owner's mess.
 * Routes: GET /api/owner/mess/enquiries, GET /api/v1/owner/mess/enquiries
 */
export async function getOwnerEnquiriesApi(
  token: string,
  messId?: number,
  status?: string
): Promise<StandardApiResponse<OwnerEnquiryResponse[]>> {
  const params = new URLSearchParams();
  if (messId) params.append('messId', String(messId));
  if (status) params.append('status', status);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`${API_BASE_URL}/owner/mess/enquiries${qs}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch customer enquiries.');
  }
  return data;
}

/**
 * Reply to or resolve a customer enquiry.
 * Routes: PUT /api/owner/mess/enquiries/{id}/reply, PUT /api/v1/owner/mess/enquiries/{id}/reply
 */
export async function replyOwnerEnquiryApi(
  token: string,
  enquiryId: number | string,
  replyNotes?: string
): Promise<StandardApiResponse<OwnerEnquiryResponse>> {
  const response = await fetch(`${API_BASE_URL}/owner/mess/enquiries/${enquiryId}/reply`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ replyNotes }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update enquiry response.');
  }
  return data;
}

// -----------------------------------------------------------------------------
// Issue: Owner Daily & Weekly Menu APIs
// -----------------------------------------------------------------------------

export interface DailyMealResponse {
  messId: number;
  messName: string;
  dayOfWeek: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  breakfastItems?: any[];
  lunchItems?: any[];
  dinnerItems?: any[];
  meals?: Record<string, any[]>;
}

export interface WeeklyMenuResponse {
  messId: number;
  messName: string;
  weeklySchedule: DailyMealResponse[];
  scheduleByDay: Record<string, DailyMealResponse>;
}

export interface UpdateDailyMealPayload {
  messId?: number;
  dayOfWeek: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  dishes: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  isSpecial?: boolean;
}

/**
 * Update daily meal menu for Breakfast, Lunch, or Dinner.
 * Routes: PUT /api/owner/mess/daily-menu, PUT /api/v1/owner/mess/daily-menu
 */
export async function updateDailyMealMenuApi(
  token: string,
  payload: UpdateDailyMealPayload
): Promise<StandardApiResponse<DailyMealResponse>> {
  const response = await fetch(`${API_BASE_URL}/owner/mess/daily-menu`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update daily meal menu.');
  }
  return data;
}

/**
 * Retrieve daily meal menu for owner's mess.
 * Routes: GET /api/owner/mess/daily-menu, GET /api/v1/owner/mess/daily-menu
 */
export async function getOwnerDailyMenuApi(
  token: string,
  messId?: number,
  day?: string
): Promise<StandardApiResponse<DailyMealResponse>> {
  const params = new URLSearchParams();
  if (messId) params.append('messId', String(messId));
  if (day) params.append('day', day);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`${API_BASE_URL}/owner/mess/daily-menu${qs}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch owner daily menu.');
  }
  return data;
}

/**
 * Retrieve full weekly schedule for owner's mess.
 * Routes: GET /api/owner/mess/weekly-menu, GET /api/v1/owner/mess/weekly-menu
 */
export async function getOwnerWeeklyMenuApi(
  token: string,
  messId?: number
): Promise<StandardApiResponse<WeeklyMenuResponse>> {
  const qs = messId ? `?messId=${messId}` : '';
  const response = await fetch(`${API_BASE_URL}/owner/mess/weekly-menu${qs}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch owner weekly menu.');
  }
  return data;
}
