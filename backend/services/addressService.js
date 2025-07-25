const addressRepository = require('../repositories/addressRepository');

/**
 * Create a new address
 * @param {Object} addressData - Address data
 * @returns {Promise<Object>} Created address
 */
exports.createAddress = async (addressData) => {
  try {
    // Clean and validate address data
    const cleanedData = {
      street_address: addressData.street_address?.trim(),
      city: addressData.city?.trim(),
      state: addressData.state?.trim(),
      zip_code: addressData.zip_code?.trim(),
      country: addressData.country?.trim() || 'US'
    };

    return await addressRepository.create(cleanedData);
  } catch (error) {
    throw new Error(`Failed to create address: ${error.message}`);
  }
};

/**
 * Get address by ID
 * @param {string} id - Address ID
 * @returns {Promise<Object|null>} Address or null
 */
exports.getAddressById = async (id) => {
  try {
    return await addressRepository.findById(id);
  } catch (error) {
    throw new Error(`Failed to get address: ${error.message}`);
  }
};

/**
 * Update address
 * @param {string} id - Address ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated address or null
 */
exports.updateAddress = async (id, updateData) => {
  try {
    const existingAddress = await addressRepository.findById(id);
    if (!existingAddress) {
      return null;
    }

    // Clean update data
    const cleanedData = {};
    if (updateData.street_address) cleanedData.street_address = updateData.street_address.trim();
    if (updateData.city) cleanedData.city = updateData.city.trim();
    if (updateData.state) cleanedData.state = updateData.state.trim();
    if (updateData.zip_code) cleanedData.zip_code = updateData.zip_code.trim();
    if (updateData.country) cleanedData.country = updateData.country.trim();

    return await addressRepository.update(id, cleanedData);
  } catch (error) {
    throw new Error(`Failed to update address: ${error.message}`);
  }
};

/**
 * Delete address
 * @param {string} id - Address ID
 * @returns {Promise<boolean>} True if deleted
 */
exports.deleteAddress = async (id) => {
  try {
    const existingAddress = await addressRepository.findById(id);
    if (!existingAddress) {
      return false;
    }

    return await addressRepository.delete(id);
  } catch (error) {
    throw new Error(`Failed to delete address: ${error.message}`);
  }
};

/**
 * Search addresses by city and state
 * @param {string} city - City name
 * @param {string} state - State name
 * @returns {Promise<Array>} Array of addresses
 */
exports.searchByCityAndState = async (city, state) => {
  try {
    return await addressRepository.findByCityAndState(city, state);
  } catch (error) {
    throw new Error(`Failed to search addresses: ${error.message}`);
  }
};

/**
 * Create address from parsed data (for salon creation)
 * @param {Object} parsedData - Parsed address data from helpers
 * @returns {Promise<Object>} Created address
 */
exports.createAddressFromParsedData = async (parsedData) => {
  try {
    const addressData = {
      street_address: parsedData.street || parsedData.address || '',
      city: parsedData.city || '',
      state: parsedData.state || '',
      zip_code: parsedData.zipCode || '',
      country: 'US'
    };

    // Validate minimum required fields
    if (!addressData.street_address || !addressData.city || !addressData.state) {
      throw new Error('Missing required address fields: street_address, city, or state');
    }

    return await addressRepository.create(addressData);
  } catch (error) {
    throw new Error(`Failed to create address from parsed data: ${error.message}`);
  }
}; 