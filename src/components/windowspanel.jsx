import React, { Component, PropTypes } from 'react';
import SearchBox from './searchbox';

export default class WindowsPanel extends Component {

  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
    this.search = this.search.bind(this);

    this.state = {
      visibleTabs: props.tabs,
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      visibleTabs: this.filter(props.tabs, this.refs.search.getValue()),
    });
  }

  select(index) {
    const tab = this.state.visibleTabs[index];
    if (!tab) {
      return;
    }
    this.props.emit('select', tab.id);
  }


  search(text) {
    this.setState({
      visibleTabs: this.filter(this.props.tabs, text),
    });
  }


  filter(tabs, text) {
    if (!text) {
      return tabs;
    }

    const query = text.toLowerCase();
    return tabs.filter((tab) => {
      return tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query);
    });
  }


  renderTabs() {
    return this.state.visibleTabs.map((tab, index) => {
      return (
        <div key={`tab-${index}`} className="tab" onClick={this.select.bind(this, index)}>
          <div className="favicon"><img src={tab.favicon} width={16} height={16}/></div>
          <div className="title">{tab.title}</div>
          <div className="url">{tab.url}</div>
        </div>
      );
    });
  }


  render() {
    const tabs = this.renderTabs();
    return (
      <div className="windowspanel">
        <SearchBox ref="search" onSearch={this.search}/>
        <div>{tabs}</div>
      </div>
    );
  }

}

WindowsPanel.propTypes = {
  emit: PropTypes.func,
  on: PropTypes.func,
  tabs: PropTypes.array,
};
