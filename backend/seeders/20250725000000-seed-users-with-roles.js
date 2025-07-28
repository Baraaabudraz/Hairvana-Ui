"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // Get role IDs
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('super admin', 'admin', 'salon owner', 'customer')`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (roles.length === 0) {
      console.log('No roles found, skipping users seeding.');
      return;
    }
    
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));
    
    // Generate password hash
    const passwordHash = await bcrypt.hash("password123", 10);
    
    const usersToInsert = [
      // Super Admin
      {
        id: uuidv4(),
        name: "Super Admin",
        email: "superadmin@hairvana.com",
        phone: "+1234567890",
        password_hash: passwordHash,
        role_id: roleMap["super admin"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
      // Admin
      {
        id: uuidv4(),
        name: "Admin User",
        email: "admin@hairvana.com",
        phone: "+1234567891",
        password_hash: passwordHash,
        role_id: roleMap["admin"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
      // Salon Owners
      {
        id: uuidv4(),
        name: "Sarah Johnson",
        email: "sarah@beautysalon.com",
        phone: "+1234567892",
        password_hash: passwordHash,
        role_id: roleMap["salon owner"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Michael Chen",
        email: "michael@stylehub.com",
        phone: "+1234567893",
        password_hash: passwordHash,
        role_id: roleMap["salon owner"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Emma Rodriguez",
        email: "emma@glamourcuts.com",
        phone: "+1234567894",
        password_hash: passwordHash,
        role_id: roleMap["salon owner"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
      // Customers
      {
        id: uuidv4(),
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+1234567895",
        password_hash: passwordHash,
        role_id: roleMap["customer"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Lisa Davis",
        email: "lisa.davis@email.com",
        phone: "+1234567896",
        password_hash: passwordHash,
        role_id: roleMap["customer"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "David Wilson",
        email: "david.wilson@email.com",
        phone: "+1234567897",
        password_hash: passwordHash,
        role_id: roleMap["customer"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Maria Garcia",
        email: "maria.garcia@email.com",
        phone: "+1234567898",
        password_hash: passwordHash,
        role_id: roleMap["customer"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: "Robert Brown",
        email: "robert.brown@email.com",
        phone: "+1234567899",
        password_hash: passwordHash,
        role_id: roleMap["customer"],
        status: "active",
        join_date: now,
        created_at: now,
        updated_at: now,
      },
    ];

    // Check if users already exist
    const existingUsers = await queryInterface.sequelize.query(
      'SELECT email FROM users WHERE email IN (?)',
      { 
        type: Sequelize.QueryTypes.SELECT,
        replacements: [usersToInsert.map(u => u.email)]
      }
    ).catch(() => []);
    
    const existingEmails = existingUsers.map(u => u.email);
    const usersToInsertFiltered = usersToInsert.filter(user => !existingEmails.includes(user.email));

    if (usersToInsertFiltered.length > 0) {
      await queryInterface.bulkInsert("users", usersToInsertFiltered);
      console.log(`Seeded ${usersToInsertFiltered.length} users successfully.`);
      
      // Log user credentials for testing
      console.log('\n=== Test User Credentials ===');
      usersToInsertFiltered.forEach(user => {
        console.log(`${user.name} (${user.email}): password123`);
      });
      console.log('=============================\n');
    } else {
      console.log('All users already exist, skipping users seeding.');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      email: [
        "superadmin@hairvana.com",
        "admin@hairvana.com",
        "sarah@beautysalon.com",
        "michael@stylehub.com",
        "emma@glamourcuts.com",
        "john.smith@email.com",
        "lisa.davis@email.com",
        "david.wilson@email.com",
        "maria.garcia@email.com",
        "robert.brown@email.com",
      ],
    });
  },
}; 