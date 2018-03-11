const editorRoutes = {
  root(appId) {
    return `/${appId}`;
  },

  tab(appId, tab) {
    return `${this.root(appId)}/${tab}`;
  },

  basicTab(appId) {
    return this.tab(appId, 'basic');
  },

  logicTab(appId) {
    return this.tab(appId, 'logic');
  },

  presentationTab(appId) {
    return this.tab(appId, 'presentation');
  }
};

const projectRoutes = {
  list() {
    return '/';
  }
};

export {
  editorRoutes,
  projectRoutes
};
