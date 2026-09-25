# Better Wolt V5 — Visual Audit

Evidence for V5: what V4 looked like, what the concept round found, and (as the build proceeds) what each Playwright
and Impeccable pass found and what was done about it. Spec: [V5_DESIGN_SPEC.md](V5_DESIGN_SPEC.md).

## 1. V4 baseline (what V5 moves away from)

From `docs/screenshots/v4/`: a cream paper ground, an aubergine night band across the home hero, pomegranate-red filled
buttons, Suez One display type, rounded white cards with soft shadows, pill chips, a floating aubergine order dock.
Structure: hero band → order-again cards → campaign strip → card grid. Restaurant: rounded photo hero with the name on a
scrim → one rounded list surface with round add buttons → rounded cart card. The V4 audit's own verdict was "identity
sound, structure generic"; V5's brief asks for a different product, so the V4 look is treated as anti-reference.

## 2. Concept round (2026-09-25)

Full scores and the decision are in [V5_CONCEPTS.md](V5_CONCEPTS.md). Findings that bind the production build:

| # | Finding | Source | Carried into |
|---|---|---|---|
| C1 | `h1` followed by `h3` on restaurant and World Cup pages | detector, all concepts | spec §10 heading order |
| C2 | Cart sheets had no visible close control | review, all | spec §5 ticket / dialogs |
| C3 | Adding from another restaurant emptied the cart silently | review, prototype runtime | V5.10 (production keeps a cart per restaurant page; verify, do not regress) |
| C4 | Hebrew prefix glued to a Latin name ("מSmoke…") | review | spec §9 |
| C5 | Long mixed-direction names break badly in display faces | review, all | spec §9 step-down + balance |
| C6 | B: letter badges collide; eight colours do not scale | review | spec §4.1 line number + ten colours |
| C7 | B: noise floor too high (3 px everywhere, loud blocks) | review | spec §4.3 rule weights, §6 order-again chips |
| C8 | B: no photos on phone rows; small thumbnails | review | spec §4.4 |
| C9 | B: blinking LED dot (`pulsing-dot`), overshoot easing (`bounce-easing`) | detector | spec §3.1, §7 |
| C10 | B: "קו מונדיאל" replaced the contract name | review | spec §6 World Cup |
| C11 | B: white at .85–.9 opacity on line colours fails 4.5:1 | detector contrast check | spec §4.1 (opaque text colours only) |
| C12 | B: input focus invisible | review | spec §5 fields, §10 |
| C13 | B: empty search had no way back | review | spec §6 search |
| C14 | C: "N מסעדות פתוחות עכשיו" invented opening hours; eyebrow above the title | review | spec (no claims the API cannot back; no eyebrows) |

## 3. Production passes

### 3.1 Build loop (V5.6–V5.13)

Every screen was built with the loop implement → capture (Playwright, Chrome) → read → fix → capture. Findings fixed
on the way, each in its commit: signed-out phones had lost the sign-in link; a bare grid track pushed a 320 px phone
39 px sideways; the ticket's CTA ran its label and total together; the owner's price range and the ETA ranges
reversed in RTL (LTR-isolated now); the top bar's wordmark rule also hid the footer's; a no-photo row repeated its
line number (thumb plate shows the first word, sized to fit).

### 3.2 QA matrix (V5.15)

| Check | Result |
|---|---|
| 13 routes × 1920/1440/1024/768/390/320 × light/dark, customer, owner, signed out (164 captures) | no overflow, no console errors |
| Hostile restaurant (63-char mixed name + emoji, dead image, 40 dishes, ₪1,000,000 and ₪0, unbroken Latin) | fixed: the price column now grows with a long price |
| Slow (4 s) and failing (500) API on six routes | shaped skeletons, error states with retry; fixed: tracking skeleton no longer sweeps light over black |
| 200 % text, five routes, 390 and 1440 | fixed: 120 px overflow at 390 (LED strip wraps, footer wordmark wraps, logo tile in rem) |
| UI smoke | redirect/return, order (cart ₪131 = server ₪131), World Cup order ₪30, reorder, 401 → /login with notice, owner create/add/edit/delete/close |
| Keyboard | add → stepper "more"; "less" at 1 → "add"; sheet Esc returns focus to the cart bar |
| Checkout problems (intercepted) | 500 and "Product not found in restaurant menu" written on the ticket; price correction explained on tracking |

### 3.3 Second Impeccable pass (V5.17, web)

Dual-agent, as in the concept round. **Detector:** `impeccable detect` on `web-server/client/src` and `index.html`: 0
findings (the scanner was checked against a planted pattern). In the rendered pages (20 runs): 0 overflow, 0 console
errors, 0 contrast failures in either theme (lowest 5.43:1); a real `skipped-heading` on search (and, by the same
rule, all restaurants); footer-note findings and a `dark-glow` shown to be false positives (the note is one padded
line; the glow is the detector's own overlay). **Design review:** 28/40; passes the three-second test against V4
("two different products"); not generic on the core screens.

| # | Finding | Severity | Fix |
|---|---|---|---|
| R1 | Dark mode lost every rule, control border and the focus ring (shorthands on `:root` kept the light ink) | P1 | shorthands declared on `body` |
| R2 | Repeated actions loud: filled reorder on every order, filled stepper +, red trash on every owner row | P1 | reorder outlined + "פרטים" as a link on one row; stepper outlined; delete neutral until focus/hover |
| R3 | Orange line beside the LED amber; static amber on sign-in | P2 | line 3 → lime; sign-in headline and times in board white; checklist removed |
| R4 | Primary hover looked disabled and stuck on touch | P2 | hover only on real pointers, as an inner rule; disabled is a dashed outline |
| R5 | Ticket CTA could fall below the fold | P2 | the panel is capped to the viewport and its lines scroll |
| R6 | Wide-screen proximity (board, menu, phone tracking times) | P2 | name column capped (560 px), menu dish column 60ch, times under stations |
| R7 | Phone: ad too big, two bands on the cart sheet, dead space before the footer | P2 | ad capped; one line-coloured band carries "הסל שלי", restaurant and close; less padding |
| R8 | Template tells: kickers, checklist, giant footer wordmark, orphan World Cup row, two search fields | P3 | section labels visually hidden (still headings); wordmark 56 px; 4/2/1 columns; one search field on /search |
| R9 | Heading order on search and all restaurants | detector | visually hidden h2 above the results |
| R10 | Owner's empty desktop column | review | owner tools become a sticky side panel, the destructive action set apart |

Recaptured after the fixes at 1440 and 390, light and dark: all resolved on screen; keyboard focus visible in dark.
