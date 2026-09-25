---
version: 1
slug: "web-server-client-src-app-jsx"
primary_target: "web-server/client/src/App.jsx"
related_targets: []
---

# Web client — surface brief

Scope: the whole React web client (every route) and, by extension, the Expo app. Mode: Operate (ordering, tracking,
owner management), with the home board carrying the product's identity.

Audience and job: Hebrew-first Tel Aviv diners on phones choosing fast, building a cart, placing a server-priced order,
tracking it, ordering again; restaurant owners managing their menu.

## Direction contract

THESIS: Better Wolt is read like the city's transit system — every restaurant a coloured, numbered line, the city a
departures board, a menu a route of stops, the cart a ticket, the live order an amber LED strip. It refuses the
category default: photo cards in a grid under a rounded search pill with a floating cart button.

OWN-WORLD: Concrete ground #E4E6E1, black ink rules (3 px structure, 1 px elsewhere), square controls with radius 0,
ten saturated line colours that each own one restaurant (never red, never amber), amber #FFB000 on black only for the
live order, error red reserved. Karantina 700 condensed Hebrew at signage scale for names and titles; Noto Sans Hebrew
(87.5 width) for UI, condensed tabular figures for every number. Circles only for route stops and stations.

STORY: The diner sees at once what is on its way (LED strip), what is near and how fast (the board's aligned time and
fee columns), picks a line, rides its route adding stops, checks the ticket's server-set total, and watches the line
map fill until arrival. Owners manage the same route in a neutral, quiet mode.

FIRST VIEWPORT: Home at 1440: LED strip (if an order is on the way) above a panel top bar with a 3 px rule; "לאן
הערב?" in Karantina at ~176 px at the inline start with the search field ("בא לי…", heavy-ruled, 980 px) and five
quick searches beneath; the order-again line chips; the departures board's first rows begin above the fold, each a
line badge, a 4:3 photo, the name at ~60 px and time/fee columns at the inline end. The primary action (search) is the
only filled control.

FORM: Transit wayfinding — Tel Aviv buses, the light rail, LED destination boards and route diagrams; candidate 4 of
the grounded list (the brief pinned three concepts; this one won the dual-agent critique). Seed key 186e194c.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Memorable moment: the route menu — pressing + fills that dish's stop on the line with its count.
Unresolved: mobile tab bar treatment; dark-mode line variants are specified but not yet seen in the product.
