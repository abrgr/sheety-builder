import React, { Component, cloneElement, Children } from 'react';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';
import AJV from 'ajv';
import { CellRefRange } from 'sheety-model';
import { green400 } from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper';
import makeCorePresenters from 'sheety-core-presenters/dist/builder';
import configurersAndSchemasBySchemaURI from 'sheety-core-presenters/dist/configurer';
import { encoders, decoders } from './formula-encoders';

export const schemaRegistry = new AJV({ useDefaults: true });

configurersAndSchemasBySchemaURI.valueSeq().forEach(schemaAndUri => {
  schemaRegistry.addSchema(schemaAndUri.get('schema').toJS());
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
      WrappedComponent.validateSchema = schema ? schemaRegistry.compile(schema.toJS()) : () => true;
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

class PresenterContainer_ extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isHovered: false
    };
  }

  componentDidMount() {
    const {
      path,
      selectedPath,
      onSelectPresenterForEditing
    } = this.props;

    if ( equalPaths(path, selectedPath) ) {
      onSelectPresenterForEditing(selectedPath, this.el);
    }
  }

  componentWillReceiveProps(nextProps) {
    if ( !equalPaths(nextProps.selectedPath, this.props.selectedPath)
      && equalPaths(nextProps.selectedPath, nextProps.path) ) {
        nextProps.onSelectPresenterForEditing(nextProps.selectedPath, this.el);
      }
  }

  render() {
    const {
      shouldHandleClicks,
      path,
      selectedPath,
      onSelectPresenterForEditing,
      onUpdate,
      children,
      config,
      mapDataQuery,
      calc,
      arrayDataQuery,
      formatted,
      sheet,
      presentersByType
    } = this.props;

    const { isHovered } = this.state;
    const isEditing = equalPaths(path, selectedPath);

    return (
      <div
        ref={ref => { this.el = ref; }}>
        <Paper
          zDepth={isHovered ? 2 : 0}
          style={shouldHandleClicks
            ? {
              border: isEditing
                    ? `2px solid ${green400}`
                    : undefined,
              margin: 5,
              minHeight: 10,
              minWidth: 5
            } : undefined}
          onClick={(evt) => {
            if ( shouldHandleClicks ) {
              evt.stopPropagation();
              onSelectPresenterForEditing(path, this.el);
            }
          }}
          onMouseMove={evt => {
            this.setState({
              isHovered: true
            });
          }}
          onMouseOut={evt => {
            this.setState({
              isHovered: false
            });
          }}>
          {cloneElement(
            Children.only(children),
            {
              isEditing,
              encoders,
              decoders,
              config,
              mapData: (mapDataQuery || new Map()).map(query => calc.evaluateFormula(query)),
              arrayData: getArrayData(calc, arrayDataQuery, formatted),
              arrayCells: getArrayCells(calc, arrayDataQuery),
              arrayDataQuery,
              mapDataQuery,
              sheet,
              setCellValues: (values) => { console.log(values); },
              path,
              onSelectPresenterForEditing,
              onUpdate,
              selectedPath,
              renderPresenter: renderPresenter.bind(null, presentersByType, calc, selectedPath, onSelectPresenterForEditing, onUpdate, path)
            }
          )}
        </Paper>
      </div>
    );
  }
}

const PresenterContainer = connect(
  ({ editor }) => ({
    calc: editor.get('calc')
  })
)(PresenterContainer_);

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

const PlaceholderPresenter = makePresenter(true)({})(
  () => (
    <div />
  )
);

export function renderPresenter(
  presentersByType,
  calc,
  selectedPath,
  onSelectPresenterForEditing,
  onUpdate,
  basePath,
  nextPath,
  presenter
) {
  const Presenter = presenter && presentersByType.get(presenter.get('type'));
  const path = basePath.concat(nextPath);

  if ( !Presenter ) {
    return (
      <PlaceholderPresenter
        path={path}
        selectedPath={selectedPath}
        onUpdate={onUpdate}
        onSelectPresenterForEditing={onSelectPresenterForEditing} />
    );
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
      onUpdate={onUpdate}
      presentersByType={presentersByType} />
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
