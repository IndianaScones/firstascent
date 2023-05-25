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
}