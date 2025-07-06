const { sequelize } = require('../models');
const Subscription = require('../models/subscription')(sequelize, require('sequelize').DataTypes);

(async () => {
  try {
    const subs = await Subscription.findAll({ attributes: ['id', 'salon_id', 'plan_id'] });
    console.log('Subscription UUIDs:');
    subs.forEach(sub => {
      console.log(`id: ${sub.id}, salon_id: ${sub.salon_id}, plan_id: ${sub.plan_id}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error fetching subscriptions:', err);
    process.exit(1);
  }
})(); 