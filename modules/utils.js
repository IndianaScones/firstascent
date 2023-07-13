define([ "dojo", "dojo/_base/declare", "ebg/core/gamegui"], 
	function( dojo, declare ) {
		return declare("bgagame.utils", null, {
			constructor: function() { console.log('utils constructor'); },

			// animations
	        moveToNewParent: function(ele, destination, invert=null) { // takes nodes
	            const beforeAnimation = (ele, destination, invert) => {

	                ele.style.zIndex = '1000';
	                const parentOriginal = ele.parentElement;
	                parentOriginal.appendChild(ele); //put back to where it was
	                const x0 = ele.getBoundingClientRect().left;
	                const y0 = ele.getBoundingClientRect().top;

	                destination.appendChild(ele);
	                const x1 = ele.getBoundingClientRect().left;
	                const y1 = ele.getBoundingClientRect().top;
	                parentOriginal.appendChild(ele);

	                if (invert === 1) {
	                    ele.style.setProperty('--dx', (y1 - y0) + 'px');
	                    ele.style.setProperty('--dy', (x1 - x0) + 'px');
	                } else if (invert === 2) {
	                    ele.style.setProperty('--dx', (y1 - y0 +16.4973) + 'px');
	                    ele.style.setProperty('--dy', (x0 - x1 +16.4973) + 'px');
	                } else {
	                    ele.style.setProperty('--dx', (x1 - x0) + 'px');
	                    ele.style.setProperty('--dy', (y1 - y0) + 'px');
	                }
	            }

	            const afterAnimation = (ele, destination) => {
	                destination.appendChild(ele);
	                ele.style.zIndex = 'auto';
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

	        resizeHand: function(card_num=0, token_num=0, resources=[]) {
	            $('hand_ratio').className = '';
	            $('assets_wrap').className = '';
	            $('hand_objectives').className = '';
	            const card_sum = card_num
	            const token_sum = token_num * 1.1742;
	            rows = Math.ceil((card_sum + token_sum) / 7);

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

	            for (let i=1; i<=card_sum; i++) {
	                if (!$(`hand_asset_${i}`)) {
	                    dojo.place(`<div id="hand_asset_${i}" class="hand_asset_wrap"></div>`, 'assets_wrap');
	                }
	            }
	        },

	        handCount: function(player_id, hand_count) {
	            $(`hand_num_${player_id}`).innerHTML = hand_count;
	        },

	        getTooltipForLog: function(item, type) {
	            switch(type) {
	                case 'asset':
	                    const asset_title = gameui.gamedatas['asset_cards'][item]['description'];
	                    return gameui.format_block('jstpl_log_item', {
	                            item_key: item,
	                            item_type: 'asset_tt',
	                            item_name: asset_title,
	                    });

	                case 'pitch':
	                    const pitch_title = gameui.gamedatas['pitches'][item]['description'];
	                    return gameui.format_block('jstpl_log_item', {
	                            item_key: item,
	                            item_type: 'pitch_tt',
	                            item_name: pitch_title,
	                    });
	            }
	        },

	        assetTooltip: function(ele, card_type) {
	            const bg_pos = gameui.gamedatas.asset_cards[card_type]['x_y'];
	            const skill = _(gameui.gamedatas.asset_cards[card_type]['skill']);
	            const title = _(gameui.gamedatas.asset_cards[card_type]['description']);
	            const html = `<div style="margin-bottom: 5px; display: inline;"><strong>${title}</strong></div>
	                        <span style="font-size: 10px; margin-left: 5px;">${skill}</span>
	                        <div class="asset asset_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>`;
	            gameui.addTooltipHtml(ele, html, 1000);
	        },

	        pitchTooltip: function(ele, pitch_type) {
	            const bg_pos = gameui.gamedatas.pitches[pitch_type]['x_y'];
	            const title = _(gameui.gamedatas.pitches[pitch_type]['description']);
	            const type = _(gameui.gamedatas.pitches[pitch_type]['type_description']);
	            const html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
	                        <div class="pitch pitch_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>
	                        <div> Type: ${type} / Value: ${gameui.gamedatas.pitches[pitch_type]['value']}</div>`;
	            gameui.addTooltipHtml(ele, html, 1000);
	        },

	        addTooltipsToLog: function() {
	            const item_elements = dojo.query('.item_tooltip');
	            Array.from(item_elements).forEach((ele) => {
	                const ele_id = ele.id;

	                if (ele.classList.contains('asset_tt')) {
	                    const asset_type = ele_id.slice(-2).replace(/^\D+/g, '');
	                    gameui.utils.assetTooltip(ele_id, asset_type);
	                }
	                else if (ele.classList.contains('pitch_tt')) {
	                    const pitch_type = ele_id.slice(-2).replace(/^\D+/g, '');
	                    gameui.utils.pitchTooltip(ele_id, pitch_type);
	                }
	            });
	        },

	        shouldAnimate: function() {
	            return document.visibilityState !== 'hidden' && !gameui.instantaneousMode;
	        },

	        logInject: function (log_entry) {
	            const asset_regex = /\[\w+-*\w* *\w*\(\d+\)\]/g;
	            const pitch_regex = /\{\w*[-'. ]*\w*[-'. ]*\w*[-'. ]*\w*[-'. ]*\(*\w* *\w* *\w*\)*\(*\d*\)*\}/g;
	            const assets_to_replace = log_entry.matchAll(asset_regex);
	            const pitch_to_replace = log_entry.match(pitch_regex);

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

	            return log_entry;
	        },

	        updatePlayerResources: function (player_id, updated_resources) {
	            dojo.query(`#player_board_${player_id} .resource`).forEach((ele) => {
	                const resource = ele.id.substring(0, ele.id.indexOf('_num'));
	                if (['gear', 'face', 'crack', 'slab'].includes(resource)) {
	                    ele.innerHTML = updated_resources['skills'][resource];
	                } else if (['precision', 'balance', 'pain_tolerance', 'power'].includes(resource)) {
	                    ele.innerHTML = updated_resources['techniques'][resource];
	                }
	            });
	        },

	        getAssetType: function(asset) {
	        	if (typeof asset === 'object' && asset != null) { 
	        		const id = asset.id.slice(-3).replace(/^\D+/g, '');
	        		const type_arg = gameui.gamedatas.asset_identifier[id];
	        	}
	        	else if (['string', 'number'].includes(typeof asset)) { const type_arg = String(asset); }
                const skills = gameui.gamedatas.asset_cards[type_arg]['skills'];
                let type = '';
                for (const [key, value] of Object.entries(skills)) {
                    if (value) { type = key; }
                }
                return type;
	        },
		});

	});