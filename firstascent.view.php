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
            array(30, 134),  array(30, 194),  array(30, 254),  array(30, 314),  array(30, 374),  array(30, 434), array(30, 494), array(30, 554),
            array(82, 164),  array(82, 224),  array(82, 284),  array(82, 344),  array(82, 404),  array(82, 464), array(82, 524),
            array(134, 194), array(134, 254), array(134, 314), array(134, 374), array(134, 434), array(134, 494),
            array(217, 224), array(217, 284), array(217, 344), array(217, 404), array(217, 464),
            array(269, 254), array(269, 314), array(269, 374), array(269, 434),
            array(321, 284), array(321, 404)
        );

        $this->page->begin_block("firstascent_firstascent", "tile");

        for($i = 0, $j = count($desert_coords); $i < $j; $i++) {
            $this->page->insert_block("tile", array(
                'X' => $i,
                'BOTTOM' => $desert_coords[$i][0],
                'LEFT' => $desert_coords[$i][1]
            ) );
        }


        /*********** Do not change anything below this line  ************/
  	}
}
