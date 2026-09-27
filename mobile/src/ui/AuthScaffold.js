import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import Logo from './Logo';
import Screen from './Screen';

/* Signed out, the app is two forms. Both sit on the brand's ink band so
   the first screen looks like the product, and both scroll inside a
   KeyboardAvoidingView so a Hebrew keyboard never covers the submit. */

export default function AuthScaffold({ title, subtitle, children, footer }) {
  const styles = useStyles();

  return (
    <Screen style={styles.screen}>
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
          <View style={styles.brand}>
            <Logo size={40} tone="onInk" />

            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          <View style={styles.card}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  screen: { backgroundColor: colors.ink },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: space[5], gap: space[5] },
  brand: { alignItems: 'center', gap: space[2], paddingTop: space[6] },
  title: { ...type.h1, textAlign: 'center', color: colors.onInk },
  subtitle: { ...type.body, textAlign: 'center', color: colors.onInk, opacity: 0.72 },
  card: {
    gap: space[4],
    padding: space[5],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  footer: { ...rtl.row, alignItems: 'center', justifyContent: 'center', gap: space[2] },
}));
