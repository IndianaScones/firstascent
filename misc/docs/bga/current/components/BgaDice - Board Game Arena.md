# BgaDice

> Source: http://en.boardgamearena.com/doc/BgaDice

## Overview

**bga-dice** is a javascript component to display dice.

The lib will handle associated animations (roll animation, moving between stocks).

To see how its work and access examples of source code (via browser dev tools) see
**[Demo](https://x.boardgamearena.net/data/game-libs/bga-dice/1.x/demo/index.html)**

For comprehensive API docs see
**[Doc](https://x.boardgamearena.net/data/game-libs/bga-dice/1.x/docs/index.html)**

## Usage

Load the lib:

```js
const BgaAnimations = await importEsmLib('bga-animations', '1.x'); // the library uses bga-animations so this is required!
const BgaDice = await importEsmLib('bga-dice', '1.x');
```

This line should be placed on top of the JS file, before any class declaration.

Legacy way;

```
define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl('bga-animations', '1.x'), // the lib uses bga-animations so this is required!
    getLibUrl('bga-dice', '1.x'),
],
function (dojo, declare, gamegui, counter, BgaAnimations, BgaDice) { // note that the index of `BgaAnimations` must match the index of the define array
```

In your game setup:

```js
        // create the animation manager, and bind it to the `gameui.bgaAnimationsActive()` function
        this.animationManager = new BgaAnimations.Manager({
            animationsActive: () => this.bga.gameui.bgaAnimationsActive(),
        });

        // create the dice manager
        this.diceManager = new BgaDice.Manager({
            animationManager: this.animationManager,
            type: 'my-game-die',
        });
```

Only setup an animation manager if you don't already have one, else re-use the same one.

Example of usage:

```

        // create the stock, in the game setup
        this.dieStock = new BgaDice.LineStock(this.diceManager, document.getElementById('dice-stock'));
        this.dieStock.addDice(gamedatas.dice); // dice should be something like [{ id: 1, face: 5, location: 'table' }]

async notif_rollDice(args) {
    await this.dieStock.rollDice(args.rolledDice); // similar form as above, but with a different face value.
}
```

Example of usage for a simple d6 die:

```js
in your game.js setup
       // create the dice manager
       this.diceManager = new BgaDice.Manager({
            animationManager: this.animationManager,
            type: 'myverysimpledice',
            setupFaceDiv(die, element, face) {element.innerText = `${face}`;},

       });
       //create the set of dice with one die
        this.diceLineStock = new BgaDice.LineStock(this.diceManager, document.getElementById('mydicetray'));
        this.diceLineStock.addDice([{ id: 1, location: 'table', face: 6}]);

make a roll on a event
onMakeARoll (event) {            
        const dice = this.diceLineStock.getDice();
        dice.forEach(die => die.face = Math.floor(Math.random() * 6) + 1);
        dice.forEach(die => { this.diceLineStock.rollDice(dice);});

in yourgame.css
.myverysimpledice .bga-dice_die-face {color: black; font-weight: bold; text-align: center;}
.myverysimpledice-face-1, .myverysimpledice-face-2, .myverysimpledice-face-3, .myverysimpledice-face-4, .myverysimpledice-face-5, .myverysimpledice-face-6  { border: 1px solid black; line-height: calc(var(--size));background-color: white;}
```

If you want to make a simple custom d6 die, just follow the previous example and change the css by something like

```
//mycustomdice.png is a 300px * 50 px picture of all faces        

.myverysimpledice .bga-dice_die-face {background-image: url('img/mycustomdice.png');}
.myverysimpledice-face-1 {background-position-x: 0px; }
.myverysimpledice-face-2 {background-position-x: 250px; }
.myverysimpledice-face-3 {background-position-x: 200px;}
.myverysimpledice-face-4 {background-position-x: 150px;}
.myverysimpledice-face-5 {background-position-x: 100px;}
.myverysimpledice-face-6 {background-position-x: 50px;}
```

Look at the demo page and the demo source code for a list of all possibilities!

## Versioning

The lib is using semver, so you can require 1.x to be sure to have the last fixes without risking a breaking change. Any breaking change will be noted on the Changelog section.

## Using with TypeScript

If you use TypeScript and this lib, you can download the **[d.ts](https://x.boardgamearena.net/data/game-libs/bga-dice/1.x/dist/bga-dice.d.ts)** file to put in on your game folder to benefit from auto-completion. Depending on the way you build, you might need to remove the last line (the export instruction) to be able to use it.

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

## Changelog

**1.0.2**: more logs for dice element not matching a card / accept keyed objects in addition to arrays on inputs

**1.0.1**: Fix documentation

**1.0.0**: Initial version
