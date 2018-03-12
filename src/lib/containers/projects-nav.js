import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import { projectRoutes } from '../routes';
import Nav from '../components/nav';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';

class ProjectsNav extends Component {
  render() {
    const {
      match,
      displayName,
      email,
      photoURL,
      projects,
      project
    } = this.props;
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
            rightIcon={<ArrowDropRight />}
            menuItems={[
              <MenuItem
                primaryText="All"
                insetChildren={true}
                checked={path === listPath}
                onClick={this.onNavTo.bind(null, listPath)} />
            ].concat(
              projects.map(p => {
                const projectRoute = projectRoutes.project(p.get('orgId'), p.get('id'));
                return (
                  <MenuItem
                    key={p.get('id')}
                    primaryText={p.get('name')}
                    insetChildren={true}
                    checked={path === projectRoute}
                    onClick={this.onNavTo.bind(null, projectRoute)} />
                );
              }).toJS()
            )}>
            Projects
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
    ({ auth, projects, project }) => ({
      displayName: auth.get('displayName'),
      email: auth.get('email'),
      photoURL: auth.get('photoURL'),
      projects: projects.get('projects'),
      project: project.get('project')
    })
  )(ProjectsNav)
);
