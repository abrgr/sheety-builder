import { fromJS } from 'immutable';
import {
  REQUESTED_PROJECTS,
  RECEIVED_PROJECTS,
  ERRORED_PROJECTS
} from '../actions';
import { project } from '../persistence';

export function requestProjects(uid, email) {
  return (dispatch) => {
    dispatch({
      type: REQUESTED_PROJECTS
    });

    Promise.all([
      project.list(uid),
      project.listInvites(email, uid)
    ]).then(([projects, invitations]) => {
      dispatch({
        type: RECEIVED_PROJECTS,
        projects: fromJS(projects),
        invitations: fromJS(invitations)
      });
    }).catch(err => {
      dispatch({
        type: ERRORED_PROJECTS,
        error: "Sorry, we can't load your projects right now."
      });
    });
  };
}
