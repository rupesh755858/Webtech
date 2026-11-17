# MediBook — Doctor Appointment Booking (ReactJS)

An individual ReactJS web application that demonstrates **client-side form validation** and
**interactive functionality**, built for the assignment *"Design, develop and deploy a web
application using ReactJS to demonstrate client-side validation and interactive functionality."*

**Chosen real-world application:** booking an appointment at a neighbourhood medical clinic —
a task where every field has a real validation rule (a mobile number must be 10 digits, a date
cannot be in the past, a slot may already be taken) and where the user needs constant feedback.

---

## 1. What the app does

A three-step booking wizard:

| Step | Collects | Validation demonstrated |
| --- | --- | --- |
| 1. Patient details | Full name, email, mobile, age, gender | required, min/max length, letters-only pattern, email pattern, exactly 10 digits starting 6–9, numeric age 1–120, one-of gender |
| 2. Appointment | Department, doctor, date, time slot, symptoms | dependent dropdowns (doctor list depends on department), date not in the past, not more than 30 days ahead, clinic closed on Sundays, slot must be chosen and not already booked, symptoms 15–200 characters |
| 3. Review & confirm | Consent checkbox | terms must be accepted before submission |

On success the app shows a **confirmation panel with a generated booking ID**, a printable
receipt, and the booking is added to **My bookings** where it can be cancelled.

### Interactive features (beyond a plain form)

- **Controlled inputs** — every field is a controlled component, so state is always the single
  source of truth.
- **Live validation** — errors appear when a field is blurred or when *Continue* is pressed, and
  disappear as soon as the value becomes valid (no "re-submit to re-check").
- **Step gating with a live status line** — "✓ This step is complete" / "• Some details still need
  attention" updates on every keystroke, and *Continue* refuses to advance while a step is invalid.
- **Accessible error summary** — after a failed submit an alert lists every error on that step with
  links that jump to the field; the first invalid field receives focus automatically.
- **Error messages written for humans** — e.g. *"Mobile number must start with 6, 7, 8 or 9."*
- **Dependent fields** — changing the department clears the doctor and slot; changing the doctor or
  date clears the slot.
- **Slot picker** — 16 half-hour slots; already-booked and already-passed slots are disabled with a
  legend, the selected slot is highlighted, and the appointment step shows a live "selected slot" card.
- **Live booking summary sidebar** — patient, doctor, date, time and a fee breakdown update as you type.
- **Character counter** on the symptoms field that warns while the text is too short.
- **Toast notifications** for validation failures, cancellations and resets.
- **My bookings** — list of bookings, status pills, inline "cancel this appointment?" confirmation,
  and persistence in `localStorage` so bookings survive a page reload.
- **Print receipt** — a dedicated print stylesheet prints only the receipt.
- **Responsive** layout (single column under 980 px / 640 px) and `prefers-reduced-motion` support.

---

## 2. Tech stack

- **React 18** (function components + hooks: `useState`, `useMemo`, `useCallback`, `useEffect`)
- **Vite 5** for the dev server and production build
- `vite-plugin-singlefile` so the production build is **one self-contained `index.html`** (no CDN,
  no server needed — you can email it or open it offline)
- Plain CSS (custom properties, no UI framework) — no runtime dependencies beyond React
- **No backend.** Validation is entirely client-side; bookings are stored in `localStorage`.

---

## 3. Run it

```bash
npm install       # install dependencies
npm run dev       # http://localhost:5173  (development)
npm run build     # production build -> dist/index.html (single file)
npm run preview   # serve the production build at http://localhost:4173
```

Tests:

```bash
npm test              # 21 unit tests for the validation rules (node --test, no extra deps)
node test-app.mjs     # 33 end-to-end browser checks with headless Chrome (puppeteer-core)
```

`test-app.mjs` needs a local Chrome/Chromium; edit `executablePath` at the top of the file if
your binary lives elsewhere. It checks the invalid-input messages, step gating, slot filtering,
consent requirement, booking ID generation, cancellation and `localStorage` persistence.

---

## 4. Deploy it

The build is a single static HTML file, so any static host works.

**A. Fastest — drag and drop (no account needed for a temporary URL)**

1. `npm run build`
2. Open <https://app.netlify.com/drop> and drag the `dist` folder onto the page.
3. Netlify returns a live URL such as `https://medibook-xyz.netlify.app`.

**B. GitHub Pages (recommended for a college submission, gives a permanent link)**

```bash
git init
git add .
git commit -m "MediBook: React client-side validation demo"
git branch -M main
git remote add origin https://github.com/<your-username>/medibook-react.git
git push -u origin main
```

Then either:

- *Settings → Pages → Source: Deploy from a branch → `main` / `/docs`*, after copying the build to a
  `docs` folder:

  ```bash
  npm run build && mkdir -p docs && cp dist/index.html docs/index.html
  ```

- or use the `gh-pages` package:

  ```bash
  npm i -D gh-pages
  npx gh-pages -d dist
  ```

  and set *Settings → Pages → Branch: `gh-pages`*.

The Vite config already uses `base: './'`, so the app works from a project sub-path
(`https://<user>.github.io/medibook-react/`) without any change.

**C. Vercel / Cloudflare Pages**

- Framework preset: **Vite**; build command `npm run build`; output directory `dist`.

**D. Offline / email submission**

Just open `dist/index.html` in any modern browser (or submit that single file). Everything,
including the CSS and JavaScript, is inlined.

---

## 5. Test cases and results

