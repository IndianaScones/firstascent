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


<div class="board_ratio">
    <div class="board_ratio_child">
        <div id="board">

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

            <div id="the_portaledge">
                <div id="portaGear"></div>
                <div id="portaFace"></div>
                <div id="portaCrack"></div>
                <div id="portaSlab"></div>
            </div>

            
            <div id="pitches">
                <!-- BEGIN pitch -->
                    <div id="pitch_{X}_wrap" class="pitch_wrap" style="bottom: {BOTTOM}%; left: {LEFT}%";>
                    <div id="pitch_{X}" class="pitch p{PITCH}" style="background-position: -{PX}% -{PY}%;"><div id="pitch_{X}_available"></div></div></div>
                <!-- END pitch -->
            </div>

        </div>
    </div>
</div>

<div id="hand_ratio">
    <div id="hand_ratio_child">
        <div id="myhand_wrap" class="whiteblock">
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
    <div id="${character}_cube_w0" class="cube cb_w_0 cb_water"></div> \
    <div id="${character}_cube_w1" class="cube cb_w_1 cb_water"></div> \
    <div id="${character}_cube_w2" class="cube cb_w_2 cb_water"></div> \
    <div id="${character}_cube_w3" class="cube cb_w_3 cb_water"></div> \
    <div id="${character}_cube_w4" class="cube cb_w_4 cb_water"></div> \
    <div id="${character}_cube_w5" class="cube cb_w_5 cb_water"></div> \
    <div id="${character}_cube_w6" class="cube cb_w_6 cb_water"></div> \
    <br id="${character}_break"> \
    <div id="${character}_cube_p0" class="cube cb_p_0 cb_psych"></div> \
    <div id="${character}_cube_p1" class="cube cb_p_1 cb_psych"></div> \
    <div id="${character}_cube_p2" class="cube cb_p_2 cb_psych"></div> \
    <div id="${character}_cube_p3" class="cube cb_p_3 cb_psych"></div> \
    <div id="${character}_cube_p4" class="cube cb_p_4 cb_psych"></div> \
    <div id="${character}_cube_p5" class="cube cb_p_5 cb_psych"></div> \
    <div id="${character}_cube_p6" class="cube cb_p_6 cb_psych"></div> \
    </div>';
let jstpl_asset_board='<div id="asset_board_${player}" class="asset_board" style="background-position: \
    -${abX}% -${abY}%;"></div>';

// card and token backs

let jstpl_summit_pile='<div id="summit_pile" class="summit_beta summit_pile_back" style="top: ${summit_pile_top}%; left: \
    ${summit_pile_left}%;"></div>';
let jstpl_climbing_deck='<div id="climbing_deck" class="climbing climbing_deck_back" style="top: ${climbing_deck_top}%; left: \
    ${climbing_deck_left}%;"></div>';
let jstpl_asset_deck='<div id="asset_deck" class="asset asset_deck_back" style="top: ${asset_deckX}%; left: \
    ${asset_deckY}%;"></div>';

// cards and tokens

let jstpl_asset_card='<div id="asset_card_${CARD_ID}" class="asset ${EXTRA_CLASSES}" style="background-position: \
    -${acX}% -${acY}%;"></div>';
let jstpl_summit_beta='<div id="summit_beta_${TOKEN_ID}" class="summit_beta" style="background-position: \
    -${sbX}% -${sbY}%;"></div>';
let jstpl_flip_card='<div id="deck_asset_${asset_id}" class="flip_card ${extra_classes}"> \
    <div class="flip_card_inner"> \
    <div class="flip_card_back ${back_type}"></div> \
    <div class="flip_card_front ${front_type}" style="background-position: -${cX}% -${cY}%;"></div></div></div>';

// tooltips for log
let jstpl_log_asset='<span id="asset_tooltip_${card_key}" class="asset_tooltip">${card_name}</span>';

// miscellany

let jstpl_personal_objective='<div id="personal_objective_${poId}" class="personal_objective" style=" \
    background-position: -${poX}% -${poY}%;"></div>';
let jstpl_spread_slot='<div id="spread_slot${SLOT_NUM}" class="spread" style="top: ${spreadX}%; left: ${spreadY}%;"></div>';
let jstpl_references='<div id="ref_row" class="cp_panel"> \
    <div id="ref_1" class="reference"></div> \
    <div id="ref_2" class="reference"></div> \
    </div>';
let jstpl_water_and_psych='<div id="${player_id}_water_and_psych" class="cp_panel"> \
    <div id="water_icon_${player_id}" class="water_psych water"></div> \
    <span id="water_num_${player_id}" class="panel_num">0</span> \
    <div id="psych_icon_${player_id}" class="water_psych psych"></div> \
    <span id="psych_num_${player_id}" class="panel_num">0</span> \
    </div>';
let jstpl_pp_rope='<div id="${player_id}_rope_counter" class="pp_rope" style="background-position: -${rX}% -${rY}%;"></div> \
    <span id="rope_num_${player_id}" class="panel_num" style="left: -30px;">8</span>';
let jstpl_meeple='<div id="meeple_${player_id}" class="meeple" style="background-position: -${mX}% -${mY}%;"></div>';
let jstpl_skills='<div id=${player_id}_skills" class="cp_panel"> \
    <div id="gear_icon_${player_id}" class="gear" style="background-position: -0% -0%;"></div> \
    <span id="gear_num_${player_id}" class="panel_num resource">0</span> \
    <div id="face_icon_${player_id}" class="skill" style="background-position: -100% -0%;"></div> \
    <span id="face_num_${player_id}" class="panel_num resource">0</span> \
    <div id="crack_icon_${player_id}" class="skill" style="background-position: -0% -0%;"></div> \
    <span id="crack_num_${player_id}" class="panel_num resource">0</span> \
    <div id="slab_icon_${player_id}" class="skill" style="background-position: -200% -0%;"></div> \
    <span id="slab_num_${player_id}" class="panel_num resource">0</span> \
    </div>';
let jstpl_techniques='<div id=${player_id}_techniques"> \
    <div id="precision_icon_${player_id}" class="technique" style="background-position: -200% -0%;"></div> \
    <span id="precision_num_${player_id}" class="panel_num resource">0</span> \
    <div id="balance_icon_${player_id}" class="technique" style="background-position: -100% -0%;"></div> \
    <span id="balance_num_${player_id}" class="panel_num resource">0</span> \
    <div id="pain_tolerance_icon_${player_id}" class="technique" style="background-position: -0% -0%;"></div> \
    <span id="pain_tolerance_num_${player_id}" class="panel_num resource">0</span> \
    <div id="power_icon_${player_id}" class="technique" style="background-position: -300% -0%;"></div> \
    <span id="power_num_${player_id}" class="panel_num resource">0</span> \
    </div>';

</script>  

{OVERALL_GAME_FOOTER}
