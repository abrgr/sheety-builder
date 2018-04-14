import { Record, List } from 'immutable';
import * as actions from '../actions';
import { Project } from '../models';

const initialState = new Record({
  isLoading: false,
  error: null,
  projects: null,
  invitations: null
})();

export default function projects(state = initialState, action) {
  switch ( action.type ) {
    case actions.REQUESTED_PROJECTS:
      return initialState.set('isLoading', true);
    case actions.ERRORED_PROJECTS:
      return initialState.set('error', action.error);
    case actions.RECEIVED_PROJECTS:
      return initialState.merge({
        projects: action.projects,
        invitations: action.invitations
      });
    case actions.RECEIVED_SHARE_APP_VERSION:
      return state.update('projects', projects => (
        projects.map(project => (
          project.get('id') === action.project.get('id')
            ? new Project(action.project)
            : project
        ))
      ));
    case actions.RECEIVED_SAVE_PROJECT:
      // add any new projects to our list
      const projects = state.projects || new List();
      const prjIdx = projects.findIndex(p => (
        p.get('id') === action.project.get('id')
      ));
      return prjIdx >= 0
           ? state.setIn(['projects', prjIdx], action.project)
           : state.update('projects', p => (
               p ? p.unshift(action.project) : List.of(action.project)
             ));
    default:
      return state;
  }
}
