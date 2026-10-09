# ExpandableSection

> Source: http://en.boardgamearena.com/doc/ExpandableSection

## Example

In **mygame_mygame.tpl** (the border is not required):

```
<div id="my_expandable" style="border: 1px solid black">
    <a href="#" id="my_click_to_toggle" class="expandabletoggle expandablearrow">
        <div class="icon20"></div>
    </a>
    <div id="my_hidden_content" class="expandablecontent">
        Here's the hidden content
    </div>
</div>
```

In **Game.js**:

```
const [expandablesection] = await importDojoLibs(['ebg/expandablesection']);
```

```
this.expanded = new ebg.expandablesection();
this.expanded.create(this.bga.gameui, "my_expandable");
this.expanded.expand();   // show
this.expanded.collapse(); // hide
this.expanded.toggle();   // switch show/hide
```

### Notes

- All of the inner parts of the expandable div must have ids so dojo.query can find them.
- The section already starts with click-to-toggle behavior, so you probably won't need to toggle in your own code. Just set the initial state in your setup method.
- Source code can be found here : <https://x.boardgamearena.net/data/themereleases/220811-1000/js/modules/expandablesection.js>

## Helper Code

This doesn't appear to be part of the BGA framework, but might make creating the above code easer and more readable.

In **mygame_mygame.tpl**:

```js
var jstpl_expandablesection = '\
    <div id="${id}">\
        <a href="#" id="toggle_${id}" class="expandabletoggle expandablearrow">\
            <div class="icon20"></div>\
        </a>\
        <div id="content_${id}" class="expandablecontent">\
            ${content}\
        </div>\
    </div>';
```

In **Game.js**:

```js
placeExpandableSection(parent_id, id, content) {
   html = this.bga.gameui.format_block('jstpl_expandablesection', { id: id, content: content }); 
   dojo.place(html, parent_id);
}
```
