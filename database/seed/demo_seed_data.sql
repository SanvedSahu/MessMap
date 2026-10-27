-- ==============================================================================
-- MessMap Presentation Demo Seed Dataset
-- File: database/seed/demo_seed_data.sql
-- Description: Comprehensive Pune campus messes covering 20 major localities,
--              weekly menus, facility associations, demo student/owner accounts,
--              and sample reviews for end-to-end evaluation.
--
-- Localities Covered (20):
--   1. JM Road              2. Shivaji Nagar        3. FC Road
--   4. Deccan Gymkhana      5. Kothrud              6. Karve Nagar
--   7. Katraj               8. Kondhwa              9. Viman Nagar
--  10. Kharadi             11. Hinjawadi           12. Wakad
--  13. Baner               14. Aundh               15. Hadapsar
--  16. Swargate            17. Bibwewadi           18. Camp
--  19. Pimple Saudagar     20. Warje
--
-- Idempotency Guarantee:
-- Safe for repeated execution on existing MySQL databases (messmap_dev_db).
-- Uses INSERT ... SELECT ... WHERE NOT EXISTS to guarantee zero duplicate keys.
--
-- Demo Accounts:
--   Admin:     admin@messmap.com               / admin
--   Owners:    rajesh.sharma@annapurnamess.com / owner
--              suresh.patil@marathadarbar.com   / owner
--              bhavin.shah@padmavatimess.com   / owner
--              neha.kulkarni@greenleafdining.com / owner
--              vikram.deshmukh@kothrudkatta.com / owner
--   Students:  rahul.patil@coep.ac.in          / student
--              ananya.joshi@pict.ac.in         / student
--              priya.deshmukh@mitwpu.edu.in    / student
--              aditya.kulkarni@coep.ac.in      / student
--              tanvi.shinde@bvp.edu.in         / student
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

-- 2b. Core Mess Owners (password: owner -> $2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS)
INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Rajesh Sharma', 'rajesh.sharma@annapurnamess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98231 44550', 'ROLE_MESS_OWNER', 'ACTIVE', 'Fergusson College Road', 'Near BMCC'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rajesh.sharma@annapurnamess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Suresh Patil', 'suresh.patil@marathadarbar.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98220 11223', 'ROLE_MESS_OWNER', 'ACTIVE', 'COEP Campus Area', 'Shivajinagar'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'suresh.patil@marathadarbar.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Bhavin Shah', 'bhavin.shah@padmavatimess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98900 33445', 'ROLE_MESS_OWNER', 'ACTIVE', 'Bharati Vidyapeeth', 'Katraj'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'bhavin.shah@padmavatimess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Neha Kulkarni', 'neha.kulkarni@greenleafdining.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 97654 88990', 'ROLE_MESS_OWNER', 'ACTIVE', 'Symbiosis Campus', 'Viman Nagar'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'neha.kulkarni@greenleafdining.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Vikram Deshmukh', 'vikram.deshmukh@kothrudkatta.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98233 77889', 'ROLE_MESS_OWNER', 'ACTIVE', 'MIT World Peace University', 'Kothrud'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'vikram.deshmukh@kothrudkatta.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Amit Joshi', 'amit.joshi@jmroadmess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98224 55667', 'ROLE_MESS_OWNER', 'ACTIVE', 'Modern College', 'JM Road'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'amit.joshi@jmroadmess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Ramesh Shinde', 'ramesh.shinde@deccanmess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98221 33441', 'ROLE_MESS_OWNER', 'ACTIVE', 'Garware College', 'Deccan'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ramesh.shinde@deccanmess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Sunita Kamble', 'sunita.kamble@karvenagarmess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98500 22334', 'ROLE_MESS_OWNER', 'ACTIVE', 'Cummins College of Engineering', 'Karve Nagar'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sunita.kamble@karvenagarmess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Tanmay Bhat', 'tanmay.bhat@hinjawadimess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98600 77881', 'ROLE_MESS_OWNER', 'ACTIVE', 'I2IT Hinjawadi', 'Phase 1'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tanmay.bhat@hinjawadimess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Pradeep Nair', 'pradeep.nair@banermess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98700 88992', 'ROLE_MESS_OWNER', 'ACTIVE', 'Balaji Institute', 'Baner'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'pradeep.nair@banermess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Anil More', 'anil.more@hadapsarmess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98800 99003', 'ROLE_MESS_OWNER', 'ACTIVE', 'PDEA College', 'Hadapsar'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'anil.more@hadapsarmess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Deepak Chavan', 'deepak.chavan@swargatemess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98901 11224', 'ROLE_MESS_OWNER', 'ACTIVE', 'SP College', 'Swargate'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'deepak.chavan@swargatemess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Rohit Shinde', 'rohit.shinde@pimplesaudagarmess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98211 44552', 'ROLE_MESS_OWNER', 'ACTIVE', 'DY Patil College', 'Pimple Saudagar'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rohit.shinde@pimplesaudagarmess.com');

