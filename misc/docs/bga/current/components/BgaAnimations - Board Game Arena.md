# BgaAnimations

> Source: http://en.boardgamearena.com/doc/BgaAnimations

## Overview

**bga-animations** is a javascript component to handle different type of animations.

The lib can handle the scale & rotation of the containers when doing the animation (the Dojo animations in the "this" cannot).
It is also Promise-based, so easy to plug-in with the async notification functions.
The lib relies on the Element.animate function.

The game Reversi is an example of usage.

To see how its work and access examples of source code (via browser dev tools) see
**[Demo](https://x.boardgamearena.net/data/game-libs/bga-animations/1.x/demo/index.html)**

For comprehensive API docs see
**[Doc](https://x.boardgamearena.net/data/game-libs/bga-animations/1.x/docs/index.html)**

## Usage

Load the lib:

```js
const BgaAnimations = await importEsmLib('bga-animations', '1.x');
```

This line should be placed on top of the JS file, before any class declaration.

Legacy way;

```
define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl('bga-animations', '1.x'),
],
function (dojo, declare, gamegui, counter, BgaAnimations) { // note that the index of `BgaAnimations` must match the index of the define array
```

In your game setup:

```js
        // create the animation manager, and bind it to the `gameui.bgaAnimationsActive()` function
        this.animationManager = new BgaAnimations.Manager({
            animationsActive: () => this.bga.gameui.bgaAnimationsActive(),
        });
```

Example of usage:

```js
async notif_moveMeeple(args) {
    const meepleDiv = document.getElementById(`player-meeple-${args.playerId}`);
    const destinationDiv = document.getElementById(`table-slot-${args.slot}`);
    await this.animationManager.slideAndAttach(meepleDiv, destinationDiv);
}

async notif_scoreMeeple(args) {
    const meepleDiv = document.getElementById(`player-meeple-${args.playerId}`);
    await this.animationManager.displayScoring(meepleDiv, args.score, this.gamedatas.players[args.playerId].color);
}
```

Look at the demo page and the demo source code for a list of all possibilities!

## Versioning

The lib is using semver, so you can require 1.x to be sure to have the last fixes without risking a breaking change. Any breaking change will be noted on the Changelog section.

## Using with TypeScript

If you use TypeScript and this lib, you can download the **[d.ts](https://x.boardgamearena.net/data/game-libs/bga-animations/1.x/dist/bga-animations.d.ts)** file to put in on your game folder to benefit from auto-completion. Depending on the way you build, you might need to remove the last line (the export instruction) to be able to use it.

If your game class is not declared on the define callback, you will need to modify it with this trick (to avoid a "ReferenceError: BgaAnimations is not defined" error) :

```
define([
        "dojo",
        "dojo/_base/declare",
        "ebg/core/gamegui",
        "ebg/counter",
        "ebg/stock",
        getLibUrl('bga-animations', '1.x'),
    ],
function (dojo, declare, gamegui, counter, stock, BgaAnimations) {
    (window as any).BgaAnimations = BgaAnimations; //trick
    return declare("bgagame.reforest", ebg.core.gamegui, new Reforest());
});
```

## Developer notes

For all elements which will be animated, it is recommended to use CSS class selectors to style them (not, e.g., ID or parent-based selectors). This is because the animations typically clone the element to animate (giving it a new ID), and the DOM parentage may change as well. Symptoms that this address are things like `slideOutAndDestroy` simply causing the element to disappear, or `slideAndAttach` causing the element to "jump" to the destination.

Animating absolutely positioned elements might not behave as expected, rather animate elements from/to container elements (containers can be positioned absolutely).

## Changelog

**1.0.2**: fix error when a parallelAnimation is null

**1.0.1**: Fix documentation

**1.0.0**: Initial version
