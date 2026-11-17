import { useCallback, useEffect, useMemo, useState } from 'react';

import Stepper from './components/Stepper.jsx';
import PatientStep from './components/PatientStep.jsx';
import AppointmentStep from './components/AppointmentStep.jsx';
import ReviewStep from './components/ReviewStep.jsx';
import SummaryCard from './components/SummaryCard.jsx';
import ErrorSummary from './components/ErrorSummary.jsx';
import SuccessPanel from './components/SuccessPanel.jsx';
import BookingsPanel from './components/BookingsPanel.jsx';
import Toast from './components/Toast.jsx';

import { CONVENIENCE_FEE, DEPARTMENTS, DOCTORS, departmentById, doctorById } from './lib/data.js';
import {
  STEP_FIELDS,
  firstErrorField,
  isStepValid,
  onlyDigits,
  startOfToday,
  validateForm,
} from './lib/validation.js';

const STORAGE_KEY = 'medibook.bookings.v1';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  age: '',
  gender: '',
  department: '',
  doctor: '',
  date: '',
  slot: '',
  symptoms: '',
  consent: false,
};

function loadBookings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function makeBookingId(now = new Date()) {
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `MB-${y}${m}${d}-${rand}`;
}

function buildBooking(form) {
  const dept = departmentById(form.department);
  const doc = doctorById(form.doctor);
  const fee = dept?.fee ?? 0;
  return {
    id: makeBookingId(),
    createdAt: new Date().toISOString(),
    patientName: form.fullName.trim().replace(/\s+/g, ' '),
    email: form.email.trim(),
    phone: onlyDigits(form.phone),
    age: Number(form.age),
    gender: form.gender,
    department: form.department,
    departmentName: dept?.name ?? '',
    doctor: form.doctor,
    doctorName: doc?.name ?? '',
    date: form.date,
    slot: form.slot,
    symptoms: form.symptoms.trim(),
    fee,
    convenienceFee: CONVENIENCE_FEE,
    total: fee + CONVENIENCE_FEE,
    status: 'confirmed',
  };
}

