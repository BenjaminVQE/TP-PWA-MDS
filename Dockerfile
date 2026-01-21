FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS dev
WORKDIR /app
# Install Cypress system dependencies
RUN apk add --no-cache \
    xvfb \
    dbus-libs \
    mesa-gl \
    glib \
    nss \
    nspr \
    mesa-gbm \
    pango \
    cairo \
    alsa-lib \
    gtk+3.0 \
    chromium \
    freetype \
    ttf-freefont \
    harfbuzz

ENV CYPRESS_INSTALL_BINARY=0
# We don't install the binary during npm install to speed up build,
# but we might need it for running.
# Actually, for dev, let's allow binary install or force it.
# Ideally correct way is to just let npm install handle it, but dependencies are key.

COPY --from=deps /app/node_modules ./node_modules
# Force install cypress binary because strictly needed for running e2e
RUN npx cypress install

COPY . .
CMD ["npm", "run", "dev"]

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS prod
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
