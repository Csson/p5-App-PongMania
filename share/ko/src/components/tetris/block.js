import ko from 'knockout';

export class TetrisBlock {
    constructor(params) {
        this.area = params.area;
        this.type = params.type; // I, J, L, O, S, T, Z
        this.rotation = params.rotation; // 0, 1, 2, 3
        this.color = params.color || this.colorDefault();
        this.unitSize = params.unitSize;
        this.ctx = params.ctx;
        this.originSquare = params.originSquare; // { x: ?, y: ? }
        this.occupies = this.getOccupation(this.rotation);
    }
    clone() {
        var clone = new TetrisBlock(Object.assign({}, this));
        clone.originSquare = this.copyArray(this.originSquare);
        clone.area = this.copyArray(this.area);
        clone.occupies = this.copyArray(this.occupies);
        return clone;
    }

    move(direction, occupiedByOthers, steps = 1) {
        if(direction !== 'down' && direction !== 'left' && direction !== 'right') {
            console.log('Bad argument to block.move()');
        }
        var changeXBy = direction === 'left'  ? -steps
                      : direction === 'right' ? steps
                      :                         0
                      ;

        var changeYBy = direction === 'down' ? steps : 0;
        var newOccupies = this.copyArray(this.occupies);

        for (var i = 0; i < newOccupies.length; i++) {
            newOccupies[i].x = newOccupies[i].x + changeXBy;
            newOccupies[i].y = newOccupies[i].y + changeYBy;
        }

        var couldMove = true;
        for (var i = 0; i < newOccupies.length; i++) {
            if(!this.isWithinExtendedArea(newOccupies[i])) {
                couldMove = false;
            }
        }
        couldMove = couldMove ? this.checkOverlap(newOccupies, occupiedByOthers) : false;

        if(couldMove) {
            this.originSquare.x = this.originSquare.x + changeXBy;
            this.originSquare.y = this.originSquare.y + changeYBy;
            this.occupies = newOccupies.slice();
        }

        return couldMove;
    }
    drop(occupiedByOthers) {
        var numberOfDowns = 0;
        while(this.move('down', occupiedByOthers)) {
            numberOfDowns++;
        }
        return numberOfDowns;
    }
    rotate(occupiedByOthers) {
        var nextRotation = this.rotation + 1 > 3 ? 0 : this.rotation + 1;
        var clone = this.clone();
        clone.rotation = nextRotation;
        clone.occupies = clone.getOccupation(clone.rotation);

        var nextOccupation = this.getOccupation(nextRotation);

        var allAreWithin = true;
        var minimumX = clone.area.horizontalBlocks;
        var maximumX = 0;
        var maximumY = 0;

        clone.occupies.map( (occupiedSquare) => {
            minimumX = occupiedSquare.x < minimumX ? occupiedSquare.x : minimumX;
            maximumX = occupiedSquare.x > maximumX ? occupiedSquare.x : maximumX;
            maximumY = occupiedSquare.x > maximumY ? occupiedSquare.y : maximumY;
            if(!clone.isWithinExtendedArea(occupiedSquare)) {
                allAreWithin = false;
            }
        });

        var rotationOk = true;
        if(!allAreWithin) {
            if(minimumX < 1) {
                rotationOk = clone.move('right', occupiedByOthers, Math.abs(minimumX) + 1);
            }
            else if(maximumX > clone.area.horizontalBlocks) {
                rotationOk = clone.move('left', occupiedByOthers, maximumX - clone.area.horizontalBlocks);
            }
            else if(maximumY > clone.area.verticalBlocks) {
                rotationOk = false;
            }
        }
        rotationOk = rotationOk ? this.checkOverlap(clone.occupies, occupiedByOthers) : false;

        if(rotationOk) {
            this.occupies = clone.copyArray(clone.occupies);
            this.rotation = clone.rotation;
        }

    }
    withEachOccupiedSquare(doThis) {
        for (var i = 0; i < this.occupies.length; i++) {
            doThis(this.occupies[i]);
        }
    }
    // extended area includes the hidden squares above the visible top
    isWithinExtendedArea(occupiedSquare) {
        return occupiedSquare.x >= 1
            && occupiedSquare.x <= this.area.horizontalBlocks
            && occupiedSquare.y >= -4
            && occupiedSquare.y <= this.area.verticalBlocks ? true : false;
    }
    isWithinArea(occupiedSquare) {
        return occupiedSquare.x >= 1
            && occupiedSquare.x <= this.area.horizontalBlocks
            && occupiedSquare.y >= 1
            && occupiedSquare.y <= this.area.verticalBlocks ? true : false;
    }
    checkOverlap(oneBlockOccupy, occupiedByOthers) {
        for (var i = 0; i < oneBlockOccupy.length; i++) {
            var square = oneBlockOccupy[i];

            for (var j = 0; j < occupiedByOthers.length; j++) {
                var otherBlock = occupiedByOthers[j];

                for (var k = 0; k < otherBlock.length; k++) {
                    otherSquare = otherBlock[k];

                    if(square.x === otherSquare.x && square.y === otherSquare.y) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    draw() {
        this.ctx.fillStyle = this.color.main;
        this.occupies.map( (occupiedSquare) => {
            if(this.isWithinArea(occupiedSquare)) {
                var topX = 0.5 + this.area.left + (occupiedSquare.x - 1) * this.unitSize;
                var topY = 0.5 + this.area.top + (occupiedSquare.y - 1) * this.unitSize;
                this.ctx.fillRect(topX, topY, this.unitSize - 1, this.unitSize - 1);
                this.drawLine(1, this.color.lighter, topX, topY, this.unitSize - 1, 0);
                this.drawLine(1, this.color.lighter, topX, topY, 0, this.unitSize - 1);
                this.drawLine(1, this.color.darker, topX, topY + this.unitSize - 1, this.unitSize - 1, 0);
                this.drawLine(1, this.color.darker, topX + this.unitSize - 1, topY, 0, this.unitSize - 1);
            }
        });

        for (var i = 0; i < this.occupies.length; i++) {

            var first = this.occupies[i];
            if(!this.isWithinArea(first)) {
                continue;
            }
            for (var j = i + 1; j < this.occupies.length; j++) {

                var second = this.occupies[j];
                if(!this.isWithinArea(second)) {
                    continue;
                }

                var startX = this.area.left + (first.x - 1) * this.unitSize + this.unitSize / 2;
                var startY = this.area.top + (first.y - 1) * this.unitSize + this.unitSize / 2

                if(first.x === second.x && first.y !== second.y) {
                    var direction = first.y < second.y ? 1 : -1;
                    this.drawLine(5, this.color.darker, startX, startY, 0, direction * this.unitSize);
                }
                else if(first.x !== second.x && first.y === second.y) {
                    var direction = first.x < second.x ? 1 : -1;
                    this.drawLine(5, this.color.darker, startX, startY, direction * this.unitSize, 0);
                }
            }
        }
    }
    drawShadow(occupiedByOthers) {
        var clone = this.clone();
        clone.color = { main: '#666666', lighter: '#777777', darker: '#5f5f5f' };
        clone.drop(occupiedByOthers);
        clone.draw();
    }

    removeFromRows(rows) {

        var newOccupies = [];
        var uniqueOccupiedRows = [];

        for (var j = 0; j < this.occupies.length; j++) {
            var square = this.occupies[j];
            var rowToBeDeleted = false;

            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];

                if(square.y === row) {
                    rowToBeDeleted = true;
                }
            }

            if(!rowToBeDeleted) {
                newOccupies.push(square);

                if(uniqueOccupiedRows[-1] !== square.y) {
                    uniqueOccupiedRows.push(square.y);
                }
            }
        }

        var newBlock = null;
        if(uniqueOccupiedRows.length > 1) {

            thisNewOccupies = [];
            newBlockOccupies = [];

            var blockSplitsOn = null;
            for (var i = 1; i < uniqueOccupiedRows.length; i++) {
                if(uniqueOccupiedRows[i] - uniqueOccupiedRows[i - 1] > 1) {
                    blockSplitsOn = uniqueOccupiedRows[i] - 1;
                }
            }
            if(blockSplitsOn) {
                for (var i = 0; i < newOccupies.length; i++) {
                    var square = newOccupies[i];
                    if(square.y < blockSplitsOn) {
                        thisNewOccupies.push(square);
                    }
                    else {
                        newBlockOccupies.push(square);
                    }
                }

                this.occupies = this.copyArray(thisNewOccupies);
                newBlock = this.clone();
                newBlock.occupies = this.copyArray(newBlockOccupies);

            }
            else {
                this.occupies = this.copyArray(newOccupies);
            }

        }
        else {
            this.occupies = this.copyArray(newOccupies);
        }
        return newBlock;
    }

    getOccupation(rotation) {
        var newOccupies = [];

        var fills = this.getFillForTypeRotation(rotation);

        for (var rowIndex = 0; rowIndex < fills.length; rowIndex++) {
            var cells = fills[rowIndex].split('');
            for (var cellIndex = 0; cellIndex <= cells.length; cellIndex++) {

                if(cells[cellIndex] === '#') {
                    newOccupies.push({
                        x: this.originSquare.x + cellIndex,
                        y: this.originSquare.y + rowIndex,
                    });
                }
            }
        }
        return newOccupies;

    }
    drawLine(lineWidth, color, fromX, fromY, lengthX, lengthY) {
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(fromX + lengthX, fromY + lengthY);
        this.ctx.stroke();
    }

    colorDefault() {
        return this.type === 'I' ? { main: '#22dddd', lighter: '#55ffff', darker: '#00bbbb' }
             : this.type === 'J' ? { main: '#2a64db', lighter: '#4c86fd', darker: '#0842d9' }
             : this.type === 'L' ? { main: '#dd8822', lighter: '#ffaa55', darker: '#bb6600' }
             : this.type === 'O' ? { main: '#dddd22', lighter: '#ffff55', darker: '#bbbb00' }
             : this.type === 'S' ? { main: '#22bb88', lighter: '#55ddaa', darker: '#009966' }
             : this.type === 'T' ? { main: '#b934db', lighter: '#db56fd', darker: '#9712b9' }
             : this.type === 'Z' ? { main: '#dd2222', lighter: '#ff5555', darker: '#bb0000' }
             :                     { main: '#ffffff', lighter: '#ffffff', darker: '#000000' }
             ;
    }
    getFillForTypeRotation(rotation) {
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
        return typeRotations[this.type][rotation];
    }
    copyArray(array) {
        return JSON.parse(JSON.stringify(array));
    }

}
