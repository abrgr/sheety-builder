const functions = require('firebase-functions');
const shareAppVersion = require('./share-app-version');

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
