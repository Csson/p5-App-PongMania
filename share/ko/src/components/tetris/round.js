import ko from 'knockout';
import { TetrisBlock } from './block';

export class TetrisRound {
    constructor(params) {
        this.ctx = params.ctx;
        this.unitSize = params.unitSize;
        this.area = params.area;
        this.level = ko.observable(params.level);
        this.blocksLeft = ko.observable(this.blockCountForLevel(this.level()));
        this.blocksDone = ko.observable(0);
        this.blocks = this.randomizeBlocks(this.blocksLeft());
  //      this.activeBlock().relativeTopY = 0;
        this.loopsPerStep = this.loopsPerStepForLevel(this.level());
        this.loopsSinceStep = 0;
        this.occupiedExceptActive = [];
        this.roundScore = ko.observable(0);
        this.hadCompletedRowsOnLastUpdate = 0;
        console.log(this);
    }
    blockCountForLevel(level) {
        return level == 1 ? 20
             : level == 2 ? 25
             : level == 3 ? 30
             :              1
             ;
    }
    loopsPerStepForLevel(level) {
        return level == 1 ? 10
             : level == 2 ? 8
             : level == 3 ? 6
             :              1000
             ;
    }
    activeBlock() {
        return this.blocks[this.blocksDone()];
    }
    isRoundCompleted() {
        return this.blocksDone() === this.blocksLeft();
    }
    increaseScoreWith(scoreIncrease) {
        this.roundScore(this.roundScore() + scoreIncrease);
    }
    doneWithBlock(wasDropped) {
        //this.activeBlock().relativeTopY = 0;
        this.blocksDone(this.blocksDone() + 1);
        this.increaseScoreWith(3 * this.level() + (wasDropped ? 21 : 3));
    }
    giveScoreForClearedRows(numberOfRows) {
        var groundScoreForNumberOfRows = {
            0:    0,
            1:   40,
            2:  100,
            3:  300,
            4: 1200,
        };
        this.roundScore(this.roundScore() + groundScoreForNumberOfRows[numberOfRows] * this.level());
    }

    activeBlockRotate() {
        this.activeBlock().rotate(this.occupiedExceptActive);
    }
    activeBlockMoveLeft() {
        this.activeBlock().moveLeft(this.occupiedExceptActive);
    }
    activeBlockMoveRight() {
        this.activeBlock().moveRight(this.occupiedExceptActive);
    }
    activeBlockDrop() {
        this.activeBlock().drop(this.occupiedExceptActive);
        this.doneWithBlock(1);
    }

    updateSquaresOccupiedByDroppedBlocks() {
        var allOccupiedSquares = [];
        
        OCCUPIED:
        for (var i = 0; i < this.blocksDone(); i++) {
            allOccupiedSquares.push(this.blocks[i].occupiedSquares());
        }
        this.occupiedExceptActive = allOccupiedSquares;
    }
    maybeTakeStep() {
        ++this.loopsSinceStep;
        if(this.loopsSinceStep > this.loopsPerStep) {
            this.loopsSinceStep = 0;

            var ableToMove = this.activeBlock().moveDown(this.occupiedExceptActive);
            if(!ableToMove) {
                this.doneWithBlock();
            }
        }
    }
    checkForCompletedRows() {
        var completedRows = [];

        for (var row = 0; row < this.area.verticalBlocks; row++) {
            var completedCells = 0;

            for (var blockIndex = 0; blockIndex < this.occupiedExceptActive.length; blockIndex++) {
                var block = this.occupiedExceptActive[blockIndex];

                for (var squareIndex = 0; squareIndex < block.length; squareIndex++) {
                    var square = block[squareIndex];

                    if(square.y == row) {
                        completedCells = completedCells + 1;
                    }
                }
            }
            if(completedCells === this.area.horizontalBlocks) {
                completedRows.push(row);
            }
        }

        if(completedRows.length > 0) {
            this.giveScoreForClearedRows(completedRows.length);
            this.handleCompletedRows(completedRows);
        }
        return completedRows.length > 0 ? true : false;

    }

    update() {
        if(!this.hadCompletedRowsOnLastUpdate) {
            this.updateSquaresOccupiedByDroppedBlocks();
            this.maybeTakeStep();
            this.draw();
            this.hadCompletedRowsOnLastUpdate = false;
        }
        var hadCompletedRows = this.checkForCompletedRows();

    }
    draw() {
        for (var i = 0; i < this.blocks.length; i++) {
            if(i > this.blocksDone()) {
                continue;
            }
            this.blocks[i].draw();
        }
    }
    handleCompletedRows(completedRows) {
        for (var rowIndex = 0; rowIndex < completedRows.length; rowIndex++) {
            var row = completedRows[rowIndex];
            this.ctx.fillStyle = '#fff';
            for (var cellIndex = 0; cellIndex < this.area.horizontalBlocks; cellIndex++) {
                this.ctx.fillRect(
                    this.area.left + cellIndex * this.unitSize,
                    this.area.top + row * this.unitSize,
                    this.unitSize,
                    this.unitSize
                );
            }
            for (var blockIndex = 0; blockIndex < this.blocksDone(); blockIndex++) {
                var block = this.blocks[blockIndex];
                block.removeFromRow(row);
            }

        }

        var aBlockCouldDrop = true;
        while(aBlockCouldDrop) {
            aBlockCouldDrop = false;

            for (var blockIndex = 0; blockIndex < this.blocksDone(); blockIndex++) {
                var occupiedExceptThis = this.allOccupiedSquaresExpectBlockIndex(blockIndex);
                var block = this.blocks[blockIndex];
                aBlockCouldDrop = block.drop(occupiedExceptThis);
            }
            console.log(aBlockCouldDrop);
        }
    }
    allOccupiedSquaresExpectBlockIndex(excpetBlockIndex) {
        var allOccupiedSquares = [];

        OCCUPIED:
        for (var i = 0; i < this.blocksDone(); i++) {
            if(i === excpetBlockIndex) {
                continue OCCUPIED;
            }
            allOccupiedSquares.push(this.blocks[i].occupiedSquares());
        }
        return allOccupiedSquares;
    }

    randomizeBlocks(amount) {
        var blocks = [];
        var blockTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        var rotation = [0, 1, 2, 3];
        for (var i = 1; i <= amount; i++) {
            blocks.push(new TetrisBlock({
                type: blockTypes[ Math.floor(Math.random() * blockTypes.length) ],
                rotation: rotation[ Math.floor(Math.random() * rotation.length) ],
                unitSize: this.unitSize,
                topY: -4 * this.unitSize,
                ctx: this.ctx,
                area: this.area,
            }));
        }
        console.log(blocks);
        return blocks;
    }

}