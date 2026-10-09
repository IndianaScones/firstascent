# Game interface logic: Game.js

> Source: http://en.boardgamearena.com/doc/Game_interface_logic:_Game.js

This is the main file for your game interface. Here you will define:

- Which actions on the page will generate calls to the server.
- What happens when you get a notification for a change from the server and how it will show in the browser.
- Setup user interface

**Note:** this file is now named Game.js, located in the modules/js directory. If you see it named yourgamename.js in the root dir, it's the legacy usage. In the legacy usage, the declaration is a bit different, as it uses define and declare to instanciate a JS object, while the new way exports a class (using ES Modules).
The new class doesn't extends gameui, so if you need to access some things from gameui that don't exist in the sub-components described above, you must use this.gameui.xx.

## Framework sub-components

The framework is now split into multiple sub-components to group the related functions : statusBar, sounds, gameArea, playerPanels, images, userPreferences, players, actions, notifications, dialogs. All are available in the bga object sent to the constructor (or in this.bga for the legacy way).

To make it accessible on the Game class, make it a property like this:

```
        constructor(bga){
            this.bga = bga;
```

In <mygamename>.js (the obsolete filename), this.bga is already set.

## File structure

The details of how the file is structured are described below with comments in the code skeleton provided to you.

Here is the basic structure:

