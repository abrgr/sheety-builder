import React from 'react';
import { Map, List } from 'immutable';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import { List as MList, ListItem } from 'material-ui/List';
import AddIcon from 'material-ui/svg-icons/content/add';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Slider from 'material-ui/Slider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import SheetLinker from './sheet-linker';
import StaticOrLinkedValue from './static-or-linked-value';
import configurersAndSchemasBySchemaURI from 'sheety-core-presenters/dist/configurer';

export default ({
  presenterComponent,
  presenter,
  onUpdate,
  onEditPresenter,
  onSetLinkPath,
  onClearLinkPath,
  linkPath,
  calc
}) => {
  if ( !presenterComponent ) {
    // TODO: render presenter schema
    return null;
  }

  const schema = presenterComponent.schema.toJS();
  const { title, description, properties } = schema;
  const usablePresenter = presenter || new Map();

  return (
    <div>
      {linkPath
        ? (
          <SheetLinker
            calc={calc}
            value={usablePresenter.getIn(linkPath)}
            schema={getSchemaAtPath(presenterComponent.schema, linkPath)}
            onUpdate={(val) => {
              onUpdate(linkPath, val);
            }}
            onClearLinkPath={onClearLinkPath} />
        ) : null}
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
              onSetLinkPath={onSetLinkPath}
              onClearLinkPath={onClearLinkPath}
              presenter={usablePresenter} />
          ))}
        </CardText>
      </Card>
    </div>
  );
};

const getSchemaAtPath = (schema, path) => {
  if ( !schema ) {
    return null;
  }

  const firstPart = path[0];

  const propertyMatch = schema.getIn(['properties', firstPart]);
  if ( propertyMatch ) {
    return getSchemaAtPath(propertyMatch, path.slice(1));
  }

  const arrayMatch = schema.get('type') === 'array'
                   ? schema.get('items')
                   : null;
  if ( arrayMatch ) {
    return getSchemaAtPath(arrayMatch, path.slice(1));
  }

  // TODO: more?
  return null;
};

const FormPart = ({ schema, path, presenter, onEditPresenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
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
          }}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
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
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
      );
    case 'array':
      return (
        <ArrayFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
      );
    default:
      return (
        <FieldFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
      );
  }
};

const ObjectFormPart = ({ schema, path, presenter, onEditPresenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
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
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
      ))}
    </div>
  );
};

const ArrayFormPart = ({ schema, path, presenter, onEditPresenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
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
                  onSetLinkPath={onSetLinkPath}
                  onClearLinkPath={onClearLinkPath}
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

const FieldFormPart = ({ schema, path, presenter, onEditPresenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { type } = schema;
  switch ( type ) {
    case 'string':
      return (
        <StringFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
      );
    case 'boolean':
      return (
        <BooleanFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
      );
    case 'integer':
      return (
        <IntegerFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
      );
    default:
      return (
        <p>
          Oops.  We have no configurer for a {type}.
        </p>
      );
  }
};

const StringFormPart = ({ schema, path, presenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { title, description } = schema;

  if ( !!schema.enum ) {
    return (
      <EnumFormPart
        schema={schema}
        path={path}
        presenter={presenter}
        onUpdate={onUpdate}
        onSetLinkPath={onSetLinkPath}
        onClearLinkPath={onClearLinkPath} />
    );
  }

  const value = presenter.getIn(path, '');

  return (
    <StaticOrLinkedValue
      title={title}
      description={description}
      path={path}
      schema={schema}
      value={value}
      onUpdate={onUpdate}
      onSetLinkPath={onSetLinkPath}
      onClearLinkPath={onClearLinkPath}>
      <TextField
        floatingLabelText={title}
        hintText={description}
        value={value || ''}
        onChange={(evt) => {
          onUpdate(path, evt.target.value);
        }} />
    </StaticOrLinkedValue>
  );
};

const EnumFormPart = ({ schema, path, presenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { title, description } = schema;
  return (
    <SelectField
      floatingLabelText={title}
      hintText={description}
      value={presenter.getIn(path, '')}
      onChange={(_, _1, value) => {
        onUpdate(path, value);
      }}>
      {schema.enum.map(enumVal => (
        <MenuItem
          key={enumVal}
          value={enumVal}
          primaryText={enumVal} />
      ))}
    </SelectField>
  );
};

const BooleanFormPart = ({ schema, path, presenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
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

const IntegerFormPart = ({ schema, path, presenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { title, description } = schema;
  return (
    <div>
      <p>{title} - {description}:</p>
      <p>{presenter.getIn(path)}</p>
      <Slider
        min={schema.minimum || 0}
        max={schema.maximum || 1000}
        step={1}
        value={presenter.getIn(path)}
        onChange={(_, newVal) => {
          onUpdate(path, newVal);
        }} />
    </div>
  );
};
