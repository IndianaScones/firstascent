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

        $desert_coords = array(
            array(17.4, 181.2),  array(17.2, 262),  array(17.2, 342.95),  array(17.55, 423.9),  array(17.55, 504.9),  
                array(17.2, 585.9), array(17.55, 666.9), array(17.35, 747.7),
            array(87.75, 221.4),  array(87.75, 302.4),  array(87.35, 383.6),  array(87.75, 464.4),  array(87.35, 545.4),  
                array(87.75, 626.4), array(87.75, 707.4),
            array(157.8, 262.4), array(157.8, 342.9), array(157.95, 423.9), array(157.8, 504.9), array(157.8, 585.9), 
                array(157.8, 666.7),
            array(269.5, 302.55), array(269.5, 383.6), array(269.5, 464.55), array(269.5, 545.4), array(269.5, 626.35),
            array(339.8, 342.95), array(339.8, 423.9), array(339.8, 504.85), array(339.8, 585.9),
            array(409.725, 383.6), array(409.725, 545.4)

        );
        $pitch_order = $this->game->getPitchOrder();
        $pitches_face_down = [34, 35, 36, 37, 38]; // CSS identifiers

        $this->page->begin_block("firstascent_firstascent", "pitch");

        for($i = 0, $j = count($desert_coords); $i < $j; $i++) {
            if ($i <= 20 && $i !== 4) {

                $this->page->insert_block("pitch", array(
                'X' => $i+1,
                'PITCH' => $pitch_order[$i+1],
                'BOTTOM' => $desert_coords[$i][0],
                'LEFT' => $desert_coords[$i][1]
                ) );

            } else if ($i > 20 && $i !== 4) {

                $this->page->insert_block("pitch", array(
                'X' => $i+1,
                'PITCH' => $pitches_face_down[$this->game->pitches[$pitch_order[$i+1]]['value']-1],
                'BOTTOM' => $desert_coords[$i][0],
                'LEFT' => $desert_coords[$i][1]
                ) );
            }
        }


        /*********** Do not change anything below this line  ************/
  	}
}
