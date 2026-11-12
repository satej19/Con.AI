# Docker Setup

## Quick Start

Run the entire application stack (frontend, backend, MongoDB) with a single command:

```bash
docker-compose up --build -d
```

This will:
- Build and start MongoDB (port 27017)
- Build and start the backend API (port 5000)
- Build and start the frontend (port 5174)

## Access the Application

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **MongoDB**: mongodb://localhost:27017

## Stopping the Services

```bash
docker-compose down
```

To also remove the MongoDB data volume:

```bash
docker-compose down -v
```

## Viewing Logs

View logs for all services:
```bash
docker-compose logs
```

View logs for a specific service:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

## Environment Variables

The application uses the `.env` file in the project root. Before running in production, update the following:

- `JWT_SECRET`: Change to a secure random string (minimum 32 characters)
- `ADMIN_EMAIL`: Set to your admin email address

## Architecture

The Docker setup consists of three services:

1. **MongoDB**: Uses the official mongo:7 image with persistent volume
2. **Backend**: Node.js 20 Alpine with TypeScript build
3. **Frontend**: Nginx Alpine serving the built React application

## Development

For development, you may prefer to run services individually:

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

This uses Vite's dev server with hot reload for faster development.
