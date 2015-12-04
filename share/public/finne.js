
define('text!components/finne/finne.html',[],function () { return '<div id="finne-page" data-ws-url="http://localhost:3002/finne/ws">\n    <canvas></canvas>\n    <button class="btn btn-danger" data-bind="click: clearAllGames" style="position: absolute; top: 0px; left: 0px;" type="button">Clear games</button>\n    <div id="chat">\n        <ul class="list-unstyled" id="chat-log" data-bind="foreach: chat.chatMessages">\n            <li data-bind=" css: className">\n                <span data-bind="text: message"></span>\n            </li>\n        </ul>\n<form action="finne_chat" data-bind="submit: submitChatMessage">\n    \n            <div class="form-group">\n                \n                <input class="form-control" data-bind="value: chatMessage" id="chat" name="chat" type="text">\n            </div>\n        \n</form>    </div>\n</div>\n\n\n<div id="finne-intro" class="modal" data-bind="modalVisible: function() { return !gameIsInProgress() }">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <form action="finne_intro" data-bind="submit: newGame">\n                <div class="modal-header">\n                    <h4>New game</h4>\n                </div>\n                <div class="modal-body">\n                    <div data-bind="visible: server.connectionOpen">Yes!</div>\n                    <div>\n                        \n            <div class="form-group">\n                <label class="control-label" for="name">Your name</label>\n                <input class="form-control" id="name" name="name" type="text">\n            </div>\n        \n                        \n            <div class="form-group">\n                <label class="control-label" for="unused">Game code</label>\n                <input class="form-control" disabled="disabled" id="unused" name="unused" type="text" value="abcde">\n            </div>\n        \n                        \n            <div class="form-group">\n                <label class="control-label" for="gamecode">Enter game code</label>\n                <input class="form-control" id="gamecode" name="gamecode" type="text" value="abcde">\n            </div>\n        \n                    </div>\n                </div>\n                <div class="modal-footer">\n                    <button class="btn btn-primary" type="submit">Start playing</button>\n                    <button class="btn btn-default" data-bind="click: clearAllGames" type="button">Clear games</button>\n                </div>\n</form>        </div>\n    </div>\n</div>\n';});

