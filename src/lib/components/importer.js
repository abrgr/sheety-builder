import React from 'react';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

export default ({ sheetId, onSheetIdChanged, onImport }) => (
  <Paper
    style={{ padding: 20 }}>
    <TextField
      floatingLabelText='Spreadsheet ID'
      hintText='From the URL of your Google Sheet'
      value={sheetId}
      onChange={onSheetIdChanged} />
    <RaisedButton
      primary={true}
      style={{ marginLeft: 20 }}
      label='Import Sheet'
      onClick={onImport} />
  </Paper>
);
