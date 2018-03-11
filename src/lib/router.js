import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Auth from './containers/auth';
import Importer from './containers/importer';
import PresenterEditor from './containers/presenter-editor';
import BasicInfoEditor from './containers/basic-info-editor';
import EditorNav from './containers/editor-nav';
import ProjectsNav from './containers/projects-nav';
import ProjectList from './containers/project-list';
import Project from './containers/project';
import { projectRoutes, editorRoutes } from './routes';

const IfSignedIn = ({ isSignedIn, children }) => (
  isSignedIn
    ? children
    : (
      <Auth />
    )
);

function Router({ isSignedIn }) {
  return (
    <BrowserRouter>
      <IfSignedIn
        isSignedIn={isSignedIn}>
        {/**
          * Top navigation elements.  Order matters.
          **/}
        <Switch>
          <Route
            path={editorRoutes.tab(':orgId', ':projectId', ':appId', ':page')}
            component={EditorNav} />
          <Route
            path={projectRoutes.list()}
            component={ProjectsNav} />
        </Switch>
        {/**
          * Content elements.  Order should not matter.
          **/}
        <Switch>
          <Route
            exact
            path={projectRoutes.list()}
            component={ProjectList} />
          <Route
            exact
            path={projectRoutes.project(':orgId', ':projectId')}
            component={Project} />
          <Route
            exact
            path={editorRoutes.presentationTab(':orgId', ':projectId', ':appId')}
            component={PresenterEditor} />
          <Route
            exact
            path={editorRoutes.basicTab(':orgId', ':projectId', ':appId')}
            component={BasicInfoEditor} />
          <Route
            exact
            path={editorRoutes.logicTab(':orgId', ':projectId', ':appId')}
            component={Importer} />
        </Switch>
      </IfSignedIn>
    </BrowserRouter>
  );
}

export default connect(
  ({ auth }) => ({
    isSignedIn: auth.get('isSignedIn'),
    isLoading: auth.get('isLoading')
  })
)(Router);
