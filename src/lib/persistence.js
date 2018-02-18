import firebase from './firebase';
import ensureAuthenticated from './ensure-authenticated';
import EventEmitter from 'events';

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const signIn = () => {
  window.location = '/';
};

export function updateUserConfig(cfg) {
  return ensureAuthenticated(false, signIn)
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

export function saveApp(appId, spreadsheetId, model, presenter) {
  return ensureAuthenticated(false, signIn)
    .then(uid => (
      storage.ref()
             .child(`apps/${uid}/${appId}`)
             .putString(
               JSON.stringify({
                 appId,
                 spreadsheetId,
                 model: model && model.toJS(),
                 presenter: presenter && presenter.toJS()
               }),
               'raw',
               {
                 contentType: 'application/json'
               }
             )
    ));
}

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