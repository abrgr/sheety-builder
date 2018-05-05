import React, { Component } from 'react';
import { Map, List, fromJS } from 'immutable';
import AJV from 'ajv';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import configurersAndSchemasBySchemaURI from 'sheety-core-presenters/dist/configurer';
import { ObjectFormPart } from './configurator';
import SheetLinker from '../components/sheet-linker';
import { getSchemaAtPath } from '../schema-utils';

const actionSchemas = fromJS({
  "http://sheetyapp.com/actions/core/set-cell": {
    "$id": "http://sheetyapp.com/actions/core/set-cell",
    "title": "Set Cell",
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "const": "http://sheetyapp.com/actions/core/set-cell",
        "default": "http://sheetyapp.com/actions/core/set-cell"
      },
      "configArgs": {
        "type": "object",
        "properties": {
          "cell": {
            "title": "Cell to set",
            "description": "Cell to set",
            "$ref": "http://sheetyapp.com/schemas/core-presenters/configurers/cell.json"
          }
        },
        "required": [
          "cell"
        ]
      },
      "args": {
        "type": "object",
        "properties": {
          "valueToSet": {
            "title": "Value",
            "description": "The value to put in the cell.",
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "object",
                "properties": {
                  "value": {
                    "type": "string"
                  }
                }
              }
            ]
          }
        },
        "required": [
          "valueToSet"
        ]
      }
    },
    "required": [
      "configArgs",
      "args"
    ]
  }
});

const ajv = new AJV({ useDefaults: true });

configurersAndSchemasBySchemaURI.valueSeq().forEach(schemaAndUri => {
  ajv.addSchema(schemaAndUri.get('schema').toJS());
});

const validators = actionSchemas.map(schema => (
  ajv.compile(schema.toJS())
));

export default class ActionEditorDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action: new Map(),
      linkPath: null
    };
  }

  render() {
    const {
      open,
      calc,
      eventSchema,
      onRequestClose,
      onUpdate
    } = this.props;

    const {
      action,
      linkPath
    } = this.state;

    const actionType = action.get('type');
    const schema = actionSchemas.get(actionType, new Map());

    return (
      <div>
        {linkPath
          ? (
            <SheetLinker
              calc={calc}
              value={action.getIn(linkPath)}
              schema={getSchemaAtPath(ajv, schema, linkPath)}
              onUpdate={val => {
                this.setState({
                  action: action.setIn(linkPath, val)
                });
              }}
              onClearLinkPath={this.onClearLinkPath} />
          ) : null}
        <Dialog
          title="Configure an Action"
          actions={[
            (
              <FlatButton
                label="Cancel"
                onClick={onRequestClose} />
            ),
            (
              <FlatButton
                label="OK"
                primary={true}
                disabled={!this.isValid()}
                onClick={() => {
                  onUpdate(action);
                  onRequestClose();
                  this.setState({
                    action: new Map(),
                    linkPath: null
                  });
                }} />
            )
          ]}
          modal={false}
          open={open}
          onRequestClose={onRequestClose}
          autoScrollBodyContent={true}>
          <div>
            <SelectField
              fullWidth={true}
              floatingLabelText="Action type"
              value={actionType}
              onChange={(_, _1, value) => {
                this.setState({
                  action: new Map({ type: value })
                });
              }}>
              {actionSchemas.map((actionSchema, type)=> (
                <MenuItem
                  key={type}
                  value={type}
                  primaryText={actionSchema.get('title')} />
              )).valueSeq()}
            </SelectField>
            {!!actionType
              ? (
                <div>
                  <ObjectFormPart
                    schema={schema.getIn(['properties', 'configArgs']).toJS()}
                    path={['configArgs']}
                    presenter={action}
                    onSetLinkPath={this.onSetLinkPath}
                    onClearLinkPath={this.onClearLinkPath}
                    onUpdate={(path, val) => {
                      this.setState(({ action }) => ({
                        action: action.setIn(path, val)
                      }));
                    }} />
                  {schema.getIn(['properties', 'args', 'properties'], new List()).map((argSchema, argName) => {
                    const val = action.getIn(['args', argName]);
                    const eventPropsSchema = !!eventSchema
                                           ? eventSchema.get('properties', new Map())
                                           : new Map();

                    if ( eventPropsSchema.isEmpty() || (!!val && val.get && val.get('value')) ) {
                      return (
                        <TextField
                          key={argName}
                          floatingLabelText={argSchema.get('title')}
                          hintText={argSchema.get('description')}
                          value={val}
                          onChange={(evt) => {
                            this.setState(({ action }) => ({
                              action: action.setIn(['args', argName, 'value'], evt.target.value)
                            }));
                          }} />
                      );
                    }

                    return (
                      <div
                        key={argName}>
                        <h2>{argSchema.get('title')}</h2>
                        <h3>{argSchema.get('description')}</h3>
                        <SelectField
                          fullWidth={true}
                          floatingLabelText="Event Property"
                          value={val}
                          onChange={(_, _1, value) => {
                            this.setState(({ action }) => ({
                              action: action.setIn(['args', argName], value)
                            }));
                          }}>
                          {eventSchema.get('properties').map((prop, propName)=> (
                            <MenuItem
                              key={propName}
                              value={propName}
                              primaryText={prop.get('title')} />
                          )).valueSeq()}
                        </SelectField>
                      </div>
                    )
                  }).valueSeq()}
                </div>
              ) : null}
          </div>
        </Dialog>
      </div>
    );
  }

  onClearLinkPath = () => {
    this.setState({
      linkPath: null
    });
  };

  onSetLinkPath = linkPath => {
    this.setState({
      linkPath
    });
  };

  isValid = () => {
    const { action } = this.state;
    const type = action.get('type');
    const validator = validators.get(type);

    return validator && validator(action.toJS());
  };
}
