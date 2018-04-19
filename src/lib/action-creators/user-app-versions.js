import {
  REQUESTED_LOAD_USER_APP_VERSIONS,
  RECEIVED_LOAD_USER_APP_VERSIONS,
  ERRORED_LOAD_USER_APP_VERSIONS,
  REQUESTED_PUBLISH,
  RECEIVED_PUBLISH,
  ERRORED_PUBLISH
} from '../actions';
import * as persistence from '../persistence';

export function loadUserAppVersions(orgId, projectId, appId) {
  return dispatch => {
    dispatch({
      type: REQUESTED_LOAD_USER_APP_VERSIONS
    });

    persistence.userAppVersions.list(orgId, projectId, appId).then(userAppVersions => {
      dispatch({
        type: RECEIVED_LOAD_USER_APP_VERSIONS,
        appId,
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

    return persistence.userAppVersions.create(orgId, projectId, appId, versionName, description, baseVersion).then(userAppVersions => {
      dispatch({
        type: RECEIVED_LOAD_USER_APP_VERSIONS,
        appId,
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

export function publish(orgId, projectId, appId, versionId) {
  return dispatch => {
    dispatch({
      type: REQUESTED_PUBLISH
    });

    return persistence.userAppVersions.publish(orgId, projectId, appId, versionId)
      .then(project => {
        dispatch({
          type: RECEIVED_PUBLISH,
          project,
          app: project.get('apps').find(app => app.get('id') === appId)
        });
      }).catch(err => {
        dispatch({
          type: ERRORED_PUBLISH,
          error: "Sorry, we couldn't publish the app"
        });
      });
  };
}
