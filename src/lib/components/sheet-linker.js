import React, { Component } from 'react';
import { Set } from 'immutable';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import HotTable from 'react-handsontable';
import uuid from 'uuid';
import { CellRef, CellRefRange } from 'sheety-model';
import SpreadsheetTabs from './spreadsheet-tabs';

const multiSelectorSchemaTypes = Set.of(
  'array'
);

export default class SheetLinker extends Component {
  constructor(props) {
    super(props);

    const isRef = !!CellRef.fromA1Ref(props.value)
                || !!CellRefRange.fromA1Ref(props.value);

    this.state = {
      id: `sheet-${uuid.v4()}`,
      value: isRef ? props.value : ''
    };
  }

  render() {
    const {
      calc,
      onUpdate,
      onClearLinkPath,
      schema
    } = this.props;

    const { value } = this.state;
    const allowMultiSelection = schema && multiSelectorSchemaTypes.has(schema.get('type'));

    return (
      <Dialog
        title="Link to spreadsheet"
        contentStyle={{
          height: '80%'
        }}
        actions={[
          (
            <FlatButton
              label="Cancel"
              onClick={onClearLinkPath} />
          ),
          (
            <FlatButton
              label="Done"
              primary={true}
              onClick={() => {
                onUpdate(value);
                onClearLinkPath();
              }} />
          )
        ]}
        modal={false}
        open={true}
        onRequestClose={onClearLinkPath}
        autoScrollBodyContent={true}>
        <TextField
          floatingLabelText={allowMultiSelection ? "Selected Cells" : "Selected Cell"}
          hintText={allowMultiSelection ? "'Tab 1'!A1:B3" : "'Tab 1'!C4"}
          value={value || ''}
          onChange={(evt) => {
            this.setState({
              value: evt.target.value
            });
          }} />
        <SpreadsheetTabs
          calc={calc}
          tabRenderer={(tabName) => {
            const rows = calc.vals.get(tabName);
            if ( !rows ) {
              return null;
            }

            const range = new CellRefRange({
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
            });

            return (
              <HotTable
                root={this.state.id}
                readOnly={true}
                data={calc.getFormattedRange(range)}
                colHeaders={true}
                rowHeaders={true}
                autoRowSize={true}
                autoColSize={true}
                preventOverflow={true}
                multiSelect={allowMultiSelection}
                afterSelection={(startRow, startCol, endRow, endCol) => {
                  if ( allowMultiSelection ) {
                    const selectedRange = new CellRefRange({
                      start: {
                        tabId: tabName,
                        rowIdx: startRow,
                        colIdx: startCol
                      },
                      end: {
                        tabId: tabName,
                        rowIdx: endRow,
                        colIdx: endCol
                      }
                    });

                    return this.setState({
                      value: selectedRange.toA1Ref()
                    });
                  }

                  const selectedCell = new CellRef({
                    tabId: tabName,
                    rowIdx: startRow,
                    colIdx: startCol
                  });

                  return this.setState({
                    value: selectedCell.toA1Ref()
                  });
                }} />
            );
          }} />
      </Dialog>
    );
  }
}
