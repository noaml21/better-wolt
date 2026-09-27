import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import './Toast.css';

/* Toasts are the app's feedback channel — they replace every alert().
   The region is a live region, so a message is announced once and the
   page keeps focus where it was. */

const ToastContext = createContext(null);
const DEFAULT_DURATION = 3200;
/* A toast leaves the way it came (down, fading) before it is removed.
   Matches .bw-toast--leaving in Toast.css. */
const LEAVE_MS = 150;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, LEAVE_MS);
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const id = ++counter.current;
      const tone = options.tone || 'success';

      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), options.duration || DEFAULT_DURATION);

      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="bw-toasts" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`bw-toast bw-toast--${toast.tone} ${toast.leaving ? 'bw-toast--leaving' : ''}`}
            >
              <Icon name={toast.tone === 'error' ? 'alert' : 'check'} size={18} />
              <span>{toast.message}</span>
              <button
                type="button"
                className="bw-toast__close"
                onClick={() => dismiss(toast.id)}
                aria-label="סגירת ההודעה"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }

  return context;
}