All cases below were executed automatically (`npm test` for the rules, `node test-app.mjs` for the
UI). Current status: **21/21 unit tests pass, 33/33 browser checks pass.**

### Patient details

| # | Input | Expected | Actual |
| --- | --- | --- | --- |
| 1 | Empty name | "Full name is required." | Pass |
| 2 | Name `Ni` | "Name must be at least 3 characters." | Pass |
| 3 | Name `Nilesh123` | "Name may contain letters, spaces, apostrophes, dots and hyphens only." | Pass |
| 4 | Name `Nilesh Patil` | Accepted | Pass |
| 5 | Email `nilesh@` | "Enter a valid email, for example name@example.com." | Pass |
| 6 | Email `nilesh@gmail..com` | "Email address cannot contain two dots in a row." | Pass |
| 7 | Email `nilesh.nanapatil@gmail.com` | Accepted | Pass |
| 8 | Mobile `12345` | "Mobile number must be exactly 10 digits." | Pass |
| 9 | Mobile `1234567890` | "Mobile number must start with 6, 7, 8 or 9." | Pass |
| 10 | Mobile `9876543210` | Accepted (non-digits are filtered while typing) | Pass |
| 11 | Age `0` / `121` | "Age must be between 1 and 120 years." | Pass |
| 12 | Age `34` | Accepted | Pass |
| 13 | No gender chosen | "Please select a gender." | Pass |

### Appointment

| # | Input | Expected | Actual |
| --- | --- | --- | --- |
| 14 | No department | "Please choose a department." | Pass |
| 15 | Department chosen | Doctor list filtered to that department only | Pass |
| 16 | No doctor | "Please select a doctor." | Pass |
| 17 | Date = yesterday | "Appointment date cannot be in the past." | Pass |
| 18 | Date = a Sunday | "The clinic is closed on Sundays. Please pick another day." | Pass |
| 19 | Date = today + 45 days | "Appointments can be booked up to 30 days in advance." | Pass |
| 20 | Date `18/11/2026` typed as text | "Enter the date as dd/mm/yyyy." | Pass |
| 21 | No slot chosen | "Please choose a time slot." | Pass |
| 22 | Booked / passed slot | Button disabled, cannot be selected | Pass |
| 23 | Symptoms `cough` | "Please add at least 15 characters (5/15)." | Pass |
| 24 | Symptoms 201+ characters | "Please keep it within 200 characters." (input capped at 200) | Pass |

### Confirmation

| # | Input | Expected | Actual |
| --- | --- | --- | --- |
| 25 | Consent unchecked | "You must accept the clinic terms to confirm the booking." | Pass |
| 26 | Consent checked, all valid | Confirmation panel, booking ID `MB-YYMMDD-XXX`, receipt with total ₹949 | Pass |
| 27 | After booking | Booking appears in *My bookings* and in `localStorage` | Pass |
| 28 | Cancel appointment | Status changes to *Cancelled*; survives reload | Pass |
| 29 | Console | No uncaught errors | Pass |

---

## 6. Project structure

```
medibook/
├── index.html                     # Vite entry
├── vite.config.js                 # single-file production build, relative base
├── package.json
├── src/
│   ├── main.jsx                   # React root
│   ├── App.jsx                    # state, step machine, submit handling, tabs
│   ├── styles.css                 # design tokens, layout, print styles
│   ├── components/
│   │   ├── Field.jsx              # TextField / TextAreaField / SelectField (+ label, hint, error)
│   │   ├── Stepper.jsx            # 3-step progress indicator
│   │   ├── PatientStep.jsx        # step 1
│   │   ├── AppointmentStep.jsx    # step 2: department/doctor cards, date, slot grid, symptoms
│   │   ├── ReviewStep.jsx         # step 3: summary, fee breakdown, consent
│   │   ├── SummaryCard.jsx        # live sidebar summary
│   │   ├── ErrorSummary.jsx       # accessible error list after a failed submit
│   │   ├── SuccessPanel.jsx       # confirmation + printable receipt
│   │   ├── BookingsPanel.jsx      # My bookings, cancellation
│   │   └── Toast.jsx              # transient success/error notifications
│   └── lib/
│       ├── validation.js          # pure validation rules (unit-tested)
│       └── data.js                # departments, doctors, slots, slot availability
├── tests/validation.test.mjs      # 21 unit tests
├── test-app.mjs                   # 33 end-to-end browser checks
└── docs/                          # screenshots of the running app
```

### Design notes

- **Validation is pure and separate from the UI.** `src/lib/validation.js` holds functions that take
  a value and return either `null` or an error message. They have no React or DOM dependency, which
  is why they can be unit-tested directly in Node and reused by every component.
- **Errors are derived, never stored.** `App` keeps the form data, the touched fields and whether
  the user has attempted to continue; the error map is recomputed with `useMemo` on each render.
  That makes it impossible for an error message to go stale — fix a value and the message disappears
  on the same keystroke.
- **`noValidate` on the `<form>`** so the browser's native bubbles never pre-empt the app's own,
  styled and accessible messages.
- Demo data (doctor availability) is generated deterministically from the doctor + date + slot, so
  the same combination always shows the same busy slots.

---

## 7. Known limitations

- No backend: the "confirmation email" is not actually sent, and bookings live only in this browser's
  `localStorage` (clearing site data removes them).
- Slot availability is demo data, not a real clinic schedule.
- Patient details are not encrypted at rest; this is a classroom demo, not a production medical app.
