import { TextField } from './Field.jsx';
import { onlyDigits } from '../lib/validation.js';

const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

export default function PatientStep({ form, showError, setField, onBlur }) {
  const genderError = showError('gender');

  return (
    <div className="step">
      <header className="step__head">
        <h2>Patient details</h2>
        <p>We use these details only to confirm and remind you about the appointment.</p>
      </header>

      <div className="grid grid--2">
        <TextField
          id="fullName"
          label="Full name"
          required
          placeholder="e.g. Nilesh Patil"
          autoComplete="name"
          maxLength={50}
          value={form.fullName}
          onChange={(value) => setField('fullName', value)}
          onBlur={onBlur}
          error={showError('fullName')}
          hint="As printed on your ID card"
        />

        <TextField
          id="email"
          label="Email address"
          required
          type="email"
          inputMode="email"
          placeholder="name@example.com"
          autoComplete="email"
          maxLength={100}
          value={form.email}
          onChange={(value) => setField('email', value)}
          onBlur={onBlur}
          error={showError('email')}
          hint="Your confirmation is sent here"
        />

        <TextField
          id="phone"
          label="Mobile number"
          required
          prefix="+91"
          inputMode="numeric"
          placeholder="9876543210"
          autoComplete="tel-national"
          maxLength={10}
          value={form.phone}
          onChange={(value) => setField('phone', onlyDigits(value, 10))}
          onBlur={onBlur}
          error={showError('phone')}
          hint="10 digits, starting with 6–9. Non-digits are ignored."
        />

        <TextField
          id="age"
          label="Age (years)"
          required
          inputMode="numeric"
          placeholder="34"
          maxLength={3}
          value={form.age}
          onChange={(value) => setField('age', onlyDigits(value, 3))}
          onBlur={onBlur}
          error={showError('age')}
          hint="Patients of all ages are welcome"
        />
      </div>

      <fieldset className={`field choice ${genderError ? 'field--error' : ''}`}>
        <legend className="field__label">
          Gender
          <span className="field__req" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="choice__row">
          {GENDERS.map((option) => (
            <label
              key={option.value}
              className={`chip ${form.gender === option.value ? 'chip--on' : ''}`}
              htmlFor={`gender-${option.value}`}
            >
              <input
                id={`gender-${option.value}`}
                type="radio"
                name="gender"
                value={option.value}
                checked={form.gender === option.value}
                onChange={() => setField('gender', option.value)}
                onBlur={() => onBlur('gender')}
                aria-invalid={Boolean(genderError)}
                aria-describedby={genderError ? 'gender-error' : undefined}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {genderError ? (
          <p className="field__error" id="gender-error" role="alert">
            <span aria-hidden="true">⚠</span> {genderError}
          </p>
        ) : (
          <p className="field__hint">Required for the doctor&rsquo;s records.</p>
        )}
      </fieldset>
    </div>
  );
}
