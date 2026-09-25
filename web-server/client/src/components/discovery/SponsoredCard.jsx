import { useEffect, useState } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import './SponsoredCard.css';

/* The sponsored slot sits on the board as one more row instead of
   floating over the page. The video is muted and rotates with the clip.

   Under `prefers-reduced-motion` it neither plays nor rotates by itself
   and gets its own controls instead: a clip that plays for twenty
   seconds with no way to stop it is motion the viewer did not ask for
   (WCAG 2.2.2, and the spec's own motion rule, §4.5).

   A clip that fails to load leaves the rotation, and when none is left
   the slot leaves the grid: an empty dark box labelled "sponsored" is a
   hole in the page, not an advertisement. */

const ads = [
  { id: 'pizza-hut', src: '/ads/pizza-hut.mp4', title: 'פיצה האט', duration: 15000 },
  { id: 'bar-ilan', src: '/ads/bar-ilan.mp4', title: 'אוניברסיטת בר אילן', duration: 21000 },
];

export default function SponsoredCard() {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState([]);
  const reducedMotion = usePrefersReducedMotion();
  const available = ads.filter((candidate) => !failed.includes(candidate.id));
  const ad = available.length ? available[index % available.length] : null;

  useEffect(() => {
    if (!ad || reducedMotion || available.length < 2) {
      return undefined;
    }

    const timer = window.setTimeout(() => setIndex((current) => current + 1), ad.duration);

    return () => window.clearTimeout(timer);
  }, [ad, reducedMotion, available.length]);

  if (!ad) {
    return null;
  }

  return (
    <li className="bw-sponsored">
      <div className="bw-sponsored__media">
        {/* Keyed on the motion preference too: `autoPlay` is only read when
            the element loads, so changing the setting mid-clip needs a
            fresh element to take effect. */}
        <video
          key={`${ad.id}-${reducedMotion}`}
          src={ad.src}
          autoPlay={!reducedMotion}
          controls={reducedMotion}
          preload={reducedMotion ? 'metadata' : 'auto'}
          muted
          playsInline
          aria-label={`פרסומת: ${ad.title}`}
          onError={() => setFailed((current) => [...current, ad.id])}
        />
      </div>

      <div className="bw-sponsored__body">
        <h3 className="bw-sponsored__title">{ad.title}</h3>
        <p className="bw-sponsored__note">תוכן פרסומי</p>
      </div>

      <span className="bw-sponsored__badge">ממומן</span>
    </li>
  );
}
