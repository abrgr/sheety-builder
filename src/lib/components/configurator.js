import React from 'react';
import { Map, List } from 'immutable';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import { List as MList, ListItem } from 'material-ui/List';
import AddIcon from 'material-ui/svg-icons/content/add';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Slider from 'material-ui/Slider';
import configurersAndSchemasBySchemaURI from 'sheety-core-presenters/dist/configurer';

import 'react-quill/dist/quill.snow.css';

export default ({
  presenterComponent,
  presenter,
  onUpdate,
  onEditPresenter
}) => {
  if ( !presenterComponent ) {
    // TODO: render presenter schema
    return null;
  }

  const schema = presenterComponent.schema.toJS();
  const { title, description, properties } = schema;

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={description} />
      <CardText>
        {Object.keys(properties || {}).map(prop => (
          <FormPart
            key={prop}
            schema={properties[prop]}
            path={[prop]}
            onEditPresenter={onEditPresenter}
            onUpdate={onUpdate}
            presenter={presenter || new Map()} />
        ))}
      </CardText>
    </Card>
  );
};

const FormPart = ({ schema, path, presenter, onEditPresenter, onUpdate }) => {
  const { type, $ref } = schema;

  if ( $ref ) {
    const Configurer = configurersAndSchemasBySchemaURI.getIn([$ref, 'configurer']);
    return Configurer
      ? (
        <Configurer
          schema={configurersAndSchemasBySchemaURI.getIn([$ref, 'schema'])}
          path={path}
          value={presenter.getIn(path, '')}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={(value) => {
            onUpdate(path, value);
          }}/>
      ) : (
        <p>
          Oops, we have no configurer for a {$ref}.
        </p>
      );
  }

  if ( schema.hasOwnProperty('const') ) {
    // const means that there's nothing to configure
    return null;
  }

  switch ( type ) {
    case 'object':
      return (
        <ObjectFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate} />
      );
    case 'array':
      return (
        <ArrayFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate} />
      );
    default:
      return (
        <FieldFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate} />
      );
  }
};

const ObjectFormPart = ({ schema, path, presenter, onEditPresenter, onUpdate }) => {
  const { title, description, properties } = schema;
  return (
    <div>
      <h2>{title}</h2>
      <h3>{description}</h3>
      {Object.keys(properties || {}).map(prop => (
        <FormPart
          key={prop}
          schema={properties[prop]}
          path={path.concat([prop])}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate} />
      ))}
    </div>
  );
};

const ArrayFormPart = ({ schema, path, presenter, onEditPresenter, onUpdate }) => {
  const { title, description, items } = schema;
  const presenterItems = presenter.getIn(path, new List());
  return (
    <div>
      <h2>{title}</h2>
      <h3>{description}</h3>
      <MList>
        {presenterItems.map((item, idx) => (
          <div key={`item-${idx}`}>
            <ListItem
              primaryText={`Item ${idx + 1}`}>
              <FormPart
                  key={`item-${idx}`}
                  schema={items}
                  path={path.concat([idx])}
                  onEditPresenter={onEditPresenter}
                  onUpdate={onUpdate}
                  presenter={presenter} />
            </ListItem>
          </div>
        ))}
        <FloatingActionButton
          onClick={() => {
            const defaultVal = {
              object: new Map(),
              array: new List(),
              string: ''
            }[items.type];
            onUpdate(path, presenterItems.push(defaultVal));
          }}>
          <AddIcon />
        </FloatingActionButton>
      </MList>
    </div>
  );
};

const FieldFormPart = ({ schema, path, presenter, onEditPresenter, onUpdate }) => {
  const { type } = schema;
  switch ( type ) {
    case 'string':
      return (
        <StringFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate} />
      );
    case 'boolean':
      return (
        <BooleanFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate} />
      );
    case 'integer':
      return (
        <IntegerFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate} />
      );
    default:
      return (
        <p>
          Oops.  We have no configurer for a {type}.
        </p>
      );
  }
};

const StringFormPart = ({ schema, path, presenter, onUpdate }) => {
  const { title, description } = schema;
  return (
    <TextField
      floatingLabelText={title}
      hintText={description}
      value={presenter.getIn(path, '')}
      onChange={(evt) => {
        onUpdate(path, evt.target.value);
      }}/>
  );
};

const BooleanFormPart = ({ schema, path, presenter, onUpdate }) => {
  const { title, description } = schema;
  return (
    <div>
      <Toggle
        label={title}
        toggled={presenter.getIn(path, '')}
        onToggle={(_, isChecked) => {
          onUpdate(path, isChecked);
        }}/>
      <p>{description}</p>
    </div>
  );
};

const IntegerFormPart = ({ schema, path, presenter, onUpdate }) => {
  const { title, description } = schema;
  return (
    <div>
      <Slider
        min={schema.minimum || 0}
        max={schema.maximum || 1000}
        step={1}
        value={presenter.getIn(path)}
        onChange={(_, newVal) => {
          onUpdate(path, newVal);
        }} />
      <p>{description}</p>
    </div>
  );
};

const RowsConfigurer = ({ value, onUpdate, onEditPresenter }) => (
  <div>
    {(value || new List()).map((row, rowIdx) => (
      <div
        key={`row-${rowIdx}`}
        style={{ border: '2px solid black' }}>
        {row.map((col, colIdx) => (
          <div key={`col-${colIdx}`}>
            <p>Width:</p>
            <input
              type="number"
              value={col.get('width')}
              onChange={evt => {
                onUpdate(value.setIn([ rowIdx, colIdx, 'width' ], evt.target.value))
              }} />
            <p>Presenter:</p>
            <button
              onClick={() => {
                onEditPresenter([rowIdx, colIdx, 'presenter'])
              }}>
              Set presenter
            </button>
          </div>
        ))}
      {row.size < 12
        ? (
          <button
            onClick={() => {
              onUpdate(value.update(rowIdx, r => r.push(new Map({ presenter: null, width: 1 }))));
            }}>
            Add cell
          </button>
        ) : null}
      </div>
    ))}
    <button
      onClick={() => {
        onUpdate((value || new List()).push(new List()));
      }}>
      Add row
    </button>
  </div>
);
