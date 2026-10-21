# MessMap — Local Quick-Start Runbook (5-Minute Spin-Up)

**Associated GitHub Issue**: [#20 — [Integration] 4-Day Working Model Demo Preparation, Seed Data Setup & Limitation Documentation](https://github.com/SanvedSahu/MessMap/issues/20)  
**Target Environment**: Local Development / Live Mentor Demonstration  
**Platform Stack**: Java 17 LTS (Spring Boot 3.3.4), React 18 (Vite + TypeScript), MySQL 8.0  

---

## 1. Prerequisites Checklist

Before launching, ensure the following command-line tools are installed:

- **Java**: OpenJDK 17 LTS (`java -version`)
- **Node.js**: Node 18+ or 20 LTS (`node -v`, `npm -v`)
- **Docker**: Docker Engine & Docker Compose (`docker compose version`) OR a local MySQL 8.0 server
- **Maven**: Maven Wrapper (`./mvnw` in `backend/`) or installed Maven 3.9+ (`mvn -v`)

---

## 2. Fast 5-Minute Boot Procedure

### Step 1: Start MySQL Database

From the project root:

```bash
docker compose -f database/docker-compose-db.yml up -d
```

Verify that the MySQL container is healthy:
```bash
docker ps --filter "name=messmap-mysql"
```

*Note for local (non-Docker) MySQL installations:* Ensure MySQL is listening on port `3306`, database `messmap_dev_db` exists, and credentials match `messmap_user` / `messmap_secret_password` (or override via environment variables in `backend/src/main/resources/application.yml`).

---

### Step 2: Boot Backend (Spring Boot 3)

In a terminal window:

```bash
cd backend
./mvnw spring-boot:run
```
*(Or specify Java 17 explicitly if your default Java differs: `JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.20.1/libexec/openjdk.jdk/Contents/Home ./mvnw spring-boot:run`)*

On startup, Flyway will automatically execute migrations `V1` through `V6` to create schemas and seed the default administrator account.

Verify the backend is live:
```bash
curl http://localhost:8080/api/v1/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "MessMap backend service is operational",
  "data": {
    "status": "UP",
    "service": "MessMap Backend API",
    "version": "1.0.0",
    "environment": "dev"
  }
}
```

---

### Step 3: Load Demo Seed Dataset

In another terminal window:

```bash
./database/seed/load_demo_data.sh
```

This populates sample Pune messes across Shivajinagar, Katraj, Viman Nagar, and Kothrud, daily menus, facilities, and test accounts.  
*(This script is idempotent: running it multiple times will not create duplicates).*

---

### Step 4: Boot Frontend (Vite + React)

In another terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open your browser to: **`http://localhost:3000`** *(configured in `frontend/vite.config.ts`; if port 3000 is occupied, Vite falls back to 3001 or 5173)*

---

## 3. Demo Credentials & Workflows

| Role | Email | Password | Access URL | What to Demonstrate |
|---|---|---|---|---|
| **Student** | `rahul.patil@coep.ac.in` | `student` | `http://localhost:3000/login?role=student` | Search messes, filter by Pure Veg/Non-Veg/Jain, inspect weekly timetable, bookmark favorites, read reviews. |
| **Mess Owner** | `rajesh.sharma@annapurnamess.com` | `owner` | `http://localhost:3000/login?role=owner` | Manage Annapurna Mess profile, edit operating meal timings, add special dishes, track verification status. |
| **New Owner (Pending)** | `vikram.deshmukh@kothrudkatta.com` | `owner` | `http://localhost:3000/login?role=owner` | View "Kothrud Katta Student Mess" with **Pending Verification** banner ready for live admin approval demo. |
| **Administrator** | `admin@messmap.com` | `admin` | `http://localhost:3000/admin/login` | Review live platform metrics, inspect pending mess approvals, approve or suspend messes, manage user directory. |

---

## 4. Troubleshooting & Quick Fixes

### Issue A: Port 8080 already in use
```bash
lsof -i :8080
kill -9 <PID>
```

### Issue B: Port 5173 already in use
Vite will automatically offer port `5174`. To keep it strictly at 5173:
```bash
lsof -i :5173
kill -9 <PID>
```

### Issue C: MySQL Connection Refused
Ensure Docker container is running:
```bash
docker compose -f database/docker-compose-db.yml ps
docker compose -f database/docker-compose-db.yml logs --tail 30
```

### Issue D: Flyway Migration Checksum Error
If someone edited an already-applied migration in local development:
```bash
docker compose -f database/docker-compose-db.yml down -v
docker compose -f database/docker-compose-db.yml up -d
```
Then restart backend (`./mvnw spring-boot:run`) and reload seed data (`./database/seed/load_demo_data.sh`).
