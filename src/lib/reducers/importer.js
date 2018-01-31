import { Record } from 'immutable';
import * as actions from '../actions';

const initialState = new Record({
  isLoading: false,
  spreadsheetId: null,
  model: null
})();

export default function importer(state = initialState, action) {
  switch ( action.type ) {
    case actions.RECEIVED_SPREADSHEET_ID:
      return state.merge({
        isLoading: action.isLoading,
        spreadsheetId: action.spreadsheetId,
        model: null 
      });
    case actions.RECEIVED_MODEL:
      return state.merge({
        isLoading: false,
        model: action.model
      });
    default:
      return state;
  }
}
