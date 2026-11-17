/** Reusable form primitives: label + control + hint + error message. */

export function Field({ id, label, error, hint, required, counter, children, className = '' }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && (
            <span className="field__req" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {typeof children === 'function' ? children({ describedBy }) : children}
      <div className="field__meta">
        {error ? (
          <p className="field__error" id={`${id}-error`} role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        ) : hint ? (
          <p className="field__hint" id={`${id}-hint`}>
            {hint}
          </p>
        ) : (
          <span />
        )}
        {counter && (
          <span className={`field__counter ${counter.warn ? 'is-warn' : ''}`} aria-live="polite">
            {counter.text}
          </span>
        )}
      </div>
    </div>
  );
}

export function TextField({ id, label, error, hint, required, value, onChange, onBlur, counter, prefix, ...rest }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required} counter={counter}>
      {({ describedBy }) => (
        <div className={`control ${prefix ? 'control--with-prefix' : ''}`}>
          {prefix && (
            <span className="control__prefix" aria-hidden="true">
              {prefix}
            </span>
          )}
          <input
            id={id}
            name={id}
            className="control__input"
            value={value}
            onChange={(event) => onChange(event.target.value, event)}
            onBlur={() => onBlur?.(id)}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            aria-required={required}
            {...rest}
          />
        </div>
      )}
    </Field>
  );
}

export function TextAreaField({ id, label, error, hint, required, value, onChange, onBlur, counter, ...rest }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required} counter={counter}>
      {({ describedBy }) => (
        <textarea
          id={id}
          name={id}
          className="control__input control__input--area"
          value={value}
          onChange={(event) => onChange(event.target.value, event)}
          onBlur={() => onBlur?.(id)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          aria-required={required}
          {...rest}
        />
      )}
    </Field>
  );
}

export function SelectField({ id, label, error, hint, required, value, onChange, onBlur, options, placeholder }) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      {({ describedBy }) => (
        <div className="control control--select">
          <select
            id={id}
            name={id}
            className="control__input"
            value={value}
            onChange={(event) => onChange(event.target.value, event)}
            onBlur={() => onBlur?.(id)}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            aria-required={required}
          >
            <option value="">{placeholder || 'Select…'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="control__chevron" aria-hidden="true">
            ▾
          </span>
        </div>
      )}
    </Field>
  );
}
