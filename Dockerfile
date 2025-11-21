# Multi-stage Dockerfile to run Jest tests in a container
FROM node:20-bullseye AS base

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the source (frontend + backend)
COPY . .

# Ensure non-interactive / CI mode
ENV CI=true

# Default command runs the test suite
CMD ["npm", "test", "--", "--runInBand"]
