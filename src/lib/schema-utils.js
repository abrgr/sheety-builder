import { fromJS } from 'immutable';

export function getSchemaAtPath(schemaRegistry, schema, path) {
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
    return getSchemaAtPath(schemaRegistry, propertyMatch, path.slice(1));
  }

  const arrayMatch = effectiveSchema.get('type') === 'array'
                   ? effectiveSchema.get('items')
                   : null;
  if ( arrayMatch ) {
    return getSchemaAtPath(schemaRegistry, arrayMatch, path.slice(1));
  }

  // TODO: more?
  return null;
};
