# DESIGN.md — Pradyumn Awasthi portfolio

## Concept
**"The Builder" — a graphic novel printed on newsprint, about someone who designs learning games, 3D simulations and AI tools, then ships them.**
Comic language (panels, gutters, halftone, lettering, SFX) carries the personality. The *content* stays professional: real projects, real numbers, real links. Comic is the wrapper, never the claim.

The old site borrowed Spider-Man / Batman / Deadpool. This one keeps the comic-book energy but drops licensed characters: an original hero (the builder) and original marks, so it is safe to share with recruiters and clients.

## Colour tokens
| Token | Value | Role |
|---|---|---|
| `--paper` | `#F1E9D8` | page base (newsprint, never pure white) |
| `--paper-2` | `#E7DCC5` | alternate panel fill |
| `--ink` | `#16130F` | text, panel borders, the "night" panels |
| `--ink-2` | `#4A443B` | secondary text on paper (≥ 7:1 on paper) |
| `--red` | `#E5371C` | **the one accent** — CTAs, SFX, active state. Buttons carry ink text or paper text ≥ 4.5:1 |
| `--yellow` | `#F7C531` | highlighter only: marks a key phrase or a number, nothing else |

Dark "night" panels invert paper/ink; red stays.

## Type
- **Display:** Archivo, variable `wdth` 62–125 and `wght` 100–900. Headlines run condensed and black (wdth 62, wght 900), tight tracking, sentence case, and widen on hover.
- **Lettering (SFX and speech bubbles only):** Bangers. It never appears in headings or body text.
- **Body:** Schibsted Grotesk 400/500/700, a newspaper-born grotesk with a 1.6 line-height.
- **Data:** JetBrains Mono, used only for numbers, file sizes, stacks and issue numbers.

## Layout
- 12-column grid, max 1320px, 24px gutters (the "gutter" is literal: panels sit in a gutter of paper).
- Panel borders are 2.5px of ink. Hard offset shadows appear only on interactive things (buttons, covers), never on static text blocks.
- Every section uses a different structure:
  1. **Hero:** split headline with a live WebGL halftone scene.
  2. **Proof strip:** caption boxes.
  3. **Featured issues:** pinned horizontal track of covers.
  4. **The strip:** a 4-panel comic told from a real build log.
  5. **Archive:** a ledger with a cursor-following preview.
  6. **Mission log:** a two-column timeline.
  7. **Origin:** a halftone photo panel.
  8. **Signal:** a giant closing panel.

## Motion
| Moment | Technique | Easing / duration |
|---|---|---|
| Hero name | SplitText chars rise from mask, then the `wdth` axis animates 125→62 | expo.out 1.1s |
| Hero 3D | toon + screen-space halftone shader; light follows the pointer; objects bob | sine, continuous |
| Proof numbers | counters, once | power3.out 1.4s |
| Featured covers | pinned horizontal scrub ≥ 900px; wraps to a vertical stack below | linear scrub |
| Comic strip | panels ink in one by one, and SFX stamp in with back.out (physical object) | back.out(2) 0.5s |
| Archive preview | `quickTo` follow; image clip-path wipe | power3 0.45s |
| Buttons | magnetic `quickTo`; press = translate into its shadow | power3 0.3s |

`prefers-reduced-motion`: no Lenis, no pins, no scrub, and a static WebGL frame (or poster). All content is visible without JS.

## Voice
- First person, plain, specific: "A 46-screen bilingual lesson with 527 voice clips in each language."
- Comic flourishes are allowed in SFX and micro-labels ("THWACK!" on copy-email), never in the facts.
- Every number comes from a repo README.

## Never use
Licensed characters or logos • gradient text • glassmorphism • purple→cyan gradients • blurred orbs • emoji icon tiles • centred label→H2→subtitle→card grid repeated • Inter / Roboto / Poppins • fake round metrics • sound that plays without opt-in • custom cursor that hides the real one.
