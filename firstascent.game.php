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
require_once('modules/utils.php');


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

        // Init globals
        $player_names_and_colors = [];
        foreach($players as $player_id => $player) {

            $player_name = $this->getUniqueValueFromDb("SELECT `player_name` FROM `player` WHERE `player_id` = '$player_id'");
            $player_names_and_colors[$player_id]['name'] = $player_name;
        }
        $this->setGlobalVariable('player_names_and_colors', $player_names_and_colors);

        $this->setGlobalVariable('finished_climbing', []);
        $this->setGlobalVariable('finished_portaledge', []);
        $this->setGlobalVariable('lost_die_roll', []);
        $this->setGlobalVariable('pitch_asset_tokens', []);
        $this->setGlobalVariable('next_climber', null);
        $this->setGlobalVariable('passed_climbing_card', []);
        $this->setGlobalVariable('rested', []);
        $this->setGlobalVariable('finished_drawing', []);
        $this->setGlobalVariable('gained_permanent_assets', []);
        $this->setGlobalVariable('refill_portaledge', []);
        $this->setGlobalVariable('headwall_revealed', false);

        $starting_player = $this->getUniqueValueFromDb("SELECT `player_id` FROM `player` WHERE `player_no` = '1'");
        $this->setGlobalVariable('starting_player', $starting_player);

        // Initialize pitch tracker
        $pitch_tracker = [];
        foreach($players as $player_id => $player) { $pitch_tracker[$player_id] = ['0']; }
        $this->setGlobalVariable('pitch_tracker', $pitch_tracker);

        // Initialize resource tracker
        $resource_tracker = [];
        $water_psych_tracker = [];
        foreach($players as $player_id => $player) {
            $resource_tracker[$player_id] = [
                "skills" => [
                    "gear" => 0,
                    "face" => 0,
                    "crack" => 0,
                    "slab" => 0
                ],

                "permanent_skills" => [
                    "gear" => 0,
                    "face" => 0,
                    "crack" => 0,
                    "slab" => 0
                ],

                "techniques" => [
                    "precision" => 0,
                    "balance" => 0,
                    "pain_tolerance" => 0,
                    "power" => 0,
                    "wild" => 0
                ],

                "asset_board" => [
                    "skills" => [
                        "gear" => 0,
                        "face" => 0,
                        "crack" => 0,
                        "slab" => 0
                    ],
                    
                    "techniques" => [
                        "precision" => 0,
                        "balance" => 0,
                        "pain_tolerance" => 0,
                        "power" => 0,
                        "wild" => 0
                    ],

                ],

                "symbol_tokens" => [
                    "gear" => 0,
                    "face" => 0,
                    "crack" => 0,
                    "slab" => 0,
                    "precision" => 0,
                    "balance" => 0,
                    "pain_tolerance" => 0,
                    "power" => 0
                ],

                "water" => 0,
                "psych" => 0
            ];
            $water_psych_tracker[$player_id] = [ "water" => 0, "psych" => 0 ];
        }
        $this->setGlobalVariable('resource_tracker', $resource_tracker);
        $this->setGlobalVariable('water_psych_tracker', $water_psych_tracker);

        // Initialize asset board tracker
        $board_assets = [];
        foreach(array_keys($players) as $player_id) {

            foreach (['gear', 'face', 'crack', 'slab'] as $type) {
                $board_assets[$player_id][$type] = [

                    "count" => 0,
                     "1" => [],
                     "2" => [],
                     "3" => [],
                     "4" => [],
                     "flipped" => ["1" => null, "2" => null, "3" => null, "4" => null],
                     "tucked" => [],
                     "permanent" => 0
                      ];
            }
        }
        $this->setGlobalVariable('board_assets', $board_assets);

        // Initialize asset_board_token_tracker
        $asset_board_token_tracker = [];
        foreach($players as $player_id => $player) {
            $asset_board_token_tracker[$player_id] = [
                "points_tokens" => 0,
                "permanent_tokens" => [
                    "gear" => 0,
                    "face" => 0,
                    "crack" => 0,
                    "slab" => 0
                ]
            ];
        }
        $this->setGlobalVariable('asset_board_token_tracker', $asset_board_token_tracker);
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );

        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

    // Select board for player count
        if ($this->getPlayersNumber() <= 3) { $board = 'desert'; }
        else { $board = 'forest'; }
        $this->setGlobalVariable('board', $board);

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
        // $this->cards_and_tokens->pickCardsForLocation(44, 'climbing_deck', 'climbing_discard');
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
        // $this->cards_and_tokens->pickCardsForLocation(1, 'summit_beta_supply', 'summit_beta_discard');
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

        shuffle($gear_assets);
        shuffle($face_assets);
        shuffle($crack_assets);
        shuffle($slab_assets);

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

        // ****** SPREAD TESTING ******

        /*$assets_10 = $this->cards_and_tokens->getCardsOfType('asset', '10');
        $i = 1;
        foreach ($assets_10 as $asset) {
            if ($i <= 4) { $this->cards_and_tokens->moveCard($asset['id'], 'the_spread'); }
            $i++;
        }*/

        // draw starting spread
        $this->cards_and_tokens->pickCardsForLocation(4, 'asset_deck', 'the_spread');


    // Set up board

        // set up shared objectives

        $shared_objectives_ids = range(1,16);
        shuffle($shared_objectives_ids);
        $current_shared_objectives = array_slice($shared_objectives_ids, 0, 3);
        $this->setGlobalVariable('current_shared_objectives', $current_shared_objectives);

        // Set up tiles

        if ($board === 'desert') {

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

        $pitch_identifier = [];
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

            $pitch_identifier[$i] = strval($pitch_order[$i]);
        }
        $this->setGlobalVariable('pitch_identifier', $pitch_identifier);

        $asset_identifier = self::getCollectionFromDB(
                                "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='asset'", true);
        $token_identifier = self::getCollectionFromDB(
                                "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='summit_beta'", true);
        $climbing_card_identifier = self::getCollectionFromDB(
                                "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='climbing'", true);
        $this->setGlobalVariable('asset_identifier', $asset_identifier);
        $this->setGlobalVariable('token_identifier', $token_identifier);
        $this->setGlobalVariable('climbing_card_identifier', $climbing_card_identifier);

        // Write pitches into DB

        $sql = "INSERT INTO board (pitch_location, pitch_id) VALUES ";
        $sql_values = [];
        foreach($pitch_order as $location => $pitch) {

            $pitch_location = $location;
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

        // Track drawing assets during setup
        $this->setGlobalVariable('draw_step', 1);
        $this->setGlobalVariable('x_cards', 5);

        // Activate last player
        $player_count = count($players);
        $last_player = $this->getUniqueValueFromDb("SELECT `player_id` FROM `player` WHERE `player_no` = '$player_count'");
        $this->gamestate->changeActivePlayer($last_player);

        /**** FOR TESTING ****/
        /*foreach ($players as $player_id => $player) {
            $this->cards_and_tokens->pickCardsForLocation(3, 'asset_deck', $player_id);
        }
*/
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
        
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_name name, player_score score, `character`, player_no turn_order, player_color color FROM player ";
        $result['players'] = self::getCollectionFromDB( $sql );

        // !! We must only return informations visible by this player !!
        $current_player_id = (array_key_exists(self::getCurrentPlayerId(), $result['players'])) ? self::getCurrentPlayerId() : null;

        // FOR DEBUGGING THROUGH JAVASCRIPT

        // Turn order
        $this->setGlobalVariable('player_order', self::getCollectionFromDb("SELECT player_no, player_id FROM player", true));

        // Add asset tokens on pitches to materials and gamedatas
        $pitch_asset_tokens = $this->getGlobalVariable('pitch_asset_tokens', true);
        foreach($pitch_asset_tokens as $pitch_type_arg => $token_types_array) {
            foreach($token_types_array as $type) { $this->pitches[ $pitch_type_arg ]['requirements'][ $type ]++; }
        }
        $result['pitch_asset_tokens'] = $pitch_asset_tokens;

        // Player names, colors, and character
        $result['player_names_and_colors'] = $this->getGlobalVariable('player_names_and_colors', true);

        // Get materials
        $result['board'] = $this->getGlobalVariable('board');
        $result['pitches'] = $this->pitches;
        $result['asset_cards'] = $this->asset_cards;
        $result['climbing_cards'] = $this->climbing_cards;
        $result['summit_beta_tokens'] = $this->summit_beta_tokens;
        $result['shared_objectives'] = $this->shared_objectives;
        $result['current_shared_objectives'] = $this->getGlobalVariable('current_shared_objectives');
        $result['characters'] = $this->characters;
        $result['available_characters'] = $this->getGlobalVariable('available_characters');
        $result['personal_objectives'] = $this->personal_objectives;
        $result['water_psych_tracker'] = $this->getGlobalVariable('water_psych_tracker');

        // Get starting Spread
        $result['spread'] = self::getCollectionFromDB(
                                "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_location='the_spread'", true
        );

        // Get cards and tokens in each players' hand and asset board
        if ($current_player_id) {
            $result['current_personal_objectives'] = (isset($this->getGlobalVariable('personal_objectives', true)[$current_player_id])) ? $this->getGlobalVariable('personal_objectives', true)[$current_player_id] : null;
            $result["hand_assets"] = $this->getHandAssets($current_player_id);
            $result["hand_summit_beta_tokens"] = $this->getHandSummitBetaTokens($current_player_id);
            $result["hand_symbol_tokens"] = $this->getGlobalVariable('resource_tracker', true)[$current_player_id]['symbol_tokens'];
            $result['resource_tracker'] = $this->getGlobalVariable('resource_tracker', true)[$current_player_id];
        }

        $result["starting_player"] = $this->getGlobalVariable('starting_player');

        $result["board_assets"] = $this->getGlobalVariable('board_assets', true);
        $result["hand_count"] = [];
        foreach ($result['players'] as $player) { $result["hand_count"][$player['id']] = count($this->getHandAssets($player['id'])); }
        
        $result['pitch_tracker'] = $this->getGlobalVariable('pitch_tracker', true);
        $result['pitch_identifier'] = $this->getGlobalVariable('pitch_identifier', true);
        $result['asset_identifier'] = $this->getGlobalVariable('asset_identifier', true);
        $result['token_identifier'] = $this->getGlobalVariable('token_identifier', true);
        $result['climbing_card_identifier'] = $this->getGlobalVariable('climbing_card_identifier', true);

        $result['climbing_card_info'] = $this->getGlobalVariable('climbing_card_info', true);

        $result['climbing_discard_top_card'] = $this->cards_and_tokens->getCardOnTop('climbing_discard');
        $result['asset_discard_top_card'] = $this->cards_and_tokens->getCardOnTop('discard');

        $current_state = $this->gamestate->state();

        $result['climbing_in_play'] =  ($current_state['name'] != 'climbingCard' && $current_state['name'] != 'addTokenToPitch') ? $this->getCollectionFromDB("SELECT card_id id, card_type_arg type_arg FROM cards_and_tokens WHERE card_location='in_play'", true) : array();

        $result['current_state'] = $this->gamestate->state()['name'];

        $chooseSummitBetaToken = $this->getGlobalVariable('climbing_card_info', true)['summit_beta_tokens'] ?? null;
        $result['chooseSummitBetaToken'] = $chooseSummitBetaToken;

        $result['empty_portaledge'] = [];
        foreach (['Gear', 'Face', 'Crack', 'Slab'] as $type) {
            $deck_name = 'porta' . $type;
            $deck = self::getObjectListFromDb("SELECT card_id FROM cards_and_tokens WHERE card_location='$deck_name'");
            if (count($deck) === 0) { $result['empty_portaledge'][] = strtolower($type); }
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
        $player_names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);
        $player_names_and_colors[$player_id]['color'] = '#' . $character_color;
        $player_names_and_colors[$player_id]['character'] = $character;
        $this->setGlobalVariable('player_names_and_colors', $player_names_and_colors);


        // deal 2 personal objectives
        $personal_objective_deck = $this->getGlobalVariable('personal_objective_deck');
        $current_personal_objectives = [
                                            array_pop($personal_objective_deck),
                                            array_pop($personal_objective_deck),
                                       ];
        $personal_objectives = $this->getGlobalVariable('personal_objectives', true);
        $personal_objectives[$player_id] = $current_personal_objectives;
        $this->setGlobalVariable('personal_objective_deck', $personal_objective_deck);
        $this->setGlobalVariable('personal_objectives', $personal_objectives);

        // initialize water and psych
        $starting_value = $this->characters[$character]['water_psych'];
        $this->updateResourceTracker($player_id, 'add', $starting_value, $starting_value);
        

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


    function confirmAssets($deck_assets=0, $spread_assets=[]) {
        self::checkAction('confirmAssets');
        $player_id = self::getActivePlayerId();
        $deck_assets = intval($deck_assets);
        $this->setGlobalVariable('confirm_assets', $this->getGlobalVariable('resource_tracker', true));

        $spread_assets_for_log = '';
        if ($spread_assets) {
            $spread_assets_db = self::getCollectionFromDB("SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_id IN (".implode(',', array_map('intval', $spread_assets)).")");
            $spread_card_types = [];
            foreach (array_values($spread_assets_db) as $asset) {
                array_push($spread_card_types, $asset['card_type_arg']);
            } 

            // Move selected spread cards to hand
            $this->cards_and_tokens->moveCards($spread_assets, $player_id);

            for ($i=1; $i<=count($spread_assets); $i++) {
                $type = $spread_card_types[$i-1];

                // spread message for log
                $asset_title = $this->asset_cards[$type]['description'];
                if ($i === 1) { $spread_assets_for_log .= "[{$asset_title}({$type})]"; }
                elseif (count($spread_assets) === 2 && $i === 2) { $spread_assets_for_log .= " and [{$asset_title}({$type})]"; }
                elseif ($i === count($spread_assets)) { $spread_assets_for_log .= ", and [{$asset_title}({$type})]"; }
                else { $spread_assets_for_log .= ", [{$asset_title}({$type})]"; }
            }

            // update resource_tracker
            $this->updateResourceTracker($player_id, 'add', null, null, $spread_card_types);

        } else { 
            $spread_card_types = [];
        }

        // Move selected deck cards to hand
        $deck_assets_arr = $this->cards_and_tokens->pickCardsForLocation($deck_assets, 'asset_deck', $player_id);
        $deck_card_types = array_column($deck_assets_arr, 'type_arg');
        $deck_card_ids = array_column($deck_assets_arr, 'id');

        // update resource_tracker
        $this->updateResourceTracker($player_id, 'add', null, null, $deck_card_types);

        $deck_assets_for_log = '';
        for ($i=1; $i<=count($deck_card_types); $i++) {
            $type = $deck_card_types[$i-1];
            $asset_title = $this->asset_cards[$type]['description'];
            if ($i === 1) { $deck_assets_for_log .= "[{$asset_title}({$type})]"; }
            elseif (count($deck_card_types) === 2 && $i === 2) { $deck_assets_for_log .= " and [{$asset_title}({$type})]"; }
            elseif ($i === count($deck_card_types)) { $deck_assets_for_log .= ", and [{$asset_title}({$type})]"; }
            else { $deck_assets_for_log .= ", [{$asset_title}({$type})]"; }
        }

        $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];

        // Refill the spread
        $empty_slots = count($spread_assets);
        $spread_assets_arr = $this->cards_and_tokens->pickCardsForLocation($empty_slots, 'asset_deck', 'the_spread');

        // For resizeHand()
        $new_cards = array_merge($deck_card_ids, $spread_assets);

        // In case of active climbing card
        $climbing_card = $this->getGlobalVariable('climbing_card_info', true) ? true : false;
        $climbing_card_info = $climbing_card ? $this->getGlobalVariable('climbing_card_info', true) : null;

        // create log message
        $log_message = '${player_name} takes ';
        if ($spread_assets) { $log_message .= '${spread_assets_for_log} from the Spread'; }
        $log_message_opponent = $log_message;
        if ($spread_assets && $deck_assets > 0) {
            $log_message .= ' and ${deck_assets_for_log} from the deck';
            $log_message_opponent .= ' and ${deck_num} asset/s from the deck';
        } else if (!$spread_assets && $deck_assets > 0) {
            $log_message .= '${deck_assets_for_log} from the deck';
            $log_message_opponent .= '${deck_num} asset/s from the deck';
        }

        self::notifyAllPlayers("confirmOpponentAssets", clienttranslate($log_message_opponent), array(
                'player_name' => self::getActivePlayerName(),
                'spread_assets' => $spread_card_types,
                'spread_card_ids' => $spread_assets,
                'deck_num' => $deck_assets,
                'player_id' => $player_id,
                'hand_count' => count($this->getHandAssets($player_id)),
                'spread_assets_arr' => $spread_assets_arr,
                'spread_assets_for_log' => $spread_assets_for_log,
                'player_resources' => $player_resources,
                'climbing_card' => $climbing_card,
        ));

        self::notifyPlayer($player_id, "confirmYourAssets", clienttranslate($log_message), array(
                'player_name' => self::getActivePlayerName(),
                'spread_assets' => $spread_card_types,
                'spread_card_ids' => $spread_assets,
                'deck_assets' => $deck_card_types,
                'deck_num' => $deck_assets,
                'player_id' => $player_id,
                'hand_count' => count($this->getHandAssets($player_id)),
                'spread_assets_arr' => $spread_assets_arr,
                'deck_assets_arr' => $deck_assets_arr,
                'spread_assets_for_log' => $spread_assets_for_log,
                'deck_assets_for_log' => $deck_assets_for_log,
                'player_resources' => $player_resources,
                'new_cards' => $new_cards,
                'deck_card_ids' => $deck_card_ids,
                'climbing_card' => $climbing_card,
        ));

        if ($climbing_card) {
            $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
            $this->setGlobalVariable('climbing_card_info', array());
            $this->gamestate->nextState('nextClimb');
        }
        else { $this->gamestate->nextState('nextDraw'); }
    }

    function confirmRequirements($selected_resources, $selected_hex, $selected_pitch) {
        self::checkAction('confirmRequirements');
        $player_id = self::getActivePlayerId();

        $pitch_tracker = $this->getGlobalVariable('pitch_tracker', true);
        array_push($pitch_tracker[$player_id], $selected_hex);
        $this->setGlobalVariable('pitch_tracker', $pitch_tracker);

        if ($selected_resources) {
            sort($selected_resources);
            $selected_resources_db = self::getCollectionFromDB("SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_id IN (".implode(',', array_map('intval', $selected_resources)).")");
            $selected_resource_types = [];
            foreach (array_values($selected_resources_db) as $asset) {
                array_push($selected_resource_types, $asset['card_type_arg']);
            } 

            $requirements_arr_for_log = [];
            $requirements = $this->pitches[$selected_pitch]['requirements'];

            $board_assets = $this->getGlobalVariable('board_assets', true);

            for ($i=1; $i<=count($selected_resources); $i++) {

                $type_arg = $selected_resource_types[$i-1];
                $resource_type = $this->asset_cards[$type_arg]['skills'];
                foreach ($resource_type as $key=>$value) {
                    if ($value) { $type = $key; }
                }
                $this->cards_and_tokens->insertCardOnExtremePosition($selected_resources[$i-1], "{$player_id}_played_{$type}", true);
                $asset_count = $board_assets[$player_id][$type]["count"];

                if ($asset_count >= 4) {
                    $vacated_slot = 1;
                    $new_slot = 4;
                    $vacated_card = $board_assets[$player_id][$type][$vacated_slot];

                    $board_assets[$player_id][$type]['tucked'][array_keys($vacated_card)[0]] = array_values($vacated_card)[0];
                    unset($board_assets[$player_id][$type][$vacated_slot][array_keys($vacated_card)[0]]);

                    $this->setGlobalVariable('board_assets', $board_assets);
                    $this->repositionAssetBoard($player_id);
                    $board_assets = $this->getGlobalVariable('board_assets', true);

                    $board_assets[$player_id][$type][$new_slot] = [$selected_resources[$i-1] => $type_arg];
                    $board_assets[$player_id][$type]['flipped'][$new_slot] = false;
                }
                else if ($asset_count < 4) {
                    $board_assets[$player_id][$type][$asset_count+1][$selected_resources[$i-1]] = $type_arg;
                    $board_assets[$player_id][$type]['flipped'][$asset_count+1] = false;
                }
                $board_assets[$player_id][$type]["count"]++;

                $asset_title = $this->asset_cards[$type_arg]['description'];
                array_push($requirements_arr_for_log, "[{$asset_title}({$type_arg})]");
            }
            if ($requirements['water'] > 0) {
                $water_for_log = $requirements['water'] . ' water';
                array_push($requirements_arr_for_log, $water_for_log);
            }
            if ($requirements['psych'] > 0) {
                $psych_for_log = $requirements['psych'] . ' psych';
                array_push($requirements_arr_for_log, $psych_for_log);
            }

            $requirements_for_log = '';
            for ($i=0; $i<=count($requirements_arr_for_log)-1; $i++) {
                if (count($requirements_arr_for_log) === 2 && $i === 0) { $requirements_for_log .= $requirements_arr_for_log[$i]; }
                elseif ($i < count($requirements_arr_for_log)-1) { $requirements_for_log .= $requirements_arr_for_log[$i] . ', '; }
                else { $requirements_for_log .= 'and ' . $requirements_arr_for_log[$i]; }
            }

            // update resource_tracker
            $water = ($requirements['water'] != 0) ? $requirements['water'] : null;
            $psych = ($requirements['psych'] != 0) ? $requirements['psych'] : null;
            $this->updateResourceTracker($player_id, 'subtract', $water, $psych, $selected_resource_types, null, false, true);
            $this->setGlobalVariable('board_assets', $board_assets);

        } else { 
            $requirements_for_log = 'nothing';
            $selected_resource_types = [];
        }

        $pitch = $this->pitches[$selected_pitch]['description'];
        $pitch_for_log = '{' . $pitch . '(' . $selected_pitch . ')}';

        $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];
        $player_water_psych = $this->getGlobalVariable('water_psych_tracker')->$player_id;
        $water_psych_requirements = array('water' => $requirements['water'], 'psych' => $requirements['psych']);

        self::notifyAllPlayers("confirmOpponentRequirements", clienttranslate('${player_name} spends ${requirements_for_log} and climbs ${pitch_for_log}'), array(
                'player_name' => self::getActivePlayerName(),
                'requirements_for_log' => $requirements_for_log,
                'pitch_for_log' => $pitch_for_log,
                'player_id' => $player_id,
                'selected_resource_types' => $selected_resource_types,
                'selected_resources' => $selected_resources,
                'hand_count' => count($this->getHandAssets($player_id)),
                'selected_pitch' => $selected_pitch,
                'player_water_psych' => $player_water_psych,
                'water_psych_requirements' => $water_psych_requirements,
        ));

        self::notifyPlayer($player_id, "confirmYourRequirements", clienttranslate('${player_name} spends ${requirements_for_log} and climbs ${pitch_for_log}'), array(
                'player_name' => self::getActivePlayerName(),
                'requirements_for_log' => $requirements_for_log,
                'pitch_for_log' => $pitch_for_log,
                'selected_pitch' => $selected_pitch,
                'player_id' => $player_id,
                'selected_resource_types' => $selected_resource_types,
                'selected_resources' => $selected_resources,
                'player_resources' => $player_resources,
                'hand_count' => count($this->getHandAssets($player_id)),
                'water_psych_requirements' => $water_psych_requirements,
                'selected_resources_db' => $selected_resources_db,
        ));

        $climbing_card_info = $this->cards_and_tokens->pickCardForLocation('climbing_deck', 'in_play');
        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
        self::notifyAllPlayers("drawClimbingCard", '', array(
                'climbing_card_info' => $climbing_card_info,
        ));
        $climbing_card_type_arg = $climbing_card_info['type_arg'];
        if (in_array($climbing_card_type_arg, ['2', '6', '36', '41', '50', '54', '63'])) {

            $this->gamestate->nextState('addTokenToPitch');

        } else { $this->gamestate->nextState('drawClimbingCard'); }
    }

    function rest($player_id) {
        self::checkAction('rest');

        $rested = $this->getGlobalVariable('rested', true);
        $rested[] = $player_id;
        $this->setGlobalVariable('rested', $rested);

        self::notifyAllPlayers('log_only', clienttranslate('${player_name} rested'), array(
            'player_name' => self::getActivePlayerName(),
        ));

        $this->gamestate->nextState('nextClimb');
    }

    function confirmClimbingCardChoice($choice, $card_id, $card_type) {
        self::checkAction('confirmClimbingCardChoice');
                               
        $player_id = self::getActivePlayerId();
        $names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);
                                                  
        $climbing_card = $this->climbing_cards[$card_type];
        $choice_args = $climbing_card[$choice . '_args'];
        $cost = $choice_args['cost'];
        $benefit = $choice_args['benefit'];

        // changes in water or psych
        $water = $choice_args['water'];
        $psych = $choice_args['psych'];
        $water_psych_for_climbing = array('water' => $water, 'psych' => $psych);

        if (array_key_exists('all', $choice_args) && !in_array($card_type, ['29', '66'])) {

            foreach(array_keys($names_and_colors) as $id) { $this->updateResourceTracker($id, 'add', $water, $psych); }

        } else { $this->updateResourceTracker($player_id, 'add', $water, $psych); }

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $climbing_card_info['choice_args'] = $choice_args;
        $climbing_card_info['water_psych_for_climbing'] = $water_psych_for_climbing;
        $climbing_card_info['player_id'] = intval($player_id);

        // discarding an asset
        $discard = false;
        $discard_type = null;
        $discard_num = ($choice_args['cost'] === 'giveAssets') ? abs($choice_args['give_assets']) : null;
        foreach($choice_args['assets'] as $type => $value) { if ($value < 0) {
            $discard = true;
            $discard_type = $type;
            $discard_num = abs($value);
        } }
        if (array_key_exists('discard_num', $choice_args)) {
            $discard = true;
            $discard_type = $choice_args['discard_type'];
            $discard_num = $choice_args['discard_num'];
        }
        
        // automatic drawing from the portaledge
        $portaledge_draw = false;
        $portaledge_type_arg = null;
        $portaledge_name = '';
        $portaledge_type = '';
        $portaledge_draw_for_log = '';
        $last_card = [];
        $refill_portaledge = [];
        foreach ($choice_args['assets'] as $type => $value) { if ($value === 1 && $discard === false) {
            $portaledge_deck = 'porta' . $type;
            $deck_loc = 'porta' . ucfirst($type);
            $remaining_cards = self::getCollectionFromDb("SELECT card_id FROM cards_and_tokens WHERE card_location='$deck_loc'");
            if (count($remaining_cards) === 1) { $last_card[$type] = 1; }

            $portaledge_draw = $this->drawFromPortaledge($player_id, $type, 1, $remaining_cards);
            $refill_portaledge = $this->getGlobalVariable('refill_portaledge', true);

            $portaledge_type_arg = [$portaledge_draw['type_arg']];
            $portaledge_name = $this->asset_cards[$portaledge_type_arg[0]]['description'];
            $portaledge_draw_for_log = clienttranslate(", gaining [${portaledge_name}(${portaledge_type_arg[0]})]");
            $portaledge_type = $type;
        } }

        // manual drawing from the portaledge
        $portaledge_choose = ($choice_args['benefit'] === 'portaledgeChoose') ? true : false;
        $portaledge_num = $portaledge_choose ? $choice_args['portaledge_num'] : null;
        if ($portaledge_choose && isset($choice_args['all'])) {
            $climbing_card_info['portaledge_all'] = true;
            $climbing_card_info['finished_portaledge'] = [];
        } else if ($portaledge_choose && isset($choice_args['opponents_only'])) {
            $climbing_card_info['portaledge_all'] = true;
            $climbing_card_info['opponents_only'] = true;
            $climbing_card_info['finished_portaledge'] = [$player_id];
        }
        if ($portaledge_choose && isset($choice_args['portaledge_types'])) { $climbing_card_info['portaledge_types'] = $choice_args['portaledge_types']; }

        // drawing from the spread
        if (array_key_exists('spread_draw', $choice_args)) { $climbing_card_info['spread_draw'] = true; }

        // gaining a summit beta token
        $gain_summit_beta_token = ($choice_args['benefit'] === 'summitBetaToken') ? true : false;
        if ($gain_summit_beta_token) {
            $summit_beta_token = $this->cards_and_tokens->pickCardForLocation('summit_beta_supply', $player_id);
            $summit_beta_type_arg = $summit_beta_token['type_arg'];
            $summit_beta_name = $this->summit_beta_tokens[$summit_beta_type_arg]['description'];
            $summit_beta_for_log = '+' . $summit_beta_name . '(' . $summit_beta_type_arg . ')+';
        }

        // gaining a symbol token
        $gain_symbol_token = ($choice_args['benefit'] === 'symbolToken') ? true : false;
        if ($gain_symbol_token) {
            $symbol_type = $choice_args['symbol_type'];
            $symbol_for_log = $choice_args['symbol_for_log'];
        }

        // selecting an opponent
        $select_opponent = ($choice_args['cost'] === 'selectOpponent' ||  $choice_args['benefit'] === 'selectOpponent') ? true : false;

        // share effect with an opponent
        $share = (array_key_exists('share', $choice_args)) ?? false;

        // give asset cards to an opponent
        $give_assets = $choice_args['cost'] === 'giveAssets' ?: false;
        $climbing_card_info['give_opponent'] = $give_assets;

        // roll the risk die
        $risk_die = $choice_args['benefit'] === 'rollRiskDie' ?: false;
        $climbing_card_info['risk_die'] = $risk_die;

        // steal asset from opponent's asset board
        $steal_asset = $choice_args['benefit'] === 'stealAsset' ?: false;

        // filter out bespoke effects
        $bespoke = isset($choice_args['bespoke']) ?? false;

        // update water, psych, and asset type in the event of an automatic portaledge draw
        $auto_portaledge = $portaledge_type_arg ?? [];
        if ($auto_portaledge && !$discard) { $this->updateResourceTracker($player_id, 'add', null, null, $auto_portaledge); }

        // *****
        // conditions above, resolutions below
        // *****

        $climbing_card_name = $climbing_card['description'];
        $climbing_card_for_log = '/' . $climbing_card_name . '(' . $card_type . ')\\';
        $choice_flavor_for_log = $climbing_card['effect_' . $choice . '_flavor'];
        $choice_effect_for_log = $climbing_card['effect_' . $choice];
        $climbing_log_all = '${climbing_card_for_log}: ${player_name} chooses ${choice_flavor} ${choice_effect}';
        $climbing_log = $portaledge_draw ? $climbing_log_all . $portaledge_draw_for_log : $climbing_log_all;
        if ($portaledge_draw) { $climbing_log = $climbing_log_all . $portaledge_draw_for_log; }

        $player_resources = $this->getGlobalVariable('resource_tracker')->$player_id;
        $hand_count = count($this->getHandAssets($player_id));
        $player_water_psych = $this->getGlobalVariable('water_psych_tracker')->$player_id;

        switch (true) {

            case $discard:

                $climbing_card_private = in_array($climbing_card_info['type_arg'], ['8', '32']) && $choice_args['benefit'] == 'summitBetaToken' ?
                    $climbing_card_private = [
                        'summit_beta_token' => $summit_beta_token,
                        'summit_beta_for_log' => $summit_beta_for_log,
                    ] : [];

                $climbing_card_info = array_merge($climbing_card_info, array(
                    'discard_type' => $discard_type,
                    'discard_num' => $discard_num,
                    'final_state' => 'discardAssets',
                ));
                self::notifyAllPlayers("log_only", clienttranslate($climbing_log_all), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                ));
                $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                $this->setGlobalVariable('climbing_card_private', $climbing_card_private);
                $this->gamestate->nextState('discardAssets');
                break;

            case $select_opponent:

                self::notifyAllPlayers("log_only", clienttranslate($climbing_log_all), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                ));
                $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                $this->gamestate->nextState('selectOpponent');
                break;

            case $share:

                $climbing_card_info['share'] = true;
                if ($portaledge_draw) {
                    $climbing_card_info['portaledge_type'] = $portaledge_type;
                    $climbing_card_private = ['portaledge_type_arg' => $portaledge_type_arg];
                    $climbing_card_info['portaledge_id'] = $portaledge_draw['id'];
                }
                self::notifyAllPlayers("log_only", clienttranslate($climbing_log_all), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                ));
                $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                $this->setGlobalVariable('climbing_card_private', $climbing_card_private);
                $this->gamestate->nextState('selectOpponent');
                break;

            case $give_assets:

                if ($choice_args['benefit'] == 'summitBetaToken') {
                    $climbing_card_private = [
                        'summit_beta_token' => $summit_beta_token,
                        'summit_beta_for_log' => $summit_beta_for_log,
                    ];
                }

                $climbing_card_info['discard_num'] = $discard_num;
                self::notifyAllPlayers("log_only", clienttranslate($climbing_log_all), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                ));
                $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                if ($choice_args['benefit'] == 'summitBetaToken') { $this->setGlobalVariable('climbing_card_private', $climbing_card_private); }
                $this->gamestate->nextState('selectOpponent');
                break;

            case $steal_asset:

                self::notifyAllPlayers("log_only", clienttranslate($climbing_log_all), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                ));

                if ($choice_args['cost'] == 'updateWaterPsych') {
                    self::notifyAllPlayers('updateWaterPsych', '', array(
                            'player_id' => self::getActivePlayerId(),
                            'water_psych_for_climbing' => $water_psych_for_climbing,
                    ));
                }

                $climbing_card_info['types'] = $choice_args['types'];
                $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                $this->gamestate->nextState('stealFromAssetBoard');
                break;

            case $portaledge_choose:

                if ($choice_args['cost'] == 'updateWaterPsych') {
                    self::notifyAllPlayers('updateWaterPsych', '', array(
                            'player_id' => self::getActivePlayerId(),
                            'water_psych_for_climbing' => $water_psych_for_climbing,
                    ));
                }

                $climbing_card_info = array_merge($climbing_card_info, array(
                    'player_id' => intval($player_id),
                    'portaledge_num' => $portaledge_num,
                    'final_state' => 'selectPortaledge',
                ));
                self::notifyAllPlayers("log_only", clienttranslate($climbing_log_all), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                ));
                $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                
                if (array_key_exists('portaledge_all', $climbing_card_info) || array_key_exists('opponents_only', $climbing_card_info)) {
                    $this->setGlobalVariable('next_climber', $this->getPlayerAfter($player_id));
                }
                if (array_key_exists('opponents_only', $climbing_card_info)) {
                    $this->gamestate->nextState('portaledgeAll');
                } else { $this->gamestate->nextState('selectPortaledge'); }
                break;

            case $risk_die:

                $face_rolled = bga_rand(1, 3);
                self::notifyAllPlayers("rollDie", '', array(
                    'face_rolled' => $face_rolled,
                    'climbing_card_info' => $climbing_card_info,
                ));
                $climbing_card_info['face_rolled'] = $face_rolled;
                $available_assets = count($this->getHandAssets($player_id)) + count($this->getBoardAssets($player_id));
                self::notifyAllPlayers("log_only", clienttranslate($climbing_log_all), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                ));

                if ($face_rolled == 1) { // rolled checkmark

                    $climbing_card_info['portaledge_num'] = 3;
                    $climbing_card_info['final_state'] = 'selectPortaledge';
                    self::notifyAllPlayers("log_only", clienttranslate('${player_name} rolls a checkmark and will draw 3 cards from the Portaledge'), array(
                        'player_name' => self::getActivePlayerName(),
                    ));
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('selectPortaledge');
                }

                else if ($face_rolled == 2) { // rolled -2 cards

                    if ($available_assets > 1) {
                        $climbing_card_info['discard_num'] = 2;
                        $climbing_card_info['titlebar_message_opponent'] = 'get 2 of their Asset Cards';
                        $climbing_card_info['titlebar_message'] = 'get 2 of your Asset Cards';
                        $climbing_card_info['give_opponent'] = true;
                        self::notifyAllPlayers("log_only", clienttranslate('${player_name} rolls -2 Cards and will choose an opponent and give them 2 Asset Cards'), array(
                            'player_name' => self::getActivePlayerName(),
                        ));
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('selectOpponent');

                    } else if ($available_assets < 2) {
                        $lost_die_roll = $this->getGlobalVariable('lost_die_roll', true);
                        $lost_die_roll[] = $player_id;
                        $this->setGlobalVariable('lost_die_roll', $lost_die_roll);
                        self::notifyAllPlayers("log_only", clienttranslate('${player_name} rolls -2 Cards but does not have 2 cards to give. They will draw only 1 card during the next Rerack Phase'), array(
                                'player_name' => self::getActivePlayerName(),
                        ));
                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->gamestate->nextState('nextClimb');
                    }

                } else if ($face_rolled == 3) { // rolled -1 card and -1 psych

                    $player_psych = $this->getGlobalVariable('water_psych_tracker', true)[$player_id]['psych'];
                    if ($available_assets > 0 && $player_psych > 0) {
                        $climbing_card_info['discard_num'] = 1;
                        $climbing_card_info['give_psych'] = true;
                        $climbing_card_info['titlebar_message_opponent'] = 'get 1 of their Asset Cards and 1 of their Psych';
                        $climbing_card_info['titlebar_message'] = 'get 1 of your Asset Cards and 1 of your Psych';
                        $climbing_card_info['give_opponent'] = true;
                        self::notifyAllPlayers("log_only", clienttranslate('${player_name} rolls -1 Card and -1 Psych and will choose an opponent and give them 1 Asset Card and 1 Psych'), array(
                                'player_name' => self::getActivePlayerName(),
                        ));
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('selectOpponent');

                    } else if ($available_assets < 1 || $player_psych < 1) {
                        $lost_die_roll = $this->getGlobalVariable('lost_die_roll', true);
                        $lost_die_roll[] = $player_id;
                        $this->setGlobalVariable('lost_die_roll', $lost_die_roll);
                        self::notifyAllPlayers("log_only", clienttranslate('${player_name} rolls -1 Card and -1 Psych but they do not have the required resources. They will draw only 1 card during the next Rerack Phase'), array(
                                'player_name' => self::getActivePlayerName(),
                        ));
                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->gamestate->nextState('nextClimb');
                    }
                }
                break;

            case $bespoke:

                foreach(array_keys($this->getGlobalVariable('player_names_and_colors', true)) as $id) {
                    self::notifyPlayer($id, "log_only", clienttranslate($climbing_log_all), array(
                        'player_name' => self::getActivePlayerName(),
                        'climbing_card_for_log' => $climbing_card_for_log,
                        'choice_flavor' => $choice_flavor_for_log,
                        'choice_effect' => $choice_effect_for_log,
                    ));
                }

                switch ($climbing_card_info['type_arg']) {

                    case 9:
                        $this->gamestate->nextState('selectOpponent');
                        break;

                    case 19:
                        $summit_beta_tokens = $this->cards_and_tokens->getCardsOnTop(2, 'summit_beta_supply');
                        $climbing_card_info['summit_beta_tokens'] = $summit_beta_tokens;

                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('chooseSummitBetaToken');
                        break;

                    case 15:
                    case 24:
                        if ($climbing_card_info['type_arg'] == 24) { $this->updateResourceTracker($player_id, 'add', null, null, [], $symbol_type); }
                        $player_resources = $this->getGlobalVariable('resource_tracker')->$player_id;
                        $assets_for_log = [];

                        $drawn_gear_cards = [];
                        $opponents = [];
                        foreach(array_keys($this->getGlobalVariable('player_names_and_colors', true)) as $id) {
                            if ($id != self::getActivePlayerId()) {

                                $last_card = [];
                                $remaining_cards = self::getCollectionFromDB("SELECT card_id FROM cards_and_tokens WHERE card_location='portaGear'");
                                if (count($remaining_cards) ===1) { $last_card['gear'] = 1; }

                                $new_asset = $this->drawFromPortaledge($id, 'gear', 1, $remaining_cards);
                                $new_asset_id = $new_asset['id'];
                                $new_asset_type_arg = [$new_asset['type_arg']];
                                $new_asset_name = $this->asset_cards[$new_asset_type_arg[0]]['description'];
                                $this->updateResourceTracker($id, 'add', null, null, $new_asset_type_arg);                                

                                $drawn_gear_cards[$id] = array('id' => $new_asset['id'], 'type_arg' => $new_asset['type_arg']);
                                $asset_for_log = clienttranslate("[${new_asset_name}(${new_asset_type_arg[0]})]");
                                $assets_for_log[$id] = $asset_for_log;
                                $opponents[$id] = $this->getGlobalVariable('player_names_and_colors', true)[$id]['name'];
                            }
                        }

                        if ($climbing_card_info['type_arg'] == 24) {
                            foreach(array_keys($this->getGlobalVariable('player_names_and_colors', true)) as $id) {
                                if ($id != $player_id) {
                                    self::notifyPlayer($id, "confirmSymbolTokenOpponent", clienttranslate('${player_name} gains a ${symbol_for_log} Token'), array(
                                        'player_name' => self::getActivePlayerName(),
                                        'symbol_for_log' => $symbol_for_log,
                                        'player_id' => $player_id,
                                        'symbol_type' => $symbol_type,
                                        'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                                    ));
                                }
                            }

                            self::notifyPlayer($player_id, "confirmSymbolToken", clienttranslate('${player_name} gains a ${symbol_for_log} Token and all opponents draw a Gear card from the Portaledge'), array(
                                    'player_name' => self::getActivePlayerName(),
                                    'symbol_for_log' => $symbol_for_log,
                                    'symbol_type' => $symbol_type,
                                    'player_id' => $player_id,
                                    'player_resources' => $player_resources,
                                    'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                            ));
                        }

                        self::notifyPlayer($player_id, "climbingCards15And24Public", "", array());

                        foreach(array_keys($this->getGlobalVariable('player_names_and_colors', true)) as $id) {
                            if ($id != $player_id) {
                                $asset_for_log = $assets_for_log[$id];
                                
                                $other_opponents = "";
                                $other_opponents_names = [];
                                foreach($opponents as $opponent_id => $opponent_name) {
                                    if ($opponent_id != $id) { $other_opponents_names[] = $opponent_name; }
                                }
                                $other_opponent_num = count($opponents) - 1;
                                for ($i=0; $i<=$other_opponent_num-1; $i++) {
                                    $other_opponents .= '@' . $other_opponents_names[$i];
                                    if ($i < $other_opponent_num-1 && $other_opponent_num > 2) { $other_opponents .= ','; }
                                    $other_opponents .= ' ';
                                    if ($i == $other_opponent_num-2) { $other_opponents .= 'and '; }
                                }

                                $log_message = '${player_name} draws ${asset_for_log} from the Portaledge';
                                if ($other_opponent_num > 0) { $log_message .= '. ${other_opponents} also draw a Gear card from the Portaledge'; }

                                self::notifyPlayer($id, "climbingCards15And24Private", clienttranslate($log_message), array(
                                    'player_name' => $this->getGlobalVariable('player_names_and_colors', true)[$id]['name'],
                                    'asset_for_log' => $asset_for_log,
                                    'other_opponents' => clienttranslate($other_opponents),
                                    'new_asset_id' => $drawn_gear_cards[$id]['id'],
                                    'new_asset_type_arg' => $drawn_gear_cards[$id]['type_arg'],
                                ));
                            }
                        }

                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->gamestate->nextState('nextClimb');
                        break;

                    case 27:
                    case 28:
                    case 30:
                    case 40:
                        $climbing_card_info['types'] = $choice_args['types'];
                        $climbing_card_info['types_message'] = $choice_args['types_message'];
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('addAssetToAssetBoard');
                        break;

                    default:
                        $this->bespokeClimbingCard($player_id, $climbing_card_info['type_arg'], $choice);
                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->gamestate->nextState('nextClimb');
                }
                break;

            default:

                self::notifyAllPlayers("confirmClimbingChoiceOpponent", clienttranslate($climbing_log_all), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                    'player_id' => $player_id,
                    'choice_args' => $choice_args,
                    'cost' => $cost,
                    'benefit' => $benefit,
                    'water_psych_for_climbing' => $water_psych_for_climbing,
                    'player_water_psych' => $player_water_psych,
                    'portaledge_type' => $portaledge_type,
                    'hand_count' => $hand_count,
                    'gain_symbol_token' => $gain_symbol_token,
                    'gain_summit_beta_token' => $gain_summit_beta_token,
                    'last_card' => $last_card,
                    'refill_portaledge' => $refill_portaledge,
                ));
                self::notifyPlayer($player_id, "confirmClimbingChoice", '', array(
                    'player_id' => $player_id,
                    'choice_args' => $choice_args,
                    'cost' => $cost,
                    'benefit' => $benefit,
                    'water_psych_for_climbing' => $water_psych_for_climbing,
                    'portaledge_draw' => $portaledge_draw,
                    'portaledge_type_arg' => $portaledge_type_arg,
                    'player_resources' => $player_resources,
                    'hand_count' => $hand_count,
                    'gain_symbol_token' => $gain_symbol_token,
                    'gain_summit_beta_token' => $gain_summit_beta_token,
                    'last_card' => $last_card,
                    'refill_portaledge' => $refill_portaledge,
                ));
                self::notifyPlayer($player_id, "confirmClimbingChoiceLog", clienttranslate($climbing_log), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                    'portaledge_draw_for_log' => $portaledge_draw_for_log,
                    'portaledge_name' => $portaledge_name,
                    'portaledge_type_arg' => $portaledge_type_arg,
                ));

                if ($gain_summit_beta_token) {
                    self::notifyAllPlayers("confirmSummitBetaOpponent", clienttranslate('${player_name} gains a Summit Beta token'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                            'opponent_id' => false,
                    ));

                    self::notifyPlayer($player_id, "confirmSummitBeta", clienttranslate('${player_name} gains ${summit_beta_for_log}'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                            'opponent_id' => false,
                            'summit_beta_token' => $summit_beta_token,
                            'summit_beta_for_log' => $summit_beta_for_log,
                    ));
                }

                if ($gain_symbol_token) {
                    $this->updateResourceTracker($player_id, 'add', null, null, [], $symbol_type);
                    $player_resources = $this->getGlobalVariable('resource_tracker')->$player_id;

                    self::notifyAllPlayers("confirmSymbolTokenOpponent", clienttranslate('${player_name} gains a ${symbol_for_log} Token'), array(
                            'player_name' => self::getActivePlayerName(),
                            'symbol_for_log' => $symbol_for_log,
                            'player_id' => $player_id,
                            'symbol_type' => $symbol_type,
                            'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                    ));

                    self::notifyPlayer($player_id, "confirmSymbolToken", clienttranslate('${player_name} gains a ${symbol_for_log} Token'), array(
                            'player_name' => self::getActivePlayerName(),
                            'symbol_for_log' => $symbol_for_log,
                            'symbol_type' => $symbol_type,
                            'player_id' => $player_id,
                            'player_resources' => $player_resources,
                            'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                    ));
                }

                $this->cards_and_tokens->insertCardOnExtremePosition($card_id, 'climbing_discard', true);
                $this->setGlobalVariable('climbing_card_info', array());
                $this->setGlobalVariable('refill_portaledge', []);
                $this->gamestate->nextState('nextClimb');
        }
    }

    function confirmAssetsForDiscard($hand_card_ids, $board_card_ids, $tucked_card_types, $tucked_card_nums) {
        self::checkAction('confirmAssetsForDiscard');
        $player_id = self::getActivePlayerId();

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);

        $hand_card_arr = !empty($hand_card_ids) ? explode(',', $hand_card_ids) : array();
        $board_card_arr = !empty($board_card_ids) ? explode(',', $board_card_ids) : array();
        $board_assets = !empty($board_card_ids) ? $this->getGlobalVariable('board_assets', true) : array();
        $card_id_arr = array_merge($hand_card_arr, $board_card_arr);

        $hand_card_type_arr = [];
        foreach($hand_card_arr as $id) {
            $card_type = $this->getGlobalVariable('asset_identifier', true)[$id];
            array_push($hand_card_type_arr, $card_type);
        }

        $board_card_type_arr = [];
        foreach($board_card_arr as $id) {
            $card_type_arg = $this->getGlobalVariable('asset_identifier', true)[$id];
            $card_type = $this->getAssetType($card_type_arg);
            array_push($board_card_type_arr, $card_type_arg);
            foreach ($board_assets[$player_id][$card_type] as $key => $val) {
                if (gettype($val) == "array" && in_array($id, array_keys($val))) {
                    unset($board_assets[$player_id][$card_type][$key][$id]);
                    $board_assets[$player_id][$card_type]['flipped'][$key] = null;
                }
            }
            $board_assets[$player_id][$card_type]["count"]--;
        }

        $tucked_card_types_arr = !empty($tucked_card_types) ? explode(',', $tucked_card_types) : [];
        $tucked_card_nums_arr = !empty($tucked_card_types_arr) ? explode(',', $tucked_card_nums) : [];
        $tucked_card_draw = array_combine($tucked_card_types_arr, $tucked_card_nums_arr);
        $tucked_card_ids = [];
        $tucked_card_type_args = [];
        foreach($tucked_card_draw as $type => $num) {
            for ($i=1; $i<=$num; $i++) {
                $tucked_cards = $board_assets[$player_id][$type]['tucked'];
                $random_tucked_id = $array_rand($tucked_cards);
                $card_type_arg = $tucked_cards[$random_tucked_id];

                $tucked_card_ids[] = $random_tucked_id;
                $tucked_card_type_args[] = $card_type_arg;
                $card_id_arr[] = $random_tucked_id;
                unset($board_assets[$player_id][$type]['tucked'][$random_tucked_id]);
                $board_assets[$player_id][$type]['count']--;
            }
        }

        if (!empty($board_card_ids) || !empty($tucked_card_types)) {
            $this->setGlobalVariable('board_assets', $board_assets);
            $this->repositionAssetBoard($player_id);
        }
        $board_and_tucked_ids = array_merge($board_card_arr, $tucked_card_ids);
        $board_and_tucked_type_args = array_merge($board_card_type_arr, $tucked_card_type_args);

        $card_type_arr = [];
        foreach($card_id_arr as $id) {
            $card_type = $this->getGlobalVariable('asset_identifier', true)[$id];
            array_push($card_type_arr, $card_type);
        }

        $opponent_id = $climbing_card_info['give_opponent'] === true ? $climbing_card_info['opponent_id'] : null;
        $opponent_name = $climbing_card_info['opponent_name'] ?? null;
        $opponent_color = $climbing_card_info['opponent_color'] ?? null;
        $hand_card_ids_for_public = $climbing_card_info['give_opponent'] === false ? $hand_card_arr : array_map(fn($val): int => 0, $hand_card_arr);

        // log message
        $log_message_private = '';
        $log_message_public = '';

        if ($climbing_card_info['give_opponent'] === true) {
            $this->cards_and_tokens->moveCards($hand_card_arr, $opponent_id);
            $this->cards_and_tokens->moveCards($board_card_arr, $opponent_id);
            $this->cards_and_tokens->moveCards($tucked_card_ids, $opponent_id);

            $log_message_private .= 'gives ';
            $log_message_public .= 'gives ';
        }
        else {
            $this->cards_and_tokens->moveCards($hand_card_arr, 'discard');
            $this->cards_and_tokens->moveCards($board_card_arr, 'discard');
            $this->cards_and_tokens->moveCards($tucked_card_ids, 'discard');

            $log_message_private .= 'discards ';
            $log_message_public .= 'discards ';
        }

        if (count($hand_card_arr) > 0) {
            for ($i=0; $i<count($hand_card_arr); $i++) {
                $card_id = $hand_card_arr[$i];
                $card_type = $this->getGlobalVariable('asset_identifier', true)[$card_id];
                $card = $this->asset_cards[$card_type];
                $card_title = $card['description'];

                $log_message_private .= $i > 0 && $i == count($hand_card_arr)-1 ? 'and ' : '';
                $log_message_private .= "[{$card_title}({$card_type})] ";
            }
            $log_message_private .= 'from their hand';
            $log_message_public .= count($hand_card_arr) . " Asset cards from their hand";
        }
            
        if (count($board_and_tucked_ids) > 0) {
            $log_message_private .= count($hand_card_arr) > 0 ? ', and ' : '';
            $log_message_public .= count($hand_card_arr) > 0 ? ', and ' : '';

            for ($i=0; $i<count($board_and_tucked_ids); $i++) {
                $card_id = $board_and_tucked_ids[$i];
                $card_type = $this->getGlobalVariable('asset_identifier', true)[$card_id];
                $card = $this->asset_cards[$card_type];
                $card_title = $card['description'];

                $log_message_private .= $i > 0 && $i == count($board_and_tucked_ids)-1 ? 'and ' : '';
                $log_message_private .= "[{$card_title}({$card_type})] ";
                $log_message_private .= $i < count($hand_card_arr)-1 ? ', ' : ' ';
                $log_message_public .= $i > 0 && $i == count($board_and_tucked_ids)-1 ? 'and ' : '';
                $log_message_public .= "[{$card_title}({$card_type})] ";
                $log_message_public .= $i < count($hand_card_arr)-1 ? ', ' : ' ';
            }
            $log_message_private .= 'from their asset board';
            $log_message_public .= 'from their asset board';
        }

        if (array_key_exists('give_psych', $climbing_card_info)) {
            $log_message_private .= ' and 1 Psych';
            $log_message_public .= ' and 1 Psych';
        }

        $log_message_private .= $climbing_card_info['give_opponent'] === true ? " to @${climbing_card_info['opponent_name']}" : '';
        $log_message_public .= $climbing_card_info['give_opponent'] === true ? " to @${climbing_card_info['opponent_name']}" : '';

        if (count($hand_card_arr) > 0) { $this->updateResourceTracker($player_id, 'subtract', null, null, $hand_card_type_arr); }
        if (count($board_and_tucked_ids) > 0) { $this->updateResourceTracker($player_id, 'subtract', null, null, $board_and_tucked_type_args, null, true); }
        if ($climbing_card_info['give_opponent'] === true) { $this->updateResourceTracker($opponent_id, 'add', null, null, $card_type_arr); }

        $give_psych = false;
        if (array_key_exists('type_arg', $climbing_card_info) && array_key_exists('give_psych', $climbing_card_info)) {
            $opponent_id = $climbing_card_info['opponent_id'];
            $this->updateResourceTracker($player_id, 'subtract', null, 1);
            $this->updateResourceTracker($opponent_id, 'add', null, 1);
            $give_psych = true;
        }

        $player_resources = $this->getGlobalVariable('resource_tracker')->$player_id;
        $hand_count = count($this->getHandAssets($player_id));
        $opponent_resources = ($climbing_card_info['give_opponent'] === true) ? $this->getGlobalVariable('resource_tracker')->$opponent_id : null;
        $opponent_hand_count = ($climbing_card_info['give_opponent'] === true) ? count($this->getHandAssets($opponent_id)) : null;
        $player_water_psych = $this->getGlobalVariable('water_psych_tracker')->$player_id;
        $opponent_water_psych = array_key_exists('give_psych', $climbing_card_info) ? $this->getGlobalVariable('water_psych_tracker')->$opponent_id : null;
        $log_message_opponents = $climbing_card_info['give_opponent'] == true ? $log_message_public : $log_message_private;

        self::notifyAllPlayers("confirmAssetsForDiscardPublic", clienttranslate('${player_name} ${log_message_opponents}'), array(
            'player_name' => self::getActivePlayerName(),
            'log_message_opponents' => $log_message_opponents,
            'hand_card_ids_for_public' => $hand_card_ids_for_public,
            'board_card_ids' => $board_card_arr,
            'tucked_card_ids' => $tucked_card_ids,
            'climbing_card_info' => $climbing_card_info,
            'player_id' => intval($player_id),
            'opponent' => $opponent_id,
            'opponent_name' => $opponent_name,
            'opponent_color' => $opponent_color,
            'player_water_psych' => $player_water_psych,
            'player_hand_count' => $hand_count,
            'opponent_water_psych' => $opponent_water_psych,
            'opponent_hand_count' => $opponent_hand_count,
            'give_psych' => $give_psych,
        ));

        self::notifyPlayer($player_id, "confirmAssetsForDiscardPrivate", clienttranslate('${player_name} ${log_message_private}'), array(
            'player_name' => self::getActivePlayerName(),
            'log_message_private' => $log_message_private,
            'hand_card_ids' => $hand_card_arr,
            'board_card_ids' => $board_card_arr,
            'tucked_card_ids' => $tucked_card_ids,
            'climbing_card_info' => $climbing_card_info,
            'player_id' => intval($player_id),
            'opponent' => $opponent_id,
            'opponent_name' => $opponent_name,
            'opponent_color' => $opponent_color,
            'player_resources' => $player_resources,
            'player_hand_count' => $hand_count,
            'opponent_water_psych' => $opponent_water_psych,
            'opponent_hand_count' => $opponent_hand_count,
            'give_psych' => $give_psych,
        ));

        if ($climbing_card_info['give_opponent'] === true) {
            self::notifyPlayer($opponent_id, "confirmAssetsForDiscardPrivate", clienttranslate('${player_name} ${log_message_private}'), array(
                'player_name' => self::getActivePlayerName(),
                'log_message_private' => $log_message_private,
                'hand_card_ids' => $hand_card_arr,
                'board_card_ids' => $board_card_arr,
                'tucked_card_ids' => $tucked_card_ids,
                'climbing_card_info' => $climbing_card_info,
                'player_id' => intval($player_id),
                'opponent' => $opponent_id,
                'opponent_name' => $climbing_card_info['opponent_name'],
                'opponent_color' => $opponent_color,
                'opponent_water_psych' => $opponent_water_psych,
                'opponent_resources' => $opponent_resources,
                'player_hand_count' => $hand_count,
                'opponent_hand_count' => $opponent_hand_count,
                'give_psych' => $give_psych,
            ));
        }

        if (array_key_exists('type_arg', $climbing_card_info)) {
            $type_arg = $climbing_card_info['type_arg'];

            switch ($type_arg) {

                case 3:
                case 8:
                    $choice_args = $climbing_card_info['choice_args'];
                    if (array_key_exists('steal_types', $choice_args)) {
                        $climbing_card_info['types'] = $choice_args['steal_types'];
                        $climbing_card_info['to_board'] = true;
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('stealFromAssetBoard');
                    } else {
                        $climbing_card_private = $this->getGlobalVariable('climbing_card_private', true);
                        self::notifyAllPlayers("confirmSummitBetaOpponent", clienttranslate('${player_name} gains a Summit Beta token'), array(
                                'player_name' => self::getActivePlayerName(),
                                'player_id' => $player_id,
                                'opponent_id' => false,
                        ));

                        self::notifyPlayer($player_id, "confirmSummitBeta", clienttranslate('${player_name} gains ${summit_beta_for_log}'), array(
                                'player_name' => self::getActivePlayerName(),
                                'player_id' => $player_id,
                                'opponent_id' => false,
                                'summit_beta_token' => $climbing_card_private['summit_beta_token'],
                                'summit_beta_for_log' => $climbing_card_private['summit_beta_for_log'],
                        ));
                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->setGlobalVariable('climbing_card_private', array());
                        $this->gamestate->nextState('nextClimb');
                    }
                    break;

                case 12:
                    $this->gamestate->nextState('chooseTechniqueToken');
                    break;

                case 23:
                case 26:
                    $climbing_card_info['types'] = $this->climbing_cards[$type_arg]['b_args']['types'];
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('stealFromAssetBoard');
                    break;

                case 13:
                case 14:
                case 21:
                case 27:
                case 28:
                    $choice_args = $climbing_card_info['choice_args'];
                    $symbol_type = $choice_args['symbol_type'];
                    $symbol_for_log = $choice_args['symbol_for_log'];
                    $this->updateResourceTracker($player_id, 'add', null, null, [], $symbol_type);
                    $player_resources = $this->getGlobalVariable('resource_tracker')->$player_id;

                    self::notifyAllPlayers("confirmSymbolTokenOpponent", clienttranslate('${player_name} gains a ${symbol_for_log} Token'), array(
                            'player_name' => self::getActivePlayerName(),
                            'symbol_for_log' => $symbol_for_log,
                            'player_id' => $player_id,
                            'symbol_type' => $symbol_type,
                            'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                    ));

                    self::notifyPlayer($player_id, "confirmSymbolToken", clienttranslate('${player_name} gains a ${symbol_for_log} Token'), array(
                            'player_name' => self::getActivePlayerName(),
                            'symbol_for_log' => $symbol_for_log,
                            'symbol_type' => $symbol_type,
                            'player_id' => $player_id,
                            'player_resources' => $player_resources,
                            'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                    ));

                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
                    break;

                case 25:
                case 32:
                case 45:
                    $climbing_card_private = $this->getGlobalVariable('climbing_card_private', true);
                    self::notifyAllPlayers("confirmSummitBetaOpponent", clienttranslate('${player_name} gains a Summit Beta token'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                            'opponent_id' => false,
                    ));

                    self::notifyPlayer($player_id, "confirmSummitBeta", clienttranslate('${player_name} gains ${summit_beta_for_log}'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                            'opponent_id' => false,
                            'summit_beta_token' => $climbing_card_private['summit_beta_token'],
                            'summit_beta_for_log' => $climbing_card_private['summit_beta_for_log'],
                    ));

                    $this->cards_and_tokens->insertCardOnExtremePosition($card_id, 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
                    break;

                case 7:
                case 31:
                case 46:
                case 48:
                    switch ($climbing_card_info['type_arg']) {
                        case 7:
                            $portaledge_deck = 'portaSlab';
                            $portaledge_type = 'slab';
                            break;
                        case 31:
                        case 46:
                            $portaledge_deck = 'portaGear';
                            $portaledge_type = 'gear';
                            break;
                        case 48:
                            $portaledge_deck = 'portaFace';
                            $portaledge_type = 'face';
                            break;
                    }

                    $last_card = [];
                    $remaining_cards = self::getCollectionFromDB("SELECT card_id FROM cards_and_tokens WHERE card_location='$portaledge_deck'");
                    if (count($remaining_cards) ===1) { $last_card[$portaledge_type] = 1; }

                    $portaledge_draw = $this->drawFromPortaledge($player_id, $portaledge_type, 1, $remaining_cards);
                    $refill_portaledge = $this->getGlobalVariable('refill_portaledge', true);

                    $portaledge_type_arg = [$portaledge_draw['type_arg']];
                    $portaledge_name = $this->asset_cards[$portaledge_type_arg[0]]['description'];
                    $portaledge_draw_for_log = clienttranslate("[${portaledge_name}(${portaledge_type_arg[0]})]");
                    $portaledge_type_for_log = ucfirst($portaledge_type);


                    $auto_portaledge = $portaledge_type_arg ?? [];
                    $this->updateResourceTracker($player_id, 'add', null, null, $auto_portaledge);
                    $player_resources = $this->getGlobalVariable('resource_tracker')->$player_id;
                    $hand_count = count($this->getHandAssets($player_id));

                    self::notifyAllPlayers("automaticPortaledgeOpponent", clienttranslate('${player_name} draws a ${portaledge_type_for_log} card from the Portaledge'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                            'portaledge_type_for_log' => $portaledge_type_for_log,
                            'portaledge_type' => $portaledge_type,
                            'hand_count' => $hand_count,
                            'last_card' => $last_card,
                            'refill_portaledge' => $refill_portaledge,
                    ));
                    self::notifyPlayer($player_id, "automaticPortaledge", clienttranslate('${player_name} draws ${portaledge_draw_for_log} from the Portaledge'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                            'portaledge_draw' => $portaledge_draw,
                            'portaledge_draw_for_log' => $portaledge_draw_for_log,
                            'portaledge_type_arg' => $portaledge_type_arg,
                            'player_resources' => $player_resources,
                            'hand_count' => $hand_count,
                            'last_card' => $last_card,
                            'refill_portaledge' => $refill_portaledge,
                    ));
                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->setGlobalVariable('refill_portaledge', []);
                    $this->gamestate->nextState('nextClimb');
                    break;

                case 57: 
                    if ($climbing_card_info['discard_type'] === 'any_skill') {
                        $portaledge_deck = 'portaGear';
                        $portaledge_type = 'gear';

                        $last_card = [];
                        $remaining_cards = self::getCollectionFromDB("SELECT card_id FROM cards_and_tokens WHERE card_location='$portaledge_deck'");
                        if (count($remaining_cards) ===1) { $last_card[$portaledge_type] = 1; }

                        $portaledge_draw = $this->drawFromPortaledge($player_id, $portaledge_type, 1, $remaining_cards);
                        $refill_portaledge = $this->getGlobalVariable('refill_portaledge', true);

                        $portaledge_type_arg = [$portaledge_draw['type_arg']];
                        $portaledge_name = $this->asset_cards[$portaledge_type_arg[0]]['description'];
                        $portaledge_draw_for_log = clienttranslate("[${portaledge_name}(${portaledge_type_arg[0]})]");
                        $portaledge_type = 'gear';

                        $auto_portaledge = $portaledge_type_arg ?? [];
                        $this->updateResourceTracker($player_id, 'add', null, null, $auto_portaledge);
                        $player_resources = $this->getGlobalVariable('resource_tracker')->$player_id;
                        $hand_count = count($this->getHandAssets($player_id));

                        self::notifyAllPlayers("automaticPortaledgeOpponent", clienttranslate('${player_name} draws a Gear card from the Portaledge'), array(
                                'player_name' => self::getActivePlayerName(),
                                'player_id' => $player_id,
                                'portaledge_type' => $portaledge_type,
                                'hand_count' => $hand_count,
                                'last_card' => $last_card,
                                'refill_portaledge' => $refill_portaledge,
                        ));
                        self::notifyPlayer($player_id, "automaticPortaledge", clienttranslate('${player_name} draws ${portaledge_draw_for_log} from the Portaledge'), array(
                                'player_name' => self::getActivePlayerName(),
                                'player_id' => $player_id,
                                'portaledge_draw' => $portaledge_draw,
                                'portaledge_draw_for_log' => $portaledge_draw_for_log,
                                'portaledge_type_arg' => $portaledge_type_arg,
                                'player_resources' => $player_resources,
                                'hand_count' => $hand_count,
                                'last_card' => $last_card,
                                'refill_portaledge' => $refill_portaledge,
                        ));
                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->setGlobalVariable('refill_portaledge', []);
                        $this->gamestate->nextState('nextClimb');
                    }

                    else if ($climbing_card_info['spread_draw'] === true) {
                         $this->gamestate->nextState("drawAssets");
                    }
                    break;

                case 16:
                case 22:
                case 35:
                case 43:
                case 62:
                case 64:
                    if ($climbing_card_info['discard_num'] === 1 && array_key_exists('opponent_id', $climbing_card_info)) {
                        $this->updateResourceTracker($player_id, 'subtract', null, 1);
                        $this->updateResourceTracker($opponent_id, 'add', null, 1);
                    }
                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
                    break;
                case 53:
                case 68:
                    $climbing_card_info['portaledge_num'] = $climbing_card_info['type_arg'] == '53' ? 1 : 2;
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('selectPortaledge');
                    break;
                default:
                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
            }
        }
    }

    function confirmSelectedOpponent($opponent_id) {
        self::checkAction('confirmSelectedOpponent');
        $player_id = self::getActivePlayerId();
        $names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        if ($climbing_card_info['type_arg']) {
            switch ($climbing_card_info['type_arg']) {

                case 9:
                    $climbing_card_info['finished_token_choice'] = [];
                    $climbing_card_info['opponent_id'] = $opponent_id;
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('chooseTechniqueToken');
                    break;

                case 31:
                    $climbing_card_info['discard_num'] = 1;
                    $climbing_card_info['discard_type'] = 'gear';
                    $climbing_card_info['draw_num'] = 1;
                    $climbing_card_info['opponent_name'] = $names_and_colors[$opponent_id]['name'];
                    $climbing_card_info['opponent_id'] = $opponent_id;
                    $climbing_card_info['opponent_color'] = $names_and_colors[$opponent_id]['color'];
                    $climbing_card_info['final_state'] = 'selectPortaledge';
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('discardAssets');
                    break;

                case 25:
                case 45:
                    $climbing_card_info['discard_num'] = 2;
                    $climbing_card_info['discard_type'] = null;
                    $climbing_card_info['opponent_name'] = $names_and_colors[$opponent_id]['name'];
                    $climbing_card_info['opponent_id'] = $opponent_id;
                    $climbing_card_info['opponent_color'] = $names_and_colors[$opponent_id]['color'];
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('discardAssets');
                    break;

                case 49:
                    $climbing_card_info['opponent_name'] = $names_and_colors[$opponent_id]['name'];
                    $climbing_card_info['opponent_id'] = $opponent_id;
                    $climbing_card_info['opponent_color'] = $names_and_colors[$opponent_id]['color'];

                    $portaledge_type = $climbing_card_info['portaledge_type'];
                    $portaledge_deck = 'porta' . $portaledge_type;
                    $deck_loc = 'porta' . ucfirst($portaledge_type);
                    $climbing_card_private = $this->getGlobalVariable('climbing_card_private', true);
                    $portaledge_type_arg = $climbing_card_private['portaledge_type_arg'];
                    $portaledge_id = $climbing_card_info['portaledge_id'];
                    $portaledge_name = $this->asset_cards[$portaledge_type_arg[0]]['description'];
                    $card_for_log_player = clienttranslate("[${portaledge_name}(${portaledge_type_arg[0]})]");
                    $hand_count = count($this->getHandAssets($player_id));
                    $this->updateResourceTracker($player_id, 'add', null, -1, $portaledge_type_arg);

                    $last_card = [];
                    $remaining_cards = self::getCollectionFromDB("SELECT card_id FROM cards_and_tokens WHERE card_location='$deck_loc'");
                    if (count($remaining_cards) ===1) { $last_card[$type] = 1; }

                    $portaledge_draw_opponent = $this->drawFromPortaledge($opponent_id, $portaledge_type, 1, $remaining_cards);
                    $refill_portaledge = $this->getGlobalVariable('refill_portaledge', true);

                    $portaledge_type_arg_opponent = [$portaledge_draw_opponent['type_arg']];
                    $portaledge_id_opponent = $portaledge_draw_opponent['id'];
                    $portaledge_name_opponent = $this->asset_cards[$portaledge_type_arg_opponent[0]]['description'];
                    $card_for_log_opponent = clienttranslate("[${portaledge_name_opponent}(${portaledge_type_arg_opponent[0]})]");
                    $hand_count_opponent = count($this->getHandAssets($opponent_id));

                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->updateResourceTracker($opponent_id, 'add', null, -1, $portaledge_type_arg_opponent);

                    self::notifyAllPlayers("shareEffectPublic", clienttranslate('${player_name} and ${player_name1} lose a Psych and gain a Gear Card'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_name1' => $climbing_card_info['opponent_name'],
                            'player_id' => $player_id,
                            'opponent_id' => $opponent_id,
                            'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                            'hand_count_player' => $hand_count,
                            'hand_count_opponent' => $hand_count_opponent,
                            'climbing_card_info' => $climbing_card_info,
                            'last_card' => $last_card,
                            'refill_portaledge' => $refill_portaledge,
                    ));

                    self::notifyPlayer($player_id, "shareEffectPrivate", clienttranslate('${player_name} and ${player_name1} lose a Psych and gain a Gear Card. ${player_name} draws ${card_for_log_player}'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_name1' => $climbing_card_info['opponent_name'],
                            'card_for_log_player' => $card_for_log_player,
                            'player_id' => $player_id,
                            'opponent_id' => $opponent_id,
                            'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                            'hand_count_player' => $hand_count,
                            'hand_count_opponent' => $hand_count_opponent,
                            'portaledge_type_arg' => $portaledge_type_arg,
                            'portaledge_id' => $portaledge_id,
                            'climbing_card_info' => $climbing_card_info,
                            'last_card' => $last_card,
                            'refill_portaledge' => $refill_portaledge,
                    ));

                    self::notifyPlayer($opponent_id, "shareEffectPrivate", clienttranslate('${player_name} and ${player_name1} lose a Psych and gain a Gear Card. ${player_name1} draws ${card_for_log_opponent}'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_name1' => $climbing_card_info['opponent_name'],
                            'card_for_log_opponent' => $card_for_log_opponent,
                            'player_id' => $player_id,
                            'opponent_id' => $opponent_id,
                            'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                            'hand_count_player' => $hand_count,
                            'hand_count_opponent' => $hand_count_opponent,
                            'portaledge_type_arg' => $portaledge_type_arg_opponent,
                            'portaledge_id' => $portaledge_id_opponent,
                            'climbing_card_info' => $climbing_card_info,
                            'last_card' => $last_card,
                            'refill_portaledge' => $refill_portaledge,
                    ));
                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->setGlobalVariable('climbing_card_private', array());
                    $this->setGlobalVariable('refill_portaledge', []);
                    $this->gamestate->nextState('nextClimb');
                    break;

                case 16:
                case 22:
                case 35:
                case 43:
                case 51:
                case 58:
                case 62:
                case 64:
                    $climbing_card_info['discard_type'] = null;
                    $climbing_card_info['opponent_name'] = $names_and_colors[$opponent_id]['name'];
                    $climbing_card_info['opponent_id'] = $opponent_id;
                    $climbing_card_info['opponent_color'] = $names_and_colors[$opponent_id]['color'];
                    $climbing_card_info['final_state'] = 'discardAssets';
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('discardAssets');
                    break;

                case 65:
                    $climbing_card_info['discard_num'] = 1;
                    $climbing_card_info['discard_type'] = null;
                    $climbing_card_info['opponent_name'] = $names_and_colors[$opponent_id]['name'];
                    $climbing_card_info['opponent_id'] = $opponent_id;
                    $climbing_card_info['opponent_color'] = $names_and_colors[$opponent_id]['color'];
                    $climbing_card_info['final_state'] = 'discardAssets';
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('discardAssets');
                    break;

                case 53:
                case 68:

                    $climbing_card_info['discard_num'] = 2;
                    $climbing_card_info['discard_type'] = null;
                    $climbing_card_info['draw_num'] = $climbing_card_info['type_arg'] == 53 ? 1 : 2;
                    $climbing_card_info['opponent_name'] = $names_and_colors[$opponent_id]['name'];
                    $climbing_card_info['opponent_id'] = $opponent_id;
                    $climbing_card_info['opponent_color'] = $names_and_colors[$opponent_id]['color'];
                    $climbing_card_info['final_state'] = 'selectPortaledge';
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('discardAssets');
                    break;

                case 69:
                    $summit_beta_token = $this->cards_and_tokens->pickCardForLocation('summit_beta_supply', $opponent_id);
                    $opponent_name = $this->getGlobalVariable('player_names_and_colors', true)[$opponent_id]['name'];
                    $summit_beta_type_arg = $summit_beta_token['type_arg'];
                    $summit_beta_name = $this->summit_beta_tokens[$summit_beta_type_arg]['description'];
                    $summit_beta_for_log = '+' . $summit_beta_name . '(' . $summit_beta_type_arg . ')+';

                    self::notifyAllPlayers("confirmSummitBetaOpponent", clienttranslate('${player_name} chooses ${player_name1} to gain a Summit Beta token'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_name1' => $opponent_name,
                            'player_id' => $player_id,
                            'opponent_id' => $opponent_id,
                    ));

                    self::notifyPlayer($opponent_id, "confirmSummitBeta", clienttranslate('${player_name} chooses ${player_name1} to gain ${summit_beta_for_log}'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_name1' => $opponent_name,
                            'player_id' => $player_id,
                            'opponent_id' => $opponent_id,
                            'summit_beta_token' => $summit_beta_token,
                            'summit_beta_for_log' => $summit_beta_for_log,
                    ));

                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
                    break;
            }
        }
    }

    function confirmPortaledge($portaledge_to_draw) {
        self::checkAction('confirmPortaledge');
        $player_id = self::getActivePlayerId();

        $total_draw = array_sum($portaledge_to_draw);
        $draw_types = 0;
        for ($i=0; $i<=count($portaledge_to_draw)-1; $i++) {
            if ($portaledge_to_draw[$i] > 0 && $i <= 3) { $draw_types++; }
        }

        $cards_for_log_public = '';
        $cards_for_log_private = '';

        $type_arg_arr = [];
        $id_arr = [];
        $new_asset_types = array( 'gear' => 0, 'face' => 0, 'crack' => 0, 'slab' => 0, );

        $last_card = [];
        $card_idx = 1;

        for ($i=0; $i<=count($portaledge_to_draw)-1; $i++) {
            $type_to_draw = '';
            switch (true) {
                case ($i === 0): if ($portaledge_to_draw[$i] > 0) { $type_to_draw = 'Gear'; break; } else { continue 2; }
                case ($i === 1): if ($portaledge_to_draw[$i] > 0) { $type_to_draw = 'Face'; break; } else { continue 2; }
                case ($i === 2): if ($portaledge_to_draw[$i] > 0) { $type_to_draw = 'Crack'; break; } else { continue 2; }
                case ($i === 3): if ($portaledge_to_draw[$i] > 0) { $type_to_draw = 'Slab'; break; } else { continue 2; }
            }

            if ($type_to_draw != '') {

                $type = strtolower($type_to_draw);
                $draw_num = $portaledge_to_draw[$i];
                $new_asset_types[strtolower($type_to_draw)] = intval($draw_num);
                $deck_location = 'porta' . $type_to_draw;
                for ($j=1; $j<=$draw_num; $j++) {

                    $remaining_cards = self::getCollectionFromDB("SELECT card_id FROM cards_and_tokens WHERE card_location='$deck_location'");
                    if (count($remaining_cards) === 1) { $last_card[$type] = $card_idx; }

                    $new_asset = $this->drawFromPortaledge($player_id, $type, $card_idx, $remaining_cards);
                    $card_idx ++;
                    $type_arg = $new_asset['type_arg'];
                    $type_arg_arr[] = $type_arg;
                    $id = $new_asset['id'];
                    $id_arr[] = $id;
                    $name = $this->asset_cards[$type_arg]['description'];
                    $name_for_log = "[{$name}({$type_arg})]";
                    $cards_for_log_private .= $name_for_log . ', ';
                }
                $cards_for_log_public .= $draw_num . ' ' . $type_to_draw . ', ';
            }
        }

        $cards_for_log_private = substr($cards_for_log_private, 0, -2) ?: '';
        if ($total_draw > 1 && $draw_types > 0) {
            $last_left_bracket_private = strrpos($cards_for_log_private, "[");
            $cards_for_log_private = substr_replace($cards_for_log_private, " and ", $last_left_bracket_private, 0);
            if ($total_draw === 2) { $cards_for_log_private = str_replace(',', '', $cards_for_log_private); }
            $cards_for_log_private .= ' from The Portaledge';
        }

        $cards_for_log_public = substr($cards_for_log_public, 0, -2) ?: '';
        if ($draw_types > 1) {
            $last_space_public = strrpos($cards_for_log_public, " ");
            $penultimate_space_public = strrpos($cards_for_log_public, " ", $last_space_public - strlen($cards_for_log_public) -1 );
            $cards_for_log_public = substr_replace($cards_for_log_public, " and ", $penultimate_space_public, 0);
            if ($total_draw === 2) { $cards_for_log_public = str_replace(',', '', $cards_for_log_public); }
            $cards_for_log_public .= ' card(s) from The Portaledge';
        }

        // check for water and psych if resting
        $water = count($portaledge_to_draw) === 6 ? $portaledge_to_draw[4] : 0;
        $psych = count($portaledge_to_draw) === 6 ? $portaledge_to_draw[5] : 0;

        $resting_water_psych = '';
        if ($water > 0 && $draw_types === 0) { $resting_water_psych = $water . ' Water'; }
        else if ($water > 0) { $resting_water_psych = ', and ' . $water . ' Water'; }
        if ($water > 0 && $psych > 0) { $resting_water_psych .= ' and ' . $psych . ' Psych'; }
        else if ($psych > 0 && $draw_types === 0) { $resting_water_psych = $psych . ' Psych'; }
        else if ($psych > 0) { $resting_water_psych = ', and ' . $psych . ' Psych'; }

        $state_name = $this->gamestate->state()['name'];
        if ($state_name === 'selectPortaledge') { $operation = 'draws'; }
        else if ($state_name === 'resting') { $operation = 'rests, gaining'; }

        $this->updateResourceTracker($player_id, 'add', $water, $psych, $type_arg_arr);
        $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];
        $player_water_psych = $this->getGlobalVariable('water_psych_tracker')->$player_id;
        $hand_count = count($this->getHandAssets($player_id));
        $refill_portaledge = $this->getGlobalVariable('refill_portaledge', true);

        self::notifyAllPlayers("confirmPortaledgeOpponent", clienttranslate('${player_name} ${operation} ${cards_for_log_public}${resting_water_psych}'), array(
            'player_name' => self::getActivePlayerName(),
            'operation' => $operation,
            'cards_for_log_public' => $cards_for_log_public,
            'resting_water_psych' => $resting_water_psych,
            'climbing_card_info' => $this->getGlobalVariable('climbing_card_info', true),
            'player_id' => $player_id,
            'asset_types' => $new_asset_types,
            'player_water_psych' => $player_water_psych,
            'water' => $water,
            'psych' => $psych,
            'hand_count' => $hand_count,
            'last_card' => $last_card,
            'refill_portaledge' => $refill_portaledge,
        ));

        self::notifyPlayer($player_id, "confirmPortaledge", clienttranslate('${player_name} ${operation} ${cards_for_log_private}${resting_water_psych}'), array(
            'player_name' => self::getActivePlayerName(),
            'operation' => $operation,
            'cards_for_log_private' => $cards_for_log_private,
            'resting_water_psych' => $resting_water_psych,
            'climbing_card_info' => $this->getGlobalVariable('climbing_card_info', true),
            'player_id' => $player_id,
            'new_asset_ids' => $id_arr,
            'new_asset_type_args' => $type_arg_arr,
            'player_resources' => $player_resources,
            'water' => $water,
            'psych' => $psych,
            'hand_count' => $hand_count,
            'last_card' => $last_card,
            'refill_portaledge' => $refill_portaledge,
        ));

        $this->setGlobalVariable('refill_portaledge', []);

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);

        if ($climbing_card_info != []) {

            if (isset($climbing_card_info['portaledge_all'])) {

                if (count($climbing_card_info['finished_portaledge'])+1 < $this->getPlayersNumber()) {

                    $climbing_card_info['finished_portaledge'][] = $player_id;
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('portaledgeAll');

                } else if (count($climbing_card_info['finished_portaledge'])+1 == $this->getPlayersNumber()) {

                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('finished_portaledge', []);
                    $this->setGlobalVariable('climbing_card_info', []);
                    $this->gamestate->nextState('nextClimb');
                }

            } else {

                $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                $this->setGlobalVariable('climbing_card_info', []);
                $this->gamestate->nextState('nextClimb');
            }

        } else if ($this->gamestate->state()['name'] === 'resting') { $this->gamestate->nextState('nextDraw'); }
    }

    function confirmAddTokenToPitch($asset_token_type, $pitch_type_arg, $selected_pitch_id) {
        self::checkAction('confirmAddTokenToPitch');
        $this->pitches[$pitch_type_arg]['requirements'][$asset_token_type]++;
        $pitch_name = $this->pitches[$pitch_type_arg]['description'];
        $pitch_for_log = '{' . $pitch_name . '(' . $pitch_type_arg . ')}';

        $pitch_asset_tokens = $this->getGlobalVariable('pitch_asset_tokens', true);
        if (array_key_exists($pitch_type_arg, $pitch_asset_tokens)) { $pitch_asset_tokens[$pitch_type_arg][] = $asset_token_type; }
        $pitch_asset_tokens += [$pitch_type_arg => [$asset_token_type]];
        $this->setGlobalVariable('pitch_asset_tokens', $pitch_asset_tokens);

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);

        self::notifyAllPlayers("confirmAddTokenToPitch", clienttranslate('${player_name} adds a ${asset_type} Token to ${pitch_for_log}'), array(
            'player_id' => self::getActivePlayerId(),
            'player_name' => self::getActivePlayerName(),
            'asset_type' => ucfirst($asset_token_type),
            'pitch_for_log' => $pitch_for_log,
            'pitch_type_arg' => $pitch_type_arg,
            'selected_pitch_id' => $selected_pitch_id,
            'pitch_requirements' => $this->pitches[$pitch_type_arg]['requirements'],
        ));

        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
        $this->setGlobalVariable('climbing_card_info', array());
        $this->gamestate->nextState('nextClimb');
    }

    function confirmAssetToAssetBoard($selected_resource) {
        self::checkAction('confirmAssetToAssetBoard');
        $player_id = self::getActivePlayerId();
        $card_type_arg = $this->getGlobalVariable('asset_identifier', true)[$selected_resource];
        $resource_type = $this->asset_cards[$card_type_arg]['skills'];
        $asset_title = $this->asset_cards[$card_type_arg]['description'];
        $this->updateResourceTracker($player_id, 'subtract', null, null, [$card_type_arg], null, false, true);
        $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];
        foreach ($resource_type as $key=>$value) {
            if ($value) { $type = $key; }
        }

        $board_assets = $this->getGlobalVariable('board_assets', true);
        $asset_count = $board_assets[$player_id][$type]["count"];

        if ($asset_count >= 4) {
            $vacated_card = $board_assets[$player_id][$type][4];
            $board_assets[$player_id][$type]['tucked'][array_keys($vacated_card)[0]] = array_values($vacated_card)[0];
            $board_assets[$player_id][$type][4] = [$selected_resource => $card_type_arg];
            $board_assets[$player_id][$type]['flipped'][4] = false;
        }
        else if ($asset_count < 4) {
            $board_assets[$player_id][$type][$asset_count+1][$selected_resource] = $card_type_arg;
            $board_assets[$player_id][$type]["flipped"][$asset_count+1] = false;
        }
        $board_assets[$player_id][$type]["count"]++;
        $this->setGlobalVariable('board_assets', $board_assets);

        $this->cards_and_tokens->insertCardOnExtremePosition($selected_resource, "{$player_id}_played_{$type}", true);
        $hand_count = count($this->getHandAssets($player_id));

        $resource_for_log = "[{$asset_title}({$card_type_arg})]";

        self::notifyAllPlayers("confirmAssetToAssetBoardOpponent", clienttranslate('${player_name} places ${resource_for_log} from their hand onto their Asset Board'), array(
            'player_name' => self::getActivePlayerName(),
            'resource_for_log' => $resource_for_log,
            'player_id' => $player_id,
            'card_id' => $selected_resource,
            'card_type_arg' => $card_type_arg,
            'card_type' => $type,
            'hand_count' => $hand_count,
        ));

        self::notifyPlayer($player_id, "confirmAssetToAssetBoard", clienttranslate('${player_name} places ${resource_for_log} from their hand onto their Asset Board'), array(
            'player_name' => self::getActivePlayerName(),
            'resource_for_log' => $resource_for_log,
            'player_id' => $player_id,
            'card_id' => $selected_resource,
            'card_type_arg' => $card_type_arg,
            'card_type' => $type,
            'player_resources' => $player_resources,
            'hand_count' => $hand_count,
        ));

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
        $this->setGlobalVariable('climbing_card_info', array());
        $this->gamestate->nextState('nextClimb');
    }

    function confirmStealFromAssetBoard($selected_resource, $tucked_card_type, $opponent_id) {
        self::checkAction('confirmStealFromAssetBoard');
        $player_id = self::getActivePlayerId();
        $board_assets = $this->getGlobalVariable('board_assets', true);

        if ($selected_resource) {
            $card_type_arg = $this->getGlobalVariable('asset_identifier', true)[$selected_resource];
            $type = $this->getAssetType($card_type_arg);
            $random_tucked_id = '';
            $this->cards_and_tokens->moveCard($selected_resource, $player_id);
        }
        else if ($tucked_card_type) {
            $tucked_cards = $board_assets[$player_id][$tucked_card_type]['tucked'];
            $random_tucked_id = array_rand($tucked_cards);
            $card_type_arg = $tucked_cards[$random_tucked_id];
            $type = $this->getAssetType($card_type_arg);

            unset($board_assets[$player_id][$type]['tucked'][$random_tucked_id]);
            $board_assets[$player_id][$type]['count']--;
            $this->cards_and_tokens->moveCard($random_tucked_id, $player_id);
        }
    
        $asset_title = $this->asset_cards[$card_type_arg]['description'];
        $card_for_log = "[{$asset_title}({$card_type_arg})]";
        $names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);
        $opponent_name = $names_and_colors[$opponent_id]['name'];
        $opponent_color = $names_and_colors[$opponent_id]['color'];

        $card_id = $selected_resource ?? $random_tucked_id;

        foreach ($board_assets[$opponent_id][$type] as $key => $val) {
            if (gettype($val) == "array" && in_array($card_id, array_keys($val))) {
                unset($board_assets[$opponent_id][$type][$key][$selected_resource]);
                if ($card_id == $selected_resource) { $board_assets[$opponent_id][$type]['flipped'][$key] = null; }
            }
        }
        $board_assets[$opponent_id][$type]["count"]--;

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $to_board = (array_key_exists('to_board', $climbing_card_info)) ? true : false;

        if ($to_board) {
            $asset_count = $board_assets[$player_id][$type]["count"];
            if ($asset_count >= 4) {
                $vacated_card = $board_assets[$player_id][$type][4];
                $board_assets[$player_id][$type]["tucked"][array_keys($vacated_card)[0]] = array_values($vacated_card)[0];
                $board_assets[$player_id][$type][4] = [$selected_resource => $card_type_arg];
                $board_assets[$player_id][$type]['flipped'][4] = false;
            }
            else if ($asset_count < 4) {
                $board_assets[$player_id][$type][$asset_count+1][$selected_resource] = $card_type_arg;
                $board_assets[$player_id][$type]['flipped'][$asset_count+1] = false;
            }
            $board_assets[$player_id][$type]["count"]++;
        }
        $this->setGlobalVariable('board_assets', $board_assets);
        $this->repositionAssetBoard($opponent_id);
        $hand_count = count($this->getHandAssets($player_id));

        if ($selected_resource) { $this->updateResourceTracker($opponent_id, 'subtract', null, null, [$card_type_arg], null, true); }
        $this->updateResourceTracker($player_id, 'add', null, null, [$card_type_arg]);
        $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];

        $to_board_for_log = $to_board ? ' and adds it to their Asset Board' : '';

        self::notifyAllPlayers('confirmStealFromAssetBoardOpponent', clienttranslate('${player_name} steals ${card_for_log} from ${player_name1}\'s Asset Board${to_board_for_log}'), array(
            'player_name' => self::getActivePlayerName(),
            'card_for_log' => $card_for_log,
            'to_board_for_log' => $to_board_for_log,
            'to_board' => $to_board,
            'player_name1' => $opponent_name,
            'player_id' => $player_id,
            'opponent_id' => $opponent_id,
            'opponent_color' => $opponent_color,
            'selected_resource' => $selected_resource,
            'random_tucked_id' => $random_tucked_id,
            'hand_count' => $hand_count,
        ));

        self::notifyPlayer($player_id, 'confirmStealFromAssetBoard', clienttranslate('${player_name} steals ${card_for_log} from ${player_name1}\'s Asset Board${to_board_for_log}'), array(
            'player_name' => self::getActivePlayerName(),
            'card_for_log' => $card_for_log,
            'to_board_for_log' => $to_board_for_log,
            'to_board' => $to_board,
            'player_name1' => $opponent_name,
            'player_id' => $player_id,
            'opponent_id' => $opponent_id,
            'opponent_color' => $opponent_color,
            'selected_resource' => $selected_resource,
            'random_tucked_id' => $random_tucked_id,
            'hand_count' => $hand_count,
            'player_resources' => $player_resources,
        ));

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
        $this->setGlobalVariable('climbing_card_info', array());
        $this->gamestate->nextState('nextClimb');
    }

    function confirmChooseSummitBetaToken($selected_token_id, $opponent_token_id, $opponent_id) {
        self::checkAction('confirmChooseSummitBetaToken');

        $this->cards_and_tokens->moveCard($selected_token_id, self::getActivePlayerId());
        $this->cards_and_tokens->moveCard($opponent_token_id, $opponent_id);

        $player_token_type_arg = $this->getGlobalVariable('token_identifier', true)[$selected_token_id];
        $player_token_name = $this->summit_beta_tokens[$player_token_type_arg]['description'];
        $player_token_for_log = '+' . $player_token_name . '(' . $player_token_type_arg . ')+';

        $player_name1 = $this->getGlobalVariable('player_names_and_colors', true)[$opponent_id]['name'];
        $opponent_token_type_arg = $this->getGlobalVariable('token_identifier', true)[$opponent_token_id];
        $opponent_token_name = $this->summit_beta_tokens[$opponent_token_type_arg]['description'];
        $opponent_token_for_log = '+' . $opponent_token_name . '(' . $opponent_token_type_arg . ')+';

        self::notifyAllPlayers("confirmChooseSummitBetaToken", clienttranslate('${player_name} kept ${player_token_for_log} and gave ${opponent_token_for_log} to ${player_name1}'), array(
            'player_name' => self::getActivePlayerName(),
            'player_name1' => $player_name1,
            'player_token_for_log' => $player_token_for_log,
            'opponent_token_for_log' => $opponent_token_for_log,
            'selected_token_id' => $selected_token_id,
            'opponent_token_id' => $opponent_token_id,
            'player_id' => self::getActivePlayerId(),
            'opponent_id' => $opponent_id,
        ));

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
        $this->setGlobalVariable('climbing_card_info', array());
        $this->gamestate->nextState('nextClimb');
    }

    function confirmChooseTechniqueToken($technique_token_type) {
        self::checkAction('confirmChooseTechniqueToken');

        $player_id = self::getActivePlayerId();
        $symbol_for_log = $technique_token_type == 'pain_tolerance' ? 'Pain Tolerance' : ucfirst($technique_token_type);
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $climbing_card_type_arg = $climbing_card_info['type_arg'];
        $this->updateResourceTracker($player_id, 'add', null, null, [], $technique_token_type);
        $player_resources = $this->getGlobalVariable('resource_tracker')->$player_id;

        self::notifyAllPlayers("confirmSymbolTokenOpponent", clienttranslate('${player_name} gains a ${symbol_for_log} Token'), array(
                'player_name' => self::getActivePlayerName(),
                'symbol_for_log' => $symbol_for_log,
                'player_id' => $player_id,
                'symbol_type' => $technique_token_type,
                'climbing_card_type_arg' => $climbing_card_info['type_arg'],
        ));

        self::notifyPlayer($player_id, "confirmSymbolToken", clienttranslate('${player_name} gains a ${symbol_for_log} Token'), array(
                'player_name' => self::getActivePlayerName(),
                'symbol_for_log' => $symbol_for_log,
                'symbol_type' => $technique_token_type,
                'player_id' => $player_id,
                'player_resources' => $player_resources,
                'climbing_card_type_arg' => $climbing_card_info['type_arg'],
        ));

        if ($climbing_card_type_arg == 12) {

            $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
            $this->setGlobalVariable('climbing_card_info', array());
            $this->gamestate->nextState('nextClimb');

        } else if ($climbing_card_type_arg == 9) {
            $this->gamestate->nextState('techniqueOpponent');
        }
    }

    function passClimbingCard($player_id) {
        self::checkAction('passClimbingCard');

        $passed_climbing_card = $this->getGlobalVariable('passed_climbing_card', true);
        $passed_climbing_card[] = $player_id;
        $this->setGlobalVariable('passed_climbing_card', $passed_climbing_card);

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $climbing_card_name = $climbing_card['description'];
        $climbing_card_type_arg = $climbing_card_info['type_arg'];
        $climbing_card_for_log = '/' . $climbing_card_name . '(' . $climbing_card_type_arg . ')\\';

        self::notifyAllPlayers('passedClimbingCard', clienttranslate('${player_name} could not choose either option and passed on ${climbing_card}'), array(
                'player_name' => self::getActivePlayerName(),
                'climbing_card' => $climbing_card_for_log,
        ));

        $this->gamestate->nextState('nextClimb');
    }

    function confirmPermanentAssets($player_id, $gained_assets) {
        self::checkAction('confirmPermanentAssets');

        $gained_permanent_assets = $this->getGlobalVariable('gained_permanent_assets', true);

        for ($i=0; $i<count($gained_assets); $i++) {
            switch ($i) {
                case 0: $type = 'gear';  break;
                case 1: $type = 'face';  break;
                case 2: $type = 'crack'; break;
                case 3: $type = 'slab';  break;
            }
            if ($gained_assets[$i] > 0) { $gained_permanent_assets[$player_id][$type] = $gained_assets[$i]; }
        }

        $this->setGlobalVariable('gained_permanent_assets', $gained_permanent_assets);

        $this->gamestate->setPlayerNonMultiactive($player_id, 'grantPermanentAssets');
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
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        if ($climbing_card_info && array_key_exists('spread_draw', $climbing_card_info)) {
            $x_cards = 1;
            $spread_draw = true;
        }
        else {
            $x_cards = $this->getGlobalVariable('x_cards');
            $spread_draw = false;
        }
        return array(
            "x_cards" => $x_cards,
            "spread_draw" => $spread_draw,
        );
    }

    function argClimbOrRest() {
        $current_player = self::getActivePlayerId();
        $pitch_tracker = $this->getGlobalVariable('pitch_tracker')->$current_player;
        $current_pitch = end($pitch_tracker);
        $board = $this->getGlobalVariable('board');

        return array(
            "available_pitches" => $this->getAvailablePitches($current_pitch, $board),
            "pitch_tracker" => $pitch_tracker,
        );
    }

    function argDiscardAssets() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $discard_type = $climbing_card_info['discard_type'];
        $discard_num = $climbing_card_info['discard_num'];
        $titlebar_message = null;
        $player_name1 = $climbing_card_info['opponent_name'] ?? null;

        if ($player_name1) { $titlebar_message = "give {$discard_num} Asset card/s to @{$player_name1}"; }
        else if ($discard_type === 'any_skill') { $titlebar_message = "lose 1 Face, Crack, or Slab card"; }
        else if ($discard_type === 'any_asset') {
            $titlebar_message = $climbing_card_info['type_arg'] == 12 ? 'lose 2 Asset cards' : "lose 1 Asset card";
        }
        else { $titlebar_message = "lose {$discard_num} {$discard_type} card/s"; }

        return array(
            "discard_type" => $discard_type,
            "discard_num" => $discard_num,
            "climbing_card_info" => $climbing_card_info,
            "titlebar_message" => $titlebar_message,
        );
    }

    function argSelectOpponent() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        if ($climbing_card_info) {
            $climbing_card_type = $climbing_card_info['type_arg'];
            if (array_key_exists('titlebar_message_opponent', $climbing_card_info)) { $titlebar_message_opponent = $climbing_card_info['titlebar_message_opponent']; }
            if (array_key_exists('titlebar_message', $climbing_card_info)) { $titlebar_message = $climbing_card_info['titlebar_message']; }
            if (array_key_exists('titlebar_message_opponent', $this->climbing_cards[$climbing_card_type])) {
                $titlebar_message_opponent = $this->climbing_cards[$climbing_card_type]['titlebar_message_opponent'];
            }
            if (array_key_exists('titlebar_message', $this->climbing_cards[$climbing_card_type])) {
                $titlebar_message = $this->climbing_cards[$climbing_card_type]['titlebar_message'];
            }

            return array(
                "climbing_card_info" => $climbing_card_info,
                "titlebar_message_opponent" => $titlebar_message_opponent,
                "titlebar_message" => $titlebar_message,
            );
        }
    }

    function argSelectPortaledge() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $portaledge_num = $climbing_card_info['portaledge_num'];
        $portaledge_types = $climbing_card_info['portaledge_types'] ?? null;
        return array(
            "climbing_card_info" => $climbing_card_info,
            "portaledge_num" => $portaledge_num,
            "portaledge_types" => $portaledge_types,
        );
    }

    function argAddTokenToPitch() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $climbing_card = $this->climbing_cards[$climbing_card_info['type_arg']];
        $climbing_card_info['token_types'] = $climbing_card['types'];
        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);

        return array("climbing_card_info" => $climbing_card_info);
    }

    function argAddAssetToAssetBoard() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $types = $climbing_card_info['types'];
        $types_message = $climbing_card_info['types_message'];
        return array(
            "types" => $types,
            "types_message" => $types_message,
        );
    }

    function argStealFromAssetBoard() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $types = $climbing_card_info['types'] == 'any' ? "" : "gear";
        return array(
            'types' => $types,
        );
    }

    function argChooseSummitBetaToken() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $summit_beta_tokens = $climbing_card_info['summit_beta_tokens'];
        return array(
            'summit_beta_tokens' => $summit_beta_tokens,
        );
    }

    function argChoosePermanentAssets() {
        $available_permanent_assets = $this->getGlobalVariable('available_permanent_assets', true);
        return array(
            'available_permanent_assets' => $available_permanent_assets,
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

        if (count($this->getGlobalVariable('available_characters')) > 1) {
            $player_id = self::activePrevPlayer();
            self::giveExtraTime($player_id);
            $this->gamestate->nextState('nextSelection');
        } else {
            self::giveExtraTime($this->getActivePlayerId());
            $this->gamestate->nextState('drawAssets');
        }
    }

    function stNextDraw() {

        $player_id = self::activeNextPlayer();
        self::giveExtraTime($player_id);

        $draw_step = $this->getGlobalVariable('draw_step');
        $obj = $this;

        function nextRound($obj) {
            $draw_step = $obj->getGlobalVariable('draw_step');
            $obj->setGlobalVariable('draw_step', 10);
            $obj->setGlobalVariable('x_cards', 3);
            $obj->setGlobalVariable('finished_drawing', []);
            if ($draw_step < 10) { $obj->gamestate->nextState('climbOrRest'); }
            else if ($draw_step >= 10) { $obj->gamestate->nextState('nextRound'); }
        }

        $passed_climbing_card = $this->getGlobalVariable('passed_climbing_card', true);
        $rested = $this->getGlobalVariable('rested', true);

        $player_count = $this->getPlayersNumber();
        $finished_drawing = $this->getGlobalVariable('finished_drawing', true);

        if (in_array($player_id, $passed_climbing_card)) {
            $key = array_search($player_id, $passed_climbing_card); 
            $this->setGlobalVariable('x_cards', 1);
            unset($passed_climbing_card[$key]);
            $passed_climbing_card = array_values($passed_climbing_card);
            $this->setGlobalVariable('passed_climbing_card', $passed_climbing_card);
            $finished_drawing[] = $player_id;
            $this->setGlobalVariable('finished_drawing', $finished_drawing);
            $this->gamestate->nextState('drawAssets');

        } else if (in_array($player_id, $rested)) {
            $key = array_search($player_id, $rested);
            unset($rested[$key]);
            $rested = array_values($rested);
            $this->setGlobalVariable('rested', $rested);
            $finished_drawing[] = $player_id;
            $this->setGlobalVariable('finished_drawing', $finished_drawing);
            $this->gamestate->nextState('resting');
        
        } else {

            switch ($draw_step) {
                case 1:
                    $this->setGlobalVariable('draw_step', 2);
                    break;
                case 2:
                    if ($draw_step < $player_count) { 
                        $this->setGlobalVariable('draw_step', 3);
                        $this->setGlobalVariable('x_cards', 6);
                    }
                    else { nextRound($obj); }
                    break;
                case 3;
                    if ($draw_step < $player_count) { 
                        $this->setGlobalVariable('draw_step', 4);
                        $this->setGlobalVariable('x_cards', 7);
                    }
                    else { nextRound($obj); }
                    break;
                case 4;
                    if ($draw_step < $player_count) { 
                        $this->setGlobalVariable('draw_step', 5);
                        $this->setGlobalVariable('x_cards', 8);
                    }
                    else { nextRound($obj); }
                    break;
                case 5:
                    nextRound($obj);
                    break;
                case 10:
                    if (count($finished_drawing) < $player_count) {
                        $this->setGlobalVariable('draw_step', 11);
                        $finished_drawing[] = $player_id;
                    }
                    else { nextRound($obj); }
                    break;
                case 11:
                    if (count($finished_drawing) < $player_count) {
                        $this->setGlobalVariable('draw_step', 12);
                        $finished_drawing[] = $player_id;
                    }
                    else { nextRound($obj); }                    
                    break;
                case 12: 
                    if ($player_count > 2 && count($finished_drawing) < $player_count) {
                        $this->setGlobalVariable('draw_step', 13);
                        $finished_drawing[] = $player_id;
                    }
                    else { nextRound($obj); }
                    break;
                case 13:
                    if ($player_count > 3 && count($finished_drawing) < $player_count) {
                        $this->setGlobalVariable('draw_step', 14);
                        $finished_drawing[] = $player_id;
                    }
                    else { nextRound($obj); }
                    break;
                case 14: 
                    if ($player_count > 4 && count($finished_drawing) < $player_count) { 
                        $this->setGlobalVariable('draw_step', 15);
                        $finished_drawing[] = $player_id;
                    }
                    else { nextRound($obj); }
                    break;
                case 15:
                    nextRound($obj);
                    break;
            }
            $state = $this->gamestate->state();
            if ($state['name'] == 'nextDraw') {
                $this->setGlobalVariable('finished_drawing', $finished_drawing);
                $this->gamestate->nextState('drawAssets');
            }
        } 
    }

    function stNextClimb() {

        $current_climbing_card = $this->getUniqueValueFromDB("SELECT card_id FROM cards_and_tokens WHERE card_location='in_play'");
        if ($current_climbing_card) { $this->cards_and_tokens->insertCardOnExtremePosition($current_climbing_card, 'climbing_discard', true); }

        $finished_climbing = $this->getGlobalVariable('finished_climbing', true);
        $current_player = self::getActivePlayerId();
        $finished_climbing[] = $current_player;

        $next_player = false;
        if ($this->getGlobalVariable('next_climber') != null) {
            $next_player = $this->getGlobalVariable('next_climber');
            $this->gamestate->changeActivePlayer($next_player);
            $this->setGlobalVariable('next_climber', null);
        }

        $all_player_ids = array_keys($this->getGlobalVariable('player_names_and_colors', true));

        if (count($finished_climbing) == count($all_player_ids) && count(array_diff($finished_climbing, $all_player_ids)) == 0) {
            $this->setGlobalVariable('finished_climbing', []);

            if ($this->getGlobalVariable('headwall_revealed') === false) { $this->checkForHeadwall(); }

            $starting_player = $this->getGlobalVariable('starting_player');
            $last_player = $this->getPlayerBefore($starting_player);
            $this->gamestate->changeActivePlayer($last_player);
            $this->gamestate->nextState('followPhase');
        } else if (count($finished_climbing) < count($all_player_ids)) {
            $this->setGlobalVariable('finished_climbing', $finished_climbing);
            if (!$next_player) { $next_player = self::activeNextPlayer(); }
            self::giveExtraTime($next_player);
            $this->gamestate->nextState('climbOrRest');
        }
    }

    function stPortaledgeAll() {

        $next_player = self::activeNextPlayer();
        self::giveExtraTime($next_player);
        $this->gamestate->nextState('selectPortaledge');
    }

    function stTechniqueOpponent() {

        $finished_token_choice = $this->getGlobalVariable('finished_token_choice');
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);

        if (!$finished_token_choice) {
            $opponent_id = $climbing_card_info['opponent_id'];
            $this->setGlobalVariable('finished_token_choice', self::getActivePlayerId());

            $this->gamestate->changeActivePlayer($opponent_id);
            self::giveExtraTime($opponent_id);
            $this->gamestate->nextState('chooseTechniqueToken');
        
        } else if ($finished_token_choice) {
            $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
            $this->setGlobalVariable('climbing_card_info', array());
            $this->setGlobalVariable('finished_token_choice', null);
            $this->gamestate->changeActivePlayer($finished_token_choice);
            $this->gamestate->nextState('nextClimb');
        }
    }

    function stMatchingTechniques() {

        $resource_tracker = $this->getGlobalVariable('resource_tracker', true);
        $names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);
        $tokens_awarded = false;
        $asset_board_token_tracker = $this->getGlobalVariable('asset_board_token_tracker', true);
        foreach(array_keys($names_and_colors) as $id) {

            $techniques = $resource_tracker[$id]['asset_board']['techniques'];
            $tokens = $resource_tracker[$id]['symbol_tokens'];
            $gained_points = ['precision' => 0, 'balance' => 0, 'pain_tolerance' => 0, 'power' => 0];
            $played_tokens = ['precision' => 0, 'balance' => 0, 'pain_tolerance' => 0, 'power' => 0];
            $wild_techniques = $techniques['wild'];

            foreach($techniques as $type => $value) {

                if ($type != 'wild') {

                    $gained_points[$type] += floor($value / 3);
                    $leftover_val = $value % 3;

                    if ($leftover_val > 0 && $leftover_val + $wild_techniques > 2) {

                        $gained_points[$type] ++;
                        $wild_techniques -= 3 - $leftover_val;
                        $leftover_val = 0;
                    }

                    $leftover_val_and_wild = $leftover_val + $wild_techniques;
                    if ($leftover_val > 0 && $leftover_val_and_wild + $tokens[$type] > 2) {

                        $total_remaining = $leftover_val_and_wild + $tokens[$type];
                        $new_points = floor(($total_remaining) /3);
                        $gained_points[$type] += $new_points;

                        $played_tokens[$type] += $new_points * 3 - ($leftover_val_and_wild);
                        $tokens[$type] -= $played_tokens[$type];
                        for ($i=1; $i<=$played_tokens[$type]; $i++) { $this->updateResourceTracker($id, 'subtract', null, null, [], $type); }

                        $used_wild = $new_points * 3 - ($leftover_val + $played_tokens[$type]);
                        $wild_techniques -= $used_wild;
                    }

                    $asset_board_token_tracker[$id]['points_tokens'] += $gained_points[$type];
                }
            }

            if ($wild_techniques > 2) {
                $gained_points['Wild'] = floor($wild_techniques / 3);
                $wild_techniques -= $gained_points['Wild'] * 3;
            }

            foreach (array_keys($techniques) as $type) {

                if ($type != 'wild') {

                    $tokens_and_wild = $tokens[$type] + $wild_techniques;
                    if ($tokens_and_wild > 2) {

                        $new_points = floor(($tokens_and_wild) / 3);
                        $gained_points[$type] += $new_points;

                        $previous_tokens = $played_tokens[$type];
                        $played_tokens[$type] += $new_points * 3 - $wild_techniques;
                        $new_tokens = $played_tokens[$type] - $previous_tokens;
                        for ($i=1; $i<=$new_tokens; $i++) { $this->updateResourceTracker($id, 'subtract', null, null, [], $type); }

                        $used_wild = $new_points * 3 - $new_tokens;
                        $wild_techniques -= $used_wild;
                    }
                }
            }

            if ($gained_points != ['precision' => 0, 'balance' => 0, 'pain_tolerance' => 0, 'power' => 0]) { // notifs if the player has gained any 2-point tokens (all players get same notif)

                $tokens_awarded = true;

                $token_num = array_sum(array_values($gained_points));

                $log_message = '${player_name} used ';
                $type_total = array_reduce(array_values($gained_points), function($ret, $val) { return $ret += $val > 0; });
                $type_num = 1;
                foreach($gained_points as $type => $value) {
                    if ($value > 0) {

                        $techniques = $value * 3;

                        $type_for_log = $type == 'pain_tolerance' ? 'Pain Tolerance' : ucfirst($type);
                        $log_message .= "{$techniques} {$type_for_log}";

                        if ($type_num < $type_total) { $log_message .= ', '; }
                        if ($type_num == $type_total - 1) { $log_message .= 'and '; }
                        if ($type_num == $type_total) { $log_message .= ' '; }
                        $type_num++;
                    }
                }

                $log_message .= "Techniques";

                if (array_sum(array_values($played_tokens)) > 0) {

                    $log_message .= ', including ';
                    $type_total = array_reduce(array_values($played_tokens), function($ret, $val) { return $ret += $val > 0; });
                    $type_num = 1;
                    foreach($played_tokens as $type => $value) {

                        if ($value > 0) {

                            $type_for_log = $type == 'pain_tolerance' ? 'Pain Tolerance' : ucfirst($type);
                            $log_message .= "{$value} {$type_for_log}";

                            if ($type_num < $type_total) { $log_message .= ', '; }
                            if ($type_num == $type_total -1) { $log_message .= 'and '; }
                            if ($type_num == $type_total) { $log_message .= ' '; }
                            $type_num++;

                            $resource_tracker[$id]['symbol_tokens'][$type]--;
                        }
                    }

                    $log_message .= "Technique token(s)";
                }

                $numbermap = ['zero', 'one', 'two', 'three', 'four', 'five'];
                $log_message .= " and gains {$numbermap[$token_num]} 2-Point Token(s)";

                self::notifyAllPlayers("matchingTechniques", clienttranslate($log_message), array(
                        'player_id' => $id,
                        'player_name' => $names_and_colors[$id]['name'],
                        'player_color' => $names_and_colors[$id]['color'],
                        'token_num' => $token_num,
                        'played_tokens' => $played_tokens,
                ));
            }

            $this->setGlobalVariable('asset_board_token_tracker', $asset_board_token_tracker);
        }

        if (!$tokens_awarded) { self::notifyAllPlayers('noMatchingTechniques', clienttranslate('No 2-point tokens are awarded for matching Techniques'), []); }

        $this->setGlobalVariable('asset_board_token_tracker', $asset_board_token_tracker);
        $this->gamestate->nextState('flagPermanentAssets');
    }

    function stFlagPermanentAssets() {

        $board_assets = $this->getGlobalVariable('board_assets', true);
        $names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);
        $available_tokens = [];
        $active_players = [];
        foreach($board_assets as $player => $board) {

            $max_slots = $this->characters[$names_and_colors[$player]['character']]['permanent_asset_slots'];
            $filled_slots = $board_assets[$player]['gear']['permanent'] + $board_assets[$player]['face']['permanent'] +
                            $board_assets[$player]['crack']['permanent'] + $board_assets[$player]['face']['permanent'];
            $available_tokens[$player] = [];
            foreach($board as $type => $assets) {

                if ($assets['count'] > 3 && $filled_slots < $max_slots) {
                    if (!in_array($player, $active_players)) { $active_players[] = $player; }
                    $available_tokens[$player][$type] = floor($assets['count'] / 4);
                }
            }
        }

        $this->setGlobalVariable('available_permanent_assets', $available_tokens);

        if ($active_players === []) { self::notifyAllPlayers('noPermanentAssets', clienttranslate('No players are eligible for Permanent Asset tokens'), []); }

        $this->gamestate->setPlayersMultiactive($active_players, "flipPlayedAssets", true);
        if ($active_players != []) { $this->gamestate->nextState('choosePermanentAssets'); }
    }

    function stFlipPlayedAssets() {

        $board_assets = $this->getGlobalVariable('board_assets', true);
        $resource_tracker = $this->getGlobalVariable('resource_tracker', true);
        $ids_to_flip = [];

        foreach ($board_assets as $player => $board) {

            foreach($board as $type => $assets) {

                for ($i=1; $i<=4; $i++) {

                    if ($assets['flipped'][$i] === false) {

                        $ids_to_flip[] = array_keys($assets[$i])[0];
                        $board_assets[$player][$type]['flipped'][$i] = true;
                        $type_arg = array_values($assets[$i])[0];
                        $technique = $this->getTechniqueType($type_arg);
                        if ($technique) { $resource_tracker[$player]['asset_board']['techniques'][$technique]--; }
                    }
                }
            }
        }

        $this->setGlobalVariable('board_assets', $board_assets);
        $this->setGlobalVariable('resource_tracker', $resource_tracker);

        self::notifyAllPlayers('flipPlayedAssets', '', array(
            'ids_to_flip' => $ids_to_flip,
        ));

        $this->gamestate->nextState('nextDraw');
    }

    function stGrantPermanentAssets() { 

        $gained_permanent_assets = $this->getGlobalVariable('gained_permanent_assets', true);
        $resource_tracker = $this->getGlobalVariable('resource_tracker', true);
        $board_assets = $this->getGlobalVariable('board_assets', true);
        $asset_board_token_tracker = $this->getGlobalVariable('asset_board_token_tracker', true);
        $names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);

        $log_message = $gained_permanent_assets ? '' : 'No players chose to gain Permanent Asset tokens';

        $player_id1 = array_keys($gained_permanent_assets)[0] ?? null;
        $player_name1 = $names_and_colors[$player_id1]['name'] ?? null;
        $player_id2 = array_keys($gained_permanent_assets)[1] ?? null;
        $player_name2 = $names_and_colors[$player_id2]['name'] ?? null;
        $player_id3 = array_keys($gained_permanent_assets)[2] ?? null;
        $player_name3 = $names_and_colors[$player_id3]['name'] ?? null;
        $player_id4 = array_keys($gained_permanent_assets)[3] ?? null;
        $player_name4 = $names_and_colors[$player_id4]['name'] ?? null;
        $player_id5 = array_keys($gained_permanent_assets)[4] ?? null;
        $player_name5 = $names_and_colors[$player_id5]['name'] ?? null;

        $discarded_assets = [];

        $player_total = count(array_keys($gained_permanent_assets));
        $player_num = 1;
        foreach($gained_permanent_assets as $player_id => $assets) {
            $discarded_assets[$player_id]['tucked'] = ['gear' => [], 'face' => [], 'crack' => [], 'slab' => []];
            $discarded_assets[$player_id]['flipped'] = ['gear' => [], 'face' => [], 'crack' => [], 'slab' => []];
            $discarded_assets[$player_id]['unflipped'] = ['gear' => [], 'face' => [], 'crack' => [], 'slab' => []];

            $assets = array_filter($assets);
            $message_begun = false;
            $type_total = count(array_keys($assets));
            $type_num = 1;

            foreach($assets as $type => $num) {

                // update trackers for added permanent asset token
                $resource_tracker[$player_id]['permanent_skills'][$type] += $num;
                $board_assets[$player_id][$type]['permanent'] += $num;
                $asset_board_token_tracker[$player_id]['permanent_tokens'][$type] += $num;

                // update trackers for assets discarded from asset board
                for ($i=1; $i<=$num*4; $i++) {

                    if ($board_assets[$player_id][$type]['tucked']) {

                        $asset_id = array_keys($board_assets[$player_id][$type]['tucked'])[0];
                        $this->cards_and_tokens->playCard($asset_id);
                        unset($board_assets[$player_id][$type]['tucked'][$asset_id]);
                        $board_assets[$player_id][$type]['count']--;
                        $resource_tracker[$player_id]['asset_board']['skills'][$type]--;
                        $discarded_assets[$player_id]['tucked'][$type][] = $asset_id;
                        continue;
                    }

                    for ($j=4; $j>=1; $j--) {

                        if ($board_assets[$player_id][$type][$j]) {

                            $asset_id = array_keys($board_assets[$player_id][$type][$j])[0];
                            $this->cards_and_tokens->playCard($asset_id);
                            unset($board_assets[$player_id][$type][$j][$asset_id]);
                            $board_assets[$player_id][$type]['count']--;
                            $resource_tracker[$player_id]['asset_board']['skills'][$type]--;

                            if ($board_assets[$player_id][$type]['flipped'][$j]) { $discarded_assets[$player_id]['flipped'][$type][] = $asset_id; }
                            else { $discarded_assets[$player_id]['unflipped'][$type][] = $asset_id; }

                            $board_assets[$player_id][$type]['flipped'][$j] = null;
                            break;
                        }
                    }
                }

                // log message
                if (!$message_begun) {
                    $player_names[$player_id] = $names_and_colors[$player_id]['name'];
                    switch ($player_num) {
                        case 1: $log_message .= '${player_name1} gains '; break;
                        case 2: $log_message .= '${player_name2} gains '; break;
                        case 3: $log_message .= '${player_name3} gains '; break;
                        case 4: $log_message .= '${player_name4} gains '; break;
                        case 5: $log_message .= '${player_name5} gains '; break;
                    }
                    $message_begun = true;
                }

                $type_for_log = ucfirst($type);
                $log_message .= "{$num} {$type_for_log}";

                if ($type_num < $type_total) { $log_message .= ', '; }
                if ($type_num == $type_total -1) { $log_message .= 'and '; }
                $type_num++;
            }

            if ($player_num == $player_total -1) { $log_message .= ' and '; }
            $player_num++;
        }
        $log_message .= ' Permanent Asset token(s)';

        self::notifyAllPlayers('grantPermanentAssets', clienttranslate($log_message), array(
                'player_name1' => $player_name1,
                'player_name2' => $player_name2,
                'player_name3' => $player_name3,
                'player_name4' => $player_name4,
                'player_name5' => $player_name5,
                'gained_permanent_assets' => $gained_permanent_assets,
                'discarded_assets' => $discarded_assets
        ));

        $this->setGlobalVariable('gained_permanent_assets', []);
        $this->setGlobalVariable('resource_tracker', $resource_tracker);
        $this->setGlobalVariable('board_assets', $board_assets);
        $this->setGlobalVariable('asset_board_token_tracker', $asset_board_token_tracker);

        $this->gamestate->nextState('flipPlayedAssets');
    }

    function stNextRound() {

        $starting_player = $this->getGlobalVariable('starting_player');
        $player_order = $this->getGlobalVariable('player_order', true);
        $current_num = intval(array_search($starting_player, $player_order));
        $new_num = $current_num < $this->getPlayersNumber() ? $current_num+1 : '1';
        $new_starting_player = $player_order[$new_num];

        $this->setGlobalVariable('starting_player', $new_starting_player);
        $player_names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);

        $this->gamestate->changeActivePlayer($new_starting_player);

        self::notifyAllPlayers('passStartingPlayer', '${player_name} is the new starting player', array(
            'player_name' => $player_names_and_colors[$new_starting_player]['name'],
            'new_starting_player' => $new_starting_player,
        ));

        $this->gamestate->nextState('climbOrRest');
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