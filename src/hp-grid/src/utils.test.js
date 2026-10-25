import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getColumnStyle,
    parseColumnWidth,
    normalizeStickyPos,
    computeStickyColumnStyles,
} from './utils.js';

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

test('normalizeStickyPos handles multiple aliases and cases', () => {
    assert.equal(normalizeStickyPos({ stickyPos: 'last' }), 'right');
    assert.equal(normalizeStickyPos({ stickyPos: 'first' }), 'left');
    assert.equal(normalizeStickyPos({ stickpos: 'LAST' }), 'right');
    assert.equal(normalizeStickyPos({ stickPos: 'first' }), 'left');
    assert.equal(normalizeStickyPos({ pinned: 'right' }), 'right');
    assert.equal(normalizeStickyPos({ sticky: 'left' }), 'left');
    assert.equal(normalizeStickyPos({ type: 'actions', stickyPos: true }), 'right');
    assert.equal(normalizeStickyPos({ type: 'actions' }), 'right'); // Automatic global default
    assert.equal(normalizeStickyPos({ type: 'actions', stickyPos: false }), null); // Opt-out
    assert.equal(normalizeStickyPos({}), null);
});

test('computeStickyColumnStyles orders columns and calculates offsets correctly', () => {
    const columns = [
        { id: 'middle1', field: 'm1', width: 100 },
        { id: 'leftCol', field: 'l1', width: 150, stickyPos: 'first' },
        { id: 'middle2', field: 'm2', width: 200 },
        { id: 'rightCol1', field: 'r1', width: 100, stickyPos: 'last' },
        { id: 'rightCol2', field: 'r2', width: 80, stickyPos: 'last' },
    ];

    const result = computeStickyColumnStyles(columns, false);

    // Order: leftPinned -> unpinned -> rightPinned
    assert.deepEqual(
        result.map((c) => c.id),
        ['leftCol', 'middle1', 'middle2', 'rightCol1', 'rightCol2']
    );

    // Left offset
    assert.deepEqual(result[0]._stickyStyle, { position: 'sticky', left: '0px' });

    // Right offsets (rightCol2 is outermost at right: 0px, rightCol1 is at right: 80px)
    assert.deepEqual(result[3]._stickyStyle, { position: 'sticky', right: '80px' });
    assert.deepEqual(result[4]._stickyStyle, { position: 'sticky', right: '0px' });

    // getColumnStyle integrates _stickyStyle
    const style = getColumnStyle(result[4]);
    assert.equal(style.position, 'sticky');
    assert.equal(style.right, '0px');
    assert.equal(style.width, '80px');
});
