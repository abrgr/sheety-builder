import { combineReducers } from 'redux';
import auth from './auth';
import importer from './importer';
import editor from './editor';

const reducers = combineReducers({
  auth,
  importer,
  editor
});

export default reducers;
