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
        'description' => _("Dinkus Dog"),
        'value' => 1,
        'type' => 'slab',
        'type_description' => _("Slab"),
        'shade' => 1,
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
        'x_y' => [0, 0],
    ],

    '2' => [
        'name' => 'rogers_roof',
        'description' => _("Roger's Roof"),
        'value' => 1,
        'type' => 'roof',
        'type_description' => _("Roof"),
        'shade' => 0,
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
        'x_y' => [100, 0],
    ],

    '3' => [
        'name' => 'corrugation_corner',
        'description' => _("Corrugation Corner"),
        'value' => 1,
        'type' => 'corner',
        'type_description' => _("Corner"),
        'shade' => 0,
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
        'x_y' => [200, 0],
    ],

    '4' => [
        'name' => 'rebuffats_arete',
        'description' => _("Rebuffat's Arete"),
        'value' => 1,
        'type' => 'arete',
        'type_description' => _("Arete"),
        'shade' => 1,
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
        'x_y' => [300, 0],
    ],

    '5' => [
        'name' => 'leap_year_flake',
        'description' => _("Leap Year Flake"),
        'value' => 1,
        'type' => 'flake',
        'type_description' => _("Flake"),
        'shade' => 1,
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
        'x_y' => [400, 0],
    ],

    '6' => [
        'name' => 'half-a-finger',
        'description' => _("Half-a-finger"),
        'value' => 1,
        'type' => 'crack',
        'type_description' => _("Crack"),
        'shade' => 0,
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
        'x_y' => [500, 0],
    ],

    '7' => [
        'name' => 'fiddler_on_the_roof',
        'description' => _("Fiddler on the Roof"),
        'value' => 1,
        'type' => 'roof',
        'type_description' => _("Roof"),
        'shade' => 1,
        'requirements' => [
            'gear' => 2,
            'crack' => null,
            'face' => 1,
            'slab' => null,
            'any_skill' => 1,
            'water' => null,
            'psych' => null,
        ],
        'personal_objectives' => ['desert_days', 'call_it_like_you_see_it', 'climb_your_way_out'],
        'x_y' => [600, 0],
    ],

    '8' => [
        'name' => 'edge_of_time',
        'description' => _("Edge of Time"),
        'value' => 1,
        'type' => 'arete',
        'type_description' => _("Arete"),
        'shade' => 1,
        'requirements' => [
            'gear' => 1,
            'crack' => null,
            'face' => 1,
            'slab' => null,
            'any_skill' => 1,
            'water' => 1,
            'psych' => null,
        ],
        'personal_objectives' => ['sporty_spice', 'rocky_mountains_tour'],
        'x_y' => [700, 0],
    ],

    '9' => [
        'name' => 'chapel_pond_slab',
        'description' => _("Chapel Pond Slab"),
        'value' => 1,
        'type' => 'slab',
        'type_description' => _("Slab"),
        'shade' => 0,
        'requirements' => [
            'gear' => null,
            'crack' => null,
            'face' => null,
            'slab' => 1,
            'any_skill' => 1,
            'water' => null,
            'psych' => 2,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'glory_days_of_the_piton'],
        'x_y' => [800, 0],
    ],

    '10' => [
        'name' => 'old_man',
        'description' => _("Old Man"),
        'value' => 1,
        'type' => 'corner',
        'type_description' => _("Corner"),
        'shade' => 1,
        'requirements' => [
            'gear' => null,
            'crack' => null,
            'face' => 1,
            'slab' => 1,
            'any_skill' => 1,
            'water' => null,
            'psych' => 1,
        ],
        'personal_objectives' => ['desert_days'],
        'x_y' => [900, 0],
    ],

    '11' => [
        'name' => 'outer_space',
        'description' => _("Outer Space"),
        'value' => 1,
        'type' => 'crack',
        'type_description' => _("Crack"),
        'shade' => 1,
        'requirements' => [
            'gear' => null,
            'crack' => 1,
            'face' => null,
            'slab' => 1,
            'any_skill' => 1,
            'water' => null,
            'psych' => 1,
        ],
        'personal_objectives' => ['glory_days_of_the_piton'],
        'x_y' => [1000, 0],
    ],

    '12' => [
        'name' => 'the_beast_flake',
        'description' => _("The Beast Flake"),
        'value' => 1,
        'type' => 'flake',
        'type_description' => _("Flake"),
        'shade' => 1,
        'requirements' => [
            'gear' => null,
            'crack' => null,
            'face' => 1,
            'slab' => 2,
            'any_skill' => 1,
            'water' => null,
            'psych' => null,
        ],
        'personal_objectives' => ['call_it_like_you_see_it'],
        'x_y' => [1100, 0],
    ],

    '13' => [
        'name' => 'bird_cage',
        'description' => _("Bird Cage"),
        'value' => 2,
        'type' => 'roof',
        'type_description' => _("Roof"),
        'shade' => 0,
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
        'x_y' => [0, 100],
    ],

    '14' => [
        'name' => 'bishop_jaggers',
        'description' => _("Bishop Jaggers"),
        'value' => 2,
        'type' => 'slab',
        'type_description' => _("Slab"),
        'shade' => 1,
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
        'x_y' => [100, 100],
    ],

    '15' => [
        'name' => 'closer_to_the_heart',
        'description' => _("Closer to the Heart"),
        'value' => 2,
        'type' => 'slab',
        'type_description' => _("Slab"),
        'shade' => 0,
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
        'x_y' => [200, 100],
    ],

    '16' => [
        'name' => 'irenes_arete',
        'description' => _("Irene's Arete"),
        'value' => 2,
        'type' => 'arete',
        'type_description' => _("Arete"),
        'shade' => 0,
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
        'x_y' => [300, 100],
    ],

    '17' => [
        'name' => 'flight_of_the_gumby',
        'description' => _("Flight of the Gumby"),
        'value' => 2,
        'type' => 'arete',
        'type_description' => _("Arete"),
        'shade' => 1,
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
        'x_y' => [400, 100],
    ],

    '18' => [
        'name' => 'bee_sting_corner',
        'description' => _("Bee Sting Corner"),
        'value' => 2,
        'type' => 'corner',
        'type_description' => _("Corner"),
        'shade' => 0,
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
        'x_y' => [500, 100],
    ],

    '19' => [
        'name' => 'black_snake',
        'description' => _("Black Snake"),
        'value' => 2,
        'type' => 'corner',
        'type_description' => _("Corner"),
        'shade' => 1,
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
        'x_y' => [600, 100],
    ],

    '20' => [
        'name' => 'flakes_of_wrath',
        'description' => _("Flakes of Wrath"),
        'value' => 2,
        'type' => 'flake',
        'type_description' => _("Flake"),
        'shade' => 0,
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
        'x_y' => [700, 100],
    ],

    '21' => [
        'name' => 'the_fickle_finger_of_fate',
        'description' => _("The Fickle Finger of Fate"),
        'value' => 2,
        'type' => 'flake',
        'type_description' => _("Flake"),
        'shade' => 0,
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
        'x_y' => [800, 100],
    ],

    '22' => [
        'name' => 'dr_rubos_wild_ride',
        'description' => _("Dr. Rubo's Wild Ride"),
        'value' => 2,
        'type' => 'crack',
        'type_description' => _("Crack"),
        'shade' => 1,
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
        'x_y' => [900, 100],
    ],

    '23' => [
        'name' => 'skull',
        'description' => _("Skull"),
        'value' => 2,
        'type' => 'crack',
        'type_description' => _("Crack"),
        'shade' => 0,
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
        'x_y' => [1000, 100],
    ],

    '24' => [
        'name' => 'bonnies_roof',
        'description' => _("Bonnie's Roof"),
        'value' => 2,
        'type' => 'roof',
        'type_description' => _("Roof"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'crack' => 1,
            'face' => null,
            'slab' => null,
            'any_skill' => null,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'glory_days_of_the_piton', 'social_butterfly'],
        'x_y' => [1100, 100],
    ],

    '25' => [
        'name' => 'screaming_yellow_zonkers',
        'description' => _("Screaming Yellow Zonkers"),
        'value' => 3,
        'type' => 'slab',
        'type_description' => _("Slab"),
        'shade' => 1,
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
        'x_y' => [0, 200],
    ],

    '26' => [
        'name' => 'the_don_juan_wall',
        'description' => _("The Don Juan Wall"),
        'value' => 3,
        'type' => 'corner',
        'type_description' => _("Corner"),
        'shade' => 0,
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
        'x_y' => [100, 200],
    ],

    '27' => [
        'name' => 'bloody_fingers',
        'description' => _("Bloody Fingers"),
        'value' => 3,
        'type' => 'crack',
        'type_description' => _("Crack"),
        'shade' => 0,
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
        'x_y' => [200, 200],
    ],

    '28' => [
        'name' => 'black_elk',
        'description' => _("Black Elk"),
        'value' => 3,
        'type' => 'roof',
        'type_description' => _("Roof"),
        'shade' => 1,
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
        'x_y' => [300, 200],
    ],

    '29' => [
        'name' => 'tierrany',
        'description' => _("Tierrany"),
        'value' => 4,
        'type' => 'roof',
        'type_description' => _("Roof"),
        'shade' => 0,
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
        'x_y' => [400, 200],
    ],

    '30' => [
        'name' => 'abracadaver',
        'description' => _("Abracadaver"),
        'value' => 4,
        'type' => 'crack',
        'type_description' => _("Crack"),
        'shade' => 1,
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
        'x_y' => [500, 200],
    ],

    '31' => [
        'name' => 'bulldog_arete',
        'description' => _("Bulldog Arete"),
        'value' => 4,
        'type' => 'arete',
        'type_description' => _("Arete"),
        'shade' => 0,
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
        'x_y' => [600, 200],
    ],

    '32' => [
        'name' => 'red_rider',
        'description' => _("Red Rider"),
        'value' => 4,
        'type' => 'flake',
        'type_description' => _("Flake"),
        'shade' => 0,
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
        'x_y' => [700, 200],
    ],

    '33' => [
        'name' => 'tooth_or_consequences',
        'description' => _("Tooth or Consequences"),
        'value' => 4,
        'type' => 'slab',
        'type_description' => _("Slab"),
        'shade' => 0,
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
        'x_y' => [800, 200],
    ],

    '34' => [
        'name' => 'lonesome_dove',
        'description' => _("Lonesome Dove"),
        'value' => 3,
        'type' => 'arete',
        'type_description' => _("Arete"),
        'shade' => 0,
        'requirements' => [
            'gear' => 1,
            'crack' => 1,
            'face' => 2,
            'slab' => null,
            'any_skill' => null,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['sporty_spice', 'a_day_at_the_zoo'],
        'x_y' => [900, 200],
    ],

    '35' => [
        'name' => 'heart_of_the_country',
        'description' => _("Heart of the Country"),
        'value' => 3,
        'type' => 'flake',
        'type_description' => _("Flake"),
        'shade' => 0,
        'requirements' => [
            'gear' => 1,
            'crack' => 1,
            'face' => null,
            'slab' => 1,
            'any_skill' => null,
            'water' => 2,
            'psych' => 1,
        ],
        'personal_objectives' => ['full_body_workout'],
        'x_y' => [1000, 200],
    ],

    '36' => [
        'name' => 'the_trifecta',
        'description' => _("The Trifecta"),
        'value' => 3,
        'type' => 'wild',
        'type_description' => _("Wild"),
        'shade' => 2,
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
        'x_y' => [1100, 200],
    ],

    '37' => [
        'name' => 'psychic_turbulance',
        'description' => _("Psychic Turbulance"),
        'value' => 4,
        'type' => 'corner',
        'type_description' => _("Corner"),
        'shade' => 0,
        'requirements' => [
            'gear' => null,
            'crack' => 3,
            'face' => 1,
            'slab' => 2,
            'any_skill' => null,
            'water' => null,
            'psych' => 1,
        ],
        'personal_objectives' => ['national_parks_pass'],
        'x_y' => [1200, 200],
    ],

    '38' => [
        'name' => 'slab_aptitude_test',
        'description' => _("The S.A.T. (Slab Aptitude Test)"),
        'value' => 5,
        'type' => 'slab',
        'type_description' => _("Slab"),
        'shade' => 1,
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
        'x_y' => [0, 300],
    ],

    '39' => [
        'name' => 'desert_gold',
        'description' => _("Desert Gold"),
        'value' => 5,
        'type' => 'roof',
        'type_description' => _("Roof"),
        'shade' => 1,
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
        'x_y' => [100, 300],
    ],

    '40' => [
        'name' => 'no_place_like_home',
        'description' => _("No Place Like Home"),
        'value' => 5,
        'type' => 'arete',
        'type_description' => _("Arete"),
        'shade' => 0,
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
        'x_y' => [200, 300],
    ],

    '41' => [
        'name' => 'teflon_corner',
        'description' => _("Teflon Corner"),
        'value' => 5,
        'type' => 'corner',
        'type_description' => _("Corner"),
        'shade' => 0,
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
        'x_y' => [300, 300],
    ],

    '42' => [
        'name' => 'scarlet_begonias',
        'description' => _("Scarlet Begonias"),
        'value' => 5,
        'type' => 'flake',
        'type_description' => _("Flake"),
        'shade' => 1,
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
        'x_y' => [400, 300],
    ],

    '43' => [
        'name' => 'belly_full_of_bad_berries',
        'description' => _("Belly Full of Bad Berries"),
        'value' => 5,
        'type' => 'crack',
        'type_description' => _("Crack"),
        'shade' => 1,
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
        'x_y' => [500, 300],
    ],

];

