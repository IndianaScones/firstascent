# UX Use Case for Games on Board Game Arena

> Game Dev Guidelines — Board Game Arena
> Converted from `Guidelines_UX.pdf`. Screenshots are summarized in *[Figure: …]* notes.

## Introduction

Before diving into the detailed user cases below, make sure you've read and reviewed the **"Main Concepts"** document. It provides the essential foundations and shared vocabulary needed to fully understand the principles that follow.

The examples and rules presented here range from **simple recommendations** to **mandatory guidelines**. Together, they support our core philosophy: maintaining **consistency**, **clarity**, and **simplicity** across all digital board games. Above all, our goal is that most games should be **instantly playable** on **any device**, offering players a **smooth, intuitive, and enjoyable experience**—whether they're playing on desktop at midnight or taking a quick turn on their phone at lunch.

To ease the validation of your UX/UI, we prepared sections for you to check the pre-requisites for a basic and solid validation before switching your game from ALPHA to BETA, and then RELEASE.

They are ordered in 6 categories:

- A — Layouts
- B — Usability
- C — Design
- D — Feedback
- E — Accessibility
- F — Technical

---

## A — Layouts

### A.1 Layout arrangement

Ideally, your game should be working on a square ratio, giving most (if not all) of the information the active player needs to play its current turn. Using the vertical space, by having users scrolling through the page, will allow users to see more elements of the game that are secondary to the current action, like other players progression, secondary boards, etc.

*[Figure: Layout wireframes.*
- *Desktop: Top bar across the top, then the Action/status bar. The "browser basic display" (first screen) holds the Main board (shared), the Active player board below it, and the Active player cards hand below that. A right-hand column holds Player panels with the Game Log beneath them. Below the first screen is the "extended display zone" (reached by scrolling) with Participant 1 board, Participant 2 board, and an Options bar at the bottom.*
- *Mobile: Top bar, Action/status bar, then Player panels across the full width, then Main board, Active player board, and the cards hand (with a small Game Log button). The extended zone below holds the participant boards and the Options bar.*
- *Also shown: Tablet/4:3 displays (same as desktop, narrower), Widescreen/horizontal mobile (main board and hand on the left, player panels on the right), and Mobile portrait.]*

Make sure that all elements of the game are visible without any additional popups, being able to see any game components you would see on a real table.

It is better for most devices that the whole game is centered to the users, that it fits for large screens, as well as leaving a "no action" margin zone around it (to allow users to deselect, freely click or scroll on their phones).

**Tip:** You can use HTML anchors to improve navigation between elements in your vertical space.

Organize the space smoothly, and don't hesitate to use spacers, whiteblocks with transparency to make sure users understand what are their pieces and how to use them properly.

- **Always accessible:** Score, whose turn, objectives. This information must remain accessible without occupying a permanent place on the main screen. Our requirement is that they can be opened and reviewed easily (e.g., via a button, tab, or panels inside the main game view – and not on the player panels), not that they are always visible. This is to avoid clutter and ensure scalability across different screen sizes, especially mobile devices.
- **Secondary:** Rare abilities, tucked in tooltips.
- **No in-game brandings:** You can use wordings related to the game mechanics, but you should not include logos or extra branding components that are not explicitly part of the game.

> 💡 **Layout mantra:** Central = shared actions, Top/Bottom = global info, Panels = private resources. Stack for mobile, avoid endless scroll.

> **Pro Tip:** Group related info together. Don't scatter "resources" across three corners.

### A.2 Balancing the Actions!

The Action bar is always displaying the current state of the game: whether it's about the turn in progress, a player we are waiting for, or the current action a player can do.

Action bar buttons and icons should not be used alone when something can be done on the displayed components of the board: they are here to shorten or indicate actions.

We want users to play the game like they would in real life, by prioritizing actions on the board. However, there are some actions that can be done through this menu:

- Actions towards a player, for example, can be chosen from there.
- Pass, End turn, validate an important action, and anything time-related.
- Some auction/game-specific phases, such as an action or exchange of resources, which cannot be played from the table components themselves (human interactions).
- Small exchanges too complicated for a specific game space that is not dedicated (like resources).

