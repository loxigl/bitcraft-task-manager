# BitCraft Task Manager

A modern guild task management system built with Next.js, Node.js, Express, MongoDB, and Docker.

## Features

- 🔐 **Authentication System** - Email/password based user registration and login with JWT tokens
- 📋 **Task Management** - Create, assign, and track guild tasks with detailed progress tracking
- 👥 **User Profiles** - Character profiles with profession levels and statistics
- 🏗️ **Resource Tracking** - Track resource contributions and requirements for tasks
- 📱 **Responsive Design** - Modern UI that works on desktop and mobile devices
- 🐳 **Docker Support** - Easy deployment with Docker Compose for both development and production

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Make (optional, for convenience commands)

### Development Environment

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd bitcraft_task_manager
   ```

2. **Start development environment:**
   ```bash
   cd deployment
   make dev
   ```
   
   Or manually:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: mongodb://localhost:27017

### Production Environment

1. **Start production environment:**
   ```bash
   cd deployment
   make prod
   ```
   
   Or manually:
   ```bash
   docker-compose up --build -d
   ```

## Available Commands

The project includes a Makefile with convenient commands:

### Development
- `make dev` - Start development environment with hot reloading
- `make dev-detached` - Start development environment in background
- `make dev-logs` - Show development logs
- `make dev-stop` - Stop development environment
- `make dev-clean` - Clean development environment (removes volumes)

### Production
- `make prod` - Start production environment
- `make prod-detached` - Start production environment in background
- `make prod-logs` - Show production logs
- `make prod-stop` - Stop production environment
- `make prod-clean` - Clean production environment (removes volumes)

### General
- `make stop` - Stop all environments
- `make clean` - Clean all Docker resources
- `make build` - Build all images
- `make help` - Show all available commands

### Database
- `make seed-dev` - Seed development database with sample data
- `make seed-prod` - Seed production database with sample data

## Architecture

### Backend (Node.js/Express/MongoDB)
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API**: RESTful API with comprehensive validation using express-validator
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, and other security middleware

### Frontend (Next.js/React)
- **Framework**: Next.js 15 with TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React hooks and context
- **Authentication**: JWT token storage and management

### DevOps
- **Containerization**: Docker with multi-stage builds for production optimization
- **Proxy**: Nginx reverse proxy for routing
- **Development**: Hot reloading for both frontend and backend
- **Debugging**: Debug ports exposed for backend debugging

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://mongo:27017/bitcraft_dev
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/name/:name` - Get user by name
- `POST /api/users` - Create new user
- `PUT /api/users/:id/profile` - Update user profile

### Tasks
- `GET /api/tasks` - Get all tasks with pagination
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `POST /api/tasks/:id/claim` - Claim a task
- `PUT /api/tasks/:id/resources/:resourceName` - Update resource contribution
- `DELETE /api/tasks/:id` - Delete task

## Development

### Hot Reloading

Both frontend and backend support hot reloading in development mode:

- **Frontend**: Next.js dev server automatically reloads on file changes
- **Backend**: ts-node-dev automatically restarts the server on TypeScript file changes

### Debugging

Backend debugging is available on port 9229 in development mode. You can connect your IDE debugger to this port.

### File Structure

```
bitcraft_task_manager/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Custom middleware
│   │   └── types/          # TypeScript type definitions
│   ├── Dockerfile          # Production Docker image
│   └── Dockerfile.dev      # Development Docker image
├── frontend/               # Next.js frontend
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities and API client
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts
│   ├── Dockerfile          # Production Docker image
│   └── Dockerfile.dev      # Development Docker image
└── deployment/             # Docker Compose configurations
    ├── docker-compose.yml      # Production configuration
    ├── docker-compose.dev.yml  # Development configuration
    ├── nginx.conf              # Nginx configuration
    └── Makefile                # Convenience commands
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 80, 3000, 5000, and 27017 are available
2. **Permission errors**: On Linux, you might need to run Docker commands with `sudo`
3. **Database connection**: Ensure MongoDB container is running before backend

### Logs

View logs for specific services:
```bash
# Development
docker-compose -f docker-compose.dev.yml logs -f [service_name]

# Production
docker-compose logs -f [service_name]
```

### Reset Environment

To completely reset your environment:
```bash
make clean
```

This will stop all containers, remove volumes, and clean up Docker resources.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in development environment
5. Submit a pull request

## License

This project is licensed under the MIT License. 