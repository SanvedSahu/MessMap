MESSMAP — DETAILED SYSTEM ARCHITECTURE
========================================
Final-Year Project | Mentor Presentation
Proposed Java Full Stack Architecture

1. INTRODUCTION
----------------------------------
MessMap is a location-based web application that helps students discover nearby mess services and view location, pricing, food type, meal availability, menus, timings, contact details, closures, and reviews.

The system has three main user roles:
1. Student
2. Mess Owner
3. Administrator

The architecture follows a three-tier design:
- Presentation Layer: React.js frontend
- Application Layer: Java Spring Boot backend
- Data Layer: MySQL database

External services such as browser geolocation and map services support location-based discovery.


2. HIGH-LEVEL SYSTEM ARCHITECTURE
----------------------------------------------------------

                  MESSMAP WEB APPLICATION
                            |
        +-------------------+-------------------+
        |                   |                   |
        v                   v                   v
     STUDENT             MESS OWNER          ADMIN
        |                   |                   |
        +-------------------+-------------------+
                            |
                            v
              PRESENTATION LAYER — REACT.JS
        +------------------------------------------+
        | Student Interface                        |
        | Owner Dashboard                          |
        | Admin Dashboard                          |
        | Search, Filters, Forms, Menus, Reviews   |
        | Map and Mess Markers                     |
        +------------------------------------------+
                            |
                    HTTPS / REST API
                       JSON Data
                            |
                            v
             APPLICATION LAYER — JAVA
                    SPRING BOOT
        +------------------------------------------+
        | Authentication and Authorization         |
        | Mess Management                          |
        | Location-Based Search                    |
        | Menu Management                          |
        | Availability and Closure Management      |
        | Reviews and Ratings                      |
        | Admin Verification                       |
        +------------------------------------------+
                            |
                    Spring Data JPA
                       / Hibernate
                            |
                            v
                  DATA LAYER — MYSQL
        +------------------------------------------+
        | Users                                    |
        | Messes                                   |
        | Menus                                    |
        | Closures                                 |
        | Reviews                                  |
        | Reports                                  |
        +------------------------------------------+

EXTERNAL LOCATION AND MAP SERVICES
----------------------------------
Browser Geolocation API:
  Gets the student's coordinates after permission.

Leaflet + OpenStreetMap:
  Displays the map and mess markers.

Note: Map tiles, geocoding, and directions may rely on separate external
services and their usage policies.


3. EXPLANATION OF EACH LAYER
----------------------------

3.1 PRESENTATION LAYER — FRONTEND
Technology: React.js, HTML, CSS, JavaScript

The presentation layer is the part of MessMap users interact with in a browser.
It displays information and sends requests to the backend.

Student Interface:
- Search nearby messes.
- Apply filters for distance, price, food type, meal availability, and rating if implemented.
- View mess details, menu, prices, timings, and contact details.
- View the map and get directions.
- Submit reviews and ratings if included.

Mess Owner Dashboard:
- Register and submit a mess listing.
- Select the mess location on a map or enter an address.
- Update menu, pricing, timings, contact details, and availability.
- Mark the mess as open, closed, or temporarily closed.
- Enter planned holidays or closure periods.

Admin Dashboard:
- Review submitted listings.
- Approve or reject mess listings.
- Manage users and owners.
- Review reports and moderate inappropriate content.

React communicates with Spring Boot using REST APIs. It does not directly access MySQL.


3.2 APPLICATION LAYER — BACKEND
Technology: Java and Spring Boot

The application layer handles requests, validates data, enforces business rules,
and communicates with the database.

Main backend modules:

1. Authentication Module
   Handles registration, login, and identity verification.

2. Authorization Module
   Checks whether the user is a Student, Owner, or Admin.

3. Mess Management Module
   Creates, retrieves, updates, and manages mess listings.

4. Location and Search Module
   Finds nearby messes and applies search filters.

5. Menu Management Module
   Saves and retrieves daily or weekly menu information.

6. Availability Management Module
   Handles opening status, temporary closures, and planned holidays.

7. Review Management Module
   Stores and retrieves ratings and reviews, if implemented.

8. Admin Management Module
   Supports listing approval, user management, and content moderation.

Recommended internal backend structure:
- Controller: receives HTTP requests.
- Service: implements business rules.
- Repository: reads and writes database data.
- Entity: represents database records.
- DTO (Data Transfer Object): defines data sent to and received from APIs.

This separation makes the backend easier to test and maintain.

## 3.3 DATA LAYER — DATABASE

Technologies: MySQL, Spring Data JPA, Hibernate

MySQL stores application data, while Spring Data JPA and Hibernate help the Java backend interact with database tables.

Database Name: messmap_db

Tables and Columns:

1. users
- User ID, Name, Email, Phone, Password, Role, Avatar URL, Created At, Updated At

2. messes
- Mess ID, Owner ID, Name, Description, Phone, Email, Address, Area, City, State, Pincode, Latitude, Longitude, Daily Price, Monthly Price, Food Type, Status, Opening Time, Closing Time, Active Status

