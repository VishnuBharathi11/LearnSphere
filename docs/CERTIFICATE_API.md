# Certificate API - Complete Endpoint Reference

**Date**: May 21, 2026  
**Base URL**: `http://localhost:8085/api` (adjust port as needed)  
**Authentication**: JWT Bearer Token

---

## 🔐 Authentication

All endpoints require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <jwt-token>
```

### Example Request
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:8085/api/certificates
```

---

## 📋 Endpoints

### Certificate Management

#### 1. Generate Certificate

**Endpoint**: `POST /certificates/generate`

**Description**: Generate a new certificate upon course completion

**Request Body**:
```json
{
  "userId": "user123",
  "courseId": "course456",
  "courseName": "React Fundamentals",
  "learnerName": "John Doe",
  "completionDate": "2024-05-21T10:30:00Z",
  "templateId": "template789"  // Optional
}
```

**Response** (200 OK):
```json
{
  "id": "cert-001",
  "certificateId": "LS-456-123",
  "userId": "user123",
  "courseId": "course456",
  "status": "APPROVED",
  "issuedOn": "2024-05-21T10:30:00Z",
  "downloadUrl": "/api/certificates/cert-001/download",
  "verificationUrl": "https://learnsphere.com/verify/LS-456-123"
}
```

**Error Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Invalid certificate generation request",
  "timestamp": "2024-05-21T10:30:00Z",
  "path": "/api/certificates/generate"
}
```

**Status Codes**:
- `200 OK` - Certificate generated successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error` - Generation failed

---

#### 2. Get Certificate by ID

**Endpoint**: `GET /certificates/{id}`

**Description**: Retrieve certificate details by certificate ID

**Path Parameters**:
- `id` (string, required): Certificate UUID

**Query Parameters**: None

**Response** (200 OK):
```json
{
  "id": "cert-001",
  "certificateId": "LS-456-123",
  "userId": "user123",
  "courseId": "course456",
  "status": "APPROVED",
  "issuedOn": "2024-05-21T10:30:00Z",
  "downloadUrl": "/api/certificates/cert-001/download",
  "verificationUrl": "https://learnsphere.com/verify/LS-456-123"
}
```

**Error Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Certificate not found",
  "timestamp": "2024-05-21T10:30:00Z",
  "path": "/api/certificates/cert-001"
}
```

---

#### 3. List User Certificates

**Endpoint**: `GET /certificates/user/{userId}`

**Description**: Get all certificates for a specific user

**Path Parameters**:
- `userId` (string, required): User ID

**Query Parameters**:
- `page` (integer, optional): Page number (default: 0)
- `size` (integer, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status (PENDING, APPROVED, REVOKED)

**Example**: `GET /certificates/user/user123?page=0&size=20&status=APPROVED`

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": "cert-001",
      "certificateId": "LS-456-123",
      "userId": "user123",
      "courseId": "course456",
      "status": "APPROVED",
      "issuedOn": "2024-05-21T10:30:00Z",
      "downloadUrl": "/api/certificates/cert-001/download",
      "verificationUrl": "https://learnsphere.com/verify/LS-456-123"
    },
    {
      "id": "cert-002",
      "certificateId": "LS-457-123",
      "userId": "user123",
      "courseId": "course457",
      "status": "APPROVED",
      "issuedOn": "2024-05-20T15:45:00Z",
      "downloadUrl": "/api/certificates/cert-002/download",
      "verificationUrl": "https://learnsphere.com/verify/LS-457-123"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 20
}
```

---

#### 4. Download Certificate

**Endpoint**: `POST /certificates/{id}/download`

**Description**: Download certificate as PDF or image file

**Path Parameters**:
- `id` (string, required): Certificate ID

**Request Body**:
```json
{
  "format": "PDF"  // Optional: PDF, PNG, JPEG
}
```

**Response** (200 OK):
- Returns binary file (application/pdf or image/png)
- File name: `{courseName}_Certificate.pdf`

**Example using curl**:
```bash
curl -H "Authorization: Bearer <token>" \
     -X POST http://localhost:8085/api/certificates/cert-001/download \
     -o certificate.pdf
```

---

