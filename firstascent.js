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
                }

                // starting water and psych
                dojo.place(this.format_block('jstpl_water_and_psych', {
                    player_id : player_id
                }), player_panel_div, 8);

                // current water and psych
                const water = gamedatas.water;
                const psych = gamedatas.psych;
                const current_water = water[`${player_id}`];
                const current_psych = psych[`${player_id}`];
                if (current_water) { $(`water_num_${player_id}`).innerHTML = current_water; }
                if (current_psych) { $(`psych_num_${player_id}`).innerHTML = current_psych; }

                // rope
                if (player.character) {
                    const rope_color = gamedatas.characters[player.character]['rx_y']['straight'];
                    dojo.place(this.format_block('jstpl_pp_rope', {
                        player_id : player_id,
                        rX : rope_color[0],
                        rY : rope_color[1]
                    }), `${player_id}_water_and_psych`);
                    this.addTooltipHtml(`${player_id}_rope_counter`, _('Rope'), 500);
                }

                // initialize hand counter
                const hand_size = Object.keys(gamedatas[`${player_id}_hand_assets`]).length;
                dojo.place(`<div id="hand_counter_${player_id}" class="hand_counter">
                    </div><span id="hand_num_${player_id}" class="panel_num">${hand_size}</span>`, 
                    `${player_id}_water_and_psych`, 8);
                
                // meeple
                if (player.character) {
                    const mx_y = gamedatas.characters[player.character]['mx_y'];
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

        // Display the correct board for player count

            if (player_count <= 3) {
                $('board').classList.add('desert');
            } else {
                $('board').classList.add('forest');
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

            // place spread slots

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
                const asset = gamedatas.asset_cards[player_assets[card_id]];
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
                switch (player_count) {
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
                        water_7.id = 'phil_cube_w7';
                        water_7.classList.add('cube', 'cb_w_7', 'cb_water');
                        const psych_7 = document.createElement('div');
                        psych_7.id = 'phil_cube_p7';
                        psych_7.classList.add('cube', 'cb_p_7', 'cb_psych');
                        $(`character_${character_id}`).insertBefore(water_7, $('phil_break'));
                        $(`character_${character_id}`).append(psych_7);
                    }
                    $(`character_${character_id}`).classList.add('popout');
                    $(`${character_name}_cube_w${water_psych}`).style.visibility = 'visible';
                    $(`${character_name}_cube_p${water_psych}`).style.visibility = 'visible';

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

                const selected_characters = (player_count + 1) - gamedatas.available_characters.length;
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
                }), character_ratio);
                dojo.place(this.format_block('jstpl_asset_board', {
                    player : this.player_id,
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), `character_${my_character_id}`);
                if (character_name == 'phil') {
                        const water_7 = document.createElement('div');
                        water_7.id = 'phil_cube_w7';
                        water_7.classList.add('cube', 'cb_w_7', 'cb_water');
                        const psych_7 = document.createElement('div');
                        psych_7.id = 'phil_cube_p7';
                        psych_7.classList.add('cube', 'cb_p_7', 'cb_psych');
                        $(`character_${my_character_id}`).insertBefore(water_7, $('phil_break'));
                        $(`character_${my_character_id}`).insertBefore(psych_7, $(`asset_board_${this.player_id}`));
                    }
                $(`${character_name}_cube_w${water_psych}`).style.visibility = 'visible';
                $(`${character_name}_cube_p${water_psych}`).style.visibility = 'visible';
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
                        const water_psych = character_details['water_psych'];
                        dojo.place(this.format_block('jstpl_character', {
                            type : character_id,
                            charX : bg_pos[0],
                            charY : bg_pos[1],
                            extra_style : "position: relative;",
                            character : character_name,
                        }), character_ratio);
                        dojo.place(this.format_block('jstpl_asset_board', {
                            player : player_id,
                            abX : ab_pos[0],
                            abY : ab_pos[1],
                        }), `character_${character_id}`);
                        if (character_name == 'phil') {
                            const water_7 = document.createElement('div');
                            water_7.id = 'phil_cube_w7';
                            water_7.classList.add('cube', 'cb_w_7', 'cb_water');
                            const psych_7 = document.createElement('div');
                            psych_7.id = 'phil_cube_p7';
                            psych_7.classList.add('cube', 'cb_p_7', 'cb_psych');
                            $(`character_${character_id}`).insertBefore(water_7, $('phil_break'));
                            $(`character_${character_id}`).insertBefore(psych_7, $(`asset_board_${player_id}`));
                        }
                        $(`${character_name}_cube_w${water_psych}`).style.visibility = 'visible';
                        $(`${character_name}_cube_p${water_psych}`).style.visibility = 'visible';
                    }
                }
            }

            // set player colors to character colors
            for (const player_id in gamedatas.players) {
                const playerInfo = gamedatas.players[player_id];
                if (playerInfo.character) {
                    const character_details = gamedatas.characters[playerInfo.character];
                    const character_color = character_details.color;
                    $(`character_area_${playerInfo.name}`).style.cssText += 
                        `color: #${character_color};
                        -webkit-text-stroke: .5px black;`;
                    const name_ref = dojo.query(`#player_name_${player_id}`)[0].firstElementChild;
                    name_ref.style.cssText +=
                        `color: #${character_color};
                        -webkit-text-stroke: .5px black;`;
                }
            }

            // personal objectives

            if (gamedatas.current_personal_objectives[this.player_id]) {
                const current_personal_objectives = gamedatas.current_personal_objectives[this.player_id];
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
                this.assetTooltip(`asset_card_${current_asset_ids[i]}`, current_asset);
            }

            // pitches

            if (player_count <= 3) {
                for (let i=1; i<=21; i++) {
                    const current_pitch = dojo.attr(`pitch_${i}`, 'class').slice(-2).replace(/^\D+/g, '');
                    const bg_pos = gamedatas.pitches[current_pitch]['x_y'];
                    const title = _(gamedatas.pitches[current_pitch]['description']);
                    const type = _(gamedatas.pitches[current_pitch]['type_description']);
                    const html = `<div style="margin-bottom: 5px;"><strong>${title}</strong></div>
                                <div class="pitch pitch_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>
                                <div> Type: ${type} / Value: ${gamedatas.pitches[current_pitch]['value']}</div>`;
                    this.addTooltipHtml(`pitch_${i}`, html, 1000);
                }
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
                const asset_elements = dojo.query('.asset_tooltip');
                Array.from(asset_elements).forEach((ele) => {
                    const ele_id = ele.id;
                    const asset_type = ele_id.slice(-2).replace(/^\D+/g, '');
                    this.assetTooltip(ele_id, asset_type);
                });
            });

            // style and connect asset deck and spread during draw asset action
            if (this.checkAction('drawAsset', true)) {
                $('asset_deck').classList.add('selectable');
                for (let slot=0; slot<=3; slot++) {
                    const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                    available_asset.classList.add('selectable');
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

            /*******PHP DEBUGGING*******/
            console.log('pitch_tracker = ');
            console.log(gamedatas.pitch_tracker);
            console.log('pitch_tracker.player_id = ');
            console.log(gamedatas['pitch_tracker'][this.player_id]);

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
                const player_count = Object.keys(this.gamedatas.players).length;
                const available_characters = dojo.query('#character selection .character').length;
                // check # of available characters so as not to double dojo.connect() for starting player
                if (this.isCurrentPlayerActive() && available_characters < player_count+1) {
                    dojo.query('.namebox').forEach((element) => {
                        element.classList.add('cursor');
                    });
                    dojo.query('.namebox').connect('onclick', this, 'onSelectCharacter');
                }
                break;

            case 'drawAssets':
                if (this.isCurrentPlayerActive()) {
                    dojo.place('<div id="minus_one" class="draw_button">-</div><div id="plus_one" class="draw_button">+</div>', 'asset_deck');
                    $('minus_one').classList.add('cursor');
                    $('plus_one').classList.add('cursor');
                    for (let slot=0; slot<=3; slot++) {
                        const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                        available_asset.classList.add('selectable', 'cursor');
                    }
                    $('asset_deck').classList.add('selectable');

                    // connect asset deck and spread cards to draw asset action
                    dojo.connect($('minus_one'), 'onclick', this, 'onSelectAsset');
                    dojo.connect($('plus_one'), 'onclick', this, 'onSelectAsset');
                    for (let slot=0; slot<=3; slot++) {
                        const available_asset = dojo.query(`#spread_slot${slot+1}`)[0].firstChild;
                        dojo.connect(available_asset, 'onclick', this, 'onSelectAsset');          
                    }

                    // number of cards to be drawn
                    cards_to_draw = args.args.x_cards;
                }
                break;

            case 'climbOrRest':
                if (this.isCurrentPlayerActive()) {
                    for (let pitch_num of args.args.available_pitches) {
                        $(`pitch_${pitch_num}_wrap`).classList.add('available_pitch', 'cursor');
                    }
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
                    $('character_selection_ratio').remove();
                }

                // remove selectable effects and event listeners for the player who just chose their character
                if (this.isCurrentPlayerActive()) { 
                    dojo.query('#character_selection *').forEach((element) => {
                        element.classList.remove('cursor');
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

        getTooltipForLog: function(card, type) {
            switch(type) {
                case 'asset':
                    const card_title = this.gamedatas['asset_cards'][card]['description'];
                    return this.format_block('jstpl_log_asset', {
                            card_key: card,
                            card_name: card_title,
                        });
            }
        },

        assetTooltip: function(ele, card_type) {
            const bg_pos = this.gamedatas.asset_cards[card_type]['x_y'];
            const skill = _(this.gamedatas.asset_cards[card_type]['skill']);
            const title = _(this.gamedatas.asset_cards[card_type]['description']);
            const html = `<div style="margin-bottom: 5px; display: inline;"><strong>${title}</strong></div>
                        <span style="font-size: 10px; margin-left: 5px;">${skill}</span>
                        <div class="asset asset_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>`;
            this.addTooltipHtml(ele, html, 1000);
        },

        shouldAnimate: function() {
            return document.visibilityState !== 'hidden' && !this.instantaneousMode;
        },

        // Override
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
                    this.prevent_error_rentry = this.prevent_error_rentry || 0;
                    this.prevent_error_rentry++;
                    if (this.prevent_error_rentry >= 10) {
                        console.error('Preventing error reentry => ABORTING');
                    }
                    this.prevent_error_rentry--;
                    console.log('Bad substitution', log, args);
                    formattedString = clientTranslatedString;
                }
            }
            return this.logInject(formattedString);
        },

        logInject: function (log_entry) {
            const asset_regex = /\[\w+-*\w* *\w*\(\d+\)\]/g;
            const assets_to_replace = log_entry.matchAll(asset_regex);

            for (let asset of assets_to_replace) {
                const match = asset[0];
                const left_parenthesis = match.indexOf('(');

                const asset_name = match.slice(1, left_parenthesis);
                const asset_type = match.slice(left_parenthesis+1, match.length-2);

                asset_span = this.getTooltipForLog(asset_type, 'asset');
                log_entry = log_entry.replace(match, asset_span);
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
            const character = evt.currentTarget.id.slice(-2).replace(/^\D+/g, '');
            dojo.stopEvent(evt);

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
                const asset_card = evt.currentTarget;
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
            const player_id = notif.args.player_id;
            const active_player = this.gamedatas.players[player_id];
            const character_num = notif.args.character_num;
            const character_div = dojo.query(`#${notif.args.character_div}`)[0];
            const character = this.gamedatas.characters[character_num];

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

            // opponent chose character
            } else { 
                dojo.place(this.format_block('jstpl_character_area', {
                        player : player_id,
                        color : active_player.color,
                        player_name : active_player.name,
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
                        `color: #${character_color};
                        -webkit-text-stroke: .5px black;`;
            const name_ref = dojo.query(`#player_name_${player_id}`)[0].firstElementChild;
            name_ref.style.cssText +=
                        `color: #${character_color};
                        -webkit-text-stroke: .5px black;`;
            this.gamedatas.players[player_id].color = character_color;
            dojo.query('.playername').forEach((element) => {
                if (element.innerHTML === active_player.name) {
                    element.style.color = `#${character_color}`;
                }
            })

            // initialize water and psych
            $(`water_num_${player_id}`).innerHTML = character['water_psych'];
            $(`psych_num_${player_id}`).innerHTML = character['water_psych'];

            // initialize rope
            const rope_color = character['rx_y']['straight'];
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
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), character_div);
            character_div.classList.remove('popout');

            if (this.shouldAnimate()) {

                let animateAndSetSync = async () => {
                    const args = [character_div, character_area];
                    await this.animationPromise(character_div, 'move_character', 'anim', this.moveToNewParent(), false, true, ...args);
                    this.notifqueue.setSynchronousDuration();
                }
                animateAndSetSync();
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

            // add tooltips to log
            dojo.query('.asset_tooltip').forEach((ele) => {
                const ele_id = ele.id;
                const asset_type = ele_id.slice(-2).replace(/^\D+/g, '');
                this.assetTooltip(ele_id, asset_type);
            });

            const drawCards = async () => {
                return new Promise(async (resolve) => {

                    // draw cards from deck
                    if (this.shouldAnimate()) {

                        let move_drawn_asset = [];
                        let move_to_counter = [];
                        const counter_div = $(`hand_counter_${player_id}`);
                        $('asset_deck_draw').style.display = 'flex';
                        $('spread_draw').style.display = 'flex';

                        for (let i=1; i<=new_deck_assets; i++) {

                            dojo.place(`<div id="deck_temp_${i}" class="asset deck_temp"></div>`, 'asset_deck');
                            const deck_asset_div = $(`deck_temp_${i}`);
                            const deck_row = $(`deck_draw_${i}`);

                            let args = [deck_asset_div, deck_row, 2];
                            move_drawn_asset.push(this.animationPromise.bind(null, deck_asset_div, 'move_drawn_asset', 'anim', this.moveToNewParent(), false, true, ...args));

                            args = [deck_asset_div, counter_div, 1];
                            move_to_counter.push(this.animationPromise.bind(null, deck_asset_div, 'move_to_counter', 'anim', this.moveToNewParent(), true, false, ...args));
                        }

                        // draw cards from spread
                        let i = 1;
                        spread_ids.forEach((ele) => {

                            const spread_div = $(`asset_card_${ele}`);
                            const spread_slot = spread_div.parentElement;
                            const draw_slot = $(`spread_draw_${i}`);
                            i++;

                            let args = [spread_div, draw_slot, 2];
                            move_drawn_asset.push(this.animationPromise.bind(null, spread_div, 'move_drawn_asset', 'anim', this.moveToNewParent(), false, true, ...args));

                            args = [spread_div, counter_div, 1];
                            move_to_counter.push(this.animationPromise.bind(null, spread_div, 'move_to_counter', 'anim', this.moveToNewParent(), true, false, ...args));
                        });

                        await Promise.all(move_drawn_asset.map((func) => { return func(); }))
                        .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                        .then(async () => { await Promise.all(move_to_counter.map((func) => { return func(); })) })
                        .then(() => {
                            this.handCount(player_id, notif.args.hand_count);
                            $('asset_deck_draw').style.display = 'none';
                            $('spread_draw').style.display = 'none';
                            resolve();
                        });
                            
                    } else {
                        spread_ids.map((id) => {
                            const spread_div = $(`asset_card_${id}`);
                            spread_div.remove();
                        });
                        this.handCount(player_id, notif.args.hand_count);
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

                                dojo.place(this.format_block('jstpl_flip_card', {
                                    asset_id : id,
                                    extra_classes : '',
                                    back_type : 'asset asset_back_for_flip',
                                    front_type : 'asset',
                                    cX : asset.x_y[0],
                                    cY : asset.x_y[1],
                                }), 'asset_deck');
                                const deck_asset_div = $(`deck_asset_${id}`);

                                cards_to_place.push([this.format_block('jstpl_asset_card', {
                                                        CARD_ID : id,
                                                        EXTRA_CLASSES : 'spread_asset',
                                                        acX : asset.x_y[0],
                                                        acY : asset.x_y[1],
                                                    }), ele]);

                                if (this.shouldAnimate()) {
                                    const args = [deck_asset_div, ele, 1];
                                    flip_and_move.push(this.animationPromise.bind(null, deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true));
                                    flip_and_move.push(this.animationPromise.bind(null, deck_asset_div, 'move_to_spread', 'anim', this.moveToNewParent(), true, false, ...args));
                                }
                            }
                        });

                        if (this.shouldAnimate()) {
                            await Promise.all(flip_and_move.map((func) => { return func(); }))
                            .then(() => {
                                cards_to_place.map((card) => { dojo.place(card[0], card[1]); })
                                resolve();
                            });
                        } else {
                            cards_to_place.map((card) => { dojo.place(card[0], card[1]); })
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
            this.resizeHand(card_num+new_cards, token_num);
            const player_id = notif.args.player_id;
            const deck_assets = notif.args.deck_assets_arr;

            // add tooltips to log
            dojo.query('.asset_tooltip').forEach((ele) => {
                const ele_id = ele.id;
                const asset_type = ele_id.slice(-2).replace(/^\D+/g, '');
                this.assetTooltip(ele_id, asset_type);
            });

            $('asset_deck').classList.remove('selectable');
            if ($('draw_num')) { $('draw_num').remove(); }
            $('minus_one').remove();
            $('plus_one').remove();
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
                        const hand_slot = $(`hand_asset_${card_num+spread_ids.length+i}`);
                        cards_for_hand.push([this.format_block('jstpl_asset_card', {
                                                    CARD_ID : id,
                                                    EXTRA_CLASSES : '',
                                                    acX : asset.x_y[0],
                                                    acY : asset.x_y[1],
                                                }), hand_slot]);
                    }
                    let i = 1;
                    spread_ids.forEach((id) => {
                        const spread_div = $(`asset_card_${id}`);
                        const hand_slot = $(`hand_asset_${card_num+i}`);
                        cards_for_hand.push([spread_div, hand_slot]);

                    });

                    if (this.shouldAnimate()) {

                        let move_drawn_asset = [];
                        let cards_to_place = [];
                        let move_to_hand = [];
                        $('asset_deck_draw').style.display = 'flex';
                        $('spread_draw').style.display = 'flex';

                        for (let i=1; i<=new_deck_assets; i++) {
                            const id = deck_assets[i-1].id;
                            const type = deck_assets[i-1].type_arg;
                            const asset = this.gamedatas.asset_cards[type];
                            const deck_row = $(`deck_draw_${i}`);
                            dojo.place(this.format_block('jstpl_flip_card', {
                                asset_id : id,
                                extra_classes : '',
                                back_type : 'asset asset_back_for_flip',
                                front_type : 'asset',
                                cX : asset.x_y[0],
                                cY : asset.x_y[1],
                            }), 'asset_deck');
                            const deck_asset_div = $(`deck_asset_${id}`);

                            let args = [deck_asset_div, deck_row, 2];
                            move_drawn_asset.push(this.animationPromise.bind(null, deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true));
                            move_drawn_asset.push(this.animationPromise.bind(null, deck_asset_div, 'move_drawn_asset', 'anim', this.moveToNewParent(), true, false, ...args));

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
                            const hand_slot = $(`hand_asset_${card_num+deck_assets.length+i}`);
                            i++;

                            let args = [spread_div, draw_slot, 2];
                            move_drawn_asset.push(this.animationPromise.bind(null, spread_div, 'move_drawn_asset', 'anim', this.moveToNewParent(), false, true, ...args));

                            args = [spread_div, hand_slot];
                            move_to_hand.push(this.animationPromise.bind(null, spread_div, 'move_to_hand', 'anim', this.moveToNewParent(), false, true, ...args));
                        });

                        await Promise.all(move_drawn_asset.map((func) => { return func(); }))
                        .then(() => { cards_to_place.map((card) => { dojo.place(card[0], card[1]); }) })
                        .then(() => { return new Promise(resolve => setTimeout(resolve, 1000)) })
                        .then(() => {
                            let i = 1;
                            for (let arr of deck_assets) {
                                const id = arr.id;
                                const card = $(`asset_card_${id}`);
                                const hand_slot = $(`hand_asset_${card_num+deck_assets.length-i+1}`);
                                i++;

                                args = [card, hand_slot];
                                move_to_hand.push(this.animationPromise.bind(null, card, 'move_to_hand', 'anim', this.moveToNewParent(), false, true, ...args));
                            }
                        })
                        .then(async () => { await Promise.all(move_to_hand.map((func) => { return func(); })) })
                        .then(() => {
                            this.handCount(player_id, notif.args.hand_count);
                            this.updatePlayerResources(player_id, notif.args.player_resources);
                            $('asset_deck_draw').style.display = 'none';
                            $('spread_draw').style.display = 'none';
                            resolve();
                        });
                    } else { // if shouldAnimate()
                        cards_for_hand.map((card) => { dojo.place(card[0], card[1]); });
                        spread_ids.map((id) => {
                            const spread_div = $(`asset_card_${id}`);
                            spread_div.remove();
                        });
                        this.handCount(player_id, notif.args.hand_count);
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

                                dojo.place(this.format_block('jstpl_flip_card', {
                                    asset_id : id,
                                    extra_classes : '',
                                    back_type : 'asset asset_back_for_flip',
                                    front_type : 'asset',
                                    cX : asset.x_y[0],
                                    cY : asset.x_y[1],
                                }), 'asset_deck');
                                const deck_asset_div = $(`deck_asset_${id}`);

                                cards_to_place.push([this.format_block('jstpl_asset_card', {
                                                        CARD_ID : id,
                                                        EXTRA_CLASSES : 'spread_asset',
                                                        acX : asset.x_y[0],
                                                        acY : asset.x_y[1],
                                                    }), ele]);

                                if (this.shouldAnimate()) {
                                    const args = [deck_asset_div, ele, 1];
                                    flip_and_move.push(this.animationPromise.bind(null, deck_asset_div.firstElementChild, 'flip_transform', 'anim', null, false, true));
                                    flip_and_move.push(this.animationPromise.bind(null, deck_asset_div, 'move_to_spread', 'anim', this.moveToNewParent(), true, false, ...args));
                                }
                            }
                        });

                        if (this.shouldAnimate()) {
                            await Promise.all(flip_and_move.map((func) => { return func(); }))
                            .then(() => {
                                cards_to_place.map((card) => { dojo.place(card[0], card[1]); })
                                resolve();
                            });
                        } else {
                            cards_to_place.map((card) => { dojo.place(card[0], card[1]); })
                            resolve();
                        }

                    } else { resolve(); }                 
                });
            }
            await refillSpread();

            this.notifqueue.setSynchronousDuration();
        },
    });             
});