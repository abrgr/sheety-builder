import { RECEIVED_SPREADSHEET_ID, RECEIVED_MODEL } from '../actions';
import { getSpreadsheet } from '../google';
import sheetToModel from '../sheet-to-model';

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
    });
  };
}
