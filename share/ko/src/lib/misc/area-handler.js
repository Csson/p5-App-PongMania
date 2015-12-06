export class AreaHandler {
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

/*
        var topDelta = (topRight.y - topLeft.y) / (topRight.x - topLeft.x);

        topM = topLeft.y - topDelta * topLeft.x;
        console.log(position.x, Math.round(position.x * topDelta), Math.round(topM), this.corners);*/
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
