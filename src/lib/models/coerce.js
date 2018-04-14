import { Iterable, Map } from 'immutable';

export default function(mappers, params) {
  if ( !params ) {
    return null;
  }

  const isIterable = Iterable.isIterable(params);

  return mappers.map((mapper, key) => (
    mapper(isIterable ? params.get(key) : params[key])
  ));
}

const nullableObjOfType = Type => (
  val => !!val ? new Type(val) : null
);

export const propCoercers = {
  nullableString: val => !!val ? '' + val : null,
  nullableNumber: val => typeof val === 'undefined' || val === null ? null : +val,
  nullableDate: nullableObjOfType(Date),
  nullableObjOfType,
  mapOfType: Type => (
    m => new Map(m ? m : null).map(val => new Type(val))
  ),
}
