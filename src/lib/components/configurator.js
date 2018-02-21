import React from 'react';
import { Map, List } from 'immutable';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import WysiwygEditor from './wysiwyg-editor';

export default ({
  presenterDescriptor,
  presenter,
  onUpdatePresenter,
  onEditPresenter
}) => {
  if ( !presenterDescriptor ) {
    return null;
  }

  const arrayData = presenterDescriptor.get('arrayData');

  return (
    <Card>
      <CardHeader
        title={`Configuration for ${presenterDescriptor.get('name')}`} />
      <CardText>
        <TextField
          floatingLabelText="Presenter ID"
          value={presenter.get('id', '')}
          onChange={evt => {
            onUpdatePresenter(presenter.set('id', evt.target.value));
          }} />
        {presenterDescriptor.get('config').map((desc, name) => (
          <ConfigItem
            key={name}
            name={name}
            desc={desc}
            onEditPresenter={(path) => {
              onEditPresenter(['config', name].concat(path));
            }}
            value={presenter.getIn([ 'config', name ])}
            onUpdate={(newValue) => {
              onUpdatePresenter(presenter.setIn([ 'config', name ], newValue));
            }}/>
        )).valueSeq()}
        {presenterDescriptor.get('mapDataQuery').map((desc, name) => (
          <ConfigItem
            key={name}
            name={name}
            desc={desc}
            onEditPresenter={(path) => {
              onEditPresenter(['mapDataQuery', name].concat(path));
            }}
            value={presenter.getIn([ 'mapDataQuery', name ])}
            onUpdate={(newValue) => {
              onUpdatePresenter(presenter.setIn([ 'mapDataQuery', name ], newValue));
            }} />
        )).valueSeq()}
        {arrayData
          ? (
            <ConfigItem
              name='arrayData'
              desc={null}
              onEditPresenter={(path) => {
                onEditPresenter(['arrayData'].concat(path));
              }}
              value={presenter.get('arrayData')} />
          ) : null}
      </CardText>
    </Card>
  );
};

const ConfigItem = ({
  name,
  desc,
  value,
  onUpdate,
  onEditPresenter
}) => {
  const Configurer = configByType.get(desc.get('type'));

  if ( !Configurer ) {
    return (
      <p>Bad configurer: {desc.get('type')}</p>
    );
  }

  return (
    <div>
      <h3>{name}</h3>
      <Configurer
        desc={desc}
        value={value}
        onEditPresenter={onEditPresenter}
        onUpdate={onUpdate} />
    </div>
  );
};

const RowsConfigurer = ({ value, onUpdate, onEditPresenter }) => (
  <div>
    {(value || new List()).map((row, rowIdx) => (
      <div
        key={`row-${rowIdx}`}
        style={{ border: '2px solid black' }}>
        {row.map((col, colIdx) => (
          <div key={`col-${colIdx}`}>
            <p>Width:</p>
            <input
              type="number"
              value={col.get('width')}
              onChange={evt => {
                onUpdate(value.setIn([ rowIdx, colIdx, 'width' ], evt.target.value))
              }} />
            <p>Presenter:</p>
            <button
              onClick={() => {
                onEditPresenter([rowIdx, colIdx, 'presenter'])
              }}>
              Set presenter
            </button>
          </div>
        ))}
      {row.size < 12
        ? (
          <button
            onClick={() => {
              onUpdate(value.update(rowIdx, r => r.push(new Map({ presenter: null, width: 1 }))));
            }}>
            Add cell
          </button>
        ) : null}
      </div>
    ))}
    <button
      onClick={() => {
        onUpdate((value || new List()).push(new List()));
      }}>
      Add row
    </button>
  </div>
);

const ContentConfigurer = ({ desc, value, onUpdate }) => (
  <WysiwygEditor
    value={value}
    onUpdate={onUpdate} />
);

const FormulaConfigurer = ({ value, onUpdate }) => (
  <div>
    <TextField
      floatingLabelText="Formula"
      value={value || ''}
      onChange={evt => {
        onUpdate(evt.target.value);
      }} />
  </div>
);

const configByType = new Map({
  rows: RowsConfigurer,
  'wysiwyg-content': ContentConfigurer,
  formula: FormulaConfigurer
});
