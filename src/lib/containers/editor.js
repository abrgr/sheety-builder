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

    if ( this.props.error ) {
      return (
        <p>
          An error occured!
        </p>
      );
    }

    return (
      <pre>
        {JSON.stringify(this.props.model.toJS())}
      </pre>
    );
  }
}

const Editor = connect(
  ({ importer }) => ({
    isLoading: importer.get('isLoading'),
    spreadsheetId: importer.get('spreadsheetId'),
    model: importer.get('model'),
    error: importer.get('error')
  })
)(Editor_);

export default Editor;
