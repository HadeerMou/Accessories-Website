FROM node:22-alpine

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY backend backend
RUN npm run prisma:generate --workspace backend && npm run build --workspace backend

EXPOSE 4000

CMD ["sh", "-c", "npm exec --workspace backend -- prisma migrate deploy && npm run start --workspace backend"]
