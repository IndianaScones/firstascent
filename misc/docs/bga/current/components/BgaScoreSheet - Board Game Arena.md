# BgaScoreSheet

> Source: http://en.boardgamearena.com/doc/BgaScoreSheet

## Overview

**bga-score-sheet** is a javascript component to help you display an animated score sheet at the end of the game.

To see how its work and access examples of source code (via browser dev tools) see
**[Demo](https://x.boardgamearena.net/data/game-libs/bga-score-sheet/1.x/demo/index.html)**

For comprehensive API docs see
**[Doc](https://x.boardgamearena.net/data/game-libs/bga-score-sheet/1.x/docs/index.html)**

## Usage

Load the lib:

```js
const BgaScoreSheet = await importEsmLib('bga-score-sheet', '1.x');
```

This line should be placed on top of the JS file, before any class declaration.

Legacy way:

```
define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    getLibUrl('bga-score-sheet', '1.x'),
],
function (dojo, declare, gamegui, counter, BgaScoreSheet) { // note that the index of `BgaScoreSheet` must match the index of the define array
```

At the end of your game setup:

```js
this.scoreSheet = new BgaScoreSheet.ScoreSheet(
    document.getElementById(`my-score-sheet`), // an empty div on your template to place the score sheet on
    {
      animationsActive: () => this.bga.gameui.bgaAnimationsActive(), // so the animation doesn't trigger on replay fast mode
      playerNameWidth: 80,
      playerNameHeight: 30,
      entryLabelWidth: 120,
      entryLabelHeight: 20,
      classes: 'score-sheet-background',
      players: gamedatas.players,
      entries: [
        {
          property: 'conquest-cards',
          label: _('Conquest cards'),
          labelClasses: 'entries-label',
        },
        {
          property: 'politics-cards',
          label: _('Politics cards'),
          labelClasses: 'entries-label',
        },
        {
          property: 'diplomacy-cards',
          label: _('Diplomacy cards'),
          labelClasses: 'entries-label',
        },
        {
          property: 'total',
          label: _('Total'),
          labelClasses: 'entries-label',
          scoresClasses: 'total',
          width: 80,
          height: 40,
        },
      ],
      scores: gamedatas.endScores, // to defined if the game state is 99, else null, so the score displays directly on reload when the game is ended. If unset, the score sheet will be hidden by default.
      onScoreDisplayed: (property, playerId, score) => { // if you want to do something when a score is revealed
        if (property === 'total') {
          this.bga.playerPanels.getScoreCounter(playerId).setValue(Number(score));
        }
      },
    }
  );
```

On the notification sending the end score details (supposing you use bgaSetupPromiseNotifications for async notifs) :

```
    async notif_endScores(args: NotifEndScoresArgs) {
        // setting scores will make the score sheet visible if it isn't already
        await this.scoreSheet.setScores(args.endScores, {
            startBy: this.bga.players.getCurrentPlayerId()
        });
    }
```

The endScores object sent on the notification should look like this :

```php
function getEndScores(): array {
  // this would be filled dynamically on your game, but should have the shape of this static example
  $endScores = [
    156463 => [ // key is player id
      'conquest-cards' => 18, // the score code must match the entry name
      'politics-cards' => 4,
      'diplomacy-cards' => 12,
      'total' => 34
    ],
    278971 => [
      'conquest-cards' => 31,
      'politics-cards' => 7,
      'diplomacy-cards' => 5,
      'total'=> 41
    ],
  ];
  return $endScores;
}

// on your end score state
function stEndScore(): void {
  $this->bga->notify->all('endScores', '', [ 'endScores' => $this->getEndScores() ]);
}

// to display the end scores on refresh, when the game is already over
function getAllDatas(): array {
  // all your setup here

  $isEndScore = intval($this->gamestate->state_id()) >= ST_END_SCORE;
  $result['endScores'] = $isEndScore ? $this->getEndScores() : null;
}
```

## Versioning

The lib is using semver, so you can require 1.x to be sure to have the last fixes without risking a breaking change. Any breaking change will be noted on the Changelog section.

## Using with TypeScript

If you use TypeScript and this lib, you can download the **[d.ts](https://x.boardgamearena.net/data/game-libs/bga-score-sheet/1.x/dist/bga-score-sheet.d.ts)** file to put in on your game folder to benefit from auto-completion. Depending on the way you build, you might need to remove the last line (the export instruction) to be able to use it.

## Changelog

**1.0.0**: Initial version
