import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';

export default ({ onSelected, presentersByType }) => (
  <Paper
    zDepth={1}>
    <List>
      <Subheader>Core Components</Subheader>
      {presentersByType.entrySeq().map(([type, { schema }]) => (
        !!schema
          ? (
            <ListItem
              key={type}
              primaryText={schema.get('title')}
              onClick={onSelected.bind(null, type)} />
          ) : null
      ))}
    </List>
  </Paper>
);
