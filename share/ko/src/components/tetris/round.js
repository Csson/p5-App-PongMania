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

        console.log(this);
    }
    blockCountForLevel(level) {
        return level == 1 ? 10
             : level == 2 ? 12
             : level == 3 ? 15
             :              1
             ;
    }

    draw() {
        for (var i = 0; i < this.blocks.length; i++) {
            this.blocks[i].draw();
            this.blocks[i].rotate(Math.random() > 0.5 ? 1 : -1);
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
                topY: 1 + (i - 1) * this.unitSize * 4,
                ctx: this.ctx,
                area: this.area,
            }));
        }
        console.log(blocks);
        return blocks;
    }

}