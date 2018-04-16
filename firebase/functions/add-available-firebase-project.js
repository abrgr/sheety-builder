const functions = require('firebase-functions');
const { db, bucket } = require('./firebase');

module.exports = function addAvailableFirebaseProject(firebaseProjectId, firebaseDeploymentToken) {
  const ref = db.doc(`admin/available-firestore-projects/projects/${firebaseProjectId}`);
  return ref.create({
    firebaseProjectId,
    firebaseDeploymentToken
  });
}
