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
import { schemaRegistry } from '../presenter-registry';
import { encoders, decoders } from '../formula-encoders';
import { getSchemaAtPath } from '../schema-utils';

export default ({
  presenterComponent,
  presenter,
  onUpdate,
  onEditPresenter,
  onEditAction,
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
            schema={getSchemaAtPath(schemaRegistry, presenterComponent.schema, linkPath)}
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
              onEditAction={onEditAction}
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

const FormPart = ({ schema, path, presenter, onEditPresenter, onEditAction, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { type, $ref, internallyConfigured } = schema;

  if ( internallyConfigured ) {
    return null;
  }

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
            onEditAction={onEditAction}
            onUpdate={(value) => {
              onUpdate(path, value);
            }}
            encoders={encoders}
            decoders={decoders}
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
          onEditAction={onEditAction}
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
          onEditAction={onEditAction}
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
          onEditAction={onEditAction}
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
      );
  }
};

export const ObjectFormPart = ({ schema, path, presenter, onEditPresenter, onEditAction, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { title, description, properties } = schema;
  const propKeys = Object.keys(properties || {});

  if ( propKeys.every(k => properties[k].internallyConfigured) ) {
    // if every sub-property is internally-configured, we have nothing to show
    return null;
  }

  return (
    <div>
      <h2>{title}</h2>
      <h3>{description}</h3>
      {propKeys.map(prop => (
        <FormPart
          key={prop}
          schema={properties[prop]}
          path={path.concat([prop])}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onEditAction={onEditAction}
          onUpdate={onUpdate}
          onSetLinkPath={onSetLinkPath}
          onClearLinkPath={onClearLinkPath} />
      ))}
    </div>
  );
};

const ArrayFormPart = ({ schema, path, presenter, onEditPresenter, onEditAction, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { title, description, items } = schema;
  const isTuple = Array.isArray(items);

  if ( isTuple ) {
    return (
      <ObjectFormPart
        schema={items}
        path={path}
        presenter={presenter}
        onEditPresenter={onEditPresenter}
        onEditAction={onEditAction}
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
                  onEditAction={onEditAction}
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

const FieldFormPart = ({ schema, path, presenter, onEditPresenter, onEditAction, onSetLinkPath, onClearLinkPath, onUpdate }) => {
  const { type, internallyConfigured } = schema;
  if ( internallyConfigured ) {
    return null;
  }

  switch ( type ) {
    case 'string':
      return (
        <StringFormPart
          schema={schema}
          path={path}
          presenter={presenter}
          onEditPresenter={onEditPresenter}
          onEditAction={onEditAction}
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
          onEditAction={onEditAction}
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
          onEditAction={onEditAction}
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
        value={decoders.string(isLinkable, value)}
        onChange={(evt) => {
          onUpdate(path, encoders.string(isLinkable, evt.target.value));
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
        value={decoders.string(isLinkable, value)}
        onChange={(_, _1, value) => {
          onUpdate(path, encoders.string(isLinkable, value));
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
            toggled={decoders.bool(isLinkable, value)}
            onToggle={(_, isChecked) => {
              onUpdate(path, encoders.bool(isLinkable, isChecked));
            }}/>
          <p>{description}</p>
        </div>
      </MaybeWithLink>
    </div>
  );
};

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
          value={decoders.int(isLinkable, value)}
          onChange={(_, newVal) => {
            onUpdate(path, encoders.int(isLinkable, newVal));
          }} />
      </div>
    </MaybeWithLink>
  );
};
