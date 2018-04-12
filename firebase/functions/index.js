const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

exports.shareAppVersion = functions.https.onCall((data, context) => {
  const uid = context.auth.uid;
  const { orgId, projectId, appId, appVersion, destinationBranchName } = data;

  if ( !orgId || !projectId || !appId || !appVersion || !destinationBranchName ) {
    return Promise.reject(new functions.https.HttpsError('invalid-argument'));
  }

  return shareAppVersion(orgId, projectId, appId, appVersion, destinationBranchName, uid).then(() => ({
    success: true
  }));
});

function shareAppVersion(orgId, projectId, appId, appVersion, destinationBranchName, uid) {
  const shareModelsPromise = Promise.all(
    Object.keys(appVersion.modelHashesById).map(id => (
      shareAsset(orgId, projectId, uid, 'model', appVersion.modelHashesById[id])
    ))
  );
  const sharePresentersPromise = appVersion.presenterHash
                               ? shareAsset(orgId, projectId, uid, 'presenter', appVersion.presenterHash)
                               : Promise.resolve();

  const projectRef = db.doc(`/orgs/${orgId}/projects/${projectId}`);
  const userAppVersionRef = db.doc(`/orgs/${orgId}/projects/${projectId}/apps/${appId}/user-versions/${uid}`);
  const txnPromise = db.runTransaction(txn => {
    return Promise.all([
      txn.get(projectRef),
      txn.get(userAppVersionRef)
    ]).then(([projectDoc, userAppVersionDoc]) => {
      if ( !projectDoc.exists || !userAppVersionDoc.exists ) {
        throw new functions.https.HttpsError('not-found');
      }

      const project = projectDoc.data();
      const dbAppVersion = userAppVersionDoc.data();

      if ( !dbAppVersion[appVersion.name] ) {
        // the user must have already saved to their local branch before pushing
        throw new functions.https.HttpsError('not-found');
      }

      //
      // AUTHORIZE!
      //
      if ( !project.admins[uid] && !project.writers[uid] ) {
        throw new functions.https.HttpsError('unauthenticated');
      }

      // get current branch head (currentVersion)
      const idx = indexOf(project.apps, app => app.id === appId);
      if ( idx < 0 ) {
        throw new functions.https.HttpsError('not-found');
      }
      const currentVersion = project.apps[idx].publishedVersions[destinationBranchName];
      if ( currentVersion ) {
        // TODO: check that appVersion extends destinationBranchName
        const extendsCurrent = false;
        if ( !extendsCurrent ) {
          throw new functions.https.HttpsError('failed-precondition');
        }
      }

      // publish the version
      project.apps[idx].publishedVersions[destinationBranchName] = appVersion;
      txn.set(projectRef, project);

      // we delete the local branch after pushing to the remote
      delete dbAppVersion[appVersion.name];
      txn.set(userAppVersionRef, dbAppVersion);

      return null;
    });
  });

  return Promise.all([
    shareModelsPromise,
    sharePresentersPromise,
    txnPromise
  ]);
}

function indexOf(array, test) {
  const len = array.length;
  for ( let i = 0; i < len; ++i ) {
    if ( test(array[i]) ) {
      return i;
    }
  }

  return -1;
}

function shareAsset(orgId, projectId, uid, assetType, assetHash) {
  return new Promise((resolve, reject) => {
    const src = `orgs/${orgId}/projects/${projectId}/user-assets/${uid}/${assetType}-${assetHash}`;
    const file = bucket.file(src);
    const dest = `orgs/${orgId}/projects/${projectId}/shared-assets/${assetType}-${assetHash}`;
    file.copy(dest, err => {
      if ( err ) {
        console.error('Failed to copy asset %s to %s', src, dest, err);
        return reject(err);
      }

      return resolve(dest);
    })
  });
}
