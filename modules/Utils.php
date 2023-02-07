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

    function getCurrentObjectives() {
        return [
            self::getGameStateValue('shared_objective_1'),
            self::getGameStateValue('shared_objective_2'),
            self::getGameStateValue('shared_objective_3')
        ];
    }

    function getTileCoords() {
        if (self::getGameStateValue('player_count') === '1') {
            return [
        /*player_count*/ 1,

        /*row 1*/   [ [17.4, 181.2],  [17.2, 262],  [17.2, 342.95],  [17.55, 423.9],  [17.55, 504.9], 
                          [17.2, 585.9], [17.55, 666.9], [17.35, 747.7],
        /*row 2*/     [87.75, 221.4],  [87.75, 302.4],  [87.35, 383.6],  [87.75, 464.4],  [87.35, 545.4], [87.75, 626.4], 
                          [87.75, 707.4],
        /*row 3*/     [157.8, 262.4], [157.8, 342.9], [157.95, 423.9], [157.8, 504.9], [157.8, 585.9], [157.8, 666.7],
        /*row 4*/     [269.5, 302.55], [269.5, 383.6], [269.5, 464.55], [269.5, 545.4], [269.5, 626.35],
        /*row 5*/     [339.8, 342.95], [339.8, 423.9], [339.8, 504.85], [339.8, 585.9],
        /*row 6*/     [409.725, 383.6], [409.725, 545.4] ]
            ];

        } else {
            return [
        /*player_count*/ 2,

        /*row 1*/   [ [19.25, 105.3],  [19.25, 185.55],  [19.25, 265.55],  [19.25, 345.65],  [19.25, 425.75],
                          [19.25, 505.8], [19.25, 585.8], [19.25, 665.8], [19.25, 745.75], [19.25, 825.65],
        /*row 2*/   [88.75, 145.5],  [88.75, 225.68],  [88.75, 305.55],  [88.75, 385.55],  [88.75, 465.6],  
                          [88.75, 545.7], [88.75, 625.85], [88.75, 705.8], [88.75, 785.95],
        /*row 3*/   [158.1, 185.5], [158.1, 265.5], [158.1, 345.5], [158.4, 425.65], [158.3, 505.65], 
                          [158.1, 585.8], [158.3, 665.7], [158.3, 745.7],
        /*row 4*/   [268.75, 225.45], [268.75, 305.45], [268.75, 385.55], [268.75, 465.55], [268.75, 545.7],
                          [268.75, 625.7], [268.75, 705.7],
        /*row 5*/   [338, 265.4], [338.15, 345.5], [338.15, 425.5], [338.15, 505.5], [338.15, 585.5],
                          [338.15, 665.5],
        /*row 6*/   [407.5, 305.45], [407.5, 465.65], [407.5, 625.59] ]
            ];
        }
    }

    function getPitchOrder() {
        return self::getCollectionFromDb('SELECT pitch_location location, pitch_id id FROM board ORDER BY pitch_location', true);
    }

    function php_debug() {

        //$this->dump("player_count", self::getGameStateValue('player_count'));
        //$this->dump("getTileCoords", $this->getTileCoords());
        //$this->dump("variable", variable);
    }
}