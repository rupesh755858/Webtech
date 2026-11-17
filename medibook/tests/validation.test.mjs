/**
 * Unit tests for the client-side validation rules.
 * Run with:  npm test        (node --test tests/)
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateName, validateEmail, validatePhone, validateAge, validateGender,
  validateDepartment, validateDoctor, validateDate, validateSlot,
  validateSymptoms, validateConsent, validateForm, isStepValid,
  firstErrorField, onlyDigits, toDisplayDate, parseISODate,
  STEP_FIELDS,
} from '../src/lib/validation.js';
import { DEPARTMENTS, DOCTORS, isSlotBooked, slotTo12Hour } from '../src/lib/data.js';

const TODAY = new Date(2026, 10, 17); // Tue 17 Nov 2026
const validForm = {
  fullName: 'Nilesh Patil',
  email: 'nilesh.patil@example.com',
  phone: '9876543210',
  age: '34',
  gender: 'male',
  department: 'cardio',
  doctor: 'd-meera',
  date: '2026-11-18', // Wednesday
  slot: '10:30',
  symptoms: 'Chest tightness while climbing stairs for the last three days.',
  consent: true,
};

/* ------------------------------ name ------------------------------ */
test('name: valid Indian names pass', () => {
  for (const n of ['Nilesh Patil', 'A. R. Rahman', "D'Souza Maria", 'Ananya Iyer']) {
    assert.equal(validateName(n), null, n);
  }
});

test('name: invalid inputs are rejected with a message', () => {
  assert.match(validateName(''), /required/i);
  assert.match(validateName('   '), /required/i);
  assert.match(validateName('Al'), /at least 3/i);
  assert.match(validateName('A'.repeat(51)), /longer than 50/i);
  assert.match(validateName('Nilesh123'), /letters/i);
  assert.match(validateName('<script>alert(1)</script>'), /letters/i);
  assert.match(validateName('Rahul@Patil'), /letters/i);
});

/* ------------------------------ email ----------------------------- */
test('email: valid addresses pass', () => {
  for (const e of ['a@b.co', 'nilesh.nanapatil@gmail.com', 'name+tag@sub.domain.in']) {
    assert.equal(validateEmail(e), null, e);
  }
});

test('email: invalid addresses are rejected', () => {
  assert.match(validateEmail(''), /required/i);
  assert.match(validateEmail('nilesh'), /valid email/i);
  assert.match(validateEmail('nilesh@'), /valid email/i);
  assert.match(validateEmail('nilesh@gmail'), /valid email/i);
  assert.match(validateEmail('nilesh @gmail.com'), /spaces|valid email/i);
  assert.match(validateEmail('@gmail.com'), /valid email/i);
  assert.match(validateEmail('nilesh@gmail..com'), /two dots/i);
});

/* ------------------------------ phone ----------------------------- */
test('phone: 10-digit Indian mobile numbers pass', () => {
  for (const p of ['9876543210', '6123456789', '9000000000']) {
    assert.equal(validatePhone(p), null, p);
  }
});

test('phone: invalid numbers are rejected', () => {
  assert.match(validatePhone(''), /required/i);
  assert.match(validatePhone('98765'), /exactly 10/i);
  assert.match(validatePhone('98765432101'), /exactly 10/i);
  assert.match(validatePhone('1234567890'), /start with 6, 7, 8 or 9/i);
  assert.match(validatePhone('abcdefghij'), /required/i);
});

test('phone: onlyDigits strips non-digits and caps length', () => {
  assert.equal(onlyDigits('+91 98765-43210'), '9198765432');
  assert.equal(onlyDigits('98a76b54c32109'), '9876543210');
});

/* ------------------------------- age ------------------------------ */
test('age: valid values pass', () => {
  assert.equal(validateAge('1'), null);
  assert.equal(validateAge('34'), null);
  assert.equal(validateAge('120'), null);
});

test('age: invalid values are rejected', () => {
  assert.match(validateAge(''), /required/i);
  assert.match(validateAge('0'), /between 1 and 120/i);
  assert.match(validateAge('121'), /between 1 and 120/i);
  assert.match(validateAge('3.5'), /whole number/i);
  assert.match(validateAge('abc'), /whole number/i);
  assert.match(validateAge('-5'), /whole number/i);
});

/* ----------------------------- gender ----------------------------- */
test('gender: valid options pass, empty/other values fail', () => {
  assert.equal(validateGender('female'), null);
  assert.equal(validateGender('other'), null);
  assert.match(validateGender(''), /select a gender/i);
  assert.match(validateGender('alien'), /valid gender/i);
});

