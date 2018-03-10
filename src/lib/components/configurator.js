import React from 'react';
import { fromJS, Map, List } from 'immutable';
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
import { schemaRegistry } from '../presenter-registry';

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

  const effectiveSchema = schema.get('$ref')
                        ? fromJS(schemaRegistry.getSchema(schema.get('$ref')).schema)
                        : schema;

  if ( !path.length ) {
    return effectiveSchema;
  }

  const firstPart = path[0];

  const propertyMatch = effectiveSchema.getIn(['properties', firstPart]);
  if ( propertyMatch ) {
    return getSchemaAtPath(propertyMatch, path.slice(1));
  }

  const arrayMatch = effectiveSchema.get('type') === 'array'
                   ? effectiveSchema.get('items')
                   : null;
  if ( arrayMatch ) {
    return getSchemaAtPath(arrayMatch, path.slice(1));
  }

  // TODO: more?
  return null;
};

const MaybeWithLink = ({
  linkable,
  title,
  description,
  path,
  schema,
  value,
  onUpdate,
  onSetLinkPath,
  onClearLinkPath,
  children
}) => (
  linkable
    ? (
      <StaticOrLinkedValue
        title={title}
        description={description}
        path={path}
        schema={schema}
        value={'' + value}
        onUpdate={onUpdate}
        onSetLinkPath={onSetLinkPath}
        onClearLinkPath={onClearLinkPath}>
        <div>
          {children}
        </div>
      </StaticOrLinkedValue>
    ) : (
      <div>
        {children}
      </div>
    )
);

const FormPart = ({ schema, path, presenter, onEditPresenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { type, $ref } = schema;

  if ( $ref ) {
    const Configurer = configurersAndSchemasBySchemaURI.getIn([$ref, 'configurer']);
    const linkable = configurersAndSchemasBySchemaURI.getIn([$ref, 'linkable']);
    const value = presenter.getIn(path);
    const { title, description } = schema;

    return Configurer
      ? (
        <MaybeWithLink
          linkable={linkable}
          title={title}
          description={description}
          path={path}
          schema={schema}
          value={'' + value}
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath}>
          <Configurer
            schema={configurersAndSchemasBySchemaURI.getIn([$ref, 'schema'])}
            path={path}
            value={value}
            title={title}
            description={description}
            presenter={presenter}
            onEditPresenter={onEditPresenter}
            onUpdate={(value) => {
              onUpdate(path, value);
            }}
            onSetLinkPath={onSetLinkPath}
            onClearLinkPath={onClearLinkPath} />
        </MaybeWithLink>
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
  const isTuple = Array.isArray(items);

  if ( isTuple ) {
    return (
      <ObjectFormPart
        schema={items}
        path={path}
        presenter={presenter}
        onEditPresenter={onEditPresenter}
        onSetLinkPath={onSetLinkPath}
        onClearLinkPath={onClearLinkPath}
        onUpdate={onUpdate} />
    );
  }

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

const stringFromFormula = (isLinkable, formula) => (
  isLinkable
    ?  ('' + formula).replace(/^'/, '').replace(/'$/, '')
    : formula
);

const stringToFormula = (isLinkable, str) => (
  isLinkable
    ? `'${str}'`
    : str
);

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
  const isLinkable = schema.linkable !== false;

  return (
    <MaybeWithLink
      linkable={isLinkable}
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
        value={stringFromFormula(isLinkable, value)}
        onChange={(evt) => {
          onUpdate(path, stringToFormula(isLinkable, evt.target.value));
        }} />
    </MaybeWithLink>
  );
};

const EnumFormPart = ({ schema, path, presenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { title, description } = schema;
  const value = presenter.getIn(path, '');
  const isLinkable = schema.linkable !== false;

  return (
    <MaybeWithLink
      linkable={isLinkable}
      title={title}
      description={description}
      path={path}
      schema={schema}
      value={value}
      onUpdate={onUpdate}
      onSetLinkPath={onSetLinkPath}
      onClearLinkPath={onClearLinkPath}>
      <SelectField
        floatingLabelText={title}
        hintText={description}
        value={stringFromFormula(isLinkable, value)}
        onChange={(_, _1, value) => {
          onUpdate(path, stringToFormula(isLinkable, value));
        }}>
        {schema.enum.map(enumVal => (
          <MenuItem
            key={enumVal}
            value={enumVal}
            primaryText={enumVal} />
        ))}
      </SelectField>
    </MaybeWithLink>
  );
};

const boolFromFormula = (isLinkable, formula) => (
  isLinkable
    ? ('' + formula).toLowerCase() === 'true'
    : formula
);

const boolToFormula = (isLinkable, b) => (
  isLinkable
    ? (!!b ? 'true' : 'false')
    : b
);

const BooleanFormPart = ({ schema, path, presenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { title, description } = schema;
  const value = presenter.getIn(path, false);
  const isLinkable = schema.linkable !== false;

  return (
    <div>
      <MaybeWithLink
        linkable={isLinkable}
        title={title}
        description={description}
        path={path}
        schema={schema}
        value={'' + value}
        onUpdate={onUpdate}
        onSetLinkPath={onSetLinkPath}
        onClearLinkPath={onClearLinkPath}>
        <div>
          <Toggle
            label={title}
            toggled={boolFromFormula(isLinkable, value)}
            onToggle={(_, isChecked) => {
              onUpdate(path, boolToFormula(isLinkable, isChecked));
            }}/>
          <p>{description}</p>
        </div>
      </MaybeWithLink>
    </div>
  );
};

const intFromFormula = (isLinkable, formula) => (
  isLinkable
    ? parseInt('' + formula, 10)
    : formula
);

const intToFormula = (isLinkable, i) => (
  isLinkable
    ? '' + i
    : i
);

const IntegerFormPart = ({ schema, path, presenter, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { title, description } = schema;
  const value = presenter.getIn(path);
  const isLinkable = schema.linkable !== false;

  return (
    <MaybeWithLink
      linkable={isLinkable}
      title={title}
      description={description}
      path={path}
      schema={schema}
      value={'' + value}
      onUpdate={onUpdate}
      onSetLinkPath={onSetLinkPath}
      onClearLinkPath={onClearLinkPath}>
      <div>
        <p>{title} - {description}:</p>
        <p>{presenter.getIn(path)}</p>
        <Slider
          min={schema.minimum || 0}
          max={schema.maximum || 1000}
          step={1}
          value={intFromFormula(isLinkable, value)}
          onChange={(_, newVal) => {
            onUpdate(path, intToFormula(isLinkable, newVal));
          }} />
      </div>
    </MaybeWithLink>
  );
};
