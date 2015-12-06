import { Transform } from './transform';

export class Scene {
    constructor(params) {
        this.ctx = params.ctx;
        this.image = null;
        this.transformer = null;
    }
    hasImage() {
        if(this.image == null) {
            console.log('checked scene.hasImage, but was false');
            return false;
        }
        return true;
    }
    hasTransformer() {
        if(this.transformer == null) {
            console.log('checked scene.hasTransformer, but was false');
            return false;
        }
        return true;
    }
    getTransformer() {
        return this.transformer;
    }
    withImage(image) {
        this.ctx.save();
        this.transformer = new Transform();
        this.image = image;
        return this;
    }
    done() {
        this.image = null;
        this.transformer = null;
        this.ctx.restore();
    }
    translateToCenter(x, y) {
        if(this.hasImage()) {
            this.ctx.translate(x, y);
            this.transformer.translate(x, y);
        }
        return this;
    }
    rotateDegrees(degrees) {
        var radians = this.deg2rad(degrees);

        this.ctx.rotate(radians);
        if(this.hasTransformer()) {
            this.transformer.rotate(radians);
        }
        return this;
    }
    drawImageCentered(width, height) {
        if(this.hasImage()) {
            this.ctx.drawImage(this.image, -width / 2, -height / 2, width, height);
        }
        return this;
    }
    deg2rad(deg) {
        return deg * Math.PI / 180;
    }

    
    // adapted from  http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
    // padding is used to pull in the stroke line (and offset the shadow similarly) when one wants a shadow
    // but no stroke
    roundRectCorners(corners, radius, options = { fill: false, strike: false, lineWidth: 0, shadow: {} }) {
        if (typeof radius === 'undefined') {
            radius = 0;
        }
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        }
        else {
            var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }

        this.ctx.save();

        var topLeft = corners[0];
        var bottomLeft = corners[1];
        var bottomRight = corners[2];
        var topRight = corners[3];

        if(!this.objectIsEmpty(options.shadow) && !options.strike) {
            topLeft.x -= 5000;
            bottomLeft.x -= 5000;
            bottomRight.x -= 5000;
            topRight.x -= 5000;
            this.ctx.shadowOffsetX = 5000;
            options.strike = true;
        }

        if(!this.objectIsEmpty(options.shadow)) {
            if(options.shadow.color) {
                this.ctx.shadowColor = options.shadow.color;
            }
            if(options.shadow.blur) {
                this.ctx.shadowBlur = options.shadow.blur;
            }
        }
        this.ctx.beginPath();
        this.ctx.moveTo(topLeft.x + radius.tl, topLeft.y);
        
        this.ctx.lineTo(topRight.x - radius.tr, topRight.y);
        this.ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + radius.tr);
        
        this.ctx.lineTo(bottomRight.x, bottomRight.y - radius.tr);
        this.ctx.quadraticCurveTo(bottomRight.x, bottomRight.y, bottomRight.x - radius.tr, bottomRight.y);
        
        this.ctx.lineTo(bottomLeft.x + radius.tr, bottomLeft.y);
        this.ctx.quadraticCurveTo(bottomLeft.x, bottomLeft.y, bottomLeft.x, bottomLeft.y - radius.tr);
        
        this.ctx.lineTo(topLeft.x, topLeft.y + radius.tr);
        this.ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + radius.tr, topLeft.y);
        
        this.ctx.closePath();
        if(options.fill) {
            this.ctx.fill();
        }
        if(options.strike) {
            this.ctx.lineWidth = options.lineWidth;
            this.ctx.stroke();
        }
        this.ctx.restore();

    }

    objectIsEmpty(obj) {
        return Object.keys(obj).length === 0;
    }



    copyArray(array) {
        return JSON.parse(JSON.stringify(array));
    }
}
