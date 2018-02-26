import React from 'react';
import Paper from 'material-ui/Paper';
import { grey200 } from 'material-ui/styles/colors';
import { renderPresenter } from '../presenter-registry';

const Placeholder = () => (
  <Paper
    zDepth={1}
    style={{ backgroundColor: grey200 }}>
    Add a presenter
  </Paper>
);

export default ({
  presentersByType,
  presenter,
  calc,
  selectedPath,
  onSelectPresenterForEditing
}) => {
  const Presenter = presenter && presentersByType.get(presenter.get('type'));
  return !!Presenter
    ? renderPresenter(presentersByType, calc, selectedPath, onSelectPresenterForEditing, [], [], presenter)
    : (
      <Placeholder />
    )
};
