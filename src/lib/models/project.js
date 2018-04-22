import { Record, Map, List } from 'immutable';
import App from './app';
import coerce, { propCoercers } from './coerce';

const ProjectRecord = new Record({
  id: '',
  orgId: '',
  orgName: '',
  name: '',
  admins: new Map(),
  writers: new Map(),
  readers: new Map(),
  imageURL: null,
  domain: null,
  apps: new List()
});

const coercer = coerce.bind(null, new Map({
  id: propCoercers.nullableString,
  orgId: propCoercers.nullableString,
  orgName: propCoercers.nullableString,
  name: propCoercers.nullableString,
  admins: propCoercers.map,
  writers: propCoercers.map,
  readers: propCoercers.map,
  imageURL: propCoercers.nullableString,
  domain: propCoercers.nullableString,
  apps: propCoercers.listOfType(App)
}));

export default class Project extends ProjectRecord {
  constructor(props) {
    super(coercer(props));
  }
}
