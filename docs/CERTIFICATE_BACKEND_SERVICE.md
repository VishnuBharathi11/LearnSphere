# Certificate Service - Backend Documentation

**Date**: May 21, 2026  
**Service**: Certificate Generation & Management  
**Technology**: Spring Boot 3.x + Maven

---

## 📋 Overview

The Certificate Service is a dedicated Spring Boot microservice responsible for:
- Generating certificates upon course completion
- Managing certificate templates
- Verifying certificate authenticity
- Storing and retrieving certificates
- Generating QR codes for verification

**Files**: 35 Java classes + configuration

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────┐
│       REST Controller            │  CertificateController
├─────────────────────────────────┤
│       Business Logic (Service)   │  CertificateService/Impl
├─────────────────────────────────┤
│       Data Access (Repository)   │  CertificateRepository
├─────────────────────────────────┤
│       Data Model (Entity)        │  Certificate Entity
└─────────────────────────────────┘
```

---

## 📁 Directory Structure Breakdown

### `config/` - Configuration & Setup (3 files)

#### `CertificateProperties.java`
- Binds `certificate.*` properties from `application.properties`
- Manages configuration like storage path, PDF generation settings, QR code options

```java
@ConfigurationProperties(prefix = "certificate")
public class CertificateProperties {
    private String storagePath;           // Where to store certificates
    private String pdfGeneratorUrl;       // Puppeteer service URL
    private int qrCodeSize;               // QR code dimension
    private String templateFormat;        // Default template format
}
```

#### `SecurityConfig.java`
- Configures Spring Security for the microservice
- JWT validation setup
- CORS policies
- API endpoint security rules

#### `CertificateTemplateSeeder.java`
- Initializes database with default certificate templates
- Runs on application startup
- Ensures required templates exist

---

### `controller/` - REST API Endpoints (1 file)

#### `CertificateController.java`

**Key Endpoints**:

```java
POST   /api/certificates/generate       // Generate new certificate
GET    /api/certificates/{id}           // Fetch certificate by ID
GET    /api/certificates/user/{userId}  // List certificates for user
POST   /api/certificates/{id}/download  // Download certificate file
POST   /api/certificates/{id}/verify    // Verify certificate
POST   /api/certificates/{id}/revoke    // Revoke certificate (admin)
```

**Request/Response Handling**:
- Accepts JSON payloads
- Validates JWT tokens
- Maps DTOs to entities
- Returns standardized API responses

---

### `service/` - Business Logic (8 files)

#### Core Service Interfaces

**`CertificateService.java`**
```java
public interface CertificateService {
    CertificateResponse generate(CertificateGenerateRequest request);
    CertificateResponse getCertificate(String id);
    List<CertificateResponse> getUserCertificates(String userId);
    VerificationResponse verify(String certificateId);
    void revoke(String certificateId);
}
```

**`PdfGenerationService.java`**
```java
public interface PdfGenerationService {
    byte[] generatePdf(Certificate certificate, CertificateTemplate template);
    byte[] generatePdfFromHtml(String html);
}
```

**`QrCodeService.java`**
```java
public interface QrCodeService {
    byte[] generateQrCode(String certificateId, int size);
    BufferedImage generateQrCodeImage(String certificateId, int size);
}
```

**`StorageService.java`**
```java
public interface StorageService {
    String saveCertificate(byte[] data, String filename);
    byte[] retrieveCertificate(String storagePath);
    void deleteCertificate(String storagePath);
}
```

#### Implementations

**`CertificateServiceImpl.java`**
- Core business logic
- Orchestrates other services
- Handles certificate lifecycle
- Audit logging for operations

**`PuppeteerPdfGenerationService.java`**
- Uses Headless Chrome/Puppeteer for PDF rendering
- Converts HTML certificate templates to PDF
- Handles image embedding and custom fonts

**`ZxingQrCodeService.java`**
- Generates QR codes using ZXing library
- Encodes certificate verification URLs
- Configurable QR code dimensions

**`LocalStorageService.java`**
- Stores certificates on local file system
- Alternative: S3StorageService (future)
- Manages file directory structure

---

### `repository/` - Data Access (3 files)

#### `CertificateRepository.java`
```java
public interface CertificateRepository extends JpaRepository<Certificate, String> {
    List<Certificate> findByUserId(String userId);
    List<Certificate> findByCourseId(String courseId);
    Certificate findByCertificateId(String certificateId);
}
```

#### `CertificateTemplateRepository.java`
```java
public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, String> {
    CertificateTemplate findByNameAndFormat(String name, TemplateFormat format);
    List<CertificateTemplate> findByActiveTrue();
}
```

#### `VerificationLogRepository.java`
```java
public interface VerificationLogRepository extends JpaRepository<VerificationLog, String> {
    List<VerificationLog> findByCertificateId(String certificateId);
    List<VerificationLog> findByVerifiedTrue();
}
```

---

### `entity/` - Database Models (5 files)

#### `Certificate.java`
```java
@Entity
@Table(name = "certificates")
public class Certificate {
    @Id
    private String id;                    // UUID
    private String certificateId;         // Public ID (LS-XXXX-YYYY)
    private String userId;                // Learner user ID
    private String courseId;              // Course ID
    private String templateId;            // Template reference
    @Enumerated
    private CertificateStatus status;     // PENDING, APPROVED, REVOKED
    private LocalDateTime issuedOn;       // Issue timestamp
    private String storagePath;           // Where certificate stored
    private String qrCodePath;            // Where QR code stored
    @ManyToOne
    private CertificateTemplate template;
}
```

#### `CertificateTemplate.java`
```java
@Entity
@Table(name = "certificate_templates")
public class CertificateTemplate {
    @Id
    private String id;
    private String name;                  // e.g., "Standard Blue"
    @Enumerated
    private TemplateFormat format;        // A4_PORTRAIT, A4_LANDSCAPE
    private String backgroundUrl;         // Path to template image
    private String htmlTemplate;          // Optional HTML template
    @Convert
    private Map<String, Object> layout;   // Position config
    private boolean active;
}
```

#### `VerificationLog.java`
```java
@Entity
@Table(name = "verification_logs")
public class VerificationLog {
    @Id
    private String id;
    private String certificateId;
    private boolean verified;
    private LocalDateTime verificationTime;
    private String verificationMethod;    // QR_SCAN, API_CHECK, etc.
}
```

#### `CertificateStatus.java` & `TemplateFormat.java`
```java
public enum CertificateStatus {
    PENDING, APPROVED, REVOKED
}

