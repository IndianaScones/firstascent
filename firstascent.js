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
                    dojo.place(`<div style="font-size: 10px; margin-bottom: 5px;">${skills_title}</div>`, 
                        player_panel_div);
                    dojo.place(this.format_block('jstpl_skills', {
                        player_id : player_id,
                    }), player_panel_div);

                    // starting techniques
                    const techniques_title = _('Techniques ____');
                    dojo.place(`<div style="font-size: 10px; margin-bottom: 5px;">${techniques_title}</div>`, 
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

                if (player.character) { 
                    const character_id = gamedatas.players[player_id]['character'];
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
                        for (let i=0; i<=pitch_tracker.length-1; i++) {
                            if (i < pitch_tracker.length-1) {
                                const rope_num = i+1;
                                const current_pitch_id = pitch_tracker[i+1];
                                const previous_pitch_id = pitch_tracker[i];
                                const current_pitch_rope_hub = `pitch_${current_pitch_id}_rope`;
                                const rope_info = this.utils.getRope(previous_pitch_id, current_pitch_id, gamedatas.board);
                                const rotation = rope_info['rotation'];
                                const extra_class = rope_info['mini'] ? 'mini_rope' : '';

                                const rope_wrapper = dojo.place(`<div id="rope_wrapper_${player_id}_${rope_num}" class="rope_wrapper r${rotation}"></div>`, current_pitch_rope_hub);
                                const rope_i = dojo.place(this.format_block('jstpl_rope', {
                                    player_id : player_id,
                                    rope_num : rope_num,
                                    extra_classes : extra_class,
                                    rX : rope_color[0],
                                    rY : rope_color[1]
                                }), `rope_wrapper_${player_id}_${rope_num}`);
                                rope_i.style.transform = `rotate(${rotation}deg)`;
                            } else if (i === pitch_tracker.length-1) {
                                dojo.place(meeple, `pitch_${pitch_tracker[i]}`);
                            }
                        }
                    }
                }
            }

            // Starting player token
            const starting_player = gamedatas.starting_player;
            const token_destination = this.player_id == starting_player ? $('ref_row') : $(`${starting_player}_water_and_psych`);
            dojo.place(this.format_block('jstpl_starting_player', {}), token_destination);

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


        // Display the correct board for player count and set ledge pitches

            if (this.player_count <= 3) {
                $('board').classList.add('desert');
                this.board = 'desert';
                this.ledge = ['16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26'];
            } else {
                $('board').classList.add('forest');
                dojo.query('.pitch_wrap').style({
                    'height':'13.6%',
                    'width':'7.81%',
                });
                this.board = 'forest';
                this.ledge = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34'];
            }

        // Add asset tokens to pitches

            if (gamedatas.pitch_asset_tokens != []) {
                for (let [pitch_type_arg, token_type_array] of Object.entries(gamedatas.pitch_asset_tokens)) {
                    const pitch = dojo.query(`.p${pitch_type_arg}`)[0];
                    for (let type of token_type_array) {
                        dojo.place(`<div id="${pitch_type_arg}_token_wrapper" class="pitch_token_wrapper"></div>`, pitch);
                        dojo.place(`<div class="${type}_token symbol_token"></div>`, `${pitch_type_arg}_token_wrapper`);
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
            else { summit_beta_coords = []; }
            dojo.place(this.format_block('jstpl_summit_discard', {
                summit_discard_top : summit_beta_discard_coords[0],
                summit_discard_left : summit_beta_discard_coords[1]
            }), 'board', 2);

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
                }), 'climbing_discard');
            }
            if (Object.keys(gamedatas.climbing_in_play).length > 0) {
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
                    const token = gamedatas.summit_beta_tokens[player_summit_beta_tokens[token_id]];
                    dojo.place(`<div id="hand_token_${slot}" class="hand_token_wrap"></div>`, 'assets_wrap');
                    dojo.place(this.format_block('jstpl_summit_beta', {
                        TOKEN_ID : token_id,
                        sbX : token.x_y[0],
                        sbY : token.x_y[1],
                    }), `hand_token_${slot}`);
                    slot++;
                });

                for (const [symbol, num] of Object.entries(player_symbol_tokens)) {
                    if (num > 0) {
                        const new_token_id = dojo.query('#assets_wrap .symbol_token').length + 1;
                        dojo.place(`<div id="hand_token_${slot}" class="hand_token_wrap"></div>`, 'assets_wrap');
                        dojo.place(`<div id="${symbol}_token_${new_token_id}" class="${symbol}_token symbol_token"></div>`, `hand_token_${slot}`);
                        slot++;
                    }
                }

                this.utils.resizeHand();

                // tooltips
                dojo.query('#assets_wrap .asset').forEach(ele => {
                    const card_id = ele.id.slice(-3).replace(/^\D+/g, '');
                    const card_type = gamedatas.asset_identifier[card_id];
                    this.utils.assetTooltip(ele.id, card_type);
                });

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
                                <p>Starting Water/Psych: ${character['water_psych']}</p>
                                <span>Home Crag: ${home_crag}</span>
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
                    dojo.place(this.format_block('jstpl_asset_board', {
                        player : this.player_id,
                        character : character_name,
                        abX : ab_pos[0],
                        abY : ab_pos[1],
                    }), `character_${my_character_id}`);

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

                    dojo.place(this.format_block('jstpl_cube', {
                        character : character_name,
                        type : 'water',
                    }), $(`${character_name}_w${water_psych.water}`));
                    dojo.place(this.format_block('jstpl_cube', {
                        character : character_name,
                        type : 'psych',
                    }), $(`${character_name}_p${water_psych.psych}`));

                    if (character_name == 'young_prodigy') {

                    }
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
                        dojo.place(this.format_block('jstpl_asset_board', {
                            player : player_id,
                            character : character_name,
                            abX : ab_pos[0],
                            abY : ab_pos[1],
                        }), `character_${character_id}`);

                        if (character_name == 'phil') {
                            const water_7 = document.createElement('div');
                            water_7.id = 'phil_w7';
                            water_7.classList.add('cube_wrap', 'cb_w_7');
                            const psych_7 = document.createElement('div');
                            psych_7.id = 'phil_p7';
                            psych_7.classList.add('cube_wrap', 'cb_p_7');
                            $(`character_${character_id}`).insertBefore(water_7, $('phil_break'));
                            $(`character_${character_id}`).insertBefore(psych_7, $(`asset_board_${player_id}`));
                        }

                        dojo.place(this.format_block('jstpl_cube', {
                            character : character_name,
                            type : 'water',
                        }), $(`${character_name}_w${water_psych.water}`));
                        dojo.place(this.format_block('jstpl_cube', {
                            character : character_name,
                            type : 'psych',
                        }), $(`${character_name}_p${water_psych.psych}`));

                        if (character_name == 'young_prodigy') {

                        }
                    }
                }
            }

            // place asset cards on asset boards
            for (const player_id in gamedatas.players) { // show tucked box if in use

                const board_assets = gamedatas['board_assets'][player_id];
                const playerInfo = gamedatas.players[player_id];
                const character_id = playerInfo.character ? playerInfo.character : null;
                const character_name = character_id ? gamedatas.characters[character_id]['name'] : null;

                ['gear', 'face', 'crack', 'slab'].forEach(type => {

                    const type_assets = board_assets[type];

                    for (let i=1; i<=4; i++) {
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
                const objective_1 = gamedatas.personal_objectives[current_personal_objectives[0]];
                const objective_2 = gamedatas.personal_objectives[current_personal_objectives[1]];
                const po_coords_1 = objective_1['x_y'];
                const po_coords_2 = objective_2['x_y'];
                dojo.place(
                    `${this.format_block('jstpl_personal_objective', {
                        poId : objective_1,
                        poX : po_coords_1[0],
                        poY : po_coords_1[1],
                    })}
                     ${this.format_block('jstpl_personal_objective', {
                        poId : objective_2,
                        poX : po_coords_2[0],
                        poY : po_coords_2[1],
                     })}`, 'hand_objectives');
            }


            //// Tooltips

            // shared objectives

            for (let i=0; i<=2; i++) {
                const current_shared_objective = gamedatas.current_shared_objectives[i];
                const bg_pos = gamedatas.shared_objectives[current_shared_objective]['x_y'];
                const subscript = _(gamedatas.shared_objectives[current_shared_objective]['subscript_string']) || '';
                const title = _(gamedatas.shared_objectives[current_shared_objective]['description']);
                const condition = _(gamedatas.shared_objectives[current_shared_objective]['objective_string']);
                const html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                            <div class="shared_objective shared_objective_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%;"></div>
                            <div>${condition}</div>
                            <div style="font-size:10px;">${subscript}</div>`;
                this.addTooltipHtml(`shared_objective${i+1}`, html, 1000);
            }

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

            for (let i=1; i<=pitches_num; i++) {
                const current_pitch = dojo.attr(`pitch_${i}`, 'class').slice(-2).replace(/^\D+/g, '');
                let skill_tokens = [];
                if (Object.keys(gamedatas.pitch_asset_tokens).includes(current_pitch)) {
                    for (const type of gamedatas.pitch_asset_tokens[current_pitch]) {
                        const token = document.createElement('div');
                        token.innerHTML = `<div id="${current_pitch}_token_wrapper" class="pitch_token_wrapper"><div class="${type}_token symbol_token"></div></div>`;
                        skill_tokens.push(token.firstElementChild);
                    }
                }
                this.utils.pitchTooltip(`pitch_${i}_click`, current_pitch, skill_tokens);
            }

            // if (gamedatas.pitch_asset_tokens != []) {
            //     for (let token of gamedatas.pitch_asset_tokens) {
            //         const pitch = dojo.query(`.p${token.pitch_type_arg}`)[0];
            //         dojo.place(`<div id="${token.pitch_type_arg}_token_wrapper" class="pitch_token_wrapper"></div>`, pitch);
            //         dojo.place(`<div class="${token.asset_token_type}_token symbol_token"></div>`, `${token.pitch_type_arg}_token_wrapper`);
            //     }
            // }

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
                            <p>Starting Water/Psych: ${character['water_psych']}</p>
                            <span>Home Crag: ${home}</span>
                            <span style="font-size: 10px; white-space: nowrap;"><i>${native_lands}</i></span>`;
                this.addTooltipHtml(`character_${character_id}`, html, 1000);
            }

            const tucked_tooltip = _('tucked Asset cards');
            dojo.query('.asset_counter').forEach(ele => { this.addTooltipHtml(ele, tucked_tooltip, 1000); });

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

            // style and connect asset deck and spread during draw asset action
            if (this.checkAction('drawAsset', true)) {
                $('asset_deck').classList.add('selectable');
                for (let slot=0; slot<=3; slot++) {
                    const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                    available_asset.classList.add('selectable');
                }
            }

            // state specific refresh

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
                    $('climbing_slot').classList.add('dim_bg');

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

            // if empty, change hand_assets and board_assets from simple arrays into the associative arrays expected by utils.sanitizeHand and utils.sanitizeAssetBoard

            if (gamedatas.hand_assets == []) { gamedatas.hand_assets = {}; }
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
            let climbing_card_info = [];
            let climbing_card = [];

            switch( stateName ) {
                case 'characterSelection':
                    const available_characters = dojo.query('#character selection .character').length;
                    // check # of available characters so as not to double dojo.connect() for starting player
                    if (this.isCurrentPlayerActive() && available_characters < this.player_count+1) {
                        dojo.query('.namebox').forEach((element) => {
                            element.classList.add('cursor');
                        });
                        this. character_handlers = []
                        dojo.query('.namebox').forEach(ele => {
                            this.character_handlers.push(dojo.connect(ele, 'onclick', this, 'onSelectCharacter'));
                        });
                    }
                    break;

                case 'drawAssets':
                    if (this.isCurrentPlayerActive()) {

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
                    if (this.isCurrentPlayerActive()) {
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
                        this.resources = this.utils.getCurrentPlayerResources(this.player_id);
                    }
                    break;

                case 'climbingCard':
                    if (this.isCurrentPlayerActive()) {
                        this.resources = this.utils.getCurrentPlayerResources(this.player_id);
                        this.choices_info = {
                            display_requirements : [],
                            requirements_met : [],
                            no_target_message : [],
                        };

                        const choices = [dojo.query('#climbing_slot .a')[0], dojo.query('#climbing_slot .b')[0]];
                        for (const choice of choices) {
                            const option = choice.classList[1];
                            const card_id = choice.parentElement.id.slice(-3).replace(/^\D+/g, '');
                            const card_type = this.gamedatas.climbing_card_identifier[card_id];
                            const choice_args = this.gamedatas.climbing_cards[card_type][`${option}_args`];
                            const hand_size = dojo.query('#assets_wrap .asset').length;
                            const requirements = {'water': choice_args.water, 'psych': choice_args.psych};
                            const others = this.gamedatas.climbing_cards[card_type][`${option}_args`].hasOwnProperty('others') || false;
                            const any_skill = this.gamedatas.climbing_cards[card_type][`${option}_args`]['discard_type'] === 'any_skill' ? true : false;
                            const any_asset = this.gamedatas.climbing_cards[card_type][`${option}_args`]['discard_type'] === 'any_asset' ? true : false;
                            const ignore_requirements = choice_args.ignore_requirements ? true : false;
                            const gear_in_hand = choice_args.gear_in_hand ? true : false;
                            const card_in_hand = choice_args.card_in_hand ? true : false;
                            const played = !gear_in_hand && !card_in_hand ? true : false;
                            const give_gear_card = choice_args.give_gear_card ? true : false;
                            if (!give_gear_card) { requirements['give_assets'] = choice_args.give_assets; }
                            const steal_asset = (choice_args.steal_asset || choice_args.benefit == 'stealAsset') ? true : false;
                            let requirements_met = true;
                            let no_target_message = false;

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
                                }
                                else { asset_requirements = Object.entries(choice_args.assets); }

                                if (any_asset) { asset_requirements.push(['any_asset', -choice_args['discard_num']]); }
                                if (any_skill) { asset_requirements.push(['any_skill', -choice_args['discard_num']]); }

                                for (const [type, value] of asset_requirements) { requirements[type] = value; }
                                Object.keys(requirements).forEach(key => requirements[key] = (requirements[key] < 0) ? Math.abs(requirements[key]) : 0);

                                this.choices_info['display_requirements'].push([this.resources, requirements, others]);

                                if (choice_args.water < 0 && this.resources['water'] < Math.abs(choice_args.water)) { requirements_met = false; }
                                if (choice_args.psych < 0 && this.resources['psych'] < Math.abs(choice_args.psych)) { requirements_met = false; }

                                if (!gear_in_hand && !card_in_hand) {
                                    for (const [type, value] of asset_requirements) {
                                        if (type == 'any_asset' && this.resources['any_asset'] < Math.abs(value)) { requirements_met = false; }
                                        else if (type == 'any_skill' && this.resources['any_skill'] < Math.abs(value)) { requirements_met = false; }
                                        else if (value < 0 && this.resources['skills'][type] + this.resources['asset_board'][type] < Math.abs(value)) {
                                            requirements_met = false;
                                        }
                                    }
                                } else {
                                    for (const [type, value] of asset_requirements) {
                                        if (value < 0 && this.resources['skills'][type] < Math.abs(value)) {
                                            requirements_met = false;
                                        }
                                    }
                                }
                                if (choice_args.give_assets > 0 && hand_size < choice_args.give_assets) { requirements_met = false; }
                            
                            } else if (ignore_requirements) { this.choices_info['display_requirements'].push([this.resources, [], false]); }

                            if (steal_asset) {
                                let steal_requirement_met = false;
                                no_target_message = true;
                                dojo.query('.asset_board_slot > .asset').forEach(ele => {
                                    const player_id = ele.parentElement.parentElement.parentElement.id.slice(-7);
                                    if (player_id != this.player_id && card_type != 8) {
                                        steal_requirement_met = true;
                                        no_target_message = false;
                                    }
                                    else if (player_id != this.player_id && card_type == 8) {
                                        const asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
                                        const asset_arg = this.gamedatas.asset_identifier[asset_id];
                                        const asset_type = this.utils.getAssetType(asset_arg);
                                        if (asset_type == 'gear') {
                                            steal_requirement_met = true;
                                            no_target_message = false;
                                        }
                                    }
                                });
                                if (!requirements_met || !steal_requirement_met) { requirements_met = false; }
                            }
                            this.choices_info['requirements_met'].push(requirements_met);
                            this.choices_info['no_target_message'].push(no_target_message);
                        }

                        if (!this.choices_info['requirements_met'].includes(true)) {
                            this.addActionButton('pass_button', _('Pass'), 'onPassClimbingCard', null, false, 'white');
                            $('pagemaintitletext').insertAdjacentHTML('beforebegin', '<span id="pass_message">You cannot choose either option</span>');
                        }
                    }
                    break;

                case 'resting':
                    (async () => {
                        $('rest_water_draw_num').innerHTML = 0;
                        $('rest_psych_draw_num').innerHTML = 0;

                        this.resting_selection_handlers = [];
                        this.portaledge_selection_handlers = [];
                        const portaledge = $('portaledge');
                        $('rest_water_psych').style.display = 'block';

                        if (this.getActivePlayerId() == this.player_id) {
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

                case 'discardAssets':

                    climbing_card_info = args.args.climbing_card_info;
                    if (Object.keys(climbing_card_info).length > 0 && $('climbing_slot').firstElementChild) { this.utils.retractClimbingCard(); }
                    this.discard_type = args.args.discard_type;
                    this.discard_num = args.args.discard_num;
                    this.asset_selection_handlers = [];
                    let hand_cards_of_discard_type = false;
                    const played = climbing_card_info['choice_args']['card_in_hand'] || climbing_card_info['choice_args']['gear_in_hand'] ? true : false;
                    const player_id = this.getActivePlayerId();

                    if (this.isCurrentPlayerActive()) {
                        let i = 0;
                        dojo.query('.hand_asset_wrap > .asset').forEach((ele) => {
                            const id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const arg = this.gamedatas.asset_identifier[id];
                            const type = this.utils.getAssetType(arg);

                            if ((this.discard_type === 'any_skill' && type != 'gear') || (type === this.discard_type || !this.discard_type || this.discard_type == 'any_asset')) {
                                this.asset_selection_handlers[i] = dojo.connect(ele, 'onclick', this, 'onSelectAssetForDiscard');
                                ele.classList.add('cursor', 'selectable');
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
                    const climbing_card_type = args.args.climbing_card_info['type_arg'];
                    if (climbing_card_type && $('climbing_slot').firstElementChild) { this.utils.retractClimbingCard(); }
                    break;

                case 'selectPortaledge':
                    (async () => {
                        climbing_card_info = args.args.climbing_card_info || [];
                        if (climbing_card_info != [] && $('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }
                        this.portaledge_selection_handlers = [];
                        const portaledge = $('portaledge');
                        this.portaledge_num = climbing_card_info.portaledge_num || null;
                        this.portaledge_types = climbing_card_info.portaledge_types || null;

                        if (this.getActivePlayerId() == this.player_id) {
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
                    dojo.query('.token_button').forEach(ele => {
                        
                        const button_type = ele.firstElementChild.id.slice(0, -6);
                        if (!args.args.climbing_card_info.token_types.includes(button_type)) { ele.classList.add('disabled'); }
                    });
                    break;

                case 'addAssetToAssetBoard':
                    this.utils.retractClimbingCard();

                    const add_types = args.args.types;
                    this.asset_selection_handlers = [];

                    if (this.isCurrentPlayerActive()) {
                        let i = 0;
                        dojo.query('.hand_asset_wrap > .asset').forEach(ele => {
                            const id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const type_arg = this.gamedatas.asset_identifier[id];
                            const type = this.utils.getAssetType(type_arg);

                            if (add_types.includes(type) || add_types.includes('any')) {
                                this.asset_selection_handlers[i] = dojo.connect(ele, 'onclick', this, 'onSelectAssetToAssetBoard');
                                ele.classList.add('cursor', 'selectable');
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
                    const summit_beta_tokens = args.args.summit_beta_tokens;

                    (async () => {
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

                        $('summit_pile').style.zIndex = '201';
                        let args = [token_flip_2, $('second_summit_beta_token')];

                        this.utils.animationPromise(token_flip_1.firstElementChild, 'flip_transform_summit_beta', 'anim', null, true, false);
                        this.utils.animationPromise(token_flip_2.firstElementChild, 'flip_transform_summit_beta', 'anim', null, true, false);
                        await this.utils.animationPromise(token_flip_2, 'token_to_second_position', 'anim', this.utils.moveToNewParent(), false, true, ...args);

                        const token_1_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                            TOKEN_ID : token_1.id,
                            sbX : token_1_info['x_y'][0],
                            sbY : token_1_info['x_y'][1],
                        }), 'summit_pile');
                        token_1_ele.style.width = '200%';
                        token_1_ele.style.height = '200%';

                        const token_2_ele = dojo.place(this.format_block('jstpl_summit_beta', {
                            TOKEN_ID : token_2.id,
                            sbX : token_2_info['x_y'][0],
                            sbY : token_2_info['x_y'][1],
                        }), 'second_summit_beta_token');
                        token_2_ele.style.width = '200%';
                        token_2_ele.style.height = '200%';

                        if (this.getActivePlayerId() == this.player_id) {
                            token_1_ele.classList.add('selectable_token', 'cursor');
                            token_2_ele.classList.add('selectable_token', 'cursor');

                            this.token_selection_handlers = [
                                dojo.connect(token_1_ele, 'onclick', this, 'onSelectChooseSummitBetaToken'),
                                dojo.connect(token_2_ele, 'onclick', this, 'onSelectChooseSummitBetaToken'),
                            ];
                        }

                    })();
                    break;

                case 'chooseTechniqueToken':
                    dojo.query('.token_button').forEach(ele => {
                        dojo.setStyle(ele.firstElementChild, {
                            'width' : '38px',
                            'height' : '36px',
                            'left' : '1%',
                            'top' : '-10%',
                        });
                    });
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
                    dojo.query('.cursor').forEach((ele) => { ele.classList.remove('cursor'); });
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
                    dojo.query('.selected_pitch').forEach(ele => { ele.classList.remove('selected_pitch'); });
                    dojo.query('.available_pitch').forEach(ele => { ele.classList.remove('available_pitch'); })
                    dojo.query('.asset.cursor').forEach(ele => { ele.classList.remove('cursor', 'selectable'); });
                    dojo.query('.pitch_click').forEach(ele => { ele.classList.remove('cursor'); });
                    this.pitch_handlers = [];
                    this.resource_handlers = [];
                    break;

                case 'climbingCard':
                    dojo.query('.cursor').forEach((ele) => { ele.classList.remove('cursor'); });
                    if (this.isCurrentPlayerActive()) { for (let handler of this.climbing_card_choice_handlers) { dojo.disconnect(handler); } }
                    break;

                case 'resting':
                    this.rest_resources = 0;
                    $('rest_water_psych').style.display = 'none';
                    dojo.query('.rest_click').forEach(ele => { ele.style.display = 'none'; });
                    dojo.query('.rest_minus').forEach(ele => { ele.style.display = 'none'; });
                    dojo.query('.rest_plus').forEach(ele => { ele.style.display = 'none'; });
                    dojo.query('.rest_draw_num').forEach(ele => { ele.style.display = 'none'; });
                    dojo.query('.draw').forEach(ele => {
                        ele.classList.remove('draw');
                        ele.classList.remove(ele.classList[ele.classList.length-1]);
                    });
                    break;

                case 'discardAssets':
                    dojo.query('.cursor').forEach((ele) => { ele.classList.remove('cursor', 'selectable', 'selected_resource'); });
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
            }
        },

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );
                      
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
                        break;

                    case 'climbOrRest':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmPitch', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        this.addActionButton('rest_button', _('Rest'), 'onRest', null, false, 'white');
                        break;

                    case 'climbingCard':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmClimbingCardChoice', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'white');
                        break;

                    case 'discardAssets':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssetsForDiscard', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        break;

                    case 'selectOpponent':
                        const players = Object.values(this.gamedatas.players);
                        for (const player of players) {
                            const character = this.gamedatas.characters[`${player.character}`]
                            if (player.id != this.player_id) {
                                this.addActionButton(`${player.id}`, `${player.name}`, 'onSelectOpponent');
                                dojo.setStyle(`${player.id}`, {
                                    "color" : '#fff',
                                    "background-color" : `#${player.color}`,
                                    "text-shadow" : '-1px 0 black, 0 1px black, 1px 0 black, 0 1px black'
                                });
                                $(`${player.id}`).classList.add('opponent');
                            }
                        }
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmOpponent', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        break;

                    case 'selectPortaledge':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmPortaledge', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
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
                        break;

                    case 'addAssetToAssetBoard':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssetToAssetBoard', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        break;

                    case 'stealFromAssetBoard':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmStealFromAssetBoard', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
                        break;

                    case 'chooseSummitBetaToken':
                        this.addActionButton('confirm_button', _('Confirm'), 'onConfirmChooseSummitBetaToken', null, false, 'white');
                        $('confirm_button').classList.add('disabled');
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
                        break;

                    case 'choosePermanentAssets':
                        const available_tokens = args.available_permanent_assets;

                        for (const [player, types] of Object.entries(available_tokens)) {
                            if (player == this.player_id) {

                                for (const [type, num] of Object.entries(types)) {
                                    for (let i=1; i<=num; i++) {

                                        this.addActionButton(`${type}_button_${i}`, `<div id="${type}_token" class="skills_and_techniques ${type}_token"></div>`, 'onSelectPermanentAsset', null, false, 'blue');
                                        $(`${type}_button_${i}`).classList.add('token_button');
                                    }
                                }
                                this.addActionButton('confirm_button', _('Confirm'), 'onConfirmPermanentAssets', null, false, 'blue');
                            }
                        }
                        break;
                        
/*               
                     Example:
     
                     case 'myGameState':
                        
                        // Add 3 action buttons in the action status bar:
                        
                        this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                        this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                        this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                        break;
*/
                }
            } else {
                switch (stateName) {
                    case 'climbingCard':
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'white');
                        break;
                    case 'addTokenToPitch':
                        this.addActionButton('show_hide_card_button', _('Hide card'), 'onShowHideCard', null, false, 'white');
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
            const hex_num = pitch.id.slice(-2).replace(/^\D+/g, '');
            const pitch_num = pitch.classList[pitch.classList.length-1].slice(-2).replace(/^\D+/g, '');

            let unoccupied = pitch.querySelector('.meeple') == null ? true : false;
            if (unoccupied || this.gamedatas.gamestate.name === 'addTokenToPitch') { 
                dojo.query('#generalactions .requirement_wrap').forEach((ele) => { ele.remove(); });
                if (!$('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.add('disabled'); }
                if ($('requirements_message')) { $('requirements_message').remove(); }
                const selected_pitch = dojo.query('.selected_pitch')[0];
                if (selected_pitch) { 
                    selected_pitch.classList.remove('selected_pitch');
                    selected_pitch.classList.add('available_pitch');
                }
                pitch_border.classList.remove('available_pitch');
                pitch_border.classList.add('selected_pitch');

                if (this.gamedatas.gamestate.name === 'climbOrRest') {
                    const pitch_requirements = this.gamedatas.pitches[pitch_num]['requirements'];

                    let requirements_met = true;
                    if (pitch_requirements.water > 0 && this.resources['water'] < pitch_requirements.water) { requirements_met = false; }
                    if (pitch_requirements.psych > 0 && this.resources['psych'] < pitch_requirements.psych) { requirements_met = false; }

                    for (const [type, value] of Object.entries(pitch_requirements)) {
                        if (type == 'any_skill') {
                            const all_skills = this.resources['skills']['face'] + this.resources['skills']['crack'] + this.resources['skills']['slab'];
                            const skill_requirements = pitch_requirements['face'] + pitch_requirements['crack'] + pitch_requirements['slab'];
                            if (all_skills < skill_requirements) { requirements_met = false; }
                        }
                        else if (value > 0 && this.resources['skills'][type] < value) { requirements_met = false; }
                    }

                    this.utils.displayRequirements(this.resources, pitch_requirements);

                    const missing_water_psych = dojo.query('.water_psych_border').length;
                    const missing_gears = dojo.query('.gear_border').length;
                    const missing_skills = dojo.query('.skill_border').length;
                    if (requirements_met) { $('confirm_button').classList.remove('disabled'); }
                    else { $('generalactions').lastElementChild.insertAdjacentHTML('afterend', '<span id="requirements_message">Can\'t fulfill requirements</span>'); }
                } else { $('confirm_button').classList.remove('disabled'); }
            }
        },

        onConfirmPitch: function(evt) {
            dojo.stopEvent(evt);

            for (let handler of this.pitch_handlers) { dojo.disconnect(handler); }
            dojo.query('.available_pitch').forEach((ele) => {
                ele.nextElementSibling.nextElementSibling.classList.remove('cursor');
            });
            dojo.query('.selected_pitch')[0].nextElementSibling.nextElementSibling.classList.remove('cursor');

            this.gamedatas.gamestate.descriptionmyturn = _('You must select assets');
            this.updatePageTitle();
            this.removeActionButtons();
            this.addActionButton('confirm_requirements_button', _('Confirm'), 'onConfirmRequirements', null, false, 'white');
            $('confirm_requirements_button').classList.add('disabled');
            this.addActionButton('risk_it_button', _('Risk it'), 'onRiskIt', null, false, 'white');
            $('risk_it_button').classList.add('disabled');
            this.addActionButton('my_undo_button', _('Undo'), dojo.hitch(this, function() {
                dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('selected_resource'); });
                dojo.query('.selected_resource_wrap').forEach(ele => { ele.classList.remove('selected_resource_wrap'); });
                this.restoreServerGameState();
            }), null, false, 'white');

            const pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
            const hex_num = pitch.id.slice(-2).replace(/^\D+/g, '');
            const pitch_num = pitch.classList[pitch.classList.length-1].slice(-2).replace(/^\D+/g, '');
            const selected_pitch = dojo.query('.selected_pitch')[0];
            const pitch_requirements = this.gamedatas.pitches[pitch_num]['requirements'];

            this.resource_handlers = [];
            dojo.query('#assets_wrap .asset').forEach((element) => {
                this.resource_handlers.push(dojo.connect(element, 'onclick', this, 'onSelectResource'));
                element.classList.add('cursor', 'selectable');
            });
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
                if (this.checkAction('rest')) {
                    this.ajaxcall("/firstascent/firstascent/rest.html", { lock: true,
                        player_id : player_id
                    }, this, function(result) {} );
                }
            });
        },

        onSelectResource: function(evt) {
            dojo.stopEvent(evt);

            const resource = evt.target;
            if (resource.classList.contains('selected_resource')) {
                resource.classList.remove('selected_resource');
                resource.parentElement.classList.remove('selected_resource_wrap');
            }
            else {
                resource.classList.add('selected_resource');
                resource.parentElement.classList.add('selected_resource_wrap');
            }

            this.utils.sanitizeHand();

            const selected_pitch = dojo.query('.selected_pitch')[0].nextElementSibling;
            const pitch_num = selected_pitch.classList[selected_pitch.classList.length-1].slice(-2).replace(/^\D+/g, '');
            const pitch_requirements = this.gamedatas.pitches[pitch_num]['requirements'];

            const selected_resources = {
                'gear' : 0,
                'face' : 0,
                'crack' : 0,
                'slab' : 0,
                'any_skill' : 0,
            };
            if (this.resources['water'] >= pitch_requirements['water']) { selected_resources['water'] = pitch_requirements['water']; }
            else selected_resources['water'] = 0;
            if (this.resources['psych'] >= pitch_requirements['psych']) { selected_resources['psych'] = pitch_requirements['psych']; }
            else selected_resources['psych'] = 0

            dojo.query('.selected_resource').forEach((ele) => {
                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                const asset = this.gamedatas.asset_identifier[id];
                const skills = this.gamedatas.asset_cards[asset]['skills'];
                for (const [key, value] of Object.entries(skills)) {
                    if (value) {
                        const resource = key;
                        if (selected_resources[resource] >= pitch_requirements[resource] && resource != 'gear') { selected_resources['any_skill']++; }
                        else { selected_resources[resource]++; }
                    }
                }
            });

            const fulfilled = Object.keys(selected_resources).every(key => selected_resources[key] === pitch_requirements[key]);
            const confirm_button = $('confirm_requirements_button');

            if (fulfilled && confirm_button.classList.contains('disabled')) {
                confirm_button.classList.remove('disabled');
            } else if (!confirm_button.classList.contains('disabled')) {
                confirm_button.classList.add('disabled');
            }
        },

        onConfirmRequirements: function(evt) {
            dojo.stopEvent(evt);

            let selected_resources = '';
            dojo.query('.selected_resource').forEach((resource) => {
                const id = resource.id.slice(-3).replace(/^\D+/g, '');
                selected_resources += `${id},`;
            });

            const selected_hex = dojo.query('.selected_pitch')[0].nextElementSibling;
            const selected_hex_id = selected_hex.id.slice(-2).replace(/^\D+/g, '');
            const length = selected_hex.classList.length;
            const selected_pitch_type = selected_hex.classList[length-1];
            const selected_pitch_id = selected_pitch_type.slice(-2).replace(/^\D+/g, '');

            if (this.checkAction('confirmRequirements')) {
                this.ajaxcall("/firstascent/firstascent/confirmRequirements.html", { lock: true,
                    selected_resources : selected_resources,
                    selected_hex : selected_hex_id,
                    selected_pitch : selected_pitch_id
                }, this, function(result) {} );
            }
        },

        onRiskIt: function(evt) {
            return;
        },

        onShowHideCard: function(evt) {
            dojo.stopEvent(evt);

            climbing_slot = $('climbing_slot');

            if (evt.target.innerHTML === 'Hide card') {
                climbing_slot.style.display = 'none';
                evt.target.innerHTML = 'Show card';
            } else {
                climbing_slot.style.display = 'block';
                evt.target.innerHTML = 'Hide card';
            }
            
        },

        onSelectClimbingCardChoice: function(evt) {
            dojo.stopEvent(evt);

            dojo.query('.selected_choice').forEach((ele) => { ele.classList.remove('selected_choice'); });
            $('confirm_button').classList.add('disabled');
            evt.target.classList.add('selected_choice');
            if ($('requirements_message')) { $('requirements_message').remove(); }

            const choice = dojo.query('.selected_choice')[0].classList[1];
            const idx = choice == 'a' ? 0 : 1;

            this.utils.displayRequirements(...this.choices_info['display_requirements'][idx]);

            if (this.choices_info['no_target_message'][idx]) {
                $('generalactions').lastElementChild.insertAdjacentHTML('afterend', '<span id="requirements_message">No legal targets</span>');
            }

            else if (!this.choices_info['requirements_met'][idx]) {
                $('generalactions').lastElementChild.insertAdjacentHTML('afterend', '<span id="requirements_message">Can\'t fulfill requirements</span>');
            }

            const confirm_button = $('confirm_button');
            if (this.choices_info['requirements_met'][idx]) { confirm_button.classList.remove('disabled'); }
            else if (!this.choices_info['requirements_met'][idx] && !confirm_button.classList.contains('disabled')) { confirm_button.classList.add('disabled'); }
        },

        onConfirmClimbingCardChoice: function(evt) {
            dojo.stopEvent(evt);

            const choice = dojo.query('.selected_choice')[0].classList[1];
            const card_id = dojo.query('.selected_choice')[0].parentElement.id.slice(-3).replace(/^\D+/g, '');
            const card_type = this.gamedatas.climbing_card_identifier[card_id];

            if (this.checkAction('confirmClimbingCardChoice')) {
                this.ajaxcall("/firstascent/firstascent/confirmClimbingCardChoice.html", { lock: true,
                    choice : choice,
                    card_id : card_id,
                    card_type : card_type
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
                const draw_num = dojo.query(`#${draw_box.id} > .tucked_draw_num`)[0];
                const asset_counter = draw_box.parentElement;
                const tucked_num = this.selected_tucked.length;
                if (tucked_num > Number(draw_num.innerHTML) && 
                    Number(draw_num.innerHTML) + 1 + dojo.query('.selected_resource').length <= this.discard_num) {

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
                else if (dojo.query('.selected_resource').length + this.selected_tucked.length < this.discard_num) {
                    asset_ele.classList.add('selected_resource');
                    asset_ele.parentElement.classList.add('selected_resource_wrap');
                }
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
                    if ((type === this.discard_type || !this.discard_type) && !ele.classList.contains('selectable')) {
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
                    const type = ele.parentElement.id.slice(-13, -8).replace(/_/g, '');
                    tucked_card_types += `${type},`;
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
            dojo.query('.selected_opponent').forEach((ele) => { ele.classList.remove('selected_opponent'); });
            selected_button.classList.add('selected_opponent');
            if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
        },

        onConfirmOpponent: function(evt) {
            dojo.stopEvent(evt);

            const opponent_id = dojo.query('.selected_opponent')[0].id;
            if (this.checkAction('confirmSelectedOpponent')) {
                this.ajaxcall("/firstascent/firstascent/confirmSelectedOpponent.html", { lock: true,
                    opponent_id : opponent_id,
                }, this, function(result) {} );
            }
        },

        onSelectPortaledge: function(evt) {
            dojo.stopEvent(evt);

            const rest = this.gamedatas.gamestate.name === 'resting';
            let rest_resources = rest ? this.rest_resources : 0;
            if ($('requirements_message')) { $('requirements_message').remove(); }

            const selected_deck = evt.currentTarget.parentElement;
            const selected_classes = selected_deck.classList;
            const selected_draw_str = selected_classes.item(selected_classes.length - 1);
            let selected_draw_num = Number(selected_draw_str) || 0;
            let currently_selected = 0;

            for (const type of ['portagear', 'portaface', 'portacrack', 'portaslab']) {
                const deck_classes = $(type).classList;
                const deck_draw_str = deck_classes.item(deck_classes.length - 1);
                let deck_draw_num = Number(deck_draw_str) || 0;
                currently_selected += deck_draw_num;
            }

            if (evt.currentTarget.id == `${selected_deck.id}_plus_one`) {
                if (currently_selected == this.portaledge_num || rest_resources === 5) { return; }
                else if (!selected_classes.contains('draw')) {
                    selected_classes.add('draw', '1');
                    dojo.place(`<span id="${selected_deck.id}_draw_num" class="draw_num" style="visibility: visible;">1</span>`, selected_deck);
                } else {
                    selected_classes.remove(selected_draw_str);
                    selected_classes.add(`${selected_draw_num+1}`);
                    $(`${selected_deck.id}_draw_num`).innerHTML = `${selected_draw_num+1}`;
                }

                selected_draw_num ++;
                if (rest) { rest_resources++; }

            } else if (evt.currentTarget.id == `${selected_deck.id}_minus_one`) {
                if (!$(`${selected_deck.id}_draw_num`)) { return; }
                else if (selected_classes.contains('1')) {
                    selected_classes.remove('draw', '1');
                    dojo.destroy(`${selected_deck.id}_draw_num`);
                } else if (selected_classes.contains('draw')) {
                    selected_classes.remove(selected_draw_str);
                    selected_classes.add(`${selected_draw_num-1}`);
                    $(`${selected_deck.id}_draw_num`).innerHTML = `${selected_draw_num-1}`;
                }

                selected_draw_num --;
                if (rest) { rest_resources--; }
            }

            if (rest) { // resting state
                if (rest_resources === 5 && $('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.remove('disabled');
                } else if (rest_resources < 5 && !$('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.add('disabled');
                }

            } else { // selectPortaledge state
                if (currently_selected+1 === this.portaledge_num && $('confirm_button').classList.contains('disabled')) {
                    $('confirm_button').classList.remove('disabled');
                } else if (currently_selected+1 != this.portaledge_num && !$('confirm_button').classList.contains('disabled')) {
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

            if (this.checkAction('confirmPortaledge')) {
                this.ajaxcall("/firstascent/firstascent/confirmPortaledge.html", { lock: true,
                    portaledge_to_draw : portaledge_to_draw,
                }, this, function(result) {} );
            }
        },

        onRestWaterPsych: function(evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget;
            const resources = this.utils.getCurrentPlayerResources(this.getActivePlayerId());
            const water = resources.water;
            const psych = resources.psych;

            const character_num = this.gamedatas.players[this.getActivePlayerId()]['character'];
            const max_num = character_num != 8 ? 6 : 7;     // Phil

            if ($('requirements_message')) { $('requirements_message').remove(); }

            if (button.parentElement.id == 'rest_water') {
                const water_draw_num_ele = $('rest_water_draw_num');
                const water_draw_num = Number($('rest_water_draw_num').innerText);

                if (button.classList.contains('water_minus') && water_draw_num > 0) {
                    water_draw_num_ele.innerHTML = `${water_draw_num-1}`;
                    this.rest_resources--;
                }
                else if (button.classList.contains('water_plus') && this.rest_resources < 5 && (water + water_draw_num + 1) <= max_num) {
                    water_draw_num_ele.innerHTML = `${water_draw_num+1}`;
                    this.rest_resources++;
                }
                else if (button.classList.contains('water_plus') && this.rest_resources < 5 && (water + water_draw_num + 1) > max_num) {
                    $('generalactions').lastElementChild.insertAdjacentHTML('afterend', '<span id="requirements_message"> Can\'t gain any more Water</span>');
                }
            
            } else if (button.parentElement.id == 'rest_psych') {
                const psych_draw_num_ele = $('rest_psych_draw_num');
                const psych_draw_num = Number($('rest_psych_draw_num').innerText);

                if (button.classList.contains('psych_minus') && psych_draw_num > 0) {
                    psych_draw_num_ele.innerHTML = `${psych_draw_num-1}`;
                    this.rest_resources--;
                }
                else if (button.classList.contains('psych_plus') && this.rest_resources < 5 && (psych + psych_draw_num + 1) <= max_num) {
                    psych_draw_num_ele.innerHTML = `${psych_draw_num+1}`;
                    this.rest_resources++;
                }
                else if (button.classList.contains('psych_plus') && this.rest_resources < 5 && (psych + psych_draw_num + 1) > max_num) {
                    $('generalactions').lastElementChild.insertAdjacentHTML('afterend', '<span id="requirements_message"> Can\'t gain any more Psych</span>');
                }
            }

            if (this.rest_resources === 5) { $('confirm_button').classList.remove('disabled'); }
            else if (this.rest_resources < 5 && !$('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.add('disabled'); }
        },

        onSelectAssetType: function(evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget;
            dojo.query('#generalactions .skills_and_techniques').forEach(ele => {
                if (!ele.parentElement.classList.contains('disabled')) { ele.parentElement.style.backgroundColor = '#4871b6'; }
                if (ele.classList.contains('selected_asset_type')) { ele.classList.remove('selected_asset_type'); }
            });
            button.firstElementChild.classList.add('selected_asset_type');
            switch (button.id) {
                case 'gear_button':
                    button.style.backgroundColor = '#dec5a1';
                    break;
                case 'face_button':
                    button.style.backgroundColor = '#b2d77f';
                    break;
                case 'crack_button':
                    button.style.backgroundColor = '#b7a6d0';
                    break;
                case 'slab_button':
                    button.style.backgroundColor = '#f69b8f';
                    break;
            }
            if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
        },

        onConfirmAssetType: async function(evt) {
            dojo.stopEvent(evt);

            this.asset_token_type = dojo.query('.selected_asset_type')[0].parentElement.id.slice(0, -7);
            this.removeActionButtons();
            await this.utils.retractClimbingCard();
            this.utils.updateTitlebar('You must select a Pitch');

            let available_pitches = [];
            dojo.query('.pitch_border').forEach(pitch_border => {
                const pitch_num = pitch_border.nextElementSibling.classList[1];
                const hex_num = pitch_border.id.slice(6, -7);
                if (!['p44', 'p45', 'p46', 'p47', 'p48'].includes(pitch_num)) {
                    pitch_border.classList.add('available_pitch');
                    pitch_border.nextElementSibling.nextElementSibling.classList.add('cursor');
                    available_pitches.push(hex_num);
                }
            });

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
            dojo.query('.selected_resource').forEach(ele => {
                ele.classList.remove('selected_resource');
                ele.parentElement.classList.remove('selected_resource_wrap');
            });
            asset_ele.classList.add('selected_resource');
            asset_ele.parentElement.classList.add('selected_resource_wrap');

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
            if (dojo.query('.selected_resource').length > 0) {
                const selected_resource_ele = dojo.query('.selected_resource')[0];
                selected_resource = selected_resource_ele.id.slice(-3).replace(/^\D+/g, '');
                opponent_id = selected_resource_ele.parentElement.parentElement.parentElement.id.slice(-7);
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
                    opponent_id : opponent_id
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

            const selected_token_ele = dojo.query('.selected_token')[0];
            this.selected_token_id = selected_token_ele.id.slice(-3).replace(/^\D+/g, '');
            const selected_token_type_arg = this.gamedatas.token_identifier[this.selected_token_id];
            const opponent_token_ele = dojo.query('.selectable_token:not(.selected_token)')[0];
            this.opponent_token_id = opponent_token_ele.id.slice(-3).replace(/^\D+/g, '');
            const opponent_token_type_arg = this.gamedatas.token_identifier[this.opponent_token_id];

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
                    dojo.setStyle(`${player.id}`, {
                        "color" : '#fff',
                        "background-color" : `#${player.color}`,
                        "text-shadow" : '-1px 0 black, 0 1px black, 1px 0 black, 0 1px black'
                    });
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
                    ele.parentElement.style.backgroundColor = '#4871b6';
                    ele.classList.remove('selected_technique_type');
                }
            });
            button.firstElementChild.classList.add('selected_technique_type');
            switch (button.id) {
                case 'precision_button':
                    button.style.backgroundColor = '#000000';
                    break;
                case 'balance_button':
                    button.style.backgroundColor = '#ffcb0a';
                    break;
                case 'pain_tolerance_button':
                    button.style.backgroundColor = '#751721';
                    break;
                case 'power_button':
                    button.style.backgroundColor = '#e7e7e8';
                    break;
            }
            if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
        },

        onConfirmTechniqueToken: function (evt) {
            dojo.stopEvent(evt);

            this.technique_token_type = dojo.query('.selected_technique_type')[0].parentElement.id.slice(0, -7);
            this.removeActionButtons();

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

        onSelectPermanentAsset: function (evt) {
            dojo.stopEvent(evt);

            const button = evt.currentTarget;
            const type = button.firstElementChild;

            const character_num = this.gamedatas.players[this.player_id]['character'];
            const character = this.gamedatas.characters[character_num];
            const max_tokens = character.permanent_asset_slots;
            const board_assets = this.gamedatas.board_assets[this.player_id];
            const current_tokens = board_assets['gear']['permanent'] + board_assets['face']['permanent'] + board_assets['crack']['permanent'] + board_assets['slab']['permanent'];
            const currently_selected = dojo.query('.selected_asset_type').length;

            if ($('requirements_message')) { $('requirements_message').remove(); }

            if (type.classList.contains('selected_asset_type')) {
                type.classList.remove('selected_asset_type');
                button.style.backgroundColor = '';
            }
            else if (current_tokens + currently_selected < max_tokens) {
                type.classList.add('selected_asset_type');
                switch (button.id.slice(0, -2)) {
                    case 'gear_button':
                        button.style.backgroundColor = '#dec5a1';
                        break;
                    case 'face_button':
                        button.style.backgroundColor = '#b2d77f';
                        break;
                    case 'crack_button':
                        button.style.backgroundColor = '#b7a6d0';
                        break;
                    case 'slab_button':
                        button.style.backgroundColor = '#f69b8f';
                        break;
                }
            } else if (current_tokens + currently_selected == max_tokens) {
                $('generalactions').lastElementChild.insertAdjacentHTML('afterend', '<span id="requirements_message">No more available slots</span>');
            }
        },

        onConfirmPermanentAssets: function (evt) {
            dojo.stopEvent(evt);

            const player_id = this.player_id;
            let gained_assets_list = [0,0,0,0];
            dojo.query('.selected_asset_type').forEach(ele => {

                const type = ele.id.slice(0, -6);
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

            dojo.subscribe('confirmOpponentRequirements', this, "notif_confirmOpponentRequirements");
            dojo.subscribe('confirmYourRequirements', this, "notif_confirmYourRequirements");
            this.notifqueue.setSynchronous('confirmOpponentRequirements');
            this.notifqueue.setSynchronous('confirmYourRequirements');
            this.notifqueue.setIgnoreNotificationCheck('confirmOpponentRequirements', (notif) => (notif.args.player_id == this.player_id));

            dojo.subscribe('drawClimbingCard', this, "notif_drawClimbingCard");
            this.notifqueue.setSynchronous('drawClimbingCard');

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

            dojo.subscribe('confirmChooseSummitBetaToken', this, "notif_confirmChooseSummitBetaToken");
            this.notifqueue.setSynchronous('confirmChooseSummitBetaToken');

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

            dojo.subscribe('debug', this, "notif_debug");
        },

        notif_debug: function(notif) {

        },

        notif_confirmCharacter: function(notif) {
            const player_id = notif.args.player_id;
            const active_player = this.gamedatas.players[player_id];
            const character_num = notif.args.character_num;
            const character_div = dojo.query(`#${notif.args.character_div}`)[0];
            const character = this.gamedatas.characters[character_num];
            const character_name = character.name;

            this.gamedatas.players[player_id]['character'] = character_num;
            this.gamedatas.player_names_and_colors[player_id]['character'] = character_num;
            this.gamedatas.player_names_and_colors[player_id]['color'] = active_player.color;

            // place character wrappers

            // current player chose character
            if (notif.args.player_id == this.player_id) {
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
                        // -webkit-text-stroke: .5px black;`;
            const name_ref = dojo.query(`#player_name_${player_id}`)[0].firstElementChild;
            name_ref.style.cssText +=
                        `color: #${character_color};`;
                        // -webkit-text-stroke: .5px black;`;
            this.gamedatas.players[player_id].color = character_color;
            dojo.query('.playername').forEach((element) => {
                if (element.innerHTML === active_player.name) {
                    element.style.color = `#${character_color}`;
                }
            })

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
            dojo.place(this.format_block('jstpl_asset_board', {
                    player : player_id,
                    character : character_name,
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), character_div);
            character_div.classList.remove('popout');

            if (character_name == 'young_prodigy') {
                
            }

            if (this.utils.shouldAnimate()) {

                const animateCharacter = async () => {
                    this.utils.updateTitlebar('Placing Character and dealing Personal Objectives');
                    const args = [character_div, character_area];
                    await this.utils.animationPromise(character_div, 'select_character', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    this.notifqueue.setSynchronousDuration();
                }
                animateCharacter();
            } else { 
                character_area.append(character_div);
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_dealPersonalObjectives: function (notif) {

            if (this.isCurrentPlayerActive()) {
                const current_personal_objectives = notif.args.current_personal_objectives;
                const objective_1 = this.gamedatas.personal_objectives[current_personal_objectives[0]];
                const objective_2 = this.gamedatas.personal_objectives[current_personal_objectives[1]];
                const po_coords_1 = objective_1['x_y'];
                const po_coords_2 = objective_2['x_y'];
                dojo.place(
                    `${this.format_block('jstpl_personal_objective', {
                        poId : current_personal_objectives[0],
                        poX : po_coords_1[0],
                        poY : po_coords_1[1],
                    })}
                     ${this.format_block('jstpl_personal_objective', {
                        poId : current_personal_objectives[1],
                        poX : po_coords_2[0],
                        poY : po_coords_2[1],
                     })}`, 'hand_objectives');
            }
        },

        notif_confirmOpponentAssets: async function (notif) {

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

                            args = [deck_asset_div, counter_div, 1];
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

                            args = [spread_div, counter_div, 1];
                            asset_display_to_counter.push(this.utils.animationPromise.bind(null, spread_div, 'asset_display_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args));
                        });

                        this.utils.updateTitlebar('Revealing chosen Assets');
                        Promise.all(asset_deck_to_display.map((func) => { return func(); }))
                        .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                        .then(() => Promise.all(asset_display_to_counter.map((func) => { return func(); })))
                        .then(() => {
                            this.utils.handCount(player_id, notif.args.hand_count);
                            $('asset_deck_draw').style.display = 'none';
                            $('spread_draw').style.display = 'none';
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
                        spread.forEach((ele) => {
                            if (ele.childElementCount === 0) {

                                const new_card = notif.args.spread_assets_arr[i];
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
                            this.utils.updateTitlebar('Refilling Spread');
                            Promise.all(flip_and_move.map((func) => { return func(); }))
                            .then(async () => {
                                cards_to_place.map((card) => {
                                    const card_ele = dojo.place(card[0], card[1]);
                                    const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                                    const card_type = this.gamedatas.asset_identifier[card_id];
                                    this.utils.assetTooltip(card_ele.id, card_type);
                                });
                                if (notif.args.climbing_card) {
                                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                                    const destination = $('climbing_discard');
                                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                                    destination.append(climbing_div);
                                } })
                            .then(() => { resolve(); });
                        } else {
                            cards_to_place.map((card) => {
                                const card_ele = dojo.place(card[0], card[1]);
                                const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                                const card_type = this.gamedatas.asset_identifier[card_id];
                                this.utils.assetTooltip(card_ele.id, card_type);
                            });
                            if (notif.args.climbing_card) {
                                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                                const destination = $('climbing_discard');
                                destination.append(climbing_div);
                            }
                            resolve();
                        }

                    } else { resolve(); }                 
                });
            }
            await refillSpread();

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmYourAssets: async function (notif) {

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

                        this.utils.updateTitlebar('Revealing chosen Assets');
                        Promise.all(asset_deck_to_display.map((func) => { return func(); }))
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
                            return Promise.all(asset_display_to_hand.map((func) => { return func(); }));
                        })
                        .then(() => {
                            $('asset_deck_draw').style.display = 'none';
                            $('spread_draw').style.display = 'none';
                            dojo.query('.hand_asset_wrap .asset').forEach((ele) => { ele.classList.remove('spread_asset', 'cursor'); })
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
                        spread.forEach((ele) => {
                            if (ele.childElementCount === 0) {

                                const new_card = notif.args.spread_assets_arr[i];
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
                            this.utils.updateTitlebar('Refilling Spread');
                            Promise.all(flip_and_move.map((func) => { return func(); }))
                            .then(async () => {
                                cards_to_place.map((card) => {
                                    const card_ele = dojo.place(card[0], card[1]);
                                    const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                                    const card_type = this.gamedatas.asset_identifier[card_id];
                                    this.utils.assetTooltip(card_ele.id, card_type);
                                });
                                if (notif.args.climbing_card) {
                                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                                    const destination = $('climbing_discard');
                                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                                    destination.append(climbing_div);
                                } })
                            .then(() => { resolve(); });
                        } else {
                            cards_to_place.map((card) => {
                                const card_ele = dojo.place(card[0], card[1]);
                                const card_id = card_ele.id.slice(-3).replace(/^\D+/g, '');
                                const card_type = this.gamedatas.asset_identifier[card_id];
                                this.utils.assetTooltip(card_ele.id, card_type);
                            })
                            if (notif.args.climbing_card) {
                                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                                const destination = $('climbing_discard');
                                destination.append(climbing_div);
                            }
                            resolve();
                        }

                    } else { resolve(); }                 
                });
            }
            await refillSpread();

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmOpponentRequirements: async function (notif) {

            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];

            this.utils.sanitizeAssetBoards();

            const playAssets = async () => {

                return new Promise(async (resolve) => {

                    let cards_for_playing = [];
                    const asset_board_slots = {};
                    let slots = {...this.board_slots};
                    let vacate_slots = {...this.board_slots};
                    let previous_slots = [];
                    const selected_resources = notif.args.selected_resources;
                    for (const type of ['gear', 'face', 'crack', 'slab']) {
                        previous_slots[type] = this.utils.countAssetBoardColumn(player_id, type);
                    }

                    let new_count = {'gear': 0, 'face': 0, 'crack': 0, 'slab': 0};
                    for (let i=0; i<=selected_resources.length-1; i++) {
                        const id = selected_resources[i];
                        const type_arg = this.gamedatas.asset_identifier[id];
                        const type = this.utils.getAssetType(type_arg);
                        new_count[type]++;
                    }

                    for (let i=0; i<=selected_resources.length-1; i++) {
                        const id = selected_resources[i];
                        const type_arg = this.gamedatas.asset_identifier[id];
                        const asset = this.gamedatas.asset_cards[type_arg];
                        const type = this.utils.getAssetType(type_arg);
                        slots[type]++;
                        const slot_num = dojo.query(`#${character.name}_${type} .asset`).length + slots[type];

                        if (slot_num <= 4) {
                            asset_board_slots[id] = $(`${character.name}_${type}_${slot_num}`);
                            this.gamedatas.board_assets[player_id][type][slot_num][id] = type_arg;
                            this.gamedatas.board_assets[player_id][type]['flipped'][slot_num] = false;
                            this.gamedatas.board_assets[player_id][type]['count']++;
                        }
                        else if (slot_num > 4) {

                            const new_slot_num = slot_num - new_count[type];
                            asset_board_slots[id] = $(`${character.name}_${type}_${new_slot_num}`);

                            this.gamedatas.board_assets[player_id][type][new_slot_num][id] = type_arg;
                            this.gamedatas.board_assets[player_id][type]['flipped'][new_slot_num] = false;
                            this.gamedatas.board_assets[player_id][type]['count']++;
                            vacate_slots[type]++;
                        }

                        cards_for_playing.push([this.format_block('jstpl_asset_card', {
                                                    CARD_ID : id,
                                                    EXTRA_CLASSES : 'played_asset',
                                                    acX : asset.x_y[0],
                                                    acY : asset.x_y[1],
                                                }), id]);
                    }

                    if (this.utils.shouldAnimate()) {

                        $('asset_deck_draw').style.display = 'flex';
                        for (let i=1; i<=cards_for_playing.length; i++) {
                            const card = cards_for_playing[i-1];
                            const card_ele = dojo.place(card[0], `hand_counter_${player_id}`);
                        }

                        const asset_counter_to_display = [];
                        const asset_display_to_board = [];
                        let i = 1;
                        for (const card of $(`hand_counter_${player_id}`).children) {
                            const deck_draw_slot = $(`deck_draw_${i}`);
                            let args = [card, deck_draw_slot];
                            asset_counter_to_display.push(this.utils.animationPromise.bind(null, card, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            i++;
                        }

                        this.utils.updateTitlebar('Revealing played assets');
                        Promise.all(asset_counter_to_display.map((func) => { return func(); }))
                        .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                        .then(() => {
                            const assets = dojo.query('#asset_deck_draw .asset');
                            for (let i=0; i<=assets.length-1; i++) {
                                const ele = assets[i];
                                const id = ele.id.slice(-3).replace(/^\D+/g, '');
                                const slot = asset_board_slots[id];
                                let args = [ele, slot];
                                ele.style.setProperty('--z', `${-i-1}`);
                                asset_display_to_board.push(this.utils.animationPromise.bind(null, ele, 'asset_display_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }
                        })
                        .then(async () => {
                            // check for slots to vacate and animate them to the tucked cards counter
                            await this.utils.vacateAssetSlots(vacate_slots, character, player_id);
                        })
                        .then(() => { this.utils.updateTitlebar('Placing played Assets on Asset Board'); })
                        .then(() => Promise.all(asset_display_to_board.map((func) => { return func(); })))
                        .then(() => { resolve(); });
                        
                    } else { // shouldn't animate

                        let vacate_slots = {...this.board_slots};
                        for (const [id, slot] of Object.entries(asset_board_slots)) {
                            const type_arg = this.gamedatas.asset_identifier[id];
                            const type = this.utils.getAssetType(type_arg);
                            if (slot.firstElementChild) { vacate_slots[type]++; }
                        }
                        this.utils.vacateAssetSlots(vacate_slots, character, player_id);

                        cards_for_playing.map((card) => {
                            const id = card[1];
                            dojo.place(card[0], asset_board_slots[id]);
                        });
                        resolve();
                    }
                });
            }
            await playAssets();

            this.utils.updateBoardAssets(player_id);
            this.utils.handCount(player_id, notif.args.hand_count);

            await this.utils.notif_confirmRequirements(notif);

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmYourRequirements: async function (notif) {

            this.selected_pitch = dojo.query(`.p${notif.args.selected_pitch}`)[0];
            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];

            dojo.query('.available_pitch').forEach((ele) => {
                ele.classList.remove('available_pitch');
                ele.nextElementSibling.nextElementSibling.classList.remove('cursor');
            });
            dojo.query('.selected_pitch')[0].nextElementSibling.nextElementSibling.classList.remove('cursor');
            dojo.query('.selected_pitch')[0].classList.remove('selected_pitch');

            this.utils.sanitizeAssetBoards();

            const playAssets = async () => {

                return new Promise(async (resolve) => {

                    let cards_for_playing = [];
                    const asset_board_slots = {};
                    let slots = {...this.board_slots};
                    let vacate_slots = {...this.board_slots};
                    let previous_slots = [];
                    const selected_resources = notif.args.selected_resources;
                    for (const type of ['gear', 'face', 'crack', 'slab']) {
                        previous_slots[type] = this.utils.countAssetBoardColumn(player_id, type);
                    }

                    let new_count = {'gear': 0, 'face': 0, 'crack': 0, 'slab': 0};
                    for (let i=0; i<=selected_resources.length-1; i++) {
                        const id = selected_resources[i];
                        const type_arg = this.gamedatas.asset_identifier[id];
                        const type = this.utils.getAssetType(type_arg);
                        new_count[type]++;
                    }

                    for (let i=0; i<=selected_resources.length-1; i++) {
                        const id = selected_resources[i];
                        const type_arg = this.gamedatas.asset_identifier[id];
                        const asset = this.gamedatas.asset_cards[type_arg];
                        const type = this.utils.getAssetType(type_arg);
                        slots[type]++;
                        delete this.gamedatas.hand_assets[id];
                        const slot_num = dojo.query(`#${character.name}_${type} .asset`).length + slots[type];

                        if (slot_num <= 4) {

                            asset_board_slots[id] = $(`${character.name}_${type}_${slot_num}`);
                            this.gamedatas.board_assets[player_id][type][slot_num][id] = type_arg;
                            this.gamedatas.board_assets[player_id][type]['flipped'][slot_num] = false;
                            this.gamedatas.board_assets[player_id][type]['count']++;
                            this.gamedatas.resource_tracker['asset_board']['skills'][type]++;
                        }

                        else if (slot_num > 4) {

                            const new_slot_num = slot_num - new_count[type];
                            asset_board_slots[id] = $(`${character.name}_${type}_${new_slot_num}`);

                            this.gamedatas.board_assets[player_id][type][new_slot_num][id] = type_arg;
                            this.gamedatas.board_assets[player_id][type]['flipped'][new_slot_num] = false;
                            this.gamedatas.board_assets[player_id][type]['count']++;
                            this.gamedatas.resource_tracker['asset_board']['skills'][type]++;
                            vacate_slots[type]++;
                        }
                    }

                    if (this.utils.shouldAnimate()) {

                        const asset_hand_to_board = [];
                        const assets = dojo.query('.selected_resource');
                        for (let i=0; i<=assets.length-1; i++) {
                            const ele = assets[i];
                            const id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const slot = asset_board_slots[id];
                            const slot_num = Number(slot.id.slice(-1)) + 2;
                            ele.parentElement.style.zIndex = String(slot_num);
                            let args = [ele, slot];
                            ele.style.setProperty('--z', `${i+1+10}`);
                            ele.classList.remove('selected_resource');
                            ele.parentElement.classList.remove('selected_resource_wrap');
                            ele.classList.add('played_asset');
                            asset_hand_to_board.push(this.utils.animationPromise.bind(null, ele, 'asset_hand_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                        }

                        dojo.query('.selectable').forEach(ele => { ele.classList.remove('selectable'); });
                        this.utils.updateTitlebar('Placing played Assets on Asset Board');

                        await this.utils.vacateAssetSlots(vacate_slots, character, player_id);

                        Promise.all(asset_hand_to_board.map((func) => { return func(); }))
                        .then(() => {
                            this.utils.resizeHand();
                            resolve(); 
                        });
                        
                    } else { // shouldn't animate
                        this.utils.sanitizeAssetBoards();
                        let vacate_slots = {...this.board_slots};
                        for (const [id, slot] of Object.entries(asset_board_slots)) {
                            const type_arg = this.gamedatas.asset_identifier[id];
                            const type = this.utils.getAssetType(type_arg);
                            if (slot.firstElementChild) { vacate_slots[type]++; }
                        }
                        this.utils.vacateAssetSlots(vacate_slots, character, player_id);

                        dojo.query('.selected_resource').forEach((ele) => {
                            ele.classList.remove('selected_resource');
                            ele.classList.add('played_asset');
                            const id = ele.id.slice(-3).replace(/^\D+/g, '');
                            const slot = asset_board_slots[id];
                            dojo.place(ele, slot);
                        });
                        this.utils.resizeHand();
                        resolve();
                    }
                });
            }
            await playAssets();
            
            this.utils.updateBoardAssets(player_id);
            this.utils.updatePlayerResources(player_id, notif.args.player_resources);
            this.utils.handCount(player_id, notif.args.hand_count);

            await this.utils.notif_confirmRequirements(notif);

            this.notifqueue.setSynchronousDuration();
        },

        notif_drawClimbingCard: async function(notif) {
            this.utils.updateTitlebar(_('Drawing Climbing Card'));
            this.removeActionButtons();
            $('climbing_slot').style.display = 'block';

            climbing_card_info = notif.args.climbing_card_info;
            climbing_card = this.gamedatas.climbing_cards[climbing_card_info.type_arg];
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
                    const y_diff = end_pos.top - start_pos.top;
                    dojo.setStyle(climbing_card_div.id, {
                        'top' : `-${y_diff}px`,
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
                    $('climbing_slot').classList.add('dim_bg');

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
                $('climbing_slot').classList.add('dim_bg');

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

        notif_passedClimbingCard: async function(notif) {

            await this.utils.retractClimbingCard();
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard');

            if (this.utils.shouldAnimate()) {
                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                destination.append(climbing_div);
            
            } else { // shouldn't animate

                destination.append(climbing_div);
            }
            $('pass_message').remove();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmClimbingChoiceOpponent: async function(notif) {

            await this.utils.retractClimbingCard();

            await this.utils.parseClimbingEffect('cost', notif);
            await this.utils.parseClimbingEffect('benefit', notif);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard');

            if (this.utils.shouldAnimate() && notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) {
                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
            }
            if (notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) { destination.append(climbing_div); }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmClimbingChoice: async function (notif) {

            await this.utils.retractClimbingCard();

            await this.utils.parseClimbingEffect('cost', notif);
            await this.utils.parseClimbingEffect('benefit', notif);

            dojo.query('#climbing_discard .cursor').forEach((ele) => { ele.classList.remove('cursor'); });
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard');

            if (this.utils.shouldAnimate() && notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) {
                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
            }
            if (notif.args.gain_symbol_token == false && notif.args.gain_summit_beta_token == false) { destination.append(climbing_div); }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmAssetsForDiscardPrivate: async function (notif) {
            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];               // CHECK SHOULDN'T ANIMATES FOR ALL 3 CONDITIONS WHEN AT LEAST ONE CARD IS FACE-DOWN
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const opponent = notif.args.opponent ? notif.args.opponent : null;
            const opponent_name = notif.args.opponent_name;
            const opponent_color = notif.args.opponent_color;
            const discard_pile = $('asset_discard');
            const hand_card_ids = notif.args.hand_card_ids;
            const board_card_ids = notif.args.board_card_ids;
            const tucked_card_ids = notif.args.tucked_card_ids;
            const all_card_ids = hand_card_ids.concat(board_card_ids, tucked_card_ids);
            const board_assets = this.gamedatas.board_assets;
            dojo.query('.cursor').forEach((ele) => { ele.classList.remove('cursor', 'selectable', 'selected_resource'); });

            for (const asset_id of board_card_ids) {
                const type_arg = this.gamedatas.asset_identifier[asset_id];
                const type = this.utils.getAssetType(type_arg);
                const slot_num = dojo.query(`#asset_card_${asset_id}`)[0].parentElement.id.slice(-1);
                delete this.gamedatas.board_assets[player_id][type][slot_num][asset_id];
                this.gamedatas.board_assets[player_id][type]['count']--;
            }

            for (const asset_id of tucked_card_ids) {
                const type_arg = this.gamedatas.asset_identifier[asset_id];
                const type = this.utils.getAssetType(type_arg);
                delete this.gamedatas.board_assets[player_id][type]['tucked'][asset_id];
                this.gamedatas.board_assets[player_id][type]['count']--;
            }

            let asset_anims = [];

            await (async () => {

                return new Promise(async (resolve) => {
                    if (player_id == this.player_id) {

                        //********
                        if (!opponent) {

                            if (this.utils.shouldAnimate()) {

                                for (const asset_id of hand_card_ids) {
                                    const asset_ele = $(`asset_card_${asset_id}`);
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
                                    const args = [asset_ele, discard_pile, 3];

                                    if (board_assets[player_id][type]['flipped'][old_board_slot_num] === true) {

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

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_board_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
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
                                    const args = [asset_ele, discard_pile, 3];

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_discard', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                this.utils.updateTitlebar('Discarding asset/s');
                                Promise.all(asset_anims.map((func) => { return func(); })).then(() => {
                                    if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); }
                                    for (let i=0; i<=old_board_zs.length-1; i++) {
                                        const slot = old_board_zs[i][0];
                                        const z = old_board_zs[i][1];
                                        slot.style.zIndex = z;
                                    }
                                    resolve();
                                });

                            } else { // shouldn't animate
                                all_card_ids.map(id => {            // DOESN'T LOWER NUMBERS FOR TUCKED -NEED TO KILL TUCKED_DRAW_BOXES IN ONLEAVINGSTATE FOR THIS AND OTHER RELEVENT STATES
                                    const card = $(`asset_card_${id}`);
                                    if (id === all_card_ids[all_card_ids.length-1]) { discard_pile.append(card); }
                                    else { card.remove(); }
                                });
                                if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); }
                                resolve();
                            }

                        // ********
                        } else { // give to opponent instead of discard to pile

                            if (this.utils.shouldAnimate()) {
                                for (const asset_id of hand_card_ids) {
                                    const asset_ele = $(`asset_card_${asset_id}`);
                                    const args = [asset_ele, $(`hand_counter_${opponent}`)];

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
                                    if (board_assets[player_id][type]['flipped'][old_board_slot_num] === true) {

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
                                    const asset_ele = dojo.place(this.format_block('jstple_asset_card', {
                                        CARD_ID : asset_id,
                                        acX : asset['x_y'][0],
                                        acY : asset['x_y'][1],
                                    }), asset_counter_img);
                                    const args = [asset_ele, $(`hand_counter_${opponent}`)];

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_counter', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                this.utils.updateTitlebar('Giving asset/s to ');
                                const opponent_name_span = document.createElement('span');
                                opponent_name_span.id = `${opponent_name}_span`;
                                opponent_name_span.innerHTML = opponent_name;
                                opponent_name_span.style.color = opponent_color;
                                $('gameaction_status').parentElement.append(opponent_name_span);

                                Promise.all(asset_anims.map((func) => { return func(); }))
                                .then(() => {
                                    dojo.query('.hand_counter .asset').forEach(ele => { ele.remove(); });
                                    if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); }
                                })
                                .then(async () => {
                                    opponent_name_span.remove();
                                    if (notif.args.climbing_card_info['give_psych']) {
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
                                    resolve();
                                });

                            } else { // shouldn't animate
                                all_card_ids.map(id => {
                                    const card = $(`asset_card_${id}`);
                                    card.remove();
                                });
                                if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); }
                                if (notif.args.climbing_card_info['give_psych']) {
                                    this.utils.updateWaterPsych(player_id, 0, -1);
                                    this.utils.updateWaterPsych(opponent, 0, 1);
                                }
                                resolve();
                            }
                        } 

                    // ********
                    } else { // is asset recipient instead of sender

                        const new_card_slots = this.utils.resizeHand('asset', all_card_ids);
                        if (this.utils.shouldAnimate()) {
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
                                const args = [asset_ele, deck_draw_slot];
                                i++;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }

                            let old_board_zs = [];
                            for (const asset_id of board_card_ids) {

                                const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                const asset = this.gamedatas.asset_cards[asset_type_arg];
                                const type = this.utils.getAssetType(asset_type_arg);
                                this.gamedatas.hand_assets[asset_id] = asset_type_arg;

                                const asset_ele = $(`asset_card_${asset_id}`);

                                const old_board_slot = asset_ele.parentElement;
                                const old_z = old_board_slot.style.zIndex;
                                old_board_zs.push([old_board_slot, old_z]);
                                old_board_slot.style.zIndex = '10';
                                const old_board_slot_num = asset_ele.parentElement.id.slice(-1);

                                if (board_assets[player_id][type]['flipped'][old_board_slot_num] === true) {

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
                                const deck_draw_slot = $(`deck_draw_${i}`);
                                const args = [asset_ele, deck_draw_slot];
                                i++;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }

                            this.utils.updateTitlebar('Giving asset/s to ');
                            const opponent_name_span = document.createElement('span');
                            opponent_name_span.id = `${opponent_name}_span`;
                            opponent_name_span.innerHTML = opponent_name;
                            opponent_name_span.style.color = opponent_color;
                            $('gameaction_status').parentElement.append(opponent_name_span);


                            Promise.all(asset_anims.map((func) => { return func(); }))
                            .then(() => {
                                if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); }
                            })
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
                                $('asset_deck_draw').style.display = 'none';
                                $(`${opponent_name}_span`).remove();
                                if (notif.args.climbing_card_info['give_psych']) {
                                    this.utils.updateWaterPsych(player_id, 0, -1)
                                    await this.utils.updateWaterPsych(opponent, 0, 1);
                                }
                                for (let i=0; i<=old_board_zs.length-1; i++) {
                                    const slot = old_board_zs[i][0];
                                    const z = old_board_zs[i][1];
                                    slot.style.zIndex = z;
                                }
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
                            if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); }
                            if (notif.args.climbing_card_info['give_psych']) {
                                this.utils.updateWaterPsych(player_id, 0, -1)
                                this.utils.updateWaterPsych(opponent, 0, 1);
                            }
                            resolve();
                        }
                    }
                });
            })();

            this.utils.resizeHand();

            await (async () => {
                if (Object.keys(notif.args.climbing_card_info).length > 0) {

                    const water = notif.args.climbing_card_info['water_psych_for_climbing']['water'];
                    const psych = notif.args.climbing_card_info['water_psych_for_climbing']['psych'];
                    await this.utils.updateWaterPsych(player_id, water, psych);

                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');

                    const climbing_card_info = notif.args.climbing_card_info;
                    if (climbing_card_info.final_state === 'discardAssets' && !['3', '7', '8', '12', '13', '14', '21', '23', '26', '27', '28', '31', '46', '48', '57'].includes(climbing_card_info.type_arg)) {
                        if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                        destination.append(climbing_div);
                    }
                }
            })();

            if (player_id == this.player_id) { this.utils.updatePlayerResources(player_id, notif.args.player_resources); }
            this.utils.handCount(player_id, notif.args.player_hand_count);
            if (opponent == this.player_id) {
                this.utils.updatePlayerResources(opponent, notif.args.opponent_resources);
                for (let id of all_card_ids) {
                    const type_arg = this.gamedatas.asset_identifier[id];
                    this.gamedatas.hand_assets[id] = type_arg;
                }
            }
            if (opponent) { this.utils.handCount(opponent, notif.args.opponent_hand_count); }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmAssetsForDiscardPublic: async function (notif) {

            const player_id = notif.args.player_id;
            const opponent = notif.args.opponent ? notif.args.opponent : null;
            const opponent_name = notif.args.opponent_name;
            const discard_pile = $('asset_discard');
            const hand_card_ids_for_public = notif.args.hand_card_ids_for_public;
            const board_card_ids = notif.args.board_card_ids;
            const tucked_card_ids = notif.args.tucked_card_ids;
            const all_card_ids = hand_card_ids_for_public.concat(board_card_ids, tucked_card_ids);

            for (const asset_id of board_card_ids) {
                const type_arg = this.gamedatas.asset_identifier[asset_id];
                const type = this.utils.getAssetType(type_arg);
                const slot_num = dojo.query(`#asset_card_${asset_id}`)[0].parentElement.id.slice(-1);
                delete this.gamedatas.board_assets[player_id][type][slot_num][asset_id];
            }

            for (const asset_id of tucked_card_ids) {
                const type_arg = this.gamedatas.asset_identifier[asset_id];
                const type = this.utils.getAssetType(type_arg);
                delete this.gamedatas.board_assets[player_id][type]['tucked'][asset_id];
                this.gamedatas.board_assets[player_id][type]['count']--;
            }

            let asset_anims = [];

            await (async () => {

                return new Promise(async (resolve) => {
                    if (!opponent) {
                        if (this.utils.shouldAnimate()) {
                            $('asset_deck_draw').style.display = 'flex';
                            let i = 1;
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
                                const args = [asset_ele, deck_draw_slot];
                                i++;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }
                            
                            for (const asset_id of board_card_ids) {
                                const asset_type_arg = this.gamedatas.asset_identifier[asset_id];
                                const asset = this.gamedatas.asset_cards[asset_type_arg];
                                const asset_ele = $(`asset_card_${asset_id}`);
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
                                const deck_draw_slot = $(`deck_draw_${i}`);
                                const args = [asset_ele, deck_draw_slot];
                                i++;

                                asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                            }

                            this.utils.updateTitlebar('Discarding asset/s');
                            Promise.all(asset_anims.map((func) => { return func(); }))
                            .then(() => { if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); } })
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
                                $('asset_deck_draw').style.display = 'none';
                                resolve();
                            });
                        } else { // shouldn't animate

                            if (board_card_ids.length > 0) {
                                board_card_ids.map(id => { $(`asset_card_${id}`).remove(); });
                                this.utils.repositionAssetBoard(player_id);
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
                            if (board_card_ids.length + tucked_card_ids.length > 0) { this.utils.repositionAssetBoard(player_id); }
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
                                        if (notif.args.climbing_card_info['give_psych']) {
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
                                    const asset_ele = $(`asset_card_${asset_id}`);
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
                                    const deck_draw_slot = $(`deck_draw_${i}`);
                                    const args = [asset_ele, deck_draw_slot];
                                    i++;

                                    asset_anims.push(this.utils.animationPromise.bind(null, asset_ele, 'asset_tucked_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args));
                                }

                                if (board_card_ids.length + tucked_card_ids.length > 0) {
                                    $('asset_deck_draw').style.display = 'flex';
                                    Promise.all(asset_anims.map(func => { return func(); }))
                                    .then(() => { this.utils.repositionAssetBoard(player_id); })
                                    .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                                    .then(() => {
                                        let asset_display_to_counter = [];
                                        const hand_counter = $(`hand_counter_${opponent}`);
                                        for (let id of board_card_ids.concat(tucked_card_ids)) {
                                            const card = $(`asset_card_${id}`);

                                            const args = [card, hand_counter, 1];
                                            asset_display_to_counter.push(this.utils.animationPromise.bind(null, card, 'asset_display_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args));
                                        }
                                        return Promise.all(asset_display_to_counter.map(func => { return func(); }));
                                    })
                                    .then(async () => {
                                        console.log('starting last board_cards then');
                                        $('asset_deck_draw').style.display = 'none';
                                        this.utils.handCount(player_id, notif.args.player_hand_count);
                                        this.utils.handCount(opponent, notif.args.opponent_hand_count);
                                        if (notif.args.climbing_card_info['give_psych']) {
                                            this.utils.updateWaterPsych(player_id, 0, -1)
                                            await this.utils.updateWaterPsych(opponent, 0, 1);
                                        }
                                        resolve();
                                    })
                                }
                            }

                            else { // shouldn't animate
                                if (notif.args.climbing_card_info['give_psych']) {
                                    this.utils.updateWaterPsych(player_id, 0, -1)
                                    this.utils.updateWaterPsych(opponent, 0, 1);
                                }
                                if (board_card_ids.length + tucked_card_ids > 0) {
                                    board_card_ids.map(id => { $(`asset_card_${id}`).remove(); });
                                    this.utils.repositionAssetBoard(player_id);
                                }
                                resolve();
                            }
                        })();
                    }
                });
            })();

            // resolve any water/psych benefits from the climbing card
            await (async () => {
                return new Promise(async (resolve) => {
                    if (notif.args.climbing_card_info != null) {
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
                if (climbing_card_info.final_state === 'discardAssets' && !['3', '7', '8', '12', '14', '21', '23', '26', '27', '28', '31', '46', '48', '57'].includes(climbing_card_info.type_arg)) {
                    const climbing_div = $('climbing_discard_straightened').firstElementChild;
                    const destination = $('climbing_discard');
                    if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                    destination.append(climbing_div);
                }
            })();
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSummitBetaOpponent: async function (notif) {

            const card_destination = $('climbing_discard');
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;

            this.utils.updateTitlebar('Drawing Summit Beta Token');

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
                }
            }
            else { // shouldn't animate
                if (climbing_div) { card_destination.append(climbing_div); }
            }
            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSummitBeta: async function (notif) {

            const new_token_slot = this.utils.resizeHand('token');
            const summit_beta_from_db = notif.args.summit_beta_token;
            const summit_beta_token = this.gamedatas.summit_beta_tokens[summit_beta_from_db.type_arg];
            const bg_pos = summit_beta_token['x_y'];
            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const card_destination = $('climbing_discard');

            this.utils.updateTitlebar('Drawing Summit Beta Token');

            if (this.utils.shouldAnimate()) {
                const summit_flip = dojo.place(this.format_block('jstpl_flip_card', {
                    card_id : summit_beta_from_db.id,
                    extra_classes : '',
                    back_type : 'summit_beta summit_back_for_flip',
                    front_type : 'summit_beta',
                    cX : bg_pos[0],
                    cY : bg_pos[1],
                }), 'summit_pile');
                $('summit_pile').style.zIndex = '201';

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
                }
            }
            else { // shouldn't animate
                dojo.place(this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : summit_beta_from_db.id,
                    sbX : bg_pos[0],
                    sbY : bg_pos[1],
                }), new_token_slot);
                if (climbing_div) { card_destination.append(climbing_div); }
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSymbolToken: async function (notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            const symbol_for_log = notif.args.symbol_for_log;
            const symbol_type = notif.args.symbol_type;
            const new_token_id = dojo.query('#assets_wrap .symbol_token').length + 1;
            const new_token_slot = this.utils.resizeHand('token');
            const player_id = notif.args.player_id;
            const player_resources = notif.args.player_resources;

            if (this.utils.shouldAnimate()) {
                this.utils.updateTitlebar(`Taking ${symbol_for_log} Token`);
                const symbol_token = dojo.place(`<div id="${symbol_type}_token_${new_token_id}" class="${symbol_type}_token symbol_token"></div>`, 'board', 2);
                await this.utils.animationPromise(symbol_token, 'token_appears', 'anim', null, false, false);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1200)) })();

                const args = [symbol_token, new_token_slot];
                symbol_token.classList.remove('token_appears');
                await this.utils.animationPromise(symbol_token, 'token_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
            
            } else { // shouldn't animate
                dojo.place(`<div id="${symbol_type}_token_${new_token_id}" class="${symbol_type}_token symbol_token"></div>`, new_token_slot);
            }

            this.utils.updatePlayerResources(player_id, player_resources);
            if ($('climbing_discard_straightened').firstElementChild && !['24'].includes(notif.args.climbing_card_type_arg)) {
                const climbing_div = $('climbing_discard_straightened').firstElementChild;
                if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                $('climbing_discard').append(climbing_div);
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmSymbolTokenOpponent: async function (notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            const symbol_for_log = notif.args.symbol_for_log;
            const symbol_type = notif.args.symbol_type;
            const player_id = notif.args.player_id;

            if (this.utils.shouldAnimate()) {
                this.utils.updateTitlebar(`Taking ${symbol_for_log} Token`);
                const symbol_token = dojo.place(`<div id="${symbol_type}_token" class="${symbol_type}_token symbol_token"></div>`, 'board', 2);
                await this.utils.animationPromise(symbol_token, 'token_appears', 'anim', null, false, false);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1500)) })();

                const args = [symbol_token, $(`hand_counter_${player_id}`)];
                symbol_token.classList.remove('token_appears');
                await this.utils.animationPromise(symbol_token, 'token_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
            }

            if ($('climbing_discard_straightened').firstElementChild && !['24'].includes(notif.args.climbing_card_type_arg)) {
                const climbing_div = $('climbing_discard_straightened').firstElementChild;
                if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                $('climbing_discard').append(climbing_div);
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_automaticPortaledgeOpponent: async function (notif) {

            await this.utils.parseClimbingEffect('autoPortaledge', notif);
            if ($('climbing_discard_straightened').firstElementChild) {
                const climbing_div = $('climbing_discard_straightened').firstElementChild;
                if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                $('climbing_discard').append(climbing_div);
            }
            this.notifqueue.setSynchronousDuration();
        },
        
        notif_automaticPortaledge: async function (notif) {

            await this.utils.parseClimbingEffect('autoPortaledge', notif);
            if ($('climbing_discard_straightened').firstElementChild) {
                const climbing_div = $('climbing_discard_straightened').firstElementChild;
                if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
                $('climbing_discard').append(climbing_div);
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

            await this.utils.portaledgeOpponent(player_id, asset_types, false, hand_count, climbing_card_info, false, water, psych, last_card, refill_portaledge);

            this.utils.updatePlayerResources(player_id, notif.args.player_water_psych);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard');
            if (climbing_div) {

                if (this.utils.shouldAnimate() && !climbing_card_info.hasOwnProperty('portaledge_all')) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else if (this.utils.shouldAnimate() && climbing_card_info.hasOwnProperty('portaledge_all')
                        && climbing_card_info.finished_portaledge.length+1 == Object.keys(this.gamedatas.players).length) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else { // shouldn't animate
                    destination.append(climbing_div);
                }
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

            await this.utils.portaledge(player_id, asset_type_args, asset_ids, false, hand_count, climbing_card_info, false, water, psych, last_card, refill_portaledge);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard');
            if (climbing_div) {

                if (this.utils.shouldAnimate() && !climbing_card_info.hasOwnProperty('portaledge_all')) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else if (this.utils.shouldAnimate() && climbing_card_info.hasOwnProperty('portaledge_all')
                        && climbing_card_info.finished_portaledge.length+1 == Object.keys(this.gamedatas.players).length) {
                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else { // shouldn't animate
                    destination.append(climbing_div);
                }
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

            if (notif.args.player_id != this.player_id) { await this.utils.retractClimbingCard(); }

            if (this.utils.shouldAnimate()) {
                this.utils.updateTitlebar('Placing Asset Token on Pitch');
                const asset_token = dojo.place(`<div class="${asset_type}_token symbol_token"></div>`, 'board', 2);
                await this.utils.animationPromise(asset_token, 'token_appears', 'anim', null, false, false);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1500)) })();

                const args = [asset_token, wrapper];
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
            const tokens = pitch_ele.children;
            this.utils.pitchTooltip(pitch_click, pitch_type, tokens);

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const destination = $('climbing_discard');

            if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
            destination.append(climbing_div);

            this.notifqueue.setSynchronousDuration();
        },

        notif_rollDie: async function (notif) {

            if (this.utils.shouldAnimate()) {
                if (Object.keys(notif.args.climbing_card_info).length > 0) { await this.utils.retractClimbingCard(); }

                const risk_die = $('risk_die');
                const die_wrapper = risk_die.parentElement;
                const face_rolled = notif.args.face_rolled;

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
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1500)) })();
                await this.utils.animationPromise(die_wrapper, 'remove_die', 'anim', null, false, true);
                die_face.remove();
                die_wrapper.style.display = 'none';
                die_wrapper.classList.remove('roll_die_wrapper');
                this.notifqueue.setSynchronousDuration();
            }
            else { this.notifqueue.setSynchronousDuration(); }
        },

        notif_sunnyPitch: async function (notif) {

            this.utils.updateTitlebar('');
            this.removeActionButtons();
            await this.utils.retractClimbingCard();

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
            const destination = $('climbing_discard');

            if (this.utils.shouldAnimate()) { await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true); }
            destination.append(climbing_div);

            this.notifqueue.setSynchronousDuration();
        },

        notif_shareEffectPrivate: async function (notif) {

            const player_id = notif.args.player_id;
            const opponent_id = notif.args.opponent_id;

            if (notif.args.climbing_card_type_arg == '49') {

                const last_card = notif.args.last_card;
                const refill_portaledge = notif.args.refill_portaledge;

                this.utils.updateWaterPsych(player_id, 0, -1);
                await this.utils.updateWaterPsych(opponent_id, 0, -1);

                const type_arg = notif.args.portaledge_type_arg;
                const id = notif.args.portaledge_id;
                const hand_count_player = notif.args.hand_count_player;
                const hand_count_opponent = notif.args.hand_count_opponent;

                if (player_id == this.player_id) {
                    this.utils.portaledgeOpponent(opponent_id, {['gear']: 1}, true, hand_count_opponent, null, true, 0, 0, last_card, refill_portaledge);
                    await this.utils.portaledge(player_id, [type_arg], [id], true, hand_count_player, null, true, 0, 0, last_card, refill_portaledge);
                } else if (opponent_id == this.player_id) {
                    this.utils.portaledgeOpponent(player_id, {['gear']: 1}, true, hand_count_player, null, true, 0, 0, last_card, refill_portaledge);
                    await this.utils.portaledge(opponent_id, [type_arg], [id], true, hand_count_opponent, null, true, 0, 0, last_card, refill_portaledge);
                }

                if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else { // shouldn't animate
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');
                    destination.append(climbing_div);
                }
                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_shareEffectPublic: async function (notif) {

            const player_id = notif.args.player_id;
            const opponent_id = notif.args.opponent_id;

            if (notif.args.climbing_card_type_arg == '49') {

                const last_card = notif.args.last_card;
                const refill_portaledge = notif.args.refill_portaledge;

                this.utils.updateWaterPsych(player_id, 0, -1);
                await this.utils.updateWaterPsych(opponent_id, 0, -1);

                const hand_count_player = notif.args.hand_count_player;
                const hand_count_opponent = notif.args.hand_count_opponent;
                this.utils.portaledgeOpponent(player_id, {['gear']: 1}, true, hand_count_player, null, false, 0, 0, last_card, refill_portaledge);
                await this.utils.portaledgeOpponent(opponent_id, {['gear']: 1}, true, hand_count_opponent, notif.args.climbing_card_info, false, 0, 0, last_card, refill_portaledge);

                if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else { // shouldn't animate
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');
                    destination.append(climbing_div);
                }
                this.notifqueue.setSynchronousDuration();
            }            
        },

        notif_confirmAssetToAssetBoard: async function (notif) {

            const player_id = notif.args.player_id;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const character = this.gamedatas.characters[character_id];
            const card_id = notif.args.card_id;
            const card_type_arg = notif.args.card_type_arg;
            const card_type = notif.args.card_type;
            const slot_num = dojo.query(`#${character.name}_${card_type} .asset`).length + 1;
            const asset_ele = $(`asset_card_${card_id}`);

            const new_slot_num = slot_num < 5 ? slot_num : 4;
            const board_slot = $(`${character.name}_${card_type}_${new_slot_num}`);
            this.gamedatas.board_assets[player_id][card_type][new_slot_num][card_id] = card_type_arg;
            let vacate_slots = {...this.board_slots};
            if (slot_num === 5) { vacate_slots[card_type]++; }

            asset_ele.classList.remove('selected_resource');
            asset_ele.parentElement.classList.remove('selected_resource_wrap');
            dojo.query('.selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });
            asset_ele.classList.add('played_asset');

            this.utils.sanitizeAssetBoards();

            if (this.utils.shouldAnimate()) {
                
                await this.utils.vacateAssetSlots(vacate_slots, character, player_id);

                const args = [asset_ele, board_slot];
                asset_ele.style.setProperty('--z', `${slot_num + 10}`);

                this.utils.updateTitlebar('Placing Asset on Asset Board');
                
                const old_parent = asset_ele.parentElement;
                const old_z = old_parent.style.zIndex;
                old_parent.style.zIndex = 10;
                await this.utils.animationPromise(asset_ele, 'asset_hand_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                old_parent.style.zIndex = old_z;
            
            } else { // shouldn't animate

                this.utils.vacateAssetSlots(vacate_slots, character, player_id);
                dojo.place(asset_ele, board_slot);
            }

            this.utils.resizeHand();

            this.utils.updatePlayerResources(player_id, notif.args.player_resources);
            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else { // shouldn't animate
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');
                    destination.append(climbing_div);
                }

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
            const slot_num = dojo.query(`#${character.name}_${card_type} .asset`).length + 1;
            
            const new_slot_num = slot_num < 5 ? slot_num : 4;
            const board_slot = $(`${character.name}_${card_type}_${new_slot_num}`);
            this.gamedatas.board_assets[player_id][card_type][new_slot_num][card_id] = card_type_arg;
            let vacate_slots = {...this.board_slots};
            if (slot_num == 5) { vacate_slots[card_type]++; }

            this.utils.sanitizeAssetBoards();

            if (this.utils.shouldAnimate()) {

                await this.utils.vacateAssetSlots(vacate_slots, character, player_id);

                const asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                                                CARD_ID : card_id,
                                                EXTRA_CLASSES : '',
                                                acX : asset.x_y[0],
                                                acY : asset.x_y[1],
                }), $(`hand_counter_${player_id}`));

                $('asset_deck_draw').style.display = 'flex';
                const deck_draw_slot = $('deck_draw_1');
                $('asset_deck_draw').style.zIndex = `${slot_num + 10}`;
                let args = [asset_ele, deck_draw_slot];
                asset_ele.style.setProperty('--z', `${slot_num + 10}`);

                this.utils.updateTitlebar('Placing Asset on Asset Board');

                await this.utils.animationPromise(asset_ele, 'asset_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
            
                args = [asset_ele, board_slot];
                await this.utils.animationPromise(asset_ele, 'asset_display_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                $('asset_deck_draw').style.zIndex = '';
                $('asset_deck_draw').style.display = 'none';
            
            } else { // shouldn't animate

                this.utils.vacateAssetSlots(vacate_slots, character, player_id);
                dojo.place(this.format_block('jstpl_asset_card', {
                                                CARD_ID : card_id,
                                                EXTRA_CLASSES : '',
                                                acX : asset.x_y[0],
                                                acY : asset.x_y[1],
                }), board_slot.id);
            }

            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else { // shouldn't animate
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');
                    destination.append(climbing_div);
                }

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
            const old_board_slot_num = notif.args.selected_resource ? Number($(`asset_card_${asset_id}`).parentElement.id.slice(-1)) : null;
            let vacate_slots = {...this.board_slots};
            let destination;

            if (notif.args.selected_resource) {
                const slot_num = dojo.query(`#asset_card_${asset_id}`)[0].parentElement.id.slice(-1);
                delete this.gamedatas.board_assets[opponent_id][type][slot_num][asset_id];
                this.gamedatas.board_assets[opponent_id][type]['flipped'][slot_num] = null;
            }
            else if (notif.args.random_tucked_id) {
                delete this.gamedatas.board_assets[opponent_id][type]['tucked'][asset_id];
            }
            this.gamedatas.board_assets[opponent_id][type]['count']--;

            if (notif.args.to_board) {

                this.utils.sanitizeAssetBoards();

                const new_board_slot_num = dojo.query(`#${character.name}_${type} .asset`).length + 1;

                if (new_board_slot_num <= 4) {
                    this.gamedatas.board_assets[player_id][type][new_board_slot_num][asset_id] = type_arg;
                    destination = $(`${character.name}_${type}_${new_board_slot_num}`);
                }
                else if (new_board_slot_num > 4) {
                    this.gamedatas.board_assets[player_id][type][4][asset_id] = asset_type_arg;
                    destination = $(`${character.name}_${type}_4`);
                    vacate_slots[type]++;
                }
            }

            if (this.utils.shouldAnimate()) {

                $('asset_deck_draw').style.display = 'flex';
                const deck_draw_slot = $('deck_draw_1');
                $('asset_deck_draw').style.zIndex = '15';

                if (notif.args.random_tucked_id) {
                    const asset_counter_img = $(`${opponent_character.name}_${type}_counter`).firstElementChild;
                    dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : asset_id,
                        EXTRA_CLASSES : '',
                        acX : asset['x_y'][0],
                        acY : asset['x_y'][1],
                    }), asset_counter_img);
                }

                let asset_ele = $(`asset_card_${asset_id}`);
                const old_board_slot = asset_ele.parentElement;
                const old_z = old_board_slot.style.zIndex;
                old_board_slot.style.zIndex = '10';

                if (this.gamedatas.board_assets[opponent_id][type]['flipped'][old_board_slot_num] === true) {
                    
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
                    asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : asset_id,
                        EXTRA_CLASSES : '',
                        acX : asset.x_y[0],
                        acY : asset.x_y[1],
                    }), old_board_slot);
                }

                let args = [asset_ele, deck_draw_slot];
                asset_ele.style.setProperty('--z', '15');
                const hand_counter = $(`hand_counter_${player_id}`);
                asset_ele.classList.remove('selected_resource', 'played_asset');
                dojo.query('.selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });

                this.utils.updateTitlebar('Stealing Asset from');
                const opponent_name_span = document.createElement('span');
                opponent_name_span.id = `${opponent_name}_span`;
                opponent_name_span.innerHTML = opponent_name;
                opponent_name_span.style.color = opponent_color;
                $('gameaction_status').parentElement.append(opponent_name_span);

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
            
                if (!notif.args.to_board) {
                    args = [asset_ele, hand_counter, 1];
                    await this.utils.animationPromise(asset_ele, 'asset_display_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                
                } else if (notif.args.to_board) {
                    await this.utils.vacateAssetSlots(vacate_slots, character, player_id);
                    args = [asset_ele, destination];
                    await this.utils.animationPromise(asset_ele, 'asset_display_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                }
                $('asset_deck_draw').style.zIndex = '';
                $('asset_deck_draw').style.display = 'none';

                old_board_slot.style.zIndex = old_z;
                opponent_name_span.remove();
            
            } else { // shouldn't animate

                const asset_ele = $(`asset_card_${asset_id}`);
                asset_ele.style.backgroundPosition = `-${asset.x_y[0]}% -${asset.x_y[1]}%`;
                if (!notif.args.to_board && !notif.args.random_tucked_id) { asset_ele.remove(); }
                else if (notif.args.to_board) {
                    this.utils.vacateAssetSlots(vacate_slots, character, player_id);
                    destination.append(asset_ele);
                }

                if (notif.args.random_tucked_id) {
                    const rand_type_arg = this.gamedatas.asset_identifier[notif.args.random_tucked_id];
                    const type = this.utils.getAssetType(rand_type_arg);
                    const draw_num_ele = dojo.query(`#asset_board_${opponent_id} .board_${type}_counter .asset_counter_num`)[0];
                    const draw_num = Number(draw_num_ele.innerHTML);
                    draw_num_ele.innerHTML = `${draw_num - 1}`;
                }
            }

            this.utils.repositionAssetBoard(opponent_id);
            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

                } else { // shouldn't animate
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');
                    destination.append(climbing_div);
                }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmStealFromAssetBoard: async function(notif) {

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
            const new_card_slot_num = this.utils.resizeHand('asset', [asset_id]);
            const new_card_slot = $(`hand_asset_${new_card_slot_num[asset_id]}`);
            const old_board_slot_num = dojo.query('.selected_resource').length > 0 ? Number(dojo.query('.selected_resource')[0].parentElement.id.slice(-1)) : null;
            let vacate_slots = {...this.board_slots};
            let destination;

            // remove event listener on stolen asset
            const original_asset_ele = $(`asset_card_${asset_id}`);
            const asset_ele = original_asset_ele.cloneNode(true);
            original_asset_ele.parentNode.replaceChild(asset_ele, original_asset_ele);

            dojo.query('.selected_resource').forEach(ele => { ele.classList.remove('played_asset', 'selected_resource'); });
            dojo.query('.selectable').forEach(ele => { ele.classList.remove('selectable', 'cursor'); });

            if (notif.args.selected_resource) {
                delete this.gamedatas.board_assets[opponent_id][type][old_board_slot_num][asset_id];
                this.gamedatas.board_assets[opponent_id][type]['flipped'][old_board_slot_num] = null;
            }

            else if (notif.args.random_tucked_id) {
                delete this.gamedatas.board_assets[opponent_id][type]['tucked'][asset_id];
            }
            this.gamedatas.board_assets[opponent_id][type]['count']--;

            if (notif.args.to_board) {
                
                this.utils.sanitizeAssetBoards();

                const new_board_slot_num = dojo.query(`#${character.name}_${type} .asset`).length + 1;

                if (new_board_slot_num <= 4) {
                    this.gamedatas.board_assets[player_id][type][new_board_slot_num][asset_id] = asset_type_arg;
                    destination = $(`${character.name}_${type}_${new_board_slot_num}`);
                }
                else if (new_board_slot_num > 4) {
                    this.gamedatas.board_assets[player_id][type][4][asset_id] = asset_type_arg;
                    destination = $(`${character.name}_${type}_4`);
                    vacate_slots[type]++;
                }
            } else { this.gamedatas.hand_assets[asset_id] = asset_type_arg; } // stolen card goes to hand

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar('Stealing Asset from');
                const opponent_name_span = document.createElement('span');
                opponent_name_span.id = `${opponent_name}_span`;
                opponent_name_span.innerHTML = opponent_name;
                opponent_name_span.style.color = opponent_color;
                $('gameaction_status').parentElement.append(opponent_name_span);

                if (notif.args.random_tucked_id) {
                    const asset_counter_img = $(`${opponent_character.name}_${type}_counter`).firstElementChild;
                    dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : asset_id,
                        EXTRA_CLASSES : '',
                        acX : asset['x_y'][0],
                        acY : asset['x_y'][1],
                    }), asset_counter_img);
                }

                const old_board_slot = asset_ele.parentElement;
                const old_z = old_board_slot.style.zIndex;
                old_board_slot.style.zIndex = '10';

                if (this.gamedatas.board_assets[opponent_id][type]['flipped'][old_board_slot_num] === true) {
                    
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
                    asset_ele = dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : asset_id,
                        EXTRA_CLASSES : '',
                        acX : asset.x_y[0],
                        acY : asset.x_y[1],
                    }), old_board_slot);
                }

                if (!notif.args.to_board) {

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

                } else if (notif.args.to_board) {

                    await this.utils.vacateAssetSlots(vacate_slots, character, player_id);
                    args = [asset_ele, destination];
                    if (notif.args.selected_resource) {
                        await this.utils.animationPromise(asset_ele, 'asset_board_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    
                    } else if (notif.args.random_tucked_id) {
                        await this.utils.animationPromise(asset_ele, 'asset_tucked_to_board', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    }
                }

                old_board_slot.style.zIndex = old_z;
                opponent_name_span.remove();

            } else { // shouldn't animate

                if (this.gamedatas.board_assets[opponent_id][type]['flipped'][old_board_slot_num] === true) { $(`asset_card_${asset_id}`).remove(); }
                if (this.gamedatas.board_assets[opponent_id][type]['flipped'][old_board_slot_num] === true || notif.args.random_tucked_id) {
                    dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : asset_id,
                        EXTRA_CLASSES : '',
                        acX : asset.x_y[0],
                        acY : asset.x_y[1],
                    }), new_card_slot);
                }
                let asset_ele = $(`asset_card_${asset_id}`);

                if (!notif.args.to_board) { new_card_slot.append(asset_ele); }
                else if (notif.args.to_board) {
                    this.utils.vacateAssetSlots(vacate_slots, character, player_id);
                    destination.append(asset_ele);
                }

                if (notif.args.random_tucked_id) {
                    const rand_type_arg = this.gamedatas.asset_identifier[notif.args.random_tucked_id];
                    const type = this.utils.getAssetType(rand_type_arg);
                    const draw_num_ele = dojo.query(`#asset_board_${opponent_id} .board_${type}_counter .asset_counter_num`)[0];
                    const draw_num = Number(draw_num_ele.innerHTML);
                    draw_num_ele.innerHTML = `${draw_num - 1}`;
                }
            }

            dojo.query('.tucked_draw_box').forEach(ele => { ele.remove(); });

            this.utils.repositionAssetBoard(opponent_id);
            this.utils.updatePlayerResources(player_id, notif.args.player_resources);
            this.utils.handCount(player_id, notif.args.hand_count);

            if (this.utils.shouldAnimate()) {
                    const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                    const destination = $('climbing_discard');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

            } else { // shouldn't animate
                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                const destination = $('climbing_discard');
                destination.append(climbing_div);
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_climbingCards15And24Public: async function(notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }
            
            if (this.utils.shouldAnimate()) {
                this.utils.updateTitlebar('Dealing Gear cards from Portaledge');
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
                portaledge.style.display = 'none';
            
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
                    const destination = $('climbing_discard');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

            } else { // shouldn't animate
                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                const destination = $('climbing_discard');
                destination.append(climbing_div);
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_climbingCards15And24Private: async function(notif) {

            if ($('climbing_slot').firstElementChild) { await this.utils.retractClimbingCard(); }

            const new_asset_id = notif.args.new_asset_id;
            const new_asset_type_arg = notif.args.new_asset_type_arg;
            this.gamedatas.hand_assets[new_asset_id] = new_asset_type_arg;

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

            const player_resources = this.utils.getCurrentPlayerResources(this.player_id);
            player_resources.skills.gear++;
            let card_technique_types = [];
            for (const [type, num] of Object.entries(asset.techniques)) {
                if (num > 0) { card_technique_types.push(type); }
            }
            for (let type of card_technique_types) { player_resources.techniques[type]++; }

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar('Dealing Gear cards from Portaledge');
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
                portaledge.style.display = 'none';
                await (async function() { return new Promise(resolve => setTimeout(resolve, 1000)) })();
                args = [asset_ele, hand_slot];
                await this.utils.animationPromise(asset_ele, 'asset_display_to_hand', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                $('asset_deck_draw').style.display = 'none';

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
                    console.log(dojo.query('#climbing_discard_straightened')[0].children);
                    const destination = $('climbing_discard');

                    await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                    destination.append(climbing_div);

            } else { // shouldn't animate
                const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
                const destination = $('climbing_discard');
                destination.append(climbing_div);
            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_confirmChooseSummitBetaToken: async function(notif) {

            const selected_token_id = notif.args.selected_token_id;
            const opponent_token_id = notif.args.opponent_token_id;
            const player_id = notif.args.player_id;
            const opponent_id = notif.args.opponent_id;

            const climbing_div = dojo.query('#climbing_discard_straightened')[0].firstElementChild;
            const card_destination = $('climbing_discard');

            const selected_token_ele = $(`summit_beta_${selected_token_id}`);
            const opponent_token_ele = $(`summit_beta_${opponent_token_id}`);

            console.log('ids, eles =');
            console.log(selected_token_id, opponent_token_id);
            console.log($(`summit_beta_${selected_token_id}`));
            console.log($(`summit_beta_${opponent_token_id}`));

            if (this.getActivePlayerId() == this.player_id) {

                selected_token_ele.classList.remove('selected_token', 'selectable_token', 'cursor');
                opponent_token_ele.classList.remove('selectable_token', 'cursor');
            }


            if (this.utils.shouldAnimate()) {
                if (this.player_id == player_id) {
                    const new_token_slot = this.utils.resizeHand('token');

                    let args = [selected_token_ele, new_token_slot];
                    this.utils.animationPromise(selected_token_ele, 'token_board_to_hand_choose', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    selected_token_ele.style.width = '100%';
                    selected_token_ele.style.height = '100%';
                } else {
                    let args = [selected_token_ele, $(`hand_counter_${player_id}`)];
                    this.utils.animationPromise(selected_token_ele, 'token_board_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                }

                if (this.player_id == opponent_id) {
                    
                    const new_token_slot = this.utils.resizeHand('token');

                    let args = [opponent_token_ele, new_token_slot];
                    await this.utils.animationPromise(opponent_token_ele, 'token_board_to_hand_choose', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                    opponent_token_ele.style.width = '100%';
                    opponent_token_ele.style.height = '100%';
                } else {
                    let args = [opponent_token_ele, $(`hand_counter_${opponent_id}`)];
                    await this.utils.animationPromise(opponent_token_ele, 'token_board_to_counter', 'anim', this.utils.moveToNewParent(), true, false, ...args);
                }
                
                await this.utils.animationPromise(climbing_div, 'climbing_card_discard', 'anim', null, false, true);
                card_destination.append(climbing_div);

            } else { // shouldn't animate

                if (this.player_id == player_id) {
                    const new_token_slot = this.utils.resizeHand('token');
                    if (selected_token_ele) {
                        new_token_slot.append(selected_token_ele);
                        selected_token_ele.style.width = '100%';
                        selected_token_ele.style.height = '100%';
                        opponent_token_ele.remove();
                    }
                    else {
                        const new_token_type_arg = this.gamedatas.token_identifier[selected_token_id];
                        const new_token = this.gamedatas.summit_beta_tokens[new_token_type_arg];
                        dojo.place(this.format_block('jstpl_summit_beta', {
                            TOKEN_ID : selected_token_id,
                            sbX : new_token.x_y[0],
                            sbY : new_token.x_y[1],
                        }), new_token_slot);
                    }

                } else if (this.player_id == opponent_id) {
                    const new_token_slot = this.utils.resizeHand('token');
                    if (selected_token_ele) {
                        new_token_slot.append(opponent_token_ele);
                        opponent_token_ele.style.width = '100%';
                        opponent_token_ele.style.height = '100%';
                        selected_token_ele.remove();
                    }
                    else {
                        const new_token_type_arg = this.gamedatas.token_identifier[opponent_token_id];
                        const new_token = this.gamedatas.summit_beta_tokens[new_token_type_arg];
                        dojo.place(this.format_block('jstpl_summit_beta', {
                            TOKEN_ID : selected_token_id,
                            sbX : new_token.x_y[0],
                            sbY : new_token.x_y[1],
                        }), new_token_slot);
                    }
                        
                } else {
                    if (selected_token_ele) {
                        selected_token_ele.remove();
                        opponent_token_ele.remove();
                    }
                }
                card_destination.append(climbing_div);

            }

            this.notifqueue.setSynchronousDuration();
        },

        notif_matchingTechniques: async function(notif) {

            const player_id = notif.args.player_id;
            const player_name = notif.args.player_name;
            const player_color = notif.args.player_color;
            const player = this.gamedatas.players[player_id];
            const character_id = player.character;
            const previous_points_tokens = dojo.query(`character_${character_id} .points_token`).length;
            const played_tokens = notif.args.played_tokens;

            if (this.utils.shouldAnimate()) {

                this.utils.updateTitlebar('Awarding 2-Point Token(s) to ');
                const player_name_span = document.createElement('span');
                player_name_span.id = `${player_name}_span`;
                player_name_span.innerHTML = player_name;
                player_name_span.style.color = player_color;
                $('pagemaintitletext').parentElement.insertBefore(player_name_span, $('pagemaintitletext').nextElementSibling);

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
                                        await this.utils.animationPromise(token_ele, 'token_hand_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
                                    }
                                    else {
                                        const token_ele = dojo.place(`<div class="${type}_token symbol_token"></div>`, `hand_counter_${player_id}`);
                                        tokens_to_fade.push(token_ele);
                                        const args = [token_ele, display_slot];
                                        await this.utils.animationPromise(token_ele, 'token_counter_to_display', 'anim', this.utils.moveToNewParent(), false, true, ...args);
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
                            .then(() => { resolve(); });
                        } else { resolve(); }
                    })
                })();

                // 2 point tokens appear
                await (async () => {
                    return new Promise(async (resolve) => {

                        for (let i=1; i<=notif.args.token_num; i++) {
                            const two_point_token = dojo.place(`<div class="points_token points_${i}"></div>`, 'board', 2);
                            this.utils.animationPromise(two_point_token, 'token_appears', 'anim', null, false, false);
                            await (async function() { return new Promise(resolve => setTimeout(resolve, 200)) })();
                            if (i === notif.args.token_num) {
                                await (async function() { return new Promise(resolve => setTimeout(resolve, 1300)) })();
                                resolve();
                            }
                        }
                    });
                })();

                // 2 point tokens animate to boards
                await (async () => {
                    return new Promise(async (resolve) => {

                        for (let i=1; i<=notif.args.token_num; i++) {
                            
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
                            if (i == notif.args.token_num) {
                                await (async function() { return new Promise(resolve => setTimeout(resolve, 1300)) })();
                                resolve();
                            }
                        }
                    });
                })();

                player_name_span.remove();
                this.notifqueue.setSynchronousDuration();

            } else { // shouldn't animate

                for (let i=1; i<=notif.args.token_num; i++) {

                    const wrapper_num = previous_points_tokens + i;
                    const destination = dojo.query(`#player_${player_id} .pw${wrapper_num}`)[0];
                    dojo.place(`<div class="points_token"></div>`, destination);

                    if (Object.keys(played_tokens).length > 0 && player_id == this.player_id) {
                        for (const [type, num] of Object.entries(played_tokens)) {
                            for (let i=1; i<=num; i++) {

                                dojo.query(`#assets_wrap .${type}_token`)[0].remove();
                            }
                        }
                    }
                }

                this.notifqueue.setSynchronousDuration();
            }
        },

        notif_noMatchingTechniques: async function(notif) {

            this.utils.updateTitlebar('Checking for sets of matching Technique symbols');
            await (async function() { return new Promise(resolve => setTimeout(resolve, 1200)) })();
            this.notifqueue.setSynchronousDuration();
        },

        notif_noPermanentAssets: async function(notif) {

            this.utils.updateTitlebar('Checking for players eligible to gain Permanent Assets token(s)');
            await (async function() { return new Promise(resolve => setTimeout(resolve, 1200)) })();
            this.notifqueue.setSynchronousDuration();
        },

        notif_grantPermanentAssets: async function(notif) {

            const players = Object.keys(this.gamedatas.players);
            const gained_permanent_assets = notif.args.gained_permanent_assets;
            const discarded_assets = notif.args.discarded_assets;
            const asset_board_slot = dojo.query('.asset_board_slot')[0];
            const asset_bounding_box = asset_board_slot.getBoundingClientRect();
            const discard_pile = $('asset_discard');    
            let discard_ids = [];
            let tucked_ids = [];
            let tucked_types = {};

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
                            this.gamedatas.resource_tracker['asset_board']['skills'][type]--;

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
                            this.gamedatas.resource_tracker['asset_board']['skills'][type]--;

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
                            this.gamedatas.resource_tracker['asset_board']['skills'][type]--;

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

                        for (const num of Object.values(gained_permanent_assets[player_id])) { total_tokens += Number(num); }
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

                                        const token = dojo.place(`<div id="${type}_${player_id}_${i}" class="skills_and_techniques ${type}_token"></div>`, `box_${type}`);
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
                                dojo.place(`<div id="${type}_${player_id}_${i}" class="skills_and_techniques ${type}_token"></div>`, destination);
                                previous_tokens++;
                            }
                        }
                    }
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

                                this.utils.pitchTooltip(`pitch_${location}_click`, type_arg);
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

                            this.utils.pitchTooltip(`pitch_${location}_click`, type_arg);
                            resolve();
                        });
                    }
                });
            })();

            this.notifqueue.setSynchronousDuration();
        }
    });
});