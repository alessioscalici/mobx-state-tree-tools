import React from 'react';
import ReactDOM from 'react-dom';
import { isElementOfType } from 'react-dom/test-utils';

import CollapseAllIcon from './CollapseAllIcon.js';
import ExplodeAllIcon from './ExplodeAllIcon.js';
import GearIcon from './GearIcon.js';
import PinIcon from './PinIcon.js';
import CollapseIcon from './CollapseIcon.js';
import ExplodeIcon from './ExplodeIcon.js';


const iconClasses = [
  {
    name: 'CollapseAllIcon',
    reactClass: CollapseAllIcon,
    ariaLabel: 'collapse all',
    classes: ['collapse-all']
  },
  {
    name: 'ExplodeAllIcon',
    reactClass: ExplodeAllIcon,
    ariaLabel: 'explode all',
    classes: ['explode-all']
  },
  {
    name: 'GearIcon',
    reactClass: GearIcon,
    ariaLabel: 'settings',
    classes: ['gear']
  },
  {
    name: 'PinIcon',
    reactClass: PinIcon,
    ariaLabel: 'pin',
    classes: ['circled', 'pin']
  },
  {
    name: 'CircledMinusIcon',
    reactClass: ExplodeIcon,
    ariaLabel: 'explode',
    classes: ['right-triangle-icon']
  },
  {
    name: 'CircledMinusIcon',
    reactClass: CollapseIcon,
    ariaLabel: 'collapse',
    classes: ['down-triangle-icon']
  },
];

// test execution for each icon

iconClasses.forEach((testEntry) => {

  it('[' + testEntry.name + '] renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(React.createElement(testEntry.reactClass), div);
  });

  describe('[' + testEntry.name + '] when rendered', () => {

    var div, root;
    beforeEach(() => {
      div = document.createElement('div');
      ReactDOM.render(React.createElement(testEntry.reactClass), div);
      root = div.children[0];
    });

    it('should have the aria-label attribute', () => {
      expect(root.getAttribute('aria-label')).toBe(testEntry.ariaLabel);
    });

    it('should have role="img" attribute', () => {
      expect(root.getAttribute('role')).toBe('img');
    });

    it('should have "mdt-icon" class', () => {
      expect(root.className).toMatch('mdt-icon');
    });

    it('should render its classes', () => {
      if (!testEntry.classes) return;
      testEntry.classes.forEach((cls) => {
        expect(root.className).toMatch(cls);
      });
    });

  });
});




