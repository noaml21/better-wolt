import { useState } from 'react';

/* An image that is allowed to fail.

   Every photograph in this product comes from somewhere else — restaurant
   images are URLs the owner typed, the campaign flags come from a CDN —
   so "the image did not arrive" is a state the interface has to have.
   Without this, a dead URL renders the browser's broken-image frame,
   which is finding A10 of the V2 audit. On failure the fallback takes
   over: the restaurant's initial, the campaign's mark, or nothing. */

export default function Media({ src, alt = '', fallback = null, onFail, ...rest }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return fallback;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => {
        setFailed(true);
        onFail?.(src);
      }}
      {...rest}
    />
  );
}
