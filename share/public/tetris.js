
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
            this.occupies = params.occupies || this.getOccupation(this.rotation); // set when debugging
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
                        var lineWidth = Math.floor(_this.unitSize / 15);
                        var topX = lineWidth / 2 + _this.area.left + (occupiedSquare.x - 1) * _this.unitSize;
                        var topY = lineWidth / 2 + _this.area.top + (occupiedSquare.y - 1) * _this.unitSize;
                        _this.ctx.fillRect(topX, topY, _this.unitSize - 1, _this.unitSize - 1);
                        _this.drawLine(lineWidth, _this.color.lighter, topX, topY, _this.unitSize - lineWidth, 0);
                        _this.drawLine(lineWidth, _this.color.lighter, topX, topY, 0, _this.unitSize - lineWidth);
                        _this.drawLine(lineWidth, _this.color.darker, topX, topY + _this.unitSize - lineWidth, _this.unitSize - lineWidth, 0);
                        _this.drawLine(lineWidth, _this.color.darker, topX + _this.unitSize - lineWidth, topY, 0, _this.unitSize - lineWidth);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDakQsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNoQyxnQkFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDeEMsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4RTs7cUJBVlEsV0FBVzs7bUJBV2YsaUJBQUc7QUFDSixvQkFBSSxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRCxxQkFBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN2RCxxQkFBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxxQkFBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FB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TSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO2lCQUNKLENBQUM7QUFDRix1QkFBTyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzdDOzs7bUJBQ1EsbUJBQUMsS0FBSyxFQUFFO0FBQ2IsdUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDNUM7OztlQWxlUSxXQUFXIiwiZmlsZSI6ImdzcmMvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuXG5leHBvcnQgY2xhc3MgVGV0cmlzQmxvY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLmFyZWEgPSBwYXJhbXMuYXJlYTtcbiAgICAgICAgdGhpcy50eXBlID0gcGFyYW1zLnR5cGU7IC8vIEksIEosIEwsIE8sIFMsIFQsIFpcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHBhcmFtcy5yb3RhdGlvbjsgLy8gMCwgMSwgMiwgM1xuICAgICAgICB0aGlzLmNvbG9yID0gcGFyYW1zLmNvbG9yIHx8IHRoaXMuY29sb3JEZWZhdWx0KCk7XG4gICAgICAgIHRoaXMudW5pdFNpemUgPSBwYXJhbXMudW5pdFNpemU7XG4gICAgICAgIHRoaXMuY3R4ID0gcGFyYW1zLmN0eDtcbiAgICAgICAgdGhpcy5vcmlnaW5TcXVhcmUgPSBwYXJhbXMub3JpZ2luU3F1YXJlOyAvLyB7IHg6ID8sIHk6ID8gfVxuICAgICAgICB0aGlzLm9jY3VwaWVzID0gcGFyYW1zLm9jY3VwaWVzIHx8IHRoaXMuZ2V0T2NjdXBhdGlvbih0aGlzLnJvdGF0aW9uKTsgLy8gc2V0IHdoZW4gZGVidWdnaW5nXG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICB2YXIgY2xvbmUgPSBuZXcgVGV0cmlzQmxvY2soT2JqZWN0LmFzc2lnbih7fSwgdGhpcykpO1xuICAgICAgICBjbG9uZS5vcmlnaW5TcXVhcmUgPSB0aGlzLmNvcHlBcnJheSh0aGlzLm9yaWdpblNxdWFyZSk7XG4gICAgICAgIGNsb25lLmFyZWEgPSB0aGlzLmNvcHlBcnJheSh0aGlzLmFyZWEpO1xuICAgICAgICBjbG9uZS5vY2N1cGllcyA9IHRoaXMuY29weUFycmF5KHRoaXMub2NjdXBpZXMpO1xuICAgICAgICByZXR1cm4gY2xvbmU7XG4gICAgfVxuXG4gICAgbW92ZShkaXJlY3Rpb24sIG9jY3VwaWVkQnlPdGhlcnMsIHN0ZXBzID0gMSkge1xuICAgICAgICBpZihkaXJlY3Rpb24gIT09ICdkb3duJyAmJiBkaXJlY3Rpb24gIT09ICdsZWZ0JyAmJiBkaXJlY3Rpb24gIT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCYWQgYXJndW1lbnQgdG8gYmxvY2subW92ZSgpJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoYW5nZVhCeSA9IGRpcmVjdGlvbiA9PT0gJ2xlZnQnICA/IC1zdGVwc1xuICAgICAgICAgICAgICAgICAgICAgIDogZGlyZWN0aW9uID09PSAncmlnaHQnID8gc3RlcHNcbiAgICAgICAgICAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgdmFyIGNoYW5nZVlCeSA9IGRpcmVjdGlvbiA9PT0gJ2Rvd24nID8gc3RlcHMgOiAwO1xuICAgICAgICB2YXIgbmV3T2NjdXBpZXMgPSB0aGlzLmNvcHlBcnJheSh0aGlzLm9jY3VwaWVzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5ld09jY3VwaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBuZXdPY2N1cGllc1tpXS54ID0gbmV3T2NjdXBpZXNbaV0ueCArIGNoYW5nZVhCeTtcbiAgICAgICAgICAgIG5ld09jY3VwaWVzW2ldLnkgPSBuZXdPY2N1cGllc1tpXS55ICsgY2hhbmdlWUJ5O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvdWxkTW92ZSA9IHRydWU7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmV3T2NjdXBpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKCF0aGlzLmlzV2l0aGluRXh0ZW5kZWRBcmVhKG5ld09jY3VwaWVzW2ldKSkge1xuICAgICAgICAgICAgICAgIGNvdWxkTW92ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvdWxkTW92ZSA9IGNvdWxkTW92ZSA/IHRoaXMuY2hlY2tPdmVybGFwKG5ld09jY3VwaWVzLCBvY2N1cGllZEJ5T3RoZXJzKSA6IGZhbHNlO1xuXG4gICAgICAgIGlmKGNvdWxkTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5vcmlnaW5TcXVhcmUueCA9IHRoaXMub3JpZ2luU3F1YXJlLnggKyBjaGFuZ2VYQnk7XG4gICAgICAgICAgICB0aGlzLm9yaWdpblNxdWFyZS55ID0gdGhpcy5vcmlnaW5TcXVhcmUueSArIGNoYW5nZVlCeTtcbiAgICAgICAgICAgIHRoaXMub2NjdXBpZXMgPSBuZXdPY2N1cGllcy5zbGljZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvdWxkTW92ZTtcbiAgICB9XG4gICAgZHJvcChvY2N1cGllZEJ5T3RoZXJzKSB7XG4gICAgICAgIHZhciBudW1iZXJPZkRvd25zID0gMDtcbiAgICAgICAgd2hpbGUodGhpcy5tb3ZlKCdkb3duJywgb2NjdXBpZWRCeU90aGVycykpIHtcbiAgICAgICAgICAgIG51bWJlck9mRG93bnMrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVtYmVyT2ZEb3ducztcbiAgICB9XG4gICAgcm90YXRlKG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgdmFyIG5leHRSb3RhdGlvbiA9IHRoaXMucm90YXRpb24gKyAxID4gMyA/IDAgOiB0aGlzLnJvdGF0aW9uICsgMTtcbiAgICAgICAgdmFyIGNsb25lID0gdGhpcy5jbG9uZSgpO1xuICAgICAgICBjbG9uZS5yb3RhdGlvbiA9IG5leHRSb3RhdGlvbjtcbiAgICAgICAgY2xvbmUub2NjdXBpZXMgPSBjbG9uZS5nZXRPY2N1cGF0aW9uKGNsb25lLnJvdGF0aW9uKTtcblxuICAgICAgICB2YXIgbmV4dE9jY3VwYXRpb24gPSB0aGlzLmdldE9jY3VwYXRpb24obmV4dFJvdGF0aW9uKTtcblxuICAgICAgICB2YXIgYWxsQXJlV2l0aGluID0gdHJ1ZTtcbiAgICAgICAgdmFyIG1pbmltdW1YID0gY2xvbmUuYXJlYS5ob3Jpem9udGFsQmxvY2tzO1xuICAgICAgICB2YXIgbWF4aW11bVggPSAwO1xuICAgICAgICB2YXIgbWF4aW11bVkgPSAwO1xuXG4gICAgICAgIGNsb25lLm9jY3VwaWVzLm1hcCggKG9jY3VwaWVkU3F1YXJlKSA9PiB7XG4gICAgICAgICAgICBtaW5pbXVtWCA9IG9jY3VwaWVkU3F1YXJlLnggPCBtaW5pbXVtWCA/IG9jY3VwaWVkU3F1YXJlLnggOiBtaW5pbXVtWDtcbiAgICAgICAgICAgIG1heGltdW1YID0gb2NjdXBpZWRTcXVhcmUueCA+IG1heGltdW1YID8gb2NjdXBpZWRTcXVhcmUueCA6IG1heGltdW1YO1xuICAgICAgICAgICAgbWF4aW11bVkgPSBvY2N1cGllZFNxdWFyZS54ID4gbWF4aW11bVkgPyBvY2N1cGllZFNxdWFyZS55IDogbWF4aW11bVk7XG4gICAgICAgICAgICBpZighY2xvbmUuaXNXaXRoaW5FeHRlbmRlZEFyZWEob2NjdXBpZWRTcXVhcmUpKSB7XG4gICAgICAgICAgICAgICAgYWxsQXJlV2l0aGluID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciByb3RhdGlvbk9rID0gdHJ1ZTtcbiAgICAgICAgaWYoIWFsbEFyZVdpdGhpbikge1xuICAgICAgICAgICAgaWYobWluaW11bVggPCAxKSB7XG4gICAgICAgICAgICAgICAgcm90YXRpb25PayA9IGNsb25lLm1vdmUoJ3JpZ2h0Jywgb2NjdXBpZWRCeU90aGVycywgTWF0aC5hYnMobWluaW11bVgpICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG1heGltdW1YID4gY2xvbmUuYXJlYS5ob3Jpem9udGFsQmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgcm90YXRpb25PayA9IGNsb25lLm1vdmUoJ2xlZnQnLCBvY2N1cGllZEJ5T3RoZXJzLCBtYXhpbXVtWCAtIGNsb25lLmFyZWEuaG9yaXpvbnRhbEJsb2Nrcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKG1heGltdW1ZID4gY2xvbmUuYXJlYS52ZXJ0aWNhbEJsb2Nrcykge1xuICAgICAgICAgICAgICAgIHJvdGF0aW9uT2sgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByb3RhdGlvbk9rID0gcm90YXRpb25PayA/IHRoaXMuY2hlY2tPdmVybGFwKGNsb25lLm9jY3VwaWVzLCBvY2N1cGllZEJ5T3RoZXJzKSA6IGZhbHNlO1xuXG4gICAgICAgIGlmKHJvdGF0aW9uT2spIHtcbiAgICAgICAgICAgIHRoaXMub2NjdXBpZXMgPSBjbG9uZS5jb3B5QXJyYXkoY2xvbmUub2NjdXBpZXMpO1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IGNsb25lLnJvdGF0aW9uO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgd2l0aEVhY2hPY2N1cGllZFNxdWFyZShkb1RoaXMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9jY3VwaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkb1RoaXModGhpcy5vY2N1cGllc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gZXh0ZW5kZWQgYXJlYSBpbmNsdWRlcyB0aGUgaGlkZGVuIHNxdWFyZXMgYWJvdmUgdGhlIHZpc2libGUgdG9wXG4gICAgaXNXaXRoaW5FeHRlbmRlZEFyZWEob2NjdXBpZWRTcXVhcmUpIHtcbiAgICAgICAgcmV0dXJuIG9jY3VwaWVkU3F1YXJlLnggPj0gMVxuICAgICAgICAgICAgJiYgb2NjdXBpZWRTcXVhcmUueCA8PSB0aGlzLmFyZWEuaG9yaXpvbnRhbEJsb2Nrc1xuICAgICAgICAgICAgJiYgb2NjdXBpZWRTcXVhcmUueSA+PSAtNFxuICAgICAgICAgICAgJiYgb2NjdXBpZWRTcXVhcmUueSA8PSB0aGlzLmFyZWEudmVydGljYWxCbG9ja3MgPyB0cnVlIDogZmFsc2U7XG4gICAgfVxuICAgIGlzV2l0aGluQXJlYShvY2N1cGllZFNxdWFyZSkge1xuICAgICAgICByZXR1cm4gb2NjdXBpZWRTcXVhcmUueCA+PSAxXG4gICAgICAgICAgICAmJiBvY2N1cGllZFNxdWFyZS54IDw9IHRoaXMuYXJlYS5ob3Jpem9udGFsQmxvY2tzXG4gICAgICAgICAgICAmJiBvY2N1cGllZFNxdWFyZS55ID49IDFcbiAgICAgICAgICAgICYmIG9jY3VwaWVkU3F1YXJlLnkgPD0gdGhpcy5hcmVhLnZlcnRpY2FsQmxvY2tzID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICBjaGVja092ZXJsYXAob25lQmxvY2tPY2N1cHksIG9jY3VwaWVkQnlPdGhlcnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvbmVCbG9ja09jY3VweS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHNxdWFyZSA9IG9uZUJsb2NrT2NjdXB5W2ldO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG9jY3VwaWVkQnlPdGhlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb3RoZXJCbG9jayA9IG9jY3VwaWVkQnlPdGhlcnNbal07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IG90aGVyQmxvY2subGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgb3RoZXJTcXVhcmUgPSBvdGhlckJsb2NrW2tdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHNxdWFyZS54ID09PSBvdGhlclNxdWFyZS54ICYmIHNxdWFyZS55ID09PSBvdGhlclNxdWFyZS55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gdGhpcy5jb2xvci5tYWluO1xuICAgICAgICB0aGlzLm9jY3VwaWVzLm1hcCggKG9jY3VwaWVkU3F1YXJlKSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLmlzV2l0aGluQXJlYShvY2N1cGllZFNxdWFyZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZVdpZHRoID0gTWF0aC5mbG9vcih0aGlzLnVuaXRTaXplIC8gMTUpO1xuICAgICAgICAgICAgICAgIHZhciB0b3BYID0gbGluZVdpZHRoIC8gMiArIHRoaXMuYXJlYS5sZWZ0ICsgKG9jY3VwaWVkU3F1YXJlLnggLSAxKSAqIHRoaXMudW5pdFNpemU7XG4gICAgICAgICAgICAgICAgdmFyIHRvcFkgPSBsaW5lV2lkdGggLyAyICsgdGhpcy5hcmVhLnRvcCArIChvY2N1cGllZFNxdWFyZS55IC0gMSkgKiB0aGlzLnVuaXRTaXplO1xuICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRvcFgsIHRvcFksIHRoaXMudW5pdFNpemUgLSAxLCB0aGlzLnVuaXRTaXplIC0gMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZShsaW5lV2lkdGgsIHRoaXMuY29sb3IubGlnaHRlciwgdG9wWCwgdG9wWSwgdGhpcy51bml0U2l6ZSAtIGxpbmVXaWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZShsaW5lV2lkdGgsIHRoaXMuY29sb3IubGlnaHRlciwgdG9wWCwgdG9wWSwgMCwgdGhpcy51bml0U2l6ZSAtIGxpbmVXaWR0aCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZShsaW5lV2lkdGgsIHRoaXMuY29sb3IuZGFya2VyLCB0b3BYLCB0b3BZICsgdGhpcy51bml0U2l6ZSAtIGxpbmVXaWR0aCwgdGhpcy51bml0U2l6ZSAtIGxpbmVXaWR0aCwgMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3TGluZShsaW5lV2lkdGgsIHRoaXMuY29sb3IuZGFya2VyLCB0b3BYICsgdGhpcy51bml0U2l6ZSAtIGxpbmVXaWR0aCwgdG9wWSwgMCwgdGhpcy51bml0U2l6ZSAtIGxpbmVXaWR0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vY2N1cGllcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgICAgICB2YXIgZmlyc3QgPSB0aGlzLm9jY3VwaWVzW2ldO1xuICAgICAgICAgICAgaWYoIXRoaXMuaXNXaXRoaW5BcmVhKGZpcnN0KSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgdGhpcy5vY2N1cGllcy5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHNlY29uZCA9IHRoaXMub2NjdXBpZXNbal07XG4gICAgICAgICAgICAgICAgaWYoIXRoaXMuaXNXaXRoaW5BcmVhKHNlY29uZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0WCA9IHRoaXMuYXJlYS5sZWZ0ICsgKGZpcnN0LnggLSAxKSAqIHRoaXMudW5pdFNpemUgKyB0aGlzLnVuaXRTaXplIC8gMjtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRZID0gdGhpcy5hcmVhLnRvcCArIChmaXJzdC55IC0gMSkgKiB0aGlzLnVuaXRTaXplICsgdGhpcy51bml0U2l6ZSAvIDJcblxuICAgICAgICAgICAgICAgIGlmKGZpcnN0LnggPT09IHNlY29uZC54ICYmIGZpcnN0LnkgIT09IHNlY29uZC55KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSBmaXJzdC55IDwgc2Vjb25kLnkgPyAxIDogLTE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0xpbmUoNSwgdGhpcy5jb2xvci5kYXJrZXIsIHN0YXJ0WCwgc3RhcnRZLCAwLCBkaXJlY3Rpb24gKiB0aGlzLnVuaXRTaXplKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihmaXJzdC54ICE9PSBzZWNvbmQueCAmJiBmaXJzdC55ID09PSBzZWNvbmQueSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aW9uID0gZmlyc3QueCA8IHNlY29uZC54ID8gMSA6IC0xO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdMaW5lKDUsIHRoaXMuY29sb3IuZGFya2VyLCBzdGFydFgsIHN0YXJ0WSwgZGlyZWN0aW9uICogdGhpcy51bml0U2l6ZSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGRyYXdTaGFkb3cob2NjdXBpZWRCeU90aGVycykge1xuICAgICAgICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lKCk7XG4gICAgICAgIGNsb25lLmNvbG9yID0geyBtYWluOiAnIzY2NjY2NicsIGxpZ2h0ZXI6ICcjNzc3Nzc3JywgZGFya2VyOiAnIzVmNWY1ZicgfTtcbiAgICAgICAgY2xvbmUuZHJvcChvY2N1cGllZEJ5T3RoZXJzKTtcbiAgICAgICAgY2xvbmUuZHJhdygpO1xuICAgIH1cblxuICAgIHJlbW92ZUZyb21Sb3dzKHJvd3MpIHtcblxuICAgICAgICB2YXIgbmV3T2NjdXBpZXMgPSBbXTtcbiAgICAgICAgdmFyIHVuaXF1ZU9jY3VwaWVkUm93cyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5vY2N1cGllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHNxdWFyZSA9IHRoaXMub2NjdXBpZXNbal07XG4gICAgICAgICAgICB2YXIgcm93VG9CZURlbGV0ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvdyA9IHJvd3NbaV07XG5cbiAgICAgICAgICAgICAgICBpZihzcXVhcmUueSA9PT0gcm93KSB7XG4gICAgICAgICAgICAgICAgICAgIHJvd1RvQmVEZWxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCFyb3dUb0JlRGVsZXRlZCkge1xuICAgICAgICAgICAgICAgIG5ld09jY3VwaWVzLnB1c2goc3F1YXJlKTtcblxuICAgICAgICAgICAgICAgIGlmKHVuaXF1ZU9jY3VwaWVkUm93c1stMV0gIT09IHNxdWFyZS55KSB7XG4gICAgICAgICAgICAgICAgICAgIHVuaXF1ZU9jY3VwaWVkUm93cy5wdXNoKHNxdWFyZS55KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV3QmxvY2sgPSBudWxsO1xuICAgICAgICBpZih1bmlxdWVPY2N1cGllZFJvd3MubGVuZ3RoID4gMSkge1xuXG4gICAgICAgICAgICB0aGlzTmV3T2NjdXBpZXMgPSBbXTtcbiAgICAgICAgICAgIG5ld0Jsb2NrT2NjdXBpZXMgPSBbXTtcblxuICAgICAgICAgICAgdmFyIGJsb2NrU3BsaXRzT24gPSBudWxsO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB1bmlxdWVPY2N1cGllZFJvd3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZih1bmlxdWVPY2N1cGllZFJvd3NbaV0gLSB1bmlxdWVPY2N1cGllZFJvd3NbaSAtIDFdID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBibG9ja1NwbGl0c09uID0gdW5pcXVlT2NjdXBpZWRSb3dzW2ldIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihibG9ja1NwbGl0c09uKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZXdPY2N1cGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3F1YXJlID0gbmV3T2NjdXBpZXNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmKHNxdWFyZS55IDwgYmxvY2tTcGxpdHNPbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc05ld09jY3VwaWVzLnB1c2goc3F1YXJlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0Jsb2NrT2NjdXBpZXMucHVzaChzcXVhcmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5vY2N1cGllcyA9IHRoaXMuY29weUFycmF5KHRoaXNOZXdPY2N1cGllcyk7XG4gICAgICAgICAgICAgICAgbmV3QmxvY2sgPSB0aGlzLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgbmV3QmxvY2sub2NjdXBpZXMgPSB0aGlzLmNvcHlBcnJheShuZXdCbG9ja09jY3VwaWVzKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vY2N1cGllcyA9IHRoaXMuY29weUFycmF5KG5ld09jY3VwaWVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vY2N1cGllcyA9IHRoaXMuY29weUFycmF5KG5ld09jY3VwaWVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3QmxvY2s7XG4gICAgfVxuXG4gICAgZ2V0T2NjdXBhdGlvbihyb3RhdGlvbikge1xuICAgICAgICB2YXIgbmV3T2NjdXBpZXMgPSBbXTtcblxuICAgICAgICB2YXIgZmlsbHMgPSB0aGlzLmdldEZpbGxGb3JUeXBlUm90YXRpb24ocm90YXRpb24pO1xuXG4gICAgICAgIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPCBmaWxscy5sZW5ndGg7IHJvd0luZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjZWxscyA9IGZpbGxzW3Jvd0luZGV4XS5zcGxpdCgnJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBjZWxsSW5kZXggPSAwOyBjZWxsSW5kZXggPD0gY2VsbHMubGVuZ3RoOyBjZWxsSW5kZXgrKykge1xuXG4gICAgICAgICAgICAgICAgaWYoY2VsbHNbY2VsbEluZGV4XSA9PT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09jY3VwaWVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5vcmlnaW5TcXVhcmUueCArIGNlbGxJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHRoaXMub3JpZ2luU3F1YXJlLnkgKyByb3dJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXdPY2N1cGllcztcblxuICAgIH1cbiAgICBkcmF3TGluZShsaW5lV2lkdGgsIGNvbG9yLCBmcm9tWCwgZnJvbVksIGxlbmd0aFgsIGxlbmd0aFkpIHtcbiAgICAgICAgdGhpcy5jdHgubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgICAgICB0aGlzLmN0eC5saW5lQ2FwID0gJ3JvdW5kJztcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgICAgdGhpcy5jdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIHRoaXMuY3R4Lm1vdmVUbyhmcm9tWCwgZnJvbVkpO1xuICAgICAgICB0aGlzLmN0eC5saW5lVG8oZnJvbVggKyBsZW5ndGhYLCBmcm9tWSArIGxlbmd0aFkpO1xuICAgICAgICB0aGlzLmN0eC5zdHJva2UoKTtcbiAgICB9XG5cbiAgICBjb2xvckRlZmF1bHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGUgPT09ICdJJyA/IHsgbWFpbjogJyMyMmRkZGQnLCBsaWdodGVyOiAnIzU1ZmZmZicsIGRhcmtlcjogJyMwMGJiYmInIH1cbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ0onID8geyBtYWluOiAnIzJhNjRkYicsIGxpZ2h0ZXI6ICcjNGM4NmZkJywgZGFya2VyOiAnIzA4NDJkOScgfVxuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnTCcgPyB7IG1haW46ICcjZGQ4ODIyJywgbGlnaHRlcjogJyNmZmFhNTUnLCBkYXJrZXI6ICcjYmI2NjAwJyB9XG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdPJyA/IHsgbWFpbjogJyNkZGRkMjInLCBsaWdodGVyOiAnI2ZmZmY1NScsIGRhcmtlcjogJyNiYmJiMDAnIH1cbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ1MnID8geyBtYWluOiAnIzIyYmI4OCcsIGxpZ2h0ZXI6ICcjNTVkZGFhJywgZGFya2VyOiAnIzAwOTk2NicgfVxuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnVCcgPyB7IG1haW46ICcjYjkzNGRiJywgbGlnaHRlcjogJyNkYjU2ZmQnLCBkYXJrZXI6ICcjOTcxMmI5JyB9XG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdaJyA/IHsgbWFpbjogJyNkZDIyMjInLCBsaWdodGVyOiAnI2ZmNTU1NScsIGRhcmtlcjogJyNiYjAwMDAnIH1cbiAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgeyBtYWluOiAnI2ZmZmZmZicsIGxpZ2h0ZXI6ICcjZmZmZmZmJywgZGFya2VyOiAnIzAwMDAwMCcgfVxuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgZ2V0RmlsbEZvclR5cGVSb3RhdGlvbihyb3RhdGlvbikge1xuICAgICAgICB2YXIgdHlwZVJvdGF0aW9ucyA9IHtcbiAgICAgICAgICAgIEk6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgSjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBMOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBPOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBTOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFQ6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgWjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyNfX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdHlwZVJvdGF0aW9uc1t0aGlzLnR5cGVdW3JvdGF0aW9uXTtcbiAgICB9XG4gICAgY29weUFycmF5KGFycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFycmF5KSk7XG4gICAgfVxuXG59XG4iXX0=;
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

            this.debug = false;
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
            this.formerStates = []; // debug tool
            this.formerStatesIndex = 0;
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
                    _this.formerStates.push({ score: _this.score(), heapBlocks: _this.copyArray(_this.heapBlocks), block: _this.copyArray(_this.blocks[0]) });
                }
                if (e.which === 80) {
                    _this.paused(!_this.paused());_this.formerStatesIndex = _this.formerStates.length - 1;
                }
                if (_this.anyKeyToStart()) {
                    _this.anyKeyToStart(false);
                }
                if ((_this.gameIsOver() || _this.gameIsCompleted()) && e.which === 13) {
                    _this.resetGame();
                }
                if (_this.paused()) {
                    if (e.which === 88 || e.which === 90) {
                        console.log(_this.formerStates);
                        // z
                        if (e.which === 90) {
                            _this.formerStatesIndex = _this.formerStatesIndex - 1 < 0 ? _this.formerStates.length - 1 : _this.formerStatesIndex - 1;
                        }
                        // x
                        else if (e.which === 88) {
                                _this.formerStatesIndex = _this.formerStatesIndex + 1 == _this.formerStates.length ? 0 : _this.formerStatesIndex + 1;
                            }
                        var state = _this.copyArray(_this.formerStates[_this.formerStatesIndex]);
                        console.log(state);
                        _this.heapBlocks = [];
                        for (var i = 0; i < state.heapBlocks.length; i++) {
                            _this.heapBlocks[i] = new _block.TetrisBlock(_this.copyArray(state.heapBlocks[i]));
                            _this.heapBlocks[i].ctx = _this.ctx;
                        }
                        _this.score(state.score);
                        _this.blocks[0] = new _block.TetrisBlock(_this.copyArray(state.block));
                        _this.blocks[0].ctx = _this.ctx;
                        _this.drawArea();
                        _this.draw();
                    }
                }
            });
            this.run();
        }

        _createClass(Tetris, [{
            key: 'saveDebugData',
            value: function saveDebugData() {
                if (this.debug) {
                    this.formerStates.push({ score: this.score(), heapBlocks: this.copyArray(this.heapBlocks), block: this.copyArray(this.blocks[0]) });
                }
            }
        }, {
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
                    4: 1200,
                    5: 5000,
                    6: 15000,
                    7: 30000,
                    8: 80000,
                    9: 100000,
                    10: 500000
                };
                var scoreForCleared = this.level() <= 10 ? groundScoreForNumberOfRows[numberOfRows] * this.level() : 1000000;
                this.score(this.score() + scoreForCleared);
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
                var ableToMove = false;
                if (this.loopsSinceStep > this.loopsPerStep) {
                    this.loopsSinceStep = 0;
                    ableToMove = this.activeBlock().move('down', this.allOccupiedSquares());
                    if (!ableToMove) {
                        this.doneWithBlock();
                    }
                }
                return ableToMove;
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
                    if (this.maybeTakeStep()) {
                        this.saveDebugData();
                    }
                }
                this.draw();

                var totalCompletedRows = 0;
                HADCOMPLETED: while (1) {
                    var completedRows = this.checkForCompletedRows();
                    if (!completedRows) {
                        break HADCOMPLETED;
                    }
                    totalCompletedRows += completedRows;
                    this.saveDebugData();
                    this.dropAfterCompleted();
                    this.saveDebugData();
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

                var displayedNextBlock = new _block.TetrisBlock({
                    type: nextBlock.type,
                    rotation: nextBlock.rotation,
                    unitSize: this.unitSize,
                    originSquare: { x: 2, y: 2 },
                    ctx: this.ctx,
                    area: this.nextBlockArea
                });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFJTSxNQUFNO0FBQ0csaUJBRFQsTUFBTSxDQUNJLE1BQU0sRUFBRTs7O2tDQURsQixNQUFNOztBQUVKLGdCQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixnQkFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDekMscUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUN2QyxxQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDOztBQUd6QyxnQkFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDckMsZ0JBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3ZDLGdCQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXpDLGdCQUFJLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztBQUMxQixnQkFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsY0FBYyxDQUFDLENBQUM7O0FBR3JFLGdCQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLGdCQUFnQixDQUFDO0FBQzdDLGdCQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQztBQUM1QyxnQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxD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RUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN2RCxvQkFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQy9CLG9CQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDN0Isb0JBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDckIsb0JBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM5QixvQkFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sRUFBRSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDbEQsb0JBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDckI7OzttQkFFTSxtQkFBRzs7O2FBR1Q7OztlQWxiQyxNQUFNOzs7cUJBcWJHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLDRCQUFnQixFQUFFIiwiZmlsZSI6ImdzcmMvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGtvIGZyb20gJ2tub2Nrb3V0JztcbmltcG9ydCB0ZW1wbGF0ZU1hcmt1cCBmcm9tICd0ZXh0IS4vdGV0cmlzLmh0bWwnO1xuaW1wb3J0IHsgVGV0cmlzQmxvY2sgfSBmcm9tICcuL2Jsb2NrJztcblxuY2xhc3MgVGV0cmlzIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5kZWJ1ZyA9IGZhbHNlO1xuICAgICAgICB2YXIgJGdhbWVBcmVhID0gJCgnI3RldHJpcy1wYWdlIGNhbnZhcycpO1xuICAgICAgICAkZ2FtZUFyZWFbMF0ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgJGdhbWVBcmVhWzBdLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXG4gICAgICAgIHRoaXMuY2FudmFzV2lkdGggPSAkZ2FtZUFyZWEud2lkdGgoKTtcbiAgICAgICAgdGhpcy5jYW52YXNIZWlnaHQgPSAkZ2FtZUFyZWEuaGVpZ2h0KCk7XG4gICAgICAgIHRoaXMuY3R4ID0gJGdhbWVBcmVhWzBdLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdmFyIGhvcml6b250YWxCbG9ja3MgPSAxMDtcbiAgICAgICAgdmFyIHZlcnRpY2FsQmxvY2tzID0gMjA7XG4gICAgICAgIHRoaXMudW5pdFNpemUgPSBNYXRoLnJvdW5kKHRoaXMuY2FudmFzSGVpZ2h0ICogMC43IC8gdmVydGljYWxCbG9ja3MpO1xuXG5cbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy51bml0U2l6ZSAqIGhvcml6b250YWxCbG9ja3M7XG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLnVuaXRTaXplICogdmVydGljYWxCbG9ja3M7XG4gICAgICAgIHZhciBsZWZ0ID0gTWF0aC5mbG9vcih0aGlzLmNhbnZhc1dpZHRoIC8gMiAtIHdpZHRoIC8gMik7XG4gICAgICAgIHZhciB0b3AgPSBNYXRoLmZsb29yKHRoaXMuY2FudmFzSGVpZ2h0IC8gMiAtIGhlaWdodCAvIDIpO1xuICAgICAgICAkKCcjdGl0bGUnKS5jc3MoeyB0b3A6IHRvcCAvIDQsIGZvbnRTaXplOiB0b3AgLyAyIH0pO1xuICAgICAgICAkKCcjc2NvcmVyJykuY3NzKHsgbGVmdDogbGVmdCArIHdpZHRoICsgdGhpcy51bml0U2l6ZSB9KTtcbiAgICAgICAgJCgnI3Njb3JlcicpLmNzcyh7IHRvcDogdG9wIH0pO1xuICAgICAgICAkKCcjc2NvcmVyIGgyJykuY3NzKHsgZm9udFNpemU6IHRoaXMudW5pdFNpemUgKiAxLjIgfSk7XG4gICAgICAgICQoJyNzY29yZXIgcCcpLmNzcyh7IGZvbnRTaXplOiB0aGlzLnVuaXRTaXplICogMi40LCBtYXJnaW5Ub3A6IC0gdGhpcy51bml0U2l6ZSB9KTtcblxuICAgICAgICAkKCcuc3BsYXNoJykuY3NzKHsgdG9wOiB0b3AgKyB0aGlzLnVuaXRTaXplICogMiwgd2lkdGg6IHRoaXMudW5pdFNpemUgKiAyNCwgbWFyZ2luTGVmdDogLXRoaXMudW5pdFNpemUgKiAxMiAtIDEwIH0pO1xuICAgICAgICAkKCcuc3BsYXNoIGgyJykuY3NzKHsgZm9udFNpemU6IHRoaXMudW5pdFNpemUgKiAxLjUgfSk7XG4gICAgICAgICQoJy5zcGxhc2ggdWwsIC5zcGxhc2ggcCcpLmNzcyh7IGZvbnRTaXplOiB0aGlzLnVuaXRTaXplICogMC43IH0pO1xuXG4gICAgICAgIHRoaXMuYXJlYSA9IHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgcmlnaHQ6IGxlZnQgKyB3aWR0aCxcbiAgICAgICAgICAgIGJvdHRvbTogdG9wICsgaGVpZ2h0LFxuICAgICAgICAgICAgaG9yaXpvbnRhbEJsb2NrczogaG9yaXpvbnRhbEJsb2NrcyxcbiAgICAgICAgICAgIHZlcnRpY2FsQmxvY2tzOiB2ZXJ0aWNhbEJsb2NrcyxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG5leHRCbG9ja0FyZWFMZWZ0ID0gbGVmdCAtIHRoaXMudW5pdFNpemUgKiA3O1xuICAgICAgICB0aGlzLm5leHRCbG9ja0FyZWEgPSB7XG4gICAgICAgICAgICBsZWZ0OiBuZXh0QmxvY2tBcmVhTGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMudW5pdFNpemUgKiA2LFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnVuaXRTaXplICogNixcbiAgICAgICAgICAgIHJpZ2h0OiBuZXh0QmxvY2tBcmVhTGVmdCArICB0aGlzLnVuaXRTaXplICogNixcbiAgICAgICAgICAgIGJvdHRvbTogdG9wICsgIHRoaXMudW5pdFNpemUgKiA2LFxuICAgICAgICAgICAgaG9yaXpvbnRhbEJsb2NrczogNixcbiAgICAgICAgICAgIHZlcnRpY2FsQmxvY2tzOiA2LFxuICAgICAgICB9XG4gICAgICAgIHRoaXMubGV2ZWwgPSBrby5vYnNlcnZhYmxlKDEpO1xuICAgICAgICB0aGlzLmNvbXBsZXRlZFJvd3MgPSBrby5vYnNlcnZhYmxlKDApO1xuICAgICAgICB0aGlzLnNjb3JlID0ga28ub2JzZXJ2YWJsZSgwKTtcbiAgICAgICAgdGhpcy5wYXVzZWQgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5nYW1lSXNPdmVyID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMuZ2FtZUlzQ29tcGxldGVkID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMuYW55S2V5VG9TdGFydCA9IGtvLm9ic2VydmFibGUodHJ1ZSk7XG4gICAgICAgIHRoaXMuZm9ybWVyU3RhdGVzID0gW107ICAvLyBkZWJ1ZyB0b29sXG4gICAgICAgIHRoaXMuZm9ybWVyU3RhdGVzSW5kZXggPSAwO1xuICAgICAgICB0aGlzLnJlc2V0R2FtZSgpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLmtleWRvd24oKGUpID0+IHtcbiAgICAgICAgICAgIGlmKHRoaXMuZ2FtZUlzUnVubmluZygpKSB7XG4gICAgICAgICAgICAgICAgaWYoZS53aGljaCA9PT0gMzgpICAgICAgeyB0aGlzLmFjdGl2ZUJsb2NrKCkucm90YXRlKHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihlLndoaWNoID09PSAzNykgeyB0aGlzLmFjdGl2ZUJsb2NrKCkubW92ZSgnbGVmdCcsIHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCkpICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihlLndoaWNoID09PSAzOSkgeyB0aGlzLmFjdGl2ZUJsb2NrKCkubW92ZSgncmlnaHQnLCB0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKSB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihlLndoaWNoID09PSA0MCkgeyB0aGlzLmFjdGl2ZUJsb2NrTW92ZURvd24oKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZihlLndoaWNoID09PSAzMikgeyB0aGlzLmFjdGl2ZUJsb2NrRHJvcCgpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtZXJTdGF0ZXMucHVzaCh7IHNjb3JlOiB0aGlzLnNjb3JlKCksIGhlYXBCbG9ja3M6IHRoaXMuY29weUFycmF5KHRoaXMuaGVhcEJsb2NrcyksIGJsb2NrOiB0aGlzLmNvcHlBcnJheSh0aGlzLmJsb2Nrc1swXSl9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGUud2hpY2ggPT09IDgwKSB7IHRoaXMucGF1c2VkKCF0aGlzLnBhdXNlZCgpKTsgdGhpcy5mb3JtZXJTdGF0ZXNJbmRleCA9IHRoaXMuZm9ybWVyU3RhdGVzLmxlbmd0aCAtIDE7IH1cbiAgICAgICAgICAgIGlmKHRoaXMuYW55S2V5VG9TdGFydCgpKSB7IHRoaXMuYW55S2V5VG9TdGFydChmYWxzZSkgfVxuICAgICAgICAgICAgaWYoKHRoaXMuZ2FtZUlzT3ZlcigpIHx8IHRoaXMuZ2FtZUlzQ29tcGxldGVkKCkpICYmIChlLndoaWNoID09PSAxMykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0R2FtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYodGhpcy5wYXVzZWQoKSkge1xuICAgICAgICAgICAgICAgIGlmKGUud2hpY2ggPT09IDg4IHx8IGUud2hpY2ggPT09IDkwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZm9ybWVyU3RhdGVzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gelxuICAgICAgICAgICAgICAgICAgICBpZihlLndoaWNoID09PSA5MCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtZXJTdGF0ZXNJbmRleCA9IHRoaXMuZm9ybWVyU3RhdGVzSW5kZXggLSAxIDwgMCA/IHRoaXMuZm9ybWVyU3RhdGVzLmxlbmd0aCAtIDEgOiB0aGlzLmZvcm1lclN0YXRlc0luZGV4IC0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyB4XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gODgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybWVyU3RhdGVzSW5kZXggPSB0aGlzLmZvcm1lclN0YXRlc0luZGV4ICsgMSA9PSB0aGlzLmZvcm1lclN0YXRlcy5sZW5ndGggPyAwIDogdGhpcy5mb3JtZXJTdGF0ZXNJbmRleCArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5jb3B5QXJyYXkodGhpcy5mb3JtZXJTdGF0ZXNbdGhpcy5mb3JtZXJTdGF0ZXNJbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGVhcEJsb2NrcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXRlLmhlYXBCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhlYXBCbG9ja3NbaV0gPSBuZXcgVGV0cmlzQmxvY2sodGhpcy5jb3B5QXJyYXkoc3RhdGUuaGVhcEJsb2Nrc1tpXSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGVhcEJsb2Nrc1tpXS5jdHggPSB0aGlzLmN0eDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjb3JlKHN0YXRlLnNjb3JlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ibG9ja3NbMF0gPSBuZXcgVGV0cmlzQmxvY2sodGhpcy5jb3B5QXJyYXkoc3RhdGUuYmxvY2spKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ibG9ja3NbMF0uY3R4ID0gdGhpcy5jdHg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0FyZWEoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ydW4oKTtcblxuICAgIH1cbiAgICBzYXZlRGVidWdEYXRhKCkge1xuICAgICAgICBpZih0aGlzLmRlYnVnKSB7XG4gICAgICAgICAgICB0aGlzLmZvcm1lclN0YXRlcy5wdXNoKHsgc2NvcmU6IHRoaXMuc2NvcmUoKSwgaGVhcEJsb2NrczogdGhpcy5jb3B5QXJyYXkodGhpcy5oZWFwQmxvY2tzKSwgYmxvY2s6IHRoaXMuY29weUFycmF5KHRoaXMuYmxvY2tzWzBdKX0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlc2V0R2FtZSgpIHtcbiAgICAgICAgdGhpcy5oZWFwQmxvY2tzID0gW107XG4gICAgICAgIHRoaXMuYmxvY2tzID0gdGhpcy5nZXRCYWdPZkJsb2NrcygpO1xuICAgICAgICB0aGlzLmxldmVsKDEpO1xuICAgICAgICB0aGlzLmxvb3BzUGVyU3RlcCA9IHRoaXMubG9vcHNQZXJTdGVwRm9yTGV2ZWwoMSk7XG4gICAgICAgIHRoaXMubG9vcHNTaW5jZVN0ZXAgPSAwO1xuICAgICAgICB0aGlzLmhhZENvbXBsZXRlZFJvd3NPbkxhc3RVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb21wbGV0ZWRSb3dzKDApO1xuICAgICAgICB0aGlzLnNjb3JlKDApO1xuICAgICAgICB0aGlzLmdhbWVJc092ZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLmdhbWVJc0NvbXBsZXRlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgZ2FtZUlzUnVubmluZygpIHtcbiAgICAgICAgcmV0dXJuICEodGhpcy5wYXVzZWQoKSB8fCB0aGlzLmFueUtleVRvU3RhcnQoKSB8fCB0aGlzLmdhbWVJc092ZXIoKSB8fCB0aGlzLmdhbWVJc0NvbXBsZXRlZCgpKTtcbiAgICB9XG5cbiAgICBkcmF3QXJlYSgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJyM3NzcnO1xuICAgICAgICAvLyBnYW1lIGFyZWFcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QodGhpcy5hcmVhLmxlZnQsIHRoaXMuYXJlYS50b3AsIHRoaXMuYXJlYS53aWR0aCwgdGhpcy5hcmVhLmhlaWdodCk7XG5cbiAgICAgICAgLy8gbmV4dCBibG9ja3MgYXJlYVxuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLm5leHRCbG9ja0FyZWEubGVmdCwgdGhpcy5uZXh0QmxvY2tBcmVhLnRvcCwgdGhpcy5uZXh0QmxvY2tBcmVhLndpZHRoLCB0aGlzLm5leHRCbG9ja0FyZWEuaGVpZ2h0KTtcblxuICAgICAgICAvLyBncmlkXG4gICAgICAgIHZhciBjID0gdGhpcy5jdHg7XG4gICAgICAgIGMubGluZVdpZHRoID0gMTtcbiAgICAgICAgdGhpcy5jdHgubGluZUNhcCA9ICdidXR0JztcbiAgICAgICAgZm9yICh2YXIgeCA9IDE7IHggPCB0aGlzLmFyZWEuaG9yaXpvbnRhbEJsb2NrczsgeCsrKSB7XG4gICAgICAgICAgICB0aGlzLmRyYXdMaW5lKFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgJyM4ODgnLFxuICAgICAgICAgICAgICAgIHggKiB0aGlzLnVuaXRTaXplICsgdGhpcy5hcmVhLmxlZnQsXG4gICAgICAgICAgICAgICAgdGhpcy5hcmVhLnRvcCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIHRoaXMuYXJlYS5oZWlnaHRcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBpZih0aGlzLmFueUtleVRvU3RhcnQoKSkge1xuICAgICAgICAgICAgdGhpcy5kcmF3QXJlYSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5nYW1lSXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd0FyZWEoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzZWxmLnJ1bigpIH0sIDEwKTtcbiAgICB9XG5cbiAgICBsb29wc1BlclN0ZXBGb3JMZXZlbChsZXZlbCkge1xuICAgICAgICByZXR1cm4gbGV2ZWwgPT0gMSA/IDIwXG4gICAgICAgICAgICAgOiBsZXZlbCA9PSAyID8gMThcbiAgICAgICAgICAgICA6IGxldmVsID09IDMgPyAxNlxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gNCA/IDE0XG4gICAgICAgICAgICAgOiBsZXZlbCA9PSA1ID8gMTJcbiAgICAgICAgICAgICA6IGxldmVsID09IDYgPyAxMFxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gNyA/IDlcbiAgICAgICAgICAgICA6IGxldmVsID09IDggPyA4XG4gICAgICAgICAgICAgOiBsZXZlbCA9PSA5ID8gN1xuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMTAgPyA1XG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgOTk5OTkgLy8gbWFnaWNcbiAgICAgICAgICAgICA7XG4gICAgfVxuICAgIGFjdGl2ZUJsb2NrKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3NbMF07XG4gICAgfVxuXG4gICAgbWF5YmVJbmNyZWFzZUxldmVsKCkge1xuICAgICAgICBpZih0aGlzLmNvbXBsZXRlZFJvd3MoKSA+PSB0aGlzLmxldmVsKCkgKiAxMCkge1xuICAgICAgICAgICAgdGhpcy5sZXZlbCh0aGlzLmxldmVsKCkgKyAxKTtcbiAgICAgICAgICAgIGlmKHRoaXMubG9vcHNQZXJTdGVwRm9yTGV2ZWwodGhpcy5sZXZlbCgpKSA+PSA5OTk5OSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUlzQ29tcGxldGVkKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubG9vcHNQZXJTdGVwID0gdGhpcy5sb29wc1BlclN0ZXBGb3JMZXZlbCh0aGlzLmxldmVsKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGluY3JlYXNlU2NvcmVXaXRoKHNjb3JlSW5jcmVhc2UpIHtcbiAgICAgICAgdGhpcy5zY29yZSh0aGlzLnNjb3JlKCkgKyBzY29yZUluY3JlYXNlKTtcbiAgICB9XG4gICAgZG9uZVdpdGhCbG9jayhkcm9wRGlzdGFuY2UgPSAwKSB7XG4gICAgICAgIGlmKHRoaXMuYWN0aXZlQmxvY2soKS5vcmlnaW5TcXVhcmUueSA8IDEpIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZUlzT3Zlcih0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhlYXBCbG9ja3MucHVzaCh0aGlzLmJsb2Nrcy5zaGlmdCgpKTtcbiAgICAgICAgaWYoZHJvcERpc3RhbmNlID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pbmNyZWFzZVNjb3JlV2l0aCgzICogdGhpcy5sZXZlbCgpICsgZHJvcERpc3RhbmNlICsgMyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodGhpcy5ibG9ja3MubGVuZ3RoIDwgNCkge1xuICAgICAgICAgICAgdGhpcy5ibG9ja3MgPSB0aGlzLmJsb2Nrcy5jb25jYXQodGhpcy5nZXRCYWdPZkJsb2NrcygpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnaXZlU2NvcmVGb3JTb2Z0RHJvcCgpIHtcbiAgICAgICAgdGhpcy5pbmNyZWFzZVNjb3JlV2l0aCh0aGlzLmxldmVsKCkpO1xuICAgIH1cbiAgICBnaXZlU2NvcmVGb3JDbGVhcmVkUm93cyhudW1iZXJPZlJvd3MpIHtcbiAgICAgICAgdmFyIGdyb3VuZFNjb3JlRm9yTnVtYmVyT2ZSb3dzID0ge1xuICAgICAgICAgICAgMDogICAgICAwLFxuICAgICAgICAgICAgMTogICAgIDQwLFxuICAgICAgICAgICAgMjogICAgMTAwLFxuICAgICAgICAgICAgMzogICAgMzAwLFxuICAgICAgICAgICAgNDogICAxMjAwLFxuICAgICAgICAgICAgNTogICA1MDAwLFxuICAgICAgICAgICAgNjogIDE1MDAwLFxuICAgICAgICAgICAgNzogIDMwMDAwLFxuICAgICAgICAgICAgODogIDgwMDAwLFxuICAgICAgICAgICAgOTogMTAwMDAwLFxuICAgICAgICAgICAxMDogNTAwMDAwLFxuICAgICAgICB9O1xuICAgICAgICB2YXIgc2NvcmVGb3JDbGVhcmVkID0gdGhpcy5sZXZlbCgpIDw9IDEwID8gZ3JvdW5kU2NvcmVGb3JOdW1iZXJPZlJvd3NbbnVtYmVyT2ZSb3dzXSAqIHRoaXMubGV2ZWwoKSA6IDEwMDAwMDA7XG4gICAgICAgIHRoaXMuc2NvcmUodGhpcy5zY29yZSgpICsgc2NvcmVGb3JDbGVhcmVkKTtcbiAgICAgICAgdGhpcy5jb21wbGV0ZWRSb3dzKHRoaXMuY29tcGxldGVkUm93cygpICsgbnVtYmVyT2ZSb3dzKTtcbiAgICAgICAgdGhpcy5tYXliZUluY3JlYXNlTGV2ZWwoKTtcblxuICAgIH1cblxuICAgIGFjdGl2ZUJsb2NrTW92ZURvd24oKSB7XG4gICAgICAgIGlmKHRoaXMuYWN0aXZlQmxvY2soKS5tb3ZlKCdkb3duJywgdGhpcy5hbGxPY2N1cGllZFNxdWFyZXMoKSkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2l2ZVNjb3JlRm9yU29mdERyb3AoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhY3RpdmVCbG9ja0Ryb3AoKSB7XG4gICAgICAgIHRoaXMuZG9uZVdpdGhCbG9jayggdGhpcy5hY3RpdmVCbG9jaygpLmRyb3AodGhpcy5hbGxPY2N1cGllZFNxdWFyZXMoKSkgKTtcbiAgICB9XG5cbiAgICBtYXliZVRha2VTdGVwKCkge1xuICAgICAgICArK3RoaXMubG9vcHNTaW5jZVN0ZXA7XG4gICAgICAgIHZhciBhYmxlVG9Nb3ZlID0gZmFsc2U7XG4gICAgICAgIGlmKHRoaXMubG9vcHNTaW5jZVN0ZXAgPiB0aGlzLmxvb3BzUGVyU3RlcCkge1xuICAgICAgICAgICAgdGhpcy5sb29wc1NpbmNlU3RlcCA9IDA7XG4gICAgICAgICAgICBhYmxlVG9Nb3ZlID0gdGhpcy5hY3RpdmVCbG9jaygpLm1vdmUoJ2Rvd24nLCB0aGlzLmFsbE9jY3VwaWVkU3F1YXJlcygpKTtcbiAgICAgICAgICAgIGlmKCFhYmxlVG9Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kb25lV2l0aEJsb2NrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFibGVUb01vdmU7XG4gICAgfVxuICAgIGNoZWNrRm9yQ29tcGxldGVkUm93cygpIHtcbiAgICAgICAgdmFyIGNvbXBsZXRlZFJvd3MgPSBbXTtcbiAgICAgICAgdmFyIGFsbE9jY3VwaWVkU3F1YXJlcyA9IHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzKCk7XG5cbiAgICAgICAgdmFyIG9jY3VwaWVkUGVyUm93ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuYXJlYS52ZXJ0aWNhbEJsb2NrczsgaSsrKSB7XG4gICAgICAgICAgICBvY2N1cGllZFBlclJvd1tpXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBhbGxPY2N1cGllZFNxdWFyZXMubWFwKChibG9jaykgPT4ge1xuICAgICAgICAgICAgYmxvY2subWFwKCAoc3F1YXJlKSA9PiB7XG4gICAgICAgICAgICAgICAgKytvY2N1cGllZFBlclJvd1tzcXVhcmUueV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgQ0hFQ0tDT01QTEVURUQ6XG4gICAgICAgIGZvciAodmFyIHJvd0luZGV4ID0gMDsgcm93SW5kZXggPD0gdGhpcy5hcmVhLnZlcnRpY2FsQmxvY2tzOyByb3dJbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgb2NjdXBpZWRTcXVhcmVzT25Sb3cgPSBvY2N1cGllZFBlclJvd1tyb3dJbmRleF07XG4gICAgICAgICAgICBpZihvY2N1cGllZFNxdWFyZXNPblJvdyA9PT0gdGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhZENvbXBsZXRlZFJvd3NPbkxhc3RVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZFJvd3MucHVzaChyb3dJbmRleCk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBjZWxsSW5kZXggPSAxOyBjZWxsSW5kZXggPD0gdGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3M7IGNlbGxJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICcjZmZmJztcblxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICA1ICsgdGhpcy5hcmVhLmxlZnQgKyAoY2VsbEluZGV4IC0gMSkgKiB0aGlzLnVuaXRTaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgNSArIHRoaXMuYXJlYS50b3AgKyAocm93SW5kZXggLSAxKSAqIHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVuaXRTaXplIC0gMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVuaXRTaXplIC0gMTBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihjb21wbGV0ZWRSb3dzLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG5ld0hlYXBCbG9ja3MgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhlYXBCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgYmxvY2sgPSB0aGlzLmhlYXBCbG9ja3NbaV07XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9zc2libGVOZXdCbG9jayA9IGJsb2NrLnJlbW92ZUZyb21Sb3dzKGNvbXBsZXRlZFJvd3MpO1xuICAgICAgICAgICAgICAgIGlmKHBvc3NpYmxlTmV3QmxvY2sgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3SGVhcEJsb2Nrcy5wdXNoKHBvc3NpYmxlTmV3QmxvY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihibG9jay5vY2N1cGllcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3SGVhcEJsb2Nrcy5wdXNoKGJsb2NrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaGVhcEJsb2NrcyA9IG5ld0hlYXBCbG9ja3M7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBsZXRlZFJvd3MubGVuZ3RoO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYodGhpcy5oYWRDb21wbGV0ZWRSb3dzT25MYXN0VXBkYXRlKSB7XG4gICAgICAgICAgICAvL3RoaXMuZHJvcEFmdGVyQ29tcGxldGVkKCk7XG4gICAgICAgICAgICB0aGlzLmhhZENvbXBsZXRlZFJvd3NPbkxhc3RVcGRhdGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmKHRoaXMubWF5YmVUYWtlU3RlcCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zYXZlRGVidWdEYXRhKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcmF3KCk7XG5cbiAgICAgICAgdmFyIHRvdGFsQ29tcGxldGVkUm93cyA9IDA7XG4gICAgICAgIEhBRENPTVBMRVRFRDpcbiAgICAgICAgd2hpbGUoMSkge1xuICAgICAgICAgICAgdmFyIGNvbXBsZXRlZFJvd3MgPSB0aGlzLmNoZWNrRm9yQ29tcGxldGVkUm93cygpO1xuICAgICAgICAgICAgaWYoIWNvbXBsZXRlZFJvd3MpIHtcbiAgICAgICAgICAgICAgICBicmVhayBIQURDT01QTEVURUQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0b3RhbENvbXBsZXRlZFJvd3MgKz0gY29tcGxldGVkUm93cztcbiAgICAgICAgICAgIHRoaXMuc2F2ZURlYnVnRGF0YSgpO1xuICAgICAgICAgICAgdGhpcy5kcm9wQWZ0ZXJDb21wbGV0ZWQoKTtcbiAgICAgICAgICAgIHRoaXMuc2F2ZURlYnVnRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHRvdGFsQ29tcGxldGVkUm93cykge1xuICAgICAgICAgICAgdGhpcy5naXZlU2NvcmVGb3JDbGVhcmVkUm93cyh0b3RhbENvbXBsZXRlZFJvd3MpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVCbG9jaygpLmRyYXdTaGFkb3codGhpcy5hbGxPY2N1cGllZFNxdWFyZXMoKSk7XG4gICAgICAgIHRoaXMuYWN0aXZlQmxvY2soKS5kcmF3KCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oZWFwQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmhlYXBCbG9ja3NbaV0uZHJhdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5leHRCbG9jayA9IHRoaXMuYmxvY2tzWzFdO1xuXG4gICAgICAgIHZhciBkaXNwbGF5ZWROZXh0QmxvY2sgPSBuZXcgVGV0cmlzQmxvY2soe1xuICAgICAgICAgICAgdHlwZTogbmV4dEJsb2NrLnR5cGUsXG4gICAgICAgICAgICByb3RhdGlvbjogbmV4dEJsb2NrLnJvdGF0aW9uLFxuICAgICAgICAgICAgdW5pdFNpemU6IHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICBvcmlnaW5TcXVhcmU6IHsgeDogMiwgeTogMiB9LFxuICAgICAgICAgICAgY3R4OiB0aGlzLmN0eCxcbiAgICAgICAgICAgIGFyZWE6IHRoaXMubmV4dEJsb2NrQXJlYSxcbiAgICAgICAgfSk7XG4gICAgICAgIGRpc3BsYXllZE5leHRCbG9jay5kcmF3KCk7XG4gICAgfVxuICAgIGRyb3BBZnRlckNvbXBsZXRlZCgpIHtcbiAgICAgICAgdmFyIGNvdWxkRHJvcEFueUJsb2NrID0gdHJ1ZTtcblxuICAgICAgICB3aGlsZShjb3VsZERyb3BBbnlCbG9jaykge1xuICAgICAgICAgICAgY291bGREcm9wQW55QmxvY2sgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhlYXBCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaG93RmFyRHJvcHBlZCA9IHRoaXMuaGVhcEJsb2Nrc1tpXS5kcm9wKHRoaXMuYWxsT2NjdXBpZWRTcXVhcmVzRXhwZWN0QmxvY2tJbmRleChpKSk7XG4gICAgICAgICAgICAgICAgaWYoaG93RmFyRHJvcHBlZCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY291bGREcm9wQW55QmxvY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFsbE9jY3VwaWVkU3F1YXJlcygpIHtcbiAgICAgICAgdmFyIGFsbE9jY3VwaWVkU3F1YXJlcyA9IFtdO1xuXG4gICAgICAgIE9DQ1VQSUVEOlxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaGVhcEJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGJsb2NrID0gdGhpcy5oZWFwQmxvY2tzW2ldO1xuXG4gICAgICAgICAgICBpZihibG9jay5vY2N1cGllcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhbGxPY2N1cGllZFNxdWFyZXMucHVzaChibG9jay5vY2N1cGllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFsbE9jY3VwaWVkU3F1YXJlcztcbiAgICB9XG4gICAgYWxsT2NjdXBpZWRTcXVhcmVzRXhwZWN0QmxvY2tJbmRleChleGNlcHRCbG9ja0luZGV4KSB7XG4gICAgICAgIHZhciBhbGxPY2N1cGllZFNxdWFyZXMgPSBbXTtcblxuICAgICAgICBPQ0NVUElFRDpcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmhlYXBCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmKGkgPT09IGV4Y2VwdEJsb2NrSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZSBPQ0NVUElFRDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFsbE9jY3VwaWVkU3F1YXJlcy5wdXNoKHRoaXMuaGVhcEJsb2Nrc1tpXS5vY2N1cGllcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFsbE9jY3VwaWVkU3F1YXJlcztcbiAgICB9XG5cbiAgICBnZXRCYWdPZkJsb2NrcyhhbW91bnQpIHtcbiAgICAgICAgdmFyIGJsb2NrcyA9IFtdO1xuICAgICAgICB2YXIgYmxvY2tUeXBlcyA9IFsnSScsICdKJywgJ0wnLCAnTycsICdTJywgJ1QnLCAnWiddO1xuICAgICAgICB2YXIgcm90YXRpb24gPSBbMCwgMSwgMiwgM107XG5cbiAgICAgICAgd2hpbGUoYmxvY2tUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciByYW5kb21CbG9ja1R5cGVJbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGJsb2NrVHlwZXMubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciB0eXBlID0gYmxvY2tUeXBlcy5zcGxpY2UocmFuZG9tQmxvY2tUeXBlSW5kZXgsIDEpLnNoaWZ0KCk7XG4gICAgICAgICAgICBibG9ja3MucHVzaChuZXcgVGV0cmlzQmxvY2soe1xuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgcm90YXRpb246IHJvdGF0aW9uWyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByb3RhdGlvbi5sZW5ndGgpIF0sXG4gICAgICAgICAgICAgICAgdW5pdFNpemU6IHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgb3JpZ2luU3F1YXJlOiB7IHg6IE1hdGguZmxvb3IodGhpcy5hcmVhLmhvcml6b250YWxCbG9ja3MgLyAyKSAtIDEsIHk6IC0yIH0sXG4gICAgICAgICAgICAgICAgY3R4OiB0aGlzLmN0eCxcbiAgICAgICAgICAgICAgICBhcmVhOiB0aGlzLmFyZWEsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJsb2NrcztcbiAgICB9XG4gICAgY29weUFycmF5KGFycmF5KSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGFycmF5KSk7XG4gICAgfVxuICAgIGRyYXdMaW5lKGxpbmVXaWR0aCwgY29sb3IsIGZyb21YLCBmcm9tWSwgbGVuZ3RoWCwgbGVuZ3RoWSkge1xuICAgICAgICB0aGlzLmN0eC5saW5lV2lkdGggPSBsaW5lV2lkdGg7XG4gICAgICAgIHRoaXMuY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICAgIHRoaXMuY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB0aGlzLmN0eC5tb3ZlVG8oZnJvbVgsIGZyb21ZKTtcbiAgICAgICAgdGhpcy5jdHgubGluZVRvKGZyb21YICsgbGVuZ3RoWCwgZnJvbVkgKyBsZW5ndGhZKTtcbiAgICAgICAgdGhpcy5jdHguc3Ryb2tlKCk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgLy8gVGhpcyBydW5zIHdoZW4gdGhlIGNvbXBvbmVudCBpcyB0b3JuIGRvd24uIFB1dCBoZXJlIGFueSBsb2dpYyBuZWNlc3NhcnkgdG8gY2xlYW4gdXAsXG4gICAgICAgIC8vIGZvciBleGFtcGxlIGNhbmNlbGxpbmcgc2V0VGltZW91dHMgb3IgZGlzcG9zaW5nIEtub2Nrb3V0IHN1YnNjcmlwdGlvbnMvY29tcHV0ZWRzLlxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgeyB2aWV3TW9kZWw6IFRldHJpcywgdGVtcGxhdGU6IHRlbXBsYXRlTWFya3VwIH07XG4iXX0=;