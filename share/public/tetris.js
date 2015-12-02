
define('text!components/tetris/tetris.html',[],function () { return '<div id="tetris-page">\n    <canvas class="full"></canvas>\n</div>\n<div id="scorer">\n    <div>\n        <h2>score</h2>\n        <p data-bind="text: score"></p>\n    </div>\n    <div>\n        <h2>level</h2>\n        <p data-bind="text: level"></p>\n    </div>\n    <div>\n        <h2>completed rows</h2>\n        <p data-bind="text: completedRows"></p>\n    </div>\n</div>\n';});

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
            this.originSquare = params.originSquare; // { x: ?, y: ? }
            this.occupies = this.getOccupation(this.rotation);
        }

        _createClass(TetrisBlock, [{
            key: 'clone',
            value: function clone() {
                var clone = new TetrisBlock(Object.assign({}, this));
                clone.originSquare = this.copyArray(this.originSquare);
                clone.area = this.copyArray(this.area);
                clone.occupies = this.copyArray(this.occupies);
                return clone;
            }
        }, {
            key: 'move',
            value: function move(direction, occupiedByOthers) {
                var steps = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

                if (direction !== 'down' && direction !== 'left' && direction !== 'right') {
                    console.log('Bad argument to block.move()');
                }
                var changeXBy = direction === 'left' ? -steps : direction === 'right' ? steps : 0;

                var changeYBy = direction === 'down' ? steps : 0;
                var newOccupies = this.copyArray(this.occupies);

                for (var i = 0; i < newOccupies.length; i++) {
                    newOccupies[i].x = newOccupies[i].x + changeXBy;
                    newOccupies[i].y = newOccupies[i].y + changeYBy;
                }

                var couldMove = true;
                for (var i = 0; i < newOccupies.length; i++) {
                    if (!this.isWithinExtendedArea(newOccupies[i])) {
                        couldMove = false;
                    }
                }
                couldMove = couldMove ? this.checkOverlap(newOccupies, occupiedByOthers) : false;

                if (couldMove) {
                    this.originSquare.x = this.originSquare.x + changeXBy;
                    this.originSquare.y = this.originSquare.y + changeYBy;
                    this.occupies = newOccupies.slice();
                }

                return couldMove;
            }
        }, {
            key: 'drop',
            value: function drop(occupiedByOthers) {
                var numberOfDowns = 0;
                while (this.move('down', occupiedByOthers)) {
                    numberOfDowns++;
                }
                return numberOfDowns;
            }
        }, {
            key: 'rotate',
            value: function rotate(occupiedByOthers) {
                var nextRotation = this.rotation + 1 > 3 ? 0 : this.rotation + 1;
                var clone = this.clone();
                clone.rotation = nextRotation;
                clone.occupies = clone.getOccupation(clone.rotation);

                var nextOccupation = this.getOccupation(nextRotation);

                var allAreWithin = true;
                var minimumX = clone.area.horizontalBlocks;
                var maximumX = 0;
                var maximumY = 0;

                clone.occupies.map(function (occupiedSquare) {
                    minimumX = occupiedSquare.x < minimumX ? occupiedSquare.x : minimumX;
                    maximumX = occupiedSquare.x > maximumX ? occupiedSquare.x : maximumX;
                    maximumY = occupiedSquare.x > maximumY ? occupiedSquare.y : maximumY;
                    if (!clone.isWithinExtendedArea(occupiedSquare)) {
                        allAreWithin = false;
                    }
                });

                var rotationOk = true;
                if (!allAreWithin) {
                    if (minimumX < 1) {
                        rotationOk = clone.move('right', occupiedByOthers, Math.abs(minimumX) + 1);
                    } else if (maximumX > clone.area.horizontalBlocks) {
                        rotationOk = clone.move('left', occupiedByOthers, maximumX - clone.area.horizontalBlocks);
                    } else if (maximumY > clone.area.verticalBlocks) {
                        rotationOk = false;
                    }
                }
                rotationOk = rotationOk ? this.checkOverlap(clone.occupies, occupiedByOthers) : false;

                if (rotationOk) {
                    this.occupies = clone.copyArray(clone.occupies);
                    this.rotation = clone.rotation;
                }
            }
        }, {
            key: 'withEachOccupiedSquare',
            value: function withEachOccupiedSquare(doThis) {
                for (var i = 0; i < this.occupies.length; i++) {
                    doThis(this.occupies[i]);
                }
            }

            // extended area includes the hidden squares above the visible top
        }, {
            key: 'isWithinExtendedArea',
            value: function isWithinExtendedArea(occupiedSquare) {
                return occupiedSquare.x >= 1 && occupiedSquare.x <= this.area.horizontalBlocks && occupiedSquare.y >= -4 && occupiedSquare.y <= this.area.verticalBlocks ? true : false;
            }
        }, {
            key: 'isWithinArea',
            value: function isWithinArea(occupiedSquare) {
                return occupiedSquare.x >= 1 && occupiedSquare.x <= this.area.horizontalBlocks && occupiedSquare.y >= 1 && occupiedSquare.y <= this.area.verticalBlocks ? true : false;
            }
        }, {
            key: 'checkOverlap',
            value: function checkOverlap(oneBlockOccupy, occupiedByOthers) {
                for (var i = 0; i < oneBlockOccupy.length; i++) {
                    var square = oneBlockOccupy[i];

                    for (var j = 0; j < occupiedByOthers.length; j++) {
                        var otherBlock = occupiedByOthers[j];

                        for (var k = 0; k < otherBlock.length; k++) {
                            otherSquare = otherBlock[k];

                            if (square.x === otherSquare.x && square.y === otherSquare.y) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
        }, {
            key: 'draw',
            value: function draw() {
                var _this = this;

                this.ctx.fillStyle = this.color.main;
                this.occupies.map(function (occupiedSquare) {
                    if (_this.isWithinArea(occupiedSquare)) {
                        var topX = 0.5 + _this.area.left + (occupiedSquare.x - 1) * _this.unitSize;
                        var topY = 0.5 + _this.area.top + (occupiedSquare.y - 1) * _this.unitSize;
                        _this.ctx.fillRect(topX, topY, _this.unitSize - 1, _this.unitSize - 1);
                        _this.drawLine(1, _this.color.lighter, topX, topY, _this.unitSize - 1, 0);
                        _this.drawLine(1, _this.color.lighter, topX, topY, 0, _this.unitSize - 1);
                        _this.drawLine(1, _this.color.darker, topX, topY + _this.unitSize - 1, _this.unitSize - 1, 0);
                        _this.drawLine(1, _this.color.darker, topX + _this.unitSize - 1, topY, 0, _this.unitSize - 1);
                    }
                });

                for (var i = 0; i < this.occupies.length; i++) {

                    var first = this.occupies[i];
                    if (!this.isWithinArea(first)) {
                        continue;
                    }
                    for (var j = i + 1; j < this.occupies.length; j++) {

                        var second = this.occupies[j];
                        if (!this.isWithinArea(second)) {
                            continue;
                        }

                        var startX = this.area.left + (first.x - 1) * this.unitSize + this.unitSize / 2;
                        var startY = this.area.top + (first.y - 1) * this.unitSize + this.unitSize / 2;

                        if (first.x === second.x && first.y !== second.y) {
                            var direction = first.y < second.y ? 1 : -1;
                            this.drawLine(5, this.color.darker, startX, startY, 0, direction * this.unitSize);
                        } else if (first.x !== second.x && first.y === second.y) {
                            var direction = first.x < second.x ? 1 : -1;
                            this.drawLine(5, this.color.darker, startX, startY, direction * this.unitSize, 0);
                        }
                    }
                }
            }
        }, {
            key: 'drawShadow',
            value: function drawShadow(occupiedByOthers) {
                var clone = this.clone();
                clone.color = { main: '#666666', lighter: '#777777', darker: '#5f5f5f' };
                clone.drop(occupiedByOthers);
                clone.draw();
            }
        }, {
            key: 'removeFromRows',
            value: function removeFromRows(rows) {

                var newOccupies = [];
                var uniqueOccupiedRows = [];

                for (var j = 0; j < this.occupies.length; j++) {
                    var square = this.occupies[j];
                    var rowToBeDeleted = false;

                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];

                        if (square.y === row) {
                            rowToBeDeleted = true;
                        }
                    }

                    if (!rowToBeDeleted) {
                        newOccupies.push(square);

                        if (uniqueOccupiedRows[-1] !== square.y) {
                            uniqueOccupiedRows.push(square.y);
                        }
                    }
                }

                var newBlock = null;
                if (uniqueOccupiedRows.length > 1) {

                    thisNewOccupies = [];
                    newBlockOccupies = [];

                    var blockSplitsOn = null;
                    for (var i = 1; i < uniqueOccupiedRows.length; i++) {
                        if (uniqueOccupiedRows[i] - uniqueOccupiedRows[i - 1] > 1) {
                            blockSplitsOn = uniqueOccupiedRows[i] - 1;
                        }
                    }
                    if (blockSplitsOn) {
                        for (var i = 0; i < newOccupies.length; i++) {
                            var square = newOccupies[i];
                            if (square.y < blockSplitsOn) {
                                thisNewOccupies.push(square);
                            } else {
                                newBlockOccupies.push(square);
                            }
                        }

                        this.occupies = this.copyArray(thisNewOccupies);
                        newBlock = this.clone();
                        newBlock.occupies = this.copyArray(newBlockOccupies);
                    } else {
                        this.occupies = this.copyArray(newOccupies);
                    }
                } else {
                    this.occupies = this.copyArray(newOccupies);
                }
                return newBlock;
            }
        }, {
            key: 'getOccupation',
            value: function getOccupation(rotation) {
                var newOccupies = [];

                var fills = this.getFillForTypeRotation(rotation);

                for (var rowIndex = 0; rowIndex < fills.length; rowIndex++) {
                    var cells = fills[rowIndex].split('');
                    for (var cellIndex = 0; cellIndex <= cells.length; cellIndex++) {

                        if (cells[cellIndex] === '#') {
                            newOccupies.push({
                                x: this.originSquare.x + cellIndex,
                                y: this.originSquare.y + rowIndex
                            });
                        }
                    }
                }
                return newOccupies;
            }
        }, {
            key: 'drawLine',
            value: function drawLine(lineWidth, color, fromX, fromY, lengthX, lengthY) {
                this.ctx.lineWidth = lineWidth;
                this.ctx.lineCap = 'round';
                this.ctx.strokeStyle = color;
                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(fromX + lengthX, fromY + lengthY);
                this.ctx.stroke();
            }
        }, {
            key: 'colorDefault',
            value: function colorDefault() {
                return this.type === 'I' ? { main: '#22dddd', lighter: '#55ffff', darker: '#00bbbb' } : this.type === 'J' ? { main: '#2a64db', lighter: '#4c86fd', darker: '#0842d9' } : this.type === 'L' ? { main: '#dd8822', lighter: '#ffaa55', darker: '#bb6600' } : this.type === 'O' ? { main: '#dddd22', lighter: '#ffff55', darker: '#bbbb00' } : this.type === 'S' ? { main: '#22bb88', lighter: '#55ddaa', darker: '#009966' } : this.type === 'T' ? { main: '#b934db', lighter: '#db56fd', darker: '#9712b9' } : this.type === 'Z' ? { main: '#dd2222', lighter: '#ff5555', darker: '#bb0000' } : { main: '#ffffff', lighter: '#ffffff', darker: '#000000' };
            }
        }, {
            key: 'getFillForTypeRotation',
            value: function getFillForTypeRotation(rotation) {
                var typeRotations = {
                    I: [['_#__', '_#__', '_#__', '_#__'], ['____', '####', '____', '____'], ['__#_', '__#_', '__#_', '__#_'], ['____', '____', '####', '____']],
                    J: [['_#__', '_#__', '##__', '____'], ['#___', '###_', '____', '____'], ['_##_', '_#__', '_#__', '____'], ['____', '###_', '__#_', '____']],
                    L: [['_#__', '_#__', '_##_', '____'], ['____', '###_', '#___', '____'], ['##__', '_#__', '_#__', '____'], ['__#_', '###_', '____', '____']],
                    O: [['_##_', '_##_', '____', '____'], ['_##_', '_##_', '____', '____'], ['_##_', '_##_', '____', '____'], ['_##_', '_##_', '____', '____']],
                    S: [['____', '_##_', '##__', '____'], ['#___', '##__', '_#__', '____'], ['_##_', '##__', '____', '____'], ['_#__', '_##_', '__#_', '____']],
                    T: [['____', '###_', '_#__', '____'], ['_#__', '##__', '_#__', '____'], ['_#__', '###_', '____', '____'], ['_#__', '_##_', '_#__', '____']],
                    Z: [['____', '##__', '_##_', '____'], ['_#__', '##__', '#___', '____'], ['##__', '_##_', '____', '____'], ['__#_', '_##_', '_#__', '____']]
                };
                return typeRotations[this.type][rotation];
            }
        }, {
            key: 'copyArray',
            value: function copyArray(array) {
                return JSON.parse(JSON.stringify(array));
            }
        }]);

        return TetrisBlock;
    })();

    exports.TetrisBlock = TetrisBlock;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDakQsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNoQyxnQkFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDeEMsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDckQ7O3FCQVZRLFdBQVc7O21CQVdmLGlCQUFHO0FBQ0osb0JBQUksS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckQscUJBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdkQscUJBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMscUJBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFB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RUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7aUJBQ0osQ0FBQztBQUNGLHVCQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDN0M7OzttQkFDUSxtQkFBQyxLQUFLLEVBQUU7QUFDYix1QkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUM1Qzs7O2VBamVRLFdBQVciLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL3RldHJpcy9ibG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5cbmV4cG9ydCBjbGFzcyBUZXRyaXNCbG9jayB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuYXJlYSA9IHBhcmFtcy5hcmVhO1xuICAgICAgICB0aGlzLnR5cGUgPSBwYXJhbXMudHlwZTsgLy8gSSwgSiwgTCwgTywgUywgVCwgWlxuICAgICAgICB0aGlzLnJvdGF0aW9uID0gcGFyYW1zLnJvdGF0aW9uOyAvLyAwLCAxLCAyLCAzXG4gICAgICAgIHRoaXMuY29sb3IgPSBwYXJhbXMuY29sb3IgfHwgdGhpcy5jb2xvckRlZmF1bHQoKTtcbiAgICAgICAgdGhpcy51bml0U2l6ZSA9IHBhcmFtcy51bml0U2l6ZTtcbiAgICAgICAgdGhpcy5jdHggPSBwYXJhbXMuY3R4O1xuICAgICAgICB0aGlzLm9yaWdpblNxdWFyZSA9IHBhcmFtcy5vcmlnaW5TcXVhcmU7IC8vIHsgeDogPywgeTogPyB9XG4gICAgICAgIHRoaXMub2NjdXBpZXMgPSB0aGlzLmdldE9jY3VwYXRpb24odGhpcy5yb3RhdGlvbik7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICB2YXIgY2xvbmUgPSBuZXcgVGV0cmlzQmxvY2soT2JqZWN0LmFzc2lnbih7fSwgdGhpcykpO1xuICAgICAgICBjbG9uZS5vcmlnaW5TcXVhcmUgPSB0aGlzLmNvcHlBcnJheSh0aGlzLm9yaWdpblNxdWFyZSk7XG4gICAgICAgIGNsb25lLmFyZWEgPSB0aGlzLmNvcHlBcnJheSh0aGlzLmFyZWEpO1xuICAgICAgICBjbG9uZS5vY2N1cGllcyA9IHRoaXMuY29weUFycmF5KHRoaXMub2NjdXBpZXMpO1xuICAgICAgICByZXR1cm4gY2xvbmU7XG4gICAgfVxuXG4gICAgbW92ZShkaXJlY3Rpb24sIG9jY3VwaWVkQnlPdGhlcnMsIHN0ZXBzID0gMSkge1xuICAgICAgICBpZihkaXJlY3Rpb24gIT09ICdkb3duJyAmJiBkaXJlY3Rpb24gIT09ICdsZWZ0JyAmJiBkaXJlY3Rpb24gIT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCYWQgYXJndW1lbnQgdG8gYmxvY2subW92ZSgpJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoYW5nZVhCeSA9IGRpcmVjdGlvbiA9PT0gJ2xlZnQnICA/IC1zdGVwc1xuICAgICAgICAgICAgICAgICAgICAgIDogZGlyZWN0aW9uID09PSAncmlnaHQnID8gc3RlcHNcbiAgICAgICAgICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgdmFyIGNoYW5nZVlCeSA9IGRpcmVjdGlvbiA9PT0gJ2Rvd24nID8gc3RlcHMgOiAwO1xuICAgICAgICB2YXIgbmV3T2NjdXBpZXMgPSB0aGlzLmNvcHlBcnJheSh0aGlzLm9jY3VwaWVzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5ld09jY3VwaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBuZXdPY2N1cGllc1tpXS54ID0gbmV3T2NjdXBpZXNbaV0ueCArIGNoYW5nZVhCeTtcbiAgICAgICAgICAgIG5ld09jY3VwaWVzW2ldLnkgPSBuZXdPY2N1cGllc1tpXS55ICsgY2hhbmdlWUJ5O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvdWxkTW92ZSA9IHRydWU7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmV3T2NjdXBpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmlzV2l0aGluRXh0ZW5kZWRBcmVhKG5ld09jY3VwaWVzW2ldKSkge1xuICAgICAgICAgICAgICAgIGNvdWxkTW92ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvdWxkTW92ZSA9IGNvdWxkTW92ZSA/IHRoaXMuY2hlY2tPdmVybGFwKG5ld09jY3VwaWVzLCBvY2N1cGllZEJ5T3RoZXJzKSA6IGZhbHNlO1xuXG4gICAgICAgIGlmKGNvdWxkTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5TcXVhcmUueCA9IHRoaXMub3JpZ2luU3F1YXJlLnggKyBjaGFuZ2VYQnk7XG4gICAgICAgICAgICB0aGlzLm9yaWdpblNxdWFyZS55ID0gdGhpcy5vcmlnaW5TcXVhcmUueSArIGNoYW5nZVlCeTtcbiAgICAgICAgICAgIHRoaXMub2NjdXBpZXMgPSBuZXdPY2N1cGllcy5zbGljZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvdWxkTW92ZTtcbiAgICB9XG4gICAgZHJvcChvY2N1cGllZEJ5T3RoZXJzKSB7XG4gICAgICAgIHZhciBudW1iZXJPZkRvd25zID0gMDtcbiAgICAgICAgd2hpbGUodGhpcy5tb3ZlKCdkb3duJywgb2NjdXBpZWRCeU90aGVycykpIHtcbiAgICAgICAgICAgIG51bWJlck9mRG93bnMrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVtYmVyT2ZEb3ducztcbiAgICB9XG4gICAgcm90YXRlKG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgdmFyIG5leHRSb3RhdGlvbiA9IHRoaXMucm90YXRpb24gKyAxID4gMyA/IDAgOiB0aGlzLnJvdGF0aW9uICsgMTtcbiAgICAgICAgdmFyIGNsb25lID0gdGhpcy5jbG9uZSgpO1xuICAgICAgICBjbG9uZS5yb3RhdGlvbiA9IG5leHRSb3RhdGlvbjtcbiAgICAgICAgY2xvbmUub2NjdXBpZXMgPSBjbG9uZS5nZXRPY2N1cGF0aW9uKGNsb25lLnJvdGF0aW9uKTtcblxuICAgICAgICB2YXIgbmV4dE9jY3VwYXRpb24gPSB0aGlzLmdldE9jY3VwYXRpb24obmV4dFJvdGF0aW9uKTtcblxuICAgICAgICB2YXIgYWxsQXJlV2l0aGluID0gdHJ1ZTtcbiAgICAgICAgdmFyIG1pbmltdW1YID0gY2xvbmUuYXJlYS5ob3Jpem9udGFsQmxvY2tzO1xuICAgICAgICB2YXIgbWF4aW11bVggPSAwO1xuICAgICAgICB2YXIgbWF4aW11bVkgPSAwO1xuXG4gICAgICAgIGNsb25lLm9jY3VwaWVzLm1hcCggKG9jY3VwaWVkU3F1YXJlKSA9PiB7XG4gICAgICAgICAgICBtaW5pbXVtWCA9IG9jY3VwaWVkU3F1YXJlLnggPCBtaW5pbXVtWCA/IG9jY3VwaWVkU3F1YXJlLnggOiBtaW5pbXVtWDtcbiAgICAgICAgICAgIG1heGltdW1YID0gb2NjdXBpZWRTcXVhcmUueCA+IG1heGltdW1YID8gb2NjdXBpZWRTcXVhcmUueCA6IG1heGltdW1YO1xuICAgICAgICAgICAgbWF4aW11bVkgPSBvY2N1cGllZFNxdWFyZS54ID4gbWF4aW11bVkgPyBvY2N1cGllZFNxdWFyZS55IDogbWF4aW11bVk7XG4gICAgICAgICAgICBpZighY2xvbmUuaXNXaXRoaW5FeHRlbmRlZEFyZWEob2NjdXBpZWRTcXVhcmUpKSB7XG4gICAgICAgICAgICAgICAgYWxsQXJlV2l0aGluID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciByb3RhdGlvbk9rID0gdHJ1ZTtcbiAgICAgICAgaWYoIWFsbEFyZVdpdGhpbikge1xuICAgICAgICAgICAgaWYobWluaW11bVggPCAxKSB7XG4gICAgICAgICAgICAgICAgcm90YXRpb25PayA9IGNsb25lLm1vdmUoJ3JpZ2h0Jywgb2NjdXBpZWRCeU90aGVycywgTWF0aC5hYnMobWluaW11bVgpICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG1heGltdW1YID4gY2xvbmUuYXJlYS5ob3Jpem9udGFsQmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgcm90YXRpb25PayA9IGNsb25lLm1vdmUoJ2xlZnQnLCBvY2N1cGllZEJ5T3RoZXJzLCBtYXhpbXVtWCAtIGNsb25lLmFyZWEuaG9yaXpvbnRhbEJsb2Nrcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG1heGltdW1ZID4gY2xvbmUuYXJlYS52ZXJ0aWNhbEJsb2Nrcykge1xuICAgICAgICAgICAgICAgIHJvdGF0aW9uT2sgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByb3RhdGlvbk9rID0gcm90YXRpb25PayA/IHRoaXMuY2hlY2tPdmVybGFwKGNsb25lLm9jY3VwaWVzLCBvY2N1cGllZEJ5T3RoZXJzKSA6IGZhbHNlO1xuXG4gICAgICAgIGlmKHJvdGF0aW9uT2spIHtcbiAgICAgICAgICAgIHRoaXMub2NjdXBpZXMgPSBjbG9uZS5jb3B5QXJyYXkoY2xvbmUub2NjdXBpZXMpO1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IGNsb25lLnJvdGF0aW9uO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgd2l0aEVhY2hPY2N1cGllZFNxdWFyZShkb1RoaXMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9jY3VwaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkb1RoaXModGhpcy5vY2N1cGllc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gZXh0ZW5kZWQgYXJlYSBpbmNsdWRlcyB0aGUgaGlkZGVuIHNxdWFyZXMgYWJvdmUgdGhlIHZpc2libGUgdG9wXG4gICAgaXNXaXRoaW5FeHRlbmRlZEFyZWEob2NjdXBpZWRTcXVhcmUpIHtcbiAgICAgICAgcmV0dXJuIG9jY3VwaWVkU3F1YXJlLnggPj0gMVxuICAgICAgICAgICAgJiYgb2NjdXBpZWRTcXVhcmUueCA8PSB0aGlzLmFyZWEuaG9yaXpvbnRhbEJsb2Nrc1xuICAgICAgICAgICAgJiYgb2NjdXBpZWRTcXVhcmUueSA+PSAtNFxuICAgICAgICAgICAgJiYgb2NjdXBpZWRTcXVhcmUueSA8PSB0aGlzLmFyZWEudmVydGljYWxCbG9ja3MgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIGlzV2l0aGluQXJlYShvY2N1cGllZFNxdWFyZSkge1xuICAgICAgICByZXR1cm4gb2NjdXBpZWRTcXVhcmUueCA+PSAxXG4gICAgICAgICAgICAmJiBvY2N1cGllZFNxdWFyZS54IDw9IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzXG4gICAgICAgICAgICAmJiBvY2N1cGllZFNxdWFyZS55ID49IDFcbiAgICAgICAgICAgICYmIG9jY3VwaWVkU3F1YXJlLnkgPD0gdGhpcy5hcmVhLnZlcnRpY2FsQmxvY2tzID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICBjaGVja092ZXJsYXAob25lQmxvY2tPY2N1cHksIG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbmVCbG9ja09jY3VweS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHNxdWFyZSA9IG9uZUJsb2NrT2NjdXB5W2ldO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG9jY3VwaWVkQnlPdGhlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb3RoZXJCbG9jayA9IG9jY3VwaWVkQnlPdGhlcnNbal07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IG90aGVyQmxvY2subGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgb3RoZXJTcXVhcmUgPSBvdGhlckJsb2NrW2tdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHNxdWFyZS54ID09PSBvdGhlclNxdWFyZS54ICYmIHNxdWFyZS55ID09PSBvdGhlclNxdWFyZS55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvci5tYWluO1xuICAgICAgICB0aGlzLm9jY3VwaWVzLm1hcCggKG9jY3VwaWVkU3F1YXJlKSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLmlzV2l0aGluQXJlYShvY2N1cGllZFNxdWFyZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9wWCA9IDAuNSArIHRoaXMuYXJlYS5sZWZ0ICsgKG9jY3VwaWVkU3F1YXJlLnggLSAxKSAqIHRoaXMudW5pdFNpemU7XG4gICAgICAgICAgICAgICAgdmFyIHRvcFkgPSAwLjUgKyB0aGlzLmFyZWEudG9wICsgKG9jY3VwaWVkU3F1YXJlLnkgLSAxKSAqIHRoaXMudW5pdFNpemU7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QodG9wWCwgdG9wWSwgdGhpcy51bml0U2l6ZSAtIDEsIHRoaXMudW5pdFNpemUgLSAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKDEsIHRoaXMuY29sb3IubGlnaHRlciwgdG9wWCwgdG9wWSwgdGhpcy51bml0U2l6ZSAtIDEsIDApO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUoMSwgdGhpcy5jb2xvci5saWdodGVyLCB0b3BYLCB0b3BZLCAwLCB0aGlzLnVuaXRTaXplIC0gMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSgxLCB0aGlzLmNvbG9yLmRhcmtlciwgdG9wWCwgdG9wWSArIHRoaXMudW5pdFNpemUgLSAxLCB0aGlzLnVuaXRTaXplIC0gMSwgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSgxLCB0aGlzLmNvbG9yLmRhcmtlciwgdG9wWCArIHRoaXMudW5pdFNpemUgLSAxLCB0b3BZLCAwLCB0aGlzLnVuaXRTaXplIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vY2N1cGllcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICB2YXIgZmlyc3QgPSB0aGlzLm9jY3VwaWVzW2ldO1xuICAgICAgICAgICAgaWYoIXRoaXMuaXNXaXRoaW5BcmVhKGZpcnN0KSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgdGhpcy5vY2N1cGllcy5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHNlY29uZCA9IHRoaXMub2NjdXBpZXNbal07XG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaXNXaXRoaW5BcmVhKHNlY29uZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0WCA9IHRoaXMuYXJlYS5sZWZ0ICsgKGZpcnN0LnggLSAxKSAqIHRoaXMudW5pdFNpemUgKyB0aGlzLnVuaXRTaXplIC8gMjtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRZID0gdGhpcy5hcmVhLnRvcCArIChmaXJzdC55IC0gMSkgKiB0aGlzLnVuaXRTaXplICsgdGhpcy51bml0U2l6ZSAvIDJcblxuICAgICAgICAgICAgICAgIGlmKGZpcnN0LnggPT09IHNlY29uZC54ICYmIGZpcnN0LnkgIT09IHNlY29uZC55KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSBmaXJzdC55IDwgc2Vjb25kLnkgPyAxIDogLTE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUoNSwgdGhpcy5jb2xvci5kYXJrZXIsIHN0YXJ0WCwgc3RhcnRZLCAwLCBkaXJlY3Rpb24gKiB0aGlzLnVuaXRTaXplKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihmaXJzdC54ICE9PSBzZWNvbmQueCAmJiBmaXJzdC55ID09PSBzZWNvbmQueSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gZmlyc3QueCA8IHNlY29uZC54ID8gMSA6IC0xO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKDUsIHRoaXMuY29sb3IuZGFya2VyLCBzdGFydFgsIHN0YXJ0WSwgZGlyZWN0aW9uICogdGhpcy51bml0U2l6ZSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGRyYXdTaGFkb3cob2NjdXBpZWRCeU90aGVycykge1xuICAgICAgICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lKCk7XG4gICAgICAgIGNsb25lLmNvbG9yID0geyBtYWluOiAnIzY2NjY2NicsIGxpZ2h0ZXI6ICcjNzc3Nzc3JywgZGFya2VyOiAnIzVmNWY1ZicgfTtcbiAgICAgICAgY2xvbmUuZHJvcChvY2N1cGllZEJ5T3RoZXJzKTtcbiAgICAgICAgY2xvbmUuZHJhdygpO1xuICAgIH1cblxuICAgIHJlbW92ZUZyb21Sb3dzKHJvd3MpIHtcblxuICAgICAgICB2YXIgbmV3T2NjdXBpZXMgPSBbXTtcbiAgICAgICAgdmFyIHVuaXF1ZU9jY3VwaWVkUm93cyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5vY2N1cGllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHNxdWFyZSA9IHRoaXMub2NjdXBpZXNbal07XG4gICAgICAgICAgICB2YXIgcm93VG9CZURlbGV0ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IHJvd3NbaV07XG5cbiAgICAgICAgICAgICAgICBpZihzcXVhcmUueSA9PT0gcm93KSB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1RvQmVEZWxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCFyb3dUb0JlRGVsZXRlZCkge1xuICAgICAgICAgICAgICAgIG5ld09jY3VwaWVzLnB1c2goc3F1YXJlKTtcblxuICAgICAgICAgICAgICAgIGlmKHVuaXF1ZU9jY3VwaWVkUm93c1stMV0gIT09IHNxdWFyZS55KSB7XG4gICAgICAgICAgICAgICAgICAgIHVuaXF1ZU9jY3VwaWVkUm93cy5wdXNoKHNxdWFyZS55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBudWxsO1xuICAgICAgICBpZih1bmlxdWVPY2N1cGllZFJvd3MubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICB0aGlzTmV3T2NjdXBpZXMgPSBbXTtcbiAgICAgICAgICAgIG5ld0Jsb2NrT2NjdXBpZXMgPSBbXTtcblxuICAgICAgICAgICAgdmFyIGJsb2NrU3BsaXRzT24gPSBudWxsO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB1bmlxdWVPY2N1cGllZFJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZih1bmlxdWVPY2N1cGllZFJvd3NbaV0gLSB1bmlxdWVPY2N1cGllZFJvd3NbaSAtIDFdID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBibG9ja1NwbGl0c09uID0gdW5pcXVlT2NjdXBpZWRSb3dzW2ldIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihibG9ja1NwbGl0c09uKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZXdPY2N1cGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3F1YXJlID0gbmV3T2NjdXBpZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmKHNxdWFyZS55IDwgYmxvY2tTcGxpdHNPbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc05ld09jY3VwaWVzLnB1c2goc3F1YXJlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrT2NjdXBpZXMucHVzaChzcXVhcmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5vY2N1cGllcyA9IHRoaXMuY29weUFycmF5KHRoaXNOZXdPY2N1cGllcyk7XG4gICAgICAgICAgICAgICAgbmV3QmxvY2sgPSB0aGlzLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgbmV3QmxvY2sub2NjdXBpZXMgPSB0aGlzLmNvcHlBcnJheShuZXdCbG9ja09jY3VwaWVzKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vY2N1cGllcyA9IHRoaXMuY29weUFycmF5KG5ld09jY3VwaWVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vY2N1cGllcyA9IHRoaXMuY29weUFycmF5KG5ld09jY3VwaWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3QmxvY2s7XG4gICAgfVxuXG4gICAgZ2V0T2NjdXBhdGlvbihyb3RhdGlvbikge1xuICAgICAgICB2YXIgbmV3T2NjdXBpZXMgPSBbXTtcblxuICAgICAgICB2YXIgZmlsbHMgPSB0aGlzLmdldEZpbGxGb3JUeXBlUm90YXRpb24ocm90YXRpb24pO1xuXG4gICAgICAgIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBmaWxscy5sZW5ndGg7IHJvd0luZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjZWxscyA9IGZpbGxzW3Jvd0luZGV4XS5zcGxpdCgnJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBjZWxsSW5kZXggPSAwOyBjZWxsSW5kZXggPD0gY2VsbHMubGVuZ3RoOyBjZWxsSW5kZXgrKykge1xuXG4gICAgICAgICAgICAgICAgaWYoY2VsbHNbY2VsbEluZGV4XSA9PT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09jY3VwaWVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5vcmlnaW5TcXVhcmUueCArIGNlbGxJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHRoaXMub3JpZ2luU3F1YXJlLnkgKyByb3dJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdPY2N1cGllcztcblxuICAgIH1cbiAgICBkcmF3TGluZShsaW5lV2lkdGgsIGNvbG9yLCBmcm9tWCwgZnJvbVksIGxlbmd0aFgsIGxlbmd0aFkpIHtcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgICAgICB0aGlzLmN0eC5saW5lQ2FwID0gJ3JvdW5kJztcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhmcm9tWCwgZnJvbVkpO1xuICAgICAgICB0aGlzLmN0eC5saW5lVG8oZnJvbVggKyBsZW5ndGhYLCBmcm9tWSArIGxlbmd0aFkpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICB9XG5cbiAgICBjb2xvckRlZmF1bHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09ICdJJyA/IHsgbWFpbjogJyMyMmRkZGQnLCBsaWdodGVyOiAnIzU1ZmZmZicsIGRhcmtlcjogJyMwMGJiYmInIH1cbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ0onID8geyBtYWluOiAnIzJhNjRkYicsIGxpZ2h0ZXI6ICcjNGM4NmZkJywgZGFya2VyOiAnIzA4NDJkOScgfVxuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnTCcgPyB7IG1haW46ICcjZGQ4ODIyJywgbGlnaHRlcjogJyNmZmFhNTUnLCBkYXJrZXI6ICcjYmI2NjAwJyB9XG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdPJyA/IHsgbWFpbjogJyNkZGRkMjInLCBsaWdodGVyOiAnI2ZmZmY1NScsIGRhcmtlcjogJyNiYmJiMDAnIH1cbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ1MnID8geyBtYWluOiAnIzIyYmI4OCcsIGxpZ2h0ZXI6ICcjNTVkZGFhJywgZGFya2VyOiAnIzAwOTk2NicgfVxuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnVCcgPyB7IG1haW46ICcjYjkzNGRiJywgbGlnaHRlcjogJyNkYjU2ZmQnLCBkYXJrZXI6ICcjOTcxMmI5JyB9XG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdaJyA/IHsgbWFpbjogJyNkZDIyMjInLCBsaWdodGVyOiAnI2ZmNTU1NScsIGRhcmtlcjogJyNiYjAwMDAnIH1cbiAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgeyBtYWluOiAnI2ZmZmZmZicsIGxpZ2h0ZXI6ICcjZmZmZmZmJywgZGFya2VyOiAnIzAwMDAwMCcgfVxuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgZ2V0RmlsbEZvclR5cGVSb3RhdGlvbihyb3RhdGlvbikge1xuICAgICAgICB2YXIgdHlwZVJvdGF0aW9ucyA9IHtcbiAgICAgICAgICAgIEk6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgSjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBMOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBPOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBTOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFQ6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgWjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyNfX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdHlwZVJvdGF0aW9uc1t0aGlzLnR5cGVdW3JvdGF0aW9uXTtcbiAgICB9XG4gICAgY29weUFycmF5KGFycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFycmF5KSk7XG4gICAgfVxuXG59XG4iXX0=;
