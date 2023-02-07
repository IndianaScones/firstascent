{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- FirstAscent implementation : © Jonathan Morgan <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    firstascent_firstascent.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->

<div id="character_selection"></div>

<div id="board" class="desert forest">

    <div id="shared_objectives">
        <!-- BEGIN shared_objective -->
            <div id="shared_objective{id}" class="shared_objective" style="background-position: -{soX}% -{soY}%; top: {TOP}px; left: {LEFT}px;"></div>
        <!-- END shared_objective -->
    </div>

    <div id="the_spread"></div>

    <div id="the_portaledge">
        <div id="portaGear"></div>
        <div id="portaFace"></div>
        <div id="portaCrack"></div>
        <div id="portaSlab"></div>
    </div>

    
    <div id="pitches">
        <!-- BEGIN pitch -->
            <div id="pitch{X}" class="pitch p{PITCH}" style="bottom: {BOTTOM}px; left: {LEFT}px; background-position: -{PX}% -{PY}%;"></div>
        <!-- END pitch -->
    </div>

</div>

<div id="myhand_wrap" class="whiteblock">
    <h3>{MY_HAND}</h3>
    <div id="hand_assets" style="display: inline-block;"></div>
    <div id="hand_tokens" style="display: inline-block; bottom: 25px;"></div>
</div>

<div id="character_wrap" style="position: relative;">
</div>

<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/

let jstpl_character_area='<div id="player_${player}" style="position: relative; height: 324.275px; width: 313.125px; left: \
    10px; margin-top: 5px;"><h3 id="character_area_${player_name}" style="color: #${color};">${player_name}</h3></div>';
let jstpl_character='<div id="character_${type}" class="character ${extra_class}" style="background-position: -${charX}% \
    -${charY}%; ${extra_style}"></div>';
let jstpl_asset_board='<div id="asset_board" class="asset_board" style="background-position: -${abX}% -${abY}%; \
    margin-left: 313.125px;"></div>';

let jstpl_summit_pile='<div id="summit_pile" class="summit_beta summit_pile_back" style="top: ${summit_pileX}px; left: \
    ${summit_pileY}px;"></div>';

let jstpl_climbing_deck='<div id="climbing_deck" class="climbing climbing_deck_back" style="top: ${climbing_deckX}px; left: \
    ${climbing_deckY}px;"></div>';

let jstpl_asset_deck='<div id="asset_deck" class="assets asset_deck_back" style="top: ${asset_deckX}px; left: \
    ${asset_deckY}px;"></div>';
let jstpl_spread_slot='<div id="spread_slot${SLOT_NUM}" class="spread" style="top: ${spreadX}px; left: ${spreadY}px;"></div>';
let jstpl_asset_card='<div id="asset_card_${CARD_ID}" class="assets" style="background-position: -${acX}% -${acY}%;"></div>';

let jstpl_player_panel = '<div class="cp_panel"> \
    <div id="ref_1" class="reference" style="background-position: -600% -0%"></div> \
    <div id="ref_2" class="reference" style="background-position: -700% -0%"></div> \
    </div>';

</script>  

{OVERALL_GAME_FOOTER}
