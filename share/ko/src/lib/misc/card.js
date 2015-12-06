import { Transform } from './transform';
import { AreaHandler } from './area-handler';

export class Card {
    constructor(params) {
        this.scene = params.scene;
        this.suit = params.suit;
        this.value = params.value;
        this.baseUrl = params.baseUrl || '/cards/';
        this.fileName = params.fileName || params.suit + '_' + params.value + '.png';
        this.loadImage(params.onLoad);
    }

    loadImage(onLoad) {
        var image = new Image();
        image.src = this.baseUrl + this.fileName;
        image.onload = () => {
            this.image = image;
            this.isLoaded = true;
            onLoad();
        };
//
//        image.onload = () => {
//            this.isLoaded = true;
//            this.image = image;
//            var self = this;
//            for (var i = 0; i < this.drawParamsOnLoad.length; i++) {
//                var delayDrawing = self.drawParamsOnLoad[i].delayDrawing;
//                setTimeout(() => { console.log('onloadimage', self, self.drawParamsOnLoad[i]); self.draw(self.drawParamsOnLoad[i]) }, delayDrawing);
//            }
//        };
    }

    draw(params) {

        var x = params.x; // x, y is the center
        var y = params.y;
        var size = params.size || 1; // ratio to resize to
        var centerFuzzyness = params.centerFuzzyness || 0; // ratio of width/height that the card can be placed within
        var rotation = params.rotation || 0; // degrees!
        var rotationFuzzyness = params.rotationFuzzyness || 0; // degrees

        var width = this.image.width * size;
        var height = this.image.height * size;

        if(centerFuzzyness) {
            var fuzzyRadius = (width < height ? width : height) * centerFuzzyness / 2;
            var radius = fuzzyRadius * Math.sqrt(Math.random(1));
            var angle = Math.sqrt(2 * Math.PI);

            x = x + radius * Math.cos(angle);
            y = y + radius * Math.sin(angle);
        }

        if(rotationFuzzyness) {
            var minRotation = rotation - rotationFuzzyness;
            var maxRotation = rotation + rotationFuzzyness;
            rotation = Math.random() * (1 + maxRotation - minRotation) + minRotation;
        }

        var transformer = this.scene.withImage(this.image)
                                    .translateToCenter(x, y)
                                    .rotateDegrees(rotation)
                                    .drawImageCentered(width, height)
                                    .getTransformer();
        this.scene.done();

        // the order is important, and we pull the hovering in a bit
        var paddedWidth = width * .97;
        var paddedHeight = height * .97;
        transformations = [ [-paddedWidth /2, -paddedHeight / 2],
                            [-paddedWidth /2,  paddedHeight / 2],
                            [ paddedWidth /2,  paddedHeight / 2],
                            [ paddedWidth /2, -paddedHeight / 2] ];

        var corners = [];
        for (var i = 0; i < transformations.length; i++) {

            var point = transformer.transformPoint(transformations[i][0], transformations[i][1]);
            corners.push({ x: Math.round(point[0]), y: Math.round(point[1]) });
        }
        params.actual = {
            rotation: rotation,
            x: x,
            y: y,
        };
        return new AreaHandler({ suit: this.suit, value: this.value, corners: corners, drawParams: params, card: this });

    }
}

/*



        var ctx = this.scene.ctx;
        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate()
        
        var transformer = new Transformer();
        transformer.translate(x + width / 2, y + height / 2);




            this.ctx.translate(width / 2, height / 2);
            this.ctx.rotate(this.deg2rad(rotation));


            this.ctx.drawImage(img2, 0-(width / 2), 0-height / 2, width, height);
            //this.ctx.drawImage(img2, 0-(rotatedWidth / 2), 0-rotatedHeight / 2, width, height);
            this.ctx.strokeStyle = 'black';
            this.ctx.strokeRect(0-(width / 2), 0-height / 2, width, height);
            //this.ctx.strokeRect(0-(rotatedWidth / 2), 0-rotatedHeight / 2, width, height);

            this.ctx.restore();
            this.ctx.strokeStyle = 'red';
            this.ctx.strokeRect(500, 200, width, height);
            var transformator = new Transform();
            transformator.translate(500, 200);
            transformator.translate(width /2 , height / 2);
            transformator.rotate(this.deg2rad(rotation));

            transformations = [ [-width /2 , -height / 2, '#f00'],
                                    [-width /2 , height / 2, '#f0f'],
                                    [width /2 , -height / 2, '#0f0'],
                                    [width /2 , height / 2, '#00f'] ];
            for (var i = 0; i < transformations.length; i++) {
                var point = transformator.transformPoint(transformations[i][0], transformations[i][1]);
                this.ctx.fillStyle = transformations[i][2];
                this.ctx.beginPath();
                this.ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI, false);
                this.ctx.fill();
            }

    }
}
   card.draw({ x: 350, y: 400, centerFuzzyness: 0.1, maxRotation: 15, minRotation: -15 });



        img2.src = '/cards/spades_jack.png';
        console.log(img2);
        var transformations = [];
        img2.onload = () => {
            var width = Math.round(589 / 2);
            var height = Math.round(800 / 2);
            console.log('DRAWING...');
            this.ctx.save();
            this.ctx.translate(500, 200);

            var rotation = -30;
            var ratioVertical = Math.abs(rotation > 180 ? 270 - rotation : 90 - rotation) / 90; // 0: vertical, 1: horizontal
            var ratioHorizontal = 1 - ratioVertical;

            var rotatedHeight = ratioVertical * height + ratioHorizontal * width;
            var rotatedWidth = ratioVertical * height + ratioHorizontal * width;
            console.log(rotatedHeight, rotatedWidth);

            //this.ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
            this.ctx.translate(width / 2, height / 2);
            this.ctx.rotate(this.deg2rad(rotation));


            this.ctx.drawImage(img2, 0-(width / 2), 0-height / 2, width, height);
            //this.ctx.drawImage(img2, 0-(rotatedWidth / 2), 0-rotatedHeight / 2, width, height);
            this.ctx.strokeStyle = 'black';
            this.ctx.strokeRect(0-(width / 2), 0-height / 2, width, height);
            //this.ctx.strokeRect(0-(rotatedWidth / 2), 0-rotatedHeight / 2, width, height);

            this.ctx.restore();
            this.ctx.strokeStyle = 'red';
            this.ctx.strokeRect(500, 200, width, height);
            var transformator = new Transform();
            transformator.translate(500, 200);
            transformator.translate(width /2 , height / 2);
            transformator.rotate(this.deg2rad(rotation));

            transformations = [ [-width /2 , -height / 2, '#f00'],
                                    [-width /2 , height / 2, '#f0f'],
                                    [width /2 , -height / 2, '#0f0'],
                                    [width /2 , height / 2, '#00f'] ];
            for (var i = 0; i < transformations.length; i++) {
                var point = transformator.transformPoint(transformations[i][0], transformations[i][1]);
                this.ctx.fillStyle = transformations[i][2];
                this.ctx.beginPath();
                this.ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI, false);
                this.ctx.fill();
            }
        };*/