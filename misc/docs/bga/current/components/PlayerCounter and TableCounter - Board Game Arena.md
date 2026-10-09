# PlayerCounter and TableCounter

> Source: http://en.boardgamearena.com/doc/PlayerCounter_and_TableCounter

Counters allow to manipulate numbers in the game. PlayerCounter is for counters that have a distinct value for each player (for example, the player money). TableCounter is for single values, like current round.

## Overview

They both share similar functions, and they can update automatically the JS counter (see [Counter](https://en.doc.boardgamearena.com/Counter "Counter") "create" parameters).

You can initialize them using the counterFactory available in the Game class (and State classes) like this:

```php
        $this->roundCounter = $this->counterFactory->createTableCounter('round');
        $this->playerCredits = $this->counterFactory->createPlayerCounter('credits');
```

Note that by default, they have a min to 0 and no max, but you can change that in the create function.

Two PlayerCounter are available by default on the games, playerScore and playerScoreAux. As their name suggests, they will update the player_score and player_score_aux for you (and the score counter on the player panels, front-side), so you never need to update manually the scores on the DB. They don't have a min, and default is 0, so if you need to set a different initial value, call `$this->playerScore->setAll(2)`. By default, they use player id and are not strict.

**$this->counterFactory->createPlayerCounter(string $name, ?int $min = 0, ?int $max = null, CounterVisibility $visibility = CounterVisibility::VISIBLE, bool $useNo = false, ?bool $strict = null): PlayerCounter**

**$this->counterFactory->createTableCounter(string $name, ?int $min = 0, ?int $max = null): TableCounter**

Visibility can be:

- public (default): everyone can see the counter values
- self: only the current player can see the value of their counter, bot not the others (that will display '-')
- private: nobody can see the counter values (that will display '-')

useNo means everytime you use the counter, you will pass player no instead of player id.

strict means an exception is triggered if you send an id or a no that doesn't exist at the table.

## PlayerCounter

initDb(array $playerIdsOrNos, int $initialValue = 0)
:   Creates database table if needed (bga_player_counters). Must be called from `setupNewGame` (or if adding to older games in `upgradeTableDb`).
:   Parameters:

    - `array $playerIdsOrNos` the player ids (or player no) having the counter (usually, `array_keys($players)`, but you might want to add 0 for an automata)
    - `int $initialValue` initial value, if different than 0

get(int $playerIdOrNo): int
:   Returns the current value of the counter for a player.
:   Parameters:

    - `int $playerIdOrNo` the player id (or no if useNo: true)
:   Throws:

    - `UnknownPlayerException` if $playerId is not in the player ids initialized by `initDb`

set(int $playerIdOrNo, int $value, ?\Bga\GameFramework\NotificationMessage $message): int
:   Set the value of the counter, and send a notif (of type `setPlayerCounter)` to update the value on the front side. Returns the new value.
:   Parameters:

    - `int $playerIdOrNo` the player id (or no if useNo: true)
    - `int $value` the new value
    - `?\Bga\GameFramework\NotificationMessage $message` the next notif to send to the front. Empty for no log, null for no notif at all (the front will not be updated).
:   Throws:

    - `OutOfRangeCounterException` if the value is outside the min/max
    - `UnknownPlayerException` if $playerId is not in the player ids initialized by initDb

inc(int $playerIdOrNo, int $inc, ?\Bga\GameFramework\NotificationMessage $message): int
:   Increment the value of the counter, and send a notif (of type `setPlayerCounter)`to update the value on the front side. Returns the new value. Note: if the inc is 0, no notif will be sent.
:   Parameters:

    - `int $playerIdOrNo` the player id (or no if useNo: true)
    - `int $inc` the value to add to the current value
    - `?\Bga\GameFramework\NotificationMessage $message` the next notif to send to the front. Empty for no log, null for no notif at all (the front will not be updated).
:   Throws:

    - `OutOfRangeCounterException` if the value is outside the min/max
    - `UnknownPlayerException` if $playerId is not in the player ids initialized by initDb

getMin(): int
:   Returns the lowest value.

getMax(): int
:   Returns the highest value.

getAll(): array
:   Return the values for each player, as an associative array ($playerId or $playerNo) => $value.

setAll(int $value, ?\Bga\GameFramework\NotificationMessage $message): int
:   Set the value of the counter for all the players, and send a notif (of type `setPlayerCounterAll)` to update the value on the front side. Returns the new value.
:   Parameters:

    - `int $value` the new value
    - `?\Bga\GameFramework\NotificationMessage $message` the next notif to send to the front. Empty for no log, null for no notif at all (the front will not be updated).
:   Throws:

    - `OutOfRangeCounterException` if the value is outside the min/max

fillResult(array &$result, ?string $fieldName = null, ?int $currentPlayerId = null)
:   Updates the result object, to be used in the `getAllDatas` function. Will set the value on each `$result["players"]` sub-array.
:   Parameters:

    - `array &$result` the object to update
    - `?string $fieldName` the field name to set in $result["players"], if different than the counter name.
    - `?int $currentPlayerId` the current player for visibility "self".

setVisibility(CounterVisibility $visibility)
:   Set the counter visibility.

isVisible()
:   bool
:   Return if the counter is visible by anyone.

isHidden()
:   bool
:   Return if the counter is invisible.

isSelf()
:   bool
:   Return if the counter is visible by the current player only.

setUseNo(bool $useNo)
:   Tell if the counter input will be player no (true) or player id (false)

setStrict(bool $strict)
:   Tell if the counter input will be validated. If true, the counter will trigger an exception if the no or id doesn't exist in the game.

## TableCounter

initDb(int $initialValue = 0)
:   Creates database table if needed (bga_table_counters). Must be called from `setupNewGame`.
:   Parameters:

    - `int $initialValue` initial value, if different than 0

get(): int
:   Returns the current value of the counter.

set(int $value, ?\Bga\GameFramework\NotificationMessage $message): int
:   Set the value of the counter, and send a notif (of type `setTableCounter)` to update the value on the front side. Returns the new value.
:   Parameters:

    - `int $value` the new value
    - `?\Bga\GameFramework\NotificationMessage $message` the next notif to send to the front. Empty for no log, null for no notif at all (the front will not be updated).
:   Throws:

    - `OutOfRangeCounterException` if the value is outside the min/max

inc(int $inc, ?\Bga\GameFramework\NotificationMessage $message): int
:   Increment the value of the counter, and send a notif (of type `setTableCounter)`to update the value on the front side. Returns the new value. Note: if the inc is 0, no notif will be sent.
:   Parameters:

    - `int $inc` the value to add to the current value
    - `?\Bga\GameFramework\NotificationMessage $message` the next notif to send to the front. Empty for no log, null for no notif at all (the front will not be updated).
:   Throws:

    - `OutOfRangeCounterException` if the value is outside the min/max

fillResult(array &$result, ?string $fieldName = null)
:   Updates the result object, to be used in the `getAllDatas` function.
:   Parameters:

    - `array &$result` the object to update
    - `?string $fieldName` the field name to set in $result[, if different than the counter name.

## Default args sent to the notif

The notification sent to the front-end will contain some default args, so if you want to write something like this:

```php
$this->playerScore->inc(
  $playerId, 
  -1, 
  new NotificationMessage(clienttranslate('${player_name} loses ${absInc} points with played card ${card_name}'), ['card_name' => 'Hunter'])
);
```

The NotificationMessage args only needs the one that are not supplied automatically by the PlayerCounter.

Built-in args are:

- name: the name of the player counter
- value: the new value
- oldValue: the value before the update
- inc: the increment
- absInc: the absolute value of the increment, allowing you to use `'...loses ${absInc} ...'` in the notif message if you are incrementing with a negative value
- playerId (only for PlayerCounter)
- player_name (only for PlayerCounter)

## Example

To have a counter to store and display the player energy, you will have :

In the Game class properties (with `use Bga\GameFramework\Components\Counters\PlayerCounter;` on top of the file):

```
public PlayerCounter $playerEnergy;
```

In __construct of Game class:

```php
$this->playerEnergy = $this->counterFactory->createPlayerCounter('energy');
```

In setupNewGame:

```php
$this->playerEnergy->initDb(array_keys($players));
```

In getAllDatas:

```php
$this->playerEnergy->fillResult($result);
```

In an act function (i.e. in State class), when you want to update it:

```php
$this->game->playerEnergy->inc($activePlayerId, 1);
```

In the JS setup:

```js
            Object.values(gamedatas.players).forEach(player => {
                this.bga.playerPanels.getElement(player.id).insertAdjacentHTML('beforeend', `
                    <div id="energy-player-counter-${player.id}"></div> 
                    <span>${_("Energy")}</span>
                `);
                const counter = new ebg.counter();
                counter.create(
                    `energy-player-counter-${player.id}`, 
                    { value: player.energy, playerCounter: 'energy', playerId: player.id }
                );
            });
```

Nothing more needs to be set, the JS counter will update automatically when you call `set` or `inc`!

For a TableCounter, the value will be sent directly in the gamedatas, with the fieldName you set in fillResult, or with the counter name if no fieldName is set.

```js
                const counter = new ebg.counter();
                counter.create(
                    `remaining-tokens-counter`, 
                    { value: gamedatas.remainingTokens, tableCounter: 'remainingTokens' }
                );
```

## Listen to counter notification on the client

If you want to get the update values on the client for something else than updating a Counter, you can listen to the predefined notification to do additional stuff:

```js
    async notif_setPlayerCounter(args) {
        const { name, value, oldValue, inc, absInc, playerId } = args;
        if (name === 'energy') {
            this.getPlayerTable(playerId).setEnergyTokens(value);
        }
    }
```

In the same fashion, there is `notif_setTableCounter` and `notif_setPlayerCounterAll`.

## Game's default Player Score

The default `PlayerCounter` provided by `game` relies on reading `score` from `gamedatas`. As such, make sure that you provide it in `getAllDatas():`

```php
  $result["players"] = $this->getCollectionFromDb(
            "SELECT `player_id` `id`, `player_score` AS `score` FROM `player`"
        );
```
