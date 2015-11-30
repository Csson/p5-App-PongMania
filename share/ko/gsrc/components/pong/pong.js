
import ko from 'knockout';
import pongTemplate from 'text!./pong.html';


ko.bindingHandlers.clickToggler = {
    init: function (el, valueAcc) {
        var value = valueAcc();

        ko.utils.registerEventHandler(el, 'click', function() {
            value(!value());
            $(el).blur();
        });
    }
};

class KeyListener {
    constructor(params) {
        this.pressedKeys = [];
        document.addEventListener('keydown', this.keyDown.bind(this));
        document.addEventListener('keyup', this.keyUp.bind(this));
    }

    keyDown(e) {
        this.pressedKeys[e.keyCode] = true;
    }
    keyUp(e) {
        this.pressedKeys[e.keyCode] = false;
    }

    isPressed(key) {
        return this.pressedKeys[key] ? true : false;
    }
    addKeyPressListener(keyCode, callback) {
        document.addEventListener('keypress', (e) => {
            if(e.keyCode === keyCode) {
                callback(e);
            }
        });
    }
}

class Ball {
    constructor(params) {
        this.size = Math.round(params.size);
        this.ctx = params.ctx;
        this.speed = Math.round(params.speed);
        this.bearing = Math.round(params.initialBearing),
        this.x = Math.round(params.initialX),
        this.y = Math.round(params.initialY);
    }

    invertHorizontalBearing() {
        if(this.bearing > 180) {
            this.bearing = 90 + (270 - this.bearing);
        }
        else {
            this.bearing = 270 + (90 - this.bearing);
        }
    }
    invertVerticalBearing() {

        if (this.bearing < 180) {
            this.bearing = 180 - this.bearing;
        }
        else {
            this.bearing = 270 + (270 - this.bearing);
        }
    }
    speedChange(percent) {
        this.speed = this.speed * (1 + percent / 100);
    }
    makeMove(params) {
        this.x = params.x;
        this.y = params.y;
    }
    nextMove(params) {
        var howMuchY = Math.abs(90 - (this.bearing > 180 ? this.bearing - 180 : this.bearing)) * 90/100;
        var howMuchX = 100 - howMuchY;
        var leftOrRight = this.bearing > 180 ? 'left' : 'right';
        var upOrDown = this.bearing > 270 || this.bearing < 90 ? 'up' : 'down';

        deltaY = howMuchY / 100 * this.speed;
        deltaX = howMuchX / 100 * this.speed;
        if(params) {
            console.log(params);
        }
        if(params && params.maxX && deltaX > params.maxX) {
            var slowDown = params.maxX / deltaX;
            deltaX = Math.floor(deltaX * slowDown);
            deltaY = Math.floor(deltaY * slowDown);
        }

        deltaY = upOrDown === 'up' ? -deltaY : deltaY;
        deltaX = leftOrRight === 'left' ? -deltaX : deltaX;

        return { x: Math.round(this.x + deltaX), y: Math.round(this.y + deltaY) };
        
    }

    draw() {
        this.ctx.fillStyle = '#ffcccc';
        this.ctx.fillRect(this.x, this.y, this.size, this.size);
        this.ctx.fillStyle = '#fff';
    }
}

class Paddle {
    constructor(params) {
        this.x = Math.round(params.x);
        this.y = Math.round(params.y);
        this.width = params.paddleWidth;
        this.height = Math.round(params.paddleHeight);
        this.gameHeight = params.gameHeight;
        this.speed = params.speed;
        this.score = ko.observable(0);
        this.ctx = params.ctx;
        this.name = ko.observable(params.name);
       
    }
    won() {
        this.score(this.score() + 1);
    }
    rightEdge() {
        return this.x + this.width;
    }
    bottomEdge() {
        return this.y + this.height;
    }
    move(direction) {
        if(direction === 'down') {
            this.y = Math.round(Math.min(this.gameHeight - this.height - 2, this.y + this.speed));
        }
        else if(direction === 'up') {
            this.y = Math.round(Math.max(2, this.y - this.speed));
        }
    }

    draw() {
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.fillStyle = '#ff80ff';
        this.ctx.fillRect(this.x, this.y, this.width, this.height / 6);
        this.ctx.fillRect(this.x, this.y + this.height - this.height / 6, this.width, this.height / 6);
        this.ctx.fillStyle = 'white';
    }
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}


