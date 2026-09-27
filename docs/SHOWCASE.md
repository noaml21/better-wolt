# Better Wolt — Showcase

The V4 interface on web and mobile. Every screen is in Hebrew and laid out right to left.

The web captures come from Chrome at 1440 × 950 and 390 × 844. The mobile captures show the Expo app running on
Expo's web target at 412 × 915, scaled to 720 px wide; they were not taken on a physical device. Restaurants and
photos come from the sample data ([`docs/dev/demo-data.mjs`](dev/demo-data.mjs)). Ratings, delivery times and fees
are computed by the clients for display, because the API has no such fields.

**On this page:** [Web](#web) · [Mobile app](#mobile-app) · [Design language](#design-language) ·
[Earlier versions](#earlier-versions)

## Web

### Discovery

<p align="center">
  <img src="screenshots/v4/web-home-desktop.jpg" alt="Web home page: a dark search band with captioned photo links, the order-again row, the World Cup strip and the restaurant grid" width="900">
</p>
<p align="center"><sub>Home: search leads, three photos link straight to their restaurants, and a signed-in customer's
recent restaurants come next.</sub></p>

<p align="center">
  <img src="screenshots/v4/web-search.jpg" alt="Search results for a dish name: three restaurant cards, each saying which dish matched with the term highlighted" width="900">
</p>
<p align="center"><sub>Search matches restaurant names, addresses, dishes and descriptions, and each result says what
matched.</sub></p>

### Restaurant, cart and checkout

<p align="center">
  <img src="screenshots/v4/web-restaurant-desktop.jpg" alt="Restaurant page: the name on the photo, the menu as one list with steppers, and the cart panel with the total in its button" width="900">
</p>
<p align="center"><sub>The menu reads as one list with a small round add control. The cart names its restaurant and
carries the total in its button. The final price is set by the server when the order is placed.</sub></p>

<p align="center">
  <img src="screenshots/v4/web-restaurant-phone.jpg" alt="Restaurant page at phone width" width="240">
  &nbsp;
  <img src="screenshots/v4/web-cart-phone.jpg" alt="The cart as a bottom sheet at phone width, with steppers and the total" width="240">
  &nbsp;
  <img src="screenshots/v4/web-home-phone.jpg" alt="Home page at phone width" width="240">
</p>
<p align="center"><sub>The same web app at 390 px: the restaurant, the cart as a bottom sheet, the home page.</sub></p>

### Tracking and orders

<p align="center">
  <img src="screenshots/v4/web-tracking.jpg" alt="Order tracking: the arrival time, minutes left, four stages with their times, and the receipt" width="900">
</p>
<p align="center"><sub>Tracking leads with the arrival time and shows four stages, each with the time it began. The
stages are timed from when the server recorded the order.</sub></p>

<p align="center">
  <img src="screenshots/v4/web-orders.jpg" alt="Orders: the order on its way first, then history grouped by day with reorder links" width="73%">
  &nbsp;
  <img src="screenshots/v4/web-tracking-phone.jpg" alt="Order tracking at phone width in the dark theme, with a vertical timeline" width="24%">
</p>
<p align="center"><sub>Orders: what is on its way first, then history grouped by day, each order with its receipt and
"order again". On a phone, the tracking timeline turns vertical.</sub></p>

### Restaurant owners

<p align="center">
  <img src="screenshots/v4/web-owner.jpg" alt="An owner's view of their restaurant: edit and delete on every dish, and a management panel to add a dish, edit details or close the restaurant" width="900">
</p>
<p align="center"><sub>An owner sees their restaurant with the tools in place: add a dish, edit or delete one, edit
the details, or close the restaurant. The API checks ownership on every one of these actions.</sub></p>

### World Cup campaign

<p align="center">
  <img src="screenshots/v4/web-world-cup.jpg" alt="The World Cup page: a flag grid, an opt-in music button, and twenty dishes in two columns beside the cart" width="900">
</p>
<p align="center"><sub>Twenty dishes from twenty countries at one flat price, ordered through the ordinary cart. The
restaurant and its menu are seeded by the server as real records. Background music plays only when asked for.</sub></p>

### Sign-in and the dark theme

<p align="center">
  <img src="screenshots/v4/web-login.jpg" alt="Sign-in: a form card beside a dark panel with three restaurant photos" width="49%">
  &nbsp;
  <img src="screenshots/v4/web-home-dark.jpg" alt="The home page in the dark theme" width="49%">
</p>
<p align="center"><sub>Sign-in · the dark theme, which follows the system until a theme is chosen.</sub></p>

## Mobile app

React Native with Expo, bottom-tab navigation and the same design tokens as the web client.

<p align="center">
  <img src="screenshots/v4/mobile-home.jpg" alt="Mobile home: search, quick searches, the order-again row, the World Cup strip and restaurant cards" width="240">
  &nbsp;
  <img src="screenshots/v4/mobile-search.jpg" alt="Mobile search results with the matched dish highlighted" width="240">
  &nbsp;
  <img src="screenshots/v4/mobile-restaurant.jpg" alt="Mobile restaurant screen: the name on the photo, the menu as one list and the cart bar" width="240">
</p>
<p align="center"><sub>Home · search · a restaurant with the cart bar</sub></p>

<p align="center">
  <img src="screenshots/v4/mobile-cart.jpg" alt="Mobile cart with steppers and the total in the order button" width="240">
  &nbsp;
  <img src="screenshots/v4/mobile-tracking.jpg" alt="Mobile order tracking with the arrival time and a vertical stage timeline" width="240">
  &nbsp;
  <img src="screenshots/v4/mobile-orders.jpg" alt="Mobile orders: on the way, then history by day" width="240">
</p>
<p align="center"><sub>Cart · tracking · orders</sub></p>

<p align="center">
  <img src="screenshots/v4/mobile-world-cup.jpg" alt="The World Cup campaign on mobile as one list with flags" width="240">
  &nbsp;
  <img src="screenshots/v4/mobile-owner-restaurant.jpg" alt="An owner's restaurant on mobile: the management card and edit and delete controls on every dish" width="240">
  &nbsp;
  <img src="screenshots/v4/mobile-login.jpg" alt="Mobile sign-in" width="240">
</p>
<p align="center"><sub>World Cup · owner tools · sign-in</sub></p>

## Design language

Warm paper surfaces, a deep aubergine ink, one pomegranate action colour and an amber highlight. Food is loud and
the interface around it is quiet. Photography leads, and a restaurant without a photo gets a designed plate in its own
tint. A menu reads like a menu: one list, the dish name first, and a small round add control instead of a button on
every row.

Prices, totals and times use tabular figures and are never set in the display face. Problems at checkout appear
beside the cart and stay until they are dealt with, and when the server corrects a price, the tracking page explains
it. Motion only answers an action (the cart bar rising, a count bumping) or shows time passing (the tracking stages),
and it stops under the operating system's reduced-motion setting.

Hebrew is the layout, not a patch. The web uses CSS logical properties and plaintext bidi for what people type, and
the mobile theme has a direction-aware layer instead of `I18nManager.forceRTL`.

The full rules are in the [V4 design spec](V4_DESIGN_SPEC.md). The browser audit that led to them is
[V4_VISUAL_AUDIT.md](V4_VISUAL_AUDIT.md).

## Earlier versions

The same home page in V3 and V4:

<p align="center">
  <img src="screenshots/v3/web-home-desktop.jpg" alt="The V3 home page" width="49%">
  &nbsp;
  <img src="screenshots/v4/web-home-desktop.jpg" alt="The V4 home page" width="49%">
</p>
<p align="center"><sub>V3 · V4</sub></p>

| Version | Screenshots | What changed |
|---|---|---|
| V1 | [`screenshots/v1`](screenshots/v1) | The original course release |
| V2 | [`screenshots/v2`](screenshots/v2) | Backend restructured; captured as the starting point for the V3 redesign |
| V3 | [`screenshots/v3`](screenshots/v3) | Both clients redesigned around the design tokens ([spec](V3_DESIGN_SPEC.md)) |
| V4 | [`screenshots/v4`](screenshots/v4) | The refinement shown above ([spec](V4_DESIGN_SPEC.md)) |
