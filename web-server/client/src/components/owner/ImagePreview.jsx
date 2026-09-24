import { useState } from 'react';
import { Plate } from '../ui';
import './ImagePreview.css';

/* What customers will see for this restaurant, as the owner types the
   image link: the photo as the card crops it, or — with no link, or a
   link that does not load — the plate the grid will show instead. */

export default function ImagePreview({ src, restaurant }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const url = /^https?:\/\/\S+$/i.test(src || '') ? src : '';
  const showPhoto = url && failedSrc !== url;

  let caption = 'בלי תמונה, המסעדה תופיע כך.';

  if (showPhoto) {
    caption = 'כך התמונה תופיע בכרטיס המסעדה.';
  } else if (url) {
    caption = 'התמונה בקישור הזה לא נטענה, אז יוצג הרקע הזה במקומה.';
  }

  return (
    <figure className="bw-image-preview">
      <div className="bw-image-preview__frame">
        {showPhoto ? (
          <img key={url} src={url} alt="" onError={() => setFailedSrc(url)} />
        ) : (
          <Plate restaurant={restaurant} />
        )}
      </div>
      <figcaption className="bw-image-preview__caption" aria-live="polite">
        {caption}
      </figcaption>
    </figure>
  );
}
