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
        this.activeBlock().relativeTopY = 0;
        this.loopsPerStep = this.loopsPerStepForLevel(this.level());
        this.loopsSinceStep = 0;
        this.occupiedExceptActive = [];
        console.log(this);
    }
    blockCountForLevel(level) {
        return level == 1 ? 10
             : level == 2 ? 12
             : level == 3 ? 15
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
    doneWithBlock() {
        this.blocksDone(this.blocksDone() + 1);
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
        this.doneWithBlock();
        this.activeBlock().relativeTopY = 0;
    }


    draw() {

        var allOccupiedSquares = [];
        
        OCCUPIED:
        for (var i = 0; i < this.blocks.length; i++) {
            if(this.blocks[i] === this.activeBlock()) {
                continue OCCUPIED;
            }
            // Will probably never happen
            else if(i >= this.blocksDone()) {
                break OCCUPIED;
            }
            else if(this.blocks[i].relativeTopY >= 0) {
                allOccupiedSquares.push(this.blocks[i].occupiedSquares());
            }
        }
        this.occupiedExceptActive = allOccupiedSquares;

        ++this.loopsSinceStep;
        if(this.loopsSinceStep > this.loopsPerStep) {
            this.loopsSinceStep = 0;

            var ableToMove = this.activeBlock().moveDown(this.occupiedExceptActive);
            if(!ableToMove) {
                this.doneWithBlock();
            }
        }
        for (var i = 0; i < this.blocks.length; i++) {
            if(i > this.blocksDone()) {
                continue;
            }
            if(this.blocks[i].relativeTopY >= 0) {
                this.blocks[i].draw();
            }
        }
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