# ItemManager

> Source: http://en.boardgamearena.com/doc/ItemManager

"ItemManager" is a PHP component for storing and manipulating game objects. It is the object-oriented successor to the Deck component: instead of forcing every object into the five card fields, it maps a PHP class of your choice to a database table.

With ItemManager, you can:

- Store cards, tiles, dice, tokens, or other game objects as typed PHP objects.
- Add custom persisted fields directly to the object class.
- Organize items in ordered locations and sub-locations.
- Move, pick, shuffle, query, and update items without writing SQL.
- Automatically create the corresponding database table during game setup.

[Hearts](https://studio.boardgamearena.com/projects?game=hearts) is an example of game that uses ItemManager.

## ItemManager overview

Each ItemManager manages one PHP item class and one database table. The class and its persisted properties are described with PHP attributes:

- `#[Item]` on the class sets the table name.
- `#[ItemField]` on a public property makes that property persistent.
- Three field kinds are mandatory: `ID`, `LOCATION`, and `ORDER`.

ItemManager methods return instances of your item class rather than associative arrays. Methods returning several items use a [Collection](https://en.doc.boardgamearena.com/Collection "Collection") keyed by item ID.

### A basic item class

The following class describes ordinary playing cards:

```php
namespace Bga\Games\YourGame\Cards;

use Bga\GameFramework\Components\ItemManager\Item;
use Bga\GameFramework\Components\ItemManager\ItemField;
use Bga\GameFramework\Components\ItemManager\ItemFieldKind;

#[Item('card')]
class Card
{
    #[ItemField(kind: ItemFieldKind::ID)]
    public int $id;

    #[ItemField(kind: ItemFieldKind::LOCATION, locationIndex: 0)]
    public string $location;

    #[ItemField(kind: ItemFieldKind::LOCATION, locationIndex: 1)]
    public int|string|null $locationArg;

    #[ItemField(kind: ItemFieldKind::ORDER)]
    public int $order;

    #[ItemField]
    public int $suit;

    #[ItemField]
    public int $value;

    // This property has no #[ItemField], so it is not stored in the database.
    public string $displayName;
}
```

The mandatory fields have the following roles:

- **ID**: the unique integer identifier. An integer ID is generated automatically when an item is created.
- **LOCATION**: one or more values describing where the item is. Location indexes must start at 0 and be consecutive.
- **ORDER**: the item's zero-based position within its exact location. ItemManager keeps orders dense after moves.

The field names are yours to choose. The `kind` tells ItemManager which fields have the mandatory roles.

The first location field must be a non-null `string`, `int`, or `string|int`. Additional location fields must have the same possible base types and be nullable, because some locations may not need every part. ID and ORDER fields must be non-null integers.

### Custom fields

Any typed public property marked `#[ItemField]` is stored. ItemManager infers its storage type from the PHP property type:

- `bool`, `int`, `float`, and `string` use scalar columns.
- Arrays, objects, interfaces, and enums use JSON.
- Nullable properties store `NULL` when appropriate.

Objects stored as JSON are reconstructed as their declared PHP class when read. Set `serialize: true` only when PHP serialization is specifically required:

```php
#[ItemField]
public ?CardToken $token = null;

#[ItemField(serialize: true)]
public ?LegacyValue $legacyValue = null;
```

Use `dbField` when the PHP property name differs from an existing database column. This is particularly useful when migrating a Deck table:

```php
#[Item('card')]
class Card
{
    #[ItemField(kind: ItemFieldKind::ID, dbField: 'card_id')]
    public int $id;

    #[ItemField(kind: ItemFieldKind::LOCATION, locationIndex: 0, dbField: 'card_location')]
    public string $location;

    #[ItemField(kind: ItemFieldKind::LOCATION, locationIndex: 1, dbField: 'card_location_arg')]
    public ?int $location_arg;

    #[ItemField(kind: ItemFieldKind::ORDER)]
    public int $order;

    #[ItemField(dbField: 'card_type')]
    public int $type;

    #[ItemField(dbField: 'card_type_arg')]
    public int $type_arg;
}
```

In that case, you wil also need to add the order field on running tables, like this:

```php
    function upgradeTableDb($from_version) {
        if ($from_version <= 2605041658) {
            $sql = "ALTER TABLE `DBPREFIX_card` ADD `order` INT DEFAULT 0";
            $this->applyDbUpgradeToAllDB($sql);
        }
    }
```

### Locations and sub-locations

Locations must be registered before they are used. A typical card manager declares these locations:

```php
use Bga\GameFramework\Components\ItemManager\ItemLocation;

$locations = [
    new ItemLocation('deck'),
    new ItemLocation('discard'),
    new ItemLocation('table'),
    new ItemLocation('hand'),
];
```

For an item class with two LOCATION fields, `'deck'` is a complete location whose second part is `null`, while `['hand', $playerId]` identifies one player's hand.

Locations can be written in three equivalent forms where accepted:

```php
'deck'
['hand', $playerId]
Location::from('hand', $playerId)
```

For read methods, omitted trailing parts are unconstrained. A `null` in a non-trailing location part is also a wildcard, which lets a later part still be constrained. Arrays at a location part mean "any of these values":

```php
// Every player's hand: locationIndex 1 is omitted.
$items->getItemsInLocation('hand');

// Hands of players 12 and 34.
$items->getItemsInLocation(Location::filter('hand', [12, 34]));

// Items in either the deck or discard. The nested array filters locationIndex 0.
$items->getItemsInLocation(Location::filter([['deck', 'discard']]));
```

Filters are read-only. Moving or picking always requires a concrete location.

An ItemLocation name ending in `*` or `%` registers a prefix wildcard. For example, `new ItemLocation('played*')` accepts `'played1'`, `'played2'`, and so on. Prefer separate location fields when the suffix is structured data such as a player ID.

### Creating an ItemManager

Create the manager in your game or in a dedicated domain manager. Using a dedicated manager keeps item rules, queries, and notifications together.

```php
use Bga\GameFramework\Components\ItemManager\ItemLocation;
use Bga\GameFramework\Components\ItemManager\ItemManager;
use Bga\Games\YourGame\Game;
use Bga\Games\YourGame\Cards\Card;

class CardManager
{
    private ItemManager $items;

    public function __construct(Game $game)
    {
        $this->items = $game->bga->itemManagerFactory->createItemManager(
            Card::class,
            locations: ItemLocation::getDefaults(),
        );
    }

    public function initDb() {
        $this->items->initDb();
    }

    public function setup() {
        $cards = [];
        foreach ([1, 2, 3, 4] as $suit) {
            foreach (range(2, 14) as $value) {
                $cards[] = [
                    'location' => 'deck',
                    'suit' => $suit,
                    'value' => $value,
                ];
            }
        }
        $this->items->createItems($cards);
        $this->items->shuffle('deck');
    }
}
```

At the beginning of `setupNewGame`, create the database table, then create the initial items:

```php
$this->cardManager->initDb();
$this->cardManager->setup();
```

Do not also declare the generated table in `dbmodel.sql`. `initDb()` creates it from the item class.

### Simple examples

```php
// Deal five cards to each player.
foreach (array_keys($players) as $playerId) {
    $this->cards->pickItems(5, 'deck', ['hand', $playerId]);
}

// Return a typed Collection<Card>.
$hand = $this->cards->getItemsInLocation(['hand', $playerId]);

// Send a plain list to the client rather than an object keyed by card ID.
$result['_private']['hand'] = $hand->values();

// Change and persist one custom property.
$card->faceUp = true;
$this->cards->updateItem($card, 'faceUp');

// Move a card object; passing its ID would also work.
$this->cards->moveItem($card, 'discard');
```

## ItemManager component reference

### Attributes and supporting types

**#[Item( ?string $tableName = null )]**

Marks a class as managed by ItemManager. `$tableName` is the database table name. If omitted, the short class name is used. A table name can belong to only one managed class during a request.

**#[ItemField( ?ItemFieldKind $kind = null, ?string $type = null, ?string $dbField = null, bool $serialize = false, int $locationIndex = 0 )]**

Marks a typed public property as persisted.

- `$kind`: `ItemFieldKind::ID`, `ItemFieldKind::LOCATION`, `ItemFieldKind::ORDER`, or `null` for a custom field.
- `$type`: normally inferred. Supported values are `bool`, `int`, `float`, `double`, `string`, and `json`.
- `$dbField`: database column name; defaults to the PHP property name.
- `$serialize`: stores an object using PHP serialization instead of JSON.
- `$locationIndex`: the zero-based position of a LOCATION field.

**new ItemLocation( string|int $name, bool $randomPick = false, string|int|ItemLocation|null $autoReshuffleFrom = null, ?callable $autoReshuffleCallback = null )**

Declares an accepted top-level location.

- `$randomPick` shuffles that location before each pick, which is useful for a bag.
- `$autoReshuffleFrom` names another registered location to move and shuffle into this one when a pick cannot find enough items.
- `$autoReshuffleCallback` runs after an automatic reshuffle.

**ItemLocation::getDefaults( bool $reshuffleDiscardToDeck = true )**

Returns declarations for `deck`, `discard`, `table`, and `hand`. By default, picking from an insufficient deck automatically moves the discard pile into the deck and shuffles it.

**Location::from( array|string|int|Location $location, string|int|null ...$locations )**

Creates a concrete location. Pass either one list, one existing Location, or separate location parts:

```php
Location::from('deck');
Location::from(['hand', $playerId]);
Location::from('hand', $playerId);
```

**Location::filter( array|string|int|Location $location, string|int|array|null ...$locations )**

Creates a read-only location filter. A `null` part matches every value at that index, and an array part matches any value in that array. Use filters only with `getItemsInLocation` and `countItemsInLocation`.

### Initializing ItemManager

**$this->bga->itemManagerFactory->createItemManager( string $className, ?callable $classNameResolver = null, array $locations = [], ?callable $dbUpdateCallback = null, ?callable $countChangeCallback = null )**

Creates an ItemManager for `$className` and registers `$locations`.

The optional `$classNameResolver` receives a database row, or `null`, and returns the class to instantiate. A returned class must extend the managed base class. Returning `null` uses the base class. This lets different item types carry their behavior in subclasses:

```php
$this->items = $this->bga->itemManagerFactory->createItemManager(
    PowerCard::class,
    classNameResolver: fn(?array $row) => match ((int)($row['type'] ?? 0)) {
        1 => ExtraTurnCard::class,
        2 => DrawTwoCard::class,
        default => null,
    },
    locations: ItemLocation::getDefaults(),
);
```

The optional callbacks have these signatures:

```
dbUpdateCallback: function(string $tableName, array $linesByItemId, string $operation): void
countChangeCallback: function(string $tableName, array $changesByLocation): void
```

`$operation` is `'INSERT'` or `'UPDATE'`. Each count change contains `location`, an array of location parts, and `count`, the new count. These callbacks are useful for mirroring server-side changes; ordinary games usually do not need them.

**new ItemManager( string $className, ?callable $classNameResolver = null, ?callable $dbUpdateCallback = null, ?callable $countChangeCallback = null )**

Constructs a manager directly. Prefer `$this->bga->itemManagerFactory->createItemManager()`, which also registers the supplied locations.

**initDb()**

Creates the database table from the managed class. Call this at the beginning of `setupNewGame`, before `createItems()` or any query.

**addLocation( ItemLocation $location )**

Registers one accepted location.

**addLocations( array $locations )**

Registers several ItemLocation objects. Duplicate names and unknown `autoReshuffleFrom` references cause a configuration exception.

**getLocationByName( string|int $locationName )**

Returns the matching registered ItemLocation, including a prefix wildcard match, or `null` if no location matches.

### Creating items

**createItems( array $itemsTypes )**

Creates items from arrays whose keys are the PHP property names marked with `#[ItemField]`. The special `item_nbr` key creates multiple copies and defaults to 1. An integer ID is generated automatically, and ORDER is assigned at the end of each location unless explicitly supplied.

```php
$this->items->createItems([
    ['location' => 'deck', 'type' => 1, 'item_nbr' => 4],
    ['location' => 'table', 'type' => 2, 'faceUp' => true],
    [
        'location' => 'hand',
        'locationArg' => $playerId,
        'type' => 3,
    ],
]);
```

The location is mandatory. Unknown properties, invalid locations, and a negative `item_nbr` cause a configuration exception. The input rows are randomized before insertion, so creation order must not be used to infer hidden item types. This method returns no IDs; query the items after creation if they are needed.

### Picking items

**pickItem( Location|array|string|int $from, Location|array|string|int $to )**

Picks the top item from one concrete location, moves it to the end (top) of another, and returns the updated item. Returns `null` when nothing can be picked.

**pickItems( int $number, Location|array|string|int $from, Location|array|string|int $to )**

Picks up to `$number` items from the top of `$from`, moves them to `$to`, and returns a Collection keyed by item ID. Fewer items can be returned when the source is exhausted.

If the source has `randomPick: true`, it is shuffled before selecting. If it has `autoReshuffleFrom` and contains too few items, the remaining source items are picked first, the configured location is moved into the source and shuffled, and picking continues.

### Moving and ordering items

Within a location, lower ORDER values are at the beginning and the highest ORDER is the top. Moves reindex affected locations to consecutive values starting at 0.

**moveAllItemsInLocation( Location|array|string|int|null $from, Location|array|string|int $to )**

Moves every item from `$from` to the end of `$to`, preserving their relative order. Pass `null` as `$from` to gather all managed items into the destination.

**setItemOrder( object|int $itemOrItemId, int $order )**

Moves an item to the requested position within its current location. The position is clamped to the location bounds.

**moveItem( object|int $itemOrItemId, Location|array|string|int $to, ?int $order = null )**

Moves one item, supplied as an object or ID. By default it is appended to the destination. Set `$order` to insert it before the item currently at that position; use 0 to prepend it.

When an item object is supplied, ItemManager also updates that object's LOCATION and ORDER properties to their persisted values.

**moveItems( array|Collection $itemsOrItemIds, Location|array|string|int $to, bool $prepend = false )**

Moves item objects, IDs, or a Collection as one ordered block. Their existing relative order is retained. The block is appended by default or inserted at the beginning when `$prepend` is `true`. Duplicate item IDs are moved only once.

**getMaxOrderInLocation( Location|array|string|int $location )**

Returns the highest ORDER currently used by items matching the supplied concrete location parts. It returns 0 when no item matches. Supply every sub-location part when you want the maximum for only one sub-location.

### Getting items

All methods returning several items return a `Collection` of typed item objects keyed by item ID. Use `->values()` when a plain zero-based array is needed, especially before sending items to the client.

**getItemById( int $id )**

Returns the item with this ID, or `null` if it does not exist.

**getItemsByIds( array $ids, ?string $sortByField = null, bool $reversed = false )**

Returns items whose IDs are in `$ids`. Set `$sortByField` to a managed PHP property name. `$reversed` sorts that field descending instead of ascending.

**getItemsByFieldName( string $fieldName, mixed $values, ?int $limit = null, ?string $sortByField = null, bool $reversed = false )**

Returns items whose named managed property equals `$values`. Pass an array to match any of several values:

```php
$blueItems = $this->items->getItemsByFieldName('color', 'blue');
$redOrBlue = $this->items->getItemsByFieldName('color', ['red', 'blue']);
```

An empty values array returns an empty Collection. `$limit` restricts the result size. Sorting is applied only when `$sortByField` is supplied.

**getItemsByFieldNames( array $filters, ?int $limit = null, ?string $sortByField = null, bool $reversed = false )**

Combines several named field filters with AND. Each value can be one value or an array of accepted values. Both associative and tuple forms are accepted:

```php
$cards = $this->items->getItemsByFieldNames([
    'type' => [3, 4],
    'location' => 'hand',
    'locationArg' => $playerId,
]);

$sameCards = $this->items->getItemsByFieldNames([
    ['type', [3, 4]],
    ['location', 'hand'],
    ['locationArg', $playerId],
]);
```

An empty filter list returns all items, subject to the optional limit and sorting.

**getItemsByField( ItemField $field, mixed $values, ?int $limit = null, ?string $sortByField = null, bool $reversed = false )**

The ItemField-object variant of `getItemsByFieldName()`. In ordinary game code, prefer the field-name method.

**getItemsByFields( array $filters, ?int $limit = null, ?string $sortByField = null, bool $reversed = false )**

The ItemField-object variant of `getItemsByFieldNames()`. Each entry is `[$field, $values]`, and filters are combined with AND. In ordinary game code, prefer the field-name method.

**countItemsInLocation( Location|array|string|int $location )**

Returns the number of items matching a location or location filter. Non-trailing `null` parts and arrays of accepted values can be used as described under Locations and sub-locations.

**getItemsInLocation( Location|array|string|int $location, bool $reversed = false, ?int $limit = null, ?string $sortByField = null )**

Returns items matching a location or location filter. By default, items are sorted by ORDER ascending. Set `$reversed` to `true` for descending order, `$limit` to restrict the result size, or `$sortByField` to sort by another managed property.

```php
// Bottom to top.
$hand = $this->items->getItemsInLocation(['hand', $playerId]);

// The three highest-valued items in the discard pile.
$items = $this->items->getItemsInLocation(
    'discard',
    reversed: true,
    limit: 3,
    sortByField: 'value',
);
```

**getAllItems( ?int $limit = null )**

Returns all managed items, optionally limited. No ordering is guaranteed.

**getItemOnTop( Location|array|string|int $location )**

Returns the matching item with the highest ORDER, or `null` when no item matches. Supply every sub-location part when you want the top of only one sub-location.

**getItemsOnTop( int $number, Location|array|string|int $location )**

Returns up to `$number` matching items, ordered from top downward. Supply every sub-location part when you want items from only one sub-location.

### Updating items

Changing a PHP object does not by itself change the database. Persist it with `updateItem()` or `updateItems()`.

**updateItem( object $item, array|string|null $fields = null )**

Persists properties from one managed item. Pass one property name or an array of names to update only those fields. Pass `null` to update every persisted property except ID.

```php
$card->faceUp = true;
$this->items->updateItem($card, 'faceUp');
```

**updateItems( array|Collection $items, array|string|null $fields = null )**

Persists several managed item objects. The `$fields` argument behaves as in `updateItem()`.

**updateAllItems( string $fieldName, mixed $value )**

Sets one named managed property to the same value for every item in the table. The ID field cannot be updated this way.

**getItemFromDb( ?array $dbItem )**

Converts a raw database row into a typed managed item. Returns `null` for `null` or an empty row. The optional class-name resolver supplied when creating the manager selects the concrete class.

### Shuffling and hiding identifiers

**shuffle( Location|array|string|int $location )**

Randomizes the ORDER of all items matching the supplied concrete location parts. It does not change their IDs or location fields. Supply every sub-location part when each sub-location must be shuffled independently.

**changeIds( array|Collection $itemsOrItemIds )**

Changes the IDs of the supplied items and returns an array mapping each old ID to its new ID. Pass item objects, IDs, or a Collection. Supplied objects have their ID property updated.

This is useful when previously visible items become hidden again, so players cannot track them by ID.

**changeIdsForLocation( Location|array|string|int $location )**

Changes the IDs of every item matching the supplied concrete location parts. This method returns no old-to-new mapping.

### Database upgrades

**upgradeTableDbAddColumns( array $fieldNames )**

Adds columns for properties newly marked with `#[ItemField]` after games already exist. Call it from `upgradeTableDb()` with the PHP property names:

```php
public function upgradeTableDb($fromVersion)
{
    if ($fromVersion <= 2609011200) {
        $this->cards->upgradeTableDbAddColumns(['target', 'faceUp']);
    }
}
```

Existing columns are skipped. This helper only adds columns; data migrations or other schema changes still require an explicit upgrade query.

## Migrating from Deck

To match the old tables, you'll need to specify the dbField for all five columns pre-existing.

```php
#[Item('card')]
class Card
{
    #[ItemField(kind: ItemFieldKind::ID, dbField: 'card_id')]
    public int $id;

    #[ItemField(kind: ItemFieldKind::LOCATION, locationIndex: 0, dbField: 'card_location')]
    public string $location;

    #[ItemField(kind: ItemFieldKind::LOCATION, locationIndex: 1, dbField: 'card_location_arg')]
    public ?int $location_arg;

    #[ItemField(kind: ItemFieldKind::ORDER)]
    public int $order;

    #[ItemField(dbField: 'card_type')]
    public int $type;

    #[ItemField(dbField: 'card_type_arg')]
    public int $type_arg;
}
```

In this example, I kept the same field names, so you'll access your values with `$card->type` instead of `$card['type']`. You can change the name to `suit` or whatever you like!
Note that the array object was returning string values even for numeric columns, while the Card object now returns proper typings. Make sure your code works with proper typing.

As the ItemManager instanciate the table, remove from the dbmodel.sql file the table creation.

You will also need to add the order field, as the card_location_arg was doing the order but also some other stuff, with something like this (adapt to your locations using order):

```php
    function upgradeTableDb($from_version) {
        if ($from_version <= 2605041658) {
            $sql = "ALTER TABLE `DBPREFIX_card` ADD `order` INT DEFAULT 0, MODIFY `card_location_arg` INT NULL";
            $this->applyDbUpgradeToAllDB($sql);

            $sql = "UPDATE `DBPREFIX_card` SET `order` = `card_location_arg` WHERE `card_location` = 'deck'";
            $this->applyDbUpgradeToAllDB($sql);

            $sql = "UPDATE `DBPREFIX_card` SET `card_location_arg` = NULL WHERE `card_location` = 'deck'";
            $this->applyDbUpgradeToAllDB($sql);
        }
    }
```
