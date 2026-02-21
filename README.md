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
