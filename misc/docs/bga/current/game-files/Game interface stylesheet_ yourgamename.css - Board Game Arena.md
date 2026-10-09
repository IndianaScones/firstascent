# Game interface stylesheet: yourgamename.css

> Source: http://en.boardgamearena.com/doc/Game_interface_stylesheet:_yourgamename.css

This is the CSS stylesheet of your game User Interface.

Styles defined on this file will be applied to the HTML elements you define in your HTML template (yourgame_yourgame.tpl), and to HTML elements you create dynamically with Javascript.

Usually, you are using CSS to:

1°) define the overall layout of your game
(ex: place the board on the top left, place player's hand beside, place the deck on the right, ...).

2°) create your CSS-sprites:
All images of your games should be gathered into a small number of image files. Then, using background-image and background-position CSS properties, you create HTML blocks that can display these images correctly.

Example:

```
    Example of CSS sprites (a black token and a white token, 20x20px each, embedded in the same "tokens.png" 40x20px image):

    .white_token {
        background-image: url('img/tokens.png');
        background-position: 0px 0px;
    }
    .black_token {
        background-image: url('img/tokens.png');
        background-position: -20px 0px;
    }
    .token {
        width: 20px;
        height: 20px;
        background-repeat: none;
    }
```

3°) ... anything else:

It is really easy to add and remove CSS classes dynamically from your Javascript with dojo.addClass and dojo.removeClass. It is also easy to check if an element has a class (dojo.hasClass) or to get all elements with a specific class (dojo.query).

This is why, very often, using CSS classes for the logic of your user interface allow you to do complex things easily.

Note: on the production platform, this file will be compressed and comments will be removed. Consequently, don't hesitate to put as many comments as necessary.

Important: ALL the CSS directives for your game must be included in this CSS file. You can't create additional CSS files and import them.

## Warning: using percentage in background-position

In the example above, you will see "background-position: -20px 0px;" is used for the black token. You could also write this as "background-position: -100% 0%;" which displays the image at the same offset, because it is relative to the size of the .token bounding box, and this means the size of your image file doesn't need to precisely match the size of objects on the screen (this can be easier to write, and you can also substitute different image files without having to rewrite all the css.) However, it is strongly recommended that if you do this, you also specify `background-size` as a percentage as well.

This is because, if the size of the div on screen after any further scaling - which is done for you by the framework to fit games into small windows - is not a whole integer number of pixels, then rounding must occur at some points in the calculation; if the background-size and background-position are calculated in different ways, the difference in rounding can result int the final image offsets being incorrect. This is most significant on Safari (on MacOS, iPhone and iPad) where the discrepancy can be substantial enough to make a game *illegible*; but other browsers can be off by a few pixels as well. [(external demo)](https://jsfiddle.net/shadowphiar/yLq36mzt/). To avoid this issue, either:

- choose one unit (pixels, em, percentages etc) and specify **all** the background-size and background-position offsets of a div in the same unit.
- adjust the size of your div so that, after any global scaling (this.gameinterface_zoomFactor), it will occupy an integer number of pixels on the screen.

## Warning: using Z-index

You may use z-index CSS property in your game interface, but you should pay attention to the following: BGA dialogs are displayed with a z-index of 950. If you want to use z-index safely, you should use value **lower than 900**.

About z-index: don't forget that if you are using a z-index, your element will be displayed above all elements that do not have a z-index. So it's no use to have big z-index values: 1 is enough most of the time :)

## Warning: using drop-shadow

Drop shadows can look nice, but they currently cause big performance issues on Safari, especially if you have more than 1 on the page at once. To ensure you don't cause issues on this browser, you have some alternatives.

- Use box-shadow instead. This only works for square drop-shadows.
- Bake the shadow into the image. That is, the png contains the shadow, and no shadow is needed on the css side. This only works when the shadow doesn't need to be dynamic.
- Disable drop-shadow in Safari:, using the `dj_safari` class which is automatically added to the `html` tag.

