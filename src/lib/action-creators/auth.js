import { RECEIVED_AUTH_STATUS } from '../actions';

export function receiveAuthStatus(isSignedIn) {
  return {
    type: RECEIVED_AUTH_STATUS,
    isSignedIn
  };
}
