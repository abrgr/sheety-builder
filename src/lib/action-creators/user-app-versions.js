import {
  REQUESTED_LOAD_USER_APP_VERSIONS,
  RECEIVED_LOAD_USER_APP_VERSIONS,
  ERRORED_LOAD_USER_APP_VERSIONS
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
