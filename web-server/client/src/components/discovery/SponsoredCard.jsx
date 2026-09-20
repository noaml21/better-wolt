import { useEffect, useRef, useState } from 'react';
import './SponsoredCard.css';

/* The sponsored slot sits inside the grid as one more card instead of
   floating over the page. Video is muted and rotates with the clip. */

const ads = [
  { id: 'pizza-hut', src: '/ads/pizza-hut.mp4', title: 'פיצה האט', duration: 15000 },
  { id: 'bar-ilan', src: '/ads/bar-ilan.mp4', title: 'אוניברסיטת בר אילן', duration: 21000 },
];

export default function SponsoredCard() {
  const [index, setIndex] = useState(0);
  const videoRef = useRef(null);
  const ad = ads[index];

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % ads.length),
      ad.duration
    );

    return () => window.clearTimeout(timer);
  }, [ad]);

  return (
    <li className="bw-sponsored">
      <div className="bw-sponsored__media">
        <video
          key={ad.id}
          ref={videoRef}
          src={ad.src}
          autoPlay
          muted
          playsInline
          aria-label={`פרסומת: ${ad.title}`}
        />
        <span className="bw-sponsored__badge">ממומן</span>
      </div>

      <div className="bw-sponsored__body">
        <h3 className="bw-sponsored__title">{ad.title}</h3>
        <p className="bw-sponsored__note">תוכן פרסומי</p>
      </div>
    </li>
  );
}
