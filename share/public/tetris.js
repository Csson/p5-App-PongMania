
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
            this.relativeTopY = params.topY || 0;
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

                while (this.moveDown(occupiedByOthers)) {}
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
                        if (cells[cellIndex] === '#') {
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
                        if (cells[cellIndex] === '#') {
                            occupiedSquares.push({ x: xOrigin + cellIndex, y: yOrigin + rowIndex });
                        }
                    }
                }
                return occupiedSquares;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDakQsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNoQyxnQkFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUNwRyxnQkFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FFdEU7Ozs7O3FCQVpRLFdBQVc7O21CQWFSLHdCQUFHO0FBQ1gsdUJBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLEdBQUcsU0FBUyxHQUM3QixJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsR0FBRyxTQUFTLEdBQzdCLElBQUksQ0FB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Q04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO2lCQUNKLENBQUM7QUFDRix1QkFBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDeEM7OztlQW5jUSxXQUFXIiwiZmlsZSI6ImdzcmMvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuXG5leHBvcnQgY2xhc3MgVGV0cmlzQmxvY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLmFyZWEgPSBwYXJhbXMuYXJlYTtcbiAgICAgICAgdGhpcy50eXBlID0gcGFyYW1zLnR5cGU7IC8vIEksIEosIEwsIE8sIFMsIFQsIFpcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHBhcmFtcy5yb3RhdGlvbjsgLy8gMCwgMSwgMiwgM1xuICAgICAgICB0aGlzLmNvbG9yID0gcGFyYW1zLmNvbG9yIHx8IHRoaXMuY29sb3JEZWZhdWx0KCk7XG4gICAgICAgIHRoaXMudW5pdFNpemUgPSBwYXJhbXMudW5pdFNpemU7XG4gICAgICAgIHRoaXMuY3R4ID0gcGFyYW1zLmN0eDtcbiAgICAgICAgdGhpcy5yZWxhdGl2ZVRvcFggPSBwYXJhbXMudG9wWCB8fCB0aGlzLnVuaXRTaXplICogTWF0aC5mbG9vcigodGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3MgLSAyKSAvIDIpO1xuICAgICAgICB0aGlzLnJlbGF0aXZlVG9wWSA9IHBhcmFtcy50b3BZIHx8IDA7XG4gICAgICAgIHRoaXMuZmlsbHMgPSB0aGlzLmdldEZpbGxGb3JUeXBlUm90YXRpb24odGhpcy50eXBlLCB0aGlzLnJvdGF0aW9uKTtcblxuICAgIH1cbiAgICBjb2xvckRlZmF1bHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09ICdJJyA/ICcjMDBmZmZmJ1xuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnSicgPyAnIzAwMDBmZidcbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ0wnID8gJyNmZmFhMDAnXG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdPJyA/ICcjZmZmZjAwJ1xuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnUycgPyAnIzAwZGRiYidcbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ1QnID8gJyM5OTAwZmYnXG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdaJyA/ICcjZmYwMDAwJ1xuICAgICAgICAgICAgIDogICAgICAgICAgICAgICAgICAgICAnI2ZmZidcbiAgICAgICAgICAgICA7XG4gICAgfVxuICAgIGFjdHVhbExlZnRYKGZpbGxzKSB7XG4gICAgICAgIHZhciBmaWxsc1RvQ2hlY2sgPSBmaWxscyB8fCB0aGlzLmZpbGxzO1xuICAgICAgICB2YXIgbWluRmlsbGVkWCA9IDM7XG4gICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGZpbGxzVG9DaGVjay5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgICAgICB2YXIgY2VsbHMgPSBmaWxsc1RvQ2hlY2tbcm93XS5zcGxpdCgnJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPD0gMzsgY29sdW1uKyspIHtcbiAgICAgICAgICAgICAgICBpZihjZWxsc1tjb2x1bW5dID09PSAnIycgJiYgY29sdW1uIDwgbWluRmlsbGVkWCkge1xuICAgICAgICAgICAgICAgICAgICBtaW5GaWxsZWRYID0gY29sdW1uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVRvcFggKyBtaW5GaWxsZWRYICogdGhpcy51bml0U2l6ZTtcbiAgICB9XG4gICAgYWN0dWFsUmlnaHRYKGZpbGxzKSB7XG4gICAgICAgIHZhciBmaWxsc1RvQ2hlY2sgPSBmaWxscyB8fCB0aGlzLmZpbGxzO1xuICAgICAgICB2YXIgbWF4RmlsbGVkWCA9IDA7XG4gICAgICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IGZpbGxzVG9DaGVjay5sZW5ndGg7IHJvdysrKSB7XG4gICAgICAgICAgICB2YXIgY2VsbHMgPSBmaWxsc1RvQ2hlY2tbcm93XS5zcGxpdCgnJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBjb2x1bW4gPSAwOyBjb2x1bW4gPD0gMzsgY29sdW1uKyspIHtcbiAgICAgICAgICAgICAgICBpZihjZWxsc1tjb2x1bW5dID09PSAnIycgJiYgY29sdW1uID4gbWF4RmlsbGVkWCkge1xuICAgICAgICAgICAgICAgICAgICBtYXhGaWxsZWRYID0gY29sdW1uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVRvcFggKyAoMSArIG1heEZpbGxlZFgpICogdGhpcy51bml0U2l6ZTtcbiAgICB9XG4gICAgZG9Sb3RhdGUobmV3Um90YXRpb24pIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IG5ld1JvdGF0aW9uO1xuICAgICAgICB0aGlzLmZpbGxzID0gdGhpcy5nZXRGaWxsRm9yVHlwZVJvdGF0aW9uKHRoaXMudHlwZSwgbmV3Um90YXRpb24pO1xuICAgIH1cbiAgICByb3RhdGUob2NjdXBpZWRCeU90aGVycykge1xuICAgICAgICB2YXIgbmV4dFJvdGF0aW9uO1xuICAgICAgICBpZih0aGlzLnJvdGF0aW9uICsgMSA+IDMpIHtcbiAgICAgICAgICAgIG5leHRSb3RhdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLnJvdGF0aW9uICsgMSA8IDApIHtcbiAgICAgICAgICAgIG5leHRSb3RhdGlvbiA9IDM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBuZXh0Um90YXRpb24gPSB0aGlzLnJvdGF0aW9uICsgMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzaW1CbG9jayA9IG5ldyBUZXRyaXNCbG9jayhPYmplY3QuYXNzaWduKHt9LCB0aGlzKSk7XG4gICAgICAgIHNpbUJsb2NrLnJlbGF0aXZlVG9wWCA9IHRoaXMucmVsYXRpdmVUb3BYO1xuICAgICAgICBzaW1CbG9jay5yZWxhdGl2ZVRvcFkgPSB0aGlzLnJlbGF0aXZlVG9wWTtcbiAgICAgICAgc2ltQmxvY2suZG9Sb3RhdGUobmV4dFJvdGF0aW9uKTtcblxuICAgICAgICB2YXIgcm90YXRlZE9rID0gdHJ1ZTtcbiAgICAgICAgdmFyIHNob3VsZE1vdmVSaWdodCA9IGZhbHNlO1xuICAgICAgICB2YXIgc2hvdWxkTW92ZUxlZnQgPSBmYWxzZTtcblxuICAgICAgICAvLyBDYW4gd2Ugd2FsbCBraWNrIHRvIHRoZSByaWdodD9cbiAgICAgICAgaWYoc2ltQmxvY2suYWN0dWFsTGVmdFgoKSA8IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaG91bGRtb3ZlcmlnaHQnKTtcbiAgICAgICAgICAgIHNob3VsZE1vdmVSaWdodCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCFzaW1CbG9jay5tb3ZlUmlnaHQob2NjdXBpZWRCeU90aGVycykpIHtcbiAgICAgICAgICAgICAgICByb3RhdGVkT2sgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyB3YWxsIGtpY2sgdG8gdGhlIGxlZnQ/XG4gICAgICAgIGVsc2UgaWYoc2ltQmxvY2suYWN0dWFsUmlnaHRYKCkgPiBzaW1CbG9jay5hcmVhLmhvcml6b250YWxCbG9ja3MgKiBzaW1CbG9jay51bml0U2l6ZSkge1xuICAgICAgICAgICAgc2hvdWxkTW92ZUxlZnQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZighc2ltQmxvY2subW92ZUxlZnQob2NjdXBpZWRCeU90aGVycykpIHtcbiAgICAgICAgICAgICAgICByb3RhdGVkT2sgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSBvdmVybGFwIGFub3RoZXIgYmxvY2ssIHRyeSBtb3ZpbmcgbGVmdC9yaWdodFxuICAgICAgICBlbHNlIGlmKCFzaW1CbG9jay5jaGVja01vdmFiaWxpdHkoc2ltQmxvY2sub2NjdXBpZWRTcXVhcmVzKCksIG9jY3VwaWVkQnlPdGhlcnMpKSB7XG4gICAgICAgICAgICBpZihzaW1CbG9jay5hY3R1YWxMZWZ0WCgpID4gc2ltQmxvY2sudW5pdFNpemUpIHtcbiAgICAgICAgICAgICAgICBzaG91bGRNb3ZlUmlnaHQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgaWYoIXNpbUJsb2NrLm1vdmVSaWdodChvY2N1cGllZEJ5T3RoZXJzKSkge1xuICAgICAgICAgICAgICAgICAgICByb3RhdGVkT2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHNpbUJsb2NrLmFjdHVhbFJpZ2h0WCgpIDwgc2ltQmxvY2suYXJlYS5ob3Jpem9udGFsQmxvY2tzICogc2ltQmxvY2sudW5pdFNpemUgLSBzaW1CbG9jay51bml0U2l6ZSkge1xuICAgICAgICAgICAgICAgIHNob3VsZE1vdmVMZWZ0ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGlmKCFzaW1CbG9jay5tb3ZlTGVmdChvY2N1cGllZEJ5T3RoZXJzKSkge1xuICAgICAgICAgICAgICAgICAgICByb3RhdGVkT2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3RhdGVkT2sgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHJvdGF0ZWRPaykge1xuICAgICAgICAgICAgaWYoc2hvdWxkTW92ZVJpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlUmlnaHQob2NjdXBpZWRCeU90aGVycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHNob3VsZE1vdmVMZWZ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlTGVmdChvY2N1cGllZEJ5T3RoZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZG9Sb3RhdGUobmV4dFJvdGF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBtb3ZlTGVmdChvY2N1cGllZEJ5T3RoZXJzKSB7XG4gICAgICAgIGlmKHRoaXMuYWN0dWFsTGVmdFgoKSA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBuZXdSZWxhdGl2ZVRvcFggPSB0aGlzLnJlbGF0aXZlVG9wWCAtIHRoaXMudW5pdFNpemU7XG4gICAgICAgIHZhciBuZXdPY2N1cGllZFNxdWFyZXMgPSB0aGlzLm9jY3VwaWVkU3F1YXJlcyhuZXdSZWxhdGl2ZVRvcFgsIHRoaXMuUmVsYXRpdmVUb3BZKTtcblxuICAgICAgICB2YXIgY2FuTW92ZSA9IHRoaXMuY2hlY2tNb3ZhYmlsaXR5KG5ld09jY3VwaWVkU3F1YXJlcywgb2NjdXBpZWRCeU90aGVycyk7XG5cbiAgICAgICAgaWYoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5yZWxhdGl2ZVRvcFggPSBuZXdSZWxhdGl2ZVRvcFg7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBtb3ZlUmlnaHQob2NjdXBpZWRCeU90aGVycykge1xuICAgICAgICBpZih0aGlzLmFjdHVhbFJpZ2h0WCgpID09IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzICogdGhpcy51bml0U2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5ld1JlbGF0aXZlVG9wWCA9IHRoaXMucmVsYXRpdmVUb3BYICsgdGhpcy51bml0U2l6ZTtcbiAgICAgICAgdmFyIG5ld09jY3VwaWVkU3F1YXJlcyA9IHRoaXMub2NjdXBpZWRTcXVhcmVzKG5ld1JlbGF0aXZlVG9wWCwgdGhpcy5SZWxhdGl2ZVRvcFkpO1xuXG4gICAgICAgIHZhciBjYW5Nb3ZlID0gdGhpcy5jaGVja01vdmFiaWxpdHkobmV3T2NjdXBpZWRTcXVhcmVzLCBvY2N1cGllZEJ5T3RoZXJzKTtcblxuICAgICAgICBpZihjYW5Nb3ZlKSB7XG4gICAgICAgICAgICB0aGlzLnJlbGF0aXZlVG9wWCA9IG5ld1JlbGF0aXZlVG9wWDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIG1vdmVEb3duKG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgaWYodGhpcy5yZWxhdGl2ZVRvcFkgKyB0aGlzLmJsb2NrSGVpZ2h0KCkgPT09IHRoaXMuYXJlYS52ZXJ0aWNhbEJsb2NrcyAqIHRoaXMudW5pdFNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXdSZWxhdGl2ZVRvcFkgPSB0aGlzLnJlbGF0aXZlVG9wWSArIHRoaXMudW5pdFNpemU7XG4gICAgICAgIHZhciBuZXdPY2N1cGllZFNxdWFyZXMgPSB0aGlzLm9jY3VwaWVkU3F1YXJlcyh0aGlzLnJlbGF0aXZlVG9wWCwgbmV3UmVsYXRpdmVUb3BZKTtcblxuICAgICAgICB2YXIgY2FuTW92ZSA9IHRoaXMuY2hlY2tNb3ZhYmlsaXR5KG5ld09jY3VwaWVkU3F1YXJlcywgb2NjdXBpZWRCeU90aGVycyk7XG5cbiAgICAgICAgaWYoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5yZWxhdGl2ZVRvcFkgPSBuZXdSZWxhdGl2ZVRvcFk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIGRyb3Aob2NjdXBpZWRCeU90aGVycykge1xuICAgICAgICB2YXIgbmV3UmVsYXRpdmVUb3BZID0gdGhpcy5hcmVhLnZlcnRpY2FsQmxvY2tzICogdGhpcy51bml0U2l6ZSAtIHRoaXMubWFyZ2luQm90dG9tKCk7XG5cbiAgICAgICAgd2hpbGUodGhpcy5tb3ZlRG93bihvY2N1cGllZEJ5T3RoZXJzKSkge31cbiAgICB9XG4gICAgY2hlY2tNb3ZhYmlsaXR5KG5ld09jY3VwaWVkU3F1YXJlcywgb2NjdXBpZWRCeU90aGVycykge1xuICAgICAgICB2YXIgY2FuTW92ZSA9IHRydWU7XG5cbiAgICAgICAgU0VBUkNISU5HOlxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5ld09jY3VwaWVkU3F1YXJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld09jY3VwaWVkID0gbmV3T2NjdXBpZWRTcXVhcmVzW2ldOyAvLyB0aGlzIGJsb2NrJ3Mgd291bGQtYmUgb2NjdXBpZWQgc3F1YXJlc1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG9jY3VwaWVkQnlPdGhlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb2NjdXBpZWRCeUFub3RoZXJCbG9jayA9IG9jY3VwaWVkQnlPdGhlcnNbal07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IG9jY3VwaWVkQnlBbm90aGVyQmxvY2subGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9uZU9jY3VwaWVkU3F1YXJlID0gb2NjdXBpZWRCeUFub3RoZXJCbG9ja1trXTtcblxuICAgICAgICAgICAgICAgICAgICBpZihuZXdPY2N1cGllZC54ID09PSBvbmVPY2N1cGllZFNxdWFyZS54ICYmIG5ld09jY3VwaWVkLnkgPT09IG9uZU9jY3VwaWVkU3F1YXJlLnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbk1vdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrIFNFQVJDSElORztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FuTW92ZTtcbiAgICAgICAgXG4gICAgfVxuICAgIGJsb2NrSGVpZ2h0KCkge1xuICAgICAgICB2YXIgbWF4RmlsbGVkWSA9IHRoaXMubWF4RmlsbGVkWSgpO1xuICAgICAgICByZXR1cm4gKDEgKyBtYXhGaWxsZWRZKSAqIHRoaXMudW5pdFNpemU7XG4gICAgfVxuICAgIG1hcmdpbkJvdHRvbShmaWxscykge1xuICAgICAgICB2YXIgbWF4RmlsbGVkWSA9IHRoaXMubWF4RmlsbGVkWShmaWxscyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtYXJnaW5ib3R0b206ICcgKyAoMSArIG1heEZpbGxlZFkpICogdGhpcy51bml0U2l6ZSk7XG4gICAgICAgIHJldHVybiAoMSArIG1heEZpbGxlZFkpICogdGhpcy51bml0U2l6ZTtcbiAgICB9XG4gICAgbWF4RmlsbGVkWShmaWxscykge1xuICAgICAgICB2YXIgZmlsbHNUb0NoZWNrID0gZmlsbHMgfHwgdGhpcy5maWxscztcbiAgICAgICAgdmFyIG1heEZpbGxlZFkgPSAwO1xuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCBmaWxsc1RvQ2hlY2subGVuZ3RoOyByb3crKykge1xuICAgICAgICAgICAgdmFyIGNlbGxzID0gZmlsbHNUb0NoZWNrW3Jvd10uc3BsaXQoJycpO1xuICAgICAgICAgICAgZm9yICh2YXIgY29sdW1uID0gMDsgY29sdW1uIDw9IDM7IGNvbHVtbisrKSB7XG4gICAgICAgICAgICAgICAgaWYoY2VsbHNbY29sdW1uXSA9PT0gJyMnICYmIHJvdyA+IG1heEZpbGxlZFkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4RmlsbGVkWSA9IHJvdztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1heEZpbGxlZFk7XG4gICAgfVxuICAgIHRvcFgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbGF0aXZlVG9wWCArIHRoaXMuYXJlYS5sZWZ0O1xuICAgIH1cbiAgICB0b3BZKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVRvcFkgKyB0aGlzLmFyZWEudG9wO1xuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPD0gMzsgcm93SW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIGNlbGxzID0gdGhpcy5maWxsc1tyb3dJbmRleF0uc3BsaXQoJycpO1xuICAgICAgICAgICAgZm9yICh2YXIgY2VsbEluZGV4ID0gMDsgY2VsbEluZGV4IDw9IDM7IGNlbGxJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgaWYoY2VsbHNbY2VsbEluZGV4XSA9PT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMudG9wWCgpICsgY2VsbEluZGV4ICogdGhpcy51bml0U2l6ZSwgdGhpcy50b3BZKCkgKyByb3dJbmRleCAqIHRoaXMudW5pdFNpemUsIHRoaXMudW5pdFNpemUsIHRoaXMudW5pdFNpemUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBvY2N1cGllZFNxdWFyZXMocmVsYXRpdmVUb3BYLCByZWxhdGl2ZVRvcFkpIHtcbiAgICAgICAgdmFyIGxvY2FsUmVsYXRpdmVUb3BYID0gcmVsYXRpdmVUb3BYIHx8IHRoaXMucmVsYXRpdmVUb3BYO1xuICAgICAgICB2YXIgbG9jYWxSZWxhdGl2ZVRvcFkgPSByZWxhdGl2ZVRvcFkgfHwgdGhpcy5yZWxhdGl2ZVRvcFk7XG4gICAgICAgIHZhciB4T3JpZ2luID0gbG9jYWxSZWxhdGl2ZVRvcFggLyB0aGlzLnVuaXRTaXplO1xuICAgICAgICB2YXIgeU9yaWdpbiA9IGxvY2FsUmVsYXRpdmVUb3BZIC8gdGhpcy51bml0U2l6ZTtcblxuICAgICAgICB2YXIgb2NjdXBpZWRTcXVhcmVzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgcm93SW5kZXggPSAwOyByb3dJbmRleCA8IHRoaXMuZmlsbHMubGVuZ3RoOyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgY2VsbHMgPSB0aGlzLmZpbGxzW3Jvd0luZGV4XS5zcGxpdCgnJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBjZWxsSW5kZXggPSAwOyBjZWxsSW5kZXggPD0gMzsgY2VsbEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICBpZihjZWxsc1tjZWxsSW5kZXhdID09PSAnIycpIHtcbiAgICAgICAgICAgICAgICAgICAgb2NjdXBpZWRTcXVhcmVzLnB1c2goeyB4OiB4T3JpZ2luICsgY2VsbEluZGV4LCB5OiB5T3JpZ2luICsgcm93SW5kZXggfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvY2N1cGllZFNxdWFyZXM7XG4gICAgfVxuXG4gICAgZ2V0RmlsbEZvclR5cGVSb3RhdGlvbih0eXBlLCByb3RhdGlvbikge1xuICAgICAgICB2YXIgdHlwZVJvdGF0aW9ucyA9IHtcbiAgICAgICAgICAgIEk6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgSjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBMOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBPOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBTOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFQ6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgWjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyNfX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdHlwZVJvdGF0aW9uc1t0eXBlXVtyb3RhdGlvbl07XG4gICAgfVxuXG59XG4vKlxuKi8iXX0=;
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
            this.activeBlock().relativeTopY = 0;
            this.loopsPerStep = this.loopsPerStepForLevel(this.level());
            this.loopsSinceStep = 0;
            this.occupiedExceptActive = [];
            this.roundScore = _ko['default'].observable(0);
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
            key: 'increaseScoreWith',
            value: function increaseScoreWith(scoreIncrease) {
                this.roundScore(this.roundScore() + scoreIncrease);
            }
        }, {
            key: 'doneWithBlock',
            value: function doneWithBlock(wasDropped) {
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
                this.activeBlock().relativeTopY = 0;
            }
        }, {
            key: 'updateSquaresOccupiedByDroppedBlocks',
            value: function updateSquaresOccupiedByDroppedBlocks() {
                var allOccupiedSquares = [];

                OCCUPIED: for (var i = 0; i < this.blocks.length; i++) {
                    if (this.blocks[i] === this.activeBlock()) {
                        break OCCUPIED;
                    } else if (this.blocks[i].relativeTopY >= 0) {
                        allOccupiedSquares.push(this.blocks[i].occupiedSquares());
                    }
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
                            //   console.log(square.y, row);
                            if (square.y == row) {
                                completedCells = completedCells + 1;
                            }
                        }
                    }
                    if (completedCells === this.area.horizontalBlocks) {
                        completedRows.push(row);
                    }
                }
                this.giveScoreForClearedRows(completedRows.length);
            }
        }, {
            key: 'update',
            value: function update() {
                this.updateSquaresOccupiedByDroppedBlocks();
                this.maybeTakeStep();
                this.checkForCompletedRows();
            }
        }, {
            key: 'draw',
            value: function draw() {
                for (var i = 0; i < this.blocks.length; i++) {
                    if (i > this.blocksDone()) {
                        continue;
                    }
                    if (this.blocks[i].relativeTopY >= 0) {
                        this.blocks[i].draw();
                    }
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvcm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBR2EsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUN0QixnQkFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2hDLGdCQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDeEIsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsZUFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLGdCQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDdEQsZ0JBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLGdCQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUM1RCxnQkFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDeEIsZ0JBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFDL0IsZ0JBQUksQ0FBQyxVQUFVLEdBQUcsZUFBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsbUJBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckI7O3FCQWZRLFdBQVc7O21CQWdCRiw0QkFBQyxLQUFLLEVBQUU7QUFDdEIsdUJBQU8sS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQ0YsQ0FBQyxDQUNmO2FBQ1Q7OzttQkFDbUIsOEJBQUMsS0FBSyxFQUFFO0FBQ3hCLHVCQUFPLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUNmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUNkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUNELElBQUksQ0FDbEI7YUFDVDs7O21CQUNVLHVCQUFHO0FBQ1YsdUJBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzthQUN6Qzs7O21CQUNnQiwyQkFBQyxhQUFhLEVBQUU7QUFDN0Isb0JBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLGFBQWEsQ0FBQyxDQUFDO2FBQ3REOzs7bUJBQ1ksdUJBQUMsVUFBVSxFQUFFO0FBQ3RCLG9CQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxvQkFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFDLENBQUM7YUFDcEU7OzttQkFDc0IsaUNBQUMsWUFBWSxFQUFFO0FBQ2xDLG9CQUFJLDBCQUEwQixHQUFHO0FBQzdCLHFCQUFDLEVBQUssQ0FBQztBQUNQLHFCQUFDLEVBQUksRUFBRTtBQUNQLHFCQUFDLEVBQUcsR0FBRztBQUNQLHFCQUFDLEVBQUcsR0FBRztBQUNQLHFCQUFDLEVBQUUsSUFBSTtpQkFDVixDQUFDO0FBQ0Ysb0JBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ2hHOzs7bUJBRWdCLDZCQUFHO0FBQ2hCLG9CQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQ3hEOzs7bUJBQ2tCLCtCQUFHO0FBQ2xCLG9CQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQzFEOzs7bUJBQ21CLGdDQUFHO0FBQ25CLG9CQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQzNEOzs7bUJBQ2MsMkJBQUc7QUFDZCxvQkFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUNuRCxvQkFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QixvQkFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7YUFDdkM7OzttQkFFbUMsZ0RBQUc7QUFDbkMsb0JBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDOztBQUU1Qix3QkFBUSxFQUNSLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6Qyx3QkFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUN0Qyw4QkFBTSxRQUFRLENBQUM7cUJBQ2xCLE1BQ0ksSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxDQUFDLEVBQUU7QUFDdEMsMENBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztxQkFDN0Q7aUJBQ0o7QUFDRCxvQkFBSSxDQUFDLG9CQUFvQixHQUFHLGtCQUFrQixDQUFDO2FBQ2xEOzs7bUJBQ1kseUJBQUc7QUFDWixrQkFBRSxJQUFJLENBQUMsY0FBYyxDQUFDO0FBQ3RCLG9CQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRTtBQUN4Qyx3QkFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7O0FBRXhCLHdCQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3hFLHdCQUFHLENBQUMsVUFBVSxFQUFFO0FBQ1osNEJBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztxQkFDeEI7aUJBQ0o7YUFDSjs7O21CQUNvQixpQ0FBRztBQUNwQixvQkFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDOztBQUV2QixxQkFBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRSxFQUFFO0FBQ3JELHdCQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7O0FBRXZCLHlCQUFLLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRSxVQUFVLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRTtBQUNsRiw0QkFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVsRCw2QkFBSyxJQUFJLFdBQVcsR0FBRyxDQUFDLEVBQUUsV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUU7QUFDakUsZ0NBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFaEMsZ0NBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUU7QUFDaEIsOENBQWMsR0FBRyxjQUFjLEdBQUcsQ0FBQyxDQUFDOzZCQUN2Qzt5QkFDSjtxQkFDSjtBQUNELHdCQUFHLGNBQWMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQzlDLHFDQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUMzQjtpQkFDSjtBQUNELG9CQUFJLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBRXREOzs7bUJBRUssa0JBQUc7QUFDTCxvQkFBSSxDQUFDLG9DQUFvQyxFQUFFLENBQUM7QUFDNUMsb0JBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUNyQixvQkFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7YUFFaEM7OzttQkFDRyxnQkFBRztBQUNILHFCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsd0JBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUN0QixpQ0FBUztxQkFDWjtBQUNELHdCQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsRUFBRTtBQUNqQyw0QkFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztxQkFDekI7aUJBQ0o7YUFDSjs7O21CQUVjLHlCQUFDLE1BQU0sRUFBRTtBQUNwQixvQkFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLG9CQUFJLFVBQVUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JELG9CQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVCLHFCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlCLDBCQUFNLENBQUMsSUFBSSxDQUFDLFdBNUlmLFdBQVcsQ0E0SW9CO0FBQ3hCLDRCQUFJLEVBQUUsVUFBVSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBRTtBQUNqRSxnQ0FBUSxFQUFFLFFBQVEsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUU7QUFDakUsZ0NBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2Qiw0QkFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRO0FBQ3hCLDJCQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDYiw0QkFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO3FCQUNsQixDQUFDLENBQUMsQ0FBQztpQkFDUDtBQUNELHVCQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLHVCQUFPLE1BQU0sQ0FBQzthQUNqQjs7O2VBckpRLFdBQVciLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL3RldHJpcy9yb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5pbXBvcnQgeyBUZXRyaXNCbG9jayB9IGZyb20gJy4vYmxvY2snO1xuXG5leHBvcnQgY2xhc3MgVGV0cmlzUm91bmQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLmN0eCA9IHBhcmFtcy5jdHg7XG4gICAgICAgIHRoaXMudW5pdFNpemUgPSBwYXJhbXMudW5pdFNpemU7XG4gICAgICAgIHRoaXMuYXJlYSA9IHBhcmFtcy5hcmVhO1xuICAgICAgICB0aGlzLmxldmVsID0ga28ub2JzZXJ2YWJsZShwYXJhbXMubGV2ZWwpO1xuICAgICAgICB0aGlzLmJsb2Nrc0xlZnQgPSBrby5vYnNlcnZhYmxlKHRoaXMuYmxvY2tDb3VudEZvckxldmVsKHRoaXMubGV2ZWwoKSkpO1xuICAgICAgICB0aGlzLmJsb2Nrc0RvbmUgPSBrby5vYnNlcnZhYmxlKDApO1xuICAgICAgICB0aGlzLmJsb2NrcyA9IHRoaXMucmFuZG9taXplQmxvY2tzKHRoaXMuYmxvY2tzTGVmdCgpKTtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLnJlbGF0aXZlVG9wWSA9IDA7XG4gICAgICAgIHRoaXMubG9vcHNQZXJTdGVwID0gdGhpcy5sb29wc1BlclN0ZXBGb3JMZXZlbCh0aGlzLmxldmVsKCkpO1xuICAgICAgICB0aGlzLmxvb3BzU2luY2VTdGVwID0gMDtcbiAgICAgICAgdGhpcy5vY2N1cGllZEV4Y2VwdEFjdGl2ZSA9IFtdO1xuICAgICAgICB0aGlzLnJvdW5kU2NvcmUgPSBrby5vYnNlcnZhYmxlKDApO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICB9XG4gICAgYmxvY2tDb3VudEZvckxldmVsKGxldmVsKSB7XG4gICAgICAgIHJldHVybiBsZXZlbCA9PSAxID8gMjBcbiAgICAgICAgICAgICA6IGxldmVsID09IDIgPyAyNVxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMyA/IDMwXG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgbG9vcHNQZXJTdGVwRm9yTGV2ZWwobGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuIGxldmVsID09IDEgPyAxMFxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMiA/IDhcbiAgICAgICAgICAgICA6IGxldmVsID09IDMgPyA2XG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgMTAwMFxuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2Nrc1t0aGlzLmJsb2Nrc0RvbmUoKV07XG4gICAgfVxuICAgIGluY3JlYXNlU2NvcmVXaXRoKHNjb3JlSW5jcmVhc2UpIHtcbiAgICAgICAgdGhpcy5yb3VuZFNjb3JlKHRoaXMucm91bmRTY29yZSgpICsgc2NvcmVJbmNyZWFzZSk7XG4gICAgfVxuICAgIGRvbmVXaXRoQmxvY2sod2FzRHJvcHBlZCkge1xuICAgICAgICB0aGlzLmJsb2Nrc0RvbmUodGhpcy5ibG9ja3NEb25lKCkgKyAxKTtcbiAgICAgICAgdGhpcy5pbmNyZWFzZVNjb3JlV2l0aCgzICogdGhpcy5sZXZlbCgpICsgKHdhc0Ryb3BwZWQgPyAyMSA6IDMpKTtcbiAgICB9XG4gICAgZ2l2ZVNjb3JlRm9yQ2xlYXJlZFJvd3MobnVtYmVyT2ZSb3dzKSB7XG4gICAgICAgIHZhciBncm91bmRTY29yZUZvck51bWJlck9mUm93cyA9IHtcbiAgICAgICAgICAgIDA6ICAgIDAsXG4gICAgICAgICAgICAxOiAgIDQwLFxuICAgICAgICAgICAgMjogIDEwMCxcbiAgICAgICAgICAgIDM6ICAzMDAsXG4gICAgICAgICAgICA0OiAxMjAwLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJvdW5kU2NvcmUodGhpcy5yb3VuZFNjb3JlKCkgKyBncm91bmRTY29yZUZvck51bWJlck9mUm93c1tudW1iZXJPZlJvd3NdICogdGhpcy5sZXZlbCgpKTtcbiAgICB9XG5cbiAgICBhY3RpdmVCbG9ja1JvdGF0ZSgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLnJvdGF0ZSh0aGlzLm9jY3VwaWVkRXhjZXB0QWN0aXZlKTtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2tNb3ZlTGVmdCgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLm1vdmVMZWZ0KHRoaXMub2NjdXBpZWRFeGNlcHRBY3RpdmUpO1xuICAgIH1cbiAgICBhY3RpdmVCbG9ja01vdmVSaWdodCgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLm1vdmVSaWdodCh0aGlzLm9jY3VwaWVkRXhjZXB0QWN0aXZlKTtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2tEcm9wKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUJsb2NrKCkuZHJvcCh0aGlzLm9jY3VwaWVkRXhjZXB0QWN0aXZlKTtcbiAgICAgICAgdGhpcy5kb25lV2l0aEJsb2NrKDEpO1xuICAgICAgICB0aGlzLmFjdGl2ZUJsb2NrKCkucmVsYXRpdmVUb3BZID0gMDtcbiAgICB9XG5cbiAgICB1cGRhdGVTcXVhcmVzT2NjdXBpZWRCeURyb3BwZWRCbG9ja3MoKSB7XG4gICAgICAgIHZhciBhbGxPY2N1cGllZFNxdWFyZXMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIE9DQ1VQSUVEOlxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZih0aGlzLmJsb2Nrc1tpXSA9PT0gdGhpcy5hY3RpdmVCbG9jaygpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWsgT0NDVVBJRUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKHRoaXMuYmxvY2tzW2ldLnJlbGF0aXZlVG9wWSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgYWxsT2NjdXBpZWRTcXVhcmVzLnB1c2godGhpcy5ibG9ja3NbaV0ub2NjdXBpZWRTcXVhcmVzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub2NjdXBpZWRFeGNlcHRBY3RpdmUgPSBhbGxPY2N1cGllZFNxdWFyZXM7XG4gICAgfVxuICAgIG1heWJlVGFrZVN0ZXAoKSB7XG4gICAgICAgICsrdGhpcy5sb29wc1NpbmNlU3RlcDtcbiAgICAgICAgaWYodGhpcy5sb29wc1NpbmNlU3RlcCA+IHRoaXMubG9vcHNQZXJTdGVwKSB7XG4gICAgICAgICAgICB0aGlzLmxvb3BzU2luY2VTdGVwID0gMDtcblxuICAgICAgICAgICAgdmFyIGFibGVUb01vdmUgPSB0aGlzLmFjdGl2ZUJsb2NrKCkubW92ZURvd24odGhpcy5vY2N1cGllZEV4Y2VwdEFjdGl2ZSk7XG4gICAgICAgICAgICBpZighYWJsZVRvTW92ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZG9uZVdpdGhCbG9jaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNoZWNrRm9yQ29tcGxldGVkUm93cygpIHtcbiAgICAgICAgdmFyIGNvbXBsZXRlZFJvd3MgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciByb3cgPSAwOyByb3cgPCB0aGlzLmFyZWEudmVydGljYWxCbG9ja3M7IHJvdysrKSB7XG4gICAgICAgICAgICB2YXIgY29tcGxldGVkQ2VsbHMgPSAwO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBibG9ja0luZGV4ID0gMDsgYmxvY2tJbmRleCA8IHRoaXMub2NjdXBpZWRFeGNlcHRBY3RpdmUubGVuZ3RoOyBibG9ja0luZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLm9jY3VwaWVkRXhjZXB0QWN0aXZlW2Jsb2NrSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgc3F1YXJlSW5kZXggPSAwOyBzcXVhcmVJbmRleCA8IGJsb2NrLmxlbmd0aDsgc3F1YXJlSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3F1YXJlID0gYmxvY2tbc3F1YXJlSW5kZXhdO1xuICAgICAgICAgICAgICAgICAvLyAgIGNvbnNvbGUubG9nKHNxdWFyZS55LCByb3cpO1xuICAgICAgICAgICAgICAgICAgICBpZihzcXVhcmUueSA9PSByb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZENlbGxzID0gY29tcGxldGVkQ2VsbHMgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoY29tcGxldGVkQ2VsbHMgPT09IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVkUm93cy5wdXNoKHJvdyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5naXZlU2NvcmVGb3JDbGVhcmVkUm93cyhjb21wbGV0ZWRSb3dzLmxlbmd0aCk7XG5cbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlU3F1YXJlc09jY3VwaWVkQnlEcm9wcGVkQmxvY2tzKCk7XG4gICAgICAgIHRoaXMubWF5YmVUYWtlU3RlcCgpO1xuICAgICAgICB0aGlzLmNoZWNrRm9yQ29tcGxldGVkUm93cygpO1xuXG4gICAgfVxuICAgIGRyYXcoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ibG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKGkgPiB0aGlzLmJsb2Nrc0RvbmUoKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYodGhpcy5ibG9ja3NbaV0ucmVsYXRpdmVUb3BZID49IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrc1tpXS5kcmF3KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByYW5kb21pemVCbG9ja3MoYW1vdW50KSB7XG4gICAgICAgIHZhciBibG9ja3MgPSBbXTtcbiAgICAgICAgdmFyIGJsb2NrVHlwZXMgPSBbJ0knLCAnSicsICdMJywgJ08nLCAnUycsICdUJywgJ1onXTtcbiAgICAgICAgdmFyIHJvdGF0aW9uID0gWzAsIDEsIDIsIDNdO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBhbW91bnQ7IGkrKykge1xuICAgICAgICAgICAgYmxvY2tzLnB1c2gobmV3IFRldHJpc0Jsb2NrKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBibG9ja1R5cGVzWyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBibG9ja1R5cGVzLmxlbmd0aCkgXSxcbiAgICAgICAgICAgICAgICByb3RhdGlvbjogcm90YXRpb25bIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHJvdGF0aW9uLmxlbmd0aCkgXSxcbiAgICAgICAgICAgICAgICB1bml0U2l6ZTogdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgICAgICB0b3BZOiAtNCAqIHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgY3R4OiB0aGlzLmN0eCxcbiAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLmFyZWEsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYmxvY2tzKTtcbiAgICAgICAgcmV0dXJuIGJsb2NrcztcbiAgICB9XG5cbn0iXX0=;
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

            this.unitSize = 14;

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
                this.round.draw();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFLTSxNQUFNO0FBQ0csaUJBRFQsTUFBTSxDQUNJLE1BQU0sRUFBRTs7O2tDQURsQixNQUFNOztBQUVKLGdCQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6QyxxQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLHFCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7O0FBRXpDLGdCQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkMsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFekMsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVuQixnQkFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsZ0JBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksR0FBRztBQUNSLG9CQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsR0FBRyxDQUFDO0FBQ2pFLG1CQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxjQUFjLEdBQUcsQ0FBQztBQUMvRCxxQkFBSyxFQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCO0FBQzlELHNCQUFNLEVBQUUsSUFB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R0FBRyxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEYscUJBQUMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBQ3ZCLHFCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7OztpQkFHZDthQUVKOzs7bUJBRUUsZUFBRztBQUNGLG9CQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWixvQkFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNwQixvQkFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQixvQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLDBCQUFVLENBQUMsWUFBVztBQUFFLHdCQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7aUJBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUM3Qzs7O21CQUVNLG1CQUFHOzs7YUFHVDs7O2VBdEZDLE1BQU07OztxQkF5RkcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsNEJBQWdCLEVBQUUiLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL3RldHJpcy90ZXRyaXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuaW1wb3J0IHRlbXBsYXRlTWFya3VwIGZyb20gJ3RleHQhLi90ZXRyaXMuaHRtbCc7XG5pbXBvcnQgeyBUZXRyaXNSb3VuZCB9IGZyb20gJy4vcm91bmQnO1xuaW1wb3J0IHsgVGV0cmlzQmxvY2sgfSBmcm9tICcuL2Jsb2NrJztcblxuY2xhc3MgVGV0cmlzIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdmFyICRnYW1lQXJlYSA9ICQoJyN0ZXRyaXMtcGFnZSBjYW52YXMnKTtcbiAgICAgICAgJGdhbWVBcmVhWzBdLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICRnYW1lQXJlYVswXS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jYW52YXNXaWR0aCA9ICRnYW1lQXJlYS53aWR0aCgpO1xuICAgICAgICB0aGlzLmNhbnZhc0hlaWdodCA9ICRnYW1lQXJlYS5oZWlnaHQoKTtcbiAgICAgICAgdGhpcy5jdHggPSAkZ2FtZUFyZWFbMF0uZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB0aGlzLnVuaXRTaXplID0gMTQ7XG5cbiAgICAgICAgdmFyIGhvcml6b250YWxCbG9ja3MgPSAxMDtcbiAgICAgICAgdmFyIHZlcnRpY2FsQmxvY2tzID0gMjA7XG4gICAgICAgIHRoaXMuYXJlYSA9IHtcbiAgICAgICAgICAgIGxlZnQ6IHRoaXMuY2FudmFzV2lkdGggLyAyIC0gdGhpcy51bml0U2l6ZSAqIGhvcml6b250YWxCbG9ja3MgLyAyLFxuICAgICAgICAgICAgdG9wOiB0aGlzLmNhbnZhc0hlaWdodCAvIDIgLSB0aGlzLnVuaXRTaXplICogdmVydGljYWxCbG9ja3MgLyAyLFxuICAgICAgICAgICAgcmlnaHQ6IHRoaXMuY2FudmFzV2lkdGggLyAyICsgdGhpcy51bml0U2l6ZSAqIGhvcml6b250YWxCbG9ja3MsXG4gICAgICAgICAgICBib3R0b206IHRoaXMuY2FudmFzSGVpZ2h0IC8gMiArIHRoaXMudW5pdFNpemUgKiB2ZXJ0aWNhbEJsb2NrcyxcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnVuaXRTaXplICogaG9yaXpvbnRhbEJsb2NrcyxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy51bml0U2l6ZSAqIHZlcnRpY2FsQmxvY2tzLFxuICAgICAgICAgICAgaG9yaXpvbnRhbEJsb2NrczogaG9yaXpvbnRhbEJsb2NrcyxcbiAgICAgICAgICAgIHZlcnRpY2FsQmxvY2tzOiB2ZXJ0aWNhbEJsb2NrcyxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG5cbiAgICAgICAgdGhpcy5yb3VuZCA9IG5ldyBUZXRyaXNSb3VuZCh7XG4gICAgICAgICAgICBsZXZlbDogMSxcbiAgICAgICAgICAgIHVuaXRTaXplOiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgY3R4OiB0aGlzLmN0eCxcbiAgICAgICAgICAgIGFyZWE6IHRoaXMuYXJlYSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudG90YWxTY29yZSA9IGtvLm9ic2VydmFibGUoMCk7XG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kU2NvcmUgPSBrby5vYnNlcnZhYmxlKHRoaXMucm91bmQucm91bmRTY29yZSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkua2V5ZG93bigoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Rvd24ga2V5ICcgKyBlLndoaWNoKTtcbiAgICAgICAgICAgIGlmKGUud2hpY2ggPT09IDM4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3VuZC5hY3RpdmVCbG9ja1JvdGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihlLndoaWNoID09PSAzNykge1xuICAgICAgICAgICAgICAgIHRoaXMucm91bmQuYWN0aXZlQmxvY2tNb3ZlTGVmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihlLndoaWNoID09PSAzOSkge1xuICAgICAgICAgICAgICAgIHRoaXMucm91bmQuYWN0aXZlQmxvY2tNb3ZlUmlnaHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gNDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdW5kLmFjdGl2ZUJsb2NrRHJvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJ1bigpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJyM3NzcnO1xuICAgICAgICAvLyBnYW1lIGFyZWFcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QodGhpcy5hcmVhLmxlZnQsIHRoaXMuYXJlYS50b3AsIHRoaXMuYXJlYS53aWR0aCwgdGhpcy5hcmVhLmhlaWdodCk7XG5cbiAgICAgICAgLy8gZ3JpZFxuICAgICAgICB2YXIgYyA9IHRoaXMuY3R4O1xuICAgICAgICBmb3IgKHZhciB4ID0gMTsgeCA8IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzOyB4KyspIHtcbiAgICAgICAgICAgIGMuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjLm1vdmVUbyh4ICogdGhpcy51bml0U2l6ZSArIHRoaXMuYXJlYS5sZWZ0LCB0aGlzLmFyZWEudG9wKTtcbiAgICAgICAgICAgIGMubGluZVRvKHggKiB0aGlzLnVuaXRTaXplICsgdGhpcy5hcmVhLmxlZnQsIHRoaXMuYXJlYS50b3AgICsgdGhpcy5hcmVhLmhlaWdodCk7XG4gICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gJyM4ODgnO1xuICAgICAgICAgICAgYy5zdHJva2UoKTtcbiAgICAgICAgICAgIC8vZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmFyZWEudmVydGljYWxCbG9ja3M7IHkrKykge1xuICAgICAgICAgICAgLy99XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgIHRoaXMucm91bmQudXBkYXRlKCk7XG4gICAgICAgIHRoaXMucm91bmQuZHJhdygpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHNlbGYucnVuKCkgfSwgMjUpO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIC8vIFRoaXMgcnVucyB3aGVuIHRoZSBjb21wb25lbnQgaXMgdG9ybiBkb3duLiBQdXQgaGVyZSBhbnkgbG9naWMgbmVjZXNzYXJ5IHRvIGNsZWFuIHVwLFxuICAgICAgICAvLyBmb3IgZXhhbXBsZSBjYW5jZWxsaW5nIHNldFRpbWVvdXRzIG9yIGRpc3Bvc2luZyBLbm9ja291dCBzdWJzY3JpcHRpb25zL2NvbXB1dGVkcy5cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgdmlld01vZGVsOiBUZXRyaXMsIHRlbXBsYXRlOiB0ZW1wbGF0ZU1hcmt1cCB9O1xuIl19;