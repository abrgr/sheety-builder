import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import { GridList, GridTile } from 'material-ui/GridList';
import CircularProgress from 'material-ui/CircularProgress';
import CreateImg from 'material-ui/svg-icons/content/add-circle';
import { lightBlue400 } from 'material-ui/styles/colors';
import { userAppVersionsActions, projectActions } from '../action-creators';
import { editorRoutes } from '../routes';

const InProgressItems = ({ userAppVersions }) => {
  if ( !userAppVersions || userAppVersions.isEmpty() ) {
    return null;
  }

  return (
    <div>
      <h2>In-progress Work</h2>
      <div>
        {userAppVersions.entrySeq().map(([name, appVersion]) => (
          <div
            key={name}
            style={{
              display: 'inline-block',
              marginRight: 20
            }}>
            <Paper>
              {name} ({appVersion.get('baseName') ? `Based on ${appVersion.get('baseName')}` : 'From scratch'})
            </Paper>
          </div>
        ))}
      </div>
    </div>
  );
};

const BLANK_VERSION_NAME = '__blank__';

class BasicInfoEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showNewVersionDialog: false,
      versionName: '',
      versionDescription: '',
      selectedBaseVersion: null
    };
  }

  render() {
    const { app, error, isLoading, userAppVersions } = this.props;
    const {
      showNewVersionDialog,
      versionName,
      versionDescription,
      selectedBaseVersion
    } = this.state;

    return (
      <div>
        <Dialog
          title='New Version'
          actions={[
            (
              <FlatButton
                label="Cancel"
                onClick={this.onCloseNewVersionDialog} />
            ),
            (
              <FlatButton
                label="Create"
                primary={true}
                onClick={this.onCreateNewVersion} />
            )
          ]}
          modal={false}
          open={showNewVersionDialog}
          onRequestClose={this.onCloseNewVersionDialog}
          autoScrollBodyContent={true}>
          <p>
            You can base your work on an existing version of the app.
            Essentially, we make a private copy of the existing version
            that only you can see and modify.  When you're ready, you can
            merge your changes back into the version of the app that others
            can see or create a new shared version.  This means that you and
            your team can experiment and work independently but still
            collaborate when you're ready.
          </p>
          <div>
            <TextField
              floatingLabelText="Version name"
              value={versionName}
              onChange={this.onUpdateVersionName} />
          </div>
          <div>
            <TextField
              floatingLabelText="Version description"
              multiLine
              value={versionDescription}
              onChange={this.onUpdateVersionDescription} />
          </div>
          <GridList
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
              overflowX: 'auto'
            }}>
            <GridTile
              key={BLANK_VERSION_NAME}
              style={{
                backgroundColor: BLANK_VERSION_NAME === selectedBaseVersion ? lightBlue400 : undefined
              }}
              onClick={this.onSelectBaseVersion.bind(null, BLANK_VERSION_NAME)}
              title='Start from scratch' />
            {app.publishedVersions.entrySeq().map(([publishedVersionName, publishedVersion]) => (
              <GridTile
                key={publishedVersionName}
                style={{
                  backgroundColor: publishedVersionName === selectedBaseVersion ? lightBlue400 : undefined
                }}
                onClick={this.onSelectBaseVersion.bind(null, publishedVersionName)}
                title={publishedVersionName} />
            ))}
          </GridList>
        </Dialog>
        <Paper
          style={{ padding: 20 }}>
          <p>
            You're ready to make an app!
          </p>
          <TextField
            floatingLabelText="App Name"
            value={app.get('name')}
            onChange={this.onUpdateAppId} />
          {!!error
            ? (
              <Paper>
                An error occured!
              </Paper>
            ) : null}
          {isLoading
            ? (
              <CircularProgress
                mode='indeterminate' />
            ) : null}
          <InProgressItems
            userAppVersions={userAppVersions} />
          <Paper>
            <FlatButton
              label='Start working'
              labelPosition='after'
              onClick={this.onShowNewVersionDialog}
              primary
              icon={<CreateImg />} />
          </Paper>
        </Paper>
      </div>
    );
  }

  onShowNewVersionDialog = () => {
    this.setState({
      showNewVersionDialog: true
    });
  };

  onCloseNewVersionDialog = () => {
    this.setState({
      showNewVersionDialog: false
    });
  };

  onSelectBaseVersion = selectedBaseVersion => {
    this.setState({
      selectedBaseVersion
    });
  };

  onUpdateAppId = evt => {
    const {
      dispatch,
      app,
      project
    } = this.props;

    dispatch(
      projectActions.saveApp(
        project,
        app.set('name', evt.target.value)
      )
    );
  };

  onUpdateVersionName = evt => {
    this.setState({
      versionName: evt.target.value
    });
  };

  onUpdateVersionDescription = evt => {
    this.setState({
      versionDescription: evt.target.value
    });
  };

  onCreateNewVersion = () => {
    const { dispatch, app, match } = this.props;
    const { versionName, versionDescription, selectedBaseVersion } = this.state;
    const { orgId, projectId, appId } = match.params;

    dispatch(
      userAppVersionsActions.create(
        orgId,
        projectId,
        appId,
        versionName,
        versionDescription,
        app.getIn(['publishedVersions', selectedBaseVersion])
      )
    );

    this.onCloseNewVersionDialog();
  };
}

export default withRouter(
  connect(
    ({ project, editor, userAppVersions }) => ({
      project: project.get('project'),
      app: editor.get('app'),
      isLoading: userAppVersions.get('isLoading'),
      error: userAppVersions.get('error'),
      userAppVersions: userAppVersions.get('userAppVersions')
    })
  )(BasicInfoEditor)
);
