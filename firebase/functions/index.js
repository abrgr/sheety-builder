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
  const sharePresentersPromise = shareAsset(orgId, projectId, uid, 'presenter', appVersion.presenterHash);

  const projectRef = db.doc(`/orgs/${orgId}/projects/${projectId}`);
  const txnPromise = db.runTransaction(txn => {
    return txn.get(projectRef)
              .then(doc => {
                if ( !doc.exists ) {
                  throw new functions.https.HttpsError('not-found');
                }

                const project = doc.data();

                if ( !project.admins[uid] && !project.admins[uid] ) {
                  throw new functions.https.HttpsError('unauthenticated');
                }

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

                project.apps[idx].publishedVersions[destinationBranchName] = appVersion;

                txn.set(projectRef, project);

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
