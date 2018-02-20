import { Record } from 'immutable';
import Calculator from 'sheety-calculator';
import * as actions from '../actions';

const initialState = new Record({
  isLoading: false,
  spreadsheetId: null,
  model: null,
  error: null,
  calc: null
})();

export default function importer(state = initialState, action) {
  switch ( action.type ) {
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
    default:
      return state;
  }
}
