import React from 'react';
import { connect } from 'react-redux';
import Auth from './containers/auth';
import Importer from './containers/importer';
import { BrowserRouter, Route } from 'react-router-dom';

function Router({ isSignedIn }) {
  return (
    <BrowserRouter>
      {isSignedIn
        ? renderLogin()
        : renderImporter()}
    </BrowserRouter>
  );
}

function renderLogin() {
  return (
    <Route
      path="/"
      component={Auth} />
  );
}

function renderImporter() {
  return (
    <Route
      path="/"
      component={Importer} />
  );
}

export default connect(
  ({ auth }) => ({
    isSignedIn: auth.get('isSignedIn'),
    isLoading: auth.get('isLoading')
  })
)(Router);
