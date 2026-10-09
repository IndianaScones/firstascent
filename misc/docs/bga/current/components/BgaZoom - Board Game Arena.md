# BgaZoom

> Source: http://en.boardgamearena.com/doc/BgaZoom

## Overview

**bga-zoom** is a component to add zoom controls on your game area.

It also includes an autoscale feature, to automatically zoom out on game load so the requested width fits on the screen size.

The game Azul: Queens garden is an example of usage.

To see how its work and access examples of source code (via browser dev tools) see
**[Demo](https://x.boardgamearena.net/data/game-libs/bga-zoom/1.x/demo/index.html)**

For comprehensive API docs see
**[Doc](https://x.boardgamearena.net/data/game-libs/bga-zoom/1.x/docs/index.html)**

## Usage

Load the lib:

```js
const BgaZoom = await importEsmLib('bga-zoom', '1.x');
```

This line should be placed on top of the JS file, before any class declaration.

Legacy way;

```
define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl('bga-zoom', '1.x'),
],
function (dojo, declare, gamegui, counter, BgaZoom) { // note that the index of `BgaZoom` must match the index of the define array
```

In your game setup:

```
        new BgaZoom.Manager({
            element: document.getElementById('full-table')!,
            zoomControls: {
                color: 'black',
            },
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            autoZoom: {
                expectedWidth: 1600, // for the main board to fit
                minZoomLevel: 0.25,
            },
        });
```

Also define `const LOCAL_STORAGE_ZOOM_KEY = '<yourgamename>-zoom';` so the user prefered zoom level is stored on his device.

## Versioning

The lib is using semver, so you can require 1.x to be sure to have the last fixes without risking a breaking change. Any breaking change will be noted on the Changelog section.

## Using with TypeScript

If you use TypeScript and this lib, you can download the **[d.ts](https://x.boardgamearena.net/data/game-libs/bga-zoom/1.x/dist/bga-zoom.d.ts)** file to put in on your game folder to benefit from auto-completion. Depending on the way you build, you might need to remove the last line (the export instruction) to be able to use it.

## Developer notes

The scaled game area is scaled using CSS zoom. Old dojo animations are not compatible with it, but bga-animation lib is.

## Changelog

**1.0.2**: fix default state if at min/max

**1.0.1**: handle light/dark theme

**1.0.0**: Initial version
