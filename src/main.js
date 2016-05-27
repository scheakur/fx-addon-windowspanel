import React from 'react';
import ReactDOM from 'react-dom';
import WindowsPanel from './components/WindowsPanel';

self.port.on('show', ({ tabs, focusedTabIndex }) => {
  console.log('show', tabs.length);
  const emit = self.port.emit.bind(self.port);
  const on = self.port.on.bind(self.port);
  const index = (focusedTabIndex === undefined) ? null : Number(focusedTabIndex);

  const windowsPanel = (
    <WindowsPanel emit={emit} on={on} tabs={tabs} focusedTabIndex={index}/>
  );
  const container = document.getElementById('container');

  ReactDOM.render(windowsPanel, container);
});