/* ------------------- department / doctor / slot ------------------- */
test('department and doctor must come from the known lists', () => {
  assert.equal(validateDepartment('cardio', DEPARTMENTS), null);
  assert.match(validateDepartment('', DEPARTMENTS), /choose a department/i);
  assert.match(validateDepartment('astrology', DEPARTMENTS), /from the list/i);

  assert.equal(validateDoctor('d-meera', DOCTORS), null);
  assert.match(validateDoctor('', DOCTORS), /select a doctor/i);
  assert.match(validateDoctor('d-nobody', DOCTORS), /from the list/i);

  assert.equal(validateSlot('10:30'), null);
  assert.match(validateSlot(''), /choose a time slot/i);
  assert.match(validateSlot('10.30'), /valid time slot/i);
});

/* ------------------------------ date ------------------------------ */
test('date: today and future weekdays pass', () => {
  assert.equal(validateDate('2026-11-17', TODAY), null); // today, Tuesday
  assert.equal(validateDate('2026-11-18', TODAY), null); // tomorrow
  assert.equal(validateDate('2026-12-17', TODAY), null); // exactly +30 days
});

test('date: past, Sunday, far-future and malformed dates are rejected', () => {
  assert.match(validateDate('', TODAY), /required/i);
  assert.match(validateDate('2026-11-16', TODAY), /past/i);
  assert.match(validateDate('2026-11-22', TODAY), /Sundays/i); // Sunday
  assert.match(validateDate('2026-12-18', TODAY), /30 days/i);
  assert.match(validateDate('18/11/2026', TODAY), /dd\/mm\/yyyy/i);
  assert.match(validateDate('2026-02-31', TODAY), /dd\/mm\/yyyy/i);
});

test('date: helpers parse and format correctly', () => {
  assert.equal(toDisplayDate('2026-11-18'), '18/11/2026');
  assert.equal(parseISODate('2026-02-31'), null);
  assert.equal(parseISODate('2026-11-18').getDate(), 18);
});

/* ---------------------------- symptoms ---------------------------- */
test('symptoms: length is enforced', () => {
  assert.match(validateSymptoms(''), /required/i);
  assert.match(validateSymptoms('cough'), /at least 15/i);
  assert.equal(validateSymptoms('Dry cough and mild fever since Monday.'), null);
  assert.match(validateSymptoms('x'.repeat(201)), /within 200/i);
});

test('consent must be ticked', () => {
  assert.match(validateConsent(false), /accept/i);
  assert.equal(validateConsent(true), null);
});

/* --------------------------- whole form --------------------------- */
test('validateForm returns no errors for a valid form', () => {
  const errors = validateForm(validForm, { departments: DEPARTMENTS, doctors: DOCTORS, today: TODAY });
  assert.deepEqual(errors, {});
  assert.equal(isStepValid(0, errors), true);
  assert.equal(isStepValid(1, errors), true);
  assert.equal(isStepValid(2, errors), true);
});

test('validateForm reports every empty required field at once', () => {
  const empty = {};
  const errors = validateForm(empty, { departments: DEPARTMENTS, doctors: DOCTORS, today: TODAY });
  assert.deepEqual(Object.keys(errors).sort(), [
    'age', 'consent', 'date', 'department', 'doctor', 'email', 'fullName', 'gender', 'phone', 'slot', 'symptoms',
  ]);
  assert.equal(isStepValid(0, errors), false);
  assert.equal(firstErrorField(0, errors), 'fullName');
  assert.equal(firstErrorField(1, errors), 'department');
});

test('step validation is scoped to that step only', () => {
  const errors = validateForm({ ...validForm, date: '2026-11-16' }, {
    departments: DEPARTMENTS, doctors: DOCTORS, today: TODAY,
  });
  assert.equal(isStepValid(0, errors), true);
  assert.equal(isStepValid(1, errors), false);
  assert.equal(firstErrorField(1, errors), 'date');
});

test('step field map covers all 11 form fields', () => {
  assert.equal(STEP_FIELDS.flat().length, 11);
});

/* ------------------------- demo slot logic ------------------------ */
test('slot availability is deterministic and time formatting is 12-hour', () => {
  const a = isSlotBooked('d-meera', '2026-11-18', '10:30');
  const b = isSlotBooked('d-meera', '2026-11-18', '10:30');
  assert.equal(a, b);
  assert.equal(isSlotBooked('', '2026-11-18', '10:30'), false);
  assert.equal(slotTo12Hour('09:00'), '9:00 AM');
  assert.equal(slotTo12Hour('13:00'), '1:00 PM');
  assert.equal(slotTo12Hour('12:30'), '12:30 PM');
});
