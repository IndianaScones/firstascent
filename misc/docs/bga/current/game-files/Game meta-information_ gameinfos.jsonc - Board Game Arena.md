# Game meta-information: gameinfos.jsonc

> Source: http://en.boardgamearena.com/doc/Game_meta-information:_gameinfos.jsonc

## Overview

From this file, you can edit the various meta-information of your game.

After modifying the file, don't forget to click on "Reload game informations" from the Control Panel so that the changes can be taken into account.

Note: if you break gameinfos and cannot load the management page, then reload using the direct URL: <https://studio.boardgamearena.com/admin/studio/reloadGameInfos.html?game=> (with your game name at the end of url).

Most of the information provided in this file is self-explanatory.

See sections below for specific cases.

## Publisher

These fields should match the publisher of the game. In the case of a public domain name, they should be left empty (empty string)

## Time Profiles

**fast/medium/slow_additional_time**: please set high values here: after the game has been released, there is a process that adjusts these values to match the real game duration. Adjustment starts when the game enters beta, after that these have no effect, and require admin intervention to change.

## Number of players

**players**

```
 "players": [3, 4, 6],
```

- during the first step of development of a game, it is recommended to have a "1 player" configuration: it is much easier to start/stop a game this way, as you don't need to switch players.
- if you change the minimum number of players from 1 to 2, for example, make sure the new tables you create are not restricted from 1 to 1 player otherwise when you create a new table and this account setting is used, there will be a conflict with the new minimum number of players allowed and you will be blocked from creating the game.

But you can also unblock yourself by changing the number of players again, launching a game with a larger number, and then getting back to the number you want.

**suggest_player_number** / **not_recommend_player_number**

```
 "suggest_player_number": 3,
 "not_recommend_player_number": [6],
```

Don't specify anything here (null) if there is no configuration that is REALLY better/worse than another one. You can check player's poll on BoardGameGeek game page if you have any doubt. Note that there can be at most one suggested player count (provide either null or a single number), but there can be several not recommended player counts (provide either null or an array of values).

