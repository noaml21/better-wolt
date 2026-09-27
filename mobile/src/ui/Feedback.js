import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import Button from './Button';
import Icon from './Icon';

/* Empty, error and loading states — designed rather than a bare line of
   text, and always offering the action that resolves them. */

export function EmptyState({ icon = 'bag', title, description, actionLabel, onAction }) {
  const styles = useStyles();

  return (
    <View style={styles.state}>
      <View style={[styles.icon, styles.iconEmpty]}>
        <Icon name={icon} size={26} color={styles.iconEmptyGlyph.color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel ? (
        <Button style={styles.action} onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export function ErrorState({ title = 'משהו השתבש', description, onRetry }) {
  const styles = useStyles();

  return (
    <View style={styles.state} accessibilityLiveRegion="polite">
      <View style={[styles.icon, styles.iconError]}>
        <Icon name="alert" size={26} color={styles.iconErrorGlyph.color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {onRetry ? (
        <Button variant="secondary" style={styles.action} onPress={onRetry}>
          נסו שוב
        </Button>
      ) : null}
    </View>
  );
}

export function LoadingState({ label = 'טוען…' }) {
  const styles = useStyles();

  return (
    <View style={styles.state}>
      <ActivityIndicator size="large" color={styles.spinner.color} />
      <Text style={styles.description}>{label}</Text>
    </View>
  );
}

export function InlineMessage({ children, tone = 'error' }) {
  const styles = useStyles();

  return (
    <View style={[styles.inline, styles[`inline_${tone}`]]} accessibilityLiveRegion="polite">
      <Icon name={tone === 'error' ? 'alert' : 'info'} size={18} color={styles[`inlineText_${tone}`].color} />
      <Text style={[styles.inlineText, styles[`inlineText_${tone}`]]}>{children}</Text>
    </View>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  state: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    paddingVertical: space[9],
    paddingHorizontal: space[5],
  },
  icon: { width: 56, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconEmpty: { backgroundColor: colors.inkTint },
  iconEmptyGlyph: { color: colors.inkMuted },
  iconError: { backgroundColor: colors.dangerTint },
  iconErrorGlyph: { color: colors.danger },
  title: { ...type.h3, color: colors.ink, textAlign: 'center' },
  description: { ...type.body, color: colors.inkMuted, textAlign: 'center' },
  action: { marginTop: space[2] },
  spinner: { color: colors.flame },

  inline: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[2],
    padding: space[3],
    borderRadius: radius.sm,
  },
  inline_error: { backgroundColor: colors.dangerTint },
  inline_info: { backgroundColor: colors.inkTint },
  inline_success: { backgroundColor: colors.herbTint },
  inlineText: { ...type.caption, ...rtl.text, flex: 1, fontWeight: '600' },
  inlineText_error: { color: colors.danger },
  inlineText_info: { color: colors.ink },
  inlineText_success: { color: colors.herb },
}));
