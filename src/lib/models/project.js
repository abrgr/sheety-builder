import { Record, Map, List } from 'immutable';

const ProjectRecord = new Record({
  id: '',
  orgId: '',
  name: '',
  admins: new Map(),
  writers: new Map(),
  readers: new Map(),
  imageURL: null,
  apps: new List()
});

export default ProjectRecord;
