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
 * firstascent.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in firstascent_firstascent.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
require_once( APP_BASE_PATH."view/common/game.view.php" );
  
class view_firstascent_firstascent extends game_view
{
    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "firstascent";
    }
    
  	function build_page( $viewArgs )
  	{		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );

        /*********** Place your code below:  ************/



        /*
        
        // Examples: set the value of some element defined in your tpl file like this: {MY_VARIABLE_ELEMENT}

        // Display a specific number / string
        $this->tpl['MY_VARIABLE_ELEMENT'] = $number_to_display;

        // Display a string to be translated in all languages: 
        $this->tpl['MY_VARIABLE_ELEMENT'] = self::_("A string to be translated");

        // Display some HTML content of your own:
        $this->tpl['MY_VARIABLE_ELEMENT'] = self::raw( $some_html_code );
        
        */
        
        /*
        
        // Example: display a specific HTML block for each player in this game.
        // (note: the block is defined in your .tpl file like this:
        //      <!-- BEGIN myblock --> 
        //          ... my HTML code ...
        //      <!-- END myblock --> 
        

        $this->page->begin_block( "firstascent_firstascent", "myblock" );
        foreach( $players as $player )
        {
            $this->page->insert_block( "myblock", array( 
                                                    "PLAYER_NAME" => $player['player_name'],
                                                    "SOME_VARIABLE" => $some_value
                                                    ...
                                                     ) );
        }
        
        */

    // Set up board

        // Set up shared objectives

        $current_shared_objectives = $this->game->getCurrentObjectives();
        $this->page->begin_block("firstascent_firstascent", "shared_objective");

        if ($this->game->getTileCoords()[0] === 1) { // player count
            $shared_objectives_coords = [ [18, 362.8], [18, 472.8], [18, 582.7] ]; // Desert board
        } else {$shared_objectives_coords = [ [19, 361.5], [19, 470.1], [19, 578.7] ];} // Forest board
        
        for($i=0, $j = 3; $i < $j; $i++) {

            $this->page->insert_block("shared_objective", array(
                'id' => $i+1,
                'soX' => $this->game->shared_objectives[$current_shared_objectives[$i]]['x_y'][0],
                'soY' => $this->game->shared_objectives[$current_shared_objectives[$i]]['x_y'][1],
                'TOP' => $shared_objectives_coords[$i][0],
                'LEFT' => $shared_objectives_coords[$i][1]
            ) );
        }

        // Set up tiles

        $tile_coords = $this->game->getTileCoords();
        $pitch_order = $this->game->getPitchOrder();
        $pitches_face_down = [44, 45, 46, 47, 48]; // CSS identifiers

        $this->page->begin_block("firstascent_firstascent", "pitch");

        if ($tile_coords[0] === 1) {
            $max_coord = 20;
        }
        else {
            $max_coord = 26;
        }
        
        for($i = 0, $j = count($tile_coords[1]); $i < $j; $i++) {
            if ($i <= $max_coord) {

                $this->page->insert_block("pitch", array(
                'X' => $i+1,
                'PITCH' => $pitch_order[$i+1],
                'BOTTOM' => $tile_coords[1][$i][0],
                'LEFT' => $tile_coords[1][$i][1],
                'PX' => $this->game->pitches[$pitch_order[$i+1]]['x_y'][0],
                'PY' => $this->game->pitches[$pitch_order[$i+1]]['x_y'][1]
                ) );

            } else if ($i > $max_coord) {

                $this->page->insert_block("pitch", array(
                'X' => $i+1,
                'PITCH' => $pitches_face_down[$this->game->pitches[$pitch_order[$i+1]]['value']-1],
                'BOTTOM' => $tile_coords[1][$i][0],
                'LEFT' => $tile_coords[1][$i][1],
                'PX' => ($this->game->pitches[$pitch_order[$i+1]]['value'] + 5) * 100,
                'PY' => 300
                ) );
            }
        }

        // Set up player area

        $this->tpl['MY_HAND'] = self::_("My hand");

        /*********** Do not change anything below this line  ************/
  	}
}
