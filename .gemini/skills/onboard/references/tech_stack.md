# Tech Stack & Dependency Detection Guide

## Indicators of Language & Frameworks

### JavaScript / TypeScript
- `package.json` (Required)
- `tsconfig.json` (TypeScript)
- `next.config.js` (Next.js)
- `vite.config.ts` (Vite)
- `tailwind.config.js` (TailwindCSS)
- `prisma/schema.prisma` (Prisma ORM)

### Python
- `requirements.txt`, `pyproject.toml`
- `manage.py` (Django)
- `alembic/` (Database migrations)

## Key Dependencies to Identify
- **State Management:** Redux, MobX, Zustand, Vuex, Pinia.
- **Database/ORM:** Prisma, TypeORM, Mongoose, Sequelize, SQLAlchemy, Eloquent.
- **UI/Styling:** TailwindCSS, Bootstrap, Material UI, Styled Components, Sass.
- **Testing:** Jest, Mocha, Cypress, Pytest, Vitest.
- **API/Communication:** Axios, Apollo Client, React Query, TRPC.

## Runtime & Engine Versions
- **Node.js:** `.nvmrc`, `.node-version`, `engines` field in `package.json`.
- **Python:** `.python-version`, `runtime.txt`.
- **Ruby:** `.ruby-version`, `Gemfile`.
- **Docker:** `FROM` instruction in `Dockerfile`.

## Documentation Discovery
- `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`.
- `docs/` or `documentation/` folders.
- `architecture.md`, `ADR/` (Architecture Decision Records).
- `swagger.json`, `openapi.yaml` (API Documentation).
