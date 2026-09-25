/* Tiny prototype runtime shared by the three V5 concepts: hash routes, a
   per-restaurant cart, and helpers. Prototype only — the production client
   keeps its own hooks (useMenuCart, usePlaceOrder) and API. */

window.BW = (function () {
  const D = window.BW_DATA;
  const listeners = [];
  const params = new URLSearchParams(location.search);
  const state = { cart: { restaurant: null, lines: {} }, sheet: false, filter: '' };

  // ?cart=r-burger preloads a cart so screenshots can show the active state.
  if (params.get('cart')) {
    const r = D.byId(params.get('cart'));
    if (r) {
      state.cart = { restaurant: r.id, lines: { [r.products[0].id]: 2, [r.products[2].id]: 1, [r.products[4] ? r.products[4].id : r.products[1].id]: 1 } };
    }
  }
  if (params.get('sheet')) state.sheet = true;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function route() {
    const [path] = location.hash.replace(/^#/, '').split('?');
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'r') return { name: 'restaurant', id: parts[1] };
    if (parts[0] === 'search') return { name: 'search', q: decodeURIComponent(parts[1] || '') };
    if (parts[0] === 'orders') return { name: 'orders' };
    if (parts[0] === 'track') return { name: 'track', id: parts[1] };
    if (parts[0] === 'world-cup') return { name: 'worldcup' };
    return { name: 'home' };
  }

  function product(id) {
    for (const r of D.restaurants) {
      const p = r.products.find((x) => x.id === id);
      if (p) return p;
    }
    const wc = D.worldCup.teams.find((t) => `wc-${t.code}` === id);
    return wc ? { id, name: wc.dish, price: D.worldCup.flat } : null;
  }

  const api = {
    D, state, esc, route,
    price: D.price,
    onRender(fn) { listeners.push(fn); },
    render() {
      listeners.forEach((fn) => fn(route()));
    },
    qty(id) { return state.cart.lines[id] || 0; },
    add(restaurantId, productId) {
      if (state.cart.restaurant && state.cart.restaurant !== restaurantId) state.cart = { restaurant: null, lines: {} };
      state.cart.restaurant = restaurantId;
      state.cart.lines[productId] = (state.cart.lines[productId] || 0) + 1;
      api.render();
    },
    dec(productId) {
      const n = (state.cart.lines[productId] || 0) - 1;
      if (n <= 0) delete state.cart.lines[productId];
      else state.cart.lines[productId] = n;
      if (!Object.keys(state.cart.lines).length) state.cart.restaurant = null;
      api.render();
    },
    lines() {
      return Object.entries(state.cart.lines).map(([id, q]) => ({ ...product(id), qty: q }));
    },
    count() { return Object.values(state.cart.lines).reduce((a, b) => a + b, 0); },
    total() { return api.lines().reduce((s, l) => s + l.price * l.qty, 0); },
    toggleSheet(open) { state.sheet = open ?? !state.sheet; api.render(); },
    /* A photo with a designed failure: the wrapper gets .is-failed and the
       concept's CSS shows its own fallback. */
    photo(src, alt, cls = '') {
      if (!src) return `<span class="ph is-failed ${cls}" data-fallback="${esc(alt)}"></span>`;
      return `<span class="ph ${cls}" data-fallback="${esc(alt)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.parentNode.classList.add('is-failed');this.remove()"></span>`;
    },
    search(q) {
      const needle = q.trim().toLowerCase();
      if (!needle) return [];
      return D.restaurants.map((r) => {
        if (r.name.toLowerCase().includes(needle)) return { r, why: null };
        const p = r.products.find((x) => x.name.toLowerCase().includes(needle) || x.description.toLowerCase().includes(needle));
        if (p) return { r, why: p.name };
        if (r.address.toLowerCase().includes(needle)) return { r, why: r.address };
        return null;
      }).filter(Boolean);
    },
    mark(text, q) {
      const t = esc(text);
      if (!q) return t;
      const i = text.toLowerCase().indexOf(q.toLowerCase());
      if (i < 0) return t;
      return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
    },
    stage(order) {
      const elapsed = (Date.now() - order.startTime) / 60000;
      const stops = [0, 2, 12, 30];
      let i = 0;
      stops.forEach((s, k) => { if (elapsed >= s) i = k; });
      const arrival = new Date(order.startTime + 30 * 60000);
      return {
        index: i, elapsed, left: Math.max(0, Math.round(30 - elapsed)),
        fraction: Math.min(1, elapsed / 30),
        arrival: arrival.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        times: stops.map((s) => new Date(order.startTime + s * 60000).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })),
        labels: ['ההזמנה התקבלה', 'בהכנה', 'בדרך אליכם', 'הגיעה'],
      };
    },
  };

  window.addEventListener('hashchange', () => { state.sheet = false; state.filter = ''; api.render(); window.scrollTo(0, 0); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-add],[data-dec],[data-sheet],[data-go]');
    if (!t) return;
    if (t.dataset.add) api.add(t.dataset.r, t.dataset.add);
    if (t.dataset.dec) api.dec(t.dataset.dec);
    if (t.dataset.sheet) api.toggleSheet(t.dataset.sheet === 'open');
    if (t.dataset.go) location.hash = t.dataset.go;
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.sheet) api.toggleSheet(false); });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-search]');
    if (!f) return;
    e.preventDefault();
    const q = new FormData(f).get('q');
    location.hash = `#/search/${encodeURIComponent(q || '')}`;
  });
  window.addEventListener('DOMContentLoaded', () => api.render());
  return api;
})();
