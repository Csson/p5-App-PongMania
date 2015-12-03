
define('text!components/tetris/tetris.html',[],function () { return '<div id="tetris-page">\n    <canvas class="full"></canvas>\n</div>\n<div id="title">TETRIS</div>\n<div id="scorer">\n    <div>\n        <h2>score</h2>\n        <p data-bind="text: score"></p>\n    </div>\n    <div>\n        <h2>level</h2>\n        <p data-bind="text: level"></p>\n    </div>\n    <div>\n        <h2>completed rows</h2>\n        <p data-bind="text: completedRows"></p>\n    </div>\n</div>\n<div class="splash" data-bind="visible: anyKeyToStart">\n    <h2>Press any key to start game</h2>\n    <ul class="list-unstyled">\n        <li><b>Controls:</b></li>\n        <li>Up arrow: rotate</li>\n        <li>Left/right arrow: move block</li>\n        <li>Down arrow: drop block softly</li>\n        <li>Space: drop block all the way</li>\n        <li>P: Pause</li>\n    </ul>\n</div>\n<div class="splash" data-bind="visible: paused">\n    <h2>The game is paused</h2>\n    <p>Press P to resume playing</p>\n</div>\n<div class="splash" data-bind="visible: gameIsOver">\n    <h2>Game over!</h2>\n    <p>You got <b data-bind="text: score"></b> points</p>\n    <p>Press Enter to play again</p>\n</div>\n<div class="splash" data-bind="visible: gameIsCompleted">\n    <h2>You completed the game!</h2>\n    <p>You got <b data-bind="text: score"></b> points</p>\n    <p>Press Enter to play again</p>\n</div>\n';});

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

            var horizontalBlocks = 10;
            var verticalBlocks = 20;
            this.unitSize = Math.round(this.canvasHeight * 0.7 / verticalBlocks);

            var width = this.unitSize * horizontalBlocks;
            var height = this.unitSize * verticalBlocks;
            var left = Math.floor(this.canvasWidth / 2 - width / 2);
            var top = Math.floor(this.canvasHeight / 2 - height / 2);
            $('#title').css({ top: top / 4, fontSize: top / 2 });
            $('#scorer').css({ left: left + width + this.unitSize });
            $('#scorer').css({ top: top });
            $('#scorer h2').css({ fontSize: this.unitSize * 1.2 });
            $('#scorer p').css({ fontSize: this.unitSize * 2.4, marginTop: -this.unitSize });

            $('.splash').css({ top: top + this.unitSize * 2, width: this.unitSize * 24, marginLeft: -this.unitSize * 12 - 10 });
            $('.splash h2').css({ fontSize: this.unitSize * 1.5 });
            $('.splash ul, .splash p').css({ fontSize: this.unitSize * 0.7 });

            this.area = {
                left: left,
                top: top,
                width: width,
                height: height,
                right: left + width,
                bottom: top + height,
                horizontalBlocks: horizontalBlocks,
                verticalBlocks: verticalBlocks
            };
            var nextBlockAreaLeft = left - this.unitSize * 7;
            this.nextBlockArea = {
                left: nextBlockAreaLeft,
                top: top,
                width: this.unitSize * 6,
                height: this.unitSize * 6,
                right: nextBlockAreaLeft + this.unitSize * 6,
                bottom: top + this.unitSize * 6,
                horizontalBlocks: 6,
                verticalBlocks: 6
            };
            this.level = _ko['default'].observable(1);
            this.completedRows = _ko['default'].observable(0);
            this.score = _ko['default'].observable(0);
            this.paused = _ko['default'].observable(false);
            this.gameIsOver = _ko['default'].observable(false);
            this.gameIsCompleted = _ko['default'].observable(false);
            this.anyKeyToStart = _ko['default'].observable(true);
            this.resetGame();

            $(document).keydown(function (e) {
                if (_this.gameIsRunning()) {
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
                if (_this.anyKeyToStart()) {
                    _this.anyKeyToStart(false);
                }
                if ((_this.gameIsOver() || _this.gameIsCompleted()) && e.which === 13) {
                    _this.resetGame();
                }
            });
            this.run();
        }

        _createClass(Tetris, [{
            key: 'resetGame',
            value: function resetGame() {
                this.heapBlocks = [];
                this.blocks = this.getBagOfBlocks();
                this.level(1);
                this.loopsPerStep = this.loopsPerStepForLevel(1);
                this.loopsSinceStep = 0;
                this.hadCompletedRowsOnLastUpdate = false;
                this.completedRows(0);
                this.score(0);
                this.gameIsOver(false);
                this.gameIsCompleted(false);
            }
        }, {
            key: 'gameIsRunning',
            value: function gameIsRunning() {
                return !(this.paused() || this.anyKeyToStart() || this.gameIsOver() || this.gameIsCompleted());
            }
        }, {
            key: 'drawArea',
            value: function drawArea() {
                this.ctx.clearRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = '#777';
                // game area
                this.ctx.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);

                // next blocks area
                this.ctx.fillRect(this.nextBlockArea.left, this.nextBlockArea.top, this.nextBlockArea.width, this.nextBlockArea.height);

                // grid
                var c = this.ctx;
                c.lineWidth = 1;
                this.ctx.lineCap = 'butt';
                for (var x = 1; x < this.area.horizontalBlocks; x++) {
                    this.drawLine(1, '#888', x * this.unitSize + this.area.left, this.area.top, 0, this.area.height);
                }
            }
        }, {
            key: 'run',
            value: function run() {
                if (this.anyKeyToStart()) {
                    this.drawArea();
                } else if (this.gameIsRunning()) {
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
                return level == 1 ? 20 : level == 2 ? 18 : level == 3 ? 16 : level == 4 ? 14 : level == 5 ? 12 : level == 6 ? 10 : level == 7 ? 9 : level == 8 ? 8 : level == 9 ? 7 : level == 10 ? 5 : 99999 // magic
                ;
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
                    if (this.loopsPerStepForLevel(this.level()) >= 99999) {
                        this.gameIsCompleted(true);
                        return;
                    }
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
            value: function doneWithBlock() {
                var dropDistance = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

                if (this.activeBlock().originSquare.y < 1) {
                    this.gameIsOver(true);
                    return;
                }
                this.heapBlocks.push(this.blocks.shift());
                if (dropDistance > 0) {
                    this.increaseScoreWith(3 * this.level() + dropDistance + 3);
                }
                if (this.blocks.length < 4) {
                    this.blocks = this.blocks.concat(this.getBagOfBlocks());
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
                this.doneWithBlock(this.activeBlock().drop(this.allOccupiedSquares()));
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
                        }
                    }
                }

                if (completedRows.length) {
                    var newHeapBlocks = [];

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
                    //this.dropAfterCompleted();
                    this.hadCompletedRowsOnLastUpdate = false;
                } else {
                    this.maybeTakeStep();
                }
                this.draw();

                var totalCompletedRows = 0;
                HADCOMPLETED: while (1) {
                    var completedRows = this.checkForCompletedRows();
                    if (!completedRows) {
                        break HADCOMPLETED;
                    }
                    totalCompletedRows += completedRows;
                    this.dropAfterCompleted();
                }
                if (totalCompletedRows) {
                    this.giveScoreForClearedRows(totalCompletedRows);
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

                var nextBlock = this.blocks[1];
                console.log(nextBlock);

                var displayedNextBlock = new _block.TetrisBlock({
                    type: nextBlock.type,
                    rotation: nextBlock.rotation,
                    unitSize: this.unitSize,
                    originSquare: { x: 2, y: 2 },
                    ctx: this.ctx,
                    area: this.nextBlockArea
                });
                console.log(displayedNextBlock);
                displayedNextBlock.draw();
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
                        originSquare: { x: Math.floor(this.area.horizontalBlocks / 2) - 1, y: -2 },
                        ctx: this.ctx,
                        area: this.area
                    }));
                }
                return blocks;
            }
        }, {
            key: 'copyArray',
            value: function copyArray(array) {
                return JSON.parse(JSON.stringify(array));
            }
        }, {
            key: 'drawLine',
            value: function drawLine(lineWidth, color, fromX, fromY, lengthX, lengthY) {
                this.ctx.lineWidth = lineWidth;
                this.ctx.strokeStyle = color;
                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(fromX + lengthX, fromY + lengthY);
                this.ctx.stroke();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFJTSxNQUFNO0FBQ0csaUJBRFQsTUFBTSxDQUNJLE1BQU0sRUFBRTs7O2tDQURsQixNQUFNOztBQUVKLGdCQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6QyxxQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLHFCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7O0FBR3pDLGdCQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkMsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFekMsZ0JBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzFCLGdCQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDeEIsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsR0FBRyxjQUFjLENBQUMsQ0FBQzs7QUFHckUsZ0JBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUM7QUFDN0MsZ0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDO0FBQzVDLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4RCxnQkFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekQsYUFBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyRCxhQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDekQsYUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQy9CLGFBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELGFBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7O0FBRWxGLGFBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3BILGFBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELGFB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T0FBTyxFQUFFLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQztBQUNsRCxvQkFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNyQjs7O21CQUVNLG1CQUFHOzs7YUFHVDs7O2VBdFlDLE1BQU07OztxQkF5WUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsNEJBQWdCLEVBQUUiLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL3RldHJpcy90ZXRyaXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuaW1wb3J0IHRlbXBsYXRlTWFya3VwIGZyb20gJ3RleHQhLi90ZXRyaXMuaHRtbCc7XG5pbXBvcnQgeyBUZXRyaXNCbG9jayB9IGZyb20gJy4vYmxvY2snO1xuXG5jbGFzcyBUZXRyaXMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB2YXIgJGdhbWVBcmVhID0gJCgnI3RldHJpcy1wYWdlIGNhbnZhcycpO1xuICAgICAgICAkZ2FtZUFyZWFbMF0ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgJGdhbWVBcmVhWzBdLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXG4gICAgICAgIHRoaXMuY2FudmFzV2lkdGggPSAkZ2FtZUFyZWEud2lkdGgoKTtcbiAgICAgICAgdGhpcy5jYW52YXNIZWlnaHQgPSAkZ2FtZUFyZWEuaGVpZ2h0KCk7XG4gICAgICAgIHRoaXMuY3R4ID0gJGdhbWVBcmVhWzBdLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdmFyIGhvcml6b250YWxCbG9ja3MgPSAxMDtcbiAgICAgICAgdmFyIHZlcnRpY2FsQmxvY2tzID0gMjA7XG4gICAgICAgIHRoaXMudW5pdFNpemUgPSBNYXRoLnJvdW5kKHRoaXMuY2FudmFzSGVpZ2h0ICogMC43IC8gdmVydGljYWxCbG9ja3MpO1xuXG5cbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy51bml0U2l6ZSAqIGhvcml6b250YWxCbG9ja3M7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLnVuaXRTaXplICogdmVydGljYWxCbG9ja3M7XG4gICAgICAgIHZhciBsZWZ0ID0gTWF0aC5mbG9vcih0aGlzLmNhbnZhc1dpZHRoIC8gMiAtIHdpZHRoIC8gMik7XG4gICAgICAgIHZhciB0b3AgPSBNYXRoLmZsb29yKHRoaXMuY2FudmFzSGVpZ2h0IC8gMiAtIGhlaWdodCAvIDIpO1xuICAgICAgICAkKCcjdGl0bGUnKS5jc3MoeyB0b3A6IHRvcCAvIDQsIGZvbnRTaXplOiB0b3AgLyAyIH0pO1xuICAgICAgICAkKCcjc2NvcmVyJykuY3NzKHsgbGVmdDogbGVmdCArIHdpZHRoICsgdGhpcy51bml0U2l6ZSB9KTtcbiAgICAgICAgJCgnI3Njb3JlcicpLmNzcyh7IHRvcDogdG9wIH0pO1xuICAgICAgICAkKCcjc2NvcmVyIGgyJykuY3NzKHsgZm9udFNpemU6IHRoaXMudW5pdFNpemUgKiAxLjIgfSk7XG4gICAgICAgICQoJyNzY29yZXIgcCcpLmNzcyh7IGZvbnRTaXplOiB0aGlzLnVuaXRTaXplICogMi40LCBtYXJnaW5Ub3A6IC0gdGhpcy51bml0U2l6ZSB9KTtcblxuICAgICAgICAkKCcuc3BsYXNoJykuY3NzKHsgdG9wOiB0b3AgKyB0aGlzLnVuaXRTaXplICogMiwgd2lkdGg6IHRoaXMudW5pdFNpemUgKiAyNCwgbWFyZ2luTGVmdDogLXRoaXMudW5pdFNpemUgKiAxMiAtIDEwIH0pO1xuICAgICAgICAkKCcuc3BsYXNoIGgyJykuY3NzKHsgZm9udFNpemU6IHRoaXMudW5pdFNpemUgKiAxLjUgfSk7XG4gICAgICAgICQoJy5zcGxhc2ggdWwsIC5zcGxhc2ggcCcpLmNzcyh7IGZvbnRTaXplOiB0aGlzLnVuaXRTaXplICogMC43IH0pO1xuXG4gICAgICAgIHRoaXMuYXJlYSA9IHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgcmlnaHQ6IGxlZnQgKyB3aWR0aCxcbiAgICAgICAgICAgIGJvdHRvbTogdG9wICsgaGVpZ2h0LFxuICAgICAgICAgICAgaG9yaXpvbnRhbEJsb2NrczogaG9yaXpvbnRhbEJsb2NrcyxcbiAgICAgICAgICAgIHZlcnRpY2FsQmxvY2tzOiB2ZXJ0aWNhbEJsb2NrcyxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG5leHRCbG9ja0FyZWFMZWZ0ID0gbGVmdCAtIHRoaXMudW5pdFNpemUgKiA3O1xuICAgICAgICB0aGlzLm5leHRCbG9ja0FyZWEgPSB7XG4gICAgICAgICAgICBsZWZ0OiBuZXh0QmxvY2tBcmVhTGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMudW5pdFNpemUgKiA2LFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnVuaXRTaXplICogNixcbiAgICAgICAgICAgIHJpZ2h0OiBuZXh0QmxvY2tBcmVhTGVmdCArICB0aGlzLnVuaXRTaXplICogNixcbiAgICAgICAgICAgIGJvdHRvbTogdG9wICsgIHRoaXMudW5pdFNpemUgKiA2LFxuICAgICAgICAgICAgaG9yaXpvbnRhbEJsb2NrczogNixcbiAgICAgICAgICAgIHZlcnRpY2FsQmxvY2tzOiA2LFxuICAgICAgICB9XG4gICAgICAgIHRoaXMubGV2ZWwgPSBrby5vYnNlcnZhYmxlKDEpO1xuICAgICAgICB0aGlzLmNvbXBsZXRlZFJvd3MgPSBrby5vYnNlcnZhYmxlKDApO1xuICAgICAgICB0aGlzLnNjb3JlID0ga28ub2JzZXJ2YWJsZSgwKTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5nYW1lSXNPdmVyID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMuZ2FtZUlzQ29tcGxldGVkID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMuYW55S2V5VG9TdGFydCA9IGtvLm9ic2VydmFibGUodHJ1ZSk7XG4gICAgICAgIHRoaXMucmVzZXRHYW1lKCk7XG5cbiAgICAgICAgJChkb2N1bWVudCkua2V5ZG93bigoZSkgPT4ge1xuICAgICAgICAgICAgICBpZih0aGlzLmdhbWVJc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgICAgIGlmKGUud2hpY2ggPT09IDM4KSAgICAgIHsgdGhpcy5hY3RpdmVCbG9jaygpLnJvdGF0ZSh0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKSAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gMzcpIHsgdGhpcy5hY3RpdmVCbG9jaygpLm1vdmUoJ2xlZnQnLCB0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKSAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gMzkpIHsgdGhpcy5hY3RpdmVCbG9jaygpLm1vdmUoJ3JpZ2h0JywgdGhpcy5hbGxPY2N1cGllZFNxdWFyZXMoKSkgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gNDApIHsgdGhpcy5hY3RpdmVCbG9ja01vdmVEb3duKCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gMzIpIHsgdGhpcy5hY3RpdmVCbG9ja0Ryb3AoKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZS53aGljaCA9PT0gODApIHsgdGhpcy5wYXVzZWQoIXRoaXMucGF1c2VkKCkpIH1cbiAgICAgICAgICAgIGlmKHRoaXMuYW55S2V5VG9TdGFydCgpKSB7IHRoaXMuYW55S2V5VG9TdGFydChmYWxzZSkgfVxuICAgICAgICAgICAgaWYoKHRoaXMuZ2FtZUlzT3ZlcigpIHx8IHRoaXMuZ2FtZUlzQ29tcGxldGVkKCkpICYmIChlLndoaWNoID09PSAxMykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0R2FtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ydW4oKTtcblxuICAgIH1cblxuICAgIHJlc2V0R2FtZSgpIHtcbiAgICAgICAgdGhpcy5oZWFwQmxvY2tzID0gW107XG4gICAgICAgIHRoaXMuYmxvY2tzID0gdGhpcy5nZXRCYWdPZkJsb2NrcygpO1xuICAgICAgICB0aGlzLmxldmVsKDEpO1xuICAgICAgICB0aGlzLmxvb3BzUGVyU3RlcCA9IHRoaXMubG9vcHNQZXJTdGVwRm9yTGV2ZWwoMSk7XG4gICAgICAgIHRoaXMubG9vcHNTaW5jZVN0ZXAgPSAwO1xuICAgICAgICB0aGlzLmhhZENvbXBsZXRlZFJvd3NPbkxhc3RVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb21wbGV0ZWRSb3dzKDApO1xuICAgICAgICB0aGlzLnNjb3JlKDApO1xuICAgICAgICB0aGlzLmdhbWVJc092ZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLmdhbWVJc0NvbXBsZXRlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgZ2FtZUlzUnVubmluZygpIHtcbiAgICAgICAgcmV0dXJuICEodGhpcy5wYXVzZWQoKSB8fCB0aGlzLmFueUtleVRvU3RhcnQoKSB8fCB0aGlzLmdhbWVJc092ZXIoKSB8fCB0aGlzLmdhbWVJc0NvbXBsZXRlZCgpKTtcbiAgICB9XG5cbiAgICBkcmF3QXJlYSgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJyM3NzcnO1xuICAgICAgICAvLyBnYW1lIGFyZWFcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QodGhpcy5hcmVhLmxlZnQsIHRoaXMuYXJlYS50b3AsIHRoaXMuYXJlYS53aWR0aCwgdGhpcy5hcmVhLmhlaWdodCk7XG5cbiAgICAgICAgLy8gbmV4dCBibG9ja3MgYXJlYVxuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLm5leHRCbG9ja0FyZWEubGVmdCwgdGhpcy5uZXh0QmxvY2tBcmVhLnRvcCwgdGhpcy5uZXh0QmxvY2tBcmVhLndpZHRoLCB0aGlzLm5leHRCbG9ja0FyZWEuaGVpZ2h0KTtcblxuICAgICAgICAvLyBncmlkXG4gICAgICAgIHZhciBjID0gdGhpcy5jdHg7XG4gICAgICAgIGMubGluZVdpZHRoID0gMTtcbiAgICAgICAgdGhpcy5jdHgubGluZUNhcCA9ICdidXR0JztcbiAgICAgICAgZm9yICh2YXIgeCA9IDE7IHggPCB0aGlzLmFyZWEuaG9yaXpvbnRhbEJsb2NrczsgeCsrKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdMaW5lKFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgJyM4ODgnLFxuICAgICAgICAgICAgICAgIHggKiB0aGlzLnVuaXRTaXplICsgdGhpcy5hcmVhLmxlZnQsXG4gICAgICAgICAgICAgICAgdGhpcy5hcmVhLnRvcCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIHRoaXMuYXJlYS5oZWlnaHRcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZih0aGlzLmFueUtleVRvU3RhcnQoKSkge1xuICAgICAgICAgICAgdGhpcy5kcmF3QXJlYSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5nYW1lSXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0FyZWEoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzZWxmLnJ1bigpIH0sIDEwKTtcbiAgICB9XG5cbiAgICBsb29wc1BlclN0ZXBGb3JMZXZlbChsZXZlbCkge1xuICAgICAgICByZXR1cm4gbGV2ZWwgPT0gMSA/IDIwXG4gICAgICAgICAgICAgOiBsZXZlbCA9PSAyID8gMThcbiAgICAgICAgICAgICA6IGxldmVsID09IDMgPyAxNlxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gNCA/IDE0XG4gICAgICAgICAgICAgOiBsZXZlbCA9PSA1ID8gMTJcbiAgICAgICAgICAgICA6IGxldmVsID09IDYgPyAxMFxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gNyA/IDlcbiAgICAgICAgICAgICA6IGxldmVsID09IDggPyA4XG4gICAgICAgICAgICAgOiBsZXZlbCA9PSA5ID8gN1xuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMTAgPyA1XG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgOTk5OTkgLy8gbWFnaWNcbiAgICAgICAgICAgICA7XG4gICAgfVxuICAgIGFjdGl2ZUJsb2NrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3NbMF07XG4gICAgfVxuXG4gICAgbWF5YmVJbmNyZWFzZUxldmVsKCkge1xuICAgICAgICBpZih0aGlzLmNvbXBsZXRlZFJvd3MoKSA+PSB0aGlzLmxldmVsKCkgKiAxMCkge1xuICAgICAgICAgICAgdGhpcy5sZXZlbCh0aGlzLmxldmVsKCkgKyAxKTtcbiAgICAgICAgICAgIGlmKHRoaXMubG9vcHNQZXJTdGVwRm9yTGV2ZWwodGhpcy5sZXZlbCgpKSA+PSA5OTk5OSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUlzQ29tcGxldGVkKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubG9vcHNQZXJTdGVwID0gdGhpcy5sb29wc1BlclN0ZXBGb3JMZXZlbCh0aGlzLmxldmVsKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGluY3JlYXNlU2NvcmVXaXRoKHNjb3JlSW5jcmVhc2UpIHtcbiAgICAgICAgdGhpcy5zY29yZSh0aGlzLnNjb3JlKCkgKyBzY29yZUluY3JlYXNlKTtcbiAgICB9XG4gICAgZG9uZVdpdGhCbG9jayhkcm9wRGlzdGFuY2UgPSAwKSB7XG4gICAgICAgIGlmKHRoaXMuYWN0aXZlQmxvY2soKS5vcmlnaW5TcXVhcmUueSA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZUlzT3Zlcih0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhlYXBCbG9ja3MucHVzaCh0aGlzLmJsb2Nrcy5zaGlmdCgpKTtcbiAgICAgICAgaWYoZHJvcERpc3RhbmNlID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pbmNyZWFzZVNjb3JlV2l0aCgzICogdGhpcy5sZXZlbCgpICsgZHJvcERpc3RhbmNlICsgMyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5ibG9ja3MubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgdGhpcy5ibG9ja3MgPSB0aGlzLmJsb2Nrcy5jb25jYXQodGhpcy5nZXRCYWdPZkJsb2NrcygpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnaXZlU2NvcmVGb3JTb2Z0RHJvcCgpIHtcbiAgICAgICAgdGhpcy5pbmNyZWFzZVNjb3JlV2l0aCh0aGlzLmxldmVsKCkpO1xuICAgIH1cbiAgICBnaXZlU2NvcmVGb3JDbGVhcmVkUm93cyhudW1iZXJPZlJvd3MpIHtcbiAgICAgICAgdmFyIGdyb3VuZFNjb3JlRm9yTnVtYmVyT2ZSb3dzID0ge1xuICAgICAgICAgICAgMDogICAgMCxcbiAgICAgICAgICAgIDE6ICAgNDAsXG4gICAgICAgICAgICAyOiAgMTAwLFxuICAgICAgICAgICAgMzogIDMwMCxcbiAgICAgICAgICAgIDQ6IDEyMDAsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2NvcmUodGhpcy5zY29yZSgpICsgZ3JvdW5kU2NvcmVGb3JOdW1iZXJPZlJvd3NbbnVtYmVyT2ZSb3dzXSAqIHRoaXMubGV2ZWwoKSk7XG4gICAgICAgIHRoaXMuY29tcGxldGVkUm93cyh0aGlzLmNvbXBsZXRlZFJvd3MoKSArIG51bWJlck9mUm93cyk7XG4gICAgICAgIHRoaXMubWF5YmVJbmNyZWFzZUxldmVsKCk7XG5cbiAgICB9XG5cbiAgICBhY3RpdmVCbG9ja01vdmVEb3duKCkge1xuICAgICAgICBpZih0aGlzLmFjdGl2ZUJsb2NrKCkubW92ZSgnZG93bicsIHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpKSB7XG4gICAgICAgICAgICB0aGlzLmdpdmVTY29yZUZvclNvZnREcm9wKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWN0aXZlQmxvY2tEcm9wKCkge1xuICAgICAgICB0aGlzLmRvbmVXaXRoQmxvY2soIHRoaXMuYWN0aXZlQmxvY2soKS5kcm9wKHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpICk7XG4gICAgfVxuXG4gICAgbWF5YmVUYWtlU3RlcCgpIHtcbiAgICAgICAgKyt0aGlzLmxvb3BzU2luY2VTdGVwO1xuICAgICAgICBpZih0aGlzLmxvb3BzU2luY2VTdGVwID4gdGhpcy5sb29wc1BlclN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMubG9vcHNTaW5jZVN0ZXAgPSAwO1xuICAgICAgICAgICAgdmFyIGFibGVUb01vdmUgPSB0aGlzLmFjdGl2ZUJsb2NrKCkubW92ZSgnZG93bicsIHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpO1xuICAgICAgICAgICAgaWYoIWFibGVUb01vdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRvbmVXaXRoQmxvY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjaGVja0ZvckNvbXBsZXRlZFJvd3MoKSB7XG4gICAgICAgIHZhciBjb21wbGV0ZWRSb3dzID0gW107XG4gICAgICAgIHZhciBhbGxPY2N1cGllZFNxdWFyZXMgPSB0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpO1xuXG4gICAgICAgIHZhciBvY2N1cGllZFBlclJvdyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSB0aGlzLmFyZWEudmVydGljYWxCbG9ja3M7IGkrKykge1xuICAgICAgICAgICAgb2NjdXBpZWRQZXJSb3dbaV0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgYWxsT2NjdXBpZWRTcXVhcmVzLm1hcCgoYmxvY2spID0+IHtcbiAgICAgICAgICAgIGJsb2NrLm1hcCggKHNxdWFyZSkgPT4ge1xuICAgICAgICAgICAgICAgICsrb2NjdXBpZWRQZXJSb3dbc3F1YXJlLnldO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIENIRUNLQ09NUExFVEVEOlxuICAgICAgICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDw9IHRoaXMuYXJlYS52ZXJ0aWNhbEJsb2Nrczsgcm93SW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIG9jY3VwaWVkU3F1YXJlc09uUm93ID0gb2NjdXBpZWRQZXJSb3dbcm93SW5kZXhdO1xuICAgICAgICAgICAgaWYob2NjdXBpZWRTcXVhcmVzT25Sb3cgPT09IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYWRDb21wbGV0ZWRSb3dzT25MYXN0VXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRSb3dzLnB1c2gocm93SW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgY2VsbEluZGV4ID0gMTsgY2VsbEluZGV4IDw9IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzOyBjZWxsSW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnI2ZmZic7XG5cbiAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgNSArIHRoaXMuYXJlYS5sZWZ0ICsgKGNlbGxJbmRleCAtIDEpICogdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDUgKyB0aGlzLmFyZWEudG9wICsgKHJvd0luZGV4IC0gMSkgKiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51bml0U2l6ZSAtIDEwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51bml0U2l6ZSAtIDEwXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoY29tcGxldGVkUm93cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBuZXdIZWFwQmxvY2tzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oZWFwQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJsb2NrID0gdGhpcy5oZWFwQmxvY2tzW2ldO1xuXG4gICAgICAgICAgICAgICAgdmFyIHBvc3NpYmxlTmV3QmxvY2sgPSBibG9jay5yZW1vdmVGcm9tUm93cyhjb21wbGV0ZWRSb3dzKTtcbiAgICAgICAgICAgICAgICBpZihwb3NzaWJsZU5ld0Jsb2NrICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0hlYXBCbG9ja3MucHVzaChwb3NzaWJsZU5ld0Jsb2NrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoYmxvY2sub2NjdXBpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0hlYXBCbG9ja3MucHVzaChibG9jayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmhlYXBCbG9ja3MgPSBuZXdIZWFwQmxvY2tzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wbGV0ZWRSb3dzLmxlbmd0aDtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIGlmKHRoaXMuaGFkQ29tcGxldGVkUm93c09uTGFzdFVwZGF0ZSkge1xuICAgICAgICAgICAgLy90aGlzLmRyb3BBZnRlckNvbXBsZXRlZCgpO1xuICAgICAgICAgICAgdGhpcy5oYWRDb21wbGV0ZWRSb3dzT25MYXN0VXBkYXRlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm1heWJlVGFrZVN0ZXAoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYXcoKTtcblxuICAgICAgICB2YXIgdG90YWxDb21wbGV0ZWRSb3dzID0gMDtcbiAgICAgICAgSEFEQ09NUExFVEVEOlxuICAgICAgICB3aGlsZSgxKSB7XG4gICAgICAgICAgICB2YXIgY29tcGxldGVkUm93cyA9IHRoaXMuY2hlY2tGb3JDb21wbGV0ZWRSb3dzKCk7XG4gICAgICAgICAgICBpZighY29tcGxldGVkUm93cykge1xuICAgICAgICAgICAgICAgIGJyZWFrIEhBRENPTVBMRVRFRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvdGFsQ29tcGxldGVkUm93cyArPSBjb21wbGV0ZWRSb3dzO1xuICAgICAgICAgICAgdGhpcy5kcm9wQWZ0ZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZih0b3RhbENvbXBsZXRlZFJvd3MpIHtcbiAgICAgICAgICAgIHRoaXMuZ2l2ZVNjb3JlRm9yQ2xlYXJlZFJvd3ModG90YWxDb21wbGV0ZWRSb3dzKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlQmxvY2soKS5kcmF3U2hhZG93KHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpO1xuICAgICAgICB0aGlzLmFjdGl2ZUJsb2NrKCkuZHJhdygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaGVhcEJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5oZWFwQmxvY2tzW2ldLmRyYXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXh0QmxvY2sgPSB0aGlzLmJsb2Nrc1sxXTtcbiAgICAgICAgY29uc29sZS5sb2cobmV4dEJsb2NrKTtcblxuICAgICAgICB2YXIgZGlzcGxheWVkTmV4dEJsb2NrID0gbmV3IFRldHJpc0Jsb2NrKHtcbiAgICAgICAgICAgIHR5cGU6IG5leHRCbG9jay50eXBlLFxuICAgICAgICAgICAgcm90YXRpb246IG5leHRCbG9jay5yb3RhdGlvbixcbiAgICAgICAgICAgIHVuaXRTaXplOiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgb3JpZ2luU3F1YXJlOiB7IHg6IDIsIHk6IDIgfSxcbiAgICAgICAgICAgIGN0eDogdGhpcy5jdHgsXG4gICAgICAgICAgICBhcmVhOiB0aGlzLm5leHRCbG9ja0FyZWEsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhkaXNwbGF5ZWROZXh0QmxvY2spO1xuICAgICAgICBkaXNwbGF5ZWROZXh0QmxvY2suZHJhdygpO1xuICAgIH1cbiAgICBkcm9wQWZ0ZXJDb21wbGV0ZWQoKSB7XG4gICAgICAgIHZhciBjb3VsZERyb3BBbnlCbG9jayA9IHRydWU7XG5cbiAgICAgICAgd2hpbGUoY291bGREcm9wQW55QmxvY2spIHtcbiAgICAgICAgICAgIGNvdWxkRHJvcEFueUJsb2NrID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oZWFwQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhvd0ZhckRyb3BwZWQgPSB0aGlzLmhlYXBCbG9ja3NbaV0uZHJvcCh0aGlzLmFsbE9jY3VwaWVkU3F1YXJlc0V4cGVjdEJsb2NrSW5kZXgoaSkpO1xuICAgICAgICAgICAgICAgIGlmKGhvd0ZhckRyb3BwZWQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvdWxkRHJvcEFueUJsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhbGxPY2N1cGllZFNxdWFyZXMoKSB7XG4gICAgICAgIHZhciBhbGxPY2N1cGllZFNxdWFyZXMgPSBbXTtcblxuICAgICAgICBPQ0NVUElFRDpcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhlYXBCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBibG9jayA9IHRoaXMuaGVhcEJsb2Nrc1tpXTtcblxuICAgICAgICAgICAgaWYoYmxvY2sub2NjdXBpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYWxsT2NjdXBpZWRTcXVhcmVzLnB1c2goYmxvY2sub2NjdXBpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxPY2N1cGllZFNxdWFyZXM7XG4gICAgfVxuICAgIGFsbE9jY3VwaWVkU3F1YXJlc0V4cGVjdEJsb2NrSW5kZXgoZXhjZXB0QmxvY2tJbmRleCkge1xuICAgICAgICB2YXIgYWxsT2NjdXBpZWRTcXVhcmVzID0gW107XG5cbiAgICAgICAgT0NDVVBJRUQ6XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oZWFwQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZihpID09PSBleGNlcHRCbG9ja0luZGV4KSB7XG4gICAgICAgICAgICAgICAgY29udGludWUgT0NDVVBJRUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhbGxPY2N1cGllZFNxdWFyZXMucHVzaCh0aGlzLmhlYXBCbG9ja3NbaV0ub2NjdXBpZXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxPY2N1cGllZFNxdWFyZXM7XG4gICAgfVxuXG4gICAgZ2V0QmFnT2ZCbG9ja3MoYW1vdW50KSB7XG4gICAgICAgIHZhciBibG9ja3MgPSBbXTtcbiAgICAgICAgdmFyIGJsb2NrVHlwZXMgPSBbJ0knLCAnSicsICdMJywgJ08nLCAnUycsICdUJywgJ1onXTtcbiAgICAgICAgdmFyIHJvdGF0aW9uID0gWzAsIDEsIDIsIDNdO1xuXG4gICAgICAgIHdoaWxlKGJsb2NrVHlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgcmFuZG9tQmxvY2tUeXBlSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBibG9ja1R5cGVzLmxlbmd0aCk7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IGJsb2NrVHlwZXMuc3BsaWNlKHJhbmRvbUJsb2NrVHlwZUluZGV4LCAxKS5zaGlmdCgpO1xuICAgICAgICAgICAgYmxvY2tzLnB1c2gobmV3IFRldHJpc0Jsb2NrKHtcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgIHJvdGF0aW9uOiByb3RhdGlvblsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcm90YXRpb24ubGVuZ3RoKSBdLFxuICAgICAgICAgICAgICAgIHVuaXRTaXplOiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgIG9yaWdpblNxdWFyZTogeyB4OiBNYXRoLmZsb29yKHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzIC8gMikgLSAxLCB5OiAtMiB9LFxuICAgICAgICAgICAgICAgIGN0eDogdGhpcy5jdHgsXG4gICAgICAgICAgICAgICAgYXJlYTogdGhpcy5hcmVhLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBibG9ja3M7XG4gICAgfVxuICAgIGNvcHlBcnJheShhcnJheSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShhcnJheSkpO1xuICAgIH1cbiAgICBkcmF3TGluZShsaW5lV2lkdGgsIGNvbG9yLCBmcm9tWCwgZnJvbVksIGxlbmd0aFgsIGxlbmd0aFkpIHtcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgICAgICB0aGlzLmN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgdGhpcy5jdHgubW92ZVRvKGZyb21YLCBmcm9tWSk7XG4gICAgICAgIHRoaXMuY3R4LmxpbmVUbyhmcm9tWCArIGxlbmd0aFgsIGZyb21ZICsgbGVuZ3RoWSk7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZSgpO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIC8vIFRoaXMgcnVucyB3aGVuIHRoZSBjb21wb25lbnQgaXMgdG9ybiBkb3duLiBQdXQgaGVyZSBhbnkgbG9naWMgbmVjZXNzYXJ5IHRvIGNsZWFuIHVwLFxuICAgICAgICAvLyBmb3IgZXhhbXBsZSBjYW5jZWxsaW5nIHNldFRpbWVvdXRzIG9yIGRpc3Bvc2luZyBLbm9ja291dCBzdWJzY3JpcHRpb25zL2NvbXB1dGVkcy5cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgdmlld01vZGVsOiBUZXRyaXMsIHRlbXBsYXRlOiB0ZW1wbGF0ZU1hcmt1cCB9O1xuIl19;