# Draggable

> Source: http://en.boardgamearena.com/doc/Draggable

Draggable is the component that supports drag and drop.

This is example on how to use this with stock, see full implementation in "sharedcode" game in bga.

```js
		createMyDraggableInStock(targetDivId, allDragTargets) {
			var draggableObj = new ebg.draggable();
			draggableObj.create(this, targetDivId, targetDivId);

			dojo.connect(draggableObj, 'onStartDragging', this, (item_id, left, top) => {
				//console.log("onStart", item_id, left, top);
			});
			dojo.connect(draggableObj, 'onDragging', this, (item_id, left, top, dx, dy) => {
				//console.log("onDrag", item_id, left, top, dx, dy);
				var targetParent = this.getDragTarget(item_id, allDragTargets, left, top);
				if (targetParent) {
					dojo.query(".drag_target_hover").removeClass("drag_target_hover");
					dojo.addClass(targetParent, "drag_target_hover");
				}

			});
			dojo.connect(draggableObj, 'onEndDragging', this, (item_id, left, top, bDragged) => {
				if (!bDragged) return;
				//console.log("onDrop", item_id, left, top, bDragged);
				var targetParent = this.getDragTarget(item_id, allDragTargets, left, top);
				const fromstock = this.getStockSourceByDivId(item_id);
				const cardId = this.getStockCardIdByDivId(item_id);
				const tostock = this.getStockByTargetId(targetParent);
				if (tostock && tostock != fromstock) {
					var cardType = fromstock.getItemTypeById(cardId);
					tostock.addToStockWithId(cardType, cardId);
					fromstock.removeFromStockById(cardId);
				} else {
					fromstock.resetItemsPosition();
				}

				dojo.query(".drag_target_hover").removeClass("drag_target_hover");
			});
			return draggableObj;
		}
```

## Modern alternatives

Draggable it was created long time ago when HTML5 did not have such support,
it probably best to use direct html5 spec now

- Use pointer events Pointer Events API
  - code pen <https://codepen.io/VictoriaLa/pen/MWOgYYZ> (works on mobile also)
  - game: Century

- Use native drag and drop HTML Drag and Drop
  - code pen <https://codepen.io/VictoriaLa/pen/rNGXKxj> (it does not work on Mobile browsers and Chrome does not fire most of the events as of now)
  - game: Patchwork

Common drag and drop problems: <https://www.codemzy.com/blog/drag-and-drop-bug-fixes>