While it has some pros and cons, the Action bar should never be used as a replacement of the game components' actions.

*[Figure: Action bar examples.*
- *✅ Good: short status lines only, e.g. "You must select an action" and "[Player] must play a card", with "Round: 3/4" shown on the table just below the bar.*
- *⚠️ Acceptable (Wingspan): a status line plus 4 small action buttons and a context arrow.*
- *❌ Bad: bars overloaded with many buttons; round counters inside the bar ("Round 1 of 10"); a whole game board rendered inside the action bar; a multi-row bar with a turn counter, Undo, and four lettered action buttons; cards displayed inside the bar for selection; and a bar containing a row of full text cards.]*

It's possible to have some extra information as long as the Action bar is not overflowing on mobile – try to limit it to a maximum of 4 buttons + context.

**"Round in progress"** information should be displayed on the table itself (like right under the action bar), or eventually as a "flavor text" of an action in progress. (See the ⚠️ example above, currently used in *Wingspan*.)

#### Arranging the actions properly

The **Action Bar** on BGA is sometimes also used by the platform itself — for example, when players are replaying previous moves. Because of this, your game's buttons should never interfere with or override these built-in functions.

When designing your action buttons, think about **priority and placement**:

- **Main awaited actions** should always be **centered** in the Action Bar. These are the actions that drive the game forward (e.g., "Play card," "End turn," "Confirm move").
- **Impossible or unauthorized actions** (greyed out) can be displayed next, as secondary elements, but should not compete visually with the main actions.
- **Cancel, undo, or remove actions** belong on the **right side** of the Action Bar. They should be visually separated from the forward-moving actions to avoid confusion, but not stuck to the BGA's buttons.

*[Figure: Button order, left to right — `Action1` `Action2` `Action3` (blue) · `Action4` (grey, disabled) · gap · `Cancel` (red) · gap · `BGA` (grey, platform button at far right).]*

This layout ensures that the most important action is always **front and center**, while less frequent or negative actions are placed to the side. It matches players' expectations across all BGA games and keeps the flow of play consistent.

About colors and buttons styling, please refer to section **C.3 (Design)**.

### A.3 Player panels

Player panels are an essential part of Board Game Arena: they allow anyone around the table and visitors to understand in a glimpse the details of the game: who is playing, players' color, score (when available) and turn order, as well as resources (components) gained.

The space occupied by player panels depends on 2 things: what is displayed in them, and how many players are involved.

*[Figure: "Welcome To" with 9 players on desktop (panels in a right-hand column) and on mobile (panels stacked across the top). "Castles of Burgundy" with 4 players on desktop and mobile.]*

Considering the automatic spacing occupied by them on different devices, horizontal or vertical, we consider as a rule that a 4-player game displayed on mobile should never occupy more than one fourth of the screen.

This part of the screen should also NOT contain extra settings, redundant or side information (titles, rounds), but it may offer some shortcuts (HTML anchors) to other components displayed on the main screen *(like viewing a specific player panel)*.

### A.4 Popups!

To provide the most effective and fastest way to get into the core of a game (and allow replays to work smoothly), we strongly recommend not to use any kind of automatic popups, which should be reserved for tutorials.

Any popups blocking the game flow are forbidden. During games or replays they can only be used for in-between scorings, rounds or stages, and need to be skippable. If they absolutely need to be used, any click, touch, timed or on-screen action should make them disappear on demand (skippable or timed).

*[Figure: A popup with a close (×) button, surrounded by a highlighted "click-to-close zone" covering the rest of the screen.]*

**Don't forget:** You can add any game-relevant information (for gameplay purposes) into the wiki space, below the game itself. The biggest advantage here is that the content is accessible anytime, without having to worry about blocking navigation, view or opening a new page.

— See "B.2 Usability – Thountip" for more information and use case. *(Reference as written in the original; no section by that name exists in this document.)*

*[Figure: The wiki tabs below a game — "How to play?", "Competition", "Strategy tips", "Options", "Credits", music icon. An empty "Strategy tips" page shows "This page has not been found" with a "Create this page" button.]*

Even if the content is community-driven, there's a huge chance that starting to add game-helpers, useful hints as well as scoring tips would get improved later by the community.

