import React, { Component } from 'react';
import { Map } from 'immutable';
import { CellRefRange } from 'sheety-model';
import { Tabs, Tab } from 'material-ui/Tabs';
import loadPresenters from '../presenter-registry';

const presentersByType = loadPresenters(false);
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
                       arrayDataQuery={
                         new CellRefRange({
                           start: {
                             tabId: tabName,
                             rowIdx: 0,
                             colIdx: 0
                           },
                           end: {
                             tabId: tabName,
                             rowIdx: calc.vals.get(tabName).size - 1,
                             colIdx: calc.vals.get(tabName).reduce((theMax, row) => (
                               Math.max(theMax, row.size - 1)
                             ), 0)
                           }
                         }).toA1Ref()
                       } />
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
