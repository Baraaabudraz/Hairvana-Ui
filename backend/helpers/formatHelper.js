/**
 * Format address from individual components
 */
exports.formatAddress = ({ address, city, state, zipCode }) =>
  `${address}, ${city}, ${state} ${zipCode}`.replace(/\s+,/g, ',').trim();

/**
 * Format location from individual components
 */
exports.formatLocation = ({ city, state }) =>
  `${city}, ${state}`.replace(/\s+,/g, ',').trim();

/**
 * Extract city, state, and zipCode from a full address string
 * Expected format: "Street Address, City, State ZipCode"
 */
exports.parseAddress = (fullAddress) => {
  if (!fullAddress || typeof fullAddress !== 'string') {
    return { address: null, city: null, state: null, zipCode: null };
  }

  const parts = fullAddress.split(',').map(part => part.trim());
  
  if (parts.length < 3) {
    return { address: fullAddress, city: null, state: null, zipCode: null };
  }

  const address = parts[0];
  const city = parts[1];
  const stateZipPart = parts[2];
  
  // Extract state and zipCode from "State ZipCode" format
  const stateZipMatch = stateZipPart.match(/^(.+?)\s+(\d{5}(?:-\d{4})?)$/);
  
  if (stateZipMatch) {
    const state = stateZipMatch[1].trim();
    const zipCode = stateZipMatch[2].trim();
    return { address, city, state, zipCode };
  } else {
    return { address, city, state: stateZipPart, zipCode: null };
  }
};

/**
 * Extract city and state from a location string
 * Expected format: "City, State"
 */
exports.parseLocation = (location) => {
  if (!location || typeof location !== 'string') {
    return { city: null, state: null };
  }

  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    return { city: parts[0], state: parts[1] };
  } else if (parts.length === 1) {
    return { city: parts[0], state: null };
  }
  
  return { city: null, state: null };
}; 