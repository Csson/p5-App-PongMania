import { Card } from './card';

export class CardGenerator {
    constructor(params) {
        this.cardHolder = {};
    }
    loadCards() {
        promises = [];
        promises = this.prepareLoadPromises(promises, 'normal', ['clubs', 'diamonds', 'hearts', 'spades'], ['ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king']);
        promises = this.prepareLoadPromises(promises, 'normal', ['back'], ['red', 'blue']);
        promises = this.prepareLoadPromises(promises, 'normal', ['joker'], ['black', 'red']);
        promises = this.prepareLoadPromises(promises, 'small', ['clubs'], ['queen']);

        var allImagesLoaded = Promise.all(promises);

        allImagesLoaded.then((result) => {

            for (var i = 0; i < result.length; i++) {
                var cardImage = result[i];
                var suit = cardImage.dataset.suit;
                var value = cardImage.dataset.value;
                var size = cardImage.dataset.size;
                if(this.cardHolder[suit] === undefined) {
                    this.cardHolder[suit] = {};
                }
                if(this.cardHolder[suit][value] === undefined) {
                    this.cardHolder[suit][value] = {};
                }
                this.cardHolder[suit][value][size] = cardImage;
            }
        });
        return allImagesLoaded;

    }
    prepareLoadPromises(promises, size, suits, values) {

        for (var i = 0; i < suits.length; i++) {
            for (var j = 0; j < values.length; j++) {

                var suit = suits[i];
                var value = values[j];

                var imageLoadPromise = new Promise((resolve, reject) => {
                    var image = new Image();
                    image.src = '/cards/' + suit + '_' + value + '_' + size + '.png';
                    image.dataset.suit = suit;
                    image.dataset.value = value;
                    image.dataset.size = size;

                    image.onload = () => {
                        resolve(image);
                    };
                });
                promises.push(imageLoadPromise);
            }
        }
        return promises;
    }
    cardHeight() {
        return this.card('diamonds', 2).normal.height;
    }
    cardWidth() {
        return this.card('diamonds', 2).normal.width;
    }
    card(suit, value) {
        if(undefined === this.cardHolder[suit] || undefined === this.cardHolder[suit][value]) {
            console.log('WARNING: undefined card', suit, value);
            return;
        }
        return this.cardHolder[suit][value];
    }
}
