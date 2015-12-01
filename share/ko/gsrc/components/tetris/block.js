import ko from 'knockout';

export class TetrisBlock {
    constructor(params) {
        this.area = params.area;
        this.type = params.type; // I, J, L, O, S, T, Z
        this.rotation = params.rotation; // 0, 1, 2, 3
        this.color = params.color || this.colorDefault();
        this.unitSize = params.unitSize;
        this.ctx = params.ctx;
        this.relativeTopX = params.topX || this.unitSize * Math.floor((this.area.horizontalBlocks - 2) / 2);
        this.relativeTopY = params.topY || 0;
        this.fills = this.getFillForTypeRotation(this.type, this.rotation);

    }
    colorDefault() {
        return this.type === 'I' ? '#00ffff'
             : this.type === 'J' ? '#0000ff'
             : this.type === 'L' ? '#ffaa00'
             : this.type === 'O' ? '#ffff00'
             : this.type === 'S' ? '#00ddbb'
             : this.type === 'T' ? '#9900ff'
             : this.type === 'Z' ? '#ff0000'
             :                     '#fff'
             ;
    }
    actualLeftX(fills) {
        var fillsToCheck = fills || this.fills;
        var minFilledX = 3;
        for (var row = 0; row < fillsToCheck.length; row++) {
            var cells = fillsToCheck[row].split('');
            for (var column = 0; column <= 3; column++) {
                if(cells[column] === '#' && column < minFilledX) {
                    minFilledX = column;
                }
            }
        }
        return this.relativeTopX + minFilledX * this.unitSize;
    }
    actualRightX(fills) {
        var fillsToCheck = fills || this.fills;
        var maxFilledX = 0;
        for (var row = 0; row < fillsToCheck.length; row++) {
            var cells = fillsToCheck[row].split('');
            for (var column = 0; column <= 3; column++) {
                if(cells[column] === '#' && column > maxFilledX) {
                    maxFilledX = column;
                }
            }
        }
        return this.relativeTopX + (1 + maxFilledX) * this.unitSize;
    }
    doRotate(newRotation) {
        this.rotation = newRotation;
        this.fills = this.getFillForTypeRotation(this.type, newRotation);
    }
    rotate(occupiedByOthers) {
        var nextRotation;
        if(this.rotation + 1 > 3) {
            nextRotation = 0;
        }
        else if(this.rotation + 1 < 0) {
            nextRotation = 3;
        }
        else {
            nextRotation = this.rotation + 1;
        }

        var simBlock = new TetrisBlock(Object.assign({}, this));
        simBlock.relativeTopX = this.relativeTopX;
        simBlock.relativeTopY = this.relativeTopY;
        simBlock.doRotate(nextRotation);

        var rotatedOk = true;
        var shouldMoveRight = false;
        var shouldMoveLeft = false;

        // Can we wall kick to the right?
        if(simBlock.actualLeftX() < 0) {
            console.log('shouldmoveright');
            shouldMoveRight = true;
            
            if(!simBlock.moveRight(occupiedByOthers)) {
                rotatedOk = false;
            }
        }
        // wall kick to the left?
        else if(simBlock.actualRightX() > simBlock.area.horizontalBlocks * simBlock.unitSize) {
            shouldMoveLeft = true;

            if(!simBlock.moveLeft(occupiedByOthers)) {
                rotatedOk = false;
            }
        }
        // If we overlap another block, try moving left/right
        else if(!simBlock.checkMovability(simBlock.occupiedSquares(), occupiedByOthers)) {
            if(simBlock.actualLeftX() > simBlock.unitSize) {
                shouldMoveRight = true;

                if(!simBlock.moveRight(occupiedByOthers)) {
                    rotatedOk = false;
                }
            }
            else if(simBlock.actualRightX() < simBlock.area.horizontalBlocks * simBlock.unitSize - simBlock.unitSize) {
                shouldMoveLeft = true;

                if(!simBlock.moveLeft(occupiedByOthers)) {
                    rotatedOk = false;
                }
            }
            else {
                rotatedOk = false;
            }
        }

        if(rotatedOk) {
            if(shouldMoveRight) {
                this.moveRight(occupiedByOthers);
            }
            else if(shouldMoveLeft) {
                this.moveLeft(occupiedByOthers);
            }
            this.doRotate(nextRotation);
        }
    }
    moveLeft(occupiedByOthers) {
        if(this.actualLeftX() == 0) {
            return;
        }
        
        var newRelativeTopX = this.relativeTopX - this.unitSize;
        var newOccupiedSquares = this.occupiedSquares(newRelativeTopX, this.RelativeTopY);

        var canMove = this.checkMovability(newOccupiedSquares, occupiedByOthers);

        if(canMove) {
            this.relativeTopX = newRelativeTopX;
            return true;
        }
        else {
            return false;
        }
    }
    moveRight(occupiedByOthers) {
        if(this.actualRightX() == this.area.horizontalBlocks * this.unitSize) {
            return;
        }

        var newRelativeTopX = this.relativeTopX + this.unitSize;
        var newOccupiedSquares = this.occupiedSquares(newRelativeTopX, this.RelativeTopY);

        var canMove = this.checkMovability(newOccupiedSquares, occupiedByOthers);

        if(canMove) {
            this.relativeTopX = newRelativeTopX;
            return true;
        }
        else {
            return false;
        }
    }
    moveDown(occupiedByOthers) {
        if(this.relativeTopY + this.blockHeight() === this.area.verticalBlocks * this.unitSize) {
            return false;
        }

        var newRelativeTopY = this.relativeTopY + this.unitSize;
        var newOccupiedSquares = this.occupiedSquares(this.relativeTopX, newRelativeTopY);

        var canMove = this.checkMovability(newOccupiedSquares, occupiedByOthers);

        if(canMove) {
            this.relativeTopY = newRelativeTopY;
            return true;
        }
        else {
            return false;
        }

    }
    drop(occupiedByOthers) {
        var newRelativeTopY = this.area.verticalBlocks * this.unitSize - this.marginBottom();

        while(this.moveDown(occupiedByOthers)) {}
    }
    checkMovability(newOccupiedSquares, occupiedByOthers) {
        var canMove = true;

        SEARCHING:
        for (var i = 0; i < newOccupiedSquares.length; i++) {
            var newOccupied = newOccupiedSquares[i]; // this block's would-be occupied squares

            for (var j = 0; j < occupiedByOthers.length; j++) {
                var occupiedByAnotherBlock = occupiedByOthers[j];

                for (var k = 0; k < occupiedByAnotherBlock.length; k++) {
                    var oneOccupiedSquare = occupiedByAnotherBlock[k];

                    if(newOccupied.x === oneOccupiedSquare.x && newOccupied.y === oneOccupiedSquare.y) {
                        canMove = false;
                        break SEARCHING;
                    }
                }
            }
        }
        return canMove;
        
    }
    blockHeight() {
        var maxFilledY = this.maxFilledY();
        return (1 + maxFilledY) * this.unitSize;
    }
    marginBottom(fills) {
        var maxFilledY = this.maxFilledY(fills);
        console.log('marginbottom: ' + (1 + maxFilledY) * this.unitSize);
        return (1 + maxFilledY) * this.unitSize;
    }
    maxFilledY(fills) {
        var fillsToCheck = fills || this.fills;
        var maxFilledY = 0;
        for (var row = 0; row < fillsToCheck.length; row++) {
            var cells = fillsToCheck[row].split('');
            for (var column = 0; column <= 3; column++) {
                if(cells[column] === '#' && row > maxFilledY) {
                    maxFilledY = row;
                }
            }
        }
        return maxFilledY;
    }
    topX() {
        return this.relativeTopX + this.area.left;
    }
    topY() {
        return this.relativeTopY + this.area.top;
    }

