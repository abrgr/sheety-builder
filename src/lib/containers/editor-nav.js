import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import HomeIcon from 'material-ui/svg-icons/action/home';
import BasicIcon from 'material-ui/svg-icons/action/list';
import PresentationIcon from 'material-ui/svg-icons/action/view-quilt';
import LogicIcon from 'material-ui/svg-icons/device/developer-mode';
import PreviewIcon from 'material-ui/svg-icons/navigation/fullscreen';
import Divider from 'material-ui/Divider';
import { editorActions } from '../action-creators';
import Nav from '../components/nav';
import { editorRoutes, projectRoutes, appRoutes } from '../routes';

class EditorNav extends Component {
  render() {
    const { app, project, appVersion, match, displayName, email, photoURL, isLoading } = this.props;
    const page = match && match.params.page;
    const orgPrefix = app.get('orgName')
                    ? (app.get('orgName') + ' > ')
                    : '';

    const orgId = appVersion.get('orgId');
    const projectId = appVersion.get('projectId');
    const appId = appVersion.get('appId');
    const versionId = appVersion.get('name');

    return (
      <Nav
        ref={nav => { this.nav = nav; }}
        title={isLoading ? '' : `${orgPrefix}${project.get('name')} / ${app.get('name')} / ${appVersion.get('name')}`}
        displayName={displayName}
        email={email}
        photoURL={photoURL}
        rightMenuItems={[
          <MenuItem
            key="save"
            primaryText="Save"
            onClick={this.onSave} />,
          <MenuItem
            key="share"
            primaryText="Share"
            onClick={this.onShare} />
        ]}
        leftMenuItems={[
          <MenuItem
            key="home"
            insetChildren={true}
            onClick={this.onNavTo.bind(null, projectRoutes.list())}
            rightIcon={<HomeIcon />}>
            Home
          </MenuItem>,
          <Divider
            key="home-divider" />,
          <MenuItem
            key="app"
            insetChildren={true}
            onClick={this.onNavTo.bind(null, appRoutes.default(orgId, projectId, appId))}
            rightIcon={<BasicIcon />}
            checked={page === 'basic'}>
            App Home
          </MenuItem>,
          <Divider
            key="app-divider" />,
          <MenuItem
            key="logic"
            insetChildren={true}
            onClick={this.onNavTo.bind(null, editorRoutes.logicTab(orgId, projectId, appId, versionId))}
            rightIcon={<LogicIcon />}
            checked={page === 'logic'}>
            Logic editor
          </MenuItem>,
          <MenuItem
            key="presentation"
            insetChildren={true}
            onClick={this.onNavTo.bind(null, editorRoutes.presentationTab(orgId, projectId, appId, versionId))}
            rightIcon={<PresentationIcon />}
            checked={page === 'presentation'}>
            Presentation editor
          </MenuItem>,
          <MenuItem
            key="preview"
            insetChildren={true}
            onClick={this.onNavTo.bind(null, 'preview')}
            rightIcon={<PreviewIcon />}
            checked={page === 'preview'}>
            Full Preview
          </MenuItem>
        ]} />
    );
  }

  onNavTo = (page) => {
    const { history } = this.props;
    history.push(page);

    // TODO: this is super ugly
    if ( this.nav ) {
      this.nav.onToggleMenu();
    }
  };

  onSave = () => {
    const {
      appVersion,
      model,
      presenter,
      dispatch
    } = this.props;

    dispatch(editorActions.save(appVersion, model, presenter));
  };

  onShare = () => {
    const { dispatch } = this.props;

    dispatch(editorActions.setShowShareVersionDialog(true));
  }
}

export default withRouter(
  connect(
    ({ auth, project, editor }) => ({
      isLoading: project.get('isLoading') || editor.get('isLoading'),
      project: project.get('project'),
      app: editor.get('app'),
      appVersion: editor.get('appVersion'),
      model: editor.get('model'),
      presenter: editor.get('presenter'),
      displayName: auth.get('displayName'),
      email: auth.get('email'),
      photoURL: auth.get('photoURL')
    })
  )(EditorNav)
);
