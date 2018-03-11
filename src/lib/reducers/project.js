import { Record } from 'immutable';
import { Project } from '../models';
import * as actions from '../actions';

const initialState = new Record({
  isLoading: false,
  error: null,
  project: new Project()
})();

export default function project(state = initialState, action) {
  switch ( action.type ) {
    case actions.REQUESTED_SAVE_PROJECT:
      return initialState.set('isLoading', true);
    case actions.ERRORED_SAVE_PROJECT:
      return initialState.set('error', action.error);
    case actions.RECEIVED_SAVE_PROJECT:
      return initialState.set('project', action.project);
    default:
      return state;
  }
}
