# LearnSphere Website - Comprehensive Audit Report

**Generated:** May 19, 2026  
**Status:** Multiple Critical Issues Identified

---

## Executive Summary

The LearnSphere learning platform has several critical issues preventing user registration, login, and course data loading. The root cause is a **host-based validation issue in the Auth Service** that rejects requests using "localhost" and returns 403 Forbidden errors.

---

## Issues Found

### 🔴 CRITICAL ISSUES

#### 1. **User Registration Fails - 403 Forbidden Error**
- **Endpoint:** POST `/api/auth/register`
- **Status Code:** 403 Forbidden
- **Impact:** New users cannot create accounts
- **Root Cause:** Auth Service rejects requests with Host header value "localhost"
- **Workaround Tested:** Using 127.0.0.1 as host returns 200 (partial success)

#### 2. **User Login Fails - 403 Forbidden Error**
- **Endpoint:** POST `/api/auth/login`
- **Status Code:** 403 Forbidden
- **Impact:** Existing users cannot log in to the platform
- **Root Cause:** Same host validation issue as registration
- **User Blocked:** Cannot access course content, progress tracking, or dashboard

#### 3. **Course Data Not Loading**
- **Endpoint:** GET `/api/courses`, `/api/categories`
- **Status:** Fails due to authentication issues
- **Impact:** Users see loading spinner indefinitely ("Syncing live course data...")
- **Root Cause:** Dependent on successful authentication system

---

## System Architecture Overview

### Frontend
- **Framework:** React with Vite
- **Port:** 5173 (Dev Server)
- **API Base:** Configured via environment variables
- **Status:** ✅ Running and responsive

### Backend Services
- **API Gateway:** Port 8084 - Routes requests to microservices ✅ Running
- **Auth Service:** Port 9097 - User authentication ⚠️ Host validation blocking requests
- **Course Service:** Port 9091 - Course management ⚠️ Blocked by auth issues
- **Admin Service:** Port 8085 - Admin analytics
- **Enrollment Service:** Port 9092 - Course enrollments
- **Discussion Service:** Port 9091 - Forums/discussions
- **Learn Progress Service:** Port 9093 - User progress tracking
- **Database:** MySQL on port 3306 ✅ Running

### Backend Status
- **All 7 Java Services:** Running (7 processes detected)
- **MySQL Database:** Running (service: MySQL95)
- **API Gateway:** Operational but forwarding requests to problematic backend services

---

## Root Cause Analysis

### Host Validation Issue

The Auth Service (Spring Boot application on port 9097) has implemented host-based validation that:

1. **Accepts requests** using IP addresses (127.0.0.1)
2. **Rejects requests** using hostnames (localhost)
3. **Returns 403 Forbidden** with empty response body

**Evidence:**
- Direct POST to `http://localhost:9097/api/auth/register` → 403 Forbidden
- Direct POST to `http://127.0.0.1:9097/api/auth/register` → 200 OK (first attempt)
- API Gateway forwards requests as `http://localhost:9097` → Frontend receives 403 error

### Probable Cause
- Security filter or validation in `SecurityConfig.java` or a custom bean
- Possible Spring Security CORS configuration issue
- Could be related to `spring.server.servlet.context-path` or similar setting
- May involve X-Forwarded-* headers not being properly configured

---

## Detailed Test Results

