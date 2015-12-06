//import { Transform } from './transform';
import { Card } from './card';

export class CardManager {
    constructor(params) {
        this.numberOfLoadedCards = 0;
        this.scene = params.scene;
        this.cardHolder = {};
    }
    loadCards(callback) {
        this.onAllCardsLoaded = callback;
        this.loadSuits(['clubs', 'diamonds', 'hearts', 'spades'], ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king']);
        this.loadSuits(['back'], ['red', 'blue']);
        this.loadSuits(['joker'], ['black', 'red']);
        return this;
    }
    loadSuits(suits, values) {
        for (var i = 0; i < suits.length; i++) {
            for (var j = 0; j < values.length; j++) {
                var suit = suits[i];
                var value = values[j];
                if(this.cardHolder[suit] === undefined) {
                    this.cardHolder[suit] = {};
                }
                this.cardHolder[suit][value] = new Card({
                    scene: this.scene,
                    suit: suit,
                    value: value,
                    onLoad: () => {
                        this.numberOfLoadedCards++;
                        if(this.numberOfLoadedCards == 56) {
                            this.onAllCardsLoaded();
                        }
                    },
                });
            }
        }
    }
    card(suit, value) {
        if(undefined === this.cardHolder[suit] || undefined === this.cardHolder[suit][value]) {
            console.log('WARNING: undefined card', suit, value);
            return;
        }
        return this.cardHolder[suit][value];
    }
}
