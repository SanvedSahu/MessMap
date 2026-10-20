-- ==============================================================================
-- MessMap Presentation Demo Seed Dataset
-- File: database/seed/demo_seed_data.sql
-- Description: Realistic Pune campus messes, weekly menus, facility associations,
--              demo student accounts, and sample reviews for mentor demonstration.
--
-- Idempotency Guarantee:
-- Safe for repeated execution on existing MySQL databases (messmap_dev_db).
-- Uses INSERT ... SELECT ... WHERE NOT EXISTS to guarantee zero duplicate keys.
--
-- Demo Accounts:
--   Admin:     admin@messmap.com               / admin
--   Owner:     rajesh.sharma@annapurnamess.com / owner
--   Student:   rahul.patil@coep.ac.in          / student
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Ensure Standard Campus Facilities Exist
-- ------------------------------------------------------------------------------
INSERT INTO facilities (name, icon)
SELECT 'RO Purified Water', 'droplet'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'RO Purified Water');

INSERT INTO facilities (name, icon)
SELECT 'WiFi', 'wifi'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'WiFi');

INSERT INTO facilities (name, icon)
SELECT 'AC Dining', 'wind'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'AC Dining');

INSERT INTO facilities (name, icon)
SELECT 'Parking Space', 'car'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Parking Space');

INSERT INTO facilities (name, icon)
SELECT 'Hot Water', 'flame'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Hot Water');

INSERT INTO facilities (name, icon)
SELECT 'CCTV Security', 'shield'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'CCTV Security');

INSERT INTO facilities (name, icon)
SELECT 'Monthly Subscription Card', 'credit-card'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Monthly Subscription Card');

INSERT INTO facilities (name, icon)
SELECT 'Parcel & Takeaway', 'package'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Parcel & Takeaway');

-- ------------------------------------------------------------------------------
-- 2. Seed Demo User Accounts
-- ------------------------------------------------------------------------------
-- 2a. Platform Administrator (password: admin)
INSERT INTO users (name, email, password, phone, role, status)
SELECT 'Platform Administrator', 'admin@messmap.com', '$2a$10$50qk/RegQVrEgcLOa1gJAeNfWD2u6NHylYElu1AweV8YvjIuutZiG', '+91 99999 99999', 'ROLE_ADMIN', 'ACTIVE'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@messmap.com');

-- 2b. Annapurna Mess Owner - Rajesh Sharma (password: owner)
INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Rajesh Sharma', 'rajesh.sharma@annapurnamess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98231 44550', 'ROLE_MESS_OWNER', 'ACTIVE', 'Fergusson College Road', 'Near BMCC'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rajesh.sharma@annapurnamess.com');

-- 2c. Maratha Darbar Owner - Suresh Patil (password: owner)
INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Suresh Patil', 'suresh.patil@marathadarbar.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98220 11223', 'ROLE_MESS_OWNER', 'ACTIVE', 'COEP Campus Area', 'Shivajinagar'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'suresh.patil@marathadarbar.com');

-- 2d. Padmavati Jain Mess Owner - Bhavin Shah (password: owner)
INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Bhavin Shah', 'bhavin.shah@padmavatimess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98900 33445', 'ROLE_MESS_OWNER', 'ACTIVE', 'Bharati Vidyapeeth', 'Katraj'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bhavin.shah@padmavatimess.com');

-- 2e. Green Leaf Owner - Neha Kulkarni (password: owner)
INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Neha Kulkarni', 'neha.kulkarni@greenleafdining.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 97654 88990', 'ROLE_MESS_OWNER', 'ACTIVE', 'Symbiosis Campus', 'Viman Nagar'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'neha.kulkarni@greenleafdining.com');

-- 2f. Kothrud Katta Owner - Vikram Deshmukh (password: owner - for pending approval demo)
INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Vikram Deshmukh', 'vikram.deshmukh@kothrudkatta.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98233 77889', 'ROLE_MESS_OWNER', 'ACTIVE', 'MIT World Peace University', 'Kothrud'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'vikram.deshmukh@kothrudkatta.com');

-- 2g. Student User - Rahul Patil (password: student)
INSERT INTO users (name, email, password, phone, role, status, college, hostel, dietary_preference)
SELECT 'Rahul Patil', 'rahul.patil@coep.ac.in', '$2a$10$9tD2/CH8NGjaS7CzHuh03Ol.XZmrff7Cg34Smg2RaE5SX8p1gLsQe', '+91 91234 56789', 'ROLE_STUDENT', 'ACTIVE', 'COEP Technological University', 'Hostel Block C', 'VEG'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rahul.patil@coep.ac.in');

