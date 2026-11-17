import { slotTo12Hour } from '../lib/data.js';
import { formatINR, toDisplayDate } from '../lib/validation.js';

export default function SuccessPanel({ booking, onBookAnother, onViewBookings }) {
  return (
    <div className="success" role="status" aria-live="polite">
      <div className="success__badge" aria-hidden="true">
        ✓
      </div>
      <h2 className="success__title">Appointment confirmed</h2>
      <p className="success__lead">
        Thank you, {booking.patientName.split(' ')[0]}. Your appointment with{' '}
        <strong>{booking.doctorName}</strong> is booked for{' '}
        <strong>
          {toDisplayDate(booking.date)} at {slotTo12Hour(booking.slot)} IST
        </strong>
        . A confirmation has been sent to {booking.email}.
      </p>

      <div className="ticket" id="receipt">
        <div className="ticket__head">
          <div>
            <p className="ticket__label">Booking ID</p>
            <p className="ticket__id">{booking.id}</p>
          </div>
          <span className="pill pill--ok">Confirmed</span>
        </div>
        <dl className="ticket__grid">
          <div>
            <dt>Patient</dt>
            <dd>{booking.patientName}</dd>
          </div>
          <div>
            <dt>Age / Gender</dt>
            <dd>
              {booking.age} years · {booking.gender.charAt(0).toUpperCase() + booking.gender.slice(1)}
            </dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{booking.departmentName}</dd>
          </div>
          <div>
            <dt>Doctor</dt>
            <dd>{booking.doctorName}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{toDisplayDate(booking.date)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{slotTo12Hour(booking.slot)} IST</dd>
          </div>
          <div>
            <dt>Mobile</dt>
            <dd>+91 {booking.phone}</dd>
          </div>
          <div>
            <dt>Amount payable</dt>
            <dd>{formatINR(booking.total)}</dd>
          </div>
          <div className="ticket__wide">
            <dt>Symptoms noted</dt>
            <dd>{booking.symptoms}</dd>
          </div>
        </dl>
      </div>

      <div className="success__actions">
        <button type="button" className="btn btn--primary" onClick={onBookAnother}>
          Book another appointment
        </button>
        <button type="button" className="btn btn--ghost" onClick={onViewBookings}>
          View my bookings
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => window.print()}>
          Print receipt
        </button>
      </div>
    </div>
  );
}
