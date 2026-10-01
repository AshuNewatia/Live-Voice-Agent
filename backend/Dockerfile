FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Replace corepack with a direct npm installation
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy root workspace files and backend package.json first
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc* ./
COPY backend/package.json ./backend/

# Install dependencies (this will read the approvals from the workspace file)
RUN pnpm install --frozen-lockfile

# Copy the rest of the project source
COPY . .

# Move into backend and run the worker
WORKDIR /app/backend
CMD ["pnpm", "run", "start"]