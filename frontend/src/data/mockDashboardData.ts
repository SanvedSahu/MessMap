/**
 * Realistic mock data for Mess Owner Dashboard
 * Separated cleanly for future Java Spring Boot REST API integration (/api/owner/...)
 */

export interface DashboardStats {
  totalMenuItems: number;
  activeMenuItems: number;
  totalEnquiries: number;
  pendingEnquiries: number;
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
  activeDiners: number;
}

export interface ActivityItem {
  id: string;
  type: 'menu' | 'enquiry' | 'review' | 'status' | 'profile';
  title: string;
  description: string;
  timestamp: string;
  badgeText: string;
  badgeType: 'green' | 'blue' | 'yellow' | 'purple';
}

export interface DashboardEnquiry {
  id: string;
  studentName: string;
  college: string;
  phone: string;
  planType: 'Monthly (2 Meals)' | 'Monthly (Lunch Only)' | 'Trial Meal' | 'Tiffin Service';
  message: string;
  dateTime: string;
  status: 'New' | 'Replied' | 'In Discussion';
}

export const initialDashboardStats: DashboardStats = {
  totalMenuItems: 18,
  activeMenuItems: 9,
  totalEnquiries: 24,
  pendingEnquiries: 4,
  averageRating: 4.7,
  totalReviews: 94,
  isAvailable: true,
  activeDiners: 148,
};

export const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'menu',
    title: 'Updated Today\'s Lunch Menu',
    description: 'Added "Paneer Butter Masala" and "Yellow Dal Tadka" to active lunch items.',
    timestamp: '25 mins ago',
    badgeText: 'Menu Updated',
    badgeType: 'green',
  },
  {
    id: 'act-2',
    type: 'enquiry',
    title: 'Responded to Monthly Pass Enquiry',
    description: 'Shared subscription details with student Rahul Verma (+91 98765 43210).',
    timestamp: '1 hour ago',
    badgeText: 'Enquiry Handled',
    badgeType: 'blue',
  },
  {
    id: 'act-3',
    type: 'review',
    title: 'Received New 5-Star Rating',
    description: 'Sneha Patil reviewed: "Gulab jamun and dal tadka taste like authentic home food!"',
    timestamp: '3 hours ago',
    badgeText: '5.0 ★ Review',
    badgeType: 'yellow',
  },
  {
    id: 'act-4',
    type: 'status',
    title: 'Operating Status Activated',
    description: 'Marked mess listing as "Open for Dine-in & Takeaway" for the day.',
    timestamp: '7:15 AM today',
    badgeText: 'Status: Open',
    badgeType: 'green',
  },
  {
    id: 'act-5',
    type: 'profile',
    title: 'Updated Monthly Mess Tariff',
    description: 'Set regular 2-meal monthly package to ₹3,200/month with unlimited chapatis.',
    timestamp: 'Yesterday',
    badgeText: 'Pricing Rule',
    badgeType: 'purple',
  },
];

export const initialDashboardEnquiries: DashboardEnquiry[] = [
  {
    id: 'enq-101',
    studentName: 'Rahul Verma',
    college: 'Bharati Vidyapeeth Engg College',
    phone: '+91 98765 43210',
    planType: 'Monthly (2 Meals)',
    message: 'Hello sir, I stay in Katraj. Does your monthly plan include Sunday feast lunch? Also can I pay in two instalments?',
    dateTime: 'Today, 11:20 AM',
    status: 'New',
  },
  {
    id: 'enq-102',
    studentName: 'Snehal Kulkarni',
    college: 'PICT College (Dhankawadi)',
    phone: '+91 91234 56789',
    planType: 'Trial Meal',
    message: 'Can I come for a trial lunch today at 1:30 PM with 2 friends? We want to taste your regular chapati and dal before subscribing.',
    dateTime: 'Today, 09:45 AM',
    status: 'New',
  },
  {
    id: 'enq-103',
    studentName: 'Amit Patel',
    college: 'SKN Sinhgad Institute',
    phone: '+91 99887 76655',
    planType: 'Tiffin Service',
    message: 'Do you deliver daily evening tiffin to Ambegaon BK? Looking for dinner tiffin subscription starting next Monday.',
    dateTime: 'Today, 08:30 AM',
    status: 'In Discussion',
  },
  {
    id: 'enq-104',
    studentName: 'Priya Joshi',
    college: 'MIT-WPU Kothrud',
    phone: '+91 97654 32109',
    planType: 'Monthly (Lunch Only)',
    message: 'Interested in a lunch-only subscription for 30 days. Is there a trial period before committing for full month?',
    dateTime: 'Yesterday, 04:15 PM',
    status: 'Replied',
  },
  {
    id: 'enq-105',
    studentName: 'Omkar Shinde',
    college: 'VIIT Kondhwa',
    phone: '+91 98220 12345',
    planType: 'Monthly (2 Meals)',
    message: 'Looking for group subscription discount for 4 roommates. Please share current rates and weekend menu schedule.',
    dateTime: '11 Oct, 06:00 PM',
    status: 'Replied',
  },
];
