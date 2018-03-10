import React, { Component } from 'react';
import firebaseui from 'firebaseui';
import uuid from 'uuid';
import URL from 'url';
import { connect } from 'react-redux';
import { authActions } from '../action-creators';
import { ensureHaveAuthState } from '../ensure-authenticated';
import firebase from '../firebase';
import { updateUserConfig } from '../persistence';

import 'firebaseui/dist/firebaseui.css';

const auth = firebase.auth();

class Auth_ extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: `auth-${uuid.v4()}` // element ids must start with a letter
    };
  }

  authenticated = (user, googleAccessToken) => {
    const p = googleAccessToken
            ? updateUserConfig({ googleAccessToken })
            : Promise.resolve();
    p.then(_ => this.props.dispatch(authActions.setLoggedInUser(user.displayName, user.email, user.photoURL, user.uid)));
  };

  isAuthenticated = () => (
    // TODO: check roles, etc.
    auth.currentUser && !auth.currentUser.isAnonymous
  );

  componentDidMount() {
    ensureHaveAuthState.then(() => {
      if ( this.isAuthenticated() ) {
        return this.authenticated(auth.currentUser);
      }

      // not authenticated yet
      const ui = new firebaseui.auth.AuthUI(auth);
      ui.start(
        `#${this.state.id}`,
        {
          autoUpgradeAnonymousUsers: true,
          signInSuccessUrl: URL.resolve(window.location.href, '/'),
          tosUrl: 'https://www.sheetyapp.com/tos',
          signInOptions: [
            {
              provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              scopes: [
                'https://www.googleapis.com/auth/spreadsheets.readonly'
              ]
            }
          ],
          callbacks: {
            signInSuccess: (user, cred, redirectUrl) => {
              if ( cred && cred.providerId === 'google.com' ) {
                this.authenticated(user, cred.accessToken)
              }
            },
            signInFailure: (err) => {
              if ( err.code !== 'firebaseui/anonymous-upgrade-merge-conflict' ) {
                return Promise.resolve();
              }

              const anonymousUser = auth.currentUser;
              const cred = err.credential;

              // TODO: actually copy data per https://github.com/firebase/firebaseui-web#using-firebaseui-for-authentication

              return auth.signInWithCredential(cred)
                         .then(_ => anonymousUser.delete())
                         .then(_ => this.authenticated(cred.accessToken));
            }
          }
        }
      );
    });
  }

  render() {
    const { id } = this.state;

    return (
      <div id={id} />
    );
  }
};

const Auth = connect(
  ({ auth }) => ({
    isSignedIn: auth.get('isSignedIn')
  })
)(Auth_);

export default Auth;
