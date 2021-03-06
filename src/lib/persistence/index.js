import firebase from '../firebase';
import ensureAuthenticated from '../ensure-authenticated';
import EventEmitter from 'events';
import projectMaker from './project';
import userAppVersionsMaker from './user-app-versions'

const auth = firebase.auth();
const db = firebase.firestore();

const signIn = () => {
  window.location = '/';
};

const getUid = uid => uid ? Promise.resolve(uid) : ensureAuthenticated(false, signIn);

export function updateUserConfig(cfg) {
  return getUid().then(uid => (
      db.collection('user-config')
        .doc(uid)
        .set(cfg, { merge: true })
    )).catch(err => {
      console.error('Failed to set user config', err);
      throw err;
    });
}

export const project = projectMaker(getUid);

export const userAppVersions = userAppVersionsMaker(getUid);

export const accessTokenEvents = listenForAccessTokens();

function listenForAccessTokens() {
  const tokenEmitter = new EventEmitter();

  let unsubscribe = null;
  auth.onAuthStateChanged((user) => {
    if ( unsubscribe ) {
      unsubscribe();
    }

    if ( !user ) {
      return;
    }

    unsubscribe = db.collection('user-config')
      .doc(user.uid)
      .onSnapshot((snapshot) => {
        const accessToken = snapshot.get('googleAccessToken');
        tokenEmitter.emit('token', accessToken);
      });
  });

  return tokenEmitter;
}
