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
        /*row 2*/     [13, 21.87],  [13, 29.86],  [13, 37.86],  [13, 45.85],  [13, 53.85], [13, 61.85], 
                          [13, 69.84],
        /*row 3*/     [23.42, 25.876], [23.42, 33.87], [23.42, 41.85], [23.42, 49.84], [23.415, 57.84], [23.42, 65.86],
        /*row 4*/     [40, 29.87], [40, 37.86], [40, 45.85], [40, 53.85], [40, 61.87],
        /*row 5*/     [50.4, 33.85], [50.4, 41.86], [50.4, 49.84], [50.4, 57.86],
        /*row 6*/     [60.85, 37.86], [60.85, 53.86]
            ];

        } else {
            return [
        /*row 1*/   [2.82, 10.4],  [2.82, 18.32],  [2.82, 26.2],  [2.82, 34.14],  [2.82, 42.04],
                          [2.82, 49.93], [2.82, 57.89], [2.82, 65.74], [2.82, 73.64], [2.82, 81.53],
        /*row 2*/   [13.1, 14.35],  [13.1, 22.25],  [13.1, 30.15],  [13.1, 38.06],  [13.1, 53.87],  
                          [13.1, 61.79], [13.1, 69.7], [13.1, 77.59], [13.1, 77.6],
        /*row 3*/   [23.4, 18.3], [23.4, 26.2], [23.4, 34.11], [23.4, 42.02], [23.4, 49.93], 
                          [23.4, 57.82], [23.4, 65.74], [23.4, 73.64],
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

    function getAvailablePitches($current_pitch) {
        $available_pitches = [];
        switch ($current_pitch) {
            case false:
                $available_pitches = [1,2,3,4,5,6,7,8];
                break;
            case 1:
                $available_pitches = [2,9];
                break;
            case 2:
                $available_pitches = [1,3,9,10];
                break;
            case 3:
                $available_pitches = [2,4,10,11];
                break;
            case 4:
                $available_pitches = [3,5,11,12];
                break;
            case 5:
                $available_pitches = [4,6,12,13];
                break;
            case 6:
                $available_pitches = [5,7,13,14];
                break;
            case 7:
                $available_pitches = [6,8,14,15];
                break;
            case 8:
                $available_pitches = [7,15];
                break;
            case 9:
                $available_pitches = [1,2,10,16];
                break;
            case 10:
                $available_pitches = [2,3,9,11,16,17];
                break;
            case 11:
                $available_pitches = [3,4,10,12,17,18];
                break;
            case 12:
                $available_pitches = [4,5,11,13,18,19];
                break;
            case 13:
                $available_pitches = [5,6,12,14,19,20];
                break;
            case 14:
                $available_pitches = [6,7,13,15,20,21];
                break;
            case 15:
                $available_pitches = [7,8,14,21];
                break;
            case 16:
                $available_pitches = [9,10,17,18,19,20,21,22,23,24,25,26];
                break;
            case 17:
                $available_pitches = [10,11,16,18,19,20,21,22,23,24,25,26];
                break;
            case 18:
                $available_pitches = [11,12,16,17,19,20,21,22,23,24,25,26];
                break;
            case 19:
                $available_pitches = [12,13,16,17,18,20,21,22,23,24,25,26];
                break;
            case 20:
                $available_pitches = [13,14,16,17,18,19,21,22,23,24,25,26];
                break;
            case 21:
                $available_pitches = [14,15,16,17,18,19,20,22,23,24,25,26];
                break;
            case 22:
                $available_pitches = [16,17,18,19,20,21,23,24,25,26,27];
                break;
            case 23:
                $available_pitches = [16,17,18,19,20,21,23,24,25,26,27,28];
                break;
            case 24:
                $available_pitches = [16,17,18,19,20,21,22,23,25,26,28,29];
                break;
            case 25:
                $available_pitches = [16,17,18,19,20,21,22,23,24,26,29,30];
                break;
            case 26:
                $available_pitches = [16,17,18,19,20,21,22,23,24,25,30];
                break;
            case 27:
                $available_pitches = [22,23,28,31];
                break;
            case 28:
                $available_pitches = [23,24,27,29,31];
                break;
            case 29:
                $available_pitches = [24,25,28,30,32];
                break;
            case 30:
                $available_pitches = [25,26,29,32];
                break;
            case 31:
                $available_pitches = [27,28];
                break;
            case 32:
                $available_pitches = [29,30];
                break;
        }
        return $available_pitches;
    }

    function php_debug() {

        //$this->dump("variable", variable);
    }

    function getActivePlayerColor() {
       $player_id = self::getActivePlayerId();
       $players = self::loadPlayersBasicInfos();
       if (isset($players[$player_id]))
           return $players[$player_id]['player_color'];
       else
           return null;
    }

    function getPlayerAssets($player_id) {
        $sql = "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='asset' AND card_location='$player_id'";
        return self::getCollectionFromDb($sql, true);
    }

    function getPlayerTokens($player_id) {
        $sql = "SELECT card_id, card_type_arg FROM cards_and_tokens WHERE card_type='summit_beta' AND card_location='$player_id'";
        return self::getCollectionFromDb($sql, true);
    }

    function updateResourceTracker($player_id, $assets, $operation='add') {
        $resource_tracker = $this->getGlobalVariable('resource_tracker', true);
        $skills = ['gear', 'face', 'crack', 'slab'];
        $techniques = ['precision', 'balance', 'pain_tolerance', 'power'];

        foreach ($assets as $asset) {
            $asset_skills = $this->asset_cards[$asset]['skills'];
            $asset_techniques = $this->asset_cards[$asset]['techniques'];

            if ($operation === 'add') { 
                for ($i=0; $i<4; $i++) {
                    $skill = $skills[$i];
                    $technique = $techniques[$i];
                    $resource_tracker[$player_id]['skills'][$skill] += $asset_skills[$skill];
                    $resource_tracker[$player_id]['techniques'][$technique] += $asset_techniques[$technique];
                }
            }
            else if ($operation === 'subtract') { 
                for ($i=0; $i<4; $i++) {
                    $skill = $skills[$i];
                    $technique = $techniques[$i];
                    $resource_tracker[$player_id]['skills'][$skill] -= $asset_skills[$skill];
                    $resource_tracker[$player_id]['techniques'][$technique] -= $asset_techniques[$technique];
                }
            }
        }
        $this->setGlobalVariable('resource_tracker', $resource_tracker);
    }
}