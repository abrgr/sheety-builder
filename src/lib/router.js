import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Auth from './containers/auth';
import Importer from './containers/importer';
import PresenterEditor from './containers/presenter-editor';
import BasicInfoEditor from './containers/basic-info-editor';
import EditorNav from './containers/editor-nav';
import { editorRoutes } from './routes';

function Router({ isSignedIn }) {
  return (
    <BrowserRouter>
      <div>
        <Route
          path={editorRoutes.tab(':appId', ':page')}
          component={EditorNav} />
        <Switch>
          <Route
            exact
            path="/"
            component={isSignedIn
                        ? (
                          () => (
                            <Redirect to={editorRoutes.basicTab('my-app')} />
                          )
                        ) : Auth} />
          <Route
            exact
            path={editorRoutes.presentationTab(':appId')}
            component={PresenterEditor} />
          <Route
            exact
            path={editorRoutes.basicTab(':appId')}
            component={BasicInfoEditor} />
          <Route
            exact
            path={editorRoutes.logicTab(':appId')}
            component={Importer} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default connect(
  ({ auth }) => ({
    isSignedIn: auth.get('isSignedIn'),
    isLoading: auth.get('isLoading')
  })
)(Router);
