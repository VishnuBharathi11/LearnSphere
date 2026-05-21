# Certificate Module - Professional Organization Structure

**Last Updated**: May 21, 2026  
**Status**: Reorganization Plan  
**Total Files**: 48 (35 backend + 13 frontend)

---

## 📋 Overview

The Certificate Module handles certificate generation, management, verification, and downloading for completed courses. This document outlines the professional organization structure for all certificate-related code across backend and frontend.

---

## 🏗️ Backend Structure (`LS-backend/certificate-service/`)

### Current Files: 35

```
certificate-service/
├── src/main/java/com/learnsphere/certificate/
│   ├── config/
│   │   ├── SecurityConfig.java           # Spring Security configuration
│   │   ├── CertificateProperties.java    # Custom properties binding
│   │   └── CertificateTemplateSeeder.java # Database initialization
│   │
│   ├── controller/
│   │   └── CertificateController.java    # REST API endpoints
│   │
│   ├── service/
│   │   ├── CertificateService.java       # Main business logic interface
│   │   ├── PdfGenerationService.java     # PDF generation interface
│   │   ├── QrCodeService.java            # QR code generation interface
│   │   ├── StorageService.java           # File storage interface
│   │   └── impl/
│   │       ├── CertificateServiceImpl.java      # Certificate logic
│   │       ├── PuppeteerPdfGenerationService.java # PDF via Puppeteer
│   │       ├── ZxingQrCodeService.java         # QR code via Zxing
│   │       └── LocalStorageService.java        # Local file storage
│   │
│   ├── repository/
│   │   ├── CertificateRepository.java         # Certificate entity repo
│   │   ├── CertificateTemplateRepository.java # Template entity repo
│   │   └── VerificationLogRepository.java     # Audit/verification repo
│   │
│   ├── entity/
│   │   ├── Certificate.java                # Certificate JPA entity
│   │   ├── CertificateTemplate.java        # Template JPA entity
│   │   ├── CertificateStatus.java          # Status enum
│   │   ├── TemplateFormat.java             # Format enum
│   │   └── VerificationLog.java            # Audit entity
│   │
│   ├── dto/
│   │   ├── CertificateResponse.java        # Certificate DTO (response)
│   │   ├── CertificateGenerateRequest.java # Generate request DTO
│   │   ├── TemplateResponse.java           # Template response DTO
│   │   ├── TemplateRequest.java            # Template request DTO
│   │   ├── VerificationResponse.java       # Verification response DTO
│   │   └── ApiErrorResponse.java           # Error response DTO
│   │
│   ├── exception/
│   │   ├── CertificateGenerationException.java # Custom exception
│   │   ├── ResourceNotFoundException.java      # Resource not found
│   │   └── GlobalExceptionHandler.java        # Global error handler
│   │
│   ├── security/
│   │   └── JwtAuthFilter.java              # JWT authentication filter
│   │
│   └── CertificateServiceApplication.java  # Spring Boot main class
│
├── src/main/resources/
│   └── application.properties               # Service configuration
│
├── scripts/
│   └── render-certificate-pdf.mjs          # Node.js PDF rendering utility
│
├── pom.xml                                  # Maven configuration
└── package.json                             # Node.js dependencies (if needed)
```

### Key Design Patterns

- **Service Layer Pattern**: Business logic abstraction via interfaces
- **Strategy Pattern**: Multiple implementations (PDF, QR, Storage)
- **Repository Pattern**: Data access abstraction
- **Exception Hierarchy**: Custom exceptions for different error scenarios
- **DTO Pattern**: Separation of internal entities from API contracts

---

## 🎨 Frontend Structure (`LS-frontend/src/features/certificates/`)

### Current Files: 13 (scattered across 3 locations)

**Consolidated Target Structure**:

```
features/certificates/
├── api/
│   └── certificateApi.js                    # API client & service
│
├── components/
│   ├── CertificatePreview.jsx              # Certificate preview display
│   └── CertificateTemplateRegistry.jsx     # Template configuration UI
│
├── pages/
│   ├── StudentCertificatesPage.jsx         # Student certificates list
│   ├── CertificateDownloadPage.jsx         # Download certificate
│   ├── CertificateRenderPage.jsx           # Render/view certificate
│   ├── CertificateVerificationPage.jsx     # Verify certificate authenticity
│   └── AdminTemplateManagerPage.jsx        # Admin template management
│
├── styles/
│   ├── CertificateDashboard.module.scss        # Dashboard styles
│   ├── CertificateDownloadPage.module.scss     # Download page styles
│   ├── CertificateRender.module.scss           # Render page styles
│   ├── CertificateVerification.module.scss     # Verification page styles
│   ├── CertificateTemplates.module.scss        # Templates editor styles
│   └── AdminTemplateManager.module.scss        # Admin template styles
│
├── types/
│   └── certificate.types.js                 # TypeScript type definitions
│       ├── Certificate interface
│       ├── CertificateTemplate interface
│       ├── VerificationResponse interface
│       └── API request/response types
│
├── utils/
│   ├── certificateHelpers.js               # Utility functions
│   ├── validators.js                       # Validation functions
│   └── formatters.js                       # Data formatting helpers
│
├── hooks/
│   ├── useCertificate.js                   # Certificate data fetching
│   ├── useTemplate.js                      # Template management
│   └── useVerification.js                  # Verification logic
│
└── README.md                                 # Feature documentation
```

