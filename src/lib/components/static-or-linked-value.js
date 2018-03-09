import React from 'react';
import IconButton from 'material-ui/IconButton';
import LinkSheetIcon from 'material-ui/svg-icons/image/grid-on';
import { cyanA700 } from 'material-ui/styles/colors';
import { CellRef, CellRefRange } from 'sheety-model';

export default ({
  title,
  description,
  path,
  schema,
  value,
  onUpdate,
  onSetLinkPath,
  onClearLinkPath,
  children
}) => {
  const isLinked= !!CellRef.fromA1Ref(value) || !!CellRefRange.fromA1Ref(value);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row'
        }}>
        <IconButton
          tooltip={isLinked ? 'Unlink': 'Link to spreadsheet'}
          onClick={() => {
            if ( isLinked ) {
              onUpdate(path, null);
              return onClearLinkPath();
            }

            onSetLinkPath(path, schema);
          }}>
          <LinkSheetIcon
            color={isLinked ? cyanA700 : null} />
        </IconButton>
        {isLinked
          ? (
            `${title} linked to ${value}`
          ) : children}
      </div>
      {isLinked
        ? (
          <p>{description}</p>
        ) : null}
    </div>
  );
};
