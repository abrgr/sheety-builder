import { Record, Map, List } from 'immutable';
import App from './app';

const ProjectRecord = new Record({
  id: '',
  orgId: '',
  orgName: '',
  name: '',
  admins: new Map(),
  writers: new Map(),
  readers: new Map(),
  imageURL: null,
  apps: new List()
});

export default class Project extends ProjectRecord {
  constructor(props) {
    const vals = props || {};
    super({
      ...vals,
      admins: new Map(vals.admins),
      writers: new Map(vals.writers),
      readers: new Map(vals.readers),
      apps: new List(vals.apps).map(a => new App(a))
    });
  }
}
