const tabs = require('sdk/tabs');
const data = require('sdk/self').data;
const favicon = require('sdk/places/favicon');
const timers = require('sdk/timers');

const panel = require('sdk/panel').Panel({
  contentURL: data.url('windowspanel.html'),
  contentScriptFile: [
    data.url('bundle.js'),
  ],
  position: {
    top: 10,
    right: 10
  },
  width: 600,
  height: 600
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


panel.on('hide', function(state) {
  preventOpenTemporary();
  buttonOff();
});

button.on('click', function(state) {
  if (openIsPrevented()) {
    breakPreventer();
    buttonOff();
    return;
  }
  if (state.checked) {
    openPanel();
  }
});


function preventOpenTemporary() {
  if (openPanelPreventer !== null) {
    timers.clearTimeout(openPanelPreventer);
  }
  openPanelPreventer = timers.setTimeout(function() {
    openPanelPreventer = null;
  }, 300);
}


function openIsPrevented() {
  return openPanelPreventer !== null;
}


function breakPreventer() {
  timers.clearTimeout(openPanelPreventer);
  openPanelPreventer = null;
}


function openPanel() {
  panel.show({
    width: 600,
    height: 600,
    position: {
      top: 10,
      right: 10,
    },
  });
}


function buttonOff() {
  button.state('window', {
    checked: false
  });
}


const tofu = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAArklEQVR42t2TMQ4CIRBF9xBGEw5AkBJKY7uhcHsCjfEkHkJDLOWiyDeTyWoFwcriMcD8/wMkTKWUId6DMUYrpa5Symddb1CB9/4IaM09aOHhgLpxyzlf6jxChErsibjuQQsPB1C6hKARCQ8HcHof8eMEvQHwDAX89grOuVNvADx/9AbjJ7DWPkIIh1YztPBwQErprLW+t34maOFZv8G2MlcWIcSESuyI5as3k2d6AZGetvsfEgPvAAAAAElFTkSuQmCC';


function setFavicon(tab, tabData) {
  favicon.getFavicon(tab).then(function(url) {
    tabData.favicon = url;
  }, function() {
    tabData.favicon = tofu;
  });
}


function convert(tabs) {
  const converted = [];
  const activeTab = tabs.activeTab;
  for (let tab of tabs) {
    converted.push(newTabData(tab, activeTab));
  }
  return converted;
}


function newTabData(tab, activeTab) {
  const tabData = {
    id: tab.id,
    title: tab.title,
    url: tab.url,
    active: (activeTab.id === tab.id),
    visible: true
  };
  setFavicon(tab, tabData);
  return tabData;
}


function selectTab(id) {
  for (let tab of tabs) {
    if (tab.id === id) {
      tab.activate();
      return;
    }
  }
}


function closeTab(id) {
  for (let tab of tabs) {
    if (tab.id === id) {
      tab.close();
      return;
    }
  }
}


panel.port.on('select', selectTab);
panel.port.on('close', closeTab);

panel.on('show', () => {
  panel.port.emit('show', convert(tabs));
});

panel.on('hide', () => {
 panel.port.emit('hide');
});

tabs.on('activate', (tab) => {
  if (panel.isShowing) {
    panel.port.emit('show', convert(tabs));
  }
});
