<?php

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function setGlobalVariable(string $name, /*object|array*/ $obj) {
        /*if ($obj == null) {
            throw new \Error('Global Variable null');
        }*/
        $jsonObj = json_encode($obj);
        $this->DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('$name', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
    }

    function getGlobalVariable(string $name, $asArray = null) {
        $json_obj = $this->getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
        if ($json_obj) {
            $object = json_decode($json_obj, $asArray);
            return $object;
        } else {
            return null;
        }
    }

    function getTileCoords($player_count) {
        if ($player_count <= 3) {
            return [
        /*row 1*/   [2.6, 17.88],  [2.55, 25.87],  [2.593, 33.85],  [2.59, 41.85],  [2.57, 49.83], 
                          [2.55, 57.84], [2.56, 65.83], [2.6, 73.84],
        /*row 2*/     [13, 21.9],  [13, 29.86],  [13, 37.86],  [13, 45.85],  [13, 53.85], [13, 61.85], 
                          [13, 69.84],
        /*row 3*/     [23.42, 25.876], [23.42, 33.87], [23.42, 41.85], [23.42, 49.84], [23.415, 57.84], [23.42, 65.86],
        /*row 4*/     [40, 29.87], [40, 37.86], [40, 45.85], [40, 53.85], [40, 61.87],
        /*row 5*/     [50.4, 33.85], [50.4, 41.86], [50.4, 49.84], [50.4, 57.86],
        /*row 6*/     [60.85, 37.86], [60.85, 53.86]
            ];

        } else {
            return [
        /*row 1*/   [2.82, 10.4],  [2.82, 18.32],  [2.82, 26.2],  [2.82, 34.16],  [2.83, 42.04],
                          [2.82, 49.93], [2.82, 57.86], [2.82, 65.79], [2.82, 73.68], [2.82, 81.53],
        /*row 2*/   [13.1, 14.35],  [13.1, 22.28],  [13.1, 30.18],  [13.1, 38.12],  [13.1, 45.99],  
                          [13.1, 53.93], [13.1, 61.82], [13.1, 69.7], [13.1, 77.67],
        /*row 3*/   [23.4, 18.32], [23.4, 26.2], [23.4, 34.11], [23.4, 42.05], [23.4, 49.96], 
                          [23.4, 57.82], [23.4, 65.78], [23.4, 73.687],
        /*row 4*/   [39.82, 22.25], [39.82, 30.14], [39.82, 38.07], [39.82, 45.99], [39.82, 53.89],
                          [39.82, 61.79], [39.82, 69.7],
        /*row 5*/   [50.11, 26.22], [50.11, 34.13], [50.11, 42.03], [50.11, 49.92], [50.11, 57.84],
                          [50.11, 65.73],
        /*row 6*/   [60.44, 30.15], [60.44, 45.99], [60.44, 61.77]
            ];
        }
    }

    function getPitchOrder() {
        return self::getCollectionFromDb('SELECT pitch_location location, pitch_id id FROM board ORDER BY pitch_location', true);
    }

    function getAvailablePitches($current_pitch, $board) {
        $available_pitches = [];
        switch ($current_pitch) {
            case 0:
                $available_pitches = ($board === 'desert') ? [1,2,3,4,5,6,7,8]                     : [1,2,3,4,5,6,7,8,9,10];
                break;
            case 1:
                $available_pitches = ($board === 'desert') ? [2,9]                                 : [2,11];
                break;
            case 2:
                $available_pitches = ($board === 'desert') ? [1,3,9,10]                            : [1,3,11,12];
                break;
            case 3:
                $available_pitches = ($board === 'desert') ? [2,4,10,11]                           : [2,4,12,13];
                break;
            case 4:
                $available_pitches = ($board === 'desert') ? [3,5,11,12]                           : [3,5,13,14];
                break;
            case 5:
                $available_pitches = ($board === 'desert') ? [4,6,12,13]                           : [4,6,14,15];
                break;
            case 6:
                $available_pitches = ($board === 'desert') ? [5,7,13,14]                           : [5,7,15,16];
                break;
            case 7:
                $available_pitches = ($board === 'desert') ? [6,8,14,15]                           : [6,8,16,17];
                break;
            case 8:
                $available_pitches = ($board === 'desert') ? [7,15]                                : [7,9,17,18];
                break;
            case 9:
                $available_pitches = ($board === 'desert') ? [1,2,10,16]                           : [8,10,18,19];
                break;
            case 10:
                $available_pitches = ($board === 'desert') ? [2,3,9,11,16,17]                      : [9,19];
                break;
            case 11:
                $available_pitches = ($board === 'desert') ? [3,4,10,12,17,18]                     : [1,2,12,20];
                break;
            case 12:
                $available_pitches = ($board === 'desert') ? [4,5,11,13,18,19]                     : [2,3,11,13,20,21];
                break;
            case 13:
                $available_pitches = ($board === 'desert') ? [5,6,12,14,19,20]                     : [3,4,12,14,21,22];
                break;
            case 14:
                $available_pitches = ($board === 'desert') ? [6,7,13,15,20,21]                     : [4,5,13,15,22,23];
                break;
            case 15:
                $available_pitches = ($board === 'desert') ? [7,8,14,21]                           : [5,6,14,16,23,24];
                break;
            case 16:
                $available_pitches = ($board === 'desert') ? [9,10,17,18,19,20,21,22,23,24,25,26]  : [6,7,15,17,24,25];
                break;
            case 17:
                $available_pitches = ($board === 'desert') ? [10,11,16,18,19,20,21,22,23,24,25,26] : [7,8,16,18,25,26];
                break;
            case 18:
                $available_pitches = ($board === 'desert') ? [11,12,16,17,19,20,21,22,23,24,25,26] : [8,9,17,19,26,27];
                break;
            case 19:
                $available_pitches = ($board === 'desert') ? [12,13,16,17,18,20,21,22,23,24,25,26] : [9,10,18,27];
                break;
            case 20:
                $available_pitches = ($board === 'desert') ? [13,14,16,17,18,19,21,22,23,24,25,26] : [11,12,21,22,23,24,25,26,27,28,29,30,31,32,33,34];
                break;
            case 21:
                $available_pitches = ($board === 'desert') ? [14,15,16,17,18,19,20,22,23,24,25,26] : [12,13,20,22,23,24,25,26,27,28,29,30,31,32,33,34];
                break;
            case 22:
                $available_pitches = ($board === 'desert') ? [16,17,18,19,20,21,23,24,25,26,27]    : [13,14,20,21,23,24,25,26,27,28,29,30,31,32,33,34];
                break;
            case 23:
                $available_pitches = ($board === 'desert') ? [16,17,18,19,20,21,22,24,25,26,27,28] : [14,15,20,21,22,24,25,26,27,28,29,30,31,32,33,34];
                break;
            case 24:
                $available_pitches = ($board === 'desert') ? [16,17,18,19,20,21,22,23,25,26,28,29] : [15,16,20,21,22,23,25,26,27,28,29,30,31,32,33,34];
                break;
            case 25:
                $available_pitches = ($board === 'desert') ? [16,17,18,19,20,21,22,23,24,26,29,30] : [16,17,20,21,22,23,24,26,27,28,29,30,31,32,33,34];
                break;
            case 26:
                $available_pitches = ($board === 'desert') ? [16,17,18,19,20,21,22,23,24,25,30]    : [17,18,20,21,22,23,24,25,27,28,29,30,31,32,33,34];
                break;
            case 27:
                $available_pitches = ($board === 'desert') ? [22,23,28,31]                         : [18,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34];
                break;
            case 28:
                $available_pitches = ($board === 'desert') ? [23,24,27,29,31]                      : [20,21,22,23,24,25,26,27,29,30,31,32,33,34,35];
                break;
            case 29:
                $available_pitches = ($board === 'desert') ? [24,25,28,30,32]                      : [20,21,22,23,24,25,26,27,28,30,31,32,33,34,35,36];
                break;
            case 30:
                $available_pitches = ($board === 'desert') ? [25,26,29,32]                         : [20,21,22,23,24,25,26,27,28,29,31,32,33,34,36,37];
                break;
            case 31:
                $available_pitches = ($board === 'desert') ? [27,28]                               : [20,21,22,23,24,25,26,27,28,29,30,32,33,34,37,38];
                break;
            case 32:
                $available_pitches = ($board === 'desert') ? [29,30]                               : [20,21,22,23,24,25,26,27,28,29,30,31,33,34,38,39];
                break;
            case 33:
                $available_pitches =                                                                 [20,21,22,23,24,25,26,27,28,29,30,31,32,34,39,40];
                break;
            case 34:
                $available_pitches =                                                                 [20,21,22,23,24,25,26,27,28,29,30,31,32,33,40];
                break;
            case 35:
                $available_pitches =                                                                 [28,29,36,41];
                break;
            case 36:
                $available_pitches =                                                                 [29,30,35,37,41];
                break;
            case 37:
                $available_pitches =                                                                 [30,31,36,38,42];
                break;
            case 38:
                $available_pitches =                                                                 [31,32,37,39,42];
                break;
            case 39:
                $available_pitches =                                                                 [32,33,38,40,43];
                break;
            case 40:
                $available_pitches =                                                                 [33,34,39,43];
                break;
            case 41:
                $available_pitches =                                                                 [35,36];
                break;
            case 42:
                $available_pitches =                                                                 [37,38];
                break;
            case 43:
                $available_pitches =                                                                 [39,40];
                break;
        }
        return $available_pitches;
    }

    function php_debug() {

        //$this->dump("variable", variable);
    }

    function adjacentInArray($arr, $val1, $val2) {

        for ($i=0; $i<count($arr); $i++) {

            if (($arr[$i] === $val1 && $arr[$i+1] === $val2) || ($arr[$i] === $val2 && $arr[$i+1] === $val1)) {
                return true;
            }
        }
        return false;
    }

    function getActivePlayerColor() {
       $player_id = self::getActivePlayerId();
       $players = self::loadPlayersBasicInfos();
       if (isset($players[$player_id]))
           return $players[$player_id]['player_color'];
       else
           return null;
    }

    function getHandAssets($player_id) {
        $sql = "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='asset' AND card_location='$player_id'";
        return self::getCollectionFromDb($sql, true);
    }

    function getBoardAssets($player_id) {
        $played_gear = "{$player_id}_played_gear";
        $played_face = "{$player_id}_played_face";
        $played_crack = "{$player_id}_played_crack";
        $played_slab = "{$player_id}_played_slab";
        $sql = "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE (card_type='asset') AND
                (card_location='$played_gear' OR card_location='$played_face' OR card_location='$played_crack' OR card_location='$played_slab')";
        return self::getCollectionFromDb($sql, true);
    }

    function fillLowerSlot($board_assets, $player_id, $type, $assets, $target_slot, $upper_slots) {

        foreach ($upper_slots as $slot) {
            if (isset($board_assets[$player_id][$type][$slot]) && !empty($board_assets[$player_id][$type][$slot])) {

                $board_assets[$player_id][$type][$target_slot] = $board_assets[$player_id][$type][$slot];
                $board_assets[$player_id][$type]['flipped'][$target_slot] = $board_assets[$player_id][$type]['flipped'][$slot];

                $board_assets[$player_id][$type][$slot] = [];
                $board_assets[$player_id][$type]['flipped'][$slot] = null;

                break;
            }
        }
        return $board_assets;
    }

    function repositionAssetBoard($player_id) {
        $board_assets = $this->getGlobalVariable('board_assets', true);

        foreach($board_assets[$player_id] as $type => $assets) {
            if (empty($assets['1'])) {
                $board_assets = $this->fillLowerSlot($board_assets, $player_id, $type, $assets, '1', ['2', '3', '4', '5']);
            }
            if (empty($board_assets[$player_id][$type]['2'])) {
                $board_assets = $this->fillLowerSlot($board_assets, $player_id, $type, $assets, '2', ['3', '4', '5']);
            }
            if (isset($board_assets[$player_id][$type]['4']) && empty($board_assets[$player_id][$type]['3'])) {
                $board_assets = $this->fillLowerSlot($board_assets, $player_id, $type, $assets, '3', ['4', '5']);
            }
            if (isset($board_assets[$player_id][$type]['5']) && empty($board_assets[$player_id][$type]['4'])) {
                $board_assets = $this->fillLowerSlot($board_assets, $player_id, $type, $assets, '4', ['5']);
            }
        }

        $this->setGlobalVariable('board_assets', $board_assets);
    }

    function getHandSummitBetaTokens($player_id) {
        $sql = "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='summit_beta' AND card_location='$player_id'";
        return self::getCollectionFromDb($sql, true);
    }

    function getAssetType($type_arg) {
        $card = $this->asset_cards[$type_arg];
        foreach($card['skills'] as $type => $val) {
            if ($val == 1) { return $type; }
        }
    }

    function getTechniqueType($type_arg, $player_id=null) {
        $technique = null;
        $card = $this->asset_cards[$type_arg];
        foreach($card['techniques'] as $type => $val) {
            if ($val == 1) { $technique = $type; }
        }

        // sendy jammer
        $player_id = $player_id ?? self::getActivePlayerId();
        $character_id = $this->getGlobalVariable('player_names_and_colors', true)[$player_id]['character'];
        $asset_type = $this->getAssetType($type_arg);
        if ($character_id === '4' && $asset_type === 'gear') { $technique = 'wild'; }

        return $technique;
    }

    function updateResourceTracker($player_id, $operation='add', $water=null, $psych=null, $assets=[], $symbol_token=null, $from_board=false, $to_board=false, $flipped_and_tucked_type_args=[]) {

        $resource_tracker = $this->getGlobalVariable('resource_tracker', true);
        $water_psych_tracker = $this->getGlobalVariable('water_psych_tracker', true);
        $board_assets = $this->getGlobalVariable('board_assets', true);
        $asset_identifier = $this->getGlobalVariable('asset_identifier', true);

        $skills = ['gear', 'face', 'crack', 'slab'];
        $techniques = ['precision', 'balance', 'pain_tolerance', 'power'];
        $multi_tech_assets = ['26', '27', '29', '35', '36'];

        if ($assets != []) {            

            foreach ($assets as $asset) {

                $type = $this->getAssetType($asset);
                $technique = $this->getTechniqueType($asset, $player_id);

                if ($operation === 'add') {
                    if (!$to_board) {
                        $resource_tracker[$player_id]['skills'][$type]++;
                        if ($technique) { $resource_tracker[$player_id]['techniques'][$technique]++; }
                    }

                    else if ($to_board) {
                        $techniques = $resource_tracker[$player_id]['asset_board']['techniques'];
                        $resource_tracker[$player_id]['asset_board']['skills'][$type]++;
                        if ($technique) { $resource_tracker[$player_id]['asset_board']['techniques'][$technique]++; }
                    }
                }

                else if ($operation === 'subtract') {
                    if (!$from_board) {
                        $resource_tracker[$player_id]['skills'][$type]--;
                        if ($technique) { $resource_tracker[$player_id]['techniques'][$technique]--; }

                        if ($to_board) {
                            $resource_tracker[$player_id]['asset_board']['skills'][$type]++;
                            if ($technique) { $resource_tracker[$player_id]['asset_board']['techniques'][$technique]++; }
                        }
                    }

                    else if ($from_board) {
                        $resource_tracker[$player_id]['asset_board']['skills'][$type]--;
                        if (in_array($asset, $flipped_and_tucked_type_args)) {
                            unset($flipped_and_tucked_type_args[array_search($asset, $flipped_and_tucked_type_args)]);
                        }
                        else if ($technique) { $resource_tracker[$player_id]['asset_board']['techniques'][$technique]--; }
                    }
                }
            }
        }

        $character_id = $this->getGlobalVariable('player_names_and_colors', true)[$player_id]['character'];
        $character = $this->characters[$character_id];
        $max_water_psych = ($character['name'] != 'phil') ? 6 : 7;
        $this->setGlobalVariable('max_water_psych', $max_water_psych);

        if ($water && $operation === 'add') {
            $new_num = $resource_tracker[$player_id]['water'] + $water;
            if ($new_num > $max_water_psych) { $new_num = $max_water_psych; }
            else if ($new_num < 0) { $new_num = 0; }
            $resource_tracker[$player_id]['water'] = $new_num;
            $water_psych_tracker[$player_id]['water'] = $new_num;
        }
        else if ($water && $operation === 'subtract') {
            $new_num = $resource_tracker[$player_id]['water'] - $water;
            if ($new_num < 0) { $new_num = 0; }
            $resource_tracker[$player_id]['water'] = $new_num;
            $water_psych_tracker[$player_id]['water'] = $new_num;
        }
        if ($psych && $operation === 'add') {
            $new_num = $resource_tracker[$player_id]['psych'] + $psych;
            if ($new_num > $max_water_psych) { $new_num = $max_water_psych; }
            else if ($new_num < 0) { $new_num = 0; }
            $resource_tracker[$player_id]['psych'] = $new_num;
            $water_psych_tracker[$player_id]['psych'] = $new_num;
        }
        else if ($psych && $operation === 'subtract') {
            $new_num = $resource_tracker[$player_id]['psych'] - $psych;
            if ($new_num < 0) { $new_num = 0; }
            $resource_tracker[$player_id]['psych'] = $new_num;
            $water_psych_tracker[$player_id]['psych'] = $new_num;
        }

        if ($symbol_token) {
            if (in_array($symbol_token, ['gear', 'face', 'crack', 'slab'])) { $symbol_type = 'skills'; }
            else if (in_array($symbol_token, ['precision', 'balance', 'pain_tolerance', 'power'])) { $symbol_type = 'techniques'; }

            if ($operation == 'add') {
                $resource_tracker[$player_id]['symbol_tokens'][$symbol_token]++;
                $resource_tracker[$player_id][$symbol_type][$symbol_token]++;
            } else if ($operation == 'subtract') {
                $resource_tracker[$player_id]['symbol_tokens'][$symbol_token]--;
                $resource_tracker[$player_id][$symbol_type][$symbol_token]--;
            }
        }
        else if ($symbol_token && $operation == 'subtract') { $resource_tracker[$player_id]['symbol_tokens'][$symbol_token]--; }

        $this->setGlobalVariable('resource_tracker', $resource_tracker);
        $this->setGlobalVariable('water_psych_tracker', $water_psych_tracker);
    }

    function drawFromPortaledge($player_id, $type, $card_idx, $remaining_cards) {

        $deck = 'porta' . $type;

        if (count($remaining_cards) === 1) {

            $asset_discard = self::getObjectListFromDb("SELECT card_location_arg, card_type_arg, card_id FROM cards_and_tokens WHERE card_location='discard'");
            $asset_deck = self::getObjectListFromDb("SELECT card_location_arg, card_type_arg, card_id FROM cards_and_tokens WHERE card_location='asset_deck'");

            $sortType = function ($asset) use ($type) {
                switch ($type) {
                    case 'gear':
                        return ($asset['card_type_arg'] >= 22);
                    case 'face':
                        return ($asset['card_type_arg'] >= 15 && $asset['card_type_arg'] <= 21);
                    case 'crack':
                        return ($asset['card_type_arg'] <= 7);
                    case 'slab':
                        return ($asset['card_type_arg'] >= 8 && $asset['card_type_arg'] <= 14);
                    default:
                        return false;
                }
            };
                    
            if ($asset_discard) {
                $discard_type = array_filter($asset_discard, $sortType);
                $discard_num = count($discard_type) <= 7 ? count($discard_type) : 7;
                $discard_to_ledge = array_slice($discard_type, 0, $discard_num);
            } else {
                $discard_num = 0;
                $discard_to_ledge = [];
            }

            if ($discard_num < 7) {

                $deck_type = array_filter($asset_deck, $sortType);
                $deck_num = 7 - $discard_num;
                $deck_to_ledge = array_slice($deck_type, 0, $deck_num);
                $type_to_ledge = array_merge($discard_to_ledge, $deck_to_ledge);
            }
            else { $type_to_ledge = $discard_to_ledge; }

            $refill_portaledge = $this->getGlobalVariable('refill_portaledge', true);
            $refill_portaledge[$deck] = [$discard_num, $card_idx];
            $this->setGlobalVariable('refill_portaledge', $refill_portaledge);

            for ($i=0; $i<=6; $i++) {
                $id = $type_to_ledge[$i]['card_id'];
                $refill = $this->cards_and_tokens->moveCard($id, $deck, $i);
                if ($i+1 <= $discard_num) {
                    $type_arg = $type_to_ledge[$i]['card_type_arg'];
                    $this->updateAssetDiscard($id, $type_arg, 'remove');
                }
            }
            return $this->cards_and_tokens->pickCardForLocation($deck, $player_id);
        }
        else { return $this->cards_and_tokens->pickCardForLocation($deck, $player_id); }
    }

    function checkSpread() {

        $spread_assets = array_keys(self::getCollectionFromDb("SELECT card_id FROM cards_and_tokens WHERE card_location='the_spread'"));
        $first_type = '';
        foreach($spread_assets as $id) {

            $type_arg = $this->getGlobalVariable('asset_identifier', true)[$id];
            $type = $this->getAssetType($type_arg);
            if ($first_type === '') { $first_type = $type; }
            else if ($type != $first_type) { return true; }
        }
        return false;
    }

    function updateAssetDiscard($id, $type_arg, $operation) {

        $asset_discard = $this->getGlobalVariable('asset_discard', true);

        if ($operation === 'add') { $asset_discard[$id] = $type_arg; }
        else if ($operation === 'remove') { unset($asset_discard[$id]); }

        $this->setGlobalVariable('asset_discard', $asset_discard);
    }

    function getCurrentPitch($player_id) {

        $pitch_tracker = $this->getGlobalVariable('pitch_tracker', true)[$player_id];
        $current_hex = end($pitch_tracker);
        $pitch_identifier = $this->getGlobalVariable('pitch_identifier', true);
        $current_pitch = $current_hex != '0' ? $pitch_identifier[$current_hex] : null;

        return $current_pitch;
    }

    function checkForHeadwall() {

        $pitch_tracker = $this->getGlobalVariable('pitch_tracker', true);
        $third_row_min = $this->getGlobalVariable('board') == 'desert' ? 16 : 20;
        $player_count = $this->getPlayersNumber();
        $tile_coords = $this->getTileCoords($player_count);

        foreach($pitch_tracker as $player_id => $pitches) {

            $third_row = array_filter($pitches, function($pitch) use($third_row_min) { return $pitch >= $third_row_min; });
            if ($third_row) {

                $board = self::getCollectionFromDb("SELECT pitch_location location, pitch_id id FROM board", true);
                self::notifyAllPlayers('revealHeadwall', clienttranslate('The Headwall is revealed'), array(
                    'board' => $board,
                    'tile_coords' => $tile_coords,
                ));
                $this->setGlobalVariable('headwall_revealed', true);
                break;
            }
        }
    }

    function bespokeClimbingCard($player_id, $card_type_arg, $choice, $jesus_piece) {

        switch ($card_type_arg) {

            case 55:
            case 68:
                $sunny_players = [];
                $sunny_players_resources = [];
                $players = $this->getGlobalVariable('player_names_and_colors', true);
                foreach ($players as $player_id => $name_and_color) {
                    $current_pitch = $this->getCurrentPitch($player_id);
                    if ($current_pitch) {
                        $pitch_info = $this->pitches[$current_pitch];
                        if ($pitch_info['shade'] === 0 || $pitch_info['shade'] === 2) { $sunny_players[] = $player_id; }
                    }
                }

                if ($card_type_arg == '55' && $choice == 'a') {
                    foreach ($sunny_players as $player_id) {

                        if ($jesus_piece && $player_id == self::getActivePlayerId()) {
                            self::notifyAllPlayers("discardJesusPiece", clienttranslate('${player_name} uses +Jesus Piece(10)+ to avoid the negative effect'), array(
                                'player_name' => self::getActivePlayerName(),
                                'player_id' => $player_id,
                            ));
                            $player_idx = array_search($player_id, $sunny_players);
                            unset($sunny_players[$player_idx]);
                            $sunny_players = array_values($sunny_players);

                            $hand_sb_tokens = $this->getHandSummitBetaTokens($player_id);
                            $jesus_piece_id = array_search('10', $hand_sb_tokens);
                            $this->cards_and_tokens->insertCardOnExtremePosition($jesus_piece_id, 'summit_beta_discard', true);
                            $this->incStat(1, "played_summit_beta_tokens", $player_id);
                        }

                        else { $this->updateResourceTracker($player_id, 'add', -1, null); }
                    }
                }

                else if ($card_type_arg == '68' || $choice == 'b') {
                    foreach ($sunny_players as $player_id) { 
                        $this->updateResourceTracker($player_id, 'add', null, 1);
                    }
                }

                $sunny_players_resources[$player_id] = $this->getGlobalVariable('water_psych_tracker', true)[$player_id];

                $log_message = '';
                foreach ($sunny_players as $player_id) {
                    $player_name = $players[$player_id]['name'];
                    $log_message .= $player_name . ', ';
                }
                $log_message = substr($log_message, 0, -2);
                if (count($sunny_players) < 3) { $log_message = str_replace(',', '', $log_message); }
                $last_space = strrpos($log_message, " ");
                if (count($sunny_players) > 1) { $log_message = substr_replace($log_message, " and ", $last_space, 0); }

                if ($card_type_arg == '55' && $choice == 'a') {
                    $log_message .= count($sunny_players) > 1 ? ' are on a sunny Pitch and lose 1 Water' : ' is on a sunny Pitch and loses 1 Water';
                    $water_or_psych = 'water';
                }

                else if ($card_type_arg == '68' || $choice == 'b') {
                    $log_message .= count($sunny_players) > 1 ? ' are on a sunny Pitch and gain 1 Psych' : ' is on a sunny Pitch and gains 1 Psych';
                    $water_or_psych = 'psych';
                }
                
                if (count($sunny_players) === 0) { $log_message = 'No players are on a sunny Pitch'; }
                self::notifyAllPlayers("sunnyPitch", clienttranslate($log_message), array(
                    'log_message' => $log_message,
                    'sunny_players' => $sunny_players,
                    'sunny_players_resources' => $sunny_players_resources,
                    'water_or_psych' => $water_or_psych,
                ));
                break;
        }
        $this->setGlobalVariable('climbing_card_info', array());
    }

    function sortAssetBoardByFlipped(array $type): array
    {
        $cards = [];
        for ($i = 1; $i <= 4; $i++) {
            $key = (string) $i;
            if (isset($type[$key])) {
                $cards[$key] = $type[$key];
            }
        }

        $flippedStatus = [];
        for ($i = 1; $i <= 4; $i++) {
            $key = (string) $i;
            $flippedStatus[$key] = isset($type['flipped'][$key]) ? (bool) $type['flipped'][$key] : false;
        }

        $sortedCards = [];
        $sortedFlipped = [];

        foreach ($cards as $key => $card) {
            if ($flippedStatus[$key]) {
                $sortedCards[$key] = $card;
                $sortedFlipped[$key] = true;
            }
        }

        foreach ($cards as $key => $card) {
            if (!$flippedStatus[$key]) {
                $sortedCards[$key] = $card;
                $sortedFlipped[$key] = false;
            }
        }

        $finalSortedCards = [];
        $finalSortedFlipped = [];
        $newKeys = ['1', '2', '3', '4'];
        $index = 0;

        foreach ($sortedCards as $key => $card) {
            if ($index < 4) {
                $finalSortedCards[$newKeys[$index]] = $card;
                $finalSortedFlipped[$newKeys[$index]] = $sortedFlipped[$key];
                $index++;
            }
        }

        $final = $finalSortedCards;
        $final['count'] = $type['count'];
        $final['tucked'] = $type['tucked'];
        $final['flipped'] = $finalSortedFlipped;
        $final['permanent'] = $type['permanent'];

        return $final;
    }

    public function debug_goToState(int $state=98) {
        $this->gamestate->jumpToState($state);
    }
}