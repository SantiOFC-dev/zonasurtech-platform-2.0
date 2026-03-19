FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/mcp-zonasur/package.json ./apps/mcp-zonasur/package.json
RUN pnpm install --filter @zs/mcp-zonasur... --frozen-lockfile

FROM deps AS build
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/mcp-zonasur ./apps/mcp-zonasur
RUN pnpm --filter @zs/mcp-zonasur build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/mcp-zonasur/dist ./apps/mcp-zonasur/dist
COPY --from=build /app/apps/mcp-zonasur/package.json ./apps/mcp-zonasur/package.json
USER app
EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://localhost:3005/health || exit 1
CMD ["node", "apps/mcp-zonasur/dist/server.js"]
