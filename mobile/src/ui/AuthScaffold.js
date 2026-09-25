import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import Logo from './Logo';
import Screen from './Screen';

/* Signed out, the app is two forms (V5 spec §6): each is a ticket-machine
   panel on the black board, so the first screen looks like the product,
   and both scroll inside a KeyboardAvoidingView so a Hebrew keyboard
   never covers the submit. */

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
            <Logo size={40} tone="onBoard" />
          </View>

          <View style={styles.card}>
            <View style={styles.band}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <View style={styles.body}>{children}</View>
          </View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = createStyles(({ colors, space, type, font }) => ({
  screen: { backgroundColor: colors.board },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: space[4], gap: space[5] },
  brand: { alignItems: 'flex-end', paddingTop: space[4] },
  card: { borderWidth: 3, borderColor: colors.onBoard, backgroundColor: colors.panel },
  band: { gap: space[1], padding: space[4], backgroundColor: colors.ink },
  title: { fontFamily: font.display, fontSize: 52, lineHeight: 50, paddingTop: 6, ...rtl.text, color: colors.onInk },
  subtitle: { ...type.bodyL, ...rtl.text, fontWeight: '600', color: colors.onInk },
  body: { gap: space[4], padding: space[4] },
  footer: { ...rtl.row, alignItems: 'center', justifyContent: 'center', gap: space[2] },
}));