- **constructor**: here you can define global variables for your whole interface.
- **setup**: this method is called when the page is refreshed, and sets up the game interface.
- **onEnteringState**: this method is called when entering a new game state. You can use it to customize the view for each game state. *The function is optional, and not needed if you use JS State classes.*
- **onLeavingState**: this method is called when leaving a game state. *The function is optional, and not needed if you use JS State classes.*
- **onUpdateActionButtons**: called on state changes, in order to add action buttons to the status bar. Note: in a MULTIPLE_ACTIVE_PLAYER state, it will be called when another player has become inactive. *The function is optional, and not needed if you use JS State classes.*
- *(utility methods)*: this is where you can define your utility methods.
- *(player's actions)*: this is where you can write your handlers for player actions on the interface (example: click on an item).
- **setupNotifications**: this method associates notifications with notification handlers. For each game notification, you can trigger a javascript method to handle it and update the game interface.
- *(notification handlers)*: this is where you define the notifications handlers associated with notifications in **setupNotifications**, above.

More details:

**setup(gamedatas: object)** 
This method must set up the game user interface according to current game situation specified in parameters.
The method is called each time the game interface is displayed to a player, ie:

- when the game starts
- when a player opens a game in the browser later
- when a player refreshes the game page (F5)
- when player does a server side Undo

"gamedatas" argument contains all data retrieved by your "getAllDatas" PHP method and some more.

**onEnteringState(stateName: string, args: { args: any } | null): void**

This method is called each time we enter a new game state.
You can use this method to perform some user interface changes at this moment.
To access state arguments passed via calling php arg\* method use args?.args.
Typically you would do something only for active player, using this.bga.players.isCurrentPlayerActive() check.
It is also called (for the current game state only) when doing a browser refresh (after the setup method is called).

**Warning**: for MULTIPLE_ACTIVE_PLAYER states:
the active players are NOT active yet so you must use onUpdateActionButtons to perform the client side operation which depends on a player active/inactive status.
If you are doing initialization of some structures which do not depend on the active player, you can just replace (this.bga.players.isCurrentPlayerActive()) with (!this.bga.players.isCurrentPlayerSpectator())
for the main switch in that method.

See more details in [Your_game_state_machine:_states.inc.php#Difference_between_Single_active_and_Multi_active_states](https://en.doc.boardgamearena.com/Your_game_state_machine:_states.inc.php#Difference_between_Single_active_and_Multi_active_states "Your game state machine: states.inc.php")

**onLeavingState(stateName: string): void**

This method is called each time we leave a game state.
You can use this method to perform some user interface changes at this point (i.e. cleanup).

**onUpdateActionButtons(stateName: string, args: object | null): void**

In this method you can manage "action buttons" that are displayed in the action status bar and highlight active UI elements.
To access state arguments passed via calling php arg\* method use **args** parameter. Note: args can be null! For **game** states and when you don't supply state args function - it is null.
This method is called when the active or multiactive player changes. In a classic ACTIVE_PLAYER state this method is called before the onEnteringState state.
In MULTIPLE_ACTIVE_PLAYER state it is a mess. The sequencing of calls depends on whether you get into that state from transitions OR from reloading the whole game (i.e. F5).

See more details in [Your_game_state_machine:_states.inc.php#Difference_between_Single_active_and_Multi_active_states](https://en.doc.boardgamearena.com/Your_game_state_machine:_states.inc.php#Difference_between_Single_active_and_Multi_active_states "Your game state machine: states.inc.php")

## States

### JS State classes

To split the code of the Game class, you can create dedicated classes for each state you handle on the front side (some states like NextPlayer don't need to be handled on the JS side).

**this.bga.states.register(stateIdOrName: string|number, stateClass: Object): void**

This method links a state class to a state name. It should be used in the Game constructor like this:

```
        // Declare the State classes
        this.bga.states.register('PlayerTurn', new PlayerTurn(this, this.bga));
```

When a state class is declared like this, the framework will call its onEnteringState... functions automatically. Example of JS State class:

```js
class PlayerTurn {
    constructor(game, bga) {
        this.game = game;
        this.bga = bga;
    }

    /**
     * This method is called each time we are entering the game state. You can use this method to perform some user interface changes at this moment.
     */
    onEnteringState(args, isCurrentPlayerActive) {
    }

    /**
     * This method is called each time we are leaving the game state. You can use this method to perform some user interface changes at this moment.
     */
    onLeavingState(args, isCurrentPlayerActive) {
    }

    /**
     * This method is called each time the current player becomes active or inactive in a MULTIPLE_ACTIVE_PLAYER state. You can use this method to perform some user interface changes at this moment.
     * on MULTIPLE_ACTIVE_PLAYER states, you may want to call this function in onEnteringState using `this.onPlayerActivationChange(args, isCurrentPlayerActive)` at the end of onEnteringState.
     * If your state is not a MULTIPLE_ACTIVE_PLAYER one, you can delete this function.
     */
    onPlayerActivationChange(args, isCurrentPlayerActive) {
    }

    // put custom functions only use on this state here
}
```

**this.bga.states.getCurrentMainStateName(): string;**

Get the current main state name (ignoring private states)

**this.bga.states.getCurrentPlayerStateName(): string;**

Get the current player state name (private state name if there is one)

**this.bga.states.logger: Function**

You can write `this.bga.states.logger = console.log` to show debug information about state changes in the console. Remove before going to production!

**this.bga.states.getStateClass(stateName: string): Object**

Get a state class (instance) by state name.

**this.bga.states.getCurrentMainStateClass(): Object;**

Get the current main state class (instance) (ignoring private states)

**this.bga.states.getCurrentPlayerStateClass(): Object;**

Get the current player state class (instance) (private state if there is one)

**this.bga.states.getStateClasses(): Object[];**

Returns the registered state classes (instances)

### Client states

Client states is a way to simulate the state transition but without actually going to server. It is useful when you need to ask user multiple questions before you send things to server.

Client states don't have a matching PHP class. They can be used with JS State classes, as long as the stateName declared in setClientState matches the registered JS State class.

**this.bga.states.setClientState(stateName: string, args: Object): void;**

Example:

```
    this.bga.states.setClientState("client_playerPicksLocation", {
                              descriptionmyturn : _("${you} must select location"),
                          });
```

For more information see [BGA_Studio_Cookbook#Multi_Step_Interactions:_Select_Worker.2FPlace_Worker_-_Using_Client_States](https://en.doc.boardgamearena.com/BGA_Studio_Cookbook#Multi_Step_Interactions:_Select_Worker.2FPlace_Worker_-_Using_Client_States "BGA Studio Cookbook")

To add custom string interpolation for the state title, you can add them by using the args object like so:

```
    this.bga.states.setClientState("client_playerPicksLocation", {
                             descriptionmyturn : _("${you} must select location for card {$card_number}"),
                             args: { card_number: 5 },
                         });
```

**this.bga.states.restoreServerGameState(): void;**

If you are in client state it will restore the current server state (cheap undo)

**this.bga.states.isOnClientState(): boolean;**

Returns if the current state is a client state

## Dojo framework

BGA uses the [Dojo Javascript framework](http://dojotoolkit.org/) internally.

To implement a game, you don't need to use the outdated Dojo framework, as vanilla JS is now able to do the same things. Some example of Dojo will stay on this page to help you read old games code.

## Javascript minimization (after July 2020)

For performance reasons, when deploying a game the javascript code is minimized using **terser** (<https://github.com/terser/terser>). This minifier works with modern javascript syntax. From your project "Manage game" page, you can now test a minified version of your javascript on the studio (and revert to the original).

NB: it has been reported that there is an issue with this minifier and percentage values for opacity.

## Accessing Players Information

**this.bga.players.getCurrentPlayerId(): number**
id of the player who is looking at the game. The player may not be part of the game (i.e. spectator)

**this.bga.players.getCurrentPlayerNo(): number | null**
no of the player who is looking at the game. The player may not be part of the game (i.e. spectator), in this case the result is null.

**this.bga.players.isCurrentPlayerSpectator(): boolean**
Flag set to true if the user at the table is a spectator (not a player).

Note: If you want to hide an element from spectators, you should use [CSS 'spectatorMode' class](https://en.doc.boardgamearena.com/Game_interface_stylesheet:_yourgamename.css#spectatorMode "Game interface stylesheet: yourgamename.css").

You may consider making a function like this, to detect if the game is in a read-only state (i.e. non-interactive):

```
 // Returns true for spectators, instant replay (during game), archive mode (after game end)
 isReadOnly: function () {
   return this.bga.players.isCurrentPlayerSpectator() || typeof g_replayFrom != 'undefined' || g_archive_mode;
 }
```

**this.bga.players.isCurrentPlayerActive(): boolean**
Returns true if the player on whose browser the code is running is currently active (it's his turn to play). Note: see remarks above about usage of this function inside onEnteringState method.

```
 if (this.bga.players.isCurrentPlayerActive()) ...
```

**this.bga.players.getActivePlayerId(): number | null;**
Return the ID of the active player, or null if we are not in an ACTIVE_PLAYER type state.

```
 if (args.player_id == this.bga.players.getActivePlayerId()) ...
```

**this.bga.players.getActivePlayerNo(): number | null;**
Return the no of the active player, or null if we are not in an ACTIVE_PLAYER type state.

**this.bga.players.getActivePlayerIds(): number[]**
Return an array with the IDs of players who are currently active (or an empty array if there are none).

**this.bga.players.getFormattedPlayerName(playerId, params?): string**
Get the HTML code to display the player name, in bold, with color.
params is optional, { replaceByYou: true } will display a colored "You" instead of the colored player name.

**this.gamedatas: object**
Contains the initial set of data to init the game, created at game start or by game refresh (F5).
You can update it as needed to keep an up-to-date reference of the game on the client side if you need it, however most of the time this is unnecessary.

Note: In hotseat mode, the framework does not keep this.gamedatas of hotseat players and shares the same set as the main player to store data.

Note: be careful when you update this data structurally, many framework functions expect data to be certain way and they will break if they see something else.

**this.bga.players.getPlayerById(playerId): object**
Return the player data stored in gamedatas.players. Can be undefined, if the player isn't at this table (spectator).

**this.bga.players.getPlayerByNo(playerNo): object**
Return the player data stored in gamedatas.players.

**this.bga.players.getActivePlayer(): object**
Same as getPlayer for the active player.

**this.bga.players.getCurrentPlayer(): object**
Same as getPlayer for the current player.

**this.bga.players.getPlayerAvatarUrl(playerId, size): string**
Return the player avatar url. The size of the avatar can be 32, 50, 92 or 184 (default). Set playerId 0 to get the default avatar.

**this.bga.players.getPlayerNoById(playerId): number | null**
Return the no of the player, by id

**this.bga.players.getPlayerIdByNo(playerNo): number**
Return the id of the player, by no

## Accessing and manipulating the DOM

### Main game area

**this.bga.gameArea.getElement(): HTMLElement**

Returns the div of the game area to put the game template into.

**Example**
Add this piece of code in your JS file, at the beginning of the setup function, to set the template :

```js
                const html = `<div>
                    <div class="round-counter">${_('Round')} ${gamedatas.currentRound}/${gamedatas.totalRound}</div>
                    <div>...anything else in your game template...</div>
                </div>`;
                this.bga.gameArea.getElement().insertAdjacentHTML('beforeend', html);
```

### Element by Id

**$(elementId: ElementOrId)**

The $ function is used to get an HTML element using its "id" attribute.

Example: modify the content of a "span" element:

```
In your HTML code:
   <span id="a_value_in_the_game_interface">1234</span>

In your Javascript code:
   $('a_value_in_the_game_interface').innerHTML = "9999";
```

Note: It is safe to use if you don't know if variable is string (id of element) or element itself, i.e.

```
  foo: function(card) {
       card = $(card); // now its node, no need to write if (typeof card === 'string') ...
       // but its good idea to check for null here
       ...
  }
```

**getElementById(elementId: string)**

Note: $() is the standard method to access some HTML element with the BGA Framework. You can use **getElementById** but it is longer to type and less handy as it does not do some checks.

### Style

**Vanilla JS style**

```js
 document.getElementById('my_element').style.display='none'; // set
 const display = document.getElementById('my_element').style.display; // get
 document.getElementById('my_element').style.removeProperty('display'); // remove
```

**dojo.style(node: ElementOrId, styleName: string, styleValue: any): void**

(DEPRECATED, prefer native JS) With dojo.style you can modify the CSS property of any HTML element in your interface.

```js
 dojo.style( 'my_element', 'display', 'none' ); // set
```

**this.bga.gameui.addStyleToClass(cssClassName: string, styleName: string, styleValue: any):** **void**

Same as dojo.style(), but for all the nodes set with the specified cssClassName
Equivalent of

```js
 document.querySelectorAll(`.${aclass}`).style.styleName = styleValue; // native JS
 dojo.query(`.${aclass}`).style(styleName, styleValue); // dojo, deprecated
```

### Classes

In many situations, many small CSS property updates can be replaced by a CSS class change (i.e., you add a CSS class to your element instead of applying all modifications manually).

```js
 document.getElementById(token_id).classList.add('possibleMove'); // add class  
 document.getElementById(token_id).classList.remove('possibleMove'); // remove class
 document.getElementById(token_id).classList.toggle('possibleMove'); // toggle class, classList.toggle('possibleMove', args.isPossibleMove);  to do add/remove based on a boolean
 const myclasses = ['a','b'];
 document.getElementById(token_id).classList.add(...myclasses); // add 2 classes / a dynamic number of classes  
 document.querySelectorAll(".hand .card").forEach(elem => elem.classList.add('possibleMove')); // add classes to a querySelectorAll result
```

Advantages are:

- All your CSS stuff remains in your CSS file.
- You can add/remove a list of CSS modifications with a simple function and without error.
- You can test whether you applied the CSS to an element with the **classList.contains** method.

Deprecated dojo functions:

```js
 dojo.addClass(node: ElementOrId, classes: string): void
 dojo.removeClass(node: ElementOrId, classes: string): void
 dojo.hasClass(node: ElementOrId, aclass: string): void
 dojo.toggleClass(node: ElementOrId, aclass: string): void
```

### Element data

With dataset you can access or change the value of an attribute or property of any HTML element in your interface.

```
  document.getElementById(token).dataset.tokenColor='red'; // CSS selector: .token[data-token-color="red"] { ... }
```

The difference with classes is that a data can only have one value, so setting tokenColor to green will remove red automatically, while using classes you would need to remove token_color_red and add token_color_green.

### Queries

**Native JS query**

```js
 const cards = document.querySelectorAll(".hand .card");// all cards in all hands
 const cards = document.getElementById('hand').querySelectorAll(".card");// all cards in specific hand
 const card = document.querySelector(".hand .card");// first card or null if none (super handy)
```

**dojo.query(cssSelector: string): Element[]**

(deprecated) With dojo.query, you can query a bunch of HTML elements with a single function, with a "CSS selector" style.

Example:

```js
     // All elements with class "possibleMove":
     var elements = dojo.query( '.possibleMove' );

     // Count number of tokens (i.e., elements of class "token") on the board (i.e., the element with id "board"):
     dojo.query( '#board .token' ).length;
```

### Creating and Destroying elements

**dojo.empty(node: ElementOrId)**

Remove all children of the node element

```js
  dojo.empty('my_hand');
```

**dojo.destroy(node: ElementOrId)**

Remove the element

```js
  dojo.destroy('my_token');
```

```js
  dojo.query(".green", mynode).forEach(dojo.destroy); // this remove all subnode of class green from mynode
```

**dojo.create(tag: string, attributes?: obj, parent?: ElementOrId): Element**

Create element

```js
   dojo.create("div", { class: "yellow_arrow" }, parent); // this creates div with class yellow_array and places it in "parent"
```

**this.bga.gameui.format_block(name: string, args: object): string**

This bga function that takes global var from template file and substitute variables, typical use would be

```js
               var player = gamedatas.players[player_id];
               var div = this.bga.gameui.format_block('jstpl_player_board', player ); // var jstpl_player_board = ... is defined in .tpl file
```

Note: result is trimmed

**this.bga.gameui.format_string(name: string, args: object): string**

This bga function just substitute variables in a string, i.e.

```js
     var div = this.bga.gameui.format_string('<div color="${player_color}"></div>', {player_color: '#ff0000'} );
```

Note: result is trimmed

Note: this can be replaced by using backquoted string now:

```js
    const player_color =  '#ff0000';
```

```js
   const div = ``;
```

**this.bga.gameui.format_string_recursive**

This bga function is similar to this.gameui.bga.format_string but is capable of processing recursive argument structures and translations. It is used to format server notifications.

TODO: find better place for these function docs

### Moving elements

**dojo.place(node: string | Element, refNode: ElementOrId, pos?: string | number): Element**

dojo.place is the best function to insert HTML code somewhere in your game interface without breaking something. It is much better to use than the **innerHTML=** method if you must insert HTML tags and not only values.

node: can be a string or a DOM node. If it is a string starting with “<”, it is assumed to be an HTML fragment, which will be created. Otherwise it is assumed to be an id of a DOM node.

```js
     // Insert your HTML code as a child of a container element
     dojo.place( "<div class='foo'></div>", "your_container_element_id" );
```

pos: optional argument. Can be a number or one of the following strings: “before”, “after”, “replace”, “only”, “first”, or “last”. If omitted, “last” is assumed.

- "replace": replace the container element with my_node element
- "first": places the node as a child of the reference node. The node is placed as the first child.
- "last" (default): places the node as a child of the reference node. The node is placed as the last child.
- "before": places the node right before the reference node.
- "after": places the node right after the reference node.
- "only": replaces all children of the reference node with the node.

this parameter can be a positive integer. In this case, the node will be placed as a child of the reference node with this number (counting from 0). If the number is more than number of children, the node will be appended to the reference node making it the last child.

```js
     // Replace all children of container with my_node 
     dojo.place( $('my_node'), "your_container_element_id", "only" );
```

See also full doc on dojo.place: [[1]](https://dojotoolkit.org/reference-guide/1.7/dojo/place.html)

Usually, when you want to insert some piece of HTML in your game interface, you should use "[Javascript templates](https://en.doc.boardgamearena.com/Game_layout:_view_and_template:_yourgamename.view.php_and_yourgamename_yourgamename.tpl#Javascript_templates "Game layout: view and template: yourgamename.view.php and yourgamename yourgamename.tpl")".

But you can also relocate elements like that. Note: it won't animate if you do that.

**this.bga.gameui.placeOnObject(mobile_obj: ElementOrId, target_obj: ElementOrId): void**

places mobile_obj on target_obj, set the absolute positions and centers the mobile_obj on target_obj,
effect is immediate

This is not really an animation, but placeOnObject is frequently used before starting an animation.

Example:

```
  // (We just created an object "my_new_token")

  // Place the new token on current player board
  this.bga.gameui.placeOnObject( "my_new_token", "overall_player_board_"+this.bga.players.getCurrentPlayerId() );
  
  // Then slide it to its position on the board
  this.bga.gameui.slideToObject( "my_new_token", "a_place_on_board" ).play();
```

**this.bga.gameui.placeOnObjectPos(mobile_obj: ElementOrId, target_obj: ElementOrId, target_x: number, target_y: number): void**

This method works exactly like placeOnObject, except than you can specify some (x,y) coordinates (in px). This way, the center of "mobile_obj" will be placed to the specified x,y position relatively to the center of "target_obj".

*Note: the placement works differently from this.bga.gameui.slideToObjectPos*, since coordinates are calculated based on the center of objects.

**this.bga.gameui.attachToNewParent(mobile_obj: ElementOrId, target_obj: ElementOrId): void**

With this method, you change the HTML parent of "mobile_obj" element without moving it.
"target_obj" is the new parent of this element. The beauty of
attachToNewParent is that the mobile_obj element DOES NOT MOVE during this process.

What happens is that the method calculate a relative position of mobile_obj to make sure it does not move after the HTML parent changes.

Why using this method?

Changing the HTML parent of an element can be useful for the following reasons:

- When the HTML parent moves, all its child are moving with them. If some game elements is no more linked with a parent HTML object, you may want to attach it to another place.
- The z_order (vertical order of display) depends on the position in the DOM, so you may need to change the parent of some game elements when they are moving in your game area.

**CAREFUL**: this function destroys original object and places a clone onto a new parent, this will break all references to this HTML element (ex: dojo.connect).
If you need version that does not destroy the object but the same otherwise see [BGA_Studio_Cookbook#Attach_to_new_parent_without_destroying_the_object](https://en.doc.boardgamearena.com/BGA_Studio_Cookbook#Attach_to_new_parent_without_destroying_the_object "BGA Studio Cookbook")

## Animations

A new lib for animations has been added to the framework: **[BgaAnimations](https://en.doc.boardgamearena.com/BgaAnimations "BgaAnimations")**. *We recommend to use it instead of the animations listed above.*

**this.bga.gameui.bgaAnimationsActive()**

Function to know if animations should be played. Animations should not be played in instantaneousMode (fast-replay mode), or if the tab is not displayed in the browser.
Returns a boolean saying if animations should be played.

```
  if (this.bga.gameui.bgaAnimationsActive()) {
    // play an animation
  } else {
    // just apply the end situation of the animation
  }
```

Note: if you use framework animation functions listed above, they already handle this check so you don't need it. It's useful if you write custom animations.

### Dojo Animations

BGA animations is based on Dojo Animation ([see tutorial here](http://dojotoolkit.org/documentation/tutorials/1.8/animation/)).

However, most of the time, you can just use methods below, which are built on top of Dojo Animation.

Note: one interesting method from Dojo that could be useful from time to time is "Dojo.Animation". It allows you to make any CSS property "slide" from one value to another.

Note 2: the slideTo methods are not compatible with CSS transform (scale, zoom, rotate...). If possible, avoid using CSS transform on nodes that are being slided. Eventually, the only possible solution to make these 2 compatible is to disable all CSS transform properties, use slideToObjectPos/placeOnObjectPos, and then apply them again.

### Sliding

**this.bga.gameui.slideToObject(mobile_obj: ElementOrId, target_obj: ElementOrId, duration?: number, delay?: number): Animation**

You can use slideToObject to "slide" an element to a target position.

Sliding element on the game area is the recommended and the most used way to animate your game interface. Using slides allow players to figure out what is happening on the game, as if they were playing with the real boardgame.

The parameters are:

- mobile_obj: the ID of the object to move. This object must be "relative" or "absolute" positioned.
- target_obj: the ID of the target object. This object must be "relative" or "absolute" positioned. Note that it is not mandatory that mobile_obj and target_obj have the same size. If their size are different, the system slides the center of mobile_obj to the center of target_obj.
- duration: (optional) defines the duration in millisecond of the slide. The default is 500 milliseconds.
- delay: (optional). If you defines a delay, the slide will start only after this delay. This is particularly useful when you want to slide several object from the same position to the same position: you can give a 0ms delay to the first object, a 100ms delay to the second one, a 200ms delay to the third one, ... this way they won't be superposed during the slide.

BE CAREFUL: The method returns an dojo.fx animation, so you can combine it with other animation if you want to. It means that you have to call the "play()" method, otherwise the animation WON'T START.

Example:

```
   this.bga.gameui.slideToObject( "some_token", "some_place_on_board" ).play();
```

**this.bga.gameui.slideToObjectPos(mobile_obj: ElementOrId, target_obj: ElementOrId, target_x: number, target_y: number, duration?: number, delay?: number): Animation**

This method does exactly the same as "slideToObject", except than you can specify some (x,y) coordinates. This way, "mobile_obj" will slide to the specified x,y position relatively to "target_obj".

Example: slide a token to some place on the board, 10 pixels from the top:

```
   this.bga.gameui.slideToObjectPos( "some_token", "some_place_on_board", 0, 10 ).play();
```

**this.bga.gameui.slideTemporaryObject(mobile_obj_html: string, parent: ElementOrId, from: ElementOrId, to: ElementOrId, duration?: number, delay?: number): Animation**

This method is useful when you want to slide a temporary HTML object from one place to another. As this object does not exists before the animation and won't remain after, it could be complex to create this object (with dojo.place), to place it at its origin (with placeOnObject) to slide it (with slideToObject) and to make it disappear at the end.

slideTemporaryObject does all of this for you:

- mobile_obj_html is a piece of HTML code that represent the object to slide.
- parent is the ID of an HTML element of your interface that will be the parent of this temporary HTML object.
- from is the ID of the origin of the slide.
- to is the ID of the target of the slide.
- duration/delay works exactly like in "slideToObject"

Example:

```
this.bga.gameui.slideTemporaryObject( '<div class="token_icon"></div>', 'tokens', 'my_origin_div', 'my_target_div' );
```

Note: slideTemporaryObject triggers the animation, you don't have to call `.play()` on it. It returns an Dojo animation with an extra `promise` field, allowing you to do `await this.bga.gameui.slideTemporaryObject(...).promise`.

### Destroy

**this.bga.gameui.slideToObjectAndDestroy(mobile_obj: ElementOrId, target_obj: ElementOrId, duration?: number, delay?: number): Animation**

This method is a handy shortcut to slide an existing HTML object to some place then destroy it upon arrival. It can be used for example to move a victory token or a card from the board to the player panel to show that the player earns it, then destroy it when we don't need to keep it visible on the player panel.

It works the same as this.bga.gameui.slideToObject and takes the same arguments, but it starts the animation.

CAREFUL: Make sure nothing is creating the same object at the same time the animation is running, because this will cause some random disappearing effects

Example:

```
this.bga.gameui.slideToObjectAndDestroy( "some_token", "some_place_on_board", 1000, 0 );
```

Note: slideToObjectAndDestroy triggers the animation, you don't have to call `.play()` on it. It returns an Dojo animation with an extra `promise` field, allowing you to do `await this.bga.gameui.slideToObjectAndDestroy(...).promise`.

**this.bga.gameui.fadeOutAndDestroy( node: string | Element, duration?: number, delay?: number):** **Animation**

This function fade out the target node, then destroy it. Its starts the animation.

- duration/delay works exactly like in "slideToObject"

Example:

```
   this.bga.gameui.fadeOutAndDestroy( "a_card_that_must_disappear" );
```

CAREFUL: the HTML node still exists until during few milliseconds, until the fadeOut has been completed.
Make sure nothing is creating same object at the same time as animation is running, because you will be some random dissapearing effects

Note: fadeOutAndDestroy triggers the animation, you don't have to call `.play()` on it. It returns an Dojo animation with an extra `promise` field, allowing you to do `await this.bga.gameui.fadeOutAndDestroy(...).promise`.

### Rotating elements

This example combines "Dojo.Animation" method and a CSS property transform that allow you to rotate the element.

```js
// node is Element we rotating
		    var animation = new dojo.Animation({
			    curve: [fromDegree, toDegree],
			    onAnimate: (v) => {
				    node.style.transform = 'rotate(' + v + 'deg)';
			    } 
		    });
		    
		    animation.play();
```

BGA has its own interface to rotate

**this.bga.gameui.rotateTo(node: string | Element, degree: number): Animation**

It starts the animation, and stored the rotation degree in the class, so next time you rotate object - it is additive.
There is no animation hooks in this one, if you need to change any parameters use dojo animation above.

There is also **this.bga.gameui.rotateInstantTo** with same signature which does not animate

Note: rotateTo triggers the animation, you don't have to call `.play()` on it. It returns an Dojo animation with an extra `promise` field, allowing you to do `await this.bga.gameui.rotateTo(...).promise`.

### Animation Callbacks

If you wish to run some code only after an animation has completed you can do this by linking a callback method to 'onEnd'.

```js
var animation_id = this.bga.gameui.slideToObject( mobile_obj, target_obj, 500 );
dojo.connect(animation_id, 'onEnd', () => {
   // do something here
});
animation_id.play();
```

If you wish to call a second animation after the first (rather than general code) then you can use a dojo animation chain (see tutorial referenced above).

**this.bga.gameui.bgaPlayDojoAnimation(anim)**

- anim - the dojo animation

Play a dojo animation and returns a promise resolved when it ends.

Examples:

```js
  const anim = this.bga.gameui.slideToObject(`disc_${x}${y}`, `square${x}_${y}`);
  await this.bga.gameui.bgaPlayDojoAnimation(anim);
```

```js
  const anim = dojo.fx.chain([
    dojo.fadeOut( { node: discDiv } ),
    dojo.fadeIn( { node: discDiv } ),
  ]);
  await this.bga.gameui.bgaPlayDojoAnimation(anim);
```

## Players input

### Connecting

**dojo.connect(element: Element, event: string, context: object, method: eventHandler): any**

**dojo.connect(element: Element, event: string, handler: eventHandler): any**

Used to associate a player event with one of your notification methods.

Example: associate a click on an element ("my_element") with one of our methods ("onClickOnMyElement"):

```js
      dojo.connect( $('my_element'), 'onclick', this, 'onClickOnMyElement' );
```

Same idea but based on query (i.e. all element of 'pet' class)

```js
     dojo.query(".pet").connect('onclick', this, 'onPet');
```

Note: if you need to disconnect the handler you have to store handler returned from this method, i.e.

```js
    var handler = dojo.connect(...);
    ...
    dojo.disconnect(handler);
```

If you don't store the handler - you have to destroy the object to disconnect it

Typical function that implements the input handler will look like this

```js
onPet: function(event) {
    var id = event.currentTarget.id;
    console.log('onPet ' + id);
    dojo.stopEvent(event);
    if (this.gamedatas.gamestate.name == 'playerTurnPet') {
          this.bga.actions.performAction('actPlayPet', {card: id});
    } else {
          this.bga.dialogs.showMoveUnauthorized();
    }
}
```

**this.bga.gameui.connect(element: ElementOrId, event: string, method: eventHandler): void**

Used to associate a player event with one of your notification methods.

```
     this.bga.gameui.connect( $('my_element'), 'onclick', 'onClickOnMyElement' );
```

Or you can use an in-place handler

```js
     this.bga.gameui.connect( $('my_element'), 'onclick', (e) => { console.log('boo'); } );
```

Note that this function stores the connection handler. That is the only real difference between **this.bga.gameui.connect** and **dojo.connect**. If you plan to destroy the element you connected, you **must** call this.bga.gameui.disconnect() to prevent memory leaks.
This function is mainly for permanent objects - if you just want to connect the temp object you should probably not use this method but use dojo.connect which won't require any clean-up.

**this.bga.gameui.connectClass(cssClassName: string, event: string, method: eventHandler): void**

Same as connect(), but for all the nodes set with the specified cssClassName.

```
this.bga.gameui.connectClass('pet', 'onclick', 'onPet');
```

**this.bga.gameui.disconnect(element: ElementOrId, event: string): void**

Disconnect event handler (previously registered with this.bga.gameui.connect or this.bga.gameui.connectClass).

```
  this.bga.gameui.disconnect( $('my_element'), 'onclick');
```

Note: dynamic connect/disconnect is for advanced cases ONLY, you should always connect elements statically if possible, i.e. in setup() method.

**this.bga.gameui.disconnectAll(): void**

Disconnect all previously registed event handlers (registered via this.bga.gameui.connect or this.bga.gameui.connectClass)

```
 this.bga.gameui.disconnectAll();
```

### Actions

**this.bga.actions.performAction(action: string, args?: object, options: { lock: boolean, checkAction: boolean, checkPossibleActions?: boolean, ignoreDefaultErrorHandler?: boolean }): Promise<void>**

Triggers an asynchronous action call in the php backend. Check more of what actions and arguments are possible in [Main_game_logic:_Game.php#Actions_(autowired)](https://en.doc.boardgamearena.com/Main_game_logic:_Game.php#Actions_(autowired) "Main game logic: Game.php") docs.

This method must be used to send a player's input to the game server. **It should not be triggered programmatically**, especially not in loops, in callbacks, in notifications, or in onEnteringState/onUpdateActionButtons/onLeavingState, in order not to create race conditions or break replay game and tutorial features. It should be used only in reaction to a user action in the interface.

Parameters:

- action: name of the action, as it is written in "possibleactions" of the current state.
- args: an object containing the call parameters to send to the action, can be undefined/omitted if action has no parameters. Note: the following arg names are forbidden : `$args / $activePlayerId/ $active_player_id / $currentPlayerId / $current_player_id` to not mess with [magic params](https://en.doc.boardgamearena.com/State_classes:_State_directory#Functions_act*).
- options: options to tweak the call with some defaults. Default is `{ lock: true, checkAction: true }`.
  - lock: (true by default) locks the user interface before any other action can be executed, that prevents user clicking on more buttons while this action is in progress. Set to false if you want to handle locking by yourself.
  - checkAction: (true by default) check that action specified by "action" parameter in list of possible actions and user is active, only set to false in rare cases when some special out of turn actions are allowed.

Important: this is asynchronous action, this means you should not be doing anything after this line of code except returning; If you want to do something after the call is resolved, use promise handlers - catch and then, see examples below.

Example of a standard call without args:

```
 this.bga.actions.performAction('pass');
```

Example of a standard call with action args:

```
 this.bga.actions.performAction('actPlayCard', { id: this.selectedCardId });
```

Example of a call without checking action (because player is inactive in a multiactive state):

```
 this.bga.actions.performAction('actChangeMind', {}, { checkAction: false, checkPossibleActions: true });
```

Example of a call without lock (because of a special action not directly related to the game flow):

```
 this.bga.actions.performAction('actSetAutoBid', { alwaysBidUntil: 500 }, { lock: false, checkAction: false });
```

Example of call with an array of ids (to be used with #[IntArrayParam]) :

```
 this.bga.actions.performAction('actPlayCards', { ids: this.selectedCardIds });
```

Example of call with aJSON object (to be used with #[JsonParam], note the "stringify") :

```
 this.bga.actions.performAction('actPlanComplexStuff', { answer: JSON.stringify(this.theJsonObject) });
```

Example of call with reaction to exception:

```js
 this.bga.actions.performAction('actPlayCard', { id: this.selectedCardId }).catch(()=>{ this.selectedCardId = undefined; });
```

Example of call with reaction to success:

```js
 this.bga.actions.performAction('actPlayCard', { id: this.selectedCardId }).then(()=>{ this.unselectAll(); });
```

Technical note:

- This is a combination of checkAction and ajaxcall, returning a Promise which resolves when ajaxcall ends.
- The function return void promise - the php callback cannot return any result, any results must be handled via the notification mechanism if needed
- In case there is an error - error message itself handled by framework, you can use error in catch({ message, args }) but you should not be showing it - this is done already, except if you've set ignoreDefaultErrorHandler: true
- If you migrate from this.bgaPerformAction and are using catch on the promise, the result will now be { message, args } instead of args, allowing you to get the args you sent in the exception.

**this.bga.actions.ajaxcall(url, parameters, obj_callback, callback, callback_anycase?, ajax_method?: string)**

*Note: this.bga.actions.performAction is a simpler way to use ajax calls, ajaxcall stays in the doc for legacy reasons only and should not be used in new projects.*

Same warning as **this.bga.actions.performAction** about using on user action only.

- url: the url of the action to perform. For a game, it must be: "/<mygame>/<mygame>/myAction.html"
- parameters: an array of parameter to send to the game server.
  - Note that "lock: true" must always be specified in this list of parameters in order the interface can be locked during the server call. Cannot use lock: false - to not lock it has to be undefined.
  - Note: Restricted parameter names (please don't use them):
    - "action"
    - "module"
    - "class"
- obj_callback: must be set to "this".
- callback (non-optional but rarely used): a function to trigger when the server returns result and everything went fine (not used, as all data handling is done via notifications).
- callback_anycase: (optional) a function to trigger when the server returns ok OR error. If no error this function is called with parameter value false. If an error occurred, the first parameter will be set to true, the second will contain the error message sent by the PHP back-end, and the third will contain an error code.
- ajax_method: (optional and rarely used) if you need to send large amounts of data (over 2048 bytes), you can set this parameter to 'post' (all lower-case) to send a POST request as opposed to the default GET. This works, but was not officially documented, so only use if you really need to.

Usage:

```js
this.bga.actions.ajaxcall( '/mygame/mygame/actMyAction.html', { lock: true, 
   arg1: myarg1, 
   arg2: myarg2
}, this, (result)=>{} );
```

**this.bga.actions.checkAction(action: string, nomessage?: boolean): boolean**

Check if player can do the specified action by taking into account:

- if interface is locked it will return false and show message "An action is already in progress", unless nomessage set to true
- if player is not active it will return false and show message "This is not your turn", unless nomessage set to true
- if action is not in list of possible actions (defined by "possibleaction" in current game state) it will return false and show "This move is not authorized now" error (unconditionally).
- otherwise returns true

Example:

```php
  function onClickOnGameElement( evt )  {
     if( this.bga.actions.checkAction( "actMyAction" ) ) {
        // Do the action
     }
  }
```

**this.bga.actions.checkPossibleActions(action: string): boolean**

- this is independent of the player being active, so can be used instead of this.bga.actions.checkAction(). This is particularly useful for multiplayer states when the player is not active in a 'player may like to change their mind' scenario. Unlike this.bga.actions.checkAction, this function does NOT take interface locking into account

- if action is not in list of possible actions (defined by "possibleaction" in current game state) it will return false and show "This move is not authorized now" error (unconditionally).
- otherwise returns true

```php
 function onChangeMyMind( evt )  {
    if( this.bga.actions.checkPossibleActions( "actMyAction" ) ) {
       // Do the action
    }
 }
```

**this.bga.gameui.checkLock(nomessage?: boolean): boolean**

When using "lock: true" in ajax call you can use this function to check if the interface is in lock state (it will be locked during server call and notification processing).
This check can be used to block some other interactions which do not result in ajaxcall or if you want to suppress errors. Note: normally you only need to use this.bga.actions.checkAction(...), this is for advanced cases.

It will also show error unless nomessage is set to true

```php
 function onChangeMyMind( evt )  {
    if( this.bga.gameui.checkLock() ) {
       // Do the action
    }
 }
```

## Notifications

When something happens on the server side, your game interface Javascript logic received a notification.
If you have not done so yet check what notification are in [Main_game_logic:_yourgamename.game.php#Notifications](https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Notifications "Main game logic: yourgamename.game.php")

Here's how you can handle these notifications on the client side.

**this.bga.notifications.setupPromiseNotifications(params = undefined)**

- params - the call parameters, by default { prefix: 'notif_', minDuration: 500, minDurationNoText: 1, logger: null, ignoreNotifications: [], onStart: undefined, onEnd: undefined, }.

Auto-detect all notifications declared on the game object (functions starting with `notif_`) and register them with dojo.subscribe.

Registered notifications will be synchronous and will have a minimum duration (if animations are active, by default 500ms with text and 1ms without).

If the notification function returns a Promise, the notification will end when the promise AND the minimum durations are over.
If the notification function does not return a promise, it is considered as already resolved as soon as the minimum durations are over.

In case of a notification function returning a Promise, the dev is responsible to make it resolve instantaneously if animations are not active.

See `bgaAnimationsActive` to know if animations are active : <https://en.doc.boardgamearena.com/Game_interface_logic:_yourgamename.js#Animations>

See `bgaPlayDojoAnimation` to handle dojo animations with promises : <https://en.doc.boardgamearena.com/Game_interface_logic:_yourgamename.js#Animation_Callbacks>

```js
  setupNotifications: function() {
    this.bga.notifications.setupPromiseNotifications();
  }
    
  notif_playedCard: async function(args) {
    await this.getPlayerTable(args.playerId).playCard(args.card);
  }
```

Side note : you can receive the full notification data as second argument of the notification function. You can access that way to the message of the notification (but also, more technical data like : move_id, table_id, uid...)

```js
   notif_playedCard: async function(args, notif) {
     const notif_message = notif.log;
   }
```

Example of setting custom values for all params :

```js
  setupNotifications: function() {
    this.bga.notifications.setupPromiseNotifications({ 
      prefix: 'notif_', // default is 'notif_'
      minDuration: 1200, // for longer animations (500 by default)
      minDurationNoText: 1,
      handlers: [this.notificationsManager], // if you write your notif function in a subclass instead of this (default this)
      logger: console.log, // show notif debug informations on console. Could be console.warn or any custom debug function (default null = no logs)
      ignoreNotifications: ['updateAutoPlay'], // the notif_updateAutoPlay function will be ignored by bgaSetupPromiseNotifications. You'll need to subscribe to it manually
      onStart: (notifName, msg, args) => $('pagemaintitletext').innerHTML = `${_('Animation for:')} ${msg}`, 
      onEnd: (notifName, msg, args) => $('pagemaintitletext').innerHTML = '',
    });
  }
```

**Using Notifications in JS State Classes**

You can put the notification function (notif_doSomething) in your JS State Class and register this with 'handlers' :

```
  setupNotifications: function() {
    this.bga.notifications.setupPromiseNotifications({ 
      (...)
      handlers: [this, ...this.bga.states.getStateClasses()], 
      (...)
    });
  }
```

Warning : if the same notif_doSomething is defined is Game.js and several State classes, they all will be called!

**this.bga.gameui.wait(delay)**

- delay - the time to wait, in milliseconds

Return a Promise that resolves at the end of a given number of ms. If animations are not active, resolve instantaneously.

```
  await this.bga.gameui.wait(500); // wait 500ms before continuing in an async function
```

### Subscribe to notifications manually

**dojo.subscribe(notif_type: string, callback_obj: Object, handler: string|handler)**

- notif_type - notification type/name send by php server
- callback_obj - usually this
- handler - if string method of callback_obj with name name is called, when notification is called, with notification object as parameter (see below)

Your Javascript "setupNotifications" method is the place where you can subscribe to notifications from your PHP code.

Here's how you associate one of your Javascript method to a notification "playDisc" (from Reversi example):

```js
   setupNotifications: function() {
      ...
      dojo.subscribe('playDisc', this, "notif_playDisc");
   },
```

Note: the "playDisc" corresponds to the name of the notification you define it in your PHP code, in your "notify->all" or "notify->player" method.

Then, you have to define your "notif_playDisc" method:

```js
   notif_playDisc: function(notif) {
     // Remove current possible moves (makes the board more clear)
     dojo.query( '.possibleMove' ).removeClass( 'possibleMove' );          
     this.addDiscOnBoard( notif.args.x, notif.args.y, notif.args.player_id );
   },
```

In a notification handler like our "notif_playDisc" method, you can access all notifications arguments with "notif.args".

Example:

PHP

```php
    $this->bga->notify->all( "apples", clienttranslate('player takes ${count} apples'), [ "count" => 3 ] );
```

JavaScript

```js
    setupNotifications: function() {
       dojo.subscribe( 'apples', this, 'notif_apples' );
    },

    notif_apples: function(notif) {
      //You can access the "count" like this:
       alert("count = " + notif.args.count);
    }
```

### The notification Object received by client

When sending a notification on your PHP, the client side will receive an Object with the following attributes:

- type - type of the notification (as passed by php function)
- log - the log string passed from php notification
- args - This is the arguments that you passed on your notification method on php
- bIsTableMsg - is true when you use [Notify->all](https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#NotifyAllPlayers "Main game logic: yourgamename.game.php") method (false otherwise)
- channelorig - information about table ID (formatted as : "/table/t[TABLE_NUMBER]")
- gamenameorig - name of the game
- move_id - ID of the move associated with the notification
- table_id - ID of the table (comes as string)
- time - UNIX GMT timestamp
- uid - unique identifier of the notification
- h - unknown

*Note that those information were inferred from observation on console log. If an Admin can confirm/correct (and remove this line), you're welcome :)*

### Ignoring notifications

NOTE: With the new `_private` arg in $this->bga->notify->all, you should not need to ignore notifications anymore. See <https://en.doc.boardgamearena.com/Main_game_logic:_Game.php#Sending_private_data_to_some_players> for the new way of handling private data in notifications.

**setIgnoreNotificationCheck(notif_type: string, predicate: ((notif: Notif)=>boolean))**

If you need this function and you are in the Dev Discord, please read [This thread](https://discord.com/channels/753304735615811584/1448596273081876530/1448596273081876530) that might avoid the usage of **setIgnoreNotificationCheck.**

This method will set a check whether any of notifications of specific type should be ignored.

The parameters are:

- notif_type: type of the notification
- predicate (notif => boolean): a function that will receive notif object and will return true if this specific notification should be ignored

Before dispatching any notification of this type, the framework will call predicate to check whether notification should be ignored, if it return true - the notification will be dispatched, i.e. logged or handled.

```js
    this.bga.gameui.notifqueue.setIgnoreNotificationCheck( 'dealCard', (notif) => notif.args.player_id == this.bga.players.getCurrentPlayerId() );
```

IMPORTANT: Remember that this notification is ignored on the client side, but was still received by the client. Therefore it shouldn't contain any private information as cheaters can get it. In other words this is not a way to hide information.

IMPORTANT: When a game is reloaded with F5 or when opening a turn based game, old notifications are replayed as history notification. They are used just to update the game log and are stripped of all arguments except player_id, i18n and any argument present in message. If you use and other argument in your predicate you should **preserve** it as explained [here](https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Notify_players "Main game logic: yourgamename.game.php").

### Handle manually synchronous notifications

When several notifications are received by your game interface, these notifications are processed immediately, one after the other, in the same exact order they have been generated in your PHP game logic.

However, sometimes, you need to give some time to the players to figure out what happened on the game before jumping to the next notification. Indeed, in many games, there are a lot of automatic actions, and the computer is going to resolve all these actions very fast if you don't tell it not to do so.

As an example, for Reversi, when someone is playing a disc, we want to wait 500 milliseconds before doing anything else in order the opponent player can figure out what move has been played.

Here's how we do this, right after our subscription:

```js
    dojo.subscribe( 'playDisc', this, "notif_playDisc" );
    this.bga.gameui.notifqueue.setSynchronous( 'playDisc', 500 );   // Wait 500 milliseconds after executing the playDisc handler
```

---

It is also possible to control the delay timing dynamically (e.g., using notification args). As an example, maybe your notification 'cardPlayed' should pause for a different amount of time depending on the number or type of cards played.

For this case, use **setSynchronous** without specifying the duration and use **setSynchronousDuration** within the notification callback.

- NOTE: If you forget to invoke **setSynchronousDuration**, the game will remain paused forever!

```js
setupNotifications: function () {
    dojo.subscribe( 'cardPlayed', this, 'notif_cardPlayed' );
    this.bga.gameui.notifqueue.setSynchronous( 'cardPlayed' ); // wait time is dynamic
    ...
},

notif_cardPlayed: function (notif) {
    // MUST call setSynchronousDuration

    // Example 1: From notification args (PHP)
    this.bga.gameui.notifqueue.setSynchronousDuration(notif.args.duration);
    ...

    // Or, example 2: Match the duration to a Dojo animation
    var anim = dojo.fx.combine([
        ...
    ]);
    anim.play();
    this.bga.gameui.notifqueue.setSynchronousDuration(anim.duration);
},
```

You can also manually call this.bga.gameui.notifqueue.setSynchronousDuration(0) once client operations are finished, but be careful that even fast replay still has a path to call it.

**WARNING: combining synchronous and ignored notifications**
You must be careful when combining dynamic synchronous durations (as described above) with ignored notifications. If you have a conditionally ignored notification like this (see below section):

```js
this.bga.gameui.notifqueue.setIgnoreNotificationCheck( 'myNotif', (notif) => (notif.args.player_id == this.bga.players.getCurrentPlayerId()) /* or any other condition */ )
```

then you CANNOT do

```
this.bga.gameui.notifqueue.setSynchronous('myNotif');
```

as, when the ignored check passes, the notification handler, in which `this.bga.gameui.notifqueue.setSychronousDuration` is called, is never called and so the duration is never set and interface locking results.

The workaround is to set a "dummy" time:

```
this.bga.gameui.notifqueue.setSynchronous('myNotif', 5000);
```

whose value is irrelevant but must be large enough to cover the time before the notification handler is called. The large value never actually comes into play because the notification is either ignored, or the synchronous duration is reset to a sensible value inside the handler.

### Pre-defined notification types

**tableWindow** - This defines notification to display [Scoring Dialogs](https://en.doc.boardgamearena.com/Game_interface_logic:_yourgamename.js#Scoring_dialogs "Game interface logic: yourgamename.js"), see below.

**message** - This defines notification that shows on players log and have no other effect (technically any unhandled notification will do the same but its recommended to use this keyword for consistency)

```php
  // You can call this on php side without doing anything on client side
   $this->bga->notify->all( 'message', clienttranslate('hello'), [] );
```

**simplePause** - This notification will just delay other notifications, maybe useful if you know you need some extra time for animation or something. Requires a time parameter.

```php
    $this->bga->notify->all( 'simplePause', '', [ 'time' => 500] ); // time is in milliseconds
```

Note: the following types are RESERVED by framework, do not use:

gameStateChange gameStateChangePrivateArg gameStateMultipleActiveUpdate newActivePlayer playerstatus yourturnack clockalert tableInfosChanged playerEliminated tableDecision archivewaitingdelay end_archivewaitingdelay replaywaitingdelay end_replaywaitingdelay replayinitialwaitingdelay end_replayinitialwaitingdelay aiPlayerWaitingDelay replay_has_ended updateSpectatorList wouldlikethink updateReflexionTime undoRestorePoint resetInterfaceWithAllDatas zombieModeFail zombieModeFailWarning aiError skipTurnOfPlayer zombieBack allPlayersAreZombie gameResultNeutralized playerConcedeGame showTutorial showCursor showCursorClick skipTurnOfPlayerWarning banFromTable resultsAvailable switchToTurnbased newPrivateState infomsg

## Tooltips

### Adding static tooltips

**this.bga.gameui.addTooltip(nodeId: string, helpStringTranslated: string, actionStringTranslated: string, delay?: number): void**

Add a simple text tooltip to the DOM node.

Specify 'helpStringTranslated' to display some information about "what is this game element?".
Specify 'actionStringTranslated' to display some information about "what happens when I click on this element?".

You must specify both of the strings. You can only use one and specify an empty string (*) for the other one.*

When you pass text directly function _() must be used for the text to be marked for translation! Except for empty string.

Parameter "delay" is optional. It is primarily used to specify a zero delay for some game element when the tooltip gives really important information for the game - but remember: no essential information must be placed in tooltips as they won't be displayed in some browsers (see [Guidelines](https://en.doc.boardgamearena.com/BGA_Studio_Guidelines "BGA Studio Guidelines")).

Example:

```
   this.bga.gameui.addTooltip( 'cardcount', _('Number of cards in hand'), '' );
```

Note: this generates static tooltip and attaches to existing dom element, if you need to generate tooltip more dynamically you have to call that method every time information about object is updated or use completely different tehnique, see dynamic tooltips below.

**this.bga.gameui.addTooltipHtml(nodeId: string, html: string, delay?: number): void**

Add an HTML tooltip to the DOM node (for more elaborate content such as presenting a bigger version of a card).

**this.bga.gameui.addTooltipToClass(cssClass: string, helpStringTranslated: string, actionStringTranslated: string, delay?: number ): void**

Add a simple text tooltip to all the DOM nodes set with this cssClass. See more details above for this.bga.gameui.addTooltip.

```
    this.bga.gameui.addTooltipToClass( 'meeple', _('This is A Meeple'), _('Click to tickle') );
```

IMPORTANT: all concerned nodes must exist and have IDs to get tooltips.

**this.bga.gameui.addTooltipHtmlToClass(cssClass: string, html: string, delay?: number): void**

Add an HTML tooltip to to all the DOM nodes set with this cssClass (for more elaborate content such as presenting a bigger version of a card).

IMPORTANT: all concerned nodes must exist and have IDs to get tooltips.

### Removing static tooltips

**this.bga.gameui.removeTooltip(nodeId: string): void**

Remove a tooltip from the DOM node with given id.

### Advanced tooltips

**force tooltip to open**

If you want to force tooltip to open in reaction to some other action, i.e. click you can do this

```
  this.bga.gameui.tooltips[id].open(id)
```

where id is the id of the tooltip node where tooltip was installed.

**dynamic tooltips**

See [BGA_Studio_Cookbook#Dynamic_tooltips](https://en.doc.boardgamearena.com/BGA_Studio_Cookbook#Dynamic_tooltips "BGA Studio Cookbook")

**tooltips on mobile**

Tooltips is very unreliable on mobile, it is recommended to implement some other method to obtaining same information,
such as simple click handler in dedicated "Help" mode or provide dedicated clickable areas such as corner of card.

## Banners

The framework comes with predefined banners.

### Last turn banner

When someone fulfills one of the end of the game conditions, so this is the last turn.

**this.bga.gameArea.addLastTurnBanner(message?: string, args?: any): void;**

If message is unset, default is "This is the last turn!". For args example, see the addWinConditionBanner example that works the same way.

Example:

```
    this.bga.gameArea.addLastTurnBanner(
        _('This is the last turn! (deck is empty)')
    );
```

[![Last turn banner example.png](/images/3/31/Last_turn_banner_example.png)](https://en.doc.boardgamearena.com/File:Last_turn_banner_example.png)

If the action triggering the last turn banner is cancelled, you can remove the banner by using

**this.bga.gameArea.removeLastTurnBanner(): void;**

### Win condition banner

When the game has multiple win conditions, use this function to display a message detailing which win condition was reached.

**this.bga.gameArea.addWinConditionBanner(message?: string, args?: any): void;**

Example:

```js
    const winConditionText = _('${player_name} reached the Victory space of the Fame track and wins the game by being the most celebrated Monster!');
    this.bga.gameArea.addWinConditionBanner(
        winConditionText,
        { 'player_name': this.bga.players.getFormattedPlayerName(winnerId) }
    );
```

[![Win condition banner example.png](/images/2/2b/Win_condition_banner_example.png)](https://en.doc.boardgamearena.com/File:Win_condition_banner_example.png)

## Warning messages

Sometimes, there is something important that is happening in the game and you have to make sure the player get the message. For example, explain why the player cannot do an action he can usually do when he clicks an element, if you don't need the PHP to validate the possibility.

**this.bga.dialogs.showMessage(msg: string, type: string): void**

showMessage shows a message in a big rectangular area on the top of the screen of the current player, and it disappears after few seconds (also it will be in the log in some cases).

- "msg" is the string to display. It should be translated.
- "type" can be set to "info", "error", "only_to_log" or custom string. If set to "info", the message will be an informative message on a white background. If set to "error", the message will be an error message on a red background and it will be added to log. If set to "only_to_log", the message will be added to the game log but will not popup at the top of the screen.

If set to custom string, it will be transparent, to use custom type define "head_xxx" in css, where xxx is the type. For example if you want yellow warning, use "warning" as type and add this to css:

```css
.head_warning {
   background-color: #e6c66e;
}
```

Important: the normal way to inform players about the progression of the game is the game log. The "showMessage" is intrusive and should not be used often.

```js
    notif_messageinfo: function(notif) {
	if (!g_archive_mode) {
        	var message = this.bga.gameui.format_string_recursive(notif.log, notif.args);
		this.bga.dialogs.showMessage(_('Announcement:') + " " + message, 'info');		
         }
    },
```

Show message could be used on the client side to prevent user wrong moves before it is send to server.
Example from 'battleship':

```
onGrid: function(event) {
     if (checkIfPlayerTriesToFireOnThemselves(event)) {
        this.bga.dialogs.showMessage(_('This is your own board silly!'), 'error');
        return;
     }
     ...
},
```

**this.bga.dialogs.showMoveUnauthorized(): void**

Shows predefined user error that move is unauthorized now

```
onPet: function(event) {
     if (checkPet(event)==false) {
        this.bga.dialogs.showMoveUnauthorized();
        return;
     }
     ...
},
```

## Dialogs

### Confirmation dialog

When an important action with a lot of consequences is triggered by the player, you may want to propose a confirmation dialog.

CAREFUL: the general guideline of BGA is to AVOID the use of confirmation dialogs. Confirmation dialogs slow down the game and bother players. The players know that they have to pay attention to each move when they are playing online.

The situations where you should use a confirmation dialog are the following:

- It must not happen very often during a game.
- It must be linked to an action that can really "kill a game" if the player does not pay attention.
- It must be something that can be done by mistake (ex: a link on the action status bar).

**this.bga.dialogs.confirmation(message: string): Promise<boolean>**

- message - message will be shown to user, use _() to translate

NOTE: this is an async function, you must handle the consequence in the result of the promise

How to display a confirmation dialog:

```js
    this.bga.dialogs.confirmation(_("Are you sure you want to bake a pie?")).then(result => {
      if (result) { 
        this.bakeThePie();
      }
    });
    return; // nothing should be called or done after calling this, all action must be done in the handler
```

If you're migrating from this.confirmationDialog, you'll need to move the callback function into the `then` as it's now Promise-based

### Multiple choice dialog

You can use this dialog to give user a choice with small amount of options

**this.bga.dialogs.multipleChoice(message: string, choices: string[]): Promise<string | null>**

- message - message will be shown to user, use _() to translate
- choices - array of choices

NOTE: this is an async function, you must handle the consequence in the result of the promise. If the user cancels, it returns null.

Example:

```js
    const keys = ["0", "1", "5", "10"];
    this.bga.dialogs.multipleChoice(_("How many bugs to fix?"), keys).then(choice => {
      if (choice === null) { return; } // cancel operation, do not call server action
      const bugchoice = keys[choice]; // choice will be 0,1,2,3 here
      this.bga.actions.performAction("fixBugs", { number: bugchoice });
    });
    return; // must return here
```

If you're migrating from this.multipleChoiceDialog, you'll need to move the callback function into the `then` as it's now Promise-based

### Generic Dialogs

As a general rule, you shouldn't use dialogs windows.

BGA guidelines specify that all game elements should be displayed on the main screen. Players can eventually scroll down to see game elements they don't need to see anytime, and you may eventually create anchors to move between game area section. Of course dialogs windows are very practical, but the thing is: all players know how to scroll down, and not all players know how to show up your dialog window. In addition, when the dialog shows up, players can't access the other game components.

Sometimes although, you need to display a dialog window. Here is how you do this:

```js
 // Create the new dialog over the play zone. You should store the handler in a member variable to access it later
 const myDlg = new ebg.popindialog();
 myDlg.create( 'myDialogUniqueId' );
 myDlg.setTitle( _("my dialog title to translate") );
 myDlg.setMaxWidth( 500 ); // Optional
 
 // Create the HTML of my dialog. 
 const html = `My template with ${arg1}
   <button type="button" id="ok-btn" class="bgabutton bgabutton_blue">${_('OK')}</button>
 `;  
 
 // Show the dialog
 myDlg.setContent( html ); // Must be set before calling show() so that the size of the content is defined before positioning the dialog
 myDlg.show();
 
 // Now that the dialog has been displayed, you can connect your method to some dialog elements
 // Example, if you have an "OK" button in the HTML of your dialog:
 document.getElementById('ok-btn').addEventListener('click', () => myDlg.destroy());
```

If necessary, you can remove the default top right corner 'close' icon, or replace the function called when it is clicked:

```
 // Removes the default close icon
 myDlg.hideCloseIcon();
```

```js
 // Replace the function call when it's clicked
 myDlg.replaceCloseCallback((event) => { ... });
```

### Scoring dialogs

Sometimes at the end of a round you want to display a big table that details the points wins in each section of the game.

Example: in Hearts game, we display at the end of each round the number of "heart" cards collected by each player, the player who collected the Queen of Spades, and the total number of points loose by each player.

Scoring dialogs are managed entirely on **PHP side**, but they are described here as their effects are visible only on client side.

Displaying a scoring dialog is quite simple and is using a special notification type: "tableWindow":

```php
  // on PHP side:
  $this->bga->notify->all( "tableWindow", '', array(
            "id" => 'finalScoring',
            "title" => clienttranslate("Title of the scoring dialog"),
            "table" => $table
        ));
```

The "table" argument is a 2 dimensional PHP array that describes the table you want to display, line by line and column by column.

Example: display an 3x3 array of strings

```php
   $table = [
      [ "one", "two", "three" ],    // This is my first line
      [ "four", "five", "six" ],    // This is my second line
      [ "seven", "height", "nine" ]    // This is my third line
   ];
```

As you can see above, in each "cell" of your array you can display a simple string value. But you can also display a complex value with a template and associated arguments like this:

```php
   $table = [
      [ "one", "two", [ "str" => clienttranslate("a string with an ${argument}"), "args" => [ 'argument' => 'argument_value' ] ] ],
      [ "four", "five", "six" ], 
      [ "seven", "height", "nine" ]
   ];
```

This is especially useful when you want to display player names with colors. Example from "Hearts":

```php
        $firstRow = [ '' ];
        foreach( $players as $player_id => $player )    {
            $cell = [ 'str' => '${player_name}',
                      'args' => [ 'player_name' => $player['player_name'] ],
                      'type' => 'header'
                    ];
            $firstRow[] = $cell;
        }
        $table[] = $firstRow;
        ...
```

You can also use three extra attributes in the parameter array for the notification:

- **header**: the content for this parameter displays before the table (also, the html will be parsed and player names will be colored according to the current game colors).
- **footer**: the content for this parameter displays after the table (no parsing for coloring the player names)
- **closing**: if this parameter is used, a button will be displayed with this label at the bottom of the popup and will allow players to close it (more easily than by clicking the top right 'cross' icon).

```php
   $this->bga->notify->all( "tableWindow", '', [
            "id" => 'finalScoring',
            "title" => clienttranslate("Title of the scoring dialog"),
            "table" => $table,
            "header" => ['str' => clienttranslate('Table header with parameter ${number}'),
                                 'args' => [ 'number' => 3 ],
                               ],
            "footer" => '<div class="myfoot"></div>',
            "closing" => clienttranslate( "Closing button label" )
        ] );
```

Note: currently id is not used - so you cannot access resulting div by id on js side

Note: any translatable string have to be wrapped by clienttranslate() on top level OR it has to be recursive template.

DO NOT DO THIS:

```js
   "footer" => '<div>'.clienttranslate( "The end" ).'</div>', // this will not work for translations!!!
```

### Scoring animated display

Sometimes, you may want to display a score value over an element to make the scoring easier to follow for the players (Terra Mystica final scoring for example).
You can do it with:

**this.bga.gameui.displayScoring(anchor_id: string, color: string, score: number | string, duration?: number, offset_x?: number, offset_y?: number): void**

**anchor_id**: ID of the html element to place the animated score onto (without the '#')

**color**: hexadecimal RGB representation of the color (should be the color of the scoring player), but without a leading '#'. For instance, 'ff0000' for red.

**score**: numeric score to display, prefixed by a '+' or '-'

**duration**: animation duration in milliseconds (optional, default is 1000)

**offset_x** and **offset_y**: if both offset_x and offset_y are defined and not null, apply the following offset (in pixels) to the scoring animation.
Note that the score is centered in the anchor, so the offsets might have to be negative if you calculate the position.

Note: if you want to display successively each score, you can use *this.bga.gameui.notifqueue.setSynchronous()* function.

```js
    setupNotifications: function()   {
           dojo.subscribe( 'displayScoring', this, "notif_displayScoring" );
           ...
    }
...

    notif_displayScoring: function(notif) {
            const duration = notif.args.duration?notif.args.duration:1000;
            this.bga.gameui.notifqueue.setSynchronous('displayScoring', duration );
	    this.bga.gameui.displayScoring( notif.args.target, notif.args.color, notif.args.score, duration);
    },
```

### Speech bubble

For better interactivity in some games (Love Letter for example), you may use comic book style speech bubbles to express the players voices.
This is done with showBubble:

**this.bga.gameui.showBubble(anchor_id: string, text: string, delay?: number, duration?: number, custom_class?: string): void**

- anchor_id - where to attach the bubble
- text - what to put in bubble, can be html
- delay - delay in milliseconds (optional, default 0)
- duration - duration of animation in milliseconds (optional, default 3000)
- custom_class - extra class to add to bubble (optional), if you need to override the default bubble style

```
   this.bga.gameui.showBubble('meeple_2', _('Hello'), 0, 1000, 'pink_bubble');
```

```js
  notif_speechBubble(notif) {
    var html = this.bga.gameui.format_string_recursive(notif.args.text, notif.args.args);
    this.bga.gameui.showBubble(notif.args.target, html, notif.args.delay ?? 0, notif.args.duration ?? 1000);
  },
```

**Warning**: if your bubble could overlap other active elements of the interface (buttons in particular), as it stays in place even after disappearing, you should use a custom class to give it the style "pointer-events: none;" in order to intercept click events.

Note: If you want this visually, but want to take complete control over this bubble and its animation (for example to make it permanent) you can just use div with 'discussion_bubble' class on it, and content of div is what will be shown.

## Translations

See [Translations](https://en.doc.boardgamearena.com/Translations "Translations")

## Players panels

### Adding stuff to player's panel

**this.bga.playerPanels.getElement(player_id: number): HTMLElement**

Returns the div in the player panel you can put your counters & other indicators in.

**Example**
Add this piece of code in your JS file to add this template to each player panel:

```js
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                         
                // Setting up players boards if needed
                const html = `<div class="cp_board">
                    <div id="stoneicon_p${player.id}" class="gmk_stoneicon gmk_stoneicon_${player.color}"></div><span id="stonecount_p${player.id}">0</span>
                </div>`;
                this.bga.playerPanels.getElement(player_id).insertAdjacentHTML('beforeend', html);
            }
```

(Note: the code above is of course from your "setup" function in your Javascript).

Very often, you have to distinguish current player and others players. In this case, you just have to change the content of the `html` variable when "player_id" is different than "this.bga.players.getCurrentPlayerId()".

**this.bga.playerPanels.getElementByNo(playerNo: number): HTMLElement**

Same as getElement but using playerNo instead of playerId.

### Adding a player panel for an automata

**this.bga.playerPanels.addAutomataPlayerPanel(id: number, name: string, params: Object): void**

The id is the automata id, used to setup the player panel score counter and getPlayerPanelElement. 0 or negative value is recommended, to avoid conflict with real player ids.

Parameters:

- id: the automata id, used to setup the player panel score counter and getPlayerPanelElement. 0 or negative value is recommended, to avoid conflict with real player ids.
- name: the name of the automata
- params: object optionally containing one or more of the following:
  - color: string - the automata player color (default black)
  - iconClass: string - the class, or list of classes separated by spaces, to apply to the player picture.
  - score: number - the automata score (default undefined, will display '-')

Example from Glow, with the automata Tom when playing solo :

```
this.bga.playerPanels.addAutomataPlayerPanel(0, 'Tom', {
    iconClass: 'tom-avatar',
    score: gamedatas.tom.score,
});
```

### Player's panel disabling/enabling

**this.bga.gameui.disablePlayerPanel(player_id: number): void**

Disable given player panel (the panel background become gray).

Usually, this is used to signal that this played passes, or will be inactive during a while.

Note that the only effect of this is visual. There are no consequences on the behaviour of the panel itself.

**this.bga.gameui.enablePlayerPanel(player_id:number): void**

Enable a player panel that has been disabled before.

**this.bga.gameui.enableAllPlayerPanels(): void**

Enable all player panels that has been disabled before.

### Player order

**this.bga.gameui.updatePlayerOrdering(): void**

This function makes sure that player order in player's panel matches this.gamedatas.playerorder and its normally called by framework.
You can call it yoursel if you change this.gamedatas.playerorder from notification.
Also you can override this function to change defaults OR insert a non-player panel [BGA_Studio_Cookbook#Inserting_non-player_panel](https://en.doc.boardgamearena.com/BGA_Studio_Cookbook#Inserting_non-player_panel "BGA Studio Cookbook").

### Counters

**this.bga.playerPanels.getScoreCounter(player_id: number): Counter**

Returns the score counter on the player panel.

To create other counters on the player panel, please use the "ebg/counter" library, documented at [Counter](https://en.doc.boardgamearena.com/Counter "Counter").

**this.bga.playerPanels.getScoreCounterByNo(playerNo: number): Counter**

Same as getScoreCounter but using playerNo instead of playerId.

## BGA GUI components

BGA framework provides some useful ready-to-use components for the game interface:

[Studio#BGA_Studio_game_components_reference](https://en.doc.boardgamearena.com/Studio#BGA_Studio_game_components_reference "Studio")

Note that each time you are using an additional component, you must declare it at the top of your Javascript file in the list of modules used.

Example with the Game.js file:

```js
const BgaAnimations = await importEsmLib('bga-animations', '1.x');
const [Counter, Stock] = await importDojoLibs(["ebg/counter", "ebg/stock"]);
```

Example with the legacy way if you are using "ebg.stock":

```
define([
    "dojo","dojo/_base/declare",
    "ebg/stock"  /// <=== we are using ebg.stock module
],
```

## BGA Buttons

### Basic Button

**this.bga.gameui.addActionButton(id: string, label: string, method: string | eventhandler, destination?: string, blinking?: boolean, color?: string): void**

***Deprecated, use [this.bga.statusBar.addActionButton](#Status_bar_buttons) instead***

You can use this method to add an action button in the main action status bar (or other places).

Arguments:

- id: an element ID that should be unique in your HTML DOM document.
- label: the text of the button. Should be translatable (use _() function). Note: this can also be any html, such as "", see example below on how to make image action buttons.
- method: the name of your method that must be triggered when the player clicks on this button (can be name of the method on game class or handler).
- destination (optional): id of parent on where to add button, ONLY use in rare cases if location is not action bar. Use **null** as value if you need to specify other arguments.
- blinking (optional): if set to **true**, the button is going blink to catch player's attention. Please DO NOT abuse blinking button. If you need button to blink after some time passed add class 'blinking' to the button later.
- color: could be **blue** (default), **red**,**gray** or **none**.

## Image loading

See also [Game_art:_img_directory](https://en.doc.boardgamearena.com/Game_art:_img_directory "Game art: img directory").

**Be careful**: by default, ALL images at the root of your img directory are loaded on a player's browser when he loads the game. For this reason, don't let in your img directory images that are not useful, otherwise it's going to slowdown the game load. Images in a subfolder of img are NOT preloaded by default.

**this.bga.images.dontPreloadImage(image_file_name: string)**

**this.bga.images.dontPreloadImages(image_file_names: string[])**

Using dontPreloadImage, you tell the interface to not preload a specific image in your img directory. dontPreloadImages is the same for multiple images at once.

Examples of use:

```js
// don't preload a particular image
this.bga.images.dontPreloadImage( 'cards.png' );

// don't preload a list of unused images (gamedatas.clans contains the number of the clans used in this game).
this.bga.images.dontPreloadImages([1,2,3,4,5,6].filter(clan => !gamedatas.clans.include(clan)).map(clan => `clan${clan}.png`));
```

**this.bga.images.preloadImage(image_file_name: string)**

**this.bga.images.preloadImages(image_file_names: string[])**

Opposite of dontPreloadImage, useful only for images that are not in the root img folder
Example of use:

```
// preload a particular image
if (gamedatas.expansionActive) {
  this.bga.images.preloadImages(['expansion/board.jpg', 'expansion/new-cards.jpg']);
}
```

**this.bga.images.getImgUrl(filename?: string): string**

Returns the URL of an image, if you need to set it in JS (usually they will be referenced in the CSS file and don't need JS).
Example of use:

```js
  const boardImgUrl = this.bga.images.getImgUrl('board.jpg');
  const expansionBoardImgUrl = this.bga.images.getImgUrl('expansion/board.jpg'); // you can use subfolders
  const imgUrl = this.bga.images.getImgUrl(); // you can use empty, and append the image file name later on : it will return the URL until `img/`
```

## Sounds

For each sound you want to add, there should be a .ogg and a .mp3 with that file name in the sounds folder. See [Game sounds: sounds directory](https://en.doc.boardgamearena.com/Game_sounds:_sounds_directory "Game sounds: sounds directory") for more details.

**Be careful**: by default, ALL sounds at the root of your sounds directory are loaded on a player's browser when he loads the game. For this reason, don't let in your sounds directory images that are not useful, otherwise it's going to slowdown the game load. Sounds in a subfolder of imgsoundsare NOT preloaded by default.

**this.bga.sounds.dontPreloadSounds(sound_file_names: string[])**

Using dontPreloadSounds, you tell the interface to not preload a specific sound in your sound directory. The extension should not be set, it will automatically do it for filename.mp3 and filename.ogg.

Examples of use:

```
// don't preload a particular sound
this.bga.sounds.dontPreloadSounds(['automata-move']);
```

**this.bga.sounds.preloadSounds(sound_file_names: string[])**

Opposite of dontPreloadSounds, useful only for sounds that are not in the root sounds folder
Example of use:

```
// preload a particular image
if (gamedatas.expansionActive) {
  this.bga.sounds.preloadSounds(['expansion/extramove']);
}
```

**this.bga.sounds.load(id: string, label: string, fileName: string = undefined): void**

**deprecated** move the sounds in the `sounds` folder to benefit from autoloading, then remove this call.

Load a sound (from img folder) and register its id. Filename is without the extension. If fileName is unset, it will use the same as the id.

**this.bga.sounds.play(id: string): void**
Play a sound by its id (the filename without extension).

Examples :

```
this.bga.sounds.play('play'); 
this.bga.sounds.play('claw');
```

**this.bga.gameui.disableNextMoveSound(): void**
Disable the standard "move" sound for this move (to replace it with your custom sound):

Add this to your notification handler:

```
this.bga.gameui.disableNextMoveSound();
```

Note: it only disable the sound for the next move.

## Status bar

### Status bar text

**this.bga.statusBar.setTitle(title: string, args?: object)**

Update the page title (aka status bar prompt). Can handle ${you} and ${actplayer} and any other var you would pass as args.

```js
if (args.mandatory_card_name) {
    const mandatoryCardTitle = this.bga.players.isCurrentPlayerActive() ? _('${you} must take ${mandatory_card_name}') : _('${actplayer} must take ${mandatory_card_name}');
    this.bga.statusBar.setTitle(mandatoryCardTitle, args);
}
```

As opposed to `updatePageTitle`, it doesn't trigger the call `onUpdateActionButtons`.

**this.bga.gameui.updatePageTitle()**
:   This function allows to update the current page title and turn description according to the game state arguments. If the current game state description this.gamedatas.gamestate.descriptionmyturn is modified before calling this function it allows to update the turn description without changing state. This will handle arguments substitutions properly.

Note: this functional also will calls this.onUpdateActionButtons, if you want different buttons then state defaults, use method in example to replace them, if it becomes too clumsy use client states (see above)

**DEPRECATED:** use this.bga.statusBar.setTitle instead.

### Status bar buttons

**this.bga.statusBar.addActionButton(label: string, callback: Function, params?: object): HTMLButtonElement**

Parameters:

- label: the label to be shown, can be html. If label if used pass traslated string, i.e. _('Yes')
- callback: function to call on click, cannot be method name it has to be function
- params: object optionally containing one of more of the following:
  - color: string - can be `primary` (default) (blue), `secondary` (gray), `alert` (red)
  - id: string - is the dom element id to set. If null/undefined, the button will not have an id, but you can still manipulate it by storing the reference to the DOM Element returned by the function
  - classes: string|string[] - i.e `'disabled blinking'` or `['disabled', 'blinking']`.
  - destination: ElementOrId - the DOM Element to add the button to. If not specified, will add it to the status bar.
  - title: string - plain text description of the label. Should be set when the button label is an icon, for accessibility.
  - disabled: boolean - makes the button disabled. Will prevent the callback to be executed
  - tooltip: string - the tooltip of the button
  - confirm: string | Function - the confirm message to display before triggering the callback, if set (or function handler, see example below).
  - autoclick: boolean | { abortSignal: AbortSignal, pausable: boolean } - if the button should be auto clicked after a small delay (for Confirmation buttons)

Example of a standard call without params:

```js
 this.bga.statusBar.addActionButton(_('Pass'), () => this.bga.actions.performAction('actPass', {}));
```

Example of a standard call with params:

```js
 this.bga.statusBar.addActionButton(_('Pass'), () => this.bga.actions.performAction('actPass', {}), {
   id: 'my_button',
   color: 'secondary',
   classes: 'my-outline-class'
   disabled: true,
   tooltip: _('You cannot pass'),
   confirm: _('Are you sure to pass?'),
 });
```

Note: the confirm parameter can be a string or a function that returns a string or null

Example of a standard call with params:

```js
 this.bga.statusBar.addActionButton(_('Discard Selected Cards'), () => this.bga.actions.performAction('actDiscard', { cardIds: this.getSelectedCardIds().join(',') }), {
   confirm: () => {
     if (this.getSelectedCardIds().length === 0) { // no card is selected, show the warning
       return _('Are you sure you don't want to discard any cards?');
     } else { // cards are selected, do not show the warning
       return null;
     }
   }
 });
```

Example of confirm button with autoclick animation:

```js
 this.bga.statusBar.addActionButton(_('Confirm'), () => this.bga.actions.performAction('actConfirm', {}), {
   autoclick: true
 });
 // if you have a user preference to auto-confirm
 this.bga.statusBar.addActionButton(_('Confirm'), () => this.bga.actions.performAction('actConfirm', {}), {
   autoclick: this.bga.userPreferences.get(100) == 1, // adapt to your user preference id and values
 });
```

Example of confirm button with autoclick animation and a pause button:

```js
 this.bga.statusBar.addActionButton(_('Confirm'), () => this.bga.actions.performAction('actConfirm', {}), {
   autoclick: { pausable: true }
 });
 // if you have a user preference to auto-confirm
 this.bga.statusBar.addActionButton(_('Confirm'), () => this.bga.actions.performAction('actConfirm', {}), {
   autoclick: this.bga.userPreferences.get(100) == 1 ? { pausable: true } : null, // adapt to your user preference id and values
 });
```

Example of confirm button with autoclick animation and a button to stop the timer: (use ONLY if pausable setting isn't enough)

```js
 const abortController = new AbortController();
 this.bga.statusBar.addActionButton(_('Confirm'), () => this.bga.actions.performAction('actConfirm', {}), {
   autoclick: { abortSignal: abortController.signal }
 });
 this.bga.statusBar.addActionButton(_("Let me think!"), () => abortController.abort(), { color: 'secondary' });
```

Example of confirm button with autoclick animation and a button to stop the timer, and a user preference about timer: (use ONLY if pausable setting isn't enough)

```js
 const isUsingTimer = this.bga.userPreferences.get(100) == 1;
 const abortController = new AbortController();
 this.bga.statusBar.addActionButton(_('Confirm'), () => this.bga.actions.performAction('actConfirm', {}), {
   autoclick: isUsingTimer ? { abortSignal: abortController.signal } : false
 });
 if (isUsingTimer) {
   this.bga.statusBar.addActionButton(_("Let me think!"), () => abortController.abort(), { color: 'secondary' });
 }
```

Note: the button label can be HTML, if you want to put some images on the label.

**this.bga.statusBar.removeActionButtons()**

Removes all buttons from title bar

## User preferences

**this.bga.userPreferences.get(pref_id)**

Return the value of a user preference. It will return the value currently selected in the select combo box, in the top-right menu.

**this.bga.userPreferences.set(pref_id, value)**

Programmatically change a user preference. It will have the same effect as if the player changed the value in the select combo box, in the top-right menu.

**this.bga.userPreferences.onChange**

A callback you can define if you want to be notified when a user changes a user preference.

Example:

```js
// in your Game constructor
this.bga.userPreferences.onChange = (pref_id, pref_value) => this.myGamePreferenceChanged(pref_id, pref_value);

myGamePreferenceChanged: function(pref_id, pref_value) {
  switch (pref_id) {
    case 201: 
      document.getElementsByTagName('html')[0].classList.toggle('dark-background', pref_value == 2);
      break;
  }
}
```

**this.bga.userPreferences.toggleVisibility(pref_id, visible)**

Hide or show a user preference.

Example:

```
myGamePreferenceChanged: function(pref_id, pref_value) {
  switch (pref_id) {
    case 101: 
      // if pref 101 is "Confirm moves" and 102 is "Countdown timer on confirm", we hide the countdown user preference when confirm moves is disabled.
      this.bga.userPreferences.toggleVisibility(102, prefValue != 2);
      break;
  }
}
```

## Including classes from external files

You can declare multiple classes in the Game.js file, as long as you export a Game class in the end.

If you want to split your code into multiple js files, export the classes of the file using `export class PlayerManager {...}`. You can export multiple classes from the same file file that way.

Then you can import the class in the Game.js file using `import { PlayerManager, PlayerTable } from "./PlayerManager.js";` at the top of the file.

## Other useful stuff

**this.bga.gameui.onScreenWidthChange = () => this.myWidthChangeCallback()**
:   This function can be overridden in your game to manage some resizing on the client side when the browser window is resized. This function is also triggered at load time, so it can be used to adapt to the :viewport size at the start of the game too.

this.bga.gameui.bRealtime
:   Return true if the game is in realtime. Note that having a distinct behavior in realtime and turn-based should be exceptional.

globalThis.g_replayFrom
:   Global contains replay number in live game, it is set to undefined (i.e. not set) when it is not a replay mode, so consequentially the good check is **typeof g_replayFrom != 'undefined'** which returns true if the game is in replay mode *during the game* (the game is ongoing but the user clicked "replay from this move" in the log)

globalThis.g_archive_mode
:   Returns true if the game is in archive mode *after the game* (the game has ended)

this.bga.gameui.instantaneousMode
:   Returns true during replay/archive mode if animations should be skipped. Only needed if you are doing custom animations. (The BGA-provided animation functions like the bga-animations, bga-cards, bga-dice libs and *this.bga.gameui.slideToObject()* and similar automatically handle instantaneous mode.)
:   Technically, when you click "replay from move #20", the system replays the game from the very beginning with moves 0 - 19 happening in instantaneous mode and moves 20+ happening in normal mode.

globalThis.g_tutorialwritten
:   Returns an object like the below if the game is in tutorial mode, or undefined otherwise. Tutorial mode is a special case of archive mode where comments have been added to a previous game to teach new players the rules.

```
   {
       author: "91577332",
       id: "576",
       mode: "view"
       status: "alpha"
       version_override: null
       viewer_id: "84554161"
   }
```
