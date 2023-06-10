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
 * states.inc.php
 */


$machinestates = array(

    // The initial state. Please do not modify.
    1 => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => array( "" => 2 )
    ),
    

    2 => array(
            "name" => "characterSelection",
            "description" => clienttranslate('${actplayer} must choose a character'),
            "descriptionmyturn" => clienttranslate('${you} must choose a character'),
            "type" => "activeplayer",
            "possibleactions" => array("selectCharacter", "confirmCharacter"),
            "transitions" => array("confirmCharacter" => 3)
    ),

    3 => array(
            "name" => "nextCharacterSelect",
            "description" => "",
            "type" => "game",
            "action" => "stNextCharacterSelect",
            "updateGameProgression" => true,
            "transitions" => array("nextSelection" => 2, "drawAssets" => 10)
    ),

    10 => array(
            "name" => "drawAssets",
            "description" => clienttranslate('${actplayer} must draw ${x_cards} Asset cards'),
            "descriptionmyturn" => clienttranslate('${you} must draw ${x_cards} Asset cards'),
            "type" => "activeplayer",
            "args" => "argDrawAssets",
            "possibleactions" => array("selectAsset", "confirmAssets"),
            "transitions" => array("nextDraw" => 11, "nextRound" => 20)
    ),

    11 => array(
            "name" => "nextDraw",
            "description" => "",
            "type" => "game",
            "action" => "stNextDraw",
            "updateGameProgression" => true,
            "transitions" => array("drawAssets" => 10, "nextRound" => 20)
    ),

    20 => array(
            "name" => "climbOrRest",
            "description" => clienttranslate('${actplayer} must choose a pitch or rest'),
            "descriptionmyturn" => clienttranslate('${you} must choose a pitch or rest'),
            "type" => "activeplayer",
            "args" => "argClimbOrRest",
            "possibleactions" => array("selectPitch", "confirmPitch", "rest"),
            "transitions" => array("selectAssets" => 98, "nextClimber" => 98)
    ),

    98 => array(
            "name" => "endOfTheRoad",
            "description" => "You've reached the end of the road",
            "descriptionmyturn" => "You've reached the end of the road",
            "type" => "activeplayer",
            "possibleactions" => array("placeholder"),
            "transitions" => array("nowhere" => 99)
    ),
    
/*
    SELECT A CHARACTER -> activeplayer

    FINISH PLAYER SETUP -> game

    DRAW INITIAL ASSET CARDS -> activeplayer

    CLIMB PHASE - CHOOSE A PITCH OR REST -> activeplayer

    CLIMB PHASE - USE ASSETS -> activeplayer

    CLIMB PHASE - DRAW A CLIMBING CARD -> activeplayer

    CLIMB PHASE - RISK IT -> activeplayer

    CLIMB PHASE - NEXT PLAYER -> game

    FOLLOW PHASE - TECHNIQUE SYMBOLS -> game

    FOLLOW PHASE - USE A TECHNIQUE TOKEN -> multipleactiveplayer

    FOLLOW PHASE - GAIN PERMANENT ASSETS -> game

    FOLLOW PHASE - FLIP OVER USED ASSETS -> game

    RERACK PHASE - DRAW ASSETS -> activeplayer

    RERACK PHASE - NEXT PLAYER -> game

    ** anytime actions **

    TRADE IN CARDS

    USE SUMMIT BETA TOKEN
*/ 
   
    // Final state.
    // Please do not modify (and do not overload action/args methods).
    99 => array(
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    )

);



