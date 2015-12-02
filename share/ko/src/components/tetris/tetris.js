import ko from 'knockout';
import templateMarkup from 'text!./tetris.html';
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

        this.level = ko.observable(1);
        this.heapBlocks = [];
        this.blocks = this.getBagOfBlocks();
        this.loopsPerStep = this.loopsPerStepForLevel(this.level());
        this.loopsSinceStep = 0;
        this.hadCompletedRowsOnLastUpdate = false;
        this.completedRows = ko.observable(0);

        this.score = ko.observable(0);

        $(document).keydown((e) => {
            if(!this.paused()) {
                if(e.which === 38)      { this.activeBlock().rotate(this.allOccupiedSquares())        }
                else if(e.which === 37) { this.activeBlock().move('left', this.allOccupiedSquares())  }
                else if(e.which === 39) { this.activeBlock().move('right', this.allOccupiedSquares()) }
                else if(e.which === 40) { this.activeBlockMoveDown()                                  }
                else if(e.which === 32) { this.activeBlockDrop()                                      }
            }
            if(e.which === 80) { this.paused(!this.paused()) }
        });
        this.run();

    }

    drawArea() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#777';
        // game area
        this.ctx.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);

        // grid
        var c = this.ctx;
        c.lineWidth = 1;
        this.ctx.lineCap = 'butt';
        for (var x = 1; x < this.area.horizontalBlocks; x++) {
            c.beginPath();
            c.moveTo(x * this.unitSize + this.area.left, this.area.top);
            c.lineTo(x * this.unitSize + this.area.left, this.area.top  + this.area.height);
            c.strokeStyle = '#888';
            c.stroke();
        }

    }

    run() {
        if(!this.paused()) {
            this.drawArea();
            this.update();

        }
        var self = this;
        setTimeout(function() { self.run() }, 10);
    }

    loopsPerStepForLevel(level) {
        return level == 1 ? 20
             : level == 2 ? 18
             : level == 3 ? 16
             : level == 4 ? 14
             : level == 5 ? 12
             : level == 6 ? 10
             : level == 7 ? 9
             : level == 8 ? 8
             : level == 9 ? 7
             : level == 10 ? 5
             :              1000
             ;
    }
    activeBlock() {
        return this.blocks[0];
    }

    maybeIncreaseLevel() {
        if(this.completedRows() >= this.level() * 10) {
            this.level(this.level() + 1);
            this.loopsPerStep = this.loopsPerStepForLevel(this.level());
        }
    }
    increaseScoreWith(scoreIncrease) {
        this.score(this.score() + scoreIncrease);
    }
    doneWithBlock(wasDropped) {
        this.heapBlocks.push(this.blocks.shift());
        this.increaseScoreWith(3 * this.level() + (wasDropped ? 21 : 3));

        if(!this.blocks.length) {
            this.blocks = this.getBagOfBlocks();
        }
    }
    giveScoreForSoftDrop() {
        this.increaseScoreWith(this.level());
    }
    giveScoreForClearedRows(numberOfRows) {
        var groundScoreForNumberOfRows = {
            0:    0,
            1:   40,
            2:  100,
            3:  300,
            4: 1200,
        };
        this.score(this.score() + groundScoreForNumberOfRows[numberOfRows] * this.level());
        this.completedRows(this.completedRows() + numberOfRows);
        this.maybeIncreaseLevel();

    }

    activeBlockMoveDown() {
        if(this.activeBlock().move('down', this.allOccupiedSquares())) {
            this.giveScoreForSoftDrop();
        }
    }
    activeBlockDrop() {
        this.activeBlock().drop(this.allOccupiedSquares());
        this.doneWithBlock(1);
    }

    maybeTakeStep() {
        ++this.loopsSinceStep;
        if(this.loopsSinceStep > this.loopsPerStep) {
            this.loopsSinceStep = 0;
            var ableToMove = this.activeBlock().move('down', this.allOccupiedSquares());
            if(!ableToMove) {
                this.doneWithBlock();
            }
        }
    }
    checkForCompletedRows() {
        var completedRows = [];
        var allOccupiedSquares = this.allOccupiedSquares();

        var occupiedPerRow = [];
        for (var i = 0; i <= this.area.verticalBlocks; i++) {
            occupiedPerRow[i] = 0;
        }

        allOccupiedSquares.map((block) => {
            block.map( (square) => {
                ++occupiedPerRow[square.y];
            });
        });

        CHECKCOMPLETED:
        for (var rowIndex = 0; rowIndex <= this.area.verticalBlocks; rowIndex++) {
            var occupiedSquaresOnRow = occupiedPerRow[rowIndex];
            if(occupiedSquaresOnRow === this.area.horizontalBlocks) {
                this.hadCompletedRowsOnLastUpdate = true;
                completedRows.push(rowIndex);

                for (var cellIndex = 1; cellIndex <= this.area.horizontalBlocks; cellIndex++) {
                    this.ctx.fillStyle = '#fff';

                     this.ctx.fillRect(
                        5 + this.area.left + (cellIndex - 1) * this.unitSize,
                        5 + this.area.top + (rowIndex - 1) * this.unitSize,
                        this.unitSize - 10,
                        this.unitSize - 10
                    );

                    //this.ctx.fillRect(
                    //    0.5 + this.area.left + (cellIndex - 1) * this.unitSize,
                    //    0.5 + this.area.top + (rowIndex - 1) * this.unitSize,
                    //    this.unitSize - 1,
                    //    this.unitSize - 1
                    //);
                }
            }
        }

        if(completedRows.length) {
            var newHeapBlocks = [];
            console.log('completed: ', completedRows);
            //this.game.paused(true);

            for (var i = 0; i < this.heapBlocks.length; i++) {
                var block = this.heapBlocks[i];

                var possibleNewBlock = block.removeFromRows(completedRows);
                if(possibleNewBlock !== null) {
                    newHeapBlocks.push(possibleNewBlock);
                }
                if(block.occupies.length) {
                    newHeapBlocks.push(block);
                }
            }

            this.heapBlocks = newHeapBlocks;
        }
        return completedRows.length;
    }

    update() {
        if(this.hadCompletedRowsOnLastUpdate) {
            this.dropAfterCompleted();
            this.hadCompletedRowsOnLastUpdate = false;
        }
        else {
            this.maybeTakeStep();
        }
        this.draw();

        HADCOMPLETED:
        while(1) {
            var completedRows = this.checkForCompletedRows();
            if(!completedRows) {
                break HADCOMPLETED;
            }
            this.giveScoreForClearedRows(completedRows);
        }

    }
    draw() {
        this.activeBlock().drawShadow(this.allOccupiedSquares());
        this.activeBlock().draw();
        for (var i = 0; i < this.heapBlocks.length; i++) {
            this.heapBlocks[i].draw();
        }
    }
    dropAfterCompleted() {
        var couldDropAnyBlock = true;

        while(couldDropAnyBlock) {
            couldDropAnyBlock = false;

            for (var i = 0; i < this.heapBlocks.length; i++) {
                var howFarDropped = this.heapBlocks[i].drop(this.allOccupiedSquaresExpectBlockIndex(i));
                if(howFarDropped > 0) {
                    couldDropAnyBlock = true;
                }
            }
        }
    }

    allOccupiedSquares() {
        var allOccupiedSquares = [];

        OCCUPIED:
        for (var i = 0; i < this.heapBlocks.length; i++) {
            var block = this.heapBlocks[i];

            if(block.occupies.length) {
                allOccupiedSquares.push(block.occupies);
            }
        }
        return allOccupiedSquares;
    }
    allOccupiedSquaresExpectBlockIndex(exceptBlockIndex) {
        var allOccupiedSquares = [];

        OCCUPIED:
        for (var i = 0; i < this.heapBlocks.length; i++) {
            if(i === exceptBlockIndex) {
                continue OCCUPIED;
            }
            allOccupiedSquares.push(this.heapBlocks[i].occupies);
        }
        return allOccupiedSquares;
    }

    getBagOfBlocks(amount) {
        var blocks = [];
        var blockTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        var rotation = [0, 1, 2, 3];

        while(blockTypes.length) {
            var randomBlockTypeIndex = Math.floor(Math.random() * blockTypes.length);
            var type = blockTypes.splice(randomBlockTypeIndex, 1).shift();
            blocks.push(new TetrisBlock({
                type: type,
                rotation: rotation[ Math.floor(Math.random() * rotation.length) ],
                unitSize: this.unitSize,
                originSquare: { x: Math.floor(this.area.horizontalBlocks / 2), y: -2 },
                ctx: this.ctx,
                area: this.area,
            }));
        }
        console.log(blocks);
        return blocks;
    }
    copyArray(array) {
        return JSON.parse(JSON.stringify(array));
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Tetris, template: templateMarkup };