-- 2h. Student User - Ananya Joshi (password: student)
INSERT INTO users (name, email, password, phone, role, status, college, hostel, dietary_preference)
SELECT 'Ananya Joshi', 'ananya.joshi@pict.ac.in', '$2a$10$9tD2/CH8NGjaS7CzHuh03Ol.XZmrff7Cg34Smg2RaE5SX8p1gLsQe', '+91 98765 12345', 'ROLE_STUDENT', 'ACTIVE', 'Pune Institute of Computer Technology', 'Girls Hostel A', 'BOTH'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ananya.joshi@pict.ac.in');

-- ------------------------------------------------------------------------------
-- 3. Seed Realistic Pune Mess Listings
-- ------------------------------------------------------------------------------

-- Mess 1: Annapurna Deluxe Dining (Pure Veg, FC Road, APPROVED)
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Annapurna Pure Veg Mess',
    'Serving authentic, homestyle Maharashtrian & North Indian pure veg thalis. Unlimited bhaji, warm chapatis, dal tadka, and Sunday gulab jamun special.',
    '+91 98231 44550',
    'annapurna.pune@messmap.com',
    'Lane 4, Near Fergusson College Main Gate, FC Road',
    'Shivajinagar',
    'Pune',
    'Maharashtra',
    '411004',
    18.523600,
    73.841800,
    'PURE_VEG',
    3400.00,
    110.00,
    35.00,
    60.00,
    60.00,
    80,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:30',
    '22:00',
    '07:30 AM - 10:00 AM',
    '12:00 PM - 03:00 PM',
    '07:30 PM - 10:00 PM'
FROM users u
WHERE u.email = 'rajesh.sharma@annapurnamess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Annapurna Pure Veg Mess');

-- Mess 2: Maratha Darbar Dining (Non-Veg & Veg, Shivajinagar / COEP, APPROVED)
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Maratha Darbar Special Mess',
    'Renowned for spicy Kolhapuri chicken thalis, mutton rassa, and hearty vegetarian meals. Clean kitchen with separate veg and non-veg preparation sections.',
    '+91 98220 11223',
    'maratha.darbar@messmap.com',
    'Opposite COEP Hostel Gate, Wellesely Road',
    'Shivajinagar',
    'Pune',
    'Maharashtra',
    '411005',
    18.530800,
    73.856700,
    'VEG_AND_NON_VEG',
    4200.00,
    150.00,
    45.00,
    80.00,
    80.00,
    100,
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '08:00',
    '22:30',
    '08:00 AM - 10:30 AM',
    '12:30 PM - 03:30 PM',
    '07:30 PM - 10:30 PM'
FROM users u
WHERE u.email = 'suresh.patil@marathadarbar.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Maratha Darbar Special Mess');

-- Mess 3: Padmavati Jain & Gujarati Mess (Jain Friendly, Katraj / Bharati Vidyapeeth, APPROVED)
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Padmavati Jain & Gujarati Mess',
    'Strictly Jain and Gujarati cuisine with zero root vegetables (no onion, garlic, or potatoes). Wholesome rotlis, dal, kadhi, khichdi, and sweet Gujarati farsan.',
    '+91 98900 33445',
    'padmavati.jain@messmap.com',
    'Near Bharati Vidyapeeth Back Gate, Katraj-Dehu Road Bypass',
    'Katraj',
    'Pune',
    'Maharashtra',
    '411046',
    18.448200,
    73.858400,
    'JAIN_FRIENDLY',
    3100.00,
    95.00,
    30.00,
    55.00,
    55.00,
    65,
    'https://images.unsplash.com/photo-1505253758473-96b46deae2cd?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '08:00',
    '20:30',
    '08:00 AM - 10:00 AM',
    '11:30 AM - 02:30 PM',
    '06:30 PM - 08:30 PM'
FROM users u
WHERE u.email = 'bhavin.shah@padmavatimess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Padmavati Jain & Gujarati Mess');

