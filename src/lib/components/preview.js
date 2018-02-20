import React, { cloneElement, Children } from 'react';
import { Map } from 'immutable';
import makeCorePresenters from 'sheety-core-presenters/dist/app';

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
  <div onClick={() => console.log('clicked')}>
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
        renderPresenter: renderPresenter.bind(null, props.calc, props.idChain)
      }
    )}
  </div>
);

function renderPresenter(calc, idChain = [], presenter) {
  if ( !presenter || presenter.isEmpty() ) {
    return null;
  }

  const Presenter = presenterComponents[presenter.get('type')];
  return (
    <Presenter
      calc={calc}
      idChain={idChain.concat([presenter.get('id')])}
      config={presenter.get('config', new Map())} />
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

export default ({ presenter, calc }) => (
  renderPresenter(calc, [], presenter)
);
