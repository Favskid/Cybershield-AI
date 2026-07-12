# Cybershield AI

A comprehensive cybersecurity education platform designed to provide interactive learning experiences, threat intelligence, and skill assessment through AI-powered features.

## 🌟 Overview

Cybershield AI is an advanced Learning Management System (LMS) specifically tailored for cybersecurity education. The platform combines traditional course-based learning with modern threat intelligence and AI-assisted learning tools to create an immersive educational experience for cybersecurity professionals and enthusiasts.

### Key Features

- **Interactive Course Management**: Comprehensive cybersecurity courses with structured modules and content
- **AI-Powered Quizzes**: Intelligent assessment system with adaptive question generation
- **Threat Intelligence Dashboard**: Real-time cybersecurity threat tracking and reporting
- **Progress Tracking**: Detailed learning analytics and performance metrics
- **User Role Management**: Multi-tiered access control (Students, Admins)
- **Admin Dashboard**: Centralized platform management and content administration
- **Announcement System**: Real-time communication and updates
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

## 🏗️ Architecture

Cybershield AI follows a modern monorepo architecture with clear separation of concerns:

```
Cybershield AI/
├── backend/          # Express.js API server
├── frontend/         # React + Vite web application
├── lib/              # Shared libraries
│   ├── api-client-react/   # React API client
│   ├── api-spec/          # API specifications
│   ├── api-zod/           # Zod schemas
│   └── db/                # Database layer (Drizzle ORM)
└── scripts/          # Build and utility scripts
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI (shadcn/ui)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **API Documentation**: Swagger UI
- **Logging**: Pino
- **File Upload**: Multer
- **AI Integration**: OpenAI API

### Development Tools
- **Package Manager**: pnpm (workspace support)
- **Type Checking**: TypeScript
- **Code Formatting**: Prettier
- **Build Tool**: esbuild
- **Hot Reload**: nodemon (backend), Vite HMR (frontend)

## 📋 Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL (v14 or higher)
- OpenAI API Key (for AI features)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Cybershield AI
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cybershield

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# OpenAI API (optional, for AI features)
OPENAI_API_KEY=your-openai-api-key

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Database Setup

```bash
# Push database schema
cd lib/db
pnpm run push
```

## 🏃 Running the Application

### Development Mode

**Backend (API Server):**
```bash
cd backend
pnpm run dev
```
The API server will run on `http://localhost:3001`

**Frontend (Web App):**
```bash
cd frontend
pnpm run dev
```
The web application will run on `http://localhost:5173`

### Production Build

```bash
# Build all packages
pnpm run build

# Start backend
cd backend
pnpm run start

# Serve frontend
cd frontend
pnpm run serve
```

## 📁 Project Structure

### Backend (`/backend`)
- `src/app.ts` - Express application setup
- `src/routes/` - API route handlers
  - `auth.ts` - Authentication endpoints
  - `courses.ts` - Course management
  - `quizzes.ts` - Quiz system
  - `threats.ts` - Threat intelligence
  - `users.ts` - User management
  - `admin.ts` - Admin operations
  - `progress.ts` - Progress tracking
  - `announcements.ts` - Announcement system
- `src/middlewares/` - Custom middleware
- `src/lib/` - Utility functions
- `src/swagger.ts` - API documentation

### Frontend (`/frontend`)
- `src/App.tsx` - Main application component
- `src/pages/` - Page components
  - `Landing.tsx` - Landing page
  - `Dashboard.tsx` - User dashboard
  - `Courses.tsx` - Course listing
  - `CourseDetail.tsx` - Course details
  - `Quiz.tsx` - Quiz interface
  - `Threats.tsx` - Threat dashboard
  - `Profile.tsx` - User profile
  - `admin/` - Admin pages
- `src/components/` - Reusable UI components
- `src/context/` - React context providers
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions

### Shared Libraries (`/lib`)
- `api-client-react/` - React API client with type safety
- `api-spec/` - OpenAPI specifications
- `api-zod/` - Zod validation schemas
- `db/` - Database schema and connection

## 🔐 API Documentation

Once the backend is running, access the interactive API documentation at:
```
http://localhost:3001/api-docs
```

## 👥 User Roles

### Student
- Access to courses and learning materials
- Take quizzes and track progress
- Report cybersecurity threats
- View personal analytics

### Admin
- Full platform management
- User management and moderation
- Course and quiz creation
- Threat intelligence oversight
- Announcement management

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin)

### Quizzes
- `GET /api/quizzes` - List quizzes
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Threats
- `GET /api/threats` - List threats
- `POST /api/threats` - Report new threat
- `GET /api/threats/:id` - Get threat details

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update progress

## 🧪 Testing

```bash
# Type checking
pnpm run typecheck

# Build verification
pnpm run build
```

## 📊 Database Schema

The application uses the following main entities:
- **Users**: User accounts with role-based access
- **Courses**: Cybersecurity course content
- **Quizzes**: Assessment questions and answers
- **Threats**: Cybersecurity threat reports
- **Progress**: User learning progress tracking
- **Announcements**: Platform announcements

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- CORS configuration
- Input validation with Zod schemas
- SQL injection prevention (parameterized queries via ORM)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 📧 Contact

For questions or support, please open an issue in the repository.

## 🙏 Acknowledgments

- Built with modern web technologies
- UI components from Radix UI and shadcn/ui
- Icons from Lucide React
- Database powered by PostgreSQL and Drizzle ORM
