const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Get environment
const env = process.env.NODE_ENV || 'development';

// Load config
const config = require('../config/config.json')[env];

// Use environment variables if available, otherwise use config file
const dbConfig = {
  database: process.env.DB_NAME || config.database,
  username: process.env.DB_USER || config.username,
  password: process.env.DB_PASSWORD || config.password,
  host: process.env.DB_HOST || config.host,
  port: process.env.DB_PORT || config.port,
  dialect: process.env.DB_DIALECT || config.dialect,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: config.pool || {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = { sequelize };