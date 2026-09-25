import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { createStyles, TOUCH_TARGET } from '../theme';
import Icon from './Icon';

/* Four tones, three sizes, and the same loading rule as the web client:
   the spinner replaces the label without changing the button's size. */

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
  style,
}) {
  const styles = useStyles();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      /* `sm` is 36pt tall by design; the missing 8pt of target comes from
         hitSlop rather than from the shape (V3_DESIGN_SPEC §4.4). */
      hitSlop={size === 'sm' ? (TOUCH_TARGET - SM_HEIGHT) / 2 : undefined}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[`size_${size}`],
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantTextColor(variant, styles)} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} color={variantTextColor(variant, styles)} /> : null}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function variantTextColor(variant, styles) {
  return styles[`label_${variant}`].color;
}

const SM_HEIGHT = 40;

const useStyles = createStyles(({ colors, space, type }) => ({
  base: {
    minHeight: 48,
    paddingHorizontal: space[6],
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row-reverse', alignItems: 'center', gap: space[2] },
  size_sm: { minHeight: SM_HEIGHT, paddingHorizontal: space[4] },
  size_md: {},
  size_lg: { minHeight: 56, paddingHorizontal: space[7] },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { transform: [{ scale: 0.97 }] },
  disabled: { borderStyle: 'dashed', borderColor: colors.rule, backgroundColor: 'transparent' },

  /* V5 spec §5: one filled primary per screen; secondary is an ink
     outline; ghost is underlined text; danger is the error fill. */
  primary: { backgroundColor: colors.ink, borderColor: colors.ink },
  secondary: { backgroundColor: 'transparent', borderColor: colors.ink },
  ghost: { backgroundColor: 'transparent', paddingHorizontal: space[3] },
  danger: { backgroundColor: colors.error, borderColor: colors.error },

  label: { ...type.bodyL, fontWeight: '800' },
  labelSize_sm: { fontSize: type.body.fontSize },
  labelSize_md: {},
  labelSize_lg: { fontSize: 18 },
  label_primary: { color: colors.onInk },
  label_secondary: { color: colors.ink },
  label_ghost: { color: colors.ink, textDecorationLine: 'underline' },
  label_danger: { color: colors.onError },
}));
