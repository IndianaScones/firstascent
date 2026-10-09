# Game art: img directory

> Source: http://en.boardgamearena.com/doc/Game_art:_img_directory

## What assets to request from publisher

Requesting graphics assets is a 2nd thing you should do after getting the game license.

Ask for the following:

- Graphic assets of printed SQUARE materials (cards, boards) in common formats (pdf, jpg, png). PDF cannot have watermarks, cut or bleed marks.
- Graphic assets non NON-SQUARE tokens (i.e hex) in PNG (because it needs transparent bg)
- Graphic assets of game non-flat resources (minis, dice, etc) as were used in rulebook in "contents of the game" in PNG (best one per file)
- For all assets that have text on them (numbers don't count): We need ENGLISH or NO TEXT version. We can overlay translated text on graphics if no text version is provided.
- You can also ask game meta data images such as box and banners, but this can be done later (see below for meta data images)

## Metadata images

Game metadata images are images of game box, banner, title, etc. These images are no longer stored in project directory.

Metadata images are managed through the [Game Metadata Manager](https://en.doc.boardgamearena.com/Game_metadata_manager "Game metadata manager"). After you go there select the link to the game you want to upload images for.

## Game art

You must upload in img directory all images of your game interface.

### Images naming constraints

To be correctly deployed your images file names should not contain spaces or parentheses.

### Images loading

**Be careful**: by default, ALL images of your img root directory are loaded on a player's browser when he loads the game. For this reason, don't publish images that are not useful in your img, or it will slow down the game load. You can put them in a subdirectory of img, that won't be preloaded by default, for example images used only if an expansion is activated..

Note that you can tune the way images are loaded with Javascript method "preloadImages"/"dontPreloadImages" (see <https://en.doc.boardgamearena.com/Game_interface_logic:_Game.js#Image_loading>). You can for example preloadImages in a sub-folder if an expansion is activated and use it.

General recommendation it to have no more than dozen of image files, 2Mb max each. However if there is heavy game resources specific to a player (i.e. player board of specific color or set of cards) it is better to separate them and "don't pre-load" since in any given game only some of them will be used.

### Images format

You can use these image formats while building your game interface:

webp images

should be used whenever possible. It's lightweight and handles transparency.

jpg images

should be used for non-transparent images. Jpg are usually lighter than pngs, so please choose Jpg for big pictures (ex: game board, cards) when you don't need transparency to accelerate game load. You don't need transparency for rounded card corners, it can be done using css.

png images

should be used for images with transparency, such as non-square tokens, meeples, etc (combined into sprite).

gif images

can be used for animated images. This is not recommended to use gif animated images as they can upset players, but for some specific interface element this could be useful.

svg images

svg images can be really efficient for icons or abstract images. Note: consider also using font awesome for icons instead of separate asset file.

### Webp

png and jpg images are automatically converted to webp during deployment. Webp's are lighter weight.

When requesting a png/jpg file, many modern browsers will specify a preference for webp in their Accept header, and our CDN will comply with this request serving the converted webp image instead of the original png you uploaded. You can confirm which format your browser requests by checking request and response headers for the image in the network tab of your browser's developer tools.

In rare cases, this can cause a problem because the conversion is lossy. The best solution is to create webp manually from your png/jpg file, to make sure your web pfile is valid, and use it instead of the png/jpg file.

### Use background-size

In order to allow for players to use the browser zoom without your images becoming pixelated, it's recommended to use higher resolution images than needed for the normal display of your interface, and to use the css property **background-size** to fit the image to the size you need for your interface.

### Use CSS Sprites

To limit the number of images load and make the game load faster, you must use CSS sprites, i.e. you must gather several images in a single one. However, there are limitations. Do not make any CSS image sprite with dimensions that exceed 4096x4096 pixels or it will not work on mobile devices (Android max texture size is 4096 pixels, test your own browser at [WebGL Report](http://webglreport.com/)).

To learn more on CSS Sprites:

- [CSS sprites (W3C documentation)](http://www.w3schools.com/css/css_image_sprites.asp).
- [Game interface stylesheet: yourgamename.css](https://en.doc.boardgamearena.com/Game_interface_stylesheet:_yourgamename.css "Game interface stylesheet: yourgamename.css")

**Important:** the maximum image size should be 4096x4096 (otherwise, some devices may not display parts of the image, see <https://stackoverflow.com/questions/34682482/what-is-the-maximum-sprite-sheet-size-i-can-use-for-android-devices>)

Tools:

- Sprite Generator <https://www.toptal.com/developers/css/sprite-generator/>
- Another Sprite Generator <https://www.finalparsec.com/tools/sprite_sheet_maker>

### Shrink images

If you get high resolution images from publisher you need to shrink them since web display requires much lower resolution than printing.

- Shrink images size without visible loss of quality
  - Offline tool for PNG: <https://pngquant.org/>
  - Online tools for PNG/JPG: <https://tinypng.com/> or <http://www.iloveimg.com/> or <https://squoosh.app/>
  - Online tool for SVG: <https://jakearchibald.github.io/svgomg/>

## Image Manipulation Tools

You have no choice but to use one of the image manipulating tools to create a successful game adaptation, you would have to
deal with

- Converting to supported formats
- Adding transparency
- Stitching
- Shrinking with no quality loss
- Resizing

For that you need a good tools, recommended tools (if you know more add them here)

- Gimp (all platforms) - general GUI image editor
- Paint.net (Windows) - general GUI image editor
- ImageMagic (All platforms) - <https://www.imagemagick.org/script/download.php> - command line image editor, great for mass manipulations and scripting

AI tools are very good at editing photos with minimal prompting too.

### Examples

PDF to png convertion (linux)

```
gs -sDEVICE=pngalpha   -o output.png -r600 -dDownScaleFactor=3 input.pdf
```

PDF to jpg using image magic and cropping page

```
montage -colorspace sRGB -density 300 -geometry 452x+0+0 -tile 5 -crop 82x87%+130+126 input.pdf  output.jpg
```

PSD Extraction (image magic - CMYK to sRBG - one layer per file)

```
for i in *.psd; do  convert  $i -profile /usr/share/color/icc/colord/sRGB.icc   `basename $i .psd`.png; done;
```

Tiling - The order of the images will match the 'ls' order. If needed change the filenames if you need a specific order.

```
montage -colorspace sRGB -density 300 *.png -tile 6 -background transparent ../tokens.png
```

PDF scrabber (linux) - extract all graphics file from pdf

```
pdfimages my.pdf prefix-
```

### Online tools

PSD extraction (adobe file format)

```
https://www.photopea.com/
```

Seamless background (for tiled background wallpaper)

```
https://www.imgonline.com.ua/eng/make-seamless-texture.php
```

Download game assets from tabletop simulator

```
https://www.npmjs.com/package/ttsbackup
```

### Community Provided

- [This python script](https://github.com/sumpfork/seas_of_havoc_boardgamearena/tree/main/misc/tools/extract_cards) shows how to make card sprite images for BGA from a one-card-per-page pdf:
  - reads the pages from a pdf document
  - crops each pages to exclude bleed etc.
  - removes duplicate images based on a difference in histograms
  - converts to a target resolution
  - assembles the resulting images into a single one given a number of rows and columns
  - saves as any format that Pillow supports (e.g. jpg or png)
