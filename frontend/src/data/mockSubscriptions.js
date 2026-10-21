// ============================================================
// MessMap - Mock Subscription & Billing Data
// ============================================================

export const mockActiveSubscription = {
  id: 'sub-active-8812',
  messId: 'mess-1',
  messName: 'Annapurna Executive Mess',
  messAddress: 'Near BMCC College, Ferguson College Road, Shivaji Nagar, Pune',
  planName: 'Monthly Standard (2 Meals / Day)',
  planPrice: 3200,
  billingCycle: 'Monthly',
  status: 'Active', // 'Active', 'Paused', 'Expiring'
  startDate: '2026-10-01',
  endDate: '2026-10-31',
  totalDays: 31,
  daysUsed: 12,
  mealsIncluded: ['Lunch', 'Dinner'],
  totalMeals: 62,
  mealsConsumed: 23,
  pausedDates: ['2026-10-18', '2026-10-19'],
  tokenCode: 'MM-PUN-8812',
  qrValue: 'MESSMAP:SUB:ANNAPURNA:8812:ACTIVE:RAHUL_PATIL'
};

export const mockPastInvoices = [
  {
    id: 'INV-2026-0901',
    messName: 'Annapurna Executive Mess',
    plan: 'Monthly Standard (2 Meals)',
    amount: 3200,
    date: '2026-09-01',
    status: 'Completed',
    paymentMethod: 'UPI (GPay / PhonePe)'
  },
  {
    id: 'INV-2026-0801',
    messName: 'Shree Krishna Bhojanalay',
    plan: 'Monthly Student Budget Plan',
    amount: 2950,
    date: '2026-08-01',
    status: 'Completed',
    paymentMethod: 'UPI'
  },
  {
    id: 'INV-2026-0715',
    messName: 'Kolhapuri Tadka & Bhojanalay',
    plan: '15-Day Flexi Non-Veg Pass',
    amount: 1900,
    date: '2026-07-15',
    status: 'Completed',
    paymentMethod: 'Debit Card'
  }
];
