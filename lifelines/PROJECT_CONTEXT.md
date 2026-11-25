# Lifelines: full project context

Read this first in any new session. It is everything decided so far.

## 1. The idea
A website where you compare life choices. A simulated person with set traits lives through a life.
At a major dilemma the simulation splits into two runs, one per choice, and the two lives play out
side by side with different circumstances. The user sees how one decision changes a whole life.

## 2. Simulation design (agreed suggestions)
- **Character model:** 6-8 traits. Fixed traits (risk tolerance, ambition, introversion,
  conscientiousness, family background, health baseline). Changing stats (money, health, happiness,
  career, relationships, skills, stress). Show only 4-5 stats on screen: Wealth, Happiness, Health, Love.
- **Same luck for both branches:** run both lives with the same random seed so the only difference is
  the decision, not randomness.
- **Dilemmas as data, not code:** each dilemma is an object with an age range, requirements, a prompt and
  two options, each with effects and `unlocks` (branch-specific later events). Example:
  ```js
  { id: "abroad_job", ageRange: [24, 32], requires: { career: ">=2" },
    prompt: "You're offered a job in another country.",
    options: {
      A: { label: "Move abroad", effects: { money: +2, relationships: -2, stress: +1 }, unlocks: ["expat_life"] },
      B: { label: "Stay", effects: { relationships: +1 }, unlocks: ["hometown_promotion"] } } }
  ```
- Effects depend on traits (moving abroad suits a risk-taker, drains an introvert).
- **Delayed consequences:** choices plant seeds that trigger events 5-10 years later.
- **Modes:** (1) single fork MVP, (2) "what if I'd chosen differently" rewind, (3) Monte Carlo
  (run each choice 1,000 times, show ranges like "70% end up wealthier"), (4) users enter their own traits/dilemma.
- **AI for narration only:** the engine stays rule-based and deterministic; an LLM turns numbers into story text.
- Avoid preachiness (no always-correct choice), too many stats, and claiming realism (add a light disclaimer).
- **MVP:** one preset character, ages 18-70 in yearly ticks, ~10 dilemmas, one forced fork, 15-20 random events,
  split view with 4 stat lines and an end summary. Plain HTML/JS, no backend (the repo is plain HTML/JS).

## 3. Example story used in all mockups
Maya Okafor, born 2001, curious, cautious, loyal. At 24 she is offered a design job in Tokyo.
- **Line A, Tokyo (went):** 26 lead designer · 29 breakup · 33 own studio in Shibuya · 38 burnout (delay) ·
  45 studio sold ("I missed a lot of birthdays.")
- **Line B, Hometown (stayed):** 25 opens a bakery (grandma's sourdough) · 28 marries Sam ("He proposed with a
  cinnamon roll.") · 31 daughter Ada · 35 bakery nearly closes, town rallies · 45 second shop ("No regrets. Just flour everywhere.")
- At 45: Wealth A 82 / B 47 · Happiness 58 / 79 · Health 61 / 72 · Love 40 / 88. Seed #4127.

## 4. Design journey (what the user liked and rejected)
- Styles discussed: 3D inflated (rejected: toy-like, trivialises life events, heavy), Bauhaus, mid-century
  modern, water/liquid glass (good only with a "river of life" metaphor).
- Four directions mocked up (`mockups/explorations/`): transit map "Lifelines", risograph "Two Inks",
  newspaper "The Other Edition", cinematic "Two Reels".
- User said the flat transit map was **too basic** and asked for **glass, 3D and depth with a story feel**.
  Result: `mockups/5-lifelines-3d.html`: glass tubes on a tilted glass table with real perspective, glass marble
  stations, floating frosted story cards with quotes, each line running into its own world (Tokyo towers vs
  hometown houses), an "age now" glass slice, a "Ride both lines" button, stats panel at the bottom.
- User shared a screen recording of a 3D gallery ("scroll to surf, click to open": cinematic image cards
  receding diagonally in perspective) and wanted it as the **opening page showing different stories**.
  Result: `mockups/6-hero-stories.html` (+ `.mp4` demo): "Every life has a fork." 12 story cards in a 3D
  stream, scroll to browse, hover shows the two choices (A/B) split by a glowing seam, click opens the story
  with "Enter both lives →". Bug fixed: the `.track` layer needed `pointer-events:none` so deeper cards are clickable.
- User's latest feedback: **"don't make it look like AI slop; more realistic, premium, better, interesting."**
  The card art is drawn in code (silhouettes) and must be replaced by real cinematic photography.

## 5. The 12 stories on the opening page
Maya 24 (Tokyo job or stay home) · Arjun 18 (medicine or music) · Lena 31 (child now or company first) ·
Sam 40 (quit the bank to build furniture) · Zara 22 (marry first love or travel alone) · Kenji 55 (retire or one
last project) · Priya 27 (move back for her parents) · Omar 35 (sell the app or keep going) · Elena 19
(university or the family farm) · Theo 29 (tell his best friend how he feels) · Ama 45 (start over in a new
country) · Ravi 33 (bet savings on a restaurant). Data lives in the `S` array in `6-hero-stories.html`.

## 6. Premium redesign rules (next step)
- No violet or purple anywhere (the most common "AI slop" colour). Warm film-noir palette: near-black,
  warm white, one amber accent (#E9C27A family). The Lifelines map's coral (#FF8A5C) and green (#3DFFC0)
  remain the A/B line colours.
- Full-bleed real photos with film grain; no glows, outlines or drawn figures on cards; no captions under images.
- Editorial serif headings (Instrument Serif) + small mono labels (JetBrains Mono) + Inter for UI.
- Motion: one entrance animation on load, 2-3% photo zoom on hover, card lifts slightly, smooth open on click
  (no pop-up box feel). No tilt, no scroll-jacking.
- Photos: generate with **Creative Claw** (image/nano-banana-2), one consistent film-still style for all 12,
  e.g. "35mm cinematic film still, shallow depth of field, warm practical lighting, grain" + each story's scene:
  Maya on a Tokyo street at night; Arjun on stage under lights; Lena by a window in a home office; Sam in a woodshop;
  Zara at an airport window; Kenji, older man in quiet light; Priya by a window in monsoon light; Omar in an office at
  night; Elena in an olive grove at sunset; Theo on a rooftop with a friend; Ama at a train window; Ravi in a
  restaurant kitchen at night.

## 7. Environment and accounts
- Branch: `claude/life-choice-simulator-4k80oa`. GitHub push works.
- Network allowlist on the Default environment: `app.creativeclaw.co`, `clerk.creativeclaw.co`,
  `unsplash.com`, `images.unsplash.com` (Unsplash refuses automated downloads; don't rely on it).
- **Creative Claw is connected but the account had 4 credits; one nano-banana-2 image costs ~12 credits.**
  12 portraits need ~144 credits. Buy credits (`get_credits_link`) or use a cheaper model after checking
  `list_models` / `estimate_generation`. Always ask the user before spending credits.
- Playwright + Chromium are preinstalled; `mockups/rec6.js` shows how to screenshot and record a demo video.

## 8. Next steps
1. Get enough Creative Claw credits (or a cheaper model), generate the 12 portraits, save them in `lifelines/img/`.
2. Rebuild the opening page with the photos and the premium rules; send a screenshot and a short video.
3. Then build the real app: simulation engine (traits, dilemmas, same seed for both lives) → the 3D glass map
   drawn from simulation data → clicking a story card enters both lives; "Ride both lines" animation.