-- Mess 4: Green Leaf Multi-Cuisine Dining (Viman Nagar / Symbiosis, APPROVED)
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Green Leaf Multi-Cuisine Dining',
    'Modern dining hall catering to engineering and management students. Serving North Indian paneer curries, South Indian dosas, and coastal fish curry specials on weekends.',
    '+91 97654 88990',
    'greenleaf.viman@messmap.com',
    'Row House 12, Dutta Mandir Chowk, Near Symbiosis International School',
    'Viman Nagar',
    'Pune',
    'Maharashtra',
    '411014',
    18.567900,
    73.914300,
    'VEG_AND_NON_VEG',
    4500.00,
    140.00,
    45.00,
    75.00,
    75.00,
    90,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:30',
    '22:00',
    '07:30 AM - 10:00 AM',
    '12:00 PM - 03:00 PM',
    '07:30 PM - 10:00 PM'
FROM users u
WHERE u.email = 'neha.kulkarni@greenleafdining.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Green Leaf Multi-Cuisine Dining');

-- Mess 5: Kothrud Katta Student Mess (Pure Veg, Kothrud, PENDING - specifically for Live Admin Approval Demo!)
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Kothrud Katta Student Mess',
    'Newly registered mess near MIT-WPU. Quality homemade pure vegetarian meals at budget student rates. Waiting for administrative campus verification.',
    '+91 98233 77889',
    'kothrud.katta@messmap.com',
    'Paud Road, Ideal Colony, Near MIT World Peace University',
    'Kothrud',
    'Pune',
    'Maharashtra',
    '411038',
    18.507400,
    73.807700,
    'PURE_VEG',
    2900.00,
    90.00,
    30.00,
    50.00,
    50.00,
    50,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'PENDING',
    'OPEN',
    '08:00',
    '21:30',
    '08:00 AM - 10:00 AM',
    '12:00 PM - 02:30 PM',
    '07:30 PM - 09:30 PM'
FROM users u
WHERE u.email = 'vikram.deshmukh@kothrudkatta.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Kothrud Katta Student Mess');

-- ------------------------------------------------------------------------------
-- 4. Associate Facilities with Messes
-- ------------------------------------------------------------------------------
-- Annapurna Mess Facilities (RO Water, WiFi, Parking Space, Monthly Card)
INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Annapurna Pure Veg Mess' AND f.name IN ('RO Purified Water', 'WiFi', 'Parking Space', 'Monthly Subscription Card')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

-- Maratha Darbar Facilities (AC Dining, RO Water, Parcel & Takeaway)
INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Maratha Darbar Special Mess' AND f.name IN ('AC Dining', 'RO Purified Water', 'Parcel & Takeaway')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

-- Padmavati Mess Facilities (RO Water, Monthly Card)
INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Padmavati Jain & Gujarati Mess' AND f.name IN ('RO Purified Water', 'Monthly Subscription Card')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

-- Green Leaf Facilities (AC Dining, WiFi, RO Water, Parcel & Takeaway)
INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Green Leaf Multi-Cuisine Dining' AND f.name IN ('AC Dining', 'WiFi', 'RO Purified Water', 'Parcel & Takeaway')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

-- ------------------------------------------------------------------------------
-- 5. Seed Weekly Menu Timetable & Dishes
-- ------------------------------------------------------------------------------

-- Annapurna Weekly Menu (Pure Veg)
INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'MONDAY', 'LUNCH', 'Shahi Paneer Thali', 'Paneer in rich cashew gravy, 3 chapatis, dal tadka, jeera rice, salad', 110.00, true, true
FROM messes m WHERE m.name = 'Annapurna Pure Veg Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Shahi Paneer Thali' AND mi.day_of_week = 'MONDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'MONDAY', 'DINNER', 'Aloo Gobi & Dal Fry', 'Homestyle aloo gobi, yellow dal fry, 3 warm rotis, steamed rice', 95.00, true, false
FROM messes m WHERE m.name = 'Annapurna Pure Veg Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Aloo Gobi & Dal Fry' AND mi.day_of_week = 'MONDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'WEDNESDAY', 'LUNCH', 'Chole Bhature Special', '2 fluffy bhature, pindi chole, pickled onions, fried green chilli', 120.00, true, true
FROM messes m WHERE m.name = 'Annapurna Pure Veg Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Chole Bhature Special' AND mi.day_of_week = 'WEDNESDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'SUNDAY', 'LUNCH', 'Maharashtrian Puran Poli Thali', '2 ghee puran polis, katachi amti, batata bhaji, kurdai, rice', 140.00, true, true
FROM messes m WHERE m.name = 'Annapurna Pure Veg Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Maharashtrian Puran Poli Thali' AND mi.day_of_week = 'SUNDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'DAILY', 'BREAKFAST', 'Poha & Masala Chai', 'Kanda poha topped with sev and fresh coriander, with hot ginger tea', 40.00, true, false
FROM messes m WHERE m.name = 'Annapurna Pure Veg Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Poha & Masala Chai' AND mi.day_of_week = 'DAILY');

