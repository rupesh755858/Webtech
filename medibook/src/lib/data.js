/** Static clinic data + deterministic "already booked" slot logic. */

export const DEPARTMENTS = [
  { id: 'general', name: 'General Medicine', icon: '🩺', fee: 500, blurb: 'Fever, infections, routine check-ups' },
  { id: 'cardio', name: 'Cardiology', icon: '❤️', fee: 900, blurb: 'Heart health, BP, cholesterol' },
  { id: 'derma', name: 'Dermatology', icon: '✨', fee: 700, blurb: 'Skin, hair and nail concerns' },
  { id: 'ortho', name: 'Orthopaedics', icon: '🦴', fee: 800, blurb: 'Bones, joints, back and knee pain' },
  { id: 'pedia', name: 'Paediatrics', icon: '🧒', fee: 650, blurb: 'Children up to 14 years' },
];

export const DOCTORS = [
  { id: 'd-ananya', name: 'Dr. Ananya Iyer', dept: 'general', exp: 12, languages: 'English, हिन्दी, தமிழ்' },
  { id: 'd-rohit', name: 'Dr. Rohit Deshmukh', dept: 'general', exp: 8, languages: 'English, मराठी, हिन्दी' },
  { id: 'd-meera', name: 'Dr. Meera Krishnan', dept: 'cardio', exp: 16, languages: 'English, മലയാളം' },
  { id: 'd-sanjay', name: 'Dr. Sanjay Gupta', dept: 'cardio', exp: 21, languages: 'English, हिन्दी' },
  { id: 'd-fatima', name: 'Dr. Fatima Sheikh', dept: 'derma', exp: 9, languages: 'English, हिन्दी, اردو' },
  { id: 'd-vikram', name: 'Dr. Vikram Rao', dept: 'ortho', exp: 14, languages: 'English, ಕನ್ನಡ, हिन्दी' },
  { id: 'd-priya', name: 'Dr. Priya Nair', dept: 'pedia', exp: 11, languages: 'English, മലയാളം, हिन्दी' },
];

/** 30-minute slots; the 13:00–14:00 lunch break is excluded. */
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export const CONVENIENCE_FEE = 49;

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Deterministic pseudo-booking so the same doctor + date always shows the same
 * busy slots (this is demo data — a real app would fetch availability).
 */
export function isSlotBooked(doctorId, isoDate, slot) {
  if (!doctorId || !isoDate || !slot) return false;
  return hash(`${doctorId}|${isoDate}|${slot}`) % 4 === 0;
}

/** A slot on today's date that has already passed is not selectable. */
export function isSlotInPast(isoDate, slot, now = new Date()) {
  if (!isoDate) return false;
  const [y, m, d] = isoDate.split('-').map(Number);
  const [hh, mm] = slot.split(':').map(Number);
  const slotTime = new Date(y, m - 1, d, hh, mm);
  return slotTime.getTime() <= now.getTime();
}

export function doctorsFor(departmentId) {
  return DOCTORS.filter((doc) => doc.dept === departmentId);
}

export function departmentById(id) {
  return DEPARTMENTS.find((dep) => dep.id === id) || null;
}

export function doctorById(id) {
  return DOCTORS.find((doc) => doc.id === id) || null;
}

export function slotTo12Hour(slot) {
  const [hh, mm] = slot.split(':').map(Number);
  const suffix = hh >= 12 ? 'PM' : 'AM';
  const hour = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour}:${String(mm).padStart(2, '0')} ${suffix}`;
}
