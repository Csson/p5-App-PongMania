import copyArray from './utilities';
import { Card } from './card';

export class GroupOfCards {
    constructor(params = { groupArea: {}, drawParams: {} }) {
        this.cardGenerator = params.cardGenerator;
        this.scene = params.scene;
        this.cards = [];
        this.groupArea = {
            leftX:     params.groupArea.leftX,
            centerY:   params.groupArea.centerY,
            baseRowCenterY:  params.groupArea.baseRowCenterY,
            centerX:   params.groupArea.centerX,
            maxWidth:  params.groupArea.maxWidth,
            maxHeight: params.groupArea.maxHeight,
        };
        this.drawParams = {
            baseRotation: params.drawParams.baseRotation || 0,
            rotationFuzzyness: params.drawParams.rotationFuzzyness || 0,
            centerFuzzyness: params.drawParams.centerFuzzyness || 0,
        },

        this.recalculateCardResizer();
    }
    hasCard(suit, value) {
        var hasIt = false;
        this.cards.map((card) => { if(card.suit === suit && card.value === value) { hasIt = true; } });
        return hasIt;
    }
    ensureCard(suit, value) {
        if(!this.hasCard(suit, value)) {
            this.addCard(suit, value);
        }
    }
    addCard(suit, value) {
        var addedCard = new Card({
            suit: suit,
            value: value,
            image: this.cardGenerator.card(suit, value),
            drawParams: this.drawParams,
            scene: this.scene,
        });
        this.cards.push(addedCard);
        this.recalculateCardResizer();
        return addedCard;
    }
    numberOfCards() {
        return this.cards.length;
    }
    maxCardIndex() {
        return this.cards.length - 1;
    }
    newCardPosition() { console.log('group-of-cards/newCardPosition: Implement in subclass'); }
    sortBy(sortBy) {
        if(sortBy === 'suit') {
            this.cards.sort((a, b) => a.suitSortable.localeCompare(b.suitSortable));
        }
        else if(sortBy === 'value') {
            this.cards.sort((a, b) => a.valueSortable.localeCompare(b.valueSortable));
        }
    }
    markHoverable(position) { console.log('group-of-cards/markHoverable', 'Implement in sub class.') }

    moveHoveredOnto(anotherGroupOfCards, doWithCard) {
        var hoveredIndex;
        for (var i = 0; i < this.cards.length; i += 1) {
            if(this.cards[i].wasHovering) {
                hoveredIndex = i;
            }
        }
        if(hoveredIndex !== undefined) {
            var movedCard = (this.cards.splice(hoveredIndex, 1))[0];
            var newCard = anotherGroupOfCards.addCard(movedCard.suit, movedCard.value);
          //  newCard.move = copyArray(movedCard.move);
            this.recalculateCardResizer();
            this.rerandomizeAllCards();
        console.log(typeof doWithCard);
            if(typeof doWithCard === 'function') {
                console.log('running dowith');
                newCard.location = copyArray(movedCard.location);
                doWithCard(newCard);
            }
            console.log('new card', newCard, '|',  movedCard);
            return true;
        }
        return false;
    }
    moveCardOnto(suit, value, anotherGroupOfCards, doWithCard) {
        var wantedIndex;
        for (var i = 0; i < this.cards.length; i += 1) {
            if(this.cards[i].suit === suit && this.cards[i].value === value) {
                wantedIndex = i;
                break;
            }
        }
        if(wantedIndex !== undefined) {
            var movedCard = (this.cards.splice(wantedIndex, 1))[0];
            var newCard = anotherGroupOfCards.addCard(movedCard.suit, movedCard.value);
          //  newCard.move = copyArray(movedCard.move);
            this.recalculateCardResizer();
            this.rerandomizeAllCards();
        console.log(typeof doWithCard);
            if(typeof doWithCard === 'function') {
                console.log('running dowith');
                newCard.location = copyArray(movedCard.location);
                doWithCard(newCard);
            }
            console.log('new card', newCard, '|',  movedCard);
            return true;
        }
        return false;
    }
    dealTopCardOnto(anotherGroupOfCards, doWithCard, suit, value) {
        var dealtCard = this.cards.pop();
        var newCard = anotherGroupOfCards.addCard
    }
    rerandomizeAllCards() {
        this.cards. map((card) => card.rerandomize());
    }
    replacePrivateCard(newCards = []) {
        for (var i = 0; i < newCards.length; i += 1) {
            var oldCard = this.cards.pop();
            var newCard = this.addCard(newCards[i].suit, newCards[i].value);
            newCard.location = copyArray(oldCard.location);
        }
    }
    replaceAllPublicCards(backColor) {
        var howMany = this.cards.length - 1;
        for (var i = 0; i <= howMany; i += 1) {
            var oldCard = this.cards.shift();
            var newCard = this.addCard('back', backColor);
            newCard.location = copyArray(oldCard.location);
        }
    }
}
