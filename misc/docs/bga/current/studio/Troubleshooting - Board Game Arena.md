# Troubleshooting

> Source: http://en.boardgamearena.com/doc/Troubleshooting

Describing common errors which are hard to understand and debug. This may be useful for troubleshooting.

## Game does not start at all

### Undefined offset: 0 in table/table.game.php on line 1417

Do not call self::getActivePlayerName() during setupNewGame()

Ensure you're calling $this->gamestate->changeActivePlayer() at the end of your game setup. You must always have at least one active player.

### Unexpected error: Wrong formatted data from BGA gameserver 1 (method: createGame): ...

This is generic message usually followed by exact position in your source code, and usually its syntax error in one of yours php script

### Unexpected error: Propagating error from GS 1 (method: createGame): Fatal error during yourgame setup: Not logged

Calling self::getCurrentPlayerId () or using $g_user from 'args' state function, see also below

### Unexpected error: Propagating error from GS 1 (method: createGame): Fatal error during yourgame setup: Unknow player statistic:

Calling self::incStat() with second parameter which is an empty string

### Unexpected error: Propagating error from GS 1 (method: createGame): Fatal error during yourgame setup: Error while processing SQL request: INSERT INTO stats ...

Fatal error during yourgame setup: Error while processing SQL request: INSERT INTO stats (stats_type, stats_player_id, stats_value) VALUES ('10','2300663','0'),('10','2300662','0')
Duplicate entry '10-2300663' for key 'stats_table_id'

Why? In the stats.inc.php you declared two keys with the same integer "id"

### Unexpected error: Propagating error from GS 1 (method: createGame): Fatal error during yourgame setup: BGA main website do not respond

Check if other games work; if not, it's a problem with BGA Studio; if so, your game likely reaches an end state immediately. Check your states.inc.php and your transitions.

### Unexpected error: Propagating error from GS 1 (method: createGame): BGA service error

You may have a syntax error in your dbmodel.sql.

Or, you may be calling self::initStat() for a statistic that does not exist. Check the statistic name, and make sure you clicked "Reload statistics configuration" button in the admin console after making changes to stats.inc.php

Or you may not have your states.inc.php set up correctly.

You may have an error in your table.game.php file in setupNewGame (such as `$result['x'] = y;` when $result is not an array).

### Unexpected error: Table status of a starting game should be 'setup'

This error message appears when you start a one player game using the "Express Start" button.

In normal situation, the game starts just after this message and everything should works normally. In this case, you can just ignore this message.

If the games does not start, it is most probable that there is a syntax error in any of your php code (Check your states.inc.php and X.game.php)

### Fatal error during creation of database ebd_quoridor_389 Not logged

Check that you didn't use $g_user or getCurrentPlayerId() in setupNewGame() function or in an 'args' function of your state.

As these functions are not consequences of a user action, there is no current player defined.

