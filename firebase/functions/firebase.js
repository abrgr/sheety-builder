const admin = require('firebase-admin');

admin.initializeApp();

module.exports = {
  db: admin.firestore(),
  storage: admin.storage(),
  bucket: admin.storage().bucket()
};
