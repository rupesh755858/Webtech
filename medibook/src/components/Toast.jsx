import { useEffect } from 'react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className={`toast toast--${toast.type}`} role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">
        {toast.type === 'error' ? '⚠' : '✓'}
      </span>
      <span className="toast__text">{toast.text}</span>
      <button type="button" className="toast__close" onClick={onDismiss} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}
