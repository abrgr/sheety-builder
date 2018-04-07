const appRoutes = {
  root(orgId, projectId, appId) {
    return `/orgs/${orgId}/projects/${projectId}/apps/${appId}`;
  },

  default(orgId, projectId, appId) {
    return `${this.root(orgId, projectId, appId)}/basic`;
  }
};

const editorRoutes = {
  root(orgId, projectId, appId, version) {
    return `${appRoutes.root(orgId, projectId, appId)}/v/${version}`;
  },

  tab(orgId, projectId, appId, version, tab) {
    return `${this.root(orgId, projectId, appId, version)}/${tab}`;
  },

  default(orgId, projectId, appId, version) {
    return this.tab(orgId, projectId, appId, version, 'logic');
  },

  logicTab(orgId, projectId, appId, version) {
    return this.tab(orgId, projectId, appId, version, 'logic');
  },

  presentationTab(orgId, projectId, appId, version) {
    return this.tab(orgId, projectId, appId, version, 'presentation');
  }
};

const projectRoutes = {
  list() {
    return '/';
  },

  project(orgId, id) {
    return `/orgs/${orgId}/projects/${id}`;
  }
};

export {
  appRoutes,
  editorRoutes,
  projectRoutes
};
