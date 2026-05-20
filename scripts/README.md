# Scripts

Reusable maintenance scripts live here. Keep one-off local experiments out of Git.

## Layout

```text
scripts/
|-- data/
|   |-- mongo/       # MongoDB data import, cleanup, and repair scripts
|   `-- sql/         # SQL seed and migration helper scripts
`-- README.md
```

## Mongo data scripts

Run Mongo scripts from the repository root with `mongosh`, for example:

```bash
mongosh "mongodb://localhost:27017/learnsphere" scripts/data/mongo/check_course_duplicates.mongosh.js
```

Current Mongo scripts:

- `scripts/data/mongo/import_courses.mongosh.js`
- `scripts/data/mongo/check_course_duplicates.mongosh.js`
- `scripts/data/mongo/dedupe_courses_by_title.mongosh.js`
- `scripts/data/mongo/update_course_titles_thumbnails.mongosh.js`
- `scripts/data/mongo/rebalance_instructors.js`

## SQL data scripts

- `scripts/data/sql/seed_enrollments.sql`

