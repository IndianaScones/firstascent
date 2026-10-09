# Game statistics: stats.json

> Source: http://en.boardgamearena.com/doc/Game_statistics:_stats.json

In this file, you are describing game statistics, that will be displayed at the end of the game.

Note: you can use jsonc instead of json, to allow comments in the Json.

### File Structure

There are 2 types of statistics:

- table statistics, that are not associated to a specific player (i.e.: one value for each game).
- player statistics, that are associated to each players (i.e.: one value for each player in the game).

Statistics types can be "int" for integer, "float" for floating point values, and "bool" for boolean (0 false, any other value true).

Once you defined your statistics there, you can start using "tableStats->init / playerStats->init", "tableStats->set / playerStats->set" and "tableStats->inc / playerStats->inc" methods
in your game logic, using statistics names defined below.
See API <https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Game_statistics>.

If you want to skip some of your statistics according to game variants, do not init it, or call set or inc on it. It will be displayed as "-" (instead of 0 if you init it and don't update it afterwards)

!! It is not a good idea to modify this file when a game is running !!

If your game is already public on BGA, please read the following before any change:
<https://en.doc.boardgamearena.com/Post-release_phase#Changes_that_breaks_the_games_in_progress>

Notes:

- Statistic index is the reference used in set/inc/init PHP method
- Statistic index must contains alphanumerical characters and no space. Example: 'turn_played'
- Statistics IDs must be >=10
- Two table statistics can't share the same ID, two player statistics can't share the same ID
- A table statistic can have the same ID as a player statistics, however its not recommended unless it is same conceptually (like turns_number is same statistic in both per table and per player)
- Statistics ID is the reference used by BGA website. If you change the ID, you lost all historical statistic data. Do NOT re-use an ID of a deleted statistic.
- Statistic name is the English description of the statistic as shown to players
- The order in which the stats will appear in the endscreen is determined by the order in the array, NOT by the ID. That is helpful for stats which getting added later but need to be higher up in the list.
- Statistic names and labels are automatically added to the translations system, so there is no need to wrap them in totranslate() calls
- Previously, this was a PHP file (stats.inc.php). You can continue to use this format for old projects. (**Note**: once a game has been committed with a `stats.json` file, it is not possible to go back without admin intervention.
- (Number of table statistics) + (Number of player statistics × Maximum number of players) should not exceed ~930, or the game will crash. (Note: the maximum limit is not precise - Seems having stats around 980 broke the game, but reducing to around 930 solved this)

```
 {
   "table": {
     "turns_number": {
       "id": 10,
       "name": "Number of turns",
       "type": "int"
     }
   },
   "player": {
     "turns_number": {
       "id": 10,
       "name": "Number of turns",
       "type": "int"
     },
     "player_teststat1": {
       "id": 11,
       "name": "player test stat 1",
       "type": "int"
     },
     "player_teststat2": {
       "id": 12,
       "name": "player test stat 2",
       "type": "float"
     }
   }
 }
```

### Generate PHP initialization

In the Chrome DevTool console (F12), write

```php
stats = <Ctrl+V of the content of your stats.json file>

['table', 'player'].map(type => `$this->${type}Stats->init([${Object.keys(stats[type]).map(key => `'${key}'`).join(',')}], 0);`).join('\n')
```

Then on the result string do right click > Copy string content and paste it in your PHP setupNewGame function (this is assuming you want to init all your stats to 0).

To get example of inc of those stats, do

```php
['table', 'player'].map(type => Object.keys(stats[type]).map(key => `$this->${type}Stats->inc('${key}', 1${type === 'player' ? ', $playerId' : ''});`).join('\n')).join('\n')
```

### Labeled stats

Sometimes you may want to display a label instead of a number (for instance if you want to indicate the winning faction as a table statistic, and the faction chosen by each player as a player statistic in a game like Terra Mystica).

You can do this by adding a "value_labels" key following the "table" and "players" keys. Please note that the labels apply to both table and player statistics, so you should pay attention to use the same statistic number for the same type of statistic (or to skip one number if labelling should not be applied for both)

```
{
  "table": {
    "winning_race": {
      "id": 11,
      "name": "Winning race",
      "type": "int"
    },
  },
  "value_labels": {
    "11": [
      "None (or tied)",
      "Auren",
      "Witches",
      "Fakirs",
      "Nomads",
      "Chaos Magicians",
      "Giants",
      "Swarmlings",
      "Mermaids",
      "Dwarves",
      "Engineers",
      "Halflings",
      "Cultists",
      "Alchemists",
      "Darklings"
    ]
  }
}
```

### Limited access stats

If you want to consider some internal game statistics for game developer, publisher or admins's purpose only, simply add the following extra property : "display" => "limited". For instance :

```
{
  "player_teststat2": {
    "id": 12,
    "name": "player test stat 2",
    "type": "float",
    "display": "limited"
  }
}
```

### Translations

Note that any name or value_labels text in these JSON files are automatically added to the translation system, even though they aren't wrapped in totranslate() calls.
