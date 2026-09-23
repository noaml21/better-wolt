import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { createStyles, rtl } from '../theme';
import { register } from '../services/api';
import { AuthScaffold, Button, Chip, Field, Icon, InlineMessage, useToast } from '../ui';

/* Registration. Every rule the server enforces is checked here too, so
   the answer arrives before the round trip — and the server's own
   message is what shows when it refuses anyway (ARCHITECTURE §4.3). */

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roles = [
  { key: 'customer', label: 'להזמין אוכל' },
  { key: 'restaurant', label: 'לפתוח מסעדה' },
];

export default function RegisterScreen({ navigation }) {
  const styles = useStyles();
  const { showToast } = useToast();
  const [values, setValues] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirm: '',
    address: '',
    role: 'customer',
  });
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const change = (name) => (value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast('אין לנו גישה לגלריה. אפשר להמשיך בלי תמונה.', { tone: 'error' });

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0].uri);
    }
  };

  const validate = () => {
    const next = {};

    if (!values.username.trim()) next.username = 'שדה חובה';
    if (!values.displayName.trim()) next.displayName = 'שדה חובה';
    if (!values.address.trim()) next.address = 'שדה חובה';
    /* An empty field is missing, not malformed — telling someone their
       blank email is "invalid" is the wrong complaint. */
    if (!values.email.trim()) {
      next.email = 'שדה חובה';
    } else if (!emailPattern.test(values.email.trim())) {
      next.email = 'כתובת אימייל לא תקינה';
    }

    if (values.password.length < 8 || !/\d/.test(values.password) || !/[a-zA-Z]/.test(values.password)) {
      next.password = 'לפחות 8 תווים, עם אות וספרה';
    }

    if (!values.confirm) {
      next.confirm = 'שדה חובה';
    } else if (values.password !== values.confirm) {
      next.confirm = 'הסיסמאות אינן תואמות';
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      let encodedImage = '';

      if (image) {
        const base64 = await FileSystem.readAsStringAsync(image, {
          encoding: FileSystem.EncodingType.Base64,
        });

        encodedImage = `data:image/jpeg;base64,${base64}`;
      }

      await register({
        username: values.username.trim(),
        displayName: values.displayName.trim(),
        email: values.email.trim(),
        password: values.password,
        address: values.address.trim(),
        image: encodedImage,
        role: values.role,
      });

      showToast('נרשמתם. אפשר להתחבר.');
      navigation.navigate('Login');
    } catch (requestError) {
      setError(requestError.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      title="פתיחת חשבון"
      subtitle="דקה, ואתם בפנים."
      footer={
        <>
          <Text style={styles.footerText}>כבר יש לכם חשבון?</Text>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="link" hitSlop={8}>
            <Text style={styles.footerLink}>התחברות</Text>
          </Pressable>
        </>
      }
    >
      {error ? <InlineMessage>{error}</InlineMessage> : null}

      <View style={styles.roles}>
        <Text style={styles.rolesLabel}>מה אתם רוצים לעשות כאן?</Text>

        <View style={styles.roleChips}>
          {roles.map((role) => (
            <Chip
              key={role.key}
              selected={values.role === role.key}
              onPress={() => change('role')(role.key)}
            >
              {role.label}
            </Chip>
          ))}
        </View>
      </View>

      <Pressable
        onPress={pickImage}
        accessibilityRole="button"
        accessibilityLabel={image ? 'החלפת תמונת הפרופיל' : 'הוספת תמונת פרופיל'}
        style={({ pressed }) => [styles.avatarRow, pressed && styles.pressed]}
      >
        <View style={styles.avatar}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatarImage} />
          ) : (
            <Icon name="user" size={24} color={styles.avatarGlyph.color} />
          )}
        </View>

        <View style={styles.avatarText}>
          <Text style={styles.avatarTitle}>{image ? 'תמונה נבחרה' : 'תמונת פרופיל'}</Text>
          <Text style={styles.avatarHint}>לא חובה.</Text>
        </View>
      </Pressable>

      <Field
        label="שם משתמש"
        value={values.username}
        onChangeText={change('username')}
        error={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        required
      />

      <Field
        label="שם מלא"
        value={values.displayName}
        onChangeText={change('displayName')}
        error={errors.displayName}
        required
      />

      <Field
        label="אימייל"
        value={values.email}
        onChangeText={change('email')}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        required
      />

      <Field
        label="כתובת למשלוח"
        value={values.address}
        onChangeText={change('address')}
        error={errors.address}
        required
      />

      <Field
        label="סיסמה"
        value={values.password}
        onChangeText={change('password')}
        error={errors.password}
        hint="לפחות 8 תווים, עם אות וספרה"
        secureTextEntry
        autoCapitalize="none"
        required
      />

      <Field
        label="אימות סיסמה"
        value={values.confirm}
        onChangeText={change('confirm')}
        error={errors.confirm}
        secureTextEntry
        autoCapitalize="none"
        onSubmitEditing={submit}
        returnKeyType="go"
        required
      />

      <Button size="lg" fullWidth loading={submitting} onPress={submit}>
        יצירת חשבון
      </Button>
    </AuthScaffold>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  footerText: { ...type.body, color: colors.onInk, opacity: 0.8 },
  footerLink: { ...type.body, color: colors.amber, fontWeight: '800' },

  roles: { gap: space[2] },
  rolesLabel: { ...type.caption, ...rtl.text, color: colors.ink, fontWeight: '700' },
  roleChips: { ...rtl.row, gap: space[2] },

  avatarRow: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.sunken,
  },
  pressed: { opacity: 0.9 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarGlyph: { color: colors.inkMuted },
  avatarText: { flex: 1, gap: 2 },
  avatarTitle: { ...type.body, ...rtl.text, color: colors.ink, fontWeight: '700' },
  avatarHint: { ...type.caption, ...rtl.text, color: colors.inkMuted },
}));
