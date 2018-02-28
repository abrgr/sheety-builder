import { combineReducers } from 'redux';
import auth from './auth';
import editor from './editor';

const reducers = combineReducers({
  auth,
  editor
});

export default reducers;
