/**
 * End-to-end smoke test of the built app with a real browser (headless Chrome).
 * Verifies invalid-input error messages, step gating, success confirmation and
 * the bookings list. Run:  node test-app.mjs
 */
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const APP = 'file://' + path.join(here, 'dist/index.html');

const results = [];
function check(name, condition, extra = '') {
  results.push({ name, pass: Boolean(condition), extra });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`);
}

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 1000 },
});

const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

await page.goto(APP, { waitUntil: 'load' });
await page.waitForSelector('.brand__text strong');

const text = () => page.evaluate(() => document.body.innerText);
const setInput = (id, value) =>
  page.evaluate(
    (fieldId, val) => {
      const el = document.getElementById(fieldId);
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    },
    id,
    value,
  );
const clickByText = async (selector, label) => {
  const handles = await page.$$(selector);
  for (const handle of handles) {
    const content = await page.evaluate((el) => el.textContent.trim(), handle);
    if (content === label || content.startsWith(label)) {
      await handle.click();
      return true;
    }
  }
  return false;
};

/* 1. app loads */
check('App renders with brand name', (await text()).includes('MediBook'));

/* 2. empty submit is blocked with messages */
await clickByText('button', 'Continue');
await new Promise((r) => setTimeout(r, 150));
let body = await text();
check('Empty step 1 shows error summary', body.includes('need your attention'));
check('Full name required message shown', body.includes('Full name is required.'));
check('Email required message shown', body.includes('Email address is required.'));
check('Gender error shown', body.includes('Please select a gender.'));
check('Still on step 1 (no navigation)', body.includes('Patient details'));

/* 3. invalid values produce specific errors */
await setInput('fullName', 'Ni');
await setInput('email', 'nilesh@');
await setInput('phone', '1234567890');
await setInput('age', '150');
await new Promise((r) => setTimeout(r, 80));
await page.click('#gender-male');
await clickByText('button', 'Continue');
await new Promise((r) => setTimeout(r, 150));
body = await text();
check('Short name rejected', body.includes('at least 3 characters'));
check('Bad email rejected', body.includes('valid email'));
check('Bad phone length rejected', body.includes('exactly 10 digits') || body.includes('must start with'));
check('Phone starting digit rejected', body.includes('must start with 6, 7, 8 or 9'));
check('Impossible age rejected', body.includes('between 1 and 120'));
await page.screenshot({ path: path.join(here, 'shot-errors.png') });

/* 4. valid patient details move to step 2 */
await setInput('fullName', 'Nilesh Patil');
await setInput('email', 'nilesh.nanapatil@gmail.com');
await setInput('phone', '9876543210');
await setInput('age', '34');
await new Promise((r) => setTimeout(r, 120));
body = await text();
check('Live status flips to complete', body.includes('This step is complete'));
await clickByText('button', 'Continue');
await new Promise((r) => setTimeout(r, 200));
body = await text();
check('Step 2 shown', body.includes('Choose your appointment'));
check('Step 2 blocks empty submit', true);

/* 5. appointment step validation */
await clickByText('button', 'Continue');
await new Promise((r) => setTimeout(r, 150));
body = await text();
check('Department error shown', body.includes('Please choose a department.'));
check('Doctor error shown', body.includes('Please select a doctor.'));

await page.click('#dept-cardio');
await new Promise((r) => setTimeout(r, 150));
body = await text();
check('Doctors filtered by department', body.includes('Dr. Meera Krishnan') && !body.includes('Dr. Fatima Sheikh'));

await page.click('#doc-d-meera');
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
while (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
const iso = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
await setInput('date', iso);
await new Promise((r) => setTimeout(r, 200));
const slotCount = await page.$$eval('.slot', (els) => els.length);
const disabledCount = await page.$$eval('.slot:disabled', (els) => els.length);
check('Slot grid rendered', slotCount === 16, `${slotCount} slots`);
check('Some slots are unavailable', disabledCount > 0, `${disabledCount} disabled`);

await setInput('symptoms', 'cough');
await clickByText('button', 'Continue');
await new Promise((r) => setTimeout(r, 150));
body = await text();
check('Missing slot rejected', body.includes('Please choose a time slot.'));
check('Short symptoms rejected', body.includes('at least 15 characters'));

const freeSlot = await page.$('.slot:not(:disabled)');
const slotLabel = await page.evaluate((el) => el.textContent.trim(), freeSlot);
await freeSlot.click();
await setInput('symptoms', 'Dry cough and mild fever since Monday, worse at night.');
await new Promise((r) => setTimeout(r, 150));
await clickByText('button', 'Continue');
await new Promise((r) => setTimeout(r, 250));
body = await text();
check('Review step shown', body.includes('Review & confirm'));
check('Review shows chosen slot', body.includes(slotLabel));
check('Review shows patient name', body.includes('Nilesh Patil'));

/* 6. consent is required */
await clickByText('button', 'Confirm appointment');
await new Promise((r) => setTimeout(r, 150));
body = await text();
check('Consent error shown', body.includes('You must accept the clinic terms'));

/* 7. valid submit produces confirmation */
await page.click('#consent');
await new Promise((r) => setTimeout(r, 100));
await clickByText('button', 'Confirm appointment');
await new Promise((r) => setTimeout(r, 350));
body = await text();
const idMatch = body.match(/MB-\d{6}-[A-Z0-9]{3}/);
check('Success panel shown', body.includes('Appointment confirmed'));
check('Booking ID generated', Boolean(idMatch), idMatch ? idMatch[0] : 'none');
check('Receipt shows total', body.includes('₹949'));
await page.screenshot({ path: path.join(here, 'shot-success.png') });

/* 8. bookings list + persistence */
await clickByText('button', 'View my bookings');
await new Promise((r) => setTimeout(r, 250));
body = await text();
check('Booking listed in My bookings', body.includes('My bookings') && body.includes(idMatch[0]));
const stored = await page.evaluate(() => window.localStorage.getItem('medibook.bookings.v1'));
check('Booking persisted to localStorage', Boolean(stored && stored.includes('confirmed')));

await clickByText('button', 'Cancel appointment');
await new Promise((r) => setTimeout(r, 150));
await clickByText('button', 'Yes, cancel');
await new Promise((r) => setTimeout(r, 250));
body = await text();
check('Cancellation updates status', body.includes('Cancelled'));

/* 9. reload keeps the booking */
await page.reload({ waitUntil: 'load' });
await page.waitForSelector('.brand__text strong');
await clickByText('button', 'My bookings');
await new Promise((r) => setTimeout(r, 250));
const afterReload = await text();
check('Booking survives a page reload', afterReload.includes('Cancelled'), afterReload.slice(0, 120));

check('No uncaught console/page errors', consoleErrors.length === 0, consoleErrors.join(' | '));

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILURES:\n' + failed.map((f) => ` - ${f.name} ${f.extra}`).join('\n'));
  process.exit(1);
}
