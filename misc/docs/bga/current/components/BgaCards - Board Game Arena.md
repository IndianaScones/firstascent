# BgaCards

> Source: http://en.boardgamearena.com/doc/BgaCards

## Overview

**bga-cards** is a javascript component to display cards.

The library will handle associated animations (moving between stocks, flipping or rotating the cards).

The game Frenchtarot is an example of usage (with JS), or Verso (with TypeScript).

Also <https://en.doc.boardgamearena.com/Tutorial_hearts> is now using bga-cards for tutorial game implementation.

To see how its work and access examples of source code (via browser dev tools) see
**[Demo](https://x.boardgamearena.net/data/game-libs/bga-cards/1.x/demo/index.html)**

For comprehensive API docs see
**[Doc](https://x.boardgamearena.net/data/game-libs/bga-cards/1.x/docs/index.html)**

## Usage

Load the library:

```js
const BgaAnimations = await importEsmLib('bga-animations', '1.x'); // the library uses bga-animations so this is required!
const BgaCards = await importEsmLib('bga-cards', '1.x');
```

This line should be placed on top of the JS file, before any class declaration.

Legacy way;

```
define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl('bga-animations', '1.x'), // the library uses bga-animations so this is required!
    getLibUrl('bga-cards', '1.x'),
],
function (dojo, declare, gamegui, counter, BgaAnimations, BgaCards) { // note that the index of `BgaAnimations` must match the index of the define array
```

In your game setup:

```js
        // create the animation manager, and bind it to the `gameui.bgaAnimationsActive()` function
        this.animationManager = new BgaAnimations.Manager({
            animationsActive: () => this.bga.gameui.bgaAnimationsActive(),
        });

        // create the card manager
        this.cardsManager = new BgaCards.Manager({
            animationManager: this.animationManager,
            type: 'mygame-card',
            getId: (card) => card.id,
            setupFrontDiv: (card, div) => {
                div.style.background = 'blue';
                this.bga.gameui.addTooltipHtml(div.id, `tooltip of ${card.type}`);
            },
        });
```

Only set up an animation manager if you don't already have one, otherwise re-use the same one.

Example of usage:

```
    setup: function (gamedatas) {
        // ...

        // create the stock, in the game setup
        this.cardStock = new BgaCards.LineStock(this.cardsManager, document.getElementById('card-stock'));
        this.cardStock.addCards(gamedatas.cards); // cards should be something like [{ id: 1, type: 3, type_arg: 2, location: 'table', location_arg: 0 }] 
      
   }
   notif_revealNewCards: async function(args) {
        await this.cardStock.addCards(args.newCards); // similar form as above
   }
```

Look at the demo page and the demo source code for a list of all possibilities!

To see the source code with all the examples - use browser developer tools - source tab (from demo link).

## Random Observations

### Sprite Markup

If you use the stock component, the card images won't work out of the box, you have to add sprite markup manually, it can be done easily in the card manager constructor:

```js
       setupFrontDiv: (card, div) => {
          // ...
         div.style.backgroundPositionX = `calc(100% / 14 * (${card.type_arg} - 2))`; // 14 is the number of columns in stock image minus 1
         div.style.backgroundPositionY = `calc(100% / 3 * (${card.type} - 1))`; // 3 is the number of rows in stock image minus 1
```

If you prefer to use your own CSS, you can mark it up with data attributes instead (and do the positioning using CSS):

```js
       setupFrontDiv: (card, div) => {
         div.dataset.type = card.type; // suit 1..4
         div.dataset.typeArg = card.type_arg; // value 2..14
```

### Card faces

This component supports two-faced cards, so you can do flip animations (mostly). To take advantage of that you have to define the card back also using setupBackDiv in the manager.
Beware that the function that defines what face is up is actually called isCardVisible (which is not confusing at all), and you redefine it to return a function which determines the side dynamically.
By default this function is defined as:

```js
  isCardVisible: (card) => card.type
```

which is also super non-intuitive. I suggest always defining a custom function for this (which will likely just be isCardVisible: () => true), except for something like BgaCards.Deck.

### Void Stock

As of 1.0.7 VoidStock still lacks some animations such as shrink and fadeOut, however the same can be achieved without VoidStock by just providing animation settings in removeCards methods, i.e.:

```
     await this.lineStock.removeCards(cards, {
       fadeOut: true,
       slideTo: $(`otherhand_${playerId}`),
     });
```

### Type casting from PHP Deck

You would think you can just use the database method to get cards from Deck and send this to the UI and use it in bga-cards? No, it's not that easy.

Some of the bga-cards methods, most notably BgaCards.sort, assume fields (such as 'type') are integers, but if sent by PHP, they are strings (even worse, sometimes strings and sometimes integers).
If this is the ONLY problem (i.e. sort) you can get away by making your own sort function, otherwise you would have to make an object converter and apply it to all objects sent from notifications and getAllDatas.
See the hearts tutorial for helper method examples (i.e. find the method remapToBgaCard).

### Asynchronicity

It's not immediately obvious but many functions that add or remove cards are async (i.e. return Promise), that means not only do you have to wait (or chain) them if running one after another, you also have
to be aware of residual effects of promises when using these methods in setup(), onEnteringState() and so on.
For example addCards is async while setSelectableCards is not. So if you add cards to your "hand" in the setup method, and try to set what is selectable in onEnteringState - that won't work properly,
unless you also promisify the call to setSelectableCards using setTimeout.

## Versioning

The library is using semver, so you can require 1.x to be sure to have the latest fixes without risking a breaking change. Any breaking change will be noted in the Changelog section.

## Using with TypeScript

If you use TypeScript and this library, you can download the **[d.ts](https://x.boardgamearena.net/data/game-libs/bga-cards/1.x/dist/bga-cards.d.ts)** file to put in your game folder to benefit from auto-completion. Depending on the way you build, you might need to remove the last line (the export instruction) to be able to use it.

If your game class is not declared on the define callback, you will need to modify it with this trick (to avoid a "ReferenceError: BgaAnimations is not defined" error) :

```
define([
        "dojo",
        "dojo/_base/declare",
        "ebg/core/gamegui",
        getLibUrl('bga-animations', '1.x'),
        getLibUrl('bga-cards', '1.x'),
    ],
function (dojo, declare, gamegui, BgaAnimations, BgaCards) {
    (window as any).BgaAnimations = BgaAnimations; //trick
    (window as any).BgaCards = BgaCards; 
    return declare("bgagame.reforest", ebg.core.gamegui, new Reforest());
});
```

## Changelog

**1.0.14**: more logs for card element not matching a card / accept keyed objects in addition to arrays on inputs

**1.0.13**: fix all visible deck remove card

**1.0.12**: fix duplication when adding a card to another slot of the same stock

**1.0.11**: fix lastPlayedCardStyle that was not fully applied

**1.0.10**: remove wrong required settings from GridStockSettings / demo of moving a card inside a slot stock with addCard / prevent selecting multiple times the same card programmatically / fix getLastPlayedCardStyle reading settings?.selectedCardStyle

**1.0.9**: fix VoidStock.addCards signature

**1.0.8**: fix slot & card selection override

**1.0.7**: fix HandStock blinking for loose width container / fix wrong deck number on constructor / fix removeCard.fadeOut without slideTo

**1.0.6**: fix autoPlace with VoidStock

**1.0.5**: fix selection of parent card if it contains a child card

**1.0.4**: fix error on emptyHandMessage not defined

**1.0.3**: fix emptyHandMessage conflicting with sort

**1.0.2**: fix selection style override

**1.0.1**: Fix documentation

**1.0.0**: Initial version
