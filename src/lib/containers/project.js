import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { projectActions } from '../action-creators';
import CreateImg from 'material-ui/svg-icons/content/add-circle';
import OpenImg from 'material-ui/svg-icons/action/open-in-new';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import { GridList, GridTile } from 'material-ui/GridList';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import ModifiableImg from '../components/modifiable-img';
import CreateAppDialog from '../components/create-app-dialog';
import Loader from '../components/loader';
import ErrorMsg from '../components/error-msg';
import { App } from '../models';
import { appRoutes } from '../routes';

class Project extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showCreateAppDialog: false
    };
  }

  render() {
    const {
      project,
      isLoading,
      error
    } = this.props;

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

    const imageURL = project.get('imageURL');
    const { showCreateAppDialog } = this.state;

    return (
      <div>
        <CreateAppDialog
          open={showCreateAppDialog}
          onRequestClose={this.onCloseCreateAppDialog}
          onCreate={this.onCreateApp} />
        <Card>
          <CardHeader
            title={project.get('name')}
            subtitle={project.get('orgName') || ''} />
          <ModifiableImg
            src={imageURL}
            alt={project.get('name')}
            width={150}
            height={150}
            onChange={this.onChangedProjectImage} />
          <CardText>
          </CardText>
          <CardActions>
            <RaisedButton
              label="Save"
              primary={true} />
            <FlatButton
              label="Delete project"
              secondary={true} />
          </CardActions>
        </Card>
        <h2>Apps</h2>
        <GridList
          cellHeight={150}>
          <GridTile
            title="Create a new app"
            subtitle={Object.values(App.Platforms).join(', ')}
            actionIcon={
              <IconButton
                onClick={this.onShowCreateAppDialog}>
                <CreateImg color="white" />
              </IconButton>
            }>
          </GridTile>
          {project.get('apps').map(app => (
            <GridTile
              key={app.get('name')}
              title={app.get('name')}
              subtitle={app.get('platform')}
              actionIcon={
                <IconButton
                  onClick={this.onEditApp.bind(null, app)}>
                  <OpenImg color="white" />
                </IconButton>
              }>
              <img
                alt={app.get('name')}
                src={app.get('iconURL')} />
            </GridTile>
          ))}
        </GridList>
      </div>
    );
  }

  onChangedProjectImage = blob => {
    const { dispatch, project } = this.props;
    dispatch(
      projectActions.setProjectImage(
        project,
        blob
      )
    );
  };

  onCloseCreateAppDialog = () => {
    this.setState({
      showCreateAppDialog: false
    });
  };

  onShowCreateAppDialog = () => {
    this.setState({
      showCreateAppDialog: true
    });
  };

  onCreateApp = (app, imgBlob) => {
    const { dispatch, project, history } = this.props;

    dispatch(
      projectActions.saveApp(
        project,
        app,
        imgBlob,
        history
      )
    );

    this.onCloseCreateAppDialog();
  };

  onEditApp = app => {
    const { project, history } = this.props;

    history.push(
      appRoutes.default(
        project.get('orgId'),
        project.get('id'),
        app.get('id')
      )
    );
  };
}

export default withRouter(
  connect(
    ({ auth, project, projects }) => ({
      isLoading: project.get('isLoading'),
      error: project.get('error'),
      project: project.get('project'),
      projects: projects.get('projects')
    })
  )(Project)
);
