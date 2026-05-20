# LearnSphere Project Structure

This repository is organized as a full-stack learning platform with separate frontend, backend, database, and maintenance script areas.

## Top-level layout

```text
LearnSphere/
|-- LS-frontend/                 # React + Vite client application
|-- LS-backend/                  # Spring Boot backend services and database assets
|-- scripts/                     # Operational and data scripts used outside app runtime
|-- docs/                        # Project documentation and maintenance notes
|-- FORUM_MODULE.md              # Forum feature documentation
|-- LICENSE
`-- README.md
```

## Frontend

```text
LS-frontend/
|-- src/
|   |-- assets/                  # Static images, videos, SVGs used by the UI
|   |-- auth-pages/              # Login, register, and password recovery pages
|   |-- components/              # Shared reusable UI components
|   |-- data/                    # Local static data used by the UI
|   |-- hooks/                   # React hooks
|   |-- pages/                   # Route-level screens grouped by role/domain
|   |-- services/                # API clients and client-side stores
|   `-- utils/                   # Shared frontend helpers
|-- package.json
|-- package-lock.json
`-- vite.config.js
```

Generated frontend folders such as `node_modules/` and `dist/` should stay out of Git.

## Backend

```text
LS-backend/
|-- admin-analytics-service/
|-- api-gateway/
|-- auth-service/
|-- course-service/
|-- discussion-notification-service/
|-- enrollment-service/
|-- learn-progress-service/
`-- database/
    |-- mongo/
    `-- sql/
```

Each service is an independent Spring Boot/Maven module with its own `pom.xml`, source tree, and Maven wrapper files where present.

Generated backend folders such as `target/` should stay out of Git.

## Scripts

```text
scripts/
|-- data/
|   |-- mongo/                   # MongoDB import, cleanup, and repair scripts
|   `-- sql/                     # SQL seed and migration helper scripts
`-- README.md                    # Script usage notes
```

`scripts/` contains maintenance or data scripts that are not part of the normal application runtime. Keep scripts here when they are reusable and documented. One-off local experiments should not be committed.

## Git root recommendation

Use `LearnSphere/` as the application repository root when committing and pushing. The parent folder `D:\Full stack project` currently also has a `.git` directory, so pushing from the parent can accidentally track workspace-level files such as IDE metadata, Eclipse metadata, or personal assets.
