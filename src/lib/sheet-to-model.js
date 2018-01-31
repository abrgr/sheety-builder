import { Tab, CellStyle, Cell, RemoteRef } from 'sheety-model';
import { List } from 'immutable';

export default function sheetToModel(spreadsheet) {
  return new List(spreadsheet.sheets).filter((sheet) => (
    sheet.properties.sheetType === 'GRID'
  )).map((sheet) => (
    new Tab({
      id: sheet.properties.title,
      rows: new List(sheet.data[0].rowData).map(({values}) => (
        new List(values).map((cellValue) => {
          const formulaValue = cellValue.userEnteredValue
                             && cellValue.userEnteredValue.formulaValue;
          const effectiveFormat = cellValue.effectiveFormat;

          return new Cell({
            staticValue: !!formulaValue
                       ? null
                       : toValue(cellValue.effectiveValue),
            formula: formulaValue,
            isUserEditable: false, // TODO
            style: effectiveFormat && new CellStyle({
              color: toColor(effectiveFormat.textFormat.foregroundColor),
              backgroundColor: toColor(effectiveFormat.backgroundColor),
              formatter: toFormatter(effectiveFormat.numberFormat),
              isBold: effectiveFormat.textFormat.bold,
              isUnderlined: effectiveFormat.textFormat.underline,
              isItalic: effectiveFormat.textFormat.italic,
            }),
            link: cellValue.hyperlink,
            remoteValue: new RemoteRef() // TODO
            //TODO: handle pivot tables
            //      https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets#CellData
          });
        })
      ))
    })
  ))
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

function toColor(color) {
  return color.red + color.green + color.blue; // TODO
}

function toFormatter(format) {
  /*
  format.type is one of:
    NUMBER_FORMAT_TYPE_UNSPECIFIED  The number format is not specified and is based on the contents of the cell. Do not explicitly use this.
    TEXT  Text formatting, e.g 1000.12
    NUMBER  Number formatting, e.g, 1,000.12
    PERCENT Percent formatting, e.g 10.12%
    CURRENCY  Currency formatting, e.g $1,000.12
    DATE  Date formatting, e.g 9/26/2008
    TIME  Time formatting, e.g 3:59:00 PM
    DATE_TIME Date+Time formatting, e.g 9/26/08 15:59:00
    SCIENTIFIC
  format.pattern is:
    0.00%
  */
}
