import React from 'react';
import ReactDOM from 'react-dom';
import { isElementOfType } from 'react-dom/test-utils';

import ObjectTreeValue from './ObjectTreeValue.js';


describe('[ObjectTreeValue]', () => {

  var div, elem;

  beforeEach(() => {
    div = document.createElement('div');
  });

  it('renders without crashing', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue), div);
  });


  it('renders String values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: "Random"
    }), div);
    elem = div.children[0];

    expect(elem.textContent).toMatch('"Random"');
    expect(elem.children[0].className).toMatch('string-value');
    expect(elem.children[0].textContent).toMatch('Random');
  });

  it('renders null values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: null
    }), div);
    elem = div.children[0];
    expect(elem.className).toMatch('null-value');
  });

  it('renders undefined values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: undefined
    }), div);
    elem = div.children[0];
    expect(elem.className).toMatch('null-value');
  });

  it('renders undefined values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: undefined
    }), div);
    elem = div.children[0];
    expect(elem.className).toMatch('null-value');
  });

  it('renders NaN values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: NaN
    }), div);
    elem = div.children[0];
    expect(elem.className).toMatch('literal-value');
  });

  it('renders Number values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: 123
    }), div);
    elem = div.children[0];
    expect(elem.className).toMatch('literal-value');
  });

  it('renders boolean values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: true
    }), div);
    elem = div.children[0];
    expect(elem.className).toMatch('literal-value');
  });

  it('renders Date values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: new Date(1505829454520)
    }), div);
    elem = div.children[0];
    expect(elem.className).toMatch('date-value');
    expect(elem.textContent).toMatch('Tue Sep 19 2017 15:57:34 GMT+0200 (CEST)');
  });

  it('renders RegExp values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: /abc/i
    }), div);
    elem = div.children[0];
    expect(elem.className).toMatch('string-value');
  });

  it('renders function values', () => {
    ReactDOM.render(React.createElement(ObjectTreeValue, {
      value: function myFunc() {}
    }), div);
    elem = div.children[0];
    expect(elem.className).toBe('');
    expect(elem.textContent).toMatch('function myFunc() {}');
  });

});





