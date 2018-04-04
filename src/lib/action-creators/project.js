import { List } from 'immutable';
import {
  REQUESTED_SAVE_PROJECT,
  RECEIVED_SAVE_PROJECT,
  ERRORED_SAVE_PROJECT,
  REQUESTED_LOAD_PROJECT,
  RECEIVED_LOAD_PROJECT,
  ERRORED_LOAD_PROJECT
} from '../actions';
import { projectRoutes } from '../routes';
import * as persistence from '../persistence';

export function saveProject(project, history) {
  return (dispatch) => {
    dispatch({
      type: REQUESTED_SAVE_PROJECT
    });

    persistence.project.save(project).then(project => {
      dispatch({
        type: RECEIVED_SAVE_PROJECT,
        project: project
      });

      if ( history ) {
        history.push(
          projectRoutes.project(
            project.get('orgId'),
            project.get('id')
          )
        );
      }
    }).catch(err => {
      dispatch({
        type: ERRORED_SAVE_PROJECT,
        error: "Sorry, we couldn't save your project"
      });
    });
  };
}

export function load(projects, orgId, projectId) {
  return (dispatch) => {
    dispatch({
      type: REQUESTED_LOAD_PROJECT
    });

    const fromProjects = (projects || new List()).find(p => (
      p.get('orgId') === orgId && p.get('id') === projectId
    ));

    if ( fromProjects ) {
      return dispatch({
        type: RECEIVED_LOAD_PROJECT,
        project: fromProjects
      });
    }

    persistence.project.load(orgId, projectId).then(project => {
      dispatch({
        type: RECEIVED_LOAD_PROJECT,
        project
      });
    }).catch(err => {
      dispatch({
        type: ERRORED_LOAD_PROJECT,
        error: "Sorry, we couldn't load your project"
      });
    });
  };
}

export function setProjectImage(project, blob) {
  return dispatch => {
    dispatch({
      type: REQUESTED_SAVE_PROJECT
    });

    persistence.project.saveImage(project, blob).then(project => {
      dispatch({
        type: RECEIVED_SAVE_PROJECT,
        project
      });
    }).catch(err => {
      dispatch({
        type: ERRORED_SAVE_PROJECT,
        error: "Sorry, we couldn't save your project"
      });
    });
  };
}

export function saveApp(project, app, imgBlob) {
  return dispatch => {
    dispatch({
      type: REQUESTED_SAVE_PROJECT
    });

    persistence.project.saveApp(app).then(project => {
      dispatch({
        type: RECEIVED_SAVE_PROJECT,
        project
      });
    }).catch(err => {
      dispatch({
        type: ERRORED_SAVE_PROJECT,
        error: "Sorry, we couldn't save your project"
      });
    });
  };
}
