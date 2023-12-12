define([ "dojo", "dojo/_base/declare", "ebg/core/gamegui"], 
	function( dojo, declare ) {
		return declare("bgagame.utils", null, {
			constructor: function() { 
				console.log('utils constructor');

				this.log_span_num = 0;
			},

			// animations
	        moveToNewParent: function(ele, destination, adjust=null) { // takes nodes
	            const beforeAnimation = (ele, destination, adjust) => {

	            	const zIndex = (ele.style.zIndex != '') ? Number(ele.style.zIndex) : 0;
	            	ele.style.zIndex = String(zIndex + 1000);
	                const parentOriginal = ele.parentElement;
	                parentOriginal.appendChild(ele); //put back to where it was
	                const x0 = ele.getBoundingClientRect().left;
	                const y0 = ele.getBoundingClientRect().top;

	                destination.appendChild(ele);
	                const x1 = ele.getBoundingClientRect().left;
	                const y1 = ele.getBoundingClientRect().top;
	                parentOriginal.appendChild(ele);

	                if (adjust === 1) {
	                    ele.style.setProperty('--dx', (y1 - y0) + 'px');
	                    ele.style.setProperty('--dy', (x1 - x0) + 'px');
	                } else if (adjust === 2) {
	                    ele.style.setProperty('--dx', (y1 - y0 +16.4973) + 'px');
	                    ele.style.setProperty('--dy', (x0 - x1 +16.4973) + 'px');
	                } else if (adjust === 3) {
	                	ele.style.setProperty('--dx', (x1 - x0 +16.4973) + 'px');
	                    ele.style.setProperty('--dy', (y1 - y0 -16.4973) + 'px');
	                } else if (adjust === 4) {
	                	ele.style.setProperty('--dx', (y1 - y0 - 10) + 'px');
	                	ele.style.setProperty('--dy', (y1 - y0) + 'px');
	                } else {
	                    ele.style.setProperty('--dx', (x1 - x0) + 'px');
	                    ele.style.setProperty('--dy', (y1 - y0) + 'px');
	                }
	            }

	            const afterAnimation = (ele, destination) => {
	                destination.appendChild(ele);
	                ele.style.zIndex = '';
	            }

	            const func = {
	                before: beforeAnimation,
	                after: afterAnimation
	            }

	            return func;
	        },

	        animationPromise: function(ele, class_name, type, func=null, destroy=false, remove_class=false, ...params) {

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
	            })
	        },
	        // end animations

	        resizeHand: function(asset_or_token='', added_to_hand=[]) {

	        	const old_card_eles = dojo.query('#assets_wrap .asset');
	        	const new_cards = asset_or_token === 'asset' ? [...added_to_hand] : [];
	        	const old_token_eles = dojo.query('#assets_wrap .summit_beta');
	        	const new_token = asset_or_token === 'token' ? 1 : 0;
	        	const card_sum = old_card_eles.length + new_cards.length;
	        	const token_num = old_token_eles.length + new_token;
	        	const token_sum = token_num * 1.1742;
	        	rows = Math.ceil((card_sum + token_sum) / 7);

	        	// resize hand area
	        	$('hand_ratio').className = '';
	            $('assets_wrap').className = '';
	            $('hand_objectives').className = '';
	            
	            switch (true) {
	                case rows === 1 || rows === 0: 
	                    break;

	                case rows === 2:
	                    $('hand_ratio').classList.add('hand_ratio_two_rows');
	                    $('assets_wrap').classList.add('assets_wrap_two_rows');
	                    $('hand_objectives').classList.add('hand_objectives_two_rows');
	                    dojo.query('#assets_wrap > .summit_beta').forEach((ele) => {
	                        ele.classList.add('summit_beta_two_rows');
	                    });
	                    break;

	                case rows === 3:
	                    $('hand_ratio').classList.add('hand_ratio_three_rows');
	                    $('assets_wrap').classList.add('assets_wrap_three_rows');
	                    $('hand_objectives').classList.add('hand_objectives_three_rows');
	                    dojo.query('#assets_wrap > .summit_beta').forEach((ele) => {
	                        ele.classList.add('summit_beta_three_rows');
	                    });
	                    break;

	                case rows === 4:
	                    $('hand_ratio').classList.add('hand_ratio_four_rows');
	                    $('assets_wrap').classList.add('assets_wrap_four_rows');
	                    $('hand_objectives').classList.add('hand_objectives_four_rows');
	                    dojo.query('#assets_wrap > .summit_beta').forEach((ele) => {
	                        ele.classList.add('summit_beta_four_rows');
	                    });
	                    break;
	            }

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
	        	const type_list = all_cards.map(array => array[1]);
	        	const type_counts = { 'gear': 0, 'face': 0, 'crack': 0, 'slab': 0 };
	        	type_list.forEach((type) => { type_counts[type] = (type_counts[type]) + 1; });
	        	let gear = 1;
	        	let face = type_counts['gear']+1;
	        	let crack = face + type_counts['face'];
	        	let slab = crack + type_counts['crack'];

	        	const old_card_slots = [], new_card_slots = {};

	        	for (let card of old_cards) {
	        		let slot;
	        		switch (card[1]) {
	        			case 'gear': slot = gear; gear++; break;
	        			case 'face': slot = face; face++; break;
	        			case 'crack': slot = crack; crack++; break;
	        			case 'slab': slot = slab; slab++; break;
	        		}
	        		old_card_slots.push([card[0], slot]);
	        	}

	        	for (let card of new_cards) {
	        		let slot;
	        		switch (card[1]) {
	        			case 'gear': slot = gear; gear++; break;
	        			case 'face': slot = face; face++; break;
	        			case 'crack': slot = crack; crack++; break;
	        			case 'slab': slot = slab; slab++; break;
	        		}
	        		new_card_slots[card[0]] = slot;
	        	}

	            for (let i=1; i<=card_sum; i++) {
	                if (!$(`hand_asset_${i}`)) {
						dojo.place(`<div id="hand_asset_${i}" class="hand_asset_wrap" style="z-index: ${i};"></div>`, 'assets_wrap');
	                }
	            }
	            for (const card of old_card_slots) {
	            	const card_ele = $(`asset_card_${card[0]}`);
	            	const slot = $(`hand_asset_${card[1]}`);
	            	slot.append(card_ele);
	            }

	            // if token is added, add new slot and return token slot number
	            for (let i=1; i<=token_num; i++) {
	                if (!$(`hand_token_${i}`)) {
						dojo.place(`<div id="hand_token_${i}" class="hand_token_wrap"></div>`, 'assets_wrap');
	                }
	            }
	            let new_token_slot = null;
				if (asset_or_token === 'token') {
					slot_num = dojo.query('.hand_token_wrap').length;
					new_token_slot = $(`hand_token_${slot_num}`);
				}	            

				// upon cards or tokens leaving hand
	            if (new_cards.length === 0 && asset_or_token === '') {
	            	const existing_hand = dojo.query('.hand_asset_wrap');
		            for (let i=0, j=1; i<=existing_hand.length-1; i++) {
		            	if (!existing_hand[i].firstChild) { existing_hand[i].remove(); } 
		            	else { 
		            		existing_hand[i].id = `hand_asset_${j}`;
		            		j++;
		            	}
		            }
	            }

	            if (new_token === 0 && asset_or_token === '') {
	            	const existing_hand = dojo.query('.hand_token_wrap');
		            for (let i=0, j=1; i<=existing_hand.length-1; i++) {
		            	if (!existing_hand[i].firstChild) { existing_hand[i].remove(); } 
		            	else { 
		            		existing_hand[i].id = `hand_token_${j}`;
		            		j++;
		            	}
		            }
	            }

	            if (asset_or_token === 'asset') { return new_card_slots; }
	            else if (asset_or_token === 'token') { return new_token_slot; }
	        },

	        handCount: function(player_id, hand_count) {
	            $(`hand_num_${player_id}`).innerHTML = hand_count;
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

	        pitchTooltip: function(ele, pitch_type, tokens=false) {
	        	const pitch = gameui.gamedatas.pitches[pitch_type];
	            const bg_pos = pitch['x_y'];
	            const title = _(pitch['description']);
	            const type = _(pitch['type_description']);
	            let skill_tokens = '';
	            if (tokens) {
	            	for (token of tokens) {
	            		console.log('token = ');
	            		console.log(token);
	            		console.log('token.classList =');
	            		console.log(token.classList);
	            		let clone = token.cloneNode(true);
	            		console.log('clone.classList before, after =');
	            		console.log(clone.classList);
	            		clone.classList.add('pitch_token_wrapper_tt');
	            		console.log(clone.classList);
	            		console.log('clone.outerHTML =');
	            		console.log(clone.outerHTML);
	            		skill_tokens += clone.outerHTML;
	            	}
	            }
	            const html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
	                          <div class="pitch pitch_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;">
	                          ${skill_tokens}</div>
	                          <div> Type: ${type} / Value: ${gameui.gamedatas.pitches[pitch_type]['value']}</div>`;
	            gameui.addTooltipHtml(ele, html, 1000);
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
	        	const html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
	        				  ${log_pic}
	        				  <div style="text-align: center;"><i>${effect_a_flavor}</i></div><br><div>${effect_a}</div>
	        				  <div style="text-align: center; position: relative; bottom: 4px;">_________________________</div>
	        				  <div style="text-align: center;"><i>${effect_b_flavor}</i></div><br><div>${effect_b}</div>`;
	        	gameui.addTooltipHtml(ele, html, 1000);
	        },

	        summitBetaTooltip: function(ele, summit_beta_type, log=false) {
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

	        addTooltipsToLog: function() {
	            const item_elements = dojo.query('.item_tooltip');
	            Array.from(item_elements).forEach((ele) => {
	                const ele_id = ele.id;

	                if (ele.classList.contains('asset_tt')) {
	                    const asset_type = ele_id.slice(-3).replace(/^\D+/g, '');
	                    this.assetTooltip(ele_id, asset_type);
	                }
	                else if (ele.classList.contains('pitch_tt')) {
	                    const pitch_type = ele_id.slice(-2).replace(/^\D+/g, '');
	                    this.pitchTooltip(ele_id, pitch_type);
	                }

	                else if (ele.classList.contains('climbing_tt')) {
	                	const climbing_type = ele_id.slice(-3).replace(/^\D+/g, '');
	                	this.climbingTooltip(ele_id, climbing_type, true);
	                }

	                else if (ele.classList.contains('summit_beta_tt')) {
	                	const summit_beta_type = ele_id.slice(-3).replace(/^\D+/g, '');
	                	this.summitBetaTooltip(ele_id, summit_beta_type);
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
	            const colored_name_regex = /@[\w\d]+/g;
	            const assets_to_replace = log_entry.matchAll(asset_regex);
	            const pitch_to_replace = log_entry.match(pitch_regex);
	            const climbing_to_replace = log_entry.match(climbing_regex);
	            const summit_beta_to_replace = log_entry.matchAll(summit_beta_regex);
	            const names_to_replace = log_entry.matchAll(colored_name_regex);

	            for (let asset of assets_to_replace) {
	                const match = asset[0];
	                const left_parenthesis = match.indexOf('(');
	                const asset_name = match.slice(1, left_parenthesis);
	                const asset_type = match.slice(left_parenthesis+1, match.length-2);

	                const asset_span = this.getTooltipForLog(asset_type, 'asset');
	                log_entry = log_entry.replace(match, asset_span);
	            }

	            if (pitch_to_replace) {
	                const left_parenthesis = pitch_to_replace[0].indexOf('(');
	                const pitch_name = pitch_to_replace[0].slice(1, left_parenthesis);
	                const pitch_type = pitch_to_replace[0].slice(left_parenthesis+1, pitch_to_replace[0].length-2);

	                const pitch_span = this.getTooltipForLog(pitch_type, 'pitch');
	                log_entry = log_entry.replace(pitch_to_replace, pitch_span);
	            }

	            if (climbing_to_replace) {
	            	const left_parenthesis = climbing_to_replace[0].indexOf('(');
	            	const climbing_name = climbing_to_replace[0].slice(1, left_parenthesis);
	            	const climbing_type = climbing_to_replace[0].slice(left_parenthesis+1, climbing_to_replace[0].length-2);

	            	const climbing_span = this.getTooltipForLog(climbing_type, 'climbing');
	            	log_entry = log_entry.replace(climbing_to_replace, climbing_span);
	            }

	            for (let summit_beta of summit_beta_to_replace) {
	            	const left_parenthesis = summit_beta[0].indexOf('(');
	            	const summit_beta_name = summit_beta[0].slice(1, left_parenthesis);
	            	const summit_beta_type = summit_beta[0].slice(left_parenthesis+1, summit_beta[0].length-2);

	            	const summit_beta_span = this.getTooltipForLog(summit_beta_type, 'summit_beta');
	            	log_entry = log_entry.replace(summit_beta[0], summit_beta_span);
	            }

	            for (let match of names_to_replace) {
	                const name = match[0].slice(1);
	                const player = Object.values(gameui.gamedatas.players).find(entry => entry.name === name);

	                const name_span = gameui.format_block('jstpl_colored_name', {
				                    		player_id : player.id,
				                    		color : player.color,
				                    		player_name : name,
				                      });

	                log_entry = log_entry.replace(match, name_span);
	            }

	            return log_entry;
	        },

	        getCurrentPlayerResources: function(player_id) {
	        	let resources = {};

	        	resources.water = Number($(`water_num_${player_id}`).innerText);
	        	resources.psych = Number($(`psych_num_${player_id}`).innerText);

	        	resources.skills = {};
	        	resources.skills.gear = Number($(`gear_num_${player_id}`).innerText);
	        	resources.skills.face = Number($(`face_num_${player_id}`).innerText);
	        	resources.skills.crack = Number($(`crack_num_${player_id}`).innerText);
	        	resources.skills.slab = Number($(`slab_num_${player_id}`).innerText);

	        	resources.any_asset = resources.skills.gear + resources.skills.face + resources.skills.crack + resources.skills.slab;
	        	resources.any_skill = resources.any_asset - resources.skills.gear;

	        	resources.techniques = {};
	        	resources.techniques.power = Number($(`power_num_${player_id}`).innerText);
	        	resources.techniques.balance = Number($(`balance_num_${player_id}`).innerText);
	        	resources.techniques.precision = Number($(`precision_num_${player_id}`).innerText);
	        	resources.techniques.pain_tolerance = Number($(`pain_tolerance_num_${player_id}`).innerText);

	        	resources.asset_board = {};
	        	const asset_board = $(`asset_board_${player_id}`);
	        	for (const type of asset_board.children) {

	        		const played_assets = dojo.query(`#${type.id} .played_asset`);
	        		const type_str = type.id.slice(-5).replace(/_/g, '');
	        		resources.asset_board[type_str] = played_assets.length;
	        	}

	        	return resources;
	        },

	        updatePlayerResources: function (player_id, updated_resources) {
	            dojo.query(`#player_board_${player_id} .resource`).forEach((ele) => {
	                const resource = ele.id.substring(0, ele.id.indexOf('_num'));
	                if (updated_resources.hasOwnProperty('skills') && ['gear', 'face', 'crack', 'slab'].includes(resource)) {
		                ele.innerHTML = updated_resources['skills'][resource]; }

		            else if (updated_resources.hasOwnProperty('techniques') && ['precision', 'balance', 'pain_tolerance', 'power'].includes(resource)) {
		                ele.innerHTML = updated_resources['techniques'][resource]; }

		            const cube_wrap_length = dojo.query(`#player_${player_id} .cube_wrap`).length || 2;
		            const max_water_psych = cube_wrap_length / 2 - 1;
		            if (updated_resources['water'] > max_water_psych) { updated_resources['water'] = max_water_psych; }
		            if (updated_resources['psych'] > max_water_psych) { updated_resources['psych'] = max_water_psych; }
		            else if (updated_resources.hasOwnProperty('water') && resource === 'water') { ele.innerHTML = updated_resources['water']; }
		            else if (updated_resources.hasOwnProperty('psych') && resource === 'psych') { ele.innerHTML = updated_resources['psych']; }
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

	        getCurrentPitch: function(player_id) {
	        	const meeple_parent = dojo.query(`#meeple_${player_id}`)[0].parentElement;
	        	if (meeple_parent.parentElement.id != `player_board_${player_id}`) { return meeple_parent.id.slice(-2).replace(/^\D+/g, ''); }
	        	else { return '0'; }
	        },

	        getRopeIdentifier: function(/*strings*/ pitch_1, pitch_2, board) {
	        	let ledge_adjacent, lower_ledge, upper_ledge;
	        	if (board === 'desert') {
	                ledge_adjacent = ['16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26'];
	                lower_ledge = ['16', '17', '18', '19', '20', '21'];
	                upper_ledge = ['22', '23', '24', '25', '26'];
	            } else if (board === 'forest') {
	                ledge_adjacent = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34'];
	                lower_ledge = ['20', '21', '22', '23', '24', '25', '26', '27'];
	                upper_ledge = ['28', '29', '30', '31', '32', '33', '34'];
	            }

	            const difference = Math.abs(Number(pitch_1) - Number(pitch_2));

	            if ([pitch_1, pitch_2].every(entry => ledge_adjacent.includes(entry)) && difference > 1) {
                    if (upper_ledge.includes(pitch_1)) {
                    	if (difference > 5) { pitch_2 = 55; } else { pitch_2 = 54; }
                    } else if (lower_ledge.includes(pitch_1)) {
                    	if (difference > 5) { pitch_2 = 52; } else { pitch_2 = 51; }
                    }
                }
                return [pitch_1, pitch_2].sort();
	    	},

	        getRopeType: function(/*array*/ rope_identifier, /*string*/ board) {
	        	if (rope_identifier[0] === '0' || rope_identifier[1] === '55') { return 'mini_5'; }
	        	else if (rope_identifier[1] === '51') { return 'mini_1'; }
	        	else if (rope_identifier[1] === '52') { return 'mini_2'; }
	        	else if (rope_identifier[1] === '54') { return 'mini_4'; }
	        	else if (board === 'desert') {
	        		if ([ [2,9], [3,10], [4,11], [5,12], [6,13], [7,14], [8,15], [10,16], [11,17], [12,18], 
		        		 [13,19], [14,20], [15,21], [23,27], [24,28], [25,29], [26,30], [28,31], 
		        		 [30,32] ].includes(rope_identifier)) { return 'rope_1'; }
		        	else if ([ [1,9], [2,10], [3,11], [4,12], [5,13], [6,14], [7,15], [9,16], [10,17], [11,18], 
		        			  [12,19], [13,20], [14,21], [22,27], [23,28], [24,29], [25,30], [27,31], 
		        			  [29,32] ].includes(rope_identifier)) { return 'rope_2'; }
		        	else if ([ [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [9,10], [10,11], [11,12], [12,13], 
		        			  [13,14], [14,15], [16,17], [17,18], [18,19], [19,20], [20,21], [22,23], [23,24], 
		        			  [24,25], [25,26], [27,28], [28,29], [29,30] ].includes(rope_identifier)) { return 'rope_3'; }
	        	} else if (board === 'forest') {
	        		if ([ [2,11], [3,12], [4,13], [5,14], [6,15], [7,16], [8,17], [9,18], [10,19], [12,20], 
	        			 [13,21], [14,22], [15,23], [16,24], [17,25], [18,26], [19,27], [29,35], [30,36], 
	        			 [31,37], [32,38], [33,39], [34,40], [36,41], [38,42], 
	        			 [40,43] ].includes(rope_identifier)) { return 'rope_1'; }
	        		else if ([ [1,11], [2,12], [3,13], [4,14], [5,15], [6,16], [7,17], [8,18], [9,19], [11,20], 
	        			[12,21], [13,22], [13,23], [15,24], [16,25], [17,26], [18,27], [28,35], [29,36], [30,37], 
	        			[31,38], [32,39], [33,40], [35,41], [37,42], 
	        			[39,43] ].includes(rope_identifier)) { return 'rope_2'; }
	        		else if ([ [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9], [9,10], [11,12], [12,13], 
	        			[13,14], [14,15], [15,16], [16,17], [17,18], [18,19], [20,21], [21,22], [22,23], [23,24], 
	        			[24,25], [25,26], [26,27], [28,29], [29,30], [30,31], [31,32], [32,33], [33,34], [35,36], 
	        			[36,37], [37,38], [38,39], [39,40] ].includes(rope_identifier)) { return 'rope_3'; }
	        	}

	        },

	        updateTitlebar: function(message) {
	        	$('gameaction_status').innerHTML = _(message);
                $('pagemaintitletext').innerHTML = _(message);
	        },
	        
	        displayRequirements: function(resources, requirements, others=false) {

	        	dojo.query('.requirement_wrap').forEach((ele) => { ele.remove(); });
	        	dojo.query('.requirement_wrap_cards').forEach((ele) => { ele.remove(); });

	        	let temp_resources = JSON.parse(JSON.stringify(resources)); // JSON method for deep copying an object included nested objects

	        	if (!others) {
	        		Object.keys(requirements).forEach(function(type) {
		                const num = requirements[type];
		                for (let i=1; i<=num; i++) {

		                    const requirement_wrap = document.createElement('div');
		                    const wrap_type = ['give_assets', 'any_asset'].includes(type) ? 'requirement_wrap_cards' : 'requirement_wrap';
		                    requirement_wrap.classList.add(wrap_type);
		                    const requirement_border = document.createElement('div');
		                    const requirement = document.createElement('div');

		                    if (['gear', 'face', 'crack', 'slab', 'any_skill'].includes(type)) { requirement.classList.add('skills_and_techniques'); }
		                    else if (['water', 'psych'].includes(type)) { requirement.classList.add('water_psych'); }
		                    else if (['give_assets', 'any_asset'].includes(type)) { requirement.classList.add('give_assets'); }

		                    const non_skills = ['water', 'psych', 'any_skill', 'any_asset'];
		                    let type_availability = (non_skills.includes(type)) ? temp_resources[type] : temp_resources['skills'][type];
		                    if (type === 'give_assets') { type_availability = temp_resources['any_asset']; }

		                    if (1 <= type_availability) {
		                    	if (non_skills.includes(type)) { temp_resources[type]--; }
		                    	else {
		                    		temp_resources['skills'][type]--;
		                    		temp_resources['any_skill']--;
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
		                    const last_button = $('generalactions').lastElementChild;
		                    last_button.insertAdjacentElement('beforebegin', requirement_wrap);
		                    last_button.style.marginLeft = '8px';
		                }
		            });
	        	}
	        },

	        notif_confirmRequirements: async function (notif) {
	        	return new Promise(async (resolve) => {

		            gameui.selected_pitch = dojo.query(`.p${notif.args.selected_pitch}`)[0];
		            const player_id = notif.args.player_id;
		            const player = gameui.gamedatas.players[player_id];
		            const character_id = player.character;

		            const animateRopeAndMeepleAndCubes = async () => {
		                return new Promise(async (resolve) =>{

		                    const rope_num = gameui.gamedatas.pitch_tracker[player_id].length;
		                    const current_pitch = this.getCurrentPitch(player_id);
		                    const destination_num = gameui.selected_pitch.id.slice(-2).replace(/^\D+/g, '');
		                    const destination = $(`pitch_${destination_num}`);
		                    const rope_identifier = [current_pitch, destination].sort();
		                    const rope_type = this.getRopeType(rope_identifier, gameui.gamedatas.board);
		                    const rope_color = gameui.gamedatas.characters[character_id]['rx_y']['board'];
		                    const meeple = $(`meeple_${player_id}`);
		                    const character_name = gameui.gamedatas.characters[character_id]['name'];

		                    let rotation = null;
		                    let height = null;
		                    switch (rope_type) {
		                        case 'rope_1':
		                            rotation = '285deg';
		                            height = '275%';
		                            break;
		                        case 'rope_2':
		                            rotation = '-15deg';
		                            height = '275%';
		                            break;
		                        case 'rope_3':
		                            rotation = '45deg';
		                            height = '275%';
		                            break;
		                        case 'mini_1':
		                            rotation = '285deg';
		                            height = '195%';
		                            break;
		                        case 'mini_2':
		                            rotation = '-15deg';
		                            height = '195%';
		                            break;
		                        case 'mini_4':
		                            rotation = '105deg';
		                            height = '195%';
		                            break;
		                        case 'mini_5':
		                            rotation = '210deg';
		                            height = '195%';
		                            break;
		                    }

		                    const rope_block = gameui.format_block('jstpl_rope', {
		                        player_id : player_id,
		                        rope_num : rope_num,
		                        extra_classes : '',
		                        rX : rope_color[0],
		                        rY : rope_color[1],
		                    });

		                    // update water and psych cubes
		                    const water = -notif.args.water_psych_requirements['water'];
		                    const psych = -notif.args.water_psych_requirements['psych'];
		                    await this.updateWaterPsych(player_id, water, psych);

		                    if (this.shouldAnimate()) {
		                        const rope_ele = dojo.place(rope_block, `${player_id}_rope_counter`);

		                        rope_ele.style.transform = 'rotate(45deg)';
		                        rope_ele.style.setProperty('--dr', rotation);
		                        rope_ele.style.setProperty('--dh', height);

		                        const rope_and_meeple_anim = [];
		                        let args = [rope_ele, destination];
		                        rope_and_meeple_anim.push(this.animationPromise.bind(null, rope_ele, 'rope_counter_to_pitch', 'anim', this.moveToNewParent(), false, true, ...args));
		                        args = [meeple, destination];
		                        rope_and_meeple_anim.push(this.animationPromise.bind(null, meeple, 'meeple_panel_to_pitch', 'anim', this.moveToNewParent(), false, true, ...args));

		                        $('gameaction_status').innerHTML = 'Placing Rope and Climber';
	                            $('pagemaintitletext').innerHTML = 'Placing Rope and Climber';
		                        Promise.all(rope_and_meeple_anim.map((func) => { return func(); }))
		                        .then(() => {
		                            $(`${player_id}_rope_${rope_num}`).style.setProperty('transform', '');
		                            $(`${player_id}_rope_${rope_num}`).classList.add(`${rope_type}`);
		                            resolve();
		                        });

		                    } else { // shouldn't animate

		                        const rope_ele = dojo.place(rope_block, destination.id);
		                        $(`${player_id}_rope_${rope_num}`).classList.add(`${rope_type}`);
		                        destination.append(meeple);
		                        const old_water_num = dojo.query(`#water_num_${player_id}`)[0].innerHTML;
	            				const old_psych_num = dojo.query(`#psych_num_${player_id}`)[0].innerHTML;
		                        if (gameui.old_water_num != this.new_water_num) { this.new_water_wrap.append(this.water_cube); }
		                        if (gameui.old_psych_num != this.new_psych_num) { this.new_psych_wrap.append(this.psych_cube); }
		                        resolve();
		                    }
		                })
		            }
		            await animateRopeAndMeepleAndCubes();

		            const rope_num = gameui.gamedatas.pitch_tracker[player_id].length;
		            $(`rope_num_${player_id}`).innerHTML = `${8 - rope_num}`;

		            this.addTooltipsToLog();
		            resolve();
	        	});
	        },

	        retractClimbingCard: async function() {
	        	return new Promise(async (resolve) => {
	        		const climbing_card_ele = $('climbing_slot').firstElementChild;
		        	const args = [climbing_card_ele, $('climbing_discard_straightened')];
		        	$('climbing_slot').classList.remove('dim_bg');
		        	dojo.query('.selected_choice').forEach((ele) => { ele.classList.remove('selected_choice'); });

		        	if (this.shouldAnimate()) {
		        		await this.animationPromise(climbing_card_ele, 'climbing_card_to_discard', 'anim', this.moveToNewParent(), false, true, ...args);
		        	} else { $('climbing_discard_straightened').append(climbing_card_ele); }

		        	$('climbing_slot').style.display = 'none';
		        	resolve();
	        	})
	        },

	        // **** Climbing effects ****

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
	            						const max_water_psych = dojo.query(`#player_${player_id} .cube_wrap`).length / 2;
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
	            					await this.updateWaterPsych(player, water, psych);
	            					this.updatePlayerResources(player, {'water' : new_water, 'psych' : new_psych});
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
		        			if (player_id === gameui.player_id.toString()) {
		        				const type_arg = notif.args.portaledge_type_arg;
				                const id = notif.args.portaledge_draw.id;
				                const hand_count = notif.args.hand_count
				                await this.portaledge(player_id, [type_arg], [id], true, hand_count);
			        			resolve();
			        			break;
		        			} else {
		        				const portaledge_type = notif.args.portaledge_type;
		        				const hand_count = notif.args.hand_count;
			        			await this.portaledgeOpponent(player_id, {[portaledge_type]: 1}, true, hand_count);
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
		        	let cube = null;
		        	const self = this;

		        	const update = async function(water_or_psych) {
		        		return new Promise(async (resolve) => {
		        			self.updateTitlebar(`Adjusting ${water_or_psych}`);
			        		const num = water_or_psych == 'water' ? water : psych;
			        		const abbreviation = water_or_psych == 'water' ? 'w' : 'p';
			        		const cube = dojo.query(`#player_${player_id} .cb_${water_or_psych}`)[0];
			        		const current_loc = Number(cube.parentElement.id.at(-1));
			        		const new_num = current_loc + num;
			        		const max_num = dojo.query(`#player_${player_id} .cube_wrap`).length / 2 - 1;
			        		const new_loc = new_num <= max_num ? new_num : max_num;
			        		const destination = dojo.query(`#player_${player_id} .cb_${abbreviation}_${new_loc}`)[0];
			        		if (destination && self.shouldAnimate()) {
			        			const args = [cube, destination];
			        			await self.animationPromise(cube, 'water_psych_cubes', 'anim', self.moveToNewParent(), false, true, ...args);
			        		} else if (destination) { destination.append(cube); }
			        		$(`${water_or_psych}_num_${player_id}`).innerHTML = new_loc;
			        		resolve();
		        		});
		        	}

		        	if (water < 0) { await update('water'); }
		        	if (psych < 0) { await update('psych'); }
		        	if (water > 0) { await update('water'); }
		        	if (psych > 0) { await update('psych'); }

		            resolve();
		        })
	        },

	        portaledge: async function(player_id, type_args, ids, auto=false, hand_count, climbing_card_info=null, share=false) {
	        	return new Promise(async resolve => {

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
	        			cards.push([card, display_slot, hand_slot]);
	        			const portaledge_asset_div = dojo.place(gameui.format_block('jstpl_flip_card', {
	        				card_id : id,
	        				extra_classes : '',
	        				back_type : 'asset asset_back_for_flip',
	        				front_type : 'asset',
	        				cX : asset.x_y[0],
	        				cY : asset.x_y[1],
	        			}), `porta${type}`);

	        			let args = [portaledge_asset_div, display_slot];
	        			asset_portaledge_to_display.push(this.animationPromise.bind(null, portaledge_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true));
	        			asset_portaledge_to_display.push(this.animationPromise.bind(null, portaledge_asset_div, 'asset_portaledge_to_display', 'anim', this.moveToNewParent(), true, false, ...args));

	        		}

	        		if (this.shouldAnimate()) {

	        			this.updateTitlebar('Drawing from Portaledge');
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
	                    Promise.all(asset_portaledge_to_display.map((func) => { return func(); }))
	                    .then(async () => {
	                    	if (share) { await (async function() { return new Promise(resolve => setTimeout(resolve, 500)) })(); }
	                    	for (card of cards) {
	                    		const card_ele = dojo.place(card[0], card[1]);
	                    		args = [card_ele, card[2]];
	                    		asset_display_to_hand.push(this.animationPromise.bind(null, card_ele, 'asset_display_to_hand', 'anim', this.moveToNewParent(), false, true, ...args));
	                    	}
	                    })
	                    .then(async () => {
	                    	await this.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
	                    	portaledge.style.marginTop = '-36.4061%';
			                portaledge.style.display = 'none';
	                    })
	                    .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
	                    .then(() => { return Promise.all(asset_display_to_hand.map((func) => { return func(); })); })
	                    .then(() => {
	                    	$('asset_deck_draw').style.display = 'none';

	                    	const player_resources = this.getCurrentPlayerResources(player_id);
	                    	for (let type of card_asset_types) {
	                    		player_resources.skills[type]++;
	                    	}
	                    	for (let type of card_technique_types) {
	                    		player_resources.techniques[type]++;
	                    	}
	                    	this.updatePlayerResources(player_id, player_resources);
	                    	this.handCount(player_id, hand_count);
			                resolve();
	                    });

	                } else { // shouldn't animate
	                	cards_for_hand.map(card => { dojo.place(card[0], card[1]); });

	                	dojo.query('.portaledge > .cursor').forEach(ele => { ele.remove(); });
	                    dojo.query('.portaledge > .draw_num').forEach(ele => { ele.remove(); });

	                	if (climbing_card_info && climbing_card_info.portaledge_all
	                	&& climbing_card_info.finished_portaledge.length+1 == Object.keys(gameui.gamedatas.players).length) {
	                		portaledge.style.marginTop = '-36.4061%';
			                portaledge.style.display = 'none';
	                	} else if (!climbing_card_info || !climbing_card_info.portaledge_all) {
	                		portaledge.style.marginTop = '-36.4061%';
			                portaledge.style.display = 'none';
	                	}
	                	const player_resources = this.getCurrentPlayerResources(player_id);
                    	for (let type of card_asset_types) {
                    		player_resources.skills[type]++;
                    	}
                    	for (let type of card_technique_types) {
	                    		player_resources.techniques[type]++;
	                    	}
                    	this.updatePlayerResources(player_id, player_resources);
                    	this.handCount(player_id, hand_count);
	                	resolve();
	                }
	            })
	        },

	        portaledgeOpponent: async function(player_id, asset_types, auto=false, hand_count, climbing_card_info=null, share=false) {
	        	return new Promise (async resolve => {
	                if (this.shouldAnimate()) {
	                	this.updateTitlebar('Drawing from Portaledge');
	        			const portaledge = $('portaledge');

	        			if (auto) {
	        				portaledge.style.display = 'block';
		                    await this.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
		                    portaledge.style.marginTop = 0;
		                    await (async function() { return new Promise(resolve => setTimeout(resolve, 300)) })();
	        			}

	        			let asset_portaledge_to_counter = [];
	        			const hand_counter = $(`hand_counter_${player_id}`);
	        			let total_draw = Object.values(asset_types).reduce((acc, value) => acc + value);
	        			let current_draw = 1;

	        			await (async () => {
	        				return new Promise(async (resolve) => {
	        					for (const [type, value] of Object.entries(asset_types)) {
			        				for (let i=1; i<=value; i++) {

			        					const asset_back = dojo.place(gameui.format_block('jstpl_asset_card', {
					                    				   CARD_ID : `00${i}`,
					                    				   EXTRA_CLASSES : '',
					                    				   acX : 0,
					                    				   acY : 0,
					                    }), `porta${type}`);

					                    const args = [asset_back, hand_counter];
					                    this.animationPromise(asset_back, 'asset_portaledge_to_counter', 'anim', this.moveToNewParent(), true, false, ...args);
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

	                    await (async function() { return new Promise(resolve => setTimeout(resolve, 300)) })();
	                    if (share) { await (async function() { return new Promise(resolve => setTimeout(resolve, 500)) })(); }

	                    if (climbing_card_info && climbing_card_info.portaledge_all
	                    	&& climbing_card_info.finished_portaledge.length+1 == Object.keys(gameui.gamedatas.players).length) {
	                    		await this.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
	                    		portaledge.style.marginTop = '-36.4061%';
			                	portaledge.style.display = 'none';

	                    	} else if (!climbing_card_info || !climbing_card_info.portaledge_all) {
	                    		await this.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
	                    		portaledge.style.marginTop = '-36.4061%';
			                	portaledge.style.display = 'none';
	                    	}

	                    resolve();

	                } else { // shouldn't animate
	                	if (climbing_card_info && climbing_card_info.portaledge_all
	                	&& climbing_card_info.finished_portaledge.length+1 == Object.keys(gameui.gamedatas.players).length) {
	                		portaledge.style.marginTop = '-36.4061%';
			                portaledge.style.display = 'none';
	                	} else if (!climbing_card_info || !climbing_card_info.portaledge_all) {
	                		portaledge.style.marginTop = '-36.4061%';
			                portaledge.style.display = 'none';
	                	}
	                	this.handCount(player_id, hand_count);

	                	resolve();
	                }
	        	})
	        },

	        repositionAssetBoard: function(player_id) {

	        	const asset_board = $(`asset_board_${player_id}`);
	        	for (const type of asset_board.children) {

	        		let played_assets = dojo.query(`#${type.id} .played_asset`);
	        		for (const wrapper of type.children) {
	        			if (played_assets.length > 0) {
	        				wrapper.append(played_assets.shift());
	        			}
	        		}
	        	}
	        },
		});

	});