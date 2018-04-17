const os = require('os');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const firebaseTools = require('firebase-tools');
const functions = require('firebase-functions');
const { db, storage } = require('./firebase');

module.exports = function publishProjectApps(orgId, projectId) {
  if ( !orgId || !orgId.length || typeof orgId !== 'string'
      || !projectId || !projectId.length || typeof projectId !== 'string'
      || projectId === getCurrentProjectId() ) {
    console.error('Bad org [%s] or project [%s] id', orgId, projectId);
    return Promise.reject(new functions.https.HttpsError('unauthenticated'));
  }

  const token = functions.config().tenant_environment.auth_token;

  if ( !token ) {
    console.error('No token setup');
    return Promise.reject(new functions.https.HttpsError('internal'));
  }

  return Promise.all([
    getProject(orgId, projectId),
    getProjectSettings(orgId, projectId)
  ]).then(([project, settings]) => {
    const firebaseProjectId = settings.firebaseProjectId;
    if ( !firebaseProjectId ) {
      console.log('No firebase project id setup for %s', projectId, settings);
      throw new functions.https.HttpsError('unauthenticated');
    }

    const projectDir = getProjectDir(firebaseProjectId);

    writeFirebaseJson(projectDir, project);
    writeFirestoreRules(projectDir);
    writeFirestoreIndexes(projectDir);
    writeStorageRules(projectDir);

    return Promise.all([
      firebaseProjectId,
      projectDir,
      writePublicDir(projectDir, project)
    ]);
  }).then(([firebaseProjectId, projectDir]) => (
    firebaseTools.deploy({
      project: firebaseProjectId,
      token: token,
      cwd: projectDir
    })
  )).then(() => {
    console.log('Deployment complete');
    rimraf.sync(projectDir, { disableGlob: true });
    return null;
  }).catch(err => {
    console.error('Deployment failed!', err);
    throw err;
  });
}

function getProject(orgId, projectId) {
  return db.doc(`organizations/${orgId}/projects/${projectId}`)
           .get()
           .then(projectDoc => {
             if ( !projectDoc.exists )  {
               console.log('No project found for %s-%s', orgId, projectId);
               throw new functions.https.HttpsError('not-found');
             }

             return projectDoc.data();
           });
}

function getProjectSettings(orgId, projectId) {
  return db.doc(`admin/project-settings/${orgId}/${projectId}`)
           .get()
           .then(doc => {
             if ( !doc.exists ) {
               console.log('No firebase project settings for %s-%s', orgId, projectId);
               throw new functions.https.HttpsError('not-found');
             }
             return doc.data()
           });
}

function getProjectDir(projectId) {
  const dir = path.join(os.tmpdir(), projectId);

  if ( fs.existsSync(dir) ) {
    // just in case there was anything left over there from a previous invocation
    rimraf.sync(dir, { disableGlob: true });
  }

  fs.mkdirSync(dir);

  return dir;
}

function writeStorageRules(projectDir) {
  const rules =
      'service firebase.storage {\n'
    + '  match /b/{bucket}/o {\n'
    + '    allow write: if false;\n'
    + '    allow read: if false;\n'
    + '  }\n'
    + '}';

  fs.writeFileSync(
    path.join(projectDir, 'storage.rules'),
    rules
  );
}

function writeFirestoreIndexes(projectDir) {
  fs.writeFileSync(
    path.join(projectDir, 'firestore.indexes.json'),
    JSON.stringify({ "indexes": [] })
  );
}

function writeFirestoreRules(projectDir) {
  const rules =
      'service cloud.firestore {\n'
    + '  match /databases/{database}/documents {\n'
    + '    allow write: if false;\n'
    + '    allow read: if false;\n'
    + '  }\n'
    + '}';

  fs.writeFileSync(
    path.join(projectDir, 'firestore.rules'),
    rules
  );
}

function writePublicDir(projectDir, project) {
  const publicDir = path.join(projectDir, "public");
  fs.mkdirSync(publicDir);

  const appTemplatePath = path.join(__dirname, 'templates', 'app');

  // copy static assets
  const staticPath = path.join(appTemplatePath, 'static');
  const staticAssets = fs.readdirSync(staticPath);
  const jsAssets = staticAssets.filter(filename => '.js' === path.extname(filename));
  const cssAssets = staticAssets.filter(filename => '.css' === path.extname(filename));

  if ( jsAssets.length !== 1 || cssAssets.length !== 1 ) {
    throw new functions.https.HttpsError('internal');
  }

  const css = cssAssets[0];
  const script = jsAssets[0];

  fs.copyFileSync(path.join(staticPath, css), path.join(publicDir, css));
  fs.copyFileSync(path.join(staticPath, script), path.join(publicDir, script));

  // write templated assets
  const indexContents = fs.readFileSync(path.join(appTemplatePath, 'index.html'), { encoding: 'utf8' });

  return Promise.all(
    project.apps.map(writeIndexFile.bind(null, css, script, publicDir, project))
  );
}

function writeIndexFile(css, script, publicDir, project, app) {
  const bucket = storage.bucket()

  // TODO: handle multiple models
  const modelIds = Object.keys(app.liveVersion.modelInfoById);

  return Promise.all([
    getFile(`orgs/${project.orgId}/projects/${project.id}/shared-assets/presenter-${app.liveVersion.presenterHash}`),
    getFile(`orgs/${project.orgId}/projects/${project.id}/shared-assets/model-${app.liveVersion.modelInfoById[modelIds[0]].contentHash}`)
  ]).then((presenter, model) => {
    // avoid parsing big json blobs and do some string concatenation
    const data = `{"presenter":${presenter.toString('utf8')},"model":${model.toString('utf8')}}`;

    return fs.writeFileSync(
      path.join(publicDir, 'index.html'),
      indexContents.replace('{css}', `/${css}`)
                   .replace('{script}', `/${script}`)
                   .replace('{data}', data)
                   .replace('{title}', app.name)
    );
  });
}

function getFile(bucket, key) {
  return new Promise((resolve, reject) => {
    bucket.file(key).download((err, contents) => {
      if ( err ) {
        return reject(err);
      }

      return resolve(contents);
    });
  });
}

function isWebApp(app) {
  return app.platform === 'Web' || app.platform === 'API';
}

function writeFirebaseJson(projectDir, project) {
  const rewrites = project.apps.filter(isWebApp)
                          .map(app => ({
                            source: path.join(app.webRoot, '**'),
                            destination: path.join(app.webRoot, 'index.html')
                          }));

  fs.writeFileSync(
    path.join(projectDir, 'firebase.json'),
    JSON.stringify({
      "firestore": {
        "rules": "firestore.rules",
        "indexes": "firestore.indexes.json"
      },
      "hosting": {
        "public": "public",
        "rewrites": rewrites
      }
    })
  );
}

function getCurrentProjectId() {
  return process.env.GCLOUD_PROJECT;
}