class PongViewModel {
    constructor(route) {
        var $gameArea = $('#pong-page canvas');
        $gameArea[0].width = window.innerWidth;
        $gameArea[0].height = window.innerHeight;

        this.width = $gameArea.width();
        this.height = $gameArea.height();
        this.keys = new KeyListener();
        this.paused = false;
        this.waitingForNewGame = ko.observable(false);
        this.bounces = ko.observable(0);

        this.ctx = $gameArea[0].getContext('2d');
        this.ctx.fillStyle = 'white';

        var initialPaddleHeightDivisor = 8;
        this.initialPaddleSpeedDivisor = 75;
        this.initalBallSpeedMultiplicator = 1.25;
        this.paddles = ko.observableArray([
            new Paddle({
                gameHeight: this.height,
                speed: this.height / this.initialPaddleSpeedDivisor,
                name: 'left',
                x: 64,
                y: 300,
                paddleWidth: 15,
                paddleHeight: this.height / initialPaddleHeightDivisor,
                ctx: this.ctx
            }),
            new Paddle({
                gameHeight: this.height,
                speed: this.height / this.initialPaddleSpeedDivisor,
                name: 'right',
                x: this.width - 68,
                y: 300,
                paddleWidth: 15,
                paddleHeight: this.height / initialPaddleHeightDivisor,
                ctx: this.ctx
            }),
        ]);

        this.winner = ko.observable();
        this.winnerName = ko.observable();
        this.ballSettings = {
                        size: 4 * this.height / 80,
                        ctx: this.ctx,
                        speed: this.initalBallSpeedMultiplicator * this.height / this.initialPaddleSpeedDivisor,
                        initialY: Math.random() * ((this.height/2 + this.height/10) - (this.height/2 - this.height/10)) + (this.height/2 - this.height/10),
        };
        this.newRound();
        this.run();
        
    }
    bounce() {
        this.ball.invertHorizontalBearing();
        this.bounces(this.bounces() + 1);
        //if(this.bounces() % 3 === 0) {
            this.ball.speedChange(2);
        //}
    }
    pausePong() {
        this.pause = !this.pause;
    }

    newRound() {
        var initialBallX = randRange(this.width/2 - this.width/10, this.width/2 + this.width/10);
        this.ballSettings.initialBearing = (initialBallX > this.width/2 ? randRange(240, 300) : randRange(60, 120));
        this.ballSettings.initialX = initialBallX;
        this.ball = new Ball(this.ballSettings);
        this.bounces(0);
    }


    checkBallVerticallyOnPaddle(paddle) {
        var allowedBallTopY = this.ball.y - this.ball.size * 0.8;
        var allowedBallBottomY = this.ball.y + this.ball.size + this.ball.size * 0.8;
        return allowedBallTopY >= paddle.y && allowedBallBottomY <= paddle.bottomEdge() ? true : false;
    }

    gameOver() {
        this.waitingForNewGame(true);
        this.winner().won();
        this.winnerName(this.winner().name);
    }

    update() {
        if(this.paused || this.waitingForNewGame()) {
            return;
        }
        var leftPaddle = (this.paddles())[0];
        var rightPaddle = (this.paddles())[1];

        //this.ball.move();
        var nextBallMove = this.ball.nextMove();

        // Left paddle?
        if(this.ball.x >= leftPaddle.rightEdge() 
                && nextBallMove.x <= leftPaddle.rightEdge()
                && this.ball.y + this.ball.size >= leftPaddle.y
                && this.ball.y <= leftPaddle.bottomEdge()) {

            nextBallMove = this.ball.nextMove({ maxX : this.ball.x - leftPaddle.rightEdge() });
            this.bounce();
        }
        // Right paddle?
        else if(this.ball.x + this.ball.size <= rightPaddle.x
                && nextBallMove.x + this.ball.size > rightPaddle.x
                && this.ball.y + this.ball.size >= rightPaddle.y
                && this.ball.y <= rightPaddle.bottomEdge()) {
            nextBallMove = this.ball.nextMove({ maxX : rightPaddle.x - this.ball.x });
            this.bounce();
        }
        // Hits wall or floor
        else if(this.ball.y + this.ball.size > this.height || this.ball.y < 0) {
            this.ball.invertVerticalBearing();
            nextBallMove = this.ball.nextMove();
        }
        // Hit left edge
        else if(this.ball.x + this.ball.size < 0) {
            this.winner(rightPaddle);
            this.gameOver();
            return;
        }
        // Hit right edge
        else if(this.ball.x > this.width) {
            this.winner(leftPaddle);
            this.gameOver();
            return;
        }

        this.ball.makeMove(nextBallMove);
        this.draw();

        if(this.keys.isPressed(83)) {
            leftPaddle.move('down');
        }
        else if(this.keys.isPressed(87)) {
            leftPaddle.move('up');
        }

        if(this.keys.isPressed(40)) {
            rightPaddle.move('down');
        }
        else if(this.keys.isPressed(38)) {
            rightPaddle.move('up');
        }
        $(document).keydown((e) => {
            if(this.waitingForNewGame()) {
                this.waitingForNewGame(false);
                this.newRound();
            }
            else if(e.which === 80) {
                this.paused = !this.paused;
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(-1 + this.width / 2, 0, 2, this.height);

        this.ball.draw();
        for (var i = 0; i < this.paddles().length; i++) {
            var paddle = (this.paddles())[i];
            paddle.draw();
        }
    }

    run() {
        var self = this;
        self.update();
        setTimeout(function() { self.run() }, 25);
    }
}

export default { viewModel: PongViewModel, template: pongTemplate };
