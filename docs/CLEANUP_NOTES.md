# Cleanup Notes

These files and folders are generated, local-only, or likely accidental. They should not be committed unless there is a specific reason.

## Generated dependencies and build output

- `LS-frontend/node_modules/`
- `LS-frontend/dist/`
- `LS-backend/**/target/`
- `LS-backend/**/*.class`
- `LS-backend/**/*.jar`

## Logs

- `LS-frontend/vite-dev.log`
- `LS-frontend/vite-dev.err.log`
- Any other `*.log` files

## IDE and workspace files

- `.metadata/`
- `.idea/`
- `.vscode/` except shared recommendations such as `.vscode/extensions.json`
- `.classpath`
- `.factorypath`
- `.project`
- `.settings/`
- `*.iml`

Some of these are already tracked in the repository, especially under `LS-backend/learn-progress-service/`. Because they are tracked, `.gitignore` will not remove them by itself. Remove them only after confirming the team does not rely on IDE-specific project files.

## Parent-folder files outside the app repo

The parent folder `D:\Full stack project` contains local files that should not be part of the LearnSphere app repository:

- `.metadata/`
- `.idea/`
- `VISHU CERTIFICATE.png`

Keep these out of app commits. If you continue using the parent folder as a Git repo, its `.gitignore` should ignore these files.

## Current Git observations

- `LearnSphere/` is already its own Git repository.
- The parent folder is also a Git repository.
- Prefer committing from `D:\Full stack project\LearnSphere`.
- `LS-backend/learn-progress-service/target/` appeared as untracked before the cleanup ignore file was added.
- `LS-backend/learn-progress-service/.project` has local IDE-generated changes. Review before committing.
- `AUDIT_REPORT.md` and `RECOVERY_PLAN.md` were found at the repository root and moved under `docs/` so project documentation stays together.
- `docs/AUDIT_REPORT.md` and `docs/RECOVERY_PLAN.md` contain mojibake characters such as `âœ…`; they should be cleaned if these documents will be kept long-term.
- Root-level Mongo scripts were moved to `scripts/data/mongo/`:
  - `check_course_duplicates.mongosh.js`
  - `dedupe_courses_by_title.mongosh.js`
  - `import_courses.mongosh.js`
  - `update_course_titles_thumbnails.mongosh.js`
  - `rebalance_instructors.js`
- `scripts/seed_enrollments.sql` was moved to `scripts/data/sql/seed_enrollments.sql`.
