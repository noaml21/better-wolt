import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from '../theme';

/* Every screen starts here: the app background, and the top inset paid
   once so notches never eat a header. The bottom inset belongs to
   whatever is docked there (the tab bar, a cart bar), not to the page. */

export default function Screen({ children, style, topInset = true }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, topInset && { paddingTop: insets.top }, style]}>{children}</View>
  );
}

const useStyles = createStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.ground },
}));
