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

        $tile_coords = $this->game->getTileCoords();
        $pitch_order = $this->game->getPitchOrder();
        $pitches_face_down = [34, 35, 36, 37, 38]; // CSS identifiers

        $this->page->begin_block("firstascent_firstascent", "pitch");

        if ($tile_coords[0][0] === 1) {
            $max_coord = 20;
            $skip_coords = [4];
        }
        else {
            $max_coord = 26;
            $skip_coords = [0,2,5,6,9,10,14,17,20,21,24];
        }
        
        for($i = 0, $j = count($tile_coords[1]); $i < $j; $i++) {
            if ($i <= $max_coord && !in_array($i, $skip_coords)) {

                $this->page->insert_block("pitch", array(
                'X' => $i+1,
                'PITCH' => $pitch_order[$i+1],
                'BOTTOM' => $tile_coords[1][$i][0],
                'LEFT' => $tile_coords[1][$i][1]
                ) );

            } else if ($i > $max_coord && !in_array($i, $skip_coords)) {

                $this->page->insert_block("pitch", array(
                'X' => $i+1,
                'PITCH' => $pitches_face_down[$this->game->pitches[$pitch_order[$i+1]]['value']-1],
                'BOTTOM' => $tile_coords[1][$i][0],
                'LEFT' => $tile_coords[1][$i][1]
                ) );
            }
        }

        /*********** Do not change anything below this line  ************/
  	}
}
