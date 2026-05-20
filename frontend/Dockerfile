# Local-only Dockerfile for docker-compose parity. In production the frontend is
# deployed to Vercel, which builds Next.js directly (no Dockerfile needed).
# Build context is ./frontend (see docker-compose.yml).

FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
# NEXT_PUBLIC_* is inlined at build time, so the API URL must be a build arg.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
