import { Record, Map } from 'immutable';
import coerce from './coerce';

const AppVersionRecord = new Record({
  appId: null,
  name: null,
  description: null,
  base: null,
  sheetMd5sById: new Map(),
  presenterMd5: null
});

const coercer = coerce.bind(null, new Map({
  appId: (appId) => appId ? '' + appId : null,
  name: (name) => name ? '' + name : null,
  description: (description) => description ? '' + description : null,
  base: (base) => base ? new AppVersion(base) : null,
  sheetMd5sById: (sheetMd5sById) => new Map(sheetMd5sById ? sheetMd5sById : null),
  presenterMd5: (presenterMd5) => presenterMd5 ? '' + presenterMd5 : null
}));

export default class AppVersion extends AppVersionRecord {
  constructor(props) {
    super(coercer(props || {}));
  }
}
