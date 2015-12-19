import ko from 'knockout';
import templateMarkup from 'text!./finne.html';
import { Communicator } from './communicator';
import { Chat } from '../../lib/misc/chat';
import { Transform } from '../../lib/misc/transform';
import { Scene } from '../../lib/misc/scene';
import { Card } from '../../lib/misc/card';
import { CardGenerator } from '../../lib/misc/card-generator';
import { Hand } from '../../lib/misc/group-of-cards.hand';
import { Stack } from '../../lib/misc/group-of-cards.stack';
import { Pyramid } from '../../lib/misc/group-of-cards.pyramid';
import copyArray from '../../lib/misc/utilities';

ko.bindingHandlers.modalVisible = {
    init: function (element) {
        $(element).modal({
      /*      backdrop: 'static',*/
        });
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        if(value()) {
            $(element).modal('show');
        }
        else {
            $(element).modal('hide');
        }
    }
}

class Finne {
    constructor(params) {
        var $gameArea = $('#finne-page canvas');
        this.canvas = $gameArea[0];
        this.canvas.width = window.innerWidth - 200;
        this.canvas.height = window.innerHeight;
        $('#finne-page').css('background-size', 'auto ' + this.canvas.width + 'px');

        this.ctx = this.canvas.getContext('2d');
        
        var possibleName = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++) {
            possibleName += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        this.possibleName = ko.observable(possibleName);

        this.scene = new Scene({ canvas: this.canvas });

        this.chat = new Chat({ scrollFollow: '#chat-log' });
        this.chatMessage = ko.observable();

        this.cardGenerator = new CardGenerator({ scene: this.scene });

        this.gameCode = ko.observable();
        this.gameIsInProgress = ko.observable(false);
        this.server = new Communicator({
            chat: this.chat,
            handleIncoming: (message) => this.incoming(message),
        });
        this.cardGroups = {};
        this.playerSignature;
        this.hoveredCard = {};
        this.allowedPlays = {};
        this.popupCardChoices = ko.observableArray([]);
        this.popupCardDestinations = ko.observableArray([]);


        this.cardGenerator.loadCards().then(() => {
            this.setupCardGroups();
            this.setupEventListeners();
           // this.showShuffling()
        });
        
        //  cardsLoadedPromise.then((result) => {

        //     this.showShuffling();
        //     this.setupCardGroups();
        /*

            console.log(this.opponentHand);

            this.canvas.addEventListener('resize', (e) => {
                console.log('resize fired', e);
                this.canvas.width = window.innerWidth - 300;
                this.canvas.height = window.innerHeight;
            });

            this.canvas.addEventListener('mousemove', (e) => {
                var position = this.getCursorLocation(e);
                this.cardGroups.myHand.markHoverable(position);
                this.cardGroups.stack.markHoverable(position);
                this.cardGroups.pile.markHoverable(position);
                this.cardGroups.myPyramid.markHoverable(position);
                
                this.drawCardGroups();
            });
            this.canvas.addEventListener('click', (e) => {
                var pilePosition = this.cardGroups.pile.newCardPosition();
                if(this.cardGroups.myHand.moveHoveredOnto(this.cardGroups.pile, (card) => {
                    console.log('pileposition', pilePosition);
                        card.setMove({ steps: 20, rotations: 3, toPosition: pilePosition })
                })) {
                    this.drawCardGroups();

                    if(this.cardGroups.pile.cards.map((card) => {
                        card.hasMove()
                    }).length) {
                        requestAnimationFrame(() => this.aCardIsMoving());
                    }
                }
            })

            
            this.animateACard();
            this.start();*/
       // });
    }
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            var position = this.getCursorLocation(e);
            var hoveredCard;

