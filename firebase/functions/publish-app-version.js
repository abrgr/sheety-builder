const os = require('os');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const firebaseTools = require('firebase-tools');
const functions = require('firebase-functions');
const { storage } = require('./firebase');

module.exports = function publishAppVersion(appVersion) {
  const projectId = appVersion.projectId;
  if ( !projectId || !projectId.length || typeof projectId !== 'string' || projectId === getCurrentProjectId() ) {
    console.error('Bad project id');
    throw new Error('Unauthorized');
  }

  const projectDir = getProjectDir(projectId);

  writeFirebaseJson(projectDir);
  writePublicDir(projectDir)
  writeFirestoreRules(projectDir);
  writeFirestoreIndexes(projectDir);
  writeStorageRules(projectDir);

  const token = functions.config().tenant_environment.auth_token;

  return firebaseTools.deploy({
    project: projectId,
    token: token,
    cwd: projectDir
  }).then(() => {
    console.log('Deployment complete');
    rimraf.sync(projectDir);
    return null;
  }).catch(err => {
    console.error('Deployment failed!', err);
    throw err;
  })
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

function writePublicDir(projectDir) {
  const publicDir = path.join(projectDir, "public");
  fs.mkdirSync(publicDir);
  fs.writeFileSync(
    path.join(publicDir, 'index.html'),
    '<html><body>YES</body></html>'
  );
}

function writeFirebaseJson(projectDir) {
  fs.writeFileSync(
    path.join(projectDir, 'firebase.json'),
    JSON.stringify({
      "firestore": {
        "rules": "firestore.rules",
        "indexes": "firestore.indexes.json"
      },
      "hosting": {
        "public": "public",
        "rewrites": [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    })
  );
}

function getCurrentProjectId() {
  return process.env.GCLOUD_PROJECT;
}
