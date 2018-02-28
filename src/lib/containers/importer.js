import React, { Component } from 'react';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { editorActions } from '../action-creators';

class Importer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sheetId: ''
    };
  }

  render() {
    const { isLoading, error } = this.props;

    if ( isLoading ) {
      return (
        <div
          style={{ margin: 20 }}>
          <CircularProgress
            size={80}
            thickness={5} />
        </div>
      );
    }

    if ( error ) {
      return (
        <p>
          An error occured!
        </p>
      );
    }

    return (
      <div>
        <div style={{ margin: 20 }}>
          <TextField
            floatingLabelText='Spreadsheet ID'
            hintText='From the URL of your Google Sheet'
            value={this.state.sheetId}
            onChange={this.onSheetIdChanged} />
        </div>
        <div style={{ margin: 20 }}>
          <RaisedButton
            primary={true}
            label='Import Sheet'
            onClick={this.onImport} />
        </div>
      </div>
    );
  }

  onSheetIdChanged = (evt) => {
    this.setState({ sheetId: evt.target.value });
  };

  onImport = (evt) => {
    evt.preventDefault();
    this.props.dispatch(editorActions.importSheet(this.state.sheetId));
  };
}

export default connect(
  ({ editor }) => ({
    isLoading: editor.get('isLoading'),
    error: editor.get('error')
  })
)(Importer);