3. menu_items
- Item ID, Mess ID, Name, Description, Meal Type, Price, Availability, Created At, Updated At

4. facilities
- Facility ID, Facility Name

5. mess_facilities
- Mess ID, Facility ID

6. mess_images
- Image ID, Mess ID, Image URL, Primary Image Status, Created At

7. favorites
- Favourite ID, User ID, Mess ID, Created At

8. reviews
- Review ID, User ID, Mess ID, Rating, Comment, Created At, Updated At

Relationships:
- One owner can manage multiple mess listings.
- One mess can have multiple menu items and images.
- Users can save multiple messes as favourites.
- Users can review multiple messes.
- Messes and facilities have a many-to-many relationship through `mess_facilities`.


4. LOCATION-BASED MESS DISCOVERY
--------------------------------

MessMap's main feature is finding messes near a student's location.

Location search workflow:
1. The student opens the map or nearby-search page.
2. The browser asks permission to access the student's location.
3. If permission is granted, the Geolocation API provides latitude and longitude.
4. React sends the coordinates and selected search radius to Spring Boot.
5. Spring Boot searches the database for published and approved messes.
6. The backend calculates distance using the Haversine formula or another suitable
   geographic-distance calculation.
7. Matching mess details and distances are returned to React.
8. React displays the results as a list and, where map integration is enabled,
   as markers on the map.

Example (illustrative data only):
Mess A — 0.5 km — Rs. 2,800/month
Mess B — 1.2 km — Rs. 2,500/month
Mess C — 2.1 km — Rs. 3,000/month

A student may then filter results by distance, price, food type, meal availability,
or rating.

Important details:
- The mess owner supplies an address and selects the location on a map or enters coordinates.
- Latitude and longitude are stored in MySQL.
- Leaflet displays the map; OpenStreetMap can supply map data.
- These services do not automatically create MessMap's mess database.
- If location permission is denied, the system should ideally support area/address
  search or manual location selection.
- A listing without valid coordinates may appear in text search but should not be
  shown as a precise map marker.


5. COMPLETE SYSTEM WORKFLOW
---------------------------

A. STUDENT WORKFLOW
1. Open MessMap website.
2. Register or log in, if required for the selected feature.
3. Allow location access or choose an area manually.
4. Search nearby messes.
5. Apply filters such as distance, price, food type, meal availability, and rating.
6. View mess details: menu, price, timings, availability, contact details, reviews,
   and location.
7. Compare messes.
8. Select a suitable mess.
9. Get directions or contact the owner.
10. Submit a review/rating if that feature is implemented.

B. MESS OWNER WORKFLOW
1. Open MessMap and register/log in as an owner.
2. Enter owner details.
3. Enter mess details, prices, food type, meal availability, contact details, and address.
4. Select the mess location on a map or provide valid coordinates.
5. Submit the listing.
6. The listing receives a PENDING status if admin approval is enabled.
7. The admin reviews the submission.
8. If approved, the listing becomes visible in public search.
9. The owner manages the profile, menu, prices, timings, availability, holidays,
   and closure status.
10. Students see the latest saved information.

C. ADMIN WORKFLOW
1. Log in to the admin dashboard.
2. View pending mess submissions.
3. Check the submitted information.
4. Approve or reject the listing.
5. Manage user/owner accounts as authorized.
6. Review reports and moderate inappropriate reviews if those features are implemented.
7. Deactivate invalid or misleading listings when necessary.


6. EXAMPLE OF A NEW MESS JOINING MESSMAP
----------------------------------------

1. The owner creates an account and submits the mess information.
2. The backend validates the submitted fields.
3. The listing is stored with status PENDING.
4. The admin reviews the listing.
5. If approved, the listing becomes public.
6. The owner updates the menu or marks the mess temporarily closed.
7. Students see the latest saved updates on the listing.

For the college prototype, the team can use a small set of verified local listings
and clearly labelled sample records. In a real deployment, owners can submit their
own listings, reducing the need for the project team to manually enter every mess.


7. AUTHENTICATION AND SECURITY
------------------------------

Proposed technology: Spring Security and JWT, if JWT is selected as the authentication method.

Student permissions:
- Search and view public mess listings.
- Submit reviews if enabled.

Owner permissions:
- Create and edit their own mess listings.
- Update menus, prices, and availability.
- They must not edit another owner's listing.

Admin permissions:
- Approve or reject listings.
- Manage accounts and reports within the administrator role.

Security requirements:
- Store passwords as secure hashes, never plain text.
- Require authentication for protected APIs.
- Enforce authorization on the backend, not only in the frontend.
- Keep database credentials and secret keys out of client-side code and source control.
- Use HTTPS in production.
- Validate user input.
- Request location permission only when needed and explain why it is needed.
- Provide a reasonable alternative if location access is denied.


8. PROPOSED REST API ENDPOINTS
------------------------------

These are example endpoints and may be adjusted during implementation.

Authentication:
- POST /api/auth/register — register a user.
- POST /api/auth/login — authenticate a user.

