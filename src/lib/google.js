import cfg from '../config';
import { accessTokenEvents } from './persistence';

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

accessTokenEvents.on('token', (accessToken) => {
  return getGapi().then((gapi) => {
    gapi.auth.setToken({
      access_token: accessToken
    });
  });
});

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