INSERT INTO users (name, email, password, phone, role, status, college, hostel)
SELECT 'Santosh Jadhav', 'santosh.jadhav@warjemess.com', '$2a$10$0d8YvMv23XZbJMvfNW3Sqe53dzjYoEEdVrOopTk9WtbnOTuCx0.wS', '+91 98311 66773', 'ROLE_MESS_OWNER', 'ACTIVE', 'Cummins / Bharati', 'Warje'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'santosh.jadhav@warjemess.com');

-- 2c. Student Demo Accounts (password: student -> $2a$10$9tD2/CH8NGjaS7CzHuh03Ol.XZmrff7Cg34Smg2RaE5SX8p1gLsQe)
INSERT INTO users (name, email, password, phone, role, status, college, hostel, dietary_preference)
SELECT 'Rahul Patil', 'rahul.patil@coep.ac.in', '$2a$10$9tD2/CH8NGjaS7CzHuh03Ol.XZmrff7Cg34Smg2RaE5SX8p1gLsQe', '+91 91234 56789', 'ROLE_STUDENT', 'ACTIVE', 'COEP Technological University', 'Hostel Block C', 'VEG'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'rahul.patil@coep.ac.in');

INSERT INTO users (name, email, password, phone, role, status, college, hostel, dietary_preference)
SELECT 'Ananya Joshi', 'ananya.joshi@pict.ac.in', '$2a$10$9tD2/CH8NGjaS7CzHuh03Ol.XZmrff7Cg34Smg2RaE5SX8p1gLsQe', '+91 98765 12345', 'ROLE_STUDENT', 'ACTIVE', 'Pune Institute of Computer Technology', 'Girls Hostel A', 'BOTH'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ananya.joshi@pict.ac.in');

INSERT INTO users (name, email, password, phone, role, status, college, hostel, dietary_preference)
SELECT 'Priya Deshmukh', 'priya.deshmukh@mitwpu.edu.in', '$2a$10$9tD2/CH8NGjaS7CzHuh03Ol.XZmrff7Cg34Smg2RaE5SX8p1gLsQe', '+91 97654 32109', 'ROLE_STUDENT', 'ACTIVE', 'MIT World Peace University', 'B-Wing Room 204', 'VEG'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'priya.deshmukh@mitwpu.edu.in');

INSERT INTO users (name, email, password, phone, role, status, college, hostel, dietary_preference)
SELECT 'Aditya Kulkarni', 'aditya.kulkarni@coep.ac.in', '$2a$10$9tD2/CH8NGjaS7CzHuh03Ol.XZmrff7Cg34Smg2RaE5SX8p1gLsQe', '+91 96543 21098', 'ROLE_STUDENT', 'ACTIVE', 'COEP Technological University', 'Block A Room 102', 'BOTH'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'aditya.kulkarni@coep.ac.in');

INSERT INTO users (name, email, password, phone, role, status, college, hostel, dietary_preference)
SELECT 'Tanvi Shinde', 'tanvi.shinde@bvp.edu.in', '$2a$10$9tD2/CH8NGjaS7CzHuh03Ol.XZmrff7Cg34Smg2RaE5SX8p1gLsQe', '+91 95432 10987', 'ROLE_STUDENT', 'ACTIVE', 'Bharati Vidyapeeth University', 'Sarojini Hostel', 'VEG'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tanvi.shinde@bvp.edu.in');

-- ------------------------------------------------------------------------------
-- 3. Seed Realistic Pune Mess Listings for All 20 Localities
-- ------------------------------------------------------------------------------

