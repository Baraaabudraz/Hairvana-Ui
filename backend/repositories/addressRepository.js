const { Address } = require('../models');

/**
 * Create a new address
 * @param {Object} addressData - Address data to create
 * @returns {Promise<Object>} Created address
 */
exports.create = async (addressData) => {
  return await Address.create(addressData);
};

/**
 * Find address by ID
 * @param {string} id - Address ID
 * @returns {Promise<Object|null>} Address or null
 */
exports.findById = async (id) => {
  return await Address.findByPk(id);
};

/**
 * Update address by ID
 * @param {string} id - Address ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated address or null
 */
exports.update = async (id, updateData) => {
  const [updatedRowsCount] = await Address.update(updateData, {
    where: { id },
    returning: true
  });

  if (updatedRowsCount === 0) {
    return null;
  }

  return await Address.findByPk(id);
};

/**
 * Delete address by ID
 * @param {string} id - Address ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
exports.delete = async (id) => {
  const deletedRowsCount = await Address.destroy({
    where: { id }
  });

  return deletedRowsCount > 0;
};

/**
 * Find addresses by city and state
 * @param {string} city - City name
 * @param {string} state - State name
 * @returns {Promise<Array>} Array of addresses
 */
exports.findByCityAndState = async (city, state) => {
  return await Address.findAll({
    where: {
      city,
      state
    }
  });
};

/**
 * Find addresses by zip code
 * @param {string} zipCode - ZIP code
 * @returns {Promise<Array>} Array of addresses
 */
exports.findByZipCode = async (zipCode) => {
  return await Address.findAll({
    where: {
      zip_code: zipCode
    }
  });
}; 