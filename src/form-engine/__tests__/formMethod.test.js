import test from 'node:test';
import assert from 'node:assert/strict';

import formMethod from '../core/formMethod.js';

test('required validation treats whitespace as empty but keeps 0 valid', () => {
    const form = formMethod.createForm({
        schema: [
            { id: 'countryName', type: 'text', label: 'Country Name', required: true },
            { id: 'countryCode', type: 'text', label: 'Country Code', required: true },
            { id: 'age', type: 'number', label: 'Age', required: true },
            { id: 'isActive', type: 'checkbox', label: 'Active', required: true },
        ],
        initialValue: {
            countryName: '   ',
            countryCode: '',
            age: 0,
            isActive: false,
        },
    });

    assert.equal(form.methods.validate(), false);
    assert.equal(form.methods.getErrors().countryName, 'Country Name is required');
    assert.equal(form.methods.getErrors().countryCode, 'Country Code is required');
    assert.equal(form.methods.getErrors().age, undefined);
    assert.equal(form.methods.getErrors().isActive, 'Active is required');
});

test('handleFormSave blocks save on validation errors and focuses the first invalid field', async () => {
    const form = formMethod.createForm({
        schema: [
            { id: 'countryName', type: 'text', label: 'Country Name', required: true },
            { id: 'countryCode', type: 'text', label: 'Country Code', required: true },
        ],
        initialValue: { countryName: '', countryCode: '' },
    });

    let saveCalled = false;
    const result = await form.methods.handleFormSave(async () => {
        saveCalled = true;
    });

    assert.equal(saveCalled, false);
    assert.equal(result.success, false);
    assert.equal(result.type, 'validation');
    assert.equal(result.errors.countryName, 'Country Name is required');
    assert.equal(form.methods.getErrors().countryName, 'Country Name is required');
    assert.equal(form.methods.getFirstInvalidField(), 'countryName');
});

test('handleFormSave executes the save callback once after validation passes', async () => {
    const form = formMethod.createForm({
        schema: [{ id: 'countryName', type: 'text', label: 'Country Name', required: true }],
        initialValue: { countryName: 'India' },
    });

    let saveCalled = false;
    const result = await form.methods.handleFormSave(async (data) => {
        saveCalled = true;
        assert.deepEqual(data, { countryName: 'India' });
        return { ok: true };
    }, {
        successMessage: 'Country saved successfully',
    });

    assert.equal(saveCalled, true);
    assert.equal(result.success, true);
    assert.equal(form.methods.isSubmitting(), false);
});