-- Locality 1: JM Road
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Prashant Pure Veg Dining',
    'Wholesome Maharashtrian and Gujarati vegetarian meals on JM Road. Unlimited poli, dal fry, freshly roasted papad, and weekend sweet dishes.',
    '+91 98224 55667',
    'prashant.jmroad@messmap.com',
    'Opposite Sambhaji Park, Off Jangali Maharaj Road',
    'JM Road',
    'Pune',
    'Maharashtra',
    '411005',
    18.525500,
    73.847500,
    'PURE_VEG',
    3500.00,
    115.00,
    35.00,
    65.00,
    65.00,
    75,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:30',
    '22:00',
    '07:30 AM - 10:00 AM',
    '12:00 PM - 03:00 PM',
    '07:30 PM - 10:00 PM'
FROM users u WHERE u.email = 'amit.joshi@jmroadmess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Prashant Pure Veg Dining');

-- Locality 2: Shivaji Nagar
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
    'Shivaji Nagar',
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
FROM users u WHERE u.email = 'suresh.patil@marathadarbar.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Maratha Darbar Special Mess');

-- Locality 3: FC Road
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
    'FC Road',
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
FROM users u WHERE u.email = 'rajesh.sharma@annapurnamess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Annapurna Pure Veg Mess');

-- Locality 4: Deccan Gymkhana
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Deccan Gymkhana Homestyle Mess',
    'Clean, spacious student mess near Garware College. Freshly cooked chapati-bhaji, dal khichdi, mattha, and special poori bhaji on Wednesdays.',
    '+91 98221 33441',
    'deccan.mess@messmap.com',
    'Prabhat Road Lane 1, Deccan Gymkhana',
    'Deccan Gymkhana',
    'Pune',
    'Maharashtra',
    '411004',
    18.516700,
    73.841700,
    'PURE_VEG',
    3300.00,
    105.00,
    30.00,
    60.00,
    60.00,
    70,
    'https://images.unsplash.com/photo-1505253758473-96b46deae2cd?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:45',
    '21:45',
    '07:45 AM - 09:45 AM',
    '12:15 PM - 03:00 PM',
    '07:45 PM - 09:45 PM'
FROM users u WHERE u.email = 'ramesh.shinde@deccanmess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Deccan Gymkhana Homestyle Mess');

-- Locality 5: Kothrud
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
FROM users u WHERE u.email = 'vikram.deshmukh@kothrudkatta.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Kothrud Katta Student Mess');

-- Locality 6: Karve Nagar
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Cummins College Special Mess',
    'Dedicated student dining facility near Cummins College. Clean RO drinking water, nutritious balanced diet with leafy vegetables, sprouts, and paneer.',
    '+91 98500 22334',
    'cummins.mess@messmap.com',
    'Hingne Budruk, Near Cummins College of Engineering, Karve Nagar',
    'Karve Nagar',
    'Pune',
    'Maharashtra',
    '411052',
    18.489400,
    73.819700,
    'PURE_VEG',
    3200.00,
    100.00,
    30.00,
    55.00,
    55.00,
    65,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:30',
    '21:30',
    '07:30 AM - 09:30 AM',
    '12:00 PM - 02:45 PM',
    '07:30 PM - 09:30 PM'
FROM users u WHERE u.email = 'sunita.kamble@karvenagarmess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Cummins College Special Mess');

-- Locality 7: Katraj
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
FROM users u WHERE u.email = 'bhavin.shah@padmavatimess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Padmavati Jain & Gujarati Mess');

-- Locality 8: Kondhwa
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Kondhwa Campus Deluxe Dining',
    'Serving hearty multi-cuisine veg and non-veg meals near NIBM and Kondhwa engineering institutions. Famous for egg bhurji and chicken biryani on Sundays.',
    '+91 98901 11224',
    'kondhwa.dining@messmap.com',
    'Kausar Baug Road, Kondhwa Main Market',
    'Kondhwa',
    'Pune',
    'Maharashtra',
    '411048',
    18.473500,
    73.894300,
    'VEG_AND_NON_VEG',
    3900.00,
    130.00,
    40.00,
    70.00,
    70.00,
    85,
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '08:00',
    '22:00',
    '08:00 AM - 10:00 AM',
    '12:30 PM - 03:00 PM',
    '07:30 PM - 10:00 PM'
