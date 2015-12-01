
define('text!components/pong/pong.html',[],function () { return '<div id="pong-page">\n    <canvas class="full"></canvas>\n    \n            <div class="btn-group" id="pong-settings">\n                <a class="btn btn-default" data-bind="click: pausePong" href="#">Pause</a>\n            </div>\n    <div id="pong-player-data" data-bind="foreach: paddles">\n        <div>\n            <h2 class="text-center" data-bind="text: name()"></h2>\n            <p class="text-center" data-bind="text: score()"></p>\n        </div>\n    </div>\n    <div id="pong-bounces">\n        <div>\n            <h2 class="text-center">Bounces</h2>\n            <p class="text-center" data-bind="text: bounces"></p>\n        </div>\n    </div>\n    <div id="pong-game-over" data-bind="visible: waitingForNewGame()">\n        <p class="text-center"><span data-bind="text: winnerName()"></span> won!</p>\n        <p class="text-center"><small>Press any key (or tap) to play again</small></p>\n    </div>\n</div>\n';});

define('components/pong/pong',['exports', 'module', 'knockout', 'text!./pong.html'], function (exports, module, _knockout, _textPongHtml) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var _pongTemplate = _interopRequireDefault(_textPongHtml);

    _ko['default'].bindingHandlers.clickToggler = {
        init: function init(el, valueAcc) {
            var value = valueAcc();

            _ko['default'].utils.registerEventHandler(el, 'click', function () {
                value(!value());
                $(el).blur();
            });
        }
    };

    var KeyListener = (function () {
        function KeyListener(params) {
            _classCallCheck(this, KeyListener);

            this.pressedKeys = [];
            document.addEventListener('keydown', this.keyDown.bind(this));
            document.addEventListener('keyup', this.keyUp.bind(this));
        }

        _createClass(KeyListener, [{
            key: 'keyDown',
            value: function keyDown(e) {
                this.pressedKeys[e.keyCode] = true;
            }
        }, {
            key: 'keyUp',
            value: function keyUp(e) {
                this.pressedKeys[e.keyCode] = false;
            }
        }, {
            key: 'isPressed',
            value: function isPressed(key) {
                return this.pressedKeys[key] ? true : false;
            }
        }, {
            key: 'addKeyPressListener',
            value: function addKeyPressListener(keyCode, callback) {
                document.addEventListener('keypress', function (e) {
                    if (e.keyCode === keyCode) {
                        callback(e);
                    }
                });
            }
        }]);

        return KeyListener;
    })();

    var Ball = (function () {
        function Ball(params) {
            _classCallCheck(this, Ball);

            this.size = Math.round(params.size);
            this.ctx = params.ctx;
            this.speed = Math.round(params.speed);
            this.bearing = Math.round(params.initialBearing), this.x = Math.round(params.initialX), this.y = Math.round(params.initialY);
        }

        _createClass(Ball, [{
            key: 'invertHorizontalBearing',
            value: function invertHorizontalBearing() {
                if (this.bearing > 180) {
                    this.bearing = 90 + (270 - this.bearing);
                } else {
                    this.bearing = 270 + (90 - this.bearing);
                }
            }
        }, {
            key: 'invertVerticalBearing',
            value: function invertVerticalBearing() {

                if (this.bearing < 180) {
                    this.bearing = 180 - this.bearing;
                } else {
                    this.bearing = 270 + (270 - this.bearing);
                }
            }
        }, {
            key: 'speedChange',
            value: function speedChange(percent) {
                this.speed = this.speed * (1 + percent / 100);
            }
        }, {
            key: 'makeMove',
            value: function makeMove(params) {
                this.x = params.x;
                this.y = params.y;
            }
        }, {
            key: 'nextMove',
            value: function nextMove(params) {
                var howMuchY = Math.abs(90 - (this.bearing > 180 ? this.bearing - 180 : this.bearing)) * 90 / 100;
                var howMuchX = 100 - howMuchY;
                var leftOrRight = this.bearing > 180 ? 'left' : 'right';
                var upOrDown = this.bearing > 270 || this.bearing < 90 ? 'up' : 'down';

                deltaY = howMuchY / 100 * this.speed;
                deltaX = howMuchX / 100 * this.speed;
                if (params) {
                    console.log(params);
                }
                if (params && params.maxX && deltaX > params.maxX) {
                    var slowDown = params.maxX / deltaX;
                    deltaX = Math.floor(deltaX * slowDown);
                    deltaY = Math.floor(deltaY * slowDown);
                }

                deltaY = upOrDown === 'up' ? -deltaY : deltaY;
                deltaX = leftOrRight === 'left' ? -deltaX : deltaX;

                return { x: Math.round(this.x + deltaX), y: Math.round(this.y + deltaY) };
            }
        }, {
            key: 'draw',
            value: function draw() {
                this.ctx.fillStyle = '#ffcccc';
                this.ctx.fillRect(this.x, this.y, this.size, this.size);
                this.ctx.fillStyle = '#fff';
            }
        }]);

        return Ball;
    })();

    var Paddle = (function () {
        function Paddle(params) {
            _classCallCheck(this, Paddle);

            this.x = Math.round(params.x);
            this.y = Math.round(params.y);
            this.width = params.paddleWidth;
            this.height = Math.round(params.paddleHeight);
            this.gameHeight = params.gameHeight;
            this.speed = params.speed;
            this.score = _ko['default'].observable(0);
            this.ctx = params.ctx;
            this.name = _ko['default'].observable(params.name);
        }

        _createClass(Paddle, [{
            key: 'won',
            value: function won() {
                this.score(this.score() + 1);
            }
        }, {
            key: 'rightEdge',
            value: function rightEdge() {
                return this.x + this.width;
            }
        }, {
            key: 'bottomEdge',
            value: function bottomEdge() {
                return this.y + this.height;
            }
        }, {
            key: 'move',
            value: function move(direction) {
                if (direction === 'down') {
                    this.y = Math.round(Math.min(this.gameHeight - this.height - 2, this.y + this.speed));
                } else if (direction === 'up') {
                    this.y = Math.round(Math.max(2, this.y - this.speed));
                }
            }
        }, {
            key: 'draw',
            value: function draw() {
                this.ctx.fillRect(this.x, this.y, this.width, this.height);
                this.ctx.fillStyle = '#ff80ff';
                this.ctx.fillRect(this.x, this.y, this.width, this.height / 6);
                this.ctx.fillRect(this.x, this.y + this.height - this.height / 6, this.width, this.height / 6);
                this.ctx.fillStyle = 'white';
            }
        }]);

        return Paddle;
    })();

    function randRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var PongViewModel = (function () {
        function PongViewModel(route) {
            _classCallCheck(this, PongViewModel);

            var $gameArea = $('#pong-page canvas');
            $gameArea[0].width = window.innerWidth;
            $gameArea[0].height = window.innerHeight;

            this.width = $gameArea.width();
            this.height = $gameArea.height();
            this.keys = new KeyListener();
            this.paused = false;
            this.waitingForNewGame = _ko['default'].observable(false);
            this.bounces = _ko['default'].observable(0);

            this.ctx = $gameArea[0].getContext('2d');
            this.ctx.fillStyle = 'white';

            var initialPaddleHeightDivisor = 8;
            this.initialPaddleSpeedDivisor = 75;
            this.initalBallSpeedMultiplicator = 1.25;
            this.paddles = _ko['default'].observableArray([new Paddle({
                gameHeight: this.height,
                speed: this.height / this.initialPaddleSpeedDivisor,
                name: 'left',
                x: 64,
                y: 300,
                paddleWidth: 15,
                paddleHeight: this.height / initialPaddleHeightDivisor,
                ctx: this.ctx
            }), new Paddle({
                gameHeight: this.height,
                speed: this.height / this.initialPaddleSpeedDivisor,
                name: 'right',
                x: this.width - 68,
                y: 300,
                paddleWidth: 15,
                paddleHeight: this.height / initialPaddleHeightDivisor,
                ctx: this.ctx
            })]);

            this.winner = _ko['default'].observable();
            this.winnerName = _ko['default'].observable();
            this.ballSettings = {
                size: 4 * this.height / 80,
                ctx: this.ctx,
                speed: this.initalBallSpeedMultiplicator * this.height / this.initialPaddleSpeedDivisor,
                initialY: Math.random() * (this.height / 2 + this.height / 10 - (this.height / 2 - this.height / 10)) + (this.height / 2 - this.height / 10)
            };
            this.newRound();
            this.run();
        }

        _createClass(PongViewModel, [{
            key: 'bounce',
            value: function bounce() {
                this.ball.invertHorizontalBearing();
                this.bounces(this.bounces() + 1);
                //if(this.bounces() % 3 === 0) {
                this.ball.speedChange(2);
                //}
            }
        }, {
            key: 'pausePong',
            value: function pausePong() {
                this.pause = !this.pause;
            }
        }, {
            key: 'newRound',
            value: function newRound() {
                var initialBallX = randRange(this.width / 2 - this.width / 10, this.width / 2 + this.width / 10);
                this.ballSettings.initialBearing = initialBallX > this.width / 2 ? randRange(240, 300) : randRange(60, 120);
                this.ballSettings.initialX = initialBallX;
                this.ball = new Ball(this.ballSettings);
                this.bounces(0);
            }
        }, {
            key: 'checkBallVerticallyOnPaddle',
            value: function checkBallVerticallyOnPaddle(paddle) {
                var allowedBallTopY = this.ball.y - this.ball.size * 0.8;
                var allowedBallBottomY = this.ball.y + this.ball.size + this.ball.size * 0.8;
                return allowedBallTopY >= paddle.y && allowedBallBottomY <= paddle.bottomEdge() ? true : false;
            }
        }, {
            key: 'gameOver',
            value: function gameOver() {
                this.waitingForNewGame(true);
                this.winner().won();
                this.winnerName(this.winner().name);
            }
        }, {
            key: 'update',
            value: function update() {
                var _this = this;

                if (this.paused || this.waitingForNewGame()) {
                    return;
                }
                var leftPaddle = this.paddles()[0];
                var rightPaddle = this.paddles()[1];

                //this.ball.move();
                var nextBallMove = this.ball.nextMove();

                // Left paddle?
                if (this.ball.x >= leftPaddle.rightEdge() && nextBallMove.x <= leftPaddle.rightEdge() && this.ball.y + this.ball.size >= leftPaddle.y && this.ball.y <= leftPaddle.bottomEdge()) {

                    nextBallMove = this.ball.nextMove({ maxX: this.ball.x - leftPaddle.rightEdge() });
                    this.bounce();
                }
                // Right paddle?
                else if (this.ball.x + this.ball.size <= rightPaddle.x && nextBallMove.x + this.ball.size > rightPaddle.x && this.ball.y + this.ball.size >= rightPaddle.y && this.ball.y <= rightPaddle.bottomEdge()) {
                        nextBallMove = this.ball.nextMove({ maxX: rightPaddle.x - this.ball.x });
                        this.bounce();
                    }
                    // Hits wall or floor
                    else if (this.ball.y + this.ball.size > this.height || this.ball.y < 0) {
                            this.ball.invertVerticalBearing();
                            nextBallMove = this.ball.nextMove();
                        }
                        // Hit left edge
                        else if (this.ball.x + this.ball.size < 0) {
                                this.winner(rightPaddle);
                                this.gameOver();
                                return;
                            }
                            // Hit right edge
                            else if (this.ball.x > this.width) {
                                    this.winner(leftPaddle);
                                    this.gameOver();
                                    return;
                                }

                this.ball.makeMove(nextBallMove);
                this.draw();

                if (this.keys.isPressed(83)) {
                    leftPaddle.move('down');
                } else if (this.keys.isPressed(87)) {
                    leftPaddle.move('up');
                }

                if (this.keys.isPressed(40)) {
                    rightPaddle.move('down');
                } else if (this.keys.isPressed(38)) {
                    rightPaddle.move('up');
                }
                $(document).keydown(function (e) {
                    if (_this.waitingForNewGame()) {
                        _this.waitingForNewGame(false);
                        _this.newRound();
                    } else if (e.which === 80) {
                        _this.paused = !_this.paused;
                    }
                });
            }
        }, {
            key: 'draw',
            value: function draw() {
                this.ctx.clearRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(-1 + this.width / 2, 0, 2, this.height);

                this.ball.draw();
                for (var i = 0; i < this.paddles().length; i++) {
                    var paddle = this.paddles()[i];
                    paddle.draw();
                }
            }
        }, {
            key: 'run',
            value: function run() {
                var self = this;
                self.update();
                setTimeout(function () {
                    self.run();
                }, 25);
            }
        }]);

        return PongViewModel;
    })();

    module.exports = { viewModel: PongViewModel, template: _pongTemplate['default'] };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy9wb25nL3BvbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUtBLG1CQUFHLGVBQWUsQ0FBQyxZQUFZLEdBQUc7QUFDOUIsWUFBSSxFQUFFLGNBQVUsRUFBRSxFQUFFLFFBQVEsRUFBRTtBQUMxQixnQkFBSSxLQUFLLEdBQUcsUUFBUSxFQUFFLENBQUM7O0FBRXZCLDJCQUFHLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLFlBQVc7QUFDbEQscUJBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDaEIsaUJBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNoQixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7O1FBRUksV0FBVztBQUNGLGlCQURULFdBQVcsQ0FDRCxNQUFNLEVBQUU7a0NBRGxCLFdBQVc7O0FBRVQsZ0JBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLG9CQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDOUQsb0JBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUM3RDs7cUJBTEMsV0FBVzs7bUJBT04saUJBQUMsQ0FBQyxFQUFFO0FBQ1Asb0JBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQzthQUN0Qzs7O21CQUNJLGVBQUMsQ0FBQyxFQUFFO0FBQ0wsb0JBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUN2Qzs7O21CQUVRLG1CQUFDLEdBQUcsRUFBRTtBQUNYLHVCQUFPLElBQUksQ0FBQyxXQUFX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SSxFQUFFLENBQUM7QUFDakIscUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLHdCQUFJLE1BQU0sR0FBRyxBQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBRSxDQUFDLENBQUMsQ0FBQztBQUNqQywwQkFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNqQjthQUNKOzs7bUJBRUUsZUFBRztBQUNGLG9CQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsb0JBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNkLDBCQUFVLENBQUMsWUFBVztBQUFFLHdCQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7aUJBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUM3Qzs7O2VBOUtDLGFBQWE7OztxQkFpTEosRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLFFBQVEsMEJBQWMsRUFBRSIsImZpbGUiOiJnc3JjL2NvbXBvbmVudHMvcG9uZy9wb25nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuaW1wb3J0IHBvbmdUZW1wbGF0ZSBmcm9tICd0ZXh0IS4vcG9uZy5odG1sJztcblxuXG5rby5iaW5kaW5nSGFuZGxlcnMuY2xpY2tUb2dnbGVyID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIChlbCwgdmFsdWVBY2MpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2MoKTtcblxuICAgICAgICBrby51dGlscy5yZWdpc3RlckV2ZW50SGFuZGxlcihlbCwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YWx1ZSghdmFsdWUoKSk7XG4gICAgICAgICAgICAkKGVsKS5ibHVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmNsYXNzIEtleUxpc3RlbmVyIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5cyA9IFtdO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlEb3duLmJpbmQodGhpcykpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMua2V5VXAuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAga2V5RG93bihlKSB7XG4gICAgICAgIHRoaXMucHJlc3NlZEtleXNbZS5rZXlDb2RlXSA9IHRydWU7XG4gICAgfVxuICAgIGtleVVwKGUpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5c1tlLmtleUNvZGVdID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaXNQcmVzc2VkKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcmVzc2VkS2V5c1trZXldID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgICBhZGRLZXlQcmVzc0xpc3RlbmVyKGtleUNvZGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmKGUua2V5Q29kZSA9PT0ga2V5Q29kZSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNsYXNzIEJhbGwge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLnNpemUgPSBNYXRoLnJvdW5kKHBhcmFtcy5zaXplKTtcbiAgICAgICAgdGhpcy5jdHggPSBwYXJhbXMuY3R4O1xuICAgICAgICB0aGlzLnNwZWVkID0gTWF0aC5yb3VuZChwYXJhbXMuc3BlZWQpO1xuICAgICAgICB0aGlzLmJlYXJpbmcgPSBNYXRoLnJvdW5kKHBhcmFtcy5pbml0aWFsQmVhcmluZyksXG4gICAgICAgIHRoaXMueCA9IE1hdGgucm91bmQocGFyYW1zLmluaXRpYWxYKSxcbiAgICAgICAgdGhpcy55ID0gTWF0aC5yb3VuZChwYXJhbXMuaW5pdGlhbFkpO1xuICAgIH1cblxuICAgIGludmVydEhvcml6b250YWxCZWFyaW5nKCkge1xuICAgICAgICBpZih0aGlzLmJlYXJpbmcgPiAxODApIHtcbiAgICAgICAgICAgIHRoaXMuYmVhcmluZyA9IDkwICsgKDI3MCAtIHRoaXMuYmVhcmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJlYXJpbmcgPSAyNzAgKyAoOTAgLSB0aGlzLmJlYXJpbmcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGludmVydFZlcnRpY2FsQmVhcmluZygpIHtcblxuICAgICAgICBpZiAodGhpcy5iZWFyaW5nIDwgMTgwKSB7XG4gICAgICAgICAgICB0aGlzLmJlYXJpbmcgPSAxODAgLSB0aGlzLmJlYXJpbmc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmJlYXJpbmcgPSAyNzAgKyAoMjcwIC0gdGhpcy5iZWFyaW5nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzcGVlZENoYW5nZShwZXJjZW50KSB7XG4gICAgICAgIHRoaXMuc3BlZWQgPSB0aGlzLnNwZWVkICogKDEgKyBwZXJjZW50IC8gMTAwKTtcbiAgICB9XG4gICAgbWFrZU1vdmUocGFyYW1zKSB7XG4gICAgICAgIHRoaXMueCA9IHBhcmFtcy54O1xuICAgICAgICB0aGlzLnkgPSBwYXJhbXMueTtcbiAgICB9XG4gICAgbmV4dE1vdmUocGFyYW1zKSB7XG4gICAgICAgIHZhciBob3dNdWNoWSA9IE1hdGguYWJzKDkwIC0gKHRoaXMuYmVhcmluZyA+IDE4MCA/IHRoaXMuYmVhcmluZyAtIDE4MCA6IHRoaXMuYmVhcmluZykpICogOTAvMTAwO1xuICAgICAgICB2YXIgaG93TXVjaFggPSAxMDAgLSBob3dNdWNoWTtcbiAgICAgICAgdmFyIGxlZnRPclJpZ2h0ID0gdGhpcy5iZWFyaW5nID4gMTgwID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgICAgdmFyIHVwT3JEb3duID0gdGhpcy5iZWFyaW5nID4gMjcwIHx8IHRoaXMuYmVhcmluZyA8IDkwID8gJ3VwJyA6ICdkb3duJztcblxuICAgICAgICBkZWx0YVkgPSBob3dNdWNoWSAvIDEwMCAqIHRoaXMuc3BlZWQ7XG4gICAgICAgIGRlbHRhWCA9IGhvd011Y2hYIC8gMTAwICogdGhpcy5zcGVlZDtcbiAgICAgICAgaWYocGFyYW1zKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHBhcmFtcyAmJiBwYXJhbXMubWF4WCAmJiBkZWx0YVggPiBwYXJhbXMubWF4WCkge1xuICAgICAgICAgICAgdmFyIHNsb3dEb3duID0gcGFyYW1zLm1heFggLyBkZWx0YVg7XG4gICAgICAgICAgICBkZWx0YVggPSBNYXRoLmZsb29yKGRlbHRhWCAqIHNsb3dEb3duKTtcbiAgICAgICAgICAgIGRlbHRhWSA9IE1hdGguZmxvb3IoZGVsdGFZICogc2xvd0Rvd24pO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVsdGFZID0gdXBPckRvd24gPT09ICd1cCcgPyAtZGVsdGFZIDogZGVsdGFZO1xuICAgICAgICBkZWx0YVggPSBsZWZ0T3JSaWdodCA9PT0gJ2xlZnQnID8gLWRlbHRhWCA6IGRlbHRhWDtcblxuICAgICAgICByZXR1cm4geyB4OiBNYXRoLnJvdW5kKHRoaXMueCArIGRlbHRhWCksIHk6IE1hdGgucm91bmQodGhpcy55ICsgZGVsdGFZKSB9O1xuICAgICAgICBcbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnI2ZmY2NjYyc7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLnNpemUsIHRoaXMuc2l6ZSk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICcjZmZmJztcbiAgICB9XG59XG5cbmNsYXNzIFBhZGRsZSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMueCA9IE1hdGgucm91bmQocGFyYW1zLngpO1xuICAgICAgICB0aGlzLnkgPSBNYXRoLnJvdW5kKHBhcmFtcy55KTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHBhcmFtcy5wYWRkbGVXaWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBNYXRoLnJvdW5kKHBhcmFtcy5wYWRkbGVIZWlnaHQpO1xuICAgICAgICB0aGlzLmdhbWVIZWlnaHQgPSBwYXJhbXMuZ2FtZUhlaWdodDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IHBhcmFtcy5zcGVlZDtcbiAgICAgICAgdGhpcy5zY29yZSA9IGtvLm9ic2VydmFibGUoMCk7XG4gICAgICAgIHRoaXMuY3R4ID0gcGFyYW1zLmN0eDtcbiAgICAgICAgdGhpcy5uYW1lID0ga28ub2JzZXJ2YWJsZShwYXJhbXMubmFtZSk7XG4gICAgICAgXG4gICAgfVxuICAgIHdvbigpIHtcbiAgICAgICAgdGhpcy5zY29yZSh0aGlzLnNjb3JlKCkgKyAxKTtcbiAgICB9XG4gICAgcmlnaHRFZGdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy54ICsgdGhpcy53aWR0aDtcbiAgICB9XG4gICAgYm90dG9tRWRnZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueSArIHRoaXMuaGVpZ2h0O1xuICAgIH1cbiAgICBtb3ZlKGRpcmVjdGlvbikge1xuICAgICAgICBpZihkaXJlY3Rpb24gPT09ICdkb3duJykge1xuICAgICAgICAgICAgdGhpcy55ID0gTWF0aC5yb3VuZChNYXRoLm1pbih0aGlzLmdhbWVIZWlnaHQgLSB0aGlzLmhlaWdodCAtIDIsIHRoaXMueSArIHRoaXMuc3BlZWQpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKGRpcmVjdGlvbiA9PT0gJ3VwJykge1xuICAgICAgICAgICAgdGhpcy55ID0gTWF0aC5yb3VuZChNYXRoLm1heCgyLCB0aGlzLnkgLSB0aGlzLnNwZWVkKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnI2ZmODBmZic7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCAvIDYpO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSArIHRoaXMuaGVpZ2h0IC0gdGhpcy5oZWlnaHQgLyA2LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCAvIDYpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmFuZFJhbmdlKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbjtcbn1cblxuXG5jbGFzcyBQb25nVmlld01vZGVsIHtcbiAgICBjb25zdHJ1Y3Rvcihyb3V0ZSkge1xuICAgICAgICB2YXIgJGdhbWVBcmVhID0gJCgnI3BvbmctcGFnZSBjYW52YXMnKTtcbiAgICAgICAgJGdhbWVBcmVhWzBdLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICRnYW1lQXJlYVswXS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9ICRnYW1lQXJlYS53aWR0aCgpO1xuICAgICAgICB0aGlzLmhlaWdodCA9ICRnYW1lQXJlYS5oZWlnaHQoKTtcbiAgICAgICAgdGhpcy5rZXlzID0gbmV3IEtleUxpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMud2FpdGluZ0Zvck5ld0dhbWUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5ib3VuY2VzID0ga28ub2JzZXJ2YWJsZSgwKTtcblxuICAgICAgICB0aGlzLmN0eCA9ICRnYW1lQXJlYVswXS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuXG4gICAgICAgIHZhciBpbml0aWFsUGFkZGxlSGVpZ2h0RGl2aXNvciA9IDg7XG4gICAgICAgIHRoaXMuaW5pdGlhbFBhZGRsZVNwZWVkRGl2aXNvciA9IDc1O1xuICAgICAgICB0aGlzLmluaXRhbEJhbGxTcGVlZE11bHRpcGxpY2F0b3IgPSAxLjI1O1xuICAgICAgICB0aGlzLnBhZGRsZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuICAgICAgICAgICAgbmV3IFBhZGRsZSh7XG4gICAgICAgICAgICAgICAgZ2FtZUhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgICAgICAgICAgc3BlZWQ6IHRoaXMuaGVpZ2h0IC8gdGhpcy5pbml0aWFsUGFkZGxlU3BlZWREaXZpc29yLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdsZWZ0JyxcbiAgICAgICAgICAgICAgICB4OiA2NCxcbiAgICAgICAgICAgICAgICB5OiAzMDAsXG4gICAgICAgICAgICAgICAgcGFkZGxlV2lkdGg6IDE1LFxuICAgICAgICAgICAgICAgIHBhZGRsZUhlaWdodDogdGhpcy5oZWlnaHQgLyBpbml0aWFsUGFkZGxlSGVpZ2h0RGl2aXNvcixcbiAgICAgICAgICAgICAgICBjdHg6IHRoaXMuY3R4XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBQYWRkbGUoe1xuICAgICAgICAgICAgICAgIGdhbWVIZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgIHNwZWVkOiB0aGlzLmhlaWdodCAvIHRoaXMuaW5pdGlhbFBhZGRsZVNwZWVkRGl2aXNvcixcbiAgICAgICAgICAgICAgICBuYW1lOiAncmlnaHQnLFxuICAgICAgICAgICAgICAgIHg6IHRoaXMud2lkdGggLSA2OCxcbiAgICAgICAgICAgICAgICB5OiAzMDAsXG4gICAgICAgICAgICAgICAgcGFkZGxlV2lkdGg6IDE1LFxuICAgICAgICAgICAgICAgIHBhZGRsZUhlaWdodDogdGhpcy5oZWlnaHQgLyBpbml0aWFsUGFkZGxlSGVpZ2h0RGl2aXNvcixcbiAgICAgICAgICAgICAgICBjdHg6IHRoaXMuY3R4XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgdGhpcy53aW5uZXIgPSBrby5vYnNlcnZhYmxlKCk7XG4gICAgICAgIHRoaXMud2lubmVyTmFtZSA9IGtvLm9ic2VydmFibGUoKTtcbiAgICAgICAgdGhpcy5iYWxsU2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiA0ICogdGhpcy5oZWlnaHQgLyA4MCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eDogdGhpcy5jdHgsXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVlZDogdGhpcy5pbml0YWxCYWxsU3BlZWRNdWx0aXBsaWNhdG9yICogdGhpcy5oZWlnaHQgLyB0aGlzLmluaXRpYWxQYWRkbGVTcGVlZERpdmlzb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsWTogTWF0aC5yYW5kb20oKSAqICgodGhpcy5oZWlnaHQvMiArIHRoaXMuaGVpZ2h0LzEwKSAtICh0aGlzLmhlaWdodC8yIC0gdGhpcy5oZWlnaHQvMTApKSArICh0aGlzLmhlaWdodC8yIC0gdGhpcy5oZWlnaHQvMTApLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm5ld1JvdW5kKCk7XG4gICAgICAgIHRoaXMucnVuKCk7XG4gICAgICAgIFxuICAgIH1cbiAgICBib3VuY2UoKSB7XG4gICAgICAgIHRoaXMuYmFsbC5pbnZlcnRIb3Jpem9udGFsQmVhcmluZygpO1xuICAgICAgICB0aGlzLmJvdW5jZXModGhpcy5ib3VuY2VzKCkgKyAxKTtcbiAgICAgICAgLy9pZih0aGlzLmJvdW5jZXMoKSAlIDMgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuYmFsbC5zcGVlZENoYW5nZSgyKTtcbiAgICAgICAgLy99XG4gICAgfVxuICAgIHBhdXNlUG9uZygpIHtcbiAgICAgICAgdGhpcy5wYXVzZSA9ICF0aGlzLnBhdXNlO1xuICAgIH1cblxuICAgIG5ld1JvdW5kKCkge1xuICAgICAgICB2YXIgaW5pdGlhbEJhbGxYID0gcmFuZFJhbmdlKHRoaXMud2lkdGgvMiAtIHRoaXMud2lkdGgvMTAsIHRoaXMud2lkdGgvMiArIHRoaXMud2lkdGgvMTApO1xuICAgICAgICB0aGlzLmJhbGxTZXR0aW5ncy5pbml0aWFsQmVhcmluZyA9IChpbml0aWFsQmFsbFggPiB0aGlzLndpZHRoLzIgPyByYW5kUmFuZ2UoMjQwLCAzMDApIDogcmFuZFJhbmdlKDYwLCAxMjApKTtcbiAgICAgICAgdGhpcy5iYWxsU2V0dGluZ3MuaW5pdGlhbFggPSBpbml0aWFsQmFsbFg7XG4gICAgICAgIHRoaXMuYmFsbCA9IG5ldyBCYWxsKHRoaXMuYmFsbFNldHRpbmdzKTtcbiAgICAgICAgdGhpcy5ib3VuY2VzKDApO1xuICAgIH1cblxuXG4gICAgY2hlY2tCYWxsVmVydGljYWxseU9uUGFkZGxlKHBhZGRsZSkge1xuICAgICAgICB2YXIgYWxsb3dlZEJhbGxUb3BZID0gdGhpcy5iYWxsLnkgLSB0aGlzLmJhbGwuc2l6ZSAqIDAuODtcbiAgICAgICAgdmFyIGFsbG93ZWRCYWxsQm90dG9tWSA9IHRoaXMuYmFsbC55ICsgdGhpcy5iYWxsLnNpemUgKyB0aGlzLmJhbGwuc2l6ZSAqIDAuODtcbiAgICAgICAgcmV0dXJuIGFsbG93ZWRCYWxsVG9wWSA+PSBwYWRkbGUueSAmJiBhbGxvd2VkQmFsbEJvdHRvbVkgPD0gcGFkZGxlLmJvdHRvbUVkZ2UoKSA/IHRydWUgOiBmYWxzZTtcbiAgICB9XG5cbiAgICBnYW1lT3ZlcigpIHtcbiAgICAgICAgdGhpcy53YWl0aW5nRm9yTmV3R2FtZSh0cnVlKTtcbiAgICAgICAgdGhpcy53aW5uZXIoKS53b24oKTtcbiAgICAgICAgdGhpcy53aW5uZXJOYW1lKHRoaXMud2lubmVyKCkubmFtZSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICBpZih0aGlzLnBhdXNlZCB8fCB0aGlzLndhaXRpbmdGb3JOZXdHYW1lKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbGVmdFBhZGRsZSA9ICh0aGlzLnBhZGRsZXMoKSlbMF07XG4gICAgICAgIHZhciByaWdodFBhZGRsZSA9ICh0aGlzLnBhZGRsZXMoKSlbMV07XG5cbiAgICAgICAgLy90aGlzLmJhbGwubW92ZSgpO1xuICAgICAgICB2YXIgbmV4dEJhbGxNb3ZlID0gdGhpcy5iYWxsLm5leHRNb3ZlKCk7XG5cbiAgICAgICAgLy8gTGVmdCBwYWRkbGU/XG4gICAgICAgIGlmKHRoaXMuYmFsbC54ID49IGxlZnRQYWRkbGUucmlnaHRFZGdlKCkgXG4gICAgICAgICAgICAgICAgJiYgbmV4dEJhbGxNb3ZlLnggPD0gbGVmdFBhZGRsZS5yaWdodEVkZ2UoKVxuICAgICAgICAgICAgICAgICYmIHRoaXMuYmFsbC55ICsgdGhpcy5iYWxsLnNpemUgPj0gbGVmdFBhZGRsZS55XG4gICAgICAgICAgICAgICAgJiYgdGhpcy5iYWxsLnkgPD0gbGVmdFBhZGRsZS5ib3R0b21FZGdlKCkpIHtcblxuICAgICAgICAgICAgbmV4dEJhbGxNb3ZlID0gdGhpcy5iYWxsLm5leHRNb3ZlKHsgbWF4WCA6IHRoaXMuYmFsbC54IC0gbGVmdFBhZGRsZS5yaWdodEVkZ2UoKSB9KTtcbiAgICAgICAgICAgIHRoaXMuYm91bmNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmlnaHQgcGFkZGxlP1xuICAgICAgICBlbHNlIGlmKHRoaXMuYmFsbC54ICsgdGhpcy5iYWxsLnNpemUgPD0gcmlnaHRQYWRkbGUueFxuICAgICAgICAgICAgICAgICYmIG5leHRCYWxsTW92ZS54ICsgdGhpcy5iYWxsLnNpemUgPiByaWdodFBhZGRsZS54XG4gICAgICAgICAgICAgICAgJiYgdGhpcy5iYWxsLnkgKyB0aGlzLmJhbGwuc2l6ZSA+PSByaWdodFBhZGRsZS55XG4gICAgICAgICAgICAgICAgJiYgdGhpcy5iYWxsLnkgPD0gcmlnaHRQYWRkbGUuYm90dG9tRWRnZSgpKSB7XG4gICAgICAgICAgICBuZXh0QmFsbE1vdmUgPSB0aGlzLmJhbGwubmV4dE1vdmUoeyBtYXhYIDogcmlnaHRQYWRkbGUueCAtIHRoaXMuYmFsbC54IH0pO1xuICAgICAgICAgICAgdGhpcy5ib3VuY2UoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIaXRzIHdhbGwgb3IgZmxvb3JcbiAgICAgICAgZWxzZSBpZih0aGlzLmJhbGwueSArIHRoaXMuYmFsbC5zaXplID4gdGhpcy5oZWlnaHQgfHwgdGhpcy5iYWxsLnkgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLmJhbGwuaW52ZXJ0VmVydGljYWxCZWFyaW5nKCk7XG4gICAgICAgICAgICBuZXh0QmFsbE1vdmUgPSB0aGlzLmJhbGwubmV4dE1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBIaXQgbGVmdCBlZGdlXG4gICAgICAgIGVsc2UgaWYodGhpcy5iYWxsLnggKyB0aGlzLmJhbGwuc2l6ZSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMud2lubmVyKHJpZ2h0UGFkZGxlKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBIaXQgcmlnaHQgZWRnZVxuICAgICAgICBlbHNlIGlmKHRoaXMuYmFsbC54ID4gdGhpcy53aWR0aCkge1xuICAgICAgICAgICAgdGhpcy53aW5uZXIobGVmdFBhZGRsZSk7XG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJhbGwubWFrZU1vdmUobmV4dEJhbGxNb3ZlKTtcbiAgICAgICAgdGhpcy5kcmF3KCk7XG5cbiAgICAgICAgaWYodGhpcy5rZXlzLmlzUHJlc3NlZCg4MykpIHtcbiAgICAgICAgICAgIGxlZnRQYWRkbGUubW92ZSgnZG93bicpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodGhpcy5rZXlzLmlzUHJlc3NlZCg4NykpIHtcbiAgICAgICAgICAgIGxlZnRQYWRkbGUubW92ZSgndXAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHRoaXMua2V5cy5pc1ByZXNzZWQoNDApKSB7XG4gICAgICAgICAgICByaWdodFBhZGRsZS5tb3ZlKCdkb3duJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLmtleXMuaXNQcmVzc2VkKDM4KSkge1xuICAgICAgICAgICAgcmlnaHRQYWRkbGUubW92ZSgndXAnKTtcbiAgICAgICAgfVxuICAgICAgICAkKGRvY3VtZW50KS5rZXlkb3duKChlKSA9PiB7XG4gICAgICAgICAgICBpZih0aGlzLndhaXRpbmdGb3JOZXdHYW1lKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLndhaXRpbmdGb3JOZXdHYW1lKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1JvdW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGUud2hpY2ggPT09IDgwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXVzZWQgPSAhdGhpcy5wYXVzZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICcjZmZmJztcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QoLTEgKyB0aGlzLndpZHRoIC8gMiwgMCwgMiwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgIHRoaXMuYmFsbC5kcmF3KCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wYWRkbGVzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwYWRkbGUgPSAodGhpcy5wYWRkbGVzKCkpW2ldO1xuICAgICAgICAgICAgcGFkZGxlLmRyYXcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnVwZGF0ZSgpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzZWxmLnJ1bigpIH0sIDI1KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgdmlld01vZGVsOiBQb25nVmlld01vZGVsLCB0ZW1wbGF0ZTogcG9uZ1RlbXBsYXRlIH07XG4iXX0=;