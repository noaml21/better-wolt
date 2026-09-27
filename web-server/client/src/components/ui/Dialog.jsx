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

      /* Focus can rest on something that is not in the tab order — the
         panel itself, or a region that took focus when the control in it
         went away. The browser would tab from there to the page behind. */
      if (!focusable.includes(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
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

    /* A form opens on its first field. Anything else opens on the first
       control, which is the close button — for a confirmation that is
       the safe choice, since its first action is the destructive one. */
    const firstField = panelRef.current?.querySelector(
      '.bw-dialog__body input:not([disabled]), .bw-dialog__body textarea:not([disabled]), .bw-dialog__body select:not([disabled])'
    );
    const firstFocusable = panelRef.current?.querySelector(FOCUSABLE);
    (firstField || firstFocusable || panelRef.current)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      /* The opener can be gone by now — the delete button of the dish
         that was just deleted. Focus left on a detached node falls to
         <body>, so hand it to <main> instead, without scrolling there. */
      const opener = openerRef.current;

      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      } else {
        document.getElementById('main')?.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="bw-dialog-scrim"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          /* The press would otherwise move focus to <body> after the
             dialog has already handed it back to its opener. */
          event.preventDefault();
          onClose();
        }
      }}
    >
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
