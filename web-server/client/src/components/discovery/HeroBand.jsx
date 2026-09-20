import { useNavigate } from 'react-router-dom';
import { Chip, Icon } from '../ui';
import './HeroBand.css';

/* The opening band: one question, one search field, and the food itself.
   It is a band, not a full viewport — the restaurants start above the fold. */

const quickSearches = ['פיצה', 'המבורגר', 'סושי', 'חומוס', 'פסטה', 'מתוק'];

export default function HeroBand({ images = [] }) {
  const navigate = useNavigate();
  const photos = images.filter(Boolean).slice(0, 3);

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q')?.toString().trim();

    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="bw-hero" aria-labelledby="bw-hero-title">
      <div className="bw-hero__inner">
        <div className="bw-hero__text">
          <h1 className="bw-hero__title bw-display" id="bw-hero-title">
            מה אוכלים הערב?
          </h1>
          <p className="bw-hero__lead">
            המסעדות הטובות בעיר, מהתפריט שלהן ועד הדלת שלכם. בלי טלפונים, בלי הפתעות במחיר.
          </p>

          <form className="bw-hero__search" onSubmit={handleSubmit} role="search">
            <label className="bw-visually-hidden" htmlFor="bw-hero-search">
              חיפוש מסעדה, מנה או מטבח
            </label>
            <Icon name="search" size={20} className="bw-hero__search-icon" />
            <input id="bw-hero-search" name="q" type="search" placeholder="מסעדה, מנה או מטבח" />
            <button type="submit">חיפוש</button>
          </form>

          <div className="bw-hero__chips">
            {quickSearches.map((term) => (
              <Chip key={term} onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}>
                {term}
              </Chip>
            ))}
          </div>
        </div>

        {photos.length === 3 && (
          <div className="bw-hero__photos" aria-hidden="true">
            <img className="bw-hero__photo bw-hero__photo--tall" src={photos[0]} alt="" />
            <img className="bw-hero__photo" src={photos[1]} alt="" />
            <img className="bw-hero__photo" src={photos[2]} alt="" />
          </div>
        )}
      </div>
    </section>
  );
}
