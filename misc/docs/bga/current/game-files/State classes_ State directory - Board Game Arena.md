# State classes: State directory

> Source: http://en.boardgamearena.com/doc/State_classes:_State_directory

## Overview

The file in php/States directory describe the state machine of your game (all the game states properties, and the transitions to get from one state to another).

Important: to understand the game state machine, it's recommended that you read this presentation first (but ignore the code snippets, they are outdated):
[Focus on BGA game state machine](http://www.slideshare.net/boardgamearena/bga-studio-focus-on-bga-game-state-machine)

State classes allow to create a PHP class for each game state.

The advantage is that the IDE understands the structure and can provide auto-completion and error highlights, that are lost in Traits.

## Example

The State class in `modules/php/States/PlayerTurn.php` will have this structure:

```php
<?php
declare(strict_types=1);

namespace Bga\Games\<MyGameName>\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\<MyGameName>\Game;

class PlayerTurn extends GameState
{
    function __construct(
        protected Game $game,
    ) {
        parent::__construct($game,
            id: 2,
            type: StateType::ACTIVE_PLAYER,

            // optional
            description: clienttranslate('${actplayer} must play a card or pass'),
            descriptionMyTurn: clienttranslate('${you} must play a card or pass'),
            transitions: [],
            updateGameProgression: false,
            initialPrivate: null,
        );
    }

    public function getArgs(): array
    {
        // the data sent to the front when entering the state
        return [];
    } 

    function onEnteringState(int $activePlayerId) {
        // the code to run when entering the state
    }   

    #[PossibleAction]
    public function actPlayCard(int $cardId, int $activePlayerId, array $args): string
    {
        // the code to run when the player triggers actPlayCard with bgaPerformAction
    }

    function zombie(int $playerId): string {
        // the code to run when the player is a Zombie
    }
}
```

The state must extends `Bga\GameFramework\States\GameState` and follow the same `__construct` function as the example.

For more example check out [Tutorial hearts](https://en.doc.boardgamearena.com/Tutorial_hearts "Tutorial hearts")

## Name Parameters of Game State constructor

Only game, id and type are mandatory, other parameters are optional. Parameter name can be specified, by default it will be the class name (including capitalization).

### id

(**Mandatory**)

This key determines game the state numeric identifier (aka ID) (in the example above: 2).

It must be positive integer and unique between all your states (i.e. you must not use the same ID twice).

Number 1 is reserved for the first game state and should not be used (and you must not modify it).

Number 99 is reserved for the last game state (end of the game) (and you must not modify it).

Note: you may use any ID, even an ID greater than 100. But you cannot use 1 or 99.

Note²: When a game is in prod and you change the ID of a state, all active games (including many turn based) will behave unpredictably.

### type

(**Mandatory**)

You can use 4 types of game states:

- StateType::ACTIVE_PLAYER: One player is active and must play ('activeplayer' if using the old array notation).
- StateType::MULTIPLE_ACTIVE_PLAYER: Multiple players can be active and must play ('multipleactiveplayer' if using the old array notation).
- StateType::PRIVATE: During multiactive states players can independently move to different private parallel states ('private' if using the old array notation). See more details [here](#Private_parallel_states).
- StateType::GAME: No player is active. This is a transitional state to do something automatic specified by the game rules ('game' if using the old array notation).

### name

The name of a game state is used to identify the state in your game logic. Default: class name (as is).

Several game states can share the same name; however, this is not recommended.

Warning! Do not put spaces and other weird characters in the name (i.e. stick to identifier). This could cause unexpected problems.

PHP example:

```php

// Get current game state
$state = $this->gamestate->getCurrentMainState();
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

### description

The description is the string that is displayed in the main action bar (top of the screen) when the state is active to ALL players except active.

When a string is specified as a description, you must use "clienttranslate" in order for the string to be translated on the client side:

```
 		clienttranslate('${actplayer} must play a card or pass')
```

In the description string, you can use ${actplayer} to refer to the active player.

You can also use custom arguments in your description. These custom arguments correspond to values returned by your "args" PHP method (see below).

Example of custom field:

```php

I.e:
     clienttranslate('${actplayer} must choose ${nbr} identical energies')

Args method:
    function getArgs(): array
    {
        return [
            'nbr' => 2  // In this case ${nbr} in the description will be replaced by "2"
        ];    
    }
```

Note: You may omit this for game states

Note²: Usually, you specify a string for ACTIVE_PLAYER and MULTIPLE_ACTIVE_PLAYER game states, and you specify an empty string for GAME game states. BUT, if you are using synchronous notifications, the client can remain on a GAME type game state for a few seconds, and in this case it may be useful to display a description in the status bar while in this state.

Note3: you can use ${otherplayer} to refer to some other player if you want this to be shown in player's color, but you must provide otherplayer_id as argument (along with otherplayer) to specify this player's id in this case or game won't load.

### descriptionMyTurn

**Mandatory** when the state type is ACTIVE_PLAYER or MULTIPLE_ACTIVE_PLAYER

It has exactly the same role and properties as "description", except that this value is displayed to the current active player - or to all active players in case of a MULTIPLE_ACTIVE_PLAYER game state.

In general, we have this situation:

```
        description: clienttranslate('${actplayer} can take some actions')
        descriptionMyTurn: clienttranslate('${you} can take some actions')
```

Note: you can use ${you} in descriptionMyTurn so the description will display "You" instead of the name of the player.

Note 2: you can use ${otherplayer} to refer to some other player if you want this to be shown in player's color, but you must provide otherplayer_id as argument (along with otherplayer) to specify this player's id in this case or game won't load.

I.e.

```
clienttranslate('${you} can follow action of ${otherplayer}')
```

And this will have to be state arguments for this

```php
    function getArgs(){
        return ['otherplayer'=> $this->getLeaderPlayerName(),
                'otherplayer_id'=> $this->getLeaderPlayerId()
        ];
    }
```

### transitions

With "transitions" you specify which game state(s) you can jump to from a given game state.

Example:

```js
        
        transitions: [
            'nextPlayer' => 27,
            'endRound' => 39,
        ])
       
    }
```

Example to jump to ID 27:

```
    actPlayCard() {
      ...
      return 'nextPlayer';
    }
```

Important: "nextPlayer" is the name of the transition, and NOT the name of the target game state. Multiple transitions can lead to the same game state.

Note: If there is only 1 transition, you may use an empty string.

### updateGameProgression

Default: false

If you specify updateGameProgression: true in a game state, your "getGameProgression" PHP method will be called at the beginning of this game state - and thus the game progression of the game will be updated.

*At least one* of your game states (any one) must specify true

### initialPrivate

Default: null

This parameter will enable private parallel states in a multiplayer state. Parameter should be set to first private parallel state a player will be transitioned to.
See more details about Private parallel states [here](#Private_parallel_states).

The parameter can be null or an int as before, and also accept a class name as value `initialPrivate: PlaceCard::class`

## Initial state

To indicate your initial state, add `return PlayerTurn::class;` to the code of `setupNewGame` function in Game.php (well replace with actual state you want to be first).

```php
   protected function setupNewGame($players, $options = []) {
       // ... create your game stuff
       return GameDispatch::class; // this is state to switch to
   }
```

If you don't return anything its state 2 (\*to be confirmed\*)

## Function getArgs

This function should return the necessary information for the front to display the information related to this state.

It accepts "magic" params that will be automatically filled by the framework:

- `int $activePlayerId` (or `int $active_player_id`) will be filled by the id of the active player. To be used on ACTIVE_PLAYER states only.
- `int $activePlayerNo` (or `int $active_player_no`) will be filled by the no of the active player. To be used on ACTIVE_PLAYER states only.
- `int $playerId` (or `int $player_id`/`int $currentPlayerId`/`int $current_player_id`) will be filled by the player id of the current PRIVATE state. To be used on PRIVATE states only.
- `int $playerNo` (or `int $player_no`/`int $currentPlayerNo`/`int $current_player_no`) will be filled by the player no of the current PRIVATE state. To be used on PRIVATE states only.

#### Private info in args

By default, all data provided through this method are PUBLIC TO ALL PLAYERS. Please do not send any private data with this method, as a cheater could see it even it is not used explicitly by the game interface logic.

However, it is possible to specify that some data should be sent to specific players only.

Example:

```php
    function getArgs(int $activePlayerId): array  {
        return [
            '_private' => [   // all data inside this array will be private
                $activePlayerId => [   // will be sent only to that player   
                    'somePrivateData' => $this->getSomePrivateData($activePlayerId)   
                ]
            ],

            'possibleMoves' => $this->getPossibleMoves()   // will be sent to all players
        ];
    }
```

Inside the js file, these variables will be available through `args.args._private`. (e.g. `args.args._private.somePrivateData`)

IMPORTANT: in certain situations (i.e. MULTIPLE_ACTIVE_PLAYER game state) these "private data" features can have a significant impact on performance. Please do not use if not needed.

If you add `_merge_private => true` next to `_private`, the private informations will be accessible in `args.args` instead of `args.args._private`.
If you want all your `_private` objects to be merged (state args and notif args), call `$this->bga->notify->alwaysMergePrivate();` in your Game constructor instead of adding the `_merge_private` flag on each arg.

#### Flag to indicate a skipped state

By default, The front-end will be notified of entering/leaving all states. To speed up the front-end chaining of automatically passed states, you can disable this state change notification, so the front-end doesn't trigger the preparation steps for a state that you know will be automatically skipped, and it may reduce sent args. In this case, define the **_no_notify** flag to true in the state args.

```php
function getArgs(int $activePlayerId): array {
  $playableCardsIds = ...;
  return [
    'playableCardsIds' => $playableCardsIds,
    '_no_notify' => count(playableCardsIds) === 0,
  ];
}
function onEnteringState(int $activePlayerId ,array $args): void {
  if ($args['_no_notify']) {
    return $this->actPass($activePlayerId); // return the redirection sent by the action!
  }
}
```

In this example, it might avoid a blinking message "You must play a card" (quickly replaced by the next state message) when you cannot play a card and the game automatically skips this state.

IMPORTANT: if you use _no_notify, you must handle a redirection to another state on the `onEnteringState` function!

Note that if you play synced notifications during a skipped state, it will display the notifications on the previous state. For example, for an endScore state width description "Computing end score..." sending a lot of animated notifications, you should NOT use this flag so the description is visible.

## Function onEnteringState

This function will be triggered when you enter the state.

It accepts "magic" params that will be automatically filled by the framework:

- `array $args` will be filled by the result of $this->getArgs().
- `int $activePlayerId` (or `int $active_player_id`) will be filled by the id of the active player. To be used on ACTIVE_PLAYER states only.
- `int $activePlayerNo` (or `int $active_player_no`) will be filled by the no of the active player. To be used on ACTIVE_PLAYER states only.
- `int $playerId` (or `int $player_id`/`int $currentPlayerId`/`int $current_player_id`) will be filled by the player id of the current PRIVATE state. To be used on PRIVATE states only.
- `int $playerNo` (or `int $player_no`/`int $currentPlayerNo`/`int $current_player_no`) will be filled by the player id of the current PRIVATE state. To be used on PRIVATE states only.

This function can do state redirection by returning a value :

- a class name will redirect to the state declared in that class

```php
 return NextPlayer::class;
```

- a state id will redirect to the state of that id. It must be typed as int, numbers in a string won't work.

```php
 return StateConstants::ST_END_GAME;
```

or

```
 return 99;
```

- a transition name will redirect to the transition of that name (requires `transitions` to be declared in the constructor).

```
 return 'nextPlayer';
```

Example:

```php
    function onEnteringState(int $active_player_id) {
        $next_player_id = (int)$this->getPlayerAfter($active_player_id);
        $this->giveExtraTime($next_player_id);
        $this->incStat(1, 'turns_number', $next_player_id);
        $this->incStat(1, 'turns_number');
        $this->gamestate->changeActivePlayer($next_player_id);
        return 'next';
    }
```

Usually, for a GAME state type, this method is used to perform automatic functions specified by the rules (for example: check victory conditions, deal cards for a new round, go to the next player, etc.) and then jump to another game state.

Note: this field CAN be used for player states to set something up; e.g., for MULTIPLE_ACTIVE_PLAYER states, it can make all players active.

Example in player state:

```php
    function onEnteringState() {
        $this->gamestate->setAllPlayersMultiactive();
        return; // no value
    }
```

**Warning**: Do not override stGameEnd() and argGameEnd() in Game.php. It may cause game never end and always stuck in "Recording game results + computing statistics in progress...".

## Functions act\*

These functions will be triggered when you call them from the front using bgaPerformAction. They must be prefixed by `act`.

Every normal function should have a `#[PossibleAction]` attribute on top of it to indicate the front it's a normal action for the player.

It accepts "magic" params that will be automatically filled by the framework:

- `array $args` will be filled by the result of $this->getArgs().
- `int $activePlayerId` (or `int $active_player_id`) will be filled by the id of the active player (not necessarily the one triggering the action!). To be used on ACTIVE_PLAYER states only.
- `int $activePlayerNo` (or `int $active_player_no`) will be filled by the no of the active player (not necessarily the one triggering the action!). To be used on ACTIVE_PLAYER states only.
- `int $currentPlayerId` (or `int $current_player_id`) will be filled by the id of the player who triggered the action.
- `int $currentPlayerNo` (or `int $current_player_no`) will be filled by the no of the player who triggered the action.

The return value works the same way as onEnteringState.

If you trigger an action from the front, and it's not declared in this state, the framework will check if the function exists in the Game.php file (for actions that can be triggered at any state).

The actions as auto-wire using the function name and parameter types, see details description in
<https://en.doc.boardgamearena.com/Main_game_logic:_Game.php#Actions_(autowired)>

Example:

```php

    #[PossibleAction] // a PHP attribute that tells BGA "this method describes a possible action that the player could take", so that you can call that action from the front (the client)
    public function actPlayCard(int $cardId, int $activePlayerId)
    {
        $game = $this->game;
        $currentCard = $game->cards->getCard($cardId);
        if (!$currentCard) {
            throw new \BgaSystemException("Invalid move $cardId");
        }
        // Rule checks
        $playable_cards = $game->getPlayableCards($activePlayerId);
        if (!in_array($cardId, $playable_cards)) {
            throw new \BgaUserException(clienttranslate("You cannot play this card now"));
        }

        $game->cards->moveCard($cardId, 'cardsontable', $activePlayerId);

        // And notify
        $game->notify->all(
            'playCard',
            clienttranslate('${player_name} plays ${value_displayed} ${color_displayed}'),
            [
                'i18n' => array('color_displayed', 'value_displayed'),
                'card' => $currentCard,
                'player_id' => $activePlayerId,
                'player_name' => $game->getActivePlayerName(),
                'value_displayed' => $game->card_types['types'][$currentCard['type_arg']]['name'],
                'color_displayed' => $game->card_types['suites'][$currentCard['type']]['name']
            ]
        );
        return NextPlayer::class;
    }
```

## Function zombie

In non GAME states, the `zombie` function is mandatory. The first parameter `int $playerId` will be filled by the Zombified player id. If the first parameter is called `int $playerNo` / `int $player_no`, it will send the player no instead of the player id.

You can see some examples in the [Zombie Mode](https://en.doc.boardgamearena.com/Zombie_Mode "Zombie Mode") page.

It accepts "magic" params that will be automatically filled by the framework:

- `array $args` will be filled by the result of $this->getArgs().

The return value works the same way as onEnteringState.

Example:

```php
   public function zombie(int $playerId)
   {
       $playable_cards = $this->game->getPlayableCards($playerId);
       if (count($playable_cards) == 0) {
           return NextPlayer::class;
       }
       $zombieChoice = $this->getRandomZombieChoice($playable_cards); // random choice over possible moves
       return $this->actPlayCard((int)$zombieChoice, $playerId);
   }
```

## Implementation Notes

### End Score state

You will often need to do some computation at the end of the game, for end score or for average stats. As you cannot modify the endGame state, it's recommended to create a state just before, that will do it.

### Creating subfolders in the States folder

When creating Classes in subfolders of the States folder, don't forget to make the namespace reflect the subfolders structure for autoloading to work.

### Private parallel states

Private parallel states are useful when multiple players are active and their turn is very complex. In that case it is possible with parallel states for each player to be in a independent state.

Lets say that players need to do three complex action one after another in MULTIPLE_ACTIVE_PLAYER state. With parallel states each player can independently be in a different state (i.e. one player still need to decide about first action while some players are deciding their second action and the fastest player is already on their third action. Normally this can be handled with two simple, but limited, approaches:

- Moving all players to different states together - this is limiting for faster players as they need to wait other players for each separate action. The more problematic thing is that it would be hard to implement an undo feature when one player wants to change their previous action. In that case all players should be moved back to previous state which will interrupt their flow.
- Using client states, by changing the state in which the player is in javascript - the problem with this approach is that players will lose their progress on browser refresh (F5). Furthermore the validation logic of specific actions should be implemented on both server side and client side and we cannot have specific args for each different action, but they should be calculated only at the beginning of the first action and possibly calculated on client side after each action, which again duplicates logic on client and server.

With private parallel states, each specific action can be implemented as a parallel state. Parallel states are defined with the type PRIVATE and players are moved to those private states during one master MULTIPLE_ACTIVE_PLAYER state.

When entering the master state it is usually useful to set some players as multiactive and initialize their private state:
// XXX example is not checked in new framework

```php
    function onEnteringState() {
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

```php
<?php

declare(strict_types=1);

namespace Bga\Games\euro;

class StateConstants {
    const STATE_MULTI_PLAYER_TURN = 4;

    const STATE_PLAYER_TURN_OP = 12;
    const STATE_GAME_DISPATCH = 13;
    const STATE_MULTI_PLAYER_TURN_OP = 14;
    const STATE_PLAYER_TURN_CONF = 15;

    const STATE_MACHINE_HALTED = 42;

    // last state
    const STATE_END_GAME = 99;
}
```

To use

```php
...
        parent::__construct($game,
            id: StateConstants::STATE_PLAYER_TURN_OP,
            type: StateType::ACTIVE_PLAYER,
```

### Difference between Single active and Multi active states

In a classic ACTIVE_PLAYER state:

- You cannot change the active player DURING the state. This is to ensure that during 1 ACTIVE_PLAYER state, only ONE player is active
- As a consequence, you must set the active player BEFORE entering the ACTIVE_PLAYER state
- In such states on JS side onUpdateActionButtons is called before onEnteringState during game play (but after during reload, i.e. F5)
- Finally, during onEnteringState, on JS side, the active player is signaled as active and the information is reliable and usable.

In a MULTIPLE_ACTIVE_PLAYER state:

- You can (and must) change the active players DURING the state
- During such a state, players can be activated/deactivated anytime during the state, giving you the maximum of possibilities.
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

## Migrating for states written in states.inc.php and Game.php

### Moved elements

- The function `getArgs` replaces the function that was declared as `"args" => "argXXX"` on states.inc.php.
- Same for the function `onEnteringState` that was `"action" => "stXXX"` on states.inc.php.
- The `zombie` function doesn't have the state as first parameter anymore, because it's not needed in this context.
- The possible actions for this states don't need to be declared as an array, they will be found with the tag `#[PossibleAction]` over each possible action.
- The functions declared in Game.php will be accessible with `$this->game` instead of `$this`.
- The Game sub-objects are available on the State class too, so you can write `$this->notif->all` without needing to pass through the game variable.

### New elements

The `getArgs`, `onEnteringState` and `actXXX` functions can set some predefined parameters that will be automatically filled (see chapter above).

For all those functions, and also the `zombie` function, they can now send a redirection to a game state as a returned result (see chapter above).
*If you use this writing, remove `$this->gamestate->nexState` to avoid double redirection!*

The initialPrivate parameter of the constructor can be null or an int as before, but can now also accept a class name as value `initialPrivate: PlaceCard::class`

You can now pass a state class as the parameter of `GameStateBuilder::gameSetup(PlayDisc::class)->build()`, and on some function that previously only accepted transitions, like `$this->gamestate->nextPrivateState(ConfirmTurn::class)` or `$this->gamestate->setPlayerNonMultiactive($currentPlayerId, EndRound::class)`

If all your classes are migrated to State classes, you can remove the states.inc.php file.
