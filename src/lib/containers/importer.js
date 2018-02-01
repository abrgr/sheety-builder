import React, { Component } from 'react';

class Importer extends Component {
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
    this.props.history.push(`/${this.state.sheetId}`);
  };
}

export default Importer;
