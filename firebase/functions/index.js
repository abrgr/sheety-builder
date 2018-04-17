const functions = require('firebase-functions');
const shareAppVersion = require('./share-app-version');
const publishProjectApps = require('./publish-project-apps');
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
    console.error(
      "Failed to share app version [org: %s, project: %s, app: %s, appVersion: %s, destinationBranchName: %s]",
      orgId, projectId, appId, appVersion && appVersion.name, destinationBranchName, err, appVersion
    );

    throw err;
  });
});

exports.publishProjectApps = functions.https.onCall((data, context) => {
  const { orgId, projectId } = data;
  return publishProjectApps(orgId, projectId).catch(err => {
    console.error('Failed to publish project %s-%s', orgId, projectId, err);
    throw err;
  });
});

exports.addAvailableFirebaseProject = functions.https.onCall((data, context) => {
  const { firebaseProjectId, firebaseBucket, firebaseDeploymentToken } = data;
  if ( !firebaseProjectId || !firebaseDeploymentToken ) {
    return Promise.reject(new functions.https.HttpsError('invalid-argument'));
  }

  return addAvailableFirebaseProject(firebaseProjectId, firebaseDeploymentToken);
});
