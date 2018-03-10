import React, { Component } from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { editorActions } from '../action-creators';
import Pallette from '../components/pallette';
import Configurator from '../components/configurator';
import Preview from '../components/preview';
import Breadcrumbs from '../components/breadcrumbs';
import loadPresenters from '../presenter-registry';

class PresenterEditor extends Component {
  componentDidMount() {
    this.props.dispatch(editorActions.setPresentersByType(loadPresenters()));
  }

  render() {
    const {
      calc,
      presenter,
      presentersByType,
      editingPresenterPath,
      linkPath,
      dispatch
    } = this.props;

    const presenterComponent = presentersByType.get(presenter.getIn(editingPresenterPath.concat(['type'])));

    return (
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
            nameFn={path => {
              const idVal = presenter.getIn(path.concat('id'));
              const typeVal = presenter.getIn(path.concat('type'));
              return (idVal && calc.evaluateFormula(idVal))
                  || presentersByType.get(typeVal).schema.get('title');
            }}
            onSelectPath={this.onSelectPresenterForEditing} />
          <Pallette
            presentersByType={presentersByType}
            expanded={!presenterComponent}
            onSelected={(selectedPresenterType) => {
              dispatch(
                editorActions.updatePresenterAtPath(
                  editingPresenterPath,
                  new Map(presentersByType.get(selectedPresenterType).defaultPresenter())
                )
              )
            }} />
          <Configurator
            presenterComponent={presenterComponent}
            presenter={presenter.getIn(editingPresenterPath)}
            linkPath={linkPath}
            calc={calc}
            onUpdate={(path, newValue) => {
              dispatch(
                editorActions.updatePresenterAtPath(
                  editingPresenterPath.concat(path),
                  newValue
                )
              );
            }}
            onEditPresenter={(newPathPart) => {
              dispatch(
                editorActions.setEditingPresenterPath(
                  editingPresenterPath.concat(newPathPart)
                )
              );
            }}
            onSetLinkPath={(linkPath) => {
              dispatch(
                editorActions.setLinkPath(linkPath)
              );
            }}
            onClearLinkPath={() => {
              dispatch(
                editorActions.clearLinkPath()
              );
            }} />
        </div>
      </div>
    );
  }

  onSelectPresenterForEditing = (path) => {
    const { dispatch } = this.props;
    dispatch(editorActions.setEditingPresenterPath(path));
  };
}

export default connect(
  ({ editor }) => ({
    appId: editor.get('appId'),
    isLoading: editor.get('isLoading'),
    error: editor.get('error'),
    calc: editor.get('calc'),
    presentersByType: editor.get('presentersByType'),
    presenter: editor.get('presenter'),
    editingPresenterPath: editor.get('editingPresenterPath'),
    linkPath: editor.get('linkPath')
  })
)(PresenterEditor);