### A.5 Clarity of information and ZOOM

Board Game Arena provides enough **vertical scrolling space** to display all necessary information. This means that instead of relying on zoom, it's almost always better to think carefully about **how to arrange components** so that everything important is visible and legible by default. The responsibility is on the game layout, not on forcing players to zoom in and out.

#### Why avoid zoom buttons?

- They add unnecessary UI clutter.
- They duplicate functionality already built into every browser:
  - **Desktop:** Ctrl + Mousewheel or trackpad gestures.
  - **Mobile:** pinch-to-zoom comes free, without extra coding.
- They often indicate a deeper layout problem — if players *must* zoom to read or interact, then components may not be scaled or arranged correctly in the first place.

#### When zoom might still be useful

There are rare situations where sideways or alternate views are **inevitable** (e.g., large secondary boards, very text-heavy cards, like on *Ticket to Ride*). In such cases, zoom buttons may be allowed, but they must be implemented properly and clearly:

- **+ (plus):** zoom in.
- **– (minus):** zoom out.
- 🏠 **Home/default:** reset to default view.

The **default "home" view** must always show that the game is perfectly playable without zoom. Zooming is only there to **ease specific parts of reading or inspection**, not to make the game functional.

Think of zoom buttons as a **last resort**. First, design your layout so the core game is:

- Fully playable without zoom.
- Legible and comfortably arranged using vertical space.
- Adapted for both desktop and mobile orientations.

If zoom is ever introduced, it should feel like a **convenience feature**, not a requirement.

---

## B — Usability

### B.1 Tooltips

Tooltips can be the most useful components when well-made: they have to give insightful information, translatable text, and can also contain hints about the benefits of using them now or later.

It's also a great way to zoom in on some game components containing text and icons that may be too small to be read in a large game.

- What we prefer is to have some extra content and improvements over the usability of a game component.
- What we don't want is to get the same information displayed twice the same way.

While it could feel right to simply zoom on a card, make sure that the difference between the view on the screen and through the tooltip is big and noticeable enough to be necessary. Otherwise, only displaying relevant information could be more than enough.

*[Figure: Ticket to Ride — hovering the destinations deck shows a short tooltip: "Destinations deck — Click here to take three new destination cards (keep at least one)."]*

On *Ticket to Ride*, tooltips when hovering a card or a deck of cards give clues about the way to use components and their names, while not adding extra distractions.

*[Figure: Altered — hovering a small card on the board shows a large tooltip with the full card art and rules text.]*

On *Altered*, the small card displayed on the contrastingly large board contains a bit of crucial information by default, and hovering it brings a detailed review of all the information a beginning player would need in a tooltip.

**Note:** if a tooltip requires a zoomed element that has little to no difference from the original one already available on the screen, it may mean that either your tooltip, or the way your game is displaying components, may not be of the right scale or size.

Close to half of our players are enjoying the games from mobile phones too: as they don't provide a way to offer "hovering-on-elements" tooltips, they can however "tap" on items. Be sure to close the tooltip when they "tap" away.

### B.2 Forbidden actions

Actions that cannot currently be performed should be shown as greyed out / disabled. This way, players can see that the action exists, but also understand that it is not available at the moment.

However, this only applies when it makes sense. If an action is never relevant in the current context, do not display a disabled button at all. Showing too many inactive buttons clutters the interface and creates unnecessary confusion.

The goal is to strike the right balance: let players know which actions are part of the game, while keeping the UI focused on what they can actually do.

### B.3 Undo, Reset, and Restart Buttons on BGA

Board Game Arena's philosophy is to keep games fast, fluid, and intuitive. Extra validation steps or redundant undo buttons slow the game down and create friction. Players must clearly understand consequences, but this must be communicated within BGA's standard confirmation mechanisms.

Custom flows create divergence that makes it harder to evolve the platform, onboard new developers, and maintain games over time. For that reason, we recommend using Undo, Reset, and Restart controls sparingly — and only when they genuinely improve usability.

#### Why avoid unnecessary Undo?

