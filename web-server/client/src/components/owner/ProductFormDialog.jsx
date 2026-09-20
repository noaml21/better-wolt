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
    }
  }, [open, product]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const price = Number(values.price);

    if (!values.name.trim()) {
      setError('צריך שם למנה.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('המחיר צריך להיות מספר, 0 או יותר.');
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
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          required
        />
      </form>
    </Dialog>
  );
}
