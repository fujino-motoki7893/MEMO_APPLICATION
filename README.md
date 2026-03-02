# Memo Application

A simple memo editing tool with React frontend, Express backend, and PostgreSQL database.

## Local Development

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Docker

Start all services:

```bash
docker compose up --build
```

Access the app at http://localhost:8080

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + TypeScript + Prisma
- **Database**: PostgreSQL