-- Maratha Darbar Weekly Menu (Veg & Non-Veg)
INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'WEDNESDAY', 'DINNER', 'Kolhapuri Chicken Sukka Thali', 'Chicken sukka, tambda rassa, pandhra rassa, 2 bhakris, indrayani rice', 160.00, true, true
FROM messes m WHERE m.name = 'Maratha Darbar Special Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Kolhapuri Chicken Sukka Thali' AND mi.day_of_week = 'WEDNESDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'FRIDAY', 'DINNER', 'Special Egg Curry Thali', '2 boiled egg masala curry, 3 chapatis, steamed rice, kachumber', 120.00, true, false
FROM messes m WHERE m.name = 'Maratha Darbar Special Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Special Egg Curry Thali' AND mi.day_of_week = 'FRIDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'SUNDAY', 'LUNCH', 'Hyderabadi Chicken Dum Biryani', 'Aromatic dum biryani with raita, salan, and gulab jamun', 170.00, true, true
FROM messes m WHERE m.name = 'Maratha Darbar Special Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Hyderabadi Chicken Dum Biryani' AND mi.day_of_week = 'SUNDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'DAILY', 'LUNCH', 'Executive Veg Thali', '2 seasonal vegetable curries, dal tadka, 3 chapatis, rice, roasted papad', 90.00, true, false
FROM messes m WHERE m.name = 'Maratha Darbar Special Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Executive Veg Thali' AND mi.day_of_week = 'DAILY');

-- Padmavati Jain Mess Menu
INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'MONDAY', 'LUNCH', 'Authentic Jain Gujarati Thali', 'Karela besan sabji, sweet toor dal, 4 soft phulkas, jeera rice, chaas', 95.00, true, false
FROM messes m WHERE m.name = 'Padmavati Jain & Gujarati Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Authentic Jain Gujarati Thali' AND mi.day_of_week = 'MONDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'FRIDAY', 'DINNER', 'Kathiyawadi Khichdi & Kadhi', 'Vaghareli khichdi, sweet & sour Gujarati kadhi, 2 theplas, papad', 85.00, true, false
FROM messes m WHERE m.name = 'Padmavati Jain & Gujarati Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Kathiyawadi Khichdi & Kadhi' AND mi.day_of_week = 'FRIDAY');

-- ------------------------------------------------------------------------------
-- 6. Seed Sample Student Ratings & Reviews
-- ------------------------------------------------------------------------------
-- Rahul Patil reviews Annapurna Pure Veg Mess (5 Stars)
INSERT INTO reviews (mess_id, user_id, rating, comment, food_quality_score, hygiene_score, status)
SELECT m.id, u.id, 5, 'Best homemade Maharashtrian food near Fergusson College! Hygiene is top notch and chapati is always hot and soft.', 5, 5, 'PUBLISHED'
FROM messes m, users u
WHERE m.name = 'Annapurna Pure Veg Mess' AND u.email = 'rahul.patil@coep.ac.in'
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.mess_id = m.id AND r.user_id = u.id);

-- Ananya Joshi reviews Maratha Darbar (4 Stars)
INSERT INTO reviews (mess_id, user_id, rating, comment, food_quality_score, hygiene_score, status)
SELECT m.id, u.id, 4, 'Very good chicken sukka on Wednesday evenings. The tambda-pandhra rassa is authentic and spicy. Great value for hostelites.', 4, 4, 'PUBLISHED'
FROM messes m, users u
WHERE m.name = 'Maratha Darbar Special Mess' AND u.email = 'ananya.joshi@pict.ac.in'
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.mess_id = m.id AND r.user_id = u.id);

-- Rahul Patil adds Annapurna to Favorites
INSERT INTO favorites (user_id, mess_id)
SELECT u.id, m.id
FROM users u, messes m
WHERE u.email = 'rahul.patil@coep.ac.in' AND m.name = 'Annapurna Pure Veg Mess'
  AND NOT EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = u.id AND f.mess_id = m.id);
