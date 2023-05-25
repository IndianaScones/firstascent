<?php
 /**
  *------
  * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
  * FirstAscent implementation : © <Your name here> <Your email address here>
  * 
  * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
  * See http://en.boardgamearena.com/#!doc/Studio for more information.
  * -----
  * 
  * firstascent.game.php
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );
require_once('modules/Utils.php');


class FirstAscent extends Table
{
    use UtilTrait;

	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array( 
                // "variable" => 11,
        ) );     

        // init deck for transient assets
        $this->cards_and_tokens = self::getNew('module.common.deck');
        $this->cards_and_tokens->init('cards_and_tokens');   
	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "firstascent";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );

        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

    // Set up cards and tokens

        // add climbing cards
        $climbing_cards = array();
        for ($i=1; $i<=70; $i++) {
            $climbing_cards[] = array(
                'type' => 'climbing',
                'type_arg' => $i,
                'nbr' => 1,
            );
        }
        $this->cards_and_tokens->createCards($climbing_cards, 'climbing_deck');
        $this->cards_and_tokens->shuffle('climbing_deck');

        // add summit beta tokens
        $summit_beta_tokens = array();
        for ($i=1; $i<=12; $i++) {
            $summit_beta_tokens[] = array(
                'type' => 'summit_beta',
                'type_arg' => $i,
                'nbr' => 1,
            );
        }
        $this->cards_and_tokens->createCards($summit_beta_tokens, 'summit_beta_supply');
        $this->cards_and_tokens->shuffle('summit_beta_supply');

        // add asset cards
        $asset_cards = array();
        for ($i=1; $i<=37; $i++) {
            $asset_cards[] = array(
                'type' => 'asset',
                'type_arg' => $i,
                'nbr' => $this->asset_cards[$i]['number_in_deck'],
            );
        }

        $this->cards_and_tokens->createCards($asset_cards, 'asset_deck');

        // create portaledge
        $this->cards_and_tokens->shuffle('asset_deck');
        $asset_deck = self::getObjectListFromDb("SELECT card_location_arg, card_type_arg, card_id FROM cards_and_tokens WHERE card_location='asset_deck'");

        function sortGear($asset) { if ($asset['card_type_arg'] >= 22) {return true;} }
        function sortFace($asset) { if ($asset['card_type_arg'] >= 15 && $asset['card_type_arg'] <= 21) {return true;} }
        function sortCrack($asset) { if ($asset['card_type_arg'] <= 7) {return true;} }
        function sortSlab($asset) { if ($asset['card_type_arg'] >= 8 && $asset['card_type_arg'] <= 14) {return true;} }

        $gear_assets = array_filter($asset_deck, 'sortGear');
        $face_assets = array_filter($asset_deck, 'sortFace');
        $crack_assets = array_filter($asset_deck, 'sortCrack');
        $slab_assets = array_filter($asset_deck, 'sortSlab');

        $gear_to_ledge = array_slice($gear_assets, 0, 7);
        $face_to_ledge = array_slice($face_assets, 0, 7);
        $crack_to_ledge = array_slice($crack_assets, 0, 7);
        $slab_to_ledge = array_slice($slab_assets, 0, 7);

        for ($i=0; $i<=6; $i++) {
            $this->cards_and_tokens->moveCard($gear_to_ledge[$i]['card_id'], 'portaGear', $i);
        }
        for ($i=0; $i<=6; $i++) {
            $this->cards_and_tokens->moveCard($face_to_ledge[$i]['card_id'], 'portaFace', $i);
        }
        for ($i=0; $i<=6; $i++) {
            $this->cards_and_tokens->moveCard($crack_to_ledge[$i]['card_id'], 'portaCrack', $i);
        }
        for ($i=0; $i<=6; $i++) {
            $this->cards_and_tokens->moveCard($slab_to_ledge[$i]['card_id'], 'portaSlab', $i);
        }

        // draw starting spread
        $this->cards_and_tokens->pickCardsForLocation(4, 'asset_deck', 'the_spread');


    // Set up board

        // set up shared objectives

        $shared_objectives_ids = range(1,16);
        shuffle($shared_objectives_ids);
        $current_shared_objectives = array_slice($shared_objectives_ids, 0, 3);
        $this->setGlobalVariable('current_shared_objectives', $current_shared_objectives);

        // Set up tiles

        if ($this->getPlayersNumber() <= 3) {

            // var is point value of a tile, [0] array is tile locations on the desert board and [1] is css identifiers
            $ones = [ [1,3,6,8,11,13], [1,2,3,4,5,6] ];
            $twos = [ [2,4,7,9,12,15,16,19,21,28,29], [13,14,15,16,17,18,19,20,21,22,23] ];
            $threes = [ [17,20,23,25], [25,26,27,28] ];
            $fours = [ [10,14,18,27,30], [29,30,31,32,33] ];
            $fives = [ [22,24,26,31,32], [38,39,40,41,42,43] ];

            // pitch order contains tiles that are printed on the board
            $pitch_order = [];
            $pitch_order[5] = 36;
            $tiles_number = 32;

        } else {

            // var is point value of a tile, [0] array is tile locations on the forest board and [1] is css identifiers
            $ones = [ [5,8,13,17,19,26], [1,2,3,4,5,6] ];
            $twos = [ [2,4,9,14,16,20,23,27,36,37,39], [13,14,15,16,17,18,19,20,21,22,23] ];
            $threes = [ [28,30,32,34], [25,26,27,28] ];
            $fours = [ [12,24,35,38,40], [29,30,31,32,33] ];
            $fives = [ [29,31,33,41,42,43], [38,39,40,41,42,43] ];

            // pitch order contains tiles that are printed on the board
            $pitch_order = [];
            $pitch_order[1] = 9;
            $pitch_order[3] = 10;
            $pitch_order[6] = 36;
            $pitch_order[7] = 24;
            $pitch_order[10] = 12;
            $pitch_order[11] = 8;
            $pitch_order[15] = 11;
            $pitch_order[18] = 37;
            $pitch_order[21] = 7;
            $pitch_order[22] = 35;
            $pitch_order[25] = 34;
            $tiles_number = 43;
        }

        for ($i=1; $i<=$tiles_number; $i++) {

            if (in_array($i, $twos[0])) {
                // pick a random pitch from the twos
                shuffle($twos[1]);
                $pitch_order[$i] = array_pop($twos[1]);

            } else if (in_array($i, $ones[0])) {
                shuffle($ones[1]);
                $pitch_order[$i] = array_pop($ones[1]);

            } else if (in_array($i, $fours[0])) {
                shuffle($fours[1]);
                $pitch_order[$i] = array_pop($fours[1]);

            } else if (in_array($i, $fives[0])) {
                shuffle($fives[1]);
                $pitch_order[$i] = array_pop($fives[1]);

            } else if (in_array($i, $threes[0])) {
                shuffle($threes[1]);
                $pitch_order[$i] = array_pop($threes[1]);
            }
        }

        // Write pitches into DB

        $sql = "INSERT INTO board (pitch_location, pitch_id) VALUES ";
        $sql_values = [];
        foreach($pitch_order as $location => $pitch) {

            $pitch_location = $location;
            //$pitch_name = $this->pitches[$pitch]['name'];
            $pitch_id = $pitch;

            $sql_values[] = "('$pitch_location','$pitch_id')";
        }
        $sql .= implode(',', $sql_values);
        self::DbQuery($sql);


        // Create character pool

        $character_count = count($players) +1;
        $character_pool = [ [1,2], [3,4], [5,6], [7,8], [9,10], [11,12] ];
        shuffle($character_pool);
        $available_characters = [];
        for ($i=1; $i<=$character_count; $i++) {
            $current_board = array_pop($character_pool);
            shuffle($current_board);
            $current_character = array_pop($current_board);
            $available_characters[] = $current_character;
        }
        $this->setGlobalVariable('available_characters', $available_characters);

        // Create personal objective pile
        $personal_objective_deck = range(1, 12);
        shuffle($personal_objective_deck);
        $this->setGlobalVariable('personal_objective_deck', $personal_objective_deck);
        $this->setGlobalVariable('personal_objectives', []);

        // Create water and psych db containers
        $this->setGlobalVariable('water', []);
        $this->setGlobalVariable('psych', []);

        // Track drawing assets during setup
        $this->setGlobalVariable('draw_step', 1);
        $this->setGlobalVariable('x_cards', 5);

        // Activate first player
        $this->activeNextPlayer();

        /**** FOR TESTING ****/
        foreach ($players as $player_id => $player) {
            $this->cards_and_tokens->pickCardsForLocation(3, 'asset_deck', $player_id);
        }

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, `character`, player_no turn_order FROM player ";
        $result['players'] = self::getCollectionFromDB( $sql );

        // FOR DEBUGGING THROUGH JAVASCRIPT

        
        // Get materials
        $result['pitches'] = $this->pitches;
        $result['asset_cards'] = $this->asset_cards;
        $result['climbing_cards'] = $this->climbing_cards;
        $result['summit_beta_tokens'] = $this->summit_beta_tokens;
        $result['shared_objectives'] = $this->shared_objectives;
        $result['current_shared_objectives'] = $this->getGlobalVariable('current_shared_objectives');
        $result['characters'] = $this->characters;
        $result['available_characters'] = $this->getGlobalVariable('available_characters');
        $result['personal_objectives'] = $this->personal_objectives;
        $result['current_personal_objectives'] = $this->getGlobalVariable('personal_objectives');
        $result['water'] = $this->getGlobalVariable('water', true);
        $result['psych'] = $this->getGlobalVariable('psych', true);

        // Get starting Spread
        $result['spread'] = self::getCollectionFromDB(
                                "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_location='the_spread'", true
        );

        // Get cards in each players' hands
        foreach ($result['players'] as $player) {
            $player_id = $player['id'];
            $sql = "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='asset' AND card_location='$player_id'";
            $result["{$player['id']}_hand_assets"] = self::getCollectionFromDb($sql, true);
        }

        // Get token in each players' hands
        foreach ($result['players'] as $player) {
            $player_id = $player['id'];
            $sql = "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='summit_beta' AND card_location='$player_id'";
            $result["{$player['id']}_hand_tokens"] = self::getCollectionFromDb($sql, true);
        }

        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in firstascent.action.php)
    */

    function confirmCharacter($character) {
        self::checkAction('confirmCharacter');
        $player_id = self::getActivePlayerId();
        $character_color = $this->characters[$character]['color'];

        // remove the chosen character from available_characters
        $remaining_characters = $this->getGlobalVariable('available_characters');
        if (($key = array_search($character, $remaining_characters)) !== false) {
            unset($remaining_characters[$key]);
        }
        $this->setGlobalVariable('available_characters', array_values($remaining_characters));

        self::DbQuery("UPDATE player SET `character`='$character', player_color='$character_color' WHERE player_id='$player_id'");
        self::reloadPlayersBasicInfos();

        // deal 2 personal objectives
        $personal_objective_deck = $this->getGlobalVariable('personal_objective_deck');
        $current_personal_objectives = [
                                            array_pop($personal_objective_deck),
                                            array_pop($personal_objective_deck),
                                       ];
        $this->setGlobalVariable('personal_objective_deck', $personal_objective_deck);
        $personal_objectives = $this->getGlobalVariable('personal_objectives', true);
        $personal_objectives[$player_id] = $current_personal_objectives;
        $this->setGlobalVariable('personal_objectives', $personal_objectives);

        // initialize water and psych
        $starting_value = $this->characters[$character]['water_psych'];
        $water = $this->getGlobalVariable('water', true);
        $water[$player_id] = $starting_value;
        $this->setGlobalVariable('water', $water);
        $psych = $this->getGlobalVariable('psych', true);
        $psych[$player_id] = $starting_value;
        $this->setGlobalVariable('psych', $psych);

        self::notifyAllPlayers("confirmCharacter", clienttranslate('${player_name} chooses ${character}'), array(
            'player_name' => self::getActivePlayerName(),
            'player_id' => $player_id,
            'character' => $this->characters[$character]['description'],
            'character_div' => "character_{$character}",
            'character_num' => $character
        ));
        self::notifyPlayer($player_id, "dealPersonalObjectives", "", array(
            'current_personal_objectives' => $current_personal_objectives
        ));

        $this->gamestate->nextState('confirmCharacter');
    }


    function confirmAssets($deck_assets, $spread_assets) {
        self::checkAction('confirmAssets');
        $player_id = self::getActivePlayerId();
        $deck_assets = intval($deck_assets);
        if ($spread_assets) {
            $spread_assets_db = self::getCollectionFromDB("SELECT card_type_arg FROM cards_and_tokens WHERE card_id IN (".implode(',', array_map('intval', $spread_assets)).")");
            $spread_card_types = array_keys($spread_assets_db);

            // Move selected spread cards to hand
            $this->cards_and_tokens->moveCards($spread_assets, $player_id);
            $spread_assets_for_log = '';
            for ($i=1; $i<=count($spread_assets); $i++) {
                $asset_title = $this->asset_cards[$spread_card_types[$i-1]]['description'];
                if ($i === 1) { $spread_assets_for_log .= $asset_title; }
                elseif ($i === count($spread_assets)) { $spread_assets_for_log .= ", and {$asset_title}"; }
                else { $spread_assets_for_log .= ', ' . $asset_title; }
            }
        } else { $spread_assets_for_log = 'nothing'; }

        // Move selected deck cards to hand
        $deck_assets_arr = $this->cards_and_tokens->pickCardsForLocation($deck_assets, 'asset_deck', $player_id);

        // Refill the spread
        $empty_slots = count($spread_assets);
        $spread_assets_arr = $this->cards_and_tokens->pickCardsForLocation($empty_slots, 'asset_deck', 'the_spread');

        self::notifyAllPlayers("confirmOpponentAssets", clienttranslate('${player_name} takes ${spread_for_log} from the Spread and ${deck_num} asset/s from the deck'), array(
                'player_name' => self::getActivePlayerName(),
                'spread_for_log' => $spread_assets_for_log,
                'spread_card_ids' => $spread_assets,
                'deck_num' => $deck_assets,
                'player_id' => $player_id,
                'hand_count' => count($this->getAllDatas()["{$player_id}_hand_assets"]),
                'spread_assets_arr' => $spread_assets_arr
        ));

        self::notifyPlayer($player_id, "confirmYourAssets", clienttranslate('${player_name} takes ${spread_for_log} from the Spread
            and ${deck_num} asset/s from the deck'), array(
                'player_name' => self::getActivePlayerName(),
                'spread_for_log' => $spread_assets_for_log,
                'spread_card_ids' => $spread_assets,
                'deck_num' => $deck_assets,
                'player_id' => $player_id,
                'hand_count' => count($this->getAllDatas()["{$player_id}_hand_assets"]),
                'deck_assets_arr' => $deck_assets_arr,
                'spread_assets_arr' => $spread_assets_arr
        ));

        $this->gamestate->nextState('nextDraw');
    }

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function argDrawAssets() {
        return array(
            "x_cards" => $this->getGlobalVariable('x_cards'),
        );
    }

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stNextCharacterSelect() {
        $player_id = self::activeNextPlayer();
        self::giveExtraTime($player_id);
        if (count($this->getGlobalVariable('available_characters')) > 1) {
            $this->gamestate->nextState('nextSelection');
        } else {
            $this->gamestate->nextState('drawAssets');
        }
    }

    function stNextDraw() {
        $player_id = self::activeNextPlayer();
        self::giveExtraTime($player_id);

        $draw_step = $this->getGlobalVariable('draw_step');
        $obj = $this;
        function nextRound($obj) {
            $obj->setGlobalVariable('draw_step', 10);
            $obj->setGlobalVariable('x_cards', 3);
            $obj->gamestate->nextState('nextRound');
        }
        switch (true) {
            case $draw_step === 1:
                $this->setGlobalVariable('draw_step', 2);
                break;
            case $draw_step === 2:
                if ($draw_step < $this->getPlayersNumber()) { 
                    $this->setGlobalVariable('draw_step', 3);
                    $this->setGlobalVariable('x_cards', 6);
                }
                else { nextRound($obj); }
                break;
            case $draw_step === 3;
                if ($draw_step < $this->getPlayersNumber()) { 
                    $this->setGlobalVariable('draw_step', 4);
                    $this->setGlobalVariable('x_cards', 7);
                }
                else { nextRound($obj); }
                break;
            case $draw_step === 4;
                if ($draw_step < $this->getPlayersNumber()) { 
                    $this->setGlobalVariable('draw_step', 5);
                    $this->setGlobalVariable('x_cards', 8);
                }
                else { nextRound($obj); }
                break;
            case $draw_step === 5:
                nextRound($obj);
                break;
            case $draw_step === 10:
                $this->setGlobalVariable('draw_step', 11);
                break;
        }
        $state = $this->gamestate->state();
        if ($state['name'] == 'nextDraw') { $this->gamestate->nextState('drawAssets'); }
    }

    /*


//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}