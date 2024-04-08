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
            "possibleactions" => array("confirmAssets"),
            "transitions" => array("nextDraw" => 11, "nextClimb" => 25)
    ),

    11 => array(
            "name" => "nextDraw",
            "description" => "",
            "type" => "game",
            "action" => "stNextDraw",
            "updateGameProgression" => true,
            "transitions" => array("drawAssets" => 10, "resting" => 33, "climbOrRest" => 20, "nextRound" => 12)
    ),

    12 => array(
            "name" => "nextRound",
            "description" => clienttranslate('Passing Starting Player token'),
            "type" => "game",
            "action" => "stNextRound",
            "updateGameProgression" => true,
            "transitions" => array("climbOrRest" => 20)
    ),

    20 => array(
            "name" => "climbOrRest",
            "description" => clienttranslate('${actplayer} must choose a pitch or rest'),
            "descriptionmyturn" => clienttranslate('${you} must choose a pitch or rest'),
            "type" => "activeplayer",
            "args" => "argClimbOrRest",
            "possibleactions" => array("confirmRequirements", "rest"),
            "transitions" => array("drawClimbingCard" => 21, "nextClimb" => 25, "addTokenToPitch" => 27)
    ),

    21 => array(
            "name" => "climbingCard",
            "description" => clienttranslate('${actplayer} must resolve a Climbing card'),
            "descriptionmyturn" => clienttranslate('${you} must resolve a Climbing card'),
            "type" => "activeplayer",
            "possibleactions" => array("confirmClimbingCardChoice", "passClimbingCard"),
            "transitions" => array("nextClimber" => 20, "discardAssets" => 22, "selectOpponent" => 23,  "selectPortaledge" => 24, 
                                   "nextClimb" => 25, "portaledgeAll" => 26, "stealFromAssetBoard" => 28, "addAssetToAssetBoard" => 29,
                                    "chooseSummitBetaToken" => 30, "chooseTechniqueToken" => 31)
    ),

    22 => array(
            "name" => "discardAssets",
            "description" => clienttranslate('${actplayer} must ${titlebar_message}'),
            "descriptionmyturn" => clienttranslate('${you} must ${titlebar_message}'),
            "type" => "activeplayer",
            "args" => "argDiscardAssets",
            "possibleactions" => array("confirmAssetsForDiscard"),
            "transitions" => array("nextClimber" => 20, "selectOpponent" => 23, "selectPortaledge" => 24, "nextClimb" => 25, 
                                   "stealFromAssetBoard" => 28, "chooseTechniqueToken" => 31, "drawAssets" => 10)
    ),

    23 => array(
            "name" => "selectOpponent",
            "description" => clienttranslate('${actplayer} must select a climber to ${titlebar_message_opponent}'),
            "descriptionmyturn" => clienttranslate('${you} must select a climber to ${titlebar_message}'),
            "type" => "activeplayer",
            "args" => "argSelectOpponent",
            "possibleactions" => array("confirmSelectedOpponent"),
            "transitions" => array("nextClimb" => 20, "discardAssets" => 22, "nextClimb" => 25, "chooseTechniqueToken" => 31)
    ),

    24 => array(
            "name" => "selectPortaledge",
            "description" => clienttranslate('${actplayer} must take ${portaledge_num} card(s) from The Portaledge'),
            "descriptionmyturn" => clienttranslate('${you} must take ${portaledge_num} card(s) from The Portaledge'),
            "type" => "activeplayer",
            "args" => "argSelectPortaledge",
            "possibleactions" => array("confirmPortaledge"),
            "transitions" => array("confirmPortaledge" => 25, "nextClimb" => 25, "portaledgeAll" => 26)
    ),

    25 => array(
            "name" => "nextClimb",
            "description" => "",
            "type" => "game",
            "action" => "stNextClimb",
            "updateGameProgression" => true,
            "transitions" => array("climbOrRest" => 20, "followPhase" => 40)
    ),

    26 => array(
            "name" => "portaledgeAll",
            "description" => "",
            "type" => "game",
            "action" => "stPortaledgeAll",
            "updateGameProgression" => false,
            "transitions" => array("selectPortaledge" => 24, "nextClimb" => 25)
    ),

    27 => array(
            "name" => "addTokenToPitch",
            "description" => clienttranslate('${actplayer} must select an Asset Token and a Pitch'),
            "descriptionmyturn" => clienttranslate('${you} must select an Asset Token'),
            "type" => "activeplayer",
            "args" => "argAddTokenToPitch",
            "possibleactions" => array("confirmAddTokenToPitch"),
            "transitions" => array("nextClimb" => 25)
    ),

    28 => array(
            "name" => "stealFromAssetBoard",
            "description" => clienttranslate('${actplayer} must select a ${types} card from an opponent\'s Asset Board'),
            "descriptionmyturn" => clienttranslate('${you} must select a ${types} card from an opponent\'s Asset Board'),
            "type" => "activeplayer",
            "args" => "argStealFromAssetBoard",
            "possibleactions" => array("confirmStealFromAssetBoard"),
            "transitions" => array("nextClimb" => 25)
    ),

    29 => array(
            "name" => "addAssetToAssetBoard",
            "description" => clienttranslate('${actplayer} must select a ${types_message} card from their hand'),
            "descriptionmyturn" => clienttranslate('${you} must select a ${types_message} card from your hand'),
            "type" => "activeplayer",
            "args" => "argAddAssetToAssetBoard",
            "possibleactions" => array("confirmAssetToAssetBoard"),
            "transitions" => array("nextClimb" => 25)
    ),

    30 => array(
            "name" => "chooseSummitBetaToken",
            "description" => clienttranslate('${actplayer} must select a Summit Beta token to keep'),
            "descriptionmyturn" => clienttranslate('${you} must select a Summit Beta token to keep'),
            "type" => "activeplayer",
            "args" => "argChooseSummitBetaToken",
            "possibleactions" => array("confirmChooseSummitBetaToken"),
            "transitions" => array("nextClimb" => 25)
    ),

    31 => array(
            "name" => "chooseTechniqueToken",
            "description" => clienttranslate('${actplayer} must select a Technique Token'),
            "descriptionmyturn" => clienttranslate('${you} must select a Technique Token'),
            "type" => "activeplayer",
            "possibleactions" => array("confirmChooseTechniqueToken"),
            "transitions" => array("nextClimb" => 25, "techniqueOpponent" => 32)
    ),

    32 => array(
            "name" => "techniqueOpponent",
            "description" => "",
            "type" => "game",
            "action" => "stTechniqueOpponent",
            "updateGameProgression" => false,
            "transitions" => array("chooseTechniqueToken" => 31, "nextClimb" => 25)
    ),

    33 => array(
            "name" => "resting",
            "description" => clienttranslate('${actplayer} must choose five resources to take'),
            "descriptionmyturn" => clienttranslate('${you} must choose five resources to take'),
            "type" => "activeplayer",
            "possibleactions" => array("confirmPortaledge"),
            "transitions" => array("nextDraw" => 11, "nextRound" => 12)
    ),

    40 => array(
            "name" => "matchingTechniques",
            "description" => "Checking for matching Technique Symbols",
            "type" => "game",
            "action" => 'stMatchingTechniques',
            "updateGameProgression" => false,
            "transitions" => array("flagPermanentAssets" => 41)
    ),

    41 => array(
            "name" => "flagPermanentAssets",
            "description" => "",
            "type" => "game",
            "action" => "stFlagPermanentAssets",
            "updateGameProgression" => false,
            "transitions" => array("choosePermanentAssets" => 42, "flipPlayedAssets" => 44)
    ),

    42 => array(
            "name" => "choosePermanentAssets",
            "description" => clienttranslate('Players must decide which Permanent Asset Token(s) to gain'),
            "descriptionmyturn" => clienttranslate('${you} must decide which Permanent Asset Token(s) to gain'),
            "type" => "multipleactiveplayer",
            "args" => "argChoosePermanentAssets",
            "possibleactions" => array("confirmPermanentAssets"),
            "transitions" => array("grantPermanentAssets" => 43)
    ),

    43 => array(
            "name" => "grantPermanentAssets",
            "description" => clienttranslate('Taking Permanent Asset token(s)'),
            "type" => "game",
            "action" => "stGrantPermanentAssets",
            "updateGameProgression" => false,
            "transitions" => array("flipPlayedAssets" => 44)
    ),

    44 => array(
            "name" => "flipPlayedAssets",
            "description" => clienttranslate('Flipping over played Assets'),
            "type" => "game",
            "action" => "stFlipPlayedAssets",
            "updateGameProgression" => false,
            "transitions" => array("nextDraw" => 11)
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



