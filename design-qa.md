# Homepage refresh — design QA

## Source and implementation

- Source direction: user-supplied hero and About references in the chat, plus the existing Work header and portfolio styling.
- Implementation: local preview at `http://127.0.0.1:8766/` in the isolated `streaming-hero` worktree.
- Visual inspection: Codex in-app browser screenshots at 320×740, 425×812, 768×900, 1024×768, and 1440×900.

## Checks

- Hero copy, name, and CTA sit to the left of the glitch portrait on tablet/desktop, and stack above it on narrow screens.
- Work is the first main section after Hero; About follows Work. The About and Work headers follow the same content measure as the navigation.
- About uses a white background, black type, a short three-paragraph intro, the existing glitch portrait, aligned biographical details, and a two-category toolkit carousel.
- At 320px and 425px, no horizontal document overflow was detected. The mobile menu opens and an About link closes it and navigates correctly.
- Switching toolkit tabs exposes only the selected category. The project gallery loads 11 images for Digital Illustration, and Escape closes its image viewer.
- `npm run check` passed after the gallery-manifest step was granted isolated-worktree write access.

## Work switcher and admin editor follow-up

- Client and Personal now replace each other in one internally scrollable Work showcase. The active tab is centered above the panel, the counter only tracks visible cards, and `#work-client` / `#work-personal` direct links still select the right panel.
- The Work tabs were checked by pointer and keyboard; the 320px layout has no horizontal overflow.
- The admin editor was checked against a local mock API at desktop, tablet, and 320px. Project and gallery filters worked, the live card preview followed form changes, and the new-project flow exposed an optional cover input.
- Admin testing did not use a real token or mutate live portfolio content. Publishing and R2 upload behavior remain to verify manually with an authorized draft.

## Result

Passed for the implemented UI. Photography content and its distinct layout are still follow-up work; the Work tabs can accept another panel when that layout and data are ready.
