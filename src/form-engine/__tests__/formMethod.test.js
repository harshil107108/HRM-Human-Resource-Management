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

test('phone and email fields validate with 10-digit phone and gmail-only email rules', () => {
    const form = formMethod.createForm({
        schema: [
            { id: 'contactPhone', type: 'phone', label: 'Phone', required: true },
            { id: 'workEmail', type: 'email', label: 'Email', required: true },
        ],
        initialValue: {
            contactPhone: '987654321',
            workEmail: 'demo@gmail.com',
        },
    });

    assert.equal(form.methods.validate(), false);
    assert.equal(form.methods.getErrors().contactPhone, 'Phone number must be 10 digits');
    assert.equal(form.methods.getErrors().workEmail, undefined);

    form.methods.setValue('contactPhone', '9876543210');
    form.methods.setValue('workEmail', 'test@gmail.com');

    assert.equal(form.methods.validate(), true);
    assert.equal(form.methods.getErrors().contactPhone, undefined);
    assert.equal(form.methods.getErrors().workEmail, undefined);
});

test('invalid email and phone stop focus on enter and keep the error on the current field', () => {
    const form = formMethod.createForm({
        schema: [
            { id: 'contactPhone', type: 'phone', label: 'Phone', required: true, nextFocusField: 'workEmail' },
            { id: 'workEmail', type: 'email', label: 'Email', required: true },
        ],
        initialValue: { contactPhone: '123', workEmail: 'demo@yahoo.com' },
    });

    const phoneValidation = form.methods.validateField('contactPhone');
    assert.equal(phoneValidation.isValid, false);
    assert.equal(form.methods.getErrors().contactPhone, 'Phone number must be 10 digits');

    const emailValidation = form.methods.validateField('workEmail');
    assert.equal(emailValidation.isValid, false);
    assert.equal(form.methods.getErrors().workEmail, 'Email must be a valid @gmail.com address');
});
