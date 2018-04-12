import { List, Map } from 'immutable';
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
  SET_SHOW_SHARE_VERSION_DIALOG
} from '../actions';
import * as persistence from '../persistence';
import firebase from '../firebase';
import { getModel } from '../spreadsheet-utils';

export function setAppVersion(appVersion) {
  return dispatch => {
    dispatch({
      type: REQUESTED_APP_VERSION
    });

    const hasOwnChanges = appVersion.hasOwnChanges();
    const isFromScratch = appVersion.isFromScratch();

    if ( !hasOwnChanges && isFromScratch ) {
      // nothing to load
      return dispatch({
        type: RECEIVED_APP_VERSION,
        appVersion,
        models: new List(),
        presenter: new Map()
      });
    }

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
  const userModels = appVersion.get('modelHashesById');
  const orgId = appVersion.get('orgId');
  const projectId = appVersion.get('projectId');
  const author = appVersion.get('author');

  if ( !userModels || userModels.isEmpty() ) {
    return Promise.resolve(new List());
  }

  return Promise.all(
    userModels.valueSeq().map(
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
      .then(() => {
        dispatch({
          type: APP_SAVING_COMPLETED
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
      if ( err.status === 401 ) {
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
  // TODO
  return dispatch => {
    return persistence.userAppVersions.shareAppVersion(appVersion, versionToPublish);
  };
}

export function setShowShareVersionDialog(showShareVersionDialog) {
  return {
    type: SET_SHOW_SHARE_VERSION_DIALOG,
    showShareVersionDialog
  };
}
