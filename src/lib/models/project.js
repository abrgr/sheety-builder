import { Record, Map, List } from 'immutable';
import App from './app';
import coerce from './coerce';

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

const coercer = coerce.bind(null, new Map({
  id: id => '' + id,
  orgId: orgId => '' + orgId,
  orgName: orgName => '' + orgName,
  name: name => '' + name,
  admins: admins => new Map(admins),
  writers: writers => new Map(writers),
  readers: readers => new Map(readers),
  imageURL: imageURL => imageURL ? '' + imageURL : null,
  apps: apps => new List(apps).map(a => new App(a))
}));

export default class Project extends ProjectRecord {
  constructor(props) {
    super(coercer(props));
  }
}
