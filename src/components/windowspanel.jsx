import React, { Component, PropTypes } from 'react';
import SearchBox from './searchbox';
import classnames from 'classnames';

export default class WindowsPanel extends Component {

  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
    this.search = this.search.bind(this);
    this.handleKeys = this.handleKeys.bind(this);

    const index = this.getActiveTabIndex(props.tabs);
    this.state = {
      focusedTabIndex: index,
      focusedTabId: props.tabs[index].id,
      visibleTabs: props.tabs,
    };
  }

  componentWillReceiveProps(props) {
    const tabs = this.filter(props.tabs, this.refs.search.getValue());
    const index = this.getActiveTabIndex(tabs);
    this.setState({
      focusedTabIndex: index,
      focusedTabId: tabs[index].id,
      visibleTabs: tabs,
    });
  }

  componentDidMount() {
    this.focusSearchBox();
    window.addEventListener('keypress', this.handleKeys);
  }


  componentDidUpdate() {
    this.focusSearchBox();
  }


  componentWillUnmount() {
    window.removeEventListener('keypress', this.handleKeys);
  }


  focusSearchBox() {
    this.refs.search.focus();
  }


  select(id) {
    this.props.emit('select', id);
  }

  search(text) {
    const visibleTabs = this.filter(this.props.tabs, text);
    if (visibleTabs.length === 0) {
      this.setState({
        visibleTabs: visibleTabs,
      });
      return;
    }

    const index = this.getVisibleIndex(this.state.focusedTabId);
    this.setState({
      visibleTabs: visibleTabs,
      focusedTabIndex: index,
      focusedTabId: visibleTabs[index].id,
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


  focusNextTab() {
    const index = this.state.focusedTabIndex;
    const nextIndex = (index === this.state.visibleTabs.length - 1) ? 0 : index + 1;
    this.setState({
      focusedTabIndex: nextIndex,
      focusedTabId: this.state.visibleTabs[nextIndex].id,
    });
  }

  focusPrevTab() {
    const index = this.state.focusedTabIndex;
    const prevIndex = (index === 0) ? this.state.visibleTabs.length - 1 : index - 1;
    this.setState({
      focusedTabIndex: prevIndex,
      focusedTabId: this.state.visibleTabs[prevIndex].id,
    });
  }


  getActiveTabIndex(tabs) {
    let index = 0;
    for (let tab of tabs) {
      if (tab.active) {
        return index;
      }
      index += 1;
    }
    return 0;
  }


  getVisibleIndex(id) {
    let index = 0;
    for (let tab of this.state.visibleTabs) {
      if (tab.id === id) {
        return index;
      }
      index += 1;
    }
    return 0;
  }


  handleKeys(event) {
    if (this.refs.search.isComposing) {
      return;
    }

    if (this.state.visibleTabs.length === 0) {
      return;
    }

    const handled = this._handleKeys(event.keyCode);

    if (handled) {
      event.preventDefault();
    }
  }


  _handleKeys(keyCode) {
    switch (keyCode) {
    case 13:
      this.select(this.state.focusedTabId);
      return true;
    case 38:
      this.focusPrevTab();
      return true;
    case 40:
      this.focusNextTab();
      return true;
    }

    return false;
  }


  renderTabs() {
    const focusedId = this.state.focusedTabId;

    return this.state.visibleTabs.map((tab, index) => {
      const className = classnames({
        'tab': true,
        'focused': tab.id === focusedId,
      });

      return (
        <div key={`tab-${tab.id}-${index}`} className={className} onClick={this.select.bind(this, tab.id)}>
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
        <div className="tabs">{tabs}</div>
      </div>
    );
  }

}

WindowsPanel.propTypes = {
  emit: PropTypes.func,
  on: PropTypes.func,
  tabs: PropTypes.array,
};
