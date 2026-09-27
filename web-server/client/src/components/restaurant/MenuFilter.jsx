import { Icon } from '../ui';
import './MenuFilter.css';

/* Finding one dish in a long menu (V4 audit A3). The API has no
   categories, so instead of inventing sections the menu can be narrowed
   by what is typed. Only offered when the menu is long enough to need it. */

export const MENU_FILTER_THRESHOLD = 8;

export function matchesDish(product, query) {
  const term = query.trim().toLowerCase();

  if (!term) {
    return true;
  }

  return `${product.name} ${product.description || ''}`.toLowerCase().includes(term);
}

export default function MenuFilter({ value, onChange, resultLabel }) {
  return (
    <div className="bw-menu-filter" role="search">
      <label className="bw-visually-hidden" htmlFor="bw-menu-filter">
        חיפוש בתפריט
      </label>
      <Icon name="search" size={18} className="bw-menu-filter__icon" />
      <input
        id="bw-menu-filter"
        type="search"
        value={value}
        placeholder="חיפוש בתפריט"
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.preventDefault();
            onChange('');
          }
        }}
      />
      {value && (
        <button type="button" className="bw-menu-filter__clear" aria-label="ניקוי החיפוש" onClick={() => onChange('')}>
          <Icon name="close" size={16} />
        </button>
      )}
      {/* Announced as the list changes, not only when it empties. */}
      <span className="bw-visually-hidden" aria-live="polite">
        {value ? resultLabel : ''}
      </span>
    </div>
  );
}
