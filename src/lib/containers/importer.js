import React, { Component } from 'react';
import { connect } from 'react-redux';
import { importerActions } from '../action-creators';

class Importer_ extends Component {
  constructor() {
    super();

    this.state = {
      sheetId: ''
    };
  }

  render() {
    return (
      <form onSubmit={this.onImport}>
        <input
          type="text"
          onChange={this.onSheetIdChanged}
          value={this.state.sheetId} />
        <button type="submit">
          Import Sheet
        </button>
      </form>
    );
  }

  onSheetIdChanged = (evt) => {
    this.setState({ sheetId: evt.target.value });
  };

  onImport = (evt) => {
    evt.preventDefault();
    this.props.dispatch(importerActions.importSheet(this.state.sheetId));
  };
}

const Importer = connect(
  ({ importer }) => ({ })
)(Importer_);

export default Importer;
