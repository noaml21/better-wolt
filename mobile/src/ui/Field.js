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

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  container: { gap: space[2] },
  label: { ...type.caption, ...rtl.text, color: colors.ink, fontWeight: '700' },
  required: { color: colors.danger },
  input: {
    ...type.body,
    ...rtl.text,
    minHeight: 48,
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
  multiline: { minHeight: 104, textAlignVertical: 'top' },
  /* A URL is not Hebrew: right-aligning one hides its start. */
  inputLtr: { textAlign: 'left', writingDirection: 'ltr' },
  /* The focus ring the web client draws with `outline`
     (V3_DESIGN_SPEC §4.4). */
  inputFocused: { borderColor: colors.flameDeep, borderWidth: 2, paddingHorizontal: space[4] - 1 },
  inputError: { borderColor: colors.danger, borderWidth: 2 },
  hint: { ...type.caption, ...rtl.text, color: colors.inkMuted },
  error: { ...type.caption, ...rtl.text, color: colors.danger, fontWeight: '600' },
}));