FROM users u WHERE u.email = 'deepak.chavan@swargatemess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Kondhwa Campus Deluxe Dining');

-- Locality 9: Viman Nagar
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
FROM users u WHERE u.email = 'neha.kulkarni@greenleafdining.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Green Leaf Multi-Cuisine Dining');

-- Locality 10: Kharadi
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'EON Tech Park & Student Mess',
    'Convenient student and fresher mess near EON Free Zone. Quick self-service counter, hot rotis, unlimited sambar-rice, and weekly egg/chicken curry.',
    '+91 98800 99003',
    'eon.mess@messmap.com',
    'Chandan Nagar Bypass, Near EON IT Park, Kharadi',
    'Kharadi',
    'Pune',
    'Maharashtra',
    '411014',
    18.552900,
    73.945800,
    'VEG_AND_NON_VEG',
    3800.00,
    125.00,
    35.00,
    65.00,
    65.00,
    95,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:30',
    '22:30',
    '07:30 AM - 10:00 AM',
    '12:00 PM - 03:30 PM',
    '07:30 PM - 10:30 PM'
FROM users u WHERE u.email = 'anil.more@hadapsarmess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'EON Tech Park & Student Mess');

-- Locality 11: Hinjawadi
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Hinjawadi Phase 1 Executive Mess',
    'High-volume student mess near IT colleges and tech hubs. Hygienic stainless steel kitchen, monthly cards, parcel facility, and healthy millet rotis.',
    '+91 98600 77881',
    'hinjawadi.mess@messmap.com',
    'Behind Infosys Circle, Phase 1, Hinjawadi',
    'Hinjawadi',
    'Pune',
    'Maharashtra',
    '411057',
    18.591300,
    73.738900,
    'VEG_AND_NON_VEG',
    4100.00,
    135.00,
    40.00,
    70.00,
    70.00,
    120,
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:30',
    '22:30',
    '07:30 AM - 10:00 AM',
    '12:15 PM - 03:15 PM',
    '07:30 PM - 10:30 PM'
FROM users u WHERE u.email = 'tanmay.bhat@hinjawadimess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Hinjawadi Phase 1 Executive Mess');

-- Locality 12: Wakad
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Wakad Student Food Point',
    'Budget-friendly thali center near Datta Mandir Chowk, Wakad. Clean dining hall serving 2 vegetables, dal fry, rice, 4 rotis, and pickle.',
    '+91 98600 77881',
    'wakad.foodpoint@messmap.com',
    'Datta Mandir Road, Shankar Kalat Nagar, Wakad',
    'Wakad',
    'Pune',
    'Maharashtra',
    '411057',
    18.598700,
    73.766500,
    'PURE_VEG',
    3100.00,
    95.00,
    30.00,
    55.00,
    55.00,
    60,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '08:00',
    '21:45',
    '08:00 AM - 10:00 AM',
    '12:00 PM - 02:45 PM',
    '07:30 PM - 09:45 PM'
FROM users u WHERE u.email = 'tanmay.bhat@hinjawadimess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Wakad Student Food Point');

-- Locality 13: Baner
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Baner Highstreet Student Dining',
    'Premium student mess with AC dining room. Separate vegetarian and non-vegetarian sections, salad bar, curd, and daily fresh fruit.',
    '+91 98700 88992',
    'baner.highstreet@messmap.com',
    'Near Pan Card Club Road, Baner',
    'Baner',
    'Pune',
    'Maharashtra',
    '411045',
    18.559000,
    73.786800,
    'VEG_AND_NON_VEG',
    4400.00,
    145.00,
    45.00,
    75.00,
    75.00,
    80,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:45',
    '22:00',
    '07:45 AM - 10:00 AM',
    '12:15 PM - 03:00 PM',
    '07:45 PM - 10:00 PM'
FROM users u WHERE u.email = 'pradeep.nair@banermess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Baner Highstreet Student Dining');

