import React, { Component } from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';
import { orange500 } from 'material-ui/styles/colors';
import { importerActions, editorActions } from '../action-creators';
import Pallette from '../components/pallette';
import Configurator from '../components/configurator';
import Preview from '../components/preview';
import Breadcrumbs from '../components/breadcrumbs';
import loadPresenters from '../presenter-registry';

class Editor_ extends Component {
  componentDidMount() {
    const urlSpreadsheetId = this.props.match.params.spreadsheetId;
    if ( this.props.spreadsheetId !== urlSpreadsheetId ) {
      this.props.dispatch(importerActions.importSheet(urlSpreadsheetId));
    }

    this.props.dispatch(editorActions.setPresentersByType(loadPresenters()));
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
      presentersByType,
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
        <AppBar
          showMenuIconButton={false}
          title={(
            <TextField
              floatingLabelText="App ID"
              floatingLabelStyle={{ color: orange500 }}
              floatingLabelFocusStyle={{ color: orange500 }}
              inputStyle={{ color: orange500 }}
              value={appId}
              onChange={this.onUpdateAppId} />
          )}
          iconElementRight={(
            <FlatButton
              label="Save"
              onClick={this.onSave} />
          )} />
        <div style={{clear: 'both'}}>
          <div style={{float: 'left', width: '70%' }}>
            <Preview
              presentersByType={presentersByType}
              calc={calc}
              presenter={presenter}
              selectedPath={editingPresenterPath}
              onSelectPresenterForEditing={this.onSelectPresenterForEditing} />
          </div>
          <div style={{float: 'left', width: '30%' }}>
            <Breadcrumbs
              items={new List(editingPresenterPath)}
              maxItems={3}
              filterFn={path => (
                !!presenter.getIn(path.concat('type'))
              )}
              nameFn={path => (
                presenter.getIn(path.concat('id'))
                  || presentersByType.get(presenter.getIn(path.concat('type'))).schema.get('title')
              )}
              onSelectPath={this.onSelectPresenterForEditing} />
            <Pallette
              presentersByType={presentersByType}
              onSelected={(selectedPresenterType) => {
                dispatch(
                  editorActions.updatePresenterAtPath(
                    editingPresenterPath,
                    new Map(presentersByType.get(selectedPresenterType).defaultPresenter())
                  )
                )
              }} />
            <Configurator
              presenterComponent={presentersByType.get(presenter.getIn(editingPresenterPath.concat(['type'])))}
              presenter={presenter.getIn(editingPresenterPath)}
              onUpdate={(path, newValue) => {
                dispatch(
                  editorActions.updatePresenterAtPath(
                    editingPresenterPath.concat(path),
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
    presentersByType: editor.get('presentersByType'),
    presenter: editor.get('presenter'),
    editingPresenterPath: editor.get('editingPresenterPath')
  })
)(Editor_);

export default Editor;
