<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * FirstAscent implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * firstascent.action.php
 *
 * FirstAscent main action entry point
 */
  
  
  class action_firstascent extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "firstascent_firstascent";
            self::trace( "Complete reinitialization of board game" );
      }
  	} 
    
    public function confirmCharacter() {
        self::setAjaxMode();
        $character = self::getArg("character", AT_posint, true);
        $this->game->confirmCharacter($character);
        self::ajaxResponse();
    }

    public function confirmAssets() {
        self::setAjaxMode();
        $deck_assets = self::getArg("deck_assets", AT_posint);
        $spread_assets_raw = self::getArg("spread_assets", AT_numberlist);

        if (substr($spread_assets_raw, -1) == ',') {
            $spread_assets_raw = substr($spread_assets_raw, 0, -1);
        }
        if ($spread_assets_raw == '') {
            $spread_assets = array();
        } else {
            $spread_assets = explode(',', $spread_assets_raw);
        }

        $this->game->confirmAssets($deck_assets, $spread_assets);
        self::ajaxResponse();
    }

  }
  

