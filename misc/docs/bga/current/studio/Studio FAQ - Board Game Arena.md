# Studio FAQ

> Source: http://en.boardgamearena.com/doc/Studio_FAQ

This is a place where we will collect and answer frequently asked questions.

## What is the PHP reference version?

Your game module should be compatible with PHP 8.4.
Some other version information can be found here <https://en.doc.boardgamearena.com/Studio_file_reference#software_versions>.

## What should I use to access the files through SFTP?

There is a lot of tools to do that. Use the one you are the most comfortable with.

On Linux Gnome, you can for example use the 'Connect to server' function of the Nautilus file management system, or use sshfs.

On Windows, there is for example the [WinSCP client](http://winscp.net/).

See [Tools_and_tips_of_BGA_Studio#File_Sync](https://en.doc.boardgamearena.com/Tools_and_tips_of_BGA_Studio#File_Sync "Tools and tips of BGA Studio") for more details.

## I can't edit the files in my game directory, it looks like they are readonly. What's happening?

You can lose access sometimes if you add another developer as read/write or admin.

To fix you can re-add yourself as Admin. Never remove youself! Just type your own name in user list and select Admin role (in control panel on studio for a specific game).

Maybe there is a maintenance operation underway.

If you don't get access back after some time (say one or two hours), please post on dev forum.

If you are still an admin for your game, re-add yourself as admin - it restores your permissions.

## What is the working language on BGA studio?

Working language is **English**.

Variables and functions must be named with English words.

Comments must be written in English.

Game interface strings and game logs must be written in English.

## How can I provide translation in my language?

The community will translate the game in all language after the game release with the collaborative translation interface can be used to translate into other languages.

Check [Translations](https://en.doc.boardgamearena.com/Translations "Translations") to see how to make your game translatable.

## I updated the images in the 'img' folder of my game, but they don't show?

**Concerning game_box.png, game_icon.png and publisher.png**:
You must use "Reload game box image" function from "Control Panel / Manage Games / Your game" to make your change visible.
After game is released (alpha) these images should be updated using meta-data manager

**Concerning other images**:
Other images used during the game are immediately available without any action.
If the images still don't show after that, please try emptying your browser cache and reloading the page (i.e. press reload holding Ctrl button).

## I added some game options / some game statistics / some game infos but they don't show?

When you modify one of these 3 files, you need to use the corresponding update action from "Control Panel / Manage Games / Your Game" in order we can take this information into account.

## Should I use images free from copyright?

If you are developing a game in the public domain, yes (or you can make your own if you feel it's better).

If you are developing a game for which we have a licence, we will usually provide art files from the publisher.

You can also used shared images provided by boardgame arena - logos, some action buttons, card, meeples, decks.

If you looking for an icon for an action (i.e. arrow, zoom, search, gears, etc), BGA has access to Font Awesome. It is awesome. But please check icon set for a version that BGA has installed.

## I registered on Studio but did not receive email

If you did not get email, search for "Welcome on BGA Studio" in your email client (just like that), it sometimes ends up in junk folder.

If you cannot find it, and you use some weird proprietary email address, it possible that your mail server denies emails from bga.
You can try to register again with the same email, but it likely fail telling you that your account has already been created. But if you have standard email such as gmail, yahoo, outlook use it instead.

You can get the welcome email re-sent from the login page using the "Welcome email not received?" link.
In case of a persistent issue, you can file a support request from the [studio support page](https://studio.boardgamearena.com/support).

## How to fix a bug in existing game

- First, you need to join the dev team and create a first tutorial game. Without this, you won't be able to understand the code or debug: <https://en.doc.boardgamearena.com/How_to_join_BGA_developer_team>
- Then you need to contact the original developer and make sure they want your help. The original developer is listed in the credits (if it says "developed by BGA," it was the original team). If you cannot get in contact with them, ask on the General channel on the dev Discord. Fixing bugs in old games is not always a good idea - you will likely break something else.
- If you get a "no" answer, don't give up. There is a big list of abandoned games that may need volunteers, and there are always publishers asking for volunteers for their games (or you can just check the licenses we have). More about licensed games can be found here: <https://en.doc.boardgamearena.com/Create_a_game_in_BGA_Studio:_Complete_Walkthrough#Select_a_First_Game>
- Finally, to actually start working on a game: on the project list <http://studio.boardgamearena.com/#!projects>, find the game (you may have to check the "Already published" button) and request read-only access. Then use the project you created during the tutorial (or create a new one) and use the Copy feature to copy the code of that project into yours. In the control panel of YOUR new project, it's in the right bottom.
- If you lost in any of these steps ask fellow developers on dev Discord (link is on main wiki <https://en.doc.boardgamearena.com/Studio#Other_resources>)
