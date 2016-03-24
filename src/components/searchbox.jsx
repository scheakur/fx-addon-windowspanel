import React, { Component, PropTypes } from 'react';

export default class SearchBox extends Component {

  constructor() {
    super();
    this.onFocus = this.onFocus.bind(this);
    this.onCompositionStart = this.onCompositionStart.bind(this);
    this.onCompositionEnd = this.onCompositionEnd.bind(this);
    this.onInput = this.onInput.bind(this);
  }

  componentDidMount() {
    this.refs.search.addEventListener('focus', this.onFocus);
    this.refs.search.addEventListener('compositionstart', this.onCompositionStart);
    this.refs.search.addEventListener('compositionend', this.onCompositionEnd);
    this.refs.search.addEventListener('input', this.onInput);
  }

  componentWillUnmount() {
    this.refs.search.removeEventListener('focus', this.onFocus);
    this.refs.search.removeEventListener('compositionstart', this.onCompositionStart);
    this.refs.search.removeEventListener('compositionend', this.onCompositionEnd);
    this.refs.search.removeEventListener('input', this.onInput);
  }

  onFocus() {
    this.oldValue = this.refs.search.value;
  }

  onCompositionStart() {
    this.isComposing = true;
  }

  onCompositionEnd() {
    this.isComposing = false;
  }

  onInput() {
    if (!this.isComposing) {
      const val = this.getValue();
      if (val !== this.oldValue) {
        this.oldValue = val;
        this.props.onSearch(val);
      }
    }
  }

  getValue() {
    return this.refs.search.value;
  }

  focus() {
    this.refs.search.focus();
  }

  render() {
    return (
      <div className="search-container">
        <input className="search" type="search" ref="search"/>
      </div>
    );
  }

}

SearchBox.propTypes = {
  onSearch: PropTypes.func,
};
