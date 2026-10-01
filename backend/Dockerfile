FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@latest

WORKDIR /app

# Copy only the package files that actually exist
COPY pnpm-lock.yaml package.json ./
COPY backend/package.json ./backend/

# Allow pnpm to build the LiveKit and esbuild binaries without approvals
RUN pnpm config set ignore-scripts false
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

WORKDIR /app/backend
CMD ["pnpm", "run", "start"]