import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import ForwardIcon from 'material-ui/svg-icons/navigation/arrow-forward';
import { Step, Stepper, StepContent, StepButton } from 'material-ui/Stepper';
import { editorActions } from '../action-creators';
import { editorRoutes } from '../routes';

class BasicInfoEditor extends Component {
  render() {
    const { appId } = this.props;
    return (
      <Paper
        style={{ padding: 20 }}>
        <p>
          You're ready to make an app!  Here's how it works:
        </p>
        <Stepper
          activeStep={0}
          orientation='vertical'>
          <Step>
            <StepButton>
              Setup some basic info about your app
            </StepButton>
            <StepContent>
              <p>
                Give your app a unique name, pick a billing plan, choose a URL.
              </p>
            </StepContent>
          </Step>
          <Step>
            <StepButton>
              Import a spreadsheet with your app's logic
            </StepButton>
            <StepContent>
              <p>
                Import a spreadsheet from Google Sheets.
                This spreadsheet should have all of the logic for your app.
                Your app will work by allowing users to edit the cells that you designate, saving their data to a real, production-quality cloud data store if you'd like, and changing the way your app behaves (e.g. what views are shown or what actions to take) based on the values in other cells.
              </p>
            </StepContent>
          </Step>
          <Step>
            <StepButton>
              Design your app
            </StepButton>
            <StepContent>
              <p>
                Design your app.  Sheety App is based on a simple hierarchy of what we call "presenters."  Each presenter can change its behavior based on the values in the cells that you specify and can set the values of other cells that you specify.
              </p>
            </StepContent>
          </Step>
        </Stepper>
        <TextField
          floatingLabelText="App Name"
          value={appId}
          onChange={this.onUpdateAppId} />
        <div
          style={{ marginTop: 20 }}>
          <RaisedButton
            onClick={this.onNavigateToImport}
            label="Import spreadsheet"
            labelPosition="before"
            primary={true}
            icon={<ForwardIcon />} />
        </div>
      </Paper>
    );
  }

  onNavigateToImport = () => {
    const { match, appId, history } = this.props;
    history.push(
      editorRoutes.logicTab(
        match.params.orgId,
        match.params.projectId,
        appId
      )
    );
  };

  onUpdateAppId = (evt) => {
    this.props.dispatch(editorActions.setAppId(evt.target.value));
  };
}

export default withRouter(
  connect(
    ({ editor }) => ({
      appId: editor.get('appId')
    })
  )(BasicInfoEditor)
);