            if(hoveredCard = this.cardGroups.pile.markHoverable(position)) {
                this.hoveredCard.card = hoveredCard;
                this.hoveredCard.origin = 'pile';
            }
            else if(hoveredCard = this.cardGroups.myHand.markHoverable(position)) {
                this.hoveredCard.card = hoveredCard;
                this.hoveredCard.origin = 'hand';
            }
            else if(hoveredCard = this.cardGroups.stack.markHoverable(position)) {
                console.log('hovercard stack', hoveredCard);
                this.hoveredCard.card = hoveredCard;
                this.hoveredCard.origin = 'stack';
            }
            else if(!this.cardGroups.myHand.cards.length
                 && !this.cardGroups.stack.cards.length
                 && (hoveredCard = this.cardGroups.myPyramid.markHoverable(position))) {

                    console.log('hovercard pyramid', hoveredCard, this.allowedPlays);

                    this.hoveredCard.card = hoveredCard;
                    this.hoveredCard.origin = 'pyramid';
                    this.hoveredCard.pyramidLocation = hoveredCard.pyramidLocation;
            }
            else {
                this.hoveredCard = {};
            }
            console.log('after hover', this.allowedPlays, this.cardGroups.myPyramid);
            this.drawCardGroups();
        });

        this.canvas.addEventListener('click', (e) => {
            this.attemptMakePlay();
        });
    }

    attemptMakePlay() {
        // no card hovered
        if(!this.hoveredCard.card) {
            return;
        }
        // Remove earlier plays information from chat
    //    this.chat.chatMessages(this.chat.chatMessages().filter((chatMessage) => {
    //        return chatMessage.className !== 'chat-status-server-play';
    //    }));
    
        var hoveredCard = this.hoveredCard.card;
        if(this.hoveredCard.origin === 'pile') {
            if(!this.allowedPlays.pile) {
                return;
            }
            this.server.makePlay({
                signature: this.playerSignature,
                cards: this.cardGroups.pile.cards,
                origin: 'pile',
                destination: 'hand',
            });
        }
        else if(this.allowedPlays.pile) {
            this.chat.put({ from: 'server', text: 'You must pick up the pile', status: 'play' });
        }
        else if(this.hoveredCard.origin === 'hand') {

            // nothing allowed
            if(!this.allowedPlays.hand.length) {
                return;
            }

            var cardsOnHand = this.cardGroups.myHand.cards.filter((card) => {
                return card.suit === hoveredCard.suit && card.value === hoveredCard.value;
            });
            if(cardsOnHand.length === 1) {
                let cardOnHand = cardsOnHand[0];
                let allowedPlay = (this.allowedPlays.hand.filter((play) => {
                    return cardOnHand.suit === play.suit, cardOnHand.value === play.value;
                }))[0];

                if(allowedPlay.to) {

                    let cardsWithSameValue = this.cardGroups.myHand.cards.filter((card) => {
                        return card.value === cardOnHand.value
                    });
                    console.log('cards, same value', cardsWithSameValue);
                    if(cardsWithSameValue.length > 1 || allowedPlay.to.length > 1) {
                        console.log('sets otherCardsWithSameValue');
                        this.popupCardChoices(cardsWithSameValue);
                        this.popupCardDestinations(allowedPlay.to.map((thisTo) => {
                            return { to: thisTo };
                        }));
                    }
                    else if(allowedPlay.to.length === 1) {
                        this.server.makePlay({
                            signature: this.playerSignature,
                            cards: [cardOnHand],
                            origin: 'hand',
                            destination: allowedPlay.to[0],
                        });
                    }
                }
                else {
                    this.chat.put({ from: 'server', text: 'Cant make that move', status: 'warnings' });
                }
            }
        }
        else if(this.hoveredCard.origin === 'stack' && this.allowedPlays.stack) {
            console.log('allowed plays', this.allowedPlays);
            this.server.makePlay({
                signature: this.playerSignature,
                origin: 'stack',
                destination: 'pile',
            });
        }
        else if(this.hoveredCard.origin === 'pyramid') {
            console.log('attemptMakePlay', this.hoveredCard, this.allowedPlays);
            let hoveredRowIndex = this.hoveredCard.pyramidLocation.rowIndex;
            let hoveredCardIndex = this.hoveredCard.pyramidLocation.cardIndex;

            var allowedPlay;
            if(allowedPlay = this.allowedPlays.pyramid[hoveredRowIndex][hoveredCardIndex]) {
                if(allowedPlay.to.length === 1) {
                    this.server.makePlay({
                        signature: this.playerSignature,
                        pyramidLocation: { rowIndex: hoveredRowIndex, cardIndex: hoveredCardIndex },
                        origin: 'pyramid',
                        destination: allowedPlay.to[0],
                    });
                }
            }
        }
    }
    popupMakeMove() {
        console.log('made popup move', this.hoveredCard);
        console.log($('.card-choices'), $('.card-destination'));
        let origin = this.hoveredCard.origin;
        let cardValue = this.hoveredCard.card.value;

        var playTo;
        $('.card-destination').each((i, el) => {
            var $el = $(el);
            if($el.prop('checked')) {
                playTo = $el.val();
            }
        });
        if(!playTo) {
            this.chat.put({ from: 'server', text: "Destination not chosen, can't play", status: 'play' });
            return;
        }

        var cardsToPlay = [];
        $('.card-choices').each((i, el) => {
            var $el = $(el);
            console.log('el', $el);
            console.log('val', $el.val() );
            if($el.prop('checked')) {
                cardsToPlay.push({ value: cardValue, suit: $el.val(), to: playTo });
            }
        });
        this.popupCardChoices([]);
        this.popupCardDestinations([]);

        if(!cardsToPlay.length) {
            return;
        }

        let allowedPlay = (this.allowedPlays.hand.filter((play) => {
            return cardsToPlay[0].suit === play.suit && cardsToPlay[0].value === play.value && play.to.indexOf(cardsToPlay[0].to) >= 0;
        }))[0];

        if(allowedPlay) {

            this.server.makePlay({
                signature: this.playerSignature,
                cards: cardsToPlay,
                origin: 'hand',
                destination: cardsToPlay[0].to,
            });
        }
        
        console.log($('.card-choice-value'), $('.card-choice-value').first().val());
        console.log('end popup move');
    }
