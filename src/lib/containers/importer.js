import React, { Component } from 'react';
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import ImporterComponent from '../components/importer';
import SheetLogicEditor from '../components/sheet-logic-editor';
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
        <p>
          An error occured!
        </p>
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
              <CircularProgress
                mode='indeterminate' />
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
