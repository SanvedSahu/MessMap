/**
 * Client service for interacting with the Spring Boot backend Student APIs:
 * - Issue #7: Student Registration, Authentication, and Profile APIs
 * - Issue #8: Approved Mess Discovery, Search/Filters, and Listing Details APIs
 * - Issue #9: Mess Bookmark and Favorites APIs
 * - Issue #10: Mess Reviews and Ratings APIs
 */

import { MessItem } from '../types/student.types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

export type DietaryPreference = 'VEG' | 'NON_VEG' | 'BOTH';

export interface StudentRegistrationPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  college?: string;
  collegeOrLocality?: string;
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

export type StudentProfileResponse = StudentProfileApiResponse;

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

// -----------------------------------------------------------------------------
// Issue #8 DTOs: Mess Discovery & Details
// -----------------------------------------------------------------------------

export interface FacilityDto {
  id: number;
  name: string;
  icon?: string;
}

export interface MenuItemDto {
  id: number;
  name: string;
  description?: string;
  category: string;
  price?: number;
  isAvailable: boolean;
}

export interface MealTimingsDto {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

export interface MessSummaryApiResponse {
  id: number;
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
  heroImage?: string;
  capacity?: number;
  facilities?: FacilityDto[];
  gallery?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface MessDetailApiResponse extends MessSummaryApiResponse {
  ownerName?: string;
  mealTimings?: MealTimingsDto;
  menuItems?: MenuItemDto[];
}

export interface MessFilterParams {
  search?: string;
  foodType?: string;
  locality?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

// -----------------------------------------------------------------------------
// Issue #9 DTOs: Bookmarks & Favorites
// -----------------------------------------------------------------------------

export interface FavoriteApiResponse {
  id: number;
  messId: number;
  messName: string;
  address?: string;
  area?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  foodType?: string;
  monthlyPrice?: number;
  dailyPrice?: number;
  heroImage?: string;
  gallery?: string[];
  operatingStatus?: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
}

// -----------------------------------------------------------------------------
// Issue #10 DTOs: Reviews & Ratings
// -----------------------------------------------------------------------------

export interface ReviewApiResponse {
  id: number;
  messId: number;
  messName?: string;
  userId: number;
  userName?: string;
  userAvatar?: string;
  userCollege?: string;
  rating: number;
  comment?: string;
  foodQualityScore?: number;
  hygieneScore?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessReviewsApiResponse {
  messId: number;
  messName: string;
  averageRating: number;
  totalReviews: number;
  reviews: ReviewApiResponse[];
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
  foodQualityScore?: number;
  hygieneScore?: number;
}

export interface UpdateReviewPayload {
  rating: number;
  comment?: string;
  foodQualityScore?: number;
  hygieneScore?: number;
}

// -----------------------------------------------------------------------------
// Helper: Extract error message safely
// -----------------------------------------------------------------------------
async function handleResponse<T>(response: Response): Promise<StandardApiResponse<T>> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    let errorMsg = data?.message;
    if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
      errorMsg = `${errorMsg || 'Validation error'}: ${data.details.join(', ')}`;
    }
    throw new Error(errorMsg || `Server responded with status ${response.status}`);
  }
  return data;
}

// =============================================================================
// PHASE 2: Student Authentication & Profile APIs (Issue #7)
// =============================================================================

/**
 * Register a new Student account with Spring Boot backend API.
 * POST /api/auth/student/register
 */
export async function registerStudentApi(
  payload: StudentRegistrationPayload
): Promise<StandardApiResponse<AuthApiResponse>> {
  const body = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    phone: payload.phone || undefined,
    college: payload.collegeOrLocality || payload.college || undefined,
    hostel: payload.hostel || undefined,
    dietaryPreference: payload.dietaryPreference || 'VEG',
  };

  const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleResponse<AuthApiResponse>(response);
}

/**
 * Authenticate student credentials with Spring Boot backend API.
 * POST /api/auth/student/login
 */
export async function loginStudentApi(
  payload: StudentLoginPayload
): Promise<StandardApiResponse<AuthApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse<AuthApiResponse>(response);
}

/**
 * Retrieve authenticated student's profile information from backend.
 * GET /api/student/profile
 */
