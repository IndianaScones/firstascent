# Your game state machine: states.inc.php

> Source: http://en.boardgamearena.com/doc/Your_game_state_machine:_states.inc.php

**IMPORTANT NOTE:** This file is deprecated, you shouldn't need to change it if you use [State classes](https://en.doc.boardgamearena.com/State_classes:_State_directory "State classes: State directory"). See the Reversi tutorial for an example.

This file describes the state machine of your game (all the game states properties, and the transitions to get from one state to another).

Important: to understand the game state machine, it's recommended that you read this presentation first:

[Focus on BGA game state machine](http://www.slideshare.net/boardgamearena/bga-studio-focus-on-bga-game-state-machine)

## Overall structure

The machine states are described by a PHP associative array.

Example:

```php
use Bga\GameFramework\GameStateBuilder;
use Bga\GameFramework\StateType;

$machinestates = [
    // only keep this line if your initial state is not 2. In that case, uncomment and replace '2' by your first state id.
    // 1 => GameStateBuilder::gameSetup(2)->build(),

    2 => GameStateBuilder::create()
        ->name('playerTurn')
        ->description(clienttranslate('${actplayer} must play a card or pass'))
        ->descriptionmyturn(clienttranslate('${you} must play a card or pass'))
        ->type(StateType::ACTIVE_PLAYER)
        ->args('argPlayerTurn')
        ->possibleactions([
            // these actions are called from the front with bgaPerformAction, and matched to the function on the game.php file
            'actPlayCard', 
            'actPass',
        ])
        ->transitions([
            'playCard' => 3, 
            'pass' => 3,
        ])
        ->build(),
    ),
```

## Syntax

### id

The keys determine game state IDs (in the example above: 1 and 2).

IDs must be positive integers.

ID=1 is reserved for the first game state and should not be used (and you must not modify it).

ID=99 is reserved for the last game state (end of the game) (and you must not modify it).

Note: you may use any ID, even an ID greater than 100. But you cannot use 1 or 99.

Note²: You must not use the same ID twice.

Note³: When a game is in prod and you change the ID of a state, all active games (including many turn based) will behave unpredictably.

### name

(**Mandatory**)

The name of a game state is used to identify it in your game logic.

Several game states can share the same name; however, this is not recommended.

Warning! Do not put spaces in the name. This could cause unexpected problems in some cases.

PHP example:

```php

// Get current game state
$state = $this->gamestate->state();
if( $state['name'] == 'myGameState' )
{
...
}
```

JS example:

```
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            case 'myGameState':
            
                // Do some stuff at the beginning at this game state
                ....
                
                break;
```

### type

(**Mandatory**)

You can use 4 types of game states:

- StateType::ACTIVE_PLAYER : 1 player is active and must play. ('activeplayer' if using the old array notation)
- StateType::MULTIPLE_ACTIVE_PLAYER : 1..N players can be active and must play. ('multipleactiveplayer' if using the old array notation)
- StateType::PRIVATE (during multiactive states players can independently move to different private parallel states. ('private' if using the old array notation) See more details [here](#Private_parallel_states).
- StateType::GAME (No player is active. This is a transitional state to do something automatic specified by the game rules.) ('game' if using the old array notation)

### description

(**Mandatory**)

The description is the string that is displayed in the main action bar (top of the screen) when the state is active.

When a string is specified as a description, you must use "clienttranslate" in order for the string to be translated on the client side:

```
 		.description(clienttranslate('${actplayer} must play a card or pass'))
```

In the description string, you can use ${actplayer} to refer to the active player.

You can also use custom arguments in your description. These custom arguments correspond to values returned by your "args" PHP method (see below "args" field).

Example of custom field:

```php

In states.inc.php:
        .description(clienttranslate('${actplayer} must choose ${nbr} identical energies'))
        .args('argMyArgumentMethod')

In mygame.game.php:
    function argMyArgumentMethod(): array
    {
        return [
            'nbr' => 2  // In this case ${nbr} in the description will be replaced by "2"
        ];    
    }
```

Note: You may specify an empty string (*) here if it never happens that the game remains in this state (i.e., if this state immediately jumps to another state when activated).*

Note²: Usually, you specify a string for ACTIVE_PLAYER and MULTIPLE_ACTIVE_PLAYER game states, and you specify an empty string for GAME game states. BUT, if you are using synchronous notifications, the client can remain on a GAME type game state for a few seconds, and in this case it may be useful to display a description in the status bar while in this state.

### descriptionmyturn

(**Mandatory** when the state type is ACTIVE_PLAYER or MULTIPLE_ACTIVE_PLAYER)

"descriptionmyturn" has exactly the same role and properties as "description", except that this value is displayed to the current active player - or to all active players in case of a MULTIPLE_ACTIVE_PLAYER game state.

In general, we have this situation:

```
        .description(clienttranslate('${actplayer} can take some actions'))
        .descriptionmyturn(clienttranslate('${you} can take some actions'))
```

Note: you can use ${you} in descriptionmyturn so the description will display "You" instead of the name of the player.

Note 2: you can use ${otherplayer} to refer to some other player if you want this to be shown in player's color, but you must provide otherplayer_id as argument (along with otherplayer) to specify this player's id in this case or game won't load.

I.e.

```
.descriptionmyturn(clienttranslate('${you} can follow action of ${otherplayer}'))
```

And this will have to be state arguments for this

```php
    function arg_playerTurnFollow(){
        return ['otherplayer'=> $this->getLeaderPlayerName(),
                'otherplayer_id'=> $this->getLeaderPlayerId()
        ];
    }
```

### action

(**Mandatory** when the state type is GAME)

"action" specifies a PHP method to call when entering this game state.

Example:
In states.inc.php:

```php
        .type(StateType::GAME)
        .action('stGameTurnNextPlayer')
```

In Game.php:

```php
    function stGameTurnNextPlayer() {
        $player_id = (int)$this->getActivePlayerId();
        $next_player_id = (int)$this->getPlayerAfter($player_id);
        $this->giveExtraTime($next_player_id);
        $this->incStat(1, 'turns_number', $next_player_id);
        $this->incStat(1, 'turns_number');
        $this->gamestate->changeActivePlayer($next_player_id);
        $this->gamestate->nextState('next');
    }
```

Usually, for a GAME state type, the action method is used to perform automatic functions specified by the rules (for example: check victory conditions, deal cards for a new round, go to the next player, etc.) and then jump to another game state.

Note: a BGA convention specifies that PHP methods called with "action" are prefixed by "st".

Note: this field CAN be used for player states to set something up; e.g., for MULTIPLE_ACTIVE_PLAYER states, it can make all players active.

Example for action in player state:
in states.inc.php:

```php
        .type(StateType::MULTIPLE_ACTIVE_PLAYER)
        .action('stMultiPlayerInit')
```

in mygame.game.php:

```php
    function stMultiPlayerInit() {
        $this->gamestate->setAllPlayersMultiactive();
    }
```

**Warning**: Prevent to do anything on stGameEnd() and argGameEnd() in Game.php. It may cause game never end and always stuck in "Recording game results + computing statistics in progress...".

### transitions

(**Mandatory**)

With "transitions" you specify which game state(s) you can jump to from a given game state.

Example:

```js
        .name('myGameState')
        .transitions([
            'nextPlayer' => 27,
            'endRound' => 39,
        ])
        ....
    }
```

In the example above, if "myGameState" is the current active game state, I can jump to the game state with ID 27 or the game state with ID 39.

Example to jump to ID 27:

```php
In mygame.game.php:
    $this->gamestate->nextState( "nextPlayer" );
```

Important: "nextPlayer" is the name of the transition, and NOT the name of the target game state. Multiple transitions can lead to the same game state.

Note: If there is only 1 transition, you may give it an empty name.

Example:

```php
In states.inc.php:
    .transitions(["" => 27])

In mygame.game.php:
    $this->gamestate->nextState(  );     // We don't need to specify a transition as there is only one here
```

### possibleactions

(**Mandatory** when the game state is ACTIVE_PLAYER or MULTIPLE_ACTIVE_PLAYER)

"possibleactions" defines the actions possible by the players in this game state, and ensures they cannot perform actions that are not allowed in this state.

Example:

```php
In states.game.php:
       	.possibleactions([ 'actPlayCard', 'actPass' ])

In Game.php:
        function actPlayCard( ...)
        {
             $this->checkAction( "actPlayCard" );    // Will fail if "actPlayCard" is not specified in "possibleactions" in the current game state.

            ....

In mygame.js:
        playCard: function( ... )
        {
            if( this.checkAction( "actPlayCard" ) ) // Will fail if "actPlayCard" is not specified in "possibleactions" in the current game state.
            {  return ;   }
// or 
        playCard: function( ... )
        {
            if( this.bgaPerformAction( "actPlayCard", { id} ) ) // Will not trigger if "actPlayCard" is not specified in "possibleactions" in the current game state.
            {  return ;   }

            ....
```

### args

(optional)

Sometimes it happens that you need some information on the client side (i.e., for your game interface) only for a specific game state.

Example 1: in *Reversi*, the list of possible moves during the playerTurn state.

Example 2: in *Caylus*, the number of remaining king's favors to choose in the state where the player is choosing a favor.

Example 3: in *Can't Stop*, the list of possible die combinations to be displayed to the active player so that he can choose from among them.

In such a situation, you can specify a method name as the « args » argument for your game state. This method must retrieve some piece of information about the game (example: for *Reversi*, the list of possible moves) and return it.

Thus, this data can be transmitted to the clients and used by the clients to display it. It should always be an associative array.

Let's see a complete example using args with *Reversi* game:

In states.inc.php, we specify an **args** argument for gamestate **playerTurn**:

```php
    10 => GameStateBuilder::create()
        ->name('playerTurn')
        ->description(clienttranslate('${actplayer} must play a disc'))
        ->descriptionmyturn(clienttranslate('${you} must play a disc'))
        ->type(StateType::ACTIVE_PLAYER)
        ->args('argPlayerTurn')    // <==== HERE
        ->possibleactions([ 'actPlayDisc' ])
        ->transitions([ "playDisc" => 11, "zombiePass" => 11 ])
    ),
```

It corresponds to a **argPlayerTurn** method in our PHP code (reversi.game.php):

```php
    function argPlayerTurn(): array {
        return [
            'possibleMoves' => $this->getPossibleMoves(),
        ];
    }
```

Then, when we enter into the **playerTurn** game state on the client side, we can highlight the possible moves on the board using information returned by **argPlayerTurn**:

```js
        onEnteringState: function( stateName, args )  {
           console.log( 'Entering state: '+stateName );
            
            switch( stateName )  {
            case 'playerTurn':
                this.updatePossibleMoves( args.args.possibleMoves );
                break;
            }
        },
```

#### Naming and API conventions

As a BGA convention, PHP methods called with "args" are prefixed by "arg" followed by state name (example: **argPlayerTurn**).

All "arg\*" methods are put into corresponding section of Game.php file commented as

```
  //////////// Game state arguments
```

Arg method MUST return array. Return integer or string will result in some undebuggable exceptions.

Arg method MUST be defined in php if it is declared in state description, if you don't need it comment it out from the states.inc.php file (the **args** parameter). If you not sure if you need it or not you can keep it returning empty array until you figure it out.

```php
   function argPlayerTurn(): array {
       return []; // must be an array
   }
```

**Warning**: the "args" method is ALWAYS called before the "action" method so don't expect data modifications by the "action" method to be available in the "args" method!
Also don't modify database in this method!

You should NOT be calling getCurrentPlayer() in the context of this function, since state transitions are broadcasted to all player independent of who initiated it. Instead you should send information on per player basis (Note: if this is private info see section below).

If you using this function in multi-player state, you should not call getActivePlayer() either, you should send per player info:

```php
   function argPlayerTurn(): array {
       $res = [];
       $players = $this->loadPlayersBasicInfos();
       foreach ( $players as $player_id => $player_info ) {
           $color = $player_info ['player_color'];
           $res [$player_id] = array("color"=>$color);
       }
       return $res;
   }
```

Note: you never need to send player color like this, this is just an example.

Note 2: you CAN call methods that return all active players if multi-player states if its relevant.

#### Other usages

You can use values returned by your "args" method to have some custom values in your "description"/"descriptionmyturn", i.e. in states.inc.php:

```
  .descriptionmyturn(clienttranslate('${you} must play ${color} disc'))
```

So arg function will be something like:

```php
 function argPlayerTurn(): array {
       return [ 'color'=>$this->getActivePlayerColor() ]; 
 }
```

You can use args also in **onUpdateActionButtons** function on js side, however two important notes:

- it is just **args** (not args.args like in **onEnteringState**)
- it is args of the current state, which may not be state you think it will be! This method is called during change of active player, which happens in some weird place especially during MULTIPLE_ACTIVE_PLAYER states. If you pulling your hair thinking why its "undefined" on js side - check the current state.

#### Private info in args

By default, all data provided through this method are PUBLIC TO ALL PLAYERS. Please do not send any private data with this method, as a cheater could see it even it is not used explicitly by the game interface logic.

However, it is possible to specify that some data should be sent to specific players only.

**Note: You cannot use Example 1 and Example 2 together. If you have to send private args to multiple players, use Example 2.**

Example 1: send information to active player(s) only:

```php
    function argPlayerTurn(): array {
        return array(
            '_private' => array(          // Using "_private" keyword, all data inside this array will be made private
                'active' => array(       // Using "active" keyword inside "_private", you select active player(s)
                    'somePrivateData' => $this->getSomePrivateData()   // will be send only to active player(s)
                )
            ),
            'possibleMoves' => $this->getPossibleMoves()          // will be sent to all players
        );
    }
```

Inside the js file, these variables will be available through `args.args._private`. (e.g. `args.args._private.somePrivateData` -- it is not `args._private.active.somePrivateData` nor is it `args.somePrivateData`)

Example 2: send information to a specific player (<specific_player_id>) only:

```php
    function argPlayerTurn(): array  {
        $specific_player_id = ...; // calculate some-how
        return array(
            '_private' => array(   // all data inside this array will be private
                $specific_player_id => array(   // will be sent only to that player   
                    'somePrivateData' => $this->getSomePrivateData()   
                )
            ),

            'possibleMoves' => $this->getPossibleMoves()   // will be sent to all players
        );
    }
```

IMPORTANT: in certain situations (i.e. MULTIPLE_ACTIVE_PLAYER game state) these "private data" features can have a significant impact on performance. Please do not use if not needed.

It is also possible to use these private args in the "description" messages, like "${you} have to play ${_private.count} cards".

#### Flag to indicate a skipped state

By default, The front-end will be notified of entering/leaving all states. To speed up the front-end chaining of automatically passed states, you can disable this state change notification, so the front-end doesn't trigger the preparation steps for a state that you know will be automatically skipped, and it may reduce sent args. In this case, define the **_no_notify** flag to true in the state args.

```php
function argPlayerTurn(): array {
  $playableCardsIds = ...;
  return [
    'playableCardsIds' => $playableCardsIds,
    '_no_notify' => count(playableCardsIds) === 0,
  ];
}
function stPlayerTurn(): void {
  $args = $this->argPlayerTurn();
  if ($args['_no_notify']) {
    $this->gamestate->nextState('next');
  }
}
```

In this example, it might avoid a blinking message "You must play a card" (quickly replaced by the next state message) when you cannot play a card and the game automatically skips this state.

IMPORTANT: if you use _no_notify, you must handle a redirection to another state on the st function!

Note that if you play synced notifications during a skipped state, it will display the notifications on the previous state. For example, for an endScore state width description "Computing end score..." sending a lot of animated notifications, you should NOT use this flag so the description is visible.

#### Translations in args

You can do the same as in notification by adding i18n parameter, i.e

```php
function argPlayerTurn(): array {
 return [
      'i18n' => ['terrainName' ],
      'terrainName' => ($this->token_types[$terrain]['name']), // this should be defined in material.inc.php and with clienttranslate 
      'terrain' => $terrain,
   ];
}
```

Than you can do something like this in state:

```
 .descriptionmyturn(clienttranslate('${you} must place a house on ${terrainName}')),
```

See more in [Translations](https://en.doc.boardgamearena.com/Translations "Translations")

### updateGameProgression

(optional)

If you specify ".updateGameProgression(true)" in a game state, your "getGameProgression" PHP method will be called at the beginning of this game state - and thus the game progression of the game will be updated.

*At least one* of your game states (any one) must specify ".updateGameProgression(true)".

### initialprivate

(optional)

This parameter will enable private parallel states in a multiplayer state. Parameter should be set to first private parallel state a player will be transitioned to.
See more details about Private parallel states [here](#Private_parallel_states).

## Implementation Notes

### End Score state

You will often need to do some computation at the end of the game, for end score or for average stats. As you cannot modify the endGame state, it's recommended to create a state just before, that will do it.

On your project skeleton, you'll have

```php
98 => GameStateBuilder::endScore()->build()
```

in your states.inc.php, that will call stEndScore function defined in your Game.php. Use it to do those computations.

For debugging purpose, you can comment this line in your states.inc.php and replace it by

```php
    98 => GameStateBuilder::create()
        ->name('endScore')
        ->description('')
        ->descriptionmyturn('')
        ->type(StateType::ACTIVE_PLAYER)
        ->action('stEndScore')
        ->build(),
```

and comment the nextState on stEndScore. Then you can run your game to the endScore state, test the result, and reload a previous state until your debugging is complete.

### Private parallel states

Private parallel states are useful when multiple players are active and their turn is very complex. In that case it is possible with parallel states for each player to be in a independent state.

Lets say that players need to do three complex action one after another in MULTIPLE_ACTIVE_PLAYER state. With parallel states each player can independently be in a different state (i.e. one player still need to decide about first action while some players are deciding their second action and the fastest player is already on their third action. Normally this can be handled with two simple, but limited, approaches:

- Moving all players to different states together - this is limiting for faster players as they need to wait other players for each separate action. The more problematic thing is that it would be hard to implement an undo feature when one player wants to change their previous action. In that case all players should be moved back to previous state which will interrupt their flow.
- Using client states, by changing the state in which the player is in javascript - the problem with this approach is that players will lose their progress on browser refresh (F5). Furthermore the validation logic of specific actions should be implemented on both server side and client side and we cannot have specific args for each different action, but they should be calculated only at the beginning of the first action and possibly calculated on client side after each action, which again duplicates logic on client and server.

With private parallel states, each specific action can be implemented as a parallel state. Parallel states are defined with the type PRIVATE and players are moved to those private states during one master MULTIPLE_ACTIVE_PLAYER state. Lets look at the example:

```php
    10 => GameStateBuilder::create()
        ->name("playerTurn")
        ->description(clienttranslate('Waiting for other players to end their turn.'))
        ->descriptionmyturn(''), // Won't be displayed anyway since each private state has its own description
        ->type(StateType::MULTIPLE_ACTIVE_PLAYER)
        ->initialprivate(50) // This makes this state a master multiactive state and enables private states, this is also a first private state
        ->action("stPlayerTurn")
        ->args("argPlayerTurn")
        ->possibleactions(["actChangeMind"]) //this action is possible if player is not in any private state which usually happens when they are inactive
        ->transitions(["playersDecide" => 11]) // this is normal next transition which will happen after all players finish their turns 
        ->build(),

    50 => GameStateBuilder::create()
        ->name("chooseFirst")
        ->descriptionmyturn(clienttranslate('${you} must make your first choice')) // just this parameter is needed. description is not needed as no player is inactive in this state
        ->type(StateType::PRIVATE) // this state is reachable only as a private state
        ->args("argChooseFirst") //this method will be called with playerId as a parametar and is used to calculate arguments for this action for specific player
        ->action("stChooseFirst") // this method will be called with playerId as a parameter and can be used to make some changes when player enters this private state
        ->possibleactions(["actToSecond"])
        ->transitions([
          'chooseSecond' => 51, // transition to another private state
        ])
        ->build(),
   
    51 => GameStateBuilder::create()
        ->name("chooseSecond")
        ->descriptionmyturn(clienttranslate('${you} must make your second choice'))
        ->type(StateType::PRIVATE)
        ->args("argChooseSecond")
        ->possibleactions(["actFinish", "actBack"])
        ->transitions([
          'back' => 50,
        ])
        ->build(),
```

When entering the master state it is usually useful to set some players as multiactive and initialize their private state:

```php
    function stPlayerTurn() {
        $this->gamestate->setAllPlayersMultiactive();
        
        //this is needed when starting private parallel states; players will be transitioned to initialprivate state defined in master state
        $this->gamestate->initializePrivateStateForAllActivePlayers(); 

        // in some cases you can move immediately some or all players to different private states
        if ($someCondition) {
            //move all players to different state 
            $this->gamestate->nextPrivateStateForAllActivePlayers("chooseSecond");
            return;
        }

        if ($other condition) {
            //move single player to different state
            $this->gamestate->nextPrivateState($specificPlayerId, "chooseSecond");
            return;
        }
    }
```

When some action is done by a player, you can move them to the next private state:

```php
    function actToSecond() {
        $this->checkAction("actToSecond");  //the action must be defined in private state; actions defined in master state are not possible
        $this->gamestate->nextPrivateState($this->getCurrentPlayerId(), "chooseSecond"); //moving current player to different state
    }
```

Please check the detailed API [here](https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Private_parallel_states "Main game logic: yourgamename.game.php").

### Client States

Client state almost have nothing to do with server states, except they can simulate same experience without actually changing server states.

See description here: <https://en.doc.boardgamearena.com/BGA_Studio_Cookbook#Multi_Step_Interactions:_Select_Worker.2FPlace_Worker_-_Using_Client_States>

In many cases you can achive similar results by using client states vs private server states. The only caveat - when using client states during MULTIPLE_ACTIVE_PLAYER server state
other player will trigger state changes (multiactive player set) which will call onUpdateActionButtons. Some measures have to be taken to preserve client state in this case.

### Using Named Constants for States

Using numeric constants is prone to errors. If you want you can declare state constants as PHP named constants. This way you can
use them in the states file and in Game.php as well

EXAMPLE:

states.inc.php:

```php
// define contants for state ids
if (!defined('STATE_END_GAME')) { // ensure this block is only invoked once, since it is included multiple times
   define("STATE_PLAYER_TURN", 2);
   define("STATE_GAME_TURN", 3);
   define("STATE_PLAYER_TURN_CUBES", 4);
   define("STATE_END_GAME", 99);
}
 
$machinestates = array(

   ...

    STATE_PLAYER_TURN => GameStateBuilder::create()
        // ...
    		->transitions([
    		        "loopback" => STATE_PLAYER_TURN,
    		        "playCubes" => STATE_PLAYER_TURN_CUBES,
    		        "pass" => STATE_GAME_TURN,
    		])
```

### Example of MULTIPLE_ACTIVE_PLAYER state

This is an example of a MULTIPLE_ACTIVE_PLAYER state:

```php
 2 =>  GameStateBuilder::create()
   ->name('playerTurnSetup')
   ->type(StateType::MULTIPLE_ACTIVE_PLAYER)
   ->description(clienttranslate('Other players must choose one Objective'))
   ->descriptionmyturn(clienttranslate('${you} must choose one Objective card to keep'))
   ->possibleactions([ 'actPlayKeep' ])
   ->transitions(['next' => 5, 'loopback' => 2, ])
   ->action('stMultiPlayerInit')
   ->args('argplayerTurnSetup')
   ->build(),
```

In game.php:

```php
   // this will make all players multiactive just before entering the state
   function stMultiPlayerInit() {
       $this->gamestate->setAllPlayersMultiactive();
   }
```

Note: if you want exact this function its already defined in table class its called 'stMakeEveryoneActive'

When ending the player action, instead of a state transition, deactivate player.

```php
   function actPlayKeep($cardId) {
       $this->checkAction('actPlayKeep');
       $player_id = $this->getCurrentPlayerId(); // CURRENT!!! not active
       ... // some logic here
       $this->gamestate->setPlayerNonMultiactive($player_id, 'next'); // deactivate player; if none left, transition to 'next' state
   }
```

### Difference between Single active and Multi active states

In a classic ACTIVE_PLAYER state:

- You cannot change the active player DURING the state. This is to ensure that during 1 ACTIVE_PLAYER state, only ONE player is active
- As a consequence, you must set the active player BEFORE entering the ACTIVE_PLAYER state
- In such states on JS side onUpdateActionButtons is called before onEnteringState during game play (but after during reload, i.e. F5)
- Finally, during onEnteringState, on JS side, the active player is signaled as active and the information is reliable and usable.

In a MULTIPLE_ACTIVE_PLAYER state:

- You can (and must) change the active players DURING the state
- During such a state, players can be activated/desactivated anytime during the state, giving you the maximum of possibilities.
- You shouldn't set active player before entering the state. But you can set it in "state initializer" php function (see example above stMultiPlayerInit)
- Finally, during onEnteringState, on JS side, the active players are NOT active yet so you must use onUpdateActionButtons to perform the client side operation which depends on a player active/inactive status.

Note: in some off cases other players can perform special actions even if they are not active, see example <https://en.doc.boardgamearena.com/BGA_Studio_Cookbook#Out-of-turn_actions%3A_Un-pass>. Do not abuse this technique!

### Designing states

As a general rule you state machine should resemble "round/turn overview" from the game rule-book. Normally if book say its player turn and player can do multiple things during their turn it is still only
one player state (plus a game to switch player), not multiple states.

In a classic game (i.e. chess), there is only active player at any time, so it is simple playerTurn/gameTurn sequence and you only need 2 states.

[![Simplestates.png](/images/7/72/Simplestates.png)](https://en.doc.boardgamearena.com/File:Simplestates.png)

In complex euro game there can be multiple rounds, and each round have phases which can be distinctly unique, i.e. in first phase everybody draws card and discard (multi-player), then player have one turn each (single-active), then another is resolution of actions from players and some of them may become active again, then there is round upkeep/reset. This would require one multi-player state for phase 1, pair of states for phase2 (single-active + game), pair of states for phase3 and finally round-end/unkeep game state.

For pair of active player/game states you can make player state first, which transitions to game state, or the other way around, you start with game state which transition to active player state, its loop in any case but depends on how you want to do "phase" initiazations.

[![Eurogamestates.png](/images/e/ec/Eurogamestates.png)](https://en.doc.boardgamearena.com/File:Eurogamestates.png)

### Complete examples

Example of simple game where player take turns

```php
if ( !defined('STATE_END_GAME')) { // guard since this included multiple times
    define("STATE_PLAYER_TURN", 2);
    define("STATE_GAME_TURN_NEXT_PLAYER", 3);
    define("STATE_PLAYER_GAME_END", 4);
    define("STATE_END_GAME", 99);
}

$machinestates = [
        // Game states 
        STATE_PLAYER_TURN => [ // main active player state 
                "name" => "playerTurn",
                "description" => clienttranslate('${actplayer} must do something or pass'),
                "descriptionmyturn" => clienttranslate('${you} must do something or pass'),
                "type" => "activeplayer",
                "args" => "arg_playerTurn",
                "possibleactions" => [ "actDSomething","actPass" ],
                "transitions" => [ "next" => STATE_GAME_TURN_NEXT_PLAYER,"last" => STATE_PLAYER_GAME_END ] // 
        ],
        STATE_GAME_TURN_NEXT_PLAYER => [ // next player state
                "name" => "gameTurnNextPlayer",
                "description" => clienttranslate('Upkeep...'),
                "type" => "game", //
                "action" => "st_gameTurnNextPlayer", //
                "updateGameProgression" => true,
                "transitions" => [ "next" => STATE_PLAYER_TURN,"loopback" => STATE_GAME_TURN_NEXT_PLAYER,
                        "last" => STATE_PLAYER_GAME_END ], // TODO replace with STATE_END_GAME, its there to use undo/restore during dev
        ],
    
        STATE_PLAYER_GAME_END => [ // active player state for debugging end of game
                "name" => "playerGameEnd",
                "description" => clienttranslate('${actplayer} Game Over'),
                "descriptionmyturn" => clienttranslate('${you} Game Over'),
                "type" => "activeplayer",
                "args" => "arg_playerTurn",
                "possibleactions" => ["actEndGame"],
                "transitions" => ["next" => STATE_END_GAME,"loopback" => STATE_PLAYER_GAME_END ] // 
        ],

];
```
