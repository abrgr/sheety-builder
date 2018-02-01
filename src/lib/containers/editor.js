import React, { Component } from 'react';
import { connect } from 'react-redux';
import { importerActions } from '../action-creators';

class Editor_ extends Component {
  componentDidMount() {
    const urlSpreadsheetId = this.props.match.params.spreadsheetId;
    if ( this.props.spreadsheetId !== urlSpreadsheetId ) {
      this.props.dispatch(importerActions.importSheet(urlSpreadsheetId));
    }
  }

  render() {
    const loading = this.props.isLoading
                  || this.props.spreadsheetId !== this.props.match.params.spreadsheetId;
    if ( loading ) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    return (
      <textarea defaultValue={JSON.stringify(this.props.model.toJS())} />
    );
  }
}

const Editor = connect(
  ({ importer }) => ({
    isLoading: importer.get('isLoading'),
    spreadsheetId: importer.get('spreadsheetId'),
    model: importer.get('model')
  })
)(Editor_);

export default Editor;
