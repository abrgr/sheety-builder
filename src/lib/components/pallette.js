import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import {Card, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

export default class Pallette extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: props.expanded
    };
  }

  componentWillReceiveProps(nextProps) {
    if ( this.props.expanded !== nextProps.expanded ) {
      this.setState({
        expanded: nextProps.expanded
      });
    }
  }

  render() {
    const { presentersByType } = this.props;
    return (
      <Card
        expanded={this.state.expanded}
        onExpandChange={this.onToggleExpand}>
        <CardHeader
          title='Change presenter'
          showExpandableButton={true}
          actAsExpander={true} />
        <CardText
          expandable={true}>
          <Paper
            zDepth={1}>
            <List>
              <Subheader>Core Components</Subheader>
              {presentersByType.entrySeq().map(([type, { schema }]) => (
                !!schema
                  ? (
                    <ListItem
                      key={type}
                      primaryText={schema.get('title')}
                      onClick={this.onSelected.bind(null, type)} />
                  ) : null
              ))}
            </List>
          </Paper>
        </CardText>
      </Card>
    );
  }

  onSelected = (type) => {
    this.setState({
      expanded: false
    });

    this.props.onSelected(type);
  };

  onToggleExpand = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  };
}
