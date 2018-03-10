import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import IconButton from 'material-ui/IconButton';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Avatar from 'material-ui/Avatar';
import IconMenu from 'material-ui/IconMenu';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { white } from 'material-ui/styles/colors';
import { editorActions } from '../action-creators';

class EditorNav extends Component {
  render() {
    const { appId, isMainMenuOpen, match, displayName, email, photoURL } = this.props;
    const page = match && match.params.page;

    return (
      <div>
        <AppBar
          title={appId}
          onLeftIconButtonClick={this.onToggleMenu}
          iconElementRight={(
            <div>
              {!!photoURL
                ? (
                  <Avatar
                    src={photoURL} />
                ): (
                  <Avatar>
                    {displayName
                      ? displayName[0]
                      : (email ? email[0] : 'U')}
                  </Avatar>
                )}
              <IconMenu
                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}>
                <MenuItem
                  primaryText="Save"
                  onClick={this.onSave} />
                <MenuItem
                  primaryText="Publish" />
              </IconMenu>
            </div>
          )} />
        <Drawer
          open={isMainMenuOpen}>
          <AppBar
            title={appId}
            onLeftIconButtonClick={this.onToggleMenu}
            iconElementLeft={(
              <IconButton>
                <BackIcon color={white} />
              </IconButton>
            )} />
          <MenuItem
            insetChildren={true}
            onClick={this.onNavTo.bind(null, 'basic')}
            checked={page === 'basic'}>
            Basic setup
          </MenuItem>
          <MenuItem
            insetChildren={true}
            onClick={this.onNavTo.bind(null, 'logic')}
            checked={page === 'logic'}>
            Logic editor
          </MenuItem>
          <MenuItem
            insetChildren={true}
            onClick={this.onNavTo.bind(null, 'presentation')}
            checked={page === 'presentation'}>
            Presentation editor
          </MenuItem>
          <MenuItem
            insetChildren={true}
            onClick={this.onNavTo.bind(null, 'preview')}
            checked={page === 'preview'}>
            Full Preview
          </MenuItem>
        </Drawer>
      </div>
    );
  }

  onNavTo = (page) => {
    const { history } = this.props;
    history.push(page);
    this.onToggleMenu();
  };

  onToggleMenu = () => {
    const { dispatch } = this.props;
    dispatch(editorActions.toggleMainMenu());
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

export default withRouter(
  connect(
    ({ auth, editor }) => ({
      appId: editor.get('appId') || 'Your app',
      isMainMenuOpen: editor.get('isMainMenuOpen'),
      model: editor.get('model'),
      presenter: editor.get('presenter'),
      spreadsheetId: editor.get('spreadsheetId'),
      displayName: auth.get('displayName'),
      email: auth.get('email'),
      photoURL: auth.get('photoURL') 
    })
  )(EditorNav)
);
