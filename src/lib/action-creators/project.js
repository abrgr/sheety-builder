import { List } from 'immutable';
import uuid from 'uuid';
import firebase from '../firebase';
import ensureAuthenticated from '../ensure-authenticated';
import {
  REQUESTED_SAVE_PROJECT,
  RECEIVED_SAVE_PROJECT,
  ERRORED_SAVE_PROJECT,
  REQUESTED_LOAD_PROJECT,
  RECEIVED_LOAD_PROJECT,
  ERRORED_LOAD_PROJECT
} from '../actions';
import { Project } from '../models';
import { projectRoutes } from '../routes';

const db = firebase.firestore();
const storage = firebase.storage();

function createProject(uid, project) {
  const orgId = project.get('orgId');

  return db.collection(`orgs/${orgId}/projects`)
    .add(project.toJS())
    .then(doc => (
      doc.set({
        id: doc.id
      }, {
        merge: true
      }).then(() => project.set('id', doc.id))
    )).then(project => (
      db.runTransaction(txn => {
        const cfgRef = db.doc(`user-config/${uid}`);
        return txn.get(cfgRef)
           .then(cfg => {
             const projects = cfg.data().projects || [];
             projects.unshift({
               id: project.get('id'),
               orgId
             });
             return txn.set(
               cfgRef,
               {
                 projects
               },
               {
                 merge: true
               }
             );
           }).then(() => project);
      })
    ));
}

function updateProject(uid, project) {
  return db.doc(`orgs/${project.get('orgId')}/projects/${project.get('id')}`)
           .set(project.toJS(), { merge: true })
           .then(() => project);
}

export function saveProject(project, history) {
  return (dispatch) => {
    dispatch({
      type: REQUESTED_SAVE_PROJECT
    });

    ensureAuthenticated(false).then(uid => (
      !!project.get('id')
        ? updateProject(uid, project)
        : createProject(uid, project)
    )).then(project => {
      dispatch({
        type: RECEIVED_SAVE_PROJECT,
        project: project
      });
      if ( history ) {
        history.push(
          projectRoutes.project(
            project.get('orgId'),
            project.get('id')
          )
        );
      }
    }).catch(err => {
      dispatch({
        type: ERRORED_SAVE_PROJECT,
        error: "Sorry, we couldn't save your project"
      });
    });
  };
}

export function load(projects, orgId, projectId) {
  return (dispatch) => {
    dispatch({
      type: REQUESTED_LOAD_PROJECT
    });

    const fromProjects = projects.find(p => (
      p.get('orgId') === orgId && p.get('id') === projectId
    ));

    if ( fromProjects ) {
      return dispatch({
        type: RECEIVED_LOAD_PROJECT,
        project: fromProjects
      });
    }

    ensureAuthenticated(false).then(uid => (
      db.doc(`orgs/${orgId}/projects/${projectId}`)
        .get()
        .then(doc => (
          new Project(doc.data())
        ))
    )).then(project => {
      dispatch({
        type: RECEIVED_LOAD_PROJECT,
        project
      });
    }).catch(err => {
      dispatch({
        type: ERRORED_LOAD_PROJECT,
        error: "Sorry, we couldn't load your project"
      });
    });
  };
}

export function setProjectImage(project, blob) {
  const orgId = project.get('orgId');
  const projectId = project.get('id');
  const assetId = uuid.v4();

  return dispatch => {
    dispatch({
      type: REQUESTED_SAVE_PROJECT
    });

    ensureAuthenticated(false)
      .then(uid => (
        storage.ref()
               .child(`orgs/${orgId}/projects/${projectId}/user-assets/${uid}/${assetId}`)
               .put(
                 blob,
                 {
                   contentType: blob.type
                 }
               )
      )).then(doc => {
        const imageURL = doc.downloadURL;
        const newProject = project.set('imageURL', imageURL);
        return db.doc(`orgs/${orgId}/projects/${projectId}`)
                 .set({ imageURL }, { merge: true })
                 .then(() => newProject);
      }).then((project) => {
        dispatch({
          type: RECEIVED_SAVE_PROJECT,
          project
        });
      }).catch(err => {
        dispatch({
          type: ERRORED_SAVE_PROJECT,
          error: "Sorry, we couldn't save your project"
        });
      });
  };
}

export function saveApp(project, app, imgBlob) {
  const appId = app.get('id') || uuid.v4();
  const orgId = project.get('orgId');
  const projectId = project.get('id');
  const assetId = uuid.v4();

  return dispatch => {
    dispatch({
      type: REQUESTED_SAVE_PROJECT
    });

    ensureAuthenticated(false)
      .then(uid => (
        imgBlob
          ? storage.ref()
                   .child(`orgs/${orgId}/projects/${projectId}/apps/${appId}/user-assets/${uid}/${assetId}`)
                   .put(
                     imgBlob,
                     {
                       contentType: imgBlob.type
                     }
                   )
          : Promise.resolve(null)
      )).then(doc => {
        const iconURL = doc && doc.downloadURL;
        const updatedApp = app.merge({
          id: appId,
          iconURL: iconURL || app.get('iconURL')
        });
        return db.runTransaction(txn => {
          const projectRef = db.doc(`orgs/${orgId}/projects/${projectId}`);
          return txn.get(projectRef)
             .then(doc => {
               const existingProject = doc.data();
               const existingAppIdx = new List(existingProject.apps).findIndex(a => (
                 a.id === appId
               ));

               if ( existingAppIdx >= 0 ) {
                 existingProject.apps[existingAppIdx] = updatedApp.toJS();
               } else {
                 existingProject.apps = (existingProject.apps || []).concat(updatedApp.toJS());
               }

               txn.set(
                 projectRef,
                 {
                   apps: existingProject.apps
                 },
                 {
                   merge: true
                 }
               );

               return new Project(existingProject);
             })
        });
      }).then((project) => {
        dispatch({
          type: RECEIVED_SAVE_PROJECT,
          project
        });
      }).catch(err => {
        dispatch({
          type: ERRORED_SAVE_PROJECT,
          error: "Sorry, we couldn't save your project"
        });
      });
  };
}
