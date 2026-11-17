import { CONVENIENCE_FEE, departmentById, doctorById, slotTo12Hour } from '../lib/data.js';
import { formatINR, toDisplayDate } from '../lib/validation.js';

export default function SummaryCard({ form, step }) {
  const dept = departmentById(form.department);
  const doc = doctorById(form.doctor);
  const fee = dept?.fee ?? 0;
  const rows = [
    { label: 'Patient', value: form.fullName.trim() || 'Not added yet' },
    { label: 'Department', value: dept?.name || 'Not selected' },
    { label: 'Doctor', value: doc?.name || 'Not selected' },
    { label: 'Date', value: form.date ? toDisplayDate(form.date) : 'Not selected' },
    { label: 'Time', value: form.slot ? `${slotTo12Hour(form.slot)} IST` : 'Not selected' },
  ];

  return (
    <aside className="summary" aria-label="Booking summary">
      <div className="summary__head">
        <h2>Booking summary</h2>
        <span className="summary__step">Step {step + 1} of 3</span>
      </div>
      <dl className="summary__list">
        {rows.map((row) => (
          <div key={row.label} className="summary__row">
            <dt>{row.label}</dt>
            <dd className={row.value.startsWith('Not') ? 'is-muted' : ''}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="summary__fees">
        <div className="summary__row">
          <dt>Consultation</dt>
          <dd>{formatINR(fee)}</dd>
        </div>
        <div className="summary__row">
          <dt>Convenience fee</dt>
          <dd>{formatINR(CONVENIENCE_FEE)}</dd>
        </div>
        <div className="summary__row summary__row--total">
          <dt>Total</dt>
          <dd>{formatINR(fee + CONVENIENCE_FEE)}</dd>
        </div>
      </div>
      <p className="summary__note">
        <span aria-hidden="true">ℹ️</span> Nothing is charged online. Payment is collected at the
        clinic reception.
      </p>
    </aside>
  );
}
