import { Record, List } from 'immutable';
import * as actions from '../actions';

const initialState = new Record({
  isLoading: false,
  error: null,
  projects: new List(),
  invitations: new List()
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
    case actions.RECEIVED_SAVE_PROJECT:
      // add any new projects to our list
      const prjIdx = state.projects.findIndex(p => (
        p.get('id') === action.project.get('id')
      ));
      return prjIdx >= 0
           ? state.setIn(['projects', prjIdx], action.project)
           : state.update('projects', p => p.unshift(action.project));
    default:
      return state;
  }
}
