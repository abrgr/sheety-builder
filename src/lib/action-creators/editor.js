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
  RECEIVED_SPREADSHEET_ID,
  RECEIVED_MODEL,
  RECEIVED_IMPORT_ERROR,
  SET_LINK_PATH,
  CLEAR_LINK_PATH
} from '../actions';
import * as persistence from '../persistence';
import { getSpreadsheet } from '../google';
import sheetToModel from '../sheet-to-model';
import firebase from '../firebase';

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
  const userHash = appVersion.get('presenterHash');
  const orgId = appVersion.get('orgId');
  const projectId = appVersion.get('projectId');

  if ( !!userHash ) {
    return persistence.userAppVersions.getUserPresenterByHash(orgId, projectId, userHash);
  }

  return persistence.userAppVersions.getPublicPresenterByHash(orgId, projectId, userHash);
}

function loadModels(appVersion) {
  const userModels = appVersion.get('modelHashesById');
  const orgId = appVersion.get('orgId');
  const projectId = appVersion.get('projectId');

  if ( !!userModels && !userModels.isEmpty() ) {
    return Promise.all(
      userModels.valueSeq().map(
        persistence.userAppVersions.getUserModelByHash.bind(null, orgId, projectId)
      )
    );
  }

  return Promise.all(
    appVersion.getIn(['base', 'modelHashesById']).valueSeq().map(
      persistence.userAppVersions.getPublicModelByHash.bind(null, orgId, projectId)
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

export function save(appVersion, spreadsheetId, model, presenter) {
  return dispatch => {
    dispatch({
      type: APP_SAVING_INITIATED
    });

    persistence.userAppVersions.saveAppVersion(appVersion, spreadsheetId, model, presenter)
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
      type: RECEIVED_SPREADSHEET_ID,
      spreadsheetId
    });

    getSpreadsheet(spreadsheetId).then(sheetToModel).then((model) => {
      dispatch({
        type: RECEIVED_MODEL,
        model
      });
    }).catch((err) => {
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
