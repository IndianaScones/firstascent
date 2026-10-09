# Deck

> Source: http://en.boardgamearena.com/doc/Deck

A new lib for game items has been added to the framework: **[ItemManager](https://en.doc.boardgamearena.com/ItemManager "ItemManager")**. *We recommend to use it instead of Deck.*

"Deck" is one of the most useful component on the PHP side. With "Deck", you can manage the cards in your game on the server side.

Using "deck", you will be able to use the following features without writing a single SQL database request:

- Place cards in a pile, shuffle cards, draw cards one by one or many at a time.
- "Auto-reshuffle" the discard pile into the deck when the deck is empty.
- Move cards between different locations: hands of players, the table, etc.

## Using Deck: Hearts example

The Deck component is extensively used in the sample *Hearts* card game. You will find in "hearts.game.php" that the object "$this->cards" is used many times.

## Deck overview

With Deck component, you manage all cards of your game.

### The 5 properties of each card

Using the Deck component, each card will have 5 properties:

- **id**: This is the unique ID of each card.
- **type** and **type_arg**: These two values define the type of your card (i.e., what sort of card is this?).
- **location** and **location_arg**: These two values define where the card is at now.

The id, type, and type_arg properties are constants throughout the game. location and location_arg change when your cards move from one place to another in the game area.

**id** is the unique ID of each card. Two cards cannot have the same ID. IDs are generated automatically by the Deck component when you create cards during the Setup phase of your game.

**type** and **type_arg** defines the type of your card.

**type** is a short string, and **type_arg** is an integer.

You can use these two values as you like to make sure you will be able to identify the different cards in the game. See usage of "type" and "type_arg" below.

Examples of usage of "type" and "type_arg":

- In *Hearts*, "type" represents the color (suite) of the card (1 to 4) and "type_arg" is the value of the card (1, 2, ... 10, J, Q, K).
- In *Seasons*, "type" represents the type of the card (e.g., 1 is Amulet of Air, 2 is Amulet of Fire, etc...). type_arg is not used.
- In *Takenoko*, a Deck component is used for objective cards. "type" is the kind of objective (irrigation/panda/plot) and "type_arg" is the ID of the specific objective to realize (e.g., "green bamboo x4"). Note that a second Deck component is used in *Takenoko* to manage the "garden plot" pile.

**location** and **location_arg** define where a card is at now. **location** is a short string, and **location_arg** is an integer.

You can use 'location' and 'location_arg' as you like, to move your card within the game area.

There are 3 special 'location' values that Deck manages automatically. You can choose to use these locations or not, depending on your needs:

- 'deck': the 'deck' location is a standard draw deck. Cards are placed face down in a stack and are drawn in sequential order during the game. 'location_arg' is used to specify where the card is located within the stack (the card with the highest location_arg value is the next to be drawn).
- 'hand': the 'hand' location represents cards in a player's hand. 'location_arg' is set to the ID of each player.
- 'discard': the 'discard' location is used for discard piles. Card in 'discard' may be reshuffled into the deck if needed (see "autoreshuffle").

Tips: using the Deck component, you will use generic properties ("location", "type_arg",...) for specific purposes in your game. Thus, during the design step before realizing your game, take a few minutes to write down the exact meaning of each of these generic properties in the context of your game.

### Create a new Deck component

For each Deck component in your game, you need to create a dedicated table in the SQL database. This table has a standard format. In practice, if you just want to have a Deck component named "card", you can copy/paste the following into your "dbmodel.sql" file:

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

Note: the database schema of this table does not have to be exactly what is listed above. You can increase the size of the fields or add more fields. For additional fields
you just have to do manual queries.

In particular, if you are going to have deck locations specific to individual players, you may wish to use their player IDs in the card_location field. Those IDs can be 8+ characters long, leaving only 8 characters for the rest of the name if you use the varchar(16). If you exceed the size of the field, it will get silently truncated, which can be very difficult to troubleshoot!

Once you have done this (and restarted your game), you can declare the Deck component in your PHP code in your class constructor. For *Hearts* for example, I added to the "Hearts()" method:

```php
        $this->cards = $this->deckFactory->createDeck('card');
```

Note that we specify "card" here: the name of our previously created table. This means you can create several "Deck" components with multiple tables:

```php
        $this->firstKindCards = $this->deckFactory->createDeck( "first_kind_card" );
        $this->secondKindCards = $this->deckFactory->createDeck( "second_kind_card" );
```

Most of the time this is not useful; a Deck component should manage all objects of the same kind (i.e., all cards in the game).
Note that you need to create a table for each "Deck", table name should be "first_kind_card" but the fields must remain "card_id", "card_type" and so on.

Afterwards, we can initialize your "Deck" by creating all the cards of the game. Generally, this is done only once during the game, in the "setupNewGame" method.

The "Deck" component provides a fast way to initialize all your cards at once: createCards. Here is how it is used for "Hearts":

```php
        // Create cards
        $cards = array();
        foreach( $this->colors as  $color_id => $color ) // spade, heart, diamond, club
        {
            for( $value=2; $value<=14; $value++ )   //  2, 3, 4, ... K, A
            {
                $cards[] = array( 'type' => $color_id, 'type_arg' => $value, 'nbr' => 1);
            }
        }

        $this->cards->createCards( $cards, 'deck' );
```

As you can see, "createCards" takes a description of all cards of the game. For each type of card, you have to specify its "type", "type_arg" and the number of cards to create ("nbr"). "createCards" create all cards and place them into the "deck" location (as specified in the second argument).

Now, you are ready to use "Deck"!

### Simple examples using Deck

(Most examples are from "Hearts" game)

```php
     // In "getAllDatas', we need to send to the current player all the cards he has in hand:
     $result['hand'] = $this->cards->getCardsInLocation( 'hand', $player_id );
```

```php
     // At some time we want to check if all the cards (52) are in player's hands:
     if( $this->cards->countCardInLocation( 'hand' ) == 52 )
           // do something
```

```php
     // When a player plays a card in front of him on the table:
     $this->cards->moveCard( $card_id, 'cardsontable', $player_id );

     // Note the use of the custom location 'cardsontable' here to keep track of cards on the table.
```

```php
     // This is a new hand: let's gather all cards from everywhere in the deck:
     $this->cards->moveAllCardsInLocation( null, "deck" );

     // And then shuffle the deck
     $this->cards->shuffle( 'deck' );

     // And then deal 13 cards to each player
     // Deal 13 cards to each players
     // Create deck, shuffle it and give 13 initial cards
     $players = $this->loadPlayersBasicInfos();
     foreach( $players as $player_id => $player )
     {
        $cards = $this->cards->pickCards( 13, 'deck', $player_id );
           
        // Notify player about his cards
        $this->bga->notify->player( $player_id, 'newHand', '', array( 
            'cards' => $cards
         ) );
     }  

     // Note the use of "notify->player" instead of "notify->all": new cards is a private information ;)
```

## Deck component reference

### Initializing Deck component

**init( $table_name )**

Initialize the Deck component.

Argument:

- table_name: name of the DB table used by this Deck component.

Must be called before any other Deck method.

Usually, init is called in your game constructor.

HINT: Create the deck object with $this->deckFactory->createDeck in the constructor or you will get "$this->cards" as an invalid reference later.

Example with Hearts:

```php
	function Hearts( )
	{
        (...)
        
        $this->cards = $this->deckFactory->createDeck('card');
	}
```

**createCards( $cards, $location='deck', $location_arg=null )**

Create card items in your deck component. Usually, all card items are created once, during the setup phase of the game.

"cards" describe all cards that need to be created. "cards" is an array with the following format:

```php
   // Create 1 card of type "1" with type_arg=99,
   //  and 4 cards of type "2" with type_arg=12,
   //  and 2 cards of type "3" with type_arg=33

   $cards = array(
        array( 'type' => 1, 'type_arg' => 99, 'nbr' => 1 ),
        array( 'type' => 2, 'type_arg' => 12, 'nbr' => 4 ),
        array( 'type' => 3, 'type_arg' => 33, 'nbr' => 2 )
        ...
   );
```

Note: During the "createCards" process, Deck generates unique IDs for all card items.

Note: createCards is optimized to create a lot of cards at once. Do not use it to create cards one by one.

If "$location" and "$location_arg" arguments are not set, newly created cards are placed in the "deck" location. If "location" (and optionally location_arg) is specified, cards are created for this specific location.

Note: 'location' and 'location_arg' can not be set individually, it does not read these values from the passed array of cards.

HINT: Be sure to do the createCards in setupNewGame. Doing createCards in the constructor will throw database errors.

### Card standard format

When Deck component methods are returning one or several cards, the following format is used:

```js
array(
   'id' => ..,          // the card ID
   'type' => ..,        // the card type
   'type_arg' => ..,    // the card type argument
   'location' => ..,    // the card location
   'location_arg' => .. // the card location argument
);
```

### Picking cards

**pickCard( $location, $player_id )**

Pick a card from a "pile" location (ex: "deck") and place it in the "hand" of specified player.

Return the card picked or "null" if there are no more card in given location.

The return value is an array of the card data elements (id, type, type_arg...) for that card.

This method supports auto-reshuffle (see "auto-reshuffle" below).

**pickCards( $nbr, $location, $player_id )**

Pick "$nbr" cards from a "pile" location (ex: "deck") and place them in the "hand" of specified player.

Return an array with the cards picked (indexed by the card ID), or "null" if there are no more card in given location.

Note that the number of cards picked can be less than "$nbr" in case there are not enough cards in the pile location.

This method supports auto-reshuffle (see "auto-reshuffle" below). In case there are not enough cards in the pile, all remaining cards are picked first, then the auto-reshuffle is triggered, then the other cards are picked.

**pickCardForLocation( $from_location, $to_location, $location_arg=0 )**

This method is similar to 'pickCard', except that you can pick a card for any sort of location and not only the "hand" location.

- from_location is the "pile" style location from where you are picking a card.
- to_location is the location where you will place the card picked.
- if "location_arg" is specified, the card picked will be set with this "location_arg".

This method supports auto-reshuffle (see "auto-reshuffle" below).

**pickCardsForLocation( $nbr, $from_location, $to_location, $location_arg=0, $no_deck_reform=false )**

This method is similar to 'pickCards', except that you can pick cards for any sort of location and not only the "hand" location.

- from_location is the "pile" style location from where you are picking some cards.
- to_location is the location where you will place the cards picked.
- if "location_arg" is specified, the cards picked will be set with this "location_arg".
- if "no_deck_reform" is set to "true", the auto-reshuffle feature is disabled during this method call.

This method supports auto-reshuffle (see "auto-reshuffle" below).

### Moving cards

**moveCard( $card_id, $location, $location_arg=0 )**

Move the specific card to given location.

- card_id: ID of the card to move.
- location: location where to move the card.
- location_arg: if specified, location_arg where to move the card. If not specified "location_arg" will be set to 0.

**moveCards( $cards, $location, $location_arg=0 )**

Move the specific cards to given location.

- cards: an array of IDs of cards to move.
- location: location where to move the cards.
- location_arg: if specified, location_arg where to move the cards. If not specified "location_arg" will be set to 0.

**insertCard( $card_id, $location, $location_arg )**

Move a card to a specific "pile" location where card are ordered.

If location_arg place is already taken, increment all cards after location_arg in order to insert new card at this precise location.

(note: insertCardOnExtremePosition method below is more useful in most of the case)

**insertCardOnExtremePosition( $card_id, $location, $bOnTop )**

Move a card on top or at bottom of given "pile" type location. (Lower numbers: bottom of the deck. Higher numbers: top of the deck.)

(note: Filling an empty location this way with N cards creates "location_arg"s from 1 to N if "$bOnTop" is true and -1 to -N if "$bOnTop" is false. This can cause off-by-one errors for code intended to run on a deck generated by "shuffle( $location )" which generates "location_arg"s from 0 to N - 1.)

**moveAllCardsInLocation( $from_location, $to_location, $from_location_arg=null, $to_location_arg=0 )**

Move all cards in specified "from" location to given location.

- from_location: where to take the cards. If null, cards from all locations will be move.
- to_location: where to put the cards
- from_location_arg (optional): if specified, only cards with given "location_arg" are moved.
- to_location_arg (optional): if specified, cards moved "location_arg" is set to given value. Otherwise "location_arg" is set to 0.

Note: if you want to keep "location_arg" untouched, you should use "moveAllCardsInLocationKeepOrder" below.

**moveAllCardsInLocationKeepOrder( $from_location, $to_location )**

Move all cards in specified "from" location to given "to" location. This method does not modify the "location_arg" of cards.

**playCard( $card_id )**

Move specified card at the top of the "discard" location.

Note: this is an alias for: insertCardOnExtremePosition( $card_id, "discard", true )

### Get cards informations

**getCard( $card_id )**

Get specific card information.

Return null if this card is not found.

**getCards( $cards_array )**

Get specific cards information.

$cards_array is an array of card IDs.

If some cards are not found or if some card IDs are specified multiple times, the method throws an (unexpected) Exception.

**getCardsInLocation( $location, $location_arg = null, $order_by = null )**

Get all cards in specific location, as an array. Return an empty array if the location is empty.

- location (string): the location where to get the cards.
- location_arg (optional): if specified, return only cards with the specified "location_arg".
- order_by (optional): if specified, returned cards are ordered by the given database field. Example: "card_id" or "card_type".

Using the "order_by" parameter changes the resulting array. Without parameter you get an associative array with the "card_id", with the paramter you get a simple indexed array.

**countCardInLocation( $location, $location_arg=null )**

Return the number of cards in specified location.

- location (string): the location where to count the cards.
- location_arg (optional): if specified, count only cards with the specified "location_arg".

**countCardsInLocations()**

Return the number of cards in each location of the game.

The method returns an associative array with the format "location" => "number of cards".

Example:

```js
  array(
    'deck' => 12,
    'hand' => 21,
    'discard' => 54,
    'ontable' => 3
  );
```

**countCardsByLocationArgs( $location )**

Return the number of cards in each "location_arg" for the given location.

The method returns an associative array with the format "location_arg" => "number of cards".

Example: count the number of cards in each player's hand:

```js
    countCardsByLocationArgs( 'hand' );
    
    // Result:
    array(
        122345 => 5,    // player 122345 has 5 cards in hand
        123456 => 4     // and player 123456 has 4 cards in hand
    );
```

**getPlayerHand( $player_id )**

Get all cards in given player hand.

Note: This is an alias for:
getCardsInLocation( "hand", $player_id )

**getCardOnTop( $location )**

Get the card on top of the given ("pile" style) location, or null if the location is empty.

Note that the card pile won't be "auto-reshuffled" if there is no more card available.

**getCardsOnTop( $nbr, $location )**

Get the "$nbr" cards on top of the given ("pile" style) location.

The method return an array with at most "$nbr" elements (or a void array if there is no card in this location).

Note that the card pile won't be "auto-reshuffled" if there is not enough cards available.

**getExtremePosition( $bGetMax ,$location )**

(rarely used)

Get the position of cards at the top of the given location / at the bottom of the given location.

Of course this method works only on location in "pile" where you are using "location_arg" to specify the position of each card (example: "deck" location).

If bGetMax=true, return the location of the top card of the pile.

If bGetMax=false, return the location of the bottom card of the pile.

**getCardsOfType( $type, $type_arg=null )**

Get all cards of a specific type (rarely used).

Return an array of cards, or an empty array if there is no cards of the specified type.

- type: the type of cards
- type_arg: if specified, return only cards with the specified "type_arg".

**getCardsOfTypeInLocation( $type, $type_arg=null, $location, $location_arg = null )**

Get all cards of a specific type in a specific location (rarely used).

Return an array of cards, or an empty array if there is no cards of the specified type.

- type: the type of cards
- type_arg: if specified, return only cards with the specified "type_arg".
- location (string): the location where to get the cards.
- location_arg (optional): if specified, return only cards with the specified "location_arg".

### Shuffling

**shuffle( $location )**

Shuffle all cards in specific location.

Shuffle only works on locations where cards are on a "pile" (ex: "deck").

Please note that all "location_arg" will be reset to reflect the new order of the cards in the pile.

### Auto-reshuffle

To enable auto-reshuffle you must do "`$this->cards->autoreshuffle = true`" during the setup of the component (often in the *_construct* function when you *init()* the Deck object).

Every time a card must be retrieved from the "deck" location, if it is empty the "discard" location will be automatically reshuffled into the "deck" location.

If you need to notify players when the deck is shuffled, you can setup a callback method using this feature:

```php
$this->cards->autoreshuffle_trigger = array('obj' => $this, 'method' => 'deckAutoReshuffle');
```

If you need to use other locations than "deck" and "discard" for auto-reshuffle feature, you can configure it this way:

```php
$this->cards->autoreshuffle_custom = array('deck' => 'discard');
```

(replace 'deck' and 'discard' with your custom locations).
