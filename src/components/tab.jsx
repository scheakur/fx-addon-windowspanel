import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Close from 'react-icons/lib/md/close';

export default class Tab extends Component {

  constructor() {
    super();
  }

  render() {
    const className = classnames({
      'tab': true,
      'focused': this.props.focused,
    });

    return (
      <div key={`tab-${this.props.id}`} data-id={`tab-${this.props.id}`} className={className} onClick={this.props.onSelect}>
        <div className="favicon">
          <img src={this.props.favicon} width={16} height={16}/>
        </div>
        <div className="text">
          <div className="title">{this.props.title}</div>
          <div className="url">{this.props.url}</div>
        </div>
        <div className="button-container">
          <div className="button close" onClick={this.props.onClose}>
            <Close size={16}/>
          </div>
        </div>
      </div>
    );
  }

}

Tab.propTypes = {
  id: PropTypes.string,
  url: PropTypes.string,
  title: PropTypes.string,
  favicon: PropTypes.string,
  focused: PropTypes.bool,
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
};
