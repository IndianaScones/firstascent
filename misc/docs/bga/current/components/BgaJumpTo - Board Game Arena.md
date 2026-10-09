# BgaJumpTo

> Source: http://en.boardgamearena.com/doc/BgaJumpTo

## Overview

**bga-jump-to** is a component to add shortcuts to the different boards of the game.

It should only be used if the game has numerous boards, and it usually doesn't fit in the screen. Showing it with little number of elements on the screen will just pollute the game area uselessly.

The games Akropolis, Knarr, Path of Civilization are examples of usage.

To see how its work and access examples of source code (via browser dev tools) see
**[Demo](https://x.boardgamearena.net/data/game-libs/bga-jump-to/1.x/demo/index.html)**

For comprehensive API docs see
**[Doc](https://x.boardgamearena.net/data/game-libs/bga-jump-to/1.x/docs/index.html)**

## Usage

Load the lib:

```js
const BgaJumpTo = await importEsmLib('bga-jump-to', '1.x');
```

This line should be placed on top of the JS file, before any class declaration.

Legacy way;

```
define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl('bga-jump-to', '1.x'),
],
function (dojo, declare, gamegui, counter, BgaJumpTo) { // note that the index of `BgaJumpTo` must match the index of the define array
```

In your game setup:

```js
        const entries = [
            new BgaJumpTo.Entry(_('Main board'), 'table-center', { color: '#224757', backgroundImage: `url('${this.bga.images.getImgUrl('board.jpg')}')` }),
        ];
        entries.push(...BgaJumpTo.BgaPlayerEntries(this.bga, {
            entryTarget: (playerId, player) => `player-table-${player.no}`,
        }));

        new BgaJumpTo.Manager({
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            entries,
        });
```

Also define `const LOCAL_STORAGE_ZOOM_KEY = '<yourgamename>-folded';` so the user prefered state is stored on his device.

## Versioning

The lib is using semver, so you can require 1.x to be sure to have the last fixes without risking a breaking change. Any breaking change will be noted on the Changelog section.

## Using with TypeScript

If you use TypeScript and this lib, you can download the **[d.ts](https://x.boardgamearena.net/data/game-libs/bga-jump-to/1.x/dist/bga-jump-to.d.ts)** file to put in on your game folder to benefit from auto-completion. Depending on the way you build, you might need to remove the last line (the export instruction) to be able to use it.

## Developer notes

BgaPlayerEntries is customizable to fit your needs.

## Changelog

**1.0.0**: Initial version
