import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import { projectRoutes } from '../routes';
import Nav from '../components/nav';

class ProjectsNav extends Component {
  render() {
    const { match, displayName, email, photoURL } = this.props;
    const path = match && match.path;
    const listPath = projectRoutes.list();

    return (
      <Nav
        ref={nav => { this.nav = nav; }}
        title="Projects"
        displayName={displayName}
        email={email}
        photoURL={photoURL}
        leftMenuItems={[
          <MenuItem
            key="all"
            insetChildren={true}
            onClick={this.onNavTo.bind(null, listPath)}
            checked={path === listPath}>
            All projects
          </MenuItem>
        ]} />
    );
  }

  onNavTo = (route) => {
    const { history } = this.props;
    history.push(route);

    // TODO: this is super ugly
    if ( this.nav ) {
      this.nav.onToggleMenu();
    }
  };
}

export default withRouter(
  connect(
    ({ auth }) => ({
      displayName: auth.get('displayName'),
      email: auth.get('email'),
      photoURL: auth.get('photoURL') 
    })
  )(ProjectsNav)
);
