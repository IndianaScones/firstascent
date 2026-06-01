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
            "transitions" => array("confirmCharacter" => 3, "zombiePass" => 3)
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
            "description" => clienttranslate('${actplayer} must draw a total of ${x_cards} Asset cards from the deck and The Spread'),
            "descriptionmyturn" => clienttranslate('${you} must draw a total of ${x_cards} Asset cards from the deck and The Spread'),
            "type" => "activeplayer",
            "args" => "argDrawAssets",
            "possibleactions" => array("confirmAssets", "confirmRerack", "confirmEnergyDrink", "confirmBomberAnchor", 
                                       "confirmAssetsForDiscard", "confirmPortaledge", "undoClimbingCard"),
            "transitions" => array("nextDraw" => 11, "nextClimb" => 25, "zombiePassDraw" => 11, "zombiePassClimb" => 25)
    ),

    11 => array(
            "name" => "nextDraw",
            "description" => "",
            "type" => "game",
            "action" => "stNextDraw",
            "updateGameProgression" => true,
            "transitions" => array("drawAssets" => 10, "resting" => 33, "climbOrRest" => 20, "nextRound" => 12, "nextDraw" => 11)
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
            "description" => clienttranslate('${actplayer} must choose a Pitch, Rest, or Trade Assets'),
            "descriptionmyturn" => clienttranslate('${you} must choose a Pitch, Rest, or Trade Assets'),
            "type" => "activeplayer",
            "args" => "argClimbOrRest",
            "possibleactions" => array("confirmRequirements", "riskIt", "confirmTrade", "rest", "confirmRerack", "confirmEnergyDrink",
                                       "confirmAssets", "confirmBomberAnchor", "confirmAssetsForDiscard", "confirmPortaledge", "confirmBail"),
            "transitions" => array("drawClimbingCard" => 21, "selectOpponent" => 23, "nextClimb" => 25, "addTokenToPitch" => 27, "riskSummitBeta" => 50,
                                   "crimperClimbingCards" => 60, "zombiePass" => 25)
    ),

    21 => array(
            "name" => "climbingCard",
            "description" => clienttranslate('${actplayer} must resolve a Climbing card'),
            "descriptionmyturn" => clienttranslate('${you} must resolve a Climbing card'),
            "type" => "activeplayer",
            "possibleactions" => array("confirmClimbingCardChoice", "passClimbingCard", "confirmRerack", "confirmEnergyDrink", "confirmAssets",
                                       "confirmBomberAnchor", "confirmAssetsForDiscard", "confirmPortaledge", "undoClimbingCard"),
            "updateGameProgression" => true,
            "transitions" => array("discardAssets" => 22, "selectOpponent" => 23,  "selectPortaledge" => 24, 
                                   "nextClimb" => 25, "portaledgeAll" => 26, "stealFromAssetBoard" => 28, "addAssetToAssetBoard" => 29,
                                    "chooseSummitBetaToken" => 30, "chooseTechniqueToken" => 31, "drawAssets" => 10, "riskSummitBeta" => 50,
                                    "zombiePass" => 25)
    ),

    22 => array(
            "name" => "discardAssets",
            "description" => '${actplayer} ${titlebar_message}',
            "descriptionmyturn" => '${you} ${titlebar_message}',
            "type" => "activeplayer",
            "args" => "argDiscardAssets",
            "possibleactions" => array("confirmAssetsForDiscard", "confirmRequirements", "confirmRerack", "confirmEnergyDrink", "confirmAssets",
                                       "confirmBomberAnchor", "confirmPortaledge", "undoClimbingCard"),
            "transitions" => array("selectOpponent" => 23, "selectPortaledge" => 24, "nextClimb" => 25, 
                                   "stealFromAssetBoard" => 28, "chooseTechniqueToken" => 31, "drawAssets" => 10, "drawClimbingCard" => 21,
                                   "addTokenToPitch" => 27, "crimperClimbingCards" => 60, "zombiePass" => 25)
    ),

    23 => array(
            "name" => "selectOpponent",
            "description" => '${actplayer} ${titlebar_message_opponent}',
            "descriptionmyturn" => '${you} ${titlebar_message}',
            "type" => "activeplayer",
            "args" => "argSelectOpponent",
            "possibleactions" => array("confirmSelectedOpponent", "confirmRerack", "confirmEnergyDrink", "confirmAssets", "confirmBomberAnchor",
                                       "confirmAssetsForDiscard", "confirmPortaledge", "undoClimbingCard"),
            "transitions" => array("discardAssets" => 22, "nextClimb" => 25, "chooseTechniqueToken" => 31, "zombiePass" => 25, "selectPortaledge" => 24)
    ),

    24 => array(
            "name" => "selectPortaledge",
            "description" => '${actplayer} ${portaledge_message}',
            "descriptionmyturn" => '${you} ${portaledge_message}',
            "type" => "activeplayer",
            "args" => "argSelectPortaledge",
            "possibleactions" => array("confirmPortaledge", "confirmRerack", "confirmEnergyDrink", "confirmAssets", "confirmBomberAnchor",
                                       "confirmAssetsForDiscard", "undoClimbingCard"),
            "transitions" => array("confirmPortaledge" => 25, "nextClimb" => 25, "portaledgeAll" => 26, "zombiePassSolo" => 25, "zombiePassAll" => 26)
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
            "possibleactions" => array("confirmAddTokenToPitch", "confirmRerack", "confirmEnergyDrink", "confirmAssets", "confirmBomberAnchor",
                                       "confirmAssetsForDiscard", "confirmPortaledge", "undoClimbingCard"),
            "transitions" => array("nextClimb" => 25, "zombiePass" => 25)
    ),

    28 => array(
            "name" => "stealFromAssetBoard",
            "description" => '${actplayer} ${steal_message}',
            "descriptionmyturn" => '${you} ${steal_message}',
            "type" => "activeplayer",
            "args" => "argStealFromAssetBoard",
            "possibleactions" => array("confirmStealFromAssetBoard", "confirmRerack", "confirmEnergyDrink", "confirmAssets", "confirmBomberAnchor",
                                       "confirmAssetsForDiscard", "confirmPortaledge", "undoClimbingCard"),
            "transitions" => array("nextClimb" => 25, "zombiePass" => 25)
    ),

    29 => array(
            "name" => "addAssetToAssetBoard",
            "description" => '${actplayer} ${add_to_board_opponent_message}',
            "descriptionmyturn" => '${you} ${add_to_board_message}',
            "type" => "activeplayer",
            "args" => "argAddAssetToAssetBoard",
            "possibleactions" => array("confirmAssetToAssetBoard", "confirmRerack", "confirmEnergyDrink", "confirmAssets", "confirmBomberAnchor",
                                       "confirmAssetsForDiscard", "confirmPortaledge", "undoClimbingCard"),
            "transitions" => array("nextClimb" => 25, "zombiePass" => 25)
    ),

    30 => array(
            "name" => "chooseSummitBetaToken",
            "description" => clienttranslate('${actplayer} must select a Summit Beta token to keep'),
            "descriptionmyturn" => clienttranslate('${you} must select a Summit Beta token to keep'),
            "type" => "activeplayer",
            "args" => "argChooseSummitBetaToken",
            "possibleactions" => array("confirmChooseSummitBetaToken", "confirmRerack", "confirmEnergyDrink", "confirmAssets", "confirmBomberAnchor",
                                       "confirmAssetsForDiscard", "confirmPortaledge", "undoClimbingCard"),
            "transitions" => array("nextClimb" => 25, "zombiePass" => 25)
    ),

    31 => array(
            "name" => "chooseTechniqueToken",
            "description" => clienttranslate('${actplayer} must select a Technique Token'),
            "descriptionmyturn" => clienttranslate('${you} must select a Technique Token'),
            "type" => "activeplayer",
            "args" => "argChooseTechniqueToken",
            "possibleactions" => array("confirmChooseTechniqueToken", "confirmRerack", "confirmEnergyDrink", "confirmAssets", "confirmBomberAnchor",
                                       "confirmAssetsForDiscard", "confirmPortaledge", "undoClimbingCard"),
            "transitions" => array("nextClimb" => 25, "techniqueOpponent" => 32, "zombiePassSolo" => 25, "zombiePassOpponent" => 32)
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
            "description" => clienttranslate('${actplayer} must choose ${rest_num} resources to take'),
            "descriptionmyturn" => clienttranslate('${you} must choose ${rest_num} resources to take'),
            "type" => "activeplayer",
            "args" => "argResting",
            "possibleactions" => array("confirmPortaledge", "confirmRerack", "confirmEnergyDrink", "confirmAssets", "confirmBomberAnchor", "confirmAssetsForDiscard"),
            "transitions" => array("nextDraw" => 11, "zombiePass" => 11)
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
            "transitions" => array("nextDraw" => 11, "preGameEnd" => 98)
    ),

    50 => array(
            "name" => "riskSummitBeta",
            "description" => clienttranslate('${actplayer} may use a Summit Beta Token'),
            "descriptionmyturn" => clienttranslate('${you} may use a Summit Beta Token'),
            "type" => "activeplayer",
            "possibleactions" => array("confirmRerack", "confirmEnergyDrink", "confirmBomberAnchor", "confirmLuckyChalkbag", "confirmRequirements",
                                       "confirmAssets", "confirmJesusPiece", "confirmRiskSummitBeta", "confirmAssetsForDiscard", "confirmPortaledge"),
            "transitions" => array("climbOrRest" => 20, "drawClimbingCard" => 21, "selectOpponent" => 23, "selectPortaledge" => 24, "nextClimb" => 25,
                                   "addTokenToPitch" => 27, "zombiePass" => 25)
    ),

    60 => array(
           "name" => "crimperClimbingCards",
           "description" => clienttranslate('${actplayer} must choose a Climbing Card'),
           "descriptionmyturn" => clienttranslate('${you} must choose a Climbing Card'),
           "type" => "activeplayer",
           "possibleactions" => array("confirmCrimperClimbingCard", "undoClimbingCard", "confirmRerack", "confirmEnergyDrink", "confirmBomberAnchor"),
           "transitions" => array("climbingCard" => 21, "addTokenToPitch" => 27, "zombiePass" => 25)
    ),

    97 => array(
          "name" => "testEnd",
          "description" => "testEnd",
          "descriptionmyturn" => "testEnd",
          "type" => "activeplayer",
          "possibleactions" => array("selectPortaledge"),
          "transitions" => array("gameEnd" => 99)
    ),

    98 => array(
           "name" => "preGameEnd",
           "description" => "",
           "type" => "game",
           "action" => "stPreGameEnd",
           "transitions" => array("gameEnd" => 99, "testEnd" => 97)
    ),

//     98 => array(
//         "name" => "displayEnd",
//         "description" => clienttranslate(''),
//         "type" => "game",
//         "action" => array("stDisplayEnd"),
//         "updateGameProgression" => false,
//         "transitions" => array("gameEnd" => 99)
//     ),
   
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



