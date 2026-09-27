import { useEffect, useState } from 'react';
import { addProduct, updateProduct } from '../../services/api';
import { Button, Dialog, Field, InlineMessage, useToast } from '../ui';

/* Add or edit a dish. Price is sent as a number because the API rejects
   anything else with "Price must be a non-negative number" (BF-4). */

const EMPTY = { name: '', description: '', price: '' };

export default function ProductFormDialog({ open, onClose, onSaved, restaurantId, product }) {
  const isEdit = Boolean(product);
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      setValues(
        product
          ? {
              name: product.name || '',
              description: product.description || '',
              price: String(product.price ?? ''),
            }
          : EMPTY
      );
      setError('');
      setFieldErrors({});
    }
  }, [open, product]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const price = Number(values.price);
    const nextErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = 'צריך שם למנה.';
    }

    // Number('') is 0, so an empty price has to be caught before the
    // conversion or a dish saves as free. The same field is "" when the
    // browser cannot parse what was typed into a number input.
    if (!values.price.trim() || !Number.isFinite(price) || price < 0) {
      nextErrors.price = 'המחיר צריך להיות מספר, 0 או יותר.';
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = { name: values.name.trim(), description: values.description.trim(), price };

      if (isEdit) {
        await updateProduct(restaurantId, product.id, payload);
        showToast('המנה עודכנה');
      } else {
        await addProduct(restaurantId, payload);
        showToast('המנה נוספה לתפריט');
      }

      await onSaved?.();
      onClose();
    } catch (requestError) {
      /* What this form edits is gone — the dish, or its whole restaurant,
         removed in another tab. Retrying can only fail again: show the page
         as it is now and say why. */
      if (requestError.status === 404) {
        await onSaved?.();
        onClose();
        showToast(
          requestError.message === 'Restaurant not found' ? 'המסעדה הזו כבר לא קיימת.' : 'המנה הזו כבר לא בתפריט.',
          { tone: 'error' }
        );
        return;
      }

      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  /* Cancel is disabled while saving, and so are Escape, the scrim and
     the close button: a dialog closed mid-save has nowhere to show the
     error if the save then fails. */
  const close = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={isEdit ? 'עריכת מנה' : 'הוספת מנה לתפריט'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button type="submit" form="bw-product-form" loading={saving}>
            {isEdit ? 'שמירת השינויים' : 'הוספת המנה'}
          </Button>
        </>
      }
    >
      <form id="bw-product-form" className="bw-stack" onSubmit={handleSubmit} noValidate>
        {error && <InlineMessage>{error}</InlineMessage>}

        <Field
          label="שם המנה"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={fieldErrors.name}
          required
          placeholder="לדוגמה: המבורגר קלאסי"
        />
        <Field
          as="textarea"
          label="תיאור"
          name="description"
          value={values.description}
          onChange={handleChange}
          hint="מה יש במנה, בשורה אחת."
          placeholder="220 גרם אנטריקוט, חסה, עגבנייה, רוטב הבית"
        />
        <Field
          label="מחיר בשקלים"
          name="price"
          type="number"
          min="0"
          step="0.5"
          inputMode="decimal"
          value={values.price}
          onChange={handleChange}
          error={fieldErrors.price}
          required
        />
      </form>
    </Dialog>
  );
}