As a general rule, you should use getActivePlayerId() and not getCurrentPlayerId(). See the [presentation on the game state machine](http://www.slideshare.net/boardgamearena/bga-studio-focus-on-bga-game-state-machine) for more information.

### Warning: Invalid argument supplied for foreach() in table.game.php

```
  Warning: Invalid argument supplied for foreach() in /var/tournoi/release/tournoi-151226-1240-gs/www/game/module/table/table.game.php on line 129 
  Fatal error: Cannot unset string offsets in /var/tournoi/release/tournoi-151226-1240-gs/www/game/module/table/table.game.php on line 143
```

That appears when your arg\* function that suppose to return array of state arguments returns a scalar (a non-array) value

```
 Server syntax error:
 Warning: Invalid argument supplied for foreach() in /var/tournoi/release/tournoi-240320-1000-gs/www/game/module/table/table.game.php on line 3249
```

Check that notfication you sending have args method supplied, i.e

```php
  $this->bga->notify->all('message', "", []); // 3rd argument MUST be array
```

### The server reported an error

During table creation: "The server reported an error" error shown and nothing else.

If you cannot even create a table - there is syntax error in gameinfos.jsonc, check it, reload it from management panel.
If still no luck copy clean version from the EmptyGame project.

### Unexpected Error : Invalid player number for this game : 4

This error may comes when trying to change the player number configuration in gameinfos.jsonc from a higher to lower number of players (for example from 4 to 2).

The following steps will help to change a player config from array(4) to array(2) :

- change in gameinfos.jsonc the entry to "players": [2,3,4]
- In game management page (Control Panel > Manage Games > "Your Game"), press the "Reload Game information" button
- create a new table
- reduce the number of players to 2 and start the game
- (express) Stop the game
- change in gameinfos.jsonc the entry to "players": [2]
- press again the "Reload Game information" button

### Blank page

If you see no html at all check

- if you have syntax error in your view.php file
- class name of your view.php file does not match the project name (should be view_foo_foo if project is foo)
- game name return by getGameName() does not match the project name (should be "foo" if project is foo)

```php
   class view_russianrailroads_russianrailroads extends game_view {
   function getGameName() {
       return "russianrailroads";
   }
```

### "Ooooops, this page does not exists :/"

If your table is created, but you are redirected to `https://studio.boardgamearena.com/1/index.php` when you try to launch your table, then you are most likely missing the [action PHP file](https://en.doc.boardgamearena.com/Players_actions:_yourgamename.action.php "Players actions: yourgamename.action.php").

No other error is displayed or logged, meaning this can be tough to debug.

Make sure the file is correctly named, as any typo means the studio won't be able to find the file.

### HTTP Error 500 (when the BGA server is stable)

The table has been created, but the table loading (e.g. getAllDatas()) hasn't been finished properly for some reason. For example php type error when strict typing is enabled.

Also, this may happen when the game is using `gameoptions.inc.php` and is using a non-string option name.

### Unexpected error: Wrong formatted data from gameserver 1 (method: createGame): JSON_ERROR_SYNTAX - Warning: Undefined array key 100 in .../table.game.php - Unknown gamestate label: 100

You've added a new option to `gameoptions.json` but forgot to initialize the option via `self::initGameStateLabels()`.

## Game starts but I can't make a move

### When I do a move, I got "Move recorded, waiting for update ..." forever

"Move recorded" means that your ajaxcall request (bgaPerformAction) has been sent to the server and returned normally.

"Waiting for update" means that your client interface is waiting for some notifications from the server that correspond to the move we just did.

If this message stays forever, it is probably that your PHP code does not send any notification when the move happens, which is abnormal. To fix this: add a notify->all or a notify->player call in your PHP code.

### When I do a move, I get "Sending move to server..." then nothing and game resets to state before the move

Its possible that server code get into infinite loops or thinks too much, in which case it will timeout and will be aborted without any extra logs (and db transaction you saw in the log won't be committed). You will usually see "Unable to connect to server" message on console in this case. You have to put more logging into server
to trace where it hangs.

You may also see this error in the log in this case: "Error (2006) while processing SQL request: MySQL server has gone away"

### When I do a move, I get "Ajaxcall error: empty answer"

You either have missing self::ajaxResponse(); in your [game.action.php](https://en.doc.boardgamearena.com/Players_actions:_yourgamename.action.php "Players actions: yourgamename.action.php") method, or there is some problem with getting arguments (check that you are using btoa() on client when using AT_base64 arg type in action.php)

### When I do a move, I get "Gameserver is locked by configuration".

You may have an error in your AJAX path, such as /reversi/reversi when your game's name is different.

### When I do a move, I get "Server syntax error: Fatal error: Allowed memory size of X bytes exhausted".

You have a stack overflow when your action is called. Caused by infinitive recursion.

### Some player action is triggered randomly when I click somewhere on the game area

You probably used "dojo.connect" on a null object. In this case, dojo.connect associate the event (ex: "onclick") to the whole game area.

Most of the time it happens in this situation, when my_object element does not exists:

```js
   dojo.connect( $("my_object"), "onclick", this, (event)=>{})
```

To determine if this is the case, place "alert( $("my_object") )" before the dojo.connect to check if the object exists or not.

### Error: This is not your turn

This happens when checkAction() is called and current player is NOT the active player.

You can change the active player in studio by clicking the red arrow next to their name in the player panel (right side of the page).

[![Change active player.jpg](/images/0/03/Change_active_player.jpg)](https://en.doc.boardgamearena.com/File:Change_active_player.jpg)

### Error: Please wait, an action is already in progress

Its followed by error "(Generated by checkAction / XXX)" on studio.

This error is triggered in the JS by the checkAction function for XXX action.

This can happen when the player sent an Ajax request action earlier, and:

- action is not complete yet - i.e. takes some time, and user clicked something again
- if there is bug in interface where MULTIPLE handlers are fired on same click. To debug this add some console.trace() in place this specific checkAction is called.
- did not get any notification from the PHP side. To avoid this, put an empty notify->player in the PHP side of the Ajax handler to ensure the client receives a response. This line of code should do it:

```php
    $this->bga->notify->player($this->getCurrentPlayerId(), 'message', ''); // sent to current player, who originated the action
```

### Error: This move is not authorized now

This is generic error message generated by this.showMoveUnauthorized() function. If you did not call this function yourself, check the console log, it may have additional information.
If you see "Move not authorized now : XXX" in the log, where XXX is your action name - this means that action XXX is not defined in list of possible actions for your current state. This error generated by checkAction() function.

### Error: More than one possible action at this state

The argument given to $this->gamestate->nextState() is not defined in states.php.

### Error: You are not connected - after waiting for the submitted move

In the log you may find:

```
 Query execution was interrupted, maximum statement execution time exceeded - Request: SELECT global_id, global_value FROM global WHERE 1
```

The error message above is because of failed attempt to lock a table, which happens because of infinite loop in you game.

- Check that don't enter same game state over and over again
- Check that you reverse for loop actually descrease counter or other loop issues
- Check that recursive function ends

### 502 Bad Gateway

This error is similar to the infinite loop just above this section, but the loop occurred in view.php or somewhere unusual (e.g. module).

## Predefined server errors

### Unexpected error: Unexpected final game state (XX)

The action function does not transition to any state, i.e.

```php
 function selectField($field) {
   self::checkAction ( 'selectField' );
   if ($field!=0) $this->gamestate->nextState ( 'next' );
 }
```

Here if $field is 0 there is no transition

### This game action is impossible right now

Check the game log. Usually your state does not define the action you trying to perform in 'possibleactions' array.

Also check your onActionName javascript function. Make sure you are calling the right "actionname.html".

### Unexpected error: This transition (playerTurn) is impossible at this state (42)

This is pretty self explanatory. Function nextState() takes transition name not a state name, so you probably did not
define this transition that the given state

## Game interface hangs during reload or on start

Showing "Application Loading..."

### Javascript error: During pageload undefined no_stack_avail Script:

This error usually has no useful data, but it means you called somes API that require a callback and did not define callback function, i.e
in dojo.connect, this.connectClass, dojo.subscribe, etc

```js
     this.connectClass('field', 'onclick', 'onField'); // <-- onField is not defined
```

### Javascript error: During pageload n is null

When calling dojo.place(), the name of the container (second parameter) to place the new block into is not defined in the page template.

### Other errors with "Application loading..."

You probably have a syntax error in your Javascript code, and the interface refuses to load.

To find this error, check if there is an error message in the Javascript console (F12).

If there is really nothing on the log, it's probably that the system was unable to load your Javascript because of an syntax error that affect the structure of the Javascript file, typically a missing "}" or a missing "," after a method definition.

If you have "Uncaught ReferenceError: bgagame is not defined" you have major syntax error in your js file, you should see some other clues in the log where the errors is.

If you have "dojo.publish is not defined" or something similar, this could be caused by another error earlier. For example, a syntax error caused by a malformed generated file (such as using newlines in tiebreaker description). Also you might have left some images in the /img directory with special characters in the name which must be removed. If you edited images for the game box and website, ensure that you have not left any unnecessary files there.

### Unexpected Syntax Error:

No further details in the log. When log is filling with some social connect errors.

Possible Reason: Syntax error in of the php script which is loaded before the start, such as gameoptions.jsonc, gameinfos.jsonc and such. This can also occur if the gamedatas returned from getAllDatas() in \*.game.php contains objects that cannot be properly serialized. For example, a class that defines functions as well as scalars.

### Game interface spins in a loop throwing error

Errors is something like "Cannot read property 'is_ai' of undefined". Cannot restart the game because cannot access UI to stop.
Likely you get in actplayer state with player id == 0. The only way to fix it is to edit database, globals index == 2 set player id to one of your test dudes
(can copy from row 5 for example).

### Unable to find table database (1): ebd_yourgame_112222

Its either temporarily server error especially on studio it timeouts sometimes, just try reloading again.
Or check if you have syntax errors in your php game file or sql.

## Type conversion / juggling errors

### On php side I get a number instead of string I expect

```php
$num = 3;
$meeple = "meeple_" + $num; // <-- suppose to be "meeple_3"!
```

When you switch between JS and PHP it easy to type this and not notice the +. Plus sign (+) in php does not mean string concatenation (in javascript does!),
in php + means integer arithmetic. So change + to . (dot)

### On php side my string comparison does not work

```php
  if ($color == '4baae2' || $color == '000000') { 
  }
```

Apparently you should not be using '==' in php to compare strings! You should use '==='. The (==) operator will typecast the strings
to numbers then do comparison!
Its not very apparent because usually you can get away with it, but not when strings resemble numbers like hex 'colors'.

### Integer columns in the database are returned as strings

This is normal PHP behavior. All fields are returned as string type, regardless of their actual type in the database. This also applies to global variables accessed via getGameStateValue(), since they are stored in a database table.

You can use type-casting to convert them to the correct type after they come out of the database.

```php
  $myValueInt = (int)self::getGameStateValue(GLOBAL_ROUND_NUMBER);
```

or

```php
  $myValueInt = self::getGameStateValue(GLOBAL_ROUND_NUMBER) + 0; // adding 0 casts to int
```

same with direct qdb ueries

```php
  $sql = "SELECT my_int_column FROM my_table WHERE my_condition";
  $myResult = self::getUniqueValueFromDB($sql); <-- this is a string
  $myResultAsInt = (int)$myResult;
```

<https://stackoverflow.com/questions/5323146/mysql-integer-field-is-returned-as-string-in-php>

## Zombie mode

### Unexpected error: Propagating error from GS 1 (method: zombie): Not logged

You are probably calling getCurrentPlayerId() or getCurrentPlayerName() in your zombieTurn method or any of the methods it uses. Instead, use the $active_player_id provided as parameter to zombieTurn().

If you do not see these commands within "function zombieTurn( $state, $active_player ){}", check all the functions called from zombieTurn, also "function getGameProgression(){}" and all the functions THAT calls.

### Unexpected error: Can't manage zombie player in this game state

The state the game was in at the time the error was generated didn't have "transitions" => array( "zombiePass" => 27 )" in states.inc.php (27 was an arbitrary example, but everything else must be spelled exactly that way.)

To correct this error, either add "zombiePass" => ## to the transitions array or work out why the game is in a state it should not be in.

### Unexpected error: Wrong formatted data from BGA gameserver 1 (method: zombie):

This is almost certainly an undefined value in PHP code. Look for a warning or error message in the game replay log on the right side of the table UI.

### Unexpected error: BGA gameserver 1 do not respond (method: zombie) (timeout: cluster)

You are trying to end the game from a zombie method. This is not allowed. The zombie logic must continue the game as best it can.

### Game unexpectedly ends when one player becomes zombie

There is an error in handling zombie mode, check error log. Example: if the zombie turn is called again, framework detects a infinite loop and cancels the game. On the studio there is a notification called ZombieTurnFailed

For more details about how the Zombie code should work, see [Zombie mode](https://en.doc.boardgamearena.com/Zombie_Mode "Zombie Mode") for more info.

## Dead locks

### Database dead lock in multiplayer state

You normally won't see this error until game is released because to reproduce game it have to be hit with 2 players doing an action simultaneosly.
You only can reprodoce this on studio if you either very fast or you use a script (with direct REST calls).

There is few types of deadlocks
I) Try-lock - this one you don't need to worry about even it does appear in the log, this is 2 player doing the action and second cannot lock db, it will re-try up to 3 times and hopefully it be ok
II) Real dead lock - when 2 tables are locked in reversed by 2 actions, its unclar if this really happen but workaround number 2 theorically should solved it (but it will increase number of deadlocks of type I)

There are two known workarounds:

1) Use $this->bIndependantMultiactiveTable=true in constructor which will force usage of playermultiactive table, but this does not eliminate dead lock completely.

2) Before every action explictly lock tables in specific order (add this code in your game.php file)

```php
   // Due to deadlock issues involving the playersmultiactive and player tables,
   //   standard tables are queried FOR UPDATE when any operation occurs -- AJAX or refreshing a game table.
   //
   // Otherwise at least two situations have been observed to cause deadlocks:
   //   * Multiple players in a live game with tabs open, two players trading multiactive state back and forth.
   //   * Two players trading multiactive state back and forth, another player refreshes their game page.
   private function queryStandardTables() {
      // Query the standard global table.
      $this->DbQuery("SELECT global_id, global_value FROM global WHERE 1 ORDER BY global_id FOR UPDATE");
      // Query the standard player table.
      $this->DbQuery("SELECT player_id id, player_score score FROM player WHERE 1 ORDER BY player_id FOR UPDATE");
      // Query the playermultiactive  table. DO NOT USE THIS is you don't use $this->bIndependantMultiactiveTable=true
      $this->DbQuery("SELECT ma_player_id player_id, ma_is_multiactive player_is_multiactive FROM playermultiactive ORDER BY player_id FOR UPDATE");

      // TODO should the stats table be queried as well?
   }

    /** This is action function that canbe called from multiplayer state */
    protected function actionXXX() {
        $this->queryStandardTables();
        ... // your arg function code
    }
    /** This is arg function of multiplayer state, XXX is replaced by actual name of state. 
        You need to do it for EVERY arg function in multiplayer states which accesses the database. 
        You don't need to do it for arg function for single player states  
    */
    protected function argXXX() {
        $this->queryStandardTables();
        ... // your arg function code
    }
```

## Other errors

### Javascript does not know how to sum two numbers

Be careful when you manipulate integers returned by notifications: most of the time, Javascript considers they are Strings and not Integers.

As a result:

```js
    let i = 1;
    i += notif.args.increment;  // With notif.args.increment='1'
    console.log( i );                 // i=11 instead of 2 !! Javascript concatenate 2 strings !
```

To solve this, you should use the "parseInt" function:

```js
    let i = 1;
    i += parseInt(notif.args.increment, 10);  // With notif.args.increment='1'
    console.log( i );                 // i=2 :)
```

### Javascript: do not use substr with negative numbers

To get the last characters of a string, use "slice" instead of "substr" which has a bug on IE:

```js
    var three_last_characters = string.substr( -3 );   // Wrong
    var three_last_characters = string.slice( -3 );    // Correct
```

### Game "spontaneously" transition to a new state without user input

Make sure on php side you have no code after $this->gamestate->nextState(...) code.
Because if you do accidentally have code that goes to another state it will cause another state transition without user interaction.

```php
function selectField($field) {
  self::checkAction ( 'selectField' );
  if ($field!=0) $this->gamestate->nextState ( 'next' );
  $this->gamestate->nextState ( 'last' ); // <-- here is missing else, so it will cause double state transition
}
```

### Message "Invalid or missing substitution argument for log message: ${actplayer} ... " when entering a state

You probably have an args function defined for that state that does **not** return an array

### Server syntax error: Warning: count(): Parameter must be an array or an object that implements Countable in /var/tournoi/release/tournoi-220308-1000-gs/www/game/module/table/gamestate.game.php on line 823

Generally comes with that syntax error : Warning: implode(): Invalid arguments passed in /var/tournoi/release/tournoi-220308-1000-gs/www/game/module/table/gamestate.game.php on line 845

It is most probable that you used setPlayersMultiactive method with id of a single player not included in an array -> you should use: ... setPlayersMultiactive( array($player_id), ...

### Red banner "Uncaught EvalError: Possible side-effect in debug-evaluate"

This is a known issue that can be ignored (for most of case). Generally happening when working on devtool.
A workaround is to disable the "error" event listener. To do so, you can temporarily disable the event listener in DevTools, like this:

```
- At the top of DevTools, open the "Elements" tab
- Press "»", on the right of "Styles", "Computed", "Layout"
- Choose "Event listeners"
- Find and expand "error"
- Click "Remove"
```

This will remove the event listener, but the issue will return after you refresh the page.
