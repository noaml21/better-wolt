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

const SM_HEIGHT = 36;

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  base: {
    minHeight: TOUCH_TARGET,
    paddingHorizontal: space[5],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row-reverse', alignItems: 'center', gap: space[2] },
  size_sm: { minHeight: SM_HEIGHT, paddingHorizontal: space[4] },
  size_md: {},
  size_lg: { minHeight: 52, paddingHorizontal: space[7] },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },

  primary: { backgroundColor: colors.flame },
  secondary: { backgroundColor: colors.surface, borderColor: colors.line },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: 'transparent', borderColor: colors.danger },

  label: { ...type.body, fontWeight: '700' },
  labelSize_sm: { fontSize: type.caption.fontSize },
  labelSize_md: {},
  labelSize_lg: { fontSize: type.bodyL.fontSize },
  label_primary: { color: colors.onFlame },
  label_secondary: { color: colors.ink },
  label_ghost: { color: colors.ink },
  label_danger: { color: colors.danger },
}));
