FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Configure pnpm to run build scripts without interactive approval
RUN pnpm config set ignore-scripts false
RUN pnpm install --frozen-lockfile

COPY . .

CMD ["pnpm", "run", "start"]