/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * FirstAscent implementation : © <Jonathan Morgan> <jonathanrobmo@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * firstascent.js
 *
 * FirstAscent user interface script
 */

define([
    "dojo","dojo/_base/declare",
    "dojo/aspect",
    "ebg/core/gamegui",
    "ebg/counter",
    g_gamethemeurl + "modules/utils.js"
],
function (dojo, declare, aspect) {
    return declare("bgagame.firstascent", ebg.core.gamegui, {
        constructor: function(){
            console.log('firstascent constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;
            let gameObject = this;            //Needed as the 'this' object in aspect.before will not refer to the game object in which the formatting function resides
            aspect.before(dojo.string, "substitute", function(template, map, transform) {      //This allows you to modify the arguments of the dojo.string.substitute method before they're actually passed to it
                return [template, map, transform, gameObject];
            });
            this.utils = new bgagame.utils();
        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {

            console.log( "Starting game setup" );

            // Setup globals -
            this.player_count = Object.keys(gamedatas.players).length;
            this.cards_to_draw = 0;
            this.board_slots = {
                'gear' : 0,
                'face' : 0,
                'crack' : 0,
                'slab' : 0,
            };
            this.rest_resources = 0;
            this.selected_tucked = [];
            this.risk_it = gamedatas.risk_it;
            this.risky_climb = false;
            this.risk_hand_slots = {};
            this.unnecessary_requirements = 0;
            this.summit_beta_choices = [];
            this.bomber_anchor = false;
            this.pitch_requirements = null;
            this.already_climbed = 0;
            this.already_climbed_trigger = false;
            this.free_solo_hecked = false;
            this.confirm_disabled = false;

            // attach the titlebar addon
            const titlebar_addon = document.createElement('div');
            titlebar_addon.id = 'titlebar_addon';
            $('page-title').append(titlebar_addon);
            const round_tracker = document.createElement('div');
            const phase_tracker = document.createElement('div');
            round_tracker.id = 'round_tracker';
            phase_tracker.id = 'phase_tracker';
            titlebar_addon.append(round_tracker);
            titlebar_addon.append(phase_tracker);
            this.utils.updateTitlebarAddon(gamedatas.round, 'round');
            this.utils.updateTitlebarAddon(gamedatas.phase, 'phase');

            const toggles_wrap = document.createElement('div');
            const addon_height = titlebar_addon.getBoundingClientRect().height;
            toggles_wrap.id = 'toggles_wrap';
            $('page-title').append(toggles_wrap);
            const addon_toggle = document.createElement('div');
            addon_toggle.id = 'addon_toggle';
            addon_toggle.innerHTML = _('Hide<br>Extension');
            addon_toggle.classList.add('addon_on', 'always_cursor', 'toggle');
            toggles_wrap.style.height = `${addon_height}px`;
            toggles_wrap.append(addon_toggle);
            addon_toggle.onclick = (evt) => { this.utils.toggleTitlebarAddon(evt); }

            // Display the correct board for player count and set ledge pitches

            if (this.player_count <= 3) {
                $('board').classList.add('desert');
                this.board = 'desert';
                this.lower_ledge = ['16', '17', '18', '19', '20', '21'];
                this.upper_ledge = ['22', '23', '24', '25', '26'];
                this.ledge = [...this.lower_ledge, ...this.upper_ledge];
            } else {
                $('board').classList.add('forest');
                dojo.query('.pitch_wrap').style({
                    'height':'13.6%',
                    'width':'7.81%',
                });
                this.board = 'forest';
                this.lower_ledge = ['20', '21', '22', '23', '24', '25', '26', '27'];
                this.upper_ledge = ['28', '29', '30', '31', '32', '33', '34'];
                this.ledge = [...this.lower_ledge, ...this.upper_ledge];
            }

            // Setting up player panels and board state
            for( const player_id in gamedatas.players )
            {
                const player = gamedatas.players[player_id];
                const player_panel_div = $(`player_board_${player_id}`);

                // place in my panel only
                if (this.player_id === Number(player_id)) {

                    // ref cards
                    dojo.place(this.format_block('jstpl_references', player), player_panel_div);
                    player_panel_div.classList.add('my_panel');

                    // starting skills
                    const skills_title = _('Skills __________');
                    dojo.place(`<div id="cp_skills_title" style="font-size: 10px; margin-bottom: 5px;">${skills_title}</div>`, 
                        player_panel_div);
                    dojo.place(this.format_block('jstpl_skills', {
                        player_id : player_id,
                    }), player_panel_div);

                    // starting techniques
                    const techniques_title = _('Techniques ____');
                    dojo.place(`<div id="cp_techniques_title" style="font-size: 10px; margin-bottom: 5px;">${techniques_title}</div>`, 
                        player_panel_div);
                    dojo.place(this.format_block('jstpl_techniques', {
                        player_id : player_id,
                    }), player_panel_div);

                    // tracked resources
                    this.utils.updatePlayerResources(player_id, gamedatas.resource_tracker);
                }

                // starting water and psych
                dojo.place(this.format_block('jstpl_water_and_psych', {
                    player_id : player_id
                }), player_panel_div, 8);

                // current water and psych
                const current_water = gamedatas.water_psych_tracker[player_id]['water'];
                const current_psych = gamedatas.water_psych_tracker[player_id]['psych'];
                $(`water_num_${player_id}`).innerHTML = current_water;
                $(`psych_num_${player_id}`).innerHTML = current_psych;

                // rope
                if (player.character) {
                    const current_rope = 9 - gamedatas.pitch_tracker[player_id].length;
                    const rope_color = gamedatas.characters[player.character]['rx_y']['panel'];
                    dojo.place(this.format_block('jstpl_pp_rope', {
                        player_id : player_id,
                        rX : rope_color[0],
                        rY : rope_color[1]
                    }), `${player_id}_water_and_psych`);
                    this.addTooltipHtml(`${player_id}_rope_counter`, _('Rope'), 500);
                    $(`rope_num_${player_id}`).innerHTML = current_rope;
                }

                // initialize hand counter
                const hand_size = gamedatas['hand_count'][player_id];
                dojo.place(`<div id="hand_counter_${player_id}" class="hand_counter">
                    </div><span id="hand_num_${player_id}" class="panel_num">${hand_size}</span>`, 
                    `${player_id}_water_and_psych`, 8);

                // meeple and ropes in panel and/or on board
                const pitch_tracker = gamedatas.pitch_tracker[player_id];
                const pitches_rope_order = gamedatas.pitches_rope_order;

                if (player.character) { 
                    const character_id = gamedatas.players[player_id]['character'];
                    if (player_id == this.player_id) { this.character_id = character_id; }
                    const rope_color = gamedatas.characters[character_id]['rx_y']['board'];
                    const mx_y = gamedatas.characters[player.character]['mx_y'];
                    const meeple = this.format_block('jstpl_meeple', {
                        player_id : player_id,
                        mX : mx_y[0],
                        mY : mx_y[1]
                    });

                    if (pitch_tracker.length === 1) {
                        let meeple_destination;
                        if (player_id == this.player_id) { meeple_destination = 'ref_row'; }
                        else { meeple_destination = `${player_id}_water_and_psych`; }
                        dojo.place(meeple, meeple_destination);
                    }
                    else { 

                        const ledge_teleports = gamedatas.ledge_teleports[player_id];
                        const rope_overlaps = gamedatas.rope_overlaps[player_id];

                        for (let i=0; i<=pitch_tracker.length-1; i++) {
                            if (i < pitch_tracker.length-1) {
                                const rope_num = i+1;
                                const current_pitch_id = pitch_tracker[i+1];
                                const previous_pitch_id = pitch_tracker[i];
                                const current_pitch_rope_hub = `pitch_${current_pitch_id}_rope`;
                                const rope_info = this.utils.getRope(previous_pitch_id, current_pitch_id, gamedatas.board);
                                const rotation = rope_info['rotation'];
                                const extra_class = rope_info['mini'] ? 'mini_rope' : '';

                                // ledge teleportation rope
                                let ledge = false;
                                let overflow_ledge = '';
                                let direction = '';
                                let direction_for_overlap = '';
                                if (this.lower_ledge.includes(current_pitch_id) && ledge_teleports.includes(current_pitch_id)) {
                                    ledge = true;
                                    overflow_ledge = 'lower_ledge_overflow';
                                    direction = 'lower_ledge_refresh';
                                    direction_for_overlap = 'lower';
                                }
                                else if (this.upper_ledge.includes(current_pitch_id) && ledge_teleports.includes(current_pitch_id)) {
                                    ledge = true;
                                    overflow_ledge = 'upper_ledge_overflow';
                                    direction = 'upper_ledge_refresh';
                                    direction_for_overlap = 'upper';
                                }
                                if (ledge) {
                                    const overflow_wrapper = dojo.place(
                                        `<div id="overflow_wrapper_${current_pitch_id}_${player_id}" class="overflow_${rotation} rope_overflow ${overflow_ledge}">
                                            <div id="rope_wrapper_${player_id}_${rope_num}" class="rope_wrapper r${rotation} ${direction}"></div>
                                        </div>`, current_pitch_rope_hub);
                                }

                                // pitch to pitch rope
                                else {
                                    const rope_wrapper = dojo.place(`<div id="rope_wrapper_${player_id}_${rope_num}" class="rope_wrapper r${rotation}"></div>`, current_pitch_rope_hub);
                                }

                                // overlapping rope

                                if (Object.keys(rope_overlaps).includes(current_pitch_id)) {
                                    const rope_wrapper = $(`rope_wrapper_${player_id}_${rope_num}`);
                                    rope_wrapper.classList.add(`over_${rope_overlaps[current_pitch_id]}_${rotation}`, `over_${rope_overlaps[current_pitch_id]}`);
                                    if (ledge) { rope_wrapper.parentElement.classList.add(`over_${rope_overlaps[current_pitch_id]}_${direction_for_overlap}`); }
                                }

                                // add climber order
                                const current_climber_order = pitches_rope_order[current_pitch_id].indexOf(player_id) + 1;
                                $(`rope_wrapper_${player_id}_${rope_num}`).classList.add(`climber_${current_climber_order}`);

                                const rope_i = dojo.place(this.format_block('jstpl_rope', {
                                    player_id : player_id,
                                    rope_num : rope_num,
                                    extra_classes : extra_class,
                                    rX : rope_color[0],
                                    rY : rope_color[1]
                                }), `rope_wrapper_${player_id}_${rope_num}`);

                            } else if (i === pitch_tracker.length-1) {
                                dojo.place(meeple, `pitch_${pitch_tracker[i]}`);
                                const meeple_ele = $(`meeple_${player_id}`);
                                meeple_ele.addEventListener('mouseover', this.utils.highlightRoute);
                                meeple_ele.addEventListener('mouseout', this.utils.unHighlightRoute);
                            }
                        }
                    }
                }
            }

            // Starting player token
            const starting_player = gamedatas.starting_player;
            const token_destination = this.player_id == starting_player ? $('ref_row') : $(`${starting_player}_water_and_psych`);
            const starting_player_token = dojo.place(this.format_block('jstpl_starting_player', {}), token_destination);
            const title = _('First player');
            const text1 = _('Take turns <strong>clockwise</strong>');
            const text2 = _('End of Rerack Phase:');
            const text3 = _('pass this token <strong>right</strong>');
            const starting_player_tooltip = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                                             <div class="pitch pitch_tt" style="background-position: -1200% -0%; margin-bottom: 5px;"></div>
                                             <div>${text1}<br><br>${text2}<br>${text3}</div>`;
            this.addTooltipHtml(`${starting_player_token.id}`, starting_player_tooltip, 1000);

        // Add asset tokens to pitches

            if (gamedatas.pitch_asset_tokens != []) {
                for (let [pitch_type_arg, token_type_array] of Object.entries(gamedatas.pitch_asset_tokens)) {
                    const pitch = dojo.query(`.p${pitch_type_arg}`)[0];
                    for (let type of token_type_array) {
                        const wrapper = dojo.place(`<div id="${pitch_type_arg}_token_wrapper" class="pitch_token_wrapper"></div>`, pitch);
                        switch (pitch.querySelectorAll('.pitch_token_wrapper').length) {
                            case 2: 
                                wrapper.id += '_2';
                                wrapper.classList.add('pitch_token_wrapper_2');
                                break;
                            case 3:
                                wrapper.id += '_3';
                                wrapper.classList.add('pitch_token_wrapper_3');
                                break;
                        }
                        const icon = dojo.place(`<div class="${type}_token symbol_token"></div>`, wrapper);
                    }
                }
            }

        // Place Summit Beta Token pile and discard

            let summmit_beta_coords;
            if (this.player_count <= 3) { summit_beta_coords = [36.2, 1.88]; } // Desert board
            else { summit_beta_coords = [36.2, 2.27]; }                     // Forest board
            dojo.place(this.format_block('jstpl_summit_pile', {
                summit_pile_top : summit_beta_coords[0],
                summit_pile_left : summit_beta_coords[1]
            }), 'board', 1);

            let summit_beta_discard_coords;
            if (this.player_count <= 3) { summit_beta_discard_coords = [36.2, 12.3]; } // Desert board
            else { summit_beta_discard_coords = [36.2, 12.6]; }
            const summit_beta_discard = dojo.place(this.format_block('jstpl_summit_discard', {
                summit_discard_top : summit_beta_discard_coords[0],
                summit_discard_left : summit_beta_discard_coords[1]
            }), 'board', 2);

            if (gamedatas.summit_beta_discard_top_token) {
                const summit_beta_type_arg = gamedatas.summit_beta_discard_top_token.type_arg;
                const summit_beta_id = Object.keys(gamedatas.token_identifier).find(key => gamedatas.token_identifier[key] === summit_beta_type_arg);
                const summit_beta_token = gamedatas.summit_beta_tokens[summit_beta_type_arg];
                dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : summit_beta_id,
                    sbX : summit_beta_token.x_y[0],
                    sbY : summit_beta_token.x_y[1],
                }), 'summit_discard');
            }

        // Place Climbing deck and discard

            let climbing_deck_coords, climbing_discard_coords;
            if (this.player_count <= 3) { // Desert board
                climbing_deck_coords = [-2.82, 5.38];
                climbing_discard_coords = [13.8, 5.38];
            }
            else { // Forest board
                climbing_deck_coords = [-2.386, 5.7];
                climbing_discard_coords = [14.06, 5.7];
            }
            dojo.place(this.format_block('jstpl_climbing_deck', {
                climbing_deck_top : climbing_deck_coords[0],
                climbing_deck_left : climbing_deck_coords[1]
            }), 'board', 3);
            dojo.place(this.format_block('jstpl_climbing_discard', {
                climbing_discard_top : climbing_discard_coords[0],
                climbing_discard_left : climbing_discard_coords[1],
            }), 'board', 4);

            if (gamedatas.climbing_discard_top_card) {
                const climbing_card_type_arg = gamedatas.climbing_discard_top_card.type_arg;
                const climbing_card = gamedatas.climbing_cards[climbing_card_type_arg];
                dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : gamedatas.climbing_discard_top_card.id,
                    ccX : climbing_card.x_y[0],
                    ccY : climbing_card.x_y[1],
                    a_height : climbing_card.height_top_a[0],
                    a_top : climbing_card.height_top_a[1],
                    b_height : climbing_card.height_top_b[0],
                    b_top : climbing_card.height_top_b[1],
                }), 'climbing_discard_90');
            }
            if (Object.keys(gamedatas.climbing_in_play).length > 0 && gamedatas.current_state != 'crimperClimbingCards') {
                const climbing_type_arg = Object.values(gamedatas.climbing_in_play)[0];
                const climbing_card = gamedatas.climbing_cards[climbing_type_arg];
                dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : Object.keys(gamedatas.climbing_in_play)[0],
                    ccX : climbing_card.x_y[0],
                    ccY : climbing_card.x_y[1],
                    a_height : climbing_card.height_top_a[0],
                    a_top : climbing_card.height_top_a[1],
                    b_height : climbing_card.height_top_b[0],
                    b_top : climbing_card.height_top_b[1],
                }), 'climbing_discard_straightened');
            }

            $('titlebar_addon').append($('climbing_slot'));
            const board_width = $('board').getBoundingClientRect().width;
            const climbing_slot_width = this.utils.convertVmaxToPx(19.455);
            const climbing_slot_left = (board_width / 2) - (climbing_slot_width / 2);
            $('climbing_slot').style.left = `${climbing_slot_left}px`;

        // Set up the asset deck and spread

            // place asset deck and discard

            let asset_deck_coords;
            if (this.player_count <= 3) { asset_deck_coords = [0.1, 90.4]; } // Desert board
            else { asset_deck_coords = [0.5, 89.85]; }                       // Forest board
            dojo.place(this.format_block('jstpl_asset_deck', {
                asset_deckX : asset_deck_coords[0],
                asset_deckY : asset_deck_coords[1]
            }), 'board', 5);

            let asset_discard_coords;
            if (this.player_count <= 3) { asset_discard_coords = [0, 80.1]; } // Desert board
            else { asset_discard_coords = [0.5, 79.6]; }                      // Forest board
            dojo.place(`<div id="asset_discard" style="top: ${asset_discard_coords[0]}%; left: ${asset_discard_coords[1]}%;"></div>`, 'board', 6);

            if (gamedatas.asset_discard_top_card) {
                const asset_card_type_arg = gamedatas.asset_discard_top_card.type_arg;
                const asset_card = gamedatas.asset_cards[asset_card_type_arg];
                dojo.place(this.format_block('jstpl_asset_card', {
                    CARD_ID : gamedatas.asset_discard_top_card.id,
                    EXTRA_CLASSES : '',
                    acX : asset_card.x_y[0],
                    acY : asset_card.x_y[1],
                }), 'asset_discard');
            }
            this.asset_discard = gamedatas.asset_discard;

            // place spread slots

            let spread_coords;
            if (this.player_count <= 3) {
                spread_coords = [ [10.8, 90.4], [21.5, 90.4], [32.2, 90.4], [42.9, 90.4] ]; // Desert board
            } else {spread_coords = [ [11.1, 89.86], [21.71, 89.86], [32.3, 89.86], [42.93, 89.86] ];}    // Forest board
            for (let i=0; i<=3; i++) {
                dojo.place(this.format_block('jstpl_spread_slot', {
                    SLOT_NUM : i+1,
                    spreadX : spread_coords[i][0],
                    spreadY : spread_coords[i][1]
                }), 'the_spread');
            }

            // place spread cards on slots

            const spread_cards = Object.values(gamedatas.spread);

            for (let card=0; card<=3; card++) {

                const spread_slot = `spread_slot${card+1}`;
                const cardId = Number(spread_cards[card]);
                if (cardId) {
                    const x = gamedatas.asset_cards[cardId]['x_y'][0];
                    const y = gamedatas.asset_cards[cardId]['x_y'][1];
                    dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : Object.keys(gamedatas.spread)[card],
                        EXTRA_CLASSES : 'spread_asset',
                        acX : x,
                        acY : y,
                    }), spread_slot);
                }
            }

        // Hand

            if (!this.isSpectator) {
                const player_assets = gamedatas['hand_assets'];
                const card_ids = Object.keys(player_assets);
                const asset_num = card_ids.length;

                const player_summit_beta_tokens = gamedatas['hand_summit_beta_tokens'];
                const summit_beta_token_ids = Object.keys(player_summit_beta_tokens);
                const summit_beta_token_num = summit_beta_token_ids.length;

                const player_symbol_tokens = gamedatas['hand_symbol_tokens'];
                
                let slot = 1;
                card_ids.forEach(card_id => {
                    const asset = gamedatas.asset_cards[player_assets[card_id]];
                    dojo.place(`<div id="hand_asset_${slot}" class="hand_asset_wrap"></div>`, 'assets_wrap');
                    dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : card_id,
                        EXTRA_CLASSES : '',
                        acX : asset.x_y[0],
                        acY : asset.x_y[1],
                    }), `hand_asset_${slot}`);
                    slot++;
                });

                slot = 1;
                summit_beta_token_ids.forEach(token_id => {
                    const type_arg = player_summit_beta_tokens[token_id];
                    const token = gamedatas.summit_beta_tokens[type_arg];
                    dojo.place(`<div id="hand_token_${slot}" class="hand_token_wrap"></div>`, 'assets_wrap');
                    const token_div = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_id,
                        sbX : token.x_y[0],
                        sbY : token.x_y[1],
                    }), `hand_token_${slot}`);
                    slot++;
                    this.utils.initSummitBetaToken(token_div, type_arg);
                });

                for (const [symbol, num] of Object.entries(player_symbol_tokens)) {
                    for (let i=1; i<=num; i++) {
                        const new_token_id = dojo.query('#assets_wrap .symbol_token').length + 1;
                        dojo.place(`<div id="hand_token_${slot}" class="hand_token_wrap"></div>`, 'assets_wrap');
                        dojo.place(`<div id="${symbol}_token_${new_token_id}" class="${symbol}_token symbol_token"></div>`, `hand_token_${slot}`);
                        slot++;
                    }
                }

                window.onload = (evt) => { this.utils.resizeHand(); }

            } else { $('hand_ratio').remove(); }
 
        // Characters and Asset Boards

            // place character area wrappers

            for (let i=1; i<=this.player_count; i++) {
                const current_player_id = Object.keys(gamedatas.players)[i-1];
                const current_player = gamedatas.players[`${current_player_id}`];

                // if the current player has chosen a character, it goes at the top
                if (current_player_id == this.player_id && current_player.character) {
                    dojo.place(this.format_block('jstpl_character_area', {
                        player : current_player_id,
                        color : current_player.color,
                        player_name : current_player.name,
                    }), 'character_zone', 'first');
                } 
                else if (current_player.character) {
                        dojo.place(this.format_block('jstpl_character_area', {
                        player : current_player_id,
                        color : current_player.color,
                        player_name : current_player.name,
                    }), 'character_zone');
                }
            }

            // position all characters beneath the top one
            if ($('character_zone').children.length > 1) {
                dojo.query('.character_area').forEach((element) => {
                    const parent = element.parentNode;
                    if (element != parent.firstElementChild) {
                        dojo.style(element, 'margin-top', '8px');
                    }
                });
            }

            // character selection

            if (gamedatas.available_characters.length > 1) {
                switch (this.player_count) {
                    case 2:
                        $('character_selection').classList.add('cs_2');
                        break;
                    case 3:
                        $('character_selection').classList.add('cs_3');
                        break;
                    case 4:
                        $('character_selection').classList.add('cs_4');
                        $('character_selection_ratio').classList.add('csr_4');
                        break;
                    case 5:
                        $('character_selection').classList.add('cs_5');
                        $('character_selection_ratio').classList.add('csr_5');
                        break;
                }

                for (const character_id of gamedatas.available_characters) {
                    const character = gamedatas.characters[character_id];
                    const nb_pos = character['nb_x_y'];
                    dojo.place(this.format_block('jstpl_namebox', {
                        type : character_id,
                        charX : nb_pos[0],
                        charY : nb_pos[1],
                    }), 'character_selection');
                    const bg_pos = character['x_y'];
                    const color = character['color_name'];
                    const character_name = character['name'];
                    const water_psych = character['water_psych'];
                    dojo.place(this.format_block('jstpl_character', {
                        type: character_id,
                        charX : bg_pos[0],
                        charY : bg_pos[1],
                        extra_style : '',
                        character : character_name,
                    }), 'show_character');

                    if (character_name == 'phil') {
                        const water_7 = document.createElement('div');
                        water_7.id = 'phil_w7';
                        water_7.classList.add('cube_wrap', 'cb_w_7');
                        const psych_7 = document.createElement('div');
                        psych_7.id = 'phil_p7';
                        psych_7.classList.add('cube_wrap', 'cb_p_7');
                        $(`character_${character_id}`).insertBefore(water_7, $('phil_break'));
                        $(`character_${character_id}`).append(psych_7);
                    }

                    $(`character_${character_id}`).classList.add('popout');
                    dojo.place(this.format_block('jstpl_cube', {
                        character : character_name,
                        type : 'water',
                    }), $(`${character_name}_w${water_psych}`));
                    dojo.place(this.format_block('jstpl_cube', {
                        character : character_name,
                        type : 'psych',
                    }), $(`${character_name}_p${water_psych}`));

                    // tooltip
                    const description = _(character['description']);
                    const flavor = _(character['flavor']);
                    const ability = _(character['ability']);
                    const home_crag = _(character['home_crag']);
                    const native_lands = _(character['native_lands']);
                    const html = `<div style="margin-bottom: 5px;"><strong>${description}</strong></div>
                                <p>${flavor} - ${ability}</p>
                                <p>${_('Starting Water/Psych')}: ${character['water_psych']}</p>
                                <span>${_('Home Crag')}: ${home_crag}</span>
                                <span style="font-size: 10px; white-space: nowrap;"><i>${native_lands}</i></span>`;
                    this.addTooltipHtml(`character_${character_id}`, html, 1000);
                }

                const selected_characters = (this.player_count + 1) - gamedatas.available_characters.length;
                for (let i=1; i<=selected_characters; i++) {
                    dojo.place(this.format_block('jstpl_namebox', {
                        type: 1-i,
                        charX : 0,
                        charY : 0,
                    }), 'character_selection');
                    $(`namebox_${1-i}`).style.visibility = 'hidden';
                    $(`namebox_${1-i}`).classList.add('vis_hidden');
                }

                if (this.checkAction('selectCharacter', true)) {
                    dojo.query('.namebox').forEach((element) => {
                        element.classList.add('cursor');
                    });
                }
            } else { $('character_selection_ratio').remove(); }

            // my character
            if (!this.isSpectator) {
                const my_character_id = gamedatas.players[this.player_id]['character'];
                if (my_character_id) {
                    const my_character = gamedatas.characters[my_character_id];
                    const bg_pos = my_character['x_y'];
                    const ab_pos = my_character['ab_x_y'];
                    const character_ratio = dojo.query(`#player_${this.player_id} .character_ratio_child`)[0];
                    const color = my_character['color_name'];
                    const character_name = my_character['name'];
                    const water_psych = gamedatas['water_psych_tracker'][this.player_id];
                    dojo.place(this.format_block('jstpl_character', {
                        type : my_character_id,
                        charX : bg_pos[0],
                        charY : bg_pos[1],
                        extra_style : "position: relative;",
                        character : character_name,
                    }), character_ratio);

                    if (character_name == 'free_soloist') {
                        dojo.place(this.format_block('jstpl_fs_asset_board', {
                            player : this.player_id,
                            character : character_name,
                            abX : ab_pos[0],
                            abY : ab_pos[1],
                        }), `character_${my_character_id}`);
                    }
                    else if (character_name == 'young_prodigy') {
                        dojo.place(this.format_block('jstpl_yp_asset_board', {
                            player : this.player_id,
                            character : character_name,
                            abX : ab_pos[0],
                            abY : ab_pos[1],
                        }), `character_${my_character_id}`);
                    }
                    else {
                        dojo.place(this.format_block('jstpl_asset_board', {
                            player : this.player_id,
                            character : character_name,
                            abX : ab_pos[0],
                            abY : ab_pos[1],
                        }), `character_${my_character_id}`);
                    }

                    if (character_name == 'phil') {
                        const water_7 = document.createElement('div');
                        water_7.id = 'phil_w7';
                        water_7.classList.add('cube_wrap', 'cb_w_7');
                        const psych_7 = document.createElement('div');
                        psych_7.id = 'phil_p7';
                        psych_7.classList.add('cube_wrap', 'cb_p_7');
                        $(`character_${my_character_id}`).insertBefore(water_7, $('phil_break'));
                        $(`character_${my_character_id}`).insertBefore(psych_7, $(`asset_board_${this.player_id}`));
                    }

                    if (character_name === 'cool-headed_crimper') {
                        $('climbing_deck').insertAdjacentHTML('beforeend',
                            `<span id="crimper_draw">
                                <span id="crimper_draw_1"></span>
                                <span id="crimper_draw_2"></span>
                            </span>`
                        )
                        $('climbing_slot').insertAdjacentHTML('afterend',
                            `<span id="crimper_display">
                                <span id="crimper_display_1"></span>
                                <span id="crimper_display_2"></span>
                            </span>`
                        );
                    }

                    dojo.place(this.format_block('jstpl_cube', {
                        character : character_name,
                        type : 'water',
                    }), $(`${character_name}_w${water_psych.water}`));
                    dojo.place(this.format_block('jstpl_cube', {
                        character : character_name,
                        type : 'psych',
                    }), $(`${character_name}_p${water_psych.psych}`));
                }
            }

            // opponents' characters
            for (const player_id in gamedatas.players) {
                if (player_id != this.player_id) {
                    const playerInfo = gamedatas.players[player_id];
                    const character_id = playerInfo.character;
                    if (character_id) {
                        const character_details = gamedatas.characters[character_id];
                        const bg_pos = character_details['x_y'];
                        const ab_pos = character_details['ab_x_y'];
                        const character_ratio = dojo.query(`#player_${player_id} .character_ratio_child`)[0];
                        const color = character_details['color_name'];
                        const character_name = character_details['name'];
                        const water_psych = gamedatas['water_psych_tracker'][player_id];

                        dojo.place(this.format_block('jstpl_character', {
                            type : character_id,
                            charX : bg_pos[0],
                            charY : bg_pos[1],
                            extra_style : "position: relative;",
                            character : character_name,
                        }), character_ratio);


                        if (character_name == 'free_soloist') {
                            dojo.place(this.format_block('jstpl_fs_asset_board', {
                                player : player_id,
                                character : character_name,
                                abX : ab_pos[0],
                                abY : ab_pos[1],
                            }), `character_${character_id}`);
                        }

                        else if (character_name == 'young_prodigy') {
                            dojo.place(this.format_block('jstpl_yp_asset_board', {
                                player : player_id,
                                character : character_name,
                                abX : ab_pos[0],
                                abY : ab_pos[1],
                            }), `character_${character_id}`);
                        }

                        else {
                            dojo.place(this.format_block('jstpl_asset_board', {
                                player : player_id,
                                character : character_name,
                                abX : ab_pos[0],
                                abY : ab_pos[1],
                            }), `character_${character_id}`);
                        }

                        if (character_name === 'phil') {
                            const water_7 = document.createElement('div');
                            water_7.id = 'phil_w7';
                            water_7.classList.add('cube_wrap', 'cb_w_7');
                            const psych_7 = document.createElement('div');
                            psych_7.id = 'phil_p7';
                            psych_7.classList.add('cube_wrap', 'cb_p_7');
                            $(`character_${character_id}`).insertBefore(water_7, $('phil_break'));
                            $(`character_${character_id}`).insertBefore(psych_7, $(`asset_board_${player_id}`));
                        }

                        if (character_name === 'cool-headed_crimper') {
                            $('climbing_deck').insertAdjacentHTML('beforeend',
                                `<span id="crimper_draw">
                                    <span id="crimper_draw_1"></span>
                                    <span id="crimper_draw_2"></span>
                                </span>`
                            )
                            $('climbing_slot').insertAdjacentHTML('afterend',
                                `<span id="crimper_display">
                                    <span id="crimper_display_1"></span>
                                    <span id="crimper_display_2"></span>
                                </span>`
                            );
                        }

                        dojo.place(this.format_block('jstpl_cube', {
                            character : character_name,
                            type : 'water',
                        }), $(`${character_name}_w${water_psych.water}`));
                        dojo.place(this.format_block('jstpl_cube', {
                            character : character_name,
                            type : 'psych',
                        }), $(`${character_name}_p${water_psych.psych}`));
                    }
                }
            }

            // place asset cards on asset boards
            for (const player_id in gamedatas.players) {

                const board_assets = gamedatas['board_assets'][player_id];
                const playerInfo = gamedatas.players[player_id];
                const character_id = playerInfo.character ? playerInfo.character : null;
                const character_name = character_id ? gamedatas.characters[character_id]['name'] : null;

                ['gear', 'face', 'crack', 'slab'].forEach(type => {

                    const type_assets = board_assets[type];
                    let slots = 4;
                    if (character_id === '2' && type === 'gear') { return; }
                    if (character_id === '6' && type === 'gear') { slots = 5; }
                    else if (character_id === '6' && type != 'gear') { slots = 3; }

                    for (let i=1; i<=slots; i++) {
                        if (Object.values(type_assets[i]).length == 1) {
                            const type_arg = Object.values(type_assets[i])[0];
                            const asset = gamedatas.asset_cards[type_arg];
                            let asset_pos;
                            let extra_class = '';

                            if (board_assets[type]['flipped'][i] === false) { asset_pos = asset['x_y']; }
                            else if (board_assets[type]['flipped'][i] === true) {
                                asset_pos = [0, 0];
                                extra_class = ' flipped';
                            }

                            dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : Object.keys(type_assets[i])[0],
                                EXTRA_CLASSES : `played_asset${extra_class}`,
                                acX : asset_pos[0],
                                acY : asset_pos[1],
                            }), `${character_name}_${type}_${i}`);
                        }
                    }

                    if (Object.keys(type_assets['tucked']).length > 0) {
                        $(`${character_name}_${type}_counter`).style.display = 'block';
                        const counter_num = dojo.query(`#${character_name}_${type}_counter > .asset_counter_num`)[0];
                        counter_num.innerHTML = Object.keys(type_assets['tucked']).length;
                    }
                });

                // add permanent asset tokens
                const permanent_asset_tracker = gamedatas.permanent_asset_tracker[player_id];
                for (let i=1; i<=permanent_asset_tracker.length; i++) {

                    const type = permanent_asset_tracker[i-1];
                    const destination = dojo.query(`#asset_board_${player_id} .pa${i}`)[0];
                    dojo.place(`<div id="${type}_${player_id}_${i}" class="skills_and_techniques ${type}_token permanent_asset"></div>`, destination);
                }

                // add point tokens
                const points_tokens = gamedatas.asset_board_token_tracker[player_id]['points_tokens'];
                const four_point_tokens = points_tokens <= 8 ? 0 : points_tokens - 8;
                const two_point_tokens = points_tokens <= 8 ? points_tokens : 8 - four_point_tokens;
                for (let i=1; i<=four_point_tokens; i++) {

                    const destination = dojo.query(`#player_${player_id} .pw${i}`)[0];
                    dojo.place(`<div class="points_token four_points"></div>`, destination);
                }
                for (let i=four_point_tokens+1; i<=two_point_tokens+four_point_tokens; i++) {

                    const destination = dojo.query(`#player_${player_id} .pw${i}`)[0];
                    dojo.place(`<div class="points_token two_points_token"></div>`, destination);
                }
            }

            // set player colors to character colors
            for (const player_id in gamedatas.players) {
                const playerInfo = gamedatas.players[player_id];
                if (playerInfo.character) {
                    const character_details = gamedatas.characters[playerInfo.character];
                    const character_color = character_details.color;
                    $(`character_area_${playerInfo.name}`).style.cssText += 
                        `color: #${character_color};`;
                        // -webkit-text-stroke: .5px black;`;
                    const name_ref = dojo.query(`#player_name_${player_id}`)[0].firstElementChild;
                    name_ref.style.cssText +=
                        `color: #${character_color};`;
                        // -webkit-text-stroke: .5px black;`;
                }
            }

            // personal objectives

            if (gamedatas.current_personal_objectives) {
                const personal_objectives_toggle = document.createElement('div');
                personal_objectives_toggle.id = 'personal_objectives_toggle';
                personal_objectives_toggle.innerHTML = _('Show Personal<br>Objectives');
                personal_objectives_toggle.classList.add('addon_off', 'always_cursor', 'toggle');
                toggles_wrap.insertBefore(personal_objectives_toggle, addon_toggle);
                personal_objectives_toggle.onclick = (evt) => { this.utils.togglePersonalObjectives(evt); }

                const personal_objectives_box = document.createElement('div');
                personal_objectives_box.id = 'personal_objectives_box';
                titlebar_addon.append(personal_objectives_box);
                
                const current_personal_objectives = gamedatas.current_personal_objectives;
                const objective_1_type_arg = current_personal_objectives[0];
                const objective_2_type_arg = current_personal_objectives[1];
                const objective_1 = gamedatas.personal_objectives[objective_1_type_arg];
                const objective_2 = gamedatas.personal_objectives[objective_2_type_arg];
                const po_coords_1 = objective_1['x_y'];
                const po_coords_2 = objective_2['x_y'];
                dojo.place(
                    `${this.format_block('jstpl_personal_objective', {
                        poId : objective_1_type_arg,
                        poX : po_coords_1[0],
                        poY : po_coords_1[1],
                    })}
                     ${this.format_block('jstpl_personal_objective', {
                        poId : objective_2_type_arg,
                        poX : po_coords_2[0],
                        poY : po_coords_2[1],
                     })}`, personal_objectives_box
                );  
                for (const [objective, indices] of Object.entries(gamedatas.personal_objectives_tracker)) {
                    const starting_top = gamedatas.personal_objectives[objective]['starting_check_top'];
                    for (let index of indices) {
                        const check = document.createElement('div');
                        check.classList.add('check');
                        check.innerHTML = '\u2713';
                        $(`personal_objective_${objective}`).append(check);
                        const check_top = starting_top + 5.75 * index;
                        check.style.top = `${check_top}%`;
                    }
                }
                this.utils.personalObjectiveTooltip(`personal_objective_${objective_1_type_arg}`, objective_1_type_arg);
                this.utils.personalObjectiveTooltip(`personal_objective_${objective_2_type_arg}`, objective_2_type_arg);
            }

            // shared objective toggle
            const shared_objectives_toggle = document.createElement('div');
            shared_objectives_toggle.id = 'shared_objectives_toggle';
            shared_objectives_toggle.innerHTML = _('Show Shared<br>Objective Trackers');
            shared_objectives_toggle.classList.add('addon_off', 'always_cursor', 'toggle');
            const subsequent_toggle = $('personal_objectives_toggle') ? personal_objectives_toggle : addon_toggle;
            toggles_wrap.insertBefore(shared_objectives_toggle, subsequent_toggle);
            shared_objectives_toggle.onclick = (evt) => { this.utils.toggleSharedObjectives(evt); }

            // shared objective completion marks
            const shared_objectives_tracker = gamedatas.shared_objectives_tracker;
            this.utils.updateSharedObjectivesDisplay(shared_objectives_tracker);


            //// Tooltips

            // cards in hand
            document.querySelectorAll('#assets_wrap .asset').forEach(ele => {
                const card_id = ele.id.slice(-3).replace(/^\D+/g, '');
                const card_type = gamedatas.asset_identifier[card_id];
                this.utils.assetTooltip(ele.id, card_type);
            });

            // spread cards

            for (let i=0; i<=3; i++) {
                const current_asset = spread_cards[i];
                const current_asset_ids = Object.keys(gamedatas.spread);
                this.utils.assetTooltip(`asset_card_${current_asset_ids[i]}`, current_asset);
            }

            // pitches

            let pitches_num = null;
            if (this.player_count <= 3) { pitches_num = 21; }
            else if (this.player_count >= 4) { pitches_num = 27; }
            if (gamedatas.headwall_revealed) { pitches_num = this.board === 'desert' ? 32: 43; }

            for (let i=1; i<=pitches_num; i++) {
                const current_pitch = dojo.attr(`pitch_${i}`, 'class').slice(-2).replace(/^\D+/g, '');
                const skill_tokens = this.utils.getSkillTokens(current_pitch);
                const rope_order = this.utils.getRopeOrder(i);
                this.utils.pitchTooltip(`pitch_${i}_click`, current_pitch, skill_tokens, rope_order);
            }

            // characters

            const current_characters = document.querySelectorAll('.character');
            for (const current_character of current_characters) {
                const character_id = dojo.attr(current_character, 'id').slice(-2).replace(/^\D+/g, '');
                const character = gamedatas.characters[character_id];
                const bg_pos = character['x_y'];
                const title = _(character['description']);
                const flavor = _(character['flavor']);
                const ability = _(character['ability']);
                const home = _(character['home_crag']);
                const native_lands = _(character['native_lands']);
                const html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                            <p>${flavor} - ${ability}</p>
                            <p>${_('Starting Water/Psych')}: ${character['water_psych']}</p>
                            <span>${_('Home Crag')}: ${home}</span>
                            <span style="font-size: 10px; white-space: nowrap;"><i>${native_lands}</i></span>`;
                this.addTooltipHtml(`character_${character_id}`, html, 1000);
            }

            // asset cards on asset boards
            document.querySelectorAll('.played_asset:not(.flipped)').forEach(ele => {
                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                const type_arg = gamedatas.asset_identifier[id];
                this.utils.assetTooltip(ele.id, type_arg);
            });
            const tucked_tooltip = _('tucked Asset cards');
            document.querySelectorAll('.asset_counter').forEach(ele => { this.addTooltipHtml(ele.id, tucked_tooltip, 1000); });

            // references

            let html = `<div class="reference reference_tt" style="background-position: -600% -0%"></div>
                        <span id="ref_1_text">
                        <h3 id="ref_title_1"><strong>` + _('Climb Phase') + `</strong></h3>
                        <p>` + _('-Move your Climber & Rope. If you are resting, lay down your climber and skip the next steps') + `</p>
                        <p>` + _('-Lay down Asset Cards') + `</p>
                        <p>` + _('-Decrease Water & Psych') + `</p>
                        <p id="ref_horizontal_line">________________</p>
                        <h3><strong>` + _('Follow Phase') + `</strong></h3>
                        <p>` + _('-Claim points for Techniques') + `</p>
                        <p>` + _('-Turn in cards for Permanent Assets if applicable') + `</p>
                        <p>` + _('-Turn over Cards on your Board') + `</p>
                        <p id="ref_horizontal_line">________________</p>
                        <h3><strong>` + _('Rerack Phase') + `</strong></h3>
                        <p>` + _('-Climbers: Draw 3 Asset Cards') + `</p>
                        <p style="font-size: 10px;">` + _('draw Cards from the Spread or Deck') + `</p>
                        <p>` + _('-Resters: Gain 5 Assets') + `</p>
                        <p style="font-size: 10px;">` + _('draw Cards from The Portaledge') + `</p>
                        <p>` + _('-Pass First Player Token to your right') + `</p> 
                        </span>`;
            this.addTooltipHtml(`ref_1`, html, 1000);
            html =     `<div class="reference reference_tt" style="background-position: -700% -0%"></div>
                        <div id="ref_2_text">
                        <h4 id="ref_title_1"><strong>` + _('Risking It') + `</strong></h4>
                        <p>` + _('If you are 1 Asset short but still want to climb, pay the other required Assets, then roll the Die!') + `</p>
                        <span class="risk risk_checkmark" style="margin-top: 0;"></span>
                        <span style="margin-left: 20px;">` + _('= no consequence') + `</span><br>
                        <span class="risk risk_cards" style="margin-top: 4px;"></span>
                        <span style="margin-left: 20px; position: relative; top: 3.8px;">` + _('= give 2 Cards from your hand to another') + `</span><br>
                        <span style="margin-left: 30px; position: relative; top: 5px;">` + _('player') + `</span><br>
                        <span class="risk risk_card_and_psych" style="margin-top: 7px;"></span>
                        <span style="margin-left: 20px; position: relative; top: 6.2px;">` + _('= give 1 Psych and 1 Card to another') + `</span><br>
                        <span style="margin-left: 30px; position: relative; top: 5px;">` + _('player') + `</span>
                        <p id="ref_horizontal_line">________________</p>
                        <h4 style="margin-top: -2px;"><strong>` + _('Techniques and Trades') + `</strong></h4>
                        <p>` + _('When you play 3 Cards with matching Technique symbols, gain a 2-point token.') + `</p>
                        <p>` + _('Technique tokens (earned from climbing cards) are used in place of a Card to match Technique symbols. Discard after using.') + `</p>
                        <p>` + _('On your turn, you may trade in 3 Cards of a kind from your hand for a Card from The Portaledge') + `</p>
                        <p id="ref_horizontal_line">________________</p>
                        <h4 style="margin-top: -2px;"><strong>` + _('Ways to Earn Points') + `</strong></h4>
                        <p>` + _('• Climbing Pitches') + `</p>
                        <p>` + _('• Matching Technique symbols') + `</p>
                        <p>` + _('• Completing Shared Objectives') + `</p>
                        <p>` + _('• Completing 1 Personal Objective') + `</p>
                        <p>` + _('• Reaching a Summit') + `</p>
                        </div>`;
            this.addTooltipHtml(`ref_2`, html, 1000);

            // player panel
            for (const player_id in gamedatas.players) {
                this.addTooltipHtml(`water_icon_${player_id}`, _('Water'), 500);
                this.addTooltipHtml(`psych_icon_${player_id}`, _('Psych'), 500);
                this.addTooltipHtml(`gear_icon_${player_id}`, _('Gear'), 500);
                this.addTooltipHtml(`face_icon_${player_id}`, _('Face'), 500);
                this.addTooltipHtml(`crack_icon_${player_id}`, _('Crack'), 500);
                this.addTooltipHtml(`slab_icon_${player_id}`, _('Slab'), 500);
                this.addTooltipHtml(`precision_icon_${player_id}`, _('Precision'), 500);
                this.addTooltipHtml(`balance_icon_${player_id}`, _('Balance'), 500);
                this.addTooltipHtml(`pain_tolerance_icon_${player_id}`, _('Pain Tolerance'), 500);
                this.addTooltipHtml(`power_icon_${player_id}`, _('Power'), 500);
            }

            // log
            dojo.connect(this.notifqueue, 'addToLog', () => {
                this.utils.addTooltipsToLog();
            });

            // state specific refresh

                // style and connect asset deck and spread during draw asset action
            if (this.checkAction('drawAsset', true)) {
                $('asset_deck').classList.add('selectable');
                for (let slot=0; slot<=3; slot++) {
                    const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                    available_asset.classList.add('selectable');
                }
            }

                // portaledge
            if (gamedatas.current_state === 'selectPortaledge' || gamedatas.current_state === 'resting') {
                portaledge.style.display = 'block';
                portaledge.style.marginTop = 0;
            }

            for (let type of gamedatas.empty_portaledge) { $(`porta${type}`).style.visibility = 'hidden'; }

                // climbing
            let climbing_card_info = gamedatas.climbing_card_info;
            if (gamedatas.current_state === 'climbingCard' || gamedatas.current_state === 'addTokenToPitch') {
                climbing_card = gamedatas.climbing_cards[climbing_card_info.type_arg];
                $('climbing_slot').style.display = 'block';
                const climbing_card_div = dojo.place(this.format_block('jstpl_climbing_card', {
                            CARD_ID : climbing_card_info.id,
                            ccX : climbing_card.x_y[0],
                            ccY : climbing_card.x_y[1],
                            a_height : climbing_card.height_top_a[0],
                            a_top : climbing_card.height_top_a[1],
                            b_height : climbing_card.height_top_b[0],
                            b_top : climbing_card.height_top_b[1],
                        }), 'climbing_slot');
                    $('climbing_dimmer').classList.add('dim_bg');

                    if (gamedatas.current_state === 'climbingCard' && this.isCurrentPlayerActive()) {
                        this.climbing_card_choice_handlers = [];
                        const choice_top = $(`${climbing_card_info.id}_top`);
                        const choice_bottom = $(`${climbing_card_info.id}_bottom`);
                        this.climbing_card_choice_handlers[0] = dojo.connect(choice_top, 'onclick', this, 'onSelectClimbingCardChoice');
                        this.climbing_card_choice_handlers[1] = dojo.connect(choice_bottom, 'onclick', this, 'onSelectClimbingCardChoice');
                        choice_top.classList.add('cursor');
                        choice_bottom.classList.add('cursor');
                    } else if (gamedatas.current_state === 'addTokenToPitch' && this.isCurrentPlayerActive()) {
                        $(`${climbing_card_info.id}_top`).remove();
                        $(`${climbing_card_info.id}_bottom`).remove();
                    }
                    this.utils.climbingTooltip(`climbing_card_${climbing_card_info.id}`, climbing_card_info.type_arg);
            }

                // risking it during climbOrRest
            if (Object.values(gamedatas.risked_assets).length > 0) {
                this.risky_climb = true;
                
                $('spread_draw').style.display = 'flex';
                let i = gamedatas.risked_assets.length;
                gamedatas.risked_assets.map(id => {
                    
                    const type_arg = gamedatas.asset_identifier[id];
                    const asset = gamedatas.asset_cards[type_arg];
                    if (this.isCurrentPlayerActive()) { $(`asset_card_${id}`).remove(); }
                    const ele = dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : id,
                        EXTRA_CLASSES : '',
                        acX : asset.x_y[0],
                        acY : asset.x_y[1],
                    }), $(`spread_draw_${i}`));
                    i--;
                });

                if (this.isCurrentPlayerActive()) {
                    const risked_num = gamedatas.risked_assets.length;
                    let empty_slots = [];
                    document.querySelectorAll('.hand_asset_wrap').forEach(wrap => {
                        if (wrap.children.length === 0) { empty_slots.push(wrap); }
                    });
                    for (let i=0; i<=risked_num-1; i++) {
                        const id = gamedatas.risked_assets[i];
                        const hand_slot = empty_slots[i];
                        this.risk_hand_slots[id] = hand_slot;
                    }
                }

                for (let hex_num of gamedatas.risk_pitches) {

                    if (!gamedatas.pitch_tracker[this.player_id].includes(`${hex_num}`)) {

                        const border_ele = $(`pitch_${hex_num}_border`);
                        const click_ele = $(`pitch_${hex_num}_click`);
                        click_ele.classList.add('cursor');
                        click_ele.style.pointerEvents = 'none';
                        if (hex_num === gamedatas.risk_pitches[0]) { border_ele.classList.add('selected_pitch'); }
                        else { border_ele.classList.add('available_pitch'); }
                    }
                }
            }

                // chooseSummitBetaToken
            if (gamedatas.current_state === 'chooseSummitBetaToken') {

                dojo.place('<div id="second_summit_beta_token" class="summit_pile_back summit_back" style="position: absolute; left: 217%;"></div>', 'summit_pile');
                $('summit_pile').style.zIndex = '201';
                $('climbing_discard').style.zIndex = '202';

                const token_1_info = gamedatas.chooseSummitBetaToken[0];
                const token_2_info = gamedatas.chooseSummitBetaToken[1];
                const token_1 = gamedatas.summit_beta_tokens[token_1_info.type_arg];
                const token_2 = gamedatas.summit_beta_tokens[token_2_info.type_arg];

                const styles = {
                    width: '200%',
                    height: '200%',
                    top: '57%',
                    left: '0',
                    marginLeft: '0'
                }
    
                if (this.isCurrentPlayerActive()) {
                    const token_1_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_1_info.id,
                        sbX : token_1['x_y'][0],
                        sbY : token_1['x_y'][1],
                    }), 'summit_pile');
    
                    const token_2_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_2_info.id,
                        sbX : token_2['x_y'][0],
                        sbY : token_2['x_y'][1],
                    }), 'second_summit_beta_token');
    
                    Object.assign(token_1_ele.style, styles);
                    Object.assign(token_2_ele.style, styles);
                }
    
                else {
                    const token_flip_1 = dojo.place(this.format_block('jstpl_flip_card', {
                        card_id : token_1_info.id,
                        extra_classes : 'token_flip',
                        back_type : 'summit_beta summit_back_for_flip',
                        front_type : 'summit_beta',
                        cX : token_1['x_y'][0],
                        cY : token_1['x_y'][1],
                    }), 'summit_pile');
        
                    const token_flip_2 = dojo.place(this.format_block('jstpl_flip_card', {
                        card_id : token_2_info.id,
                        extra_classes : 'token_flip',
                        back_type : 'summit_beta summit_back_for_flip',
                        front_type : 'summit_beta',
                        cX : token_2['x_y'][0],
                        cY : token_2['x_y'][1],
                    }), 'second_summit_beta_token');

                    Object.assign(token_flip_1.style, styles);
                    Object.assign(token_flip_2.style, styles);
                }
            }

                // riskSummitBeta state refresh
            if (gamedatas.riskSummitBetaFace) {

                const risk_die = $('risk_die');
                risk_die.style.display = 'none';
                const die_wrapper = $('die_wrapper');
                die_wrapper.style.display = 'block';
                die_wrapper.style.marginRight = '-51.2vmin';
                let die_face = null;
                if (gamedatas.riskSummitBetaFace === 2) { die_face = dojo.place(`<div id="die_face_2" class="risk_face risk_cards"></div>`, 'die_wrapper'); }
                else if (gamedatas.riskSummitBetaFace === 3) { die_face = dojo.place(`<div id="die_face_3" class="risk_face risk_card_and_psych"></div>`, 'die_wrapper'); }
                die_face.style.transform = 'none';
            }

                // crimperClimbingCards
            if (gamedatas.crimper_cards) {

                card_1_info = gamedatas.crimper_cards[0];
                card_2_info = gamedatas.crimper_cards[1];
                card_1 = gamedatas.climbing_cards[card_1_info.type_arg];
                card_2 = gamedatas.climbing_cards[card_2_info.type_arg];

                document.getElementById('crimper_display').style.display = 'block';
                const card_1_div = dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : card_1_info.id,
                    ccX : card_1.x_y[0],
                    ccY : card_1.x_y[1],
                    a_height : card_1.height_top_a[0],
                    a_top : card_1.height_top_a[1],
                    b_height : card_1.height_top_b[0],
                    b_top : card_1.height_top_b[1],
                }), 'crimper_display_1');
                const card_2_div = dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : card_2_info.id,
                    ccX : card_2.x_y[0],
                    ccY : card_2.x_y[1],
                    a_height : card_2.height_top_a[0],
                    a_top : card_2.height_top_a[1],
                    b_height : card_2.height_top_b[0],
                    b_top : card_2.height_top_b[1],
                }), 'crimper_display_2');
                this.utils.climbingTooltip(`climbing_card_${card_1_info.id}`, card_1_info.type_arg);
                this.utils.climbingTooltip(`climbing_card_${card_2_info.id}`, card_2_info.type_arg);
                $('climbing_dimmer').classList.add('dim_bg');
            }

                // final round
            if (Object.values(gamedatas.pitch_tracker).some(arr => arr.length === 9)) {
                const final_round_msg = document.createElement('div');
                final_round_msg.id = 'final_round_msg';
                final_round_msg.innerHTML = _('Final Round');
                const titlebar_addon = $('titlebar_addon');
                const climbing_slot = $('climbing_slot');
                titlebar_addon.insertBefore(final_round_msg, climbing_slot);
            }

                // end of game final situation
            if (gamedatas.current_state === 'gameEnd') {
                const titlebar_addon = $('titlebar_addon');
                const toggles_wrap = $('toggles_wrap');
                const addon_toggle = $('addon_toggle');
                const opponents_objectives_tracker = gamedatas.opponents_objectives_tracker;
                const scored_personal_objectives = gamedatas.scored_personal_objectives;
                const scorecard = document.createElement('div');
                scorecard.id = 'scorecard';
                titlebar_addon.append(scorecard);
                $('climbing_dimmer').classList.add('dim_bg');
                
                const scorecard_toggle = document.createElement('div');
                scorecard_toggle.id = 'scorecard_toggle';
                scorecard_toggle.innerHTML = _('Hide<br>Scorecard');
                scorecard_toggle.classList.add('addon_on', 'always_cursor', 'toggle');
                const personal_objectives_toggle = $('personal_objectives_toggle');
                toggles_wrap.insertBefore(scorecard_toggle, personal_objectives_toggle);
                scorecard_toggle.onclick = (evt) => { this.utils.toggleScorecard(evt); }

                const opponent_objectives_box = document.createElement('div');
                opponent_objectives_box.id = 'opponent_objectives_box';
                opponent_objectives_box.style.display = 'none';
                titlebar_addon.append(opponent_objectives_box);
                let pos_num = 1;
                for (const [player_id, objectives] of Object.entries(opponents_objectives_tracker)) {

                    if (player_id != this.player_id) {
                        const player_objectives_wrap = document.createElement('div');
                        player_objectives_wrap.id = `opponent_objectives_${pos_num}`;
                        player_objectives_wrap.classList.add('opponent_objectives_wrap');
                        opponent_objectives_box.append(player_objectives_wrap);
                        const player = gamedatas.players[player_id];
                        const name_span = dojo.place(this.format_block('jstpl_colored_name', {
                            player_id : player_id,
                            color : player.color,
                            player_name : player.name,
                        }), player_objectives_wrap);
                        name_span.style.display = 'block';
                        name_span.classList.add('opponent_objectives_name');

                        for (const objective_id of Object.keys(objectives)) {
                            const objective = gamedatas.personal_objectives[objective_id];
                            const coords = objective['x_y'];
                            const objective_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                                poId : `${objective_id}_opponent`,
                                poX : coords[0],
                                poY : coords[1],
                            }), player_objectives_wrap);
                            objective_ele.classList.add('opponent_objective_card');
                            const starting_top = objective['opponent_view_check_top'];

                            for (let index of opponents_objectives_tracker[player_id][objective_id]) {
                                const check = document.createElement('div');
                                check.classList.add('check');
                                check.innerHTML = '\u2713';
                                objective_ele.append(check);
                                const check_top = starting_top + 5.88 * index;
                                check.style.top = `${check_top}%`;
                            }
                            this.utils.personalObjectiveTooltip(objective_ele.id, objective_id);
                        }
                        pos_num++;
                    }
                }

                for (const [player_id, objective_id] of Object.entries(scored_personal_objectives)) {
                    if (objective_id) {
                        const objective = gamedatas.personal_objectives[objective_id];
                        this.scoreCtrl[player_id].incValue(objective.score);
                        const player = gamedatas.players[player_id];

                        if (player_id != this.player_id) {
                            $(`personal_objective_${objective_id}_opponent`).style.border = `4px solid #${player.color}`;
                        }
                    }
                }            

                const opponent_objectives_toggle = document.createElement('div');
                opponent_objectives_toggle.id = 'opponent_objectives_toggle';
                opponent_objectives_toggle.innerHTML = _('Show Opponent<br>Objectives');
                opponent_objectives_toggle.classList.add('addon_off', 'always_cursor', 'toggle');
                toggles_wrap.insertBefore(opponent_objectives_toggle, scorecard_toggle);
                opponent_objectives_toggle.onclick = (evt) => { this.utils.toggleOpponentObjectives(evt); }
            }

            // if empty, change gamedatas values from simple arrays into the associative arrays (such as expected by utils.sanitizeHand and utils.sanitizeAssetBoard)

            if (!this.isSpectator) {
                if (gamedatas.hand_assets.length === 0) { gamedatas.hand_assets = {}; }
                if (gamedatas.hand_summit_beta_tokens.length === 0) { gamedatas.hand_summit_beta_tokens = {}; }
            }
            if (gamedatas.asset_discard.length === 0) { gamedatas.asset_discard = {}; }

            for (let player of Object.keys(gamedatas.board_assets)) {
                for (let type of Object.keys(gamedatas.board_assets[player])) {
                    for (let slot of Object.keys(gamedatas.board_assets[player][type])) {
                        if (typeof gamedatas.board_assets[player][type][slot] == 'object' &&
                            gamedatas.board_assets[player][type][slot].length == 0) {
                                gamedatas.board_assets[player][type][slot] = {};
                        }
                    }
                }
            }
            for (let player of Object.keys(gamedatas.rope_overlaps)) {
                if (gamedatas.rope_overlaps[player].length === 0) { gamedatas.rope_overlaps[player] = {}; }
            }

            // change pagemaintitletext font-size based on the percentage of the titlebar's width that is taken up by elements
            {
                const titlebar = $('maintitlebar_content');
                let titlebar_width;
                const titlebar_observer = new ResizeObserver(changes => {
                    const change = changes[0];
                    if (change.contentRect.width != titlebar_width) {
                        titlebar_width = change.contentRect.width;
                        this.utils.resizeTitlebar();
                    }
                });
                titlebar_observer.observe(titlebar);

                const titlebar_child = titlebar.firstElementChild;
                const titlebar_children_observer = new MutationObserver(this.utils.checkTitlebarSize);
                titlebar_children_observer.observe(titlebar_child, { childList: true });

                const general_actions = $('generalactions');
                titlebar_children_observer.observe(general_actions, { childList: true });
            }


            /*********NEW HAND WORKSPACE*********/

            // asset cards
            let asset_1 = this.gamedatas.asset_cards[1];
            let asset_3 = this.gamedatas.asset_cards[3];
            let asset_19 = this.gamedatas.asset_cards[19];
            let asset_20 = this.gamedatas.asset_cards[20];
            let asset_21 = this.gamedatas.asset_cards[21];
            let asset_30 = this.gamedatas.asset_cards[30];
            let asset_13 = this.gamedatas.asset_cards[13];
            let asset_14 = this.gamedatas.asset_cards[14];
            let asset_15 = this.gamedatas.asset_cards[15];
            let a_coords_1 = asset_1['x_y'];
            let a_coords_3 = asset_3['x_y'];
            let a_coords_19 = asset_19['x_y'];
            let a_coords_20 = asset_20['x_y'];
            let a_coords_21 = asset_21['x_y'];
            let a_coords_30 = asset_30['x_y'];
            let a_coords_13 = asset_13['x_y'];
            let a_coords_14 = asset_14['x_y'];
            let a_coords_15 = asset_15['x_y'];
            /*dojo.place(`<div id="hand_asset_1" class="hand_asset_wrap"></div>`, 'assets_wrap');
            dojo.place(`<div id="hand_asset_2" class="hand_asset_wrap"></div>`, 'assets_wrap');
            dojo.place(`<div id="hand_asset_3" class="hand_asset_wrap"></div>`, 'assets_wrap');*/
            /*dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 30,
                    EXTRA_CLASSES : '',
                    acX : a_coords_30[0],
                    acY : a_coords_30[1],
                   })}`, 'hand_asset_1');*/
            /*dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 19,
                    EXTRA_CLASSES : '',
                    acX : a_coords_19[0],
                    acY : a_coords_19[1],
                  })}`, 'hand_asset_2');*/
            /*dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 21,
                    EXTRA_CLASSES : '',
                    acX : a_coords_21[0],
                    acY : a_coords_21[1],
                  })}`, 'hand_asset_3');*/
            /*dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 20,
                    EXTRA_CLASSES : '',
                    acX : a_coords_20[0],
                    acY : a_coords_20[1],
                  })}`, 'assets_wrap'
            );
            dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 1,
                    EXTRA_CLASSES : '',
                    acX : a_coords_1[0],
                    acY : a_coords_1[1],
                  })}`, 'assets_wrap'
            );
            dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 3,
                    EXTRA_CLASSES : '',
                    acX : a_coords_3[0],
                    acY : a_coords_3[1],
                  })}`, 'assets_wrap'
            );
            dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 13,
                    EXTRA_CLASSES : '',
                    acX : a_coords_13[0],
                    acY : a_coords_13[1],
                  })}`, 'assets_wrap'
            );
            dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 14,
                    EXTRA_CLASSES : '',
                    acX : a_coords_14[0],
                    acY : a_coords_14[1],
                  })}`, 'assets_wrap'
            );*/
            


            // tokens
            let summit_beta_1 = this.gamedatas.summit_beta_tokens[1];
            let summit_beta_2 = this.gamedatas.summit_beta_tokens[2];
            let summit_beta_3 = this.gamedatas.summit_beta_tokens[3];
            let summit_beta_4 = this.gamedatas.summit_beta_tokens[4];
            let sb_coords_1 = summit_beta_1['x_y'];
            let sb_coords_2 = summit_beta_2['x_y'];
            let sb_coords_3 = summit_beta_3['x_y'];
            let sb_coords_4 = summit_beta_4['x_y'];

            /*dojo.place(`<div id="hand_token_${1}" class="hand_token_wrap"></div>`, 'assets_wrap');
            dojo.place(
                `${this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : 1,
                    sbX : sb_coords_1[0],
                    sbY : sb_coords_1[1],
                })}`, 'hand_token_1');*/
            /*dojo.place(
                 `${this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : 3,
                    sbX : sb_coords_3[0],
                    sbY : sb_coords_3[1],
                 })}`, 'assets_wrap');*/

            // personal objectives
            let objective_1 = this.gamedatas.personal_objectives[1];
            let objective_2 = this.gamedatas.personal_objectives[2];
            let po_coords_1 = objective_1['x_y'];
            let po_coords_2 = objective_2['x_y'];
            /*dojo.place(
                `${this.format_block('jstpl_personal_objective', {
                    poId : 1,
                    poX : po_coords_1[0],
                    poY : po_coords_1[1],
                })}
                 ${this.format_block('jstpl_personal_objective', {
                    poId : 2,
                    poX : po_coords_2[0],
                    poY : po_coords_2[1],
                 })}`, 'hand_objectives');*/

            /*this.pitch_handlers = []; // TEST ALL PITCHES AS AVAILABLE/SELECTED
            for (let i=1; i<=32; i++) {

                const border_ele = $(`pitch_${i}_border`);
                const click_ele = $(`pitch_${i}_click`);
                border_ele.classList.add('available_pitch');
                click_ele.classList.add('cursor');
                this.pitch_handlers[i] = dojo.connect(click_ele, 'onclick', this, 'onSelectPitch');
            }*/

            /*******END NEW HAND WORKSPACE*******/

            /*******PHP DEBUGGING*******/

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },

        // Override for log injection
        format_string_recursive: function (log, args) {

            if (log === null) {
                console.error('format_string_recursive called with a null string with args:', args);
                return 'null_tr_string';
            }
            let formattedString = '';
            if (log) {
                const clientTranslatedString = this.clienttranslate_string(log);
                if (clientTranslatedString === null) {
                    this.showMessage('Missing translation for `' + log + '`', 'error');
                    console.error('Missing translation for `' + log + '`', 'error');
                    return '';
                }
                const { i18n = [] } = (args || {});
                (i18n || []).forEach(key => args[key] = this.clienttranslate_string(args[key]));
                Object.keys(args).forEach(key => {
                    if (key !== 'i18n' && typeof args[key] === 'object') {
                        if (args[key] !== null) {
                            if (args[key].log && args[key].args) {
                                args[key] = this.format_string_recursive(args[key].log, args[key].args);
                            }
                        }
                    }
                });
                try {
                    formattedString = dojo.string.substitute(clientTranslatedString, args);
                } catch (e) {
                    this.prevent_error_rentry = gameui.prevent_error_rentry || 0;
                    this.prevent_error_rentry++;
                    if (gameui.prevent_error_rentry >= 10) {
                        console.error('Preventing error reentry => ABORTING');
                    }
                    this.prevent_error_rentry--;
                    console.log('Bad substitution', log, args);
                    formattedString = clientTranslatedString;
                }
            }
            return this.utils.logInject(formattedString);
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName );

            this.gamedatas.current_state = stateName;
            if (args.args && args.args.climbing_card_info && Object.keys(args.args.climbing_card_info).length > 0) {
                this.gamedatas.climbing_card_info = args.args.climbing_card_info;
            }

            switch( stateName ) {
                case 'characterSelection':
                    const available_characters = dojo.query('#character selection .character').length;
                    // check # of available characters so as not to double dojo.connect() for starting player
                    if (this.isCurrentPlayerActive() && available_characters < this.player_count+1) {
                        dojo.query('.namebox').forEach((element) => {
                            element.classList.add('cursor');
                        });
                        this.character_handlers = []
                        dojo.query('.namebox').forEach(ele => {
                            this.character_handlers.push(dojo.connect(ele, 'onclick', this, 'onSelectCharacter'));
                        });
                    }
                    break;

                case 'drawAssets':

                    if (args.args.phase) {
                        const current_phase = $('phase_tracker').innerHTML.slice(7);
                        if (args.args.phase != current_phase) { this.utils.updateTitlebarAddon(args.args.phase, 'phase'); }
                    }
                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();

                        if (!args.args.spread_draw) {
                            dojo.place('<div id="minus_one" class="draw_button">-</div><div id="plus_one" class="draw_button">+</div>', 'asset_deck');
                            $('minus_one').classList.add('cursor');
                            $('plus_one').classList.add('cursor');
                            dojo.connect($('minus_one'), 'onclick', this, 'onSelectAsset');
                            dojo.connect($('plus_one'), 'onclick', this, 'onSelectAsset');
                            $('asset_deck').classList.add('selectable');
                        }

                        for (let slot=0; slot<=3; slot++) {
                            const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                            available_asset.classList.add('selectable', 'cursor');
                        }

                        // connect asset deck and spread cards to draw asset action
                        this.asset_handlers = [];
                        for (let slot=0; slot<=3; slot++) {
                            const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                            this.asset_handlers.push(dojo.connect(available_asset, 'onclick', this, 'onSelectAsset'));
                        }

                        // number of cards to be drawn
                        this.cards_to_draw = args.args.x_cards;
                    }
                    break;

                case 'climbOrRest':

                    if (args.args.round) {
                        const current_round = $('round_tracker').innerHTML.slice(7);
                        if (args.args.round != current_round) { this.utils.updateTitlebarAddon(args.args.round, 'round'); }
                    }
                    if (args.args.phase) {
                        const current_phase = $('phase_tracker').innerHTML.slice(7);
                        if (args.args.phase != current_phase) { this.utils.updateTitlebarAddon(args.args.phase, 'phase'); }
                    }
                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();

                        this.ignore_types = [];
                        this.pitch_handlers = [];
                        let i = 0;
                        for (let pitch_num of args.args.available_pitches) {

                            if (!args.args.pitch_tracker.includes(`${pitch_num}`)) {

                                const border_ele = $(`pitch_${pitch_num}_border`);
                                const click_ele = $(`pitch_${pitch_num}_click`);
                                border_ele.classList.add('available_pitch');
                                click_ele.classList.add('cursor');
                                this.pitch_handlers[i] = dojo.connect(click_ele, 'onclick', this, 'onSelectPitch');
                                i++;
                            }
                        }
                        this.resources = this.utils.getCurrentPlayerResources();
                    }
                    break;

                case 'climbingCard':

                    if (this.isCurrentPlayerActive()) {
                        this.utils.enableSummitBetaTokens();
                        this.utils.checkClimbingChoices();
                    }
                    this.utils.resizeHand();
                    break;

                case 'resting':
                    (async () => {
                        $('rest_water_draw_num').innerHTML = 0;
                        $('rest_psych_draw_num').innerHTML = 0;

                        this.resting_selection_handlers = [];
                        this.portaledge_selection_handlers = [];
                        const portaledge = $('portaledge');
                        $('rest_water_psych').style.display = 'block';

                        if (this.isCurrentPlayerActive()) {

                            this.utils.enableSummitBetaTokens();

                            let i = 0;

                            const water_minus = $('rest_water_minus_click');
                            const water_plus = $('rest_water_plus_click');
                            const psych_minus = $('rest_psych_minus_click');
                            const psych_plus = $('rest_psych_plus_click');
                            const test_arr = [water_minus, water_plus, psych_minus, psych_plus];

                            dojo.query('#rest_water_psych *').forEach(ele => { ele.style.display = 'block'; })
                            test_arr.forEach(ele => {
                                ele.classList.add('cursor');
                                this.resting_selection_handlers[i] = dojo.connect(ele, 'onclick', this, 'onRestWaterPsych');
                                i++;
                            });

                            i = 0;
                            dojo.query('.portaledge').forEach(deck => {

                                dojo.place(`<div id="${deck.id}_minus_one" class="porta_minus">-</div><div id="${deck.id}_plus_one" class="porta_plus">+</div>`, deck);
                                const deck_minus_one = $(`${deck.id}_minus_one`);
                                const deck_plus_one = $(`${deck.id}_plus_one`);
                                deck_minus_one.classList.add('cursor');
                                deck_plus_one.classList.add('cursor');

                                this.portaledge_selection_handlers[i] = dojo.connect(deck_minus_one, 'onclick', this, 'onSelectPortaledge');
                                this.portaledge_selection_handlers[i] = dojo.connect(deck_plus_one, 'onclick', this, 'onSelectPortaledge');
                                i++;
                            });

                            ['gear', 'face', 'crack', 'slab'].forEach(type => {
                                if ($(`porta${type}`).style.visibility === 'hidden') {
                                    dojo.query(`#porta${type} *`).forEach(ele => {
                                        ele.style.visibility = 'visible';
                                    });
                                    $(`porta${type}_minus_one`).style.clipPath = 'inset(4% -50% -1% 1% round 10px)';
                                    $(`porta${type}_minus_one`).style.height = '12%';
                                    $(`porta${type}_plus_one`).style.clipPath = 'inset(4% -2% 4% -23% round 10px)';
                                }
                            });
                        }

                        // Free Soloist & Phil
                        const player_id = this.getActivePlayerId();
                        const active_character_id = this.gamedatas.player_names_and_colors[player_id]['character'];
                        if (['2', '8'].includes(active_character_id)) { $('pagemaintitletext').innerHTML = $('pagemaintitletext').innerHTML.replace('five', _('six')); }

                        if (this.utils.shouldAnimate() && portaledge.style.display != 'block') {
                            portaledge.style.display = 'block';
                            await this.utils.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
                            portaledge.style.marginTop = 0;
                        }
                        else { // shouldn't animate
                            portaledge.style.display = 'block';
                            portaledge.style.marginTop = 0;
                        }
                    })();
                    break;

                case 'matchingTechniques':

                    this.gamedatas.climbing_card_info = [];
                    this.utils.updateTitlebarAddon('Follow', 'phase');
                    break;

                case 'discardAssets':

                    if (
                           !this.isSpectator
                       &&  ( $('assets_wrap').querySelector('.hand_asset_wrap:empty')
                       ||  $('assets_wrap').querySelector('.hand_token_wrap:empty') )
                       ) {
                        this.utils.resizeHand();
                       }

                    const climbing_card_info = this.gamedatas.climbing_card_info;
                    const climbing_card = Object.keys(climbing_card_info).length > 0;

                    if (climbing_card && $('climbing_slot').firstElementChild) { this.utils.retractClimbingCard(); }
                    this.discard_type = args.args.discard_type;
                    this.discard_num = args.args.discard_num;
                    this.asset_selection_handlers = [];
                    let hand_cards_of_discard_type = false;

                    const played = climbing_card && (climbing_card_info['choice_args']['card_in_hand'] || climbing_card_info['choice_args']['gear_in_hand']) ? true : false;
                    const player_id = this.getActivePlayerId();

                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();

                        let i = 0;
                        dojo.query('.hand_asset_wrap > .asset').forEach(ele => {
                            const id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const arg = this.gamedatas.asset_identifier[id];
                            const type = this.utils.getAssetType(arg);

                            if ((this.discard_type === 'any_skill' && type != 'gear') || (type === this.discard_type || !this.discard_type || this.discard_type == 'any_asset')) {
                                this.asset_selection_handlers[i] = dojo.connect(ele, 'onclick', this, 'onSelectAssetForDiscard');
                                ele.classList.add('cursor', 'selectable');
                                ele.parentElement.classList.add('selectable_wrap');
                                hand_cards_of_discard_type = true;
                                i++;
                            }
                        });

                        if (!hand_cards_of_discard_type && !played) {
                            let i = 0;
                            dojo.query(`#asset_board_${player_id} .played_asset`).forEach(ele => {
                                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                                const arg = this.gamedatas.asset_identifier[id];
                                const type = this.utils.getAssetType(arg);
                                if ((this.discard_type === 'any_skill' && type != 'gear') || (type === this.discard_type || !this.discard_type || this.discard_type == 'any_asset')) {
                                    this.asset_selection_handlers[i] = dojo.connect(ele, 'onclick', this, 'onSelectAssetForDiscard');
                                    ele.classList.add('cursor', 'selectable');
                                    i++;
                                }
                            });

                            dojo.query(`#asset_board_${player_id} .asset_counter`).forEach(ele => {
                                if (ele.style.display == 'block') {

                                    const type = ele.id.slice(-13, -8).replace(/_/g, '');
                                    if ((this.discard_type === 'any_skill' && type != 'gear') || (type === this.discard_type || !this.discard_type || this.discard_type == 'any_asset')) {
                                        dojo.place(this.format_block('jstpl_asset_counter_draw_box', {
                                            player_id : player_id,
                                            type : type
                                        }), ele);

                                        const minus_one = dojo.query(`#${ele.id} .tucked_minus_click`)[0];
                                        const plus_one = dojo.query(`#${ele.id} .tucked_plus_click`)[0];
                                        this.asset_selection_handlers[i] = dojo.connect(minus_one, 'onclick', this, 'onSelectAssetForDiscard');
                                        this.asset_selection_handlers[i+1] = dojo.connect(plus_one, 'onclick', this, 'onSelectAssetForDiscard');
                                        minus_one.classList.add('cursor', 'selectable');
                                        plus_one.classList.add('cursor', 'selectable');
                                    }
                                }
                            });
                        }
                    }  
                    break;

                case 'selectOpponent':
                    const climbing_card_type = this.gamedatas.climbing_card_info['type_arg'];
                    if (climbing_card_type && $('climbing_slot').firstElementChild) { this.utils.retractClimbingCard(); }
                    if (climbing_card_type || this.risk_it) { this.utils.enableSummitBetaTokens('select_opponent'); }
                    $(`player_${this.player_id}`).querySelectorAll('.permanent_asset.selectable').forEach(token => {
                        if (!token.classList.contains('selected_token')) { token.classList.remove('selectable', 'cursor'); }
                    });
                    $(`player_${this.player_id}`).querySelectorAll('.gear_token_border').forEach(border => {
                        if (!border.classList.contains('selected_gear_border')) { border.remove(); }
                    });
                    break;

                case 'selectPortaledge':
                    (async () => {
                        const climbing_card_info = this.gamedatas.climbing_card_info;
                        if (climbing_card_info != [] && $('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }
                        this.portaledge_selection_handlers = [];
                        const portaledge = $('portaledge');
                        this.portaledge_num = climbing_card_info.portaledge_num || null;
                        this.portaledge_types = climbing_card_info.portaledge_types || null;

                        if (this.getActivePlayerId() == this.player_id) {
                            
                            this.utils.enableSummitBetaTokens();

                            let i = 0;
                            dojo.query('.portaledge').forEach(deck => {
                                const deck_type = deck.id.slice(5);
                                if (!this.portaledge_types || this.portaledge_types.includes(deck_type)) {
                                    dojo.place(`<div id="${deck.id}_minus_one" class="porta_minus">-</div><div id="${deck.id}_plus_one" class="porta_plus">+</div>`, deck);
                                    const deck_minus_one = $(`${deck.id}_minus_one`);
                                    const deck_plus_one = $(`${deck.id}_plus_one`);
                                    deck_minus_one.classList.add('cursor');
                                    deck_plus_one.classList.add('cursor');

                                    ['gear', 'face', 'crack', 'slab'].forEach(type => {
                                        if (deck.style.visibility === 'hidden') {
                                            dojo.query(`#${deck.id} *`).forEach(ele => {
                                                ele.style.visibility = 'visible';
                                            });
                                            $(`${deck.id}_minus_one`).style.clipPath = 'inset(4% -50% -1% 1% round 10px)';
                                            $(`${deck.id}_minus_one`).style.height = '12%';
                                            $(`${deck.id}_plus_one`).style.clipPath = 'inset(4% -2% 4% -23% round 10px)';
                                        }
                                    });

                                    this.portaledge_selection_handlers[i] = dojo.connect(deck_minus_one, 'onclick', this, 'onSelectPortaledge');
                                    i++;
                                    this.portaledge_selection_handlers[i] = dojo.connect(deck_plus_one, 'onclick', this, 'onSelectPortaledge');
                                    i++;
                                }
                            });
                        }

                        if (this.utils.shouldAnimate() && portaledge.style.display != 'block') {
                            portaledge.style.display = 'block';
                            await this.utils.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
                            portaledge.style.marginTop = 0;
                        }
                        else { // shouldn't animate
                            portaledge.style.display = 'block';
                            portaledge.style.marginTop = 0;
                        }
                    })();
                    break;

                case 'addTokenToPitch':
                    if (this.isCurrentPlayerActive()) { this.utils.enableSummitBetaTokens(); }

                    dojo.query('.token_button').forEach(ele => {
                        
                        const button_type = ele.firstElementChild.id.slice(0, -6);
                        if (!args.args.climbing_card_info.token_types.includes(button_type)) { ele.classList.add('disabled'); }
                    });
                    break;

                case 'addAssetToAssetBoard':
                    if (!$('climbing_discard_straightened').firstElementChild) { this.utils.retractClimbingCard(); }

                    let add_types = args.args.types;
                    if (this.free_solo_hecked) {
                        add_types = ['face', 'crack', 'slab'];
                        this.free_solo_hecked = false;
                    }
                    this.asset_selection_handlers = [];

                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();

                        let i = 0;
                        dojo.query('.hand_asset_wrap > .asset').forEach(ele => {
                            const id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const type_arg = this.gamedatas.asset_identifier[id];
                            const type = this.utils.getAssetType(type_arg);

                            if (add_types.includes(type) || add_types.includes('any')) {
                                this.asset_selection_handlers[i] = dojo.connect(ele, 'onclick', this, 'onSelectAssetToAssetBoard');
                                ele.classList.add('cursor', 'selectable');
                                ele.parentElement.classList.add('selectable_wrap');
                                i++;
                            }
                        });
                    }
                    break;

                case 'stealFromAssetBoard':
                    if ($('climbing_slot').firstElementChild) { this.utils.retractClimbingCard(); }

                    const steal_type = args.args.types;
                    this.asset_selection_handlers = [];

                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();

                        let i = 0;
                        dojo.query('.asset_board_slot > .asset').forEach(ele => {
                            const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const type_arg = this.gamedatas.asset_identifier[asset_id];
                            const type = this.utils.getAssetType(type_arg);
                            const player_id = ele.parentElement.parentElement.parentElement.id.slice(-7);

                            if ((steal_type == type || !steal_type) && player_id != this.player_id) {
                                this.asset_selection_handlers[i] = dojo.connect(ele, 'onclick', this, 'onSelectStealFromAssetBoard');
                                ele.classList.add('cursor', 'selectable');
                            }
                        });

                        dojo.query('.asset_counter').forEach(ele => {

                            const player_id = ele.parentElement.parentElement.id.slice(-7);
                            if (ele.style.display == 'block' && player_id != this.player_id) {
                                const type = ele.id.slice(-13, -8).replace(/_/g, '');
                                if ((steal_type == type || !steal_type) && player_id != this.player_id) {
                                    dojo.place(this.format_block('jstpl_asset_counter_draw_box', {
                                        player_id : player_id,
                                        type : type
                                    }), ele);
                                    const minus_one = dojo.query(`#${ele.id} .tucked_minus_click`)[0];
                                    const plus_one = dojo.query(`#${ele.id} .tucked_plus_click`)[0];
                                    this.asset_selection_handlers[i] = dojo.connect(minus_one, 'onclick', this, 'onSelectStealFromAssetBoard');
                                    this.asset_selection_handlers[i+1] = dojo.connect(plus_one, 'onclick', this, 'onSelectStealFromAssetBoard');
                                    minus_one.classList.add('cursor', 'selectable');
                                    plus_one.classList.add('cursor', 'selectable');
                                }
                            }
                        });
                    }
                    break;

                case 'chooseSummitBetaToken':

                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();

                        const token_1_ele = dojo.query('#summit_pile .summit_beta_click')[0].parentElement;
                        const token_2_ele = dojo.query('#summit_pile .summit_beta_click')[1].parentElement;
        
                        token_1_ele.classList.add('selectable_token', 'cursor');
                        token_2_ele.classList.add('selectable_token', 'cursor');
        
                        this.token_selection_handlers = [
                            dojo.connect(token_1_ele, 'onclick', this, 'onSelectChooseSummitBetaToken'),
                            dojo.connect(token_2_ele, 'onclick', this, 'onSelectChooseSummitBetaToken'),
                        ];
                    }
                    break;

                case 'chooseTechniqueToken':

                    if (this.isCurrentPlayerActive()) { this.utils.enableSummitBetaTokens(); }

                    dojo.query('.token_button').forEach(ele => {
                        dojo.setStyle(ele.firstElementChild, {
                            'width' : '38px',
                            'height' : '36px',
                            'left' : '1%',
                            'top' : '-10%',
                        });
                    });
                    break;

                case 'riskSummitBeta':
                    (async () => {
                        if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }
                    })();

                    if (this.isCurrentPlayerActive()) { this.utils.enableSummitBetaTokens('risk_summit_beta'); }
                    break;

                case 'crimperClimbingCards':
                    const drawn_climbing = document.querySelectorAll('.drawn_climbing');
                    const card_1 = drawn_climbing[0];
                    const card_2 = drawn_climbing[1];
                    if (this.isCurrentPlayerActive()) {
                        card_1.onclick = (evt) => { this.onCrimperSelectCard(evt); }
                        card_2.onclick = (evt) => { this.onCrimperSelectCard(evt); }
                        card_1.classList.add('cursor');
                        card_2.classList.add('cursor');

                        this.utils.enableSummitBetaTokens();
                    }
                    break;
            }

        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName ) {
                case 'characterSelection':
                    for (const key in this.character_handlers) {
                        dojo.disconnect(this.character_handlers[key]);
                    }

                    // remove the leftover character
                    if (dojo.query('#character_selection div:not(.vis_hidden)').length == 1) { 
                        $('character_selection_ratio').remove();
                    }

                    // remove selectable effects and event listeners for the player who just chose their character
                    if (this.isCurrentPlayerActive()) { 
                        dojo.query('#character_selection *').forEach((ele) => { ele.classList.remove('cursor'); });
                        this.disconnect($('confirm_button'), 'onclick');
                    }
                    break;

                case 'drawAssets':
                    for (const key in this.asset_handlers) {
                        dojo.disconnect(this.asset_handlers[key]);
                    }
                    dojo.query('.cursor').forEach(ele => { if (!ele.classList.contains('summit_beta_click')) { ele.classList.remove('cursor'); }});
                    this.asset_handlers = [];

                    const deck_classes = $('asset_deck').classList;
                    if (deck_classes.contains('draw')) {
                        deck_classes.remove(deck_classes[deck_classes.length-1]); // Number
                        deck_classes.remove('draw'); // 'draw'
                    }
                    break;

                case 'climbOrRest':
                    for (const key in this.resource_handlers) {
                        dojo.disconnect(this.resource_handlers[key]);
                    }
                    for (const key in this.pitch_handlers) {
                        dojo.disconnect(this.pitch_handlers[key]);
                    }

                    if (!this.risky_climb) {

                        dojo.query('.selected_pitch').forEach(ele => { ele.classList.remove('selected_pitch'); });
                        dojo.query('.selected_token').forEach(ele => { ele.classList.remove('selected_token'); });
                        dojo.query('.selected_token_wrap').forEach(ele => { ele.classList.remove('selected_token_wrap'); });
                        dojo.query('.available_pitch').forEach(ele => { ele.classList.remove('available_pitch'); })
                        dojo.query('.asset.cursor').forEach(ele => {
                            ele.classList.remove('cursor', 'selectable');
                            ele.parentElement.classList.remove('selectable_wrap');
                        });
                        dojo.query('.permanent_asset.cursor').forEach(ele => { ele.classList.remove('cursor', 'selectable'); });
                        dojo.query('.pitch_click').forEach(ele => { ele.classList.remove('cursor'); });
                    }

                    this.pitch_handlers = [];
                    this.resource_handlers = [];
                    this.requirements_met = true;

                    if (this.borrowed_rack_requirements) { delete this.borrowed_rack_requirements; }
                    if (this.jumar_requirements) { delete this.jumar_requirements; }
                    if (this.extra_water_requirements) { delete this.extra_water_requirements; }
                    if (this.guidebook_requirements) {
                        delete this.guidebook_requirements;
                        delete this.guidebook_token;
                    }
                    break;

                case 'climbingCard':
                    dojo.query('.cursor').forEach((ele) => { if (!ele.classList.contains('summit_beta_click')) { ele.classList.remove('cursor'); }});
                    if (this.isCurrentPlayerActive()) { for (let handler of this.climbing_card_choice_handlers) { dojo.disconnect(handler); } }
                    this.choices_info = {};
                    break;

                case 'resting':
                    for (let handler of this.resting_selection_handlers) { dojo.disconnect(handler); }
                    for (let handler of this.portaledge_selection_handlers) { dojo.disconnect(handler); }
                    this.rest_resources = 0;
                    $('rest_water_psych').style.display = '';
                    dojo.query('.rest_click').forEach(ele => { ele.style.display = ''; });
                    dojo.query('.rest_minus').forEach(ele => { ele.style.display = ''; });
                    dojo.query('.rest_plus').forEach(ele => { ele.style.display = ''; });
                    dojo.query('.rest_draw_num').forEach(ele => { ele.style.display = ''; });
                    dojo.query('.draw').forEach(ele => {
                        ele.classList.remove('draw');
                        ele.classList.remove(ele.classList[ele.classList.length-1]);
                    });
                    break;

                case 'discardAssets':
                    dojo.query('.cursor').forEach(ele => {
                        if (!ele.classList.contains('summit_beta_click') && !ele.classList.contains('choice')) {
                            ele.classList.remove('cursor', 'selectable', 'selected_resource');
                            ele.parentElement.classList.remove('selectable_wrap');
                        }
                    });
                    dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); })
                    for (const key in this.asset_selection_handlers) {
                        dojo.disconnect(this.asset_selection_handlers[key]);
                    }
                    dojo.query('.tucked_draw_box').forEach(ele => { ele.remove(); });
                    this.asset_selection_handlers = [];
                    this.discard_num = null;
                    this.selected_tucked = [];
                    break;

                case 'selectPortaledge':
                    for (let handler of this.portaledge_selection_handlers) { dojo.disconnect(handler); }
                    dojo.query('.draw').forEach(ele => {
                        ele.classList.remove('draw');
                        ele.classList.remove(ele.classList[ele.classList.length-1]);
                    });
                    this.portaledge_num = null;
                    break;

                case 'addAssetToAssetBoard':
                    for (const key in this.asset_selection_handlers) {
                        dojo.disconnect(this.asset_selection_handlers[key]);
                    }
                    this.asset_selection_handlers = [];
                    break;

                case 'stealFromAssetBoard':
                    for (const key in this.asset_selection_handlers) {
                        dojo.disconnect(this.asset_selection_handlers[key]);
                    }
                    dojo.query('.tucked_draw_box').forEach(ele => { ele.remove(); });
                    this.asset_selection_handlers = [];
                    this.selected_tucked = [];
                    break;

                case 'chooseSummitBetaToken':
                    for (const key in this.token_selection_handlers) {
                        dojo.disconnect(this.token_selection_handlers[key]);
                    }
                    this.token_selection_handlers = [];
                    if (!this.utils.shouldAnimate()) {
                        dojo.query('.token_flip').forEach(ele => { ele.remove(); });
                    }
                    $('summit_pile').style.zIndex = '';
                    break;

                case 'riskSummitBeta':
                    this.gamedatas.riskSummitBetaFace = null;
                    break;
            }
        },

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );

            this.gamedatas.climbing_card_info = [];
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName ) {
                    case 'characterSelection':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmCharacter', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        break;

                    case 'drawAssets':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssets', null, false, 'white');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0) {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'climbOrRest':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmPitch', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        this.addActionButton('rest_button', _('Rest'), 'onRest', null, false, 'white');
                        this.addActionButton('trade_button', _('Trade'), 'onTrade', null, false, 'white');
                        break;

                    case 'climbingCard':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmClimbingCardChoice', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'white');
                        $('show_hide_card_button').classList.add('shown');


                        if (this.character_id === '10') {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'discardAssets':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssetsForDiscard', null, false, 'white');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0
                         && this.gamedatas.climbing_card_info.choice_args.benefit != 'rollRiskDie') {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), 'onUndoClimbingCard', null, false, 'red');
                        }
                        break;

                    case 'selectOpponent':
                        const players = Object.values(this.gamedatas.players);
                        for (const player of players) {
                            const character = this.gamedatas.characters[`${player.character}`]
                            if (player.id != this.player_id) {
                                this.addActionButton(`${player.id}`, `${player.name}`, 'onSelectOpponent');
                                $(`${player.id}`).style.cssText = `
                                    color: #fff;
                                    background: #${player.color} !important;
                                    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 1px black;
                                `;
                                $(`${player.id}`).classList.add('opponent');
                            }
                        }
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmOpponent', null, false, 'white');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0
                         && this.gamedatas.climbing_card_info.choice_args.benefit != 'rollRiskDie'
                         && this.gamedatas.climbing_card_info.type_arg != '19') {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'selectPortaledge':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmPortaledge', null, false, 'white');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (    Object.keys(this.gamedatas.climbing_card_info).length != 0
                             && this.gamedatas.climbing_card_info.choice_args.benefit != 'rollRiskDie'
                             && this.gamedatas.climbing_card_info.player_id == this.player_id
                            ) {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'resting':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmPortaledge', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        break;

                    case 'addTokenToPitch':
                        this.addActionButton('gear_button', '<div id="gear_token" class="skills_and_techniques gear_token"></div>', 'onSelectAssetType', null, false, 'blue');
                        $('gear_button').classList.add('token_button');
                        this.addActionButton('face_button', '<div id="face_token" class="skills_and_techniques face_token"></div>', 'onSelectAssetType', null, false, 'blue');
                        $('face_button').classList.add('token_button');
                        this.addActionButton('crack_button', '<div id="crack_token" class="skills_and_techniques crack_token"></div>', 'onSelectAssetType', null, false, 'blue');
                        $('crack_button').classList.add('token_button');
                        this.addActionButton('slab_button', '<div id="slab_token" class="skills_and_techniques slab_token"></div>', 'onSelectAssetType', null, false, 'blue');
                        $('slab_button').classList.add('token_button');
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssetType', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'white');
                        $('show_hide_card_button').classList.add('shown');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0 && this.character_id === '10') {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'addAssetToAssetBoard':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssetToAssetBoard', null, false, 'white');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0) {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'stealFromAssetBoard':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmStealFromAssetBoard', null, false, 'white');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0) {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'chooseSummitBetaToken':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmChooseSummitBetaToken', null, false, 'white');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0
                         && this.gamedatas.climbing_card_info.type_arg != '19') {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'chooseTechniqueToken':
                        this.addActionButton('precision_button', '<div id="precision_token" class="skills_and_techniques precision_token"></div>', 'onSelectTechniqueToken', null, false, 'blue');
                        $('precision_button').classList.add('token_button');
                        this.addActionButton('balance_button', '<div id="balance_token" class="skills_and_techniques balance_token"></div>', 'onSelectTechniqueToken', null, false, 'blue');
                        $('balance_button').classList.add('token_button');
                        this.addActionButton('pain_tolerance_button', '<div id="pain_tolerance_token" class="skills_and_techniques pain_tolerance_token"></div>', 'onSelectTechniqueToken', null, false, 'blue');
                        $('pain_tolerance_button').classList.add('token_button');
                        this.addActionButton('power_button', '<div id="power_token" class="skills_and_techniques power_token"></div>', 'onSelectTechniqueToken', null, false, 'blue');
                        $('power_button').classList.add('token_button');
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmTechniqueToken', null, false, 'white');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (    Object.keys(this.gamedatas.climbing_card_info).length != 0
                             && this.gamedatas.climbing_card_info.player_id == this.player_id
                            ) {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'choosePermanentAssets':
                        const available_tokens = args.available_permanent_assets;

                        for (const [player, types] of Object.entries(available_tokens)) {
                            if (player == this.player_id) {

                                const character_num = this.gamedatas.players[this.player_id]['character'];
                                const character = this.gamedatas.characters[character_num];
                                const max_tokens = character.permanent_asset_slots;
                                const board_assets = this.gamedatas.board_assets[this.player_id];
                                const current_tokens = board_assets['gear']['permanent'] + board_assets['face']['permanent'] + board_assets['crack']['permanent'] + board_assets['slab']['permanent'];

                                let currently_selected = 0;
                                for (const [type, num] of Object.entries(types)) {
                                    for (let i=1; i<=num; i++) {

                                        this.addActionButton(`${type}_button_${i}`, `<div id='${type}_wrapper_${i}' class='button_wrap'></div>`, 'onSelectPermanentAsset', null, false, 'blue');
                                        const wrapper = document.getElementById(`${type}_wrapper_${i}`);
                                        const icon = document.createElement('div');
                                        icon.id = `${type}_token_${i}`;
                                        icon.classList.add('skills_and_techniques', `${type}_token`);
                                        wrapper.append(icon);
                                        const new_button = $(`${type}_button_${i}`);
                                        new_button.classList.add('token_button', `${type}_button`);
                                        const checkbox = document.createElement('div');
                                        checkbox.classList.add('pa_checkbox');
                                        if (current_tokens + currently_selected < max_tokens) {
                                            new_button.firstElementChild.firstElementChild.classList.add('selected_asset_type');
                                            currently_selected++;
                                            checkbox.innerHTML = '\u2611';
                                        }
                                        else {
                                            checkbox.innerHTML = '\u2610';
                                        }
                                        wrapper.append(checkbox);
                                    }
                                }
                                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmPermanentAssets', null, false, 'blue');
                            }
                        }
                        break;

                    case 'riskSummitBeta':
                        this.addActionButton('continue_button', _('Continue'), 'onConfirmRiskSummitBeta', null, false, 'blue');
                        break;

                    case 'crimperClimbingCards':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmCrimperClimbingCard', null, false, 'blue');
                        $('confirm_button').classList.add('disabled');
                        this.addActionButton('show_hide_card_button', _('Hide cards'), 'onShowHideCard', null, false, 'white');
                        $('show_hide_card_button').classList.add('shown');
                        break;
                }
            } else {
                switch (stateName) {
                    case 'climbingCard':
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'white');
                        $('show_hide_card_button').classList.add('shown');
                        break;
                    case 'addTokenToPitch':
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'white');
                        $('show_hide_card_button').classList.add('shown');
                        break;
                    case 'crimperClimbingCards':
                        this.addActionButton('show_hide_card_button', _('Hide cards'), 'onShowHideCard', null, false, 'white');
                        $('show_hide_card_button').classList.add('shown');
                        break;
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */

        placeholder: function(evt) {
            return;
        },

        onSelectCharacter: function(evt) {
            dojo.stopEvent(evt);

            const character = evt.currentTarget.id.slice(-2).replace(/^\D+/g, '');

            if (this.checkAction('selectCharacter')) {
                dojo.query('#character_selection *').forEach((element) => {
                    if (`namebox_${character}` === element.id) {
                        element.classList.add('namebox_selected');
                    } else {
                        element.classList.remove('namebox_selected');
                    }
                });

                dojo.query('#show_character .character').forEach((element) => {
                    if (`character_${character}` === element.id) {
                        element.style.display = 'inline-block';
                    } else {
                        element.style.display = 'none';
                    }
                });

                if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
            }
        },

        onConfirmCharacter: function(evt) {
            dojo.stopEvent(evt);

            const character = dojo.query('.namebox_selected')[0].id.slice(-2).replace(/^\D+/g, '');

            if (this.checkAction('confirmCharacter')) {
                this.ajaxcall("/firstascent/firstascent/confirmCharacter.html", { lock: true,
                    character : character
                }, this, function(result) {} );
            }
        },

        onSelectAsset: function(evt) {
            dojo.stopEvent(evt);

            const deck_classes = $('asset_deck').classList;
            const deck_draw_str = deck_classes.item(deck_classes.length - 1);
            let deck_draw_num = Number(deck_draw_str) || 0;
            let spread_draw_num = dojo.query('.selected_asset').length;

            if (evt.currentTarget.id == 'plus_one') {
                if (deck_draw_num + spread_draw_num == this.cards_to_draw) { return; }
                if (!deck_classes.contains('draw')) {
                    deck_classes.add('draw', '1');
                    dojo.place('<span id="draw_num">1</span>', 'asset_deck');
                } else {
                    deck_classes.remove(deck_draw_str);
                    deck_classes.add(`${deck_draw_num+1}`);
                    $('draw_num').innerHTML = `${deck_draw_num+1}`;
                }
                deck_draw_num++;
            } else if (evt.currentTarget.id == 'minus_one') {
                if (deck_classes.contains('1')) {
                    deck_classes.remove('draw', '1');
                    dojo.destroy('draw_num');
                } else if (deck_classes.contains('draw')) {
                    deck_classes.remove(deck_draw_str);
                    deck_classes.add(`${deck_draw_num-1}`);
                    $('draw_num').innerHTML = `${deck_draw_num-1}`;
                }
                deck_draw_num--;
            } else {
                const asset_card = evt.currentTarget;
                if (asset_card.classList.contains('selected_asset')) { 
                    asset_card.classList.remove('selected_asset');
                    spread_draw_num--;
                }
                else if (deck_draw_num + spread_draw_num == this.cards_to_draw) { return; }
                else { 
                    asset_card.classList.add('selected_asset');
                    spread_draw_num++;
                }
            }

            if ((deck_draw_num + spread_draw_num === this.cards_to_draw) && $('confirm_button').classList.contains('disabled')) { 
                $('confirm_button').classList.remove('disabled');
            } else if ((deck_draw_num + spread_draw_num != this.cards_to_draw) && !$('confirm_button').classList.contains('disabled')) {
                $('confirm_button').classList.add('disabled');
            }
        },

        onConfirmAssets: function(evt) {
            dojo.stopEvent(evt);

            let spread_to_draw = '';
            dojo.query('.selected_asset').forEach((ele) => {
                const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
                spread_to_draw += `${asset_id},`;
            });

            const deck_classes = $('asset_deck').classList;
            const deck_to_draw = Number(deck_classes[deck_classes.length - 1]) || 0;

            if (this.checkAction('confirmAssets')) {
                this.ajaxcall("/firstascent/firstascent/confirmAssets.html", { lock: true,
                    spread_assets : spread_to_draw,
                    deck_assets : deck_to_draw
                }, this, function(result) {} );
            }
        },

        // onSelectPitch: function(evt) { // FOR TESTING BORDERS
        //     dojo.stopEvent(evt);

        //     const pitch = evt.target.previousElementSibling;
        //     const pitch_border = pitch.previousElementSibling;

        //     dojo.query('.selected_pitch').forEach(ele => {
        //         ele.classList.remove('selected_pitch');
        //         ele.classList.add('available_pitch');
        //     });

        //     if (pitch_border.classList.contains('available_pitch')) {

        //         pitch_border.classList.remove('available_pitch');
        //         pitch_border.classList.add('selected_pitch');
        //     }
        //     else {

        //         pitch_border.classList.remove('selected_pitch');
        //         pitch_border.classList.add('available_pitch');
        //     }
        // },

        onSelectPitch: function(evt) {
            dojo.stopEvent(evt);

            const pitch = evt.target.previousElementSibling;
            const pitch_border = pitch.previousElementSibling;

            if (pitch_border.classList.contains('selected_pitch')) {
                pitch_border.classList.remove('selected_pitch');
                pitch_border.classList.add('available_pitch');
                document.querySelectorAll('.requirement_wrap').forEach(ele => { ele.remove(); });
                if ($('risk_it_message')) { $('risk_it_message').remove(); }
                if ($('requirements_message')) { $('requirements_message').remove(); }
                $('confirm_button').classList.add('disabled');
            }

            else {
                const hex_num = pitch.id.slice(-2).replace(/^\D+/g, '');
                const pitch_num = pitch.classList[pitch.classList.length-1].slice(-2).replace(/^\D+/g, '');

                const unoccupied = pitch.querySelector('.meeple') == null ? true : false;
                const summit_arr = this.board === 'desert' ? ['31', '32'] : ['41', '42', '43'];
                const summit = summit_arr.includes(hex_num);
                if (unoccupied || this.gamedatas.gamestate.name === 'addTokenToPitch' || summit) { 
                    dojo.query('#generalactions .requirement_wrap').forEach(ele => { ele.remove(); });
                    if (!$('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.add('disabled'); }
                    if ($('requirements_message')) { $('requirements_message').remove(); }
                    if ($('risk_it_message')) { $('risk_it_message').remove(); }
                    const selected_pitch = dojo.query('.selected_pitch')[0];
                    if (selected_pitch) { 
                        selected_pitch.classList.remove('selected_pitch');
                        selected_pitch.classList.add('available_pitch');
                    }
                    pitch_border.classList.remove('available_pitch');
                    pitch_border.classList.add('selected_pitch');

                    if (this.gamedatas.gamestate.name === 'climbOrRest') {
                        const check_requirements = this.utils.checkRequirements();
                        const pitch_requirements = check_requirements[1];
                        this.pitch_requirements = pitch_requirements;

                        const available_face = this.resources['skills']['face'] + this.resources['permanent_skills']['face'];
                        const available_crack = this.resources['skills']['crack'] + this.resources['permanent_skills']['crack'];
                        const available_slab = this.resources['skills']['slab'] + this.resources['permanent_skills']['slab'];

                        let requirements_met = 0;
                        const all_skills = available_face + available_crack + available_slab;
                        const skill_requirements = pitch_requirements['face'] + pitch_requirements['crack'] + pitch_requirements['slab'] + pitch_requirements['any_skill'];
                        for (const [type, value] of Object.entries(pitch_requirements)) {

                            if (type == 'any_skill' && value > 0) {

                                let extra_skills = 0;
                                const extra_face = available_face - pitch_requirements['face'];
                                const extra_crack = available_crack - pitch_requirements['crack'];
                                const extra_slab = available_slab - pitch_requirements['slab'];
                                for (const extra of [extra_face, extra_crack, extra_slab]) {
                                    if (extra > 0) { extra_skills += extra; }
                                }
                                const missing_requirements = extra_skills - value;
                                if (missing_requirements < 0) { requirements_met += Math.abs(missing_requirements); }
                            }

                            else if (['gear', 'face', 'crack', 'slab'].includes(type) && value > 0) {

                                const missing_requirements = (this.resources['skills'][type] + this.resources['permanent_skills'][type]) - value;
                                if (missing_requirements < 0) { requirements_met += Math.abs(missing_requirements); }
                            }

                            else if (type === 'water' && value > 0) {
                                const missing_requirements = this.resources['water'] - pitch_requirements.water; 
                                if (missing_requirements < 0) { requirements_met += Math.abs(missing_requirements); }
                            }
                            else if (type === 'psych' && value > 0) {
                                const missing_requirements = this.resources['psych'] - pitch_requirements.psych; 
                                if (missing_requirements < 0) { requirements_met += Math.abs(missing_requirements); }
                            }
                        }

                        // Dirtbag
                        if (this.character_id === '3' && requirements_met > 0 && this.resources['skills']['gear'] > pitch_requirements['gear']) {
                            requirements_met--;
                        }

                        // Overstoker
                        if (this.character_id === '5' && this.resources['psych'] > pitch_requirements['psych']) {
                            requirements_met--;
                        }

                        // Phil
                        if (this.character_id === '8' && requirements_met === 0) {
                            requirements_met = 1;
                            this.phil = true;
                        }

                        // Crag Mama
                        if (this.character_id === '9') {
                            const cutoff = this.board === 'desert' ? 21 : 27;
                            if (hex_num <= cutoff) { requirements_met--; }
                        }

                        // Bionic Woman
                        if (this.character_id === '11') {

                            const face = this.resources['skills']['face'] + this.resources['permanent_skills']['face'] - pitch_requirements['face'];
                            const crack = this.resources['skills']['crack'] + this.resources['permanent_skills']['crack'] - pitch_requirements['crack'];
                            const slab = this.resources['skills']['slab'] + this.resources['permanent_skills']['crack'] - pitch_requirements['slab'];
                            const total = face + crack + slab - pitch_requirements['any_skill'];

                            if (total >= 0 && [face, crack, slab].some(num => num < 0)) {
                                requirements_met--;
                            }
                        }

                        // Buff Boulderer
                        if (this.character_id === '12') {

                            const value = this.gamedatas.pitches[pitch_num]['value'];
                            if (value === 4) { requirements_met--; }
                            else if (value === 5) { requirements_met -= 2; }
                        }

                        // If the pitch has been previously climbed by other players
                        let already_climbed = 0;
                        let selected_pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
                        let selected_hex = selected_pitch.id.slice(-2).replace(/^\D+/g, '');
                        for (const [player, pitch_list] of Object.entries(this.gamedatas.pitch_tracker)) {
                            if (player != this.player_id && pitch_list.includes(`${selected_hex}`)) {
                                already_climbed++;
                            }
                        }
                        requirements_met -= already_climbed;

                        if (requirements_met <= 0) { requirements_met = true; }
                        else if (requirements_met > 1) { requirements_met = false; }
                        if (this.character_id === '8' && requirements_met === true) { requirements_met = 1; } // Phil

                        this.utils.displayRequirements(this.resources, pitch_requirements);

                        for (let type_arg of ['2', '3', '5', '8']) {
                            if (Object.values(this.gamedatas.hand_summit_beta_tokens).includes(type_arg)) {
                                const id = Object.keys(this.gamedatas.hand_summit_beta_tokens).find(key => this.gamedatas.hand_summit_beta_tokens[key] === type_arg);
                                const token = $(`summit_beta_${id}`);
                                this.onUndoSummitBetaPassive(token, Number(type_arg), true);
                            }
                        }
                        this.utils.enableSummitBetaTokens('climb_pitch');

                        const missing_water_psych = dojo.query('.water_psych_border').length;
                        const missing_gears = dojo.query('.gear_border').length;
                        const missing_skills = dojo.query('.skill_border').length;

                        if (requirements_met) { $('confirm_button').classList.remove('disabled'); }
                        if (requirements_met === 1 && !$('risk_it_message')) { $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                            `<span id="risk_it_message">
                                <span id="ri_line1">You may</span>
                                <span id="ri_line2">risk it</span>
                            </span>`
                        ); }
                        if (!requirements_met && !$('requirements_message')) { $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                            `<span id="requirements_message">
                                <span id="re_line1">Can't fulfill</span>
                                <span id="re_line2">requirements</span>
                            </span>`
                        ); }

                        this.requirements_met = requirements_met;
                    } else { $('confirm_button').classList.remove('disabled'); }
                }
            }
        },

        onConfirmPitch: function(evt) {
            dojo.stopEvent(evt);

            for (let handler of this.pitch_handlers) { dojo.disconnect(handler); }
            dojo.query('.available_pitch').forEach((ele) => {
                ele.nextElementSibling.nextElementSibling.classList.remove('cursor');
            });
            dojo.query('.selected_pitch')[0].nextElementSibling.nextElementSibling.classList.remove('cursor');
            if (document.querySelector('#my_undo_button')) { document.querySelector('#my_undo_button').remove(); }

            const icons = $('generalactions').querySelectorAll('.requirement_wrap');
            let unfulfilled_icons = 0;
            for (const icon of icons) {
                if (!icon.querySelector('.requirement_border') && !icon.classList.contains('fulfilled')) {
                    unfulfilled_icons++;
                }
            }

            // If the pitch has already been climbed
            let selected_pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
            let selected_hex = selected_pitch.id.slice(-2).replace(/^\D+/g, '');
            for (const [player, pitch_list] of Object.entries(this.gamedatas.pitch_tracker)) {
                if (player != this.player_id && pitch_list.includes(`${selected_hex}`) && !this.already_climbed_trigger) {
                    this.already_climbed++;
                }
            }
            if (this.already_climbed > 0 && unfulfilled_icons > 0) { // update this and Phil below to check if there are any unfulfilled icons left
                this.utils.updateTitlebar(_(`As previously climbed, you must select ${this.already_climbed} Asset(s) to ignore`));
                this.utils.clicksOff('hard_off');
                this.addActionButton('my_undo_button', _('Undo'), 'undoOnSelectResources', null, false, 'white');
                if ($('risk_it_message')) { $('risk_it_message').remove(); }
                this.utils.enableRequirementButtons(document.querySelectorAll('.requirement_wrap:not(.fulfilled)'), 'onSelectConversion');
            }

            // Phil
            else if (this.character_id === '8' && !document.querySelector('.requirement_border') && unfulfilled_icons > 0) {
                this.utils.updateTitlebar(_('You must select an asset to risk missing as Phil'));
                this.utils.clicksOff('hard_off');
                this.addActionButton('my_undo_button', _('Undo'), 'undoOnSelectResources', null, false, 'white');
                if ($('risk_it_message')) { $('risk_it_message').remove(); }
                this.utils.enableRequirementButtons(document.querySelectorAll('.requirement_wrap:not(.fulfilled)'), 'addRequirementBorder');
            }

            else { // not already climbed, not Phil or there is already a requirement border

                this.utils.updateTitlebar(_('You must select Assets'));
                $('confirm_button').remove();
                $('rest_button').remove();

                let confirm = false;
                let requirements_met = this.requirements_met;
                this.already_climbed_trigger = false;
                if (this.borrowed_rack_requirements) { requirements_met = this.borrowed_rack_requirements; }
                if (this.jumar_requirements) {
                    requirements_met = this.jumar_requirements;
                    confirm = true;
                    dojo.query('.requirement_wrap > .skills_and_techniques').forEach(ele => {

                        if (!ele.parentElement.classList.contains('fulfilled')) { confirm = confirm === 1 ? false : 1; }
                    });
                }
                if (this.extra_water_requirements) { requirements_met = this.extra_water_requirements; }
                if (this.guidebook_requirements) { requirements_met = this.guidebook_requirements; }

                if (requirements_met === true) {

                    this.addActionButton('confirm_requirements_button', _('Confirm'), 'onConfirmRequirements', null, false, 'white');
                    const button = $('confirm_requirements_button');
                    button.classList.add('disabled');
                    $('generalactions').insertBefore(button, $('generalactions').firstChild);

                    if (confirm === true) { button.classList.remove('disabled'); }
                    
                    let non_water_psych = 0;
                    document.querySelectorAll('.requirement_wrap').forEach(ele => {
                        if (
                               !ele.classList.contains('water_wrap')
                            && !ele.classList.contains('psych_wrap')
                            && !ele.classList.contains('fulfilled')
                            && !ele.querySelector('.requirement_border')
                        ) {
                            non_water_psych++;
                        }
                    });
                    if (non_water_psych === 0) { button.classList.remove('disabled'); }
                }

                else if (requirements_met === 1) {

                    this.addActionButton('risk_it_button', _('Risk it'), 'onConfirmRequirements', null, false, 'white');
                    const button = $('risk_it_button');
                    button.classList.add('disabled');
                    $('generalactions').insertBefore(button, $('generalactions').firstChild);
                    if ($('risk_it_message')) { $('risk_it_message').remove(); }

                    if (confirm === 1) { button.classList.remove('disabled'); }

                    let non_water_psych = 0;
                    document.querySelectorAll('.requirement_wrap').forEach(ele => {
                        if (
                               !ele.classList.contains('water_wrap')
                            && !ele.classList.contains('psych_wrap')
                            && !ele.classList.contains('fulfilled')
                            && !ele.querySelector('.requirement_border')
                        ) {
                            non_water_psych++;
                        }
                    });
                    if (non_water_psych === 0) { button.classList.remove('disabled'); }
                }
        
                this.addActionButton('my_undo_button', _('Undo'), 'undoOnSelectResources', null, false, 'white');

                const pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
                const hex_num = pitch.id.slice(-2).replace(/^\D+/g, '');
                const pitch_num = pitch.classList[pitch.classList.length-1].slice(-2).replace(/^\D+/g, '');
                const selected_pitch = dojo.query('.selected_pitch')[0];
                const pitch_requirements = this.gamedatas.pitches[pitch_num]['requirements'];

                this.resource_handlers = [];
                dojo.query('#assets_wrap .asset').forEach(ele => {
                    this.resource_handlers.push(dojo.connect(ele, 'onclick', this, 'onSelectResource'));
                    ele.classList.add('cursor', 'selectable');
                    ele.parentElement.classList.add('selectable_wrap');
                });
                dojo.query(`#asset_board_${this.player_id} .permanent_asset`).forEach(ele => {
                    if (ele.classList.contains('gear_token')) {

                        const gear_token_border = document.createElement('div');
                        gear_token_border.classList.add('gear_token_border');
                        ele.insertAdjacentElement('beforebegin', gear_token_border);
                    }
                    else { ele.classList.add('selectable'); }

                    ele.classList.add('cursor');
                    this.resource_handlers.push(dojo.connect(ele, 'onclick', this, 'onSelectResource')); 
                });
                this.utils.resizeHand();

                // Dirtbag
                if (this.character_id === '3') {
                    this.addActionButton('dirtbag_button', _('<div class="button_text_wrap">Substitute<br>Requirement</div>'), 'onSelectDirtbag', null, false, 'blue');
                    this.addTooltipHtml('dirtbag_button', _('Substitute a Gear card for another required asset'), 500);
                }

                // Overstoker
                if (this.character_id === '5') {
                    this.addActionButton('overstoker_button', _('<div class="button_text_wrap">Substitute<br>Requirement</div>'), 'onSelectOverstoker', null, false, 'blue');
                    this.addTooltipHtml('overstoker_button', _('Substitute a Psych for another required asset'), 500);
                }

                // Crag Mama
                if (this.character_id === '9') {
                    const cutoff = this.board === 'desert' ? 21 : 27;
                    if (hex_num <= cutoff) {
                        this.addActionButton('crag_mama_button', _('<div class="button_text_wrap">Ignore<br>Requirement</div>'), 'onSelectCragMama', null, false, 'blue');
                        this.addTooltipHtml('crag_mama_button', _('Pay one fewer asset'), 500);
                    }
                }

                // Bionic Woman
                if (this.character_id === '11') {
                    this.addActionButton('bionic_woman_button', _('<div class="button_text_wrap">Substitute<br>Requirement</div>'), 'onSelectBionicWoman', null, false, 'blue');
                    this.addTooltipHtml('bionic_woman_button', _('Substitute a Skill card for another Skill type'), 500);
                }

                // Buff Boulderer
                if (this.character_id === '12') {
                    const value = this.gamedatas.pitches[pitch_num]['value'];
                    if ([4, 5].includes(value)) {
                        this.utils.clicksOff('hard_off');
                        const asset_board_ele = $(`asset_board_${this.player_id}`);
                        asset_board_ele.querySelectorAll('.permanent_assets_wrapper > .gear_token_border').forEach(ele => { ele.style.display = 'none'; });
                        this.ignore = value === 4 ? 1 : 2;
                        this.utils.updateTitlebar(_(`As Buff Boulderer, you must select ${this.ignore} requirement(s) to ignore`));

                        let icons = [];
                        if (document.querySelector('.requirement_border')) {
                            document.querySelectorAll('.requirement_border').forEach(ele => { icons.push(ele.parentElement); });
                        }
                        else { icons = document.querySelectorAll('.requirement_wrap'); }

                        this.utils.enableRequirementButtons(icons, 'onSelectConversion');
                    }
                }

                if (typeof this.guidebook_token === 'object') {

                    const token = this.guidebook_token;
                    const skills_wrapper = document.createElement('div');
                        skills_wrapper.id = 'sb_skills_wrapper'
                        skills_wrapper.innerHTML = `
                            <div id="sb_face" class="skills_and_techniques face_token selectable_skill cursor"></div>
                            <div id="sb_crack" class="skills_and_techniques crack_token selectable_skill cursor"></div>
                            <div id="sb_slab" class="skills_and_techniques slab_token selectable_skill cursor"></div>
                        `;
                        token.append(skills_wrapper);

                        dojo.connect($('sb_face'), 'onclick', this, 'onSelectSBSkill');
                        dojo.connect($('sb_crack'), 'onclick', this, 'onSelectSBSkill');
                        dojo.connect($('sb_slab'), 'onclick', this, 'onSelectSBSkill');
                }
            }
        },

        onRest: function(evt) {
            dojo.stopEvent(evt);

            dojo.query('#generalactions > .requirement_wrap').forEach(ele => { ele.remove(); });
            dojo.query('#requirements_message').forEach(ele => { ele.remove(); });
            dojo.query('.selected_pitch').forEach(ele => {
                ele.classList.remove('selected_pitch');
                ele.classList.add('available_pitch');
            });
            if (!$('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.add('disabled'); }

            const player_id = this.getActivePlayerId();

            this.confirmationDialog(_('You will not climb a pitch this round.'), () => {
                this.utils.disableSummitBetaTokens();
                if (this.checkAction('rest')) {
                    this.ajaxcall("/firstascent/firstascent/rest.html", { lock: true,
                        player_id : player_id
                    }, this, function(result) {} );
                }
            });
        },

        onTrade: function(evt) {
            dojo.stopEvent(evt);

            dojo.query('#generalactions > .requirement_wrap').forEach(ele => { ele.remove(); });
            dojo.query('#requirements_message').forEach(ele => { ele.remove(); });
            dojo.query('.selected_pitch').forEach(ele => {
                ele.classList.remove('selected_pitch');
                ele.classList.add('available_pitch');
            });
            for (const key in this.resource_handlers) { dojo.disconnect(this.resource_handlers[key]); }
            dojo.query('.selected_resource').forEach(ele => {
                ele.classList.remove('selected_resource');
                ele.parentElement.classList.remove('selected_resource_wrap');
            });
            dojo.query('.permanent_assets_wrapper > .selected_token').forEach(ele => {
                ele.classList.remove('selected_token', 'selectable', 'cursor');
            });
            this.unnecessary_requirements = 0;
            
            this.removeActionButtons();
            this.utils.updateTitlebar(_('You must choose 3 Assets of the same type'));

            const player_id = this.getActivePlayerId();

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmTradeResources', null, false, 'white');
            $('confirm_button').classList.add('disabled');

            this.addActionButton('my_undo_button', _('Undo'), dojo.hitch(this, function() {
                dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('selected_resource'); });
                dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
                this.utils.clicksOn('pitches');
                for (const i in this.trade_handlers) { dojo.disconnect(this.trade_handlers[i]); }
                this.trade_handlers = [];
                this.restoreServerGameState();
            }), null, false, 'white');

            this.trade_handlers = [];
            let i = 0;
            dojo.query('#assets_wrap .asset').forEach(ele => {
                ele.classList.add('cursor', 'selectable');
                ele.parentElement.classList.add('selectable_wrap');
                this.trade_handlers[i] = dojo.connect(ele, 'onclick', this, 'onSelectTrade');
                i++;
            });
            this.utils.clicksOff('pitches');
        },

        onSelectTrade: function(evt) {
            dojo.stopEvent(evt);

            const asset_ele = evt.target;
            const id = asset_ele.id.slice(-3).replace(/^\D+/g, '');
            const type_arg = this.gamedatas.asset_identifier[id];
            const asset_type = this.utils.getAssetType(type_arg);

            dojo.query('#bad_selection_message').forEach(ele => { ele.remove(); });

            if (asset_ele.classList.contains('selected_resource')) {
                asset_ele.classList.remove('selected_resource');
                asset_ele.parentElement.classList.remove('selected_resource_wrap');
            }
            else {
                asset_ele.classList.add('selected_resource');
                asset_ele.parentElement.classList.add('selected_resource_wrap');
            }

            const selected_cards = dojo.query('.selected_resource');
            let trade_requirements = selected_cards.length === 3 ? true : false;
            let trade_type = '';
            selected_cards.forEach(ele => {

                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                const type_arg = this.gamedatas.asset_identifier[id];
                const asset_type = this.utils.getAssetType(type_arg);

                if (!trade_type) { trade_type = asset_type; }
                if (trade_type != asset_type) { trade_requirements = false; }
            });

            const confirm_button = $('confirm_button');
            if (trade_requirements && confirm_button.classList.contains('disabled')) {
                confirm_button.classList.remove('disabled');
            } else if (!confirm_button.classList.contains('disabled')) {
                confirm_button.classList.add('disabled');
            }
        },

        onConfirmTradeResources: async function(evt) {
            dojo.stopEvent(evt);

            this.utils.clicksOff();
            for (const i in this.trade_handlers) { dojo.disconnect(this.trade_handlers[i]); }

            this.selected_cards = dojo.query('.selected_resource');
            dojo.query('#assets_wrap .asset').forEach(ele => {
                ele.classList.remove('cursor', 'selectable', 'selected_resource');
                ele.parentElement.classList.remove('selectable_wrap');
            });

            this.removeActionButtons();

            let cards_to_discard = [];

            this.selected_cards.forEach(ele => {

                ele.style.zIndex = '10';
                ele.parentElement.style.zIndex = '10';
                const args = [ele, $('asset_discard'), 3];
                cards_to_discard.push(this.utils.animationPromise.bind(null, ele, 'asset_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
            });

            this.utils.updateTitlebar(_('Discarding assets'));
            Promise.all(cards_to_discard.map(func => { return func(); })).then( async () => {

                this.portaledge_selection_handlers = [];
                const portaledge = $('portaledge');
                this.portaledge_num = 1;

                let i = 0;
                dojo.query('.portaledge').forEach(deck => {
                    
                    dojo.place(`<div id="${deck.id}_minus_one" class="porta_minus">-</div><div id="${deck.id}_plus_one" class="porta_plus">+</div>`, deck);
                    const deck_minus_one = $(`${deck.id}_minus_one`);
                    const deck_plus_one = $(`${deck.id}_plus_one`);
                    deck_minus_one.classList.add('cursor');
                    deck_plus_one.classList.add('cursor');

                    this.portaledge_selection_handlers[i] = dojo.connect(deck_minus_one, 'onclick', this, 'onSelectPortaledge');
                    i++;
                    this.portaledge_selection_handlers[i] = dojo.connect(deck_plus_one, 'onclick', this, 'onSelectPortaledge');
                    i++;
                });

                this.utils.updateTitlebar(_('You must take 1 card from The Portaledge'));
                portaledge.style.display = 'block';
                await this.utils.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
                portaledge.style.marginTop = 0;

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmTrade', null, false, 'white');
                $('confirm_button').classList.add('disabled');
                this.addActionButton('my_undo_button', _('Undo'), dojo.hitch(this, async function() {
                    dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('selected_resource'); });
                    dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
                    dojo.query('.pitch_click').forEach(ele => { ele.style.display = 'block'; });
                    const selected_ids = this.selected_cards.map(ele => ele.id.slice(-3).replace(/^\D+/g, ''));
                    const hand_slots = this.utils.resizeHand('asset', selected_ids);
                    selected_ids.forEach(id => {
                        $(`hand_asset_${hand_slots[id]}`).append($(`asset_card_${id}`)); 
                    });
                    this.selected_cards = null;
                    for (const i in this.portaledge_selection_handlers) { dojo.disconnect(this.portaledge_selection_handlers[i]); }
                    await this.utils.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
                    dojo.query('.portaledge > .cursor').forEach(ele => { ele.remove(); });
                    dojo.query('.portaledge > .draw_num').forEach(ele => { ele.remove(); });
                    portaledge.style.marginTop = '-36.4061%';
                    portaledge.style.display = '';
                    this.restoreServerGameState();
                    this.utils.clicksOn();
                }), null, false, 'white');
            });
        },

        onConfirmTrade: function(evt) {
            dojo.stopEvent(evt);

            for (const idx in this.portaledge_selection_handlers) { dojo.disconnect(this.portaledge_selection_handlers[idx]); }
            this.portaledge_selection_handlers = [];
            this.portaledge_num = null;

            let portaledge_to_draw = '';
            for (const type of ['portagear', 'portaface', 'portacrack', 'portaslab']) {

                const deck_classes = $(type).classList;
                const deck_draw_str = deck_classes.item(deck_classes.length - 1);
                let deck_draw_num = Number(deck_draw_str) || 0;
                if (deck_draw_num === 1) {
                    portaledge_to_draw = type.slice(5);
                    $(type).classList.remove('draw', '1');
                }
            }

            let traded_resources = '';
            this.selected_cards.forEach(ele => {
                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                traded_resources += `${id},`;                
            });
            this.selected_cards = null;

            this.utils.clicksOn();
            this.utils.clicksOn('pitches');

            if (this.checkAction('confirmTrade')) {
                this.ajaxcall("/firstascent/firstascent/confirmTrade.html", { lock: true,
                    traded_resources : traded_resources,
                    portaledge_to_draw : portaledge_to_draw
                }, this, function(result) {} );
            }
        },

        onSelectResource: function(evt) {
            dojo.stopEvent(evt);

            const resource = evt.target;
            let asset_type = null;

            if (resource.classList.contains('asset')) {

                const id = resource.id.slice(-3).replace(/^\D+/g, '');
                const type_arg = this.gamedatas.asset_identifier[id];
                asset_type = this.utils.getAssetType(type_arg);
            }
            else if (resource.classList.contains('permanent_asset')) { asset_type = resource.id.slice(0, 5).replace(/_/g, ''); }
            else if (resource.classList.contains('selectable_skill')) { asset_type = resource.id.slice(3); }

            let requirement_icon = null;
            const action = resource.classList.contains('selected_skill') ||
                           resource.classList.contains('selected_resource') ||
                           resource.classList.contains('selected_token') ||
                           (resource.classList.contains('permanent_asset') 
                             && resource.previousElementSibling
                             && resource.previousElementSibling.classList.contains('selected_gear_border')) ? 'deselect' : 'select';

            dojo.query('#bad_selection_message').forEach(ele => { ele.remove(); });

            if (resource.classList.contains('asset')) {

                const hand_ele = $('assets_wrap');
                const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

                if (resource.classList.contains('selected_resource')) {
                    resource.classList.remove('selected_resource', 'unnecessary_resource');
                    resource.parentElement.classList.remove('selected_resource_wrap');
                }
                else {
                    resource.classList.add('selected_resource');
                    resource.parentElement.classList.add('selected_resource_wrap');
                }

                const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
                if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
            }

            else if (resource.classList.contains('permanent_asset')) {

                if (resource.classList.contains('gear_token')) {
                    if (resource.previousElementSibling.classList.contains('selected_gear_border')) {
                        resource.previousElementSibling.classList.remove('selected_gear_border');
                    } else {
                        resource.previousElementSibling.classList.add('selected_gear_border');
                    }
                }
                else {
                    if (resource.classList.contains('selected_token')) {
                        resource.classList.remove('selected_token');
                    }
                    else { resource.classList.add('selected_token'); }
                }
            }

            else if (resource.classList.contains('selectable_skill')) {

                if (resource.classList.contains('selected_skill')) { resource.classList.remove('selected_skill'); }
                else { resource.classList.add('selected_skill'); }
            }

            const check_requirements = this.utils.checkRequirements();
            const selected_resources = check_requirements[0];
            const pitch_requirements = check_requirements[1];
            const selected_pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
            const pitch_num = selected_pitch.classList[selected_pitch.classList.length-1].slice(-2).replace(/^\D+/g, '');

            if (action === 'deselect') {

                // for (const ele of [...$('generalactions').children]) { // removes planned unfulfilled requirements from equation (ie risked requirement)

                //     if (ele.classList.contains('requirement_wrap')) {

                //         const icon_type = ele.classList[1].slice(0, -5);
                //         const has_border = [...ele.children].some(child => child.classList.contains('requirement_border')) ? true : false;
                //         if (has_border) { pitch_requirements[icon_type]--; }
                //     }
                // }

                for (const ele of [...$('generalactions').children].reverse()) {

                    if (ele.classList.contains('requirement_wrap')) {

                        const icon_type = ele.classList[1].slice(0, -5);

                        if (
                               (asset_type === icon_type 
                            || (icon_type === 'any_skill' && asset_type != 'gear')) // any skill
                            && ele.classList.contains('fulfilled')
                            && selected_resources[icon_type] < pitch_requirements[icon_type]
                            && !ele.classList.contains('overstoker_converted')
                        ) {
                                requirement_icon = ele;
                                break;
                        }
                    }
                }
            }

            
            else if (action === 'select') {

                const general = $('generalactions');

                // check if there's a valid requirement for this resource to fulfill
                for (const ele of general.children) {

                    if (ele.classList.contains('requirement_wrap') && !ele.classList.contains('water_wrap') && !ele.classList.contains('psych_wrap')) {

                        const icon_type = ele.classList[1].slice(0, -5);
                        if ((asset_type === icon_type 
                            || (
                                   icon_type === 'any_skill'
                                && asset_type != 'gear'
                                && ![...general.children].some(
                                                                child => child.classList.contains(`${asset_type}_wrap`)
                                                                     && !child.classList.contains('fulfilled')
                                                                     && !child.parentElement.querySelector('.ignored')
                                                                )
                            )) // any_skill
                            && !ele.classList.contains('fulfilled')
                            && ele.children.length === 1) {

                                requirement_icon = ele;
                                break;
                        }
                    }
                }
            }

            if (action === 'select' && requirement_icon) { requirement_icon.classList.add('fulfilled'); }
            else if (action === 'deselect' && requirement_icon) { requirement_icon.classList.remove('fulfilled'); }
            else if (action === 'select' && !requirement_icon) {
                this.unnecessary_requirements++;
                if (resource.classList.contains('gear_token') && resource.classList.contains('permanent_asset')) {
                    resource.previousElementSibling.classList.add('unnecessary_gear_border');    
                }
                else { resource.classList.add('unnecessary_resource'); }
            }
            else if (action === 'deselect' && !requirement_icon) {
                this.unnecessary_requirements--;
                let remade_necessary = false; // If there are two unnecessary face selected, for example, deselecting the necessary face
                                              // should make one of the two unnecessary ones into a necessary one (black border instead of red)
                if (this.unnecessary_requirements > 0) {
                    const unnecessary_resources = document.querySelectorAll('.unnecessary_resource');
                    for (const ele of unnecessary_resources) {
                        const id = ele.id.slice(-3).replace(/^\D+/g, '');
                        const type_arg = this.gamedatas.asset_identifier[id];
                        const type = this.utils.getAssetType(type_arg);
                        if (asset_type === type && document.querySelector(`.${type}_wrap.fulfilled`)) {
                            ele.classList.remove('unnecessary_resource');
                            remade_necessary = true;
                            break;
                        }
                    }
                    if (   asset_type === 'gear'
                        && !remade_necessary
                        && document.querySelector('.unnecessary_gear_border')
                        && document.querySelector(`.${type}_wrap.fulfilled`)) {

                            document.querySelector('.unnecessary_gear_border').classList.remove('unnecessary_gear_border');
                        }
                }
            }

            const hex_num = selected_pitch.id.slice(-2).replace(/^\D+/g, '');
            const cutoff = this.board === 'desert' ? 21 : 27;
            const value = this.gamedatas.pitches[pitch_num]['value'];

            if (this.unnecessary_requirements < 0) { this.unnecessary_requirements = 0; }
            if (this.unnecessary_requirements > 0) {
                $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                    `<span id="bad_selection_message">
                        <span id="bs_line1">Unnecessary</span>
                        <span id="bs_line2">Asset(s) selected</span>
                    </span>`
                );
            }
            else if (this.unnecessary_requirements === 0) {
                document.querySelectorAll('.unnecessary_resource').forEach(ele => ele.classList.remove('unnecessary_resource'));
                document.querySelectorAll('.unnecessary_gear_border').forEach(ele => ele.classList.remove('unnecessary_gear_border'));
            }

            this.pitch_requirements = pitch_requirements;
            this.utils.checkConfirmButton(selected_resources, pitch_requirements);
        },

        onConfirmRequirements: function(evt) {
            dojo.stopEvent(evt);

            let selected_resources = '';
            dojo.query('.selected_resource').forEach(resource => {
                const id = resource.id.slice(-3).replace(/^\D+/g, '');
                selected_resources += `${id},`;
            });
            let selected_tokens_arr = {'gear':0, 'face':0, 'crack':0, 'slab':0};
            dojo.query('.selected_token').forEach(token => {
                if (!token.classList.contains('summit_beta')) {
                    const type = token.id.slice(0, 5).replace(/_/g, '');
                    selected_tokens_arr[type]++;
                }
            });
            let selected_tokens = ''
            Object.values(selected_tokens_arr).forEach(num => { selected_tokens += num + ','; })

            // if guidebook is selected but no skill icon is selected, consider it unused and deselect it
            if ($('sb_skills_wrapper') && dojo.query('.selected_skill').length === 0) {

                $('sb_skills_wrapper').parentElement.classList.remove('selected_token');
                $('sb_skills_wrapper').parentElement.parentElement.classList.remove('selected_token_wrap');
                $('sb_skills_wrapper').remove();
            }

            let selected_summit_betas = '';
            dojo.query('#assets_wrap .summit_beta').forEach(token => {

                if (token.classList.contains('selected_token')) {
                    const id = token.id.slice(-3).replace(/^\D+/g, '');
                    const type_arg = this.gamedatas.token_identifier[id];
                    selected_summit_betas += `${type_arg},`;
                }
            });

            this.ignore_types = [];

            // Dirtbag
            let dirtbag = document.querySelector('.dirtbag_converted') ? [true] : false;
            if (dirtbag) {
                const icon = document.querySelector('.dirtbag_converted');
                const old_type = icon.classList[icon.classList.length - 1];
                dirtbag.push(old_type);
            }

            // Phil
            delete this.phil;
            const ignored = document.querySelector('.ignored');
            if (this.character_id === '8' && ignored && ignored.classList[0] === 'water_psych_border') {
                const type = ignored.parentElement.classList[1].slice(0, -5);
                this.pitch_requirements[type]--;
            }

            // Bionic Woman
            let bionic_woman = document.querySelector('.bionic_woman_converted') ? [true] : false;
            if (bionic_woman) {
                const icon = document.querySelector('.bionic_woman_converted');
                const old_type = icon.classList[icon.classList.length -1];
                bionic_woman.push(old_type);
            }

            const selected_hex = dojo.query('.selected_pitch')[0].nextElementSibling;
            const selected_hex_id = selected_hex.id.slice(-2).replace(/^\D+/g, '');
            const length = selected_hex.classList.length;
            const selected_pitch_type = selected_hex.classList[length-1];
            const selected_pitch_id = selected_pitch_type.slice(-2).replace(/^\D+/g, '');
            const risk_it = $('risk_it_button') ? true : false;
            const extra_water = this.extra_water_requirements ? true : false;

            let requirements_for_action = '';
            for (let val of Object.values(this.pitch_requirements)) { requirements_for_action += `${String(val)},`; }

            if (risk_it && this.checkAction('riskIt')) {
                this.ajaxcall("/firstascent/firstascent/riskIt.html", { lock: true,
                    requirements : requirements_for_action,
                    selected_resources : selected_resources,
                    selected_tokens : selected_tokens,
                    selected_summit_betas : selected_summit_betas,
                    selected_hex : selected_hex_id,
                    selected_pitch : selected_pitch_id,
                    extra_water : extra_water,
                    dirtbag : dirtbag,
                    bionic_woman : bionic_woman,
                }, this, function(result) {} );
            }

            else if (!risk_it && this.checkAction('confirmRequirements')) {
                this.ajaxcall("/firstascent/firstascent/confirmRequirements.html", { lock: true,
                    requirements : requirements_for_action,
                    selected_resources : selected_resources,
                    selected_tokens : selected_tokens,
                    selected_summit_betas : selected_summit_betas,
                    selected_hex : selected_hex_id,
                    selected_pitch : selected_pitch_id,
                    extra_water : extra_water,
                    dirtbag : dirtbag,
                    bionic_woman : bionic_woman,
                }, this, function(result) {} );
            }
        },

        onShowHideCard: function(evt) {
            dojo.stopEvent(evt);

            const player_id = this.getActivePlayerId();
            const confirm_button = document.getElementById('confirm_button');
            const climbing_dimmer = document.getElementById('climbing_dimmer');

            if (this.gamedatas.players[player_id]['character'] === '10' && this.gamedatas.current_state === 'crimperClimbingCards') { // Cool-Headed Crimper

                const crimper_display = document.getElementById('crimper_display');
                if (evt.target.innerHTML === 'Hide cards') { // hide
                    crimper_display.style.display = '';
                    climbing_dimmer.style.display = 'none';
                    evt.target.innerHTML = _('Show cards');
                    evt.target.classList.remove('shown');
                    evt.target.classList.add('hidden');
                    if (this.isCurrentPlayerActive()) { confirm_button.classList.add('disabled'); }
                    
                } else { // show                    
                    crimper_display.style.display = 'block';
                    climbing_dimmer.style.display = 'block';
                    evt.target.innerHTML = _('Hide cards');
                    evt.target.classList.remove('hidden');
                    evt.target.classList.add('shown');
                    if (document.querySelector('.selected_asset')) { confirm_button.classList.remove('disabled'); }
                }
            }

            else {

                climbing_slot = $('climbing_slot');

                if (evt.target.innerHTML === 'Hide card') { // hide
                    climbing_slot.style.display = '';
                    climbing_dimmer.style.display = 'none';
                    evt.target.innerHTML = _('Show card');
                    if (this.isCurrentPlayerActive()) {
                        if (confirm_button.classList.contains('disabled')) {
                            this.confirm_disabled = true;
                        }
                        else { confirm_button.classList.add('disabled'); }
                        document.querySelectorAll('.selected_asset_type').forEach(ele => {
                            ele.classList.remove('selected_asset_type');
                            ele.parentElement.style.background = '';
                        });
                    }

                } else { // show
                    climbing_slot.style.display = 'block';
                    climbing_dimmer.style.display = 'block';
                    evt.target.innerHTML = _('Hide card');

                    if (this.isCurrentPlayerActive()) {
                        if (document.querySelector('.selected_choice') && !this.confirm_disabled) { confirm_button.classList.remove('disabled'); }
                        else { this.confirm_disabled = false; }

                        const choice_top = dojo.query('#climbing_slot .a')[0];
                        const choice_bottom = dojo.query('#climbing_slot .b')[0];
                        if (choice_top) {
                            this.climbing_card_choice_handlers[0] = dojo.connect(choice_top, 'onclick', this, 'onSelectClimbingCardChoice');
                            this.climbing_card_choice_handlers[1] = dojo.connect(choice_bottom, 'onclick', this, 'onSelectClimbingCardChoice');
                            choice_top.classList.add('cursor');
                            choice_bottom.classList.add('cursor');
                        }
                    }
                }
            }            
        },

        onSelectClimbingCardChoice: function(evt) {
            dojo.stopEvent(evt);

            if ($('pass_message')) { $('pass_message').remove(); }

            dojo.query('.selected_choice').forEach((ele) => { ele.classList.remove('selected_choice'); });
            $('confirm_button').classList.add('disabled');
            evt.target.classList.add('selected_choice');
            if ($('requirements_message')) { $('requirements_message').remove(); }

            const choice = dojo.query('.selected_choice')[0].classList[1];

            this.utils.disableSummitBetaTokens();
            this.utils.enableSummitBetaTokens('select_climbing_choice');

            this.utils.displayRequirements(...this.choices_info[choice]['display_requirements']);

            if (this.choices_info[choice]['no_target_message']) {
                $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                    `<span id="requirements_message">
                        <span id="lt_line1">No legal</span>
                        <span id="lt_line2">targets</span>
                    </span>`
                );
            }

            else if (!this.choices_info[choice]['requirements_met']) {
                $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                    `<span id="requirements_message">
                        <span id="re_line1">Can't fulfill</span>
                        <span id="re_line2">requirements</span>
                    </span>`
                );
            }

            const confirm_button = $('confirm_button');
            if (this.choices_info[choice]['requirements_met']) { confirm_button.classList.remove('disabled'); }
            else if (!this.choices_info[choice]['requirements_met'] && !confirm_button.classList.contains('disabled')) { confirm_button.classList.add('disabled'); }
        },

        onConfirmClimbingCardChoice: async function(evt) {
            dojo.stopEvent(evt);

            this.utils.disableSummitBetaTokens();

            const choice = dojo.query('.selected_choice')[0].classList[1];
            const card_id = dojo.query('.selected_choice')[0].parentElement.id.slice(-3).replace(/^\D+/g, '');
            const card_type = this.gamedatas.climbing_card_identifier[card_id];
            const jesus_piece = this.jesus_piece_requirements;

            if (this.checkAction('confirmClimbingCardChoice')) {
                this.ajaxcall("/firstascent/firstascent/confirmClimbingCardChoice.html", { lock: true,
                    choice : choice,
                    card_id : card_id,
                    card_type : card_type,
                    jesus_piece : jesus_piece,
                }, this, function(result) {} );
            }
        },

        onSelectAssetForDiscard: function(evt) {
            dojo.stopEvent(evt);

            this.utils.sanitizeAssetBoards();
            let asset_ele;

            if (evt.currentTarget.classList.contains('tucked_minus_click')) {
                const draw_box = evt.currentTarget.parentElement;
                const draw_num = dojo.query(`#${draw_box.id} > .tucked_draw_num`)[0];
                if (Number(draw_num.innerHTML) > 0) {
                    draw_num.innerHTML = String(Number(draw_num.innerHTML) - 1);
                    this.selected_tucked.pop();
                }
            }

            else if (evt.currentTarget.classList.contains('tucked_plus_click')) {
                const draw_box = evt.currentTarget.parentElement;
                const draw_num_ele = dojo.query(`#${draw_box.id} > .tucked_draw_num`)[0];
                const draw_num = Number(draw_num_ele.innerHTML);
                const asset_counter = draw_box.parentElement;
                const tucked_num = Number(asset_counter.querySelector('.asset_counter_num').innerHTML);
                // const tucked_num = this.selected_tucked.length;
                if (tucked_num > draw_num && 
                    draw_num + 1 + dojo.query('.selected_resource').length <= this.discard_num) {

                        draw_num_ele.innerHTML = String(draw_num + 1);
                        this.selected_tucked.push(1);
                }
            }

            else {

                const hand_ele = $('assets_wrap');
                const previous_bottom = hand_ele.contains(asset_ele) ? hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom : null;

                asset_ele = evt.currentTarget;
                if (asset_ele.classList.contains('selected_resource')) {
                    asset_ele.classList.remove('selected_resource');
                    asset_ele.parentElement.classList.remove('selected_resource_wrap');
                }
                else if (dojo.query('.selected_resource').length + this.selected_tucked.length < this.discard_num) {
                    asset_ele.classList.add('selected_resource');
                    asset_ele.parentElement.classList.add('selected_resource_wrap');
                }

                const new_bottom = hand_ele.contains(asset_ele) ? hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom : null;
                if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
            }
            
            const selected_resources = [...dojo.query('.selected_resource'), ...this.selected_tucked];
            const hand_cards = dojo.query('#assets_wrap .asset');
            const selected_hand_cards = dojo.query('#assets_wrap .selected_resource');

            let hand_cards_num = 0;
            for (const ele of hand_cards) {
                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                const arg = this.gamedatas.asset_identifier[id];
                const type = this.utils.getAssetType(arg);
                if (type === this.discard_type || !this.discard_type || this.discard_type == 'any_asset') { hand_cards_num++; }
            }

            if (hand_cards_num == selected_hand_cards.length && selected_resources.length < this.discard_num) {
                
                let i = 50;
                const player_id = this.player_id;

                dojo.query(`#asset_board_${player_id} .played_asset`).forEach(ele => {

                    const id = ele.id.slice(-3).replace(/^\D+/g, '');
                    const arg = this.gamedatas.asset_identifier[id];
                    const type = this.utils.getAssetType(arg);

                    if ((type === this.discard_type || !this.discard_type || this.discard_type === 'any_asset') && !ele.classList.contains('selectable')) {
                        this.asset_selection_handlers[i] = dojo.connect(ele, 'onclick', this, 'onSelectAssetForDiscard');
                        ele.classList.add('cursor', 'selectable');
                        i++;
                    }
                });

                dojo.query(`#asset_board_${player_id} .asset_counter`).forEach(ele => {
                    if (ele.style.display != 'none') {
                        const type = ele.id.slice(-13, -8).replace(/_/g, '');
                        if ( ( (this.discard_type === 'any_skill' && type != 'gear') || 
                            (type === this.discard_type || !this.discard_type || this.discard_type == 'any_asset') ) &&
                            !$(`${player_id}_${type}_draw_box`) ) {
                                dojo.place(this.format_block('jstpl_asset_counter_draw_box', {
                                    player_id : player_id,
                                    type : type
                                }), ele);
                                const minus_one = dojo.query(`#${ele.id} .tucked_minus_click`)[0];
                                const plus_one = dojo.query(`#${ele.id} .tucked_plus_click`)[0];
                                this.asset_selection_handlers[i] = dojo.connect(minus_one, 'onclick', this, 'onSelectAssetForDiscard');
                                this.asset_selection_handlers[i+1] = dojo.connect(plus_one, 'onclick', this, 'onSelectAssetForDiscard');
                                minus_one.classList.add('cursor', 'selectable');
                                plus_one.classList.add('cursor', 'selectable');
                        }
                    }
                });
            } else if (hand_cards_num > selected_hand_cards) {
                dojo.query('.asset_board .selectable').forEach(ele => {
                    ele.classList.remove('cursor', 'selectable', 'selected_resource');
                });
                for (let i=50; i<=70; i++) {
                    dojo.disconnect(this.asset_selection_handlers[i]);
                }
            }


            if (selected_resources.length == this.discard_num && $('confirm_button').classList.contains('disabled')) {
                $('confirm_button').classList.remove('disabled');
            }
            else if (selected_resources.length < this.discard_num && !$('confirm_button').classList.contains('disabled')) {
                $('confirm_button').classList.add('disabled');
            }
        },

        onConfirmAssetsForDiscard: function(evt) {
            dojo.stopEvent(evt);

            this.utils.disableSummitBetaTokens();

            let hand_card_ids = '';
            let board_card_ids = '';
            dojo.query('.selected_resource').forEach(card_ele => {
                const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                if (card_ele.classList.contains('played_asset')) { board_card_ids += `${card_id},`; }
                else { hand_card_ids += `${card_id},`; }
            });
            hand_card_ids = hand_card_ids.slice(0, -1);
            board_card_ids = board_card_ids.slice(0,-1);

            let tucked_card_types = '';
            let tucked_card_nums = '';
            dojo.query('.tucked_draw_num').forEach(ele => {
                if (Number(ele.innerHTML) > 0) {
                    const type = ele.parentElement.id.slice(-14, -9).replace(/_/g, '');
                    tucked_card_types += `${type} `;
                    tucked_card_nums += `${ele.innerHTML},`;
                }
            });
            tucked_card_types = tucked_card_types.slice(0, -1);
            tucked_card_nums = tucked_card_nums.slice(0, -1);

            if (this.checkAction('confirmAssetsForDiscard')) {
                this.ajaxcall("/firstascent/firstascent/confirmAssetsForDiscard.html", { lock: true,
                    hand_card_ids : hand_card_ids,
                    board_card_ids : board_card_ids,
                    tucked_card_types : tucked_card_types,
                    tucked_card_nums : tucked_card_nums,
                }, this, function(result) {} );
            }
        },

        onSelectOpponent: function(evt) {
            dojo.stopEvent(evt);

            const selected_button = evt.currentTarget;
            dojo.query('.selected_opponent').forEach(ele => { ele.classList.remove('selected_opponent'); });
            selected_button.classList.add('selected_opponent');
            if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }

            const climbing_card_type_arg = this.utils.getCurrentClimbingCard();
            if (climbing_card_type_arg != '49' && gameui.risk_it != true) {

                dojo.query('.selected_token').forEach(ele => {
                    ele.classList.remove('selected_token');
                    ele.parentElement.classList.remove('selected_token_wrap');
                    ele.firstElementChild.style.border = '';
                    ele.firstElementChild.style.boxShadow = '';
                });
            }
        },

        onConfirmOpponent: function(evt) {
            dojo.stopEvent(evt);

            let opponent_id = null;
            if (this.jesus_piece_requirements === 'true') { opponent_id = 'jesus_piece'; }
            else { opponent_id = dojo.query('.selected_opponent')[0].id; }
            const jesus_party = (typeof this.jesus_piece_requirements != 'undefined' && this.jesus_piece_requirements === 'jesus_party') ? true : false;

            if (this.checkAction('confirmSelectedOpponent')) {
                this.ajaxcall("/firstascent/firstascent/confirmSelectedOpponent.html", { lock: true,
                    opponent_id : opponent_id,
                    jesus_party : jesus_party,
                }, this, function(result) {} );
            }
        },

        onSelectPortaledge: function(evt) {
            dojo.stopEvent(evt);

            const rest = this.gamedatas.gamestate.name === 'resting';
            let rest_resources = rest ? this.rest_resources : 0;
            if ($('requirements_message')) { $('requirements_message').remove(); }

            if (this.bomber_anchor) { this.portaledge_num = dojo.query('.selected_resource').length; }

            const selected_deck = evt.currentTarget.parentElement;
            const selected_classes = selected_deck.classList;
            const selected_draw_str = selected_classes.item(selected_classes.length - 1);
            let selected_draw_num = Number(selected_draw_str) || 0;
            let currently_selected = 0;
            let operation = '';

            for (const type of ['portagear', 'portaface', 'portacrack', 'portaslab']) {
                const deck_classes = $(type).classList;
                const deck_draw_str = deck_classes.item(deck_classes.length - 1);
                let deck_draw_num = Number(deck_draw_str) || 0;
                currently_selected += deck_draw_num;
            }

            const rest_num = ['2', '8'].includes(this.character_id) ? 6 : 5;

            if (evt.currentTarget.id == `${selected_deck.id}_plus_one`) {

                if ( (this.portaledge_num != null && currently_selected >= this.portaledge_num) || rest_resources === rest_num) { return; }
                else if (!selected_classes.contains('draw')) {
                    selected_classes.add('draw', '1');
                    dojo.place(`<span id="${selected_deck.id}_draw_num" class="draw_num" style="visibility: visible;">1</span>`, selected_deck);
                    if (this.bomber_anchor) { $('ba_draw_num').innerHTML = currently_selected + 1; }
                    operation = 'plus';
                } else {
                    selected_classes.remove(selected_draw_str);
                    selected_classes.add(`${selected_draw_num+1}`);
                    $(`${selected_deck.id}_draw_num`).innerHTML = `${selected_draw_num+1}`;
                    if (this.bomber_anchor) { $('ba_draw_num').innerHTML = currently_selected + 1; }
                    operation = 'plus';
                }

                selected_draw_num ++;
                if (rest) { rest_resources++; }

            } else if (evt.currentTarget.id == `${selected_deck.id}_minus_one`) {
                if (!$(`${selected_deck.id}_draw_num`)) { return; }
                else if (selected_classes.contains('1')) {
                    selected_classes.remove('draw', '1');
                    dojo.destroy(`${selected_deck.id}_draw_num`);
                    if (this.bomber_anchor) { $('ba_draw_num').innerHTML = currently_selected - 1; }
                    operation = 'minus';
                } else if (selected_classes.contains('draw')) {
                    selected_classes.remove(selected_draw_str);
                    selected_classes.add(`${selected_draw_num-1}`);
                    $(`${selected_deck.id}_draw_num`).innerHTML = `${selected_draw_num-1}`;
                    if (this.bomber_anchor) { $('ba_draw_num').innerHTML = currently_selected - 1; }
                    operation = 'minus';
                }

                selected_draw_num --;
                if (rest) { rest_resources--; }
            }

            if (rest) { // resting state
                if (rest_resources === rest_num && $('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.remove('disabled');
                } else if (rest_resources < rest_num && !$('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.add('disabled');
                }

            } else { // selectPortaledge state
                if (operation === 'plus' && currently_selected+1 === this.portaledge_num && $('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.remove('disabled');
                }
                else if (operation === 'minus' && currently_selected-1 === this.portaledge_num
                         && $('confirm_button').classList.contains('disabled')
                         && this.portaledge_num > 0) {
                    $('confirm_button').classList.remove('disabled');
                }
                else if ((currently_selected+1 != this.portaledge_num || this.portaledge_num == 0) && !$('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.add('disabled');
                }
            }

            if (rest) { this.rest_resources = rest_resources; }
        },

        onConfirmPortaledge: function(evt) {
            dojo.stopEvent(evt);

            let portaledge_to_draw = '';
            let resting_water_psych = '';
            for (const type of ['portagear', 'portaface', 'portacrack', 'portaslab']) {

                const deck_classes = $(type).classList;
                const deck_draw_str = deck_classes.item(deck_classes.length - 1);
                let deck_draw_num = Number(deck_draw_str) || 0;
                portaledge_to_draw += `${deck_draw_num},`;
            }

            if (this.gamedatas.gamestate.name === 'resting') {
                
                const water_num = $('rest_water_draw_num').innerText;
                const psych_num = $('rest_psych_draw_num').innerText;
                portaledge_to_draw += `${water_num},${psych_num}`;
            }

            this.utils.disableSummitBetaTokens();

            if (this.checkAction('confirmPortaledge')) {
                this.ajaxcall("/firstascent/firstascent/confirmPortaledge.html", { lock: true,
                    portaledge_to_draw : portaledge_to_draw,
                }, this, function(result) {} );
            }
        },

        onRestWaterPsych: function(evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget;
            const resources = this.utils.getCurrentPlayerResources();
            const water = resources.water;
            const psych = resources.psych;

            const character_num = this.gamedatas.players[this.getActivePlayerId()]['character'];
            const max_num = character_num != '8' ? 6 : 7;     // Phil
            const rest_num = !['2', '8'].includes(character_num) ? 5 : 6;

            if ($('requirements_message')) { $('requirements_message').remove(); }

            if (button.parentElement.id == 'rest_water') {
                const water_draw_num_ele = $('rest_water_draw_num');
                const water_draw_num = Number($('rest_water_draw_num').innerText);

                if (button.classList.contains('water_minus') && water_draw_num > 0) {
                    water_draw_num_ele.innerHTML = `${water_draw_num-1}`;
                    this.rest_resources--;
                }
                else if (button.classList.contains('water_plus') && this.rest_resources < rest_num && (water + water_draw_num + 1) <= max_num) {
                    water_draw_num_ele.innerHTML = `${water_draw_num+1}`;
                    this.rest_resources++;
                }
                else if (button.classList.contains('water_plus') && this.rest_resources < rest_num && (water + water_draw_num + 1) > max_num) {
                    $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                        `<span id="requirements_message">
                            <span id="wa_line1">Can't gain any</span>
                            <span id="wa_line2">more Water</span>
                        </span>`
                    );
                }
            
            } else if (button.parentElement.id == 'rest_psych') {
                const psych_draw_num_ele = $('rest_psych_draw_num');
                const psych_draw_num = Number($('rest_psych_draw_num').innerText);

                if (button.classList.contains('psych_minus') && psych_draw_num > 0) {
                    psych_draw_num_ele.innerHTML = `${psych_draw_num-1}`;
                    this.rest_resources--;
                }
                else if (button.classList.contains('psych_plus') && this.rest_resources < rest_num && (psych + psych_draw_num + 1) <= max_num) {
                    psych_draw_num_ele.innerHTML = `${psych_draw_num+1}`;
                    this.rest_resources++;
                }
                else if (button.classList.contains('psych_plus') && this.rest_resources < rest_num && (psych + psych_draw_num + 1) > max_num) {
                    $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                        `<span id="requirements_message">
                            <span id="ps_line1">Can't gain any</span>
                            <span id="ps_line2">more Psych</span>
                        </span>`
                    );
                }
            }

            if (this.rest_resources === rest_num) { $('confirm_button').classList.remove('disabled'); }
            else if (this.rest_resources < rest_num && !$('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.add('disabled'); }
        },

        onSelectAssetType: function(evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget;
            dojo.query('#generalactions .skills_and_techniques').forEach(ele => {
                if (!ele.parentElement.classList.contains('disabled')) { ele.parentElement.style.background = ''; }
                if (ele.classList.contains('selected_asset_type')) { ele.classList.remove('selected_asset_type'); }
            });
            button.firstElementChild.classList.add('selected_asset_type');
            switch (button.id) {
                case 'gear_button':
                    button.style.cssText = 'background: #dec5a1 !important';
                    break;
                case 'face_button':
                    button.style.cssText = 'background: #b2d77f !important';
                    break;
                case 'crack_button':
                    button.style.cssText = 'background: #b7a6d0 !important';
                    break;
                case 'slab_button':
                    button.style.cssText = 'background: #f69b8f !important';
                    break;
            }
            if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
        },

        onConfirmAssetType: async function(evt) {
            dojo.stopEvent(evt);

            this.asset_token_type = dojo.query('.selected_asset_type')[0].parentElement.id.slice(0, -7);
            this.removeActionButtons();
            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }
            this.utils.updateTitlebar(_('You must select a Pitch'));

            const climbing_id = document.querySelector('.drawn_climbing').id.slice(-3).replace(/^\D+/g, '');
            const climbing_type_arg = this.gamedatas.climbing_card_identifier[climbing_id];
            let available_pitches = [];
            if (climbing_type_arg === '50') {
                available_pitches = this.utils.getPeeOffTheLedgeHexes();
                for (const pitch of available_pitches) {
                    $(`pitch_${pitch}_border`).classList.add('available_pitch');
                    $(`pitch_${pitch}_border`).nextElementSibling.nextElementSibling.classList.add('cursor');
                }
            }
            else {
                dojo.query('.pitch_border').forEach(pitch_border => {
                    const pitch_num = pitch_border.nextElementSibling.classList[1];
                    const hex_num = pitch_border.id.slice(6, -7);
                    if (!['p44', 'p45', 'p46', 'p47', 'p48'].includes(pitch_num)) {
                        pitch_border.classList.add('available_pitch');
                        pitch_border.nextElementSibling.nextElementSibling.classList.add('cursor');
                        available_pitches.push(hex_num);
                    }
                });
            }

            this.pitch_handlers = [];
            let i = 0;
            for (let pitch_num of available_pitches) {
                const border_ele = $(`pitch_${pitch_num}_border`);
                const click_ele = $(`pitch_${pitch_num}_click`);
                border_ele.classList.add('available_pitch');
                click_ele.classList.add('cursor');
                this.pitch_handlers[i] = dojo.connect(click_ele, 'onclick', this, 'onSelectPitch');
                i++;
            }

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAddTokenToPitch', null, false, 'white');
            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
            $('confirm_button').classList.add('disabled');
        },

        onConfirmAddTokenToPitch: function(evt) {
            dojo.stopEvent(evt);

            const selected_pitch = dojo.query('.selected_pitch')[0];
            const pitch_type_arg = selected_pitch.nextElementSibling.classList[1].slice(1);

            for (const key in this.pitch_handlers) { 
                dojo.disconnect(this.pitch_handlers[key]);
            }

            if (this.checkAction('confirmAddTokenToPitch')) {
                this.ajaxcall("/firstascent/firstascent/confirmAddTokenToPitch.html", { lock: true,
                    asset_token_type : this.asset_token_type,
                    pitch_type_arg : pitch_type_arg,
                    selected_pitch_id : selected_pitch.id,
                }, this, function(result) {} );
            }
        },

        onSelectAssetToAssetBoard: function(evt) {
            dojo.stopEvent(evt);

            const asset_ele = evt.currentTarget;
            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            dojo.query('.selected_resource').forEach(ele => {
                ele.classList.remove('selected_resource');
                ele.parentElement.classList.remove('selected_resource_wrap');
            });
            asset_ele.classList.add('selected_resource');
            asset_ele.parentElement.classList.add('selected_resource_wrap');
            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }

            if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
        },

        onConfirmAssetToAssetBoard: function(evt) {
            dojo.stopEvent(evt);

            let selected_resource = dojo.query('.selected_resource')[0].id.slice(-3).replace(/^\D+/g, '');

            if (this.checkAction('confirmAssetToAssetBoard')) {
                this.ajaxcall("/firstascent/firstascent/confirmAssetToAssetBoard.html", { lock: true,
                    selected_resource : selected_resource
                }, this, function(result) {} );
            }
        },

        onSelectStealFromAssetBoard: function(evt) {
            dojo.stopEvent(evt);

            this.utils.sanitizeAssetBoards();
            let asset_ele;

            if (evt.currentTarget.classList.contains('tucked_minus_click')) {
                const draw_box = evt.currentTarget.parentElement;
                const draw_num = dojo.query(`#${draw_box.id} > .tucked_draw_num`)[0];
                if (Number(draw_num.innerHTML) > 0) {
                    draw_num.innerHTML = String(Number(draw_num.innerHTML) - 1);
                    this.selected_tucked.pop();
                }
            }

            else if (evt.currentTarget.classList.contains('tucked_plus_click')) {
                const draw_box = evt.currentTarget.parentElement;
                const draw_num = dojo.query(`#${draw_box.id} > .tucked_draw_num`)[0];
                const asset_counter = draw_box.parentElement;
                const tucked_num = dojo.query(`#${asset_counter.id} > .asset_counter_num`)[0];
                if (Number(tucked_num.innerHTML) > Number(draw_num.innerHTML) &&
                    Number(draw_num.innerHTML) + 1 + dojo.query('.selected_resource').length === 1) {
                        
                        draw_num.innerHTML = String(Number(draw_num.innerHTML) + 1);
                        this.selected_tucked.push(1);
                }
            }

            else {
                asset_ele = evt.currentTarget;
                if (asset_ele.classList.contains('selected_resource')) {
                    asset_ele.classList.remove('selected_resource');
                    asset_ele.parentElement.classList.remove('selected_resource_wrap');
                }
                else if (dojo.query('.selected_resource').length === 0 && this.selected_tucked.length === 0) {
                    asset_ele.classList.add('selected_resource');
                    asset_ele.parentElement.classList.add('selected_resource_wrap');
                }
            }

            if ((dojo.query('.selected_resource').length != 0 || this.selected_tucked.length != 0) &&
                $('confirm_button').classList.contains('disabled')) {

                    $('confirm_button').classList.remove('disabled');
            }
            else if ((dojo.query('.selected_resource').length === 0 && this.selected_tucked.length === 0) &&
                !$('confirm_button').classList.contains('disabled')) {

                    $('confirm_button').classList.add('disabled');
            }
        },

        onConfirmStealFromAssetBoard: function(evt) {
            dojo.stopEvent(evt);

            let selected_resource = '';
            let tucked_card_type = '';
            let opponent_id = '';
            let flipped = false;

            if (dojo.query('.selected_resource').length > 0) {
                const selected_resource_ele = dojo.query('.selected_resource')[0];
                selected_resource = selected_resource_ele.id.slice(-3).replace(/^\D+/g, '');
                opponent_id = selected_resource_ele.parentElement.parentElement.parentElement.id.slice(-7);
                let type = selected_resource_ele.parentElement.parentElement.id.slice(-5).replace(/_/g, '');
                let slot = selected_resource_ele.parentElement.id.slice(-1);
                flipped = this.gamedatas.board_assets[opponent_id][type]['flipped'][slot];
            }
            else {
                dojo.query('.tucked_draw_num').forEach(ele => {
                    if (Number(ele.innerHTML) > 0) {
                        const type = ele.parentElement.id.slice(-13, -8).replace(/_/g, '');
                        tucked_card_type = type;
                        opponent_id = ele.parentElement.parentElement.parentElement.parentElement.id.slice(-7);
                    }
                })
            }

            if (this.checkAction('confirmStealFromAssetBoard')) {
                this.ajaxcall("/firstascent/firstascent/confirmStealFromAssetBoard.html", { lock: true,
                    selected_resource : selected_resource,
                    tucked_card_type : tucked_card_type,
                    opponent_id : opponent_id,
                    flipped : flipped,
                }, this, function(result) {} );
            }
        },

        onSelectChooseSummitBetaToken: function(evt) {
            dojo.stopEvent(evt);

            const selected_token = evt.currentTarget;
            dojo.query('.selected_token').forEach(ele => {
                ele.classList.remove('selected_token');
            });
            selected_token.classList.add('selected_token');

            if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
        },

        onConfirmChooseSummitBetaToken: function(evt) {
            dojo.stopEvent(evt);

            let opponent_token_type_arg = null;
            dojo.query('#summit_pile .selectable_token').forEach(ele => {

                if (!ele.classList.contains('summit_beta_click')) {

                    if (ele.classList.contains('selected_token')) { this.selected_token_id = ele.id.slice(-3).replace(/^\D+/g, ''); }
                    else {
                        this.opponent_token_id = ele.id.slice(-3).replace(/^\D+/g, '');
                        opponent_token_type_arg = this.gamedatas.token_identifier[this.opponent_token_id];
                    }
                }
            });

            for (let handler of this.token_selection_handlers) { dojo.disconnect(handler); }
            dojo.query('.selectable_token').forEach((ele) => {
                ele.classList.remove('cursor');
            });

            const opponent_token_name = this.gamedatas.summit_beta_tokens[opponent_token_type_arg]['description'];
            this.gamedatas.gamestate.descriptionmyturn = _(`Select an opponent to gain ${opponent_token_name}`);
            this.updatePageTitle();
            this.removeActionButtons();
            const players = Object.values(this.gamedatas.players);
            for (const player of players) {
                const character = this.gamedatas.characters[`${player.character}`]
                if (player.id != this.player_id) {
                    this.addActionButton(`${player.id}`, `${player.name}`, 'onSelectOpponent');
                    $(`${player.id}`).style.cssText = `
                        color: #fff;
                        background: #${player.color} !important;
                        text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 1px black;
                    `;
                    $(`${player.id}`).classList.add('opponent');
                }
            }
            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmChooseSummitBetaOpponent', null, false, 'white');
            $('confirm_button').classList.add('disabled');
        },

        onConfirmChooseSummitBetaOpponent: function (evt) {
            dojo.stopEvent(evt);

            const selected_token_id = this.selected_token_id;
            const opponent_token_id = this.opponent_token_id;
            const opponent_id = dojo.query('.selected_opponent')[0].id;

            if (this.checkAction('confirmChooseSummitBetaToken')) {
                this.ajaxcall("/firstascent/firstascent/confirmChooseSummitBetaToken.html", { lock: true,
                    selected_token_id : selected_token_id,
                    opponent_token_id : opponent_token_id,
                    opponent_id : opponent_id,
                }, this, function(result) {} );
            }
        },

        onSelectTechniqueToken: function (evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget;
            dojo.query('#generalactions .skills_and_techniques').forEach(ele => {
                if (ele.classList.contains('selected_technique_type')) {
                    ele.parentElement.style.background = '';
                    ele.classList.remove('selected_technique_type');
                }
            });
            button.firstElementChild.classList.add('selected_technique_type');
            switch (button.id) {
                case 'precision_button':
                    button.style.cssText = 'background: #000000 !important';
                    break;
                case 'balance_button':
                    button.style.cssText = 'background: #ffcb0a !important';
                    break;
                case 'pain_tolerance_button':
                    button.style.cssText = 'background: #751721 !important';
                    break;
                case 'power_button':
                    button.style.cssText = 'background: #e7e7e8 !important';
                    break;
            }
            if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
        },

        onConfirmTechniqueToken: function (evt) {
            dojo.stopEvent(evt);

            this.technique_token_type = dojo.query('.selected_technique_type')[0].parentElement.id.slice(0, -7);
            this.removeActionButtons();
            this.utils.disableSummitBetaTokens();

            if (this.checkAction('confirmChooseTechniqueToken')) {
                this.ajaxcall("/firstascent/firstascent/confirmChooseTechniqueToken.html", { lock: true,
                    technique_token_type : this.technique_token_type,
                }, this, function(result) {} );
            }
        },

        onPassClimbingCard: function (evt) {
            dojo.stopEvent(evt);

            if (this.checkAction('passClimbingCard')) {
                this.ajaxcall("/firstascent/firstascent/passClimbingCard.html", { lock: true,
                    player_id : this.getActivePlayerId(),
                }, this, function(result) {} );
            }
        },

        onUndoClimbingCard: function (evt=null) {
            if (evt) { dojo.stopEvent(evt); }

            if (this.checkAction('undoClimbingCard')) {
                this.ajaxcall("/firstascent/firstascent/undoClimbingCard.html", { lock: true,
                }, this, function(result) {} );
            }
        },

        onSelectPermanentAsset: function (evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget;
            const type = button.firstElementChild.firstElementChild;
            const checkbox = button.querySelector('.pa_checkbox');

            const character_num = this.gamedatas.players[this.player_id]['character'];
            const character = this.gamedatas.characters[character_num];
            const max_tokens = character.permanent_asset_slots;
            const board_assets = this.gamedatas.board_assets[this.player_id];
            const current_tokens = board_assets['gear']['permanent'] + board_assets['face']['permanent'] + board_assets['crack']['permanent'] + board_assets['slab']['permanent'];
            const currently_selected = dojo.query('.selected_asset_type').length;

            if ($('requirements_message')) { $('requirements_message').remove(); }

            if (type.classList.contains('selected_asset_type')) {
                type.classList.remove('selected_asset_type');
                checkbox.innerHTML = '\u2610';
            }
            else if (current_tokens + currently_selected < max_tokens) {
                type.classList.add('selected_asset_type');
                checkbox.innerHTML = '\u2611';
            } else if (current_tokens + currently_selected == max_tokens) {
                $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                    `<span id="requirements_message" class="no_slots">
                        <span id="sl_line1">No more</span>
                        <span id="sl_line2">available slots</span>
                    </span>`
                );
            }
        },

        onConfirmPermanentAssets: function (evt) {
            dojo.stopEvent(evt);

            const player_id = this.player_id;
            let gained_assets_list = [0,0,0,0];
            dojo.query('.selected_asset_type').forEach(ele => {

                const type = ele.id.slice(0, -8);
                switch (type) {
                    case 'gear'  : gained_assets_list[0]++; break;
                    case 'face'  : gained_assets_list[1]++; break;
                    case 'crack' : gained_assets_list[2]++; break;
                    case 'slab'  : gained_assets_list[3]++; break;
                }
            });

            const gained_assets_str = gained_assets_list.toString();

            this.confirmationDialog(_(''), () => {
                if (this.checkAction('confirmPermanentAssets')) {
                    this.ajaxcall("/firstascent/firstascent/confirmPermanentAssets.html", { lock: true,
                        player_id : player_id,
                        gained_assets_str : gained_assets_str
                    }, this, function(result) {} );
                }
            });
            const confirmation = document.querySelector('.standard_popin > .clear').firstElementChild;
            const msg_wrapper = document.createElement('div');
            msg_wrapper.id = 'msg_wrapper';
            confirmation.append(msg_wrapper);
            const msg = document.createElement('p');
            msg.classList.add('confirmation_msg');
            if (gained_assets_list.every(num => num === 0)) { msg.innerHTML = _('You will gain no tokens'); }
            else { msg.innerHTML = _('You will gain'); }
            msg_wrapper.append(msg);
            for (let i=0; i<=gained_assets_list.length-1; i++) {
                if (gained_assets_list[i] > 0) {
                    let type;
                    switch (i) { 
                        case 0: type = 'gear'; break;
                        case 1: type = 'face'; break;
                        case 2: type = 'crack'; break;
                        case 3: type = 'slab'; break;
                    }
                    for (let j=1; j<=gained_assets_list[i]; j++) {
                        const icon = document.createElement('div');
                        icon.classList.add('skills_and_techniques', `${type}_token`);
                        msg_wrapper.append(icon);

                        const parent_to_text_offset = msg.offsetTop;
                        const parent_to_icon_offset = icon.offsetTop;
                        const offset = parent_to_text_offset - parent_to_icon_offset - 5;
                        icon.style.transform = `translateY(${offset}px)`;
                    }
                }
            }
        },

        onSummitBetaRerack: function (evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;
            this.utils.resetStateOnSummitBeta('1');

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBeta(); }

            else {

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                this.utils.updateTitlebar(_('Use Rerack?'));

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaRerack', null, false, 'white');
                this.addActionButton('my_undo_button', _('Undo'), 'onUndoSummitBeta', null, false, 'white');
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onConfirmSummitBetaRerack: function (evt) {
            dojo.stopEvent(evt);

            this.removeActionButtons();
            this.utils.updateTitlebar(_('Choose 2 Asset Cards'));

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmRerack', null, false, 'white');
            $('confirm_button').classList.add('disabled');
            this.addActionButton('my_undo_button', _('Undo'), 'onUndoSummitBeta', null, false, 'white');

            const target_parent = $('portaledge').style.display === 'block' ? $('portaledge') : $('board');
            const discard_box = dojo.place(`<div id="discard_box"></div>`, target_parent);
            let i = 0;
            this.rerack_handlers = [];
            for (let [id, type_arg] of Object.entries(this.asset_discard)) {

                const asset = this.gamedatas.asset_cards[type_arg];
                const wrapper = dojo.place('<div class="discard_wrapper"></div>', discard_box);
                const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                    CARD_ID : id,
                    EXTRA_CLASSES : 'selectable cursor',
                    acX : asset.x_y[0],
                    acY : asset.x_y[1],
                }), wrapper);
                this.rerack_handlers[i] = dojo.connect(asset_ele, 'onclick', this, 'onSelectRerack');
                i++;
            }
        },

        onSelectRerack: function (evt) {
            dojo.stopEvent(evt);

            let temp_discard = JSON.parse(JSON.stringify(this.asset_discard));
            dojo.query('#discard_box .asset').forEach(ele => {

                const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
                if (Object.keys(temp_discard).includes(asset_id)) { delete temp_discard[`${asset_id}`]; }
                else { ele.remove(); }
            });

            const card_ele = evt.target;
            const wrapper = card_ele.parentElement;
            if (card_ele.classList.contains('selected_resource')) {
                card_ele.classList.remove('selected_resource');
                wrapper.classList.remove('selected_resource_wrap');
            }
            else {
                card_ele.classList.add('selected_resource');
                wrapper.classList.add('selected_resource_wrap');
            }

            const selected_resources = dojo.query('.selected_resource').length;
            const confirm = $('confirm_button');
            if (selected_resources === 2 && confirm.classList.contains('disabled')) { confirm.classList.remove('disabled'); }
            else if (selected_resources != 2 && !confirm.classList.contains('disabled')) { confirm.classList.add('disabled'); }
        },

        onConfirmRerack: function (evt) {
            dojo.stopEvent(evt);

            for (const i in this.rerack_handlers) { dojo.disconnect(this.rerack_handlers[i]); }

            let reracked_assets = '';
            const selected_assets = dojo.query('.selected_resource');
            selected_assets.forEach(ele => {
                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                reracked_assets += `${id},`;
            });

            const tokens = this.gamedatas.hand_summit_beta_tokens;
            const token_id = Object.keys(tokens).find(key => tokens[key] === '1');
            delete this.gamedatas.hand_summit_beta_tokens[token_id];

            this.enabled_summit_beta_tokens--;
            if (this.enabled_summit_beta_tokens < 1) { document.getElementById('available_sb_message').remove(); }

            if (this.checkAction('confirmRerack')) {
                this.ajaxcall("/firstascent/firstascent/confirmRerack.html", { lock: true,
                    reracked_assets : reracked_assets
                }, this, function(result) {} );
            }
        },

        onSummitBetaEnergyDrink: function (evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;
            this.utils.resetStateOnSummitBeta('4');

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBeta(); }

            else {

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                this.utils.updateTitlebar(_('Use Energy Drink?'));

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaEnergyDrink', null, false, 'white');
                this.addActionButton('my_undo_button', _('Undo'), 'onUndoSummitBeta', null, false, 'white');

                const water_cube = dojo.query(`#player_${this.player_id} .cb_water`)[0];
                const psych_cube = dojo.query(`#player_${this.player_id} .cb_psych`)[0];
                const water_current = Number(water_cube.parentElement.id.at(-1));
                const psych_current = Number(psych_cube.parentElement.id.at(-1));
                const max_num = dojo.query(`#player_${this.player_id} .cube_wrap`).length / 2 - 1;

                if (water_current === max_num && psych_current === max_num) {
                    $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                        `<span id="maxed_out_message">
                            <span id="mo_line1">Your Water and</span>
                            <span id="mo_line2">Psych are full</span>
                        </span>`
                    );
                    $('confirm_button').classList.add('disabled');
                }
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onConfirmSummitBetaEnergyDrink: function (evt) {
            dojo.stopEvent(evt);

            const tokens = this.gamedatas.hand_summit_beta_tokens;
            const token_id = Object.keys(tokens).find(key => tokens[key] === '4');
            delete this.gamedatas.hand_summit_beta_tokens[token_id];

            this.enabled_summit_beta_tokens--;
            if (this.enabled_summit_beta_tokens < 1) { document.getElementById('available_sb_message').remove(); }

            if (this.checkAction('confirmEnergyDrink')) {
                this.ajaxcall("/firstascent/firstascent/confirmEnergyDrink.html", {lock: true,}, this, function(result) {} );
            }
        },

        onSummitBetaSimulClimb: function (evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;
            this.utils.resetStateOnSummitBeta('7');

            const hand_ele = $('assets_wrap');
            const old_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBeta(); }

            else {

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                this.utils.updateTitlebar(_('Use Simul Climb?'));

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaSimulClimb', null, false, 'white');
                this.addActionButton('my_undo_button', _('Undo'), 'onUndoSummitBeta', null, false, 'white');
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != old_bottom) { this.utils.resizeHand(); }
        },

        onConfirmSummitBetaSimulClimb: function (evt) {
            dojo.stopEvent(evt);

            this.removeActionButtons();
            this.utils.updateTitlebar(_('Choose 3 Asset cards from the deck and/or Spread'));

            dojo.place('<div id="minus_one" class="draw_button">-</div><div id="plus_one" class="draw_button">+</div>', 'asset_deck');
            $('minus_one').classList.add('cursor');
            $('plus_one').classList.add('cursor');
            dojo.connect($('minus_one'), 'onclick', this, 'onSelectSimulClimb');
            dojo.connect($('plus_one'), 'onclick', this, 'onSelectSimulClimb');
            $('asset_deck').classList.add('selectable');

            this.simul_climb_handlers = [];
            for (let slot=0; slot<=3; slot++) {
                const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                available_asset.classList.add('selectable', 'cursor');
                available_asset.style.pointerEvents = '';
                this.simul_climb_handlers.push(dojo.connect(available_asset, 'onclick', this, 'onSelectSimulClimb'));
            }

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaSimulClimbAssets', null, false, 'white');
            this.addActionButton('my_undo_button', _('Undo'), 'onUndoSummitBeta', null, false, 'white');
            $('confirm_button').classList.add('disabled');
        },

        onSelectSimulClimb: function (evt) {
            dojo.stopEvent(evt);

            const deck_classes = $('asset_deck').classList;
            const deck_draw_str = deck_classes.item(deck_classes.length - 1);
            let deck_draw_num = Number(deck_draw_str) || 0;
            let spread_draw_num = dojo.query('.selected_asset').length;

            if (evt.currentTarget.id == 'plus_one') {
                if (deck_draw_num + spread_draw_num == 3) { return; }
                if (!deck_classes.contains('draw')) {
                    deck_classes.add('draw', '1');
                    dojo.place('<span id="draw_num">1</span>', 'asset_deck');
                } else {
                    deck_classes.remove(deck_draw_str);
                    deck_classes.add(`${deck_draw_num+1}`);
                    $('draw_num').innerHTML = `${deck_draw_num+1}`;
                }
                deck_draw_num++;
            } else if (evt.currentTarget.id == 'minus_one') {
                if (deck_classes.contains('1')) {
                    deck_classes.remove('draw', '1');
                    dojo.destroy('draw_num');
                } else if (deck_classes.contains('draw')) {
                    deck_classes.remove(deck_draw_str);
                    deck_classes.add(`${deck_draw_num-1}`);
                    $('draw_num').innerHTML = `${deck_draw_num-1}`;
                }
                deck_draw_num--;
            } else {
                const asset_card = evt.currentTarget;
                const asset_clone = asset_card.cloneNode();
                if (asset_card.classList.contains('selected_asset')) { 
                    asset_card.classList.remove('selected_asset');
                    spread_draw_num--;
                }
                else if (deck_draw_num + spread_draw_num == 3) { return; }
                else {
                    asset_card.classList.add('selected_asset');
                    spread_draw_num++;
                }
            }

            if ((deck_draw_num + spread_draw_num === 3) && $('confirm_button').classList.contains('disabled')) { 
                $('confirm_button').classList.remove('disabled');
            } else if ((deck_draw_num + spread_draw_num != 3) && !$('confirm_button').classList.contains('disabled')) {
                $('confirm_button').classList.add('disabled');
            }
        },

        onConfirmSummitBetaSimulClimbAssets: function (evt) {
            dojo.stopEvent(evt);

            let spread_to_draw = '';
            dojo.query('.selected_asset').forEach((ele) => {
                const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
                spread_to_draw += `${asset_id},`;
            });

            const deck_classes = $('asset_deck').classList;
            const deck_to_draw = Number(deck_classes[deck_classes.length - 1]) || 0;

            this.enabled_summit_beta_tokens--;
            if (this.enabled_summit_beta_tokens < 1) { document.getElementById('available_sb_message').remove(); }

            for (const key in this.simul_climb_handlers) {
                dojo.disconnect(this.simul_climb_handlers[key]);
            }

            if (this.checkAction('confirmAssets')) {
                this.ajaxcall("/firstascent/firstascent/confirmAssets.html", { lock: true,
                    spread_assets : spread_to_draw,
                    deck_assets : deck_to_draw,
                    simul_climb : true,
                }, this, function(result) {} );
            }
        },

        onSummitBetaBomberAnchor: function (evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;
            this.utils.resetStateOnSummitBeta('9');

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBeta(); }

            else { 

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                this.utils.updateTitlebar(_('Use Bomber Anchor?'));

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaBomberAnchor', null, false, 'white');
                this.addActionButton('my_undo_button', _('Undo'), 'onUndoSummitBeta', null, false, 'white');
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onConfirmSummitBetaBomberAnchor: async function (evt) {
            dojo.stopEvent(evt);

            this.removeActionButtons();
            this.utils.updateTitlebar(_('Choose up to 3 Assets in your hand and that many from the Portaledge'));
            const bomber_anchor_counter = document.createElement('div');
            bomber_anchor_counter.id = 'bomber_anchor_counter';
            bomber_anchor_counter.innerHTML = `
                <span id="ba_discard_text">${_('Discard')}</span>
                <span id="ba_discard_num">0</span><br>
                <span id="ba_draw_text">${_('Draw')}</span>
                <span id="ba_draw_num">0</span>
            `;
            $('pagemaintitletext').insertAdjacentElement('afterend', bomber_anchor_counter);

            const portaledge = $('portaledge');
            this.portaledge_selection_handlers = [];
            let i = 0;
            dojo.query('.portaledge').forEach(deck => {

                dojo.place(`<div id="${deck.id}_minus_one" class="porta_minus">-</div><div id="${deck.id}_plus_one" class="porta_plus">+</div>`, deck);
                const deck_minus_one = $(`${deck.id}_minus_one`);
                const deck_plus_one = $(`${deck.id}_plus_one`);
                deck_minus_one.classList.add('cursor');
                deck_plus_one.classList.add('cursor');

                ['gear', 'face', 'crack', 'slab'].forEach(type => {
                    if (deck.style.visibility === 'hidden') {
                        dojo.query(`#${deck.id} *`).forEach(ele => {
                            ele.style.visibility = 'visible';
                        });
                        $(`${deck.id}_minus_one`).style.clipPath = 'inset(4% -50% -1% 1% round 10px)';
                        $(`${deck.id}_minus_one`).style.height = '12%';
                        $(`${deck.id}_plus_one`).style.clipPath = 'inset(4% -2% 4% -23% round 10px)';
                    }
                });

                this.portaledge_selection_handlers[i] = dojo.connect(deck_minus_one, 'onclick', this, 'onSelectPortaledge');
                i++;
                this.portaledge_selection_handlers[i] = dojo.connect(deck_plus_one, 'onclick', this, 'onSelectPortaledge');
                i++;
            });

            portaledge.style.display = 'block';
            await this.utils.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
            portaledge.style.marginTop = 0;
            
            this.bomber_anchor_selection_handlers = [];
            i = 0;
            dojo.query('.hand_asset_wrap > .asset').forEach(ele => {

                this.bomber_anchor_selection_handlers[i] = dojo.connect(ele, 'onclick', this, 'onSelectBomberAnchorDiscard');
                if (ele.style.pointerEvents = 'none') { ele.style.pointerEvents = ''; }
                ele.classList.add('cursor', 'selectable');
                ele.parentElement.classList.add('selectable_wrap');
                i++;
            });

            this.bomber_anchor = true;

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaBomberAnchorAssets', null, false, 'white');
            this.addActionButton('my_undo_button', _('Undo'), 'onUndoSummitBeta', null, false, 'white');
            $('confirm_button').classList.add('disabled');
        },

        onSelectBomberAnchorDiscard: function(evt) {
            dojo.stopEvent(evt);

            this.utils.sanitizeAssetBoards();
            const asset_ele = evt.currentTarget;

            const draw_num = $('ba_draw_num');
            const discard_num = $('ba_discard_num');

            let action, discard_count;
            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (asset_ele.classList.contains('selected_resource')) {
                asset_ele.classList.remove('selected_resource');
                asset_ele.parentElement.classList.remove('selected_resource_wrap');
                action = 'deselect';
                discard_count = document.querySelectorAll('.selected_resource').length;
            }
            else {
                action = 'select';
                discard_count = document.querySelectorAll('.selected_resource').length + 1;
            }

            if (action === 'select') {

                if (discard_count <= 3) {
                    asset_ele.classList.add('selected_resource');
                    asset_ele.parentElement.classList.add('selected_resource_wrap');
                    discard_num.innerHTML = discard_count;
                }

                if (discard_count == draw_num.innerHTML 
                    && $('confirm_button').classList.contains('disabled')
                    && draw_num.innerHTML > 0) {
                    $('confirm_button').classList.remove('disabled');
                }
            }

            else if (action === 'deselect') {

                discard_num.innerHTML = discard_count;
                draw_num.innerHTML = 0;
                document.querySelectorAll('.draw_num').forEach(ele => { ele.remove(); });
                document.querySelectorAll('.portaledge').forEach(ele => {
                    if (ele.classList.length === 4) { ele.classList.remove(ele.classList[ele.classList.length-1], 'draw'); }
                });

                if ((discard_num != $('ba_draw_num').innerHTML || discard_num == 0) && !$('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.add('disabled');
                }
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onConfirmSummitBetaBomberAnchorAssets: function(evt) {
            dojo.stopEvent(evt);

            let discard_ids = '';
            dojo.query('.selected_resource').forEach(card_ele => {
                const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                discard_ids += `${card_id},`;
            });
            discard_ids = discard_ids.slice(0, -1);

            let portaledge_to_draw = '';
            for (const type of ['portagear', 'portaface', 'portacrack', 'portaslab']) {

                const deck_classes = $(type).classList;
                const deck_draw_str = deck_classes.item(deck_classes.length - 1);
                let deck_draw_num = Number(deck_draw_str) || 0;
                portaledge_to_draw += `${deck_draw_num},`;
            }

            this.portaledge_num = null;
            this.bomber_anchor = false;

            const tokens = this.gamedatas.hand_summit_beta_tokens;
            const token_id = Object.keys(tokens).find(key => tokens[key] === '9');
            delete this.gamedatas.hand_summit_beta_tokens[token_id];

            this.enabled_summit_beta_tokens--;
            if (this.enabled_summit_beta_tokens < 1) { document.getElementById('available_sb_message').remove(); }

            if (this.checkAction('confirmBomberAnchor')) {
                this.ajaxcall("/firstascent/firstascent/confirmBomberAnchor.html", { lock: true,
                    discard_ids : discard_ids,
                    portaledge_to_draw : portaledge_to_draw,
                }, this, function(result) {} );
            }
        },

        onSummitBetaBorrowedRack: function(evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBetaPassive(token, 2); }

            else {

                let return_to_confirm_pitch = false;
                let selected_summit_betas = [];
                if ((this.character_id === '8' || this.already_climbed_trigger) && !$('confirm_button')) {
                    const selected_pitch = $('pitches').querySelector('.selected_pitch').parentElement;
                    const pitch_click = selected_pitch.querySelector('.pitch_click');
                    return_to_confirm_pitch = true;
                    hand_ele.querySelectorAll('.selected_token').forEach(ele => {
                        if (token !== ele) { selected_summit_betas.push(ele); }
                    });
                    this.undoOnSelectResources();
                    pitch_click.click();
                    selected_summit_betas.forEach(ele => { ele.firstElementChild.click(); });
                }

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                if (this.character_id === '2') {

                    const pitch_num = document.querySelector('.selected_pitch').nextElementSibling.classList[1].slice(1);
                    const pitch = this.gamedatas.pitches[pitch_num];
                    const required_gear = pitch.requirements.gear;
                    const gear_icons = document.querySelectorAll('.any_skill_wrap');
                    const modded_gear = gear_icons.length;
                    if (modded_gear > required_gear) {
                        let fulfilled = 0;
                        gear_icons.forEach(ele => {
                            if (!ele.classList.contains('fulfilled') && fulfilled < modded_gear - required_gear) {
                                const idx = [...$('generalactions').children].findIndex(child => child === ele);
                                ele.classList.add('fulfilled');
                                if (ele.firstElementChild.classList.contains('requirement_border')) { ele.firstElementChild.remove(); }
                                fulfilled++;
                            }
                        });
                    }
                }

                else {

                    dojo.query('.gear_wrap').forEach(ele => {

                        const idx = [...$('generalactions').children].findIndex(child => child === ele);
                        ele.classList.add('fulfilled');
                        if (ele.firstElementChild.classList.contains('gear_border')) { ele.firstElementChild.remove(); }
                    });
                }

                const updated_requirements = this.utils.updateRequirementsForSB();
                if (updated_requirements) { this.borrowed_rack_requirements = true; }
                else { this.borrowed_rack_requirements = 1; }

                const selected_assets = document.querySelectorAll('.selected_resource');
                if (selected_assets.length > 0) {
                    selected_assets.forEach(ele => { ele.click(); });
                    selected_assets.forEach(ele => { ele.click(); });
                }
                else {
                    const check_requirements = this.utils.checkRequirements();
                    const selected_resources = check_requirements[0];
                    const pitch_requirements = check_requirements[1];

                    this.pitch_requirements = pitch_requirements;
                    this.utils.checkConfirmButton(selected_resources, pitch_requirements);
                }

                if (return_to_confirm_pitch) {
                    $('confirm_button').click();
                }
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect();
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onSummitBetaJumar: function(evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBetaPassive(token, 3); }

            else {

                let return_to_confirm_pitch = false;
                let selected_summit_betas = [];
                if ((this.character_id === '8' || this.already_climbed_trigger) && !$('confirm_button')) {
                    const selected_pitch = $('pitches').querySelector('.selected_pitch').parentElement;
                    const pitch_click = selected_pitch.querySelector('.pitch_click');
                    return_to_confirm_pitch = true;
                    hand_ele.querySelectorAll('.selected_token').forEach(ele => {
                        if (token !== ele) { selected_summit_betas.push(ele); }
                    });
                    this.undoOnSelectResources();
                    pitch_click.click();
                    selected_summit_betas.forEach(ele => { ele.firstElementChild.click(); });
                }

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                dojo.query('.requirement_wrap').forEach(ele => {

                    if (!ele.classList.contains('gear_wrap') && !ele.classList.contains('water_wrap') && !ele.classList.contains('psych_wrap')) {

                        const idx = [...$('generalactions').children].findIndex(child => child === ele);
                        ele.classList.add('fulfilled');
                        if (ele.firstElementChild.classList.contains('skill_border')) { ele.firstElementChild.remove(); }
                    }
                });

                const updated_requirements = this.utils.updateRequirementsForSB();
                if (updated_requirements) { this.jumar_requirements = true; }
                else { this.jumar_requirements = 1; }

                const selected_assets = document.querySelectorAll('.selected_resource');
                if (selected_assets.length > 0) {
                    selected_assets.forEach(ele => { ele.click(); });
                    selected_assets.forEach(ele => { ele.click(); });
                }
                else {
                    const check_requirements = this.utils.checkRequirements();
                    const selected_resources = check_requirements[0];
                    const pitch_requirements = check_requirements[1];

                    this.pitch_requirements = pitch_requirements;
                    this.utils.checkConfirmButton(selected_resources, pitch_requirements);
                }

                if (return_to_confirm_pitch) {
                    $('confirm_button').click();
                }
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onSummitBetaExtraWater: function (evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBetaPassive(token, 5); }

            else {

                let return_to_confirm_pitch = false;
                let selected_summit_betas = [];
                if ((this.character_id === '8' || this.already_climbed_trigger) && !$('confirm_button')) {
                    const selected_pitch = $('pitches').querySelector('.selected_pitch').parentElement;
                    const pitch_click = selected_pitch.querySelector('.pitch_click');
                    return_to_confirm_pitch = true;
                    hand_ele.querySelectorAll('.selected_token').forEach(ele => {
                        if (token !== ele) { selected_summit_betas.push(ele); }
                    });
                    this.undoOnSelectResources();
                    pitch_click.click();
                    selected_summit_betas.forEach(ele => { ele.firstElementChild.click(); });
                }

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                dojo.query('.water_wrap > .water_psych_border').forEach(ele => { ele.remove(); });
                dojo.query('#generalactions > .water_wrap').forEach(ele => { ele.classList.add('fulfilled'); });

                const updated_requirements = this.utils.updateRequirementsForSB();
                if (updated_requirements) { this.extra_water_requirements = true; }
                else { this.extra_water_requirements = 1; }

                const selected_assets = document.querySelectorAll('.selected_resource');
                if (selected_assets.length > 0) {
                    selected_assets.forEach(ele => { ele.click(); });
                    selected_assets.forEach(ele => { ele.click(); });
                }
                else {
                    const check_requirements = this.utils.checkRequirements();
                    const selected_resources = check_requirements[0];
                    const pitch_requirements = check_requirements[1];

                    this.pitch_requirements = pitch_requirements;
                    this.utils.checkConfirmButton(selected_resources, pitch_requirements);
                }

                if (return_to_confirm_pitch) {
                    $('confirm_button').click();
                }
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onSummitBetaGuidebook: function(evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBetaPassive(token, 8); }

            else {

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';


                const skill_borders = dojo.query('.skill_border');
                if (skill_borders.length > 0) {
                    const skill_border = skill_borders[0];
                    skill_border.parentElement.classList.add('guidebook_removed');
                    this.guidebook_border = skill_border.cloneNode();
                    skill_borders[0].remove();
                }

                const updated_requirements = this.utils.updateRequirementsForSB();
                if (updated_requirements) { this.guidebook_requirements = true; }
                else { this.guidebook_requirements = 1; }
                
                if ($('confirm_requirements_button') || $('risk_it_button')) {

                    const skills_wrapper = document.createElement('div');
                    skills_wrapper.id = 'sb_skills_wrapper'
                    skills_wrapper.innerHTML = `
                        <div id="sb_face" class="skills_and_techniques face_token selectable_skill cursor"></div>
                        <div id="sb_crack" class="skills_and_techniques crack_token selectable_skill cursor"></div>
                        <div id="sb_slab" class="skills_and_techniques slab_token selectable_skill cursor"></div>
                    `;
                    token.append(skills_wrapper);

                    dojo.connect($('sb_face'), 'onclick', this, 'onSelectSBSkill');
                    dojo.connect($('sb_crack'), 'onclick', this, 'onSelectSBSkill');
                    dojo.connect($('sb_slab'), 'onclick', this, 'onSelectSBSkill');
                }

                this.guidebook_token = token;
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onSelectSBSkill(evt) {
            dojo.stopEvent(evt);

            const skill = evt.currentTarget;
            const type = skill.id.slice(3);

            if (this.guidebook_requirements && this.guidebook_requirements != type) {
                
                dojo.query('.selected_skill').forEach(ele => {
                    if (ele != skill) { ele.click(); }
                });
            }

            this.guidebook_requirements = type;

            this.onSelectResource(evt);
        },

        onSummitBetaJesusPiece(evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBetaPassive(token, 10); }

            else {

                token.classList.add('selected_token');
                token.parentElement.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                const climbing_card_type_arg = this.utils.getCurrentClimbingCard();
                const selected_choice = this.gamedatas.current_state === 'climbingCard' ? dojo.query('.selected_choice')[0].classList[1]: null ;

                if ($('requirements_message')) { $('requirements_message').remove(); }
                dojo.query('.requirement_wrap').forEach(ele => { ele.remove(); });
                let i = 1;

                this.jesus_piece_requirements = climbing_card_type_arg === '49' && (selected_choice === 'a' || this.gamedatas.current_state === 'selectOpponent') ? 'jesus_party' : 'true';

                if ($('confirm_button') && !(climbing_card_type_arg === '49' && this.gamedatas.current_state === 'selectOpponent')) { $('confirm_button').classList.remove('disabled'); }

                if (this.gamedatas.current_state === 'selectOpponent' && this.jesus_piece_requirements != 'jesus_party')  {
                    dojo.query('.selected_opponent').forEach(ele => { ele.classList.remove('selected_opponent'); });
                }
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onSummitBetaLuckyChalkbag(evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;
            this.utils.resetStateOnSummitBeta();

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBeta(); }

            else {

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                this.utils.updateTitlebar(_('Reroll Risk Die?'));

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaLuckyChalkbag', null, false, 'white');
                this.addActionButton('my_undo_button', _('Undo'), 'onUndoSummitBeta', null, false, 'white');
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onConfirmSummitBetaLuckyChalkbag(evt) {
            dojo.stopEvent(evt);

            const current_face = $('die_wrapper').lastElementChild.id.slice(-1);

            if (this.checkAction('confirmLuckyChalkbag')) {
                this.ajaxcall("/firstascent/firstascent/confirmLuckyChalkbag.html", { lock: true,
                    current_face : current_face
                }, this, function(result) {} );
            }
        },

        onUndoSummitBeta: async function() {

            return new Promise (async resolve => {
                const asset_deck = document.getElementById('asset_deck');

                dojo.query('.summit_beta_click').forEach(ele => {
                    ele.style.border = '';
                    ele.style.boxShadow = '';
                });
                dojo.query('.selected_token').forEach(ele => { ele.classList.remove('selected_token'); });
                dojo.query('.selected_token_wrap').forEach(ele => { ele.classList.remove('selected_token_wrap'); });
                dojo.query('.selectable_token').forEach(ele => { ele.firstElementChild.style.display = 'none'; });
                while (asset_deck.firstElementChild) { asset_deck.removeChild(asset_deck.lastElementChild); }
                dojo.query('.cursor').forEach(ele => { ele.style.pointerEvents = ''; });
                dojo.query('#assets_wrap .asset').forEach(ele => { ele.style.pointerEvents = ''; });
                if ($('discard_box')) { $('discard_box').remove(); }
                $('asset_deck').classList.remove('selectable');
                this.removeActionButtons();
                this.restoreServerGameState();
                if ($('show_hide_card_button')) {
                    $('climbing_slot').style.display = 'block';
                    $('climbing_dimmer').style.display = '';
                }
                dojo.query('.selected_choice').forEach(ele => { ele.classList.remove('selected_choice'); });
                dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
                if ($('bomber_anchor_counter')) {
                    $('bomber_anchor_counter').remove();
                    const portaledge = $('portaledge');
                    if (this.utils.shouldAnimate()) { await this.utils.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true); }
                    portaledge.style.marginTop = '-36.4061%';
                    portaledge.style.display = '';
                    document.querySelectorAll('.draw').forEach(ele => {
                        ele.classList.remove(ele.classList[ele.classList.length-1], 'draw');
                    });
                    document.querySelectorAll('.porta_plus').forEach(ele => { ele.remove(); });
                    document.querySelectorAll('.porta_minus').forEach(ele => { ele.remove(); });
                    document.querySelectorAll('.hand_asset_wrap > .selected_resource').forEach(ele => {
                        ele.classList.remove('selectable', 'selected_resource');
                        ele.parentElement.classList.remove('selectable_wrap');
                    });
                    for (const key in this.bomber_anchor_selection_handlers) {
                        dojo.disconnect(this.bomber_anchor_selection_handlers[key]);
                    }
                    delete this.bomber_anchor_selection_handlers;
                }
                if (this.gamedatas.current_state === 'chooseSummitBetaToken') { $('summit_pile').style.zIndex = '201'; }
                resolve();
            });
        },

        onUndoSummitBetaPassive: function(token_ele, type_arg) { // select_pitch=false

            token_ele.classList.remove('selected_token');
            token_ele.parentElement.classList.remove('selected_token_wrap');
            dojo.query('.summit_beta_click').forEach(ele => {
                ele.style.border = '';
                ele.style.boxShadow = '';
            });
            
            switch (type_arg) {

                case 2: // borrowed rack
                    if (this.borrowed_rack_requirements && this.gamedatas.gamestate.name === 'climbOrRest' && !document.querySelector('my_undo_button')) {
                        const pitch_click = document.querySelector('.selected_pitch').nextElementSibling.nextElementSibling;
                        this.already_climbed = 0;
                        this.already_climbed_trigger = false;
                        pitch_click.parentElement.parentElement.style.marginRight = '';
                        pitch_click.click();
                        pitch_click.click();
                    }
                    delete this.borrowed_rack_requirements;
                    document.querySelectorAll('.gear_wrap').forEach(ele => { ele.classList.remove('fulfilled'); });
                    break;
                case 3: // jumar
                    if (this.jumar_requirements && this.gamedatas.gamestate.name === 'climbOrRest' && !document.querySelector('my_undo_button')) {
                        const pitch_click = document.querySelector('.selected_pitch').nextElementSibling.nextElementSibling;
                        this.already_climbed = 0;
                        this.already_climbed_trigger = false;
                        pitch_click.parentElement.parentElement.style.marginRight = '';
                        pitch_click.click();
                        pitch_click.click();
                    }
                    delete this.jumar_requirements;
                    document.querySelectorAll('.requirement_wrap').forEach(ele => {
                        if (
                            ele.classList.contains('face_wrap') || ele.classList.contains('crack_wrap')
                            || ele.classList.contains('slab_wrap') || ele.classList.contains('any_skill_wrap')
                        ) {
                            ele.classList.remove('fulfilled');
                        }
                    });
                    break;
                case 5: // extra water
                    if (this.extra_water_requirements && this.gamedatas.gamestate.name === 'climbOrRest' && !document.querySelector('my_undo_button')) {
                        const pitch_click = document.querySelector('.selected_pitch').nextElementSibling.nextElementSibling;
                        this.already_climbed = 0;
                        this.already_climbed_trigger = false;
                        pitch_click.parentElement.parentElement.style.marginRight = '';
                        pitch_click.click();
                        pitch_click.click();
                    }
                    delete this.extra_water_requirements;
                    break;
                case 8: // guidebook
                    if (document.querySelector('.selected_skill')) { document.querySelector('.selected_skill').click(); }
                    if ($('sb_skills_wrapper')) { $('sb_skills_wrapper').remove(); }
                    if (this.guidebook_requirements && this.gamedatas.gamestate.name === 'climbOrRest' && !document.querySelector('my_undo_button')) {
                        const pitch_click = document.querySelector('.selected_pitch').nextElementSibling.nextElementSibling;
                        this.already_climbed = 0;
                        this.already_climbed_trigger = false;
                        pitch_click.parentElement.parentElement.style.marginRight = '';
                        pitch_click.click();
                        pitch_click.click();
                    }
                    const guidebook_removed = document.querySelector('.guidebook_removed');
                    if (guidebook_removed) { 
                        guidebook_removed.classList.remove('.guidebook_removed');
                        guidebook_removed.prepend(this.guidebook_border);
                        delete this.guidebook_border;
                    }
                    delete this.guidebook_requirements;
                    delete this.guidebook_token;
                    break;
                case 10: // jesus piece
                    if (this.gamedatas.current_state === 'selectOpponent' && this.jesus_piece_requirements != 'jesus_party') {
                        $('confirm_button').classList.add('disabled');
                    }
                    delete this.jesus_piece_requirements;
                    break;
            }

            // redo fulfilled requirements
            const selected_assets = document.querySelectorAll('.selected_resource');
            const selected_sb_tokens = document.querySelectorAll('#assets_wrap .selected_token');
            if (selected_sb_tokens.length > 0) {
                selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
                selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
            }
            else {
                selected_assets.forEach(ele => { ele.click(); });
                selected_assets.forEach(ele => { ele.click(); });
            } 

            if (document.querySelector('.selected_pitch')) {
                const check_requirements = this.utils.checkRequirements();
                const selected_resources = check_requirements[0];
                const pitch_requirements = check_requirements[1];

                this.pitch_requirements = pitch_requirements;
                this.utils.checkConfirmButton(selected_resources, pitch_requirements);
            }

            // if ($('confirm_requirements_button') || $('risk_it_button')) { this.undoOnSelectResources(); }

            // this.utils.updateRequirementsForSB();
        },

        undoOnSelectResources: function() {

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            
            dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('selected_resource'); });
            dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
            dojo.query('.gear_token_border').forEach(ele => { ele.remove(); });
            dojo.query('.selected_gear_border').forEach(ele => { ele.classList.remove('selected_gear_border'); });
            dojo.query('.unnecessary_resource').forEach(ele => { ele.classList.remove('unnecessary_resource'); });
            dojo.query('.hand_token_wrap').forEach(ele => { ele.style.marginRight = ''; });
            this.unnecessary_requirements = 0;
            this.already_climbed = 0;
            this.already_climbed_trigger = false;
            delete this.phil;
            for (let type_arg of ['2', '3', '5', '8']) {
                if (Object.values(this.gamedatas.hand_summit_beta_tokens).includes(type_arg)) {
                    const id = Object.keys(this.gamedatas.hand_summit_beta_tokens).find(key => this.gamedatas.hand_summit_beta_tokens[key] === type_arg);
                    const token = $(`summit_beta_${id}`);
                    this.onUndoSummitBetaPassive(token, Number(type_arg));
                }
            }
            this.onUndoSummitBeta();
            this.utils.disableSummitBetaTokens();
            this.restoreServerGameState();

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onConfirmRiskSummitBeta: function(evt) {
            dojo.stopEvent(evt);

            this.confirmationDialog(_(''), () => {
                if (this.checkAction('confirmRiskSummitBeta')) {
                    this.ajaxcall("/firstascent/firstascent/confirmRiskSummitBeta.html", { lock: true }, this, function(result) {} );
                }
            });
        },

        onSelectDirtbag: function(evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget.firstElementChild;
            let action = null;
            if (!button.classList.contains('dirtbag_selected')) {
                button.classList.add('dirtbag_selected');
                document.querySelector('.button_text_wrap').innerHTML = _('Undo<br>Substitution');
                action = 'select';
            }
            else {
                button.classList.remove('dirtbag_selected');
                document.querySelector('.button_text_wrap').innerHTML = _('Substitute<br>Requirement');
                action = 'deselect';
            }

            if (
                action === 'select' && 
              ( document.querySelector('.requirement_wrap:not(.fulfilled)') || document.querySelector('.requirement_border') )
            ) {
                this.utils.updateTitlebar(_('You must select a requirement to replace'));
                this.utils.clicksOff('hard_off');

                document.querySelectorAll('.requirement_wrap').forEach(icon => {

                    if (!icon.classList.contains('fulfilled')) {

                        const type = icon.classList[1].slice(0, -5);
                        switch (type) {
                            case 'face': case 'crack': case 'slab': case 'any_skill':
                                icon.style.borderRadius = '50%';
                            case 'water': case 'psych':
                                icon.classList.add('selectable', 'cursor');
                                icon.onclick = (evt) => { this.onSelectConversion(evt); }
                        }
                    }
                });
            }

            else if (action === 'deselect') {

                this.utils.updateTitlebar(_('You must select Assets'));

                document.querySelectorAll('#generalactions .selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });
                document.querySelectorAll('#generalactions .gear_token_border').forEach(ele => {
                    ele.parentElement.classList.remove('cursor');
                    ele.remove();
                });
                document.querySelectorAll('.requirement_wrap').forEach(ele => {
                    const type = ele.classList[1].slice(0, -5);
                    if (['face', 'crack', 'slab', 'any_skill'].includes(type)) { ele.style.borderRadius = ''; }
                });

                const converted_icon = document.querySelector('.dirtbag_converted');
                if (converted_icon) {
                    if (converted_icon.parentElement.firstElementChild.classList.contains('requirement_border')) {
                        converted_icon.parentElement.firstElementChild.remove(); // remove gear border if present
                    }
                    const classlist = converted_icon.classList;
                    const has_border = classlist[classlist.length-1] === 'has_border' ? true : false;
                    let border = null;
                    if (has_border) { border = document.createElement('div'); }
                    const type = has_border ? classlist[classlist.length-2].slice(4) : classlist[classlist.length-1].slice(4);
                    converted_icon.parentElement.classList = `requirement_wrap ${type}_wrap`;
                    switch (type) {
                        case 'face' : converted_icon.style.backgroundPosition = '-600% -0%'; break;
                        case 'crack' : converted_icon.style.backgroundPosition = '-500% -0%'; break;
                        case 'slab' : converted_icon.style.backgroundPosition = '-700% -0%'; break;
                        case 'any_skill' : converted_icon.style.backgroundPosition = '-400% -0%'; break;
                        case 'water' :
                        case 'psych' :
                            converted_icon.classList = 'water_psych';
                            const background_position = type === 'water' ? '-400% -0%' : '-300% -0%';
                            converted_icon.style.backgroundPosition = background_position;
                            break;
                    }
                    switch (type) {
                        case 'face': case 'crack': case 'slab': case 'any_skill':
                            converted_icon.classList = 'skills_and_techniques';
                            if (has_border) {
                                border.classList.add('skill_border', 'requirement_border');
                                converted_icon.parentElement.insertBefore(border, converted_icon);
                            }
                            break;
                        case 'water' : case 'psych' :
                            converted_icon.classList = 'water_psych';
                            if (has_border) {
                                border.classList.add('water_psych_border');
                                converted_icon.parentElement.insertBefore(border, converted_icon);
                            }
                            break;                        
                    }
                    
                    // redo fulfilled requirements
                    const selected_resources = document.querySelectorAll('.selected_resource');
                    const selected_sb_tokens = document.querySelectorAll('.selected_token');
                    if (selected_sb_tokens.length > 0) {
                        selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
                        selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
                    }
                    else {
                        selected_resources.forEach(ele => { ele.click(); });
                        selected_resources.forEach(ele => { ele.click(); });
                    }                    
                }
                this.utils.clicksOn('hard_on');
            }
        },

        onSelectOverstoker: function(evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget.firstElementChild;
            let action = null;
            if (!button.classList.contains('overstoker_selected')) {
                button.classList.add('overstoker_selected');
                document.querySelector('.button_text_wrap').innerHTML = _('Undo<br>Substitution');
                action = 'select';
            }
            else {
                button.classList.remove('overstoker_selected');
                document.querySelector('.button_text_wrap').innerHTML = _('Substitute<br>Requirement');
                action = 'deselect';
            }

            if (
                action === 'select' && 
              ( document.querySelector('.requirement_wrap:not(.fulfilled)') || document.querySelector('.requirement_border') )
            ) {

                this.utils.updateTitlebar(_('You must select a requirement to substitute'));
                this.utils.clicksOff('hard_off');

                document.querySelectorAll('.requirement_wrap').forEach(icon => {

                    if (!icon.classList.contains('fulfilled')) {

                        const type = icon.classList[1].slice(0, -5);
                        switch (type) {
                            case 'face': case 'crack': case 'slab': case 'any_skill':
                                icon.style.borderRadius = '50%';
                            case 'water':
                                icon.classList.add('selectable', 'cursor');
                                icon.onclick = (evt) => { this.onSelectConversion(evt); }
                                break;
                            case 'gear':
                                const gear_token_border = document.createElement('div');
                                gear_token_border.classList.add('gear_token_border');
                                icon.append(gear_token_border);
                                icon.classList.add('cursor');
                                icon.onclick = (evt) => { this.onSelectConversion(evt); }
                                break;
                        }
                    }
                });
            }

            else if (action === 'deselect') {

                this.utils.updateTitlebar(_('You must select Assets'));
                
                document.querySelectorAll('#generalactions .selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });
                document.querySelectorAll('#generalactions .gear_token_border').forEach(ele => {
                    ele.parentElement.classList.remove('cursor');
                    ele.remove();
                });
                document.querySelectorAll('.requirement_wrap').forEach(ele => {
                    const type = ele.classList[1].slice(0, -5);
                    if (['face', 'crack', 'slab', 'any_skill'].includes(type)) { ele.style.borderRadius = ''; }
                });

                const converted_icon = document.querySelector('.overstoker_converted');
                if (converted_icon) {
                    if (converted_icon.parentElement.firstElementChild.classList.contains('requirement_border')) {
                        converted_icon.parentElement.firstElementChild.remove(); // remove psych border if present
                    }
                    const classlist = converted_icon.classList;
                    const has_border = classlist[classlist.length-1] === 'has_border' ? true : false;
                    let border = null;
                    if (has_border) { border = document.createElement('div'); }
                    const type = has_border ? classlist[classlist.length-2].slice(4) : classlist[classlist.length-1].slice(4);
                    converted_icon.parentElement.classList = `requirement_wrap ${type}_wrap`;
                    switch (type) {
                        case 'face' : converted_icon.style.backgroundPosition = '-600% -0%'; break;
                        case 'crack' : converted_icon.style.backgroundPosition = '-500% -0%'; break;
                        case 'slab' : converted_icon.style.backgroundPosition = '-700% -0%'; break;
                        case 'any_skill' : converted_icon.style.backgroundPosition = '-400% -0%'; break;
                        case 'water' :
                            converted_icon.classList = 'water_psych';
                            converted_icon.style.backgroundPosition = '-400% -0%';
                            break;
                    }
                    switch (type) {
                        case 'face': case 'crack': case 'slab': case 'any_skill':
                            converted_icon.classList = 'skills_and_techniques';
                            if (has_border) {
                                border.classList.add('skill_border', 'requirement_border');
                                converted_icon.parentElement.insertBefore(border, converted_icon);
                            }
                            break;
                        case 'water':
                            converted_icon.classList = 'water_psych';
                            if (has_border) {
                                border.classList.add('water_psych_border');
                                converted_icon.parentElement.insertBefore(border, converted_icon);
                            }
                            break;                        
                    }
                    
                    // redo fulfilled requirements
                    const selected_resources = document.querySelectorAll('.selected_resource');
                    const selected_sb_tokens = document.querySelectorAll('.selected_token');
                    if (selected_sb_tokens.length > 0) {
                        selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
                        selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
                    }
                    else {
                        selected_resources.forEach(ele => { ele.click(); });
                        selected_resources.forEach(ele => { ele.click(); });
                    }    
                }

                this.utils.clicksOn('hard_on');
                const check_requirements = this.utils.checkRequirements();
                const selected_resources = check_requirements[0];
                const pitch_requirements = check_requirements[1];

                this.pitch_requirements = pitch_requirements;
                this.utils.checkConfirmButton(selected_resources, pitch_requirements);
            }
        },

        onCrimperSelectCard: function(evt) {
            dojo.stopEvent(evt);

            const card = evt.currentTarget;
            const previous_selection = document.querySelector('.selected_asset');
            if (previous_selection) {
                previous_selection.classList.remove('selected_asset');
                previous_selection.parentElement.style.zIndex = '';
                previous_selection.parentElement.style.left = '';
            }
            card.classList.add('selected_asset');
            card.parentElement.style.zIndex = '1';
            document.getElementById('confirm_button').classList.remove('disabled');
        },

        onConfirmCrimperClimbingCard: function(evt) {
            dojo.stopEvent(evt);

            const chosen_ele = document.querySelector('.drawn_climbing.selected_asset');
            const discard_ele = document.querySelector('.drawn_climbing:not(.selected_asset)');
            const chosen_id = chosen_ele.id.slice(-3).replace(/^\D+/g, '');
            const discard_id = discard_ele.id.slice(-3).replace(/^\D+/g, '');

            if (this.checkAction('confirmCrimperClimbingCard')) {
                this.ajaxcall("/firstascent/firstascent/confirmCrimperClimbingCard.html", { lock: true,
                    chosen_id : chosen_id,
                    discard_id : discard_id
                }, this, function(result) {} );
            }
        },

        onSelectCragMama: function(evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget.firstElementChild;
            let action = null;
            if (!button.classList.contains('crag_mama_selected')) {
                button.classList.add('crag_mama_selected');
                document.querySelector('.button_text_wrap').innerHTML = _('Undo<br>Ignore');
                action = 'select';
            }
            else {
                button.classList.remove('crag_mama_selected');
                document.querySelector('.button_text_wrap').innerHTML = _('Ignore<br>Asset');
                action = 'deselect';
            }

            if (
                action === 'select' && 
              ( document.querySelector('.requirement_wrap:not(.fulfilled)') || document.querySelector('.requirement_border') )
            ) {
                this.utils.updateTitlebar(_('You must select a requirement to ignore'));
                this.utils.clicksOff('hard_off');

                document.querySelectorAll('.requirement_wrap').forEach(icon => {

                    if (!icon.classList.contains('fulfilled')) {

                        const type = icon.classList[1].slice(0, -5);
                        switch (type) {
                            case 'face': case 'crack': case 'slab': case 'any_skill':
                                icon.style.borderRadius = '50%';
                            case 'water': case 'psych':
                                icon.classList.add('selectable', 'cursor');
                                icon.onclick = (evt) => { this.onSelectConversion(evt); }
                                break;
                            case 'gear':
                                const gear_token_border = document.createElement('div');
                                gear_token_border.classList.add('gear_token_border');
                                icon.append(gear_token_border);
                                icon.classList.add('cursor');
                                icon.onclick = (evt) => { this.onSelectConversion(evt); }
                                break;
                        }
                    }
                });
            }

            else if (action === 'deselect') {
                this.utils.updateTitlebar(_('You must select Assets'));

                document.querySelectorAll('#generalactions .selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });
                document.querySelectorAll('#generalactions .gear_token_border').forEach(ele => {
                    ele.parentElement.classList.remove('cursor');
                    ele.remove();
                });
                document.querySelectorAll('.requirement_wrap').forEach(ele => {
                    const type = ele.classList[1].slice(0, -5);
                    if (['face', 'crack', 'slab', 'any_skill'].includes(type)) { ele.style.borderRadius = ''; }
                });
                document.querySelectorAll('#generalactions .gear_token_border').forEach(ele => {
                    ele.parentElement.classList.remove('cursor');
                    ele.remove();
                });

                if (this.crag_mama_icon) {
                    const has_border = button.classList[button.classList.length-1] === 'has_border' ? true : false;
                    const type = has_border ? button.classList[button.classList.length-3].slice(4) : button.classList[button.classList.length-2].slice(4);
                    const position = has_border ? button.classList[button.classList.length-2].slice(-2).replace(/^\D+/g, '') : button.classList[button.classList.length-1].slice(-2).replace(/^\D+/g, '');
                    this.crag_mama_icon.classList.add(`${type}_wrap`);
                    if (type === 'gear') { this.crag_mama_icon.classList.remove('cursor'); }
                    $('generalactions').insertBefore(this.crag_mama_icon, $('generalactions').children[position]);
                }
                delete this.crag_mama_icon;
                this.utils.clicksOn('hard_on');

                // redo fulfilled requirements
                const selected_resources = document.querySelectorAll('.selected_resource');
                const selected_sb_tokens = document.querySelectorAll('.selected_token');
                if (selected_sb_tokens.length > 0) {
                    selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
                    selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
                }
                else {
                    selected_resources.forEach(ele => { ele.click(); });
                    selected_resources.forEach(ele => { ele.click(); });
                }    
            }

            const check_requirements = this.utils.checkRequirements();
            const selected_resources = check_requirements[0];
            const pitch_requirements = check_requirements[1];

            this.pitch_requirements = pitch_requirements;
            this.utils.checkConfirmButton(selected_resources, pitch_requirements);
        },

        onSelectBionicWoman: function(evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget.firstElementChild;
            let action = null;
            if (!button.classList.contains('bionic_woman_selected')) {
                button.classList.add('bionic_woman_selected');
                document.querySelector('.button_text_wrap').innerHTML = _('Undo<br>Substitution');
                action = 'select';
            }
            else {
                button.classList.remove('bionic_woman_selected');
                document.querySelector('.button_text_wrap').innerHTML = _('Substitute<br>Requirement');
                action = 'deselect';
            }

            if (action === 'select' && 
                (
                       document.querySelector('.face_wrap:not(.fulfilled)')
                    || document.querySelector('.crack_wrap:not(.fulfilled)')
                    || document.querySelector('.slab_wrap:not(.fulfilled)')
                )
            ) {
                this.utils.updateTitlebar(_('You must select a requirement to replace'));
                this.utils.clicksOff('hard_off');

                document.querySelectorAll('.requirement_wrap').forEach(icon => {
 
                    if (!icon.classList.contains('fulfilled')) {

                        const type = icon.classList[1].slice(0, -5);
                        if (['face', 'crack', 'slab'].includes(type)) {
                            icon.style.borderRadius = '50%';
                            icon.classList.add('selectable', 'cursor');
                            icon.onclick = (evt) => { this.onSelectConversion(evt); }
                        }
                    }
                });
            }

            else if (action === 'deselect') {

                this.utils.updateTitlebar(_('You must select Assets'));

                document.querySelectorAll('#generalactions .selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });
                document.querySelectorAll('#generalactions .gear_token_border').forEach(ele => {
                    ele.parentElement.classList.remove('cursor');
                    ele.remove();
                });
                document.querySelectorAll('.requirement_wrap').forEach(ele => {
                    const type = ele.classList[1].slice(0, -5);
                    if (['face', 'crack', 'slab'].includes(type)) { ele.style.borderRadius = ''; }
                });

                const converted_icon = document.querySelector('.bionic_woman_converted');
                if (converted_icon) {
                    if (converted_icon.parentElement.firstElementChild.classList.contains('requirement_border')) {
                        converted_icon.parentElement.firstElementChild.remove(); // remove any_skill border if present
                    }
                    const classlist = converted_icon.classList;
                    const has_border = classlist[classlist.length-1] === 'has_border' ? true : false;
                    let border = null;
                    if (has_border) { border = document.createElement('div'); }
                    const type = has_border ? classlist[classlist.length-2].slice(4) : classlist[classlist.length-1].slice(4);
                    converted_icon.parentElement.classList = `requirement_wrap ${type}_wrap`;
                    switch (type) {
                        case 'face' : converted_icon.style.backgroundPosition = '-600% -0%'; break;
                        case 'crack' : converted_icon.style.backgroundPosition = '-500% -0%'; break;
                        case 'slab' : converted_icon.style.backgroundPosition = '-700% -0%'; break;
                    }
                    converted_icon.classList = 'skills_and_techniques';
                    if (has_border) {
                        border.classList.add('skill_border', 'requirement_border');
                        converted_icon.parentElement.insertBefore(border, converted_icon);
                    }

                    // redo fulfilled requirements
                    const selected_resources = document.querySelectorAll('.selected_resource');
                    const selected_sb_tokens = document.querySelectorAll('.selected_token');
                    if (selected_sb_tokens.length > 0) {
                        selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
                        selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); });
                    }
                    else {
                        selected_resources.forEach(ele => { ele.click(); });
                        selected_resources.forEach(ele => { ele.click(); });
                    }    
                }
                this.utils.clicksOn('hard_on');
            }
        },

        onSelectConversion: function(evt) {
            dojo.stopEvent(evt);

            this.utils.updateTitlebar(_('You must select Assets'));

            const icon = evt.target.parentElement;
            const type = icon.classList[1].slice(0, -5);
            const has_border = [...icon.children].some(ele => ele.classList.contains('requirement_border')) ? true : false;
            document.querySelectorAll('#generalactions .selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });
            document.querySelectorAll('.requirement_wrap').forEach(ele => { ele.style.borderRadius = ''; });
            document.querySelectorAll('.requirement_wrap > .gear_token_border').forEach(ele => {
                ele.parentElement.classList.remove('cursor');
                ele.remove();
            });
            this.utils.clicksOn('hard_on');
            let icon_removed = false;

            // Pitch has already been climbed
            if (this.already_climbed > 0) {
                icon.remove();
                icon_removed = true;
                this.already_climbed--;
                this.ignore_types.push(type);
                this.already_climbed_trigger = true;
            }

            // Dirtbag
            else if (document.querySelector('.dirtbag_selected')) {
                icon.classList.add('gear_wrap');

                // init redo fulfilled requirements
                const selected_resources = document.querySelectorAll('.selected_resource');
                const selected_sb_tokens = document.querySelectorAll('.selected_token');
                if (selected_sb_tokens.length > 0) { selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); }); }
                else { selected_resources.forEach(ele => { ele.click(); }); }

                icon.classList.remove(icon.classList[1]);

                if (has_border) { icon.firstElementChild.remove(); }
                if (['water', 'psych'].includes(type)) {
                    icon.firstElementChild.classList.remove('water_psych');
                    icon.firstElementChild.classList.add('skills_and_techniques');
                }
                icon.firstElementChild.classList.add('dirtbag_converted', `was_${type}`);
                icon.firstElementChild.style.backgroundPosition = '-800% -0%';
                if (has_border) { icon.firstElementChild.classList.add('has_border'); }
                else if (!has_border) {
                    document.querySelectorAll('.requirement_border').forEach(ele => {
                        const temp_type = ele.parentElement.classList[1].slice(0, -5);
                        if (temp_type === type) { ele.remove(); }
                    });
                }
                if (this.pitch_requirements['gear'] > this.resources['skills']['gear']) {
                    const converted_wrap = document.querySelector('.dirtbag_converted').parentElement;
                    const gear_border = document.createElement('div');
                    gear_border.classList.add('gear_border', 'requirement_border');
                    converted_wrap.insertBefore(gear_border, converted_wrap.firstElementChild);
                }
    
                // finish redo fulfilled requirements
                if (selected_sb_tokens.length > 0) { selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); }); }
                else { selected_resources.forEach(ele => { ele.click(); }); }
            }

            // Overstoker
            else if (document.querySelector('.overstoker_selected')) {
                icon.classList.add('psych_wrap');

                // init redo fulfilled requirements
                const selected_resources = document.querySelectorAll('.selected_resource');
                const selected_sb_tokens = document.querySelectorAll('.selected_token');
                if (selected_sb_tokens.length > 0) { selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); }); }
                else { selected_resources.forEach(ele => { ele.click(); }); }

                icon.classList.remove(icon.classList[1], 'cursor');

                if (has_border) { icon.firstElementChild.remove(); }
                if (['gear', 'face', 'crack', 'slab', 'any_skill'].includes(type)) {
                    icon.firstElementChild.classList.remove('skills_and_techniques');
                    icon.firstElementChild.classList.add('water_psych');
                }
                icon.firstElementChild.classList.add('overstoker_converted', `was_${type}`);
                icon.firstElementChild.style.backgroundPosition = '-300% -0%';
                if (has_border) { icon.firstElementChild.classList.add('has_border'); }
                else if (!has_border) {
                    document.querySelectorAll('.requirement_border').forEach(ele => {
                        const temp_type = ele.parentElement.classList[1].slice(0, -5);
                        if (temp_type === type) { ele.remove(); }
                    });
                }

                if (this.pitch_requirements['psych'] > this.resources['psych']) {
                    const converted_wrap = document.querySelector('.overstoker_converted').parentElement;
                    const psych_border = document.createElement('div');
                    psych_border.classList.add('water_psych_border', 'requirement_border');
                    converted_wrap.insertBefore(psych_border, converted_wrap.firstElementChild);
                }

                // finish redo fulfilled requirements
                if (selected_sb_tokens.length > 0) { selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); }); }
                else { selected_resources.forEach(ele => { ele.click(); }); }
            }

            // Crag Mama
            else if (document.querySelector('.crag_mama_selected')) {
                // init redo fulfilled requirements
                const selected_resources = document.querySelectorAll('.selected_resource');
                const selected_sb_tokens = document.querySelectorAll('.selected_token');
                if (selected_sb_tokens.length > 0) { selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); }); }
                else { selected_resources.forEach(ele => { ele.click(); }); }

                icon.classList.remove(icon.classList[1]);

                const crag_mama_button = document.querySelector('.crag_mama_selected');
                const position = Array.from(icon.parentElement.children).indexOf(icon);
                crag_mama_button.classList.add(`was_${type}`, `position_${position}`);
                if (has_border) { crag_mama_button.classList.add('has_border'); }
                this.crag_mama_icon = icon;
                icon.remove();
                icon_removed = true;

                // finish redo fulfilled requirements
                if (selected_sb_tokens.length > 0) { selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); }); }
                else { selected_resources.forEach(ele => { ele.click(); }); }
            }

            // Bionic Woman
            else if (document.querySelector('.bionic_woman_selected')) {
                icon.classList.add('any_skill_wrap');

                // init redo fulfilled requirements
                const selected_resources = document.querySelectorAll('.selected_resource');
                const selected_sb_tokens = document.querySelectorAll('.selected_token');
                if (selected_sb_tokens.length > 0) { selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); }); }
                else { selected_resources.forEach(ele => { ele.click(); }); }

                icon.classList.remove(icon.classList[1]);

                if (has_border) { icon.firstElementChild.remove(); }
                icon.firstElementChild.classList.add('bionic_woman_converted', `was_${type}`);
                icon.firstElementChild.style.backgroundPosition = '-400% -0%';
                if (has_border) { icon.firstElementChild.classList.add('has_border'); }
                else if (!has_border) {
                    document.querySelectorAll('.requirement_border').forEach(ele => {
                        const temp_type = ele.parentElement.classList[1].slice(0, -5);
                        if (temp_type === type) { ele.remove(); }
                    });
                }

                if (this.pitch_requirements['any_skill'] > this.resources['any_skill']) {
                    const converted_wrap = document.querySelector('.bionic_woman_converted').parentElement;
                    const any_skill_border = document.createElement('div');
                    any_skill_border.classList.add('skill_border', 'requirement_border');
                    converted_wrap.insertBefore(any_skill_border, converted_wrap.firstElementChild);
                }

                // finish redo fulfilled requirements
                if (selected_sb_tokens.length > 0) { selected_sb_tokens.forEach(ele => { ele.firstElementChild.click(); }); }
                else { selected_resources.forEach(ele => { ele.click(); }); }
            }

            // Buff Boulderer
            else if (this.character_id === '12' && this.ignore > 0) {
                icon.remove();
                icon_removed = true;
                this.ignore--;
                this.ignore_types.push(type);

                if (this.ignore > 0) {
                    this.utils.updateTitlebar(_(`As Buff Boulderer, you must select ${this.ignore} requirement(s) to ignore`));
                    let icons = [];
                    if (document.querySelector('.requirement_border')) {
                        document.querySelectorAll('.requirement_border').forEach(ele => { icons.push(ele.parentElement); });
                    }
                    else { icons = document.querySelectorAll('.requirement_wrap'); }
                    this.utils.enableRequirementButtons(icons, 'onSelectConversion');
                    return;
                }
            }

            const check_requirements = this.utils.checkRequirements();
            const selected_resources = check_requirements[0];
            const pitch_requirements = check_requirements[1];

            this.pitch_requirements = pitch_requirements;
            if (!icon_removed) { this.utils.checkForRequirementBorder(icon); }
            const asset_board_ele = $(`asset_board_${this.player_id}`);
            asset_board_ele.querySelectorAll('.permanent_assets_wrapper > .gear_token_border').forEach(ele => { ele.style.display = ''; });
            if (this.already_climbed_trigger) {
                $('my_undo_button').remove();
				this.onConfirmPitch(evt);
            }
            this.utils.checkConfirmButton(selected_resources, pitch_requirements);
        },
        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your firstascent.game.php file.
        
        */
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 

            dojo.subscribe('confirmCharacter', this, "notif_confirmCharacter");
            this.notifqueue.setSynchronous('confirmCharacter');
            dojo.subscribe('dealPersonalObjectives', this, "notif_dealPersonalObjectives");

            dojo.subscribe('confirmOpponentAssets', this, "notif_confirmOpponentAssets");
            dojo.subscribe('confirmYourAssets', this, "notif_confirmYourAssets");
            this.notifqueue.setSynchronous('confirmOpponentAssets');
            this.notifqueue.setSynchronous('confirmYourAssets');
            this.notifqueue.setIgnoreNotificationCheck('confirmOpponentAssets', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('riskShowAssets', this, "notif_riskShowAssets");
            this.notifqueue.setSynchronous('riskShowAssets');
            dojo.subscribe('riskReturnAssets', this, "notif_riskReturnAssets");
            this.notifqueue.setSynchronous('riskReturnAssets');

            dojo.subscribe('confirmTradePublic', this, "notif_confirmTradePublic");
            this.notifqueue.setSynchronous('confirmTradePublic');
            dojo.subscribe('confirmTradePrivate', this, "notif_confirmTradePrivate");
            this.notifqueue.setSynchronous('confirmTradePrivate');
            this.notifqueue.setIgnoreNotificationCheck('confirmTradePublic', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('confirmOpponentRequirements', this, "notif_confirmOpponentRequirements");
            dojo.subscribe('confirmYourRequirements', this, "notif_confirmYourRequirements");
            this.notifqueue.setSynchronous('confirmOpponentRequirements');
            this.notifqueue.setSynchronous('confirmYourRequirements');
            this.notifqueue.setIgnoreNotificationCheck('confirmOpponentRequirements', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('drawClimbingCard', this, "notif_drawClimbingCard");
            this.notifqueue.setSynchronous('drawClimbingCard');

            dojo.subscribe('crimperDrawsClimbingCards', this, "notif_crimperDrawsClimbingCards");
            this.notifqueue.setSynchronous('crimperDrawsClimbingCards');

            dojo.subscribe('passedClimbingCard', this, "notif_passedClimbingCard");
            this.notifqueue.setSynchronous('passedClimbingCard');

            dojo.subscribe('confirmClimbingChoice', this, "notif_confirmClimbingChoice");
            this.notifqueue.setSynchronous('confirmClimbingChoice');
            dojo.subscribe('confirmClimbingChoiceOpponent', this, "notif_confirmClimbingChoiceOpponent");
            this.notifqueue.setSynchronous('confirmClimbingChoiceOpponent');
            this.notifqueue.setIgnoreNotificationCheck('confirmClimbingChoiceOpponent', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('confirmAssetsForDiscardPrivate', this, "notif_confirmAssetsForDiscardPrivate");
            this.notifqueue.setSynchronous('confirmAssetsForDiscardPrivate');
            dojo.subscribe('confirmAssetsForDiscardPublic', this, "notif_confirmAssetsForDiscardPublic");
            this.notifqueue.setSynchronous('confirmAssetsForDiscardPublic');
            this.notifqueue.setIgnoreNotificationCheck('confirmAssetsForDiscardPublic', (notif) => (notif.args.player_id == this.player_id || notif.args.opponent == this.player_id));

            dojo.subscribe('confirmSummitBeta', this, "notif_confirmSummitBeta");
            this.notifqueue.setSynchronous('confirmSummitBeta');
            dojo.subscribe('confirmSummitBetaOpponent', this, "notif_confirmSummitBetaOpponent");
            this.notifqueue.setSynchronous('confirmSummitBetaOpponent');
            this.notifqueue.setIgnoreNotificationCheck('confirmSummitBetaOpponent', (notif) => (notif.args.opponent_id == this.player_id || (notif.args.opponent_id == false && notif.args.player_id == this.player_id)));

            dojo.subscribe('confirmSymbolToken', this, "notif_confirmSymbolToken");
            this.notifqueue.setSynchronous('confirmSymbolToken');
            dojo.subscribe('confirmSymbolTokenOpponent', this, "notif_confirmSymbolTokenOpponent");
            this.notifqueue.setSynchronous('confirmSymbolTokenOpponent');
            this.notifqueue.setIgnoreNotificationCheck('confirmSymbolTokenOpponent', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('automaticPortaledgeOpponent', this, "notif_automaticPortaledgeOpponent");
            this.notifqueue.setSynchronous('automaticPortaledgeOpponent');
            dojo.subscribe('automaticPortaledge', this, "notif_automaticPortaledge");
            this.notifqueue.setSynchronous('automaticPortaledge');
            this.notifqueue.setIgnoreNotificationCheck('automaticPortaledgeOpponent', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('confirmPortaledgeOpponent', this, "notif_confirmPortaledgeOpponent");
            this.notifqueue.setSynchronous('confirmPortaledgeOpponent');
            dojo.subscribe('confirmPortaledge', this, "notif_confirmPortaledge");
            this.notifqueue.setSynchronous('confirmPortaledge');
            this.notifqueue.setIgnoreNotificationCheck('confirmPortaledgeOpponent', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('updateWaterPsych', this, "notif_updateWaterPsych");
            this.notifqueue.setSynchronous('updateWaterPsych');

            dojo.subscribe('confirmAddTokenToPitch', this, "notif_confirmAddTokenToPitch");
            this.notifqueue.setSynchronous('confirmAddTokenToPitch');

            dojo.subscribe('rollDie', this, "notif_rollDie");
            this.notifqueue.setSynchronous('rollDie');

            dojo.subscribe('sunnyPitch', this, "notif_sunnyPitch");
            this.notifqueue.setSynchronous('sunnyPitch');

            dojo.subscribe('shareEffectPrivate', this, "notif_shareEffectPrivate");
            this.notifqueue.setSynchronous('shareEffectPrivate');
            dojo.subscribe('shareEffectPublic', this, "notif_shareEffectPublic");
            this.notifqueue.setSynchronous('shareEffectPublic');
            this.notifqueue.setIgnoreNotificationCheck('shareEffectPublic', (notif) => (notif.args.player_id == this.player_id || notif.args.opponent_id == this.player_id));

            dojo.subscribe('confirmAssetToAssetBoard', this, "notif_confirmAssetToAssetBoard");
            this.notifqueue.setSynchronous('confirmAssetToAssetBoard');
            dojo.subscribe('confirmAssetToAssetBoardOpponent', this, "notif_confirmAssetToAssetBoardOpponent");
            this.notifqueue.setSynchronous('confirmAssetToAssetBoardOpponent');
            this.notifqueue.setIgnoreNotificationCheck('confirmAssetToAssetBoardOpponent', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('confirmStealFromAssetBoardOpponent', this, "notif_confirmStealFromAssetBoardOpponent");
            this.notifqueue.setSynchronous('confirmStealFromAssetBoardOpponent');
            dojo.subscribe('confirmStealFromAssetBoard', this, "notif_confirmStealFromAssetBoard");
            this.notifqueue.setSynchronous('confirmStealFromAssetBoard');
            this.notifqueue.setIgnoreNotificationCheck('confirmStealFromAssetBoardOpponent', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('climbingCards15And24Public', this, "notif_climbingCards15And24Public");
            this.notifqueue.setSynchronous('climbingCards15And24Public');
            dojo.subscribe('climbingCards15And24Private', this, "notif_climbingCards15And24Private");
            this.notifqueue.setSynchronous('climbingCards15And24Private');

            dojo.subscribe('summitBetaChoices', this, "notif_summitBetaChoices");
            this.notifqueue.setSynchronous('summitBetaChoices');

            dojo.subscribe('confirmChooseSummitBetaTokenPlayer', this, "notif_confirmChooseSummitBetaTokenPlayer");
            this.notifqueue.setSynchronous('confirmChooseSummitBetaTokenPlayer');
            dojo.subscribe('confirmChooseSummitBetaTokenOpponent', this, "notif_confirmChooseSummitBetaTokenOpponent");
            this.notifqueue.setSynchronous('confirmChooseSummitBetaTokenOpponent');
            dojo.subscribe('confirmChooseSummitBetaTokenPublic', this, "notif_confirmChooseSummitBetaTokenPublic");
            this.notifqueue.setSynchronous('confirmChooseSummitBetaTokenPublic');
            this.notifqueue.setIgnoreNotificationCheck('confirmChooseSummitBetaTokenPublic', (notif) => (notif.args.player_id == this.player_id || notif.args.opponent_id == this.player_id));

            dojo.subscribe('matchingTechniques', this, "notif_matchingTechniques");
            this.notifqueue.setSynchronous('matchingTechniques');
            dojo.subscribe('noMatchingTechniques', this, "notif_noMatchingTechniques");
            this.notifqueue.setSynchronous('noMatchingTechniques');

            dojo.subscribe('noPermanentAssets', this, "notif_noPermanentAssets");
            this.notifqueue.setSynchronous('noPermanentAssets');

            dojo.subscribe('grantPermanentAssets', this, "notif_grantPermanentAssets");
            this.notifqueue.setSynchronous('grantPermanentAssets');

            dojo.subscribe('flipPlayedAssets', this, "notif_flipPlayedAssets");
            this.notifqueue.setSynchronous('flipPlayedAssets');

            dojo.subscribe('passStartingPlayer', this, "notif_passStartingPlayer");
            this.notifqueue.setSynchronous('passStartingPlayer');

            dojo.subscribe('revealHeadwall', this, "notif_revealHeadwall");
            this.notifqueue.setSynchronous('revealHeadwall');

            dojo.subscribe('confirmRerackPublic', this, "notif_confirmRerackPublic");
            this.notifqueue.setSynchronous('confirmRerackPublic');
            dojo.subscribe('confirmRerackPrivate', this, "notif_confirmRerackPrivate");
            this.notifqueue.setSynchronous('confirmRerackPrivate');
            this.notifqueue.setIgnoreNotificationCheck('confirmRerackPublic', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('confirmEnergyDrink', this, "notif_confirmEnergyDrink");
            this.notifqueue.setSynchronous('confirmEnergyDrink');

            dojo.subscribe('bomberAnchorCleanup', this, "notif_bomberAnchorCleanup");
            this.notifqueue.setSynchronous('bomberAnchorCleanup');

            dojo.subscribe('discardJesusPiece', this, "notif_discardJesusPiece");
            this.notifqueue.setSynchronous('discardJesusPiece');

            dojo.subscribe('retractRiskDie', this, "notif_retractRiskDie");
            this.notifqueue.setSynchronous('retractRiskDie');

            dojo.subscribe('useSpiderStick', this, "notif_useSpiderStick");
            this.notifqueue.setSynchronous('useSpiderStick');

            dojo.subscribe('confirmCrimperClimbingCard', this, "notif_confirmCrimperClimbingCard");
            this.notifqueue.setSynchronous('confirmCrimperClimbingCard');

            dojo.subscribe('undoClimbingCleanup', this, "notif_undoClimbingCleanup");

            dojo.subscribe('updateFinalPersonalObjectivesTracker', this, "notif_updateFinalPersonalObjectivesTracker");

            dojo.subscribe('preGameEnd', this, "notif_preGameEnd");
            this.notifqueue.setSynchronous('preGameEnd');

            dojo.subscribe('debug', this, "notif_debug");
        },

        notif_debug: function(notif) {
            console.log('requirements, selected_resources =');
            console.log(notif.args.requirements);
            console.log(notif.args.selected_resources);
        },

        notif_confirmCharacter: function(notif) {
            this.utils.clicksOff();

            const player_id = notif.args.player_id;
            const active_player = this.gamedatas.players[player_id];
            const character_num = notif.args.character_num;
            const character_div = dojo.query(`#${notif.args.character_div}`)[0];
            const character = this.gamedatas.characters[character_num];
            const character_name = character.name;
            if (this.isCurrentPlayerActive()) { this.character_id = character_num; }

            // place character wrappers

            // current player chose character
            if (player_id == this.player_id) {
                dojo.place(this.format_block('jstpl_character_area', {
                        player : player_id,
                        color : active_player.color,
                        player_name : active_player.name,
                    }), 'character_zone', 'first');
                if ($('character_zone').children.length > 1) {
                    $(`character_area_${active_player.name}`).style.marginBottom = '8px';
                    $(`player_${this.player_id}`).style.marginBottom = '35px';
                }

                this.gamedatas.resource_tracker['water'] = character['water_psych'];
                this.gamedatas.resource_tracker['psych'] = character['water_psych'];

            // opponent chose character
            } else { 
                dojo.place(this.format_block('jstpl_character_area', {
                        player : player_id,
                        color : active_player.color,
                        player_name : active_player.name,
                    }), 'character_zone');
                if ($('character_zone').children.length > 1) {
                    $(`character_area_${active_player.name}`).style.marginTop = '8px';
                }
            }

            // remove namebox
            $(`namebox_${character_num}`).style.visibility = 'hidden';
            $('character_selection').append($(`namebox_${character_num}`));
            $(`namebox_${character_num}`).classList.add('vis_hidden');

            // change player color to character color
            const character_color = this.gamedatas.characters[character_num]['color'];
            $(`character_area_${active_player.name}`).style.cssText += 
                        `color: #${character_color};`;
            const name_ref = dojo.query(`#player_name_${player_id}`)[0].firstElementChild;
            name_ref.style.cssText +=
                        `color: #${character_color};`;
            this.gamedatas.players[player_id].color = character_color;
            dojo.query('.playername').forEach(ele => {
                if (ele.innerHTML === active_player.name) {
                    ele.style.color = `#${character_color}`;
                }
            });
            dojo.query('.colored_name_span').forEach(ele => {
                if (ele.innerHTML === active_player.name) {
                    ele.style.color = `#${character_color}`;
                }
            });

            // populate player_names_and_colors
            this.gamedatas.players[player_id]['character'] = character_num;
            this.gamedatas.player_names_and_colors[player_id]['character'] = character_num;
            this.gamedatas.player_names_and_colors[player_id]['color'] = `#${active_player.color}`;

            // initialize water and psych
            $(`water_num_${player_id}`).innerHTML = character['water_psych'];
            $(`psych_num_${player_id}`).innerHTML = character['water_psych'];
            this.gamedatas.water_psych_tracker[player_id]['water'] = character['water_psych'];
            this.gamedatas.water_psych_tracker[player_id]['psych'] = character['water_psych'];

            // initialize rope
            const rope_color = character['rx_y']['panel'];
            dojo.place(this.format_block('jstpl_pp_rope', {
                player_id : player_id,
                rX : rope_color[0],
                rY : rope_color[1]
            }), `${player_id}_water_and_psych`);
            this.addTooltipHtml(`${player_id}_rope_counter`, _('Rope'), 500);

            // place meeple in player panel
            const mx_y = character['mx_y'];
            let meeple_destination;
            if (player_id == this.player_id) { meeple_destination = 'ref_row'; }
            else { meeple_destination = `${player_id}_water_and_psych`; }
            dojo.place(this.format_block('jstpl_meeple', {
                player_id : player_id,
                mX : mx_y[0],
                mY : mx_y[1]
            }), meeple_destination);

            // remove class, move div, animate slide
            if (!character_div.style.display || character_div.style.display == 'none') { 
                character_div.style.display = 'inline-block';
            }
            const character_area = dojo.query(`#player_${player_id} .character_ratio_child`)[0];
            const ab_pos = character['ab_x_y'];
            const character_ratio_child = dojo.query(`#player_${player_id} .character_ratio_child`)[0];

            // add asset board
            if (character_name === 'free_soloist') {
                dojo.place(this.format_block('jstpl_fs_asset_board', {
                    player : player_id,
                    character : character_name,
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), `character_${character_num}`);
                delete gameui.gamedatas.board_assets[player_id]['gear'];
            }
            else if (character_name === 'young_prodigy') {
                dojo.place(this.format_block('jstpl_yp_asset_board', {
                    player : player_id,
                    character : character_name,
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), `character_${character_num}`);
                gameui.gamedatas.board_assets[player_id]['gear'][5] = {};
                delete gameui.gamedatas.board_assets[player_id]['face'][4];
                delete gameui.gamedatas.board_assets[player_id]['crack'][4];
                delete gameui.gamedatas.board_assets[player_id]['slab'][4];
            }
            else {
                dojo.place(this.format_block('jstpl_asset_board', {
                    player : player_id,
                    character : character_name,
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), character_div);
            }
            character_div.classList.remove('popout');

            if (character_name === 'cool-headed_crimper') {
                $('climbing_deck').insertAdjacentHTML('beforeend',
                    `<span id="crimper_draw">
                        <span id="crimper_draw_1"></span>
                        <span id="crimper_draw_2"></span>
                    </span>`
                )
                $('climbing_slot').insertAdjacentHTML('afterend',
                    `<span id="crimper_display">
                        <span id="crimper_display_1"></span>
                        <span id="crimper_display_2"></span>
                    </span>`
                );
            }

            if (this.utils.shouldAnimate()) {

                const animateCharacter = async () => {
                    this.utils.updateTitlebar(_('Placing Character and dealing Personal Objectives'));
                    const args = [character_div, character_area];
                    await this.utils.animationPromise(character_div, 'select_character', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                    this.utils.clicksOn();
                    this.notifqueue.setSynchronousDuration();
                }
                animateCharacter();
            } else { 
                character_area.append(character_div);

                this.utils.clicksOn();
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_dealPersonalObjectives: function (notif) {

            if (this.isCurrentPlayerActive()) {

                const titlebar_addon = $('titlebar_addon');
                const toggles_wrap = $('toggles_wrap');
                const addon_toggle = $('addon_toggle');
                const personal_objectives_toggle = document.createElement('div');
                personal_objectives_toggle.id = 'personal_objectives_toggle';
                personal_objectives_toggle.innerHTML = _('Show Personal<br>Objectives');
                personal_objectives_toggle.classList.add('addon_off', 'always_cursor', 'toggle');
                toggles_wrap.insertBefore(personal_objectives_toggle, addon_toggle);
                personal_objectives_toggle.onclick = (evt) => { this.utils.togglePersonalObjectives(evt); }

                const personal_objectives_box = document.createElement('div');
                personal_objectives_box.id = 'personal_objectives_box';
                titlebar_addon.append(personal_objectives_box);

                const current_personal_objectives = notif.args.current_personal_objectives;
                const objective_1_id = current_personal_objectives[0];
                const objective_2_id = current_personal_objectives[1];
                const objective_1 = this.gamedatas.personal_objectives[objective_1_id];
                const objective_2 = this.gamedatas.personal_objectives[objective_2_id];
                const po_coords_1 = objective_1['x_y'];
                const po_coords_2 = objective_2['x_y'];
                dojo.place(
                    `${this.format_block('jstpl_personal_objective', {
                        poId : objective_1_id,
                        poX : po_coords_1[0],
                        poY : po_coords_1[1],
                    })}
                     ${this.format_block('jstpl_personal_objective', {
                        poId : objective_2_id,
                        poX : po_coords_2[0],
                        poY : po_coords_2[1],
                     })}`, personal_objectives_box);
                gameui.gamedatas.personal_objectives_tracker = {
                    [objective_1_id] : [],
                    [objective_2_id] : [],
                };
                this.utils.personalObjectiveTooltip(`personal_objective_${objective_1_id}`, objective_1_id);
                this.utils.personalObjectiveTooltip(`personal_objective_${objective_2_id}`, objective_2_id);
            }
        },

        notif_confirmOpponentAssets: async function (notif) {

            if (notif.args.simul_climb && $('show_hide_card_button') && $('show_hide_card_button').classList.contains('shown')) {
                $('show_hide_card_button').click();
            }

            const player_id = notif.args.player_id;
            const spread_ids = notif.args.spread_card_ids;
            const new_deck_assets = notif.args.deck_num;
            const new_spread_assets = spread_ids.length;

            const drawCards = async () => {
                return new Promise(async (resolve) => {

                    // draw cards from deck
                    if (this.utils.shouldAnimate()) {

                        let asset_deck_to_display = [];
                        let asset_display_to_counter = [];
                        const counter_div = $(`hand_counter_${player_id}`);
                        $('asset_deck_draw').style.display = 'flex';
                        $('spread_draw').style.display = 'flex';

                        for (let i=1; i<=new_deck_assets; i++) {

                            dojo.place(`<div id="deck_temp_${i}" class="asset deck_temp"></div>`, 'asset_deck');
                            const deck_asset_div = $(`deck_temp_${i}`);
                            const deck_row = $(`deck_draw_${i}`);

                            let args = [deck_asset_div, deck_row, 2, true];
                            asset_deck_to_display.push(this.utils.animationPromise.bind(null, deck_asset_div, 'asset_deck_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));

                            counter_div.append(deck_asset_div);
                            let new_width = deck_asset_div.getBoundingClientRect().width;
                            let new_height = deck_asset_div.getBoundingClientRect().height;
                            $('asset_deck').append(deck_asset_div);
                            deck_asset_div.style.setProperty('--dw', new_width);
                            deck_asset_div.style.setProperty('--dh', new_height);
                            args = [deck_asset_div, counter_div, null, false, true];
                            asset_display_to_counter.push(this.utils.animationPromise.bind(null, deck_asset_div, 'asset_display_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args));
                        }

                        // draw cards from spread
                        let i = 1;
                        spread_ids.forEach((ele) => {

                            const spread_div = $(`asset_card_${ele}`);
                            const spread_slot = spread_div.parentElement;
                            const draw_slot = $(`spread_draw_${i}`);
                            i++;

                            let args = [spread_div, draw_slot, 2, true];
                            asset_deck_to_display.push(this.utils.animationPromise.bind(null, spread_div, 'asset_deck_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));

                            counter_div.append(spread_div);
                            const new_width = spread_div.getBoundingClientRect().width;
                            const new_height = spread_div.getBoundingClientRect().height;
                            spread_slot.append(spread_div);
                            spread_div.style.setProperty('--dw', new_width);
                            spread_div.style.setProperty('--dh', new_height);
                            args = [spread_div, counter_div, null, false, true];
                            asset_display_to_counter.push(this.utils.animationPromise.bind(null, spread_div, 'asset_display_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args));
                        });

                        this.utils.updateTitlebar(_('Revealing chosen Assets'));
                        Promise.all(asset_deck_to_display.map(func => { return func(); }))
                        .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                        .then(() => Promise.all(asset_display_to_counter.map(func => { return func(); })))
                        .then(() => {
                            this.utils.handCount(player_id, notif.args.hand_count);
                            $('asset_deck_draw').style.display = '';
                            if (!this.risk_it) { $('spread_draw').style.display = ''; }
                            resolve();
                        });
                            
                    } else {
                        spread_ids.map((id) => {
                            const spread_div = $(`asset_card_${id}`);
                            spread_div.remove();
                        });
                        this.utils.handCount(player_id, notif.args.hand_count);
                        resolve();
                    }
                });
            }
            await drawCards();

            const refillSpread = async () => {
                return new Promise(async (resolve) => {

                    if (dojo.query('#the_spread .asset').length < 4) {
                        let i = 0;
                        const spread = dojo.query('#the_spread .spread');
                        let flip_and_move = [];
                        let cards_to_place = [];
                        const monochrome = notif.args.monochrome;
                        const empty_slots = 4 - dojo.query('#the_spread .asset').length;
                        const spread_assets_arr = notif.args.spread_assets_arr;

                        spread.forEach(ele => {
                            if (ele.childElementCount === 0) {

                                const new_card = spread_assets_arr[i];
                                i++;
                                const id = new_card.id;
                                const type = new_card.type_arg;
                                const asset = this.gamedatas.asset_cards[type];

                                let deck_asset_div = null;
                                if (this.utils.shouldAnimate()) {
                                    deck_asset_div = dojo.place(this.format_block('jstpl_flip_card', {
                                        card_id : id,
                                        extra_classes : '',
                                        back_type : 'asset asset_back_for_flip',
                                        front_type : 'asset',
                                        cX : asset.x_y[0],
                                        cY : asset.x_y[1],
                                    }), 'asset_deck');
                                }

                                cards_to_place.push([this.format_block('jstpl_asset_card', {
                                                        CARD_ID : id,
                                                        EXTRA_CLASSES : 'spread_asset',
                                                        acX : asset.x_y[0],
                                                        acY : asset.x_y[1],
                                                    }), ele]);

                                if (this.utils.shouldAnimate()) {
                                    const args = [deck_asset_div, ele, 1];
                                    flip_and_move.push(this.utils.animationPromise.bind(null, deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true));
                                    flip_and_move.push(this.utils.animationPromise.bind(null, deck_asset_div, 'asset_deck_to_spread', 'anim', this.utils.moveToNewParent(), true, false, ...args));
                                }
                            }
                        });

                        if (this.utils.shouldAnimate()) {

                            this.utils.updateTitlebar(_('Refilling Spread'));

                            Promise.all(flip_and_move.map((func) => { return func(); }))

                            .then(async () => {
                                cards_to_place.map((card) => {
                                    const card_ele = dojo.place(card[0], card[1]);
                                    const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                                    const card_type = this.gamedatas.asset_identifier[card_id];
                                    this.utils.assetTooltip(card_ele.id, card_type);
                                });

                                if (notif.args.climbing_card && dojo.query('#climbing_discard_straightened')[0].firstElementChild) {
                                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                                    const destination = $('climbing_discard_90');
                                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                                    destination.append(climbing_div);
                                    climbing_div.classList.remove('drawn_climbing');
                                    $('climbing_discard').style.zIndex = '';
                                    this.utils.cleanClimbingDiscardPile();
                                } })

                            .then( async () => {
                                if (monochrome) { // if all 4 spread cards are of same type

                                    const last_drawn_asset = notif.args.last_drawn_asset;
                                    const last_asset_ele = $(`asset_card_${last_drawn_asset.id}`);
                                    const last_slot = last_asset_ele.parentElement;
                                    const discard_pile = $('asset_discard');
                                    let args = [last_asset_ele, discard_pile, 5];
                                    await this.utils.animationPromise(last_asset_ele, 'asset_spread_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                                    for (let i=empty_slots; i<=spread_assets_arr.length; i++) {

                                        const new_card = spread_assets_arr[i-1];
                                        const id = new_card.id;
                                        const type = new_card.type_arg;
                                        const asset = this.gamedatas.asset_cards[type];

                                        let deck_asset_div = null;
                                        if (this.utils.shouldAnimate()) {
                                            deck_asset_div = dojo.place(this.format_block('jstpl_flip_card', {
                                                card_id : id,
                                                extra_classes : '',
                                                back_type : 'asset asset_back_for_flip',
                                                front_type : 'asset',
                                                cX : asset.x_y[0],
                                                cY : asset.x_y[1],
                                            }), 'asset_deck');
                                        }

                                        args = [deck_asset_div, last_slot, 1];
                                        this.utils.animationPromise(deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true);
                                        await this.utils.animationPromise(deck_asset_div, 'asset_deck_to_spread', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                        const flipped_asset = dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : id,
                                            EXTRA_CLASSES : 'spread_asset',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), last_slot);

                                        if (i < spread_assets_arr.length) {
                                            args = [flipped_asset, discard_pile, 5];
                                            await this.utils.animationPromise(flipped_asset, 'asset_spread_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                        }
                                    }
                                }
                            } )
                            .then(() => { resolve(); });

                        } else { // shouldn't animate

                            cards_to_place.map(card => {
                                const card_ele = dojo.place(card[0], card[1]);
                                const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                                const card_type = this.gamedatas.asset_identifier[card_id];
                                this.utils.assetTooltip(card_ele.id, card_type);
                            });

                            if (monochrome) {
                                const last_drawn_asset = notif.args.last_drawn_asset;
                                const last_asset_ele = $(`asset_card_${last_drawn_asset.id}`);
                                const last_slot = last_asset_ele.parentElement;
                                const discard_pile = $('asset_discard');
                                discard_pile.append(last_asset_ele);
                                last_replacement = spread_assets_arr[spread_assets_arr.length-1];
                                const last_type_arg = this.gamedatas.asset_identifier[last_replacement.id];
                                const last_asset = this.gamedatas.asset_cards[last_type_arg];
                                dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : last_replacement.id,
                                    EXTRA_CLASSES : 'spread_asset',
                                    acX : last_asset.x_y[0],
                                    acY : last_asset.x_y[1],
                                }), last_slot);
                            }

                            if (notif.args.climbing_card) {
                                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                                const destination = $('climbing_discard_90');
                                destination.append(climbing_div);
                                climbing_div.classList.remove('drawn_climbing');
                                $('climbing_discard').style.zIndex = '';
                                this.utils.cleanClimbingDiscardPile();
                            }

                            resolve();
                        }

                    } else { resolve(); }                 
                });
            }
            await refillSpread();

            if (notif.args.simul_climb) {

                const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : '7',
                    sbX : 200,
                    sbY : 200,
                }), `hand_counter_${player_id}`);
                $('token_display_1').append(token_ele);
                const width = token_ele.getBoundingClientRect().width;
                const height = token_ele.getBoundingClientRect().height;
                $(`hand_counter_${player_id}`).append(token_ele);
                token_ele.style.setProperty('--dw', width);
                token_ele.style.setProperty('--dh', height);

                if (this.utils.shouldAnimate()) {

                    this.utils.updateTitlebar(_('Discarding Summit Beta token'));

                    $('token_display').style.display = 'flex';

                    let args = [token_ele, $('token_display_1'), null, false, true];
                    await this.utils.animationPromise(token_ele, 'token_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
                    args = [token_ele, $('summit_discard')];
                    await this.utils.animationPromise(token_ele, 'token_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    $('token_display').style.display = '';
                }

                else { // shouldn't animate
                
                    $('summit_discard').append(token_ele);
                }

                while ($('summit_discard').childElementCount > 1) { $('summit_discard').firstElementChild.remove(); }
                this.restoreServerGameState();
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmYourAssets: async function (notif) {
            this.utils.clicksOff();
            this.utils.disableSummitBetaTokens();

            if (notif.args.simul_climb) { 
                if ($('show_hide_card_button') && $('show_hide_card_button').classList.contains('shown')) { $('show_hide_card_button').click(); }
                this.removeActionButtons();
            }

            const card_num = dojo.query('#assets_wrap .asset').length;
            const token_num = dojo.query('#assets_wrap .summit_beta').length;
            const new_deck_assets = notif.args.deck_num;
            const spread_ids = notif.args.spread_card_ids;
            const new_spread_assets = spread_ids.length;
            const new_cards = new_deck_assets + new_spread_assets;
            const new_card_slots = this.utils.resizeHand('asset', notif.args.new_cards);
            const player_id = notif.args.player_id;
            const deck_assets = notif.args.deck_assets_arr;

            if ($('asset_deck').classList.contains('selectable')) {
                $('asset_deck').classList.remove('selectable');
                if ($('draw_num')) { $('draw_num').remove(); }
                $('minus_one').remove();
                $('plus_one').remove();
            }
    
            dojo.query('#the_spread .spread').forEach((ele) => {
                if (ele.firstElementChild) { ele.firstElementChild.classList.remove('selectable', 'selected_asset'); }
            });

            const drawCards = async () => {
                return new Promise(async (resolve) => {

                    // draw cards from deck
                    let cards_for_hand = [];
                    for (let i=1; i<=new_deck_assets; i++) {
                        const id = deck_assets[i-1].id;
                        const type = deck_assets[i-1].type_arg;
                        const asset = this.gamedatas.asset_cards[type];
                        const hand_slot = $(`hand_asset_${new_card_slots[id]}`);
                        cards_for_hand.push([this.format_block('jstpl_asset_card', {
                                                    CARD_ID : id,
                                                    EXTRA_CLASSES : '',
                                                    acX : asset.x_y[0],
                                                    acY : asset.x_y[1],
                                                }), hand_slot]);
                        this.gamedatas.hand_assets[id] = type;
                    }
                    let i = 1;
                    spread_ids.forEach((id) => {
                        const spread_div = $(`asset_card_${id}`);
                        const hand_slot = $(`hand_asset_${new_card_slots[id]}`);
                        cards_for_hand.push([spread_div, hand_slot]);
                        const type = this.gamedatas.asset_identifier[id];
                        this.gamedatas.hand_assets[id] = type;
                        i++;
                    });

                    if (this.utils.shouldAnimate()) {

                        let asset_deck_to_display = [];
                        let cards_to_place = [];
                        let asset_display_to_hand = [];
                        $('asset_deck_draw').style.display = 'flex';
                        $('spread_draw').style.display = 'flex';

                        for (let i=1; i<=new_deck_assets; i++) {
                            const id = deck_assets[i-1].id;
                            const type = deck_assets[i-1].type_arg;
                            const asset = this.gamedatas.asset_cards[type];
                            const deck_row = $(`deck_draw_${i}`);
                            const deck_asset_div = dojo.place(this.format_block('jstpl_flip_card', {
                                card_id : id,
                                extra_classes : '',
                                back_type : 'asset asset_back_for_flip',
                                front_type : 'asset',
                                cX : asset.x_y[0],
                                cY : asset.x_y[1],
                            }), 'asset_deck');

                            let args = [deck_asset_div, deck_row, 2, true];
                            asset_deck_to_display.push(this.utils.animationPromise.bind(null, deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true));
                            asset_deck_to_display.push(this.utils.animationPromise.bind(null, deck_asset_div, 'asset_deck_to_display', 'anim', this.utils.moveToNewParent(), true, false, ...args));

                            cards_to_place.push([this.format_block('jstpl_asset_card', {
                                                    CARD_ID : id,
                                                    EXTRA_CLASSES : '',
                                                    acX : asset.x_y[0],
                                                    acY : asset.x_y[1],
                                                }), deck_row]);
                        }


                        // draw cards from spread
                        let i = 1;
                        spread_ids.forEach((id) => {

                            const spread_div = $(`asset_card_${id}`);
                            const spread_slot = spread_div.parentElement;
                            const draw_slot = $(`spread_draw_${spread_ids.length-i+1}`);
                            const hand_slot = $(`hand_asset_${new_card_slots[id]}`);
                            i++;

                            let args = [spread_div, draw_slot, 2, true];
                            asset_deck_to_display.push(this.utils.animationPromise.bind(null, spread_div, 'asset_deck_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));

                            args = [spread_div, hand_slot];
                            asset_display_to_hand.push(this.utils.animationPromise.bind(null, spread_div, 'asset_display_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                        });

                        this.utils.updateTitlebar(_('Revealing chosen Assets'));
                        Promise.all(asset_deck_to_display.map(func => { return func(); }))
                        .then(() => cards_to_place.map((card) => {
                                        const card_ele = dojo.place(card[0], card[1]);
                                        const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                                        const card_type = this.gamedatas.asset_identifier[card_id];
                                        this.utils.assetTooltip(card_ele.id, card_type);
                                    }))
                        .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                        .then(() => {
                            for (let arr of deck_assets) {
                                const id = arr.id;
                                const card = $(`asset_card_${id}`);
                                const hand_slot = $(`hand_asset_${new_card_slots[id]}`);

                                args = [card, hand_slot];
                                asset_display_to_hand.push(this.utils.animationPromise.bind(null, card, 'asset_display_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }
                            return Promise.all(asset_display_to_hand.map(func => { return func(); }));
                        })
                        .then(() => {
                            $('asset_deck_draw').style.display = '';
                            if (!this.risk_it) { $('spread_draw').style.display = ''; }
                            dojo.query('.hand_asset_wrap .asset').forEach(ele => { ele.classList.remove('spread_asset', 'cursor'); })
                            resolve();
                        });
                    } else { // shouldn't animate
                        cards_for_hand.map((card) => {
                            const card_ele = dojo.place(card[0], card[1]);
                            const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                            const card_type = this.gamedatas.asset_identifier[card_id];
                            this.utils.assetTooltip(card_ele.id, card_type);
                        });
                        resolve();
                    }
                });
            }
            await drawCards();

            this.utils.updatePlayerResources(player_id, notif.args.player_resources);
            this.utils.handCount(player_id, notif.args.hand_count);

            const refillSpread = async () => {
                return new Promise(async (resolve) => {

                    if (dojo.query('#the_spread .asset').length < 4) {
                        let i = 0;
                        const spread = dojo.query('#the_spread .spread');
                        let flip_and_move = [];
                        let cards_to_place = [];
                        const monochrome = notif.args.monochrome;
                        const empty_slots = 4 - dojo.query('#the_spread .asset').length;
                        const spread_assets_arr = notif.args.spread_assets_arr;

                        spread.forEach((ele) => {
                            if (ele.childElementCount === 0) {

                                const new_card = spread_assets_arr[i];
                                i++;
                                const id = new_card.id;
                                const type = new_card.type_arg;
                                const asset = this.gamedatas.asset_cards[type];

                                let deck_asset_div = null;
                                if (this.utils.shouldAnimate()) {
                                    deck_asset_div = dojo.place(this.format_block('jstpl_flip_card', {
                                        card_id : id,
                                        extra_classes : '',
                                        back_type : 'asset asset_back_for_flip',
                                        front_type : 'asset',
                                        cX : asset.x_y[0],
                                        cY : asset.x_y[1],
                                    }), 'asset_deck');
                                }

                                cards_to_place.push([this.format_block('jstpl_asset_card', {
                                                        CARD_ID : id,
                                                        EXTRA_CLASSES : 'spread_asset',
                                                        acX : asset.x_y[0],
                                                        acY : asset.x_y[1],
                                                    }), ele]);

                                if (this.utils.shouldAnimate()) {
                                    const args = [deck_asset_div, ele, 1];
                                    flip_and_move.push(this.utils.animationPromise.bind(null, deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true));
                                    flip_and_move.push(this.utils.animationPromise.bind(null, deck_asset_div, 'asset_deck_to_spread', 'anim', this.utils.moveToNewParent(), true, false, ...args));
                                }
                            }
                        });

                        if (this.utils.shouldAnimate()) {

                            this.utils.updateTitlebar(_('Refilling Spread'));

                            Promise.all(flip_and_move.map((func) => { return func(); }))

                            .then(async () => {
                                cards_to_place.map((card) => {
                                    const card_ele = dojo.place(card[0], card[1]);
                                    const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                                    const card_type = this.gamedatas.asset_identifier[card_id];
                                    this.utils.assetTooltip(card_ele.id, card_type);
                                });

                                if (notif.args.climbing_card && dojo.query('#climbing_discard_straightened')[0].firstElementChild) {
                                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                                    const destination = $('climbing_discard_90');
                                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                                    destination.append(climbing_div);
                                    climbing_div.classList.remove('drawn_climbing');
                                    $('climbing_discard').style.zIndex = '';
                                    this.utils.cleanClimbingDiscardPile();
                                } })

                            .then(async () => {
                                if (monochrome) { // if all 4 spread cards are of the same type

                                    const last_drawn_asset = notif.args.last_drawn_asset;
                                    const last_asset_ele = $(`asset_card_${last_drawn_asset.id}`);
                                    const last_slot = last_asset_ele.parentElement;
                                    const discard_pile = $('asset_discard');
                                    let args = [last_asset_ele, discard_pile, 5];
                                    await this.utils.animationPromise(last_asset_ele, 'asset_spread_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                                    for (let i=empty_slots; i<=spread_assets_arr.length; i++) {

                                        const new_card = spread_assets_arr[i-1];
                                        const id = new_card.id;
                                        const type = new_card.type_arg;
                                        const asset = this.gamedatas.asset_cards[type];

                                        let deck_asset_div = null;
                                        if (this.utils.shouldAnimate()) {
                                            deck_asset_div = dojo.place(this.format_block('jstpl_flip_card', {
                                                card_id : id,
                                                extra_classes : '',
                                                back_type : 'asset asset_back_for_flip',
                                                front_type : 'asset',
                                                cX : asset.x_y[0],
                                                cY : asset.x_y[1],
                                            }), 'asset_deck');
                                        }

                                        args = [deck_asset_div, last_slot, 1];
                                        this.utils.animationPromise(deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true);
                                        await this.utils.animationPromise(deck_asset_div, 'asset_deck_to_spread', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                        const flipped_asset = dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : id,
                                            EXTRA_CLASSES : 'spread_asset',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), last_slot);

                                        if (i < spread_assets_arr.length) {
                                            args = [flipped_asset, discard_pile, 5];
                                            await this.utils.animationPromise(flipped_asset, 'asset_spread_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                        }
                                    }
                                }
                            })

                            .then(() => { resolve(); });

                        } else { // shouldn't animate

                            cards_to_place.map((card) => {
                                const card_ele = dojo.place(card[0], card[1]);
                                const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                                const card_type = this.gamedatas.asset_identifier[card_id];
                                this.utils.assetTooltip(card_ele.id, card_type);
                            });

                            if (monochrome) {
                                const last_drawn_asset = notif.args.last_drawn_asset;
                                const last_asset_ele = $(`asset_card_${last_drawn_asset.id}`);
                                const last_slot = last_asset_ele.parentElement;
                                const discard_pile = $('asset_discard');
                                discard_pile.append(last_asset_ele);
                                last_replacement = spread_assets_arr[spread_assets_arr.length-1];
                                const last_type_arg = this.gamedatas.asset_identifier[last_replacement.id];
                                const last_asset = this.gamedatas.asset_cards[last_type_arg];
                                dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : last_replacement.id,
                                    EXTRA_CLASSES : 'spread_asset',
                                    acX : last_asset.x_y[0],
                                    acY : last_asset.x_y[1],
                                }), last_slot);
                            }

                            if (notif.args.climbing_card) {
                                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                                const destination = $('climbing_discard_90');
                                destination.append(climbing_div);
                                climbing_div.classList.remove('drawn_climbing');
                                $('climbing_discard').style.zIndex = '';
                                this.utils.cleanClimbingDiscardPile();
                            }

                            resolve();
                        }

                    } else { resolve(); }                 
                });
            }
            await refillSpread();

            if (notif.args.simul_climb) {

                const token_id = Object.keys(this.gamedatas.token_identifier).find(id => this.gamedatas.token_identifier[id] === '7');
                const token_ele = $(`summit_beta_${token_id}`);
                const token_wrapper = token_ele.parentElement;
                token_ele.classList.remove('selected_token');
                token_ele.parentElement.classList.remove('selected_token_wrap');
                token_ele.firstElementChild.classList.remove('click', 'cursor', 'selectable_token');

                const tokens = this.gamedatas.hand_summit_beta_tokens;
                delete this.gamedatas.hand_summit_beta_tokens[token_id];

                if (this.utils.shouldAnimate()) {

                    const args = [token_ele, $('summit_discard')];
                    this.utils.updateTitlebar(_('Discarding Summit Beta token'));
                    await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                }

                else { // shouldn't animate
                    
                    $('summit_discard').append(token_ele);
                }

                token_wrapper.remove();
                while ($('summit_discard').childElementCount > 1) { $('summit_discard').firstElementChild.remove(); }
                this.onUndoSummitBeta();            
            }

            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_riskShowAssets: async function (notif) {
            this.utils.clicksOff();
            dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });

            const player_id = notif.args.player_id;
            const selected_resources = notif.args.selected_resources;

            $('spread_draw').style.display = 'flex';
            let cards_to_anim = [];
            let cards_to_place = [];
            let i = selected_resources.length;

            for (const id of selected_resources) {

                let ele = null;
                const slot = $(`spread_draw_${i}`);

                if (player_id == this.player_id) {

                    ele = $(`asset_card_${id}`);
                    const hand_slot = ele.parentElement;
                    this.risk_hand_slots[id] = hand_slot;
                    const args = [ele, slot];
                    cards_to_anim.push(this.utils.animationPromise.bind(null, ele, 'asset_hand_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                    cards_to_place.push(args);

                    ele.classList.remove('cursor', 'selectable', 'selected_resource');
                    ele.parentElement.classList.remove('selectable_wrap');
                }
                else {

                    const type_arg = this.gamedatas.asset_identifier[id];
                    const asset = this.gamedatas.asset_cards[type_arg];
                    const hand_counter = $(`hand_counter_${player_id}`);
                    ele = dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : id,
                        EXTRA_CLASSES : '',
                        acX : asset.x_y[0],
                        acY : asset.x_y[1],
                    }), hand_counter);
                    slot.append(ele);
                    const new_width = ele.getBoundingClientRect().width;
                    const new_height = ele.getBoundingClientRect().height;
                    hand_counter.append(ele);
                    ele.style.setProperty('--dw', new_width);
                    ele.style.setProperty('--dh', new_height);
                    const args = [ele, slot, null, false, true];

                    cards_to_anim.push(this.utils.animationPromise.bind(null, ele, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                    cards_to_place.push(args);
                }

                i--;
            }

            dojo.query('#assets_wrap .asset').forEach(ele => {
                ele.classList.remove('cursor', 'selectable');
                ele.parentElement.classList.remove('selectable_wrap');
            });

            this.risk_it = true;

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar(_('Revealing played Assets'));

                Promise.all(cards_to_anim.map(func => { return func(); }))
                .then(() => {
                    this.utils.clicksOn();
                    this.notifqueue.setSynchronousDuration();
                });
            }

            else { // shouldn't animate

                if (player_id == this.player_id) {

                    cards_to_place.map(card => {

                        const ele = card[0];
                        const destination = card[1];
                        destination.append(ele);
                    });
                }

                else {

                    let i = selected_resources.length;
                    for (let id of selected_resources) {

                        const ele = $(`asset_card_${id}`);
                        const destination = $(`spread_draw_${i}`);
                        destination.append(ele);
                        i--;
                    }
                }
                this.utils.clicksOn();
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_riskReturnAssets: async function (notif) {

            const player_id = this.getActivePlayerId();
            const risked_cards = dojo.query('#spread_draw .asset');
            let cards_to_anim = [];
            let cards_to_place = [];

            if (player_id == this.player_id) {

                document.querySelectorAll('.available_pitch').forEach(ele => { ele.classList.remove('available_pitch'); });
                document.querySelector('.selected_pitch').classList.remove('selected_pitch');

                for (let ele of risked_cards) {

                    const id = ele.id.slice(-3).replace(/^\D+/g, '');
                    const hand_slot = this.risk_hand_slots[id];
                    const args = [ele, hand_slot];
                    cards_to_anim.push(this.utils.animationPromise.bind(null, ele, 'asset_display_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                    cards_to_place.push(args);
                }
            }
            else {

                for (let ele of risked_cards) {

                    const ele_origin = ele.parentElement;
                    const hand_counter = $(`hand_counter_${player_id}`);
                    hand_counter.append(ele);
                    const new_width = ele.getBoundingClientRect().width;
                    const new_height = ele.getBoundingClientRect().height;
                    ele_origin.append(ele);
                    ele.style.setProperty('--dw', new_width);
                    ele.style.setProperty('--dh', new_height);
                    const args = [ele, hand_counter, null, false, true];
                    cards_to_anim.push(this.utils.animationPromise.bind(null, ele, 'asset_display_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args));
                }
            }

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar(_('Returning risked Assets to hand'));

                dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });

                Promise.all(cards_to_anim.map(func => { return func(); }))
                .then(() => {
                    dojo.query('#assets_wrap .asset').forEach(ele => { ele.style.width = ''; });
                    $('spread_draw').style.display = '';
                    this.risk_it = false;
                })
                .then(() => {
                    this.utils.clicksOn();
                    this.notifqueue.setSynchronousDuration();
                });
            }

            else { // shouldn't animate

                if (player_id == this.player_id) {

                    cards_to_place.map(card => {

                        const ele = card[0];
                        const destination = card[1];
                        destination.append(ele);
                    })
                }

                else {

                    dojo.query('#spread_draw .asset').forEach(ele => { ele.remove(); });
                }

                $('spread_draw').style.display = '';
                this.risk_it = false;
                this.utils.clicksOn();
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_confirmTradePublic: async function (notif) {

            const player_id = this.getActivePlayerId();
            const discard_arr = notif.args.discard_arr;
            const drawn_type = notif.args.drawn_type;
            const hand_count = notif.args.hand_count;
            const last_card = notif.args.last_card;
            const refill_portaledge = notif.args.refill_portaledge;
            
            this.asset_discard = notif.args.asset_discard;

            let display_anims = [];
            let discard_anims = [];

            if (this.utils.shouldAnimate()) {

                $('asset_deck_draw').style.display = 'flex';
                let i = 1;
                for (const card of discard_arr) {

                    const id = card[0];
                    const type_arg = card[1];
                    const asset = this.gamedatas.asset_cards[type_arg];
                    const card_ele = dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : id,
                        EXTRA_CLASSES : '',
                        acX : asset.x_y[0],
                        acY : asset.x_y[1],
                    }), `hand_counter_${player_id}`);
                    const deck_draw_slot = $(`deck_draw_${i}`);
                    deck_draw_slot.append(card_ele);
                    const new_width = card_ele.getBoundingClientRect().width;
                    const new_height = card_ele.getBoundingClientRect().height;
                    $(`hand_counter_${player_id}`).append(card_ele);
                    card_ele.style.setProperty('--dw', new_width);
                    card_ele.style.setProperty('--dh', new_height);
                    let args = [card_ele, deck_draw_slot, null, false, true];
                    i++;

                    display_anims.push(this.utils.animationPromise.bind(null, card_ele, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                    args = [card_ele, $('asset_discard'), 3];
                    discard_anims.push(this.utils.animationPromise.bind(null, card_ele, 'asset_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                }

                this.utils.updateTitlebar(_('Discarding Asset(s)'));
                Promise.all(display_anims.map(func => { return func(); }))

                .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })

                .then(() => Promise.all(discard_anims.map(func => { return func(); })))

                .then(async () => {

                    let asset_types = {'gear' : 0, 'face' : 0, 'crack' : 0, 'slab' : 0}
                    asset_types[drawn_type] = 1;
                    
                    await this.utils.portaledgeOpponent(player_id, asset_types, true, hand_count, null, false, 0, 0, last_card, refill_portaledge);

                    this.utils.handCount(player_id, hand_count);
                    this.restoreServerGameState();
                    this.notifqueue.setSynchronousDuration();
                })
            }

            else { //shouldn't animate

                const last_discard = discard_arr[discard_arr.length-1];
                const id = last_discard[0];
                const type_arg = last_discard[1];
                const asset = this.gamedatas.asset_cards[type_arg];
                dojo.place(this.format_block('jstpl_asset_card', {
                    CARD_ID : id,
                    EXTRA_CLASSES : '',
                    acX : asset.x_y[0],
                    acY : asset.x_y[1],
                }), $('asset_discard'));

                this.utils.handCount(player_id, hand_count);
                this.restoreServerGameState();
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_confirmTradePrivate: async function (notif) {

            const player_resources = notif.args.player_resources;
            const discard_arr = notif.args.discard_arr;
            const drawn_id = notif.args.drawn_id;
            const drawn_type_arg = notif.args.drawn_type_arg;
            const hand_count = notif.args.hand_count;
            const last_card = notif.args.last_card;
            const refill_portaledge = notif.args.refill_portaledge;

            this.asset_discard = notif.args.asset_discard;

            dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
            this.utils.resizeHand();
            await this.utils.portaledge(this.player_id, [drawn_type_arg], [drawn_id], false, hand_count, null, false, 0, 0, last_card, refill_portaledge, player_resources);
            this.utils.cleanAssetDiscardPile();

            this.utils.updatePlayerResources(this.player_id, player_resources);
            this.utils.handCount(this.player_id, hand_count);

            this.restoreServerGameState();
            dojo.query('.pitch_click').forEach(ele => { ele.style.display = 'block'; });

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmOpponentRequirements: async function (notif) {

            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const board_assets = notif.args.board_assets;
            this.gamedatas.board_assets = board_assets;

            const playAssets = async () => {

                return new Promise(async (resolve) => {

                    if (this.utils.shouldAnimate()) {

                        const asset_counter_to_display = [];
                        const asset_display_to_board = [];
                        const selected_resources = notif.args.selected_resources;
                        const cards_for_playing = [];
                        for (let i=0; i<=selected_resources.length-1; i++) {
                            const id = selected_resources[i];
                            const type_arg = this.gamedatas.asset_identifier[id];
                            const asset = this.gamedatas.asset_cards[type_arg];
                            cards_for_playing.push([this.format_block('jstpl_asset_card', {
                                                        CARD_ID : id,
                                                        EXTRA_CLASSES : 'played_asset',
                                                        acX : asset.x_y[0],
                                                        acY : asset.x_y[1],
                                                    }), id]);
                        }

                        if (!this.risky_climb) {

                            $('asset_deck_draw').style.display = 'flex';
                            for (let i=1; i<=cards_for_playing.length; i++) {
                                const card = cards_for_playing[i-1];
                                const card_ele = dojo.place(card[0], `hand_counter_${player_id}`);
                            }
                    
                            let i = 1;
                            for (const card of $(`hand_counter_${player_id}`).children) {
                                const deck_draw_slot = $(`deck_draw_${i}`);
                                const next_sibling = card.nextSibling;
                                deck_draw_slot.append(card);
                                const new_width = card.getBoundingClientRect().width;
                                const new_height = card.getBoundingClientRect().height;
                                $(`hand_counter_${player_id}`).insertBefore(card, next_sibling);
                                card.style.setProperty('--dw', new_width);
                                card.style.setProperty('--dh', new_height);
                                let args = [card, deck_draw_slot, null, false, true];
                                asset_counter_to_display.push(this.utils.animationPromise.bind(null, card, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                i++;
                            }
                        }

                        if (!this.risky_climb) { this.utils.updateTitlebar(_('Revealing played assets'); )}
                        let changed_z_indices = [];
                        Promise.all(asset_counter_to_display.map(func => { return func(); }))
                        .then(() => { if (!this.risky_climb) { return new Promise(resolve => setTimeout(resolve, 1000)) } }) 
                        .then(async () => {
                            for (const [type, info] of Object.entries(board_assets[player_id])) {
                                    
                                // newly tucked cards
                                for (const id of Object.keys(info['tucked'])) {
                                    if ($(`asset_card_${id}`)) {
                                        const card_ele = $(`asset_card_${id}`);
                                        const tucked_counter = $(`${character.name}_${type}_counter`);
                                        tucked_counter.style.display = 'block';
                                        const destination = $(`${character.name}_${type}_counter`).querySelector('.asset_counter_img');
                                        const args = [card_ele, destination];
                                        const old_slot = card_ele.parentElement;
                                        const old_z = old_slot.style.zIndex;
                                        old_slot.style.zIndex = '6';
                                        await this.utils.animationPromise(card_ele, 'asset_board_to_tucked', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                        old_slot.style.zIndex = old_z;
                                        const old_num = Number(destination.nextElementSibling.innerHTML);
                                        destination.nextElementSibling.innerHTML = `${old_num + 1}`;
                                    }
                                }
                                // newly played cards and repositioned cards
                                for (const [slot, asset] of Object.entries(info)) {

                                    if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                        const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                        const ele = $(`asset_card_${id}`);
                                        const asset_board = document.getElementById(`asset_board_${player_id}`);
                                        const destination = asset_board.querySelector(`#${character.name}_${type}_${slot}`);

                                        console.log('id, ele =');
                                        console.log(id);
                                        console.log(ele);

                                        if (destination.children.length === 0 || !destination.contains(ele)) {
                                            ele.style.setProperty('--z', `${Number(slot)+1+10}`);
                                            ele.parentElement.style.zIndex = `${Number(slot)+1+10}`;    
                                            changed_z_indices.push(ele.parentElement);
                                            let anim = '';
                                            switch (true) {
                                                case ele.parentElement.classList.contains('hand_asset_wrap'): anim = 'asset_hand_to_board'; break;
                                                case ele.parentElement.classList.contains('asset_board_slot'): anim = 'asset_board_to_board'; break;
                                                case    ele.parentElement.classList.contains('spread_wrap')
                                                     || ele.parentElement.classList.contains('draw_wrap') : anim = 'asset_display_to_board'; break;
                                            }

                                            const args = [ele, destination];
                                            asset_display_to_board.push(this.utils.animationPromise.bind(null, ele, anim, 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                        }
                                    }
                                }
                            }
                        })
                        .then(() => {
                            this.utils.updateTitlebar(_('Placing played Assets on Asset Board'));
                            Promise.all(asset_display_to_board.map(func => { return func(); }))
                            .then(() => {
                                this.utils.sanitizeAssetBoards();
                                for (const ele of changed_z_indices) { ele.style.zIndex = ''; }
                                this.risk_it = false;
                                if (this.risky_climb) { this.risky_climb = false; }
                                $('spread_draw').style.display = '';
                                resolve();
                            });
                        });
                        
                    } else { // shouldn't animate

                        for (const [type, info] of Object.entries(board_assets[player_id])) {

                            // newly tucked cards
                            for (const id of Object.keys(info['tucked'])) {
                                if ($(`asset_card_${id}`)) { $(`asset_card_${id}`).remove(); }
                            }
                            if (Object.keys(info['tucked']).length > 0) {
                                const tucked_counter = $(`${character.name}_${type}_counter`);
                                tucked_counter.style.display = 'block';
                            }

                            // newly played cards and repositioned cards
                            for (const [slot, asset] of Object.entries(info)) {

                                if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                    const id = Object.keys(asset)[0];
                                    const asset_ele = $(`asset_card_${id}`);
                                    const slot_ele = $(`${character.name}_${type}_${slot}`);
                                    if (asset_ele && slot_ele.firstElementChild != asset_ele) { // card exists, but is not in correct slot
                                        slot_ele.append(asset_ele);
                                    }
                                    else if (!asset_ele && !slot_ele.firstElementChild) { // card doesn't exist yet
                                        const type_arg = this.gamedatas.asset_identifier[id];
                                        const asset = this.gamedatas.asset_cards[type_arg];
                                        dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : id,
                                            EXTRA_CLASSES : 'played_asset',
                                            acX : asset['x_y'][0],
                                            acY : asset['x_y'][1],
                                        }), slot_ele);
                                    }
                                }
                            }
                            this.utils.sanitizeAssetBoards();
                            $('spread_draw').style.display = '';
                            this.risk_it = false;
                            if (this.risky_climb) { this.risky_climb = false; }
                            resolve();
                        }
                    }
                });
            }
            await playAssets();

            this.utils.updateBoardAssets(player_id);
            this.utils.handCount(player_id, notif.args.hand_count);

            // discard used summit beta tokens
            await this.utils.discardPlayedSummitBetaTokens(notif.args.selected_summit_betas);
            this.utils.cleanSummitBetaDiscardPile();

            await this.utils.notif_confirmRequirements(notif);

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmYourRequirements: async function (notif) {

            this.utils.clicksOff();
            this.utils.disableSummitBetaTokens();
            
            this.selected_pitch = dojo.query(`.p${notif.args.selected_pitch}`)[0];
            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const board_assets = notif.args.board_assets;
            this.gamedatas.board_assets = board_assets;

            dojo.query('.available_pitch').forEach((ele) => {
                ele.classList.remove('available_pitch');
                ele.nextElementSibling.nextElementSibling.classList.remove('cursor');
            });
            dojo.query('.selected_pitch')[0].nextElementSibling.nextElementSibling.classList.remove('cursor');
            dojo.query('.selected_pitch')[0].classList.remove('selected_pitch');
            dojo.query('.gear_token_border').forEach(ele => { ele.remove(); });

            const playAssets = async () => {

                return new Promise(async (resolve) => {

                    const selected_resources = notif.args.selected_resources;
                    dojo.query('.selectable').forEach(ele => { ele.classList.remove('selectable'); });
                    dojo.query('.selectable_wrap').forEach(ele => { ele.classList.remove('selectable_wrap'); });
                    dojo.query('.selected_token').forEach(ele => {
                        if (!ele.classList.contains('summit_beta')) {
                            ele.classList.remove('selected_token');
                        }
                    });
                    dojo.query('.asset.selected_resource').forEach(ele => {
                        ele.classList.remove('selected_resource');
                        ele.classList.add('played_asset');
                    });

                    for (let i=0; i<=selected_resources.length-1; i++) {
                        const id = selected_resources[i];
                        const type_arg = this.gamedatas.asset_identifier[id];
                        const asset = this.gamedatas.asset_cards[type_arg];
                        const type = this.utils.getAssetType(type_arg);
                        const technique = this.utils.getAssetTechnique(type_arg);
                        
                        delete this.gamedatas.hand_assets[id];
                        this.gamedatas.resource_tracker['asset_board']['skills'][type]++;
                        this.gamedatas.resource_tracker['asset_board']['techniques'][technique]++;
                    }

                    if (this.utils.shouldAnimate()) {

                        this.utils.updateTitlebar(_('Placing played Assets on Asset Board'));

                        let asset_board_anims = [];
                        let changed_z_indices = [];

                        for (const [type, info] of Object.entries(board_assets[player_id])) {

                            // newly tucked cards
                            for (const id of Object.keys(info['tucked'])) {
                                if ($(`asset_card_${id}`)) {
                                    const card_ele = $(`asset_card_${id}`);
                                    const tucked_counter = $(`${character.name}_${type}_counter`);
                                    tucked_counter.style.display = 'block';
                                    const destination = $(`${character.name}_${type}_counter`).querySelector('.asset_counter_img');
                                    const args = [card_ele, destination];
                                    const old_slot = card_ele.parentElement;
                                    const old_z = old_slot.style.zIndex;
                                    old_slot.style.zIndex = '6';
                                    await this.utils.animationPromise(card_ele, 'asset_board_to_tucked', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                    old_slot.style.zIndex = old_z;
                                    const old_num = Number(destination.nextElementSibling.innerHTML);
                                    destination.nextElementSibling.innerHTML = `${old_num + 1}`;
                                }
                            }
                            // newly played cards and repositioned cards
                            for (const [slot, asset] of Object.entries(info)) {

                                if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                    const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                    const ele = $(`asset_card_${id}`);
                                    const asset_board = document.getElementById(`asset_board_${player_id}`);
                                    const destination = asset_board.querySelector(`#${character.name}_${type}_${slot}`);

                                    if (destination.children.length === 0 || !destination.contains(ele)) {
                                        ele.style.setProperty('--z', `${Number(slot)+1+10}`);
                                        ele.parentElement.style.zIndex = `${Number(slot)+1+10}`;
                                        changed_z_indices.push(ele.parentElement);
                                        ele.classList.remove('selected_resource');
                                        ele.parentElement.classList.remove('selected_resource_wrap');
                                        ele.classList.add('played_asset');

                                        let anim = '';
                                        switch (true) {
                                            case ele.parentElement.classList.contains('hand_asset_wrap'): anim = 'asset_hand_to_board'; break;
                                            case ele.parentElement.classList.contains('asset_board_slot'): anim = 'asset_board_to_board'; break;
                                            case ele.parentElement.classList.contains('spread_wrap'): anim = 'asset_display_to_board'; break;
                                        }
                                        const args = [ele, destination];
                                        asset_board_anims.push(this.utils.animationPromise.bind(null, ele, anim, 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                    }
                                }
                            }
                        }

                        Promise.all(asset_board_anims.map(func => { return func(); }))
                        .then(() => {
                            this.utils.sanitizeAssetBoards();
                            for (const ele of changed_z_indices) { ele.style.zIndex = ''; }
                            this.risk_it = false;
                            if (this.risky_climb) { this.risky_climb = false; }
                            $('spread_draw').style.display = '';
                            resolve(); 
                        });
                    } else { // shouldn't animate

                        for (const [type, info] of Object.entries(board_assets[player_id])) {

                            // newly tucked cards
                            for (const id of Object.keys(info['tucked'])) {
                                if ($(`asset_card_${id}`)) { $(`asset_card_${id}`).remove(); }
                            }
                            if (Object.keys(info['tucked']).length > 0) {
                                const tucked_counter = $(`${character.name}_${type}_counter`);
                                tucked_counter.style.display = 'block';
                            }

                            // newly played cards and repositioned cards
                            for (const [slot, asset] of Object.entries(info)) {

                                if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                    const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                    const asset_ele = $(`asset_card_${id}`);
                                    const slot_ele = $(`${character.name}_${type}_${slot}`);
                                    if (slot_ele.firstElementChild != asset_ele) {
                                        slot_ele.append(asset_ele);
                                    }
                                }
                            }
                        }
                        $('assets_wrap').querySelectorAll('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
                        this.utils.sanitizeAssetBoards();
                        $('spread_draw').style.display = '';
                        if (this.risky_climb) { this.risky_climb = false; }
                        this.risk_it = false;
                        resolve();
                    }
                });
            }
            await playAssets();
            
            this.utils.updateBoardAssets(player_id);
            this.utils.updatePlayerResources(player_id, notif.args.player_resources);
            this.utils.handCount(player_id, notif.args.hand_count);

            // disard used summit beta tokens
            await this.utils.discardPlayedSummitBetaTokens();
            this.utils.cleanSummitBetaDiscardPile();

            this.utils.resizeHand();
            await this.utils.notif_confirmRequirements(notif);
            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_drawClimbingCard: async function(notif) {

            this.utils.updateTitlebar(_('Drawing Climbing Card'));
            this.removeActionButtons();
            $('climbing_slot').style.display = 'block';

            let climbing_card_info = notif.args.climbing_card_info;
            const climbing_card = this.gamedatas.climbing_cards[climbing_card_info.type_arg];
            this.climbing_card_choice_handlers = [];

            if (this.utils.shouldAnimate()) {

                const climbing_card_flip = dojo.place(this.format_block('jstpl_flip_card', {
                    card_id : climbing_card_info.id,
                    extra_classes : '',
                    back_type : 'climbing climbing_back_for_flip',
                    front_type : 'climbing',
                    cX : climbing_card.x_y[0],
                    cY : climbing_card.x_y[1],
                }), 'climbing_deck');

                const animateClimbingCard = async () => {

                    $('climbing_deck').style.zIndex = '200';
                    this.utils.animationPromise(climbing_card_flip.firstElementChild, 'flip_transform', 'anim', null, false, false);
                    await this.utils.animationPromise(climbing_card_flip, 'climbing_card_straighten', 'anim', null, true, false);
                    const climbing_card_div = dojo.place(this.format_block('jstpl_climbing_card', {
                        CARD_ID : climbing_card_info.id,
                        ccX : climbing_card.x_y[0],
                        ccY : climbing_card.x_y[1],
                        a_height : climbing_card.height_top_a[0],
                        a_top : climbing_card.height_top_a[1],
                        b_height : climbing_card.height_top_b[0],
                        b_top : climbing_card.height_top_b[1],
                    }), 'climbing_straightened');
                    const args = [climbing_card_div, $('climbing_slot')];

                    const start_pos = climbing_card_div.getBoundingClientRect();
                    $('climbing_slot').append(climbing_card_div);
                    const end_pos = climbing_card_div.getBoundingClientRect();
                    const x_diff = end_pos.left - start_pos.left;
                    const top_of_climbing_deck = $('climbing_deck').getBoundingClientRect().top;
                    let y_diff = end_pos.top - top_of_climbing_deck;
                    dojo.setStyle(climbing_card_div.id, {
                        'top' : `${-y_diff}px`,
                        'left' : `-${x_diff}px`,
                        'width' : `${start_pos.width}px`,
                        'height' : `${start_pos.height}px`
                    });
                    climbing_card_div.style.setProperty('--dw', `${end_pos.width}px`);
                    climbing_card_div.style.setProperty('--dh', `${end_pos.height}px`);

                    await this.utils.animationPromise(climbing_card_div, 'climbing_card_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    dojo.setStyle(climbing_card_div.id, {
                        'top' : '',
                        'left' : '',
                        'width' : '',
                        'height' : ''
                    });
                    $('climbing_dimmer').classList.add('dim_bg');

                    if (this.isCurrentPlayerActive()) {
                        const choice_top = $(`${climbing_card_info.id}_top`);
                        const choice_bottom = $(`${climbing_card_info.id}_bottom`);
                        this.climbing_card_choice_handlers[0] = dojo.connect(choice_top, 'onclick', this, 'onSelectClimbingCardChoice');
                        this.climbing_card_choice_handlers[1] = dojo.connect(choice_bottom, 'onclick', this, 'onSelectClimbingCardChoice');
                        choice_top.classList.add('cursor');
                        choice_bottom.classList.add('cursor');
                    }
                    $('climbing_deck').style.zIndex = '199';
                    this.utils.climbingTooltip(`climbing_card_${climbing_card_info.id}`, climbing_card_info.type_arg);

                    this.notifqueue.setSynchronousDuration();

                }
                animateClimbingCard();

            } else { // shouldn't animate
                const climbing_card_div = dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : climbing_card_info.id,
                    ccX : climbing_card.x_y[0],
                    ccY : climbing_card.x_y[1],
                    a_height : climbing_card.height_top_a[0],
                    a_top : climbing_card.height_top_a[1],
                    b_height : climbing_card.height_top_b[0],
                    b_top : climbing_card.height_top_b[1],
                }), 'climbing_slot');
                $('climbing_dimmer').classList.add('dim_bg');

                if (this.isCurrentPlayerActive()) {
                    const choice_top = $(`${climbing_card_info.id}_top`);
                    const choice_bottom = $(`${climbing_card_info.id}_bottom`);
                    this.climbing_card_choice_handlers[0] = dojo.connect(choice_top, 'onclick', this, 'onSelectClimbingCardChoice');
                    this.climbing_card_choice_handlers[1] = dojo.connect(choice_bottom, 'onclick', this, 'onSelectClimbingCardChoice');
                    choice_top.classList.add('cursor');
                    choice_bottom.classList.add('cursor');
                }
                this.utils.climbingTooltip(`climbing_card_${climbing_card_info.id}`, climbing_card_info.type_arg);
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_crimperDrawsClimbingCards: async function(notif) {

            this.utils.updateTitlebar(_('Drawing Climbing Cards'));
            this.removeActionButtons();
            $('crimper_display').style.display = 'block';

            let card_1_info = notif.args.climbing_card_info_1;
            let card_2_info = notif.args.climbing_card_info_2;
            const card_1 = this.gamedatas.climbing_cards[card_1_info.type_arg];
            const card_2 = this.gamedatas.climbing_cards[card_2_info.type_arg];

            if (this.utils.shouldAnimate()) {

                $('crimper_draw').style.display = 'block';

                const card_1_flip = dojo.place(this.format_block('jstpl_flip_card', {
                    card_id : card_1_info.id,
                    extra_classes : '',
                    back_type : 'climbing climbing_back_for_flip',
                    front_type : 'climbing',
                    cX : card_1.x_y[0],
                    cY : card_1.x_y[1],                    
                }), 'climbing_deck');
                const card_2_flip = dojo.place(this.format_block('jstpl_flip_card', {
                    card_id : card_2_info.id,
                    extra_classes : '',
                    back_type : 'climbing climbing_back_for_flip',
                    front_type : 'climbing',
                    cX : card_2.x_y[0],
                    cY : card_2.x_y[1],                    
                }), 'climbing_deck');

                $('climbing_deck').style.zIndex = '200';
                this.utils.animationPromise(card_1_flip.firstElementChild, 'flip_transform', 'anim', null, false, false);
                this.utils.animationPromise(card_1_flip, 'crimper_first_card_straighten', 'anim', null, true, false);
                this.utils.animationPromise(card_2_flip.firstElementChild, 'flip_transform', 'anim', null, false, false);
                await this.utils.animationPromise(card_2_flip, 'crimper_second_card_straighten', 'anim', null, true, false);

                document.querySelectorAll('#crimper_draw > *').forEach(ele => { ele.style.transform = 'rotate(0deg)'; });
                const card_1_div = dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : card_1_info.id,
                    ccX : card_1.x_y[0],
                    ccY : card_1.x_y[1],
                    a_height : card_1.height_top_a[0],
                    a_top : card_1.height_top_a[1],
                    b_height : card_1.height_top_b[0],
                    b_top : card_1.height_top_b[1],
                }), 'crimper_draw_1');
                const card_2_div = dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : card_2_info.id,
                    ccX : card_2.x_y[0],
                    ccY : card_2.x_y[1],
                    a_height : card_2.height_top_a[0],
                    a_top : card_2.height_top_a[1],
                    b_height : card_2.height_top_b[0],
                    b_top : card_2.height_top_b[1],
                }), 'crimper_draw_2');
                const args_1 = [card_1_div, $('crimper_display_1')];
                const args_2 = [card_2_div, $('crimper_display_2')];

                const start_pos_1 = card_1_div.getBoundingClientRect();
                $('crimper_display_1').append(card_1_div);
                const end_pos_1 = card_1_div.getBoundingClientRect();
                const x_diff_1 = end_pos_1.left - start_pos_1.left;
                const top_of_climbing_deck = $('climbing_deck').getBoundingClientRect().top;
                let y_diff_1 = Math.abs(end_pos_1.top - top_of_climbing_deck);
                if (window.scrollY === 0) { y_diff_1 = -y_diff_1; }

                dojo.setStyle(card_1_div.id, {
                    'top' : `${-y_diff_1}px`,
                    'left' : `-${x_diff_1}px`,
                    'width' : `${start_pos_1.width}px`,
                    'height' : `${start_pos_1.height}px`
                });
                card_1_div.style.setProperty('--dw', `${end_pos_1.width}px`);
                card_1_div.style.setProperty('--dh', `${end_pos_1.height}px`);

                const start_pos_2 = card_2_div.getBoundingClientRect();
                $('crimper_display_2').append(card_2_div);
                const end_pos_2 = card_2_div.getBoundingClientRect();
                const x_diff_2 = end_pos_2.left - start_pos_2.left;
                let y_diff_2 = Math.abs(end_pos_2.top - top_of_climbing_deck);
                if (window.scrollY === 0) { y_diff_2 = -y_diff_2; }

                dojo.setStyle(card_2_div.id, {
                    'top' : `${-y_diff_2}px`,
                    'left' : `-${x_diff_2}px`,
                    'width' : `${start_pos_2.width}px`,
                    'height' : `${start_pos_2.height}px`
                });
                card_2_div.style.setProperty('--dw', `${end_pos_2.width}px`);
                card_2_div.style.setProperty('--dh', `${end_pos_2.height}px`);

                this.utils.animationPromise(card_1_div, 'climbing_card_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args_1);
                await this.utils.animationPromise(card_2_div, 'climbing_card_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args_2);
                dojo.setStyle(card_1_div.id, {
                    'top' : '',
                    'left' : '',
                    'width' : '',
                    'height' : ''
                });
                dojo.setStyle(card_2_div.id, {
                    'top' : '',
                    'left' : '',
                    'width' : '',
                    'height' : ''
                })
                $('climbing_deck').style.zIndex = '199';
                $('climbing_dimmer').classList.add('dim_bg');

                this.utils.climbingTooltip(`climbing_card_${card_1_info.id}`, card_1_info.type_arg);
                this.utils.climbingTooltip(`climbing_card_${card_2_info.id}`, card_2_info.type_arg);
                
                $('crimper_draw').style.display = '';
                this.notifqueue.setSynchronousDuration();
            }

            else { // shouldn't animate
                
                const card_1_div = dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : card_1_info.id,
                    ccX : card_1.x_y[0],
                    ccY : card_1.x_y[1],
                    a_height : card_1.height_top_a[0],
                    a_top : card_1.height_top_a[1],
                    b_height : card_1.height_top_b[0],
                    b_top : card_1.height_top_b[1],
                }), 'crimper_display_1');
                const card_2_div = dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : card_2_info.id,
                    ccX : card_2.x_y[0],
                    ccY : card_2.x_y[1],
                    a_height : card_2.height_top_a[0],
                    a_top : card_2.height_top_a[1],
                    b_height : card_2.height_top_b[0],
                    b_top : card_2.height_top_b[1],
                }), 'crimper_display_2');
                $('climbing_deck').style.zIndex = '199';

                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_passedClimbingCard: async function(notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate()) {
                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            
            } else { // shouldn't animate

                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();
            if ($('pass_message')) { $('pass_message').remove(); }
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmClimbingChoiceOpponent: async function(notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            await this.utils.parseClimbingEffect('cost', notif);
            await this.utils.parseClimbingEffect('benefit', notif);

            this.asset_discard = notif.args.asset_discard;

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate() && notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) {
                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            if (notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) {
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmClimbingChoice: async function (notif) {
            
            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            await this.utils.parseClimbingEffect('cost', notif);
            await this.utils.parseClimbingEffect('benefit', notif);

            this.asset_discard = notif.args.asset_discard;

            dojo.query('#climbing_discard .cursor').forEach((ele) => { ele.classList.remove('cursor'); });
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate() && notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) {
                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            if (notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) {
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmAssetsForDiscardPrivate: async function (notif) {

            this.utils.clicksOff();

            if (notif.args.bomber_anchor && $('show_hide_card_button') && $('show_hide_card_button').classList.contains('shown')) {
                $('show_hide_card_button').click();
            }

            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const opponent = notif.args.opponent ? notif.args.opponent : null;
            const opponent_name = notif.args.opponent_name;
            const opponent_color = notif.args.opponent_color;
            const discard_pile = $('asset_discard');
            const hand_card_ids = notif.args.hand_card_ids;
            const board_card_ids = notif.args.board_card_ids;
            const tucked_card_ids = notif.args.tucked_card_ids;
            const flipped_ids = notif.args.flipped_ids;
            const all_card_ids = tucked_card_ids.concat(hand_card_ids, board_card_ids);
            const board_assets = notif.args.board_assets;
            this.gamedatas.board_assets = board_assets;
            this.asset_discard = notif.args.asset_discard;
            const tucked_nums_for_decrement = [];
            dojo.query('.cursor').forEach(ele => {
                if (!ele.classList.contains('choice')) {
                    ele.classList.remove('cursor', 'selectable', 'selected_resource');
                    ele.parentElement.classList.remove('selectable_wrap');
                }
            });

            for (const asset_id of board_card_ids) {
                const type_arg = this.gamedatas.asset_identifier[asset_id];
                const type = this.utils.getAssetType(type_arg);
                const slot_num = dojo.query(`#asset_card_${asset_id}`)[0].parentElement.id.slice(-1);
            }

            for (const asset_id of tucked_card_ids) {
                const type_arg = this.gamedatas.asset_identifier[asset_id];
                const type = this.utils.getAssetType(type_arg);
                tucked_nums_for_decrement.push(type);
            }

            let asset_anims = [];

            await (async () => {

                return new Promise(async (resolve) => {
                    if (player_id == this.player_id) {

                        //********
                        if (!opponent) { // cards to discard pile

                            if (this.utils.shouldAnimate()) {

                                this.utils.updateTitlebar(_('Discarding asset(s)'));

                                for (const asset_id of tucked_card_ids) {
                                    const type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const type = this.utils.getAssetType(type_arg);
                                    const asset = this.gamedatas.asset_cards[type_arg];
                                    const asset_counter_img = $(`${character.name}_${type}_counter`).firstElementChild;
                                    const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                        CARD_ID : asset_id,
                                        EXTRA_CLASSES : '',
                                        acX : asset['x_y'][0],
                                        acY : asset['x_y'][1],
                                    }), asset_counter_img);

                                    // separate if both tucked from the same type
                                    if (asset_counter_img.children.length === 2) {
                                        const img_clone = asset_counter_img.cloneNode();
                                        img_clone.id = 'asset_counter_img_temp';
                                        img_clone.style.left = '41%';
                                        img_clone.style.backgroundImage = 'none';
                                        img_clone.append(asset_ele);
                                        asset_counter_img.parentElement.append(img_clone);
                                    }

                                    const args = [asset_ele, discard_pile, 3];
                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                for (const asset_id of hand_card_ids) {
                                    const asset_ele = $(`asset_card_${asset_id}`);
                                    asset_ele.style.zIndex = '10';
                                    asset_ele.parentElement.style.zIndex = '10';
                                    const args = [asset_ele, discard_pile, 3];
                                    delete this.gamedatas.hand_assets[asset_id];

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                let old_board_zs = [];
                                for (const asset_id of board_card_ids) {

                                    const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const asset = this.gamedatas.asset_cards[asset_type_arg];
                                    const type = this.utils.getAssetType(asset_type_arg);

                                    let asset_ele = $(`asset_card_${asset_id}`);
                                    const old_board_slot = asset_ele.parentElement;
                                    const old_z = old_board_slot.style.zIndex;
                                    old_board_zs.push([old_board_slot, old_z]);
                                    old_board_slot.style.zIndex = '10';

                                    const old_board_slot_num = asset_ele.parentElement.id.slice(-1);
                                    let args = [asset_ele, discard_pile, 3];

                                    if (flipped_ids.includes(asset_id)) {

                                        asset_ele.remove();
                                        const flip_ele = dojo.place(this.format_block('jstpl_flip_card', {
                                            card_id : asset_id,
                                            extra_classes : '',
                                            back_type : 'asset asset_back_for_flip',
                                            front_type : 'asset',
                                            cX : asset.x_y[0],
                                            cY : asset.x_y[1],
                                        }), old_board_slot);
                                        await this.utils.animationPromise(flip_ele.firstElementChild, 'flip_transform', 'anim', null, false, false);
                                        flip_ele.remove();
                                        asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : asset_id,
                                            EXTRA_CLASSES : 'played_asset',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), old_board_slot);
                                        args[0] = asset_ele;
                                    }

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_board_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }
                                
                                const last_card_ele = $(`asset_card_${all_card_ids[all_card_ids.length-1]}`);

                                Promise.all(asset_anims.map(func => { return func(); })).then(() => {
                                    if (player_id == this.player_id) { this.utils.updatePlayerResources(player_id, notif.args.player_resources); }
                                    dojo.query('.hand_asset_wrap').forEach(ele => { ele.style.zIndex = ''; });
                                    dojo.query('#asset_discard > .asset').forEach(ele => { ele.style.zIndex = ''; });
                                    for (let i=0; i<=old_board_zs.length-1; i++) {
                                        const slot = old_board_zs[i][0];
                                        const z = old_board_zs[i][1];
                                        slot.style.zIndex = z;
                                    }
                                    const asset_discard = $('asset_discard');
                                    asset_discard.append(last_card_ele);
                                    while (asset_discard.childElementCount > 1) { asset_discard.firstElementChild.remove(); }
                                    if ($('asset_counter_img_temp')) { $('asset_counter_img_temp').remove(); }

                                    this.utils.updatePanelAfterDiscard(player_id, opponent, notif.args.player_resources, notif.args.opponent_resources, notif.args.player_hand_count, notif.args.opponent_hand_count, all_card_ids);
                                    this.utils.decrementTuckedNums(player_id, tucked_nums_for_decrement);
                                    resolve();
                                });

                            } else { // shouldn't animate
                                all_card_ids.map(id => {
                                    let card = $(`asset_card_${id}`);
                                    if (card && card.classList.contains('flipped')) {
                                        const type_arg = this.gamedatas.asset_identifier[id];
                                        const asset = this.gamedatas.asset_cards[type_arg];
                                        const parent = card.parentElement;
                                        card.remove();
                                        card = dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : id,
                                            EXTRA_CLASSES : '',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), parent);
                                    }

                                    if (card && id === all_card_ids[all_card_ids.length-1]) { discard_pile.append(card); }
                                    else if (card) { card.remove(); }
                                    else if (id === all_card_ids[all_card_ids.length-1]) {

                                        const type_arg = this.gamedatas.asset_identifier[id];
                                        const asset = this.gamedatas.asset_cards[type_arg];
                                        const top_of_discard = dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : id,
                                            EXTRA_CLASSES : '',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), $('asset_discard'));
                                    }
                                });
                                while ($('asset_discard').childElementCount > 1) { $('asset_discard').firstElementChild.remove(); }

                                this.utils.decrementTuckedNums(player_id, tucked_nums_for_decrement);
                                this.utils.updatePanelAfterDiscard(player_id, opponent, notif.args.player_resources, notif.args.opponent_resources, notif.args.player_hand_count, notif.args.opponent_hand_count, all_card_ids);
                                resolve();
                            }

                        // ********
                        } else { // give to opponent instead of discard to pile

                            if (this.utils.shouldAnimate()) {

                                this.utils.updateTitlebar(_('Giving asset/s to '));
                                const opponent_name_span = document.createElement('span');
                                opponent_name_span.id = `${opponent_name}_span`;
                                opponent_name_span.classList.add('name_span');
                                opponent_name_span.innerHTML = opponent_name;
                                opponent_name_span.style.color = opponent_color;
                                const hand_counter = $(`hand_counter_${opponent}`);
                                $('gameaction_status').parentElement.append(opponent_name_span);

                                for (const asset_id of hand_card_ids) {
                                    const asset_ele = $(`asset_card_${asset_id}`);
                                    asset_ele.style.zIndex = '10';
                                    asset_ele.parentElement.style.zIndex = '10';

                                    const asset_ele_origin = asset_ele.parentElement;
                                    hand_counter.append(asset_ele);
                                    let new_width = asset_ele.getBoundingClientRect().width;
                                    let new_height = asset_ele.getBoundingClientRect().height;
                                    asset_ele_origin.append(asset_ele);
                                    asset_ele.style.setProperty('--dw', new_width);
                                    asset_ele.style.setProperty('--dh', new_height);
                                    const args = [asset_ele, hand_counter, null, false, true];
                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_hand_to_counter', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                let old_board_zs = [];
                                for (const asset_id of board_card_ids) {

                                    const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const asset = this.gamedatas.asset_cards[asset_type_arg];
                                    const type = this.utils.getAssetType(asset_type_arg);

                                    let asset_ele = $(`asset_card_${asset_id}`);
                                    const old_board_slot = asset_ele.parentElement;
                                    const old_z = old_board_slot.style.zIndex;
                                    old_board_zs.push([old_board_slot, old_z]);
                                    old_board_slot.style.zIndex = '10';

                                    const old_board_slot_num = asset_ele.parentElement.id.slice(-1);
                                    if (flipped_ids.includes(asset_id)) {

                                        asset_ele.remove();
                                        const flip_ele = dojo.place(this.format_block('jstpl_flip_card', {
                                            card_id : asset_id,
                                            extra_classes : '', 
                                            back_type : 'asset asset_back_for_flip',
                                            front_type : 'asset',
                                            cX : asset.x_y[0],
                                            cY : asset.x_y[1],
                                        }), old_board_slot);
                                        await this.utils.animationPromise(flip_ele.firstElementChild, 'flip_transform', 'anim', null, false, false);
                                        flip_ele.remove();
                                        asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : asset_id,
                                            EXTRA_CLASSES : 'played_asset',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), old_board_slot);
                                    }

                                    const args = [asset_ele, $(`hand_counter_${opponent}`)];
                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_board_to_counter', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                for (const asset_id of tucked_card_ids) {
                                    const type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const type = this.utils.getAssetType(type_arg);
                                    const asset = this.gamedatas.asset_cards[type_arg];
                                    const asset_counter_img = $(`${character.name}_${type}_counter`).firstElementChild;
                                    const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                        CARD_ID : asset_id,
                                        EXTRA_CLASSES : '',
                                        acX : asset['x_y'][0],
                                        acY : asset['x_y'][1],
                                    }), asset_counter_img);

                                    // separate if both tucked from the same type
                                    if (asset_counter_img.children.length === 2) {
                                        const img_clone = asset_counter_img.cloneNode();
                                        img_clone.id = 'asset_counter_img_temp';
                                        img_clone.style.left = '41%';
                                        img_clone.style.backgroundImage = 'none';
                                        img_clone.append(asset_ele);
                                        asset_counter_img.parentElement.append(img_clone);
                                    }

                                    const args = [asset_ele, $(`hand_counter_${opponent}`)];
                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_counter', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                Promise.all(asset_anims.map(func => { return func(); }))
                                .then(() => {
                                    dojo.query('.hand_asset_wrap').forEach(ele => { ele.style.zIndex = ''; });
                                    dojo.query('.hand_counter .asset').forEach(ele => { ele.remove(); });
                                    if ($('asset_counter_img_temp')) { $('asset_counter_img_temp').remove(); }
                                })
                                .then(async () => {
                                    if (notif.args.climbing_card_info['give_psych'] || notif.args.risk_it_info[0] === 3) {
                                        this.utils.updateWaterPsych(player_id, 0, -1)
                                        await this.utils.updateWaterPsych(opponent, 0, 1);
                                    }
                                })
                                .then(() => {
                                    for (let i=0; i<=old_board_zs.length-1; i++) {
                                        const slot = old_board_zs[i][0];
                                        const z = old_board_zs[i][1];
                                        slot.style.zIndex = z;
                                    }

                                    this.utils.decrementTuckedNums(player_id, tucked_nums_for_decrement);
                                    this.utils.updatePanelAfterDiscard(player_id, opponent, notif.args.player_resources, notif.args.opponent_resources, notif.args.player_hand_count, notif.args.opponent_hand_count, all_card_ids);
                                    
                                    resolve();
                                });

                            } else { // shouldn't animate
                                all_card_ids.map(id => {
                                    const card = $(`asset_card_${id}`);
                                    card.remove();
                                });
                                if (notif.args.climbing_card_info['give_psych'] || notif.args.risk_it_info[0] === 3) {
                                    this.utils.updateWaterPsych(player_id, 0, -1);
                                    this.utils.updateWaterPsych(opponent, 0, 1);
                                }

                                this.utils.decrementTuckedNums(player_id, tucked_nums_for_decrement);
                                this.utils.updatePanelAfterDiscard(player_id, opponent, notif.args.player_resources, notif.args.opponent_resources, notif.args.player_hand_count, notif.args.opponent_hand_count, all_card_ids);
                                resolve();
                            }
                        } 

                    // ********
                    } else { // is asset recipient instead of sender

                        const new_card_slots = this.utils.resizeHand('asset', all_card_ids);

                        if (this.utils.shouldAnimate()) {

                            this.utils.updateTitlebar(_('Discarding asset(s)'));

                            $('asset_deck_draw').style.display = 'flex';
                            let i = 1;
                            for (const asset_id of hand_card_ids) {
                                const asset_type = this.gamedatas.asset_identifier[asset_id];
                                const asset = this.gamedatas.asset_cards[asset_type];
                                const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : asset_id,
                                    EXTRA_CLASSES : '',
                                    acX : asset.x_y[0],
                                    acY : asset.x_y[1],
                                }), `hand_counter_${player_id}`);

                                const deck_draw_slot = $(`deck_draw_${i}`);
                                deck_draw_slot.append(asset_ele);
                                const new_width = asset_ele.getBoundingClientRect().width;
                                const new_height = asset_ele.getBoundingClientRect().height;
                                $(`hand_counter_${player_id}`).append(asset_ele);
                                asset_ele.style.setProperty('--dw', new_width);
                                asset_ele.style.setProperty('--dh', new_height);
                                const args = [asset_ele, deck_draw_slot, null, false, true];
                                i++;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }

                            $(`hand_counter_${player_id}`).style.zIndex = '8';
                            $('asset_deck_draw').style.zIndex = '8';

                            let old_board_zs = [];
                            for (const asset_id of board_card_ids) {

                                const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                const asset = this.gamedatas.asset_cards[asset_type_arg];
                                const type = this.utils.getAssetType(asset_type_arg);
                                this.gamedatas.hand_assets[asset_id] = asset_type_arg;

                                let asset_ele = $(`asset_card_${asset_id}`);

                                const old_board_slot = asset_ele.parentElement;
                                const old_z = old_board_slot.style.zIndex;
                                old_board_zs.push([old_board_slot, old_z]);
                                old_board_slot.style.zIndex = '10';
                                const old_board_slot_num = asset_ele.parentElement.id.slice(-1);

                                if (flipped_ids.includes(asset_id)) {

                                    asset_ele.remove();
                                    const flip_ele = dojo.place(this.format_block('jstpl_flip_card', {
                                        card_id : asset_id,
                                        extra_classes : '',
                                        back_type : 'asset asset_back_for_flip',
                                        front_type : 'asset',
                                        cX : asset.x_y[0],
                                        cY : asset.x_y[1],
                                    }), old_board_slot);
                                    await this.utils.animationPromise(flip_ele.firstElementChild, 'flip_transform', 'anim', null, false, false);
                                    flip_ele.remove();
                                    asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                        CARD_ID : asset_id,
                                        EXTRA_CLASSES : 'played_asset',
                                        acX : asset.x_y[0],
                                        acY : asset.x_y[1],
                                    }), old_board_slot);
                                }

                                const deck_draw_slot = $(`deck_draw_${i}`);
                                const args = [asset_ele, deck_draw_slot];
                                i++;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_board_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }

                            for (const asset_id of tucked_card_ids) {
                                const type_arg = this.gamedatas.asset_identifier[asset_id];
                                const type = this.utils.getAssetType(type_arg);
                                const asset = this.gamedatas.asset_cards[type_arg];
                                const asset_counter_img = $(`${character.name}_${type}_counter`).firstElementChild;
                                const asset_ele = dojo.place(this.format_block('jstple_asset_card', {
                                    CARD_ID : asset_id,
                                    acX : asset['x_y'][0],
                                    acY : asset['x_y'][1],
                                }), asset_counter_img);
                                
                                // separate if both tucked from the same type
                                if (asset_counter_img.children.length === 2) {
                                    const img_clone = asset_counter_img.cloneNode();
                                    img_clone.id = 'asset_counter_img_temp';
                                    img_clone.style.left = '41%';
                                    img_clone.style.backgroundImage = 'none';
                                    img_clone.append(asset_ele);
                                    asset_counter_img.parentElement.append(img_clone);
                                }

                                const deck_draw_slot = $(`deck_draw_${i}`);
                                const args = [asset_ele, deck_draw_slot];
                                i++;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }

                            this.utils.updateTitlebar(_('Giving asset/s to '));
                            const opponent_name_span = document.createElement('span');
                            opponent_name_span.id = `${opponent_name}_span`;
                            opponent_name_span.classList.add('name_span');
                            opponent_name_span.innerHTML = opponent_name;
                            opponent_name_span.style.color = opponent_color;
                            $('gameaction_status').parentElement.append(opponent_name_span);


                            Promise.all(asset_anims.map((func) => { return func(); }))
                            .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                            .then(() => {
                                let asset_display_to_hand = [];
                                for (let id of all_card_ids) {
                                    const card = $(`asset_card_${id}`);
                                    const hand_slot = $(`hand_asset_${new_card_slots[id]}`);

                                    const args = [card, hand_slot];
                                    asset_display_to_hand.push(this.utils.animationPromise.bind(null, card, 'asset_display_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }
                                return Promise.all(asset_display_to_hand.map((func) => { return func(); }));
                            })
                            .then(async () => {
                                $(`hand_counter_${player_id}`).style.zIndex = '';
                                $('asset_deck_draw').style.zIndex = '';
                                $('asset_deck_draw').style.display = '';
                                if ($('asset_counter_img_temp')) { $('asset_counter_img_temp').remove(); }
                                $(`${opponent_name}_span`).remove();
                                if (this.risky_climb) { this.utils.updateTitlebar(_('Placing played Assets on Asset Board')); }
                                if (notif.args.climbing_card_info['give_psych'] || notif.args.risk_it_info[0] === 3) {
                                    this.utils.updateWaterPsych(player_id, 0, -1)
                                    await this.utils.updateWaterPsych(opponent, 0, 1);
                                }
                                for (let i=0; i<=old_board_zs.length-1; i++) {
                                    const slot = old_board_zs[i][0];
                                    const z = old_board_zs[i][1];
                                    slot.style.zIndex = z;
                                }

                                this.utils.updatePanelAfterDiscard(player_id, opponent, notif.args.player_resources, notif.args.opponent_resources, notif.args.player_hand_count, notif.args.opponent_hand_count, all_card_ids);
                                resolve();
                            });

                        } else { // shouldn't animate
                            board_card_ids.map(id => { $(`asset_card_${id}`).remove(); });
                            all_card_ids.map(id => {
                                const asset_type = this.gamedatas.asset_identifier[id];
                                const asset = this.gamedatas.asset_cards[asset_type];
                                const hand_slot = $(`hand_asset_${new_card_slots[id]}`);
                                const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : id,
                                    EXTRA_CLASSES : '',
                                    acX : asset.x_y[0],
                                    acY : asset.x_y[1],
                                }), hand_slot);
                            });
                            if (notif.args.climbing_card_info['give_psych'] || notif.args.risk_it_info[0] === 3) {
                                this.utils.updateWaterPsych(player_id, 0, -1)
                                this.utils.updateWaterPsych(opponent, 0, 1);
                            }

                            this.utils.updatePanelAfterDiscard(player_id, opponent, notif.args.player_resources, notif.args.opponent_resources, notif.args.player_hand_count, notif.args.opponent_hand_count, all_card_ids);
                            resolve();
                        }
                    }
                });
            })();

            this.utils.resizeHand();
            this.utils.cleanAssetDiscardPile();
            await this.utils.matchBoardAssets();
            if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); }

            await (async () => {
                if (Object.keys(notif.args.climbing_card_info).length > 0 && !notif.args.bomber_anchor) {

                    const water = notif.args.climbing_card_info['water_psych_for_climbing']['water'];
                    const psych = notif.args.climbing_card_info['water_psych_for_climbing']['psych'];
                    await this.utils.updateWaterPsych(player_id, water, psych);

                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    const climbing_card_info = notif.args.climbing_card_info;
                    if (climbing_card_info.final_state === 'discardAssets' && !['3', '7', '8', '12', '13', '14', '21', '23', '26', '27', '28', '31', '46', '48', '57'].includes(climbing_card_info.type_arg)) {
                        if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                        destination.append(climbing_div);
                        climbing_div.classList.remove('drawn_climbing');
                        $('climbing_discard').style.zIndex = '';
                        this.utils.cleanClimbingDiscardPile();
                    }
                }
            })();

            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmAssetsForDiscardPublic: async function (notif) {

            if (notif.args.bomber_anchor && $('show_hide_card_button') && $('show_hide_card_button').classList.contains('shown')) {
                $('show_hide_card_button').click();
            }

            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const opponent = notif.args.opponent ? notif.args.opponent : null;
            const opponent_name = notif.args.opponent_name;
            const discard_pile = $('asset_discard');
            const hand_card_ids_for_public = notif.args.hand_card_ids_for_public;
            const board_card_ids = notif.args.board_card_ids;
            const tucked_card_ids = notif.args.tucked_card_ids;
            const flipped_ids = notif.args.flipped_ids;
            const all_card_ids = tucked_card_ids.concat(hand_card_ids_for_public, board_card_ids);
            this.asset_discard = notif.args.asset_discard;
            this.gamedatas.board_assets = notif.args.board_assets;

            for (const asset_id of board_card_ids) {
                const type_arg = this.gamedatas.asset_identifier[asset_id];
                const type = this.utils.getAssetType(type_arg);
                const slot_num = dojo.query(`#asset_card_${asset_id}`)[0].parentElement.id.slice(-1);
            }

            for (const asset_id of tucked_card_ids) {
                const type_arg = this.gamedatas.asset_identifier[asset_id];
                const type = this.utils.getAssetType(type_arg);
            }

            let asset_anims = [];

            await (async () => {

                return new Promise(async (resolve) => {

                    if (!opponent) { // cards to discard pile

                        if (this.utils.shouldAnimate()) {
                            $('asset_deck_draw').style.display = 'flex';
                            let i = all_card_ids.length;

                            for (const asset_id of tucked_card_ids) {
                                const type_arg = this.gamedatas.asset_identifier[asset_id];
                                const type = this.utils.getAssetType(type_arg);
                                const asset = this.gamedatas.asset_cards[type_arg];
                                const asset_counter_img = $(`${character.name}_${type}_counter`).firstElementChild;
                                const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : asset_id,
                                    EXTRA_CLASSES : '',
                                    acX : asset['x_y'][0],
                                    acY : asset['x_y'][1],
                                }), asset_counter_img);

                                // separate if both tucked from the same type
                                if (asset_counter_img.children.length === 2) {
                                    const img_clone = asset_counter_img.cloneNode();
                                    img_clone.id = 'asset_counter_img_temp';
                                    img_clone.style.left = '41%';
                                    img_clone.style.backgroundImage = 'none';
                                    img_clone.append(asset_ele);
                                    asset_counter_img.parentElement.append(img_clone);
                                }

                                const deck_draw_slot = $(`deck_draw_${i}`);
                                const args = [asset_ele, deck_draw_slot];
                                i--;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }

                            for (const asset_id of hand_card_ids_for_public) {
                                const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                const asset = this.gamedatas.asset_cards[asset_type_arg];
                                const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : asset_id,
                                    EXTRA_CLASSES : '',
                                    acX : asset.x_y[0],
                                    acY : asset.x_y[1],
                                }), `hand_counter_${player_id}`);
                                const deck_draw_slot = $(`deck_draw_${i}`);
                                deck_draw_slot.append(asset_ele);
                                const new_width = asset_ele.getBoundingClientRect().width;
                                const new_height = asset_ele.getBoundingClientRect().height;
                                $(`hand_counter_${player_id}`).append(asset_ele);
                                asset_ele.style.setProperty('--dw', new_width);
                                asset_ele.style.setProperty('--dh', new_height);
                                const args = [asset_ele, deck_draw_slot, null, false, true];
                                i--;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }
                            
                            let old_board_zs = [];
                            for (const asset_id of board_card_ids) {
                                const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                const asset = this.gamedatas.asset_cards[asset_type_arg];
                                
                                let asset_ele = $(`asset_card_${asset_id}`);
                                const old_board_slot = asset_ele.parentElement;
                                const old_z = old_board_slot.style.zIndex;
                                old_board_zs.push([old_board_slot, old_z]);
                                old_board_slot.style.zIndex = '10';
                                const deck_draw_slot = $(`deck_draw_${i}`);
                                const old_board_slot_num = asset_ele.parentElement.id.slice(-1);
                                const args = [asset_ele, deck_draw_slot];
                                i--;

                                if (flipped_ids.includes(asset_id)) {

                                    asset_ele.remove();
                                    const flip_ele = dojo.place(this.format_block('jstpl_flip_card', {
                                        card_id : asset_id,
                                        extra_classes : '',
                                        back_type : 'asset asset_back_for_flip',
                                        front_type : 'asset',
                                        cX : asset.x_y[0],
                                        cY : asset.x_y[1],
                                    }), old_board_slot);
                                    await this.utils.animationPromise(flip_ele.firstElementChild, 'flip_transform', 'anim', null, false, false);
                                    flip_ele.remove();
                                    asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                        CARD_ID : asset_id,
                                        EXTRA_CLASSES : 'played_asset',
                                        acX : asset.x_y[0],
                                        acY : asset.x_y[1],
                                    }), old_board_slot);
                                    args[0] = asset_ele;
                                }

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_board_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }
                            const last_card_ele = $(`asset_card_${all_card_ids[all_card_ids.length-1]}`);

                            this.utils.updateTitlebar(_('Discarding Asset(s)'));
                            Promise.all(asset_anims.map(func => { return func(); }))
                            .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                            .then(() => {
                                let asset_display_to_discard = [];
                                for (let id of all_card_ids) {
                                    const card = $(`asset_card_${id}`);

                                    const args = [card, discard_pile, 3];
                                    asset_display_to_discard.push(this.utils.animationPromise.bind(null, card, 'asset_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }
                                return Promise.all(asset_display_to_discard.map((func) => { return func(); }));
                            })
                            .then(() => {
                                $('asset_deck_draw').style.display = '';
                                if ($('asset_counter_img_temp')) { $('asset_counter_img_temp').remove(); }
                                for (let i=0; i<=old_board_zs.length-1; i++) {
                                    const slot = old_board_zs[i][0];
                                    const z = old_board_zs[i][1];
                                    slot.style.zIndex = z;
                                }
                                const asset_discard = $('asset_discard');
                                asset_discard.append(last_card_ele);
                                while (asset_discard.childElementCount > 1) { asset_discard.firstElementChild.remove(); }
                                resolve();
                            });
                        } else { // shouldn't animate

                            if (board_card_ids.length > 0) {
                                board_card_ids.map(id => { $(`asset_card_${id}`).remove(); });
                            }
                            all_card_ids.map(id => {
                                const asset_type = this.gamedatas.asset_identifier[id];
                                const asset = this.gamedatas.asset_cards[asset_type];
                                const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : id,
                                    EXTRA_CLASSES : '',
                                    acX : asset.x_y[0],
                                    acY : asset.x_y[1],
                                }), discard_pile);
                            });
                            while ($('asset_discard').childElementCount > 1) { $('asset_discard').firstElementChild.remove(); }
                            resolve();
                        }
                    } else { // cards going to opponent instead of discard

                        await (async () => {
                            if (this.utils.shouldAnimate()) {
                                let i = 1;
                                for (const card of hand_card_ids_for_public) {

                                    const asset_back = dojo.place(this.format_block('jstpl_asset_card', {
                                                      CARD_ID : `00${i}`,
                                                      EXTRA_CLASSES : '',
                                                      acX : 0,
                                                      acY : 0,
                                    }), `hand_counter_${player_id}`);

                                    const args = [asset_back, $(`hand_counter_${opponent}`)];
                                    this.utils.animationPromise(asset_back, 'asset_counter_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                    await (async function() { return new Promise(resolve => setTimeout(resolve, 200)) })();
                                    if (i === all_card_ids.length) {
                                        await (async function() { return new Promise(resolve => setTimeout(resolve, 600)) })();
                                        this.utils.handCount(player_id, notif.args.player_hand_count);
                                        this.utils.handCount(opponent, notif.args.opponent_hand_count);
                                        if (notif.args.climbing_card_info['give_psych'] || notif.args.risk_it_info[0] === 3) {
                                            this.utils.updateWaterPsych(player_id, 0, -1)
                                            await this.utils.updateWaterPsych(opponent, 0, 1);
                                        }
                                        resolve();
                                    }
                                    i++;
                                }

                                let asset_anims = [];
                                let old_board_zs = [];
                                for (const asset_id of board_card_ids) {

                                    const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const asset = this.gamedatas.asset_cards[asset_type_arg];
                                    
                                    let asset_ele = $(`asset_card_${asset_id}`);
                                    const old_board_slot = asset_ele.parentElement;
                                    const old_z = old_board_slot.style.zIndex;
                                    old_board_zs.push([old_board_slot, old_z]);
                                    old_board_slot.style.zIndex = '10';
                                    const deck_draw_slot = $(`deck_draw_${i}`);

                                    const old_board_slot_num = asset_ele.parentElement.id.slice(-1);
                                    const args = [asset_ele, deck_draw_slot];
                                    i++;

                                    if (flipped_ids.includes(asset_id)) {

                                        asset_ele.remove();
                                        const flip_ele = dojo.place(this.format_block('jstpl_flip_card', {
                                            card_id : asset_id,
                                            extra_classes : '',
                                            back_type : 'asset asset_back_for_flip',
                                            front_type : 'asset',
                                            cX : asset.x_y[0],
                                            cY : asset.x_y[1],
                                        }), old_board_slot);
                                        await this.utils.animationPromise(flip_ele.firstElementChild, 'flip_transform', 'anim', null, false, false);
                                        flip_ele.remove();
                                        asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : asset_id,
                                            EXTRA_CLASSES : 'played_asset',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), old_board_slot);
                                        args[0] = asset_ele;
                                    }

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_board_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                for (const asset_id of tucked_card_ids) {
                                    const type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const type = this.utils.getAssetType(type_arg);
                                    const asset = this.gamedatas.asset_cards[type_arg];
                                    const asset_counter_img = $(`${character.name}_${type}_counter`).firstElementChild;
                                    const asset_ele = dojo.place(this.format_block('jstple_asset_card', {
                                        CARD_ID : asset_id,
                                        acX : asset['x_y'][0],
                                        acY : asset['x_y'][1],
                                    }), asset_counter_img);

                                    // separate if both tucked from the same type
                                    if (asset_counter_img.children.length === 2) {
                                        const img_clone = asset_counter_img.cloneNode();
                                        img_clone.id = 'asset_counter_img_temp';
                                        img_clone.style.left = '41%';
                                        img_clone.style.backgroundImage = 'none';
                                        img_clone.append(asset_ele);
                                        asset_counter_img.parentElement.append(img_clone);
                                    }

                                    const deck_draw_slot = $(`deck_draw_${i}`);
                                    const args = [asset_ele, deck_draw_slot];
                                    i++;

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                if (board_card_ids.length + tucked_card_ids.length > 0) {
                                    $('asset_deck_draw').style.display = 'flex';
                                    Promise.all(asset_anims.map(func => { return func(); }))
                                    .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                                    .then(() => {
                                        let asset_display_to_counter = [];
                                        const hand_counter = $(`hand_counter_${opponent}`);
                                        for (let id of board_card_ids.concat(tucked_card_ids)) {
                                            const card = $(`asset_card_${id}`);

                                            const card_origin = card.parentElement;
                                            hand_counter.append(card);
                                            const new_width = card.getBoundingClientRect().width;
                                            const new_height = card.getBoundingClientRect().height;
                                            card_origin.append(card);
                                            card.style.setProperty('--dw', new_width);
                                            card.style.setProperty('--dh', new_height);
                                            const args = [card, hand_counter, null, false, true];
                                            asset_display_to_counter.push(this.utils.animationPromise.bind(null, card, 'asset_display_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args));
                                        }
                                        return Promise.all(asset_display_to_counter.map(func => { return func(); }));
                                    })
                                    .then(async () => {
                                        for (let i=0; i<=old_board_zs.length-1; i++) {
                                            const slot = old_board_zs[i][0];
                                            const z = old_board_zs[i][1];
                                            slot.style.zIndex = z;
                                        }
                                        $('asset_deck_draw').style.display = '';
                                        if ($('asset_counter_img_temp')) { $('asset_counter_img_temp').remove(); }
                                        this.utils.handCount(player_id, notif.args.player_hand_count);
                                        this.utils.handCount(opponent, notif.args.opponent_hand_count);
                                        if (notif.args.climbing_card_info['give_psych'] || notif.args.risk_it_info[0] === 3) {
                                            this.utils.updateWaterPsych(player_id, 0, -1)
                                            await this.utils.updateWaterPsych(opponent, 0, 1);
                                        }
                                        resolve();
                                    })
                                }
                            }

                            else { // shouldn't animate
                                if (notif.args.climbing_card_info['give_psych'] || notif.args.risk_it_info[0] === 3) {
                                    this.utils.updateWaterPsych(player_id, 0, -1)
                                    this.utils.updateWaterPsych(opponent, 0, 1);
                                }
                                if (board_card_ids.length + tucked_card_ids > 0) {
                                    board_card_ids.map(id => { $(`asset_card_${id}`).remove(); });
                                }
                                resolve();
                            }
                        })();
                    }
                });
            })();
            this.utils.cleanAssetDiscardPile();
            await this.utils.matchBoardAssets();
            if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); }


            // resolve any water/psych benefits from the climbing card
            await (async () => {
                return new Promise(async (resolve) => {
                    if (notif.args.climbing_card_info != null && !notif.args.bomber_anchor) {
                        const water = notif.args.climbing_card_info['water_psych_for_climbing']['water'];
                        const psych = notif.args.climbing_card_info['water_psych_for_climbing']['psych'];
                        await this.utils.updateWaterPsych(player_id, water, psych);
                        resolve();
                    } else { resolve(); }
                });
            })();

            this.utils.updatePlayerResources(player_id, notif.args.player_water_psych);
            this.utils.handCount(player_id, notif.args.player_hand_count);

            // discard climbing card
            await (async () => {
                const climbing_card_info = notif.args.climbing_card_info;
                if (climbing_card_info.final_state === 'discardAssets' 
                    && !['3', '7', '8', '12', '14', '21', '23', '26', '27', '28', '31', '46', '48', '57'].includes(climbing_card_info.type_arg)
                    && !notif.args.bomber_anchor) {
                    const climbing_div = $('climbing_discard_straightened').firstElementChild;
                    const destination = $('climbing_discard_90');
                    if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';
                    this.utils.cleanClimbingDiscardPile();
                }
            })();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSummitBetaOpponent: async function (notif) {

            const card_destination = $('climbing_discard_90');
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;

            this.utils.updateTitlebar(_('Drawing Summit Beta Token'));

            if (this.utils.shouldAnimate()) {
                const player_id = notif.args.opponent_id ? notif.args.opponent_id : notif.args.player_id;

                const summit_back = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : 0,
                    sbX : 0,
                    sbY : 0,
                }), 'summit_pile');
                summit_back.classList.add('summit_back');
                const token_destination = $(`hand_counter_${player_id}`);
                const args = [summit_back, token_destination];

                await this.utils.animationPromise(summit_back, 'token_board_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                if (climbing_div) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    card_destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';
                }
            }
            else { // shouldn't animate
                if (climbing_div) {
                    card_destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';
                }
            }
            this.utils.cleanClimbingDiscardPile();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSummitBeta: async function (notif) {

            const hand_summit_beta_tokens = notif.args.hand_summit_beta_tokens;
            this.gamedatas.hand_summit_beta_tokens = hand_summit_beta_tokens;
            const new_token_slot = this.utils.resizeHand('token');
            const summit_beta_from_db = notif.args.summit_beta_token;
            const summit_beta_token = this.gamedatas.summit_beta_tokens[summit_beta_from_db.type_arg];
            const bg_pos = summit_beta_token['x_y'];
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const card_destination = $('climbing_discard_90');
            const summit_beta_div_id = `summit_beta_${summit_beta_from_db.id}`;

            this.utils.updateTitlebar(_('Drawing Summit Beta Token'));

            if (this.utils.shouldAnimate()) {
                const summit_flip = dojo.place(this.format_block('jstpl_flip_card', {
                    card_id : summit_beta_from_db.id,
                    extra_classes : '',
                    back_type : 'summit_beta summit_back_for_flip',
                    front_type : 'summit_beta',
                    cX : bg_pos[0],
                    cY : bg_pos[1],
                }), 'summit_pile');
                $('summit_pile').style.zIndex = '203';

                await this.utils.animationPromise(summit_flip.firstElementChild, 'flip_transform_summit_beta', 'anim', null, true, false);
                const summit_beta_div = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : summit_beta_from_db.id,
                    sbX : bg_pos[0],
                    sbY : bg_pos[1],
                }), 'summit_pile');
                summit_beta_div.style.width = '200%';
                summit_beta_div.style.height = '200%';
                await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();

                const args = [summit_beta_div, new_token_slot];
                $('summit_pile').style.zIndex = '';
                await this.utils.animationPromise(summit_beta_div, 'token_board_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                summit_beta_div.style.width = '100%';
                summit_beta_div.style.height = '100%';

                if (climbing_div) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    card_destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';
                    this.utils.cleanClimbingDiscardPile();
                }
            }
            else { // shouldn't animate
                dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : summit_beta_from_db.id,
                    sbX : bg_pos[0],
                    sbY : bg_pos[1],
                }), new_token_slot);
                if (climbing_div) {
                    card_destination.append(climbing_div);
                    this.utils.cleanClimbingDiscardPile();
                }
            }

            this.utils.initSummitBetaToken($(summit_beta_div_id), summit_beta_from_db.type_arg);

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSymbolToken: async function (notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            const player_resources = notif.args.player_resources;
            this.gamedatas.resource_tracker = player_resources;
            this.gamedatas.hand_symbol_tokens = player_resources['symbol_tokens'];
            const symbol_for_log = notif.args.symbol_for_log;
            const symbol_type = notif.args.symbol_type;
            const new_token_id = dojo.query('#assets_wrap .symbol_token').length + 1;
            const new_token_slot = this.utils.resizeHand('token');
            const player_id = notif.args.player_id;

            if (this.utils.shouldAnimate()) {
                const msg_translated = dojo.string.substitute(_("Taking ${symbol_for_log} Token"), {
                    symbol_for_log: symbol_for_log
                });
                this.utils.updateTitlebar(msg_translated);
                const symbol_token = dojo.place(`<div id="${symbol_type}_token_${new_token_id}" class="${symbol_type}_token symbol_token"></div>`, 'board', 2);
                await this.utils.animationPromise(symbol_token, 'token_appears', 'anim', null, false, false);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1200)) })();

                const args = [symbol_token, new_token_slot, null, false, true];
                symbol_token.classList.remove('token_appears');
                await this.utils.animationPromise(symbol_token, 'token_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
            
            } else { // shouldn't animate
                dojo.place(`<div id="${symbol_type}_token_${new_token_id}" class="${symbol_type}_token symbol_token"></div>`, new_token_slot);
            }

            this.utils.updatePlayerResources(player_id, player_resources);
            if ($('climbing_discard_straightened').firstElementChild && !['24'].includes(notif.args.climbing_card_type_arg)) {
                const climbing_div = $('climbing_discard_straightened').firstElementChild;
                if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                $('climbing_discard_90').append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
                this.utils.cleanClimbingDiscardPile();
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSymbolTokenOpponent: async function (notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            const symbol_for_log = notif.args.symbol_for_log;
            const symbol_type = notif.args.symbol_type;
            const player_id = notif.args.player_id;

            if (this.utils.shouldAnimate()) {
                const msg_translated = dojo.string.substitute(_("Taking ${symbol_for_log} Token"), {
                    symbol_for_log: symbol_for_log
                });
                this.utils.updateTitlebar(msg_translated);
                const symbol_token = dojo.place(`<div id="${symbol_type}_token" class="${symbol_type}_token symbol_token"></div>`, 'board', 2);
                await this.utils.animationPromise(symbol_token, 'token_appears', 'anim', null, false, false);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1500)) })();

                const args = [symbol_token, $(`hand_counter_${player_id}`), null, false, true];
                symbol_token.classList.remove('token_appears');
                await this.utils.animationPromise(symbol_token, 'token_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
            }

            if ($('climbing_discard_straightened').firstElementChild && !['24'].includes(notif.args.climbing_card_type_arg)) {
                const climbing_div = $('climbing_discard_straightened').firstElementChild;
                if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                $('climbing_discard_90').append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
                this.utils.cleanClimbingDiscardPile();
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_automaticPortaledgeOpponent: async function (notif) {

            this.asset_discard = notif.args.asset_discard;

            await this.utils.parseClimbingEffect('autoPortaledge', notif);
            if ($('climbing_discard_straightened').firstElementChild) {
                const climbing_div = $('climbing_discard_straightened').firstElementChild;
                if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                $('climbing_discard_90').append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
                this.utils.cleanClimbingDiscardPile();
            }
            this.notifqueue.setSynchronousDuration();
        },
        
        notif_automaticPortaledge: async function (notif) {

            this.asset_discard = notif.args.asset_discard;

            await this.utils.parseClimbingEffect('autoPortaledge', notif);
            if ($('climbing_discard_straightened').firstElementChild) {
                const climbing_div = $('climbing_discard_straightened').firstElementChild;
                if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                $('climbing_discard_90').append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
                this.utils.cleanClimbingDiscardPile();
            }
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmPortaledgeOpponent: async function (notif) {

            const player_id = notif.args.player_id;
            const asset_types = notif.args.asset_types;
            const climbing_card_info = notif.args.climbing_card_info;
            const hand_count = notif.args.hand_count;
            const water = notif.args.water;
            const psych = notif.args.psych;
            const last_card = notif.args.last_card;
            const refill_portaledge = notif.args.refill_portaledge;
            this.asset_discard = notif.args.asset_discard;
            const bomber_anchor = notif.args.bomber_anchor;

            await this.utils.portaledgeOpponent(player_id, asset_types, false, hand_count, climbing_card_info, false, water, psych, last_card, refill_portaledge, bomber_anchor);

            this.utils.updatePlayerResources(player_id, notif.args.player_water_psych);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');
            if (climbing_div && !notif.args.bomber_anchor) {

                if (this.utils.shouldAnimate() && !climbing_card_info.hasOwnProperty('portaledge_all')) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else if (this.utils.shouldAnimate() && climbing_card_info.hasOwnProperty('portaledge_all')
                        && climbing_card_info.finished_portaledge.length+1 == Object.keys(this.gamedatas.players).length) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';

                } else { // shouldn't animate
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';
                }
                this.utils.cleanClimbingDiscardPile();
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmPortaledge: async function (notif) {

            const player_id = notif.args.player_id;
            const asset_ids = notif.args.new_asset_ids;
            const asset_type_args = notif.args.new_asset_type_args;
            const climbing_card_info = notif.args.climbing_card_info;
            const hand_count = notif.args.hand_count;
            const water = notif.args.water;
            const psych = notif.args.psych;
            const last_card = notif.args.last_card;
            const refill_portaledge = notif.args.refill_portaledge;
            this.asset_discard = notif.args.asset_discard;
            const player_resources = notif.args.player_resources;

            await this.utils.portaledge(player_id, asset_type_args, asset_ids, false, hand_count, climbing_card_info, false, water, psych, last_card, refill_portaledge, player_resources);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');
            if (climbing_div && !notif.args.bomber_anchor) {

                if (this.utils.shouldAnimate() && !climbing_card_info.hasOwnProperty('portaledge_all')) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';

                } else if (this.utils.shouldAnimate() && climbing_card_info.hasOwnProperty('portaledge_all')
                        && climbing_card_info.finished_portaledge.length+1 == Object.keys(this.gamedatas.players).length) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';

                } else { // shouldn't animate
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';
                }
                this.utils.cleanClimbingDiscardPile();
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_updateWaterPsych: async function (notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            const player_id = notif.args.player_id;
            const water = notif.args.water_psych_for_climbing['water'];
            const psych = notif.args.water_psych_for_climbing['psych'];
            await this.utils.updateWaterPsych(player_id, water, psych);

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmAddTokenToPitch: async function (notif) {

            if (notif.args.player_id == this.player_id) {
                dojo.query('.available_pitch').forEach((ele) => {
                    ele.classList.remove('available_pitch');
                    ele.nextElementSibling.nextElementSibling.classList.remove('cursor');
                });
                dojo.query('.selected_pitch')[0].nextElementSibling.nextElementSibling.classList.remove('cursor');
                dojo.query('.selected_pitch')[0].classList.remove('selected_pitch');
            }

            const asset_type = notif.args.asset_type.toLowerCase();
            const pitch_type_arg = notif.args.pitch_type_arg;
            const selected_pitch = $(`${notif.args.selected_pitch_id}`);

            this.gamedatas.pitches[pitch_type_arg]['requirements'][asset_type]++;

            const wrapper = dojo.place(`<div id="${pitch_type_arg}_token_wrapper" class="pitch_token_wrapper"></div>`, selected_pitch.nextElementSibling);
            switch (selected_pitch.nextElementSibling.querySelectorAll('.pitch_token_wrapper').length) {
                case 2: 
                    wrapper.id += '_2';
                    wrapper.classList.add('pitch_token_wrapper_2');
                    break;
                case 3:
                    wrapper.id += '_3';
                    wrapper.classList.add('pitch_token_wrapper_3');
                    break;
            }

            if (notif.args.player_id != this.player_id) { await this.utils.retractClimbingCard(); }

            if (this.utils.shouldAnimate()) {
                this.utils.updateTitlebar(_('Placing Asset Token on Pitch'));
                const asset_token = dojo.place(`<div class="${asset_type}_token symbol_token"></div>`, 'board', 2);
                await this.utils.animationPromise(asset_token, 'token_appears', 'anim', null, false, false);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1500)) })();

                const args = [asset_token, wrapper, null, false, true];
                asset_token.classList.remove('token_appears');
                await this.utils.animationPromise(asset_token, 'token_to_pitch', 'anim', this.utils.moveToNewParent(), false, true, ...args);
            }

            else { // shouldn't animate
                dojo.place(`<div class="${asset_type}_token symbol_token"></div>`, wrapper);
            }
           
            // add token to tooltip
            const pitch_ele = selected_pitch.nextElementSibling;
            const pitch_type = pitch_ele.classList[1].slice(1);
            const pitch_string = selected_pitch.nextElementSibling.outerHTML;
            const pitch_click = selected_pitch.nextElementSibling.nextElementSibling;
            const tokens = Array.from(pitch_ele.children).filter(child => child.classList.contains('pitch_token_wrapper'));
            const hex_num = pitch_ele.id.slice(-2).replace(/^\D+/g, '');
            const rope_order = this.utils.getRopeOrder(hex_num);
            this.utils.pitchTooltip(pitch_click, pitch_type, tokens, rope_order);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
            destination.append(climbing_div);
            climbing_div.classList.remove('drawn_climbing');
            $('climbing_discard').style.zIndex = '';
            this.utils.cleanClimbingDiscardPile();

            this.notifqueue.setSynchronousDuration();
        },

        notif_rollDie: async function (notif) {

            this.utils.clicksOff();

            const face_rolled = notif.args.face_rolled;
            this.risky_climb = true;
            this.risk_it = true;
            const risk_summit_beta = notif.args.risk_summit_beta;

            if (this.utils.shouldAnimate()) {
                if (Object.keys(notif.args.climbing_card_info).length > 0) { await this.utils.retractClimbingCard(); }
                this.utils.updateTitlebar(_('Rolling Risk Die'));

                const risk_die = $('risk_die');
                const die_wrapper = $('die_wrapper');

                die_wrapper.style.display = 'block';
                this.utils.animationPromise(die_wrapper, 'roll_die_wrapper', 'anim', null, false, false);
                let die_face_class = null;
                switch (face_rolled) {
                    case 1:
                        die_face_class = 'risk_checkmark';
                        break;
                    case 2:
                        die_face_class = 'risk_cards';
                        break;
                    case 3:
                        die_face_class = 'risk_card_and_psych';
                        break;
                }
                await this.utils.animationPromise(risk_die, 'roll_die', 'anim', null, false, true);

                risk_die.style.display = 'none';
                const die_face = dojo.place(`<div id="die_face_${face_rolled}" class="risk_face ${die_face_class}"></div>`, 'die_wrapper');
                die_face.style.transform = 'none';

                if (!(risk_summit_beta && [2, 3].includes(face_rolled))) { 
                    await (async function() { return new Promise(resolve => setTimeout(resolve, 1500)) })();
                    await this.utils.animationPromise(die_wrapper, 'remove_die', 'anim', null, false, true);
                    die_face.remove();
                    die_wrapper.style.display = '';
                    die_wrapper.classList.remove('roll_die_wrapper');
                    risk_die.style.display = '';
                }
                this.utils.clicksOn();
                this.notifqueue.setSynchronousDuration();
            }
            else { // shouldn't animate

                if (risk_summit_beta && [2, 3].includes(face_rolled)) {
                    const die_wrapper = $('die_wrapper');
                    die_wrapper.style.display = 'block';
                    die_wrapper.style.marginRight = '-51.2vmin';
                    risk_die.style.display = 'none';
                    let die_face = null;
                    if (face_rolled === 2) { die_face = dojo.place(`<div id="die_face_2" class="risk_face risk_cards"></div>`, 'die_wrapper'); }
                    else if (face_rolled ===3) { die_face = dojo.place(`<div id="die_face_3" class="risk_face risk_card_and_psych"></div>`, 'die_wrapper'); }
                    die_face.style.transform = 'none';
                }

                this.utils.clicksOn();
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_sunnyPitch: async function (notif) {

            this.utils.updateTitlebar('');
            this.removeActionButtons();
            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            await (async () => {
                return new Promise(async (resolve) => {

                    const sunny_players = notif.args.sunny_players;
                    
                    if (sunny_players.length == 0) { resolve(); }

                    for (let i=0; i<=sunny_players.length-1; i++) {

                        const player_id = sunny_players[i];
                        if (notif.args.water_or_psych === 'water') { this.utils.updateWaterPsych(player_id, -1, 0); }
                        else if (notif.args.water_or_psych === 'psych') { this.utils.updateWaterPsych(player_id, 0, 1); }
                        const player_resources = notif.args.sunny_players_resources[player_id];
                        // this.utils.updatePlayerResources(player_id, player_resources);
                        if (i === sunny_players.length-1) {
                            await (async function() { return new Promise(resolve => setTimeout(resolve, 800)) })();
                            resolve();
                        }
                    }
                });
            })();

            dojo.query('#climbing_discard .cursor').forEach((ele) => { ele.classList.remove('cursor'); });
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
            destination.append(climbing_div);
            climbing_div.classList.remove('drawn_climbing');
            $('climbing_discard').style.zIndex = '';
            this.utils.cleanClimbingDiscardPile();

            this.notifqueue.setSynchronousDuration();
        },

        notif_shareEffectPrivate: async function (notif) {

            const player_id = notif.args.player_id;
            const opponent_id = notif.args.opponent_id;
            this.asset_discard = notif.args.asset_discard;

            if (notif.args.climbing_card_type_arg == '49') {

                const last_card = notif.args.last_card;
                const refill_portaledge = notif.args.refill_portaledge;
                const player_resources = notif.args.player_resources;

                if (!notif.args.jesus_party) { this.utils.updateWaterPsych(player_id, 0, -1); }
                await this.utils.updateWaterPsych(opponent_id, 0, -1);

                const type_arg = notif.args.portaledge_type_arg;
                const id = notif.args.portaledge_id;
                const hand_count_player = notif.args.hand_count_player;
                const hand_count_opponent = notif.args.hand_count_opponent;

                if (player_id == this.player_id) {
                    this.utils.portaledgeOpponent(opponent_id, {['gear']: 1}, true, hand_count_opponent, null, true, 0, 0, last_card, refill_portaledge);
                    await this.utils.portaledge(player_id, [type_arg], [id], true, hand_count_player, null, true, 0, 0, last_card, refill_portaledge, player_resources);
                } else if (opponent_id == this.player_id) {
                    this.utils.portaledgeOpponent(player_id, {['gear']: 1}, true, hand_count_player, null, true, 0, 0, last_card, refill_portaledge);
                    await this.utils.portaledge(opponent_id, [type_arg], [id], true, hand_count_opponent, null, true, 0, 0, last_card, refill_portaledge, player_resources);
                }

                if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';

                } else { // shouldn't animate
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';
                }
                this.utils.cleanClimbingDiscardPile();

                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_shareEffectPublic: async function (notif) {

            const player_id = notif.args.player_id;
            const opponent_id = notif.args.opponent_id;
            this.asset_discard = notif.args.asset_discard;

            if (notif.args.climbing_card_type_arg == '49') {

                const last_card = notif.args.last_card;
                const refill_portaledge = notif.args.refill_portaledge;

                if (!notif.args.jesus_party) { this.utils.updateWaterPsych(player_id, 0, -1); }
                await this.utils.updateWaterPsych(opponent_id, 0, -1);

                const hand_count_player = notif.args.hand_count_player;
                const hand_count_opponent = notif.args.hand_count_opponent;
                this.utils.portaledgeOpponent(player_id, {['gear']: 1}, true, hand_count_player, null, false, 0, 0, last_card, refill_portaledge);
                await this.utils.portaledgeOpponent(opponent_id, {['gear']: 1}, true, hand_count_opponent, notif.args.climbing_card_info, false, 0, 0, last_card, refill_portaledge);

                if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';

                } else { // shouldn't animate
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';
                }
                this.utils.cleanClimbingDiscardPile();

                this.notifqueue.setSynchronousDuration();
            }            
        },

        notif_confirmAssetToAssetBoard: async function (notif) {

            this.utils.clicksOff();
            this.utils.disableSummitBetaTokens();

            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const card_id = notif.args.card_id;
            const card_type_arg = notif.args.card_type_arg;
            const card_type = notif.args.card_type;
            const board_assets = notif.args.board_assets;
            this.gamedatas.board_assets = board_assets;
            const asset_ele = $(`asset_card_${card_id}`);

            asset_ele.classList.remove('selected_resource');
            asset_ele.parentElement.classList.remove('selected_resource_wrap');
            dojo.query('.selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });
            dojo.query('.selectable_wrap').forEach(ele => { ele.classList.remove('selectable_wrap'); });
            asset_ele.classList.add('played_asset');

            await (async () => {
                return new Promise(async (resolve) => {
                    if (this.utils.shouldAnimate()) {
                        
                        let asset_board_anims = [];
                        let changed_z_indices = [];

                        this.utils.updateTitlebar(_('Placing Asset on Asset Board'));
                        
                        for (const [type, info] of Object.entries(board_assets[player_id])) {

                            // newly tucked cards
                            for (const id of Object.keys(info['tucked'])) {
                                if ($(`asset_card_${id}`)) {
                                    const card_ele = $(`asset_card_${id}`);
                                    const tucked_counter = $(`${character.name}_${type}_counter`);
                                    tucked_counter.style.display = 'block';
                                    const destination = $(`${character.name}_${type}_counter`).querySelector('.asset_counter_img');
                                    const args = [card_ele, destination];
                                    const old_slot = card_ele.parentElement;
                                    const old_z = old_slot.style.zIndex;
                                    old_slot.style.zIndex = '6';
                                    await this.utils.animationPromise(card_ele, 'asset_board_to_tucked', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                    old_slot.style.zIndex = old_z;
                                    const old_num = Number(destination.nextElementSibling.innerHTML);
                                    destination.nextElementSibling.innerHTML = `${old_num + 1}`;
                                }
                            }
                            // newly played cards and repositioned cards
                            for (const [slot, asset] of Object.entries(info)) {

                                if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                    const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                    const ele = $(`asset_card_${id}`);
                                    const asset_board = document.getElementById(`asset_board_${player_id}`);
                                    const destination = asset_board.querySelector(`#${character.name}_${type}_${slot}`);

                                    if (destination.children.length === 0 || !destination.contains(ele)) {
                                        ele.style.setProperty('--z', `${Number(slot)+1+10}`);
                                        ele.parentElement.style.zIndex = `${Number(slot)+1+10}`;
                                        changed_z_indices.push(ele.parentElement);
                                        ele.classList.remove('selected_resource');
                                        ele.parentElement.classList.remove('selected_resource_wrap');
                                        ele.classList.add('played_asset');

                                        let anim = '';
                                        switch (true) {
                                            case ele.parentElement.classList.contains('hand_asset_wrap'): anim = 'asset_hand_to_board'; break;
                                            case ele.parentElement.classList.contains('asset_board_slot'): anim = 'asset_board_to_board'; break;
                                            case ele.parentElement.classList.contains('spread_wrap'): anim = 'asset_display_to_board'; break;
                                        }
                                        const args = [ele, destination];
                                        asset_board_anims.push(this.utils.animationPromise.bind(null, ele, anim, 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                    }
                                }
                            }
                        }

                        Promise.all(asset_board_anims.map(func => { return func(); }))
                        .then(() => {
                            this.utils.sanitizeAssetBoards();
                            for (const ele of changed_z_indices) { ele.style.zIndex = ''; }
                            this.risk_it = false;
                            if (this.risky_climb) { this.risky_climb = false; }
                            $('spread_draw').style.display = '';
                            resolve();
                        });
                    } else { // shouldn't animate
                        for (const [type, info] of Object.entries(board_assets[player_id])) {

                            // newly tucked cards
                            for (const id of Object.keys(info['tucked'])) {
                                if ($(`asset_card_${id}`)) { $(`asset_card_${id}`).remove(); }
                            }
                            if (Object.keys(info['tucked']).length > 0) {
                                const tucked_counter = $(`${character.name}_${type}_counter`);
                                tucked_counter.style.display = 'block';
                            }

                            // newly played cards and repositioned cards
                            for (const [slot, asset] of Object.entries(info)) {

                                if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                    const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                    const asset_ele = $(`asset_card_${id}`);
                                    const slot_ele = $(`${character.name}_${type}_${slot}`);
                                    if (slot_ele.firstElementChild != asset_ele) {
                                        slot_ele.append(asset_ele);
                                    }
                                }
                            }
                        }
                        $('assets_wrap').querySelectorAll('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
                        this.utils.sanitizeAssetBoards();
                        $('spread_draw').style.display = '';
                        if (this.risky_climb) { this.risky_climb = false; }
                        this.risk_it = false;
                        resolve();
                    }
                });
            })();

            this.utils.resizeHand();
            this.utils.updateBoardAssets(player_id);
            this.utils.updatePlayerResources(player_id, notif.args.player_resources);
            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';

            } else { // shouldn't animate
                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                const destination = $('climbing_discard_90');
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmAssetToAssetBoardOpponent: async function (notif) {

            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const card_id = notif.args.card_id;
            const card_type_arg = notif.args.card_type_arg;
            const card_type = notif.args.card_type;
            const asset = this.gamedatas.asset_cards[card_type_arg];
            const board_assets = notif.args.board_assets;
            this.gamedatas.board_assets = board_assets;

            const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                CARD_ID : card_id,
                EXTRA_CLASSES : 'played_asset',
                acX : asset.x_y[0],
                acY : asset.x_y[1],
            }), $(`hand_counter_${player_id}`));

            await (async () => {
                return new Promise (async (resolve) => {
                    if (this.utils.shouldAnimate()) {

                        this.utils.updateTitlebar(_('Placing Asset on Asset Board'));

                        $('asset_deck_draw').style.display = 'flex';
                        const deck_draw_slot = $('deck_draw_1');
                        $('asset_deck_draw').style.zIndex = '20';
                        deck_draw_slot.append(asset_ele);
                        const new_width = asset_ele.getBoundingClientRect().width;
                        const new_height = asset_ele.getBoundingClientRect().height;
                        $(`hand_counter_${player_id}`).append(asset_ele);
                        asset_ele.style.setProperty('--dw', new_width);
                        asset_ele.style.setProperty('--dh', new_height);
                        const args = [asset_ele, deck_draw_slot, null, false, true];
                        await this.utils.animationPromise(asset_ele, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                        let asset_board_anims = [];
                        let changed_z_indices = [];

                        for (const [type, info] of Object.entries(board_assets[player_id])) {
                                        
                            // newly tucked cards
                            for (const id of Object.keys(info['tucked'])) {
                                if ($(`asset_card_${id}`)) {
                                    const card_ele = $(`asset_card_${id}`);
                                    const tucked_counter = $(`${character.name}_${type}_counter`);
                                    tucked_counter.style.display = 'block';
                                    const destination = $(`${character.name}_${type}_counter`).querySelector('.asset_counter_img');
                                    const args = [card_ele, destination];
                                    const old_slot = card_ele.parentElement;
                                    const old_z = old_slot.style.zIndex;
                                    old_slot.style.zIndex = '6';
                                    await this.utils.animationPromise(card_ele, 'asset_board_to_tucked', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                    old_slot.style.zIndex = old_z;
                                    const old_num = Number(destination.nextElementSibling.innerHTML);
                                    destination.nextElementSibling.innerHTML = `${old_num + 1}`;
                                }
                            }
                            // newly played cards and repositioned cards
                            for (const [slot, asset] of Object.entries(info)) {

                                if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                    const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                    const ele = $(`asset_card_${id}`);
                                    const asset_board = document.getElementById(`asset_board_${player_id}`);
                                    const destination = asset_board.querySelector(`#${character.name}_${type}_${slot}`);
                                    
                                    if (destination.children.length === 0 || !destination.contains(ele)) {
                                        ele.style.setProperty('--z', `${Number(slot)+1+10}`);
                                        ele.parentElement.style.zIndex = `${Number(slot)+1+10}`;    
                                        changed_z_indices.push(ele.parentElement);
                                        let anim = '';
                                        switch (true) {
                                            case ele.parentElement.classList.contains('hand_asset_wrap'): anim = 'asset_hand_to_board'; break;
                                            case ele.parentElement.classList.contains('asset_board_slot'): anim = 'asset_board_to_board'; break;
                                            case    ele.parentElement.classList.contains('spread_wrap')
                                                || ele.parentElement.classList.contains('draw_wrap') : anim = 'asset_display_to_board'; break;
                                        }

                                        const args = [ele, destination];
                                        asset_board_anims.push(this.utils.animationPromise.bind(null, ele, anim, 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                    }
                                }
                            }
                        }

                        Promise.all(asset_board_anims.map(func => { return func(); }))
                        .then(() => {
                            $('asset_deck_draw').style.zIndex = '';
                            $('asset_deck_draw').style.display = '';
                            this.utils.sanitizeAssetBoards();
                            for (const ele of changed_z_indices) { ele.style.zIndex = ''; }
                            this.risk_it = false;
                            if (this.risky_climb) { this.risky_climb = false; }
                            $('spread_draw').style.display = '';
                            resolve();
                        });
                    } else { // shouldn't animate
                        for (const [type, info] of Object.entries(board_assets[player_id])) {

                            // newly tucked cards
                            for (const id of Object.keys(info['tucked'])) {
                                if ($(`asset_card_${id}`)) { $(`asset_card_${id}`).remove(); }
                            }
                            if (Object.keys(info['tucked']).length > 0) {
                                const tucked_counter = $(`${character.name}_${type}_counter`);
                                tucked_counter.style.display = 'block';
                            }

                            // newly played cards and repositioned cards
                            for (const [slot, asset] of Object.entries(info)) {

                                if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                    const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                    const asset_ele = $(`asset_card_${id}`);
                                    const slot_ele = $(`${character.name}_${type}_${slot}`);
                                    if (asset_ele && slot_ele.firstElementChild != asset_ele) { // card exists, but is not in correct slot
                                        slot_ele.append(asset_ele);
                                    }
                                    else if (!asset_ele && !slot_ele.firstElementChild) { // card doesn't exist yet
                                        const type_arg = this.gamedatas.asset_identifier[id];
                                        const asset = this.gamedatas.asset_cards[type_arg];
                                        dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : id,
                                            EXTRA_CLASSES : 'played_asset',
                                            acX : asset['x_y'][0],
                                            acY : asset['x_y'][1],
                                        }), slot_ele);
                                    }
                                }
                            }
                        }
                        this.utils.sanitizeAssetBoards();
                        $('spread_draw').style.display = '';
                        this.risk_it = false;
                        if (this.risky_climb) { this.risky_climb = false; }
                        resolve();
                    }
                });
            })();

            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';

            } else { // shouldn't animate
                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                const destination = $('climbing_discard_90');
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmStealFromAssetBoardOpponent: async function(notif) {

            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const opponent_id = notif.args.opponent_id;
            const opponent = this.gamedatas.players[opponent_id];
            const opponent_character_id = opponent.character;
            const opponent_character = this.gamedatas.characters[opponent_character_id];
            const opponent_name = notif.args.player_name1;
            const opponent_color = notif.args.opponent_color;
            const asset_id = notif.args.selected_resource ? notif.args.selected_resource : notif.args.random_tucked_id;
            const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
            const asset = this.gamedatas.asset_cards[asset_type_arg];
            const type = this.utils.getAssetType(asset_type_arg);
            const to_board = notif.args.to_board;
            const old_board_slot_num = notif.args.selected_resource ? Number($(`asset_card_${asset_id}`).parentElement.id.slice(-1)) : null;
            let asset_ele;
            let destination;
            const played_asset = to_board ? 'played_asset' : '';
            const board_assets = notif.args.board_assets;
            this.gamedatas.board_assets = board_assets;

            await (async () => {
                return new Promise(async (resolve) => {
                    if (this.utils.shouldAnimate()) {

                        this.utils.updateTitlebar_(('Stealing Asset from'));
                        const opponent_name_span = document.createElement('span');
                        opponent_name_span.id = `${opponent_name}_span`;
                        opponent_name_span.classList.add('name_span');
                        opponent_name_span.innerHTML = opponent_name;
                        opponent_name_span.style.color = opponent_color;
                        $('gameaction_status').parentElement.append(opponent_name_span);

                        $('asset_deck_draw').style.display = 'flex';
                        const deck_draw_slot = $('deck_draw_1');
                        $('asset_deck_draw').style.zIndex = '15';

                        if (notif.args.random_tucked_id) {
                            const asset_counter_img = $(`${opponent_character.name}_${type}_counter`).firstElementChild;
                            asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : '',
                                acX : asset['x_y'][0],
                                acY : asset['x_y'][1],
                            }), asset_counter_img);
                        } else {
                            asset_ele = $(`asset_card_${asset_id}`);
                        }

                        if (asset_ele.classList.contains('flipped')) {

                            const old_board_slot = asset_ele.parentElement;
                            asset_ele.remove();
                            const flip_ele = dojo.place(this.format_block('jstpl_flip_card', {
                                card_id : asset_id,
                                extra_classes : '',
                                back_type : 'asset asset_back_for_flip',
                                front_type : 'asset',
                                cX : asset.x_y[0],
                                cY : asset.x_y[1],
                            }), old_board_slot);
                            await this.utils.animationPromise(flip_ele.firstElementChild, 'flip_transform', 'anim', null, true, false);
                            flip_ele.remove();
                            asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : played_asset,
                                acX : asset.x_y[0],
                                acY : asset.x_y[1],
                            }), old_board_slot);
                        }

                        let args = [asset_ele, deck_draw_slot];
                        asset_ele.style.setProperty('--z', '15');
                        if (notif.args.selected_resource) {
                            await this.utils.animationPromise(asset_ele, 'asset_board_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                        } else if (notif.args.random_tucked_id) {
                            await this.utils.animationPromise(asset_ele, 'asset_tucked_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                            const rand_type_arg = this.gamedatas.asset_identifier[notif.args.random_tucked_id];
                            const type = this.utils.getAssetType(rand_type_arg);
                            const draw_num_ele = dojo.query(`#asset_board_${opponent_id} .board_${type}_counter .asset_counter_num`)[0];
                            const draw_num = Number(draw_num_ele.innerHTML);
                            draw_num_ele.innerHTML = `${draw_num - 1}`;
                        }
                        await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
                        let asset_board_anims = [];
                        let changed_z_indices = [];
                        if (!to_board) {
                            const asset_origin = asset_ele.parentElement;
                            const hand_counter = $(`hand_counter_${player_id}`);
                            hand_counter.append(asset_ele);
                            let new_width = asset_ele.getBoundingClientRect().width;
                            let new_height = asset_ele.getBoundingClientRect().height;
                            asset_origin.append(asset_ele);
                            asset_ele.style.setProperty('--dw', new_width);
                            asset_ele.style.setProperty('--dh', new_height);

                            args = [asset_ele, hand_counter, null, false, true];
                            asset_board_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_display_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args));
                        }
                        for (const player of [player_id, opponent_id]) {
                            const player_character = player === player_id ? character : opponent_character;
                            for (const [type, info] of Object.entries(board_assets[player])) {

                                // newly tucked cards
                                for (const id of Object.keys(info['tucked'])) {
                                    if ($(`asset_card_${id}`)) {
                                        const card_ele = $(`asset_card_${id}`);
                                        const tucked_counter = $(`${player_character.name}_${type}_counter`);
                                        tucked_counter.style.display = 'block';
                                        const destination = $(`${player_character.name}_${type}_counter`).querySelector('.asset_counter_img');
                                        const args = [card_ele, destination];
                                        const old_slot = card_ele.parentElement;
                                        const old_z = old_slot.style.zIndex;
                                        old_slot.style.zIndex = '6';
                                        await this.utils.animationPromise(card_ele, 'asset_board_to_tucked', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                        old_slot.style.zIndex = old_z;
                                        const old_num = Number(destination.nextElementSibling.innerHTML);
                                        destination.nextElementSibling.innerHTML = `${old_num + 1}`;
                                    }
                                }
                                // newly played cards and repositioned cards
                                for (const [slot, asset] of Object.entries(info)) {
                                    if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                        const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                        const ele = $(`asset_card_${id}`);
                                        const asset_board = document.getElementById(`asset_board_${player}`);
                                        const destination = asset_board.querySelector(`#${player_character.name}_${type}_${slot}`);
                                        if (destination.children.length === 0 || !destination.contains(ele)) {
                                            ele.style.setProperty('--z', `${Number(slot)+1+10}`);
                                            ele.parentElement.style.zIndex = `${Number(slot)+1+10}`;
                                            changed_z_indices.push(ele.parentElement);
                                            ele.classList.remove('selected_resource');
                                            ele.parentElement.classList.remove('selected_resource_wrap');
                                            ele.classList.add('played_asset');

                                            let anim = '';
                                            switch (true) {
                                                case ele.parentElement.classList.contains('hand_asset_wrap'): anim = 'asset_hand_to_board'; break;
                                                case ele.parentElement.classList.contains('asset_board_slot'): anim = 'asset_board_to_board'; break;
                                                case ele.parentElement.classList.contains('spread_wrap'): anim = 'asset_display_to_board'; break;
                                            }
                                            const args = [ele, destination];
                                            asset_board_anims.push(this.utils.animationPromise.bind(null, ele, anim, 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                        }
                                    }
                                }
                            }
                        }
                        Promise.all(asset_board_anims.map(func => { return func(); }))
                        .then(() => {
                            this.utils.sanitizeAssetBoards();
                            $('asset_deck_draw').style.zIndex = '';
                            $('asset_deck_draw').style.display = '';
                            for (const ele of changed_z_indices) { ele.style.zIndex = ''; }
                            resolve();
                        });
                    } else { // shouldn't animate
                        
                        if (notif.args.random_tucked_id) {
                            const rand_type_arg = this.gamedatas.asset_identifier[notif.args.random_tucked_id];
                            const type = this.utils.getAssetType(rand_type_arg);
                            const draw_num_ele = dojo.query(`#asset_board_${opponent_id} .board_${type}_counter .asset_counter_num`)[0];
                            const draw_num = Number(draw_num_ele.innerHTML);
                            draw_num_ele.innerHTML = `${draw_num - 1}`;
                        } else {
                            asset_ele = $(`asset_card_${asset_id}`);
                            if (asset_ele.classList.contains('flipped')) {

                                const old_board_slot = asset_ele.parentElement;
                                asset_ele.remove();
                                asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : asset_id,
                                    EXTRA_CLASSES : played_asset,
                                    acX : asset.x_y[0],
                                    acY : asset.x_y[1],
                                }), old_board_slot);
                            }
                            if (!to_board) { asset_ele.remove(); }
                        }
                        for (const player of [player_id, opponent_id]) {
                            const player_character = player === player_id ? character : opponent_character;
                            for (const [type, info] of Object.entries(board_assets[player])) {

                                // newly tucked cards
                                for (const id of Object.keys(info['tucked'])) {
                                    if ($(`asset_card_${id}`)) { $(`asset_card_${id}`).remove(); }
                                }
                                if (Object.keys(info['tucked']).length > 0) {
                                    const tucked_counter = $(`${player_character.name}_${type}_counter`);
                                    tucked_counter.style.display = 'block';
                                }

                                // newly played cards and repositioned cards
                                for (const [slot, asset] of Object.entries(info)) {

                                    if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                        const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                        const asset_ele = $(`asset_card_${id}`);
                                        const slot_ele = $(`${player_character.name}_${type}_${slot}`);
                                        if (slot_ele.firstElementChild != asset_ele) {
                                            slot_ele.append(asset_ele);
                                            asset_ele.classList.add('played_asset');
                                        }
                                    }
                                }
                            }
                        }
                        this.utils.sanitizeAssetBoards();
                        resolve();
                    }
                });
            })();

            await this.utils.matchBoardAssets();
            this.utils.repositionAssetBoard(opponent_id);
            this.utils.repositionAssetBoard(player_id);
            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    if (climbing_div) {
                        await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                        climbing_div.classList.remove('drawn_climbing');
                        $('climbing_discard').style.zIndex = '';
                    }
                    destination.append(climbing_div);
                    $(`${opponent_name}_span`).remove();

            } else { // shouldn't animate
                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                const destination = $('climbing_discard_90');
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmStealFromAssetBoard: async function(notif) {

            this.utils.clicksOff();
            this.utils.disableSummitBetaTokens();

            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const opponent_id = notif.args.opponent_id;
            const opponent = this.gamedatas.players[opponent_id];
            const opponent_character_id = opponent.character;
            const opponent_character = this.gamedatas.characters[opponent_character_id];
            const opponent_name = notif.args.player_name1;
            const opponent_color = notif.args.opponent_color;
            const asset_id = notif.args.selected_resource ? notif.args.selected_resource: notif.args.random_tucked_id;
            const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
            const asset = this.gamedatas.asset_cards[asset_type_arg];
            const type = this.utils.getAssetType(asset_type_arg);
            const player_resources = notif.args.player_resources;
            const to_board = notif.args.to_board;
            const new_card_slot_num = !to_board ? this.utils.resizeHand('asset', [asset_id]) : null;
            const new_card_slot = !to_board ? $(`hand_asset_${new_card_slot_num[asset_id]}`) : null;
            const old_board_slot_num = dojo.query('.selected_resource').length > 0 ? Number(dojo.query('.selected_resource')[0].parentElement.id.slice(-1)) : null;
            const played_asset = to_board ? 'played_asset' : '';
            let asset_ele;
            let destination;
            const board_assets = notif.args.board_assets;
            this.gamedatas.board_assets = board_assets;

            // remove event listener on stolen asset
            if (notif.args.selected_resource) {
                const original_asset_ele = $(`asset_card_${asset_id}`);
                asset_ele = original_asset_ele.cloneNode(true);
                original_asset_ele.parentNode.replaceChild(asset_ele, original_asset_ele);
                this.utils.clicks.push(asset_ele);
            }

            dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('played_asset', 'selected_resource'); });
            dojo.query('.selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });
            dojo.query('.selectable_wrap').forEach(ele => { ele.classList.remove('selectable_wrap'); });

            if (!to_board) { this.gamedatas.hand_assets[asset_id] = asset_type_arg; } // stolen card goes to hand

            await (async () => {
                return new Promise(async (resolve) => {
                    if (this.utils.shouldAnimate()) {

                        this.utils.updateTitlebar(_('Stealing Asset from'));
                        const opponent_name_span = document.createElement('span');
                        opponent_name_span.id = `${opponent_name}_span`;
                        opponent_name_span.classList.add('name_span');
                        opponent_name_span.innerHTML = opponent_name;
                        opponent_name_span.style.color = opponent_color;
                        $('gameaction_status').parentElement.append(opponent_name_span);

                        if (notif.args.random_tucked_id) {
                            const asset_counter_img = $(`${opponent_character.name}_${type}_counter`).firstElementChild;
                            asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : played_asset,
                                acX : asset['x_y'][0],
                                acY : asset['x_y'][1],
                            }), asset_counter_img);
                        }

                        if (asset_ele.classList.contains('flipped')) {

                            const old_board_slot = asset_ele.parentElement;
                            asset_ele.remove();
                            const flip_ele = dojo.place(this.format_block('jstpl_flip_card', {
                                card_id : asset_id,
                                extra_classes : '',
                                back_type : 'asset asset_back_for_flip',
                                front_type : 'asset',
                                cX : asset.x_y[0],
                                cY : asset.x_y[1],
                            }), old_board_slot);
                            await this.utils.animationPromise(flip_ele.firstElementChild, 'flip_transform', 'anim', null, true, false);
                            flip_ele.remove();
                            asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : played_asset,
                                acX : asset.x_y[0],
                                acY : asset.x_y[1],
                            }), old_board_slot);
                        }

                        if (!to_board) {

                            const args = [asset_ele, new_card_slot];
                            if (notif.args.selected_resource) {
                                await this.utils.animationPromise(asset_ele, 'asset_board_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                            } else if (notif.args.random_tucked_id) {
                                await this.utils.animationPromise(asset_ele, 'asset_tucked_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                const rand_type_arg = this.gamedatas.asset_identifier[notif.args.random_tucked_id];
                                const type = this.utils.getAssetType(rand_type_arg);
                                const draw_num_ele = dojo.query(`#asset_board_${opponent_id} .board_${type}_counter .asset_counter_num`)[0];
                                const draw_num = Number(draw_num_ele.innerHTML);
                                draw_num_ele.innerHTML = `${draw_num - 1}`;
                            }
                        }

                        // board to board anims
                        let asset_board_anims = [];
                        let changed_z_indices = [];

                        for (const player of [player_id, opponent_id]) {
                            const player_character = player === player_id ? character : opponent_character;
                            for (const [type, info] of Object.entries(board_assets[player])) {

                                // newly tucked cards
                                for (const id of Object.keys(info['tucked'])) {
                                    if ($(`asset_card_${id}`)) {
                                        const card_ele = $(`asset_card_${id}`);
                                        const tucked_counter = $(`${player_character.name}_${type}_counter`);
                                        tucked_counter.style.display = 'block';
                                        const destination = $(`${player_character.name}_${type}_counter`).querySelector('.asset_counter_img');
                                        const args = [card_ele, destination];
                                        const old_slot = card_ele.parentElement;
                                        const old_z = old_slot.style.zIndex;
                                        old_slot.style.zIndex = '6';
                                        await this.utils.animationPromise(card_ele, 'asset_board_to_tucked', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                        old_slot.style.zIndex = old_z;
                                        const old_num = Number(destination.nextElementSibling.innerHTML);
                                        destination.nextElementSibling.innerHTML = `${old_num + 1}`;
                                    }
                                }
                                // newly played cards and repositioned cards
                                for (const [slot, asset] of Object.entries(info)) {
                                    if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                        const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                        const ele = $(`asset_card_${id}`);
                                        const asset_board = document.getElementById(`asset_board_${player}`);
                                        const destination = asset_board.querySelector(`#${player_character.name}_${type}_${slot}`);
                                        if (destination.children.length === 0 || !destination.contains(ele)) {
                                            ele.style.setProperty('--z', `${Number(slot)+1+10}`);
                                            ele.parentElement.style.zIndex = `${Number(slot)+1+10}`;
                                            changed_z_indices.push(ele.parentElement);
                                            ele.classList.remove('selected_resource');
                                            ele.parentElement.classList.remove('selected_resource_wrap');
                                            ele.classList.add('played_asset');

                                            let anim = '';
                                            switch (true) {
                                                case ele.parentElement.classList.contains('hand_asset_wrap'): anim = 'asset_hand_to_board'; break;
                                                case ele.parentElement.classList.contains('asset_board_slot'): anim = 'asset_board_to_board'; break;
                                                case ele.parentElement.classList.contains('spread_wrap'): anim = 'asset_display_to_board'; break;
                                            }
                                            const args = [ele, destination];
                                            asset_board_anims.push(this.utils.animationPromise.bind(null, ele, anim, 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                        }
                                    }
                                }
                            }
                        }

                        Promise.all(asset_board_anims.map(func => { return func(); }))
                        .then(() => {
                            this.utils.sanitizeAssetBoards();
                            for (const ele of changed_z_indices) { ele.style.zIndex = ''; }
                            resolve();
                        });
                    } else { // shouldn't animate
                    
                        if (notif.args.random_tucked_id && !to_board) {
                            asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : '',
                                acX : asset['x_y'][0],
                                acY : asset['x_y'][1],
                            }), new_card_slot);
                        }

                        if (asset_ele.classList.contains('flipped')) {

                            const old_board_slot = asset_ele.parentElement;
                            asset_ele.remove();
                            asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : played_asset,
                                acX : asset.x_y[0],
                                acY : asset.x_y[1],
                            }), old_board_slot);
                        }

                        if (!to_board && !notif.args.random_tucked_id) { new_card_slot.append(asset_ele); }

                        for (const player of [player_id, opponent_id]) {
                            const player_character = player === player_id ? character : opponent_character;
                            for (const [type, info] of Object.entries(board_assets[player])) {

                                // newly tucked cards
                                for (const id of Object.keys(info['tucked'])) {
                                    if ($(`asset_card_${id}`)) { $(`asset_card_${id}`).remove(); }
                                }
                                if (Object.keys(info['tucked']).length > 0) {
                                    const tucked_counter = $(`${player_character.name}_${type}_counter`);
                                    tucked_counter.style.display = 'block';
                                }

                                // newly played cards and repositioned cards
                                for (const [slot, asset] of Object.entries(info)) {

                                    if (['1', '2', '3', '4', '5'].includes(slot) && Object.keys(asset).length > 0) { // checks for filled slots
                                        const id = Object.keys(asset)[0];                                            // (excludes "count", "tucked", etc)
                                        const asset_ele = $(`asset_card_${id}`);
                                        const slot_ele = $(`${player_character.name}_${type}_${slot}`);
                                        if (slot_ele.firstElementChild != asset_ele) {
                                            slot_ele.append(asset_ele);
                                            asset_ele.classList.add('played_asset');
                                        }
                                    }
                                }
                            }
                        }
                        this.utils.sanitizeAssetBoards();
                        resolve();
                    }
                });
            })();

            dojo.query('.tucked_draw_box').forEach(ele => { ele.remove(); });

            await this.utils.matchBoardAssets();
            this.utils.repositionAssetBoard(opponent_id);
            this.utils.repositionAssetBoard(player_id);
            this.utils.updatePlayerResources(player_id, notif.args.player_resources);
            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    if (climbing_div) {
                        await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                        climbing_div.classList.remove('drawn_climbing');
                        $('climbing_discard').style.zIndex = '';
                    }
                    destination.append(climbing_div);
                    $(`${opponent_name}_span`).remove();

            } else { // shouldn't animate
                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                const destination = $('climbing_discard_90');
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_climbingCards15And24Public: async function(notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            this.asset_discard = notif.args.asset_discard;
            
            if (this.utils.shouldAnimate()) {
                this.utils.updateTitlebar(_('Dealing Gear cards from Portaledge'));
                const portaledge = $('portaledge');
                portaledge.style.display = 'block';
                await this.utils.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
                portaledge.style.marginTop = 0;
                await (async function() { return new Promise(resolve => setTimeout(resolve, 300)) })();

                await (async () => {
                    for (const ele of dojo.query('.hand_counter')) {
                        if (ele.id.slice(-7) != this.player_id) {

                            const asset_back = dojo.place(this.format_block('jstpl_asset_card', {
                                               CARD_ID : `${ele.id.slice(-7)}_back`,
                                               EXTRA_CLASSES : '',
                                               acX : 0,
                                               acY : 0,
                            }), 'portagear');

                            const args = [asset_back, ele];
                            this.utils.animationPromise(asset_back, 'asset_portaledge_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                            await (async function() { return new Promise(resolve => setTimeout(resolve, 200)) })();
                        }
                    }
                })();

                await (async function() { return new Promise(resolve => setTimeout(resolve, 800)) })();
                for (const id of Object.keys(this.gamedatas.players)) {
                    if (id != this.player_id) {
                        const hand_count = Number(dojo.query(`#hand_num_${id}`)[0].innerHTML) + 1;
                        this.utils.handCount(id, hand_count);
                    }
                }

                await (async function() { return new Promise(resolve => setTimeout(resolve, 100)) })(); // I don't know why but without this line, the line below doesn't work
                await this.utils.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
                portaledge.style.marginTop = '-36.4061%';
                portaledge.style.display = '';
            
            } else { // shouldn't animate
                for (const id of Object.keys(this.gamedatas.players)) {
                    if (id != this.player_id) {
                        const hand_count = Number(dojo.query(`#hand_num_${id}`)[0].innerHTML) + 1;
                        this.utils.handCount(id, hand_count);
                    }
                }
            }

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';

            } else { // shouldn't animate
                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                const destination = $('climbing_discard_90');
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.notifqueue.setSynchronousDuration();
        },

        notif_climbingCards15And24Private: async function(notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            const new_asset_id = notif.args.new_asset_id;
            const new_asset_type_arg = notif.args.new_asset_type_arg;
            this.gamedatas.hand_assets[new_asset_id] = new_asset_type_arg;
            this.asset_discard = notif.args.asset_discard;

            const asset = this.gamedatas.asset_cards[new_asset_type_arg];
            const type = this.utils.getAssetType(new_asset_type_arg);
            const new_asset_slots = this.utils.resizeHand('asset', [new_asset_id]);
            const slot_num = new_asset_slots[new_asset_id];
            const hand_slot = $(`hand_asset_${slot_num}`);
            const card = this.format_block('jstpl_asset_card', {
                                          CARD_ID : new_asset_id,
                                          EXTRA_CLASSES : '',
                                          acX : asset.x_y[0],
                                          acY : asset.x_y[1],
                                });
            const display_slot = $('deck_draw_1');

            const player_resources = this.utils.getCurrentPlayerResources();
            player_resources.skills.gear++;
            let card_technique_types = [];
            for (const [type, num] of Object.entries(asset.techniques)) {
                if (num > 0) { card_technique_types.push(type); }
            }
            for (let type of card_technique_types) { player_resources.techniques[type]++; }

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar(_('Dealing Gear cards from Portaledge'));
                const portaledge = $('portaledge');
                portaledge.style.display = 'block';
                await this.utils.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
                portaledge.style.marginTop = 0;
                await (async function() { return new Promise(resolve => setTimeout(resolve, 300)) })();

                await (async () => { // deliver assets to other opponents
                    return new Promise(async (resolve) => {
                        const players = dojo.query('.hand_counter');
                        const other_opponents = [];

                        for (let player of players) {
                            const player_id = player.id.slice(-7);
                            if (player_id != this.player_id && player_id != this.getActivePlayerId()) { other_opponents.push(player_id); }
                        }

                        const opponents_num = other_opponents.length;

                        if (opponents_num > 0) {
                            for (let i=0; i<=opponents_num-1; i++) {
                                const player_id = other_opponents[i];
                                const asset_back = dojo.place(this.format_block('jstpl_asset_card', {
                                                   CARD_ID : `${player_id}_back`,
                                                   EXTRA_CLASSES : '',
                                                   acX : 0,
                                                   acY : 0,
                                }), 'portagear');

                                const args = [asset_back, $(`hand_counter_${player_id}`)];
                                this.utils.animationPromise(asset_back, 'asset_portaledge_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                await (async function() { return new Promise(resolve => setTimeout(resolve, 200)) })();
                                if (i == opponents_num-1) {
                                    await (async function() { return new Promise(resolve => setTimeout(resolve, 800)) })();
                                    for (let player of other_opponents) {
                                        const hand_count = Number($(`hand_num_${player_id}`).innerHTML) + 1;
                                        this.utils.handCount(player_id, hand_count);
                                    }
                                    resolve();
                                }
                            }
                        } else { resolve(); }
                    });
                })();

                const portaledge_asset_div = dojo.place(this.format_block('jstpl_flip_card', {
                    card_id : new_asset_id,
                    extra_classes : '',
                    back_type : 'asset asset_back_for_flip',
                    front_type : 'asset',
                    cX : asset.x_y[0],
                    cY : asset.x_y[1],
                }), 'portagear');

                let args = [portaledge_asset_div, display_slot];
                $('asset_deck_draw').style.display = 'flex';

                this.utils.animationPromise(portaledge_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true);
                await this.utils.animationPromise(portaledge_asset_div, 'asset_portaledge_to_display', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                const asset_ele = dojo.place(card, display_slot);

                await (async function() { return new Promise(resolve => setTimeout(resolve, 100)) })(); // I don't know why but without this line, the line below doesn't work
                await this.utils.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
                portaledge.style.marginTop = '-36.4061%';
                portaledge.style.display = '';
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
                args = [asset_ele, hand_slot];
                await this.utils.animationPromise(asset_ele, 'asset_display_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                $('asset_deck_draw').style.display = '';

                this.utils.updatePlayerResources(this.player_id, player_resources);

                const hand_count = dojo.query('#assets_wrap .asset').length;
                this.utils.handCount(this.player_id, hand_count);
            
            } else { // shouldn't animate
                for (const id of Object.keys(this.gamedatas.players)) {
                    if (id != this.getActivePlayerId()) {
                        const hand_count = Number(dojo.query(`#hand_num_${id}`)[0].innerHTML) + 1;
                        this.utils.handCount(id, hand_count);
                    }
                }
                dojo.place(card, hand_slot);
                this.utils.updatePlayerResources(this.player_id, player_resources);

            }

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';

            } else { // shouldn't animate
                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                const destination = $('climbing_discard_90');
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.notifqueue.setSynchronousDuration();
        },

        notif_summitBetaChoices: async function(notif) {

            this.utils.clicksOff();

            const summit_beta_tokens = notif.args.summit_beta_tokens;

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            dojo.place('<div id="second_summit_beta_token" class="summit_pile_back summit_back" style="position: absolute; left: 217%;"></div>', 'summit_pile');
            const token_1 = summit_beta_tokens[0];
            const token_1_info = this.gamedatas.summit_beta_tokens[token_1.type_arg];
            const token_2 = summit_beta_tokens[1];
            const token_2_info = this.gamedatas.summit_beta_tokens[token_2.type_arg];

            const token_flip_1 = dojo.place(this.format_block('jstpl_flip_card', {
                card_id : token_1.id,
                extra_classes : 'token_flip',
                back_type : 'summit_beta summit_back_for_flip',
                front_type : 'summit_beta',
                cX : token_1_info['x_y'][0],
                cY : token_1_info['x_y'][1],
            }), 'summit_pile');

            const token_flip_2 = dojo.place(this.format_block('jstpl_flip_card', {
                card_id : token_2.id,
                extra_classes : 'token_flip',
                back_type : 'summit_beta summit_back_for_flip',
                front_type : 'summit_beta',
                cX : token_2_info['x_y'][0],
                cY : token_2_info['x_y'][1],
            }), 'summit_pile');
            
            const public_flip_1 = token_flip_1.cloneNode(true);
            const public_flip_2 = token_flip_2.cloneNode(true);

            $('summit_pile').style.zIndex = '201';

            const styles = {
                width: '200%',
                height: '200%',
                top: '57%',
                left: '0',
                marginLeft: '0'
            }

            if (this.utils.shouldAnimate()) {

                let args = [token_flip_2, $('second_summit_beta_token')];

                if (this.isCurrentPlayerActive()) {
                    this.utils.animationPromise(token_flip_1.firstElementChild, 'flip_transform_summit_beta', 'anim', null, false, true);
                    this.utils.animationPromise(token_flip_2.firstElementChild, 'flip_transform_summit_beta', 'anim', null, false, true);
                }
                else {
                    this.utils.animationPromise(token_flip_1.firstElementChild, 'token_grow_no_flip', 'anim', null, false, true);
                    this.utils.animationPromise(token_flip_2.firstElementChild, 'token_grow_no_flip', 'anim', null, false, true);
                }
                
                this.utils.animationPromise(token_flip_1, 'token_to_first_position', 'anim', null, true, false);
                await this.utils.animationPromise(token_flip_2, 'token_to_second_position', 'anim', this.utils.moveToNewParent(), true, false, ...args);

                $('summit_pile').style.zIndex = '201';

                if (this.isCurrentPlayerActive()) {
                    const token_1_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_1.id,
                        sbX : token_1_info['x_y'][0],
                        sbY : token_1_info['x_y'][1],
                    }), 'summit_pile');

                    const token_2_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_2.id,
                        sbX : token_2_info['x_y'][0],
                        sbY : token_2_info['x_y'][1],
                    }), 'second_summit_beta_token');

                    Object.assign(token_1_ele.style, styles);
                    Object.assign(token_2_ele.style, styles);
                }

                else {
                    $('summit_pile').append(public_flip_1);
                    $('second_summit_beta_token').append(public_flip_2);
                    Object.assign(public_flip_1.style, styles);
                    Object.assign(public_flip_2.style, styles);
                }
            }

            else { // shouldn't animate
           
                if (this.isCurrentPlayerActive()) {
                    token_flip_1.remove();
                    token_flip_2.remove();

                    const token_1_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_1.id,
                        sbX : token_1_info['x_y'][0],
                        sbY : token_1_info['x_y'][1],
                    }), 'summit_pile');

                    const token_2_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_2.id,
                        sbX : token_2_info['x_y'][0],
                        sbY : token_2_info['x_y'][1],
                    }), 'second_summit_beta_token');

                    Object.assign(token_1_ele.style, styles);
                    Object.assign(token_2_ele.style, styles);
                }

                else {
                    $('second_summit_beta_token').append(token_flip_2);
                    Object.assign(token_flip_1.style, styles);
                    Object.assign(token_flip_2.style, styles);
                }
            }

            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmChooseSummitBetaTokenPlayer: async function(notif) {

            this.utils.clicksOff();

            const selected_token_id = notif.args.selected_token_id;
            const selected_token_type_arg = notif.args.selected_token_type_arg;
            const opponent_token_id = notif.args.opponent_token_id;
            const opponent_id = notif.args.opponent_id;

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const card_destination = $('climbing_discard_90');

            const selected_token_ele = $(`summit_beta_${selected_token_id}`);
            const opponent_token_ele = $(`summit_beta_${opponent_token_id}`);
            selected_token_ele.classList.remove('selected_token', 'selectable_token', 'cursor');
            opponent_token_ele.classList.remove('selectable_token', 'cursor');
            
            const styles = {
                top: '0',
                left: '0',
                marginLeft: '0'
            }
            Object.assign(selected_token_ele.style, styles);
            Object.assign(opponent_token_ele.style, styles);

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar(_('Taking Summit Beta tokens'));

                // token for active player

                const selected_token_ele = $(`summit_beta_${selected_token_id}`);
                const new_token_slot = this.utils.resizeHand('token');

                let args = [selected_token_ele, new_token_slot];
                this.utils.animationPromise(selected_token_ele, 'token_board_to_hand_choose', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                selected_token_ele.style.width = '100%';
                selected_token_ele.style.height = '100%';
                this.utils.initSummitBetaToken(selected_token_ele, selected_token_type_arg)

                // token for selected opponent

                const opponent_token_ele = $(`summit_beta_${opponent_token_id}`);
                args = [opponent_token_ele, $(`hand_counter_${opponent_id}`)];
                await this.utils.animationPromise(opponent_token_ele, 'token_board_to_counter_choose', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                
                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                card_destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';

            } else { // shouldn't animate

                const new_token_slot = this.utils.resizeHand('token');
                new_token_slot.append(selected_token_ele);
                selected_token_ele.style.width = '100%';
                selected_token_ele.style.height = '100%';
                opponent_token_ele.remove();

                card_destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmChooseSummitBetaTokenOpponent: async function(notif) {

            this.utils.clicksOff();

            const selected_token_id = notif.args.selected_token_id;
            const opponent_token_id = notif.args.opponent_token_id;
            const opponent_token_type_arg = notif.args.opponent_token_type_arg;
            const opponent_token = this.gamedatas.summit_beta_tokens[opponent_token_type_arg];
            const new_token_slot = this.utils.resizeHand('token');
            const player_id = notif.args.player_id;

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const card_destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar(_('Taking Summit Beta tokens'));

                const selected_token = $(`card_${selected_token_id}`);
                const origin = selected_token.parentElement;
                const style = selected_token.style;
                $(`card_${selected_token_id}`).remove();
                const selected_token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : selected_token_id,
                    sbX : 0,
                    sbY : 0,
                }), origin);
                selected_token_ele.style = style;
                let args = [selected_token_ele, $(`hand_counter_${player_id}`)];
                this.utils.animationPromise(selected_token_ele, 'token_board_to_counter_choose', 'anim', this.utils.moveToNewParent(), true, false, ...args);

                // token for selected opponent
                const opponent_token_flip = $(`card_${opponent_token_id}`);

                await this.utils.animationPromise(opponent_token_flip.firstElementChild, 'token_flip_no_grow', 'anim', null, true, false);
                const opponent_token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : opponent_token_id,
                    sbX : opponent_token['x_y'][0],
                    sbY : opponent_token['x_y'][1],
                }), 'second_summit_beta_token');
                args = [opponent_token_ele, new_token_slot];
                await this.utils.animationPromise(opponent_token_ele, 'token_board_to_hand_choose', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                this.utils.initSummitBetaToken(opponent_token_ele, opponent_token_type_arg);
                
                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                card_destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';

            } else { // shouldn't animate

                const selected_token_ele = $(`card_${selected_token_id}`);
                const opponent_token_ele = $(`card_${opponent_token_id}`);

                // token for selected opponent
                selected_token_ele.remove();
                opponent_token_ele.remove();

                dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : opponent_token_id,
                    sbX : opponent_token.x_y[0],
                    sbY : opponent_token.x_y[1],
                }), new_token_slot);
                        
                card_destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmChooseSummitBetaTokenPublic: async function(notif) {

            this.utils.clicksOff();

            const selected_token_id = notif.args.selected_token_id;
            const opponent_token_id = notif.args.opponent_token_id;
            const player_id = notif.args.player_id;
            const opponent_id = notif.args.opponent_id;
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const card_destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar(_('Taking Summit Beta tokens'));

                const selected_token = $(`card_${selected_token_id}`);
                const selected_origin = selected_token.parentElement;
                const selected_style = selected_token.style;
                $(`card_${selected_token_id}`).remove();
                const selected_token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : selected_token_id,
                    sbX : 0,
                    sbY : 0,
                }), selected_origin);
                selected_token_ele.style = selected_style;
                let args = [selected_token_ele, $(`hand_counter_${player_id}`)];
                this.utils.animationPromise(selected_token_ele, 'token_board_to_counter_choose', 'anim', this.utils.moveToNewParent(), true, false, ...args);

                const opponent_token = $(`card_${opponent_token_id}`);
                const opponent_origin = opponent_token.parentElement;
                const opponent_style = opponent_token.style;
                opponent_token.remove();
                const opponent_token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : selected_token_id,
                    sbX : 0,
                    sbY : 0,
                }), opponent_origin);
                opponent_token_ele.style = opponent_style;
                args = [opponent_token_ele, $(`hand_counter_${opponent_id}`)];
                await this.utils.animationPromise(opponent_token_ele, 'token_board_to_counter_choose', 'anim', this.utils.moveToNewParent(), true, false, ...args);

                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                card_destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }

            else { // shouldn't animate
                $(`card_${selected_token_id}`).remove();
                $(`card_${opponent_token_id}`).remove();

                card_destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
            }
            this.utils.cleanClimbingDiscardPile();

            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_matchingTechniques: async function(notif) {

            const player_id = notif.args.player_id;
            const player_name = notif.args.player_name;
            const player_color = notif.args.player_color;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const previous_points_tokens = dojo.query(`#character_${character_id} .points_token`).length;
            const played_tokens = notif.args.played_tokens;
            const token_num = notif.args.token_num;
            const open_slots = previous_points_tokens < 8 ? 8 - previous_points_tokens : 0;
            const new_tokens = token_num <= open_slots ? token_num : open_slots;
            const flip_tokens = token_num > open_slots ? token_num - open_slots : 0;            

            if (this.utils.shouldAnimate()) {

                // animate played Technique Token
                await (async () => {
                    return new Promise(async (resolve) => {

                        if (Object.keys(played_tokens).length > 0) {

                            $('token_display').style.display = 'flex';
                            let tokens_to_fade = [];
                            let i = 1;
                            for (const [type, num] of Object.entries(played_tokens)) {

                                if (num > 0) {

                                    const display_slot = $(`token_display_${i}`);

                                    if (player_id == this.player_id) {
                                        const token_ele = dojo.query(`#assets_wrap .${type}_token`)[0];
                                        tokens_to_fade.push(token_ele);
                                        const args = [token_ele, display_slot];
                                        const token_origin = token_ele.parentElement;
                                        display_slot.append(token_ele);
                                        const dest_width = token_ele.getBoundingClientRect().width;
                                        token_origin.append(token_ele);
                                        token_ele.style.setProperty('--dw', `${dest_width}px`);
                                        token_ele.style.setProperty('--dh', `${dest_width}px`);
                                        await this.utils.animationPromise(token_ele, 'token_hand_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                    }
                                    else {
                                        const token_ele = dojo.place(`<div class="${type}_token symbol_token"></div>`, `hand_counter_${player_id}`);
                                        tokens_to_fade.push(token_ele);
                                        const args = [token_ele, display_slot, null, false, true];
                                        await this.utils.animationPromise(token_ele, 'tech_token_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                    }
                                    i++;

                                    this.gamedatas.resource_tracker['symbol_tokens'][type]--;
                                    const tech_num = this.gamedatas.resource_tracker['techniques'][type] - 1;
                                    const updated_resources = {'techniques': {}};
                                    updated_resources['techniques'][type] = tech_num;
                                    this.utils.updatePlayerResources(player_id, updated_resources);
                                }
                            }

                            await (async function() { return new Promise(resolve => setTimeout(resolve, 500)) })();
                            let token_anims = [];
                            for (let token of tokens_to_fade) {
                                token_anims.push(this.utils.animationPromise.bind(null, token, 'token_fade', 'anim', null, true, false));
                            }
                            Promise.all(token_anims.map((func) => { return func(); }))
                            .then(() => { $('token_display').style.display = ''; })
                            .then(() => { resolve(); });
                        } else { resolve(); }
                    })
                })();

                // animate New Rubber summit beta token
                if (notif.args.used_new_rubber) {

                    await (async () => {
                        return new Promise(async (resolve) => {

                            if (player_id == this.player_id) {

                                const hand_tokens = this.gamedatas.hand_summit_beta_tokens;
                                const token_id = Object.keys(hand_tokens).find(key => hand_tokens[key] === '6');
                                delete this.gamedatas.hand_summit_beta_tokens[token_id];
                                const token_ele = $(`summit_beta_${token_id}`);
                                const args = [token_ele, $('summit_discard')];
                                this.utils.updateTitlebar(_('Discarding Summit Beta token'));
                                await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                resolve();
                            }

                            else { // opponents' view

                                const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                                    TOKEN_ID : '6',
                                    sbX : 100,
                                    sbY : 200,
                                }), `hand_counter_${player_id}`);
                                $('token_display_1').append(token_ele);
                                const width = token_ele.getBoundingClientRect().width;
                                const height = token_ele.getBoundingClientRect().height;
                                $(`hand_counter_${player_id}`).append(token_ele);
                                token_ele.style.setProperty('--dw', width);
                                token_ele.style.setProperty('--dh', height);

                                this.utils.updateTitlebar(_('Discarding Summit Beta token'));

                                $('token_display').style.display = 'flex';

                                let args = [token_ele, $('token_display_1'), null, false, true];
                                await this.utils.animationPromise(token_ele, 'token_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
                                args = [token_ele, $('summit_discard')];
                                await this.utils.animationPromise(token_ele, 'token_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                $('token_display').style.display = '';
                                resolve();
                            }
                        });
                    })();
                }

                this.utils.updateTitlebar(_('Awarding 2-Point Token(s) to '));
                const player_name_span = document.createElement('span');
                player_name_span.id = `${player_name}_span`;
                player_name_span.innerHTML = player_name;
                player_name_span.style.color = player_color;
                $('pagemaintitletext').parentElement.insertBefore(player_name_span, $('pagemaintitletext').nextElementSibling);
                this.utils.resizeHand();

                if (new_tokens > 0) {

                        // 2 point tokens appear
                        await (async () => {
                            return new Promise(async (resolve) => {
    
                                for (let i=1; i<=new_tokens; i++) {
    
                                    const two_point_token = dojo.place(`<div class="points_token points_${i}"></div>`, 'board', 2);
                                    this.utils.animationPromise(two_point_token, 'token_appears', 'anim', null, false, false);
                                    await (async function() { return new Promise(resolve => setTimeout(resolve, 200)) })();
                                    if (i === new_tokens) {
                                        await (async function() { return new Promise(resolve => setTimeout(resolve, 1300)) })();
                                        resolve();
                                    }
                                }
                            });
                        })();
    
                        // 2 point tokens animate to boards
                        await (async () => {
                            return new Promise(async (resolve) => {
    
                                for (let i=1; i<=new_tokens; i++) {
                                    
                                    const token = dojo.query(`.points_${i}`)[0];
                                    const wrapper_num = previous_points_tokens + i;
                                    const destination = dojo.query(`#player_${player_id} .pw${wrapper_num}`)[0];
                                    const args = [token, destination];
                                    token.classList.remove('token_appears');
    
                                    switch (i) {
                                        case 1: token.style.setProperty('--dr', '25%'); break;
                                        case 2: token.style.setProperty('--dr', '29%'); break;
                                        case 3: token.style.setProperty('--dr', '33%'); break;
                                    }
    
                                    this.utils.animationPromise(token, 'points_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                    await (async function() { return new Promise(resolve => setTimeout(resolve, 200)) })();
                                    if (i == token_num) {
                                        await (async function() { return new Promise(resolve => setTimeout(resolve, 1300)) })();
                                        resolve();
                                    }
                                }
                            });
                        })();
                }

                if (flip_tokens > 0) {

                    await (async () => {
                        return new Promise(async (resolve) => {

                            for (let i=1; i<=flip_tokens; i++) {

                                const first_unflipped = document.querySelector(`#asset_board_${player_id} .two_points`);
                                const flip_wrapper = first_unflipped.parentElement;
                                first_unflipped.remove();

                                const token_flip = dojo.place(this.format_block('jstpl_flip_card', {
                                    card_id : i,
                                    extra_classes : '',
                                    back_type : 'points_token two_points',
                                    front_type : 'points_token four_points',
                                    cX : 100,
                                    cY : 0,
                                }), flip_wrapper);
                                await this.utils.animationPromise(token_flip.firstElementChild, 'flip_transform', 'anim', null, true, false);

                                dojo.place(`<div class="points_token four_points"></div>`, flip_wrapper);
                                resolve();
                            }
                        });
                    })();
                }

                // points tracker
				this.scoreCtrl[player_id].incValue(notif.args.new_points);

                player_name_span.remove();
                while ($('summit_discard').childElementCount > 1) { $('summit_discard').firstElementChild.remove(); }
                this.utils.updateTitlebar('');
                this.notifqueue.setSynchronousDuration();

            } else { // shouldn't animate

                for (let i=1; i<=new_tokens; i++) {

                    const wrapper_num = previous_points_tokens + i;
                    const destination = dojo.query(`#player_${player_id} .pw${wrapper_num}`)[0];
                    dojo.place(`<div class="points_token two_points"></div>`, destination);
                }

                for (let i=1; i<=flip_tokens; i++) {

                    const first_unflipped = document.querySelector(`#asset_board_${player_id} .two_points`);
                    const destination = first_unflipped.parentElement;
                    first_unflipped.remove();
                    dojo.place(`<div class="points_token four_points"></div>`, destination);
                }

                this.scoreCtrl[player_id].incValue(notif.args.new_points);

                const played_token_num = Object.values(played_tokens).reduce((partialSum, a) => partialSum + a, 0);

                if (played_token_num > 0 && player_id == this.player_id) {
                    const updated_resources = {'techniques': {}};
                    for (const [type, num] of Object.entries(played_tokens)) {

                        for (let i=1; i<=num; i++) {

                            const token_ele = dojo.query(`#assets_wrap .${type}_token`)[0];
                            token_ele.parentElement.remove();
                            const tech_num = this.gamedatas.resource_tracker['techniques'][type] - 1;
                            updated_resources['techniques'][type] = tech_num;
                        }
                    }
                    this.utils.updatePlayerResources(player_id, updated_resources);
                }

                if (notif.args.used_new_rubber) {

                    if (this.isCurrentPlayerActive()) {

                        const hand_tokens = this.gamedatas.hand_summit_beta_tokens;
                        const token_id = Object.keys(hand_tokens).find(key => hand_tokens[key] === '6');
                        const token_ele = $(`summit_beta_${token_id}`);
                        $('summit_discard').append(token_ele);
                    }

                    else {

                        dojo.place(this.format_block('jstpl_summit_beta', {
                            TOKEN_ID : '6',
                            sbX : 100,
                            sbY : 200,
                        }), 'summit_discard');
                    }
                }

                while ($('summit_discard').childElementCount > 1) { $('summit_discard').firstElementChild.remove(); }
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_noMatchingTechniques: async function(notif) {

            this.utils.updateTitlebar(_('Checking for sets of matching Technique symbols'));
            await (async function() { return new Promise(resolve => setTimeout(resolve, 1200)) })();
            this.notifqueue.setSynchronousDuration();
        },

        notif_noPermanentAssets: async function(notif) {

            this.utils.updateTitlebar(_('Checking for players eligible to gain Permanent Assets token(s)'));
            await (async function() { return new Promise(resolve => setTimeout(resolve, 1200)) })();
            this.notifqueue.setSynchronousDuration();
        },

        notif_grantPermanentAssets: async function(notif) {

            const players = Object.keys(this.gamedatas.players);
            const gained_permanent_assets = notif.args.gained_permanent_assets;
            const discarded_assets = notif.args.discarded_assets;
            const asset_board_slot = dojo.query('.asset_board_slot')[0];
            const asset_bounding_box = asset_board_slot.getBoundingClientRect();
            const shared_objectives_tracker = notif.args.shared_objectives_tracker;
            this.gamedatas.shared_objectives_tracker
            const discard_pile = $('asset_discard');    
            let discard_ids = [];
            let tucked_ids = [];
            let tucked_types = {};

            for (const player of Object.values(discarded_assets)) {
                for (const state of Object.values(player)) {
                    for (const type of Object.values(state)) {
                        for (const id of type) {
                            const type_arg = this.gamedatas.asset_identifier[id];
                            this.asset_discard[id] = type_arg;
                        }
                    }
                }
            }

            for (let player_id of players) {

                // check if any permanent assets have been chosen
                if (player_id in gained_permanent_assets) {

                    // discard assets from asset board

                    for (let type of ['gear', 'face', 'crack', 'slab']) {

                            // tucked
                        for (let asset_id of discarded_assets[player_id]['tucked'][type]) {

                            const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                            const asset_counter_img = dojo.query(`#player_${player_id} .board_${type}_counter .asset_counter_img`)[0];
                            const asset = this.gamedatas.asset_cards[asset_type_arg];

                            delete this.gamedatas.board_assets[player_id][type]['tucked'][asset_id];
                            this.gamedatas.board_assets[player_id][type]['count']--;
                            if (player_id == this.player_id) { this.gamedatas.resource_tracker['asset_board']['skills'][type]--; }

                            const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : '',
                                acX : asset.x_y[0],
                                acY : asset.x_y[1],
                            }), asset_counter_img);

                            discard_ids.push(asset_id);
                            tucked_ids.push(asset_id);
                            if (tucked_types.hasOwnProperty(player_id) && tucked_types[player_id].hasOwnProperty(type)) { tucked_types[player_id][type]++; }
                            else {
                                tucked_types[player_id] = {};
                                tucked_types[player_id][type] = 1;
                            }
                        }

                            // flipped
                        for (let asset_id of discarded_assets[player_id]['flipped'][type]) {

                            const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                            const asset = this.gamedatas.asset_cards[asset_type_arg];
                            const asset_ele = $(`asset_card_${asset_id}`);
                            const slot = asset_ele.parentElement;
                            asset_ele.remove();

                            const slot_num = slot.id.slice(-1);
                            this.gamedatas.board_assets[player_id][type][slot_num] = [];
                            this.gamedatas.board_assets[player_id][type]['flipped'][slot_num] = null;
                            this.gamedatas.board_assets[player_id][type]['count']--;
                            if (player_id == this.player_id) { this.gamedatas.resource_tracker['asset_board']['skills'][type]--; }

                            dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : '',
                                acX : asset.x_y[0],
                                acY : asset.x_y[1],
                            }), slot);

                            discard_ids.push(asset_id);
                        }

                            // unflipped
                        for (let asset_id of discarded_assets[player_id]['unflipped'][type]) {

                            asset_ele = $(`asset_card_${asset_id}`);
                            const slot_num = asset_ele.parentElement.id.slice(-1);
                            this.gamedatas.board_assets[player_id][type][slot_num] = [];
                            this.gamedatas.board_assets[player_id][type]['flipped'][slot_num] = null;
                            this.gamedatas.board_assets[player_id][type]['count']--;
                            if (player_id == this.player_id) { this.gamedatas.resource_tracker['asset_board']['skills'][type]--; }

                            discard_ids.push(asset_id);
                        }
                    }
                }
            }


            if (this.utils.shouldAnimate() && discard_ids.length > 0) {

                await (async () => {
                    return new Promise(async (resolve) => {
                        let i = 1;
                        for (asset_id of discard_ids) {

                            const asset_ele = $(`asset_card_${asset_id}`);
                            const num_ele = asset_ele.parentElement.nextElementSibling;
                            const args = [asset_ele, discard_pile, 3];
                            const animation_type = tucked_ids.includes(asset_id) ? 'fast_tucked_to_discard' : 'fast_board_to_discard';

                            if (i == 1) {
                                this.utils.animationPromise(asset_ele, animation_type, 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                if (tucked_ids.includes(asset_id)) { this.utils.decrementTuckedNum(num_ele); }
                                await (async function() { return new Promise(resolve => setTimeout(resolve, 50)) })();
                            }

                            else if (i > 1 && i < discard_ids.length) {
                                this.utils.animationPromise(asset_ele, animation_type, 'anim', this.utils.moveToNewParent(), true, false, ...args);
                                if (tucked_ids.includes(asset_id)) { this.utils.decrementTuckedNum(num_ele); }
                                await (async function() { return new Promise(resolve => setTimeout(resolve, 50)) })();
                            } 

                            else if (i == discard_ids.length) {
                                this.utils.animationPromise(asset_ele, animation_type, 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                if (tucked_ids.includes(asset_id)) { this.utils.decrementTuckedNum(num_ele); }
                                await (async function() { return new Promise(resolve => setTimeout(resolve, 600)) })();

                                discard_pile.replaceChildren(discard_pile.lastChild);
                                resolve();
                            }
                            i++;
                        }
                    });
                })();

                for (let player_id of players) { this.utils.repositionAssetBoard(player_id); }

                // place permanent_assets_box and fade into view
                const asset_box = dojo.place(this.format_block('jstpl_permanent_assets_box'), 'board', 3);
                await this.utils.animationPromise(asset_box, 'asset_box_appears', 'anim', null, false, false);

                // tokens appear on the symbols and slide to the asset board/s
                let total_tokens = 0;
                for (const player_id of players) {

                    if (player_id in gained_permanent_assets) {

                        for (const [type, num] of Object.entries(gained_permanent_assets[player_id])) {

                            total_tokens += Number(num);
                        }
                    }
                }
                let current_token = 1;

                await (async () => {
                    return new Promise(async (resolve) => {

                        for (const player_id of players) {

                            const board_assets = this.gamedatas.board_assets[player_id];
                            let previous_tokens = board_assets['gear']['permanent'] + board_assets['face']['permanent'] + board_assets['crack']['permanent'] + board_assets['slab']['permanent'];
                            if (player_id in gained_permanent_assets) {

                                for (let [type, num] of Object.entries(gained_permanent_assets[player_id])) {

                                    for (let i=1; i<=num; i++) {

                                        const token = dojo.place(`<div id="${type}_${player_id}_${i}" class="skills_and_techniques ${type}_token permanent_asset"></div>`, `box_${type}`);
                                        const destination = dojo.query(`#asset_board_${player_id} .pa${previous_tokens + 1}`)[0];
                                        const args = [token, destination];

                                        this.utils.animationPromise(token, 'token_to_permanent_slot', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                                        await (async function() { return new Promise(resolve => setTimeout(resolve, 250)) })();
                                        if (current_token == total_tokens) { 
                                            await (async function() { return new Promise(resolve => setTimeout(resolve, 1300)) })();
                                            resolve();
                                        }
                                        current_token++;
                                        previous_tokens++;
                                    }
                                }
                            }
                        }
                    });
                })();

                asset_box.classList.remove('asset_box_appears');
                asset_box.style.marginRight = '0%';
                await this.utils.animationPromise(asset_box, 'remove_asset_box', 'anim', null, true, false);
            }

            else if (discard_ids.length > 0) { // shouldn't animate

                for (const [player_id, types] of Object.entries(tucked_types)) {

                   for (const [type, num] of Object.entries(types)) {

                        const num_ele = dojo.query(`#asset_board_${player_id} .board_${type}_counter .asset_counter_num`)[0];
                        const old_num = Number(num_ele.innerHTML);
                        num_ele.innerHTML = `${old_num - num}`;
                   }
                }

                for (const id of discard_ids) {

                    let ele;
                    if (dojo.query(`#asset_card_${id}`).length > 0) {
                        ele = dojo.query(`#asset_card_${id}`)[0];
                        ele.remove();
                    }

                    else if (dojo.query(`.asset_card_${id}`).length > 0) {
                        ele = dojo.query(`.asset_card_${id}`)[0];
                        ele.remove();
                    }
                }

                const final_id = discard_ids[discard_ids.length-1];
                const type_arg = this.gamedatas.asset_identifier[final_id];
                const asset = this.gamedatas.asset_cards[type_arg];
                dojo.place(this.format_block('jstpl_asset_card', {
                    CARD_ID : final_id,
                    EXTRA_CLASSES : '',
                    acX : asset.x_y[0],
                    acY : asset.x_y[1],
                }), $('asset_discard'));

                for (let player_id of players) {
                    this.utils.repositionAssetBoard(player_id);

                    const board_assets = this.gamedatas.board_assets[player_id];
                    let previous_tokens = board_assets['gear']['permanent'] + board_assets['face']['permanent'] + board_assets['crack']['permanent'] + board_assets['slab']['permanent'];
                    if (gained_permanent_assets.hasOwnProperty(player_id)) {

                        for (let [type, num] of Object.entries(gained_permanent_assets[player_id])) {

                            for (let i=1; i<=num; i++) {

                                const destination = dojo.query(`#asset_board_${player_id} .pa${previous_tokens +1}`)[0];
                                dojo.place(`<div id="${type}_${player_id}_${i}" class="skills_and_techniques ${type}_token permanent_asset"></div>`, destination);
                                previous_tokens++;
                            }
                        }
                    }
                }
            }

            for (let player_id of players) {

                if (gained_permanent_assets.hasOwnProperty(player_id)) {

                    for (let [type, num] of Object.entries(gained_permanent_assets[player_id])) {

                        for (let i=1; i<=num; i++) {

                            this.gamedatas.board_assets[player_id][type]['permanent']++;
                            if (player_id == this.player_id) { this.gamedatas.resource_tracker['permanent_skills'][type]++; }
                        }
                    }
                    if (player_id == this.player_id) {
                        const updated_resources = this.utils.getCurrentPlayerResources();
                        this.utils.updatePlayerResources(player_id, updated_resources);
                    }

                    this.scoreCtrl[player_id].incValue(notif.args.shared_objective_points);

                    // update shared objectives trackers
                    this.utils.updateSharedObjectivesDisplay(shared_objectives_tracker);
                }
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_flipPlayedAssets: async function(notif) {

            const ids_to_flip = notif.args.ids_to_flip;
            let flip_anims = [];
            let slots = [];
            for (id of ids_to_flip) {
                const unflipped_ele = $(`asset_card_${id}`);
                const slot = unflipped_ele.parentElement;
                slots.push(slot);
                const type_arg = this.gamedatas.asset_identifier[id];
                const asset = this.gamedatas.asset_cards[type_arg];
                unflipped_ele.remove();

                const type = this.utils.getAssetType(type_arg);
                const player_id = slot.parentElement.parentElement.id.slice(-7);
                const slot_num = slot.id.slice(-1);
                this.gamedatas.board_assets[player_id][type]['flipped'][slot_num] = true;

                if (this.utils.shouldAnimate()) {

                    const flip_card = dojo.place(this.format_block('jstpl_flip_card', {
                        card_id : id,
                        extra_classes : '',
                        back_type : 'asset asset_back_for_flip',
                        front_type : 'asset',
                        cX : asset.x_y[0],
                        cY : asset.x_y[1],
                    }), slot);
                    flip_card.firstElementChild.style.transform = 'rotateY(180deg)';

                    flip_anims.push(this.utils.animationPromise.bind(null, flip_card.firstElementChild, 'unflip_transform', 'anim', null, true, false));
                }
            }

            await (async () => {
                return new Promise(async (resolve) => {
                    if (this.utils.shouldAnimate()) {

                        Promise.all(flip_anims.map((func) => { return func(); }))
                        .then(() => {
                            for (slot of slots) {
                                slot.firstElementChild.remove();
                                const id = ids_to_flip.shift();
                                dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : id,
                                    EXTRA_CLASSES : 'played_asset flipped',
                                    acX : '0',
                                    acY : '0',
                                }), slot);
                            }
                            resolve();
                        });
                    
                    } else { // shouldn't animate

                        for (slot of slots) {
                            dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : ids_to_flip.shift(),
                                EXTRA_CLASSES : 'played_asset flipped',
                                acX : '0',
                                acY : '0',
                            }), slot);
                        }
                        resolve();
                    }
                });
            })();

            this.notifqueue.setSynchronousDuration();
        },

        notif_passStartingPlayer: async function(notif) {

            const starting_player_token = $('starting_player');
            const new_starting_player = notif.args.new_starting_player;
            const destination = new_starting_player == this.player_id ? $('ref_row') : $(`${new_starting_player}_water_and_psych`);
            const args = [starting_player_token, destination];

            if (this.utils.shouldAnimate()) { await this.utils.animationPromise(starting_player_token, 'pass_starting_player', 'anim', this.utils.moveToNewParent(), false, true, ...args); }
            else { destination.append(starting_player_token); }

            this.notifqueue.setSynchronousDuration();
        },

        notif_revealHeadwall: async function(notif) {

            await (async () => {

                return new Promise(async (resolve) => {

                    const board = notif.args.board;
                    const tile_coords = notif.args.tile_coords;
                    let flip_anims = [];
                    new_pitches = [];
                    const min_hex = this.board === 'desert' ? 22 : 28;
                    for (const [location, type_arg] of Object.entries(board)) {

                        if (location >= min_hex) {

                            const pitch_ele = $(`pitch_${location}`);
                            const wrapper = pitch_ele.parentElement;
                            const pitch = this.gamedatas.pitches[type_arg];

                            const coords = tile_coords[location-1];
                            new_pitches.push([this.format_block('jstpl_pitch', {
                                location : location,
                                pB : coords[0],
                                pL : coords[1],
                                type_arg : type_arg,
                                pbX : pitch.x_y[0],
                                pbY : pitch.x_y[1],
                            }), wrapper, location, type_arg]);
                        }
                    }

                    if (this.utils.shouldAnimate()) {

                        for (const [location, type_arg] of Object.entries(board)) {

                            if (location >= min_hex) {

                                const pitch_ele = $(`pitch_${location}`);
                                const wrapper = pitch_ele.parentElement;
                                const pitch = this.gamedatas.pitches[type_arg];
                                const background_pos = pitch_ele.style.backgroundPosition;

                                dojo.query(`#${wrapper.id} *`).forEach(ele => { ele.remove(); });

                                const pitch_flip = dojo.place(this.format_block('jstpl_flip_card', {
                                    card_id : type_arg,
                                    extra_classes : '',
                                    back_type : 'pitch pitch_back_for_flip',
                                    front_type : 'pitch',
                                    cX : pitch.x_y[0],
                                    cY : pitch.x_y[1]
                                }), wrapper);
                                pitch_flip.firstElementChild.firstElementChild.style.backgroundPosition = background_pos;

                                flip_anims.push(this.utils.animationPromise.bind(null, pitch_flip.firstElementChild, 'flip_transform', 'anim', null, false, false));
                            }
                        }

                        Promise.all(flip_anims.map((func) => { return func(); }))
                        .then(() => {
                            new_pitches.map(pitch => {

                                const wrapper = pitch[1];
                                dojo.query(`#${wrapper.id} *`).forEach(ele => { ele.remove(); });

                                const pitch_ele = dojo.place(pitch[0], wrapper, 1);
                                const location = pitch[2];
                                const type_arg = pitch[3];

                                this.utils.pitchTooltip(`pitch_${location}_click`, type_arg, false, 'Rope order:');
                                resolve();
                            });
                        });
                    }
                    else { // shouldn't animate

                        new_pitches.map(pitch => {

                            const wrapper = pitch[1];
                            dojo.query(`#${wrapper.id} *`).forEach(ele => { ele.remove(); });

                            const pitch_ele = dojo.place(pitch[0], wrapper, 1);
                            const location = pitch[2];
                            const type_arg = pitch[3];

                            this.utils.pitchTooltip(`pitch_${location}_click`, type_arg, false, 'Rope order:');
                            resolve();
                        });
                    }
                });
            })();

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmRerackPublic: async function (notif) {

            const player_id = notif.args.player_id;
            const reracked_assets = notif.args.reracked_assets;
            const discard_top = $('asset_discard').firstElementChild;
            let new_top = false;

            if (this.utils.shouldAnimate()) {

                if ($('show_hide_card_button') && $('show_hide_card_button').classList.contains('shown')) { $('show_hide_card_button').click(); }

                this.utils.updateTitlebar(_('Taking cards from discard pile'));

                let discard_to_display = [];
                let display_to_counter = [];
                let elements = [];
                for (let i=0; i<=1; i++) {

                    const id = reracked_assets[i];
                    const type_arg = this.gamedatas.asset_identifier[id];
                    const asset = this.gamedatas.asset_cards[type_arg];
                    let ele = null;

                    if (discard_top.id != `asset_card_${id}`) {

                        ele = dojo.place(this.format_block('jstpl_asset_card', {
                            CARD_ID : id,
                            EXTRA_CLASSES : '',
                            acX : asset.x_y[0],
                            acY : asset.x_y[1],
                        }), $('asset_discard'), 'first');
                    }
                    
                    else {
                        ele = discard_top;
                        new_top = id;
                        let new_discard_top = false;
                        if (reracked_assets.length != Object.keys(this.asset_discard).length) {
                            while (!new_discard_top) {
        
                                for (const [id, type_arg] of Object.entries(this.asset_discard)) {
        
                                    if (!reracked_assets.includes(id)) {
        
                                        const asset = this.gamedatas.asset_cards[type_arg];
                                        dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : id,
                                            EXTRA_CLASSES : '',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), $('asset_discard'));
        
                                        new_discard_top = true;
                                    }
                                }
                            }
                        }
                    }

                    elements.push(ele);

                    let args = [ele, $(`deck_draw_${i+1}`), 2, true];

                    if (new_top) { discard_to_display.push(this.utils.animationPromise.bind(null, ele, 'asset_discard_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args)); }
                    else { discard_to_display.unshift(this.utils.animationPromise.bind(null, ele, 'asset_discard_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args)); }

                    const ele_origin = ele.parentElement;
                    const hand_counter = $(`hand_counter_${player_id}`);
                    hand_counter.append(ele);
                    const new_width = ele.getBoundingClientRect().width;
                    const new_height = ele.getBoundingClientRect().height;
                    ele_origin.append(ele);
                    ele.style.setProperty('--dw', new_width);
                    ele.style.setProperty('--dh', new_height);
                    args = [ele, hand_counter, null, false, true];
                    display_to_counter.push(this.utils.animationPromise.bind(null, ele, 'asset_display_to_counter', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                }

                $('asset_deck_draw').style.display = 'flex';
                Promise.all(discard_to_display.map(func => { return func(); }))
                .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                .then(() => Promise.all(display_to_counter.map(func => { return func();})))
                .then(async () => {

                    elements.forEach(ele => { ele.remove(); });
                    this.utils.handCount(player_id, notif.args.hand_count);

                    await this.utils.discardPlayedSummitBetaTokens(['1']);
                    $('asset_deck_draw').style.display = '';
                    this.onUndoSummitBeta();
                    this.notifqueue.setSynchronousDuration();
                });
            }

            else { // shouldn't animate
            
                let new_discard_top = false;
                if (reracked_assets.length != Object.keys(this.asset_discard).length) {
                    while (!new_discard_top) {

                        for (const [id, type_arg] of Object.entries(this.asset_discard)) {

                            if (!reracked_assets.includes(id)) {

                                const asset = this.gamedatas.asset_cards[type_arg];
                                dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : id,
                                    EXTRA_CLASSES : '',
                                    acX : asset.x_y[0],
                                    acY : asset.x_y[1],
                                }), $('asset_discard'));

                                new_discard_top = true;
                            }
                        }
                    }
                }

                $('summit_discard').replaceChildren();
                dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : '1',
                    sbX : 0,
                    sbY : 300,
                }), 'summit_discard');

                this.utils.handCount(player_id, notif.args.hand_count);
                this.onUndoSummitBeta();
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_confirmRerackPrivate: async function (notif) {

            this.utils.clicksOff();

            const discard_box = $('discard_box');
            const discard_top = $('asset_discard').firstElementChild;
            const reracked_assets = notif.args.reracked_assets;
            dojo.query('#discard_box .selectable').forEach(ele => { ele.classList.remove('cursor', 'selectable'); });
            dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('selected_resource'); });

            const hand_slots = this.utils.resizeHand('asset', reracked_assets);

            const discard_top_id = discard_top.id.slice(-3).replace(/^\D+/g, '');
            if (reracked_assets.includes(discard_top_id)) {
               
                dojo.query('#asset_discard > .asset')[0].remove();
                let new_discard_top = false;

                if (reracked_assets.length != Object.keys(this.asset_discard).length) {
                    while (!new_discard_top) {

                        for (const [id, type_arg] of Object.entries(this.asset_discard)) {

                            if (!reracked_assets.includes(id)) {

                                const asset = this.gamedatas.asset_cards[type_arg];
                                dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : id,
                                    EXTRA_CLASSES : '',
                                    acX : asset.x_y[0],
                                    acY : asset.x_y[1],
                                }), $('asset_discard'));

                                new_discard_top = true;
                            }
                        }
                    }
                }
            }

            if (this.utils.shouldAnimate()) {

                this.removeActionButtons();
                if ($('show_hide_card_button') && $('show_hide_card_button').classList.contains('shown')) { $('show_hide_card_button').click(); }

                let discard_box_to_hand = [];
                let reracked_card_eles = [];
                for (let i=0; i<=1; i++) {

                    const id = reracked_assets[i];
                    const card = $(`asset_card_${id}`);
                    reracked_card_eles.push(card);
                    const hand_slot = $(`hand_asset_${hand_slots[id]}`);

                    const temp_card = card.cloneNode();
                    hand_slot.append(temp_card);
                    const new_width = temp_card.getBoundingClientRect().width;
                    const new_height = temp_card.getBoundingClientRect().height;
                    temp_card.remove();
                    card.style.setProperty('--dw', `${new_width}px`);
                    card.style.setProperty('--dh', `${new_height}px`);

                    const card_origin_doc = card.getBoundingClientRect();
                    const card_origin_doc_top = card_origin_doc.top;
                    const card_origin_doc_left = card_origin_doc.left;

                    hand_slot.append(card);
                    const card_destination_style = window.getComputedStyle(card);
                    const card_destination_top = Number(card_destination_style.getPropertyValue('top').slice(0, -2));
                    const card_destination_left = Number(card_destination_style.getPropertyValue('left').slice(0, -2));
                    const card_destination_doc = card.getBoundingClientRect();
                    const card_destination_doc_top = card_destination_doc.top;
                    const card_destination_doc_left = card_destination_doc.left;

                    const card_top_diff = card_origin_doc_top - card_destination_doc_top;
                    const card_left_diff = card_origin_doc_left - card_destination_doc_left;

                    card.style.top = `${card_destination_top + card_top_diff}px`;
                    card.style.left = `${card_destination_left + card_left_diff}px`;
                    card.style.setProperty('--dt', `${card_destination_top}px`);
                    card.style.setProperty('--dl', `${card_destination_left}px`);

                    const args = [card, hand_slot];
                    discard_box_to_hand.push(this.utils.animationPromise.bind(null, card, 'discard_box_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                }

                discard_box.style.overflowY = 'visible';
                this.utils.updateTitlebar(_('Taking cards from discard pile'));
                Promise.all(discard_box_to_hand.map(func => { return func(); }))
                .then(async () => {

                    for (const card of reracked_card_eles) {

                        card.style.zIndex = '';
                        card.style.top = '';
                        card.style.left = '';
                    }

                    $('discard_box').remove();
                    const token_id = Object.keys(this.gamedatas.token_identifier).find(id => this.gamedatas.token_identifier[id] === '1');
                    const token_ele = $(`summit_beta_${token_id}`);
                    token_ele.classList.remove('selected_token', 'selectable_token');
                    token_ele.parentElement.classList.remove('selected_token_wrap');
                    token_ele.firstElementChild.classList.remove('click', 'cursor');
                    const args = [token_ele, $('summit_discard')];
                    this.utils.updateTitlebar(_('Discarding Summit Beta token'));
                    await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                    this.utils.updatePlayerResources(this.player_id, notif.args.player_resources);
                    this.utils.handCount(this.player_id, notif.args.hand_count);
                    
                    const asset_deck = dojo.query('#asset_deck')[0];
                    while (asset_deck.firstElementChild) { asset_deck.removeChild(asset_deck.lastElementChild); }

                    if (this.gamedatas.gamestate.name === 'climbingCard') { this.utils.checkClimbingChoices(); }

                    this.utils.resizeHand();
                    this.utils.clicksOn();
                    this.onUndoSummitBeta();
                    this.notifqueue.setSynchronousDuration();
                });
            }

            else { // shouldn't animate
            
                for (let id of reracked_assets) {

                    const type_arg = this.gamedatas.asset_identifier[id];
                    const asset = this.gamedatas.asset_cards[type_arg];
                    const hand_slot = $(`hand_asset_${hand_slots[id]}`);
                    dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : id,
                        EXTRA_CLASSES : '',
                        acX : asset.x_y[0],
                        acY : asset.x_y[1],
                    }), hand_slot);
                }

                $('discard_box').remove();
                const token_id = Object.keys(this.gamedatas.token_identifier).find(id => this.gamedatas.token_identifier[id] === '1');
                const token_ele = $(`summit_beta_${token_id}`);
                token_ele.classList.remove('selected_token', 'selectable_token');
                token_ele.parentElement.classList.remove('selected_token_wrap');
                token_ele.firstElementChild.classList.remove('click', 'cursor', 'selectable_token');
                $('summit_discard').replaceChildren();
                $('summit_discard').append(token_ele);

                this.utils.updatePlayerResources(this.player_id, notif.args.player_resources);
                this.utils.handCount(this.player_id, notif.args.hand_count);
                this.utils.resizeHand();
                    
                const asset_deck = dojo.query('#asset_deck')[0];
                while (asset_deck.firstElementChild) { asset_deck.removeChild(asset_deck.lastElementChild); }

                if (this.gamedatas.gamestate.name === 'climbingCard') { this.utils.checkClimbingChoices(); }

                this.utils.clicksOn();
                this.onUndoSummitBeta();
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_confirmEnergyDrink: async function (notif) {

            this.utils.clicksOff();
            const player_id = notif.args.player_id;
            await this.utils.updateWaterPsych(player_id, 1, 1);

            if (this.isCurrentPlayerActive()) {

                const token_id = Object.keys(this.gamedatas.token_identifier).find(id => this.gamedatas.token_identifier[id] === '4');
                const token_ele = $(`summit_beta_${token_id}`);
                token_ele.classList.remove('selected_token', 'selectable_token');
                token_ele.parentElement.classList.remove('selected_token_wrap');
                token_ele.firstElementChild.classList.remove('click', 'cursor');

                if (this.utils.shouldAnimate()) {

                    if ($('show_hide_card_button') && $('show_hide_card_button').classList.contains('shown')) { $('show_hide_card_button').click(); }

                    const args = [token_ele, $('summit_discard')];
                    this.utils.updateTitlebar(_('Discarding Summit Beta token'));
                    await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                }
                else {

                    $('summit_discard').replaceChildren();
                    $('summit_discard').append(token_ele);
                }

                this.utils.resizeHand();
            }

            else {

                const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : '4',
                    sbX : 300,
                    sbY : 300,
                }), `hand_counter_${player_id}`);
                $('token_display_1').append(token_ele);
                const width = token_ele.getBoundingClientRect().width;
                const height = token_ele.getBoundingClientRect().height;
                $(`hand_counter_${player_id}`).append(token_ele);
                token_ele.style.setProperty('--dw', width);
                token_ele.style.setProperty('--dh', height);

                if (this.utils.shouldAnimate()) {

                    if ($('show_hide_card_button') && $('show_hide_card_button').classList.contains('shown')) { $('show_hide_card_button').click(); }
    
                    $('token_display').style.display = 'flex';
    
                    this.utils.updateTitlebar(_('Discarding Summit Beta token'));
                    let args = [token_ele, $('token_display_1'), null, false, true];
                    await this.utils.animationPromise(token_ele, 'token_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
                    args = [token_ele, $('summit_discard')];
                    await this.utils.animationPromise(token_ele, 'token_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    $('token_display').style.display = '';
                }

                else { // shouldn't animate

                    $('summit_discard').replaceChildren();
                    $('summit_discard').append(token_ele);
                }
            }

            if (this.gamedatas.gamestate.name === 'climbingCard') { this.utils.checkClimbingChoices(); }

            this.utils.clicksOn();
            this.onUndoSummitBeta();
            this.notifqueue.setSynchronousDuration();
        },

        notif_bomberAnchorCleanup: async function (notif) {

            if (this.isCurrentPlayerActive()) {

                $('bomber_anchor_counter').remove();
                for (const key in this.bomber_anchor_selection_handlers) {
                    dojo.disconnect(this.bomber_anchor_selection_handlers[key]);
                }
                delete this.bomber_anchor_selection_handlers;

                const token_id = Object.keys(this.gamedatas.token_identifier).find(id => this.gamedatas.token_identifier[id] === '9');
                const token_ele = $(`summit_beta_${token_id}`);
                token_ele.classList.remove('selected_token', 'selectable_token');
                token_ele.parentElement.classList.remove('selected_token_wrap');
                token_ele.firstElementChild.classList.remove('click', 'cursor');
                
                if (this.utils.shouldAnimate()) {

                    const args = [token_ele, $('summit_discard')];
                    this.utils.updateTitlebar(_('Discarding Summit Beta token'));
                    await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                }
                else {

                    $('summit_discard').replaceChildren();
                    $('summit_discard').append(token_ele);
                }

                this.utils.resizeHand();
            }

            else {

                const player_id = this.getActivePlayerId();

                const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : '9',
                    sbX : 0,
                    sbY : 100,
                }), `hand_counter_${player_id}`);
                $('token_display_1').append(token_ele);
                const width = token_ele.getBoundingClientRect().width;
                const height = token_ele.getBoundingClientRect().height;
                $(`hand_counter_${player_id}`).append(token_ele);
                token_ele.style.setProperty('--dw', width);
                token_ele.style.setProperty('--dh', height);

                if (this.utils.shouldAnimate()) {
    
                    $('token_display').style.display = 'flex';
    
                    let args = [token_ele, $('token_display_1'), null, false, true];
                    await this.utils.animationPromise(token_ele, 'token_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
                    args = [token_ele, $('summit_discard')];
                    await this.utils.animationPromise(token_ele, 'token_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    $('token_display').style.display = '';
                }

                else { // shouldn't animate

                    $('summit_discard').replaceChildren();
                    $('summit_discard').append(token_ele);
                }
            }

            this.onUndoSummitBeta();
            this.notifqueue.setSynchronousDuration();
        },

        notif_discardJesusPiece: async function (notif) {

            this.removeActionButtons();
            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }
            if (notif.args.player_id == this.player_id) { await this.utils.discardPlayedSummitBetaTokens(); }
            else { await this.utils.discardPlayedSummitBetaTokens(['10']); }

            const tokens = this.gamedatas.hand_summit_beta_tokens;
            const token_id = Object.keys(tokens).find(key => tokens[key] === '10');
            delete this.gamedatas.hand_summit_beta_tokens[token_id];

            delete this.jesus_piece_requirements;
            this.notifqueue.setSynchronousDuration();
        },

        notif_retractRiskDie: async function (notif) {

            this.removeActionButtons();

            const die_wrapper = $('die_wrapper');
            const risk_die = $('risk_die');
            const die_face = die_wrapper.lastElementChild;

            // const discardToken = false;
            // if (discardToken && this.isCurrentPlayerActive()) {

            //     const token_id = 0;
            //     delete this.gamedatas.hand_summit_beta_tokens[token_id];

            //     const token_ele = $(`summit_beta_${token_id}`);
            //     if (this.utils.shouldAnimate()) {

            //         const args = [token_ele, $('summit_discard')];
            //         this.utils.updateTitlebar(_('Discarding Summit Beta token(s)'));
			// 		await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
            //     }

            //     else { // shouldn't animate
                    
            //         $('summit_discard').replaceChildren();
            //         $('summit_discard').append(token_ele);
            //     }
            // }

            // else if (discardToken && !this.isCurrentPlayerActive()) {

            //     const player_id = gameui.getActivePlayerId();

            //     const token = this.gamedatas.summit_beta_tokens['11'];
            //     const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
            //         TOKEN_ID : '1',
            //         sbX : token.x_y[0],
            //         sbY : token.x_y[1],
            //     }), `hand_counter_${player_id}`);

            //     if (this.utils.shouldAnimate()) {

            //         $('token_display').style.display = 'flex';
            //         this.utils.updateTitlebar(_('Discarding Summit Beta token(s)'));
            //         let args = [token_ele, $('token_display_1')];
            //         await this.utils.animationPromise(token_ele, 'token_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
            //         await new Promise(resolve => setTimeout(resolve, 1000));
            //         args = [token_ele, $('summit_discard')];
            //         $('token_display').style.zIndex = '9999';
            //         await this.utils.animationPromise(token_ele, 'token_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
            //         $('token_display').style.zIndex = '';
            //         $('token_display').style.display = 'none';
            //     }

            //     else { // shouldn't animate
                    
            //         $('summit_discard').append(token_ele);
            //     }
            // }

            if (this.utils.shouldAnimate()) {
                await this.utils.animationPromise(die_wrapper, 'remove_die', 'anim', null, false, true);
                die_wrapper.classList.remove('roll_die_wrapper');
            }

            else { die_wrapper.style.marginRight = '-77.8vmin'; }
           
            die_face.remove();
            die_wrapper.style.display = '';
            risk_die.style.display = '';

            this.notifqueue.setSynchronousDuration();
        },

        notif_useSpiderStick: async function (notif) {

            const player_id = notif.args.player_id;
            const token = this.gamedatas.summit_beta_tokens['12'];
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const previous_points_tokens = dojo.query(`#character_${character_id} .points_token`).length;
            const wrapper_num = previous_points_tokens + 1;
            const destination = dojo.query(`#player_${player_id} .pw${wrapper_num}`)[0];
            const tokens = this.gamedatas.token_identifier;
            const token_id = Object.keys(tokens).find(key => tokens[key] === '12');
            const summit_discard = $('summit_discard');

            if (this.isCurrentPlayerActive()) { delete this.gamedatas.hand_summit_beta_tokens[token_id]; }

            if (this.utils.shouldAnimate()) {

                this.removeActionButtons();
                this.utils.updateTitlebar(_('Awarding 2-Point Token(s) to '));
                const player_name_span = document.createElement('span');
                player_name_span.id = `${player.name}_span`;
                player_name_span.innerHTML = player.name;
                player_name_span.style.color = this.gamedatas.player_names_and_colors[player_id]['color'];
                $('pagemaintitletext').parentElement.insertBefore(player_name_span, $('pagemaintitletext').nextElementSibling);

                const two_point_token = dojo.place(`<div class="points_token points_${i}"></div>`, 'board', 2);
                this.utils.animationPromise(two_point_token, 'token_appears', 'anim', null, false, false);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1500)) })();

                const args = [two_point_token, destination];
                two_point_token.classList.remove('token_appears');
                two_point_token.style.setProperty('--dr', '25%');
                await this.utils.animationPromise(two_point_token, 'points_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                this.scoreCtrl[player_id].incValue(2);
                player_name_span.remove();

                // discard summit beta token

                this.utils.updateTitlebar(_('Discarding Summit Beta token'));
                if (this.isCurrentPlayerActive()) {

                    const token_ele = $(`summit_beta_${token_id}`);
                    const args = [token_ele, summit_discard];
                    await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                    while (summit_discard.childElementCount > 1) { summit_discard.firstElementChild.remove(); }
                    this.notifqueue.setSynchronousDuration();
                }

                else {

                    $('token_display').style.display = 'flex';
                    const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_id,
                        sbX : token.x_y[0],
                        sbY : token.x_y[1],
                    }), `hand_counter_${player_id}`);
                    $('token_display_1').append(token_ele);
                    const width = token_ele.getBoundingClientRect().width;
                    const height = token_ele.getBoundingClientRect().height;
                    $(`hand_counter_${player_id}`).append(token_ele);
                    token_ele.style.setProperty('--dw', width);
                    token_ele.style.setProperty('--dh', height);
                    let args = [token_ele, $('token_display_1'), null, false, true];
                    await this.utils.animationPromise(token_ele, 'token_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
                    args = [token_ele, summit_discard];
                    await this.utils.animationPromise(token_ele, 'token_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    $('token_display').style.display = '';

                    while (summit_discard.childElementCount > 1) { summit_discard.firstElementChild.remove(); }
                    this.notifqueue.setSynchronousDuration();
                }
            }

            else { // shouldn't animate
                
                dojo.place(`<div class="points_token"></div>`, destination);
                this.scoreCtrl[player_id].incValue(2);

                if (this.isCurrentPlayerActive()) { $('summit_discard').append($(`summit_beta_${token_id}`)); }

                else {
                    const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_id,
                        sbX : token.x_y[0],
                        sbY : token.x_y[1],
                    }), summit_discard);
                }
            
                while (summit_discard.childElementCount > 1) { summit_discard.firstElementChild.remove(); }
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_confirmCrimperClimbingCard: async function (notif) {

            const chosen_id = notif.args.chosen_id;
            const discard_id = notif.args.discard_id;
            const chosen_ele = document.getElementById(`climbing_card_${chosen_id}`);
            const discard_ele = document.getElementById(`climbing_card_${discard_id}`);
            const discard_straightened = document.getElementById('climbing_discard_straightened');
            const climbing_discard = document.getElementById('climbing_discard');
            const climbing_slot = document.getElementById('climbing_slot');
            const crimper_display = document.getElementById('crimper_display');
            const chosen_type_arg = notif.args.chosen_type_arg;

            $('climbing_dimmer').classList.remove('dim_bg');
            climbing_slot.style.display = 'block';
            chosen_ele.classList.remove('selected_asset');
            for (let ele of [...$('crimper_display').children]) { ele.style.left = ''; }
            chosen_ele.onclick = null;
            discard_ele.onclick = null;
            chosen_ele.classList.remove('cursor');
            discard_ele.classList.remove('cursor');
            this.climbing_card_choice_handlers = [];

            this.gamedatas.current_state = ['2', '6', '36', '41', '50', '54', '63'].includes(chosen_type_arg) ? 'addTokenToPitch' : 'climbingCard';

            if (this.utils.shouldAnimate()) {

                let chosen_direction = null;
                if (chosen_ele.id === $('crimper_display_1').firstElementChild.id) { chosen_direction = 'left'; }
                else if (chosen_ele.id === $('crimper_display_2').firstElementChild.id) { chosen_direction = 'right'; }

                // discard unchosen card
                this.utils.updateTitlebar(_('Discarding extra Climbing Card'));

                let start_pos = discard_ele.getBoundingClientRect();
                discard_straightened.append(discard_ele);
                let end_pos = discard_ele.getBoundingClientRect();
                let x_diff = Math.abs(end_pos.left - start_pos.left);
                let y_diff = -(end_pos.top - start_pos.top);

                dojo.setStyle(discard_ele.id, {
                    'top' : `${y_diff}px`,
                    'left' : `${x_diff}px`,
                    'width' : `${start_pos.width}px`,
                    'height' : `${start_pos.height}px`
                });
                discard_ele.style.setProperty('--dw', `${end_pos.width}px`);
                discard_ele.style.setProperty('--dh', `${end_pos.height}px`);

                const discard_args = [discard_ele, discard_straightened];
                climbing_discard.style.zIndex = '202';
                await this.utils.animationPromise(discard_ele, 'climbing_card_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...discard_args);
                dojo.setStyle(discard_ele.id, {
                    'top' : '',
                    'left' : '',
                    'width' : '',
                    'height' : ''
                });

                await this.utils.animationPromise(discard_ele, 'climbing_card_discard', 'anim', null, false, true);
                $('climbing_discard_90').append(discard_ele);
                discard_ele.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
                this.utils.cleanClimbingDiscardPile();

                // move chosen card to climbing_slot
                start_pos = chosen_ele.getBoundingClientRect();
                climbing_slot.append(chosen_ele);
                end_pos = chosen_ele.getBoundingClientRect();
                x_diff = Math.abs(end_pos.left - start_pos.left);
                if (chosen_direction === 'left') { x_diff = -x_diff; }
                y_diff = -(end_pos.top - start_pos.top);

                dojo.setStyle(chosen_ele.id, {
                    'top' : `${y_diff}px`,
                    'left' : `${x_diff}px`,
                    'width' : `${start_pos.width}px`,
                    'height' : `${start_pos.height}px`
                });
                chosen_ele.style.setProperty('--dw', `${end_pos.width}px`);
                chosen_ele.style.setProperty('--dh', `${end_pos.height}px`);

                const chosen_args = [chosen_ele, climbing_slot];
                await this.utils.animationPromise(chosen_ele, 'climbing_card_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...chosen_args);
                dojo.setStyle(chosen_ele.id, {
                    'top' : '',
                    'left' : '',
                    'width' : '',
                    'height' : ''
                });
                $('climbing_dimmer').classList.add('dim_bg');

                if (this.isCurrentPlayerActive()) {
                    const choice_top = $(`${chosen_id}_top`);
                    const choice_bottom = $(`${chosen_id}_bottom`);
                    this.climbing_card_choice_handlers[0] = dojo.connect(choice_top, 'onclick', this, 'onSelectClimbingCardChoice');
                    this.climbing_card_choice_handlers[1] = dojo.connect(choice_bottom, 'onclick', this, 'onSelectClimbingCardChoice');
                    choice_top.classList.add('cursor');
                    choice_bottom.classList.add('cursor');
                }

                crimper_display.style.display = '';
                while (summit_discard.childElementCount > 1) { summit_discard.firstElementChild.remove(); }

                if (!['2', '6', '36', '41', '50', '54', '63'].includes(chosen_type_arg)) { this.utils.checkClimbingChoices(); }
                this.notifqueue.setSynchronousDuration();
            }
            
            else { // shouldn't animate
            
                $('climbing_discard_90').append(discard_ele);
                climbing_slot.append(chosen_ele);
                crimper_display.style.display = '';
                this.utils.cleanClimbingDiscardPile();

                if (this.isCurrentPlayerActive()) {
                    const choice_top = $(`${chosen_id}_top`);
                    const choice_bottom = $(`${chosen_id}_bottom`);
                    this.climbing_card_choice_handlers[0] = dojo.connect(choice_top, 'onclick', this, 'onSelectClimbingCardChoice');
                    this.climbing_card_choice_handlers[1] = dojo.connect(choice_bottom, 'onclick', this, 'onSelectClimbingCardChoice');
                    choice_top.classList.add('cursor');
                    choice_bottom.classList.add('cursor');
                }

                if (!['2', '6', '36', '41', '50', '54', '63'].includes(chosen_type_arg)) { this.utils.checkClimbingChoices(); }
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_undoClimbingCleanup: function (notif) {
            const player_id = this.getActivePlayerId();
            const character = this.gamedatas.player_names_and_colors[player_id]['character'];
            if (character === '10') { $('climbing_slot').firstElementChild.remove(); }
        },

        notif_updateFinalPersonalObjectivesTracker: function (notif) {
            this.gamedatas.personal_objectives_tracker = notif.args.final_personal_objectives_tracker;
        },

        notif_preGameEnd: function (notif) {

            const score_tracker = notif.args.score_tracker;
            const scored_personal_objectives = notif.args.scored_personal_objectives;
            const personal_objectives_tracker = notif.args.personal_objectives_tracker;
            const players = this.gamedatas.player_names_and_colors;
            const titlebar_addon = $('titlebar_addon');
            const toggles_wrap = $('toggles_wrap');
            const personal_objectives_toggle = $('personal_objectives_toggle');

            const opponent_objectives_box = document.createElement('div');
            opponent_objectives_box.id = 'opponent_objectives_box';
            opponent_objectives_box.style.display = 'none';
            titlebar_addon.append(opponent_objectives_box);
            let pos_num = 1;
            for (const [player_id, objectives] of Object.entries(personal_objectives_tracker)) {

                if (player_id != this.player_id) {
                    const player_objectives_wrap = document.createElement('div');
                    player_objectives_wrap.id = `opponent_objectives_${pos_num}`;
                    player_objectives_wrap.classList.add('opponent_objectives_wrap');
                    opponent_objectives_box.append(player_objectives_wrap);
                    const player = this.gamedatas.players[player_id];
                    const name_span = dojo.place(this.format_block('jstpl_colored_name', {
                        player_id : player_id,
                        color : player.color,
                        player_name : player.name,
                    }), player_objectives_wrap);
                    name_span.style.display = 'block';
                    name_span.classList.add('opponent_objectives_name');

                    for (const objective_id of Object.keys(objectives)) {
                        const objective = this.gamedatas.personal_objectives[objective_id];
                        const coords = objective['x_y'];
                        const objective_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                            poId : `${objective_id}_opponent`,
                            poX : coords[0],
                            poY : coords[1],
                        }), player_objectives_wrap);
                        objective_ele.classList.add('opponent_objective_card');
                        const starting_top = objective['opponent_view_check_top'];

                        for (let index of personal_objectives_tracker[player_id][objective_id]) {
                            const check = document.createElement('div');
                            check.classList.add('check');
                            check.innerHTML = '\u2713';
                            objective_ele.append(check);
                            const check_top = starting_top + 5.88 * index;
                            check.style.top = `${check_top}%`;
                        }
                        this.utils.personalObjectiveTooltip(objective_ele.id, objective_id);
                    }
                    pos_num++;
                }
            }

            for (const [player_id, objective_id] of Object.entries(scored_personal_objectives)) {
                if (objective_id) {
                    const objective = this.gamedatas.personal_objectives[objective_id];
                    this.scoreCtrl[player_id].incValue(objective.score);
                    const player = this.gamedatas.players[player_id];

                    if (player_id != this.player_id) {
                        $(`personal_objective_${objective_id}_opponent`).style.border = `4px solid #${player.color}`;
                    }
                }
            }

            const scorecard = document.createElement('div');
            scorecard.id = 'scorecard';
            titlebar_addon.append(scorecard);
            $('climbing_dimmer').classList.add('dim_bg');

            const table = document.createElement('table');
            table.id = 'score_table';
            const table_body = document.createElement('tbody');
            for (let i=0; i<6; i++) {
                const row = document.createElement('tr');
                for (let j=0; j<6; j++) {
                    const cell = document.createElement('td');
                    cell.id = `${j}_${i}`;
                    if (j === 0) { cell.classList.add('first_column'); }
                    else { cell.classList.add('player_column'); }
                    row.append(cell);
                }
                table_body.append(row);
            }
            table.append(table_body);
            scorecard.append(table);

            let i = 1;
            for (const [id, info] of Object.entries(players)) {

                const name_cell = $(`${i}_0`);
                this.utils.fitStringToCell(info['name'], name_cell);
                name_cell.style.color = info['color'];

                const pitches_cell = $(`${i}_1`);
                pitches_cell.innerHTML = score_tracker[id]['pitches'];

                const objectives_cell = $(`${i}_2`);
                objectives_cell.innerHTML = score_tracker[id]['objectives'];

                const tokens_cell = $(`${i}_3`);
                tokens_cell.innerHTML = score_tracker[id]['tokens'];

                const summit_cell = $(`${i}_4`);
                summit_cell.innerHTML = score_tracker[id]['summit'];

                const total_cell = $(`${i}_5`);
                total_cell.innerHTML = score_tracker[id]['pitches'] + score_tracker[id]['objectives']
                           + score_tracker[id]['tokens'] + score_tracker[id]['summit'];

                i++;
            }

            const scorecard_toggle = document.createElement('div');
            scorecard_toggle.id = 'scorecard_toggle';
            scorecard_toggle.innerHTML = _('Hide<br>Scorecard');
            scorecard_toggle.classList.add('addon_on', 'always_cursor', 'toggle');
            toggles_wrap.insertBefore(scorecard_toggle, personal_objectives_toggle);
            scorecard_toggle.onclick = (evt) => { this.utils.toggleScorecard(evt); }

            const opponent_objectives_toggle = document.createElement('div');
            opponent_objectives_toggle.id = 'opponent_objectives_toggle';
            opponent_objectives_toggle.innerHTML = _('Show Opponent<br>Objectives');
            opponent_objectives_toggle.classList.add('addon_off', 'always_cursor', 'toggle');
            toggles_wrap.insertBefore(opponent_objectives_toggle, scorecard_toggle);
            opponent_objectives_toggle.onclick = (evt) => { this.utils.toggleOpponentObjectives(evt); }

            this.utils.updateTitlebarAddon('Game End', 'phase');
            this.utils.addTooltipsToLog();

            this.notifqueue.setSynchronousDuration();
        },
    });
});