-- Locality 14: Aundh
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Aundh Campus Gourmet Mess',
    'Homestyle cuisine specializing in South Indian breakfast and Maharashtrian lunch thalis. Clean ambient seating near DP Road, Aundh.',
    '+91 98700 88992',
    'aundh.gourmet@messmap.com',
    'DP Road, Ward No 8, Near Medipoint Hospital, Aundh',
    'Aundh',
    'Pune',
    'Maharashtra',
    '411007',
    18.562600,
    73.808700,
    'PURE_VEG',
    3600.00,
    115.00,
    35.00,
    65.00,
    65.00,
    70,
    'https://images.unsplash.com/photo-1505253758473-96b46deae2cd?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:30',
    '21:30',
    '07:30 AM - 09:45 AM',
    '12:00 PM - 02:45 PM',
    '07:30 PM - 09:30 PM'
FROM users u WHERE u.email = 'pradeep.nair@banermess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Aundh Campus Gourmet Mess');

-- Locality 15: Hadapsar
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Magarpatta City Corner Mess',
    'Budget student bhojanalaya near Magarpatta South Gate. Freshly baked bhakris, pithla, usal, and seasonal vegetable preparations.',
    '+91 98800 99003',
    'hadapsar.corner@messmap.com',
    'South Gate, Magarpatta City, Hadapsar',
    'Hadapsar',
    'Pune',
    'Maharashtra',
    '411028',
    18.508900,
    73.926000,
    'PURE_VEG',
    3000.00,
    95.00,
    30.00,
    55.00,
    55.00,
    85,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '08:00',
    '21:30',
    '08:00 AM - 10:00 AM',
    '12:00 PM - 02:45 PM',
    '07:30 PM - 09:30 PM'
FROM users u WHERE u.email = 'anil.more@hadapsarmess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Magarpatta City Corner Mess');

-- Locality 16: Swargate
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Swargate Express Bhojanalaya',
    'Popular student mess situated right next to SP College and Swargate hub. Fast counter service, hot chapatis on demand, and tasty buttermilk.',
    '+91 98901 11224',
    'swargate.express@messmap.com',
    'Tilak Road, Near SP College Gate, Swargate',
    'Swargate',
    'Pune',
    'Maharashtra',
    '411042',
    18.501800,
    73.857600,
    'PURE_VEG',
    3200.00,
    100.00,
    30.00,
    55.00,
    55.00,
    75,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:30',
    '22:00',
    '07:30 AM - 09:45 AM',
    '11:45 AM - 03:00 PM',
    '07:15 PM - 10:00 PM'
FROM users u WHERE u.email = 'deepak.chavan@swargatemess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Swargate Express Bhojanalaya');

-- Locality 17: Bibwewadi
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'VIIT Bibwewadi Student Mess',
    'Affordable student dining hub near Vishwakarma Institute of Information Technology. Serves hygienic lunch and dinner with clean purified water.',
    '+91 98900 33445',
    'viit.bibwewadi@messmap.com',
    'Upper Indira Nagar, Near VIIT College, Bibwewadi',
    'Bibwewadi',
    'Pune',
    'Maharashtra',
    '411037',
    18.468200,
    73.861500,
    'PURE_VEG',
    2950.00,
    90.00,
    25.00,
    50.00,
    50.00,
    65,
    'https://images.unsplash.com/photo-1505253758473-96b46deae2cd?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '08:00',
    '21:30',
    '08:00 AM - 10:00 AM',
    '12:00 PM - 02:45 PM',
    '07:30 PM - 09:30 PM'
FROM users u WHERE u.email = 'bhavin.shah@padmavatimess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'VIIT Bibwewadi Student Mess');

-- Locality 18: Camp
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'MG Road Pune Camp Bhojanalay',
    'Heritage Pune Camp dining offering wholesome North Indian & Parsi-style curries, fresh dal fry, and steaming hot jeera rice.',
    '+91 98221 33441',
    'camp.bhojanalay@messmap.com',
    'East Street, Near MG Road, Pune Camp',
    'Camp',
    'Pune',
    'Maharashtra',
    '411001',
    18.513300,
    73.878900,
    'VEG_AND_NON_VEG',
    3700.00,
    120.00,
    35.00,
    65.00,
    65.00,
    70,
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '08:00',
    '22:00',
    '08:00 AM - 10:00 AM',
    '12:30 PM - 03:00 PM',
    '07:30 PM - 10:00 PM'
FROM users u WHERE u.email = 'ramesh.shinde@deccanmess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'MG Road Pune Camp Bhojanalay');

