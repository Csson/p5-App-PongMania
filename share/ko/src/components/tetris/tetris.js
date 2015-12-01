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

        this.unitSize = 20;

        var horizontalBlocks = 10;
        var verticalBlocks = 20;
        this.area = {
            left: this.canvasWidth / 2 - this.unitSize * horizontalBlocks / 2,
            top: this.canvasHeight / 2 - this.unitSize * verticalBlocks / 2,
            right: this.canvasWidth / 2 + this.unitSize * horizontalBlocks,
            bottom: this.canvasHeight / 2 + this.unitSize * verticalBlocks,
            width: this.unitSize * horizontalBlocks,
            height: this.unitSize * verticalBlocks,
            horizontalBlocks: horizontalBlocks,
            verticalBlocks: verticalBlocks,
        };
        console.log(this);

        this.round = new TetrisRound({
            level: 1,
            unitSize: this.unitSize,
            ctx: this.ctx,
            area: this.area,
        });
        this.totalScore = ko.observable(0);
        this.currentRoundScore = ko.observable(this.round.roundScore);

        $(document).keydown((e) => {
            console.log('down key ' + e.which);
            if(e.which === 38) {
                this.round.activeBlockRotate();
            }
            else if(e.which === 37) {
                this.round.activeBlockMoveLeft();
            }
            else if(e.which === 39) {
                this.round.activeBlockMoveRight();
            }
            else if(e.which === 40) {
                this.round.activeBlockDrop();
            }
        });

        this.run();
        
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#777';
        // game area
        this.ctx.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);

        // grid
        var c = this.ctx;
        for (var x = 1; x < this.area.horizontalBlocks; x++) {
            c.beginPath();
            c.moveTo(x * this.unitSize + this.area.left, this.area.top);
            c.lineTo(x * this.unitSize + this.area.left, this.area.top  + this.area.height);
            c.strokeStyle = '#888';
            c.stroke();
            //for (var y = 0; y < this.area.verticalBlocks; y++) {
            //}
        }

    }

    run() {
        this.draw();
        this.round.update();

        if(this.round.isRoundCompleted()) {
            console.log('Done!');
        }
        var self = this;
        setTimeout(function() { self.run() }, 25);
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Tetris, template: templateMarkup };
