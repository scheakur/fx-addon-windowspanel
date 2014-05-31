var container = document.querySelector('.windowspanel');

var container = new Vue({
  el: container,
  data: {
    tabs: []
  },
  methods: {
    add: function(tab) {
    },
    remove: function(tab) {
      let i = indexOf(this.$data.tabs, tab);
      if (i >= 0) {
        this.$data.tabs.splice(i, 1);
      }
    },
    select: function(tab) {
      this.$data.tabs.forEach(function(t) {
        t.active = (t.id === tab.id);
      });
      self.port.emit('select', tab.id);
    },
    close: function(tab) {
      this.remove(tab);
      self.port.emit('close', tab.id);
    }
  }
});

function indexOf(tabs, tab) {
  for (let i = 0, len = tabs.length; i < len; i++) {
    if (tabs[i].id === tab.id) {
      return i;
    }
  }
  return -1;
}

function reset() {
  container.$data.tabs = [];
}

function listTabs(tabs) {
  reset();
  tabs.forEach(function newTabEntry(tab) {
    container.$data.tabs.push(tab);
  });
}

self.port.on('show', listTabs);
self.port.on('hide', reset);
