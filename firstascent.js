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
    getLibUrl('bga-autofit', '1.x'),
    "ebg/core/gamegui",
    "ebg/counter",
    g_gamethemeurl + "modules/utils.js"
],
function (dojo, declare, aspect, BgaAutofit) {
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

            // setup globals
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
            this.disabled_opponent_buttons = [];

            // click handlers
            this.climbing_card_choice_handlers = [];
            this.character_handlers = [];
            this.asset_handlers = [];
            this.pitch_handlers = [];
            this.resting_selection_handlers = [];
            this.portaledge_selection_handlers = [];
            this.asset_selection_handlers = [];
            this.token_selection_handlers = [];
            this.resource_handlers = [];
            this.trade_handlers = [];
            this.rerack_handlers = [];
            this.simul_climb_handlers = [];
            this.bomber_anchor_selection_handlers = [];

            // FOR STUDIO ONLY
            // if (gamedatas.phase === 'Setup') {
            //     localStorage.removeItem('load_1');
            //     localStorage.removeItem('load_2');
            //     localStorage.removeItem('load_3');
            // }
            // const save_1 = document.getElementById('debug_save1');
            // const load_1 = document.getElementById('debug_load1');
            // const save_2 = document.getElementById('debug_save2');
            // const load_2 = document.getElementById('debug_load2');
            // const save_3 = document.getElementById('debug_save3');
            // const load_3 = document.getElementById('debug_load3');
            // save_1.onclick = (evt) => {
            //     const move_counter = document.getElementById('move_nbr');
            //     const move_num = move_counter.innerHTML;
            //     load_1.innerHTML = `#${move_num}`;
            //     load_1.style.textAlign = 'center';
            //     localStorage.setItem('load_1', String(move_num));
            // }
            // if (localStorage.getItem('load_1')) {
            //     load_1.innerHTML = `#${localStorage.getItem('load_1')}`;
            //     load_1.style.textAlign = 'center';
            // }
            // save_2.onclick = (evt) => {
            //     const move_counter = document.getElementById('move_nbr');
            //     const move_num = move_counter.innerHTML;
            //     load_2.innerHTML = `#${move_num}`;
            //     load_2.style.textAlign = 'center';
            //     localStorage.setItem('load_2', String(move_num));
            // }
            // if (localStorage.getItem('load_2')) {
            //     load_2.innerHTML = `#${localStorage.getItem('load_2')}`;
            //     load_2.style.textAlign = 'center';
            // }
            // save_3.onclick = (evt) => {
            //     const move_counter = document.getElementById('move_nbr');
            //     const move_num = move_counter.innerHTML;
            //     load_3.innerHTML = `#${move_num}`;
            //     load_3.style.textAlign = 'center';
            //     localStorage.setItem('load_3', String(move_num));
            // }
            // if (localStorage.getItem('load_3')) {
            //     load_3.innerHTML = `#${localStorage.getItem('load_3')}`;
            //     load_3.style.textAlign = 'center';
            // }
            // END STUDIO SECTION

            // pre-loaded for rendering/style calculation
            const pre_loaded_sprites = document.createElement('div');
            pre_loaded_sprites.id = 'pre_loaded_sprites';
            const gear_border_sprite = '<div class="requirement_wrap gear_wrap"><div class="gear_border requirement_border"></div><div class="skills_and_techniques" style="background-position: -800% 0%;"></div></div>';
            const skill_border_sprite = '<div class="requirement_wrap slab_wrap"><div class="skill_border requirement_border"></div><div class="skills_and_techniques" style="background-position: -700% 0%;"></div></div>';
            const water_psych_border_sprite = '<div class="requirement_wrap water_wrap"><div class="water_psych_border requirement_border"></div><div class="water_psych" style="background-position: -400% 0%;"></div></div>';
            const ref_1_sprite = '<div id="ref_1" class="reference"></div>';
            const ref_2_sprite = '<div id="ref_2" class="reference"></div>';
            pre_loaded_sprites.insertAdjacentHTML('beforeend', gear_border_sprite);
            pre_loaded_sprites.insertAdjacentHTML('beforeend', skill_border_sprite);
            pre_loaded_sprites.insertAdjacentHTML('beforeend', water_psych_border_sprite);
            pre_loaded_sprites.insertAdjacentHTML('beforeend', ref_1_sprite);
            pre_loaded_sprites.insertAdjacentHTML('beforeend', ref_2_sprite);
            $('board').append(pre_loaded_sprites);

            // attach the titlebar addon
            if (!$('titlebar_addon')) {
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
            }

            if (!$('toggles_wrap')) {
                const toggles_wrap = document.createElement('div');
                toggles_wrap.id = 'toggles_wrap';
                $('titlebar_addon').append(toggles_wrap);
            }

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

            // Spectator
            if (this.isSpectator) {
                // remove hand
                $('hand_title').remove();
            }

            // Setting up player panels and board state
            for( const player_id in gamedatas.players )
            {
                const player = gamedatas.players[player_id];
                const player_panel_div = $(`player_board_${player_id}`);

                // place in my panel only
                if (this.player_id === Number(player_id)) {

                    // starting skills
                    const skills_title = _('Skills');
                    dojo.place(`<div id="cp_skills_title" style="font-size: 10px; margin-bottom: 5px;">${skills_title}</div>`, 
                        player_panel_div);
                    dojo.place(this.format_block('jstpl_skills', {
                        player_id : player_id,
                    }), player_panel_div);

                    // starting techniques
                    const techniques_title = _('Techniques');
                    dojo.place(`<div id="cp_techniques_title" style="font-size: 10px; margin-bottom: 5px;">${techniques_title}</div>`, 
                        player_panel_div);
                    dojo.place(this.format_block('jstpl_techniques', {
                        player_id : player_id,
                    }), player_panel_div);

                    // tracked resources
                    this.utils.updatePlayerResources(player_id, gamedatas.resource_tracker);
                }

                // starting water and psych
                const water_and_psych = dojo.place(this.format_block('jstpl_water_and_psych', {
                    player_id : player_id
                }), player_panel_div, 8);
                if (this.player_id !== Number(player_id)) {
                    water_and_psych.classList.add('opponent_w_and_p');
                }

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
                const pitch_sets = gamedatas.pitch_sets[player_id];
                const rope_only_sets = this.utils.removeBacktrackPitchSets(pitch_sets);
                const pitches_rope_order = gamedatas.pitches_rope_order;
                const bailed_pitch = gamedatas.bailed_pitch[player_id];

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
                        const meeple_destination = `${player_id}_water_and_psych`;
                        dojo.place(meeple, meeple_destination);
                    }
                    else { 
                        const ledge_teleports = gamedatas.ledge_teleports[player_id];
                        const rope_overlaps = gamedatas.rope_overlaps[player_id];

                        for (let i=0; i<=rope_only_sets.length-1; i++) {
                            const rope_num = i+1;
                            const current_pitch_id = rope_only_sets[i][1];
                            const previous_pitch_id = rope_only_sets[i][0];
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

                            if (i === rope_only_sets.length-1 && bailed_pitch === null) {
                                dojo.place(meeple, `pitch_${current_pitch_id}`);
                                const meeple_ele = $(`meeple_${player_id}`);
                                meeple_ele.addEventListener('mouseover', this.utils.highlightRoute);
                                meeple_ele.addEventListener('mouseout', this.utils.unHighlightRoute);
                            }
                        } 
                    }
                    const meeple_id = `meeple_${player_id}`;
                    this.addTooltipHtml(meeple_id, _('Climber'), 500);
                    if (bailed_pitch) {
                        if (bailed_pitch === '0') {
                            if (player_id == this.player_id) { dojo.place(meeple, $('ref_row')); }
                            else { dojo.place(meeple, $(`${player_id}_water_and_psych`)); }
                        }
                        else { dojo.place(meeple, $(`pitch_${bailed_pitch}`)); }
                        const meeple_ele = $(`meeple_${player_id}`);
                        meeple_ele.addEventListener('mouseover', this.utils.highlightRoute);
                        meeple_ele.addEventListener('mouseout', this.utils.unHighlightRoute);
                    }
                }
            }
            // Add drawer button for The Trifecta
            const trifecta_ele = $('board').querySelector('.p36');
            const trifecta_button_html = `
                <div id="trifecta_drawer_toggle" class="corner_toggle">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 100 0 L 100 100 L 0 100 Z" fill="rgba(0,0,0,0.7)" />
                        <path d="M 65 60 L 85 60 L 75 85 Z" fill="white" />
                    </svg>
                </div>
                <div id="trifecta_types_drawer">
                    <span id="trifecta_drawer_title">Trifecta types:</span>
                </div>
            `;
            trifecta_ele.insertAdjacentHTML('beforeend', trifecta_button_html);
            trifecta_ele.onclick = (evt) => { this.utils.toggleTrifectaTypesDrawer(evt); }
            const trifecta_rope_hub = $('board').querySelector('.p36').firstElementChild;
            if (trifecta_rope_hub.children.length > 0) {
                $('trifecta_drawer_toggle').style.display = 'block';
            }
            const trifecta_types_drawer = $('trifecta_types_drawer');
            const trifecta_routes = gamedatas.trifecta_routes;
            for (const [player_id, info] of Object.entries(trifecta_routes)) {
                const player = gamedatas.players[player_id];
                const name_span = this.format_block('jstpl_colored_name', {
                    player_id : player_id,
                    color : `#${player.color}`,
                    player_name : player.name,
                });
                const trifecta_types_lower = `: ${info['exposure']} ${info['type']}`;
                const trifecta_types_string = trifecta_types_lower.replace(/\b\w/g, char => char.toUpperCase());
                const new_types_span = document.createElement('span');
                new_types_span.classList.add('trifecta_types_span');
                new_types_span.innerHTML = trifecta_types_string;
                const player_span = document.createElement('div');
                player_span.classList.add('trifecta_drawer_row');
                player_span.insertAdjacentHTML('afterbegin', name_span);
                player_span.append(new_types_span);
                trifecta_types_drawer.append(player_span);
            }

            // Starting player token
            const starting_player = gamedatas.starting_player;
            const token_destination = $(`${starting_player}_water_and_psych`);
            const starting_player_token = dojo.place(this.format_block('jstpl_starting_player', {}), token_destination);
            const title = _('First player');
            const text1 = _('Take turns <strong>clockwise</strong>');
            const text2 = _('End of Rerack Phase:');
            const text3 = _('pass this token <strong>right</strong>');
            const starting_player_tooltip = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                                             <div class="pitch pitch_tt" style="background-position: -1200% -0%; margin-bottom: 5px;"></div>
                                             <div>${text1}<br><br>${text2}<br>${text3}</div>`;
            this.addTooltipHtml(`${starting_player_token.id}`, starting_player_tooltip, 1000);

            // Place player_table_status at bottom of panel
            document.querySelectorAll('.player_table_status').forEach(ele => {
                const pts_parent = ele.parentElement;
                pts_parent.append(ele);
            });

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
            else { summit_beta_coords = [36.2, 2.27]; }                        // Forest board
            const summit_beta_pile = dojo.place(this.format_block('jstpl_summit_pile', {
                summit_pile_top : summit_beta_coords[0],
                summit_pile_left : summit_beta_coords[1]
            }), 'board', 1);
            if (gamedatas.empty_summit_beta_pile) { summit_beta_pile.style.visibility = 'hidden'; }

            let summit_beta_discard_coords;
            if (this.player_count <= 3) { summit_beta_discard_coords = [36.2, 12.3]; } // Desert board
            else { summit_beta_discard_coords = [36.2, 12.6]; }                        // Forest board
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
            if (this.player_count <= 3) {               // Desert board
                climbing_deck_coords = [-2.82, 5.38];
                climbing_discard_coords = [13.8, 5.38];
            }
            else {                                      // Forest board
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
                const climbing_discard_top = dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : gamedatas.climbing_discard_top_card.id,
                    ccX : climbing_card.x_y[0],
                    ccY : climbing_card.x_y[1],
                    a_height : climbing_card.height_top_a[0],
                    a_top : climbing_card.height_top_a[1],
                    b_height : climbing_card.height_top_b[0],
                    b_top : climbing_card.height_top_b[1],
                }), 'climbing_discard_90');
                this.utils.climbingTooltip(climbing_discard_top.id, climbing_card_type_arg);
            }
            if (Object.keys(gamedatas.climbing_in_play).length > 0 && gamedatas.current_state != 'crimperClimbingCards') {
                const climbing_type_arg = Object.values(gamedatas.climbing_in_play)[0];
                const climbing_card = gamedatas.climbing_cards[climbing_type_arg];
                const climbing_retracted = dojo.place(this.format_block('jstpl_climbing_card', {
                    CARD_ID : Object.keys(gamedatas.climbing_in_play)[0],
                    ccX : climbing_card.x_y[0],
                    ccY : climbing_card.x_y[1],
                    a_height : climbing_card.height_top_a[0],
                    a_top : climbing_card.height_top_a[1],
                    b_height : climbing_card.height_top_b[0],
                    b_top : climbing_card.height_top_b[1],
                }), 'climbing_discard_straightened');
                this.utils.climbingTooltip(climbing_retracted.id, climbing_type_arg);
            }

            // remove the extra climbing slot added when undoing a climbing card
            const climbing_slots = document.querySelectorAll('#climbing_slot');
            if (climbing_slots.length > 1) {
                climbing_slots.forEach(ele => {
                    if (ele !== climbing_slots[0]) {
                        ele.remove();
                    }
                });
            }
            const climbing_slot = $('climbing_slot');
            const phase_tracker = $('phase_tracker');
            phase_tracker.parentElement.insertBefore(climbing_slot, phase_tracker.nextElementSibling);


        // Reference cards
            const reference_button = $('reference_cards');
            const reference_popup = $('reference_popup');
            reference_button.onclick = (evt) => { this.onShowHideReferenceCards(evt); }
            phase_tracker.parentElement.insertBefore(reference_popup, phase_tracker.nextElementSibling);


        // Trifecta type selection box
            if (!$('trifecta_box')) {
                const trifecta_box = document.createElement('div');
                trifecta_box.id = 'trifecta_box';
                titlebar_addon.append(trifecta_box);

                const trifecta_title = document.createElement('div');
                trifecta_title.id = 'trifecta_title';
                trifecta_title.innerHTML = _('The Trifecta');
                trifecta_box.append(trifecta_title);

                const exposure_title = document.createElement('span');
                exposure_title.id = 'exposure_title';
                exposure_title.innerHTML = _('Exposure:');
                trifecta_box.append(exposure_title);

                const sunny_button = document.createElement('div');
                sunny_button.id = 'sunny_button';
                sunny_button.innerHTML = _('Sunny');
                sunny_button.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                sunny_button.classList.add('trifecta_button', 'always_cursor', 'tri_exposure');
                trifecta_box.append(sunny_button);

                const shaded_button = document.createElement('div');
                shaded_button.id = 'shaded_button';
                shaded_button.innerHTML = _('Shaded');
                shaded_button.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                shaded_button.classList.add('trifecta_button', 'always_cursor', 'tri_exposure');
                trifecta_box.append(shaded_button);

                const type_title = document.createElement('span');
                type_title.id = 'type_title';
                type_title.innerHTML = _('Type:');
                trifecta_box.append(type_title);

                const arete_button = document.createElement('div');
                arete_button.id = 'arete_button';
                arete_button.innerHTML = _('Arete');
                arete_button.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                arete_button.classList.add('trifecta_button', 'always_cursor', 'tri_type');
                trifecta_box.append(arete_button);

                const corner_button = document.createElement('div');
                corner_button.id = 'corner_button';
                corner_button.innerHTML = _('Corner');
                corner_button.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                corner_button.classList.add('trifecta_button', 'always_cursor', 'tri_type');
                trifecta_box.append(corner_button);

                const slab_button = document.createElement('div');
                slab_button.id = 'slab_button';
                slab_button.innerHTML = _('Slab');
                slab_button.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                slab_button.classList.add('trifecta_button', 'always_cursor', 'tri_type');
                trifecta_box.append(slab_button);

                const flake_button = document.createElement('div');
                flake_button.id = 'flake_button';
                flake_button.innerHTML = _('Flake');
                flake_button.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                flake_button.classList.add('trifecta_button', 'always_cursor', 'tri_type');
                trifecta_box.append(flake_button);

                const roof_button = document.createElement('div');
                roof_button.id = 'roof_button';
                roof_button.innerHTML = _('Roof');
                roof_button.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                roof_button.classList.add('trifecta_button', 'always_cursor', 'tri_type');
                trifecta_box.append(roof_button);

                const crack_button = document.createElement('div');
                crack_button.id = 'crack_button';
                crack_button.innerHTML = _('Crack');
                crack_button.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                crack_button.classList.add('trifecta_button', 'always_cursor', 'tri_type');
                trifecta_box.append(crack_button);

                const trifecta_confirm = document.createElement('div');
                trifecta_confirm.id = 'trifecta_confirm_button';
                trifecta_confirm.innerHTML = _('Confirm');
                trifecta_confirm.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                trifecta_confirm.classList.add('trifecta_button', 'always_cursor');
                trifecta_box.append(trifecta_confirm);

                const trifecta_hide = document.createElement('div');
                trifecta_hide.id = 'trifecta_hide_button';
                trifecta_hide.innerHTML = 'X';
                trifecta_hide.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                trifecta_hide.classList.add('trifecta_button', 'always_cursor');
                trifecta_box.append(trifecta_hide);

                const trifecta_selected_box = document.createElement('div');
                trifecta_selected_box.id = 'trifecta_selected_box';
                const trifecta_title_clone = trifecta_title.cloneNode(true);
                trifecta_title_clone.id = 'trifecta_title_clone';
                trifecta_selected_box.append(trifecta_title_clone);
                titlebar_addon.append(trifecta_selected_box);
                
                const trifecta_undo = document.createElement('div');
                trifecta_undo.id = 'trifecta_undo_button';
                trifecta_undo.innerHTML = _('Undo');
                trifecta_undo.onclick = (evt) => { this.utils.chooseTrifectaOption(evt); }
                trifecta_undo.classList.add('trifecta_button', 'always_cursor');
                trifecta_selected_box.append(trifecta_undo);
            }

        // Set up the asset deck and spread

            // place asset deck and discard

            let asset_deck_coords;
            if (this.player_count <= 3) { asset_deck_coords = [0.1, 90.4]; } // Desert board
            else { asset_deck_coords = [0.5, 89.85]; }                       // Forest board
            const asset_deck = dojo.place(this.format_block('jstpl_asset_deck', {
                asset_deckX : asset_deck_coords[0],
                asset_deckY : asset_deck_coords[1]
            }), 'board', 5);
            this.addTooltipHtml(asset_deck.id, _('Asset deck'), 500);

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

            for (let i=0; i<=3; i++) {

                const card_info = Object.values(spread_cards)[i];
                const card_id = card_info['card_id'];
                const card_type_arg = card_info['card_type_arg'];
                const card = gamedatas.asset_cards[card_type_arg];
                const slot_num = card_info['card_location_arg'];
                const spread_slot = `spread_slot${slot_num}`;

                if (card_id) {
                    const x = card['x_y'][0];
                    const y = card['x_y'][1];
                    const card_ele = dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : card_id,
                        EXTRA_CLASSES : 'spread_asset',
                        acX : x,
                        acY : y,
                    }), spread_slot);
                    this.utils.assetTooltip(card_ele.id, card_type_arg);
                }
            }

        // Hand

            if (!this.isSpectator) {
                const player_assets = gamedatas['hand_assets'];
                const card_ids = Object.keys(player_assets);
                const asset_num = card_ids.length;

                const player_summit_beta_tokens = gamedatas.player_token_tracker;
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

                // 1. Reset/Initialize a continuous counter for ALL tokens
                let token_slot_idx = 1; 

                // 2. Process Summit Beta Tokens
                // Use Object.values to get the IDs and ignore the keys/indices
                Object.values(player_summit_beta_tokens).forEach(id => {
                    const type_arg = gamedatas.token_identifier[id];
                    const token = gamedatas.summit_beta_tokens[type_arg];
                    const wrapper_id = `hand_token_${token_slot_idx}`;

                    dojo.place(`<div id="${wrapper_id}" class="hand_token_wrap"></div>`, 'assets_wrap');
                    const token_div = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : id,
                        sbX : token.x_y[0],
                        sbY : token.x_y[1],
                    }), wrapper_id);

                    this.utils.initSummitBetaToken(token_div, type_arg);
                    
                    // Move to the next slot for the next token
                    token_slot_idx++; 
                });

                // 3. Process Symbol Tokens
                for (const [symbol, num] of Object.entries(player_symbol_tokens)) {
                    for (let i = 1; i <= num; i++) {
                        const wrapper_id = `hand_token_${token_slot_idx}`;
                        const new_token_dom_id = dojo.query('#assets_wrap .symbol_token').length + 1;

                        dojo.place(`<div id="${wrapper_id}" class="hand_token_wrap"></div>`, 'assets_wrap');
                        dojo.place(`<div id="${symbol}_token_${new_token_dom_id}" class="${symbol}_token symbol_token"></div>`, wrapper_id);
                        
                        // Continue incrementing the SAME counter
                        token_slot_idx++; 
                    }
                }

                // 4. Finalize Layout
                // Run resizeHand immediately at the end of setup rather than window.onload
                this.utils.resizeHand();
                if ($('final_round_msg')) { $('final_round_msg').classList.add('pulse'); }

                window.onload = (evt) => {
                    this.utils.resizeHand();
                    if ($('final_round_msg')) { $('final_round_msg').classList.add('pulse'); }
                }

            } else {
                $('hand_ratio').remove();
                if ($('final_round_msg')) { $('final_round_msg').classList.add('pulse'); }
            }
 
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

            if (gamedatas.available_characters.length > 1 + gamedatas.zombie_players.length) {

                for (const character_id of gamedatas.available_characters) {
                    const character = gamedatas.characters[character_id];
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
                    }), 'character_selection');

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

                    dojo.place(this.format_block('jstpl_cube', {
                        character : character_name,
                        type : 'water',
                    }), $(`${character_name}_w${water_psych}`));
                    dojo.place(this.format_block('jstpl_cube', {
                        character : character_name,
                        type : 'psych',
                    }), $(`${character_name}_p${water_psych}`));

                    // tooltip
                    const description = dojo.string.substitute("${description}", { description: character['description'] });
                    const flavor = dojo.string.substitute("${flavor}", { flavor: character['flavor'] });
                    const ability = dojo.string.substitute("${ability}", { ability: character['ability'] });
                    const home_crag = dojo.string.substitute("${home_crag}", { home_crag: character['home_crag'] });
                    const native_lands = dojo.string.substitute("${native_lands}", { native_lands: character['native_lands'] });
                    const html = `<div style="margin-bottom: 5px;"><strong>${description}</strong></div>
                                <p>${flavor} - ${ability}</p>
                                <p>${_('Starting Water/Psych')}: ${character['water_psych']}</p>
                                <span>${_('Home Crag')}: ${home_crag}</span>
                                <span style="font-size: 10px; white-space: nowrap;"><i>${native_lands}</i></span>`;
                    this.addTooltipHtml(`character_${character_id}`, html, 1000);
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
                    else if (character_name === 'cool-headed_crimper' && document.querySelector('#crimper_display')) { // for undo Climbing Card
                        $('climbing_slot').parentElement.insertBefore($('crimper_display'), $('climbing_slot').nextElementSibling);
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

                        if (character_name === 'cool-headed_crimper' && !document.querySelector('#crimper_display')) {
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
                        else if (character_name === 'cool-headed_crimper' && document.querySelector('#crimper_display')) { // for undo Climbing Card
                            $('climbing_slot').parentElement.insertBefore($('crimper_display'), $('climbing_slot').nextElementSibling);
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

                // add Point Tokens
                const points_tokens = gamedatas.asset_board_token_tracker[player_id]['points_tokens'];
                const four_point_tokens = points_tokens <= 8 ? 0 : points_tokens - 8;
                const two_point_tokens = points_tokens <= 8 ? points_tokens : 8 - four_point_tokens;
                for (let i=1; i<=four_point_tokens; i++) {

                    const destination = dojo.query(`#player_${player_id} .pw${i}`)[0];
                    dojo.place(`<div class="points_token four_points_token"></div>`, destination);
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
                const current_personal_objectives = gamedatas.current_personal_objectives;
                const objective_1_type_arg = current_personal_objectives[0];
                const objective_2_type_arg = current_personal_objectives[1];
                const objective_1 = gamedatas.personal_objectives[objective_1_type_arg];
                const objective_2 = gamedatas.personal_objectives[objective_2_type_arg];
                const po_coords_1 = objective_1['x_y'];
                const po_coords_2 = objective_2['x_y'];
                const objective_1_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                    poId : objective_1_type_arg,
                    poX : po_coords_1[0],
                    poY : po_coords_1[0],
                }), 'personal_objective_1_wrap');
                const objective_2_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                    poId : objective_2_type_arg,
                    poX : po_coords_2[0],
                    poY : po_coords_2[0],
                }), 'personal_objective_2_wrap');

                const po_tracker_1 = $(`personal_objective_${objective_1_type_arg}`).firstElementChild;
                const po_pitches_1 = gamedatas.personal_objectives_tracker[objective_1_type_arg];
                const po_num_1 = po_pitches_1.length < 3 ? po_pitches_1.length : 3;
                po_tracker_1.innerHTML = `${po_num_1}/3`;
                if (po_num_1 === 3) { po_tracker_1.style.color = 'green'; }
                const po_tracker_2 = $(`personal_objective_${objective_2_type_arg}`).firstElementChild;
                const po_pitches_2 = gamedatas.personal_objectives_tracker[objective_2_type_arg];
                const po_num_2 = po_pitches_2.length < 3 ? po_pitches_2.length : 3;
                po_tracker_2.innerHTML = `${po_num_2}/3`;
                if (po_num_2 === 3) { po_tracker_2.style.color = 'green'; }
                
                this.utils.personalObjectiveTooltip(`personal_objective_${objective_1_type_arg}`, objective_1_type_arg);
                this.utils.personalObjectiveTooltip(`personal_objective_${objective_2_type_arg}`, objective_2_type_arg);
            }

            // shared objective toggle
            if (!$('shared_objectives_toggle')) {
                const shared_objectives_toggle = document.createElement('div');
                shared_objectives_toggle.id = 'shared_objectives_toggle';
                shared_objectives_toggle.innerHTML = _('Show Shared<br>Objective Trackers');
                shared_objectives_toggle.classList.add('addon_off', 'always_cursor', 'toggle');
                dojo.place(shared_objectives_toggle, toggles_wrap, 'first');
                shared_objectives_toggle.onclick = (evt) => { this.utils.toggleSharedObjectives(evt); }
            }
            // shared objective completion marks
            const shared_objectives_tracker = gamedatas.shared_objectives_tracker;
            this.utils.updateSharedObjectivesDisplay(shared_objectives_tracker);

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

                // set popup to close if user clicks x or outside of element
                const climbing_slot = $('climbing_slot');
                const closePopup = () => {
                    $('show_hide_card_button').click();
                    
                    this.utils.removeOutsideClickListener();
                };

                // start listener
                this.utils.setupOutsideClickListener(climbing_slot, closePopup);

                if (gamedatas.current_state === 'climbingCard' && this.isCurrentPlayerActive()) {
                    const choice_top = $(`${climbing_card_info.id}_top`);
                    const choice_bottom = $(`${climbing_card_info.id}_bottom`);
                    const bound_handler = this.onSelectClimbingCardChoice.bind(gameui);
                    choice_top.onclick = bound_handler;
                    choice_bottom.onclick = bound_handler;
                    this.climbing_card_choice_handlers[0] = choice_top;
                    this.climbing_card_choice_handlers[1] = choice_bottom;
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
                let i = gamedatas.risked_assets.selected_resources.length;
                gamedatas.risked_assets.selected_resources.map(id => {
                    
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
                    const risked_num = gamedatas.risked_assets.selected_resources.length;
                    let empty_slots = [];
                    document.querySelectorAll('.hand_asset_wrap').forEach(wrap => {
                        if (wrap.children.length === 0) { empty_slots.push(wrap); }
                    });
                    for (let i=0; i<=risked_num-1; i++) {
                        const id = gamedatas.risked_assets.selected_resources[i];
                        const hand_slot = empty_slots[i];
                        this.risk_hand_slots[id] = hand_slot;
                    }

                    gamedatas.risked_assets.selected_summit_betas.forEach(type_arg => {
                        const token_id = Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === type_arg);
                        sb_token = $(`summit_beta_${token_id}`);
                        sb_token.classList.add('selected_token');
                        sb_token.parentElement.classList.add('selected_token_wrap');
                    });

                    const my_asset_board = document.querySelector('.asset_board');
                    Object.entries(gamedatas.risked_assets.selected_tokens).forEach(([type, num]) => {
                        if (num > 0) {
                            for (let i=1; i<=num; i++) {
                                const selected_token = my_asset_board.querySelector(`.${type}_token:not(.selected_token)`);
                                if (type === 'gear') {
                                    const border = document.createElement('div');
                                    border.classList.add('gear_token_border', 'selected_gear_border');
                                    selected_token.before(border);
                                }
                                else {
                                    selected_token.classList.add('selected_token');
                                }
                            }
                        }
                    });
                }

                for (let hex_num of gamedatas.risk_pitches) {

                    if ( !this.isSpectator && this.isCurrentPlayerActive() && !gamedatas.pitch_tracker[this.player_id].includes(`${hex_num}`)) {

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

                const crimper_display_1 = $('crimper_display_1');
                const crimper_display_2 = $('crimper_display_2');
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

                // set popup to close if user clicks x or outside of element
                const closePopup = () => {
                    $('show_hide_card_button').click();
                    
                    this.utils.removeOutsideClickListener();
                };

                // start listener
                this.utils.setupOutsideClickListener([crimper_display_1, crimper_display_2], closePopup);
            }

                // final round
            if (Object.values(gamedatas.pitch_tracker).some(arr => arr.length === 9) && gamedatas.gamestate.name !== 'gameEnd') {
                if (!$('final_round_msg')) {
                    const final_round_wrapper = document.createElement('div');
                    final_round_wrapper.id = 'final_round_wrapper';
                    const final_round_msg = document.createElement('div');
                    final_round_msg.id = 'final_round_msg';
                    final_round_msg.innerHTML = _('Final Round');
                    const titlebar_addon = $('titlebar_addon');
                    const climbing_slot = $('climbing_slot');
                    final_round_wrapper.append(final_round_msg);
                    titlebar_addon.insertBefore(final_round_wrapper, climbing_slot);
                }
            }

                // end of game final situation
            if (gamedatas.current_state === 'gameEnd') {
                const titlebar_addon = $('titlebar_addon');
                const toggles_wrap = $('toggles_wrap');
                toggles_wrap.style.width = '61vmin';
                const opponents_objectives_tracker = gamedatas.opponents_objectives_tracker;
                const scored_personal_objectives = gamedatas.scored_personal_objectives;
                const score_tracker = gamedatas.score_tracker;
                
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

                for (const [id, info] of Object.entries(gamedatas.player_names_and_colors)) {

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
                const personal_objectives_toggle = $('personal_objectives_toggle');
                toggles_wrap.insertBefore(scorecard_toggle, personal_objectives_toggle);
                scorecard_toggle.onclick = (evt) => { this.utils.toggleScorecard(evt); }

                const opponent_objectives_box = document.createElement('div');
                opponent_objectives_box.id = 'opponent_objectives_box';
                opponent_objectives_box.style.display = 'none';
                titlebar_addon.append(opponent_objectives_box);
                let pos_num = 1;

                const opponent_objectives_toggle = document.createElement('div');
                opponent_objectives_toggle.id = 'opponent_objectives_toggle';
                opponent_objectives_toggle.innerHTML = _('Show Opponent<br>Objectives');
                opponent_objectives_toggle.classList.add('addon_off', 'always_cursor', 'toggle');
                toggles_wrap.insertBefore(opponent_objectives_toggle, scorecard_toggle);
                opponent_objectives_toggle.onclick = (evt) => { this.utils.toggleOpponentObjectives(evt); }

                opponent_objectives_toggle.click();
                for (const [player_id, objectives] of Object.entries(opponents_objectives_tracker)) {

                    if (player_id != this.player_id) {
                        const player_objectives_wrap = document.createElement('div');
                        player_objectives_wrap.id = `opponent_objectives_${pos_num}`;
                        player_objectives_wrap.classList.add('opponent_objectives_wrap');
                        opponent_objectives_box.append(player_objectives_wrap);
                        const player = gamedatas.players[player_id];
                        const name_span = dojo.place(this.format_block('jstpl_colored_name', {
                            player_id : player_id,
                            color : `#${player.color}`,
                            player_name : player.name,
                        }), player_objectives_wrap);
                        name_span.style.display = 'block';
                        name_span.classList.add('opponent_objectives_name');

                        for (const objective_id of Object.keys(objectives)) {
                            const objective = gamedatas.personal_objectives[objective_id];
                            const coords = objective['x_y'];
                            const obj_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                                poId : `${objective_id}_opponent`,
                                poX : coords[0],
                                poY : coords[1],
                            }), player_objectives_wrap);
                            obj_ele.classList.add('opponent_objective_card');
                            const po_tracker = obj_ele.firstElementChild;
                            const po_pitches = gamedatas.opponents_objectives_tracker[player_id][objective_id];
                            const po_num = po_pitches.length < 3 ? po_pitches.length : 3;
                            po_tracker.innerHTML = `${po_num}/3`;
                            if (po_num === 3) { po_tracker.style.color = 'green'; }
                            po_tracker.style.fontSize = '0.7em';
                            this.utils.personalObjectiveTooltip(obj_ele.id, objective_id);
                        }
                        pos_num++;
                    }
                }
                opponent_objectives_toggle.click();

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
            }

            //// Tooltips

            // cards in hand
            document.querySelectorAll('#assets_wrap .asset').forEach(ele => {
                const card_id = ele.id.slice(-3).replace(/^\D+/g, '');
                const card_type = gamedatas.asset_identifier[card_id];
                this.utils.assetTooltip(ele.id, card_type);
            });

            // summit beta tokens
            document.querySelectorAll('.summit_beta').forEach(ele => {
                if (ele.id !== 'summit_pile' && !ele.classList.contains('flip_card_front') && !ele.classList.contains('flip_card_back')) {
                    const token_id = ele.id.slice(-3).replace(/^\D+/g, '');
                    const token_type = gamedatas.token_identifier[token_id];
                    this.utils.summitBetaTooltip(ele.id, token_type);
                }
            });

            // spread cards

            for (let i=0; i<=3; i++) {
                const asset_ele = $(`spread_slot${i+1}`).firstElementChild;
                const asset_id = asset_ele.id.slice(-3).replace(/^\D+/g, '');
                const asset_type_arg = gamedatas.asset_identifier[asset_id];
                this.utils.assetTooltip(asset_ele, asset_type_arg);
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
                const description = dojo.string.substitute(_("${description}"), { description: character['description'] });
                const flavor = dojo.string.substitute(_("${flavor}"), { flavor: character['flavor'] });
                const ability = dojo.string.substitute(_("${ability}"), { ability: character['ability'] });
                const home_crag = dojo.string.substitute(_("${home_crag}"), { home_crag: character['home_crag'] });
                const native_lands = dojo.string.substitute(_("${native_lands}"), { native_lands: character['native_lands'] });
                const html = `<div style="margin-bottom: 5px;"><strong>${description}</strong></div>
                            <p>${flavor} - ${ability}</p>
                            <p>${_('Starting Water/Psych')}: ${character['water_psych']}</p>
                            <span>${_('Home Crag')}: ${home_crag}</span>
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

            // if empty, change gamedatas values from simple arrays into the associative arrays (such as expected by utils.sanitizeHand and utils.sanitizeAssetBoard)

            if (!this.isSpectator) {
                if (gamedatas.hand_assets.length === 0) { gamedatas.hand_assets = {}; }
                if (gamedatas.player_token_tracker.length === 0) { gamedatas.player_token_tracker = {}; }
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


            /*******PHP DEBUGGING*******/

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();
            BgaAutofit.init();

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
            const zombie_players = this.gamedatas.zombie_players;

            switch( stateName ) {
                case 'characterSelection':
                    const available_characters = dojo.query('#character selection .character').length;
                    // check # of available characters so as not to double event connection for starting player
                    if (this.isCurrentPlayerActive() && available_characters < this.player_count+1) {
                        dojo.query('#character_selection > .character').forEach(ele => {
                            ele.classList.add('popout', 'cursor');
                        });
                        const bound_handler = this.onSelectCharacter.bind(gameui);
                        dojo.query('#character_selection > .character').forEach(ele => {
                            ele.onclick = bound_handler;
                            this.character_handlers.push(ele);
                        });
                    }
                    break;

                case 'drawAssets':

                    document.getElementById('sprite_preloader')?.remove();

                    if (args.args.phase) {
                        const current_phase = $('phase_tracker').innerHTML.slice(7);
                        if (args.args.phase != current_phase) { this.utils.updateTitlebarAddon(args.args.phase, 'phase'); }
                    }
                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();

                        if (!args.args.spread_draw) {
                            dojo.place('<div id="minus_one" class="draw_button">-</div><div id="plus_one" class="draw_button">+</div>', 'asset_deck');
                            const minus_one = $('minus_one');
                            minus_one.style.display = 'none';
                            const plus_one = $('plus_one');
                            minus_one.classList.add('cursor');
                            plus_one.classList.add('cursor');
                            const bound_handler = this.onSelectAsset.bind(gameui);
                            minus_one.onclick = bound_handler;
                            plus_one.onclick = bound_handler;
                            $('asset_deck').classList.add('selectable');
                        }

                        for (let slot=0; slot<=3; slot++) {
                            const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                            available_asset.classList.add('selectable', 'cursor');
                            const bound_handler = this.onSelectAsset.bind(gameui);
                            available_asset.onclick = bound_handler;
                            this.asset_handlers.push(available_asset);
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

                        const available_pitches = args.args.available_pitches;
                        const pitch_tracker = args.args.pitch_tracker;
                        this.ignore_types = [];
                        let bailing = true;
                        for (let pitch_num of available_pitches) {
                            const pitch = $(`pitch_${pitch_num}`);
                            const unoccupied = pitch.querySelector('.meeple') == null ? true : false;
                            const already_climbed = pitch_tracker.includes(`${pitch_num}`);

                            if (unoccupied && !already_climbed) {
                                bailing = false;
                                break;
                            }
                        }
                        if (bailing) {
                            if (pitch_tracker.length > 2) {
                                const last_pitch_num = pitch_tracker[pitch_tracker.length-2];
                                const border_ele = $(`pitch_${last_pitch_num}_border`);
                                border_ele.classList.add('bailing_pitch');
                            }
                            $('generalactions').lastElementChild.insertAdjacentHTML('afterend', 
                                `<span id="bailing_message">${_('No available<br>Pitches')}</span>`
                            )
                        } else {
                            for (let pitch_num of available_pitches) {
                                if (!pitch_tracker.includes(`${pitch_num}`)) {
                                    const border_ele = $(`pitch_${pitch_num}_border`);
                                    const click_ele = $(`pitch_${pitch_num}_click`);
                                    border_ele.classList.add('available_pitch');
                                    click_ele.classList.add('cursor');
                                    const bound_handler = this.onSelectPitch.bind(gameui);
                                    click_ele.onclick = bound_handler;
                                    this.pitch_handlers.push(click_ele);
                                }
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

                        const portaledge = $('portaledge');
                        $('rest_water_psych').style.display = 'block';

                        if (this.isCurrentPlayerActive()) {

                            this.utils.enableSummitBetaTokens();
                            const water_minus = $('rest_water_minus_click');
                            const water_plus = $('rest_water_plus_click');
                            const psych_minus = $('rest_psych_minus_click');
                            const psych_plus = $('rest_psych_plus_click');
                            const water_psych_clicks_arr = [water_minus, water_plus, psych_minus, psych_plus];

                            dojo.query('#rest_water_psych *').forEach(ele => { ele.style.display = 'block'; });
                            water_minus.style.display = 'none';
                            $('rest_water_minus_symbol').style.display = 'none';
                            psych_minus.style.display = 'none';
                            $('rest_psych_minus_symbol').style.display = 'none';
                            water_psych_clicks_arr.forEach(ele => {
                                ele.classList.add('cursor');
                                const bound_handler = this.onRestWaterPsych.bind(gameui);
                                ele.onclick = bound_handler;
                                this.resting_selection_handlers.push(ele);
                            });

                            dojo.query('.portaledge').forEach(deck => {
                                dojo.place(`<div id="${deck.id}_minus_one" class="porta_minus">-</div><div id="${deck.id}_plus_one" class="porta_plus">+</div>`, deck);
                                const deck_minus_one = $(`${deck.id}_minus_one`);
                                const deck_plus_one = $(`${deck.id}_plus_one`);
                                deck_minus_one.classList.add('cursor');
                                deck_plus_one.classList.add('cursor');

                                const bound_handler = this.onSelectPortaledge.bind(gameui);
                                deck_minus_one.onclick = bound_handler;
                                deck_plus_one.onclick = bound_handler;
                                this.portaledge_selection_handlers.push(deck_minus_one);
                                this.portaledge_selection_handlers.push(deck_plus_one);
                                deck_minus_one.style.display = 'none';
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
                    this.utils.updateTitlebarAddon(_('Follow'), 'phase');
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
                    let hand_cards_of_discard_type = false;

                    const played = climbing_card && (climbing_card_info['choice_args']['card_in_hand'] || climbing_card_info['choice_args']['gear_in_hand']) ? true : false;
                    const player_id = this.getActivePlayerId();

                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();
                        dojo.query('.hand_asset_wrap > .asset').forEach(ele => {
                            const id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const arg = this.gamedatas.asset_identifier[id];
                            const type = this.utils.getAssetType(arg);

                            if ((this.discard_type === 'any_skill' && type != 'gear') || (type === this.discard_type || !this.discard_type || this.discard_type == 'any_asset')) {
                                const bound_handler = this.onSelectAssetForDiscard.bind(gameui);
                                ele.onclick = bound_handler;
                                this.asset_selection_handlers.push(ele);
                                ele.classList.add('cursor', 'selectable');
                                ele.parentElement.classList.add('selectable_wrap');
                                hand_cards_of_discard_type = true;
                            }
                        });
                        if (!hand_cards_of_discard_type && !played) {
                            let i = 0;
                            dojo.query(`#asset_board_${player_id} .played_asset`).forEach(ele => {
                                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                                const arg = this.gamedatas.asset_identifier[id];
                                const type = this.utils.getAssetType(arg);
                                if ((this.discard_type === 'any_skill' && type != 'gear') || (type === this.discard_type || !this.discard_type || this.discard_type == 'any_asset')) {
                                    const bound_handler = this.onSelectAssetForDiscard.bind(gameui);
                                    ele.onclick = bound_handler;
                                    this.asset_selection_handlers.push(ele);
                                    ele.classList.add('cursor', 'selectable');
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
                                        const bound_handler = this.onSelectAssetForDiscard.bind(gameui);
                                        minus_one.onclick = bound_handler;
                                        plus_one.onclick = bound_handler;
                                        this.asset_selection_handlers.push(minus_one);
                                        this.asset_selection_handlers.push(plus_one);
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
                    if (!this.isSpectator) {
                        $(`player_${this.player_id}`).querySelectorAll('.permanent_asset.selectable').forEach(token => {
                            if (!token.classList.contains('selected_token')) { token.classList.remove('selectable', 'cursor'); }
                        });
                        $(`player_${this.player_id}`).querySelectorAll('.gear_token_border').forEach(border => {
                            if (!border.classList.contains('selected_gear_border')) { border.remove(); }
                        });
                    }
                    break;

                case 'selectPortaledge':
                    (async () => {
                        if (this.utils.notAZombie(this.getActivePlayerId())) {
                            const climbing_card_info = this.gamedatas.climbing_card_info;
                            if (climbing_card_info != [] && $('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }
                        
                            const portaledge = $('portaledge');
                            this.portaledge_num = climbing_card_info.portaledge_num || null;
                            this.portaledge_types = climbing_card_info.portaledge_types || null;

                            if (this.getActivePlayerId() == this.player_id) {
                                
                                this.utils.enableSummitBetaTokens();

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

                                        const bound_handler = this.onSelectPortaledge.bind(gameui);
                                        deck_minus_one.onclick = bound_handler;
                                        deck_plus_one.onclick = bound_handler;
                                        this.portaledge_selection_handlers.push(deck_minus_one);
                                        this.portaledge_selection_handlers.push(deck_plus_one);
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
                        }
                    })();
                    break;

                case 'addTokenToPitch':
                    if (this.isCurrentPlayerActive()) { this.utils.enableSummitBetaTokens(); }

                    dojo.query('.token_button').forEach(ele => {
                        const button_type = ele.firstElementChild.id.slice(0, -8);
                        if (!args.args.climbing_card_info.token_types.includes(button_type)) {
                            ele.classList.add('disabled');
                            ele.firstElementChild.firstElementChild.innerHTML = '\u2612';
                        }
                    });
                    break;

                case 'addAssetToAssetBoard':
                    if (!$('climbing_discard_straightened').firstElementChild) { this.utils.retractClimbingCard(); }

                    let add_types = args.args.types;
                    if (this.free_solo_hecked) {
                        add_types = ['face', 'crack', 'slab'];
                        this.free_solo_hecked = false;
                    }

                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();

                        dojo.query('.hand_asset_wrap > .asset').forEach(ele => {
                            const id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const type_arg = this.gamedatas.asset_identifier[id];
                            const type = this.utils.getAssetType(type_arg);

                            if (add_types.includes(type) || add_types.includes('any')) {
                                const bound_handler = this.onSelectAssetToAssetBoard.bind(gameui);
                                ele.onclick = bound_handler;
                                this.asset_selection_handlers.push(ele);
                                ele.classList.add('cursor', 'selectable');
                                ele.parentElement.classList.add('selectable_wrap');
                            }
                        });
                    }
                    break;

                case 'stealFromAssetBoard':
                    if ($('climbing_slot').firstElementChild) { this.utils.retractClimbingCard(); }

                    const steal_type = args.args.types.toLowerCase();

                    if (this.isCurrentPlayerActive()) {

                        this.utils.enableSummitBetaTokens();

                        let i = 0;
                        dojo.query('.asset_board_slot > .asset').forEach(ele => {
                            const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const type_arg = this.gamedatas.asset_identifier[asset_id];
                            const type = this.utils.getAssetType(type_arg);
                            const player_id = ele.parentElement.parentElement.parentElement.id.split('_').pop();

                            if ((steal_type == type || !steal_type) && player_id != this.player_id) {
                                const bound_handler = this.onSelectStealFromAssetBoard.bind(gameui);
                                ele.onclick = bound_handler;
                                this.asset_selection_handlers.push(ele);
                                ele.classList.add('cursor', 'selectable');
                            }
                        });

                        dojo.query('.asset_counter').forEach(ele => {

                            const player_id = ele.parentElement.parentElement.id.split('_').pop();
                            if (ele.style.display == 'block' && player_id != this.player_id) {
                                const type = ele.id.slice(-13, -8).replace(/_/g, '');
                                if ((steal_type == type || !steal_type) && player_id != this.player_id) {
                                    dojo.place(this.format_block('jstpl_asset_counter_draw_box', {
                                        player_id : player_id,
                                        type : type
                                    }), ele);
                                    const minus_one = dojo.query(`#${ele.id} .tucked_minus_click`)[0];
                                    const plus_one = dojo.query(`#${ele.id} .tucked_plus_click`)[0];
                                    const bound_handler = this.onSelectStealFromAssetBoard.bind(gameui);
                                    minus_one.onclick = bound_handler;
                                    plus_one.onclick = bound_handler;
                                    this.asset_selection_handlers.push(minus_one);
                                    this.asset_selection_handlers.push(plus_one);
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
        
                        const bound_handler = this.onSelectChooseSummitBetaToken.bind(gameui);
                        token_1_ele.onclick = bound_handler;
                        token_2_ele.onclick = bound_handler;
                        this.token_selection_handlers = [ token_1_ele, token_2_ele ];
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
                    for (const ele of this.character_handlers) { ele.onclick = null; }
                    this.character_handlers = [];

                    // remove the leftover character
                    if (dojo.query('#character_selection > *').length == 1 + this.gamedatas.zombie_players.length) { 
                        $('character_selection_ratio').remove();
                    }

                    // remove selectable effects and event listeners for the player who just chose their character
                    if (this.isCurrentPlayerActive()) { 
                        dojo.query('#character_selection > *').forEach((ele) => { ele.classList.remove('cursor'); });
                        this.disconnect($('confirm_button'), 'onclick');
                    }
                    break;

                case 'drawAssets':
                    for (const ele of this.asset_handlers) { ele.onclick = null; }
                    this.asset_handlers = [];
                    dojo.query('.cursor').forEach(ele => { if (!ele.classList.contains('summit_beta_click')) { ele.classList.remove('cursor'); }});

                    const deck_classes = $('asset_deck').classList;
                    if (deck_classes.contains('draw')) {
                        deck_classes.remove(deck_classes[deck_classes.length-1]); // Number
                        deck_classes.remove('draw'); // 'draw'
                    }
                    break;

                case 'climbOrRest':
                    for (const ele of this.resource_handlers) { ele.onclick = null; }
                    this.resource_handlers = [];
                    for (const ele of this.pitch_handlers) { ele.onclick = null; }
                    this.pitch_handlers = [];

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

                    this.requirements_met = true;

                    if (this.borrowed_rack_requirements) { delete this.borrowed_rack_requirements; }
                    if (this.jumar_requirements) { delete this.jumar_requirements; }
                    if (this.extra_water_requirements) { delete this.extra_water_requirements; }
                    if (this.guidebook_requirements) {
                        delete this.guidebook_requirements;
                        delete this.guidebook_token;
                        delete this.guidebook_type;
                        delete this.border_removed;
                    }
                    break;

                case 'climbingCard':
                    dojo.query('.cursor').forEach((ele) => { if (!ele.classList.contains('summit_beta_click')) { ele.classList.remove('cursor'); }});
                    if (this.isCurrentPlayerActive()) {
                        for (let ele of this.climbing_card_choice_handlers) { ele.onclick = null; }
                        this.climbing_card_choice_handlers = [];
                    }
                    this.choices_info = {};
                    break;

                case 'resting':
                    for (let ele of this.resting_selection_handlers) { ele.onclick = null; }
                    this.resting_selection_handlers = [];
                    for (let ele of this.portaledge_selection_handlers) { ele.onclick = null; }
                    this.portaledge_selection_handlers = [];
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
                    for (const ele of this.asset_selection_handlers) { ele.onclick = null; }
                    this.asset_selection_handlers = [];
                    dojo.query('.tucked_draw_box').forEach(ele => { ele.remove(); });
                    this.discard_num = null;
                    this.selected_tucked = [];
                    break;

                case 'selectPortaledge':
                    if (this.portaledge_selection_handlers && this.portaledge_selection_handlers.length > 0) {
                        for (let ele of this.portaledge_selection_handlers) { ele.onclick = null; }
                        this.portaledge_selection_handlers = [];
                        dojo.query('.draw').forEach(ele => {
                            ele.classList.remove('draw');
                            ele.classList.remove(ele.classList[ele.classList.length-1]);
                        });
                    }
                    this.portaledge_num = null;
                    break;

                case 'addAssetToAssetBoard':
                    for (const ele of this.asset_selection_handlers) { ele.onclick = null; }
                    this.asset_selection_handlers = [];
                    break;

                case 'stealFromAssetBoard':
                    for (const ele of this.asset_selection_handlers) { ele.onclick = null; }
                    this.asset_selection_handlers = [];
                    dojo.query('.tucked_draw_box').forEach(ele => { ele.remove(); });
                    this.selected_tucked = [];
                    break;

                case 'chooseSummitBetaToken':
                    for (const ele of this.token_selection_handlers) { ele.onclick = null; }
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
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmCharacter', null, false, 'blue');
                        $('confirm_button').classList.add('disabled');
                        break;

                    case 'drawAssets':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssets', null, false, 'blue');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0) {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'climbOrRest':
                        const available_pitches = args.available_pitches;
                        let bailing = true;
                        for (let pitch_num of available_pitches) {
                            const pitch = $(`pitch_${pitch_num}`);
                            const unoccupied = pitch.querySelector('.meeple') == null ? true : false;
                            const already_climbed = args.pitch_tracker.includes(`${pitch_num}`);

                            if (unoccupied && !already_climbed) {
                                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmPitch', null, false, 'blue');
                                $('confirm_button').classList.add('disabled');
                                bailing = false;
                                break;
                            }
                        }
                        if (bailing) {
                            this.addActionButton('confirm_button', _('Bail'), 'onConfirmBail', null, false, 'blue');                            
                        }
                        this.addActionButton('rest_button', _('Rest'), 'onRest', null, false, 'blue');
                        this.addActionButton('trade_button', _('Trade'), 'onTrade', null, false, 'blue');
                        if (!this.utils.tradeEnabled()) { $('trade_button').classList.add('disabled'); }
                        break;

                    case 'climbingCard':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmClimbingCardChoice', null, false, 'blue');
                        $('confirm_button').classList.add('disabled');
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'blue');
                        $('show_hide_card_button').classList.add('shown');


                        if (this.character_id === '10') {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'discardAssets':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssetsForDiscard', null, false, 'blue');
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
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmOpponent', null, false, 'blue');
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
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmPortaledge', null, false, 'blue');
                        $('confirm_button').classList.add('disabled');
                        break;

                    case 'addTokenToPitch':
                        const asset_checkbox = document.createElement('div');
                        asset_checkbox.classList.add('asset_checkbox');
                        asset_checkbox.innerHTML = '\u2610';

                        this.addActionButton('gear_button', '<div id="gear_wrapper" class="skills_and_techniques gear_token"></div>', 'onSelectAssetType', null, false, 'blue');
                        const gear_button = $('gear_button');
                        gear_button.classList.add('token_button', 'gear_button');
                        const gear_wrapper = document.getElementById('gear_wrapper');
                        const gear_checkbox = asset_checkbox.cloneNode(true);
                        gear_checkbox.id = 'gear_checkbox';
                        gear_wrapper.append(gear_checkbox);

                        this.addActionButton('face_button', '<div id="face_wrapper" class="skills_and_techniques face_token"></div>', 'onSelectAssetType', null, false, 'blue');
                        const face_button = $('face_button');
                        face_button.classList.add('token_button', 'face_button');
                        const face_wrapper = document.getElementById('face_wrapper');
                        const face_checkbox = asset_checkbox.cloneNode(true);
                        face_checkbox.id = 'face_checkbox';
                        face_wrapper.append(face_checkbox);

                        this.addActionButton('crack_button', '<div id="crack_wrapper" class="skills_and_techniques crack_token"></div>', 'onSelectAssetType', null, false, 'blue');
                        const crack_button = $('crack_button');
                        crack_button.classList.add('token_button', 'crack_button');
                        const crack_wrapper = document.getElementById('crack_wrapper');
                        const crack_checkbox = asset_checkbox.cloneNode(true);
                        crack_checkbox.id = 'crack_checkbox';
                        crack_wrapper.append(crack_checkbox);

                        this.addActionButton('slab_button', '<div id="slab_wrapper" class="skills_and_techniques slab_token"></div>', 'onSelectAssetType', null, false, 'blue');
                        const slab_button = $('slab_button');
                        slab_button.classList.add('token_button', 'slab_button');
                        const slab_wrapper = document.getElementById('slab_wrapper');
                        const slab_checkbox = asset_checkbox.cloneNode(true);
                        slab_checkbox.id = 'slab_checkbox';
                        slab_wrapper.append(slab_checkbox);

                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssetType', null, false, 'blue');
                        $('confirm_button').classList.add('disabled');
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'blue');
                        $('show_hide_card_button').classList.add('shown');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0 && this.character_id === '10') {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'addAssetToAssetBoard':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssetToAssetBoard', null, false, 'blue');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0) {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'stealFromAssetBoard':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmStealFromAssetBoard', null, false, 'blue');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0) {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'chooseSummitBetaToken':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmChooseSummitBetaToken', null, false, 'blue');
                        $('confirm_button').classList.add('disabled');

                        this.gamedatas.climbing_card_info = args.climbing_card_info;
                        if (Object.keys(this.gamedatas.climbing_card_info).length != 0
                         && this.gamedatas.climbing_card_info.type_arg != '19') {
                            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
                        }
                        break;

                    case 'chooseTechniqueToken':
                        const technique_checkbox = document.createElement('div');
                        technique_checkbox.classList.add('token_checkbox');
                        technique_checkbox.innerHTML = '\u2610';

                        this.addActionButton('precision_button', '<div id="precision_wrapper" class="skills_and_techniques precision_token"></div>', 'onSelectTechniqueToken', null, false, 'blue');
                        const precision_button = $('precision_button');
                        precision_button.classList.add('token_button', 'precision_button');
                        const precision_wrapper = document.getElementById('precision_wrapper');
                        const precision_checkbox = technique_checkbox.cloneNode(true);
                        precision_checkbox.id = 'precision_checkbox';
                        precision_wrapper.append(precision_checkbox);

                        this.addActionButton('balance_button', '<div id="balance_wrapper" class="skills_and_techniques balance_token"></div>', 'onSelectTechniqueToken', null, false, 'blue');
                        const balance_button = $('balance_button');
                        balance_button.classList.add('token_button', 'balance_button');
                        const balance_wrapper = document.getElementById('balance_wrapper');
                        const balance_checkbox = technique_checkbox.cloneNode(true);
                        balance_checkbox.id = 'balance_checkbox';
                        balance_wrapper.append(balance_checkbox);

                        this.addActionButton('pain_tolerance_button', '<div id="pain_tolerance_wrapper" class="skills_and_techniques pain_tolerance_token"></div>', 'onSelectTechniqueToken', null, false, 'blue');
                        const pain_tolerance_button = $('pain_tolerance_button');
                        pain_tolerance_button.classList.add('token_button', 'pain_tolerance_button');
                        const pain_tolerance_wrapper = document.getElementById('pain_tolerance_wrapper');
                        const pain_tolerance_checkbox = technique_checkbox.cloneNode(true);
                        pain_tolerance_checkbox.id = 'pain_tolerance_checkbox';
                        pain_tolerance_wrapper.append(pain_tolerance_checkbox);

                        this.addActionButton('power_button', '<div id="power_wrapper" class="skills_and_techniques power_token"></div>', 'onSelectTechniqueToken', null, false, 'blue');
                        const power_button = $('power_button');
                        power_button.classList.add('token_button', 'power_button');
                        const power_wrapper = document.getElementById('power_wrapper');
                        const power_checkbox = technique_checkbox.cloneNode(true);
                        power_checkbox.id = 'power_checkbox';
                        power_wrapper.append(power_checkbox);

                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmTechniqueToken', null, false, 'blue');
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
                                
                                const desired_type_order = ['gear', 'face', 'crack', 'slab'];
                                const types_ordered = desired_type_order.reduce((acc, key) => {
                                    acc[key] = types[key];
                                    return acc;
                                }, {});
                                const character_num = this.gamedatas.players[this.player_id]['character'];
                                const character = this.gamedatas.characters[character_num];
                                const max_tokens = character.permanent_asset_slots;
                                const board_assets = this.gamedatas.board_assets[this.player_id];
                                const current_tokens = board_assets['gear']['permanent'] + board_assets['face']['permanent'] + board_assets['crack']['permanent'] + board_assets['slab']['permanent'];

                                let currently_selected = 0;
                                for (const [type, num] of Object.entries(types_ordered)) {
                                    for (let i=1; i<=num; i++) {

                                        if (!$(`${type}_button_${i}`)) { // if the button doesn't already exist
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
                        this.addActionButton('show_hide_card_button', _('Hide cards'), 'onShowHideCard', null, false, 'blue');
                        $('show_hide_card_button').classList.add('shown');
                        break;
                }
            } else {
                switch (stateName) {
                    case 'climbingCard':
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'blue');
                        $('show_hide_card_button').classList.add('shown');
                        break;
                    case 'addTokenToPitch':
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'blue');
                        $('show_hide_card_button').classList.add('shown');
                        break;
                    case 'crimperClimbingCards':
                        this.addActionButton('show_hide_card_button', _('Hide cards'), 'onShowHideCard', null, false, 'blue');
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

        onShowHideReferenceCards: function(evt) {
            if (evt && typeof evt.preventDefault === 'function') {
                evt.preventDefault();
                evt.stopPropagation();
            }

            const reference_popup = $('reference_popup');
            const climbing_dimmer = $('climbing_dimmer');
            
            // Show the elements
            reference_popup.style.display = 'flex';
            climbing_dimmer.classList.add('dim_bg');

            // Add autofit in the event of non-en player
            const language = _('$locale');
            if (language !== 'en') {
                const ref_1 = $('ref_1');
                const ref_2 = $('ref_2');

                if (ref_1) {
                    const ref_1_text = document.createElement('div');
                    ref_1_text.id = 'ref_1_text';
                    ref_1_text.classList.add('reference_text');
                    const ref_1_html = `
                        <div id="ref_climb_phase" class="bga-autofit align-start bga-autofit__top">
                            <h3 id="ref_climb_title"><strong>${_('Climb Phase')}</strong></h3>
                            <p>${_('- Move your Climber & Rope. If you are resting, lay down your climber and skip the next steps')}</p>
                            <p>${_('- Lay down Asset Cards')}</p>
                            <p>${_('- Decrease Water & Psych')}</p>
                            <p>${_('- Draw & resolve a Climbing Card')}</p>
                        </div>

                        <div id="ref_follow_phase" class="bga-autofit align-start bga-autofit__top">
                            <h3 id="ref_follow_title"><strong>${_('Follow Phase')}</strong></h3>
                            <p>${_('- Claim points for Techniques')}</p>
                            <p>${_('- Turn in cards for Permanent Assets if applicable')}</p>
                            <p>${_('- Turn over Cards on your Board')}</p>
                        </div>

                        <div id="ref_rerack_phase" class="bga-autofit align-start bga-autofit__top">
                            <h3 id="ref_rerack_title"><strong>${_('Rerack Phase')}</strong></h3>
                            <p>${_('- Climbers: Draw 3 Asset Cards')}</p>
                            <p class="ref_sm_text"><i>${_('draw Cards from the Spread or Deck')}</i></p>
                            <p>${_('- Resters: Gain 5 Assets')}</p>
                            <p class="ref_sm_text">${_('draw Cards from the Portaledge')}</p>
                            <p><i>${_('- Pass First Player Token to your right')}</i></p>
                        </div>
                    `;
                    ref_1_text.innerHTML = ref_1_html;
                    ref_1.replaceWith(ref_1_text);
                }

                if (ref_2) {
                    const ref_2_text = document.createElement('div');
                    ref_2_text.id = 'ref_2_text';
                    ref_2_text.classList.add('reference_text');
                    const ref_2_html = `
                        <div id="ref_risking_it" class="bga-autofit align-start bga-autofit__top">
                            <div class="bga-autofit__inner">
                                <h3><strong>${_('Risking It')}</strong></h3>
                                <p>${_('If you are 1 Asset short but still want to climb, pay the other required Assets, then roll the Die!')}</p>
                                
                                <div class="risk_row">
                                    <div class="risk_icon_wrapper">
                                        <span class="risk risk_checkmark"></span>
                                        <span class="risk_equals">=</span>
                                    </div>
                                    <span class="risk_text">${_('no consequence')}</span>
                                </div>
                                <div class="risk_row">
                                    <div class="risk_icon_wrapper">
                                        <span class="risk risk_cards"></span>
                                        <span class="risk_equals">=</span>
                                    </div>
                                    <span class="risk_text">${_('give 2 Cards from your hand to another player')}</span>
                                </div>
                                <div class="risk_row">
                                    <div class="risk_icon_wrapper">
                                        <span class="risk risk_card_and_psych"></span>
                                        <span class="risk_equals">=</span>
                                    </div>
                                    <span class="risk_text">${_('give 1 Psych and 1 Card to another player')}</span>
                                </div>
                            </div>
                        </div>

                        <div id="ref_techniques_and_trades" class="bga-autofit align-start bga-autofit__top">
                            <div class="bga-autofit__inner">
                                <h3><strong>${_('Techniques and Trades')}</strong></h3>
                                <p>${_('When you play 3 Cards with matching Technique symbols, gain a 2-point Token.')}</p>
                                <p>${_('Technique tokens (earned from climbing cards) are used in place of a Card to match Technique symbols. Discard after using.')}</p>
                                <p>${_('On your turn, you may trade in 3 Cards of a kind from your hand for a Card from the Portaledge')}</p>
                            </div>
                        </div>

                        <div id="ref_ways_to_earn_points" class="bga-autofit align-start bga-autofit__top">
                            <div class="bga-autofit__inner">
                                <h3><strong>${_('Ways to Earn Points')}</strong></h3>
                                <p>• ${_('Climbing Pitches')}</p>
                                <p>• ${_('Matching Technique symbols')}</p>
                                <p>• ${_('Completing Shared Objectives')}</p>
                                <p>• ${_('Completing 1 Personal Objective')}</p>
                                <p>• ${_('Reaching a Summit')}</p>
                            </div>
                        </div>`;
                    ref_2_text.innerHTML = ref_2_html;
                    ref_2.replaceWith(ref_2_text);
                }
            }

            // set popup to close if user clicks x or outside of element
            const closePopup = () => {
                reference_popup.style.display = 'none';
                climbing_dimmer.classList.remove('dim_bg');
                
                this.utils.removeOutsideClickListener();
            };

            // attach close logic to X button
            const close_button = $('ref_popup_close');
            if (close_button) { close_button.onclick = () => closePopup(); }

            // start listener
            this.utils.setupOutsideClickListener(reference_popup, closePopup);
        },

        onSelectCharacter: function(evt) {
            dojo.stopEvent(evt);

            if (this.checkAction('selectCharacter')) {

                const player_id = this.getActivePlayerId();
                const character_ele = evt.currentTarget;
                const character_num = evt.currentTarget.id.slice(-2).replace(/^\D+/g, '');
                const character = this.gamedatas.characters[character_num];
                const character_name = character.name;
                const ab_pos = character['ab_x_y'];
                const character_display = $('selected_character');

                [...$('character_selection').children].forEach(ele => {
                    ele.style.pointerEvents = 'none';
                });
                character_ele.style.zIndex = '1';
                let asset_board = null;

                // add asset board
                if (character_name === 'free_soloist') {
                    asset_board = dojo.place(this.format_block('jstpl_fs_asset_board', {
                        player : player_id,
                        character : character_name,
                        abX : ab_pos[0],
                        abY : ab_pos[1],
                    }), `character_${character_num}`);
                    delete gameui.gamedatas.board_assets[player_id]['gear'];
                }
                else if (character_name === 'young_prodigy') {
                    asset_board = dojo.place(this.format_block('jstpl_yp_asset_board', {
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
                    asset_board = dojo.place(this.format_block('jstpl_asset_board', {
                        player : player_id,
                        character : character_name,
                        abX : ab_pos[0],
                        abY : ab_pos[1],
                    }), character_ele);
                }

                // move character to display
                const placeholder = document.createElement('div');
                placeholder.className = 'character_placeholder';
                placeholder.id = `placeholder_${character_num}`;
                character_ele.before(placeholder);
                character_display.style.zIndex = '201';
                character_ele.classList.remove('popout');
                character_display.append(character_ele);
                const selection_dimmer = $('selection_dimmer');
                selection_dimmer.classList.add('dim_bg');

                // set popup to close if user clicks cancel or outside of element
                const closePopup = () => {
                    const placeholder = document.getElementById(`placeholder_${character_num}`);
                    if (placeholder) {
                        placeholder.replaceWith(character_ele);
                    }
                    asset_board.remove();
                    character_ele.classList.add('popout');
                    character_display.style.zIndex = '';
                    selection_dimmer.classList.remove('dim_bg');
                    $('cancel_character').remove();
                    if (!$('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.add('disabled'); }
                    [...$('character_selection').children].forEach(ele => {
                        ele.style.pointerEvents = '';
                    });
                    
                    this.utils.removeOutsideClickListener();
                };

                // start listener
                this.utils.setupOutsideClickListener(character_display, closePopup);

                // enable confirm button and add cancel button
                if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
                this.addActionButton('cancel_character', _('Cancel'), closePopup, undefined, undefined, 'red');
            }
        },

        onConfirmCharacter: function(evt) {
            dojo.stopEvent(evt);

            this.utils.removeOutsideClickListener();
            const character = $('selected_character').firstElementChild.id.slice(-2).replace(/^\D+/g, '');

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
            const spread = $('the_spread');

            if (evt.currentTarget.id == 'plus_one') {
                if (deck_draw_num + spread_draw_num + 1 === this.cards_to_draw) {
                    $('plus_one').style.display = 'none';
                    spread.querySelectorAll('.asset').forEach(ele => {
                        if (!ele.classList.contains('selected_asset')) {
                            ele.classList.remove('cursor', 'selectable');
                            ele.style.pointerEvents = 'none';
                        }
                    });
                }
                if ($('minus_one').style.display === 'none') {
                    $('minus_one').style.display = '';
                }
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
                if (deck_draw_num + spread_draw_num - 1 <= this.cards_to_draw) {
                    $('plus_one').style.display = '';
                    spread.querySelectorAll('.asset').forEach(ele => {
                        if (!ele.classList.contains('selectable')) {
                            ele.classList.add('cursor', 'selectable');
                            ele.style.pointerEvents = '';
                        }
                    });
                }
                if (deck_draw_num - 1 === 0) {
                    $('minus_one').style.display = 'none';
                }
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
                    if (deck_draw_num + spread_draw_num <= this.cards_to_draw) {
                        $('plus_one').style.display = '';
                        spread.querySelectorAll('.asset').forEach(ele => {
                            if (!ele.classList.contains('selectable')) {
                                ele.classList.add('cursor', 'selectable');
                                ele.style.pointerEvents = '';
                            }
                        });
                    }
                }
                else { 
                    asset_card.classList.add('selected_asset');
                    spread_draw_num++;
                    if (deck_draw_num + spread_draw_num === this.cards_to_draw) {
                        $('plus_one').style.display = 'none';
                        spread.querySelectorAll('.asset').forEach(ele => {
                            if (!ele.classList.contains('selected_asset')) {
                                ele.classList.remove('cursor', 'selectable');
                                ele.style.pointerEvents = 'none';
                            }
                        });
                    }
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
            let spread_slots = '';
            dojo.query('.selected_asset').forEach((ele) => {
                const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
                spread_to_draw += `${asset_id},`;
                const slot = ele.parentElement.id.slice(-1);
                spread_slots += `${slot},`;
            });

            const deck_classes = $('asset_deck').classList;
            const deck_to_draw = Number(deck_classes[deck_classes.length - 1]) || 0;

            if (this.checkAction('confirmAssets')) {
                this.ajaxcall("/firstascent/firstascent/confirmAssets.html", { lock: true,
                    spread_assets : spread_to_draw,
                    spread_slots : spread_slots,
                    deck_assets : deck_to_draw
                }, this, function(result) {} );
            }
        },

        onSelectPitch: function(evt) {
            dojo.stopEvent(evt);

            const pitch = evt.target.previousElementSibling;
            const pitch_border = pitch.previousElementSibling;
            const hex_num = pitch.id.slice(-2).replace(/^\D+/g, '');
            const pitch_num = pitch.classList[pitch.classList.length-1].slice(-2).replace(/^\D+/g, '');

            if (pitch_border.classList.contains('selected_pitch')) {
                pitch_border.classList.remove('selected_pitch');
                pitch_border.classList.add('available_pitch');
                document.querySelectorAll('.requirement_wrap').forEach(ele => { ele.remove(); });
                if ($('risk_it_message')) { $('risk_it_message').remove(); }
                if ($('requirements_message')) { $('requirements_message').remove(); }
                $('confirm_button').classList.add('disabled');
                if (pitch_num === '36') {
                    document.querySelectorAll('.trifecta_selected').forEach(ele => { ele.classList.remove('trifecta_selected'); });
                    $('trifecta_box').style.display = '';
                    this.utils.updateTitlebar(_('You must choose a Pitch, Rest, or Trade Assets'));
                    if ($('trifecta_show_button')) { $('trifecta_show_button').remove(); }
                    const trifecta_selected_box = $('trifecta_selected_box');
                    Array.from(trifecta_selected_box.children).forEach(ele => {
                        if (ele.id !== 'trifecta_title_clone' && ele.id !== 'trifecta_undo_button') {
                            ele.remove();
                        }
                    });
                    trifecta_selected_box.style.display = '';
                }
            }
            else {
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
                        if (selected_pitch.nextElementSibling.classList.contains('p36')) {
                            document.querySelectorAll('.trifecta_selected').forEach(ele => { ele.classList.remove('trifecta_selected'); });
                            $('trifecta_box').style.display = '';
                            this.utils.updateTitlebar(_('You must choose a Pitch, Rest, or Trade Assets'));
                            if ($('trifecta_show_button')) { $('trifecta_show_button').remove(); }
                            const trifecta_selected_box = $('trifecta_selected_box');
                            Array.from(trifecta_selected_box.children).forEach(ele => {
                                if (ele.id !== 'trifecta_title_clone' && ele.id !== 'trifecta_undo_button') {
                                    ele.remove();
                                }
                            });
                            trifecta_selected_box.style.display = '';
                        }
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
                        if (this.character_id === '3' && requirements_met > 0 && this.resources['skills']['gear'] + this.resources['permanent_skills']['gear'] > pitch_requirements['gear']) {
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
                            if (hex_num <= cutoff) {
                                const face = this.resources['skills']['face'] + this.resources['permanent_skills']['face'] - pitch_requirements['face'];
                                const crack = this.resources['skills']['crack'] + this.resources['permanent_skills']['crack'] - pitch_requirements['crack'];
                                const slab = this.resources['skills']['slab'] + this.resources['permanent_skills']['crack'] - pitch_requirements['slab'];

                                if ([face, crack, slab].some(num => num < 0)) {
                                    requirements_met--;
                                }
                            }
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

                        const hand_summit_beta_tokens = this.utils.getHandSummitBetaTokens();
                        for (let type_arg of ['2', '3', '5', '8']) {
                            if (Object.values(hand_summit_beta_tokens).includes(type_arg)) {
                                const id = Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === type_arg);
                                const token = $(`summit_beta_${id}`);
                                this.onUndoSummitBetaPassive(token, Number(type_arg));
                            }
                        }
                        this.utils.enableSummitBetaTokens('climb_pitch');

                        const missing_water_psych = dojo.query('.water_psych_border').length;
                        const missing_gears = dojo.query('.gear_border').length;
                        const missing_skills = dojo.query('.skill_border').length;

                        if (requirements_met) { $('confirm_button').classList.remove('disabled'); }
                        if (requirements_met === 1 && !$('risk_it_message')) { $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                                `<span id="risk_it_message">${_('You may<br>risk it')}</span>`
                        ); }
                        if (!requirements_met && !$('requirements_message')) { $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                                `<span id="requirements_message">${_('Can\'t fulfill<br>requirements')}</span>`
                        ); }

                        if (pitch_num === '36' && requirements_met) { // The Trifecta
                            this.utils.updateTitlebar(_('You must choose Pitch exposure and type'));
                            const titlebar_addon = $('titlebar_addon');
                            const trifecta_box = $('trifecta_box');
                            $('confirm_button').classList.add('disabled');
                            trifecta_box.style.display = 'block';

                            // set popup to close if user clicks x or outside of element
                            const closePopup = () => {
                                trifecta_box.style.display = 'none';
                                this.bga.statusBar.addActionButton(_('Show options'), () => this.utils.chooseTrifectaOption('show_trifecta'), {
                                    id: 'trifecta_show_button',
                                    tooltip: _('Show Trifecta options'),
                                });
                                
                                this.utils.removeOutsideClickListener();
                            };

                            // attach close logic to X button
                            const close_button = $('trifecta_hide_button');
                            if (close_button) { close_button.onclick = () => closePopup(); }

                            // start listener
                            this.utils.setupOutsideClickListener(trifecta_box, closePopup);
                        }

                        this.requirements_met = requirements_met;
                    } else { $('confirm_button').classList.remove('disabled'); }
                }
            }
        },

        onConfirmPitch: function(evt) {
            dojo.stopEvent(evt);

            for (let ele of this.pitch_handlers) { ele.onclick = null; }
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

            let selected_pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
            let selected_hex = selected_pitch.id.slice(-2).replace(/^\D+/g, '');

            // Trifecta
            if (selected_pitch.classList.contains('p36')) {
                $('trifecta_undo_button').style.display = 'none';
            }

            // If the pitch has already been climbed
            for (const [player, pitch_list] of Object.entries(this.gamedatas.pitch_tracker)) {
                if (player != this.player_id && pitch_list.includes(`${selected_hex}`) && !this.already_climbed_trigger) {
                    this.already_climbed++;
                }
            }
            if (this.already_climbed > 0 && unfulfilled_icons > 0) {
                $titlebar_msg = dojo.string.substitute(_("As previously climbed, you must select ${already_climbed} Asset/s to ignore"), {
                    already_climbed: this.already_climbed
                });
                this.utils.updateTitlebar($titlebar_msg);
                this.utils.clicksOff('hard_off');
                this.addActionButton('my_undo_button', _('Undo Pitch'), 'undoOnSelectResources', null, false, 'red');
                if ($('risk_it_message')) { $('risk_it_message').remove(); }
                this.utils.enableRequirementButtons(document.querySelectorAll('.requirement_wrap:not(.fulfilled)'), 'onSelectConversion');
            }

            // Phil
            else if (this.character_id === '8' && !document.querySelector('.requirement_border') && unfulfilled_icons > 0) {
                this.utils.updateTitlebar(_('You must select an Asset to risk missing as Phil'));
                this.utils.clicksOff('hard_off');
                this.addActionButton('my_undo_button', _('Undo Pitch'), 'undoOnSelectResources', null, false, 'red');
                if ($('risk_it_message')) { $('risk_it_message').remove(); }
                this.utils.enableRequirementButtons(document.querySelectorAll('.requirement_wrap:not(.fulfilled)'), 'addRequirementBorder');
            }

            else { // not already climbed, not Phil or there is already a requirement border

                this.utils.updateTitlebar(_('You must select Assets'));
                if ($('confirm_button')) { $('confirm_button').remove(); }
                if ($('rest_button')) { $('rest_button').remove(); }

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

                    this.addActionButton('confirm_requirements_button', _('Climb'), 'onConfirmRequirements', null, false, 'blue');
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

                    this.addActionButton('risk_it_button', _('Risk it'), 'onConfirmRequirements', null, false, 'blue');
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
        
                this.addActionButton('my_undo_button', _('Undo Pitch'), 'undoOnSelectResources', null, false, 'red');

                const pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
                const hex_num = pitch.id.slice(-2).replace(/^\D+/g, '');
                const pitch_num = pitch.classList[pitch.classList.length-1].slice(-2).replace(/^\D+/g, '');
                const selected_pitch = dojo.query('.selected_pitch')[0];
                const pitch_requirements = this.gamedatas.pitches[pitch_num]['requirements'];

                const bound_handler = this.onSelectResource.bind(gameui); 
                dojo.query('#assets_wrap .asset').forEach(ele => {
                    ele.onclick = bound_handler;
                    this.resource_handlers.push(ele);
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
                    ele.onclick = bound_handler
                    this.resource_handlers.push(ele);
                });
                this.utils.resizeHand();

                // Dirtbag
                if (this.character_id === '3') {
                    this.addActionButton('dirtbag_button', '<div class="button_text_wrap">' + _('Substitute<br>Requirement') + '</div>', 'onSelectDirtbag', null, false, 'blue');
                    this.addTooltipHtml('dirtbag_button', _('Substitute a Gear card for another required Asset'), 500);
                }

                // Overstoker
                if (this.character_id === '5') {
                    this.addActionButton('overstoker_button', '<div class="button_text_wrap">' + _('Substitute<br>Requirement') + '</div>', 'onSelectOverstoker', null, false, 'blue');
                    this.addTooltipHtml('overstoker_button', _('Substitute a Psych for another required Asset'), 500);
                }

                // Crag Mama
                if (this.character_id === '9') {
                    const cutoff = this.board === 'desert' ? 21 : 27;
                    if (hex_num <= cutoff) {
                        this.addActionButton('crag_mama_button', _('<div class="button_text_wrap">Ignore<br>Requirement</div>'), 'onSelectCragMama', null, false, 'blue');
                        this.addTooltipHtml('crag_mama_button', _('Pay one fewer Asset'), 500);
                    }
                }

                // Bionic Woman
                if (this.character_id === '11') {
                    this.addActionButton('bionic_woman_button', '<div class="button_text_wrap">' + _('Substitute<br>Requirement') + '</div>', 'onSelectBionicWoman', null, false, 'blue');
                    this.addTooltipHtml('bionic_woman_button', _('Substitute a Skill Card for another Skill type'), 500);
                }

                // Buff Boulderer
                if (this.character_id === '12') {
                    const value = this.gamedatas.pitches[pitch_num]['value'];
                    if ([4, 5].includes(value)) {
                        this.utils.clicksOff('hard_off');
                        const asset_board_ele = $(`asset_board_${this.player_id}`);
                        asset_board_ele.querySelectorAll('.permanent_assets_wrapper > .gear_token_border').forEach(ele => { ele.style.display = 'none'; });
                        this.ignore = value === 4 ? 1 : 2;
                        const titlebar_msg = dojo.string.substitute(_("As Buff Boulderer, you must select ${ignore_num} requirement/s to ignore"), {
                            ignore_num: this.ignore
                        });
                        this.utils.updateTitlebar(titlebar_msg);

                        let icons = [];
                        if (document.querySelector('.requirement_border')) {
                            document.querySelectorAll('.requirement_border').forEach(ele => { icons.push(ele.parentElement); });
                        }
                        else { icons = document.querySelectorAll('.requirement_wrap'); }

                        this.utils.enableRequirementButtons(icons, 'onSelectConversion');
                    }
                }
            }
        },

        onConfirmBail: function(evt) {
            dojo.stopEvent(evt);

            const player_id = this.player_id;
            this.utils.clicksOff('hard_off');
            this.confirmationDialog('',
                () => {
                    this.utils.clicksOn('hard_on');
                    if (this.checkAction('confirmBail')) {
                        this.ajaxcall("/firstascent/firstascent/confirmBail.html", { lock: true }, this, function(result) {} );
                    }
                },
                () => { this.utils.clicksOn('hard_on'); }
            );
            const confirmation = document.querySelector('.standard_popin > .clear').firstElementChild;
            const msg_wrapper = document.createElement('div');
            msg_wrapper.id = 'msg_wrapper';
            confirmation.append(msg_wrapper);
            const msg = document.createElement('p');
            msg.classList.add('confirmation_msg');
            msg.innerHTML = _('You will lose<br>and won\'t gain any Assets during the next Rerack Phase');
            msg_wrapper.append(msg);
            msg.style.lineHeight = '3.6vmin';
            const buttons = msg_wrapper.previousElementSibling;
            buttons.style.marginTop = '3vmin';
            buttons.style.marginBottom = '-2vmin';
            const water_icon = document.createElement('div');
            water_icon.classList.add('water_psych', 'water');
            msg_wrapper.append(water_icon);
            const psych_icon = document.createElement('div');
            psych_icon.classList.add('water_psych', 'psych');
            msg_wrapper.append(psych_icon);
            const parent_to_text_offset = msg.offsetTop;
            const parent_to_icon_offset = water_icon.offsetTop;
            const offset = parent_to_text_offset - parent_to_icon_offset - 5;
            water_icon.style.transform = `translateY(${offset}px)`;
            water_icon.style.left = '16vmin';
            psych_icon.style.transform = `translateY(${offset}px)`;
            psych_icon.style.left = '17vmin';
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

            this.utils.undoTrifecta();

            const player_id = this.getActivePlayerId();
            this.utils.clicksOff('hard_off');
            this.confirmationDialog(_('You will not climb a Pitch this round.'),
                () => {
                    this.utils.disableSummitBetaTokens();
                    this.utils.clicksOn('hard_on');
                    if (this.checkAction('rest')) {
                        this.ajaxcall("/firstascent/firstascent/rest.html", { lock: true,
                            player_id : player_id
                        }, this, function(result) {} );
                    }
                },
                () => { this.utils.clicksOn('hard_on'); }
            );
        },

        onTrade: function(evt) {
            dojo.stopEvent(evt);

            dojo.query('#generalactions > .requirement_wrap').forEach(ele => { ele.remove(); });
            dojo.query('#requirements_message').forEach(ele => { ele.remove(); });
            dojo.query('.selected_pitch').forEach(ele => {
                ele.classList.remove('selected_pitch');
                ele.classList.add('available_pitch');
            });
            for (const ele of this.resource_handlers) { ele.onclick = null; }
            this.resource_handlers = [];
            dojo.query('.selected_resource').forEach(ele => {
                ele.classList.remove('selected_resource');
                ele.parentElement.classList.remove('selected_resource_wrap');
            });
            dojo.query('.permanent_assets_wrapper > .selected_token').forEach(ele => {
                ele.classList.remove('selected_token', 'selectable', 'cursor');
            });
            this.unnecessary_requirements = 0;
            
            this.removeActionButtons();
            this.utils.undoTrifecta();
            this.utils.updateTitlebar(_('You must choose 3 Assets of the same type'));

            const player_id = this.getActivePlayerId();

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmTradeResources', null, false, 'blue');
            $('confirm_button').classList.add('disabled');

            this.addActionButton('my_undo_button', _('Undo Trade'), dojo.hitch(this, function() {
                dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('selected_resource'); });
                dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
                this.utils.clicksOn('pitches');
                for (const ele of this.trade_handlers) { ele.onclick = null; }
                this.trade_handlers = [];
                this.restoreServerGameState();
            }), null, false, 'red');

            const available_types = this.utils.tradeEnabled();
            dojo.query('#assets_wrap .asset').forEach(ele => {
                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                const type_arg = this.gamedatas.asset_identifier[id];
                const type = this.utils.getAssetType(type_arg);
                if (available_types.includes(type)) {
                    ele.classList.add('cursor', 'selectable');
                    ele.parentElement.classList.add('selectable_wrap');
                    const bound_handler = this.onSelectTrade.bind(gameui);
                    ele.onclick = bound_handler;
                    this.trade_handlers.push(ele);
                }
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
                if ($('assets_wrap').querySelectorAll('.selected_resource').length === 0) {
                    const available_types = this.utils.tradeEnabled();
                    dojo.query('#assets_wrap .asset').forEach(ele => {
                        const id = ele.id.slice(-3).replace(/^\D+/g, '');
                        const type_arg = this.gamedatas.asset_identifier[id];
                        const type = this.utils.getAssetType(type_arg);
                        if (available_types.includes(type)) {
                            ele.classList.add('cursor', 'selectable');
                            ele.parentElement.classList.add('selectable_wrap');
                            const bound_handler = this.onSelectTrade.bind(gameui);
                            ele.onclick = bound_handler;
                            if (!this.trade_handlers.includes(ele)) {
                                this.trade_handlers.push(ele);
                            }
                        }
                    });
                }
            }
            else {
                asset_ele.classList.add('selected_resource');
                asset_ele.parentElement.classList.add('selected_resource_wrap');
                dojo.query('#assets_wrap .asset').forEach(ele => {
                    const id = ele.id.slice(-3).replace(/^\D+/g, '');
                    const type_arg = this.gamedatas.asset_identifier[id];
                    const type = this.utils.getAssetType(type_arg);
                    if (type !== asset_type) {
                        ele.onclick = null;
                        ele.classList.remove('cursor', 'selectable');
                        ele.parentElement.classList.remove('selectable_wrap');
                        const ele_idx = this.trade_handlers.indexOf(ele);
                        if (ele_idx !== -1) {
                            this.trade_handlers.splice(ele_idx, 1);
                        }
                    }
                });
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
            for (const ele of this.trade_handlers) { ele.onclick = null; }
            this.trade_handlers = [];

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
                const args = [ele, $('asset_discard'), 3, 'rotate'];
                cards_to_discard.push(this.utils.animationPromise.bind(null, ele, 'asset_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
            });

            this.utils.updateTitlebar(_('Discarding Asset/s'));
            Promise.all(cards_to_discard.map(func => { return func(); })).then( async () => {

                const portaledge = $('portaledge');
                this.portaledge_num = 1;

                dojo.query('.portaledge').forEach(deck => {
                    
                    dojo.place(`<div id="${deck.id}_minus_one" class="porta_minus">-</div><div id="${deck.id}_plus_one" class="porta_plus">+</div>`, deck);
                    const deck_minus_one = $(`${deck.id}_minus_one`);
                    const deck_plus_one = $(`${deck.id}_plus_one`);
                    deck_minus_one.classList.add('cursor');
                    deck_plus_one.classList.add('cursor');
                    const bound_handler = this.onSelectPortaledge.bind(gameui);
                    deck_minus_one.onclick = bound_handler;
                    deck_plus_one.onclick = bound_handler;
                    this.portaledge_selection_handlers.push(deck_minus_one);
                    this.portaledge_selection_handlers.push(deck_plus_one);
                });

                this.utils.updateTitlebar(_('You must take 1 card from the Portaledge'));
                portaledge.style.display = 'block';
                await this.utils.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
                portaledge.style.marginTop = 0;

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmTrade', null, false, 'blue');
                $('confirm_button').classList.add('disabled');
                this.addActionButton('my_undo_button', _('Undo Trade'), dojo.hitch(this, async function() {
                    dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('selected_resource'); });
                    dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
                    dojo.query('.pitch_click').forEach(ele => { ele.style.display = 'block'; });
                    const selected_ids = this.selected_cards.map(ele => ele.id.slice(-3).replace(/^\D+/g, ''));
                    const hand_slots = this.utils.resizeHand('asset', selected_ids);
                    selected_ids.forEach(id => {
                        $(`hand_asset_${hand_slots[id]}`).append($(`asset_card_${id}`)); 
                    });
                    this.selected_cards = null;
                    this.portaledge_num = null;
                    for (const ele of this.portaledge_selection_handlers) { ele.onclick = null; }
                    this.portaledge_selection_handlers = [];
                    await this.utils.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
                    dojo.query('.portaledge > .cursor').forEach(ele => { ele.remove(); });
                    dojo.query('.portaledge > .draw_num').forEach(ele => { ele.remove(); });
                    portaledge.style.marginTop = '-36.4061%';
                    portaledge.style.display = '';
                    this.restoreServerGameState();
                    this.utils.clicksOn();
                }), null, false, 'red');
            });
        },

        onConfirmTrade: function(evt) {
            dojo.stopEvent(evt);

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
            let revised_requirements = {...pitch_requirements}; // Phil

            if (action === 'deselect') {

                // Phil
                if (this.character_id === '8') {
                    const ignored_icon = document.querySelector('.ignored');
                    if (ignored_icon) {
                        const ignored_type = ignored_icon.parentElement.classList[1].slice(0, -5);
                        revised_requirements[ignored_type]--;
                    }
                }

                for (const ele of [...$('generalactions').children].reverse()) {

                    if (ele.classList.contains('requirement_wrap')) {

                        const icon_type = ele.classList[1].slice(0, -5);

                        if (
                               (asset_type === icon_type 
                            || (icon_type === 'any_skill' && asset_type != 'gear')) // any skill
                            && ele.classList.contains('fulfilled')
                            && selected_resources[icon_type] < revised_requirements[icon_type]
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
                    `<span id="bad_selection_message">${_('Unnecessary<br>Asset/s selected')}</span>`
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
            dojo.query('.selected_gear_border').forEach(token => {
                selected_tokens_arr['gear']++;
            })
            let selected_tokens = ''
            Object.values(selected_tokens_arr).forEach(num => { selected_tokens += num + ','; })

            // if guidebook is selected but no skill icon is selected, consider it unused and deselect it
            const sb_skills_wrapper = $('sb_skills_wrapper');
            if (sb_skills_wrapper && dojo.query('.selected_skill').length === 0) {

                sb_skills_wrapper.parentElement.classList.remove('selected_token');
                sb_skills_wrapper.parentElement.parentElement.classList.remove('selected_token_wrap');
                sb_skills_wrapper.remove();
            }
            else if (sb_skills_wrapper) {
                sb_skills_wrapper.querySelectorAll('.selectable_skill').forEach(ele => {
                    ele.classList.add('disable_for_risk_resolution');
                });
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

            // Trifecta
            let trifecta_selections = '';
            if (this.utils.trifecta_selections[this.getActivePlayerId()]) {
                trifecta_selections = this.utils.trifecta_selections[this.getActivePlayerId()];
            }

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
                    trifecta_selections : trifecta_selections,
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
                    trifecta_selections : trifecta_selections,
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
            const personal_objectives_box = $('personal_objectives_box');

            if (this.gamedatas.players[player_id]['character'] === '10' && this.gamedatas.current_state === 'crimperClimbingCards') { // Cool-Headed Crimper

                const crimper_display = document.getElementById('crimper_display');
                const crimper_display_1 = document.getElementById('crimper_display_1');
                const crimper_display_2 = document.getElementById('crimper_display_2');
                if (evt.target.innerHTML === 'Hide cards') { // hide
                    crimper_display.style.display = '';
                    climbing_dimmer.style.display = 'none';
                    evt.target.innerHTML = _('Show cards');
                    evt.target.classList.remove('shown');
                    evt.target.classList.add('hidden');
                    if (this.isCurrentPlayerActive()) { confirm_button.classList.add('disabled'); }
                    this.utils.removeOutsideClickListener();
                    
                } else { // show                    
                    crimper_display.style.display = 'block';
                    climbing_dimmer.style.display = 'block';
                    evt.target.innerHTML = _('Hide cards');
                    evt.target.classList.remove('hidden');
                    evt.target.classList.add('shown');
                    if (document.querySelector('.selected_asset')) { confirm_button.classList.remove('disabled'); }

                    // set popup to close if user clicks x or outside of element
                    const closePopup = () => {
                        $('show_hide_card_button').click();
                        
                        this.utils.removeOutsideClickListener();
                    };

                    // start listener
                    this.utils.setupOutsideClickListener([crimper_display_1, crimper_display_2], closePopup);
                }
            }

            else {

                const climbing_slot = $('climbing_slot');

                if (evt.target.innerHTML === 'Hide card') { // hide
                    climbing_slot.style.display = '';
                    climbing_dimmer.style.display = 'none';
                    evt.target.innerHTML = _('Show card');
                    evt.target.classList.remove('shown');
                    evt.target.classList.add('hidden');
                    if (this.isCurrentPlayerActive()) {
                        if (confirm_button.classList.contains('disabled')) {
                            this.confirm_disabled = true;
                        }
                        else { confirm_button.classList.add('disabled'); }
                    }
                    this.utils.removeOutsideClickListener();

                } else { // show
                    climbing_slot.style.display = 'block';
                    climbing_dimmer.style.display = 'block';
                    evt.target.innerHTML = _('Hide card');
                    evt.target.classList.remove('hidden');
                    evt.target.classList.add('shown');

                    const checkboxes = Array.from($('generalactions').querySelectorAll('.asset_checkbox'));
                    if (this.isCurrentPlayerActive()) {
                        if (
                            (document.querySelector('.selected_choice') && !this.confirm_disabled) ||
                            checkboxes.some(ele => ele.innerHTML.includes('\u2611'))) {
                                confirm_button.classList.remove('disabled');
                            }
                        else { this.confirm_disabled = false; }

                        const choice_top = dojo.query('#climbing_slot .a')[0];
                        const choice_bottom = dojo.query('#climbing_slot .b')[0];
                        if (choice_top) {
                            const bound_handler = this.onSelectClimbingCardChoice.bind(gameui);
                            choice_top.onclick = bound_handler;
                            choice_bottom.onclick = bound_handler;
                            this.climbing_card_choice_handlers.push(choice_top);
                            this.climbing_card_choice_handlers.push(choice_bottom);
                            choice_top.classList.add('cursor');
                            choice_bottom.classList.add('cursor');
                        }
                    }

                    // set popup to close if user clicks x or outside of element
                    const closePopup = () => {
                        $('show_hide_card_button').click();
                        
                        this.utils.removeOutsideClickListener();
                    };

                    // start listener
                    this.utils.setupOutsideClickListener(climbing_slot, closePopup);
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
                    `<span id="requirements_message">${_('No legal<br>targets')}</span>`
                );
            }

            else if (!this.choices_info[choice]['requirements_met']) {
                $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                    `<span id="requirements_message">${_('Can\'t fulfill<br>requirements')}</span>`
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
            const player_id = this.getActivePlayerId();

            if (evt.currentTarget.classList.contains('tucked_minus_click')) {
                const draw_box = evt.currentTarget.parentElement;
                const draw_num = dojo.query(`#${draw_box.id} > .tucked_draw_num`)[0];
                if (Number(draw_num.innerHTML) > 0) {
                    draw_num.innerHTML = String(Number(draw_num.innerHTML) - 1);
                    this.selected_tucked.pop();
                }
            }

            else if (evt.currentTarget.classList.contains('tucked_plus_click')) {
                const asset_board = $(`asset_board_${player_id}`);
                let tucked_draw_total = 0;
                asset_board.querySelectorAll('.tucked_draw_num').forEach(ele => {
                    tucked_draw_total += Number(ele.textContent);
                });
                const draw_box = evt.currentTarget.parentElement;
                const draw_num_ele = dojo.query(`#${draw_box.id} > .tucked_draw_num`)[0];
                const draw_num = Number(draw_num_ele.innerHTML);
                const asset_counter = draw_box.parentElement;
                const tucked_num = Number(asset_counter.querySelector('.asset_counter_num').innerHTML);
                if (tucked_num > draw_num && 
                    tucked_draw_total + 1 + dojo.query('.selected_resource').length <= this.discard_num) {

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
                
                const player_id = this.player_id;
                dojo.query(`#asset_board_${player_id} .played_asset`).forEach(ele => {

                    const id = ele.id.slice(-3).replace(/^\D+/g, '');
                    const arg = this.gamedatas.asset_identifier[id];
                    const type = this.utils.getAssetType(arg);

                    if ((type === this.discard_type || !this.discard_type || this.discard_type === 'any_asset') && !ele.classList.contains('selectable')) {
                        const bound_handler = this.onSelectAssetForDiscard.bind(gameui);
                        ele.onclick = bound_handler;
                        this.asset_selection_handlers.push(ele);
                        ele.classList.add('cursor', 'selectable');
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
                                const bound_handler = this.onSelectAssetForDiscard.bind(gameui);
                                minus_one.onclick = bound_handler;
                                plus_one.onclick = bound_handler;
                                this.asset_selection_handlers.push(minus_one);
                                this.asset_selection_handlers.push(plus_one);
                                minus_one.classList.add('cursor', 'selectable');
                                plus_one.classList.add('cursor', 'selectable');
                        }
                    }
                });
            } else if (hand_cards_num > selected_hand_cards) {
                dojo.query('.asset_board .selectable').forEach(ele => {
                    ele.classList.remove('cursor', 'selectable', 'selected_resource');
                    ele.onclick = null;
                });
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
            const portaledge = $('portaledge');
            if ($('requirements_message')) { $('requirements_message').remove(); }
            if ($('no_more_cards_message')) { $('no_more_cards_message').remove(); }

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
                if (!selected_classes.contains('draw')) {
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

                // make the minus button appear if it's not already there
                $(`${selected_deck.id}_minus_one`).style.display = '';

                selected_draw_num++;
                if (rest) { rest_resources++; }

            } else if (evt.currentTarget.id == `${selected_deck.id}_minus_one`) {
                if (selected_classes.contains('1')) {
                    selected_classes.remove('draw', '1');
                    dojo.destroy(`${selected_deck.id}_draw_num`);
                    if (this.bomber_anchor) { $('ba_draw_num').innerHTML = currently_selected - 1; }
                    operation = 'minus';
                    $(`${selected_deck.id}_minus_one`).style.display = 'none';
                } else if (selected_classes.contains('draw')) {
                    selected_classes.remove(selected_draw_str);
                    selected_classes.add(`${selected_draw_num-1}`);
                    $(`${selected_deck.id}_draw_num`).innerHTML = `${selected_draw_num-1}`;
                    if (this.bomber_anchor) { $('ba_draw_num').innerHTML = currently_selected - 1; }
                    operation = 'minus';
                }

                selected_draw_num--;
                if (rest) { rest_resources--; }
            }

            if (rest) { // resting state
                if (rest_resources === rest_num) {
                    portaledge.querySelectorAll('.porta_plus').forEach(ele => {
                        ele.style.display = 'none';
                    });
                    $('rest_water_plus_click').style.display = '';
                    $('rest_water_plus_symbol').style.display = '';
                    $('rest_psych_plus_click').style.display = '';
                    $('rest_psych_plus_symbol').style.display = '';
                }
                if (rest_resources === rest_num && $('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.remove('disabled');
                } else if (rest_resources < rest_num) {
                    portaledge.querySelectorAll('.porta_plus').forEach(ele => {
                        ele.style.display = '';
                    });
                    $('rest_water_plus_click').style.display = 'block';
                    $('rest_water_plus_symbol').style.display = 'block';
                    $('rest_psych_plus_click').style.display = 'block';
                    $('rest_psych_plus_symbol').style.display = 'block';
                    if (!$('confirm_button').classList.contains('disabled')) {
                        $('confirm_button').classList.add('disabled');
                    }                    
                }

            } else { // selectPortaledge state
                if (operation === 'plus' && currently_selected+1 === this.portaledge_num) {
                    portaledge.querySelectorAll('.porta_plus').forEach(ele => {
                        ele.style.display = 'none';
                    });
                    if ($('confirm_button').classList.contains('disabled')) {
                        $('confirm_button').classList.remove('disabled');
                    }
                }
                else if (operation === 'minus' && currently_selected-1 < this.portaledge_num) {
                    portaledge.querySelectorAll('.porta_plus').forEach(ele => {
                        ele.style.display = '';
                    });
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
                    if (water_draw_num - 1 === 0) {
                        $('rest_water_minus_click').style.display = '';
                        $('rest_water_minus_symbol').style.display = '';
                    }
                }
                else if (button.classList.contains('water_plus') && this.rest_resources < rest_num && (water + water_draw_num + 1) <= max_num) {
                    water_draw_num_ele.innerHTML = `${water_draw_num+1}`;
                    this.rest_resources++;
                    $('rest_water_minus_click').style.display = 'block';
                    $('rest_water_minus_symbol').style.display = 'block';
                }
                else if (button.classList.contains('water_plus') && this.rest_resources < rest_num && (water + water_draw_num + 1) > max_num) {
                    $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                        `<span id="requirements_message">${_('Can\'t gain any<br>more Water')}</span>`
                    );
                }
            
            } else if (button.parentElement.id == 'rest_psych') {
                const psych_draw_num_ele = $('rest_psych_draw_num');
                const psych_draw_num = Number($('rest_psych_draw_num').innerText);

                if (button.classList.contains('psych_minus') && psych_draw_num > 0) {
                    psych_draw_num_ele.innerHTML = `${psych_draw_num-1}`;
                    this.rest_resources--;
                    if (psych_draw_num - 1 === 0) {
                        $('rest_psych_minus_click').style.display = '';
                        $('rest_psych_minus_symbol').style.display = '';
                    }
                }
                else if (button.classList.contains('psych_plus') && this.rest_resources < rest_num && (psych + psych_draw_num + 1) <= max_num) {
                    psych_draw_num_ele.innerHTML = `${psych_draw_num+1}`;
                    this.rest_resources++;
                    $('rest_psych_minus_click').style.display = 'block';
                    $('rest_psych_minus_symbol').style.display = 'block';
                }
                else if (button.classList.contains('psych_plus') && this.rest_resources < rest_num && (psych + psych_draw_num + 1) > max_num) {
                    $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                        `<span id="requirements_message">${_('Can\'t gain any<br>more Psych')}</span>`
                    );
                }
            }

            if (this.rest_resources === rest_num) {
                portaledge.querySelectorAll('.porta_plus').forEach(ele => {
                    ele.style.display = 'none';
                });
                $('rest_water_plus_click').style.display = '';
                $('rest_water_plus_symbol').style.display = '';
                $('rest_psych_plus_click').style.display = '';
                $('rest_psych_plus_symbol').style.display = '';
                $('confirm_button').classList.remove('disabled');
            }
            else if (this.rest_resources < rest_num) {
                portaledge.querySelectorAll('.porta_plus').forEach(ele => {
                    ele.style.display = '';
                });
                $('rest_water_plus_click').style.display = 'block';
                $('rest_water_plus_symbol').style.display = 'block';
                $('rest_psych_plus_click').style.display = 'block';
                $('rest_psych_plus_symbol').style.display = 'block';
                if (!$('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.add('disabled');
                }
            }
        },

        onSelectAssetType: function(evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget;
            const checkbox = button.querySelector('.asset_checkbox');
            const confirm = $('confirm_button');
            if (button.firstElementChild.classList.contains('selected_asset_type')) {
                checkbox.innerHTML = '\u2610';
                if (!confirm.classList.contains('disabled')) { confirm.classList.add('disabled'); }
                button.firstElementChild.classList.remove('selected_asset_type');
            }
            else {
                dojo.query('#generalactions .skills_and_techniques').forEach(ele => {
                    if (!ele.parentElement.classList.contains('disabled')) {
                        const ele_checkbox = ele.firstElementChild;
                        ele_checkbox.innerHTML = '\u2610';
                        ele.classList.remove('selected_asset_type');
                    }
                });
                button.firstElementChild.classList.add('selected_asset_type');
                checkbox.innerHTML = '\u2611';
                if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
            }
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

            for (let pitch_num of available_pitches) {
                const border_ele = $(`pitch_${pitch_num}_border`);
                const click_ele = $(`pitch_${pitch_num}_click`);
                border_ele.classList.add('available_pitch');
                click_ele.classList.add('cursor');
                const bound_handler = this.onSelectPitch.bind(gameui);
                click_ele.onclick = bound_handler;
                this.pitch_handlers.push(click_ele);
            }

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAddTokenToPitch', null, false, 'blue');
            this.addActionButton('button_undo', _('Undo<br>Climbing Card'), () => this.onUndoClimbingCard(), undefined, undefined, 'red');
            $('confirm_button').classList.add('disabled');
        },

        onConfirmAddTokenToPitch: function(evt) {
            dojo.stopEvent(evt);

            const selected_pitch = dojo.query('.selected_pitch')[0];
            const pitch_type_arg = selected_pitch.nextElementSibling.classList[1].slice(1);

            for (const ele of this.pitch_handlers) { ele.onclick = null; }
            this.pitch_handlers = [];

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
                opponent_id = selected_resource_ele.parentElement.parentElement.parentElement.id.split('_').pop();
                let type = selected_resource_ele.parentElement.parentElement.id.slice(-5).replace(/_/g, '');
                let slot = selected_resource_ele.parentElement.id.slice(-1);
                flipped = this.gamedatas.board_assets[opponent_id][type]['flipped'][slot];
            }
            else {
                dojo.query('.tucked_draw_num').forEach(ele => {
                    if (Number(ele.innerHTML) > 0) {
                        const type = ele.parentElement.id.slice(-13, -8).replace(/_/g, '');
                        tucked_card_type = type;
                        opponent_id = ele.parentElement.parentElement.parentElement.parentElement.id.split('_').pop();
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

            for (const ele of this.token_selection_handlers) { ele.onclick = null; }
            dojo.query('.selectable_token').forEach((ele) => {
                ele.classList.remove('cursor');
            });

            const opponent_token_name = this.gamedatas.summit_beta_tokens[opponent_token_type_arg]['description'];
            const description_msg = dojo.string.substitute(_("Select an opponent to gain ${opponent_token_name}"), {
                opponent_token_name: opponent_token_name
            });
            this.gamedatas.gamestate.descriptionmyturn = description_msg;
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
            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmChooseSummitBetaOpponent', null, false, 'blue');
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
            const checkbox = button.querySelector('.token_checkbox');
            const confirm = $('confirm_button');
            if (button.firstElementChild.classList.contains('selected_technique_type')) {
                checkbox.innerHTML = '\u2610';
                if (!confirm.classList.contains('disabled')) { confirm.classList.add('disabled'); }
                button.firstElementChild.classList.remove('selected_technique_type');
            }
            else {
                dojo.query('#generalactions .skills_and_techniques').forEach(ele => {
                    if (ele.classList.contains('selected_technique_type')) {
                        const ele_checkbox = ele.firstElementChild;
                        ele_checkbox.innerHTML = '\u2610';
                        ele.classList.remove('selected_technique_type');
                    }
                });
                button.firstElementChild.classList.add('selected_technique_type');
                checkbox.innerHTML = '\u2611';
                if (confirm.classList.contains('disabled')) { confirm.classList.remove('disabled'); }
            }
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

            if (type.classList.contains('selected_asset_type')) {
                // deselect
                type.classList.remove('selected_asset_type');
                checkbox.innerHTML = '\u2610';

                if ($('requirements_message')) { $('requirements_message').remove(); }
            }
            else if (current_tokens + currently_selected < max_tokens) {
                // select
                type.classList.add('selected_asset_type');
                checkbox.innerHTML = '\u2611';

                if ($('requirements_message')) { $('requirements_message').remove(); }
            } else if (current_tokens + currently_selected == max_tokens) {
                if (!$('requirements_message')) {
                    $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                        `<span id="requirements_message" class="no_slots">${_('No more<br>available slots')}</span>`
                    );
                }
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
            this.utils.clicksOff('hard_off');
            this.confirmationDialog('',
                () => {
                    this.utils.clicksOn('hard_on');
                    if (this.checkAction('confirmPermanentAssets')) {
                        this.ajaxcall("/firstascent/firstascent/confirmPermanentAssets.html", { lock: true,
                            player_id : player_id,
                            gained_assets_str : gained_assets_str
                        }, this, function(result) {} );
                    }
                },
                () => { this.utils.clicksOn('hard_on'); }
            );
            const confirmation = document.querySelector('.standard_popin > .clear').firstElementChild;
            const msg_wrapper = document.createElement('div');
            msg_wrapper.id = 'msg_wrapper';
            confirmation.append(msg_wrapper);
            const msg = document.createElement('p');
            msg.classList.add('confirmation_msg');
            if (gained_assets_list.every(num => num === 0)) { msg.innerHTML = _('You will gain no Tokens'); }
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

                this.utils.undoTrifecta();
                this.utils.updateTitlebar(_('Use Rerack?'));

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaRerack', null, false, 'blue');
                this.addActionButton('my_undo_button', _('Undo Token'), 'onUndoSummitBeta', null, false, 'red');
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onConfirmSummitBetaRerack: function (evt) {
            dojo.stopEvent(evt);

            this.removeActionButtons();
            this.utils.updateTitlebar(_('Choose 2 Asset Cards'));

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmRerack', null, false, 'blue');
            $('confirm_button').classList.add('disabled');
            this.addActionButton('my_undo_button', _('Undo Token'), 'onUndoSummitBeta', null, false, 'red');

            const target_parent = $('portaledge').style.display === 'block' ? $('portaledge') : $('board');
            const discard_box = dojo.place(`<div id="discard_box"></div>`, target_parent);
            for (let [id, type_arg] of Object.entries(this.asset_discard)) {

                const asset = this.gamedatas.asset_cards[type_arg];
                const wrapper = dojo.place('<div class="discard_wrapper"></div>', discard_box);
                const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                    CARD_ID : id,
                    EXTRA_CLASSES : 'selectable cursor',
                    acX : asset.x_y[0],
                    acY : asset.x_y[1],
                }), wrapper);
                const bound_handler = this.onSelectRerack.bind(gameui);
                asset_ele.onclick = bound_handler;
                this.rerack_handlers.push(asset_ele);
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

            for (const ele of this.rerack_handlers) { ele.onclick = null; }
            this.rerack_handlers = [];

            let reracked_assets = '';
            const selected_assets = dojo.query('.selected_resource');
            selected_assets.forEach(ele => {
                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                reracked_assets += `${id},`;
            });

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

                this.utils.undoTrifecta();
                this.utils.updateTitlebar(_('Use Energy Drink?'));

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaEnergyDrink', null, false, 'blue');
                this.addActionButton('my_undo_button', _('Undo Token'), 'onUndoSummitBeta', null, false, 'red');

                const water_cube = dojo.query(`#player_${this.player_id} .cb_water`)[0];
                const psych_cube = dojo.query(`#player_${this.player_id} .cb_psych`)[0];
                const water_current = Number(water_cube.parentElement.id.at(-1));
                const psych_current = Number(psych_cube.parentElement.id.at(-1));
                const max_num = dojo.query(`#player_${this.player_id} .cube_wrap`).length / 2 - 1;

                if (water_current === max_num && psych_current === max_num) {
                    $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                        `<span id="maxed_out_message">${_('Your Water and<br>Psych are full')}</span>`
                    );
                    $('confirm_button').classList.add('disabled');
                }
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onConfirmSummitBetaEnergyDrink: function (evt) {
            dojo.stopEvent(evt);

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

                this.utils.undoTrifecta();
                this.utils.updateTitlebar(_('Use Simul Climb?'));

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaSimulClimb', null, false, 'blue');
                this.addActionButton('my_undo_button', _('Undo Token'), 'onUndoSummitBeta', null, false, 'red');
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != old_bottom) { this.utils.resizeHand(); }
        },

        onConfirmSummitBetaSimulClimb: function (evt) {
            dojo.stopEvent(evt);

            this.removeActionButtons();
            this.utils.updateTitlebar(_('Choose 3 Asset cards from the Deck and/or Spread'));

            dojo.place('<div id="minus_one" class="draw_button">-</div><div id="plus_one" class="draw_button">+</div>', 'asset_deck');
            const bound_handler = this.onSelectSimulClimb.bind(gameui);
            const minus_one = $('minus_one');
            minus_one.classList.add('cursor');
            minus_one.onclick = bound_handler;
            const plus_one = $('plus_one');
            plus_one.classList.add('cursor');
            plus_one.onclick = bound_handler;
            $('asset_deck').classList.add('selectable');

            for (let slot=0; slot<=3; slot++) {
                const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                available_asset.classList.add('selectable', 'cursor');
                available_asset.style.pointerEvents = '';
                const bound_handler = this.onSelectSimulClimb.bind(gameui);
                available_asset.onclick = bound_handler;
                this.simul_climb_handlers.push(available_asset);
            }

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaSimulClimbAssets', null, false, 'blue');
            this.addActionButton('my_undo_button', _('Undo Token'), 'onUndoSummitBeta', null, false, 'red');
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
            let spread_slots = '';
            dojo.query('.selected_asset').forEach((ele) => {
                const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
                spread_to_draw += `${asset_id},`;
                const slot = ele.parentElement.id.slice(-1);
                spread_slots += `${slot},`;
            });

            const deck_classes = $('asset_deck').classList;
            const deck_to_draw = Number(deck_classes[deck_classes.length - 1]) || 0;

            this.enabled_summit_beta_tokens--;
            if (this.enabled_summit_beta_tokens < 1) { document.getElementById('available_sb_message').remove(); }

            for (const ele of this.simul_climb_handlers) { ele.onclick = null; }
            this.simul_climb_handlers = [];

            if (this.checkAction('confirmAssets')) {
                this.ajaxcall("/firstascent/firstascent/confirmAssets.html", { lock: true,
                    spread_assets : spread_to_draw,
                    spread_slots : spread_slots,
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

                this.utils.undoTrifecta();
                this.utils.updateTitlebar(_('Use Bomber Anchor?'));

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaBomberAnchor', null, false, 'blue');
                this.addActionButton('my_undo_button', _('Undo Token'), 'onUndoSummitBeta', null, false, 'red');
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

                const bound_handler = this.onSelectPortaledge.bind(gameui);
                deck_minus_one.onclick = bound_handler;
                this.portaledge_selection_handlers.push(deck_minus_one);
                deck_plus_one.onclick = bound_handler;
                this.portaledge_selection_handlers.push(deck_plus_one);
            });

            portaledge.style.display = 'block';
            await this.utils.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
            portaledge.style.marginTop = 0;
            
            dojo.query('.hand_asset_wrap > .asset').forEach(ele => {

                const bound_handler = this.onSelectBomberAnchorDiscard.bind(gameui);
                ele.onclick = bound_handler;
                this.bomber_anchor_selection_handlers.push(ele);
                if (ele.style.pointerEvents = 'none') { ele.style.pointerEvents = ''; }
                ele.classList.add('cursor', 'selectable');
                ele.parentElement.classList.add('selectable_wrap');
            });

            this.bomber_anchor = true;

            this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaBomberAnchorAssets', null, false, 'blue');
            this.addActionButton('my_undo_button', _('Undo Token'), 'onUndoSummitBeta', null, false, 'red');
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

            for (const ele of this.portaledge_selection_handlers) { if (ele) { ele.onclick = null; } }
            this.portaledge_selection_handlers = [];
            this.portaledge_num = null;
            this.bomber_anchor = false;

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

                const selected_asset_cards = document.querySelectorAll('.selected_resource');
                const selected_skill_tokens = document.querySelectorAll('.asset_board .selected_token');
                const selected_assets = [...selected_asset_cards, ...selected_skill_tokens];
                const selected_gear_tokens = document.querySelectorAll('.asset_board .selected_gear_border');
                selected_gear_tokens.forEach(ele => {
                    selected_assets.push(ele.nextElementSibling);
                })
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
                
                const skills_wrapper = document.createElement('div');
                skills_wrapper.id = 'sb_skills_wrapper'
                skills_wrapper.innerHTML = `
                    <div id="sb_face" class="skills_and_techniques face_token selectable_skill cursor"></div>
                    <div id="sb_crack" class="skills_and_techniques crack_token selectable_skill cursor"></div>
                    <div id="sb_slab" class="skills_and_techniques slab_token selectable_skill cursor"></div>
                `;
                token.append(skills_wrapper);

                const bound_handler = this.onSelectSBSkill.bind(gameui);
                $('sb_face').onclick = bound_handler;
                $('sb_crack').onclick = bound_handler;
                $('sb_slab').onclick = bound_handler;

                this.guidebook_token = token;
            }

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onSelectSBSkill: function(evt) {
            dojo.stopEvent(evt);

            const skill = evt.currentTarget;
            const type = skill.id.slice(3);

            if (this.guidebook_requirements && ['gear', 'face', 'crack', 'slab'].includes(this.guidebook_type) && this.guidebook_type !== type) {
                
                dojo.query('.selected_skill').forEach(ele => {
                    if (ele != skill) { ele.click(); }
                });
            }

            const action = skill.classList.contains('selected_skill') ? 'deselect' : 'select';

            if (action === 'select') {

                const requirement_borders = $('generalactions').querySelectorAll('.requirement_border');
                const borders_num = requirement_borders.length;
                for (const ele of requirement_borders) {
                    const border_wrap = ele.parentElement;
                    const border_type = border_wrap.classList[1].slice(0, -5);
                    if (type === border_type || (['face', 'crack', 'slab'].includes(type) && border_type === 'any_skill' && borders_num === 1)) {
                        this.border_removed = true;
                        border_wrap.classList.add('red_border_removed');
                        ele.remove();
                        break;
                    }
                }
            }
            else if (action === 'deselect') {
                const icon_wrap = $('generalactions').querySelector('.red_border_removed');
                const ignored_icon_border = document.querySelector('.ignored');
                if (icon_wrap) {
                    const red_border = document.createElement('div');
                    red_border.classList.add('skill_border', 'requirement_border');
                    icon_wrap.prepend(red_border);
                    icon_wrap.classList.remove('red_border_removed');
                }
                if (this.border_removed && ignored_icon_border) {
                    ignored_icon_border.remove();
                    delete this.border_removed;
                }
            }

            const updated_requirements = this.utils.updateRequirementsForSB();
            if (updated_requirements) { this.guidebook_requirements = true; }
            else { this.guidebook_requirements = 1; }

            this.guidebook_type = type;

            this.onSelectResource(evt);

            // Phil or pitch has been previously climbed
            if ((this.character_id === '8' || this.already_climbed_trigger) &&
                !$('confirm_button') &&
                this.border_removed &&
                !this.phil_redo) {
                this.phil_redo = true;
                const token = skill.parentElement.parentElement;
                const hand_ele = $('assets_wrap');
                let selected_summit_betas = [];
                const selected_pitch = $('pitches').querySelector('.selected_pitch').parentElement;
                const pitch_click = selected_pitch.querySelector('.pitch_click');
                hand_ele.querySelectorAll('.selected_token').forEach(ele => {
                    if (token !== ele) { selected_summit_betas.push(ele); }
                });
                this.undoOnSelectResources();
                pitch_click.click();
                selected_summit_betas.forEach(ele => { ele.firstElementChild.click(); });
                token.firstElementChild.click();
                const new_skill = $(`sb_${type}`);
                new_skill.click();
                this.phil_redo = false;
                $('confirm_button').click();
            }
        },

        onSummitBetaJesusPiece(evt) {
            dojo.stopEvent(evt);

            const token = evt.currentTarget.parentElement;

            const hand_ele = $('assets_wrap');
            const previous_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;

            if (token.classList.contains('selected_token')) { this.onUndoSummitBetaPassive(token, 10); }

            else {

                token.classList.add('selected_token');
                token.parentElement.classList.add('selected_token_wrap');
                token.firstElementChild.style.border = 'unset';
                token.firstElementChild.style.boxShadow = 'unset';

                const climbing_card_type_arg = this.utils.getCurrentClimbingCard();
                const selected_choice = this.gamedatas.current_state === 'climbingCard' ? dojo.query('.selected_choice')[0].classList[1]: null ;

                if ($('requirements_message')) { $('requirements_message').remove(); }
                $('generalactions').lastElementChild.insertAdjacentHTML('afterend',
                    `<span id="jesus_piece_message">${_('Using<br>Jesus Piece')}</span>`
                );
                dojo.query('.requirement_wrap').forEach(ele => { ele.remove(); });
                let i = 1;

                this.jesus_piece_requirements = climbing_card_type_arg === '49' && (selected_choice === 'a' || this.gamedatas.current_state === 'selectOpponent') ? 'jesus_party' : 'true';

                if ($('confirm_button') && !(climbing_card_type_arg === '49' && this.gamedatas.current_state === 'selectOpponent')) { $('confirm_button').classList.remove('disabled'); }

                if (this.gamedatas.current_state === 'selectOpponent' && this.jesus_piece_requirements !== 'jesus_party')  {
                    dojo.query('.selected_opponent').forEach(ele => {
                        ele.classList.remove('selected_opponent');
                    });
                    dojo.query('.opponent').forEach(ele => {
                        ele.classList.add('disabled');
                        this.disabled_opponent_buttons.push([ele.id, ele.style.background]);
                        ele.style.setProperty('background', '#787878', 'important');
                    });
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

                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmSummitBetaLuckyChalkbag', null, false, 'blue');
                this.addActionButton('my_undo_button', _('Undo Token'), 'onUndoSummitBeta', null, false, 'red');
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
                const climbing_sb_tokens = [
                    Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === '2'),
                    Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === '3'),
                    Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === '5'),
                    Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === '8'),
                ];
                dojo.query('.selected_token').forEach(ele => {
                    const ele_id = ele.id.slice(-2);
                    if (this.gamedatas.gamestate.name !== 'riskSummitBeta' || !climbing_sb_tokens.includes(ele_id)) {
                        ele.classList.remove('selected_token');
                        ele.parentElement.classList.remove('selected_token_wrap');
                    }
                });
                dojo.query('.selectable_token').forEach(ele => { ele.firstElementChild.style.display = 'none'; });
                while (asset_deck.firstElementChild) { asset_deck.removeChild(asset_deck.lastElementChild); }
                dojo.query('.cursor').forEach(ele => { ele.style.pointerEvents = ''; });
                dojo.query('#assets_wrap .asset').forEach(ele => { ele.style.pointerEvents = ''; });
                if ($('discard_box')) { $('discard_box').remove(); }
                $('asset_deck').classList.remove('selectable');
                dojo.query('.spread > .selected_asset').forEach(ele => { ele.classList.remove('selected_asset'); });
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
                    portaledge.querySelectorAll('.porta_plus').forEach(ele => { ele.remove(); });
                    portaledge.querySelectorAll('.porta_minus').forEach(ele => { ele.remove(); });
                    portaledge.querySelectorAll('.draw_num').forEach(ele => { ele.remove(); });
                    document.querySelectorAll('.hand_asset_wrap > .selected_resource').forEach(ele => {
                        ele.classList.remove('selectable', 'selected_resource');
                        ele.parentElement.classList.remove('selectable_wrap');
                    });
                    for (const ele of this.bomber_anchor_selection_handlers) { ele.onclick = null; }
                    this.bomber_anchor_selection_handlers = [];
                }
                this.simul_climb_handlers = [];
                if (this.gamedatas.current_state === 'chooseSummitBetaToken') { $('summit_pile').style.zIndex = '201'; }
                this.removeActionButtons();
                this.restoreServerGameState();
                const show_hide_card_button = $('show_hide_card_button');
                if (show_hide_card_button) { show_hide_card_button.click(); }
                resolve();
            });
        },

        onUndoSummitBetaPassive: function(token_ele, type_arg) {

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
                    if (this.guidebook_requirements && this.gamedatas.gamestate.name === 'climbOrRest' && !document.querySelector('#my_undo_button')) {

                        const pitch_click = document.querySelector('.selected_pitch').nextElementSibling.nextElementSibling;
                        this.already_climbed = 0;
                        this.already_climbed_trigger = false;
                        pitch_click.parentElement.parentElement.style.marginRight = '';
                        pitch_click.click();
                        pitch_click.click();
                    } else {
                        const check_requirements = this.utils.checkRequirements();
                        const pitch_requirements = check_requirements[1];
                        document.querySelectorAll('.ignored').forEach(ele => {
                            const type = ele.parentElement.classList[1].slice(0, -5);
                            if (pitch_requirements[`${type}`] > 0) {
                                ele.remove();
                            }
                        });
                    }
                    delete this.guidebook_requirements;
                    delete this.guidebook_token;
                    delete this.guidebook_type;
                    delete this.border_removed;
                    break;
                case 10: // jesus piece
                    if (this.gamedatas.current_state === 'selectOpponent' && this.jesus_piece_requirements !== 'jesus_party') {
                        $('confirm_button').classList.add('disabled');
                        this.disabled_opponent_buttons.forEach(opponent => {
                            const ele_id = opponent[0];
                            const color = opponent[1];
                            const ele = $(ele_id);
                            ele.style.setProperty('background', `${color}`, 'important');
                            ele.classList.remove('disabled');
                        });
                    }
                    this.disabled_opponent_buttons = [];
                    $('jesus_piece_message').remove();
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
            dojo.query('.ignored').forEach(ele => { ele.remove(); });
            this.unnecessary_requirements = 0;
            this.already_climbed = 0;
            this.already_climbed_trigger = false;
            delete this.phil;
            const hand_summit_beta_tokens = this.utils.getHandSummitBetaTokens();
            for (let type_arg of ['2', '3', '5', '8']) {
                if (Object.values(hand_summit_beta_tokens).includes(type_arg)) {
                    const id = Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === type_arg);
                    const token = $(`summit_beta_${id}`);
                    this.onUndoSummitBetaPassive(token, Number(type_arg));
                }
            }
            // Trifecta
            this.utils.undoTrifecta();

            this.onUndoSummitBeta();
            this.utils.disableSummitBetaTokens();
            this.restoreServerGameState();

            const new_bottom = hand_ele.children[hand_ele.children.length-1].getBoundingClientRect().bottom;
            if (new_bottom != previous_bottom) { this.utils.resizeHand(); }
        },

        onConfirmRiskSummitBeta: function(evt) {
            dojo.stopEvent(evt);

            this.utils.clicksOff('hard_off');
            this.confirmationDialog('',
                () => {
                    this.utils.clicksOn('hard_on');
                    if (this.checkAction('confirmRiskSummitBeta')) {
                        this.ajaxcall("/firstascent/firstascent/confirmRiskSummitBeta.html", { lock: true }, this, function(result) {} );
                    }
                },
                () => { this.utils.clicksOn('hard_on'); }
            );
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
                    const selected_sb_tokens = document.querySelectorAll('.selected_token.summit_beta');
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
                    const selected_sb_tokens = document.querySelectorAll('.selected_token.summit_beta');
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
                document.querySelector('.button_text_wrap').innerHTML = _('Ignore<br>Requirement');
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
                                icon.classList.add('selectable', 'cursor');
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
                button.className = button.classList[0] || "";
                this.utils.clicksOn('hard_on');

                // redo fulfilled requirements
                const selected_resources = document.querySelectorAll('.selected_resource');
                const selected_sb_tokens = document.querySelectorAll('.selected_token.summit_beta');
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
                    const selected_sb_tokens = document.querySelectorAll('.selected_token.summit_beta');
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
            let icon_removed = false;
            let conversion_finished = true;

            // Pitch has already been climbed
            if (this.already_climbed > 0) {
                icon.remove();
                icon_removed = true;
                this.already_climbed--;
                this.ignore_types.push(type);
                this.already_climbed_trigger = true;

                if (this.already_climbed > 0) { conversion_finished = false; }
            }

            // Dirtbag
            else if (document.querySelector('.dirtbag_selected')) {
                icon.classList.add('gear_wrap');

                // init redo fulfilled requirements
                const selected_resources = document.querySelectorAll('.selected_resource');
                const selected_sb_tokens = document.querySelectorAll('.selected_token.summit_beta');
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
                const selected_sb_tokens = document.querySelectorAll('.selected_token.summit_beta');
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
                const selected_sb_tokens = document.querySelectorAll('.selected_token.summit_beta');
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
                const selected_sb_tokens = document.querySelectorAll('.selected_token.summit_beta');
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
                    const titlebar_msg = dojo.string.substitute(_("As Buff Boulderer, you must select ${ignore_num} requirement/s to ignore"), {
                        ignore_num: this.ignore
                    });
                    this.utils.updateTitlebar(titlebar_msg);
                    let icons = [];
                    if (document.querySelector('.requirement_border')) {
                        document.querySelectorAll('.requirement_border').forEach(ele => { icons.push(ele.parentElement); });
                    }
                    else { icons = document.querySelectorAll('.requirement_wrap'); }
                    this.utils.enableRequirementButtons(icons, 'onSelectConversion');
                    conversion_finished = false;
                    return;
                }
            }

            this.utils.clicksOn('hard_on');
            const check_requirements = this.utils.checkRequirements();
            const selected_resources = check_requirements[0];
            const pitch_requirements = check_requirements[1];

            if (conversion_finished) {
                $('generalactions').querySelectorAll('.requirement_wrap').forEach(icon => { icon.onclick = null; });
            }

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
            this.notifqueue.setSynchronous('dealPersonalObjectives');
            dojo.subscribe('dealOpponentObjectives', this, "notif_dealOpponentObjectives");
            this.notifqueue.setSynchronous('dealOpponentObjectives');
            this.notifqueue.setIgnoreNotificationCheck('dealOpponentObjectives', (notif) => (notif.args.player_id == this.player_id));

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

            dojo.subscribe('confirmBail', this, "notif_confirmBail");
            this.notifqueue.setSynchronous('confirmBail');

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

            dojo.subscribe('updatePlayerTokenTracker', this, "notif_updatePlayerTokenTracker");

            dojo.subscribe('addZombie', this, "notif_addZombie");
            dojo.subscribe('updatePlayerNamesAndColors', this, "notif_updatePlayerNamesAndColors");

            dojo.subscribe('cleanUpClimbOrRest', this, "notif_cleanUpClimbOrRest");
            this.notifqueue.setSynchronous('cleanUpClimbOrRest');
            
            dojo.subscribe('preGameEnd', this, "notif_preGameEnd");
            this.notifqueue.setSynchronous('preGameEnd');

            dojo.subscribe('debug', this, "notif_debug");
        },

        notif_debug: function(notif) {
            
        },

        notif_confirmCharacter: function(notif) {
            this.utils.clicksOff();

            // close character popup and reset character selection area
            if (typeof this.closeCharacterPopup === 'function') {
                this.closeCharacterPopup();
            }

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

                const asset_board_button = document.querySelector('.asset_board_button');
                if (asset_board_button) { asset_board_button.remove(); }

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
            dojo.query('.name_span').forEach(ele => {
                if (ele.innerHTML === active_player.name) {
                    ele.style.color = `#${character_color}`;
                }
            });

            // populate player_names_and_colors
            this.gamedatas.players[player_id]['character'] = character_num;
            this.gamedatas.player_names_and_colors = notif.args.player_names_and_colors;

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
            const meeple_destination = `${player_id}_water_and_psych`;
            dojo.place(this.format_block('jstpl_meeple', {
                player_id : player_id,
                mX : mx_y[0],
                mY : mx_y[1]
            }), meeple_destination);

            // remove styling, move div, animate slide
            
            const character_area = dojo.query(`#player_${player_id} .character_ratio_child`)[0];

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

            const addAssetBoard = () => {
                const player_id = notif.args.player_id;
                const character_num = notif.args.character_num;
                const character = this.gamedatas.characters[character_num];
                const character_name = character.name;
                const ab_pos = character['ab_x_y'];
                if (character_name === 'free_soloist') {
                    asset_board = dojo.place(this.format_block('jstpl_fs_asset_board', {
                        player : player_id,
                        character : character_name,
                        abX : ab_pos[0],
                        abY : ab_pos[1],
                    }), `character_${character_num}`);
                    delete gameui.gamedatas.board_assets[player_id]['gear'];
                }
                else if (character_name === 'young_prodigy') {
                    asset_board = dojo.place(this.format_block('jstpl_yp_asset_board', {
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
                    asset_board = dojo.place(this.format_block('jstpl_asset_board', {
                        player : player_id,
                        character : character_name,
                        abX : ab_pos[0],
                        abY : ab_pos[1],
                    }), `character_${character_num}`);
                }
            }
            
            // reset character selection
            if (this.isCurrentPlayerActive()) {
                character_div.classList.remove('cursor');
                $('selection_dimmer').classList.remove('dim_bg');
                document.querySelector('.character_placeholder').remove();
                [...$('character_selection').children].forEach(ele => {
                    ele.classList.remove('popout');
                });
                if (this.handleOutsideClick) {
                    window.removeEventListener('click', this.handleOutsideClick);
                    this.handleOutsideClick = null;
                }
            }
            else {
                addAssetBoard();
            }

            if (this.utils.shouldAnimate()) {

                const animateCharacter = async () => {
                    this.utils.updateTitlebar(_('Placing Character and dealing Personal Objectives'));
                    const args = [character_div, character_area, null, false, true];
                    await this.utils.animationPromise(character_div, 'select_character', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                    this.utils.clicksOn();
                    this.notifqueue.setSynchronousDuration();
                }
                animateCharacter();
            } else { 
                if (this.isCurrentPlayerActive()) {
                    addAssetBoard();
                }
                character_area.append(character_div);

                this.utils.clicksOn();
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_dealPersonalObjectives: async function (notif) {

            const current_personal_objectives = notif.args.current_personal_objectives;
            const objective_1_type_arg = current_personal_objectives[0];
            const objective_2_type_arg = current_personal_objectives[1];
            const objective_1 = this.gamedatas.personal_objectives[objective_1_type_arg];
            const objective_2 = this.gamedatas.personal_objectives[objective_2_type_arg];
            const po_coords_1 = objective_1['x_y'];
            const po_coords_2 = objective_2['x_y'];
            const objective_1_wrap = $('personal_objective_1_wrap');
            const objective_2_wrap = $('personal_objective_2_wrap');

            if (this.utils.shouldAnimate()) {
                this.utils.clicksOff();

                // place flippable elements in destination and get dimensions
                const objective_1_flip_ele = dojo.place(this.format_block('jstpl_flip_card', {
                    card_id : objective_1_type_arg,
                    extra_classes : 'objective_flip_1',
                    back_type : 'personal_objective objective_back_for_flip',
                    front_type : 'personal_objective',
                    cX : po_coords_1[0],
                    cY : po_coords_1[1],
                }), 'personal_objective_1_wrap');
                const objective_2_flip_ele = dojo.place(this.format_block('jstpl_flip_card', {
                    card_id : objective_2_type_arg,
                    extra_classes : 'objective_flip_2',
                    back_type : 'personal_objective objective_back_for_flip',
                    front_type : 'personal_objective',
                    cX : po_coords_2[0],
                    cY : po_coords_2[1],
                }), 'personal_objective_2_wrap');
                this.utils.resizeHand();
                const objective_dimensions = objective_1_flip_ele.getBoundingClientRect();

                // move flippable elements to board and make invisible to set up for animating
                objective_1_flip_ele.style.opacity = '0';
                objective_2_flip_ele.style.opacity = '0';
                $('character_selection').append(objective_1_flip_ele);
                $('character_selection').append(objective_2_flip_ele);
                objective_1_flip_ele.style.height = objective_dimensions.height + 'px';
                objective_1_flip_ele.style.width = objective_dimensions.width + 'px';
                objective_2_flip_ele.style.height = objective_dimensions.height + 'px';
                objective_2_flip_ele.style.width = objective_dimensions.width + 'px';

                // animate flippable elements appearing from off-board to the right while sliding onto the board
                this.utils.animationPromise(objective_1_flip_ele, 'objective_appears', 'anim', null, false, false);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 500)) })();
                await this.utils.animationPromise(objective_2_flip_ele, 'objective_appears', 'anim', null, false, false);
                this.utils.animationPromise(objective_1_flip_ele.firstElementChild, 'flip_transform', 'anim', null, false, false);
                await this.utils.animationPromise(objective_2_flip_ele.firstElementChild, 'flip_transform', 'anim', null, false, false);

                // replace flippable elements with simple face-up cards
                objective_1_flip_ele.remove();
                objective_2_flip_ele.remove();
                const objective_1_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                    poId : objective_1_type_arg,
                    poX : po_coords_1[0],
                    poY : po_coords_1[1],
                }), 'character_selection');
                objective_1_ele.classList.add('objective_1_board');
                objective_1_ele.style.height = objective_dimensions.height + 'px';
                objective_1_ele.style.width = objective_dimensions.width + 'px';
                const objective_2_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                    poId : objective_2_type_arg,
                    poX : po_coords_2[0],
                    poY : po_coords_2[1],
                }), 'character_selection');
                objective_2_ele.classList.add('objective_2_board');
                objective_2_ele.style.height = objective_dimensions.height + 'px';
                objective_2_ele.style.width = objective_dimensions.width + 'px';

                // animate cards from board to hand
                let args = [objective_1_ele, objective_1_wrap, null, false, true];
                this.utils.animationPromise(objective_1_ele, 'objective_board_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                args = [objective_2_ele, objective_2_wrap, null, false, true];
                await this.utils.animationPromise(objective_2_ele, 'objective_board_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                objective_1_ele.classList.remove('objective_1_board');
                objective_2_ele.classList.remove('objective_2_board');

                // init tracker and attach tooltips
                gameui.gamedatas.personal_objectives_tracker = {
                    [objective_1_type_arg] : [],
                    [objective_2_type_arg] : [],
                };
                this.utils.personalObjectiveTooltip(`personal_objective_${objective_1_type_arg}`, objective_1_type_arg);
                this.utils.personalObjectiveTooltip(`personal_objective_${objective_2_type_arg}`, objective_2_type_arg);
                
                this.utils.clicksOn();
                this.notifqueue.setSynchronousDuration();

            } else { // shouldn't animate

                // place cards in hand
                const objective_1_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                    poId : objective_1_type_arg,
                    poX : po_coords_1[0],
                    poY : po_coords_1[1],
                }), objective_1_wrap);
                const objective_2_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                    poId : objective_2_type_arg,
                    poX : po_coords_2[0],
                    poY : po_coords_2[1],
                }), objective_2_wrap);
                this.utils.resizeHand();

                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_dealOpponentObjectives: async function (notif) {

            if (this.utils.shouldAnimate()) {

                // place card backs in hand and get dimensions
                const objective_1_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                    poId : 'temp_1',
                    poX : 600,
                    poY : 100,
                }), 'personal_objective_1_wrap');
                const objective_2_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                    poId : 'temp_2',
                    poX : 600,
                    poY : 100,
                }), 'personal_objective_2_wrap');
                objective_1_ele.classList.add('objective_back_for_flip', 'objective_flip_1');
                objective_2_ele.classList.add('objective_back_for_flip', 'objective_flip_2');
                objective_1_ele.firstElementChild.remove();
                objective_2_ele.firstElementChild.remove();
                this.utils.resizeHand();
                const objective_dimensions = objective_1_ele.getBoundingClientRect();

                // move card backs to board and make invisible to set up for animating
                objective_1_ele.style.opacity = '0';
                objective_2_ele.style.opacity = '0';
                $('board').insertBefore(objective_1_ele, $('board').children[2]);
                $('board').insertBefore(objective_2_ele, $('board').children[3]);
                this.utils.resizeHand();
                objective_1_ele.style.setProperty('--objective_width', objective_dimensions.width + 'px');
                objective_1_ele.style.setProperty('--objective_height', objective_dimensions.height + 'px');
                objective_2_ele.style.setProperty('--objective_width', objective_dimensions.width + 'px');
                objective_2_ele.style.setProperty('--objective_height', objective_dimensions.height + 'px');

                // animate card backs appearing from off-board to the right while sliding onto the board
                const player_id = notif.args.player_id;
                this.utils.animationPromise(objective_1_ele, 'objective_appears', 'anim', null, false, false);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 500)) })();
                await this.utils.animationPromise(objective_2_ele, 'objective_appears', 'anim', null, false, false);

                // set up card backs for animating
                const hand_counter = $(`hand_counter_${player_id}`);
                objective_1_ele.classList.remove('objective_appears');
                objective_2_ele.classList.remove('objective_appears');
                objective_1_ele.style.opacity = 1;
                objective_2_ele.style.opacity = 1;
                objective_1_ele.style.marginRight = '0';
                objective_2_ele.style.marginRight = '0';
                objective_1_ele.style.setProperty('--ow', objective_dimensions.width + 'px');
                objective_1_ele.style.setProperty('--oh', objective_dimensions.height + 'px');
                objective_2_ele.style.setProperty('--ow', objective_dimensions.width + 'px');
                objective_2_ele.style.setProperty('--oh', objective_dimensions.height + 'px');

                // animate card backs to player hand_counter and disappear
                let args = [objective_1_ele, hand_counter, null, false, true];
                this.utils.animationPromise(objective_1_ele, 'objective_board_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                args = [objective_2_ele, hand_counter, null, false, true];
                await this.utils.animationPromise(objective_2_ele, 'objective_board_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);

                this.notifqueue.setSynchronousDuration();
            } else { this.notifqueue.setSynchronousDuration(); }
        },

        notif_confirmOpponentAssets: async function (notif) {

            if (notif.args.simul_climb && $('show_hide_card_button') && $('show_hide_card_button').classList.contains('shown')) {
                $('show_hide_card_button').click();
            }

            if (notif.args.deck_reshuffle) { await this.utils.deckReshuffle(); }

            const player_id = notif.args.player_id;
            const spread_ids = notif.args.spread_card_ids;
            const new_deck_assets = notif.args.deck_num;
            const new_spread_assets = spread_ids.length;
            this.gamedatas.spread = notif.args.new_spread;

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

                            let args = [deck_asset_div, deck_row, 2, 'straighten'];
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

                            let args = [spread_div, draw_slot, 2, 'straighten'];
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

                                const climbing_discard_straightened = $('climbing_discard_straightened');
                                if (notif.args.climbing_card && climbing_discard_straightened.firstElementChild) {
                                    await this.utils.discardClimbingCard();
                                } })

                            .then( async () => {
                                if (monochrome) { // if all 4 spread cards are of same type

                                    const last_drawn_asset = notif.args.last_drawn_asset;
                                    const last_asset_ele = $(`asset_card_${last_drawn_asset.id}`);
                                    const last_slot = last_asset_ele.parentElement;
                                    const discard_pile = $('asset_discard');
                                    let args = [last_asset_ele, discard_pile, 5];
                                    await this.utils.animationPromise(last_asset_ele, 'asset_spread_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                                    for (let i=empty_slots+1; i<=spread_assets_arr.length; i++) {

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

                const token_id = Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === '7');
                const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : token_id,
                    sbX : 200,
                    sbY : 200,
                }), `hand_counter_${player_id}`);
                this.utils.summitBetaTooltip(token_ele.id, '7');
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

            if (notif.args.deck_reshuffle) { await this.utils.deckReshuffle(); }

            const card_num = dojo.query('#assets_wrap .asset').length;
            const token_num = dojo.query('#assets_wrap .summit_beta').length;
            const new_deck_assets = notif.args.deck_num;
            const spread_ids = notif.args.spread_card_ids;
            this.gamedatas.spread = notif.args.new_spread;
            const new_spread_assets = spread_ids.length;
            const new_cards = new_deck_assets + new_spread_assets;
            const new_card_slots = this.utils.resizeHand('asset', notif.args.new_cards);
            const player_id = notif.args.player_id;
            const deck_assets = notif.args.deck_assets_arr;
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

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

                            let args = [deck_asset_div, deck_row, 2, 'straighten'];
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

                            let args = [spread_div, draw_slot, 2, 'straighten'];
                            asset_deck_to_display.push(this.utils.animationPromise.bind(null, spread_div, 'asset_deck_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));

                            args = [spread_div, hand_slot];
                            this.utils.assetDisplayToHandCalc(spread_div, hand_slot);
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
                                this.utils.assetDisplayToHandCalc(card, hand_slot);
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

            // check if the trade button should be enabled
            if (this.gamedatas.gamestate.name === 'climbOrRest' && $('trade_button').classList.contains('disabled')) {
                if (this.utils.tradeEnabled()) { $('trade_button').classList.remove('disabled'); }
            }

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
                        this.gamedatas.spread = notif.args.new_spread;

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

                                const climbing_discard_straightened = $('climbing_discard_straightened');
                                if (notif.args.climbing_card && climbing_discard_straightened.firstElementChild) {
                                    await this.utils.discardClimbingCard();
                                } })

                            .then(async () => {
                                if (monochrome) { // if all 4 spread cards are of the same type

                                    const last_drawn_asset = notif.args.last_drawn_asset;
                                    const last_asset_ele = $(`asset_card_${last_drawn_asset.id}`);
                                    const last_slot = last_asset_ele.parentElement;
                                    const discard_pile = $('asset_discard');
                                    let args = [last_asset_ele, discard_pile, 5];
                                    await this.utils.animationPromise(last_asset_ele, 'asset_spread_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                                    for (let i=empty_slots+1; i<=spread_assets_arr.length; i++) {

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

                if (this.utils.shouldAnimate()) {

                    const args = [token_ele, $('summit_discard'), null, false, true];
                    this.utils.updateTitlebar(_('Discarding Summit Beta token'));
                    await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                }

                else { // shouldn't animate
                    
                    $('summit_discard').append(token_ele);
                }

                for (const ele of this.asset_handlers) { ele.onclick = null; }
                this.asset_handlers = [];
                dojo.query('.cursor').forEach(ele => { if (!ele.classList.contains('summit_beta_click')) { ele.classList.remove('cursor'); }});

                const deck_classes = $('asset_deck').classList;
                if (deck_classes.contains('draw')) {
                    deck_classes.remove(deck_classes[deck_classes.length-1]); // Number
                    deck_classes.remove('draw'); // 'draw'
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

            // Trifecta
            if (this.isCurrentPlayerActive()) {
                const selected_pitch = document.querySelector('.selected_pitch').nextElementSibling;
                if (selected_pitch.classList.contains('p36')) {
                    const trifecta_selected_box = $('trifecta_selected_box');
                    Array.from(trifecta_selected_box.children).forEach(ele => {
                        if (ele.id !== 'trifecta_title_clone' && ele.id !== 'trifecta_undo_button') {
                            ele.remove();
                        }
                    });
                    trifecta_selected_box.style.display = '';
                }
            }

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
                const asset_board = $(`asset_board_${player_id}`);
                asset_board.querySelectorAll('.permanent_asset').forEach(ele => {
                    ele.classList.remove('selectable', 'cursor', 'selected_token', 'unnecessary_resource');
                });
                asset_board.querySelectorAll('.gear_token_border').forEach(ele => { ele.remove(); });

                for (let ele of risked_cards) {

                    const id = ele.id.slice(-3).replace(/^\D+/g, '');
                    const hand_slot = this.risk_hand_slots[id];
                    const args = [ele, hand_slot];
                    this.utils.assetDisplayToHandCalc(ele, hand_slot);
                    cards_to_anim.push(this.utils.animationPromise.bind(null, ele, 'asset_display_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                    cards_to_place.push(args);
                }
                this.utils.disableSummitBetaTokens();
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
                    this.risky_climb = false;
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
                this.risky_climb = false;
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
            this.gamedatas.asset_discard_top_card = notif.args.asset_discard_top_card;

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
                    args = [card_ele, $('asset_discard'), 3, 'rotate'];
                    discard_anims.push(this.utils.animationPromise.bind(null, card_ele, 'asset_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                }

                this.utils.updateTitlebar(_('Discarding Asset/s'));
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
            this.gamedatas.asset_discard_top_card = notif.args.asset_discard_top_card;

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
            this.gamedatas.pitch_sets = notif.args.pitch_sets;

            // Trifecta
            if (notif.args.selected_pitch === '36') {
                const trifecta_drawer_toggle = $('trifecta_drawer_toggle');
                if (trifecta_drawer_toggle.style.display !== 'block') {
                    trifecta_drawer_toggle.style.display = 'block';
                }
                const trifecta_types_drawer = $('trifecta_types_drawer');
                const player = this.gamedatas.players[player_id];
                const name_span = this.format_block('jstpl_colored_name', {
                    player_id : player_id,
                    color : `#${player.color}`,
                    player_name : player.name,
                });
                const trifecta_types_lower = `: ${this.utils.trifecta_selections[player_id]}`;
                const trifecta_types_string = trifecta_types_lower.replace(/\b\w/g, char => char.toUpperCase());
                const new_types_span = document.createElement('span');
                new_types_span.classList.add('trifecta_types_span');
                new_types_span.innerHTML = trifecta_types_string;
                const player_span = document.createElement('div');
                player_span.classList.add('trifecta_drawer_row');
                player_span.insertAdjacentHTML('afterbegin', name_span);
                player_span.append(new_types_span);
                trifecta_types_drawer.append(player_span);
            }

            const playAssets = async () => {

                return new Promise(async (resolve) => {

                    const cards_for_playing = [];
                    const selected_resources = notif.args.selected_resources;
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

                    if (this.utils.shouldAnimate()) {

                        const asset_counter_to_display = [];

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

                        if (!this.risky_climb) { this.utils.updateTitlebar(_('Revealing played Assets'));  }
                        Promise.all(asset_counter_to_display.map(func => { return func(); }))
                        .then(() => { if (!this.risky_climb) { return new Promise(resolve => setTimeout(resolve, 1000)) } }) 
                        .then(async () => {
                            this.utils.updateTitlebar(_('Placing played Asset/s on Asset Board'));
                            $('asset_deck_draw').style.zIndex = '50';
                            $('spread_draw').style.zIndex = '50';
                            await this.utils.matchBoardAssets();
                            $('asset_deck_draw').style.zIndex = '';
                            $('spread_draw').style.zIndex = '';
                            this.utils.sanitizeAssetBoards();
                            this.risk_it = false;
                            if (this.risky_climb) { this.risky_climb = false; }
                            $('asset_deck_draw').style.display = '';
                            $('spread_draw').style.display = '';
                            resolve();

                        });
                        
                    } else { // shouldn't animate

                        if (!this.risky_climb) {
                            for (let i=1; i<=cards_for_playing.length; i++) {
                                const card = cards_for_playing[i-1];
                                const card_ele = dojo.place(card[0], `hand_counter_${player_id}`);
                            }
                        }
                        this.utils.matchBoardAssets();
                        this.utils.sanitizeAssetBoards();
                        $('spread_draw').style.display = '';
                        this.risk_it = false;
                        if (this.risky_climb) { this.risky_climb = false; }
                        resolve();
                    }
                });
            }
            await playAssets();

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
            this.gamedatas.pitch_sets = notif.args.pitch_sets;
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

            // Trifecta
            if (notif.args.selected_pitch === '36') {
				const trifecta_selected_box = $('trifecta_selected_box');
				Array.from(trifecta_selected_box.children).forEach(ele => {
					if (ele.id !== 'trifecta_title_clone' && ele.id !== 'trifecta_undo_button') {
						ele.remove();
					}
				});
				trifecta_selected_box.style.display = '';

                const trifecta_drawer_toggle = $('trifecta_drawer_toggle');
                if (trifecta_drawer_toggle.style.display !== 'block') {
                    trifecta_drawer_toggle.style.display = 'block';
                }
                const trifecta_types_drawer = $('trifecta_types_drawer');
                const player = this.gamedatas.players[player_id];
                const name_span = this.format_block('jstpl_colored_name', {
                    player_id : player_id,
                    color : `#${player.color}`,
                    player_name : player.name,
                });
                const trifecta_types_lower = `: ${this.utils.trifecta_selections[player_id]}`;
                const trifecta_types_string = trifecta_types_lower.replace(/\b\w/g, char => char.toUpperCase());
                const new_types_span = document.createElement('span');
                new_types_span.classList.add('trifecta_types_span');
                new_types_span.innerHTML = trifecta_types_string;
                const player_span = document.createElement('div');
                player_span.classList.add('trifecta_drawer_row');
                player_span.insertAdjacentHTML('afterbegin', name_span);
                player_span.append(new_types_span);
                trifecta_types_drawer.append(player_span);
                delete this.utils.trifecta_selections[this.getActivePlayerId()];
            }

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

                        this.utils.updateTitlebar(_('Placing played Asset/s on Asset Board'));
                        await this.utils.matchBoardAssets();
                        this.utils.sanitizeAssetBoards();
                        this.risk_it = false;
                        if (this.risky_climb) { this.risky_climb = false; }
                        $('spread_draw').style.display = '';
                        resolve(); 

                    } else { // shouldn't animate

                        this.utils.matchBoardAssets();
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

        notif_confirmBail: async function(notif) {

            this.utils.clicksOff();
            this.utils.disableSummitBetaTokens();

            this.gamedatas.pitch_sets = notif.args.pitch_sets;
            const player_id = notif.args.player_id;
            await this.utils.updateWaterPsych(player_id, -1, -1);
            
            const bailed_pitch = notif.args.bailed_pitch;
            this.gamedatas.bailed_pitch[player_id] = bailed_pitch;
            const meeple = $(`meeple_${player_id}`);
            const origin = meeple.parentElement;
            let destination, meeple_anim;
            if (bailed_pitch === '0') { // bail out of entire board
                destination = player_id == this.player_id ? $('ref_row') : $(`${player_id}_water_and_psych`);
            } else { // bail out to previous pitch
                destination = $(`pitch_${bailed_pitch}`);
            }

            if (this.utils.shouldAnimate()) {
                const meeple_overlap = dojo.query(`#${destination.id} .meeple`).length;
                if (bailed_pitch === '0') { // bail out of entire board
                    meeple_anim = 'meeple_panel_to_pitch';
                } else { // bail out to previous pitch
                    meeple_anim = 'meeple_pitch_to_pitch';
                }
                const temp_meeple = dojo.place(`<div id="meeple_${player_id}" class="meeple"></div>`, destination);
                const new_width = temp_meeple.getBoundingClientRect().width;
                const new_height = temp_meeple.getBoundingClientRect().height;
                temp_meeple.remove();
                meeple.style.setProperty('--dw', `${new_width}px`);
                meeple.style.setProperty('--dh', `${new_height}px`);
                const meeple_origin_doc = meeple.getBoundingClientRect();
                const meeple_origin_doc_top = meeple_origin_doc.top;
                const meeple_origin_doc_left = meeple_origin_doc.left;
                destination.append(meeple);
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

                const args = [meeple, destination];
                await this.utils.animationPromise(meeple, meeple_anim, 'anim', this.utils.moveToNewParent(), false, true, ...args);
                meeple.style.top = '';
                meeple.style.left = '';
                const bailing_pitch = document.querySelector('.bailing_pitch');
                if (bailing_pitch) { bailing_pitch.classList.remove('bailing_pitch'); }
                this.notifqueue.setSynchronousDuration();
            }
            else { // shouldn't animate
                destination.append(meeple);
                const bailing_pitch = document.querySelector('.bailing_pitch');
                if (bailing_pitch) { bailing_pitch.classList.remove('bailing_pitch'); }
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_drawClimbingCard: async function(notif) {

            this.utils.updateTitlebar(_('Drawing Climbing Card'));
            this.removeActionButtons();
            const climbing_slot = $('climbing_slot');
            climbing_slot.style.display = 'block';

            let climbing_card_info = notif.args.climbing_card_info;
            const climbing_card = this.gamedatas.climbing_cards[climbing_card_info.type_arg];

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
                    this.utils.animationPromise(climbing_card_flip.firstElementChild, 'flip_transform', 'anim', null, false, true);
                    await this.utils.animationPromise(climbing_card_flip, 'climbing_card_straighten', 'anim', null, true, false);
                    const climbing_card_div = dojo.place(this.format_block('jstpl_climbing_card', {
                        CARD_ID : climbing_card_info.id,
                        ccX : climbing_card.x_y[0],
                        ccY : climbing_card.x_y[1],
                        a_height : climbing_card.height_top_a[0],
                        a_top : climbing_card.height_top_a[1],
                        b_height : climbing_card.height_top_b[0],
                        b_top : climbing_card.height_top_b[1],
                    }), 'climbing_deck_straightened');
                    climbing_slot.append(climbing_card_div);
                    const climbing_card_box = climbing_card_div.getBoundingClientRect();
                    const dest_width = climbing_card_box.width;
                    const dest_height = climbing_card_box.height;
                    $('climbing_deck_straightened').append(climbing_card_div);
                    climbing_card_div.style.setProperty('--dw', `${dest_width}px`);
                    climbing_card_div.style.setProperty('--dh', `${dest_height}px`);

                    this.utils.moveClimbingSlotBehindPageTitle();
                    this.utils.freezeScroll();
                    let args = [climbing_card_div, climbing_slot, null, false, true];
                    await this.utils.animationPromise(climbing_card_div, 'climbing_card_to_slot', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    this.utils.restoreClimbingSlot();
                    this.utils.unfreezeScroll();
                    $('climbing_dimmer').classList.add('dim_bg');

                    if (this.isCurrentPlayerActive()) {
                        const bound_handler = this.onSelectClimbingCardChoice.bind(gameui);
                        const choice_top = $(`${climbing_card_info.id}_top`);
                        choice_top.onclick = bound_handler;
                        this.climbing_card_choice_handlers.push(choice_top);
                        choice_top.classList.add('cursor');
                        const choice_bottom = $(`${climbing_card_info.id}_bottom`);
                        choice_bottom.onclick = bound_handler;
                        this.climbing_card_choice_handlers.push(choice_bottom);
                        choice_bottom.classList.add('cursor');
                    }
                    $('climbing_deck').style.zIndex = '199';
                    this.utils.climbingTooltip(`climbing_card_${climbing_card_info.id}`, climbing_card_info.type_arg);

                    // set popup to close if user clicks x or outside of element
                    const climbing_slot = $('climbing_slot');
                    const closePopup = () => {
                        $('show_hide_card_button').click();
                        
                        this.utils.removeOutsideClickListener();
                    };

                    // start listener
                    this.utils.setupOutsideClickListener(climbing_slot, closePopup);

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
                    const bound_handler = this.onSelectClimbingCardChoice.bind(gameui);
                    const choice_top = $(`${climbing_card_info.id}_top`);
                    choice_top.onclick = bound_handler;
                    this.climbing_card_choice_handlers.push(choice_top);
                    choice_top.classList.add('cursor');
                    const choice_bottom = $(`${climbing_card_info.id}_bottom`);
                    choice_bottom.onclick = bound_handler;
                    this.climbing_card_choice_handlers.push(choice_bottom);
                    choice_bottom.classList.add('cursor');
                }
                this.utils.climbingTooltip(`climbing_card_${climbing_card_info.id}`, climbing_card_info.type_arg);

                // set popup to close if user clicks x or outside of element
                const climbing_slot = $('climbing_slot');
                const closePopup = () => {
                    $('show_hide_card_button').click();
                    
                    this.utils.removeOutsideClickListener();
                };

                // start listener
                this.utils.setupOutsideClickListener(climbing_slot, closePopup);

                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_crimperDrawsClimbingCards: async function(notif) {

            this.utils.updateTitlebar(_('Drawing Climbing Cards'));
            this.removeActionButtons();
            const crimper_display = $('crimper_display');
            const crimper_display_1 = $('crimper_display_1');
            const crimper_display_2 = $('crimper_display_2');
            crimper_display.style.display = 'block';

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
                const args_1 = [card_1_div, $('crimper_display_1'), null, false, true];
                const args_2 = [card_2_div, $('crimper_display_2'), null, false, true];

                this.utils.moveClimbingSlotBehindPageTitle();
                this.utils.freezeScroll();
                this.utils.animationPromise(card_1_div, 'climbing_card_to_slot', 'anim', this.utils.moveToNewParent(), false, true, ...args_1);
                await this.utils.animationPromise(card_2_div, 'climbing_card_to_slot', 'anim', this.utils.moveToNewParent(), false, true, ...args_2);
                this.utils.restoreClimbingSlot();
                this.utils.unfreezeScroll();
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

                // set popup to close if user clicks x or outside of element
                const closePopup = () => {
                    $('show_hide_card_button').click();
                    
                    this.utils.removeOutsideClickListener();
                };

                // start listener
                this.utils.setupOutsideClickListener([crimper_display_1, crimper_display_2], closePopup);

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
                $('climbing_dimmer').classList.add('dim_bg');

                // set popup to close if user clicks x or outside of element
                const closePopup = () => {
                    $('show_hide_card_button').click();
                    
                    this.utils.removeOutsideClickListener();
                };

                // start listener
                this.utils.setupOutsideClickListener([crimper_display_1, crimper_display_2], closePopup);

                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_passedClimbingCard: async function(notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }
            const climbing_div = $('#climbing_discard_straightened').firstElementChild;
            const destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate()) {
                await this.utils.discardClimbingCard();
            
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

            this.asset_discard = notif.args.asset_discard;
            this.asset_discard_top_card = notif.args.asset_discard_top_card;

            await this.utils.parseClimbingEffect('cost', notif);
            await this.utils.parseClimbingEffect('benefit', notif);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate() && notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) {
                await this.utils.discardClimbingCard();
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

            this.asset_discard = notif.args.asset_discard;
            this.asset_discard_top_card = notif.args.asset_discard_top_card;
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

            await this.utils.parseClimbingEffect('cost', notif);
            await this.utils.parseClimbingEffect('benefit', notif);

            dojo.query('#climbing_discard .cursor').forEach((ele) => { ele.classList.remove('cursor'); });
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate() && notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) {
                await this.utils.discardClimbingCard();
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
            this.gamedatas.asset_discard_top_card = notif.args.asset_discard_top_card;
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;
            const tucked_nums_for_decrement = [];
            let original_z_indices = [];
            dojo.query('.cursor').forEach(ele => {
                if (!ele.classList.contains('choice') && !ele.classList.contains('summit_beta_click')) {
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

                                this.utils.updateTitlebar(_('Discarding Asset/s'));

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

                                    const args = [asset_ele, discard_pile, 3, 'rotate'];
                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                for (const asset_id of hand_card_ids) {
                                    const asset_ele = $(`asset_card_${asset_id}`);
                                    original_z_indices.push([asset_ele, asset_ele.style.zIndex]);
                                    original_z_indices.push([asset_ele.parentElement, asset_ele.parentElement.style.zIndex]);
                                    asset_ele.style.zIndex = '10';
                                    asset_ele.parentElement.style.zIndex = '10';
                                    const origin_ele = asset_ele.parentElement;
                                    discard_pile.append(asset_ele);
                                    const destination_box = asset_ele.getBoundingClientRect();
                                    const destination_width = destination_box.height; // account for rotation at destination
                                    const destination_height = destination_box.width;
                                    asset_ele.style.setProperty('--dw', `${destination_width}px`);
                                    asset_ele.style.setProperty('--dh', `${destination_height}px`);
                                    origin_ele.append(asset_ele);
                                    const args = [asset_ele, discard_pile, 3, 'rotate'];
                                    delete this.gamedatas.hand_assets[asset_id];

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                for (const asset_id of board_card_ids) {

                                    const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const asset = this.gamedatas.asset_cards[asset_type_arg];
                                    const type = this.utils.getAssetType(asset_type_arg);

                                    let asset_ele = $(`asset_card_${asset_id}`);
                                    const old_board_slot = asset_ele.parentElement;
                                    original_z_indices.push([old_board_slot, old_board_slot.style.zIndex]);
                                    old_board_slot.style.zIndex = '10';

                                    const old_board_slot_num = asset_ele.parentElement.id.slice(-1);
                                    let args = [asset_ele, discard_pile, 3, 'rotate'];

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
                                            EXTRA_CLASSES : '',
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
                                    document.querySelectorAll('.asset_board_slot').forEach(ele => { ele.style.zIndez = ''; });
                                    const asset_discard = $('asset_discard');
                                    asset_discard.append(last_card_ele);
                                    while (asset_discard.childElementCount > 1) { asset_discard.firstElementChild.remove(); }
                                    if ($('asset_counter_img_temp')) { $('asset_counter_img_temp').remove(); }
                                    dojo.query('.tucked_draw_box').forEach(ele => { ele.remove(); });

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

                                this.utils.updateTitlebar(_('Giving Asset/s to '));
                                    const opponent_name_span = dojo.place(this.format_block('jstpl_colored_name', {
                                    player_id : opponent,
                                    color : opponent_color,
                                    player_name : opponent_name,
                                }), $('gameaction_status').parentElement);

                                const hand_counter = $(`hand_counter_${opponent}`);

                                for (const asset_id of hand_card_ids) {
                                    const asset_ele = $(`asset_card_${asset_id}`);
                                    original_z_indices.push([asset_ele, asset_ele.style.zIndex]);
                                    original_z_indices.push([asset_ele.parentElement, asset_ele.parentElement.style.zIndex]);
                                    asset_ele.style.zIndex = '10';
                                    asset_ele.parentElement.style.zIndex = '10';

                                    const args = [asset_ele, hand_counter, null, false, true];
                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_hand_to_counter', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                for (const asset_id of board_card_ids) {

                                    const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const asset = this.gamedatas.asset_cards[asset_type_arg];
                                    const type = this.utils.getAssetType(asset_type_arg);

                                    let asset_ele = $(`asset_card_${asset_id}`);
                                    const old_board_slot = asset_ele.parentElement;
                                    original_z_indices.push([old_board_slot, old_board_slot.style.zIndex]);
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
                                            EXTRA_CLASSES : '',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), old_board_slot);
                                    }

                                    const asset_ele_origin = asset_ele.parentElement;
                                    hand_counter.append(asset_ele);
                                    let new_width = asset_ele.getBoundingClientRect().width;
                                    let new_height = asset_ele.getBoundingClientRect().height;
                                    asset_ele_origin.append(asset_ele);
                                    asset_ele.style.setProperty('--dw', new_width);
                                    asset_ele.style.setProperty('--dh', new_height);
                                    const args = [asset_ele, hand_counter, null, false, true];
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

                                    const asset_ele_origin = asset_ele.parentElement;
                                    hand_counter.append(asset_ele);
                                    let new_width = asset_ele.getBoundingClientRect().width;
                                    let new_height = asset_ele.getBoundingClientRect().height;
                                    asset_ele_origin.append(asset_ele);
                                    asset_ele.style.setProperty('--dw', new_width);
                                    asset_ele.style.setProperty('--dh', new_height);
                                    const args = [asset_ele, hand_counter, null, false, true];
                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_counter', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                Promise.all(asset_anims.map(func => { return func(); }))
                                .then(() => {
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
                                    document.querySelectorAll('.asset_board_slot').forEach(ele => { ele.style.zIndez = ''; });
                                    dojo.query('.tucked_draw_box').forEach(ele => { ele.remove(); });
                                    this.utils.decrementTuckedNums(player_id, tucked_nums_for_decrement);
                                    this.utils.updatePanelAfterDiscard(player_id, opponent, notif.args.player_resources, notif.args.opponent_resources, notif.args.player_hand_count, notif.args.opponent_hand_count, all_card_ids);
                                    const name_span = $('gameaction_status').parentElement.querySelector('.name_span');
                                    if (name_span) { name_span.remove(); }
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

                            this.utils.updateTitlebar(_('Discarding Asset/s'));

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

                            const hand_counter = $(`hand_counter_${player_id}`);
                            const asset_deck_draw = $('asset_deck_draw');
                            original_z_indices.push([hand_counter, hand_counter.style.zIndex]);
                            original_z_indices.push([asset_deck_draw, asset_deck_draw.style.zIndex]);
                            $(`hand_counter_${player_id}`).style.zIndex = '8';
                            $('asset_deck_draw').style.zIndex = '8';

                            for (const asset_id of board_card_ids) {

                                const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                const asset = this.gamedatas.asset_cards[asset_type_arg];
                                const type = this.utils.getAssetType(asset_type_arg);
                                this.gamedatas.hand_assets[asset_id] = asset_type_arg;

                                let asset_ele = $(`asset_card_${asset_id}`);

                                const old_board_slot = asset_ele.parentElement;
                                original_z_indices.push([old_board_slot, old_board_slot.style.zIndex]);
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
                                        EXTRA_CLASSES : '',
                                        acX : asset.x_y[0],
                                        acY : asset.x_y[1],
                                    }), old_board_slot);
                                }

                                const asset_origin = asset_ele.parentElement;
                                original_z_indices.push([asset_origin, asset_origin.style.zIndex]);
                                asset_origin.style.zIndex = '10';
                                const deck_draw_slot = $(`deck_draw_${i}`);
                                deck_draw_slot.append(asset_ele);
                                const new_width = asset_ele.getBoundingClientRect().width;
                                const new_height = asset_ele.getBoundingClientRect().height;
                                asset_origin.append(asset_ele);
                                asset_ele.style.setProperty('--dw', new_width);
                                asset_ele.style.setProperty('--dh', new_height);
                                const args = [asset_ele, deck_draw_slot, null, false, true];
                                i++;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_board_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }

                            for (const asset_id of tucked_card_ids) {
                                const type_arg = this.gamedatas.asset_identifier[asset_id];
                                const type = this.utils.getAssetType(type_arg);
                                const asset = this.gamedatas.asset_cards[type_arg];
                                const asset_counter_img = $(`${character.name}_${type}_counter`).firstElementChild;
                                const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
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
                                deck_draw_slot.append(asset_ele);
                                const new_width = asset_ele.getBoundingClientRect().width;
                                const new_height = asset_ele.getBoundingClientRect().height;
                                asset_counter_img.append(asset_ele);
                                asset_ele.style.setProperty('--dw', new_width);
                                asset_ele.style.setProperty('--dh', new_height);
                                const args = [asset_ele, deck_draw_slot, null, false, true];
                                i++;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }

                            this.utils.updateTitlebar(_('Giving Asset/s to '));
                            const opponent_name_span = dojo.place(this.format_block('jstpl_colored_name', {
                                player_id : opponent,
                                color : opponent_color,
                                player_name : opponent_name,
                            }), $('gameaction_status').parentElement);

                            Promise.all(asset_anims.map((func) => { return func(); }))
                            .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                            .then(() => {
                                let asset_display_to_hand = [];
                                for (let id of all_card_ids) {
                                    const card = $(`asset_card_${id}`);
                                    const hand_slot = $(`hand_asset_${new_card_slots[id]}`);

                                    const args = [card, hand_slot];
                                    this.utils.assetDisplayToHandCalc(card, hand_slot);
                                    asset_display_to_hand.push(this.utils.animationPromise.bind(null, card, 'asset_display_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }
                                return Promise.all(asset_display_to_hand.map((func) => { return func(); }));
                            })
                            .then(async () => {
                                $('asset_deck_draw').style.display = '';
                                if ($('asset_counter_img_temp')) { $('asset_counter_img_temp').remove(); }
                                if (this.risky_climb) { this.utils.updateTitlebar(_('Placing played Assets on Asset Board')); }
                                if (notif.args.climbing_card_info['give_psych'] || notif.args.risk_it_info[0] === 3) {
                                    this.utils.updateWaterPsych(player_id, 0, -1)
                                    await this.utils.updateWaterPsych(opponent, 0, 1);
                                }
                                this.utils.updatePanelAfterDiscard(player_id, opponent, notif.args.player_resources, notif.args.opponent_resources, notif.args.player_hand_count, notif.args.opponent_hand_count, all_card_ids);
                                const name_span = $('gameaction_status').parentElement.querySelector('.name_span');
                                if (name_span) { name_span.remove(); }
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

            for (const [ele, zIndex] of original_z_indices) {
                if (ele) { ele.style.zIndex = zIndex; }
            }
            this.utils.resizeHand();
            this.utils.cleanAssetDiscardPile();
            await this.utils.matchBoardAssets();

            await (async () => {
                if (Object.keys(notif.args.climbing_card_info).length > 0 && !notif.args.bomber_anchor) {
                    const water = notif.args.climbing_card_info['water_psych_for_climbing']['water'];
                    const psych = notif.args.climbing_card_info['water_psych_for_climbing']['psych'];
                    await this.utils.updateWaterPsych(player_id, water, psych);

                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard_90');

                    const climbing_card_info = notif.args.climbing_card_info;
                    if (climbing_card_info.final_state === 'discardAssets' && !['3', '7', '8', '12', '13', '14', '21', '23', '26', '27', '28', '31', '46', '48', '57'].includes(climbing_card_info.type_arg)) {
                        if (this.utils.shouldAnimate()) {
                            await this.utils.discardClimbingCard();
                        } else {
                            destination.append(climbing_div);
                            climbing_div.classList.remove('drawn_climbing');
                            $('climbing_discard').style.zIndex = '';
                            this.utils.cleanClimbingDiscardPile();
                        }
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
            const opponent_color = notif.args.opponent_color;
            const discard_pile = $('asset_discard');
            const hand_card_ids_for_public = notif.args.hand_card_ids_for_public;
            const board_card_ids = notif.args.board_card_ids;
            const tucked_card_ids = notif.args.tucked_card_ids;
            const flipped_ids = notif.args.flipped_ids;
            const all_card_ids = tucked_card_ids.concat(hand_card_ids_for_public, board_card_ids);
            this.asset_discard = notif.args.asset_discard;
            this.gamedatas.asset_discard_top_card = notif.args.asset_discard_top_card;
            this.gamedatas.board_assets = notif.args.board_assets;
            let original_z_indices = [];

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
                                deck_draw_slot.append(asset_ele);
                                const new_width = asset_ele.getBoundingClientRect().width;
                                const new_height = asset_ele.getBoundingClientRect().height;
                                asset_counter_img.append(asset_ele);
                                asset_ele.style.setProperty('--dw', new_width);
                                asset_ele.style.setProperty('--dh', new_height);
                                const args = [asset_ele, deck_draw_slot, null, false, true];
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
                            
                            for (const asset_id of board_card_ids) {
                                const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                const asset = this.gamedatas.asset_cards[asset_type_arg];
                                
                                let asset_ele = $(`asset_card_${asset_id}`);
                                const asset_origin = asset_ele.parentElement;
                                original_z_indices.push([asset_origin, asset_origin.style.zIndex]);
                                asset_origin.style.zIndex = '10';
                                const deck_draw_slot = $(`deck_draw_${i}`);
                                deck_draw_slot.append(asset_ele);
                                const new_width = asset_ele.getBoundingClientRect().width;
                                const new_height = asset_ele.getBoundingClientRect().height;
                                asset_origin.append(asset_ele);
                                asset_ele.style.setProperty('--dw', new_width);
                                asset_ele.style.setProperty('--dh', new_height);
                                const args = [asset_ele, deck_draw_slot, null, false, true];
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
                                    }), asset_origin);
                                    await this.utils.animationPromise(flip_ele.firstElementChild, 'flip_transform', 'anim', null, false, false);
                                    flip_ele.remove();
                                    asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                        CARD_ID : asset_id,
                                        EXTRA_CLASSES : '',
                                        acX : asset.x_y[0],
                                        acY : asset.x_y[1],
                                    }), asset_origin);
                                    args[0] = asset_ele;
                                }

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_board_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }
                            const last_card_ele = $(`asset_card_${all_card_ids[all_card_ids.length-1]}`);

                            this.utils.updateTitlebar(_('Discarding Asset/s'));
                            Promise.all(asset_anims.map(func => { return func(); }))
                            .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                            .then(() => {
                                let asset_display_to_discard = [];
                                for (let id of all_card_ids) {
                                    const card = $(`asset_card_${id}`);

                                    const args = [card, discard_pile, 3, 'rotate'];
                                    asset_display_to_discard.push(this.utils.animationPromise.bind(null, card, 'asset_display_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }
                                return Promise.all(asset_display_to_discard.map((func) => { return func(); }));
                            })
                            .then(() => {
                                $('asset_deck_draw').style.display = '';
                                if ($('asset_counter_img_temp')) { $('asset_counter_img_temp').remove(); }
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

                                this.utils.updateTitlebar(_('Giving Asset/s to '));
                                const opponent_name_span = dojo.place(this.format_block('jstpl_colored_name', {
                                    player_id : opponent,
                                    color : opponent_color,
                                    player_name : opponent_name,
                                }), $('gameaction_status').parentElement);

                                const hand_counter = $(`hand_counter_${opponent}`);

                                let i = 1;
                                for (const card of hand_card_ids_for_public) {

                                    const asset_back = dojo.place(this.format_block('jstpl_asset_card', {
                                                      CARD_ID : `00${i}`,
                                                      EXTRA_CLASSES : '',
                                                      acX : 0,
                                                      acY : 0,
                                    }), `hand_counter_${player_id}`);

                                    const args = [asset_back, $(`hand_counter_${opponent}`), null, false, true];

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
                                for (const asset_id of board_card_ids) {

                                    const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const asset = this.gamedatas.asset_cards[asset_type_arg];
                                    
                                    let asset_ele = $(`asset_card_${asset_id}`);
                                    const asset_origin = asset_ele.parentElement;
                                    original_z_indices.push([asset_origin, asset_origin.style.zIndex]);
                                    asset_origin.style.zIndex = '10';
                                    const deck_draw_slot = $(`deck_draw_${i}`);
                                    deck_draw_slot.append(asset_ele);
                                    const new_width = asset_ele.getBoundingClientRect().width;
                                    const new_height = asset_ele.getBoundingClientRect().height;
                                    asset_origin.append(asset_ele);
                                    asset_ele.style.setProperty('--dw', new_width);
                                    asset_ele.style.setProperty('--dh', new_height);
                                    const args = [asset_ele, deck_draw_slot, null, false, true];
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
                                        }), asset_origin);
                                        await this.utils.animationPromise(flip_ele.firstElementChild, 'flip_transform', 'anim', null, false, false);
                                        flip_ele.remove();
                                        asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                            CARD_ID : asset_id,
                                            EXTRA_CLASSES : '',
                                            acX : asset.x_y[0],
                                            acY : asset.x_y[1],
                                        }), asset_origin);
                                        args[0] = asset_ele;
                                    }

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_board_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                for (const asset_id of tucked_card_ids) {
                                    const type_arg = this.gamedatas.asset_identifier[asset_id];
                                    const type = this.utils.getAssetType(type_arg);
                                    const asset = this.gamedatas.asset_cards[type_arg];
                                    const asset_counter_img = $(`${character.name}_${type}_counter`).firstElementChild;
                                    const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
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
                                    deck_draw_slot.append(asset_ele);
                                    const new_width = asset_ele.getBoundingClientRect().width;
                                    const new_height = asset_ele.getBoundingClientRect().height;
                                    asset_counter_img.append(asset_ele);
                                    asset_ele.style.setProperty('--dw', new_width);
                                    asset_ele.style.setProperty('--dh', new_height);
                                    const args = [asset_ele, deck_draw_slot, null, false, true];
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
                                        $('asset_deck_draw').style.display = '';
                                        if ($('asset_counter_img_temp')) { $('asset_counter_img_temp').remove(); }
                                        this.utils.handCount(player_id, notif.args.player_hand_count);
                                        this.utils.handCount(opponent, notif.args.opponent_hand_count);
                                        if (notif.args.climbing_card_info['give_psych'] || notif.args.risk_it_info[0] === 3) {
                                            this.utils.updateWaterPsych(player_id, 0, -1)
                                            await this.utils.updateWaterPsych(opponent, 0, 1);
                                        }
                                        const name_span = $('gameaction_status').parentElement.querySelector('.name_span');
                                        if (name_span) { name_span.remove(); }
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
            for (const [ele, zIndex] of original_z_indices) {
                if (ele) { ele.style.zIndex = zIndex; }
            }
            this.utils.cleanAssetDiscardPile();
            await this.utils.matchBoardAssets();


            // resolve any water/psych benefits from the climbing card
            await (async () => {
                return new Promise(async (resolve) => {
                    if (notif.args.climbing_card_info != null && 'water_psych_for_climbing' in notif.args.climbing_card_info && !notif.args.bomber_anchor) {
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
                    if (this.utils.shouldAnimate()) {
                        await this.utils.discardClimbingCard();
                    } else {
                        destination.append(climbing_div);
                        climbing_div.classList.remove('drawn_climbing');
                        $('climbing_discard').style.zIndex = '';
                        this.utils.cleanClimbingDiscardPile();
                    }
                    
                }
            })();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSummitBetaOpponent: async function (notif) {

            const card_destination = $('climbing_discard_90');
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const last_token = notif.args.last_token;
            const summit_beta_reshuffle = notif.args.summit_beta_reshuffle;
            if (summit_beta_reshuffle) { await this.utils.sbReshuffle(); }

            if (this.utils.shouldAnimate()) {
                this.utils.updateTitlebar(_('Drawing Summit Beta Token'));

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
                    await this.utils.discardClimbingCard();
                }
            }
            else { // shouldn't animate
                if (climbing_div) {
                    card_destination.append(climbing_div);
                    climbing_div.classList.remove('drawn_climbing');
                    $('climbing_discard').style.zIndex = '';
                }
            }
            if (last_token) { $('summit_pile').style.visibility = 'hidden'; }
            this.utils.cleanClimbingDiscardPile();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSummitBeta: async function (notif) {

            const player_id = notif.args.player_id;
            const player_token_tracker = notif.args.player_token_tracker;
            this.gamedatas.player_token_tracker = player_token_tracker;
            const new_token_slot = this.utils.resizeHand('token');
            const summit_beta_from_db = notif.args.summit_beta_token;
            const summit_beta_token = this.gamedatas.summit_beta_tokens[summit_beta_from_db.type_arg];
            const bg_pos = summit_beta_token['x_y'];
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const card_destination = $('climbing_discard_90');
            const summit_beta_div_id = `summit_beta_${summit_beta_from_db.id}`;
            const last_token = notif.args.last_token;
            const summit_beta_reshuffle = notif.args.summit_beta_reshuffle;
            if (summit_beta_reshuffle) { await this.utils.sbReshuffle(); }
            if (last_token) { $('summit_pile').style.backgroundImage = 'url()'; }

            if (this.utils.shouldAnimate()) {
                this.utils.updateTitlebar(_('Drawing Summit Beta Token'));

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
                summit_flip.remove();
                const summit_beta_div = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : summit_beta_from_db.id,
                    sbX : bg_pos[0],
                    sbY : bg_pos[1],
                }), 'summit_pile');
                this.utils.summitBetaTooltip(summit_beta_div.id, summit_beta_from_db.type_arg);
                summit_beta_div.classList.add('sb_temp_display');
                summit_beta_div.classList.add('sb_temp_display');
                await (async () => { return new Promise(resolve => setTimeout(resolve, 1000)) })();

                const args = [summit_beta_div, new_token_slot, null, false, true];
                $('summit_pile').style.zIndex = '';
                await this.utils.animationPromise(summit_beta_div, 'token_board_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                summit_beta_div.classList.remove('sb_temp_display');
                summit_beta_div.classList.remove('sb_temp_display');

                if (climbing_div) {
                    await this.utils.discardClimbingCard();
                }
            }
            else { // shouldn't animate
                const summit_beta_div = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : summit_beta_from_db.id,
                    sbX : bg_pos[0],
                    sbY : bg_pos[1],
                }), new_token_slot);
                this.utils.summitBetaTooltip(summit_beta_div.id, summit_beta_from_db.type_arg);
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
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

            this.gamedatas.resource_tracker = player_resources;
            this.gamedatas.hand_symbol_tokens = player_resources['symbol_tokens'];
            const symbol_for_log = notif.args.symbol_for_log;
            const symbol_type = notif.args.symbol_type;
            const new_token_id = dojo.query('#assets_wrap .symbol_token').length + 1;
            const new_token_slot = this.utils.resizeHand('token');
            const player_id = notif.args.player_id;

            if (this.utils.shouldAnimate()) {

                const msg_translated = dojo.string.substitute(_("Taking ${symbol_for_log} Token"), {
                    symbol_for_log: symbol_for_log['args']['symbol_type']
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
                await this.utils.discardClimbingCard();
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
                    symbol_for_log: symbol_for_log['args']['symbol_type']
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
                await this.utils.discardClimbingCard();
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_automaticPortaledgeOpponent: async function (notif) {

            this.asset_discard = notif.args.asset_discard;
            this.asset_discard_top_card = notif.args.asset_discard_top_card;

            await this.utils.parseClimbingEffect('autoPortaledge', notif);
            if ($('climbing_discard_straightened').firstElementChild) {
                await this.utils.discardClimbingCard();
            }
            this.notifqueue.setSynchronousDuration();
        },
        
        notif_automaticPortaledge: async function (notif) {

            this.asset_discard = notif.args.asset_discard;
            this.asset_discard_top_card = notif.args.asset_discard_top_card;
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

            await this.utils.parseClimbingEffect('autoPortaledge', notif);
            if ($('climbing_discard_straightened').firstElementChild) {
                await this.utils.discardClimbingCard();
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
            this.gamedatas.asset_discard_top_card = notif.args.asset_discard_top_card;
            const bomber_anchor = notif.args.bomber_anchor;

            await this.utils.portaledgeOpponent(player_id, asset_types, false, hand_count, climbing_card_info, false, water, psych, last_card, refill_portaledge, bomber_anchor);

            this.utils.updatePlayerResources(player_id, notif.args.player_water_psych);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');
            if (climbing_div && !notif.args.bomber_anchor) {

                if (this.utils.shouldAnimate() && !climbing_card_info.hasOwnProperty('portaledge_all')) {
                    await this.utils.discardClimbingCard();

                } else if (this.utils.shouldAnimate() && climbing_card_info.hasOwnProperty('portaledge_all')
                        && climbing_card_info.finished_portaledge.length+1 == Object.keys(this.gamedatas.players).length) {
                    await this.utils.discardClimbingCard();

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
            this.gamedatas.asset_discard_top_card = notif.args.asset_discard_top_card;
            const player_resources = notif.args.player_resources;
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

            await this.utils.portaledge(player_id, asset_type_args, asset_ids, false, hand_count, climbing_card_info, false, water, psych, last_card, refill_portaledge, player_resources);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');
            if (climbing_div && !notif.args.bomber_anchor) {

                if (this.utils.shouldAnimate() && !climbing_card_info.hasOwnProperty('portaledge_all')) {
                    await this.utils.discardClimbingCard();

                } else if (this.utils.shouldAnimate() && climbing_card_info.hasOwnProperty('portaledge_all')
                        && climbing_card_info.finished_portaledge.length+1 == Object.keys(this.gamedatas.players).length) {
                    await this.utils.discardClimbingCard();

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

            if (this.utils.shouldAnimate()) {
                await this.utils.discardClimbingCard();
            } else {
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
                this.utils.cleanClimbingDiscardPile();
            }
            

            this.notifqueue.setSynchronousDuration();
        },

        notif_rollDie: async function (notif) {

            this.utils.clicksOff();

            const face_rolled = notif.args.face_rolled;
            this.risky_climb = notif.args.risky_climb;
            if (notif.args.risky_climb) { this.risk_it = true; }
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
                const sunny_players = notif.args.sunny_players;
                if (sunny_players.length === 0) {
                    return;
                }
                
                for (const player_id of sunny_players) {
                    if (notif.args.water_or_psych === 'water') {
                        await this.utils.updateWaterPsych(player_id, -1, 0);
                    } else if (notif.args.water_or_psych === 'psych') {
                        await this.utils.updateWaterPsych(player_id, 0, 1);
                    }
                }

                if (sunny_players.length > 0) {
                    await this.utils.delay(800);
                }
            })();

            dojo.query('#climbing_discard .cursor').forEach((ele) => { ele.classList.remove('cursor'); });
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate()) {
                await this.utils.discardClimbingCard();
            } else {
                destination.append(climbing_div);
                climbing_div.classList.remove('drawn_climbing');
                $('climbing_discard').style.zIndex = '';
                this.utils.cleanClimbingDiscardPile();
            }
            

            this.notifqueue.setSynchronousDuration();
        },

        notif_shareEffectPrivate: async function (notif) {

            const player_id = notif.args.player_id;
            const opponent_id = notif.args.opponent_id;
            this.asset_discard = notif.args.asset_discard;
            this.gamedatas.asset_discard_top_card = notif.args.asset_discard_top_card;
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

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
                    await this.utils.discardClimbingCard();

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
            this.gamedatas.asset_discard_top_card = notif.args.asset_discard_top_card;

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
                    await this.utils.discardClimbingCard();

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
            const card_type_arg = notif.args.asset_type_arg;
            const card_type = notif.args.card_type;
            const board_assets = notif.args.board_assets;
            this.gamedatas.board_assets = board_assets;
            const asset_ele = $(`asset_card_${card_id}`);
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

            asset_ele.classList.remove('selected_resource');
            asset_ele.parentElement.classList.remove('selected_resource_wrap');
            dojo.query('.selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });
            dojo.query('.selectable_wrap').forEach(ele => { ele.classList.remove('selectable_wrap'); });
            asset_ele.classList.add('played_asset');

            await (async () => {
                return new Promise(async (resolve) => {
                    if (this.utils.shouldAnimate()) {

                        this.utils.updateTitlebar(_('Placing Asset on Asset Board'));
                        await this.utils.matchBoardAssets();
                        this.utils.sanitizeAssetBoards();
                        this.risk_it = false;
                        if (this.risky_climb) { this.risky_climb = false; }
                        resolve();

                    } else { // shouldn't animate
                        
                        this.utils.matchBoardAssets();
                        $('assets_wrap').querySelectorAll('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
                        this.utils.sanitizeAssetBoards();
                        if (this.risky_climb) { this.risky_climb = false; }
                        this.risk_it = false;
                        resolve();
                    }
                });
            })();

            this.utils.resizeHand();
            this.utils.updatePlayerResources(player_id, notif.args.player_resources);
            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    await this.utils.discardClimbingCard();

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
            const card_type_arg = notif.args.asset_type_arg;
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
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        await this.utils.matchBoardAssets();
                        $('asset_deck_draw').style.zIndex = '';
                        $('asset_deck_draw').style.display = '';
                        this.utils.sanitizeAssetBoards();
                        this.risk_it = false;
                        if (this.risky_climb) { this.risky_climb = false; }
                        $('spread_draw').style.display = '';
                        resolve();

                    } else { // shouldn't animate
                        this.utils.matchBoardAssets();
                        this.utils.sanitizeAssetBoards();
                        this.risk_it = false;
                        if (this.risky_climb) { this.risky_climb = false; }
                        resolve();
                    }
                });
            })();

            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    await this.utils.discardClimbingCard();

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

                        this.utils.updateTitlebar(_('Stealing Asset from'));
                        const opponent_name_span = dojo.place(this.format_block('jstpl_colored_name', {
                            player_id : opponent_id,
                            color : opponent_color,
                            player_name : opponent_name,
                        }), $('gameaction_status').parentElement);

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

                        if (asset_ele.classList.contains('flipped') && !to_board) {
                            const old_board_slot = asset_ele.parentElement;
                            old_board_slot.style.zIndex = '10';
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

                        $('asset_deck_draw').style.display = 'flex';
                        $('asset_deck_draw').style.zIndex = '15';
                        const asset_origin = asset_ele.parentElement;
                        asset_origin.style.zIndex = '10';
                        const deck_draw_slot = $('deck_draw_1');
                        deck_draw_slot.append(asset_ele);
                        const new_width = asset_ele.getBoundingClientRect().width;
                        const new_height = asset_ele.getBoundingClientRect().height;
                        asset_origin.append(asset_ele);
                        asset_ele.style.setProperty('--dw', new_width);
                        asset_ele.style.setProperty('--dh', new_height);
                        let args = [asset_ele, deck_draw_slot, null, false, true];
                        i++;

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
                        document.querySelectorAll('.asset_board_slot').forEach(ele => { ele.style.zIndex = ''; });
                        await this.utils.matchBoardAssets();

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
                        await this.utils.matchBoardAssets();
                        this.utils.sanitizeAssetBoards();
                        resolve();
                    }
                });
            })();

            await this.utils.matchBoardAssets();
            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    await this.utils.discardClimbingCard();

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
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

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
                        const opponent_name_span = dojo.place(this.format_block('jstpl_colored_name', {
                            player_id : opponent_id,
                            color : opponent_color,
                            player_name : opponent_name,
                        }), $('gameaction_status').parentElement);

                        if (notif.args.random_tucked_id) {
                            const asset_counter_img = $(`${opponent_character.name}_${type}_counter`).firstElementChild;
                            asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : played_asset,
                                acX : asset['x_y'][0],
                                acY : asset['x_y'][1],
                            }), asset_counter_img);
                        }

                        if (asset_ele.classList.contains('flipped') && !to_board) {

                            const old_board_slot = asset_ele.parentElement;
                            old_board_slot.style.zIndex = '10';
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
                        document.querySelectorAll('.asset_board_slot').forEach(ele => { ele.style.zIndex = ''; });

                        // // board to board anims
                        await this.utils.matchBoardAssets();
                        this.utils.sanitizeAssetBoards();
                        resolve();

                    } else { // shouldn't animate
                    
                        if (notif.args.random_tucked_id && !to_board) {
                            asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                CARD_ID : asset_id,
                                EXTRA_CLASSES : '',
                                acX : asset['x_y'][0],
                                acY : asset['x_y'][1],
                            }), new_card_slot);
                        }

                        if (!to_board && !notif.args.random_tucked_id) { new_card_slot.append(asset_ele); }

                        this.utils.matchBoardAssets();
                        this.utils.sanitizeAssetBoards();
                        resolve();
                    }
                });
            })();

            dojo.query('.tucked_draw_box').forEach(ele => { ele.remove(); });

            this.utils.updatePlayerResources(player_id, notif.args.player_resources);
            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    await this.utils.discardClimbingCard();

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
                this.utils.updateTitlebar(_('Dealing Gear cards from the Portaledge'));
                const portaledge = $('portaledge');
                portaledge.style.display = 'block';
                await this.utils.animationPromise(portaledge, 'portaledge_open', 'anim', null, false, true);
                portaledge.style.marginTop = 0;
                await (async function() { return new Promise(resolve => setTimeout(resolve, 300)) })();

                await (async () => {
                    for (const ele of dojo.query('.hand_counter')) {
                        if (ele.id.split('_').pop() != this.player_id) {

                            const asset_back = dojo.place(this.format_block('jstpl_asset_card', {
                                               CARD_ID : `${ele.id.split('_').pop()}_back`,
                                               EXTRA_CLASSES : '',
                                               acX : 0,
                                               acY : 0,
                            }), 'portagear');

                            const args = [asset_back, ele, null, false, true];
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
                    await this.utils.discardClimbingCard();

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
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;

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

                this.utils.updateTitlebar(_('Dealing Gear cards from the Portaledge'));
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
                            const player_id = player.id.split('_').pop();
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

                                const args = [asset_back, $(`hand_counter_${player_id}`), null, false, true];
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
                this.utils.assetDisplayToHandCalc(asset_ele, hand_slot);
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
                    await this.utils.discardClimbingCard();

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

            this.removeActionButtons();
            this.utils.updateTitlebar(_('Drawing Summit Beta Tokens'));

            dojo.place('<div id="second_summit_beta_token" class="summit_pile_back summit_back" style="position: absolute; left: 217%;"></div>', 'summit_pile');
            const token_1 = summit_beta_tokens[0];
            const token_1_info = this.gamedatas.summit_beta_tokens[token_1.type_arg];
            const token_2 = summit_beta_tokens[1];
            const token_2_info = this.gamedatas.summit_beta_tokens[token_2.type_arg];

            const token_flip_1 = dojo.place(this.format_block('jstpl_flip_card', {
                card_id : token_1.id,
                extra_classes : 'token_flip choose_sb',
                back_type : 'summit_beta summit_back_for_flip',
                front_type : 'summit_beta',
                cX : token_1_info['x_y'][0],
                cY : token_1_info['x_y'][1],
            }), 'summit_pile');

            const token_flip_2 = dojo.place(this.format_block('jstpl_flip_card', {
                card_id : token_2.id,
                extra_classes : 'token_flip choose_sb',
                back_type : 'summit_beta summit_back_for_flip',
                front_type : 'summit_beta',
                cX : token_2_info['x_y'][0],
                cY : token_2_info['x_y'][1],
            }), 'summit_pile');
            
            const public_flip_1 = token_flip_1.cloneNode(true);
            const public_flip_2 = token_flip_2.cloneNode(true);

            $('summit_pile').style.zIndex = '201';

            if (this.utils.shouldAnimate()) {

                let args = [token_flip_2, $('second_summit_beta_token')];

                if (this.isCurrentPlayerActive()) {
                    this.utils.animationPromise(token_flip_1.firstElementChild, 'flip_transform_summit_beta_choice', 'anim', null, false, true);
                    this.utils.animationPromise(token_flip_2.firstElementChild, 'flip_transform_summit_beta_choice', 'anim', null, false, true);
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
                    token_1_ele.classList.add('choose_sb');
                    this.utils.summitBetaTooltip(token_1_ele.id, token_1.type_arg);

                    const token_2_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_2.id,
                        sbX : token_2_info['x_y'][0],
                        sbY : token_2_info['x_y'][1],
                    }), 'second_summit_beta_token');
                    token_2_ele.classList.add('choose_sb');
                    this.utils.summitBetaTooltip(token_2_ele.id, token_2.type_arg);
                }

                else {
                    $('summit_pile').append(public_flip_1);
                    $('second_summit_beta_token').append(public_flip_2);
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
                    token_1_ele.classList.add('choose_sb');
                    this.utils.summitBetaTooltip(token_1_ele.id, token_1.type_arg);

                    const token_2_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_2.id,
                        sbX : token_2_info['x_y'][0],
                        sbY : token_2_info['x_y'][1],
                    }), 'second_summit_beta_token');
                    token_2_ele.classList.add('choose_sb');
                    this.utils.summitBetaTooltip(token_2_ele.id, token_2.type_arg);
                }

                else {
                    $('second_summit_beta_token').append(token_flip_2);
                }
            }

            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmChooseSummitBetaTokenPlayer: async function(notif) {

            this.utils.clicksOff();

            const player_token_tracker = notif.args.player_token_tracker;
            this.gamedatas.player_token_tracker = player_token_tracker;
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

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar(_('Taking Summit Beta Tokens'));

                // token for active player

                const selected_token_ele = $(`summit_beta_${selected_token_id}`);
                const new_token_slot = this.utils.resizeHand('token');

                let args = [selected_token_ele, new_token_slot, null, false, true];
                this.utils.animationPromise(selected_token_ele, 'token_board_to_hand_choose', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                selected_token_ele.classList.remove('choose_sb');
                this.utils.initSummitBetaToken(selected_token_ele, selected_token_type_arg)

                // token for selected opponent

                const opponent_token_ele = $(`summit_beta_${opponent_token_id}`);
                args = [opponent_token_ele, $(`hand_counter_${opponent_id}`), null, false, true];
                await this.utils.animationPromise(opponent_token_ele, 'token_board_to_counter_choose', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                await this.utils.discardClimbingCard();

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
            this.utils.disableSummitBetaTokens();
            this.utils.clicksOn();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmChooseSummitBetaTokenOpponent: async function(notif) {

            this.utils.clicksOff();

            const player_token_tracker = notif.args.player_token_tracker;
            this.gamedatas.player_token_tracker = player_token_tracker;
            const selected_token_id = notif.args.selected_token_id;
            const opponent_token_id = notif.args.opponent_token_id;
            const opponent_token_type_arg = notif.args.opponent_token_type_arg;
            const opponent_token = this.gamedatas.summit_beta_tokens[opponent_token_type_arg];
            const new_token_slot = this.utils.resizeHand('token');
            const player_id = notif.args.player_id;

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const card_destination = $('climbing_discard_90');

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar(_('Taking Summit Beta Tokens'));

                const selected_token = $(`card_${selected_token_id}`);
                const selected_origin = selected_token.parentElement;
                $(`card_${selected_token_id}`).remove();
                const selected_token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : selected_token_id,
                    sbX : 0,
                    sbY : 0,
                }), selected_origin);
                selected_token_ele.classList.add('choose_sb');
                let args = [selected_token_ele, $(`hand_counter_${player_id}`), null, false, true];
                this.utils.animationPromise(selected_token_ele, 'token_board_to_counter_choose', 'anim', this.utils.moveToNewParent(), true, false, ...args);

                // token for selected opponent
                const opponent_token_flip = $(`card_${opponent_token_id}`);
                const opponent_origin = opponent_token_flip.parentElement;

                await this.utils.animationPromise(opponent_token_flip.firstElementChild, 'token_flip_no_grow', 'anim', null, true, false);
                opponent_token_flip.remove();
                const opponent_token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : opponent_token_id,
                    sbX : opponent_token['x_y'][0],
                    sbY : opponent_token['x_y'][1],
                }), opponent_origin);
                opponent_token_ele.classList.add('choose_sb');
                this.utils.summitBetaTooltip(opponent_token_ele.id, opponent_token_type_arg);
                args = [opponent_token_ele, new_token_slot, null, false, true];
                await this.utils.animationPromise(opponent_token_ele, 'token_board_to_hand_choose', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                opponent_token_ele.classList.remove('choose_sb');
                this.utils.initSummitBetaToken(opponent_token_ele, opponent_token_type_arg);
                $('summit_pile').innerHTML = '';
                
                await this.utils.discardClimbingCard();

            } else { // shouldn't animate

                const selected_token_ele = $(`card_${selected_token_id}`);
                const opponent_token_ele = $(`card_${opponent_token_id}`);

                // token for selected opponent
                selected_token_ele.remove();
                opponent_token_ele.remove();

                const opponent_token_div = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : opponent_token_id,
                    sbX : opponent_token.x_y[0],
                    sbY : opponent_token.x_y[1],
                }), new_token_slot);
                this.utils.summitBetaTooltip(opponent_token_div.id, opponent_token_type_arg);
                        
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

                this.utils.updateTitlebar(_('Taking Summit Beta Tokens'));

                const selected_token = $(`card_${selected_token_id}`);
                const selected_origin = selected_token.parentElement;
                $(`card_${selected_token_id}`).remove();
                const selected_token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : selected_token_id,
                    sbX : 0,
                    sbY : 0,
                }), selected_origin);
                selected_token_ele.classList.add('choose_sb');
                let args = [selected_token_ele, $(`hand_counter_${player_id}`), null, false, true];
                this.utils.animationPromise(selected_token_ele, 'token_board_to_counter_choose', 'anim', this.utils.moveToNewParent(), true, false, ...args);

                const opponent_token = $(`card_${opponent_token_id}`);
                const opponent_origin = opponent_token.parentElement;
                $(`card_${opponent_token_id}`).remove();
                const opponent_token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : opponent_token_id,
                    sbX : 0,
                    sbY : 0,
                }), opponent_origin);
                opponent_token_ele.classList.add('choose_sb');
                args = [opponent_token_ele, $(`hand_counter_${opponent_id}`), null, false, true];
                await this.utils.animationPromise(opponent_token_ele, 'token_board_to_counter_choose', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                await this.utils.discardClimbingCard();
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

                                    for (let j=1; j<=num; j++) {
                                        const display_slot = $(`token_display_${i}`);

                                        if (player_id == this.player_id) {
                                            const token_ele = dojo.query(`#assets_wrap .${type}_token`)[0];
                                            tokens_to_fade.push(token_ele);
                                            const args = [token_ele, display_slot, null, false, true];
                                            const token_origin = token_ele.parentElement;
                                            display_slot.append(token_ele);
                                            const dest_width = token_ele.getBoundingClientRect().width;
                                            token_origin.append(token_ele);
                                            token_ele.style.setProperty('--dw', `${dest_width}px`);
                                            token_ele.style.setProperty('--dh', `${dest_width}px`);
                                            $('token_display').style.zIndex = '700';
                                            await this.utils.animationPromise(token_ele, 'token_hand_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                            $('token_display').style.zIndex = '';
                                        }
                                        else {
                                            const token_ele = dojo.place(`<div class="${type}_token symbol_token"></div>`, `hand_counter_${player_id}`);
                                            tokens_to_fade.push(token_ele);
                                            const args = [token_ele, display_slot, null, false, true];
                                            await this.utils.animationPromise(token_ele, 'tech_token_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                        }
                                        i++;

                                        this.gamedatas.resource_tracker['symbol_tokens'][type]--;
                                    }

                                    const tech_num = this.gamedatas.resource_tracker['techniques'][type] - num;
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

                                const token_id = Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === '6');
                                const token_ele = $(`summit_beta_${token_id}`);
                                const args = [token_ele, $('summit_discard')];
                                this.utils.updateTitlebar(_('Discarding Summit Beta Token'));
                                await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                resolve();
                            }

                            else { // opponents' view

                                const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                                    TOKEN_ID : '6',
                                    sbX : 100,
                                    sbY : 200,
                                }), `hand_counter_${player_id}`);
                                this.utils.summitBetaTooltip(token_ele.id, '6');
                                $('token_display_1').append(token_ele);
                                const width = token_ele.getBoundingClientRect().width;
                                const height = token_ele.getBoundingClientRect().height;
                                $(`hand_counter_${player_id}`).append(token_ele);
                                token_ele.style.setProperty('--dw', width);
                                token_ele.style.setProperty('--dh', height);

                                this.utils.updateTitlebar(_('Discarding Summit Beta Token'));

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

                this.utils.updateTitlebar(_('Awarding 2-Point Token/s to '));
                const player_name_span = document.createElement('span');
                player_name_span.id = `${player_name}_span`;
                player_name_span.innerHTML = player_name;
                player_name_span.style.color = player_color;
                $('pagemaintitletext').parentElement.insertBefore(player_name_span, $('pagemaintitletext').nextElementSibling);
                player_name_span_copy = player_name_span.cloneNode(true);
                player_name_span_copy.id = `${player.name}_span_copy`;
                $('gameaction_status_wrap').firstElementChild.append(player_name_span_copy);
                this.utils.resizeHand();

                if (new_tokens > 0) {

                        // 2-Point Tokens appear
                        await (async () => {
                            return new Promise(async (resolve) => {
    
                                for (let i=1; i<=new_tokens; i++) {
    
                                    const token_wrapper = dojo.query(`#player_${player_id} .pw1`)[0];
                                    const temp_token = dojo.place(`<div class="points_token points_1"></div>`, token_wrapper);
                                    const token_box = temp_token.getBoundingClientRect();
                                    const two_point_token = dojo.place(`<div class="points_token points_${i}"></div>`, 'board', 2);
                                    two_point_token.style.width = `${token_box.width}px`;
                                    two_point_token.style.aspectRatio = `${token_box.width} / ${token_box.height}`;
                                    two_point_token.style.zIndex = '10';
                                    temp_token.remove();
                                    this.utils.animationPromise(two_point_token, 'token_appears', 'anim', null, false, false);
                                    await (async function() { return new Promise(resolve => setTimeout(resolve, 200)) })();
                                    if (i === new_tokens) {
                                        await (async function() { return new Promise(resolve => setTimeout(resolve, 1300)) })();
                                        $('board').querySelectorAll('.points_token').forEach(ele => {
                                            ele.style.zIndex = '';
                                        })
                                        resolve();
                                    }
                                }
                            });
                        })();
    
                        // 2-Point Tokens animate to boards
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
                                        document.querySelectorAll('.points_token').forEach(ele => {
                                            ele.style.cssText = '';
                                        });
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

                                const first_unflipped = document.querySelector(`#asset_board_${player_id} .two_points_token`);
                                const flip_wrapper = first_unflipped.parentElement;
                                first_unflipped.remove();

                                const token_flip = dojo.place(this.format_block('jstpl_flip_card', {
                                    card_id : i,
                                    extra_classes : '',
                                    back_type : 'points_token two_points_token',
                                    front_type : 'points_token four_points_token',
                                    cX : 100,
                                    cY : 0,
                                }), flip_wrapper);
                                token_flip.style.right = '-3%';
                                await this.utils.animationPromise(token_flip.firstElementChild, 'flip_transform', 'anim', null, true, false);
                                dojo.place(`<div class="points_token four_points_token"></div>`, flip_wrapper);
                                resolve();
                            }
                        });
                    })();
                }

                // points tracker
				this.scoreCtrl[player_id].incValue(notif.args.new_points);

                player_name_span.remove();
                player_name_span_copy.remove();
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

                    const first_unflipped = document.querySelector(`#asset_board_${player_id} .two_points_token`);
                    const destination = first_unflipped.parentElement;
                    first_unflipped.remove();
                    dojo.place(`<div class="points_token four_points_token"></div>`, destination);
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

                    if (player_id == this.player_id) {

                        const token_id = Object.keys(this.gamedatas.token_identifier).find(key => this.gamedatas.token_identifier[key] === '6');
                        const token_ele = $(`summit_beta_${token_id}`);
                        $('summit_discard').append(token_ele);
                        this.utils.resizeHand();
                    }

                    else {

                        const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                            TOKEN_ID : '6',
                            sbX : 100,
                            sbY : 200,
                        }), 'summit_discard');
                        this.utils.summitBetaTooltip(token_ele.id, '6');
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

            this.utils.updateTitlebar(_('Checking for players eligible to gain Permanent Assets Token/s'));
            await (async function() { return new Promise(resolve => setTimeout(resolve, 1200)) })();
            this.notifqueue.setSynchronousDuration();
        },

        notif_grantPermanentAssets: async function(notif) {

            const players = Object.keys(this.gamedatas.players);
            const gained_permanent_assets = notif.args.gained_permanent_assets;
            const discarded_assets = notif.args.discarded_assets;
            this.gamedatas.board_assets = notif.args.board_assets;
            const asset_board_slot = dojo.query('.asset_board_slot')[0];
            const asset_bounding_box = asset_board_slot.getBoundingClientRect();
            const shared_objectives_tracker = notif.args.shared_objectives_tracker;
            this.gamedatas.shared_objectives_tracker = shared_objectives_tracker;
            this.asset_discard = notif.args.asset_discard;
            this.gamedatas.asset_discard_top_card = notif.args.asset_discard_top_card;
            const zombie_players = this.gamedatas.zombie_players;
            
            const discard_pile = $('asset_discard');    
            let discard_ids = [];
            let tucked_ids = [];
            let tucked_types = {};

            for (let player_id of players) {

                // check if any permanent assets have been chosen
                if (player_id in gained_permanent_assets) {

                    // discard assets from asset board
                    for (let type of ['gear', 'face', 'crack', 'slab']) {

                            // flipped
                        for (let asset_id of discarded_assets[player_id]['flipped'][type]) {

                            const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                            const asset = this.gamedatas.asset_cards[asset_type_arg];
                            const asset_ele = $(`asset_card_${asset_id}`);
                            const slot = asset_ele.parentElement;
                            asset_ele.remove();

                            const slot_num = slot.id.slice(-1);
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
                            const args = [asset_ele, discard_pile, 3, 'rotate'];
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
                        await this.utils.matchBoardAssets();
                    });
                })();

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
                            let previous_tokens = $(`asset_board_${player_id}`).querySelectorAll('.permanent_asset').length;
                            if (player_id in gained_permanent_assets) {

                                for (let [type, num] of Object.entries(gained_permanent_assets[player_id])) {

                                    for (let i=1; i<=num; i++) {

                                        const token = dojo.place(`<div id="${type}_${player_id}_${i}" class="skills_and_techniques ${type}_token permanent_asset"></div>`, `box_${type}`);
                                        const destination = dojo.query(`#asset_board_${player_id} .pa${previous_tokens + 1}`)[0];
                                        const args = [token, destination, null, false, true];

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

                    const board_assets = this.gamedatas.board_assets[player_id];
                    let previous_tokens = $(`asset_board_${player_id}`).querySelectorAll('.permanent_asset').length;
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
                this.utils.matchBoardAssets();
            }

            for (let player_id of players) {

                if (gained_permanent_assets.hasOwnProperty(player_id)) {

                    for (let [type, num] of Object.entries(gained_permanent_assets[player_id])) {

                        for (let i=1; i<=num; i++) {
                            if (player_id == this.player_id) { this.gamedatas.resource_tracker['permanent_skills'][type]++; }
                        }
                    }
                    if (player_id == this.player_id) {
                        const updated_resources = this.utils.getCurrentPlayerResources();
                        this.utils.updatePlayerResources(player_id, updated_resources);
                    }

                    if (notif.args.shared_objective_points[player_id]) {
                        this.scoreCtrl[player_id].incValue(notif.args.shared_objective_points[player_id]);
                    }

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
                const player_id = slot.parentElement.parentElement.id.split('_').pop();
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
            const destination = $(`${new_starting_player}_water_and_psych`);
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

                        this.utils.updateTitlebar(_('Revealing Headwall'));
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

                    let args = [ele, $(`deck_draw_${i+1}`), 2, 'straighten'];

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
                const rerack_div = dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : '1',
                    sbX : 0,
                    sbY : 300,
                }), 'summit_discard');
                this.utils.summitBetaTooltip(rerack_div.id, '1');

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
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;
            for (const id of reracked_assets) {
                const type_arg = this.gamedatas.asset_identifier[id];
                this.gamedatas.hand_assets[id] = type_arg;
            }
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
                    this.utils.updateTitlebar(_('Discarding Summit Beta Token'));
                    await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                    this.utils.updatePlayerResources(this.player_id, notif.args.player_resources);
                    this.utils.handCount(this.player_id, notif.args.hand_count);
                    
                    const asset_deck = dojo.query('#asset_deck')[0];
                    while (asset_deck.firstElementChild) { asset_deck.removeChild(asset_deck.lastElementChild); }

                    if (this.gamedatas.gamestate.name === 'climbingCard') { this.utils.checkClimbingChoices(); }

                    // check if the trade button should be enabled
                    if (this.gamedatas.gamestate.name === 'climbOrRest' && $('trade_button').classList.contains('disabled')) {
                        if (this.utils.tradeEnabled()) { $('trade_button').classList.remove('disabled'); }
                    }

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

                // check if the trade button should be enabled
                if (this.gamedatas.gamestate.name === 'climbOrRest' && $('trade_button').classList.contains('disabled')) {
                    if (this.utils.tradeEnabled()) { $('trade_button').classList.remove('disabled'); }
                }

                this.utils.clicksOn();
                this.onUndoSummitBeta();
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_confirmEnergyDrink: async function (notif) {

            this.utils.clicksOff();
            const player_id = notif.args.player_id;
            await this.utils.updateWaterPsych(player_id, 1, 1);
            const show_hide_card_button = $('show_hide_card_button');

            if (this.isCurrentPlayerActive()) {

                const token_id = Object.keys(this.gamedatas.token_identifier).find(id => this.gamedatas.token_identifier[id] === '4');
                const token_ele = $(`summit_beta_${token_id}`);
                token_ele.classList.remove('selected_token', 'selectable_token');
                token_ele.parentElement.classList.remove('selected_token_wrap');
                token_ele.firstElementChild.classList.remove('click', 'cursor');

                if (this.utils.shouldAnimate()) {

                    if (show_hide_card_button && show_hide_card_button.classList.contains('shown')) { show_hide_card_button.click(); }

                    const args = [token_ele, $('summit_discard')];
                    this.utils.updateTitlebar(_('Discarding Summit Beta Token'));
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
                this.utils.summitBetaTooltip(token_ele.id, '4');
                $('token_display_1').append(token_ele);
                const width = token_ele.getBoundingClientRect().width;
                const height = token_ele.getBoundingClientRect().height;
                $(`hand_counter_${player_id}`).append(token_ele);
                token_ele.style.setProperty('--dw', width);
                token_ele.style.setProperty('--dh', height);

                if (this.utils.shouldAnimate()) {

                    if (show_hide_card_button && show_hide_card_button.classList.contains('shown')) { show_hide_card_button.click(); }
    
                    $('token_display').style.display = 'flex';
    
                    this.utils.updateTitlebar(_('Discarding Summit Beta Token'));
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
                for (const ele of this.bomber_anchor_selection_handlers) { ele.onclick = null; }
                this.bomber_anchor_selection_handlers = [];
                portaledge.querySelectorAll('.porta_plus').forEach(ele => { ele.remove(); });
                portaledge.querySelectorAll('.porta_minus').forEach(ele => { ele.remove(); });
                portaledge.querySelectorAll('.draw_num').forEach(ele => { ele.remove(); });
                document.querySelectorAll('.draw').forEach(ele => {
                    ele.classList.remove(ele.classList[ele.classList.length-1], 'draw');
                });

                const token_id = Object.keys(this.gamedatas.token_identifier).find(id => this.gamedatas.token_identifier[id] === '9');
                const token_ele = $(`summit_beta_${token_id}`);
                token_ele.classList.remove('selected_token', 'selectable_token');
                token_ele.parentElement.classList.remove('selected_token_wrap');
                token_ele.firstElementChild.classList.remove('click', 'cursor');
                
                if (this.utils.shouldAnimate()) {

                    const args = [token_ele, $('summit_discard')];
                    this.utils.updateTitlebar(_('Discarding Summit Beta Token'));
                    await this.utils.animationPromise(token_ele, 'token_hand_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                }
                else {

                    $('summit_discard').replaceChildren();
                    $('summit_discard').append(token_ele);
                }

                // check if the trade button should be enabled
                if (this.gamedatas.gamestate.name === 'climbOrRest') {
                    const trade_button = $('trade_button');
                    const trade_enabled = this.utils.tradeEnabled();
                    if (trade_button.classList.contains('disabled') && trade_enabled) {
                        trade_button.classList.remove('disabled');
                    }
                    else if (!trade_button.classList.contains('disabled') && !trade_enabled) {
                        $('trade_button').classList.add('disabled');
                    }
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
                this.utils.summitBetaTooltip(token_ele.id, '9');
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

            delete this.jesus_piece_requirements;
            this.notifqueue.setSynchronousDuration();
        },

        notif_retractRiskDie: async function (notif) {

            this.removeActionButtons();

            const die_wrapper = $('die_wrapper');
            const risk_die = $('risk_die');
            const die_face = die_wrapper.lastElementChild;

            if (this.utils.shouldAnimate()) {
                await this.utils.animationPromise(die_wrapper, 'remove_die', 'anim', null, false, true);
                die_wrapper.classList.remove('roll_die_wrapper');
                die_wrapper.style = '';
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
            const player_name = player.name;
            const player_color = player.color;
            const character_id = player.character;
            const previous_points_tokens = notif.args.new_points_tokens - 1;
            let wrapper_num;
            if (previous_points_tokens < 8) { wrapper_num = previous_points_tokens + 1; }
            else { wrapper_num = previous_points_tokens - 7; }
            const destination = dojo.query(`#player_${player_id} .pw${wrapper_num}`)[0];
            const tokens = this.gamedatas.token_identifier;
            const token_id = Object.keys(tokens).find(key => tokens[key] === '12');
            const summit_discard = $('summit_discard');

            if (this.utils.shouldAnimate()) {

                this.removeActionButtons();
                this.utils.updateTitlebar(_('Awarding 2-Point Token/s to '));
                const player_name_span = document.createElement('span');
                player_name_span.id = `${player_name}_span`;
                player_name_span.innerHTML = player_name;
                player_name_span.style.color = `#${player_color}`;
                $('pagemaintitletext').parentElement.insertBefore(player_name_span, $('pagemaintitletext').nextElementSibling);
                player_name_span_copy = player_name_span.cloneNode(true);
                player_name_span_copy.id = `${player_name}_span_copy`;
                $('gameaction_status_wrap').firstElementChild.append(player_name_span_copy);

                if (previous_points_tokens < 8) {
                    const two_point_token = dojo.place(`<div class="points_token points_1"></div>`, destination);
                    const token_box = two_point_token.getBoundingClientRect();
                    two_point_token.style.width = `${token_box.width}px`;
                    two_point_token.style.aspectRatio = `${token_box.width} / ${token_box.height}`;
                    const board = $('board');
                    const child_nodes = dojo.query('> *', board);
                    dojo.place(two_point_token, child_nodes[2], 'before');
                    this.utils.animationPromise(two_point_token, 'token_appears', 'anim', null, false, false);
                    await (async function() { return new Promise(resolve => setTimeout(resolve, 1500)) })();

                    const args = [two_point_token, destination];
                    two_point_token.classList.remove('token_appears');
                    two_point_token.style.setProperty('--dr', '25%');
                    await this.utils.animationPromise(two_point_token, 'points_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    two_point_token.style.cssText = '';
                }
                else {
                    const first_unflipped = document.querySelector(`#asset_board_${player_id} .two_points_token`);
                    const flip_wrapper = first_unflipped.parentElement;
                    first_unflipped.remove();

                    const token_flip = dojo.place(this.format_block('jstpl_flip_card', {
                        card_id : 'i',
                        extra_classes : '',
                        back_type : 'points_token two_points_token',
                        front_type : 'points_token four_points_token',
                        cX : 100,
                        cY : 0,
                    }), flip_wrapper);
                    token_flip.style.right = '-3%';
                    await this.utils.animationPromise(token_flip.firstElementChild, 'flip_transform', 'anim', null, true, false);
                    dojo.place(`<div class="points_token four_points_token"></div>`, flip_wrapper);
                }

                this.scoreCtrl[player_id].incValue(2);
                player_name_span.remove();
                player_name_span_copy.remove();

                // discard summit beta token

                this.utils.updateTitlebar(_('Discarding Summit Beta Token'));
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
                    this.utils.summitBetaTooltip(token_ele.id, '12');
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
                
                if (previous_points_tokens < 8) { dojo.place(`<div class="points_token two_points_token"></div>`, destination); }
                else { dojo.place(`<div class="points_token four_points_token"></div>`, destination); }
                this.scoreCtrl[player_id].incValue(2);

                if (this.isCurrentPlayerActive()) { $('summit_discard').append($(`summit_beta_${token_id}`)); }

                else {
                    const token_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_id,
                        sbX : token.x_y[0],
                        sbY : token.x_y[1],
                    }), summit_discard);
                    this.utils.summitBetaTooltip(token_ele.id, '12');
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
            const climbing_discard_90 = document.getElementById('climbing_discard_90');
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

            this.gamedatas.current_state = ['2', '6', '36', '41', '50', '54', '63'].includes(chosen_type_arg) ? 'addTokenToPitch' : 'climbingCard';

            if (this.utils.shouldAnimate()) {

                let chosen_direction = null;
                if (chosen_ele.id === $('crimper_display_1').firstElementChild.id) { chosen_direction = 'left'; }
                else if (chosen_ele.id === $('crimper_display_2').firstElementChild.id) { chosen_direction = 'right'; }

                // discard unchosen card
                this.utils.updateTitlebar(_('Discarding extra Climbing Card'));

                const origin = discard_ele.parentElement;
                climbing_discard_90.append(discard_ele);
                const size = discard_ele.getBoundingClientRect();
                origin.append(discard_ele);
                discard_ele.style.setProperty('--dw', size.width + 'px');
                discard_ele.style.setProperty('--dh', size.height + 'px');

                const discard_args = [discard_ele, climbing_discard_90, 3, 'rotate'];
                await this.utils.animationPromise(discard_ele, 'climbing_card_slot_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...discard_args);

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
                await this.utils.animationPromise(chosen_ele, 'climbing_card_crimper_to_slot', 'anim', this.utils.moveToNewParent(), false, true, ...chosen_args);
                dojo.setStyle(chosen_ele.id, {
                    'top' : '',
                    'left' : '',
                    'width' : '',
                    'height' : ''
                });
                $('climbing_dimmer').classList.add('dim_bg');

                if (this.isCurrentPlayerActive()) {
                    const bound_handler = this.onSelectClimbingCardChoice.bind(gameui);
                    const choice_top = $(`${chosen_id}_top`);
                    choice_top.onclick = bound_handler;
                    this.climbing_card_choice_handlers.push(choice_top);
                    choice_top.classList.add('cursor');
                    const choice_bottom = $(`${chosen_id}_bottom`);
                    choice_bottom.onclick = bound_handler
                    this.climbing_card_choice_handlers.push(choice_bottom);
                    choice_bottom.classList.add('cursor');
                }

                crimper_display.style.display = '';
                while (summit_discard.childElementCount > 1) { summit_discard.firstElementChild.remove(); }

                if (!['2', '6', '36', '41', '50', '54', '63'].includes(chosen_type_arg)) { this.utils.checkClimbingChoices(); }

                this.utils.removeOutsideClickListener();
                // set popup to close if user clicks x or outside of element
                const closePopup = () => {
                    $('show_hide_card_button').click();
                    
                    this.utils.removeOutsideClickListener();
                };

                // start listener
                this.utils.setupOutsideClickListener(climbing_slot, closePopup);

                this.notifqueue.setSynchronousDuration();
            }
            
            else { // shouldn't animate
            
                $('climbing_discard_90').append(discard_ele);
                $('climbing_dimmer').classList.add('dim_bg');
                climbing_slot.append(chosen_ele);
                crimper_display.style.display = '';
                this.utils.cleanClimbingDiscardPile();

                if (this.isCurrentPlayerActive()) {
                    const bound_handler = this.onSelectClimbingCardChoice.bind(gameui);
                    const choice_top = $(`${chosen_id}_top`);
                    choice_top.onclick = bound_handler;
                    this.climbing_card_choice_handlers.push(choice_top);
                    choice_top.classList.add('cursor');
                    const choice_bottom = $(`${chosen_id}_bottom`);
                    choice_bottom.onclick = bound_handler;
                    this.climbing_card_choice_handlers.push(choice_bottom);
                    choice_bottom.classList.add('cursor');
                }

                if (!['2', '6', '36', '41', '50', '54', '63'].includes(chosen_type_arg)) { this.utils.checkClimbingChoices(); }
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_undoClimbingCleanup: function (notif) {
            const player_id = this.getActivePlayerId();
            const character = this.gamedatas.player_names_and_colors[player_id]['character'];
            if (character === '10' && $('climbing_slot').firstElementChild) {
                $('climbing_slot').firstElementChild.remove();
            }
        },

        notif_updateFinalPersonalObjectivesTracker: function (notif) {
            this.gamedatas.personal_objectives_tracker = notif.args.final_personal_objectives_tracker;
        },

        notif_updatePlayerTokenTracker: function (notif) {
            this.gamedatas.player_token_tracker = notif.args.player_token_tracker;
        },

        notif_addZombie: function (notif) {
            this.gamedatas.zombie_players = notif.args.zombies;
        },

        notif_updatePlayerNamesAndColors: function (notif) {
            this.gamedatas.player_names_and_colors = notif.args.player_names_and_colors;
        },

        notif_cleanUpClimbOrRest: async function (notif) {

            // close portaledge
            if ($('portaledge').style.display === 'block') {
                const portaledge = $('portaledge');
                await this.utils.animationPromise(portaledge, 'portaledge_close', 'anim', null, false, true);
                portaledge.style.marginTop = '-36.4061%';
                portaledge.style.display = '';
            }
            // discard climbing card
            const climbing_slot = $('climbing_slot');
            const climbing_discard_straightened = $('climbing_discard_straightened');
            if (climbing_slot.firstElementChild) {
                const climbing_div = climbing_slot.firstElementChild;
                const origin = climbing_div.parentElement;
                climbing_discard_90.append(climbing_div);
                const size = climbing_div.getBoundingClientRect();
                origin.append(climbing_div);
                climbing_div.style.setProperty('--dw', size.width + 'px');
                climbing_div.style.setProperty('--dh', size.height + 'px');

                const discard_args = [climbing_div, climbing_discard_90, 3, 'rotate'];
                await this.utils.animationPromise(climbing_div, 'climbing_card_slot_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...discard_args);

            } else if (climbing_discard_straightened.firstElementChild) {
                await this.utils.discardClimbingCard();
            }

            this.climbing_card_info = [];
            this.notifqueue.setSynchronousDuration();
        },

        notif_preGameEnd: function (notif) {

            const score_tracker = notif.args.score_tracker;
            const scored_personal_objectives = notif.args.scored_personal_objectives;
            const personal_objectives_tracker = notif.args.personal_objectives_tracker;
            const players = this.gamedatas.player_names_and_colors;
            const titlebar_addon = $('titlebar_addon');
            const toggles_wrap = $('toggles_wrap');
            toggles_wrap.style.width = '61vmin';
            const personal_objectives_toggle = $('personal_objectives_toggle');
            if ($('final_round_msg')) { $('final_round_msg').remove(); }

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
                        color : `#${player.color}`,
                        player_name : player.name,
                    }), player_objectives_wrap);
                    name_span.style.display = 'block';
                    name_span.classList.add('opponent_objectives_name');

                    for (const objective_id of Object.keys(objectives)) {
                        const objective = this.gamedatas.personal_objectives[objective_id];
                        const coords = objective['x_y'];
                        const obj_ele = dojo.place(this.format_block('jstpl_personal_objective', {
                            poId : `${objective_id}_opponent`,
                            poX : coords[0],
                            poY : coords[1],
                        }), player_objectives_wrap);
                        obj_ele.classList.add('opponent_objective_card');
                        const po_tracker = obj_ele.firstElementChild;
                        const po_pitches = personal_objectives_tracker[player_id][objective_id];
                        const po_num = po_pitches.length < 3 ? po_pitches.length : 3;
                        po_tracker.innerHTML = `${po_num}/3`;
                        if (po_num === 3) { po_tracker.style.color = 'green'; }
                        po_tracker.style.fontSize = '0.7em';
                        this.utils.personalObjectiveTooltip(obj_ele.id, objective_id);
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

            this.utils.updateTitlebarAddon(_('Game End'), 'phase');
            this.utils.addTooltipsToLog();

            this.notifqueue.setSynchronousDuration();
        },
    });
});