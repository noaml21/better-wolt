import { useEffect, useState } from 'react';
import { createRestaurant, updateRestaurant } from '../../services/api';
import { Button, Dialog, Field, InlineMessage, useToast } from '../ui';
import ImagePreview from './ImagePreview';

/* Create or edit a restaurant. The server owns validation and the error
   strings it returns are shown verbatim (ARCHITECTURE §4.3). */

const EMPTY = { name: '', phone: '', address: '', image: '' };

export default function RestaurantFormDialog({ open, onClose, onSaved, restaurant }) {
  const isEdit = Boolean(restaurant);
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (open) {
      setValues(
        restaurant
          ? {
              name: restaurant.name || '',
              phone: restaurant.phone || '',
              address: restaurant.address || '',
              image: restaurant.image || '',
            }
          : EMPTY
      );
      setError('');
    }
  }, [open, restaurant]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.name.trim()) {
      setError('צריך שם למסעדה כדי להמשיך.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        await updateRestaurant(restaurant.id, values);
        showToast('פרטי המסעדה עודכנו');
      } else {
        await createRestaurant(values);
        showToast('המסעדה נפתחה');
      }

      await onSaved?.();
      onClose();
    } catch (requestError) {
      /* What this form edits is gone (removed in another tab). Retrying can
         only fail again: show the page as it is now and say why. */
      if (requestError.status === 404 && isEdit) {
        await onSaved?.();
        onClose();
        showToast('המסעדה הזו כבר לא קיימת.', { tone: 'error' });
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
      title={isEdit ? 'עריכת פרטי המסעדה' : 'פתיחת מסעדה חדשה'}
      description={
        isEdit ? 'השינויים יופיעו מיד בעמוד המסעדה.' : 'אחרי הפתיחה אפשר להוסיף מנות לתפריט.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button type="submit" form="bw-restaurant-form" loading={saving}>
            {isEdit ? 'שמירת השינויים' : 'פתיחת המסעדה'}
          </Button>
        </>
      }
    >
      <form id="bw-restaurant-form" className="bw-stack" onSubmit={handleSubmit} noValidate>
        {error && <InlineMessage>{error}</InlineMessage>}

        <Field
          label="שם המסעדה"
          name="name"
          value={values.name}
          onChange={handleChange}
          required
          placeholder="לדוגמה: פסטה פרסקה"
        />
        <Field
          label="כתובת"
          name="address"
          value={values.address}
          onChange={handleChange}
          placeholder="רחוב, מספר, עיר"
        />
        <Field
          label="טלפון"
          name="phone"
          type="tel"
          value={values.phone}
          onChange={handleChange}
          placeholder="03-0000000"
          dir="ltr"
          inputMode="tel"
        />
        <Field
          label="קישור לתמונה"
          name="image"
          type="url"
          value={values.image}
          onChange={handleChange}
          hint="תמונה רחבה של המסעדה או של מנה מובילה."
          placeholder="https://"
          dir="ltr"
        />
        <ImagePreview
          src={values.image.trim()}
          restaurant={{ id: restaurant?.id || 'new', name: values.name || restaurant?.name || '' }}
        />
      </form>
    </Dialog>
  );
}
