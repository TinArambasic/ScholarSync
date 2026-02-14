# Student Forum

## Overview
Student forum app with a Node/Express API and a Vite React client. The API uses MongoDB for data storage with bcrypt password hashing.

## Prerequisites
- Node.js (v16+)
- MongoDB running locally or a MongoDB Atlas URI

## Server setup

1. Navigate to server directory and install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```
Edit `.env` to configure MongoDB URI if needed (default: `mongodb://127.0.0.1:27017/student_forum`)

3. Migrate initial data from `data/db.json`:
```bash
npm run migrate
```

4. Create database indexes for performance:
```bash
npm run create-indexes
```

5. Hash existing passwords (required after migration):
```bash
npm run hash-passwords
```

6. Start the API:
```bash
npm run dev
```

The API will run on `http://localhost:4000`

## Client setup

1. Navigate to client directory and install dependencies:
```bash
cd client
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```
Edit `.env` if API URL differs (default: `http://localhost:4000`)

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

### Server (.env)
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 4000)
- `JWT_SECRET` - Secret key for JWT token signing (MUST change in production!)
- `NODE_ENV` - Environment mode (development/production)

### Client (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:4000)

## API Endpoints

### Public Endpoints
- `GET /api/questions` - List all questions
- `GET /api/questions/:id` - Get single question
- `GET /api/answers?questionId=...` - List answers (filter by questionId)
- `GET /api/users` - List all users
- `GET /api/courses` - List all courses
- `POST /api/login` - Login (returns JWT token)
- `POST /api/register` - Register new user (returns JWT token)

### Protected Endpoints (require JWT token)
- `POST /api/questions` - Create new question (supports file upload via multipart/form-data)
- `DELETE /api/questions/:id` - Delete question (author or admin only)
- `POST /api/answers` - Create new answer
- `PATCH /api/answers/:id` - Update answer (author or admin only)
- `DELETE /api/answers/:id` - Delete answer (author or admin only)

### Static Files
- `GET /uploads/:filename` - Access uploaded files

## Features
- **File Upload** - Attach files to questions
  - Multer-based file handling
  - Supports: JPG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP, RAR
  - Max file size: 10MB
  - Files stored in `server/uploads/` with unique names
  - Automatic file type validation
- **JWT Authentication** - Token-based auth with automatic token refresh
  - 7-day token expiration
  - Automatic logout on token expiry
  - Protected API endpoints
- **MongoDB database** with indexed collections for optimal performance
  - Unique indexes on username and email
  - Indexed queries on courseId, userId, questionId
  - Sorted indexes for chronological data
- **Bcrypt password hashing** for security
- **Server-side input validation and sanitization**
  - Email format validation
  - Username pattern validation (3-20 chars, alphanumeric + underscore)
  - Password strength requirements (min 6 chars)
  - Content length validation (questions, answers)
- **Authorization** - Role-based access control
  - Users can only edit/delete their own content
  - Admin role can modify any content
- **Environment-based configuration**
- **RESTful API** endpoints with comprehensive error handling
- **React + Vite** frontend with axios interceptors for token management
