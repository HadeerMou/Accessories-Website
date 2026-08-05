# Accessories Web

An npm-workspace project with a Next.js storefront and a separate Express API.

## Structure

```text
frontend/   Next.js 16 storefront
backend/    Express 5 API and Prisma ORM
```

## Setup

```bash
npm install
```

Copy `backend/.env.example` to `backend/.env` and update `DATABASE_URL` for your PostgreSQL database. A local development template is already present and ignored by Git.

Generate Prisma Client and create the database migration:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init

```

# build images

docker compose build

# start services in background (build if needed)

docker compose up -d --build

# stop and remove containers

docker compose down

## Development

Run the frontend at `http://localhost:3000`:

```bash
npm run dev
```

Run the backend at `http://localhost:4000` in another terminal:

```bash
npm run dev:backend
```

The initial API endpoints are:

- `GET /api/health`
- `GET /api/products`

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

```admin seed

# Seed only admin account
npm run seed:admin --workspace backend
npm run seed:backend:admin

# Seed only categories and products
npm run seed:products --workspace backend
npm run seed:backend:products

```
