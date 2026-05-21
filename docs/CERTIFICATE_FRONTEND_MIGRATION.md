# Certificate Module - Frontend Migration Guide

**Date**: May 21, 2026  
**Objective**: Reorganize 13 frontend certificate files into a professional, scalable structure

---

## 📊 Current Frontend State

### Files to Consolidate

**Scattered Locations**:
```
LS-frontend/src/
├── pages/Learner/
│   ├── Certificates/
│   │   ├── Certificates.jsx
│   │   └── Certificates.scss
│   └── DownloadCertificate/
│       ├── DownloadCertificate.jsx
│       └── DownloadCertificate.scss
└── features/certificates/
    ├── api/
    │   └── certificateApi.js
    ├── components/
    │   ├── CertificatePreview.jsx
    │   └── CertificateTemplateRegistry.jsx
    ├── pages/
    │   ├── StudentCertificatesPage.jsx
    │   ├── CertificateVerificationPage.jsx
    │   ├── CertificateRenderPage.jsx
    │   ├── CertificateDownloadPage.jsx
    │   └── AdminTemplateManagerPage.jsx
    └── styles/
        ├── CertificateDashboard.module.scss
        ├── CertificateTemplates.module.scss
        ├── CertificateRender.module.scss
        ├── CertificateVerification.module.scss
        ├── AdminTemplateManager.module.scss
        └── CertificateDownloadPage.module.scss
```

---

## 🎯 Target Frontend Structure

```
LS-frontend/src/features/certificates/
├── api/
│   └── certificateApi.js                    # API client
├── components/
│   ├── CertificatePreview.jsx
│   └── CertificateTemplateRegistry.jsx
├── pages/
│   ├── StudentCertificatesPage.jsx          # NEW: consolidated Certificates.jsx
│   ├── CertificateDownloadPage.jsx          # NEW: consolidated DownloadCertificate.jsx
│   ├── CertificateRenderPage.jsx
│   ├── CertificateVerificationPage.jsx
│   └── AdminTemplateManagerPage.jsx
├── styles/
│   ├── CertificateDashboard.module.scss
│   ├── CertificateDownloadPage.module.scss
│   ├── CertificateRender.module.scss
│   ├── CertificateVerification.module.scss
│   ├── CertificateTemplates.module.scss
│   └── AdminTemplateManager.module.scss
├── types/
│   └── certificate.types.js                 # NEW: type definitions
├── utils/
│   ├── certificateHelpers.js                # NEW: utility functions
│   ├── validators.js                        # NEW: validation helpers
│   └── formatters.js                        # NEW: formatting helpers
├── hooks/
│   ├── useCertificate.js                    # NEW: custom hook
│   ├── useTemplate.js                       # NEW: custom hook
│   └── useVerification.js                   # NEW: custom hook
├── README.md                                 # NEW: feature documentation
└── index.js                                  # NEW: barrel export
```

---

## ✅ Migration Steps

### Step 1: Create New Directories

Create missing directories:
```bash
mkdir -p LS-frontend/src/features/certificates/types
mkdir -p LS-frontend/src/features/certificates/utils
mkdir -p LS-frontend/src/features/certificates/hooks
```

### Step 2: Create Type Definitions

**File**: `LS-frontend/src/features/certificates/types/certificate.types.js`

```javascript
/**
 * Certificate Data Transfer Objects and Types
 */

export const CertificateStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REVOKED: 'REVOKED',
};

export const TemplateFormat = {
  A4_PORTRAIT: 'A4_PORTRAIT',
  A4_LANDSCAPE: 'A4_LANDSCAPE',
  CUSTOM: 'CUSTOM',
};

/**
 * @typedef {Object} Certificate
 * @property {string} id - Unique certificate ID
 * @property {string} courseId - Course ID
 * @property {string} userId - User ID
 * @property {string} certificateId - Public certificate identifier
 * @property {string} status - Certificate status
 * @property {Date} issuedOn - Issue date
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} CertificateTemplate
 * @property {string} id - Template ID
 * @property {string} name - Template name
 * @property {string} format - Template format
 * @property {Object} layout - Layout configuration
 * @property {string} backgroundUrl - Background image URL
 * @property {boolean} active - Is template active
 */

/**
 * @typedef {Object} VerificationResponse
 * @property {boolean} verified - Is certificate valid
 * @property {Certificate} certificate - Certificate details
 * @property {string} message - Verification message
 */
```

