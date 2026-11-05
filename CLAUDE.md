# Project guide

This code is the approved design. Medha reviewed it screen by screen. Keep the look, copy, colours, motion and layout exactly as they are unless she asks for a change. Do not "improve" the design, rewrite the copy, or swap the stack on your own.

## Files
- `index.html`: home page markup.
- `styles.css`: all styles. Design tokens are at the top in `:root`.
- `content.js`: all portfolio copy in the `DATA` object, carried over word for word from her previous site. Never shorten or drop content.
- `script.js`: everything that moves.
- `tools/`: scripts that generated the hand and eye images. Only needed to regenerate those images.

## How the page works (script.js)
- **Intro:** the sky photo is sampled into an ASCII grid on `#ascii`. It morphs into `assets/adam.png` and `assets/god.png`, sampled as tone fields, and her head appears between the fingertips. Timeline is in `intro(t)`.
- **Home:** seven folders orbit in `placeOrbit()`. The head has z-index 30. Folders use a z-index above it on the front half of the orbit and below it on the back half. `#orbit` must NOT create a stacking context (no perspective, transform, filter or z-index on it), or folders will hide behind the head again.
- **Eyes:** layers are `sclera.png`, then the `.iris` divs moved by `updateEyes()`, then `.lid` for blinks, then `head_top.png` with the eye openings cut out. The drop shadow must stay on its own `#headShadow` layer, or it tints the eyes.
- **Rooms:** each folder opens a full-screen page, routed by the URL hash, built by the functions in `ROOMS`. `dive()` is the folder-to-page transition.

## Hard requirements
- Every string in `content.js` must stay visible on its page.
- Keep `prefers-reduced-motion` behaviour, keyboard access to folders, and a working layout at 390px wide.
- All paths stay relative, so the site works from a GitHub Pages sub-path.

## Still needed from Medha
- Photos for the three Art Reveriez placeholders ("your polaroid", "your bookmark", "your clothing") in `ROOMS.sidequests`.
- The ducks photo link: `DATA.sidequests.ducks.drive` is null, so it shows "Drive link coming soon".
- Optional visuals for the two UI/UX case studies.
- Optional: Sign Language Detector and API call tracing are not on the site yet. Add them only if she provides the content.

## To verify in a real browser
- Fonts (Archivo Black, Schibsted Grotesk, JetBrains Mono) were never seen rendered during design, because the test browser had no network access. Check the headline and report anything that looks off, without changing it.
