import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { createStyles } from '../theme';
import { createProduct, updateProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Field, InlineMessage, Screen, ScreenHeader, useToast } from '../ui';

/* Add or edit a dish. Price is sent as a number: the API answers
   "Price must be a non-negative number" for anything else (BF-4). */

export default function ProductFormScreen({ navigation, route }) {
  const styles = useStyles();
  const { token } = useAuth();
  const { showToast } = useToast();

  const restaurantId = route.params?.restaurantId;
  const existing = route.params?.product || null;
  const isEdit = Boolean(existing?.id);

  const [values, setValues] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    price: existing?.price != null ? String(existing.price) : '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (name) => (value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const submit = async () => {
    const price = Number(values.price);
    const next = {};

    if (!values.name.trim()) next.name = 'צריך שם למנה';
    if (!values.price.trim() || !Number.isFinite(price) || price < 0) {
      next.price = 'המחיר צריך להיות מספר, 0 או יותר';
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      price,
    };

    try {
      if (isEdit) {
        await updateProduct(token, restaurantId, existing.id, payload);
        showToast('המנה עודכנה');
      } else {
        await createProduct(token, restaurantId, payload);
        showToast('המנה נוספה לתפריט');
      }

      // The back button stays live while saving. If it was used, this screen
      // is already gone and a second goBack would leave the one under it too.
      if (navigation.isFocused()) {
        navigation.goBack();
      }
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title={isEdit ? 'עריכת מנה' : 'הוספת מנה לתפריט'}
        onBack={navigation.goBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {error ? <InlineMessage>{error}</InlineMessage> : null}

          <Field
            label="שם המנה"
            value={values.name}
            onChangeText={change('name')}
            error={errors.name}
            placeholder="לדוגמה: המבורגר קלאסי"
            required
          />

          <Field
            label="תיאור"
            value={values.description}
            onChangeText={change('description')}
            hint="מה יש במנה, בשורה אחת."
            placeholder="220 גרם אנטריקוט, חסה, עגבנייה, רוטב הבית"
            multiline
          />

          <Field
            label="מחיר בשקלים"
            value={values.price}
            onChangeText={change('price')}
            error={errors.price}
            keyboardType="decimal-pad"
            placeholder="0"
            required
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button size="lg" fullWidth loading={saving} onPress={submit}>
          {isEdit ? 'שמירת השינויים' : 'הוספת המנה'}
        </Button>
      </View>
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space }) => ({
  flex: { flex: 1 },
  content: { padding: space[4], gap: space[4], paddingBottom: space[7] },
  footer: {
    padding: space[4],
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
}));
