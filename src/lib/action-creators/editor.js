import {
  SET_EDITING_PRESENTER_PATH,
  SET_PRESENTER_AT_PATH,
  SET_APP_ID,
  APP_SAVING_INITIATED,
  APP_SAVING_COMPLETED,
  APP_SAVING_FAILED,
  SET_PRESENTERS_BY_TYPE,
  TOGGLE_MAIN_EDITOR_MENU,
  RECEIVED_SPREADSHEET_ID,
  RECEIVED_MODEL,
  RECEIVED_IMPORT_ERROR,
  SET_LINK_PATH,
  CLEAR_LINK_PATH
} from '../actions';
import { saveApp } from '../persistence';
import { getSpreadsheet } from '../google';
import sheetToModel from '../sheet-to-model';
import firebase from '../firebase';

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

export function setAppId(appId) {
  return {
    type: SET_APP_ID,
    appId
  };
}

export function save(appId, spreadsheetId, model, presenter) {
  return dispatch => {
    dispatch({
      type: APP_SAVING_INITIATED
    });

    saveApp(appId, spreadsheetId, model, presenter)
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

export function toggleMainMenu() {
  return {
    type: TOGGLE_MAIN_EDITOR_MENU
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
