import { Record, Map } from 'immutable';

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
  currentVersions: new Map()
});

export default class App extends AppRecord {
  constructor(props) {
    const vals = props || {};
    super({
      ...vals,
      currentVersions: new Map(vals.currentVersions)
    });
  }
}

App.Platforms = Platforms;
App.isValid = app => (
  !!app.get('name') && !!app.get('platform')
);
