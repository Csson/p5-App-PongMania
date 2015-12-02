import ko from 'knockout';
import templateMarkup from 'text!./tetris.html';
import { TetrisRound } from './round';
import { TetrisBlock, TetrisBlock2 } from './block';

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

        var width = this.unitSize * horizontalBlocks;
        var height = this.unitSize * verticalBlocks;
        var left = Math.floor(this.canvasWidth / 2 - width / 2);
        var top = Math.floor(this.canvasHeight / 2 - height / 2);

        this.area = {
            left: left,
            top: top,
            width: width,
            height: height,
            right: this.left + width,
            bottom: this.top + height,
            horizontalBlocks: horizontalBlocks,
            verticalBlocks: verticalBlocks,
        };
        this.paused = ko.observable(false);
        console.log(this);

        this.round = new TetrisRound({
            level: 1,
            unitSize: this.unitSize,
            ctx: this.ctx,
            area: this.area,
            game: this,
        });
        this.totalScore = ko.observable(0);
        this.currentRoundScore = ko.observable(this.round.roundScore);

        $(document).keydown((e) => {
            if(e.which === 38) {
                this.round.activeBlockRotate();
                //this.block2.rotate();
            }
            else if(e.which === 37) {
                this.round.activeBlockMoveLeft();
                //this.block2.move('left');
            }
            else if(e.which === 39) {
                this.round.activeBlockMoveRight();
                //this.block2.move('right');
            }
            else if(e.which === 40) {
                this.round.activeBlockMoveDown();
                //this.block2.move('down');
            }
            else if(e.which === 32) {
                this.round.activeBlockDrop();
                //this.block2.drop();
            }
            else if(e.which === 80) {
                this.paused(!this.paused());
                console.log('Paused!');
            }
        });
//        this.block2 = new TetrisBlock({
//            type: 'J',
//            rotation: 0,
//            unitSize: this.unitSize,
//            originSquare: { x: 1, y: 1},
//            ctx: this.ctx,
//            area: this.area,
//        });
      //  this.block2moves = ['right', 'right', 'right', 'down', 'down', 'down', 'left', 'left', 'left', 'left', 'left', 'rotate', 'rotate', 'left', 'right', 'right', 'rotate', 'left', 'rotate', 'right', 'rotate', 'left', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down'];
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
        if(!this.paused()) {
            this.draw();
            this.round.update();
          //  var nextBlock2Move = this.block2moves.shift();
          //  console.log(nextBlock2Move);
          //  if(nextBlock2Move === 'rotate') {
          //      this.block2.rotate();
          //  }
          //  else {
          //      this.block2.move(nextBlock2Move);
          //  }
          //  this.block2.draw();

            if(this.round.isRoundCompleted()) {
                console.log('Done!');
            }
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
