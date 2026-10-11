import test from 'node:test';
import assert from 'node:assert/strict';

import {
    describeApiError,
    humanizeField,
    isSafeMessage,
    GENERIC_ERROR_MESSAGE,
} from '../apiErrors.js';

const httpError = (status, data) => ({
    isAxiosError: true,
    message: `Request failed with status code ${status}`,
    response: { status, data },
});

test('keeps authored 4xx backend messages', () => {
    const result = describeApiError(httpError(400, { success: false, message: 'Asset Name is required' }));
    assert.equal(result.title, 'Please check your input');
    assert.equal(result.message, 'Asset Name is required');
    assert.equal(result.retryable, false);
});

test('never exposes raw database internals from 5xx responses', () => {
    const raw = 'E11000 duplicate key error collection: hrm.banks index: bankName_1 dup key: { bankName: "HDFC" }';
    const result = describeApiError(httpError(500, { success: false, message: raw }));
    assert.equal(result.message, 'A record with this bank name already exists.');
    assert.ok(!result.message.includes('E11000'));
});

test('translates mongoose validation errors into a readable list', () => {
    const raw = 'Bank validation failed: bankName: Path `bankName` is required., ifscCode: Cast to Number failed for value "x"';
    const result = describeApiError(httpError(500, { message: raw }));
    assert.deepEqual(result.details, ['Bank name is required.', 'Ifsc code has an invalid value.']);
});

test('hides unknown 5xx messages and stack traces', () => {
    const result = describeApiError(httpError(500, { message: "Cannot read properties of undefined (reading '_id')" }));
    assert.equal(result.message, GENERIC_ERROR_MESSAGE);

    const html = describeApiError(httpError(500, '<!DOCTYPE html><html><body><pre>Error: boom\n    at foo (/app/x.js:1:1)</pre>'));
    assert.equal(html.message, GENERIC_ERROR_MESSAGE);
});

test('network failures and gateway errors are retryable', () => {
    const offline = describeApiError({ isAxiosError: true, code: 'ERR_NETWORK', message: 'Network Error', request: {} });
    assert.equal(offline.title, "Can't reach the server");
    assert.equal(offline.retryable, true);
    assert.equal(offline.iconName, 'offline');

    const timeout = describeApiError({ isAxiosError: true, code: 'ECONNABORTED', message: 'timeout of 1000ms exceeded', request: {} });
    assert.equal(timeout.title, 'The request timed out');
    assert.equal(timeout.retryable, true);

    assert.equal(describeApiError(httpError(503, {})).retryable, true);
    assert.equal(describeApiError(httpError(404, {})).retryable, false);
});

test('auth errors get dedicated titles', () => {
    assert.equal(describeApiError(httpError(401, {})).title, 'Session expired');
    assert.equal(describeApiError(httpError(403, {})).title, 'Access denied');
});

test('server-provided validation details are preserved', () => {
    const result = describeApiError(httpError(422, {
        message: 'Validation failed',
        errors: { email: 'Email is invalid', phone: { message: 'Phone is required' } },
    }));
    assert.deepEqual(result.details, ['Email is invalid', 'Phone is required']);
});

test('plain thrown errors fall back safely', () => {
    assert.equal(describeApiError(new Error('Failed to save Bank')).message, 'Failed to save Bank');
    assert.equal(describeApiError(new TypeError('x is not a function')).message, GENERIC_ERROR_MESSAGE);
    assert.equal(describeApiError(undefined).message, GENERIC_ERROR_MESSAGE);
});

test('helpers', () => {
    assert.equal(humanizeField('departmentId'), 'Department');
    assert.equal(humanizeField('bank_name'), 'Bank name');
    assert.equal(isSafeMessage('x'.repeat(400)), false);
    assert.equal(isSafeMessage(''), false);
    assert.equal(isSafeMessage('Holiday already exists for this date'), true);
});
