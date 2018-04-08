import { Sheet, Tab, Cell } from 'sheety-model';
import { List } from 'immutable';

const funcsToIgnore = /IntrinioDataPoint/i;

export default function sheetToModel(providerId, spreadsheet) {
  const { properties } = spreadsheet;
  const { defaultFormat, title } = properties;
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
              const isIgnoredFunc = !!funcsToIgnore.exec(formulaValue);
              const staticValue = !!formulaValue && !isIgnoredFunc
                                ? null
                                : toValue(cellValue.effectiveValue);

              if ( staticValue === null && formulaValue === null ) {
                return null;
              }

              const format = cellValue.effectiveFormat ? cellValue.effectiveFormat.numberFormat : defaultFormat.numberFormat;

              return new Cell({
                staticValue,
                formula: !isIgnoredFunc && formulaValue ? formulaValue.replace(/^=/, '') : null,
                format: format ? {
                  type: format.type,
                  pattern: format.pattern
                } : null
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
    providerId,
    providerUrl: spreadsheet.spreadsheetUrl,
    title,
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
