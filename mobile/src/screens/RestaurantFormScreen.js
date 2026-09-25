import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { createStyles } from '../theme';
import { createRestaurant, updateRestaurant } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Button,
  Field,
  Icon,
  InlineMessage,
  Screen,
  ScreenHeader,
  useToast,
} from '../ui';

/* Open a restaurant, or edit one. The server owns validation and the
   strings it returns are shown verbatim (ARCHITECTURE §4.3).

   A picked photo is sent inline as a data URL. Only POST /api/users
   takes a large body; everything else parses at Express's 100 KB
   default, so an image that will not fit is refused here with a way out
   rather than by a 413 from the server. */

const MAX_INLINE_IMAGE = 90_000;

export default function RestaurantFormScreen({ navigation, route }) {
  const styles = useStyles();
  const { token } = useAuth();
  const { showToast } = useToast();

  const existing = route.params?.restaurant || null;
  const isEdit = Boolean(existing?.id);

  const [values, setValues] = useState({
    name: existing?.name || '',
    address: existing?.address || '',
    phone: existing?.phone || '',
    image: existing?.image || '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const change = (name) => (value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast('אין לנו גישה לגלריה. אפשר להדביק קישור לתמונה.', { tone: 'error' });

      return;
    }

    let base64;

    // The gallery and the file read are native calls that can fail; say so
    // rather than leave an unhandled rejection and a button that did nothing.
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.4,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch {
      setError('לא הצלחנו לפתוח את התמונה. אפשר לנסות תמונה אחרת, או להדביק קישור.');

      return;
    }

    if (base64.length > MAX_INLINE_IMAGE) {
      setError('התמונה הזו כבדה מדי לשמירה. בחרו תמונה קטנה יותר, או הדביקו קישור.');

      return;
    }

    setError('');
    change('image')(`data:image/jpeg;base64,${base64}`);
  };

  const submit = async () => {
    if (!values.name.trim()) {
      setErrors({ name: 'צריך שם למסעדה כדי להמשיך' });

      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      name: values.name.trim(),
      address: values.address.trim(),
      phone: values.phone.trim(),
      image: values.image.trim(),
    };

    try {
      if (isEdit) {
        await updateRestaurant(token, existing.id, payload);
        showToast('פרטי המסעדה עודכנו');
      } else {
        await createRestaurant(token, payload);
        showToast('המסעדה נפתחה');
      }

      // The back button stays live while saving. If it was used, this screen
      // is already gone and a second goBack would leave the one under it too.
      if (navigation.isFocused()) {
        navigation.goBack();
      }
    } catch (requestError) {
      /* What this form edits is gone (removed on another device). Retrying
         can only fail again; the screen underneath re-reads on focus. */
      if (requestError.status === 404 && isEdit) {
        showToast('המסעדה הזו כבר לא קיימת.', { tone: 'error' });

        if (navigation.isFocused()) {
          navigation.goBack();
        }

        return;
      }

      setError(requestError.message);
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title={isEdit ? 'עריכת פרטי המסעדה' : 'פתיחת מסעדה חדשה'}
        subtitle={isEdit ? 'השינויים יופיעו מיד בעמוד המסעדה' : 'אחר כך מוסיפים מנות לתפריט'}
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

          <Pressable
            onPress={pickImage}
            accessibilityRole="button"
            accessibilityLabel={values.image ? 'החלפת תמונת המסעדה' : 'בחירת תמונה למסעדה'}
            style={({ pressed }) => [styles.media, pressed && styles.pressed]}
          >
            {values.image ? (
              <Image source={{ uri: values.image }} style={styles.mediaImage} resizeMode="cover" />
            ) : (
              <View style={styles.mediaEmpty}>
                <Icon name="store" size={26} color={styles.mediaGlyph.color} />
                <Text style={styles.mediaText}>בחירת תמונה מהגלריה</Text>
                <Text style={styles.mediaHint}>תמונה רחבה של המקום או של מנה מובילה</Text>
              </View>
            )}
          </Pressable>

          <Field
            label="שם המסעדה"
            value={values.name}
            onChangeText={change('name')}
            error={errors.name}
            placeholder="לדוגמה: פסטה פרסקה"
            required
          />

          <Field
            label="כתובת"
            value={values.address}
            onChangeText={change('address')}
            placeholder="רחוב, מספר, עיר"
          />

          <Field
            label="טלפון"
            value={values.phone}
            onChangeText={change('phone')}
            keyboardType="phone-pad"
            placeholder="03-0000000"
          />

          <Field
            label="קישור לתמונה"
            value={values.image.startsWith('data:') ? '' : values.image}
            onChangeText={change('image')}
            hint={values.image.startsWith('data:') ? 'נבחרה תמונה מהגלריה.' : 'אפשר גם להדביק קישור לתמונה.'}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://"
            ltr
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button size="lg" fullWidth loading={saving} onPress={submit}>
          {isEdit ? 'שמירת השינויים' : 'פתיחת המסעדה'}
        </Button>
      </View>
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  flex: { flex: 1 },
  content: { padding: space[4], gap: space[4], paddingBottom: space[7] },

  media: {
    height: 180,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.9 },
  mediaImage: { width: '100%', height: '100%' },
  mediaEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[1] },
  mediaGlyph: { color: colors.inkMuted },
  mediaText: { ...type.body, color: colors.ink, fontWeight: '700' },
  mediaHint: { ...type.caption, color: colors.inkMuted },

  footer: {
    padding: space[4],
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.panel,
  },
}));