- An Undo button often signals that the interface is confusing or error-prone. If players regularly misclick, the solution is usually to improve the layout or interaction design, not to add another button.
- Undo buttons multiply validation steps: players select, confirm, undo, then confirm again. This slows the game and adds cognitive load.
- In many cases, a timed confirmation button (e.g., "Confirm move" that disappears after 5–8 seconds if nothing changes) is far more efficient than allowing undos at every step.

#### Preferred patterns

1. **Confirmation instead of Undo**
   1. For impactful, irreversible actions (ending a turn, discarding cards, committing resources), offer a short Confirm button.
   2. Timed or contextual confirmations keep the pace without creating endless "are you sure?" loops.
2. **Undo last move / Restart Turn (avoid spam)**
   1. If the rules allow, let players restart their entire turn once all decisions are made.
   2. You can propose an "UNDO" action, if you can, when a player turn consists of more than 2 actions.
   3. This avoids cluttering the UI with multiple undo buttons for every micro-action. One clean "Restart Turn" is clearer and faster.
3. **Design for Success**
   1. If you need Undo to recover from accidental misclicks, it's a sign the interface could be improved (larger tap targets, clearer highlights, fewer ambiguous clicks).
   2. Undo should be a last-resort safety net, not a primary mechanic.

#### Developer Takeaway

- Use Confirm buttons for critical, final actions.
- Prefer a single Restart Turn option over multiple undo buttons.
- Avoid layering Undo on top of Reset — it leads to over-validation and slows the experience.
- Remember: Undo buttons are often treating the symptom (UI mistakes) rather than the cause (unclear or cramped display).

The goal is always the same: keep the game flowing as fast and smoothly as a real tabletop session.

---

## C — Design

### C.1 Typography, fonts and translations

When it comes to text on Board Game Arena, clarity beats style every time. Players are here to play, not to wrestle with exotic typefaces or unreadable UI choices.

#### Why avoid fancy fonts?

- Decorative or themed fonts may look nice in print, but on screen — especially on mobile — they quickly become hard to read.
- Inconsistent font choices across games break the BGA-wide sense of familiarity.
- Using custom fonts also risks licensing problems or missing character sets for international players.

The base BGA font is more than enough for almost every case. It is legible, tested across devices, and works well with localization. Unless you have a very strong reason (and publisher approval) to introduce a specific typeface, stick to the default.

1. **Legibility first**
   1. Use clean, sans-serif fonts.
   2. Maintain good line spacing and avoid cramming text.
   3. Respect minimum sizes: text must be readable on a small phone screen.
2. **Screen reader support**
   1. Most interactive text elements (buttons, tooltips, labels) should have proper text equivalents.
   2. Do not put critical information inside images without alt-text.
3. **Translations and Language Direction**
   1. All text must be translatable using BGA's built-in translation system. Never embed words into graphics.
   2. Support both LTR (left-to-right) and RTL (right-to-left) languages. Test alignment and mirroring.
   3. Some languages use accents and diacritics (é, ñ, ü, etc.). Ensure your font supports these characters properly.
4. **Consistency**
   1. Use one consistent font across your game. Mixing fonts for "theme" usually confuses more than it helps.
   2. Font color should always respect contrast guidelines (minimum WCAG AA ratio).

#### Developer Takeaway

