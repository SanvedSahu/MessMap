export interface MealDetails {
  sabji1?: string;
  sabji2?: string;
  dal?: string;
  rice?: string;
  bread?: string;
  sides?: string[];
  sweet?: string;
  dish?: string;
  beverage?: string;
}

export interface TodayMenu {
  lunch?: MealDetails;
  dinner?: MealDetails;
  breakfast?: MealDetails;
}

export interface PlanItem {
  id: string;
  name: string;
  price: number;
  validity: string;
  billingCycle: string;
  popular?: boolean;
  features?: string[];
}

export interface MessItem {
  id: string;
  name: string;
  tagline?: string;
  rating: number;
  reviewCount: number;
  foodType: string;
  dietaryBadge?: string;
  address: string;
  area?: string;
  city?: string;
  landmark?: string;
  lat: number;
  lng: number;
  distanceKm: number;
  monthlyPrice: number;
  dailyPrice: number;
  isOpenNow: boolean;
  openingTime?: string;
  closingTime?: string;
  ownerName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  heroImage: string;
  gallery?: string[];
  features?: string[];
  mealTimings?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  todayMenu?: TodayMenu;
  plans?: PlanItem[];
}

export interface UserSubscription {
  id: string;
  messId: string;
  messName: string;
  messAddress?: string;
  planId?: string;
  planName: string;
  price?: number;
  planPrice?: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Paused' | 'Expired' | 'Expiring';
  tokenCode: string;
  mealsIncluded?: string[];
  remainingDays?: number;
  totalDays?: number;
  daysUsed?: number;
  pausedDaysCount?: number;
  pauseReason?: string | null;
  resumesOn?: string | null;
}

export interface ReviewItem {
  id: string;
  messId: string;
  messName?: string;
  userName: string;
  userAvatar?: string;
  userCollege?: string;
  college?: string;
  rating: number;
  date: string;
  comment: string;
  foodType?: string;
  foodQuality?: number;
  hygiene?: number;
  valueForMoney?: number;
  helpfulCount?: number;
  likes?: number;
  tags?: string[];
}