#### 5. Verify Certificate

**Endpoint**: `POST /certificates/{id}/verify`

**Description**: Verify certificate authenticity using certificate ID or QR code

**Path Parameters**:
- `id` (string, required): Certificate ID or public certificate ID (e.g., LS-456-123)

**Request Body**: (Optional for QR code verification)
```json
{
  "verificationMethod": "QR_SCAN"  // Optional: QR_SCAN, API_CHECK
}
```

**Response** (200 OK):
```json
{
  "verified": true,
  "certificate": {
    "id": "cert-001",
    "certificateId": "LS-456-123",
    "userId": "user123",
    "courseId": "course456",
    "status": "APPROVED",
    "issuedOn": "2024-05-21T10:30:00Z"
  },
  "message": "Certificate is valid and authentic",
  "verificationTime": "2024-05-21T11:00:00Z"
}
```

**Revoked Certificate** (200 OK):
```json
{
  "verified": false,
  "certificate": {
    "id": "cert-003",
    "certificateId": "LS-458-123",
    "status": "REVOKED"
  },
  "message": "Certificate has been revoked",
  "verificationTime": "2024-05-21T11:00:00Z"
}
```

---

#### 6. Revoke Certificate (Admin Only)

**Endpoint**: `DELETE /certificates/{id}`

**Description**: Revoke a certificate (admin only)

**Path Parameters**:
- `id` (string, required): Certificate ID

**Request Body**:
```json
{
  "reason": "Suspected fraud"  // Optional
}
```

**Response** (200 OK):
```json
{
  "message": "Certificate revoked successfully",
  "certificateId": "LS-456-123",
  "status": "REVOKED"
}
```

**Error Response** (403 Forbidden):
```json
{
  "statusCode": 403,
  "message": "Only administrators can revoke certificates",
  "timestamp": "2024-05-21T10:30:00Z",
  "path": "/api/certificates/cert-001"
}
```

---

### Certificate Templates

#### 7. Get All Templates

**Endpoint**: `GET /certificates/templates`

**Description**: List all available certificate templates

**Query Parameters**:
- `active` (boolean, optional): Filter active templates only (default: true)

**Response** (200 OK):
```json
{
  "templates": [
    {
      "id": "template-001",
      "name": "Standard Blue",
      "format": "A4_PORTRAIT",
      "backgroundUrl": "/assets/templates/standard-blue.png",
      "active": true
    },
    {
      "id": "template-002",
      "name": "Modern Gold",
      "format": "A4_LANDSCAPE",
      "backgroundUrl": "/assets/templates/modern-gold.png",
      "active": true
    }
  ]
}
```

---

#### 8. Get Template by ID

**Endpoint**: `GET /certificates/templates/{id}`

**Description**: Get specific certificate template details

**Path Parameters**:
- `id` (string, required): Template ID

**Response** (200 OK):
```json
{
  "id": "template-001",
  "name": "Standard Blue",
  "format": "A4_PORTRAIT",
  "backgroundUrl": "/assets/templates/standard-blue.png",
  "htmlTemplate": "<div class='certificate'>...</div>",
  "layout": {
    "learnerNameX": 0.34,
    "learnerNameY": 0.485,
    "courseNameX": 0.34,
    "courseNameY": 0.642,
    "issuedDateX": 0.08,
    "issuedDateY": 0.785
  },
  "active": true
}
```

---

#### 9. Create Template (Admin Only)

**Endpoint**: `POST /certificates/templates`

**Description**: Create a new certificate template

**Request Body**:
```json
{
  "name": "Premium Certificate",
  "format": "A4_PORTRAIT",
  "backgroundUrl": "/assets/templates/premium.png",
  "layout": {
    "learnerNameX": 0.34,
    "learnerNameY": 0.485,
    "courseNameX": 0.34,
    "courseNameY": 0.642,
    "issuedDateX": 0.08,
    "issuedDateY": 0.785
  },
  "active": true
}
```

**Response** (201 Created):
```json
{
  "id": "template-003",
  "name": "Premium Certificate",
  "format": "A4_PORTRAIT",
  "backgroundUrl": "/assets/templates/premium.png",
  "active": true
}
```

