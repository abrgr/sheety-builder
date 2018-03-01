import React, { Component } from 'react';
import { Map } from 'immutable';
import { Tabs, Tab } from 'material-ui/Tabs';
import loadPresenters from '../presenter-registry';

const presentersByType = loadPresenters();
const Spreadsheet = presentersByType.get('spreadsheet');

export default class SheetLogicEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: null
    };
  }

  render() {
    const { calc } = this.props;

    if ( !calc ) {
      return null;
    }

    return (
      <Tabs>
        {calc.sheet
             .get('tabsById')
             .keySeq()
             .map(tabName => (
               <Tab
                 key={tabName}
                 onActive={this.onSetActiveTab.bind(null, tabName)}
                 label={tabName}>
                 {this.state.activeTab === tabName
                   ? (
                     <Spreadsheet
                       config={new Map({
                         showColumnHeaders: true,
                         showRowHeaders: true
                       })}
                       arrayDataQuery={`'${tabName}'!A1:Z100`} />
                   ) : null}
               </Tab>
             ))}
      </Tabs>
    );
  }

  onSetActiveTab = (activeTab) => {
    this.setState({
      activeTab
    });
  };
}
