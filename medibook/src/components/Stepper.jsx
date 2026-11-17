const STEPS = [
  { title: 'Patient details', sub: 'Who is visiting' },
  { title: 'Appointment', sub: 'Doctor, date & slot' },
  { title: 'Review & confirm', sub: 'Check and submit' },
];

export default function Stepper({ step, errors, completed, onJump }) {
  return (
    <ol className="stepper" aria-label="Booking progress">
      {STEPS.map((item, index) => {
        const state = index === step ? 'current' : index < step || completed[index] ? 'done' : 'todo';
        return (
          <li key={item.title} className={`stepper__item stepper__item--${state}`}>
            <button
              type="button"
              className="stepper__button"
              onClick={() => onJump(index)}
              disabled={index >= step}
              aria-current={index === step ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${item.title}${errors ? ' (has errors)' : ''}`}
            >
              <span className="stepper__dot" aria-hidden="true">
                {state === 'done' ? '✓' : index + 1}
              </span>
              <span className="stepper__text">
                <span className="stepper__title">{item.title}</span>
                <span className="stepper__sub">{item.sub}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
