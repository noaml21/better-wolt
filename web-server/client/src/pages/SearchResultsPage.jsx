import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getQuery } from '../services/api';
import { Chip, EmptyState, ErrorState, LinkButton } from '../components/ui';
import { restaurantCount } from '../services/counts';
import BoardRow, { BoardRowSkeleton } from '../components/discovery/BoardRow';
import './SearchResultsPage.css';

/* Results come from GET /search/:query, which matches the query literally
   against restaurant names, addresses and dish names (V2_SPEC BF-5). */

const suggestions = ['פיצה', 'המבורגר', 'סושי', 'חומוס', 'פסטה'];

/* Why a restaurant matched, when its name does not say so (V4 audit B3).
   The server matches name, address, dish names and descriptions (ARCHITECTURE
   §4.2) but only returns restaurants; the same literal, case-insensitive test
   run here names the dish or the address, with the searched text marked. */
function markMatch(text, term) {
  const at = text.toLowerCase().indexOf(term);

  if (at < 0) {
    return text;
  }

  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + term.length)}</mark>
      {text.slice(at + term.length)}
    </>
  );
}

export function matchNote(restaurant, query) {
  const term = query.trim().toLowerCase();

  if (!term || restaurant.name?.toLowerCase().includes(term)) {
    return null;
  }

  const products = restaurant.products || [];
  const byName = products.find((product) => product.name?.toLowerCase().includes(term));

  if (byName) {
    return <>נמצא בתפריט: {markMatch(byName.name, term)}</>;
  }

  const byDescription = products.find((product) => product.description?.toLowerCase().includes(term));

  if (byDescription) {
    return <>נמצא בתפריט: {byDescription.name} ({markMatch(byDescription.description, term)})</>;
  }

  if (restaurant.address?.toLowerCase().includes(term)) {
    return <>בכתובת: {markMatch(restaurant.address, term)}</>;
  }

  return null;
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = (searchParams.get('q') || '').trim();
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('loading');

  /* Searches can overtake each other: a slow answer for the previous
     query used to land after the current one and replace the results
     under a heading that said something else. Only the newest request
     is allowed to write. */
  const latestRequest = useRef(0);

  const runSearch = useCallback(async () => {
    const request = latestRequest.current + 1;

    latestRequest.current = request;

    if (!query) {
      setResults([]);
      setStatus('ready');
      return;
    }

    setStatus('loading');

    try {
      const data = await getQuery(query);

      if (latestRequest.current !== request) {
        return;
      }

      setResults(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (error) {
      if (latestRequest.current === request) {
        setStatus('error');
      }
    }
  }, [query]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const resultLabel =
    results.length === 1 ? 'מסעדה אחת מתאימה' : `${restaurantCount(results.length)} מתאימות`;

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = new FormData(event.currentTarget).get('q')?.toString().trim();

    if (next) {
      navigate(`/search?q=${encodeURIComponent(next)}`);
    }
  };

  return (
    <div className="bw-page bw-search">
      {/* The query is the page's title, at signage scale (V5 spec §6);
          the words around it are for screen readers. */}
      <header className="bw-search__head">
        <h1 className="bw-search__title bw-display">
          {query ? (
            <>
              <span className="bw-visually-hidden">תוצאות עבור </span>
              <bdi>{query}</bdi>
            </>
          ) : (
            'חיפוש'
          )}
        </h1>
        <p className="bw-search__count" aria-live="polite">
          {/* Same rule as the listing: "מחפשים…" only while a search is
              actually running, and no "0 מסעדות" above the empty state that
              already says nothing matched. */}
          {status === 'loading' && query
            ? 'מחפשים…'
            : status === 'ready' && query && results.length > 0
              ? resultLabel
              : ''}
        </p>

        <form className="bw-search__form" role="search" onSubmit={handleSubmit} key={query}>
          <label className="bw-visually-hidden" htmlFor="bw-search-again">
            חיפוש מסעדה, מנה או כתובת
          </label>
          <input id="bw-search-again" name="q" type="search" defaultValue={query} placeholder="בא לי…" autoComplete="off" />
          <button type="submit">חיפוש</button>
        </form>
      </header>

      <div className="bw-filter-row" aria-label="חיפושים מהירים">
        {suggestions.map((term) => (
          <Chip
            key={term}
            selected={term === query}
            onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
          >
            {term}
          </Chip>
        ))}
      </div>

      {status === 'error' && (
        <ErrorState
          title="החיפוש נכשל"
          description="לא הצלחנו להגיע לשרת. אפשר לנסות שוב."
          onRetry={runSearch}
        />
      )}

      {status === 'loading' && (
        <ol className="bw-board" aria-busy="true" aria-label="תוצאות החיפוש">
          {Array.from({ length: 3 }, (_, index) => (
            <BoardRowSkeleton key={index} />
          ))}
        </ol>
      )}

      {status === 'ready' && query && results.length === 0 && (
        <EmptyState
          icon="search"
          title="אף מסעדה לא מגישה את זה"
          description="אפשר לנסות שם של מנה, של מסעדה או של רחוב. גם חיפוש קצר יותר בדרך כלל עוזר."
          action={<LinkButton to="/restaurants" variant="secondary">לכל המסעדות</LinkButton>}
        />
      )}

      {status === 'ready' && !query && (
        <EmptyState
          icon="search"
          title="מה בא לכם לאכול?"
          description="הקלידו שם מסעדה, מנה או מטבח בשורת החיפוש למעלה."
        />
      )}

      {status === 'ready' && results.length > 0 && (
        <ol className="bw-board" aria-label="תוצאות החיפוש">
          {results.map((restaurant) => (
            <BoardRow key={restaurant.id} restaurant={restaurant} note={matchNote(restaurant, query)} />
          ))}
        </ol>
      )}
    </div>
  );
}
