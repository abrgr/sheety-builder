import { fromJS, Record, Map } from 'immutable';
import AppVersion from './app-version';
import coerce, { propCoercers } from './coerce';

const Platforms = Object.freeze({
  WEB: 'Web',
  IOS: 'iOS',
  ANDROID: 'Android',
  API: 'API',
  BACKGROUND: 'Background'
});

const PlatformInfo = fromJS({
  [Platforms.WEB]: {
    hasWebRoot: true
  },
  [Platforms.API]: {
    hasWebRoot: true
  }
});

const DeploymentRecord = new Record({
  appVersion: null,
  initiatedBy: null,
  initiatedAt: null
});

const deploymentCoercer = coerce.bind(null, new Map({
  appVersion: propCoercers.nullableObjOfType(AppVersion),
  initiatedBy: propCoercers.nullableString,
  initiatedAt: propCoercers.nullableDate
}));

class Deployment extends DeploymentRecord {
  constructor(props) {
    super(deploymentCoercer(props));
  }

  toNetworkRepresentation() {
    const initiatedAt = this.get('initiatedAt');

    return new Map(this).set('initiatedAt', initiatedAt ? initiatedAt.getTime() : null);
  }
}

const AppRecord = new Record({
  id: '',
  name: '',
  platform: null,
  iconURL: null,
  sharedVersions: new Map(),
  liveVersion: null,
  webRoot: null
});

const coercer = coerce.bind(null, new Map({
  id: propCoercers.nullableString,
  name: propCoercers.nullableString,
  platform: propCoercers.nullableString,
  iconURL: propCoercers.nullableString,
  sharedVersions: propCoercers.mapOfType(AppVersion),
  liveVersion: propCoercers.nullableObjOfType(Deployment),
  webRoot: propCoercers.nullableString // TODO: better model for this?
}));

export default class App extends AppRecord {
  constructor(props) {
    super(coercer(props));
  }

  platformInfo() {
    return PlatformInfo.get(this.get('platform'), new Map());
  }

  toNetworkRepresentation() {
    const liveVersion = this.get('liveVersion');
    return new Map(this).set('liveVersion', liveVersion ? liveVersion.toNetworkRepresentation() : null);
  }
}

App.Platforms = Platforms;
App.isValid = app => (
  !!app.get('name') && !!app.get('platform')
);
