
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
                        _this.drawLine(_this.color.lighter, topX, topY, _this.unitSize - 1, 0);
                        _this.drawLine(_this.color.lighter, topX, topY, 0, _this.unitSize - 1);
                        _this.drawLine(_this.color.darker, topX, topY + _this.unitSize - 1, _this.unitSize - 1, 0);
                        _this.drawLine(_this.color.darker, topX + _this.unitSize - 1, topY, 0, _this.unitSize - 1);
                    }
                });
            }
        }, {
            key: 'drawShadow',
            value: function drawShadow(occupiedByOthers) {
                var clone = this.clone();
                clone.color = { main: '#666666', lighter: '#777777', darker: '#555555' };
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
            value: function drawLine(color, fromX, fromY, lengthX, lengthY) {
                this.ctx.strokeStyle = color;
                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(fromX + lengthX, fromY + lengthY);
                this.ctx.stroke();
            }
        }, {
            key: 'colorDefault',
            value: function colorDefault() {
                return this.type === 'I' ? { main: '#22dddd', lighter: '#55ffff', darker: '#00bbbb' } : this.type === 'J' ? { main: '#2a64db', lighter: '#4c86fd', darker: '#0842d9' } : this.type === 'L' ? { main: '#dd8822', lighter: '#ffaa55', darker: '#bb6600' } : this.type === 'O' ? { main: '#dddd22', lighter: '#ffff55', darker: '#bbbb00' } : this.type === 'S' ? { main: '#22bb88', lighter: '#55ddaa', darker: '#009966' } : this.type === 'T' ? { main: '#b934db', lighter: '#db56fd', darker: '#9712b9' } : this.type === 'Z' ? { main: '#dd2222', lighter: '#ff5555', darker: '#bb0000' } : { main: '#ffffff', lighter: '#ffffff', darker: '#ffffff' };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDakQsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNoQyxnQkFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDeEMsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDckQ7O3FCQVZRLFdBQVc7O21CQVdmLGlCQUFHO0FBQ0osb0JBQUksS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckQscUJBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdkQscUJBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMscUJBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFB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QUM5QixvQkFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sRUFBRSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDbEQsb0JBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDckI7OzttQkFFVyx3QkFBRztBQUNYLHVCQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FDOUUsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUM5RSxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQzlFLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FDOUUsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUM5RSxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQzlFLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FDMUQsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUMvRTthQUNUOzs7bUJBQ3FCLGdDQUFDLFFBQVEsRUFBRTtBQUM3QixvQkFBSSxhQUFhLEdBQUc7QUFDaEIscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7aUJBQ0osQ0FBQztBQUNGLHVCQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDN0M7OzttQkFDUSxtQkFBQyxLQUFLLEVBQUU7QUFDYix1QkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUM1Qzs7O2VBcmNRLFdBQVciLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL3RldHJpcy9ibG9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5cbmV4cG9ydCBjbGFzcyBUZXRyaXNCbG9jayB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuYXJlYSA9IHBhcmFtcy5hcmVhO1xuICAgICAgICB0aGlzLnR5cGUgPSBwYXJhbXMudHlwZTsgLy8gSSwgSiwgTCwgTywgUywgVCwgWlxuICAgICAgICB0aGlzLnJvdGF0aW9uID0gcGFyYW1zLnJvdGF0aW9uOyAvLyAwLCAxLCAyLCAzXG4gICAgICAgIHRoaXMuY29sb3IgPSBwYXJhbXMuY29sb3IgfHwgdGhpcy5jb2xvckRlZmF1bHQoKTtcbiAgICAgICAgdGhpcy51bml0U2l6ZSA9IHBhcmFtcy51bml0U2l6ZTtcbiAgICAgICAgdGhpcy5jdHggPSBwYXJhbXMuY3R4O1xuICAgICAgICB0aGlzLm9yaWdpblNxdWFyZSA9IHBhcmFtcy5vcmlnaW5TcXVhcmU7IC8vIHsgeDogPywgeTogPyB9XG4gICAgICAgIHRoaXMub2NjdXBpZXMgPSB0aGlzLmdldE9jY3VwYXRpb24odGhpcy5yb3RhdGlvbik7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICB2YXIgY2xvbmUgPSBuZXcgVGV0cmlzQmxvY2soT2JqZWN0LmFzc2lnbih7fSwgdGhpcykpO1xuICAgICAgICBjbG9uZS5vcmlnaW5TcXVhcmUgPSB0aGlzLmNvcHlBcnJheSh0aGlzLm9yaWdpblNxdWFyZSk7XG4gICAgICAgIGNsb25lLmFyZWEgPSB0aGlzLmNvcHlBcnJheSh0aGlzLmFyZWEpO1xuICAgICAgICBjbG9uZS5vY2N1cGllcyA9IHRoaXMuY29weUFycmF5KHRoaXMub2NjdXBpZXMpO1xuICAgICAgICByZXR1cm4gY2xvbmU7XG4gICAgfVxuXG4gICAgbW92ZShkaXJlY3Rpb24sIG9jY3VwaWVkQnlPdGhlcnMsIHN0ZXBzID0gMSkge1xuICAgICAgICBpZihkaXJlY3Rpb24gIT09ICdkb3duJyAmJiBkaXJlY3Rpb24gIT09ICdsZWZ0JyAmJiBkaXJlY3Rpb24gIT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCYWQgYXJndW1lbnQgdG8gYmxvY2subW92ZSgpJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoYW5nZVhCeSA9IGRpcmVjdGlvbiA9PT0gJ2xlZnQnICA/IC1zdGVwc1xuICAgICAgICAgICAgICAgICAgICAgIDogZGlyZWN0aW9uID09PSAncmlnaHQnID8gc3RlcHNcbiAgICAgICAgICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgdmFyIGNoYW5nZVlCeSA9IGRpcmVjdGlvbiA9PT0gJ2Rvd24nID8gc3RlcHMgOiAwO1xuICAgICAgICB2YXIgbmV3T2NjdXBpZXMgPSB0aGlzLmNvcHlBcnJheSh0aGlzLm9jY3VwaWVzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5ld09jY3VwaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBuZXdPY2N1cGllc1tpXS54ID0gbmV3T2NjdXBpZXNbaV0ueCArIGNoYW5nZVhCeTtcbiAgICAgICAgICAgIG5ld09jY3VwaWVzW2ldLnkgPSBuZXdPY2N1cGllc1tpXS55ICsgY2hhbmdlWUJ5O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvdWxkTW92ZSA9IHRydWU7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmV3T2NjdXBpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmlzV2l0aGluRXh0ZW5kZWRBcmVhKG5ld09jY3VwaWVzW2ldKSkge1xuICAgICAgICAgICAgICAgIGNvdWxkTW92ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvdWxkTW92ZSA9IGNvdWxkTW92ZSA/IHRoaXMuY2hlY2tPdmVybGFwKG5ld09jY3VwaWVzLCBvY2N1cGllZEJ5T3RoZXJzKSA6IGZhbHNlO1xuXG4gICAgICAgIGlmKGNvdWxkTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5TcXVhcmUueCA9IHRoaXMub3JpZ2luU3F1YXJlLnggKyBjaGFuZ2VYQnk7XG4gICAgICAgICAgICB0aGlzLm9yaWdpblNxdWFyZS55ID0gdGhpcy5vcmlnaW5TcXVhcmUueSArIGNoYW5nZVlCeTtcbiAgICAgICAgICAgIHRoaXMub2NjdXBpZXMgPSBuZXdPY2N1cGllcy5zbGljZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvdWxkTW92ZTtcbiAgICB9XG4gICAgZHJvcChvY2N1cGllZEJ5T3RoZXJzKSB7XG4gICAgICAgIHZhciBudW1iZXJPZkRvd25zID0gMDtcbiAgICAgICAgd2hpbGUodGhpcy5tb3ZlKCdkb3duJywgb2NjdXBpZWRCeU90aGVycykpIHtcbiAgICAgICAgICAgIG51bWJlck9mRG93bnMrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVtYmVyT2ZEb3ducztcbiAgICB9XG4gICAgcm90YXRlKG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgdmFyIG5leHRSb3RhdGlvbiA9IHRoaXMucm90YXRpb24gKyAxID4gMyA/IDAgOiB0aGlzLnJvdGF0aW9uICsgMTtcbiAgICAgICAgdmFyIGNsb25lID0gdGhpcy5jbG9uZSgpO1xuICAgICAgICBjbG9uZS5yb3RhdGlvbiA9IG5leHRSb3RhdGlvbjtcbiAgICAgICAgY2xvbmUub2NjdXBpZXMgPSBjbG9uZS5nZXRPY2N1cGF0aW9uKGNsb25lLnJvdGF0aW9uKTtcblxuICAgICAgICB2YXIgbmV4dE9jY3VwYXRpb24gPSB0aGlzLmdldE9jY3VwYXRpb24obmV4dFJvdGF0aW9uKTtcblxuICAgICAgICB2YXIgYWxsQXJlV2l0aGluID0gdHJ1ZTtcbiAgICAgICAgdmFyIG1pbmltdW1YID0gY2xvbmUuYXJlYS5ob3Jpem9udGFsQmxvY2tzO1xuICAgICAgICB2YXIgbWF4aW11bVggPSAwO1xuICAgICAgICB2YXIgbWF4aW11bVkgPSAwO1xuXG4gICAgICAgIGNsb25lLm9jY3VwaWVzLm1hcCggKG9jY3VwaWVkU3F1YXJlKSA9PiB7XG4gICAgICAgICAgICBtaW5pbXVtWCA9IG9jY3VwaWVkU3F1YXJlLnggPCBtaW5pbXVtWCA/IG9jY3VwaWVkU3F1YXJlLnggOiBtaW5pbXVtWDtcbiAgICAgICAgICAgIG1heGltdW1YID0gb2NjdXBpZWRTcXVhcmUueCA+IG1heGltdW1YID8gb2NjdXBpZWRTcXVhcmUueCA6IG1heGltdW1YO1xuICAgICAgICAgICAgbWF4aW11bVkgPSBvY2N1cGllZFNxdWFyZS54ID4gbWF4aW11bVkgPyBvY2N1cGllZFNxdWFyZS55IDogbWF4aW11bVk7XG4gICAgICAgICAgICBpZighY2xvbmUuaXNXaXRoaW5FeHRlbmRlZEFyZWEob2NjdXBpZWRTcXVhcmUpKSB7XG4gICAgICAgICAgICAgICAgYWxsQXJlV2l0aGluID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciByb3RhdGlvbk9rID0gdHJ1ZTtcbiAgICAgICAgaWYoIWFsbEFyZVdpdGhpbikge1xuICAgICAgICAgICAgaWYobWluaW11bVggPCAxKSB7XG4gICAgICAgICAgICAgICAgcm90YXRpb25PayA9IGNsb25lLm1vdmUoJ3JpZ2h0Jywgb2NjdXBpZWRCeU90aGVycywgTWF0aC5hYnMobWluaW11bVgpICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG1heGltdW1YID4gY2xvbmUuYXJlYS5ob3Jpem9udGFsQmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgcm90YXRpb25PayA9IGNsb25lLm1vdmUoJ2xlZnQnLCBvY2N1cGllZEJ5T3RoZXJzLCBtYXhpbXVtWCAtIGNsb25lLmFyZWEuaG9yaXpvbnRhbEJsb2Nrcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG1heGltdW1ZID4gY2xvbmUuYXJlYS52ZXJ0aWNhbEJsb2Nrcykge1xuICAgICAgICAgICAgICAgIHJvdGF0aW9uT2sgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByb3RhdGlvbk9rID0gcm90YXRpb25PayA/IHRoaXMuY2hlY2tPdmVybGFwKGNsb25lLm9jY3VwaWVzLCBvY2N1cGllZEJ5T3RoZXJzKSA6IGZhbHNlO1xuXG4gICAgICAgIGlmKHJvdGF0aW9uT2spIHtcbiAgICAgICAgICAgIHRoaXMub2NjdXBpZXMgPSBjbG9uZS5jb3B5QXJyYXkoY2xvbmUub2NjdXBpZXMpO1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IGNsb25lLnJvdGF0aW9uO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgd2l0aEVhY2hPY2N1cGllZFNxdWFyZShkb1RoaXMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9jY3VwaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkb1RoaXModGhpcy5vY2N1cGllc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gZXh0ZW5kZWQgYXJlYSBpbmNsdWRlcyB0aGUgaGlkZGVuIHNxdWFyZXMgYWJvdmUgdGhlIHZpc2libGUgdG9wXG4gICAgaXNXaXRoaW5FeHRlbmRlZEFyZWEob2NjdXBpZWRTcXVhcmUpIHtcbiAgICAgICAgcmV0dXJuIG9jY3VwaWVkU3F1YXJlLnggPj0gMVxuICAgICAgICAgICAgJiYgb2NjdXBpZWRTcXVhcmUueCA8PSB0aGlzLmFyZWEuaG9yaXpvbnRhbEJsb2Nrc1xuICAgICAgICAgICAgJiYgb2NjdXBpZWRTcXVhcmUueSA+PSAtNFxuICAgICAgICAgICAgJiYgb2NjdXBpZWRTcXVhcmUueSA8PSB0aGlzLmFyZWEudmVydGljYWxCbG9ja3MgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIGlzV2l0aGluQXJlYShvY2N1cGllZFNxdWFyZSkge1xuICAgICAgICByZXR1cm4gb2NjdXBpZWRTcXVhcmUueCA+PSAxXG4gICAgICAgICAgICAmJiBvY2N1cGllZFNxdWFyZS54IDw9IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzXG4gICAgICAgICAgICAmJiBvY2N1cGllZFNxdWFyZS55ID49IDFcbiAgICAgICAgICAgICYmIG9jY3VwaWVkU3F1YXJlLnkgPD0gdGhpcy5hcmVhLnZlcnRpY2FsQmxvY2tzID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICBjaGVja092ZXJsYXAob25lQmxvY2tPY2N1cHksIG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbmVCbG9ja09jY3VweS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHNxdWFyZSA9IG9uZUJsb2NrT2NjdXB5W2ldO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG9jY3VwaWVkQnlPdGhlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb3RoZXJCbG9jayA9IG9jY3VwaWVkQnlPdGhlcnNbal07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IG90aGVyQmxvY2subGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgb3RoZXJTcXVhcmUgPSBvdGhlckJsb2NrW2tdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHNxdWFyZS54ID09PSBvdGhlclNxdWFyZS54ICYmIHNxdWFyZS55ID09PSBvdGhlclNxdWFyZS55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvci5tYWluO1xuICAgICAgICB0aGlzLm9jY3VwaWVzLm1hcCggKG9jY3VwaWVkU3F1YXJlKSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLmlzV2l0aGluQXJlYShvY2N1cGllZFNxdWFyZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9wWCA9IDAuNSArIHRoaXMuYXJlYS5sZWZ0ICsgKG9jY3VwaWVkU3F1YXJlLnggLSAxKSAqIHRoaXMudW5pdFNpemU7XG4gICAgICAgICAgICAgICAgdmFyIHRvcFkgPSAwLjUgKyB0aGlzLmFyZWEudG9wICsgKG9jY3VwaWVkU3F1YXJlLnkgLSAxKSAqIHRoaXMudW5pdFNpemVcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh0b3BYLCB0b3BZLCB0aGlzLnVuaXRTaXplIC0gMSwgdGhpcy51bml0U2l6ZSAtIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUodGhpcy5jb2xvci5saWdodGVyLCB0b3BYLCB0b3BZLCB0aGlzLnVuaXRTaXplIC0gMSwgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZSh0aGlzLmNvbG9yLmxpZ2h0ZXIsIHRvcFgsIHRvcFksIDAsIHRoaXMudW5pdFNpemUgLSAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMuY29sb3IuZGFya2VyLCB0b3BYLCB0b3BZICsgdGhpcy51bml0U2l6ZSAtIDEsIHRoaXMudW5pdFNpemUgLSAxLCAwKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKHRoaXMuY29sb3IuZGFya2VyLCB0b3BYICsgdGhpcy51bml0U2l6ZSAtIDEsIHRvcFksIDAsIHRoaXMudW5pdFNpemUgLSAxKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZHJhd1NoYWRvdyhvY2N1cGllZEJ5T3RoZXJzKSB7XG4gICAgICAgIHZhciBjbG9uZSA9IHRoaXMuY2xvbmUoKTtcbiAgICAgICAgY2xvbmUuY29sb3IgPSB7IG1haW46ICcjNjY2NjY2JywgbGlnaHRlcjogJyM3Nzc3NzcnLCBkYXJrZXI6ICcjNTU1NTU1JyB9O1xuICAgICAgICBjbG9uZS5kcm9wKG9jY3VwaWVkQnlPdGhlcnMpO1xuICAgICAgICBjbG9uZS5kcmF3KCk7XG4gICAgfVxuXG4gICAgcmVtb3ZlRnJvbVJvd3Mocm93cykge1xuXG4gICAgICAgIHZhciBuZXdPY2N1cGllcyA9IFtdO1xuICAgICAgICB2YXIgdW5pcXVlT2NjdXBpZWRSb3dzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLm9jY3VwaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgc3F1YXJlID0gdGhpcy5vY2N1cGllc1tqXTtcbiAgICAgICAgICAgIHZhciByb3dUb0JlRGVsZXRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gcm93c1tpXTtcblxuICAgICAgICAgICAgICAgIGlmKHNxdWFyZS55ID09PSByb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgcm93VG9CZURlbGV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIXJvd1RvQmVEZWxldGVkKSB7XG4gICAgICAgICAgICAgICAgbmV3T2NjdXBpZXMucHVzaChzcXVhcmUpO1xuICAgIFxuICAgICAgICAgICAgICAgIGlmKHVuaXF1ZU9jY3VwaWVkUm93c1stMV0gIT09IHNxdWFyZS55KSB7XG4gICAgICAgICAgICAgICAgICAgIHVuaXF1ZU9jY3VwaWVkUm93cy5wdXNoKHNxdWFyZS55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBudWxsO1xuICAgICAgICBpZih1bmlxdWVPY2N1cGllZFJvd3MubGVuZ3RoID4gMSkge1xuICAgIFxuICAgICAgICAgICAgdGhpc05ld09jY3VwaWVzID0gW107XG4gICAgICAgICAgICBuZXdCbG9ja09jY3VwaWVzID0gW107XG5cbiAgICAgICAgICAgIHZhciBibG9ja1NwbGl0c09uID0gbnVsbDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgdW5pcXVlT2NjdXBpZWRSb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYodW5pcXVlT2NjdXBpZWRSb3dzW2ldIC0gdW5pcXVlT2NjdXBpZWRSb3dzW2kgLSAxXSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2tTcGxpdHNPbiA9IHVuaXF1ZU9jY3VwaWVkUm93c1tpXSAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoYmxvY2tTcGxpdHNPbikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmV3T2NjdXBpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNxdWFyZSA9IG5ld09jY3VwaWVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZihzcXVhcmUueSA8IGJsb2NrU3BsaXRzT24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNOZXdPY2N1cGllcy5wdXNoKHNxdWFyZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCbG9ja09jY3VwaWVzLnB1c2goc3F1YXJlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMub2NjdXBpZXMgPSB0aGlzLmNvcHlBcnJheSh0aGlzTmV3T2NjdXBpZXMpO1xuICAgICAgICAgICAgICAgIG5ld0Jsb2NrID0gdGhpcy5jbG9uZSgpO1xuICAgICAgICAgICAgICAgIG5ld0Jsb2NrLm9jY3VwaWVzID0gdGhpcy5jb3B5QXJyYXkobmV3QmxvY2tPY2N1cGllcyk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub2NjdXBpZXMgPSB0aGlzLmNvcHlBcnJheShuZXdPY2N1cGllcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub2NjdXBpZXMgPSB0aGlzLmNvcHlBcnJheShuZXdPY2N1cGllcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld0Jsb2NrO1xuICAgIH1cblxuICAgIGdldE9jY3VwYXRpb24ocm90YXRpb24pIHtcbiAgICAgICAgdmFyIG5ld09jY3VwaWVzID0gW107XG5cbiAgICAgICAgdmFyIGZpbGxzID0gdGhpcy5nZXRGaWxsRm9yVHlwZVJvdGF0aW9uKHJvdGF0aW9uKTtcblxuICAgICAgICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDwgZmlsbHMubGVuZ3RoOyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgY2VsbHMgPSBmaWxsc1tyb3dJbmRleF0uc3BsaXQoJycpO1xuICAgICAgICAgICAgZm9yICh2YXIgY2VsbEluZGV4ID0gMDsgY2VsbEluZGV4IDw9IGNlbGxzLmxlbmd0aDsgY2VsbEluZGV4KyspIHtcblxuICAgICAgICAgICAgICAgIGlmKGNlbGxzW2NlbGxJbmRleF0gPT09ICcjJykge1xuICAgICAgICAgICAgICAgICAgICBuZXdPY2N1cGllcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHRoaXMub3JpZ2luU3F1YXJlLnggKyBjZWxsSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLm9yaWdpblNxdWFyZS55ICsgcm93SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3T2NjdXBpZXM7XG5cbiAgICB9XG4gICAgZHJhd0xpbmUoY29sb3IsIGZyb21YLCBmcm9tWSwgbGVuZ3RoWCwgbGVuZ3RoWSkge1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKGZyb21YLCBmcm9tWSk7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyhmcm9tWCArIGxlbmd0aFgsIGZyb21ZICsgbGVuZ3RoWSk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH1cblxuICAgIGNvbG9yRGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gJ0knID8geyBtYWluOiAnIzIyZGRkZCcsIGxpZ2h0ZXI6ICcjNTVmZmZmJywgZGFya2VyOiAnIzAwYmJiYicgfVxuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnSicgPyB7IG1haW46ICcjMmE2NGRiJywgbGlnaHRlcjogJyM0Yzg2ZmQnLCBkYXJrZXI6ICcjMDg0MmQ5JyB9XG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdMJyA/IHsgbWFpbjogJyNkZDg4MjInLCBsaWdodGVyOiAnI2ZmYWE1NScsIGRhcmtlcjogJyNiYjY2MDAnIH1cbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ08nID8geyBtYWluOiAnI2RkZGQyMicsIGxpZ2h0ZXI6ICcjZmZmZjU1JywgZGFya2VyOiAnI2JiYmIwMCcgfVxuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnUycgPyB7IG1haW46ICcjMjJiYjg4JywgbGlnaHRlcjogJyM1NWRkYWEnLCBkYXJrZXI6ICcjMDA5OTY2JyB9XG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdUJyA/IHsgbWFpbjogJyNiOTM0ZGInLCBsaWdodGVyOiAnI2RiNTZmZCcsIGRhcmtlcjogJyM5NzEyYjknIH1cbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ1onID8geyBtYWluOiAnI2RkMjIyMicsIGxpZ2h0ZXI6ICcjZmY1NTU1JywgZGFya2VyOiAnI2JiMDAwMCcgfVxuICAgICAgICAgICAgIDogICAgICAgICAgICAgICAgICAgICB7IG1haW46ICcjZmZmZmZmJywgbGlnaHRlcjogJyNmZmZmZmYnLCBkYXJrZXI6ICcjZmZmZmZmJyB9XG4gICAgICAgICAgICAgO1xuICAgIH1cbiAgICBnZXRGaWxsRm9yVHlwZVJvdGF0aW9uKHJvdGF0aW9uKSB7XG4gICAgICAgIHZhciB0eXBlUm90YXRpb25zID0ge1xuICAgICAgICAgICAgSTogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjIyMnLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjIyMnLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBKOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIEw6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyMjXycsXG4gICAgICAgICAgICAgICAgICAgICcjX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIE86IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFM6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJyNfX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgVDogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBaOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0eXBlUm90YXRpb25zW3RoaXMudHlwZV1bcm90YXRpb25dO1xuICAgIH1cbiAgICBjb3B5QXJyYXkoYXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYXJyYXkpKTtcbiAgICB9XG5cbn1cbiJdfQ==;
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
            this.heapBlocks = [];
            this.blocks = this.randomizeBlocks(this.blocksLeft());
            this.loopsPerStep = this.loopsPerStepForLevel(this.level());
            this.loopsSinceStep = 0;
            this.roundScore = _ko['default'].observable(0);
            this.hadCompletedRowsOnLastUpdate = false;
            this.game = params.game;
        }

        _createClass(TetrisRound, [{
            key: 'blockCountForLevel',
            value: function blockCountForLevel(level) {
                return level == 1 ? 40 : level == 2 ? 50 : level == 3 ? 60 : 1;
            }
        }, {
            key: 'loopsPerStepForLevel',
            value: function loopsPerStepForLevel(level) {
                return level == 1 ? 10 : level == 2 ? 8 : level == 3 ? 6 : 1000;
            }
        }, {
            key: 'activeBlock',
            value: function activeBlock() {
                return this.blocks[0];
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
                this.heapBlocks.push(this.blocks.shift());
                this.increaseScoreWith(3 * this.level() + (wasDropped ? 21 : 3));
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
                this.roundScore(this.roundScore() + groundScoreForNumberOfRows[numberOfRows] * this.level());
            }
        }, {
            key: 'activeBlockRotate',
            value: function activeBlockRotate() {
                this.activeBlock().rotate(this.allOccupiedSquares());
            }
        }, {
            key: 'activeBlockMoveLeft',
            value: function activeBlockMoveLeft() {
                this.activeBlock().move('left', this.allOccupiedSquares());
            }
        }, {
            key: 'activeBlockMoveRight',
            value: function activeBlockMoveRight() {
                this.activeBlock().move('right', this.allOccupiedSquares());
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
                console.log(occupiedPerRow);

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
                this.checkForCompletedRows();
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
                        //       console.log(howFarDropped, couldDropAnyBlock, this.allOccupiedSquares());
                    }
                    //     console.log('while/end, couldDropAnyBlock:', couldDropAnyBlock);
                    //console.log(this.heapBlocks);
                }
            }
        }, {
            key: 'handleCompletedRows',
            value: function handleCompletedRows(completedRows) {
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
        }]);

        return TetrisRound;
    })();

    exports.TetrisRound = TetrisRound;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvcm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBR2EsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUN0QixnQkFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2hDLGdCQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDeEIsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsZUFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLGdCQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixnQkFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQ3RELGdCQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUM1RCxnQkFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDeEIsZ0JBQUksQ0FBQyxVQUFVLEdBQUcsZUFBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsZ0JBQUksQ0FBQyw0QkFBNEIsR0FBRyxLQUFLLENBQUM7QUFDMUMsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztTQUMzQjs7cUJB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QUUsSUFBSSxDQUFDLElBQUk7cUJBQ2xCLENBQUMsQ0FBQyxDQUFDO2lCQUNQO0FBQ0QsdUJBQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsdUJBQU8sTUFBTSxDQUFDO2FBQ2pCOzs7bUJBQ1EsbUJBQUMsS0FBSyxFQUFFO0FBQ2IsdUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDNUM7OztlQXJTUSxXQUFXIiwiZmlsZSI6ImdzcmMvY29tcG9uZW50cy90ZXRyaXMvcm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuaW1wb3J0IHsgVGV0cmlzQmxvY2sgfSBmcm9tICcuL2Jsb2NrJztcblxuZXhwb3J0IGNsYXNzIFRldHJpc1JvdW5kIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5jdHggPSBwYXJhbXMuY3R4O1xuICAgICAgICB0aGlzLnVuaXRTaXplID0gcGFyYW1zLnVuaXRTaXplO1xuICAgICAgICB0aGlzLmFyZWEgPSBwYXJhbXMuYXJlYTtcbiAgICAgICAgdGhpcy5sZXZlbCA9IGtvLm9ic2VydmFibGUocGFyYW1zLmxldmVsKTtcbiAgICAgICAgdGhpcy5ibG9ja3NMZWZ0ID0ga28ub2JzZXJ2YWJsZSh0aGlzLmJsb2NrQ291bnRGb3JMZXZlbCh0aGlzLmxldmVsKCkpKTtcbiAgICAgICAgdGhpcy5ibG9ja3NEb25lID0ga28ub2JzZXJ2YWJsZSgwKTtcbiAgICAgICAgdGhpcy5oZWFwQmxvY2tzID0gW107XG4gICAgICAgIHRoaXMuYmxvY2tzID0gdGhpcy5yYW5kb21pemVCbG9ja3ModGhpcy5ibG9ja3NMZWZ0KCkpO1xuICAgICAgICB0aGlzLmxvb3BzUGVyU3RlcCA9IHRoaXMubG9vcHNQZXJTdGVwRm9yTGV2ZWwodGhpcy5sZXZlbCgpKTtcbiAgICAgICAgdGhpcy5sb29wc1NpbmNlU3RlcCA9IDA7XG4gICAgICAgIHRoaXMucm91bmRTY29yZSA9IGtvLm9ic2VydmFibGUoMCk7XG4gICAgICAgIHRoaXMuaGFkQ29tcGxldGVkUm93c09uTGFzdFVwZGF0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmdhbWUgPSBwYXJhbXMuZ2FtZTtcbiAgICB9XG4gICAgYmxvY2tDb3VudEZvckxldmVsKGxldmVsKSB7XG4gICAgICAgIHJldHVybiBsZXZlbCA9PSAxID8gNDBcbiAgICAgICAgICAgICA6IGxldmVsID09IDIgPyA1MFxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMyA/IDYwXG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgbG9vcHNQZXJTdGVwRm9yTGV2ZWwobGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuIGxldmVsID09IDEgPyAxMFxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMiA/IDhcbiAgICAgICAgICAgICA6IGxldmVsID09IDMgPyA2XG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgMTAwMFxuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2soKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2Nrc1swXTtcbiAgICB9XG4gICAgaXNSb3VuZENvbXBsZXRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzRG9uZSgpID09PSB0aGlzLmJsb2Nrc0xlZnQoKTtcbiAgICB9XG4gICAgaW5jcmVhc2VTY29yZVdpdGgoc2NvcmVJbmNyZWFzZSkge1xuICAgICAgICB0aGlzLnJvdW5kU2NvcmUodGhpcy5yb3VuZFNjb3JlKCkgKyBzY29yZUluY3JlYXNlKTtcbiAgICB9XG4gICAgZG9uZVdpdGhCbG9jayh3YXNEcm9wcGVkKSB7XG4gICAgICAgIC8vdGhpcy5hY3RpdmVCbG9jaygpLnJlbGF0aXZlVG9wWSA9IDA7XG4gICAgICAgIHRoaXMuYmxvY2tzRG9uZSh0aGlzLmJsb2Nrc0RvbmUoKSArIDEpO1xuICAgICAgICB0aGlzLmhlYXBCbG9ja3MucHVzaCh0aGlzLmJsb2Nrcy5zaGlmdCgpKTtcbiAgICAgICAgdGhpcy5pbmNyZWFzZVNjb3JlV2l0aCgzICogdGhpcy5sZXZlbCgpICsgKHdhc0Ryb3BwZWQgPyAyMSA6IDMpKTtcbiAgICB9XG4gICAgZ2l2ZVNjb3JlRm9yU29mdERyb3AoKSB7XG4gICAgICAgIHRoaXMuaW5jcmVhc2VTY29yZVdpdGgodGhpcy5sZXZlbCgpKTtcbiAgICB9XG4gICAgZ2l2ZVNjb3JlRm9yQ2xlYXJlZFJvd3MobnVtYmVyT2ZSb3dzKSB7XG4gICAgICAgIHZhciBncm91bmRTY29yZUZvck51bWJlck9mUm93cyA9IHtcbiAgICAgICAgICAgIDA6ICAgIDAsXG4gICAgICAgICAgICAxOiAgIDQwLFxuICAgICAgICAgICAgMjogIDEwMCxcbiAgICAgICAgICAgIDM6ICAzMDAsXG4gICAgICAgICAgICA0OiAxMjAwLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJvdW5kU2NvcmUodGhpcy5yb3VuZFNjb3JlKCkgKyBncm91bmRTY29yZUZvck51bWJlck9mUm93c1tudW1iZXJPZlJvd3NdICogdGhpcy5sZXZlbCgpKTtcbiAgICB9XG5cbiAgICBhY3RpdmVCbG9ja1JvdGF0ZSgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLnJvdGF0ZSh0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKTtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2tNb3ZlTGVmdCgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLm1vdmUoJ2xlZnQnLCB0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKTtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2tNb3ZlUmlnaHQoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlQmxvY2soKS5tb3ZlKCdyaWdodCcsIHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpO1xuICAgIH1cbiAgICBhY3RpdmVCbG9ja01vdmVEb3duKCkge1xuICAgICAgICBpZih0aGlzLmFjdGl2ZUJsb2NrKCkubW92ZSgnZG93bicsIHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpKSB7XG4gICAgICAgICAgICB0aGlzLmdpdmVTY29yZUZvclNvZnREcm9wKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWN0aXZlQmxvY2tEcm9wKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUJsb2NrKCkuZHJvcCh0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKTtcbiAgICAgICAgdGhpcy5kb25lV2l0aEJsb2NrKDEpO1xuICAgIH1cblxuICAgIG1heWJlVGFrZVN0ZXAoKSB7XG4gICAgICAgICsrdGhpcy5sb29wc1NpbmNlU3RlcDtcbiAgICAgICAgaWYodGhpcy5sb29wc1NpbmNlU3RlcCA+IHRoaXMubG9vcHNQZXJTdGVwKSB7XG4gICAgICAgICAgICB0aGlzLmxvb3BzU2luY2VTdGVwID0gMDtcbiAgICAgICAgICAgIHZhciBhYmxlVG9Nb3ZlID0gdGhpcy5hY3RpdmVCbG9jaygpLm1vdmUoJ2Rvd24nLCB0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKTtcbiAgICAgICAgICAgIGlmKCFhYmxlVG9Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kb25lV2l0aEJsb2NrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2hlY2tGb3JDb21wbGV0ZWRSb3dzKCkge1xuICAgICAgICB2YXIgY29tcGxldGVkUm93cyA9IFtdO1xuICAgICAgICB2YXIgYWxsT2NjdXBpZWRTcXVhcmVzID0gdGhpcy5hbGxPY2N1cGllZFNxdWFyZXMoKTtcblxuICAgICAgICB2YXIgb2NjdXBpZWRQZXJSb3cgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gdGhpcy5hcmVhLnZlcnRpY2FsQmxvY2tzOyBpKyspIHtcbiAgICAgICAgICAgIG9jY3VwaWVkUGVyUm93W2ldID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGFsbE9jY3VwaWVkU3F1YXJlcy5tYXAoKGJsb2NrKSA9PiB7XG4gICAgICAgICAgICBibG9jay5tYXAoIChzcXVhcmUpID0+IHtcbiAgICAgICAgICAgICAgICArK29jY3VwaWVkUGVyUm93W3NxdWFyZS55XTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2cob2NjdXBpZWRQZXJSb3cpO1xuXG4gICAgICAgIENIRUNLQ09NUExFVEVEOlxuICAgICAgICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDw9IHRoaXMuYXJlYS52ZXJ0aWNhbEJsb2Nrczsgcm93SW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIG9jY3VwaWVkU3F1YXJlc09uUm93ID0gb2NjdXBpZWRQZXJSb3dbcm93SW5kZXhdO1xuICAgICAgICAgICAgaWYob2NjdXBpZWRTcXVhcmVzT25Sb3cgPT09IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYWRDb21wbGV0ZWRSb3dzT25MYXN0VXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRSb3dzLnB1c2gocm93SW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY2VsbEluZGV4ID0gMTsgY2VsbEluZGV4IDw9IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzOyBjZWxsSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnI2ZmZic7XG5cbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgNSArIHRoaXMuYXJlYS5sZWZ0ICsgKGNlbGxJbmRleCAtIDEpICogdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDUgKyB0aGlzLmFyZWEudG9wICsgKHJvd0luZGV4IC0gMSkgKiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51bml0U2l6ZSAtIDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51bml0U2l6ZSAtIDEwXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLmN0eC5maWxsUmVjdChcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgMC41ICsgdGhpcy5hcmVhLmxlZnQgKyAoY2VsbEluZGV4IC0gMSkgKiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAwLjUgKyB0aGlzLmFyZWEudG9wICsgKHJvd0luZGV4IC0gMSkgKiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgICAgICAvLyAgICB0aGlzLnVuaXRTaXplIC0gMSxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgdGhpcy51bml0U2l6ZSAtIDFcbiAgICAgICAgICAgICAgICAgICAgLy8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGNvbXBsZXRlZFJvd3MubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbmV3SGVhcEJsb2NrcyA9IFtdO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NvbXBsZXRlZDogJywgY29tcGxldGVkUm93cyk7XG4gICAgICAgICAgICAvL3RoaXMuZ2FtZS5wYXVzZWQodHJ1ZSk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oZWFwQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJsb2NrID0gdGhpcy5oZWFwQmxvY2tzW2ldO1xuXG4gICAgICAgICAgICAgICAgdmFyIHBvc3NpYmxlTmV3QmxvY2sgPSBibG9jay5yZW1vdmVGcm9tUm93cyhjb21wbGV0ZWRSb3dzKTtcbiAgICAgICAgICAgICAgICBpZihwb3NzaWJsZU5ld0Jsb2NrICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0hlYXBCbG9ja3MucHVzaChwb3NzaWJsZU5ld0Jsb2NrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoYmxvY2sub2NjdXBpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0hlYXBCbG9ja3MucHVzaChibG9jayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmhlYXBCbG9ja3MgPSBuZXdIZWFwQmxvY2tzO1xuICAgICAgICB9XG5cbi8qXG5cbiAgICAgICAgZm9yICh2YXIgcm93ID0gMDsgcm93IDwgdGhpcy5hcmVhLnZlcnRpY2FsQmxvY2tzOyByb3crKykge1xuICAgICAgICAgICAgdmFyIGNvbXBsZXRlZENlbGxzID0gMDtcblxuICAgICAgICAgICAgZm9yICh2YXIgYmxvY2tJbmRleCA9IDA7IGJsb2NrSW5kZXggPCB0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcy5sZW5ndGg7IGJsb2NrSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHZhciBibG9jayA9IHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzW2Jsb2NrSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgc3F1YXJlSW5kZXggPSAwOyBzcXVhcmVJbmRleCA8IGJsb2NrLmxlbmd0aDsgc3F1YXJlSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3F1YXJlID0gYmxvY2tbc3F1YXJlSW5kZXhdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHNxdWFyZS55ID09IHJvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkQ2VsbHMgPSBjb21wbGV0ZWRDZWxscyArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihjb21wbGV0ZWRDZWxscyA9PT0gdGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3MpIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRSb3dzLnB1c2gocm93KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGNvbXBsZXRlZFJvd3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5naXZlU2NvcmVGb3JDbGVhcmVkUm93cyhjb21wbGV0ZWRSb3dzLmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNvbXBsZXRlZFJvd3MoY29tcGxldGVkUm93cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlZFJvd3MubGVuZ3RoID4gMCA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgKi9cblxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYodGhpcy5oYWRDb21wbGV0ZWRSb3dzT25MYXN0VXBkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLmRyb3BBZnRlckNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgdGhpcy5oYWRDb21wbGV0ZWRSb3dzT25MYXN0VXBkYXRlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1heWJlVGFrZVN0ZXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgdGhpcy5jaGVja0ZvckNvbXBsZXRlZFJvd3MoKTtcblxuICAgIH1cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUJsb2NrKCkuZHJhd1NoYWRvdyh0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKTtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLmRyYXcoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhlYXBCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaGVhcEJsb2Nrc1tpXS5kcmF3KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZHJvcEFmdGVyQ29tcGxldGVkKCkge1xuICAgICAgICB2YXIgY291bGREcm9wQW55QmxvY2sgPSB0cnVlO1xuXG4gICAgICAgIHdoaWxlKGNvdWxkRHJvcEFueUJsb2NrKSB7XG4gICAgICAgICAgICBjb3VsZERyb3BBbnlCbG9jayA9IGZhbHNlO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaGVhcEJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBob3dGYXJEcm9wcGVkID0gdGhpcy5oZWFwQmxvY2tzW2ldLmRyb3AodGhpcy5hbGxPY2N1cGllZFNxdWFyZXNFeHBlY3RCbG9ja0luZGV4KGkpKTtcbiAgICAgICAgICAgICAgICBpZihob3dGYXJEcm9wcGVkID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb3VsZERyb3BBbnlCbG9jayA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgLy8gICAgICAgY29uc29sZS5sb2coaG93RmFyRHJvcHBlZCwgY291bGREcm9wQW55QmxvY2ssIHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnd2hpbGUvZW5kLCBjb3VsZERyb3BBbnlCbG9jazonLCBjb3VsZERyb3BBbnlCbG9jayk7XG4vL2NvbnNvbGUubG9nKHRoaXMuaGVhcEJsb2Nrcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaGFuZGxlQ29tcGxldGVkUm93cyhjb21wbGV0ZWRSb3dzKSB7XG4gICAgICAgIC8qZm9yICh2YXIgcm93SW5kZXggPSAwOyByb3dJbmRleCA8IGNvbXBsZXRlZFJvd3MubGVuZ3RoOyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgcm93ID0gY29tcGxldGVkUm93c1tyb3dJbmRleF07XG4gICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnI2ZmZic7XG4gICAgICAgICAgICBmb3IgKHZhciBjZWxsSW5kZXggPSAwOyBjZWxsSW5kZXggPCB0aGlzLmFyZWEuaG9yaXpvbnRhbEJsb2NrczsgY2VsbEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcmVhLmxlZnQgKyBjZWxsSW5kZXggKiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFyZWEudG9wICsgcm93ICogdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bml0U2l6ZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBibG9ja0luZGV4ID0gMDsgYmxvY2tJbmRleCA8IHRoaXMuYmxvY2tzRG9uZSgpOyBibG9ja0luZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmJsb2Nrc1tibG9ja0luZGV4XTtcbiAgICAgICAgICAgICAgICBibG9jay5yZW1vdmVGcm9tUm93KHJvdyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhQmxvY2tDb3VsZERyb3AgPSB0cnVlO1xuICAgICAgICB3aGlsZShhQmxvY2tDb3VsZERyb3ApIHtcbiAgICAgICAgICAgIGFCbG9ja0NvdWxkRHJvcCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBibG9ja0luZGV4ID0gMDsgYmxvY2tJbmRleCA8IHRoaXMuYmxvY2tzRG9uZSgpOyBibG9ja0luZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb2NjdXBpZWRFeGNlcHRUaGlzID0gdGhpcy5hbGxPY2N1cGllZFNxdWFyZXNFeHBlY3RCbG9ja0luZGV4KGJsb2NrSW5kZXgpO1xuICAgICAgICAgICAgICAgIHZhciBibG9jayA9IHRoaXMuYmxvY2tzW2Jsb2NrSW5kZXhdO1xuICAgICAgICAgICAgICAgIGFCbG9ja0NvdWxkRHJvcCA9IGJsb2NrLm1vdmVEb3duKG9jY3VwaWVkRXhjZXB0VGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhQmxvY2tDb3VsZERyb3ApO1xuICAgICAgICB9Ki9cbiAgICB9XG4gICAgYWxsT2NjdXBpZWRTcXVhcmVzKCkge1xuICAgICAgICB2YXIgYWxsT2NjdXBpZWRTcXVhcmVzID0gW107XG5cbiAgICAgICAgT0NDVVBJRUQ6XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oZWFwQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmhlYXBCbG9ja3NbaV07XG5cbiAgICAgICAgICAgIGlmKGJsb2NrLm9jY3VwaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGFsbE9jY3VwaWVkU3F1YXJlcy5wdXNoKGJsb2NrLm9jY3VwaWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxsT2NjdXBpZWRTcXVhcmVzO1xuICAgIH1cbiAgICBhbGxPY2N1cGllZFNxdWFyZXNFeHBlY3RCbG9ja0luZGV4KGV4Y2VwdEJsb2NrSW5kZXgpIHtcbiAgICAgICAgdmFyIGFsbE9jY3VwaWVkU3F1YXJlcyA9IFtdO1xuXG4gICAgICAgIE9DQ1VQSUVEOlxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaGVhcEJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYoaSA9PT0gZXhjZXB0QmxvY2tJbmRleCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlIE9DQ1VQSUVEO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWxsT2NjdXBpZWRTcXVhcmVzLnB1c2godGhpcy5oZWFwQmxvY2tzW2ldLm9jY3VwaWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxsT2NjdXBpZWRTcXVhcmVzO1xuICAgIH1cblxuICAgIHJhbmRvbWl6ZUJsb2NrcyhhbW91bnQpIHtcbiAgICAgICAgdmFyIGJsb2NrcyA9IFtdO1xuICAgICAgICB2YXIgYmxvY2tUeXBlcyA9IFsnSScsICdKJywgJ0wnLCAnTycsICdTJywgJ1QnLCAnWiddO1xuICAgICAgICB2YXIgcm90YXRpb24gPSBbMCwgMSwgMiwgM107XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IGFtb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBibG9ja3MucHVzaChuZXcgVGV0cmlzQmxvY2soe1xuICAgICAgICAgICAgICAgIHR5cGU6IGJsb2NrVHlwZXNbIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGJsb2NrVHlwZXMubGVuZ3RoKSBdLFxuICAgICAgICAgICAgICAgIHJvdGF0aW9uOiByb3RhdGlvblsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcm90YXRpb24ubGVuZ3RoKSBdLFxuICAgICAgICAgICAgICAgIHVuaXRTaXplOiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgIG9yaWdpblNxdWFyZTogeyB4OiBNYXRoLmZsb29yKHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzIC8gMiksIHk6IC0yIH0sXG4gICAgICAgICAgICAgICAgY3R4OiB0aGlzLmN0eCxcbiAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLmFyZWEsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYmxvY2tzKTtcbiAgICAgICAgcmV0dXJuIGJsb2NrcztcbiAgICB9XG4gICAgY29weUFycmF5KGFycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFycmF5KSk7XG4gICAgfVxuXG59Il19;
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
            console.log(this);

            this.round = new _round.TetrisRound({
                level: 1,
                unitSize: this.unitSize,
                ctx: this.ctx,
                area: this.area,
                game: this
            });
            this.totalScore = _ko['default'].observable(0);
            this.currentRoundScore = _ko['default'].observable(this.round.roundScore);

            $(document).keydown(function (e) {
                if (e.which === 38) {
                    _this.round.activeBlockRotate();
                    //this.block2.rotate();
                } else if (e.which === 37) {
                        _this.round.activeBlockMoveLeft();
                        //this.block2.move('left');
                    } else if (e.which === 39) {
                            _this.round.activeBlockMoveRight();
                            //this.block2.move('right');
                        } else if (e.which === 40) {
                                _this.round.activeBlockMoveDown();
                                //this.block2.move('down');
                            } else if (e.which === 32) {
                                    _this.round.activeBlockDrop();
                                    //this.block2.drop();
                                } else if (e.which === 80) {
                                        _this.paused(!_this.paused());
                                        console.log('Paused!');
                                    }
            });
            //        this.block2 = new TetrisBlock({
            //            type: 'J',
            //            rotation: 0,
            //            unitSize: this.unitSize,
            //            originSquare: { x: 1, y: 1},
            //            ctx: this.ctx,
            //            area: this.area,
            //        });
            //  this.block2moves = ['right', 'right', 'right', 'down', 'down', 'down', 'left', 'left', 'left', 'left', 'left', 'rotate', 'rotate', 'left', 'right', 'right', 'rotate', 'left', 'rotate', 'right', 'rotate', 'left', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'right', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down'];
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
                if (!this.paused()) {
                    this.draw();
                    this.round.update();
                    //  var nextBlock2Move = this.block2moves.shift();
                    //  console.log(nextBlock2Move);
                    //  if(nextBlock2Move === 'rotate') {
                    //      this.block2.rotate();
                    //  }
                    //  else {
                    //      this.block2.move(nextBlock2Move);
                    //  }
                    //  this.block2.draw();

                    if (this.round.isRoundCompleted()) {
                        console.log('Done!');
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFLTSxNQUFNO0FBQ0csaUJBRFQsTUFBTSxDQUNJLE1BQU0sRUFBRTs7O2tDQURsQixNQUFNOztBQUVKLGdCQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6QyxxQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLHFCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7O0FBRXpDLGdCQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkMsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFekMsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDOztBQUVuQixnQkFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDMUIsZ0JBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQzs7QUFFeEIsZ0JBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUM7QUFDN0MsZ0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDO0FBQzVDLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4RCxnQkFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcs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ZSI6ImdzcmMvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGtvIGZyb20gJ2tub2Nrb3V0JztcbmltcG9ydCB0ZW1wbGF0ZU1hcmt1cCBmcm9tICd0ZXh0IS4vdGV0cmlzLmh0bWwnO1xuaW1wb3J0IHsgVGV0cmlzUm91bmQgfSBmcm9tICcuL3JvdW5kJztcbmltcG9ydCB7IFRldHJpc0Jsb2NrLCBUZXRyaXNCbG9jazIgfSBmcm9tICcuL2Jsb2NrJztcblxuY2xhc3MgVGV0cmlzIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdmFyICRnYW1lQXJlYSA9ICQoJyN0ZXRyaXMtcGFnZSBjYW52YXMnKTtcbiAgICAgICAgJGdhbWVBcmVhWzBdLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICRnYW1lQXJlYVswXS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5jYW52YXNXaWR0aCA9ICRnYW1lQXJlYS53aWR0aCgpO1xuICAgICAgICB0aGlzLmNhbnZhc0hlaWdodCA9ICRnYW1lQXJlYS5oZWlnaHQoKTtcbiAgICAgICAgdGhpcy5jdHggPSAkZ2FtZUFyZWFbMF0uZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB0aGlzLnVuaXRTaXplID0gMjA7XG5cbiAgICAgICAgdmFyIGhvcml6b250YWxCbG9ja3MgPSAxMDtcbiAgICAgICAgdmFyIHZlcnRpY2FsQmxvY2tzID0gMjA7XG5cbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy51bml0U2l6ZSAqIGhvcml6b250YWxCbG9ja3M7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLnVuaXRTaXplICogdmVydGljYWxCbG9ja3M7XG4gICAgICAgIHZhciBsZWZ0ID0gTWF0aC5mbG9vcih0aGlzLmNhbnZhc1dpZHRoIC8gMiAtIHdpZHRoIC8gMik7XG4gICAgICAgIHZhciB0b3AgPSBNYXRoLmZsb29yKHRoaXMuY2FudmFzSGVpZ2h0IC8gMiAtIGhlaWdodCAvIDIpO1xuXG4gICAgICAgIHRoaXMuYXJlYSA9IHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgcmlnaHQ6IHRoaXMubGVmdCArIHdpZHRoLFxuICAgICAgICAgICAgYm90dG9tOiB0aGlzLnRvcCArIGhlaWdodCxcbiAgICAgICAgICAgIGhvcml6b250YWxCbG9ja3M6IGhvcml6b250YWxCbG9ja3MsXG4gICAgICAgICAgICB2ZXJ0aWNhbEJsb2NrczogdmVydGljYWxCbG9ja3MsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucGF1c2VkID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuXG4gICAgICAgIHRoaXMucm91bmQgPSBuZXcgVGV0cmlzUm91bmQoe1xuICAgICAgICAgICAgbGV2ZWw6IDEsXG4gICAgICAgICAgICB1bml0U2l6ZTogdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgIGN0eDogdGhpcy5jdHgsXG4gICAgICAgICAgICBhcmVhOiB0aGlzLmFyZWEsXG4gICAgICAgICAgICBnYW1lOiB0aGlzLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50b3RhbFNjb3JlID0ga28ub2JzZXJ2YWJsZSgwKTtcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmRTY29yZSA9IGtvLm9ic2VydmFibGUodGhpcy5yb3VuZC5yb3VuZFNjb3JlKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5rZXlkb3duKChlKSA9PiB7XG4gICAgICAgICAgICBpZihlLndoaWNoID09PSAzOCkge1xuICAgICAgICAgICAgICAgIHRoaXMucm91bmQuYWN0aXZlQmxvY2tSb3RhdGUoKTtcbiAgICAgICAgICAgICAgICAvL3RoaXMuYmxvY2syLnJvdGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihlLndoaWNoID09PSAzNykge1xuICAgICAgICAgICAgICAgIHRoaXMucm91bmQuYWN0aXZlQmxvY2tNb3ZlTGVmdCgpO1xuICAgICAgICAgICAgICAgIC8vdGhpcy5ibG9jazIubW92ZSgnbGVmdCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZihlLndoaWNoID09PSAzOSkge1xuICAgICAgICAgICAgICAgIHRoaXMucm91bmQuYWN0aXZlQmxvY2tNb3ZlUmlnaHQoKTtcbiAgICAgICAgICAgICAgICAvL3RoaXMuYmxvY2syLm1vdmUoJ3JpZ2h0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGUud2hpY2ggPT09IDQwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3VuZC5hY3RpdmVCbG9ja01vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgLy90aGlzLmJsb2NrMi5tb3ZlKCdkb3duJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGUud2hpY2ggPT09IDMyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3VuZC5hY3RpdmVCbG9ja0Ryb3AoKTtcbiAgICAgICAgICAgICAgICAvL3RoaXMuYmxvY2syLmRyb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gODApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdXNlZCghdGhpcy5wYXVzZWQoKSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BhdXNlZCEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4vLyAgICAgICAgdGhpcy5ibG9jazIgPSBuZXcgVGV0cmlzQmxvY2soe1xuLy8gICAgICAgICAgICB0eXBlOiAnSicsXG4vLyAgICAgICAgICAgIHJvdGF0aW9uOiAwLFxuLy8gICAgICAgICAgICB1bml0U2l6ZTogdGhpcy51bml0U2l6ZSxcbi8vICAgICAgICAgICAgb3JpZ2luU3F1YXJlOiB7IHg6IDEsIHk6IDF9LFxuLy8gICAgICAgICAgICBjdHg6IHRoaXMuY3R4LFxuLy8gICAgICAgICAgICBhcmVhOiB0aGlzLmFyZWEsXG4vLyAgICAgICAgfSk7XG4gICAgICAvLyAgdGhpcy5ibG9jazJtb3ZlcyA9IFsncmlnaHQnLCAncmlnaHQnLCAncmlnaHQnLCAnZG93bicsICdkb3duJywgJ2Rvd24nLCAnbGVmdCcsICdsZWZ0JywgJ2xlZnQnLCAnbGVmdCcsICdsZWZ0JywgJ3JvdGF0ZScsICdyb3RhdGUnLCAnbGVmdCcsICdyaWdodCcsICdyaWdodCcsICdyb3RhdGUnLCAnbGVmdCcsICdyb3RhdGUnLCAncmlnaHQnLCAncm90YXRlJywgJ2xlZnQnLCAncmlnaHQnLCAncmlnaHQnLCAncmlnaHQnLCAncmlnaHQnLCAncmlnaHQnLCAncmlnaHQnLCAncmlnaHQnLCAncmlnaHQnLCAncmlnaHQnLCAncmlnaHQnLCAnZG93bicsICdkb3duJywgJ2Rvd24nLCAnZG93bicsICdkb3duJywgJ2Rvd24nLCAnZG93bicsICdkb3duJywgJ2Rvd24nLCAnZG93bicsICdkb3duJywgJ2Rvd24nLCAnZG93bicsICdkb3duJywgJ2Rvd24nXTtcbiAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICcjNzc3JztcbiAgICAgICAgLy8gZ2FtZSBhcmVhXG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMuYXJlYS5sZWZ0LCB0aGlzLmFyZWEudG9wLCB0aGlzLmFyZWEud2lkdGgsIHRoaXMuYXJlYS5oZWlnaHQpO1xuXG4gICAgICAgIC8vIGdyaWRcbiAgICAgICAgdmFyIGMgPSB0aGlzLmN0eDtcbiAgICAgICAgZm9yICh2YXIgeCA9IDE7IHggPCB0aGlzLmFyZWEuaG9yaXpvbnRhbEJsb2NrczsgeCsrKSB7XG4gICAgICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgYy5tb3ZlVG8oeCAqIHRoaXMudW5pdFNpemUgKyB0aGlzLmFyZWEubGVmdCwgdGhpcy5hcmVhLnRvcCk7XG4gICAgICAgICAgICBjLmxpbmVUbyh4ICogdGhpcy51bml0U2l6ZSArIHRoaXMuYXJlYS5sZWZ0LCB0aGlzLmFyZWEudG9wICArIHRoaXMuYXJlYS5oZWlnaHQpO1xuICAgICAgICAgICAgYy5zdHJva2VTdHlsZSA9ICcjODg4JztcbiAgICAgICAgICAgIGMuc3Ryb2tlKCk7XG4gICAgICAgICAgICAvL2ZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5hcmVhLnZlcnRpY2FsQmxvY2tzOyB5KyspIHtcbiAgICAgICAgICAgIC8vfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGlmKCF0aGlzLnBhdXNlZCgpKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgICAgIHRoaXMucm91bmQudXBkYXRlKCk7XG4gICAgICAgICAgLy8gIHZhciBuZXh0QmxvY2syTW92ZSA9IHRoaXMuYmxvY2sybW92ZXMuc2hpZnQoKTtcbiAgICAgICAgICAvLyAgY29uc29sZS5sb2cobmV4dEJsb2NrMk1vdmUpO1xuICAgICAgICAgIC8vICBpZihuZXh0QmxvY2syTW92ZSA9PT0gJ3JvdGF0ZScpIHtcbiAgICAgICAgICAvLyAgICAgIHRoaXMuYmxvY2syLnJvdGF0ZSgpO1xuICAgICAgICAgIC8vICB9XG4gICAgICAgICAgLy8gIGVsc2Uge1xuICAgICAgICAgIC8vICAgICAgdGhpcy5ibG9jazIubW92ZShuZXh0QmxvY2syTW92ZSk7XG4gICAgICAgICAgLy8gIH1cbiAgICAgICAgICAvLyAgdGhpcy5ibG9jazIuZHJhdygpO1xuXG4gICAgICAgICAgICBpZih0aGlzLnJvdW5kLmlzUm91bmRDb21wbGV0ZWQoKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEb25lIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgc2VsZi5ydW4oKSB9LCAyNSk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgLy8gVGhpcyBydW5zIHdoZW4gdGhlIGNvbXBvbmVudCBpcyB0b3JuIGRvd24uIFB1dCBoZXJlIGFueSBsb2dpYyBuZWNlc3NhcnkgdG8gY2xlYW4gdXAsXG4gICAgICAgIC8vIGZvciBleGFtcGxlIGNhbmNlbGxpbmcgc2V0VGltZW91dHMgb3IgZGlzcG9zaW5nIEtub2Nrb3V0IHN1YnNjcmlwdGlvbnMvY29tcHV0ZWRzLlxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgeyB2aWV3TW9kZWw6IFRldHJpcywgdGVtcGxhdGU6IHRlbXBsYXRlTWFya3VwIH07XG4iXX0=;