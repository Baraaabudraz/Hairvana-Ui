# Hairvana Backend Deployment Guide

## Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Supabase Configuration (if using Supabase)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
- Copy `env.example` to `.env`
- Update the values according to your production environment

### 3. Database Setup
```bash
# Run migrations
npm run migrate

# Seed the database (optional)
npm run seed
```

### 4. Start the Server
```bash
# Production
npm start

# Development
npm run dev
```

## Platform-Specific Deployment

### Heroku
1. Create a new Heroku app
2. Add PostgreSQL addon
3. Set environment variables in Heroku dashboard
4. Deploy using Git:
```bash
git push heroku main
```

### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables
3. Configure build command: `npm install`
4. Configure run command: `npm start`

### VPS/Server
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run migrations: `npm run migrate`
5. Start with PM2: `pm2 start server.js`

## Health Check Endpoint
The server includes a health check endpoint:
```
GET /api/health
```

## Security Considerations
- Change default JWT secret
- Use HTTPS in production
- Set up proper CORS origins
- Use environment variables for sensitive data
- Enable database SSL connections
- Set up proper logging and monitoring

## Monitoring
- Use PM2 for process management
- Set up logging with Winston or similar
- Monitor database connections
- Set up error tracking (Sentry, etc.)

## Backup Strategy
- Regular database backups
- Environment variable backups
- Code repository backups 