define('components/tetris/tetris',['exports', 'module', 'knockout', 'text!./tetris.html', './block'], function (exports, module, _knockout, _textTetrisHtml, _block) {
    

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

            var width = this.unitSize * horizontalBlocks;
            var height = this.unitSize * verticalBlocks;
            var left = Math.floor(this.canvasWidth / 2 - width / 2);
            var top = Math.floor(this.canvasHeight / 2 - height / 2);

            this.area = {
                left: left,
                top: top,
                width: width,
                height: height,
                right: this.left + width,
                bottom: this.top + height,
                horizontalBlocks: horizontalBlocks,
                verticalBlocks: verticalBlocks
            };
            this.paused = _ko['default'].observable(false);

            this.level = _ko['default'].observable(1);
            this.heapBlocks = [];
            this.blocks = this.getBagOfBlocks();
            this.loopsPerStep = this.loopsPerStepForLevel(this.level());
            this.loopsSinceStep = 0;
            this.hadCompletedRowsOnLastUpdate = false;
            this.completedRows = _ko['default'].observable(0);

            this.score = _ko['default'].observable(0);

            $(document).keydown(function (e) {
                if (!_this.paused()) {
                    if (e.which === 38) {
                        _this.activeBlock().rotate(_this.allOccupiedSquares());
                    } else if (e.which === 37) {
                        _this.activeBlock().move('left', _this.allOccupiedSquares());
                    } else if (e.which === 39) {
                        _this.activeBlock().move('right', _this.allOccupiedSquares());
                    } else if (e.which === 40) {
                        _this.activeBlockMoveDown();
                    } else if (e.which === 32) {
                        _this.activeBlockDrop();
                    }
                }
                if (e.which === 80) {
                    _this.paused(!_this.paused());
                }
            });
            this.run();
        }

        _createClass(Tetris, [{
            key: 'drawArea',
            value: function drawArea() {
                this.ctx.clearRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = '#777';
                // game area
                this.ctx.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);

                // grid
                var c = this.ctx;
                c.lineWidth = 1;
                this.ctx.lineCap = 'butt';
                for (var x = 1; x < this.area.horizontalBlocks; x++) {
                    c.beginPath();
                    c.moveTo(x * this.unitSize + this.area.left, this.area.top);
                    c.lineTo(x * this.unitSize + this.area.left, this.area.top + this.area.height);
                    c.strokeStyle = '#888';
                    c.stroke();
                }
            }
        }, {
            key: 'run',
            value: function run() {
                if (!this.paused()) {
                    this.drawArea();
                    this.update();
                }
                var self = this;
                setTimeout(function () {
                    self.run();
                }, 10);
            }
        }, {
            key: 'loopsPerStepForLevel',
            value: function loopsPerStepForLevel(level) {
                return level == 1 ? 20 : level == 2 ? 18 : level == 3 ? 16 : level == 4 ? 14 : level == 5 ? 12 : level == 6 ? 10 : level == 7 ? 9 : level == 8 ? 8 : level == 9 ? 7 : level == 10 ? 5 : 1000;
            }
        }, {
            key: 'activeBlock',
            value: function activeBlock() {
                return this.blocks[0];
            }
        }, {
            key: 'maybeIncreaseLevel',
            value: function maybeIncreaseLevel() {
                if (this.completedRows() >= this.level() * 10) {
                    this.level(this.level() + 1);
                    this.loopsPerStep = this.loopsPerStepForLevel(this.level());
                }
            }
        }, {
            key: 'increaseScoreWith',
            value: function increaseScoreWith(scoreIncrease) {
                this.score(this.score() + scoreIncrease);
            }
        }, {
            key: 'doneWithBlock',
            value: function doneWithBlock(wasDropped) {
                this.heapBlocks.push(this.blocks.shift());
                this.increaseScoreWith(3 * this.level() + (wasDropped ? 21 : 3));

                if (!this.blocks.length) {
                    this.blocks = this.getBagOfBlocks();
                }
            }
        }, {
            key: 'giveScoreForSoftDrop',
            value: function giveScoreForSoftDrop() {
                this.increaseScoreWith(this.level());
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
                this.score(this.score() + groundScoreForNumberOfRows[numberOfRows] * this.level());
                this.completedRows(this.completedRows() + numberOfRows);
                this.maybeIncreaseLevel();
            }
        }, {
            key: 'activeBlockMoveDown',
            value: function activeBlockMoveDown() {
                if (this.activeBlock().move('down', this.allOccupiedSquares())) {
                    this.giveScoreForSoftDrop();
                }
            }
        }, {
            key: 'activeBlockDrop',
            value: function activeBlockDrop() {
                this.activeBlock().drop(this.allOccupiedSquares());
                this.doneWithBlock(1);
            }
        }, {
            key: 'maybeTakeStep',
            value: function maybeTakeStep() {
                ++this.loopsSinceStep;
                if (this.loopsSinceStep > this.loopsPerStep) {
                    this.loopsSinceStep = 0;
                    var ableToMove = this.activeBlock().move('down', this.allOccupiedSquares());
                    if (!ableToMove) {
                        this.doneWithBlock();
                    }
                }
            }
        }, {
            key: 'checkForCompletedRows',
            value: function checkForCompletedRows() {
                var completedRows = [];
                var allOccupiedSquares = this.allOccupiedSquares();

                var occupiedPerRow = [];
                for (var i = 0; i <= this.area.verticalBlocks; i++) {
                    occupiedPerRow[i] = 0;
                }

                allOccupiedSquares.map(function (block) {
                    block.map(function (square) {
                        ++occupiedPerRow[square.y];
                    });
                });

                CHECKCOMPLETED: for (var rowIndex = 0; rowIndex <= this.area.verticalBlocks; rowIndex++) {
                    var occupiedSquaresOnRow = occupiedPerRow[rowIndex];
                    if (occupiedSquaresOnRow === this.area.horizontalBlocks) {
                        this.hadCompletedRowsOnLastUpdate = true;
                        completedRows.push(rowIndex);

                        for (var cellIndex = 1; cellIndex <= this.area.horizontalBlocks; cellIndex++) {
                            this.ctx.fillStyle = '#fff';

                            this.ctx.fillRect(5 + this.area.left + (cellIndex - 1) * this.unitSize, 5 + this.area.top + (rowIndex - 1) * this.unitSize, this.unitSize - 10, this.unitSize - 10);

                            //this.ctx.fillRect(
                            //    0.5 + this.area.left + (cellIndex - 1) * this.unitSize,
                            //    0.5 + this.area.top + (rowIndex - 1) * this.unitSize,
                            //    this.unitSize - 1,
                            //    this.unitSize - 1
                            //);
                        }
                    }
                }

                if (completedRows.length) {
                    var newHeapBlocks = [];
                    console.log('completed: ', completedRows);
                    //this.game.paused(true);

                    for (var i = 0; i < this.heapBlocks.length; i++) {
                        var block = this.heapBlocks[i];

                        var possibleNewBlock = block.removeFromRows(completedRows);
                        if (possibleNewBlock !== null) {
                            newHeapBlocks.push(possibleNewBlock);
                        }
                        if (block.occupies.length) {
                            newHeapBlocks.push(block);
                        }
                    }

                    this.heapBlocks = newHeapBlocks;
                }
                return completedRows.length;
            }
        }, {
            key: 'update',
            value: function update() {
                if (this.hadCompletedRowsOnLastUpdate) {
                    this.dropAfterCompleted();
                    this.hadCompletedRowsOnLastUpdate = false;
                } else {
                    this.maybeTakeStep();
                }
                this.draw();

                HADCOMPLETED: while (1) {
                    var completedRows = this.checkForCompletedRows();
                    if (!completedRows) {
                        break HADCOMPLETED;
                    }
                    this.giveScoreForClearedRows(completedRows);
                }
            }
        }, {
            key: 'draw',
            value: function draw() {
                this.activeBlock().drawShadow(this.allOccupiedSquares());
                this.activeBlock().draw();
                for (var i = 0; i < this.heapBlocks.length; i++) {
                    this.heapBlocks[i].draw();
                }
            }
        }, {
            key: 'dropAfterCompleted',
            value: function dropAfterCompleted() {
                var couldDropAnyBlock = true;

                while (couldDropAnyBlock) {
                    couldDropAnyBlock = false;

                    for (var i = 0; i < this.heapBlocks.length; i++) {
                        var howFarDropped = this.heapBlocks[i].drop(this.allOccupiedSquaresExpectBlockIndex(i));
                        if (howFarDropped > 0) {
                            couldDropAnyBlock = true;
                        }
                    }
                }
            }
        }, {
            key: 'allOccupiedSquares',
            value: function allOccupiedSquares() {
                var allOccupiedSquares = [];

                OCCUPIED: for (var i = 0; i < this.heapBlocks.length; i++) {
                    var block = this.heapBlocks[i];

                    if (block.occupies.length) {
                        allOccupiedSquares.push(block.occupies);
                    }
                }
                return allOccupiedSquares;
            }
        }, {
            key: 'allOccupiedSquaresExpectBlockIndex',
            value: function allOccupiedSquaresExpectBlockIndex(exceptBlockIndex) {
                var allOccupiedSquares = [];

                OCCUPIED: for (var i = 0; i < this.heapBlocks.length; i++) {
                    if (i === exceptBlockIndex) {
                        continue OCCUPIED;
                    }
                    allOccupiedSquares.push(this.heapBlocks[i].occupies);
                }
                return allOccupiedSquares;
            }
        }, {
            key: 'getBagOfBlocks',
            value: function getBagOfBlocks(amount) {
                var blocks = [];
                var blockTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
                var rotation = [0, 1, 2, 3];

                while (blockTypes.length) {
                    var randomBlockTypeIndex = Math.floor(Math.random() * blockTypes.length);
                    var type = blockTypes.splice(randomBlockTypeIndex, 1).shift();
                    blocks.push(new _block.TetrisBlock({
                        type: type,
                        rotation: rotation[Math.floor(Math.random() * rotation.length)],
                        unitSize: this.unitSize,
                        originSquare: { x: Math.floor(this.area.horizontalBlocks / 2), y: -2 },
                        ctx: this.ctx,
                        area: this.area
                    }));
                }
                console.log(blocks);
                return blocks;
            }
        }, {
            key: 'copyArray',
            value: function copyArray(array) {
                return JSON.parse(JSON.stringify(array));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFJTSxNQUFNO0FBQ0csaUJBRFQsTUFBTSxDQUNJLE1BQU0sRUFBRTs7O2tDQURsQixNQUFNOztBQUVKLGdCQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6QyxxQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLHFCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7O0FBRXpDLGdCQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkMsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFekMsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVuQixnQkFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsZ0JBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQzs7QUFFeEIsZ0JBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUM7QUFDN0MsZ0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDO0FBQzVDLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4RCxnQkFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcs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QUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDdEUsMkJBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNiLDRCQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7cUJBQ2xCLENBQUMsQ0FBQyxDQUFDO2lCQUNQO0FBQ0QsdUJBQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsdUJBQU8sTUFBTSxDQUFDO2FBQ2pCOzs7bUJBQ1EsbUJBQUMsS0FBSyxFQUFFO0FBQ2IsdUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDNUM7OzttQkFFTSxtQkFBRzs7O2FBR1Q7OztlQTdUQyxNQUFNOzs7cUJBZ1VHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLDRCQUFnQixFQUFFIiwiZmlsZSI6ImdzcmMvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGtvIGZyb20gJ2tub2Nrb3V0JztcbmltcG9ydCB0ZW1wbGF0ZU1hcmt1cCBmcm9tICd0ZXh0IS4vdGV0cmlzLmh0bWwnO1xuaW1wb3J0IHsgVGV0cmlzQmxvY2sgfSBmcm9tICcuL2Jsb2NrJztcblxuY2xhc3MgVGV0cmlzIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdmFyICRnYW1lQXJlYSA9ICQoJyN0ZXRyaXMtcGFnZSBjYW52YXMnKTtcbiAgICAgICAgJGdhbWVBcmVhWzBdLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICRnYW1lQXJlYVswXS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jYW52YXNXaWR0aCA9ICRnYW1lQXJlYS53aWR0aCgpO1xuICAgICAgICB0aGlzLmNhbnZhc0hlaWdodCA9ICRnYW1lQXJlYS5oZWlnaHQoKTtcbiAgICAgICAgdGhpcy5jdHggPSAkZ2FtZUFyZWFbMF0uZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB0aGlzLnVuaXRTaXplID0gMjA7XG5cbiAgICAgICAgdmFyIGhvcml6b250YWxCbG9ja3MgPSAxMDtcbiAgICAgICAgdmFyIHZlcnRpY2FsQmxvY2tzID0gMjA7XG5cbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy51bml0U2l6ZSAqIGhvcml6b250YWxCbG9ja3M7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLnVuaXRTaXplICogdmVydGljYWxCbG9ja3M7XG4gICAgICAgIHZhciBsZWZ0ID0gTWF0aC5mbG9vcih0aGlzLmNhbnZhc1dpZHRoIC8gMiAtIHdpZHRoIC8gMik7XG4gICAgICAgIHZhciB0b3AgPSBNYXRoLmZsb29yKHRoaXMuY2FudmFzSGVpZ2h0IC8gMiAtIGhlaWdodCAvIDIpO1xuXG4gICAgICAgIHRoaXMuYXJlYSA9IHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgcmlnaHQ6IHRoaXMubGVmdCArIHdpZHRoLFxuICAgICAgICAgICAgYm90dG9tOiB0aGlzLnRvcCArIGhlaWdodCxcbiAgICAgICAgICAgIGhvcml6b250YWxCbG9ja3M6IGhvcml6b250YWxCbG9ja3MsXG4gICAgICAgICAgICB2ZXJ0aWNhbEJsb2NrczogdmVydGljYWxCbG9ja3MsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucGF1c2VkID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5sZXZlbCA9IGtvLm9ic2VydmFibGUoMSk7XG4gICAgICAgIHRoaXMuaGVhcEJsb2NrcyA9IFtdO1xuICAgICAgICB0aGlzLmJsb2NrcyA9IHRoaXMuZ2V0QmFnT2ZCbG9ja3MoKTtcbiAgICAgICAgdGhpcy5sb29wc1BlclN0ZXAgPSB0aGlzLmxvb3BzUGVyU3RlcEZvckxldmVsKHRoaXMubGV2ZWwoKSk7XG4gICAgICAgIHRoaXMubG9vcHNTaW5jZVN0ZXAgPSAwO1xuICAgICAgICB0aGlzLmhhZENvbXBsZXRlZFJvd3NPbkxhc3RVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb21wbGV0ZWRSb3dzID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuICAgICAgICB0aGlzLnNjb3JlID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5rZXlkb3duKChlKSA9PiB7XG4gICAgICAgICAgICBpZighdGhpcy5wYXVzZWQoKSkge1xuICAgICAgICAgICAgICAgIGlmKGUud2hpY2ggPT09IDM4KSAgICAgIHsgdGhpcy5hY3RpdmVCbG9jaygpLnJvdGF0ZSh0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKSAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gMzcpIHsgdGhpcy5hY3RpdmVCbG9jaygpLm1vdmUoJ2xlZnQnLCB0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKSAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gMzkpIHsgdGhpcy5hY3RpdmVCbG9jaygpLm1vdmUoJ3JpZ2h0JywgdGhpcy5hbGxPY2N1cGllZFNxdWFyZXMoKSkgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gNDApIHsgdGhpcy5hY3RpdmVCbG9ja01vdmVEb3duKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gMzIpIHsgdGhpcy5hY3RpdmVCbG9ja0Ryb3AoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZS53aGljaCA9PT0gODApIHsgdGhpcy5wYXVzZWQoIXRoaXMucGF1c2VkKCkpIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucnVuKCk7XG5cbiAgICB9XG5cbiAgICBkcmF3QXJlYSgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJyM3NzcnO1xuICAgICAgICAvLyBnYW1lIGFyZWFcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QodGhpcy5hcmVhLmxlZnQsIHRoaXMuYXJlYS50b3AsIHRoaXMuYXJlYS53aWR0aCwgdGhpcy5hcmVhLmhlaWdodCk7XG5cbiAgICAgICAgLy8gZ3JpZFxuICAgICAgICB2YXIgYyA9IHRoaXMuY3R4O1xuICAgICAgICBjLmxpbmVXaWR0aCA9IDE7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVDYXAgPSAnYnV0dCc7XG4gICAgICAgIGZvciAodmFyIHggPSAxOyB4IDwgdGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3M7IHgrKykge1xuICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGMubW92ZVRvKHggKiB0aGlzLnVuaXRTaXplICsgdGhpcy5hcmVhLmxlZnQsIHRoaXMuYXJlYS50b3ApO1xuICAgICAgICAgICAgYy5saW5lVG8oeCAqIHRoaXMudW5pdFNpemUgKyB0aGlzLmFyZWEubGVmdCwgdGhpcy5hcmVhLnRvcCAgKyB0aGlzLmFyZWEuaGVpZ2h0KTtcbiAgICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSAnIzg4OCc7XG4gICAgICAgICAgICBjLnN0cm9rZSgpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmKCF0aGlzLnBhdXNlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdBcmVhKCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzZWxmLnJ1bigpIH0sIDEwKTtcbiAgICB9XG5cbiAgICBsb29wc1BlclN0ZXBGb3JMZXZlbChsZXZlbCkge1xuICAgICAgICByZXR1cm4gbGV2ZWwgPT0gMSA/IDIwXG4gICAgICAgICAgICAgOiBsZXZlbCA9PSAyID8gMThcbiAgICAgICAgICAgICA6IGxldmVsID09IDMgPyAxNlxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gNCA/IDE0XG4gICAgICAgICAgICAgOiBsZXZlbCA9PSA1ID8gMTJcbiAgICAgICAgICAgICA6IGxldmVsID09IDYgPyAxMFxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gNyA/IDlcbiAgICAgICAgICAgICA6IGxldmVsID09IDggPyA4XG4gICAgICAgICAgICAgOiBsZXZlbCA9PSA5ID8gN1xuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMTAgPyA1XG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgMTAwMFxuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2Nrc1swXTtcbiAgICB9XG5cbiAgICBtYXliZUluY3JlYXNlTGV2ZWwoKSB7XG4gICAgICAgIGlmKHRoaXMuY29tcGxldGVkUm93cygpID49IHRoaXMubGV2ZWwoKSAqIDEwKSB7XG4gICAgICAgICAgICB0aGlzLmxldmVsKHRoaXMubGV2ZWwoKSArIDEpO1xuICAgICAgICAgICAgdGhpcy5sb29wc1BlclN0ZXAgPSB0aGlzLmxvb3BzUGVyU3RlcEZvckxldmVsKHRoaXMubGV2ZWwoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW5jcmVhc2VTY29yZVdpdGgoc2NvcmVJbmNyZWFzZSkge1xuICAgICAgICB0aGlzLnNjb3JlKHRoaXMuc2NvcmUoKSArIHNjb3JlSW5jcmVhc2UpO1xuICAgIH1cbiAgICBkb25lV2l0aEJsb2NrKHdhc0Ryb3BwZWQpIHtcbiAgICAgICAgdGhpcy5oZWFwQmxvY2tzLnB1c2godGhpcy5ibG9ja3Muc2hpZnQoKSk7XG4gICAgICAgIHRoaXMuaW5jcmVhc2VTY29yZVdpdGgoMyAqIHRoaXMubGV2ZWwoKSArICh3YXNEcm9wcGVkID8gMjEgOiAzKSk7XG5cbiAgICAgICAgaWYoIXRoaXMuYmxvY2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5ibG9ja3MgPSB0aGlzLmdldEJhZ09mQmxvY2tzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2l2ZVNjb3JlRm9yU29mdERyb3AoKSB7XG4gICAgICAgIHRoaXMuaW5jcmVhc2VTY29yZVdpdGgodGhpcy5sZXZlbCgpKTtcbiAgICB9XG4gICAgZ2l2ZVNjb3JlRm9yQ2xlYXJlZFJvd3MobnVtYmVyT2ZSb3dzKSB7XG4gICAgICAgIHZhciBncm91bmRTY29yZUZvck51bWJlck9mUm93cyA9IHtcbiAgICAgICAgICAgIDA6ICAgIDAsXG4gICAgICAgICAgICAxOiAgIDQwLFxuICAgICAgICAgICAgMjogIDEwMCxcbiAgICAgICAgICAgIDM6ICAzMDAsXG4gICAgICAgICAgICA0OiAxMjAwLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNjb3JlKHRoaXMuc2NvcmUoKSArIGdyb3VuZFNjb3JlRm9yTnVtYmVyT2ZSb3dzW251bWJlck9mUm93c10gKiB0aGlzLmxldmVsKCkpO1xuICAgICAgICB0aGlzLmNvbXBsZXRlZFJvd3ModGhpcy5jb21wbGV0ZWRSb3dzKCkgKyBudW1iZXJPZlJvd3MpO1xuICAgICAgICB0aGlzLm1heWJlSW5jcmVhc2VMZXZlbCgpO1xuXG4gICAgfVxuXG4gICAgYWN0aXZlQmxvY2tNb3ZlRG93bigpIHtcbiAgICAgICAgaWYodGhpcy5hY3RpdmVCbG9jaygpLm1vdmUoJ2Rvd24nLCB0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKSkge1xuICAgICAgICAgICAgdGhpcy5naXZlU2NvcmVGb3JTb2Z0RHJvcCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFjdGl2ZUJsb2NrRHJvcCgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLmRyb3AodGhpcy5hbGxPY2N1cGllZFNxdWFyZXMoKSk7XG4gICAgICAgIHRoaXMuZG9uZVdpdGhCbG9jaygxKTtcbiAgICB9XG5cbiAgICBtYXliZVRha2VTdGVwKCkge1xuICAgICAgICArK3RoaXMubG9vcHNTaW5jZVN0ZXA7XG4gICAgICAgIGlmKHRoaXMubG9vcHNTaW5jZVN0ZXAgPiB0aGlzLmxvb3BzUGVyU3RlcCkge1xuICAgICAgICAgICAgdGhpcy5sb29wc1NpbmNlU3RlcCA9IDA7XG4gICAgICAgICAgICB2YXIgYWJsZVRvTW92ZSA9IHRoaXMuYWN0aXZlQmxvY2soKS5tb3ZlKCdkb3duJywgdGhpcy5hbGxPY2N1cGllZFNxdWFyZXMoKSk7XG4gICAgICAgICAgICBpZighYWJsZVRvTW92ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZG9uZVdpdGhCbG9jaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNoZWNrRm9yQ29tcGxldGVkUm93cygpIHtcbiAgICAgICAgdmFyIGNvbXBsZXRlZFJvd3MgPSBbXTtcbiAgICAgICAgdmFyIGFsbE9jY3VwaWVkU3F1YXJlcyA9IHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCk7XG5cbiAgICAgICAgdmFyIG9jY3VwaWVkUGVyUm93ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuYXJlYS52ZXJ0aWNhbEJsb2NrczsgaSsrKSB7XG4gICAgICAgICAgICBvY2N1cGllZFBlclJvd1tpXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBhbGxPY2N1cGllZFNxdWFyZXMubWFwKChibG9jaykgPT4ge1xuICAgICAgICAgICAgYmxvY2subWFwKCAoc3F1YXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgKytvY2N1cGllZFBlclJvd1tzcXVhcmUueV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgQ0hFQ0tDT01QTEVURUQ6XG4gICAgICAgIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPD0gdGhpcy5hcmVhLnZlcnRpY2FsQmxvY2tzOyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgb2NjdXBpZWRTcXVhcmVzT25Sb3cgPSBvY2N1cGllZFBlclJvd1tyb3dJbmRleF07XG4gICAgICAgICAgICBpZihvY2N1cGllZFNxdWFyZXNPblJvdyA9PT0gdGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhZENvbXBsZXRlZFJvd3NPbkxhc3RVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZFJvd3MucHVzaChyb3dJbmRleCk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjZWxsSW5kZXggPSAxOyBjZWxsSW5kZXggPD0gdGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3M7IGNlbGxJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICcjZmZmJztcblxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICA1ICsgdGhpcy5hcmVhLmxlZnQgKyAoY2VsbEluZGV4IC0gMSkgKiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgNSArIHRoaXMuYXJlYS50b3AgKyAocm93SW5kZXggLSAxKSAqIHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVuaXRTaXplIC0gMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVuaXRTaXplIC0gMTBcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMuY3R4LmZpbGxSZWN0KFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAwLjUgKyB0aGlzLmFyZWEubGVmdCArIChjZWxsSW5kZXggLSAxKSAqIHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIDAuNSArIHRoaXMuYXJlYS50b3AgKyAocm93SW5kZXggLSAxKSAqIHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIHRoaXMudW5pdFNpemUgLSAxLFxuICAgICAgICAgICAgICAgICAgICAvLyAgICB0aGlzLnVuaXRTaXplIC0gMVxuICAgICAgICAgICAgICAgICAgICAvLyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoY29tcGxldGVkUm93cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuZXdIZWFwQmxvY2tzID0gW107XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY29tcGxldGVkOiAnLCBjb21wbGV0ZWRSb3dzKTtcbiAgICAgICAgICAgIC8vdGhpcy5nYW1lLnBhdXNlZCh0cnVlKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhlYXBCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmhlYXBCbG9ja3NbaV07XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9zc2libGVOZXdCbG9jayA9IGJsb2NrLnJlbW92ZUZyb21Sb3dzKGNvbXBsZXRlZFJvd3MpO1xuICAgICAgICAgICAgICAgIGlmKHBvc3NpYmxlTmV3QmxvY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3SGVhcEJsb2Nrcy5wdXNoKHBvc3NpYmxlTmV3QmxvY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihibG9jay5vY2N1cGllcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3SGVhcEJsb2Nrcy5wdXNoKGJsb2NrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaGVhcEJsb2NrcyA9IG5ld0hlYXBCbG9ja3M7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlZFJvd3MubGVuZ3RoO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYodGhpcy5oYWRDb21wbGV0ZWRSb3dzT25MYXN0VXBkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLmRyb3BBZnRlckNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgdGhpcy5oYWRDb21wbGV0ZWRSb3dzT25MYXN0VXBkYXRlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1heWJlVGFrZVN0ZXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXcoKTtcblxuICAgICAgICBIQURDT01QTEVURUQ6XG4gICAgICAgIHdoaWxlKDEpIHtcbiAgICAgICAgICAgIHZhciBjb21wbGV0ZWRSb3dzID0gdGhpcy5jaGVja0ZvckNvbXBsZXRlZFJvd3MoKTtcbiAgICAgICAgICAgIGlmKCFjb21wbGV0ZWRSb3dzKSB7XG4gICAgICAgICAgICAgICAgYnJlYWsgSEFEQ09NUExFVEVEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5naXZlU2NvcmVGb3JDbGVhcmVkUm93cyhjb21wbGV0ZWRSb3dzKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlQmxvY2soKS5kcmF3U2hhZG93KHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpO1xuICAgICAgICB0aGlzLmFjdGl2ZUJsb2NrKCkuZHJhdygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaGVhcEJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5oZWFwQmxvY2tzW2ldLmRyYXcoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkcm9wQWZ0ZXJDb21wbGV0ZWQoKSB7XG4gICAgICAgIHZhciBjb3VsZERyb3BBbnlCbG9jayA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUoY291bGREcm9wQW55QmxvY2spIHtcbiAgICAgICAgICAgIGNvdWxkRHJvcEFueUJsb2NrID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oZWFwQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhvd0ZhckRyb3BwZWQgPSB0aGlzLmhlYXBCbG9ja3NbaV0uZHJvcCh0aGlzLmFsbE9jY3VwaWVkU3F1YXJlc0V4cGVjdEJsb2NrSW5kZXgoaSkpO1xuICAgICAgICAgICAgICAgIGlmKGhvd0ZhckRyb3BwZWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdWxkRHJvcEFueUJsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhbGxPY2N1cGllZFNxdWFyZXMoKSB7XG4gICAgICAgIHZhciBhbGxPY2N1cGllZFNxdWFyZXMgPSBbXTtcblxuICAgICAgICBPQ0NVUElFRDpcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhlYXBCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBibG9jayA9IHRoaXMuaGVhcEJsb2Nrc1tpXTtcblxuICAgICAgICAgICAgaWYoYmxvY2sub2NjdXBpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYWxsT2NjdXBpZWRTcXVhcmVzLnB1c2goYmxvY2sub2NjdXBpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxPY2N1cGllZFNxdWFyZXM7XG4gICAgfVxuICAgIGFsbE9jY3VwaWVkU3F1YXJlc0V4cGVjdEJsb2NrSW5kZXgoZXhjZXB0QmxvY2tJbmRleCkge1xuICAgICAgICB2YXIgYWxsT2NjdXBpZWRTcXVhcmVzID0gW107XG5cbiAgICAgICAgT0NDVVBJRUQ6XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oZWFwQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZihpID09PSBleGNlcHRCbG9ja0luZGV4KSB7XG4gICAgICAgICAgICAgICAgY29udGludWUgT0NDVVBJRUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhbGxPY2N1cGllZFNxdWFyZXMucHVzaCh0aGlzLmhlYXBCbG9ja3NbaV0ub2NjdXBpZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxPY2N1cGllZFNxdWFyZXM7XG4gICAgfVxuXG4gICAgZ2V0QmFnT2ZCbG9ja3MoYW1vdW50KSB7XG4gICAgICAgIHZhciBibG9ja3MgPSBbXTtcbiAgICAgICAgdmFyIGJsb2NrVHlwZXMgPSBbJ0knLCAnSicsICdMJywgJ08nLCAnUycsICdUJywgJ1onXTtcbiAgICAgICAgdmFyIHJvdGF0aW9uID0gWzAsIDEsIDIsIDNdO1xuXG4gICAgICAgIHdoaWxlKGJsb2NrVHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgcmFuZG9tQmxvY2tUeXBlSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBibG9ja1R5cGVzLmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IGJsb2NrVHlwZXMuc3BsaWNlKHJhbmRvbUJsb2NrVHlwZUluZGV4LCAxKS5zaGlmdCgpO1xuICAgICAgICAgICAgYmxvY2tzLnB1c2gobmV3IFRldHJpc0Jsb2NrKHtcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgIHJvdGF0aW9uOiByb3RhdGlvblsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcm90YXRpb24ubGVuZ3RoKSBdLFxuICAgICAgICAgICAgICAgIHVuaXRTaXplOiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgIG9yaWdpblNxdWFyZTogeyB4OiBNYXRoLmZsb29yKHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzIC8gMiksIHk6IC0yIH0sXG4gICAgICAgICAgICAgICAgY3R4OiB0aGlzLmN0eCxcbiAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLmFyZWEsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYmxvY2tzKTtcbiAgICAgICAgcmV0dXJuIGJsb2NrcztcbiAgICB9XG4gICAgY29weUFycmF5KGFycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFycmF5KSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgLy8gVGhpcyBydW5zIHdoZW4gdGhlIGNvbXBvbmVudCBpcyB0b3JuIGRvd24uIFB1dCBoZXJlIGFueSBsb2dpYyBuZWNlc3NhcnkgdG8gY2xlYW4gdXAsXG4gICAgICAgIC8vIGZvciBleGFtcGxlIGNhbmNlbGxpbmcgc2V0VGltZW91dHMgb3IgZGlzcG9zaW5nIEtub2Nrb3V0IHN1YnNjcmlwdGlvbnMvY29tcHV0ZWRzLlxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgeyB2aWV3TW9kZWw6IFRldHJpcywgdGVtcGxhdGU6IHRlbXBsYXRlTWFya3VwIH07XG4iXX0=;