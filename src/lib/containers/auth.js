import React, { Component } from 'react';
import { connect } from 'react-redux';
import { authorize, onAuth, removeOnAuth } from '../google';
import SignIn from '../components/sign-in';
import { authActions } from '../action-creators';

class Auth_ extends Component {
  componentDidMount() {
    onAuth(this.setAuth);
  }

  componentWillUnmount() {
    removeOnAuth(this.setAuth);
  }

  render() {
    return (
      <SignIn onSignIn={authorize} />
    );
  }

  setAuth = (isSignedIn) => {
    this.props.dispatch(authActions.receiveAuthStatus(isSignedIn));
  };
}

const Auth = connect(
  ({ auth }) => ({
    isSignedIn: auth.get('isSignedIn'),
    isLoading: auth.get('isLoading')
  })
)(Auth_);

export default Auth;
