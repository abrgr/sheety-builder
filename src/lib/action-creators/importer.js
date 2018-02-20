import {
  RECEIVED_SPREADSHEET_ID,
  RECEIVED_MODEL,
  RECEIVED_IMPORT_ERROR
} from '../actions';
import { getSpreadsheet } from '../google';
import sheetToModel from '../sheet-to-model';
import firebase from '../firebase';

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
