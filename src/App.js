import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import Router from './lib/router';
import reducers from './lib/reducers';

import 'bootstrap/dist/css/bootstrap-grid.css';
import 'firebaseui/dist/firebaseui.css';

class App extends Component {
  render() {
    const store = createStore(
      reducers,
      applyMiddleware(thunk)
    );
    return (
      <Provider store={store}>
        <Router />
      </Provider>
    );
  }
}

export default App;
