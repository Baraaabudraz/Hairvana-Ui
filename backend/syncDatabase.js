'use strict';

const { sequelize } = require('./models');

/**
 * Sync all models with the database
 * This will drop all existing tables and recreate them
 * WARNING: This will delete all data in the database
 */
async function syncDatabase() {
  try {
    console.log('🔄 Starting database sync...');
    
    // Force sync all models (drops and recreates all tables)
    await sequelize.sync({ force: true });
    
    console.log('✅ Database sync completed successfully!');
    console.log('📊 All tables have been dropped and recreated.');
    console.log('⚠️  WARNING: All existing data has been deleted.');
    
    // Close the database connection
    await sequelize.close();
    console.log('🔌 Database connection closed.');
    
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

// Run the sync if this file is executed directly
if (require.main === module) {
  syncDatabase();
}

module.exports = syncDatabase; 