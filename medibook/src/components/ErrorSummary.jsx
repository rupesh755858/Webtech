import { STEP_FIELDS } from '../lib/validation.js';

const LABELS = {
  fullName: 'Full name',
  email: 'Email address',
  phone: 'Mobile number',
  age: 'Age',
  gender: 'Gender',
  department: 'Department',
  doctor: 'Doctor',
  date: 'Appointment date',
  slot: 'Time slot',
  symptoms: 'Reason for visit',
  consent: 'Terms & conditions',
};

/** Accessible error summary shown above the form after a failed submit. */
export default function ErrorSummary({ step, errors }) {
  const fields = (STEP_FIELDS[step] || []).filter((field) => errors[field]);
  if (!fields.length) return null;

  return (
    <div className="alert" role="alert" tabIndex={-1}>
      <p className="alert__title">
        <span aria-hidden="true">⚠</span> {fields.length} field{fields.length > 1 ? 's' : ''} need
        {fields.length > 1 ? '' : 's'} your attention
      </p>
      <ul className="alert__list">
        {fields.map((field) => (
          <li key={field}>
            <a href={`#${field}`}>
              <strong>{LABELS[field]}:</strong> {errors[field]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
