import { Record, Map } from 'immutable';
import Calculator from 'sheety-calculator';
import * as actions from '../actions';
import { App, AppVersion } from '../models';

const initialState = new Record({
  app: new App(),
  appVersion: new AppVersion(),
  presenter: new Map(),
  editingPresenterPath: [],
  linkPath: null,
  presentersByType: new Map(),
  isLoading: false,
  isSaving: false,
  model: null,
  error: null,
  saveError: null,
  calc: null,
  showShareVersionDialog: false
})();

export default function editor(state = initialState, action) {
  switch ( action.type ) {
    case actions.SET_APP:
      return state.set('app', new App(action.app));
    case actions.REQUESTED_SHARE_APP_VERSION:
      return state.merge({
        isSaving: true
      });
    case actions.RECEIVED_SHARE_APP_VERSION:
      return state.merge({
        isSaving: false,
        saveError: null,
        app: action.project.get('apps').find(app => (
          app.get('id') === action.appVersion.get('appId')
        ))
      });
    case actions.ERRORED_SHARE_APP_VERSION:
      return state.merge({
        isSaving: false,
        saveError: action.error
      });
    case actions.REQUESTED_APP_VERSION:
      return state.set('isLoading', true);
    case actions.RECEIVED_APP_VERSION:
      const model = action.models.first(); // TODO: support multiple models in the future
      return state.merge({
        appVersion: new AppVersion(action.appVersion),
        isLoading: false,
        model,
        presenter: action.presenter,
        calc: model ? new Calculator(model) : null
      });
    case actions.ERRORED_APP_VERSION:
      return state.merge({
        isLoading: false,
        error: action.error
      });
    case actions.APP_SAVING_INITIATED:
      return state.merge({
        isSaving: true
      });
    case actions.APP_SAVING_COMPLETED:
      return state.merge({
        appVersion: new AppVersion(action.appVersion),
        isSaving: false,
        saveError: null,
        model: action.model,
        presenter: action.presenter,
        calc: action.model ? new Calculator(action.model) : null
      });
    case actions.APP_SAVING_FAILED:
      return state.merge({
        isSaving: false,
        saveError: action.error
      });
    case actions.RECEIVED_SAVE_PROJECT:
      const newApp = action.project.get('apps').find(app => app.get('id') === state.app.get('id'));
      return newApp
           ? state.set('app', newApp)
           : state;
    case actions.SET_PRESENTER_AT_PATH:
      return state.setIn(['presenter'].concat(action.path), action.presenter);
    case actions.SET_EDITING_PRESENTER_PATH:
      return state.set('editingPresenterPath', action.editingPresenterPath);
    case actions.SET_PRESENTERS_BY_TYPE:
      return state.set('presentersByType', action.presentersByType);
    case actions.REQUESTED_IMPORT_MODEL:
      return state.merge({
        isLoading: true
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
        error: action.err
      });
    case actions.SET_LINK_PATH:
      return state.set('linkPath', action.linkPath);
    case actions.CLEAR_LINK_PATH:
      return state.set('linkPath', null);
    case actions.SET_SHOW_SHARE_VERSION_DIALOG:
      return state.set('showShareVersionDialog', action.showShareVersionDialog);
    default:
      return state;
  }
}
