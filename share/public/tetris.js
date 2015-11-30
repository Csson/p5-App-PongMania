
define('text!components/tetris/tetris.html',[],function () { return '<div id="tetris-page">\n    <canvas class="full"></canvas>\n</div>\n';});

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
            this.relativeTopX = params.topX || 0;
            this.relativeTopY = params.topY || 30;
            this.fills = this.getFillForTypeRotation();

            this.bounding = {
                xUnits: this.type === 'I' || this.type === 'O' ? 4 : 3,
                yUnits: this.type === 'I' ? 4 : 3
            };
        }

        /*
        */

        _createClass(TetrisBlock, [{
            key: 'colorDefault',
            value: function colorDefault() {
                return this.type === 'I' ? '#00ffff' : this.type === 'J' ? '#0000ff' : this.type === 'L' ? '#ffaa00' : this.type === 'O' ? '#ffff00' : this.type === 'S' ? '#00ddbb' : this.type === 'T' ? '#9900ff' : this.type === 'Z' ? '#ff0000' : '#fff';
            }
        }, {
            key: 'rotate',
            value: function rotate(direction) {
                if (this.rotation + direction > 3) {
                    this.rotation = 0;
                } else if (this.rotation + direction < 0) {
                    this.rotation = 3;
                } else {
                    this.rotation = this.rotation + direction;
                }
                this.fills = this.getFillForTypeRotation();
            }
        }, {
            key: 'moveLeft',
            value: function moveLeft() {
                this.relativeTopX = this.relativeTopX - this.unitSize;
            }
        }, {
            key: 'moveRight',
            value: function moveRight() {
                this.relativeTopX = this.relativeTopX + this.unitSize;
            }
        }, {
            key: 'topX',
            value: function topX() {
                return this.relativeTopX + this.area.left;
            }
        }, {
            key: 'topY',
            value: function topY() {
                return this.relativeTopY + this.area.top;
            }
        }, {
            key: 'draw',
            value: function draw() {
                for (var rowIndex = 0; rowIndex <= 3; rowIndex++) {
                    var cells = this.fills[rowIndex].split('');
                    for (var cellIndex = 0; cellIndex <= 3; cellIndex++) {
                        if (cells[cellIndex] === '#') {
                            this.ctx.fillStyle = this.color;
                            this.ctx.fillRect(this.topX() + cellIndex * this.unitSize, this.topY() + rowIndex * this.unitSize, this.unitSize, this.unitSize);
                        }
                    }
                }
            }
        }, {
            key: 'getFillForTypeRotation',
            value: function getFillForTypeRotation() {
                var typeRotations = {

                    I: [['_#__', '_#__', '_#__', '_#__'], ['____', '####', '____', '____'], ['__#_', '__#_', '__#_', '__#_'], ['____', '____', '####', '____']],
                    J: [['_#__', '_#__', '##__', '____'], ['#___', '###_', '____', '____'], ['_##_', '_#__', '_#__', '____'], ['____', '###_', '__#_', '____']],
                    L: [['_#__', '_#__', '_##_', '____'], ['____', '###_', '#___', '____'], ['##__', '_#__', '_#__', '____'], ['__#_', '###_', '____', '____']],
                    O: [['_##_', '_##_', '____', '____'], ['_##_', '_##_', '____', '____'], ['_##_', '_##_', '____', '____'], ['_##_', '_##_', '____', '____']],
                    S: [['____', '_##_', '##__', '____'], ['#___', '##__', '_#__', '____'], ['_##_', '##__', '____', '____'], ['_#__', '_##_', '__#_', '____']],
                    T: [['____', '###_', '_#__', '____'], ['_#__', '##__', '_#__', '____'], ['_#__', '###_', '____', '____'], ['_#__', '_##_', '_#__', '____']],
                    Z: [['____', '##__', '_##_', '____'], ['_#__', '##__', '#____', '____'], ['##__', '_##_', '____', '____'], ['__#_', '_##_', '_#__', '____']]
                };
                return typeRotations[this.type][this.rotation];
            }
        }]);

        return TetrisBlock;
    })();

    exports.TetrisBlock = TetrisBlock;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDakQsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNoQyxnQkFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ3JDLGdCQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3RDLGdCQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDOztBQUUzQyxnQkFBSSxDQUFDLFFBQVEsR0FBRztBQUNaLHNCQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7QUFDdEQsc0JBQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQzthQUNwQyxDQUFBO1NBQ0o7Ozs7O3FCQWhCUSxXQUFXOzttQkFpQlIsd0JBQUc7QUFDWCx1QkFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsR0FBRyxTQUFT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TSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE9BQU8sRUFDUCxNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7aUJBQ0osQ0FBQztBQUNGLHVCQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2xEOzs7ZUE5UFEsV0FBVyIsImZpbGUiOiJnc3JjL2NvbXBvbmVudHMvdGV0cmlzL2Jsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGtvIGZyb20gJ2tub2Nrb3V0JztcblxuZXhwb3J0IGNsYXNzIFRldHJpc0Jsb2NrIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5hcmVhID0gcGFyYW1zLmFyZWE7XG4gICAgICAgIHRoaXMudHlwZSA9IHBhcmFtcy50eXBlOyAvLyBJLCBKLCBMLCBPLCBTLCBULCBaXG4gICAgICAgIHRoaXMucm90YXRpb24gPSBwYXJhbXMucm90YXRpb247IC8vIDAsIDEsIDIsIDNcbiAgICAgICAgdGhpcy5jb2xvciA9IHBhcmFtcy5jb2xvciB8fCB0aGlzLmNvbG9yRGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnVuaXRTaXplID0gcGFyYW1zLnVuaXRTaXplO1xuICAgICAgICB0aGlzLmN0eCA9IHBhcmFtcy5jdHg7XG4gICAgICAgIHRoaXMucmVsYXRpdmVUb3BYID0gcGFyYW1zLnRvcFggfHwgMDtcbiAgICAgICAgdGhpcy5yZWxhdGl2ZVRvcFkgPSBwYXJhbXMudG9wWSB8fCAzMDtcbiAgICAgICAgdGhpcy5maWxscyA9IHRoaXMuZ2V0RmlsbEZvclR5cGVSb3RhdGlvbigpO1xuXG4gICAgICAgIHRoaXMuYm91bmRpbmcgPSB7XG4gICAgICAgICAgICB4VW5pdHM6IHRoaXMudHlwZSA9PT0gJ0knIHx8IHRoaXMudHlwZSA9PT0gJ08nID8gNCA6IDMsXG4gICAgICAgICAgICB5VW5pdHM6IHRoaXMudHlwZSA9PT0gJ0knID8gNCA6IDMsXG4gICAgICAgIH1cbiAgICB9XG4gICAgY29sb3JEZWZhdWx0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSAnSScgPyAnIzAwZmZmZidcbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ0onID8gJyMwMDAwZmYnXG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdMJyA/ICcjZmZhYTAwJ1xuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnTycgPyAnI2ZmZmYwMCdcbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ1MnID8gJyMwMGRkYmInXG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdUJyA/ICcjOTkwMGZmJ1xuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnWicgPyAnI2ZmMDAwMCdcbiAgICAgICAgICAgICA6ICAgICAgICAgICAgICAgICAgICAgJyNmZmYnXG4gICAgICAgICAgICAgO1xuICAgIH1cbiAgICByb3RhdGUoZGlyZWN0aW9uKSB7XG4gICAgICAgIGlmKHRoaXMucm90YXRpb24gKyBkaXJlY3Rpb24gPiAzKSB7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHRoaXMucm90YXRpb24gKyBkaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gMztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLnJvdGF0aW9uICsgZGlyZWN0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlsbHMgPSB0aGlzLmdldEZpbGxGb3JUeXBlUm90YXRpb24oKTtcbiAgICB9XG4gICAgbW92ZUxlZnQoKSB7XG4gICAgICAgIHRoaXMucmVsYXRpdmVUb3BYID0gdGhpcy5yZWxhdGl2ZVRvcFggLSB0aGlzLnVuaXRTaXplO1xuICAgIH1cbiAgICBtb3ZlUmlnaHQoKSB7XG4gICAgICAgIHRoaXMucmVsYXRpdmVUb3BYID0gdGhpcy5yZWxhdGl2ZVRvcFggKyB0aGlzLnVuaXRTaXplO1xuICAgIH1cbiAgICB0b3BYKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVRvcFggKyB0aGlzLmFyZWEubGVmdDtcbiAgICB9XG4gICAgdG9wWSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVUb3BZICsgdGhpcy5hcmVhLnRvcDtcbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDw9IDM7IHJvd0luZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBjZWxscyA9IHRoaXMuZmlsbHNbcm93SW5kZXhdLnNwbGl0KCcnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGNlbGxJbmRleCA9IDA7IGNlbGxJbmRleCA8PSAzOyBjZWxsSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGlmKGNlbGxzW2NlbGxJbmRleF0gPT09ICcjJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLnRvcFgoKSArIGNlbGxJbmRleCAqIHRoaXMudW5pdFNpemUsIHRoaXMudG9wWSgpICsgcm93SW5kZXggKiB0aGlzLnVuaXRTaXplLCB0aGlzLnVuaXRTaXplLCB0aGlzLnVuaXRTaXplKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG4gICAgZ2V0RmlsbEZvclR5cGVSb3RhdGlvbigpIHtcbiAgICAgICAgdmFyIHR5cGVSb3RhdGlvbnMgPSB7XG5cbiAgICAgICAgICAgIEk6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgSjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBMOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBPOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBTOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFQ6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgWjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyNfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHR5cGVSb3RhdGlvbnNbdGhpcy50eXBlXVt0aGlzLnJvdGF0aW9uXTtcbiAgICB9XG59XG4vKlxuKi8iXX0=;
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
            this.blocks = this.randomizeBlocks(this.blocksLeft());

            console.log(this);
        }

        _createClass(TetrisRound, [{
            key: 'blockCountForLevel',
            value: function blockCountForLevel(level) {
                return level == 1 ? 10 : level == 2 ? 12 : level == 3 ? 15 : 1;
            }
        }, {
            key: 'activeBlockRotate',
            value: function activeBlockRotate() {
                this.blocks[this.blocksDone()].rotate(1);
            }
        }, {
            key: 'activeBlockMoveLeft',
            value: function activeBlockMoveLeft() {
                this.blocks[this.blocksDone()].moveLeft();
            }
        }, {
            key: 'activeBlockMoveRight',
            value: function activeBlockMoveRight() {
                this.blocks[this.blocksDone()].moveRight();
            }
        }, {
            key: 'draw',
            value: function draw() {
                for (var i = 0; i < this.blocks.length; i++) {
                    this.blocks[i].draw();
                    // this.blocks[i].rotate(Math.random() > 0.5 ? 1 : -1);
                }
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
                        topY: 1 + (i - 1) * this.unitSize * 4,
                        ctx: this.ctx,
                        area: this.area
                    }));
                }
                console.log(blocks);
                return blocks;
            }
        }]);

        return TetrisRound;
    })();

    exports.TetrisRound = TetrisRound;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvcm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBR2EsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUN0QixnQkFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2hDLGdCQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDeEIsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsZUFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLGdCQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7O0FBRXRELG1CQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JCOztxQkFYUSxXQUFXOzttQkFZRiw0QkFBQyxLQUFLLEVBQUU7QUFDdEIsdUJBQU8sS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQ0YsQ0FBQyxDQUNmO2FBQ1Q7OzttQkFFZ0IsNkJBQUc7QUFDaEIsb0JBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzVDOzs7bUJBQ2tCLCtCQUFHO0FBQ2xCLG9CQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQzdDOzs7bUJBQ21CLGdDQUFHO0FBQ25CLG9CQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQzlDOzs7bUJBR0csZ0JBQUc7QUFDSCxxQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3pDLHdCQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDOztpQkFFekI7YUFDSjs7O21CQUVjLHlCQUFDLE1BQU0sRUFBRTtBQUNwQixvQkFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLG9CQUFJLFVBQVUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JELG9CQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVCLHFCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlCLDBCQUFNLENBQUMsSUFBSSxDQUFDLFdBN0NmLFdBQVcsQ0E2Q29CO0FBQ3hCLDRCQUFJLEVBQUUsVUFBVSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBRTtBQUNqRSxnQ0FBUSxFQUFFLFFBQVEsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUU7QUFDakUsZ0NBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2Qiw0QkFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUM7QUFDckMsMkJBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNiLDRCQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7cUJBQ2xCLENBQUMsQ0FBQyxDQUFDO2lCQUNQO0FBQ0QsdUJBQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsdUJBQU8sTUFBTSxDQUFDO2FBQ2pCOzs7ZUF0RFEsV0FBVyIsImZpbGUiOiJnc3JjL2NvbXBvbmVudHMvdGV0cmlzL3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGtvIGZyb20gJ2tub2Nrb3V0JztcbmltcG9ydCB7IFRldHJpc0Jsb2NrIH0gZnJvbSAnLi9ibG9jayc7XG5cbmV4cG9ydCBjbGFzcyBUZXRyaXNSb3VuZCB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuY3R4ID0gcGFyYW1zLmN0eDtcbiAgICAgICAgdGhpcy51bml0U2l6ZSA9IHBhcmFtcy51bml0U2l6ZTtcbiAgICAgICAgdGhpcy5hcmVhID0gcGFyYW1zLmFyZWE7XG4gICAgICAgIHRoaXMubGV2ZWwgPSBrby5vYnNlcnZhYmxlKHBhcmFtcy5sZXZlbCk7XG4gICAgICAgIHRoaXMuYmxvY2tzTGVmdCA9IGtvLm9ic2VydmFibGUodGhpcy5ibG9ja0NvdW50Rm9yTGV2ZWwodGhpcy5sZXZlbCgpKSk7XG4gICAgICAgIHRoaXMuYmxvY2tzRG9uZSA9IGtvLm9ic2VydmFibGUoMCk7XG4gICAgICAgIHRoaXMuYmxvY2tzID0gdGhpcy5yYW5kb21pemVCbG9ja3ModGhpcy5ibG9ja3NMZWZ0KCkpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgIH1cbiAgICBibG9ja0NvdW50Rm9yTGV2ZWwobGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuIGxldmVsID09IDEgPyAxMFxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMiA/IDEyXG4gICAgICAgICAgICAgOiBsZXZlbCA9PSAzID8gMTVcbiAgICAgICAgICAgICA6ICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgO1xuICAgIH1cblxuICAgIGFjdGl2ZUJsb2NrUm90YXRlKCkge1xuICAgICAgICB0aGlzLmJsb2Nrc1t0aGlzLmJsb2Nrc0RvbmUoKV0ucm90YXRlKDEpO1xuICAgIH1cbiAgICBhY3RpdmVCbG9ja01vdmVMZWZ0KCkge1xuICAgICAgICB0aGlzLmJsb2Nrc1t0aGlzLmJsb2Nrc0RvbmUoKV0ubW92ZUxlZnQoKTtcbiAgICB9XG4gICAgYWN0aXZlQmxvY2tNb3ZlUmlnaHQoKSB7XG4gICAgICAgIHRoaXMuYmxvY2tzW3RoaXMuYmxvY2tzRG9uZSgpXS5tb3ZlUmlnaHQoKTtcbiAgICB9XG5cblxuICAgIGRyYXcoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ibG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYmxvY2tzW2ldLmRyYXcoKTtcbiAgICAgICAgICAgLy8gdGhpcy5ibG9ja3NbaV0ucm90YXRlKE1hdGgucmFuZG9tKCkgPiAwLjUgPyAxIDogLTEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmFuZG9taXplQmxvY2tzKGFtb3VudCkge1xuICAgICAgICB2YXIgYmxvY2tzID0gW107XG4gICAgICAgIHZhciBibG9ja1R5cGVzID0gWydJJywgJ0onLCAnTCcsICdPJywgJ1MnLCAnVCcsICdaJ107XG4gICAgICAgIHZhciByb3RhdGlvbiA9IFswLCAxLCAyLCAzXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gYW1vdW50OyBpKyspIHtcbiAgICAgICAgICAgIGJsb2Nrcy5wdXNoKG5ldyBUZXRyaXNCbG9jayh7XG4gICAgICAgICAgICAgICAgdHlwZTogYmxvY2tUeXBlc1sgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYmxvY2tUeXBlcy5sZW5ndGgpIF0sXG4gICAgICAgICAgICAgICAgcm90YXRpb246IHJvdGF0aW9uWyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByb3RhdGlvbi5sZW5ndGgpIF0sXG4gICAgICAgICAgICAgICAgdW5pdFNpemU6IHRoaXMudW5pdFNpemUsXG4gICAgICAgICAgICAgICAgdG9wWTogMSArIChpIC0gMSkgKiB0aGlzLnVuaXRTaXplICogNCxcbiAgICAgICAgICAgICAgICBjdHg6IHRoaXMuY3R4LFxuICAgICAgICAgICAgICAgIGFyZWE6IHRoaXMuYXJlYSxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhibG9ja3MpO1xuICAgICAgICByZXR1cm4gYmxvY2tzO1xuICAgIH1cblxufSJdfQ==;
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

            this.unitSize = 14;
            this.meta = {
                horizontalBlocks: 10,
                verticalBlocks: 20
            };
            this.area = {
                left: this.canvasWidth / 2 - this.unitSize * this.meta.horizontalBlocks / 2,
                top: this.canvasHeight / 2 - this.unitSize * this.meta.verticalBlocks / 2,
                right: this.canvasWidth / 2 + this.unitSize * this.meta.horizontalBlocks,
                bottom: this.canvasHeight / 2 + this.unitSize * this.meta.verticalBlocks,
                width: this.unitSize * this.meta.horizontalBlocks,
                height: this.unitSize * this.meta.verticalBlocks
            };
            console.log(this);

            this.round = new _round.TetrisRound({
                level: 1,
                unitSize: this.unitSize,
                ctx: this.ctx,
                area: this.area
            });

            $(document).keydown(function (e) {
                console.log('down key ' + e.which);
                if (e.which === 38) {
                    _this.round.activeBlockRotate();
                } else if (e.which === 37) {
                    _this.round.activeBlockMoveLeft();
                } else if (e.which === 39) {
                    _this.round.activeBlockMoveRight();
                } else if (e.which === 40) {
                    _this.round.activeBlockDrop();
                }
            });

            this.run();
        }

        _createClass(Tetris, [{
            key: 'draw',
            value: function draw() {
                this.ctx.clearRect(0, 0, this.width, this.height);
                this.ctx.fillStyle = '#777';
                this.ctx.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);
            }
        }, {
            key: 'run',
            value: function run() {
                this.draw();
                this.round.draw();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFLTSxNQUFNO0FBQ0csaUJBRFQsTUFBTSxDQUNJLE1BQU0sRUFBRTs7O2tDQURsQixNQUFNOztBQUVKLGdCQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUN6QyxxQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLHFCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7O0FBRXpDLGdCQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkMsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFekMsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ25CLGdCQUFJLENBQUMsSUFBSSxHQUFHO0FBQ1IsZ0NBQWdCLEVBQUUsRUFBRTtBQUNwQiw4QkFBYyxFQUFFLEVBQUU7YUFDckIsQ0FBQztBQUNGLGdCQUFJLENBQUMsSUFBSSxHQUFHO0FBQ1Isb0JBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQztBQUMzRSxtQkFBRyxFQUFFLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQztBQUN6RSxxQkFBSyxFQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0I7QUFDeEUsc0JBQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYztBQUN4RSxxQkFBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0I7QUFDakQsc0JBQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYzthQUNuRCxDQUFDO0FBQ0YsbUJBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWxCLGdCQUFJLENBQUMsS0FBSyxHQUFHLFdBNUJaLFdBQVcsQ0E0QmlCO0FBQ3pCLHFCQUFLLEVBQUUsQ0FBQztBQUNSLHdCQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDdkIsbUJBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNiLG9CQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7YUFDbEIsQ0FBQyxDQUFDOztBQUVILGFBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLEVBQUs7QUFDdkIsdUJBQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNuQyxvQkFBRyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRTtBQUNmLDBCQUFLLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2lCQUNsQyxNQUNJLElBQUcsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLEVBQUU7QUFDcEIsMEJBQUssS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUM7aUJBQ3BDLE1BQ0ksSUFBRyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRTtBQUNwQiwwQkFBSyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztpQkFDckMsTUFDSSxJQUFHLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRSxFQUFFO0FBQ3BCLDBCQUFLLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztpQkFDaEM7YUFDSixDQUFDLENBQUM7O0FBRUgsZ0JBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUVkOztxQkFsREMsTUFBTTs7bUJBb0RKLGdCQUFHO0FBQ0gsb0JBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEQsb0JBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUM1QixvQkFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUV2Rjs7O21CQUVFLGVBQUc7QUFDRixvQkFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1osb0JBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbEIsb0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQiwwQkFBVSxDQUFDLFlBQVc7QUFBRSx3QkFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO2lCQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDN0M7OzttQkFFTSxtQkFBRzs7O2FBR1Q7OztlQXJFQyxNQUFNOzs7cUJBd0VHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLDRCQUFnQixFQUFFIiwiZmlsZSI6ImdzcmMvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGtvIGZyb20gJ2tub2Nrb3V0JztcbmltcG9ydCB0ZW1wbGF0ZU1hcmt1cCBmcm9tICd0ZXh0IS4vdGV0cmlzLmh0bWwnO1xuaW1wb3J0IHsgVGV0cmlzUm91bmQgfSBmcm9tICcuL3JvdW5kJztcbmltcG9ydCB7IFRldHJpc0Jsb2NrIH0gZnJvbSAnLi9ibG9jayc7XG5cbmNsYXNzIFRldHJpcyB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHZhciAkZ2FtZUFyZWEgPSAkKCcjdGV0cmlzLXBhZ2UgY2FudmFzJyk7XG4gICAgICAgICRnYW1lQXJlYVswXS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAkZ2FtZUFyZWFbMF0uaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuY2FudmFzV2lkdGggPSAkZ2FtZUFyZWEud2lkdGgoKTtcbiAgICAgICAgdGhpcy5jYW52YXNIZWlnaHQgPSAkZ2FtZUFyZWEuaGVpZ2h0KCk7XG4gICAgICAgIHRoaXMuY3R4ID0gJGdhbWVBcmVhWzBdLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgdGhpcy51bml0U2l6ZSA9IDE0O1xuICAgICAgICB0aGlzLm1ldGEgPSB7XG4gICAgICAgICAgICBob3Jpem9udGFsQmxvY2tzOiAxMCxcbiAgICAgICAgICAgIHZlcnRpY2FsQmxvY2tzOiAyMCxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hcmVhID0ge1xuICAgICAgICAgICAgbGVmdDogdGhpcy5jYW52YXNXaWR0aCAvIDIgLSB0aGlzLnVuaXRTaXplICogdGhpcy5tZXRhLmhvcml6b250YWxCbG9ja3MgLyAyLFxuICAgICAgICAgICAgdG9wOiB0aGlzLmNhbnZhc0hlaWdodCAvIDIgLSB0aGlzLnVuaXRTaXplICogdGhpcy5tZXRhLnZlcnRpY2FsQmxvY2tzIC8gMixcbiAgICAgICAgICAgIHJpZ2h0OiB0aGlzLmNhbnZhc1dpZHRoIC8gMiArIHRoaXMudW5pdFNpemUgKiB0aGlzLm1ldGEuaG9yaXpvbnRhbEJsb2NrcyxcbiAgICAgICAgICAgIGJvdHRvbTogdGhpcy5jYW52YXNIZWlnaHQgLyAyICsgdGhpcy51bml0U2l6ZSAqIHRoaXMubWV0YS52ZXJ0aWNhbEJsb2NrcyxcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnVuaXRTaXplICogdGhpcy5tZXRhLmhvcml6b250YWxCbG9ja3MsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMudW5pdFNpemUgKiB0aGlzLm1ldGEudmVydGljYWxCbG9ja3MsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuXG4gICAgICAgIHRoaXMucm91bmQgPSBuZXcgVGV0cmlzUm91bmQoe1xuICAgICAgICAgICAgbGV2ZWw6IDEsXG4gICAgICAgICAgICB1bml0U2l6ZTogdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgIGN0eDogdGhpcy5jdHgsXG4gICAgICAgICAgICBhcmVhOiB0aGlzLmFyZWEsXG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLmtleWRvd24oKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkb3duIGtleSAnICsgZS53aGljaCk7XG4gICAgICAgICAgICBpZihlLndoaWNoID09PSAzOCkge1xuICAgICAgICAgICAgICAgIHRoaXMucm91bmQuYWN0aXZlQmxvY2tSb3RhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gMzcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdW5kLmFjdGl2ZUJsb2NrTW92ZUxlZnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoZS53aGljaCA9PT0gMzkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdW5kLmFjdGl2ZUJsb2NrTW92ZVJpZ2h0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGUud2hpY2ggPT09IDQwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3VuZC5hY3RpdmVCbG9ja0Ryb3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5ydW4oKTtcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIGRyYXcoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIHRoaXMuY3R4LmZpbGxTdHlsZSA9ICcjNzc3JztcbiAgICAgICAgdGhpcy5jdHguZmlsbFJlY3QodGhpcy5hcmVhLmxlZnQsIHRoaXMuYXJlYS50b3AsIHRoaXMuYXJlYS53aWR0aCwgdGhpcy5hcmVhLmhlaWdodCk7XG5cbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIHRoaXMuZHJhdygpO1xuICAgICAgICB0aGlzLnJvdW5kLmRyYXcoKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzZWxmLnJ1bigpIH0sIDI1KTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICAvLyBUaGlzIHJ1bnMgd2hlbiB0aGUgY29tcG9uZW50IGlzIHRvcm4gZG93bi4gUHV0IGhlcmUgYW55IGxvZ2ljIG5lY2Vzc2FyeSB0byBjbGVhbiB1cCxcbiAgICAgICAgLy8gZm9yIGV4YW1wbGUgY2FuY2VsbGluZyBzZXRUaW1lb3V0cyBvciBkaXNwb3NpbmcgS25vY2tvdXQgc3Vic2NyaXB0aW9ucy9jb21wdXRlZHMuXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7IHZpZXdNb2RlbDogVGV0cmlzLCB0ZW1wbGF0ZTogdGVtcGxhdGVNYXJrdXAgfTtcbiJdfQ==;