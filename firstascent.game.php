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
        $sql .= implode(',', $values);
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();

        // Init globals
        $player_names_and_colors = [];
        foreach ($players as $player_id => $player) {

            $player_name = $this->getUniqueValueFromDb("SELECT `player_name` FROM `player` WHERE `player_id` = '$player_id'");
            $player_names_and_colors[$player_id]['name'] = $player_name;
        }
        $this->setGlobalVariable('player_names_and_colors', $player_names_and_colors);

        $this->setGlobalVariable('finished_climbing', []);
        $this->setGlobalVariable('finished_portaledge', []);
        $this->setGlobalVariable('pitch_asset_tokens', []);
        $this->setGlobalVariable('next_climber', null);
        $this->setGlobalVariable('rerack_1', []);
        $this->setGlobalVariable('rested', []);
        $this->setGlobalVariable('finished_drawing', []);
        $this->setGlobalVariable('gained_permanent_assets', []);
        $this->setGlobalVariable('refill_portaledge', []);
        $this->setGlobalVariable('headwall_revealed', false);
        $this->setGlobalVariable('risk_it', false);
        $this->setGlobalVariable('risk_it_info', []);
        $this->setGlobalVariable('risked_assets', []);
        $this->setGlobalVariable('risk_pitches', []);
        $this->setGlobalVariable('risked_requirements', []);
        $this->setGlobalVariable('climbing_card_info', []);
        
        $score_tracker = [];
        foreach ($players as $player_id => $player) {
            $score_tracker[$player_id] = array(
                'pitches' => 0,
                'objectives' => 0,
                'tokens' => 0,
                'summit' => 0
            );
        }
        $this->setGlobalVariable('score_tracker', $score_tracker);

        $starting_player = $this->getUniqueValueFromDb("SELECT `player_id` FROM `player` WHERE `player_no` = '1'");
        $this->setGlobalVariable('starting_player', $starting_player);

        // Init stats
        $this->initStat('table', 'rounds', 0);
        $this->initStat('player', 'climbed_arete', 0);
        $this->initStat('player', 'climbed_corner', 0);
        $this->initStat('player', 'climbed_crack', 0);
        $this->initStat('player', 'climbed_flake', 0);
        $this->initStat('player', 'climbed_roof', 0);
        $this->initStat('player', 'climbed_slab', 0);
        $this->initStat('player', 'played_gear', 0);
        $this->initStat('player', 'played_face', 0);
        $this->initStat('player', 'played_crack', 0);
        $this->initStat('player', 'played_slab', 0);
        $this->initStat('player', 'water_spent', 0);
        $this->initStat('player', 'psych_spent', 0);
        $this->initStat('player', 'climbed_one_star', 0);
        $this->initStat('player', 'climbed_two_star', 0);
        $this->initStat('player', 'climbed_three_star', 0);
        $this->initStat('player', 'climbed_four_star', 0);
        $this->initStat('player', 'climbed_five_star', 0);
        $this->initStat('player', 'climbed_summit', false);
        $this->initStat('player', 'shared_objectives_met', 0);
        $this->initStat('player', 'shared_objectives_points', 0);
        $this->initStat('player', 'personal_objective_scored', "0");
        $this->initStat('player', 'personal_objective_points', 0);
        $this->initStat('player', 'technique_token_points', 0);
        $this->initStat('player', 'permanent_gear_assets', 0);
        $this->initStat('player', 'permanent_face_assets', 0);
        $this->initStat('player', 'permanent_crack_assets', 0);
        $this->initStat('player', 'permanent_slab_assets', 0);
        $this->initStat('player', 'played_summit_beta_tokens', 0);
        $this->initStat('player', 'previously_climbed_pitches', 0);
        $this->initStat('player', 'times_rested', 0);
        $this->initStat('player', 'risky_climbs', 0);
        $this->initStat('player', 'times_retreated', 0);

        // Select board for player count
        if ($this->getPlayersNumber() <= 3) { $board = 'desert'; }
        else { $board = 'forest'; }
        $this->setGlobalVariable('board', $board);

        // Initialize pitch and ledge_teleport and rope_overlap trackers and ledge
        $pitch_tracker = [];
        $ledge_teleports = [];
        $rope_overlaps = [];
        $permanent_asset_tracker = [];
        foreach($players as $player_id => $player) {
            $pitch_tracker[$player_id] = ['0'];
            $ledge_teleports[$player_id] = [];
            $rope_overlaps[$player_id] = [];
            $permanent_asset_tracker[$player_id] = [];
        }
        $ledge = $board === 'desert' ? range(16, 26) : range(20, 34);
        $this->setGlobalVariable('pitch_tracker', $pitch_tracker);
        $this->setGlobalVariable('ledge_teleports', $ledge_teleports);
        $this->setGlobalVariable('ledge', $ledge);
        $this->setGlobalVariable('rope_overlaps', $rope_overlaps);
        $pitches_rope_order = [];
        $board_pitch_count = $board === 'desert' ? 32 :43;
        for ($i=1; $i<=$board_pitch_count; $i++) {
            $pitches_rope_order[$i] = [];
        }
        $this->setGlobalVariable('pitches_rope_order', $pitches_rope_order);

        $this->setGlobalVariable('permanent_asset_tracker', $permanent_asset_tracker);

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
                "psych" => 0,
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
        // $testing1 = $this->getUniqueValueFromDb("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type_arg` = 63");
        // $testing2 = $this->getUniqueValueFromDB("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type_arg` = 50");
        // $testing3 = $this->getUniqueValueFromDB("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type_arg` = 8");
        // $testing4 = $this->getUniqueValueFromDB("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type_arg` = 39");
        // $testing5 = $this->getUniqueValueFromDB("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type_arg` = 30");
        // $testing6 = $this->getUniqueValueFromDB("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type_arg` = 40");
        // $testing7 = $this->getUniqueValueFromDB("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type_arg` = 14");
        // $testing8 = $this->getUniqueValueFromDB("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type_arg` = 3");
        // $this->cards_and_tokens->insertCardOnExtremePosition($testing8, 'climbing_deck', true);
        // $this->cards_and_tokens->insertCardOnExtremePosition($testing7, 'climbing_deck', true);
        // $this->cards_and_tokens->insertCardOnExtremePosition($testing6, 'climbing_deck', true);
        // $this->cards_and_tokens->insertCardOnExtremePosition($testing5, 'climbing_deck', true);
        // $this->cards_and_tokens->insertCardOnExtremePosition($testing4, 'climbing_deck', true);
        // $this->cards_and_tokens->insertCardOnExtremePosition($testing3, 'climbing_deck', true);
        // $this->cards_and_tokens->insertCardOnExtremePosition($testing2, 'climbing_deck', true);
        // $this->cards_and_tokens->insertCardOnExtremePosition($testing1, 'climbing_deck', true);

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
        // $testingSB1 = $this->getUniqueValueFromDb("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type`='summit_beta' AND `card_type_arg`=9");
        // $testingSB2 = $this->getUniqueValueFromDb("SELECT `card_id` FROM `cards_and_tokens` WHERE `card_type`='summit_beta' AND `card_type_arg`=2");
        // $this->cards_and_tokens->insertCardOnExtremePosition($testingSB2, 'summit_beta_supply', true);
        // $this->cards_and_tokens->insertCardOnExtremePosition($testingSB1, 'summit_beta_supply', true);

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

        $asset_identifier = self::getCollectionFromDB(
                                "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='asset'", true);
        $token_identifier = self::getCollectionFromDB(
                                "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='summit_beta'", true);
        $climbing_card_identifier = self::getCollectionFromDB(
                                "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='climbing'", true);

        $this->setGlobalVariable('asset_identifier', $asset_identifier);
        $this->setGlobalVariable('token_identifier', $token_identifier);
        $this->setGlobalVariable('climbing_card_identifier', $climbing_card_identifier);

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

        // $assets_50 = $this->cards_and_tokens->getCardsOnTop(50, 'asset_deck');
        // $types = [];
        // $gear_num = 0;
        // foreach ($assets_50 as $asset) {
        //     $type = $this->getAssetType($asset['type_arg']);
        //     $types[] = $type;
        //     if ($type === 'gear') {
        //         $this->cards_and_tokens->insertCardOnExtremePosition($asset['id'], 'asset_deck', true);
        //         $gear_num++;
        //     }
        // }
        // $this->setGlobalVariable('gear_num', $gear_num);

        // draw starting spread
        $this->cards_and_tokens->pickCardsForLocation(4, 'asset_deck', 'the_spread');
        $spread_assets = self::getCollectionFromDB("SELECT card_id FROM cards_and_tokens WHERE card_location='the_spread'");
        $polychrome = $this->checkSpread();
        while ($polychrome === false) {

            $discard_id = array_pop($spread_assets)['card_id'];
            $this->cards_and_tokens->insertCardOnExtremePosition($discard_id, 'asset_deck', false);
            $this->cards_and_tokens->shuffle('asset_deck');
            $new_card = $this->cards_and_tokens->getCardOnTop('asset_deck');
            $this->cards_and_tokens->moveCard($new_card['id'], 'the_spread');
            $polychrome = $this->checkSpread();
        }

    // Set up board

        // set up shared objectives

        $shared_objectives_ids = range(1,16);
        shuffle($shared_objectives_ids);
        $current_shared_objectives = array_slice($shared_objectives_ids, 0, 3);

        // testing
        // $current_shared_objectives = [10, 11, 16];

        $this->setGlobalVariable('current_shared_objectives', $current_shared_objectives);

        $crack_pitches = ['6', '11', '22', '23', '27', '30', '36', '43'];
        $slab_pitches = ['1', '9', '14', '15', '25', '33', '38'];
        $corner_pitches = ['3', '10', '18', '19', '26', '37', '41'];
        $arete_pitches = ['4', '8', '16', '17', '31', '34', '40'];
        $flake_pitches = ['5', '12', '20', '21', '32', '35', '42'];
        $roof_pitches = ['2', '7', '13', '24', '28', '29', '39'];

        $shared_objectives_tracker = [];

        foreach ($current_shared_objectives as $objective_id) {
            switch($objective_id) {
                
                case 1: // ridgeline challenge north
                    $board = $this->getGlobalVariable('board');
                    $north_hexes = $board === 'desert' ? ['1', '9', '16', '22', '27', '31'] : ['1', '11', '20', '28', '35', '41'];
                    $shared_objective = [
                        'hexes' => $north_hexes,
                        'players_met' => [],
                        'score' => 5,
                    ];
                    break;

                case 2: // ridgeline challenge south
                    $board = $this->getGlobalVariable('board');
                    $south_hexes = $board === 'desert' ? ['8', '15', '21', '26', '30', '32'] : ['10', '19', '27', '34', '40', '43'];
                    $shared_objective = [
                        'hexes' => $south_hexes,
                        'players_met' => [],
                        'score' => 5,
                    ];
                    break;

                case 3: // stay in the shade
                    $shaded_pitches = ['1', '4', '5', '7', '8', '10', '11', '12', '14', '17', '19', '22', '25', '28', '30', '36', '38', '39', '42', '43'];
                    $shared_objective = [
                        'pitches' => $shaded_pitches,
                    ];
                    break;

                case 4: // stay in the sun
                    $sunny_pitches = ['2', '3', '6', '9', '13', '15', '16', '18', '20', '21', '23', '24', '26', '27', '29', '31', '32', '33', '34', '35', '36', '37', '40', '41'];
                    $shared_objective = [
                        'pitches' => $sunny_pitches,
                    ];
                    break;

                case 5: // jolly jammer
                    $shared_objective = [
                        'pitches' => $crack_pitches,
                        'players_met' => [],
                        'score' => 4,
                    ];
                    break;

                case 6: // smear campaign
                    $shared_objective = [
                        'pitches' => $slab_pitches,
                        'players_met' => [],
                        'score' => 4,
                    ];
                    break;

                case 7: // star stemmer
                    $shared_objective = [
                        'pitches' => $corner_pitches,
                        'players_met' => [],
                        'score' => 4,
                    ];
                    break;

                case 8: // exposure junkie
                    $shared_objective = [
                        'pitches' => $arete_pitches,
                        'players_met' => [],
                        'score' => 4,
                    ];
                    break;
                
                case 9: // grand traverse
                    $shared_objective = [
                        'players_met' => [],
                        'score' => 6,
                    ];
                    break;

                case 10: // all-arounding
                    $shared_objective = [
                        'players_met' => [],
                        'score' => 6,
                    ];
                    break;

                case 11: // the elitist
                    $one_point_pitches = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
                    $shared_objective = [
                        'pitches' => $one_point_pitches,
                        'score' => 4,
                    ];
                    $score_tracker = $this->getGlobalVariable('score_tracker', true);
                    foreach ($players as $player_id => $player) {
                        $shared_objective['players_met'][] = $player_id;
                        $this->DbQuery("UPDATE player SET player_score=player_score+4 WHERE player_id='$player_id'");
                        $score_tracker[$player_id]['objectives'] += 4;
                        $this->incStat(1, "shared_objectives_met", $player_id);
                    }
                    $this->setGlobalVariable('score_tracker', $score_tracker);
                    break;

                case 12: // a day in the alpine
                    $headwall_hexes = $board === 'desert' ? ['22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32'] :
                                                            ['28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43'];
                    $shared_objective = [
                        'hexes' => $headwall_hexes,
                    ];
                    break;

                case 13: // flake freak
                    $shared_objective = [
                        'pitches' => $flake_pitches,
                        'players_met' => [],
                        'score' => 4,
                    ];
                    break;

                case 14: // pull-up champion
                    $shared_objective = [
                        'pitches' => $roof_pitches,
                        'players_met' => [],
                        'score' => 4,
                    ];
                    break;

                case 15: // stonemaster
                    $shared_objective = [
                        'players_met' => [],
                        'score' => 8,
                    ];
                    break;

                case 16: // off-width afficionado
                    $shared_objective = [
                        'players_met' => [],
                        'score' => 8,
                    ];
                    break;
            }

            $shared_objective['player_counts'] = [];
            if ($objective_id === 10) {  // all-arounding
                foreach ($players as $player_id => $player) {
                    $shared_objective['player_counts'][$player_id] = [
                        'crack' => false, 'slab' => false, 'corner' => false, 'arete' => false, 'flake' => false, 'roof' => false, 'any' => false,
                    ];
                }
            }
            else if ($objective_id != 11) {
                foreach ($players as $player_id => $player) { $shared_objective['player_counts'][$player_id] = 0; }
            }
            $shared_objectives_tracker[$objective_id] = $shared_objective;
        }
        foreach ($shared_objectives_tracker as $id => $info) {
            $name = $this->shared_objectives[(string)$id]['name'];
            $this->initStat('player', $name, 0);
            if ($name === "the_elitist") { $this->incStat(4, "the_elitist", $player_id); }
        }
        $this->setGlobalVariable('shared_objectives_tracker', $shared_objectives_tracker);

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

        // TESTING
        if (!in_array('2', $available_characters)) {
            array_shift($available_characters);
            $available_characters[] = '2';
        }
        // if (!in_array('10', $available_characters)) {
        //     array_shift($available_characters);
        //     $available_characters[] = '10';
        // }

        $this->setGlobalVariable('available_characters', $available_characters);
        $this->setGlobalVariable('round', '0');
        $this->setGlobalVariable('phase', 'Setup');

        // Create personal objective pile
        $personal_objective_deck = range(1, 12);
        shuffle($personal_objective_deck);

        // TESTING
        // array_push($personal_objective_deck, 9);
        // array_push($personal_objective_deck, 10);
        // array_push($personal_objective_deck, 11);
        // array_push($personal_objective_deck, 12);

        $this->setGlobalVariable('personal_objective_deck', $personal_objective_deck);
        $this->setGlobalVariable('personal_objectives', []);
        $this->setGlobalVariable('personal_objectives_tracker', []);

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
        $result['shared_objectives_tracker'] = $this->getGlobalVariable('shared_objectives_tracker');
        $result['characters'] = $this->characters;
        $result['available_characters'] = $this->getGlobalVariable('available_characters');
        $result['personal_objectives'] = $this->personal_objectives;
        $result['water_psych_tracker'] = $this->getGlobalVariable('water_psych_tracker');

        // Get starting Spread and discard pile
        $result['spread'] = self::getCollectionFromDB("SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_location='the_spread'", true);
        $asset_discard = self::getCollectionFromDB("SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_location='discard'", true);
        $result['asset_discard'] = $asset_discard;
        $this->setGlobalVariable('asset_discard', $asset_discard);

        // Get cards and tokens in each players' hand and asset board
        if ($current_player_id) {
            $result['current_personal_objectives'] = (isset($this->getGlobalVariable('personal_objectives', true)[$current_player_id])) ? $this->getGlobalVariable('personal_objectives', true)[$current_player_id] : null;
            $result['personal_objectives_tracker'] = (isset($this->getGlobalVariable('personal_objectives_tracker', true)[$current_player_id])) ? $this->getGlobalVariable('personal_objectives_tracker', true)[$current_player_id] : null;
            $result["hand_assets"] = $this->getHandAssets($current_player_id);
            $result["hand_summit_beta_tokens"] = $this->getHandSummitBetaTokens($current_player_id);
            $result["hand_symbol_tokens"] = $this->getGlobalVariable('resource_tracker', true)[$current_player_id]['symbol_tokens'];
            $result['resource_tracker'] = $this->getGlobalVariable('resource_tracker', true)[$current_player_id];
        }

        if ($this->gamestate->state()['name'] === 'gameEnd') {
            $result['opponents_objectives_tracker'] = $this->getGlobalVariable('personal_objectives_tracker', true);
            $result['scored_personal_objectives'] = $this->getGlobalVariable('scored_personal_objectives', true);
        }

        $result["starting_player"] = $this->getGlobalVariable('starting_player');

        $result["board_assets"] = $this->getGlobalVariable('board_assets', true);
        $result["hand_count"] = [];
        foreach ($result['players'] as $player) { $result["hand_count"][$player['id']] = count($this->getHandAssets($player['id'])); }

        $result['round'] = $this->getGlobalVariable('round');
        $result['phase'] = $this->getGlobalVariable('phase');
        
        $result['pitch_tracker'] = $this->getGlobalVariable('pitch_tracker', true);
        $result['pitches_rope_order'] = $this->getGlobalVariable('pitches_rope_order', true);
        $result['ledge_teleports'] = $this->getGlobalVariable('ledge_teleports', true);
        $result['headwall_revealed'] = $this->getGlobalVariable('headwall_revealed');
        $result['risk_it'] = $this->getGlobalVariable('risk_it');
        $result['risked_assets'] = $this->getGlobalVariable('risked_assets', true);
        $result['risk_pitches'] = $this->getGlobalVariable('risk_pitches', true);
        $result['rope_overlaps'] = $this->getGlobalVariable('rope_overlaps', true);
        $result['permanent_asset_tracker'] = $this->getGlobalVariable('permanent_asset_tracker', true);
        $result['asset_board_token_tracker'] = $this->getGlobalVariable('asset_board_token_tracker', true);
        $result['pitch_identifier'] = $this->getGlobalVariable('pitch_identifier', true);
        $result['asset_identifier'] = $this->getGlobalVariable('asset_identifier', true);
        $result['token_identifier'] = $this->getGlobalVariable('token_identifier', true);
        $result['climbing_card_identifier'] = $this->getGlobalVariable('climbing_card_identifier', true);

        $result['climbing_card_info'] = $this->getGlobalVariable('climbing_card_info', true);

        $result['climbing_discard_top_card'] = $this->cards_and_tokens->getCardOnTop('climbing_discard');
        $result['asset_discard_top_card'] = $this->cards_and_tokens->getCardOnTop('discard');
        $result['summit_beta_discard_top_token'] = $this->cards_and_tokens->getCardOnTop('summit_beta_discard');

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

        $result['riskSummitBetaFace'] = $this->getGlobalVariable('riskSummitBetaFace');
        $result['crimper_cards'] = $this->getGlobalVariable('crimper_cards', true);

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
        $pitch_tracker = $this->getGlobalVariable('pitch_tracker', true);
        $spent_rope = 0;
        foreach ($pitch_tracker as $player_arr) {
            $count = count($player_arr) -1;
            if ($count > $spent_rope) {
                $spent_rope = $count;
            }
        }
        $progression = ceil($spent_rope * 12.5);
        return $progression;
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
        $personal_objectives_tracker = $this->getGlobalVariable('personal_objectives_tracker', true);
        foreach ($current_personal_objectives as $id) { $personal_objectives_tracker[$player_id][$id] = []; }
        $this->setGlobalVariable('personal_objective_deck', $personal_objective_deck);
        $this->setGlobalVariable('personal_objectives', $personal_objectives);
        $this->setGlobalVariable('personal_objectives_tracker', $personal_objectives_tracker);

        // initialize water and psych
        $starting_value = $this->characters[$character]['water_psych'];
        $this->updateResourceTracker($player_id, 'add', $starting_value, $starting_value);

        // Young Prodigy
        if ($character == '6') {
            $board_assets = $this->getGlobalVariable('board_assets', true);
            $board_assets[$player_id]['gear']['5'] = [];
            $board_assets[$player_id]['gear']['flipped']['5'] = null;
            foreach(['face', 'crack', 'slab'] as $type) {
                unset($board_assets[$player_id][$type]['4']);
                unset($board_assets[$player_id][$type]['flipped']['4']);
            }
            $this->setGlobalVariable('board_assets', $board_assets);
        }        

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


    function confirmAssets($deck_assets=0, $spread_assets=[], $simul_climb = false) {
        self::checkAction('confirmAssets');
        $player_id = self::getActivePlayerId();
        $deck_assets = intval($deck_assets);
        $this->setGlobalVariable('confirm_assets', $this->getGlobalVariable('resource_tracker', true));

        $rerack_1 = $this->getGlobalVariable('rerack_1', true);
        if (in_array($player_id, $rerack_1) && !$this->getGlobalVariable('climbing_card_info', true)) {
            $key = array_search($player_id, $rerack_1); 
            unset($rerack_1[$key]);
            $rerack_1 = array_values($rerack_1);
            $this->setGlobalVariable('rerack_1', $rerack_1);

        }
        if ($this->getGlobalVariable('x_cards') === 1) { $this->setGlobalVariable('x_cards', 3); }

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
        $spread_assets_arr = $this->cards_and_tokens->pickCardsForLocation($empty_slots, 'asset_deck', 'the_spread') ?? [];
        $last_drawn_asset = $spread_assets_arr[array_key_last($spread_assets_arr)] ?? null;
        $monochrome = 0; // the number of cards that have to be replaced to achieve polychromy
        $polychrome = $this->checkSpread();
        while ($polychrome != true) {
            $monochrome++;
            $this->cards_and_tokens->insertCardOnExtremePosition($last_drawn_asset['id'], 'discard', true);
            $spread_assets_arr[] = $this->cards_and_tokens->pickCardForLocation('asset_deck', 'the_spread');
            $polychrome = $this->checkSpread();
        }

        // For resizeHand()
        $new_cards = array_merge($deck_card_ids, $spread_assets);

        // In case of active climbing card
        $climbing_card = $this->getGlobalVariable('climbing_card_info', true) ? true : false;
        $climbing_card_info = $climbing_card ? $this->getGlobalVariable('climbing_card_info', true) : null;

        // create log message
        $log_message = $simul_climb ? '${player_name} uses +Simul Climb(7)+ and takes ' : '${player_name} takes ';
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
                'monochrome' => $monochrome,
                'last_drawn_asset' => $last_drawn_asset,
                'spread_assets_for_log' => $spread_assets_for_log,
                'player_resources' => $player_resources,
                'climbing_card' => $climbing_card,
                'simul_climb' => $simul_climb,
                'preserve' => ['player_id'],
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
                'monochrome' => $monochrome,
                'last_drawn_asset' => $last_drawn_asset,
                'deck_assets_arr' => $deck_assets_arr,
                'spread_assets_for_log' => $spread_assets_for_log,
                'deck_assets_for_log' => $deck_assets_for_log,
                'player_resources' => $player_resources,
                'new_cards' => $new_cards,
                'deck_card_ids' => $deck_card_ids,
                'climbing_card' => $climbing_card,
                'simul_climb' => $simul_climb,
        ));

        if ($climbing_card && !$simul_climb) {
            $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
            $this->setGlobalVariable('climbing_card_info', array());
            $this->gamestate->nextState('nextClimb');
        }
        else if ($simul_climb) {
            $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
            $simul_climb_id = array_search('7', $hand_sb_tokens);
            $this->cards_and_tokens->insertCardOnExtremePosition($simul_climb_id, 'summit_beta_discard', true);
            $this->incStat(1, "played_summit_beta_tokens", $player_id);
            return;
        }
        else { $this->gamestate->nextState('nextDraw'); }
    }

    function confirmRequirements($requirements, $selected_resources, $selected_tokens, $selected_summit_betas, $selected_hex, $selected_pitch, $extra_water) {

        self::checkAction('confirmRequirements');
        $player_id = self::getActivePlayerId();
        $character_id = $this->getGlobalVariable('player_names_and_colors', true)[$player_id]['character'];
        $players = $this->getGlobalVariable('player_names_and_colors', true);
        $board = $this->getGlobalVariable('board');
        $pitch = $this->pitches[$selected_pitch];
        $pitch_type = $pitch['type'];
        $pitch_value = $this->pitches[$selected_pitch]['value'];

        // new pitch and rope
        $pitch_tracker = $this->getGlobalVariable('pitch_tracker', true);
        array_push($pitch_tracker[$player_id], $selected_hex);
        $this->setGlobalVariable('pitch_tracker', $pitch_tracker);
        $pitches_rope_order = $this->getGlobalVariable('pitches_rope_order', true);
        array_push($pitches_rope_order[$selected_hex], $player_id);
        $this->setGlobalVariable('pitches_rope_order', $pitches_rope_order);

        // track shared objectives
        $shared_objectives_tracker = $this->getGlobalVariable('shared_objectives_tracker', true);
        $shared_objective_points = 0;
        foreach ($shared_objectives_tracker as $num_id => $info) {
            $id = strval($num_id);
            switch ($id) {

                case '1':
                case '2':
                    if (in_array($selected_hex, $info['hexes'])) {
                        $info['player_counts'][$player_id]++;
                        if ($info['player_counts'][$player_id] === 4) {
                            $info['players_met'][] = $player_id;
                            $shared_objective_points += 5;
                            $this->incStat(1, "shared_objectives_met", $player_id);
                            switch ($id) {
                                case '1': $this->incStat(5, "ridgeline_challenge_north", $player_id); break;
                                case '2': $this->incStat(5, "ridgeline_challenge_south", $player_id); break;
                            }
                        }
                        $shared_objectives_tracker[$id] = $info;
                    }
                    break;

                case '3':
                case '4':
                    if (in_array($selected_pitch, $info['pitches'])) {
                        $info['player_counts'][$player_id]++;
                        $shared_objective_points += 1;
                        $shared_objectives_tracker[$id] = $info;
                        if ($info['player_counts'][$player_id] === 1) { $this->incStat(1, "shared_objectives_met", $player_id); }
                        switch ($id) {
                            case '3': $this->incStat(1, "stay_in_the_shade", $player_id); break;
                            case '4': $this->incStat(1, "stay_in_the_sun", $player_id); break;
                        }
                    }
                    break;

                case '5':
                case '6':
                case '7':
                case '8':
                case '13':
                case '14':
                    if (in_array($selected_pitch, $info['pitches'])) {
                        $info['player_counts'][$player_id]++;
                        if ($info['player_counts'][$player_id] === 3) {
                            $info['players_met'][] = $player_id;
                            $shared_objective_points += 4;
                            $this->incStat(1, "shared_objectives_met", $player_id);
                            switch ($id) {
                                case '5': $this->incStat(4, "jolly_jammer", $player_id); break;
                                case '6': $this->incStat(4, "smear_campaign", $player_id); break;
                                case '7': $this->incStat(4, "star_stemmer", $player_id); break;
                                case '8': $this->incStat(4, "exposure_junkie", $player_id); break;
                                case '13': $this->incStat(4, "flake_freak", $player_id); break;
                                case '14': $this->incStat(4, "pull-up_champion", $player_id); break;
                            }
                        }
                        $shared_objectives_tracker[$id] = $info;
                    }
                    break;

                case '9':
                    if ($board === 'desert') {
                        $hex_map = array(
                            1 => ['1', '2', '3', '4', '5', '6', '7', '8'],
                            2 => ['9', '10', '11', '12', '13', '14', '15'],
                            3 => ['16', '17', '18', '19', '20', '21'],
                            4 => ['22', '23', '24', '25', '26'],
                            5 => ['27', '28', '29', '30'],
                            6 => ['31', '32']
                        );
                    }
                    else if ($board === 'forest') {
                        $hex_map = array(
                            1 => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                            2 => ['11', '12', '13', '14', '15', '16', '17', '18', '19'],
                            3 => ['20', '21', '22', '23', '24', '25', '26', '27'],
                            4 => ['28', '29', '30', '31', '32', '33', '34'],
                            5 => ['35', '36', '37', '38', '39', '40'],
                            6 => ['41', '42', '43']
                        );
                    }
                    $pitches_climbed = $this->getGlobalVariable('pitch_tracker', true)[$player_id];
                    sort($pitches_climbed, SORT_NUMERIC);
                    unset($pitches_climbed[0]);
                    $reverse_map = [];
                    foreach ($hex_map as $key => $sub_array) {
                        foreach ($sub_array as $val) {
                            $reverse_map[$val] = $key;
                        }
                    }
                    $found = false;
                    $found_sequence = [];
                    $pitch_count = count($pitches_climbed);
                    if ($pitch_count >= 4) {
                        for ($i=1; $i<=$pitch_count-3; $i++) {
                            $seq1 = $pitches_climbed[$i];
                            $seq2 = $pitches_climbed[$i+1];
                            $seq3 = $pitches_climbed[$i+2];
                            $seq4 = $pitches_climbed[$i+3];

                            if (
                                (int)$seq2 === (int)$seq1 + 1 &&
                                (int)$seq3 === (int)$seq2 + 1 &&
                                (int)$seq4 === (int)$seq3 + 1
                            ) {
                                $groupkey = $reverse_map[$seq1];
                                if (
                                    $reverse_map[$seq2] === $groupkey &&
                                    $reverse_map[$seq3] === $groupkey &&
                                    $reverse_map[$seq4] === $groupkey
                                ) {
                                    $found = true;
                                    $found_sequence = [$seq1, $seq2, $seq3, $seq4];
                                    break;
                                }
                            }
                        }
                    }
                    if ($found && !in_array($player_id, $info['players_met'])) {
                        $info['players_met'][] = $player_id;
                        $shared_objective_points += 4;
                        $shared_objectives_tracker[$id] = $info;
                        $this->incStat(1, "shared_objectives_met", $player_id);
                        $this->incStat(6, "grand_traverse", $player_id);
                    }
                    break;

                case '10':
                    if ($info['player_counts'][$player_id][$pitch_type] === false) {
                        $info['player_counts'][$player_id][$pitch_type] = true;

                        $types = $info['player_counts'][$player_id];

                        if (count(array_filter($types, fn($v) => $v === true)) === 6) { // if all types are true (or 5 types and The Trifecta)
                            $info['players_met'][] = $player_id;
                            $shared_objective_points += 6;
                            $this->incStat(1, "shared_objectives_met", $player_id);
                            $this->incStat(6, "all-arounding", $player_id);
                        }
                        $shared_objectives_tracker[$id] = $info;
                    }
                    break;

                case '11':
                    if (in_array($selected_pitch, $info['pitches']) && in_array($player_id, $info['players_met'])) {
                        $player_idx = array_search($player_id, $info['players_met']);
                        unset($info['players_met'][$player_idx]);
                        $shared_objective_points += -4;
                        $shared_objectives_tracker[$id] = $info;
                        $this->incStat(-1, "shared_objectives_met", $player_id);
                        $this->incStat(-4, "the_elitist", $player_id);
                    }
                    break;

                case '12':
                    if (in_array($selected_hex, $info['hexes'])) {
                        $info['player_counts'][$player_id]++;
                        $shared_objective_points += 1;
                        $shared_objectives_tracker[$id] = $info;
                        if ($info['player_counts'][$player_id] === 1) { $this->incStat(1, "shared_objectives_met", $player_id); }
                        $this->incStat(1, "a_day_in_the_alpine", $player_id);
                    }
                    break;
            }
        }
        $this->incStat($shared_objective_points, "shared_objectives_points", $player_id);
        $this->setGlobalVariable('shared_objectives_tracker', $shared_objectives_tracker);

        // track personal objectives
        $personal_objectives_tracker = $this->getGlobalVariable('personal_objectives_tracker', true);
        $current_personal_objectives = $personal_objectives_tracker[$player_id];
        foreach ($current_personal_objectives as $objective_id => $indices) {
            $objective = $this->personal_objectives[$objective_id];
            $pitch_ids = $objective['pitch_ids'];
            if (in_array($selected_pitch, $pitch_ids)) {
                $idx = array_search($selected_pitch, $pitch_ids);
                if ($objective_id === 3) {
                    switch($idx) {
                        case 0: case 1: case 2:     $idx = 0; break;
                        case 3: case 4: case 5:     $idx = 1; break;
                        case 6: case 7:             $idx = 2; break;
                        case 8: case 9: case 10:    $idx = 4; break;
                        case 11: case 12: case 13:  $idx = 5; break;
                    }
                }
                if (!in_array($idx, $personal_objectives_tracker[$player_id][$objective_id])) {
                    $personal_objectives_tracker[$player_id][$objective_id][] = $idx;
                }
            }
        }
        $this->setGlobalVariable('personal_objectives_tracker', $personal_objectives_tracker);

        // summit
        $summit_points = 0;
        $summit_hexes = $board === 'desert' ? ['31', '32'] : ['41', '42', '43'];
        if (in_array($selected_hex, $summit_hexes)) {
            $summit_points = 1;
            $this->setStat(true, "climbed_summit", $player_id);
        }

        // track stats
        if ($pitch_type !== 'any') {
            $pitch_type_stat = 'climbed_' . $pitch_type; // pitch type
            $this->incStat(1, $pitch_type_stat, $player_id);
        }
        foreach ($selected_resources as $id) { // played asset cards
            $type_arg = $this->getGlobalVariable('asset_identifier', true)[$id];
            $asset_type = $this->getAssetType($type_arg);
            $asset_type_stat = 'played_' . $asset_type;
            $this->incStat(1, $asset_type_stat, $player_id);
        }
        switch ($pitch_value) { // pitch values
            case 1: $pitch_value_num = 'one'; break;
            case 2: $pitch_value_num = 'two'; break;
            case 3: $pitch_value_num = 'three'; break;
            case 4: $pitch_value_num = 'four'; break;
            case 5: $pitch_value_num = 'five'; break;
        }
        $pitch_value_stat = 'climbed_' . $pitch_value_num . '_star';
        $this->incStat(1, $pitch_value_stat, $player_id);

        $previous_hex = $pitch_tracker[$player_id][count($pitch_tracker[$player_id])-2] ?? '0';
        $ledge = $this->getGlobalVariable('ledge', true);
        $cutoff_arr = $board === 'desert' ? ['21', '22'] : ['27', '28'];
        $current_arr = [$previous_hex, $selected_hex];
        $ledge_teleports = false;

        if (in_array($previous_hex, $ledge) 
            && in_array($selected_hex, $ledge) 
            && ( abs($selected_hex - $previous_hex) > 1 || sort($current_arr) === $cutoff_arr) ) {

                $ledge_teleports = $this->getGlobalVariable('ledge_teleports', true);
                $ledge_teleports[$player_id][] = $selected_hex;
                $this->setGlobalVariable('ledge_teleports', $ledge_teleports);
        }

        $overlap = 0;
        foreach ($pitch_tracker as $player => $pitches) {
            if ($player != $player_id && count($pitches) > 1) {

                if ($this->adjacentInArray($pitches, $previous_hex, $selected_hex)
                    || ($ledge_teleports && in_array($selected_hex, $ledge_teleports[$player]))) {
                    $overlap++;
                }
            }
        }
        if ($overlap) {
            $rope_overlaps = $this->getGlobalVariable('rope_overlaps', true);
            $rope_overlaps[$player_id][$selected_hex] = $overlap;
            $this->setGlobalVariable('rope_overlaps', $rope_overlaps);
        }

        // Rope Gun
        // if ($requirements['water'] > 0 && $character_id === '1') { $requirements['water']--; }

        // Overstoker
        // if ($overstoker) {
        //     $requirements['psych']++;
        //     $current_water = $this->getGlobalVariable('resource_tracker', true)[$player_id]['water'];
        //     if ($requirements['water'] == $current_water + 1) { $requirements['water']--; }
        // }

        // play required resources
        if ($selected_resources) {
            sort($selected_resources);
            $selected_resources_db = self::getCollectionFromDB("SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_id IN (".implode(',', array_map('intval', $selected_resources)).")");
            $selected_resource_types = [];
            foreach (array_values($selected_resources_db) as $asset) {
                array_push($selected_resource_types, $asset['card_type_arg']);
            } 

            $requirements_arr_for_log = [];
            $board_assets = $this->getGlobalVariable('board_assets', true);

            for ($i=1; $i<=count($selected_resources); $i++) {

                $type_arg = $selected_resource_types[$i-1];
                $resource_type = $this->asset_cards[$type_arg]['skills'];
                foreach ($resource_type as $key=>$value) {
                    if ($value) { $type = $key; }
                }
                $this->cards_and_tokens->insertCardOnExtremePosition($selected_resources[$i-1], "{$player_id}_played_{$type}", true);
                $asset_count = $board_assets[$player_id][$type]["count"];

                if ($character_id === '6') { // Young Prodigy
                    $slots = $type === 'gear' ? 5 : 3;
                }
                else { $slots = 4; }

                if ($asset_count >= $slots) {
                    $vacated_slot = 1;
                    $new_slot = $slots;
                    $vacated_card = $board_assets[$player_id][$type][$vacated_slot];

                    $board_assets[$player_id][$type]['tucked'][array_keys($vacated_card)[0]] = array_values($vacated_card)[0];
                    unset($board_assets[$player_id][$type][$vacated_slot][array_keys($vacated_card)[0]]);

                    $this->setGlobalVariable('board_assets', $board_assets);
                    $this->repositionAssetBoard($player_id);
                    $board_assets = $this->getGlobalVariable('board_assets', true);

                    $board_assets[$player_id][$type][$new_slot] = [$selected_resources[$i-1] => $type_arg];
                    $board_assets[$player_id][$type]['flipped'][$new_slot] = false;
                }
                else if ($asset_count < $slots) {
                    $board_assets[$player_id][$type][$asset_count+1][$selected_resources[$i-1]] = $type_arg;
                    $board_assets[$player_id][$type]['flipped'][$asset_count+1] = false;
                }
                $board_assets[$player_id][$type]["count"]++;

                $asset_title = $this->asset_cards[$type_arg]['description'];
                array_push($requirements_arr_for_log, "[{$asset_title}({$type_arg})]");
            }
            if ($requirements['water'] > 0 && !$extra_water) {
                $water_for_log = $requirements['water'] . ' water';
                array_push($requirements_arr_for_log, $water_for_log);
            }
            if ($requirements['psych'] > 0) {
                $psych_for_log = $requirements['psych'] . ' psych';
                array_push($requirements_arr_for_log, $psych_for_log);
            }

            $requirements_for_log = '';
            for ($i=0; $i<=count($requirements_arr_for_log)-1; $i++) {
                if (count($requirements_arr_for_log) === 2 && $i === 0) { $requirements_for_log .= $requirements_arr_for_log[$i] . ' '; }
                else if ($i < count($requirements_arr_for_log)-1) { $requirements_for_log .= $requirements_arr_for_log[$i] . ', '; }
                else if (count($requirements_arr_for_log) > 1) { $requirements_for_log .= 'and ' . $requirements_arr_for_log[$i]; }
                else if (count($requirements_arr_for_log) === 1) { $requirements_for_log .= $requirements_arr_for_log[$i]; }
            }

            // update resource_tracker
            $water = ($requirements['water'] != 0 && !$extra_water) ? $requirements['water'] : null;
            $psych = ($requirements['psych'] != 0) ? $requirements['psych'] : null;
            $this->updateResourceTracker($player_id, 'subtract', $water, $psych, $selected_resource_types, null, false, true);
            $this->setGlobalVariable('board_assets', $board_assets);
            if ($water) { $this->incStat($water, "water_spent", $player_id); }
            if ($psych) { $this->incStat($psych, "psych_spent", $player_id); }

        } else { 

            if ($requirements['water'] > 0 || $requirements['psych'] > 0) {
                $requirements_arr_for_log = [];
                if ($requirements['water'] > 0 && !$extra_water) {
                    $water_for_log = $requirements['water'] . ' water';
                    array_push($requirements_arr_for_log, $water_for_log);
                }
                if ($requirements['psych'] > 0) {
                    $psych_for_log = $requirements['psych'] . ' psych';
                    array_push($requirements_arr_for_log, $psych_for_log);
                }
                $requirements_for_log = '';
                for ($i=0; $i<=count($requirements_arr_for_log)-1; $i++) {
                    if (count($requirements_arr_for_log) === 2 && $i === 0) { $requirements_for_log .= $requirements_arr_for_log[$i] . ' '; }
                    else if ($i < count($requirements_arr_for_log)-1) { $requirements_for_log .= $requirements_arr_for_log[$i] . ', '; }
                    else if (count($requirements_arr_for_log) > 1) { $requirements_for_log .= 'and ' . $requirements_arr_for_log[$i]; }
                    else if (count($requirements_arr_for_log) === 1) { $requirements_for_log .= $requirements_arr_for_log[$i]; }
                }

                $water = ($requirements['water'] != 0 && !$extra_water) ? $requirements['water'] : null;
                $psych = ($requirements['psych'] != 0) ? $requirements['psych'] : null;
                $this->updateResourceTracker($player_id, 'subtract', $water, $psych, [], null, false, true);
                if ($water) { $this->incStat($water, "water_spent", $player_id); }
                if ($psych) { $this->incStat($psych, "psych_spent", $player_id); }
            }

            else { $requirements_for_log = 'nothing'; }
            
            $selected_resource_types = [];
            $selected_resources_db = [];
        }

        $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
        if ($selected_summit_betas) {

            $requirements_for_log .= ' and ';
            foreach ($selected_summit_betas as $type_arg) {

                $token_id = array_search($type_arg, $hand_sb_tokens);
                $this->cards_and_tokens->insertCardOnExtremePosition($token_id, 'summit_beta_discard', true);
                $this->incStat(1, "played_summit_beta_tokens", $player_id);

                $token = $this->summit_beta_tokens[$type_arg];
                $token_name = $token['description'];
                $requirements_for_log .= '+' . $token_name . '(' . $type_arg . ')+, ';
            }
            $requirements_for_log = substr($requirements_for_log, 0, -2);
        }

        $tokens_for_log = '';
        foreach ($selected_tokens as $type => $num) {
            if ($num > 0) { $tokens_for_log .= $num . ' ' . ucfirst($type) . ', '; }
        }
        if ($tokens_for_log != '') {
            $tokens_for_log = 'uses ' . $tokens_for_log;
            $tokens_for_log = substr($tokens_for_log, 0, -2);
            $tokens_for_log .= ' Permanent Asset Token(s) and ';
        }

        $pitch = $this->pitches[$selected_pitch]['description'];
        $pitch_for_log = '{' . $pitch . '(' . $selected_pitch . ')}';

        $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];
        $player_water_psych = $this->getGlobalVariable('water_psych_tracker')->$player_id;
        $water_psych_requirements = array('water' => $requirements['water'], 'psych' => $requirements['psych']);

        // points
        $already_climbed = 0;
        foreach(array_keys($players) as $id_num) {
            $id = strval($id_num);
            if ($id != $player_id && in_array($selected_hex, $pitch_tracker[$id])) { $already_climbed++; }
        }
        $pitch_points = $pitch_value - $already_climbed;
        if ($already_climbed > 0) { $this->incStat(1, "previously_climbed_pitches", $player_id); }
        if ($pitch_points < 0) { $pitch_points = 0; }
        $new_points = $pitch_points + $shared_objective_points + $summit_points;
        $this->DbQuery("UPDATE player SET player_score=player_score+'$new_points' WHERE player_id='$player_id'");
        $score_tracker = $this->getGlobalVariable('score_tracker', true);
        $score_tracker[$player_id]['pitches'] += $pitch_points;
        $score_tracker[$player_id]['objectives'] += $shared_objective_points;
        $score_tracker[$player_id]['summit'] += $summit_points;
        $this->setGlobalVariable('score_tracker', $score_tracker);

        self::notifyAllPlayers("confirmOpponentRequirements", clienttranslate('${player_name} ${tokens_for_log}spends ${requirements_for_log} and climbs ${pitch_for_log}'), array(
                'player_name' => self::getActivePlayerName(),
                'board_assets' => $this->getGlobalVariable('board_assets', true),
                'tokens_for_log' => $tokens_for_log,
                'requirements_for_log' => $requirements_for_log,
                'pitch_for_log' => $pitch_for_log,
                'player_id' => $player_id,
                'selected_resource_types' => $selected_resource_types,
                'selected_resources' => $selected_resources,
                'hand_count' => count($this->getHandAssets($player_id)),
                'selected_pitch' => $selected_pitch,
                'player_water_psych' => $player_water_psych,
                'water_psych_requirements' => $water_psych_requirements,
                'selected_summit_betas' => $selected_summit_betas,
                'new_points' => $new_points,
                'shared_objectives_tracker' => $shared_objectives_tracker,
                'pitch_rope_order' => $pitches_rope_order[$selected_hex],
                'preserve' => ['player_id'],
        ));

        self::notifyPlayer($player_id, "confirmYourRequirements", clienttranslate('${player_name} ${tokens_for_log}spends ${requirements_for_log} and climbs ${pitch_for_log}'), array(
                'player_name' => self::getActivePlayerName(),
                'board_assets' => $this->getGlobalVariable('board_assets', true),
                'tokens_for_log' => $tokens_for_log,
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
                'selected_summit_betas' => $selected_summit_betas,
                'new_points' => $new_points,
                'shared_objectives_tracker' => $shared_objectives_tracker,
                'pitch_rope_order' => $pitches_rope_order[$selected_hex],
        ));

        // check for and resolve Spider Stick
        if (in_array('12', array_values($hand_sb_tokens)) && $this->pitches[$selected_pitch]['value'] < 3) {

            $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
            $spider_stick_id = array_search('12', $hand_sb_tokens);
            $this->cards_and_tokens->insertCardOnExtremePosition($spider_stick_id, 'summit_beta_discard', true);
            $this->incStat(1, "played_summit_beta_tokens", $player_id);

            $asset_board_token_tracker = $this->getGlobalVariable('asset_board_token_tracker', true);
            $asset_board_token_tracker[$player_id]['points_tokens'] += 1;
            $this->setGlobalVariable('asset_board_token_tracker', $asset_board_token_tracker);

            $this->DbQuery("UPDATE player SET player_score=player_score+2 WHERE player_id='$player_id'");
            $score_tracker = $this->getGlobalVariable('score_tracker', true);
            $score_tracker[$player_id]['tokens'] += 2;
            $this->setGlobalVariable('score_tracker', $score_tracker);

            self::notifyAllPlayers("useSpiderStick", clienttranslate('${player_name} uses +Spider Stick(12)+ while climbing a 1 or 2 point Pitch and gains a 2-Point Token'), [
                'player_name' => self::getActivePlayerName(),
                'player_id' => $player_id,
                'token_id' => array_search('12', $this->getGlobalVariable('token_identifier', true)),
            ]);
        }

        $this->setGlobalVariable('risk_pitches', []);

        // Cool-Headed Crimper
        if ($character_id === '10') {

            $climbing_card_info_1 = $this->cards_and_tokens->pickCardForLocation('climbing_deck', 'in_play');
            $climbing_card_info_2 = $this->cards_and_tokens->pickCardForLocation('climbing_deck', 'in_play');
            $this->setGlobalVariable('crimper_cards', [$climbing_card_info_1, $climbing_card_info_2]);
            self::notifyAllPlayers("crimperDrawsClimbingCards", '', [
                    'climbing_card_info_1' => $climbing_card_info_1,
                    'climbing_card_info_2' => $climbing_card_info_2,
            ]);
            $this->undoSavepoint();
            $this->gamestate->nextState('crimperClimbingCards');
        }

        else { // non Cool-Headed Crimper characters

            $climbing_card_info = $this->cards_and_tokens->pickCardForLocation('climbing_deck', 'in_play');
            $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
            self::notifyAllPlayers("drawClimbingCard", '', array(
                    'climbing_card_info' => $climbing_card_info,
            ));
            $climbing_card_type_arg = $climbing_card_info['type_arg'];
            $this->setGlobalVariable('risk_it_info', []);
            $this->setGlobalVariable('risked_requirements', []);
            $this->undoSavepoint();
            if (in_array($climbing_card_type_arg, ['2', '6', '36', '41', '50', '54', '63'])) {

                $this->gamestate->nextState('addTokenToPitch');

            } else { $this->gamestate->nextState('drawClimbingCard'); }
        }
    }

    function riskIt($requirements, $selected_resources, $selected_tokens, $selected_summit_betas, $selected_hex, $selected_pitch, $extra_water) {
        self::checkAction('riskIt');
        $player_id = self::getActivePlayerId();
        $character_id = $this->getGlobalVariable('player_names_and_colors', true)[$player_id]['character'];
        $resource_tracker = $this->getGlobalVariable('resource_tracker', true)[$player_id];
        $resource_tracker['skills']['any_asset'] = array_sum($resource_tracker['skills']);
        $resource_tracker['skills']['any_skill'] = array_sum($resource_tracker['skills']) - $resource_tracker['skills']['gear'] - $resource_tracker['skills']['any_asset'];
        $pitch_requirements = $requirements;
        $this->setGlobalVariable('risk_it', true);
        $this->setGlobalVariable('risked_assets', $selected_resources);
        $pitch_tracker = $this->getGlobalVariable('pitch_tracker')->$player_id;
        $current_pitch = end($pitch_tracker);
        $board = $this->getGlobalVariable('board');
        $risk_pitches = [$selected_hex, ...$this->getAvailablePitches($current_pitch, $board)];
        $this->setGlobalVariable('risk_pitches', $risk_pitches);
        $this->incStat(1, "risky_climbs", $player_id);

        $pitch = $this->pitches[$selected_pitch]['description'];
        $pitch_for_log = '{' . $pitch . '(' . $selected_pitch . ')}';
        $risk_log = '${player_name} takes a risk in attempting ${pitch_for_log}';

        self::notifyAllPlayers("riskShowAssets", clienttranslate($risk_log), array(
            'player_name' => self::getActivePlayerName(),
            'pitch_for_log' => $pitch_for_log,
            'player_id' => $player_id,
            'selected_resources' => $selected_resources,
        ));

        $face_rolled = bga_rand(1, 3);
        // $face_rolled = 3;

        $requirements_num = 0;
        foreach ($pitch_requirements as $type => $num) {

            if (in_array($type, ['gear', 'face', 'crack', 'slab', 'any_skill', 'any_asset'])) {

                for ($i=1; $i<=$num; $i++) {
                    if ($resource_tracker['skills'][$type] > 0) { $resource_tracker['skills'][$type]--; }
                    if ($type != 'gear' && $resource_tracker['skills']['any_skill'] > 0) { $resource_tracker['skills']['any_skill']--; }
                    if ($resource_tracker['skills']['any_asset'] > 0) { $resource_tracker['skills']['any_asset']--; }
                    if ($type === 'any_skill' || $type === 'any_asset') {

                        $arr = $type === 'any_skill' ? ['face', 'crack', 'slab'] : ['gear', 'face', 'crack', 'slab'];
                        foreach ($arr as $skill) {
                            if ($resource_tracker['skills'][$skill] > 0) {

                                $resource_tracker['skills'][$skill]--;
                                break;
                            }
                        }
                    }
                }

                $requirements_num++;
            }
        }
        $hand_cards = array_sum($resource_tracker['skills']);
        $board_cards = array_sum($resource_tracker['asset_board']['skills']);
        $available_cards = $hand_cards + $board_cards;

        switch($face_rolled) {

            case 1: $die_log = '${player_name} rolls a checkmark and successfully climbs the pitch'; break;
            case 2: 
                if ($available_cards >= 2) {
                    $die_log = '${player_name} rolls -2 Cards and will choose an opponent and give them 2 Asset Cards';
                }
                else {
                    $die_log = '${player_name} rolls -2 Cards but does not have 2 cards to give. They must retreat and will draw only 1 card during the next Rerack Phase';
                }
                break;
            case 3: 
                if ($available_cards >= 1 && $resource_tracker['psych'] >= 1 + $requirements['psych']) {
                    $die_log = '${player_name} rolls -1 Card and -1 Psych and will choose an opponent and give them 1 Asset Card and 1 Psych';
                }
                else {
                    if ($resource_tracker['psych'] === $requirements['psych']) {
                        $die_log = '${player_name} rolls -1 Card and -1 Psych but they would need that Psych to climb the pitch. They must retreat and will draw only 1 card during the next Rerack Phase';
                    } else {
                        $die_log = '${player_name} rolls -1 Card and -1 Psych but they do not have the required resources. They must retreat and will draw only 1 card during the next Rerack Phase';
                    }
                }
                break;
        }

        $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
        $risk_summit_beta = !empty(array_intersect(['1', '4', '7', '11'], $hand_sb_tokens)) ? true : false;

        self::notifyAllPlayers("rollDie", '', array(
            'face_rolled' => $face_rolled,
            'climbing_card_info' => [],
            'risky_climb' => true,
            'risk_summit_beta' => $risk_summit_beta,
        ));

        self::notifyAllPlayers("log_only", clienttranslate($die_log), array(
            'player_name' => self::getActivePlayerName(),
        ));

        if ($face_rolled === 1) { // checkmark

            $this->setGlobalVariable('risked_assets', []);
            $this->confirmRequirements($requirements, $selected_resources, $selected_tokens, $selected_summit_betas, $selected_hex, $selected_pitch, $extra_water);
        }

        else if ($face_rolled === 2) { // 2 cards

            if (!empty(array_intersect(['1', '4', '7', '11'], $hand_sb_tokens))) {

                $this->setGlobalVariable('face_rolled', 2);
                $this->setGlobalVariable('risked_requirements', [$requirements, $selected_resources, $selected_tokens, $selected_summit_betas, $selected_hex, $selected_pitch, $extra_water]);
                $this->setGlobalVariable('riskSummitBetaFace', 2);
                $this->gamestate->nextState('riskSummitBeta');
            }

            else if ($available_cards >= 2) {

                $this->setGlobalVariable('risked_requirements', [$requirements, $selected_resources, $selected_tokens, $selected_summit_betas, $selected_hex, $selected_pitch, $extra_water]);
                $this->setGlobalVariable('risk_it_info', [2]);
                $this->gamestate->nextState('selectOpponent');
            }

            else {

                $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                $rerack_1[] = $player_id;
                $this->setGlobalVariable('rerack_1', $rerack_1);
                $this->incStat(1, "times_retreated", $player_id);
                self::notifyAllPlayers('riskReturnAssets', '', []);
                $this->setGlobalVariable('risked_assets', []);
                $this->setGlobalVariable('risk_it_info', []);

                $this->gamestate->nextState('nextClimb');
            }
        }

        else if ($face_rolled === 3) { // 1 card and 1 psych

            if (!empty(array_intersect(['1', '4', '7', '11'], $hand_sb_tokens))) {
                
                $this->setGlobalVariable('face_rolled', 3);
                $this->setGlobalVariable('risked_requirements', [$requirements, $selected_resources, $selected_tokens, $selected_summit_betas, $selected_hex, $selected_pitch, $extra_water]);
                $this->setGlobalVariable('riskSummitBetaFace', 3);
                $this->gamestate->nextState('riskSummitBeta');
            }

            else if ($available_cards >= 1 && $resource_tracker['psych'] >= 1 + $requirements['psych']) {

                $this->setGlobalVariable('risked_requirements', [$requirements, $selected_resources, $selected_tokens, $selected_summit_betas, $selected_hex, $selected_pitch, $extra_water]);
                $this->setGlobalVariable('risk_it_info', [3]);
                $this->gamestate->nextState('selectOpponent');
            }

            else {

                $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                $rerack_1[] = $player_id;
                $this->setGlobalVariable('rerack_1', $rerack_1);
                $this->incStat(1, "times_retreated", $player_id);
                self::notifyAllPlayers('riskReturnAssets', '', []);
                $this->setGlobalVariable('risked_assets', []);
                $this->setGlobalVariable('risk_it_info', []);

                $this->gamestate->nextState('nextClimb');
            }
        }
    }

    function confirmTrade($traded_resources, $portaledge_to_draw) {
        self::checkAction('confirmTrade');

        $player_id = self::getActivePlayerId();
        $type_arg_arr = [];
        $discard_arr = [];
        foreach ($traded_resources as $id) {
            $type_arg = $this->getGlobalVariable('asset_identifier', true)[$id];
            array_push($type_arg_arr, $type_arg);
            array_push($discard_arr, [$id, $type_arg]);
            $this->cards_and_tokens->playCard($id);
            $this->updateAssetDiscard($id, $type_arg, 'add');
        }
        $discard_type = $this->getAssetType($type_arg_arr[0]);

        $this->updateResourceTracker($player_id, 'subtract', null, null, $type_arg_arr);

        $deck_location = 'porta' . $portaledge_to_draw;
        $last_card = [];
        $remaining_cards = self::getCollectionFromDB("SELECT card_id FROM cards_and_tokens WHERE card_location='$deck_location'");
        if (count($remaining_cards) === 1) { $last_card[$portaledge_to_draw] = 1; }
        $drawn_card = $this->drawFromPortaledge($player_id, $portaledge_to_draw, 1, $remaining_cards);
        $drawn_id = $drawn_card['id'];
        $drawn_type_arg = $drawn_card['type_arg'];

        $this->updateResourceTracker($player_id, 'add', null, null, [$drawn_card['type_arg']]);

        $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];
        $hand_count = count($this->getHandAssets($player_id));
        $refill_portaledge = $this->getGlobalVariable('refill_portaledge', true);
        $drawn_for_log = ucfirst($portaledge_to_draw);
        $discard_for_log = ucfirst($discard_type);
        $drawn_name = $this->asset_cards[$drawn_type_arg]['description'];
        $drawn_private = "[{$drawn_name}({$drawn_type_arg})]";

        self::notifyAllPlayers('confirmTradePublic', clienttranslate('${player_name} trades 3 ${discard_for_log} Assets and draws 1 ${drawn_for_log} Asset from The Portaledge'), [
            'player_name' => self::getActivePlayerName(),
            'discard_for_log' => $discard_for_log,
            'drawn_for_log' => $drawn_for_log,
            'player_id' => $player_id,
            'discard_arr' => $discard_arr,
            'drawn_type' => $portaledge_to_draw,
            'hand_count' => $hand_count,
            'last_card' => $last_card,
            'refill_portaledge' => $refill_portaledge,
            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
            'preserve' => ['player_id'],
        ]);

        self::notifyPlayer($player_id, 'confirmTradePrivate', clienttranslate('${player_name} trades 3 ${discard_for_log} Assets and draws ${drawn_private} from The Portaledge'), [
            'player_name' => self::getActivePlayerName(),
            'discard_for_log' => $discard_for_log,
            'drawn_private' => $drawn_private,
            'player_resources' => $player_resources,
            'discard_arr' => $discard_arr,
            'drawn_id' => $drawn_id,
            'drawn_type_arg' => $drawn_type_arg,
            'hand_count' => $hand_count,
            'last_card' => $last_card,
            'refill_portaledge' => $refill_portaledge,
            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
        ]);
    }

    function rest($player_id) {
        self::checkAction('rest');

        $rested = $this->getGlobalVariable('rested', true);
        $rested[] = $player_id;
        $this->setGlobalVariable('rested', $rested);
        $this->incStat(1, 'times_rested', $player_id);

        self::notifyAllPlayers('log_only', clienttranslate('${player_name} rested'), array(
            'player_name' => self::getActivePlayerName(),
        ));

        $this->gamestate->nextState('nextClimb');
    }

    function confirmClimbingCardChoice($choice, $card_id, $card_type, $jesus_piece) {
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

        if ($jesus_piece && $water < 0) {
            $water = 0;
            $water_psych_for_climbing['water'] = 0;
        }
        else if ($jesus_piece && $psych < 0) {
            $psych = 0;
            $water_psych_for_climbing['psych'] = 0;
        }

        if (array_key_exists('all', $choice_args) && !in_array($card_type, ['29', '66'])) {

            foreach(array_keys($names_and_colors) as $id) { $this->updateResourceTracker($id, 'add', $water, $psych); }

        } else { $this->updateResourceTracker($player_id, 'add', $water, $psych); }

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $climbing_card_info['choice'] = $choice;
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
        // jesus piece
        if ($jesus_piece) {
            $discard = false;
            $discard_type = null;
            $discard_num = null;
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
        if ($jesus_piece) { $give_assets = false; }
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

                if ($jesus_piece) {
                    self::notifyAllPlayers("discardJesusPiece", clienttranslate('${player_name} uses +Jesus Piece(10)+ to avoid the negative effect'), array(
                        'player_name' => self::getActivePlayerName(),
                        'player_id' => $player_id,
                    ));

                    $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
                    $jesus_piece_id = array_search('10', $hand_sb_tokens);
                    $this->cards_and_tokens->insertCardOnExtremePosition($jesus_piece_id, 'summit_beta_discard', true);
                    $this->incStat(1, "played_summit_beta_tokens", $player_id);
                }

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

                if ($jesus_piece) {
                    self::notifyAllPlayers("discardJesusPiece", clienttranslate('${player_name} uses +Jesus Piece(10)+ to avoid the negative effect'), array(
                        'player_name' => self::getActivePlayerName(),
                        'player_id' => $player_id,
                    ));

                    $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
                    $jesus_piece_id = array_search('10', $hand_sb_tokens);
                    $this->cards_and_tokens->insertCardOnExtremePosition($jesus_piece_id, 'summit_beta_discard', true);
                    $this->incStat(1, "played_summit_beta_tokens", $player_id);
                }
                
                if (array_key_exists('portaledge_all', $climbing_card_info) || array_key_exists('opponents_only', $climbing_card_info)) {
                    $this->setGlobalVariable('next_climber', $this->getPlayerAfter($player_id));
                }
                if (array_key_exists('opponents_only', $climbing_card_info)) {
                    $this->gamestate->nextState('portaledgeAll');
                } else { $this->gamestate->nextState('selectPortaledge'); }
                break;

            case $risk_die:
                $face_rolled = bga_rand(1, 3);
                // $face_rolled = 2;

                $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
                $lucky_chalkbag = array_search('11', $hand_sb_tokens) ? true : false;

                self::notifyAllPlayers("rollDie", '', array(
                    'face_rolled' => $face_rolled,
                    'climbing_card_info' => $climbing_card_info,
                    'risky_climb' => false,
                ));
                $climbing_card_info['face_rolled'] = $face_rolled;
                $available_assets = count($this->getHandAssets($player_id)) + count($this->getBoardAssets($player_id));

                self::notifyAllPlayers("log_only", clienttranslate($climbing_log_all), array(
                    'player_name' => self::getActivePlayerName(),
                    'climbing_card_for_log' => $climbing_card_for_log,
                    'choice_flavor' => $choice_flavor_for_log,
                    'choice_effect' => $choice_effect_for_log,
                ));

                if ($face_rolled === 1) { // checkmark

                    $climbing_card_info['portaledge_num'] = 3;
                    $climbing_card_info['final_state'] = 'selectPortaledge';
                    self::notifyAllPlayers("log_only", clienttranslate('${player_name} rolls a checkmark and will draw 3 cards from the Portaledge'), array(
                        'player_name' => self::getActivePlayerName(),
                    ));
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('selectPortaledge');
                }

                else if ($face_rolled === 2) { // -2 cards

                    if ($available_assets > 1) { $die_log = clienttranslate('${player_name} rolls -2 Cards and will choose an opponent and give them 2 Asset Cards'); }
                    else if ($available_assets < 2) { $die_log = clienttranslate('${player_name} rolls -2 Cards but does not have 2 cards to give. They will draw only 1 card during the next Rerack Phase'); }

                    $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
                    if (array_search('11', $hand_sb_tokens)) {
                        self::notifyAllPlayers("log_only", $die_log, array(
                            'player_name' => self::getActivePlayerName(),
                        ));
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->setGlobalVariable('riskSummitBetaFace', 2);
                        $this->gamestate->nextState('riskSummitBeta');
                    }

                    else if ($available_assets > 1) {
                        $climbing_card_info['discard_num'] = 2;
                        $climbing_card_info['titlebar_message_opponent'] = 'get 2 of his Asset Cards';
                        $climbing_card_info['titlebar_message'] = 'get 2 of your Asset Cards';
                        $climbing_card_info['give_opponent'] = true;
                        self::notifyAllPlayers("log_only", $die_log, array(
                            'player_name' => self::getActivePlayerName(),
                        ));
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('selectOpponent');

                    } else if ($available_assets < 2) {
                        $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                        $rerack_1[] = $player_id;
                        $this->setGlobalVariable('rerack_1', $rerack_1);
                        self::notifyAllPlayers("log_only", $die_log, array(
                                'player_name' => self::getActivePlayerName(),
                        ));
                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->gamestate->nextState('nextClimb');
                    }

                } else if ($face_rolled === 3) { // -1 card and -1 psych

                    $player_psych = $this->getGlobalVariable('water_psych_tracker', true)[$player_id]['psych'];
                    $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
                    if (array_search('11', $hand_sb_tokens)) {
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->setGlobalVariable('riskSummitBetaFace', 3);
                        $this->gamestate->nextState('riskSummitBeta');
                    }

                    else if ($available_assets > 0 && $player_psych > 0) {
                        $climbing_card_info['discard_num'] = 1;
                        $climbing_card_info['give_psych'] = true;
                        $climbing_card_info['titlebar_message_opponent'] = 'get 1 of his Asset Cards and 1 of his Psych';
                        $climbing_card_info['titlebar_message'] = 'get 1 of your Asset Cards and 1 of your Psych';
                        $climbing_card_info['give_opponent'] = true;
                        self::notifyAllPlayers("log_only", clienttranslate('${player_name} rolls -1 Card and -1 Psych and will choose an opponent and give them 1 Asset Card and 1 Psych'), array(
                                'player_name' => self::getActivePlayerName(),
                        ));
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('selectOpponent');

                    } else if ($available_assets < 1 || $player_psych < 1) {
                        $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                        $rerack_1[] = $player_id;
                        $this->setGlobalVariable('rerack_1', $rerack_1);
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
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('selectOpponent');
                        break;

                    case 19:
                        $summit_beta_tokens = $this->cards_and_tokens->getCardsOnTop(2, 'summit_beta_supply');
                        $climbing_card_info['summit_beta_tokens'] = $summit_beta_tokens;

                        self::notifyAllPlayers('summitBetaChoices', '', [
                            'summit_beta_tokens' => $summit_beta_tokens,
                        ]);

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
                                        'preserve' => ['player_id'],
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

                        self::notifyPlayer($player_id, "climbingCards15And24Public", "", array(
                            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                        ));

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
                                    $other_opponents .= '@' . $other_opponents_names[$i] . '@';
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
                                    'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                                ));
                            }
                        }

                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->gamestate->nextState('nextClimb');
                        break;

                    case 28:
                    case 30:
                    case 40:
                        $climbing_card_info['types'] = $choice_args['types'];
                        $climbing_card_info['types_message'] = $choice_args['types_message'];
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('addAssetToAssetBoard');
                        break;

                    default:
                        $this->bespokeClimbingCard($player_id, $climbing_card_info['type_arg'], $choice, $jesus_piece);
                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->gamestate->nextState('nextClimb');
                }
                break;

            default:

                if ($jesus_piece && $card_type === '65' && $choice === 'a') {
                    self::notifyAllPlayers("discardJesusPiece", clienttranslate('${player_name} uses +Jesus Piece(10)+ to avoid the negative effect'), array(
                        'player_name' => self::getActivePlayerName(),
                        'player_id' => $player_id,
                    ));

                    $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
                    $jesus_piece_id = array_search('10', $hand_sb_tokens);
                    $this->cards_and_tokens->insertCardOnExtremePosition($jesus_piece_id, 'summit_beta_discard', true);
                    $this->incStat(1, "played_summit_beta_tokens", $player_id);
                }

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
                    'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                    'preserve' => ['player_id'],
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
                    'asset_discard' => $this->getGlobalVariable('asset_discard', true),
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

                if ($jesus_piece && !($card_type === '65' && $choice === 'a')) {
                    self::notifyAllPlayers("discardJesusPiece", clienttranslate('${player_name} uses +Jesus Piece(10)+ to avoid the negative effect'), array(
                        'player_name' => self::getActivePlayerName(),
                        'player_id' => $player_id,
                    ));

                    $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
                    $jesus_piece_id = array_search('10', $hand_sb_tokens);
                    $this->cards_and_tokens->insertCardOnExtremePosition($jesus_piece_id, 'summit_beta_discard', true);
                    $this->incStat(1, "played_summit_beta_tokens", $player_id);
                }
                if ($jesus_piece && $card_type === '12' && $choice === 'a') { // Tricky Boulder Problem
                    $this->gamestate->nextState('chooseTechniqueToken');
                    break;
                }
                if ($jesus_piece && $card_type === '57' && $choice === 'b') { // Missed the Belay
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState("drawAssets");
                    break;
                }
                if ($jesus_piece && in_array($card_type, ['23', '26']) && $choice === 'b') {
                    $climbing_card_info['types'] = $this->climbing_cards[$card_type]['b_args']['types'];
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('stealFromAssetBoard');
                    break;
                }

                if ($jesus_piece // give assets
                    && ( (in_array($card_type, ['25', '65', '68']) && $choice === 'a')
                    || (in_array($card_type, ['31', '45', '53']) && $choice === 'b') )) {

                        if ($choice_args['benefit'] == 'summitBetaToken') {
                            $climbing_card_private = [
                                'summit_beta_token' => $summit_beta_token,
                                'summit_beta_for_log' => $summit_beta_for_log,
                            ];
                        }
        
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        if ($choice_args['benefit'] == 'summitBetaToken') { $this->setGlobalVariable('climbing_card_private', $climbing_card_private); }

                        switch ($card_type) {

                            case '25':
                            case '45':
                                self::notifyAllPlayers("confirmSummitBetaOpponent", clienttranslate('${player_name} gains a Summit Beta token'), array(
                                        'player_name' => self::getActivePlayerName(),
                                        'player_id' => $player_id,
                                        'opponent_id' => false,
                                        'preserve' => ['player_id', 'opponent_id'],
                                ));
            
                                self::notifyPlayer($player_id, "confirmSummitBeta", clienttranslate('${player_name} gains ${summit_beta_for_log}'), array(
                                        'player_name' => self::getActivePlayerName(),
                                        'player_id' => $player_id,
                                        'opponent_id' => false,
                                        'hand_summit_beta_tokens' => $this->getHandSummitBetaTokens($player_id),
                                        'summit_beta_token' => $climbing_card_private['summit_beta_token'],
                                        'summit_beta_for_log' => $climbing_card_private['summit_beta_for_log'],
                                ));
                                $this->cards_and_tokens->insertCardOnExtremePosition($card_id, 'climbing_discard', true);
                                $this->setGlobalVariable('climbing_card_info', array());
                                $this->gamestate->nextState('nextClimb');
                                break;

                            case '65':
                                $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                                $this->setGlobalVariable('climbing_card_info', array());
                                $this->gamestate->nextState('nextClimb');
                                break;
                        }
                        break;
                }

                if ($gain_summit_beta_token) {
                    self::notifyAllPlayers("confirmSummitBetaOpponent", clienttranslate('${player_name} gains a Summit Beta token'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                            'opponent_id' => false,
                            'preserve' => ['player_id', 'opponent_id'],
                    ));

                    self::notifyPlayer($player_id, "confirmSummitBeta", clienttranslate('${player_name} gains ${summit_beta_for_log}'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                            'opponent_id' => false,
                            'hand_summit_beta_tokens' => $this->getHandSummitBetaTokens($player_id),
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
                            'preserve' => ['player_id'],
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
        if ($this->getGlobalVariable('bomber_anchor')) {
            $climbing_card_info_bak = $climbing_card_info;
            $climbing_card_info = [];
        }
        $risk_it_info = $this->getGlobalVariable('bomber_anchor') ? false : $this->getGlobalVariable('risk_it_info', true);

        $hand_card_arr = !empty($hand_card_ids) ? explode(',', $hand_card_ids) : array();
        $board_card_arr = !empty($board_card_ids) ? explode(',', $board_card_ids) : array();
        $board_assets = !empty($board_card_ids) || !empty($tucked_card_nums) ? $this->getGlobalVariable('board_assets', true) : array();
        $card_id_arr = array_merge($hand_card_arr, $board_card_arr);

        $tucked_card_types_arr = !empty($tucked_card_types) ? explode(' ', $tucked_card_types) : [];
        $tucked_card_nums_arr = !empty($tucked_card_types_arr) ? explode(',', $tucked_card_nums) : [];
        $tucked_card_discard = array_combine($tucked_card_types_arr, $tucked_card_nums_arr);

        $hand_card_type_arr = [];
        foreach($hand_card_arr as $id) {
            $card_type_arg = $this->getGlobalVariable('asset_identifier', true)[$id];
            array_push($hand_card_type_arr, $card_type_arg);
            if ( !($climbing_card_info && $climbing_card_info['give_opponent'] === true) && !$risk_it_info ) {
                $this->updateAssetDiscard($id, $card_type_arg, 'add');
            }
        }

        $board_card_type_arr = [];
        $flipped_and_tucked_type_args = [];
        $flipped_ids = [];
        $untucked_cards = ['gear' => [], 'face' => [], 'crack' => [], 'slab' => []];
        foreach($board_card_arr as $id) {
            $card_type_arg = $this->getGlobalVariable('asset_identifier', true)[$id];
            $card_type = $this->getAssetType($card_type_arg);
            array_push($board_card_type_arr, $card_type_arg);

            foreach ($board_assets[$player_id][$card_type] as $key => $val) {

                if (gettype($val) == "array" && in_array($id, array_keys($val))) {

                    $slot = $key;
                    unset($board_assets[$player_id][$card_type][$slot][$id]);
                    if ($board_assets[$player_id][$card_type]['flipped'][$slot]) { 
                        array_push($flipped_and_tucked_type_args, $card_type_arg);
                        array_push($flipped_ids, $id);
                    }
                    $board_assets[$player_id][$card_type]['flipped'][$slot] = null;

                    $current_tucked = count($board_assets[$player_id][$card_type]['tucked']);
                    $tucked_to_discard = $tucked_card_discard[$card_type] ?? 0;

                    if ($current_tucked > $tucked_to_discard) {

                        $random_tucked_id = array_rand($board_assets[$player_id][$card_type]['tucked']);
                        $random_tucked_type_arg = $this->getGlobalVariable('asset_identifier', true)[$random_tucked_id];
                        $board_assets[$player_id][$card_type][$slot][$random_tucked_id] = $random_tucked_type_arg;
                        $board_assets[$player_id][$card_type]['flipped'][$slot] = true;
                        unset($board_assets[$player_id][$card_type]['tucked'][$random_tucked_id]);
                        $type_arr = $board_assets[$player_id][$card_type];
                        $board_assets[$player_id][$card_type] = $this->sortAssetBoardByFlipped($type_arr);
                    }
                }
            }
            $board_assets[$player_id][$card_type]["count"]--;
            if ( !($climbing_card_info && $climbing_card_info['give_opponent'] === true) && !$risk_it_info ) {
                $this->updateAssetDiscard($id, $card_type_arg, 'add');
            }
        }

        $tucked_card_ids = [];
        $tucked_card_type_args = [];
        foreach($tucked_card_discard as $type => $num) {
            for ($i=1; $i<=$num; $i++) {
                $tucked_cards = $board_assets[$player_id][$type]['tucked'];
                $random_tucked_id = array_rand($tucked_cards);
                $card_type_arg = $tucked_cards[$random_tucked_id];
                array_push($flipped_and_tucked_type_args, $card_type_arg);

                $tucked_card_ids[] = $random_tucked_id;
                $tucked_card_type_args[] = $card_type_arg;
                $card_id_arr[] = $random_tucked_id;
                unset($board_assets[$player_id][$type]['tucked'][$random_tucked_id]);
                $board_assets[$player_id][$type]['count']--;
                if ( !($climbing_card_info && $climbing_card_info['give_opponent'] === true) && !$risk_it_info ) {
                    $this->updateAssetDiscard($random_tucked_id, $card_type_arg, 'add');
                }
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

        if ($climbing_card_info) {
            $opponent_id = $climbing_card_info['give_opponent'] === true ? $climbing_card_info['opponent_id'] : null; 
            $opponent_name = $climbing_card_info['opponent_name'] ?? null;
            $opponent_color = $climbing_card_info['opponent_color'] ?? null;
            $hand_card_ids_for_public = $climbing_card_info['give_opponent'] === false ? $hand_card_arr : array_map(fn($val): int => 0, $hand_card_arr);
        }
        else if ($risk_it_info) {
            $opponent_id = $risk_it_info[1];
            $player_names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);
            $opponent_name = $player_names_and_colors[$opponent_id]['name'];
            $opponent_color = $player_names_and_colors[$opponent_id]['color'];
            $hand_card_ids_for_public = array_map(fn($val): int => 0, $hand_card_arr);
        }
        else if ($this->getGlobalVariable('bomber_anchor')) {
            $hand_card_ids_for_public = $hand_card_arr;
            $opponent_id = null;
            $opponent_name = null;
            $opponent_color = null;
        }

        // log message
        $log_message_private = '';
        $log_message_public = '';

        if (($climbing_card_info && $climbing_card_info['give_opponent'] === true) || $risk_it_info) {
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

            $log_message_private .= 'loses ';
            $log_message_public .= 'loses ';
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
            $log_message_private .= 'from his hand';
            $log_message_public .= count($hand_card_arr) . " Asset cards from his hand";
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
            $log_message_private .= 'from his asset board';
            $log_message_public .= 'from his asset board';
        }

        if (($climbing_card_info && array_key_exists('give_psych', $climbing_card_info))
          || ($risk_it_info && $risk_it_info[0] === 3)) {
            $log_message_private .= ' and 1 Psych';
            $log_message_public .= ' and 1 Psych';
        }


        $log_message_private .= ($climbing_card_info && $climbing_card_info['give_opponent'] === true)
                              || $risk_it_info ? " to @${opponent_name}@" : '';
        $log_message_public .= ($climbing_card_info && $climbing_card_info['give_opponent'] === true)
                              || $risk_it_info ? " to @${opponent_name}@" : '';

        if (count($hand_card_arr) > 0) { $this->updateResourceTracker($player_id, 'subtract', null, null, $hand_card_type_arr); }
        if (count($board_and_tucked_ids) > 0) { $this->updateResourceTracker($player_id, 'subtract', null, null, $board_and_tucked_type_args, null, true, false, $flipped_and_tucked_type_args); }
        if (($climbing_card_info && $climbing_card_info['give_opponent'] === true) || $risk_it_info) {
            $this->updateResourceTracker($opponent_id, 'add', null, null, $card_type_arr);
        }

        $give_psych = false;
        if ((array_key_exists('type_arg', $climbing_card_info) && array_key_exists('give_psych', $climbing_card_info)) 
            || ($risk_it_info && $risk_it_info[0] === 3)) {
            $opponent_id = $climbing_card_info ? $climbing_card_info['opponent_id'] : $risk_it_info[1];
            $this->updateResourceTracker($player_id, 'subtract', null, 1);
            $this->updateResourceTracker($opponent_id, 'add', null, 1);
            $give_psych = true;
        }

        $player_resources = $this->getGlobalVariable('resource_tracker')->$player_id;
        $hand_count = count($this->getHandAssets($player_id));
        $opponent_resources = ($climbing_card_info && $climbing_card_info['give_opponent'] === true)
                              || $risk_it_info ? $this->getGlobalVariable('resource_tracker')->$opponent_id : null;
        $opponent_hand_count = ($climbing_card_info && $climbing_card_info['give_opponent'] === true)
                              || $risk_it_info ? count($this->getHandAssets($opponent_id)) : null;
        $player_water_psych = $this->getGlobalVariable('water_psych_tracker')->$player_id;
        $opponent_water_psych = ($climbing_card_info && array_key_exists('give_psych', $climbing_card_info))
                              || $risk_it_info ? $this->getGlobalVariable('water_psych_tracker')->$opponent_id : null;
        $log_message_opponents = ($climbing_card_info && $climbing_card_info['give_opponent'] == true)
                              || $risk_it_info ? $log_message_public : $log_message_private;

        $board_assets = $this->getGlobalVariable('board_assets', true);

        self::notifyAllPlayers("confirmAssetsForDiscardPublic", clienttranslate('${player_name} ${log_message_opponents}'), array(
            'player_name' => self::getActivePlayerName(),
            'log_message_opponents' => $log_message_opponents,
            'hand_card_ids_for_public' => $hand_card_ids_for_public,
            'board_card_ids' => $board_card_arr,
            'tucked_card_ids' => $tucked_card_ids,
            'board_assets' => $board_assets,
            'flipped_ids' => $flipped_ids,
            'climbing_card_info' => $climbing_card_info,
            'risk_it_info' => $risk_it_info,
            'player_id' => intval($player_id),
            'opponent' => $opponent_id,
            'opponent_name' => $opponent_name,
            'opponent_color' => $opponent_color,
            'player_water_psych' => $player_water_psych,
            'player_hand_count' => $hand_count,
            'opponent_water_psych' => $opponent_water_psych,
            'opponent_hand_count' => $opponent_hand_count,
            'give_psych' => $give_psych,
            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
            'bomber_anchor' => $this->getGlobalVariable('bomber_anchor'),
            'preserve' => ['player_id', 'opponent'],
        ));

        self::notifyPlayer($player_id, "confirmAssetsForDiscardPrivate", clienttranslate('${player_name} ${log_message_private}'), array(
            'player_name' => self::getActivePlayerName(),
            'log_message_private' => $log_message_private,
            'hand_card_ids' => $hand_card_arr,
            'board_card_ids' => $board_card_arr,
            'tucked_card_ids' => $tucked_card_ids,
            'board_assets' => $board_assets,
            'flipped_ids' => $flipped_ids,
            'climbing_card_info' => $climbing_card_info,
            'risk_it_info' => $risk_it_info,
            'player_id' => intval($player_id),
            'opponent' => $opponent_id,
            'opponent_name' => $opponent_name,
            'opponent_color' => $opponent_color,
            'player_resources' => $player_resources,
            'player_hand_count' => $hand_count,
            'opponent_water_psych' => $opponent_water_psych,
            'opponent_hand_count' => $opponent_hand_count,
            'give_psych' => $give_psych,
            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
            'bomber_anchor' => $this->getGlobalVariable('bomber_anchor'),
        ));

        if (($climbing_card_info && $climbing_card_info['give_opponent']) || $risk_it_info) {
            self::notifyPlayer($opponent_id, "confirmAssetsForDiscardPrivate", clienttranslate('${player_name} ${log_message_private}'), array(
                'player_name' => self::getActivePlayerName(),
                'log_message_private' => $log_message_private,
                'hand_card_ids' => $hand_card_arr,
                'board_card_ids' => $board_card_arr,
                'tucked_card_ids' => $tucked_card_ids,
                'board_assets' => $board_assets,
                'flipped_ids' => $flipped_ids,
                'climbing_card_info' => $climbing_card_info,
                'risk_it_info' => $risk_it_info,
                'player_id' => intval($player_id),
                'opponent' => $opponent_id,
                'opponent_name' => $opponent_name,
                'opponent_color' => $opponent_color,
                'opponent_water_psych' => $opponent_water_psych,
                'opponent_resources' => $opponent_resources,
                'player_hand_count' => $hand_count,
                'opponent_hand_count' => $opponent_hand_count,
                'give_psych' => $give_psych,
                'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                'bomber_anchor' => $this->getGlobalVariable('bomber_anchor'),
            ));
        }

        if (array_key_exists('type_arg', $climbing_card_info)) {
            $type_arg = $climbing_card_info['type_arg'];
            $choice_args = $climbing_card_info['choice_args'];

            switch ($type_arg) {

                case 3:
                case 8:
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
                                'preserve' => ['player_id', 'opponent_id'],
                        ));

                        self::notifyPlayer($player_id, "confirmSummitBeta", clienttranslate('${player_name} gains ${summit_beta_for_log}'), array(
                                'player_name' => self::getActivePlayerName(),
                                'player_id' => $player_id,
                                'opponent_id' => false,
                                'hand_summit_beta_tokens' => $this->getHandSummitBetaTokens($player_id),
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
                            'preserve' => ['player_id'],
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
                            'preserve' => ['player_id', 'opponent_id'],
                    ));

                    self::notifyPlayer($player_id, "confirmSummitBeta", clienttranslate('${player_name} gains ${summit_beta_for_log}'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                            'opponent_id' => false,
                            'hand_summit_beta_tokens' => $this->getHandSummitBetaTokens($player_id),
                            'summit_beta_token' => $climbing_card_private['summit_beta_token'],
                            'summit_beta_for_log' => $climbing_card_private['summit_beta_for_log'],
                    ));

                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
                    break;

                case 7:
                case 31:
                case 46:
                case 48:
                    if ($choice_args['benefit'] != 'portaledgeChoose') {
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
                                'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                                'preserve' => ['player_id'],
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
                                'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                        ));
                        $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                        $this->setGlobalVariable('climbing_card_info', array());
                        $this->setGlobalVariable('refill_portaledge', []);
                        $this->gamestate->nextState('nextClimb');
                        break;
                    } else if ($choice_args['benefit'] === 'portaledgeChoose') {

                            $climbing_card_info['portaledge_num'] = $climbing_card_info['type_arg'] == '68' ? 2 : 1;
                            $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                            $this->gamestate->nextState('selectPortaledge');
                            break;
                    }

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
                                'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                                'preserve' => ['player_id'],
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
                                'asset_discard' => $this->getGlobalVariable('asset_discard', true),
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
                    $choice_args = $climbing_card_info['choice_args'];
                    if ($choice_args['benefit'] === 'portaledgeChoose') {

                        $climbing_card_info['portaledge_num'] = $climbing_card_info['type_arg'] == '68' ? 2 : 1;
                        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                        $this->gamestate->nextState('selectPortaledge');
                        break;
                    }
                default:
                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
            }

        } else if ($this->getGlobalVariable('bomber_anchor')) {
            $climbing_card_info = $climbing_card_info_bak;
            return;

        } else { // risk it climbing attempt

            $risked_requirements = $this->getGlobalVariable('risked_requirements', true);
            $this->setGlobalVariable('risked_assets', []);
            $this->confirmRequirements(...$risked_requirements);
        } 
    }

    function confirmSelectedOpponent($opponent_id, $jesus_party) {
        self::checkAction('confirmSelectedOpponent');
        $player_id = self::getActivePlayerId();
        $names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $risk_it_info = $this->getGlobalVariable('risk_it_info', true);

        if ($opponent_id === 'jesus_piece') {

            $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
            $this->setGlobalVariable('climbing_card_info', array());

            self::notifyAllPlayers("discardJesusPiece", clienttranslate('${player_name} uses +Jesus Piece(10)+ to avoid the negative effect'), array(
                'player_name' => self::getActivePlayerName(),
                'player_id' => $player_id,
            ));

            $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
            $jesus_piece_id = array_search('10', $hand_sb_tokens);
            $this->cards_and_tokens->insertCardOnExtremePosition($jesus_piece_id, 'summit_beta_discard', true);
            $this->incStat(1, "played_summit_beta_tokens", $player_id);

            $this->gamestate->nextState('nextClimb');
        }

        else if ($climbing_card_info && $climbing_card_info['type_arg']) {

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

                    if (!$jesus_party) {
                        $this->updateResourceTracker($player_id, 'add', null, -1);
                    }

                    $last_card = [];
                    $remaining_cards = self::getCollectionFromDB("SELECT card_id FROM cards_and_tokens WHERE card_location='$deck_loc'");
                    if (count($remaining_cards) ===1) { $last_card[$portaledge_type] = 1; }

                    $portaledge_draw_opponent = $this->drawFromPortaledge($opponent_id, $portaledge_type, 1, $remaining_cards);
                    $refill_portaledge = $this->getGlobalVariable('refill_portaledge', true);

                    $portaledge_type_arg_opponent = [$portaledge_draw_opponent['type_arg']];
                    $portaledge_id_opponent = $portaledge_draw_opponent['id'];
                    $portaledge_name_opponent = $this->asset_cards[$portaledge_type_arg_opponent[0]]['description'];
                    $card_for_log_opponent = clienttranslate("[${portaledge_name_opponent}(${portaledge_type_arg_opponent[0]})]");
                    $hand_count_opponent = count($this->getHandAssets($opponent_id));
                    $opponent_psych = $this->getGlobalVariable('resource_tracker', true)[$opponent_id]['psych'];
                    $minus_psych = $opponent_psych >= 1 ? -1 : 0;

                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->updateResourceTracker($opponent_id, 'add', null, $minus_psych, $portaledge_type_arg_opponent);

                    $party_log_private = clienttranslate('${player_name} and ${player_name1} lose a Psych and gain a Gear Card');
                    $party_log_me = clienttranslate('${player_name} and ${player_name1} lose a Psych and gain a Gear Card. ${player_name} draws ${card_for_log_player}');
                    $party_log_opponent = clienttranslate('${player_name} and ${player_name1} lose a Psych and gain a Gear Card. ${player_name1} draws ${card_for_log_opponent}');

                    if ($jesus_party) {
                        self::notifyAllPlayers("discardJesusPiece", clienttranslate('${player_name} uses +Jesus Piece(10)+ to avoid the negative effect'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_id' => $player_id,
                        ));

                        $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
                        $jesus_piece_id = array_search('10', $hand_sb_tokens);
                        $this->cards_and_tokens->insertCardOnExtremePosition($jesus_piece_id, 'summit_beta_discard', true);
                        $this->incStat(1, "played_summit_beta_tokens", $player_id);

                        $party_log_private = clienttranslate('${player_name1} loses a Psych and they and ${player_name} gain a Gear Card');
                        $party_log_me = clienttranslate('${player_name1} loses a Psych and they and ${player_name} gain a Gear Card. ${player_name} draws ${card_for_log_player}');
                        $party_log_opponent = clienttranslate('${player_name1} loses a Psych and they and ${player_name} gain a Gear Card. ${player_name1} draws ${card_for_log_opponent}');
                    }
                    $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];
                    $opponent_resources = $this->getGlobalVariable('resource_tracker', true)[$opponent_id];

                    self::notifyAllPlayers("shareEffectPublic", $party_log_private, array(
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
                            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                            'jesus_party' => $jesus_party,
                            'preserve' => ['player_id', 'opponent_id'],
                    ));

                    self::notifyPlayer($player_id, "shareEffectPrivate", $party_log_me, array(
                            'player_name' => self::getActivePlayerName(),
                            'player_name1' => $climbing_card_info['opponent_name'],
                            'card_for_log_player' => $card_for_log_player,
                            'player_id' => $player_id,
                            'opponent_id' => $opponent_id,
                            'player_resources' => $player_resources,
                            'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                            'hand_count_player' => $hand_count,
                            'hand_count_opponent' => $hand_count_opponent,
                            'portaledge_type_arg' => $portaledge_type_arg,
                            'portaledge_id' => $portaledge_id,
                            'climbing_card_info' => $climbing_card_info,
                            'last_card' => $last_card,
                            'refill_portaledge' => $refill_portaledge,
                            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                            'jesus_party' => $jesus_party,
                    ));

                    self::notifyPlayer($opponent_id, "shareEffectPrivate", $party_log_opponent, array(
                            'player_name' => self::getActivePlayerName(),
                            'player_name1' => $climbing_card_info['opponent_name'],
                            'card_for_log_opponent' => $card_for_log_opponent,
                            'player_id' => $player_id,
                            'opponent_id' => $opponent_id,
                            'player_resources' => $opponent_resources,
                            'climbing_card_type_arg' => $climbing_card_info['type_arg'],
                            'hand_count_player' => $hand_count,
                            'hand_count_opponent' => $hand_count_opponent,
                            'portaledge_type_arg' => $portaledge_type_arg_opponent,
                            'portaledge_id' => $portaledge_id_opponent,
                            'climbing_card_info' => $climbing_card_info,
                            'last_card' => $last_card,
                            'refill_portaledge' => $refill_portaledge,
                            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
                            'jesus_party' => $jesus_party,
                    ));
                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->setGlobalVariable('climbing_card_private', array());
                    $this->setGlobalVariable('refill_portaledge', []);
                    $this->setGlobalVariable('jesus_party', null);
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
                            'preserve' => ['player_id', 'opponent_id'],
                    ));

                    self::notifyPlayer($opponent_id, "confirmSummitBeta", clienttranslate('${player_name} chooses ${player_name1} to gain ${summit_beta_for_log}'), array(
                            'player_name' => self::getActivePlayerName(),
                            'player_name1' => $opponent_name,
                            'player_id' => $player_id,
                            'opponent_id' => $opponent_id,
                            'hand_summit_beta_tokens' => $this->getHandSummitBetaTokens($player_id),
                            'summit_beta_token' => $summit_beta_token,
                            'summit_beta_for_log' => $summit_beta_for_log,
                    ));

                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
                    break;
            }
        }

        else { // "risk it" climbing attempt

            $risk_it_info[] = $opponent_id;
            $this->setGlobalVariable('risk_it_info', $risk_it_info);
            $this->gamestate->nextState('discardAssets');
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
        $new_asset_types = array( 'gear' => 0, 'face' => 0, 'crack' => 0, 'slab' => 0 );

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
        }
        $cards_for_log_private .= ' from The Portaledge';

        $cards_for_log_public = substr($cards_for_log_public, 0, -2) ?: '';
        if ($draw_types > 1) {
            $last_space_public = strrpos($cards_for_log_public, " ");
            $penultimate_space_public = strrpos($cards_for_log_public, " ", $last_space_public - strlen($cards_for_log_public) -1 );
            $cards_for_log_public = substr_replace($cards_for_log_public, " and ", $penultimate_space_public, 0);
            if ($total_draw === 2) { $cards_for_log_public = str_replace(',', '', $cards_for_log_public); }
        }
        $cards_for_log_public .= ' card(s) from The Portaledge';

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
        if ($state_name === 'selectPortaledge' || $this->getGlobalVariable('bomber_anchor')) { $operation = 'draws'; }
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
            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
            'bomber_anchor' => $this->getGlobalVariable('bomber_anchor'),
            'preserve' => ['player_id'],
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
            'asset_discard' => $this->getGlobalVariable('asset_discard', true),
            'bomber_anchor' => $this->getGlobalVariable('bomber_anchor'),
        ));

        $this->setGlobalVariable('refill_portaledge', []);

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);

        if ($climbing_card_info != [] && !$this->getGlobalVariable('bomber_anchor')) {

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

        } else if ($this->getGlobalVariable('bomber_anchor')) {
            return;

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

        self::notifyAllPlayers("confirmAssetToAssetBoardOpponent", clienttranslate('${player_name} places ${resource_for_log} from his hand onto his Asset Board'), array(
            'player_name' => self::getActivePlayerName(),
            'board_assets' => $this->getGlobalVariable('board_assets', true),
            'resource_for_log' => $resource_for_log,
            'player_id' => $player_id,
            'card_id' => $selected_resource,
            'card_type_arg' => $card_type_arg,
            'card_type' => $type,
            'hand_count' => $hand_count,
            'preserve' => ['player_id'],
        ));

        self::notifyPlayer($player_id, "confirmAssetToAssetBoard", clienttranslate('${player_name} places ${resource_for_log} from his hand onto his Asset Board'), array(
            'player_name' => self::getActivePlayerName(),
            'board_assets' => $this->getGlobalVariable('board_assets', true),
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

    function confirmStealFromAssetBoard($selected_resource, $tucked_card_type, $opponent_id, $flipped) {
        self::checkAction('confirmStealFromAssetBoard');
        $player_id = self::getActivePlayerId();
        $board_assets = $this->getGlobalVariable('board_assets', true);
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $to_board = (array_key_exists('to_board', $climbing_card_info)) ? true : false;

        if ($selected_resource) {
            $card_type_arg = $this->getGlobalVariable('asset_identifier', true)[$selected_resource];
            $type = $this->getAssetType($card_type_arg);
            $random_tucked_id = '';
            if (!$to_board) { $this->cards_and_tokens->moveCard($selected_resource, $player_id); }
            else if ($to_board) { $this->cards_and_tokens->moveCard($selected_resource, "$player_id" . '_played_' . "$type"); }

            // replace empty board slot with a tucked card if available
            if (count($board_assets[$player_id][$type]['tucked']) > 0) {
                $random_tucked_id = array_rand($board_assets[$player_id][$card_type]['tucked']);
                $random_tucked_type_arg = $this->getGlobalVariable('asset_identifier', true)[$random_tucked_id];
                foreach ($board_assets[$player_id][$type] as $key => $val) {
                    if (in_array(['1', '2', '3', '4']) && isset($val[$selected_resource])) {
                        $slot = $key;
                    }
                }
                $board_assets[$player_id][$type][$slot][$random_tucked_id] = $random_tucked_type_arg;
                $board_assets[$player_id][$type]['flipped'][$slot] = true;
                unset($board_assets[$player_id][$type]['tucked'][$random_tucked_id]);
                $type_arr = $board_assets[$player_id][$card_type];
                $board_assets[$player_id][$card_type] = $this->sortAssetBoardByFlipped($type_arr);
            }
        }
        else if ($tucked_card_type) {
            $random_tucked_id = array_rand($board_assets[$player_id][$card_type]['tucked']);
            $card_type_arg = $tucked_cards[$random_tucked_id];
            $type = $this->getAssetType($card_type_arg);

            unset($board_assets[$player_id][$type]['tucked'][$random_tucked_id]);
            $board_assets[$player_id][$type]['count']--;
            if (!$to_board) { $this->cards_and_tokens->moveCard($random_tucked_id, $player_id); }
            else if ($to_board) { $this->cards_and_tokens->moveCard($random_tucked_id, "$player_id" . '_played_' . "$type"); }
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
        $board_assets = $this->getGlobalVariable('board_assets', true);
        $hand_count = count($this->getHandAssets($player_id));

        $flipped_type_arg = $flipped ? [$card_type_arg] : [];
        if ($selected_resource) { $this->updateResourceTracker($opponent_id, 'subtract', null, null, [$card_type_arg], null, true, false, $flipped_type_arg); }
        if (!$to_board) { $this->updateResourceTracker($player_id, 'add', null, null, [$card_type_arg]); }
        else if ($to_board) { $this->updateResourceTracker($player_id, 'add', null, null, [$card_type_arg], null, false, true); }
        $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];

        $to_board_for_log = $to_board ? ' and adds it to his Asset Board' : '';

        self::notifyAllPlayers('confirmStealFromAssetBoardOpponent', clienttranslate('${player_name} steals ${card_for_log} from ${player_name1}\'s Asset Board${to_board_for_log}'), array(
            'player_name' => self::getActivePlayerName(),
            'card_for_log' => $card_for_log,
            'to_board_for_log' => $to_board_for_log,
            'to_board' => $to_board,
            'board_assets' => $board_assets,
            'player_name1' => $opponent_name,
            'player_id' => $player_id,
            'opponent_id' => $opponent_id,
            'opponent_color' => $opponent_color,
            'selected_resource' => $selected_resource,
            'random_tucked_id' => $random_tucked_id,
            'hand_count' => $hand_count,
            'preserve' => ['player_id'],
        ));

        self::notifyPlayer($player_id, 'confirmStealFromAssetBoard', clienttranslate('${player_name} steals ${card_for_log} from ${player_name1}\'s Asset Board${to_board_for_log}'), array(
            'player_name' => self::getActivePlayerName(),
            'card_for_log' => $card_for_log,
            'to_board_for_log' => $to_board_for_log,
            'to_board' => $to_board,
            'board_assets' => $board_assets,
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

        $player_id = self::getActivePlayerId();
        $player_name = self::getActivePlayerName();
        self::notifyPlayer($player_id, "confirmChooseSummitBetaTokenPlayer", clienttranslate('${player_name} kept ${player_token_for_log} and gave ${opponent_token_for_log} to ${player_name1}'), array(
            'player_name' => $player_name,
            'player_name1' => $player_name1,
            'player_token_for_log' => $player_token_for_log,
            'opponent_token_for_log' => $opponent_token_for_log,
            'selected_token_id' => $selected_token_id,
            'selected_token_type_arg' => $player_token_type_arg,
            'opponent_token_id' => $opponent_token_id,
            'opponent_token_type_arg' => $opponent_token_type_arg,
            'player_id' => $player_id,
            'opponent_id' => $opponent_id,
        ));

        self::notifyPlayer($opponent_id, "confirmChooseSummitBetaTokenOpponent", clienttranslate('${player_name} kept a Summit Beta Token and gave ${opponent_token_for_log} to ${player_name1}'), array(
            'player_name' => $player_name,
            'player_name1' => $player_name1,
            'player_token_for_log' => null,
            'opponent_token_for_log' => $opponent_token_for_log,
            'selected_token_id' => $selected_token_id,
            'selected_token_type_arg' => null,
            'opponent_token_id' => $opponent_token_id,
            'opponent_token_type_arg' => $opponent_token_type_arg,
            'player_id' => $player_id,
            'opponent_id' => $opponent_id,
        ));

        self::notifyAllPlayers("confirmChooseSummitBetaTokenPublic", clienttranslate('${player_name} kept a Summit Beta Token and gave a Summit Beta Token to ${player_name1}'), array(
            'player_name' => $player_name,
            'player_name1' => $player_name1,
            'player_token_for_log' => null,
            'opponent_token_for_log' => null,
            'selected_token_id' => $selected_token_id,
            'selected_token_type_arg' => null,
            'opponent_token_id' => $opponent_token_id,
            'opponent_token_type_arg' => null,
            'player_id' => $player_id,
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
                'preserve' => ['player_id'],
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

    function undoClimbingCard() {
        self::checkAction('undoClimbingCard');

        $this->undoRestorePoint();
        self::notifyAllPlayers("undoClimbingCleanup", '', []);
    }

    function passClimbingCard($player_id) {
        self::checkAction('passClimbingCard');

        $rerack_1 = $this->getGlobalVariable('rerack_1', true);
        $rerack_1[] = $player_id;
        $this->setGlobalVariable('rerack_1', $rerack_1);

        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $climbing_card_type_arg = $climbing_card_info['type_arg'];
        $climbing_card_name = $this->climbing_cards[$climbing_card_type_arg]['description'];
        $climbing_card_for_log = '/' . $climbing_card_name . '(' . $climbing_card_type_arg . ')\\';

        self::notifyAllPlayers('passedClimbingCard', clienttranslate('${player_name} could not choose either option and passed on ${climbing_card}'), array(
                'player_name' => self::getActivePlayerName(),
                'climbing_card' => $climbing_card_for_log,
        ));

        $this->setGlobalVariable('climbing_card_info', []);
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
        $gained_num = array_sum($gained_assets);
        $this->DbQuery( "UPDATE player SET player_score_aux=player_score_aux + $gained_num WHERE player_id='$player_id'" );
        $this->setGlobalVariable('gained_permanent_assets', $gained_permanent_assets);

        $this->gamestate->setPlayerNonMultiactive($player_id, 'grantPermanentAssets');
    }

    function confirmRerack($reracked_assets) {
        self::checkAction('confirmRerack');

        $player_id = self::getActivePlayerId();
        $this->cards_and_tokens->moveCards($reracked_assets, $player_id);
        $hand_count = count($this->getHandAssets($player_id));

        $rerack_log = '${player_name} uses +Rerack(1)+ and gains ';

        $id_1 = $reracked_assets[0];
        $type_arg_1 = $this->getGlobalVariable('asset_identifier', true)[$id_1];
        $asset_1 = $this->asset_cards[$type_arg_1];
        $name_1 = $asset_1['description'];

        $id_2 = $reracked_assets[1];
        $type_arg_2 = $this->getGlobalVariable('asset_identifier', true)[$id_2];
        $asset_2 = $this->asset_cards[$type_arg_2];
        $name_2 = $asset_2['description'];

        $reracked_asset_type_args = [$type_arg_1, $type_arg_2];
        $this->updateResourceTracker($player_id, 'add', null, null, $reracked_asset_type_args);
        $player_resources = $this->getGlobalVariable('resource_tracker', true)[$player_id];

        $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
        $rerack_id = array_search('1', $hand_sb_tokens);
        $this->cards_and_tokens->insertCardOnExtremePosition($rerack_id, 'summit_beta_discard', true);

        $this->incStat(1, "played_summit_beta_tokens", $player_id);

        self::notifyAllPlayers('confirmRerackPublic', clienttranslate('${player_name} uses +Rerack(1)+ and gains [${name_1}(${type_arg_1})] and [${name_2}(${type_arg_2})] from the discard pile'), [
            'player_name' => self::getActivePlayerName(),
            'player_id' => $player_id,
            'name_1' => $name_1,
            'type_arg_1' => $type_arg_1,
            'name_2' => $name_2,
            'type_arg_2' => $type_arg_2,
            'reracked_assets' => $reracked_assets,
            'hand_count' => $hand_count,
            'preserve' => ['player_id'],
        ]);

        self::notifyPlayer($player_id, 'confirmRerackPrivate', clienttranslate('${player_name} uses +Rerack(1)+ and gains [${name_1}(${type_arg_1})] and [${name_2}(${type_arg_2})] from the discard pile'), [
            'player_name' => self::getActivePlayerName(),
            'name_1' => $name_1,
            'type_arg_1' => $type_arg_1,
            'name_2' => $name_2,
            'type_arg_2' => $type_arg_2,
            'reracked_assets' => $reracked_assets,
            'hand_count' => $hand_count,
            'player_resources' => $player_resources,
        ]);
    }

    function confirmEnergyDrink() {
        self::checkAction('confirmEnergyDrink');

        $player_id = self::getActivePlayerId();
        $this->updateResourceTracker($player_id, 'add', 1, 1);
        $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
        $energy_drink_id = array_search('4', $hand_sb_tokens);
        $this->cards_and_tokens->insertCardOnExtremePosition($energy_drink_id, 'summit_beta_discard', true);
        $this->incStat(1, "played_summit_beta_tokens", $player_id);

        self::notifyAllPlayers('confirmEnergyDrink', clienttranslate('${player_name} uses +Energy Drink(4)+ and gains 1 Water and 1 Psych'), [
            'player_name' => self::getActivePlayerName(),
            'player_id' => $player_id,
        ]);
    }

    function confirmBomberAnchor($discard_ids, $portaledge_to_draw) {
        self::checkAction('confirmBomberAnchor');

        $player_id = self::getActivePlayerId();

        $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
        $bomber_anchor_id = array_search('9', $hand_sb_tokens);
        $this->cards_and_tokens->insertCardOnExtremePosition($bomber_anchor_id, 'summit_beta_discard', true);
        $this->incStat(1, "played_summit_beta_tokens", $player_id);

        self::notifyAllPlayers('log_only', clienttranslate('${player_name} uses +Bomber Anchor(9)+'), [
            'player_name' => self::getActivePlayerName(),
        ]);

        $this->setGlobalVariable('bomber_anchor', true);

        $this->confirmAssetsForDiscard($discard_ids, [], [], []);
        $this->confirmPortaledge($portaledge_to_draw);

        $this->setGlobalVariable('bomber_anchor', false);
        self::notifyAllPlayers('bomberAnchorCleanup', '', []);
    }

    function confirmLuckyChalkbag($current_face) {
        self::checkAction('confirmLuckyChalkbag');

        $this->setGlobalVariable('riskSummitBetaFace', null);

        $player_id = self::getActivePlayerId();
        $resource_tracker = $this->getGlobalVariable('resource_tracker', true)[$player_id];
        $available_psych = $resource_tracker['psych'];
        $face_rolled = bga_rand(1, 3);
        // $face_rolled = 2;
        $use_case = $this->getGlobalVariable('risk_it') ? 'risk_it' : 'climbing_card';

        if ($use_case === 'risk_it') {

            $risked_requirements = $this->getGlobalVariable('risked_requirements', true);
            $selected_pitch = $risked_requirements[5];
            
            $resource_tracker['skills']['any_asset'] = array_sum($resource_tracker['skills']);
            $resource_tracker['skills']['any_skill'] = array_sum($resource_tracker['skills']) - $resource_tracker['skills']['gear'] - $resource_tracker['skills']['any_asset'];
            $pitch_requirements = $this->pitches[$selected_pitch]['requirements'];
            
            $requirements_num = 0;
            foreach ($pitch_requirements as $type => $num) {

                if (in_array($type, ['gear', 'face', 'crack', 'slab', 'any_skill', 'any_asset'])) {

                    for ($i=1; $i<=$num; $i++) {
                        if ($resource_tracker['skills'][$type] > 0) { $resource_tracker['skills'][$type]--; }
                        if ($type != 'gear' && $resource_tracker['skills']['any_skill'] > 0) { $resource_tracker['skills']['any_skill']--; }
                        if ($resource_tracker['skills']['any_asset'] > 0) { $resource_tracker['skills']['any_asset']--; }
                        if ($type === 'any_skill' || $type === 'any_asset') {

                            $arr = $type === 'any_skill' ? ['face', 'crack', 'slab'] : ['gear', 'face', 'crack', 'slab'];
                            foreach ($arr as $skill) {
                                if ($resource_tracker['skills'][$skill] > 0) {

                                    $resource_tracker['skills'][$skill]--;
                                    break;
                                }
                            }
                        }
                    }

                    $requirements_num++;
                }
            }
            $hand_cards = array_sum($resource_tracker['skills']);
            $board_cards = array_sum($resource_tracker['asset_board']['skills']);
            $available_cards = $hand_cards + $board_cards;
        }

        else if ($use_case === 'climbing_card') {
            
            $available_cards = count($this->getHandAssets($player_id)) + count($this->getBoardAssets($player_id));
        }

        function dieLog($face_rolled, $available_cards, $available_psych, $use_case) {

            switch($face_rolled) {

                case 1:
                    if ($use_case === 'risk_it') { $die_log = '${player_name} uses +Lucky Chalkbag(11)+, rerolls a checkmark and successfully climbs the pitch'; }
                    else if ($use_case === 'climbing_card') { $die_log = '${player_name} uses +Lucky Chalkbag(11)+, rerolls a checkmark and will draw 3 cards from the Portaledge'; }
                    break;
                case 2: 
                    if ($available_cards >= 2) {
                        $die_log = '${player_name} uses +Lucky Chalkbag(11)+, rerolls -2 Cards and will choose an opponent and give them 2 Asset Cards';
                    }
                    else {
                        $die_log = '${player_name} uses +Lucky Chalkbag(11)+, rerolls -2 Cards but does not have 2 cards to give. They fail to climb the pitch and will draw only 1 card during the next Rerack Phase';
                    }
                    break;
                case 3: 
                    if ($available_cards >= 1 && $available_psych >= 1) {
                        $die_log = '${player_name} uses +Lucky Chalkbag(11)+, rerolls -1 Card and -1 Psych and will choose an opponent and give them 1 Asset Card and 1 Psych';
                    }
                    else {
                        $die_log = '${player_name} uses +Lucky Chalkbag(11)+, rerolls -1 Card and -1 Psych but they do not have the required resources. They will draw only 1 card during the next Rerack Phase';
                    }
                    break;
            }

            return $die_log;
        }

        $token_id = array_search('11', $this->getGlobalVariable('token_identifier', true));

        $this->incStat(1, "played_summit_beta_tokens", $player_id);

        self::notifyAllPlayers('retractRiskDie', '', [
            'use' => true,
            'token_id' => $token_id,
        ]);
        
        self::notifyAllPlayers("rollDie", '', array(
            'face_rolled' => $face_rolled,
            'climbing_card_info' => [],
            'risky_climb' => true,
            'lucky_chalkbag' => false,
        ));

        $die_log = dieLog($face_rolled, $available_cards, $resource_tracker['psych'], $use_case);
        self::notifyAllPlayers("log_only", clienttranslate($die_log), array(
            'player_name' => self::getActivePlayerName(),
        ));
            
        if ($use_case === 'risk_it') {

            if ($face_rolled === 1) { // checkmark
            
                $this->setGlobalVariable('risked_assets', []);
                $this->confirmRequirements(...$risked_requirements);
            }

            else if ($face_rolled === 2) { // 2 cards
                
                if ($available_cards >= 2) {

                    $this->setGlobalVariable('risk_it_info', [2]);
                    $this->gamestate->nextState('selectOpponent');
                }

                else {

                    $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                    $rerack_1[] = $player_id;
                    $this->setGlobalVariable('rerack_1', $rerack_1);

                    self::notifyAllPlayers('riskReturnAssets', '', []);
                    $this->setGlobalVariable('risk_it_info', []);

                    $this->gamestate->nextState('nextClimb');
                }
            }

            else if ($face_rolled === 3) { // 1 card and 1 psych
                
                if ($available_cards >= 1 && $available_psych >= 1) {

                    $this->setGlobalVariable('risk_it_info', [3]);
                    $this->gamestate->nextState('selectOpponent');
                }

                else {

                    $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                    $rerack_1[] = $player_id;
                    $this->setGlobalVariable('rerack_1', $rerack_1);

                    self::notifyAllPlayers('riskReturnAssets', '', []);
                    $this->setGlobalVariable('risk_it_info', []);

                    $this->gamestate->nextState('nextClimb');
                }
            }
        }

        else if ($use_case === 'climbing_card') {

            $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
            $climbing_card_info['face_rolled'] = $face_rolled;

            if ($face_rolled === 1) { // checkmark
                
                $climbing_card_info['portaledge_num'] = 3;
                $climbing_card_info['final_state'] = 'selectPortaledge';
                $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                $this->gamestate->nextState('selectPortaledge');
            }

            else if ($face_rolled === 2) { // -2 cards
            
                if ($available_cards > 1) {

                    $climbing_card_info['discard_num'] = 2;
                    $climbing_card_info['titlebar_message_opponent'] = 'get 2 of his Asset Cards';
                    $climbing_card_info['titlebar_message'] = 'get 2 of your Asset Cards';
                    $climbing_card_info['give_opponent'] = true;
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('selectOpponent');
                }

                else if ($available_assets < 2) {

                    $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                    $rerack_1[] = $player_id;
                    $this->setGlobalVariable('rerack_1', $rerack_1);
                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
                }
            }

            else if ($face_rolled === 3) { // -1 card and -1 psych
                
                if ($available_cards > 0 && $available_psych > 0) {

                    $climbing_card_info['discard_num'] = 1;
                    $climbing_card_info['give_psych'] = true;
                    $climbing_card_info['titlebar_message_opponent'] = 'get 1 of his Asset Cards and 1 of his Psych';
                    $climbing_card_info['titlebar_message'] = 'get 1 of your Asset Cards and 1 of your Psych';
                    $climbing_card_info['give_opponent'] = true;
                    $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
                    $this->gamestate->nextState('selectOpponent');
                }

                else if ($available_cards < 1 || $available_psych < 1) {

                    $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                    $rerack_1[] = $player_id;
                    $this->setGlobalVariable('rerack_1', $rerack_1);
                    $this->cards_and_tokens->insertCardOnExtremePosition($climbing_card_info['id'], 'climbing_discard', true);
                    $this->setGlobalVariable('climbing_card_info', array());
                    $this->gamestate->nextState('nextClimb');
                }
            }
        }
    }

    function confirmRiskSummitBeta() {
        self::checkAction('confirmRiskSummitBeta');
        $player_id = self::getActivePlayerId();
        $resource_tracker = $this->getGlobalVariable('resource_tracker', true)[$player_id];
        $resource_tracker['skills']['any_asset'] = array_sum($resource_tracker['skills']);
        $resource_tracker['skills']['any_skill'] = array_sum($resource_tracker['skills']) - $resource_tracker['skills']['gear'] - $resource_tracker['skills']['any_asset'];
        $hand_cards = array_sum($resource_tracker['skills']);
        $board_cards = array_sum($resource_tracker['asset_board']['skills']);
        $available_cards = $hand_cards + $board_cards;
        $face_rolled = $this->getGlobalVariable('face_rolled');

        self::notifyAllPlayers('retractRiskDie', '', []);
        $this->setGlobalVariable('riskSummitBetaFace', null);

        if ($face_rolled === 2) {

            if ($available_cards >= 2) {

                $this->setGlobalVariable('risk_it_info', [2]);
                $this->setGlobalVariable('face_rolled', null);
                $this->gamestate->nextState('selectOpponent');
            }

            else if ($available_cards < 2) {

                $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                $rerack_1[] = $player_id;
                $this->setGlobalVariable('rerack_1', $rerack_1);

                self::notifyAllPlayers('riskReturnAssets', '', []);
                $this->setGlobalVariable('risk_it_info', []);

                $this->setGlobalVariable('face_rolled', null);
                $this->gamestate->nextState('nextClimb');
            }
        }

        else if ($face_rolled === 3) {

            if ($available_cards >= 1 && $resource_tracker['psych'] >= 1) {

                $this->setGlobalVariable('risk_it_info', [3]);
                $this->setGlobalVariable('face_rolled', null);
                $this->gamestate->nextState('selectOpponent');
            }

            else {

                $rerack_1 = $this->getGlobalVariable('rerack_1', true);
                $rerack_1[] = $player_id;
                $this->setGlobalVariable('rerack_1', $rerack_1);

                self::notifyAllPlayers('riskReturnAssets', '', []);
                $this->setGlobalVariable('risk_it_info', []);

                $this->setGlobalVariable('face_rolled', null);
                $this->gamestate->nextState('nextClimb');
            }
        }
    }

    function confirmCrimperClimbingCard($chosen_id, $discard_id) {
        self::checkAction('confirmCrimperClimbingCard');

        $this->cards_and_tokens->insertCardOnExtremePosition($discard_id, 'climbing_discard', true);

        $crimper_cards = $this->getGlobalVariable('crimper_cards', true);
        $discard_type_arg = $this->getGlobalVariable('climbing_card_identifier', true)[$discard_id];
        $discard_card = $this->climbing_cards[$discard_type_arg];
        $discard_name = $discard_card['description'];
        $chosen_type_arg = $this->getGlobalVariable('climbing_card_identifier', true)[$chosen_id];
        $chosen_card = $this->climbing_cards[$chosen_type_arg];
        $chosen_name = $chosen_card['description'];

        $discard_for_log = '/' . $discard_name . '(' . $discard_type_arg . ')\\';
        $chosen_for_log = '/' . $chosen_name . '(' . $chosen_type_arg . ')\\';
        self::notifyAllPlayers("confirmCrimperClimbingCard", clienttranslate('${player_name} chooses ${chosen_for_log} and discards ${discard_for_log}'), [
            'player_name' => self::getActivePlayerName(),
            'chosen_for_log' => $chosen_for_log,
            'discard_for_log' => $discard_for_log,
            'chosen_id' => $chosen_id,
            'discard_id' => $discard_id,
            'chosen_type_arg' => $chosen_type_arg,
        ]);

        if ($crimper_cards[0]['id'] == $chosen_id) { $climbing_card_info = $crimper_cards[0]; }
        else if ($crimper_cards[1]['id'] == $chosen_id) { $climbing_card_info = $crimper_cards[1]; }
        $this->setGlobalVariable('climbing_card_info', $climbing_card_info);
        $this->setGlobalVariable('risk_it_info', []);
        $this->setGlobalVariable('risked_requirements', []);
        $this->setGlobalVariable('crimper_cards', null);

        if (in_array($chosen_type_arg, ['2', '6', '36', '41', '50', '54', '63'])) {

            $this->gamestate->nextState('addTokenToPitch');

        } else { $this->gamestate->nextState('climbingCard'); }
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
        $phase = $this->getGlobalVariable('phase');
        if ($climbing_card_info && array_key_exists('spread_draw', $climbing_card_info)) {
            $x_cards = 1;
            $spread_draw = true;
        }
        else {
            $x_cards = $this->getGlobalVariable('x_cards');
            $spread_draw = false;
        }
        return array(
            "climbing_card_info" => $climbing_card_info,
            "x_cards" => $x_cards,
            "spread_draw" => $spread_draw,
            "phase" => $phase,
        );
    }

    function argClimbOrRest() {
        $current_player = self::getActivePlayerId();
        $pitch_tracker = $this->getGlobalVariable('pitch_tracker')->$current_player;
        $current_pitch = end($pitch_tracker);
        $board = $this->getGlobalVariable('board');
        $round = $this->getGlobalVariable('round');
        $phase = $this->getGlobalVariable('phase');

        return array(
            "available_pitches" => $this->getAvailablePitches($current_pitch, $board),
            "pitch_tracker" => $pitch_tracker,
            "phase" => $phase,
            "round" => $round,
        );
    }

    function argDiscardAssets() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $risk_it_info = $this->getGlobalVariable('risk_it_info', true);

        if ($climbing_card_info) {

            $discard_type = $climbing_card_info['discard_type'];
            $discard_num = $climbing_card_info['discard_num'];
            $titlebar_message = null;
            $player_name1 = $climbing_card_info['opponent_name'] ?? null;

            if ($player_name1) { $titlebar_message = "give {$discard_num} Asset card(s) to @{$player_name1}@"; }
            else if ($discard_type === 'any_skill') { $titlebar_message = "lose 1 Face, Crack, or Slab card"; }
            else if ($discard_type === 'any_asset') {
                $titlebar_message = $climbing_card_info['type_arg'] == 12 ? 'lose 2 Asset cards' : "lose 1 Asset card";
            }
            else { $titlebar_message = "lose {$discard_num} {$discard_type} card/s"; }

            return array(
                "discard_type" => $discard_type,
                "discard_num" => $discard_num,
                "climbing_card_info" => $climbing_card_info,
                "risk_it_info" => $risk_it_info,
                "titlebar_message" => $titlebar_message,
            );
        }

        else if ($risk_it_info[0] === 2) { // "risk it" climbing attempt -2 cards

            $discard_type = 'any_asset';
            $discard_num = 2;
            $opponent_id = $risk_it_info[1];
            $player_name1 = $this->getGlobalVariable('player_names_and_colors', true)[$opponent_id]['name'];
            $titlebar_message = "give {$discard_num} Asset card(s) to @{$player_name1}@";

            return array(
                "discard_type" => $discard_type,
                "discard_num" => $discard_num,
                "climbing_card_info" => $climbing_card_info,
                "risk_it_info" => $risk_it_info,
                "titlebar_message" => $titlebar_message,
            );
        }

        else if ($risk_it_info[0] ===3) { // "risk it" climbing attempt -1 card, -1 psych

            $discard_type = 'any_asset';
            $discard_num = 1;
            $opponent_id = $risk_it_info[1];
            $player_name1 = $this->getGlobalVariable('player_names_and_colors', true)[$opponent_id]['name'];
            $titlebar_message = "give {$discard_num} Asset card(s) to @{$player_name1}@";

            return array(
                "discard_type" => $discard_type,
                "discard_num" => $discard_num,
                "climbing_card_info" => $climbing_card_info,
                "risk_it_info" => $risk_it_info,
                "titlebar_message" => $titlebar_message,
            );
        }
    }

    function argSelectOpponent() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $risk_it_info = $this->getGlobalVariable('risk_it_info', true);

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

        else if ($risk_it_info[0] === 2) { // "risk it" climbing attempt -2 cards

            $titlebar_message_opponent = 'get 2 of his Asset Cards';
            $titlebar_message = 'get 2 of your Asset Cards';

            return array(
                "climbing_card_info" => $climbing_card_info,
                "titlebar_message_opponent" => $titlebar_message_opponent,
                "titlebar_message" => $titlebar_message,
            );
        }

        else if ($risk_it_info[0] ===3) { // "risk it" climbing attempt -1 card, -1 psych

            $titlebar_message_opponent = 'get 1 of his Asset Cards and 1 of his Psych';
            $titlebar_message = 'get 1 of your Asset Cards and 1 of your Psych';

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
            "climbing_card_info" => $climbing_card_info,
            "types" => $types,
            "types_message" => $types_message,
        );
    }

    function argStealFromAssetBoard() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $types = $climbing_card_info['types'] == 'any' ? "" : "gear";
        return array(
            'types' => $types,
            'climbing_card_info' => $climbing_card_info,
        );
    }

    function argChooseSummitBetaToken() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        $summit_beta_tokens = $climbing_card_info['summit_beta_tokens'];
        return array(
            'climbing_card_info' => $climbing_card_info,
            'summit_beta_tokens' => $summit_beta_tokens,
        );
    }

    function argChooseTechniqueToken() {
        $climbing_card_info = $this->getGlobalVariable('climbing_card_info', true);
        return array(
            'climbing_card_info' => $climbing_card_info,
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

            // Phil
            foreach ($this->getGlobalVariable('player_names_and_colors', true) as $player_id => $info) {

                $character_id = $info['character'];
                if ($character_id == '8') {
                    $summit_beta_1 = $this->cards_and_tokens->pickCardForLocation('summit_beta_supply', strval($player_id));
                    $sb_1_type_arg = $summit_beta_1['type_arg'];
                    $sb_1_name = $this->summit_beta_tokens[$sb_1_type_arg]['description'];
                    $summit_beta_2 = $this->cards_and_tokens->pickCardForLocation('summit_beta_supply', strval($player_id));
                    $sb_2_type_arg = $summit_beta_2['type_arg'];
                    $sb_2_name = $this->summit_beta_tokens[$sb_2_type_arg]['description'];

                    self::notifyAllPlayers("confirmSummitBetaOpponent", clienttranslate('${player_name} gains 2 Summit Beta Tokens'), array(
                        'player_name' => $info['name'],
                        'player_id' => $player_id,
                        'opponent_id' => false,
                        'preserve' => ['player_id', 'opponent_id'],
                    ));
                    self::notifyAllPlayers("confirmSummitBetaOpponent", '', array(
                        'player_id' => $player_id,
                        'opponent_id' => false,
                        'preserve' => ['player_id', 'opponent_id'],
                    ));
                    
                    self::notifyPlayer($player_id, "confirmSummitBeta", clienttranslate('${player_name} gains +${sb_1_name}(${sb_1_type_arg})+ and +${sb_2_name}(${sb_2_type_arg})+'), array(
                        'player_name' => $info['name'],
                        'player_id' => $player_id,
                        'opponent_id' => false,
                        'hand_summit_beta_tokens' => $this->getHandSummitBetaTokens($player_id),
                        'summit_beta_token' => $summit_beta_1,
                        'sb_1_name' => $sb_1_name,
                        'sb_1_type_arg' => $sb_1_type_arg,
                        'sb_2_name' => $sb_2_name,
                        'sb_2_type_arg' => $sb_2_type_arg,
                    ));
                    self::notifyPlayer($player_id, "confirmSummitBeta", '', array(
                        'player_name' => self::getActivePlayerName(),
                        'player_id' => $player_id,
                        'opponent_id' => false,
                        'hand_summit_beta_tokens' => $this->getHandSummitBetaTokens($player_id),
                        'summit_beta_token' => $summit_beta_2,
                    ));
                }
            }

            $active_player_id = $this->getActivePlayerId();
            self::giveExtraTime($active_player_id);
            $this->setGlobalVariable('phase', 'Rack Up!');
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
            $obj->incStat(1, "rounds");
            if ($draw_step < 10) {
                $obj->setGlobalVariable('round', 1);
                $obj->setGlobalVariable('phase', 'Climb');
                $obj->gamestate->nextState('climbOrRest');
            }
            else if ($draw_step >= 10) { $obj->gamestate->nextState('nextRound'); }
        }

        $rerack_1 = $this->getGlobalVariable('rerack_1', true);
        $rested = $this->getGlobalVariable('rested', true);

        $player_count = $this->getPlayersNumber();
        $finished_drawing = $this->getGlobalVariable('finished_drawing', true);

        if (in_array($player_id, $rerack_1)) {

            $this->setGlobalVariable('x_cards', 1);
            $this->setGlobalVariable('rerack_1', $rerack_1);
            $finished_drawing[] = $player_id;
            $this->setGlobalVariable('finished_drawing', $finished_drawing);
            $this->setGlobalVariable('phase', 'Rerack');
            $this->gamestate->nextState('drawAssets');

        } else if (in_array($player_id, $rested)) {
            $key = array_search($player_id, $rested);
            unset($rested[$key]);
            $rested = array_values($rested);
            $this->setGlobalVariable('rested', $rested);
            $finished_drawing[] = $player_id;
            $this->setGlobalVariable('finished_drawing', $finished_drawing);
            $this->setGlobalVariable('phase', 'Rerack');
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
                if ($this->getGlobalVariable('draw_step') === 11) { $this->setGlobalVariable('phase', 'Rerack'); }
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
        $this->setGlobalVariable('risk_it', false);
        if ($this->getGlobalVariable('next_climber') != null) {
            $next_player = $this->getGlobalVariable('next_climber');
            $this->gamestate->changeActivePlayer($next_player);
            $this->setGlobalVariable('next_climber', null);
        }

        $all_player_ids = array_keys($this->getGlobalVariable('player_names_and_colors', true));

        if (count($finished_climbing) == count($all_player_ids) && count(array_diff($finished_climbing, $all_player_ids)) == 0) {
            $this->setGlobalVariable('finished_climbing', []);
            $this->setGlobalVariable('phase', 'Follow');

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
        
        $leftover_for_new_rubber = ['gear' => 0, 'face' => 0, 'crack' => 0, 'slab' => 0, 'wild' => 0];
        
        foreach(array_keys($names_and_colors) as $id) {

            $techniques = $resource_tracker[$id]['asset_board']['techniques'];
            arsort($techniques);
            $tokens = $resource_tracker[$id]['symbol_tokens'];
            $gained_points = ['precision' => 0, 'balance' => 0, 'pain_tolerance' => 0, 'power' => 0];
            $played_tokens = ['precision' => 0, 'balance' => 0, 'pain_tolerance' => 0, 'power' => 0];
            $wild_techniques = $techniques['wild'];
            $used_new_rubber = false;

            foreach($techniques as $type => $value) {

                if ($type != 'wild') {

                    $gained_points[$type] += floor($value / 3);
                    $leftover_val = $value % 3;

                    if ($leftover_val > 0 && $leftover_val + $wild_techniques > 2) {

                        $gained_points[$type]++;
                        $wild_techniques -= 3 - $leftover_val;
                        $leftover_val = 0;
                    }

                    $leftover_val_and_wild = $leftover_val + $wild_techniques;
                    $new_rubber = (in_array('6', array_values($this->getHandSummitBetaTokens($id))) && $used_new_rubber === false) ? 1 : 0;

                    if ($leftover_val > 0 && $leftover_val_and_wild + $tokens[$type] + $new_rubber > 2) {

                        $total_remaining = $leftover_val_and_wild + $tokens[$type] + $new_rubber;
                        $used_new_rubber = $new_rubber ? $total_remaining % 3 === 0 : $used_new_rubber;
                        $new_points = floor(($total_remaining) /3);
                        $gained_points[$type] += $new_points;

                        $played_tokens[$type] += $new_points * 3 - ($leftover_val_and_wild + $new_rubber);
                        $tokens[$type] -= $played_tokens[$type];
                        for ($i=1; $i<=$played_tokens[$type]; $i++) { $this->updateResourceTracker($id, 'subtract', null, null, [], $type); }

                        $used_wild = $new_points * 3 - ($leftover_val + $played_tokens[$type]);
                        $wild_techniques -= $used_wild;
                    }
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
                $asset_board_token_tracker[$id]['points_tokens'] += $token_num;
                $log_message = '${player_name} used ';
                $type_total = array_reduce(array_values($gained_points), function($ret, $val) { return $ret += $val > 0; });
                $type_num = 1;
                $new_points = 0;
                foreach($gained_points as $type => $value) {
                    if ($value > 0) {

                        $techniques = $value * 3;

                        $type_for_log = $type == 'pain_tolerance' ? 'Pain Tolerance' : ucfirst($type);
                        $log_message .= "{$techniques} {$type_for_log}";

                        if ($type_num < $type_total) { $log_message .= ', '; }
                        if ($type_num == $type_total - 1) { $log_message .= 'and '; }
                        if ($type_num == $type_total) { $log_message .= ' '; }
                        $type_num++;

                        $new_points += $value * 2;
                        $this->DbQuery("UPDATE player SET player_score=player_score+'$new_points' WHERE player_id='$id'");
                        $score_tracker = $this->getGlobalVariable('score_tracker', true);
                        $score_tracker[$id]['tokens'] += $new_points;
                        $this->setGlobalVariable('score_tracker', $score_tracker);
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

                if ($used_new_rubber && array_sum(array_values($played_tokens)) > 0) { $log_message .= " and +New Rubber(6)+"; }
                else if ($used_new_rubber) { $log_message .= ", including +New Rubber(6)+"; }

                if ($used_new_rubber) {
                    $hand_sb_tokens = $this->getHandSummitBetaTokens($id);
                    $new_rubber_id = array_search('6', $hand_sb_tokens);
                    $this->cards_and_tokens->insertCardOnExtremePosition($new_rubber_id, 'summit_beta_discard', true);
                    $this->incStat(1, "played_summit_beta_tokens", $id);
                }

                $numbermap = ['zero', 'one', 'two', 'three', 'four', 'five'];
                $log_message .= " and gains {$numbermap[$token_num]} 2-Point Token(s)";

                $this->incStat($new_points, "technique_token_points", $id);

                self::notifyAllPlayers("matchingTechniques", clienttranslate($log_message), array(
                        'player_id' => $id,
                        'player_name' => $names_and_colors[$id]['name'],
                        'player_color' => $names_and_colors[$id]['color'],
                        'token_num' => $token_num,
                        'played_tokens' => $played_tokens,
                        'used_new_rubber' => $used_new_rubber,
                        'new_points' => $new_points,
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

            $character_type_arg = $names_and_colors[$player]['character'];
            $max_slots = $this->characters[$character_type_arg]['permanent_asset_slots'];
            $filled_slots = $board_assets[$player]['gear']['permanent'] + $board_assets[$player]['face']['permanent'] +
                            $board_assets[$player]['crack']['permanent'] + $board_assets[$player]['face']['permanent'];
            $available_tokens[$player] = [];
    
            foreach($board as $type => $assets) {

                if ($character_type_arg === '6') { // Young Prodigy
                    $card_slots = $type === 'gear' ? 5 : 3;
                }
                else { $card_slots = 4; }

                if ($assets['count'] >= $card_slots && $filled_slots < $max_slots) {
                    if (!in_array($player, $active_players)) { $active_players[] = $player; }
                    $available_tokens[$player][$type] = floor($assets['count'] / $card_slots);
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

            $character_id = $this->getGlobalVariable('player_names_and_colors', true)[$player]['character'];
            foreach($board as $type => $assets) {

                if ($character_id === '6') { // Young Prodigy
                    $slots = $type === 'gear' ? 5 : 3;
                }
                else { $slots = 4; }

                for ($i=1; $i<=$slots; $i++) {

                    if ($assets['flipped'][$i] === false) {

                        $ids_to_flip[] = array_keys($assets[$i])[0];
                        $board_assets[$player][$type]['flipped'][$i] = true;
                        $type_arg = array_values($assets[$i])[0];
                        $technique = $this->getTechniqueType($type_arg, $player);
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

        // check for game end
        $pitch_tracker = $this->getGlobalVariable('pitch_tracker', true);
        $end_game = false;
        foreach ($pitch_tracker as $player_id => $pitches) {
            if (count($pitches) === 9) {
                $end_game = true;
            }
        }
        if ($end_game) { $this->gamestate->nextState('preGameEnd'); }
        else { $this->gamestate->nextState('nextDraw'); }
    }

    function stGrantPermanentAssets() {

        $gained_permanent_assets = $this->getGlobalVariable('gained_permanent_assets', true);
        $resource_tracker = $this->getGlobalVariable('resource_tracker', true);
        $board_assets = $this->getGlobalVariable('board_assets', true);
        $asset_board_token_tracker = $this->getGlobalVariable('asset_board_token_tracker', true);
        $names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);
        $permanent_asset_tracker = $this->getGlobalVariable('permanent_asset_tracker', true);
        $shared_objective_points = 0;

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
            $character_id = $this->getGlobalVariable('player_names_and_colors', true)[$player_id]['character'];

            foreach($assets as $type => $num) {

                // update trackers and stats for added permanent asset token
                $resource_tracker[$player_id]['permanent_skills'][$type] += $num;
                $board_assets[$player_id][$type]['permanent'] += $num;
                $asset_board_token_tracker[$player_id]['permanent_tokens'][$type] += $num;
                for ($i=1; $i<=$num; $i++) { $permanent_asset_tracker[$player_id][] = $type; }
                $permanent_token_stat = 'permanent_' . $type . '_assets';
                $this->incStat($num, $permanent_token_stat, $player_id);

                // update trackers for assets discarded from asset board
                if ($character_id === '6') { // Young Prodigy
                    $card_slots = $type === 'gear' ? 5 : 3;
                }
                else { $card_slots = 4; }

                for ($i=1; $i<=$num*$card_slots; $i++) {

                    if ($board_assets[$player_id][$type]['tucked']) {

                        $asset_id = array_keys($board_assets[$player_id][$type]['tucked'])[0];
                        $type_arg = $this->getGlobalVariable('asset_identifier', true)[$asset_id];
                        $this->cards_and_tokens->playCard($asset_id);
                        $this->updateAssetDiscard($asset_id, $type_arg, 'add');
                        unset($board_assets[$player_id][$type]['tucked'][$asset_id]);
                        $board_assets[$player_id][$type]['count']--;
                        $resource_tracker[$player_id]['asset_board']['skills'][$type]--;
                        $discarded_assets[$player_id]['tucked'][$type][] = $asset_id;
                        continue;
                    }

                    for ($j=$card_slots; $j>=1; $j--) {

                        if ($board_assets[$player_id][$type][$j]) {

                            $asset_id = array_keys($board_assets[$player_id][$type][$j])[0];
                            $type_arg = $this->getGlobalVariable('asset_identifier', true)[$asset_id];
                            $technique = $this->getTechniqueType($type_arg, $player_id);
                            $this->cards_and_tokens->playCard($asset_id);
                            $this->updateAssetDiscard($asset_id, $type_arg, 'add');
                            unset($board_assets[$player_id][$type][$j][$asset_id]);
                            $board_assets[$player_id][$type]['count']--;
                            $resource_tracker[$player_id]['asset_board']['skills'][$type]--;

                            if ($board_assets[$player_id][$type]['flipped'][$j]) { $discarded_assets[$player_id]['flipped'][$type][] = $asset_id; }
                            else {
                                $discarded_assets[$player_id]['unflipped'][$type][] = $asset_id;
                                if ($technique) { $resource_tracker[$player_id]['asset_board']['techniques'][$technique]--; }
                            }

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

            // track shared objectives
            $shared_objectives_tracker = $this->getGlobalVariable('shared_objectives_tracker', true);
            foreach ($shared_objectives_tracker as $id => $info) {
                switch ($id) {

                    case '15': // face + slab
                        $tracker = $resource_tracker[$player_id]['permanent_skills'];
                        $face_and_slab = $tracker['face'] + $tracker['slab'];
                        if ($face_and_slab >= 4 && !in_array($player_id, $info['players_met'])) {
                            $info['players_met'][] = $player_id;
                            $this->DbQuery("UPDATE player SET player_score=player_score+8 WHERE player_id='$player_id'");
                            $shared_objective_points = 8;
                            $shared_objectives_tracker[$id] = $info;
                            $this->setGlobalVariable('shared_objectives_tracker', $shared_objectives_tracker);
                            $score_tracker = $this->getGlobalVariable('score_tracker', true);
                            $score_tracker[$player_id]['objectives'] += 8;
                            $this->setGlobalVariable('score_tracker', $score_tracker);
                            $this->incStat(1, "shared_objectives_met", $player_id);
                            $this->incStat(8, "stonemaster", $player_id);
                            $this->incStat(8, "shared_objectives_points", $player_id);
                        }
                        break;

                    case '16': // crack + gear
                        $tracker = $resource_tracker[$player_id]['permanent_skills'];
                        $crack_and_gear = $tracker['crack'] + $tracker['gear'];
                        if ($crack_and_gear >= 4 && !in_array($player_id, $info['players_met'])) {
                            $info['players_met'][] = $player_id;
                            $this->DbQuery("UPDATE player SET player_score=player_score+8 WHERE player_id='$player_id'");
                            $shared_objective_points = 8;
                            $shared_objectives_tracker[$id] = $info;
                            $this->setGlobalVariable('shared_objectives_tracker', $shared_objectives_tracker);
                            $score_tracker = $this->getGlobalVariable('score_tracker', true);
                            $score_tracker[$player_id]['objectives'] += 8;
                            $this->setGlobalVariable('score_tracker', $score_tracker);
                            $this->incStat(1, "shared_objectives_met", $player_id);
                            $this->incStat(8, "off-width_aficionado", $player_id);
                            $this->incStat(8, "shared_objectives_points", $player_id);
                        }
                        break;
                }
            }

            if ($player_num == $player_total -1) { $log_message .= ' and '; }
            $player_num++;
        }
        $log_message .= $gained_permanent_assets ? ' Permanent Asset token(s)' : '';

        self::notifyAllPlayers('grantPermanentAssets', clienttranslate($log_message), array(
                'player_name1' => $player_name1,
                'player_name2' => $player_name2,
                'player_name3' => $player_name3,
                'player_name4' => $player_name4,
                'player_name5' => $player_name5,
                'gained_permanent_assets' => $gained_permanent_assets,
                'discarded_assets' => $discarded_assets,
                'shared_objective_points' => $shared_objective_points,
                'shared_objectives_tracker' => $shared_objectives_tracker,
        ));

        $this->setGlobalVariable('gained_permanent_assets', []);
        $this->setGlobalVariable('resource_tracker', $resource_tracker);
        $this->setGlobalVariable('board_assets', $board_assets);
        $this->setGlobalVariable('asset_board_token_tracker', $asset_board_token_tracker);
        $this->setGlobalVariable('permanent_asset_tracker', $permanent_asset_tracker);

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

        $this->setGlobalVariable('phase', 'Climb');
        $round = intval($this->getGlobalVariable('round')) + 1;
        $this->setGlobalVariable('round', strval($round));

        $this->gamestate->nextState('climbOrRest');
    }

    function stPreGameEnd() {

        // choose personal objectives
        $player_names_and_colors = $this->getGlobalVariable('player_names_and_colors', true);
        $personal_objectives_tracker = $this->getGlobalVariable('personal_objectives_tracker', true);
        $score_tracker = $this->getGlobalVariable('score_tracker', true);
        $scored_personal_objectives = [];

        $personal_objectives_tracker = $this->getGlobalVariable('personal_objectives_tracker', true);
        $final_personal_objectives_tracker = [];
        foreach ($personal_objectives_tracker as $player_id => $objectives) {
            foreach ($objectives as $id => $val) {
                $final_personal_objectives_tracker[$id] = $val;
            }
        }
        self::notifyAllPlayers('updateFinalPersonalObjectivesTracker', '', [
            'final_personal_objectives_tracker' => $final_personal_objectives_tracker,
        ]);

        foreach ($player_names_and_colors as $player_id => $player_info) {
            $objective_points = 0;
            $scored_objective_id = null;
            foreach ($personal_objectives_tracker[$player_id] as $objective_id => $pitches) {
                $objective = $this->personal_objectives[$objective_id];
                $temp_points = count($pitches) >= 3 ? $objective['score'] : 0;
                if ($temp_points > $objective_points) {
                    $objective_points = $temp_points;
                    $scored_objective_id = $objective_id;
                }
                // else { $this->setStat(0, $objective['name'], $player_id); } // set stat for unscored personal objectives
            }
            $score_tracker[$player_id]['objectives'] += $objective_points;
            $scored_personal_objectives[$player_id] = $scored_objective_id;
            if ($scored_objective_id) {

                $personal_objective = $this->personal_objectives[$scored_objective_id];
                $this->setStat($scored_objective_id, "personal_objective_scored", $player_id);
                $this->setStat($personal_objective['score'], "personal_objective_points", $player_id);
                // $this->setStat($personal_objective['score'], $personal_objective['name'], $player_id);
            }

            // log message
            $objectives_msg = '${player_name} ' ;
            $held_objectives = array_keys($personal_objectives_tracker[$player_id]);
            $objective_1_type_arg = $held_objectives[0];
            $objective_2_type_arg = $held_objectives[1];

            $objective_1_name = $this->personal_objectives[$objective_1_type_arg]['description'];
            $objective_2_name = $this->personal_objectives[$objective_2_type_arg]['description'];
            if ($objective_1_type_arg === $scored_objective_id) {
                $objectives_msg .= 'scores ==${objective_1_name}(${objective_1_type_arg})== and ';
            }
            else if ($objective_1_type_arg !== $scored_objective_id) {
                $objectives_msg .= 'held ==${objective_1_name}(${objective_1_type_arg})== and ';
            }
            if ($objective_2_type_arg === $scored_objective_id) {
                $objectives_msg .= 'scores ==${objective_2_name}(${objective_2_type_arg})==';
            }
            else if ($objective_2_type_arg !== $scored_objective_id && $objective_1_type_arg === $scored_objective_id) {
                $objectives_msg .= 'held ==${objective_2_name}(${objective_2_type_arg})==';
            }
            else if ($objective_2_type_arg !== $scored_objective_id && $objective_1_type_arg !== $scored_objective_id) {
                $objectives_msg .= '==${objective_2_name}(${objective_2_type_arg})==';
            }

            self::notifyAllPlayers('log_only', clienttranslate($objectives_msg), [
                'player_name' => self::getActivePlayerName(),
                'objective_1_name' => $objective_1_name,
                'objective_2_name' => $objective_2_name,
                'objective_1_type_arg' => $objective_1_type_arg,
                'objective_2_type_arg' => $objective_2_type_arg,
            ]);
        }

        $this->setGlobalVariable('scored_personal_objectives', $scored_personal_objectives);

        self::notifyAllPlayers('preGameEnd', '', [
            'score_tracker' => $score_tracker,
            'scored_personal_objectives' => $scored_personal_objectives,
            'personal_objectives_tracker' => $personal_objectives_tracker
        ]);

        $this->gamestate->nextState('gameEnd');
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