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
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
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
                "player_count" => 10,
                "shared_objective_1" => 11,
                "shared_objective_2" => 12,
                "shared_objective_3" => 13,
            //    "my_second_global_variable" => 11,
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
        ) );     

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

        if (count($players) <= 3) {
            self::setGameStateInitialValue( 'player_count', 1);
        } else { self::setGameStateInitialValue( 'player_count', 2); }

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
        $current_objectives = array_slice($shared_objectives_ids, 0, 3);
        self::setGameStateInitialValue('shared_objective_1', $current_objectives[0]);
        self::setGameStateInitialValue('shared_objective_2', $current_objectives[1]);
        self::setGameStateInitialValue('shared_objective_3', $current_objectives[2]);

        // Set up tiles

        if (self::getGameStateValue('player_count') === 1) {

            // var is point value of a tile, [0] array is tile locations on the desert board and [1] is css identifiers
            $ones = [ [1,3,6,8,11,13], [1,2,3,4,5,6] ];
            $twos = [ [2,4,7,9,12,15,16,19,21,28,29], [13,14,15,16,17,18,19,20,21,22,23] ];
            $threes = [ [17,20,23,25], [25,26,27,28] ];
            $fours = [ [10,14,18,27,30], [29,30,31,32,33] ];
            $fives = [ [22,24,26,31,32], [38,39,40,41,42,43] ];

            $pitch_order = [];
            $pitch_order[5] = 36;
            $tiles_number = 32;

        } else if (self::getGameStateValue('player_count') === 2) {

            // var is point value of a tile, [0] array is tile locations on the forest board and [1] is css identifiers
            $ones = [ [5,8,13,17,19,26], [1,2,3,4,5,6] ];
            $twos = [ [2,4,9,14,16,20,23,27,36,37,39], [13,14,15,16,17,18,19,20,21,22,23] ];
            $threes = [ [28,30,32,34], [25,26,27,28] ];
            $fours = [ [12,24,35,38,40], [29,30,31,32,33] ];
            $fives = [ [29,31,33,41,42,43], [38,39,40,41,42,43] ];

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


        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // TODO: setup the initial game situation here
       

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

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
        $sql = "SELECT player_id id, player_score score, `character` FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
        $result['player_count'] = $this->getGameStateValue('player_count');

        // FOR DEBUGGING THROUGH JAVASCRIPT

        
        // Get materials
        $result['pitches'] = $this->pitches;
        $result['asset_cards'] = $this->asset_cards;
        $result['climbing_cards'] = $this->climbing_cards;
        $result['shared_objectives'] = $this->shared_objectives;
        $result['current_objectives'] = $this->getCurrentObjectives();
        $result['characters'] = $this->characters;
        $result['available_characters'] = $this->getGlobalVariable('available_characters');

        // Get starting Spread
        $result['spread'] = self::getCollectionFromDb(
                                "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_location='the_spread'", true
        );
  
        // TODO: Gather all information about current game situation (visible by player $current_player_id).
  
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

    /*
    
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */

    function chooseCharacter($character) {
        self::checkAction('chooseCharacter');
        $player_id = self::getActivePlayerId();

        $remaining_characters = $this->getGlobalVariable('available_characters');
        if (($key = array_search($character, $remaining_characters)) !== false) {
            unset($remaining_characters[$key]);
        }
        $this->setGlobalVariable('available_characters', array_values($remaining_characters));

        self::DbQuery("UPDATE player SET `character`='$character' WHERE player_id='$player_id'");
        self::notifyAllPlayers( "chooseCharacter", clienttranslate('${player_name} chooses ${character}'), array(
            'player_name' => self::getActivePlayerName(),
            'player_id' => $player_id,
            'character' => $this->characters[$character]['description'],
            'character_div' => "character_{$character}",
            'character_num' => $character
        ));
        $this->gamestate->nextState('chooseCharacter');
    }

    function placeholder() {
        self::checkAction('placeholder'); 
    }

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */


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
            $this->gamestate->nextState('finishSetup');
        }
    }

    /*
    
    Example for game state "MyGameState":

    function stMyGameState()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }    
    */

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
