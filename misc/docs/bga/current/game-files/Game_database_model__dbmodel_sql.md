# Game database model: dbmodel.sql

> Source: http://en.boardgamearena.com/doc/Game_database_model:_dbmodel.sql

In this file, you specify the database schema of your game.

This file contains SQL queries that will be executed during the creation of your game table.

**Note:** you can't change the database schema during the game.

## Create your schema

To build this file, we recommend you build the tables you need with the PhpMyAdmin tool (see the BGA user guide), and then export them and copy/paste the content to this file.

**Note:** the name of a column must not be the same as the name of the table, as the framework replay function relies on regexp substitution to save/restore the previous state in a clone table with another name.

Example: Deck component, see [Deck](https://en.doc.boardgamearena.com/Deck "Deck")

```sql
CREATE TABLE IF NOT EXISTS `card` (
  `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_type` varchar(16) NOT NULL,
  `card_type_arg` int(11) NOT NULL,
  `card_location` varchar(16) NOT NULL,
  `card_location_arg` int(11) NOT NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
```

Example: Euro Game. See details on database design for euro game at [BGA_Studio_Cookbook#Database_for_The_euro_game](https://en.doc.boardgamearena.com/BGA_Studio_Cookbook#Database_for_The_euro_game "BGA Studio Cookbook")

```sql
CREATE TABLE IF NOT EXISTS `token` (
  `token_key` varchar(32) NOT NULL,
  `token_location` varchar(32) NOT NULL,
  `token_state` int(10),
  PRIMARY KEY (`token_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

Rules you should follow:

- Do not overcomplicate, you are dealing with games with 50-500 pieces!
  - If you have 5 tables for a card game with 30 cards - it is overkill
- The database should only be storing dynamic data, all static data should be stored in material file (php).
  - Example: if you have cards that have power, color, and special abilities. In the database, you only need to store the card type, all the other properties should not be there. The only exception is if it changes during the game.
- Columns should be permanent, independent of the game data, i.e. location, type, position, row, etc.
  - Example: do not create columns such as Country1, Country2, Country3, etc.
- Do not store translatable strings in the database, use an integer number of "ident" to access properties
  - i.e. card type should be "22" or "bob_cat", instead of "Bob's cat"
- Create a separate module in PHP to handle all database queries, do a lot of type checking to prevent SQL injections

Example of method to handle a database query:

```php
    // Set token state
    function setTokenState($token_key, $state) {
        self::checkState($state); // ensure state is number
        self::checkKey($token_key); // ensure key is alphanum
        $sql = "UPDATE `{$this->table}`";
        $sql .= " SET `token_state` = '$state'";
        $sql .= " WHERE `token_key` = '$token_key'"; // don't need to escape anymore since we checked key before
        self::DbQuery($sql);
        return $state;
    }
```

## Default tables

By default, BGA creates four tables for your game: **global**, **stats**, **gamelog**, and **player**.

You **MUST NOT MODIFY** the schemas of the **global**, **stats**, or **gamelog** tables, and any **bga_** prefixed table (and you must not access them directly with SQL queries in your PHP code).

### The **player** table

You may add columns to the **player** table. It is very practical to add simple values associated with players. **NB:** you must not alter existing columns created by the framework.

Example:

```sql
ALTER TABLE `player` ADD `player_reserve_size` SMALLINT UNSIGNED NOT NULL DEFAULT '7';
```

The commonly used columns of the default "player" table are:

- **player_no**: the index of a player in natural playing order (starting with 1)
- **player_id** (int)
- **player_name**: (note: it is better to access this data with the getActivePlayerName() or loadPlayersBasicInfos() methods)
- **player_score**: the current score of a player (displayed in the player panel). Update this field with $this->playerScore, to update a player's score.
- **player_score_aux**: the secondary score, used as a tie breaker. Update this field with $this->playerScoreAux, according to tie breaking rules of the game (see also: [Manage_player_scores_and_Tie_breaker](https://en.doc.boardgamearena.com/Main_game_logic:_yourgamename.game.php#Manage_player_scores_and_Tie_breaker "Main game logic: yourgamename.game.php"))

- **player_table_order**: gives an indication of the rank of the player by order of arrival in the lobby (starting with 1). It is not the same as player_no (which is the player order within the game). player_table_order is useful for setting custom teams if desired in a game option (for instance, 1st-2nd vs 3rd-4th).  
  **Note:** player_table_order *only exists during game initialization* (in the **setupNewGame** function). It is not added as a column in the **players** Db table.

**CAUTION:** **player_table_order** is not guaranteed to be equal to the rank of the player in the table. For example, in a four-player game, if the table was full but the third player leaves before the game starts, the fourth player becomes the third on this table but their player_table_no is still equal to four! If another player then joins, their player_table_no will then be 5.  
Thus, it is essential to normalize these values first in the game setup if you wish to use them to prevent bugs at game launch. For example, if the set of player_table_order are <player A>: 3, <player B>: 2, <player C>: 5, <player D>: 7, you see that you can't read those values as ranks directly, but you can still deduce that <player B> was first on the table, then <player A>, then <player C>, and then <player D> 😉

See [Assigning Player Order](https://en.doc.boardgamearena.com/BGA_Studio_Cookbook#Assigning_Player_Order) in the **BGA Studio Cookbook** for an example.

## CREATE TABLES

You can create tables, using engine InnoDB.
See examples above on how to create tables.
Pay attention to the following:

- Always add IF NOT EXISTS
- Always set ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
- Define primary keys
- If you create NOT NULL fields after the game has gone into production, make sure you took care of the database migration

**Note**: if you use comments, then you must not do it in the same line as the code.

Example:

```sql
`activated` BOOL NOT NULL DEFAULT 1, --  activated or not
```

will also comment out the whole column `activated` BOOL, and that code will not be executed.

## PHP

Database initialization (filling the table created by this file) should be in the function setupNewGame() in 'Game.php'.

Database schema migration should be in the function upgradeTableDb(), see below.

Warning: all CREATE/ALTER tables and views should be in dbmodel.sql. Do not call these queries from PHP to avoid implicit commits <https://dev.mysql.com/doc/refman/5.7/en/implicit-commit.html>
which will cause issues. The only time you can do such queries from PHP is in the upgradeTableDb() method.

## Errors Log

To trace Database creation, check the logs that you can access in /admin/studio.

## Post-release database modification

If you want to modify your database schema after the first release of your game to production, then you should implement the upgradeTableDb() method, see [Updating the database schema after release](https://en.doc.boardgamearena.com/Post-release_phase#Updating_the_database_schema "Post-release phase")

## Uses and misuses of AUTO_INCREMENT

AUTO_INCREMENT is not particularly well-named; it's best to think of it as simply guaranteeing uniqueness of a column value. Try to design your schema and model so you don't require strictly-increasing-by-one identifiers; do not assume that the next row inserted will have a value one larger than the current maximum.

While it does generally produce consecutive values, it does not guarantee contiguous generation (i.e. you can end up with "skipped" numbers). Technically you can even end up with later-number rows being inserted earlier (you'd likely only notice or care about that if you also had a "creation_timestamp" column, though, and wanted it to be "in sync" with the auto_incremented column).
More details can be found [here](https://dev.mysql.com/doc/refman/8.4/en/innodb-auto-increment-handling.html#innodb-auto-increment-configurable)

## Beware of the size

Please note the database size for each game is not unlimited, if size of all table (including system tables) exceeds 64Mb it will stop working.
The biggest contributor to this will be gamelog and reply related tables, therefore please consider the size when designing data send for each state (args) and player's notifications.