$this->summit_beta_tokens = [
    '1' => [
        'name' => 'rerack',
        'description' => _("Rerack"),
        'effect_string' => _("Search the discard pile for 2 Asset Cards of your choice"),
        'subscript_string' => null,
        'action' => null, //rerack_summit(),
        'x_y' => [0, 300],
    ],

    '2' => [
        'name' => 'borrowed_rack',
        'description' => _("Borrowed Rack"),
        'effect_string' => _("Use no Gear on a Pitch of your choice"),
        'subscript_string' => _("Free Soloist: no extra Skills needed"), //should be italicized
        'action' => null, //borrowed_rack_summit(),
        'x_y' => [100, 300],
    ],

    '3' => [
        'name' => 'jumar',
        'description' => _("Jumar"),
        'effect_string' => _("Use no Skills on a Pitch another player has climbed"),
        'subscript_string' => null,
        'action' => null, //jumar_summit(),
        'x_y' => [200, 300],
    ],

    '4' => [
        'name' => 'energy_drink',
        'description' => _("Energy Drink"),
        'effect_string' => _("+1 Psych \n+1 Water"),
        'subscript_string' => null,
        'action' => null, //energy_drink_summit(),
        'x_y' => [300, 300],

    ],

    '5' => [
        'name' => 'extra_water',
        'description' => _("Extra Water"),
        'effect_string' => _("No Water needed on a Pitch of your choice"),
        'subscript_string' => null,
        'action' => null, //extra_water_summit(),
        'x_y' => [0, 200],
    ],

    '6' => [
        'name' => 'new_rubber',
        'description' => _("New Rubber"),
        'effect_string' => _("Use this Token to count as any one technique symbol"),
        'subscript_string' => null,
        'action' => null, //new_rubber_summit(),
        'x_y' => [100, 200],
    ],

    '7' => [
        'name' => 'simul_climb',
        'description' => _("Simul Climb"),
        'effect_string' => _("Draw 3 Cards from The Spread or Asset Deck"),
        'subscript_string' => null,
        'action' => null, //simul_summit(),
        'x_y' => [200, 200],
    ],

    '8' => [
        'name' => 'guidebook',
        'description' => _("Guidebook"),
        'effect_string' => _("Use this Token to count as any one Skill"),
        'subscript_string' => null,
        'action' => null, //guidebook_summit(),
        'x_y' => [300, 200],
    ],

    '9' => [
        'name' => 'bomber_anchor',
        'description' => _("Bomber Anchor"),
        'effect_string' => _("Trade in up to 3 Cards from your hand for up to 3 Cards from The Portaledge"),
        'subscript_string' => null,
        'action' => null, //bomber_anchor_summit(),
        'x_y' => [0, 100],
    ],

    '10' => [
        'name' => 'jesus_piece',
        'description' => _("Jesus Piece"),
        'effect_string' => _("Use this to avoid a negative effect from a Climbing Card"),
        'subscript_string' => null,
        'action' => null, //jesus_piece_summit(),
        'x_y' => [100, 100],
    ],

    '11' => [
        'name' => 'lucky_chalkbag',
        'description' => _("Lucky Chalkbag"),
        'effect_string' => _("Reroll the Risk Die"),
        'subscript_string' => null,
        'action' => null, //lucky_chalkbag_summit(),
        'x_y' => [200, 100],
    ],

    '12' => [
        'name' => 'spider_stick',
        'description' => _("Spider Stick"),
        'effect_string' => _("Gain a 2-Point Token on the next 1- or 2-point Pitch you climb"),
        'subscript_string' => null,
        'action' => null, //spider_stick_summit(),
        'x_y' => [300, 100],
    ],
];

