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

    public function confirmRequirements() {
        self::setAjaxMode();
        $selected_resources_raw = self::getArg("selected_resources", AT_numberlist);
        $selected_hex = self::getArg("selected_hex", AT_posint);
        $selected_pitch = self::getArg("selected_pitch", AT_posint);

        if (substr($selected_resources_raw, -1) == ',') {
            $selected_resources_raw = substr($selected_resources_raw, 0, -1);
        }
        if ($selected_resources_raw == '') {
            $selected_resources = array();
        } else {
            $selected_resources = explode(',', $selected_resources_raw);
        }

        $this->game->confirmRequirements($selected_resources, $selected_hex, $selected_pitch);
        self::ajaxResponse();
    }

    public function confirmClimbingCardChoice() {
        self::setAjaxMode();
        $choice = self::getArg("choice", AT_alphanum);
        $card_id = self::getArg("card_id", AT_posint);
        $card_type = self::getArg("card_type", AT_posint);

        $this->game->confirmClimbingCardChoice($choice, $card_id, $card_type);
        self::ajaxResponse();
    }

    public function confirmAssetsForDiscard() {
        self::setAjaxMode();
        $hand_card_ids = self::getArg("hand_card_ids", AT_numberlist);
        $board_card_ids = self::getArg("board_card_ids", AT_numberlist);
        $tucked_card_types = self::getArg("tucked_card_types", AT_alphanum);
        $tucked_card_nums = self::getArg("tucked_card_nums", AT_numberlist);

        $this->game->confirmAssetsForDiscard($hand_card_ids, $board_card_ids, $tucked_card_types, $tucked_card_nums);
        self::ajaxResponse();
    }

    public function confirmSelectedOpponent() {
        self::setAjaxMode();
        $opponent_id = self::getArg("opponent_id", AT_alphanum);

        $this->game->confirmSelectedOpponent($opponent_id);
        self::ajaxResponse();
    }

    public function confirmPortaledge() {
        self::setAjaxMode();
        $portaledge_to_draw_raw = self::getArg("portaledge_to_draw", AT_numberlist);

        if (substr($portaledge_to_draw_raw, -1) == ',') {
            $portaledge_to_draw_raw = substr($portaledge_to_draw_raw, 0, -1);
        }
        if ($portaledge_to_draw_raw == '') {
            $portaledge_to_draw = [];
        } else {
            $portaledge_to_draw = explode(',', $portaledge_to_draw_raw);
        }

        $this->game->confirmPortaledge($portaledge_to_draw);
        self::ajaxResponse();
    }

    public function confirmAddTokenToPitch() {
        self::setAjaxMode();

        $asset_token_type = self::getArg("asset_token_type", AT_alphanum);
        $pitch_type_arg = self::getArg("pitch_type_arg", AT_alphanum);
        $selected_pitch_id = self::getArg("selected_pitch_id", AT_alphanum);

        $this->game->confirmAddTokenToPitch($asset_token_type, $pitch_type_arg, $selected_pitch_id);
        self::ajaxResponse();
    }

    public function confirmAssetToAssetBoard() {
        self::setAjaxMode();

        $selected_resource = self::getArg("selected_resource", AT_alphanum);

        $this->game->confirmAssetToAssetBoard($selected_resource);
        self::ajaxResponse();
    }

    public function confirmStealFromAssetBoard() {
        self::setAjaxMode();

        $selected_resource = self::getArg("selected_resource", AT_alphanum);
        $tucked_card_type = self::getArg("tucked_card_type", AT_alphanum);
        $opponent_id = self::getArg("opponent_id", AT_alphanum);

        $this->game->confirmStealFromAssetBoard($selected_resource, $tucked_card_type, $opponent_id);
        self::ajaxResponse();
    }

    public function confirmChooseSummitBetaToken() {
        self::setAjaxMode();

        $selected_token_id = self::getArg("selected_token_id", AT_posint);
        $opponent_token_id = self::getArg("opponent_token_id", AT_posint);
        $opponent_id = self::getArg("opponent_id", AT_posint);

        $this->game->confirmChooseSummitBetaToken($selected_token_id, $opponent_token_id, $opponent_id);
        self::ajaxResponse();
    }

    public function confirmChooseTechniqueToken() {
        self::setAjaxMode();

        $technique_token_type = self::getArg("technique_token_type", AT_alphanum);

        $this->game->confirmChooseTechniqueToken($technique_token_type);
        self::ajaxResponse();
    }

    public function passClimbingCard() {
        self::setAjaxMode();

        $player_id = self::getArg("player_id", AT_alphanum);

        $this->game->passClimbingCard($player_id);
        self::ajaxResponse();
    }

    public function confirmPermanentAssets() {
        self::setAjaxMode();

        $player_id = self::getArg("player_id", AT_alphanum);
        $gained_assets_raw = self::getArg("gained_assets_str", AT_numberlist);

        if ($gained_assets_raw == '0,0,0,0') {
            $gained_assets = [];
        } else {
            $gained_assets = explode(',', $gained_assets_raw);
        }

        $this->game->confirmPermanentAssets($player_id, $gained_assets);
        self::ajaxResponse();
    }

    public function rest() {
        self::setAjaxMode();

        $player_id = self::getArg("player_id", AT_alphanum);

        $this->game->rest($player_id);
        self::ajaxResponse();
    }

  }
  

