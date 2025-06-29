# Используем официальный Node.js образ
FROM node:18-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Устанавливаем pnpm
RUN npm install -g pnpm

# Этап зависимостей
FROM base AS deps
RUN pnpm install --frozen-lockfile

# Этап сборки
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Принимаем build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Устанавливаем переменные окружения для сборки
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Собираем приложение
RUN pnpm run build

# Этап выполнения
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем публичные файлы
COPY --from=builder /app/public ./public

# Копируем собранное приложение
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 