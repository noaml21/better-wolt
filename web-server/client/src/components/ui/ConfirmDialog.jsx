import Button from './Button';
import Dialog from './Dialog';

/* Replaces window.confirm: styled, focus-trapped, and it names the thing
   being removed instead of asking "are you sure?". */

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'מחיקה',
  cancelLabel = 'ביטול',
  loading = false,
}) {
  return (
    /* Not closable while the action runs: its outcome is reported from
       here (or by leaving the page), not into a dialog that is gone. */
    <Dialog open={open} onClose={loading ? () => {} : onClose} title={title} size="sm">
      <p style={{ color: 'var(--bw-ink-muted)' }}>{description}</p>

      <div className="bw-actions" style={{ marginBlockStart: 'var(--bw-space-6)' }}>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
      </div>
    </Dialog>
  );
}
