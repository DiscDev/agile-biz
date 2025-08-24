# Next.js Full-Stack Application

This is a full-stack application built with Next.js 14, featuring App Router, TypeScript, Prisma ORM, and Tailwind CSS.

## Tech Stack

* **Framework**: Next.js 14 with App Router
* **Language**: TypeScript
* **Database**: PostgreSQL with Prisma ORM
* **Styling**: Tailwind CSS
* **UI Components**: Radix UI
* **State Management**: React Query
* **Authentication**: NextAuth.js (optional)
* **Deployment**: Vercel / Docker

## Getting Started

### Prerequisites

* Node.js 18+ and npm
* PostgreSQL database
* Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma db seed  # Optional: seed with sample data
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
.
├── app/                    # App Router pages and layouts
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components
│   └── forms/            # Form components
├── lib/                   # Utility functions
│   ├── api/              # API utilities
│   ├── auth/             # Auth helpers
│   └── db/               # Database utilities
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema file
├── public/               # Static assets
└── styles/               # Global styles
```

## Available Scripts

* `npm run dev` - Start development server
* `npm run build` - Build for production
* `npm run start` - Start production server
* `npm run lint` - Run ESLint
* `npm run type-check` - Run TypeScript compiler check
* `npm run format` - Format code with Prettier
* `npm run db:push` - Push schema changes to database
* `npm run db:migrate` - Run database migrations
* `npm run db:studio` - Open Prisma Studio
* `npm run db:seed` - Seed database with sample data

## Database Management

### Schema Changes
Edit `prisma/schema.prisma` then run:
```bash
npx prisma migrate dev --name describe-your-change
```

### View Database
```bash
npm run db:studio
```

## API Routes

API routes are located in `app/api/` and follow Next.js App Router conventions:

* `app/api/users/route.ts` - User endpoints
* `app/api/auth/[...nextauth]/route.ts` - Authentication endpoints

## Authentication

Authentication is handled by NextAuth.js. Configure providers in `lib/auth/auth-options.ts`.

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker
```bash
docker-compose up -d
```

## Development Tips

1. Use `npm run dev` with hot reload for development
2. Check `npm run type-check` before committing
3. Run `npm run lint` to catch code issues
4. Use Prisma Studio (`npm run db:studio`) to inspect data
5. Keep `.env` secrets safe and never commit them

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Your License Here]