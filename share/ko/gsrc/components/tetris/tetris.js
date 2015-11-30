import ko from 'knockout';
import templateMarkup from 'text!./tetris.html';
import { TetrisRound } from './round';
import { TetrisBlock } from './block';

class Tetris {
    constructor(params) {
        var $gameArea = $('#tetris-page canvas');
        $gameArea[0].width = window.innerWidth;
        $gameArea[0].height = window.innerHeight;

        this.canvasWidth = $gameArea.width();
        this.canvasHeight = $gameArea.height();
        this.ctx = $gameArea[0].getContext('2d');

        this.unitSize = 8;
        this.meta = {
            horizontalBlocks: 10,
            verticalBlocks: 20,
        };
        this.area = {
            left: this.canvasWidth / 2 - this.unitSize * this.meta.horizontalBlocks / 2,
            top: this.canvasHeight / 2 - this.unitSize * this.meta.verticalBlocks / 2,
            right: this.canvasWidth / 2 + this.unitSize * this.meta.horizontalBlocks,
            bottom: this.canvasHeight / 2 + this.unitSize * this.meta.verticalBlocks,
            width: this.unitSize * this.meta.horizontalBlocks,
            height: this.unitSize * this.meta.verticalBlocks,
        };
        console.log(this);

        this.round = new TetrisRound({
            level: 1,
            unitSize: this.unitSize,
            ctx: this.ctx,
            area: this.area,
        });
        this.run();
        
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#777';
        this.ctx.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);

    }

    run() {
        this.draw();
        this.round.draw();
        var self = this;
        setTimeout(function() { self.run() }, 25);
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Tetris, template: templateMarkup };
