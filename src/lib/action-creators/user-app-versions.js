import { fromJS, Map } from 'immutable';
import { AppVersion } from '../models';
import ensureAuthenticated from '../ensure-authenticated';
import firebase from '../firebase';
import {
  REQUESTED_LOAD_USER_APP_VERSIONS,
  RECEIVED_LOAD_USER_APP_VERSIONS,
  ERRORED_LOAD_USER_APP_VERSIONS
} from '../actions';

const db = firebase.firestore();

export function loadUserAppVersions(orgId, projectId, appId) {
  return dispatch => {
    dispatch({
      type: REQUESTED_LOAD_USER_APP_VERSIONS
    });

    ensureAuthenticated(false).then(uid => (
      db.doc(`orgs/${orgId}/projects/${projectId}/apps/${appId}/user-versions/${uid}`)
        .get()
        .then(doc => (
          doc.exists
            ? fromJS(doc.data()).map(v => new AppVersion(v))
            : new Map()
        ))
    )).then(userAppVersions => {
      dispatch({
        type: RECEIVED_LOAD_USER_APP_VERSIONS,
        userAppVersions
      });
    }).catch(err => {
      dispatch({
        type: ERRORED_LOAD_USER_APP_VERSIONS,
        err: "Sorry, we couldn't load your versions"
      });
    });
  };
}

export function create(orgId, projectId, appId, versionName, description, baseVersion) {
  return dispatch => {
    dispatch({
      type: REQUESTED_LOAD_USER_APP_VERSIONS
    });

    ensureAuthenticated(false).then(uid => (
      db.runTransaction(txn => {
        const versionRef = db.doc(`orgs/${orgId}/projects/${projectId}/apps/${appId}/user-versions/${uid}`);
        return txn.get(versionRef)
           .then(doc => {
             const existingVersions = doc.exists
                                    ? fromJS(doc.data()).map(v => new AppVersion(v))
                                    : new Map();
             const newVersions = existingVersions.set(
               versionName,
               new AppVersion({
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
    )).then(userAppVersions => {
      dispatch({
        type: RECEIVED_LOAD_USER_APP_VERSIONS,
        userAppVersions
      });
    }).catch(err => {
      dispatch({
        type: ERRORED_LOAD_USER_APP_VERSIONS,
        err: "Sorry, we couldn't load your versions"
      });
    });
  };
}
