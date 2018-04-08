import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import HomeIcon from 'material-ui/svg-icons/action/home';
import BasicIcon from 'material-ui/svg-icons/action/list';
import PresentationIcon from 'material-ui/svg-icons/action/view-quilt';
import LogicIcon from 'material-ui/svg-icons/device/developer-mode';
import PreviewIcon from 'material-ui/svg-icons/navigation/fullscreen';
import { editorActions } from '../action-creators';
import Nav from '../components/nav';

class EditorNav extends Component {
  render() {
    const { app, match, displayName, email, photoURL } = this.props;
    const page = match && match.params.page;
    const orgPrefix = app.get('orgName')
                    ? (app.get('orgName') + ' > ')
                    : '';

    return (
      <Nav
        ref={nav => { this.nav = nav; }}
        title={`${orgPrefix}${app.get('name')}`}
        displayName={displayName}
        email={email}
        photoURL={photoURL}
        rightMenuItems={[
          <MenuItem
            key="save"
            primaryText="Save"
            onClick={this.onSave} />,
          <MenuItem
            key="publish"
            primaryText="Publish" />
        ]}
        leftMenuItems={[
          <MenuItem
            key="home"
            insetChildren={true}
            onClick={() => { this.props.history.push('/'); }}
            rightIcon={<HomeIcon />}>
            Home
          </MenuItem>,
          <MenuItem
            key="basic"
            insetChildren={true}
            onClick={this.onNavTo.bind(null, 'basic')}
            rightIcon={<BasicIcon />}
            checked={page === 'basic'}>
            Basic setup
          </MenuItem>,
          <MenuItem
            key="logic"
            insetChildren={true}
            onClick={this.onNavTo.bind(null, 'logic')}
            rightIcon={<LogicIcon />}
            checked={page === 'logic'}>
            Logic editor
          </MenuItem>,
          <MenuItem
            key="presentation"
            insetChildren={true}
            onClick={this.onNavTo.bind(null, 'presentation')}
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
      spreadsheetId,
      model,
      presenter,
      dispatch
    } = this.props;
    
    dispatch(editorActions.save(appVersion, spreadsheetId, model, presenter));
  };
}

export default withRouter(
  connect(
    ({ auth, project, editor }) => ({
      project: project.get('project'),
      app: editor.get('app'),
      appVersion: editor.get('appVersion'),
      model: editor.get('model'),
      presenter: editor.get('presenter'),
      spreadsheetId: editor.get('spreadsheetId'),
      displayName: auth.get('displayName'),
      email: auth.get('email'),
      photoURL: auth.get('photoURL')
    })
  )(EditorNav)
);
