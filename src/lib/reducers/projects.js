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
    default:
      return state;
  }
}
