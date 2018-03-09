import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Router from './lib/router';
import reducers from './lib/reducers';

import 'bootstrap/dist/css/bootstrap-grid.css';
import 'firebaseui/dist/firebaseui.css';
import 'react-quill/dist/quill.snow.css';

class App extends Component {
  render() {
    const store = createStore(
      reducers,
      applyMiddleware(thunk)
    );
    return (
      <Provider store={store}>
        <MuiThemeProvider>
          <Router />
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default App;
