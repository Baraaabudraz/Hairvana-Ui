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

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add this before your routes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json({ errors: err.errors });
  }
  
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server and authenticate Sequelize
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = app;