public enum TemplateFormat {
    A4_PORTRAIT, A4_LANDSCAPE, CUSTOM
}
```

---

### `dto/` - Data Transfer Objects (6 files)

#### Request DTOs

**`CertificateGenerateRequest.java`**
```java
public class CertificateGenerateRequest {
    private String userId;
    private String courseId;
    private String courseName;
    private String learnerName;
    private LocalDateTime completionDate;
    private String templateId;            // Optional, defaults to standard
}
```

**`TemplateRequest.java`**
```java
public class TemplateRequest {
    private String name;
    private TemplateFormat format;
    private String backgroundUrl;
    private Map<String, Object> layout;
    private boolean active;
}
```

#### Response DTOs

**`CertificateResponse.java`**
```java
public class CertificateResponse {
    private String id;
    private String certificateId;
    private String userId;
    private String courseId;
    private CertificateStatus status;
    private LocalDateTime issuedOn;
    private String downloadUrl;
    private String verificationUrl;
}
```

**`TemplateResponse.java`**
```java
public class TemplateResponse {
    private String id;
    private String name;
    private TemplateFormat format;
    private String backgroundUrl;
    private boolean active;
}
```

**`VerificationResponse.java`**
```java
public class VerificationResponse {
    private boolean verified;
    private CertificateResponse certificate;
    private String message;
    private LocalDateTime verificationTime;
}
```

**`ApiErrorResponse.java`**
```java
public class ApiErrorResponse {
    private int statusCode;
    private String message;
    private LocalDateTime timestamp;
    private String path;
}
```

---

### `exception/` - Error Handling (3 files)

#### `CertificateGenerationException.java`
- Thrown when PDF/certificate generation fails
- Parent class for certificate-specific errors

#### `ResourceNotFoundException.java`
- Thrown when certificate/template not found
- Returns 404 HTTP status

#### `GlobalExceptionHandler.java`
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(CertificateGenerationException.class)
    public ResponseEntity<ApiErrorResponse> handleCertificateError(...) { }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(...) { }
}
```

