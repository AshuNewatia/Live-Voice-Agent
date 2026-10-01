FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@latest tsx

WORKDIR /app/backend

# Copy backend manifests
COPY backend/package.json backend/pnpm-lock.yaml* ./

# Allow native build scripts and install backend dependencies
RUN pnpm config set ignore-scripts false
RUN pnpm install

# Copy backend source code
COPY backend/ ./

CMD ["pnpm", "run", "start"]