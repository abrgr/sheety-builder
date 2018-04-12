import { Record, Map } from 'immutable';
import crypto from 'crypto';
import coerce from './coerce';

const AppVersionRecord = new Record({
  orgId: null,
  projectId: null,
  appId: null,
  name: null,
  author: null,
  createdAt: null,
  description: null,
  base: null,
  modelHashesById: new Map(),
  presenterHash: null
});

const coercer = coerce.bind(null, new Map({
  orgId: (orgId) => orgId ? '' + orgId : null,
  projectId: (projectId) => projectId ? '' + projectId : null,
  appId: (appId) => appId ? '' + appId : null,
  name: (name) => name ? '' + name : null,
  author: (author) => author ? '' + author : null,
  createdAt: (createdAt) => createdAt ? new Date(createdAt) : null,
  description: (description) => description ? '' + description : null,
  base: (base) => base ? new AppVersion(base) : null,
  modelHashesById: (modelHashesById) => new Map(modelHashesById ? modelHashesById : null),
  presenterHash: (presenterHash) => presenterHash ? '' + presenterHash : null
}));

export default class AppVersion extends AppVersionRecord {
  constructor(props) {
    super(coercer(props || {}));
  }

  setModelJSON(id, modelJSON) {
    return this.setIn(['modelHashesById', id], hash(modelJSON));
  }

  setPresenterJSON(presenterJSON) {
    return this.set('presenterHash', hash(presenterJSON));
  }

  isFromScratch() {
     return this.get('base') === null;
  }

  hasOwnChanges() {
    const modelHashesById = this.get('modelHashesById');
    const hasModelChanges = !!modelHashesById && !modelHashesById.isEmpty();
    const hasPresenterChanges = !!this.get('presenterHash');

    return hasModelChanges || hasPresenterChanges;
  }

  isLegitimateChildOf(possibleProgenitor) {
    const base = this.get('base');
    if ( !possibleProgenitor ) {
      // null can beget anything
      return true;
    }
    if ( !base ) {
      return false;
    }

    const possibleProgenitorVersion = new AppVersion(possibleProgenitor);
    return base.equals(possibleProgenitorVersion);
  }

  toNetworkRepresentation() {
    const createdAt = this.get('createdAt');
    const base = this.get('base');
    const networkRep = new Map(this).set('createdAt', createdAt ? createdAt.getTime() : null)
                                    .set('base', base ? base.toNetworkRepresentation() : null);

    return networkRep.toJS();
  }
}

function hash(data) {
  const hashAlgo = 'sha256';
  const hasher = crypto.createHash(hashAlgo);
  hasher.update(data);
  return `${hasher.digest('hex')}-${hashAlgo}`;
}
