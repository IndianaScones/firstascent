# Game fonts: fonts directory

> Source: http://en.boardgamearena.com/doc/Game_fonts:_fonts_directory

## Game fonts

You must upload in a `fonts` directory all fonts that you will use in your game interface.

All fonts in your font directory are loaded on a player's browser when he loads the game. It will take in priority the font with type : woff2 > woff > otf > ttf.
To be correctly deployed your font file names should not contain spaces or special characters.

The you can use them by setting a font-family with the filename (note the dashes will be replaced by spaces), without needing to declare a `@font-face`.

The fonts should be freeware (please include a .txt with the license information in addition to the font files).

## Example

With a `custom-font.woff2` in the `fonts` directory:

```css
  .element-with-custom-font {
    font-family: 'custom font';
  }
```

With a `custom-font-bold.woff2` in the `fonts` directory:

```css
  .element-with-custom-font-bold-solution1 {
    font-family: 'custom font';
    font-weight: bold;
  }
  .element-with-custom-font-bold-solution2 {
    font-family: 'custom font bold';
  }
```

## Debugging

In the DevTool console, write `document.getElementById('bga-auto-declared-font-faces')` to list the fonts that are preloaded by the framework.