$this->shared_objectives = [
    '1' => [
        'name' => 'ridgeline_challenge_north',
        'description' => _("Ridgeline Challenge"),
        'points' => 5,
        'objective_string' => _("Climb at least 4 Pitches <br>of the North Ridge"),
        'subscript_string' => null,
        'action' => null, //ridgeline_challenge_north_objective()
        'x_y' => [0, 400],
    ],

    '2' => [
        'name' => 'ridgeline_challenge_south',
        'description' => _("Ridgeline Challenge"),
        'points' => 5,
        'objective_string' => _("Climb at least 4 Pitches <br>of the South Ridge"),
        'subscript_string' => null,
        'action' => null, //ridgeline_challenge_south_objective(),
        'x_y' => [100, 400],
    ],

    '3' => [
        'name' => 'stay_in_the_shade',
        'description' => _("Stay in the Shade"),
        'points' => null,
        'objective_string' => _("Gain 1 point for each <br>shaded Pitch you climb"),
        'subscript_string' => _("(dark gray tile)"),
        'action' => null, //stay_in_the_shade_objective(),
        'x_y' => [200, 400],
    ],

    '4' => [
        'name' => 'stay_in_the_sun',
        'description' => _("Stay in the Sun"),
        'points' => null,
        'objective_string' => _("Gain 1 point for each <br>sunny Pitch you climb"),
        'subscript_string' => _("(light gray tile)"),
        'action' => null, //stay_in_the_sun_objective(),
        'x_y' => [300, 400],
    ],

    '5' => [
        'name' => 'jolly_jammer',
        'description' => _("Jolly Jammer"),
        'points' => 4,
        'objective_string' => _("Climb 3 CRACK Pitches"),
        'subscript_string' => null,
        'action' => null, //jolly_jammer_objective(),
        'x_y' => [0, 500],
    ],

    '6' => [
        'name' => 'smear_campaign',
        'description' => _("Smear Campaign"),
        'points' => 4,
        'objective_string' => _("Climb 3 SLAB Pitches"),
        'subscript_string' => null,
        'action' => null, //smear_campaign_objective(),
        'x_y' => [100, 500],
    ],

    '7' => [
        'name' => 'star_stemmer',
        'description' => _("Star Stemmer"),
        'points' => 4,
        'objective_string' => _("Climb 3 CORNER Pitches"),
        'subscript_string' => null,
        'action' => null, //star_stemmer_objective(),
        'x_y' => [200, 500],
    ],

    '8' => [
        'name' => 'exposure_junkie',
        'description' => _("Exposure Junkie"),
        'points' => 4,
        'objective_string' => _("Climb 3 ARETE Pitches"),
        'subscript_string' => null,
        'action' => null, //exposure_junkie_objective(),
        'x_y' => [300, 500],
    ],

    '9' => [
        'name' => 'grand_traverse',
        'description' => _("Grand Traverse"),
        'points' => 4,
        'objective_string' => _("Climb horizontally <br>across 4 Pitches in a <br>row"),
        'subscript_string' => null,
        'action' => null, //grand_traverse_objective(),
        'x_y' => [0, 600],
    ],

    '10' => [
        'name' => 'all-arounding',
        'description' => _("All-Arounding"),
        'points' => 6,
        'objective_string' => _("Climb every Pitch type:<br>Arete, Corner, Slab, <br>Flake, Roof, Crack"),
        'subscript_string' => null,
        'action' => null, //all-arounding_objective(),
        'x_y' => [100, 600],
    ],

    '11' => [
        'name' => 'the_elitist',
        'description' => _("The Elitist"),
        'points' => 4,
        'objective_string' => _("Climb no 1 point Pitches"),
        'subscript_string' => _("(starting value)"),
        'action' => null, //the_elitist_objective(),
        'x_y' => [200, 600],
    ],

    '12' => [
        'name' => 'a_day_in_the_alpine',
        'description' => _("A Day in the Alpine"),
        'points' => null,
        'objective_string' => _("Gain 1 point for each <br>Pitch on the Headwall <br>you climb"),
        'subscript_string' => null,
        'action' => null, //a_day_in_the_alpine_objective(),
        'x_y' => [300, 600],
    ],

    '13' => [
        'name' => 'flake_freak',
        'description' => _("Flake Freak"),
        'points' => 4,
        'objective_string' => _("Climb 3 FLAKE Pitches"),
        'subscript_string' => null,
        'action' => null, //flake_freak_objective(),
        'x_y' => [0, 700],
    ],

    '14' => [
        'name' => 'pull-up_champion',
        'description' => _("Pull-Up Champion"),
        'points' => 4,
        'objective_string' => _("Climb 3 ROOF Pitches"),
        'subscript_string' => null,
        'action' => null, //pull-up_champion_objective(),
        'x_y' => [100, 700],
    ],

    '15' => [
        'name' => 'stonemaster',
        'description' => _("Stonemaster"),
        'points' => 8,
        'objective_string' => _("Earn 2 Permanent Face <br>Skills + 2 Permanent <br>Slab Skills"),
        'subscript_string' => null,
        'action' => null, //stonemaster_objective(),
        'x_y' => [200, 700],
    ],

    '16' => [
        'name' => 'off-width_aficionado',
        'description' => _("Off-Width Aficionado"),
        'points' => 8,
        'objective_string' => _("Earn 2 Permanent Crack <br>Skills + 2 Permanent <br>Gear"),
        'subscript_string' => null,
        'action' => null, //off-width_aficionado_objective(),
        'x_y' => [300, 700],
    ],
];

