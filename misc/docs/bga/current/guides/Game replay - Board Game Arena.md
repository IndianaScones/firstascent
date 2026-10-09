# Game replay

> Source: http://en.boardgamearena.com/doc/Game_replay

Game replay is managed by the framework. You do not need to do anything special about it in your code, except taking care of updating the client interface through the framework notification system (and not for example, by using the callback function of an ajaxcall / the promise of the bgaPerformAction method).

The game replay works like this:

- The static files for the game at the time of the game start are archived
- All notifications sent to the browser are added to the archive
- When replaying, the static files are loaded in the browser, then notifications are sent back to replay the game moves.

So in essence, the replay works like an exact recording.

NB: the game replay feature is now available on the studio (since December 2020). Please note that there may be a delay before the replay becomes available.

### Preview Videos

Example games are periodically selected from which videos are generated to show off the game on the game panel.

Wingspan: <https://x.boardgamearena.net/data/gamepreviews/1635/en-w640.webm>

### Hiding UI elements from preview video

Some games have pop-up modals which are displayed in some cases, these should be hidden for the replay video so you can show off the gameplay right from the game page!

[![Mycity-with-modal.png](/images/thumb/4/48/Mycity-with-modal.png/500px-Mycity-with-modal.png)](https://en.doc.boardgamearena.com/File:Mycity-with-modal.png)

Previews are generated with a query variable set `target=video`. You can check for this query param in the following way:

```js
const searchParams = new URLSearchParams(window.location.search);
if (searchParams) {
    const target = searchParams.get('target');
    if (target === "video") {
        // Hide modal popups...
    }
}
```
