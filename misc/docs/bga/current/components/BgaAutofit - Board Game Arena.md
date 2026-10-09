# BgaAutofit

> Source: http://en.boardgamearena.com/doc/BgaAutofit

## Overview

**bga-autofit** is a javascript component that you can use in your game interface to make text fit some fixed-size boxes.

The main usage is to make translated text on game cards fix the dedicated space of the card image.

To see how its work and access examples of source code (via browser dev tools) see
**[Demo](https://x.boardgamearena.net/data/game-libs/bga-autofit/1.x/demo/index.html)**

For comprehensive API docs see
**[Doc](https://x.boardgamearena.net/data/game-libs/bga-autofit/1.x/docs/index.html)**

## Usage

Load the lib:

```js
const BgaAutofit = await importEsmLib('bga-autofit', '1.x');
```

This line should be placed on top of the JS file, before any class declaration.

Legacy way:

```
define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl('bga-autofit', '1.x'),
],
function (dojo, declare, gamegui, counter, BgaAutofit) { // note that the index of `BgaAutofit` must match the index of the define array
```

At the end of your game setup:

```
    BgaAutofit.init();
```

On any HTML element with fixed size that contain text to be fitted into:

```
    <div class="my-class-for-fixed-size bga-autofit">${text}</div>
```

**Note:** If you add a bga-autofit div after the end of the setup, it wil work too! The component use a MutationObserver to detect new elements with this class, and apply the same autofit. Make sure you only call `BgaAutoFit.init();` once!

## Versioning

The lib is using semver, so you can require 1.x to be sure to have the last fixes without risking a breaking change. Any breaking change will be noted on the Changelog section.

## Using with TypeScript

If you use TypeScript and this lib, you can download the **[d.ts](https://x.boardgamearena.net/data/game-libs/bga-autofit/1.x/dist/bga-autofit.d.ts)** file to put in on your game folder to benefit from auto-completion. Depending on the way you build, you might need to remove the last line (the export instruction) to be able to use it.

If your game class is not declared on the define callback, you will need to modify it with this trick (to avoid a "ReferenceError: BgaAutofit is not defined" error) :

```
define([
        "dojo",
        "dojo/_base/declare",
        "ebg/core/gamegui",
        "ebg/counter",
        "ebg/stock",
        getLibUrl('bga-autofit', '1.x'),
    ],
function (dojo, declare, gamegui, counter, stock, BgaAutofit) {
    (window as any).BgaAutofit = BgaAutofit; //trick
    return declare("bgagame.reforest", ebg.core.gamegui, new Reforest());
});
```

## Changelog

**1.0.1**: fix: apply again autofit when an element is made visible

**1.0.0**: Initial version
