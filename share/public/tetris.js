
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
            this.relativeTopX = params.topX || 10;
            this.relativeTopY = params.topY || 30;

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
                var fills = this.getFillForTypeRotation();

                for (var rowIndex = 0; rowIndex <= 3; rowIndex++) {
                    console.log(rowIndex);
                    console.log(this);
                    console.log(fills);
                    var cells = fills[rowIndex].split('');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDakQsZ0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUNoQyxnQkFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ3RDLGdCQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDOztBQUV0QyxnQkFBSSxDQUFDLFFBQVEsR0FBRztBQUNaLHNCQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7QUFDdEQsc0JBQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQzthQUNwQyxDQUFBO1NBQ0o7Ozs7O3FCQWZRLFdBQVc7O21CQWdCUix3QkFBRztBQUNYLHVCQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxHQUFHLFNBQVMsR0FDN0IsSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLEdBQUcsU0FBUyxHQUM3QixJQUFJLENB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TixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtBQUNELHFCQUFDLEVBQUUsQ0FDQyxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxDQUNKO0FBQ0QscUJBQUMsRUFBRSxDQUNDLENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULENBQ0o7QUFDRCxxQkFBQyxFQUFFLENBQ0MsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsRUFDRCxDQUNJLE1BQU0sRUFDTixNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sQ0FDVCxFQUNELENBQ0ksTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLEVBQ04sTUFBTSxDQUNULEVBQ0QsQ0FDSSxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQU0sRUFDTixNQUFNLENBQ1QsQ0FDSjtpQkFDSixDQUFDO0FBQ0YsdUJBQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbEQ7OztlQTNQUSxXQUFXIiwiZmlsZSI6ImdzcmMvY29tcG9uZW50cy90ZXRyaXMvYmxvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuXG5leHBvcnQgY2xhc3MgVGV0cmlzQmxvY2sge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLmFyZWEgPSBwYXJhbXMuYXJlYTtcbiAgICAgICAgdGhpcy50eXBlID0gcGFyYW1zLnR5cGU7IC8vIEksIEosIEwsIE8sIFMsIFQsIFpcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHBhcmFtcy5yb3RhdGlvbjsgLy8gMCwgMSwgMiwgM1xuICAgICAgICB0aGlzLmNvbG9yID0gcGFyYW1zLmNvbG9yIHx8IHRoaXMuY29sb3JEZWZhdWx0KCk7XG4gICAgICAgIHRoaXMudW5pdFNpemUgPSBwYXJhbXMudW5pdFNpemU7XG4gICAgICAgIHRoaXMuY3R4ID0gcGFyYW1zLmN0eDtcbiAgICAgICAgdGhpcy5yZWxhdGl2ZVRvcFggPSBwYXJhbXMudG9wWCB8fCAxMDtcbiAgICAgICAgdGhpcy5yZWxhdGl2ZVRvcFkgPSBwYXJhbXMudG9wWSB8fCAzMDtcblxuICAgICAgICB0aGlzLmJvdW5kaW5nID0ge1xuICAgICAgICAgICAgeFVuaXRzOiB0aGlzLnR5cGUgPT09ICdJJyB8fCB0aGlzLnR5cGUgPT09ICdPJyA/IDQgOiAzLFxuICAgICAgICAgICAgeVVuaXRzOiB0aGlzLnR5cGUgPT09ICdJJyA/IDQgOiAzLFxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbG9yRGVmYXVsdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gJ0knID8gJyMwMGZmZmYnXG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdKJyA/ICcjMDAwMGZmJ1xuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnTCcgPyAnI2ZmYWEwMCdcbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ08nID8gJyNmZmZmMDAnXG4gICAgICAgICAgICAgOiB0aGlzLnR5cGUgPT09ICdTJyA/ICcjMDBkZGJiJ1xuICAgICAgICAgICAgIDogdGhpcy50eXBlID09PSAnVCcgPyAnIzk5MDBmZidcbiAgICAgICAgICAgICA6IHRoaXMudHlwZSA9PT0gJ1onID8gJyNmZjAwMDAnXG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgICAgICAgICcjZmZmJ1xuICAgICAgICAgICAgIDtcbiAgICB9XG4gICAgcm90YXRlKGRpcmVjdGlvbikge1xuICAgICAgICBpZih0aGlzLnJvdGF0aW9uICsgZGlyZWN0aW9uID4gMykge1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZih0aGlzLnJvdGF0aW9uICsgZGlyZWN0aW9uIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IDM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhpcy5yb3RhdGlvbiArIGRpcmVjdGlvbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0b3BYKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWxhdGl2ZVRvcFggKyB0aGlzLmFyZWEubGVmdDtcbiAgICB9XG4gICAgdG9wWSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVsYXRpdmVUb3BZICsgdGhpcy5hcmVhLnRvcDtcbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICB2YXIgZmlsbHMgPSB0aGlzLmdldEZpbGxGb3JUeXBlUm90YXRpb24oKTtcblxuICAgICAgICBmb3IgKHZhciByb3dJbmRleCA9IDA7IHJvd0luZGV4IDw9IDM7IHJvd0luZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJvd0luZGV4KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZmlsbHMpO1xuICAgICAgICAgICAgdmFyIGNlbGxzID0gZmlsbHNbcm93SW5kZXhdLnNwbGl0KCcnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGNlbGxJbmRleCA9IDA7IGNlbGxJbmRleCA8PSAzOyBjZWxsSW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGlmKGNlbGxzW2NlbGxJbmRleF0gPT09ICcjJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLnRvcFgoKSArIGNlbGxJbmRleCAqIHRoaXMudW5pdFNpemUsIHRoaXMudG9wWSgpICsgcm93SW5kZXggKiB0aGlzLnVuaXRTaXplLCB0aGlzLnVuaXRTaXplLCB0aGlzLnVuaXRTaXplKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG4gICAgZ2V0RmlsbEZvclR5cGVSb3RhdGlvbigpIHtcbiAgICAgICAgdmFyIHR5cGVSb3RhdGlvbnMgPSB7XG5cbiAgICAgICAgICAgIEk6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJ1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyMjJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgSjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBMOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnI19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX18jXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBPOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyMjXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBTOiBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICcjX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjX18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fI18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFQ6IFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyMjI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ18jX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgWjogW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICcjI19fJyxcbiAgICAgICAgICAgICAgICAgICAgJyNfX19fJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAnIyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfIyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ19fX18nLFxuICAgICAgICAgICAgICAgICAgICAnX19fXycsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICdfXyNfJyxcbiAgICAgICAgICAgICAgICAgICAgJ18jI18nLFxuICAgICAgICAgICAgICAgICAgICAnXyNfXycsXG4gICAgICAgICAgICAgICAgICAgICdfX19fJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHR5cGVSb3RhdGlvbnNbdGhpcy50eXBlXVt0aGlzLnJvdGF0aW9uXTtcbiAgICB9XG59XG4vKlxuKi8iXX0=;
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
            key: 'draw',
            value: function draw() {
                for (var i = 0; i < this.blocks.length; i++) {
                    this.blocks[i].draw();
                    this.blocks[i].rotate(Math.random() > 0.5 ? 1 : -1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvcm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBR2EsV0FBVztBQUNULGlCQURGLFdBQVcsQ0FDUixNQUFNLEVBQUU7a0NBRFgsV0FBVzs7QUFFaEIsZ0JBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUN0QixnQkFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2hDLGdCQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDeEIsZ0JBQUksQ0FBQyxLQUFLLEdBQUcsZUFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLGdCQUFJLENBQUMsVUFBVSxHQUFHLGVBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLGdCQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7O0FBRXRELG1CQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JCOztxQkFYUSxXQUFXOzttQkFZRiw0QkFBQyxLQUFLLEVBQUU7QUFDdEIsdUJBQU8sS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQ0YsQ0FBQyxDQUNmO2FBQ1Q7OzttQkFFRyxnQkFBRztBQUNILHFCQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsd0JBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdEIsd0JBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZEO2FBQ0o7OzttQkFFYyx5QkFBQyxNQUFNLEVBQUU7QUFDcEIsb0JBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixvQkFBSSxVQUFVLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNyRCxvQkFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QixxQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM5QiwwQkFBTSxDQUFDLElBQUksQ0FBQyxXQWxDZixXQUFXLENBa0NvQjtBQUN4Qiw0QkFBSSxFQUFFLFVBQVUsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUU7QUFDakUsZ0NBQVEsRUFBRSxRQUFRLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFFO0FBQ2pFLGdDQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7QUFDdkIsNEJBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDO0FBQ3JDLDJCQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDYiw0QkFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO3FCQUNsQixDQUFDLENBQUMsQ0FBQztpQkFDUDtBQUNELHVCQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLHVCQUFPLE1BQU0sQ0FBQzthQUNqQjs7O2VBM0NRLFdBQVciLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL3RldHJpcy9yb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5pbXBvcnQgeyBUZXRyaXNCbG9jayB9IGZyb20gJy4vYmxvY2snO1xuXG5leHBvcnQgY2xhc3MgVGV0cmlzUm91bmQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLmN0eCA9IHBhcmFtcy5jdHg7XG4gICAgICAgIHRoaXMudW5pdFNpemUgPSBwYXJhbXMudW5pdFNpemU7XG4gICAgICAgIHRoaXMuYXJlYSA9IHBhcmFtcy5hcmVhO1xuICAgICAgICB0aGlzLmxldmVsID0ga28ub2JzZXJ2YWJsZShwYXJhbXMubGV2ZWwpO1xuICAgICAgICB0aGlzLmJsb2Nrc0xlZnQgPSBrby5vYnNlcnZhYmxlKHRoaXMuYmxvY2tDb3VudEZvckxldmVsKHRoaXMubGV2ZWwoKSkpO1xuICAgICAgICB0aGlzLmJsb2Nrc0RvbmUgPSBrby5vYnNlcnZhYmxlKDApO1xuICAgICAgICB0aGlzLmJsb2NrcyA9IHRoaXMucmFuZG9taXplQmxvY2tzKHRoaXMuYmxvY2tzTGVmdCgpKTtcblxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICB9XG4gICAgYmxvY2tDb3VudEZvckxldmVsKGxldmVsKSB7XG4gICAgICAgIHJldHVybiBsZXZlbCA9PSAxID8gMTBcbiAgICAgICAgICAgICA6IGxldmVsID09IDIgPyAxMlxuICAgICAgICAgICAgIDogbGV2ZWwgPT0gMyA/IDE1XG4gICAgICAgICAgICAgOiAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgIDtcbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmJsb2Nrc1tpXS5kcmF3KCk7XG4gICAgICAgICAgICB0aGlzLmJsb2Nrc1tpXS5yb3RhdGUoTWF0aC5yYW5kb20oKSA+IDAuNSA/IDEgOiAtMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByYW5kb21pemVCbG9ja3MoYW1vdW50KSB7XG4gICAgICAgIHZhciBibG9ja3MgPSBbXTtcbiAgICAgICAgdmFyIGJsb2NrVHlwZXMgPSBbJ0knLCAnSicsICdMJywgJ08nLCAnUycsICdUJywgJ1onXTtcbiAgICAgICAgdmFyIHJvdGF0aW9uID0gWzAsIDEsIDIsIDNdO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBhbW91bnQ7IGkrKykge1xuICAgICAgICAgICAgYmxvY2tzLnB1c2gobmV3IFRldHJpc0Jsb2NrKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBibG9ja1R5cGVzWyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBibG9ja1R5cGVzLmxlbmd0aCkgXSxcbiAgICAgICAgICAgICAgICByb3RhdGlvbjogcm90YXRpb25bIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHJvdGF0aW9uLmxlbmd0aCkgXSxcbiAgICAgICAgICAgICAgICB1bml0U2l6ZTogdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgICAgICB0b3BZOiAxICsgKGkgLSAxKSAqIHRoaXMudW5pdFNpemUgKiA0LFxuICAgICAgICAgICAgICAgIGN0eDogdGhpcy5jdHgsXG4gICAgICAgICAgICAgICAgYXJlYTogdGhpcy5hcmVhLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGJsb2Nrcyk7XG4gICAgICAgIHJldHVybiBibG9ja3M7XG4gICAgfVxuXG59Il19;
define('components/tetris/tetris',['exports', 'module', 'knockout', 'text!./tetris.html', './round', './block'], function (exports, module, _knockout, _textTetrisHtml, _round, _block) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var _templateMarkup = _interopRequireDefault(_textTetrisHtml);

    var Tetris = (function () {
        function Tetris(params) {
            _classCallCheck(this, Tetris);

            var $gameArea = $('#tetris-page canvas');
            $gameArea[0].width = window.innerWidth;
            $gameArea[0].height = window.innerHeight;

            this.canvasWidth = $gameArea.width();
            this.canvasHeight = $gameArea.height();
            this.ctx = $gameArea[0].getContext('2d');

            this.unitSize = 8;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy90ZXRyaXMvdGV0cmlzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7UUFLTSxNQUFNO0FBQ0csaUJBRFQsTUFBTSxDQUNJLE1BQU0sRUFBRTtrQ0FEbEIsTUFBTTs7QUFFSixnQkFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDekMscUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUN2QyxxQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDOztBQUV6QyxnQkFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDckMsZ0JBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3ZDLGdCQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXpDLGdCQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUNsQixnQkFBSSxDQUFDLElBQUksR0FBRztBQUNSLGdDQUFnQixFQUFFLEVBQUU7QUFDcEIsOEJBQWMsRUFBRSxFQUFFO2FBQ3JCLENBQUM7QUFDRixnQkFBSSxDQUFDLElBQUksR0FBRztBQUNSLG9CQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUM7QUFDM0UsbUJBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUM7QUFDekUscUJBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCO0FBQ3hFLHNCQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWM7QUFDeEUscUJBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCO0FBQ2pELHNCQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWM7YUFDbkQsQ0FBQztBQUNGLG1CQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVsQixnQkFBSSxDQUFDLEtBQUssR0FBRyxXQTVCWixXQUFXLENBNEJpQjtBQUN6QixxQkFBSyxFQUFFLENBQUM7QUFDUix3QkFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO0FBQ3ZCLG1CQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDYixvQkFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQ2xCLENBQUMsQ0FBQztBQUNILGdCQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7U0FFZDs7cUJBakNDLE1BQU07O21CQW1DSixnQkFBRztBQUNILG9CQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xELG9CQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFDNUIsb0JBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFFdkY7OzttQkFFRSxlQUFHO0FBQ0Ysb0JBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNaLG9CQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xCLG9CQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsMEJBQVUsQ0FBQyxZQUFXO0FBQUUsd0JBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtpQkFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzdDOzs7bUJBRU0sbUJBQUc7OzthQUdUOzs7ZUFwREMsTUFBTTs7O3FCQXVERyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSw0QkFBZ0IsRUFBRSIsImZpbGUiOiJnc3JjL2NvbXBvbmVudHMvdGV0cmlzL3RldHJpcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5pbXBvcnQgdGVtcGxhdGVNYXJrdXAgZnJvbSAndGV4dCEuL3RldHJpcy5odG1sJztcbmltcG9ydCB7IFRldHJpc1JvdW5kIH0gZnJvbSAnLi9yb3VuZCc7XG5pbXBvcnQgeyBUZXRyaXNCbG9jayB9IGZyb20gJy4vYmxvY2snO1xuXG5jbGFzcyBUZXRyaXMge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB2YXIgJGdhbWVBcmVhID0gJCgnI3RldHJpcy1wYWdlIGNhbnZhcycpO1xuICAgICAgICAkZ2FtZUFyZWFbMF0ud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgJGdhbWVBcmVhWzBdLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuICAgICAgICB0aGlzLmNhbnZhc1dpZHRoID0gJGdhbWVBcmVhLndpZHRoKCk7XG4gICAgICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gJGdhbWVBcmVhLmhlaWdodCgpO1xuICAgICAgICB0aGlzLmN0eCA9ICRnYW1lQXJlYVswXS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIHRoaXMudW5pdFNpemUgPSA4O1xuICAgICAgICB0aGlzLm1ldGEgPSB7XG4gICAgICAgICAgICBob3Jpem9udGFsQmxvY2tzOiAxMCxcbiAgICAgICAgICAgIHZlcnRpY2FsQmxvY2tzOiAyMCxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hcmVhID0ge1xuICAgICAgICAgICAgbGVmdDogdGhpcy5jYW52YXNXaWR0aCAvIDIgLSB0aGlzLnVuaXRTaXplICogdGhpcy5tZXRhLmhvcml6b250YWxCbG9ja3MgLyAyLFxuICAgICAgICAgICAgdG9wOiB0aGlzLmNhbnZhc0hlaWdodCAvIDIgLSB0aGlzLnVuaXRTaXplICogdGhpcy5tZXRhLnZlcnRpY2FsQmxvY2tzIC8gMixcbiAgICAgICAgICAgIHJpZ2h0OiB0aGlzLmNhbnZhc1dpZHRoIC8gMiArIHRoaXMudW5pdFNpemUgKiB0aGlzLm1ldGEuaG9yaXpvbnRhbEJsb2NrcyxcbiAgICAgICAgICAgIGJvdHRvbTogdGhpcy5jYW52YXNIZWlnaHQgLyAyICsgdGhpcy51bml0U2l6ZSAqIHRoaXMubWV0YS52ZXJ0aWNhbEJsb2NrcyxcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnVuaXRTaXplICogdGhpcy5tZXRhLmhvcml6b250YWxCbG9ja3MsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMudW5pdFNpemUgKiB0aGlzLm1ldGEudmVydGljYWxCbG9ja3MsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuXG4gICAgICAgIHRoaXMucm91bmQgPSBuZXcgVGV0cmlzUm91bmQoe1xuICAgICAgICAgICAgbGV2ZWw6IDEsXG4gICAgICAgICAgICB1bml0U2l6ZTogdGhpcy51bml0U2l6ZSxcbiAgICAgICAgICAgIGN0eDogdGhpcy5jdHgsXG4gICAgICAgICAgICBhcmVhOiB0aGlzLmFyZWEsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJ1bigpO1xuICAgICAgICBcbiAgICB9XG4gICAgXG4gICAgZHJhdygpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5jdHguZmlsbFN0eWxlID0gJyM3NzcnO1xuICAgICAgICB0aGlzLmN0eC5maWxsUmVjdCh0aGlzLmFyZWEubGVmdCwgdGhpcy5hcmVhLnRvcCwgdGhpcy5hcmVhLndpZHRoLCB0aGlzLmFyZWEuaGVpZ2h0KTtcblxuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgIHRoaXMucm91bmQuZHJhdygpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHNlbGYucnVuKCkgfSwgMjUpO1xuICAgIH1cblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIC8vIFRoaXMgcnVucyB3aGVuIHRoZSBjb21wb25lbnQgaXMgdG9ybiBkb3duLiBQdXQgaGVyZSBhbnkgbG9naWMgbmVjZXNzYXJ5IHRvIGNsZWFuIHVwLFxuICAgICAgICAvLyBmb3IgZXhhbXBsZSBjYW5jZWxsaW5nIHNldFRpbWVvdXRzIG9yIGRpc3Bvc2luZyBLbm9ja291dCBzdWJzY3JpcHRpb25zL2NvbXB1dGVkcy5cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgdmlld01vZGVsOiBUZXRyaXMsIHRlbXBsYXRlOiB0ZW1wbGF0ZU1hcmt1cCB9O1xuIl19;