import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import CheckImg from 'material-ui/svg-icons/action/check-circle';
import OpenImg from 'material-ui/svg-icons/action/open-in-new';
import CreateImg from 'material-ui/svg-icons/content/add-circle';
import { GridList, GridTile } from 'material-ui/GridList';
import { projectActions } from '../action-creators';
import { projectRoutes } from '../routes';
import { Project } from '../models';
import Loader from '../components/loader';
import ErrorMsg from '../components/error-msg';

class ProjectList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showCreateProjectDialog: false,
      projectName: ''
    };
  }

  render() {
    const {
      isLoading,
      error,
      projects,
      invitations
    } = this.props;

    const { projectName, showCreateProjectDialog } = this.state;

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

    return (
      <div>
        <Dialog
          title="Create project"
          actions={[
            (
              <FlatButton
                label="Cancel"
                onClick={this.onCloseCreateProjectDialog} />
            ),
            (
              <FlatButton
                label="Create"
                primary={true}
                onClick={this.onCreateProject} />
            )
          ]}
          modal={false}
          open={showCreateProjectDialog}
          onRequestClose={this.onCloseCreateProjectDialog}
          autoScrollBodyContent={true}>
          <TextField
            fullWidth={true}
            floatingLabelText="Project name"
            value={projectName}
            onChange={(evt) => {
              this.setState({
                projectName: evt.target.value
              });
            }} />
        </Dialog>
        {invitations && !!invitations.length
          ? (
            <div>
              <h2>Invitations</h2>
              <GridList
                cellHeight={150}>
                {invitations.map(invitation => (
                  <GridTile
                    key={invitation.get('id')}
                    title={invitation.get('name')}
                    actionIcon={
                      <IconButton
                        onClick={this.onAcceptInvitation.bind(null, invitation)}>
                        <CheckImg color="white" />
                      </IconButton>
                    }>
                    <img
                      alt={invitation.get('name')}
                      src={invitation.get('imageURL')} />
                  </GridTile>
                ))}
              </GridList>
            </div>
          ) : null}
        <div>
          <h2>Projects</h2>
          <GridList
            cellHeight={200}>
            <GridTile
              title="Create a new project"
              actionIcon={
                <IconButton
                  onClick={this.onShowCreateProjectDialog}>
                  <CreateImg color="white" />
                </IconButton>
              }>
            </GridTile>
            {(projects || new List()).map(project => (
              <GridTile
                key={project.get('id')}
                title={project.get('name')}
                actionIcon={
                  <IconButton
                    onClick={this.onOpenProject.bind(null, project)}>
                    <OpenImg color="white" />
                  </IconButton>
                }>
                <img
                  alt={project.get('name')}
                  src={project.get('imageURL')} />
              </GridTile>
            ))}
          </GridList>
        </div>
      </div>
    );
  }

  onCreateProject = () => {
    const { dispatch, history, uid } = this.props;
    const { projectName } = this.state;

    const permissions = new Map([
      [ uid, true ]
    ]);

    const project = new Project({
      orgId: uid,
      name: projectName,
      admins: permissions,
      writers: permissions,
      readers: permissions
    });

    dispatch(projectActions.saveProject(project, history));

    this.onCloseCreateProjectDialog();
  };

  onCloseCreateProjectDialog = () => {
    this.setState({
      showCreateProjectDialog: false
    });
  };

  onShowCreateProjectDialog = () => {
    this.setState({
      showCreateProjectDialog: true
    });
  };

  onOpenProject = (project) => {
    const { history } = this.props;
    history.push(
      projectRoutes.project(
        project.get('orgId'),
        project.get('id')
      )
    );
  };

  onAcceptInvitation = (invitation) => {
    // TODO
  };
}

export default withRouter(
  connect(
    ({ auth, projects }) => ({
      uid: auth.get('uid'),
      email: auth.get('email'),
      isLoading: projects.get('isLoading'),
      error: projects.get('error'),
      projects: projects.get('projects'),
      invitations: projects.get('invitations')
    })
  )(ProjectList)
);
