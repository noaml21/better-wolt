import React, { useState } from 'react';
import { Image } from 'react-native';

/* An image that is allowed to fail.

   Restaurant photographs are URLs an owner typed and the campaign flags
   come from a CDN, so "the image did not arrive" is a state the screens
   have to have. React Native draws nothing for a failed remote image,
   which leaves an empty box where the food should be; this hands the
   fallback over instead. The web client has the same component
   (components/ui/Media.jsx). */

export default function Media({ uri, style, resizeMode = 'cover', fallback = null, onFail }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return fallback;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => {
        setFailed(true);
        onFail?.(uri);
      }}
    />
  );
}
