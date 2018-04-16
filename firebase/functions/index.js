const functions = require('firebase-functions');
const shareAppVersion = require('./share-app-version');
const publishAppVersion = require('./publish-app-version');
const addAvailableFirebaseProject = require('./add-available-firebase-project');

exports.shareAppVersion = functions.https.onCall((data, context) => {
  const uid = context.auth.uid;
  const { orgId, projectId, appId, appVersion, destinationBranchName } = data;

  if ( !orgId || !projectId || !appId || !appVersion || !destinationBranchName ) {
    return Promise.reject(new functions.https.HttpsError('invalid-argument'));
  }

  return shareAppVersion(orgId, projectId, appId, appVersion, destinationBranchName, uid).then(project => ({
    success: true,
    project
  })).catch(err => {
    console.error("FAILURE", err, err.message, err.stack);
  });
});

exports.publishAppVersion = functions.https.onCall((data, context) => {
  try {
    return publishAppVersion(data.appVersion);
  } catch ( err ) {
    console.error('Failed!', err);
    return Promise.reject(new Error('oops'));
  }
});

exports.addAvailableFirebaseProject = functions.https.onCall((data, context) => {
  const { firebaseProjectId, firebaseBucket, firebaseDeploymentToken } = data;
  if ( !firebaseProjectId || !firebaseDeploymentToken ) {
    return Promise.reject(new functions.https.HttpsError('invalid-argument'));
  }

  return addAvailableFirebaseProject(firebaseProjectId, firebaseDeploymentToken);
});
