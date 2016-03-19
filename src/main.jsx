import React from 'react';
import ReactDOM from 'react-dom';
import WindowsPanel from './components/windowspanel.jsx';

self.port.on('show', (tabs) => {
  ReactDOM.render(
    <WindowsPanel global={self} tabs={tabs}/>,
    document.getElementById('container'));
});
