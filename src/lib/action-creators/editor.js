import { List } from 'immutable';
import {
  SET_APP,
  REQUESTED_APP_VERSION,
  RECEIVED_APP_VERSION,
  ERRORED_APP_VERSION,
  SET_EDITING_PRESENTER_PATH,
  SET_PRESENTER_AT_PATH,
  APP_SAVING_INITIATED,
  APP_SAVING_COMPLETED,
  APP_SAVING_FAILED,
  SET_PRESENTERS_BY_TYPE,
  REQUESTED_IMPORT_MODEL,
  RECEIVED_MODEL,
  RECEIVED_IMPORT_ERROR,
  SET_LINK_PATH,
  CLEAR_LINK_PATH,
  SET_SHOW_SHARE_VERSION_DIALOG,
  REQUESTED_SHARE_APP_VERSION,
  RECEIVED_SHARE_APP_VERSION,
  ERRORED_SHARE_APP_VERSION
} from '../actions';
import * as persistence from '../persistence';
import firebase from '../firebase';
import { getModel } from '../spreadsheet-utils';

export function setAppVersion(appVersion) {
  return dispatch => {
    dispatch({
      type: REQUESTED_APP_VERSION
    });

    Promise.all([
      loadPresenter(appVersion),
      loadModels(appVersion)
    ]).then(([presenter, models]) => {
      dispatch({
        type: RECEIVED_APP_VERSION,
        appVersion,
        models: new List(models),
        presenter
      })
    }).catch(error => {
      dispatch({
        type: ERRORED_APP_VERSION,
        error: 'Failed to load version'
      });
    });
  }
}

function loadPresenter(appVersion) {
  const presenterHash = appVersion.get('presenterHash');
  const orgId = appVersion.get('orgId');
  const projectId = appVersion.get('projectId');
  const author = appVersion.get('author');

  if ( !presenterHash ) {
    return Promise.resolve(null);
  }

  return persistence.userAppVersions.getPresenter(orgId, projectId, author, presenterHash);
}

function loadModels(appVersion) {
  const userModelHashes = appVersion.get('modelInfoById').map(info => info.get('contentHash'));
  const orgId = appVersion.get('orgId');
  const projectId = appVersion.get('projectId');
  const author = appVersion.get('author');

  if ( !userModelHashes || userModelHashes.isEmpty() ) {
    return Promise.resolve(new List());
  }

  return Promise.all(
    userModelHashes.valueSeq().map(
      persistence.userAppVersions.getModel.bind(null, orgId, projectId, author)
    )
  );
}

export function setEditingPresenterPath(editingPresenterPath) {
  return {
    type: SET_EDITING_PRESENTER_PATH,
    editingPresenterPath
  };
}

export function updatePresenterAtPath(path, presenter) {
  return {
    type: SET_PRESENTER_AT_PATH,
    path,
    presenter
  };
}

export function save(appVersion, model, presenter) {
  return dispatch => {
    dispatch({
      type: APP_SAVING_INITIATED
    });

    persistence.userAppVersions.saveAppVersion(appVersion, model, presenter)
      .then(userAppVersions => {
        dispatch({
          type: APP_SAVING_COMPLETED,
          userAppVersions,
          appVersion: userAppVersions.get(appVersion.get('name')),
          model,
          presenter
        });
      }).catch(error => {
        dispatch({
          type: APP_SAVING_FAILED,
          error
        });
      });
  };
}

export function setPresentersByType(presentersByType) {
  return {
    type: SET_PRESENTERS_BY_TYPE,
    presentersByType
  };
}

export function importSheet(spreadsheetId) {
  return (dispatch) => {
    dispatch({
      type: REQUESTED_IMPORT_MODEL
    });

    getModel(spreadsheetId).then(model => {
      dispatch({
        type: RECEIVED_MODEL,
        model
      });
    }).catch(err => {
      if ( err.status === 401 || err.status === 403 ) {
        firebase.auth().signOut();
        window.location = '/';
      }

      dispatch({
        type: RECEIVED_IMPORT_ERROR,
        err
      });
    });
  };
}

export function setLinkPath(linkPath) {
  return {
    type: SET_LINK_PATH,
    linkPath
  };
}

export function clearLinkPath() {
  return {
    type: CLEAR_LINK_PATH
  };
}

export function setApp(app) {
  return {
    type: SET_APP,
    app
  };
}

export function shareAppVersion(appVersion, versionToPublish) {
  return dispatch => {
    dispatch({
      type: REQUESTED_SHARE_APP_VERSION
    });

    return persistence.userAppVersions.shareAppVersion(appVersion, versionToPublish).then(project => {
      dispatch({
        type: RECEIVED_SHARE_APP_VERSION,
        appVersion,
        project
      });
    }).catch(err => {
      dispatch({
        type: ERRORED_SHARE_APP_VERSION
      });

      throw err;
    });
  };
}

export function setShowShareVersionDialog(showShareVersionDialog) {
  return {
    type: SET_SHOW_SHARE_VERSION_DIALOG,
    showShareVersionDialog
  };
}
