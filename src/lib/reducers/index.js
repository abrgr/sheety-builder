import { combineReducers } from 'redux';
import auth from './auth';
import editor from './editor';
import projects from './projects';
import project from './project';
import userAppVersions from './user-app-versions';

const reducers = combineReducers({
  auth,
  editor,
  projects,
  project,
  userAppVersions
});

export default reducers;
