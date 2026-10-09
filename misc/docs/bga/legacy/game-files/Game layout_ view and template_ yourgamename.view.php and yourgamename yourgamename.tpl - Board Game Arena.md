# Game layout: view and template: yourgamename.view.php and yourgamename yourgamename.tpl

> Source: http://en.boardgamearena.com/doc/Game_layout:_view_and_template:_yourgamename.view.php_and_yourgamename_yourgamename.tpl

## Purpose of this file

**IMPORTANT NOTE:** These files are deprecated, you shouldn't need to use it if you generate the template from the JS file. See the Reversi tutorial for an example of in JS template.

## Overview

[![Bga-pages-from-templates.PNG](/images/thumb/0/01/Bga-pages-from-templates.PNG/700px-Bga-pages-from-templates.PNG)](https://en.doc.boardgamearena.com/File:Bga-pages-from-templates.PNG)

There are two files involved in overall game layout: yourgamename.view.php and yourgamename_yourgamename.tpl.

These files work together to provide the HTML layout of your game.

Using these 2 files, you specify what HTML is rendered in your game client interface.

In .tpl file you can directly write raw HTML that will be displayed by the browser.

Example: extract of "hearts_hearts.tpl":

```
  <div id="myhand_wrap" class="whiteblock">
    <h3>{MY_HAND}</h3>
    <div id="myhand">
    </div>
  </div>
```

Things in curly braces are template variables. You cannot put any english text directly there.

Your view and your template are supposed to generate only the BASE layout of the game.

You shouldn't try to setup the current game situation in the view: this is the role of your Javascript code. Why? Because you'll have to write Javascript code to put game elements in place anyway, and you don't want to write it twice :)

Example of things to generate in your view:

- The overall layout of your game interface (what is displayed where).
- The board and fixed elements on the board (ex: places for cards, squares, ...).
- The tokens which are always on the board (but JS code may move them around during setup)

Example of things that shouldn't be generate by your view:

- Game elements that come and go from the game area.
- Game elements that normally hidden from players (other players cards, cards in the deck).

## Template system

BGA is using the phplib template system, used for example in PHPbb forums.

More details about how to use phplib template system here:
<https://web.archive.org/web/20170506065401/http://www.phpbuilder.com:80/columns/david20000512.php3>

## Variables

In your template (.tpl) file, you can use variables. Then in your view (.view.php) file, you fill these variables with values.

In the example above, "{MY_HAND}" is a variable. As you can see, a variable is uppercase characters surrounded by "{" and "}".

This is example of how to assign values to these variables in .view.php:

Examples:

```php

   // Display a translated version of "My hand" at the place of the variable in the template
   $this->tpl['MY_HAND'] = self::_("My hand");

   // Display some raw HTML material at the place of the variable
   $this->tpl['MY_HAND'] = self::raw( "<div class='myhand_icon'></div>" );
```

WARNING: do not use a variable called {id} as it will interfere with action buttons.

WARNING: do not use a variable called {LB_[whatever]} as any variable starting with LB_ will interfere with the translation system.

WARNING: do not use a variable called {ID} as it could receive unexpected values.

## Template Blocks

Using "blocks", you can repeat a piece of HTML from your template several time.

You should use "blocks" whenever you have a block of HTML that must be repeated many times. For example, for *Reversi*, we have to generate 64 (8x8) squares:

```php

(in reversi_reversi.tpl)

<div id="board">
    <!-- BEGIN square -->
        <div id="square_{X}_{Y}" class="square" style="left: {LEFT}px; top: {TOP}px;"></div>
    <!-- END square -->
    
    <div id="discs">
    </div>
</div>

(in reversi.view.php)

 $this->page->begin_block( "reversi_reversi", "square" );
        
 $hor_scale = 64.8;
 $ver_scale = 64.4;
 for( $x=1; $x<=8; $x++ ) {
    for( $y=1; $y<=8; $y++ ) {
       $this->page->insert_block( "square", array(
         'X' => $x,
         'Y' => $y,
         'LEFT' => round( ($x-1)*$hor_scale+10 ),
         'TOP' => round( ($y-1)*$ver_scale+7 )
        ) );
    }        
 }
```

Explanations:

- You specify a block in your template file, using "BEGIN" and "END" keywords as xml comment. In the example above, we are creating a block named "square".
- In your view, you declare your block using "begin_block" method.
- Then, you can insert as many block as you want to, using "insert_block" method.

The insert_block method takes 2 parameters:

- the name of the block to insert.
- an associative array you can use to assign values to template variables of this block. In the example above, there are 4 parameters in the block (X, Y, LEFT and TOP).

## Nested blocks

You can use nested blocks. In the example below, we are going to add a mini-board for each player of the game, with 4 card places on each of it:

ggg_ggg.tpl file:

```php
<!-- BEGIN player -->
    <div class="miniboard" id="miniboard_{PLAYER_ID}">

        <div class="card_places">
            <!-- BEGIN card_place -->
            <div id="card_place_{PLAYER_ID}_{PLACE_ID}">
            </div>
            <!-- END card_place -->
        </div>

    </div>
<!-- END player -->
```

ggg.view.php file:

```php
$this->page->begin_block( "mygame_mygame.tpl", "card_place" ); // Nested block must be declared first
$this->page->begin_block( "mygame_mygame.tpl", "player" );

foreach( $players as $player_id => $player ) {
    // Important: nested block must be reset here, otherwise the second player miniboard will
    //  have 8 card_place, the third will have 12 card_place, and so one...
    $this->page->reset_subblocks( 'card_place' ); 

    for( $i=1; $i<=4; $i++ ) {
       $this->page->insert_block( "card_place", array( 
             'PLAYER_ID' => $player_id,
             'PLACE_ID' => $i
          )
       );
    }

    $this->page->insert_block( 'player', array( 'PLAYER_ID' => $player_id );
}
```

## Conditional blocks

There is no if blocks but you can just have 2 blocks and make one to be "empty" i.e.

```php
            <!-- BEGIN a -->
            <div id="something"></div>
            <!-- END a -->
            <!-- BEGIN not_a -->
            <div id="something_else"></div>
            <!-- END not_a -->
```

code in view.php

```php
    if ($condition_a) {
      // hide not_a
      $this->page->begin_block("mygame_mygame.tpl", "not_a");
      $this->page->insert_template( "not_a", '', []);
    } else {
     // hide a
      $this->page->begin_block("mygame_mygame.tpl", "a");
      $this->page->insert_template( "a", '', []);
    }
```

Note: if you need variable in these block do the insert_block on one that stays as usual

## Javascript templates

For game elements that come and go from the game area, we suggest you to define a Javascript template.

These will allow to separate all html from javascript and php files and keep it strictly in template file.

A Javascript template is defined in your template file like this:

(Reversi Token from Reversi example):

```js
<script type="text/javascript">

// Templates

var jstpl_disc='<div class="disc disccolor_${color}" id="disc_${xy}"></div>';

</script>
```

Note: a section for javascript templates is already available at the end of your template skeleton file.

Then, you can use this javascript template to insert this piece of HTML in your game interface, like this:

```js
    dojo.place( this.format_block( 'jstpl_disc', {
           xy: x+''+y,
           color: color
    } ) , 'discs' );
```

WARNING: always use lowercase for substitution variables in your Javascript templates, in order to avoid collision with phplib template variables (in particular, do not use ${ID}).

Note that **you must translate** any text arguments passed to *this.format_block()* that will be rendered on the screen, for example [using "_()"](https://en.doc.boardgamearena.com/Translations#On_client_side_.28Javascript.29 "Translations").

## How to access game information from .view.php

From your .view.php, you can access the following:

### Access current player id

```php
  $current_player_id = $this->getCurrentPlayerId();
```

### Access game object

In your view file, `"$this->game"` contains an instance of your main game class.

Example:

```php

   // Access to some game elements description described in your "material.inc.php":
   $my_cards_types = $this->game->card_types;

   // Access to any (public) method defined in my .game.php file:
   $result = $this->game->myMethod();
```

### Access spectator status

For spectators (players who are not part of the game but just spectating it) you must be careful of displaying all public information, but no private information.

In your view file, you can use `$this->game->isSpectator()` to know if the player is not part of the game, and adapt the interface to this case.
