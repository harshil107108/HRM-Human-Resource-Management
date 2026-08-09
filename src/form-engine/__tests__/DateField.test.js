import test from 'node:test';
import assert from 'node:assert/strict';

import { getDateValidationError } from '../components/fields/DateField.jsx';

test('rejects invalid day values', () => {
  assert.equal(getDateValidationError('32', '01', '2024'), 'Day must be between 1 and 31');
});

test('rejects invalid month values', () => {
  assert.equal(getDateValidationError('15', '13', '2024'), 'Month must be between 1 and 12');
});

test('allows missing year to be treated as incomplete until blur', () => {
  assert.equal(getDateValidationError('15', '04', ''), '');
});
