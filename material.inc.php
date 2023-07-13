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
 */


$this->pitches = [
    '1' => [
        'name' => 'dinkus_dog',
        'description' => clienttranslate("Dinkus Dog"),
        'value' => 1,
        'type' => 'slab',
        'type_description' => clienttranslate("Slab"),
        'shade' => 1,
        'requirements' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 0,
            'slab' => 2,
            'any_skill' => 1,
            'water' => 1,
            'psych' => 0,
        ],
        'personal_objectives' => ['southern_rock', 'a_day_at_the_zoo'],
        'x_y' => [0, 0],
    ],

    '2' => [
        'name' => 'rogers_roof',
        'description' => clienttranslate("Roger's Roof"),
        'value' => 1,
        'type' => 'roof',
        'type_description' => clienttranslate("Roof"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
            'any_skill' => 1,
            'water' => 1,
            'psych' => 0,
        ],
        'personal_objectives' => ['glory_days_of_the_piton', 'social_butterfly', 'call_it_like_you_see_it'],
        'x_y' => [100, 0],
    ],

    '3' => [
        'name' => 'corrugation_corner',
        'description' => clienttranslate("Corrugation Corner"),
        'value' => 1,
        'type' => 'corner',
        'type_description' => clienttranslate("Corner"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
            'any_skill' => 1,
            'water' => 1,
            'psych' => 0,
        ],
        'personal_objectives' => ['glory_days_of_the_piton', 'call_it_like_you_see_it'],
        'x_y' => [200, 0],
    ],

    '4' => [
        'name' => 'rebuffats_arete',
        'description' => clienttranslate("Rebuffat's Arete"),
        'value' => 1,
        'type' => 'arete',
        'type_description' => clienttranslate("Arete"),
        'shade' => 1,
        'requirements' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
            'any_skill' => 1,
            'water' => 2,
            'psych' => 0,
        ],
        'personal_objectives' => ['glory_days_of_the_piton', 'social_butterfly', 'climb_your_way_out,', 
                                  'call_it_like_you_see_it', 'rocky_mountains_tour'],
        'x_y' => [300, 0],
    ],

    '5' => [
        'name' => 'leap_year_flake',
        'description' => clienttranslate("Leap Year Flake"),
        'value' => 1,
        'type' => 'flake',
        'type_description' => clienttranslate("Flake"),
        'shade' => 1,
        'requirements' => [
            'gear' => 1,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
            'any_skill' => 1,
            'water' => 1,
            'psych' => 0,
        ],
        'personal_objectives' => ['national_parks_pass', 'call_it_like_you_see_it', 'desert_days'],
        'x_y' => [400, 0],
    ],

    '6' => [
        'name' => 'half-a-finger',
        'description' => clienttranslate("Half-a-finger"),
        'value' => 1,
        'type' => 'crack',
        'type_description' => clienttranslate("Crack"),
        'shade' => 0,
        'requirements' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 1,
            'slab' => 0,
            'any_skill' => 1,
            'water' => 2,
            'psych' => 0,
        ],
        'personal_objectives' => ['full_body_workout', 'climb_your_way_out'],
        'x_y' => [500, 0],
    ],

    '7' => [
        'name' => 'fiddler_on_the_roof',
        'description' => clienttranslate("Fiddler on the Roof"),
        'value' => 1,
        'type' => 'roof',
        'type_description' => clienttranslate("Roof"),
        'shade' => 1,
        'requirements' => [
            'gear' => 2,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
            'any_skill' => 1,
            'water' => 0,
            'psych' => 0,
        ],
        'personal_objectives' => ['desert_days', 'call_it_like_you_see_it', 'climb_your_way_out'],
        'x_y' => [600, 0],
    ],

    '8' => [
        'name' => 'edge_of_time',
        'description' => clienttranslate("Edge of Time"),
        'value' => 1,
        'type' => 'arete',
        'type_description' => clienttranslate("Arete"),
        'shade' => 1,
        'requirements' => [
            'gear' => 1,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
            'any_skill' => 1,
            'water' => 1,
            'psych' => 0,
        ],
        'personal_objectives' => ['sporty_spice', 'rocky_mountains_tour'],
        'x_y' => [700, 0],
    ],

    '9' => [
        'name' => 'chapel_pond_slab',
        'description' => clienttranslate("Chapel Pond Slab"),
        'value' => 1,
        'type' => 'slab',
        'type_description' => clienttranslate("Slab"),
        'shade' => 0,
        'requirements' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 0,
            'slab' => 1,
            'any_skill' => 1,
            'water' => 0,
            'psych' => 2,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'glory_days_of_the_piton'],
        'x_y' => [800, 0],
    ],

    '10' => [
        'name' => 'old_man',
        'description' => clienttranslate("Old Man"),
        'value' => 1,
        'type' => 'corner',
        'type_description' => clienttranslate("Corner"),
        'shade' => 1,
        'requirements' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 1,
            'any_skill' => 1,
            'water' => 0,
            'psych' => 1,
        ],
        'personal_objectives' => ['desert_days'],
        'x_y' => [900, 0],
    ],

    '11' => [
        'name' => 'outer_space',
        'description' => clienttranslate("Outer Space"),
        'value' => 1,
        'type' => 'crack',
        'type_description' => clienttranslate("Crack"),
        'shade' => 1,
        'requirements' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 1,
            'slab' => 1,
            'any_skill' => 1,
            'water' => 0,
            'psych' => 1,
        ],
        'personal_objectives' => ['glory_days_of_the_piton'],
        'x_y' => [1000, 0],
    ],

    '12' => [
        'name' => 'the_beast_flake',
        'description' => clienttranslate("The Beast Flake"),
        'value' => 1,
        'type' => 'flake',
        'type_description' => clienttranslate("Flake"),
        'shade' => 1,
        'requirements' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 2,
            'any_skill' => 1,
            'water' => 0,
            'psych' => 0,
        ],
        'personal_objectives' => ['call_it_like_you_see_it'],
        'x_y' => [1100, 0],
    ],

    '13' => [
        'name' => 'bird_cage',
        'description' => clienttranslate("Bird Cage"),
        'value' => 2,
        'type' => 'roof',
        'type_description' => clienttranslate("Roof"),
        'shade' => 0,
        'requirements' => [
            'gear' => 1,
            'face' => 1,
            'crack' => 0,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 2,
        ],
        'personal_objectives' => ['a_day_at_the_zoo', 'glory_days_of_the_piton'],
        'x_y' => [0, 100],
    ],

    '14' => [
        'name' => 'bishop_jaggers',
        'description' => clienttranslate("Bishop Jaggers"),
        'value' => 2,
        'type' => 'slab',
        'type_description' => clienttranslate("Slab"),
        'shade' => 1,
        'requirements' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 2,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['glory_days_of_the_piton', 'social_butterfly', 'rocky_mountains_tour'],
        'x_y' => [100, 100],
    ],

    '15' => [
        'name' => 'closer_to_the_heart',
        'description' => clienttranslate("Closer to the Heart"),
        'value' => 2,
        'type' => 'slab',
        'type_description' => clienttranslate("Slab"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'face' => 1,
            'crack' => 0,
            'slab' => 2,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 0,
        ],
        'personal_objectives' => ['full_body_workout', 'southern_rock'],
        'x_y' => [200, 100],
    ],

    '16' => [
        'name' => 'irenes_arete',
        'description' => clienttranslate("Irene's Arete"),
        'value' => 2,
        'type' => 'arete',
        'type_description' => clienttranslate("Arete"),
        'shade' => 0,
        'requirements' => [
            'gear' => 1,
            'face' => 2,
            'crack' => 1,
            'slab' => 0,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 0,
        ],
        'personal_objectives' => ['national_parks_pass', 'social_butterfly', 'glory_days_of_the_piton',
                                  'call_it_like_you_see_it', 'rocky_mountains_tour'],
        'x_y' => [300, 100],
    ],

    '17' => [
        'name' => 'flight_of_the_gumby',
        'description' => clienttranslate("Flight of the Gumby"),
        'value' => 2,
        'type' => 'arete',
        'type_description' => clienttranslate("Arete"),
        'shade' => 1,
        'requirements' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 2,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 1,
        ],
        'personal_objectives' => ['sporty_spice', 'climb_your_way_out', 'southern_rock',
                                  'national_parks_pass'],
        'x_y' => [400, 100],
    ],

    '18' => [
        'name' => 'bee_sting_corner',
        'description' => clienttranslate("Bee Sting Corner"),
        'value' => 2,
        'type' => 'corner',
        'type_description' => clienttranslate("Corner"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'face' => 0,
            'crack' => 0,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'a_day_at_the_zoo', 'southern_rock'],
        'x_y' => [500, 100],
    ],

    '19' => [
        'name' => 'black_snake',
        'description' => clienttranslate("Black Snake"),
        'value' => 2,
        'type' => 'corner',
        'type_description' => clienttranslate("Corner"),
        'shade' => 1,
        'requirements' => [
            'gear' => 2,
            'face' => 1,
            'crack' => 0,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 0,
        ],
        'personal_objectives' => ['rainbow_vibes', 'climb_your_way_out', 'rocky_mountains_tour',
                                  'national_parks_pass', 'a_day_at_the_zoo'],
        'x_y' => [600, 100],
    ],

    '20' => [
        'name' => 'flakes_of_wrath',
        'description' => clienttranslate("Flakes of Wrath"),
        'value' => 2,
        'type' => 'flake',
        'type_description' => clienttranslate("Flake"),
        'shade' => 0,
        'requirements' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 2,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'desert_days'],
        'x_y' => [700, 100],
    ],

    '21' => [
        'name' => 'the_fickle_finger_of_fate',
        'description' => clienttranslate("The Fickle Finger of Fate"),
        'value' => 2,
        'type' => 'flake',
        'type_description' => clienttranslate("Flake"),
        'shade' => 0,
        'requirements' => [
            'gear' => 0,
            'face' => 2,
            'crack' => 2,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 0,
        ],
        'personal_objectives' => ['full_body_workout'],
        'x_y' => [800, 100],
    ],

    '22' => [
        'name' => 'dr_rubos_wild_ride',
        'description' => clienttranslate("Dr. Rubo's Wild Ride"),
        'value' => 2,
        'type' => 'crack',
        'type_description' => clienttranslate("Crack"),
        'shade' => 1,
        'requirements' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 2,
            'slab' => 0,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['social_butterfly', 'desert_days'],
        'x_y' => [900, 100],
    ],

    '23' => [
        'name' => 'skull',
        'description' => clienttranslate("Skull"),
        'value' => 2,
        'type' => 'crack',
        'type_description' => clienttranslate("Crack"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'face' => 1,
            'crack' => 1,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 0,
        ],
        'personal_objectives' => ['desert_days', 'full_body_workout'],
        'x_y' => [1000, 100],
    ],

    '24' => [
        'name' => 'bonnies_roof',
        'description' => clienttranslate("Bonnie's Roof"),
        'value' => 2,
        'type' => 'roof',
        'type_description' => clienttranslate("Roof"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'face' => 0,
            'crack' => 1,
            'slab' => 0,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'glory_days_of_the_piton', 'social_butterfly'],
        'x_y' => [1100, 100],
    ],

    '25' => [
        'name' => 'screaming_yellow_zonkers',
        'description' => clienttranslate("Screaming Yellow Zonkers"),
        'value' => 3,
        'type' => 'slab',
        'type_description' => clienttranslate("Slab"),
        'shade' => 1,
        'requirements' => [
            'gear' => 1,
            'face' => 2,
            'crack' => 1,
            'slab' => 2,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 0,
        ],
        'personal_objectives' => ['sporty_spice', 'rainbow_vibes'],
        'x_y' => [0, 200],
    ],

    '26' => [
        'name' => 'the_don_juan_wall',
        'description' => clienttranslate("The Don Juan Wall"),
        'value' => 3,
        'type' => 'corner',
        'type_description' => clienttranslate("Corner"),
        'shade' => 0,
        'requirements' => [
            'gear' => 3,
            'face' => 1,
            'crack' => 2,
            'slab' => 0,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 0,
        ],
        'personal_objectives' => ['social_butterfly'],
        'x_y' => [100, 200],
    ],

    '27' => [
        'name' => 'bloody_fingers',
        'description' => clienttranslate("Bloody Fingers"),
        'value' => 3,
        'type' => 'crack',
        'type_description' => clienttranslate("Crack"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'face' => 2,
            'crack' => 2,
            'slab' => 0,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 0,
        ],
        'personal_objectives' => ['full_body_workout'],
        'x_y' => [200, 200],
    ],

    '28' => [
        'name' => 'black_elk',
        'description' => clienttranslate("Black Elk"),
        'value' => 3,
        'type' => 'roof',
        'type_description' => clienttranslate("Roof"),
        'shade' => 1,
        'requirements' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 2,
            'slab' => 2,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 2,
        ],
        'personal_objectives' => ['rainbow_vibes', 'a_day_at_the_zoo', 'rocky_mountains_tour'],
        'x_y' => [300, 200],
    ],

    '29' => [
        'name' => 'tierrany',
        'description' => clienttranslate("Tierrany"),
        'value' => 4,
        'type' => 'roof',
        'type_description' => clienttranslate("Roof"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'face' => 3,
            'crack' => 2,
            'slab' => 0,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 0,
        ],
        'personal_objectives' => ['sporty_spice', 'southern_rock'],
        'x_y' => [400, 200],
    ],

    '30' => [
        'name' => 'abracadaver',
        'description' => clienttranslate("Abracadaver"),
        'value' => 4,
        'type' => 'crack',
        'type_description' => clienttranslate("Crack"),
        'shade' => 1,
        'requirements' => [
            'gear' => 2,
            'face' => 0,
            'crack' => 2,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 2,
            'psych' => 0,
        ],
        'personal_objectives' => ['desert_days'],
        'x_y' => [500, 200],
    ],

    '31' => [
        'name' => 'bulldog_arete',
        'description' => clienttranslate("Bulldog Arete"),
        'value' => 4,
        'type' => 'arete',
        'type_description' => clienttranslate("Arete"),
        'shade' => 0,
        'requirements' => [
            'gear' => 1,
            'face' => 1,
            'crack' => 1,
            'slab' => 2,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 2,
        ],
        'personal_objectives' => ['sporty_spice', 'call_it_like_you_see_it', 'a_day_at_the_zoo',
                                  'rocky_mountains_tour', 'climb_your_way_out'],
        'x_y' => [600, 200],
    ],

    '32' => [
        'name' => 'red_rider',
        'description' => clienttranslate("Red Rider"),
        'value' => 4,
        'type' => 'flake',
        'type_description' => clienttranslate("Flake"),
        'shade' => 0,
        'requirements' => [
            'gear' => 3,
            'face' => 1,
            'crack' => 1,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 1,
        ],
        'personal_objectives' => ['rainbow_vibes', 'sporty_spice', 'rocky_mountains_tour'],
        'x_y' => [700, 200],
    ],

    '33' => [
        'name' => 'tooth_or_consequences',
        'description' => clienttranslate("Tooth or Consequences"),
        'value' => 4,
        'type' => 'slab',
        'type_description' => clienttranslate("Slab"),
        'shade' => 0,
        'requirements' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 1,
            'slab' => 2,
            'any_skill' => 0,
            'water' => 2,
            'psych' => 1,
        ],
        'personal_objectives' => ['desert_days', 'full_body_workout'],
        'x_y' => [800, 200],
    ],

    '34' => [
        'name' => 'lonesome_dove',
        'description' => clienttranslate("Lonesome Dove"),
        'value' => 3,
        'type' => 'arete',
        'type_description' => clienttranslate("Arete"),
        'shade' => 0,
        'requirements' => [
            'gear' => 1,
            'face' => 2,
            'crack' => 1,
            'slab' => 0,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['sporty_spice', 'a_day_at_the_zoo'],
        'x_y' => [900, 200],
    ],

    '35' => [
        'name' => 'heart_of_the_country',
        'description' => clienttranslate("Heart of the Country"),
        'value' => 3,
        'type' => 'flake',
        'type_description' => clienttranslate("Flake"),
        'shade' => 0,
        'requirements' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 1,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 2,
            'psych' => 1,
        ],
        'personal_objectives' => ['full_body_workout'],
        'x_y' => [1000, 200],
    ],

    '36' => [
        'name' => 'the_trifecta',
        'description' => clienttranslate("The Trifecta"),
        'value' => 3,
        'type' => 'wild',
        'type_description' => clienttranslate("Wild"),
        'shade' => 2,
        'requirements' => [
            'gear' => 2,
            'face' => 1,
            'crack' => 1,
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
        'description' => clienttranslate("Psychic Turbulance"),
        'value' => 4,
        'type' => 'corner',
        'type_description' => clienttranslate("Corner"),
        'shade' => 0,
        'requirements' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 3,
            'slab' => 2,
            'any_skill' => 0,
            'water' => 0,
            'psych' => 1,
        ],
        'personal_objectives' => ['national_parks_pass'],
        'x_y' => [1200, 200],
    ],

    '38' => [
        'name' => 'slab_aptitude_test',
        'description' => clienttranslate("The S.A.T. (Slab Aptitude Test)"),
        'value' => 5,
        'type' => 'slab',
        'type_description' => clienttranslate("Slab"),
        'shade' => 1,
        'requirements' => [
            'gear' => 2,
            'face' => 0,
            'crack' => 0,
            'slab' => 3,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 2,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'sporty_spice'],
        'x_y' => [0, 300],
    ],

    '39' => [
        'name' => 'desert_gold',
        'description' => clienttranslate("Desert Gold"),
        'value' => 5,
        'type' => 'roof',
        'type_description' => clienttranslate("Roof"),
        'shade' => 1,
        'requirements' => [
            'gear' => 1,
            'face' => 2,
            'crack' => 2,
            'slab' => 0,
            'any_skill' => 0,
            'water' => 2,
            'psych' => 1,
        ],
        'personal_objectives' => ['rainbow_vibes', 'desert_days', 'climb_your_way_out'],
        'x_y' => [100, 300],
    ],

    '40' => [
        'name' => 'no_place_like_home',
        'description' => clienttranslate("No Place Like Home"),
        'value' => 5,
        'type' => 'arete',
        'type_description' => clienttranslate("Arete"),
        'shade' => 0,
        'requirements' => [
            'gear' => 2,
            'face' => 2,
            'crack' => 0,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 2,
        ],
        'personal_objectives' => ['sporty_spice', 'southern_rock', 'climb_your_way_out'],
        'x_y' => [200, 300],
    ],

    '41' => [
        'name' => 'teflon_corner',
        'description' => clienttranslate("Teflon Corner"),
        'value' => 5,
        'type' => 'corner',
        'type_description' => clienttranslate("Corner"),
        'shade' => 0,
        'requirements' => [
            'gear' => 3,
            'face' => 1,
            'crack' => 1,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['call_it_like_you_see_it', 'glory_days_of_the_piton', 'national_parks_pass'],
        'x_y' => [300, 300],
    ],

    '42' => [
        'name' => 'scarlet_begonias',
        'description' => clienttranslate("Scarlet Begonias"),
        'value' => 5,
        'type' => 'flake',
        'type_description' => clienttranslate("Flake"),
        'shade' => 1,
        'requirements' => [
            'gear' => 1,
            'face' => 3,
            'crack' => 1,
            'slab' => 1,
            'any_skill' => 0,
            'water' => 1,
            'psych' => 1,
        ],
        'personal_objectives' => ['rainbow_vibes', 'national_parks_pass', 'desert_days'],
        'x_y' => [400, 300],
    ],

    '43' => [
        'name' => 'belly_full_of_bad_berries',
        'description' => clienttranslate("Belly Full of Bad Berries"),
        'value' => 5,
        'type' => 'crack',
        'type_description' => clienttranslate("Crack"),
        'shade' => 1,
        'requirements' => [
            'gear' => 2,
            'face' => 0,
            'crack' => 3,
            'slab' => 0,
            'any_skill' => 0,
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
        'description' => clienttranslate("Rerack"),
        'effect_string' => clienttranslate("Search the discard pile for 2 Asset Cards of your choice"),
        'subscript_string' => null,
        'action' => null, //rerack_summit(),
        'x_y' => [0, 300],
    ],

    '2' => [
        'name' => 'borrowed_rack',
        'description' => clienttranslate("Borrowed Rack"),
        'effect_string' => clienttranslate("Use no Gear on a Pitch of your choice"),
        'subscript_string' => clienttranslate("Free Soloist: no extra Skills needed"), //should be italicized
        'action' => null, //borrowed_rack_summit(),
        'x_y' => [100, 300],
    ],

    '3' => [
        'name' => 'jumar',
        'description' => clienttranslate("Jumar"),
        'effect_string' => clienttranslate("Use no Skills on a Pitch another player has climbed"),
        'subscript_string' => null,
        'action' => null, //jumar_summit(),
        'x_y' => [200, 300],
    ],

    '4' => [
        'name' => 'energy_drink',
        'description' => clienttranslate("Energy Drink"),
        'effect_string' => clienttranslate("+1 Psych<br>+1 Water"),
        'subscript_string' => null,
        'action' => null, //energy_drink_summit(),
        'x_y' => [300, 300],

    ],

    '5' => [
        'name' => 'extra_water',
        'description' => clienttranslate("Extra Water"),
        'effect_string' => clienttranslate("No Water needed on a Pitch of your choice"),
        'subscript_string' => null,
        'action' => null, //extra_water_summit(),
        'x_y' => [0, 200],
    ],

    '6' => [
        'name' => 'new_rubber',
        'description' => clienttranslate("New Rubber"),
        'effect_string' => clienttranslate("Use this Token to count as any one technique symbol"),
        'subscript_string' => null,
        'action' => null, //new_rubber_summit(),
        'x_y' => [100, 200],
    ],

    '7' => [
        'name' => 'simul_climb',
        'description' => clienttranslate("Simul Climb"),
        'effect_string' => clienttranslate("Draw 3 Cards from The Spread or Asset Deck"),
        'subscript_string' => null,
        'action' => null, //simul_summit(),
        'x_y' => [200, 200],
    ],

    '8' => [
        'name' => 'guidebook',
        'description' => clienttranslate("Guidebook"),
        'effect_string' => clienttranslate("Use this Token to count as any one Skill"),
        'subscript_string' => null,
        'action' => null, //guidebook_summit(),
        'x_y' => [300, 200],
    ],

    '9' => [
        'name' => 'bomber_anchor',
        'description' => clienttranslate("Bomber Anchor"),
        'effect_string' => clienttranslate("Trade in up to 3 Cards from your hand for up to 3 Cards from The Portaledge"),
        'subscript_string' => null,
        'action' => null, //bomber_anchor_summit(),
        'x_y' => [0, 100],
    ],

    '10' => [
        'name' => 'jesus_piece',
        'description' => clienttranslate("Jesus Piece"),
        'effect_string' => clienttranslate("Use this to avoid a negative effect from a Climbing Card"),
        'subscript_string' => null,
        'action' => null, //jesus_piece_summit(),
        'x_y' => [100, 100],
    ],

    '11' => [
        'name' => 'lucky_chalkbag',
        'description' => clienttranslate("Lucky Chalkbag"),
        'effect_string' => clienttranslate("Reroll the Risk Die"),
        'subscript_string' => null,
        'action' => null, //lucky_chalkbag_summit(),
        'x_y' => [200, 100],
    ],

    '12' => [
        'name' => 'spider_stick',
        'description' => clienttranslate("Spider Stick"),
        'effect_string' => clienttranslate("Gain a 2-Point Token on the next 1- or 2-point Pitch you climb"),
        'subscript_string' => null,
        'action' => null, //spider_stick_summit(),
        'x_y' => [300, 100],
    ],
];

$this->shared_objectives = [
    '1' => [
        'name' => 'ridgeline_challenge_north',
        'description' => clienttranslate("Ridgeline Challenge"),
        'points' => 5,
        'objective_string' => clienttranslate("Climb at least 4 Pitches <br>of the North Ridge"),
        'subscript_string' => null,
        'action' => null, //ridgeline_challenge_north_objective()
        'x_y' => [0, 400],
    ],

    '2' => [
        'name' => 'ridgeline_challenge_south',
        'description' => clienttranslate("Ridgeline Challenge"),
        'points' => 5,
        'objective_string' => clienttranslate("Climb at least 4 Pitches <br>of the South Ridge"),
        'subscript_string' => null,
        'action' => null, //ridgeline_challenge_south_objective(),
        'x_y' => [100, 400],
    ],

    '3' => [
        'name' => 'stay_in_the_shade',
        'description' => clienttranslate("Stay in the Shade"),
        'points' => null,
        'objective_string' => clienttranslate("Gain 1 point for each <br>shaded Pitch you climb"),
        'subscript_string' => clienttranslate("(dark gray tile)"),
        'action' => null, //stay_in_the_shade_objective(),
        'x_y' => [200, 400],
    ],

    '4' => [
        'name' => 'stay_in_the_sun',
        'description' => clienttranslate("Stay in the Sun"),
        'points' => null,
        'objective_string' => clienttranslate("Gain 1 point for each <br>sunny Pitch you climb"),
        'subscript_string' => clienttranslate("(light gray tile)"),
        'action' => null, //stay_in_the_sun_objective(),
        'x_y' => [300, 400],
    ],

    '5' => [
        'name' => 'jolly_jammer',
        'description' => clienttranslate("Jolly Jammer"),
        'points' => 4,
        'objective_string' => clienttranslate("Climb 3 CRACK Pitches"),
        'subscript_string' => null,
        'action' => null, //jolly_jammer_objective(),
        'x_y' => [0, 500],
    ],

    '6' => [
        'name' => 'smear_campaign',
        'description' => clienttranslate("Smear Campaign"),
        'points' => 4,
        'objective_string' => clienttranslate("Climb 3 SLAB Pitches"),
        'subscript_string' => null,
        'action' => null, //smear_campaign_objective(),
        'x_y' => [100, 500],
    ],

    '7' => [
        'name' => 'star_stemmer',
        'description' => clienttranslate("Star Stemmer"),
        'points' => 4,
        'objective_string' => clienttranslate("Climb 3 CORNER Pitches"),
        'subscript_string' => null,
        'action' => null, //star_stemmer_objective(),
        'x_y' => [200, 500],
    ],

    '8' => [
        'name' => 'exposure_junkie',
        'description' => clienttranslate("Exposure Junkie"),
        'points' => 4,
        'objective_string' => clienttranslate("Climb 3 ARETE Pitches"),
        'subscript_string' => null,
        'action' => null, //exposure_junkie_objective(),
        'x_y' => [300, 500],
    ],

    '9' => [
        'name' => 'grand_traverse',
        'description' => clienttranslate("Grand Traverse"),
        'points' => 4,
        'objective_string' => clienttranslate("Climb horizontally <br>across 4 Pitches in a <br>row"),
        'subscript_string' => null,
        'action' => null, //grand_traverse_objective(),
        'x_y' => [0, 600],
    ],

    '10' => [
        'name' => 'all-arounding',
        'description' => clienttranslate("All-Arounding"),
        'points' => 6,
        'objective_string' => clienttranslate("Climb every Pitch type:<br>Arete, Corner, Slab, <br>Flake, Roof, Crack"),
        'subscript_string' => null,
        'action' => null, //all-arounding_objective(),
        'x_y' => [100, 600],
    ],

    '11' => [
        'name' => 'the_elitist',
        'description' => clienttranslate("The Elitist"),
        'points' => 4,
        'objective_string' => clienttranslate("Climb no 1 point Pitches"),
        'subscript_string' => clienttranslate("(starting value)"),
        'action' => null, //the_elitist_objective(),
        'x_y' => [200, 600],
    ],

    '12' => [
        'name' => 'a_day_in_the_alpine',
        'description' => clienttranslate("A Day in the Alpine"),
        'points' => null,
        'objective_string' => clienttranslate("Gain 1 point for each <br>Pitch on the Headwall <br>you climb"),
        'subscript_string' => null,
        'action' => null, //a_day_in_the_alpine_objective(),
        'x_y' => [300, 600],
    ],

    '13' => [
        'name' => 'flake_freak',
        'description' => clienttranslate("Flake Freak"),
        'points' => 4,
        'objective_string' => clienttranslate("Climb 3 FLAKE Pitches"),
        'subscript_string' => null,
        'action' => null, //flake_freak_objective(),
        'x_y' => [0, 700],
    ],

    '14' => [
        'name' => 'pull-up_champion',
        'description' => clienttranslate("Pull-Up Champion"),
        'points' => 4,
        'objective_string' => clienttranslate("Climb 3 ROOF Pitches"),
        'subscript_string' => null,
        'action' => null, //pull-up_champion_objective(),
        'x_y' => [100, 700],
    ],

    '15' => [
        'name' => 'stonemaster',
        'description' => clienttranslate("Stonemaster"),
        'points' => 8,
        'objective_string' => clienttranslate("Earn 2 Permanent Face <br>Skills + 2 Permanent <br>Slab Skills"),
        'subscript_string' => null,
        'action' => null, //stonemaster_objective(),
        'x_y' => [200, 700],
    ],

    '16' => [
        'name' => 'off-width_aficionado',
        'description' => clienttranslate("Off-Width Aficionado"),
        'points' => 8,
        'objective_string' => clienttranslate("Earn 2 Permanent Crack <br>Skills + 2 Permanent <br>Gear"),
        'subscript_string' => null,
        'action' => null, //off-width_aficionado_objective(),
        'x_y' => [300, 700],
    ],
];

$this->asset_cards = [
    '1' => [
        'name' => 'toe_jam',
        'description' => clienttranslate("Toe Jam"),
        'skill' => clienttranslate('crack'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 1,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 1,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [100, 0],
    ],

    '2' => [
        'name' => 'arm_bar',
        'description' => clienttranslate("Arm Bar"),
        'skill' => clienttranslate('crack'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 1,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [200, 0],

    ],

    '3' => [
        'name' => 'hand_jam',
        'description' => clienttranslate("Hand Jam"),
        'skill' => clienttranslate('crack'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 1,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [300, 0],
    ],

    '4' => [
        'name' => 'finger_lock',
        'description' => clienttranslate("Finger Lock"),
        'skill' => clienttranslate('crack'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 1,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 1,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [400, 0],
    ],

    '5' => [
        'name' => 'stemming',
        'description' => clienttranslate("Stemming"),
        'skill' => clienttranslate('crack'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 1,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 1,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [500, 0],
    ],

    '6' => [
        'name' => 'chicken_wing',
        'description' => clienttranslate("Chicken Wing"),
        'skill' => clienttranslate('crack'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 1,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 1,
        ],
        'number_in_deck' => 4,
        'x_y' => [600, 0],
    ],

    '7' => [
        'name' => 'hand-fist_stack',
        'description' => clienttranslate("Hand-Fist Stack"),
        'skill' => clienttranslate('crack'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 1,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [700, 0],
    ],

    '8' => [
        'name' => 'smear',
        'description' => clienttranslate("Smear"),
        'skill' => clienttranslate('slab'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 0,
            'slab' => 1,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 1,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [800, 0],
    ],

    '9' => [
        'name' => 'palming',
        'description' => clienttranslate("Palming"),
        'skill' => clienttranslate('slab'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 0,
            'slab' => 1,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [900, 0],
    ],

    '10' => [
        'name' => 'sloper',
        'description' => clienttranslate("Sloper"),
        'skill' => clienttranslate('slab'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 0,
            'slab' => 1,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [0, 100],
    ],

    '11' => [
        'name' => 'edge',
        'description' => clienttranslate("Edge"),
        'skill' => clienttranslate('slab'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 0,
            'slab' => 1,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [100, 100],
    ],

    '12' => [
        'name' => 'crimp',
        'description' => clienttranslate("Crimp"),
        'skill' => clienttranslate('slab'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 0,
            'slab' => 1,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 1,
        ],
        'number_in_deck' => 4,
        'x_y' => [200, 100],
    ],

    '13' => [
        'name' => 'hand-foot_match',
        'description' => clienttranslate("Hand-Foot Match"),
        'skill' => clienttranslate('slab'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 0,
            'slab' => 1,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 1,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [300, 100],
    ],

    '14' => [
        'name' => 'mono_pocket',
        'description' => clienttranslate("Mono Pocket"),
        'skill' => clienttranslate('slab'),
        'skills' => [
            'gear' => 0,
            'face' => 0,
            'crack' => 0,
            'slab' => 1,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 1,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [400, 100],
    ],

    '15' => [
        'name' => 'mantle',
        'description' => clienttranslate("Mantle"),
        'skill' => clienttranslate('face'),
        'skills' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 1,
        ],
        'number_in_deck' => 4,
        'x_y' => [500, 100],
    ],

    '16' => [
        'name' => 'undercling',
        'description' => clienttranslate("Undercling"),
        'skill' => clienttranslate('face'),
        'skills' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [600, 100],
    ],

    '17' => [
        'name' => 'layback',
        'description' => clienttranslate("Layback"),
        'skill' => clienttranslate('face'),
        'skills' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [700, 100],
    ],

    '18' => [
        'name' => 'gaston',
        'description' => clienttranslate("Gaston"),
        'skill' => clienttranslate('face'),
        'skills' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [800, 100],
    ],

    '19' => [
        'name' => 'heel_hook',
        'description' => clienttranslate("Heel Hook"),
        'skill' => clienttranslate('face'),
        'skills' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 1,
        ],
        'number_in_deck' => 4,
        'x_y' => [900, 100],
    ],

    '20' => [
        'name' => 'pinch',
        'description' => clienttranslate("Pinch"),
        'skill' => clienttranslate('face'),
        'skills' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 1,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [1000, 100],
    ],

    '21' => [
        'name' => 'flag',
        'description' => clienttranslate("Flag"),
        'skill' => clienttranslate('face'),
        'skills' => [
            'gear' => 0,
            'face' => 1,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 1,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 4,
        'x_y' => [1100, 100],
    ],

    '22' => [
        'name' => 'nuts',
        'description' => clienttranslate("Nuts"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 2,
        'x_y' => [0, 200],
    ],

    '23' => [
        'name' => 'alpine_draws',
        'description' => clienttranslate("Alpine Draws"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 3,
        'x_y' => [100, 200],
    ],

    '24' => [
        'name' => 'climbing_shoes',
        'description' => clienttranslate("Climbing Shoes"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 1,
            'power' => 0,
        ],
        'number_in_deck' => 2,
        'x_y' => [200, 200],
    ],

    '25' => [
        'name' => 'tape',
        'description' => clienttranslate("Tape"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 1,
            'power' => 0,
        ],
        'number_in_deck' => 2,
        'x_y' => [300, 200],
    ],

    '26' => [
        'name' => 'locker',
        'description' => clienttranslate("Locker"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 1,
            'pain_tolerance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [400, 200],
    ],

    '27' => [
        'name' => 'rope',
        'description' => clienttranslate("Rope"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 1,
            'pain_tolerance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [500, 200],
    ],

    '28' => [
        'name' => 'long_runner',
        'description' => clienttranslate("Long Runner"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 2,
        'x_y' => [600, 200],
    ],

    '29' => [
        'name' => 'helmet',
        'description' => clienttranslate("Helmet"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 1,
            'pain_tolerance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [700, 200],
    ],

    '30' => [
        'name' => 'cordelette',
        'description' => clienttranslate("Cordelette"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 1,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 2,
        'x_y' => [0, 300],
    ],

    '31' => [
        'name' => 'pack',
        'description' => clienttranslate("Pack"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 1,
        ],
        'number_in_deck' => 2,
        'x_y' => [100, 300],
    ],

    '32' => [
        'name' => 'chalk_bag',
        'description' => clienttranslate("Chalk Bag"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [200, 300],
    ],

    '33' => [
        'name' => 'nut_tool',
        'description' => clienttranslate("Nut Tool"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 2,
        'x_y' => [300, 300],
    ],

    '34' => [
        'name' => 'cams',
        'description' => clienttranslate("Cams"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 0,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 3,
        'x_y' => [400, 300],
    ],

    '35' => [
        'name' => 'belay_device',
        'description' => clienttranslate("Belay Device"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 1,
            'pain_tolerance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [500, 300],
    ],

    '36' => [
        'name' => 'harness',
        'description' => clienttranslate("Harness"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 1,
            'balance' => 1,
            'pain_tolerance' => 1,
            'power' => 1,
        ],
        'number_in_deck' => 3,
        'x_y' => [600, 300],
    ],

    '37' => [
        'name' => 'quick_draws',
        'description' => clienttranslate("Quick Draws"),
        'skill' => clienttranslate('gear'),
        'skills' => [
            'gear' => 1,
            'face' => 0,
            'crack' => 0,
            'slab' => 0,
        ],
        'techniques' => [
            'precision' => 0,
            'balance' => 1,
            'pain_tolerance' => 0,
            'power' => 0,
        ],
        'number_in_deck' => 2,
        'x_y' => [700, 300],
    ],
];

$this->climbing_cards = [
    '1' => [
        'name' => 'heinous_rope_drag',
        'description' => clienttranslate("Heinous rope drag"),
        'effect_A_flavor' => clienttranslate("Set up a 3:1 haul and pull with all your might:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Power Token"),
        'effect_B_flavor' => clienttranslate("Build a mid-pitch anchor:"),
        'effect_B' => clienttranslate("Lose 1 Gear Card and gain 1 Water"),
        'x_y' => [0, 0],
    ],

    '2' => [
        'name' => 'chopped_bolts',
        'description' => clienttranslate("Chopped bolts"),
        'effect_A_flavor' => clienttranslate("Which Pitch had its bolts removed?"),
        'effect_A' => clienttranslate("Choose a Pitch and add 1 Gear Token to it - any player
                         climbing that Pitch will need that additional Asset"),
        'x_y' => [100, 0],
    ],

    '3' => [
        'name' => 'party_above_you_forgot_some_gear',
        'description' => clienttranslate("Party above you forgot some gear"),
        'effect_A_flavor' => clienttranslate("Bring it up to them:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Summit Beta Token"),
        'effect_B_flavor' => clienttranslate("Swipe the gear:"),
        'effect_B' => clienttranslate("Lose 1 Card and take 1 Gear Card from another player's
                         Asset Board, then add it to your Board"),
        'x_y' => [200, 0],
    ],

    '4' => [
        'name' => 'techy_face',
        'description' => clienttranslate("Techy face"),
        'effect_A_flavor' => clienttranslate("Crimp til you bleed:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Pain Tolerance Token"),
        'effect_B_flavor' => clienttranslate("Bail and climb the chossy gully:"),
        'effect_B' => clienttranslate("Lose 1 Face Card and gain 1 Water"),
        'x_y' => [300, 0],
    ],

    '5' => [
        'name' => 'wild_berries',
        'description' => clienttranslate("Wild berries!"),
        'effect_A_flavor' => clienttranslate("Are there berry bushes all over the mountain?"),
        'effect_A' => clienttranslate("All players gain 2 Water"),
        'effect_B_flavor' => clienttranslate("Are the berry bushes just on this ledge?"),
        'effect_B' => clienttranslate("You gain 1 Water"),
        'x_y' => [400, 0],
    ],

    '6' => [
        'name' => 'sandbagged',
        'description' => clienttranslate("Sandbagged"),
        'effect_A_flavor' => clienttranslate("Which Pitch is harder than everyone says it is?"),
        'effect_A' => clienttranslate("Add 1 Skill Token (Face/Crack/Slab) to any
                                       Pitch - any player climbing that Pitch will need that additional Asset"),
        'x_y' => [500, 0],
    ],

    '7' => [
        'name' => 'splitter',
        'description' => clienttranslate("Splitter"),
        'effect_A_flavor' => clienttranslate("Jam the whole way up:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Pain Tolerance Token"),
        'effect_B_flavor' => clienttranslate("Conserve your toes and find some nubs to use for feet:"),
        'effect_B' => clienttranslate("Lose 1 Crack Card and gain 1 Slab Card"),
        'x_y' => [600, 0],
    ],

    '8' => [
        'name' => 'booty',
        'description' => clienttranslate("Booty!"),
        'effect_A_flavor' => clienttranslate("Take it:"),
        'effect_A' => clienttranslate("Lose 1 Card from your hand and take 1 Gear Card from another
                                       player's Asset Board, then add it to your Board"),
        'effect_B_flavor' => clienttranslate("Leave it:"),
        'effect_B' => clienttranslate("Lose 1 Gear Card and gain 1 Summit Beta Token"),
        'x_y' => [700, 0],
    ],

    '9' => [
        'name' => 'benighted',
        'description' => clienttranslate("Benighted"),
        'effect_A_flavor' => clienttranslate("Set up a shiver bivy:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Summit Beta Token"),
        'effect_B_flavor' => clienttranslate("Break out the headlamps:"),
        'effect_B' => clienttranslate("You and another player gain Technique Tokens of your choice
                         (Power/Pain Tolerance/Balance/Precision)"),
        'x_y' => [800, 0],
    ],

    '10' => [
        'name' => 'pocket_bacon',
        'description' => clienttranslate("Pocket bacon"),
        'effect_A_flavor' => clienttranslate("Do you have enough to share?"),
        'effect_A' => clienttranslate("All players gain 2 Psych"),
        'effect_B_flavor' => clienttranslate("Is there only enough for you?"),
        'effect_B' => clienttranslate("You gain 1 Psych"),
        'x_y' => [900, 0],
    ],

    '11' => [
        'name' => 'choss_pile',
        'description' => clienttranslate("Choss pile"),
        'effect_A_flavor' => clienttranslate("Delicately climb through the choss:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Balance Token"),
        'effect_B_flavor' => clienttranslate("Find another way up:"),
        'effect_B' => clienttranslate("Lose 1 Water and gain 1 Face Card"),
        'x_y' => [0, 100],
    ],

    '12' => [
        'name' => 'tricky_boulder_problem',
        'description' => clienttranslate("Tricky boulder problem"),
        'effect_A_flavor' => clienttranslate("Try a heel hook to a sloper:"),
        'effect_A' => clienttranslate("Lose 2 Cards and gain any Technique Token 
                         (Power/Pain Tolerance/Balance/Precision)"),
        'effect_B_flavor' => clienttranslate("Dyno up to a chalky jug:"),
        'effect_B' => clienttranslate("Lose 1 Water and gain 1 Face Card"),
        'x_y' => [100, 100],
    ],

    '13' => [
        'name' => 'found_a_kneebar_rest',
        'description' => clienttranslate("Found a kneebar rest"),
        'effect_A_flavor' => clienttranslate("Take the kneebar and shake it out:"),
        'effect_A' => clienttranslate("Lose 1 Card and gain 1 Balance Token"),
        'effect_B_flavor' => clienttranslate("Skip the kneebar:"),
        'effect_B' => clienttranslate("Lose 1 Water and gain 1 Skill Card 
                         (Face/Crack/Slab)"),
        'x_y' => [200, 100],
    ],

    '14' => [
        'name' => 'rope_sheath_is_cut',
        'description' => clienttranslate("Rope sheath is cut"),
        'effect_A_flavor' => clienttranslate("Ask rappellers if you can use their extra rope:"),
        'effect_A' => clienttranslate("Take 1 Gear Card from another player's Asset Board and
                         add it to your hand"),
        'effect_B_flavor' => clienttranslate("Cut your rope down and be mindful of its shorter length:"),
        'effect_B' => clienttranslate("Lose 1 Gear Card and gain 1 Precision Token"),
        'x_y' => [300, 100],
    ],

    '15' => [
        'name' => 'too_much_gear',
        'description' => clienttranslate("Too Much Gear"),
        'effect_A_flavor' => clienttranslate("Lug that heavy rack up with you:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Power Token"),
        'effect_B_flavor' => clienttranslate("Offload some gear onto your partner:"),
        'effect_B' => clienttranslate("All other players gain 1 Gear Card from The Portaledge"),
        'x_y' => [400, 100],
    ],

    '16' => [
        'name' => 'use_your_partners_rack',
        'description' => clienttranslate("Use your partner's rack"),
        'effect_A_flavor' => clienttranslate("Organize their chaotic rack:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Precision Token"),
        'effect_B_flavor' => clienttranslate("Go up with it looking like a junk show:"),
        'effect_B' => clienttranslate("Roll the Risk Die<br>
                         Checkmark: Gain 3 Cards from The Portaledge<br>
                         Cards/Card and Psych: Give those Assets to another player"),
        'x_y' => [500, 100],
    ],

    '17' => [
        'name' => 'painful_hanging_belay',
        'description' => clienttranslate("Painful hanging belay"),
        'effect_A_flavor' => clienttranslate("Lead a short pitch to a better belay:"),
        'effect_A' => clienttranslate("Lose 1 Gear Card and gain 1 Water"),
        'effect_B_flavor' => clienttranslate("Deal with the pain:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Pain Tolerance Token"),
        'x_y' => [600, 100],
    ],

    '18' => [
        'name' => 'pumped',
        'description' => clienttranslate("Pumped!"),
        'effect_A_flavor' => clienttranslate("Push through the pain:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Power Token"),
        'effect_B_flavor' => clienttranslate('Yell "TAKE!" and shake it out:'),
        'effect_B' => clienttranslate("Lose 1 Skill Card (Face/Crack/Slab) 
                         and gain 1 Water"),
        'x_y' => [700, 100],
    ],

    '19' => [
        'name' => 'hangry_partner',
        'description' => clienttranslate("Hangry partner"),
        'effect_A_flavor' => clienttranslate("Lead the next pitch so they can eat lunch:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Power Token"),
        'effect_B_flavor' => clienttranslate("Give them your granola bar and a pep talk:"),
        'effect_B' => clienttranslate("Draw 2 Summit Beta Tokens; keep 1 and give the other to another player"),
        'x_y' => [800, 100],
    ],

    '20' => [
        'name' => 'desperate_throw',
        'description' => clienttranslate("Desperate throw"),
        'effect_A_flavor' => clienttranslate("Commit to the awful sloper:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Power Token"),
        'effect_B_flavor' => clienttranslate("Go back to the good holds and look for a different way up:"),
        'effect_B' => clienttranslate("Lose 1 Slab Card and gain 1 Water"),
        'x_y' => [900, 100],
    ],

    '21' => [
        'name' => 'flexing_flake',
        'description' => clienttranslate("Flexing flake"),
        'effect_A_flavor' => clienttranslate("Awkwardly stretch around it:"),
        'effect_A' => clienttranslate("Lose 1 Card and gain 1 Balance Token"),
        'effect_B_flavor' => clienttranslate("Gingerly tiptoe up it:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Precision Token"),'x_y' => [0, 200],
        'x_y' => [0, 200],
    ],

    '22' => [
        'name' => 'scary_run-out_slab',
        'description' => clienttranslate("Scary run-out slab"),
        'effect_A_flavor' => clienttranslate("Bail into the vegetated gully:"),
        'effect_A' => clienttranslate("Lose 1 Slab Card and gain 1 Psych"),
        'effect_B_flavor' => clienttranslate("Smear and pray like never before:"),
        'effect_B' => clienttranslate("Roll the Risk Die<br>
                         Checkmark: Gain 3 cards from The Portaledge<br>
                         Cards/Card and Psych: Give those Assets to another player"),
        'x_y' => [100, 200],
    ],

    '23' => [
        'name' => 'other_partys_rope_gets_stuck',
        'description' => clienttranslate("Other party's rope gets stuck"),
        'effect_A_flavor' => clienttranslate("Help them:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Summit Beta Token"),
        'effect_B_flavor' => clienttranslate("Pass them by:"),
        'effect_B' => clienttranslate("Lose 1 Card and take 1 Card from another player's Asset Board,
                         then add it to your hand"),
        'x_y' => [200, 200],
    ],

    '24' => [
        'name' => 'gassy_as_heck',
        'description' => clienttranslate("Gassy as heck"),
        'effect_A_flavor' => clienttranslate("Scurry up the next pitch to fart in solitude:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Face Card"),
        'effect_B_flavor' => clienttranslate("Hold it in while your partner racks up:"),
        'effect_B' => clienttranslate("Gain 1 Pain Tolerance Token and all other
                         players gain 1 Gear Card"),
        'x_y' => [300, 200],
    ],

    '25' => [
        'name' => 'partner_has_a_meltdown',
        'description' => clienttranslate("Partner has a meltdown"),
        'effect_A_flavor' => clienttranslate("Console them:"),
        'effect_A' => clienttranslate("Give another player 2 Cards and gain 1 Summit Beta Token"),
        'effect_B_flavor' => clienttranslate("Tell them to buck up:"),
        'effect_B' => clienttranslate("Lose 1 Psych and take 1 Card from another player's
                         Asset Board, then add it to your hand"),
        'x_y' => [400, 200],
    ],

    '26' => [
        'name' => 'bad_beta',
        'description' => clienttranslate("Bad beta"),
        'effect_A_flavor' => clienttranslate("Post a correction online:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Summit Beta Token"),
        'effect_B_flavor' => clienttranslate("Confront whoever gave you the beta:"),
        'effect_B' => clienttranslate("Lose 1 Card and take 1 Card from another player's Asset Board,
                         then add it to your hand"),
        'x_y' => [500, 200],
    ],

    '27' => [
        'name' => 'prosthesis_starts_to_slip',
        'description' => clienttranslate("Prosthesis starts to slip"),
        'effect_A_flavor' => clienttranslate("Keep movements small to stay in control:"),
        'effect_A' => clienttranslate("Lose 1 Face Card and gain 1 Precision Token"),
        'effect_B_flavor' => clienttranslate("Ignore it and keep climbing with less reliable foot placements:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Face Card"),
        'x_y' => [600, 200],
    ],

    '28' => [
        'name' => 'hecked_up_the_sequence',
        'description' => clienttranslate("Hecked up the sequence"),
        'effect_A_flavor' => clienttranslate("Try to smear both feet:"),
        'effect_A' => clienttranslate("Lose 1 Slab Card and gain 1 Pain Tolerance Token"),
        'effect_B_flavor' => clienttranslate("Try to mantle:"),
        'effect_B' => clienttranslate("Add 1 Card from your hand to your Asset Board"),
        'x_y' => [700, 200],
    ],

    '29' => [
        'name' => 'falling_poop_bag',
        'description' => clienttranslate("Falling poop bag"),
        'effect_A_flavor' => clienttranslate("Flatten yourself against the wall and hope you don't get hit:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Balance Token"),
        'effect_B_flavor' => clienttranslate("Warn the others below:"),
        'effect_B' => clienttranslate("All players gain 1 Card from The Portaledge"),
        'x_y' => [800, 200],
    ],

    '30' => [
        'name' => 'blind_placement',
        'description' => clienttranslate("Blind placement"),
        'effect_A_flavor' => clienttranslate("Fiddle with the gear:"),
        'effect_A' => clienttranslate("Put 1 Gear Card from your hand onto your Asset Board"),
        'effect_B_flavor' => clienttranslate("Say heck the gear and move on:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Skill Card 
                         (Face/Crack/Slab)"),
        'x_y' => [900, 200],
    ],

    '31' => [
        'name' => 'dropped_a_piece',
        'description' => clienttranslate("Dropped a piece"),
        'effect_A_flavor' => clienttranslate("Retrieve it:"),
        'effect_A' => clienttranslate("Lose 1 Skill Card (Face/Crack/Slab) 
                         and gain 1 Gear Card"),
        'effect_B_flavor' => clienttranslate("Decide you don't need it"),
        'effect_B' => clienttranslate("Give 1 Gear Card to another player and draw 1 Card
                         from The Portaledge"),
        'x_y' => [0, 300],
    ],

    '32' => [
        'name' => 'bat_in_the_crack',
        'description' => clienttranslate("Bat in the crack!"),
        'effect_A_flavor' => clienttranslate("Layback the crack and hope you don't disturb the bat:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Power Token"),
        'effect_B_flavor' => clienttranslate("Make noise to shoo it out:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Crack Card"),
        'x_y' => [100, 300],
    ],

    '33' => [
        'name' => 'peregrine_falcon_delivers_a_water-filled_cactus',
        'description' => clienttranslate("Peregrine falcon delivers a water-filled cactus"),
        'effect_A_flavor' => clienttranslate("Is it the juciest cactus ever?"),
        'effect_A' => clienttranslate("All players gain 2 Water"),
        'effect_B_flavor' => clienttranslate("Is there only enough for you?"),
        'effect_B' => clienttranslate("You gain 1 Water"),
        'x_y' => [200, 300],
    ],

    '34' => [
        'name' => 'spinner',
        'description' => clienttranslate("Spinner"),
        'effect_A_flavor' => clienttranslate("Ignore it:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Skill Card (Face/Crack/Slab"),
        'effect_B_flavor' => clienttranslate("Back it up with some gear:"),
        'effect_B' => clienttranslate("Lose 1 Gear Card and gain 1 Psych"),
        'x_y' => [300, 300],
    ],

    '35' => [
        'name' => 'off_route',
        'description' => clienttranslate("Off route"),
        'effect_A_flavor' => clienttranslate("Go up the featureless slab:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Slab Card"),
        'effect_B_flavor' => clienttranslate("Go up the lichen-covered corner:"),
        'effect_B' => clienttranslate("Roll the Risk Die<br>
                         Checkmark: Gain 3 Cards from The Portaledge<br>
                         Cards/Card and Psych: Give those Assets to another player"),
        'x_y' => [400, 300],
    ],

    '36' => [
        'name' => 'camera_crew',
        'description' => clienttranslate("Camera crew"),
        'effect_A_flavor' => clienttranslate("Which Pitch has a photographer hanging out on it?"),
        'effect_A' => clienttranslate("Add 1 Skill Token (Face/Crack/Slab) to any
                         Pitch - any player climbing that Pitch will need that additional Asset"),
        'x_y' => [500, 300],
    ],

    '37' => [
        'name' => 'overcammed_that_jawn',
        'description' => clienttranslate("Overcammed that jawn"),
        'effect_A_flavor' => clienttranslate("Waste 15 minutes getting it out:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Gear Card"),
        'effect_B_flavor' => clienttranslate("Leave it in:"),
        'effect_B' => clienttranslate("All other players may draw a Card from The Portaledge"),
        'x_y' => [600, 300],
    ],

    '38' => [
        'name' => 'wet_rock',
        'description' => clienttranslate("Wet rock"),
        'effect_A_flavor' => clienttranslate("Go up the seeping crack:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Crack Card"),
        'effect_B_flavor' => clienttranslate("Drench your gear on the soggy ledges:"),
        'effect_B' => clienttranslate("Lose 1 Gear Card and gain 1 Water"),
        'x_y' => [700, 300],
    ],

    '39' => [
        'name' => 'who_pooped_on_the_ledge',
        'description' => clienttranslate("Who pooped on the ledge"),
        'effect_A_flavor' => clienttranslate("Scooch it into your spare waste bag and wash off the remains:"),
        'effect_A' => clienttranslate("Lose 1 Water and draw 1 Summit Beta Token"),
        'effect_B_flavor' => clienttranslate("Leave it there and whiff the fumes while you belay:"),
        'effect_B' => clienttranslate("Lose 1 Psych Card and gain 1 Pain Tolerance Token"),
        'x_y' => [800, 300],
    ],

    '40' => [
        'name' => 'wild_traverse',
        'description' => clienttranslate("Wild traverse"),
        'effect_A_flavor' => clienttranslate("Clip a long runner to everything:"),
        'effect_A' => clienttranslate("Put 1 Gear Card from your hand onto your Asset Board"),
        'effect_B_flavor' => clienttranslate("Run it out to avoid rope drag:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Skill Card 
                         (Face/Crack/Slab)"),
        'x_y' => [900, 300],
    ],

    '41' => [
        'name' => 'falcon_nest',
        'description' => clienttranslate("Falcon nest"),
        'effect_A_flavor' => clienttranslate("Which Pitch has a short but difficult detour to avoid the
                                nesting area?"),
        'effect_A' => clienttranslate("Add 1 Skill Token (Face/Crack/Slab) to any
                         Pitch - any player climbing that Pitch will need that additional Asset"),
        'x_y' => [0, 400],
    ],

    '42' => [
        'name' => 'lucky_flask',
        'description' => clienttranslate("Lucky flask"),
        'effect_A_flavor' => clienttranslate("Pass it around:"),
        'effect_A' => clienttranslate("All players gain 1 Water and 1 Psych"),
        'effect_B_flavor' => clienttranslate("Keep it to yourself:"),
        'effect_B' => clienttranslate("You gain 1 Water"),
        'x_y' => [100, 400],
    ],

    '43' => [
        'name' => 'wasp_nest',
        'description' => clienttranslate("Wasp nest"),
        'effect_A_flavor' => clienttranslate("Find a way around it:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Summit Beta Token"),
        'effect_B_flavor' => clienttranslate("Keep climbing near it and hope you don't get stung:"),
        'effect_B' => clienttranslate("Roll the Risk Die<br>
                                       Checkmark: Gain 3 Cards from The Portaledge<br>
                                       Cards/Card and Psych: Give those Assets to another player"),
        'x_y' => [200, 400],
    ],

    '44' => [
        'name' => 'second_wind',
        'description' => clienttranslate("Second wind"),
        'effect_A_flavor' => clienttranslate("Use your energy to psych everyone up:"),
        'effect_A' => clienttranslate("All players gain 1 Psych"),
        'effect_B_flavor' => clienttranslate("Use your energy to send the Pitch:"),
        'effect_B' => clienttranslate("Lose 1 Water and gain 1 Card from The Portaledge"),
        'x_y' => [300, 400],
    ],

    '45' => [
        'name' => 'surprise_storm',
        'description' => clienttranslate("Surprise storm!"),
        'effect_A_flavor' => clienttranslate("Keep climbing in the rain:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Skill Card (Face/Crack/Slab)"),
        'effect_B_flavor' => clienttranslate("Wait it out:"),
        'effect_B' => clienttranslate("Give another player 2 Cards and gain 1 Summit Beta Token"),
        'x_y' => [400, 400],
    ],

    '46' => [
        'name' => 'surprise_off-width',
        'description' => clienttranslate("Surprise off-width"),
        'effect_A_flavor' => clienttranslate("Do you thrash through it:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Crack Card"),
        'effect_B_flavor' => clienttranslate("Do you pull on gear to get past it:"),
        'effect_B' => clienttranslate("Lose 1 Crack Card and gain 1 Gear Card"),
        'x_y' => [500, 400],
    ],

    '47' => [
        'name' => 'squirrels_eat_your_snacks',
        'description' => clienttranslate("Squirrels eat your snacks"),
        'effect_A_flavor' => clienttranslate("Let them do as they please:"),
        'effect_A' => clienttranslate("Lose 1 Water and draw 1 Card from The Portaledge"),
        'effect_B_flavor' => clienttranslate("Waste time shooing them away:"),
        'effect_B' => clienttranslate("All other players draw 1 Card from The Portaledge"),
        'x_y' => [600, 400],
    ],

    '48' => [
        'name' => 'big_scary_roof',
        'description' => clienttranslate("Big scary roof"),
        'effect_A_flavor' => clienttranslate("Find a bomber jam:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Crack Card"),
        'effect_B_flavor' => clienttranslate("Inch over the edge on tiny crimps:"),
        'effect_B' => clienttranslate("Lose 1 Gear Card and gain 1 Face Card"),
        'x_y' => [700, 400],
    ],

    '49' => [
        'name' => 'party_on_the_ledge',
        'description' => clienttranslate("Party on the ledge"),
        'effect_A_flavor' => clienttranslate("Share the bolted anchors with them:"),
        'effect_A' => clienttranslate("You and another player lose 1 Psych 
                         and each gain 1 Gear Card"),
        'effect_B_flavor' => clienttranslate("Build an anchor around the corner:"),
        'effect_B' => clienttranslate("Lose 1 Gear Card and gain 1 Psych"),
        'x_y' => [800, 400],
    ],

    '50' => [
        'name' => 'pee_off_the_ledge',
        'description' => clienttranslate("Pee off the ledge"),
        'effect_A_flavor' => clienttranslate("When you gotta go, you gotta go!"),
        'effect_A' => clienttranslate("Add 1 Skill Token (Face/Crack/Slab) to any
                         Pitch next to you or below you - any player climbing that Pitch
                         will need that additional Asset"),
        'x_y' => [900, 400],
    ],

    '51' => [
        'name' => 'powerful_dyno',
        'description' => clienttranslate("Powerful dyno"),
        'effect_A_flavor' => clienttranslate("Build a gear nest in case you miss:"),
        'effect_A' => clienttranslate("Lose 1 Gear Card and gain 1 Psych"),
        'effect_B_flavor' => clienttranslate("Go for it!"),
        'effect_B' => clienttranslate("Roll the Risk Die<br>
                         Checkmark: Gain 3 Cards from the Portaledge<br>
                         Cards/Card and Psych: Give those Assets to another player"),
        'x_y' => [0, 500],
    ],

    '52' => [
        'name' => 'that_breeze_tho',
        'description' => clienttranslate("That breeze tho"),
        'effect_A_flavor' => clienttranslate("Can everyone feel the cool breeze?"),
        'effect_A' => clienttranslate("All players gain 2 Psych"),
        'effect_B_flavor' => clienttranslate("Is it just you?"),
        'effect_B' => clienttranslate("You gain 1 Psych"),
        'x_y' => [100, 500],
    ],

    '53' => [
        'name' => 'whipper',
        'description' => clienttranslate("Whipper!"),
        'effect_A_flavor' => clienttranslate("Shoot right back up:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Skill Card 
                         (Face/Crack/Slab)"),
        'effect_B_flavor' => clienttranslate("Ask your partner to lead it:"),
        'effect_B' => clienttranslate("Give another player 2 Cards and draw 1 Card from The Portaledge"),
        'x_y' => [200, 500],
    ],

    '54' => [
        'name' => 'bring_the_wide_gear',
        'description' => clienttranslate("Bring the wide gear"),
        'effect_A_flavor' => clienttranslate("Which Pitch has a wide crack that wasn't marked in
                                the guidebook?"),
        'effect_A' => clienttranslate("Choose a Pitch and add 1 Gear Token to it - any player
                         climbing that Pitch will need that additional Asset"),
        'x_y' => [300, 500],
    ],

    '55' => [
        'name' => 'sun_beats_down',
        'description' => clienttranslate("Sun beats down"),
        'effect_A_flavor' => clienttranslate("Is it hot as heck today?"),
        'effect_A' => clienttranslate("Every player on a sunny Pitch (light colored tiles) 
                         loses 1 Water"),
        'effect_B_flavor' => clienttranslate("Is it chilly as heck today?"),
        'effect_B' => clienttranslate("Every player on a sunny Pitch (light colored tiles)
                         gains 1 Psych"),
        'x_y' => [400, 500],
    ],

    '56' => [
        'name' => 'sewed_it_up',
        'description' => clienttranslate("Sewed it up"),
        'effect_A_flavor' => clienttranslate("Backclean to retrieve some gear:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Gear Card"),
        'effect_B_flavor' => clienttranslate("Run it out the top:"),
        'effect_B' => clienttranslate("Lose 1 Gear Card and gain 1 Psych"),
        'x_y' => [500, 500],
    ],

    '57' => [
        'name' => 'missed_the_belay',
        'description' => clienttranslate("Missed the belay"),
        'effect_A_flavor' => clienttranslate("Climb to the bolted anchor section:"),
        'effect_A' => clienttranslate("Lose 1 Skill Card (Face/Crack/Slab)
                         and gain 1 Gear Card"),
        'effect_B_flavor' => clienttranslate("Build a sketchy anchor where you are:"),
        'effect_B' => clienttranslate("Lose 1 Gear Card and draw a Card from The Spread"),
        'x_y' => [600, 500],
    ],

    '58' => [
        'name' => 'snake_on_the_ledge',
        'description' => clienttranslate("Snake on the ledge"),
        'effect_A_flavor' => clienttranslate("Plug a piece and hang until it slithers away:"),
        'effect_A' => clienttranslate("Lose 1 Gear Card and gain 1 Water"),
        'effect_B_flavor' => clienttranslate("Quickly scurry around it:"),
        'effect_B' => clienttranslate("Roll the Risk Die<br>
                         Checkmark: Gain 3 Cards from The Portaledge<br>
                         Cards/Card and Psych: Give those Assets to another player"),
        'x_y' => [700, 500],
    ],

    '59' => [
        'name' => 'high_exposure',
        'description' => clienttranslate("High Exposure"),
        'effect_A_flavor' => clienttranslate("Frantically place gear to calm your nerves:"),
        'effect_A' => clienttranslate("Lose 1 Gear Card and gain 1 Psych"),
        'effect_B_flavor' => clienttranslate("Sprint up to the belay ledge:"),
        'effect_B' => clienttranslate("Lose 1 Water and gain 1 Psych"),
        'x_y' => [800, 500],
    ],

    '60' => [
        'name' => 'slow_party',
        'description' => clienttranslate("Slow party"),
        'effect_A_flavor' => clienttranslate("Confront them and ask if you can go first:"),
        'effect_A' => clienttranslate("All other players draw 1 Card from The Portaledge"),
        'effect_B_flavor' => clienttranslate("Patiently wait behind them:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Summit Beta Token"),
        'x_y' => [900, 500],
    ],

    '61' => [
        'name' => 'mountain_goat_blocks_the_route',
        'description' => clienttranslate("Mountain goat blocks the route"),
        'effect_A_flavor' => clienttranslate("Climb up a short slab to bypass him:"),
        'effect_A' => clienttranslate("Lose 1 Water and gain 1 Slab Card"),
        'effect_B_flavor' => clienttranslate("Wait for him to move:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Water"),
        'x_y' => [0, 600],
    ],

    '62' => [
        'name' => 'big_swing_potential',
        'description' => clienttranslate("Big swing potential"),
        'effect_A_flavor' => clienttranslate("Sew it up to protect your follower:"),
        'effect_A' => clienttranslate("Lose 1 Gear Card and gain 1 Psych"),
        'effect_B_flavor' => clienttranslate("Run it out and hope they don't fall:"),
        'effect_B' => clienttranslate("Roll the Risk Die<br>
                         Checkmark: Gain 3 Cards from The Portaledge<br>
                         Cards/Card and Psych: Give those Assets to another player"),
        'x_y' => [100, 600],
    ],

    '63' => [
        'name' => 'rockfall',
        'description' => clienttranslate("Rockfall!"),
        'effect_A_flavor' => clienttranslate("A crucial hold broke off!"),
        'effect_A' => clienttranslate("Add 1 Skill Token (Face/Crack/Slab) to
                         any Pitch - any player climbing that Pitch will need
                         that additional Asset"),
        'x_y' => [200, 600],
    ],

    '64' => [
        'name' => 'sucker_holds',
        'description' => clienttranslate("Sucker holds"),
        'effect_A_flavor' => clienttranslate("Hang for a bit to figure it out:"),
        'effect_A' => clienttranslate("Lose 1 Face Card and gain 1 Water"),
        'effect_B_flavor' => clienttranslate("Launch into the sequence and hope for the best:"),
        'effect_B' => clienttranslate("Roll the Risk Die<br>
                         Checkmark: Gain 3 Cards from The Portaledge<br>
                         Cards/Card and Psych: Give those Assets to another player"),
        'x_y' => [300, 600],
    ],

    '65' => [
        'name' => 'blown_out_toe',
        'description' => clienttranslate("Blown out toe"),
        'effect_A_flavor' => clienttranslate("Ask your partner to wait while you try to repair your shoes:"),
        'effect_A' => clienttranslate("Give another player 1 Card and gain 1 Water"),
        'effect_B_flavor' => clienttranslate("Ignore it and keep climbing:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Skill Card 
                         (Face/Crack/Slab)"),
        'x_y' => [400, 600],
    ],

    '66' => [
        'name' => 'awesome_view',
        'description' => clienttranslate("Awesome view"),
        'effect_A_flavor' => clienttranslate("Take pictures of everyone else on the mountain:"),
        'effect_A' => clienttranslate("All players draw 1 Card from The Portaledge"),
        'effect_B_flavor' => clienttranslate("Climb over to a nice ledge to take in the scenery:"),
        'effect_B' => clienttranslate("Lose 1 Face Card and gain 1 Psych"),
        'x_y' => [500, 600],
    ],

    '67' => [
        'name' => 'crag_dog',
        'description' => clienttranslate("Crag dog"),
        'effect_A_flavor' => clienttranslate("Is he barking non-stop?"),
        'effect_A' => clienttranslate("All other players lose 1 Psych"),
        'effect_B_flavor' => clienttranslate("Is he well-behaved?"),
        'effect_B' => clienttranslate("All players gain 2 Psych"),
        'x_y' => [600, 600],
    ],

    '68' => [
        'name' => 'freezing_cold',
        'description' => clienttranslate("Freezing cold"),
        'effect_A_flavor' => clienttranslate("Keep climbing and share your hand warmers:"),
        'effect_A' => clienttranslate("Give another player 2 Cards and draw 2 Cards from The Portaledge"),
        'effect_B_flavor' => clienttranslate("Warm up on a sunny ledge:"),
        'effect_B' => clienttranslate("Every player on a sunny Pitch gains 1 Psych"),
        'x_y' => [700, 600],
    ],

    '69' => [
        'name' => 'dropped_phone',
        'description' => clienttranslate("Dropped phone"),
        'effect_A_flavor' => clienttranslate("Yell down to the party below and ask them to retrieve it:"),
        'effect_A' => clienttranslate("Choose another player to gain 1 Summit Beta Token"),
        'effect_B_flavor' => clienttranslate("Accept your phone's fate and keep climbing:"),
        'effect_B' => clienttranslate("Lose 1 Psych and gain 1 Card from The Portaledge"),
        'x_y' => [800, 600],
    ],

    '70' => [
        'name' => 'elvis_leg',
        'description' => clienttranslate("Elvis leg"),
        'effect_A_flavor' => clienttranslate("Ignore it:"),
        'effect_A' => clienttranslate("Lose 1 Psych and gain 1 Slab Card"),
        'effect_B_flavor' => clienttranslate("Shake it out:"),
        'effect_B' => clienttranslate("Lose 1 Slab Card and gain 1 Psych"),
        'x_y' => [900, 600],
    ],
];

$this->personal_objectives = [
    '1' => [
        'name' => 'rocky_mountains_tour',
        'description' => clienttranslate("Rocky Mountains Tour"),
        'text' => clienttranslate('Climb 3 Pitches in and around the Rocky Mountains'),
        'score' => 4,
        'pitches' => ['black_elk', 'red_rider', 'rebuffats_arete', 'edge_of_time', 'irenes_arete',
                       'bulldog_arete', 'black_snake', 'bishop_jaggers'],
        'x_y' => [0, 0],
    ],

    '2' => [
        'name' => 'a_day_at_the_zoo',
        'description' => clienttranslate("A Day at the Zoo"),
        'text' => clienttranslate('Climb 3 Pitches with an animal or insect in its name'),
        'score' => 4,
        'pitches' => ['bird_cage', 'black_elk', 'lonesome_dove', 'bulldog_arete', 
                      'black_snake', 'bee_sting_corner', 'dinkus_dog'],
        'x_y' => [100, 0],
    ],

    '3' => [
        'name' => 'call_it_like_you_see_it',
        'description' => clienttranslate("Call it Like You See it"),
        'text' => clienttranslate('Climb 3 Pitches with the type of route in its name'),
        'score' => 2,
        'pitches' => ['rogers_roof', 'corrugation_corner', 'rebuffats_arete', 'leap_year_flake',
                      'irenes_arete', 'bee_sting_corner', 'flakes_of_wrath', 'bulldog_arete',
                      'slab_aptitude_test', 'teflon_corner'],
        'x_y' => [200, 0],
    ],

    '4' => [
        'name' => 'sporty_spice',
        'description' => clienttranslate("Sporty Spice"),
        'text' => clienttranslate('Climb 3 sport routes'),
        'score' => 3,
        'pitches' => ['tierrany', 'screaming_yellow_zonkers', 'slab_aptitude_test', 'edge_of_time', 
                      'flight_of_the_gumby', 'lonesome_dove', 'bulldog_arete', 'no_place_like_home',
                      'red_rider'],
        'x_y' => [300, 0],
    ],

    '5' => [
        'name' => 'rainbow_vibes',
        'description' => clienttranslate("Rainbow Vibes"),
        'text' => clienttranslate('Climb 3 pitches with a color in its name'),
        'score' => 5,
        'pitches' => ['black_elk', 'desert_gold', 'red_rider', 'scarlet_begonias', 'black_snake',
                      'screaming_yellow_zonkers'],
        'x_y' => [400, 0],
    ],

    '6' => [
        'name' => 'southern_rock',
        'description' => clienttranslate("Southern Rock"),
        'text' => clienttranslate('Climb 3 Pitches located in Southeastern states'),
        'score' => 5,
        'pitches' => ['tierrany', 'flight_of_the_gumby', 'no_place_like_home', 'bee_sting_corner', 
                      'dinkus_dog', 'closer_to_the_heart'],
        'x_y' => [500, 0],
    ],

    '7' => [
        'name' => 'climb_your_way_out',
        'description' => clienttranslate("Climb Your Way Out"),
        'text' => clienttranslate('Climb 3 Pitches located in a gorge or canyon'),
        'score' => 4,
        'pitches' => ['fiddler_on_the_roof', 'desert_gold', 'half-a-finger', 'rebuffats_arete', 
                      'flight_of_the_gumby', 'bulldog_arete', 'no_place_like_home',
                      'black_snake'],
        'x_y' => [0, 100],
    ],

    '8' => [
        'name' => 'desert_days',
        'description' => clienttranslate("Desert Days"),
        'text' => clienttranslate('Climb 3 Pitches located in a desert'),
        'score' => 3,
        'pitches' => ['fiddler_on_the_roof', 'desert_gold', 'skull', 'dr_rubos_wild_ride', 
                      'abracadaver', 'belly_full_of_bad_berries', 'tooth_or_consequences', 'old_man',
                      'leap_year_flake', 'flakes_of_wrath', 'scarlet_begonias'],
        'x_y' => [100, 100],
    ],

    '9' => [
        'name' => 'glory_days_of_the_piton',
        'description' => clienttranslate("Glory Days of the Piton"),
        'text' => clienttranslate('Climb 3 Pitches established before 1970'),
        'score' => 3,
        'pitches' => ['rogers_roof', 'bird_cage', 'bonnies_roof', 'outer_space', 
                      'rebuffats_arete', 'irenes_arete', 'corrugation_corner', 'teflon_corner',
                      'chapel_pond_slab', 'bishop_jaggers'],
        'x_y' => [200, 100],
    ],

    '10' => [
        'name' => 'social_butterfly',
        'description' => clienttranslate("Social Butterfly"),
        'text' => clienttranslate('Climb 3 Pitches with a person in its name'),
        'score' => 3,
        'pitches' => ['rogers_roof', 'bonnies_roof', 'rebuffats_arete', 'irenes_arete', 
                      'dr_rubos_wild_ride', 'the_don_juan_wall', 'bishop_jaggers'],
        'x_y' => [300, 100],
    ],

    '11' => [
        'name' => 'full_body_workout',
        'description' => clienttranslate("Full Body Workout"),
        'text' => clienttranslate('Climb 3 Pitches with a body part in its name'),
        'score' => 4,
        'pitches' => ['half-a-finger', 'skull', 'bloody_fingers', 'belly_full_of_bad_berries', 
                      'fickle_finger_of_fate', 'heart_of_the_country', 'closer_to_the_heart',
                      'tooth_or_consequences'],
        'x_y' => [400, 100],
    ],

    '12' => [
        'name' => 'national_parks_pass',
        'description' => clienttranslate("National Parks Pass"),
        'text' => clienttranslate('Climb 3 Pitches located in a National Park'),
        'score' => 4,
        'pitches' => ['leap_year_flake', 'scarlet_begonias', 'irenes_arete', 'flight_of_the_gumby',
                      'black_snake', 'psychic_turbulence', 'teflon_corner'],
        'x_y' => [500, 100],
    ],
];

$this->characters = [
    '1' => [
        'name' => 'rope_gun',
        'description' => clienttranslate("Rope Gun"),
        'flavor' => clienttranslate('You fly up everything with ease'),
        'ability' => clienttranslate('You may use 1 less Water on each Pitch you climb.'),
        'water_psych' => 4,
        'home_crag' => clienttranslate('Red Rock'), //bolded
        'native_lands' => clienttranslate('Newe (Western Shoshone), Nuwuvi (Southern Paiute), and 
                          Nüwüwü (Chemeheuvi) Ancestral Land'), //italicized
        'x_y' => [0, 300],
        'ab_x_y' => [200, 100],
        'mx_y' => [200, 0],
        'rx_y' => [
            'straight' => [0, 0],
            'slight' => [100, 0],
            'hard' => [200, 0],
        ],
        /*'nb_x_y' => [0, 41.27],*/
        'nb_x_y' => [0, 300],
        'color' => '1d7dad',
        'color_name' => 'blue',
    ],

    '2' => [
        'name' => 'free_soloist',
        'description' => clienttranslate("Free Soloist"),
        'flavor' => clienttranslate('You don\'t climb with gear'),
        'ability' => clienttranslate('for each Gear Card that is required for a Pitch, substitute with any
                     Skill Card. Gain 1 extra Asset every time you rest.'),
        'water_psych' => 6,
        'home_crag' => clienttranslate('Yosemite'),
        'native_lands' => clienttranslate('Me-Wuk, Numu (Northern Paiute), and Western Mono/Monache Ancestral Land'),
        'x_y' => [100, 300],
        'ab_x_y' => [300, 100],
        'mx_y' => [200, 0],
        'rx_y' => [
            'straight' => [0, 0],
            'slight' => [100, 0],
            'hard' => [200, 0],
        ],
        /*'nb_x_y' => [14.26, 41.27],*/
        'nb_x_y' => [0, 100],
        'color' => '1d7dad',
        'color_name' => 'blue',
    ],

    '3' => [
        'name' => 'the_dirtbag',
        'description' => clienttranslate("The Dirtbag"),
        'flavor' => clienttranslate('You\'ve picked up a lot of booty gear'),
        'ability' => clienttranslate('on each Pitch, you may substitute 1 Gear Card for 1 of the
                     other required Assets'),
        'water_psych' => 4,
        'home_crag' => clienttranslate('Joshua Tree'),
        'native_lands' => clienttranslate('Cahuilla, Newe (Western Shoshone), and Yuhaviatam/Maarenga\'yam
                          (Serrano) Ancestral Land'),
        'x_y' => [200, 300],
        'ab_x_y' => [0, 100],
        'mx_y' => [400, 0],
        'rx_y' => [
            'straight' => [0, 100],
            'slight' => [100, 100],
            'hard' => [200, 100],
        ],
        /*'nb_x_y' => [28.57, 41.21],*/
        'nb_x_y' => [200, 200],
        'color' => 'be3d27',
        'color_name' => 'red',
    ],

    '4' => [
        'name' => 'sendy_jammer',
        'description' => clienttranslate("Sendy Jammer"),
        'flavor' => clienttranslate('Desert cracks have trained you well'),
        'ability' => clienttranslate('all Gear Cards you play can be counted as any 1 Technique symbol'),
        'water_psych' => 5,
        'home_crag' => clienttranslate('Indian Creek'),
        'native_lands' => clienttranslate('Pueblos and Ute Ancestral Land'),
        'x_y' => [300, 300],
        'ab_x_y' => [100, 100],
        'mx_y' => [400, 0],
        'rx_y' => [
            'straight' => [0, 100],
            'slight' => [100, 100],
            'hard' => [200, 100],
        ],
        /*'nb_x_y' => [42.84, 41.21],*/
        'nb_x_y' => [100, 300],
        'color' => 'be3d27',
        'color_name' => 'red',
    ],

    '5' => [
        'name' => 'the_overstoker',
        'description' => clienttranslate("The Overstoker"),
        'flavor' => clienttranslate('Your enthusiasm for climbing is off the charts!'),
        'ability' => clienttranslate('on each Pitch, you may substitute 1 Psych for 1 of the other required Assets'),
        'water_psych' => 6,
        'home_crag' => clienttranslate('Smith Rock'),
        'native_lands' => clienttranslate('Confederated Tribes of Warm Springs and Tenino Ancestral Land'),
        'x_y' => [400, 300],
        'ab_x_y' => [200, 0],
        'mx_y' => [100, 0],
        'rx_y' => [
            'straight' => [0, 200],
            'slight' => [100, 200],
            'hard' => [200, 200],
        ],
        /*'nb_x_y' => [57.15, 41.22],*/
        'nb_x_y' => [100, 100],
        'color' => 'f6e03f',
        'color_name' => 'yellow',
    ],

    '6' => [
        'name' => 'young_prodigy',
        'description' => clienttranslate("Young Prodigy"),
        'flavor' => clienttranslate('You pick up new skills quickly but are still getting used to placing gear'),
        'ability' => clienttranslate('you need only 3 Cards to earn a Permanent Skill Token, but 5 Cards to
                     earn a Permanent Gear Token.'),
        'water_psych' => 4,
        'home_crag' => clienttranslate('Local climbing gym'),
        'native_lands' => '',
        'x_y' => [500, 300],
        'ab_x_y' => [300, 0],
        'mx_y' => [100, 0],
        'rx_y' => [
            'straight' => [0, 200],
            'slight' => [100, 200],
            'hard' => [200, 200],
        ],
        /*'nb_x_y' => [71.42, 41.22],*/
        'nb_x_y' => [200, 300],
        'color' => 'f6e03f',
        'color_name' => 'yellow',

    ],

    '7' => [
        'name' => 'bold_brit',
        'description' => clienttranslate("Bold Brit"),
        'flavor' => clienttranslate('You take big risks on sketchy gear placements'),
        'ability' => clienttranslate('use only 1 Gear Card on each Pitch that requires Gear.'),
        'water_psych' => 5,
        'home_crag' => clienttranslate('Peak District'),
        'native_lands' => '',
        'x_y' => [600, 300],
        'ab_x_y' => [0, 0],
        'mx_y' => [500, 0],
        'rx_y' => [
            'straight' => [0, 500],
            'slight' => [100, 500],
            'hard' => [200, 500],
        ],
        /*'nb_x_y' => [85.74, 41.22],*/
        'nb_x_y' => [200, 0],
        'color' => '4d5760',
        'color_name' => 'black',

    ],

    '8' => [
        'name' => 'phil',
        'description' => clienttranslate("Phil"),
        'flavor' => clienttranslate('You love to push yourself'),
        'ability' => clienttranslate('you must roll the Risk Die on every Pitch you climb. Start with 
                     2 Summit Beta Tokens, and gain 1 extra Asset every time you rest.'),
        'water_psych' => 7,
        'home_crag' => clienttranslate('El Dorado Canyon'),
        'native_lands' => clienttranslate('Arapaho, Cheyenne, and Ute Ancestral Land'),
        'x_y' => [700, 300],
        'ab_x_y' => [100, 0],
        'mx_y' => [500, 0],
        'rx_y' => [
            'straight' => [0, 500],
            'slight' => [100, 500],
            'hard' => [200, 500],
        ],
        /*'nb_x_y' => [100, 41.22],*/
        'nb_x_y' => [200, 100],
        'color' => '4d5760',
        'color_name' => 'black',
    ],

    '9' => [
        'name' => 'crag_mama',
        'description' => clienttranslate("Crag Mama"),
        'flavor' => clienttranslate('You have a mother\'s intuition'),
        'ability' => clienttranslate('You may use 1 fewer Skill Card on all Pitches below The Ledge.'),
        'water_psych' => 4,
        'home_crag' => clienttranslate('New River Gorge'),
        'native_lands' => clienttranslate('Moneton, S\'atsoyaha (Yuchi), and Tutelo Ancestral Land'),
        'x_y' => [0, 400],
        'ab_x_y' => [200, 200],
        'mx_y' => [0, 0],
        'rx_y' => [
            'straight' => [0, 300],
            'slight' => [100, 300],
            'hard' => [200, 300],
        ],
        /*'nb_x_y' => [0, 20.5],*/
        'nb_x_y' => [0, 0],
        'color' => '517f3e',
        'color_name' => 'green',
    ],

    '10' => [
        'name' => 'cool-headed_crimper',
        'description' => clienttranslate("Cool-Headed Crimper"),
        'flavor' => clienttranslate('You stay cool under pressure, no matter what comes your way.'),
        'ability' => clienttranslate('After climbing each Pitch, draw 2 Climbing Cards and choose 1
                     to resolve. Discard the other.'),
        'water_psych' => 6,
        'home_crag' => clienttranslate('Sedona'),
        'native_lands' => clienttranslate('Hohokam, Hopitutskwa, Ndee/Nnēē: (Western Apache), Pueblos,
                          and Yavapaiv Apache Ancestral Land'),
        'x_y' => [100, 400],
        'ab_x_y' => [300, 200],
        'mx_y' => [0, 0],
        'rx_y' => [
            'straight' => [0, 300],
            'slight' => [100, 300],
            'hard' => [200, 300],
        ],
        /*'nb_x_y' => [14.26, 20.5],*/
        'nb_x_y' => [100, 200],
        'color' => '517f3e',
        'color_name' => 'green',
    ],

    '11' => [
        'name' => 'bionic_woman',
        'description' => clienttranslate("Bionic Woman"),
        'flavor' => clienttranslate('As an above-knee amputee, you have to get creative with your technique'),
        'ability' => clienttranslate('on each Pitch, you may substitute 1 Skill Card with a different Skill Card of your choice.'),
        'water_psych' => 4,
        'home_crag' => clienttranslate('Red River Gorge'),
        'native_lands' => clienttranslate('Adena, Cherokee, Hopewell, Osage, S\'atsoyaha (Yuchi), and Shawnee Ancestral Land'),
        'x_y' => [200, 400],
        'ab_x_y' => [0, 200],
        'mx_y' => [300, 0],
        'rx_y' => [
            'straight' => [0, 400],
            'slight' => [100, 400],
            'hard' => [200, 400],
        ],
        /*'nb_x_y' => [28.57, 20.55],*/
        'nb_x_y' => [100, 0],
        'color' => '7c2b87',
        'color_name' => 'purple',
    ],

    '12' => [
        'name' => 'buff_boulderer',
        'description' => clienttranslate("Buff Boulderer"),
        'flavor' => clienttranslate('You have no problem with difficult moves'),
        'ability' => clienttranslate('use 1 fewer Asset to climb any 4 Point Pitch, and use 2 fewer Assets to climb any 5 Point Pitch.'),
        'water_psych' => 6,
        'home_crag' => clienttranslate('Bishop'),
        'native_lands' => clienttranslate('Eastern Mono/Monache, Newe (Western Shoshone), and Numu (Northern Paiute) Ancestral Land'),
        'x_y' => [300, 400],
        'ab_x_y' => [100, 200],
        'mx_y' => [300, 0],
        'rx_y' => [
            'straight' => [0, 400],
            'slight' => [100, 400],
            'hard' => [200, 400],
        ],
        /*'nb_x_y' => [42.84, 20.55],*/
        'nb_x_y' => [0, 200],
        'color' => '7c2b87',
        'color_name' => 'purple',
    ],
];