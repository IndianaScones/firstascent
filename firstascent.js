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
    "ebg/counter"
],
function (dojo, declare, aspect) {
    return declare("bgagame.firstascent", ebg.core.gamegui, {
        constructor: function(){
            console.log('firstascent constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;
            let gameObject = this;            //Needed as the this object in aspect.before will not refer to the game object in which the formatting function resides
            aspect.before(dojo.string, "substitute", function(template, map, transform) {      //This allows you to modify the arguments of the dojo.string.substitute method before they're actually passed to it
                return [template, map, transform, gameObject];
            });

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
            
            // Setting up player panels
            for( let player_id in gamedatas.players )
            {
                let player = gamedatas.players[player_id];
                let player_panel_div = $(`player_board_${player_id}`);

                // place in my panel only
                if (this.player_id === Number(player_id)) {

                    // ref cards
                    dojo.place(this.format_block('jstpl_references', player), player_panel_div);
                    player_panel_div.classList.add('my_panel');

                    // starting skills
                    let skills_title = _('Skills __________');
                    dojo.place(`<div style="font-size: 10px; margin-bottom: 5px;">${skills_title}</div>`, 
                        player_panel_div);
                    dojo.place(this.format_block('jstpl_skills', {
                        player_id : player_id,
                    }), player_panel_div);

                    // starting techniques
                    let techniques_title = _('Techniques ____');
                    dojo.place(`<div style="font-size: 10px; margin-bottom: 5px;">${techniques_title}</div>`, 
                        player_panel_div);
                    dojo.place(this.format_block('jstpl_techniques', {
                        player_id : player_id,
                    }), player_panel_div);
                }

                // starting water and psych
                dojo.place(this.format_block('jstpl_water_and_psych', {
                    player_id : player_id
                }), player_panel_div, 8);

                // current water and psych
                const water = gamedatas.water;
                const psych = gamedatas.psych;
                let current_water = water[`${player_id}`];
                let current_psych = psych[`${player_id}`];
                if (current_water) { $(`water_num_${player_id}`).innerHTML = current_water; }
                if (current_psych) { $(`psych_num_${player_id}`).innerHTML = current_psych; }

                // rope
                if (player.character) {
                    let rope_color = gamedatas.characters[player.character]['rx_y']['straight'];
                    dojo.place(this.format_block('jstpl_pp_rope', {
                        player_id : player_id,
                        rX : rope_color[0],
                        rY : rope_color[1]
                    }), `${player_id}_water_and_psych`);
                    this.addTooltipHtml(`${player_id}_rope_counter`, _('Rope'), 500);
                }

                // initialize hand counter
                let hand_size = Object.keys(gamedatas[`${player_id}_hand_assets`]).length;
                dojo.place(`<div id="hand_counter_${player_id}" class="hand_counter">
                    </div><span id="hand_num_${player_id}" class="panel_num">${hand_size}</span>`, 
                    `${player_id}_water_and_psych`, 8);
                
                // meeple
                if (player.character) {
                    let mx_y = gamedatas.characters[player.character]['mx_y'];
                    let meeple_destination;
                    if (player_id == this.player_id) { meeple_destination = 'ref_row'; }
                    else { meeple_destination = `${player_id}_water_and_psych`; }
                    dojo.place(this.format_block('jstpl_meeple', {
                        player_id : player_id,
                        mX : mx_y[0],
                        mY : mx_y[1]
                    }), meeple_destination);
                }
            }


        // Setup constants -
            const player_count = Object.keys(gamedatas.players).length;
            const cards_to_draw = 0;
            let cards_in_hand = dojo.query()


        // DEBUGGING FROM PHP


        // Display the correct board for player count

            if (player_count <= 3) {
                dojo.addClass('board', 'desert');
            } else {
                dojo.addClass('board', 'forest');
                dojo.query('.pitch').style({
                    'height':'13.6%',
                    'width':'7.82%',
                })
            }

        // Place Summit Beta Token pile

            let summmit_beta_coords;
            if (player_count <= 3) {summit_beta_coords = [36.2, 1.88];} // Desert board
            else {summit_beta_coords = [36.2, 2.27];}                     // Forest board
            dojo.place(this.format_block('jstpl_summit_pile', {
                summit_pile_top : summit_beta_coords[0],
                summit_pile_left : summit_beta_coords[1]
            }), 'board', 1);

        // Place Climbing deck

            let climbing_deck_coords;
            if (player_count <= 3) {climbing_deck_coords = [-2.82, 5.38];} // Desert board
            else {climbing_deck_coords = [-2.386, 5.7];}                 // Forest board
            dojo.place(this.format_block('jstpl_climbing_deck', {
                climbing_deck_top : climbing_deck_coords[0],
                climbing_deck_left : climbing_deck_coords[1]
            }), 'board', 2);

        // Set up the asset deck and spread

            // place asset deck

            let asset_deck_coords;
            if (player_count <= 3) {asset_deck_coords = [0.1, 90.4];} // Desert board
            else {asset_deck_coords = [0.5, 89.85];}                   // Forest board
            dojo.place(this.format_block('jstpl_asset_deck', {
                asset_deckX : asset_deck_coords[0],
                asset_deckY : asset_deck_coords[1]
            }), 'board', 4);
            dojo.place(`<div id="asset_deck_draw">
                            <div id="deck_draw_8" class="draw_wrap"></div>
                            <div id="deck_draw_7" class="draw_wrap"></div>
                            <div id="deck_draw_6" class="draw_wrap"></div>
                            <div id="deck_draw_5" class="draw_wrap"></div>
                            <div id="deck_draw_4" class="draw_wrap"></div>
                            <div id="deck_draw_3" class="draw_wrap"></div>
                            <div id="deck_draw_2" class="draw_wrap"></div>
                            <div id="deck_draw_1" class="draw_wrap"></div>
                        </div>`, 'board', 5);

            // place spread slots

            let spread_cards = Object.values(gamedatas.spread);
            let spread_coords;
            if (player_count <= 3) {
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

            for (let card=0; card<=3; card++) {

                let spread_slot = `spread_slot${card+1}`;
                let cardId = Number(spread_cards[card]);
                if (cardId) {
                    let x = gamedatas.asset_cards[cardId]['x_y'][0];
                    let y = gamedatas.asset_cards[cardId]['x_y'][1];
                    dojo.place(this.format_block('jstpl_asset_card', {
                        CARD_ID : Object.keys(gamedatas.spread)[card],
                        EXTRA_CLASSES : 'spread_asset',
                        acX : x,
                        acY : y,
                    }), spread_slot);
                }
            }

        // Hand

             const player_assets_id = `${this.player_id}_hand_assets`;
             const player_assets = gamedatas[`${player_assets_id}`];
             const card_ids = Object.keys(player_assets);
             const asset_num = card_ids.length;

             const player_tokens_id = `${this.player_id}_hand_tokens`;
             const player_tokens = gamedatas[`${player_tokens_id}`];
             const token_ids = Object.keys(player_tokens);
             const token_num = token_ids.length;

             this.resizeHand(asset_num, token_num);
             let slot = 1;
             card_ids.forEach((card_id) => {
                let asset = gamedatas.asset_cards[player_assets[card_id]];
                dojo.place(this.format_block('jstpl_asset_card', {
                    CARD_ID : card_id,
                    EXTRA_CLASSES : '',
                    acX : asset.x_y[0],
                    acY : asset.x_y[1],
                }), `hand_asset_${slot}`);
                slot++;
             });
 
        // Characters and Asset Boards

            // place character area wrappers

            for (let i=1; i<=player_count; i++) {
                let current_player_id = Object.keys(gamedatas.players)[i-1];
                let current_player = gamedatas.players[`${current_player_id}`];

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
                    let parent = element.parentNode;
                    if (element != parent.firstElementChild) {
                        dojo.style(element, 'margin-top', '8px');
                    }
                });
            }

            // character selection

            if (gamedatas.available_characters.length > 1) {
                switch (player_count) {
                    case 2:
                        dojo.addClass('character_selection', 'cs_2');
                        break;
                    case 3:
                        dojo.addClass('character_selection', 'cs_3');
                        break;
                    case 4:
                        dojo.addClass('character_selection', 'cs_4');
                        dojo.addClass('character_selection_ratio', 'csr_4');
                        break;
                    case 5:
                        dojo.addClass('character_selection', 'cs_5');
                        dojo.addClass('character_selection_ratio', 'csr_5');
                        break;
                }

                for (let character_id of gamedatas.available_characters) {
                    let character = gamedatas.characters[character_id];
                    let nb_pos = character['nb_x_y'];
                    dojo.place(this.format_block('jstpl_namebox', {
                        type : character_id,
                        charX : nb_pos[0],
                        charY : nb_pos[1],
                    }), 'character_selection');
                    let bg_pos = character['x_y'];
                    let color = character['color_name'];
                    let character_name = character['name'];
                    let water_psych = character['water_psych'];
                    dojo.place(this.format_block('jstpl_character', {
                        type: character_id,
                        charX : bg_pos[0],
                        charY : bg_pos[1],
                        extra_style : '',
                        character : character_name,
                        color : color,
                    }), 'show_character');
                    if (character_name == 'phil') {
                        const water_7 = document.createElement('div');
                        water_7.id = 'phil_cube_w7';
                        water_7.classList.add('cube', 'cb_w_7', 'cb_black');
                        const psych_7 = document.createElement('div');
                        psych_7.id = 'phil_cube_p7';
                        psych_7.classList.add('cube', 'cb_p_7', 'cb_black');
                        $(`character_${character_id}`).insertBefore(water_7, $('phil_break'));
                        $(`character_${character_id}`).append(psych_7);
                    }
                    dojo.addClass(`character_${character_id}`, 'popout');
                    dojo.style(`${character_name}_cube_w${water_psych}`, 'visibility', 'visible');
                    dojo.style(`${character_name}_cube_p${water_psych}`, 'visibility', 'visible');

                    // tooltip
                    let description = _(character['description']);
                    let flavor = _(character['flavor']);
                    let ability = _(character['ability']);
                    let home_crag = _(character['home_crag']);
                    let native_lands = _(character['native_lands']);
                    let html = `<div style="margin-bottom: 5px;"><strong>${description}</strong></div>
                                <p>${flavor} - ${ability}</p>
                                <p>Starting Water/Psych: ${character['water_psych']}</p>
                                <span>Home Crag: ${home_crag}</span>
                                <span style="font-size: 10px; white-space: nowrap;"><i>${native_lands}</i></span>`;
                    this.addTooltipHtml(`character_${character_id}`, html, 1000);
                }

                let selected_characters = (player_count + 1) - gamedatas.available_characters.length;
                for (let i=1; i<=selected_characters; i++) {
                    dojo.place(this.format_block('jstpl_namebox', {
                        type: 1-i,
                        charX : 0,
                        charY : 0,
                    }), 'character_selection');
                    dojo.style(`namebox_${1-i}`, 'visibility', 'hidden');
                    dojo.addClass(`namebox_${1-i}`, 'vis_hidden');
                }

                if (this.checkAction('selectCharacter', true)) {
                    dojo.query('.namebox').forEach((element) => {
                        dojo.addClass(element, 'cursor');
                    });

                    // connect selectable character elements to choose character action
                }
                /*dojo.query('.namebox').connect('onclick', this, 'onSelectCharacter');*/
            } else { dojo.destroy('character_selection_ratio') }

            // my character
            const my_character_id = gamedatas.players[this.player_id]['character'];
            if (my_character_id) {
                const my_character = gamedatas.characters[my_character_id];
                const bg_pos = my_character['x_y'];
                const ab_pos = my_character['ab_x_y'];
                const character_ratio = dojo.query(`#player_${this.player_id} .character_ratio_child`)[0];
                const color = my_character['color_name'];
                const character_name = my_character['name'];
                const water_psych = my_character['water_psych'];
                dojo.place(this.format_block('jstpl_character', {
                    type : my_character_id,
                    charX : bg_pos[0],
                    charY : bg_pos[1],
                    extra_style : "position: relative;",
                    character : character_name,
                    color : color,
                }), character_ratio);
                dojo.place(this.format_block('jstpl_asset_board', {
                    player : this.player_id,
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), `character_${my_character_id}`);
                if (character_name == 'phil') {
                        const water_7 = document.createElement('div');
                        water_7.id = 'phil_cube_w7';
                        water_7.classList.add('cube', 'cb_w_7', 'cb_black');
                        const psych_7 = document.createElement('div');
                        psych_7.id = 'phil_cube_p7';
                        psych_7.classList.add('cube', 'cb_p_7', 'cb_black');
                        $(`character_${my_character_id}`).insertBefore(water_7, $('phil_break'));
                        $(`character_${my_character_id}`).insertBefore(psych_7, $(`asset_board_${this.player_id}`));
                    }
                dojo.style(`${character_name}_cube_w${water_psych}`, 'visibility', 'visible');
                dojo.style(`${character_name}_cube_p${water_psych}`, 'visibility', 'visible');
            }

            // opponents' characters
            for (let player_id in gamedatas.players) {
                if (player_id != this.player_id) {
                    let playerInfo = gamedatas.players[player_id];
                    let character_id = playerInfo.character;
                    if (character_id) {
                        const character_details = gamedatas.characters[character_id];
                        const bg_pos = character_details['x_y'];
                        const ab_pos = character_details['ab_x_y'];
                        const character_ratio = dojo.query(`#player_${player_id} .character_ratio_child`)[0];
                        const color = character_details['color_name'];
                        const character_name = character_details['name'];
                        const water_psych = character_details['water_psych'];
                        dojo.place(this.format_block('jstpl_character', {
                            type : character_id,
                            charX : bg_pos[0],
                            charY : bg_pos[1],
                            extra_style : "position: relative;",
                            character : character_name,
                            color : color,
                        }), character_ratio);
                        dojo.place(this.format_block('jstpl_asset_board', {
                            player : player_id,
                            abX : ab_pos[0],
                            abY : ab_pos[1],
                        }), `character_${character_id}`);
                        if (character_name == 'phil') {
                        const water_7 = document.createElement('div');
                        water_7.id = 'phil_cube_w7';
                        water_7.classList.add('cube', 'cb_w_7', 'cb_black');
                        const psych_7 = document.createElement('div');
                        psych_7.id = 'phil_cube_p7';
                        psych_7.classList.add('cube', 'cb_p_7', 'cb_black');
                        $(`character_${character_id}`).insertBefore(water_7, $('phil_break'));
                        $(`character_${character_id}`).insertBefore(psych_7, $(`asset_board_${player_id}`));
                    }
                        dojo.style(`${character_name}_cube_w${water_psych}`, 'visibility', 'visible');
                        dojo.style(`${character_name}_cube_p${water_psych}`, 'visibility', 'visible');
                    }
                }
            }

            // set player colors to character colors
            for (let player_id in gamedatas.players) {
                let playerInfo = gamedatas.players[player_id];
                if (playerInfo.character) {
                    let character_details = gamedatas.characters[playerInfo.character];
                    let character_color = character_details.color;
                    dojo.setStyle(`character_area_${playerInfo.name}`, {
                        'color': `#${character_color}`,
                        '-webkit-text-stroke': '.5px black'
                    });
                    let name_ref = dojo.query(`#player_name_${player_id}`)[0].firstElementChild;
                    dojo.setStyle(name_ref, {
                        'color': `#${character_color}`,
                        '-webkit-text-stroke': '.5px black'
                    });
                }
            }

            // personal objectives

            if (gamedatas.current_personal_objectives[this.player_id]) {
                let current_personal_objectives = gamedatas.current_personal_objectives[this.player_id];
                let objective_1 = gamedatas.personal_objectives[current_personal_objectives[0]];
                let objective_2 = gamedatas.personal_objectives[current_personal_objectives[1]];
                let po_coords_1 = objective_1['x_y'];
                let po_coords_2 = objective_2['x_y'];
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
                let current_shared_objective = gamedatas.current_shared_objectives[i];
                let bg_pos = gamedatas.shared_objectives[current_shared_objective]['x_y'];
                let subscript = _(gamedatas.shared_objectives[current_shared_objective]['subscript_string']) || '';
                let title = _(gamedatas.shared_objectives[current_shared_objective]['description']);
                let condition = _(gamedatas.shared_objectives[current_shared_objective]['objective_string']);
                let html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                            <div class="shared_objective shared_objective_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%;"></div>
                            <div>${condition}</div>
                            <div style="font-size:10px;">${subscript}</div>`;
                this.addTooltipHtml(`shared_objective${i+1}`, html, 1000);
            }

            // spread cards

            for (let i=0; i<=3; i++) {
                let current_asset = spread_cards[i];
                let current_asset_ids = Object.keys(gamedatas.spread);
                this.assetTooltip(`asset_card_${current_asset_ids[i]}`, current_asset);
            }

            // pitches

            if (player_count <= 3) {
                for (let i=1; i<=21; i++) {
                    let current_pitch = dojo.attr(`pitch${i}`, 'class').slice(-2).replace(/^\D+/g, '');
                    //console.log(`current_pitch = ${current_pitch}`);
                    let bg_pos = gamedatas.pitches[current_pitch]['x_y'];
                    let title = _(gamedatas.pitches[current_pitch]['description']);
                    let type = _(gamedatas.pitches[current_pitch]['type_description']);
                    let html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                                <div class="pitch pitch_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>
                                <div> Type: ${type} / Value: ${gamedatas.pitches[current_pitch]['value']}</div>`;
                    this.addTooltipHtml(`pitch${i}`, html, 1000);
                }
            }

            // characters

            const current_characters = document.querySelectorAll('.character');
            for (let current_character of current_characters) {
                let character_id = dojo.attr(current_character, 'id').slice(-2).replace(/^\D+/g, '');
                let character = gamedatas.characters[character_id];
                let bg_pos = character['x_y'];
                let title = _(character['description']);
                let flavor = _(character['flavor']);
                let ability = _(character['ability']);
                let home = _(character['home_crag']);
                let native_lands = _(character['native_lands']);
                let html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                            <p>${flavor} - ${ability}</p>
                            <p>Starting Water/Psych: ${character['water_psych']}</p>
                            <span>Home Crag: ${home}</span>
                            <span style="font-size: 10px; white-space: nowrap;"><i>${native_lands}</i></span>`;
                this.addTooltipHtml(`character_${character_id}`, html, 1000);
            }

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
                        <span class="risk risk_1" style="margin-top: 0;"></span>
                        <span style="margin-left: 20px;">` + _('= no consequence') + `</span><br>
                        <span class="risk risk_2" style="margin-top: 4px;"></span>
                        <span style="margin-left: 20px; position: relative; top: 3.8px;">` + _('= give 2 Cards from your hand to another') + `</span><br>
                        <span style="margin-left: 30px; position: relative; top: 5px;">` + _('player') + `</span><br>
                        <span class="risk risk_3" style="margin-top: 7px;"></span>
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
            for (let player_id in gamedatas.players) {
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
                const asset_elements = document.getElementsByClassName('asset_tooltip');
                Array.from(asset_elements).forEach((ele) => {
                    let ele_id = ele.id;
                    let asset_type = ele_id.slice(-2).replace(/^\D+/g, '');
                    console.log('ele_id = ');
                    console.log(ele_id);
                    this.assetTooltip(ele_id, asset_type);
                });
            });

            // style and connect asset deck and spread during draw asset action
            if (this.checkAction('drawAsset', true)) {
                dojo.addClass('asset_deck', 'selectable');
                for (let slot=0; slot<=3; slot++) {
                    let available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                    dojo.addClass(available_asset, 'selectable');
                    // dojo.connect(available_asset, 'onclick', this, 'onDrawAsset'); // commented out cuz it appears
                                                                                      // refresh doesn't break connection
                                                                                      // from onEnteringState
                }
                // dojo.connect($('asset_deck'), 'onclick', this, 'onDrawAsset');
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
            /*dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 30,
                    EXTRA_CLASSES : '',
                    acX : a_coords_30[0],
                    acY : a_coords_30[1],
                   })}`, 'assets_wrap');*/
            /*dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 19,
                    EXTRA_CLASSES : '',
                    acX : a_coords_19[0],
                    acY : a_coords_19[1],
                  })}`, 'assets_wrap');
            dojo.place(
                `${this.format_block('jstpl_asset_card', {
                    CARD_ID : 21,
                    EXTRA_CLASSES : '',
                    acX : a_coords_21[0],
                    acY : a_coords_21[1],
                  })}`, 'assets_wrap');
            dojo.place(
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
            /*dojo.place(
                `${this.format_block('jstpl_summit_beta', {
                    TOKEN_ID : 1,
                    sbX : sb_coords_1[0],
                    sbY : sb_coords_1[1],
                })}`, 'assets_wrap');
            dojo.place(
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

            /*******END NEW HAND WORKSPACE*******/

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            {
            case 'characterSelection':
                let player_count = Object.keys(this.gamedatas.players).length;
                let available_characters = dojo.query('#character selection .character').length;
                // check # of available characters so as not to double dojo.connect() for starting player
                if (this.isCurrentPlayerActive() && available_characters < player_count+1) {
                    dojo.query('.namebox').forEach((element) => {
                        dojo.addClass(element, 'cursor');
                    });
                    dojo.query('.namebox').connect('onclick', this, 'onSelectCharacter');
                }
                break;

            case 'drawAssets':
                if (this.isCurrentPlayerActive()) {
                    dojo.place('<div id="minus_one" class="draw_button">-</div><div id="plus_one" class="draw_button">+</div>', 'asset_deck');
                    dojo.addClass('minus_one', 'cursor');
                    dojo.addClass('plus_one', 'cursor');
                    for (let slot=0; slot<=3; slot++) {
                        let available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                        available_asset.classList.add('selectable', 'cursor');
                    }
                    dojo.addClass('asset_deck', 'selectable');

                    // connect asset deck and spread cards to draw asset action
                    dojo.connect($('minus_one'), 'onclick', this, 'onSelectAsset');
                    dojo.connect($('plus_one'), 'onclick', this, 'onSelectAsset');
                    for (let slot=0; slot<=3; slot++) {
                        let available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                        dojo.connect(available_asset, 'onclick', this, 'onSelectAsset');          
                    }

                    // number of cards to be drawn
                    cards_to_draw = args.args.x_cards;
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
            
            switch( stateName )
            {
            case 'characterSelection':
                // remove the leftover character
                if (dojo.query('#character_selection div:not(.vis_hidden)').length == 1) { 
                    dojo.destroy('character_selection_ratio'); 
                }

                // remove selectable effects and event listeners for the player who just chose their character
                if (this.isCurrentPlayerActive()) { 
                    dojo.query('#character_selection *').forEach((element) => {
                        dojo.removeClass(element, 'cursor');
                    });

                    this.disconnect($('confirm_button'), 'onclick');
                }
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
                switch( stateName )
                {
                case 'characterSelection':
                    this.addActionButton('confirm_button', _('Confirm'), 'onConfirmCharacter', null, false, 'white');
                    $('confirm_button').classList.add('disabled');
                    break;

                case 'drawAssets':
                    this.addActionButton('confirm_button', _('Confirm'), 'onConfirmAssets', null, false, 'white');
                    $('confirm_button').classList.add('disabled');
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
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods
        
        /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */

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
                    ele.style.setProperty('--dx', (y1 - y0) + 'px');
                    ele.style.setProperty('--dy', (x0 - x1) + 'px');
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

        resizeHand: function(card_num=0, token_num=0) {
            $('hand_ratio').className = '';
            $('assets_wrap').className = '';
            $('hand_objectives').className = '';
            let card_sum = card_num
            let token_sum = token_num * 1.1742;
            rows = Math.ceil((card_sum + token_sum) / 7);

            switch (true) {
                case rows === 1 || rows === 0: 
                    break;

                case rows === 2:
                    dojo.addClass('hand_ratio', 'hand_ratio_two_rows');
                    dojo.addClass('assets_wrap', 'assets_wrap_two_rows');
                    dojo.addClass('hand_objectives', 'hand_objectives_two_rows');
                    dojo.query('#assets_wrap > .summit_beta').forEach((ele) => {
                        dojo.addClass(ele, 'summit_beta_two_rows');
                    });
                    break;

                case rows === 3:
                    dojo.addClass('hand_ratio', 'hand_ratio_three_rows');
                    dojo.addClass('assets_wrap', 'assets_wrap_three_rows');
                    dojo.addClass('hand_objectives', 'hand_objectives_three_rows');
                    dojo.query('#assets_wrap > .summit_beta').forEach((ele) => {
                        dojo.addClass(ele, 'summit_beta_three_rows');
                    });
                    break;

                case rows === 4:
                    dojo.addClass('hand_ratio', 'hand_ratio_four_rows');
                    dojo.addClass('assets_wrap', 'assets_wrap_four_rows');
                    dojo.addClass('hand_objectives', 'hand_objectives_four_rows');
                    dojo.query('#assets_wrap > .summit_beta').forEach((ele) => {
                        dojo.addClass(ele, 'summit_beta_four_rows');
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

        getTooltipsForLog: function(format_values, type) {
            switch(type) {
                case 'assets':
                    if (format_values.length === 1) {
                        const asset = format_values[0];
                        const asset_title = this.gamedatas['asset_cards'][asset]['description'];
                        return this.format_block('jstpl_log_asset', {
                                card_key: asset,
                                card_name: asset_title,
                            });
                    } else if (format_values.length > 1) {
                        let spread_for_log = '';
                        for (let asset of format_values) {
                            const asset_title = this.gamedatas['asset_cards'][asset]['description'];
                            const tooltip_span = this.format_block('jstpl_log_asset', {
                                                    card_key: asset,
                                                    card_name: asset_title,
                                                 });
                            if (asset === format_values[format_values.length-1]) { spread_for_log += tooltip_span; }
                            else { spread_for_log += `${tooltip_span}, `; }
                        }
                        return spread_for_log;
                    } else { return 'nothing'; }
            }
        },

        assetTooltip: function(ele, card_type) {
            let bg_pos = this.gamedatas.asset_cards[card_type]['x_y'];
            let skill = _(this.gamedatas.asset_cards[card_type]['skill']);
            let title = _(this.gamedatas.asset_cards[card_type]['description']);
            let html = `<div style="margin-bottom: 5px; display: inline;"><strong>${title}</strong></div>
                        <span style="font-size: 10px; margin-left: 5px;">${skill}</span>
                        <div class="asset asset_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>`;
            this.addTooltipHtml(ele, html, 1000);
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
            let character = evt.currentTarget.id.slice(-2).replace(/^\D+/g, '');
            dojo.stopEvent(evt);

            if (this.checkAction('selectCharacter')) {
                dojo.query('#character_selection *').forEach((element) => {
                    if (`namebox_${character}` === element.id) {
                        dojo.addClass(element, 'namebox_selected');
                    } else {
                        dojo.removeClass(element, 'namebox_selected');
                    }
                });

                dojo.query('#show_character .character').forEach((element) => {
                    if (`character_${character}` === element.id) {
                        dojo.style(element, 'display', 'inline-block');
                    } else {
                        dojo.style(element, 'display', 'none');
                    }
                });

                if ($('confirm_button').classList.contains('disabled')) { $('confirm_button').classList.remove('disabled'); }
            }
        },

        onConfirmCharacter: function(evt) {
            dojo.stopEvent(evt);

            let character = dojo.query('.namebox_selected')[0].id.slice(-2).replace(/^\D+/g, '');         

            if (this.checkAction('confirmCharacter')) {
                this.ajaxcall("/firstascent/firstascent/confirmCharacter.html", { lock: true,
                    character : character
                }, this, function(result) {} );
            }
        },

        onSelectAsset: function(evt) {
            dojo.stopEvent(evt);

            let deck_classes = $('asset_deck').classList;
            let deck_draw_str = deck_classes.item(deck_classes.length - 1);
            let deck_draw_num = Number(deck_draw_str) || 0;
            let spread_draw_num = dojo.query('.selected_asset').length;

            if (evt.currentTarget.id == 'plus_one') {
                if (deck_draw_num + spread_draw_num == cards_to_draw) { return; }
                if (!deck_classes.contains('draw')) {
                    deck_classes.add('draw', '1');
                    dojo.place('<span id="draw_num">1</span>', 'asset_deck');
                } else {
                    deck_classes.remove(deck_draw_str);
                    deck_classes.add(`${deck_draw_num+1}`);
                    $('draw_num').innerHTML = `${deck_draw_num+1}`;
                }
                deck_draw_num ++;
            } else if (evt.currentTarget.id == 'minus_one') {
                if (deck_classes.contains('1')) {
                    deck_classes.remove('draw', '1');
                    dojo.destroy('draw_num');
                } else if (deck_classes.contains('draw')) {
                    deck_classes.remove(deck_draw_str);
                    deck_classes.add(`${deck_draw_num-1}`);
                    $('draw_num').innerHTML = `${deck_draw_num-1}`;
                }
                deck_draw_num --;
            } else {
                let asset_card = evt.currentTarget;
                if (asset_card.classList.contains('selected_asset')) { 
                    asset_card.classList.remove('selected_asset');
                    spread_draw_num--;
                }
                else if (deck_draw_num + spread_draw_num == cards_to_draw) { return; }
                else { 
                    asset_card.classList.add('selected_asset');
                    spread_draw_num++;
                }
            }

            if ((deck_draw_num + spread_draw_num === cards_to_draw) && $('confirm_button').classList.contains('disabled')) { 
                $('confirm_button').classList.remove('disabled');
            } else if ((deck_draw_num + spread_draw_num != cards_to_draw) && !$('confirm_button').classList.contains('disabled')) {
                $('confirm_button').classList.add('disabled');
            }
        },

        onConfirmAssets: function(evt) {
            dojo.stopEvent(evt);

            let spread_to_draw = '';
            dojo.query('.selected_asset').forEach((ele) => {
                let asset_id = ele.id.slice(-3).replace(/^\D+/g, '');
                spread_to_draw += `${asset_id},`;
            });

            let deck_classes = $('asset_deck').classList;
            let deck_to_draw = Number(deck_classes[deck_classes.length - 1]) || 0;

            if (this.checkAction('confirmAssets')) {
                this.ajaxcall("/firstascent/firstascent/confirmAssets.html", { lock: true,
                    spread_assets : spread_to_draw,
                    deck_assets : deck_to_draw
                }, this, function(result) {} );
            }
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
        },  

        notif_confirmCharacter: function(notif) {
            let player_id = notif.args.player_id;
            let active_player = this.gamedatas.players[player_id];
            let character_num = notif.args.character_num;
            let character_div = dojo.query(`#${notif.args.character_div}`)[0];
            let character = this.gamedatas.characters[character_num];

            // place character wrappers

            // current player chose character
            if (notif.args.player_id == this.player_id) {
                dojo.place(this.format_block('jstpl_character_area', {
                        player : player_id,
                        color : active_player.color,
                        player_name : active_player.name,
                    }), 'character_zone', 'first');
                if ($('character_zone').children.length > 1) {
                    dojo.style(`character_area_${active_player.name}`, 'margin-bottom', '8px');
                    dojo.style(`player_${this.player_id}`, 'margin-bottom', '35px');
                }

            // opponent chose character
            } else { 
                dojo.place(this.format_block('jstpl_character_area', {
                        player : player_id,
                        color : active_player.color,
                        player_name : active_player.name,
                        player_name : active_player.name,
                    }), 'character_zone');
                if ($('character_zone').children.length > 1) {
                dojo.style(`character_area_${active_player.name}`, 'margin-top', '8px');
                }
            }

            // remove namebox
            dojo.style(`namebox_${character_num}`, 'visibility', 'hidden');
            $('character_selection').append($(`namebox_${character_num}`));
            dojo.addClass(`namebox_${character_num}`, 'vis_hidden');

            // reaffirm current player is on top
            /*if (player_id == this.player_id) { 
                dojo.place(`player_${this.player_id}`, 'character_zone', "first");
            }*/

            // change player color to character color
            let character_color = this.gamedatas.characters[character_num]['color'];
            dojo.setStyle(`character_area_${active_player.name}`, {
                'color': `#${character_color}`,
                '-webkit-text-stroke': '.5px black'
            });
            let name_ref = dojo.query(`#player_name_${player_id}`)[0].firstElementChild;
            dojo.setStyle(name_ref, {
                'color': `#${character_color}`,
                '-webkit-text-stroke': '.5px black'
            });
            this.gamedatas.players[player_id].color = character_color;
            dojo.query('.playername').forEach((element) => {
                if (element.innerHTML === active_player.name) {
                    dojo.style(element, 'color', `#${character_color}`);
                }
            })

            // initialize water and psych
            $(`water_num_${player_id}`).innerHTML = character['water_psych'];
            $(`psych_num_${player_id}`).innerHTML = character['water_psych'];

            // initialize rope
            let rope_color = character['rx_y']['straight'];
            dojo.place(this.format_block('jstpl_pp_rope', {
                player_id : player_id,
                rX : rope_color[0],
                rY : rope_color[1]
            }), `${player_id}_water_and_psych`);
            this.addTooltipHtml(`${player_id}_rope_counter`, _('Rope'), 500);

            // place meeple in player panel
            let mx_y = character['mx_y'];
            let meeple_destination;
            if (player_id == this.player_id) { meeple_destination = 'ref_row'; }
            else { meeple_destination = `${player_id}_water_and_psych`; }
            dojo.place(this.format_block('jstpl_meeple', {
                player_id : player_id,
                mX : mx_y[0],
                mY : mx_y[1]
            }), meeple_destination);

            // remove class, move div, animate slide
            if (player_id != this.player_id) { dojo.style(character_div, 'display', 'inline-block'); }
            let character_area = dojo.query(`#player_${player_id} .character_ratio_child`)[0];
            let ab_pos = character['ab_x_y'];
            let character_ratio_child = dojo.query(`#player_${player_id} .character_ratio_child`)[0];
            dojo.place(this.format_block('jstpl_asset_board', {
                    player : player_id,
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), character_div);
            dojo.removeClass(character_div, 'popout');

            let animateAndSetSync = async () => {
                const args = [character_div, character_area];
                await this.animationPromise(character_div, 'move_character', 'anim', this.moveToNewParent(), false, true, ...args);
                this.notifqueue.setSynchronousDuration(500);
            }
            animateAndSetSync();
        },

        notif_dealPersonalObjectives: function (notif) {
            if (this.isCurrentPlayerActive()) {
                let current_personal_objectives = notif.args.current_personal_objectives;
                let objective_1 = this.gamedatas.personal_objectives[current_personal_objectives[0]];
                let objective_2 = this.gamedatas.personal_objectives[current_personal_objectives[1]];
                let po_coords_1 = objective_1['x_y'];
                let po_coords_2 = objective_2['x_y'];
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
            dojo.query('.asset_tooltip').forEach((ele) => {
                let ele_id = ele.id;
                let asset_type = ele_id.slice(-2).replace(/^\D+/g, '');
                this.assetTooltip(ele_id, asset_type);

            });
            let player_id = notif.args.player_id;
            let spread_ids = notif.args.spread_card_ids;
            let new_deck_assets = notif.args.deck_num;
            let new_spread_assets = spread_ids.length;
            console.log('spread_card_types = ');
            console.log(notif.args.spread_card_types);

            let drawCards = async () => {
                return new Promise(resolve => {
                    if (new_deck_assets) {
                        for (let i=1; i<=new_deck_assets; i++) {
                            let animateDeck = async () => {
                                dojo.style('asset_deck_draw', 'display', 'flex');
                                dojo.place(`<div id="deck_temp_${i}" class="asset asset_deck_back deck_temp"></div>`, 'asset_deck');
                                let deck_asset_div = $(`deck_temp_${i}`);
                                let deck_row = $(`deck_draw_${i}`);
                                let counter_div = $(`hand_counter_${player_id}`);
                                let args = [deck_asset_div, deck_row, 2];
                                await this.animationPromise(deck_asset_div, 'move_deck_asset', 'anim', this.moveToNewParent(), false, true, ...args);
                                args = [deck_asset_div, counter_div, 1];
                                await this.animationPromise(deck_asset_div, 'move_to_counter', 'anim', this.moveToNewParent(), true, false, ...args);
                                this.handCount(player_id, notif.args.hand_count);
                                dojo.style('asset_deck_draw', 'display', 'none');
                                if (i == new_deck_assets && new_deck_assets > new_spread_assets) { resolve(); }
                            }
                            animateDeck();
                        }
                    }

                    spread_ids.forEach((ele) => {
                        let spread_div = $(`asset_card_${ele}`);
                        let counter_div = $(`hand_counter_${player_id}`);
                        let spread_slot = spread_div.parentElement;

                        let animateSpread = async () => {
                            await this.animationPromise(spread_slot, 'straighten_asset', 'trans');
                            const args = [spread_div, counter_div, 1];
                            await this.animationPromise(spread_div, 'move_to_counter', 'anim', this.moveToNewParent(), true, false, ...args);
                            this.handCount(player_id, notif.args.hand_count);
                            spread_slot.classList.remove('straighten_asset');
                            if (ele === spread_ids[spread_ids.length - 1] && new_spread_assets >= new_deck_assets) { resolve(); }
                        }
                        animateSpread();
                    });
                });
            }
            await drawCards();
            const refillSpread = async () => {
                let i = 0;
                let spread = dojo.query('#the_spread .spread');
                spread.forEach((ele) => {
                    setTimeout(() => {
                        if (ele.childElementCount === 0) {
                            let animateRefill = async () => {
                                let new_card = notif.args.spread_assets_arr[i];
                                i++;
                                let id = new_card.id;
                                let type = new_card.type_arg;
                                let asset = this.gamedatas.asset_cards[type];
                                dojo.place(this.format_block('jstpl_flip_card', {
                                    asset_id : id,
                                    extra_classes : 'asset_deck_back',
                                    back_type : 'asset asset_back_for_flip',
                                    front_type : 'asset',
                                    cX : asset.x_y[0],
                                    cY : asset.x_y[1],
                                }), 'asset_deck');
                                let deck_asset_div = $(`deck_asset_${id}`);

                                let args = [deck_asset_div, ele, 1];
                                this.animationPromise(deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true);
                                await this.animationPromise(deck_asset_div, 'move_to_spread', 'anim', this.moveToNewParent(), true, false, ...args);
                                dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : id,
                                    EXTRA_CLASSES : 'spread_asset',
                                    acX : asset.x_y[0],
                                    acY : asset.x_y[1],
                                }), ele);
                            }
                            animateRefill();
                        }
                    }, 200);
                });
            }
            await refillSpread();
            this.notifqueue.setSynchronousDuration(1000);
        },

        notif_confirmYourAssets: async function (notif) {
            dojo.query('.asset_tooltip').forEach((ele) => {
                let ele_id = ele.id;
                let asset_type = ele_id.slice(-2).replace(/^\D+/g, '');
                this.assetTooltip(ele_id, asset_type);

            });
            let card_num = dojo.query('#assets_wrap .asset').length;
            let token_num = dojo.query('#assets_wrap .summit_beta').length;
            let new_deck_assets = notif.args.deck_num;
            let spread_ids = notif.args.spread_card_ids;
            let new_spread_assets = spread_ids.length;
            let new_cards = new_deck_assets + new_spread_assets;
            this.resizeHand(card_num+new_cards, token_num);
            let player_id = notif.args.player_id;
            let deck_assets_arr = notif.args.deck_assets_arr;

            $('asset_deck').classList.remove('selectable');
            if ($('draw_num')) { $('draw_num').remove(); }
            $('minus_one').remove();
            $('plus_one').remove();
            dojo.query('#the_spread .spread').forEach((ele) => {
                if (ele.firstElementChild) { ele.firstElementChild.classList.remove('selectable', 'selected_asset'); }
            });

            let drawCards = async () => {
                return new Promise(resolve => {
                    if (new_deck_assets) {
                        for (let i=1; i<=new_deck_assets; i++) {
                            let animateDeck = async () => {
                                dojo.style('asset_deck_draw', 'display', 'flex');
                                let id = deck_assets_arr[i-1].id;
                                let type = deck_assets_arr[i-1].type_arg;
                                let asset = this.gamedatas.asset_cards[type];
                                let deck_row = $(`deck_draw_${i}`);
                                console.log(`asset name = ${asset.description}`);
                                dojo.place(this.format_block('jstpl_flip_card', {
                                    asset_id : id,
                                    extra_classes : 'asset_deck_back',
                                    back_type : 'asset asset_back_for_flip',
                                    front_type : 'asset',
                                    cX : asset.x_y[0],
                                    cY : asset.x_y[1],
                                }), 'asset_deck');
                                let deck_asset_div = $(`deck_asset_${id}`);
                                let hand_slot = $(`hand_asset_${card_num+i}`);

                                let args = [deck_asset_div, deck_row, 2];
                                this.animationPromise(deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true);
                                await this.animationPromise(deck_asset_div, 'move_deck_asset', 'anim', this.moveToNewParent(), true, false, ...args);
                                dojo.place(this.format_block('jstpl_asset_card', {
                                        CARD_ID : id,
                                        EXTRA_CLASSES : '',
                                        acX : asset.x_y[0],
                                        acY : asset.x_y[1],
                                      }), deck_row);
                                let card = $(`asset_card_${id}`);
                                args = [card, hand_slot];
                                await this.animationPromise(card, 'move_to_hand', 'anim', this.moveToNewParent(), false, true, ...args);
                                this.handCount(player_id, notif.args.hand_count);
                                dojo.style('asset_deck_draw', 'display', 'none');
                                if (i == new_deck_assets && new_deck_assets > new_spread_assets) { resolve(); }
                            }
                            animateDeck();
                        }
                    }

                    let i = 1;
                    spread_ids.forEach((ele) => {
                        let spread_div = $(`asset_card_${ele}`);
                        let spread_slot = spread_div.parentElement;
                        let hand_slot = $(`hand_asset_${card_num+new_deck_assets+i}`);
                        i++;
                        let animateSpread = async () => {
                            await this.animationPromise(spread_slot, 'straighten_asset', 'trans');
                            const args = [spread_div, hand_slot];
                            await this.animationPromise(spread_div, 'move_to_hand', 'anim', this.moveToNewParent(), false, true, ...args);
                            this.handCount(player_id, notif.args.hand_count);
                            spread_slot.classList.remove('straighten_asset');
                            if (ele === spread_ids[spread_ids.length - 1] && new_spread_assets >= new_deck_assets) { resolve(); }
                        }
                        animateSpread();
                    });
                });
            }
            await drawCards();
            const refillSpread = async () => {
                let i = 0;
                dojo.query('#the_spread .spread').forEach((ele) => {
                    setTimeout(() => {
                        if (ele.childElementCount === 0) {
                            let animateRefill = async () => {
                                let new_card = notif.args.spread_assets_arr[i];
                                i++;
                                let id = new_card.id;
                                let type = new_card.type_arg;
                                let asset = this.gamedatas.asset_cards[type];
                                dojo.place(this.format_block('jstpl_flip_card', {
                                    asset_id : id,
                                    extra_classes : 'asset_deck_back',
                                    back_type : 'asset asset_back_for_flip',
                                    front_type : 'asset',
                                    cX : asset.x_y[0],
                                    cY : asset.x_y[1],
                                }), 'asset_deck');
                                let deck_asset_div = $(`deck_asset_${id}`);

                                let args = [deck_asset_div, ele, 1];
                                this.animationPromise(deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true);
                                await this.animationPromise(deck_asset_div, 'move_to_spread', 'anim', this.moveToNewParent(), true, false, ...args);
                                dojo.place(this.format_block('jstpl_asset_card', {
                                    CARD_ID : id,
                                    EXTRA_CLASSES : 'spread_asset',
                                    acX : asset.x_y[0],
                                    acY : asset.x_y[1],
                                }), ele);
                            }
                            animateRefill();
                        }
                    }, 200);
                });
            }
            await refillSpread();
            this.notifqueue.setSynchronousDuration(500);
        },
   });             
});