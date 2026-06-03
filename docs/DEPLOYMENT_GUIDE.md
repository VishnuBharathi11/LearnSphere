# LearnSphere Production Deployment Guide

This guide provides step-by-step instructions to deploy the LearnSphere full-stack application on **Render** (for databases & backend services) and **Vercel** (for frontend static hosting).

---

## Step 1: Deploy and Initialize Databases (Render / MongoDB Atlas)

Your application utilizes a dual-database architecture: MySQL (relational) and MongoDB (document).

### A. Deploy MySQL Database on Render
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New > PostgreSQL** or **New > MySQL** (or provision a MySQL instance using a cloud provider like [Aiven](https://aiven.io/)).
2. Once provisioned, note down the database connection details:
   * **Host / External URL**: e.g., `jdbc:mysql://<hostname>:<port>/<dbname>`
   * **Username**: e.g., `mysql_user`
   * **Password**: e.g., `your_secure_password`
3. Connect to your database using a SQL client (DBeaver, MySQL Workbench, etc.) and run the following initialization scripts to construct the tables:
   * Run [sql/schema.sql](file:///d:/Full%20stack%20project/LearnSphere/LS-backend/database/sql/schema.sql)
   * Run [certificate_schema.sql](file:///d:/Full%20stack%20project/LearnSphere/LS-backend/database/certificate_schema.sql)

### B. Deploy MongoDB Database on MongoDB Atlas
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Create a free shared cluster (e.g. `Cluster0`) and choose **Connect > Drivers**.
3. Copy your MongoDB Connection String:
   * e.g., `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/learnsphere_db?retryWrites=true&w=majority`

---

## Step 2: Deploy Backend Microservices on Render

You will deploy **8 Web Services** on Render (one for each microservice under `LS-backend`). 

### Common Settings for all Render Services
* **Runtime**: `Java` (or `Docker` if you prefer containerized deployment)
* **Root Directory**: Point to the specific service folder (e.g., `LearnSphere/LS-backend/auth-service`)
* **Build Command**: `./mvnw clean package -DskipTests` (or `mvn clean package -DskipTests`)
* **Environment Variables**:
  * Set `JAVA_VERSION = 21` to match the project compiler.

### Service-Specific Settings

| Service Name | Port | Build Target (Start Command) | Env Variables Required |
| :--- | :--- | :--- | :--- |
| **api-gateway** | `8084` | `java -jar target/api-gateway-0.0.1-SNAPSHOT.jar` | `AUTH_SERVICE_URL`, `ENROLLMENT_SERVICE_URL`, `DISCUSSION_SERVICE_URL`, `ADMIN_SERVICE_URL`, `PROGRESS_SERVICE_URL`, `COURSE_SERVICE_URL`, `CERTIFICATE_SERVICE_URL` |
| **auth-service** | `9098` | `java -jar target/auth-service-0.0.1-SNAPSHOT.jar` | `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `ADMIN_ANALYTICS_SERVICE_URL` |
| **course-service** | `9091` | `java -jar target/course-service-0.0.1-SNAPSHOT.jar` | `SPRING_MONGODB_URI` |
| **enrollment-service**| `9092` | `java -jar target/enrollment-service-0.0.1-SNAPSHOT.jar`| `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `COURSE_SERVICE_URL` |
| **learn-progress-service**| `9093` | `java -jar target/learn-progress-service-0.0.1-SNAPSHOT.jar`| `SPRING_MONGODB_URI`, `COURSE_SERVICE_URL`, `ENROLLMENT_SERVICE_URL`, `DISCUSSION_SERVICE_URL`, `ADMIN_ANALYTICS_SERVICE_URL` |
| **discussion-notification-service**| `9094` | `java -jar target/discussion-notification-service-0.0.1-SNAPSHOT.jar`| `SPRING_MONGODB_URI`, `COURSE_SERVICE_URL` |
| **admin-analytics-service**| `9095` | `java -jar target/admin-analytics-service-0.0.1-SNAPSHOT.jar`| `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` |
| **certificate-service**| `9099` | `java -jar target/certificate-service-0.0.1-SNAPSHOT.jar`| `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `FRONTEND_PUBLIC_URL`, `CERTIFICATE_SERVICE_URL` |

---

## Step 3: Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure the Project Settings:
   * **Framework Preset**: `Vite` (or `Other`)
   * **Root Directory**: `LearnSphere/LS-frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Add the following **Environment Variables** in Vercel to point the frontend pages to your live **api-gateway** Render URL:
   * `VITE_AUTH_API_BASE_URL = https://<your-api-gateway-render-url>/api/auth`
   * *(Similarly update other API variables if you bypass the gateway or configure gateways directly)*
5. Click **Deploy**.
