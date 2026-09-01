import test from 'node:test';
import assert from 'node:assert/strict';

import { getColumnStyle, parseColumnWidth } from './utils.js';

test('getColumnStyle preserves numeric and string widths', () => {
    assert.deepEqual(getColumnStyle({ width: 180 }), {
        width: '180px',
        minWidth: '180px',
        maxWidth: '180px',
        flex: '0 0 180px',
        boxSizing: 'border-box',
    });

    assert.deepEqual(getColumnStyle({ width: '220px' }), {
        width: '220px',
        minWidth: '220px',
        maxWidth: '220px',
        flex: '0 0 220px',
        boxSizing: 'border-box',
    });
});

test('parseColumnWidth converts supported values to px numbers', () => {
    assert.equal(parseColumnWidth(120), 120);
    assert.equal(parseColumnWidth('140px'), 140);
    assert.equal(parseColumnWidth('12rem'), 192);
});
