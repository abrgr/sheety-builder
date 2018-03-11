import firebase from '../firebase';
import { fromJS } from 'immutable';
import ensureAuthenticated from '../ensure-authenticated';
import {
  REQUESTED_PROJECTS,
  RECEIVED_PROJECTS,
  ERRORED_PROJECTS
} from '../actions';
import { Project } from '../models';

const db = firebase.firestore();

function resolveProject(orgId, projectId) {
  return db.doc(`orgs/${orgId}/projects/${projectId}`)
           .get()
           .then(doc => new Project(doc.data()));
}

function getProjects(uid) {
  return db.doc(`user-config/${uid}`)
           .get()
           .then(doc => {
             const projects = doc.get('projects');
             if ( !projects || !projects.length ) {
               return [];
             }

             return projects;
           }).then(projects => (
             Promise.all(
               projects.map(project => (
                 resolveProject(project.orgId, project.id)
               ))
             )
           ));
}

function getInvites(email) {
  return db.collection(`projectInvites/${email}/projects`)
           .get()
           .then(col => (
             Promise.all(
               col.docs.map(doc => doc.data())
             )
           )).then(invites => (
             Promise.all(
               invites.map(invite => (
                 resolveProject(invite.orgId, invite.id).then(project => ({
                   ...invite,
                   project
                 }))
               ))
             )
           ));
}

export function requestProjects(uid, email) {
  return (dispatch) => {
    dispatch({
      type: REQUESTED_PROJECTS
    });

    ensureAuthenticated(false).then(uid => (
      Promise.all([
        getProjects(uid),
        getInvites(email)
      ])
    )).then(([projects, invitations]) => {
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
