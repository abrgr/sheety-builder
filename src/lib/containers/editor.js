import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { importerActions, editorActions } from '../action-creators';
import Pallette from '../components/pallette';
import Configurator from '../components/configurator';

class Editor_ extends Component {
  componentDidMount() {
    const urlSpreadsheetId = this.props.match.params.spreadsheetId;
    if ( this.props.spreadsheetId !== urlSpreadsheetId ) {
      this.props.dispatch(importerActions.importSheet(urlSpreadsheetId));
    }
  }

  render() {
    const {
      isLoading,
      spreadsheetId,
      match,
      error,
      presenter,
      availablePresenters,
      editingPresenterPath,
      dispatch
    } = this.props;

    const loading = isLoading
                  || spreadsheetId !== match.params.spreadsheetId;
    if ( loading ) {
      return (
        <div>
          Loading...
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
        <div style={{float: 'left', width: '70%' }}>
          Content!
          <pre>
            {JSON.stringify(presenter.toJS())}
          </pre>
        </div>
        <div style={{float: 'left', width: '30%' }}>
          <Pallette
            availablePresenters={availablePresenters.valueSeq()}
            onSelected={(selectedPresenterType) => {
              dispatch(
                editorActions.updatePresenterAtPath(
                  editingPresenterPath,
                  new Map({
                    type: selectedPresenterType
                  })
                )
              )
            }} />
          <Configurator
            presenterDescriptor={availablePresenters.get(presenter.getIn(editingPresenterPath.concat(['type'])))}
            presenter={presenter.getIn(editingPresenterPath)}
            onUpdatePresenter={(newValue) => {
              dispatch(
                editorActions.updatePresenterAtPath(
                  editingPresenterPath,
                  newValue
                )
              )
            }}
            onEditPresenter={(newPathPart) => {
              dispatch(
                editorActions.setEditingPresenterPath(
                  editingPresenterPath.concat(newPathPart)
                )
              )
            }}/>
        </div>
      </div>
    );
  }
}

const Editor = connect(
  ({ editor, importer }) => ({
    isLoading: importer.get('isLoading'),
    spreadsheetId: importer.get('spreadsheetId'),
    model: importer.get('model'),
    error: importer.get('error'),
    availablePresenters: editor.get('availablePresenters'),
    presenter: editor.get('presenter'),
    editingPresenterPath: editor.get('editingPresenterPath')
  })
)(Editor_);

export default Editor;
