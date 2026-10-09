# Players actions: yourgamename.action.php

> Source: http://en.boardgamearena.com/doc/Players_actions:_yourgamename.action.php

**IMPORTANT NOTE:** This file is deprecated, you shouldn't need to use it if you use [Autowired action](https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Actions_(autowired))

## Purpose of this file

With this file, you define all the player entry points (i.e., possible game actions) for your game.

This file is a sort of "bridge" between the AJAX calls you perform from the Javascript client side, and your main PHP code in "yourgame.game.php".

The role of the methods defined in this file is to filter the arguments, format them a bit, and then call a corresponding PHP method from your main game logic ("yourgame.game.php" file).

Methods in this file should be short: no game logic must be introduced here.

## Example of typical action method

(from Reversi example)

```php
    public function actPlayDisc()
    {
        $this->setAjaxMode();     
        $x = $this->getArg( "x", AT_posint, true );
        $y = $this->getArg( "y", AT_posint, true );
        $result = $this->game->actPlayDisc( $x, $y );
        $this->ajaxResponse( );
    }
```

## Methods to use in action methods

**function setAjaxMode()**

Must be used at the beginning of each action method.

**function ajaxResponse()**

Must be used at the end of each action method.

**function getArg( $argName, $argType, $mandatory=false, $default=NULL, $argTypeDetails=array(), $bCanFail=false )**

This method must be used to retrieve the arguments sent with your AJAX query.

You must *not* use "_GET", "_POST" or equivalent PHP variables to do this, as it is unsafe.

This method uses the following arguments:

- argName: the name of the argument to retrieve.
- argType: the type of the argument. You should use one of the following:

```
 'AT_int' for an integer
 'AT_posint' for a positive integer 
 'AT_float' for a float
 'AT_bool' for 1/0/true/false
 'AT_enum' for an enumeration (argTypeDetails lists the possible values as an array)
 'AT_alphanum' for a string with 0-9a-zA-Z_ and space
 'AT_alphanum_dash' for a string with 0-9a-zA-Z_- and space
 'AT_numberlist' for a list of numbers separated with "," or ";" (example: 1,4;2,3;-1,2)
 'AT_base64' for a base64-encoded string (SECURITY WARNING*)
 'AT_json' for a JSON stringified string (SECURITY WARNING**)
```

- mandatory: specify "true" if the argument is mandatory.
- default: if mandatory=false, you can specify here a default value in case the argument is not present.
- argTypeDetails: used with the 'AT_enum'. Validates that the value passed in is in this list.
- bCanFail: if true, specify that it may be possible that the argument won't be of the type specified by argType (and then do not log this as a fatal error in the system, and return a standard exception to the player).

**SECURITY WARNING**: If using AT_base64 or AT_json, or other undocumented unchecked types you must perform validation on unpacked data, i.e. do not use any of it unchecked, i.e. pass to DB queries or return back in notifications.

Here is an example of a sanity check for JSON :

```php
 public function actMyAction()
 {
   $this->setAjaxMode();
   $args = $this->getArg('actionArgs', AT_json, true);
   $this->validateJSonAlphaNum($args, 'actionArgs');
   $this->game->actMyAction($args);
   $this->ajaxResponse();
 }
```

```php
 public function validateJSonAlphaNum($value, $argName = 'unknown')
 {
   if (is_array($value)) {
     foreach ($value as $key => $v) {
       $this->validateJSonAlphaNum($key, $argName);
       $this->validateJSonAlphaNum($v, $argName);
     }
     return true;
   }
   if (is_int($value)) {
     return true;
   }
   $bValid = preg_match("/^[_0-9a-zA-Z- ]*$/", $value) === 1;
   if (!$bValid) {
     throw new \BgaSystemException("Bad value for: $argName", true, true, FEX_bad_input_argument);
   }
   return true;
 }
```

**AT_enum and argTypeDetails Example**

Validates that the value of 'myarg' is either 'apple', 'orange', or 'banana'

```php
 $myarg = $this->getArg( 'myarg', AT_enum, false, null, [ 'apple', 'orange', 'banana' ] ); // optional enum
```

**function isArg( $argName )**

This is a useful method when you only want to check if an argument is present or not present in your AJAX request (and don't care about the value).

It returns "true" or "false" according to whether "argName" has been specified as an argument of the AJAX request or not.

## Useful tip: retrieve a list of numbers

If your Javascript sends a list of integers separated by ";" (example: "1;2;3;4") as an argument, you can transform them into a PHP array with the following:

```php
    public function actPlayCards()
    {
        $this->setAjaxMode();     

        $card_ids_raw = $this->getArg( "card_ids", AT_numberlist, true );
        
        // Removing last ';' if exists
        if( substr( $card_ids_raw, -1 ) == ';' )
            $card_ids_raw = substr( $card_ids_raw, 0, -1 );
        if( $card_ids_raw == '' )
            $card_ids = array();
        else
            $card_ids = explode( ';', $card_ids_raw );

        $this->game->actPlayCards( $card_ids );
        $this->ajaxResponse( );
    }
```

## Example pass array of Id's

If your Javascript sends a list of object denomated by alphanumerical tokenId, you can use AT_alphanum type and space as array separator:

```php
    // sending 'card_ids' => "card_1 card_23 card_12"
    public function actPlayCards()   {
        $this->setAjaxMode();     

        $card_ids_raw = $this->getArg( "card_ids", AT_alphanum, true );
        $card_ids_raw = trim($card_ids_raw);

        if( $card_ids_raw == '' )
            $card_ids = array();
        else
            $card_ids = explode( ' ', $card_ids_raw );

        $this->game->actPlayCards( $card_ids );
        $this->ajaxResponse( );
    }
```

## Retrieving data from ajax call

Note that this is not possible to return any result from a player action: it should return nothing (action went fine) or an exception (action unsuccessful).

The typical way to implement this is using games states with game state arguments. Eventually, use player notifications.

## Game action handler

This is a note on what you should be doing and not doing in ggg.game.php action handler vs in action.php action handler

action.php

- action handler in action.php should very simple and it should ONLY extract arguments from ajax call, pass them down to game handler
- it should not implement any game logic or check for validity beyong the syntax. I.e. DO NOT put checkAction this action.php

game.php

- call checkAction('actMyAction') first
- check arguments for game validity (i.e. player is not cheating), throw system exceptions if it is (usually this cases where JS side won't be sending it but you still have to check for it)
- perfom action and update database, can do more check if throw user exception if this is not valid move by the rules
- send notifications (must send notification even if empty if not transitioning in new state on some paths)
- transition to new state
