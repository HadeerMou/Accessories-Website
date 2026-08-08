# Accessories Web

A headless e-commerce demo built as a monorepo with a Next.js storefront and an Express API backed by Prisma and PostgreSQL.

## Overview

- `frontend/` — Next.js 16 storefront with React 19 and internationalization support.
- `backend/` — Express 5 API using Prisma ORM and PostgreSQL.
- `docker-compose.yml` — optional local development environment with Postgres, backend, frontend, and Adminer.

## Features

- Storefront product listing and cart flow
- API routes for products, categories, orders, reviews, payments, and auth
- Prisma schema and migrations for PostgreSQL
- Local Docker development support

## Requirements

- Node.js 20+ / npm
- PostgreSQL
- Optional: Docker and Docker Compose for containerized development

## Getting Started

1. Install dependencies from the repository root:

```bash
npm install
```

2. Create `backend/.env` locally with your database connection and mail settings.

3. Generate Prisma client and apply database migrations:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

## Development

Start the frontend and backend in development mode from the repository root:

```bash
npm run dev
```

Alternatively, run each workspace separately:

```bash
npm run dev:frontend
npm run dev:backend
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Docker

Build and start the full stack with Docker Compose:

```bash
docker compose build
docker compose up -d --build
```

Stop and remove containers:

```bash
docker compose down
```

## Useful Scripts

- `npm run build` — Build all workspaces
- `npm run lint` — Run workspace linting
- `npm run typecheck` — Run TypeScript type checks
- `npm run prisma:generate` — Generate Prisma client for backend
- `npm run prisma:migrate` — Run Prisma migrations for backend
- `npm run prisma:studio` — Launch Prisma Studio
- `npm run seed:backend:admin` — Seed admin account
- `npm run seed:backend:products` — Seed demo categories and products

## API

The backend exposes REST-style API routes under `/api`. Example endpoints:

- `GET /api/health`
- `GET /api/products`

## Repository Layout

```text
frontend/   Next.js storefront
backend/    Express API, Prisma schema, migrations, and seed scripts
```

## Notes

- Keep sensitive values out of version control by updating `backend/.env` locally.
- This README is intended for public consumption and does not include private or local-only notes.
