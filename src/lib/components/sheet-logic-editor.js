import React from 'react';
import { Map } from 'immutable';
import { CellRefRange } from 'sheety-model';
import SpreadsheetTabs from './spreadsheet-tabs';
import loadPresenters from '../presenter-registry';

const presentersByType = loadPresenters(false);
const Spreadsheet = presentersByType.get('spreadsheet');

export default ({ calc }) => {
  if ( !calc ) {
    return null;
  }

  return (
    <SpreadsheetTabs
      calc={calc}
      tabRenderer={(tabName) => {
        const rows = calc.vals.get(tabName);
        if ( !rows ) {
          return null;
        }

        return (
          <Spreadsheet
            config={new Map({
              showColumnHeaders: true,
              showRowHeaders: true
            })}
            arrayDataQuery={
              new CellRefRange({
                start: {
                  tabId: tabName,
                  rowIdx: 0,
                  colIdx: 0
                },
                end: {
                  tabId: tabName,
                  rowIdx: rows.size - 1,
                  colIdx: rows.reduce((theMax, row) => (
                    Math.max(theMax, !!row ? row.size - 1 : 0)
                  ), 0)
                }
              }).toA1Ref()
            } />
        );
      }} />
  );
}
