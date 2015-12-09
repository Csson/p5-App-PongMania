import { Card } from './card';
import { GroupOfCards } from './group-of-cards';

export class Pyramid extends GroupOfCards {
    constructor(params = { groupArea: {}, drawParams: {} }) {
    	super(params);
        this.groupArea.direction = params.groupArea.direction; // normal / inverted
        console.log(this);
    }
    recalculateCardResizer() {
        var defaultCardHeight = this.cardGenerator.cardHeight();
        var defaultCardWidth = this.cardGenerator.cardWidth();

        var resizeToFitHeight = this.groupArea.maxHeight / defaultCardHeight / 2.2;
        var resizeToFitWidth = this.groupArea.maxWidth / (this.numberOfCards() + 1) / defaultCardWidth * 2; // 2, because the cards overlap

        this.cardResizer = resizeToFitWidth < resizeToFitHeight ? resizeToFitWidth : resizeToFitHeight;
    }
    // row 1 has five cards, row 5 has one.
    addCard(row, suit, value) {
        var actualRow = row - 1;
        if(undefined === this.cards[actualRow]) {
            this.cards[actualRow] = [];
        }

        if(suit === undefined) {
            this.cards[actualRow].push(null);
        }
        else  {
            this.cards[actualRow].push(new Card({
                suit: suit,
                value: value,
                image: this.cardGenerator.card(suit, value),
                drawParams: this.drawParams,
                scene: this.scene,
            }));
        }
        this.recalculateCardResizer();
    }
    draw() {
        var actualCardWidth = this.cardGenerator.cardWidth() * this.cardResizer;
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
                    console.log('wah');
                    continue CARD;
                }
                var x = (baseX + actualCardWidth * 0.6 + actualCardWidth * 0.5 * rowIndex) + actualCardWidth * 1.05 * cardIndex;
                card.setLocation({ x: x, y: y });
                card.draw({ resizer: this.cardResizer });

            }
            y = y + yDelta;
        }
    }
}
