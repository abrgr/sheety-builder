const editorRoutes = {
  root(orgId, projectId, appId) {
    return `/orgs/${orgId}/projects/${projectId}/apps/${appId}`;
  },

  default(orgId, projectId, appId) {
    return this.basicTab(orgId, projectId, appId);
  },

  tab(orgId, projectId, appId, tab) {
    return `${this.root(orgId, projectId, appId)}/${tab}`;
  },

  basicTab(orgId, projectId, appId) {
    return this.tab(orgId, projectId, appId, 'basic');
  },

  logicTab(orgId, projectId, appId) {
    return this.tab(orgId, projectId, appId, 'logic');
  },

  presentationTab(orgId, projectId, appId) {
    return this.tab(orgId, projectId, appId, 'presentation');
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
  editorRoutes,
  projectRoutes
};