### Step 3: Create Utility Functions

**File**: `LS-frontend/src/features/certificates/utils/certificateHelpers.js`

```javascript
/**
 * Certificate Helper Functions
 */

/**
 * Format certificate ID for display
 * @param {string} certificateId
 * @returns {string}
 */
export const formatCertificateId = (certificateId) => {
  // Format: LS-XXXX-YYYY
  return certificateId || 'N/A';
};

/**
 * Format issue date
 * @param {Date|string} date
 * @returns {string}
 */
export const formatIssueDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

/**
 * Check if certificate is unlocked (ready to download)
 * @param {Object} courseProgress
 * @returns {boolean}
 */
export const isCertificateUnlocked = (courseProgress) => {
  if (!courseProgress) return false;
  return (
    courseProgress.progressPercentage === 100 &&
    courseProgress.finalAssessment?.status === 'PASSED'
  );
};

/**
 * Calculate progress percentage
 * @param {Array} lessons
 * @param {Object} progress
 * @returns {number}
 */
export const calculateProgress = (lessons, progress) => {
  if (!lessons || lessons.length === 0) return 0;
  // Implementation based on your progress tracking
  return Math.round((lessons.filter(l => progress?.[l.id]?.completed).length / lessons.length) * 100);
};

/**
 * Generate download filename for certificate
 * @param {string} courseName
 * @returns {string}
 */
export const generateDownloadFilename = (courseName) => {
  const sanitized = courseName.replace(/[^a-zA-Z0-9-_ ]/g, '');
  return `${sanitized} Certificate.png`;
};
```

**File**: `LS-frontend/src/features/certificates/utils/validators.js`

```javascript
/**
 * Certificate Validation Functions
 */

export const validateCertificateId = (id) => {
  return id && typeof id === 'string' && id.length > 0;
};

export const validateCourseProgress = (progress) => {
  return (
    progress &&
    progress.progressPercentage !== undefined &&
    progress.finalAssessment !== undefined
  );
};

export const validateTemplate = (template) => {
  return (
    template &&
    template.name &&
    template.format &&
    template.backgroundUrl
  );
};
```

**File**: `LS-frontend/src/features/certificates/utils/formatters.js`

```javascript
/**
 * Data Formatting Functions
 */

export const formatCertificateMeta = (certificate) => {
  return {
    course: certificate.course?.courseName || 'Unknown Course',
    learner: certificate.learnerName || 'Learner',
    issued: new Date(certificate.issuedOn).toDateString(),
    certificateId: certificate.certificateId,
    status: certificate.unlocked ? 'Completed' : `${certificate.progress}%`,
  };
};

export const formatTemplateList = (templates) => {
  return templates.map(t => ({
    ...t,
    label: `${t.name} (${t.format})`,
  }));
};
```

### Step 4: Create Custom Hooks

**File**: `LS-frontend/src/features/certificates/hooks/useCertificate.js`

```javascript
import { useEffect, useState } from 'react';
import * as certificateApi from '../api/certificateApi';

/**
 * Hook for managing certificate operations
 */
export const useCertificate = (certificateId) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!certificateId) return;

    const fetchCertificate = async () => {
      setLoading(true);
      try {
        const data = await certificateApi.getCertificateById(certificateId);
        setCertificate(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  return { certificate, loading, error };
};
```

**File**: `LS-frontend/src/features/certificates/hooks/useTemplate.js`

```javascript
import { useEffect, useState } from 'react';
import * as certificateApi from '../api/certificateApi';

/**
 * Hook for managing certificate templates
 */
export const useTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const data = await certificateApi.getTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return { templates, loading, error };
};
```

### Step 5: Consolidate Page Components

**Update**: `LS-frontend/src/features/certificates/pages/StudentCertificatesPage.jsx`

