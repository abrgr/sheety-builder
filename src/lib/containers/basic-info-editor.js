import React, { Component } from 'react';
import url from 'url';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import { GridList, GridTile } from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import CreateImg from 'material-ui/svg-icons/content/add-circle';
import OpenImg from 'material-ui/svg-icons/action/open-in-new';
import DeployImg from 'material-ui/svg-icons/communication/present-to-all';
import { lightBlue400 } from 'material-ui/styles/colors';
import CircularProgress from 'material-ui/CircularProgress';
import Loader from '../components/loader';
import ErrorMsg from '../components/error-msg';
import { userAppVersionsActions, projectActions } from '../action-creators';
import { editorRoutes } from '../routes';

const InProgressItems = ({ userAppVersions, onEditVersion }) => {
  if ( !userAppVersions || userAppVersions.isEmpty() ) {
    return null;
  }

  return (
    <GridList
      style={{
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto'
      }}>
      {userAppVersions.entrySeq().map(([name, appVersion]) => (
        <GridTile
          key={name}
          actionIcon={
            <IconButton
              onClick={onEditVersion.bind(null, name)}>
              <OpenImg color="white" />
            </IconButton>
          }
          title={`${name} (${appVersion.get('baseName') ? `Based on ${appVersion.get('baseName')}` : 'From scratch'})`} />
      ))}
    </GridList>
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
      selectedBaseVersion: null,
      showPublishDialog: false,
      versionNameToPublish: null
    };
  }

  render() {
    const {
      project,
      app,
      error,
      isLoading,
      userAppVersions,
      isPublishing,
      publishError
    } = this.props;

    const {
      showNewVersionDialog,
      versionName,
      versionDescription,
      selectedBaseVersion,
      showPublishDialog,
      versionNameToPublish,
    } = this.state;

    const paperStyle = {
      padding: 20,
      margin: 20
    };

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
                disabled={!versionName || !selectedBaseVersion}
                icon={isLoading
                       ? (
                         <CircularProgress
                            mode='indeterminate' />
                       ) : null}
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
              fullWidth={true}
              floatingLabelText="Version name"
              value={versionName}
              onChange={this.onUpdateVersionName} />
          </div>
          <div>
            <TextField
              fullWidth={true}
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
            {app.get('sharedVersions').entrySeq().map(([sharedVersionName, sharedVersion]) => (
              <GridTile
                key={sharedVersionName}
                style={{
                  backgroundColor: sharedVersionName === selectedBaseVersion ? lightBlue400 : undefined
                }}
                onClick={this.onSelectBaseVersion.bind(null, sharedVersionName)}
                title={sharedVersionName} />
            ))}
          </GridList>
        </Dialog>
        <Dialog
          title='Publish app'
          actions={[
            (
              <FlatButton
                label="Cancel"
                onClick={this.onClosePublishDialog} />
            ),
            (
              <FlatButton
                label="Publish"
                disabled={!versionNameToPublish || isPublishing}
                primary={true}
                icon={<DeployImg />}
                onClick={this.onPublish} />
            )
          ]}
          open={showPublishDialog}
          onRequestClose={this.onClosePublishDialog}
          autoScrollBodyContent={true}>
          <p>
            Publish a new version of your app.
          </p>
          {isPublishing
            ? (
              <div>
                <strong>Publishing...</strong>
                <Loader />
              </div>
            ) : (
              <div>
                {publishError
                  ? (
                    <ErrorMsg
                      msg="Sorry, failed to publish your app." />
                  ) : null}
                <GridList
                  style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    overflowX: 'auto'
                  }}>
                  {app.get('sharedVersions').entrySeq().map(([name, appVersion]) => (
                    <GridTile
                      key={name}
                      style={{
                        backgroundColor: versionNameToPublish === name ? lightBlue400 : undefined
                      }}
                      onClick={this.onSelectVersionToPublish.bind(null, name)}
                      title={`Publish ${name}`} />
                  ))}
                </GridList>
              </div>
            )}
        </Dialog>
        <Paper
          style={paperStyle}>
          <p>
            You're ready to make an app!
          </p>
          <TextField
            fullWidth
            floatingLabelText="App Name"
            value={app.get('name', '')}
            onChange={this.onUpdateAppName} />
          {app.platformInfo().get('hasWebRoot')
            ? (
              <TextField
                fullWidth
                floatingLabelText="Web Root"
                value={app.get('webRoot') || ''}
                onChange={this.onUpdateWebRoot} />
            ) : null}
          {!!error
            ? (
              <ErrorMsg
                msg="An error occured!" />
            ) : null}
          {isLoading
            ? (
              <Loader />
            ) : null}
        </Paper>
        <Paper
          style={paperStyle}>
          <h2>Current Deployment</h2>
          {app.get('liveVersion')
            ? (
              <div>
                <p>
                  <strong>{app.getIn(['liveVersion', 'appVersion', 'name'])}</strong> last deployed on {app.getIn(['liveVersion', 'initiatedAt']).toLocaleString()}
                </p>
                {!!project.get('domain')
                  ? (
                    <p>
                      <a
                        target="_blank"
                        href={url.resolve(`http://${project.get('domain')}`, app.get('webRoot') || '')}>
                        Launch app
                      </a>
                    </p>
                  ) : null}
              </div>
            ) : (
              <p>
                You haven't deployed this app yet.
              </p>
            )}
          <RaisedButton
            label="Publish a new version"
            primary
            icon={<DeployImg color="white" />}
            onClick={this.onShowPublishDialog} />
        </Paper>
        <Paper
          style={paperStyle}>
          <h2>Ongoing Work</h2>
          <InProgressItems
            onEditVersion={this.onEditVersion}
            userAppVersions={userAppVersions} />
          <FlatButton
            label='Start working'
            labelPosition='after'
            onClick={this.onShowNewVersionDialog}
            primary
            icon={<CreateImg />} />
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

  onUpdateAppName = evt => {
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

  onUpdateWebRoot= evt => {
    const {
      dispatch,
      app,
      project
    } = this.props;

    dispatch(
      projectActions.saveApp(
        project,
        app.set('webRoot', evt.target.value)
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
    const { dispatch, app, history, match } = this.props;
    const { versionName, versionDescription, selectedBaseVersion } = this.state;
    const { orgId, projectId, appId } = match.params;

    dispatch(
      userAppVersionsActions.create(
        orgId,
        projectId,
        appId,
        versionName,
        versionDescription,
        app.getIn(['sharedVersions', selectedBaseVersion])
      )
    ).then(() => {
      history.push(
        editorRoutes.default(
          orgId,
          projectId,
          appId,
          versionName
        )
      );
    });
  };

  onEditVersion = appVersionName => {
    const { history, match } = this.props;

    history.push(
      editorRoutes.default(match.params.orgId, match.params.projectId, match.params.appId, appVersionName)
    );
  };

  onShowPublishDialog = () => {
    this.setState({
      showPublishDialog: true
    });
  };

  onClosePublishDialog = () => {
    this.setState({
      showPublishDialog: false
    });
  };

  onSelectVersionToPublish = versionNameToPublish => {
    this.setState({
      versionNameToPublish
    });
  };

  onPublish = () => {
    const { dispatch, project, app } = this.props;
    const { versionNameToPublish } = this.state;

    dispatch(
      userAppVersionsActions.publish(
        project.get('orgId'),
        project.get('id'),
        app.get('id'),
        app.getIn(['sharedVersions', versionNameToPublish, 'versionId'])
      )
    ).then(() => {
      this.onClosePublishDialog();
    }).catch(err => {
      // just swallow, we'll show the error
    });
  };
};

export default withRouter(
  connect(
    ({ project, editor, userAppVersions }) => ({
      project: project.get('project'),
      app: editor.get('app'),
      isLoading: userAppVersions.get('isLoading'),
      error: userAppVersions.get('error'),
      userAppVersions: userAppVersions.get('userAppVersions'),
      isPublishing: userAppVersions.get('isPublishing'),
      publishError: userAppVersions.get('publishError')
    })
  )(BasicInfoEditor)
);
