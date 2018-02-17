import {
  SET_EDITING_PRESENTER_PATH,
  SET_PRESENTER_AT_PATH
} from '../actions';

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