//            if(this.hoveredCard.card) {
//                this.server.makePlay({
//                    signature: this.playerSignature,
//                    card: this.hoveredCard.card,
//                    origin: this.hoveredCard.origin,
//                })
//                .then((value) => {
//
//                },
//                (reason) => {
//                    
//                });
//            }
//            var success = this.server.joinGame({ player_name: playerName, game_code: this.gameCode() });
//            if(success) {
//                this.chat.put({ from: 'server', text: 'Connected to server' });
//            }
//            else {
//                this.chat.put({ from: 'server', status: 'warnings', text: 'Failed to connect to server, try again.'});
//            }


/*

            this.canvas.addEventListener('click', (e) => {
                var pilePosition = this.cardGroups.pile.newCardPosition();
                if(this.cardGroups.myHand.moveHoveredOnto(this.cardGroups.pile, (card) => {
                    console.log('pileposition', pilePosition);
                        card.setMove({ steps: 20, rotations: 3, toPosition: pilePosition })
                })) {
                    this.drawCardGroups();

                    if(this.cardGroups.pile.cards.map((card) => {
                        card.hasMove()
                    }).length) {
                        requestAnimationFrame(() => this.aCardIsMoving());
                    }
                }
            })

*/





    // TODO: Remove this in production...
    clearAllGames() {
        this.server.sendCommand('reset_games');
    }
    submitChatMessage() {
        if(this.chatMessage().length) {
            var success = this.server.sendCommand('chat', { message: this.chatMessage() });

            if(success) {
                this.chat.put({ from: 'self', text: this.chatMessage() });
                this.chatMessage('');
            }
        }
    }
    newGame(form) {
        var playerName = $('#name').val();
        this.gameCode($('#gamecode').val());

        var success = this.server.joinGame({ player_name: playerName, game_code: this.gameCode() });
        if(success) {
            this.chat.put({ from: 'server', text: 'Connected to server' });
        }
        else {
            this.chat.put({ from: 'server', status: 'warnings', text: 'Failed to connect to server, try again.'});
        }
    }

    showShuffling() {
        var showShuffler = new Stack({
            scene: this.scene,
            cardGenerator: this.cardGenerator,
            groupArea: {
                centerY: this.canvas.height * 0.25,
                centerX: this.canvas.width * 0.45,
                maxWidth: this.canvas.width * .2,
                maxHeight: this.canvas.height * 0.2,
            },
            drawParams: {
                width: 400,
                rotationFuzzyness: 180,
                centerFuzzyness: 4,
            },
        });
        for (var i = 1; i <= 52; i += 1) {
            showShuffler.addCard('back', 'red');
        }

        requestAnimationFrame(() => { this.showShufflingAnimated(showShuffler)});
    }
    showShufflingAnimated(showShuffler) {
        if(!showShuffler.cards.length) {
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        showShuffler.cards.pop();
        this.cardGroups.stack.addCard('back', 'red');
        showShuffler.rerandomizeAllCards();
        this.cardGroups.stack.draw();
        showShuffler.draw();
        requestAnimationFrame(() => { this.showShufflingAnimated(showShuffler)});
    }
    incomingInitGame(message) {
        this.gameIsInProgress(true);
        this.playerSignature = message.player.signature;
        this.allowedPlays = message.allowed_plays;
        console.log('set allowed plays', this.allowedPlays);
        console.log(message.player, message.player.cards, message.stack);
        if(message.is_starting_player) {
            this.chat.put({ from: 'server', text: "It's your turn", status: 'info' });
        }
        else {
            this.chat.put({ from: 'server', text: "Waiting for opponent", status: 'info' });
        }
        this.dealCards(message).then(() => { console.log('dealt cards')});
    }
    incoming(message) {
        if(message.command === 'init_game') {
            this.incomingInitGame(message);
        }
        else if(message.command === 'chat') {
            this.chat.put({ from: message.from || 'other', text: message.message, status: message.status });
        }
        else if(message.command === 'move_card') {
            this.incomingMoveCard(message);
        }
    }
    incomingMoveCard(message) {
        let from = message.from;
        let to = message.to;

        let cards = message.cards;
        console.log('incoming move card', message, cards);

        for (var i = 0; i < cards.length; i += 1) {
            let suit = cards[i].suit;
            let value = cards[i].value;

            if(from === 'hand' && to === 'pile') {
                this.cardGroups.myHand.moveCardOnto(suit, value, this.cardGroups.pile, (card) => {
                    card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.pile.newCardPosition() });
                });
            }
            else if(from === 'opponents_hand' && to === 'pile') {
                this.cardGroups.opponentsHand.replacePrivateCard([{ suit: suit, value: value }]);
                this.cardGroups.opponentsHand.moveCardOnto(suit, value, this.cardGroups.pile, (card) => {
                    card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.pile.newCardPosition() });
                });
            }
            else if(from === 'stack' && to === 'hand') {
                this.cardGroups.stack.replacePrivateCard([{ suit: suit, value: value }]);
                this.cardGroups.stack.moveCardOnto(suit, value, this.cardGroups.myHand, (card) => {
                    card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.myHand.newCardPosition() });
                });
            }
            else if(from === 'stack' && to === 'opponents_hand') {
                this.cardGroups.stack.moveCardOnto(suit, value, this.cardGroups.opponentsHand, (card) => {
                    card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.opponentsHand.newCardPosition() });
                });
            }
            else if(from === 'stack' && to === 'pile') {
                console.log('moving from stack to pile', suit, value);

                this.cardGroups.stack.replacePrivateCard([{ suit: suit, value: value }]);
                this.cardGroups.stack.moveCardOnto(suit, value, this.cardGroups.pile, (card) => {
                    card.setMove({ steps: 10, rotation: 0, toPosition: this.cardGroups.pile.newCardPosition() });
                });
            }
            else if(from === 'pile' && to === 'hand') {
                console.log('moving from pile to hand', suit, value);
                this.cardGroups.pile.moveCardOnto(suit, value, this.cardGroups.myHand, (card) => {
                    card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.myHand.newCardPosition() });
                });

            }
            else if(from === 'pile' && to === 'opponents_hand') {
                console.log('moving from pile to opponents hand', suit, value);
                this.cardGroups.pile.replaceAllPublicCards(value);
                this.cardGroups.pile.moveCardOnto(suit, value, this.cardGroups.opponentsHand, (card) => {
                    card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.opponentsHand.newCardPosition() });
                });
            }
            else if(from === 'pile' && to === 'discarded') {
                console.log('moving from pile to discarded', suit, value);
                this.cardGroups.pile.replaceAllPublicCards(value);
                this.cardGroups.pile.moveCardOnto(suit, value, this.cardGroups.discarded, (card) => {
                    card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.discarded.newCardPosition() });
                });
            }
            else if(from === 'pyramid') {
                console.log('moving from pyramid to hand', message);
                var rowIndex = message.pyramid_location.row_index;
                var cardIndex = message.pyramid_location.card_index;

                var cardStack = this.cardGroups.myPyramid.cards[rowIndex][cardIndex];

                if(cardStack.cards[0].suit === 'back') {
                    cardStack.replacePrivateCard(message.cards);
                }

                if(to === 'hand') {
                    cardStack.moveCardOnto(suit, value, this.cardGroups.myHand, (card) => {
                        card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.myHand.newCardPosition() });
                    });
                }
                else if(to === 'pile') {
                    cardStack.moveCardOnto(suit, value, this.cardGroups.pile, (card) => {
                        card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.pile.newCardPosition() });
                    });
                }

            }
            else if(from === 'opponents_pyramid') {
                console.log('moving from opponents_pyramid to opponents_hand', message);
                var rowIndex = message.pyramid_location.row_index;
                var cardIndex = message.pyramid_location.card_index;

                var cardStack = this.cardGroups.opponentsPyramid.cards[rowIndex][cardIndex];

                if(to === 'opponents_hand') {
                    cardStack.moveCardOnto(suit, value, this.cardGroups.opponentsHand, (card) => {
                        card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.opponentsHand.newCardPosition() });
                    });
                }
                else if(to === 'pile') {
                    cardStack.moveCardOnto(suit, value, this.cardGroups.pile, (card) => {
                        card.setMove({ steps: 20, rotations: 3, toPosition: this.cardGroups.pile.newCardPosition() });
                    });
                }
            }
        }

        if(this.cardGroups.pile.cards.map((card) => { card.hasMove() }).length) {
            requestAnimationFrame(() => this.aCardIsMoving());
        }
        else if(this.cardGroups.stack.cards.map((card) => { card.hasMove() }).length) {
            requestAnimationFrame(() => this.aCardIsMoving());
        }
        else if(this.cardGroups.discarded.cards.map((card) => { card.hasMove() }).length) {
            requestAnimationFrame(() => this.aCardIsMoving());
        }
        else if(this.cardGroups.myHand.cards.map((card) => { card.hasMove() }).length) {
            requestAnimationFrame(() => this.aCardIsMoving());
        }
        else if(this.cardGroups.opponentsHand.cards.map((card) => { card.hasMove() }).length) {
            requestAnimationFrame(() => this.aCardIsMoving());
        }

        this.allowedPlays = message.allowed_plays;
    }
    /*
    command: "move_card"
from: "hand"
hand: Object
cards: Array[2]
__proto__: Object
suit: "hearts"
to: "pile"
value: "3"


this.canvas.addEventListener('click', (e) => {
                var pilePosition = this.cardGroups.pile.newCardPosition();
                if(this.cardGroups.myHand.moveHoveredOnto(this.cardGroups.pile, (card) => {
                    console.log('pileposition', pilePosition);
                        card.setMove({ steps: 20, rotations: 3, toPosition: pilePosition })
                })) {
                    this.drawCardGroups();

                    if(this.cardGroups.pile.cards.map((card) => {
                        card.hasMove()
                    }).length) {
                        requestAnimationFrame(() => this.aCardIsMoving());
                    }
                }
            })

*/
    dealCards(message) {
        message.stack.cards.map((cardData) => { this.cardGroups.stack.addCard(cardData.suit, cardData.value) });
        message.player.cards_on_hand.cards.map((cardData) => { this.cardGroups.myHand.addCard(cardData.suit, cardData.value) });
        message.opponent.cards_on_hand.cards.map((cardData) => { this.cardGroups.opponentsHand.addCard(cardData.suit, cardData.value) });

        let playerCardsOnTable = message.player.cards_on_table;
        let opponentCardsOnTable = message.opponent.cards_on_table;

        return new Promise((resolve, reject) => {
            for (var rowIndex = 0; rowIndex <= 4; rowIndex += 1) {
                for (var cardIndex = 0; cardIndex <= (4 - rowIndex); cardIndex += 1) {
                    let myCard = playerCardsOnTable.cards[rowIndex][cardIndex].cards[0];
                    let opponentCard = opponentCardsOnTable.cards[rowIndex][cardIndex].cards[0];

                    this.cardGroups.myPyramid.addCard(rowIndex, cardIndex, myCard.suit, myCard.value);
                    this.cardGroups.opponentsPyramid.addCard(rowIndex, cardIndex, opponentCard.suit, opponentCard.value);
                    requestAnimationFrame(() => this.drawCardGroups());
                }

            }


         //   for (var i = 1; i <= 15; i += 1) {
         //       this.cardGroups.stack.moveTopCardOnto(this.cardGroups.myPyramid, (card) => {
         //            card.setMove({ steps: 20, rotations: 0, toPosition: this.cardGroups.myPyramid.newCardPosition() });
         //       });
         //   }
        }).then(() => { return });
    }
    drawCardGroups() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.cardGroups.myHand.sortBy('value');

        this.cardGroups.discarded.draw();
        this.cardGroups.myHand.draw();
        this.cardGroups.opponentsHand.draw();
        this.cardGroups.myPyramid.draw();
        this.cardGroups.opponentsPyramid.draw();
        this.cardGroups.stack.draw();
        this.cardGroups.pile.draw();
    }
    aCardIsMoving() {
        this.drawCardGroups();
        let cardGroups = ['myHand', 'opponentsHand', 'stack', 'pile', 'discarded'];

        for (var i = 0; i < cardGroups.length; i += 1) {
            var cardGroup = cardGroups[i];
            if(this.cardGroups[cardGroup].cards.map((card) => {
                card.hasMove()
            }).length) {
                requestAnimationFrame(() => this.aCardIsMoving());
                break;
            }
        }

    }
    animateACard() {
        /*
        var card = new Card({
            suit: 'clubs',
            value: 'queen',
            image: this.cardGenerator.card('clubs', 'queen'),
            scene: this.scene,
        });
        this.cardGroups.myHand.ensureCard('clubs', 'queen');
        this.cardGroups.myHand.ensureCard('spades', 'king');
        this.cardGroups.myHand.ensureCard('diamonds', 'queen');
        this.cardGroups.myHand.ensureCard('spades', 'king');
        this.cardGroups.myHand.ensureCard('diamonds', '4');
        this.cardGroups.myHand.ensureCard('hearts', 'jack');

        this.cardGroups.myHand.addCard('clubs', 'queen');
        this.cardGroups.myHand.addCard('spades', 'king');
        this.cardGroups.myHand.addCard('diamonds', 'queen');
        this.cardGroups.myHand.addCard('spades', 'king');
        this.cardGroups.myHand.addCard('diamonds', '4');
        this.cardGroups.myHand.addCard('hearts', 'jack');
        this.cardGroups.myHand.addCard('clubs', 'queen');
        this.cardGroups.myHand.addCard('spades', 'king');
        this.cardGroups.myHand.addCard('diamonds', 'queen');
        this.cardGroups.myHand.addCard('spades', 'king');
        this.cardGroups.myHand.addCard('diamonds', '4');
        this.cardGroups.myHand.addCard('hearts', 'jack');

        this.cardGroups.opponentsHand.addCard('back', 'red');
        this.cardGroups.opponentsHand.addCard('back', 'red');
        this.cardGroups.opponentsHand.addCard('back', 'red');

        for (var i = 0; i < 25; i++) {
            this.cardGroups.stack.addCard('back', 'red');
        }
        for (var i = 0; i < 25; i++) {
            this.cardGroups.discarded.addCard('back', 'red');
        }
        this.cardGroups.pile.ensureCard('clubs', 'queen');
        this.cardGroups.pile.ensureCard('spades', 'king');
        this.cardGroups.pile.ensureCard('diamonds', 'queen');
        this.cardGroups.pile.ensureCard('spades', 'king');
        this.cardGroups.pile.ensureCard('diamonds', '4');
        this.cardGroups.pile.ensureCard('hearts', 'jack');
        this.cardGroups.pile.ensureCard('diamonds', '8');

        this.cardGroups.myPyramid.addCard(1, 'back', 'red');
        this.cardGroups.myPyramid.addCard(1, 'back', 'red');
        this.cardGroups.myPyramid.addCard(1, 'back', 'red');
        this.cardGroups.myPyramid.addCard(1, 'back', 'red');
        this.cardGroups.myPyramid.addCard(1, 'back', 'red');
        this.cardGroups.myPyramid.addCard(2, 'diamonds', 'queen');
        this.cardGroups.myPyramid.addCard(2, 'spades', 'king');
        this.cardGroups.myPyramid.addCard(2, 'diamonds', '4');
        this.cardGroups.myPyramid.addCard(2, 'hearts', 'jack');
        this.cardGroups.myPyramid.addCard(3, 'back', 'red');
        this.cardGroups.myPyramid.addCard(3, 'back', 'red');
        this.cardGroups.myPyramid.addCard(3, 'back', 'red');
        this.cardGroups.myPyramid.addCard(4, 'clubs', 'queen');
        this.cardGroups.myPyramid.addCard(4, 'hearts', 'ace');
        this.cardGroups.myPyramid.addCard(5, 'back', 'red');

        this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
        this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
        this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
        this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
        this.cardGroups.opponentsPyramid.addCard(1, 'back', 'red');
        this.cardGroups.opponentsPyramid.addCard(2, 'diamonds', 'queen');
        this.cardGroups.opponentsPyramid.addCard(2, 'spades', 'king');
        this.cardGroups.opponentsPyramid.addCard(2, 'diamonds', '4');
        this.cardGroups.opponentsPyramid.addCard(2, 'hearts', 'jack');
        this.cardGroups.opponentsPyramid.addCard(3, 'back', 'red');
        this.cardGroups.opponentsPyramid.addCard(3, 'back', 'red');
        this.cardGroups.opponentsPyramid.addCard(3, 'back', 'red');
        this.cardGroups.opponentsPyramid.addCard(4, 'clubs', 'queen');
        this.cardGroups.opponentsPyramid.addCard(4, 'hearts', 'ace');
        this.cardGroups.opponentsPyramid.addCard(5, 'back', 'red');

        card.draw({ x: 300, y: 500, resizer: 0.6 });
        return this.startAnimating(card, 300);
        */
    }
    startAnimating(card, x) {
        this.drawCardGroups();
   //     card.draw({ x: x, y: 500, resizer: 0.6, rotationFuzzyness: 0 });
        if(x > 650) {
            return;
        }
        return requestAnimationFrame(() => this.startAnimating(card, x + 5));
    }
    start() {
        /*
        this.myHand.addCard('clubs', 'queen');
        this.myHand.addCard('spades', 'king');
        this.myHand.addCard('diamonds', 'queen');
        this.myHand.addCard('spades', 'king');
        this.myHand.addCard('diamonds', '4');
        this.myHand.addCard('hearts', 'jack');
        this.myHand.addCard('clubs', 'queen');
        this.myHand.addCard('spades', 'king');
        this.myHand.addCard('diamonds', 'queen');
        this.myHand.addCard('spades', 'king');
        this.myHand.addCard('diamonds', '4');
        this.myHand.addCard('hearts', 'jack');
        */
        this.drawCardGroups();
        this.cardGroups.myHand.sortBy('suit');
        //   setTimeout(() => { this.ctx.clearRect(0, 100, 2000, 1000); this.myHand.draw() }, 1500);

        var y = this.canvas.height - 50;
        this.areas.push( this.cards.card('clubs', 'queen').draw({ x: 400, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }) );
        this.areas.push( this.cards.card('spades', 'king').draw({ x: 470, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }) );
        this.areas.push( this.cards.card('diamonds', 'queen').draw({ x: 540, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }) );
        this.areas.push( this.cards.card('spades', 'king').draw({ x: 610, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }) );
        this.areas.push( this.cards.card('diamonds', '4').draw({ x: 680, y: y, size: 0.5, rotation: 0, rotationFuzzyness: 3, centerFuzzyness: 0.05 }) );

        this.draggableIndex = null;
        this.draggedIndex = null;

        this.canvas.addEventListener('mousemove', (e) => {
            var position = this.getCursorLocation(e);
            
            if(this.draggedIndex !== null) {
                var params = {
                    x: position.x,
                    y: position.y,
                    useActual: true,
                };

                this.draw(this.draggedIndex);
                this.areas[this.draggedIndex].redrawOutline(params);
                this.areas[this.draggedIndex].redraw(params);
            }
            else {
                var found = false;

                FINDCARD:
                for (var i = this.areas.length - 1; i >= 0; i--) {
                    if(this.areas[i].isHover(position)) {
                        e.target.style.cursor = 'pointer';
                        this.draggableIndex = i;
                        this.writeMessage('Over ' + this.areas[i].suit + ' ' + this.areas[i].value);
                        this.draw(i, () => {
                            var area = this.areas[i];

                            for (var j = 0; j <= 5; j++) {
                                requestAnimationFrame(() => {
                                    area.redrawOutline({ y: area.drawParams.y - 20 * j, useActual : true });
                                    area.redraw({ y: area.drawParams.y - 20 * j, useActual : true });
                                });
                            }
                        });
                        found = true;
                        break FINDCARD;
                    }
                    e.target.style.cursor = 'default';
                }
                if(!found) {
                    this.draggableIndex = null;
                    for (var i = this.areas.length; i >= 0; i--) {
                        this.draw();
                        e.target.style.cursor = 'default';
                        this.writeMessage('...');
                    }
                }
            }
        });
        this.canvas.addEventListener('mousedown', (e) => {
            var position = this.getCursorLocation(e);
            console.log('mouse is down');
            if(this.draggableIndex !== null) {
                this.draggedIndex = this.draggableIndex;
            }
        });
        this.canvas.addEventListener('mouseup', (e) => {
            this.draw();
            this.draggedIndex = null;
        });
    }
    draw(hoveredIndex = -100, callback = () => {}) {
        this.ctx.clearRect(0, 100, 2000, 1000);
        for (var i = 0; i < this.areas.length; i++) {
            if(i === hoveredIndex) {
                callback();
            }
            else {
                this.areas[i].redraw({ useActual: true });
            }
        }
    }
    getCursorLocation(e) {
        var bounds = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        };
    }
    writeMessage(message) {
        this.ctx.clearRect(0, 0, 500, 100);
        this.ctx.font = '18pt Calibri'; 
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(message, 10, 55);

    }







    setupCardGroups() {
        this.setupCardGroupMyHand();
        this.setupMyPyramid();
        this.setupCardGroupOpponentsHand();
        this.setupOpponentsPyramid();
        this.setupCardGroupStack();
        this.setupCardGroupPile();
        this.setupCardGroupDiscarded();
    }

    // Hands
    handCommonParams() {
        return {
            scene: this.scene,
            cardGenerator: this.cardGenerator,
            groupArea: {
                leftX: 20,
                centerY: this.canvas.height * 0.95,
                maxWidth: this.canvas.width / 3,
                maxHeight: this.canvas.height / 3,
            },
            drawParams: {
                width: 400,
                baseRotation: 0,
                rotationFuzzyness: 3,
                centerFuzzyness: 0.05,
            },
        };
    }
    setupCardGroupMyHand() {
        let params = this.handCommonParams();
        params.groupArea.centerY = this.canvas.height * 0.95,
        this.cardGroups.myHand = new Hand(params);
    }
    setupCardGroupOpponentsHand() {
        let params = this.handCommonParams();
        params.groupArea.centerY = this.canvas.height * 0.05,
        this.cardGroups.opponentsHand = new Hand(params);
    }
    // Stacks
    stackClassCommonParams() {
        return {
            scene: this.scene,
            cardGenerator: this.cardGenerator,
            groupArea: {
                
                centerY: this.canvas.height / 2,
                maxWidth: 200,
                maxHeight: this.canvas.height / 4,
            },
            drawParams: {
                width: 350,
                baseRotation: 0,
            },
        };
    }
    setupCardGroupStack() {
        let params = this.stackClassCommonParams();
        params.groupArea.leftX = this.canvas.width * 0.5;
        params.drawParams.rotationFuzzyness = 8;
        params.drawParams.centerFuzzyness = .1;

        this.cardGroups.stack = new Stack(params);
    }
    setupCardGroupPile() {
        let params = this.stackClassCommonParams();
        params.groupArea.leftX = this.canvas.width * 0.3;
        params.drawParams.rotationFuzzyness = 12;
        params.drawParams.centerFuzzyness = .1;

        this.cardGroups.pile = new Stack(params);
    }
    setupCardGroupDiscarded() {
        let params = this.stackClassCommonParams();
        params.groupArea.leftX = this.canvas.width * 0.08;
        params.drawParams.rotationFuzzyness = 45;
        params.drawParams.centerFuzzyness = .5;

        this.cardGroups.discarded = new Stack(params);
    }
    // Pyramids
    pyramidCommonParams() {
        return {
            scene: this.scene,
            cardGenerator: this.cardGenerator,
            groupArea: {
                centerX: this.canvas.width * 0.7,
                maxHeight: this.canvas.height * 0.4,
                maxWidth: 1000,
            },
            drawParams: {
                rotationFuzzyness: 3,
                centerFuzzyness: 0.05,
            },
        };
    }
    setupMyPyramid() {
        let params = this.pyramidCommonParams();
        params.groupArea.direction = 'normal';
        params.groupArea.baseRowCenterY = this.canvas.height * 0.95;

        this.cardGroups.myPyramid = new Pyramid(params);
    }
    setupOpponentsPyramid() {
        let params = this.pyramidCommonParams();
        params.groupArea.direction = 'inverted';
        params.groupArea.baseRowCenterY = this.canvas.height * 0.05;

        this.cardGroups.opponentsPyramid = new Pyramid(params);
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Finne, template: templateMarkup };