    draw() {
        for (var rowIndex = 0; rowIndex <= 3; rowIndex++) {
            var cells = this.fills[rowIndex].split('');
            for (var cellIndex = 0; cellIndex <= 3; cellIndex++) {
                if(cells[cellIndex] === '#') {
                    this.ctx.fillStyle = this.color;
                    this.ctx.fillRect(this.topX() + cellIndex * this.unitSize, this.topY() + rowIndex * this.unitSize, this.unitSize, this.unitSize);
                }
            }
        }
    }
    occupiedSquares(relativeTopX, relativeTopY) {
        var localRelativeTopX = relativeTopX || this.relativeTopX;
        var localRelativeTopY = relativeTopY || this.relativeTopY;
        var xOrigin = localRelativeTopX / this.unitSize;
        var yOrigin = localRelativeTopY / this.unitSize;

        var occupiedSquares = [];

        for (var rowIndex = 0; rowIndex < this.fills.length; rowIndex++) {
            var cells = this.fills[rowIndex].split('');
            for (var cellIndex = 0; cellIndex <= 3; cellIndex++) {
                if(cells[cellIndex] === '#') {
                    occupiedSquares.push({ x: xOrigin + cellIndex, y: yOrigin + rowIndex });
                }
            }
        }
        return occupiedSquares;
    }

