# Your game mobile version

> Source: http://en.boardgamearena.com/doc/Your_game_mobile_version

Board Game Arena supports mobile phones and tablets. Most games are already playable on touch devices, but their layout and interactions still need to work on narrow screens.

## Declare your interface minimum width

`game_interface_width.min` is the smallest logical width at which your game remains usable. The default is 740 pixels.

When the available game area is at least this wide, the game is displayed at its normal scale. When it is narrower, `game_interface_width.autoscale` determines how BGA handles the difference. With the default `autoscale: true`, BGA scales the game content down to fit. For example, a minimum width of 740 pixels displayed in 390 pixels of available space is scaled to approximately 53%.

Declare it in **gameinfos.jsonc**:

```
 "game_interface_width": {
     // Smallest usable width. Default: 740
     "min": 540,
 
     // Default: true
     "autoscale": true
 }
```

The declared width must actually work. If you declare 540 pixels, the complete interface must remain usable at 540 pixels.

![MediaWiki-note-icons.png](/images/6/60/MediaWiki-note-icons.png)​**Autoscaling is not a substitute for adapting your interface to narrow screens.** Keep `game_interface_width.min` no larger than the interface genuinely needs. Scaling a large fixed layout down can make text and controls too small and increases rendering work. On iOS, heavily scaled interfaces can contribute to WebKit crashes. Use responsive CSS or narrower layout variants where practical.

Below 490 pixels, player panels may no longer use a two-column mobile layout.

Examples:

- In **Can't Stop**, the dice are moved below the board on narrow screens:

```
 @media only screen and (max-width: 990px) {
     #dicechoices {
         left: 180px;
         top: 530px;
     }
 
     #cantstop_wrap {
         height: 900px;
         width: 550px;
     }
 }
```

- In **Seasons**, panels normally displayed to the right of the board are moved below it:

```
 @media only screen and (max-width: 970px) {
     #board {
         float: none;
         margin: auto;
     }
 
     .seasons_rightpanel {
         margin-left: 0;
     }
 }
```

On mobile, BGA moves player panels above the game and adds `mobile_version` to `#ebd-body`. The desktop layout uses `desktop_version`. Use these classes for layout-specific CSS.

### Autoscale

`game_interface_width.autoscale` controls what happens when the available width is smaller than `game_interface_width.min`. It accepts `true`, `false`, or `"viewport"`. The default is `true`.

#### `autoscale: true`

BGA applies CSS `zoom` to the game content.

The game content scales independently from the surrounding BGA interface:

- the top bar and tableview chat keep their normal size;
- the action bar and player panels use separate framework scaling on very narrow screens;
- standard BGA dialogs and tooltips generally keep their normal size;
- overlays inside the game area inherit the game zoom.

This is the default mode and should suit most fixed-width games.

##### Coordinates and animations

Browsers do not return consistent geometry for elements using CSS zoom. For custom positioning inside the zoomed game area, use:

```js
 const rect = this.getBoundingClientRectIgnoreZoom("my-element");
```

It returns logical, unscaled coordinates. BGA animation and positioning helpers already account for framework zoom.

Use the native `getBoundingClientRect()` when you need the visual position in the browser viewport, such as for an overlay outside the zoomed game area.

#### `autoscale: false`

BGA does not scale the game area.

![MediaWiki-note-icons.png](/images/6/60/MediaWiki-note-icons.png)​**This mode is not recommended.** Disable framework autoscaling only if the game already handles narrow screens itself, either through a fully responsive layout or a scaling system such as [BgaZoom](https://en.doc.boardgamearena.com/BgaZoom "BgaZoom").

A fixed 740-pixel layout displayed in 390 pixels of available space will overflow horizontally and may require scrolling.

#### `autoscale: "viewport"`

This mode presents the whole game through a wider logical viewport. The game area and the BGA interface around it are scaled together, preserving their relative sizes and layout.

This option exists as a compatibility fallback. CSS `zoom` has behaved differently across browsers and has broken coordinate calculations or animations in some older games. Viewport scaling can keep those games working without rewriting their layout.

It also has important drawbacks:

- action bars, player panels, dialogs, and other game-page controls are scaled down with the game;
- text and controls can become very small;
- the layout does not adapt to the available space;
- scaling the entire game document is more expensive to render.

![MediaWiki-note-icons.png](/images/6/60/MediaWiki-note-icons.png)​**This mode is not recommended.** Use it only as a compatibility fallback when CSS `zoom` causes a confirmed problem. Do not use viewport scaling as a shortcut for building a responsive interface.

![MediaWiki-note-icons.png](/images/6/60/MediaWiki-note-icons.png)​**Legacy `default_viewport`**

Some older games set the internal field `default_viewport` directly:

```
 this.default_viewport = "width=740";
```

This undocumented workaround predates the `autoscale` option. It is still supported to avoid breaking published games, but now has the same effect as `autoscale: "viewport"` and takes precedence over the configured mode.

**Do not use it in new code.** Existing games should test removing it and configure scaling through `game_interface_width` instead.

## Touchscreen compatibility

BGA adds `touch-device` to `#ebd-body` when it detects a touchscreen, and `notouch-device` otherwise.

**CSS `:hover`**

Touch devices have no persistent mouse cursor. Some emulate `:hover` after a short touch, which can block the intended interaction. Prefix hover-only rules with `.notouch-device` when they should not apply to touchscreens.

**Tooltips**

Do not make required information available only through hover. Provide a touch-accessible alternative.

**Mouse events**

Do not rely only on mouse-specific events such as `mouseover`. Prefer the [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events), which supports mouse, touch, and pen input.

**Drag and drop**

Common approaches:

- [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
  - Example: <https://codepen.io/VictoriaLa/pen/MWOgYYZ>
  - Game example: Century

- [Native HTML drag and drop](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
  - Example: <https://codepen.io/VictoriaLa/pen/rNGXKxj>
  - Game example: Patchwork

Add `touch-action: none` only to elements where you handle touch or pointer gestures and need to suppress native scrolling or zooming.
