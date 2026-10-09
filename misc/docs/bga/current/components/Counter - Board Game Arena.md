# Counter

> Source: http://en.boardgamearena.com/doc/Counter

This is very simple control that allow to set/get numeric value from inner html of div/span, and provides animation on from/to value. It is used for the built-in score counter of the player panels.

## Dependency

The counter is loaded by default by BGA, as it is used for the score display, so you don't need to import it.

## Setup a counter

```js
var counter = new ebg.counter();
counter.create(targetId);
```

Where **targetId** either string or dom element, which already exists in the template, which will be used to display the counter value.
For example:

```
  <span id="my_counter"></span>
```

In reality you will have a counter per player, so probably want to create a counter per player, in this case target Id can be 'hand_size_player_' + player_id and you create it in the loop for all players and store as class member. See example below on how to inject per-player sections.

## API

create(target, settings?)
:   associate counter with existing target DOM element target is the DOM element or element id
:   settings can define:

    - value: the initial value of the counter (null to disable)
    - tableCounter: the name of the TableCounter on PHP side, to update automatically on change (see [PlayerCounter and TableCounter](https://en.doc.boardgamearena.com/PlayerCounter_and_TableCounter "PlayerCounter and TableCounter"))
    - playerCounter and playerId: the name of the PlayerCounter on PHP side, and the playerId it is associated to, to update automatically on change (see [PlayerCounter and TableCounter](https://en.doc.boardgamearena.com/PlayerCounter_and_TableCounter "PlayerCounter and TableCounter"))

getValue()
:   return current value

incValue(by);
:   increment value by "by" and animate from previous value

setValue(value);
:   set value, no animation

toValue(value);
:   set value with animation

disable()
:   Sets the value to "-". Note it just changes display value once, it does not actually disable it, i.e. if you set it again, it will be shown again

speed
:   Duration of the animation, default is 100

const x = new ebg.counter()
x.speed = 300; // to make it slower

## Players panels

### Adding stuff to player's panel

First, create a new JS template string function and variables to hold your counter(s) in your template (tpl) file.

```
    stone_counters: {};

    getPlayerBoardTemplate(player) {
      return 
      `<div class="cp_board">
         <div id="stoneicon_p${player.player_id}" class="gmk_stoneicon gmk_stoneicon_${player.player_color}"></div>
         <span id="stonecount_p${player.player_id}">0</span>
       </div>`;
    }
```

Then, add this piece of code in the **setup** function of your JS file to add this template to each player panel:

```js
            for( var player_id in gamedatas.players )   {
                var player = gamedatas.players[player_id];
                         
                // Setting up players boards if needed
                var player_board_div = this.bga.playerPanels.getElement(player_id);
                player_board_div.insertAdjacentHTML('beforeend', this.getPlayerBoardTemplate(player));

                // create counter per player
                this.stone_counters[player_id] = new ebg.counter();
                this.stone_counters[player_id].create( 'stonecount_p'+player_id );
            }
```

Often, you have to distinguish between the current player and other players. In this case, create another JS template (ex: getCurrentPlayerBoardTemplate) and use it where `player_id` is different than `this.players.getCurrentPlayerId`.
