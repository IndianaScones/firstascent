define([ "dojo", "dojo/_base/declare", "ebg/core/gamegui"], 
	function( dojo, declare ) {
		return declare("bgagame.utils", null, {
			constructor: function() { 
				console.log('utils constructor');

				this.log_span_num = 0;
				this.clicks = [];
				this.selectables = [];
				this.selectable_tokens = [];
				this.selectable_skills = [];
				this.selectable_pitches = [];
				this.selectable_wraps = [];
				this.button_undo = false;
			},

			// animations
	        moveToNewParent: function(ele, destination, adjust=null, straighten_asset=false, offset_method=false) { // takes nodes
	            const beforeAnimation = (ele, destination, adjust, straighten_asset, offset_method) => {

	            	const origin = offset_method ? destination : ele.parentElement;

	            	const zIndex = ele.style.zIndex != '' ? Number(ele.style.zIndex) : 0;
	            	const origin_zIndex = origin.style.zIndex != '' ? Number(origin.style.zIndex) : 0;
	            	ele.style.zIndex = String(zIndex + 1000);
	            	if (!origin.classList.contains('pitch')) { origin.style.zIndex = String(origin_zIndex + 1000); }

	            	if (straighten_asset) { origin.style.transform = 'rotate(0deg)'; }

					if (offset_method) {

						let start_pos;

						// remove margins related to previous portion of anim
						if (ele.parentElement.id === 'board' && ele.classList.contains('symbol_token')) {
							ele.style.marginRight = '0';
							start_pos = ele.getBoundingClientRect();
							ele.style.marginRight = '';
						}
						else { start_pos = ele.getBoundingClientRect(); }

						destination.appendChild(ele);
						const end_pos = ele.getBoundingClientRect();
						const x_diff = start_pos.left - end_pos.left;
						const y_diff = start_pos.top - end_pos.top;

						dojo.setStyle(ele, {
							'top' : `${y_diff}px`,
							'left' : `${x_diff}px`,
							'width' : `${start_pos.width}px`,
							'height' : `${start_pos.height}px`
						});
						ele.style.setProperty('--dw', `${end_pos.width}px`);
                    	ele.style.setProperty('--dh', `${end_pos.height}px`);
					}

					else {

						origin.appendChild(ele); //put back to where it was
						const x0 = ele.getBoundingClientRect().left;
						const y0 = ele.getBoundingClientRect().top;

						destination.appendChild(ele);
						x1 = ele.getBoundingClientRect().left;
						y1 = ele.getBoundingClientRect().top;
						origin.appendChild(ele);   

						if (straighten_asset) { origin.style.transform = ''; }

						if (adjust === 1) {
							ele.style.setProperty('--dx', (y1 - y0) + 'px');
							ele.style.setProperty('--dy', (x1 - x0) + 'px');
						} else if (adjust === 2) {
							ele.style.setProperty('--dx', (y1 - y0) + 'px');
							ele.style.setProperty('--dy', (x0 - x1) + 'px');
						} else if (adjust === 3) {
							ele.style.setProperty('--dx', (x1 - x0 +16.4973) + 'px');
							ele.style.setProperty('--dy', (y1 - y0 -16.4973) + 'px');
						} else if (adjust === 4) {
							ele.style.setProperty('--dx', (y1 - y0 - 10) + 'px');
							ele.style.setProperty('--dy', (y1 - y0) + 'px');
						} else if (adjust === 5) {
							ele.style.setProperty('--dx', (x0 - x1) + 'px');
							ele.style.setProperty('--dy', (y1 - y0) + 'px');	                	
						} else {
							ele.style.setProperty('--dx', (x1 - x0) + 'px');
							ele.style.setProperty('--dy', (y1 - y0) + 'px');
						}
					}   	
	            }

	            const afterAnimation = (ele, destination, adjust, straighten_asset, offset_method) => {
	            	const origin = !offset_method ? ele.parentElement : destination;
	                destination.appendChild(ele);
	                ele.style.zIndex = '';
	                origin.style.zIndex = '';

					if (offset_method) {
						dojo.setStyle(ele, {
							'top' : '',
							'left' : '',
							'width' : '',
							'height' : ''
						});
					}
	            }

	            const func = {
	                before: beforeAnimation,
	                after: afterAnimation
	            }

	            return func;
	        },

	        animationPromise: function(ele, class_name, type, func=null, destroy=false, remove_class=false, ...params) {

				// hide personal objectives if showing
				if (
					   $('addon_toggle').classList.contains('addon_on')
					&& $('personal_objectives_toggle')
					&& $('personal_objectives_toggle').classList.contains('addon_on')
				) {
					$('personal_objectives_toggle').click();
				}

	            return new Promise(resolve => {
	                if (func && 'before' in func) { func.before(...params); }

	                if (type === 'anim') {
	                    const afterAnimationCb = () => {
	                        if (func && 'after' in func) { func.after(...params); }
	                        if (class_name == 'portaledge_close') {
	                        }
	                        if (remove_class) { ele.classList.remove(class_name); }
	                        ele.removeEventListener('animationend', afterAnimationCb);
	                        if (destroy) { ele.remove(); }
	                        resolve();
	                    }

	                    ele.addEventListener('animationend', afterAnimationCb);
	                    ele.classList.add(class_name);

	                } else if (type ==='trans') {
	                    const afterTransitionCb = () => {
	                        if (func && 'after' in func) { func.after(...params); }
	                        if (remove_class) { ele.classList.remove(class_name); }
	                        ele.removeEventListener('transitionend', afterTransitionCb);
	                        if (destroy) { ele.remove(); }
	                        resolve();
	                    }

	                    ele.addEventListener('transitionend', afterTransitionCb);
	                    ele.classList.add(class_name);

	                } else { throw new Error('type must be anim or trans') }
	            });
	        },
	        // end animations

			// mutation observer callbacks
			checkTitlebarSize: function(mutation_list, observer) {

				if (mutation_list.some(mutation => mutation.type === 'childList')) { gameui.utils.resizeTitlebar(); }
			},

			resizeTitlebar: function() {

				const parent = $('maintitlebar_content');
				const main_msg = $('pagemaintitletext');
				const button_example = document.querySelector('#generalactions > .bgabutton');
				const next_table_button = document.querySelector('#go_to_next_table_inactive_player').style.display === 'none' ?
											document.querySelector('#go_to_next_table_active_player') :
											document.querySelector('#go_to_next_table_inactive_player');
				const next_table_margin = Number(next_table_button.style.marginLeft.slice(0, -2));

				// undo all changes
				main_msg.style.fontSize = '';
				next_table_button.style.marginLeft = '0px';
				parent.querySelectorAll('.bgabutton').forEach(ele => {
					ele.style.padding = '';
					ele.style.marginLeft = '';
					ele.style.fontSize = '';
				});

				let children_width = 0;
				const child_list = parent.firstElementChild.children;

				for (const child of child_list) {
					if (child.id != 'not_playing_help' && child.id != 'generalactions') {
						children_width += child.getBoundingClientRect().width
									   +  Number(window.getComputedStyle(child).marginLeft.slice(0, -2))
									   +  Number(window.getComputedStyle(child).marginRight.slice(0, -2));
					}
				}
				for (const child of $('generalactions').children) {
					children_width += child.getBoundingClientRect().width
								   +  Number(window.getComputedStyle(child).marginLeft.slice(0, -2))
								   +  Number(window.getComputedStyle(child).marginRight.slice(0, -2));
				}
				children_width += $('go_to_next_table_active_player').getBoundingClientRect().width;
				children_width += $('go_to_next_table_inactive_player').getBoundingClientRect().width;
				const parent_width = parent.getBoundingClientRect().width;

				let percentage = Math.round( (children_width / parent_width) * 100 );
				const font_min = document.querySelector('.mobile_version') ? 10 : 14;

				if (document.querySelector('.mobile_version') && percentage > 97) {
					const first_icon = document.querySelector('.requirement_wrap');
					if (first_icon && !document.querySelector('#titlebar_line_break')) {
						first_icon.insertAdjacentHTML('beforebegin', '<div id="titlebar_line_break"></div>');
					}
				}

				let button_padding, button_margin, button_font_size, button_ninety_five;
				while (percentage > 80) {
					const msg_font_size = Number(window.getComputedStyle(main_msg).fontSize.slice(0, -2));
					const msg_ninety_five = msg_font_size * 0.95;

					if (button_example) {
						button_padding = Number(window.getComputedStyle(button_example).paddingLeft.slice(0, -2));
						button_margin = Number(window.getComputedStyle(button_example).marginLeft.slice(0, -2));
						button_font_size = Number(window.getComputedStyle(button_example).fontSize.slice(0, -2));
						button_ninety_five = button_font_size * 0.95;
					}

					if (msg_ninety_five > font_min) {
						const width_before = main_msg.getBoundingClientRect().width;
						main_msg.style.fontSize = `${String(msg_ninety_five)}px`;
						const width_after = main_msg.getBoundingClientRect().width;
						children_width -= width_before - width_after;
						percentage = Math.round( (children_width / parent_width) * 100);
					}

					else if (button_example && button_font_size > font_min) {
						document.querySelectorAll('#generalactions > .bgabutton').forEach(ele => {
							const width_before = ele.getBoundingClientRect().width;
							ele.style.fontSize = `${String(button_ninety_five)}px`;
							const width_after = ele.getBoundingClientRect().width;
							children_width -= width_before - width_after;
							percentage = Math.round( (children_width / parent_width) * 100);
						});
						document.querySelectorAll('#gotonexttable_wrap > .bgabutton').forEach(ele => {
							const width_before = ele.getBoundingClientRect().width;
							ele.style.fontSize = `${String(button_ninety_five)}px`;
							const width_after = ele.getBoundingClientRect().width;
							children_width -= width_before - width_after;
							percentage = Math.round( (children_width / parent_width) * 100);
						});
					}

					else if (button_example && button_padding > 3) {
						parent.querySelectorAll('.bgabutton').forEach(ele => {
							ele.style.padding = `6px ${button_padding - 3}px`;
							children_width -= 6;
						});
						percentage = Math.round( (children_width / parent_width) * 100);
					}

					else if (next_table_margin > -50) {
						next_table_button.style.marginLeft = '-50px';
						children_width -= 50;
						percentage = Math.round( (children_width / parent_width) * 100);
					}

					else if (button_example && button_margin > 2) {
						parent.querySelectorAll('.bgabutton').forEach(ele => {
							ele.style.marginLeft = `${button_margin - 2.5}px`;
							children_width -= 2.5;
						});
						percentage = Math.round( (children_width / parent_width) * 100);
					}

					else { break; }
				}
			},

			resizeHand: function(asset_or_token='', added_to_hand=[]) {

				if (!gameui.isSpectator) {
			
					const assets_wrap = $('assets_wrap');
					const hand_ratio = $('hand_ratio');
					const old_card_eles = dojo.query('#assets_wrap .asset');
					const new_cards = asset_or_token === 'asset' ? [...added_to_hand] : [];
					const old_token_eles = [...dojo.query('#assets_wrap .summit_beta'), ...dojo.query('#assets_wrap .symbol_token')];
					const new_token = asset_or_token === 'token' ? 1 : 0;
					const card_sum = old_card_eles.length + new_cards.length;
					const token_num = old_token_eles.length + new_token;
			
					// add new cards to hand and order all cards in hand
					const old_cards = [];
					for (let ele of old_card_eles) {
						const id = ele.id.slice(-3).replace(/^\D+/g, '');
						const arg = gameui.gamedatas.asset_identifier[id];
						const type = this.getAssetType(arg);
						old_cards.push([id, type]);
					}
			
					for (let i=0; i<=new_cards.length-1; i++) {
						const id = new_cards[i];
						const arg = gameui.gamedatas.asset_identifier[id];
						const type = this.getAssetType(arg);
						new_cards[i] = [id, type];
					}
			
					const all_cards = new_cards.slice();
					if (old_cards.length > 0) { old_cards.map(card => all_cards.push(card)); }
					all_cards.sort((a, b) => a[0] - b[0]);
					const type_list = all_cards.map(array => array[1]);
					const type_counts = { 'gear': 0, 'face': 0, 'crack': 0, 'slab': 0 };
					type_list.forEach((type) => { type_counts[type] = (type_counts[type]) + 1; });
					let gear = 1;
					let face = type_counts['gear']+1;
					let crack = face + type_counts['face'];
					let slab = crack + type_counts['crack'];
			
					const old_card_slots = [], new_card_slots = {};
			
					for (let card of all_cards) {
						let slot;
						switch (card[1]) {
							case 'gear': slot = gear; gear++; break;
							case 'face': slot = face; face++; break;
							case 'crack': slot = crack; crack++; break;
							case 'slab': slot = slab; slab++; break;
						}
						if (old_cards.includes(card)) { old_card_slots.push([card[0], slot]); }
						else if (new_cards.includes(card)) { new_card_slots[card[0]] = slot; }
					}
			
					for (let i=1; i<=card_sum; i++) {
						if (!$(`hand_asset_${i}`)) {
							dojo.place(`<div id="hand_asset_${i}" class="hand_asset_wrap" style="z-index: ${i};"></div>`, 'assets_wrap');
						}
					}
					for (const card of old_card_slots) {
						const card_ele = $(`asset_card_${card[0]}`);
						const slot = $(`hand_asset_${card[1]}`);
						if (card_ele && slot) { // Add checks if elements exist
							slot.appendChild(card_ele);
						}
					}
			
					// if token is added, add new slot and return token slot number
					for (let i=1; i<=token_num; i++) {
						if (!$(`hand_token_${i}`)) {
							dojo.place(`<div id="hand_token_${i}" class="hand_token_wrap"></div>`, 'assets_wrap');
						}
					}
					let new_token_slot = null;
					if (new_token) {
						const hand_tokens = Object.keys(gameui.gamedatas.hand_summit_beta_tokens);
						const symbol_tokens = gameui.gamedatas.hand_symbol_tokens;
						for (const [symbol, num] of Object.entries(symbol_tokens)) {
							for (let i=1; i<=num; i++) { hand_tokens.push(symbol); }
						}
						let tech_num = 1;
						for (let i=0; i<token_num; i++) {
							const slot = $(`hand_token_${i+1}`);
							slot.id = `hand_token_${i+1}`;
							const token = hand_tokens[i];
							const token_ele = Number(token) ? $(`summit_beta_${token}`) : $(`${token}_token_${tech_num}`);
							if (!Number(token)) {
								if (tech_num < symbol_tokens[token]) { tech_num++; }
								else { tech_num = 1; }
							}
							if (token_ele) { // not the new one
								if (slot.firstElementChild != token_ele) { slot.append(token_ele); }
							}
							else { // the new one
								new_token_slot = slot;	
							}
						}
					}
			
					// upon cards or tokens leaving hand
					if (new_cards.length === 0 && asset_or_token === '') {
						const existing_card_wraps = dojo.query('.hand_asset_wrap');
						let card_j = 1;
						const current_card_ids_in_dom = dojo.query('#assets_wrap .asset').map(ele => ele.id.slice(-3).replace(/^\D+/g, '')); // Get current card IDs in DOM
						for (let i = 0; i < existing_card_wraps.length; i++) {
							// Check if the wrap contains a card that is still in the hand
							if (existing_card_wraps[i].firstChild && current_card_ids_in_dom.includes(existing_card_wraps[i].firstChild.id.slice(-3).replace(/^\D+/g, ''))) {
								existing_card_wraps[i].id = `hand_asset_${card_j}`;
								existing_card_wraps[i].style.zIndex = card_j;
								card_j++;
							} else {
								// If the wrap is empty or contains a card no longer in hand, remove it
								existing_card_wraps[i].remove();
							}
						}
						// Remove any wraps that might be left over if logic above wasn't perfect (edge case)
						// This is probably redundant if the above is correct, but harmless
						dojo.query('.hand_asset_wrap').forEach((wrap, index) => {
						    if (index >= card_sum) { wrap.remove(); }
						});
					}
			
			
					if (new_token === 0 && asset_or_token === '') {
						const existing_token_wraps = dojo.query('.hand_token_wrap');
						let token_j = 1;
						const current_token_eles_in_dom = [...dojo.query('#assets_wrap .summit_beta'), ...dojo.query('#assets_wrap .symbol_token')];
						for (let i = 0; i < existing_token_wraps.length; i++) {
							// Check if the wrap contains a token that is still in the hand (assuming tokens are also direct children here)
							if (existing_token_wraps[i].firstChild && current_token_eles_in_dom.includes(existing_token_wraps[i].firstChild)) {
								existing_token_wraps[i].id = `hand_token_${token_j}`;
								token_j++;
							} else {
								existing_token_wraps[i].remove();
							}
						}
						// Remove any wraps that might be left over
						dojo.query('.hand_token_wrap').forEach((wrap, index) => {
						    if (index >= token_num) { wrap.remove(); }
						});
					}
			
					// Ensure tokens are appended last in assets_wrap
					dojo.query('.hand_token_wrap').forEach(ele => {
						assets_wrap.appendChild(ele);
					});
			
					// set height of hand_ratio
					// Recalculate hand_bottom based on all current wraps
					let current_hand_wraps = dojo.query('.hand_asset_wrap, .hand_token_wrap'); // Get both types of wraps
					let hand_bottom_px = null;
					let assets_wrap_top_px = assets_wrap.getBoundingClientRect().top;
			
					for (let wrap of current_hand_wraps) {
						 const wrap_bottom_viewport = wrap.getBoundingClientRect().bottom;
						 const wrap_bottom_relative_to_container = wrap_bottom_viewport - assets_wrap_top_px;
						 if (hand_bottom_px === null || wrap_bottom_relative_to_container > hand_bottom_px) {
							  hand_bottom_px = wrap_bottom_relative_to_container;
						  }
					}
			
					let height_px = hand_bottom_px || 0; // If no wraps, height is 0
			
					if (height_px >= 0) { // Ensure height is non-negative
						const height_vmin = this.convertPxToVmin(height_px);
						// Only update if significantly different to potentially avoid unnecessary layout thrashing
						// Might need to tune the threshold (e.g., 0.1 or 0.5)
						const current_padding_px = hand_ratio.getBoundingClientRect().height; // Get current *rendered* height from padding
						if (Math.abs(current_padding_px - height_px) > 1) { // Check if difference is more than 1px
							hand_ratio.style.paddingTop = `${height_vmin}vmin`;
						} else if (height_px === 0 && current_padding_px > 0) {
							// Special case: if intended height is 0 but current is not, force reset
							hand_ratio.style.paddingTop = '0vmin';
						}
					}
			
					if (asset_or_token === 'asset') { return new_card_slots; }
					else if (asset_or_token === 'token') { return new_token_slot; }
				}
			},

			convertPxToVmin: function(px) {

				const viewport_min = Math.min(window.innerHeight, window.innerWidth);
				const vmin = (px / viewport_min) * 100;
				return vmin;
			},
			
			convertVmaxToPx: function(vmax) {

				const viewportWidth = window.innerWidth;
				const viewportHeight = window.innerHeight;
				const largerDimension = Math.max(viewportWidth, viewportHeight);
				return (vmax / 100) * largerDimension;
			},

			clicksOff: function(type='default') {

				if ($('button_undo')) {
					this.button_undo = true;
					$('button_undo').remove();
				}

				switch (type) {

					case 'hard_off':
						document.querySelectorAll('.selectable').forEach(ele => {
							this.selectables.push(ele);
							ele.classList.remove('selectable');
						});
						document.querySelectorAll('.selectable_token').forEach(ele => {
							this.selectable_tokens.push(ele);
							ele.classList.remove('selectable_token');
						});
						document.querySelectorAll('.selectable_skill').forEach(ele => {
							this.selectable_skills.push(ele);
							ele.classList.remove('selectable_skill');
						});
						document.querySelectorAll('.selectable_wrap').forEach(ele => {
							this.selectable_wraps.push(ele);
							ele.classList.remove('selectable_wrap');
						});
						const confirm_button = document.getElementById('confirm_button');
						if (confirm_button && !confirm_button.classList.contains('disabled')) {
							confirm_button.classList.add('disabled');
							this.confirm_button = true;
						}
						const confirm_requirements_button = document.getElementById('confirm_requirements_button');
						if (confirm_requirements_button && !confirm_requirements_button.classList.contains('disabled')) {
							confirm_requirements_button.classList.add('disabled');
							this.confirm_requirements_button = true;
						}
						const risk_button = document.getElementById('risk_it_button');
						if (risk_button && !risk_button.classList.contains('disabled')) {
							risk_button.classList.add('disabled');
							this.risk_button = true;
						}
						const trade_button = document.getElementById('trade_button');
						if (trade_button && !trade_button.classList.contains('disabled')) {
							trade_button.classList.add('disabled');
							this.trade_button = true;
						}
					
					case 'default':
						document.querySelectorAll('.cursor').forEach(ele => {

							this.clicks.push(ele);
							ele.style.pointerEvents = 'none';
						});
						break;

					case 'pitches':
						document.querySelectorAll('.available_pitch').forEach(ele => {
							const pitch_click = ele.nextElementSibling.nextElementSibling;
							this.selectable_pitches.push(pitch_click);
							pitch_click.style.pointerEvents = 'none';
						});
						break;
				}
			},

			clicksOn: function(type) {

				if (this.button_undo) {
					gameui.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => gameui.onUndoClimbingCard(), undefined, undefined, 'red');
					this.button_undo = false;
				}

				for (const ele of this.clicks) { ele.style.pointerEvents = ''; }
				this.clicks = [];

				switch (type) {
					case 'hard_on':
						for (const ele of this.selectables) { ele.classList.add('selectable'); }
						for (const ele of this.selectable_tokens) { ele.classList.add('selectable_token'); }
						for (const ele of this.selectable_skills) { ele.classList.add('selectable_skill'); }
						for (const ele of this.selectable_wraps) { ele.classList.add('selectable_wrap'); }
						this.selectables = [];
						this.selectable_tokens = [];
						this.selectable_skills = [];
						this.selectable_wraps = [];

						if (this.confirm_button) {
							document.getElementById('confirm_button').classList.remove('disabled');
							delete this.confirm_button;
						}
						if (this.confirm_requirements_button) {
							document.getElementById('confirm_requirements_button').classList.remove('disabled');
							delete this.confirm_requirements_button;
						}
						if (this.risk_button) {
							document.getElementById('risk_it_button').classList.remove('disabled');
							delete this.risk_button;
						}
						if (this.trade_button) {
							document.getElementById('trade_button').classList.remove('disabled');
							delete this.trade_button;
						}
						break;

					case 'pitches':
						for (const ele of this.selectable_pitches) { ele.style.pointerEvents = ''; }
						this.selectable_pitches = [];
						break;
				}
			},

	        handCount: function(player_id, hand_count) {
	            $(`hand_num_${player_id}`).innerHTML = hand_count;
				gameui.gamedatas.hand_count[player_id] = hand_count;
	        },

	        // Tooltips

	        getTooltipForLog: function(item, type) {

	            switch(type) {
	                case 'asset':
	                	this.log_span_num++;
	                    const asset_title = gameui.gamedatas['asset_cards'][item]['description'];
	                    return gameui.format_block('jstpl_log_item', {
	                    		num: this.log_span_num,
	                            item_key: item,
	                            item_type: 'asset_tt',
	                            item_name: asset_title,
	                    });

	                case 'pitch':
	                	this.log_span_num++;
	                    const pitch_title = gameui.gamedatas['pitches'][item]['description'];
	                    return gameui.format_block('jstpl_log_item', {
	                    		num: this.log_span_num,
	                            item_key: item,
	                            item_type: 'pitch_tt',
	                            item_name: pitch_title,
	                    });

	                case 'climbing':
	                	this.log_span_num++;
	                	const climbing_title = gameui.gamedatas['climbing_cards'][item]['description'];
	                	return gameui.format_block('jstpl_log_item', {
	                			num: this.log_span_num,
	                			item_key: item,
	                			item_type: 'climbing_tt',
	                			item_name: climbing_title,
	                	});

	                case 'summit_beta':
	                	this.log_span_num++;
	                	const summit_beta_title = gameui.gamedatas['summit_beta_tokens'][item]['description'];
	                	return gameui.format_block('jstpl_log_item', {
	                			num: this.log_span_num,
	                			item_key: item,
	                			item_type: 'summit_beta_tt',
	                			item_name: summit_beta_title,
	                	});

					case 'personal_objective':
						this.log_span_num++;
						const personal_objective_title = gameui.gamedatas['personal_objectives'][item]['description'];
						return gameui.format_block('jstpl_log_item', {
								num: this.log_span_num,
								item_key: item,
								item_type: 'personal_objective_tt',
								item_name: personal_objective_title,
						});
	            }
	        },

	        assetTooltip: function(ele, card_type) {
	        	const card = gameui.gamedatas.asset_cards[card_type];
	            const bg_pos = card['x_y'];
	            const skill = _(card['skill']);
	            const title = _(card['description']);
	            const html = `<div style="margin-bottom: 5px; display: inline;"><strong>${title}</strong></div>
	                          <span style="font-size: 10px; margin-left: 5px;">${skill}</span>
	                          <div class="asset asset_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>`;
	            gameui.addTooltipHtml(ele, html, 1000);
	        },

	        pitchTooltip: function(ele, pitch_type, tokens=false, rope_order) {
	        	const pitch = gameui.gamedatas.pitches[pitch_type];
	            const bg_pos = pitch['x_y'];
	            const title = _(pitch['description']);
	            const type = _(pitch['type_description']);
	            let skill_tokens = '';

	            if (tokens) {
	            	for (token of tokens) {
	            		let clone = token.cloneNode(true);
	            		clone.classList.add('pitch_token_wrapper_tt');
						if (rope_order) { clone.classList.add('with_rope_order'); }
	            		skill_tokens += clone.outerHTML;
	            	}
	            }
	            const html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
	                          <div class="pitch pitch_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;">
	                          ${skill_tokens}</div>
	                          <div> Type: ${type} / Value: ${gameui.gamedatas.pitches[pitch_type]['value']}</div>
							  <br><div class="rope_order">${rope_order}</div>`;
	            gameui.addTooltipHtml(ele, html, 1000);
	        },

			getSkillTokens: function(pitch_num) {
				let skill_tokens = [];
                if (Object.keys(gameui.gamedatas.pitch_asset_tokens).includes(pitch_num)) {
                    let i = 1;
                    for (const type of gameui.gamedatas.pitch_asset_tokens[pitch_num]) {
                        const token = document.createElement('div');
                        token.innerHTML = `<div id="${pitch_num}_token_wrapper" class="pitch_token_wrapper"><div class="${type}_token symbol_token"></div></div>`;
                        if ([2,3].includes(i)) { token.firstElementChild.classList.add(`pitch_token_wrapper_${i}`); }
                        skill_tokens.push(token.firstElementChild);
                        i++;
                    }
                }
				return skill_tokens;
			},

			getRopeOrder: function(pitch_num) {
				const rope_hub = $(`pitch_${pitch_num}_rope`);
                let rope_order = '';
                let rope_ids = [];
                if (rope_hub.children.length > 0) {
                    for (let child of rope_hub.children) {
                        const player_id_match = /rope_wrapper_(\d+)_(\d)/;
						const rope_wrapper = child.classList.contains('rope_wrapper') ? child : child.firstElementChild;
                        const player_id = rope_wrapper.id.match(player_id_match)[1];
                        if (rope_wrapper.classList.contains('climber_1')) { rope_ids[0] = player_id; }
                        else if (rope_wrapper.classList.contains('climber_2')) { rope_ids[1] = player_id; }
                        else if (rope_wrapper.classList.contains('climber_3')) { rope_ids[2] = player_id; }
                        else if (rope_wrapper.classList.contains('climber_4')) { rope_ids[3] = player_id; }
						else if (rope_wrapper.classList.contains('climber_5')) { rope_ids[4] = player_id; }
                    }
                    for (let player_id of rope_ids) {
                        const player = gameui.gamedatas.players[player_id];
                        const name_span = gameui.format_block('jstpl_colored_name', {
                            player_id : player_id,
                            color : player.color,
                            player_name : player.name,
                        });
						if (!rope_order) { rope_order += 'Rope order:'; }
                        rope_order += `<br>${name_span}`;
                    }
                }
				return rope_order;
			},

	        climbingTooltip: function(ele, card_type, log=false) {
	        	const card = gameui.gamedatas.climbing_cards[card_type];
	        	const bg_pos = card['x_y'];
	        	const title = _(card['description']);
	        	const effect_a_flavor = _(card['effect_a_flavor']);
	        	const effect_a = _(card['effect_a']);
	        	const effect_b_flavor = _(card['effect_b_flavor']);
	        	const effect_b = _(card['effect_b']);
	        	const log_pic = (log) ? `<div class="climbing climbing_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>` : '';
	        	const html = `<div class="climbing_tooltip_wrapper"><div style="margin-bottom: 5px;"><strong>${title}</strong></div>
	        				  ${log_pic}
	        				  <div style="text-align: center;"><i>${effect_a_flavor}</i></div><br><div>${effect_a}</div>
	        				  <div style="text-align: center; position: relative; bottom: 4px;">_________________________</div>
	        				  <div style="text-align: center;"><i>${effect_b_flavor}</i></div><br><div>${effect_b}</div></div>`;
	        	gameui.addTooltipHtml(ele, html, 1000);
	        },

	        summitBetaTooltip: function(ele, summit_beta_type) {
	        	const token = gameui.gamedatas.summit_beta_tokens[summit_beta_type];
	        	const bg_pos = token['x_y'];
	        	const title = _(token['description']);
	        	const effect_string = _(token['effect_string']);
	        	const subscript_string = _(token['subscript_string']) || '';
	        	const html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                            <div class="summit_beta summit_beta_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%;"></div>
                            <div>${effect_string}</div>
                            <div style="font-size:10px;"><i>${subscript_string}</i></div>`;
                gameui.addTooltipHtml(ele, html, 1000);
	        },

			sharedObjectiveTooltip: function(shared_objective) {
				const shared_objectives = gameui.gamedatas.shared_objectives;
                const bg_pos = shared_objectives[shared_objective]['x_y'];
                const subscript = _(shared_objectives[shared_objective]['subscript_string']) || '';
                const title = _(shared_objectives[shared_objective]['description']);
                const condition = _(shared_objectives[shared_objective]['objective_string']);
                const objective_tracker_ele = document.querySelector(`.so_${shared_objective}`).firstElementChild;
                const html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                            <div class="shared_objective shared_objective_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%;"></div>
                            <div>${condition}</div>
                            <div style="font-size:10px;">${subscript}</div>
                            <br>
                            ${objective_tracker_ele.innerHTML}`;
                gameui.addTooltipHtml(`shared_objective${shared_objective}`, html, 1000);
			},

			personalObjectiveTooltip: function(ele, personal_objective_type, log=false) {
				const objective = gameui.gamedatas.personal_objectives[personal_objective_type];
				const bg_pos = objective['x_y'];
				const title = _(objective['description']);
				const text = _(objective['text']);
				const mark = _(objective['mark']);
				let pitch_names = [...objective['pitch_names']];
				const starting_top = gameui.gamedatas.personal_objectives[personal_objective_type]['starting_check_top'];
				let checks = '';
				let tracker = null;

				if (gameui.gamedatas.personal_objectives_tracker && Object.keys(gameui.gamedatas.personal_objectives_tracker).includes(String(personal_objective_type))) {
					tracker = gameui.gamedatas.personal_objectives_tracker[personal_objective_type];
				}
				else if (gameui.gamedatas.opponents_objectives_tracker) {
					let found_key = null;
					const temp_tracker = gameui.gamedatas.opponents_objectives_tracker;
					for (const parent_key in temp_tracker) {
						if  (temp_tracker.hasOwnProperty(parent_key)
						  && temp_tracker[parent_key].hasOwnProperty(personal_objective_type)) {
							found_key = parent_key;
							break;
						}
					}
					tracker = gameui.gamedatas.opponents_objectives_tracker[found_key][personal_objective_type];
				}
				else { tracker = []; } // spectator
				for (let index of tracker) {
					const check_top = starting_top + 5.98 * index;
					const check = `<div class="check" style="top: ${check_top}%;">\u2713</div>`;
					checks += check;
					pitch_names[index] = `<strong style="position: relative;">\u2713</strong> ${pitch_names[index]}`;
				}

				const log_tt_tops = objective['log_tt_tops'];
				const padding = objective['log_tt_padding_rights'];
				let pitches_wrapper = `<div id="po_tt_pitches" style="top: ${log_tt_tops['pitches']};">`;
				pitch_names.forEach(pitch => {
					pitches_wrapper += `${_(pitch)}<br>`;
				});
				pitches_wrapper += '</div>';
				const call_it_like_you_see_it = personal_objective_type === '3' ? `<div id="po_tt_cilysi">${_('Any route with')}</div><br>` : '';
				const html = (log) ?
									`<div class="personal_objective personal_objective_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%;">${checks}</div>
									 <div class="po_tt_wrapper log_below">
									 <div id="po_tt_title" style="top: ${log_tt_tops['title']};${padding['title']}"><strong>${title}</strong></div><br>
									 <hr id="title_hr" class="tt_hr" style="top: ${log_tt_tops['title_hr']};">
									 <div id="po_tt_text" style="top: ${log_tt_tops['text']};${padding['text']}">${text}</div><br>
									 <hr id="text_hr" class="tt_hr" style="top: ${log_tt_tops['text_hr']};">
									 <div id="po_tt_mark" style="top: ${log_tt_tops['mark']};${padding['mark']}">${mark}</div><br>
									 <hr id="mark_hr" class="tt_hr" style="top: ${log_tt_tops['mark_hr']};">
									 ${call_it_like_you_see_it}
									 ${pitches_wrapper}
									 </div>`
								   :
								    `<div id="po_tt_title"><strong>${title}</strong></div>
									 <hr id="title_hr" class="tt_hr">
									 <div id="po_tt_text">${text}</div>
									 <hr id="text_hr" class="tt_hr">
									 <div id="po_tt_mark">${mark}</div>
									 <hr id="mark_hr" class="tt_hr">
									 ${call_it_like_you_see_it}
									 ${pitches_wrapper}`
								   ;
				gameui.addTooltipHtml(ele, html, 1000);

				if (log) {
					const label_before = gameui.tooltips[ele].label.slice(0, 25);
					const label_after = gameui.tooltips[ele].label.slice(25);
					gameui.tooltips[ele].label = label_before + ' log_personal_objective_tooltip_parent' + label_after;
				}
				else {
					const label_before = gameui.tooltips[ele].label.slice(0, 25);
					const label_after = gameui.tooltips[ele].label.slice(25);
					gameui.tooltips[ele].label = label_before + ' game_personal_objective_tooltip_parent' + label_after;
				}
			},

	        addTooltipsToLog: function() {
	            const item_elements = dojo.query('.item_tooltip:not(.tt_processed)');
	            Array.from(item_elements).forEach((ele) => {
	                const ele_id = ele.id;
					ele.classList.add('tt_processed');

	                if (ele.classList.contains('asset_tt')) {
	                    const asset_type = ele_id.slice(-3).replace(/^\D+/g, '');
	                    this.assetTooltip(ele_id, asset_type);
	                }
	                else if (ele.classList.contains('pitch_tt')) {
	                    const pitch_type = ele_id.slice(-2).replace(/^\D+/g, '');
						const hex_num = document.querySelector(`.p${pitch_type}`).id.slice(-2).replace(/^\D+/g, '');
						const skill_tokens = this.getSkillTokens(hex_num);
						const rope_order = this.getRopeOrder(hex_num);
	                    this.pitchTooltip(ele_id, pitch_type, skill_tokens, rope_order);
	                }

	                else if (ele.classList.contains('climbing_tt')) {
	                	const climbing_type = ele_id.slice(-3).replace(/^\D+/g, '');
	                	this.climbingTooltip(ele_id, climbing_type, true);
	                }

	                else if (ele.classList.contains('summit_beta_tt')) {
	                	const summit_beta_type = ele_id.slice(-3).replace(/^\D+/g, '');
	                	this.summitBetaTooltip(ele_id, summit_beta_type);
	                }

					else if (ele.classList.contains('personal_objective_tt')) {
						const personal_objective_type = ele_id.slice(-3).replace(/^\D+/g, '');
						this.personalObjectiveTooltip(ele_id, personal_objective_type, true);
					}
	            });
	        },

	        shouldAnimate: function() {
	            return document.visibilityState !== 'hidden' && !gameui.instantaneousMode;
	        },

	        logInject: function (log_entry) { // also includes names from titlebar
	            const asset_regex = /\[\w+-*\w* *\w*\(\d+\)\]/g;
	            const pitch_regex = /\{\w*[-'. ]*\w*[-'. ]*\w*[-'. ]*\w*[-'. ]*\(*\w* *\w* *\w*\)*\(*\d*\)*\}/g;
	            const climbing_regex = /\/\w* ?\w*'? ?-?\w*'? ?\w* ?\w*-? ?\w* ?\w*!?\(\d*\)\\/g;
	            const summit_beta_regex = /\+\w+ ?\w+\(\d+\)\+/g;
	            const colored_name_regex = /@[\w\d ]+@/g;
				const personal_objectives_regex = /==([^\n()]+)\((\d+)\)==/g;
	            const assets_to_replace = log_entry.matchAll(asset_regex);
	            const pitch_to_replace = log_entry.match(pitch_regex);
	            const climbing_to_replace = log_entry.matchAll(climbing_regex);
	            const summit_beta_to_replace = log_entry.matchAll(summit_beta_regex);
	            const names_to_replace = log_entry.matchAll(colored_name_regex);
				const personal_objectives_to_replace = log_entry.matchAll(personal_objectives_regex);

	            for (let asset of assets_to_replace) {
	                const match = asset[0];
	                const left_parenthesis = match.indexOf('(');
	                const asset_name = match.slice(1, left_parenthesis);
	                const asset_type = match.slice(left_parenthesis+1, match.length-2);

	                const asset_span = this.getTooltipForLog(asset_type, 'asset');
	                log_entry = log_entry.replace(match, asset_span);
	            }

	            if (pitch_to_replace) {

	            	let pitch_name = null;
	            	let pitch_type = null;
	            	if (pitch_to_replace[0] === '{The S.A.T. (Slab Aptitude Test)(38)}') {
	            		pitch_name = 'The S.A.T. (Slab Aptitude Test)';
	            		pitch_type = '38';
	            	}
	            	else {
	            		const left_parenthesis = pitch_to_replace[0].indexOf('(');
		                pitch_name = pitch_to_replace[0].slice(1, left_parenthesis);
		                pitch_type = pitch_to_replace[0].slice(left_parenthesis+1, pitch_to_replace[0].length-2);
	            	}

	                const pitch_span = this.getTooltipForLog(pitch_type, 'pitch');
	                log_entry = log_entry.replace(pitch_to_replace, pitch_span);
	            }

	            for (let climbing of climbing_to_replace) {
					const match = climbing[0];
	            	const left_parenthesis = match.indexOf('(');
	            	const climbing_name = match.slice(1, left_parenthesis);
	            	const climbing_type = match.slice(left_parenthesis+1, match.length-2);

	            	const climbing_span = this.getTooltipForLog(climbing_type, 'climbing');
	            	log_entry = log_entry.replace(match, climbing_span);
	            }

	            for (let summit_beta of summit_beta_to_replace) {
	            	const left_parenthesis = summit_beta[0].indexOf('(');
	            	const summit_beta_name = summit_beta[0].slice(1, left_parenthesis);
	            	const summit_beta_type = summit_beta[0].slice(left_parenthesis+1, summit_beta[0].length-2);

	            	const summit_beta_span = this.getTooltipForLog(summit_beta_type, 'summit_beta');
	            	log_entry = log_entry.replace(summit_beta[0], summit_beta_span);
	            }

	            for (let match of names_to_replace) {
	                const name = match[0].slice(1, -1);

	                const player = Object.values(gameui.gamedatas.players).find(entry => entry.name === name);

	                const name_span = gameui.format_block('jstpl_colored_name', {
				                    		player_id : player.id,
				                    		color : player.color,
				                    		player_name : name,
				                      });

	                log_entry = log_entry.replace(match, name_span);
	            }

				for (let personal_objective of personal_objectives_to_replace) {
					const left_parenthesis = personal_objective[0].indexOf('(');
					const personal_objective_name = personal_objective[0].slice(1, left_parenthesis);
					const personal_objective_type = personal_objective[0].slice(left_parenthesis+1, personal_objective[0].length-3);
					const personal_objective_span = this.getTooltipForLog(personal_objective_type, 'personal_objective');
					log_entry = log_entry.replace(personal_objective[0], personal_objective_span);
				}

	            return log_entry;
	        },

	        sanitizeHand: function() {
	        	let temp_hand = Object.keys(gameui.gamedatas.hand_assets);

	        	dojo.query('#assets_wrap .asset').forEach(ele => {
	        		const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
	        		if (temp_hand.includes(asset_id)) {
	        			const idx = temp_hand.indexOf(asset_id);
	        			temp_hand.splice(idx, 1);
	        		} else {
	        			ele.parentElement.remove();
	        			ele.remove();
	        		}
	        	});
	        },

	        sanitizeAssetBoards: function() {
	        	const board_assets = gameui.gamedatas.board_assets;
	        	for (const player_id of Object.keys(board_assets)) {

	        		const player = gameui.gamedatas.players[player_id];
	        		const character_id = player.character;
	        		const character = gameui.gamedatas.characters[character_id];

	        		const asset_board = gameui.gamedatas.board_assets[player_id];
	        		for (const type of Object.keys(asset_board)) {

						if (character_id === '2' && type === 'gear') { continue; } // Free Soloist
						let slots = 4;
						if (character_id === '6') { slots = type === 'gear' ? 5 : 3; } // Young Prodigy

	        			let temp_type = [];
	        			for (let i=1; i<=slots; i++) {
	        				const card_obj = gameui.gamedatas.board_assets[player_id][type][String(i)];
	        				if (Object.values(card_obj).length > 0) {
	        					temp_type.push(Object.keys(card_obj)[0]);
	        				}
	        			}

	        			dojo.query(`#asset_board_${player_id} > #${character.name}_${type} .played_asset`).forEach(ele => {
	        				const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
	        				if (temp_type.includes(asset_id)) {
	        					const idx = temp_type.indexOf(asset_id);
	        					temp_type.splice(idx, 1);
	        				} else {
	        					ele.remove();
	        				}
	        			});

	        			const db_tucked_num = Object.keys(asset_board[type]['tucked']).length;
	        			const ele_tucked_num = dojo.query(`#${character.name}_${type} .asset_counter_num`)[0];
	        			ele_tucked_num.innerHTML = db_tucked_num;
	        		}
	        	}
	        },

	        getCurrentPlayerResources: function() {
	        	let resources = {};

	        	resources.water = gameui.gamedatas.resource_tracker['water'];
	        	resources.psych = gameui.gamedatas.resource_tracker['psych'];

	        	resources.skills = gameui.gamedatas.resource_tracker['skills'];
	        	resources.permanent_skills = gameui.gamedatas.resource_tracker['permanent_skills'];

	        	resources.any_asset = resources.skills.gear + resources.skills.face + resources.skills.crack + resources.skills.slab
	        						  + resources.permanent_skills.gear + resources.permanent_skills.face
	        						  + resources.permanent_skills.crack + resources.permanent_skills.slab;
	        	resources.any_skill = resources.any_asset - (resources.skills.gear + resources.permanent_skills.gear);

				resources.any_asset_in_hand = resources.skills.gear + resources.skills.face + resources.skills.crack + resources.skills.slab;
				resources.any_skill_in_hand = resources.any_asset_in_hand - resources.skills.gear;

	        	resources.techniques = gameui.gamedatas.resource_tracker['techniques'];

	        	resources.asset_board = gameui.gamedatas.resource_tracker['asset_board']['skills'];

	        	return JSON.parse(JSON.stringify(resources)); // deep copy so as not to affect gameui.gamedatas.resource_tracker
	        },

	        updatePlayerResources: function (player_id, updated_resources) {

	        	const player_names_and_colors = gameui.gamedatas.player_names_and_colors;
	        	const character_num = player_names_and_colors[player_id].hasOwnProperty('character') ? player_names_and_colors[player_id]['character'] : 0;
	        	const character_name = character_num ? gameui.gamedatas.characters[character_num]['name'] : null;

	        	let max_water_psych;
	        	if (character_name === 'phil') { max_water_psych = 7; }
	        	else if (character_name) { max_water_psych = 6; }
	        	else { max_water_psych = 0; }

	            if (updated_resources['water'] > max_water_psych) { updated_resources['water'] = max_water_psych; }
	            if (updated_resources['psych'] > max_water_psych) { updated_resources['psych'] = max_water_psych; }

	            dojo.query(`#player_board_${player_id} .resource`).forEach((ele) => {

	                const resource = ele.id.substring(0, ele.id.indexOf('_num'));
	                if (updated_resources.hasOwnProperty('skills') 
	                	&& updated_resources['skills'].hasOwnProperty(resource) 
	                	&& ['gear', 'face', 'crack', 'slab'].includes(resource)) {

		                	const updated_resource = updated_resources['skills'][resource];
			                ele.innerHTML = updated_resource + updated_resources['permanent_skills'][resource];
			                gameui.gamedatas.resource_tracker['skills'][resource] = updated_resource;
		            }

		            else if (updated_resources.hasOwnProperty('techniques') 
		            	&& updated_resources['techniques'].hasOwnProperty(resource) 
		            	&& ['precision', 'balance', 'pain_tolerance', 'power', 'wild'].includes(resource)) {
			            	const updated_resource = updated_resources['techniques'][resource];
			                ele.innerHTML = updated_resource;
			                gameui.gamedatas.resource_tracker['techniques'][resource] = updated_resource;
		            }

		            if (updated_resources.hasOwnProperty('water') && resource === 'water') { ele.innerHTML = updated_resources['water']; }
	            	if (updated_resources.hasOwnProperty('psych') && resource === 'psych') { ele.innerHTML = updated_resources['psych']; }
	            });
	        },

	        getAssetType: function(/*string*/ asset_type_arg) {
                const skills = gameui.gamedatas.asset_cards[asset_type_arg]['skills'];
                let type = '';
                for (const [key, value] of Object.entries(skills)) {
                    if (value) { type = key; }
                }
                return type;
	        },

	        getAssetTechnique: function(/*string*/ asset_type_arg) {
	        	const techniques = gameui.gamedatas.asset_cards[asset_type_arg]['techniques'];
	        	let technique = '';
	        	if (Object.values(techniques).includes('wild')) { technique = 'wild'; }
	        	else {
	        		for (const [key, value] of Object.entries(techniques)) {
		        		if (value) { technique = key; }
		        	}
	        	}
	        	return technique;
	    	},

			getCurrentClimbingCard: function() {
				const climbing_card_ele = dojo.query('.drawn_climbing')[0];
                const climbing_card_id = climbing_card_ele ? climbing_card_ele.id.slice(-3).replace(/^\D+/g, '') : null;
                const climbing_card_type_arg = climbing_card_id ? gameui.gamedatas.climbing_card_identifier[climbing_card_id] : null;

				return climbing_card_type_arg;
			},

	        getCurrentPitch: function(player_id) {
	        	const meeple_parent = dojo.query(`#meeple_${player_id}`)[0].parentElement;
	        	if (meeple_parent.parentElement.id != `player_board_${player_id}`) { return meeple_parent.id.slice(-2).replace(/^\D+/g, ''); }
	        	else { return '0'; }
	        },

	        includesDeep: function(array, value) {
	        	return array.some(subArray => {
	        		return subArray.every(
	        			(subArrayElem, index) => subArrayElem === value[index]
	        		);
	        	});
	        },

	        getRope: function(/*strings*/ previous_pitch, current_pitch, board) {
	        	const path = [Number(previous_pitch), Number(current_pitch)];
	        	let rotation;
	        	let mini = false;

	        	if (previous_pitch === '0') { rotation = '210'; mini = true; }

	        	else {
	        		if (board == 'desert') {
		        		const LL_mini = [
		        							[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [16, 22], [17, 22], [18, 22], [19, 22], 
		        							[20, 22], [21, 22], [24, 22], [25, 22], [26, 22], [16, 23], [17, 23], [18, 23], [19, 23], [20, 23], 
		        							[21, 23], [25, 23], [26, 23], [16, 24], [17, 24], [18, 24], [19, 24], [20, 24], [21, 24], [22, 24], 
		        							[26, 24], [16, 25], [17, 25], [18, 25], [19, 25], [20, 25], [21, 25], [22, 25], [23, 25], [16, 26], 
		        							[17, 26], [18, 26], [19, 26], [20, 26], [21, 26], [22, 26], [23, 26], [24, 26]
		        						];
		        		const UR_mini = [
		        							[18, 16], [19, 16], [20, 16], [21, 16], [22, 16], [23, 16], [24, 16], [25, 16], [26, 16], [19, 17], [20, 17], 
		        							[21, 17], [22, 17], [23, 17], [24, 17], [25, 17], [26, 17], [16, 18], [20, 18], [21, 18], [22, 18], [23, 18], 
		        							[24, 18], [25, 18], [26, 18], [16, 19], [17, 19], [21, 19], [22, 19], [23, 19], [24, 19], [25, 19], [26, 19], 
		        							[16, 20], [17, 20], [18, 20], [22, 20], [23, 20], [24, 20], [25, 20], [26, 20], [16, 21], [17, 21], [18, 21], 
		        							[19, 21], [22, 21], [23, 21], [24, 21], [25, 21], [26, 21]
		        						];
		        		const LL = 		[
		        							[9, 1], [10, 2], [11, 3], [12, 4], [13, 5], [14, 6], [15, 7], [16, 9], [17, 10], [18, 11], [19, 12], [20, 13], 
		        							[21, 14], [27, 22], [28, 23], [29, 24], [30, 25], [31, 27], [32, 29]
		        				   		];
		        		const L = 		[
		        							[2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6], [8, 7], [10, 9], [11, 10], [12, 11], [13, 12], [14, 13],
		        							[15, 14], [17, 16], [18, 17], [19, 18], [20, 19], [21, 20], [23, 22], [24, 23], [25, 24], [26, 25],
		        							[28, 27], [29, 28], [30, 29]
		        						];
		        		const UL = 		[
		        							[2, 9], [3, 10], [4, 11], [5, 12], [6, 13], [7, 14], [8, 15], [10, 16], [11, 17], [12, 18], [13, 19], [14, 20],
		        							[15, 21], [23, 27], [24, 28], [25, 29], [26, 30], [28, 31], [30, 32]
		        						];
		        		const UR = 		[
		        							[1, 9], [2, 10], [3, 11], [4, 12], [5, 13], [6, 14], [7, 15], [9, 16], [10, 17], [11, 18], [12, 19], [13, 20],
		        							[14, 21], [22, 27], [23, 28], [24, 29], [25, 30], [27, 31], [29, 32]
		        						];
		        		const R  =      [
		        							[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], 
		        							[14, 15], [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [22, 23], [23, 24], [24, 25], [25, 26],
		        							[27, 28], [28, 29], [29, 30]
		        						];
		        		const LR = 		[
		        							[9, 2], [10, 3], [11, 4], [12, 5], [13, 6], [14, 7], [15, 8], [16, 10], [17, 11], [18, 12], [19, 13], [20, 14],
		        							[21, 15], [27, 23], [28, 24], [29, 25], [30, 26], [31, 28], [32, 30]
		        						];

		        		switch (true) {
		        			case this.includesDeep(LL, path):
		        				rotation = '30';
		        				break;
		        			case this.includesDeep(LL_mini, path):
		        				rotation = '30';
		        				mini = true;
		        				break;
		        			case this.includesDeep(L, path):
		        				rotation = '90';
		        				break;
		        			case this.includesDeep(UL, path):
		        				rotation = '150';
		        				break;
		        			case this.includesDeep(UR, path):
		        				rotation = '210';
		        				break;
		        			case this.includesDeep(UR_mini, path):
		        				rotation = '210';
		        				mini = true;
		        				break;
		        			case this.includesDeep(R, path):
		        				rotation = '270';
		        				break;
		        			case this.includesDeep(LR, path):
		        				rotation = '330';
		        				break;
		        		}
		        	}
	        	}
	        	return({rotation: rotation, mini: mini});
	    	},

	        updateTitlebar: function(message) {

				$('page-title').querySelectorAll('.name_span').forEach(ele => { ele.remove(); });
				const you_regex = /You/g;
				const you_to_replace = message.match(you_regex);
				let you_span;
				if (you_to_replace) {
					const player_id = gameui.player_id;
					const names_and_colors = gameui.gamedatas.player_names_and_colors;
					const player_color = names_and_colors[player_id]['color'];
					you_span = document.createElement('span');
					you_span.innerHTML = _('You');
					you_span.style.color = player_color;
					message = message.replace(you_to_replace, '');
					$('gameaction_status').innerHTML = '';
					$('gameaction_status').append(you_span);
					$('gameaction_status').innerHTML += _(message);
					$('pagemaintitletext').innerHTML = '';
					$('pagemaintitletext').append(you_span);
					$('pagemaintitletext').innerHTML += _(message);
				}
				else {
					$('gameaction_status').innerHTML = _(message);
					$('pagemaintitletext').innerHTML = _(message);
				}
				this.resizeTitlebar();
	        },

			updateTitlebarAddon: function(message, type) {

				switch (type) {
					case 'round':
						const round_tracker = $('round_tracker');
						round_tracker.innerHTML = _('Round: ') + message;
						break;

					case 'phase':
						const phase_tracker = $('phase_tracker');
						phase_tracker.innerHTML = dojo.string.substitute(_("Phase: ${message}"), { message : message });
						break;
				}
			},

			toggleTitlebarAddon: function(evt) {

				const addon = $('titlebar_addon');
				const addon_toggle = $('addon_toggle');
				const page_title = $('page-title');
				const climbing_slot = $('climbing_slot');
				const crimper_display = $('crimper_display');
				const toggles_wrap = $('toggles_wrap');

				if (addon_toggle.classList.contains('addon_on')) { // turn off
					addon.style.display = 'none';
					addon_toggle.classList.remove('addon_on');
					addon_toggle.classList.add('addon_off');
					addon_toggle.innerHTML = _('Show<br>Extension');
					page_title.append(climbing_slot);
					if (crimper_display) { page_title.append(crimper_display); }
					page_title.style.marginBottom = '0';
					toggles_wrap.querySelectorAll('.toggle').forEach(ele => {
						if (ele.id != 'addon_toggle') { ele.style.display = 'none'; }
					});
					this.deleteExtraneousStats();
					if (gameui.gamedatas.gamestate.name === 'gameEnd') {
						$('climbing_dimmer').classList.remove('dim_bg');
					}
					
				}
				else if (addon_toggle.classList.contains('addon_off')) { // turn on
					addon.style.display = '';
					addon_toggle.classList.remove('addon_off');
					addon_toggle.classList.add('addon_on');
					addon_toggle.innerHTML = _('Hide<br>Extension');
					addon.append(climbing_slot);
					if (crimper_display) { addon.append(crimper_display); }
					page_title.style.marginBottom = '';
					toggles_wrap.querySelectorAll('.toggle').forEach(ele => {
						if (ele.id != 'addon_toggle') { ele.style.display = ''; }
					});
					if (gameui.gamedatas.gamestate.name === 'gameEnd' && $('scorecard_toggle').classList.contains('addon_on')) {
						$('climbing_dimmer').classList.add('dim_bg');
					}
				}
			},

			togglePersonalObjectives: function(evt) {

				const toggle_button = $('personal_objectives_toggle');
				const personal_objectives_box = $('personal_objectives_box');
				const opponent_objectives_toggle = $('opponent_objectives_toggle');
				const shared_objectives_toggle = $('shared_objectives_toggle');
				const scorecard_toggle = $('scorecard_toggle');

				if (toggle_button.classList.contains('addon_on')) { // turn off
					personal_objectives_box.style.display = '';
					toggle_button.classList.remove('addon_on');
					toggle_button.classList.add('addon_off');
					toggle_button.innerHTML = _('Show Personal<br>Objectives');
					this.deleteExtraneousStats();
				}
				else if (toggle_button.classList.contains('addon_off')) { // turn on
					personal_objectives_box.style.display = 'inline-block';
					toggle_button.classList.remove('addon_off');
					toggle_button.classList.add('addon_on');
					toggle_button.innerHTML = _('Hide Personal<br>Objectives');

					if (opponent_objectives_toggle && opponent_objectives_toggle.classList.contains('addon_on')) {
						opponent_objectives_toggle.click();
					}
					if (shared_objectives_toggle && shared_objectives_toggle.classList.contains('addon_on')) {
						shared_objectives_toggle.click();
					}
					if (scorecard_toggle && scorecard_toggle.classList.contains('addon_on')) {
						scorecard_toggle.click();
					}
				}
			},

			toggleSharedObjectives: function(evt) {

				const toggle_button = $('shared_objectives_toggle');
				const shared_objective_trackers = document.querySelectorAll('.shared_objective_tracker');
				const personal_objectives_toggle = $('personal_objectives_toggle');
				const opponent_objectives_toggle = $('opponent_objectives_toggle');
				const scorecard_toggle = $('scorecard_toggle');

				if (toggle_button.classList.contains('addon_on')) { // turn off
					shared_objective_trackers.forEach(ele => { ele.style.display = ''; });
					toggle_button.classList.remove('addon_on');
					toggle_button.classList.add('addon_off');
					toggle_button.innerHTML = _('Show Shared<br>Objective Trackers');
					this.deleteExtraneousStats();	
				}
				else if (toggle_button.classList.contains('addon_off')) { // turn on
					shared_objective_trackers.forEach(ele => { ele.style.display = 'flex'; });
					toggle_button.classList.remove('addon_off');
					toggle_button.classList.add('addon_on');
					toggle_button.innerHTML = _('Hide Shared<br>Objective Trackers');
					
					if (personal_objectives_toggle && personal_objectives_toggle.classList.contains('addon_on')) {
						personal_objectives_toggle.click();
					}
					if (opponent_objectives_toggle && opponent_objectives_toggle.classList.contains('addon_on')) {
						opponent_objectives_toggle.click();
					}
					if (scorecard_toggle && scorecard_toggle.classList.contains('addon_on')) {
						scorecard_toggle.click();
					}
				}
			},

			toggleScorecard: function(evt) {

				const toggle_button = $('scorecard_toggle');
				const scorecard = $('scorecard');
				const opponent_objectives_toggle = $('opponent_objectives_toggle');
				const shared_objectives_toggle = $('shared_objectives_toggle');
				const personal_objectives_toggle = $('personal_objectives_toggle');
				
				if (toggle_button.classList.contains('addon_on')) { // turn off
					scorecard.style.display = 'none';
					toggle_button.classList.remove('addon_on');
					toggle_button.classList.add('addon_off');
					toggle_button.innerHTML = _('Show<br>Scorecard');
					this.deleteExtraneousStats();
					if (gameui.gamedatas.gamestate.name === 'gameEnd') {
						$('climbing_dimmer').classList.remove('dim_bg');
					}
				}
				else if (toggle_button.classList.contains('addon_off')) { // turn on
					scorecard.style.display = '';
					toggle_button.classList.remove('addon_off');
					toggle_button.classList.add('addon_on');
					toggle_button.innerHTML = _('Hide<br>Scorecard');

					if (opponent_objectives_toggle && opponent_objectives_toggle.classList.contains('addon_on')) {
						opponent_objectives_toggle.click();
					}
					if (shared_objectives_toggle && shared_objectives_toggle.classList.contains('addon_on')) {
						shared_objectives_toggle.click();
					}
					if (personal_objectives_toggle && personal_objectives_toggle.classList.contains('addon_on')) {
						personal_objectives_toggle.click();
					}
					if (gameui.gamedatas.gamestate.name === 'gameEnd') {
						$('climbing_dimmer').classList.add('dim_bg');
					}
				}
			},

			toggleOpponentObjectives: function(evt) {

				const toggle_button = $('opponent_objectives_toggle');
				const opponent_objectives = $('opponent_objectives_box');
				const shared_objectives_toggle = $('shared_objectives_toggle');
				const scorecard_toggle = $('scorecard_toggle');
				const personal_objectives_toggle = $('personal_objectives_toggle');

				if (toggle_button.classList.contains('addon_on')) { // turn off
					opponent_objectives.style.display = 'none';
					toggle_button.classList.remove('addon_on');
					toggle_button.classList.add('addon_off');
					toggle_button.innerHTML = _('Show Opponent<br>Objectives');
					this.deleteExtraneousStats();
				}
				else if (toggle_button.classList.contains('addon_off')) { // turn on
					opponent_objectives.style.display = '';
					toggle_button.classList.remove('addon_off');
					toggle_button.classList.add('addon_on');
					toggle_button.innerHTML = _('Hide Opponent<br>Objectives');

					if (scorecard_toggle && scorecard_toggle.classList.contains('addon_on')) {
						scorecard_toggle.click();
					}
					if (shared_objectives_toggle && shared_objectives_toggle.classList.contains('addon_on')) {
						shared_objectives_toggle.click();
					}
					if (personal_objectives_toggle && personal_objectives_toggle.classList.contains('addon_on')) {
						personal_objectives_toggle.click();
					}
				}
			},

			deleteExtraneousStats: function() {

				if ($('player_stats')) {
					$('player_stats').querySelectorAll('tr').forEach(row => {
						const columns = row.querySelectorAll('td');
						let uninitiated = true;
						for (let i=0; i<columns.length; i++) {
							if (columns[i].textContent.trim() !== '-') {
								uninitiated = false;
								break;
							}
						}
						if (uninitiated) { row.remove(); }
					});
				}
			},
	        
	        displayRequirements: function(resources, requirements, others=false, in_hand=false) {

	        	dojo.query('.requirement_wrap').forEach((ele) => { ele.remove(); });
	        	dojo.query('.requirement_wrap_cards').forEach((ele) => { ele.remove(); });

	        	let temp_resources = JSON.parse(JSON.stringify(resources)); // JSON method for deep copying an object included nested objects

				const gamestate = gameui.gamedatas.gamestate.name;
				const self = this;

	        	if (!others && requirements != []) {
	        		Object.keys(requirements).forEach(function(type) {

		                const num = requirements[type];
		                for (let i=1; i<=num; i++) {

		                    const requirement_wrap = document.createElement('div');
		                    const wrap_type = ['give_assets', 'any_asset'].includes(type) ? 'requirement_wrap_cards' : 'requirement_wrap';
		                    requirement_wrap.classList.add(wrap_type, `${type}_wrap`);
		                    const requirement_border = document.createElement('div');
		                    const requirement = document.createElement('div');

		                    if (['gear', 'face', 'crack', 'slab', 'any_skill'].includes(type)) { requirement.classList.add('skills_and_techniques'); }
		                    else if (['water', 'psych'].includes(type)) { requirement.classList.add('water_psych'); }
		                    else if (['give_assets', 'any_asset'].includes(type)) { requirement.classList.add('give_assets'); }

		                    const non_skills = ['water', 'psych', 'any_skill', 'any_asset'];
		                    let type_availability = (non_skills.includes(type)) ? temp_resources[type] : temp_resources['skills'][type];
							if (gamestate === 'climbOrRest' && !non_skills.includes(type)) {
								type_availability += temp_resources['permanent_skills'][type];
							}
							if ((type === 'any_skill' || type === 'any_asset') && !in_hand && gamestate === 'climbOrRest') {
								type_availability += Object.values(temp_resources['permanent_skills']).reduce((acc, num) => {
									return acc += num;
								}, 0);
								if (type === 'any_skill') { type_availability -= temp_resources['permanent_skills']['gear']; }
							}

							if (type === 'any_asset' && in_hand) { type_availability = Number($(`hand_num_${gameui.player_id}`).innerHTML); }
		                    if (type === 'give_assets') { type_availability = temp_resources['any_asset']; }
							if (type === 'gear' && in_hand === 'gear' && gamestate === 'climbOrRest') {
								type_availability -= temp_resources['permanent_skills']['gear'];
							}

		                    if (1 <= type_availability) {
								
		                    	if (non_skills.includes(type)) { temp_resources[type]--; }
		                    	else {
		                    		if (gamestate === 'climbOrRest' && temp_resources['permanent_skills'][type] > 0) {
		                    			temp_resources['permanent_skills'][type]--;
		                    		}
		                    		else { temp_resources['skills'][type]--; }
		                    		if (type != 'gear') { temp_resources['any_skill']--; }
		                    		temp_resources['any_asset']--;
		                    	}

		                    } else {

		                        if (type === 'gear') { requirement_border.classList.add('gear_border'); }
		                        else if (['face', 'crack', 'slab', 'any_skill'].includes(type)) { requirement_border.classList.add('skill_border'); }
		                        else if (['water', 'psych'].includes(type)) { requirement_border.classList.add('water_psych_border'); }
		                        else if (type === 'give_assets' || type === 'any_asset') { requirement_border.classList.add('give_assets_border'); }
		                    }

		                    switch (type) {
		                        case 'psych': requirement.style.backgroundPosition = '-300% -0%'; break;
		                        case 'water': // fallthrough
		                        case 'any_skill': requirement.style.backgroundPosition = '-400% -0%'; break;
		                        case 'crack': requirement.style.backgroundPosition = '-500% -0%'; break;
		                        case 'face': requirement.style.backgroundPosition = '-600% -0%'; break;
		                        case 'slab': requirement.style.backgroundPosition = '-700% -0%'; break;
		                        case 'gear': requirement.style.backgroundPosition = '-800% -0%'; break;
		                    }
		                    if (requirement_border.classList.length === 1) {
		                        requirement_border.classList.add('requirement_border');
		                        requirement_wrap.append(requirement_border);
		                    }
		                    requirement_wrap.append(requirement);
		                    
		                    const last_ele = $('generalactions').lastElementChild;
		                    last_ele.insertAdjacentElement('afterend', requirement_wrap);
		                }
		            });

					// if (
					// 	   gameui.character_id === '3' // The Dirtbag
					//  	&& resources['skills']['gear'] > requirements['gear']
					//  	&& dojo.query('.requirement_border.skill_border').length > 0
					// ) {
					// 	dojo.query('.requirement_border.skill_border')[0].remove();
					// }

					// if (
					// 	   gameui.character_id === '5' // The Overstoker
					// 	&& resources['psych'] > requirements['psych']
					// 	&& dojo.query('.requirement_border').length > 0
					// ) {
					// 	dojo.query('.requirement_border')[0].remove();
					// }

					// if (gameui.character_id === '9' && document.querySelector('.selected_pitch')) { // Crag Mama
					// 		const selected_pitch = document.querySelector('.selected_pitch').nextElementSibling;
					// 		const hex_num = selected_pitch.id.slice(-2).replace(/^\D+/g, '');
					// 		const cutoff = this.board === 'desert' ? 21 : 27;

					// 		if (hex_num <= cutoff && document.querySelector('.requirement_border')) {
					// 			const requirement_borders = document.querySelectorAll('.requirement_border');
					// 			for (let i=0; i<requirement_borders.length; i++) {
					// 				const ele = requirement_borders[i];
					// 				const type = ele.parentElement.classList[1].slice(0, -5);
					// 				if (['face', 'crack', 'slab', 'any_skill'].includes(type)) {
					// 					ele.remove();
					// 					break;
					// 				}
					// 			}
					// 		}
					// }

					// if (gameui.character_id === '11' && document.querySelectorAll('.requirement_border').length > 0) { // Bionic Woman
					// 	const face = resources['skills']['face'] + resources['permanent_skills']['face'] - requirements['face'];
					// 	const crack = resources['skills']['crack'] + resources['permanent_skills']['crack'] - requirements['crack'];
					// 	const slab = resources['skills']['slab'] + resources['permanent_skills']['slab'] - requirements['slab'];
					// 	const total = face + crack + slab - requirements['any_skill'];

					// 	if (total >= 0 && [face, crack, slab].some(num => num < 0)) {
					// 		const requirement_borders = document.querySelectorAll('.requirement_border');
					// 		for (let i=0; i<requirement_borders.length; i++) {
					// 			const ele = requirement_borders[i];
					// 			const type = ele.parentElement.classList[1].slice(0, -5);
					// 			if (['face', 'crack', 'slab'].includes(type)) {
					// 				ele.remove();
					// 				break;
					// 			}
					// 		}
					// 	}
					// }

					// if (gameui.character_id === '12' && document.querySelector('.selected_pitch')) { // Buff Boulderer
					// 	const selected_pitch = document.querySelector('.selected_pitch').nextElementSibling;
					// 	const pitch_num = selected_pitch.classList[1].slice(1);
					// 	const value = gameui.gamedatas.pitches[pitch_num]['value'];

					// 	if (value === 4) {
					// 		document.querySelector('.requirement_border').remove();
					// 	}
					// 	else if (value === 5) {
					// 		const borders = document.querySelectorAll('.requirement_border');
					// 		borders[0].remove();
					// 		border[1].remove();
					// 	}
					// }
	        	}
	        },

			addRequirementBorder: function(evt) {

				const icon = evt.currentTarget;
				const type = icon.classList[1].slice(0, -5);
				const requirement_border = document.createElement('div');
				switch (type) {
					case 'gear': requirement_border.classList.add('gear_border', 'requirement_border', 'ignored'); break;
					case 'face': case 'crack': case 'slab': case 'any_skill': requirement_border.classList.add('skill_border', 'requirement_border', 'ignored'); break;
					case 'water': case 'psych': requirement_border.classList.add('water_psych_border', 'requirement_border', 'ignored'); break;
				}
				icon.prepend(requirement_border);

				document.querySelectorAll('.requirement_wrap').forEach(ele => {
					ele.classList.remove('selectable', 'cursor');
					ele.style.borderRadius = '';
				});
				document.querySelectorAll('.gear_token_border').forEach(ele => {
					ele.remove();
				});
				gameui.utils.clicksOn('hard_on');
				gameui.onConfirmPitch(evt);
			},

			checkForRequirementBorder: function(icon) {

				const type = icon.classList[1].slice(0, -5);
				const requirement_border = document.createElement('div');
				switch (type) {

					case 'gear':
						if (gameui.resources['gear'] < gameui.pitch_requirements['gear']) {
							requirement_border.classList.add('gear_border', 'requirement_border');
							icon.prepend(requirement_border);
						}
						break;
					case 'psych':
						if (gameui.resources['psych'] < gameui.pitch_requirements['psych']) {
							requirement_border.classList.add('water_psych_border', 'requirement_border');
							icon.prepend(requirement_border);
						}
						break;
					case 'any_skill':
						if (gameui.resources['any_skill'] < (
															  gameui.pitch_requirements['face'] +
															  gameui.pitch_requirements['crack'] +
															  gameui.pitch_requirements['slab'] +
															  gameui.pitch_requirements['any_skill']
						)) {
							requirement_border.classList.add('skill_border', 'requirement_border');
							icon.prepend(requirement_border);
						}
						break;
				}
			},

			updateSharedObjectivesDisplay: function(shared_objectives_tracker) {
				const player_names_and_colors = gameui.gamedatas.player_names_and_colors;
				for (const [type_arg, info] of Object.entries(shared_objectives_tracker)) {
					const objective_tracker_ele = document.querySelector(`.so_${type_arg} > .shared_objective_tracker`);
					objective_tracker_ele.innerHTML = ''; // removes existing children

					if (['1', '2', '5', '6', '7', '8', '9', '10', '11', '13', '14', '15', '16'].includes(type_arg)) {

						if (Object.values(info['players_met']).length > 0) { info['players_met'] = Object.values(info['players_met']); }
						players_met = info['players_met'].map(Number);

						for (const player_id in gameui.gamedatas.players) {
							const player = gameui.gamedatas.players[player_id];
							const name_span = gameui.format_block('jstpl_colored_name', {
								player_id : player_id,
								color : player.color,
								player_name : player.name,
							});
							const player_div = dojo.place(
								`<div id="shared_name_${player_id}_${type_arg}" class="shared_player_div">${name_span}:</div>`,
								objective_tracker_ele
							);
							let status_span = '';
							if (players_met.includes(Number(player_id))) {
								status_span += `<span id="shared_check_${player_id}_${type_arg}" class="o_met">\u2713</span>`;
							} else {
								status_span += `<span id="shared_x_${player_id}_${type_arg}" class="o_unmet">X</span>`;
							}
							player_div.insertAdjacentHTML('beforeend', status_span);
						}
					} else if (['3', '4', '12'].includes(type_arg)) {  
						for (const player_id in gameui.gamedatas.players) {
							const player = gameui.gamedatas.players[player_id];
							const name_span = gameui.format_block('jstpl_colored_name', {
								player_id : player_id,
								color : player.color,
								player_name : player.name,
							});
							const player_div = dojo.place(
								`<div id="shared_name_${player_id}_${type_arg}" class="shared_player_div">${name_span}:</div>`,
								objective_tracker_ele
							);
							let num = '0';
							if (info['player_counts'][player_id] > 0) { num = `${info['player_counts'][player_id]}`; }
							const num_span = dojo.place(
								`<span id="shared_num_${player_id}_${type_arg}" class="o_num">${num}</span>`,
								player_div
							);
						}
					}
					// center tracker to objective horizontally
					const objective_ele = objective_tracker_ele.parentElement;
					const objective_width = objective_ele.clientWidth;
					objective_tracker_ele.style.display = 'flex';
					const tracker_width = objective_tracker_ele.clientWidth;
					const tracker_left = (objective_width / 2) - (tracker_width / 2);
					objective_tracker_ele.style.display = '';
					objective_tracker_ele.style.left = `${tracker_left}px`;

					this.sharedObjectiveTooltip(type_arg);
				}
			},

	        notif_confirmRequirements: async function (notif) {
	        	return new Promise(async (resolve) => {

		            gameui.selected_pitch = dojo.query(`.p${notif.args.selected_pitch}`)[0];
		            const player_id = notif.args.player_id;
		            const player = gameui.gamedatas.players[player_id];
		            const character_id = player.character;
		            const destination_pitch_id = gameui.selected_pitch.id.slice(-2).replace(/^\D+/g, '');
					const destination_pitch_type_arg = notif.args.selected_pitch;
		            gameui.gamedatas.pitch_tracker[player_id].push(destination_pitch_id);
		            const pitch_tracker = gameui.gamedatas.pitch_tracker[player_id];
		            const rope_overlaps = gameui.gamedatas.rope_overlaps[player_id];
		            const current_pitch_id = pitch_tracker[pitch_tracker.length-2];
					const pitch_rope_order = notif.args.pitch_rope_order;
					const current_climber_order = pitch_rope_order.indexOf(player_id) + 1;
					const final_round = pitch_tracker.length === 9 ? true : false;

					// final round message
					if (final_round) {
						const final_round_msg = document.createElement('div');
						final_round_msg.id = 'final_round_msg';
						final_round_msg.innerHTML = _('Final Round');
						const titlebar_addon = $('titlebar_addon');
						const climbing_slot = $('climbing_slot');
						titlebar_addon.insertBefore(final_round_msg, climbing_slot);
					}

					// update shared objectives tracker
					this.updateSharedObjectivesDisplay(notif.args.shared_objectives_tracker);

					// update personal_objectives_tracker
					if (gameui.isCurrentPlayerActive()) {
						this.updatePersonalObjectivesTracker(destination_pitch_type_arg);
					}

		            const animateRopeAndMeepleAndCubes = async () => {
		                return new Promise(async (resolve) =>{

		                    const rope_num = pitch_tracker.length-1;
		                    const current_pitch_ele = current_pitch_id > 0 ? $(`pitch_${current_pitch_id}`) : null;
		                    const destination_pitch_ele = $(`pitch_${destination_pitch_id}`);
		                    const rope_destination = $(`pitch_${destination_pitch_id}_rope`);
		                    const rope_color = gameui.gamedatas.characters[character_id]['rx_y']['board'];
		                    const meeple = $(`meeple_${player_id}`);
		                    const meeple_origin = meeple.parentElement;
		                    const character_name = gameui.gamedatas.characters[character_id]['name'];

		                    const rope_info = this.getRope(current_pitch_id, destination_pitch_id, gameui.gamedatas.board);
		                    const extra_class = rope_info['mini'] ? 'mini_rope' : '';

		                    const rope_block = gameui.format_block('jstpl_rope', {
		                        player_id : player_id,
		                        rope_num : rope_num,
		                        extra_classes : extra_class,
		                        rX : rope_color[0],
		                        rY : rope_color[1],
		                    });

		                    // update water and psych cubes
		                    const water = notif.args.selected_summit_betas.includes('5') ? null : -notif.args.water_psych_requirements['water'];
		                    const psych = -notif.args.water_psych_requirements['psych'];

		                    // check for ledge teleportation
		                    let ledge = false;
		                    let ledge_loc = null;
		                    const cutoff_arr = gameui.board === 'desert' ? ['21', '22'] : ['27', '28'];
		                    const divider = gameui.board === 'desert' ? 21 : 27;
		                    if (this.ledgeTeleportCheck(current_pitch_id, destination_pitch_id, cutoff_arr)) {

		                    		ledge = true;
		                    		ledge_loc = Number(destination_pitch_id) <= divider ? 'lower' : 'upper';
		                	}
		                	const overflow_ledge = ledge ? `${ledge_loc}_ledge_overflow` : ''
		                	const direction = Number(destination_pitch_id) <= divider ? 'lower_ledge_refresh' : 'upper_ledge_refresh';

		                	// Adjust if overlapping another rope
	                    	let overlap = 0;

	                    	if (ledge) {

	                    		for (let player of Object.keys(gameui.gamedatas.players)) {
	                    			if (player != player_id) {

	                    				const opponent_pitch_tracker = gameui.gamedatas.pitch_tracker[player];
	                    				for (let i=0; i<opponent_pitch_tracker.length-1; i++) {

	                    					const opponent_destination = opponent_pitch_tracker[i];
	                    					const opponent_current = opponent_pitch_tracker[i-1] ? opponent_pitch_tracker[i-1]: 0;
	                    					if (opponent_destination === destination_pitch_id
	                    						&& this.ledgeTeleportCheck(opponent_current, opponent_destination, cutoff_arr)) {

	                    						overlap++;
	                    					}
	                    				}
	                    			}
	                    		}
	                    	}
	                    	else {

	                    		for (let player of Object.keys(gameui.gamedatas.players)) {
		                    		if (player != player_id) {

		                    			const opponent_pitch_tracker = gameui.gamedatas.pitch_tracker[player];
		                    			for (let i=0; i<opponent_pitch_tracker.length-1; i++) {

		                    				if ((opponent_pitch_tracker[i] === current_pitch_id
		                    					|| opponent_pitch_tracker[i] === destination_pitch_id)
		                    					&&
		                    					  (opponent_pitch_tracker[i+1] === current_pitch_id
		                    					|| opponent_pitch_tracker[i+1] === destination_pitch_id))
		                    					{
		                    						overlap++;
		                    					}
		                    			}
		                    		}
		                    	}
	                    	}
	                    	if (overlap) { gameui.gamedatas.rope_overlaps[player_id][destination_pitch_id] = overlap; }

	                    	// adjust meeple if overlapping at summit
	                    	const meeple_overlap = dojo.query(`#${destination_pitch_ele.id} .meeple`).length;

		                    if (this.shouldAnimate()) {

			                    await this.updateWaterPsych(player_id, water, psych);

		                    	const rotation = rope_info['rotation'];
		                    	const rope_origin = rope_num > 1 ? $(`pitch_${current_pitch_id}_rope`) : $(`${player_id}_rope_counter`);
		                    	let rope_anim = rope_num > 1 ? 'rope_pitch_to_pitch' : 'rope_counter_to_pitch';
		                    	const meeple_anim = rope_num > 1 ? 'meeple_pitch_to_pitch' : 'meeple_panel_to_pitch';

		                    	this.updateTitlebar(_('Placing Rope and Climber'));

		                    	// Rope
	                            const overflow_wrapper = dojo.place(
		                    		`<div id="overflow_wrapper_${destination_pitch_id}_${player_id}" class="overflow_${rotation} rope_overflow ${overflow_ledge}">
		                    			<div id="rope_wrapper_${player_id}_${rope_num}" class="rope_wrapper r${rotation}"></div>
		                    		</div>`, rope_destination);
		                    	if (rope_num === 1) {
		                    		overflow_wrapper.classList.remove(`overflow_${rotation}`);
		                    		overflow_wrapper.classList.add('overflow_counter');
		                    	}

		                    	const rope_wrapper = $(`rope_wrapper_${player_id}_${rope_num}`);
		                    	const rope_ele = dojo.place(rope_block, `rope_wrapper_${player_id}_${rope_num}`);
		                    	if (rope_overlaps.hasOwnProperty(current_pitch_id)) { overflow_wrapper.classList.add(`overflow_overlap_${overlap}_${rotation}`); }

		                    	if (!ledge) {

		                    		if (overlap) { rope_wrapper.classList.add(`over_${overlap}_${rotation}`, `over_${overlap}`); }

			                    	const overflow_rect = overflow_wrapper.getBoundingClientRect();
			                    	const overflow_top = overflow_rect.top;
			                    	const overflow_left = overflow_rect.left;

			                    	rope_origin.append(rope_wrapper);
			                    	const rope_origin_rect = rope_wrapper.getBoundingClientRect();
			                    	const rope_origin_top = rope_origin_rect.top;
			                    	const rope_origin_left = rope_origin_rect.left;

			                    	rope_destination.append(rope_wrapper);
			                    	const rope_destination_rect = rope_wrapper.getBoundingClientRect();
			                    	const rope_destination_top = rope_destination_rect.top;
			                    	const rope_destination_left = rope_destination_rect.left;
			                    	overflow_wrapper.append(rope_wrapper);

			                    	const rope_origin_top_diff = rope_origin_top - overflow_top;
			                    	const rope_origin_left_diff = rope_origin_left - overflow_left;
			                    	const rope_destination_top_diff = rope_destination_top - overflow_top;
			                    	const rope_destination_left_diff = rope_destination_left - overflow_left;

			                    	if (rope_num == 1) {

			                    		rope_wrapper.style.top = `${rope_origin_top_diff}px`;
			                    		rope_wrapper.style.left = `${rope_origin_left_diff}px`;
			                    		rope_wrapper.style.setProperty('--dtcounter', `${rope_origin_top_diff + 85}px`);
			                    		rope_wrapper.style.setProperty('--dlcounter', `${rope_origin_left_diff - 50}px`);
			                    	}

			                    	const differential = this.getRopeDifferentials(destination_pitch_id, rotation, overlap);

			                    	rope_wrapper.style.setProperty('--dt', `${rope_destination_top_diff + differential[0]}px`);
			                    	rope_wrapper.style.setProperty('--dl', `${rope_destination_left_diff + differential[1]}px`);
		                    	}
								rope_wrapper.classList.add(`climber_${current_climber_order}`);

		                    	// Meeple
		                    	const temp_meeple = dojo.place(`<div id="meeple_${player_id}" class="meeple"></div>`, destination_pitch_ele);
		                        const new_width = temp_meeple.getBoundingClientRect().width;
		                        const new_height = temp_meeple.getBoundingClientRect().height;
		                        temp_meeple.remove();
		                        meeple.style.setProperty('--dw', `${new_width}px`);
		                        meeple.style.setProperty('--dh', `${new_height}px`);

		                    	// const meeple_origin_style = window.getComputedStyle(meeple);
		                    	// const meeple_origin_top = Number(meeple_origin_style.getPropertyValue('top').slice(0, -2));
		                    	// const meeple_origin_left = Number(meeple_origin_style.getPropertyValue('left').slice(0, -2));
		                    	const meeple_origin_doc = meeple.getBoundingClientRect();
		                    	const meeple_origin_doc_top = meeple_origin_doc.top;
		                    	const meeple_origin_doc_left = meeple_origin_doc.left;

		                    	destination_pitch_ele.append(meeple);
		                    	if (meeple_overlap) { meeple.classList.add(`over_meeple_${meeple_overlap}`); }
		                    	const meeple_destination_style = window.getComputedStyle(meeple);
		                    	const meeple_destination_top = Number(meeple_destination_style.getPropertyValue('top').slice(0, -2));
		                    	const meeple_destination_left = Number(meeple_destination_style.getPropertyValue('left').slice(0, -2));
		                    	const meeple_destination_doc = meeple.getBoundingClientRect();
		                    	const meeple_destination_doc_top = meeple_destination_doc.top;
		                    	const meeple_destination_doc_left = meeple_destination_doc.left;

		                    	const meeple_top_diff = meeple_origin_doc_top - meeple_destination_doc_top;
		                    	const meeple_left_diff = meeple_origin_doc_left - meeple_destination_doc_left;

		                    	meeple.style.top = `${meeple_destination_top + meeple_top_diff}px`;
		                    	meeple.style.left = `${meeple_destination_left + meeple_left_diff}px`;
		                    	meeple.style.setProperty('--dt', `${meeple_destination_top}px`);
		                    	meeple.style.setProperty('--dl', `${meeple_destination_left}px`);

		                    	if (ledge) {

		                    		const ledge_rope_anim = destination_pitch_id <= 21 ? 'lower_ledge_destination' : 'upper_ledge_destination';

		                    		let args = [meeple, destination_pitch_ele];
		                    		// meeple.remove(); // TESTING
		                    		await this.animationPromise(meeple, 'meeple_pitch_to_pitch', 'anim', this.moveToNewParent(), false, true, ...args);
		                    		meeple.style.zIndex = '';
			                        meeple.style.top = '';
			                        meeple.style.left = '';
			                        if (overlap) {
										overflow_wrapper.classList.add(`over_${overlap}_${ledge_loc}`);
										overflow_wrapper.firstElementChild.classList.add(`over_${overlap}`);
									}

			                        // FOR TESTING
			                        // const overflow_clone = overflow_wrapper.cloneNode(true);
			                        // rope_destination.append(overflow_clone);
			                        // overflow_clone.firstElementChild.classList.add('upper_ledge_refresh');

		                    		await this.animationPromise(rope_wrapper, ledge_rope_anim, 'anim', null, false, false);
		                    		resolve();
		                    	}
		                    	else {

		                    		const rope_and_meeple_anim = [];

			                        let args = [rope_wrapper, rope_destination];
			                        rope_and_meeple_anim.push(this.animationPromise.bind(null, rope_wrapper, rope_anim, 'anim', this.moveToNewParent(), false, true, ...args));
			                        // overflow_wrapper.remove(); // TESTING

			                        args = [meeple, destination_pitch_ele];
			                        rope_and_meeple_anim.push(this.animationPromise.bind(null, meeple, meeple_anim, 'anim', this.moveToNewParent(), false, false, ...args));
			                        // meeple.remove(); // TESTING

			                        Promise.all(rope_and_meeple_anim.map(func => { return func(); }))
			                        .then(() => {
										rope_wrapper.parentElement.zIndex = '';
			                        	meeple.style.zIndex = '';
			                        	meeple.style.top = '';
			                        	meeple.style.left = '';
			                        	rope_wrapper.style.top = '';
			                        	rope_wrapper.style.left = '';
			                        	overflow_wrapper.remove();

			                        	if (rope_num == 1) {
			                        		meeple.addEventListener('mouseover', this.highlightRoute);
			                        		meeple.addEventListener('mouseout', this.unHighlightRoute);
			                        	}
			                            resolve();
			                        });

			                        // FOR TESTING
			                        // const rope_clone = rope_wrapper.cloneNode(true);
			                        // rope_destination.append(rope_clone);
			                        // rope_clone.classList.remove('rope_pitch_to_pitch');
			                        // rope_clone.style.top = '';
			                        // rope_clone.style.left = '';
			                        // const overflow_clone = overflow_wrapper.cloneNode(true);
			                        // rope_destination.append(overflow_clone);

			                        // const meeple_clone = meeple.cloneNode(true);
			                        // meeple_clone.classList.remove('meeple_panel_to_pitch');
			                        // destination_pitch_ele.append(meeple_clone);
		                    	}

		                    } else { // shouldn't animate

		                    	this.updateWaterPsych(player_id, water, psych);
		                    	const rotation = rope_info['rotation'];
		                    	let rope_wrapper = null;
		                    	if (ledge) {

		                    		const overflow_wrapper = dojo.place(
			                    		`<div id="overflow_wrapper_${destination_pitch_id}_${player_id}" class="overflow_${rotation} rope_overflow ${overflow_ledge}">
			                    			<div id="rope_wrapper_${player_id}_${rope_num}" class="rope_wrapper r${rotation} ${direction}"></div>
			                    		</div>`, rope_destination);
			                    	if (rope_num === 1) {
			                    		overflow_wrapper.classList.remove(`overflow_${rotation}`);
			                    		overflow_wrapper.classList.add('overflow_counter');
			                    	}
			                    	rope_wrapper = $(`rope_wrapper_${player_id}_${rope_num}`);

			                    	if (overlap) {
										overflow_wrapper.classList.add(`over_${overlap}_${ledge_loc}`);
										overflow_wrapper.firstElementChild.classList.add(`over_${overlap}`);
									}
		                    	}
		                    	else {

		                    		rope_wrapper = dojo.place(`<div id="rope_wrapper_${player_id}_${rope_num}" class="rope_wrapper r${rotation}"></div>`, $(`pitch_${destination_pitch_id}_rope`));

		                    		if (overlap) { rope_wrapper.classList.add(`over_${overlap}_${rotation}`, `over_${overlap}`); }
		                    	}
								rope_wrapper.classList.add(`climber_${current_climber_order}`);
		                    	
		                        const rope_ele = dojo.place(rope_block, rope_wrapper);
		                        destination_pitch_ele.append(meeple);
		                        if (rope_num == 1) {
			                        		meeple.addEventListener('mouseover', this.highlightRoute);
			                        		meeple.addEventListener('mouseout', this.unHighlightRoute);
			                        	}
		                        resolve();
		                    }
		                })
		            }
		            await animateRopeAndMeepleAndCubes();

					const current_pitch = dojo.attr(`pitch_${destination_pitch_id}`, 'class').slice(-2).replace(/^\D+/g, '');
					const skill_tokens = this.getSkillTokens(current_pitch);
					const rope_order = this.getRopeOrder(destination_pitch_id);
					this.pitchTooltip(`pitch_${destination_pitch_id}_click`, destination_pitch_type_arg, skill_tokens, rope_order);
		            const rope_num = gameui.gamedatas.pitch_tracker[player_id].length-1;
		            $(`rope_num_${player_id}`).innerHTML = `${8 - rope_num}`;

					// points tracker
					gameui.scoreCtrl[player_id].incValue(notif.args.new_points);

		            this.addTooltipsToLog();
		            resolve();
	        	});
	        },

			updatePersonalObjectivesTracker: function(destination_pitch_type_arg) {

				const personal_objectives_tracker = gameui.gamedatas.personal_objectives_tracker;
				for (let objective_id of Object.keys(personal_objectives_tracker)) {
					const objective = gameui.gamedatas.personal_objectives[objective_id];
					const pitch_ids = objective.pitch_ids;
					if (pitch_ids.includes(destination_pitch_type_arg)) {
						let idx = pitch_ids.indexOf(destination_pitch_type_arg);
						if (objective_id === '3') {
							switch(idx) {
								case 0: case 1: case 2:     idx = 0; break;
								case 3: case 4: case 5:     idx = 1; break;
								case 6: case 7:             idx = 2; break;
								case 8: case 9: case 10:    idx = 4; break;
								case 11: case 12: case 13:  idx = 5; break;
							}
						}
						if (!gameui.gamedatas.personal_objectives_tracker[objective_id].includes(idx)) {
							gameui.gamedatas.personal_objectives_tracker[objective_id].push(idx);
						}
						const check = document.createElement('div');
						check.classList.add('check');
						check.innerHTML = '\u2713';
						$(`personal_objective_${objective_id}`).append(check);
						const starting_top = gameui.gamedatas.personal_objectives[objective_id]['starting_check_top'];
						const check_top = starting_top + 5.75 * idx;
						check.style.top = `${check_top}%`;

						check.dataset.idx = idx;
						check.dataset.starting_top = starting_top;

						this.personalObjectiveTooltip($(`personal_objective_${objective_id}`), objective_id);
					}
				}
			},

	        ledgeTeleportCheck: function(current_pitch_id, destination_pitch_id, cutoff_arr) {

	        	if (gameui.ledge.includes(current_pitch_id)
                	&&  gameui.ledge.includes(destination_pitch_id)
                	&&  ( Math.abs(Number(destination_pitch_id) - Number(current_pitch_id)) > 1
                		&&  [current_pitch_id, destination_pitch_id].sort() != cutoff_arr) )  {
                		return true;		
            	}
            	else { return false; }
	        },

	        getRopeDifferentials: function(destination_pitch_id, rotation, overlap) { // returns [top, left] differentials

	        	if (gameui.gamedatas.board === 'desert') {

	        		if (   ['1', '2', '3', '4', '5', '6', '7', '8'].includes(destination_pitch_id)
	        			&& rotation === '210') {

	        				return [2, 0.4];
	        		}

	        		switch (rotation) {

		        		case ('150'): {
		        			if (destination_pitch_id === '15') { return [0, 0.2]; }
		        			else if (destination_pitch_id === '19') { return [0, 0.25]; }
		        			else if (destination_pitch_id === '21') { return [0, 0.1]; }
		        			else if (destination_pitch_id === '29') { return [-0.5, 0]; }
		        			else { return [0, -0.25]; }
		        		}
		        		case ('210'): {
		        			if (overlap) { return [0, 0]; }
		        			else if (destination_pitch_id === '15') { return [0, -0.2]; }
		        			else if (destination_pitch_id === '29') { return [0, -0.25]; }
		        			else if (destination_pitch_id === '32') { return [0, -0.25]; }
		        			else { return [0, 0.15]; }
		        		}
		        		case ('270'): {
		        			if (destination_pitch_id === '8') { return [0, 0]; }
		        			else { return [0, 0.25]; }
		        		}
		        	}


	        	}
	        	else if (gameui.gamedatas.board === 'forest') {


	        	}

	        	return [0, 0];
	        },

	        highlightRoute: function(event) {

	        	const meeple = event.target;
	        	const player_id = meeple.id.slice(-7);
	        	const color = gameui.gamedatas.player_names_and_colors[player_id]['color'];
	        	dojo.query('.rope').forEach(ele => {

	        		if (ele.id.slice(0, 7) === player_id) {
	        			ele.style.boxShadow = `0 0 5px 2px ${color}`;
	        			ele.style.zIndex = '50';
	        		}
	        		else { ele.style.opacity = 0.25; }
	        	});
	        },

	        unHighlightRoute: function(event) {

	        	const meeple = event.target;
	        	const player_id = meeple.id.slice(-7);
	        	dojo.query('.rope').forEach(ele => {

	        		if (ele.id.slice(0, 7) === player_id) {
	        			ele.style.boxShadow = '';
	        			ele.style.zIndex = '';
	        		}
	        		else { ele.style.opacity = ''; }
	        	});
	        },

	        retractClimbingCard: async function() {
	        	return new Promise(async (resolve) => {

					dojo.query('.choice').forEach(ele => { ele.style.pointerEvents = 'none'; });

	        		const climbing_card_ele = $('climbing_slot').firstElementChild;
	        		const destination = $('climbing_discard_straightened');
					const climbing_discard = document.getElementById('climbing_discard');
		        	const args = [climbing_card_ele, destination];
		        	$('climbing_slot').style.display = 'block';
		        	$('climbing_dimmer').classList.remove('dim_bg');
		        	dojo.query('.selected_choice').forEach((ele) => { ele.classList.remove('selected_choice'); });
					climbing_discard.style.zIndex = '202';

		        	if (this.shouldAnimate()) {

						const titlebar_backup = $('pagemaintitletext').cloneNode(true);
						dojo.query('#generalactions > .action-button').forEach(ele => { ele.style.display = 'none'; });
						this.updateTitlebar(_('Discarding Climbing Card'));

		        		const start_pos = climbing_card_ele.getBoundingClientRect();
		        		destination.append(climbing_card_ele);
		        		const end_pos = climbing_card_ele.getBoundingClientRect();
		        		const x_diff = Math.abs(end_pos.left - start_pos.left);
		        		const y_diff = -(end_pos.top - start_pos.top);

		        		dojo.setStyle(climbing_card_ele.id, {
		        			'top' : `${y_diff}px`,
		        			'left' : `${x_diff}px`,
		        			'width' : `${start_pos.width}px`,
		        			'height' : `${start_pos.height}px`
		        		});

		        		climbing_card_ele.style.setProperty('--dw', `${end_pos.width}px`);
		        		climbing_card_ele.style.setProperty('--dh', `${end_pos.height}px`);

		        		await this.animationPromise(climbing_card_ele, 'climbing_card_to_discard', 'anim', this.moveToNewParent(), false, true, ...args);
		        		dojo.setStyle(climbing_card_ele.id, {
		        			'top' : '',
		        			'left' : '',
		        			'width' : '',
		        			'height' : ''
		        		});
		
						$('pagemaintitletext').innerHTML = titlebar_backup.innerHTML;
						dojo.query('#generalactions > .action-button').forEach(ele => { ele.style.display = ''; });
		        	} else { destination.append(climbing_card_ele); }

					$('climbing_slot').style.display = '';
		        	resolve();
	        	})
	        },

	        // **** Climbing effects ****

			checkClimbingChoices: function(bomber=false) {

				gameui.choices_info = {
					a : {
						display_requirements : [],
						requirements_met : true,
						no_target_message : false,
						in_hand : false,
					},

					b : {
						display_requirements : [],
						requirements_met : true,
						no_target_message : false,
						in_hand : false,
					},
				};

				const choices = [dojo.query('.drawn_climbing .a')[0], dojo.query('.drawn_climbing .b')[0]];
				for (const choice of choices) {
					const option = choice.classList[1];
					const card_id = choice.parentElement.id.slice(-3).replace(/^\D+/g, '');
					const card_type = gameui.gamedatas.climbing_card_identifier[card_id];
					const choice_args = gameui.gamedatas.climbing_cards[card_type][`${option}_args`];
					const hand_size = dojo.query('#assets_wrap .asset').length;
					const requirements = {'water': choice_args.water, 'psych': choice_args.psych};
					const others = gameui.gamedatas.climbing_cards[card_type][`${option}_args`].hasOwnProperty('others') || false;
					const any_skill = gameui.gamedatas.climbing_cards[card_type][`${option}_args`]['discard_type'] === 'any_skill' ? true : false;
					const any_asset = gameui.gamedatas.climbing_cards[card_type][`${option}_args`]['discard_type'] === 'any_asset' ? true : false;
					const ignore_requirements = choice_args.ignore_requirements ? true : false;

					const gear_in_hand = choice_args.gear_in_hand ? true : false;
					const card_in_hand = choice_args.card_in_hand ? true : false;
					const played = !gear_in_hand && !card_in_hand ? true : false;
					const give_gear_card = choice_args.give_gear_card ? true : false;
					if (!give_gear_card) { requirements['give_assets'] = choice_args.give_assets; }
					const steal_asset = (choice_args.steal_asset || choice_args.benefit == 'stealAsset') ? true : false;
					let requirements_met = true;
					let no_target_message = false;

					if (gear_in_hand) { gameui.choices_info[option]['in_hand'] = 'gear'; }
					else if (card_in_hand) { gameui.choices_info[option]['in_hand'] = 'card'; }

					this.resources = this.getCurrentPlayerResources();

					if (played) {
						const board_skills = this.resources['asset_board'];
						for (const skill of ['gear', 'face', 'crack', 'slab']) {
							this.resources['skills'][skill] += board_skills[skill];
						}
						this.resources['any_asset'] += Object.values(board_skills).reduce((a, b) => a + b, 0);
						this.resources['any_skill'] = this.resources['any_asset'] - (this.resources['skills']['gear'] + this.resources['asset_board']['gear']);
					}

					if (!ignore_requirements) {
						let asset_requirements = null;
						if (gear_in_hand || give_gear_card) { asset_requirements = [['gear', -1]]; }
						else if (card_in_hand || any_asset) {
							if (card_type == 12) { asset_requirements = [['any_asset', -2]]; }
							else { asset_requirements = [['any_asset', -1]]; }

							if (card_in_hand && gameui.gamedatas.hand_count[gameui.player_id] === 0) { requirements_met = false; }
						}
						else { asset_requirements = Object.entries(choice_args.assets); }

						if (any_skill) { asset_requirements.push(['any_skill', -choice_args['discard_num']]); }

						for (const [type, value] of asset_requirements) { requirements[type] = value; }
						Object.keys(requirements).forEach(key => requirements[key] = (requirements[key] < 0) ? Math.abs(requirements[key]) : 0);

						gameui.choices_info[option]['display_requirements'].push(JSON.parse(JSON.stringify(this.resources)), requirements, others, !played);

						if (choice_args.water < 0 && this.resources['water'] < Math.abs(choice_args.water)) { requirements_met = false; }
						if (choice_args.psych < 0 && this.resources['psych'] < Math.abs(choice_args.psych)) { requirements_met = false; }

						if (played) {
							for (const [type, value] of asset_requirements) {
								if (type == 'any_asset' && this.resources['any_asset'] < Math.abs(value)) { requirements_met = false; }
								else if (type == 'any_skill' && this.resources['any_skill'] < Math.abs(value)) { requirements_met = false; }
								else if (value < 0 && this.resources['skills'][type] + this.resources['asset_board'][type] < Math.abs(value)) {
									requirements_met = false;
								}
							}
						} else {
							for (const [type, value] of asset_requirements) {
								if (type == 'any_asset' && this.resources['any_asset_in_hand'] < Math.abs(value)) { requirements_met = false; }
								else if (type == 'any_skill' && this.resources['any_skill_in_hand'] < Math.abs(value)) { requirements_met = false; }
								if (value < 0 && this.resources['skills'][type] < Math.abs(value)) {
									requirements_met = false;
								}
							}
						}
						if (choice_args.give_assets > 0 && hand_size < choice_args.give_assets) { requirements_met = false; }
					
					} else if (ignore_requirements) { gameui.choices_info[option]['display_requirements'].push(this.resources, []); }

					if (steal_asset) {
						let steal_requirement_met = false;
						no_target_message = true;

						dojo.query('.asset_board_slot > .asset').forEach(ele => {
							const player_id = ele.parentElement.parentElement.parentElement.id.slice(-7);

							if (player_id != gameui.player_id && !['3', '8', '14'].includes(card_type)) {
								steal_requirement_met = true;
								no_target_message = false;
							}
							else if (player_id != gameui.player_id && ['3', '8', '14'].includes(card_type)) {
								const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
								const asset_arg = gameui.gamedatas.asset_identifier[asset_id];
								const asset_type = this.getAssetType(asset_arg);
								if (asset_type == 'gear') {
									steal_requirement_met = true;
									no_target_message = false;
								}
							}
						});
						if (!requirements_met || !steal_requirement_met) { requirements_met = false; }
					}

					if (gameui.character_id === '2') {
						let no_legal_target = false;
						switch (card_type) {
							case '3':
								if (option === 'b') { no_legal_target = true; } break;
							case '8':
								if (option === 'a') { no_legal_target = true; } break;
							case '28':
								if (option === 'b') { gameui.free_solo_hecked = true; } break;
							case '30':
								if (option === 'a') { no_legal_target = true; } break;
							case '40':
								if (option === 'a') { no_legal_target = true; } break;
						}
						if (no_legal_target) {
							requirements_met = false;
							no_target_message = true;
						}
					}

					gameui.choices_info[option]['requirements_met'] = requirements_met;
					gameui.choices_info[option]['no_target_message'] = no_target_message;
				}

				// Jesus Piece
				const hand_summit_beta_tokens = gameui.gamedatas.hand_summit_beta_tokens;
				const jesus_piece = Object.values(hand_summit_beta_tokens).includes('10');

				if (!gameui.choices_info['a']['requirements_met'] && !gameui.choices_info['b']['requirements_met'] && !jesus_piece) {
					
					gameui.addActionButton('pass_button', _('Pass'), 'onPassClimbingCard', null, false, 'white');
					$('generalactions').lastElementChild.insertAdjacentHTML('afterend',
						`<span id="pass_message">
							<span id="pm_line1">You cannot choose</span>
							<span id="pm_line2">either option</span>
						</span>`
					);
				}
			},

	        parseClimbingEffect: async function(type, notif) { // type = 'cost' or 'benefit'
	        	return new Promise(async resolve => {
		        	const player_id = notif.args.player_id;
		        	let effect = '';
		        	if (type === 'autoPortaledge') { effect = 'autoPortaledge'; }
		        	else if (type === 'cost' && notif.args.cost) { effect = notif.args.cost; }
		        	else if (type === 'benefit' && notif.args.benefit) { effect = notif.args.benefit; }

		        	switch (effect) {
		        		case 'updateWaterPsych':
		        			const water = notif.args.water_psych_for_climbing['water'];
	            			const psych = notif.args.water_psych_for_climbing['psych'];

	            			if (notif.args.choice_args.hasOwnProperty('others')) {
	            				for (let player of Object.keys(gameui.gamedatas.players)) { 
	            					if (player != player_id) {
	            						let new_water = Number($(`water_num_${player}`).innerHTML) + water;
	            						let new_psych = Number($(`psych_num_${player}`).innerHTML) + psych;
	            						const max_water_psych = dojo.query(`#player_${player_id} .cube_wrap`).length / 2 - 1;
	            						if (new_water > max_water_psych) { new_water = max_water_psych; }
	            						if (new_psych > max_water_psych) { new_psych = max_water_psych; }

	            						await this.updateWaterPsych(player, water, psych);
	            						this.updatePlayerResources(player, {'water' : new_water, 'psych' : new_psych});
	            					}
	            				}
	            			} else if (notif.args.choice_args.hasOwnProperty('all')) {
	            				for (let player of Object.keys(gameui.gamedatas.players)) {
	            					let new_water = Number($(`water_num_${player}`).innerHTML) + water;
            						let new_psych = Number($(`psych_num_${player}`).innerHTML) + psych;
            						const max_water_psych = dojo.query(`#player_${player} .cube_wrap`).length / 2 - 1;
	            					if (new_water > max_water_psych) { new_water = max_water_psych; }
	            					if (new_psych > max_water_psych) { new_psych = max_water_psych; }

	            					await this.updateWaterPsych(player, water, psych);
	            					if (player == gameui.player_id) { this.updatePlayerResources(player, {'water' : new_water, 'psych' : new_psych}); }
	            				}
	            			}
		        			if (notif.args.choice_args.hasOwnProperty('others') || notif.args.choice_args.hasOwnProperty('all')) { 
		        				await (async function() { return new Promise(resolve => setTimeout(resolve, 600)) })();
					            resolve();
		        			} else {
		        				let new_water = Number($(`water_num_${player_id}`).innerHTML) + water;
	            				let new_psych = Number($(`psych_num_${player_id}`).innerHTML) + psych;
		        				await this.updateWaterPsych(player_id, water, psych);
		        				this.updatePlayerResources(player_id, {'water' : new_water, 'psych' : new_psych});
		        				resolve();
		        			}
		        			break;

		        		case 'autoPortaledge':
		        			const hand_count = notif.args.hand_count;
		        			const last_card = notif.args.last_card;
		        			const refill_portaledge = notif.args.refill_portaledge;
							const player_resources = notif.args.player_resources;

		        			if (player_id == gameui.player_id) {
		        				const type_arg = notif.args.portaledge_type_arg;
				                const id = notif.args.portaledge_draw.id;
				                const hand_count = notif.args.hand_count
				                await this.portaledge(player_id, [type_arg], [id], true, hand_count, null, false, 0, 0, last_card, refill_portaledge, player_resources);
			        			resolve();
			        			break;
		        			} else {
		        				const portaledge_type = notif.args.portaledge_type;
		        				const hand_count = notif.args.hand_count;
			        			await this.portaledgeOpponent(player_id, {[portaledge_type]: 1}, true, hand_count, null, false, 0, 0, last_card, refill_portaledge);
			        			resolve();
			        			break;
		        			}
		        		default :
		        			resolve();
		        			break;
		        	}
		        })
	        },

	        updateWaterPsych: async function(player_id, water=0, psych=0) {
	        	return new Promise(async resolve => {
					this.clicksOff();

		        	let cube = null;
		        	const self = this;

		        	const update = async function(water_or_psych) {
		        		return new Promise(async (resolve) => {

							const msg_translated = dojo.string.substitute(_("Adjusting ${water_or_psych}"), {
								water_or_psych: water_or_psych,
							});
		        			self.updateTitlebar(msg_translated);
			        		const num = water_or_psych == 'water' ? water : psych;
			        		const abbreviation = water_or_psych == 'water' ? 'w' : 'p';
			        		const cube = dojo.query(`#player_${player_id} .cb_${water_or_psych}`)[0];
			        		const current_loc = Number(cube.parentElement.id.at(-1));
			        		let new_num = current_loc + Number(num); // portaledge_to_draw during resting provides water and psych as strings
							if (new_num < 0) { new_num = 0; }
			        		const max_num = dojo.query(`#player_${player_id} .cube_wrap`).length / 2 - 1;
			        		const new_loc = new_num <= max_num ? new_num : max_num;
			        		const destination = dojo.query(`#player_${player_id} .cb_${abbreviation}_${new_loc}`)[0];
			        		if (destination && self.shouldAnimate()) {
			        			const args = [cube, destination];
			        			await self.animationPromise(cube, 'water_psych_cubes', 'anim', self.moveToNewParent(), false, true, ...args);
			        		} else if (destination) { destination.append(cube); }
			        		$(`${water_or_psych}_num_${player_id}`).innerHTML = new_loc;

			        		gameui.gamedatas.water_psych_tracker[player_id][water_or_psych] = new_loc;
			        		if (player_id == gameui.player_id) { gameui.gamedatas.resource_tracker[water_or_psych] = new_loc; }
			        		resolve();
		        		});
		        	}

		        	if (water < 0) { await update('water'); }
		        	if (psych < 0) { await update('psych'); }
		        	if (water > 0) { await update('water'); }
		        	if (psych > 0) { await update('psych'); }

					this.clicksOn();
		            resolve();
		        })
	        },

	        portaledge: async function(player_id, type_args, ids, auto=false, hand_count, climbing_card_info=null, share=false, water=0, psych=0, last_card, refill_portaledge, player_resources=null) {
	        	return new Promise(async resolve => {

					this.clicksOff();

	        		const rest = gameui.gamedatas.gamestate.name === 'resting' ? true : false;
	        		const refill = refill_portaledge.length != [] ? true : false;

	        		const asset_cards_arr = ids.map((ele, index) => {
	        			return [ele, type_args[index]];
	        		});
	        		const new_card_slots = this.resizeHand('asset', ids);
	        		let cards= [];
	        		let cards_for_hand = [];
	        		let card_asset_types = [];
	        		let card_technique_types = [];
	        		let asset_portaledge_to_display = [];
	        		const portaledge = $('portaledge');

	        		let i = ids.length;
	        		for (const card_arr of asset_cards_arr) {
	        			const id = card_arr[0];
	        			const type_arg = card_arr[1];
	        			const asset = gameui.gamedatas.asset_cards[type_arg];
	        			const type = this.getAssetType(type_arg);
	        			card_asset_types.push(type);
	        			gameui.gamedatas.hand_assets[id] = type_arg;
	        			for (const [type, num] of Object.entries(asset.techniques)) {
	        				if (num > 0) { card_technique_types.push(type); }
	        			}
	        			const slot_num = new_card_slots[id];
	        			const hand_slot = $(`hand_asset_${slot_num}`);
	        			const card = gameui.format_block('jstpl_asset_card', {
	        											CARD_ID : id,
	        											EXTRA_CLASSES : '',
	        											acX : asset.x_y[0],
	        											acY : asset.x_y[1],
	        									});
	        			cards_for_hand.push([card, hand_slot]);
	        			const display_slot = $(`deck_draw_${i}`);
	        			i--;
	       
	        			const flip_arr = [gameui.format_block('jstpl_flip_card', {
	        				card_id : id,
	        				extra_classes : '',
	        				back_type : 'asset asset_back_for_flip',
	        				front_type : 'asset',
	        				cX : asset.x_y[0],
	        				cY : asset.x_y[1],
	        			}), $(`porta${type}`)];

	        			cards.push([card, display_slot, hand_slot, flip_arr]);
	        		}

	        		if (this.shouldAnimate()) {

	        			await this.updateWaterPsych(player_id, water, psych);

	        			if (ids.length > 0) {

	        				this.updateTitlebar(_('Drawing from Portaledge'));
		        			if (auto) {
		        				portaledge.style.display = 'block';
			                    await this.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
			                    portaledge.style.marginTop = 0;
			                    await (async function() { return new Promise(resolve => setTimeout(resolve, 300)) })();
		        			}

		                    let asset_display_to_hand = [];
		                    $('asset_deck_draw').style.display = 'flex';
		                    dojo.query('.portaledge > .cursor').forEach(ele => { ele.remove(); });
		                    dojo.query('.portaledge > .draw_num').forEach(ele => { ele.remove(); });

							$('asset_deck_draw').style.zIndex = '299';
		                    await (async () => {
		                    	return new Promise(async (resolve) => {

		                    		this.updateTitlebar(_('Drawing Asset(s) from The Portaledge'));
									gameui.removeActionButtons();

		                    		let card_idx = 1;
		                    		for (const [card, display_slot, hand_slot, flip_arr] of cards) {

		                    			const deck_ele = flip_arr[1];
		                    			const deck = deck_ele.id;
		                    			const type = deck.slice(5);

		                    			// Animating Card

		                    			const flip_card = dojo.place(flip_arr[0], flip_arr[1]);
		                    			args = [flip_card, display_slot];
		                    			this.animationPromise(flip_card.firstElementChild, 'flip_transform', 'anim', null, false, true);
		                    			this.animationPromise(flip_card, 'asset_portaledge_to_display', 'anim', this.moveToNewParent(), false, true, ...args);

		                    			if (last_card[type] === card_idx) {
		                    				dojo.query('.flip_card').forEach(ele => { ele.style.visibility = 'visible'; });
		                    				flip_card.parentElement.style.visibility = 'hidden';
		                    			}

		                    			await (async function() { return new Promise(resolve => setTimeout(resolve, 200)) })();

										// Refill Portaledge deck

		                    			if (refill && refill_portaledge[deck] && refill_portaledge[deck][1] === card_idx) {
		                    				const deck_ele = flip_arr[1];
		                    				await this.refillPortaledge(deck_ele, refill_portaledge);
		                    				this.updateTitlebar(_('Drawing Asset/s from The Portaledge'));
		                    			}

		                    			if (card_idx === cards.length) {
		                    				await (async function() { return new Promise(resolve => setTimeout(resolve, 800)) })();
											this.clicksOn();
		                    				resolve();
		                    			}
		                    			
		                    			card_idx ++;
		                    		}
		                    	});
		                    })();

		                    dojo.query('#asset_deck_draw .flip_card').forEach(ele => { ele.remove(); })
		                    for (const [card, display_slot, hand_slot, flip_arr] of cards) {

		                    	const card_ele = dojo.place(card, display_slot);
	                			args = [card_ele, hand_slot];
	                			asset_display_to_hand.push(this.animationPromise.bind(null, card_ele, 'asset_display_to_hand', 'anim', this.moveToNewParent(), false, true, ...args));
		                    }

		                    if (share) { await (async function() { return new Promise(resolve => setTimeout(resolve, 500)) })(); }
		                    await this.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
	                		portaledge.style.marginTop = '-36.4061%';
		                	portaledge.style.display = '';

		                	await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();

		                	Promise.all(asset_display_to_hand.map((func) => { return func(); }))
		                    .then(() => {
								$('asset_deck_draw').style.zIndex = '';
								$('asset_deck_draw').style.display = '';

								this.updatePlayerResources(player_id, player_resources);
								this.handCount(player_id, hand_count);
								this.clicksOn();
								resolve();
		                    });
	        			
	        			} else {

		                    await this.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
		                    dojo.query('.portaledge > .cursor').forEach(ele => { ele.remove(); });
		                    dojo.query('.portaledge > .draw_num').forEach(ele => { ele.remove(); });
	                		portaledge.style.marginTop = '-36.4061%';
		                	portaledge.style.display = '';
							this.clicksOn();
	        				resolve();
	        			}

	                } else { // shouldn't animate

	                	cards_for_hand.map(card => { dojo.place(card[0], card[1]); });

	                	dojo.query('.portaledge > .cursor').forEach(ele => { ele.remove(); });
	                    dojo.query('.portaledge > .draw_num').forEach(ele => { ele.remove(); });

	                	if (climbing_card_info && climbing_card_info.portaledge_all
	                	&& climbing_card_info.finished_portaledge.length+1 == Object.keys(gameui.gamedatas.players).length) {
	                		portaledge.style.marginTop = '-36.4061%';
			                portaledge.style.display = '';
	                	} else if (!climbing_card_info || !climbing_card_info.portaledge_all) {
	                		portaledge.style.marginTop = '-36.4061%';
			                portaledge.style.display = '';
	                	}
	                	const player_resources = this.getCurrentPlayerResources();
                    	for (let type of card_asset_types) {
                    		player_resources.skills[type]++;
                    	}
                    	for (let type of card_technique_types) {
	                    		player_resources.techniques[type]++;
	                    	}
                    	this.updatePlayerResources(player_id, player_resources);
                    	this.handCount(player_id, hand_count);
						this.clicksOn();
	                	resolve();
	                }
	            })
	        },

	        portaledgeOpponent: async function(player_id, asset_types, auto=false, hand_count, climbing_card_info=null, share=false, water=0, psych=0, last_card, refill_portaledge, bomber_anchor=false) {
    			
	        	return new Promise (async resolve => {
	                if (this.shouldAnimate()) {

	                	await this.updateWaterPsych(player_id, water, psych); // for resting state

	                	const hand_counter = $(`hand_counter_${player_id}`);
	        			let total_draw = Object.values(asset_types).reduce((acc, value) => acc + value);
	        			let current_draw = 1;

	                	if (total_draw > 0) {

	                		const refill = refill_portaledge.length != [] ? true : false;

		                	this.updateTitlebar(_('Drawing from Portaledge'));
		        			const portaledge = $('portaledge');

		        			if (auto || bomber_anchor) {
		        				portaledge.style.display = 'block';
			                    await this.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
			                    portaledge.style.marginTop = 0;
			                    await (async function() { return new Promise(resolve => setTimeout(resolve, 300)) })();
		        			}

		        			await (async () => {
		        				return new Promise(async (resolve) => {
		        					
									let zIndex = 10;
		        					for (const [type, value] of Object.entries(asset_types)) {

		        						const deck_ele = $(`porta${type}`);
		        						const deck = deck_ele.id;
				        				for (let i=1; i<=value; i++) {

				        					const asset_back = dojo.place(gameui.format_block('jstpl_asset_card', {
						                    				   CARD_ID : `00${i}`,
						                    				   EXTRA_CLASSES : 'opponent_draw',
						                    				   acX : 0,
						                    				   acY : 0,
						                    }), deck_ele);
											asset_back.style.zIndex = `${zIndex}`;
											zIndex--;

						                    const args = [asset_back, hand_counter];
						                    this.animationPromise(asset_back, 'asset_portaledge_to_counter', 'anim', this.moveToNewParent(), true, false, ...args);

											if (Object.keys(last_card).includes(type) && last_card[type] === i) {
						                    	dojo.query('.opponent_draw').forEach(ele => { ele.style.visibility = 'visible'; });
			                    				deck_ele.style.visibility = 'hidden';
			                    			}

											if (refill && refill_portaledge[deck] && refill_portaledge[deck][1] === i) {
				        						await this.refillPortaledge($(`porta${type}`), refill_portaledge);
				        						this.updateTitlebar(_('Drawing from Portaledge'));
				        					}
											deck_ele.style.visibility = '';

						                    await (async function() { return new Promise(resolve => setTimeout(resolve, 200)) })();

						                    if (current_draw === total_draw) {
						                    	await (async function() { return new Promise(resolve => setTimeout(resolve, 800)) })();
						                    	this.handCount(player_id, hand_count);
						                    	resolve();
						                    }
						                    current_draw += 1;
				        				}
				        			}
		        				});
		        			})();

		                    await (async () => { return new Promise(resolve => setTimeout(resolve, 300)) })();
		                    if (share) { await (async function() { return new Promise(resolve => setTimeout(resolve, 500)) })(); }

		                    if (climbing_card_info && climbing_card_info.portaledge_all
		                    	&& climbing_card_info.finished_portaledge.length+1 == Object.keys(gameui.gamedatas.players).length) {
		                    		await this.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
		                    		portaledge.style.marginTop = '-36.4061%';
				                	portaledge.style.display = '';

		                    	} else if (!climbing_card_info || !climbing_card_info.portaledge_all) {
		                    		await this.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
		                    		portaledge.style.marginTop = '-36.4061%';
				                	portaledge.style.display = '';
		                    	}

		                    resolve();

	                	} else {

		                    await this.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
	                		portaledge.style.marginTop = '-36.4061%';
		                	portaledge.style.display = '';
	                		resolve();
	                }

	                } else { // shouldn't animate
	                	if (climbing_card_info && climbing_card_info.portaledge_all
	                	&& climbing_card_info.finished_portaledge.length+1 == Object.keys(gameui.gamedatas.players).length) {
	                		portaledge.style.marginTop = '-36.4061%';
			                portaledge.style.display = '';
	                	} else if (!climbing_card_info || !climbing_card_info.portaledge_all) {
	                		portaledge.style.marginTop = '-36.4061%';
			                portaledge.style.display = '';
	                	}
	                	this.handCount(player_id, hand_count);

	                	resolve();
	                }
	        	})
	        },

	        refillPortaledge: async function(deck_ele, refill_portaledge) {

				return new Promise(async (resolve) => {

					this.updateTitlebar(_('Refilling The Portaledge'));

					const deck = deck_ele.id;
    				const discard_num = refill_portaledge[deck][0];
    				const deck_num = 7 - discard_num;
    				
    				for (let i=1; i<=discard_num; i++) {

    					let args;
    					const card_back_block = gameui.format_block('jstpl_asset_card', {
    						CARD_ID : `temp_${i}`,
    						EXTRA_CLASSES : 'shuffle_back',
    						acX : 0,
    						acY : 0,
    					});

    					const card_back = dojo.place(card_back_block, $('asset_discard'));
    					card_back.style.visibility = 'visible';
    					card_back.style.position = 'absolute';
    					args = [card_back, deck_ele, 2];
    					this.animationPromise(card_back, 'asset_to_portaledge', 'anim', this.moveToNewParent(), false, true, ...args);
    					await (async function() { return new Promise(resolve => setTimeout(resolve, 100)) })();

    					if (i === 7) { await (async function() { return new Promise(resolve => setTimeout(resolve, 800)) })(); }
    				}

    				for (let i=1; i<=deck_num; i++) {

    					const card_back_block = gameui.format_block('jstpl_asset_card', {
    						CARD_ID : `temp_${i}`,
    						EXTRA_CLASSES : 'shuffle_back',
    						acX : 0,
    						acY : 0,
    					});

    					const card_back = dojo.place(card_back_block, $('asset_deck'));
    					card_back.style.visibility = 'visible';
    					card_back.style.position = 'absolute';
    					args = [card_back, deck_ele, 2];
    					this.animationPromise(card_back, 'asset_to_portaledge', 'anim', this.moveToNewParent(), false, true, ...args);
    					await (async function() { return new Promise(resolve => setTimeout(resolve, 100)) })();

    					if (discard_num + i === 7) { await (async function() { return new Promise(resolve => setTimeout(resolve, 800)) })(); }
    				}

    				const shuffle_backs = dojo.query('.shuffle_back');
    				let a_pair = Math.random() < 0.5;
    				let b_pair = Math.random() < 0.5;
    				let c_pair = Math.random() < 0.5;
    				if (!a_pair && !b_pair && !c_pair) {
    					const num = Math.floor(Math.random() * 3)
    					switch (num) {
    						case 0: a_pair = true; break;
    						case 1: b_pair = true; break;
    						case 2: c_pair = true; break;
    					}
    				}

    				for (let i=0; i<=shuffle_backs.length-1; i++) {

    					const card_back = shuffle_backs[i];
    					const card_rect = card_back.getBoundingClientRect();
    					let xTarget = card_rect.width / 2 + card_rect.width / 2 * Math.random();
    					if (i === 5 || i === 6) {
    						xTarget = card_rect.width * 0.8;
    					}
    					if ([0, 2, 4, 6].includes(i)) { xTarget *= -1; }

    					card_back.style.zIndex = `${i+1}`;
    					card_back.style.setProperty('--xTarget', `${xTarget}px`);
    					card_back.style.setProperty('--z', `${i+1}`)

    					switch (true) {

    						case i === 1 && a_pair: card_back.style.setProperty('--z', 2); break;
    						case i === 2 && a_pair: card_back.style.setProperty('--z', 1); break;
    						case i === 3 && b_pair: card_back.style.setProperty('--z', 4); break;
    						case i === 4 && b_pair: card_back.style.setProperty('--z', 3); break;
    						case i === 5: 			card_back.style.setProperty('--z', 6); break;
    						case i === 6: 			card_back.style.setProperty('--z', 5); break;
    					}

    					if ([0, 2, 4, 6].includes(i)) { this.animationPromise(card_back, 'deck_reshuffle_L', 'anim', null, false, true); }
    					else { this.animationPromise(card_back, 'deck_reshuffle_R', 'anim', null, false, true); }
    					
    					await (async function() { return new Promise(resolve => setTimeout(resolve, 30)) })();

    					if (i === 6) {
    						await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
    						shuffle_backs.forEach(ele => { ele.remove(); });
    						deck_ele.style.visibility = 'visible';
    						await (async function() { return new Promise(resolve => setTimeout(resolve, 500)) })();
    						resolve();
    					}
    				}
				});
	        },

	        repositionAssetBoard: function(player_id) {

	        	const player = gameui.gamedatas.players[player_id];
	        	const character_id = player.character;
	            const character = gameui.gamedatas.characters[character_id];

	        	const asset_board = $(`asset_board_${player_id}`);
	        	for (const type_ele of asset_board.children) {

	        		if (!type_ele.classList.contains('two_point_tokens') && !type_ele.classList.contains('permanent_asset_tokens')) {

	        			const type = type_ele.id.slice(-5).replace(/_/g, '');
	        			let played_assets = dojo.query(`#${type_ele.id} .played_asset`);
	        			let flipped_status = Object.values(gameui.gamedatas.board_assets[player_id][type]['flipped']);

	        			if (played_assets.length > 0) {

	        				for (const wrapper of type_ele.children) {

			        			if (wrapper.id.slice(-1) !== 'r') { // ignore tucked counters

			        				const wrapper_slot = wrapper.id.slice(-1);
				        			if (played_assets.length > 0) {
				        				wrapper.append(played_assets.shift());
				        				gameui.gamedatas.board_assets[player_id][type]['flipped'][wrapper_slot] = flipped_status.shift();
				        			}
				        			else if (played_assets.length === 0) {
				        				gameui.gamedatas.board_assets[player_id][type]['flipped'][wrapper_slot] = null;
				        			}
			        			}
			        		}
	        			}

		        		for (let asset_ele of played_assets) {

		        			const id = asset_ele.id.slice(-3).replace(/^\D+/g, '');
		        			const type_arg = gameui.gamedatas.asset_identifier[id];
		        			const slot = asset_ele.parentElement.id.slice(-1);
		        			gameui.gamedatas.board_assets[player_id][type][slot] = { id : type_arg };
		        		}

		        		const tucked_num = Object.keys(gameui.gamedatas.board_assets[player_id][type]['tucked']).length;
		        		const tucked_counter = $(`${character.name}_${type}_counter`);
		        		if (tucked_counter.style.display == 'block') {
		        			if (tucked_num == 0) { tucked_counter.style.display = ''; }
		        			else { 
		        				const tucked_num_ele = dojo.query(`#${tucked_counter.id} > .asset_counter_num`);
		        				tucked_num_ele.innerHTML = String(tucked_num);
		        			}
		        		}
	        		}
	        	}
	        },

	        vacateAssetSlots: async function(vacate_slots, character, player_id) {

	        	for (const [column, num] of Object.entries(vacate_slots)) {

                    for (let i=1; i<=num; i++) {

                        if (i == 1) { $(`${character.name}_${column}_counter`).style.display = 'block'; }

                        const card_ele = $(`${character.name}_${column}_${i}`).firstElementChild;
                        const destination = dojo.query(`#${character.name}_${column}_counter > .asset_counter_img`)[0];
                        const args = [card_ele, destination];

                        const id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                        const type_arg = gameui.gamedatas.asset_identifier[id];
                        const type = this.getAssetType(type_arg);
                        const slot = card_ele.parentElement.id.slice(-1);

                        delete gameui.gamedatas.board_assets[player_id][type][slot][id];
                        gameui.gamedatas.board_assets[player_id][type]['tucked'][id] = type_arg;
                        gameui.gamedatas.board_assets[player_id][type]['flipped'][slot] = false;

                        if (this.shouldAnimate()) {
                        	const old_slot = card_ele.parentElement;
                        	const old_z = old_slot.style.zIndex;
                        	old_slot.style.zIndex = '6';
                        	await this.animationPromise(card_ele, 'asset_board_to_tucked', 'anim', this.moveToNewParent(), true, false, ...args);
                        	old_slot.style.zIndex = old_z;
                        
                        } else {
                        	card_ele.remove();
                        }

                        const old_num = Number(destination.nextElementSibling.innerHTML);
                        destination.nextElementSibling.innerHTML = `${old_num + 1}`;
                    }
                    this.repositionAssetBoard(player_id);
                }
	        },

			matchBoardAssets: async function() {

				const board_assets = gameui.gamedatas.board_assets;

				if (this.shouldAnimate()) {

					let anims = [];
					for (const player_id of Object.keys(board_assets)) {

						const player_board = board_assets[player_id];
						const board_ele = $(`asset_board_${player_id}`);
						const type_moved = {'gear' : 0, 'face' : 0, 'crack' : 0, 'slab' : 0};
						for (const type of Object.keys(player_board)) {

							const type_board = player_board[type];

							const tucked_counter = board_ele.querySelector(`.board_${type}_counter > .asset_counter_img`);
							for (let i=1; i<=5; i++) {

								const slot = board_ele.querySelector(`.${type}_${i}`);
								const expected_id = type_board[i] ? Object.keys(type_board[i])[0] : null;
								const current_id = slot && slot.firstElementChild ? slot.firstElementChild.id.slice(-3).replace(/^\D+/g, '') : null;

								if (expected_id != undefined && expected_id != current_id) {

									let expected_card = $(`asset_card_${expected_id}`);
									if (expected_card) {
										const args = [expected_card, slot];
										anims.push(this.animationPromise.bind(null, expected_card, 'asset_board_to_board', 'anim', this.moveToNewParent(), false, true, ...args));
									}
									else { // tucked card
										const card_ele = dojo.place(gameui.format_block('jstpl_asset_card', {
											CARD_ID : expected_id,
											EXTRA_CLASSES : 'played_asset flipped',
											acX : 0,
											acY : 0,
										}), tucked_counter);
										const args = [card_ele, slot];
										slot.append(card_ele);
										const dest_width = card_ele.getBoundingClientRect().width;
										const dest_height = card_ele.getBoundingClientRect().height;
										tucked_counter.append(card_ele);
										card_ele.style.setProperty('--dw', `${dest_width}px`);
										card_ele.style.setProperty('--dh', `${dest_height}px`);
										anims.push(this.animationPromise.bind(null, card_ele, 'asset_tucked_to_board', 'anim', this.moveToNewParent(), false, true, ...args));
									}
									type_moved[type]++;
								}
							}
						}
						for (const [type, num] of Object.entries(type_moved)) {
							if (num > 0) {
								const type_num_ele = $(`asset_board_${player_id}`).querySelector(`.board_${type}_counter > .asset_counter_num`);
								const current_num = Number(type_num_ele.innerHTML);
								type_num_ele.innerHTML = current_num - num;
							}
						}
					}
					await Promise.all(anims.map(func => { return func(); }));
				}
				else { // shouldn't animate

					for (const player_id of Object.keys(board_assets)) {

						const player_board = board_assets[player_id];
						const board_ele = $(`asset_board_${player_id}`);
						const type_moved = {'gear' : 0, 'face' : 0, 'crack' : 0, 'slab' : 0};
						for (const type of Object.keys(player_board)) {

							const type_board = player_board[type];
							for (let i=1; i<=5; i++) {

								const slot = board_ele.querySelector(`.${type}_${i}`);
								const expected_id = type_board[i] ? Object.keys(type_board[i])[0] : null;
								const current_id = slot && slot.firstElementChild ? slot.firstElementChild.id.slice(-3).replace(/^\D+/g, '') : null;
								if (expected_id != current_id) {

									let expected_card = $(`asset_card_${expected_id}`);
									if (expected_card) { slot.append(expected_card); }
									else if (expected_card != null) {
										dojo.place(gameui.format_block('jstpl_asset_card', {
											CARD_ID : expected_id,
											EXTRA_CLASSES : 'played_asset flipped',
											acX : 0,
											acY : 0,
										}), slot);
									}
									type_moved[type]++;
								}
							}
						}
						for (const [type, num] of Object.entries(type_moved)) {
							if (num > 0) {
								const type_num_ele = $(`asset_board_${player_id}`).querySelector(`.board_${type}_counter > .asset_counter_num`);
								const current_num = Number(type_num_ele.innerHTML);
								type_num_ele.innerHTML = current_num - num;
							}
						}
					}
				}			
			},

	        countAssetBoardColumn: function(player_id, type) {

				const character_id = gameui.gamedatas.players[player_id]['character'];

				let count = 0;

				if (!(character_id === '2' && type === 'gear')) {
					for (let i=1; i<=3; i++) {
						count += document.querySelector(`#asset_board_${player_id} .${type}_${i}`).childElementCount;
					}
				}
				if (
					   !(character_id === '2' && type === 'gear') // Free Soloist
					&& !(character_id === '6' && type != 'gear') // Young Prodigy
				) {
					count += document.querySelector(`#asset_board_${player_id} .${type}_4`).childElementCount;
				}
				if (character_id === '6' && type === 'gear') { // Young Prodigy
					count += document.querySelector(`#asset_board_${player_id} .${type}_5`).childElementCount;
				}

	        	return count;
	        },

	        updateBoardAssets: function(player_id) {

	        	dojo.query(`#asset_board_${player_id} .played_asset`).forEach(ele => {

	        		const id = ele.id.slice(-3).replace(/^\D+/g, '');
	        		const type_arg = gameui.gamedatas.asset_identifier[id];
	        		const type = this.getAssetType(type_arg);
	        		const technique = this.getAssetTechnique(type_arg);
	        		const slot = ele.parentElement.id.slice(-1);

	        		gameui.gamedatas.board_assets[player_id][type][slot] = {};
		        	gameui.gamedatas.board_assets[player_id][type][slot][id] = type_arg;
	        		if (!ele.classList.contains('flipped')) {
		        		if (player_id == gameui.player_id && technique) { gameui.gamedatas.resource_tracker['asset_board']['techniques'][technique]++; }
	        		}
	        		else {
	        			gameui.gamedatas.board_assets[player_id][type]['flipped'][slot] = true;
	        		}
	        	});
	        },

	        decrementTuckedNum: function(num_ele) {

                const old_num = Number(num_ele.innerHTML);
                num_ele.innerHTML = `${old_num - 1}`;
	        },

			initSummitBetaToken: function(ele, type_arg) {

				switch (type_arg) {

					// any time tokens
					case '1': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaRerack');	break;
					case '4': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaEnergyDrink'); break;
					case '7': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaSimulClimb'); break;
					case '9': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaBomberAnchor'); break;

					// specific time tokens
					case '2': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaBorrowedRack'); break;
					case '3': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaJumar'); break;
					case '5': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaExtraWater'); break;
					case '8': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaGuidebook'); break;
					case '10': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaJesusPiece'); break;
					case '11': dojo.connect(ele.firstElementChild, 'onclick', gameui, 'onSummitBetaLuckyChalkbag'); break;
				}
			},

			enableSummitBetaTokens: function(state=false) {

				if (gameui.isCurrentPlayerActive()) {

					this.disableSummitBetaTokens();

					let enabled = 0;
					dojo.query('#assets_wrap .summit_beta').forEach(ele => {

						const id = ele.id.slice(-3).replace(/^\D+/g, '');
						const type_arg = gameui.gamedatas.token_identifier[id];
						const pre_enabled = enabled;

						// Rerack, Energy Drink, Simul Climb, & Bomber Anchor
						if (['1', '4', '7', '9'].includes(type_arg)) {
							ele.firstElementChild.style.display = 'inline-block';
							ele.classList.add('selectable_token');
							enabled++;
						}

						switch (state) {

							case 'climb_pitch':

								// Borrowed Rack
								if (type_arg == 2 && gameui.character_id === '2' && document.querySelector('.any_skill_wrap')) {
									const pitch_num = document.querySelector('.selected_pitch').nextElementSibling.classList[1].slice(1);
                    				const pitch = gameui.gamedatas.pitches[pitch_num];
									if (pitch.requirements.gear > 0) {
										ele.firstElementChild.style.display = 'inline-block';
										ele.classList.add('selectable_token');
										enabled++;
										break;
									}
								}
								else if (type_arg == 2 && document.querySelector('.gear_wrap')) {
									ele.firstElementChild.style.display = 'inline-block';
									ele.classList.add('selectable_token');
									enabled++;
									break;
								}

								// Jumar
								if (type_arg == 3) {
									let already_climbed = false;
									let selected_pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
									let selected_hex = selected_pitch.id.slice(-2).replace(/^\D+/g, '');
									for (const [player, pitch_list] of Object.entries(gameui.gamedatas.pitch_tracker)) {
										if (player != this.player_id && pitch_list.includes(`${selected_hex}`)) {
											already_climbed = true;
										}
									}
									if (already_climbed) {
										ele.firstElementChild.style.display = 'inline-block';
										ele.classList.add('selectable_token');
										enabled++;
									}
									else {
										ele.firstElementChild.style.display = 'none';
										ele.classList.remove('selectable_token');
									}
									break;
								}

								// Extra Water
								if (type_arg == 5 && dojo.query('.water_wrap').length != 0) {
									ele.firstElementChild.style.display = 'inline-block';
									ele.classList.add('selectable_token');
									enabled++;
									break;
								}

								// Guidebook
								if (type_arg == 8) {
									ele.firstElementChild.style.display = 'inline-block';
									ele.classList.add('selectable_token');
									enabled++;
									break;
								}
								break;

							// Jesus Piece
							case 'select_climbing_choice':

								const climbing_card_id = $('climbing_slot').firstElementChild.id.slice(-3).replace(/^\D+/g, '');
								const climbing_card_type_arg = gameui.gamedatas.climbing_card_identifier[climbing_card_id];
								const climbing_card = gameui.gamedatas.climbing_cards[climbing_card_type_arg];
								const choice = dojo.query('.selected_choice')[0].classList[1];
								const cost = climbing_card[`${choice}_args`]['cost'];

								if (type_arg == 10) {

									if ( ['updateWaterPsych', 'discard'].includes(cost)
										|| ( ['23', '26'].includes(climbing_card_type_arg) && choice === 'b')
										|| ( ['25', '65', '68'].includes(climbing_card_type_arg) && choice === 'a')
										|| ( ['31', ,'45', '53'].includes(climbing_card_type_arg) && choice === 'b')
									   ) {

										   ele.firstElementChild.style.display = 'inline-block';
										   ele.classList.add('selectable_token');
										   enabled++;
										   break;
								   }

								   else if (climbing_card_type_arg === '55' && choice === 'a') {

										const current_pitch_ele = $(`meeple_${gameui.player_id}`).parentElement;
										const pitch_type_arg = current_pitch_ele.classList[1].slice(1);
										const pitch = gameui.gamedatas.pitches[pitch_type_arg];
										const sunny = !pitch.shade;
										if (sunny) {
											ele.firstElementChild.style.display = 'inline-block';
											ele.classList.add('selectable_token');
											enabled++;
										}
								   }
								}
								break;

							case 'select_opponent':
								if (type_arg == 10) {
									ele.firstElementChild.style.display = 'inline-block';
									ele.classList.add('selectable_token');
									enabled++;
									break;
								}
							break;

							case 'risk_summit_beta':
								if (type_arg == 11) {
									ele.firstElementChild.style.display = 'inline-block';
									ele.classList.add('selectable_token');
									enabled++;
									break;
								}
						}

						if (enabled > pre_enabled) { ele.parentElement.style.marginRight = '2vmin'; }
					});

					gameui.enabled_summit_beta_tokens = enabled;
					if (enabled && gameui.isCurrentPlayerActive() && dojo.query('#available_sb_message').length === 0) {
						$('phase_tracker').insertAdjacentHTML('afterend', `<span id="available_sb_message">${_('You have available<br>Summit Beta Tokens')}</span`);
					}
				}
			},

			disableSummitBetaTokens: function() {

				if (gameui.getActivePlayerId() == gameui.player_id) {

					dojo.query('.selected_token.summit_beta').forEach(ele => {

						ele.firstElementChild.style.border = '';
                		ele.firstElementChild.style.boxShadow = '';
					});
					dojo.query('.selectable_token').forEach(ele => { ele.parentElement.style.marginRight = ''; });
					dojo.query('#assets_wrap .summit_beta').forEach(ele => {
						ele.firstElementChild.style.display = 'none';
						ele.classList.remove('selectable_token');
					} );

					if ($('available_sb_message')) { $('available_sb_message').remove(); }
				}
			},

			resetStateOnSummitBeta: function(summit_beta_type_arg=null, current_state=gameui.gamedatas.current_state) {

				gameui.removeActionButtons();
				dojo.query('#asset_deck > .draw_button').forEach(ele => { ele.remove(); });
				dojo.query('#asset_deck > #draw_num').forEach(ele => { ele.remove(); });
				dojo.query('#assets_wrap .asset').forEach(ele => { ele.classList.remove('cursor'); });

				let sb_token = null;
				if (summit_beta_type_arg) {
					const id = Object.keys(gameui.gamedatas.hand_summit_beta_tokens).find(key => gameui.gamedatas.hand_summit_beta_tokens[key] === summit_beta_type_arg);
                    sb_token = $(`summit_beta_${id}`);
				}

				dojo.query('.cursor').forEach(ele => {
					if (ele.parentElement != sb_token) {
						this.clicks.push(ele);
						ele.style.pointerEvents = 'none';
					}
				});
				dojo.query('.selectable').forEach(ele => {
					ele.classList.remove('selectable');
					if (ele.id != 'asset_deck') { ele.style.pointerEvents = 'none'; }
				});
				dojo.query('#assets_wrap .selectable_token').forEach(ele => { ele.style.pointerEvents = ''; });
				dojo.query('.selected_asset').forEach(ele => { ele.classList.remove('selected_asset'); });
				dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('selected_resource'); });
				dojo.query('.selectable_wrap').forEach(ele => { ele.classList.remove('selectable_wrap'); });
				dojo.query('.draw_num').forEach(ele => { ele.remove(); });
				
				switch (current_state) {
					case 'climbOrRest':
						dojo.query('.selected_pitch').forEach(ele => {
							ele.classList.remove('selected_pitch');
							ele.classList.add('available_pitch');
						});
						break;
					
					case 'selectPortaledge':
					case 'resting':
						dojo.query('#portaledge .cursor').forEach(ele => {
							if (!ele.classList.contains('rest_click')) { ele.remove(); }
						});
						break;

					case 'chooseSummitBetaToken':
						dojo.query('#summit_pile .selected_token').forEach(ele => { ele.classList.remove('selected_token'); });
						break;
				}
				
				for (const i in gameui.trade_handlers) { dojo.disconnect(gameui.trade_handlers[i]); }
				for (const i in gameui.asset_selection_handlers) { dojo.disconnect(gameui.asset_selection_handlers[i]); }
				for (const i in gameui.asset_handlers) { dojo.disconnect(gameui.asset_handlers[i]); }
				if ($('climbing_slot').firstElementChild) { $('climbing_slot').style.display = ''; }
				gameui.unnecessary_requirements = 0;
			},

			discardPlayedSummitBetaTokens: async function(summit_beta_type_args=false) {

				if (gameui.isCurrentPlayerActive()) { 

					return new Promise(async (resolve) => {

						const total_sb_tokens = dojo.query('#assets_wrap .summit_beta.selected_token').length;
						let current_sb_token = 1;
						for (let token_ele of dojo.query('#assets_wrap .summit_beta')) {

							if (token_ele.classList.contains('selected_token')) {

								const token_id = token_ele.id.slice(-3).replace(/^\D+/g, '');
								delete gameui.gamedatas.hand_summit_beta_tokens[token_id];

								if (dojo.query(`#${token_ele.id} > #sb_skills_wrapper`).length === 1) { $('sb_skills_wrapper').remove(); }

								if (this.shouldAnimate()) {

									token_ele.classList.remove('selected_token', 'selectable_token');
									token_ele.firstElementChild.classList.remove('click', 'cursor');
									const args = [token_ele, $('summit_discard')];

									this.updateTitlebar(_('Discarding Summit Beta token(s)'));
									await this.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.moveToNewParent(), false, true, ...args);
									if (current_sb_token === total_sb_tokens) { resolve(); }
									else { current_sb_token++; }
								}

								else { // shouldn't animate
								
									const token_ele = dojo.query('.selected_token')[0];
									token_ele.classList.remove('selected_token', 'selectable_token');
									token_ele.firstElementChild.classList.remove('click', 'cursor');
									$('summit_discard').replaceChildren();
									$('summit_discard').append(token_ele);
									if (current_sb_token === total_sb_tokens) { resolve(); }
									else { current_sb_token++; }
								}

								gameui.enabled_summit_beta_tokens--;
            					if (gameui.enabled_summit_beta_tokens < 1 && document.getElementById('available_sb_message')) {
									document.getElementById('available_sb_message').remove();
								}
							}
						}
						resolve();
					});
				}

				else {

					return new Promise(async (resolve) => {

						let idx = 1;
						let counter_to_display = [];
						let display_to_discard = [];
						const player_id = gameui.getActivePlayerId();
						const tokens = gameui.gamedatas.token_identifier;

						if (!summit_beta_type_args || summit_beta_type_args.length === 0) { resolve(); }
						else { $('token_display').style.display = 'flex'; }

						const hand_counter = $(`hand_counter_${player_id}`);
						for (const type_arg of summit_beta_type_args) {

							const token_id = Object.keys(tokens).find(key => tokens[key] === type_arg);
							const token = gameui.gamedatas.summit_beta_tokens[type_arg];
							const token_ele = dojo.place(gameui.format_block('jstpl_summit_beta', {
								TOKEN_ID : token_id,
								sbX : token.x_y[0],
								sbY : token.x_y[1],
							}), hand_counter);
		
							if (this.shouldAnimate()) {
		
								this.updateTitlebar(_('Discarding Summit Beta token(s)'));
								const destination = $(`token_display_${idx}`);
								destination.append(token_ele);
								const end_pos = token_ele.getBoundingClientRect();
								token_ele.style.setProperty('--dw', `${end_pos.width}px`);
								token_ele.style.setProperty('--dh', `${end_pos.height}px`);
								hand_counter.append(token_ele);

								let args = [token_ele, $(`token_display_${idx}`), null, false, true];
								counter_to_display.push(this.animationPromise.bind(null, token_ele, 'token_counter_to_display', 'anim', this.moveToNewParent(), false, true, ...args));
								args = [token_ele, $('summit_discard')];
								display_to_discard.push(this.animationPromise.bind(null, token_ele, 'token_display_to_discard', 'anim', this.moveToNewParent(), false, true, ...args));

								Promise.all(counter_to_display.map(func => { return func(); }))
								.then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
								.then(() => Promise.all(display_to_discard.map(func => { return func();})))
								.then(() => {
									const summit_discard = $('summit_discard');
									while (summit_discard.childElementCount > 1) { summit_discard.removeChild(summit_discard.firstElementChild); }
									$('token_display').style.display = '';
									resolve();
								});
							}

							else { // shouldn't animate
							
								$('summit_discard').append(token_ele);
								$('token_display').style.display = '';
								resolve();
							}
						}
					});
				}
			},

			cleanAssetDiscardPile: function() {

				const discard_pile = $('asset_discard');
				while (discard_pile.childElementCount > 1) { discard_pile.removeChild(discard_pile.firstElementChild); }
			},

			cleanClimbingDiscardPile: function() {

				const discard_pile = $('climbing_discard_90');
				while (discard_pile.childElementCount > 1) { discard_pile.removeChild(discard_pile.firstElementChild); }
			},

			cleanSummitBetaDiscardPile: function() {

				const discard_pile = $('summit_discard');
				while (discard_pile.childElementCount > 1) { discard_pile.removeChild(discard_pile.firstElementChild); }
			},

			updateRequirementsForSB: function() {

				if ($('confirm_requirements_button') && dojo.query('.requirement_border').length === 1) {

					$('confirm_requirements_button').remove();
					gameui.addActionButton('risk_it_button', _('Risk it'), 'onConfirmRequirements', null, false, 'white');
					const button = $('risk_it_button');
					button.classList.add('disabled');
					$('generalactions').insertBefore(button, $('generalactions').firstChild);
				}

				else if ($('risk_it_button') && dojo.query('.requirement_border').length === 0 && gameui.character_id != '8') {

					$('risk_it_button').remove();
					gameui.addActionButton('confirm_requirements_button', _('Confirm'), 'onConfirmRequirements', null, false, 'white');
					const button = $('confirm_requirements_button');
					button.classList.add('disabled');
					$('generalactions').insertBefore(button, $('generalactions').firstChild);
				}

				let missing_requirements = 0;
				if ($('confirm_button')) { missing_requirements = dojo.query('.requirement_border').length; }
				else if ($('confirm_requirements_button') || $('risk_it_button')) {

					dojo.query('.requirement_wrap > .skills_and_techniques').forEach(ele => {

						if (!ele.parentElement.classList.contains('fulfilled')) { missing_requirements++; }
					});

					missing_requirements += dojo.query('.psych_wrap > .requirement_border').length + dojo.query('.water_wrap > .requirement_border').length;
				}

				let button = null;
				if ($('confirm_button')) { button = $('confirm_button'); }
				else if ($('confirm_requirements_button')) { button = $('confirm_requirements_button'); }
				else if ($('risk_it_button')) { button = $('risk_it_button'); }

				if (gameui.character_id === '8' && missing_requirements === 0) { missing_requirements = 1; }
				
				if (missing_requirements === 0) {

					button.classList.remove('disabled');
					dojo.query('#requirements_message').forEach(ele => { ele.remove(); });
                    dojo.query('#risk_it_message').forEach(ele => { ele.remove(); });
					return true;
				}

				else if (missing_requirements === 1) {

					if ($('confirm_button')) {
                        button.classList.remove('disabled');
                        dojo.query('#requirements_message').forEach(ele => { ele.remove(); });
                        if (!$('risk_it_message')) { $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
							`<span id="risk_it_message">
								<span id="ri_line1">You may</span>
								<span id="ri_line2">risk it</span>
							</span>`
						); }
						return false;
                    }
				}

				else if (gameui.extra_water_requirements && $('confirm_requirements_button') && missing_requirements > 1) { return true; }
			},

			checkRequirements: function() {

				const selected_pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
				const pitch_num = selected_pitch.classList[selected_pitch.classList.length-1].slice(-2).replace(/^\D+/g, '');
				const pitch_requirements = JSON.parse(JSON.stringify(gameui.gamedatas.pitches[pitch_num]['requirements']));

				for (let type of gameui.ignore_types) {
					pitch_requirements[type]--;
				}

				// character conversions

				// Rope Gun
				if (gameui.character_id === '1' && pitch_requirements.water > 0) { pitch_requirements.water--; }

				// Free Soloist
				if (gameui.character_id === '2') {
					const gear = pitch_requirements.gear;
					for (let i=1; i<=gear; i++) {
						pitch_requirements.gear--;
						pitch_requirements.any_skill++;
					}
				}

				// Bold Brit
				if (gameui.character_id === '7' && pitch_requirements.gear > 1) { pitch_requirements['gear'] = 1; }

				// Dirtbag
				if (document.querySelector('.dirtbag_converted')) {
					const converted_icon = document.querySelector('.dirtbag_converted');
					const classlist = converted_icon.classList;
					const has_border = classlist[classlist.length-1] === 'has_border' ? true : false;
					const type = has_border ? classlist[classlist.length-2].slice(4) : classlist[classlist.length-1].slice(4);
					pitch_requirements[type]--;
					pitch_requirements['gear']++;
				}

				// Overstoker
				if (document.querySelector('.overstoker_converted')) {
					const converted_icon = document.querySelector('.overstoker_converted');
					const classlist = converted_icon.classList;
					const has_border = classlist[classlist.length-1] === 'has_border' ? true : false;
					const type = has_border ? classlist[classlist.length-2].slice(4) : classlist[classlist.length-1].slice(4);
					pitch_requirements[type]--;
					pitch_requirements['psych']++;
				}

				// Crag Mama
				if (document.querySelector('.crag_mama_selected') && document.querySelector('.crag_mama_selected').classList.length > 2) {
					const button = document.querySelector('.crag_mama_selected');
					const classlist = button.classList;
					const has_border = classlist[classlist.length-1] === 'has_border' ? true : false;
					const type = has_border ? classlist[classlist.length-3].slice(4) : classlist[classlist.length-2].slice(4);
					pitch_requirements[type]--;
				}

				// Bionic Woman
				if (document.querySelector('.bionic_woman_converted')) {
					const converted_icon = document.querySelector('.bionic_woman_converted');
					const classlist = converted_icon.classList;
					const has_border = classlist[classlist.length-1] === 'has_border' ? true : false;
					const type = has_border ? classlist[classlist.length-2].slice(4) : classlist[classlist.length-1].slice(4);
					pitch_requirements[type]--;
					pitch_requirements['any_skill']++;
				}

				this.sanitizeHand();
				const selected_resources = {
					'gear' : 0,
					'face' : 0,
					'crack' : 0,
					'slab' : 0,
					'any_skill' : 0,
				};

				if (gameui.resources['water'] >= pitch_requirements['water']) { selected_resources['water'] = pitch_requirements['water']; }
				else if (pitch_requirements['water'] > 0) { selected_resources['water'] = gameui.resources['water']; }
				else selected_resources['water'] = 0;
				if (gameui.resources['psych'] >= pitch_requirements['psych']) { selected_resources['psych'] = pitch_requirements['psych']; }
				else if (pitch_requirements['psych'] > 0) { selected_resources['psych'] = gameui.resources['psych']; }
				else selected_resources['psych'] = 0;

				dojo.query('.selected_resource').forEach(ele => {
					const id = ele.id.slice(-3).replace(/^\D+/g, '');
					const type_arg = gameui.gamedatas.asset_identifier[id];
					const type = this.getAssetType(type_arg);
					if (selected_resources[type] >= pitch_requirements[type] && type != 'gear') { selected_resources['any_skill']++; }
					else { selected_resources[type]++; }
				});

				dojo.query('.selected_token').forEach(ele => {

					if (!ele.classList.contains('summit_beta')) {

						const type = ele.id.slice(0, 5).replace(/_/g, '');
						if (selected_resources[type] >= pitch_requirements[type] && type != 'gear') { selected_resources['any_skill']++; }
						else { selected_resources[type]++; }
					}
				});

				dojo.query('.selected_gear_border').forEach(ele => { selected_resources['gear']++; });

				// Summit Beta tokens

				if (gameui.borrowed_rack_requirements) { // Borrowed Rack
					if (gameui.character_id === '2') { selected_resources['any_skill'] += gameui.gamedatas.pitches[pitch_num]['requirements']['gear']; }
					else { selected_resources['gear'] += pitch_requirements['gear']; }
				}

				if (gameui.extra_water_requirements) { selected_resources['water'] = pitch_requirements['water']; } // Extra Water

				if (gameui.jumar_requirements) { // Jumar
					selected_resources['face'] += pitch_requirements['face'];
					selected_resources['crack'] += pitch_requirements['crack'];
					selected_resources['slab'] += pitch_requirements['slab'];
					selected_resources['any_skill'] += pitch_requirements['any_skill'];
				}

				if (dojo.query('.selected_skill').length === 1) { // Guidebook

					const skill_type = dojo.query('.selected_skill')[0].id.slice(3);
					const idx = skill_type === gameui.guidebook_requirements ? gameui.guidebook_requirements : skill_type;
					if (selected_resources[idx] >= pitch_requirements[idx]) { selected_resources['any_skill']++; }
					else { selected_resources[idx]++; }
				}

				return [selected_resources, pitch_requirements];
			},

			checkConfirmButton: function(selected_resources, pitch_requirements) {

				// dojo.query('#bad_selection_message').forEach(ele => { ele.remove(); });
				const confirm_button = $('confirm_requirements_button') ? $('confirm_requirements_button') : $('risk_it_button');

                if ($('confirm_requirements_button')) {

                    let fulfilled = Object.keys(pitch_requirements).every(key => pitch_requirements[key] === selected_resources[key]);
                    if (!fulfilled || gameui.unnecessary_requirements) { confirm_button.classList.add('disabled'); }
					else if (fulfilled) { confirm_button.classList.remove('disabled'); }
                }
                if ($('risk_it_button')) {

                    resources_copy = JSON.parse(JSON.stringify(selected_resources));
                    let fulfilled = true;
                    let minus_1 = false;
                    for (const [type, val] of Object.entries(pitch_requirements)) {

                        for (let i=1; i<=val; i++) {

                            if (resources_copy[type] > 0) { resources_copy[type]--; }
                            else if (resources_copy[type] === 0 && minus_1 === false) { minus_1 = true; }
                            else if (resources_copy[type] === 0 && minus_1 === true) { fulfilled = false; }
                        }
                    }

                    if (!fulfilled || gameui.unnecessary_requirements) { confirm_button.classList.add('disabled'); }
					else if (fulfilled) { confirm_button.classList.remove('disabled'); }
                }
			},

			enableRequirementButtons: function(elements, action) {

				elements.forEach(icon => {

					const type = icon.classList[1].slice(0, -5);
                        switch (type) {
                            case 'face': case 'crack': case 'slab': case 'any_skill':
                                icon.style.borderRadius = '50%';
                            case 'water': case 'psych':
                                icon.classList.add('selectable', 'cursor');
								if (action === 'addRequirementBorder') { icon.onclick = (evt) => { this.addRequirementBorder(evt); } }
								else if (action === 'onSelectConversion') { icon.onclick = (evt) => { gameui.onSelectConversion(evt); } }
                                break;
                            case 'gear':
                                const gear_token_border = document.createElement('div');
                                gear_token_border.classList.add('gear_token_border');
                                icon.append(gear_token_border);
                                icon.classList.add('cursor');
                                if (action === 'addRequirementBorder') { icon.onclick = (evt) => { this.addRequirementBorder(evt); } }
								else if (action === 'onSelectConversion') { icon.onclick = (evt) => { gameui.onSelectConversion(evt); } }
                                break;
                        }
				});
			},

			updatePanelAfterDiscard: function(player_id, opponent, player_resources, opponent_resources, player_hand_count, opponent_hand_count, all_card_ids) {

				if (player_id == gameui.player_id) { this.updatePlayerResources(player_id, player_resources); }
				this.handCount(player_id, player_hand_count);
				if (opponent == gameui.player_id) {
					this.updatePlayerResources(opponent, opponent_resources);
					for (let id of all_card_ids) {
						const type_arg = gameui.gamedatas.asset_identifier[id];
						gameui.gamedatas.hand_assets[id] = type_arg;
					}
				}
				if (opponent) { this.handCount(opponent, opponent_hand_count); }	
			},

			decrementTuckedNums: function(player_id, types) {

				const player = gameui.gamedatas.players[player_id];
				const character_id = player.character;
				const character = gameui.gamedatas.characters[character_id];

				for (const type of types) {

					const tucked_num = $(`${character.name}_${type}_counter`).children[1];
					tucked_num.innerHTML = String(Number(tucked_num.innerHTML) -1);
				}
			},

			getPeeOffTheLedgeHexes: function() {

				const player_id = gameui.getActivePlayerId();
				const player_pitches = gameui.gamedatas.pitch_tracker[player_id];
				const current_hex = player_pitches[player_pitches.length-1];
				const board = gameui.board;

				let available_hexes;
				switch (current_hex) {

					case '1': available_hexes = board === 'desert' ?   [2] : [2]; break;
					case '2': available_hexes = board === 'desert' ? [1,3] : [1,3]; break;
					case '3': available_hexes = board === 'desert' ? [2,4] : [2,4]; break;
					case '4': available_hexes = board === 'desert' ? [3,5] : [3,5]; break;
					case '5': available_hexes = board === 'desert' ? [4,6] : [4,6]; break;
					case '6': available_hexes = board === 'desert' ? [5,7] : [5,7]; break;
					case '7': available_hexes = board === 'desert' ? [6,8] : [6,8]; break;
					case '8': available_hexes = board === 'desert' ?   [7] : [7,9]; break;
					case '9': available_hexes = board === 'desert' ? [1,2,10] : [8,10]; break;
					case '10': available_hexes = board === 'desert' ? [2,3,9,11] : [9]; break;
					case '11': available_hexes = board === 'desert' ? [3,4,10,12] : [1,2,12]; break;
					case '12': available_hexes = board === 'desert' ? [4,5,11,13] : [2,3,11,13]; break;
					case '13': available_hexes = board === 'desert' ? [5,6,12,14] : [3,4,12,14]; break;
					case '14': available_hexes = board === 'desert' ? [6,7,13,15] : [4,5,13,15]; break;
					case '15': available_hexes = board === 'desert' ? [7,8,14] : [5,6,14,16]; break;
					case '16': available_hexes = board === 'desert' ? [9,10,17] : [6,7,15,17]; break;
					case '17': available_hexes = board === 'desert' ? [10,11,16,18] : [7,8,16,18]; break;
					case '18': available_hexes = board === 'desert' ? [11,12,17,19] : [8,9,17,19]; break;
					case '19': available_hexes = board === 'desert' ? [12,13,18,20] : [9,10,18]; break;
					case '20': available_hexes = board === 'desert' ? [13,14,19,21] : [11,12,21]; break;
					case '21': available_hexes = board === 'desert' ? [14,15,20] : [12,13,20,22]; break;
					case '22': available_hexes = board === 'desert' ? [16,17,23] : [13,14,21,23]; break;
					case '23': available_hexes = board === 'desert' ? [17,18,22,24] : [14,15,22,24]; break;
					case '24': available_hexes = board === 'desert' ? [18,19,23,25] : [15,16,23,25]; break;
					case '25': available_hexes = board === 'desert' ? [19,20,24,26] : [16,17,24,26]; break;
					case '26': available_hexes = board === 'desert' ? [20,21,25] : [17,18,25,27]; break;
					case '27': available_hexes = board === 'desert' ? [22,23,28] : [18,19,26]; break;
					case '28': available_hexes = board === 'desert' ? [23,24,27,29] : [20,21,29]; break;
					case '29': available_hexes = board === 'desert' ? [24,25,28,30] : [21,22,28,30]; break;
					case '30': available_hexes = board === 'desert' ? [25,26,29] : [22,23,29,31]; break;
					case '31': available_hexes = board === 'desert' ? [27,28] : [23,24,30,32]; break;
					case '32': available_hexes = board === 'desert' ? [29,30] : [24,25,31,33]; break;
					case '33': available_hexes = [25,26,32,34]; break;
					case '34': available_hexes = [26,27,33]; break;
					case '35': available_hexes = [28,29,36]; break;
					case '36': available_hexes = [29,30,35,37]; break;
					case '37': available_hexes = [30,31,36,38]; break;
					case '38': available_hexes = [31,32,37,39]; break;
					case '39': available_hexes = [32,33,38,40]; break;
					case '40': available_hexes = [33,34,39]; break;
					case '41': available_hexes = [35,36]; break;
					case '42': available_hexes = [37,38]; break;
					case '43': available_hexes = [39,40]; break;
				}
				return available_hexes;
			},

			fitStringToCell(text, cell, targetPercentage = 0.95) {

				const cellWidth = cell.offsetWidth;
				const cellHeight = cell.offsetHeight;
				const padding = parseFloat(window.getComputedStyle(cell).paddingLeft) + parseFloat(window.getComputedStyle(cell).paddingRight);
				const paddingHeight = parseFloat(window.getComputedStyle(cell).paddingTop) + parseFloat(window.getComputedStyle(cell).paddingBottom);
			  
				const tempSpan = document.createElement('span');
				tempSpan.style.visibility = 'hidden';
				tempSpan.style.whiteSpace = 'nowrap';
				tempSpan.textContent = text;
				cell.appendChild(tempSpan);
			  
				let fontSize = parseFloat(window.getComputedStyle(cell).fontSize);
				const originalFontSize = fontSize;
			  
				while (tempSpan.offsetWidth > (cellWidth - padding) * targetPercentage || tempSpan.offsetHeight > (cellHeight - paddingHeight) * targetPercentage) {
					fontSize -= 1;
					tempSpan.style.fontSize = fontSize + 'px';
					if (fontSize < 1) {
						tempSpan.style.fontSize = originalFontSize;
						break;
					}
				}
			  
				cell.style.fontSize = tempSpan.style.fontSize;
				cell.textContent = text;
			},
		});
	});