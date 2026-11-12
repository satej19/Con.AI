# Docker Setup Guide

## Overview

This Docker setup runs the entire Material Management System with three services:
- **MongoDB** - Database (port 27017)
- **Backend** - Node.js/Express API (port 5000)
- **Frontend** - React application served by Nginx (port 5174)

## How Docker Volumes Work (The Logic)

### Why Data Persists

Docker containers are **ephemeral** - when you stop or remove a container, any data inside it is lost. However, **Docker volumes** solve this problem by:

1. **Storing data outside the container** - The volume exists on your host machine, not inside the container
2. **Mounting the volume into the container** - The container sees the volume as a directory (`/data/db`)
3. **Keeping data when containers are removed** - The volume survives container lifecycle

### The Volume Configuration

```yaml
volumes:
  - mongodb_data:/data/db
```

This means:
- `mongodb_data` - A named volume managed by Docker (stored in Docker's internal storage)
- `/data/db` - The directory inside the MongoDB container where data is written
- MongoDB writes to `/data/db` → Data actually stored in `mongodb_data` volume
- When container stops → Volume stays with all data

### What Happens with Different Commands

| Command | Containers | Volumes | Data |
|---------|-----------|---------|------|
| `docker-compose stop` | Stopped (kept) | Kept | ✅ Preserved |
| `docker-compose start` | Restarted | Kept | ✅ Preserved |
| `docker-compose down` | Removed | Kept | ✅ Preserved |
| `docker-compose up` | Created | Kept | ✅ Preserved |
| `docker-compose down -v` | Removed | **Removed** | ❌ Deleted |

## Quick Start

### 1. Start All Services

```bash
docker-compose up --build -d
```

This:
- Builds Docker images for backend and frontend
- Pulls MongoDB image
- Creates the `mongodb_data` volume (if it doesn't exist)
- Starts all three services in detached mode (background)

### 2. Check Status

```bash
docker-compose ps
```

You should see all three services with "Up" status.

### 3. View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f backend
```

### 4. Stop Services

```bash
# Stop but keep containers and data
docker-compose stop

# Remove containers but keep data
docker-compose down

# Remove containers AND data (fresh start)
docker-compose down -v
```

## Access Points

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **MongoDB**: mongodb://localhost:27017

## Docker Architecture

### Backend (Node.js + Express)

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

**Logic:**
- **Stage 1 (builder)**: Installs all dependencies, builds TypeScript to JavaScript
- **Stage 2 (production)**: Only installs production dependencies, copies built code
- **Result**: Smaller final image without dev dependencies

### Frontend (React + Nginx)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY src ./src
COPY index.html ./
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5174
```

**Logic:**
- **Stage 1 (builder)**: Builds React app with Vite
- **Stage 2 (nginx)**: Uses lightweight Nginx to serve static files
- **Nginx config**: Proxies `/api` requests to backend, serves React app for everything else

### MongoDB

```yaml
mongodb:
  image: mongo:7
  volumes:
    - mongodb_data:/data/db
```

**Logic:**
- Uses official MongoDB image
- Data persisted in named volume
- No build needed - pulls pre-built image

## Networking

All services communicate via a Docker bridge network:

```yaml
networks:
  material-mgmt-network:
    driver: bridge
```

**Service-to-service communication:**
- Backend connects to MongoDB via: `mongodb://mongodb:27017/material_mgmt`
- Frontend connects to Backend via Nginx proxy: `/api` → `http://backend:5000`
- External access via exposed ports on localhost

## Environment Variables

The `.env` file provides configuration:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://mongodb:27017/material_mgmt
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_change_this_in_production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:5174,http://127.0.0.1:5174
ADMIN_EMAIL=admin@example.com
```

**Important:** Change `JWT_SECRET` in production!

## Troubleshooting

### Containers won't start

```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down
docker-compose up --build -d
```

### Port already in use

If ports 5000, 5174, or 27017 are already in use:

```bash
# Find what's using the port
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Mac/Linux

# Or change ports in docker-compose.yml
ports:
  - "5001:5000"  # Use 5001 instead of 5000
```

### Database connection errors

```bash
# Check MongoDB is running
docker-compose logs mongodb

# Restart services
docker-compose restart backend
```

### Want to reset everything

```bash
# Complete fresh start
docker-compose down -v
docker-compose up --build -d
```

### View volume data

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect material-management_mongodb_data
```

## Development vs Production

### Development (without Docker)

For faster development with hot reload:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production (with Docker)

For deployment or testing the full stack:

```bash
docker-compose up --build -d
```

## File Structure

```
material-management/
├── docker-compose.yml       # Orchestrates all services
├── .env                     # Environment variables
├── backend/
│   ├── Dockerfile          # Backend build config
│   └── .dockerignore       # Files to exclude from build
├── frontend/
│   ├── Dockerfile          # Frontend build config
│   ├── nginx.conf          # Nginx configuration
│   └── .dockerignore       # Files to exclude from build
└── docker.setup.md         # This file
```

## Best Practices

1. **Never commit `.env`** - It contains secrets
2. **Use named volumes** - For persistent data (like we do with MongoDB)
3. **Multi-stage builds** - Reduce image size (backend/frontend use this)
4. **Alpine images** - Smaller, more secure (we use node:20-alpine, nginx:alpine)
5. **Restart policies** - `restart: unless-stopped` keeps services running

## Summary

- **Data persists** because of Docker volumes
- **One command** starts everything: `docker-compose up --build -d`
- **Three services**: MongoDB, Backend, Frontend
- **Clean stop**: `docker-compose down` (keeps data)
- **Fresh start**: `docker-compose down -v` (deletes data)
