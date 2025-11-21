# Build a production image for the Next.js app
FROM node:20-bullseye AS deps
WORKDIR /app

# Install deps (use clean, reproducible install)
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-bullseye AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only the runtime artifacts
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/next.config.mjs ./frontend/next.config.mjs
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Next.js default port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]
