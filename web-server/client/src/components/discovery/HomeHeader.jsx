import { useNavigate } from 'react-router-dom';
import { Chip, Icon } from '../ui';
import './HomeHeader.css';

/* The top of the board (V5 spec §6): one question at signage scale, the
   search field under it, and five quick searches. No photographs here —
   the food starts on the board right below, above the fold. */

const quickSearches = ['פיצה', 'המבורגר', 'סושי', 'חומוס', 'מתוק'];

export default function HomeHeader() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q')?.toString().trim();

    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="bw-home-header" aria-labelledby="bw-home-title">
      <h1 className="bw-home-header__title bw-display" id="bw-home-title">
        מה אוכלים הערב?
      </h1>

      <form className="bw-home-header__search" onSubmit={handleSubmit} role="search">
        <label className="bw-visually-hidden" htmlFor="bw-home-search">
          חיפוש מסעדה, מנה או כתובת
        </label>
        <Icon name="search" size={22} className="bw-home-header__search-icon" />
        <input id="bw-home-search" name="q" type="search" placeholder="בא לי… פיצה, סושי, חומוס" autoComplete="off" />
        <button type="submit">חיפוש</button>
      </form>

      <div className="bw-home-header__quick" role="group" aria-label="חיפושים מהירים">
        {quickSearches.map((term) => (
          <Chip key={term} onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}>
            {term}
          </Chip>
        ))}
      </div>
    </section>
  );
}
