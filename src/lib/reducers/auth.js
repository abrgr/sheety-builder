import { Record } from 'immutable';
import * as actions from '../actions';

const initialState = new Record({
  isLoading: true,
  isSignedIn: false,
  displayName: null,
  email: null,
  photoURL: null,
  uid: null
})();

export default function auth(state = initialState, action) {
  switch ( action.type ) {
    case actions.RECEIVED_AUTH_STATUS:
      return state.merge({
        isLoading: false,
        isSignedIn: !!action.uid,
        displayName: action.displayName,
        email: action.email,
        photoURL: action.photoURL,
        uid: action.uid
      });
    default:
      return state;
  }
}
