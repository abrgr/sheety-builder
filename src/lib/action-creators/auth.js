import { RECEIVED_AUTH_STATUS } from '../actions';

export function setLoggedInUser(displayName, email, photoURL, uid) {
  return {
    type: RECEIVED_AUTH_STATUS,
    displayName,
    email,
    photoURL,
    uid
  };
}
