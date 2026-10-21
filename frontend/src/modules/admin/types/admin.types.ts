export type MessStatus = 'Approved' | 'Pending' | 'Rejected' | 'Under Review' | 'Suspended';
export type FoodType = 'Pure Veg' | 'Veg & Non-Veg' | 'Jain Friendly';
export type OperatingStatus = 'Open' | 'Closed' | 'Temporary Closure';

export interface Mess {
  id: string;
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  address: string;
  area: string;
  foodType: FoodType;
  monthlyPrice: number;
  dailyPrice: number;
  rating: number;
  reviewCount: number;
  status: MessStatus;
  operatingStatus: OperatingStatus;
  timings: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  menuHighlights: string[];
  hygieneScore: number;
  registeredDate: string;
  description: string;
  features: string[];
  capacity: number;
  rejectionReason?: string;
}

export type UserRole = 'Student' | 'Mess Owner' | 'Admin';
export type UserStatus = 'Active' | 'Suspended' | 'Pending Verification';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  college: string;
  registeredDate: string;
  lastActive: string;
  reviewsCount: number;
  complaintsCount: number;
  avatar: string;
  associatedMess?: string;
}

export type ReviewStatus = 'Published' | 'Flagged' | 'Removed';

export interface Review {
  id: string;
  messId: string;
  messName: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  foodQualityScore: number;
  hygieneScore: number;
  status: ReviewStatus;
  flagReason?: string;
}

export type ComplaintCategory =
  | 'Food Quality'
  | 'Hygiene & Cleanliness'
  | 'Overcharging & Deposit'
  | 'Unavailability / Early Closure'
  | 'Misleading Menu'
  | 'Staff Behavior';

export type ComplaintSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus = 'Open' | 'Under Investigation' | 'Resolved' | 'Dismissed';

export interface Complaint {
  id: string;
  ticketNumber: string;
  messId: string;
  messName: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  severity: ComplaintSeverity;
  date: string;
  status: ComplaintStatus;
  adminNotes?: string;
  resolvedDate?: string;
}

export interface ActivityItem {
  id: string;
  type: 'mess_registered' | 'mess_approved' | 'mess_rejected' | 'mess_suspended' | 'mess_unsuspended' | 'mess_deleted' | 'complaint_filed' | 'complaint_resolved' | 'user_flagged' | 'review_reported';
  title: string;
  description: string;
  timestamp: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'info';
}

export interface DashboardStats {
  totalUsers: number;
  userGrowthPercent: number;
  totalMesses: number;
  messGrowthPercent: number;
  pendingApprovals: number;
  totalReviews: number;
  openComplaints: number;
  activeSubscribers: number;
}

export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatar: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  emailAlerts: boolean;
  systemAlerts: boolean;
  maintenanceMode: boolean;
  weeklyDigest: boolean;
}
