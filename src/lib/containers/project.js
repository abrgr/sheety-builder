import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

class Project extends Component {
  render() {
    return (
      <p>Hi</p>
    );
  }
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
  )(Project)
);
