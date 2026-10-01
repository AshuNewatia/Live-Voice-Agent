
FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile

COPY . .

WORKDIR /app/backend
CMD ["pnpm", "run", "start"]