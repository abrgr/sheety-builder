import { Iterable } from 'immutable';

export default function(mappers, params) {
  if ( !params ) {
    return null;
  }

  const isIterable = Iterable.isIterable(params);

  return mappers.map((mapper, key) => (
    mapper(isIterable ? params.get(key) : params[key])
  ));
}
