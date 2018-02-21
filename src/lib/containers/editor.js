import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { importerActions, editorActions } from '../action-creators';
import Pallette from '../components/pallette';
import Configurator from '../components/configurator';
import Preview from '../components/preview';

class Editor_ extends Component {
  componentDidMount() {
    const urlSpreadsheetId = this.props.match.params.spreadsheetId;
    if ( this.props.spreadsheetId !== urlSpreadsheetId ) {
      this.props.dispatch(importerActions.importSheet(urlSpreadsheetId));
    }
  }

  render() {
    const {
      appId,
      isLoading,
      spreadsheetId,
      match,
      error,
      calc,
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
        <div>
          <p>App ID:</p>
          <input
            type="text"
            value={appId}
            onChange={this.onUpdateAppId} />
          <button onClick={this.onSave}>
            Save!
          </button>
        </div>
        <div style={{clear: 'both'}}>
          <div style={{float: 'left', width: '70%' }}>
            Content!
            <Preview
              calc={calc}
              presenter={presenter}
              onSelectPresenterForEditing={this.onSelectPresenterForEditing} />
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
      </div>
    );
  }

  onSelectPresenterForEditing = (path) => {
    const { dispatch } = this.props;
    dispatch(editorActions.setEditingPresenterPath(path));
  };

  onUpdateAppId = (evt) => {
    this.props.dispatch(editorActions.setAppId(evt.target.value));
  };

  onSave = () => {
    const {
      appId,
      spreadsheetId,
      model,
      presenter,
      dispatch
    } = this.props;
    dispatch(editorActions.save(appId, spreadsheetId, model, presenter));
  };
}

const Editor = connect(
  ({ editor, importer }) => ({
    appId: editor.get('appId'),
    isLoading: importer.get('isLoading'),
    spreadsheetId: importer.get('spreadsheetId'),
    model: importer.get('model'),
    error: importer.get('error'),
    calc: importer.get('calc'),
    availablePresenters: editor.get('availablePresenters'),
    presenter: editor.get('presenter'),
    editingPresenterPath: editor.get('editingPresenterPath')
  })
)(Editor_);

export default Editor;
