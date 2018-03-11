import { combineReducers } from 'redux';
import auth from './auth';
import editor from './editor';
import projects from './projects';
import project from './project';

const reducers = combineReducers({
  auth,
  editor,
  projects,
  project
});

export default reducers;
