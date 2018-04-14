import { Record, Map } from 'immutable';
import crypto from 'crypto';
import coerce, { propCoercers } from './coerce';

const ModelInfoRecord = new Record({
  providerUrl: null,
  monotonicVersion: null,
  lastModifiedAt: null,
  title: null,
  contentHash: null
});

const modelInfoCoercer = coerce.bind(null, new Map({
  providerUrl: propCoercers.nullableString,
  monotonicVersion: propCoercers.nullableNumber,
  lastModifiedAt: propCoercers.nullableDate,
  title: propCoercers.nullableString,
  contentHash: propCoercers.nullableString
}));

class ModelInfo extends ModelInfoRecord {
  constructor(props) {
    super(modelInfoCoercer(props || {}));
  }

  toNetworkRepresentation() {
    const lastModifiedAt = this.get('lastModifiedAt');
    return new Map(this).set('lastModifiedAt', lastModifiedAt ? lastModifiedAt.getTime() : null);
  }
}

const AppVersionRecord = new Record({
  orgId: null,
  projectId: null,
  appId: null,
  name: null,
  author: null,
  createdAt: null,
  description: null,
  base: null,
  modelInfoById: new Map(),
  presenterHash: null
});

const coercer = coerce.bind(null, new Map({
  orgId: propCoercers.nullableString,
  projectId: propCoercers.nullableString,
  appId: propCoercers.nullableString,
  name: propCoercers.nullableString,
  author: propCoercers.nullableString,
  createdAt: propCoercers.nullableDate,
  description: propCoercers.nullableString,
  base: (val) => propCoercers.nullableObjOfType(AppVersion)(val),
  modelInfoById: propCoercers.mapOfType(ModelInfo),
  presenterHash: propCoercers.nullableString
}));

export default class AppVersion extends AppVersionRecord {
  constructor(props) {
    super(coercer(props || {}));
  }

  setModelJSON(id, modelJSON, model) {
    const modelInfo = new ModelInfo(model).set('contentHash', hash(modelJSON));
    return this.setIn(['modelInfoById', id], modelInfo);
  }

  setPresenterJSON(presenterJSON) {
    return this.set('presenterHash', hash(presenterJSON));
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
                                    .set('base', base ? base.toNetworkRepresentation() : null)
                                    .update('modelInfoById', modelInfoById => (
                                      modelInfoById.map(modelInfo => modelInfo.toNetworkRepresentation())
                                    ));

    return networkRep.toJS();
  }
}

function hash(data) {
  const hashAlgo = 'sha256';
  const hasher = crypto.createHash(hashAlgo);
  hasher.update(data);
  return `${hasher.digest('hex')}-${hashAlgo}`;
}
