import { TextAreaField } from './Field.jsx';
import { DEPARTMENTS, TIME_SLOTS, doctorsFor, isSlotBooked, isSlotInPast, slotTo12Hour } from '../lib/data.js';
import { LIMITS, addDays, formatINR, toISODate } from '../lib/validation.js';

export default function AppointmentStep({ form, showError, setField, onBlur, today, bookedByUser }) {
  const doctors = doctorsFor(form.department);
  const minDate = toISODate(today);
  const maxDate = toISODate(addDays(today, LIMITS.bookingWindowDays));
  const canPickSlot = Boolean(form.doctor && form.date);
  const symptomsLength = form.symptoms.trim().length;
  const deptError = showError('department');
  const doctorError = showError('doctor');

  return (
    <div className="step">
      <header className="step__head">
        <h2>Choose your appointment</h2>
        <p>Pick a department, a doctor, then a free slot. Busy slots are greyed out.</p>
      </header>

      <fieldset className={`field choice ${deptError ? 'field--error' : ''}`}>
        <legend className="field__label">
          Department
          <span className="field__req" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="cards">
          {DEPARTMENTS.map((dept) => (
            <label
              key={dept.id}
              className={`card ${form.department === dept.id ? 'card--on' : ''}`}
              htmlFor={`dept-${dept.id}`}
            >
              <input
                id={`dept-${dept.id}`}
                type="radio"
                name="department"
                value={dept.id}
                checked={form.department === dept.id}
                onChange={() => setField('department', dept.id)}
                aria-invalid={Boolean(deptError)}
              />
              <span className="card__icon" aria-hidden="true">
                {dept.icon}
              </span>
              <span className="card__body">
                <span className="card__title">{dept.name}</span>
                <span className="card__sub">{dept.blurb}</span>
              </span>
              <span className="card__fee">{formatINR(dept.fee)}</span>
            </label>
          ))}
        </div>
        {deptError ? (
          <p className="field__error" id="department-error" role="alert">
            <span aria-hidden="true">⚠</span> {deptError}
          </p>
        ) : (
          <p className="field__hint">Consultation fee is shown for each department.</p>
        )}
      </fieldset>

      <fieldset className={`field choice ${doctorError ? 'field--error' : ''}`}>
        <legend className="field__label">
          Doctor
          <span className="field__req" aria-hidden="true">
            *
          </span>
        </legend>
        {!form.department ? (
          <p className="empty-inline">Select a department above to see the available doctors.</p>
        ) : (
          <div className="cards cards--doctor">
            {doctors.map((doc) => (
              <label
                key={doc.id}
                className={`card card--doctor ${form.doctor === doc.id ? 'card--on' : ''}`}
                htmlFor={`doc-${doc.id}`}
              >
                <input
                  id={`doc-${doc.id}`}
                  type="radio"
                  name="doctor"
                  value={doc.id}
                  checked={form.doctor === doc.id}
                  onChange={() => setField('doctor', doc.id)}
                  aria-invalid={Boolean(doctorError)}
                />
                <span className="avatar" aria-hidden="true">
                  {doc.name.replace('Dr. ', '').charAt(0)}
                </span>
                <span className="card__body">
                  <span className="card__title">{doc.name}</span>
                  <span className="card__sub">
                    {doc.exp} yrs experience · {doc.languages}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
        {doctorError ? (
          <p className="field__error" id="doctor-error" role="alert">
            <span aria-hidden="true">⚠</span> {doctorError}
          </p>
        ) : (
          <p className="field__hint">Changing the department clears the selected doctor and slot.</p>
        )}
      </fieldset>

      <div className="grid grid--2">
        <div className="field">
          <label className="field__label" htmlFor="date">
            Appointment date
            <span className="field__req" aria-hidden="true">
              *
            </span>
          </label>
          <div className="control">
            <input
              id="date"
              name="date"
              type="date"
              className="control__input"
              value={form.date}
              min={minDate}
              max={maxDate}
              onChange={(event) => setField('date', event.target.value)}
              onBlur={() => onBlur('date')}
              aria-invalid={Boolean(showError('date'))}
              aria-describedby={showError('date') ? 'date-error' : 'date-hint'}
            />
          </div>
          <div className="field__meta">
            {showError('date') ? (
              <p className="field__error" id="date-error" role="alert">
                <span aria-hidden="true">⚠</span> {showError('date')}
              </p>
            ) : (
              <p className="field__hint" id="date-hint">
                Bookable from today up to {LIMITS.bookingWindowDays} days ahead. Clinic closed on Sundays.
              </p>
            )}
          </div>
        </div>

        <div className="field">
          <span className="field__label">Selected slot</span>
          <div className={`slot-preview ${form.slot ? 'slot-preview--on' : ''}`}>
            {form.slot ? `${slotTo12Hour(form.slot)} IST` : 'No slot chosen yet'}
          </div>
          <div className="field__meta">
            <p className="field__hint">All timings are India Standard Time.</p>
          </div>
        </div>
      </div>

      <fieldset className={`field choice ${showError('slot') ? 'field--error' : ''}`}>
        <legend className="field__label">
          Time slot
          <span className="field__req" aria-hidden="true">
            *
          </span>
        </legend>
        {!canPickSlot ? (
          <p className="empty-inline">Choose a doctor and a date to load the available slots.</p>
        ) : (
          <>
            <div className="slots" role="group" aria-label="Available time slots">
              {TIME_SLOTS.map((slot) => {
                const key = `${form.doctor}|${form.date}|${slot}`;
                const booked = isSlotBooked(form.doctor, form.date, slot) || bookedByUser.has(key);
                const past = isSlotInPast(form.date, slot);
                const disabled = booked || past;
                const selected = form.slot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`slot ${selected ? 'slot--on' : ''} ${disabled ? 'slot--off' : ''}`}
                    onClick={() => setField('slot', slot)}
                    disabled={disabled}
                    aria-pressed={selected}
                    title={booked ? 'Already booked' : past ? 'Time has passed' : 'Available'}
                  >
                    {slotTo12Hour(slot)}
                  </button>
                );
              })}
            </div>
            <div className="legend">
              <span className="legend__item">
                <i className="legend__swatch" /> Available
              </span>
              <span className="legend__item">
                <i className="legend__swatch legend__swatch--on" /> Selected
              </span>
              <span className="legend__item">
                <i className="legend__swatch legend__swatch--off" /> Booked / passed
              </span>
            </div>
          </>
        )}
        {showError('slot') ? (
          <p className="field__error" id="slot-error" role="alert">
            <span aria-hidden="true">⚠</span> {showError('slot')}
          </p>
        ) : (
          <p className="field__hint">Each slot is 30 minutes long.</p>
        )}
      </fieldset>

      <TextAreaField
        id="symptoms"
        label="Reason for visit / symptoms"
        required
        rows={4}
        maxLength={LIMITS.symptomsMax}
        placeholder="e.g. Dry cough and mild fever since Monday, worse at night."
        value={form.symptoms}
        onChange={(value) => setField('symptoms', value)}
        onBlur={onBlur}
        error={showError('symptoms')}
        hint={`At least ${LIMITS.symptomsMin} characters so the doctor can prepare.`}
        counter={{
          text: `${symptomsLength}/${LIMITS.symptomsMax}`,
          warn: symptomsLength > 0 && symptomsLength < LIMITS.symptomsMin,
        }}
      />
    </div>
  );
}
