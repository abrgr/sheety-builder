import {
  SET_EDITING_PRESENTER_PATH,
  SET_PRESENTER_AT_PATH,
  SET_APP_ID,
  APP_SAVING_INITIATED,
  APP_SAVING_COMPLETED,
  APP_SAVING_FAILED
} from '../actions';
import { saveApp } from '../persistence';

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
