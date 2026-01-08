# PG/Hostel Management System - Setup Guide

## 📋 Prerequisites

Before running this project on a new device, ensure you have:

1. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Verify: `java -version`

2. **MySQL Server 8.0 or higher**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Verify: `mysql --version`

3. **Node.js 18+ and npm**
   - Download from: https://nodejs.org/
   - Verify: `node -v` and `npm -v`

4. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

---

## 🗄️ Database Setup

### Step 1: Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE pgm_database;
```

### Step 2: Configure Database Connection

Edit `PGM_Backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pgm_database?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

**Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL root password.**

### Step 3: Automatic Schema Generation

✅ **Good News!** The project is already configured for automatic schema generation:

```properties
spring.jpa.hibernate.ddl-auto=update
```

This means:
- **Tables will be created automatically** when you first run the backend
- **Schema will be updated automatically** when you modify JPA entities
- **No manual SQL scripts needed** for basic setup

### Step 4: Run Migration Scripts (Optional - For SuperAdmin & Bed Tracking)

After the backend runs for the first time, you may need to run these migration scripts manually:

#### 4.1 Create SuperAdmin Table
```sql
-- Run this in MySQL
USE pgm_database;

CREATE TABLE IF NOT EXISTS super_admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(10) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 4.2 Add Bed Tracking Columns (If needed)
```sql
-- Replace {adminId} with actual admin IDs (e.g., 14, 15, etc.)
ALTER TABLE admin_{adminId}_rooms 
ADD COLUMN IF NOT EXISTS occupied_bed_numbers TEXT;

ALTER TABLE admin_{adminId}_tenants 
ADD COLUMN IF NOT EXISTS bed_number INT;
```

---

## 🚀 Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd D:\Internship\PG_Project\PGM_Backend
```

### Step 2: Build the Project (Windows)
```bash
# Using Maven Wrapper (recommended - no Maven installation needed)
mvnw.cmd clean install

# OR if you have Maven installed
mvn clean install
```

### Step 3: Run the Backend
```bash
# Using Maven Wrapper
mvnw.cmd spring-boot:run

# OR if you have Maven installed
mvn spring-boot:run

# OR run the JAR file
java -jar target/pgm_Backend-0.0.1-SNAPSHOT.jar
```

### Step 4: Verify Backend is Running
- Backend should start on: **http://localhost:8080**
- Check console for: `Started PgmBackendApplication`
- Check database: Tables should be created automatically

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd D:\Internship\PG_Project\frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Frontend
```bash
npm run dev
```

### Step 4: Verify Frontend is Running
- Frontend should start on: **http://localhost:5173**
- Open browser and navigate to the URL shown in terminal

---

## 🔧 Configuration Checklist

### Backend Configuration (`application.properties`)

✅ **Database Connection**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pgm_database?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

✅ **Hibernate Auto-Schema Generation**
```properties
spring.jpa.hibernate.ddl-auto=update  # Already configured!
```

✅ **Email Configuration (Optional)**
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

✅ **API Keys (Optional - for full functionality)**
```properties
# Google Maps API
google.maps.api.key=YOUR_GOOGLE_MAPS_KEY

# Razorpay Payment Gateway
razorpay.key.id=YOUR_RAZORPAY_KEY_ID
razorpay.key.secret=YOUR_RAZORPAY_SECRET
```

### Frontend Configuration

Check `frontend/src/services/apiConfig.js`:
```javascript
const BASE_URL = 'http://localhost:8080'
```

---

## 📝 First-Time Setup Summary

### Quick Steps:
1. ✅ Install MySQL and create `pgm_database`
2. ✅ Update MySQL password in `application.properties`
3. ✅ Run backend: `mvnw.cmd spring-boot:run`
4. ✅ **Tables auto-created by Hibernate!** (No manual SQL needed)
5. ✅ Run frontend: `npm run dev`
6. ✅ Access application at `http://localhost:5173`

### What Happens Automatically:
- ✅ All JPA entity tables are created
- ✅ Columns are added/updated based on entity definitions
- ✅ Database schema evolves with code changes

### What Needs Manual Setup (Optional):
- ⚠️ SuperAdmin table (run migration script if needed)
- ⚠️ Bed tracking columns for existing admin tables
- ⚠️ Email configuration (for OTP/notifications)
- ⚠️ API keys (Google Maps, Razorpay)

---

## 🐛 Troubleshooting

### Backend Won't Start
- ❌ **Error: Access denied for user 'root'@'localhost'**
  - ✅ Fix: Update MySQL password in `application.properties`

- ❌ **Error: Unknown database 'pgm_database'**
  - ✅ Fix: Create database: `CREATE DATABASE pgm_database;`

- ❌ **Error: Port 8080 already in use**
  - ✅ Fix: Change port in `application.properties`: `server.port=8081`

### Frontend Won't Start
- ❌ **Error: Cannot find module**
  - ✅ Fix: Run `npm install` again

- ❌ **Error: Port 5173 already in use**
  - ✅ Fix: Kill the process or use a different port

### Database Issues
- ❌ **Tables not created**
  - ✅ Check: `spring.jpa.hibernate.ddl-auto=update` is set
  - ✅ Check: Database connection is successful
  - ✅ Check: Console logs for Hibernate SQL statements

---

## 📚 Additional Resources

- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **Hibernate Documentation**: https://hibernate.org/orm/documentation/
- **MySQL Documentation**: https://dev.mysql.com/doc/

---

## 🎯 Key Advantage of JPA/Hibernate Approach

✅ **No Manual Schema Management Needed!**
- Tables are created automatically from Java entities
- Schema updates happen automatically when entities change
- Portable across different environments
- No SQL scripts to maintain (for basic schema)

**Note:** Migration scripts in `src/main/resources/db/migration/` are for special cases like:
- Creating separate tables (e.g., `super_admins`)
- Adding columns to dynamically created admin tables
- One-time data migrations

---

**Happy Coding! 🚀**