Merge content from `pages/Learner/Certificates/Certificates.jsx` into this file.

**Update**: `LS-frontend/src/features/certificates/pages/CertificateDownloadPage.jsx`

Merge content from `pages/Learner/DownloadCertificate/DownloadCertificate.jsx` into this file.

### Step 6: Create Feature Documentation

**File**: `LS-frontend/src/features/certificates/README.md`

```markdown
# Certificate Feature

## Overview
Certificate management module for LearnSphere learners to view, download, and verify course completion certificates.

## Pages
- **StudentCertificatesPage**: Display all user certificates
- **CertificateDownloadPage**: Download specific certificate
- **CertificateRenderPage**: View certificate details
- **CertificateVerificationPage**: Verify certificate authenticity
- **AdminTemplateManagerPage**: Manage certificate templates

## Components
- **CertificatePreview**: Display certificate preview
- **CertificateTemplateRegistry**: Template configuration UI

## API
- `certificateApi.js`: All API calls for certificates

## Hooks
- `useCertificate()`: Fetch certificate data
- `useTemplate()`: Manage templates
- `useVerification()`: Verify certificates

## Utilities
- `certificateHelpers.js`: Helper functions
- `validators.js`: Validation utilities
- `formatters.js`: Data formatting

## Usage

```jsx
import { useCertificate } from './hooks/useCertificate';

function MyComponent() {
  const { certificate, loading } = useCertificate(certId);
  // ...
}
```
```

### Step 7: Create Barrel Export

**File**: `LS-frontend/src/features/certificates/index.js`

```javascript
// Pages
export { default as StudentCertificatesPage } from './pages/StudentCertificatesPage';
export { default as CertificateDownloadPage } from './pages/CertificateDownloadPage';
export { default as CertificateRenderPage } from './pages/CertificateRenderPage';
export { default as CertificateVerificationPage } from './pages/CertificateVerificationPage';
export { default as AdminTemplateManagerPage } from './pages/AdminTemplateManagerPage';

// Components
export { default as CertificatePreview } from './components/CertificatePreview';
export { default as CertificateTemplateRegistry } from './components/CertificateTemplateRegistry';

// Hooks
export { useCertificate } from './hooks/useCertificate';
export { useTemplate } from './hooks/useTemplate';
export { useVerification } from './hooks/useVerification';

// API
export * as certificateApi from './api/certificateApi';

// Types
export * from './types/certificate.types';

// Utils
export * from './utils/certificateHelpers';
export * from './utils/validators';
export * from './utils/formatters';
```

### Step 8: Update Route Configuration

Update your routing to import from the new location:

```javascript
// Before
import Certificates from './pages/Learner/Certificates/Certificates';
import DownloadCertificate from './pages/Learner/DownloadCertificate/DownloadCertificate';

// After
import { 
  StudentCertificatesPage, 
  CertificateDownloadPage 
} from './features/certificates';
```

### Step 9: Update All Import Paths

Search and replace import paths throughout the application:

```bash
# Old paths to find and replace:
from '../../../pages/Learner/Certificates/Certificates'
from '../../../pages/Learner/DownloadCertificate/DownloadCertificate'

# New paths:
from '../../features/certificates'
```

### Step 10: Cleanup Old Files

Once all imports are updated, delete:
```bash
rm -rf LS-frontend/src/pages/Learner/Certificates/
rm -rf LS-frontend/src/pages/Learner/DownloadCertificate/
```

---

## 📋 Verification Checklist

- [ ] New directories created
- [ ] Type definitions file created
- [ ] Utility functions extracted
- [ ] Custom hooks implemented
- [ ] Pages consolidated
- [ ] Feature README created
- [ ] Barrel export index.js created
- [ ] Route configurations updated
- [ ] All import paths updated
- [ ] Application tested (no broken imports)
- [ ] Old files deleted
- [ ] Git commits made

---

## 🔗 Related Documentation

- [Certificate Module Structure](./CERTIFICATE_MODULE_STRUCTURE.md)
- [Backend Certificate Service](../LS-backend/certificate-service/README.md)
- [API Endpoints](./CERTIFICATE_API.md)