export default function App() {
  const [tab, setTab] = useState('book');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [bookings, setBookings] = useState(loadBookings);
  const [toast, setToast] = useState(null);

  const today = useMemo(() => startOfToday(), []);
  const ctx = useMemo(() => ({ departments: DEPARTMENTS, doctors: DOCTORS, today }), [today]);

  // Single source of truth: errors are recomputed from state on every render.
  const errors = useMemo(() => validateForm(form, ctx), [form, ctx]);
  const stepValid = isStepValid(step, errors);
  const completed = useMemo(
    () => STEP_FIELDS.map((_, index) => isStepValid(index, errors)),
    [errors],
  );

  // Slots already taken by this user in this browser.
  const bookedByUser = useMemo(
    () =>
      new Set(
        bookings
          .filter((booking) => booking.status === 'confirmed')
          .map((booking) => `${booking.doctor}|${booking.date}|${booking.slot}`),
      ),
    [bookings],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      /* storage may be full or blocked — the app still works in memory */
    }
  }, [bookings]);

  const dismissToast = useCallback(() => setToast(null), []);

  const notify = useCallback((type, text) => {
    setToast({ type, text, id: Date.now() });
  }, []);

  const showError = useCallback(
    (field) => (touched[field] || attempted ? errors[field] || null : null),
    [touched, attempted, errors],
  );

  const setField = useCallback((name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Dependent fields must be cleared when their parent changes.
      if (name === 'department') {
        next.doctor = '';
        next.slot = '';
      }
      if (name === 'doctor' || name === 'date') next.slot = '';
      return next;
    });
  }, []);

  const markTouched = useCallback((name) => {
    setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  }, []);

  const focusField = useCallback((field) => {
    if (!field) return;
    requestAnimationFrame(() => {
      const element =
        document.getElementById(field) || document.querySelector(`[name="${field}"]`);
      element?.focus?.();
      element?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    });
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  function handleSubmit(event) {
    event.preventDefault();
    const fresh = validateForm(form, ctx);

    if (step < 2) {
      if (!isStepValid(step, fresh)) {
        setAttempted(true);
        focusField(firstErrorField(step, fresh));
        notify('error', 'Please fix the highlighted fields before continuing.');
        return;
      }
      setAttempted(false);
      setStep((current) => current + 1);
      scrollTop();
      return;
    }

    const badStep = STEP_FIELDS.findIndex((_, index) => !isStepValid(index, fresh));
    if (badStep !== -1) {
      setStep(badStep);
      setAttempted(true);
      focusField(firstErrorField(badStep, fresh));
      notify('error', 'Some details still need attention. Please review the highlighted fields.');
      return;
    }

    const booking = buildBooking(form);
    setBookings((prev) => [booking, ...prev]);
    setReceipt(booking);
    setToast(null);
    setForm(EMPTY_FORM);
    setTouched({});
    setAttempted(false);
    setStep(0);
    scrollTop();
  }

  function goBack() {
    setAttempted(false);
    setStep((current) => Math.max(0, current - 1));
    scrollTop();
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setTouched({});
    setAttempted(false);
    setStep(0);
    notify('success', 'Form cleared. You can start a new booking.');
  }

  function cancelBooking(id) {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === id ? { ...booking, status: 'cancelled' } : booking)),
    );
    notify('success', 'Appointment cancelled. That slot is free for other patients again.');
  }

  function startAnother() {
    setReceipt(null);
    setTab('book');
    setForm(EMPTY_FORM);
    setTouched({});
    setAttempted(false);
    setStep(0);
    scrollTop();
  }

  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            ✚
          </span>
          <span className="brand__text">
            <strong>MediBook</strong>
            <small>Sunrise Family Clinic, Pune</small>
          </span>
        </div>

        <nav className="tabs" aria-label="Sections">
          <button
            type="button"
            className={`tab ${tab === 'book' ? 'tab--on' : ''}`}
            onClick={() => setTab('book')}
            aria-current={tab === 'book' ? 'page' : undefined}
          >
            Book appointment
          </button>
          <button
            type="button"
            className={`tab ${tab === 'bookings' ? 'tab--on' : ''}`}
            onClick={() => setTab('bookings')}
            aria-current={tab === 'bookings' ? 'page' : undefined}
          >
            My bookings
            {confirmedCount > 0 && <span className="tab__badge">{confirmedCount}</span>}
          </button>
        </nav>
      </header>

      <main className="layout">
        {tab === 'book' ? (
          <>
            <section className="panel" aria-label="Appointment booking form">
              {receipt ? (
                <SuccessPanel
                  booking={receipt}
                  onBookAnother={startAnother}
                  onViewBookings={() => setTab('bookings')}
                />
              ) : (
                <>
                  <Stepper
                    step={step}
                    errors={false}
                    completed={completed}
                    onJump={(index) => {
                      if (index < step) {
                        setStep(index);
                        setAttempted(false);
                      }
                    }}
                  />
                  <form className="form" onSubmit={handleSubmit} noValidate>
                    {attempted && <ErrorSummary step={step} errors={errors} />}

                    {step === 0 && (
                      <PatientStep
                        form={form}
                        showError={showError}
                        setField={setField}
                        onBlur={markTouched}
                      />
                    )}
                    {step === 1 && (
                      <AppointmentStep
                        form={form}
                        showError={showError}
                        setField={setField}
                        onBlur={markTouched}
                        today={today}
                        bookedByUser={bookedByUser}
                      />
                    )}
                    {step === 2 && (
                      <ReviewStep
                        form={form}
                        showError={showError}
                        setField={setField}
                        onBlur={markTouched}
                        onEdit={(index) => {
                          setStep(index);
                          setAttempted(false);
                          scrollTop();
                        }}
                      />
                    )}

                    <div className="form__foot">
                      <div>
                        {step > 0 ? (
                          <button type="button" className="btn btn--ghost" onClick={goBack}>
                            ← Back
                          </button>
                        ) : (
                          <button type="button" className="btn btn--ghost" onClick={resetForm}>
                            Reset form
                          </button>
                        )}
                      </div>
                      <div className="form__foot-right">
                        <span className={`form__status ${stepValid ? 'is-ok' : 'is-warn'}`}>
                          {stepValid
                            ? '✓ This step is complete'
                            : '• Some details still need attention'}
                        </span>
                        <button type="submit" className="btn btn--primary">
                          {step < 2 ? 'Continue →' : 'Confirm appointment'}
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </section>

            {!receipt && <SummaryCard form={form} step={step} />}
          </>
        ) : (
          <section className="panel panel--wide">
            <BookingsPanel
              bookings={bookings}
              onCancel={cancelBooking}
              onBookAnother={startAnother}
            />
          </section>
        )}
      </main>

      <footer className="foot">
        <p>
          Demo application built with React (components, state, controlled inputs and client-side
          validation). No data leaves your browser.
        </p>
      </footer>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
