import { CONVENIENCE_FEE, departmentById, doctorById, slotTo12Hour } from '../lib/data.js';
import { formatINR, toDisplayDate } from '../lib/validation.js';

function Row({ label, value }) {
  return (
    <div className="review__row">
      <dt>{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  );
}

export default function ReviewStep({ form, showError, setField, onBlur, onEdit }) {
  const dept = departmentById(form.department);
  const doc = doctorById(form.doctor);
  const fee = dept?.fee ?? 0;
  const consentError = showError('consent');

  return (
    <div className="step">
      <header className="step__head">
        <h2>Review &amp; confirm</h2>
        <p>Please check the details below. You can edit any section before confirming.</p>
      </header>

      <div className="review">
        <section className="review__block">
          <div className="review__blockhead">
            <h3>Patient</h3>
            <button type="button" className="link" onClick={() => onEdit(0)}>
              Edit
            </button>
          </div>
          <dl className="review__list">
            <Row label="Name" value={form.fullName} />
            <Row label="Email" value={form.email} />
            <Row label="Mobile" value={form.phone ? `+91 ${form.phone}` : ''} />
            <Row
              label="Age / Gender"
              value={
                form.age && form.gender
                  ? `${form.age} years · ${form.gender.charAt(0).toUpperCase()}${form.gender.slice(1)}`
                  : ''
              }
            />
          </dl>
        </section>

        <section className="review__block">
          <div className="review__blockhead">
            <h3>Appointment</h3>
            <button type="button" className="link" onClick={() => onEdit(1)}>
              Edit
            </button>
          </div>
          <dl className="review__list">
            <Row label="Department" value={dept?.name} />
            <Row label="Doctor" value={doc?.name} />
            <Row label="Date" value={form.date ? toDisplayDate(form.date) : ''} />
            <Row label="Time" value={form.slot ? `${slotTo12Hour(form.slot)} IST` : ''} />
            <Row label="Symptoms" value={form.symptoms} />
          </dl>
        </section>

        <section className="review__block review__block--fees">
          <div className="review__blockhead">
            <h3>Payment at clinic</h3>
          </div>
          <dl className="review__list">
            <Row label="Consultation fee" value={formatINR(fee)} />
            <Row label="Convenience fee" value={formatINR(CONVENIENCE_FEE)} />
            <div className="review__row review__row--total">
              <dt>Total payable</dt>
              <dd>{formatINR(fee + CONVENIENCE_FEE)}</dd>
            </div>
          </dl>
          <p className="review__note">Pay at the reception desk. Free cancellation up to 4 hours before the slot.</p>
        </section>
      </div>

      <div className={`field consent ${consentError ? 'field--error' : ''}`}>
        <label className="checkbox" htmlFor="consent">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={form.consent}
            onChange={(event) => setField('consent', event.target.checked)}
            onBlur={() => onBlur('consent')}
            aria-invalid={Boolean(consentError)}
            aria-describedby={consentError ? 'consent-error' : undefined}
          />
          <span>
            I confirm that the details above are correct and I accept the clinic&rsquo;s terms and
            cancellation policy.
          </span>
        </label>
        {consentError ? (
          <p className="field__error" id="consent-error" role="alert">
            <span aria-hidden="true">⚠</span> {consentError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
