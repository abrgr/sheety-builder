import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';

export default ({ onSelected, availablePresenters }) => (
  <Paper
    zDepth={1}>
    <List>
      <Subheader>Core Components</Subheader>
      {availablePresenters.map(presenter => (
        <ListItem
          key={presenter.get('type')}
          primaryText={presenter.get('name')}
          onClick={onSelected.bind(null, presenter.get('type'))} />
      ))}
    </List>
  </Paper>
);
