import { List } from 'immutable';
import uuid from 'uuid';
import firebase from '../firebase';
import { Project } from '../models';

const db = firebase.firestore();
const storage = firebase.storage();

export default getUid => ({
  save(project) {
    return getUid().then(uid => (
      !!project.get('id')
        ? updateProject(uid, project)
        : createProject(uid, project)
    ));
  },

  saveImage(project, blob) {
    const orgId = project.get('orgId');
    const projectId = project.get('id');
    const assetId = uuid.v4();

    return getUid().then(uid => (
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
     });
  },

  saveApp(project, app, imgBlob) {
    const appId = app.get('id') || uuid.v4();
    const orgId = project.get('orgId');
    const projectId = project.get('id');
    const assetId = uuid.v4();

    return getUid().then(uid => (
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
    });
  },

  load(orgId, projectId, uid) {
    return getUid(uid).then(uid => (
      db.doc(`orgs/${orgId}/projects/${projectId}`)
        .get()
        .then(doc => (
          new Project(doc.data())
        ))
    ));
  },

  list(uid) {
    return getUid(uid).then(uid => (
      db.doc(`user-config/${uid}`)
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
              this.load(project.orgId, project.id)
            ))
          )
        ))
    ));
  },

  listInvites(email, uid) {
    return getUid(uid).then(() => (
      db.collection(`projectInvites/${email}/projects`)
        .get()
        .then(col => (
          Promise.all(
            col.docs.map(doc => doc.data())
          )
        )).then(invites => (
          Promise.all(
            invites.map(invite => (
              this.load(invite.orgId, invite.id).then(project => ({
                ...invite,
                project
              }))
            ))
          )
        ))
    ));
  }
});

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