### Consolidated Pages (from legacy locations)

**Old locations to consolidate**:
- `pages/Learner/Certificates/Certificates.jsx` → Integrate into `StudentCertificatesPage`
- `pages/Learner/DownloadCertificate/DownloadCertificate.jsx` → Integrate into `CertificateDownloadPage`

---

## 📂 File Organization Rules

### Backend (`certificate-service/`)

| Layer | Responsibility | Example Files |
|-------|-----------------|----------------|
| **Controller** | HTTP endpoint mapping | `CertificateController.java` |
| **Service** | Business logic interfaces | `CertificateService.java` |
| **Service Impl** | Business logic implementation | `CertificateServiceImpl.java` |
| **Repository** | Database CRUD operations | `CertificateRepository.java` |
| **Entity** | JPA/Database models | `Certificate.java` |
| **DTO** | Request/Response objects | `CertificateResponse.java` |
| **Exception** | Custom error handling | `CertificateGenerationException.java` |
| **Config** | Spring configuration | `SecurityConfig.java` |
| **Security** | Authentication/Authorization | `JwtAuthFilter.java` |

### Frontend (`features/certificates/`)

| Layer | Responsibility | Example Files |
|-------|-----------------|----------------|
| **Pages** | Full-page components (route-level) | `StudentCertificatesPage.jsx` |
| **Components** | Reusable UI components | `CertificatePreview.jsx` |
| **API** | HTTP client & service calls | `certificateApi.js` |
| **Hooks** | Shared stateful logic | `useCertificate.js` |
| **Types** | TypeScript interfaces | `certificate.types.js` |
| **Utils** | Helper functions | `certificateHelpers.js` |
| **Styles** | CSS/SCSS modules | `*.module.scss` |

---

## 🔄 Migration Checklist

### Backend
- [x] Already organized in `certificate-service/`
- [ ] Document each service's responsibility
- [ ] Add JSDoc comments to public methods
- [ ] Create unit tests directory
- [ ] Add integration test examples

### Frontend
- [ ] Move `pages/Learner/Certificates/*` to `features/certificates/pages/`
- [ ] Move `pages/Learner/DownloadCertificate/*` to `features/certificates/pages/`
- [ ] Create `types/` directory with interfaces
- [ ] Create `utils/` directory with helpers
- [ ] Create `hooks/` directory with custom hooks
- [ ] Create feature documentation (`README.md`)
- [ ] Update route configurations
- [ ] Update import paths across the application

---

## 📝 API Endpoints

```
POST   /api/certificates/generate           # Generate new certificate
GET    /api/certificates/{id}               # Get certificate details
GET    /api/certificates/user/{userId}      # List user certificates
POST   /api/certificates/{id}/download      # Download certificate
POST   /api/certificates/verify             # Verify certificate
GET    /api/certificates/templates          # List templates
POST   /api/certificates/templates          # Create template (admin)
PUT    /api/certificates/templates/{id}     # Update template (admin)
DELETE /api/certificates/templates/{id}     # Delete template (admin)
```

---

## 🔐 Security Considerations

- JWT authentication on all endpoints
- Role-based access control (LEARNER, INSTRUCTOR, ADMIN)
- Certificate ownership verification
- Audit logging for all operations
- QR code embedded for verification

---

## 📚 Dependencies

### Backend
- Spring Boot
- JPA/Hibernate
- Puppeteer (PDF generation)
- Zxing (QR codes)
- MongoDB/SQL database

### Frontend
- React
- React Router (navigation)
- axios/fetch (API calls)
- SCSS (styling)

---

## 🚀 Performance Considerations

- Lazy load certificate list (pagination)
- Cache template definitions
- Async PDF generation (background jobs recommended)
- CDN for certificate storage
- Efficient QR code generation

---

## 📖 Documentation Files

- **This file**: High-level structure and organization
- **Backend README**: Service setup and configuration
- **Frontend README**: Component usage and integration
- **API Documentation**: Endpoint specifications
- **Migration Guide**: Step-by-step reorganization

