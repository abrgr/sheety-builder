import React from 'react';

export default ({ onSelected, availablePresenters }) => (
  <div>
    <p>Available Components</p>
    <ul>
      {availablePresenters.map(presenter => (
        <li key={presenter.get('type')}>
          <button onClick={onSelected.bind(null, presenter.get('type'))}>
            {presenter.get('name')}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
