const { Sequelize } = require('sequelize');
const config = require('./backend/config/config.json');

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false
});

async function checkPermissions() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Check roles
    const roles = await sequelize.query('SELECT * FROM roles', { type: Sequelize.QueryTypes.SELECT });
    console.log('\nRoles:', roles);

    // Check permissions for super_admin
    const superAdminRole = roles.find(r => r.name === 'super_admin');
    if (superAdminRole) {
      const permissions = await sequelize.query(
        'SELECT * FROM permissions WHERE role_id = ? AND resource = ? AND action = ?',
        {
          replacements: [superAdminRole.id, 'analytics', 'view'],
          type: Sequelize.QueryTypes.SELECT
        }
      );
      console.log('\nAnalytics view permissions for super_admin:', permissions);

      // Check all permissions for super_admin
      const allPermissions = await sequelize.query(
        'SELECT * FROM permissions WHERE role_id = ?',
        {
          replacements: [superAdminRole.id],
          type: Sequelize.QueryTypes.SELECT
        }
      );
      console.log('\nAll permissions for super_admin:', allPermissions.length);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkPermissions(); 