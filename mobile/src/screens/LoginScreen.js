import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { createStyles } from '../theme';
import { useAuth } from '../context/AuthContext';
import { AuthScaffold, Button, Field, InlineMessage, useToast } from '../ui';

export default function LoginScreen({ navigation }) {
  const styles = useStyles();
  const [values, setValues] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const username = useRef(null);
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    username.current?.focus();
  }, []);

  const change = (name) => (value) => setValues((current) => ({ ...current, [name]: value }));

  const submit = async () => {
    if (!values.username.trim() || !values.password) {
      setError('צריך שם משתמש וסיסמה כדי להיכנס.');

      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await login({ username: values.username.trim(), password: values.password });

      showToast(`שלום ${response.user?.displayName || values.username}`);
    } catch (requestError) {
      /* 401 gets the friendly line; everything else (429, 400) shows the
         server's own message, which is contract (ARCHITECTURE §4.3). */
      setError(
        requestError.status === 401 ? 'שם המשתמש או הסיסמה אינם נכונים.' : requestError.message
      );
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      title="כניסה לחשבון"
      subtitle="עוד רגע אתם מזמינים."
      footer={
        <>
          <Text style={styles.footerText}>אין לכם חשבון?</Text>
          <Pressable
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="link"
            hitSlop={8}
          >
            <Text style={styles.footerLink}>הרשמה</Text>
          </Pressable>
        </>
      }
    >
      {error ? <InlineMessage>{error}</InlineMessage> : null}

      <Field
        ref={username}
        label="שם משתמש"
        value={values.username}
        onChangeText={change('username')}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        returnKeyType="next"
        required
      />

      <Field
        label="סיסמה"
        value={values.password}
        onChangeText={change('password')}
        secureTextEntry
        autoCapitalize="none"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        required
      />

      <Button size="lg" fullWidth loading={submitting} onPress={submit}>
        התחברות
      </Button>
    </AuthScaffold>
  );
}

const useStyles = createStyles(({ colors, type }) => ({
  footerText: { ...type.body, color: colors.onInk, opacity: 0.8 },
  footerLink: { ...type.body, color: colors.amber, fontWeight: '800' },
}));
