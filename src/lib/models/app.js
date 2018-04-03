import { Record, Map } from 'immutable';
import coerce from './coerce';

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
  publishedVersions: new Map()
});

const coercer = coerce.bind(null, new Map({
  id: id => '' + id,
  name: name => '' + name,
  platform: platform => '' + platform,
  iconURL: iconURL => iconURL ? '' + iconURL : null,
  publishedVersions: publishedVersions => new Map(publishedVersions)
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
