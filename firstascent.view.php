<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * FirstAscent implementation : © <Jonathan Morgan> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * firstascent.view.php
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
        $player_count = count( $players );

    // Set up board

        // Set up shared objectives

        $current_shared_objectives = $this->game->getGlobalVariable('current_shared_objectives');
        $this->page->begin_block("firstascent_firstascent", "shared_objective");

        if ($player_count <= 3) { $board = 'desert'; }
        else { $board = 'forest'; }

        if ($board === 'desert') {
            $shared_objectives_coords = [ [2.68, 35.8], [2.68, 46.68], [2.68, 57.5] ];
        } elseif ($board === 'forest') { $shared_objectives_coords = [ [3.13, 35.79], [3.13, 46.49], [3.13, 57.2] ]; }
        
        for($i=0, $j = 3; $i < $j; $i++) {

            $this->page->insert_block("shared_objective", array(
                'soId' => $current_shared_objectives[$i],
                'soTA' => $current_shared_objectives[$i],
                'soX' => $this->game->shared_objectives[$current_shared_objectives[$i]]['x_y'][0],
                'soY' => $this->game->shared_objectives[$current_shared_objectives[$i]]['x_y'][1],
                'TOP' => $shared_objectives_coords[$i][0],
                'LEFT' => $shared_objectives_coords[$i][1]
            ) );
        }

        // Set up tiles

        $tile_coords = $this->game->getTileCoords($player_count);
        $pitch_order = $this->game->getPitchOrder();
        $pitches_face_down = [44, 45, 46, 47, 48]; // CSS identifiers

        $this->page->begin_block("firstascent_firstascent", "pitch");

        if ($this->game->getGlobalVariable('headwall_revealed')) {

            $max_coord = $board === 'desert' ? 32 : 43;
        }
        else {
            $max_coord = $board === 'desert' ? 20 : 26;
        }
        
        for($i=0; $i<count($tile_coords); $i++) {
            $pitch = $i+1;

            if ($i <= $max_coord) {

                $this->page->insert_block("pitch", array(
                'X' => $pitch,
                'PITCH' => $pitch_order[$pitch],
                'BOTTOM' => $tile_coords[$i][0],
                'LEFT' => $tile_coords[$i][1],
                'PX' => $this->game->pitches[$pitch_order[$pitch]]['x_y'][0],
                'PY' => $this->game->pitches[$pitch_order[$pitch]]['x_y'][1]
                ) );

            } elseif ($i > $max_coord) {

                $this->page->insert_block("pitch", array(
                'X' => $pitch,
                'PITCH' => $pitches_face_down[$this->game->pitches[$pitch_order[$pitch]]['value']-1],
                'BOTTOM' => $tile_coords[$i][0],
                'LEFT' => $tile_coords[$i][1],
                'PX' => ($this->game->pitches[$pitch_order[$pitch]]['value'] + 5) * 100,
                'PY' => 300
                ) );
            }
        }

        // Set up player area
        if (!$this->game->isSpectator()) {
            $this->tpl['MY_HAND'] = self::_("My hand");
        }

        /*********** Do not change anything below this line  ************/
  	}
}