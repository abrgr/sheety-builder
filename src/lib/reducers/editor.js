import { Record, Map } from 'immutable';
import * as actions from '../actions';

const PresenterDescriptor = new Record({
  type: null,
  name: null,
  icon: null,
  config: new Map(),
  mapData: new Map(),
  arrayData: null
});

const ConfigurerDescriptor = new Record({
  type: null,
  description: null
});

const initialState = new Record({
  appId: '',
  availablePresenters: new Map({
    'grid-layout': new PresenterDescriptor({
      type: 'grid-layout',
      name: 'Grid Layout',
      icon: 'favicon.ico',
      config: new Map({
        rows: new ConfigurerDescriptor({
          type: 'rows',
          description: 'Rows are cool'
        })
      })
    }),
    text: new PresenterDescriptor({
      type: 'text',
      name: 'Text',
      icon: 'favicon.ico',
      mapData: new Map({
        text: new ConfigurerDescriptor({
          type: 'formula',
          description: 'A formula for the text to show'
        })
      })
    }),
    content: new PresenterDescriptor({
      type: 'content',
      name: 'Content',
      icon: 'favicon.ico',
      config: new Map({
        text: new ConfigurerDescriptor({
          type: 'wysiwyg-content',
          description: 'Content to show'
        })
      })
    })
  }),
  presenter: new Map(),
  editingPresenterPath: []
})();

export default function editor(state = initialState, action) {
  switch ( action.type ) {
    case actions.SET_PRESENTER_AT_PATH:
      return state.setIn(['presenter'].concat(action.path), action.presenter);
    case actions.SET_EDITING_PRESENTER_PATH:
      return state.set('editingPresenterPath', action.editingPresenterPath);
    case actions.SET_APP_ID:
      return state.set('appId', action.appId);
    default:
      return state;
  }
}
