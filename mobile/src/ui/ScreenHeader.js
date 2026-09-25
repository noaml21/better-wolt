import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import IconButton from './IconButton';

/* One header for every screen. Native headers are off so the back
   affordance, the title and the actions sit correctly for Hebrew. */

export default function ScreenHeader({ title, subtitle, onBack, action, large = false }) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {onBack ? (
          <IconButton icon="forward" label="חזרה" onPress={onBack} style={styles.back} />
        ) : (
          <View style={styles.spacer} />
        )}

        <View style={styles.titles}>
          <Text style={[styles.title, large && styles.titleLarge]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.action}>{action}</View>
      </View>
    </View>
  );
}

const useStyles = createStyles(({ colors, space, type, font }) => ({
  container: {
    paddingHorizontal: space[4],
    paddingTop: space[3],
    paddingBottom: space[3],
    backgroundColor: colors.ground,
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
  },
  row: { ...rtl.row, alignItems: 'center', gap: space[2] },
  back: { marginStart: -space[2] },
  spacer: { width: space[1] },
  titles: { flex: 1 },
  title: { fontFamily: font.display, fontSize: 34, lineHeight: 34, paddingTop: 5, ...rtl.text, color: colors.ink },
  titleLarge: { fontSize: 52, lineHeight: 50, paddingTop: 6 },
  subtitle: { ...type.caption, ...rtl.text, fontWeight: '700', color: colors.inkMuted },
  action: { ...rtl.row, alignItems: 'center', gap: space[1] },
}));
