import { Record, Map } from 'immutable';
import Calculator from 'sheety-calculator';
import * as actions from '../actions';

const initialState = new Record({
  appId: '',
  presenter: new Map(),
  editingPresenterPath: [],
  linkPath: null,
  presentersByType: new Map(),
  isLoading: false,
  spreadsheetId: null,
  model: null,
  error: null,
  calc: null
})();

export default function editor(state = initialState, action) {
  switch ( action.type ) {
    case actions.SET_PRESENTER_AT_PATH:
      return state.setIn(['presenter'].concat(action.path), action.presenter);
    case actions.SET_EDITING_PRESENTER_PATH:
      return state.set('editingPresenterPath', action.editingPresenterPath);
    case actions.SET_APP_ID:
      return state.set('appId', action.appId);
    case actions.SET_PRESENTERS_BY_TYPE:
      return state.set('presentersByType', action.presentersByType);
    case actions.RECEIVED_SPREADSHEET_ID:
      return state.merge({
        isLoading: true,
        spreadsheetId: action.spreadsheetId,
        model: null 
      });
    case actions.RECEIVED_MODEL:
      return state.merge({
        isLoading: false,
        model: action.model,
        calc: new Calculator(action.model)
      });
    case actions.RECEIVED_IMPORT_ERROR:
      return state.merge({
        isLoading: false,
        model: null,
        error: action.err
      }); 
    case actions.SET_LINK_PATH:
      return state.set('linkPath', action.linkPath);
    case actions.CLEAR_LINK_PATH:
      return state.set('linkPath', null);
    default:
      return state;
  }
}
