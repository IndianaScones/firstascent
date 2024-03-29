{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- FirstAscent implementation : © Jonathan Morgan <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    firstascent_firstascent.tpl
-->

<div id="character_selection_ratio" class="character_selection_ratio">
    <div class="character_selection_ratio_child">
        <div id="character_selection"></div>
        <div id="show_character"></div>
    </div>
</div>

<div id="climbing_slot"></div>

<div id="portaledge">
    <div id="portagear" class="portaledge portagear" style="transform: none;"></div>
    <div id="portaface" class="portaledge portaface" style="transform: none;"></div>
    <div id="portacrack" class="portaledge portacrack" style="transform: none;"></div>
    <div id="portaslab" class="portaledge portaslab" style="transform: none;"></div>
</div>

<div class="board_ratio">
    <div class="board_ratio_child">
        <div id="board">

            <div id="die_wrapper">
                <div id="risk_die" class="risk_die">
                    <div id="risk_die_1" class="risk_checkmark risk_face"></div>
                    <div id="risk_die_2" class="risk_checkmark risk_face"></div>
                    <div id="risk_die_3" class="risk_cards risk_face"></div>
                    <div id="risk_die_4" class="risk_cards risk_face"></div>
                    <div id="risk_die_5" class="risk_card_and_psych risk_face"></div>
                    <div id="risk_die_6" class="risk_card_and_psych risk_face"></div>
                </div>
            </div>

            <div id="shared_objectives">
                <!-- BEGIN shared_objective -->
                    <div id="shared_objective{soId}" class="shared_objective" style="background-position: -{soX}% -{soY}%; top: {TOP}%; left: {LEFT}%;"></div>
                <!-- END shared_objective -->
            </div>

            <div id="asset_deck_draw">
                <div id="deck_draw_8" class="draw_wrap"></div>
                <div id="deck_draw_7" class="draw_wrap"></div>
                <div id="deck_draw_6" class="draw_wrap"></div>
                <div id="deck_draw_5" class="draw_wrap"></div>
                <div id="deck_draw_4" class="draw_wrap"></div>
                <div id="deck_draw_3" class="draw_wrap"></div>
                <div id="deck_draw_2" class="draw_wrap"></div>
                <div id="deck_draw_1" class="draw_wrap"></div>
            </div>

            <div id="spread_draw">
                <div id="spread_draw_4" class="spread_wrap"></div>
                <div id="spread_draw_3" class="spread_wrap"></div>
                <div id="spread_draw_2" class="spread_wrap"></div>
                <div id="spread_draw_1" class="spread_wrap"></div>
            </div>

            <div id="the_spread"></div>
            
            <div id="pitches">
                <!-- BEGIN pitch -->
                    <div id="pitch_{X}_wrap" class="pitch_wrap" style="bottom: {BOTTOM}%; left: {LEFT}%";>
                    <div id="pitch_{X}_border" class="pitch_border"></div>
                    <div id="pitch_{X}" class="pitch p{PITCH}" style="background-position: -{PX}% -{PY}%;"></div>
                    <div id="pitch_{X}_click" class="pitch_click"></div>
                    <!-- <div class="pitch_center"></div> -->
                    </div>
                <!-- END pitch -->
            </div>

        </div>
    </div>
</div>

<div id="hand_ratio">
    <div id="hand_ratio_child">
        <div id="myhand_wrap">
            <h3 style="margin-left: 0.5%; font-size: 2.6vmin;">{MY_HAND}</h3>
            <div id="assets_wrap"></div>
            <div id="hand_objectives"></div>
        </div>
    </div>
</div>


<div id="character_zone" style="position: relative;">
</div>


<script type="text/javascript">

// Javascript HTML templates

// characters

let jstpl_character_area='<div id="player_${player}" class="character_area" style="position: relative; \
    width: 100%; left: 0px; margin-top: 10px;"><h3 id="character_area_${player_name}" style="color: \
    #${color}; text-align: center;">${player_name}</h3><div class="character_ratio"><div \
    class="character_ratio_child"></div></div></div>';
let jstpl_namebox='<div id="namebox_${type}" class="namebox" style="background-position: -${charX}% \
    -${charY}%;"></div>';
let jstpl_character='<div id="character_${type}" class="character" style="background-position: -${charX}% \
    -${charY}%; ${extra_style}"> \
    <div id="${character}_w0" class="cube_wrap cb_w_0"></div> \
    <div id="${character}_w1" class="cube_wrap cb_w_1"></div> \
    <div id="${character}_w2" class="cube_wrap cb_w_2"></div> \
    <div id="${character}_w3" class="cube_wrap cb_w_3"></div> \
    <div id="${character}_w4" class="cube_wrap cb_w_4"></div> \
    <div id="${character}_w5" class="cube_wrap cb_w_5"></div> \
    <div id="${character}_w6" class="cube_wrap cb_w_6"></div> \
    <br id="${character}_break"> \
    <div id="${character}_p0" class="cube_wrap cb_p_0"></div> \
    <div id="${character}_p1" class="cube_wrap cb_p_1"></div> \
    <div id="${character}_p2" class="cube_wrap cb_p_2"></div> \
    <div id="${character}_p3" class="cube_wrap cb_p_3"></div> \
    <div id="${character}_p4" class="cube_wrap cb_p_4"></div> \
    <div id="${character}_p5" class="cube_wrap cb_p_5"></div> \
    <div id="${character}_p6" class="cube_wrap cb_p_6"></div> \
    </div>';
let jstpl_cube='<div id="${character}_cube_${type}" class="cube cb_${type}"</div>'
let jstpl_asset_board='<div id="asset_board_${player}" class="asset_board" style="background-position: \
    -${abX}% -${abY}%;"> \
    <div id="${character}_gear"> \
    <div id="${character}_gear_1" class="asset_board_slot gear_1"></div> \
    <div id="${character}_gear_2" class="asset_board_slot gear_2"></div> \
    <div id="${character}_gear_3" class="asset_board_slot gear_3"></div> \
    <div id="${character}_gear_4" class="asset_board_slot gear_4"></div> \
    <div id="${character}_gear_5" class="asset_board_slot gear_5"></div> \
    <div id="${character}_gear_6" class="asset_board_slot gear_6"></div></div> \
    <div id="${character}_face"> \
    <div id="${character}_face_1" class="asset_board_slot face_1"></div> \
    <div id="${character}_face_2" class="asset_board_slot face_2"></div> \
    <div id="${character}_face_3" class="asset_board_slot face_3"></div> \
    <div id="${character}_face_4" class="asset_board_slot face_4"></div> \
    <div id="${character}_face_5" class="asset_board_slot face_5"></div> \
    <div id="${character}_face_6" class="asset_board_slot face_6"></div></div> \
    <div id="${character}_crack"> \
    <div id="${character}_crack_1" class="asset_board_slot crack_1"></div> \
    <div id="${character}_crack_2" class="asset_board_slot crack_2"></div> \
    <div id="${character}_crack_3" class="asset_board_slot crack_3"></div> \
    <div id="${character}_crack_4" class="asset_board_slot crack_4"></div> \
    <div id="${character}_crack_5" class="asset_board_slot crack_5"></div> \
    <div id="${character}_crack_6" class="asset_board_slot crack_6"></div></div> \
    <div id="${character}_slab"> \
    <div id="${character}_slab_1" class="asset_board_slot slab_1"></div> \
    <div id="${character}_slab_2" class="asset_board_slot slab_2"></div> \
    <div id="${character}_slab_3" class="asset_board_slot slab_3"></div> \
    <div id="${character}_slab_4" class="asset_board_slot slab_4"></div> \
    <div id="${character}_slab_5" class="asset_board_slot slab_5"></div> \
    <div id="${character}_slab_6" class="asset_board_slot slab_6"></div></div> \
    </div>';

// card and token backs

let jstpl_summit_pile='<div id="summit_pile" class="summit_beta summit_pile_back" style="top: ${summit_pile_top}%; left: \
    ${summit_pile_left}%;"></div>';
let jstpl_climbing_deck='<div id="climbing_deck" class="climbing climbing_deck_back" style="top: ${climbing_deck_top}%; left: \
    ${climbing_deck_left}%;"><div id="climbing_straightened"></div></div>';
let jstpl_climbing_discard='<div id="climbing_discard" style="top: ${climbing_discard_top}%; left: ${climbing_discard_left}%;"> \
    <div id="climbing_discard_straightened"></div></div>'
let jstpl_asset_deck='<div id="asset_deck" class="asset asset_deck_back" style="top: ${asset_deckX}%; left: \
    ${asset_deckY}%;"></div>';

// cards and tokens

let jstpl_asset_card='<div id="asset_card_${CARD_ID}" class="asset ${EXTRA_CLASSES}" style="background-position: \
    -${acX}% -${acY}%;"></div>';
let jstpl_summit_beta='<div id="summit_beta_${TOKEN_ID}" class="summit_beta" style="background-position: \
    -${sbX}% -${sbY}%;"></div>';
let jstpl_climbing_card='<div id="climbing_card_${CARD_ID}" class="climbing drawn_climbing" style="background-position: \
    -${ccX}% -${ccY}%;"> \
    <div id="${CARD_ID}_top" class="choice a" style="height: ${a_height}%; top: ${a_top}%;"></div> \
    <div id="${CARD_ID}_bottom" class="choice b" style="height: ${b_height}%; top: ${b_top}%;"></div></div>';
let jstpl_flip_card='<div id="card_${card_id}" class="flip_card ${extra_classes}"> \
    <div class="flip_card_inner"> \
    <div class="flip_card_back ${back_type}"></div> \
    <div class="flip_card_front ${front_type}" style="background-position: -${cX}% -${cY}%;"></div></div></div>';

// tooltips for log
let jstpl_log_item='<span id="${num}_item_tooltip_${item_key}" class="${item_type} item_tooltip">${item_name}</span>';

// colored player name
let jstpl_colored_name='<span id="colored_name_${player_id}" class="colored_name_span" style="font-weight: bold; color: #${color};">${player_name}</span>';

// miscellany

let jstpl_personal_objective='<div id="personal_objective_${poId}" class="personal_objective" style=" \
    background-position: -${poX}% -${poY}%;"></div>';
let jstpl_spread_slot='<div id="spread_slot${SLOT_NUM}" class="spread" style="top: ${spreadX}%; left: \
    ${spreadY}%;"></div>';
let jstpl_references='<div id="ref_row"> \
    <div id="ref_1" class="reference"></div> \
    <div id="ref_2" class="reference"></div> \
    </div>';
let jstpl_water_and_psych='<div id="${player_id}_water_and_psych" class="cp_panel"> \
    <div id="water_icon_${player_id}" class="water_psych water"></div> \
    <span id="water_num_${player_id}" class="panel_num resource">0</span> \
    <div id="psych_icon_${player_id}" class="water_psych psych"></div> \
    <span id="psych_num_${player_id}" class="panel_num resource">0</span> \
    </div>';
let jstpl_pp_rope='<div id="${player_id}_rope_counter" class="pp_rope" style="background-position: -${rX}% \
    -${rY}%;"></div> \
    <span id="rope_num_${player_id}" class="panel_num" style="left: -8px;">8</span>';
let jstpl_rope='<div id="${player_id}_rope_${rope_num}" class="rope ${extra_classes}" \
    style="background-position: -${rX}% -${rY}%;"></div>';
let jstpl_meeple='<div id="meeple_${player_id}" class="meeple" style="background-position: -${mX}% -${mY}%;"></div>';
let jstpl_skills='<div id=${player_id}_skills" class="cp_panel"> \
    <div id="gear_icon_${player_id}" class="skills_and_techniques" style="background-position: -800% -0%;"></div> \
    <span id="gear_num_${player_id}" class="panel_num resource">0</span> \
    <div id="face_icon_${player_id}" class="skills_and_techniques" style="background-position: -600% -0%;"></div> \
    <span id="face_num_${player_id}" class="panel_num resource">0</span> \
    <div id="crack_icon_${player_id}" class="skills_and_techniques" style="background-position: -500% -0%;"></div> \
    <span id="crack_num_${player_id}" class="panel_num resource">0</span> \
    <div id="slab_icon_${player_id}" class="skills_and_techniques" style="background-position: -700% -0%;"></div> \
    <span id="slab_num_${player_id}" class="panel_num resource">0</span> \
    </div>';
let jstpl_techniques='<div id=${player_id}_techniques"> \
    <div id="precision_icon_${player_id}" class="skills_and_techniques" style="background-position: -200% -0%;"></div> \
    <span id="precision_num_${player_id}" class="panel_num resource">0</span> \
    <div id="balance_icon_${player_id}" class="skills_and_techniques" style="background-position: -100% -0%;"></div> \
    <span id="balance_num_${player_id}" class="panel_num resource">0</span> \
    <div id="pain_tolerance_icon_${player_id}" class="skills_and_techniques" style="background-position: -0% -0%;"></div> \
    <span id="pain_tolerance_num_${player_id}" class="panel_num resource">0</span> \
    <div id="power_icon_${player_id}" class="skills_and_techniques" style="background-position: -300% -0%;"></div> \
    <span id="power_num_${player_id}" class="panel_num resource">0</span> \
    </div>';

</script>  

{OVERALL_GAME_FOOTER}
