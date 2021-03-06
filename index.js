const tabs = require('sdk/tabs');
const data = require('sdk/self').data;
const favicon = require('sdk/places/favicon');
const timers = require('sdk/timers');
const { Hotkey } = require('sdk/hotkeys');

const { getMostRecentBrowserWindow } = require('sdk/window/utils');
const {
  getActiveTab,
  getTabBrowser,
  getTabURL,
  getTabs,
} = require('sdk/tabs/utils');

const panel = require('sdk/panel').Panel({
  contentURL: data.url('windowspanel.html'),
  contentScriptFile: [
    data.url('bundle.js'),
  ],
  position: {
    top: 10,
  },
  width: 600,
  height: 600,
});


const keyToOpenPanel = Hotkey({
  combo: 'control-shift-w',
  onPress: () => {
    togglePanel();
  },
});


let openPanelPreventer = null;

const button = require('sdk/ui/button/toggle').ToggleButton({
  id: 'windows-panel-for-firefox',
  label: 'Show Windows Panel',
  icon: {
    '16': './windowspanel-16.png',
    '32': './windowspanel-32.png',
    '64': './windowspanel-64.png'
  }
});


panel.on('hide', (state) => {
  preventOpenTemporary();
  buttonOff();
});


button.on('click', (state) => {
  if (openIsPrevented()) {
    breakPreventer();
    buttonOff();
    return;
  }
  if (state.checked) {
    showPanel();
  }
});


const preventOpenTemporary = () => {
  if (openPanelPreventer !== null) {
    timers.clearTimeout(openPanelPreventer);
  }
  openPanelPreventer = timers.setTimeout(() => {
    openPanelPreventer = null;
  }, 300);
};


const openIsPrevented = () => {
  return openPanelPreventer !== null;
};


const breakPreventer = () => {
  timers.clearTimeout(openPanelPreventer);
  openPanelPreventer = null;
};


const togglePanel = () => {
  if (panel.isShowing) {
    panel.hide();
  } else {
    panel.show();
  }
};


const showPanel = () => {
  panel.show();
};


const hidePanel = () => {
  panel.hide();
};


const buttonOff = () => {
  button.state('window', {
    checked: false
  });
};


const tofu = 'data:image/png;base64,'
  + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAArklEQVR42t2TMQ4CIRBF9xBGEw'
  + '5AkBJKY7uhcHsCjfEkHkJDLOWiyDeTyWoFwcriMcD8/wMkTKWUId6DMUYrpa5Symddb1CB9/4I'
  + 'aM09aOHhgLpxyzlf6jxChErsibjuQQsPB1C6hKARCQ8HcHof8eMEvQHwDAX89grOuVNvADx/9A'
  + 'bjJ7DWPkIIh1YztPBwQErprLW+t34maOFZv8G2MlcWIcSESuyI5as3k2d6AZGetvsfEgPvAAAA'
  + 'AElFTkSuQmCC';


const setFavicon = (tab, tabData) => {
  favicon.getFavicon(tab)
    .then(url => {
      tabData.favicon = url;
    })
    .catch(() => {
      tabData.favicon = tofu;
    });
};


const convert = (tabs) => {
  const converted = new Array(tabs.length);
  const activeTab = tabs.activeTab;
  for (let tab of tabs) {
    converted[tab.index] = newTabData(tab, activeTab);
  }
  return converted;
};


const newTabData = (tab, activeTab) => {
  const tabData = {
    id: tab.id,
    title: tab.title,
    url: tab.url,
    active: (activeTab.id === tab.id),
  };
  setFavicon(tab, tabData);
  return tabData;
};


const selectTab = (id) => {
  for (let tab of tabs) {
    if (tab.id === id) {
      tab.activate();
      return;
    }
  }
};


const closeTab = (id, focusedTabIndex) => {
  for (let tab of tabs) {
    if (tab.id === id) {
      tab.close();
      if (panel.isShowing) {
        emitShow(focusedTabIndex);
      }
      return;
    }
  }
};


const closeTabs = (ids, focusedTabIndex) => {
  for (let id of ids) {
    for (let tab of tabs) {
      if (tab.id === id) {
        tab.close();
        break;
      }
    }
  }

  if (panel.isShowing) {
    emitShow(focusedTabIndex);
  }
}


const sortTabs = () => {
  const win = getMostRecentBrowserWindow();
  const tabBrowser = getTabBrowser(win);
  const tabs = getTabs(win);

  tabs.sort((tab1, tab2) => {
    return getTabURL(tab1) > getTabURL(tab2);
  })

  tabs.forEach((tab, index) => {
    tabBrowser.moveTabTo(tab, index);
  });

  const activeTab = getActiveTab(win);

  const focusedTabIndex = tabs.indexOf(activeTab);
  emitShow((focusedTabIndex < 0) ? 0 : focusedTabIndex);
};


const emitShow = (focusedTabIndex) => {
  panel.port.emit('show', {
    tabs: convert(tabs),
    focusedTabIndex: focusedTabIndex,
  });
};


const updatePanel = () => {
  if (panel.isShowing) {
    emitShow();
  }
};

panel.port.on('select', selectTab);
panel.port.on('close', closeTab);
panel.port.on('closeMulti', closeTabs);
panel.port.on('hide', hidePanel);
panel.port.on('sort', sortTabs);

panel.on('show', emitShow);
panel.on('hide', () => {
 panel.port.emit('hide');
});

tabs.on('activate', updatePanel);
tabs.on('ready', updatePanel);
