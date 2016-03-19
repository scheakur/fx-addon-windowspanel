import React, { Component, PropTypes } from 'react';

export default class WindowsPanel extends Component {

  constructor() {
    super();
  }

  renderTabs() {
    return this.props.tabs.map((tab, index) => {
      return (
        <div key={`tab-${index}`} className="tab">
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
        <h1>Windows Panel</h1>
        <div>{tabs}</div>
      </div>
    );
  }

}

WindowsPanel.propTypes = {
  global: PropTypes.object,
  tabs: PropTypes.array,
};
