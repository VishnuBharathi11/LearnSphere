# LearnSphere Repository Cleanup Notes

To maintain a clean and reliable codebase, follow these guidelines to prevent developer-specific files, IDE settings, and build outputs from entering git commits.

---

## Files to Keep Out of Commits

### 1. Build and Dependency Directories
These directories are automatically generated during local compilation and should **never** be committed. They are ignored by `.gitignore`:
* `node_modules/` (Frontend package dependencies)
* `dist/`, `dist-ssr/` (Compiled frontend static build)
* `target/` (Compiled Maven artifacts for backend services)

### 2. IDE and Workspace Settings
Individual IDE workspace profiles are specific to your machine and can conflict with other developers' settings.
* `.metadata/` (Eclipse workspace cache)
* `.project`, `.classpath`, `.factorypath`, `.settings/` (Eclipse metadata)
* `.idea/` (IntelliJ configurations)
* `.vscode/` (VS Code local workspace configurations)

### 3. Log and Temporary Runtime Files
Local diagnostic files and runtime flags generated during development:
* `*.log` (e.g., `vite-dev.log`, `vite-dev.err.log`)
* `*.tmp`, `*.temp` (Temporary directories)

---

## Cleanup Commands

If any ignored files have accidentally been checked in, untrack them using the following Git commands from your terminal:

```bash
# Untrack Eclipse settings files
git rm --cached -r LS-backend/**/*.project
git rm --cached -r LS-backend/**/*.classpath
git rm --cached -r LS-backend/**/*.factorypath
git rm --cached -r LS-backend/**/*.settings

# Untrack local log files
git rm --cached LS-frontend/*.log
```
