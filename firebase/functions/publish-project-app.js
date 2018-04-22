const os = require('os');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const firebaseTools = require('firebase-tools');
const functions = require('firebase-functions');
const { db, bucket } = require('./firebase');

// TODO: block simultaneous deploys
module.exports = function publishProjectApp(uid, orgId, projectId, appId, versionId) {
  if ( !orgId || !orgId.length || typeof orgId !== 'string'
      || !projectId || !projectId.length || typeof projectId !== 'string'
      || !versionId || !versionId.length || typeof versionId !== 'string'
      || projectId === getCurrentProjectId() ) {
    console.error('Bad org [%s] or project [%s] id', orgId, projectId);
    return Promise.reject(new functions.https.HttpsError('unauthenticated'));
  }

  const token = functions.config().tenant_environment.auth_token;

  if ( !token ) {
    console.error('No token setup');
    return Promise.reject(new functions.https.HttpsError('internal'));
  }

  let projectDir = null;

  return Promise.all([
    getProject(orgId, projectId),
    getProjectSettings(orgId, projectId)
  ]).then(([project, settings]) => {
    const firebaseProjectId = settings.firebaseProjectId;
    if ( !firebaseProjectId ) {
      console.warn('No firebase project id setup for %s-%s', orgId, projectId, settings);
      throw new functions.https.HttpsError('unauthenticated');
    }

    //
    // AUTHORIZE!
    //
    if ( !project.admins[uid] ) {
      throw new functions.https.HttpsError('unauthenticated');
    }

    project = setLiveAppVersion(uid, project, appId, versionId);
    console.log('Deploying app version %s for project %s-%s and app %s', versionId, orgId, projectId, appId);

    projectDir = getProjectDir(firebaseProjectId);

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
    Promise.all([
      saveProjectWithLiveVersion(uid, orgId, projectId, appId, versionId),
      firebaseProjectId,
      projectDir
    ])
  )).then(([project, firebaseProjectId, projectDir]) => (
    Promise.all([
      project,
      projectDir,
      firebaseTools.deploy({
        project: firebaseProjectId,
        token: token,
        cwd: projectDir
      })
    ])
  )).then(([project, projectDir]) => {
    console.log('Deployment complete');
    rimraf.sync(projectDir, { disableGlob: true });
    return project;
  }).catch(err => {
    console.error('Deployment failed!', err);
    if ( projectDir ) {
      rimraf.sync(projectDir, { disableGlob: true });
    }
    throw err;
  });
}

  function setLiveAppVersion(initiatedBy, project, appId, versionId) {
    const appIdx = project.apps.findIndex(app => app.id === appId);
    if ( appIdx < 0 ) {
      console.warn('No such app %s for project %s-%s', appId, orgId, projectId);
      throw new functions.https.HttpsError('not-found');
    }

    const app = project.apps[appIdx];
    const appVersionName = Object.keys(app.sharedVersions)
      .find(versionName => app.sharedVersions[versionName].versionId === versionId);
    if ( !appVersionName ) {
      console.warn('No such appVersion %s for project %s-%s and app %s', versionId, orgId, projectId, appId);
      throw new functions.https.HttpsError('not-found');
    }

    const appVersion = app.sharedVersions[appVersionName];

    project.apps[appIdx].liveVersion = {
      initiatedBy,
      initiatedAt: Date.now(),
      appVersion
    };

    return project;
  }

function saveProjectWithLiveVersion(initiatedBy, orgId, projectId, appId, versionId) {
  const ref = db.doc(`orgs/${orgId}/projects/${projectId}`);
  return db.runTransaction(txn => (
    txn.get(ref).then(doc => {
      const project = doc.data();
      const updatedProject = setLiveAppVersion(initiatedBy, project, appId, versionId);
      txn.set(ref, updatedProject);
      return updatedProject;
    })
  ));
}

function getProject(orgId, projectId) {
  return db.doc(`orgs/${orgId}/projects/${projectId}`)
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

  // copy static assets and fill in templated assets
  const staticPath = path.join(appTemplatePath, 'static');
  const staticAssets = fs.readdirSync(staticPath);
  const jsAssets = staticAssets.filter(filename => '.js' === path.extname(filename));
  const cssAssets = staticAssets.filter(filename => '.css' === path.extname(filename));

  if ( jsAssets.length !== 1 || cssAssets.length !== 1 ) {
    throw new functions.https.HttpsError('internal');
  }

  const css = cssAssets[0];
  const script = jsAssets[0];

  const indexContents = fs.readFileSync(path.join(appTemplatePath, 'index.html'), { encoding: 'utf8' });

  return Promise.all([
    Promise.all(
      // TODO: this doesn't handle sub-directories
      staticAssets.map(staticAsset => copyFile(path.join(staticPath, staticAsset), path.join(publicDir, staticAsset)))
    ),
    Promise.all(
      project.apps.map(writeIndexFile.bind(null, indexContents, css, script, publicDir, project))
    )
  ]);
}

function copyFile(src, dest) {
  return new Promise((resolve, reject) => {
    const read = fs.createReadStream(src);
    const write = fs.createWriteStream(dest);

    read.on('error', reject);
    write.on('error', reject);
    write.on('finish', resolve);

    read.pipe(write);
  });
}

function writeIndexFile(indexContents, css, script, publicDir, project, app) {
  // TODO: handle multiple models
  const appVersion = app.liveVersion.appVersion;
  const modelIds = Object.keys(appVersion.modelInfoById);

  return Promise.all([
    getFile(`orgs/${project.orgId}/projects/${project.id}/shared-assets/presenter-${appVersion.presenterHash}`),
    getFile(`orgs/${project.orgId}/projects/${project.id}/shared-assets/model-${appVersion.modelInfoById[modelIds[0]].contentHash}`)
  ]).then(([presenter, model]) => {
    // avoid parsing big json blobs and do some string concatenation
    const data = `{"presenter":${presenter.toString('utf8')},"model":${model.toString('utf8')}}`;
    const dir = path.join(publicDir, app.webRoot);

    fs.mkdirSync(dir);

    return fs.writeFileSync(
      path.join(dir, 'index.html'),
      indexContents.replace('{css}', `/${css}`)
                   .replace('{script}', `/${script}`)
                   .replace('{data}', data)
                   .replace('{title}', app.name)
    );
  });
}

function getFile(key) {
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
  const webApps = project.apps.filter(isWebApp);
  const rewrites = webApps.map(app => ({
    source: path.join(app.webRoot, '**'),
    destination: path.join(app.webRoot, 'index.html')
  })).concat(
    webApps.map(app => ({
      source: app.webRoot,
      destination: path.join(app.webRoot, 'index.html')
    }))
  );

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
