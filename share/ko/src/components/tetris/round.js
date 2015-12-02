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
        this.heapBlocks = [];
        this.blocks = this.randomizeBlocks(this.blocksLeft());
        this.loopsPerStep = this.loopsPerStepForLevel(this.level());
        this.loopsSinceStep = 0;
        this.roundScore = ko.observable(0);
        this.hadCompletedRowsOnLastUpdate = false;
        this.game = params.game;
    }
    blockCountForLevel(level) {
        return level == 1 ? 40
             : level == 2 ? 50
             : level == 3 ? 60
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
        return this.blocks[0];
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
        this.heapBlocks.push(this.blocks.shift());
        this.increaseScoreWith(3 * this.level() + (wasDropped ? 21 : 3));
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
        this.roundScore(this.roundScore() + groundScoreForNumberOfRows[numberOfRows] * this.level());
    }

    activeBlockRotate() {
        this.activeBlock().rotate(this.allOccupiedSquares());
    }
    activeBlockMoveLeft() {
        this.activeBlock().move('left', this.allOccupiedSquares());
    }
    activeBlockMoveRight() {
        this.activeBlock().move('right', this.allOccupiedSquares());
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
        console.log(occupiedPerRow);

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

/*

        for (var row = 0; row < this.area.verticalBlocks; row++) {
            var completedCells = 0;

            for (var blockIndex = 0; blockIndex < this.allOccupiedSquares.length; blockIndex++) {
                var block = this.allOccupiedSquares[blockIndex];

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
        */

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
        this.checkForCompletedRows();

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
         //       console.log(howFarDropped, couldDropAnyBlock, this.allOccupiedSquares());
            }
       //     console.log('while/end, couldDropAnyBlock:', couldDropAnyBlock);
//console.log(this.heapBlocks);
        }
    }
    handleCompletedRows(completedRows) {
        /*for (var rowIndex = 0; rowIndex < completedRows.length; rowIndex++) {
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
                aBlockCouldDrop = block.moveDown(occupiedExceptThis);
            }
            console.log(aBlockCouldDrop);
        }*/
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

    randomizeBlocks(amount) {
        var blocks = [];
        var blockTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        var rotation = [0, 1, 2, 3];
        for (var i = 1; i <= amount; i++) {
            blocks.push(new TetrisBlock({
                type: blockTypes[ Math.floor(Math.random() * blockTypes.length) ],
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

}