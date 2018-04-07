import { fromJS, Map } from 'immutable';
import firebase from '../firebase';
import { AppVersion } from '../models';

const db = firebase.firestore();
const storage = firebase.storage();

export default getUid => ({
  list(orgId, projectId, appId) {
    return getUid().then(uid => (
      db.doc(`orgs/${orgId}/projects/${projectId}/apps/${appId}/user-versions/${uid}`).get()
    )).then(doc => (
      doc.exists
        ? fromJS(doc.data()).map(v => new AppVersion(v))
        : new Map()
    ));
  },

  create(orgId, projectId, appId, versionName, description, baseVersion) {
    return getUid().then(uid => (
      db.runTransaction(txn => {
        const versionRef = db.doc(`orgs/${orgId}/projects/${projectId}/apps/${appId}/user-versions/${uid}`);
        return txn.get(versionRef).then(doc => {
          const existingVersions = doc.exists
                                 ? fromJS(doc.data()).map(v => new AppVersion(v))
                                 : new Map();
          const newVersions = existingVersions.set(
            versionName,
            new AppVersion({
              orgId,
              projectId,
              appId,
              name: versionName,
              description: description,
              base: baseVersion
            })
          );

          txn.set(
            versionRef,
            newVersions.toJS()
          );

          return newVersions;
        });
      })
    ));
  },

  getUserPresenterByHash(orgId, projectId, presenterHash) {
    return getPresenterByHash(getUid, true, `orgs/${orgId}/projects/${projectId}/user-assets/`, presenterHash);
  },

  getPublicPresenterByHash(orgId, projectId, presenterHash) {
    return getPresenterByHash(getUid, false, `orgs/${orgId}/projects/${projectId}/shared-assets/`, presenterHash);
  },

  getUserModelByHash(orgId, projectId, modelHash) {
    return getModelByHash(getUid, true, `orgs/${orgId}/projects/${projectId}/user-assets/`, modelHash);
  },

  getPublicModelByHash(orgId, projectId, modelHash) {
    return getModelByHash(getUid, false, `orgs/${orgId}/projects/${projectId}/shared-assets/`, modelHash);
  },
})

function getPresenterByHash(getUid, appendUid, pathPrefix, presenterHash) {
  return getAssetByHash(getUid, appendUid, 'presenter', pathPrefix, presenterHash);
}

function getModelByHash(getUid, appendUid, pathPrefix, modelHash) {
  return getAssetByHash(getUid, appendUid, 'model', pathPrefix, modelHash);
}

function getAssetByHash(getUid, appendUid, assetType, pathPrefix, assetHash) {
  return getUid().then(uid => (
    storage.ref()
           .child(`${pathPrefix}${appendUid ? '/' + uid : ''}/${assetType}-${assetHash}`)
           .getDownloadURL()
  )).then(fetch)
    .then(resp => {
      if ( !resp.ok ) {
        throw new Error('Could not find presenter');
      }

      return resp.json();
  }).then(fromJS);
}
