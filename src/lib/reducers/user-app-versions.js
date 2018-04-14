import { Record } from 'immutable';
import * as actions from '../actions';

const initialState = new Record({
  isLoading: false,
  error: null,
  appId: null,
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
      return initialState.merge({
        appId: action.appId,
        userAppVersions: action.userAppVersions
      });
    case actions.APP_SAVING_COMPLETED:
      return state.merge({
        userAppVersions: action.userAppVersions
      });
    case actions.RECEIVED_SHARE_APP_VERSION:
      // after a version is shared, we delete the local copy
      return state.update('userAppVersions', userAppVersions => (
        userAppVersions.delete(action.appVersion.get('name'))
      ));
    default:
      return state;
  }
}
