import React, { Component, PropTypes } from 'react';
import SearchBox from './searchbox';
import classnames from 'classnames';

export default class WindowsPanel extends Component {

  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
    this.search = this.search.bind(this);
    this.handleKeys = this.handleKeys.bind(this);

    this.state = this.makeState(props.tabs, props.tabs[0]);
  }

  componentWillReceiveProps(props) {
    const tabs = this.filter(props.tabs, this.refs.search.getValue());
    this.setState(this.makeState(tabs, props.tabs[0]));
  }


  componentDidMount() {
    this.focusSearchBox();
    window.addEventListener('keypress', this.handleKeys);
  }


  componentDidUpdate() {
    this.focusSearchBox();
    this.scrollTo(this.state.visibleTabs[this.state.focusedTabIndex]);
  }


  componentWillUnmount() {
    window.removeEventListener('keypress', this.handleKeys);
  }


  makeState(tabs, fallbackTab) {
    const index = this.getActiveTabIndex(tabs);

    console.log('state', index, tabs.length);

    return {
      focusedTabIndex: index,
      focusedTabId: (tabs[index] || fallbackTab).id,
      visibleTabs: tabs,
    };
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

    const index = this.getIndex(visibleTabs, this.state.focusedTabId);
    this.setState({
      focusedTabIndex: index,
      focusedTabId: visibleTabs[index].id,
      visibleTabs: visibleTabs,
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
    const nextTab = this.state.visibleTabs[nextIndex];
    this.setState({
      focusedTabIndex: nextIndex,
      focusedTabId: nextTab.id,
    });
  }

  focusPrevTab() {
    const index = this.state.focusedTabIndex;
    const prevIndex = (index === 0) ? this.state.visibleTabs.length - 1 : index - 1;
    const prevTab =  this.state.visibleTabs[prevIndex];
    this.setState({
      focusedTabIndex: prevIndex,
      focusedTabId: prevTab.id,
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


  getIndex(tabs, id) {
    let index = 0;
    for (let tab of tabs) {
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


  scrollTo(tab) {
    this.refs.tabs.scrollTop = this.getPosition(tab);
  }


  getPosition(tab) {
    const elem = this.refs.tabs.querySelector(`[data-id=tab-${tab.id}]`);
    if (!elem) {
      return 0;
    }
    return elem.offsetTop - 40;
  }


  renderTabs() {
    const focusedId = this.state.focusedTabId;

    return this.state.visibleTabs.map((tab, index) => {
      const className = classnames({
        'tab': true,
        'focused': tab.id === focusedId,
      });

      return (
        <div key={`tab-${tab.id}`} data-id={`tab-${tab.id}`} className={className} onClick={this.select.bind(this, tab.id)}>
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
        <div ref="tabs" className="tabs">{tabs}</div>
      </div>
    );
  }

}

WindowsPanel.propTypes = {
  emit: PropTypes.func,
  on: PropTypes.func,
  tabs: PropTypes.array,
};
