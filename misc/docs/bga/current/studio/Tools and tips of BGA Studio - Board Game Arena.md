# Tools and tips of BGA Studio

> Source: http://en.boardgamearena.com/doc/Tools_and_tips_of_BGA_Studio

## Server Tools and Tips

### Starting a game in one click

To start a game:

- Go to Play now and configure game type: Simple game -> Turn-based -> Manual
- Select your game and click on "Create".
- If you want to play a game with 3 players, specify that you want a maximum of 3 players at this table.
- Click on "Express Start".

### Stopping a game in one click

- Click on the "menú" icon on the top right of the screen.
- Click on "Express Stop" ("Quit this game" if playing a solo game).

### Switching between users

When running a game on Studio, you can use the little red arrow near each player's name to open a new tab with this player's perspective.
You can also modify the URL to view the table as any user you want (changing &testuser=myid in the URL), allowing to easily test as a spectator.

### Access to game database and Logs

At the bottom of the game area, there is section without a title containing 3 useful links:

```
 Go to game database • BGA request&SQL logs • BGA unexpected exceptions logs
```

- "Go to game database" link is an immediate access to the PhpMyAdmin tool to view/edit the tables of the current game
- BGA request&SQL logs - link to your studio PHP log - all tables, all severities. Anything you print using debugging and tracing functions from PHP and some framework logs
- BGA unexpected exceptions logs - same log as above but only severity warning and higher

