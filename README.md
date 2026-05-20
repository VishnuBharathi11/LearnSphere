# LearnSphere

LearnSphere is a full-stack learning platform with a React/Vite frontend and multiple Spring Boot backend services.

## Repository Layout

- `LS-frontend/` - React client application.
- `LS-backend/` - Spring Boot services, API gateway, and database assets.
- `scripts/` - reusable maintenance and data scripts, including Mongo data scripts under `scripts/data/mongo/`.
- `docs/` - project structure, audit notes, and cleanup guidance.

See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for the detailed layout.

## Common Commands

Frontend:

```bash
cd LS-frontend
npm install
npm run dev
npm run build
```

Backend service example:

```bash
cd LS-backend/auth-service
./mvnw spring-boot:run
```

On Windows PowerShell, use `.\mvnw.cmd spring-boot:run` when running a service with its Maven wrapper.

## Git Hygiene

Commit from the `LearnSphere/` directory. The parent folder also contains local workspace metadata and is not the clean app root.

Generated folders such as `node_modules/`, `dist/`, and `target/` are ignored. See [docs/CLEANUP_NOTES.md](docs/CLEANUP_NOTES.md) for files that should stay out of commits.
