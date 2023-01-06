<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * FirstAscent implementation : © <Your name here> <Your email address here>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * FirstAscent game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */


/*

Example:

$this->card_types = array(
    1 => array( "card_name" => ...,
                ...
              )
);

*/


$this->pitches = [
    '1' => [
        'name' => 'dinkus_dog',
        'description' => clienttranslate("Dinkus Dog"),
        'tooltip' => clienttranslate(""),
        'value' => 1,
        'type' => 'slab',
        'requirements' => [
            'gear' => null,
            'crack' => null,
            'face' => null,
            'slab' => 2,
            'any_skill' => 1,
            'water' => 1,
            'psych' => null,
        ],
        'personal_objectives' => ['southern_rock', 'a_day_at_the_zoo'],
    ],

    '2' => [
        'name' => 'rogers_roof',
        'description' => clienttranslate("Roger's Roof"),
        'tooltip' => clienttranslate(""),
        'value' => 1,
        'type' => 'roof',
        'requirements' => [
            'gear' => 2,
            'crack' => null,
            'face' => null,
            'slab' => null,
            'any_skill' => 1,
            'water' => 1,
            'psych' => null,
        ],
        'personal_objectives' => ['glory_days_of_the_piton', 'social_butterfly', 'call_it_like_you_see_it'],
    ],

    '3' => [
        'name' => 'corrugation_corner',
        'description' => clienttranslate("Corrugation Corner"),
        'tooltip' => clienttranslate(""),
        'value' => 1,
        'type' => 'corner',
        'requirements' => [
            'gear' => 2,
            'crack' => null,
            'face' => null,
            'slab' => null,
            'any_skill' => 1,
            'water' => 1,
            'psych' => null,
        ],
        'personal_objectives' => ['glory_days_of_the_piton', 'call_it_like_you_see_it'],
    ],

    '4' => [
        'name' => 'rebuffats_arete',
        'description' => clienttranslate("Rebuffat's Arete"),
        'tooltip' => clienttranslate(""),
        'value' => 1,
        'type' => 'arete',
        'requirements' => [
            'gear' => 1,
            'crack' => null,
            'face' => null,
            'slab' => null,
            'any_skill' => 1,
            'water' => 2,
            'psych' => null,
        ],
        'personal_objectives' => ['glory_days_of_the_piton', 'social_butterfly', 'climb_your_way_out,', 
                                  'call_it_like_you_see_it', 'rocky_mountains_tour'],
    ],

    '5' => [
        'name' => 'leap_year_flake',
        'name' => clienttranslate("Leap Year Flake"),
        'tooltip' => clienttranslate(""),
        'value' => 1,
        'type' => 'flake',
        'requirements' => [
            'gear' => 1,
            'crack' => null,
            'face' => 1,
            'slab' => null,
            'any_skill' => 1,
            'water' => 1,
            'psych' => null,
        ],
        'personal_objectives' => ['national_parks_pass', 'call_it_like_you_see_it', 'desert_days'],
    ],

    '6' => [
        'name' => 'half-a-finger',
        'description' => clienttranslate("Half-a-finger"),
        'tooltip' => clienttranslate(""),
        'value' => 1,
        'type' => 'crack',
        'requirements' => [
            'gear' => null,
            'crack' => 1,
            'face' => null,
            'slab' => null,
            'any_skill' => 1,
            'water' => 2,
            'psych' => null,
        ],
        'personal_objectives' => ['full_body_workout', 'climb_your_way_out'],
    ],

    '7' => [
        'name' => 'bird_cage',
        'description' => clienttranslate("Bird Cage"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'roof',
        'requirements' => [
            'gear' => 1,
            'crack' => null,
            'face' => 1,
            'slab' => 1,
            'any_skill' => null,
            'water' => null,
            'psych' => 2,
        ],
        'personal_objectives' => ['a_day_at_the_zoo', 'glory_days_of_the_piton'],
    ],

    '8' => [
        'name' => 'bishop_jaggers',
        'description' => clienttranslate("Bishop Jaggers"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'slab',
        'requirements' => [
            'gear' => 1,
            'crack' => null,
            'face' => null,
            'slab' => 2,
            'any_skill' => null,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['glory_days_of_the_piton', 'social_butterfly', 'rocky_mountains_tour'],
    ],

    '9' => [
        'name' => 'closer_to_the_heart',
        'description' => clienttranslate("Closer to the Heart"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'slab',
        'requirements' => [
            'gear' => 2,
            'crack' => null,
            'face' => 1,
            'slab' => 2,
            'any_skill' => null,
            'water' => null,
            'psych' => null,
        ],
        'personal_objectives' => ['full_body_workout', 'southern_rock'],
    ],

    '10' => [
        'name' => 'irenes_arete',
        'description' => clienttranslate("Irene's Arete"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'arete',
        'requirements' => [
            'gear' => 1,
            'crack' => 1,
            'face' => 2,
            'slab' => null,
            'any_skill' => null,
            'water' => 1,
            'psych' => null,
        ],
        'personal_objectives' => ['national_parks_pass', 'social_butterfly', 'glory_days_of_the_piton',
                                  'call_it_like_you_see_it', 'rocky_mountains_tour'],
    ],

    '11' => [
        'name' => 'flight_of_the_gumby',
        'description' => clienttranslate("Flight of the Gumby"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'arete',
        'requirements' => [
            'gear' => null,
            'crack' => 2,
            'face' => 1,
            'slab' => 1,
            'any_skill' => null,
            'water' => null,
            'psych' => 1,
        ],
        'personal_objectives' => ['sporty_spice', 'climb_your_way_out', 'southern_rock',
                                  'national_parks_pass'],
    ],

    '12' => [
        'name' => 'bee_sting_corner',
        'description' => clienttranslate("Bee Sting Corner"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'corner',
        'requirements' => [
            'gear' => 2,
            'crack' => null,
            'face' => null,
            'slab' => 1,
            'any_skill' => null,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'a_day_at_the_zoo', 'southern_rock'],
    ],

    '13' => [
        'name' => 'black_snake',
        'description' => clienttranslate("Black Snake"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'corner',
        'requirements' => [
            'gear' => 2,
            'crack' => null,
            'face' => 1,
            'slab' => 1,
            'any_skill' => null,
            'water' => 1,
            'psych' => null,
        ],
        'personal_objectives' => ['rainbow_vibes', 'climb_your_way_out', 'rocky_mountains_tour',
                                  'national_parks_pass', 'a_day_at_the_zoo'],
    ],

    '14' => [
        'name' => 'flakes_of_wrath',
        'description' => clienttranslate("Flakes of Wrath"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'flake',
        'requirements' => [
            'gear' => null,
            'crack' => null,
            'face' => 1,
            'slab' => 1,
            'any_skill' => null,
            'water' => 1,
            'psych' => 2,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'desert_days'],
    ],

    '15' => [
        'name' => 'the_fickle_finger_of_fate',
        'description' => clienttranslate("The Fickle Finger of Fate"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'flake',
        'requirements' => [
            'gear' => null,
            'crack' => 2,
            'face' => 2,
            'slab' => 1,
            'any_skill' => null,
            'water' => null,
            'psych' => null,
        ],
        'personal_objectives' => ['full_body_workout'],
    ],

    '16' => [
        'name' => 'dr_rubos_wild_ride',
        'description' => clienttranslate("Dr. Rubo's Wild Ride"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'crack',
        'requirements' => [
            'gear' => null,
            'crack' => 2,
            'face' => 1,
            'slab' => null,
            'any_skill' => null,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['social_butterfly', 'desert_days'],
    ],

    '17' => [
        'name' => 'skull',
        'description' => clienttranslate("Skull"),
        'tooltip' => clienttranslate(""),
        'value' => 2,
        'type' => 'crack',
        'requirements' => [
            'gear' => 2,
            'crack' => 1,
            'face' => 1,
            'slab' => 1,
            'any_skill' => null,
            'water' => null,
            'psych' => null,
        ],
        'personal_objectives' => ['desert_days', 'full_body_workout'],
    ],

    '18' => [
        'name' => 'screaming_yellow_zonkers',
        'description' => clienttranslate("Screaming Yellow Zonkers"),
        'tooltip' => clienttranslate(""),
        'value' => 3,
        'type' => 'slab',
        'requirements' => [
            'gear' => 1,
            'crack' => 1,
            'face' => 2,
            'slab' => 2,
            'any_skill' => null,
            'water' => null,
            'psych' => null,
        ],
        'personal_objectives' => ['sporty_spice', 'rainbow_vibes'],
    ],

    '19' => [
        'name' => 'the_don_juan_wall',
        'description' => clienttranslate("The Don Juan Wall"),
        'tooltip' => clienttranslate(""),
        'value' => 3,
        'type' => 'corner',
        'requirements' => [
            'gear' => 3,
            'crack' => 2,
            'face' => 1,
            'slab' => null,
            'any_skill' => null,
            'water' => null,
            'psych' => null,
        ],
        'personal_objectives' => ['social_butterfly'],
    ],

    '20' => [
        'name' => 'bloody_fingers',
        'description' => clienttranslate("Bloody Fingers"),
        'tooltip' => clienttranslate(""),
        'value' => 3,
        'type' => 'crack',
        'requirements' => [
            'gear' => 2,
            'crack' => 2,
            'face' => 2,
            'slab' => null,
            'any_skill' => null,
            'water' => null,
            'psych' => null,
        ],
        'personal_objectives' => ['full_body_workout'],
    ],

    '21' => [
        'name' => 'black_elk',
        'description' => clienttranslate("Black Elk"),
        'tooltip' => clienttranslate(""),
        'value' => 3,
        'type' => 'roof',
        'requirements' => [
            'gear' => null,
            'crack' => 2,
            'face' => null,
            'slab' => 2,
            'any_skill' => null,
            'water' => null,
            'psych' => 2,
        ],
        'personal_objectives' => ['rainbow_vibes', 'a_day_at_the_zoo', 'rocky_mountains_tour'],
    ],

    '22' => [
        'name' => 'tierrany',
        'description' => clienttranslate("Tierrany"),
        'tooltip' => clienttranslate(""),
        'value' => 4,
        'type' => 'roof',
        'requirements' => [
            'gear' => 2,
            'crack' => 2,
            'face' => 3,
            'slab' => null,
            'any_skill' => null,
            'water' => null,
            'psych' => null,
        ],
        'personal_objectives' => ['sporty_spice', 'southern_rock'],
    ],

    '23' => [
        'name' => 'abracadaver',
        'description' => clienttranslate("Abracadaver"),
        'tooltip' => clienttranslate(""),
        'value' => 4,
        'type' => 'crack',
        'requirements' => [
            'gear' => 2,
            'crack' => 2,
            'face' => null,
            'slab' => 1,
            'any_skill' => null,
            'water' => 2,
            'psych' => null,
        ],
        'personal_objectives' => ['desert_days'],
    ],

    '24' => [
        'name' => 'bulldog_arete',
        'description' => clienttranslate("Bulldog Arete"),
        'tooltip' => clienttranslate(""),
        'value' => 4,
        'type' => 'arete',
        'requirements' => [
            'gear' => 1,
            'crack' => 1,
            'face' => 1,
            'slab' => 2,
            'any_skill' => null,
            'water' => null,
            'psych' => 2,
        ],
        'personal_objectives' => ['sporty_spice', 'call_it_like_you_see_it', 'a_day_at_the_zoo',
                                  'rocky_mountains_tour', 'climb_your_way_out'],
    ],

    '25' => [
        'name' => 'red_rider',
        'description' => clienttranslate("Red Rider"),
        'tooltip' => clienttranslate(""),
        'value' => 4,
        'type' => 'flake',
        'requirements' => [
            'gear' => 3,
            'crack' => 1,
            'face' => 1,
            'slab' => 1,
            'any_skill' => null,
            'water' => null,
            'psych' => 1,
        ],
        'personal_objectives' => ['rainbow_vibes', 'sporty_spice', 'rocky_mountains_tour'],
    ],

    '26' => [
        'name' => 'tooth_or_consequences',
        'description' => clienttranslate("Tooth or Consequences"),
        'tooltip' => clienttranslate(""),
        'value' => 4,
        'type' => 'slab',
        'requirements' => [
            'gear' => 1,
            'crack' => 1,
            'face' => null,
            'slab' => 2,
            'any_skill' => null,
            'water' => 2,
            'psych' => 1,
        ],
        'personal_objectives' => ['desert_days', 'full_body_workout'],
    ],

    '27' => [
        'name' => 'slab_aptitude_test',
        'description' => clienttranslate("The S.A.T. (Slab Aptitude Test)"),
        'tooltip' => clienttranslate(""),
        'value' => 5,
        'type' => 'slab',
        'requirements' => [
            'gear' => 2,
            'crack' => null,
            'face' => null,
            'slab' => 3,
            'any_skill' => null,
            'water' => 1,
            'psych' => 2,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'sporty_spice'],
    ],

    '28' => [
        'name' => 'desert_gold',
        'description' => clienttranslate("Desert Gold"),
        'tooltip' => clienttranslate(""),
        'value' => 5,
        'type' => 'roof',
        'requirements' => [
            'gear' => 1,
            'crack' => 2,
            'face' => 2,
            'slab' => null,
            'any_skill' => null,
            'water' => 2,
            'psych' => 1,
        ],
        'personal_objectives' => ['rainbow_vibes', 'desert_days', 'climb_your_way_out'],
    ],

    '29' => [
        'name' => 'no_place_like_home',
        'description' => clienttranslate("No Place Like Home"),
        'tooltip' => clienttranslate(""),
        'value' => 5,
        'type' => 'arete',
        'requirements' => [
            'gear' => 2,
            'crack' => null,
            'face' => 2,
            'slab' => 1,
            'any_skill' => null,
            'water' => 1,
            'psych' => 2,
        ],
        'personal_objectives' => ['sporty_spice', 'southern_rock', 'climb_your_way_out'],
    ],

    '30' => [
        'name' => 'teflon_corner',
        'description' => clienttranslate("Teflon Corner"),
        'tooltip' => clienttranslate(""),
        'value' => 5,
        'type' => 'corner',
        'requirements' => [
            'gear' => 3,
            'crack' => 1,
            'face' => 1,
            'slab' => 1,
            'any_skill' => null,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'glory_days_of_the_piton', 'national_parks_pass'],
    ],

    '31' => [
        'name' => 'scarlet_begonias',
        'description' => clienttranslate("Scarlet Begonias"),
        'tooltip' => clienttranslate(""),
        'value' => 5,
        'type' => 'flake',
        'requirements' => [
            'gear' => 1,
            'crack' => 1,
            'face' => 3,
            'slab' => 1,
            'any_skill' => null,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['rainbow_vibes', 'national_parks_pass', 'desert_days'],
    ],

    '32' => [
        'name' => 'belly_full_of_bad_berries',
        'description' => clienttranslate("Belly Full of Bad Berries"),
        'tooltip' => clienttranslate(""),
        'value' => 5,
        'type' => 'crack',
        'requirements' => [
            'gear' => 2,
            'crack' => 3,
            'face' => null,
            'slab' => null,
            'any_skill' => null,
            'water' => 1,
            'psych' => 2,
        ],
        'personal_objectives' => ['desert_days', 'full_body_workout'],
    ],

    '33' => [
        'name' => 'the_trifecta'],
        'description' => clienttranslate("The Trifecta"),
        'tooltip' => clienttranslate(""),
        'value' => 3,
        'type' => 'wild',
        'requirements' => [
            'gear' => 2,
            'crack' => 1,
            'face' => 1,
            'slab' => 1,
            'any_skill' => 1,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => [],
];

