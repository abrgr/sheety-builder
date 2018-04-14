import { fromJS, Map } from 'immutable';
import firebase from '../firebase';
import { AppVersion } from '../models';

const db = firebase.firestore();
const storage = firebase.storage();
const functions = firebase.functions();

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
    return getUid().then(uid => {
      const appVersion = new AppVersion({
        author: uid,
        createdAt: new Date(),
        orgId,
        projectId,
        appId,
        name: versionName,
        description: description,
        base: baseVersion
      });

      return saveAppVersionToFirebase(
        getUid,
        orgId,
        projectId,
        appId,
        appVersion,
        uid
      );
    });
  },

  getPresenter(orgId, projectId, author, presenterHash) {
    return getUid().then(uid => (
      uid === author
        ? getUserPresenterByHash(orgId, projectId, presenterHash, uid)
        : getPublicPresenterByHash(orgId, projectId, presenterHash)
    ));
  },

  getModel(orgId, projectId, author, modelHash) {
    return getUid().then(uid => (
      uid === author
        ? getUserModelByHash(orgId, projectId, modelHash, uid)
        : getPublicModelByHash(orgId, projectId, modelHash)
    ));
  },

  saveAppVersion(appVersion, model, presenter) {
    const orgId = appVersion.get('orgId');
    const projectId = appVersion.get('projectId');
    const appId = appVersion.get('appId');
    const modelJSON = model ? JSON.stringify(model.toJS()) : null;
    const presenterJSON = presenter ? JSON.stringify(presenter.toJS()) : null;
    const modelId = model ? model.get('providerId') : null;

    return getUid().then(uid => {
      let updatedAppVersion = appVersion.set('base', appVersion)
                                          .set('author', uid)
                                          .set('createdAt', new Date());
      updatedAppVersion = modelJSON
                        ? updatedAppVersion.setModelJSON(modelId, modelJSON, model)
                        :  updatedAppVersion;
      updatedAppVersion = presenterJSON
                        ? updatedAppVersion.setPresenterJSON(presenterJSON)
                        : updatedAppVersion;
      if ( appVersion.delete('base').delete('createdAt')
                     .equals(updatedAppVersion.delete('base').delete('createdAt')) ) {
        // no need to update anything
        return this.list(orgId, projectId, appId); // TODO: shouldn't need another read here
      }

      const userAssetPrefix = getUserAssetPathPrefix(orgId, projectId, uid);
      const modelPath = getModelPath(userAssetPrefix, updatedAppVersion.getIn(['modelInfoById', modelId, 'contentHash']));
      const presenterPath = getPresenterPath(userAssetPrefix, updatedAppVersion.get('presenterHash'));

      return Promise.all([
        putAsset(modelPath, modelJSON),
        putAsset(presenterPath, presenterJSON)
      ]).then(() => (
        saveAppVersionToFirebase(getUid, orgId, projectId, appId, updatedAppVersion, uid)
      ));
    });
  },

  shareAppVersion(appVersion, destinationBranchName) {
    const orgId = appVersion.get('orgId');
    const projectId = appVersion.get('projectId');
    const appId = appVersion.get('appId');

    const remotePromoteAppVersion = functions.httpsCallable('shareAppVersion');
    return remotePromoteAppVersion({
      orgId,
      projectId,
      appId,
      appVersion: appVersion.toNetworkRepresentation(),
      destinationBranchName
    }).then(() => {

    }).catch(err => {

    });
  }
})

function getProjectPathPrefix(orgId, projectId) {
  return `orgs/${orgId}/projects/${projectId}`;
}

function getUserAssetPathPrefix(orgId, projectId, uid) {
  return `${getProjectPathPrefix(orgId, projectId)}/user-assets/${uid}`;
}

function getSharedAssetPathPrefix(orgId, projectId) {
  return `${getProjectPathPrefix(orgId, projectId)}/shared-assets`;
}

function getModelPath(pathPrefix, modelHash) {
  return `${pathPrefix}/model-${modelHash}`;
}

function getPresenterPath(pathPrefix, presenterHash) {
  return `${pathPrefix}/presenter-${presenterHash}`;
}

function getPresenterByHash(pathPrefix, presenterHash) {
  return getAsset(getPresenterPath(pathPrefix, presenterHash));
}

function getModelByHash(pathPrefix, modelHash) {
  return getAsset(getModelPath(pathPrefix, modelHash));
}

function getAsset(path) {
  return storage.ref()
         .child(path)
         .getDownloadURL()
         .then(fetch)
         .then(resp => {
           if ( !resp.ok ) {
             throw new Error('Could not find presenter');
           }

           return resp.json();
         }).then(fromJS);
}

function putAsset(path, json) {
  if ( !json ) {
    return Promise.resolve(null);
  }

  return storage.ref()
         .child(path)
         .putString(json, 'raw', { contentType: 'application/json' });
}

function saveAppVersionToFirebase(getUid, orgId, projectId, appId, appVersion, uid) {
  return getUid(uid).then(uid => (
    db.runTransaction(txn => {
      const versionRef = db.doc(`orgs/${orgId}/projects/${projectId}/apps/${appId}/user-versions/${uid}`);
      return txn.get(versionRef).then(doc => {
        const existingVersions = doc.exists
                               ? fromJS(doc.data()).map(v => new AppVersion(v))
                               : new Map();
        const versionName = appVersion.get('name');

        if ( !appVersion.isLegitimateChildOf(existingVersions.get(versionName)) ) {
          return Promise.reject(new Error('Inconsistent'));
        }

        const newVersions = existingVersions.set(
          versionName,
          appVersion
        );

        txn.set(
          versionRef,
          newVersions.map(v => v.toNetworkRepresentation()).toJS()
        );

        return newVersions;
      });
    })
  ));
}

function getUserPresenterByHash(orgId, projectId, presenterHash, uid) {
  return getPresenterByHash(getUserAssetPathPrefix(orgId, projectId, uid), presenterHash);
}

function getPublicPresenterByHash(orgId, projectId, presenterHash) {
  return getPresenterByHash(getSharedAssetPathPrefix(orgId, projectId), presenterHash);
}

function getUserModelByHash(orgId, projectId, modelHash, uid) {
  return getModelByHash(getUserAssetPathPrefix(orgId, projectId, uid), modelHash);
}

function getPublicModelByHash(orgId, projectId, modelHash) {
  return getModelByHash(getSharedAssetPathPrefix(orgId, projectId), modelHash);
}
