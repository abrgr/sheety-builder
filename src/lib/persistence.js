import firebase from './firebase';
import ensureAuthenticated from './ensure-authenticated';
import EventEmitter from 'events';

const db = firebase.firestore();
const auth = firebase.auth();

export function updateUserConfig(cfg) {
  return ensureAuthenticated(false, () => window.location = '/')
    .then(uid => (
      db.collection('user-config')
        .doc(uid)
        .set(cfg, { merge: true })
    )).catch(err => {
      console.error('Failed to set user config', err);
      throw err;
    });
}

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
