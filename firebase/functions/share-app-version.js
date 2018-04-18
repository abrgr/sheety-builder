const functions = require('firebase-functions');
const { db, bucket } = require('./firebase');

module.exports = function shareAppVersion(orgId, projectId, appId, appVersion, destinationBranchName, uid) {
  const shareModelsPromise = Promise.all(
    Object.keys(appVersion.modelInfoById).map(id => (
      shareAsset(orgId, projectId, uid, 'model', appVersion.modelInfoById[id].contentHash)
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
      const currentVersion = project.apps[idx].sharedVersions[destinationBranchName];
      if ( currentVersion ) {
        // TODO: check that appVersion extends destinationBranchName
        const extendsCurrent = false;
        if ( !extendsCurrent ) {
          throw new functions.https.HttpsError('failed-precondition');
        }
      }

      // share the version
      project.apps[idx].sharedVersions[destinationBranchName] = appVersion;
      txn.set(projectRef, project);

      // we delete the local branch after pushing to the remote
      delete dbAppVersion[appVersion.name];
      txn.set(userAppVersionRef, dbAppVersion);

      return project;
    });
  });

  return Promise.all([
    shareModelsPromise,
    sharePresentersPromise,
    txnPromise
  ]).then(([_1, _2, project]) => project);
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
    const srcFile = bucket.file(src);
    const dest = `orgs/${orgId}/projects/${projectId}/shared-assets/${assetType}-${assetHash}`;
    const destFile = bucket.file(dest);

    destFile.exists((err, exists) => {
      if ( err ) {
        console.error('Failed to check existence of asset %s', dest, err);
        return reject(err);
      }

      if ( exists ) {
        // if the destination exists, no need to try to re-copy
        return resolve(dest);
      }

      return srcFile.copy(dest, err => {
        if ( err ) {
          console.error('Failed to copy asset %s to %s', src, dest, err);
          return reject(err);
        }

        return resolve(dest);
      });
    });
  });
}
