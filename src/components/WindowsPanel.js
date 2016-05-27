import React, { Component, PropTypes } from 'react';
import SearchBox from './SearchBox';
import Tab from './Tab';
import 'react-virtualized/styles.css';
import { VirtualScroll } from 'react-virtualized';

export default class WindowsPanel extends Component {

  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
    this.search = this.search.bind(this);
    this.renderTab = this.renderTab.bind(this);
    this.removeDuplicatedTabs = this.removeDuplicatedTabs.bind(this);
    this.handleKeys = this.handleKeys.bind(this);

    this.state = this.makeState(props.tabs, props.tabs[0], props.focusedTabIndex);
  }

  componentWillReceiveProps(props) {
    const tabs = this.filter(props.tabs, this.refs.search.getValue());
    this.setState(this.makeState(tabs, props.tabs[0], props.focusedTabIndex));
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


  makeState(tabs, fallbackTab, focusedTabIndex) {
    const index = this.chooseFocusedTabIndex(focusedTabIndex, tabs);

    return {
      focusedTabIndex: index,
      focusedTabId: (tabs[index] || fallbackTab).id,
      visibleTabs: tabs,
    };
  }


  chooseFocusedTabIndex(focusedTabIndex, tabs) {
    if (focusedTabIndex === null) {
      return this.getActiveTabIndex(tabs);
    }

    if (focusedTabIndex > tabs.length - 1) {
      return tabs.length - 1;
    }

    return focusedTabIndex;
  }


  focusSearchBox() {
    this.refs.search.focus();
  }


  select(id) {
    this.props.emit('hide');
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
    this._focusTab(nextIndex);
  }


  focusPrevTab() {
    const index = this.state.focusedTabIndex;
    const prevIndex = (index === 0) ? this.state.visibleTabs.length - 1 : index - 1;
    this._focusTab(prevIndex);
  }


  _focusTab(index) {
    const tab =  this.state.visibleTabs[index];
    this.setState({
      focusedTabIndex: index,
      focusedTabId: tab.id,
    });
  }


  closeTab(id, index) {
    this.props.emit('close', id, index);
  }


  removeDuplicatedTabs() {
    const urls = {};
    const ids = [];
    for (let tab of this.props.tabs) {
      if (urls[tab.url]) {
        ids.push(tab.id);
        continue;
      }
      urls[tab.url] = true;
    }

    if (ids.length === 0) {
      return;
    }

    const index = this.state.focusedTabIndex;
    this.props.emit('closeMulti', ids, index);
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

    const handled = this._handleKeys(event.key, event.ctrlKey);

    if (handled) {
      event.preventDefault();
    }
  }


  _handleKeys(key, ctrl) {
    if (key === 'Enter') {
      this.select(this.state.focusedTabId);
      return true;
    }

    if (key === 'ArrowUp' || (key === 'k' && ctrl)) {
      this.focusPrevTab();
      return true;
    }

    if (key === 'ArrowDown' || (key === 'j' && ctrl)) {
      this.focusNextTab();
      return true;
    }

    if (key === 'Backspace' && ctrl) {
      this.closeTab(this.state.focusedTabId, this.state.focusedTabIndex);
      return true;
    }

    return false;
  }


  scrollTo(tab) {
    this.refs.tabs.scrollTop = this.getPosition(tab);
  }


  getPosition(tab) {
    if (!tab) {
      return 0;
    }

    const elem = this.refs.tabs.querySelector(`[data-id=tab-${tab.id}]`);

    if (!elem) {
      return 0;
    }

    return elem.offsetTop - 40;
  }


  renderTab(index) {
    const focusedId = this.state.focusedTabId;
    const tab = this.state.visibleTabs[index];

    return (
      <Tab
        {...tab}
        focused={tab.id === focusedId}
        onSelect={this.select.bind(this, tab.id)}
        onClose={this.closeTab.bind(this, tab.id, index)}/>
    );
  }


  renderController() {
    const num = `${this.state.visibleTabs.length}/${this.props.tabs.length}`;

    return (
      <div className="controller">
        <img className="icon" src="./windowspanel-32.png"/>
        <SearchBox ref="search" onSearch={this.search}/>
        <img className="icon" src="./remove.png" title="Remove duplicated tabs" onClick={this.removeDuplicatedTabs}/>
        <div className="num">{num}</div>
      </div>
    );
  }


  renderTabs() {
    return (
      <div ref="tabs" className="tabs">
        <VirtualScroll
          width={598}
          height={556}
          rowsCount={this.state.visibleTabs.length}
          rowHeight={48}
          rowRenderer={this.renderTab}
          scrollToIndex={this.state.focusedTabIndex}
        />
      </div>
    );
  }


  render() {
    return (
      <div className="windowspanel">
        {this.renderController()}
        {this.renderTabs()}
      </div>
    );
  }

}

WindowsPanel.propTypes = {
  emit: PropTypes.func,
  on: PropTypes.func,
  tabs: PropTypes.array,
  focusedTabIndex: PropTypes.number,
};
