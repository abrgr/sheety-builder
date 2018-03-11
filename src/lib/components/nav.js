import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import Avatar from 'material-ui/Avatar';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import { white } from 'material-ui/styles/colors';

export default class Nav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMainMenuOpen: false
    };
  }

  render() {
    const { rightMenuItems, leftMenuItems, title, displayName, email, photoURL } = this.props;
    const { isMainMenuOpen } = this.state

    return (
      <div>
        <AppBar
          title={title}
          onLeftIconButtonClick={this.onToggleMenu}
          showMenuIconButton={!!leftMenuItems && !!leftMenuItems.length}
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
              {rightMenuItems && rightMenuItems.length
                ? (
                  <IconMenu
                    iconButtonElement={
                      <IconButton>
                        <MoreVertIcon color={white}/>
                      </IconButton>
                    }>
                    {rightMenuItems}
                  </IconMenu>
                ) : null}
            </div>
          )} />
        <Drawer
          onItemClick={() => this.setState({ isMainMenuOpen: false })}
          disableSwipeToOpen={!leftMenuItems || !leftMenuItems.length}
          open={isMainMenuOpen}>
          <AppBar
            title={title}
            onLeftIconButtonClick={this.onToggleMenu}
            iconElementLeft={(
              <IconButton>
                <BackIcon color={white} />
              </IconButton>
            )} />
          {leftMenuItems}
        </Drawer>
      </div>
    );
  }

  onToggleMenu = () => {
    this.setState({
      isMainMenuOpen: !this.state.isMainMenuOpen
    });
  };
}
