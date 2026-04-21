# ──────────────────────────────────────────────
# Stage 1: Build the React app
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for dependency caching
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source code
COPY . .

# Build the app. VITE_API_BASE_URL=/api means all API calls go
# through the Nginx proxy (which forwards them to the backend container)
RUN VITE_API_BASE_URL=/api npm run build

# ──────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ──────────────────────────────────────────────
FROM nginx:alpine

# Copy the built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
