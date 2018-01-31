import cfg from '../config';

let gapi = null;
const loadedPromise = new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = 'https://apis.google.com/js/api.js';
  script.onload = () => {
    gapi = window.gapi;
    gapi.load('client:auth2', () => {
      gapi.client.init({
        'apiKey': cfg.googleApiKey,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        'clientId': cfg.googleClientId,
        'scope': 'https://www.googleapis.com/auth/spreadsheets.readonly'
      }).then(() => {
        resolve(gapi);
      });
    });
  };
  script.onerror = () => {
    reject();
  };
  document.body.appendChild(script);
});

function getGapi() {
  if ( gapi ) {
    return Promise.resolve(gapi);
  }
  return loadedPromise;
}

let onAuthFns = [];
let isSignedIn = null;
export function onAuth(handler) {
  if ( isSignedIn !== null ) {
    return handler(isSignedIn);
  }

  onAuthFns.push(handler);
}

export function removeOnAuth(handler) {
  onAuthFns = onAuthFns.filter(f => f === handler);
}

function fireAuth(_isSignedIn) {
  isSignedIn = _isSignedIn;
  onAuthFns.forEach((fn) => fn(isSignedIn));
}

export function authorize() {
  return getGapi().then((gapi) => (
    new Promise((resolve, reject) => {
      const auth = gapi.auth2.getAuthInstance();
      onAuth(resolve);
      auth.isSignedIn.listen(fireAuth);

      if ( auth.isSignedIn.get() ) {
        fireAuth(true);
      } else {
        auth.signIn();
      }
    })
  ));
}

export function getSpreadsheet(spreadsheetId) {
  return getGapi().then((gapi) => (
    new Promise((resolve, reject) => {
      gapi.client.sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: true
      }).then(
        (response) => {
          if ( response.status === 200 ) {
            return resolve(response.result);
          }

          return reject(response);
        },
        reject
      );
    })
  ));
}
