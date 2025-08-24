# [Project Name]

A modern full-stack application built with React and Node.js.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL / MongoDB
- **Deployment**: Docker + Docker Compose

## Project Structure

```
├── frontend/          # React application
├── backend/           # Node.js Express API
├── shared/            # Shared TypeScript types
├── docs/              # Project documentation
├── scripts/           # Build and deployment scripts
└── docker-compose.yml # Local development environment
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for database)
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd [project-name]
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development environment:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Database: localhost:5432 (PostgreSQL)

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build both frontend and backend for production
- `npm run test` - Run all tests
- `npm run lint` - Run linting for both frontend and backend
- `npm run docker:up` - Start Docker services (database)
- `npm run docker:down` - Stop Docker services

### Development Workflow

1. Frontend development server runs on port 5173 with hot module replacement
2. Backend API runs on port 3001 with nodemon for auto-restart
3. Frontend proxies API calls to backend (configured in Vite)
4. Shared TypeScript types ensure type safety across the stack

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
JWT_SECRET=your-secret-key

# Frontend (Vite requires VITE_ prefix)
VITE_API_URL=http://localhost:3001
```

## Testing

Run the test suite:
```bash
npm test
```

- Unit tests: Located in `__tests__` directories
- Integration tests: In `tests/integration`
- E2E tests: In `tests/e2e`

## Deployment

### Production Build

```bash
npm run build
```

This creates:
- `frontend/dist` - Optimized frontend assets
- `backend/dist` - Compiled backend code

### Docker Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## API Documentation

API documentation is available at http://localhost:3001/api-docs when running in development mode.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Architecture Decisions

- **Separated Structure**: Frontend and backend can be deployed independently
- **TypeScript**: Full type safety across the entire stack
- **Shared Types**: Single source of truth for API contracts
- **Docker**: Consistent development environment across team members

## License

[License Type]

## Support

For questions or issues, please [contact information].