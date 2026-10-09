# Game material description: material.inc.php

> Source: http://en.boardgamearena.com/doc/Game_material_description:_material.inc.php

## Overview

**IMPORTANT NOTE**: This file is not generated anymore by default, but you can still create it (the name is important as only a `material.inc.php` file at the root of your project will be automatically loaded) to describe the material of your game.

If you want to put all your material.inc.php in modules/php instead, please read [Move it to modules/php](https://en.doc.boardgamearena.com/Game_material_description:_material.inc.php#Move_it_to_modules/php)

This file is included by the constructor of your main game logic (yourgame.game.php), and then the variables defined here are accessible everywhere in your game logic file (and also view.php file).

Using material.inc.php makes your PHP logic file smaller and clean. Normally you put ALL static information about your cards, tokens, tiles, etc in that file which do not change. Do not store static info in database.

## Definition

Example from "Eminent Domain":

```php
$this->token_types = [
 'card_role_survey' => [
   'type' => 'card_role',
   'name' => clienttranslate("Survey"),
   'tooltip' => clienttranslate("ACTION: Draw 2 Cards<br/><br/>ROLE: Look at <div class='icon survey'></div> - 1 planet cards, keep 1<br/> <span class='yellow'>Leader:</span> Look at 1 additional card"),
   'b'=>0,
   'p'=>'',
   'i'=>'S',
   'v'=>0,
   'a'=>'dd',
   'r'=>'S', 
   'l'=>'v',
  ],

 'card_tech_1_51' => [
   'type' => 'tech',
   'name' => clienttranslate("Improved Trade"),
   'b' => 3,
   'p' => 'E',
   'i' => 'TP',
   'v' => 0,
   'a' => 'i',
   'side' => 0,
   'tooltip' => clienttranslate("Collect 1 Influence from the supply."),
 ],

...
];
```

So this defines all info about cards, including types, names, tooltips (to be show on client), rules, payment cost, etc.

You can also define PHP constants that can be used in material file and game.php file:

```
if (!defined('TAPESTRY')) { // guard since this included multiple times
    define("TAPESTRY", 0);
    define("TRACK_EXPLORATION", 1);
    define("TRACK_SCIENCE", 2);
    define("TRACK_MILITARY", 3);
    define("TRACK_TECHNOLOGY", 4);
}
```

## Access

### Data fields

To access this in PHP side:

```php
 $type = $this->token_types['card_tech_1_51']['type'];
```

To access on JS side you have to send all variables from material file via getAllDatas first:

```php
   protected function getAllDatas() {
       $result = array ();
       $result ['token_types'] = $this->token_types;
       ...
       return $result;
   }
```

Then you can access it in similar way:

```js
 var type = this.gamedatas.token_types['card_tech_1_51'].type; // not translatable
 var name = _(this.gamedatas.token_types['card_tech_1_51'].name); // to be shown to user (NOI18N)
```

To send this in notification from PHP side:

```php
 $this->notifyAllUsers('gainCard',clienttranslate('player gains ${card_name}'), [
      'i18n'=>['card_name'],
      'card_id' => $card_id,
      'card_name' => $this->token_types[$card_id]['name']
 ]);
```

### PHP constants

If you also want to access constants in JS side, you can send them via getAllData like this

```php
       $cc = get_defined_constants(true)['user'];
       $result['constants']=$cc; // this will be all constants though, you may have to filter some stuff out for security reasons
```

Alternately you can include a material.inc.php in local php file and call this method to print constants in JS format, then include this file in JS, you may have to synchronize this manually, but its better for auto-complete also.

```php
       // this needs to be run locally after including materal file (see example in testing below)
       $cc = get_defined_constants(true)['user'];
       foreach ($cc as $key => $value) {          
           print ("const $key = $value;\n");
       }
```

## Testing

If you screw up your material file such as by missing some brackets, it is very hard to diagnose. But you can test it locally like this:

misc/material_test.php:

```php
<?php
class material_test {
    function __construct() {
        include '../material.inc.php';
        var_dump($this->token_types); // whatever your var
    }
}
// stub
function clienttranslate($x) { return $x; }

new material_test();
```

## Adjusting material

In rare cases expansions of the game changes the materials of the original game. In such cases (for example, the same card was re-printed with a different text/rules),
can you keep same card and have material adjust based on selected game options? It is possible with some trickery.

You need to modify the data in that file AFTER constructor when database access is initialized, and have it available for all php entry points.
This is possible if you override function initTable() in your game.php file:

```php
    /**
     * This is called before every action, unlike constructor this method has initialized state of the table so it can
     * access db
     *
     * @Override
     */
    protected function initTable() {
        // this fiddles with material file depending on the extension selected
        $this->adjustMaterial();
    }

    function adjustMaterial($force = false) {
        if ( !$force && $this->token_types_adjusted)
            return;
        $this->token_types_adjusted = true;
        ... // fiddle with data in material file
    }
```

To adjust material itself - you can do it in any number of ways I personally use this method: for modified values I specify key posfix that match my game option, and adjustment function re-write my keys, for example

```js
 'card_tech_1_51' => [
   'name' => clienttranslate("Improved Trade"),
   'name@e3' => clienttranslate("Much Improved Trade"),
   'cost' => 3,
   'cost@p2' => 2
```

In this example if player selects game expansion 3, the key name@e2 would override key name, and if there is 2 players, cost@p2 will override cost. If you need exact code, check adjustMaterial in Ultimate Railroads

Note: if you need to add some data to material.inc.php programmatically which does not require database, you can just do it right in that file. Keep in mind will run multiple time for each php call back, so it should be very light

```php
$this->decks = array (
        'g' => array ('id' => 'green','name' => clienttranslate('Green'),'num' => 1 ),
        'r' => array ('id' => 'red','name' => clienttranslate('Red'),'num' => 3 ),
        'v' => array ('id' => 'violet','name' => clienttranslate('Violet'),'num' => 4 ),
        'y' => array ('id' => 'yellow','name' => clienttranslate('Yellow'),'num' => 2 ) )
;
    
$this->dcolor_map = array();
// reverse map
foreach ($this->decks as $info) {
    $this->dcolor_map[$info['num']]=$info['id'];
}
```

## Move it to modules/php

You can move the file to any modules/php folder/subfolder, but it will not be included automatically, you'll need to import it.

```php
class Game extends Table {
    private array $DECKS; // so the IDE knows you define an array called DECKS on the material file
    
	function __construct()
	{
        parent::__construct();

        require 'material.inc.php'; // your material.inc.php in modules/php folder contains $this->DECKS = [...]

        $this->initGameStateLabels([]);
	}

    protected function getAllDatas(): array
    {
        // ...
        // use it the same way
        $result['DECKS'] = $this->DECKS;
  
        return $result;
    }
```

Note: this way, you can use any file name and even split you material in multiple files if you want to.
