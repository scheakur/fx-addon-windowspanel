const tabs = require('sdk/tabs');
const data = require('sdk/self').data;
const favicon = require("sdk/places/favicon");

const windowsPanel = require('sdk/panel').Panel({
  contentURL: data.url('windowspanel.html'),
  contentScriptFile: [
    data.url('vue.min.js'),
    data.url('windowspanel.js'),
  ],
  position: {
    top: 0
  },
  width: 600,
  height: 600
});


require('sdk/ui/button/action').ActionButton({
  id: 'windows-panel-for-firefox',
  label: 'Show Windows Panel',
  icon: {
    '16': './icon/windowspanel-16.png',
    '32': './icon/windowspanel-32.png',
    '64': './icon/windowspanel-64.png'
  },
  onClick: handleClick
});


function handleClick(state) {
  windowsPanel.show();
}


const tofu = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAArklEQVR42t2TMQ4CIRBF9xBGEw5AkBJKY7uhcHsCjfEkHkJDLOWiyDeTyWoFwcriMcD8/wMkTKWUId6DMUYrpa5Symddb1CB9/4IaM09aOHhgLpxyzlf6jxChErsibjuQQsPB1C6hKARCQ8HcHof8eMEvQHwDAX89grOuVNvADx/9AbjJ7DWPkIIh1YztPBwQErprLW+t34maOFZv8G2MlcWIcSESuyI5as3k2d6AZGetvsfEgPvAAAAAElFTkSuQmCC';


function setFavicon(tab, tab_) {
  favicon.getFavicon(tab).then(function(url) {
    tab_.favicon = url;
  }, function() {
    tab_.favicon = tofu;
  });
}


function convert(tabs) {
  let tabs_ = [];
  let active = tabs.activeTab;
  for (let tab of tabs) {
    let tab_ = {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      active: (active.id === tab.id)
    };
    setFavicon(tab, tab_);
    tabs_.push(tab_);
  }
  return tabs_;
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


windowsPanel.port.on('select', selectTab);
windowsPanel.port.on('close', closeTab);

windowsPanel.on('show', function() {
  windowsPanel.port.emit('show', convert(tabs));
});

windowsPanel.on('hide', function() {
 windowsPanel.port.emit('hide');
});

tabs.on('activate', function(tab) {
  if (windowsPanel.isShowing) {
    windowsPanel.port.emit('show', convert(tabs));
  }
});

