import test from 'node:test';
import assert from 'node:assert/strict';

import { computeWindow, scrollTopToReveal } from './virtualization.js';

test('computeWindow at the top mounts the viewport plus overscan', () => {
    const { start, end } = computeWindow({
        scrollTop: 0, viewportHeight: 400, rowStride: 33, rowCount: 50000, overscan: 10,
    });
    assert.equal(start, 0);
    assert.equal(end, Math.ceil(400 / 33) + 10);
});

test('computeWindow mounts a bounded number of rows deep in a huge list', () => {
    const { start, end } = computeWindow({
        scrollTop: 33 * 25000, viewportHeight: 600, rowStride: 33, rowCount: 50000,
    });
    assert.ok(start <= 25000 && end >= 25000 + Math.floor(600 / 33));
    assert.ok(end - start < 60, `mounted ${end - start} rows`);
});

test('computeWindow keeps start even so zebra parity survives', () => {
    for (const scrollTop of [0, 330, 1650, 33 * 777 + 5]) {
        const { start } = computeWindow({
            scrollTop, viewportHeight: 500, rowStride: 33, rowCount: 5000,
        });
        assert.equal(start % 2, 0);
    }
});

test('computeWindow clamps at the end of the list', () => {
    const { start, end } = computeWindow({
        scrollTop: 33 * 990, viewportHeight: 500, rowStride: 33, rowCount: 1000,
    });
    assert.equal(end, 1000);
    assert.ok(start < end);
});

test('computeWindow handles a body that is still below the viewport', () => {
    const { start, end } = computeWindow({
        scrollTop: -900, viewportHeight: 500, rowStride: 33, rowCount: 1000, overscan: 5,
    });
    assert.equal(start, 0);
    assert.equal(end, 5);
});

test('computeWindow is empty for no rows or a zero stride', () => {
    assert.deepEqual(computeWindow({ scrollTop: 0, viewportHeight: 400, rowStride: 33, rowCount: 0 }), { start: 0, end: 0 });
    assert.deepEqual(computeWindow({ scrollTop: 0, viewportHeight: 400, rowStride: 0, rowCount: 10 }), { start: 0, end: 0 });
});

test('scrollTopToReveal returns null for a row already in view', () => {
    assert.equal(scrollTopToReveal({
        index: 10, rowStride: 33, bodyTop: 80, stickyTop: 80, scrollTop: 0, viewportHeight: 600,
    }), null);
});

test('scrollTopToReveal scrolls a row hidden below / above the viewport into view', () => {
    const below = scrollTopToReveal({
        index: 100, rowStride: 33, bodyTop: 80, stickyTop: 80, scrollTop: 0, viewportHeight: 600,
    });
    assert.equal(below, 80 + 100 * 33 + 33 - 600);

    const above = scrollTopToReveal({
        index: 5, rowStride: 33, bodyTop: 80, stickyTop: 80, scrollTop: 3000, viewportHeight: 600,
    });
    assert.equal(above, 80 + 5 * 33 - 80);
});
