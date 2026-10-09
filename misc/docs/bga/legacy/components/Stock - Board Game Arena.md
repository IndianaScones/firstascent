# Stock

> Source: http://en.boardgamearena.com/doc/Stock

A new lib for cards has been added to the framework: **[BgaCards](https://en.doc.boardgamearena.com/BgaCards "BgaCards")**. *We recommend to use it instead of Stock.*

## Overview

**Stock** is a javascript component that you can use in your game interface to display a set of elements of the same size that need to be arranged in single or multiple lines.

Stock is very flexible and is the most used component in BGA games.

Examples of stock use cases:

- Display a set of cards, typically hands (examples: *Hearts*, *Seasons*, *The Boss*, *Race for the Galaxy*).
- Display items in player panels (examples: *Takenoko*, *Amyitis*, ...)
- ... Many other situations. For example, black dice and cubes on cards in *Troyes* are displayed with stock components.

Using stock:

- Your items are arranged nicely and sorted by type.
- When adding or removing items to a set, all items slide smoothly to their new position in the set.
- Selecting and unselecting items are built-in functions.
- You don't have to worry about inserting/removing HTML code; the entire life cycle of the stock is managed by the component.

## Using stock: a simple example

Let's have a look at how the stock is used in the game *Hearts* to display a hand of standard cards.

First, don't forget to add "ebg/stock" as a dependency in your js file:

```
const [stock] = await importDojoLibs(['ebg/stock']);
```

The stock is initialized in the Javascript "setup" method like this:

```
    // Player hand
    this.playerHand = new ebg.stock();
    this.playerHand.create( this.bga.gameui, $('myhand'), this.cardwidth, this.cardheight );
```

Explanations:

- We create a new stock object for the player hand.
- As parameters of the "create" method, we provide the width/height of an item (a card), and the div container "myhand" - which is a simple empty "div" element defined in our HTML template (.tpl).

Then, we must tell the stock what items it is going to display during its life: the 52 cards of a standard card game. Of course, we did not create 52 different images, but a "CSS sprite" image named "cards.jpg" with the cards arranged in 4 rows and 13 columns.

Here's how we tell stock what items to display:

```js
    // Specify that there are 13 images per row in the CSS sprite image
    this.playerHand.image_items_per_row = 13;

    // Create card types:
    for( var color=1;color<=4;color++ )
    {
        for( var value=2;value<=14;value++ )
        {
            // Build card type id
            var card_type_id = this.getCardUniqueId( color, value );
            this.playerHand.addItemType( card_type_id, card_type_id, this.bga.images.getImgUrl('cards.jpg'), card_type_id );
        }
    }
```

Explanation:

- First, we tell the stock component that our CSS sprite contains 13 items per row. This way, it can find the correct image for each card type id.
- Then for the 4x13 cards, we call the "addItemType" method that creates the type. The arguments are the type id, the weight of the card (for sorting purpose), the URL of our CSS sprite, and the position of our card image in the CSS sprite.

Note: In this specific example we need to generate a unique ID for each type of card based on its color and value. This is the only purpose of "getCardUniqueId".

From now on, if we need to add a card - for example, the 5 of Hearts - to a player's hand, we can do this:

```js
this.playerHand.addToStock( this.getCardUniqueId( 2 /* 2=hearts */, 5 ) );
```

In reality, cards have some IDs, which are useful to manipulate them. This is the reason we are using "addToStockWithId" instead:

```js
this.playerHand.addToStockWithId( this.getCardUniqueId( 2 /* 2=hearts */, 5 ), my_card_id );
```

If afterwards we want to remove this card from the stock:

```
this.playerHand.removeFromStockById( my_card_id );
```

## Complete stock component reference

for interest, the source is available here : <https://x.boardgamearena.net/data/themereleases/220811-1000/js/modules/stock.js> (this link may change with new release)

In the reference below the type StockItem refers to a record { id: number, type: number }, i.e. {id: 22, type: 3}

And StockItemType is record {weight: number, image: string, image_position: number}

### Creation

**create( page, container_div, item_width, item_height ):**

With create, you create a new stock component.

Parameters:

- page: the container page. Usually: "this.bga.gameui".
- container_div: the container "div" element. Its not an id, if you have id you can pass $(id). It must exists.
- width and height (in pixels) for the stock component.

(See *Hearts* example above).

**addItemType(type: number, weight: number, image: string, image_position: number ): void**

Define a new type of item (StockItemtType) and add it to the stock with given type id.

This is mandatory to define a new item type before adding it to the stock. Example: if you want to have a stock contain cubes of 3 different colors, you must add 3 item types (one for each color).

Parameters:

- type: id of the type to add. You can choose any positive integer. All item types must have distinct IDs.
- weight: weight of items of this type. Weight value is used to sort items of the stock during the display. Note that you can specify the same weight for all items; in this case, they are not sorted and their order might change randomly at any time.
- image: URL of item image. Most of the time, you will use a CSS sprite for stock items, so you have to specify CSS sprite image here.

Be careful: you must specify the image url as this:

```
  this.bga.images.getImgUrl('yourimage.png')
```

- image_position: if "image" specify the URL of a CSS sprite, you must specify the position of the item image in this CSS sprite. For example, if you have a CSS sprite with 3 cubes with a size of 20x20 pixels each (so your CSS image has for example a size of 20x60 or 60x20), you specify "0" for the first cube image, 1 for the second, 2 for the third.

*Important*: if there is more than one line of items in your CSS sprite, you must specify how many items per line you have in your CSS sprite, see image_items_per_row below:

**image_items_per_row**
Class member to set number of columns in css sprite (or how many items per row). I.e. if you sprite is 4 cards horizontally and 6 vertically, you have to set it to 4.

```
    // Specify that there are 10 image items per row in images used in "myStockObject" control.
    this.myStockObject.image_items_per_row = 4;
```

### Add/Remove items

**addToStock( type, from )**

Add an item to the stock, with the specified type, but without a unique ID.

To make your life easier, in most cases we suggest you use **addToStockWithId** in order to give an ID to the item added. **addToStock** is suitable when you are using a stock to control items that are generic game materials that don't need to be tracked individually (example: a bunch of money tokens).

Parameters:

- type: ID of the item type to use (as specified in "addItemType")
- from: OPTIONAL: if you specify an HTML item here, the item will appear on this item and will be slid to its position on the stock item.

Example:

```
  // Add a money token to the "player money" stock.
  // The money token will appear on "player_id" player panel and will move to its position.
  this.playerMoney.addToStock( MONEY_TOKEN, 'overall_player_board_'+player_id );
```

Important: for a given stock control, you must use either **addToStock** or **addToStockWithId**, but NEVER BOTH OF THEM.

**addToStockWithId( type, id, from )**

This is the same method as **addToStock**, except that it also associates an ID with the newly created item.

This is especially useful:

- When you need to know which item(s) have been selected by the user (see **getSelectedItems**).
- When you need to remove a specific item from the stock with **removeFromStockById**.

**removeFromStock( type, to, noupdate )**

Remove an item of the specific type from the stock.

'to' is an optional parameter. If "to" contains the ID of an HTML element, the item removed from the Stock slides to this HTML element before it disappears. Note that this method does not expose the associated animation object, however, so it's not possible to trigger other actions when it finishes, for example. If you need to do that, use Dojo's slideToObject() instead.

'noupdate' is an optional parameter. If set to "true" it will prevent the Stock display from changing. This is useful when multiple (but not all) items are removed at the same time, to avoid ghost items appearing briefly. If you pass noupdate you have to call updateDisplay() after all items are removed.

**removeFromStockById( id, to, noupdate )**

Remove an item with a specific ID from the stock.

'to' is an optional parameter. If "to" contains the ID of an HTML element, the item removed from the Stock slides to this HTML element before it disappears. Note that this method does not expose the associated animation object, however, so it's not possible to trigger other actions when it finishes, for example. If you need to do that, use Dojo's slideToObject() instead.

'noupdate' is an optional parameter. If set to "true" it will prevent the Stock display from changing. This is useful when multiple (but not all) items are removed at the same time, to avoid ghost items appearing briefly. If you pass noupdate you have to call updateDisplay() after all items are removed.

**removeAll()**

Remove all items from the stock.

**removeAllTo( to )**

Remove all items from the stock. If "to" contains the ID of an HTML element, the item removed from the stock slides to this HTML element before it disappears.

### Getters

**getPresentTypeList()**

Return an array with all the types of items present in the stock right now.

Example:

```js
    this.myStockControl.removeAll();
    this.myStockControl.addToStock( 65 );
    this.myStockControl.addToStock( 34 );
    this.myStockControl.addToStock( 89 );
    this.myStockControl.addToStock( 65 );
    
    // The following returns: { 34:1,  65:1,  89:1  }
    var item_types = this.myStockControl.getPresentTypeList();
```

**count():**

Return the total number of items in the stock right now.

**getAllItems()**

Get all items (same format as getSelectedItems and getUnselectedItems).

**getItemDivId(id)**

Get the div id using the stock item id (to manipulate element properties directly).

**getItemById(id)**

Get the Stock item with the id in parameter
ex : return the object { type:1, id: 1001 }

**getItemWeightById(id: number): number|null**

Returns item weigh given id. or null if not found

**container_div**

Member containing div of the stock container in dom (container_div.id would be it's id)

**control_name**
Its id of container_div above

### Selection

**setSelectionMode( mode )**

For each stock control, you can specify a selection mode:

- 0: no item can be selected by the player.
- 1 (default): a maximum of one item can be selected by the player at a time.
- 2: multiple items can be selected by the player at the same time.

**setSelectionAppearance( type )**

For each stock control, you can specify a selection highlighting type:

- 'border': there will be a red border around selected items (this is the default). The attribute 'apparenceBorderWidth' can be used to manage the width of the border (in pixels).
- 'disappear': the selected item will fade out and disappear. This is useful when the selection has the effect of destroying the item.
- 'class': there will be an extra **stockitem_selected** css class added to the element when it is selected (and removed when unselected). The name of the class can be changed by using the **selectionClass** attribute. You can also override the default class in the css file for your game but beware of the **!important** keyword.

By default this class definition is:

```css
.stockitem_selected {
	border: 2px solid red ! important;
}
```

If you want to override it (for example, to change the border color) add this in your <game>.css file:

```css
.stockitem_selected {
	border: 2px solid orange ! important;
}
```

**isSelected( id )**

Return a boolean indicating whether the specified item id has been selected.

**selectItem( id )**

Select the specified item.

**unselectItem( id )**

Unselect the specified item.

**unselectAll()**

Unselect all items of the stock.

**selectItemsByType(type: number): void**

Selectes all items in a stock with given type (in addition to previous selection)

**unselectItemsByType(type: number): void**

Unselects all items in a stock with given type

**onChangeSelection**

This callback method is called when the player selects/unselects an item of the stock.

You can connect this to one of your methods like this:

```js
    dojo.connect( this.myStockControl, 'onChangeSelection', this, 'onMyMethodToCall' );
    
    (...)
    
    onMyMethodToCall( control_name, item_id )
    {
        // This method is called when myStockControl selected items changed
        var items = this.myStockControl.getSelectedItems();
        
        // (do something)
    }
```

Nota bene:
- The "control_name" argument is the ID (the "DOM" id) of the "div" container of your stock control. Using "control_name", you can use the same callback method for different Stock control and see which one trigger the method.
- The "item_id" argument is the stock ID (index) of the stock item that has just been selected/unselected.

**getSelectedItems()**

Return the list of selected items, as an array with the following format:

```
[
   { type:1,  id:  1001 },
   { type:1,  id:  1002 },
   { type:3,  id:  1003 }
   ...
]
```

**getUnselectedItems()**

Same as the previous one but return unselected item instead of selected ones.

### Layout

**resetItemsPosition()**

If you moved an item from the stock control manually (ex: after a drag'n'drop) and want to reset their positions to their original ones, you can call this method.
Note: it is the same as updateDisplay() without arugment, not sure why there are two methods.

**updateDisplay(from)**
Update the display completely (if 'from' is defined: moves new items from this location).

Example code if you change the underlying stock item, or otherwise want to make the stock item refresh:

```
    this.myStockControl.updateDisplay();
```

**item_margin**

By default, there is a margin of 5px between the items of a stock. You can change the member variable "item_margin" to change this.

Example:

```
     this.myStockControl.item_margin=5;
```

**changeItemsWeight( newWeights )**

With this method you can change dynamically the weight of the item types in a stock control.

Items are immediately re-sorted with the new weight.

Example: with a stock control that contains classic cards, you can order them by value or by color. Using changeItemsWeight you can switch from one sort method to another when a player request this.

newWeights is an associative array: item type id => new weight.

Example:

```
    // Item type 1 gets a new weight of 10, 2 a new weight of 20, 3 a new weight of 30.
    this.myStockControl.changeItemsWeight( { 1: 10, 2: 20, 3: 30 } );
```

Example2:

```js
    // Be careful with object initialisers with variables, use the bracket notation.
    // Item type 1 gets a new weight of 10
    var card_type = 1;
    this.myStockControl.changeItemsWeight( { [card_type]: 10 } );
```

**centerItems**

Center the stock items in the middle of the stock container.
e.g. this.myStock.centerItems = true;

**setOverlap( horizontal_percent, vertical_percent )**

This functions sents stock horizontal_overlap and vertical_overlap, the calls updateDisplay(). See what overlap means below

**horizontal_overlap**

Make items of the stock control "overlap" each other, to save space. By default, horizontal_overlap is 0 (but there is also **item_margin** which affects spacing**)**.

When horizontal_overlap=20, it means that a stock item will overlap to only show 20% of the width of all the previous items. horizontal_overlap can't be greater than 100.

**vertical_overlap**

There is two modes, in one mode it used to adjust every 2nd item (See the games "Jaipur" or "Koryŏ"), second mode when setting use_vertical_overlap_as_offset=false is more/less normal overlap with vertical layout except its perentage of overlap (opposite of horizontal_overlap).

This is example of vertical stock with overlap

```
stock.container_div.width = "60px"; // enought just for 1 card
stock.autowidth = false; // this is required so it obeys the width set above
stock.use_vertical_overlap_as_offset = false; // this is to use normal vertical_overlap
stock.vertical_overlap = 20; // overlap
stock.horizontal_overlap  = -1; // current bug in stock - this is needed to enable z-index on overlapping items
stock.item_margin = 0; // has to be 0 if using overlap
stock.updateDisplay(); // re-layout
```

[![StockV.png](/images/f/fb/StockV.png)](https://en.doc.boardgamearena.com/File:StockV.png) [![StockHV.png](/images/6/66/StockHV.png)](https://en.doc.boardgamearena.com/File:StockHV.png) [![StockMixed.png](/images/1/11/StockMixed.png)](https://en.doc.boardgamearena.com/File:StockMixed.png)

**autowidth**

Stock does not play well if you attempt to inline-block it with other blocks, to fix that you have to set this flag which will calculate width properly

```
  mystock.autowidth = true;
```

**resizeItems( width, height, background_width, background_height )**

background_width is an optional argument.

background_height is an optional argument.

```
 stock.resizeItems(100, 120, 150, 170);
```

### Customize Appearance

**extraClasses**

Can be set to a list of class names (separated by space) on stock object, so when div is created these are added, i.e.

```
 this.playerHand.extraClasses='mycard';
```

Note that it is the same list for all items.

**onItemCreate**

Using onItemCreate, you can trigger a method each time a new item is added to the Stock, in order to customize it.

Complete example:

```js
    // During "setup" phase, we associate our method "setupNewCard" with the creation of a new stock item:
    this.myStockItem.onItemCreate = dojo.hitch( this, 'setupNewCard' ); 

    // And here is our "setupNewCard":
    setupNewCard( card_div, card_type_id, card_id )
    {
       // Add a special tooltip on the card:
       this.addTooltip( card_div.id, _("Some nice tooltip for this item"), '' );

       // Note that "card_type_id" contains the type of the item, so you can do special actions depending on the item type

       // Add some custom HTML content INSIDE the Stock item:
       dojo.place( this.format_block( 'jstpl_my_card_content', {
                                ....
                           } ), card_div.id );
    }
```

**onItemDelete**

Function handler called when div is removed

```js
  this.myStock.onItemDelete = (card_div, card_type_id, card_id) => { console.log("card deleted from myStock: "+card_id); };
```

**jstpl_stock_item**

Override default HTML template, this is the default:

```
  mystock.jstpl_stock_item ='<div id="${id}" class="stockitem ${extra_classes}" style="top:${top}px;left:${left}px;width:${width}px;height:${height}px;${position};background-image:url(\'${image}\');${additional_style}"></div>';
```

Note: variable ${position} normally resolve to nothing or z-index: X - depending on overlap variables, and additional_style resolves to `background-size: ${this.backgroundSize}` if it is set

**custom CSS images**

If you want to use your own css styles for images on the items (i.e. not grid), you can do it as following, use customize template, then modify onItemCreate to add slyle which is based on type

```js
 mystock.jstpl_stock_item =  '<div id="${id}" class="stockitem card" style="top:${top}px;left:${left}px;${position};"></div>';
 mystock.onItemCreate = (card_div, card_type_id, card_id ) => { dojo.addClass(card_div, 'card_type_'+card_type_id); }
 for (var type = 0; type <= 48; type++) {
   mystock.addItemType(type, type); // we skipped image and image position here
 }
```

Note: in this case your CSS must define all styles require for these stock items such as width, heigh, image and image positioning for every type

```css
.card {
  width: 50px;
  height: 80px;
  background-image: url(img/cards.jpg);
  background-size: 600% auto;
}
.card_type_1 {
  background-postion: 20% 0%;
}
```

## Tips when adding/removing items to/from Stock components

Most cases will be one of the following situations:

**Situation A**:

When you add a card to a stock item, and this card is **not** coming from another stock:

- Use **addToStockWithId** with a "from" argument set to the element of your interface where the card should come from (i.e. div id). For example if you want to "reveal" card from player hand and it is not an interface element you can set from to be 'player_board_'+activePlayerId (where activePlayerId is player who played that card).

**Situation B**:

When you add a card to a stock item, and this card is coming from another stock:

- On the destination Stock, use **addToStockWithId** with a "from" argument which is the HTML id of the corresponding item in the source Stock. For example, if the source stock id is "myHand", then the HTML id of card 48 is "myHand_item_48".
- Then, remove the source item with **removeFromStockById**. Note: do NOT set the 'to' argument in this call, otherwise you'll get two animations.

(Note that it's important to do things in this order, because the source item must still exist when you use it as the origin of the slide.)

**Situation C**:

When you move a card from a stock item to something that is not a stock item:

- Insert the card as a classic HTML template (dojo.place / this.format_block).
- Place it on the Stock item with **this.placeOnObject**, using the Stock item HTML id (see above).
- Slide it to its new position with **this.slideToObject**.
- Remove the card from the Stock item with **removeFromStockById**.

Using the methods above, your cards should slide to, from, and between your Stock controls smoothly.

## Known issues

#### Incorrectly displayed sprites on Safari

As mentioned above, stock displays its images using "sprites" consisting of a portion of a larger image. To accomplish this, it uses the CSS background-position attribute in negative multiples of 100%. For example, the first element of the first row would be 0% 0%. The second element of the first row would be -100% 0%, etc.

This works fine except in Safari, which sometimes slightly modifies the width of elements at smaller screen sizes (usually when minimum width of 'game_interface_width' is not null) in game. For example, you might get a ~49.99px x ~49.99px div instead of the 50px x 50px specified by CSS width/height. Combined with using percentages in background-position, this can cause sprites to be slightly off-center.

Using pixels in background-position is probably the easiest way to fix this problem, but that would require modifying the stock code itself. As a developer, you can also work around the problem by specifying a background-size attribute based on the size in elements of your source image. For example, if you have a source image that contains 5 rows of 28 sprites, you should specify "background-size: 2800% 500%;"

You can add background-size to your stock items by using the extraClasses attribute as explained above and then specifying the values in your game.css file.
