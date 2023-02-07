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
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
],
function (dojo, declare) {
    return declare("bgagame.firstascent", ebg.core.gamegui, {
        constructor: function(){
            console.log('firstascent constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;

            console.log('assets constructor');
            this.asset_width = 124;
            this.asset_height = 190;

            console.log('summit beta tokens constructor');
            this.summit_width = 140;
            this.summit_height = 140;

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
            
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];

                if (this.player_id === Number(player_id)) {
                   let player_panel_div = $('player_board_'+player_id);
                    dojo.place(this.format_block('jstpl_player_panel', player), player_panel_div); 
                }
                
                         
                // TODO: Setting up players boards if needed
            }

            // Setup constants -
            const player_count = Object.keys(gamedatas.players).length;
            
            // TODO: Set up your game interface here, according to "gamedatas"

            // DEBUGGING FROM PHP


            // Display the correct board for player count

            if (gamedatas.player_count === '1') {
                dojo.removeClass('board', 'forest');
            } else {
                dojo.removeClass('board', 'desert');
                dojo.query('#pitches .pitch').style({
                    'height':'91.5px',
                    'width':'79.5px',
                })
            }

            // Set up summit beta tokens

            let summmit_beta_coords;
            if (gamedatas.player_count === '1') {summit_beta_coords = [243, 19.4];}
            else {summit_beta_coords = [243, 23];}
            dojo.place(this.format_block('jstpl_summit_pile', {
                summit_pileX : summit_beta_coords[0],
                summit_pileY : summit_beta_coords[1]
            }), 'board', 1);

            // Set up climbing cards

            let climbing_deck_coords;
            if (gamedatas.player_count === '1') {climbing_deck_coords = [-18, 54];}
            else {climbing_deck_coords = [-15, 57.5];}
            dojo.place(this.format_block('jstpl_climbing_deck', {
                climbing_deckX : climbing_deck_coords[0],
                climbing_deckY : climbing_deck_coords[1]
            }), 'board', 2);

            // Set up the spread

            let asset_deck_coords;
            if (gamedatas.player_count === '1') {asset_deck_coords = [.45, 916.25];}
            else {asset_deck_coords = [3.9, 910.25];}
            dojo.place(this.format_block('jstpl_asset_deck', {
                asset_deckX : asset_deck_coords[0],
                asset_deckY : asset_deck_coords[1]
            }), 'board', 4);

            let spread_cards = Object.values(gamedatas.spread);
            let spread_coords;
            if (gamedatas.player_count === '1') {
                spread_coords = [ [89.17, 994.25], [161.5, 994.25], [233.9, 994.25], [306.1, 994.25] ]; // Desert board
            } else {spread_coords = [ [91.5, 989], [163, 989], [234.25, 989], [305.65, 989] ];} // Forest board
            for (let i=0; i<=3; i++) {
                dojo.place(this.format_block('jstpl_spread_slot', {
                    SLOT_NUM : i+1,
                    spreadX : spread_coords[i][0],
                    spreadY : spread_coords[i][1]
                }), 'the_spread');
            }

            for (card=0; card<=3; card++) {

                let spread_slot = `spread_slot${card+1}`;
                let cardNum = Number(spread_cards[card]);
                let x = gamedatas.asset_cards[cardNum]['x_y'][0];
                let y = gamedatas.asset_cards[cardNum]['x_y'][1];
                dojo.place(this.format_block('jstpl_asset_card', {
                    CARD_ID : Object.keys(gamedatas.spread)[card],
                    acX : x,
                    acY : y,
                }), spread_slot);
            }

            // characters and asset boards

            // place character area wrappers
            for (let i=1; i<=player_count; i++) {
                let current_player_id = Object.keys(gamedatas.players)[i-1];
                let current_player = gamedatas.players[`${current_player_id}`];

                if (current_player_id == this.player_id && current_player.character) {
                    dojo.place(this.format_block('jstpl_character_area', {
                        player : current_player_id,
                        color : current_player.color,
                        player_name : current_player.name,
                    }), 'character_wrap', 'first');
                } 
                else if (current_player.character) {
                        dojo.place(this.format_block('jstpl_character_area', {
                        player : current_player_id,
                        color : current_player.color,
                        player_name : current_player.name,
                    }), 'character_wrap');
                dojo.style(`character_area_${current_player.name}`, 'margin-top', '35px');
                }
            }

            // character selection
            if (gamedatas.available_characters.length > 1) {
                for (let character_id of gamedatas.available_characters) {
                    let character = gamedatas.characters[character_id];
                    let bg_pos = character['x_y'];
                    dojo.place(this.format_block('jstpl_character', {
                        type : character_id,
                        extra_class : "character_select",
                        charX : bg_pos[0],
                        charY : bg_pos[1],
                        extra_style : "margin-top: 5px; margin-left: 10px; margin-bottom: 5px; position: relative;",
                    }), 'character_selection');
                    let html = `<div style="margin-bottom: 5px;"><strong>${character['description']}</strong></div>
                                <p>${character['flavor']} - ${character['effect']}</p>
                                <p>Starting Water/Psych: ${character['water_psych']}</p>
                                <span>Home Crag: ${character['home_crag']}</span>
                                <span style="font-size: 10px; white-space: nowrap;"><i>${character['translation']}</i></span>`;
                    this.addTooltipHtml(`character_${character_id}`, html, 1000);
                    if (! this.isCurrentPlayerActive()) { dojo.style(`character_${character_id}`, 'pointer-events', 'none'); }
                }
                dojo.query('.character_select').connect('onclick', this, 'onChooseCharacter');
            }

            // my character
            const my_character_id = this.gamedatas.players[this.player_id]['character'];
            if (my_character_id) {
                const my_character = this.gamedatas.characters[my_character_id];
                const bg_pos = my_character['x_y'];
                const ab_pos = my_character['ab_x_y'];
                dojo.place(this.format_block('jstpl_character', {
                    type : my_character_id,
                    extra_class : "",
                    charX : bg_pos[0],
                    charY : bg_pos[1],
                    extra_style : "position: relative; margin-top: 3px;",
                }), `player_${this.player_id}`);
                dojo.place(this.format_block('jstpl_asset_board', {
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), `character_${my_character_id}`);
            }

            // opponents' characters
            for (let player_id in this.gamedatas.players) {
                if (player_id != this.player_id) {
                    let playerInfo = this.gamedatas.players[player_id];
                    let character_id = playerInfo.character;
                    if (character_id) {
                        let character_details = this.gamedatas.characters[character_id];
                        let bg_pos = character_details['x_y'];
                        let ab_pos = character_details['ab_x_y'];
                        dojo.place(this.format_block('jstpl_character', {
                            type : character_id,
                            extra_class : "",
                            charX : bg_pos[0],
                            charY : bg_pos[1],
                            extra_style : "position: relative; margin-top: 3px;",
                        }), `player_${player_id}`);
                        dojo.place(this.format_block('jstpl_asset_board', {
                            abX : ab_pos[0],
                            abY : ab_pos[1],
                        }), `character_${character_id}`);
                    }
                }
            }


            //// Tooltips

            // shared objectives

            for (let i=0; i<=2; i++) {
                let current_objective = gamedatas.current_objectives[i];
                let bg_pos = gamedatas.shared_objectives[current_objective]['x_y'];
                let subscript = gamedatas.shared_objectives[current_objective]['subscript_string'] || '';
                let html = `<div style="margin-bottom: 5px;"><strong>${gamedatas.shared_objectives[current_objective]['description']}</strong></div>
                            <div class="shared_objective shared_objective_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>
                            <div>${gamedatas.shared_objectives[current_objective]['objective_string']}</div>
                            <div style="font-size:10px;">${subscript}</div>`;
                this.addTooltipHtml(`shared_objective${i+1}`, html, 1000);
            }

            // asset cards

            for (let i=0; i<=3; i++) {
                let current_asset = spread_cards[i];
                let current_asset_ids = Object.keys(gamedatas.spread);
                let bg_pos = gamedatas.asset_cards[current_asset]['x_y'];
                let translated_skill = _(`${gamedatas.asset_cards[current_asset]['skill']}`);
                let html = `<div style="margin-bottom: 5px; display: inline;"><strong>${gamedatas.asset_cards[current_asset]['description']}</strong></div>
                            <span style="font-size: 10px; margin-left: 5px;">${translated_skill}</span>
                            <div class="assets assets_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>`;
                this.addTooltipHtml(`asset_card_${current_asset_ids[i]}`, html, 1000);
            }

            // pitches

            if (gamedatas.player_count === '1') {
                for (let i=1; i<=21; i++) {
                    let current_pitch = dojo.attr(`pitch${i}`, 'class').slice(-2).replace(/^\D+/g, '');
                    //console.log(`current_pitch = ${current_pitch}`);
                    let bg_pos = gamedatas.pitches[current_pitch]['x_y'];
                    let html = `<div style="margin-bottom: 5px;"><strong>${gamedatas.pitches[current_pitch]['description']}</strong></div>
                                <div class="pitch pitch_tt" style="background-position: -${bg_pos[0]}% -${bg_pos[1]}%; margin-bottom: 5px;"></div>
                                <div> Type: ${gamedatas.pitches[current_pitch]['type_description']} / Value: ${gamedatas.pitches[current_pitch]['value']}</div>`;
                    this.addTooltipHtml(`pitch${i}`, html, 1000);
                }
            }

            // characters

            const current_characters = document.querySelectorAll('.character');
            for (let current_character of current_characters) {
                let character_id = dojo.attr(current_character, 'id').slice(-2).replace(/^\D+/g, '');
                let character = gamedatas.characters[character_id];
                let bg_pos = character['x_y'];
                let html = `<div style="margin-bottom: 5px;"><strong>${character['description']}</strong></div>
                            <p>${character['flavor']} - ${character['effect']}</p>
                            <p>Starting Water/Psych: ${character['water_psych']}</p>
                            <span>Home Crag: ${character['home_crag']}</span>
                            <span style="font-size: 10px; white-space: nowrap;"><i>${character['translation']}</i></span>`;
                this.addTooltipHtml(`character_${character_id}`, html, 1000);
            }

            // references

            let html = `<div class="reference reference_tt" style="background-position: -600% -0%"></div>
                        <span id="ref_1_text" style="vertical-align: top;">
                        <h3 style="margin-top: -1px; margin-bottom: -1px;"><strong>${_('Climb Phase')}</strong></h3>
                        <p>${_('-Move your Climber & Rope. If you are resting, lay down your climber and skip the next steps')}</p>
                        <p>${_('-Lay down Asset Cards')}</p>
                        <p>${_('-Decrease Water & Psych')}</p>
                        <p style="text-align: center; margin-top: -5px;">________________</p>
                        <h3><strong>${_('Follow Phase')}</strong></h3>
                        <p>${_('-Claim points for Techniques')}</p>
                        <p>${_('-Turn in cards for Permanent Assets if applicable')}</p>
                        <p>${_('-Turn over Cards on your Board')}</p>
                        <p style="text-align: center; margin-top: -5px;">________________</p>
                        <h3><strong>${_('Rerack Phase')}</strong></h3>
                        <p>${_('-Climbers: Draw 3 Asset Cards')}</p>
                        <p style="font-size: 10px;">${_('draw Cards from the Spread or Deck')}</p>
                        <p>${_('-Resters: Gain 5 Assets')}</p>
                        <p style="font-size: 10px;">${_('draw Cards from The Portaledge')}</p>
                        <p>${_('-Pass First Player Token to your right')}</p> 
                        </span>`;
            this.addTooltipHtml(`ref_1`, html, 1000);
            html =     `<div class="reference reference_tt" style="background-position: -700% -0%"></div>
                        <div id="ref_2_text" style="vertical-align: top; font-size: 10px;">
                        <h4 style="margin-top:-1px; margin-bottom: -1px;"><strong>${_('Risking It')}</strong></h4>
                        <p>${_('If you are 1 Asset short but still want to climb, pay the other required Assets, then roll the Die!')}</p>
                        <span class="risk_die risk_1" style="margin-top: 0px;"></span>
                        <span style="margin-left: 20px;">${_('= no consequence')}</span><br>
                        <span class="risk_die risk_2" style="display: inline-block; margin-top: 4px;"></span>
                        <span style="margin-left: 20px; position: relative; top: 3.8px;">${_('= give 2 Cards from your hand to another')}</span><br>
                        <span style="margin-left: 30px; position: relative; top: 5px;">${_('player')}</span><br>
                        <span class="risk_die risk_3" style="display: inline-block; margin-top: 7px;"></span>
                        <span style="margin-left: 20px; position: relative; top: 6.2px;">${_('= give 1 Psych and 1 Card to another')}</span><br>
                        <span style="margin-left: 30px; position: relative; top: 5px;">${_('player')}</span>
                        <p style="text-align: center; margin-top: -5px;">________________</p>
                        <h4 style="margin-top: -2px;"><strong>${_('Techniques and Trades')}</strong></h4>
                        <p>${_('When you play 3 Cards with matching Technique symbols, gain a 2-point token.')}</p>
                        <p>${_('Technique tokens (earned from climbing cards) are used in place of a Card to match Technique symbols. Discard after using.')}</p>
                        <p>${_('On your turn, you may trade in 3 Cards of a kind from your hand for a Card from The Portaledge')}</p>
                        <p style="text-align: center; margin-top: -5px;">________________</p>
                        <h4 style="margin-top: -2px;"><strong>${_('Ways to Earn Points')}</strong></h4>
                        <p>${_('• Climbing Pitches')}</p>
                        <p>${_('• Matching Technique symbols')}</p>
                        <p>${_('• Completing Shared Objectives')}</p>
                        <p>${_('• Completing 1 Personal Objective')}</p>
                        <p>${_('• Reaching a Summit')}</p>
                        </div>`;
            this.addTooltipHtml(`ref_2`, html, 1000);


            //// Stocks

            // asset cards

            this.playerHand = new ebg.stock();
            this.playerHand.create(this, $('hand_assets'), this.asset_width, this.asset_height);
            this.playerHand.image_items_per_row = 12;
            this.playerHand.backgroundSize = '1200% 400%';
            this.playerHand.autowidth = true;
            let a_id = 1;
            for (let row=1; row<=4; row++) {
                for (let col=1; col<=12; col++) {
                    if (row === 1 && col > 1 && col <= 10) {
                        this.playerHand.addItemType(a_id-1, a_id-1, g_gamethemeurl+'img/asset_cards.jpg', a_id-1);
                    } else if (row === 2) {
                        this.playerHand.addItemType(a_id-3, a_id-3, g_gamethemeurl+'img/asset_cards.jpg', a_id-1);
                    } else if (row === 3 && col <= 8) {
                        this.playerHand.addItemType(a_id-3, a_id-3, g_gamethemeurl+'img/asset_cards.jpg', a_id-1);
                    } else if (row === 4 && col <= 8) {
                        this.playerHand.addItemType(a_id-7, a_id-7, g_gamethemeurl+'img/asset_cards.jpg', a_id-1);
                    }
                a_id++;
                }
            }
            this.playerHand.addToStockWithId(22, 10);
            this.playerHand.addToStockWithId(10, 11);

            // summit beta tokens

            this.playerSummit = new ebg.stock();
            this.playerSummit.create(this, $('hand_tokens'), this.summit_width, this.summit_height);
            this.playerSummit.image_items_per_row = 4;
            this.playerSummit.backgroundSize = '400% 800%';
            this.playerSummit.autowidth = true;
            let s_id = 1;
            for (let row=2; row<=4; row++) {
                for (let col=1; col<=4; col++) {
                    this.playerSummit.addItemType(s_id, s_id, g_gamethemeurl+'img/summit_objectives.png', s_id+3);
                    s_id++;
                }
            }
            this.playerSummit.addToStockWithId(12, 1);

            // personal objectives in hand ***MOCK UP, DELETE LATER***
            dojo.place(`<div class="personal_objective po1" style="display: inline-block;"></div>
                        <div class="personal_objective po2" style="display: inline-block;"></div>`, 'myhand_wrap');

 
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
                if (this.isCurrentPlayerActive()) { 
                dojo.query('.character_select').forEach((element) => {
                    dojo.style(element, 'pointer-events', 'auto');
                });
            }
                break;
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
            case 'dummmy':
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

            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
           
            case 'dummmy':
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


        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */
        
        /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/firstascent/firstascent/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */

        onChooseCharacter: function(evt) {
            dojo.stopEvent(evt);

            let character = evt.currentTarget.id.slice(-2).replace(/^\D+/g, '');

            if (this.checkAction('chooseCharacter')) {
                this.ajaxcall("/firstascent/firstascent/chooseCharacter.html", { lock: true,
                    character : character
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

            dojo.subscribe('chooseCharacter', this, "notif_chooseCharacter");
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods
        
        /*
        Example:
        
        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed' );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            // TODO: play the card in the user interface.
        },    
        
        */

        notif_chooseCharacter: function(notif) {
            let active_player = this.gamedatas.players[notif.args.player_id];
            if (notif.args.player_id == this.player_id) {
                dojo.place(this.format_block('jstpl_character_area', {
                        player : notif.args.player_id,
                        color : active_player.color,
                        player_name : active_player.name,
                        player_name : active_player.name,
                    }), 'character_wrap', 'first');
                if ($('character_wrap').children.length > 1) {
                    dojo.style(`character_area_${active_player.name}`, 'margin-bottom', '35px');
                    dojo.style(`player_${this.player_id}`, 'margin-bottom', '35px');
                }
            } else {
                dojo.place(this.format_block('jstpl_character_area', {
                        player : notif.args.player_id,
                        color : active_player.color,
                        player_name : active_player.name,
                        player_name : active_player.name,
                    }), 'character_wrap');
                if ($('character_wrap').children.length > 1) {
                dojo.style(`character_area_${active_player.name}`, 'margin-top', '35px');
                }
            }
            dojo.removeClass(notif.args.character_div, 'character_select');
            this.attachToNewParent(notif.args.character_div, `player_${notif.args.player_id}`);
            this.slideToObjectPos(notif.args.character_div, `player_${notif.args.player_id}`, 0, 28).play();
            if (notif.args.player_id == this.player_id) { 
                dojo.place(`player_${this.player_id}`, 'character_wrap', "first");
            }
            let character = this.gamedatas.characters[notif.args.character_num];
            let ab_pos = character['ab_x_y'];
            dojo.place(this.format_block('jstpl_asset_board', {
                    abX : ab_pos[0],
                    abY : ab_pos[1],
                }), notif.args.character_div);
            if ($('character_selection').children.length == 1) { dojo.empty('character_selection'); }
            if (this.isCurrentPlayerActive()) { 
                dojo.query('.character_select').forEach((element) => {
                    dojo.style(element, 'pointer-events', 'none');
                });
            }
        },
   });             
});