define('components/finne/communicator',['exports', 'knockout'], function (exports, _knockout) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var Communicator = (function () {
        function Communicator(params) {
            var _this = this;

            _classCallCheck(this, Communicator);

            var wsUrl = $('#finne-page').attr('data-ws-url');
            this.chat = params.chat;
            this.endpoint = new WebSocket('ws://localhost:3002/finne/ws');
            this.connectionOpen = _ko['default'].observable(false);
            this.handleIncoming = params.handleIncoming, this.endpoint.onopen = function () {
                _this.chat.put({ from: 'server', text: 'Connection opened' });
                _this.connectionOpen(true);
            };
            this.endpoint.onclose = function () {
                _this.chat.put({ from: 'server', text: 'Connection closed', status: 'warning' });
                _this.connectionOpen(false);
            };
            this.endpoint.onmessage = function (e) {
                var parsed = JSON.parse(e.data);
                console.log('ws/incoming', parsed);
                _this.handleIncoming(parsed);
            };
        }

        _createClass(Communicator, [{
            key: 'send',
            value: function send(message) {
                if (this.connectionOpen()) {
                    if (!message.params.hasOwnProperty('game_code')) {
                        message.params.game_code = this.gameCode;
                    }
                    console.log('ws/sending message', message);
                    this.endpoint.send(JSON.stringify(message));
                    return true;
                } else {
                    console.log('ws/failed to send', message);
                    return false;
                }
            }
        }, {
            key: 'sendCommand',
            value: function sendCommand(command) {
                var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                return this.send({ command: command, params: params });
            }
        }, {
            key: 'joinGame',
            value: function joinGame(params) {
                var success = this.send({ command: 'join_game', params: params });
                if (success) {
                    this.gameCode = params.game_code;
                }
                return success;
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                // This runs when the component is torn down. Put here any logic necessary to clean up,
                // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
            }
        }]);

        return Communicator;
    })();

    exports.Communicator = Communicator;
    exports['default'] = { viewModel: Communicator };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy9maW5uZS9jb21tdW5pY2F0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1FBRWEsWUFBWTtBQUNWLGlCQURGLFlBQVksQ0FDVCxNQUFNLEVBQUU7OztrQ0FEWCxZQUFZOztBQUVqQixnQkFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqRCxnQkFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsUUFBUSxHQUFHLElBQUksU0FBUyxDQUFDLDhCQUE4QixDQUFDLENBQUM7QUFDOUQsZ0JBQUksQ0FBQyxjQUFjLEdBQUcsZUFBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0MsZ0JBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsWUFBTTtBQUN6QixzQkFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO0FBQzdELHNCQUFLLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM3QixDQUFBO0FBQ0QsZ0JBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLFlBQU07QUFDMUIsc0JBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQ2hGLHNCQUFLLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QixDQUFDO0FBQ0YsZ0JBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLFVBQUMsQ0FBQyxFQUFLO0FBQzdCLG9CQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyx1QkFBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbkMsc0JBQUssY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQy9CLENBQUE7U0FDSjs7cUJBcEJRLFlBQVk7O21CQXNCakIsY0FBQyxPQUFPLEVBQUU7QUFDVixvQkFBRyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUU7QUFDdEIsd0JBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUM1QywrQkFBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztxQkFDNUM7QUFDRCwyQkFBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMzQyx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzVDLDJCQUFPLElBQUksQ0FBQztpQkFDZixNQUNJO0FBQ0QsMkJBQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDMUMsMkJBQU8sS0FBSyxDQUFDO2lCQUNoQjthQUNKOzs7bUJBQ1UscUJBQUMsT0FBTyxFQUFlO29CQUFiLE1BQU0seURBQUcsRUFBRTs7QUFDNUIsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDMUQ7OzttQkFDTyxrQkFBQyxNQUFNLEVBQUU7QUFDYixvQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFHLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDbkUsb0JBQUcsT0FBTyxFQUFFO0FBQ1Isd0JBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztpQkFDcEM7QUFDRCx1QkFBTyxPQUFPLENBQUM7YUFDbEI7OzttQkFHTSxtQkFBRzs7O2FBR1Q7OztlQW5EUSxZQUFZOzs7O3lCQXNEVixFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUiLCJmaWxlIjoiZ3NyYy9jb21wb25lbnRzL2Zpbm5lL2NvbW11bmljYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrbyBmcm9tICdrbm9ja291dCc7XG5cbmV4cG9ydCBjbGFzcyBDb21tdW5pY2F0b3Ige1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcykge1xuICAgICAgICB2YXIgd3NVcmwgPSAkKCcjZmlubmUtcGFnZScpLmF0dHIoJ2RhdGEtd3MtdXJsJyk7XG4gICAgICAgIHRoaXMuY2hhdCA9IHBhcmFtcy5jaGF0O1xuICAgICAgICB0aGlzLmVuZHBvaW50ID0gbmV3IFdlYlNvY2tldCgnd3M6Ly9sb2NhbGhvc3Q6MzAwMi9maW5uZS93cycpO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb25PcGVuID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICAgIHRoaXMuaGFuZGxlSW5jb21pbmcgPSBwYXJhbXMuaGFuZGxlSW5jb21pbmcsXG4gICAgICAgIHRoaXMuZW5kcG9pbnQub25vcGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZXJ2ZXInLCB0ZXh0OiAnQ29ubmVjdGlvbiBvcGVuZWQnIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uT3Blbih0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVuZHBvaW50Lm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNoYXQucHV0KHsgZnJvbTogJ3NlcnZlcicsIHRleHQ6ICdDb25uZWN0aW9uIGNsb3NlZCcsIHN0YXR1czogJ3dhcm5pbmcnIH0pO1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uT3BlbihmYWxzZSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZW5kcG9pbnQub25tZXNzYWdlID0gKGUpID0+IHtcbiAgICAgICAgICAgIHZhciBwYXJzZWQgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnd3MvaW5jb21pbmcnLCBwYXJzZWQpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbmNvbWluZyhwYXJzZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZChtZXNzYWdlKSB7XG4gICAgICAgIGlmKHRoaXMuY29ubmVjdGlvbk9wZW4oKSkge1xuICAgICAgICAgICAgaWYoIW1lc3NhZ2UucGFyYW1zLmhhc093blByb3BlcnR5KCdnYW1lX2NvZGUnKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UucGFyYW1zLmdhbWVfY29kZSA9IHRoaXMuZ2FtZUNvZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnd3Mvc2VuZGluZyBtZXNzYWdlJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB0aGlzLmVuZHBvaW50LnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnd3MvZmFpbGVkIHRvIHNlbmQnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZW5kQ29tbWFuZChjb21tYW5kLCBwYXJhbXMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZW5kKHsgY29tbWFuZDogY29tbWFuZCwgcGFyYW1zOiBwYXJhbXMgfSk7XG4gICAgfVxuICAgIGpvaW5HYW1lKHBhcmFtcykge1xuICAgICAgICB2YXIgc3VjY2VzcyA9IHRoaXMuc2VuZCh7IGNvbW1hbmQ6ICdqb2luX2dhbWUnLCBwYXJhbXMgOiBwYXJhbXMgfSk7XG4gICAgICAgIGlmKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZUNvZGUgPSBwYXJhbXMuZ2FtZV9jb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgIH1cblxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgLy8gVGhpcyBydW5zIHdoZW4gdGhlIGNvbXBvbmVudCBpcyB0b3JuIGRvd24uIFB1dCBoZXJlIGFueSBsb2dpYyBuZWNlc3NhcnkgdG8gY2xlYW4gdXAsXG4gICAgICAgIC8vIGZvciBleGFtcGxlIGNhbmNlbGxpbmcgc2V0VGltZW91dHMgb3IgZGlzcG9zaW5nIEtub2Nrb3V0IHN1YnNjcmlwdGlvbnMvY29tcHV0ZWRzLlxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgeyB2aWV3TW9kZWw6IENvbW11bmljYXRvciB9O1xuIl19;
define('components/chat/chat',['exports', 'knockout'], function (exports, _knockout) {
    

    Object.defineProperty(exports, '__esModule', {
        value: true
    });

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    // https://coderwall.com/p/weiq1q/auto-scrolling-extender-for-knockout-js
    _ko['default'].extenders.scrollFollow = function (target, selector) {
        target.subscribe(function (newval) {
            var el = document.querySelector(selector);

            if (el.scrollTop == el.scrollHeight - el.clientHeight) {
                setTimeout(function () {
                    el.scrollTop = el.scrollHeight - el.clientHeight;
                }, 0);
            }
        });

        return target;
    };

    var Chat = (function () {
        function Chat(params) {
            _classCallCheck(this, Chat);

            if (params.scrollFollow) {
                this.chatMessages = _ko['default'].observableArray([]).extend({ scrollFollow: params.scrollFollow });
            } else {
                this.chatMessages = _ko['default'].observableArray([]);
            }
        }

        _createClass(Chat, [{
            key: 'put',
            value: function put(params) {
                var from = params.from || 'self';
                var status = from === 'server' ? params.status ? params.status : 'info' : 'normal';
                var message = params.text;
                this.chatMessages.push({
                    className: 'chat-status-' + from + '-' + status,
                    message: '· ' + message
                });
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                // This runs when the component is torn down. Put here any logic necessary to clean up,
                // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
            }
        }]);

        return Chat;
    })();

    exports.Chat = Chat;
    exports['default'] = { viewModel: Chat };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy9jaGF0L2NoYXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUdBLG1CQUFHLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3BELGNBQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxNQUFNLEVBQUU7QUFDL0IsZ0JBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTFDLGdCQUFJLEVBQUUsQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsWUFBWSxFQUFFO0FBQ25ELDBCQUFVLENBQUMsWUFBWTtBQUFFLHNCQUFFLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQztpQkFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3BGO1NBQ0osQ0FBQyxDQUFDOztBQUVILGVBQU8sTUFBTSxDQUFDO0tBQ2pCLENBQUM7O1FBRVcsSUFBSTtBQUNGLGlCQURGLElBQUksQ0FDRCxNQUFNLEVBQUU7a0NBRFgsSUFBSTs7QUFHVCxnQkFBRyxNQUFNLENBQUMsWUFBWSxFQUFFO0FBQ3BCLG9CQUFJLENBQUMsWUFBWSxHQUFHLGVBQUcsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzthQUM1RixNQUNJO0FBQ0Qsb0JBQUksQ0FBQyxZQUFZLEdBQUcsZUFBRyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDOUM7U0FDSjs7cUJBVFEsSUFBSTs7bUJBV1YsYUFBQyxNQUFNLEVBQUU7QUFDUixvQkFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUM7QUFDakMsb0JBQUksTUFBTSxHQUFHLElBQUksS0FBSyxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDbkYsb0JBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDMUIsb0JBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO0FBQ25CLDZCQUFTLEVBQUUsY0FBYyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsTUFBTTtBQUMvQywyQkFBTyxFQUFFLElBQUksR0FBRyxPQUFPO2lCQUMxQixDQUFDLENBQUM7YUFDTjs7O21CQUVNLG1CQUFHOzs7YUFHVDs7O2VBeEJRLElBQUk7Ozs7eUJBMkJGLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSIsImZpbGUiOiJnc3JjL2NvbXBvbmVudHMvY2hhdC9jaGF0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGtvIGZyb20gJ2tub2Nrb3V0JztcblxuLy8gaHR0cHM6Ly9jb2RlcndhbGwuY29tL3Avd2VpcTFxL2F1dG8tc2Nyb2xsaW5nLWV4dGVuZGVyLWZvci1rbm9ja291dC1qc1xua28uZXh0ZW5kZXJzLnNjcm9sbEZvbGxvdyA9IGZ1bmN0aW9uICh0YXJnZXQsIHNlbGVjdG9yKSB7XG4gICAgdGFyZ2V0LnN1YnNjcmliZShmdW5jdGlvbiAobmV3dmFsKSB7XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuXG4gICAgICAgIGlmIChlbC5zY3JvbGxUb3AgPT0gZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgZWwuc2Nyb2xsVG9wID0gZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0OyB9LCAwKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbn07XG5cbmV4cG9ydCBjbGFzcyBDaGF0IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcblxuICAgICAgICBpZihwYXJhbXMuc2Nyb2xsRm9sbG93KSB7XG4gICAgICAgICAgICB0aGlzLmNoYXRNZXNzYWdlcyA9IGtvLm9ic2VydmFibGVBcnJheShbXSkuZXh0ZW5kKHsgc2Nyb2xsRm9sbG93OiBwYXJhbXMuc2Nyb2xsRm9sbG93IH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jaGF0TWVzc2FnZXMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHV0KHBhcmFtcykge1xuICAgICAgICB2YXIgZnJvbSA9IHBhcmFtcy5mcm9tIHx8ICdzZWxmJztcbiAgICAgICAgdmFyIHN0YXR1cyA9IGZyb20gPT09ICdzZXJ2ZXInID8gcGFyYW1zLnN0YXR1cyA/IHBhcmFtcy5zdGF0dXMgOiAnaW5mbycgOiAnbm9ybWFsJztcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBwYXJhbXMudGV4dDtcbiAgICAgICAgdGhpcy5jaGF0TWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICdjaGF0LXN0YXR1cy0nICsgZnJvbSArICctJyArIHN0YXR1cyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICfCtyAnICsgbWVzc2FnZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIC8vIFRoaXMgcnVucyB3aGVuIHRoZSBjb21wb25lbnQgaXMgdG9ybiBkb3duLiBQdXQgaGVyZSBhbnkgbG9naWMgbmVjZXNzYXJ5IHRvIGNsZWFuIHVwLFxuICAgICAgICAvLyBmb3IgZXhhbXBsZSBjYW5jZWxsaW5nIHNldFRpbWVvdXRzIG9yIGRpc3Bvc2luZyBLbm9ja291dCBzdWJzY3JpcHRpb25zL2NvbXB1dGVkcy5cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgdmlld01vZGVsOiBDaGF0IH07XG4iXX0=;
define('components/finne/finne',['exports', 'module', 'knockout', 'text!./finne.html', './communicator', '../chat/chat'], function (exports, module, _knockout, _textFinneHtml, _communicator, _chatChat) {
    

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var _ko = _interopRequireDefault(_knockout);

    var _templateMarkup = _interopRequireDefault(_textFinneHtml);

    _ko['default'].bindingHandlers.modalVisible = {
        init: function init(element) {
            $(element).modal({
                backdrop: 'static'
            });
        },
        update: function update(element, valueAccessor) {
            var value = valueAccessor();
            if (value()) {
                $(element).modal('show');
            } else {
                $(element).modal('hide');
            }
        }
    };

    var Finne = (function () {
        function Finne(params) {
            var _this = this;

            _classCallCheck(this, Finne);

            this.message = _ko['default'].observable('Hello from the finne component!');
            this.chat = new _chatChat.Chat({ scrollFollow: '#chat-log' });
            this.chatMessage = _ko['default'].observable();
            this.gameCode = _ko['default'].observable();
            this.gameIsInProgress = _ko['default'].observable(false);
            this.server = new _communicator.Communicator({
                chat: this.chat,
                handleIncoming: function handleIncoming(message) {
                    return _this.incoming(message);
                }
            });

            this.run();
        }

        _createClass(Finne, [{
            key: 'run',
            value: function run() {
                var self = this;
                setTimeout(function () {
                    self.run();
                }, 500);
            }

            // TODO: Remove this in production...
        }, {
            key: 'clearAllGames',
            value: function clearAllGames() {
                this.server.sendCommand('reset_games');
            }
        }, {
            key: 'incoming',
            value: function incoming(message) {
                if (message.command === 'init_game') {
                    this.gameIsInProgress(true);
                } else if (message.command === 'chat') {
                    this.chat.put({ from: message.from || 'other', text: message.message, status: message.status });
                }
            }
        }, {
            key: 'newGame',
            value: function newGame(form) {
                var playerName = $('#name').val();
                this.gameCode($('#gamecode').val());

                var success = this.server.joinGame({ player_name: playerName, game_code: this.gameCode() });
                if (!success) {
                    this.chat.put({ from: 'server', status: 'warnings', text: 'Failed to connect to server, try again.' });
                } else {
                    this.chat.put({ from: 'server', text: 'Connected to server' });
                }
            }
        }, {
            key: 'submitChatMessage',
            value: function submitChatMessage() {
                if (this.chatMessage().length) {
                    var success = this.server.sendCommand('chat', { message: this.chatMessage() });

                    if (success) {
                        this.chat.put({ from: 'self', text: this.chatMessage() });
                        this.chatMessage('');
                    }
                }
            }
        }, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zb3VyY2UvY29tcG9uZW50cy9maW5uZS9maW5uZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBS0EsbUJBQUcsZUFBZSxDQUFDLFlBQVksR0FBRztBQUM5QixZQUFJLEVBQUUsY0FBVSxPQUFPLEVBQUU7QUFDckIsYUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNiLHdCQUFRLEVBQUUsUUFBUTthQUNyQixDQUFDLENBQUM7U0FDTjtBQUNELGNBQU0sRUFBRSxnQkFBVSxPQUFPLEVBQUUsYUFBYSxFQUFFO0FBQ3RDLGdCQUFJLEtBQUssR0FBRyxhQUFhLEVBQUUsQ0FBQztBQUM1QixnQkFBRyxLQUFLLEVBQUUsRUFBRTtBQUNSLGlCQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzVCLE1BQ0k7QUFDRCxpQkFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM1QjtTQUNKO0tBQ0osQ0FBQTs7UUFFSyxLQUFLO0FBQ0ksaUJBRFQsS0FBSyxDQUNLLE1BQU0sRUFBRTs7O2tDQURsQixLQUFLOztBQUVILGdCQUFJLENBQUMsT0FBTyxHQUFHLGVBQUcsVUFBVSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDaEUsZ0JBQUksQ0FBQyxJQUFJLEdBQUcsY0F0QlgsSUFBSSxDQXNCZ0IsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUNwRCxnQkFBSSxDQUFDLFdBQVcsR0FBRyxlQUFHLFVBQVUsRUFBRSxDQUFDO0FBQ25DLGdCQUFJLENBQUMsUUFBUSxHQUFHLGVBQUcsVUFBVSxFQUFFLENBQUM7QUFDaEMsZ0JBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxnQkFBSSxDQUFDLE1BQU0sR0FBRyxrQkEzQmIsWUFBWSxDQTJCa0I7QUFDM0Isb0JBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNmLDhCQUFjLEVBQUUsd0JBQUMsT0FBTzsyQkFBSyxNQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUM7aUJBQUE7YUFDdEQsQ0FBQyxDQUFDOztBQUVILGdCQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDZDs7cUJBYkMsS0FBSzs7bUJBZUosZUFBRztBQUNGLG9CQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsMEJBQVUsQ0FBQyxZQUFXO0FBQUUsd0JBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtpQkFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzlDOzs7OzttQkFFWSx5QkFBRztBQUNaLG9CQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUMxQzs7O21CQUVPLGtCQUFDLE9BQU8sRUFBRTtBQUNkLG9CQUFHLE9BQU8sQ0FBQyxPQUFPLEtBQUssV0FBVyxFQUFFO0FBQ2hDLHdCQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQy9CLE1BQ0ksSUFBRyxPQUFPLENBQUMsT0FBTyxLQUFLLE1BQU0sRUFBRTtBQUNoQyx3QkFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2lCQUNuRzthQUNKOzs7bUJBRU0saUJBQUMsSUFBSSxFQUFFO0FBQ1Ysb0JBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNsQyxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzs7QUFFcEMsb0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM1RixvQkFBRyxDQUFDLE9BQU8sRUFBRTtBQUNULHdCQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUseUNBQXlDLEVBQUMsQ0FBQyxDQUFDO2lCQUN6RyxNQUNJO0FBQ0Qsd0JBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO2lCQUNsRTthQUdKOzs7bUJBQ2dCLDZCQUFHO0FBQ2hCLG9CQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEVBQUU7QUFDMUIsd0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUUvRSx3QkFBRyxPQUFPLEVBQUU7QUFDUiw0QkFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFELDRCQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3FCQUN4QjtpQkFDSjthQUNKOzs7bUJBR00sbUJBQUc7OzthQUdUOzs7ZUE5REMsS0FBSzs7O3FCQWlFSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSw0QkFBZ0IsRUFBRSIsImZpbGUiOiJnc3JjL2NvbXBvbmVudHMvZmlubmUvZmlubmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQga28gZnJvbSAna25vY2tvdXQnO1xuaW1wb3J0IHRlbXBsYXRlTWFya3VwIGZyb20gJ3RleHQhLi9maW5uZS5odG1sJztcbmltcG9ydCB7IENvbW11bmljYXRvciB9IGZyb20gJy4vY29tbXVuaWNhdG9yJztcbmltcG9ydCB7IENoYXQgfSBmcm9tICcuLi9jaGF0L2NoYXQnO1xuXG5rby5iaW5kaW5nSGFuZGxlcnMubW9kYWxWaXNpYmxlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICQoZWxlbWVudCkubW9kYWwoe1xuICAgICAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGVsZW1lbnQsIHZhbHVlQWNjZXNzb3IpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVBY2Nlc3NvcigpO1xuICAgICAgICBpZih2YWx1ZSgpKSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIEZpbm5lIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMpIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0ga28ub2JzZXJ2YWJsZSgnSGVsbG8gZnJvbSB0aGUgZmlubmUgY29tcG9uZW50IScpO1xuICAgICAgICB0aGlzLmNoYXQgPSBuZXcgQ2hhdCh7IHNjcm9sbEZvbGxvdzogJyNjaGF0LWxvZycgfSk7XG4gICAgICAgIHRoaXMuY2hhdE1lc3NhZ2UgPSBrby5vYnNlcnZhYmxlKCk7XG4gICAgICAgIHRoaXMuZ2FtZUNvZGUgPSBrby5vYnNlcnZhYmxlKCk7XG4gICAgICAgIHRoaXMuZ2FtZUlzSW5Qcm9ncmVzcyA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuICAgICAgICB0aGlzLnNlcnZlciA9IG5ldyBDb21tdW5pY2F0b3Ioe1xuICAgICAgICAgICAgY2hhdDogdGhpcy5jaGF0LFxuICAgICAgICAgICAgaGFuZGxlSW5jb21pbmc6IChtZXNzYWdlKSA9PiB0aGlzLmluY29taW5nKG1lc3NhZ2UpLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJ1bigpO1xuICAgIH1cblxuICAgIHJ1bigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzZWxmLnJ1bigpIH0sIDUwMCk7XG4gICAgfVxuICAgIC8vIFRPRE86IFJlbW92ZSB0aGlzIGluIHByb2R1Y3Rpb24uLi5cbiAgICBjbGVhckFsbEdhbWVzKCkge1xuICAgICAgICB0aGlzLnNlcnZlci5zZW5kQ29tbWFuZCgncmVzZXRfZ2FtZXMnKTtcbiAgICB9XG5cbiAgICBpbmNvbWluZyhtZXNzYWdlKSB7XG4gICAgICAgIGlmKG1lc3NhZ2UuY29tbWFuZCA9PT0gJ2luaXRfZ2FtZScpIHtcbiAgICAgICAgICAgIHRoaXMuZ2FtZUlzSW5Qcm9ncmVzcyh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKG1lc3NhZ2UuY29tbWFuZCA9PT0gJ2NoYXQnKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXQucHV0KHsgZnJvbTogbWVzc2FnZS5mcm9tIHx8ICdvdGhlcicsIHRleHQ6IG1lc3NhZ2UubWVzc2FnZSwgc3RhdHVzOiBtZXNzYWdlLnN0YXR1cyB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5ld0dhbWUoZm9ybSkge1xuICAgICAgICB2YXIgcGxheWVyTmFtZSA9ICQoJyNuYW1lJykudmFsKCk7XG4gICAgICAgIHRoaXMuZ2FtZUNvZGUoJCgnI2dhbWVjb2RlJykudmFsKCkpO1xuXG4gICAgICAgIHZhciBzdWNjZXNzID0gdGhpcy5zZXJ2ZXIuam9pbkdhbWUoeyBwbGF5ZXJfbmFtZTogcGxheWVyTmFtZSwgZ2FtZV9jb2RlOiB0aGlzLmdhbWVDb2RlKCkgfSk7XG4gICAgICAgIGlmKCFzdWNjZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXQucHV0KHsgZnJvbTogJ3NlcnZlcicsIHN0YXR1czogJ3dhcm5pbmdzJywgdGV4dDogJ0ZhaWxlZCB0byBjb25uZWN0IHRvIHNlcnZlciwgdHJ5IGFnYWluLid9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2hhdC5wdXQoeyBmcm9tOiAnc2VydmVyJywgdGV4dDogJ0Nvbm5lY3RlZCB0byBzZXJ2ZXInIH0pO1xuICAgICAgICB9XG5cblxuICAgIH1cbiAgICBzdWJtaXRDaGF0TWVzc2FnZSgpIHtcbiAgICAgICAgaWYodGhpcy5jaGF0TWVzc2FnZSgpLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSB0aGlzLnNlcnZlci5zZW5kQ29tbWFuZCgnY2hhdCcsIHsgbWVzc2FnZTogdGhpcy5jaGF0TWVzc2FnZSgpIH0pO1xuXG4gICAgICAgICAgICBpZihzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGF0LnB1dCh7IGZyb206ICdzZWxmJywgdGV4dDogdGhpcy5jaGF0TWVzc2FnZSgpIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hhdE1lc3NhZ2UoJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgLy8gVGhpcyBydW5zIHdoZW4gdGhlIGNvbXBvbmVudCBpcyB0b3JuIGRvd24uIFB1dCBoZXJlIGFueSBsb2dpYyBuZWNlc3NhcnkgdG8gY2xlYW4gdXAsXG4gICAgICAgIC8vIGZvciBleGFtcGxlIGNhbmNlbGxpbmcgc2V0VGltZW91dHMgb3IgZGlzcG9zaW5nIEtub2Nrb3V0IHN1YnNjcmlwdGlvbnMvY29tcHV0ZWRzLlxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgeyB2aWV3TW9kZWw6IEZpbm5lLCB0ZW1wbGF0ZTogdGVtcGxhdGVNYXJrdXAgfTtcbiJdfQ==;