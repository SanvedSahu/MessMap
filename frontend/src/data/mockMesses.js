// ============================================================
// MessMap - Mock Mess Listings Data
// Coordinates centered around educational hub (Pune / FC Road area)
// ============================================================

export const mockMesses = [
  {
    id: 'mess-1',
    name: 'Annapurna Executive Mess',
    tagline: 'Homestyle Maharashtrian & North Indian Unlimited Thalis',
    rating: 4.8,
    reviewCount: 236,
    foodType: 'Pure Veg',
    dietaryBadge: 'veg',
    address: 'Near BMCC College, Ferguson College Road, Shivaji Nagar, Pune',
    landmark: 'Behind Cafe Goodluck',
    lat: 18.5204,
    lng: 73.8402,
    distanceKm: 0.35,
    monthlyPrice: 3200,
    dailyPrice: 90,
    isOpenNow: true,
    openingTime: '07:30 AM',
    closingTime: '10:30 PM',
    ownerName: 'Suresh Patil',
    phone: '+91 98234 11223',
    whatsapp: '919823411223',
    email: 'annapurnamess.fc@gmail.com',
    heroImage: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      'Unlimited Hot Phulkas',
      'RO Purified Water System',
      'Hygienic Clean Kitchen',
      'Sunday Sweet Feast (Gulab Jamun/Kheer)',
      'Tiffin Delivery to Hostels',
      'Free High-Speed Wi-Fi'
    ],
    mealTimings: {
      breakfast: '07:30 AM – 10:00 AM',
      lunch: '12:15 PM – 03:00 PM',
      dinner: '07:30 PM – 10:15 PM'
    },
    todayMenu: {
      lunch: {
        sabji1: 'Paneer Butter Masala',
        sabji2: 'Baingan Bharta (Homestyle)',
        dal: 'Dal Tadka with Jeera',
        rice: 'Steamed Kolam Rice',
        bread: 'Hot Soft Phulkas (Ghee option)',
        sides: ['Kachumber Salad', 'Mango Pickle', 'Curd Boondi Raita'],
        sweet: 'Shrikhand'
      },
      dinner: {
        sabji1: 'Aloo Methi Sukha',
        sabji2: 'Rajma Rasila',
        dal: 'Moong Dal Fry',
        rice: 'Jeera Rice',
        bread: 'Jowar Bhakri / Phulka',
        sides: ['Onion Salad', 'Lemon Pickle', 'Buttermilk / Chaas']
      },
      breakfast: {
        dish: 'Kanda Poha with roasted peanuts & sev',
        beverage: 'Special Masala Chai'
      }
    },
    plans: [
      {
        id: 'p1-single',
        name: 'Single Lunch / Dinner Thali',
        price: 90,
        billingCycle: 'Per Meal Token',
        validity: 'Single Use',
        type: 'daily',
        features: ['1 Full Thali', 'Unlimited Phulkas', 'Dal & Rice', 'Salad & Pickle']
      },
      {
        id: 'p1-standard',
        name: 'Monthly Standard (2 Meals)',
        price: 3200,
        billingCycle: 'Monthly (30 Days)',
        validity: '30 Days',
        popular: true,
        type: 'monthly',
        features: ['Lunch & Dinner Daily', 'Unlimited Chapatis', 'Sunday Sweet Included', 'Up to 4 Days Meal Pause', 'Digital QR Meal Pass']
      },
      {
        id: 'p1-premium',
        name: 'Monthly Premium (3 Meals + Milk/Tea)',
        price: 4100,
        billingCycle: 'Monthly (30 Days)',
        validity: '30 Days',
        popular: false,
        type: 'monthly',
        features: ['Breakfast + Lunch + Dinner', 'Sunday Special Feast', 'Free Hostel Tiffin Delivery', 'Up to 6 Days Meal Pause', 'VIP Priority Counter']
      },
      {
        id: 'p1-half',
        name: '15-Day Semester Exam Pass',
        price: 1750,
        billingCycle: '15 Days',
        validity: '15 Days',
        type: 'flexible',
        features: ['Lunch + Dinner', 'Flexible Dates', 'Unlimited Roti', 'Weekend Validity']
      }
    ]
  },
  {
    id: 'mess-2',
    name: 'Kolhapuri Tadka & Bhojanalay',
    tagline: 'Famous for Spicy Kolhapuri Tambada-Pandhara Rassa & Chicken Thali',
    rating: 4.6,
    reviewCount: 189,
    foodType: 'Veg & Non-Veg',
    dietaryBadge: 'nonveg',
    address: 'Shop 4, Lane 3, Model Colony, Deep Bungalow Chowk, Pune',
    landmark: 'Opposite Government Polytechnic',
    lat: 18.5321,
    lng: 73.8345,
    distanceKm: 0.8,
    monthlyPrice: 3600,
    dailyPrice: 110,
    isOpenNow: true,
    openingTime: '12:00 PM',
    closingTime: '11:00 PM',
    ownerName: 'Ajay Shinde',
    phone: '+91 97655 43210',
    whatsapp: '919765543210',
    email: 'kolhapuritadka.pune@gmail.com',
    heroImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      'Non-Veg on Wed, Fri & Sun',
      'Pure Veg options cooked in separate kitchen',
      'Authentic Jowar Bhakri',
      'Tambada & Pandhara Rassa Unlimited',
      'Clean Air-Conditioned Seating'
    ],
    mealTimings: {
      breakfast: 'Closed for Breakfast',
      lunch: '12:00 PM – 03:30 PM',
      dinner: '07:30 PM – 11:00 PM'
    },
    todayMenu: {
      lunch: {
        sabji1: 'Chicken Sukka / Paneer Kolhapuri',
        sabji2: 'Tambada Rassa (Kolhapuri red curry)',
        dal: 'Dal Fry with Tadka',
        rice: 'Indrayani Fragrant Rice',
        bread: 'Jowar Bhakri or Hot Chapatis',
        sides: ['Solkadhi', 'Onion Rings & Lemon', 'Kolhapuri Thecha']
      },
      dinner: {
        sabji1: 'Egg Curry (2 Eggs) / Veg Kolhapuri',
        sabji2: 'Pandhara Rassa (White coconut stock curry)',
        dal: 'Yellow Dal Tadka',
        rice: 'Steamed Rice',
        bread: 'Hot Phulkas (Unlimited)',
        sides: ['Spicy Thecha', 'Pickle', 'Koshimbir']
      }
    },
    plans: [
      {
        id: 'p2-single',
        name: 'Single Non-Veg Feast Thali',
        price: 130,
        billingCycle: 'Per Meal Token',
        validity: 'Single Use',
        type: 'daily',
        features: ['Chicken/Egg Curry + Unlimited Rassa + 3 Bhakri + Rice + Solkadhi']
      },
      {
        id: 'p2-standard',
        name: 'Monthly Combo (3 Non-Veg Days/Week)',
        price: 3600,
        billingCycle: 'Monthly (30 Days)',
        validity: '30 Days',
        popular: true,
        type: 'monthly',
        features: ['Wed, Fri, Sun Non-Veg + Mon, Tue, Thu, Sat Pure Veg', 'Unlimited Bhakri & Rassa', 'Student Discount Applied']
      },
      {
        id: 'p2-pureveg',
        name: 'Monthly Pure Veg Only Plan',
        price: 2900,
        billingCycle: 'Monthly (30 Days)',
        validity: '30 Days',
        type: 'monthly',
        features: ['Separate utensils & cooking', 'Unlimited Veg Thali', 'Solkadhi Included']
      }
    ]
  },
  {
    id: 'mess-3',
    name: 'Shree Krishna Bhojanalay',
    tagline: 'Ghar Guti Pure Veg Meals with Unlimited Ghee Phulkas',
    rating: 4.7,
    reviewCount: 310,
    foodType: 'Pure Veg',
    dietaryBadge: 'veg',
    address: 'Opposite Gokhale Institute, BMCC Road, Deccan Gymkhana, Pune',
    landmark: 'Near Starbucks Deccan',
    lat: 18.5178,
    lng: 73.8391,
    distanceKm: 0.5,
    monthlyPrice: 2950,
    dailyPrice: 85,
    isOpenNow: true,
    openingTime: '07:00 AM',
    closingTime: '10:00 PM',
    ownerName: 'Rameshwar Kulkarni',
    phone: '+91 94220 89123',
    whatsapp: '919422089123',
    email: 'shreekrishnamess@gmail.com',
    heroImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      'Pure Sattvic & Brahmin Style cooking',
      'No Artificial Colors or Soda',
      'Unlimited Fresh Ghee Phulkas',
      'Jain Options Available Daily',
      'Affordable Student Monthly Pass'
    ],
    mealTimings: {
      breakfast: '07:30 AM – 09:45 AM',
      lunch: '12:00 PM – 02:45 PM',
      dinner: '07:15 PM – 09:45 PM'
    },
    todayMenu: {
      lunch: {
        sabji1: 'Paneer Kofta Curry',
        sabji2: 'Matki Usal (Sprouted Moth beans)',
        dal: 'Maharashtrian Varan with Pure Ghee',
        rice: 'Steamed Rice with Lemon',
        bread: 'Soft Phulkas (Unlimited)',
        sides: ['Curd Pachadi', 'Shengdana Chutney', 'Papad', 'Pickle'],
        sweet: 'Kheer'
      },
      dinner: {
        sabji1: 'Shev Bhaji (Spicy Khandeshi style)',
        sabji2: 'Mix Veg Sukha',
        dal: 'Panchmel Dal Fry',
        rice: 'Jeera Rice',
        bread: 'Hot Phulkas',
        sides: ['Roasted Papad', 'Koshimbir', 'Chaas']
      }
    },
    plans: [
      {
        id: 'p3-daily',
        name: 'Single Sattvic Thali',
        price: 85,
        billingCycle: 'Per Meal',
        validity: 'Single Use',
        type: 'daily',
        features: ['Unlimited Phulkas', '2 Sabjis', 'Varan Bhaat', 'Papad & Pickle']
      },
      {
        id: 'p3-student',
        name: 'Monthly Student Budget Plan',
        price: 2950,
        billingCycle: 'Monthly (30 Days)',
        validity: '30 Days',
        popular: true,
        type: 'monthly',
        features: ['Lunch + Dinner (60 Meals)', 'Unlimited Chapatis', '5 Free Tiffin deliveries', 'Sunday Sweet Included']
      }
    ]
  },
  {
    id: 'mess-4',
    name: 'Swad Deluxe North Indian Mess',
    tagline: 'Authentic Punjabi Gravies, Dal Makhani & Tawa Rotis',
    rating: 4.5,
    reviewCount: 165,
    foodType: 'Both (Veg & Egg)',
    dietaryBadge: 'both',
    address: 'Near COEP Hostel, Shivajinagar Railway Station Road, Pune',
    landmark: 'Next to COEP South Gate',
    lat: 18.5305,
    lng: 73.8558,
    distanceKm: 1.2,
    monthlyPrice: 3400,
    dailyPrice: 95,
    isOpenNow: true,
    openingTime: '08:00 AM',
    closingTime: '10:30 PM',
    ownerName: 'Harpreet Singh',
    phone: '+91 99881 23456',
    whatsapp: '919988123456',
    email: 'swaddeluxe.pune@gmail.com',
    heroImage: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      'Dal Makhani Every Friday',
      'Egg Curry Option Daily',
      'Thick Homestyle Curd',
      'Tawa Paratha Breakfast',
      'Late Night Dinner till 10:30 PM'
    ],
    mealTimings: {
      breakfast: '08:00 AM – 10:30 AM',
      lunch: '12:30 PM – 03:15 PM',
      dinner: '07:45 PM – 10:30 PM'
    },
    todayMenu: {
      lunch: {
        sabji1: 'Shahi Paneer / Egg Bhurji',
        sabji2: 'Chana Masala Amritsari',
        dal: 'Dal Makhani Slow-cooked',
        rice: 'Jeera Fried Rice',
        bread: 'Tawa Butter Roti (Unlimited)',
        sides: ['Sirka Pyaaz', 'Green Chutney', 'Boondi Raita']
      },
      dinner: {
        sabji1: 'Aloo Shimlamirch',
        sabji2: 'Black Chana Curry',
        dal: 'Yellow Dal Tadka',
        rice: 'Steamed Rice',
        bread: 'Hot Tawa Phulka',
        sides: ['Mixed Pickle', 'Salad', 'Papad']
      }
    },
    plans: [
      {
        id: 'p4-standard',
        name: 'Monthly Standard North Indian',
        price: 3400,
        billingCycle: 'Monthly (30 Days)',
        validity: '30 Days',
        popular: true,
        type: 'monthly',
        features: ['Lunch + Dinner', 'Dal Makhani Weekly', 'Egg Option at no extra charge', 'Pause facility available']
      }
    ]
  },
  {
    id: 'mess-5',
    name: 'Green Leaf Healthy Nutrition Mess',
    tagline: 'Diet-Conscious, High-Protein & Low-Oil Balanced Meals',
    rating: 4.9,
    reviewCount: 98,
    foodType: 'Pure Veg',
    dietaryBadge: 'veg',
    address: 'Plot 22, Paud Road, Near MIT World Peace University, Kothrud, Pune',
    landmark: 'Behind MIT College Gate 2',
    lat: 18.5165,
    lng: 73.8152,
    distanceKm: 2.1,
    monthlyPrice: 3800,
    dailyPrice: 120,
    isOpenNow: true,
    openingTime: '07:00 AM',
    closingTime: '09:45 PM',
    ownerName: 'Dr. Neha Deshmukh',
    phone: '+91 93700 45678',
    whatsapp: '919370045678',
    email: 'greenleafmeals@gmail.com',
    heroImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      'Nutritional Calories & Protein Breakdown Listed',
      'Multi-grain Roti (Wheat + Jowar + Ragi)',
      'Sprouts & Fresh Fruit Bowl with every meal',
      'Zero Palm Oil, Cold Pressed Peanut Oil',
      'Dietician Certified Menu'
    ],
    mealTimings: {
      breakfast: '07:00 AM – 09:30 AM',
      lunch: '12:15 PM – 02:45 PM',
      dinner: '07:15 PM – 09:45 PM'
    },
    todayMenu: {
      lunch: {
        sabji1: 'Soya Chunk & Palak Gravy',
        sabji2: 'Tofu Paneer Stir Fry with Broccoli',
        dal: 'High-Protein Panchratna Dal',
        rice: 'Brown Rice / Red Rice Option',
        bread: 'Multigrain Phulka (No Maida)',
        sides: ['Fresh Sprout Salad (Moong + Chana)', 'Flaxseed Chutney', 'Low-fat Curd']
      },
      dinner: {
        sabji1: 'Methi Moong Dal Khichdi Bowl',
        sabji2: 'Bottle Gourd (Lauki) & Chana Dal',
        dal: 'Light Tomato Soup / Rasam',
        rice: 'Steamed Rice',
        bread: 'Jowar Roti with White Butter',
        sides: ['Cucumber Tomato Salad', 'Digestive Buttermilk']
      }
    },
    plans: [
      {
        id: 'p5-fit',
        name: 'Pro-Health Monthly Subscription',
        price: 3800,
        billingCycle: 'Monthly (30 Days)',
        validity: '30 Days',
        popular: true,
        type: 'monthly',
        features: ['Lunch + Dinner High Protein', 'Multigrain Rotis', 'Sprouts Bowl Everyday', 'Pause without deductions']
      }
    ]
  },
  {
    id: 'mess-6',
    name: 'Sai Krupa Pocket-Friendly Student Mess',
    tagline: 'Most Economical Mess with Home-Cooked Unlimited Daily Thali',
    rating: 4.3,
    reviewCount: 280,
    foodType: 'Pure Veg',
    dietaryBadge: 'veg',
    address: 'Near Garware College, Karve Road, Deccan, Pune',
    landmark: '2 mins walk from Garware Metro Station',
    lat: 18.5085,
    lng: 73.8341,
    distanceKm: 1.1,
    monthlyPrice: 2400,
    dailyPrice: 70,
    isOpenNow: true,
    openingTime: '07:30 AM',
    closingTime: '10:00 PM',
    ownerName: 'Vilas Jadhav',
    phone: '+91 98900 12345',
    whatsapp: '919890012345',
    email: 'saikrupamess@gmail.com',
    heroImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
    ],
    features: [
      'Super Economical (₹2,400/month)',
      'Unlimited Chapatis and Rice',
      'Hot Piping Food served fast',
      'Hostel Tiffin Service Available',
      'Directly next to Garware Metro Station'
    ],
    mealTimings: {
      breakfast: '07:30 AM – 09:30 AM',
      lunch: '12:00 PM – 03:00 PM',
      dinner: '07:30 PM – 10:00 PM'
    },
    todayMenu: {
      lunch: {
        sabji1: 'Aloo Matar Rasila',
        sabji2: 'Chana Masala',
        dal: 'Dal Fry',
        rice: 'Steamed Rice',
        bread: 'Hot Chapatis (Unlimited)',
        sides: ['Onion Salad', 'Pickle', 'Papad']
      },
      dinner: {
        sabji1: 'Sev Tamatar Sabji',
        sabji2: 'Moong Dal Sukha',
        dal: 'Yellow Dal Tadka',
        rice: 'Steamed Rice',
        bread: 'Fresh Chapatis',
        sides: ['Pickle', 'Chilli Thecha']
      }
    },
    plans: [
      {
        id: 'p6-budget',
        name: 'Pocket-Saver Monthly (2 Meals)',
        price: 2400,
        billingCycle: 'Monthly (30 Days)',
        validity: '30 Days',
        popular: true,
        type: 'monthly',
        features: ['Lunch + Dinner', 'Unlimited Chapatis', 'Student ID Card discount', 'Guaranteed hot meal']
      }
    ]
  }
];

export const mockCategories = [
  { id: 'all', label: 'All Messes', icon: 'Utensils' },
  { id: 'veg', label: 'Pure Veg', icon: 'Leaf' },
  { id: 'nonveg', label: 'Veg & Non-Veg', icon: 'Drumstick' },
  { id: 'budget', label: 'Under ₹2,800/mo', icon: 'BadgePercent' },
  { id: 'top-rated', label: 'Top Rated (4.5+)', icon: 'Star' }
];
