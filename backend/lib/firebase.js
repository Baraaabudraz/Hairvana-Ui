const admin = require('firebase-admin');
const serviceAccount = require('../config/up-lancer-ac146cc55400.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin; 