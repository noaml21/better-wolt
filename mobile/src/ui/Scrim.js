import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/* A bottom-up shade that keeps white text legible on any photograph
   (V4 spec §4.4). Drawn with react-native-svg, which the app already
   ships for its icons, rather than adding a gradient package. */

export default function Scrim({ strength = 0.8, id = 'scrim' }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor="#140C20" stopOpacity={strength} />
          <Stop offset="0.4" stopColor="#140C20" stopOpacity={strength * 0.42} />
          <Stop offset="0.65" stopColor="#140C20" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
