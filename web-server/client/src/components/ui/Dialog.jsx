import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './Button';
import './Dialog.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* Modal dialog: traps focus, closes on Escape or scrim click, restores
   focus to whatever opened it, and locks the page behind it (spec §7).
   Below 600px it arrives as a bottom sheet. */

export default function Dialog({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panelRef = useRef(null);
  const openerRef = useRef(null);
  const titleId = useRef(`bw-dialog-${Math.random().toString(36).slice(2, 9)}`).current;

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusable = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null
      );

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    openerRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstFocusable = panelRef.current?.querySelector(FOCUSABLE);
    (firstFocusable || panelRef.current)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      if (openerRef.current instanceof HTMLElement) {
        openerRef.current.focus();
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="bw-dialog-scrim" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panelRef}
        className={`bw-dialog bw-dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <header className="bw-dialog__header">
          <div className="bw-dialog__heading">
            <h2 className="bw-dialog__title" id={titleId}>
              {title}
            </h2>
            {description && <p className="bw-dialog__description">{description}</p>}
          </div>
          <IconButton icon="close" label="סגירה" onClick={onClose} />
        </header>

        <div className="bw-dialog__body">{children}</div>

        {footer && <footer className="bw-dialog__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
