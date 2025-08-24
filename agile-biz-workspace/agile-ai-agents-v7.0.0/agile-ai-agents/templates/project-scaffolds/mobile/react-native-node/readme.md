# React Native + Node.js Mobile Application

A full-stack mobile application with React Native frontend and Node.js backend API.

## Tech Stack

### Mobile App
* **Framework**: React Native with TypeScript
* **Navigation**: React Navigation
* **State Management**: Redux Toolkit
* **UI Components**: React Native Elements
* **API Client**: Axios

### Backend API
* **Runtime**: Node.js with Express
* **Language**: TypeScript
* **Database**: PostgreSQL with Prisma ORM
* **Authentication**: JWT
* **Caching**: Redis
* **Validation**: Joi

## Getting Started

### Prerequisites

* Node.js 18+ and npm
* React Native development environment set up:
  * iOS: Xcode 14+ (macOS only)
  * Android: Android Studio with Android SDK
* PostgreSQL database
* Redis (optional, for caching)
* Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-name>
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install mobile dependencies:
```bash
cd ../mobile
npm install

# iOS only
cd ios && pod install && cd ..
```

4. Set up environment variables:
```bash
# Backend
cd ../backend
cp .env.example .env
# Edit .env with your configuration

# Mobile
cd ../mobile
cp .env.example .env
# Edit .env with your API URL
```

5. Set up the database:
```bash
cd ../backend
npx prisma migrate dev
npx prisma db seed  # Optional: seed with sample data
```

## Development

### Start Backend Services

Using Docker (recommended):
```bash
docker-compose up -d
```

Or manually:
```bash
# Terminal 1: Start PostgreSQL and Redis
# (Use your local installations or Docker)

# Terminal 2: Start backend
cd backend
npm run dev
```

### Start Mobile App

#### iOS
```bash
cd mobile
npm run ios
```

#### Android
```bash
cd mobile
npm run android
```

#### Metro Bundler (if not auto-started)
```bash
cd mobile
npm start
```

## Project Structure

```
.
├── mobile/                 # React Native app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── screens/       # Screen components
│   │   ├── navigation/    # Navigation setup
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   ├── utils/         # Utilities
│   │   └── types/         # TypeScript types
│   ├── assets/            # Images, fonts
│   ├── ios/               # iOS specific code
│   └── android/           # Android specific code
│
├── backend/               # Node.js API
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utilities
│   ├── prisma/            # Database schema
│   └── tests/             # API tests
│
├── shared/                # Shared code
│   ├── types/             # Shared TypeScript types
│   └── constants/         # Shared constants
│
└── scripts/               # Build & deployment
```

## API Documentation

### Authentication
```
POST   /api/auth/register   - Register new user
POST   /api/auth/login      - Login user
POST   /api/auth/refresh    - Refresh access token
POST   /api/auth/logout     - Logout user
```

### User Management
```
GET    /api/users/profile   - Get current user
PUT    /api/users/profile   - Update profile
DELETE /api/users/account   - Delete account
```

### Example API Call (Mobile)
```typescript
import api from './services/api';

const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    // Store token and update state
  } catch (error) {
    // Handle error
  }
};
```

## Mobile Features

### Implemented
* User authentication
* Profile management
* Push notifications setup
* Offline mode foundation
* Deep linking ready
* Biometric authentication ready

### Configuration Required
* Push notifications (FCM/APNs)
* Social login providers
* Analytics (Firebase, Mixpanel)
* Crash reporting (Sentry, Crashlytics)
* Code push (Microsoft CodePush)

## Building for Production

### Mobile App

#### iOS
```bash
cd mobile
npm run build:ios
# Follow prompts for signing and archiving
```

#### Android
```bash
cd mobile
npm run build:android
# APK/AAB will be in android/app/build/outputs/
```

### Backend API
```bash
cd backend
npm run build
# Deploy dist/ folder to your server
```

## Testing

### Backend Tests
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Mobile Tests
```bash
cd mobile
npm test              # Run unit tests
npm run test:e2e:ios  # iOS E2E tests
npm run test:e2e:android # Android E2E tests
```

## Deployment

### Mobile App
1. **TestFlight (iOS)**: Upload through Xcode or Transporter
2. **Play Console (Android)**: Upload AAB file
3. **CodePush**: For JavaScript-only updates

### Backend API
1. Build: `npm run build`
2. Deploy to your cloud provider:
   * AWS EC2/ECS
   * Google Cloud Run
   * Azure App Service
   * Heroku

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
REDIS_URL=redis://...
```

### Mobile (.env)
```
API_URL=https://api.yourdomain.com
API_VERSION=v1
SENTRY_DSN=your-sentry-dsn
```

## Troubleshooting

### Mobile App Issues

**Build fails on iOS**
* Clean build: `cd ios && xcodebuild clean`
* Clear pods: `cd ios && pod deintegrate && pod install`

**Build fails on Android**
* Clean build: `cd android && ./gradlew clean`
* Clear cache: `cd android && ./gradlew cleanBuildCache`

**Metro bundler issues**
* Clear cache: `npx react-native start --reset-cache`

### Backend Issues

**Database connection fails**
* Check DATABASE_URL format
* Ensure PostgreSQL is running
* Check firewall/network settings

**Prisma issues**
* Regenerate client: `npx prisma generate`
* Reset database: `npx prisma migrate reset`

## Security Considerations

* Store sensitive data in secure storage
* Implement certificate pinning
* Use biometric authentication
* Encrypt local database
* Implement proper session management
* Regular security audits

## Performance Optimization

* Implement lazy loading
* Use React.memo for components
* Optimize images
* Implement proper caching
* Use FastImage for images
* Monitor with Flipper

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Write/update tests
5. Submit pull request

## License

[Your License Here]