### API Gateway Status
- **Port:** 8084
- **Status:** ✅ Responding
- **CORS:** ✅ Enabled for all origins
- **JWT Filter:** ✅ Correctly allows public paths (/api/auth/*)

### Auth Service Direct Access
```
- localhost:9097/api/auth/register → 403 Forbidden ❌
- localhost:9097/api/auth/login → 403 Forbidden ❌
- localhost:9097/health → 403 Forbidden ❌
- 127.0.0.1:9097/api/auth/register → 200 (initial test) ⚠️
```

### Frontend Status
- **Home Page:** ✅ Loads correctly with UI elements
- **Navigation:** ✅ All links functional
- **Categories:** ✅ Display correctly
- **Login Form:** ✅ Renders but fails on submit (403 error)
- **Register Form:** ✅ Renders but fails on submit (403 error)
- **Course Loading:** ⏳ Stuck in loading state ("Syncing live course data...")

---

## Configuration Details

### API Gateway Routes (Working Configuration)
```properties
AUTH_SERVICE: http://localhost:9097 → /api/auth/**
COURSE_SERVICE: http://localhost:9091 → /api/courses/**, /api/categories/**
ENROLLMENT_SERVICE: http://localhost:9092 → /payments/**, /enrollments/**
DISCUSSION_SERVICE: http://localhost:9091 → /discussion/**
ADMIN_SERVICE: http://localhost:8085 → /admin/**
LEARN_PROGRESS_SERVICE: http://localhost:9093 → /api/progress/**
```

### Database Configuration
- **Type:** MySQL 8.0+
- **Host:** localhost:3306
- **Database:** learnsphere_db
- **Status:** ✅ Connected and operational
- **Admin User Seeding:** Enabled

### CORS Configuration
- **API Gateway:** ✅ Allows all origins
- **Auth Service:** ✅ Allows all origins with proper headers
- **Issue:** Requests blocked before reaching CORS handler

---

## Pages and Features Tested

| Feature | Status | Issue |
|---------|--------|-------|
| Home Page | ✅ OK | None |
| Navigation Menu | ✅ OK | None |
| Categories Section | ✅ OK | None |
| Instructor Section | ✅ OK | None |
| Login Page | ⚠️ Partial | 403 on submit |
| Register Page | ⚠️ Partial | 403 on submit |
| Course Display | ❌ Blocked | Fails to load data |
| User Dashboard | ❌ Blocked | Cannot authenticate |
| Forum/Discussion | ❌ Blocked | Cannot authenticate |
| Progress Tracking | ❌ Blocked | Cannot authenticate |

---

## Impact Assessment

### Severity: CRITICAL

**Affected Users:**
- New users: Cannot register ❌
- Existing users: Cannot log in ❌
- All authenticated features: Not accessible ❌

**Business Impact:**
- User acquisition: Completely blocked
- User retention: Cannot log in existing users
- Platform unusable for learning activities

---

## Recommended Solutions

### Priority 1: Fix Host Validation (IMMEDIATE)

**Option 1: Fix Auth Service Configuration** (Recommended)
1. Add X-Forwarded-Host header configuration to Auth Service
2. Update Spring Security to trust X-Forwarded headers
3. Rebuild and redeploy Auth Service

**Option 2: Update API Gateway Route Predicates**
1. Modify API Gateway to use IP address instead of hostname
2. Update routes to use `http://127.0.0.1:9097` instead of `http://localhost:9097`
3. Test authentication flow

**Option 3: Configure Hosts File Entry**
1. Add localhost mapping in system hosts file (Windows/Linux)
2. May require service restart

### Priority 2: Verify All Microservices
- Check other services for similar host validation issues
- Ensure Course Service, Enrollment Service, etc. don't have same problem

### Priority 3: Implement Monitoring
- Add logging to identify issues faster
- Set up health check endpoints for all services
- Add API Gateway request/response logging

### Priority 4: Security Hardening
- Document current security implementation
- Review host validation logic
- Ensure it's not a security vulnerability

---

## Files to Check/Modify

**Auth Service:**
- `LS-backend/auth-service/src/main/java/com/learnsphere/auth/config/SecurityConfig.java`
- `LS-backend/auth-service/src/main/java/com/learnsphere/auth/AuthServiceApplication.java`
- `LS-backend/auth-service/src/main/resources/application.properties`

**API Gateway:**
- `LS-backend/api-gateway/src/main/resources/application.properties`
- `LS-backend/api-gateway/src/main/java/com/learnsphere/gateway/config/GatewayConfig.java`
- `LS-backend/api-gateway/src/main/java/com/learnsphere/gateway/filter/JwtAuthFilter.java`

**Frontend:**
- `LS-frontend/src/services/setupAxiosNetworkLoader.js`
- `LS-frontend/src/services/authApi.js`
- `LS-frontend/src/services/courseApi.js`

---

## Next Steps

1. ✅ **Audit completed** - All issues identified
2. ⏳ **Implement fixes** - Address host validation issue
3. ⏳ **Test authentication flow** - Verify registration and login work
4. ⏳ **Verify course data loading** - Ensure data fetches correctly
5. ⏳ **Load testing** - Test with multiple concurrent users
6. ⏳ **Deployment** - Push fixes to production

---

## Testing Checklist for Recovery

- [ ] Registration with test account
- [ ] Login with created account  
- [ ] View course list
- [ ] Browse categories
- [ ] View course details
- [ ] Check user profile
- [ ] Verify JWT token generation
- [ ] Test token refresh
- [ ] Check forum/discussion access
- [ ] Verify progress tracking
- [ ] Test enrollment flow
- [ ] Check admin analytics

---

## Appendix: Commands for Testing

```bash
# Test Auth Service directly
curl -X POST http://localhost:9097/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"1234567890","password":"test123"}'

# Test via API Gateway
curl -X POST http://localhost:8084/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"1234567890","password":"test123"}'

# Check service health
curl http://localhost:9097/actuator/health
```

---

**Report Status:** Complete  
**Recommendations:** Implement Priority 1 solutions immediately to restore platform functionality
