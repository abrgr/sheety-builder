import React, { cloneElement, Children } from 'react';
import { Map, fromJS } from 'immutable';
import AJV from 'ajv';
import makeCorePresenters from 'sheety-core-presenters/dist/builder';
import configurersAndSchemasBySchemaURI from 'sheety-core-presenters/dist/configurer';

const ajv = new AJV({ useDefaults: true });

configurersAndSchemasBySchemaURI.valueSeq().forEach(schemaAndUri => {
  ajv.addSchema(schemaAndUri.get('schema').toJS());
});

// TODO: figure out some way to share this code with sheety-app's presenter

function presenter({ formatted, schema }) {
  return (Component) => {
    const WrappedComponent = (props) => (
      <PresenterContainer
        {...props}
        formatted={formatted}>
        <Component />
      </PresenterContainer>
    );

    WrappedComponent.schema = schema;
    WrappedComponent.validateSchema = schema ? ajv.compile(schema.toJS()) : () => true;
    WrappedComponent.defaultPresenter = () => {
      const p = {};
      WrappedComponent.validateSchema(p);
      return fromJS(p);
    };

    return WrappedComponent;
  };
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
        renderPresenter: renderPresenter.bind(null, props.presentersByType, props.calc, props.onSelectPresenterForEditing, props.path)
      }
    )}
  </div>
);

export function renderPresenter(presentersByType, calc, onSelectPresenterForEditing, path=[], presenter) {
  const Presenter = presenter && presentersByType.get(presenter.get('type'));

  if ( !Presenter ) {
    return null;
  }

  return (
    <Presenter
      calc={calc}
      path={path}
      config={presenter.get('config', new Map())}
      mapDataQuery={presenter.get('mapData')}
      arrayDataQuery={presenter.get('arrayData')}
      onSelectPresenterForEditing={onSelectPresenterForEditing}
      presentersByType={presentersByType}/>
  );
}

export default function loadPresenters() {
  let presentersByType = new Map();
  makeCorePresenters(
    presenter,
    {
      presenterRegistry: (type, component) => {
        presentersByType = presentersByType.set(type, component);
      }
    }
  );

  return presentersByType;
}
