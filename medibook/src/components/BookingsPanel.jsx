import { useState } from 'react';
import { slotTo12Hour } from '../lib/data.js';
import { formatINR, toDisplayDate } from '../lib/validation.js';

function BookingCard({ booking, onCancel }) {
  const [confirming, setConfirming] = useState(false);
  const cancelled = booking.status === 'cancelled';

  return (
    <article className={`booking ${cancelled ? 'booking--cancelled' : ''}`}>
      <header className="booking__head">
        <div>
          <p className="booking__id">{booking.id}</p>
          <h3 className="booking__title">{booking.doctorName}</h3>
          <p className="booking__sub">
            {booking.departmentName} · {toDisplayDate(booking.date)} · {slotTo12Hour(booking.slot)} IST
          </p>
        </div>
        <span className={`pill ${cancelled ? 'pill--off' : 'pill--ok'}`}>
          {cancelled ? 'Cancelled' : 'Confirmed'}
        </span>
      </header>
      <p className="booking__symptoms">{booking.symptoms}</p>
      <footer className="booking__foot">
        <span className="booking__amount">{formatINR(booking.total)} payable at clinic</span>
        {cancelled ? (
          <span className="booking__note">Cancelled — please book a new slot.</span>
        ) : confirming ? (
          <span className="booking__confirm">
            Cancel this appointment?
            <button type="button" className="btn btn--danger btn--sm" onClick={() => onCancel(booking.id)}>
              Yes, cancel
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirming(false)}>
              Keep it
            </button>
          </span>
        ) : (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirming(true)}>
            Cancel appointment
          </button>
        )}
      </footer>
    </article>
  );
}

export default function BookingsPanel({ bookings, onCancel, onBookAnother }) {
  if (!bookings.length) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon" aria-hidden="true">
          🗓️
        </div>
        <h2>No appointments yet</h2>
        <p>Once you book an appointment it will appear here with its booking ID.</p>
        <button type="button" className="btn btn--primary" onClick={onBookAnother}>
          Book an appointment
        </button>
      </div>
    );
  }

  return (
    <div className="bookings">
      <header className="bookings__head">
        <div>
          <h2>My bookings</h2>
          <p>
            {bookings.filter((booking) => booking.status === 'confirmed').length} confirmed ·{' '}
            {bookings.length} total. Saved in this browser.
          </p>
        </div>
        <button type="button" className="btn btn--primary btn--sm" onClick={onBookAnother}>
          + New booking
        </button>
      </header>
      <div className="bookings__list">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onCancel={onCancel} />
        ))}
      </div>
    </div>
  );
}
