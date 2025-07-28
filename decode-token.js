const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAxIiwiZW1haWwiOiJzdXBlcmFkbWluQGhhaXJ2YW5hLmNvbSIsImlhdCI6MTc1MzY5NDgwOCwiZXhwIjoxNzUzNzgxMjA4fQ.EBuQo4FsezVgGxF66qafT0yir-nKljX4ruk1GjQviPA';

try {
  const decoded = jwt.decode(token);
  console.log('Decoded token:', JSON.stringify(decoded, null, 2));
} catch (error) {
  console.error('Error decoding token:', error.message);
} 