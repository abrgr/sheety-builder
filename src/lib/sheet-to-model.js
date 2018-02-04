import { Sheet, Tab, Cell, RemoteRef } from 'sheety-model';
import { List } from 'immutable';

export default function sheetToModel(spreadsheet) {
  const tabs = List(spreadsheet.sheets).filter((sheet) => (
    sheet.properties.sheetType === 'GRID'
  )).map((sheet) => (
    new Tab({
      id: sheet.properties.title,
      rows: trimNulls(
        new List(sheet.data[0].rowData).map(({values}) => (
          trimNulls(
            new List(values).map((cellValue) => {
              const formulaValue = !!cellValue.userEnteredValue
                                 ? cellValue.userEnteredValue.formulaValue
                                 : null; 
              const staticValue = !!formulaValue
                                ? null
                                : toValue(cellValue.effectiveValue);

              if ( staticValue === null && formulaValue === null ) {
                return null;
              }

              return new Cell({
                staticValue,
                formula: formulaValue,
                isUserEditable: false, // TODO
                link: cellValue.hyperlink,
                remoteValue: new RemoteRef() // TODO
                //TODO: handle pivot tables
                //      https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#CellData
              });
            })
          )
        ))
      )
    })
  ));

  return new Sheet({
    tabs
  });
}

function trimNulls(lst) {
  const trimmed = lst.reverse()
                     .skipWhile(n => n === null)
                     .reverse();
  return trimmed.isEmpty()
        ? null
        : trimmed;
}

function toValue(sheetValue) {
  if ( !sheetValue ) {
    return null;
  }

  // TODO: this is wrong (handle 0 properly)
  return sheetValue.numberValue
      || sheetValue.stringValue
      || sheetValue.boolValue
      || sheetValue.formulaValue
      || sheetValue.errorValue; // TODO: take errorValue.type
}
