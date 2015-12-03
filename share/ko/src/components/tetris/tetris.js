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

        var horizontalBlocks = 10;
        var verticalBlocks = 20;
        this.unitSize = Math.round(this.canvasHeight * 0.7 / verticalBlocks);


        var width = this.unitSize * horizontalBlocks;
        var height = this.unitSize * verticalBlocks;
        var left = Math.floor(this.canvasWidth / 2 - width / 2);
        var top = Math.floor(this.canvasHeight / 2 - height / 2);
        $('#title').css({ top: top / 4, fontSize: top / 2 });
        $('#scorer').css({ left: left + width + this.unitSize });
        $('#scorer').css({ top: top });
        $('#scorer h2').css({ fontSize: this.unitSize * 1.2 });
        $('#scorer p').css({ fontSize: this.unitSize * 2.4, marginTop: - this.unitSize });

        $('.splash').css({ top: top + this.unitSize * 2, width: this.unitSize * 24, marginLeft: -this.unitSize * 12 - 10 });
        $('.splash h2').css({ fontSize: this.unitSize * 1.5 });
        $('.splash ul, .splash p').css({ fontSize: this.unitSize * 0.7 });

        this.area = {
            left: left,
            top: top,
            width: width,
            height: height,
            right: left + width,
            bottom: top + height,
            horizontalBlocks: horizontalBlocks,
            verticalBlocks: verticalBlocks,
        };
        var nextBlockAreaLeft = left - this.unitSize * 7;
        this.nextBlockArea = {
            left: nextBlockAreaLeft,
            top: top,
            width: this.unitSize * 6,
            height: this.unitSize * 6,
            right: nextBlockAreaLeft +  this.unitSize * 6,
            bottom: top +  this.unitSize * 6,
            horizontalBlocks: 6,
            verticalBlocks: 6,
        }
        this.level = ko.observable(1);
        this.completedRows = ko.observable(0);
        this.score = ko.observable(0);
        this.paused = ko.observable(false);
        this.gameIsOver = ko.observable(false);
        this.gameIsCompleted = ko.observable(false);
        this.anyKeyToStart = ko.observable(true);
        this.resetGame();

        $(document).keydown((e) => {
              if(this.gameIsRunning()) {
                if(e.which === 38)      { this.activeBlock().rotate(this.allOccupiedSquares())        }
                else if(e.which === 37) { this.activeBlock().move('left', this.allOccupiedSquares())  }
                else if(e.which === 39) { this.activeBlock().move('right', this.allOccupiedSquares()) }
                else if(e.which === 40) { this.activeBlockMoveDown()                                  }
                else if(e.which === 32) { this.activeBlockDrop()                                      }
            }
            if(e.which === 80) { this.paused(!this.paused()) }
            if(this.anyKeyToStart()) { this.anyKeyToStart(false) }
            if((this.gameIsOver() || this.gameIsCompleted()) && (e.which === 13)) {
                this.resetGame();
            }
        });
        this.run();

    }

    resetGame() {
        this.heapBlocks = [];
        this.blocks = this.getBagOfBlocks();
        this.level(1);
        this.loopsPerStep = this.loopsPerStepForLevel(1);
        this.loopsSinceStep = 0;
        this.hadCompletedRowsOnLastUpdate = false;
        this.completedRows(0);
        this.score(0);
        this.gameIsOver(false);
        this.gameIsCompleted(false);
    }

    gameIsRunning() {
        return !(this.paused() || this.anyKeyToStart() || this.gameIsOver() || this.gameIsCompleted());
    }

    drawArea() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#777';
        // game area
        this.ctx.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);

        // next blocks area
        this.ctx.fillRect(this.nextBlockArea.left, this.nextBlockArea.top, this.nextBlockArea.width, this.nextBlockArea.height);

        // grid
        var c = this.ctx;
        c.lineWidth = 1;
        this.ctx.lineCap = 'butt';
        for (var x = 1; x < this.area.horizontalBlocks; x++) {
            this.drawLine(
                1,
                '#888',
                x * this.unitSize + this.area.left,
                this.area.top,
                0,
                this.area.height
            );

        }

    }

    run() {
        if(this.anyKeyToStart()) {
            this.drawArea();
        }
        else if(this.gameIsRunning()) {
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
             :              99999 // magic
             ;
    }
    activeBlock() {
        return this.blocks[0];
    }

    maybeIncreaseLevel() {
        if(this.completedRows() >= this.level() * 10) {
            this.level(this.level() + 1);
            if(this.loopsPerStepForLevel(this.level()) >= 99999) {
                this.gameIsCompleted(true);
                return;
            }
            this.loopsPerStep = this.loopsPerStepForLevel(this.level());
        }
    }
    increaseScoreWith(scoreIncrease) {
        this.score(this.score() + scoreIncrease);
    }
    doneWithBlock(dropDistance = 0) {
        if(this.activeBlock().originSquare.y < 1) {
            this.gameIsOver(true);
            return;
        }
        this.heapBlocks.push(this.blocks.shift());
        if(dropDistance > 0) {
            this.increaseScoreWith(3 * this.level() + dropDistance + 3);
        }
        if(this.blocks.length < 4) {
            this.blocks = this.blocks.concat(this.getBagOfBlocks());
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
        this.doneWithBlock( this.activeBlock().drop(this.allOccupiedSquares()) );
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

        var nextBlock = this.blocks[1];
        console.log(nextBlock);

        var displayedNextBlock = new TetrisBlock({
            type: nextBlock.type,
            rotation: nextBlock.rotation,
            unitSize: this.unitSize,
            originSquare: { x: 2, y: 2 },
            ctx: this.ctx,
            area: this.nextBlockArea,
        });
        console.log(displayedNextBlock);
        displayedNextBlock.draw();
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
                originSquare: { x: Math.floor(this.area.horizontalBlocks / 2) - 1, y: -2 },
                ctx: this.ctx,
                area: this.area,
            }));
        }
        return blocks;
    }
    copyArray(array) {
        return JSON.parse(JSON.stringify(array));
    }
    drawLine(lineWidth, color, fromX, fromY, lengthX, lengthY) {
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(fromX + lengthX, fromY + lengthY);
        this.ctx.stroke();
    }

    dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
    }
}

export default { viewModel: Tetris, template: templateMarkup };