Another reason to leave it blank unless there is really strong reason to do so is that suggest_player_number also has an implication on the ELO calculation, whereby the K-factor is multiplied by the number of players up to a maximum of this value (or, no max if it's not provided). That is to say, a 6-player game with a suggestion of 3-players will have ELO calculated as if it were a 3-player game.

**Important exception:** in the automatic lobby, if 'suggest_player_number' is not specified, the system will try first the lowest. So if the lowest player number is not compatible with the default options for your game (especially if there is a Solo mode that can only be played in training mode) you have to specify a suggest_player_number of your choice, so that players launching a game in the automatic lobby without checking the option don't get an error with the default configuration.

## Colors

**player_colors**

```
  "player_colors": ["ff0000", "008000", "0000ff", "ffa500", "ffffff"],
```

This array defines the default player colors, theoretically this can be bigger then maximum number of players but you have to support all of the players in your game.
Your setupNewGame in php is responsible for attributing these values to players. See section "Player color preferences" in [Main_game_logic:_yourgamename.game.php](https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php "Main game logic: yourgamename.game.php") for details.

## Minimum screen size

The settings to specify mobile (or small desktop) screen size is detailed here:
<https://en.doc.boardgamearena.com/Your_game_mobile_version>

## Losers not ranked between themselves

By default, all player are ranked, but in some games, the rules say that all non-winners are losers and not ranked between themselves. You can set this option to true so that for your game, there are only winners and losers, without a full ranking of all players.

The score in this case should be the same for the winners and 0 for the losers.

**Warning: Do not use this option in 2-player games, co-op games, or games where perfect ties are frequent, as ELO will not change when everyone is perfectly tied (including tiebreakers).**

```
// If in the game, all losers are equal (no score to rank them or explicit in the rules that losers are not ranked between them), set this to true 
// The game end result will display "Winner" for the 1st player and "Loser" for all other players
"losers_not_ranked": false,
```

**Note**: In some team games like Tichu, Spades, and Belote, players do not gain or lose ELO by teammates. (Hover over the ELO changes to find 'Teammate: -100%')

To activate this modifier for your game, please contact a BGA admin (`hardcoded_team_games` must be enabled manually).

**Warning:** This modifier should not be applied to co-op games or games where 3 or more parties can compete each other (e.g. individual mode with 3 or more players, 2v2v2 6 player mode, and etc.).

## Disable player rotation in case of rematch

By default, in case of a rematch players are rotated so that the first player changes. If for your game it's better to always have a random player order you can change this option.

```
// When doing a rematch, the player order is swapped using a "rotation" so the starting player is not the same
// If you want to disable this, set this to true (even if the comment in your game file say the opposite).
"disable_player_order_swap_on_rematch": false,
```

## Deprecated fields

- Game designer (`designer`)
- Game artist (`artist`)
- Year (`year`)
- Tags (`tags`)
- Game presentation (`presentation`)
- Game page warning (`gamepanel_page_warning`)
- Custom "buy this game" button (`custom_buy_button`)

**⚠ Note**: these fields are **no longer read from this file**; these are now managed via the [Game Metadata Manager](https://en.doc.boardgamearena.com/Game_metadata_manager "Game metadata manager").

## Tie breaker description

Describe tie breaker score calculation (using $this->playerScoreAux).

Important: This is used in the javascript too, which is automatically generated. Using newlines in here will cause errors in the javascript, which will cause the game to not load.

Example:

```
"tie_breaker_description": "Number of remaining cards in hand",
```

## Multiple tie breaker management

If your game has multiple tie breakers, here is what you should do.

Let's take this example: "In case of a tie, the winner is the player with the most remaining money, then number of buildings built, then number of cards in your hand".

In this example, your playerScoreAux field might be calculated like this:

10000 \* (remaining_money ) + 100 \* (buildings_built) + (number_of_cards)

In this case, you should add the following in gameinfos.inc.php:

```
 "tie_breaker_split": [10000, 100 , 1],
```

It means that the first tie breaker has been multiplied by 10000, the second by 100, and the third by 1.

Using this, the result screen will be adapted to show exactly what is needed. For example:

- When 2 players are tied, it will show their remaining money.
- If their remaining money are equal, it will show the number of building built in addition to the remaining money.
- If these two tie breaker are still the same, it will show the 3 tie breaking values.

## Language dependency

If you have a game that is language dependent, you can use the option described here: [Main_game_logic:_yourgamename.game.php#Language_dependent_games_API](https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Language_dependent_games_API "Main game logic: yourgamename.game.php")

## Coop Elo Mode

For cooperative games, by default players will earn as many rating points as the score. Games ended with a positive score counts as wins, and scores of 0 or below count as losses.

For games where there is no or little variable difficulty (such as for example Bandido) the fixed amount of score can be assigned across all settings. However, for all coop games where we have options to change the difficulty level and/or where the score reached indicates a higher level of skill and/or where the number of players has a significant impact on the difficulty, the final score should be adjusted according to the difficulty level and the number of players.

If needed, a reference scale for Elo points (between 1300 and 2500) can be set up. Players regularly winning with a specific difficulty setting will have their Elo nearing this value asymptotically over time. For this, you can set up the coop_elo_mode parameter.

**Warning: While this can reflect player skills more precisely compared to flat rating gain, this parameter is generally not recommended as players may abandon losing games or avoid new players to prevent rating loss.**

Related discussion:

<https://forum.boardgamearena.com/viewtopic.php?f=3&t=24363>

<https://boardgamearena.com/forum/viewtopic.php?t=32289>

Here is an example using options and win/loss (score 1/0):

```js
   'coop_elo_mode' => [
       'type' => 'points_references',
       'references' => [
           // Difficulty 1
           ['players_nbr' => 2, 'options' => [100 => 1, 101 => 0], 'elo' => [0 => 1000, 1 => 1400]],
           ['players_nbr' => 2, 'options' => [100 => 1, 101 => 1], 'elo' => [0 => 1000, 1 => 1470]],
           ['players_nbr' => 3, 'options' => [100 => 1, 101 => 0], 'elo' => [0 => 1000, 1 => 1350]],
           ['players_nbr' => 3, 'options' => [100 => 1, 101 => 1], 'elo' => [0 => 1000, 1 => 1400]],
           ['players_nbr' => 4, 'options' => [100 => 1, 101 => 0], 'elo' => [0 => 1000, 1 => 1400]],
           ['players_nbr' => 4, 'options' => [100 => 1, 101 => 1], 'elo' => [0 => 1000, 1 => 1470]],
           // Difficulty 2
           ['players_nbr' => 2, 'options' => [100 => 2, 101 => 0], 'elo' => [0 => 1000, 1 => 1540]],
           ['players_nbr' => 2, 'options' => [100 => 2, 101 => 1], 'elo' => [0 => 1000, 1 => 1690]],
           ['players_nbr' => 3, 'options' => [100 => 2, 101 => 0], 'elo' => [0 => 1000, 1 => 1450]],
           ['players_nbr' => 3, 'options' => [100 => 2, 101 => 1], 'elo' => [0 => 1000, 1 => 1540]],
           ['players_nbr' => 4, 'options' => [100 => 2, 101 => 0], 'elo' => [0 => 1000, 1 => 1540]],
           ['players_nbr' => 4, 'options' => [100 => 2, 101 => 1], 'elo' => [0 => 1000, 1 => 1690]],
           // Difficulty 3
           ['players_nbr' => 2, 'options' => [100 => 3, 101 => 0], 'elo' => [0 => 1000, 1 => 1690]],
           ['players_nbr' => 2, 'options' => [100 => 3, 101 => 1], 'elo' => [0 => 1000, 1 => 1910]],
           ['players_nbr' => 3, 'options' => [100 => 3, 101 => 0], 'elo' => [0 => 1000, 1 => 1540]],
           ['players_nbr' => 3, 'options' => [100 => 3, 101 => 1], 'elo' => [0 => 1000, 1 => 1690]],
           ['players_nbr' => 4, 'options' => [100 => 3, 101 => 0], 'elo' => [0 => 1000, 1 => 1690]],
           ['players_nbr' => 4, 'options' => [100 => 3, 101 => 1], 'elo' => [0 => 1000, 1 => 1910]],
           // Difficulty 4
           ['players_nbr' => 2, 'options' => [100 => 4, 101 => 0], 'elo' => [0 => 1000, 1 => 1830]],
           ['players_nbr' => 2, 'options' => [100 => 4, 101 => 1], 'elo' => [0 => 1000, 1 => 2120]],
           ['players_nbr' => 3, 'options' => [100 => 4, 101 => 0], 'elo' => [0 => 1000, 1 => 1640]],
           ['players_nbr' => 3, 'options' => [100 => 4, 101 => 1], 'elo' => [0 => 1000, 1 => 1830]],
           ['players_nbr' => 4, 'options' => [100 => 4, 101 => 0], 'elo' => [0 => 1000, 1 => 1830]],
           ['players_nbr' => 4, 'options' => [100 => 4, 101 => 1], 'elo' => [0 => 1000, 1 => 2120]],
           // Difficulty 5
           ['players_nbr' => 2, 'options' => [100 => 5, 101 => 0], 'elo' => [0 => 1000, 1 => 1980]],
           ['players_nbr' => 2, 'options' => [100 => 5, 101 => 1], 'elo' => [0 => 1000, 1 => 2340]],
           ['players_nbr' => 3, 'options' => [100 => 5, 101 => 0], 'elo' => [0 => 1000, 1 => 1740]],
           ['players_nbr' => 3, 'options' => [100 => 5, 101 => 1], 'elo' => [0 => 1000, 1 => 1980]],
           ['players_nbr' => 4, 'options' => [100 => 5, 101 => 0], 'elo' => [0 => 1000, 1 => 1980]],
           ['players_nbr' => 4, 'options' => [100 => 5, 101 => 1], 'elo' => [0 => 1000, 1 => 2340]],
       ],
   ],
```

Here is an example using different scoring values to indicate the level of difficulty mastered by the players winning the game:

```js
   'coop_elo_mode' => array(
       'type' => 'points_references',
       'references' => array(
           array(
               'players_nbr' => 2,
               //'options' => array( ),
               'elo' => array(
                   0 => 1000,
                   1 => 1350,
                   2 => 1425,
                   3 => 1500,
                   4 => 1576,
                   5 => 1651,
                   6 => 1727,
                   7 => 1802,
                   8 => 1878,
                   9 => 1953,
                   10 => 2029,
                   11 => 2104,
                   12 => 2180
               )
           ),
           array(
               'players_nbr' => 3,
               //'options' => array( ),
               'elo' => array(
                   0 => 1000,
                   1 => 1400,
                   2 => 1470,
                   3 => 1541,
                   4 => 1612,
                   5 => 1683,
                   6 => 1754,
                   7 => 1825,
                   8 => 1895,
                   9 => 1966,
                   10 => 2018,
                   11 => 2095,
                   12 => 2250
               )
           ),
           array(
               'players_nbr' => 4,
               //'options' => array( ),
               'elo' => array(
                   0 => 1000,
                   1 => 1430,
                   2 => 1505,
                   3 => 1580,
                   4 => 1655,
                   5 => 1730,
                   6 => 1805,
                   7 => 1880,
                   8 => 1955,
                   9 => 2030,
                   10 => 2105,
                   11 => 2180,
                   12 => 2330
               )
           ),
           array(
               'players_nbr' => 5,
               // 'options' => array( ),
               'elo' => array(
                   0 => 1000,
                   1 => 1480,
                   2 => 1558,
                   3 => 1636,
                   4 => 1714,
                   5 => 1792,
                   6 => 1870,
                   7 => 1949,
                   8 => 2027,
                   9 => 2105,
                   10 => 2183,
                   11 => 2261,
                   12 => 2340
               )
           )
       )
   ),
```
