import { Record, Map } from 'immutable';
import Calculator from 'sheety-calculator';
import * as actions from '../actions';

const PresenterDescriptor = new Record({
  type: null,
  name: null,
  icon: null,
  config: new Map(),
  mapDataQuery: new Map(),
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
      mapDataQuery: new Map({
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
        content: new ConfigurerDescriptor({
          type: 'wysiwyg-content',
          description: 'Content to show'
        })
      })
    })
  }),
  presenter: new Map(),
  editingPresenterPath: [],
  presentersByType: new Map(),
  isMainMenuOpen: false,
  isLoading: false,
  spreadsheetId: null,
  model: null,
  error: null,
  calc: null
})();

export default function editor(state = initialState, action) {
  switch ( action.type ) {
    case actions.SET_PRESENTER_AT_PATH:
      return state.setIn(['presenter'].concat(action.path), action.presenter);
    case actions.SET_EDITING_PRESENTER_PATH:
      return state.set('editingPresenterPath', action.editingPresenterPath);
    case actions.SET_APP_ID:
      return state.set('appId', action.appId);
    case actions.SET_PRESENTERS_BY_TYPE:
      return state.set('presentersByType', action.presentersByType);
    case actions.TOGGLE_MAIN_EDITOR_MENU:
      return state.set('isMainMenuOpen', !state.get('isMainMenuOpen'));
    case actions.RECEIVED_SPREADSHEET_ID:
      return state.merge({
        isLoading: true,
        spreadsheetId: action.spreadsheetId,
        model: null 
      });
    case actions.RECEIVED_MODEL:
      return state.merge({
        isLoading: false,
        model: action.model,
        calc: new Calculator(action.model)
      });
    case actions.RECEIVED_IMPORT_ERROR:
      return state.merge({
        isLoading: false,
        model: null,
        error: action.err
      }); 
    default:
      return state;
  }
}
