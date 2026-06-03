# LearnSphere Project Structure

This document details the layout of the LearnSphere project workspace to help developers understand where different parts of the application reside.

---

## Directory Overview

* **`LS-frontend/`**: The frontend React client application powered by Vite.
  * **`src/components/`**: Reusable frontend UI components.
    * **`Sidebar/`**: Unified, responsive navigation drawer component supporting all user roles (`admin`, `instructor`, `learner`).
    * **`TopNavBar/`**: Unified header component displaying dynamic page titles, notifications, and profile details.
  * **`src/pages/`**: Primary page routing views.
    * **`auth/`**: Consolidated directory containing `Login`, `Register`, and `ForgotPassword` pages.
    * **`admin/`**: Admin portal dashboards and managers.
    * **`instructor/`**: Instructor course creation and withdrawal pages.
    * **`Learner/`**: Student dashboards, quiz pages, and certificate render views.
    * **`Public/`**: Landing page, About page, Contact page, etc.
  * **`src/services/`**: API layer utilizing Axios to communicate with the Spring Boot microservices.
  * **`src/utils/`**: Shared helper utilities.

* **`LS-backend/`**: Spring Boot backend microservices and databases.
  * **`auth-service/`**: Microservice handling registration, token issuing, and profile endpoints.
  * **`course-service/`**: Microservice hosting course listings and details.
  * **`enrollment-service/`**: Manages course registrations and payments.
  * **`certificate-service/`**: Automates PDF certificate generation.
  * **`database/`**: SQL scripts establishing PostgreSQL/MySQL schemas for the platform.
    * **`certificate_schema.sql`**: Certificate tables.
    * **`sql/schema.sql`**: Main user, enrollment, and review tables.

* **`scripts/`**: Reusable maintenance and seeding scripts.
  * **`data/mongo/`**: Mongo Shell scripts for data ingestion and duplicate checks.
  * **`data/sql/`**: SQL scripts for bulk enrollment data seeding.