-- Locality 19: Pimple Saudagar
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Pimple Saudagar Classic Tiffin',
    'Homely tiffin center with high hygiene standards. Offers customized monthly tiffins and dine-in thalis for college students and interns.',
    '+91 98211 44552',
    'pimplesaudagar.tiffin@messmap.com',
    'Kunadal Road, Near Govind Garden, Pimple Saudagar',
    'Pimple Saudagar',
    'Pune',
    'Maharashtra',
    '411027',
    18.598500,
    73.799700,
    'PURE_VEG',
    3350.00,
    105.00,
    30.00,
    60.00,
    60.00,
    60,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '07:30',
    '21:45',
    '07:30 AM - 09:45 AM',
    '12:00 PM - 02:45 PM',
    '07:30 PM - 09:45 PM'
FROM users u WHERE u.email = 'rohit.shinde@pimplesaudagarmess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Pimple Saudagar Classic Tiffin');

-- Locality 20: Warje
INSERT INTO messes (
    owner_id, name, description, phone, email, address, area, city, state, pincode,
    latitude, longitude, food_type, monthly_price, daily_price, breakfast_price, lunch_price, dinner_price,
    capacity, hero_image, status, operating_status, opening_time, closing_time,
    breakfast_timing, lunch_timing, dinner_timing
)
SELECT
    u.id,
    'Warje Malhar Student Dining',
    'Authentic rural Maharashtrian cuisine with jowar bhakri, thecha, shenga chutney, dal tadka, and unlimited rice on the Mumbai-Bangalore Highway.',
    '+91 98311 66773',
    'warje.malhar@messmap.com',
    'Mai Mangeshkar Hospital Road, Warje Flyover',
    'Warje',
    'Pune',
    'Maharashtra',
    '411058',
    18.478400,
    73.795600,
    'PURE_VEG',
    2850.00,
    90.00,
    25.00,
    50.00,
    50.00,
    75,
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    'APPROVED',
    'OPEN',
    '08:00',
    '21:30',
    '08:00 AM - 10:00 AM',
    '12:00 PM - 02:45 PM',
    '07:30 PM - 09:30 PM'
FROM users u WHERE u.email = 'santosh.jadhav@warjemess.com'
  AND NOT EXISTS (SELECT 1 FROM messes WHERE name = 'Warje Malhar Student Dining');

-- ------------------------------------------------------------------------------
-- 4. Associate Facilities with Messes
-- ------------------------------------------------------------------------------
INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Annapurna Pure Veg Mess' AND f.name IN ('RO Purified Water', 'WiFi', 'Parking Space', 'Monthly Subscription Card')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Maratha Darbar Special Mess' AND f.name IN ('AC Dining', 'RO Purified Water', 'Parcel & Takeaway')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Padmavati Jain & Gujarati Mess' AND f.name IN ('RO Purified Water', 'Monthly Subscription Card')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Green Leaf Multi-Cuisine Dining' AND f.name IN ('AC Dining', 'WiFi', 'RO Purified Water', 'Parcel & Takeaway')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Hinjawadi Phase 1 Executive Mess' AND f.name IN ('AC Dining', 'WiFi', 'RO Purified Water', 'Parking Space', 'Monthly Subscription Card')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

INSERT INTO mess_facilities (mess_id, facility_id)
SELECT m.id, f.id FROM messes m, facilities f
WHERE m.name = 'Baner Highstreet Student Dining' AND f.name IN ('AC Dining', 'WiFi', 'RO Purified Water', 'Parcel & Takeaway')
  AND NOT EXISTS (SELECT 1 FROM mess_facilities mf WHERE mf.mess_id = m.id AND mf.facility_id = f.id);

-- ------------------------------------------------------------------------------
-- 5. Seed Weekly Menu Timetable & Dishes
-- ------------------------------------------------------------------------------
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

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'WEDNESDAY', 'DINNER', 'Kolhapuri Chicken Sukka Thali', 'Chicken sukka, tambda rassa, pandhra rassa, 2 bhakris, indrayani rice', 160.00, true, true
FROM messes m WHERE m.name = 'Maratha Darbar Special Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Kolhapuri Chicken Sukka Thali' AND mi.day_of_week = 'WEDNESDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'SUNDAY', 'LUNCH', 'Hyderabadi Chicken Dum Biryani', 'Aromatic dum biryani with raita, salan, and gulab jamun', 170.00, true, true
FROM messes m WHERE m.name = 'Maratha Darbar Special Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Hyderabadi Chicken Dum Biryani' AND mi.day_of_week = 'SUNDAY');

