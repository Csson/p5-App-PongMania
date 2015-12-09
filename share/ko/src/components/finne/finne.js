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
  //          backdrop: 'static',
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

        this.scene = new Scene({ canvas: this.canvas });

        this.chat = new Chat({ scrollFollow: '#chat-log' });
        this.chatMessage = ko.observable();

      //  this.cards = new CardManager({ scene: this.scene });
        this.cardGenerator = new CardGenerator({ scene: this.scene });

        this.gameCode = ko.observable();
        this.gameIsInProgress = ko.observable(false);
        this.server = new Communicator({
            chat: this.chat,
            handleIncoming: (message) => this.incoming(message),
        });
        var cardResizer = this.canvas.width / 10 / 600; // 2400 / 10 / 600 => 0.3

        var myHandParams = {
            scene: this.scene,
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
        var opponentHandParams = copyArray(myHandParams);
        opponentHandParams.scene = this.scene;
        opponentHandParams.groupArea.centerY = this.canvas.height * 0.05;

        var stackParams = {
            scene: this.scene,
            groupArea: {
                leftX: this.canvas.width * 0.5,
                centerY: this.canvas.height / 2,
                maxWidth: 200,
                maxHeight: this.canvas.height / 4,
            },
            drawParams: {
                width: 350,
                baseRotation: 0,
                rotationFuzzyness: 8,
                centerFuzzyness: .1,
            }
        };
        var pileParams = copyArray(stackParams);
        var discardedParams = copyArray(stackParams);
        pileParams.groupArea.leftX -= this.canvas.width * 0.2;
        pileParams.scene = this.scene;
        pileParams.drawParams.rotationFuzzyness = 15;
        pileParams.drawParams.centerFuzzyness = 0.1;

        discardedParams.groupArea.leftX -= this.canvas.width * 0.42;
        discardedParams.scene = this.scene;
        discardedParams.drawParams.rotationFuzzyness = 45;
        discardedParams.drawParams.centerFuzzyness = .50;

        var pyramidParams = {
            scene: this.scene,
            groupArea: {
                centerX: this.canvas.width * 0.7,
                baseRowCenterY: this.canvas.height * 0.95,
                maxHeight: this.canvas.height * 0.4,
                maxWidth: 1000,
                direction: 'normal',
            },
            drawParams: {
                rotationFuzzyness: 3,
                centerFuzzyness: 0.05,
            },
        };
        var opponentPyramidParams = copyArray(pyramidParams);
        opponentPyramidParams.scene = pyramidParams.scene;
        opponentPyramidParams.groupArea.direction = 'inverted';
        opponentPyramidParams.groupArea.baseRowCenterY = this.canvas.height * 0.05;

        var cardsLoadedPromise = this.cardGenerator.loadCards();
        cardsLoadedPromise.then((result) => {

            console.log('in finne', this.cardGenerator.cardHolder);

            myHandParams.cardGenerator = this.cardGenerator;
            opponentHandParams.cardGenerator = this.cardGenerator;
            pyramidParams.cardGenerator = this.cardGenerator;
            opponentPyramidParams.cardGenerator = this.cardGenerator;
            stackParams.cardGenerator = this.cardGenerator;
            pileParams.cardGenerator = this.cardGenerator;
            discardedParams.cardGenerator = this.cardGenerator;
            this.myHand = new Hand(myHandParams);
            this.opponentHand = new Hand(opponentHandParams);
            this.myPyramid = new Pyramid(pyramidParams);
            this.opponentPyramid = new Pyramid(opponentPyramidParams);
            this.stack = new Stack(stackParams);
            this.pile = new Stack(pileParams);
            this.discarded = new Stack(discardedParams);
            console.log(this.opponentHand);

            this.canvas.addEventListener('resize', (e) => {
                console.log('resize fired', e);
                this.canvas.width = window.innerWidth - 300;
                this.canvas.height = window.innerHeight;
            });

            this.canvas.addEventListener('mousemove', (e) => {
                var position = this.getCursorLocation(e);
                this.myHand.markAnyCardHover(position);
                this.stack.markTopCardHover(position);
                this.pile.markTopCardHover(position);

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.myHand.draw();
                this.opponentHand.draw();
                this.myPyramid.draw();
                this.opponentPyramid.draw();
                this.stack.draw();
                this.pile.draw();
                this.discarded.draw();
            });
            this.canvas.addEventListener('click', (e) => {
                var pilePosition = this.pile.newCardPosition();
                if(this.myHand.moveHoveredOnto(this.pile, (card) => {
                    console.log('pileposition', pilePosition);
                        card.setMove({ steps: 50, rotations: 3, toPosition: pilePosition })
                })) {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.myHand.draw();
                    this.opponentHand.draw();
                    this.myPyramid.draw();
                    this.opponentPyramid.draw();
                    this.stack.draw();
                    this.pile.draw();
                    this.discarded.draw();

                    if(this.pile.cards.map((card) => {
                        card.hasMove()
                    }).length) {
                        requestAnimationFrame(() => this.aCardIsMoving());
                    }
                }
            })


            this.animateACard();
            this.start();
        });
    }
    aCardIsMoving() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.myHand.draw();
        this.opponentHand.draw();
        this.myPyramid.draw();
        this.opponentPyramid.draw();
        this.stack.draw();
        this.pile.draw();
        this.discarded.draw();
        if(this.pile.cards.map((card) => {
            card.hasMove()
        }).length) {
            requestAnimationFrame(() => this.aCardIsMoving());
        }
    }
    animateACard() {
        var card = new Card({
            suit: 'clubs',
            value: 'queen',
            image: this.cardGenerator.card('clubs', 'queen'),
            scene: this.scene,
        });
        this.myHand.ensureCard('clubs', 'queen');
        this.myHand.ensureCard('spades', 'king');
        this.myHand.ensureCard('diamonds', 'queen');
        this.myHand.ensureCard('spades', 'king');
        this.myHand.ensureCard('diamonds', '4');
        this.myHand.ensureCard('hearts', 'jack');

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

        this.opponentHand.addCard('back', 'red');
        this.opponentHand.addCard('back', 'red');
        this.opponentHand.addCard('back', 'red');

        for (var i = 0; i < 25; i++) {
            this.stack.addCard('back', 'red');
        }
        for (var i = 0; i < 25; i++) {
            this.discarded.addCard('back', 'red');
        }
        this.pile.ensureCard('clubs', 'queen');
        this.pile.ensureCard('spades', 'king');
        this.pile.ensureCard('diamonds', 'queen');
        this.pile.ensureCard('spades', 'king');
        this.pile.ensureCard('diamonds', '4');
        this.pile.ensureCard('hearts', 'jack');
        this.pile.ensureCard('diamonds', '8');

        this.myPyramid.addCard(1, 'back', 'red');
        this.myPyramid.addCard(1, 'back', 'red');
        this.myPyramid.addCard(1, 'back', 'red');
        this.myPyramid.addCard(1, 'back', 'red');
        this.myPyramid.addCard(1, 'back', 'red');
        this.myPyramid.addCard(2, 'diamonds', 'queen');
        this.myPyramid.addCard(2, 'spades', 'king');
        this.myPyramid.addCard(2, 'diamonds', '4');
        this.myPyramid.addCard(2, 'hearts', 'jack');
        this.myPyramid.addCard(3, 'back', 'red');
        this.myPyramid.addCard(3, 'back', 'red');
        this.myPyramid.addCard(3, 'back', 'red');
        this.myPyramid.addCard(4, 'clubs', 'queen');
        this.myPyramid.addCard(4, 'hearts', 'ace');
        this.myPyramid.addCard(5, 'back', 'red');

        this.opponentPyramid.addCard(1, 'back', 'red');
        this.opponentPyramid.addCard(1, 'back', 'red');
        this.opponentPyramid.addCard(1, 'back', 'red');
        this.opponentPyramid.addCard(1, 'back', 'red');
        this.opponentPyramid.addCard(1, 'back', 'red');
        this.opponentPyramid.addCard(2, 'diamonds', 'queen');
        this.opponentPyramid.addCard(2, 'spades', 'king');
        this.opponentPyramid.addCard(2, 'diamonds', '4');
        this.opponentPyramid.addCard(2, 'hearts', 'jack');
        this.opponentPyramid.addCard(3, 'back', 'red');
        this.opponentPyramid.addCard(3, 'back', 'red');
        this.opponentPyramid.addCard(3, 'back', 'red');
        this.opponentPyramid.addCard(4, 'clubs', 'queen');
        this.opponentPyramid.addCard(4, 'hearts', 'ace');
        this.opponentPyramid.addCard(5, 'back', 'red');

        card.draw({ x: 300, y: 500, resizer: 0.6 });
        return this.startAnimating(card, 300);
    }
    startAnimating(card, x) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.myHand.draw();
        this.opponentHand.draw();
        this.myPyramid.draw();
        this.opponentPyramid.draw();
        this.stack.draw();
        this.pile.draw();
        this.discarded.draw();
   //     card.draw({ x: x, y: 500, resizer: 0.6, rotationFuzzyness: 0 });
        if(x > 650) {
            return;
        }
        return requestAnimationFrame(() => this.startAnimating(card, x + 5));
    }
    start() {

        //this.myHand.addCard('clubs', 'queen');
        //this.myHand.addCard('spades', 'king');
        //this.myHand.addCard('diamonds', 'queen');
        //this.myHand.addCard('spades', 'king');
        //this.myHand.addCard('diamonds', '4');
        //this.myHand.addCard('hearts', 'jack');
        //this.myHand.addCard('clubs', 'queen');
        //this.myHand.addCard('spades', 'king');
        //this.myHand.addCard('diamonds', 'queen');
        //this.myHand.addCard('spades', 'king');
        //this.myHand.addCard('diamonds', '4');
        //this.myHand.addCard('hearts', 'jack');

        this.myHand.draw();
        this.myHand.sortBy('suit');
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
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Finne, template: templateMarkup };
