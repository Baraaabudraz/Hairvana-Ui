// Test script to check user IDs and security settings
const { SecuritySettings, User } = require('./models');

async function testUserIds() {
  try {
    console.log('🔍 Testing User IDs and Security Settings...\n');
    
    // Get all users
    console.log('1. All Users in Database:');
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      limit: 10
    });
    
    users.forEach((user, index) => {
      console.log(`   User ${index + 1}:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log('');
    });
    
    // Get all security settings
    console.log('2. All Security Settings in Database:');
    const securitySettings = await SecuritySettings.findAll();
    
    securitySettings.forEach((setting, index) => {
      console.log(`   Security Setting ${index + 1}:`);
      console.log(`   - User ID: ${setting.user_id}`);
      console.log(`   - Two Factor: ${setting.two_factor_enabled}`);
      console.log(`   - Password Expiry: ${setting.password_expiry_days}`);
      console.log(`   - Max Login Attempts: ${setting.login_attempts}`);
      console.log(`   - Lockout Duration: ${setting.session_timeout}`);
      console.log(`   - SSL Enabled: ${setting.ssl_enabled}`);
      console.log(`   - Audit Logging: ${setting.audit_logging}`);
      console.log(`   - Updated: ${setting.updated_at}`);
      console.log('');
    });
    
    // Check if there are any admin users
    console.log('3. Admin Users:');
    const adminUsers = await User.findAll({
      where: {
        role: ['admin', 'super admin']
      },
      attributes: ['id', 'name', 'email', 'role']
    });
    
    adminUsers.forEach((user, index) => {
      console.log(`   Admin ${index + 1}:`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

testUserIds();
