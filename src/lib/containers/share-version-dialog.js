import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Dialog from 'material-ui/Dialog';
import AutoComplete from 'material-ui/AutoComplete';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import { editorActions } from '../action-creators';
import { appRoutes } from '../routes';

class ShareVersionDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      partialDestinationBranchName: null,
      destinationBranchName: null
    };
  }

  render() {
    const {
      showShareVersionDialog,
      app,
      isSaving
    } = this.props;

    const {
      destinationBranchName,
      partialDestinationBranchName
    } = this.state;

    const sharedVersions = app.get('sharedVersions');

    const newDestinations = !partialDestinationBranchName || sharedVersions.has(partialDestinationBranchName)
                          ? []
                          : [partialDestinationBranchName];
    const destinations = sharedVersions.keySeq().map(name => ({
      label: name,
      value: name
    })).toJS().concat(newDestinations.map(name => ({
      label: `${name} (New)`,
      value: name
    })));

    return (
      <Dialog
        title="Share this version with your team"
        actions={[
          (
            <FlatButton
              label="Cancel"
              onClick={this.onRequestClose} />
          ),
          (
            <FlatButton
              label="Share"
              primary={true}
              icon={isSaving
                     ? (
                       <CircularProgress
                         mode="indeterminate" />
                     ) : null}
              disabled={!destinationBranchName || isSaving}
              onClick={this.onShare.bind(null, destinationBranchName)} />
          )
        ]}
        modal={false}
        open={showShareVersionDialog}
        onRequestClose={this.onRequestClose}
        autoScrollBodyContent={true}>
        <div>
          <p>
            Share your changes with your team.
            If you are sharing your app with a name that already exists, we will make sure that all conflicting
            changes are resolved before overwriting anything.
            Once you share your changes, you will be able to publish a new version of the app to your users.
          </p>
          <AutoComplete
            hintText="Public name"
            floatingLabelText="Public name"
            fullWidth={true}
            openOnFocus={true}
            onNewRequest={this.onSetDestinationBranchName}
            onUpdateInput={this.onSetParitalDestinationBranchName}
            filter={AutoComplete.fuzzyFilter}
            dataSourceConfig={{
              text: 'label',
              value: 'value'
            }}
            dataSource={destinations} />
          <p>
            {!!destinationBranchName
              ? (sharedVersions.get(destinationBranchName)
                  ? `Sharing to existing name, "${destinationBranchName}"`
                  : `Sharing to new name, "${destinationBranchName}"`)
              : null}
          </p>
        </div>
      </Dialog>
    );
  }

  onRequestClose = () => {
    const { dispatch } = this.props;

    dispatch(editorActions.setShowShareVersionDialog(false));
  }

  onSetDestinationBranchName = item => {
    this.setState({
      destinationBranchName: item.value
    });
  }

  onSetParitalDestinationBranchName = partialDestinationBranchName => {
    this.setState({
      partialDestinationBranchName
    });
  }

  onShare = () => {
    const { dispatch, appVersion, history } = this.props;
    const { destinationBranchName } = this.state;

    dispatch(
      editorActions.shareAppVersion(appVersion, destinationBranchName)
    ).then(() => {
      history.push(
        appRoutes.default(appVersion.get('orgId'), appVersion.get('projectId'), appVersion.get('appId'))
      );

      this.onRequestClose();
    }).catch(err => {
      // TODO: handle the error based on the code
      console.error(err.code);
    });
  }
}

export default withRouter(
  connect(
    ({ editor }) => ({
      showShareVersionDialog: editor.get('showShareVersionDialog'),
      app: editor.get('app'),
      appVersion: editor.get('appVersion'),
      isSaving: editor.get('isSaving')
    })
  )(ShareVersionDialog)
);