See [Practical debugging](https://en.doc.boardgamearena.com/Practical_debugging "Practical debugging") for more info about it.

### Save & restore state

Using links of this section, you can save the complete current (database) state of your game, then restore it later.

This is particularly useful when you want to develop a part of the game that is difficult to reproduce: you just have to save the situation just before, and then restore it until this part works fine.

We provide you 3 "slots": 1, 2 and 3. This way, you can save 3 different game situations.

Limits:

- the "restore" function does not work anymore when the game is over.
- a saved situation from a given table cannot be restored in another table.
- when you "restore" a situation, the current browser page is refreshed to reflect the updated game situation, but you have to refresh you other tabs/pages manually.

### Input/Output debugging section

This section shows you:

- The AJAX calls made by your game interface to the game server. AJAX calls (outputs) begins with ">"
- The notifications received by your game interface. Notifications (inputs) begins with "<".

Note: if you click on some notification title, you can resend it immediately to the user interface.

### Zombify a player

Using the red arrow, go to the player view and select Quit game (make sure you're playing in friendly mode to avoid your studio accounts to go to 0 karma while testing zombie).

### Stopping Hanging Game

If game is hanging and you cannot enter it to stop you can type this URL (replace 12345 with your table number),
which should bring you to a place where you can stop it without entering:

```
 https://studio.boardgamearena.com/#!table?table=12345
```

## Desktop and Web Tools

### Code Editors and IDEs

#### Visual Studio Code

Microsoft Visual Studio Code is light weight IDE/Editor. All desktops.
<https://code.visualstudio.com>

See [Setting up BGA Development environment using VSCode](https://en.doc.boardgamearena.com/Setting_up_BGA_Development_environment_using_VSCode "Setting up BGA Development environment using VSCode")

#### Eclipse For PHP Developers

Eclipse PHP package can be starting point for development you need. You may also want to
install Tern JS plugins to understand dojo style JS. All desktops.
<https://projects.eclipse.org/projects/tools.pdt>

#### Gedit (Ubuntu)

**Edit TPL**
To edit TPL with HTML code highlightings in Gedit under Ubuntu:

find gtksourceview directory in /usr/share, depending on your version (2.0, 3.0,...).
  
Here it's 3.0, then type in a terminal window:

```
    sudo gedit /usr/share/gtksourceview-3.0/language-specs/html.lang
```

then find 'globs' section, and change:

```
    <property name="globs">*.html;*.htm;*.tpl</property>
```

### File Sync

NOTE: If you use VS Code you don't need to use methods below, use one of the sync methods provided by VS Code extensios. See [Setting up BGA Development environment using VSCode](https://en.doc.boardgamearena.com/Setting_up_BGA_Development_environment_using_VSCode "Setting up BGA Development environment using VSCode")

IMPORTANT NOTE: The ssh port is 2022 - All methods below need to be updated to include port number
IMPORTANT NOTE 2: If you uploaded ssh key - PASSWORD method is automatically disabled, you can no longer use password

#### File Sync on Windows

Install [WinSCP](http://winscp.net/). Map a remote directory to a local one and enable continuous sync (one way). You need SFTP password you get when you registered dev account (or ssh key).

#### File Sync on Linux

##### Option 1 - Nautilus (file manager)

You can just use Nautilus "connect to a server" function with URL <sftp://1.studio.boardgamearena.com:2022>
Then you'll get a mounted local folder mapping your studio folder and you can use any editor you like without further need for sync. Downside - if connection goes down you cannot work on source code, no local copy.

##### Option 2 - sshfs and rsync

This setup will sync in the background (continuous sync) when file is saved, after you set it up and start just save your files and they be on server before you can hit refresh. You need to install "sshfs" first.
This is linux script:

```
#!/bin/bash
BASEDIR=`dirname $0`
REMOTE=$BASEDIR/remote

#mount remote
fusermount -u $REMOTE #this unmounts dir
#this asssumes your default ssh key is uploaded to studio
sshfs -p 2022 [email protected]: $REMOTE

#this starts auto-sync from local to remote mount
killall lsyncd
LOCAL=$BASEDIR/workspace

#for every game you can do something like this
GAME=mygamenamehere
lsyncd -delay 1 -rsync $LOCAL/$GAME/ $REMOTE/$GAME
```

This can be able run on startup, so you don't have to do anything manually. However sshfs is not very stable you
have to kill and restart it sometimes. And remote goes away sometimes due to connection issues with studio.
In this case its handy to have a local copy, which is what lsyncd for.

You can also sync on demand (from a build script or editor command) using

```
rsync -vlrt $LOCAL/$GAME/ $REMOTE/$GAME
```

Note: is insecure way of running sshfs (password will go away, set up using ssh key S.V.P.)
echo LongDevPassword | sshfs -p 2022 -o password_stdin ...

##### Option 3 - lftp

[lftp](https://lftp.yar.ru/) is a fast command-line file transfer program. It supports parallel threads, transferring multiple files at a time.

- Linux: Install using your package manager, for example: **sudo apt-get install lftp**
- Mac: Install [Homebrew](https://brew.sh/), then install lftp using **brew install lftp**

To upload your project to BGA studio, use the "mirror" command like this:

**lftp sftp://myuser:mypassword@1.studio.boardgamearena.com:2022/ -e "mirror --reverse --parallel=10 --delete /local/path/to/myproject/ myproject/; exit"**

Be sure to include the trailing **/** after both directory names.

By default, if a file already exists on BGA Studio with the same time + size it assumed to be the same and won't be transferred. This makes the transfer process much quicker after the first time. If you're working with multiple developers on the same project and you find that it is transfers all files every time, you may want to add the option **--ignore-time** (if a file already exist on BGA Studio with the same size it is assumed to be the same and won't be transferred). Read [the manual](https://lftp.yar.ru/lftp-man.html) for more details.

This is one time sync (unless I am missing something this does not do continious sync?)

### Debuggers

Browser is the best tool for JS/HTML5 debugging, see [Practical debugging](https://en.doc.boardgamearena.com/Practical_debugging "Practical debugging") for details.

### Version Control

Studio provides svn for you code on server, there are some limited abilities there to see history and restore. I recommend to also keep your code in another repository, which allows keeping more fine-grained history and can simplify collaboration.

A quick option is to use a local repo, which you can sync to cloud or backup.

Other option is to host source code on github. If you do, the convention is to use github.com/<yourname>/bga-<yourgame>. It is recommended to add the [boardgamearena](https://github.com/topics/boardgamearena) tag and add your repo to the list on the [BGA_Code_Sharing](https://en.doc.boardgamearena.com/BGA_Code_Sharing "BGA Code Sharing") page.

If you publish the source somewhere externally, make sure you **don't post high-res publisher graphics**, only web resources, and post a separate license for graphics files. Also, **don't include a file with your sftp password** (github is automatically crawled for passwords by hackers; a hacking attempt occurred on BGA studio for this reason in June 2020).

You can also configure github to automatically deploy to BGA whenever you push to a branch. See [this forum post](https://forum.boardgamearena.com/viewtopic.php?f=12&t=13370&start=10#p59537) for instructions.

### PHP CLI

Its handy to have php cli (command line) tools install to run php locally, so you can test some stuff without deployment cycle, or create some scripts that generate code or markup.

### Image Manipulation

#### ImageMagick

Handy set of image manipulation **command line** tools, useful to for example to stitch together bunch of images and re-size, to use as sprite (in Stock component for example). I.e. you got a graphics file from publisher where every tile is 600x600 PNG file in separate file. You want .jpg instead of .png to make it not like 20Mb, and combine all images in one column and re-size to 128x128:

(Linux example)

```
/usr/bin/montage  `ls Tiles*.png` -tile 1 -geometry 128x128+0+0 out/tiles128.jpg
```

The order of the images will match the 'ls' order. If needed change the filenames if you need a specific order.

<https://www.imagemagick.org/script/download.php>

#### Gimp

GUI tool, very complex but will do ALL what you possibly need to do with game graphics

<https://www.gimp.org/>

#### Shrinking

Shrink images without loss of quality <https://tinypng.com/> or <http://www.iloveimg.com/>

#### PDF Scrapper

extract images from PDF file (i.e. game rulebook) :

<https://www.ilovepdf.com/>

<http://www.extractpdf.com/>

On linux tool that does it in command line "pdfimages"

### Restore project to Original template

You can restore your project with default project using Studio Control Panel.
I.e go to <https://studio.boardgamearena.com/studio> find your project click on it's link, find Override text in the control panel.

- Use words *EmptyGame* as second project.
- Use your own project name (with capital/s) as first project.
- Press Go (or whatever button named)

### Rename/Copy project

You can now override your project with any other project using Studio Control Panel.

I.e go to <https://studio.boardgamearena.com/studio> find your project click on it's link, find Override text in the control panel and read instructions.

Alternatively there is a script available in sharedcode project to do the renaming which can be called in command line if you have php command line installed.
You need to have php clt (command line interface) installed, then you can download script and run it.

<https://github.com/elaskavaia/bga-sharedcode/blob/master/misc/bgaprojectrename.php>

Usage:

```
php bgaprojectrename.php <originalProjectPath> <copyOfProjectRenamedPath>
```

Example on how to call it in command line if you project name is "heartsmyproject"

```
php8.4 git/bga-sharedcode/tools/bgaprojectrename.php remote/hearts/ remote/heartsmyproject/
```

### BGA Workbench

Unofficial/unsupported PHP library providing tools to help manage BGA Studio projects including deployment and test utilities. <https://github.com/danielholmes/bga-workbench>

### Testing and validation tools

- Run static analysis on your project to detect common problem and translation issues - project check - available from control panel - manage games - <your project> - Check project (blue button left middle)
- Check if web feature is supported <https://caniuse.com/>
- PHP: <https://phpcodechecker.com/>
- JS: <http://esprima.org/demo/validate.html>
- CSS: <http://jigsaw.w3.org/css-validator/>

### State machine diagram generation tool

You can easily generate a state machine diagram from your states.inc.php using the dot language (<https://graphviz.org/>) via a PHP script.

To do so:

- download the php script from the bga-sharedcode git repo located here <https://github.com/elaskavaia/bga-sharedcode/blob/master/misc/generate_state_diagram.php> and place it into your project root (on the same level as states.inc.php)
- run the script locally: "php.exe generate_state_diagram.php > graph.dot"
- open the generated dot file for visualization in visual studio code using the "Graphviz Interactive Preview" extension
- alternatively install graphiz (<https://graphviz.org/download/>) and generate an image file by running the following command "dot -Tpng -o graph.png graph.dot"

Here is an example of running the generation script on the hearts game from the tutorial:

[![State machine diagram dot.png](/images/d/d9/State_machine_diagram_dot.png)](https://en.doc.boardgamearena.com/File:State_machine_diagram_dot.png)

**Legend:**

- states of type GAME appear in yellow
- states of type ACTIVE_PLAYER appear in blue
- states of type MULTIPLE_ACTIVE_PLAYER appear in green

Once you have this state machine, you can use it to generate boilerplate code using the [BGA State Machine Generator](https://github.com/xmakina/bga-statemachinegenerator)

## Other useful tools

- Website with bunch of textures and sounds <http://www.grsites.com/archive/textures/>
- Shrink images without loss of quality <https://tinypng.com/> or <http://www.iloveimg.com/> (recommended by Gregory Isabelli)
- CSS shapes <https://css-tricks.com/examples/ShapesOfCSS/>
- PDF Scraper - extract images - <http://www.extractpdf.com/>
- Hexagonal Grids (from Red Blob Games) - <https://www.redblobgames.com/grids/hexagons/>
- CSS tools (shades, shapes, textures) - <https://dev.to/lissy93/super-useful-css-resources-1ba3>
- Color blind pallette <https://jfly.uni-koeln.de/color/> <https://mikemol.github.io/technique/colorblind/2018/02/11/color-safe-palette.html>
- CSS stroked text <https://blog.logrocket.com/create-beautiful-stroked-text-css/>
- CSS box model and SVG images <https://www.freecodecamp.org/news/how-to-use-css-box-model-and-style-svg-images/>

## Client Tips

### Speed up game re-loading by disabling Input/Output debug section

Development UI have few sections for debugging only, such as 'Input/Output debugging section'. Loading this data will significantly slow down
your reload. I did some profiling and my reloading (i.e. F5) took 14 seconds, 12 of which it was dealing with loading this section.
If you not using it you can disable it. In your JavaScript code, in the begging of 'setup' method add this code

```js
        dojo.destroy('debug_output');
```

That should get rid of this section and overhead associated with loading it (it may have some other side-effects, I have not explored all of them)

### Speed up CSS development and layout

Syncing files to server and refreshing is relative fast but still can take up to 20 seconds which is annoying.
If you working
a lot on css/images/layout you can speed it up by copying html in some state of the game to your local folder.
I.e. in your project folder create directory misc/ and save your html as misc/test.html and changing path to css to load from local disk (and it will load your images to from local disk as well).
I.e. find something like

```
 <link rel="stylesheet" type="text/css" href="http://1.studio.boardgamearena.com:8081/data/themereleases/151226-1240/games/mygame/999999-9999/mygame.css"/>
```

and replace with

```
  <link rel="stylesheet" type="text/css" href="../mygame.css"/>
```

You project structure will look like this

```
mygame
  img/ <-- your images
  mygame.css  <-- your original css
  ...
  misc/
    test.html <-- your test html
```

It is a bit tricky to save html exact state, if you do save as it also pulls all resources sometimes.
