FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@latest tsx

WORKDIR /app

# Copy dependency manifests
COPY backend/package.json ./

# Allow build scripts and install native LiveKit bindings
RUN pnpm config set ignore-scripts false
RUN pnpm install

# Copy application source code
COPY backend/ ./

CMD ["tsx", "src/main.ts"]