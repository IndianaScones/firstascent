# Translations

> Source: http://en.boardgamearena.com/doc/Translations

Using BGA Studio, the game you create is ready to be translated to each language by the BGA community. To make this possible, you only need to specify which string must be translated and how to combine them.

## Localization Overview

Localization for BGA games happens largely on the CLIENT. Games must be developed in English and English strings are sent to the client.

It's only at the client that your English strings will be displayed with the translation for the user's language, when such a translation exists.

For anyone who has worked on a system where translation happens at the server and localized strings are sent to the client: you must unlearn what you have learned. Just stick with English and send the untranslated English strings. The magic happens at the client.

## How will my strings be translated?

When developing your game, all strings must be in English. Strings must be coherent with the English version of the game.

Once your game enters Beta, the BGA player community will descend upon your game like a plague of locusts and translate it into dozens of languages before you can say "Je ne parle pas anglais".

## What do I have to do from a programming standpoint?

Not as much as you think. Read on for full details, but the golden rules are:

1. Make sure that any string on the server side that needs to be translated on the client side is wrapped in a clienttranslate() function when defined. For example: $my_response = clienttranslate('Hey translators, please translate this string'). clienttranslate doesn't actually do anything at all (it just passes the text through) but the translation engine searches your code for strings wrapped in that function and uses them to build the list of strings that need to be translated.
2. On the client side, just display your text, but wrap it in _().
   1. If you pass a string constant to _() - such as _('This is my string') then the parser will automatically detect and add your string to the list of strings that need to be translated, AND it will display the local translation for it when displaying.
   2. If you pass a variable to _() - such as _(args.my_message) then MAKE SURE that the variable is set to an English string that is either defined somewhere in your PHP code in a clienttranslate() function or somewhere else in your javascript code in a _() function. As long as it is, the translators will provide translations for it, and the _() function will display the local translation of your English string.
3. A string used as the message for notify->all or notify->player will automatically have its translation displayed on the client - you don't need to do anything EXCEPT make sure that it is wrapped in a clienttranslate() on the server, so that it gets translated.
4. A string used as the "description" or "descriptionmyturn" for a state in your state machine will also be automatically translated on the client - you don't need to do anything EXCEPT make sure that it is wrapped in a clienttranslate() on the server, so that it gets translated.
5. A string used in the pre-games option screen will also automatically have any translation displayed at the client - you don't need to do anything EXCEPT make sure that it is wrapped in a totranslate() on the server (nota bene: you should not use clienttranslate() here as this file is processed specifically and those strings will not be included in the game translation file but in the main site translation file - with a prefix to keep translations isolated by module - as they have to be translated on main site pages. If you need exactly the same string in your game for a client side translation, it should be declared somewhere else in your code wrapped inside a clienttranslate() to be included in the game translation file.
6. A string used in the statistics screen will operate like a string in the pre-game options screen. It will automatically have any translation displayed at the client as long as you make sure that it is wrapped in a totranslate() on the server.
7. If you are using parameters for a call to notify->all or notify->player, or for a state's "description" or "descriptionmyturn" and those parameters contain text that needs to be translated, you will need to tell the system to display the translated versions of them by using the 'i18n' argument. See below for full details.

## What strings should be marked for translation

YES:

- Every text that can be visible by the player when the game is running normally. This includes tooltips, texts on cards, error messages.

NO:

- Error messages that are not supposed to happen (unexpected errors).
- Player names (i.e. do not put player_name or any php key send via notification which is essentially a player name, such as 'other_player' in 'i18n' array)
- Proper names of characters or places in some cases (consult the publisher)
- Numbers (i.e _("42"))
- Keywords used internally

## What rules should I follow for the original English strings?

For a coherent and homogeneous interface, here are some rules about ending a sentence with a final period '.'

- As a general rule:
  - If a sentence is displayed isolated in the interface => no final period
  - If a sentence is followed or could be followed by another sentence in the same interface space => final period.

- In detail:
  - No final period:
    - button labels
    - section titles
    - menu elements
    - links triggering an isolated action
    - anything that is not a full sentence
    - current actions in the status bar
  - Final period:
    - complete sentences (e.g., explanations and descriptions) that can be chained with other sentences
  - Either a period or no period is acceptable (but this should be consistent throughout the game) for:
    - isolated tooltips / small sentences
    - game logs (no period is usually preferable)
    - error messages (unless there is more than one sentence in the error message; final period is mandatory in this case)

