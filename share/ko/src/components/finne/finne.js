import ko from 'knockout';
import templateMarkup from 'text!./finne.html';
import { Communicator } from './communicator';
import { Chat } from '../../lib/misc/chat';
import { Transform } from '../../lib/misc/transform';
import { Scene } from '../../lib/misc/scene';
import { Card } from '../../lib/misc/card';
import { CardManager } from '../../lib/misc/card-manager';

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
        this.canvas.width = window.innerWidth - 300;
        this.canvas.height = window.innerHeight;

        this.ctx = this.canvas.getContext('2d');

        this.scene = new Scene({ ctx: this.ctx });

        this.chat = new Chat({ scrollFollow: '#chat-log' });
        this.chatMessage = ko.observable();

        this.cards = new CardManager({ scene: this.scene });
        this.cards.loadCards(() => this.start());

        this.gameCode = ko.observable();
        this.gameIsInProgress = ko.observable(false);
        this.server = new Communicator({
            chat: this.chat,
            handleIncoming: (message) => this.incoming(message),
        });
        this.areas = [];
    }
    start() {
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
    draw(hoveredIndex = -1, callback = () => {}) {
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
    copyArray(array) {
        return JSON.parse(JSON.stringify(array));
    }
    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Finne, template: templateMarkup };
