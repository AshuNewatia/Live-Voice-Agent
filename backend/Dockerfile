FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@latest tsx

WORKDIR /app

# Copy package manifest
COPY backend/package.json ./

# Permit native builds and install dependencies
RUN pnpm config set dangerously-allow-all-builds true
RUN pnpm config set strict-dep-builds false
RUN pnpm install

# Copy backend source
COPY backend/ ./

CMD ["tsx", "src/main.ts", "start"]