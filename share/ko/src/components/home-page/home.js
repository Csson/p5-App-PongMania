import ko from 'knockout';
import homeTemplate from 'text!./home.html';


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
        this.move();
    }
    invertVerticalBearing() {

        if (this.bearing < 180) {
            this.bearing = 180 - this.bearing;
        }
        else {
            this.bearing = 270 + (270 - this.bearing);
        }
    }

    nextMove() {
        var howMuchY = Math.abs(90 - (this.bearing > 180 ? this.bearing - 180 : this.bearing)) * 90/100;
        var howMuchX = 100 - howMuchY;
        var leftOrRight = this.bearing > 180 ? 'left' : 'right';
        var upOrDown = this.bearing > 270 || this.bearing < 90 ? 'up' : 'down';

        deltaY = howMuchY / 100 * this.speed;
        deltaX = howMuchX / 100 * this.speed;

        deltaY = upOrDown === 'up' ? -deltaY : deltaY;
        deltaX = leftOrRight === 'left' ? -deltaX : deltaX;

        this.x = Math.round(this.x + deltaX);
        this.y = Math.round(this.y + deltaY);
        
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
        this.ctx = params.ctx;
       
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

class Pong {
    constructor(params) {
        var $gameArea = $('#' + params.elementId);
        $gameArea[0].width = window.innerWidth;
        $gameArea[0].height = window.innerHeight;

        this.width = $gameArea.width();
        this.height = $gameArea.height();
        this.keys = new KeyListener();
        this.paused = false;

        this.ctx = $gameArea[0].getContext('2d');
        this.ctx.fillStyle = 'white';

        var initialPaddleHeightDivisor = 8;
        var initialPaddleSpeedDivisor = 100;
        this.paddles = [
            new Paddle({ gameHeight: this.height, speed: this.height / initialPaddleSpeedDivisor, x: 64, y: 300, paddleWidth: 15, paddleHeight: this.height / initialPaddleHeightDivisor, ctx: this.ctx }),
            new Paddle({ gameHeight: this.height, speed: this.height / initialPaddleSpeedDivisor, x: this.width - 68, y: 300, paddleWidth: 15, paddleHeight: this.height / initialPaddleHeightDivisor, ctx: this.ctx }),
        ];
        //var initialBallX = Math.random() * ((this.width/2 + this.width/10) - (this.width/2 - this.width/10)) + (this.width/2 - this.width/10);
        var initialBallX = randRange(this.width/2 - this.width/10, this.width/2 + this.width/10);
        this.ball = new Ball({
                        size: 4 * this.height / 80,
                        ctx: this.ctx,
                        speed: 2 * this.height / initialPaddleSpeedDivisor,
                        initialX: initialBallX,
                        initialY: Math.random() * ((this.height/2 + this.height/10) - (this.height/2 - this.height/10)) + (this.height/2 - this.height/10),
                        initialBearing: (initialBallX > this.width/2 ? randRange(240, 300) : randRange(60, 120)),
                        //initialBearing: 160,
        });
        console.log(initialBallX);
        console.log(this.ball);
        this.run();
        
    }

    checkBallVerticallyOnPaddle(paddle) {
        var allowedBallTopY = this.ball.y - this.ball.size * 0.8;
        var allowedBallBottomY = this.ball.y + this.ball.size + this.ball.size * 0.8;
        return allowedBallTopY >= paddle.y && allowedBallBottomY <= paddle.bottomEdge() ? true : false;
    }

    update() {
        if(this.paused) {
            return;
        }
        var leftPaddle = this.paddles[0];
        var rightPaddle = this.paddles[1];

        //this.ball.move();
        var nextBallMove = this.ball.nextMove();

        // Hits edges? (deal with game over later)
        if(this.ball.x + this.ball.size > this.width || this.ball.x < 0) {
            this.ball.invertHorizontalBearing();
            console.log('          Hit side wall');
        }
        if(this.ball.y + this.ball.size > this.height || this.ball.y < 0) {
            this.ball.invertVerticalBearing();
            console.log('          Hit roof/floor');
        }
        // Hits paddle?
        if(this.ball.bearing > 180 && this.ball.x <= leftPaddle.rightEdge()
                && this.ball.y - this.ball.size  >= leftPaddle.y
                && this.ball.y + this.ball.size <= leftPaddle.bottomEdge()) {
            this.ball.invertHorizontalBearing();
            console.log('Hit left paddle');
        }
        else if(this.ball.bearing < 180 && this.ball.x + this.ball.size >= rightPaddle.x
                && this.ball.y -this.ball.size >= rightPaddle.y
                && this.ball.y + this.ball.size <= rightPaddle.bottomEdge()) {
            this.ball.invertHorizontalBearing();

            console.log('Hit right paddle');
        }




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
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillRect(-1 + this.width / 2, 0, 2, this.height);

        this.ball.draw();
        for (var i = 0; i < this.paddles.length; i++) {
            var paddle = this.paddles[i];
            paddle.draw();
        }
        $('#speed').text(this.ball.speed);
        $('#bearing').text(this.ball.bearing);
        $('#left-paddle').text(this.paddles[0].y + ' / ' + this.paddles[0].bottomEdge() + ' / ' + this.paddles[0].rightEdge());
        $('#ball-x').text(this.ball.x);
        $('#ball-y').text(this.ball.y);
    }

    run() {
        var self = this;
        self.update();
        self.draw();
        setTimeout(function() { self.run() }, 25);
    }
}


class HomeViewModel {
    constructor(route) {
        this.pong = new Pong({ elementId : 'game-area' });
    }
    
    pausePong() {
        this.pong.paused = !this.pong.paused;
    }
}

export default { viewModel: HomeViewModel, template: homeTemplate };