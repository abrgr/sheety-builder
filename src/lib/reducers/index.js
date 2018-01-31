import { combineReducers } from 'redux';
import auth from './auth';
import importer from './importer';

const reducers = combineReducers({
  auth,
  importer
});

export default reducers;
