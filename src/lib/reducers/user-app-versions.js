import { Record } from 'immutable';
import * as actions from '../actions';

const initialState = new Record({
  isLoading: false,
  error: null,
  userAppVersions: null
})();

export default function userAppVersions(state = initialState, action) {
  switch ( action.type ) {
    case actions.REQUESTED_LOAD_USER_APP_VERSIONS:
      return state.merge({
        isLoading: true,
        error: null
      });
    case actions.ERRORED_LOAD_USER_APP_VERSIONS:
      return state.merge({
        isLoading: false,
        error: action.error
      });
    case actions.RECEIVED_LOAD_USER_APP_VERSIONS:
      return initialState.set('userAppVersions', action.userAppVersions);
    default:
      return state;
  }
}
