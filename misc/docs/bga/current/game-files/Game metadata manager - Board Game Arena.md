# Game metadata manager

> Source: http://en.boardgamearena.com/doc/Game_metadata_manager

![Game Metadata Manager Icon](/images/thumb/e/e6/Game_Metadata_Manager_Icon.png/100px-Game_Metadata_Manager_Icon.png "Game Metadata Manager Icon")

The *Game Metadata Manager* is the portal for managing tags and media for your games. This page exists both on Production and Studio:

- [Game Metadata Manager (production)](https://boardgamearena.com/controlpanelgames) - manage game tags and media once the game has reached private alpha and beyond
- [Game Metadata Manager (studio)](https://studio.boardgamearena.com/controlpanelgames) - manage game tags and media before the game reaches private alpha

Note: once your game is in private alpha, and you are using the production Game Metagata Manager, the metadata on studio is *never* automatically updated. On the studio game page, there is a button to pull metadata from production if you need to: "Sync metadata from production".

## Media

Game media consists of all the images which are used to represent your game on Board Game Arena, outside of the art of the actual game.

Whilst working on your game on the studio initially, you can manage media from the studio: [Game Metadata Manager (studio)](https://studio.boardgamearena.com/controlpanelgames).

Once your game first hits private alpha, the media is copied over to the production site, and from this point on, all media changes must be effectuated over there: [Game Metadata Manager (production)](https://boardgamearena.com/controlpanelgames).

| Name | Example | Description |
| --- | --- | --- |
| Box | [Box](https://en.doc.boardgamearena.com/File:Carcassonne_Box.png "Box") | - **Required for public alpha** - PNG - It is displayed on the main site on the game description page and when creating a table (280x280 px). - It should be a 3D image of a physical copy of the game box as it appears in an online shop. - It is better to take the version of the game that is coherent with the game art used in the adaptation, and from the original publisher of the game. - The background of the image must be transparent. - If you don't have a 3D version of the game box, you can use the following website to create one: <https://boxshot.com/3d-box/> - On Studio, you can only have one box image. Once deployed you can have a different box image for each language. This allows a localised image if you wish. If you don't provide a localised image, users will see the en box as a fallback. |
| Icon | [Icon](https://en.doc.boardgamearena.com/File:Carcassonne_Icon.png "Icon") | - **Required for public alpha** - PNG - It is the icon displayed in the lists of games and tables (50x50 px). - The objective of this icon is to make the game recognizable among the other games. A good idea is to take a part of the game cover that is distinctive (ex: the game title). - This one does not have to be transparent. This image should not have a border |
| Title | [Title](https://en.doc.boardgamearena.com/File:Carcassonne_Title.png "Title") | - **Required for beta** - PNG - max 2MB - This is an image displayed instead of the name of the game as text - Must be 2000x2000px - Must look good when overlayed on top of the game box, and must be transparent - On Studio, you can only have one title image. Once deployed you can have a different title image for each language. This allows a localised image if you wish (for example, "Stone Age" vs "L'Âge de Pierre"). If you don't provide a localised image, users will see the en title as a fallback. In this case, if the localised name differs from en, there will also be a subtitle showing the game's name in the user's locale.   For guidelines on the positioning of elements of the title, see: [Media:Title_guidelines.png](https://en.doc.boardgamearena.com/images/d/df/Title_guidelines.png "Title guidelines.png"). |
| Publisher | - | - **Optional** (if there is no publisher) - PNG - max 2MB - It is the logo of the publisher of the game, displayed on the game description page. - Must be 280x280px - The image can be transparent. - You can have up to 2 publisher images |
| Banner | [Title](https://en.doc.boardgamearena.com/File:Carcassonne_Banner.jpg "Title") | - **Required for beta** - JPG - max 2MB - size 1386x400px - should not contain any text; representative of the atmosphere of the game such as a cover element or communication image; the box image covering the banner on the left should stand out |
| Display | - | - **Required for release** - JPG - height between 400px and 760px, width maximum 1.5 x height; - These images are displayed in a carousel on the game page - the idea is to make players want to play the game, so it could be a zoomed card, some detail of the board, an overview of an ongoing physical game... but NOT a screenshot of the BGA adaptation since there is already the "see game in action" replay for that - You can have up to 10 display images |
| Major Variant | [KoT Major Variant.png](https://en.doc.boardgamearena.com/File:KoT_Major_Variant.png) | - **Optional** - PNG - size 280x280px - Images used to accompany major options, see [Game options and preferences](https://en.doc.boardgamearena.com/Game_options_and_preferences:_gameoptions.inc.php#option_level "Game options and preferences: gameoptions.inc.php") |

## Tags

Game tags should be managed through the Game Metadata Manager.

Before the game is published to production, this is done on the studio [Game Metadata Manager (studio)](https://studio.boardgamearena.com/controlpanelgames) .

After release, the tags are copied over to the production site, and from this point on, all tag changes must be effectuated over there: [Game Metadata Manager (production)](https://boardgamearena.com/controlpanelgames).

Please consider that for the **Awarded game** tag (Win a prestigious award), the game must have been at the **first** place of one the [following major awards list](http://boardgamegeek.com/wiki/page/Gaming_Industry_Awards#).

## Metadata

Some text metadata is also managed through the Game Metadata Manager.

Before the game is published to production, this is done on the studio [Game Metadata Manager (studio)](https://studio.boardgamearena.com/controlpanelgames) . After release, the metadata is copied over to the production site, and from this point on, all metadata changes must be effectuated over there: [Game Metadata Manager (production)](https://boardgamearena.com/controlpanelgames).

###### Artist(s) and Designer(s)

The artists and designers of the game. These should be comma-separated lists in the case there is more than one.

###### Publication year

The year of first publication of the game. (Can be negative to represent BC.)

###### Complexity

Complexity of the game, from 0 (extremely simple) to 5 (extremely complex)

###### Luck

Luck of the game, from 0 (absolutely no luck in this game) to 5 (totally luck driven)

###### Strategy

Strategy of the game, from 0 (no strategy can be setup) to 5 (totally based on strategy)

###### Diplomacy

Diplomacy of the game, from 0 (no interaction in this game) to 5 (totally based on interaction and discussion between players)

###### Minimum age

The minimum age written on the game box to play the game. If the game box indicates "age: 10+", write 10.

###### Zombie Mode level

See <https://en.doc.boardgamearena.com/Zombie_Mode#The_different_Zombie_levels>

###### Game page warning

If a specific warning is needed on the game page (to discuss and validate with admins) it can be displayed from the game infos. For example for Texas Hold'em:

```
There is no real money involved on BGA: this game has the mechanism of Poker but is using points instead of real money.
```

###### Custom "buy this game" button

By default, the "buy this game" button is a link to an Amazon search with the name of the game.

You can replace it by a different URL / game button label. The button label will be "Buy on <Name of the website>"

###### Description

Short game presentation text that will appear on the game description page, structured as an array of paragraphs.

Each paragraph should not contain html (plain text without formatting). A good length for this text is between 100 and 150 words (about 6 to 9 lines on a standard display.)

```
This wonderful game is about geometric shapes!

It was awarded best triangle game of the year in 2005 and nominated for the Spiel des Jahres.
```

## Migration

Metadata images used to be served from the [/img](https://en.doc.boardgamearena.com/Game_art:_img_directory "Game art: img directory") folder of your game's repository. All of the image files prefixed with `game_` are now deprecated and can be deleted from the folder. Any changes to these images will not be picked up.

Tags used to be managed by changing the tags in [gameinfos.jsonc](https://en.doc.boardgamearena.com/Game_meta-information:_gameinfos.jsonc "Game meta-information: gameinfos.jsonc"). Any tags specified in this file are now ignored, and should not be specified. Tags must be edited using the [Game Metadata Manager](https://boardgamearena.com/controlpanelgames).

Text metadata used to be managed by changing values in [gameinfos.jsonc](https://en.doc.boardgamearena.com/Game_meta-information:_gameinfos.jsonc "Game meta-information: gameinfos.jsonc"). Any of the deprecated fields specified in this file are now ignored, and you will be warned about them when using the "Reload game informations" button.

## Access Permissions

Currently, the GMM is available to developers and maintainers.

## Future

The Game Metadata Manager will play an increasingly important role in managing a BGA implementation in the future.

It is planned that:

- more metadata (such as publisher) be managed her