- Stick to the default BGA font unless there's a compelling reason otherwise.
- Prioritize readability, accessibility, and consistency over theme styling.
- Always prepare text for translation, and make sure it works for both LTR and RTL languages.
- Test with screen readers and on small screens (what looks fine on a 27" monitor may be unreadable on a phone).

The goal is simple: everyone should be able to read, understand, and interact with your game, in any language, on any device.

### C.2 Highlights & Glowing auras

To bring a high quality of interactions for everyone around a game table, it's important to highlight to the current players which options they're offered, and which consequences they will bring to the experience. That's why we should make sure that we correctly display the options offered to players and not have them trying to find "what to click" or "what to do". It must be clear which actions we're awaiting from them.

Fortunately, there are a few options available (and not limited to them) to bring awareness about which move they can do.

**Highlighting an action on the table:**

*[Figure: Examples from several games — dashed yellow outlines marking empty slots where a card can be placed; a selected card raised and outlined in a hand; soft glows around selectable tokens; a highlighted card in a row; dashed orange outlines around every playable card in a fanned hand; selectable tiles in a grid outlined with dashed borders while locked dice show padlock icons; red dashed borders around selectable character cards; blue dashed borders around eligible cards with non-eligible ones greyed out.]*

### C.3 Styling consistency of information

Button colors on BGA are not just a matter of style, they are part of a **shared language** across the entire platform. Players should not have to "relearn" what a blue or red button means in each game.

#### Standard Button Colors

- **Blue** → Advance the action, confirm, move forward.
- **Red** → Cancel or undo an action, stop, or exit.
- **White / Transparent** → Optional or side actions that are not critical to progress.
- **Grey** → Disabled, already completed, or unavailable actions.

#### Developer Takeaway

> Using `statusBar.addActionButton`, it will be `primary` (for blue), `secondary` (for white) and `alert` (for red). The disabled state works for all 3 colors.

This color scheme is **mandatory** for UX consistency. It ensures players always know what to expect, no matter which game they're playing.

#### Other Colors

Any additional colors should come from the game components themselves (cards, tiles, tokens, boards), not the UI buttons. This keeps the interface consistent while still allowing each game's theme to shine.

#### Usernames & Player Colors

- Display usernames in their assigned player color.
- Always ensure high contrast for readability:
  - Use outlines or contours around text (for example, to prevent yellow text from disappearing on a white background).
  - Test player colors against both light and dark backgrounds.

#### Developer Takeaway

Think of button colors as the traffic lights of BGA UX: blue means go, red means stop, grey means unavailable. By following this scheme, you guarantee players spend more time focusing on the game itself and less time trying to interpret the interface.

### C.4 Sizing and Responsiveness

Layouts must feel comfortable on every screen: from a widescreen monitor to a small phone in portrait mode. A good layout eliminates the need for constant zooming, panning, or hunting for components.

#### Centering & Scaling

- The main play area must remain centered on all devices.
- Avoid fixed-width designs — layouts should expand or contract gracefully to fit available space.
- Leave margins around the board for comfort and to avoid misclicks on mobile.

#### Vertical vs. Horizontal Layouts

- **Desktop / Tablet (horizontal):** Prioritize showing the entire board at once when possible.
- **Mobile (vertical):** Stack secondary elements (like other players' panels, discard piles, or extra boards) below the main action zone, so the most important interactions are always at the top.
- Prevent layout breakage when players zoom in/out.
- Do not rely on zoom for legibility — all core components must be readable and usable at 100% scale.

#### Minimum Size

- No interactive element (button, token, card, tile) should be smaller than 32×32px.
  → See E.3 *Tap target for mobile and overall minimum sizes* for more details.

#### Anchors & Navigation

- For vertical layouts, provide HTML anchors or jump-links to quickly move between distant areas (for example: from a player's board to the discard pile).
- This helps avoid endless scrolling, especially in games with large amounts of information.

#### Developer Takeaway

Proposition of an example using a component: https://thoun.github.io/bga-jump-to/demo/index.html

### C.5 Background & extras

A good background sets the stage for your game, but it should never compete with the game itself.

Historically, BGA used a wooden floor texture because it was the only option that kept most games readable. Today, we encourage developers to use more thematic and modern backgrounds (for example, a subtle playing mat look). This not only improves readability but also makes the game visually appealing (add glitter to your life!), especially when featured on streams or promotional showcases.

- **Game first:** The background must never reduce the visibility of components. Always prioritize contrast.
- **Texture over flatness:** Avoid pure flat colors. Slight textures or patterns help the board "sit" naturally in the space.
- **Blurring is your friend:** Don't make the background too sharp or detailed. A touch of blur ensures components remain the visual focus.
- **Atmosphere matters:** A tasteful background can make your game feel premium, even before the first move is played. It's all about textures!

#### Developer Takeaway

Think of the background as the table surface your game lives on, as if you were playing on the game's official playmat, even if it doesn't exist! It should feel natural, thematic, and pleasant, but never so sharp or busy that it distracts from the actual gameplay.

---

## D — Feedback

### D.1 Errors and invalid messages

When a player attempts an invalid action, the interface must always make it clear why it didn't work. Silence or no response is never acceptable.

#### Best Practices

- **Visual feedback:** Use a short shake animation, grey-out effect, or tooltip to signal that the action failed.
- **Error message:** Provide a concise, plain-text explanation such as: "You don't have enough resources."
- **Never leave the player guessing:** Every failed action must give a reason, immediately.
- **Accessible indicators:** Do not rely on color alone (e.g., red). Always pair with icons or text so colorblind users can also understand the error.

#### Developer Takeaway

A failed action should feel just as intentional and clear as a successful one. The player should instantly understand what went wrong and what they need to do next.

### D.2 Game Logs

Logs are the narration of your game. They tell the story of what's happening, why it matters, and how the outcome was reached. Without them, players can feel lost, especially if they step away and come back later, or if they're learning the game for the first time.

- Show every major action (card plays, moves, resource changes, eliminations).
- Use icons, colors, or formatting so that actions can be scanned quickly.
- Any graphic components displayed in the game logs must have an alternative text to display.
- Reduce visual noise: group small simultaneous actions into one-liners.
- Always specify who acted and what changed (e.g., "Raphaël drew 2 cards," not just "2 cards drawn").
- Automated actions (mostly actions triggered automatically when there's no other choice) should be clearly displayed in the logs too.
- For asynchronous games, logs are essential: they let returning players instantly catch up.

#### Examples

✅ **Good in-game entries**
- "Marianna placed [red tile] on [central board] (+2 points)."
- "Alex drew 2 [train cards]."

❌ **Bad in-game entries**
- "+2 points"
- "Card drawn"

Use icons, colors, and formatting to make them scannable at a glance. Their size must not disturb the log reading flow. Avoid walls of text and over-sized graphical components: present logs in short, structured entries that replay the story of the game step by step.

### D.3 Animation

Animations on BGA should support gameplay clarity, not slow it down or turn into decoration. A good animation helps players instantly understand what just happened.

#### Examples of Effective Animations

- Cards sliding into a player's hand.
- Tokens moving across the board.
- Scores incrementing with a smooth count-up effect.

#### Timing Guidelines

- **Regular:** 0.5s — fast enough to be seen, but not blocking the flow.
- **Maximum:** 0.8s — keeps the pace quick and prevents frustration in long games.

#### What to Avoid

- Don't animate trivial or repetitive updates. If a player gains +1 resource fifty times, don't show fifty tiny animations — batch them or summarize with one clear effect.
- Avoid excessive "bouncing," glowing, or looping animations that distract from the game state.

#### Developer Takeaway

Use animation as a visual explanation tool: show what moved, where it went, and why it matters. Keep it short, clear, and meaningful — the goal is to make actions feel smooth and obvious, not to entertain with visual noise.

→ See the BGA animation library: https://en.doc.boardgamearena.com/BgaAnimations

### D.4 Sound effects

Sound can be a great way to reinforce feedback (a card flip, a token dropping, or a short victory fanfare). But on BGA, sound should always support the experience without becoming a distraction. We have default sounds that are linked to default actions (moving tokens, shuffling cards) and users can select their default sound options on their profile. Thus, it can be a nice final touch to add a specific, theme-oriented subtle sound to a specific action.

#### Rules for Using Sound

- **Volume:** Use a volume level lower than the BGA default. Never surprise players with loud audio.
- **Non-intrusive:** Do not add long, looping soundtracks during gameplay. Keep sounds short, sharp, and purposeful.
- **Never sound-only:** Sound effects must always be paired with a visual cue (animation, highlight, etc.). No action should rely solely on audio to be understood.

#### Developer Takeaway

Think of sound as a bonus layer of clarity and delight, not a requirement. A good sound makes an action feel crisp and satisfying, but the game must remain fully understandable even in complete silence.

---

## E — Accessibility

### E.1 Design for all

Accessibility is not an add-on — it's part of making your game playable and enjoyable for everyone. Good accessible design also improves clarity for all players, not just those with specific needs.

#### Core Guidelines

- **Don't rely on color alone.** Always pair colors with icons, textures, or shapes so that players with color vision deficiencies can still distinguish components.
  → See E.2 *Colorblind-safe design* for more information.
- **Use proper contrast.** Follow a minimum contrast ratio of 4.5:1. Text should always be readable whether it's light on dark or dark on light.
- **Keep animations safe.** Avoid flashing or rapidly alternating visuals, which can be disorienting or even harmful for some players.
- **Label everything.** Buttons, icons, and interactive elements should include clear text labels or tooltips so that screen readers can interpret them.
- **Make differences obvious.** Do not depend on fine details, subtle shading, or slight color variations to differentiate pieces. Use bold shapes, clear outlines, and strong contrast instead.

#### Developer Takeaway

If a player can't easily tell two pieces apart, read the text without strain, or understand what an icon does, then the design needs adjustment. The goal is simple: everyone should be able to play comfortably, regardless of their vision, device, or tools.

### E.2 Colorblind-safe design

Color should never be the only way to tell elements apart. Every game component that relies on color must also have a secondary identifier so all players can clearly distinguish it.

#### Using Icons and Shapes

- **Pawns or tokens:** Add unique shapes, symbols, or outlines to each color.
- **Cards or suits:** Place small icons in the corners or add patterns so they can be recognized without relying on hue.

#### Contrast and Visibility

- All text and icons must meet WCAG AA contrast levels to ensure readability across screens.
- Use outlines, borders, or contrasting strokes for player colors, so names and pieces remain visible on both light and dark backgrounds (e.g., avoid yellow text vanishing on white).

#### Developer Takeaway

Always assume that some players will not perceive color differences. By adding icons, shapes, and strong contrast, you ensure that everyone can play comfortably and confidently.

### E.3 Tap target for mobile and overall minimum sizes

*(This section appears twice, identically, in the original PDF; it is included once here.)*

On BGA, every interactive element must be large enough to tap or click comfortably, especially on mobile devices.

#### Guidelines

- **Minimum size:** 32×32px.
- **Ideal size:** 40–44px, which greatly reduces mis-taps on touchscreens.
- **Spacing:** Leave enough room between buttons, tokens, or cards so players don't accidentally hit the wrong one.
- **No tiny clusters:** Avoid cramming small icons together. If you need many options, group them inside expandable menus or secondary panels.
- **Scaling:** When space runs out, allow scrolling areas instead of shrinking components until they're unusable.

#### Developer Takeaway

Bigger is better for usability. A clear, well-spaced layout prevents misclicks, keeps the game flowing, and makes play on mobile as smooth as on desktop.

### E.4 Settings and customization

On BGA, all game settings must be placed in the standard settings menu. This rule is essential for consistency: when players learn how to adjust settings in one game, they immediately know how to do it in every other. It also simplifies support and long-term maintenance.

Some older titles still use custom menus, but the platform is steadily enforcing the standard to improve usability and flexibility for everyone.

- Always integrate into BGA's global settings interface to ensure consistency, reduce player confusion and allow better maintenance/evolution of the platform in the long term.
- Provide per-game options only where relevant, such as:
  - Animation speed (activated / none).
  - Tooltip detail (compact / full).
  - Sound effects (on / off).
- Reuse existing BGA controls whenever possible — never duplicate custom UI for settings.

#### Developer Takeaway

Keep settings simple, consistent, and in the same place for all games. This way, players focus on the game itself rather than relearning how to manage preferences every time.

---

## F — Technical

### F.1 Endgame & Replays

Endgame logs must clearly summarize all the major actions that led to the outcome. Logs will remain accessible after the game through the archived replay, so players can revisit the match at any time.

Replay Mode allows players to revisit the game step by step, and it must feel as clear as the live session.

#### Key requirements

- **No blocking popups** → replays should flow smoothly without interruptions.
- **Animations must be compatible** → they should play at a minimum speed and be skippable.
- **Logs and highlights must stay in sync** with each replayed action.
- **Final scoring, transitions, and highlights** must display correctly, giving the same level of information and satisfaction as in the live game.

This is the climax of the game, building up suspense before revealing the winner... Don't make it too quick! :)

**Pay off:** Value the time spent on your game and have players trust the scoring. Adapt the live scoring and end screen animation to the overall game length (a huge pay-off when you played a week-long game can be very warming, whereas a short luck-based game of 2 minutes can just drop the final score right at the end).

→ To achieve this, you can use synchronous notifications for each step of the scoring to slow down the process, and use `this.displayscoring` (link in original) to display a nice points animation in the color of the player over the element of the game granting points for this step of the scoring.

#### Developer Takeaway

Together, Logs and Replays form the memory of the match. Logs explain what happened, while Replays let players relive it. Done right, they ensure that the end of the game feels fair, understandable, and even worth revisiting.

### F.2 Refresh & Continuity

On BGA, players may refresh their browser at any time — intentionally or due to connection issues. Your game must handle this gracefully, without breaking or losing state.

#### Requirements

- **Consistent reload:** After a refresh, the game should return to the exact same state as before, with no missing or corrupted information.
- **Restore highlights:** Temporary UI indicators (such as whose turn it is, pending actions, or selected components) must be restored automatically.
- **Server as the source of truth:** Never rely on client-only memory for critical state. All essential information must always be available from the server.
- **Expect reconnections:** Do not depend on "session continuity hacks." BGA servers may disconnect and reconnect players at any time — your game should treat this as normal behavior.

#### Developer Takeaway

A refresh should feel invisible to the player. If the game doesn't come back exactly as they left it, something is wrong in the implementation.

### F.3 Errors and handling them

Network hiccups and invalid inputs are inevitable. What matters is how your game responds: errors must be handled gracefully so the game stays stable for everyone.

#### Requirements

- **Handle disconnects smoothly:** Anticipate delays, disconnects, or dropped actions without breaking the game flow.
- **Fail safe:** Invalid inputs should never crash the game or leave it in a corrupted state.
- **Clear feedback:**
  - For developers → provide precise error details in the console.
  - For players → display short, friendly messages that explain what went wrong and what to do next.
- **No raw exceptions:** Never expose raw server logs or technical stack traces to end users.
- **Contain the error:** Error handling should isolate the problem to the affected action — never block the entire table because of one failed request.

---

## Conclusion

Creating a smooth and satisfying user experience on **Board Game Arena** requires more than just implementing game rules; it involves thoughtful design choices that **guide, support, and delight players** from start to finish.

By following the UX best practices outlined in this guide, developers can ensure their games are:

- **Easy to learn**, thanks to clear onboarding and tooltips
- **Engaging and fluid**, with responsive interactions and helpful feedback
- **Accessible**, across devices and for a broad range of players
- **Visually clear**, with well-organized layouts and intuitive iconography
- **Enjoyable to finish**, through thoughtful endgame summaries and celebratory polish

Ultimately, great UX enhances not only how a game feels, but how often players come back to it and recommend it to others. On a platform like BGA, where competition for attention is high and session lengths vary, **frictionless design can be the difference between a quick quit and a long-term favorite**.

We encourage all developers to **observe players, gather feedback, and iterate continuously**.

You can find on BGA a lot of games that probably have similarities to the one you're working on: feel free to check them, play them, challenge them and get inspired by them. There are a lot of hints and multiple ways to make your game shine.

Treat UX as a key part of the game's design, not an afterthought, and your players will reward you with engagement, praise, and repeat play.

**Release is just the beginning:**

- **Alpha:** usability feedback first.
- **Beta:** listen to the crowd — confusion spots = redesign spots.
- **Iterate:** small UX tweaks = big retention gains.
- **Watch metrics:** if players stall at a phase, that's your design flag.

---

## Pre-release Checklist

*Version 1.0.0 — Oct 10, 2025*

| No. | To check | Done |
|---|---|---|
| 1 | Layout centers and scales on all devices. | ☐ |
| 2 | Action Bar ≤ 4 buttons, never replaces components. | ☐ |
| 3 | Tooltips: clear, translatable, useful. | ☐ |
| 4 | Buttons follow BGA standards (blue = forward, red = cancel). | ☐ |
| 5 | No blocking popups mid-game. | ☐ |
| 6 | Animations: quick, smooth, informative. | ☐ |
| 7 | All tap/click targets ≥ 32px. | ☐ |
| 8 | Colorblind-safe icons in place. | ☐ |
| 9 | Endgame shows breakdown + replay option. | ☐ |
| 10 | Game state restores cleanly after refresh. | ☐ |
