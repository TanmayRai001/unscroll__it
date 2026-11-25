# Lifelines: design handoff

> Full background and every decision so far: see `PROJECT_CONTEXT.md`. Read that first.

A life-choice simulator: one person, one dilemma, two lives played out side by side with the same luck.

## Chosen direction
- **Opening page** (`mockups/6-hero-stories.html`): a 3D perspective stream of life-story cards.
  Scroll to browse, hover reveals the two choices (A / B), click opens the story.
- **Main view** (`mockups/5-lifelines-3d.html`): the "Lifelines" map as a 3D glass scene.
  Glass tubes on a tilted glass table, the shared line forks at the dilemma, each line runs
  into its own world (Tokyo towers vs hometown houses), floating glass story cards, an "age now" slice.
- `mockups/explorations/` holds the earlier style options (transit map, risograph, newspaper, cinematic).

## Next step: make the opening page premium (not "AI slop")
The card artwork is currently drawn in code (silhouettes). Replace it with real cinematic photography:
1. Use the **Creative Claw** plugin to generate 12 portraits in one consistent film-still style,
   one per story in `S` inside `6-hero-stories.html` (Maya: Tokyo street at night; Arjun: musician on stage;
   Lena: window light, home office; Sam: woodshop; Zara: airport window; Kenji: older man, quiet light;
   Priya: window, monsoon light; Omar: office at night; Elena: olive grove at sunset; Theo: rooftop with a friend;
   Ama: train window; Ravi: restaurant kitchen at night).
2. Redesign rules: no violet or purple; warm film-noir palette (near-black, warm white, one amber accent);
   full-bleed photos with grain, no glows or outlines; editorial serif headings and small mono labels;
   one entrance animation on load, a 2-3% photo zoom on hover, a smooth open on click.
3. Render a screenshot and a short video (`rec6.js` shows how, using Playwright).

## Environment notes
- Network allowlist now includes `app.creativeclaw.co`, `clerk.creativeclaw.co`.
- Creative Claw needs a sign-in (Customize, Plugins, Creative Claw, Connectors tab, Connect) from a session
  that started after the network change.
