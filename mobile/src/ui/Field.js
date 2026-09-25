import React, { forwardRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { createStyles, rtl, useTheme } from '../theme';

/* A labelled input. The label is spoken with the field, errors are
   announced, and the control keeps a 48pt height so it stays tappable. */

const Field = forwardRef(function Field(
  {
    label,
    value,
    onChangeText,
    error,
    hint,
    required = false,
    multiline = false,
    ltr = false,
    style,
    ...rest
  },
  ref
) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor={colors.inkMuted}
        accessibilityLabel={label}
        accessibilityHint={error || hint}
        {...rest}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          ltr && styles.inputLtr,
          focused && styles.inputFocused,
          error && styles.inputError,
          rest.style,
        ]}
      />

      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

export default Field;

const useStyles = createStyles(({ colors, space, type }) => ({
  container: { gap: space[2] },
  label: { ...type.body, ...rtl.text, color: colors.ink, fontWeight: '800' },
  required: { color: colors.error },
  input: {
    ...type.bodyL,
    ...rtl.text,
    minHeight: 48,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.panel,
    color: colors.ink,
  },
  multiline: { minHeight: 104, textAlignVertical: 'top' },
  /* A URL is not Hebrew: right-aligning one hides its start. */
  inputLtr: { textAlign: 'left', writingDirection: 'ltr' },
  /* The border is the focus ring (V5 spec §5): 3pt of ink. */
  inputFocused: { borderColor: colors.ink, borderWidth: 3, paddingHorizontal: space[4] - 2 },
  inputError: { borderColor: colors.error, borderWidth: 2 },
  hint: { ...type.caption, ...rtl.text, color: colors.inkMuted },
  error: { ...type.caption, ...rtl.text, color: colors.error, fontWeight: '700' },
}));
