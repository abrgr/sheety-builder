import { fromJS, Map } from 'immutable';
import firebase from '../firebase';
import { AppVersion } from '../models';

const db = firebase.firestore();

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
  }
})
