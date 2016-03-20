import React from 'react';
import ReactDOM from 'react-dom';
import WindowsPanel from './components/windowspanel.jsx';

self.port.on('show', (tabs) => {
  console.log('show', tabs.length);
  const emit = self.port.emit.bind(self.port);
  const on = self.port.on.bind(self.port);
  ReactDOM.render(
    <WindowsPanel emit={emit} on={on} tabs={tabs}/>,
    document.getElementById('container'));
});
