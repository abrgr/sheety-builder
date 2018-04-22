const functions = require('firebase-functions');
const shareAppVersion = require('./share-app-version');
const publishProjectApp = require('./publish-project-app');
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

exports.publishProjectApp = functions.https.onCall((data, context) => {
  const uid = context.auth.uid;
  const { orgId, projectId, appId, versionId } = data;
  return publishProjectApp(uid, orgId, projectId, appId, versionId).then(project => {
    console.log('Published version %s for app %s in project %s-%s', versionId, appId, orgId, projectId);
    return {
      success: true,
      project
    };
  }).catch(err => {
    console.error('Failed to publish version %s for app %s in project %s-%s', versionId, appId, orgId, projectId, err);
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
