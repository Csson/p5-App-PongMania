
define('text!components/tetris/tetris.html',[],function () { return '<div id="tetris-page">\n    <canvas class="full"></canvas>\n</div>\n<div id="tetris-round-score" data-bind="text: currentRoundScore()"></div>\n';});

define('components/tetris/block',['exports', 'knockout'], function (exports, _knockout) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var TetrisBlock = (function () {
        function TetrisBlock(params) {
            _classCallCheck(this, TetrisBlock);

            this.area = params.area;
            this.type = params.type; // I, J, L, O, S, T, Z
            this.rotation = params.rotation; // 0, 1, 2, 3
            this.color = params.color || this.colorDefault();
            this.unitSize = params.unitSize;
            this.ctx = params.ctx;
            this.relativeTopX = params.topX || this.unitSize * Math.floor((this.area.horizontalBlocks - 2) / 2);
            this.relativeTopY = params.topY || -4 * this.unitSize;
            this.fills = this.getFillForTypeRotation(this.type, this.rotation);
        }

        /*
        */

        _createClass(TetrisBlock, [{
            key: 'colorDefault',
            value: function colorDefault() {
                return this.type === 'I' ? '#00ffff' : this.type === 'J' ? '#0000ff' : this.type === 'L' ? '#ffaa00' : this.type === 'O' ? '#ffff00' : this.type === 'S' ? '#00ddbb' : this.type === 'T' ? '#9900ff' : this.type === 'Z' ? '#ff0000' : '#fff';
            }
        }, {
            key: 'actualLeftX',
            value: function actualLeftX(fills) {
                var fillsToCheck = fills || this.fills;
                var minFilledX = 3;
                for (var row = 0; row < fillsToCheck.length; row++) {
                    var cells = fillsToCheck[row].split('');
                    for (var column = 0; column <= 3; column++) {
                        if (cells[column] === '#' && column < minFilledX) {
                            minFilledX = column;
                        }
                    }
                }
                return this.relativeTopX + minFilledX * this.unitSize;
            }
        }, {
            key: 'actualRightX',
            value: function actualRightX(fills) {
                var fillsToCheck = fills || this.fills;
                var maxFilledX = 0;
                for (var row = 0; row < fillsToCheck.length; row++) {
                    var cells = fillsToCheck[row].split('');
                    for (var column = 0; column <= 3; column++) {
                        if (cells[column] === '#' && column > maxFilledX) {
                            maxFilledX = column;
                        }
                    }
                }
                return this.relativeTopX + (1 + maxFilledX) * this.unitSize;
            }
        }, {
            key: 'doRotate',
            value: function doRotate(newRotation) {
                this.rotation = newRotation;
                this.fills = this.getFillForTypeRotation(this.type, newRotation);
            }
        }, {
            key: 'rotate',
            value: function rotate(occupiedByOthers) {
                var nextRotation;
                if (this.rotation + 1 > 3) {
                    nextRotation = 0;
                } else if (this.rotation + 1 < 0) {
                    nextRotation = 3;
                } else {
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
                if (simBlock.actualLeftX() < 0) {
                    console.log('shouldmoveright');
                    shouldMoveRight = true;

                    if (!simBlock.moveRight(occupiedByOthers)) {
                        rotatedOk = false;
                    }
                }
                // wall kick to the left?
                else if (simBlock.actualRightX() > simBlock.area.horizontalBlocks * simBlock.unitSize) {
                        shouldMoveLeft = true;

                        if (!simBlock.moveLeft(occupiedByOthers)) {
                            rotatedOk = false;
                        }
                    }
                    // If we overlap another block, try moving left/right
                    else if (!simBlock.checkMovability(simBlock.occupiedSquares(), occupiedByOthers)) {
                            if (simBlock.actualLeftX() > simBlock.unitSize) {
                                shouldMoveRight = true;

                                if (!simBlock.moveRight(occupiedByOthers)) {
                                    rotatedOk = false;
                                }
                            } else if (simBlock.actualRightX() < simBlock.area.horizontalBlocks * simBlock.unitSize - simBlock.unitSize) {
                                shouldMoveLeft = true;

                                if (!simBlock.moveLeft(occupiedByOthers)) {
                                    rotatedOk = false;
                                }
                            } else {
                                rotatedOk = false;
                            }
                        }

                if (rotatedOk) {
                    if (shouldMoveRight) {
                        this.moveRight(occupiedByOthers);
                    } else if (shouldMoveLeft) {
                        this.moveLeft(occupiedByOthers);
                    }
                    this.doRotate(nextRotation);
                }
            }
        }, {
            key: 'moveLeft',
            value: function moveLeft(occupiedByOthers) {
                if (this.actualLeftX() == 0) {
                    return;
                }

                var newRelativeTopX = this.relativeTopX - this.unitSize;
                var newOccupiedSquares = this.occupiedSquares(newRelativeTopX, this.RelativeTopY);

                var canMove = this.checkMovability(newOccupiedSquares, occupiedByOthers);

                if (canMove) {
                    this.relativeTopX = newRelativeTopX;
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            key: 'moveRight',
            value: function moveRight(occupiedByOthers) {
                if (this.actualRightX() == this.area.horizontalBlocks * this.unitSize) {
                    return;
                }

                var newRelativeTopX = this.relativeTopX + this.unitSize;
                var newOccupiedSquares = this.occupiedSquares(newRelativeTopX, this.RelativeTopY);

                var canMove = this.checkMovability(newOccupiedSquares, occupiedByOthers);

                if (canMove) {
                    this.relativeTopX = newRelativeTopX;
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            key: 'moveDown',
            value: function moveDown(occupiedByOthers) {
                if (this.relativeTopY + this.blockHeight() === this.area.verticalBlocks * this.unitSize) {
                    return false;
                }

                var newRelativeTopY = this.relativeTopY + this.unitSize;
                var newOccupiedSquares = this.occupiedSquares(this.relativeTopX, newRelativeTopY);

                var canMove = this.checkMovability(newOccupiedSquares, occupiedByOthers);

                if (canMove) {
                    this.relativeTopY = newRelativeTopY;
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            key: 'drop',
            value: function drop(occupiedByOthers) {
                var newRelativeTopY = this.area.verticalBlocks * this.unitSize - this.marginBottom();
                var wasDropped = false;
                while (this.moveDown(occupiedByOthers)) {
                    wasDropped = true;
                }
                return wasDropped;
            }
        }, {
            key: 'checkMovability',
            value: function checkMovability(newOccupiedSquares, occupiedByOthers) {
                var canMove = true;

                SEARCHING: for (var i = 0; i < newOccupiedSquares.length; i++) {
                    var newOccupied = newOccupiedSquares[i]; // this block's would-be occupied squares

                    for (var j = 0; j < occupiedByOthers.length; j++) {
                        var occupiedByAnotherBlock = occupiedByOthers[j];

                        for (var k = 0; k < occupiedByAnotherBlock.length; k++) {
                            var oneOccupiedSquare = occupiedByAnotherBlock[k];

                            if (newOccupied.x === oneOccupiedSquare.x && newOccupied.y === oneOccupiedSquare.y) {
                                canMove = false;
                                break SEARCHING;
                            }
                        }
                    }
                }
                return canMove;
            }
        }, {
            key: 'blockHeight',
            value: function blockHeight() {
                var maxFilledY = this.maxFilledY();
                return (1 + maxFilledY) * this.unitSize;
            }
        }, {
            key: 'marginBottom',
            value: function marginBottom(fills) {
                var maxFilledY = this.maxFilledY(fills);
                console.log('marginbottom: ' + (1 + maxFilledY) * this.unitSize);
                return (1 + maxFilledY) * this.unitSize;
            }
        }, {
            key: 'maxFilledY',
            value: function maxFilledY(fills) {
                var fillsToCheck = fills || this.fills;
                var maxFilledY = 0;
                for (var row = 0; row < fillsToCheck.length; row++) {
                    var cells = fillsToCheck[row].split('');
                    for (var column = 0; column <= 3; column++) {
                        if (cells[column] === '#' && row > maxFilledY) {
                            maxFilledY = row;
                        }
                    }
                }
                return maxFilledY;
            }
        }, {
            key: 'topX',
            value: function topX() {
                return this.relativeTopX + this.area.left;
            }
        }, {
            key: 'topY',
            value: function topY() {
                return this.relativeTopY + this.area.top;
            }
        }, {
            key: 'draw',
            value: function draw() {
                for (var rowIndex = 0; rowIndex <= 3; rowIndex++) {
                    var cells = this.fills[rowIndex].split('');
                    for (var cellIndex = 0; cellIndex <= 3; cellIndex++) {

                        if (cells[cellIndex] === '#' && this.relativeTopY + rowIndex * this.unitSize >= 0) {
                            this.ctx.fillStyle = this.color;
                            this.ctx.fillRect(this.topX() + cellIndex * this.unitSize, this.topY() + rowIndex * this.unitSize, this.unitSize, this.unitSize);
                        }
                    }
                }
            }
        }, {
            key: 'occupiedSquares',
            value: function occupiedSquares(relativeTopX, relativeTopY) {
                var localRelativeTopX = relativeTopX || this.relativeTopX;
                var localRelativeTopY = relativeTopY || this.relativeTopY;
                var xOrigin = localRelativeTopX / this.unitSize;
                var yOrigin = localRelativeTopY / this.unitSize;

                var occupiedSquares = [];

                for (var rowIndex = 0; rowIndex < this.fills.length; rowIndex++) {
                    var cells = this.fills[rowIndex].split('');
                    for (var cellIndex = 0; cellIndex <= 3; cellIndex++) {
                        if (cells[cellIndex] === '#' && this.relativeTopY + rowIndex * this.unitSize >= 0) {
                            occupiedSquares.push({ x: xOrigin + cellIndex, y: yOrigin + rowIndex });
                        }
                    }
                }
                return occupiedSquares;
            }
        }, {
            key: 'removeFromRow',
            value: function removeFromRow(row) {
                var occupiedSquares = this.occupiedSquares();
                var yOrigin = this.relativeTopY / this.unitSize;
                var fillOffset = row - yOrigin;
                this.fills[fillOffset] = '----';

                var movedFills = true;
                while (movedFills) {
                    movedFills = false;

                    for (var i = 0; i < this.fills.length - 1; i++) {
                        var rowFill = this.fills[i];
                        var nextFill = this.fills[i + 1];
                        if (rowFill === '----' && nextFill !== '----') {
                            movedFills = true;
                            this.fills[i] = nextFill;
                            this.fills[i + 1] = rowFill;
                        }
                    }
                }
            }
        }, {
            key: 'getFillForTypeRotation',
            value: function getFillForTypeRotation(type, rotation) {
                var typeRotations = {
                    I: [['_#__', '_#__', '_#__', '_#__'], ['____', '####', '____', '____'], ['__#_', '__#_', '__#_', '__#_'], ['____', '____', '####', '____']],
                    J: [['_#__', '_#__', '##__', '____'], ['#___', '###_', '____', '____'], ['_##_', '_#__', '_#__', '____'], ['____', '###_', '__#_', '____']],
                    L: [['_#__', '_#__', '_##_', '____'], ['____', '###_', '#___', '____'], ['##__', '_#__', '_#__', '____'], ['__#_', '###_', '____', '____']],
                    O: [['_##_', '_##_', '____', '____'], ['_##_', '_##_', '____', '____'], ['_##_', '_##_', '____', '____'], ['_##_', '_##_', '____', '____']],
                    S: [['____', '_##_', '##__', '____'], ['#___', '##__', '_#__', '____'], ['_##_', '##__', '____', '____'], ['_#__', '_##_', '__#_', '____']],
                    T: [['____', '###_', '_#__', '____'], ['_#__', '##__', '_#__', '____'], ['_#__', '###_', '____', '____'], ['_#__', '_##_', '_#__', '____']],
                    Z: [['____', '##__', '_##_', '____'], ['_#__', '##__', '#___', '____'], ['##__', '_##_', '____', '____'], ['__#_', '_##_', '_#__', '____']]
                };
                return typeRotations[type][rotation];
            }
        }]);

        return TetrisBlock;
    })();

    exports.TetrisBlock = TetrisBlock;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDakQsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNoQyxnQkFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUNwRyxnQkFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDdEQsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBRXRFOzs7OztxQkFaUSxXQUFXOzttQkFhUix3QkFBRztBQUNYLHVCQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxHQUFHLFNBQVMsR0FDN0IsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFH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QkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7aUJBQ0osQ0FBQztBQUNGLHVCQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN4Qzs7O2VBMWRRLFdBQVciLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL3RldHJpcy9ibG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5cbmV4cG9ydCBjbGFzcyBUZXRyaXNCbG9jayB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuYXJlYSA9IHBhcmFtcy5hcmVhO1xuICAgICAgICB0aGlzLnR5cGUgPSBwYXJhbXMudHlwZTsgLy8gSSwgSiwgTCwgTywgUywgVCwgWlxuICAgICAgICB0aGlzLnJvdGF0aW9uID0gcGFyYW1zLnJvdGF0aW9uOyAvLyAwLCAxLCAyLCAzXG4gICAgICAgIHRoaXMuY29sb3IgPSBwYXJhbXMuY29sb3IgfHwgdGhpcy5jb2xvckRlZmF1bHQoKTtcbiAgICAgICAgdGhpcy51bml0U2l6ZSA9IHBhcmFtcy51bml0U2l6ZTtcbiAgICAgICAgdGhpcy5jdHggPSBwYXJhbXMuY3R4O1xuICAgICAgICB0aGlzLnJlbGF0aXZlVG9wWCA9IHBhcmFtcy50b3BYIHx8IHRoaXMudW5pdFNpemUgKiBNYXRoLmZsb29yKCh0aGlzLmFyZWEuaG9yaXpvbnRhbEJsb2NrcyAtIDIpIC8gMik7XG4gICAgICAgIHRoaXMucmVsYXRpdmVUb3BZID0gcGFyYW1zLnRvcFkgfHwgLTQgKiB0aGlzLnVuaXRTaXplO1xuICAgICAgICB0aGlzLmZpbGxzID0gdGhpcy5nZXRGaWxsRm9yVHlwZVJvdGF0aW9uKHRoaXMudHlwZSwgdGhpcy5yb3RhdGlvbik7XG5cbiAgICB9XG4gICAgY29sb3JEZWZhdWx0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSAnSScgPyAnIzAwZmZmZidcbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ0onID8gJyMwMDAwZmYnXG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdMJyA/ICcjZmZhYTAwJ1xuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnTycgPyAnI2ZmZmYwMCdcbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ1MnID8gJyMwMGRkYmInXG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdUJyA/ICcjOTkwMGZmJ1xuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnWicgPyAnI2ZmMDAwMCdcbiAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgJyNmZmYnXG4gICAgICAgICAgICAgO1xuICAgIH1cbiAgICBhY3R1YWxMZWZ0WChmaWxscykge1xuICAgICAgICB2YXIgZmlsbHNUb0NoZWNrID0gZmlsbHMgfHwgdGhpcy5maWxscztcbiAgICAgICAgdmFyIG1pbkZpbGxlZFggPSAzO1xuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBmaWxsc1RvQ2hlY2subGVuZ3RoOyByb3crKykge1xuICAgICAgICAgICAgdmFyIGNlbGxzID0gZmlsbHNUb0NoZWNrW3Jvd10uc3BsaXQoJycpO1xuICAgICAgICAgICAgZm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDw9IDM7IGNvbHVtbisrKSB7XG4gICAgICAgICAgICAgICAgaWYoY2VsbHNbY29sdW1uXSA9PT0gJyMnICYmIGNvbHVtbiA8IG1pbkZpbGxlZFgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWluRmlsbGVkWCA9IGNvbHVtbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVUb3BYICsgbWluRmlsbGVkWCAqIHRoaXMudW5pdFNpemU7XG4gICAgfVxuICAgIGFjdHVhbFJpZ2h0WChmaWxscykge1xuICAgICAgICB2YXIgZmlsbHNUb0NoZWNrID0gZmlsbHMgfHwgdGhpcy5maWxscztcbiAgICAgICAgdmFyIG1heEZpbGxlZFggPSAwO1xuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBmaWxsc1RvQ2hlY2subGVuZ3RoOyByb3crKykge1xuICAgICAgICAgICAgdmFyIGNlbGxzID0gZmlsbHNUb0NoZWNrW3Jvd10uc3BsaXQoJycpO1xuICAgICAgICAgICAgZm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDw9IDM7IGNvbHVtbisrKSB7XG4gICAgICAgICAgICAgICAgaWYoY2VsbHNbY29sdW1uXSA9PT0gJyMnICYmIGNvbHVtbiA+IG1heEZpbGxlZFgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4RmlsbGVkWCA9IGNvbHVtbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVUb3BYICsgKDEgKyBtYXhGaWxsZWRYKSAqIHRoaXMudW5pdFNpemU7XG4gICAgfVxuICAgIGRvUm90YXRlKG5ld1JvdGF0aW9uKSB7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBuZXdSb3RhdGlvbjtcbiAgICAgICAgdGhpcy5maWxscyA9IHRoaXMuZ2V0RmlsbEZvclR5cGVSb3RhdGlvbih0aGlzLnR5cGUsIG5ld1JvdGF0aW9uKTtcbiAgICB9XG4gICAgcm90YXRlKG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgdmFyIG5leHRSb3RhdGlvbjtcbiAgICAgICAgaWYodGhpcy5yb3RhdGlvbiArIDEgPiAzKSB7XG4gICAgICAgICAgICBuZXh0Um90YXRpb24gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5yb3RhdGlvbiArIDEgPCAwKSB7XG4gICAgICAgICAgICBuZXh0Um90YXRpb24gPSAzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbmV4dFJvdGF0aW9uID0gdGhpcy5yb3RhdGlvbiArIDE7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2ltQmxvY2sgPSBuZXcgVGV0cmlzQmxvY2soT2JqZWN0LmFzc2lnbih7fSwgdGhpcykpO1xuICAgICAgICBzaW1CbG9jay5yZWxhdGl2ZVRvcFggPSB0aGlzLnJlbGF0aXZlVG9wWDtcbiAgICAgICAgc2ltQmxvY2sucmVsYXRpdmVUb3BZID0gdGhpcy5yZWxhdGl2ZVRvcFk7XG4gICAgICAgIHNpbUJsb2NrLmRvUm90YXRlKG5leHRSb3RhdGlvbik7XG5cbiAgICAgICAgdmFyIHJvdGF0ZWRPayA9IHRydWU7XG4gICAgICAgIHZhciBzaG91bGRNb3ZlUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgdmFyIHNob3VsZE1vdmVMZWZ0ID0gZmFsc2U7XG5cbiAgICAgICAgLy8gQ2FuIHdlIHdhbGwga2ljayB0byB0aGUgcmlnaHQ/XG4gICAgICAgIGlmKHNpbUJsb2NrLmFjdHVhbExlZnRYKCkgPCAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc2hvdWxkbW92ZXJpZ2h0Jyk7XG4gICAgICAgICAgICBzaG91bGRNb3ZlUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZighc2ltQmxvY2subW92ZVJpZ2h0KG9jY3VwaWVkQnlPdGhlcnMpKSB7XG4gICAgICAgICAgICAgICAgcm90YXRlZE9rID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gd2FsbCBraWNrIHRvIHRoZSBsZWZ0P1xuICAgICAgICBlbHNlIGlmKHNpbUJsb2NrLmFjdHVhbFJpZ2h0WCgpID4gc2ltQmxvY2suYXJlYS5ob3Jpem9udGFsQmxvY2tzICogc2ltQmxvY2sudW5pdFNpemUpIHtcbiAgICAgICAgICAgIHNob3VsZE1vdmVMZWZ0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYoIXNpbUJsb2NrLm1vdmVMZWZ0KG9jY3VwaWVkQnlPdGhlcnMpKSB7XG4gICAgICAgICAgICAgICAgcm90YXRlZE9rID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgd2Ugb3ZlcmxhcCBhbm90aGVyIGJsb2NrLCB0cnkgbW92aW5nIGxlZnQvcmlnaHRcbiAgICAgICAgZWxzZSBpZighc2ltQmxvY2suY2hlY2tNb3ZhYmlsaXR5KHNpbUJsb2NrLm9jY3VwaWVkU3F1YXJlcygpLCBvY2N1cGllZEJ5T3RoZXJzKSkge1xuICAgICAgICAgICAgaWYoc2ltQmxvY2suYWN0dWFsTGVmdFgoKSA+IHNpbUJsb2NrLnVuaXRTaXplKSB7XG4gICAgICAgICAgICAgICAgc2hvdWxkTW92ZVJpZ2h0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGlmKCFzaW1CbG9jay5tb3ZlUmlnaHQob2NjdXBpZWRCeU90aGVycykpIHtcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZE9rID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihzaW1CbG9jay5hY3R1YWxSaWdodFgoKSA8IHNpbUJsb2NrLmFyZWEuaG9yaXpvbnRhbEJsb2NrcyAqIHNpbUJsb2NrLnVuaXRTaXplIC0gc2ltQmxvY2sudW5pdFNpemUpIHtcbiAgICAgICAgICAgICAgICBzaG91bGRNb3ZlTGVmdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBpZighc2ltQmxvY2subW92ZUxlZnQob2NjdXBpZWRCeU90aGVycykpIHtcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZE9rID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcm90YXRlZE9rID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihyb3RhdGVkT2spIHtcbiAgICAgICAgICAgIGlmKHNob3VsZE1vdmVSaWdodCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW92ZVJpZ2h0KG9jY3VwaWVkQnlPdGhlcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihzaG91bGRNb3ZlTGVmdCkge1xuICAgICAgICAgICAgICAgIHRoaXMubW92ZUxlZnQob2NjdXBpZWRCeU90aGVycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRvUm90YXRlKG5leHRSb3RhdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbW92ZUxlZnQob2NjdXBpZWRCeU90aGVycykge1xuICAgICAgICBpZih0aGlzLmFjdHVhbExlZnRYKCkgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgbmV3UmVsYXRpdmVUb3BYID0gdGhpcy5yZWxhdGl2ZVRvcFggLSB0aGlzLnVuaXRTaXplO1xuICAgICAgICB2YXIgbmV3T2NjdXBpZWRTcXVhcmVzID0gdGhpcy5vY2N1cGllZFNxdWFyZXMobmV3UmVsYXRpdmVUb3BYLCB0aGlzLlJlbGF0aXZlVG9wWSk7XG5cbiAgICAgICAgdmFyIGNhbk1vdmUgPSB0aGlzLmNoZWNrTW92YWJpbGl0eShuZXdPY2N1cGllZFNxdWFyZXMsIG9jY3VwaWVkQnlPdGhlcnMpO1xuXG4gICAgICAgIGlmKGNhbk1vdmUpIHtcbiAgICAgICAgICAgIHRoaXMucmVsYXRpdmVUb3BYID0gbmV3UmVsYXRpdmVUb3BYO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbW92ZVJpZ2h0KG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgaWYodGhpcy5hY3R1YWxSaWdodFgoKSA9PSB0aGlzLmFyZWEuaG9yaXpvbnRhbEJsb2NrcyAqIHRoaXMudW5pdFNpemUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXdSZWxhdGl2ZVRvcFggPSB0aGlzLnJlbGF0aXZlVG9wWCArIHRoaXMudW5pdFNpemU7XG4gICAgICAgIHZhciBuZXdPY2N1cGllZFNxdWFyZXMgPSB0aGlzLm9jY3VwaWVkU3F1YXJlcyhuZXdSZWxhdGl2ZVRvcFgsIHRoaXMuUmVsYXRpdmVUb3BZKTtcblxuICAgICAgICB2YXIgY2FuTW92ZSA9IHRoaXMuY2hlY2tNb3ZhYmlsaXR5KG5ld09jY3VwaWVkU3F1YXJlcywgb2NjdXBpZWRCeU90aGVycyk7XG5cbiAgICAgICAgaWYoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5yZWxhdGl2ZVRvcFggPSBuZXdSZWxhdGl2ZVRvcFg7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBtb3ZlRG93bihvY2N1cGllZEJ5T3RoZXJzKSB7XG4gICAgICAgIGlmKHRoaXMucmVsYXRpdmVUb3BZICsgdGhpcy5ibG9ja0hlaWdodCgpID09PSB0aGlzLmFyZWEudmVydGljYWxCbG9ja3MgKiB0aGlzLnVuaXRTaXplKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV3UmVsYXRpdmVUb3BZID0gdGhpcy5yZWxhdGl2ZVRvcFkgKyB0aGlzLnVuaXRTaXplO1xuICAgICAgICB2YXIgbmV3T2NjdXBpZWRTcXVhcmVzID0gdGhpcy5vY2N1cGllZFNxdWFyZXModGhpcy5yZWxhdGl2ZVRvcFgsIG5ld1JlbGF0aXZlVG9wWSk7XG5cbiAgICAgICAgdmFyIGNhbk1vdmUgPSB0aGlzLmNoZWNrTW92YWJpbGl0eShuZXdPY2N1cGllZFNxdWFyZXMsIG9jY3VwaWVkQnlPdGhlcnMpO1xuXG4gICAgICAgIGlmKGNhbk1vdmUpIHtcbiAgICAgICAgICAgIHRoaXMucmVsYXRpdmVUb3BZID0gbmV3UmVsYXRpdmVUb3BZO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBkcm9wKG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgdmFyIG5ld1JlbGF0aXZlVG9wWSA9IHRoaXMuYXJlYS52ZXJ0aWNhbEJsb2NrcyAqIHRoaXMudW5pdFNpemUgLSB0aGlzLm1hcmdpbkJvdHRvbSgpO1xuICAgICAgICB2YXIgd2FzRHJvcHBlZCA9IGZhbHNlO1xuICAgICAgICB3aGlsZSh0aGlzLm1vdmVEb3duKG9jY3VwaWVkQnlPdGhlcnMpKSB7IHdhc0Ryb3BwZWQgPSB0cnVlIH1cbiAgICAgICAgcmV0dXJuIHdhc0Ryb3BwZWQ7XG4gICAgfVxuICAgIGNoZWNrTW92YWJpbGl0eShuZXdPY2N1cGllZFNxdWFyZXMsIG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgdmFyIGNhbk1vdmUgPSB0cnVlO1xuXG4gICAgICAgIFNFQVJDSElORzpcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZXdPY2N1cGllZFNxdWFyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuZXdPY2N1cGllZCA9IG5ld09jY3VwaWVkU3F1YXJlc1tpXTsgLy8gdGhpcyBibG9jaydzIHdvdWxkLWJlIG9jY3VwaWVkIHNxdWFyZXNcblxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBvY2N1cGllZEJ5T3RoZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9jY3VwaWVkQnlBbm90aGVyQmxvY2sgPSBvY2N1cGllZEJ5T3RoZXJzW2pdO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBvY2N1cGllZEJ5QW5vdGhlckJsb2NrLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbmVPY2N1cGllZFNxdWFyZSA9IG9jY3VwaWVkQnlBbm90aGVyQmxvY2tba107XG5cbiAgICAgICAgICAgICAgICAgICAgaWYobmV3T2NjdXBpZWQueCA9PT0gb25lT2NjdXBpZWRTcXVhcmUueCAmJiBuZXdPY2N1cGllZC55ID09PSBvbmVPY2N1cGllZFNxdWFyZS55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5Nb3ZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhayBTRUFSQ0hJTkc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbk1vdmU7XG4gICAgICAgIFxuICAgIH1cbiAgICBibG9ja0hlaWdodCgpIHtcbiAgICAgICAgdmFyIG1heEZpbGxlZFkgPSB0aGlzLm1heEZpbGxlZFkoKTtcbiAgICAgICAgcmV0dXJuICgxICsgbWF4RmlsbGVkWSkgKiB0aGlzLnVuaXRTaXplO1xuICAgIH1cbiAgICBtYXJnaW5Cb3R0b20oZmlsbHMpIHtcbiAgICAgICAgdmFyIG1heEZpbGxlZFkgPSB0aGlzLm1heEZpbGxlZFkoZmlsbHMpO1xuICAgICAgICBjb25zb2xlLmxvZygnbWFyZ2luYm90dG9tOiAnICsgKDEgKyBtYXhGaWxsZWRZKSAqIHRoaXMudW5pdFNpemUpO1xuICAgICAgICByZXR1cm4gKDEgKyBtYXhGaWxsZWRZKSAqIHRoaXMudW5pdFNpemU7XG4gICAgfVxuICAgIG1heEZpbGxlZFkoZmlsbHMpIHtcbiAgICAgICAgdmFyIGZpbGxzVG9DaGVjayA9IGZpbGxzIHx8IHRoaXMuZmlsbHM7XG4gICAgICAgIHZhciBtYXhGaWxsZWRZID0gMDtcbiAgICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgZmlsbHNUb0NoZWNrLmxlbmd0aDsgcm93KyspIHtcbiAgICAgICAgICAgIHZhciBjZWxscyA9IGZpbGxzVG9DaGVja1tyb3ddLnNwbGl0KCcnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGNvbHVtbiA9IDA7IGNvbHVtbiA8PSAzOyBjb2x1bW4rKykge1xuICAgICAgICAgICAgICAgIGlmKGNlbGxzW2NvbHVtbl0gPT09ICcjJyAmJiByb3cgPiBtYXhGaWxsZWRZKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heEZpbGxlZFkgPSByb3c7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXhGaWxsZWRZO1xuICAgIH1cbiAgICB0b3BYKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVRvcFggKyB0aGlzLmFyZWEubGVmdDtcbiAgICB9XG4gICAgdG9wWSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVUb3BZICsgdGhpcy5hcmVhLnRvcDtcbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDw9IDM7IHJvd0luZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjZWxscyA9IHRoaXMuZmlsbHNbcm93SW5kZXhdLnNwbGl0KCcnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGNlbGxJbmRleCA9IDA7IGNlbGxJbmRleCA8PSAzOyBjZWxsSW5kZXgrKykge1xuXG4gICAgICAgICAgICAgICAgaWYoY2VsbHNbY2VsbEluZGV4XSA9PT0gJyMnICYmIHRoaXMucmVsYXRpdmVUb3BZICsgcm93SW5kZXggKiB0aGlzLnVuaXRTaXplID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QodGhpcy50b3BYKCkgKyBjZWxsSW5kZXggKiB0aGlzLnVuaXRTaXplLCB0aGlzLnRvcFkoKSArIHJvd0luZGV4ICogdGhpcy51bml0U2l6ZSwgdGhpcy51bml0U2l6ZSwgdGhpcy51bml0U2l6ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG9jY3VwaWVkU3F1YXJlcyhyZWxhdGl2ZVRvcFgsIHJlbGF0aXZlVG9wWSkge1xuICAgICAgICB2YXIgbG9jYWxSZWxhdGl2ZVRvcFggPSByZWxhdGl2ZVRvcFggfHwgdGhpcy5yZWxhdGl2ZVRvcFg7XG4gICAgICAgIHZhciBsb2NhbFJlbGF0aXZlVG9wWSA9IHJlbGF0aXZlVG9wWSB8fCB0aGlzLnJlbGF0aXZlVG9wWTtcbiAgICAgICAgdmFyIHhPcmlnaW4gPSBsb2NhbFJlbGF0aXZlVG9wWCAvIHRoaXMudW5pdFNpemU7XG4gICAgICAgIHZhciB5T3JpZ2luID0gbG9jYWxSZWxhdGl2ZVRvcFkgLyB0aGlzLnVuaXRTaXplO1xuXG4gICAgICAgIHZhciBvY2N1cGllZFNxdWFyZXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgdGhpcy5maWxscy5sZW5ndGg7IHJvd0luZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjZWxscyA9IHRoaXMuZmlsbHNbcm93SW5kZXhdLnNwbGl0KCcnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGNlbGxJbmRleCA9IDA7IGNlbGxJbmRleCA8PSAzOyBjZWxsSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGlmKGNlbGxzW2NlbGxJbmRleF0gPT09ICcjJyAmJiB0aGlzLnJlbGF0aXZlVG9wWSArIHJvd0luZGV4ICogdGhpcy51bml0U2l6ZSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9jY3VwaWVkU3F1YXJlcy5wdXNoKHsgeDogeE9yaWdpbiArIGNlbGxJbmRleCwgeTogeU9yaWdpbiArIHJvd0luZGV4IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2NjdXBpZWRTcXVhcmVzO1xuICAgIH1cbiAgICByZW1vdmVGcm9tUm93KHJvdykge1xuICAgICAgICB2YXIgb2NjdXBpZWRTcXVhcmVzID0gdGhpcy5vY2N1cGllZFNxdWFyZXMoKTtcbiAgICAgICAgdmFyIHlPcmlnaW4gPSB0aGlzLnJlbGF0aXZlVG9wWSAvIHRoaXMudW5pdFNpemU7XG4gICAgICAgIHZhciBmaWxsT2Zmc2V0ID0gcm93IC0geU9yaWdpbjtcbiAgICAgICAgdGhpcy5maWxsc1tmaWxsT2Zmc2V0XSA9ICctLS0tJztcblxuICAgICAgICB2YXIgbW92ZWRGaWxscyA9IHRydWU7XG4gICAgICAgIHdoaWxlKG1vdmVkRmlsbHMpIHtcbiAgICAgICAgICAgIG1vdmVkRmlsbHMgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZpbGxzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciByb3dGaWxsID0gdGhpcy5maWxsc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dEZpbGwgPSB0aGlzLmZpbGxzW2kgKyAxXTtcbiAgICAgICAgICAgICAgICBpZihyb3dGaWxsID09PSAnLS0tLScgJiYgbmV4dEZpbGwgIT09ICctLS0tJykge1xuICAgICAgICAgICAgICAgICAgICBtb3ZlZEZpbGxzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWxsc1tpXSA9IG5leHRGaWxsO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGxzW2kgKyAxXSA9IHJvd0ZpbGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0RmlsbEZvclR5cGVSb3RhdGlvbih0eXBlLCByb3RhdGlvbikge1xuICAgICAgICB2YXIgdHlwZVJvdGF0aW9ucyA9IHtcbiAgICAgICAgICAgIEk6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgSjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBMOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBPOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBTOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFQ6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgWjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyNfX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdHlwZVJvdGF0aW9uc1t0eXBlXVtyb3RhdGlvbl07XG4gICAgfVxuXG59XG4vKlxuKi8iXX0=;
define('components/tetris/round',['exports', 'knockout', './block'], function (exports, _knockout, _block) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var TetrisRound = (function () {
        function TetrisRound(params) {
            _classCallCheck(this, TetrisRound);

            this.ctx = params.ctx;
            this.unitSize = params.unitSize;
            this.area = params.area;
            this.level = _ko['default'].observable(params.level);
            this.blocksLeft = _ko['default'].observable(this.blockCountForLevel(this.level()));
            this.blocksDone = _ko['default'].observable(0);
            this.blocks = this.randomizeBlocks(this.blocksLeft());
            //      this.activeBlock().relativeTopY = 0;
            this.loopsPerStep = this.loopsPerStepForLevel(this.level());
            this.loopsSinceStep = 0;
            this.occupiedExceptActive = [];
            this.roundScore = _ko['default'].observable(0);
            this.hadCompletedRowsOnLastUpdate = 0;
            console.log(this);
        }

        _createClass(TetrisRound, [{
            key: 'blockCountForLevel',
            value: function blockCountForLevel(level) {
                return level == 1 ? 20 : level == 2 ? 25 : level == 3 ? 30 : 1;
            }
        }, {
            key: 'loopsPerStepForLevel',
            value: function loopsPerStepForLevel(level) {
                return level == 1 ? 10 : level == 2 ? 8 : level == 3 ? 6 : 1000;
            }
        }, {
            key: 'activeBlock',
            value: function activeBlock() {
                return this.blocks[this.blocksDone()];
            }
        }, {
            key: 'isRoundCompleted',
            value: function isRoundCompleted() {
                return this.blocksDone() === this.blocksLeft();
            }
        }, {
            key: 'increaseScoreWith',
            value: function increaseScoreWith(scoreIncrease) {
                this.roundScore(this.roundScore() + scoreIncrease);
            }
        }, {
            key: 'doneWithBlock',
            value: function doneWithBlock(wasDropped) {
                //this.activeBlock().relativeTopY = 0;
                this.blocksDone(this.blocksDone() + 1);
                this.increaseScoreWith(3 * this.level() + (wasDropped ? 21 : 3));
            }
        }, {
            key: 'giveScoreForClearedRows',
            value: function giveScoreForClearedRows(numberOfRows) {
                var groundScoreForNumberOfRows = {
                    0: 0,
                    1: 40,
                    2: 100,
                    3: 300,
                    4: 1200
                };
                this.roundScore(this.roundScore() + groundScoreForNumberOfRows[numberOfRows] * this.level());
            }
        }, {
            key: 'activeBlockRotate',
            value: function activeBlockRotate() {
                this.activeBlock().rotate(this.occupiedExceptActive);
            }
        }, {
            key: 'activeBlockMoveLeft',
            value: function activeBlockMoveLeft() {
                this.activeBlock().moveLeft(this.occupiedExceptActive);
            }
        }, {
            key: 'activeBlockMoveRight',
            value: function activeBlockMoveRight() {
                this.activeBlock().moveRight(this.occupiedExceptActive);
            }
        }, {
            key: 'activeBlockDrop',
            value: function activeBlockDrop() {
                this.activeBlock().drop(this.occupiedExceptActive);
                this.doneWithBlock(1);
            }
        }, {
            key: 'updateSquaresOccupiedByDroppedBlocks',
            value: function updateSquaresOccupiedByDroppedBlocks() {
                var allOccupiedSquares = [];

                OCCUPIED: for (var i = 0; i < this.blocksDone(); i++) {
                    allOccupiedSquares.push(this.blocks[i].occupiedSquares());
                }
                this.occupiedExceptActive = allOccupiedSquares;
            }
        }, {
            key: 'maybeTakeStep',
            value: function maybeTakeStep() {
                ++this.loopsSinceStep;
                if (this.loopsSinceStep > this.loopsPerStep) {
                    this.loopsSinceStep = 0;

                    var ableToMove = this.activeBlock().moveDown(this.occupiedExceptActive);
                    if (!ableToMove) {
                        this.doneWithBlock();
                    }
                }
            }
        }, {
            key: 'checkForCompletedRows',
            value: function checkForCompletedRows() {
                var completedRows = [];

                for (var row = 0; row < this.area.verticalBlocks; row++) {
                    var completedCells = 0;

                    for (var blockIndex = 0; blockIndex < this.occupiedExceptActive.length; blockIndex++) {
                        var block = this.occupiedExceptActive[blockIndex];

                        for (var squareIndex = 0; squareIndex < block.length; squareIndex++) {
                            var square = block[squareIndex];

                            if (square.y == row) {
                                completedCells = completedCells + 1;
                            }
                        }
                    }
                    if (completedCells === this.area.horizontalBlocks) {
                        completedRows.push(row);
                    }
                }

                if (completedRows.length > 0) {
                    this.giveScoreForClearedRows(completedRows.length);
                    this.handleCompletedRows(completedRows);
                }
                return completedRows.length > 0 ? true : false;
            }
        }, {
            key: 'update',
            value: function update() {
                if (!this.hadCompletedRowsOnLastUpdate) {
                    this.updateSquaresOccupiedByDroppedBlocks();
                    this.maybeTakeStep();
                    this.draw();
                    this.hadCompletedRowsOnLastUpdate = false;
                }
                var hadCompletedRows = this.checkForCompletedRows();
            }
        }, {
            key: 'draw',
            value: function draw() {
                for (var i = 0; i < this.blocks.length; i++) {
                    if (i > this.blocksDone()) {
                        continue;
                    }
                    this.blocks[i].draw();
                }
            }
        }, {
            key: 'handleCompletedRows',
            value: function handleCompletedRows(completedRows) {
                for (var rowIndex = 0; rowIndex < completedRows.length; rowIndex++) {
                    var row = completedRows[rowIndex];
                    this.ctx.fillStyle = '#fff';
                    for (var cellIndex = 0; cellIndex < this.area.horizontalBlocks; cellIndex++) {
                        this.ctx.fillRect(this.area.left + cellIndex * this.unitSize, this.area.top + row * this.unitSize, this.unitSize, this.unitSize);
                    }
                    for (var blockIndex = 0; blockIndex < this.blocksDone(); blockIndex++) {
                        var block = this.blocks[blockIndex];
                        block.removeFromRow(row);
                    }
                }

                var aBlockCouldDrop = true;
                while (aBlockCouldDrop) {
                    aBlockCouldDrop = false;

                    for (var blockIndex = 0; blockIndex < this.blocksDone(); blockIndex++) {
                        var occupiedExceptThis = this.allOccupiedSquaresExpectBlockIndex(blockIndex);
                        var block = this.blocks[blockIndex];
                        aBlockCouldDrop = block.drop(occupiedExceptThis);
                    }
                    console.log(aBlockCouldDrop);
                }
            }
        }, {
            key: 'allOccupiedSquaresExpectBlockIndex',
            value: function allOccupiedSquaresExpectBlockIndex(excpetBlockIndex) {
                var allOccupiedSquares = [];

                OCCUPIED: for (var i = 0; i < this.blocksDone(); i++) {
                    if (i === excpetBlockIndex) {
                        continue OCCUPIED;
                    }
                    allOccupiedSquares.push(this.blocks[i].occupiedSquares());
                }
                return allOccupiedSquares;
            }
        }, {
            key: 'randomizeBlocks',
            value: function randomizeBlocks(amount) {
                var blocks = [];
                var blockTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
                var rotation = [0, 1, 2, 3];
                for (var i = 1; i <= amount; i++) {
                    blocks.push(new _block.TetrisBlock({
                        type: blockTypes[Math.floor(Math.random() * blockTypes.length)],
                        rotation: rotation[Math.floor(Math.random() * rotation.length)],
                        unitSize: this.unitSize,
                        topY: -4 * this.unitSize,
                        ctx: this.ctx,
                        area: this.area
                    }));
                }
                console.log(blocks);
                return blocks;
            }
        }]);

        return TetrisRound;
    })();

    exports.TetrisRound = TetrisRound;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvcm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBR2EsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUN0QixnQkFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2hDLGdCQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDeEIsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsZUFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLGdCQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7O0FBRXRELGdCQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUM1RCxnQkFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDeEIsZ0JBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFDL0IsZ0JBQUksQ0FBQyxVQUFVLEdBQUcsZUFBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsZ0JBQUksQ0FBQyw0QkFBNEIsR0FBRyxDQUFDLENBQUM7QUFDdEMsbUJBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckI7O3FCQWhC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QUFDdkIsNEJBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUTtBQUN4QiwyQkFBRyxFQUFFLElBQUksQ0FBQyxHQUFHO0FBQ2IsNEJBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtxQkFDbEIsQ0FBQyxDQUFDLENBQUM7aUJBQ1A7QUFDRCx1QkFBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQix1QkFBTyxNQUFNLENBQUM7YUFDakI7OztlQXRNUSxXQUFXIiwiZmlsZSI6ImdzcmMvY29tcG9uZW50cy90ZXRyaXMvcm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuaW1wb3J0IHsgVGV0cmlzQmxvY2sgfSBmcm9tICcuL2Jsb2NrJztcblxuZXhwb3J0IGNsYXNzIFRldHJpc1JvdW5kIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5jdHggPSBwYXJhbXMuY3R4O1xuICAgICAgICB0aGlzLnVuaXRTaXplID0gcGFyYW1zLnVuaXRTaXplO1xuICAgICAgICB0aGlzLmFyZWEgPSBwYXJhbXMuYXJlYTtcbiAgICAgICAgdGhpcy5sZXZlbCA9IGtvLm9ic2VydmFibGUocGFyYW1zLmxldmVsKTtcbiAgICAgICAgdGhpcy5ibG9ja3NMZWZ0ID0ga28ub2JzZXJ2YWJsZSh0aGlzLmJsb2NrQ291bnRGb3JMZXZlbCh0aGlzLmxldmVsKCkpKTtcbiAgICAgICAgdGhpcy5ibG9ja3NEb25lID0ga28ub2JzZXJ2YWJsZSgwKTtcbiAgICAgICAgdGhpcy5ibG9ja3MgPSB0aGlzLnJhbmRvbWl6ZUJsb2Nrcyh0aGlzLmJsb2Nrc0xlZnQoKSk7XG4gIC8vICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLnJlbGF0aXZlVG9wWSA9IDA7XG4gICAgICAgIHRoaXMubG9vcHNQZXJTdGVwID0gdGhpcy5sb29wc1BlclN0ZXBGb3JMZXZlbCh0aGlzLmxldmVsKCkpO1xuICAgICAgICB0aGlzLmxvb3BzU2luY2VTdGVwID0gMDtcbiAgICAgICAgdGhpcy5vY2N1cGllZEV4Y2VwdEFjdGl2ZSA9IFtdO1xuICAgICAgICB0aGlzLnJvdW5kU2NvcmUgPSBrby5vYnNlcnZhYmxlKDApO1xuICAgICAgICB0aGlzLmhhZENvbXBsZXRlZFJvd3NPbkxhc3RVcGRhdGUgPSAwO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICB9XG4gICAgYmxvY2tDb3VudEZvckxldmVsKGxldmVsKSB7XG4gICAgICAgIHJldHVybiBsZXZlbCA9PSAxID8gMjBcbiAgICAgICAgICAgICA6IGxldmVsID09IDIgPyAyNVxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMyA/IDMwXG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgbG9vcHNQZXJTdGVwRm9yTGV2ZWwobGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuIGxldmVsID09IDEgPyAxMFxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMiA/IDhcbiAgICAgICAgICAgICA6IGxldmVsID09IDMgPyA2XG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgMTAwMFxuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2Nrc1t0aGlzLmJsb2Nrc0RvbmUoKV07XG4gICAgfVxuICAgIGlzUm91bmRDb21wbGV0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2Nrc0RvbmUoKSA9PT0gdGhpcy5ibG9ja3NMZWZ0KCk7XG4gICAgfVxuICAgIGluY3JlYXNlU2NvcmVXaXRoKHNjb3JlSW5jcmVhc2UpIHtcbiAgICAgICAgdGhpcy5yb3VuZFNjb3JlKHRoaXMucm91bmRTY29yZSgpICsgc2NvcmVJbmNyZWFzZSk7XG4gICAgfVxuICAgIGRvbmVXaXRoQmxvY2sod2FzRHJvcHBlZCkge1xuICAgICAgICAvL3RoaXMuYWN0aXZlQmxvY2soKS5yZWxhdGl2ZVRvcFkgPSAwO1xuICAgICAgICB0aGlzLmJsb2Nrc0RvbmUodGhpcy5ibG9ja3NEb25lKCkgKyAxKTtcbiAgICAgICAgdGhpcy5pbmNyZWFzZVNjb3JlV2l0aCgzICogdGhpcy5sZXZlbCgpICsgKHdhc0Ryb3BwZWQgPyAyMSA6IDMpKTtcbiAgICB9XG4gICAgZ2l2ZVNjb3JlRm9yQ2xlYXJlZFJvd3MobnVtYmVyT2ZSb3dzKSB7XG4gICAgICAgIHZhciBncm91bmRTY29yZUZvck51bWJlck9mUm93cyA9IHtcbiAgICAgICAgICAgIDA6ICAgIDAsXG4gICAgICAgICAgICAxOiAgIDQwLFxuICAgICAgICAgICAgMjogIDEwMCxcbiAgICAgICAgICAgIDM6ICAzMDAsXG4gICAgICAgICAgICA0OiAxMjAwLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJvdW5kU2NvcmUodGhpcy5yb3VuZFNjb3JlKCkgKyBncm91bmRTY29yZUZvck51bWJlck9mUm93c1tudW1iZXJPZlJvd3NdICogdGhpcy5sZXZlbCgpKTtcbiAgICB9XG5cbiAgICBhY3RpdmVCbG9ja1JvdGF0ZSgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLnJvdGF0ZSh0aGlzLm9jY3VwaWVkRXhjZXB0QWN0aXZlKTtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2tNb3ZlTGVmdCgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLm1vdmVMZWZ0KHRoaXMub2NjdXBpZWRFeGNlcHRBY3RpdmUpO1xuICAgIH1cbiAgICBhY3RpdmVCbG9ja01vdmVSaWdodCgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLm1vdmVSaWdodCh0aGlzLm9jY3VwaWVkRXhjZXB0QWN0aXZlKTtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2tEcm9wKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUJsb2NrKCkuZHJvcCh0aGlzLm9jY3VwaWVkRXhjZXB0QWN0aXZlKTtcbiAgICAgICAgdGhpcy5kb25lV2l0aEJsb2NrKDEpO1xuICAgIH1cblxuICAgIHVwZGF0ZVNxdWFyZXNPY2N1cGllZEJ5RHJvcHBlZEJsb2NrcygpIHtcbiAgICAgICAgdmFyIGFsbE9jY3VwaWVkU3F1YXJlcyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgT0NDVVBJRUQ6XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ibG9ja3NEb25lKCk7IGkrKykge1xuICAgICAgICAgICAgYWxsT2NjdXBpZWRTcXVhcmVzLnB1c2godGhpcy5ibG9ja3NbaV0ub2NjdXBpZWRTcXVhcmVzKCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2NjdXBpZWRFeGNlcHRBY3RpdmUgPSBhbGxPY2N1cGllZFNxdWFyZXM7XG4gICAgfVxuICAgIG1heWJlVGFrZVN0ZXAoKSB7XG4gICAgICAgICsrdGhpcy5sb29wc1NpbmNlU3RlcDtcbiAgICAgICAgaWYodGhpcy5sb29wc1NpbmNlU3RlcCA+IHRoaXMubG9vcHNQZXJTdGVwKSB7XG4gICAgICAgICAgICB0aGlzLmxvb3BzU2luY2VTdGVwID0gMDtcblxuICAgICAgICAgICAgdmFyIGFibGVUb01vdmUgPSB0aGlzLmFjdGl2ZUJsb2NrKCkubW92ZURvd24odGhpcy5vY2N1cGllZEV4Y2VwdEFjdGl2ZSk7XG4gICAgICAgICAgICBpZighYWJsZVRvTW92ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZG9uZVdpdGhCbG9jaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNoZWNrRm9yQ29tcGxldGVkUm93cygpIHtcbiAgICAgICAgdmFyIGNvbXBsZXRlZFJvd3MgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmFyZWEudmVydGljYWxCbG9ja3M7IHJvdysrKSB7XG4gICAgICAgICAgICB2YXIgY29tcGxldGVkQ2VsbHMgPSAwO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBibG9ja0luZGV4ID0gMDsgYmxvY2tJbmRleCA8IHRoaXMub2NjdXBpZWRFeGNlcHRBY3RpdmUubGVuZ3RoOyBibG9ja0luZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLm9jY3VwaWVkRXhjZXB0QWN0aXZlW2Jsb2NrSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgc3F1YXJlSW5kZXggPSAwOyBzcXVhcmVJbmRleCA8IGJsb2NrLmxlbmd0aDsgc3F1YXJlSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3F1YXJlID0gYmxvY2tbc3F1YXJlSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHNxdWFyZS55ID09IHJvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQ2VsbHMgPSBjb21wbGV0ZWRDZWxscyArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihjb21wbGV0ZWRDZWxscyA9PT0gdGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3MpIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRSb3dzLnB1c2gocm93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGNvbXBsZXRlZFJvd3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5naXZlU2NvcmVGb3JDbGVhcmVkUm93cyhjb21wbGV0ZWRSb3dzLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNvbXBsZXRlZFJvd3MoY29tcGxldGVkUm93cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlZFJvd3MubGVuZ3RoID4gMCA/IHRydWUgOiBmYWxzZTtcblxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYoIXRoaXMuaGFkQ29tcGxldGVkUm93c09uTGFzdFVwZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVTcXVhcmVzT2NjdXBpZWRCeURyb3BwZWRCbG9ja3MoKTtcbiAgICAgICAgICAgIHRoaXMubWF5YmVUYWtlU3RlcCgpO1xuICAgICAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgICAgICB0aGlzLmhhZENvbXBsZXRlZFJvd3NPbkxhc3RVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaGFkQ29tcGxldGVkUm93cyA9IHRoaXMuY2hlY2tGb3JDb21wbGV0ZWRSb3dzKCk7XG5cbiAgICB9XG4gICAgZHJhdygpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYoaSA+IHRoaXMuYmxvY2tzRG9uZSgpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJsb2Nrc1tpXS5kcmF3KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaGFuZGxlQ29tcGxldGVkUm93cyhjb21wbGV0ZWRSb3dzKSB7XG4gICAgICAgIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBjb21wbGV0ZWRSb3dzLmxlbmd0aDsgcm93SW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIHJvdyA9IGNvbXBsZXRlZFJvd3Nbcm93SW5kZXhdO1xuICAgICAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJyNmZmYnO1xuICAgICAgICAgICAgZm9yICh2YXIgY2VsbEluZGV4ID0gMDsgY2VsbEluZGV4IDwgdGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3M7IGNlbGxJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXJlYS5sZWZ0ICsgY2VsbEluZGV4ICogdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcmVhLnRvcCArIHJvdyAqIHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudW5pdFNpemVcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgYmxvY2tJbmRleCA9IDA7IGJsb2NrSW5kZXggPCB0aGlzLmJsb2Nrc0RvbmUoKTsgYmxvY2tJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJsb2NrID0gdGhpcy5ibG9ja3NbYmxvY2tJbmRleF07XG4gICAgICAgICAgICAgICAgYmxvY2sucmVtb3ZlRnJvbVJvdyhyb3cpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYUJsb2NrQ291bGREcm9wID0gdHJ1ZTtcbiAgICAgICAgd2hpbGUoYUJsb2NrQ291bGREcm9wKSB7XG4gICAgICAgICAgICBhQmxvY2tDb3VsZERyb3AgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgYmxvY2tJbmRleCA9IDA7IGJsb2NrSW5kZXggPCB0aGlzLmJsb2Nrc0RvbmUoKTsgYmxvY2tJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9jY3VwaWVkRXhjZXB0VGhpcyA9IHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzRXhwZWN0QmxvY2tJbmRleChibG9ja0luZGV4KTtcbiAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmJsb2Nrc1tibG9ja0luZGV4XTtcbiAgICAgICAgICAgICAgICBhQmxvY2tDb3VsZERyb3AgPSBibG9jay5kcm9wKG9jY3VwaWVkRXhjZXB0VGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhQmxvY2tDb3VsZERyb3ApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFsbE9jY3VwaWVkU3F1YXJlc0V4cGVjdEJsb2NrSW5kZXgoZXhjcGV0QmxvY2tJbmRleCkge1xuICAgICAgICB2YXIgYWxsT2NjdXBpZWRTcXVhcmVzID0gW107XG5cbiAgICAgICAgT0NDVVBJRUQ6XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ibG9ja3NEb25lKCk7IGkrKykge1xuICAgICAgICAgICAgaWYoaSA9PT0gZXhjcGV0QmxvY2tJbmRleCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlIE9DQ1VQSUVEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWxsT2NjdXBpZWRTcXVhcmVzLnB1c2godGhpcy5ibG9ja3NbaV0ub2NjdXBpZWRTcXVhcmVzKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxPY2N1cGllZFNxdWFyZXM7XG4gICAgfVxuXG4gICAgcmFuZG9taXplQmxvY2tzKGFtb3VudCkge1xuICAgICAgICB2YXIgYmxvY2tzID0gW107XG4gICAgICAgIHZhciBibG9ja1R5cGVzID0gWydJJywgJ0onLCAnTCcsICdPJywgJ1MnLCAnVCcsICdaJ107XG4gICAgICAgIHZhciByb3RhdGlvbiA9IFswLCAxLCAyLCAzXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gYW1vdW50OyBpKyspIHtcbiAgICAgICAgICAgIGJsb2Nrcy5wdXNoKG5ldyBUZXRyaXNCbG9jayh7XG4gICAgICAgICAgICAgICAgdHlwZTogYmxvY2tUeXBlc1sgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYmxvY2tUeXBlcy5sZW5ndGgpIF0sXG4gICAgICAgICAgICAgICAgcm90YXRpb246IHJvdGF0aW9uWyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByb3RhdGlvbi5sZW5ndGgpIF0sXG4gICAgICAgICAgICAgICAgdW5pdFNpemU6IHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgdG9wWTogLTQgKiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgIGN0eDogdGhpcy5jdHgsXG4gICAgICAgICAgICAgICAgYXJlYTogdGhpcy5hcmVhLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGJsb2Nrcyk7XG4gICAgICAgIHJldHVybiBibG9ja3M7XG4gICAgfVxuXG59Il19;
define('components/tetris/tetris',['exports', 'module', 'knockout', 'text!./tetris.html', './round', './block'], function (exports, module, _knockout, _textTetrisHtml, _round, _block) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var _templateMarkup = _interopRequireDefault(_textTetrisHtml);

    var Tetris = (function () {
        function Tetris(params) {
            var _this = this;

            _classCallCheck(this, Tetris);

            var $gameArea = $('#tetris-page canvas');
            $gameArea[0].width = window.innerWidth;
            $gameArea[0].height = window.innerHeight;

            this.canvasWidth = $gameArea.width();
            this.canvasHeight = $gameArea.height();
            this.ctx = $gameArea[0].getContext('2d');

            this.unitSize = 20;

            var horizontalBlocks = 10;
            var verticalBlocks = 20;
            this.area = {
                left: this.canvasWidth / 2 - this.unitSize * horizontalBlocks / 2,
                top: this.canvasHeight / 2 - this.unitSize * verticalBlocks / 2,
                right: this.canvasWidth / 2 + this.unitSize * horizontalBlocks,
                bottom: this.canvasHeight / 2 + this.unitSize * verticalBlocks,
                width: this.unitSize * horizontalBlocks,
                height: this.unitSize * verticalBlocks,
                horizontalBlocks: horizontalBlocks,
                verticalBlocks: verticalBlocks
            };
            console.log(this);

            this.round = new _round.TetrisRound({
                level: 1,
                unitSize: this.unitSize,
                ctx: this.ctx,
                area: this.area
            });
            this.totalScore = _ko['default'].observable(0);
            this.currentRoundScore = _ko['default'].observable(this.round.roundScore);

            $(document).keydown(function (e) {
                console.log('down key ' + e.which);
                if (e.which === 38) {
                    _this.round.activeBlockRotate();
                } else if (e.which === 37) {
                    _this.round.activeBlockMoveLeft();
                } else if (e.which === 39) {
                    _this.round.activeBlockMoveRight();
                } else if (e.which === 40) {
                    _this.round.activeBlockDrop();
                }
            });

            this.run();
        }

        _createClass(Tetris, [{
            key: 'draw',
            value: function draw() {
                this.ctx.clearRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = '#777';
                // game area
                this.ctx.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);

                // grid
                var c = this.ctx;
                for (var x = 1; x < this.area.horizontalBlocks; x++) {
                    c.beginPath();
                    c.moveTo(x * this.unitSize + this.area.left, this.area.top);
                    c.lineTo(x * this.unitSize + this.area.left, this.area.top + this.area.height);
                    c.strokeStyle = '#888';
                    c.stroke();
                    //for (var y = 0; y < this.area.verticalBlocks; y++) {
                    //}
                }
            }
        }, {
            key: 'run',
            value: function run() {
                this.draw();
                this.round.update();

                if (this.round.isRoundCompleted()) {
                    console.log('Done!');
                }
                var self = this;
                setTimeout(function () {
                    self.run();
                }, 25);
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                // This runs when the component is torn down. Put here any logic necessary to clean up,
                // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
            }
        }]);

        return Tetris;
    })();

    module.exports = { viewModel: Tetris, template: _templateMarkup['default'] };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFLTSxNQUFNO0FBQ0csaUJBRFQsTUFBTSxDQUNJLE1BQU0sRUFBRTs7O2tDQURsQixNQUFNOztBQUVKLGdCQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6QyxxQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLHFCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7O0FBRXpDLGdCQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkMsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFekMsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVuQixnQkFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsZ0JBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksR0FBRztBQUNSLG9CQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsR0FBRyxDQUFDO0FBQ2pFLG1CQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxjQUFjLEdBQUcsQ0FBQztBQUMvRCxxQkFBSyxFQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCO0FBQzlELHNCQUFNLEVBQUUsSUFB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R0FBRyxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEYscUJBQUMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBQ3ZCLHFCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7OztpQkFHZDthQUVKOzs7bUJBRUUsZUFBRztBQUNGLG9CQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWixvQkFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFcEIsb0JBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO0FBQzlCLDJCQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN4QjtBQUNELG9CQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsMEJBQVUsQ0FBQyxZQUFXO0FBQUUsd0JBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtpQkFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzdDOzs7bUJBRU0sbUJBQUc7OzthQUdUOzs7ZUF6RkMsTUFBTTs7O3FCQTRGRyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSw0QkFBZ0IsRUFBRSIsImZpbGUiOiJnc3JjL2NvbXBvbmVudHMvdGV0cmlzL3RldHJpcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5pbXBvcnQgdGVtcGxhdGVNYXJrdXAgZnJvbSAndGV4dCEuL3RldHJpcy5odG1sJztcbmltcG9ydCB7IFRldHJpc1JvdW5kIH0gZnJvbSAnLi9yb3VuZCc7XG5pbXBvcnQgeyBUZXRyaXNCbG9jayB9IGZyb20gJy4vYmxvY2snO1xuXG5jbGFzcyBUZXRyaXMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB2YXIgJGdhbWVBcmVhID0gJCgnI3RldHJpcy1wYWdlIGNhbnZhcycpO1xuICAgICAgICAkZ2FtZUFyZWFbMF0ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgJGdhbWVBcmVhWzBdLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgICAgICB0aGlzLmNhbnZhc1dpZHRoID0gJGdhbWVBcmVhLndpZHRoKCk7XG4gICAgICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gJGdhbWVBcmVhLmhlaWdodCgpO1xuICAgICAgICB0aGlzLmN0eCA9ICRnYW1lQXJlYVswXS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHRoaXMudW5pdFNpemUgPSAyMDtcblxuICAgICAgICB2YXIgaG9yaXpvbnRhbEJsb2NrcyA9IDEwO1xuICAgICAgICB2YXIgdmVydGljYWxCbG9ja3MgPSAyMDtcbiAgICAgICAgdGhpcy5hcmVhID0ge1xuICAgICAgICAgICAgbGVmdDogdGhpcy5jYW52YXNXaWR0aCAvIDIgLSB0aGlzLnVuaXRTaXplICogaG9yaXpvbnRhbEJsb2NrcyAvIDIsXG4gICAgICAgICAgICB0b3A6IHRoaXMuY2FudmFzSGVpZ2h0IC8gMiAtIHRoaXMudW5pdFNpemUgKiB2ZXJ0aWNhbEJsb2NrcyAvIDIsXG4gICAgICAgICAgICByaWdodDogdGhpcy5jYW52YXNXaWR0aCAvIDIgKyB0aGlzLnVuaXRTaXplICogaG9yaXpvbnRhbEJsb2NrcyxcbiAgICAgICAgICAgIGJvdHRvbTogdGhpcy5jYW52YXNIZWlnaHQgLyAyICsgdGhpcy51bml0U2l6ZSAqIHZlcnRpY2FsQmxvY2tzLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMudW5pdFNpemUgKiBob3Jpem9udGFsQmxvY2tzLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnVuaXRTaXplICogdmVydGljYWxCbG9ja3MsXG4gICAgICAgICAgICBob3Jpem9udGFsQmxvY2tzOiBob3Jpem9udGFsQmxvY2tzLFxuICAgICAgICAgICAgdmVydGljYWxCbG9ja3M6IHZlcnRpY2FsQmxvY2tzLFxuICAgICAgICB9O1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcblxuICAgICAgICB0aGlzLnJvdW5kID0gbmV3IFRldHJpc1JvdW5kKHtcbiAgICAgICAgICAgIGxldmVsOiAxLFxuICAgICAgICAgICAgdW5pdFNpemU6IHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICBjdHg6IHRoaXMuY3R4LFxuICAgICAgICAgICAgYXJlYTogdGhpcy5hcmVhLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50b3RhbFNjb3JlID0ga28ub2JzZXJ2YWJsZSgwKTtcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmRTY29yZSA9IGtvLm9ic2VydmFibGUodGhpcy5yb3VuZC5yb3VuZFNjb3JlKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5rZXlkb3duKChlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZG93biBrZXkgJyArIGUud2hpY2gpO1xuICAgICAgICAgICAgaWYoZS53aGljaCA9PT0gMzgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdW5kLmFjdGl2ZUJsb2NrUm90YXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGUud2hpY2ggPT09IDM3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3VuZC5hY3RpdmVCbG9ja01vdmVMZWZ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGUud2hpY2ggPT09IDM5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3VuZC5hY3RpdmVCbG9ja01vdmVSaWdodCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihlLndoaWNoID09PSA0MCkge1xuICAgICAgICAgICAgICAgIHRoaXMucm91bmQuYWN0aXZlQmxvY2tEcm9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBcbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnIzc3Nyc7XG4gICAgICAgIC8vIGdhbWUgYXJlYVxuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLmFyZWEubGVmdCwgdGhpcy5hcmVhLnRvcCwgdGhpcy5hcmVhLndpZHRoLCB0aGlzLmFyZWEuaGVpZ2h0KTtcblxuICAgICAgICAvLyBncmlkXG4gICAgICAgIHZhciBjID0gdGhpcy5jdHg7XG4gICAgICAgIGZvciAodmFyIHggPSAxOyB4IDwgdGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3M7IHgrKykge1xuICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGMubW92ZVRvKHggKiB0aGlzLnVuaXRTaXplICsgdGhpcy5hcmVhLmxlZnQsIHRoaXMuYXJlYS50b3ApO1xuICAgICAgICAgICAgYy5saW5lVG8oeCAqIHRoaXMudW5pdFNpemUgKyB0aGlzLmFyZWEubGVmdCwgdGhpcy5hcmVhLnRvcCAgKyB0aGlzLmFyZWEuaGVpZ2h0KTtcbiAgICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSAnIzg4OCc7XG4gICAgICAgICAgICBjLnN0cm9rZSgpO1xuICAgICAgICAgICAgLy9mb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuYXJlYS52ZXJ0aWNhbEJsb2NrczsgeSsrKSB7XG4gICAgICAgICAgICAvL31cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgdGhpcy5yb3VuZC51cGRhdGUoKTtcblxuICAgICAgICBpZih0aGlzLnJvdW5kLmlzUm91bmRDb21wbGV0ZWQoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RvbmUhJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzZWxmLnJ1bigpIH0sIDI1KTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICAvLyBUaGlzIHJ1bnMgd2hlbiB0aGUgY29tcG9uZW50IGlzIHRvcm4gZG93bi4gUHV0IGhlcmUgYW55IGxvZ2ljIG5lY2Vzc2FyeSB0byBjbGVhbiB1cCxcbiAgICAgICAgLy8gZm9yIGV4YW1wbGUgY2FuY2VsbGluZyBzZXRUaW1lb3V0cyBvciBkaXNwb3NpbmcgS25vY2tvdXQgc3Vic2NyaXB0aW9ucy9jb21wdXRlZHMuXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7IHZpZXdNb2RlbDogVGV0cmlzLCB0ZW1wbGF0ZTogdGVtcGxhdGVNYXJrdXAgfTtcbiJdfQ==;