
define('text!components/finne/finne.html',[],function () { return '<div id="finne-page" data-ws-url="http://localhost:3002/finne/ws">\n    <canvas></canvas>\n    <div id="chat">\n        \n<form action="finne_chat">\n    \n            <div class="form-group">\n                \n                <input class="form-control" id="chat" name="chat" type="text">\n            </div>\n        \n</form>    </div>\n</div>\n\n\n<div id="finne-intro-page">\n    <div>\n    <form action="finne_intro">\n        \n            <div class="form-group">\n                <label class="control-label" for="name">Your name</label>\n                <input class="form-control" id="name" name="name" type="text">\n            </div>\n        \n        \n            <div class="form-group">\n                <label class="control-label" for="unused">Game code</label>\n                <input class="form-control" disabled="disabled" id="unused" name="unused" type="text" value="abcde">\n            </div>\n        \n        \n            <div class="form-group">\n                <label class="control-label" for="gamecode">Enter game code</label>\n                <input class="form-control" id="gamecode" name="gamecode" type="text" value="abcde">\n            </div>\n        \n        <button class="btn btn-default" type="submit">Play</button>\n</form>    </div>\n</div>\n';});

define('components/finne/communicator',['exports', 'module', 'knockout'], function (exports, module, _knockout) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var Communicator = (function () {
        function Communicator(params) {
            _classCallCheck(this, Communicator);

            this.endpoint = $('#finne-page').attr('data-ws-url');
            console.log(this.endpoint);
        }

        _createClass(Communicator, [{
            key: 'dispose',
            value: function dispose() {
                // This runs when the component is torn down. Put here any logic necessary to clean up,
                // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
            }
        }]);

        return Communicator;
    })();

    module.exports = { viewModel: Communicator, template: templateMarkup };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy9maW5uZS9jb21tdW5pY2F0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7UUFFTSxZQUFZO0FBQ0gsaUJBRFQsWUFBWSxDQUNGLE1BQU0sRUFBRTtrQ0FEbEIsWUFBWTs7QUFFVixnQkFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JELG1CQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM5Qjs7cUJBSkMsWUFBWTs7bUJBTVAsbUJBQUc7OzthQUdUOzs7ZUFUQyxZQUFZOzs7cUJBWUgsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUiLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL2Zpbm5lL2NvbW11bmljYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5cbmNsYXNzIENvbW11bmljYXRvciB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIHRoaXMuZW5kcG9pbnQgPSAkKCcjZmlubmUtcGFnZScpLmF0dHIoJ2RhdGEtd3MtdXJsJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZW5kcG9pbnQpO1xuICAgIH1cbiAgICBcbiAgICBkaXNwb3NlKCkge1xuICAgICAgICAvLyBUaGlzIHJ1bnMgd2hlbiB0aGUgY29tcG9uZW50IGlzIHRvcm4gZG93bi4gUHV0IGhlcmUgYW55IGxvZ2ljIG5lY2Vzc2FyeSB0byBjbGVhbiB1cCxcbiAgICAgICAgLy8gZm9yIGV4YW1wbGUgY2FuY2VsbGluZyBzZXRUaW1lb3V0cyBvciBkaXNwb3NpbmcgS25vY2tvdXQgc3Vic2NyaXB0aW9ucy9jb21wdXRlZHMuXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7IHZpZXdNb2RlbDogQ29tbXVuaWNhdG9yLCB0ZW1wbGF0ZTogdGVtcGxhdGVNYXJrdXAgfTtcbiJdfQ==;
define('components/finne/finne',['exports', 'module', 'knockout', 'text!./finne.html', './communicator'], function (exports, module, _knockout, _textFinneHtml, _communicator) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var _templateMarkup = _interopRequireDefault(_textFinneHtml);

    var Finne = (function () {
        function Finne(params) {
            _classCallCheck(this, Finne);

            this.message = _ko['default'].observable('Hello from the finne component!');
            this.communicator = new _communicator.Communicator();
        }

        _createClass(Finne, [{
            key: 'dispose',
            value: function dispose() {
                // This runs when the component is torn down. Put here any logic necessary to clean up,
                // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
            }
        }]);

        return Finne;
    })();

    module.exports = { viewModel: Finne, template: _templateMarkup['default'] };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy9maW5uZS9maW5uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O1FBSU0sS0FBSztBQUNJLGlCQURULEtBQUssQ0FDSyxNQUFNLEVBQUU7a0NBRGxCLEtBQUs7O0FBRUgsZ0JBQUksQ0FBQyxPQUFPLEdBQUcsZUFBRyxVQUFVLENBQUMsaUNBQWlDLENBQUMsQ0FBQztBQUNoRSxnQkFBSSxDQUFDLFlBQVksR0FBRyxrQkFMbkIsWUFBWSxFQUt5QixDQUFDO1NBQzFDOztxQkFKQyxLQUFLOzttQkFNQSxtQkFBRzs7O2FBR1Q7OztlQVRDLEtBQUs7OztxQkFZSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSw0QkFBZ0IsRUFBRSIsImZpbGUiOiJnc3JjL2NvbXBvbmVudHMvZmlubmUvZmlubmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuaW1wb3J0IHRlbXBsYXRlTWFya3VwIGZyb20gJ3RleHQhLi9maW5uZS5odG1sJztcbmltcG9ydCB7IENvbW11bmljYXRvciB9IGZyb20gJy4vY29tbXVuaWNhdG9yJztcblxuY2xhc3MgRmlubmUge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBrby5vYnNlcnZhYmxlKCdIZWxsbyBmcm9tIHRoZSBmaW5uZSBjb21wb25lbnQhJyk7XG4gICAgICAgIHRoaXMuY29tbXVuaWNhdG9yID0gbmV3IENvbW11bmljYXRvcigpO1xuICAgIH1cbiAgICBcbiAgICBkaXNwb3NlKCkge1xuICAgICAgICAvLyBUaGlzIHJ1bnMgd2hlbiB0aGUgY29tcG9uZW50IGlzIHRvcm4gZG93bi4gUHV0IGhlcmUgYW55IGxvZ2ljIG5lY2Vzc2FyeSB0byBjbGVhbiB1cCxcbiAgICAgICAgLy8gZm9yIGV4YW1wbGUgY2FuY2VsbGluZyBzZXRUaW1lb3V0cyBvciBkaXNwb3NpbmcgS25vY2tvdXQgc3Vic2NyaXB0aW9ucy9jb21wdXRlZHMuXG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7IHZpZXdNb2RlbDogRmlubmUsIHRlbXBsYXRlOiB0ZW1wbGF0ZU1hcmt1cCB9O1xuIl19;