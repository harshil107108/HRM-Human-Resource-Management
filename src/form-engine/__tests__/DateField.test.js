import test from 'node:test';
import assert from 'node:assert/strict';

import { getDateValidationError } from '../components/fields/DateField.jsx';
import { shouldHandleSelectKeyDown } from '../components/fields/SelectWrapper.jsx';

test('rejects invalid day values', () => {
  assert.equal(getDateValidationError('32', '01', '2024'), 'Day must be between 1 and 31');
});

test('rejects invalid month values', () => {
  assert.equal(getDateValidationError('15', '13', '2024'), 'Month must be between 1 and 12');
});

test('allows missing year to be treated as incomplete until blur', () => {
  assert.equal(getDateValidationError('15', '04', ''), '');
});

test('does not block react-select default arrow and enter behavior', () => {
  const form = {
    methods: {
      focusPrev: () => { throw new Error('focusPrev should not run for arrow keys'); },
    },
  };

  assert.equal(shouldHandleSelectKeyDown({ key: 'ArrowDown' }, { form, id: 'country', prevFocusField: 'state' }), false);
  assert.equal(shouldHandleSelectKeyDown({ key: 'Enter' }, { form, id: 'country', prevFocusField: 'state' }), false);
  assert.equal(shouldHandleSelectKeyDown({ key: ' ', shiftKey: false }, { form, id: 'country', prevFocusField: 'state' }), false);
});

test('still allows shift-tab to move to the previous field', () => {
  let called = false;
  const form = {
    methods: {
      focusPrev: (id) => {
        called = true;
        assert.equal(id, 'country');
      },
    },
  };

  const event = { key: 'Tab', shiftKey: true, preventDefault() { } };
  assert.equal(shouldHandleSelectKeyDown(event, { form, id: 'country', prevFocusField: 'state' }), true);
  assert.equal(called, true);
});
