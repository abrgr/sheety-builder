import React, { cloneElement, Children } from 'react';
import { Map } from 'immutable';
import makeCorePresenters from 'sheety-core-presenters/dist/builder';

// TODO: figure out some way to share this code with sheety-app's presenter

function presenter({ formatted, configKeyDocs, mapDataDocs, arrayDataDocs }) {
  return (Component) => (
    (props) => (
      <PresenterContainer
        {...props}
        configKeyDocs={configKeyDocs}
        mapDataDocs={mapDataDocs}
        arrayDataDocs={arrayDataDocs}
        formatted={formatted}>
        <Component />
      </PresenterContainer>
    )
  );
}

const PresenterContainer = (props) => (
  <div
    onClick={(evt) => {
      evt.stopPropagation();
      props.onSelectPresenterForEditing(props.path);
    }}>
    {cloneElement(
      Children.only(props.children),
      {
        config: props.config,
        mapData: (props.mapDataQuery || new Map()).map(query => props.calc.evaluateFormula(query)),
        arrayData: [[]],
        arrayCells: [[]],
        arrayDataQuery: props.arrayDataQuery,
        mapDataQuery: props.mapDataQuery,
        sheet: props.sheet,
        setCellValues: (values) => { console.log(values); },
        path: props.path,
        onSelectPresenterForEditing: props.onSelectPresenterForEditing,
        renderPresenter: renderPresenter.bind(null, props.calc, props.onSelectPresenterForEditing)
      }
    )}
  </div>
);

function renderPresenter(calc, onSelectPresenterForEditing, path=[], presenter) {
  if ( !presenter || presenter.isEmpty() ) {
    return null;
  }

  const Presenter = presenterComponents[presenter.get('type')];

  return (
    <Presenter
      calc={calc}
      path={path}
      config={presenter.get('config', new Map())}
      mapDataQuery={presenter.get('mapDataQuery')}
      arrayDataQuery={presenter.get('arrayDataQuery')}
      onSelectPresenterForEditing={onSelectPresenterForEditing} />
  );
}

const presenterComponents = {};
makeCorePresenters(
  presenter,
  {
    presenterRegistry: (type, component) => {
      presenterComponents[type] = component;
    }
  }
);

export default ({ presenter, calc, onSelectPresenterForEditing }) => (
  renderPresenter(calc, onSelectPresenterForEditing, [], presenter)
);