$this->asset_cards = [
    '1' => [
        'name' => 'toe_jam',
        'description' => _("Toe Jam"),
        'skill' => 'crack',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => 1,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [100, 0],
    ],

    '2' => [
        'name' => 'arm_bar',
        'description' => _("Arm Bar"),
        'skill' => 'crack',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [200, 0],

    ],

    '3' => [
        'name' => 'hand_jam',
        'description' => _("Hand Jam"),
        'skill' => 'crack',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [300, 0],
    ],

    '4' => [
        'name' => 'finger_lock',
        'description' => _("Finger Lock"),
        'skill' => 'crack',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => 1,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [400, 0],
    ],

    '5' => [
        'name' => 'stemming',
        'description' => _("Stemming"),
        'skill' => 'crack',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => 1,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [500, 0],
    ],

    '6' => [
        'name' => 'chicken_wing',
        'description' => _("Chicken Wing"),
        'skill' => 'crack',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => 1,
        ],
        'number_in_deck' => 4,
        'x_y' => [600, 0],
    ],

    '7' => [
        'name' => 'hand-fist_stack',
        'description' => _("Hand-Fist Stack"),
        'skill' => 'crack',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [700, 0],
    ],

    '8' => [
        'name' => 'smear',
        'description' => _("Smear"),
        'skill' => 'slab',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => 1,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [800, 0],
    ],

    '9' => [
        'name' => 'palming',
        'description' => _("Palming"),
        'skill' => 'slab',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [900, 0],
    ],

    '10' => [
        'name' => 'sloper',
        'description' => _("Sloper"),
        'skill' => 'slab',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [0, 100],
    ],

    '11' => [
        'name' => 'edge',
        'description' => _("Edge"),
        'skill' => 'slab',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [100, 100],
    ],

    '12' => [
        'name' => 'crimp',
        'description' => _("Crimp"),
        'skill' => 'slab',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => 1,
        ],
        'number_in_deck' => 4,
        'x_y' => [200, 100],
    ],

    '13' => [
        'name' => 'hand-foot_match',
        'description' => _("Hand-Foot Match"),
        'skill' => 'slab',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => 1,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [300, 100],
    ],

    '14' => [
        'name' => 'mono_pocket',
        'description' => _("Mono Pocket"),
        'skill' => 'slab',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => 1,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [400, 100],
    ],

    '15' => [
        'name' => 'mantle',
        'description' => _("Mantle"),
        'skill' => 'face',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => 1,
        ],
        'number_in_deck' => 4,
        'x_y' => [500, 100],
    ],

    '16' => [
        'name' => 'undercling',
        'description' => _("Undercling"),
        'skill' => 'face',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [600, 100],
    ],

    '17' => [
        'name' => 'layback',
        'description' => _("Layback"),
        'skill' => 'face',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [700, 100],
    ],

    '18' => [
        'name' => 'gaston',
        'description' => _("Gaston"),
        'skill' => 'face',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [800, 100],
    ],

    '19' => [
        'name' => 'heel_hook',
        'description' => _("Heel Hook"),
        'skill' => 'face',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => 1,
        ],
        'number_in_deck' => 4,
        'x_y' => [900, 100],
    ],

    '20' => [
        'name' => 'pinch',
        'description' => _("Pinch"),
        'skill' => 'face',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => 1,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [1000, 100],
    ],

    '21' => [
        'name' => 'flag',
        'description' => _("Flag"),
        'skill' => 'face',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => 1,
            'power' => null,
        ],
        'number_in_deck' => 4,
        'x_y' => [1100, 100],
    ],

    '22' => [
        'name' => 'nuts',
        'description' => _("Nuts"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 2,
        'x_y' => [0, 200],
    ],

    '23' => [
        'name' => 'alpine_draws',
        'description' => _("Alpine Draws"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 3,
        'x_y' => [100, 200],
    ],

    '24' => [
        'name' => 'climbing_shoes',
        'description' => _("Climbing Shoes"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => 1,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 2,
        'x_y' => [200, 200],
    ],

    '25' => [
        'name' => 'tape',
        'description' => _("Tape"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => 1,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 2,
        'x_y' => [300, 200],
    ],

    '26' => [
        'name' => 'locker',
        'description' => _("Locker"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => 1,
            'balance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [400, 200],
    ],

    '27' => [
        'name' => 'rope',
        'description' => _("Rope"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => 1,
            'balance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [500, 200],
    ],

    '28' => [
        'name' => 'long_runner',
        'description' => _("Long Runner"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 2,
        'x_y' => [600, 200],
    ],

    '29' => [
        'name' => 'helmet',
        'description' => _("Helmet"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => 1,
            'balance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [700, 200],
    ],

    '30' => [
        'name' => 'cordelette',
        'description' => _("Cordelette"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => 1,
            'power' => null,
        ],
        'number_in_deck' => 2,
        'x_y' => [0, 300],
    ],

    '31' => [
        'name' => 'pack',
        'description' => _("Pack"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => 1,
        ],
        'number_in_deck' => 2,
        'x_y' => [100, 300],
    ],

    '32' => [
        'name' => 'chalk_bag',
        'description' => _("Chalk Bag"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [200, 300],
    ],

    '33' => [
        'name' => 'nut_tool',
        'description' => _("Nut Tool"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 2,
        'x_y' => [300, 300],
    ],

    '34' => [
        'name' => 'cams',
        'description' => _("Cams"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => null,
            'balance' => null,
            'power' => null,
        ],
        'number_in_deck' => 3,
        'x_y' => [400, 300],
    ],

    '35' => [
        'name' => 'belay_device',
        'description' => _("Belay Device"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => 1,
            'balance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [500, 300],
    ],

    '36' => [
        'name' => 'harness',
        'description' => _("Harness"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => 1,
            'pain_tolerance' => 1,
            'balance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [600, 300],
    ],

    '37' => [
        'name' => 'quick_draws',
        'description' => _("Quick Draws"),
        'skill' => 'gear',
        'techniques' => [
            'precision' => null,
            'pain_tolerance' => null,
            'balance' => 1,
            'power' => null,
        ],
        'number_in_deck' => 2,
        'x_y' => [700, 300],
    ],
];

$this->climbing_cards = [
    '1' => [
        'name' => 'heinous_rope_drag',
        'description' => _("Heinous rope drag"),
        'effect_A_flavor' => _("Set up a 3:1 haul and pull with all your might:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {POWER_ICON} Token"),
        'effect_B_flavor' => _("Build a mid-pitch anchor:"),
        'effect_B' => _("Lose 1 {GEAR_ICON} Card and gain 1 {WATER_ICON}"),
        'x_y' => [0, 0],
    ],

    '2' => [
        'name' => 'chopped_bolts',
        'description' => _("Chopped bolts"),
        'effect_A_flavor' => _("Which Pitch had its bolts removed?"),
        'effect_A' => _("Choose a Pitch and add 1 {GEAR_ICON} Token to it - any player
                         climbing that Pitch will need that additional Asset"),
        'x_y' => [100, 0],
    ],

    '3' => [
        'name' => 'party_above_you_forgot_some_gear',
        'description' => _("Party above you forgot some gear"),
        'effect_A_flavor' => _("Bring it up to them:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 Summit Beta Token"),
        'effect_B_flavor' => _("Swipe the gear:"),
        'effect_B' => _("Lose 1 Card and take 1 {GEAR_ICON} Card from another player's
                         Asset Board, then add it to your Board"),
        'x_y' => [200, 0],
    ],

    '4' => [
        'name' => 'techy_face',
        'description' => _("Techy face"),
        'effect_A_flavor' => _("Crimp til you bleed:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {PAIN_TOLERANCE_ICON} Token"),
        'effect_B_flavor' => _("Bail and climb the chossy gully:"),
        'effect_B' => _("Lose 1 {FACE_ICON} Card and gain 1 {WATER_ICON}"),
        'x_y' => [300, 0],
    ],

    '5' => [
        'name' => 'wild_berries',
        'description' => _("Wild berries!"),
        'effect_A_flavor' => _("Are there berry bushes all over the mountain?"),
        'effect_A' => _("All players gain 2 {WATER_ICON}"),
        'effect_B_flavor' => _("Are the berry bushes just on this ledge?"),
        'effect_B' => _("You gain 1 {WATER_ICON}"),
        'x_y' => [400, 0],
    ],

    '6' => [
        'name' => 'sandbagged',
        'description' => _("Sandbagged"),
        'effect_A_flavor' => _("Which Pitch is harder than everyone says it is?"),
        'effect_A' => _("Add 1 Skill Token {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON} to any
                                       Pitch - any player climbing that Pitch will need that additional Asset"),
        'x_y' => [500, 0],
    ],

    '7' => [
        'name' => 'splitter',
        'description' => _("Splitter"),
        'effect_A_flavor' => _("Jam the whole way up:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {PAIN_TOLERANCE_ICON} Token"),
        'effect_B_flavor' => _("Conserve your toes and find some nubs to use for feet:"),
        'effect_B' => _("Lose 1 {CRACK_ICON} Card and gain 1 {SLAB_ICON} Card"),
        'x_y' => [600, 0],
    ],

    '8' => [
        'name' => 'booty',
        'description' => _("Booty!"),
        'effect_A_flavor' => _("Take it:"),
        'effect_A' => _("Lose 1 Card from your hand and take 1 {GEAR_ICON} Card from another
                                       player's Asset Board, then add it to your Board"),
        'effect_B_flavor' => _("Leave it:"),
        'effect_B' => _("Lose 1 {GEAR_ICON} Card and gain 1 Summit Beta Token"),
        'x_y' => [700, 0],
    ],

    '9' => [
        'name' => 'benighted',
        'description' => _("Benighted"),
        'effect_A_flavor' => _("Set up a shiver bivy:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 Summit Beta Token"),
        'effect_B_flavor' => _("Break out the headlamps:"),
        'effect_B' => _("You and another player gain Technique Tokens of your choice
                         {POWER_ICON}/{PAIN_TOLERANCE_ICON}/{BALANCE_ICON}/{PRECISION_ICON}"),
        'x_y' => [800, 0],
    ],

    '10' => [
        'name' => 'pocket_bacon',
        'description' => _("Pocket bacon"),
        'effect_A_flavor' => _("Do you have enough to share?"),
        'effect_A' => _("All players gain 2 {PSYCH_ICON}"),
        'effect_B_flavor' => _("Is there only enough for you?"),
        'effect_B' => _("You gain 1 {PSYCH_ICON}"),
        'x_y' => [900, 0],
    ],

    '11' => [
        'name' => 'choss_pile',
        'description' => _("Choss pile"),
        'effect_A_flavor' => _("Delicately climb through the choss:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 {BALANCE_ICON} Token"),
        'effect_B_flavor' => _("Find another way up:"),
        'effect_B' => _("Lose 1 {WATER_ICON} and gain 1 {FACE_ICON} Card"),
        'x_y' => [0, 100],
    ],

    '12' => [
        'name' => 'tricky_boulder_problem',
        'description' => _("Tricky boulder problem"),
        'effect_A_flavor' => _("Try a heel hook to a sloper:"),
        'effect_A' => _("Lose 2 Cards and gain any Technique Token 
                         {POWER_ICON}/{PAIN_TOLERANCE_ICON}/{BALANCE_ICON}/{PRECISION_ICON}"),
        'effect_B_flavor' => _("Dyno up to a chalky jug:"),
        'effect_B' => _("Lose 1 {WATER_ICON} and gain 1 {FACE_ICON} Card"),
        'x_y' => [100, 100],
    ],

    '13' => [
        'name' => 'found_a_kneebar_rest',
        'description' => _("Found a kneebar rest"),
        'effect_A_flavor' => _("Take the kneebar and shake it out:"),
        'effect_A' => _("Lose 1 Card and gain 1 {BALANCE_ICON} Token"),
        'effect_B_flavor' => _("Skip the kneebar:"),
        'effect_B' => _("Lose 1 {WATER_ICON} and gain 1 Skill Card 
                         {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON}"),
        'x_y' => [200, 100],
    ],

    '14' => [
        'name' => 'rope_sheath_is_cut',
        'description' => _("Rope sheath is cut"),
        'effect_A_flavor' => _("Ask rappellers if you can use their extra rope:"),
        'effect_A' => _("Take 1 {GEAR_ICON} Card from another player's Asset Board and
                         add it to your hand"),
        'effect_B_flavor' => _("Cut your rope down and be mindful of its shorter length:"),
        'effect_B' => _("Lose 1 {GEAR_ICON} Card and gain 1 {PRECISION_ICON} Token"),
        'x_y' => [300, 100],
    ],

    '15' => [
        'name' => 'too_much_gear',
        'description' => _("Too Much Gear"),
        'effect_A_flavor' => _("Lug that heavy rack up with you:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {POWER_ICON} Token"),
        'effect_B_flavor' => _("Offload some gear onto your partner:"),
        'effect_B' => _("All other players gain 1 {GEAR_ICON} Card from The Portaledge"),
        'x_y' => [400, 100],
    ],

    '16' => [
        'name' => 'use_your_partners_rack',
        'description' => _("Use your partner's rack"),
        'effect_A_flavor' => _("Organize their chaotic rack:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 {PRECISION_ICON} Token"),
        'effect_B_flavor' => _("Go up with it looking like a junk show:"),
        'effect_B' => _("Roll the Risk Die\n
                         {CHECKMARK_ICON}: Gain 3 Cards from The Portaledge\n
                         {CARDS_ICON}/{CARD_PSYCH_ICON}: Give those Assets to another player"),
        'x_y' => [500, 100],
    ],

    '17' => [
        'name' => 'painful_hanging_belay',
        'description' => _("Painful hanging belay"),
        'effect_A_flavor' => _("Lead a short pitch to a better belay:"),
        'effect_A' => _("Lose 1 {GEAR_ICON} Card and gain 1 {WATER_ICON}"),
        'effect_B_flavor' => _("Deal with the pain:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 {PAIN_TOLERANCE_ICON} Token"),
        'x_y' => [600, 100],
    ],

    '18' => [
        'name' => 'pumped',
        'description' => _("Pumped!"),
        'effect_A_flavor' => _("Push through the pain:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {POWER_ICON} Token"),
        'effect_B_flavor' => _('Yell "TAKE!" and shake it out:'),
        'effect_B' => _("Lose 1 Skill Card {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON} 
                         and gain 1 {WATER_ICON}"),
        'x_y' => [700, 100],
    ],

    '19' => [
        'name' => 'hangry_partner',
        'description' => _("Hangry partner"),
        'effect_A_flavor' => _("Lead the next pitch so they can eat lunch:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {POWER_ICON} Token"),
        'effect_B_flavor' => _("Give them your granola bar and a pep talk:"),
        'effect_B' => _("Draw 2 Summit Beta Tokens; keep 1 and give the other to another player"),
        'x_y' => [800, 100],
    ],

    '20' => [
        'name' => 'desperate_throw',
        'description' => _("Desperate throw"),
        'effect_A_flavor' => _("Commit to the awful sloper:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 {POWER_ICON} Token"),
        'effect_B_flavor' => _("Go back to the good holds and look for a different way up:"),
        'effect_B' => _("Lose 1 {SLAB_ICON} Card and gain 1 {WATER_ICON}"),
        'x_y' => [900, 100],
    ],

    '21' => [
        'name' => 'flexing_flake',
        'description' => _("Flexing flake"),
        'effect_A_flavor' => _("Awkwardly stretch around it:"),
        'effect_A' => _("Lose 1 Card and gain 1 {BALANCE_ICON} Token"),
        'effect_B_flavor' => _("Gingerly tiptoe up it:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 {PRECISION_ICON} Token"),'x_y' => [0, 200],
        'x_y' => [0, 200],
    ],

    '22' => [
        'name' => 'scary_run-out_slab',
        'description' => _("Scary run-out slab"),
        'effect_A_flavor' => _("Bail into the vegetated gully:"),
        'effect_A' => _("Lose 1 {SLAB_ICON} Card and gain 1 {PSYCH_ICON}"),
        'effect_B_flavor' => _("Smear and pray like never before:"),
        'effect_B' => _("Roll the Risk Die\n
                         {CHECKMARK_ICON}: Gain 3 cards from The Portaledge\n
                         {CARDS_ICON}/{CARD_PSYCH_ICON}: Give those Assets to another player"),
        'x_y' => [100, 200],
    ],

    '23' => [
        'name' => 'other_partys_rope_gets_stuck',
        'description' => _("Other party's rope gets stuck"),
        'effect_A_flavor' => _("Help them:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 Summit Beta Token"),
        'effect_B_flavor' => _("Pass them by:"),
        'effect_B' => _("Lose 1 Card and take 1 Card from another player's Asset Board,
                         then add it to your hand"),
        'x_y' => [200, 200],
    ],

    '24' => [
        'name' => 'gassy_as_heck',
        'description' => _("Gassy as heck"),
        'effect_A_flavor' => _("Scurry up the next pitch to fart in solitude:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {FACE_ICON} Card"),
        'effect_B_flavor' => _("Hold it in while your partner racks up:"),
        'effect_B' => _("Gain 1 {PAIN_TOLERANCE_ICON} Token and all other
                         players gain 1 {GEAR_ICON} Card"),
        'x_y' => [300, 200],
    ],

    '25' => [
        'name' => 'partner_has_a_meltdown',
        'description' => _("Partner has a meltdown"),
        'effect_A_flavor' => _("Console them:"),
        'effect_A' => _("Give another player 2 Cards and gain 1 Summit Beta Token"),
        'effect_B_flavor' => _("Tell them to buck up:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and take 1 Card from another player's
                         Asset Board, then add it to your hand"),
        'x_y' => [400, 200],
    ],

    '26' => [
        'name' => 'bad_beta',
        'description' => _("Bad beta"),
        'effect_A_flavor' => _("Post a correction online:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 Summit Beta Token"),
        'effect_B_flavor' => _("Confront whoever gave you the beta:"),
        'effect_B' => _("Lose 1 Card and take 1 Card from another player's Asset Board,
                         then add it to your hand"),
        'x_y' => [500, 200],
    ],

    '27' => [
        'name' => 'prosthesis_starts_to_slip',
        'description' => _("Prosthesis starts to slip"),
        'effect_A_flavor' => _("Keep movements small to stay in control:"),
        'effect_A' => _("Lose 1 {FACE_ICON} Card and gain 1 {PRECISION_ICON} Token"),
        'effect_B_flavor' => _("Ignore it and keep climbing with less reliable foot placements:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 {FACE_ICON} Card"),
        'x_y' => [600, 200],
    ],

    '28' => [
        'name' => 'hecked_up_the_sequence',
        'description' => _("Hecked up the sequence"),
        'effect_A_flavor' => _("Try to smear both feet:"),
        'effect_A' => _("Lose 1 {SLAB_ICON} Card and gain 1 {PAIN_TOLERANCE_ICON} Token"),
        'effect_B_flavor' => _("Try to mantle:"),
        'effect_B' => _("Add 1 Card from your hand to your Asset Board"),
        'x_y' => [700, 200],
    ],

    '29' => [
        'name' => 'falling_poop_bag',
        'description' => _("Falling poop bag"),
        'effect_A_flavor' => _("Flatten yourself against the wall and hope you don't get hit:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 {BALANCE_ICON} Token"),
        'effect_B_flavor' => _("Warn the others below:"),
        'effect_B' => _("All players gain 1 Card from The Portaledge"),
        'x_y' => [800, 200],
    ],

    '30' => [
        'name' => 'blind_placement',
        'description' => _("Blind placement"),
        'effect_A_flavor' => _("Fiddle with the gear:"),
        'effect_A' => _("Put 1 {GEAR_ICON} Card from your hand onto your Asset Board"),
        'effect_B_flavor' => _("Say heck the gear and move on:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 Skill Card 
                         {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON}"),
        'x_y' => [900, 200],
    ],

    '31' => [
        'name' => 'dropped_a_piece',
        'description' => _("Dropped a piece"),
        'effect_A_flavor' => _("Retrieve it:"),
        'effect_A' => _("Lose 1 Skill Card {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON} 
                         and gain 1 {GEAR_ICON} Card"),
        'effect_B_flavor' => _("Decide you don't need it"),
        'effect_B' => _("Give 1 {GEAR_ICON} Card to another player and draw 1 Card
                         from The Portaledge"),
        'x_y' => [0, 300],
    ],

    '32' => [
        'name' => 'bat_in_the_crack',
        'description' => _("Bat in the crack!"),
        'effect_A_flavor' => _("Layback the crack and hope you don't disturb the bat:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {POWER_ICON} Token"),
        'effect_B_flavor' => _("Make noise to shoo it out:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 {CRACK_ICON} Card"),
        'x_y' => [100, 300],
    ],

    '33' => [
        'name' => 'peregrine_falcon_delivers_a_water-filled_cactus',
        'description' => _("Peregrine falcon delivers a water-filled cactus"),
        'effect_A_flavor' => _("Is it the juciest cactus ever?"),
        'effect_A' => _("All players gain 2 {WATER_ICON}"),
        'effect_B_flavor' => _("Is there only enough for you?"),
        'effect_B' => _("You gain 1 {WATER_ICON}"),
        'x_y' => [200, 300],
    ],

    '34' => [
        'name' => 'spinner',
        'description' => _("Spinner"),
        'effect_A_flavor' => _("Ignore it:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 Skill Card {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON}"),
        'effect_B_flavor' => _("Back it up with some gear:"),
        'effect_B' => _("Lose 1 {GEAR_ICON} Card and gain 1 {PSYCH_ICON}"),
        'x_y' => [300, 300],
    ],

    '35' => [
        'name' => 'off_route',
        'description' => _("Off route"),
        'effect_A_flavor' => _("Go up the featureless slab:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 {SLAB_ICON} Card"),
        'effect_B_flavor' => _("Go up the lichen-covered corner:"),
        'effect_B' => _("Roll the Risk Die\n
                         {CHECKMARK_ICON}: Gain 3 Cards from The Portaledge\n
                         {CARDS_ICON}/{CARD_PSYCH_ICON}: Give those Assets to another player"),
        'x_y' => [400, 300],
    ],

    '36' => [
        'name' => 'camera_crew',
        'description' => _("Camera crew"),
        'effect_A_flavor' => _("Which Pitch has a photographer hanging out on it?"),
        'effect_A' => _("Add 1 Skill Token {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON} to any
                         Pitch - any player climbing that Pitch will need that additional Asset"),
        'x_y' => [500, 300],
    ],

    '37' => [
        'name' => 'overcammed_that_jawn',
        'description' => _("Overcammed that jawn"),
        'effect_A_flavor' => _("Waste 15 minutes getting it out:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 {GEAR_ICON} Card"),
        'effect_B_flavor' => _("Leave it in:"),
        'effect_B' => _("All other players may draw a Card from The Portaledge"),
        'x_y' => [600, 300],
    ],

    '38' => [
        'name' => 'wet_rock',
        'description' => _("Wet rock"),
        'effect_A_flavor' => _("Go up the seeping crack:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 {CRACK_ICON} Card"),
        'effect_B_flavor' => _("Drench your gear on the soggy ledges:"),
        'effect_B' => _("Lose 1 {GEAR_ICON} Card and gain 1 {WATER_ICON}"),
        'x_y' => [700, 300],
    ],

    '39' => [
        'name' => 'who_pooped_on_the_ledge',
        'description' => _("Who pooped on the ledge"),
        'effect_A_flavor' => _("Scooch it into your spare waste bag and wash off the remains:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and draw 1 Summit Beta Token"),
        'effect_B_flavor' => _("Leave it there and whiff the fumes while you belay:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} Card and gain 1 {PAIN_TOLERANCE_ICON} Token"),
        'x_y' => [800, 300],
    ],

    '40' => [
        'name' => 'wild_traverse',
        'description' => _("Wild traverse"),
        'effect_A_flavor' => _("Clip a long runner to everything:"),
        'effect_A' => _("Put 1 {GEAR_ICON} Card from your hand onto your Asset Board"),
        'effect_B_flavor' => _("Run it out to avoid rope drag:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 Skill Card 
                         {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON}"),
        'x_y' => [900, 300],
    ],

    '41' => [
        'name' => 'falcon_nest',
        'description' => _("Falcon nest"),
        'effect_A_flavor' => _("Which Pitch has a short but difficult detour to avoid the
                                nesting area?"),
        'effect_A' => _("Add 1 Skill Token {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON} to any
                         Pitch - any player climbing that Pitch will need that additional Asset"),
        'x_y' => [0, 400],
    ],

    '42' => [
        'name' => 'lucky_flask',
        'description' => _("Lucky flask"),
        'effect_A_flavor' => _("Pass it around:"),
        'effect_A' => _("All players gain 1 {WATER_ICON} and 1 {PSYCH_ICON}"),
        'effect_B_flavor' => _("Keep it to yourself:"),
        'effect_B' => _("You gain 1 {WATER_ICON}"),
        'x_y' => [100, 400],
    ],

    '43' => [
        'name' => 'wasp_nest',
        'description' => _("Wasp nest"),
        'effect_A_flavor' => _("Find a way around it:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 Summit Beta Token"),
        'effect_B_flavor' => _("Keep climbing near it and hope you don't get stung:"),
        'effect_B' => _("Roll the Risk Die\n
                                       {CHECKMARK_ICON}: Gain 3 Cards from The Portaledge\n
                                       {CARDS_ICON}/{CARD_PSYCH_ICON}: Give those Assets to another player"),
        'x_y' => [200, 400],
    ],

    '44' => [
        'name' => 'second_wind',
        'description' => _("Second wind"),
        'effect_A_flavor' => _("Use your energy to psych everyone up:"),
        'effect_A' => _("All players gain 1 {PSYCH_ICON}"),
        'effect_B_flavor' => _("Use your energy to send the Pitch:"),
        'effect_B' => _("Lose 1 {WATER_ICON} and gain 1 Card from The Portaledge"),
        'x_y' => [300, 400],
    ],

    '45' => [
        'name' => 'surprise_storm',
        'description' => _("Surprise storm!"),
        'effect_A_flavor' => _("Keep climbing in the rain:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 Skill Card {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON}"),
        'effect_B_flavor' => _("Wait it out:"),
        'effect_B' => _("Give another player 2 Cards and gain 1 Summit Beta Token"),
        'x_y' => [400, 400],
    ],

    '46' => [
        'name' => 'surprise_off-width',
        'description' => _("Surprise off-width"),
        'effect_A_flavor' => _("Do you thrash through it:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {CRACK_ICON} Card"),
        'effect_B_flavor' => _("Do you pull on gear to get past it:"),
        'effect_B' => _("Lose 1 {CRACK_ICON} Card and gain 1 {GEAR_ICON} Card"),
        'x_y' => [500, 400],
    ],

    '47' => [
        'name' => 'squirrels_eat_your_snacks',
        'description' => _("Squirrels eat your snacks"),
        'effect_A_flavor' => _("Let them do as they please:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and draw 1 Card from The Portaledge"),
        'effect_B_flavor' => _("Waste time shooing them away:"),
        'effect_B' => _("All other players draw 1 Card from The Portaledge"),
        'x_y' => [600, 400],
    ],

    '48' => [
        'name' => 'big_scary_roof',
        'description' => _("Big scary roof"),
        'effect_A_flavor' => _("Find a bomber jam:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {CRACK_ICON} Card"),
        'effect_B_flavor' => _("Inch over the edge on tiny crimps:"),
        'effect_B' => _("Lose 1 {GEAR_ICON} Card and gain 1 {FACE_ICON} Card"),
        'x_y' => [700, 400],
    ],

    '49' => [
        'name' => 'party_on_the_ledge',
        'description' => _("Party on the ledge"),
        'effect_A_flavor' => _("Share the bolted anchors with them:"),
        'effect_A' => _("You and another player lose 1 {PSYCH_ICON} 
                         and each gain 1 {GEAR_ICON} Card"),
        'effect_B_flavor' => _("Build an anchor around the corner:"),
        'effect_B' => _("Lose 1 {GEAR_ICON} Card and gain 1 {PSYCH_ICON}"),
        'x_y' => [800, 400],
    ],

    '50' => [
        'name' => 'pee_off_the_ledge',
        'description' => _("Pee off the ledge"),
        'effect_A_flavor' => _("When you gotta go, you gotta go!"),
        'effect_A' => _("Add 1 Skill Token {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON} to any
                         Pitch next to you or below you - any player climbing that Pitch
                         will need that additional Asset"),
        'x_y' => [900, 400],
    ],

    '51' => [
        'name' => 'powerful_dyno',
        'description' => _("Powerful dyno"),
        'effect_A_flavor' => _("Build a gear nest in case you miss:"),
        'effect_A' => _("Lose 1 {GEAR_ICON} Card and gain 1 {PSYCH_ICON}"),
        'effect_B_flavor' => _("Go for it!"),
        'effect_B' => _("Roll the Risk Die\n
                         {CHECKMARK_ICON}: Gain 3 Cards from the Portaledge\n
                         {CARDS_ICON}/{CARD_PSYCH_ICON}: Give those Assets to another player"),
        'x_y' => [0, 500],
    ],

    '52' => [
        'name' => 'that_breeze_tho',
        'description' => _("That breeze tho"),
        'effect_A_flavor' => _("Can everyone feel the cool breeze?"),
        'effect_A' => _("All players gain 2 {PSYCH_ICON}"),
        'effect_B_flavor' => _("Is it just you?"),
        'effect_B' => _("You gain 1 {PSYCH_ICON}"),
        'x_y' => [100, 500],
    ],

    '53' => [
        'name' => 'whipper',
        'description' => _("Whipper!"),
        'effect_A_flavor' => _("Shoot right back up:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 Skill Card 
                         {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON}"),
        'effect_B_flavor' => _("Ask your partner to lead it:"),
        'effect_B' => _("Give another player 2 Cards and draw 1 Card from The Portaledge"),
        'x_y' => [200, 500],
    ],

    '54' => [
        'name' => 'bring_the_wide_gear',
        'description' => _("Bring the wide gear"),
        'effect_A_flavor' => _("Which Pitch has a wide crack that wasn't marked in
                                the guidebook?"),
        'effect_A' => _("Choose a Pitch and add 1 {GEAR_ICON} Token to it - any player
                         climbing that Pitch will need that additional Asset"),
        'x_y' => [300, 500],
    ],

    '55' => [
        'name' => 'sun_beats_down',
        'description' => _("Sun beats down"),
        'effect_A_flavor' => _("Is it hot as heck today?"),
        'effect_A' => _("Every player on a sunny Pitch (light colored tiles) 
                         loses 1 {WATER_ICON}"),
        'effect_B_flavor' => _("Is it chilly as heck today?"),
        'effect_B' => _("Every player on a sunny Pitch (light colored tiles)
                         gains 1 {PSYCH_ICON}"),
        'x_y' => [400, 500],
    ],

    '56' => [
        'name' => 'sewed_it_up',
        'description' => _("Sewed it up"),
        'effect_A_flavor' => _("Backclean to retrieve some gear:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {GEAR_ICON} Card"),
        'effect_B_flavor' => _("Run it out the top:"),
        'effect_B' => _("Lose 1 {GEAR_ICON} Card and gain 1 {PSYCH_ICON}"),
        'x_y' => [500, 500],
    ],

    '57' => [
        'name' => 'missed_the_belay',
        'description' => _("Missed the belay"),
        'effect_A_flavor' => _("Climb to the bolted anchor section:"),
        'effect_A' => _("Lose 1 Skill Card {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON}
                         and gain 1 {GEAR_ICON} Card"),
        'effect_B_flavor' => _("Build a sketchy anchor where you are:"),
        'effect_B' => _("Lose 1 {GEAR_ICON} Card and draw a Card from The Spread"),
        'x_y' => [600, 500],
    ],

    '58' => [
        'name' => 'snake_on_the_ledge',
        'description' => _("Snake on the ledge"),
        'effect_A_flavor' => _("Plug a piece and hang until it slithers away:"),
        'effect_A' => _("Lose 1 {GEAR_ICON} Card and gain 1 {WATER_ICON}"),
        'effect_B_flavor' => _("Quickly scurry around it:"),
        'effect_B' => _("Roll the Risk Die\n
                         {CHECKMARK_ICON}: Gain 3 Cards from The Portaledge\n
                         {CARDS_ICON}/{CARD_PSYCH_ICON}: Give those Assets to another player"),
        'x_y' => [700, 500],
    ],

    '59' => [
        'name' => 'high_exposure',
        'description' => _("High Exposure"),
        'effect_A_flavor' => _("Frantically place gear to calm your nerves:"),
        'effect_A' => _("Lose 1 {GEAR_ICON} Card and gain 1 {PSYCH_ICON}"),
        'effect_B_flavor' => _("Sprint up to the belay ledge:"),
        'effect_B' => _("Lose 1 {WATER_ICON} and gain 1 {PSYCH_ICON}"),
        'x_y' => [800, 500],
    ],

    '60' => [
        'name' => 'slow_party',
        'description' => _("Slow party"),
        'effect_A_flavor' => _("Confront them and ask if you can go first:"),
        'effect_A' => _("All other players draw 1 Card from The Portaledge"),
        'effect_B_flavor' => _("Patiently wait behind them:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 Summit Beta Token"),
        'x_y' => [900, 500],
    ],

    '61' => [
        'name' => 'mountain_goat_blocks_the_route',
        'description' => _("Mountain goat blocks the route"),
        'effect_A_flavor' => _("Climb up a short slab to bypass him:"),
        'effect_A' => _("Lose 1 {WATER_ICON} and gain 1 {SLAB_ICON} Card"),
        'effect_B_flavor' => _("Wait for him to move:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 {WATER_ICON}"),
        'x_y' => [0, 600],
    ],

    '62' => [
        'name' => 'big_swing_potential',
        'description' => _("Big swing potential"),
        'effect_A_flavor' => _("Sew it up to protect your follower:"),
        'effect_A' => _("Lose 1 {GEAR_ICON} Card and gain 1 {PSYCH_ICON}"),
        'effect_B_flavor' => _("Run it out and hope they don't fall:"),
        'effect_B' => _("Roll the Risk Die\n
                         {CHECKMARK_ICON}: Gain 3 Cards from The Portaledge\n
                         {CARDS_ICON}/{CARD_PSYCH_ICON}: Give those Assets to another player"),
        'x_y' => [100, 600],
    ],

    '63' => [
        'name' => 'rockfall',
        'description' => _("Rockfall!"),
        'effect_A_flavor' => _("A crucial hold broke off!"),
        'effect_A' => _("Add 1 Skill Token {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON} to
                         any Pitch - any player climbing that Pitch will need
                         that additional Asset"),
        'x_y' => [200, 600],
    ],

    '64' => [
        'name' => 'sucker_holds',
        'description' => _("Sucker holds"),
        'effect_A_flavor' => _("Hang for a bit to figure it out:"),
        'effect_A' => _("Lose 1 {FACE_ICON} Card and gain 1 {WATER_ICON}"),
        'effect_B_flavor' => _("Launch into the sequence and hope for the best:"),
        'effect_B' => _("Roll the Risk Die\n
                         {CHECKMARK_ICON}: Gain 3 Cards from The Portaledge\n
                         {CARDS_ICON}/{CARD_PSYCH_ICON}: Give those Assets to another player"),
        'x_y' => [300, 600],
    ],

    '65' => [
        'name' => 'blown_out_toe',
        'description' => _("Blown out toe"),
        'effect_A_flavor' => _("Ask your partner to wait while you try to repair your shoes:"),
        'effect_A' => _("Give another player 1 Card and gain 1 {WATER_ICON}"),
        'effect_B_flavor' => _("Ignore it and keep climbing:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 Skill Card 
                         {FACE_ICON}/{CRACK_ICON}/{SLAB_ICON}"),
        'x_y' => [400, 600],
    ],

    '66' => [
        'name' => 'awesome_view',
        'description' => _("Awesome view"),
        'effect_A_flavor' => _("Take pictures of everyone else on the mountain:"),
        'effect_A' => _("All players draw 1 Card from The Portaledge"),
        'effect_B_flavor' => _("Climb over to a nice ledge to take in the scenery:"),
        'effect_B' => _("Lose 1 {FACE_ICON} Card and gain 1 {PSYCH_ICON}"),
        'x_y' => [500, 600],
    ],

    '67' => [
        'name' => 'crag_dog',
        'description' => _("Crag dog"),
        'effect_A_flavor' => _("Is he barking non-stop?"),
        'effect_A' => _("All other players lose 1 {PSYCH_ICON}"),
        'effect_B_flavor' => _("Is he well-behaved?"),
        'effect_B' => _("All players gain 2 {PSYCH_ICON}"),
        'x_y' => [600, 600],
    ],

    '68' => [
        'name' => 'freezing_cold',
        'description' => _("Freezing cold"),
        'effect_A_flavor' => _("Keep climbing and share your hand warmers:"),
        'effect_A' => _("Give another player 2 Cards and draw 2 Cards from The Portaledge"),
        'effect_B_flavor' => _("Warm up on a sunny ledge:"),
        'effect_B' => _("Every player on a sunny Pitch gains 1 {PSYCH_ICON}"),
        'x_y' => [700, 600],
    ],

    '69' => [
        'name' => 'dropped_phone',
        'description' => _("Dropped phone"),
        'effect_A_flavor' => _("Yell down to the party below and ask them to retrieve it:"),
        'effect_A' => _("Choose another player to gain 1 Summit Beta Token"),
        'effect_B_flavor' => _("Accept your phone's fate and keep climbing:"),
        'effect_B' => _("Lose 1 {PSYCH_ICON} and gain 1 Card from The Portaledge"),
        'x_y' => [800, 600],
    ],

    '70' => [
        'name' => 'elvis_leg',
        'description' => _("Elvis leg"),
        'effect_A_flavor' => _("Ignore it:"),
        'effect_A' => _("Lose 1 {PSYCH_ICON} and gain 1 {SLAB_ICON} Card"),
        'effect_B_flavor' => _("Shake it out:"),
        'effect_B' => _("Lose 1 {SLAB_ICON} Card and gain 1 {PSYCH_ICON}"),
        'x_y' => [900, 600],
    ],
];

$this->personal_objectives = [
    '1' => [
        'name' => 'rocky_mountains_tour',
        'description' => _("Rocky Mountains Tour"),
        'text' => _('Climb 3 Pitches in and around the Rocky Mountains'),
        'score' => 4,
        'pitches' => ['black_elk', 'red_rider', 'rebuffats_arete', 'edge_of_time', 'irenes_arete',
                       'bulldog_arete', 'black_snake', 'bishop_jaggers'],
        'x_y' => [0, 0],
    ],

    '2' => [
        'name' => 'a_day_at_the_zoo',
        'description' => _("A Day at the Zoo"),
        'text' => _('Climb 3 Pitches with an animal or insect in its name'),
        'score' => 4,
        'pitches' => ['bird_cage', 'black_elk', 'lonesome_dove', 'bulldog_arete', 
                      'black_snake', 'bee_sting_corner', 'dinkus_dog'],
        'x_y' => [100, 0],
    ],

    '3' => [
        'name' => 'call_it_like_you_see_it',
        'description' => _("Call it Like You See it"),
        'text' => _('Climb 3 Pitches with the type of route in its name'),
        'score' => 2,
        'pitches' => ['rogers_roof', 'corrugation_corner', 'rebuffats_arete', 'leap_year_flake',
                      'irenes_arete', 'bee_sting_corner', 'flakes_of_wrath', 'bulldog_arete',
                      'slab_aptitude_test', 'teflon_corner'],
        'x_y' => [200, 0],
    ],

    '4' => [
        'name' => 'sporty_spice',
        'description' => _("Sporty Spice"),
        'text' => _('Climb 3 sport routes'),
        'score' => 3,
        'pitches' => ['tierrany', 'screaming_yellow_zonkers', 'slab_aptitude_test', 'edge_of_time', 
                      'flight_of_the_gumby', 'lonesome_dove', 'bulldog_arete', 'no_place_like_home',
                      'red_rider'],
        'x_y' => [300, 0],
    ],

    '5' => [
        'name' => 'rainbow_vibes',
        'description' => _("Rainbow Vibes"),
        'text' => _('Climb 3 pitches with a color in its name'),
        'score' => 5,
        'pitches' => ['black_elk', 'desert_gold', 'red_rider', 'scarlet_begonias', 'black_snake',
                      'screaming_yellow_zonkers'],
        'x_y' => [400, 0],
    ],

    '6' => [
        'name' => 'southern_rock',
        'description' => _("Southern Rock"),
        'text' => _('Climb 3 Pitches located in Southeastern states'),
        'score' => 5,
        'pitches' => ['tierrany', 'flight_of_the_gumby', 'no_place_like_home', 'bee_sting_corner', 
                      'dinkus_dog', 'closer_to_the_heart'],
        'x_y' => [500, 0],
    ],

    '7' => [
        'name' => 'climb_your_way_out',
        'description' => _("Climb Your Way Out"),
        'text' => _('Climb 3 Pitches located in a gorge or canyon'),
        'score' => 4,
        'pitches' => ['fiddler_on_the_roof', 'desert_gold', 'half-a-finger', 'rebuffats_arete', 
                      'flight_of_the_gumby', 'bulldog_arete', 'no_place_like_home',
                      'black_snake'],
        'x_y' => [0, 100],
    ],

    '8' => [
        'name' => 'desert_days',
        'description' => _("Desert Days"),
        'text' => _('Climb 3 Pitches located in a desert'),
        'score' => 3,
        'pitches' => ['fiddler_on_the_roof', 'desert_gold', 'skull', 'dr_rubos_wild_ride', 
                      'abracadaver', 'belly_full_of_bad_berries', 'tooth_or_consequences', 'old_man',
                      'leap_year_flake', 'flakes_of_wrath', 'scarlet_begonias'],
        'x_y' => [100, 100],
    ],

    '9' => [
        'name' => 'glory_days_of_the_piton',
        'description' => _("Glory Days of the Piton"),
        'text' => _('Climb 3 Pitches established before 1970'),
        'score' => 3,
        'pitches' => ['rogers_roof', 'bird_cage', 'bonnies_roof', 'outer_space', 
                      'rebuffats_arete', 'irenes_arete', 'corrugation_corner', 'teflon_corner',
                      'chapel_pond_slab', 'bishop_jaggers'],
        'x_y' => [200, 100],
    ],

    '10' => [
        'name' => 'social_butterfly',
        'description' => _("Social Butterfly"),
        'text' => _('Climb 3 Pitches with a person in its name'),
        'score' => 3,
        'pitches' => ['rogers_roof', 'bonnies_roof', 'rebuffats_arete', 'irenes_arete', 
                      'dr_rubos_wild_ride', 'the_don_juan_wall', 'bishop_jaggers'],
        'x_y' => [300, 100],
    ],

    '11' => [
        'name' => 'full_body_workout',
        'description' => _("Full Body Workout"),
        'text' => _('Climb 3 Pitches with a body part in its name'),
        'score' => 4,
        'pitches' => ['half-a-finger', 'skull', 'bloody_fingers', 'belly_full_of_bad_berries', 
                      'fickle_finger_of_fate', 'heart_of_the_country', 'closer_to_the_heart',
                      'tooth_or_consequences'],
        'x_y' => [400, 100],
    ],

    '12' => [
        'name' => 'national_parks_pass',
        'description' => _("National Parks Pass"),
        'text' => _('Climb 3 Pitches located in a National Park'),
        'score' => 4,
        'pitches' => ['leap_year_flake', 'scarlet_begonias', 'irenes_arete', 'flight_of_the_gumby',
                      'black_snake', 'psychic_turbulence', 'teflon_corner'],
        'x_y' => [500, 100],
    ],
];

$this->characters = [
    '1' => [
        'name' => 'rope_gun',
        'description' => _("Rope Gun"),
        'flavor' => _('You fly up everything with ease'),
        'effect' => _('You may use 1 less Water on each Pitch you climb.'),
        'water_psych' => 4,
        'home_crag' => _('Red Rock'), //bolded
        'translation' => _('Newe (Western Shoshone), Nuwuvi (Southern Paiute), and 
                          Nüwüwü (Chemeheuvi) Ancestral Land'), //italicized
        'x_y' => [0, 300],
        'ab_x_y' => [200, 100],
    ],

    '2' => [
        'name' => 'free_soloist',
        'description' => _("Free Soloist"),
        'flavor' => _('You don\'t climb with gear'),
        'effect' => _('for each Gear Card that is required for a Pitch, substitute with any
                     Skill Card. Gain 1 extra Asset every time you rest.'),
        'water_psych' => 6,
        'home_crag' => _('Yosemite'),
        'translation' => _('Me-Wuk, Numu (Northern Paiute), and Western Mono/Monache Ancestral Land'),
        'x_y' => [100, 300],
        'ab_x_y' => [300, 100],
    ],

    '3' => [
        'name' => 'the_dirtbag',
        'description' => _("The Dirtbag"),
        'flavor' => _('You\'ve picked up a lot of booty gear'),
        'effect' => _('on each Pitch, you may substitute 1 Gear Card for 1 of the
                     other required Assets'),
        'water_psych' => 4,
        'home_crag' => _('Joshua Tree'),
        'translation' => _('Cahuilla, Newe (Western Shoshone), and Yuhaviatam/Maarenga\'yam
                          (Serrano) Ancestral Land'),
        'x_y' => [200, 300],
        'ab_x_y' => [0, 100],
    ],

    '4' => [
        'name' => 'sendy_jammer',
        'description' => _("Sendy Jammer"),
        'flavor' => _('Desert cracks have trained you well'),
        'effect' => _('all Gear Cards you play can be counted as any 1 Technique symbol'),
        'water_psych' => 5,
        'home_crag' => _('Indian Creek'),
        'translation' => _('Pueblos and Ute Ancestral Land'),
        'x_y' => [300, 300],
        'ab_x_y' => [100, 100],
    ],

    '5' => [
        'name' => 'the_overstoker',
        'description' => _("The Overstoker"),
        'flavor' => _('Your enthusiasm for climbing is off the charts!'),
        'effect' => _('on each Pitch, you may substitute 1 Psych for 1 of the other required Assets'),
        'water_psych' => 6,
        'home_crag' => _('Smith Rock'),
        'translation' => _('Confederated Tribes of Warm Springs and Tenino Ancestral Land'),
        'x_y' => [400, 300],
        'ab_x_y' => [200, 0],
    ],

    '6' => [
        'name' => 'young_prodigy',
        'description' => _("Young Prodigy"),
        'flavor' => _('You pick up new skills quickly but are still getting used to placing gear'),
        'effect' => _('you need only 3 Cards to earn a Permanent Skill Token, but 5 Cards to
                     earn a Permanent Gear Token.'),
        'water_psych' => 4,
        'home_crag' => _('Local climbing gym'),
        'translation' => '',
        'x_y' => [500, 300],
        'ab_x_y' => [300, 0],
    ],

    '7' => [
        'name' => 'bold_brit',
        'description' => _("Bold Brit"),
        'flavor' => _('You take big risks on sketchy gear placements'),
        'effect' => _('use only 1 Gear Card on each Pitch that requires Gear.'),
        'water_psych' => 5,
        'home_crag' => _('Peak District'),
        'translation' => '',
        'x_y' => [600, 300],
        'ab_x_y' => [0, 0],
    ],

    '8' => [
        'name' => 'phil',
        'description' => _("Phil"),
        'flavor' => _('You love to push yourself'),
        'effect' => _('you must roll the Risk Die on every Pitch you climb. Start with 
                     2 Summit Beta Tokens, and gain 1 extra Asset every time you rest.'),
        'water_psych' => 7,
        'home_crag' => _('El Dorado Canyon'),
        'translation' => _('Arapaho, Cheyenne, and Ute Ancestral Land'),
        'x_y' => [700, 300],
        'ab_x_y' => [100, 0],
    ],

    '9' => [
        'name' => 'crag_mama',
        'description' => _("Crag Mama"),
        'flavor' => _('You have a mother\'s intuition'),
        'effect' => _('You may use 1 fewer Skill Card on all Pitches below The Ledge.'),
        'water_psych' => 4,
        'home_crag' => _('New River Gorge'),
        'translation' => _('Moneton, S\'atsoyaha (Yuchi), and Tutelo Ancestral Land'),
        'x_y' => [0, 400],
        'ab_x_y' => [200, 200],
    ],

    '10' => [
        'name' => 'cool-headed_crimper',
        'description' => _("Cool-Headed Crimper"),
        'flavor' => _('You stay cool under pressure, no matter what comes your way.'),
        'effect' => _('After climbing each Pitch, draw 2 Climbing Cards and choose 1
                     to resolve. Discard the other.'),
        'water_psych' => 6,
        'home_crag' => _('Sedona'),
        'translation' => _('Hohokam, Hopitutskwa, Ndee/Nnēē: (Western Apache), Pueblos,
                          and Yavapaiv Apache Ancestral Land'),
        'x_y' => [100, 400],
        'ab_x_y' => [300, 200],
    ],

    '11' => [
        'name' => 'bionic_woman',
        'description' => _("Bionic Woman"),
        'flavor' => _('As an above-knee amputee, you have to get creative with your technique'),
        'effect' => _('on each Pitch, you may substitute 1 Skill Card with a different Skill Card of your choice.'),
        'water_psych' => 4,
        'home_crag' => _('Red River Gorge'),
        'translation' => _('Adena, Cherokee, Hopewell, Osage, S\'atsoyaha (Yuchi), and Shawnee Ancestral Land'),
        'x_y' => [200, 400],
        'ab_x_y' => [0, 200],
    ],

    '12' => [
        'name' => 'buff_boulderer',
        'description' => _("Buff Boulderer"),
        'flavor' => _('You have no problem with difficult moves'),
        'effect' => _('use 1 fewer Asset to climb any 4 Point Pitch, and use 2 fewer Assets to climb any 5 Point Pitch.'),
        'water_psych' => 6,
        'home_crag' => _('Bishop'),
        'translation' => _('Eastern Mono/Monache, Newe (Western Shoshone), and Numu (Northern Paiute) Ancestral Land'),
        'x_y' => [300, 400],
        'ab_x_y' => [100, 200],
    ],
];