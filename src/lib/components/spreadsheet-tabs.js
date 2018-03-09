import React, { Component } from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';

export default class SpreadsheetTabs extends Component {
  constructor(props) {
    super(props);

    const { calc } = props;
    const tabsById = calc && calc.sheet && calc.sheet.get('tabsById');

    this.state = {
      activeTab: tabsById && tabsById.keySeq().first()
    };
  }

  render() {
    const { calc, tabRenderer } = this.props;

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
                   ? tabRenderer(tabName)
                   : null}
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