Public mess discovery:
- GET /api/messes — retrieve published mess listings.
- GET /api/messes/nearby?lat={lat}&lon={lon}&radiusKm={radius} — search nearby messes.
- GET /api/messes/{id} — retrieve mess details.
- GET /api/messes/{id}/menu — retrieve the mess menu.

Owner functions:
- POST /api/owner/messes — submit a mess listing.
- PUT /api/owner/messes/{id} — update an authorized listing.
- PATCH /api/owner/messes/{id}/status — update operating status.
- POST /api/owner/messes/{id}/menus — add a menu entry.

Admin functions:
- GET /api/admin/messes?status=pending — view pending listings.
- PATCH /api/admin/messes/{id}/approval — approve or reject a listing.
- GET /api/admin/reports — view reports if implemented.

React sends HTTP requests to these endpoints. Spring Boot validates the request,
applies business rules, accesses MySQL through JPA/Hibernate, and returns a JSON response.


9. NON-FUNCTIONAL REQUIREMENTS
-----------------------------

Performance:
- For the demonstration dataset and normal network conditions, target common search/detail
  API responses within 2 seconds at the 95th percentile, excluding external map loading.
  This is a target to test, not a guarantee.

Usability:
- Keep the student search flow simple.
- Make owner menu updates straightforward.
- Display clear validation, empty-result, loading, and error messages.

Security:
- Use password hashing, authentication, backend role checks, and input validation.

Reliability:
- Show a helpful error if the API, database, or map service is unavailable.
- Do not show an update as successful unless the backend confirms it.

Maintainability:
- Separate frontend components and backend controller, service, and repository layers.
- Use consistent naming and document configuration.

Compatibility:
- Support current mainstream desktop and mobile browsers.

Scalability:
- Allow new messes to be added through data entry and owner registration without changing
  the code for every listing. Larger-scale performance requires testing.

Privacy:
- Collect only required personal information.
- Explain location use.
- Do not expose private account details publicly.


10. ERROR AND EDGE CASE HANDLING
--------------------------------

- Location permission denied: offer area/address search or manual map selection.
- No messes found: show an empty-result message and allow the student to expand the radius
  or change filters.
- Missing menu or price: show “Not provided” rather than inventing data.
- Invalid coordinates: ask for correction and do not save an invalid map point.
- API or database failure: show a retryable error.
- Owner tries to edit another owner's listing: reject the request with an authorization error.
- Listing pending or rejected: do not show it as an approved public listing.
- Map service unavailable: retain list-based discovery if the backend is available.


11. TESTING STRATEGY
--------------------

Unit tests:
- Input validation.
- Distance calculation.
- Listing approval logic.
- Owner-ownership checks.

API integration tests:
- Registration and login.
- Listing creation and updates.
- Nearby search and filters.
- Menu updates.
- Admin approval.

Frontend tests/manual checks:
- Student search flow.
- Owner registration and dashboard.
- Admin review workflow.
- Location-denied fallback.
- Mobile/responsive layout.
- Loading, empty, and error states.

Acceptance tests should verify that approved messes are visible, pending messes are hidden
from public search, owners can update only their own data, and saved menu/closure changes
appear to students.


12. DEPLOYMENT AND MAINTENANCE
------------------------------

- Deploy the React frontend and Spring Boot backend to suitable hosting services.
- Configure the frontend API URL and backend secrets using environment configuration.
- Host MySQL using a managed database or an appropriately secured database server.
- Do not commit passwords, API keys, or database credentials to GitHub.
- Review map tile/geocoding provider terms and usage limits.
- Document build, configuration, run, and deployment steps.
- Consider database backups if real pilot data is collected.
- Define who is responsible for reviewing listings and reports.


13. LIMITATIONS
---------------

- Listing accuracy depends on owners/admins keeping details updated.
- Browser location accuracy varies by device and permission.
- Map coverage, geocoding, and routing depend on the selected provider.
- Reviews can be biased or misleading and may require moderation.
- The application does not independently certify food hygiene or guarantee that a mess is open.
- A college prototype with sample data does not prove adoption by a large number of owners.


14. FUTURE ENHANCEMENTS
-----------------------

Possible future features:
- Owner phone verification.
- Student favourites.
- Menu-change notifications.
- Multi-language interface.
- Owner analytics.
- Personalized mess recommendations.
- Progressive Web App support.
- Meal-plan enquiries or booking, if the project scope later includes it.

These should be described as future enhancements unless they are actually implemented and tested.


15. TECHNOLOGY STACK SUMMARY
----------------------------

Frontend:
- React.js
- HTML
- CSS
- JavaScript

Backend:
- Java
- Spring Boot
- REST APIs
- Spring Security
- JWT (if selected)

Database:
- MySQL
- Spring Data JPA
- Hibernate

Location and maps:
- Browser Geolocation API
- Leaflet
- OpenStreetMap
- Optional external directions/routing service

Development tools:
- Maven
- Git and GitHub
- Postman