---

### `security/` - Authentication (1 file)

#### `JwtAuthFilter.java`
- Validates JWT tokens on every request
- Extracts user claims and roles
- Enforces role-based access control
- Flow:
  1. Extract JWT from Authorization header
  2. Validate signature and expiration
  3. Set SecurityContext
  4. Proceed with request

---

### `CertificateServiceApplication.java`
Main Spring Boot application class with standard setup.

---

### `scripts/` - Utility Scripts (1 file)

#### `render-certificate-pdf.mjs`
Node.js script for PDF rendering via Puppeteer:
- Receives HTML + template data
- Renders to PDF
- Returns PDF bytes
- Alternative to server-side PDF generation

---

### `resources/` - Configuration (1 file)

#### `application.properties`
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/learnsphere
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# Certificate Service
certificate.storage-path=/var/certificates
certificate.pdf-generator-url=http://localhost:3001/render
certificate.qr-code-size=300

# JWT
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8081
```

---

## 🔄 Request Flow Example

### Generate Certificate

```
Client Request
    ↓
CertificateController.generate()
    ↓
CertificateService.generate()
    ├─→ Validate request
    ├─→ Load template
    ├─→ PdfGenerationService.generatePdf()
    ├─→ QrCodeService.generateQrCode()
    ├─→ StorageService.saveCertificate()
    └─→ Save to database
    ↓
CertificateResponse (with download URL)
```

---

## 🔒 Security Features

1. **JWT Authentication**
   - All endpoints require valid JWT token
   - Claims include user roles

2. **Role-Based Access Control**
   - `ROLE_LEARNER`: View own certificates
   - `ROLE_INSTRUCTOR`: Generate for own courses
   - `ROLE_ADMIN`: Full management access

3. **Audit Logging**
   - VerificationLog tracks all lookups
   - Timestamps and methods recorded

4. **Certificate Verification**
   - QR codes embed certificate URL
   - Unique certificateId format: `LS-{courseId}-{userId}`

---

## 📊 Database Schema

### Certificates Table
```sql
CREATE TABLE certificates (
    id VARCHAR(36) PRIMARY KEY,
    certificate_id VARCHAR(50) UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    template_id VARCHAR(36),
    status ENUM('PENDING', 'APPROVED', 'REVOKED'),
    issued_on TIMESTAMP,
    storage_path VARCHAR(255),
    qr_code_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES certificate_templates(id)
);
```

### Templates Table
```sql
CREATE TABLE certificate_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100),
    format VARCHAR(20),
    background_url VARCHAR(255),
    html_template LONGTEXT,
    layout JSON,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Performance Optimization

1. **Lazy Loading**: Templates cached in memory
2. **Async PDF Generation**: Consider background jobs for large volumes
3. **Database Indexing**:
   - Index on `userId` for certificate lookups
   - Index on `courseId` for course-specific queries
   - Index on `certificateId` for verification

4. **File Storage**: CDN recommended for certificate downloads

---

## 🧪 Testing Strategy

- Unit tests for each service implementation
- Integration tests for controllers
- Test templates and sample data
- Mock external PDF generator

---

## 📚 Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>core</artifactId>
    <version>3.5.0</version>
</dependency>
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>javase</artifactId>
    <version>3.5.0</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

---

## 🔗 Integration Points

### With Other Services
- **Course Service**: Get course details
- **Auth Service**: Validate JWT, get user info
- **Learn Progress Service**: Check completion status

### External Services
- **Puppeteer Service**: PDF generation
- **File Storage**: S3 or local file system
- **Database**: MySQL/MongoDB

---

## 📖 Related Documentation

- [Certificate Module Structure](./CERTIFICATE_MODULE_STRUCTURE.md)
- [Frontend Migration Guide](./CERTIFICATE_FRONTEND_MIGRATION.md)
- [API Endpoints Documentation](./CERTIFICATE_API.md)

