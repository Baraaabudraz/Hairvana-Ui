const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./lib/supabase');

// Import routes
const userRoutes = require('./routes/users');
const salonRoutes = require('./routes/salons');
const subscriptionRoutes = require('./routes/subscriptions');
const serviceRoutes = require('./routes/services');
const staffRoutes = require('./routes/staff');
const appointmentRoutes = require('./routes/appointments');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard');
const reportTemplatesRouter = require('./routes/reportTemplates');
const reportsRouter = require('./routes/reports');
const mobileAuthRoutes = require('./routes/Api/mobileAuth');
const mobileUserRoutes = require('./routes/Api/mobileUser');
const salonRoutesApi = require('./routes/Api/salon');
const hairstyleRoutes = require('./routes/Api/hairstyle');
const appointmentRoutesApi = require('./routes/Api/appointment');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add this before your routes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hairvana Backend API',
    version: require('./package.json').version,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      salons: '/api/salons',
      appointments: '/api/appointments',
      mobile: '/api/mobile'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/billing-histories', require('./routes/billingHistories'));
app.use('/api/report-templates', reportTemplatesRouter);
app.use('/api/reports', reportsRouter);

// Mobile API routes
app.use('/api/mobile/auth', mobileAuthRoutes);
app.use('/api/mobile/user', mobileUserRoutes);
app.use('/api/mobile/salons', salonRoutesApi);
app.use('/api/mobile/hairstyles', hairstyleRoutes);
app.use('/api/mobile', appointmentRoutesApi);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json({ 
      message: 'Validation Error',
      errors: err.errors 
    });
  }
  
  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      message: 'Database Validation Error',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
  
  // Handle other errors
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server and authenticate Sequelize
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = app;