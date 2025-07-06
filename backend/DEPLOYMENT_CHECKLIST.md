# 🚀 Hairvana Backend Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 12+ installed and running
- [ ] Environment variables configured
- [ ] Database connection tested

### 2. Code Quality
- [ ] All dependencies installed (`npm install`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Server syntax validated
- [ ] All routes properly configured
- [ ] Error handling implemented
- [ ] CORS configured for production

### 3. Database
- [ ] Database created
- [ ] Migrations run successfully (`npm run migrate`)
- [ ] Seed data loaded (optional) (`npm run seed`)
- [ ] Database connection tested
- [ ] Backup strategy in place

### 4. Security
- [ ] JWT secret changed from default
- [ ] Environment variables for sensitive data
- [ ] CORS origins configured for production
- [ ] Input validation implemented
- [ ] Rate limiting considered
- [ ] HTTPS configured (for production)

### 5. Monitoring & Logging
- [ ] Health check endpoint working (`/api/health`)
- [ ] Error logging configured
- [ ] Process monitoring setup (PM2 recommended)
- [ ] Database connection monitoring

## 🚀 Deployment Platforms

### Heroku
```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create app
heroku create your-app-name

# 4. Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set CORS_ORIGIN=https://your-frontend.com

# 6. Deploy
git push heroku main

# 7. Run migrations
heroku run npm run migrate
```

### Railway
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically
4. Run migrations: `railway run npm run migrate`

### DigitalOcean App Platform
1. Connect GitHub repository
2. Set environment variables
3. Configure build command: `npm install`
4. Configure run command: `npm start`
5. Deploy

### VPS/Server
```bash
# 1. Clone repository
git clone your-repo-url
cd backend

# 2. Install dependencies
npm install

# 3. Set environment variables
cp env.example .env
# Edit .env with production values

# 4. Run migrations
npm run migrate

# 5. Start with PM2
npm install -g pm2
pm2 start server.js --name hairvana-backend
pm2 save
pm2 startup
```

## 🔧 Environment Variables (Production)

```env
# Required
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-frontend-domain.com

# Optional
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-api-domain.com/api/health
```

### 2. API Endpoints
- [ ] Authentication endpoints working
- [ ] User management endpoints working
- [ ] Salon management endpoints working
- [ ] Appointment endpoints working
- [ ] Mobile API endpoints working

### 3. Database
- [ ] Database connection stable
- [ ] Queries performing well
- [ ] No connection leaks

### 4. Security
- [ ] HTTPS working
- [ ] CORS properly configured
- [ ] JWT authentication working
- [ ] Input validation working

## 📊 Monitoring Setup

### PM2 (Recommended for VPS)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name hairvana-backend

# Monitor
pm2 monit

# Logs
pm2 logs hairvana-backend

# Restart
pm2 restart hairvana-backend
```

### Health Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry)
- Set up database monitoring
- Configure log aggregation

## 🔄 Maintenance

### Regular Tasks
- [ ] Database backups
- [ ] Security updates
- [ ] Performance monitoring
- [ ] Log rotation
- [ ] SSL certificate renewal

### Updates
- [ ] Dependencies updates
- [ ] Node.js version updates
- [ ] Database migrations
- [ ] Code deployments

## 🆘 Troubleshooting

### Common Issues
1. **Port already in use**: Kill process or change port
2. **Database connection failed**: Check credentials and network
3. **CORS errors**: Verify CORS_ORIGIN setting
4. **JWT errors**: Check JWT_SECRET configuration
5. **Memory issues**: Monitor and optimize

### Logs
- Application logs: `pm2 logs` or `npm start`
- Database logs: Check PostgreSQL logs
- System logs: `journalctl` or `/var/log`

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify environment variables
3. Test database connection
4. Check network connectivity
5. Review security configurations

---

**✅ Your Hairvana backend is now ready for deployment!** 