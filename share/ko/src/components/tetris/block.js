import ko from 'knockout';

export class TetrisBlock {
    constructor(params) {
        this.area = params.area;
        this.type = params.type; // I, J, L, O, S, T, Z
        this.rotation = params.rotation; // 0, 1, 2, 3
        this.color = params.color || this.colorDefault();
        this.unitSize = params.unitSize;
        this.ctx = params.ctx;
        this.relativeTopX = params.topX || 10;
        this.relativeTopY = params.topY || 30;

        this.bounding = {
            xUnits: this.type === 'I' || this.type === 'O' ? 4 : 3,
            yUnits: this.type === 'I' ? 4 : 3,
        }
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
    rotate(direction) {
        if(this.rotation + direction > 3) {
            this.rotation = 0;
        }
        else if(this.rotation + direction < 0) {
            this.rotation = 3;
        }
        else {
            this.rotation = this.rotation + direction;
        }
    }
    topX() {
        return this.relativeTopX + this.area.left;
    }
    topY() {
        return this.relativeTopY + this.area.top;
    }

    draw() {
        var fills = this.getFillForTypeRotation();

        for (var rowIndex = 0; rowIndex <= 3; rowIndex++) {
            console.log(rowIndex);
            console.log(this);
            console.log(fills);
            var cells = fills[rowIndex].split('');
            for (var cellIndex = 0; cellIndex <= 3; cellIndex++) {
                if(cells[cellIndex] === '#') {
                    this.ctx.fillStyle = this.color;
                    this.ctx.fillRect(this.topX() + cellIndex * this.unitSize, this.topY() + rowIndex * this.unitSize, this.unitSize, this.unitSize);
                }
            }
        }


    }

    getFillForTypeRotation() {
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
                    '#____',
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
        return typeRotations[this.type][this.rotation];
    }
}
/*
*/