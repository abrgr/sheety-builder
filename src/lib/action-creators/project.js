import firebase from '../firebase';
import ensureAuthenticated from '../ensure-authenticated';
import {
  REQUESTED_SAVE_PROJECT,
  RECEIVED_SAVE_PROJECT,
  ERRORED_SAVE_PROJECT
} from '../actions';

const db = firebase.firestore();

export function saveProject(project) {
  const orgId = project.get('orgId');

  return (dispatch) => {
    dispatch({
      type: REQUESTED_SAVE_PROJECT
    });

    ensureAuthenticated(false).then(uid => (
      db.collection(`orgs/${orgId}/projects`)
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
                 const projects = cfg.projects || [];
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
        ))
    )).then(project => {
      dispatch({
        type: RECEIVED_SAVE_PROJECT,
        project: project
      });
    }).catch(err => {
      dispatch({
        type: ERRORED_SAVE_PROJECT,
        error: "Sorry, we couldn't save your project"
      });
    });
  };
}
