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
            var x = this.groupArea.leftX !== undefined ? this.groupArea.leftX + this.cardGenerator.cardWidth() * this.cardResizer / 2
                  : this.groupArea.centerX !== undefined ? this.groupArea.centerX
                  :                                         0
                  ;
            card.setLocation({
                x: x,
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
    markHoverable(position) {
        if(!this.cards.length) {
            return;
        }
        var topCard = this.cards[this.cards.length - 1];

        if(topCard.isHover(position)) {
            topCard.wasHovering = true;
            return topCard;
        }
        else {
            topCard.wasHovering = false;
            return;
        }
        //topCard.wasHovering = topCard.wasHovering && !topCard.isHover(position) ? false
        //                    :  topCard.isHover(position)                        ? true
        //                    :                                                     false
        //                    ;

    }
}