Otherwise, you should try to follow as closely as possible the general style and format (including capitalization) used in the published English rulebook and game materials.

## Focus on translating notifications

Usually, translating a website is simple: you just call a function on every string you have to translate, and the string is translated in the player's language. On Board Game Arena, this is exactly the same with the "_( string )" function.

However, there is one difference on BGA: notifications. The server is sending notifications to players, and most of the time the notifications are the same for every players, no matter what language each player is using. This is why notifications are translated on client side in the proper language, even if the strings are defined on server side.

## How to not make translators crazy ;)

- Try to reuse the exact same strings (with the same case, etc.) to minimize the number of strings to translate.
  - **Example**: Consider replacing

    ```
    clienttranslate("Winner")
    ```

    and

    ```
    clienttranslate("Winners")
    ```

    (two strings to translate) with

    ```
    clienttranslate("Winner(s)")
    ```
  - **Example 2**:

    ```
    clienttranslate("play a card")
    ```

    and

    ```
    clienttranslate("Play a card")
    ```

    means there will be two strings to translate.
- Do not mark as translatable a game element that does not have to be translated (ex: if the name of a monster on a card is "Zzzzz", maybe there's no need to translate it).
- Words does not come in the same order in each language. Thus, when you have to translate a string with an argument, do not write something like:

```
clienttranslate("First part of the string, ").$argument.' '.clienttranslate("second part of the string")
```

Write instead:

```js
clienttranslate_('First part of the string, ${argument} second part of the string'), ['argument' => $argument ]
```

(or the equivalent "dojo.string.substitute" in Javascript)

- This also applies to punctuation marks. I.e. this is not good: _("Pick")+":"
- When translators are going to translate your game, the most difficult task for them is to get the context of the string to be translated. The shorter the string is, the more difficult the task is for them. As a rule of thumb, try to avoid short, insignificant strings that require knowledge of their surrounding context. You can also leave a comment on the context of the string in the translation program (English to English) if you are the developer of the game.
- Use same sentence for plural vs singular. We prefer to write "player gets 1 coin(s)" (or "coin/s") rather than write two versions of the same string for plural and singular - it reduces the number of strings to translate. Also using the icon to represent coin in logs may solve this issue.
- Instead of writing elaborate strings like "With the effect of ZZZ, player XXX gains a new YYY", which is very difficult to translate, write strings like "ZZZ: XXX gets YYY".
- Use present tense instead of past. E.g., "player gets wood" instead of "player got wood".
- Where two strings are identical apart from (say) a number, use the same string with a ${parameter}, and call format_string_recursive (on the client) or use args (for notifications and state descriptions) to provide the details. But \*never\* do that for composing multiple sentences with words: other languages have different grammar and it would most likely create untranslatable strings.

## Gender specific pronouns

**Avoid using gender-specific wording as much as possible**

Subject pronouns

- Do not use subject pronouns (he, she), use ${player_name} or word "player" if needed. Word "they" is fine in English (plural) but may be not in other languages (like French), so avoid using it also (use "players" or similar nouns).
- Do not use weird stuff like he/she or s/he, see about on how to replace them

Possessive pronouns

- There is [[a pronoun replacement system](https://forum.boardgamearena.com/viewtopic.php?f=11&t=19432&start=10#p88592)] is in place however it is limited to replace possessive pronouns (his, her, their), not subject pronouns (he, she, they).
- The pronoun replacement system does not change word "their" as a singular genderless pronoun. In some case its actually needed, for example if you say "King sends his troops" in the log and King is not a player name, but character in the game - it will be changed to "her" if a player is female, which is not correct, in this case their would be appropriate (or just "the troops")
- If possible re-phrase to not use possessive either: "returns card to the hand" or "returns card to player's hard" is better.

## WARNING: Make sure your strings will be translated!

For each game, our translation tool does a full scan of the code, looking for translation markers like "_()" or "clienttranslate()". (See below for the full list of translation markers.)

If your original string is not completely contained inside one of these markers, it won't be translated.

```php
    // Examples: the following strings will be translated:
    var mystring_translated = _("my string");       // JS
    $mystring_translated = clienttranslate("my string");    // PHP

    // Examples: the following strings WILL NOT be translated:
    $my_string = "my string";
    $not_translated = clienttranslate( $my_string );   // The original string is not contained within a translator marker => no translation
    $not_translated = clienttranslate( sprintf( "my string with a %s argument", $argument ) ); // Ditto
```

## On client side (Javascript)

On client side, things are quite simple: you just have to use the "_()" function for all strings you want to translate.

Examples:

```js
// Get a string in player's language:
var translated = _("original english string");

// Get a string in player's language with parameter:
var translated = dojo.string.substitute( _("You can pick ${p} cards and discard ${d}"), {
    p: 2,
    d: 4
} );
```

**WARNING:** in Javascript strings to translate, you should never use '\n', '\t' or such, as it will break the translation bundle and result in all the Javascript translation to fail. In any case, the strings will result in HTML code, and such character codes won't have any impact on the HTML rendering. You should use HTML markup instead.

**ANOTHER WARNING:** you cannot use this function _() in the javascript object constructor, but you can achieve the same if you use it the setup method. If you do that you will see this error in browser debug console:

```js
 Try to use a translated string in JS object declaration : impossible => string is NOT translated
```

### Formatting on client side

Sometimes you will want to apply some formatting on the client side, but don't want to put HTML tags within the source string (which may be confusing for translators).

This can be achieved with the `bga_format` function and Markdown-style syntax.

```js
/**
 * @function bga_format
 * Replaces delimiters with HTML tags in translated text
 * @param {string} translated string
 * @param {Object} map of replacements to make, should be of the form
 *     {
 *         '*': (t) => t,
 *         '_': 'classname',
 *     }
 *     keys are delimiters within the translated string
 *     values are either strings (classname of surrounding span) or function (flexible replacements)
 * @returns {string} Returns the original string, with replacements made.
 */
```

Example:

```js
// Get a string in player's language:
bga_format(_('You receive a *special* _tile_'), {
    '*': (t) => '<b>' + t + '</b>',
    '_': 'tile-name'
});
```

The above will return something along the lines of:

```
You receive a <b>special</b> <span class="tile-name">tile</span>
```

Or, if the user is playing in Spanish, for example:

```
Recibes una <span class="tile-name">loseta</span> <b>especial</b>
```

Notes:

- The text passed to `bga_format` must still be translated using `_()`, don't forget it!
- Good characters to demarcate formatting are: `['*', '_']` (other single characters will work, just make sure it will be clear to a translator)
- If the replacements object is a string, the inner text will be placed within a `<span>` tag with the string as a class
- If the replacements object is a function, the inner text will be passed as an argument to the function, and the return value will replace the text and the delimiters

## On server side (PHP)

On PHP side, you can use 3 different functions to specify that a string must be translated.

### Function clienttranslate

**clienttranslate( 'string to translate' ):**

This function is *transparent*: it will return the original English string without any change. Its only purpose is to mark this string as "must be translated", and to make sure the translated version of the string will be available on client side.

In general, you use clienttranslate:

- In your **Game state classes**, for the fields "description" and "descriptionmyturn".

```
      description: clienttranslate('${card_name}: ${actplayer} must discard 4 identical energies'),
```

- In **material.inc.php**, when defining text for game materials that must be displayed on the client side.

```php
$this->card_types = array(

     1 => array(
        'name' => clienttranslate('Amulet of Air'), // Thus, we can use "_( card_name )" on Javascript side.
```

- When sending a notification with *notify->all* or *notify->player*, in the game log string and all game log arguments that need a translation.

```php
     // A game log string with no argument:
     $this->bga->notify->all( 'pickLibraryCards', clienttranslate('Everyone draw cards from their library'), [] );
```

As a consequence there is no point passing variables to this function. E.g.:

```php
    notif="foo";
    $this->bga->notify->all( 'log', clienttranslate(notif),[]); // BAD
    
    notif=clienttranslate("foo");
    $this->bga->notify->all( 'log', notif,[]); // GOOD

    $this->bga->notify->all( 'log', clienttranslate("player gains ${num} gems"),[num=>2]); // BAD it is dynamic string enterpreted by php 
    $this->bga->notify->all( 'log', clienttranslate('player gains ${num} gems'),[num=>2]); // GOOD, difference is single quotes

    $this->bga->notify->all( 'log', clienttranslate("player gains ".${num}." gems"),[num=>2]); // BAD concatenation
```

Translating arguments is a little bit more complex. This uses the **i18n** special argument as below:

```php
 // In the following example, we translate the game log itself, but also the "card_name" argument:

 $this->bga->notify->all( 'winPoints', clienttranslate('${card_name}: ${player_name} gains ${points} point(s)'), array(
                'i18n' => array( 'card_name' ),     // <===== We specify here that "card_name" argument must be translated
                'player_id' => $player_id,
                'player_name' => $this->getPlayerNameById($player_id),
                'points' => $points,
                'card_name' => $this->card_types[8]['name'] // <==== Here, we provide original English string.
            ) );
```

To ensure the translation of the i18n argument will be made, clienttranslate must have been used somewhere, for instance:

```php
$this->card_types = array(
...
     8 => array(
        'name' => clienttranslate("Amulet of Fire"),
...
```

Pay attention when using the **i18n** argument when translating arguments for the client: do NOT use same argument for both translations AND key codes for client-side actions (like using 'card_name' to move it on the player board as described in the example). It's pretty obvious in the example, but it can be very tricky when translation is made at the end of the development (which is often the case). Use explicit argument names like 'card_name_translated' by example.

**WARNING:** you should NEVER use concatenation with *clienttranslate*, as it would result in a different string to translate at runtime than the one retrieved statically in the translation system, and so translation would not be applied. If you need to compose a string, use substitution and the i18n parameter (but you also have to pay attention not to compose sentences in a way that is dependent upon the English language specific syntax, or it may be impossible to translate correctly in another language: sometimes, you need multiple full sentences rather than relying on substitution).

#### Formatting arrays with i18n

When sending list to a i18n parameter, the framework will translate each entry if the value is an array.

For example with a code like this:

```js
    'resourceNames' => ['wood', 'crystal', 'copper']),
    'i18n' => ['resourceNames'],
    'separator' => ['resourceNames' => 'and'],
```

It will display "Wood, Crystal and Copper" (for this example, the translation is the same word with an uppercase).

There is 2 predefined separators : 'or' & 'and', that will display a comma separated list ending with that separator.

Any other separator will be used to join the list, so `'separator' => ['resourceNames' => ' / '],` will render "Wood / Crystal / Copper" (notice the spaces in the separator).

#### Throwing an exception because the player did a forbidden move

```
// This will display a translatable red message to the player that just did some wrong action:
throw new UserException(clienttranslate('You must choose 3 cards'));
```

Note that the use of UserException signals that this exception is "expected". In theory, all exception that are expected should be translated.

```js
// this is the same but with variable
throw new UserException(new NotificationMessage(clienttranslate('You must choose ${n} cards'), ['n' => $card_num]));
```

#### Creating labels

Label which is generated based of player's name, using client side (which is better):
in .js:

```js
  for (var player_id in this.gamedatas.players) {
      var player_color = this.gamedatas.players[player_id].color;
      var player_name = this.gamedatas.players[player_id].name;
      $('empire_title_'+player_color).innerHTML=this.format_string_recursive(_("${player_name}'s EMPIRE"), {player_name: player_name});
  }
```

## Top Secret Undocumented Features

If your string contains the clause '$${value}' (such as 'You gain $${value}.') then the translation system seems to move the position of the $ to a localized location (eg $5 in English but 5$ in French). This only seems to occur when using the argument 'value'.

In JavaScript, you can get the current user's language by retrieving the translation for the special string "$locale":

```js
   var lang = _('$locale'); // en, fr, etc.
```

## Preview another language

Once a game is released, you can view a table as a specific language by appending a language code to the URL, such as

```
&lang=es
```

## Analyze your project

Dry-run build "Scan translations" section will extract all you translation keys as translator will see them so you can double check - and run spell checker on them.

## Testing translations on Studio

On a studio table, add "&dummyTranslations" to the URL to test the translations. All the front-side translations (using `_('...')` on the front side) should display surrounded by «» to mark translatable text.

## Using translations from a base project

In some cases, when 2 projects share a big part of the same code (example: Ticket to Ride and Ticket to Ride Europe), you might not want the translators to re-translate every sentence in common for every language. We have an experimental feature to avoid translations of sentences that are common, if you are concerned for a new project please contact us using <https://studio.boardgamearena.com/support>.

## Other Useful Links

- BLOG post about translations <https://bga-devs.github.io/blog/posts/translations-summary/>