export async function getStudentProfileApi(
  token: string
): Promise<StandardApiResponse<StudentProfileResponse>> {
  const response = await fetch(`${API_BASE_URL}/student/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<StudentProfileResponse>(response);
}

/**
 * Update authenticated student's profile information with backend.
 * PUT /api/student/profile
 */
export async function updateStudentProfileApi(
  token: string,
  payload: StudentProfileUpdatePayload
): Promise<StandardApiResponse<StudentProfileResponse>> {
  const body = {
    name: payload.name,
    phone: payload.phone,
    college: payload.collegeOrLocality || payload.college,
    hostel: payload.hostel,
    dietaryPreference: payload.dietaryPreference,
    avatarUrl: payload.avatarUrl,
  };

  const response = await fetch(`${API_BASE_URL}/student/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse<StudentProfileResponse>(response);
}

// =============================================================================
// PHASE 3 & 4: Mess Discovery & Details APIs (Issue #8)
// =============================================================================

/**
 * Fetch approved messes with multi-criteria search and filters from backend.
 * GET /api/messes
 */
export async function getMessesApi(
  params?: MessFilterParams
): Promise<StandardApiResponse<MessSummaryApiResponse[]>> {
  const query = new URLSearchParams();

  if (params?.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }
  if (params?.foodType && params.foodType !== 'all') {
    // Map frontend labels to backend FoodType enum values
    let backendFoodType = params.foodType;
    if (params.foodType === 'Pure Veg' || params.foodType === 'VEG') {
      backendFoodType = 'PURE_VEG';
    } else if (params.foodType === 'Veg & Non-Veg' || params.foodType === 'BOTH') {
      backendFoodType = 'VEG_AND_NON_VEG';
    } else if (params.foodType === 'Non-Veg') {
      backendFoodType = 'NON_VEG';
    }
    query.set('foodType', backendFoodType);
  }
  if (params?.locality && params.locality.trim() && params.locality !== 'all') {
    query.set('locality', params.locality.trim());
  }
  if (params?.city && params.city.trim()) {
    query.set('city', params.city.trim());
  }
  if (params?.minPrice !== undefined && params.minPrice !== null) {
    query.set('minPrice', String(params.minPrice));
  }
  if (params?.maxPrice !== undefined && params.maxPrice !== null && params.maxPrice < 10000) {
    query.set('maxPrice', String(params.maxPrice));
  }
  if (params?.page !== undefined && params.page !== null) {
    query.set('page', String(params.page));
  }
  if (params?.size !== undefined && params.size !== null) {
    query.set('size', String(params.size));
  }

  const queryString = query.toString();
  const url = queryString ? `${API_BASE_URL}/messes?${queryString}` : `${API_BASE_URL}/messes`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<MessSummaryApiResponse[]>(response);
}

/**
 * Retrieve comprehensive details and active menus for a specific approved mess.
 * GET /api/messes/{id}
 */
export async function getMessByIdApi(
  id: string | number
): Promise<StandardApiResponse<MessDetailApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/messes/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<MessDetailApiResponse>(response);
}

// =============================================================================
// PHASE 6: Reviews & Ratings APIs (Issue #10)
// =============================================================================

/**
 * Retrieve all reviews and ratings for a given mess, including aggregate metrics.
 * GET /api/messes/{messId}/reviews
 */
export async function getMessReviewsApi(
  messId: string | number
): Promise<StandardApiResponse<MessReviewsApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/messes/${messId}/reviews`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<MessReviewsApiResponse>(response);
}

/**
 * Submit a new student review for an approved mess.
 * POST /api/messes/{messId}/reviews
 */
export async function submitReviewApi(
  token: string,
  messId: string | number,
  payload: CreateReviewPayload
): Promise<StandardApiResponse<ReviewApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/messes/${messId}/reviews`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ReviewApiResponse>(response);
}

/**
 * Update an existing review authored by the current student.
 * PUT /api/messes/{messId}/reviews/{reviewId}
 */
export async function updateReviewApi(
  token: string,
  messId: string | number,
  reviewId: string | number,
  payload: UpdateReviewPayload
): Promise<StandardApiResponse<ReviewApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/messes/${messId}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ReviewApiResponse>(response);
}

/**
 * Delete an existing review authored by the current student.
 * DELETE /api/messes/{messId}/reviews/{reviewId}
 */
export async function deleteReviewApi(
  token: string,
  messId: string | number,
  reviewId: string | number
): Promise<StandardApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/messes/${messId}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<void>(response);
}

// =============================================================================
// PHASE 7: Mess Bookmarks & Favorites APIs (Issue #9)
// =============================================================================

/**
 * Retrieve all favorite messes for the authenticated student.
 * GET /api/student/favorites
 */
