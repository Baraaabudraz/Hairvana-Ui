exports.formatAddress = ({ address, city, state, zipCode }) =>
  `${address}, ${city}, ${state} ${zipCode}`.replace(/\s+,/g, ',').trim();

exports.formatLocation = ({ city, state }) =>
  `${city}, ${state}`.replace(/\s+,/g, ',').trim(); 