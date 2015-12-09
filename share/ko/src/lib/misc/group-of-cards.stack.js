import { GroupOfCards } from './group-of-cards';

export class Stack extends GroupOfCards {
    constructor(params = { groupArea: {}, drawParams: {} }) {
    	super(params);
    }
    recalculateCardResizer() {
        var defaultCardHeight = this.cardGenerator.cardHeight();
        var defaultCardWidth = this.cardGenerator.cardWidth();

        var resizeToFitHeight = this.groupArea.maxHeight / defaultCardHeight;
        var resizeToFitWidth = this.groupArea.maxWidth /  defaultCardWidth;

        this.cardResizer = resizeToFitWidth < resizeToFitHeight ? resizeToFitWidth : resizeToFitHeight;
    }
    draw() {
     //   this.scene.ctx.strokeRect(this.groupArea.leftX, this.groupArea.centerY - this.cardGenerator.cardHeight() * this.cardResizer / 2, this.groupArea.maxWidth, this.groupArea.maxHeight);

        for (var i = 0; i <= this.maxCardIndex(); i++) {
            var card = this.cards[i];
            card.setLocation({
                x: this.groupArea.leftX + this.cardGenerator.cardWidth() * this.cardResizer / 2,
                y: this.groupArea.centerY,
            });
            card.draw({ resizer: this.cardResizer });
        }
    }
    newCardPosition() {
        return {
            x: this.groupArea.leftX + this.cardResizer * this.cardGenerator.cardWidth() / 2,
            y: this.groupArea.centerY,
        };
    }
}
