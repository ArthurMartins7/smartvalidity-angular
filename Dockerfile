# syntax=docker/dockerfile:1.6

#############################
# 1. BUILD STAGE            #
#############################
FROM node:20-alpine AS builder

# Install dependencies needed for some Node native builds
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source code and build for production
COPY . .
RUN npm run build -- --configuration=production

#############################
# 2. RUNTIME STAGE          #
#############################
FROM nginx:1.25-alpine AS runner

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from previous stage
COPY --from=builder /app/dist/smartvalidity-angular/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
