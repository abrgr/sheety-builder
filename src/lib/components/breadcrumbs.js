import React from 'react';
import { List } from 'immutable';
import FlatButton from 'material-ui/FlatButton';

export default ({ items, maxItems, filterFn, nameFn, onSelectPath }) => {
  const homeIsVisible = filterFn(new List());
  const enhancedItems = List.of({
    path: [],
    isVisible: homeIsVisible,
    name: homeIsVisible ? nameFn(new List()) : ''
  }).concat(
    items.map((item, idx) => {
      const path = items.slice(0, idx + 1);
      const isVisible = filterFn(path);

      return {
        path: path.toJS(),
        isVisible,
        name: isVisible ? nameFn(path) : ''
      };
    })
  );
  const visibleItems = enhancedItems.filter(i => i.isVisible);
  const totalVisible = visibleItems.size;

  return (
    <div>
      {totalVisible > maxItems
        ? ([
          <FlatButton
            key='btn'
            onClick={() => onSelectPath(visibleItems.get(-maxItems - 1).path)}>
            ...
          </FlatButton>,
          <span key='sep'>/</span>
        ]) : null}
      {visibleItems.slice(-maxItems).map(item => (
        <FlatButton
          key={item.path.join('|')}
          onClick={() => onSelectPath(item.path)}>
          {item.name}
        </FlatButton>
      )).interpose('/')}
    </div>
  );
};
