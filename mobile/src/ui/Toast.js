import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles, rtl } from '../theme';
import Icon from './Icon';

/* Replaces Alert for feedback. Alert stays only for destructive
   confirmations, where a blocking dialog is the point. */

const ToastContext = createContext(null);
const DURATION = 3000;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  /* The driver is created once and never replaced. It lives in state
     rather than a ref because reading `ref.current` while rendering is
     what React 19 asks components not to do. */
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef(null);
  const styles = useStyles();
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() =>
      setToast(null)
    );
  }, [opacity]);

  const showToast = useCallback(
    (message, options = {}) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      setToast({ message, tone: options.tone || 'success' });
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, options.duration || DURATION);
    },
    [hide, opacity]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toast ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[
            styles.container,
            styles[`tone_${toast.tone}`],
            { opacity, bottom: insets.bottom + 90 },
          ]}
        >
          <Icon
            name={toast.tone === 'error' ? 'alert' : 'check'}
            size={18}
            color={styles[`text_${toast.tone}`].color}
          />
          <Text style={[styles.text, styles[`text_${toast.tone}`]]}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }

  return context;
}

/* Toasts only confirm (V5 spec §5): a square ink block; errors take the
   error fill. */
const useStyles = createStyles(({ colors, space, type, shadow }) => ({
  container: {
    ...rtl.row,
    position: 'absolute',
    left: space[4],
    right: space[4],
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
    minHeight: 52,
    paddingVertical: space[3],
    paddingHorizontal: space[5],
    borderWidth: 2,
    ...shadow.e3,
  },
  tone_success: { backgroundColor: colors.ink, borderColor: colors.ink },
  tone_error: { backgroundColor: colors.error, borderColor: colors.error },
  text: { ...type.body, fontWeight: '800', textAlign: 'center' },
  text_success: { color: colors.onInk },
  text_error: { color: colors.onError },
}));