export async function getStudentFavoritesApi(
  token: string
): Promise<StandardApiResponse<FavoriteApiResponse[]>> {
  const response = await fetch(`${API_BASE_URL}/student/favorites`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<FavoriteApiResponse[]>(response);
}

/**
 * Add an approved mess to the authenticated student's favorites list.
 * POST /api/student/favorites/{messId}
 */
export async function addFavoriteApi(
  token: string,
  messId: string | number
): Promise<StandardApiResponse<FavoriteApiResponse>> {
  const response = await fetch(`${API_BASE_URL}/student/favorites/${messId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<FavoriteApiResponse>(response);
}

/**
 * Remove a mess from the authenticated student's favorites list.
 * DELETE /api/student/favorites/{messId}
 */
export async function removeFavoriteApi(
  token: string,
  messId: string | number
): Promise<StandardApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/student/favorites/${messId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<void>(response);
}

// =============================================================================
// Data Adapters for Frontend Compatibility
// =============================================================================

export function formatFoodType(foodType?: string): string {
  if (!foodType) return 'Pure Veg';
  const upper = foodType.toUpperCase();
  if (upper === 'PURE_VEG' || upper === 'VEG') return 'Pure Veg';
  if (upper === 'VEG_AND_NON_VEG' || upper === 'BOTH') return 'Veg & Non-Veg';
  if (upper === 'NON_VEG') return 'Non-Veg';
  return foodType;
}

export function adaptMessSummaryToMessItem(dto: MessSummaryApiResponse): MessItem {
  const defaultImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  const heroImage = dto.heroImage && dto.heroImage.trim() ? dto.heroImage : defaultImage;
  const gallery = dto.gallery && dto.gallery.length > 0 ? dto.gallery : [heroImage];
  const facilities = dto.facilities?.map((f) => f.name) || [];

  return {
    id: String(dto.id),
    name: dto.name || 'Campus Mess',
    tagline: dto.description || `${dto.area || dto.city} Student Mess`,
    rating: typeof dto.rating === 'number' && dto.rating > 0 ? Number(dto.rating.toFixed(1)) : 4.5,
    reviewCount: dto.reviewCount || 0,
    foodType: formatFoodType(dto.foodType),
    address: dto.address || `${dto.area ? dto.area + ', ' : ''}${dto.city}`,
    landmark: dto.area || dto.city || 'Campus Area',
    lat: dto.latitude ? Number(dto.latitude) : 18.5204,
    lng: dto.longitude ? Number(dto.longitude) : 73.8567,
    distanceKm: 1.2,
    monthlyPrice: dto.monthlyPrice ? Number(dto.monthlyPrice) : 3000,
    dailyPrice: dto.dailyPrice ? Number(dto.dailyPrice) : 100,
    isOpenNow: dto.operatingStatus ? dto.operatingStatus === 'OPEN' : true,
    openingTime: dto.openingTime || '07:30 AM',
    closingTime: dto.closingTime || '10:30 PM',
    ownerName: (dto as any).ownerName || 'Mess Incharge',
    phone: dto.phone || '+91 98220 12345',
    whatsapp: dto.phone ? dto.phone.replace(/[^0-9]/g, '') : '919822012345',
    email: dto.email || 'support@messmap.in',
    heroImage,
    gallery,
    features: facilities,
    mealTimings: {
      breakfast: '07:30 AM – 10:00 AM',
      lunch: '12:15 PM – 03:00 PM',
      dinner: '07:30 PM – 10:15 PM',
    },
  };
}

export function adaptMessDetailToMessItem(
  dto: MessDetailApiResponse
): MessItem & { menuItems?: MenuItemDto[] } {
  const base = adaptMessSummaryToMessItem(dto);
  return {
    ...base,
    ownerName: dto.ownerName || base.ownerName,
    mealTimings: {
      breakfast: dto.mealTimings?.breakfast || base.mealTimings?.breakfast,
      lunch: dto.mealTimings?.lunch || base.mealTimings?.lunch,
      dinner: dto.mealTimings?.dinner || base.mealTimings?.dinner,
    },
    menuItems: dto.menuItems || [],
    plans: [
      {
        id: `plan-monthly-${dto.id}`,
        name: 'Monthly Unlimited Meal Pass',
        price: dto.monthlyPrice ? Number(dto.monthlyPrice) : 3200,
        validity: '30 Days',
        billingCycle: 'Monthly Advance',
        popular: true,
        features: ['Unlimited Lunch & Dinner', 'Sunday Special Included', 'Campus Verified Mess'],
      },
      {
        id: `plan-daily-${dto.id}`,
        name: 'Single Day Thali Token',
        price: dto.dailyPrice ? Number(dto.dailyPrice) : 110,
        validity: 'Single Meal',
        billingCycle: 'Counter Token',
        popular: false,
        features: ['Standard Dine-in Thali', 'Instant Counter Token'],
      },
    ],
  };
}

export function adaptFavoriteToMessItem(fav: FavoriteApiResponse): MessItem {
  const messId = fav.messId || fav.id;
  const name = fav.messName || (fav as any).name || 'Saved Mess';
  const foodType = formatFoodType(fav.foodType);
  const defaultImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  const heroImage = fav.heroImage && fav.heroImage.trim() ? fav.heroImage : defaultImage;

  return {
    id: String(messId),
    name,
    tagline: (fav as any).description || `${fav.area || fav.city || 'Campus'} Student Mess`,
    rating: fav.rating && fav.rating > 0 ? Number(fav.rating.toFixed(1)) : 4.5,
    reviewCount: fav.reviewCount || 0,
    foodType,
    address: fav.address || `${fav.area ? fav.area + ', ' : ''}${fav.city || ''}`.trim() || 'Address not available',
    landmark: fav.area || fav.city || 'Campus Area',
    lat: fav.latitude ? Number(fav.latitude) : 18.5204,
    lng: fav.longitude ? Number(fav.longitude) : 73.8567,
    distanceKm: 1.2,
    monthlyPrice: fav.monthlyPrice ? Number(fav.monthlyPrice) : 3000,
    dailyPrice: fav.dailyPrice ? Number(fav.dailyPrice) : 100,
    isOpenNow: fav.operatingStatus ? fav.operatingStatus === 'OPEN' : true,
    heroImage,
    gallery: fav.gallery && fav.gallery.length > 0 ? fav.gallery : [heroImage],
  };
}