    getFillForTypeRotation(type, rotation) {
        var typeRotations = {
            I: [
                [
                    '_#__',
                    '_#__',
                    '_#__',
                    '_#__'
                ],
                [
                    '____',
                    '####',
                    '____',
                    '____',
                ],
                [
                    '__#_',
                    '__#_',
                    '__#_',
                    '__#_',
                ],
                [
                    '____',
                    '____',
                    '####',
                    '____',
                ],
            ],
            J: [
                [
                    '_#__',
                    '_#__',
                    '##__',
                    '____',
                ],
                [
                    '#___',
                    '###_',
                    '____',
                    '____',
                ],
                [
                    '_##_',
                    '_#__',
                    '_#__',
                    '____',
                ],
                [
                    '____',
                    '###_',
                    '__#_',
                    '____',
                ]
            ],
            L: [
                [
                    '_#__',
                    '_#__',
                    '_##_',
                    '____',
                ],
                [
                    '____',
                    '###_',
                    '#___',
                    '____',
                ],
                [
                    '##__',
                    '_#__',
                    '_#__',
                    '____',
                ],
                [
                    '__#_',
                    '###_',
                    '____',
                    '____',
                ],
            ],
            O: [
                [
                    '_##_',
                    '_##_',
                    '____',
                    '____',
                ],
                [
                    '_##_',
                    '_##_',
                    '____',
                    '____',
                ],
                [
                    '_##_',
                    '_##_',
                    '____',
                    '____',
                ],
                [
                    '_##_',
                    '_##_',
                    '____',
                    '____',
                ],
            ],
            S: [
                [
                    '____',
                    '_##_',
                    '##__',
                    '____',
                ],
                [
                    '#___',
                    '##__',
                    '_#__',
                    '____',
                ],
                [
                    '_##_',
                    '##__',
                    '____',
                    '____',
                ],
                [
                    '_#__',
                    '_##_',
                    '__#_',
                    '____',
                ]
            ],
            T: [
                [
                    '____',
                    '###_',
                    '_#__',
                    '____',
                ],
                [
                    '_#__',
                    '##__',
                    '_#__',
                    '____',
                ],
                [
                    '_#__',
                    '###_',
                    '____',
                    '____',
                ],
                [
                    '_#__',
                    '_##_',
                    '_#__',
                    '____',
                ]
            ],
            Z: [
                [
                    '____',
                    '##__',
                    '_##_',
                    '____',
                ],
                [
                    '_#__',
                    '##__',
                    '#___',
                    '____',
                ],
                [
                    '##__',
                    '_##_',
                    '____',
                    '____',
                ],
                [
                    '__#_',
                    '_##_',
                    '_#__',
                    '____',
                ],
            ],
        };
        return typeRotations[type][rotation];
    }

}
/*
*/