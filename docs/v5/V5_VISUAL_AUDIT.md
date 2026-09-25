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

*(Filled in as V5.6–V5.17 land: per-screen capture rounds, the hostile-content and failure matrix, and the second
Impeccable pass with its before/after.)*