INSERT INTO menu_items (mess_id, day_of_week, meal_type, name, description, price, is_available, is_special)
SELECT m.id, 'DAILY', 'LUNCH', 'Executive Veg Thali', '2 seasonal vegetable curries, dal tadka, 3 chapatis, rice, roasted papad', 90.00, true, false
FROM messes m WHERE m.name = 'Maratha Darbar Special Mess'
  AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.mess_id = m.id AND mi.name = 'Executive Veg Thali' AND mi.day_of_week = 'DAILY');

-- ------------------------------------------------------------------------------
-- 6. Seed Sample Student Ratings & Reviews
-- ------------------------------------------------------------------------------
INSERT INTO reviews (mess_id, user_id, rating, comment, food_quality_score, hygiene_score, status)
SELECT m.id, u.id, 5, 'Best homemade Maharashtrian food near Fergusson College! Hygiene is top notch and chapati is always hot and soft.', 5, 5, 'PUBLISHED'
FROM messes m, users u
WHERE m.name = 'Annapurna Pure Veg Mess' AND u.email = 'rahul.patil@coep.ac.in'
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.mess_id = m.id AND r.user_id = u.id);

INSERT INTO reviews (mess_id, user_id, rating, comment, food_quality_score, hygiene_score, status)
SELECT m.id, u.id, 4, 'Very good chicken sukka on Wednesday evenings. The tambda-pandhra rassa is authentic and spicy. Great value for hostelites.', 4, 4, 'PUBLISHED'
FROM messes m, users u
WHERE m.name = 'Maratha Darbar Special Mess' AND u.email = 'ananya.joshi@pict.ac.in'
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.mess_id = m.id AND r.user_id = u.id);

INSERT INTO reviews (mess_id, user_id, rating, comment, food_quality_score, hygiene_score, status)
SELECT m.id, u.id, 5, 'Cleanest kitchen in Kothrud! Soft phulkas and fresh vegetables every afternoon.', 5, 5, 'PUBLISHED'
FROM messes m, users u
WHERE m.name = 'Prashant Pure Veg Dining' AND u.email = 'priya.deshmukh@mitwpu.edu.in'
  AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.mess_id = m.id AND r.user_id = u.id);

-- ------------------------------------------------------------------------------
-- 7. Seed Student Favorites
-- ------------------------------------------------------------------------------
INSERT INTO favorites (user_id, mess_id)
SELECT u.id, m.id
FROM users u, messes m
WHERE u.email = 'rahul.patil@coep.ac.in' AND m.name = 'Annapurna Pure Veg Mess'
  AND NOT EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = u.id AND f.mess_id = m.id);

INSERT INTO favorites (user_id, mess_id)
SELECT u.id, m.id
FROM users u, messes m
WHERE u.email = 'ananya.joshi@pict.ac.in' AND m.name = 'Maratha Darbar Special Mess'
  AND NOT EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = u.id AND f.mess_id = m.id);

INSERT INTO favorites (user_id, mess_id)
SELECT u.id, m.id
FROM users u, messes m
WHERE u.email = 'priya.deshmukh@mitwpu.edu.in' AND m.name = 'Annapurna Pure Veg Mess'
  AND NOT EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = u.id AND f.mess_id = m.id);

-- ------------------------------------------------------------------------------
-- 8. Seed Initial In-App Student Notifications
-- ------------------------------------------------------------------------------
INSERT INTO notifications (recipient_id, mess_id, title, message, type, is_read)
SELECT u.id, m.id, 'Annapurna Pure Veg Mess is now open!', 'Annapurna Pure Veg Mess has opened for meal service. Hot meals are ready!', 'MESS_OPENED', false
FROM users u, messes m
WHERE u.email = 'rahul.patil@coep.ac.in' AND m.name = 'Annapurna Pure Veg Mess'
  AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.recipient_id = u.id AND n.mess_id = m.id);
