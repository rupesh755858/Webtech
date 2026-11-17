/**
 * Pure, framework-free validation rules.
 * Keeping these as plain functions means they can be unit-tested in Node
 * (see tests/validation.test.mjs) and reused by any component.
 */

export const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const PHONE_RE = /^[6-9][0-9]{9}$/;

export const LIMITS = {
  nameMin: 3,
  nameMax: 50,
  ageMin: 1,
  ageMax: 120,
  symptomsMin: 15,
  symptomsMax: 200,
  bookingWindowDays: 30,
};

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

export function onlyDigits(value, max = 10) {
  return String(value ?? '').replace(/\D/g, '').slice(0, max);
}

/** Local (not UTC) yyyy-mm-dd for a Date. */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** dd/mm/yyyy, the format used across India. */
export function toDisplayDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Parse yyyy-mm-dd into a local Date at midnight, or null. */
export function parseISODate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

export function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date, days) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function formatINR(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/* ------------------------------------------------------------------ */
/* field-level rules: each returns an error string, or null when valid */
/* ------------------------------------------------------------------ */

export function validateName(value) {
  const name = String(value ?? '').trim();
  if (!name) return 'Full name is required.';
  if (name.length < LIMITS.nameMin) return `Name must be at least ${LIMITS.nameMin} characters.`;
  if (name.length > LIMITS.nameMax) return `Name cannot be longer than ${LIMITS.nameMax} characters.`;
  if (!NAME_RE.test(name)) return 'Name may contain letters, spaces, apostrophes, dots and hyphens only.';
  if (!/[A-Za-z]{2}/.test(name)) return 'Please enter a valid name.';
  return null;
}

export function validateEmail(value) {
  const email = String(value ?? '').trim();
  if (!email) return 'Email address is required.';
  if (email.length > 100) return 'Email address is too long.';
  if (/\s/.test(email)) return 'Email address cannot contain spaces.';
  if (email.includes('..')) return 'Email address cannot contain two dots in a row.';
  if (email.startsWith('.') || email.includes('.@')) return 'Enter a valid email, for example name@example.com.';
  if (!EMAIL_RE.test(email)) return 'Enter a valid email, for example name@example.com.';
  return null;
}

export function validatePhone(value) {
  // Note: no truncation here — an 11-digit number must fail, not be trimmed.
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return 'Mobile number is required.';
  if (digits.length !== 10) return 'Mobile number must be exactly 10 digits.';
  if (!PHONE_RE.test(digits)) return 'Mobile number must start with 6, 7, 8 or 9.';
  return null;
}

export function validateAge(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return 'Age is required.';
  if (!/^\d+$/.test(raw)) return 'Age must be a whole number.';
  const age = Number(raw);
  if (age < LIMITS.ageMin || age > LIMITS.ageMax) {
    return `Age must be between ${LIMITS.ageMin} and ${LIMITS.ageMax} years.`;
  }
  return null;
}

export function validateGender(value) {
  if (!value) return 'Please select a gender.';
  if (!['female', 'male', 'other'].includes(value)) return 'Please select a valid gender.';
  return null;
}

export function validateDepartment(value, departments = []) {
  if (!value) return 'Please choose a department.';
  if (departments.length && !departments.some((d) => d.id === value)) {
    return 'Please choose a department from the list.';
  }
  return null;
}

export function validateDoctor(value, doctors = []) {
  if (!value) return 'Please select a doctor.';
  if (doctors.length && !doctors.some((d) => d.id === value)) {
    return 'Please select a doctor from the list.';
  }
  return null;
}

export function validateDate(value, today = startOfToday()) {
  if (!value) return 'Appointment date is required.';
  const date = parseISODate(value);
  if (!date) return 'Enter the date as dd/mm/yyyy.';
  if (date < today) return 'Appointment date cannot be in the past.';
  if (date.getTime() === today.getTime() && new Date() > new Date(date.getTime() + 24 * 3600 * 1000)) {
    return 'That date has already passed.';
  }
  const lastAllowed = addDays(today, LIMITS.bookingWindowDays);
  if (date > lastAllowed) {
    return `Appointments can be booked up to ${LIMITS.bookingWindowDays} days in advance.`;
  }
  if (date.getDay() === 0) return 'The clinic is closed on Sundays. Please pick another day.';
  return null;
}

export function validateSlot(value) {
  if (!value) return 'Please choose a time slot.';
  if (!/^\d{2}:\d{2}$/.test(value)) return 'Please choose a valid time slot.';
  return null;
}

export function validateSymptoms(value) {
  const text = String(value ?? '').trim();
  if (!text) return 'Symptoms description is required.';
  if (text.length < LIMITS.symptomsMin) {
    return `Please add at least ${LIMITS.symptomsMin} characters (${text.length}/${LIMITS.symptomsMin}).`;
  }
  if (text.length > LIMITS.symptomsMax) {
    return `Please keep it within ${LIMITS.symptomsMax} characters.`;
  }
  return null;
}

export function validateConsent(value) {
  if (!value) return 'You must accept the clinic terms to confirm the booking.';
  return null;
}

/* ------------------------------------------------------------------ */
/* whole-form validation                                               */
/* ------------------------------------------------------------------ */

export const STEP_FIELDS = [
  ['fullName', 'email', 'phone', 'age', 'gender'],
  ['department', 'doctor', 'date', 'slot', 'symptoms'],
  ['consent'],
];

/**
 * @param {object} form  current form state
 * @param {object} ctx   { departments, doctors, today }
 * @returns {object}     map of field -> error message (only invalid fields present)
 */
export function validateForm(form, ctx = {}) {
  const today = ctx.today || startOfToday();
  const rules = {
    fullName: () => validateName(form.fullName),
    email: () => validateEmail(form.email),
    phone: () => validatePhone(form.phone),
    age: () => validateAge(form.age),
    gender: () => validateGender(form.gender),
    department: () => validateDepartment(form.department, ctx.departments || []),
    doctor: () => validateDoctor(form.doctor, ctx.doctors || []),
    date: () => validateDate(form.date, today),
    slot: () => validateSlot(form.slot),
    symptoms: () => validateSymptoms(form.symptoms),
    consent: () => validateConsent(form.consent),
  };

  const errors = {};
  for (const [field, run] of Object.entries(rules)) {
    const message = run();
    if (message) errors[field] = message;
  }
  return errors;
}

/** Is a given step (0-based) free of errors? */
export function isStepValid(step, errors) {
  const fields = STEP_FIELDS[step] || [];
  return fields.every((field) => !errors[field]);
}

/** First invalid field of a step, used to move keyboard focus. */
export function firstErrorField(step, errors) {
  const fields = STEP_FIELDS[step] || [];
  return fields.find((field) => errors[field]) || null;
}
