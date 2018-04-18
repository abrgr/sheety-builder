import { Record, Map } from 'immutable';
import AppVersion from './app-version';
import coerce, { propCoercers } from './coerce';

const Platforms = Object.freeze({
  WEB: 'Web',
  IOS: 'iOS',
  ANDROID: 'Android',
  API: 'API',
  BACKGROUND: 'Background'
});

const AppRecord = new Record({
  id: '',
  name: '',
  platform: null,
  iconURL: null,
  sharedVersions: new Map(),
  liveVersion: null
});

const coercer = coerce.bind(null, new Map({
  id: propCoercers.nullableString,
  name: propCoercers.nullableString,
  platform: propCoercers.nullableString,
  iconURL: propCoercers.nullableString,
  sharedVersions: propCoercers.mapOfType(AppVersion),
  liveVersion: propCoercers.nullableObjOfType(AppVersion)
}));

export default class App extends AppRecord {
  constructor(props) {
    super(coercer(props));
  }
}

App.Platforms = Platforms;
App.isValid = app => (
  !!app.get('name') && !!app.get('platform')
);
