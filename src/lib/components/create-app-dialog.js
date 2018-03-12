import React, { Component } from 'react';
import { App } from '../models';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import ModifiableImg from './modifiable-img';

export default class CreateAppDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      app: new App(),
      src: null,
      blob: null
    };
  }

  render() {
    const {
      open,
      onRequestClose,
      onCreate
    } = this.props;

    const { app, src, blob } = this.state;

    return (
      <Dialog
        title="Create an app"
        actions={[
          (
            <FlatButton
              label="Cancel"
              onClick={onRequestClose} />
          ),
          (
            <FlatButton
              label="Create"
              primary={true}
              disabled={!App.isValid(app)}
              onClick={() => {
                onCreate(app, blob);
              }} />
          )
        ]}
        modal={false}
        open={open}
        onRequestClose={onRequestClose}
        autoScrollBodyContent={true}>
        <div>
          <SelectField
            floatingLabelText="App type"
            value={app.get('platform')}
            onChange={(_, _1, value) => {
              this.setState({
                app: app.set('platform', value)
              });
            }}>
            {Object.keys(App.Platforms).map(platform => (
              <MenuItem
                key={platform}
                value={App.Platforms[platform]}
                primaryText={App.Platforms[platform]} />
            ))}
          </SelectField>
        </div>
        <div>
          <TextField
            floatingLabelText="App Name"
            value={app.get('name')}
            onChange={evt => {
              this.setState({
                app: app.set('name', evt.target.value)
              });
            }} />
        </div>
        <ModifiableImg
          src={src}
          alt={app.get('name')}
          width={200}
          height={200}
          onChange={blob => {
            this.setState({
              blob
            });

            const fileReader = new FileReader();
            fileReader.onload = e => {
              this.setState({
                src: e.target.result
              });
            };
            fileReader.readAsDataURL(blob);
          }} />
      </Dialog>
    );
  }
}
