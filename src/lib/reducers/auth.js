import { Record } from 'immutable';
import * as actions from '../actions';

const initialState = new Record({
  isLoading: true,
  isSignedIn: false
})();

export default function auth(state = initialState, action) {
  switch ( action.type ) {
    case actions.RECEIVED_AUTH_STATUS:
      return state.set({
        isLoading: false,
        isSignedIn: action.isSignedIn
      });
    default:
      return state;
  }
}
