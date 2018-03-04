import React, { cloneElement, Children } from 'react';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';
import AJV from 'ajv';
import { CellRefRange } from 'sheety-model';
import { green400, grey400 } from 'material-ui/styles/colors';
import makeCorePresenters from 'sheety-core-presenters/dist/builder';
import configurersAndSchemasBySchemaURI from 'sheety-core-presenters/dist/configurer';

const ajv = new AJV({ useDefaults: true });

configurersAndSchemasBySchemaURI.valueSeq().forEach(schemaAndUri => {
  ajv.addSchema(schemaAndUri.get('schema').toJS());
});

// TODO: figure out some way to share this code with sheety-app's presenter

function makePresenter(shouldHandleClicks) {
  return ({ formatted, schema }) => {
    return (Component) => {
      const WrappedComponent = (props) => (
        <PresenterContainer
          {...props}
          formatted={formatted}
          shouldHandleClicks={shouldHandleClicks}>
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
  };
}

function equalPaths(path, selectedPath) {
  if ( (!path ^ selectedPath)
    || path.length !== selectedPath.length ) {
    return false;
  }

  return path.every((p, idx) => p === selectedPath[idx]);
}

const PresenterContainer = connect(
  ({ editor }) => ({
    calc: editor.get('calc')
  })
)(
  (props) => (
    <div
      style={props.shouldHandleClicks
        ? {
          border: equalPaths(props.path, props.selectedPath)
                ? `2px solid ${green400}`
                : `2px dashed ${grey400}`,
          margin: 5,
          minHeight: 10,
          minWidth: 5
        } : undefined}
      onClick={(evt) => {
        if ( props.shouldHandleClicks ) {
          evt.stopPropagation();
          props.onSelectPresenterForEditing(props.path);
        }
      }}>
      {cloneElement(
        Children.only(props.children),
        {
          config: props.config,
          mapData: (props.mapDataQuery || new Map()).map(query => props.calc.evaluateFormula(query)),
          arrayData: getArrayData(props.calc, props.arrayDataQuery, props.formatted),
          arrayCells: getArrayCells(props.calc, props.arrayDataQuery),
          arrayDataQuery: props.arrayDataQuery,
          mapDataQuery: props.mapDataQuery,
          sheet: props.sheet,
          setCellValues: (values) => { console.log(values); },
          path: props.path,
          onSelectPresenterForEditing: props.onSelectPresenterForEditing,
          renderPresenter: renderPresenter.bind(null, props.presentersByType, props.calc, props.selectedPath, props.onSelectPresenterForEditing, props.path)
        }
      )}
    </div>
  )
);

function getArrayData(calc, query, formatted) {
  if ( !query ) {
    return []; // TODO: logging?
  }

  const a1Range = CellRefRange.fromA1Ref(query);
  if ( !a1Range ) {
    return [];
  }

  const matrix = formatted
               ? calc.getFormattedRange(a1Range)
               : calc.getRange(a1Range);
  const maxCols = matrix.reduce((max, row) => (
    !!row ? Math.max(max, row.length) : max
  ), 0);
  return matrix.map(row => {
    const r = row || [];
    return r.concat(getSpacer(maxCols - r.length))
  });
}

function getArrayCells(calc, query) {
  if ( !query ) {
    return [];
  }

  const rangeRef = CellRefRange.fromA1Ref(query);

  if ( !rangeRef ) {
    return [];
  }

  const sheet = calc.sheet;
  return sheet.mapRange(
    rangeRef,
    sheet.getCell.bind(sheet)
  );
}

function getSpacer(len) {
  const spacer = [];
  for ( let i = 0; i < len; ++i ) {
    spacer.push('');
  }
  return spacer;
}

export function renderPresenter(presentersByType, calc, selectedPath, onSelectPresenterForEditing, basePath, nextPath, presenter) {
  const Presenter = presenter && presentersByType.get(presenter.get('type'));
  const path = basePath.concat(nextPath);

  if ( !Presenter ) {
    return null;
  }

  return (
    <Presenter
      calc={calc}
      sheet={calc.sheet}
      path={path}
      selectedPath={selectedPath}
      config={presenter.get('config', new Map())}
      mapDataQuery={presenter.get('mapData')}
      arrayDataQuery={presenter.get('arrayData')}
      onSelectPresenterForEditing={onSelectPresenterForEditing}
      presentersByType={presentersByType}/>
  );
}

export default function loadPresenters(shouldHandleClicks=true) {
  let presentersByType = new Map();
  makeCorePresenters(
    makePresenter(shouldHandleClicks),
    {
      presenterRegistry: (type, component) => {
        presentersByType = presentersByType.set(type, component);
      }
    }
  );

  return presentersByType;
}
