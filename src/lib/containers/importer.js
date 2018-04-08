import React, { Component } from 'react';
import { connect } from 'react-redux';
import ImporterComponent from '../components/importer';
import SheetLogicEditor from '../components/sheet-logic-editor';
import Loader from '../components/loader';
import ErrorMsg from '../components/error-msg';
import { editorActions } from '../action-creators';
import { createProviderId } from '../spreadsheet-utils';

class Importer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      source: 'google',
      sheetId: ''
    };
  }

  render() {
    const { isLoading, error, calc } = this.props;

    if ( error ) {
      return (
        <ErrorMsg
          msg="An error occured!" />
      );
    }

    return (
      <div>
        <ImporterComponent
          sheetId={this.state.sheetId}
          onSheetIdChanged={this.onSheetIdChanged}
          onImport={this.onImport} />
        <div
          style={{ margin: 20 }}>
          {isLoading
            ? (
              <Loader />
            ) : (
              <SheetLogicEditor
                calc={calc} />
            )}
        </div>
      </div>
    );
  }

  onSheetIdChanged = (evt) => {
    this.setState({ sheetId: evt.target.value });
  };

  onImport = (evt) => {
    evt.preventDefault();
    this.props.dispatch(editorActions.importSheet(createProviderId(this.state.source, this.state.sheetId)));
  };
}

export default connect(
  ({ editor }) => ({
    isLoading: editor.get('isLoading'),
    error: editor.get('error'),
    calc: editor.get('calc'),
    model: editor.get('model')
  })
)(Importer);