```css
.game-element {
    filter: drop-shadow(3px 3px 4px rgba(0,0,0,0.7));
}

html.dj_safari .game-element {
    filter: none;
}
```

## Tip: how to make your cards looks beautiful :)

This piece of CSS (to adapt to your needs) is adding rounded corners + a shadow to your card.

```
    border-radius: 10px;
    border: 1px black solid;
    box-shadow: 5px 5px 5px 0px rgba(0,0,0,0.4);
```

## spectatorMode

When a spectator (= a player that is not part of the game) is viewing a game, the BGA framework add the CSS class "spectatorMode" to the wrapping HTML tag of your game.

This way, if you want to apply a special style to some elements of your game for spectators, you can do this in your CSS:

```
.spectatorMode #your_element_id {
    /* your special style */
}
```

The most common usage of this is to hide some elements to spectators. For example, to hide "my hand" elements:

```
.spectatorMode #my_hand {
    display: none;
}
```

## Support of the Dark mode

BGA supports Dark mode natively, it can toggled available by clicking on your avatar before starting a game or the hamburger menu (top-right corner) during a game. It adds a `[data-theme="dark"]` to the html tag if the dark mode is enabled. So if you want to support the dark mode, you can use this to override the default light style when the user wants dark mode.

```css
html {
    background: url('img/light-background.jpg'), #f2f2f2;
}
html[data-theme="dark"] {
    background: url('img/dark-background.jpg'), #1d1d1d;
}
/* Example to change the player panel color, for light mode only */
html[data-theme="light"] .player-board {
    --game-bga-player-panel-background: white;
}
```

It is better to use this instead of using `@media (prefers-color-scheme: dark) {` because the media query would always rely on the browser settings, ignoring the BGA toggle.

If you don't have a specific image for the dark mode, you can try this:

```
html[data-theme="dark"] {
  background-blend-mode: color-burn;
}
```

Using the DevTool, try the different values of this property to find the one that would work best with your base image.

### Migrating

Most games work in dark mode out of the box. The usual problem is if the game sets a fixed (light) background color for an element without setting the text color: it works great in light mode, but in dark mode it will have a light text color on a light background. Adding `color: black;` on the elements you put a fixed light background will fix it on dark mode while still work in light mode.

### Using the work of the extension to migrate

For those using the [BGA extension](https://en.doc.boardgamearena.com/ChromeExtension) , it already overrides the [data-theme] based on the user choice in the extension.

If you wish to manage your game's dark mode, you can look at the source code of the extension <https://github.com/FlavienBusseuil/bga-chrome-extension/tree/main/src/css/games> to obtain the css currently applied to your game by the extension, so you can integrate it on your game code to make it available to any player even without the extension. This will make your game compatible with the dark mode, even if they don't have the extension.

### Example of a background option compatible with dark mode

If you have a light and a dark background, and you want an automatic setting to be based on the dark mode, you can add this as a user preference :

```
    "103": {
        "name": "Background",
        "values": {
            "0": {
                "name": "Automatic"
            },
            "1": {
                "name": "Light"
            },
            "2": {
                "name": "Dark"
            }
        },
        "default": 0
    }
```

Then in the CSS:

```
html[data-background="0"][data-theme="light"], html[data-background="1"] {
  background: url('img/background-light.jpg');
}
html[data-background="0"][data-theme="dark"], html[data-background="2"] {
  background: url('img/background-dark.jpg');
}
```

If you have `this.bga.userPreferences.onChange = (prefId, prefValue) => this.onUserPreferenceChanged(prefId, prefValue);` or something similar in the setup, you can add this extract to the callback (remove the typing in the function signature if you're not using TS), so the html[data-background] updates as soon as the user preference changes:

```
    public onUserPreferenceChanged(prefId: number, prefValue: number) {
        switch (prefId) {
            case 103:
                document.documentElement.dataset.background = `${prefValue}`;
                break;
        }
    }
```