---

#### 10. Update Template (Admin Only)

**Endpoint**: `PUT /certificates/templates/{id}`

**Description**: Update an existing certificate template

**Path Parameters**:
- `id` (string, required): Template ID

**Request Body**:
```json
{
  "name": "Premium Certificate v2",
  "layout": {
    "learnerNameX": 0.35,
    "learnerNameY": 0.49,
    "courseNameX": 0.35,
    "courseNameY": 0.65,
    "issuedDateX": 0.09,
    "issuedDateY": 0.79
  },
  "active": true
}
```

**Response** (200 OK):
```json
{
  "id": "template-003",
  "name": "Premium Certificate v2",
  "format": "A4_PORTRAIT",
  "layout": { /* updated */ },
  "active": true
}
```

---

#### 11. Delete Template (Admin Only)

**Endpoint**: `DELETE /certificates/templates/{id}`

**Description**: Delete a certificate template

**Path Parameters**:
- `id` (string, required): Template ID

**Response** (204 No Content):
- No body

**Error Response** (409 Conflict):
```json
{
  "statusCode": 409,
  "message": "Cannot delete template currently in use",
  "timestamp": "2024-05-21T10:30:00Z",
  "path": "/api/certificates/templates/template-001"
}
```

---

### Verification Logs (Admin Only)

#### 12. Get Verification History

**Endpoint**: `GET /certificates/{id}/verification-log`

**Description**: Get verification history for a certificate

**Path Parameters**:
- `id` (string, required): Certificate ID

**Query Parameters**:
- `page` (integer, optional): Page number
- `size` (integer, optional): Items per page

**Response** (200 OK):
```json
{
  "content": [
    {
      "id": "log-001",
      "certificateId": "LS-456-123",
      "verified": true,
      "verificationTime": "2024-05-21T11:00:00Z",
      "verificationMethod": "QR_SCAN",
      "ipAddress": "192.168.1.1"
    },
    {
      "id": "log-002",
      "certificateId": "LS-456-123",
      "verified": true,
      "verificationTime": "2024-05-20T15:30:00Z",
      "verificationMethod": "API_CHECK",
      "ipAddress": "10.0.0.1"
    }
  ],
  "totalElements": 2,
  "totalPages": 1
}
```

---

## 🔍 Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Invalid certificate generation request | Missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Certificate/Template not found | Resource doesn't exist |
| 409 | Conflict | Template in use or duplicate name |
| 500 | Internal Server Error | PDF generation failed |
| 503 | Service Unavailable | Puppeteer service unavailable |

---

## 📊 Rate Limiting

- **Default**: 100 requests per minute per user
- **Admin**: 500 requests per minute
- **Header**: `X-RateLimit-Remaining`

---

## 🧪 Testing Examples

### Using Postman

```
POST /certificates/generate
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "userId": "user123",
  "courseId": "course456",
  "courseName": "Advanced JavaScript",
  "learnerName": "Jane Smith",
  "completionDate": "2024-05-21T10:30:00Z"
}
```

### Using curl

```bash
# Generate certificate
curl -X POST http://localhost:8085/api/certificates/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "courseId": "course456",
    "courseName": "React Fundamentals",
    "learnerName": "John Doe",
    "completionDate": "2024-05-21T10:30:00Z"
  }'

# Verify certificate
curl -X POST http://localhost:8085/api/certificates/LS-456-123/verify \
  -H "Authorization: Bearer $TOKEN"

# Get all templates
curl http://localhost:8085/api/certificates/templates \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Response Format

All responses follow this standard format:

**Success Response**:
```json
{
  "data": { /* resource data */ },
  "statusCode": 200,
  "message": "Success"
}
```

**Error Response**:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2024-05-21T10:30:00Z",
  "path": "/api/certificates/generate",
  "details": { /* optional error details */ }
}
```

---

## 🔗 Related Documentation

- [Certificate Module Structure](./CERTIFICATE_MODULE_STRUCTURE.md)
- [Backend Service Documentation](./CERTIFICATE_BACKEND_SERVICE.md)
- [Frontend Migration Guide](./CERTIFICATE_FRONTEND_MIGRATION.md)

