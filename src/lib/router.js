import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
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
import { projectsActions, projectActions, userAppVersionsActions, editorActions } from './action-creators';

const IfSignedIn = ({ isSignedIn, children }) => (
  isSignedIn
    ? children
    : (
      <Auth />
    )
);

class Loader extends Component {
  componentDidMount() {
    const { requiresLoad, getLoadAction, dispatch } = this.props;

    if ( requiresLoad(this.props) ) {
      dispatch(getLoadAction(this.props));
    }
  }

  componentWillReceiveProps(nextProps) {
    const { requiresReload, getLoadAction, dispatch } = nextProps;

    if ( requiresReload(nextProps, this.props) ) {
      dispatch(getLoadAction(this.props));
    }
  }

  render() {
    const { requiresLoad, isLoading, children } = this.props;

    if ( requiresLoad(this.props) || isLoading ) {
      return null;
    }

    return children;
  }
}

const ProjectsLoader = connect(
  ({ auth, projects }) => ({
    uid: auth.get('uid'),
    email: auth.get('email'),
    isLoading: projects.get('isLoading'),
    error: projects.get('error'),
    projects: projects.get('projects'),
    invitations: projects.get('invitations')
  })
)(props => (
  <Loader
    {...props}
    requiresLoad={({
      error,
      isLoading,
      projects,
      invitations
    }) => (
      !error && !isLoading && !projects && !invitations
    )}
    requiresReload={({ uid, email }, { uid: prevUid, email: prevEmail }) => (
      uid !== prevUid || email !== prevEmail
    )}
    getLoadAction={({ uid, email }) => (
      projectsActions.requestProjects(uid, email)
    )} />
));

const ProjectLoader = withRouter(
  connect(
    ({ auth, project, projects }) => ({
      uid: auth.get('uid'),
      email: auth.get('email'),
      isLoading: project.get('isLoading'),
      error: project.get('error'),
      project: project.get('project'),
      projects: projects.get('projects')
    })
  )(props => (
    <Loader
      {...props}
      requiresLoad={({
        error,
        isLoading,
        project,
        match
      }) => (
        !error && !isLoading && match.params.projectId !== project.get('id')
      )}
      requiresReload={({ match, uid, email }, { match: prevMatch, uid: prevUid, email: prevEmail }) => (
        match.params.projectId !== prevMatch.params.projectId
          || uid !== prevUid || email !== prevEmail
      )}
      getLoadAction={({ match, projects }) => (
        projectActions.load(
          projects,
          match.params.orgId,
          match.params.projectId
        )
      )} />
  ))
);

const AppLoader = withRouter(
  connect(
    ({ project, editor }) => ({
      project: project.get('project'),
      app: editor.get('app')
    })
  )(props => (
    <Loader
      {...props}
      requiresLoad={({ match, app }) => (
        match.params.appId !== app.get('id')
      )}
      requiresReload={({ match, uid, email }, { match: prevMatch, uid: prevUid, email: prevEmail }) => (
        match.params.appId !== prevMatch.params.appId || uid !== prevUid || email !== prevEmail
      )}
      getLoadAction={({ match, project, app }) => (
        editorActions.setApp(
          project.apps.find(app => app.get('id') === match.params.appId)
        )
      )} />
  ))
);

const EditorLoader = withRouter(
  connect(
    ({ project, editor, userAppVersions }) => ({
      isLoading: userAppVersions.get('isLoading'),
      error: userAppVersions.get('error'),
      userAppVersions: userAppVersions.get('userAppVersions')
    })
  )(props => (
    <Loader
      {...props}
      requiresLoad={({
        isLoading,
        error,
        userAppVersions,
        match
      }) => (
        !isLoading && !error && (!userAppVersions || match.params.appId !== userAppVersions.get('appId'))
      )}
      requiresReload={({ match, uid, email }, { match: prevMatch, uid: prevUid, email: prevEmail }) => (
        match.params.appId !== prevMatch.params.appId || uid !== prevUid || email !== prevEmail
      )}
      getLoadAction={({ match }) => (
        userAppVersionsActions.loadUserAppVersions(
          match.params.orgId,
          match.params.projectId,
          match.params.appId
        )
      )} />
  ))
);

function Router({ isSignedIn }) {
  return (
    <BrowserRouter>
      <IfSignedIn
        isSignedIn={isSignedIn}>
        {/**
          * Loaders.
          **/}
        <Route
          path={projectRoutes.list()}
          render={props => (
            <ProjectsLoader {...props}>
              <Route
                path={projectRoutes.project(':orgId', ':projectId')}
                render={props => (
                  <ProjectLoader {...props}>
                    <Route
                      path={editorRoutes.tab(':orgId', ':projectId', ':appId', ':page')}
                      render={props => (
                        <AppLoader {...props}>
                          <EditorLoader {...props} />
                        </AppLoader>
                      )} />
                  </ProjectLoader>
                )} />
            </ProjectsLoader>
          )} />

        {/**
          * Top navigation elements.  Order matters.
          **/}
        <Switch>
          <Route
            path={editorRoutes.tab(':orgId', ':projectId', ':appId', ':page')}
            component={EditorNav} />
          <Route
            path={projectRoutes.project(':orgId', ':projectId')}
            component={ProjectsNav} />
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
