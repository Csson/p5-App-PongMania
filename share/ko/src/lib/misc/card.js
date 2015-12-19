export class Card {

    constructor(params = { }) {
        if(!params.drawParams) {
            params.drawParams = { baseRotation: 0, rotationFuzzyness: 0, centerFuzzyness: 0 };
        }
        this.image = params.image;
        this.suit = params.suit;
        this.value = params.value;
        this.scene = params.scene;

        var suitSortable = { clubs: 1, diamonds: 2, spades: 3, hearts: 4, back: 5, joker: 6 };
        var valueSortable = { '2': 15, '10': 16, jack: 11, queen: 12, king: 13, ace: 14, blue: 1, red: 1 };
        this.suitSortable = suitSortable[this.suit] + '_' + (valueSortable[this.value] || '0' + this.value);
        this.valueSortable = (valueSortable[this.value] || '0' + this.value) + '_' + this.suit;

        this.originalDrawParams = {
            baseRotation: params.drawParams.baseRotation,
            rotationFuzzyness: params.drawParams.rotationFuzzyness,
            centerFuzzyness: params.drawParams.centerFuzzyness,
        }
        this.originalDrawParams.rotation = this.randomizeRotation(this.originalDrawParams.baseRotation, this.originalDrawParams.rotationFuzzyness);
        this.originalDrawParams.centerFuzzynessSetting = this.randomizeCenter(this.originalDrawParams.centerFuzzyness);

        this.location = null;
        this.move = undefined;
        this.drawnCorners = [];
        this.wasHovering = false;
    }
    // location: { x: .., y: .. }
    setLocation(location) {
        this.location = location;
    }
    setMove(params) {
        console.log('move params', params);
        this.move = {
            steps: params.steps,
            stepsRemaining: params.steps,
            rotations: params.rotations,
            toPosition: params.toPosition,
            fromPosition: this.location !== null ? this.location : { x: - 500, y: -500 },
        };
        let xDistance = this.move.toPosition.x - this.move.fromPosition.x;
        let xDistancePerStep = xDistance / this.move.steps;
        let yDistance = this.move.toPosition.y - this.move.fromPosition.y;
        let yDistancePerStep = yDistance / this.move.steps;

        this.move.xDistancePerStep = xDistancePerStep;
        this.move.yDistancePerStep = yDistancePerStep;
        console.log('move steps', params.steps, '>', this.move.steps);
        console.log('set move', this.move, '|', this.move.steps, this);
    }
    hasMove() {
        if(this.move === undefined) {
            return false;
        }
        if(!this.move.stepsRemaining) {
            this.move = undefined;
            return false;
        }
        return true;
    }
    rerandomize() {
        this.rerandomizeRotation();
        this.rerandomizeCenter();
    }
    rerandomizeRotation() {
        this.originalDrawParams.rotation = this.randomizeRotation(this.originalDrawParams.baseRotation, this.originalDrawParams.rotationFuzzyness);
    }
    rerandomizeCenter() {
        this.originalDrawParams.centerFuzzynessSetting = this.randomizeCenter(this.originalDrawParams.centerFuzzyness);
    }
    randomizeRotation(baseRotation = 0, rotationFuzzyness = 0) {
        var minRotation = baseRotation - rotationFuzzyness;
        var maxRotation = baseRotation + rotationFuzzyness;
        return Math.random() * (1 + maxRotation - minRotation) + minRotation;
    }
    randomizeCenter(centerFuzzyness = 0) {
        return {
            radiusAmount: centerFuzzyness * Math.sqrt(Math.random(1)) / 2,
            angle: Math.random() * Math.sqrt(2 * Math.PI),
        };
    }
    shortestDimension() {
        return this.image.normal.width < this.image.normal.height ? this.image.normal.width : this.image.normal.height;
    }
    draw(params = {}) {
        var x;
        var y;
        var resizer = params.resizer;

        if(this.hasMove()) {
            x = Math.round(this.move.toPosition.x - this.move.xDistancePerStep * this.move.stepsRemaining);
            y = Math.round(this.move.toPosition.y - this.move.yDistancePerStep * this.move.stepsRemaining);
            console.log('move to', x, y);
            this.move.stepsRemaining--;
        }
        else if(this.location != null) {
            x = this.location.x;
            y = this.location.y;
        }
        else {
            x = params.x;
            y = params.y;
        }

        if(params.centerFuzzyness) {
            centerFuzzyness = this.randomizeCenter(params.centerFuzzyness) * this.shortestDimension();
            var fuzzyRadius = this.shortestDimension() * centerFuzzyness / 2;
            var radius = fuzzyRadius * Math.sqrt(Math.random(1));
            var angle = Math.random() * Math.sqrt(2 * Math.PI);

            x = x + radius * Math.cos(angle);
            y = y + radius * Math.sin(angle);
        }
        else {
            var radius = this.originalDrawParams.centerFuzzynessSetting.radiusAmount * this.shortestDimension();
            var angle = this.originalDrawParams.centerFuzzynessSetting.angle;

            x = x + radius * Math.cos(angle);
            y = y + radius * Math.sin(angle);
        }

        var rotation;
        if(params.baseRotation || params.rotationFuzzyness) {
            rotation = this.randomizeRotation(params.baseRotation, params.rotationFuzzyness);
        }
        else {
            rotation = this.originalDrawParams.rotation;
        }

        var actualWidth = this.image.normal.width * resizer;
        var actualHeight = this.image.normal.height * resizer;
        var transformer = this.scene.withImage(resizer < 0.7 && this.image.small ? this.image.small : this.image.normal)
                                    .translateToCenter(x, y)
                                    .rotateDegrees(rotation)
                                    .drawImageCentered(actualWidth, actualHeight)
                                    .getTransformer();

        var corners = [ { x: -actualWidth / 2, y: -actualHeight / 2 },
                        { x: -actualWidth / 2, y:  actualHeight / 2 },
                        { x:  actualWidth / 2, y:  actualHeight / 2 },
                        { x:  actualWidth / 2, y: -actualHeight / 2 } ];

        if(this.wasHovering) {
            var radius = actualWidth * resizer * 0.55;
            this.scene.roundRectCorners(corners, radius, { lineWidth: actualWidth / 70, color: '#f08', shadow: { blur: 10, color: '#f08' }});
        }
        this.scene.done();

        // the order is important, and we pull the hovering in a bit
        //var paddedWidth = actualWidth * 1;
        //var paddedHeight = actualHeight * 1;
        //transformations = [ [-paddedWidth / 2, -paddedHeight / 2],
        //                    [-paddedWidth / 2,  paddedHeight / 2],
        //                    [ paddedWidth / 2,  paddedHeight / 2],
        //                    [ paddedWidth / 2, -paddedHeight / 2] ];


        for (var i = 0; i < corners.length; i++) {
            var point = transformer.transformPoint(corners[i].x, corners[i].y);
            this.drawnCorners[i] = { x: Math.round(point.x), y: Math.round(point.y) };
        }
    }
    isHover(position) {
        if(this.drawnCorners.length != 4) {
            return false;
        }
        var topLeft = this.drawnCorners[0];
        var bottomLeft = this.drawnCorners[1];
        var bottomRight = this.drawnCorners[2];
        var topRight = this.drawnCorners[3];

        var leftDeltaX = bottomLeft.x - topLeft.x;
        var leftDeltaY = bottomLeft.y - topLeft.y;
        var topDeltaX = topRight.x - topLeft.x;
        var topDeltaY = topRight.y - topLeft.y;

        if((position.x - topLeft.x)    * leftDeltaX + (position.y - topLeft.y)    * leftDeltaY < 0.0) { return false }
        if((position.x - bottomLeft.x) * leftDeltaX + (position.y - bottomLeft.y) * leftDeltaY > 0.0) { return false }
        if((position.x - topLeft.x)    * topDeltaX  + (position.y - topLeft.y)    * topDeltaY  < 0.0) { return false }
        if((position.x - topRight.x)   * topDeltaX  + (position.y - topRight.y)   * topDeltaY  > 0.0) { return false }

        return true;

    }
    drawOld(params) {

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
        return new Card({ suit: this.suit, value: this.value, corners: corners, drawParams: params, card: this });

    }
}

    /*
    constructor(params) {
        this.suit = params.suit;
        this.value = params.value;
        this.corners = params.corners;
        this.card = params.card;
        this.drawParams = params.drawParams;
    }
    isHover(position) {
        var topLeft = this.corners[0];
        var bottomLeft = this.corners[1];
        var bottomRight = this.corners[2];
        var topRight = this.corners[3];

        var leftDeltaX = bottomLeft.x - topLeft.x;
        var leftDeltaY = bottomLeft.y - topLeft.y;
        var topDeltaX = topRight.x - topLeft.x;
        var topDeltaY = topRight.y - topLeft.y;

        if((position.x - topLeft.x)    * leftDeltaX + (position.y - topLeft.y)    * leftDeltaY < 0.0) { return false }
        if((position.x - bottomLeft.x) * leftDeltaX + (position.y - bottomLeft.y) * leftDeltaY > 0.0) { return false }
        if((position.x - topLeft.x)    * topDeltaX  + (position.y - topLeft.y)    * topDeltaY  < 0.0) { return false }
        if((position.x - topRight.x)   * topDeltaX  + (position.y - topRight.y)   * topDeltaY  > 0.0) { return false }

        return true;


//        var topDelta = (topRight.y - topLeft.y) / (topRight.x - topLeft.x);

//        topM = topLeft.y - topDelta * topLeft.x;
//        console.log(position.x, Math.round(position.x * topDelta), Math.round(topM), this.corners);
    }
    redraw(params = {}) {
        var actualParams = this.mixParams(params);
        this.corners = this.card.draw(actualParams).corners;
    }
    redrawOutline(params = {}) {
        var actualParams = this.mixParams(params);
        var radius = this.card.image.width * actualParams.size / 10;

        this.card.scene.roundRectCorners(this.corners, radius, { lineWidth: 10, strike: false, shadow: { blur: 10, color: '#f0f' }});
    }
    mixParams(params) {
        var useActual = params.useActual ? params.useActual : false;
        var actualParams = {
            x: (typeof params.x === 'undefined' ? useActual ? this.drawParams.actual.x : this.drawParams.x : params.x),
            y: (typeof params.y === 'undefined' ? useActual ? this.drawParams.actual.y :  this.drawParams.y : params.y),
            size: (typeof params.size === 'undefined' ? this.drawParams.size : params.size),  // is always actual
            centerFuzzyness: (typeof params.centerFuzzyness === 'undefined' ? useActual ? 0 : this.drawParams.centerFuzzyness : params.centerFuzzyness),
            rotation: (typeof params.rotation === 'undefined' ? useActual ? this.drawParams.actual.rotation : this.drawParams.rotation : params.rotation),
            rotationFuzzyness: (typeof params.rotationFuzzyness === 'undefined' ? useActual ? 0 : this.drawParams.rotationFuzzyness : params.rotationFuzzyness),
        };
        return actualParams;
    }




}
*/
