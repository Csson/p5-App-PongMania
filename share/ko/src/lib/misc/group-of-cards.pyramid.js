import { Card } from './card';
import { Stack } from './group-of-cards.stack';
import { GroupOfCards } from './group-of-cards';

export class Pyramid extends GroupOfCards {
    constructor(params = { groupArea: {}, drawParams: {} }) {
    	super(params);
        this.cards = [];
        this.groupArea.direction = params.groupArea.direction; // normal / inverted
        this.setupCardStacks();
        console.log(this);
    }
    setupCardStacks() {
        var actualCardWidth = this.cardGenerator.cardWidth() * this.cardResizer;
        var actualCardHeight = this.cardGenerator.cardHeight() * this.cardResizer;

        var y = this.groupArea.baseRowCenterY; //this.groupArea.centerY + actualCardHeight;
        var yDelta = this.groupArea.direction === 'normal' ? -actualCardHeight / 3 : actualCardHeight / 3;
        var baseX = this.groupArea.centerX - 2 * actualCardWidth;

        for (var rowIndex = 0; rowIndex <= 4; rowIndex++) {
            this.cards[rowIndex] = [];

            CARD:
            for (var cardIndex = 0; cardIndex < (5 - rowIndex); cardIndex++) {
                var x = (baseX + actualCardWidth * 0.6 + actualCardWidth * 0.5 * rowIndex) + actualCardWidth * 1.05 * cardIndex;
                this.cards[rowIndex][cardIndex] = new Stack({
                    scene: this.scene,
                    cardGenerator: this.cardGenerator,
                    groupArea: {
                        centerX: x,
                        centerY: y,
                        maxWidth: 200,
                        maxHeight: actualCardHeight,
                    },
                    drawParams: {
                        width: 350,
                        baseRotation: 0,
                        rotationFuzzyness: 3,
                        centerFuzzyness: 0.03,
                    },
                });
            }
            y = y + yDelta;
        }
    }



    recalculateCardResizer() {
        var defaultCardHeight = this.cardGenerator.cardHeight();
        var defaultCardWidth = this.cardGenerator.cardWidth();

        var resizeToFitHeight = this.groupArea.maxHeight / defaultCardHeight / 2.2;
        var resizeToFitWidth = this.groupArea.maxWidth / (this.numberOfCards() + 1) / defaultCardWidth * 2; // 2, because the cards overlap

        this.cardResizer = resizeToFitWidth < resizeToFitHeight ? resizeToFitWidth : resizeToFitHeight;
    }
    // row 1 has five cards, row 5 has one.
    addCard(row, place, suit, value) {
        if(suit !== undefined) {
            this.cards[row][place].addCard(suit, value);
            //this.cards[row][place].push(new Card({
            //    suit: suit,
            //    value: value,
            //    image: this.cardGenerator.card(suit, value),
            //    drawParams: this.drawParams,
            //    scene: this.scene,
            //}));
        }
        this.recalculateCardResizer();
    }
    draw() {
        for (var i = 0; i < this.cards.length; i += 1) {
            var row = this.cards[i];

            for (var j = 0; j < row.length; j += 1) {
                var cardStack = row[j];
                cardStack.draw();
            }
        }
        /*var actualCardWidth = this.cardGenerator.cardWidth() * this.cardResizer;
        var actualCardHeight = this.cardGenerator.cardHeight() * this.cardResizer;

        var y = this.groupArea.baseRowCenterY; //this.groupArea.centerY + actualCardHeight;
        var yDelta = this.groupArea.direction === 'normal' ? -actualCardHeight / 3 : actualCardHeight / 3;
        var baseX = this.groupArea.centerX - 2 * actualCardWidth;

        for (var rowIndex = 0; rowIndex < this.cards.length; rowIndex++) {
            var cardsOnRow = this.cards[rowIndex];


            CARD:
            for (var cardIndex = 0; cardIndex < cardsOnRow.length; cardIndex++) {
                var card = cardsOnRow[cardIndex];
                // card already played
                if(card === null) {
                    continue CARD;
                }
                var x = (baseX + actualCardWidth * 0.6 + actualCardWidth * 0.5 * rowIndex) + actualCardWidth * 1.05 * cardIndex;
                card.setLocation({ x: x, y: y });
                card.draw({ resizer: this.cardResizer });

            }
            y = y + yDelta;
        }*/
    }
    markHoverable(position) {
        this.cards.map((row) => { row.map((card) => { card.wasHovering = false }) } );
        var hoverableCards = [];

        HOVERABLES:
        for (var rowIndex = 0; rowIndex < this.cards.length; rowIndex += 1) {
            var nextRowIndex = rowIndex === this.cards.length - 1 ? null : rowIndex + 1;
            var cardsOnThisRow = this.cards[rowIndex];
           // if(nextRowIndex === null) {
           //     hoverableCards = hoverableCards.concat(cardsOnThisRow);
           //     break HOVERABLES;
           // }
            var cardsOnNextRow = this.cards[nextRowIndex];

            for (var cardIndex = 0; cardIndex < cardsOnThisRow.length; cardIndex += 1) {
                var cardStack = cardsOnThisRow[cardIndex];

                var hoveredCard;
                try {
                    console.log('in pyramid markHoverable', 'nri:', nextRowIndex, 'ri:', rowIndex, 'ci:', cardIndex, cardsOnNextRow[cardIndex - 1], cardsOnNextRow.length - 1, cardsOnNextRow[cardIndex]);
                } catch (e) {}
                if(nextRowIndex === null || (cardIndex > 0 && !cardsOnNextRow[cardIndex - 1].cards.length) || (cardIndex <= cardsOnNextRow.length - 1 && !cardsOnNextRow[cardIndex].cards.length)) {
                    console.log(' -> passed first test', rowIndex, cardIndex, cardsOnThisRow, this.cards);
                    //if(hoveredCard = cardStack.markHoverable(position)) {
                    if(hoveredCard = this.cards[rowIndex][cardIndex].markHoverable(position)) {
                        console.log(' --> passed second test');
                        hoveredCard.pyramidLocation = { rowIndex: rowIndex, cardIndex: cardIndex };
                        return hoveredCard;
                    }
                }
                
              //  if(cardIndex > 0 && cardsOnNextRow[cardIndex - 1] === null) {
              //      hoverableCards.push(card);
              //  }
              //  if(cardIndex < cardsOnNextRow.length - 1 && cardsOnNextRow[cardIndex + 1] === null) {
              //      hoverableCards.push(card);
              //  }
            }
        }
        return;
//        var hoveredCard;
//        console.log('pyramid all hoverables', hoverableCards);
//        for (var i = hoverableCards.length - 1; i >= 0; i -= 1) {
//            var cardStack = hoverableCards[i];
//            console.log('Pyramid hover', cardStack);
//            if(cardStack.markHoverable(position)) {
//                console.log('sure is hovered!!!!!!!!!!!!!!!!!!!>>>>>>>>>>>>>>>>>>>>>>>>>');
//            }
//            //if(card.isHover(position)) {
//            //    card.wasHovering = true;
//            //    return card;
//            //}
//        }
    }
}
