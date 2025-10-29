# Ato Monorepo

Full-stack task management application with Go backend and React frontend.

## Project Structure

```
ato/
├── api/          # Go backend (Chi router, PostgreSQL, Redis)
├── web/          # React frontend (TanStack Router, Vite, Tailwind)
└── package.json  # Monorepo orchestration
```

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0
- **Go** >= 1.23
- **Docker** & Docker Compose
- **Make** (optional, for API shortcuts)

## Quick Start

### 1. Initial Setup

```bash
# Install root dependencies
pnpm install

# Start Docker services (PostgreSQL & Redis)
pnpm docker:up

# Install all project dependencies
pnpm setup
```

### 2. Development

```bash
# Run both API and Web in parallel
pnpm dev

# Or run individually:
pnpm dev:api    # Start Go API server on :8080
pnpm dev:web    # Start Vite dev server on :3000
```

### 3. Access the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:8080
- **API Docs**: http://localhost:8080/api/v1

## Available Scripts

### Development
- `pnpm dev` - Run both API and web in development mode
- `pnpm dev:api` - Run API server only
- `pnpm dev:web` - Run web dev server only

### Build
- `pnpm build` - Build both projects for production
- `pnpm build:api` - Build API binary
- `pnpm build:web` - Build web assets

### Docker
- `pnpm docker:up` - Start PostgreSQL and Redis containers
- `pnpm docker:down` - Stop and remove containers
- `pnpm docker:logs` - View container logs

### Testing
- `pnpm test` - Run all tests
- `pnpm test:api` - Run Go tests
- `pnpm test:web` - Run web tests

### Utilities
- `pnpm lint` - Lint all projects
- `pnpm format` - Format all code
- `pnpm clean` - Remove build artifacts and dependencies
- `pnpm setup` - Complete setup (Docker + dependencies)

## Environment Variables

### API (`api/.env`)
```env
PORT=8080
DATABASE_URL=postgres://db_user:db_password@localhost:5432/ato?sslmode=disable
REDIS_URL=redis://:redis_password@redis:6379/0
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=168h
```

### Web (`web/.env`)
```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Tech Stack

### Backend (API)
- **Language**: Go 1.23
- **Router**: Chi v5
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Auth**: JWT with refresh tokens
- **Password**: bcrypt

### Frontend (Web)
- **Framework**: React 19
- **Router**: TanStack Router
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **Components**: React Aria Components

## Database

The PostgreSQL database is automatically initialized with the schema on first startup.

**Connect to database:**
```bash
docker exec -it ato-postgres psql -U admin -d ato
```

## Troubleshooting

**Port conflicts:**
- API runs on `:8080`
- Web runs on `:3000`
- PostgreSQL on `:5432`
- Redis on `:6379`

**Docker not running:**
```bash
# Check Docker status
docker ps

# Restart containers
pnpm docker:down
pnpm docker:up
```

**Clear everything and start fresh:**
```bash
pnpm clean
pnpm docker:down
pnpm setup
pnpm dev
```

## License

MIT
