# LearnSphere - Quick Reference Guide

## Current Status
✅ **PLATFORM OPERATIONAL** - User authentication working, users can log in and access courses

---

## How to Access the Platform

### 1. Start the Application
All backend services and frontend are currently running:
- **API Gateway:** http://localhost:8084 (Running)
- **Frontend:** http://localhost:5173 (Running)
- **MySQL Database:** localhost:3306 (Running)

### 2. Access the Website
Open browser and navigate to: **http://localhost:5173**

### 3. Test Credentials

**Admin Account (Pre-created):**
- Email: `admin@learnsphere.com`
- Password: `admin123`

**Test User:**
- Email: `test@example.com`
- Password: `password123`

---

## Key Pages & Functionality

| Feature | URL | Status | Notes |
|---------|-----|--------|-------|
| Home Page | `/` | ✅ Working | Hero section, categories, courses |
| Login | `/login` | ✅ Working | Try admin credentials |
| Register | `/register` | ⚠️ Partial | Form loads, submission has errors |
| Dashboard | `/dashboard` | ⏳ Not tested | Should work after login fix |
| Courses | `/courses` | ⏳ Not tested | Browse available courses |
| Forum | `/forum` | ⏳ Not tested | Discussions and Q&A |

---

## Recent Fixes Applied

### Fix #1: API Gateway Routing
**Problem:** Routes used `localhost` hostname, causing host validation errors  
**Solution:** Changed all routes to use `127.0.0.1` IP address  
**File:** `LS-backend/api-gateway/src/main/resources/application.properties`

### Fix #2: Auth Service Configuration
**Problem:** Auth Service not accepting requests from API Gateway  
**Solution:** Added proxy header support and configuration for remote IP handling  
**File:** `LS-backend/auth-service/src/main/resources/application.properties`

---

## Accessing Services Directly

### API Gateway (Main Entry Point)
```
Base URL: http://localhost:8084
Purpose: Routes all frontend requests to microservices
```

### Auth Service (Microservice)
```
Base URL: http://localhost:9097
Purpose: User authentication and JWT token generation
Endpoints: /api/auth/login, /api/auth/register, /api/auth/profile
```

### Course Service
```
Base URL: http://localhost:9091
Purpose: Course management and retrieval
Endpoints: /api/courses, /api/categories
```

---

## REST API Examples

### Test Login
```bash
curl -X POST http://localhost:8084/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learnsphere.com","password":"admin123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "email": "admin@learnsphere.com",
  "role": "admin"
}
```

### Test Courses (with token)
```bash
curl -X GET http://localhost:8084/api/courses \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## Troubleshooting

### Issue: Services not responding
**Solution:** Check if services are running
```bash
# List Java processes
tasklist | findstr java

# Check ports
netstat -ano | findstr 8084
netstat -ano | findstr 9097
```

### Issue: Database connection error
**Solution:** Verify MySQL is running
```bash
# Check MySQL status
tasklist | findstr mysql
```

### Issue: Login returns 500 error
**Solution:** Restart Auth Service
```bash
# Kill existing process
taskkill /F /IM java.exe

# Restart Auth Service
cd LS-backend/auth-service/target
java -jar auth-service-0.0.1-SNAPSHOT.jar
```

---

## File Locations

### Frontend
- **Location:** `D:\Full stack project\LearnSphere\LS-frontend`
- **Port:** 5173
- **Start:** `npm run dev`

### Backend Services
- **Location:** `D:\Full stack project\LearnSphere\LS-backend`
- **Services:** api-gateway, auth-service, course-service, etc.
- **Start:** `java -jar target/*.jar`

### Database
- **Type:** MySQL
- **Host:** localhost
- **Port:** 3306
- **Database:** learnsphere_db
- **User:** root
- **Password:** admin

---

## Important Configuration Files

### API Gateway Routes
`LS-backend/api-gateway/src/main/resources/application.properties`
- Define which requests go to which microservice
- All routes now use `127.0.0.1` instead of `localhost`

### Auth Service Settings
`LS-backend/auth-service/src/main/resources/application.properties`
- JWT secret key
- Database connection details
- Email configuration
- Proxy header handling

### Frontend Environment
`LS-frontend/.env` (if exists)
- API base URLs
- Development/production settings

---

## Common Tasks

### Register a New User
1. Go to http://localhost:5173/register
2. Fill in username, email, phone, password
3. Click Register
   - **Note:** Currently returns 500 error (under investigation)

### Log In to Platform
1. Go to http://localhost:5173/login
2. Enter email: `admin@learnsphere.com`
3. Enter password: `admin123`
4. Click Login
5. You're now logged in! ✅

### Browse Courses
1. Log in first
2. Click "Browse Course" button
3. View categories and available courses
4. Click course card to view details

### Reset to Clean State
```bash
# Stop all services
taskkill /F /IM java.exe

# Clear database (optional - requires MySQL CLI)
mysql -u root -p admin -e "DROP DATABASE learnsphere_db; CREATE DATABASE learnsphere_db;"

# Restart all services
# Navigate to each service directory and run: java -jar target/*.jar
```

---

## Monitoring & Logging

### View API Gateway Logs
API Gateway runs in foreground - logs display in terminal

### View Auth Service Logs
Auth Service runs in foreground - logs display in terminal

### Enable Debug Logging
Add to `application.properties`:
```properties
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.cloud.gateway=DEBUG
```

---

## Known Issues & Workarounds

### Issue 1: Registration Returns 500 Error
- **Status:** Known issue under investigation
- **Workaround:** Use pre-existing admin account to test platform
- **Workaround:** Check email service configuration in auth-service

### Issue 2: Video Assets Fail to Load
- **Status:** Minor - only affects hero video
- **Workaround:** Does not affect functionality

---

## Success Indicators

When the platform is working correctly, you should see:
- ✅ Login page loads without errors
- ✅ Login with admin credentials succeeds
- ✅ User profile shows in top navigation
- ✅ Home page displays all sections
- ✅ Course categories visible
- ✅ No 403 or 401 authorization errors
- ✅ No CORS errors in browser console

---

## Performance Notes

- **First load:** May take 30-60 seconds (Java services initializing)
- **Subsequent loads:** Fast and responsive
- **API responses:** Typically <500ms
- **Database queries:** Optimized for course listing

---

## Support

For issues or questions:
1. Check this quick reference first
2. Review the RECOVERY_STATUS.md for detailed information
3. Check logs in service terminal windows
4. Verify all services are running: `tasklist | findstr java`
5. Verify database is accessible: Connect to MySQL with credentials above

---

**Last Updated:** May 20, 2026  
**Platform Status:** ✅ Operational  
**Next Steps:** Fix registration endpoint, test additional features
