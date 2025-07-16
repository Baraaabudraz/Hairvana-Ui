const admin = require('firebase-admin');
const serviceAccount = require('../config/up-lancer-fbcd320b3801.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin; 