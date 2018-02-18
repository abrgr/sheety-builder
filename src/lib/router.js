import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Auth from './containers/auth';
import Importer from './containers/importer';
import Editor from './containers/editor';

function Router({ isSignedIn }) {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path="/"
          component={isSignedIn ? Importer : Auth} />
        <Route
          exact
          path="/:spreadsheetId"
          component={Editor} />
      </Switch>
    </BrowserRouter>
  );
}

export default connect(
  ({ auth }) => ({
    isSignedIn: auth.get('isSignedIn'),
    isLoading: auth.get('isLoading')
  })
)(Router);
