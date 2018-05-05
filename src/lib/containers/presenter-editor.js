import React, { Component } from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import Popover from 'material-ui/Popover';
import { editorActions } from '../action-creators';
import Pallette from '../components/pallette';
import Configurator from '../components/configurator';
import Preview from '../components/preview';
import Breadcrumbs from '../components/breadcrumbs';
import Loader from '../components/loader';
import ErrorMsg from '../components/error-msg';
import ActionEditorDialog from '../components/action-editor-dialog';
import loadPresenters from '../presenter-registry';

class PresenterEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPresenterEl: null
    };
  }

  componentDidMount() {
    this.props.dispatch(editorActions.setPresentersByType(loadPresenters()));
  }

  render() {
    const {
      isLoading,
      error,
      calc,
      presentersByType,
      editingPresenterPath,
      editingActionPath,
      linkPath,
      dispatch
    } = this.props;
    const presenter = this.props.presenter || new Map();

    const { selectedPresenterEl } = this.state;

    if ( isLoading ) {
      return (
        <Loader />
      );
    }

    if ( error ) {
      return (
        <ErrorMsg
          msg={error} />
      );
    }

    const presenterComponent = presentersByType.get(presenter.getIn(editingPresenterPath.concat(['type'])));

    return (
      <div
        onClick={() => {
          this.setState({
            selectedPresenterEl: null
          });
        }}
        style={{
          height: '100%'
        }}>
        {presenterComponent
          ? (
            <ActionEditorDialog
              open={!!editingActionPath && !!editingActionPath.length && !!presenterComponent.getEventSchema}
              eventSchema={presenterComponent.getEventSchema && presenterComponent.getEventSchema(
                // TODO: invariant: editingPresenterPath.concat(x) === editingActionPath
                editingActionPath.slice(editingPresenterPath.length),
                presenter.getIn(editingPresenterPath)
              )}
              calc={calc}
              onUpdate={this.onUpdate.bind(null, editingPresenterPath.concat(editingActionPath))}
              onRequestClose={() => {
                this.props.dispatch(editorActions.setEditingActionPath([]));
              }} />
          ) : null}
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
        <Preview
          presentersByType={presentersByType}
          calc={calc}
          presenter={presenter}
          selectedPath={editingPresenterPath}
          onUpdate={this.onUpdate}
          onEditAction={this.onEditAction}
          onSelectPresenterForEditing={this.onSelectPresenterForEditing} />
        <Popover
          open={!!selectedPresenterEl}
          canAutoPosition
          useLayerForClickAway={false}
          style={{
            zIndex: 1499 // ensures that we stay below any dialogs
          }}
          anchorEl={selectedPresenterEl}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom'
          }}
          targetOrigin={{
            horizontal: 'right',
            vertical: 'top'
          }}
          onRequestClose={() => null}>
          <div
            style={{
              width: 600,
              maxHeight: 400,
              overflowY: 'scroll'
            }}>
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
              onUpdate={this.onUpdate}
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
        </Popover>
      </div>
    );
  }

  onUpdate = (path, newValue) => {
    const { dispatch, editingPresenterPath } = this.props;

    dispatch(
      editorActions.updatePresenterAtPath(
        editingPresenterPath.concat(path),
        newValue
      )
    );
  };

  onEditAction = path => {
    this.props.dispatch(editorActions.setEditingActionPath(path));
  };

  onSelectPresenterForEditing = (path, selectedPresenterEl) => {
    const { dispatch } = this.props;
    dispatch(editorActions.setEditingPresenterPath(path));
    this.setState({
      selectedPresenterEl
    });
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
    editingActionPath: editor.get('editingActionPath'),
    linkPath: editor.get('linkPath')
  })
)(PresenterEditor);
